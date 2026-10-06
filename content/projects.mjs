// Verified content shared by indexable pages and inert modal templates.
export const projects = [
  {
    id: 'kicord', slug: 'kicord', number: '01', title: 'KiCord',
    category: 'Cliente de Discord', status: 'Código cerrado',
    summary: 'Cliente modificado de Discord de código cerrado, con plugins y opciones de personalización.',
    role: 'Desarrollo del cliente',
    overview: 'KiCord es un cliente modificado de Discord de código cerrado. Mi trabajo se centra en su desarrollo, la personalización de la experiencia y la integración de plugins. Los plugins relacionados no convierten el cliente KiCord en open source.',
    approach: 'Desarrollar y mantener opciones de personalización, integración de plugins y mejoras de interfaz. KiCord no es un producto oficial de Discord.',
    tags: ['Discord', 'Personalización', 'Plugins', 'UX'],
    links: [{ label: 'Visitar KiCord', url: 'https://www.kicord.es/es' }],
    phone: 'kicord', next: 'portfolio',
    details: [
      { title: 'Personalización', text: 'Opciones para adaptar la apariencia y el comportamiento del cliente.' },
      { title: 'Plugins', text: 'Integración de funcionalidades adicionales mediante plugins.' },
      { title: 'Código cerrado', text: 'El código del cliente KiCord no se distribuye como código abierto.' },
    ],
  },
  {
    id: 'papige', slug: 'portfolio', number: '02', title: 'PabloSchefer.com',
    category: 'Portfolio personal', status: 'Esta misma web',
    summary: 'Esta misma web: HTML, CSS y JavaScript, animaciones GSAP y funciones de Vercel.',
    role: 'Diseño, desarrollo y mantenimiento',
    overview: 'PabloSchefer.com es esta misma web, mantenida en Web-CV. Presenta proyectos, experiencia y contacto mediante HTML estático, CSS y JavaScript. GSAP aporta movimiento; pequeñas funciones de Vercel gestionan la actividad de GitHub y el contacto.',
    approach: 'Una identidad editorial con mejora progresiva: contenido accesible sin JavaScript, imágenes adaptables y estados de contacto que distinguen un borrador de un envío aceptado.',
    tags: ['HTML', 'CSS', 'JavaScript', 'GSAP', 'Vercel'],
    links: [{ label: 'Ver código de la web', url: 'https://github.com/PapiGECode/Web-CV' }],
    phone: 'portfolio', next: 'kernelos',
    details: [
      { title: 'Contenido indexable', text: 'Páginas estáticas de proyecto y navegación útil sin depender de una aplicación React.' },
      { title: 'Accesibilidad y movimiento', text: 'Pruebas de teclado, temas, tamaños de pantalla y preferencias de movimiento.' },
      { title: 'Contacto transparente', text: 'La interfaz distingue entre preparar un correo y la entrega aceptada por el proveedor.' },
    ],
  },
];
