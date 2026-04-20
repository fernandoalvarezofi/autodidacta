---
name: Visual polish pendiente
description: Pasada visual general pendiente al terminar las funcionalidades — contraste de tipografía y opacidades de clusters/stats
type: preference
---
El usuario pidió postergar el pulido visual general hasta terminar bloques de funcionalidades. Cuando llegue el momento, revisar:

- **Tipografía demasiado transparente**: muchos textos usan `text-ink/40`, `text-ink/50`, `text-ink/60` que se ven lavados sobre el fondo crema. Subir contraste mínimo a `text-ink/70` para body secundario y `text-ink` para cualquier label importante.
- **Clusters/stats con opacidades bajas**: las stat cards y cards en general usan mucho `bg-orange/5`, `bg-cream/20`, `border-border` que se ven débiles. Reforzar bordes (border-ink/15 o border-2), backgrounds más sólidos.
- **Hero del cuaderno**: el cover ilustrado quedó bien pero el título y descripción debajo deberían tener más peso.
- **Aplicar la pasada a TODA la app**: dashboard, notebook, document, editor, chat. No solo a una pantalla.

NO hacer este trabajo hasta que el usuario lo pida explícitamente. Mientras tanto, seguir construyendo funcionalidades nuevas.