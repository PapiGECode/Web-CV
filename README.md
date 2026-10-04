# Pablo Schefer — portfolio

Portfolio editorial en https://www.pabloschefer.com. HTML estático indexable, CSS y JavaScript progresivos, GSAP y funciones Edge pequeñas. La web conserva contenido, enlaces a proyectos, CV y contacto por email sin JavaScript.

## Desarrollo

Requiere Node.js 24. Ejecuta `npm ci`, `npm run build` y `npm run dev`. La vista previa está en http://localhost:3000. `npm test` comprueba los endpoints con transportes simulados; `npm run test:e2e` ejecuta Chromium/Playwright. En CI se usa Chrome instalado en el runner; localmente se puede instalar con `npx playwright install chromium`.

## Estructura

- `index.html`: contenido principal y proyectos secundarios indexables.
- `projects/*.html`: casos de estudio con URL, metadatos y navegación propios.
- `css/quality.css`: refinamiento responsive, accesibilidad, formulario y preferencias.
- `js/app.js`: interacción y animaciones de portada; `shared.js`: tema, preferencias .
- `js/contact.js`: formulario independiente de las animaciones, validación y estados de envío.
- `server/contact.js`: validación y entrega Resend; `api/contact.js`: adaptador Edge.
- `api/github-activity.js`: actividad pública con caché y límite de tiempo.
- `server/metrics.js`: receptor acotado y validado de medición opcional.
- `scripts/build.mjs`: WebP responsive, fuentes locales, minificación y nombres con hash.
- `tests/`: pruebas unitarias y de navegador. Ninguna prueba envía emails reales.

## Correo: configuración necesaria

El envío directo solo se habilita si el entorno tiene `RESEND_API_KEY` y `CONTACT_FROM`. El remitente debe pertenecer a un dominio verificado en Resend. Configura los valores en Vercel, nunca en archivos públicos. `GET /api/contact` informa únicamente de disponibilidad, sin exponer claves. Un proveedor configurado puede rechazar un remitente no verificado; solo la respuesta del proveedor con identificador se considera envío aceptado, no entrega garantizada al buzón.

Sin credenciales la interfaz ofrece un **borrador explícito** para el correo del visitante ; nunca simula envío. Si falla un envío directo se conserva el texto para reintentar. La clave de idempotencia permanece estable para el mismo intento y contenido.

El destinatario está fijado en servidor. Hay validación de origen, contenido JSON acotado por bytes, honeypot, límites y tiempo máximo. El límite por instancia es de 5 intentos/10 minutos: **no es una garantía distribuida**. Para límites compartidos configura conjuntamente `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`; un fallo de ese servicio configurado bloquea el envío. No se registran campos del formulario ni IP en los logs de la aplicación.

## Medición y privacidad

La medición propia está apagada por defecto y requiere consentimiento en el pie de página. Respeta DNT/GPC. Captura con `web-vitals` LCP, INP, CLS y TTFB y cuatro eventos permitidos. No envía parámetros de URL, identificadores persistentes ni campos del formulario.

`/api/metrics` valida tamaño, origen, campos y rangos. Registra exclusivamente eventos normalizados `portfolio_metric` en los logs de Vercel. **Esto no habilita los paneles comerciales Vercel Web Analytics/Speed Insights ni calcula visitantes únicos**. Esos productos requieren activar la función correspondiente en la cuenta. La conservación de datos depende de la configuración de logs del alojamiento. Consulta `/privacidad` para el comportamiento del sitio.

## Producción y reversión

Vercel compila `dist/` y sirve las funciones `api/` desde el repositorio. El build contiene la revisión de Git en `meta[name="build-revision"]`. CSS, JS y fuentes con hash usan caché inmutable; HTML y recursos sin versión se revalidan. No cambies el dominio ni crees otro proyecto para desplegar esta web.

El workflow `Portfolio quality` valida, compila y prueba antes de revisar/fusionar una PR. Las capturas y trazas se guardan como artifacts temporales, no en la web. Para revertir, utiliza un deployment anterior de Vercel o un commit de reversión revisado. Se conserva la rama `backup/pre-quality-20261004`.

## Licencias

Consulta `LICENSE`. Se conservan los avisos originales de GSAP/Lenis y las licencias de las fuentes autoalojadas. No atribuyas la autoría de esas dependencias al portfolio.

## Teléfonos de proyectos

Los teléfonos son HTML/CSS/JavaScript, no capturas ni iframes de la web completa. `scripts/project-phones.mjs` genera su contenido estático, `css/project-phones.css` define el viewport y `js/project-phones.js` añade pestañas y un reloj local. Se reutiliza la carcasa `iphone18-pro-max-bezel.png` facilitada por el propietario desde su repositorio de ThiagoIUTU. No se consulta `/api/youtube-channel` ni se usa una clave de YouTube: los tres teléfonos presentan proyectos distintos, no un canal de vídeo. Las vistas son demostraciones de presentación, no apps móviles de KiCord o KernelOS.

La interfaz existe sin JavaScript; con JavaScript las instancias se ajustan con ResizeObserver, tienen IDs únicos y limpian sus observadores al cerrar o sustituir un modal. Los controles mantienen un área visible mínima de 44px. El color de la demo de KiCord solo cambia en esa instancia.
