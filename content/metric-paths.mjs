// Explicit public routes only; never infer an allowed path from a visitor's URL.
export const metricPaths = Object.freeze([
  '/',
  '/projects/kicord',
  '/projects/portfolio',
  '/projects/kernelos',
  '/projects/thiagoiutu',
  '/projects/robleis',
  '/projects/thiago-community',
  '/projects/papigegamer-web',
  '/projects/papigegamer', // Historical redirect retained for older clients.
  '/privacidad',
]);
