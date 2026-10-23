import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, lstatSync, openSync, closeSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Local SQLite runtime. Sites/D1 activation remains a separate deployment task. */
export function createDatabase(path: string): DatabaseSync {
  if (path !== ':memory:') {
    if (!existsSync(path)) closeSync(openSync(path, 'wx', 0o600));
    if (!lstatSync(path).isFile()) throw new Error('Database must be a regular file, not a symbolic link.');
    chmodSync(path, 0o600);
  }
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  db.exec(readFileSync(fileURLToPath(new URL('../db/schema.sql', import.meta.url)), 'utf8'));
  for (const name of ['events.sql','operations.sql']) db.exec(readFileSync(fileURLToPath(new URL(`../db/${name}`, import.meta.url)), 'utf8'));
  const columns = db.prepare('PRAGMA table_info(usage_daily)').all() as {name:string}[];
  if (!columns.some(column => column.name === 'outcome')) { db.close(); throw new Error('Pre-v1 development schema changed. Back up the selected local database and explicitly reset it before startup.'); }
  return db;
}
