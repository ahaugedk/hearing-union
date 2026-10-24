import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startLocal } from '../server/local.js';

const directory = await mkdtemp(join(tmpdir(), 'hearing-union-smoke-'));
const config = { dbPath: join(directory, 'data.sqlite'), authPath: join(directory, 'auth.json'), port: 0 };
let runtime = await startLocal(config);
try {
  const homepage=await fetch(`http://127.0.0.1:${runtime.port}/`);
  assert.equal(homepage.status,200);
  const homepageHtml=await homepage.text();
  assert.match(homepageHtml,/endnu ikke klar til installation/);
  assert.ok(!homepageHtml.includes('<a '),'Missing installation URL must not produce a guessed link');
  const auth = JSON.parse(await readFile(config.authPath, 'utf8')) as {accounts: {name:string;token:string}[]};
  const token = (name:string) => auth.accounts.find(account => account.name === name)!.token;
  let requestId = 0;
  const rpc = async (method:string, params:unknown, account='owner') => {
    const response = await fetch(`http://127.0.0.1:${runtime.port}/mcp`, {
      method:'POST', headers:{'content-type':'application/json',accept:'application/json, text/event-stream',authorization:`Bearer ${token(account)}`,'MCP-Protocol-Version':'2026-07-28','Mcp-Method':method,...(method==='tools/call'?{'Mcp-Name':(params as {name:string}).name}:{})},
      body:JSON.stringify({jsonrpc:'2.0', id:++requestId,method,params:{...(params as object),_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}})
    });
    assert.equal(response.status,200,await response.clone().text());
    const text = await response.text();
    const message = response.headers.get('content-type')?.includes('text/event-stream')
      ? JSON.parse(text.split('\n').filter(line=>line.startsWith('data: ')).at(-1)!.slice(6)) : JSON.parse(text);
    assert.equal(message.error,undefined,JSON.stringify(message.error));
    return message.result;
  };
  const call = async (name:string,args:unknown={},account='owner') => {
    const result = await rpc('tools/call',{name,arguments:args},account);
    assert.ok(!result.isError,JSON.stringify(result));
    return result.structuredContent;
  };
  const denied = await fetch(`http://127.0.0.1:${runtime.port}/mcp`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  assert.equal(denied.status,401);
  const discovery=await rpc('server/discover',{});
  assert.ok(discovery);
  const profile=await call('get_profile',{},'user');
  assert.ok(profile);
  const ownerTools=await rpc('tools/list',{});
  assert.equal(ownerTools.tools.find((tool:{name:string})=>tool.name==='admin_lecture_publish').annotations.openWorldHint,true);
  const deliveryTool=ownerTools.tools.find((tool:{name:string})=>tool.name==='admin_deliver_events');
  assert.equal(deliveryTool.annotations.readOnlyHint,false);
  assert.equal(deliveryTool.annotations.destructiveHint,false);
  assert.equal(deliveryTool.annotations.openWorldHint,true);
  assert.deepEqual(await call('admin_deliver_events',{limit:1}),{sent:0,failed:0,skipped:0});
  const invalidBatch=await rpc('tools/call',{name:'admin_deliver_events',arguments:{limit:26}});
  assert.ok(invalidBatch.isError,'Delivery batch must be bounded');
  await call('owner_set_admin',{userId:profile.id,enabled:true});
  assert.deepEqual(await call('admin_deliver_events',{limit:25},'user'),{sent:0,failed:0,skipped:0});
  await call('owner_set_admin',{userId:profile.id,enabled:false});
  assert.ok(!(await rpc('tools/list',{},'user')).tools.some((tool:{name:string})=>tool.name==='admin_deliver_events'));
  const unauthorizedDrain=await fetch(`http://127.0.0.1:${runtime.port}/mcp`,{
    method:'POST',headers:{'content-type':'application/json',accept:'application/json',authorization:`Bearer ${token('user')}`,'MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/call','Mcp-Name':'admin_deliver_events'},
    body:JSON.stringify({jsonrpc:'2.0',id:++requestId,method:'tools/call',params:{name:'admin_deliver_events',arguments:{limit:1},_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}})
  });
  const unauthorizedResult=await unauthorizedDrain.json() as {error?:unknown;result?:{isError?:boolean}};
  assert.ok(unauthorizedResult.error || unauthorizedResult.result?.isError,'Ordinary user cannot drain deliveries');
  const lecture=await call('admin_lecture_save',{
    title:'Eksempelforedrag',description:'Syntetisk smoke-indhold',
    startsAt:new Date(Date.now()+86400000).toISOString(),endsAt:new Date(Date.now()+90000000).toISOString(),
    format:'online',region:'Danmark',location:'https://example.com/lecture',capacity:1,topics:[]
  });
  await call('admin_lecture_publish',{id:lecture.id,expectedVersion:lecture.version});
  await call('lecture_register',{lectureId:lecture.id},'user');
  const registrations=await call('my_registrations',{},'user');
  assert.ok(JSON.stringify(registrations).includes(lecture.id));
  const other=await call('my_registrations',{},'user2');
  assert.ok(!JSON.stringify(other).includes(lecture.id));
  await runtime.close();
  runtime=await startLocal(config);
  const restored=await call('my_registrations',{},'user');
  assert.ok(JSON.stringify(restored).includes(lecture.id),'Tilmelding skal overleve servergenstart');
  await call('lecture_unregister',{lectureId:lecture.id},'user');
  console.log('OK: autentificeret MCP, foredrag publiceret/tilmeldt/genfundet efter genstart, kontoisolation og afmelding.');
} finally {
  await runtime.close();
  await rm(directory,{recursive:true,force:true});
}
