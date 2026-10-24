import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
const tsx=resolve('node_modules/.bin/tsx');
const archive=resolve('dist/hearing-union-deployment.tar.gz');
execFileSync(tsx,['scripts/pack.ts']);
const first=await readFile(archive);
execFileSync(tsx,['scripts/pack.ts']);
assert.deepEqual(await readFile(archive),first,'Deployment archives must be byte-identical');
const entries=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).trim().split('\n');
for(const path of entries)assert.ok(/^(wrangler\.json|\.openai\/hosting\.json|plugin\.json|DEPLOYMENT\.md|knowledge\.json|worker\/.*|db\/.*)$/.test(path),`Unexpected packaged file: ${path}`);
assert.ok(entries.includes('db/migrations/0001_initial.sql'));
assert.ok(!entries.includes('worker/README.md'),'Exclude Wrangler’s timestamped informational file');
const directory=await mkdtemp(join(tmpdir(),'hearing-union-package-'));
try {
  execFileSync('tar',['-xzf',archive,'-C',directory]);
  assert.deepEqual(JSON.parse(await readFile(join(directory,'.openai/hosting.json'),'utf8')),JSON.parse(await readFile('.openai/hosting.json','utf8')));
  const output=execFileSync(resolve('node_modules/.bin/wrangler'),['deploy','--dry-run','--config',join(directory,'wrangler.json'),'--outdir',join(directory,'validated')],{encoding:'utf8',maxBuffer:8*1024*1024});
  assert.match(output,/--dry-run: exiting now/);
  console.log('OK: byte-identical archives, expected files only, existing project/DB binding and migration, unpacked Worker dry-run; no deployment.');
} finally { await rm(directory,{recursive:true,force:true}); }
