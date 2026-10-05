/** The actual KiCord website, not a replica of its interface. */
export function renderLiveKiCord(uid) {
  if (!/^[a-z0-9-]+$/.test(uid)) throw new Error('Invalid live phone ID');
  return `<div class="project-phone" data-project-phone="kicord" data-kicord-live role="group" aria-label="Web real de KiCord en un teléfono">
  <div class="pf-screen"><div class="pf-app">
    <div class="pf-status" aria-hidden="true"><span class="pf-time">9:41</span><span class="pf-signal"><svg viewBox="0 0 29 14"><rect width="25" height="14" rx="4" fill="#68686e"/><rect x="2" y="2" width="18" height="10" rx="2"/><path d="M27 4.5a2.6 2.6 0 0 1 0 5z"/></svg></span></div>
    <div class="pf-toolbar pf-live-toolbar"><span class="pf-live-domain">kicord.es</span><span class="pf-toolbar-tag">WEB REAL</span><button type="button" class="pf-live-reload" aria-label="Recargar la web de KiCord" title="Recargar KiCord" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 3M4 15l2 3a7 7 0 0 0 12-1"/></svg></button></div>
    <iframe class="pf-live-frame" src="https://www.kicord.es/es" title="Web oficial de KiCord — versión móvil" width="390" height="650" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads" allow="camera 'none'; microphone 'none'; geolocation 'none'"></iframe>
    <div class="pf-bottom"><a href="https://www.kicord.es/es" target="_blank" rel="noopener noreferrer">Abrir KiCord aparte <span aria-hidden="true">↗</span></a><span class="pf-home-indicator" aria-hidden="true"></span></div>
  </div></div>
  <img class="phone-bezel" src="/assets/iphone18-pro-max-bezel.png" width="1470" height="3000" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
  </div>`;
}
