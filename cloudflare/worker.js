import { createContactHandler } from '../server/contact.js';
import { createMetricsHandler } from '../server/metrics.js';
import activity from '../api/github-activity.js';
const instances = new WeakMap();
export default { async fetch(request, env) {
  const url = new URL(request.url);
  let handlers=instances.get(env);
  if (!handlers) { handlers={contact:createContactHandler({env}),metrics:createMetricsHandler({env})};instances.set(env,handlers); }
  if (url.pathname.startsWith('/api/')) {
    const headers = new Headers(request.headers);
    headers.set('x-forwarded-for', request.headers.get('cf-connecting-ip') || 'unknown');
    const trustedRequest = new Request(request,{headers});
    if(url.pathname==='/api/contact') return handlers.contact(trustedRequest);
    if(url.pathname==='/api/metrics') return handlers.metrics(trustedRequest);
    if(url.pathname==='/api/github-activity') return activity(trustedRequest);
    return Response.json({error:'not_found'},{status:404});
  }
  return env.ASSETS.fetch(request);
}};
