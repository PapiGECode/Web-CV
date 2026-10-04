/** Project presentation phones. Same viewport geometry as the supplied Thiago phone.
 * All content is prerendered; enhancement adds scoped tabs and preview controls.
 * No YouTube calls, account controls or simulated product statistics are needed.
 */
const icons = {
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  code: '<path d="m8 5-7 7 7 7m8-14 7 7-7 7m-3-17-2 20"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zm-9 10 9 5 9-5m-18 5 9 5 9-5"/>',
  sliders: '<path d="M4 4v16M12 4v16M20 4v16M1 8h6m2 8h6m2-6h6"/>',
  screen: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  message: '<path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const row = (name,title,text) => `<div class="pf-feature"><span class="pf-feature-icon">${icon(name)}</span><div><h4>${title}</h4><p>${text}</p></div></div>`;
const outLink = (url,label) => `<a class="pf-row-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}${icon('arrow')}</a>`;
const projects = {
  kicord: {
    name:'KiCord', domain:'kicord.es', category:'Cliente de Discord', badge:'Código cerrado', logo:'/assets/kicord-logo.webp',
    lead:'Tu Discord. A tu manera.', description:'Personalización, plugins y una experiencia de uso propia.',
    banner:'<span class="pf-banner-kicker">DISCORD, A TU MANERA.</span><strong>KiCord<span>✦</span></strong><span class="pf-banner-lines" aria-hidden="true"></span>',
    tabs:[
      ['Inicio', `<div class="pf-welcome"><p class="pf-kicker">Una experiencia propia</p><h3>Más posibilidades.<br>El mismo punto de encuentro.</h3><p>Un cliente modificado para personalizar cómo utilizas Discord.</p></div>${row('sliders','Personalización','Apariencia y experiencia de uso.')}${row('layers','Plugins','Funciones adicionales en el cliente.')}`],
      ['Funciones', `${row('sliders','Interfaz a medida','Personalización de la apariencia y del comportamiento.')}${row('layers','Integración de plugins','Un espacio para funcionalidades adicionales.')}${row('lock','Cliente de código cerrado','Los plugins públicos relacionados son proyectos independientes.')}<p class="pf-note">KiCord no es un producto oficial de Discord. Esta pantalla es una presentación interactiva, no el cliente.</p>`],
      ['Aspecto', `<p class="pf-kicker">Prueba visual</p><h3 class="pf-heading">Explora el estilo.</h3><p class="pf-copy">Cambia el acento de esta vista de presentación.</p><div class="pf-palette" aria-label="Color de esta vista"><button type="button" data-phone-accent="violet" aria-pressed="true">Violeta</button><button type="button" data-phone-accent="mint" aria-pressed="false">Menta</button><button type="button" data-phone-accent="amber" aria-pressed="false">Ámbar</button></div><div class="pf-preview-card"><span class="pf-preview-orb" aria-hidden="true">✦</span><div><strong>Tu espacio.</strong><p>Una interfaz con personalidad.</p></div><span class="pf-preview-chip">Vista previa</span></div><p class="pf-note">Solo cambia el color de este teléfono. No modifica ajustes de Discord.</p>`]
    ],
    url:'https://kicord.es', action:'Visitar KiCord', bottom:'Cliente · Código cerrado'
  },
  portfolio: {
    name:'Pablo Schefer', domain:'pabloschefer.com', category:'Portfolio personal', badge:'Esta misma web', logo:null,
    lead:'Ideas convertidas en software útil.', description:'Desarrollo web, automatización y herramientas para comunidades.',
    banner:'<span class="pf-banner-kicker">DESARROLLO WEB / CÓDIGO ABIERTO</span><strong class="pf-portfolio-word">PABLO<br>SCHEFER</strong>',
    tabs:[
      ['Inicio', `<p class="pf-kicker">El portfolio que estás visitando</p><h3 class="pf-heading">Diseño con intención.<br>Código que responde.</h3>${row('code','HTML · CSS · JavaScript','Contenido estático y mejora progresiva.')}${row('layers','GSAP · Vercel','Animaciones y pequeñas funciones de servidor.')}<div class="pf-chipline"><span>Responsive</span><span>Accesibilidad</span><span>Pruebas</span></div>`],
      ['Proyectos', `<p class="pf-kicker">Trabajo y colaboraciones</p><a class="pf-project-row" href="/projects/kicord"><span class="pf-project-num">01</span><div><strong>KiCord</strong><p>Cliente cerrado para Discord</p></div>${icon('arrow')}</a><a class="pf-project-row" href="/projects/portfolio"><span class="pf-project-num">02</span><div><strong>Este portfolio</strong><p>HTML, CSS, JavaScript y GSAP</p></div>${icon('arrow')}</a><a class="pf-project-row" href="/projects/kernelos"><span class="pf-project-num">03</span><div><strong>KernelOS</strong><p>ISO custom · Soporte y comunidad</p></div>${icon('arrow')}</a>`],
      ['Contacto', `<p class="pf-kicker">Hablemos</p><h3 class="pf-heading">Construyamos<br>algo útil.</h3><p class="pf-copy">Proyectos, oportunidades y colaboraciones.</p><a class="pf-contact" href="mailto:pablopme50@gmail.com">${icon('mail')}<span>pablopme50@gmail.com</span></a>${outLink('https://github.com/PapiGECode','Ver GitHub')}<a class="pf-row-link" href="/assets/Pablo-Schefer-CV.pdf" target="_blank" rel="noopener noreferrer">Consultar CV${icon('arrow')}</a><p class="pf-note">Valencia, España</p>`]
    ],
    url:'https://github.com/PapiGECode/Web-CV', action:'Ver código de esta web', bottom:'Portfolio · Web-CV'
  },
  kernelos: {
    name:'KernelOS', domain:'kernelos.org', category:'ISO personalizada de Windows', badge:'Soporte y comunidad', logo:'/assets/kernelos-logo.webp',
    lead:'Windows. Otra configuración.', description:'ISO custom orientada a gaming, con una comunidad de soporte.',
    banner:'<span class="pf-banner-kicker">WINDOWS / CUSTOM ISO</span><strong>KernelOS<span>↗</span></strong><span class="pf-window-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
    tabs:[
      ['Resumen', `<p class="pf-kicker">Qué es KernelOS</p><h3 class="pf-heading">Una ISO personalizada.<br>Una comunidad detrás.</h3>${row('screen','Basada en Windows','Imagen del sistema modificada y configurada.')}${row('message','Mi participación','Soporte técnico y ayuda a usuarios.')}<p class="pf-note">Mi colaboración no es la creación de la ISO. Esta vista no ejecuta Windows en el teléfono.</p>`],
      ['Soporte', `<p class="pf-kicker">Acompañamiento técnico</p><h3 class="pf-heading">Entender el problema.</h3><details class="pf-detail" open><summary>Configuración y drivers<span>+</span></summary><p>Orientación sobre incidencias de configuración, controladores y compatibilidad.</p></details><details class="pf-detail"><summary>Incidencias reproducibles<span>+</span></summary><p>Identificar síntomas y documentar los pasos que permiten reproducir un problema.</p></details><details class="pf-detail"><summary>Comunidad y feedback<span>+</span></summary><p>Ayuda a usuarios y comunicación de consultas o problemas recurrentes.</p></details>`],
      ['Ficha', `${row('screen','Producto','ISO personalizada de Windows orientada a gaming.')}${row('message','Colaboración','Soporte técnico y participación en la comunidad.')}${row('check','Autoría diferenciada','Aquí se muestra mi participación, no se atribuye la creación de KernelOS a este portfolio.')}<p class="pf-note">La información y distribución oficial del proyecto están en su propia web.</p>`]
    ],
    url:'https://kernelos.org/', action:'Visitar KernelOS', bottom:'Windows · ISO custom'
  }
};

export function renderProjectPhone(key, uid) {
  const data = projects[key];
  if (!data || !/^[a-z0-9-]+$/.test(uid)) throw Error('Invalid project phone');
  const logo = data.logo ? `<img src="${data.logo}" width="80" height="80" alt="" loading="lazy" decoding="async" />` : '<span class="pf-monogram" aria-hidden="true">PS</span>';
  const tabs = data.tabs.map(([label],i) => `<button type="button" role="tab" id="${uid}-tab-${i}" aria-controls="${uid}-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-phone-tab="${i}">${escape(label)}</button>`).join('');
  const panels = data.tabs.map(([label,content],i) => `<div class="pf-tabpanel" id="${uid}-panel-${i}" role="tabpanel" aria-labelledby="${uid}-tab-${i}" tabindex="0"${i?' hidden':''}>${content}</div>`).join('');
  return `<div class="project-phone" data-project-phone="${key}" role="group" aria-label="Vista interactiva de ${escape(data.name)}"><div class="pf-screen"><div class="pf-app">
  <div class="pf-status" aria-hidden="true"><span class="pf-time">9:41</span><span class="pf-signal"><svg viewBox="0 0 20 14"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" width="3" height="14" rx="1"/></svg><svg viewBox="0 0 17 13"><path d="M.4 3.6a12 12 0 0 1 16.2 0l-1.8 1.8a9.4 9.4 0 0 0-12.6 0zM3.5 6.8a7.5 7.5 0 0 1 10 0l-1.8 1.8a4.8 4.8 0 0 0-6.4 0zM6.6 10a2.8 2.8 0 0 1 3.8 0l-1.9 2z"/></svg><svg viewBox="0 0 29 14"><rect width="25" height="14" rx="4" fill="#68686e"/><rect x="2" y="2" width="18" height="10" rx="2"/><path d="M27 4.5a2.6 2.6 0 0 1 0 5z"/></svg></span></div>
  <div class="pf-toolbar"><span class="pf-toolbar-icon" aria-hidden="true">${icon('screen')}</span><span>${data.domain}</span><span class="pf-toolbar-tag">PREVIEW</span></div>
  <div class="pf-scroll" data-lenis-prevent tabindex="0" aria-label="Contenido de ${escape(data.name)}">
  <div class="pf-banner">${data.banner}</div><div class="pf-profile"><div class="pf-avatar">${logo}</div><div><h3>${data.name}</h3><span class="pf-category">${data.category}</span></div></div><p class="pf-lead">${data.lead}</p><p class="pf-description">${data.description}</p><div class="pf-badge">${icon('check')}${data.badge}</div>
  <div class="pf-tabs" role="tablist" aria-label="Secciones de ${escape(data.name)}">${tabs}</div>${panels}</div>
  <div class="pf-bottom"><a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.action}${icon('arrow')}</a><span class="pf-home-indicator" aria-hidden="true"></span></div>
  </div></div><img class="phone-bezel" src="/assets/iphone18-pro-max-bezel.png" width="1470" height="3000" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" /></div>`;
}
