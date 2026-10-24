import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync, lstatSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createDatabase } from './database.js';
import { HearingUnion } from './domain.js';
import { createHearingMcp } from './mcp.js';
import { consumeRateLimit } from './operations.js';
import { renderPublicPage } from './pages.js';
import { EventService } from './events.js';
import type { WebhookTransport } from './webhook.js';
export type LocalAuth = {
    ownerSubject: string;
    accounts: {
        name: string;
        subject: string;
        token: string;
    }[];
};
/** Deliberately local-only development identities. Never use as hosted authentication. */
function localAuth(path: string): LocalAuth {
    if (!existsSync(path)) {
        mkdirSync(dirname(path), { recursive: true });
        const data: LocalAuth = {
            ownerSubject: 'local-owner',
            accounts: ['owner', 'user', 'user2'].map(name => ({ name, subject: `local-${name}`, token: randomBytes(32).toString('hex') })),
        };
        writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600, flag: 'wx' });
    }
    const stats = lstatSync(path);
    if (!stats.isFile() || (stats.mode & 0o077) !== 0)
        throw new Error('Local authentication file must be a regular file readable only by its owner');
    const value = JSON.parse(readFileSync(path, 'utf8')) as LocalAuth;
    if (!value.ownerSubject || !Array.isArray(value.accounts) || value.accounts.length < 2 || value.accounts.some(a => !a.subject || !a.name || !/^[0-9a-f]{64}$/.test(a.token))) {
        throw new Error('Invalid local development authentication configuration');
    }
    if (new Set(value.accounts.map(a => a.token)).size !== value.accounts.length || new Set(value.accounts.map(a => a.subject)).size !== value.accounts.length)
        throw new Error('Duplicate local identities');
    if (!value.accounts.some(account => account.subject === value.ownerSubject))
        throw new Error('Configured local owner account is missing');
    return value;
}
/** Local persistent development keys; production secrets must come from the host. */
function localSecret(path: string): Buffer {
    if (!existsSync(path))
        writeFileSync(path, randomBytes(32), { mode: 0o600, flag: 'wx' });
    const stat = lstatSync(path);
    if (!stat.isFile() || (stat.mode & 0o077) !== 0)
        throw new Error('Local secret must be an owner-only regular file.');
    const key = readFileSync(path);
    if (key.length !== 32)
        throw new Error('Invalid local secret.');
    return key;
}
export async function startLocal(options: {
    dbPath?: string;
    authPath?: string;
    port?: number;
    publisherName?: string;
    supportUrl?: string;
    chatGPTAppUrl?: string;
    eventKeyPath?: string;
    serviceTokenPath?: string;
    webhook?: WebhookTransport;
} = {}) {
    const dbPath = options.dbPath ?? resolve('.local/hearing-union.sqlite');
    const authPath = options.authPath ?? resolve('.local/auth.json');
    mkdirSync(dirname(dbPath), { recursive: true });
    const auth = localAuth(authPath);
    const pageConfig = { publisherName: options.publisherName ?? process.env.PUBLISHER_NAME, supportUrl: options.supportUrl ?? process.env.SUPPORT_URL, chatGPTAppUrl: options.chatGPTAppUrl ?? process.env.CHATGPT_APP_URL };
    renderPublicPage('/support', pageConfig); // Reject invalid configuration at startup.
    const db = createDatabase(dbPath);
    const domain = new HearingUnion(db, { ownerSubject: auth.ownerSubject });
    const eventKeyPath = options.eventKeyPath ?? `${authPath}.event-key`;
    if (!existsSync(eventKeyPath) && await db.prepare("SELECT 1 FROM event_subscriptions WHERE secret_ciphertext<>'' OR old_secret_ciphertext IS NOT NULL LIMIT 1").get()) {
        await db.close();
        throw new Error('Existing encrypted subscriptions require their original event key. Restore the key before startup.');
    }
    const events = new EventService(db, { encryptionKey: localSecret(eventKeyPath), webhook: options.webhook });
    try {
        await events.verifyEncryptionKey();
    }
    catch {
        await db.close();
        throw new Error('Cannot decrypt stored subscriptions. Restore the matching event key.');
    }
    const drainToken = localSecret(options.serviceTokenPath ?? `${authPath}.drain-token`).toString('hex');
    const handler = createHearingMcp(domain, events, name => readFileSync(resolve(`dist/apps/${name}.js.txt`), 'utf8'));
    const server = createServer(async (incoming, outgoing) => {
        const reply = (status: number, body: unknown) => {
            outgoing.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
            outgoing.end(JSON.stringify(body));
        };
        try {
            // Loopback binding is reinforced against DNS rebinding and cross-origin browser calls.
            const host = incoming.headers.host ?? '';
            if (!/^127\.0\.0\.1:\d+$/.test(host))
                return reply(403, { error: 'Forbidden host' });
            const origin = incoming.headers.origin;
            if (origin && origin !== `http://${host}`)
                return reply(403, { error: 'Forbidden origin' });
            const url = new URL(incoming.url ?? '/', `http://${host}`);
            if (incoming.method === 'GET') {
                const page = renderPublicPage(url.pathname, pageConfig);
                if (page !== null) {
                    outgoing.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" });
                    outgoing.end(page);
                    return;
                }
            }
            if (url.pathname === '/internal/deliveries/drain') {
                if (incoming.method !== 'POST')
                    return reply(405, { error: 'POST required' });
                const supplied = /^Bearer ([0-9a-f]{64})$/.exec(incoming.headers.authorization ?? '')?.[1];
                if (!supplied || !timingSafeEqual(Buffer.from(supplied), Buffer.from(drainToken)))
                    return reply(401, { error: 'Service authentication required' });
                if (!(await consumeRateLimit(db, 'service:deliveries', { limit: 12 })).allowed)
                    return reply(429, { error: 'Too many requests' });
                return reply(200, await events.drain(Date.now(), 1));
            }
            const token = /^Bearer ([0-9a-f]{64})$/.exec(incoming.headers.authorization ?? '')?.[1];
            const account = token && auth.accounts.find(a => timingSafeEqual(Buffer.from(a.token), Buffer.from(token)));
            if (!account)
                return reply(401, { error: 'Authentication required' });
            if (url.pathname === '/health' && incoming.method === 'GET')
                return reply(200, { status: 'ok', mode: 'local-development' });
            if (url.pathname !== '/mcp')
                return reply(404, { error: 'Not found' });
            if (incoming.method !== 'POST')
                return reply(405, { error: 'POST required' });
            const rate = await consumeRateLimit(db, account.subject);
            if (!rate.allowed) {
                outgoing.setHeader('retry-after', rate.retryAfterSeconds);
                return reply(429, { error: 'Too many requests' });
            }
            const contentLength = incoming.headers['content-length'];
            if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > 65536))
                return reply(413, { error: 'Request too large' });
            const chunks: Buffer[] = [];
            let size = 0;
            for await (const chunk of incoming) {
                size += chunk.length;
                if (size > 65536)
                    return reply(413, { error: 'Request too large' });
                chunks.push(Buffer.from(chunk));
            }
            const headers = new Headers();
            for (const [key, value] of Object.entries(incoming.headers)) {
                if (typeof value === 'string')
                    headers.set(key, value);
                else if (value)
                    headers.set(key, value.join(', '));
            }
            const response = await handler.fetch(new Request(url, { method: 'POST', headers, body: Buffer.concat(chunks) }), {
                authInfo: { token: '', clientId: 'local-development', scopes: [], extra: { subject: account.subject } },
            });
            response.headers.forEach((value, key) => outgoing.setHeader(key, value));
            outgoing.setHeader('cache-control', 'no-store');
            outgoing.setHeader('x-content-type-options', 'nosniff');
            outgoing.statusCode = response.status;
            outgoing.end(Buffer.from(await response.arrayBuffer()));
        }
        catch {
            reply(500, { error: 'Internal error' });
        }
    });
    server.requestTimeout = 15000;
    server.headersTimeout = 10000;
    server.keepAliveTimeout = 5000;
    server.setTimeout(20000, socket => socket.destroy());
    await new Promise<void>((accept, reject) => {
        server.once('error', reject);
        server.listen(options.port ?? Number(process.env.PORT ?? 3000), '127.0.0.1', accept);
    });
    const address = server.address();
    if (!address || typeof address === 'string')
        throw new Error('Local server failed to bind');
    return {
        server,
        port: address.port,
        async close() {
            await handler.close();
            await new Promise<void>(async (accept, reject) => await server.close(error => error ? reject(error) : accept()));
            await db.close();
        },
    };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    const running = await startLocal();
    console.log(`Local development server listening on 127.0.0.1:${running.port}. Identity tokens are in .local/auth.json; not for deployment.`);
    for (const signal of ['SIGINT', 'SIGTERM'] as const)
        process.once(signal, async () => { void running.close().then(() => process.exit(0)); });
}
