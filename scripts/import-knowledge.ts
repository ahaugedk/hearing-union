import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';
import { createDatabase } from '../server/database.js';
import { DomainError, HearingUnion } from '../server/domain.js';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150);
const datasetSchema = z.strictObject({ nodes: z.array(z.strictObject({
  slug, parentSlug: slug.nullable(), title: z.string().min(1).max(200),
  summary: z.string().min(1).max(5000), keywords: z.array(z.string().min(1).max(200)).max(50),
  relatedSlugs: z.array(slug).max(50), verifiedAt: z.string().datetime(),
  sources: z.array(z.strictObject({ url: z.string().url().max(2000), title: z.string().min(1).max(300) })).min(1).max(20),
})).min(1).max(1000) });
type NodeInput = z.infer<typeof datasetSchema>['nodes'][number];
type StoredNode = { id: string; version: number; status: string };

function options(args: string[]) {
  const result = { database: '.local/hearing-union.sqlite', auth: '.local/auth.json', input: 'data/knowledge.json', verifySources: false, refresh: new Set<string>() };
  for (let i = 0; i < args.length; i++) {
    const name = args[i];
    if (name === '--verify-sources') { result.verifySources = true; continue; }
    if (!['--database', '--auth', '--input', '--refresh'].includes(name) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('INVALID_OPTIONS');
    const value = args[++i];
    if (name === '--refresh') {
      for (const entry of value.split(',')) result.refresh.add(slug.parse(entry));
    } else result[name.slice(2) as 'database' | 'auth' | 'input'] = value;
  }
  return result;
}

function orderNodes(nodes: NodeInput[]) {
  const bySlug = new Map(nodes.map(node => [node.slug, node]));
  if (bySlug.size !== nodes.length) throw new Error('DUPLICATE_SLUG');
  const ordered: NodeInput[] = [], done = new Set<string>(), active = new Set<string>();
  function visit(node: NodeInput) {
    if (done.has(node.slug)) return;
    if (active.has(node.slug)) throw new Error('PARENT_CYCLE');
    active.add(node.slug);
    if (node.parentSlug) {
      const parent = bySlug.get(node.parentSlug);
      if (!parent) throw new Error('UNKNOWN_PARENT');
      visit(parent);
    }
    if (node.relatedSlugs.some(other => other === node.slug || !bySlug.has(other))) throw new Error('INVALID_RELATION');
    if (Date.parse(node.verifiedAt) > Date.now()) throw new Error('FUTURE_VERIFICATION');
    for (const source of node.sources) {
      const url = new URL(source.url);
      if (url.protocol !== 'https:' || url.username || url.password || url.hostname !== 'hoereforeningen.dk' || url.port) throw new Error('INVALID_SOURCE');
    }
    active.delete(node.slug); done.add(node.slug); ordered.push(node);
  }
  nodes.forEach(visit);
  return ordered;
}

async function main() {
  const config = options(process.argv.slice(2));
  const nodes = orderNodes(datasetSchema.parse(JSON.parse(readFileSync(resolve(config.input), 'utf8'))).nodes);
  for (const requested of config.refresh) if (!nodes.some(node => node.slug === requested)) throw new Error('UNKNOWN_REFRESH_SLUG');
  if (config.verifySources) {
    // curl uses the cloud machine's configured HTTPS proxy and normal TLS trust.
    const urls = [...new Set(nodes.flatMap(node => node.sources.map(source => source.url)))];
    const run = promisify(execFile);
    for (let i = 0; i < urls.length; i += 4) await Promise.all(urls.slice(i, i + 4).map(async url => {
      const { stdout } = await run('curl', ['--silent', '--show-error', '--fail', '--location', '--proto', '=https', '--proto-redir', '=https', '--max-redirs', '3', '--max-time', '25', '--output', '/dev/null', '--write-out', '%{http_code} %{url_effective}', url]);
      const [status, destination] = stdout.trim().split(' ');
      if (status !== '200' || new URL(destination).hostname !== 'hoereforeningen.dk') throw new Error('SOURCE_VERIFICATION_FAILED');
    }));
    console.log(`Kildekontrol bestået: ${urls.length} HTTPS-sider. Kontroldatoen i input ændres ikke automatisk.`);
  }
  const { ownerSubject } = z.object({ ownerSubject: z.string().trim().min(1).max(500) }).parse(JSON.parse(readFileSync(resolve(config.auth), 'utf8')));
  const db = createDatabase(resolve(config.database));
  try {
    const domain = new HearingUnion(db, { ownerSubject }), actor = { subject: ownerSubject };
    const stored = new Map<string, StoredNode>();
    const work = new Set<string>();
    for (const node of nodes) {
      const existing = db.prepare('SELECT id,version,status FROM knowledge_nodes WHERE slug=?').get(node.slug) as StoredNode | undefined;
      if (existing) stored.set(node.slug, existing);
      if (!existing || config.refresh.has(node.slug)) work.add(node.slug);
    }
    // Resolve parent IDs before children. Existing content is never rewritten by default.
    for (const node of nodes) {
      if (!work.has(node.slug)) continue;
      const existing = stored.get(node.slug);
      const saved = domain.execute('admin_knowledge_save', {
        ...(existing ? { id: existing.id, expectedVersion: existing.version } : {}),
        slug: node.slug, parentId: node.parentSlug ? stored.get(node.parentSlug)!.id : null,
        title: node.title, summary: node.summary, keywords: node.keywords,
        verifiedAt: node.verifiedAt, expiresAt: null, sources: node.sources, relatedIds: [], status: 'draft',
      }, actor) as StoredNode;
      stored.set(node.slug, saved);
    }
    // All IDs now exist; retain full relation sets through the shared validation path.
    for (const node of nodes) {
      if (!work.has(node.slug)) continue;
      let current = stored.get(node.slug)!;
      if (node.relatedSlugs.length) current = domain.execute('admin_knowledge_save', {
        id: current.id, expectedVersion: current.version, slug: node.slug,
        parentId: node.parentSlug ? stored.get(node.parentSlug)!.id : null,
        title: node.title, summary: node.summary, keywords: node.keywords,
        verifiedAt: node.verifiedAt, expiresAt: null, sources: node.sources,
        relatedIds: node.relatedSlugs.map(other => stored.get(other)!.id), status: 'draft',
      }, actor) as StoredNode;
      current = domain.execute('admin_knowledge_publish', { id: current.id, expectedVersion: current.version }, actor) as StoredNode;
      stored.set(node.slug, current);
    }
    console.log(`Import gennemført: ${work.size} oprettet eller udtrykkeligt opdateret; ${nodes.length - work.size} eksisterende poster bevaret.`);
  } finally { db.close(); }
}

main().catch(error => {
  const message = error instanceof DomainError ? error.code : error instanceof z.ZodError ? 'INVALID_INPUT' : error instanceof Error && /^[A-Z_]+$/.test(error.message) ? error.message : 'IMPORT_FAILED';
  console.error(`Import afbrudt (${message}). Ingen automatisk overskrivning ved genkørsel; kontrollér eventuelle kladder og brug kun --refresh med konkrete slugs efter gennemgang.`);
  process.exitCode = 1;
});
