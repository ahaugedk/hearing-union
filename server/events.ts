import { createHash, randomBytes, randomUUID, timingSafeEqual, webcrypto } from 'node:crypto';
import type { Database, SQLInputValue } from './storage.js';
import { subscribeSchema, unsubscribeSchema, lecturePublishedEvent, type SubscribeParams, type UnsubscribeParams } from '../contracts/events.js';
import { DomainError } from './domain.js';
import { callbackUrl, decodeSigningSecret, secureWebhook, signWebhook, type WebhookTransport } from './webhook.js';
import { recordUsage } from './analytics.js';
export type { SubscribeParams, UnsubscribeParams } from '../contracts/events.js';
type Row = Record<string, any>;
const DAY = 86400000, LEASE = 30000, ROTATION = 300000, MAX_ATTEMPTS = 8;
function time(n: number) { if (!Number.isSafeInteger(n) || n < 0 || n > 8.64e15 - DAY)
    throw new DomainError('INVALID_INPUT', 'Ugyldigt tidspunkt.'); return n; }
export class CallbackEndpointError extends DomainError {
    reason: string;
    constructor(reason: string) { super('CALLBACK_ENDPOINT_ERROR', 'Callback kunne ikke verificeres.'); this.reason = reason; }
}
function parse<T>(schema: {
    safeParse: (x: unknown) => {
        success: boolean;
        data?: T;
    };
}, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success)
        throw new DomainError('INVALID_INPUT', 'Ugyldige eventargumenter.');
    return result.data!;
}
function canonicalArguments(a: SubscribeParams['arguments']) {
    return { format: a?.format ?? 'any', regions: [...new Set(a?.regions ?? [])].sort(), topicIds: [...new Set(a?.topicIds ?? [])].sort() };
}
function identity(userId: string, url: string, args: string) { return 'sub_' + createHash('sha256').update(JSON.stringify([userId, url, 'lecture.relevant_published', args])).digest('hex'); }
/** Persistent delivery service shared by the local adapter and the scheduled Worker. */
export class EventService {
    private db: Database;
    private webhook: WebhookTransport;
    private key: Promise<webcrypto.CryptoKey>;
    constructor(db: Database, options: {
        encryptionKey: Uint8Array;
        webhook?: WebhookTransport;
    }) {
        if (options.encryptionKey.length !== 32)
            throw new Error('Events encryption key must contain 32 bytes.');
        this.db = db;
        this.webhook = options.webhook ?? secureWebhook;
        this.key = webcrypto.subtle.importKey('raw', new Uint8Array(options.encryptionKey), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    }
    private async get(sql: string, ...p: SQLInputValue[]): Promise<Row | undefined> { return await this.db.prepare(sql).get(...p) as Row | undefined; }
    private async all(sql: string, ...p: SQLInputValue[]): Promise<Row[]> { return await this.db.prepare(sql).all(...p) as Row[]; }
    private async run(sql: string, ...p: SQLInputValue[]) { return await this.db.prepare(sql).run(...p); }
    private async transaction<T>(fn: () => Promise<T>): Promise<T> { return await this.db.transaction(fn); }
    private async user(id: string) { if (!await this.get('SELECT id FROM users WHERE id=?', id))
        throw new DomainError('FORBIDDEN', 'Kontoen findes ikke længere.'); }
    private async encrypt(secret: string, id: string) { const iv = randomBytes(12); const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: Buffer.from(id) }, await this.key, Buffer.from(secret)); return Buffer.concat([iv, Buffer.from(encrypted)]).toString('base64'); }
    private async decrypt(value: string, id: string) { const data = Buffer.from(value, 'base64'); return Buffer.from(await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: data.subarray(0, 12), additionalData: Buffer.from(id) }, await this.key, data.subarray(12))).toString('utf8'); }
    async verifyEncryptionKey(): Promise<void> {
        const row = await this.get("SELECT id,secret_ciphertext,old_secret_ciphertext FROM event_subscriptions WHERE secret_ciphertext<>'' OR (old_secret_ciphertext IS NOT NULL AND old_secret_ciphertext<>'') LIMIT 1");
        if (!row)
            return;
        try {
            if (row.secret_ciphertext)
                await this.decrypt(row.secret_ciphertext, row.id);
            if (row.old_secret_ciphertext)
                await this.decrypt(row.old_secret_ciphertext, row.id);
        }
        catch {
            throw new Error('Eventkrypteringsnøglen kan ikke åbne de gemte abonnementer. Gendan den korrekte nøgle før opstart.');
        }
    }
    list() { return { events: [lecturePublishedEvent] }; }
    async subscribe(userId: string, input: SubscribeParams, now = Date.now()) {
        time(now);
        const began = performance.now(), currentTime = () => now + Math.floor(performance.now() - began);
        await this.user(userId);
        const params = parse<SubscribeParams>(subscribeSchema, input);
        decodeSigningSecret(params.delivery.secret);
        const url = callbackUrl(params.delivery.url).href;
        const args = JSON.stringify(canonicalArguments(params.arguments)), id = identity(userId, url, args);
        const ttl = Math.max(60000, Math.min(params.ttlMs ?? DAY, DAY));
        // A refresh candidate does not alter active delivery state until callback verification succeeds.
        const operation = await this.transaction(async () => {
            await this.user(userId);
            const previous = await this.get('SELECT * FROM event_subscriptions WHERE id=?', id);
            if (!previous)
                await this.run(`INSERT INTO event_subscriptions(id,user_id,event_name,arguments_json,callback_url,secret_ciphertext,status,generation,operation_generation,activated_at,start_outbox_rowid,expires_at) VALUES(?,?,'lecture.relevant_published',?,?,'','verifying',0,1,?,0,?)`, id, userId, args, url, currentTime(), currentTime() + ttl);
            else
                await this.run('UPDATE event_subscriptions SET operation_generation=operation_generation+1 WHERE id=?', id);
            return (previous?.operation_generation??0)+1;
        });
        const cacheId = createHash('sha256').update(JSON.stringify([userId, url, params.delivery.secret])).digest('hex');
        const authorized = async () => {
            await this.user(userId);
            const current = await this.get('SELECT operation_generation FROM event_subscriptions WHERE id=?', id);
            if (!current || current.operation_generation !== operation)
                throw new DomainError('VERSION_CONFLICT', 'Abonnementet blev ændret under verifikation.');
            if (currentTime() - now > 15000)
                throw new CallbackEndpointError('timeout');
        };
        try {
            const encrypted = await this.encrypt(params.delivery.secret, id);
            await authorized();
            const cached = await this.get('SELECT 1 FROM event_callback_verifications WHERE cache_id=? AND expires_at>?', cacheId, currentTime());
            if (!cached) {
                const challenge = randomBytes(32).toString('base64url'), body = JSON.stringify({ type: 'verification', challenge }), verificationId = 'msg_verification_' + randomUUID();
                const response = await this.webhook(url, body, { ...signWebhook(params.delivery.secret, verificationId, body, currentTime()), 'X-MCP-Subscription-Id': id }, authorized);
                await authorized();
                let echoed: unknown;
                try {
                    echoed = JSON.parse(response.body).challenge;
                }
                catch {
                    throw new CallbackEndpointError('challenge_failed');
                }
                if (response.status < 200 || response.status >= 300 || typeof echoed !== 'string' || Buffer.byteLength(echoed) !== Buffer.byteLength(challenge) || !timingSafeEqual(Buffer.from(echoed), Buffer.from(challenge)))
                    throw new CallbackEndpointError('challenge_failed');
            }
            await authorized();
            const previous = (await this.get('SELECT * FROM event_subscriptions WHERE id=?', id))!;
            const continuation = previous.status === 'active' && previous.expires_at > currentTime();
            const oldSecret = continuation ? await this.decrypt(previous.secret_ciphertext, id) : undefined;
            const rotating = oldSecret !== undefined && oldSecret !== params.delivery.secret;
            const expiry = await this.transaction(async () => {
                await authorized();
                const current = (await this.get('SELECT * FROM event_subscriptions WHERE id=?', id))!;
                if (current.generation !== previous.generation)
                    throw new DomainError('VERSION_CONFLICT', 'Abonnementet er ændret.');
                const at = currentTime(), expires = Math.min(8.64e15, at + ttl), next = current.generation + 1;
                const continued = continuation && current.expires_at > at;
                const start = continued ? current.start_outbox_rowid : (await this.get('SELECT COALESCE(MAX(rowid),0) n FROM outbox_events'))!.n;
                await this.run(`UPDATE event_subscriptions SET secret_ciphertext=?,old_secret_ciphertext=?,rotation_until=?,status='active',generation=?,activated_at=?,start_outbox_rowid=?,expires_at=? WHERE id=?`, encrypted, continued ? (rotating ? current.secret_ciphertext : current.old_secret_ciphertext) : null, continued ? (rotating ? at + ROTATION : current.rotation_until) : null, next, continued ? current.activated_at : at, start, expires, id);
                if (continued)
                    await this.run("UPDATE event_deliveries SET generation=? WHERE subscription_id=? AND status IN ('pending','sending')", next, id);
                if (!cached)
                    await this.run('INSERT INTO event_callback_verifications(cache_id,user_id,expires_at) VALUES(?,?,?) ON CONFLICT(cache_id) DO UPDATE SET expires_at=excluded.expires_at', cacheId, userId, at + ROTATION);
                await this.run('DELETE FROM event_callback_verifications WHERE expires_at<=?', at);
                return expires;
            });
            return { id, refreshBefore: new Date(expiry).toISOString(), cursor: null, truncated: false };
        }
        catch (error) {
            // Failed refresh keeps an existing active subscription and its current key intact.
            await this.run("UPDATE event_subscriptions SET status='failed',secret_ciphertext='' WHERE id=? AND operation_generation=? AND status='verifying'", id, operation);
            if (error instanceof DomainError && ['FORBIDDEN', 'VERSION_CONFLICT'].includes(error.code))
                throw error;
            if (error instanceof CallbackEndpointError)
                throw error;
            throw new CallbackEndpointError(error instanceof DomainError && error.code === 'CALLBACK_TIMEOUT' ? 'timeout' : 'challenge_failed');
        }
    }
    async unsubscribe(userId: string, input: UnsubscribeParams, now = Date.now()) {
        time(now);
        await this.user(userId);
        const p = parse<UnsubscribeParams>(unsubscribeSchema, input), url = callbackUrl(p.delivery.url).href, args = JSON.stringify(canonicalArguments(p.arguments)), id = identity(userId, url, args);
        await this.transaction(async () => {
            await this.run("UPDATE event_subscriptions SET status='inactive',generation=generation+1,operation_generation=operation_generation+1,secret_ciphertext='',old_secret_ciphertext=NULL,rotation_until=NULL WHERE id=? AND user_id=?", id, userId);
            await this.run("UPDATE event_deliveries SET status='skipped',lease_token=NULL,lease_until=NULL,error_code='UNSUBSCRIBED' WHERE subscription_id=? AND status IN ('pending','sending')", id);
        });
        return {};
    }
    private async preferenceBatch(userIds: string[]): Promise<Map<string,Row>> {
        if(userIds.length>90)return new Map([...await this.preferenceBatch(userIds.slice(0,90)),...await this.preferenceBatch(userIds.slice(90))]);
        const unique = [...new Set(userIds)];
        if (!unique.length)
            return new Map<string, Row>();
        const marks = unique.map(() => '?').join(',');
        const map = new Map((await this.all(`SELECT user_id,format FROM user_preferences WHERE user_id IN (${marks})`, ...unique)).map(p => [p.user_id, { format: p.format, topics: [] as string[], regions: [] as string[] }]));
        for (const t of await this.all(`SELECT user_id,topic_id FROM user_topic_preferences WHERE user_id IN (${marks})`, ...unique))
            (map.get(t.user_id))?.topics.push(t.topic_id);
        for (const r of await this.all(`SELECT user_id,region FROM user_region_preferences WHERE user_id IN (${marks})`, ...unique))
            (map.get(r.user_id))?.regions.push(r.region);
        return map;
    }
    private matches(lecture: Row, topics: string[], args: Row, prefs: Row | undefined) {
        if (!prefs)
            return false;
        for (const filter of [args, prefs]) {
            const requestedTopics: string[] = filter.topicIds ?? filter.topics ?? [], regions: string[] = filter.regions ?? [];
            if (filter.format && filter.format !== 'any' && filter.format !== lecture.format)
                return false;
            if (requestedTopics.length && !topics.some(t => requestedTopics.includes(t)))
                return false;
            if (lecture.format !== 'online' && regions.length && !regions.includes(lecture.region))
                return false;
        }
        return true;
    }
    private async fanout(now: number, budget: number) {
        // Each drain advances one bounded page, with a persisted cursor per outbox event.
        await this.transaction(async () => {
            let event = await this.get(`SELECT e.*,e.rowid outbox_rowid,f.last_subscription_id FROM event_fanout f JOIN outbox_events e ON e.id=f.event_id WHERE f.complete=0 ORDER BY e.rowid LIMIT 1`);
            if (!event) {
                const cursor = (await this.get('SELECT last_outbox_rowid FROM event_fanout_state WHERE id=1'))!.last_outbox_rowid;
                event = await this.get("SELECT *,rowid outbox_rowid,'' last_subscription_id FROM outbox_events WHERE rowid>? ORDER BY rowid LIMIT 1", cursor);
                if (event)
                    await this.run('UPDATE event_fanout_state SET last_outbox_rowid=? WHERE id=1', event.outbox_rowid);
            }
            if (!event)
                return;
            const lecture = await this.get('SELECT * FROM lectures WHERE id=?', event.lecture_id);
            await this.run('INSERT OR IGNORE INTO event_fanout(event_id) VALUES(?)', event.id);
            if (event.event_name !== 'lecture.relevant_published' || !lecture || lecture.status !== 'published' || lecture.version !== event.lecture_version || lecture.starts_at <= now) {
                await this.run('UPDATE event_fanout SET complete=1 WHERE event_id=?', event.id);
                return;
            }
            const subscriptions = await this.all("SELECT s.* FROM event_subscriptions s JOIN users u ON u.id=s.user_id WHERE s.id>? AND s.status='active' AND s.expires_at>? AND s.start_outbox_rowid<? ORDER BY s.id LIMIT ?", event.last_subscription_id, now, event.outbox_rowid, budget);
            const topics = (await this.all('SELECT topic_id FROM lecture_topics WHERE lecture_id=?', lecture.id)).map(r => r.topic_id), prefs = await this.preferenceBatch(subscriptions.map(s => s.user_id));
            let lastId = event.last_subscription_id;
            for (const sub of subscriptions) {
                if (this.matches(lecture, topics, JSON.parse(sub.arguments_json), prefs.get(sub.user_id)))
                    await this.run("INSERT OR IGNORE INTO event_deliveries(event_id,subscription_id,generation,status,next_attempt_at) VALUES(?,?,?,'pending',?)", event.id, sub.id, sub.generation, now);
                lastId = sub.id;
            }
            if (lastId !== event.last_subscription_id)
                await this.run('UPDATE event_fanout SET last_subscription_id=? WHERE event_id=?', lastId, event.id);
            if (subscriptions.length < budget)
                await this.run('UPDATE event_fanout SET complete=1 WHERE event_id=?', event.id);
        });
    }
    private async deliveryState(eventId: string, subscriptionId: string) {
        return await this.get(`SELECT d.*,s.user_id,s.callback_url,s.secret_ciphertext,s.old_secret_ciphertext,s.rotation_until,s.status subscription_status,s.generation subscription_generation,s.expires_at,s.arguments_json,
 e.lecture_id,e.lecture_version,e.created_at event_created_at,l.title,l.description,l.status lecture_status,l.version current_version,l.format,l.region,l.starts_at
 FROM event_deliveries d JOIN event_subscriptions s ON s.id=d.subscription_id JOIN users u ON u.id=s.user_id JOIN outbox_events e ON e.id=d.event_id JOIN lectures l ON l.id=e.lecture_id WHERE d.event_id=? AND d.subscription_id=?`, eventId, subscriptionId);
    }
    private async canSend(row: Row | undefined, now: number) {
        if (!row || row.subscription_status !== 'active' || row.expires_at <= now || row.generation !== row.subscription_generation || row.lecture_status !== 'published' || row.current_version !== row.lecture_version || row.starts_at <= now)
            return false;
        const prefs = (await this.preferenceBatch([row.user_id])).get(row.user_id), topics = (await this.all('SELECT topic_id FROM lecture_topics WHERE lecture_id=?', row.lecture_id)).map(r => r.topic_id);
        return this.matches(row, topics, JSON.parse(row.arguments_json), prefs);
    }
    async drain(now = Date.now(), limit = 25) {
        time(now);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100)
            throw new DomainError('INVALID_INPUT', 'Ugyldig leveringsgrænse.');
        const initialNow = now, drainStarted = performance.now(), fresh = () => initialNow + Math.floor(performance.now() - drainStarted);
        await this.fanout(fresh(), Math.min(limit * 10, 500));
        // Old encryption keys are removed after the bounded dual-signature period.
        await this.run('UPDATE event_subscriptions SET old_secret_ciphertext=NULL,rotation_until=NULL WHERE rotation_until<=?', now);
        const due = await this.all("SELECT event_id,subscription_id FROM event_deliveries WHERE (status='pending' AND next_attempt_at<=?) OR (status='sending' AND lease_until<=?) ORDER BY next_attempt_at,event_id,subscription_id LIMIT ?", now, now, limit);
        const result = { sent: 0, failed: 0, skipped: 0 };
        for (const item of due) {
            now = fresh();
            const token = randomUUID();
            const claimed = await this.transaction(async () => {
                const row = await this.deliveryState(item.event_id, item.subscription_id);
                if (row && row.attempts >= MAX_ATTEMPTS) {
                    await this.run("UPDATE event_deliveries SET status='failed',error_code='ATTEMPTS_EXHAUSTED',lease_token=NULL,lease_until=NULL WHERE event_id=? AND subscription_id=? AND ((status='pending' AND next_attempt_at<=?) OR(status='sending' AND lease_until<=?))", item.event_id, item.subscription_id, now, now);
                    return false;
                }
                if (!await this.canSend(row, now)) {
                    await this.run("UPDATE event_deliveries SET status='skipped',error_code='NO_LONGER_RELEVANT',lease_token=NULL,lease_until=NULL WHERE event_id=? AND subscription_id=? AND status IN ('pending','sending')", item.event_id, item.subscription_id);
                    return false;
                }
                if (!(row && ((row.status==='pending' && row.next_attempt_at<=now) || (row.status==='sending' && row.lease_until<=now)))) return false;
                await this.run("UPDATE event_deliveries SET status='sending',attempts=attempts+1,lease_token=?,lease_until=? WHERE event_id=? AND subscription_id=? AND ((status='pending' AND next_attempt_at<=?) OR(status='sending' AND lease_until<=?))", token, now + LEASE, item.event_id, item.subscription_id, now, now);
                return true;
            });
            if (!claimed) {
                result.skipped++;
                continue;
            }
            let row = (await this.deliveryState(item.event_id, item.subscription_id))!;
            const claimedGeneration = row.generation, claimedCiphertext = row.secret_ciphertext;
            try {
                const secret = await this.decrypt(row.secret_ciphertext, row.subscription_id), oldSecret = row.old_secret_ciphertext && row.rotation_until > now ? await this.decrypt(row.old_secret_ciphertext, row.subscription_id) : undefined;
                // Re-read after asynchronous crypto: deletion, unsubscribe or preference changes may have happened.
                now = fresh();
                row = (await this.deliveryState(item.event_id, item.subscription_id))!;
                if (row?.subscription_status === 'active' && (row.generation !== claimedGeneration || row.secret_ciphertext !== claimedCiphertext)) {
                    await this.run("UPDATE event_deliveries SET status='pending',next_attempt_at=?,lease_token=NULL,lease_until=NULL WHERE event_id=? AND subscription_id=? AND lease_token=?", now, item.event_id, item.subscription_id, token);
                    result.skipped++;
                    continue;
                }
                if (!await this.canSend(row, now) || row?.lease_token !== token) {
                    await this.run("UPDATE event_deliveries SET status='skipped',error_code='REVOKED',lease_token=NULL,lease_until=NULL WHERE event_id=? AND subscription_id=? AND lease_token=?", item.event_id, item.subscription_id, token);
                    result.skipped++;
                    continue;
                }
                const body = JSON.stringify({ eventId: row.event_id, name: 'lecture.relevant_published', timestamp: new Date(row.event_created_at).toISOString(), data: { lectureId: row.lecture_id, version: row.lecture_version, summary: row.title.slice(0, 200) }, cursor: null });
                const headers = signWebhook(secret, row.event_id, body, now);
                if (oldSecret)
                    headers['webhook-signature'] += ' ' + signWebhook(oldSecret, row.event_id, body, now)['webhook-signature'];
                headers['X-MCP-Subscription-Id'] = row.subscription_id;
                const response = await this.webhook(row.callback_url, body, headers, async () => {
                    const currentNow = fresh(), current = await this.deliveryState(item.event_id, item.subscription_id);
                    if (!await this.canSend(current, currentNow) || current?.lease_token !== token || current?.lease_until <= currentNow || current?.generation !== claimedGeneration || current?.secret_ciphertext !== claimedCiphertext)
                        throw new DomainError('FORBIDDEN', 'Leveringen er tilbagekaldt.');
                });
                const success = response.status >= 200 && response.status < 300;
                await recordUsage(this.db, 'event_delivery', success ? 'success' : 'DELIVERY_FAILED', now);
                await this.finish(item, token, row, now, success, response.status === 410 || response.status === 413 || response.status >= 300 && response.status < 400, success ? null : 'HTTP_' + Math.trunc(response.status));
                if (success)
                    result.sent++;
                else
                    result.failed++;
            }
            catch {
                await recordUsage(this.db, 'event_delivery', 'DELIVERY_FAILED', now);
                await this.finish(item, token, row, now, false, false, 'DELIVERY_FAILED');
                result.failed++;
            }
        }
        return result;
    }
    private async finish(item: Row, token: string, row: Row, now: number, success: boolean, permanent: boolean, error: string | null) {
        const exhausted = row?.attempts >= MAX_ATTEMPTS, delay = Math.min(DAY, 1000 * 2 ** Math.min(row?.attempts ?? 1, 16));
        await this.run('UPDATE event_deliveries SET status=?,next_attempt_at=?,lease_token=NULL,lease_until=NULL,error_code=? WHERE event_id=? AND subscription_id=? AND lease_token=? AND generation=?', success ? 'sent' : permanent || exhausted ? 'failed' : 'pending', now + delay, error, item.event_id, item.subscription_id, token, row.generation);
    }
    async summary() { return { subscriptions: await this.all('SELECT status,COUNT(*) count FROM event_subscriptions GROUP BY status'), deliveries: await this.all('SELECT status,COUNT(*) count FROM event_deliveries GROUP BY status') }; }
}
