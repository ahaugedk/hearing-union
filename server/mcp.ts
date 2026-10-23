import { McpServer, createMcpHandler } from '@modelcontextprotocol/server';
import { OpenAIExtensions } from '@openai/mcp-extensions/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { HearingUnion } from './domain.js';

// Wire limits mirror the shared domain's accepted input, including nonblank text.
const text = (max: number) => z.string().max(max).trim().min(1);
const id = text(200);
const version = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const pagination = { limit: z.number().int().min(1).max(100).optional(), offset: z.number().int().min(0).max(10000).optional() };
const query = text(300);
const datetime = z.union([z.iso.datetime({ offset: true }), z.number().int().min(0).max(8.64e15)]);
const httpsUrl = text(2000).refine(value => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}, 'Use an HTTPS URL without credentials');
const schemas: Record<string, z.ZodType> = {
  get_profile: z.strictObject({}),
  update_preferences: z.strictObject({ format: z.enum(['any', 'physical', 'online']), topics: z.array(id).max(50), regions: z.array(text(200)).max(50), expectedVersion: version }),
  delete_account: z.strictObject({ confirm: z.literal(true) }),
  knowledge_search: z.strictObject({ query, ...pagination }),
  knowledge_get: z.strictObject({ id }),
  knowledge_children: z.strictObject({ parentId: id.nullable().optional(), ...pagination }),
  lecture_search: z.strictObject({ query: query.optional(), ...pagination, topicId: id.optional(), region: text(200).optional(), format: z.enum(['any', 'physical', 'online']).optional(), from: datetime.optional(), to: datetime.optional() }),
  lecture_get: z.strictObject({ id }),
  lecture_register: z.strictObject({ lectureId: id }),
  lecture_unregister: z.strictObject({ lectureId: id }),
  my_registrations: z.strictObject(pagination),
  admin_knowledge_list: z.strictObject(pagination),
  admin_knowledge_save: z.strictObject({ id: id.optional(), expectedVersion: version.optional(), slug: text(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), parentId: id.nullable().optional(), title: text(200), summary: text(5000), keywords: z.array(text(200)).max(50), expiresAt: datetime.nullable().optional(), verifiedAt: datetime.optional(), sources: z.array(z.strictObject({ url: httpsUrl, title: text(300) })).min(1).max(20), relatedIds: z.array(id).max(50).optional(), status: z.enum(['draft', 'archived']).optional() }),
  admin_knowledge_publish: z.strictObject({ id, expectedVersion: version }),
  admin_lecture_save: z.strictObject({ id: id.optional(), expectedVersion: version.optional(), title: text(200), description: text(5000), startsAt: datetime, endsAt: datetime, format: z.enum(['physical', 'online']), region: text(200), location: text(2000), capacity: z.number().int().min(1).max(100000), topics: z.array(id).max(50) }),
  admin_lecture_publish: z.strictObject({ id, expectedVersion: version }),
  admin_lecture_cancel: z.strictObject({ id, expectedVersion: version }),
  admin_lecture_registrations: z.strictObject({ lectureId: id, ...pagination }),
  admin_audit_log: z.strictObject(pagination),
  admin_usage_report: z.strictObject({ from: datetime, to: datetime, groupBy: z.enum(['date', 'tool']).optional() }),
  owner_list_admins: z.strictObject({}),
  owner_set_admin: z.strictObject({ userId: id, enabled: z.boolean() }),
};
const labels: Record<string, string> = {
  get_profile: 'Læs egen konto og valgte præferencer.',
  update_preferences: 'Gem udtrykkeligt valgte emner og områder. Opretter ikke et eventabonnement.',
  delete_account: 'Slet egen konto og tilhørende præferencer og tilmeldinger. Kræver udtrykkelig anmodning.',
  knowledge_search: 'Find aktuel kildebaseret viden. Hent altid nye fakta ved nyt spørgsmål; citer kilderne, og gem ikke foreningens viden i hukommelsen.',
  knowledge_get: 'Hent aktuel viden med kilder. Gem ikke indholdet i hukommelsen; tidligere tekst kan være udløbet.',
  knowledge_children: 'Læs aktuelle underemner.',
  lecture_search: 'Find kommende foredrag og vis tilmeldingsmulighed.',
  lecture_get: 'Læs aktuelle detaljer og egen tilmelding til et foredrag.',
  lecture_register: 'Tilmeld den aktuelle bruger efter udtrykkelig anmodning. Kapacitet kontrolleres atomisk.',
  lecture_unregister: 'Afmeld egen tilmelding til et foredrag.',
  my_registrations: 'Læs kun egne tilmeldinger.',
};
const lectureResource = 'ui://hoereforeningen/lectures-v1.html';

