import { createHash } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

/** Shared SQLite state enforces limits across local processes; never records subjects or IPs. */
export function consumeRateLimit(db: DatabaseSync, subject: string, options: { now?: number; limit?: number; windowMs?: number } = {}) {
  const now = options.now ?? Date.now(), limit = options.limit ?? 120, windowMs = options.windowMs ?? 60000;
  if (!subject || !Number.isSafeInteger(now) || now < 0 || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1000 || windowMs > 3600000) {
    throw new Error('Invalid rate-limit configuration');
  }
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const subjectHash = createHash('sha256').update(subject).digest('hex');
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM request_rate_limits WHERE expires_at<=?').run(now);
    const row = db.prepare('SELECT request_count FROM request_rate_limits WHERE subject_hash=? AND window_start=?').get(subjectHash, windowStart) as { request_count: number } | undefined;
    const allowed = !row || row.request_count < limit;
    if (allowed) db.prepare(`INSERT INTO request_rate_limits(subject_hash,window_start,expires_at,request_count) VALUES(?,?,?,1)
      ON CONFLICT(subject_hash,window_start) DO UPDATE SET request_count=request_count+1`).run(subjectHash, windowStart, windowStart + windowMs);
    db.exec('COMMIT');
    return { allowed, retryAfterSeconds: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)) };
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
