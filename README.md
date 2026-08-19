# My Day ✦

PWA personal de organización: ropa, calendario, rutinas, horario, estudios y apuntes.

## Publicarla con GitHub Pages
1. Crea un repositorio llamado `my-day` en GitHub.
2. Sube todos los archivos y la carpeta `icons`.
3. Ve a Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
4. Abre la URL que te dé GitHub Pages en Safari del iPhone.
5. Compartir → Añadir a pantalla de inicio.

## Notificaciones
La app solicita permiso de notificaciones y puede mostrar avisos mientras está abierta. Para push fiables cuando la PWA está cerrada en iPhone hace falta conectar un servicio push/backend con claves VAPID. El service worker ya está preparado para recibir eventos `push`; el siguiente paso es conectar ese backend.
