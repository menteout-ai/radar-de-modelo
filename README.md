# Radar de Modelo 0.2.0

Antes de cada respuesta, el modelo entiende el trabajo que le pides y lo compara con el modelo y el esfuerzo en uso.
Si no encajan, te hace una pregunta Sí/No con el motivo en una línea, por ejemplo:
"Sonnet 5.5 bajo → Opus 5.5 alto: motion graphic elaborado, ¿cambias?"
Si encajan, no dice nada. Si respondes que no, no insiste en esa conversación.
No cambia el modelo por ti: lo cambias tú a mano. Esfuerzos: bajo, medio, alto, muy alto, máximo.
El código añade pistas (consulta trivial / trabajo elaborado) como red de seguridad. No toca archivos, no usa red y no ejecuta comandos.

## Instalación

En el prompt de una sesión de terminal:

```
/plugin install radar-de-modelo --marketplace menteout-ai/radar-de-modelo
```

Desde una shell:

```
claude plugin install radar-de-modelo --marketplace menteout-ai/radar-de-modelo
```

Responde `y` a "Add marketplace?" y elige el ámbito (el de usuario aparece primero) con Enter. Al terminar verás `Installed radar-de-modelo. Plugin is now active.`

En la app de escritorio, donde `/plugin` no funciona: pulsa + junto a la caja del prompt, luego Plugins, Add marketplace con `menteout-ai/radar-de-modelo`, y después Add plugin.
