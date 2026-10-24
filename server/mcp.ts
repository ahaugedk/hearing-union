import { McpServer, createMcpHandler, ProtocolError } from '@modelcontextprotocol/server';
import { OpenAIExtensions } from '@openai/mcp-extensions/server';
import { z } from 'zod';
import type { HearingUnion } from './domain.js';
import type { EventService } from './events.js';
import { subscribeSchema, unsubscribeSchema } from '../contracts/events.js';
// Wire limits mirror the shared domain's accepted input, including nonblank text.
const text = (max: number) => z.string().max(max).trim().min(1);
const id = text(200);
const version = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const pagination = { limit: z.number().int().min(1).max(100).optional(), offset: z.number().int().min(0).max(10000).optional() };
const query = text(300);
const datetime = z.union([z.iso.datetime({ offset: true }), z.number().int().min(0).max(8.64e15)]);
const httpsUrl = text(2000).refine(value => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password;
    }
    catch {
        return false;
    }
}, 'Use an HTTPS URL without credentials');
const schemas: Record<string, z.ZodType> = {
    get_profile: z.strictObject({}),
    update_preferences: z.strictObject({ format: z.enum(['any', 'physical', 'online']), topics: z.array(id).max(50), regions: z.array(text(200)).max(50), expectedVersion: version, consent: z.literal(true) }),
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
    admin_lecture_list: z.strictObject({ query: query.optional(), status: z.enum(['draft', 'published', 'cancelled']).optional(), ...pagination }),
    admin_lecture_save: z.strictObject({ id: id.optional(), expectedVersion: version.optional(), title: text(200), description: text(5000), startsAt: datetime, endsAt: datetime, format: z.enum(['physical', 'online']), region: text(200), location: text(2000), capacity: z.number().int().min(1).max(100000), topics: z.array(id).max(50) }),
    admin_lecture_publish: z.strictObject({ id, expectedVersion: version }),
    admin_lecture_cancel: z.strictObject({ id, expectedVersion: version }),
    admin_lecture_registrations: z.strictObject({ lectureId: id, ...pagination }),
    admin_audit_log: z.strictObject(pagination),
    admin_usage_report: z.strictObject({ from: datetime, to: datetime, groupBy: z.enum(['date', 'tool', 'topic', 'outcome']).optional() }),
    admin_event_status: z.strictObject({}),
    owner_list_admins: z.strictObject({}),
    owner_set_admin: z.strictObject({ userId: id, enabled: z.boolean() }),
};
const labels: Record<string, string> = {
    get_profile: 'Læs egen konto og valgte præferencer.',
    update_preferences: 'Forklar de valgte emner/områder, at de gemmes på kontoen til sletning, og indhent udtrykkeligt samtykke før consent:true. Gem ikke diagnoser. Opretter ikke et eventabonnement.',
    delete_account: 'Slet egen konto og tilhørende præferencer og tilmeldinger. Kræver udtrykkelig anmodning.',
    knowledge_search: 'Find aktuel kildebaseret viden. Hent altid nye fakta ved nyt spørgsmål; citer kilderne, og gem ikke foreningens viden i hukommelsen.',
    knowledge_get: 'Hent aktuel viden med kilder. Gem ikke indholdet i hukommelsen; tidligere tekst kan være udløbet.',
    knowledge_children: 'Læs aktuelle underemner.',
    lecture_search: 'Find kommende foredrag og vis tilmeldingsmulighed.',
    lecture_get: 'Læs aktuelle detaljer og egen tilmelding til et foredrag.',
    lecture_register: 'Tilmeld den aktuelle bruger efter udtrykkelig anmodning. Kapacitet kontrolleres atomisk.',
    lecture_unregister: 'Afmeld egen tilmelding til et foredrag.',
    my_registrations: 'Læs kun egne tilmeldinger.',
    admin_lecture_list: 'Find foredrag som administrator, inklusive kladder og den aktuelle version. Må ikke bruges til at give almindelige brugere kladdeindhold.',
    admin_lecture_save: 'Gem eller redigér en foredragskladde. Ved redigering kræves expectedVersion. Gemning skjuler publiceret indhold indtil ny udtrykkelig publicering.',
    admin_lecture_publish: 'Publicér præcis den gennemgåede foredragsversion. Kan udløse besked til relevante tilvalgte eventabonnementer.',
    admin_lecture_cancel: 'Aflys den angivne version af et foredrag. Kræver udtrykkelig administratorbestilling.',
    admin_lecture_registrations: 'Hent en begrænset liste med deltagere til foredraget. Indeholder ikke præferencer eller opslagshistorik.',
    admin_knowledge_list: 'Find vidensposter som administrator, inklusive kladder og udløbne poster, med versioner og kilder.',
    admin_knowledge_save: 'Gem eller redigér en videnskladde med kilder og expectedVersion. Gemning skjuler publiceret indhold; publicér særskilt efter gennemgang.',
    admin_knowledge_publish: 'Publicér præcis den gennemgåede version af en videnspost. Kontrollér kilder og gyldighed først.',
    admin_usage_report: 'Hent anonyme tællere i højst 93 kalenderdage. Emnerapporter undertrykkes ved små grupper; ingen rapport viser unikke personer eller samtalehistorik.',
    admin_audit_log: 'Læs administratorhandlinger og indholdsversioner; separat fra anonym brugsstatistik.',
    admin_event_status: 'Læs kun aggregeret status for eventabonnementer og leveringer, uden callbackadresser eller nøgler.',
    owner_list_admins: 'List administratorer som ejer.',
    owner_set_admin: 'Tildel eller fjern administratoradgang som ejer efter udtrykkelig bestilling. Ejerrollen kan ikke ændres.',
};
const analyticsResource = 'ui://hoereforeningen/analytics-v1.html';
const lectureResource = 'ui://hoereforeningen/lectures-v1.html';
export function createHearingMcp(domain: HearingUnion, events: EventService | undefined, assets: (name: 'lectures'|'analytics') => string) {
    const pending = new Set<Promise<unknown>>();
    const drainAfterCommit = () => {
        if (!events)
            return;
        const work = events.drain(Date.now(), 1).catch(() => undefined);
        pending.add(work);
        void work.finally(() => pending.delete(work));
    };
    const handler = createMcpHandler(async (context) => {
        const subject = context.authInfo?.extra?.subject;
        if (typeof subject !== 'string')
            throw new Error('Authenticated subject required');
        const actor = { subject };
        const profile = await domain.resolveActor(actor);
        const server = new McpServer({ name: 'hoereforeningen', version: '0.1.0' }, {
            instructions: 'Dansk kildebaseret information, ikke personlig diagnosticering. Hent aktuelle oplysninger; citer kilder. Gem ikke foreningens viden i hukommelsen.',
        });
        new OpenAIExtensions(server);
        if (events) {
            server.server.registerCapabilities({ events: {} } as Parameters<typeof server.server.registerCapabilities>[0]);
            const eventError = (error: unknown): never => {
                const code = error instanceof Error && 'code' in error ? error.code : 'INTERNAL_ERROR';
                if (code === 'INVALID_INPUT')
                    throw new ProtocolError(-32602, 'Ugyldigt eventkald.');
                if (code === 'CALLBACK_FAILED' || code === 'CALLBACK_ENDPOINT_ERROR')
                    throw new ProtocolError(-32015, 'Callback kunne ikke verificeres.', { reason: error instanceof Error && 'reason' in error && error.reason === 'timeout' ? 'timeout' : 'challenge_failed' });
                if (code === 'FORBIDDEN' || code === 'NOT_FOUND')
                    throw new ProtocolError(-32003, 'Adgang afvist.');
                throw new ProtocolError(-32603, 'Eventhandlingen kunne ikke gennemføres.');
            };
            server.server.setRequestHandler('events/list', { params: z.object({ cursor: z.null().optional() }) }, () => events.list());
            server.server.setRequestHandler('events/subscribe', { params: subscribeSchema.extend({ _meta: z.unknown().optional() }).transform(({ _meta, ...params }) => params) }, async (params) => {
                try {
                    return await events.subscribe(profile.id, params);
                }
                catch (error) {
                    return eventError(error);
                }
            });
            server.server.setRequestHandler('events/unsubscribe', { params: unsubscribeSchema.extend({ _meta: z.unknown().optional() }).transform(({ _meta, ...params }) => params) }, async (params) => {
                try {
                    return await events.unsubscribe(profile.id, params);
                }
                catch (error) {
                    return eventError(error);
                }
            });
        }
        for (const [name, inputSchema] of Object.entries(schemas)) {
            if (name.startsWith('owner_') && profile.role !== 'owner')
                continue;
            if (name.startsWith('admin_') && !['owner', 'admin'].includes(profile.role))
                continue;
            const readOnly = /^(get_|knowledge_|my_|lecture_(search|get)$|admin_knowledge_list$|admin_lecture_registrations$|admin_lecture_list$|admin_audit_log$|admin_usage_report$|admin_event_status$|owner_list_admins$)/.test(name);
            server.registerTool(name, {
                description: labels[name] ?? `Administrationshandling: ${name}. Ændringer kræver den aktuelle versions værdi.`,
                inputSchema,
                annotations: { readOnlyHint: readOnly, destructiveHint: ['delete_account', 'lecture_unregister', 'admin_lecture_cancel', 'owner_set_admin', 'admin_knowledge_save', 'admin_lecture_save'].includes(name), idempotentHint: readOnly || ['lecture_register', 'lecture_unregister'].includes(name), openWorldHint: false },
                ...(['lecture_search', 'lecture_get', 'my_registrations', 'admin_usage_report'].includes(name) ? { _meta: { ui: { resourceUri: name === 'admin_usage_report' ? analyticsResource : lectureResource } } } : {}),
            }, async (args) => {
                try {
                    const current = await domain.resolveActor(actor);
                    if (name === 'admin_event_status' && !['owner', 'admin'].includes(current.role))
                        throw new ProtocolError(-32003, 'Adgang afvist.');
                    const result = name === 'admin_event_status' ? (await events?.summary() ?? { enabled: false }) : await domain.execute(name, args ?? {}, actor);
                    if (name === 'admin_lecture_publish')
                        drainAfterCommit();
                    return { structuredContent: result as Record<string, unknown>, content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
                }
                catch (error) {
                    const code = error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : 'INTERNAL_ERROR';
                    const publicCodes = ['NOT_FOUND', 'EXPIRED', 'FORBIDDEN', 'FULL', 'VERSION_CONFLICT', 'INVALID_INPUT', 'OWNER_PROTECTED', 'CONFLICT', 'NOT_AVAILABLE'];
                    const safeCode = publicCodes.includes(code) ? code : 'INTERNAL_ERROR';
                    return { isError: true, structuredContent: { error: { code: safeCode } }, content: [{ type: 'text' as const, text: safeCode }] };
                }
            });
        }
        server.registerResource('Foredrag', lectureResource, { mimeType: 'text/html;profile=mcp-app' }, async () => {
            const source = assets('lectures').replaceAll('</script', '<\\/script');
            return { contents: [{ uri: lectureResource, mimeType: 'text/html;profile=mcp-app', text: `<!doctype html><html lang="da"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Foredrag</title><style>body{font:16px system-ui;margin:16px;color:var(--color-text-primary,#18232d);background:var(--color-background-primary,#fff)}article{border:1px solid #89939d;border-radius:10px;padding:16px;margin-block:12px}button{font:inherit;padding:10px 16px;margin-right:8px;cursor:pointer}button:focus-visible{outline:3px solid #176db0}button:disabled{opacity:.6}p{line-height:1.5}h2,p{overflow-wrap:anywhere}*{box-sizing:border-box}#status{min-height:1.5em}</style><h1>Foredrag</h1><p id="status" role="status" aria-live="polite">Indlæser …</p><main id="lectures"></main><script type="module">${source}</script></html>`, _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] } } } }] };
        });
        if (['owner', 'admin'].includes(profile.role))
            server.registerResource('Brugsstatistik', analyticsResource, { mimeType: 'text/html;profile=mcp-app' }, async () => {
                const current = await domain.resolveActor(actor);
                if (!['owner', 'admin'].includes(current.role))
                    throw new ProtocolError(-32003, 'Adgang afvist.');
                const source = assets('analytics').replaceAll('</script', '<\\/script');
                return { contents: [{ uri: analyticsResource, mimeType: 'text/html;profile=mcp-app', text: `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Brugsstatistik</title></head><body><script type="module">${source}</script></body></html>`, _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] } } } }] };
            });
        return server;
    }, { responseMode: 'json', maxRequestBodySize: 65536 });
    return {
        close: async () => { await Promise.allSettled([...pending]); await handler.close(); },
        async fetch(...args: Parameters<typeof handler.fetch>) {
            const response = await handler.fetch(...args);
            // The official SDK's fixed capability schema predates MCP Events. Keep this
            // protocol extension at the transport edge instead of forking SDK internals.
            if (events && args[0].headers.get('Mcp-Method') === 'server/discover' && response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const body = await response.json() as {result?: {capabilities?: Record<string, unknown>}};
                if (body.result?.capabilities)
                    body.result.capabilities.events = {};
                const headers = new Headers(response.headers);
                headers.delete('content-length');
                return new Response(JSON.stringify(body), { status: response.status, headers });
            }
            return response;
        },
    };
}
