import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createDatabase } from './database.js';
import { HearingUnion } from './domain.js';
import { createHearingMcp } from './mcp.js';

export type LocalAuth = { ownerSubject: string; accounts: { name: string; subject: string; token: string }[] };

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
  const value = JSON.parse(readFileSync(path, 'utf8')) as LocalAuth;
  if (!value.ownerSubject || !Array.isArray(value.accounts) || value.accounts.length < 2 || value.accounts.some(a => !a.subject || !a.name || !/^[0-9a-f]{64}$/.test(a.token))) {
    throw new Error('Invalid local development authentication configuration');
  }
  if (new Set(value.accounts.map(a => a.token)).size !== value.accounts.length) throw new Error('Duplicate local tokens');
  return value;
}

export async function startLocal(options: { dbPath?: string; authPath?: string; port?: number } = {}) {
  const dbPath = options.dbPath ?? resolve('.local/hearing-union.sqlite');
  const authPath = options.authPath ?? resolve('.local/auth.json');
  mkdirSync(dirname(dbPath), { recursive: true });
  const auth = localAuth(authPath);
  const db = createDatabase(dbPath);
  const domain = new HearingUnion(db, { ownerSubject: auth.ownerSubject });
  const handler = createHearingMcp(domain);
  const server = createServer(async (incoming, outgoing) => {
    const reply = (status: number, body: unknown) => {
      outgoing.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      outgoing.end(JSON.stringify(body));
    };
    try {
      // Loopback binding is reinforced against DNS rebinding and cross-origin browser calls.
      const host = incoming.headers.host ?? '';
      if (!/^127\.0\.0\.1:\d+$/.test(host)) return reply(403, { error: 'Forbidden host' });
      const origin = incoming.headers.origin;
      if (origin && origin !== `http://${host}`) return reply(403, { error: 'Forbidden origin' });
      const url = new URL(incoming.url ?? '/', `http://${host}`);
      if (url.pathname === '/health' && incoming.method === 'GET') return reply(200, { status: 'ok', mode: 'local-development' });
      if (url.pathname !== '/mcp') return reply(404, { error: 'Not found' });
      if (incoming.method !== 'POST') return reply(405, { error: 'POST required' });
      const token = /^Bearer ([0-9a-f]{64})$/.exec(incoming.headers.authorization ?? '')?.[1];
      const account = token && auth.accounts.find(a => timingSafeEqual(Buffer.from(a.token), Buffer.from(token)));
      if (!account) return reply(401, { error: 'Authentication required' });
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of incoming) {
        size += chunk.length;
        if (size > 65536) return reply(413, { error: 'Request too large' });
        chunks.push(Buffer.from(chunk));
      }
      const headers = new Headers();
      for (const [key, value] of Object.entries(incoming.headers)) {
        if (typeof value === 'string') headers.set(key, value);
        else if (value) headers.set(key, value.join(', '));
      }
      const response = await handler.fetch(new Request(url, { method: 'POST', headers, body: Buffer.concat(chunks) }), {
        authInfo: { token: '', clientId: 'local-development', scopes: [], extra: { subject: account.subject } },
      });
      response.headers.forEach((value, key) => outgoing.setHeader(key, value));
      outgoing.setHeader('cache-control', 'no-store');
      outgoing.setHeader('x-content-type-options', 'nosniff');
      outgoing.statusCode = response.status;
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      reply(500, { error: 'Internal error' });
    }
  });
  await new Promise<void>((accept, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? Number(process.env.PORT ?? 3000), '127.0.0.1', accept);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Local server failed to bind');
  return {
    server,
    port: address.port,
    async close() {
      await handler.close();
      await new Promise<void>((accept, reject) => server.close(error => error ? reject(error) : accept()));
      db.close();
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const running = await startLocal();
  console.log(`Local development server listening on 127.0.0.1:${running.port}. Identity tokens are in .local/auth.json; not for deployment.`);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void running.close().then(() => process.exit(0)); });
}
