import { AsyncLocalStorage } from 'node:async_hooks';
export type SQLInputValue = string | number | null | bigint | Uint8Array;
export type Row = Record<string, any>;
export type Statement = { sql: string; params: SQLInputValue[] };
export interface SqlDriver {
  all(statement: Statement): Promise<Row[]>;
  batch(statements: Statement[]): Promise<void>;
}
type Unit = { revision: number; writes: Statement[] };
/** Reads are optimistic; every write commits in one guarded SQL batch. Callbacks must
 * only read and stage SQL, never perform network side effects or read staged writes.
 * Return a function when a response needs to read committed state. */
export class Database {
  private current = new AsyncLocalStorage<Unit>();
  constructor(private driver: SqlDriver) {}
  prepare(sql: string) {
    return {
      all: (...params: SQLInputValue[]) => this.driver.all({ sql, params }),
      get: async (...params: SQLInputValue[]) => (await this.driver.all({ sql, params }))[0],
      run: async (...params: SQLInputValue[]): Promise<void> => {
        const unit = this.current.getStore();
        if (unit) { unit.writes.push({ sql, params }); return; }
        await this.transaction(async () => { this.current.getStore()!.writes.push({ sql, params }); });
      },
    };
  }
  async transaction<T>(fn: () => Promise<T | (() => Promise<T>)>): Promise<T> {
    if (this.current.getStore()) throw new Error('Nested transactions are not supported');
    for (let attempt = 0; attempt < 8; attempt++) {
      const revision = Number((await this.prepare('SELECT revision FROM app_revision WHERE id=1').get())?.revision);
      if (!Number.isSafeInteger(revision)) throw new Error('Database schema has not been initialized');
      const unit: Unit = { revision, writes: [] };
      let result: T | (() => Promise<T>);
      try { result = await this.current.run(unit, fn); }
      catch (error) {
        const after = await this.prepare('SELECT revision FROM app_revision WHERE id=1').get();
        if (after?.revision !== revision) continue;
        throw error;
      }
      try {
        // The CHECK aborts the entire batch if any writer changed the read snapshot.
        // No interactive transaction statements are sent to D1.
        await this.driver.batch([
          { sql: 'INSERT INTO app_commit_guard(id,valid) VALUES(1,(SELECT revision=? FROM app_revision WHERE id=1)) ON CONFLICT(id) DO UPDATE SET valid=excluded.valid', params: [revision] },
          ...unit.writes,
          ...(unit.writes.length ? [{ sql: 'UPDATE app_revision SET revision=revision+1 WHERE id=1', params: [] }] : []),
        ]);
      } catch (error) {
        // Retry only the named guard failure. A transport failure may have
        // committed remotely; replaying it could duplicate an unknown write.
        if (!(error instanceof Error) || !error.message.includes('app_revision_conflict')) throw error;
        continue;
      }
      return typeof result === 'function' ? await (result as () => Promise<T>)() : result;
    }
    throw new Error('Database is busy; retry the request');
  }
}
