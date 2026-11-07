# Revisión del contenido público de GitHub

Revisado el 7 de noviembre de 2026. Esta es una selección editorial, no un contador
automático ni una lista completa de repositorios. No se usan estrellas ni cifras
de audiencia como prueba de impacto.

## Fuentes públicas

- Perfil y repositorios: https://api.github.com/users/PapiGECode/repos?per_page=100
- Membresías públicas: https://api.github.com/users/PapiGECode/orgs?per_page=100
- Nombres de organizaciones: https://api.github.com/orgs/{login}

Las cinco membresías públicas devueltas son EpicGames, Design-and-Code,
Thread-Development, See-Bot y Open-Hub-Community. Se muestran sus nombres públicos
actuales (See-Bot se llama See Project). K1R4L-BS (nombre público K1R4LABS) no aparece en esta consulta, pero Pablo ha
confirmado expresamente su pertenencia tras salir y volver a entrar y ha pedido
conservarla en el portfolio. Se incluye como membresía confirmada por el usuario,
no como resultado de la API pública. Su ausencia en esa API no acredita una baja.
No eliminar membresías confirmadas por el usuario por una ausencia puntual en la
API: contrastar antes. No se infieren ni publican otras membresías privadas.

El campo membership_source distingue github-public-api de user-confirmed.
Los logos y sus fuentes se conservan en community-logos.json. Sus nombres deben
coincidir con los enlaces de index.html; los tests comprueban esta coherencia.

## Repositorios seleccionados

- https://github.com/PapiGECode/KiCord-DOOM-Plugin — README: adaptación para
  Equicord/Vencord, DOS.Zone/js-dos y crédito a nexpID. No confundir con el
  cliente cerrado KiCord ni atribuir la idea original al portfolio.
- https://github.com/PapiGECode/duolingo-streak-keeper — README actual: aplicación
  de Windows con detección visual, calibración DPI y scripts PowerShell.
  Distribuye un ejecutable y documentación, no el código fuente completo.
  Playwright/TypeScript/GitHub Actions describían una edición anterior y ya no
  representan el producto actual. No se promete mantener una racha ni funcionar
  en cualquier equipo.
- https://github.com/PapiGECode/refind-ice — README: tema rEFInd, recursos 1080p/4K,
  generador Python y licencia MIT. Inspirado en finn-term de FaeArtz. No instala
  rEFInd ni modifica EFI; pruebas visuales no acreditan arranque físico.
- https://github.com/PapiGECode/pablo-schefer-portfolio — README: laboratorio
  PapiGECode con Next.js, React y TypeScript. Su metadata antigua no debe
  confundirse con Web-CV. Se conserva el dominio verificado papigegamer.com.
- https://github.com/PapiGECode/Web-CV — este portfolio: HTML/CSS/JavaScript
  progresivo, GSAP y pequeñas funciones, no Next.js.

Se mantienen fuera de la selección los repositorios de pruebas, logros y actividad
de commits. No se añaden enlaces a repositorios privados de proyectos destacados.
Al revisar de nuevo, contrastar README y código, no copiar descripciones antiguas
sin comprobarlas. Actualizar también la evidencia técnica de index.html y los
casos compartidos en projects.mjs cuando corresponda.
