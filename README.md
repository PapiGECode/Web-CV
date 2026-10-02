# Pablo Schefer Orduña — Portfolio

Portfolio personal de **Pablo Schefer Orduña**, publicado en **https://www.pabloschefer.com/**.

La web combina una interfaz editorial monocroma con animaciones GSAP/ScrollTrigger, Lenis, casos de estudio interactivos y una pequeña capa serverless en Vercel.

## Stack

- HTML5 semántico
- CSS modular
- JavaScript vanilla
- GSAP + ScrollTrigger + SplitText
- Lenis
- Vercel Functions
- Sharp para optimización de imágenes durante el build

## Estructura

```text
index.html
css/
  styles.css
js/
  app.js
  vendor/
api/
  contact.js
  github-activity.js
scripts/
  build.mjs
  validate.mjs
assets/
robots.txt
sitemap.xml
site.webmanifest
vercel.json
```

## Desarrollo y build

```bash
npm install
npm run check
npm run build
```

El build genera `dist/`, optimiza los recursos gráficos y crea variantes WebP/AVIF, favicons e imagen Open Graph.

## Producción

El proyecto está conectado a Vercel. Los despliegues de producción sirven:

- HTML/CSS/JS separados y cacheables.
- Imágenes optimizadas generadas durante el build.
- Cabeceras de seguridad.
- `robots.txt`, `sitemap.xml`, manifest y metadatos sociales.
- Actividad pública de GitHub mediante `/api/github-activity`, con caché y fallback.
- Formulario de contacto validado mediante `/api/contact`.

El formulario utiliza un borrador `mailto:` como método de entrega mientras no exista un proveedor transaccional configurado en servidor. La interfaz no muestra un falso estado de “enviado”.

## Accesibilidad

- Respeta `prefers-reduced-motion`.
- Navegación por teclado.
- Focus trap y devolución de foco en menú móvil y casos de estudio.
- Estados ARIA sincronizados.
- Foco visible.
- Menor carga de efectos en dispositivos táctiles.

## SEO

Incluye canonical, Open Graph, Twitter Cards, JSON-LD `Person`, sitemap, robots, manifest e imagen social 1200×630.

## Licencia

Consulta [LICENSE](./LICENSE).
