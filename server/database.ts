import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Local SQLite runtime. Sites/D1 activation remains a separate deployment task. */
export function createDatabase(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  db.exec(readFileSync(fileURLToPath(new URL('../db/schema.sql', import.meta.url)), 'utf8'));
  return db;
}
