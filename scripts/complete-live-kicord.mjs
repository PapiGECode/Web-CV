// One-time, reviewed integration. Removed before merging the production change.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const update = async (file, fn) => {const old=await fs.readFile(file,'utf8'); const next=fn(old);assert.notEqual(next,old,`No edit in ${file}`);await fs.writeFile(file,next);};
const once = (s,a,b) => {assert.equal(s.split(a).length,2,`Expected unique anchor: ${a.slice(0,90)}`);return s.replace(a,b);};
await update('scripts/project-phones.mjs', s=> {
  s="import { renderLiveKiCord } from './live-kicord.mjs';\n"+s;
  s=once(s,'export function renderProjectPhone(key, uid) {','export function renderProjectPhone(key, uid) {\n  if (key === "kicord") return renderLiveKiCord(uid);');
  const start=s.indexOf('  kicord: {'),end=s.indexOf('  portfolio: {');assert(start>0&&end>start);
  return s.slice(0,start)+s.slice(end);
});
await update('js/project-phones.js', s=> {
  s=once(s,'function mount(scope=document) { roots(scope).forEach(init); }','function mount(scope=document) { roots(scope).forEach(init); window.KiCordLivePhone?.mount(scope); }');
  return once(s,'function destroy(scope) { roots(scope).forEach(root => controllers.get(root)?.()); }','function destroy(scope) { roots(scope).forEach(root => controllers.get(root)?.()); window.KiCordLivePhone?.destroy(scope); }');
});
await update('scripts/build.mjs', s=> once(s,"  // Absolute asset references are safe from clean URLs and nested project routes.",`  if (file === 'index.html' || file === 'projects/kicord.html') {
    html = html.replace('</head>', '<link rel="stylesheet" href="/css/live-kicord.css" /></head>');
    html = html.replace('<script defer src="/js/project-phones.js"></script>', '<script defer src="/js/live-kicord.js"></script><script defer src="/js/project-phones.js"></script>');
    html = html.replace('Vista de presentación interactiva.', 'Web real de KiCord · versión móvil. Si no aparece, ábrela aparte.');
  }
  // Absolute asset references are safe from clean URLs and nested project routes.`));
await update('js/app.js', s=> {
  s=once(s,`'<p class="phone-caption">Vista de presentación interactiva.</p>'`, `'<p class="phone-caption">' + (data.id === 'kicord' ? 'Web real de KiCord · versión móvil. Si no aparece, ábrela aparte.' : 'Vista de presentación interactiva.') + '</p>'`);
  return once(s,`csModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')`, `csModal.querySelectorAll('a[href], button:not([disabled]), iframe[title], [tabindex]:not([tabindex="-1"])')`);
});
await update('vercel.json', s=> {
  const c=JSON.parse(s),h=c.headers[0].headers.find(h=>h.key==='Content-Security-Policy');
  assert(!h.value.includes('frame-src'));
  h.value=h.value.replace("connect-src 'self';", "connect-src 'self'; frame-src https://www.kicord.es https://kicord.es;");
  return JSON.stringify(c,null,2)+'\n';
});
await update('privacidad.html', s=>once(s,'<section class="pp-section"><h2>Preferencias locales</h2>', '<section class="pp-section"><h2>Vista de KiCord</h2><p class="pp-copy">El teléfono de KiCord carga su web real en un iframe, de forma diferida. Al visualizarlo, tu navegador conecta directamente con KiCord y los proveedores que utiliza su web. Esa vista externa puede aplicar sus propias cookies y preferencias; la medición opcional de este portfolio no controla el sitio incrustado. También puedes abrir KiCord en otra pestaña mediante el enlace del teléfono.</p></section><section class="pp-section"><h2>Preferencias locales</h2>'));
await update('README.md',s=>s.slice(0,s.indexOf('## Teléfonos de proyectos'))+`## Teléfonos de proyectos

KiCord carga la web real https://www.kicord.es/es en un iframe de 390 CSS px escalado dentro de la carcasa original. No se copia, proxifica ni simula su web. El resto de teléfonos conserva sus interfaces temáticas.

scripts/live-kicord.mjs genera el marco; js/live-kicord.js ajusta tamaño, recarga y ciclo de vida. La CSP permite marcos únicamente de kicord.es y www.kicord.es. Se conserva sandbox sin navegación de la página superior. El enlace externo siempre está disponible; un evento load no se presenta como confirmación de éxito. Cloudflare y las políticas del sitio externo pueden afectar la carga según la conexión del visitante. Las pruebas de integración usan un documento remoto simulado, separado de la comprobación real en navegador.
`);
// Old KiCord tabs are intentionally replaced. Preserve and exercise both remaining themed phones.
for (const file of (await fs.readdir('tests')).filter(f=>f.endsWith('.spec.js'))) {
  if ((await fs.readFile('tests/'+file,'utf8')).includes("from '@playwright/test'")) await update('tests/'+file,s=>s.replace("import { test, expect } from '@playwright/test';", "import { test, expect, stubKiCord } from './fixtures.js';"));
}
await update('tests/phones.spec.js',s=> {
  s=s.replaceAll("['kicord','portfolio','kernelos']","['portfolio','kernelos']");
  s=s.replaceAll("toHaveCount(0);\n  for(const key", "toHaveCount(1);\n  for(const key");
  s=s.replaceAll(".stack [data-project-phone=kicord]",".stack [data-project-phone=portfolio]");
  s=s.replace("'Interfaz a medida'","'Trabajo y colaboraciones'");
  const a=s.indexOf("test('KiCord preview color changes"),b=s.indexOf('for(const width of [320,390])',a);assert(a>0&&b>a);
  s=s.slice(0,a)+s.slice(b);
  s=once(s,"    await modal.locator('[role=tab]').nth(1).click();\n    await expect(modal.locator('[role=tabpanel]:visible')).toHaveCount(1);", "    if(i%3===0) { await expect(modal.locator('iframe.pf-live-frame')).toHaveCount(1); } else {\n      await modal.locator('[role=tab]').nth(1).click();\n      await expect(modal.locator('[role=tabpanel]:visible')).toHaveCount(1);\n    }");
  s=s.replace("const page=await ctx.newPage();", "await stubKiCord(ctx); const page=await ctx.newPage();");
  s=s.replace("toContainText('KiCord');\n    await expect(phone.locator('.pf-tabs'))", "toContainText('Pablo Schefer');\n    await expect(phone.locator('.pf-tabs'))");
  s=s.replace("toContainText('Más posibilidades.')", "toContainText('El portfolio que estás visitando')");
  s=s.replace("toHaveAttribute('href','https://kicord.es')", "toHaveAttribute('href','https://github.com/PapiGECode/Web-CV')");
  s=s.replace("await expect(page.locator('iframe')).toHaveCount(0);", "await expect(page.locator('iframe.pf-live-frame')).toHaveCount(1);");
  return s;
});
await update('tests/ui-refinement.spec.js',s=>s.replace("['kicord','portfolio','kernelos']", "['portfolio','kernelos']"));
for (const file of ['tests/browser.spec.js','tests/content.spec.js']) await update(file,s=>s.replace('const page = await context.newPage();', 'await stubKiCord(context); const page = await context.newPage();').replace('const p = await context.newPage();','await stubKiCord(context); const p = await context.newPage();'));
