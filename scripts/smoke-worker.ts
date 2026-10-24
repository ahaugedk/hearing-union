import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHmac, randomBytes } from 'node:crypto';
import { createD1Database } from '../server/d1.js';
import type { D1Database } from '@cloudflare/workers-types';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const origin='https://hearing-union.ahaugedk.chatgpt.site';
const eventSecret='whsec_'+randomBytes(32).toString('base64');
const received:{eventId?:string;name?:string}[]=[];
const runtime=new Miniflare(convertV4MiniflareOptions({
  modules:[{type:'ESModule',path:'dist/worker/worker.js'},...(await readdir('dist/worker')).filter(name=>name.endsWith('.txt')).map(name=>({type:'Text' as const,path:`dist/worker/${name}`}))],
  compatibilityDate:'2026-10-24',compatibilityFlags:['nodejs_compat'],
  d1Databases:['DB'],outboundService: async request => {
    if(request.url==='https://callbacks.example.test/events') {
      const body=await request.text(),data=JSON.parse(body);
      const expected=createHmac('sha256',Buffer.from(eventSecret.slice(6),'base64')).update(`${request.headers.get('webhook-id')}.${request.headers.get('webhook-timestamp')}.${body}`).digest('base64');
      assert.ok(request.headers.get('webhook-signature')?.includes(`v1,${expected}`));
      if(data.type==='verification')return new Response(JSON.stringify({challenge:data.challenge}));
      received.push(data);return new Response('{}');
    }
    throw new Error('Unexpected outbound request');
  },
  bindings:{EVENT_CALLBACK_HOSTS:'callbacks.example.test',PUBLISHER_NAME:'Smoke fixture',SUPPORT_URL:'https://example.test/support',CHATGPT_APP_URL:'https://chatgpt.com/apps/smoke-fixture'},
}));
try {
  const db=await runtime.getD1Database('DB');
  // Exercise the same Drizzle statement boundaries that Sites consumes.
  const schema=await readFile('dist/.openai/drizzle/0001_initial.sql','utf8');
  const statements=schema.split('--> statement-breakpoint');
  for(const sql of statements)await db.prepare(sql).run();
  let id=0;
  const rpc=async(name:string,args:unknown={},subject='fixture-owner')=>{
    const response=await runtime.dispatchFetch(`${origin}/mcp`,{method:'POST',headers:{'oai-authenticated-user-id':subject,'oai-authenticated-user-email':'same-email@example.test','content-type':'application/json',accept:'application/json, text/event-stream','MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/call','Mcp-Name':name},body:JSON.stringify({jsonrpc:'2.0',id:++id,method:'tools/call',params:{name,arguments:args,_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}})});
    assert.equal(response.status,200,await response.clone().text());
    const result=await response.json() as any;assert.equal(result.error,undefined,JSON.stringify(result));return result.result;
  };
  const call=async(name:string,args:unknown={},subject='fixture-owner')=>{
    const result=await rpc(name,args,subject);assert.ok(!result.isError,JSON.stringify(result));return result.structuredContent;
  };
  const unauth=await runtime.dispatchFetch(`${origin}/mcp`,{method:'POST'});assert.equal(unauth.status,401);
  for(const headers of [{authorization:'Bearer local-development-token'},{'oai-authenticated-user-email':'owner@example.test'},{'oai-authenticated-user-id':'invalid,duplicate'}]) {
    assert.equal((await runtime.dispatchFetch(`${origin}/mcp`,{method:'POST',headers})).status,401);
  }
  const identityHeaders={'oai-authenticated-user-id':'fixture-owner'};
  const homepage=await runtime.dispatchFetch(`${origin}/`,{headers:identityHeaders});
  assert.equal(homepage.status,200);
  const homepageHtml=await homepage.text();
  assert.match(homepageHtml,/href="https:\/\/chatgpt.com\/apps\/smoke-fixture"/);
  assert.equal((homepageHtml.match(/<a /g)??[]).length,1,'Homepage has one installation action');
  assert.equal((await runtime.dispatchFetch(`${origin}/health`,{headers:identityHeaders})).status,200);
  for(const path of ['/login','/callback','/session','/.well-known/oauth-protected-resource'])assert.equal((await runtime.dispatchFetch(`${origin}${path}`,{headers:identityHeaders})).status,404);
  const owner=await call('get_profile');assert.equal(owner.role,'owner');
  const changedEmail=await runtime.dispatchFetch(`${origin}/mcp`,{method:'POST',headers:{...identityHeaders,'oai-authenticated-user-email':'new@example.test','oai-authenticated-user-full-name':'Optional name','content-type':'application/json',accept:'application/json','MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/call','Mcp-Name':'get_profile'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method:'tools/call',params:{name:'get_profile',arguments:{},_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}})});
  assert.equal((await changedEmail.json() as any).result.structuredContent.id,owner.id,'Email/name changes do not change the stable identity');
  await call('get_profile',{},'fixture-user');await call('get_profile',{},'fixture-user2');
  assert.equal((await call('get_profile',{},'fixture-user')).role,'user','Subsequent identities cannot become owner');
  const lecture=await call('admin_lecture_save',{title:'D1 smoke',description:'Syntetisk indhold',startsAt:Date.now()+86400000,endsAt:Date.now()+90000000,format:'online',region:'Danmark',location:'https://example.test/lecture',capacity:1,topics:[]});
  await call('admin_lecture_publish',{id:lecture.id,expectedVersion:lecture.version});
  const competing=await Promise.all(['fixture-user','fixture-user2'].map(subject=>rpc('lecture_register',{lectureId:lecture.id},subject)));
  assert.equal(competing.filter(r=>!r.isError).length,1,'Exactly one seat can be reserved');
  assert.equal(competing.filter(r=>r.structuredContent?.error?.code==='FULL').length,1);
  const winner=competing[0].isError?'fixture-user2':'fixture-user',loser=winner==='fixture-user'?'fixture-user2':'fixture-user';
  assert.equal((await call('my_registrations',{},winner)).items.length,1);assert.equal((await call('my_registrations',{},loser)).items.length,0);
  const node=await call('admin_knowledge_save',{slug:'smoke-topic',title:'Smoke-emne',summary:'Kildebaseret smoke',keywords:['smoke'],sources:[{url:'https://example.test/source',title:'Kilde'}]});
  const secondNode=await call('admin_knowledge_save',{slug:'second-smoke-topic',title:'Andet smoke-emne',summary:'Anden kildebaseret smoke',keywords:['smoke'],sources:[{url:'https://example.test/second-source',title:'Anden kilde'}]});
  await call('admin_knowledge_publish',{id:node.id,expectedVersion:node.version});
  await call('admin_knowledge_publish',{id:secondNode.id,expectedVersion:secondNode.version});
  assert.equal((await call('knowledge_search',{query:'smoke'},winner)).items.length,2);
  await call('update_preferences',{format:'online',topics:[node.id,secondNode.id],regions:['Danmark'],consent:true,expectedVersion:1},winner);
  assert.deepEqual((await call('get_profile',{},winner)).preferences.topics.sort(),[node.id,secondNode.id].sort());
  const eventCall=async(method:string,params:unknown)=>{
    const response=await runtime.dispatchFetch(`${origin}/mcp`,{method:'POST',headers:{'oai-authenticated-user-id':winner,'content-type':'application/json',accept:'application/json, text/event-stream','MCP-Protocol-Version':'2026-07-28','Mcp-Method':method},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params:{...(params as object),_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}})});
    assert.equal(response.status,200);const message=await response.json() as any;assert.equal(message.error,undefined,JSON.stringify(message));return message.result;
  };
  assert.ok(await eventCall('server/discover',{}),'Hosted stateless discovery succeeds');
  assert.ok((await eventCall('tools/list',{})).tools.length>0,'Hosted tools are discoverable');
  const subscription={name:'lecture.relevant_published',arguments:{format:'online'},delivery:{mode:'webhook',url:'https://callbacks.example.test/events',secret:eventSecret}};
  const subscribed=await eventCall('events/subscribe',subscription);assert.ok(subscribed.id);
  assert.equal((await eventCall('events/subscribe',subscription)).id,subscribed.id,'Refresh keeps subscription identity');
  const matching=await call('admin_lecture_save',{title:'D1 event smoke',description:'Syntetisk event',startsAt:Date.now()+86400000,endsAt:Date.now()+90000000,format:'online',region:'Danmark',location:'https://example.test/event',capacity:2,topics:[node.id]});
  await call('admin_lecture_publish',{id:matching.id,expectedVersion:matching.version});
  for(let n=0;n<50&&received.length===0;n++)await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(received.length,1,'A matching opt-in event is delivered');assert.equal(received[0].name,'lecture.relevant_published');
  const persistedKey=await db.prepare("SELECT secret_value FROM app_secrets WHERE name='event-encryption-key'").first() as {secret_value:string};
  assert.match(persistedKey.secret_value,/^[a-f0-9]{64}$/);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM app_secrets').first() as any).n,1);
  await eventCall('events/unsubscribe',{...subscription,delivery:{mode:'webhook',url:subscription.delivery.url}});
  const adapter=createD1Database(db as unknown as D1Database);
  await assert.rejects(adapter.transaction(async()=>{
    await adapter.prepare("INSERT INTO users(id,auth_subject,role,created_at) VALUES('rollback-fixture','rollback-fixture','user',0)").run();
    await adapter.prepare("INSERT INTO user_preferences(user_id) VALUES('missing-fixture')").run();
  }));
  assert.equal((await db.prepare("SELECT COUNT(*) n FROM users WHERE id='rollback-fixture'").first() as any).n,0,'A failed batch leaves no partial write');
  const oldVersion=await rpc('admin_lecture_publish',{id:lecture.id,expectedVersion:1});assert.equal(oldVersion.structuredContent.error.code,'VERSION_CONFLICT');
  const usage=await call('admin_usage_report',{from:Date.now()-3600000,to:Date.now()+3600000,groupBy:'tool'});assert.ok(usage.total>0);
  await call('lecture_unregister',{lectureId:lecture.id},winner);await call('delete_account',{confirm:true},winner);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM users WHERE auth_subject=?').bind(winner).first() as any).n,0);
  console.log('OK: bundled Worker + local D1, Sites user-id identity, missing/invalid identity and bearer-only rejection, stable subject across email changes, private-owner bootstrap, no custom login routes, account isolation, concurrent capacity, FTS knowledge, preferences, version conflicts, analytics, signed opt-in event delivery/refresh/unsubscribe, atomic rollback, unregister and deletion.');
} finally { await runtime.dispose(); }
