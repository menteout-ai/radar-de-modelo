import type { Register } from 'claude-code'

const NIVELES: Record<string, string> = {
  low: 'bajo',
  medium: 'medio',
  high: 'alto',
  xhigh: 'muy alto',
  max: 'máximo',
}

// "claude-sonnet-5-5" -> "Sonnet 5.5"; si no se reconoce, devuelve el id tal cual.
function nombreModelo(id: string): string {
  const m = id.toLowerCase().match(/(haiku|sonnet|opus|fable|mythos)[-\s]?(\d+)?[-.\s]?(\d+)?/)
  if (!m) return id
  const fam = m[1].charAt(0).toUpperCase() + m[1].slice(1)
  return m[2] ? `${fam} ${m[2]}${m[3] ? '.' + m[3] : ''}` : fam
}

function nombreNivel(e?: string | number): string {
  if (e === undefined) return 'predeterminado'
  return typeof e === 'number' ? String(e) : (NIVELES[e] ?? e)
}

// Pistas de código (red de seguridad). El juicio final lo hace el modelo leyendo el mensaje.
const TRIVIAL = /^(¿\s*)?(cu[aá]l|cu[aá]nt[oa]s?|qu[eé]|qui[eé]n|d[oó]nde|cu[aá]ndo|c[oó]mo se dice|capital|define|significa)\b/i
const PESADO = /(motion|animaci[oó]n|arquitectura|depur|refactor|estrategia|plan de negocio|an[aá]lisis (completo|profundo)|investiga|informe|auditor|programa|c[oó]digo|app\b|web\b|script)/i

function pista(text: string, adjuntos: boolean): string | null {
  const t = text.trim()
  const palabras = t.split(/\s+/).length
  if (!adjuntos && t.length <= 120 && palabras <= 16 && !t.includes('\n') && TRIVIAL.test(t) && !PESADO.test(t)) {
    return 'Pista del mod: este mensaje parece una consulta trivial de respuesta directa.'
  }
  if (adjuntos || t.length > 600 || PESADO.test(t)) {
    return 'Pista del mod: este mensaje parece un trabajo elaborado; valora si hace falta más modelo o más esfuerzo.'
  }
  return null
}

const REGLA = (modelo: string, nivel: string) => `[Radar de Modelo] Modelo en uso: ${modelo}. Esfuerzo actual: ${nivel}.
OBLIGATORIO en cada mensaje, incluidas las preguntas de una línea: ANTES de responder, lee y entiende lo que pide el usuario y clasifica el trabajo real que vas a hacer (no la longitud del texto):
- Haiku: preguntas factuales o mecánicas, reformatear, traducir cosas cortas, respuestas directas. Esfuerzo bajo.
- Sonnet: trabajo diario, redacción, análisis normales, código sencillo o medio. Esfuerzo medio o alto.
- Opus: razonamiento profundo, código complejo, depuración difícil, estrategia o decisiones con muchas variables, trabajos creativos elaborados (p. ej. un motion graphic elaborado). Esfuerzo alto o muy alto.
- Fable: solo casos extremos, muy raros y muy exigentes. Esfuerzo muy alto o máximo.
Esfuerzos: bajo, medio, alto, muy alto, máximo.
Compara con el modelo y esfuerzo en uso. Si ya encajan, NO digas nada sobre esto. Si no encajan (sobra modelo o falta), antes de responder usa AskUserQuestion con UNA pregunta de una línea con el formato "${modelo} ${nivel} → <Modelo> <versión> <esfuerzo>: <motivo en pocas palabras>, ¿cambias?" y exactamente dos opciones: "Sí, cambio" y "No, sigo como estoy". Si no puedes usar esa herramienta, escribe esa misma línea al inicio de tu respuesta. Si vas a lanzar una tarea pesada con herramientas y el modelo en uso sobra (p. ej. Opus para algo que Sonnet resuelve bien), avisa igual. Si el usuario dice que no, o ya eligió seguir, no vuelvas a insistir en esa conversación. No cambies de modelo tú: lo cambia el usuario a mano. Responde la tarea igualmente. Todo en español, sin explicaciones largas.`

export const register: Register = on => {
  let esfuerzo: string | number | undefined

  // Guarda el esfuerzo real con el que se envía cada petición.
  on('turn.step', async function* ($, e, next) {
    esfuerzo = e.effort
    return yield* next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.command || e.isMeta) return next(e)

    const id = await $.session.model()
    const modelo = nombreModelo(id)
    const nivel = nombreNivel(esfuerzo)
    const context = [...(e.context ?? []), REGLA(modelo, nivel)]

    const p = pista(e.text, (e.attachments?.length ?? 0) > 0)
    if (p) context.push(`[Radar de Modelo] ${p}`)

    return next({ ...e, context })
  })
}
