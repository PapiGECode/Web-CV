import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { build, transform } from 'esbuild';
import { renderProjectPhone } from './project-phones.mjs';
import { projects, renderProjectPage, renderCaseTemplates } from './project-catalog.mjs';

const root = process.cwd();
const dist = path.join(root, 'dist');
const input = (...p) => path.join(root, ...p);
const output = (...p) => path.join(dist, ...p);
const revision = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
await fs.rm(dist, { recursive: true, force: true });
for (const dir of ['css', 'js', 'js/vendor', 'assets', 'assets/fonts', 'projects']) await fs.mkdir(output(dir), { recursive: true });
const replacements = new Map();
const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
async function hashedFile(relative, content) {
  const ext = path.extname(relative);
  const versioned = relative.slice(0, -ext.length) + '.' + hash(content) + ext;
  await fs.writeFile(output(versioned), content);
  replacements.set('/' + relative, '/' + versioned);
  return '/' + versioned;
}
// Self-host only the latin character subset used by the Spanish portfolio.
const families = [['bricolage-grotesque', 'Bricolage Grotesque'], ['inter', 'Inter'], ['jetbrains-mono', 'JetBrains Mono']];
let fonts = '';
let displayFont;
for (const [slug, family] of families) {
  const base = input('node_modules', '@fontsource-variable', slug);
  const fontName = `${slug}-latin-wght-normal.woff2`;
  const bytes = await fs.readFile(path.join(base, 'files', fontName));
  const file = await hashedFile(`assets/fonts/${fontName}`, bytes);
  if (!displayFont) displayFont = file;
  fonts += `@font-face{font-family:'${family}';font-style:normal;font-weight:100 900;font-display:swap;src:url('${file}') format('woff2');}\n`;
  // Retain the license with the site assets. These files are not user download artifacts.
  try { await fs.copyFile(path.join(base, 'LICENSE'), output('assets/fonts', slug + '-LICENSE.txt')); } catch {}
}
await hashedFile('css/fonts.css', fonts);
for (const entry of await fs.readdir(input('css'))) {
  if (!entry.endsWith('.css')) continue;
  const source = await fs.readFile(input('css', entry), 'utf8');
  const { code } = await transform(source, { loader: 'css', minify: true, target: ['chrome110', 'safari16'] });
  await hashedFile('css/' + entry, code);
}
for (const folder of ['js', 'js/vendor']) {
  for (const file of await fs.readdir(input(folder))) {
    if (!file.endsWith('.js') || file === 'metrics.js') continue;
    const source = (await fs.readFile(input(folder, file), 'utf8')).replace(/\/\/# sourceMappingURL=.*$/gm, '');
    const { code } = await transform(source, { minify: true, legalComments: 'inline', target: ['es2020'] });
    await hashedFile(folder + '/' + file, code);
  }
}
const metrics = await build({ entryPoints: [input('js/metrics.js')], bundle: true, minify: true, format: 'esm', target: 'es2020', write: false, legalComments: 'inline' });
await hashedFile('js/metrics.js', metrics.outputFiles[0].contents);

async function webp(name, destination, width, quality = 82) {
  await sharp(input('assets', name)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality, effort: 5 }).toFile(output('assets', destination));
}
for (const [base, source, width] of [['pablo-casual', 'pablo-casual.png', 1024], ['pablo-profesional', 'pablo-profesional.jpg', 1122]]) {
  for (const size of [480, 800]) await webp(source, `${base}-${size}.webp`, size);
  await webp(source, `${base}.webp`, width);
  await fs.copyFile(output('assets', `${base}.webp`), output('assets', `${base}-${width}.webp`));
}
await fs.copyFile(input('assets/iphone18-pro-max-bezel.png'), output('assets/iphone18-pro-max-bezel.png'));
for (const name of ['kicord-logo', 'kernelos-logo']) await webp(name + '.png', name + '.webp', 160, 90);
for (const theme of ['dark', 'light']) await sharp(input('assets', `favicon-${theme}.png`)).resize(32, 32).png({ palette: true, compressionLevel: 9 }).toFile(output('assets', `favicon-${theme}-32.png`));
for (const [file, size] of [['apple-touch-icon-180.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(input('assets/apple-touch-icon.png')).resize(size, size).png({ compressionLevel: 9 }).toFile(output('assets', file));
}
await fs.copyFile(input('assets/Pablo-Schefer-CV.pdf'), output('assets/Pablo-Schefer-CV.pdf'));
await fs.copyFile(input('favicon.ico'), output('favicon.ico'));
// A branded social card, not an unrelated template preview.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0c0c0d"/><path d="M64 90H1136M64 520H1136" stroke="#45433f"/><text x="66" y="67" fill="#aaa59a" font-family="sans-serif" font-size="20" letter-spacing="4">DESARROLLO WEB / CÓDIGO ABIERTO</text><text x="60" y="275" fill="#ece8e1" font-family="sans-serif" font-size="146" font-weight="700" letter-spacing="-6">PABLO</text><text x="60" y="424" fill="#ece8e1" font-family="sans-serif" font-size="146" font-weight="700" letter-spacing="-6">SCHEFER</text><text x="66" y="570" fill="#aaa59a" font-family="sans-serif" font-size="24">pabloschefer.com</text><text x="1135" y="570" text-anchor="end" fill="#aaa59a" font-family="sans-serif" font-size="24">Portfolio / Proyectos</text></svg>`;
await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(output('assets/preview-og.jpg'));

const generatedPages = new Map(projects.map(project => [`projects/${project.slug}.html`, project]));
const projectTemplate = await fs.readFile(input('projects/template.html'), 'utf8');
const pages = [...new Set(['index.html', '404.html', 'privacidad.html', ...generatedPages.keys()])];
for (const file of pages) {
  let html = generatedPages.has(file) ? renderProjectPage(projectTemplate, generatedPages.get(file)) : await fs.readFile(input(file), 'utf8');
  html = html.replace(/<div data-phone-placeholder="([a-z]+)" data-phone-instance="([a-z-]+)"><\/div>/g, (_, key, uid) => renderProjectPhone(key, uid));
  if (file === 'index.html') {
    html = html.replace('<!-- PROJECT_PHONE_TEMPLATES -->', renderCaseTemplates());
  }
  // Each device now includes its own external controls; remove old presentation captions.
  html = html.replace(/<p class="phone-caption">[^<]*<\/p>/g, '');
  html = html.replace(/(href|src)="((?:css|js|assets)\/[^\"]+)"/g, '$1="/$2"');
  for (const [before, after] of replacements) html = html.split(`"${before}"`).join(`"${after}"`);
  html = html.replace('</head>', `<meta name="build-revision" content="${revision.replace(/[^a-zA-Z0-9_-]/g, '')}"><link rel="preload" href="${displayFont}" as="font" type="font/woff2" crossorigin></head>`);
  const assets = new Set();
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|css|js)\/[^"?#]+)(?:[?#][^"]*)?"/g)) assets.add(match[1]);
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url.startsWith('/assets/')) assets.add(url);
    }
  }
  for (const asset of assets) {
    const local = path.resolve(dist, '.' + asset);
    if (!local.startsWith(dist + path.sep)) throw new Error(`Unsafe asset path in ${file}: ${asset}`);
    const info = await fs.stat(local).catch(() => null);
    if (!info?.isFile()) throw new Error(`Missing production asset in ${file}: ${asset}`);
  }
  await fs.writeFile(output(file), html);
}
for (const file of ['robots.txt', 'sitemap.xml', 'site.webmanifest']) await fs.copyFile(input(file), output(file));
console.log(JSON.stringify({ revision, pages: pages.length, versionedAssets: replacements.size }));
