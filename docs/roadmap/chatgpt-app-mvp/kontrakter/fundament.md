---
type: "Plan Implementation"
title: "Fundament, datamodel og MCP-kald"
description: "Foreslået kodeansvar, tabeller, identitet, roller og fælles værktøjskontrakter."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Fundament, datamodel og MCP-kald

Følg [visionens scope](../vision.md). Kontrakten understøtter [adgangsscenariet](../scenarier/adgang.md) og [kontosletning](../scenarier/konto.md). Alle kodeplaceringer er foreslåede, ikke eksisterende kode.

Implementér én modulopdelt TypeScript-applikation med Sites' Vinext-starter på Cloudflare Workers, D1/SQLite som database og Drizzle til skema og migrationer. Brug React til to indlejrede MCP Apps. Bevar starterens build-, auth- og deploymentintegration.

ChatGPT og MCP-visninger kalder samme MCP-værktøjer. Et tyndt transportlag validerer input og identitet, hvorefter fælles applikationsfunktioner udfører rettighedskontrol, forretningsregler og databaseoperationer. MCP-visninger indeholder ingen privilegeret logik eller databaseadgang.

| Placering | Ansvar |
| --- | --- |
| `app/mcp/route.ts` | Autentificeret JSON-RPC-endpoint: `POST /mcp`. |
| `server/mcp/` | Protokoladapter, værktøjskatalog, ressourcer og oversættelse af fejl/resultater. |
| `contracts/` | Zod-skemaer, input/output-typer og eventkontrakter fælles for server og MCP Apps. |
| `server/auth/` | Omsæt betroet Sites-identitet til bruger og rettigheder. |
| `server/features/` | Funktioner for viden, foredrag, præferencer, abonnementer, statistik og roller. |
| `server/repositories/` | Konkrete D1-forespørgsler per område; ingen generisk repository-abstraktion. |
| `server/events/` | Matching, varig leveringskø, signering og levering. |
| `db/schema.ts`, `drizzle/` | Drizzle-skema og versionsstyrede SQL-migrationer. |
| `mcp-ui/` | Foredragsvisning, statistikvisning og fælles MCP Apps-bro. |
| `scripts/` | Engangsimport, bundling af MCP Apps og deployment/smoke test. |

Domænefunktioner modtager en serveroprettet kontekst, ikke bruger-id fra modellen:

```ts
type RequestContext = {
  actor: { userId: string; role: "user" | "admin" | "owner" };
  db: D1Database;
  now: number; // UTC, millisekunder; kan styres i tests
  requestId: string;
};

getKnowledge(ctx, { id });
registerForLecture(ctx, { lectureId });
publishLecture(ctx, { id, expectedVersion });
```

Byg kun én aktuel implementering af hvert flow. Følg [modelændringsreglen](../../../arbejdsregler/levering/modelaendringer.md); indfør ingen legacybroer eller alternative auth- og protokolmodeller før v1.

## Fase 1 – Database og adgang

Opret nedenstående logiske datamodel. Brug fremmednøgler, relevante `CHECK`-constraints og unikke indeks. Tider lagres som UTC-millisekunder og returneres som ISO 8601; visning bruger `Europe/Copenhagen`.

| Tabel | Centrale felter og relationer |
| --- | --- |
| `users` | `id`, unik `auth_subject`, `role`, `created_at`; kun nødvendige profildata. |
| `user_preferences` | `user_id`, `format` (`any/physical/online`), versionsnummer. |
| `user_topic_preferences`, `user_region_preferences` | Valgte emner og geografiske områder per bruger. |
| `knowledge_nodes` | `id`, unik `slug`, `parent_id`, `title`, `summary`, `keywords_json`, `status`, `expires_at NULL`, `verified_at`, `version`. |
| `knowledge_sources`, `knowledge_edges` | Kilde-URL/titel/kontroldato per node og relationer mellem noder. |
| `knowledge_revisions` | Historik over administratorers indholdsændringer; ikke til almindelige vidensopslag. |
| `lectures` | Titel, beskrivelse, start/slut, format, region, sted/link, kapacitet, status, version. |
| `lecture_topics` | Mange-til-mange-relation mellem foredrag og vidensemner. |
| `registrations` | `user_id`, `lecture_id`, status og tid; unik kombination af bruger og foredrag. |
| `event_subscriptions` | Bruger, protokol-id, eventnavn, filtre, callback, krypteret signeringsnøgle, udløb og status. |
| `outbox_events` | Varige domænehændelser med unik identitet, foredragsversion og tidspunkt. |
| `event_deliveries` | Event/abonnement, forsøg, næste forsøg, leveringsstatus og tidsbegrænset lås; unik event/abonnement-kombination. |
| `usage_daily` | Dato, hændelsestype, emne/værktøj, resultat og tæller; ingen bruger-id'er. |
| `admin_audit` | Aktør, handling, mål, version og tidspunkt; adskilt fra brugsstatistik. |

