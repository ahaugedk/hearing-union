import { createHash } from 'node:crypto';
import type { Database } from './storage.js';
/** Shared database state enforces limits across requests; never records subjects or IPs. */
export async function consumeRateLimit(db: Database, subject: string, options: {
    now?: number;
    limit?: number;
    windowMs?: number;
} = {}) {
    const now = options.now ?? Date.now(), limit = options.limit ?? 120, windowMs = options.windowMs ?? 60000;
    if (!subject || !Number.isSafeInteger(now) || now < 0 || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1000 || windowMs > 3600000) {
        throw new Error('Invalid rate-limit configuration');
    }
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const subjectHash = createHash('sha256').update(subject).digest('hex');
    return await db.transaction(async () => {
        await db.prepare('DELETE FROM request_rate_limits WHERE expires_at<=?').run(now);
        const row = await db.prepare('SELECT request_count FROM request_rate_limits WHERE subject_hash=? AND window_start=?').get(subjectHash, windowStart) as {
            request_count: number;
        } | undefined;
        const allowed = !row || row.request_count < limit;
        if (allowed)
            await db.prepare(`INSERT INTO request_rate_limits(subject_hash,window_start,expires_at,request_count) VALUES(?,?,?,1)
      ON CONFLICT(subject_hash,window_start) DO UPDATE SET request_count=request_count+1`).run(subjectHash, windowStart, windowStart + windowMs);
        return { allowed, retryAfterSeconds: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)) };
    });
}
