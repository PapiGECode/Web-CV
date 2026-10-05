/** Real websites. Iframe templates stay inert until the top-level page mounts them. */
const sites = Object.freeze({
  kicord: { name:'KiCord', domain:'kicord.es', url:'https://www.kicord.es/es', href:'https://www.kicord.es/es' },
  portfolio: { name:'PabloSchefer.com', domain:'pabloschefer.com', url:'/?phone-preview=1', href:'https://www.pabloschefer.com/' },
  kernelos: { name:'KernelOS', domain:'kernelos.org', url:'https://kernelos.org/', href:'https://kernelos.org/' },
});
export function renderProjectPhone(key, uid) {
  const site = sites[key];
  if (!site || !/^[a-z0-9-]+$/.test(uid)) throw new Error('Invalid project phone');
  const sandbox = key === 'portfolio' ? '' : ' sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"';
  return `<div class="live-phone-presentation" data-phone-presentation="${key}">
  <div class="project-phone" data-project-phone="${key}" data-live-phone="${key}" role="group" aria-label="Web de ${site.name} en un teléfono">
    <div class="pf-screen">
      <div class="phone-preview-cover"><span class="phone-cover-label">${site.domain}</span><strong>${site.name}</strong><p>Web del proyecto</p><a href="${site.href}" target="_blank" rel="noopener noreferrer">Abrir la web ↗</a></div>
      <template data-live-template><iframe class="pf-live-frame" title="${site.name} — web real en versión móvil" data-frame-src="${site.url}" width="${key === 'kernelos' ? 430 : 390}" height="825" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"${sandbox}></iframe></template>
    </div>
    <img class="phone-bezel" src="/assets/iphone18-pro-max-bezel.png" width="1470" height="3000" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
  </div>
  <div class="live-phone-tools" role="group" aria-label="Controles de la vista de ${site.name}"><a href="${site.href}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${site.name} en otra pestaña">${site.domain} <span aria-hidden="true">↗</span></a><button type="button" data-phone-reload aria-label="Recargar la vista de ${site.name}" title="Recargar vista" hidden><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 11-1l3 6M4 12l3 6a7 7 0 0 0 11-1"/></svg></button></div>
  </div>`;
}