Implementér `resolveActor()`, `requireAdmin()` og `requireOwner()`. Konti oprettes ved første autentificerede kald. Ejerrettigheden knyttes ved deployment til Anders' verificerede identitet via konfiguration, aldrig til den første vilkårlige besøgende. Ejerrollen kan ikke fjernes gennem et almindeligt administratorværktøj.

Alle personlige forespørgsler afgrænses med `WHERE user_id = ctx.actor.userId`. Administratorrettigheder kontrolleres på hvert kald, også fra en tidligere åbnet MCP App. Hold ingen brugeridentitet eller rettigheder i global Worker-tilstand.

Generér og inspicér skemadefinitioner med starterens Drizzle-flow. Før første produktions-v1 rettes ændringer i den oprindelige definition; ingen rettelsesmigrationer eller bevaring af udviklingsdata. Dev-reset vælges særskilt for et afgrænset miljø. Efter v1 bevares produktionsdata efter [modelændringsreglen](../../../arbejdsregler/levering/modelaendringer.md). Seeddata importeres separat og idempotent. Brug D1 `batch()` til atomiske operationer, og opret aldrig tabeller under almindelige requests.

**Færdig når:** En ren lokal database kan migreres, konti kan oprettes, og bruger A ikke kan tilgå bruger B's data. Kun ejeren kan ændre administratoradgang.

## Fase 2 – MCP-kontrakter

Implementér en lille protokoladapter omkring de fælles funktioner. Brug officiel SDK, hvor den verificeret understøtter den valgte protokol; isolér nødvendige MCP 2.0-metoder i adapteren frem for at antage SDK-understøttelse.

- Understøt discovery, værktøjskald og UI-ressourcer. Tilføj `events/list`, `events/subscribe` og `events/unsubscribe` i eventfasen.
- Definér input- og outputskemaer én gang i `contracts/`. Afvis ukendte felter, begræns tekstlængder og paginér lister; almindelige værktøjer modtager ikke SQL, rolle eller vilkårlige bruger-id'er.
- Returnér `structuredContent` med stabile felter og en kort tekst til modellen. Brug entydige fejl som `NOT_FOUND`, `EXPIRED`, `FORBIDDEN`, `FULL` og `VERSION_CONFLICT`.
- Beskriv læse-, skrive- og destruktive handlinger korrekt i værktøjsmetadata. Eksponér kun relevante værktøjer for rollen, og håndhæv samme grænse i selve handleren.
- Returnér ingen rå databasefejl, signeringsnøgler eller callback-URL'er til modellen. Personlige svar må ikke ligge i delte HTTP-caches.

Planlagt værktøjskatalog:

| Område | Værktøjer |
| --- | --- |
| Konto | `get_profile`, `update_preferences`, `delete_account` |
| Viden | `knowledge_search`, `knowledge_get`, `knowledge_children` |
| Foredrag | `lecture_search`, `lecture_get`, `lecture_register`, `lecture_unregister`, `my_registrations` |
| Indholdsadministration | `admin_knowledge_list`, `admin_knowledge_save`, `admin_knowledge_publish` |
| Foredragsadministration | `admin_lecture_list`, `admin_lecture_save`, `admin_lecture_publish`, `admin_lecture_cancel`, `admin_lecture_registrations` |
| Indsigt | `admin_usage_report`, `admin_audit_log` |
| Ejer | `owner_list_admins`, `owner_set_admin` |

Gem og opdatér som eksplicit kladde/publikation. `*_save` modtager et afgrænset objekt samt `expectedVersion` ved ændringer; publiceringsværktøjer angiver præcis hvilken version der publiceres. Arkivering indgår som eksplicit statusændring i vidensadministrationen.

**Færdig når:** Et kald fra chat og samme kald fra en MCP App rammer identisk validering og funktion. Fejl og rettigheder er afprøvet gennem endpointet.
