import { randomBytes } from 'node:crypto';
import type { Database } from './storage.js';
/** A per-installation key persists across Worker restarts. D1 access and exports
 * must be protected: a full database backup contains both key and ciphertext. */
export async function eventEncryptionKey(db: Database): Promise<Buffer> {
  return db.transaction(async()=>{
    const existing=await db.prepare("SELECT secret_value FROM app_secrets WHERE name='event-encryption-key'").get();
    if(existing) {
      if(!/^[a-f0-9]{64}$/.test(existing.secret_value))throw new Error('Invalid stored event key');
      return Buffer.from(existing.secret_value,'hex');
    }
    if(await db.prepare("SELECT 1 FROM event_subscriptions WHERE secret_ciphertext<>'' OR old_secret_ciphertext IS NOT NULL LIMIT 1").get())throw new Error('Restore the original event key before opening existing subscriptions');
    const key=randomBytes(32);
    await db.prepare("INSERT INTO app_secrets(name,secret_value) VALUES('event-encryption-key',?)").run(key.toString('hex'));
    return key;
  });
}
