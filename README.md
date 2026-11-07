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

La portada presenta cinco webs reales —KiCord, este portfolio, ThiagoIUTU, Thiago Community y PapiGEGamer— y un recorrido local interactivo de KernelOS, etiquetado como tal. Se cargan cerca del viewport (180px), con una vista de escritorio de 1100 CSS px escalada al contenedor. Cada vista conserva un enlace externo permanente también sin JavaScript.

Los casos de KiCord y el portfolio ofrecen una vista móvil real dentro de un desplegable; el de KernelOS muestra el recorrido local. Se conserva la carcasa original y su isla dinámica, una zona segura superior del 7% y los controles fuera del display.

`scripts/project-phones.mjs` genera plantillas inertes y `js/project-phones.js` crea las vistas cerca de la zona visible. El portfolio usa la misma web en `/?phone-preview=1`, relativo al origen actual para funcionar también en los despliegues de prueba. Una página del portfolio incrustada no inicia otros iframes, incluso al navegar a otro caso de estudio. Su medición se desactiva para no duplicar visitas. Sin JavaScript se conservan enlaces directos reales.

La CSP permite exclusivamente el propio origen y los dominios de KiCord, KernelOS, thiagoiutu.com, thiago-community-web.vercel.app y papigegamer.com. Los sitios externos conservan su sandbox sin navegación del documento superior. No se copian páginas ni se eliminan protecciones de terceros. El enlace externo siempre permanece disponible: un evento load no equivale a confirmar la carga correcta. Los modales eliminan sus marcos al cerrarse sin navegar a about:blank.

Las pruebas sustituyen solo los sitios externos por documentos explícitos de prueba. El iframe del portfolio carga la página real construida. La comprobación de los sitios externos interactivos en un navegador real se realiza aparte. Para aislar la vista previa puede usarse PORT; para probar contra ella, TEST_BASE_URL.

## Contenido de proyectos

`content/projects.mjs` reúne las fichas verificadas. `scripts/project-catalog.mjs` genera el contenido compartido de páginas indexables y plantillas inertes de los casos; `projects/template.html` conserva el marco, SEO y preferencias. El build publica las rutas `/projects/<slug>` como HTML completo. No se mantienen copias independientes de la misma ficha en JavaScript y HTML.

## Restricciones de vistas incrustadas

KiCord y Thiago Community requieren desplegar en sus propios servidores las excepciones autorizadas de `frame-ancestors`: solo https://pabloschefer.com, https://www.pabloschefer.com y http://localhost:3105, únicamente para páginas públicas. Login, cuenta, administración y API siguen protegidos. KiCord queda pendiente del despliegue por Kira en su VPS (K1R4L-BS/kicord-web#14). La excepción de Thiago Community se publicó el 7/11/2026 mediante PapiGECode/thiago-community-web#1, revisión 048e7c23e4034fb710c583814d50f7a1759e0129; se comprobaron las cabeceras públicas y privadas en su dominio real. Las pruebas con fixtures no acreditan el despliegue remoto.

KernelOS no está bajo nuestro control y no se fuerza su incrustación. `/demos/kernelos` es un recorrido local independiente, claramente identificado, con navegación, información sobre la colaboración y desplegables nativos. No copia la web completa, no ofrece descargas ni simula resultados. Su iframe tiene sandbox sin `allow-same-origin` y conserva el enlace a https://kernelos.org/. Funciona sin JavaScript y no recoge métricas.

Comprobación optativa contra Thiago Community real (sin fixtures para ese origen): `LIVE_COMMUNITY=1 TEST_BASE_URL=http://localhost:3105 npx playwright test tests/community-live.spec.js`. Requiere la conexión externa y el origen autorizado; no se ejecuta en la suite determinista de CI.

## Revisión de GitHub

La selección de repositorios y las membresías se contrastaron el 7/11/2026. Las fuentes y los límites de atribución están en content/github-verification.md; los avatares y nombres de organizaciones, en content/community-logos.json. K1R4LABS se conserva por confirmación expresa de Pablo, aunque no aparezca en la API de membresías públicas. El contenido no infiere membresías privadas ni presenta ejecutables sin fuentes como open source.
