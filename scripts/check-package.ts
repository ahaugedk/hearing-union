import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
const archive=resolve('dist/hearing-union-deployment.tar.gz');
execFileSync(process.execPath,['--import','tsx','scripts/pack.ts']);
const first=await readFile(archive);
execFileSync(process.execPath,['--import','tsx','scripts/pack.ts']);
assert.deepEqual(await readFile(archive),first,'Deployment archives must be byte-identical');
const entries=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).trim().split('\n');
for(const path of entries)assert.ok(/^dist\/(wrangler\.json|\.openai\/(?:hosting\.json|drizzle\/.*)|plugin\.json|assets\/review-icons\/(?:logo|composer-icon)\.png|DEPLOYMENT\.md|knowledge\.json|server\/.*|db\/.*)$/.test(path),`Unexpected packaged file: ${path}`);
assert.ok(entries.includes('dist/.openai/hosting.json'),'Sites requires the manifest under the dist archive root');
assert.ok(entries.includes('dist/db/migrations/0001_initial.sql'));
assert.ok(entries.includes('dist/.openai/drizzle/0001_initial.sql'),'Sites migration sidecar is required');
assert.ok(entries.includes('dist/.openai/drizzle/meta/_journal.json'),'Sites migration journal is required');
assert.ok(entries.includes('dist/server/index.js'),'Sites requires a supported server entrypoint');
assert.ok(!entries.some(path=>path.endsWith('/README.md')),'Exclude Wrangler’s timestamped informational file');
const directory=await mkdtemp(join(tmpdir(),'hearing-union-package-'));
try {
  execFileSync('tar',['-xzf',archive,'-C',directory]);
  assert.deepEqual(JSON.parse(await readFile(join(directory,'dist/.openai/hosting.json'),'utf8')),JSON.parse(await readFile('.openai/hosting.json','utf8')));
  assert.deepEqual(await readFile(join(directory,'dist/server/index.js')),await readFile('dist/worker/worker.js'),'Sites entrypoint must contain the validated Worker bytes');
  const metadata=JSON.parse(await readFile(join(directory,'dist/plugin.json'),'utf8'));
  const openai=metadata.extensions['com.openai'];
  assert.equal(metadata.name,'hearing-union');
  assert.match(metadata.version,/^\d+\.\d+\.\d+$/);
  assert.equal(openai.interface.category,'Education & Research');
  assert.ok(openai.interface.shortDescription.length<=30);
  for(const [field,minimum] of [['logo',256],['composerIcon',48]] as const){
    const path=openai.interface[field];
    assert.equal(typeof path,'string');
    assert.ok(!path.startsWith('/')&&!path.split('/').some((part:string)=>part==='..'),'Icon paths must stay inside the archive');
    const png=await readFile(join(directory,'dist',path));
    assert.deepEqual(png.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]),'Review icons must be actual PNGs');
    assert.equal(png.subarray(12,16).toString(),'IHDR');
    const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
    assert.ok(width===height&&width>=minimum&&width<=4096,'Review icon dimensions must satisfy submission bounds');
    assert.ok(png.length<=5*1024*1024);
    assert.deepEqual(png,await readFile(path),'Archive must preserve the official-source icon bytes');
  }
  const cases=openai.review.test_cases;
  assert.equal(cases.positive.length,5);
  assert.equal(cases.negative.length,3);
  for(const item of [...cases.positive,...cases.negative]){
    assert.ok(typeof item.description==='string'&&item.description.trim());
    assert.ok(typeof item.prompt==='string'&&item.prompt.trim());
  }
  for(const item of cases.positive){
    assert.ok(typeof item.tools_triggered==='string'&&item.tools_triggered.trim());
    assert.ok(typeof item.expected_behavior==='string'&&item.expected_behavior.trim());
  }
  for(const item of cases.negative)assert.deepEqual(Object.keys(item).sort(),['description','prompt']);
  const journal=JSON.parse(await readFile(join(directory,'dist/.openai/drizzle/meta/_journal.json'),'utf8'));
  assert.equal(journal.dialect,'sqlite');
  assert.deepEqual(journal.entries.map((entry:{tag:string})=>entry.tag),['0001_initial']);
  const hostedMigration=await readFile(join(directory,'dist/.openai/drizzle/0001_initial.sql'),'utf8');
  const canonicalMigration=await readFile('db/migrations/0001_initial.sql','utf8');
  const normalize=(sql:string)=>sql.replace(/\s+/g,' ').trim();
  assert.equal(normalize(hostedMigration.replaceAll('--> statement-breakpoint','')),normalize(canonicalMigration),'Hosted migration must preserve the canonical schema');
  const output=execFileSync(resolve('node_modules/.bin/wrangler'),['deploy','--dry-run','--config',join(directory,'dist/wrangler.json'),'--outdir',join(directory,'validated')],{encoding:'utf8',maxBuffer:8*1024*1024});
  assert.match(output,/--dry-run: exiting now/);
  console.log('OK: byte-identical archives, expected files only, existing project/DB binding and migration, unpacked Worker dry-run and contained official PNG review assets/cases; draft metadata is not submission readiness. No deployment.');
} finally { await rm(directory,{recursive:true,force:true}); }
