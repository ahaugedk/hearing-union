import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
await mkdir('dist/migrations',{recursive:true});
const schema=await Promise.all(['schema','events','operations','concurrency','runtime'].map(name=>readFile(`db/${name}.sql`,'utf8')));
const migration='-- Generated from db/*.sql before first production v1. Do not edit.\n'+schema.join('\n').replace(/PRAGMA foreign_keys\s*=\s*ON;/gi,'');
if(process.argv.includes('--write'))await writeFile('db/migrations/0001_initial.sql',migration);
if(await readFile('db/migrations/0001_initial.sql','utf8')!==migration)throw new Error('Regenerate db/migrations/0001_initial.sql from db/*.sql before building');
await writeFile('dist/migrations/0001_initial.sql',migration);
// Sites discovers hosted migrations beside hosting.json, using Drizzle's journal.
// Keep complete trigger bodies in one statement while marking D1 batch boundaries.
const statements=migration.match(/\s*CREATE TRIGGER[\s\S]*?\bEND;|[^;]+;/g)??[];
if(statements.join('').trim()!==migration.trim())throw new Error('Incomplete migration statement parsing');
await rm('dist/.openai/drizzle',{recursive:true,force:true});
await mkdir('dist/.openai/drizzle/meta',{recursive:true});
await writeFile('dist/.openai/drizzle/0001_initial.sql',statements.map(sql=>sql.trim()).join('\n--> statement-breakpoint\n')+'\n');
await writeFile('dist/.openai/drizzle/meta/_journal.json',await readFile('db/migrations/meta/_journal.json','utf8'));
