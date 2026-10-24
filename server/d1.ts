import type { D1Database } from '@cloudflare/workers-types';
import { Database, type Statement, type SqlDriver } from './storage.js';
/** A primary-first session prevents reads from preceding the revision read. */
export function createD1Database(binding: D1Database): Database {
  const session = binding.withSession('first-primary');
  const statement = (s: Statement) => session.prepare(s.sql).bind(...s.params);
  const driver: SqlDriver = {
    all: async s => (await statement(s).all()).results,
    batch: async statements => { await session.batch(statements.map(statement)); },
  };
  return new Database(driver);
}
