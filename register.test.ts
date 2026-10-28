import { expect, test } from 'claude-code/testing'

test('añade la regla del radar con el modelo en uso', async ($, on) => {
  let visto: readonly string[] = []
  on('session.model', () => ({ value: 'claude-sonnet-5-5' }))
  on('prompt.submit', (_, e) => {
    visto = e.context ?? []
    return { text: e.text }
  })

  await $.prompt.submit({ text: 'Hazme una estrategia de negocio completa' })

  expect(visto.some(c => c.includes('Modelo en uso: Sonnet 5.5'))).toBe(true)
  expect(visto.some(c => c.includes('trabajo elaborado'))).toBe(true)
})

test('si falla la lectura del modelo, el mensaje sigue sin tocar', async ($, on) => {
  let visto: readonly string[] | undefined
  on('session.model', () => {
    throw new Error('sin modelo')
  })
  on('prompt.submit', (_, e) => {
    visto = e.context
    return { text: e.text }
  })

  await $.prompt.submit({ text: '¿Cuál es la capital de Francia?' })

  expect((visto ?? []).some(c => c.includes('[Radar de Modelo]'))).toBe(false)
})
