import type { D1Database, ExecutionContext, ScheduledController } from '@cloudflare/workers-types';
import { authenticate } from './auth.js';
import { createD1Database } from './d1.js';
import { HearingUnion } from './domain.js';
import { EventService } from './events.js';
import { createHearingMcp } from './mcp.js';
import { consumeRateLimit } from './operations.js';
import { renderPublicPage } from './pages.js';
import { eventEncryptionKey } from './runtime-key.js';
import { workerWebhook } from './worker-webhook.js';
import lectures from '../dist/apps/lectures.js.txt';
import analytics from '../dist/apps/analytics.js.txt';
export interface Env {
  DB: D1Database;
  EVENT_CALLBACK_HOSTS?: string;
  PUBLISHER_NAME?: string;
  SUPPORT_URL?: string;
  CHATGPT_APP_URL?: string;
}
const SITE_ORIGIN='https://hearing-union.ahaugedk.chatgpt.site';
async function services(env: Env) {
  const db = createD1Database(env.DB);
  // The Site is private to its owner during bootstrap. Thereafter the persisted
  // owner is authoritative and subsequent authenticated users get the user role.
  const domain = new HearingUnion(db, {bootstrapPrivateOwner:true});
  const events = new EventService(db, { encryptionKey: await eventEncryptionKey(db), webhook: workerWebhook(env.EVENT_CALLBACK_HOSTS ?? '') });
  return { db, domain, events };
}
function json(status: number, data: unknown, headers: Record<string,string> = {}) {
  return new Response(JSON.stringify(data), {status,headers:{'content-type':'application/json',...headers}});
}
function protect(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('cache-control','no-store'); headers.set('x-content-type-options','nosniff');
  headers.set('referrer-policy','no-referrer'); headers.set('strict-transport-security','max-age=31536000');
  return new Response(response.body,{status:response.status,headers});
}
async function handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = SITE_ORIGIN, url = new URL(request.url);
  if (url.origin !== origin) return json(403,{error:'Forbidden host'});
  const browserOrigin = request.headers.get('origin');
  if (browserOrigin && browserOrigin !== origin) return json(403,{error:'Forbidden origin'});
  // Only the renderer's fixed informational pages are anonymous. Private Sites
  // ingress still controls access; no domain service or database is opened here.
  if (request.method === 'GET') {
    const page=renderPublicPage(url.pathname,{publisherName:env.PUBLISHER_NAME,supportUrl:env.SUPPORT_URL,chatGPTAppUrl:env.CHATGPT_APP_URL,hosted:true});
    if(page!==null) return new Response(page,{headers:{'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
  }
  let authInfo;
  try { authInfo = authenticate(request); }
  catch { return json(401,{error:'Sites authentication required'}); }
  if (request.method === 'GET' && url.pathname === '/health') {
    const {db}=await services(env);
    await db.prepare('SELECT revision FROM app_revision WHERE id=1').get();
    return json(200,{status:'ok',runtime:'cloudflare-workers',storage:'d1'});
  }
  if (url.pathname !== '/mcp') return json(404,{error:'Not found'});
  if (request.method !== 'POST') return json(405,{error:'POST required'},{allow:'POST'});
  const length=request.headers.get('content-length');
  if(length && (!/^\d+$/.test(length)||Number(length)>65536))return json(413,{error:'Request too large'});
  const {db,domain,events}=await services(env);
  const rate=await consumeRateLimit(db,authInfo.extra.subject);
  if(!rate.allowed)return json(429,{error:'Too many requests'},{'retry-after':String(rate.retryAfterSeconds)});
  await events.verifyEncryptionKey();
  const handler=createHearingMcp(domain,events,name=>name==='lectures'?lectures:analytics);
  try { return await handler.fetch(request,{authInfo}); }
  finally { ctx.waitUntil(handler.close()); }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try { return protect(await handle(request,env,ctx)); }
    catch { return protect(json(503,{error:'Service unavailable'})); }
  },
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const {events}=await services(env);
    ctx.waitUntil(events.verifyEncryptionKey().then(()=>events.drain(Date.now(),25)));
  },
};
