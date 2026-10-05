import { test as base, expect } from '@playwright/test';
export { expect };
// Deterministic integration fixture, NOT the production page or a product preview.
export const fixtureHTML = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>KiCord integration fixture</title><style>html{overscroll-behavior:contain}body{margin:0;color:#ece8e1;background:#080a0f;font:16px Arial}main{padding:24px}h1{font-size:36px}a{color:#b3a5ff}section{height:1000px}</style></head><body><main><h1>KiCord · prueba de integración</h1><p>Documento remoto de prueba a 390px.</p><nav><a href="/es/plugins">Plugins</a></nav><section>Contenido desplazable de prueba.</section><footer>Final de la página de prueba</footer></main></body></html>`;
export async function stubKiCord(context) {
  await context.route(/^https:\/\/(?:www\.)?kicord\.es\//, route => route.fulfill({contentType:'text/html; charset=utf-8', body:fixtureHTML}));
}
export const test = base.extend({
  liveKiCordStub: [async ({context}, use) => { await stubKiCord(context); await use(); }, {auto:true}],
});