export function createHearingMcp(domain: HearingUnion) {
  return createMcpHandler(context => {
    const subject = context.authInfo?.extra?.subject;
    if (typeof subject !== 'string') throw new Error('Authenticated subject required');
    const actor = { subject };
    const profile = domain.execute('get_profile', {}, actor) as { role: string };
    const server = new McpServer({ name: 'hoereforeningen', version: '0.1.0' }, {
      instructions: 'Dansk kildebaseret information, ikke personlig diagnosticering. Hent aktuelle oplysninger; citer kilder. Gem ikke foreningens viden i hukommelsen. Lokalt udviklingsmiljø, ikke et udgivet Site.',
    });
    new OpenAIExtensions(server);
    for (const [name, inputSchema] of Object.entries(schemas)) {
      if (name.startsWith('owner_') && profile.role !== 'owner') continue;
      if (name.startsWith('admin_') && !['owner', 'admin'].includes(profile.role)) continue;
      const readOnly = /^(get_|knowledge_|my_|lecture_(search|get)$|admin_knowledge_list$|admin_lecture_registrations$|admin_audit_log$|admin_usage_report$|owner_list_admins$)/.test(name);
      server.registerTool(name, {
        description: labels[name] ?? `Administrationshandling: ${name}. Ændringer kræver den aktuelle versions værdi.`,
        inputSchema,
        annotations: { readOnlyHint: readOnly, destructiveHint: ['delete_account', 'lecture_unregister', 'admin_lecture_cancel', 'owner_set_admin', 'admin_knowledge_save', 'admin_lecture_save'].includes(name), idempotentHint: readOnly || ['lecture_register', 'lecture_unregister'].includes(name), openWorldHint: false },
        ...(['lecture_search', 'lecture_get', 'my_registrations'].includes(name) ? { _meta: { ui: { resourceUri: lectureResource } } } : {}),
      }, async args => {
        try {
          const result = domain.execute(name, args ?? {}, actor);
          return { structuredContent: result as Record<string, unknown>, content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
        } catch (error) {
          const code = error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : 'INTERNAL_ERROR';
          const publicCodes = ['NOT_FOUND', 'EXPIRED', 'FORBIDDEN', 'FULL', 'VERSION_CONFLICT', 'INVALID_INPUT', 'OWNER_PROTECTED', 'CONFLICT', 'NOT_AVAILABLE'];
          const safeCode = publicCodes.includes(code) ? code : 'INTERNAL_ERROR';
          return { isError: true, structuredContent: { error: { code: safeCode } }, content: [{ type: 'text' as const, text: safeCode }] };
        }
      });
    }
    server.registerResource('Foredrag', lectureResource, { mimeType: 'text/html;profile=mcp-app' }, async () => {
      const source = readFileSync(resolve('.local/lectures.js'), 'utf8').replaceAll('</script', '<\\/script');
      return { contents: [{ uri: lectureResource, mimeType: 'text/html;profile=mcp-app', text: `<!doctype html><html lang="da"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Foredrag</title><style>body{font:16px system-ui;margin:16px;color:var(--color-text-primary,#18232d);background:var(--color-background-primary,#fff)}article{border:1px solid #89939d;border-radius:10px;padding:16px;margin-block:12px}button{font:inherit;padding:10px 16px;margin-right:8px;cursor:pointer}button:focus-visible{outline:3px solid #176db0}button:disabled{opacity:.6}p{line-height:1.5}#status{min-height:1.5em}</style><h1>Foredrag</h1><p id="status" role="status" aria-live="polite">Indlæser …</p><main id="lectures"></main><script type="module">${source}</script></html>`, _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] } } } }] };
    });
    return server;
  }, { responseMode: 'json', maxRequestBodySize: 65536 });
}
