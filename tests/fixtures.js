import { test as base, expect } from '@playwright/test';
export { expect };
// Deterministic remote fixtures, never served in production. The portfolio is NOT mocked.
export function remoteFixture(name, path) { return `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} integration fixture</title><style>html{overscroll-behavior:contain}body{margin:0;background:#080a0f;color:#eee;font:16px Arial}main{padding:24px}a{color:#bcaeff}section{height:1800px}h1{font-size:30px}</style></head><body><main><h1>${name} · prueba de integración</h1><p>Documento remoto simulado para las pruebas.</p><a id="remote-navigation" href="${path}">Ver otra página</a><section>Contenido desplazable de prueba</section><footer>Final del documento de prueba</footer></main></body></html>`; }
export const fixtureHTML = remoteFixture('KiCord','/es/plugins');
// Keep the historical helper name for existing non-phone regression tests.
export async function stubKiCord(context) {
  await context.route(/^https:\/\/(?:www\.)?kicord\.es\//, r=>r.fulfill({contentType:'text/html; charset=utf-8',body:fixtureHTML}));
  for (const host of ['thiagoiutu.com', 'papigegamer.com']) await context.route(`https://${host}/**`, r=>r.fulfill({contentType:'text/html; charset=utf-8',body:remoteFixture(host,'/next')}));
  await context.route(/^https:\/\/(?:www\.)?kernelos\.org\//, r=>r.fulfill({contentType:'text/html; charset=utf-8',body:remoteFixture('KernelOS','/changelogs')}));
}

export const test=base.extend({liveWebsiteStubs:[async({context},use)=>{await stubKiCord(context);await use();},{auto:true}]});
