import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { startLocal } from '../server/local.js';
const hosting=JSON.parse(await readFile('.openai/hosting.json','utf8'));
assert.equal(hosting.project_id,'appgprj_6adb6ca4b9a0819187d043ebb4c091a5');
assert.equal(hosting.d1,'DB');
assert.equal(hosting.r2,null);
assert.ok(hosting.capabilities.includes('mcp'));
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
assert.equal(config.workers_dev,false);assert.equal(config.preview_urls,false);
assert.equal(config.routes,undefined);assert.equal(config.account_id,undefined);
assert.equal(config.d1_databases[0].binding,'DB');assert.equal(config.d1_databases[0].database_id,undefined);
const files=await readdir('dist/worker');
assert.ok(files.includes('worker.js'));assert.equal(files.filter(name=>name.endsWith('.txt')).length,2);
assert.equal(await readFile('db/migrations/0001_initial.sql','utf8'),await readFile('dist/migrations/0001_initial.sql','utf8'));

// Routing boundary check: the actual bundle must serve only informational GETs
// without identity or even a DB binding; protected calls must still fail closed.
const workerOptions=(supportUrl='')=>convertV4MiniflareOptions({
  modules:[{type:'ESModule',path:'dist/worker/worker.js'},...files.filter(name=>name.endsWith('.txt')).map(name=>({type:'Text' as const,path:`dist/worker/${name}`}))],
  compatibilityDate:'2026-10-24',compatibilityFlags:['nodejs_compat'],
  bindings:{SUPPORT_URL:supportUrl},
});
const runtime=new Miniflare(workerOptions());
const origin='https://hearing-union.ahaugedk.chatgpt.site';
const publicPaths=['/','/purpose','/privacy','/terms','/support'];
try {
  for(const path of publicPaths){
    const response=await runtime.dispatchFetch(`${origin}${path}`);
    assert.equal(response.status,200,`Anonymous informational GET ${path}`);
    assert.match(response.headers.get('content-type')??'',/^text\/html/);
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    assert.match(response.headers.get('content-security-policy')??'',/default-src 'none'/);
    const html=await response.text();
    assert.doesNotMatch(html,/mailto:mail@hoereforeningen\.dk/,'Unset support cannot imply an approved contact');
    if(path==='/support')assert.match(html,/Supportkontakt er endnu ikke bekræftet/);
  }
  for(const [path,method] of [['/health','GET'],['/mcp','POST'],['/privacy','POST'],['/unknown','GET'],['/internal/deliveries/drain','POST']]){
    assert.equal((await runtime.dispatchFetch(`${origin}${path}`,{method})).status,401,`Protected ${method} ${path}`);
  }
  assert.equal((await runtime.dispatchFetch('https://untrusted.example/privacy')).status,403);
  assert.equal((await runtime.dispatchFetch(`${origin}/privacy`,{headers:{origin:'https://untrusted.example'}})).status,403);
  await runtime.setOptions(workerOptions('javascript:unapproved()'));
  for(const path of ['/health','/mcp','/unknown'])assert.equal((await runtime.dispatchFetch(`${origin}${path}`)).status,401,'Invalid page config must not precede protected-route auth');
  for(const path of ['/privacy','/terms','/support'])assert.equal((await runtime.dispatchFetch(`${origin}${path}`)).status,503,'Invalid support configuration must fail honestly on informational pages');
} finally { await runtime.dispose(); }

const directory=await mkdtemp(join(tmpdir(),'hearing-union-pages-'));
let local:Awaited<ReturnType<typeof startLocal>>|undefined;
try {
  const authPath=join(directory,'auth.json');
  local=await startLocal({dbPath:join(directory,'data.sqlite'),authPath,port:0,supportUrl:''});
  const address=`http://127.0.0.1:${local.port}`;
  for(const path of publicPaths)assert.equal((await fetch(`${address}${path}`)).status,200);
  for(const [path,method] of [['/health','GET'],['/mcp','POST'],['/privacy','POST']])assert.equal((await fetch(`${address}${path}`,{method})).status,401);
  const auth=JSON.parse(await readFile(authPath,'utf8'));
  assert.equal((await fetch(`${address}/health`,{headers:{authorization:`Bearer ${auth.accounts[0].token}`}})).status,200);
} finally { await local?.close(); await rm(directory,{recursive:true,force:true}); }
console.log('OK: existing Sites/DB/migration, Worker + two MCP Apps, anonymous database-free informational GETs, protected MCP/health/writes and unchanged origin checks; no alternate public Worker route. Actual private ingress and later public accessibility remain publisher checks.');
