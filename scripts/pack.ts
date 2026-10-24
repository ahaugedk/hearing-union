import { readFile, writeFile, copyFile, mkdir, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
delete config.$schema;
config.main='worker/worker.js';config.d1_databases[0].migrations_dir='db/migrations';
// Preserve a configuration completed by check:deployment until the next build.
try { await readFile('dist/wrangler.json'); } catch { await writeFile('dist/wrangler.json',JSON.stringify(config,null,2)+'\n'); }
await mkdir('dist/db/migrations',{recursive:true});
await copyFile('db/migrations/0001_initial.sql','dist/db/migrations/0001_initial.sql');
await copyFile('data/knowledge.json','dist/knowledge.json');
await mkdir('dist/.openai',{recursive:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await copyFile('release/plugin.json','dist/plugin.json');
await copyFile('release/README.md','dist/DEPLOYMENT.md');
const files=await readdir('dist/worker');
if(!files.includes('worker.js')||files.filter(f=>f.endsWith('.txt')).length!==2)throw new Error('Run build before pack');
const entries=['wrangler.json','.openai/hosting.json','plugin.json','DEPLOYMENT.md','worker','db','knowledge.json'];
execFileSync('tar',['-czf','dist/hearing-union-deployment.tar.gz','-C','dist',...entries]);
const archive=await readFile('dist/hearing-union-deployment.tar.gz');
console.log(`Packed dist/hearing-union-deployment.tar.gz (${archive.byteLength} bytes, SHA-256 ${createHash('sha256').update(archive).digest('hex')}). No local database, development tokens or Worker secrets included.`);
