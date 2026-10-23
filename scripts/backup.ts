import { DatabaseSync } from 'node:sqlite';
import { chmodSync, closeSync, existsSync, openSync, realpathSync, rmSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function checkedDatabase(path: string): DatabaseSync {
  if (!statSync(path).isFile()) throw new Error('Source must be a regular SQLite file');
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const integrity = db.prepare('PRAGMA integrity_check').all() as Record<string, unknown>[];
    if (integrity.length !== 1 || integrity[0]?.integrity_check !== 'ok') throw new Error('Database integrity check failed');
    if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Database foreign key check failed');
    return db;
  } catch (error) { db.close(); throw error; }
}
function destinations(source: string, destination: string) {
  const from = realpathSync(source), to = resolve(destination);
  if (from === to || existsSync(to)) throw new Error('Destination must be a new file; existing files are never overwritten');
  return { from, to };
}
/** Consistent local SQLite snapshot, including committed WAL state. No reset or D1 claim. */
export function backupDatabase(source: string, destination: string) {
  const { from, to } = destinations(source, destination);
  const db = checkedDatabase(from);
  let created = false;
  try {
    const fd = openSync(to, 'wx', 0o600); closeSync(fd); created = true;
    db.prepare('VACUUM INTO ?').run(to);
    chmodSync(to, 0o600);
    const verified = checkedDatabase(to); verified.close();
  } catch (error) { if (created) rmSync(to, { force: true }); throw error; }
  finally { db.close(); }
}
/** Restore only into an explicit new local file, keeping the source and active DB untouched. */
export function restoreDatabase(source: string, destination: string) {
  // Snapshot rather than copying the main file: source may still have committed WAL pages.
  backupDatabase(source, destination);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command, source, destination, ...extra] = process.argv.slice(2);
  try {
    if (!source || !destination || extra.length || !['backup', 'restore'].includes(command ?? '')) throw new Error('Usage: backup.ts backup|restore source.sqlite new-destination.sqlite');
    if (command === 'backup') backupDatabase(source, destination); else restoreDatabase(source, destination);
    console.log(command === 'backup' ? 'Local SQLite backup verified.' : 'Local SQLite restore into new destination verified.');
  } catch {
    console.error('Backup/restore failed. Check arguments, new destination, database integrity, permissions and available disk space. No existing destination is overwritten.');
    process.exitCode = 1;
  }
}
