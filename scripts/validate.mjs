import fs from 'node:fs/promises';
const pages = ['index.html', 'projects/kicord.html', 'projects/papigegamer.html', 'projects/kernelos.html', 'privacidad.html'];
for (const page of pages) {
  const source = await fs.readFile(page, 'utf8');
  for (const required of ['rel="canonical"', 'lang="es"', 'name="viewport"', '<h1']) if (!source.includes(required)) throw Error(`${page}: ${required}`);
  if (/\sonclick\s*=/.test(source)) throw Error(`${page}: inline event handler`);
  if (/https:\/\/fonts\.(googleapis|gstatic)/.test(source)) throw Error(`${page}: external font dependency`);
  const ids = [...source.matchAll(/\bid="([^\"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) throw Error(`${page}: duplicate IDs`);
}
const readme = await fs.readFile('README.md', 'utf8');
if (readme.includes('<LIVE_URL>') || readme.includes('Arsalan Kaleem')) throw Error('Template README');
console.log('Source validation passed.');
