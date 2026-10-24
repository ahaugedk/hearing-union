import { mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist/migrations',{recursive:true});
const schema=await Promise.all(['schema','events','operations','concurrency','runtime'].map(name=>readFile(`db/${name}.sql`,'utf8')));
const migration='-- Generated from db/*.sql before first production v1. Do not edit.\n'+schema.join('\n').replace(/PRAGMA foreign_keys\s*=\s*ON;/gi,'');
if(process.argv.includes('--write'))await writeFile('db/migrations/0001_initial.sql',migration);
if(await readFile('db/migrations/0001_initial.sql','utf8')!==migration)throw new Error('Regenerate db/migrations/0001_initial.sql from db/*.sql before building');
await writeFile('dist/migrations/0001_initial.sql',migration);
