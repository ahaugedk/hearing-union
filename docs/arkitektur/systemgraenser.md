---
type: "Architecture Contract"
title: "Projektets systemgrænser"
description: "Projektets konkrete komponenter, dataejere, adgang og udførelsesgrænser."
status: "draft"
---
# Projektets systemgrænser

De lokale og hostede adaptere deler domænefunktioner og databasekontrakt. Den hostede Worker bruger D1 og Sites’ indbyggede identitet. Faktisk Sites-routing og platformens identitetsvideresendelse afprøves ved aktivering; se [deploymentvejledningen](../../release/README.md).

| Ansvar | Aktuel grænse |
|---|---|
| Lokal transport | `server/local.ts` binder kun loopback og afleder syntetisk aktør fra en lokalt genereret nøgle. Klienten kan ikke angive bruger-id eller rolle som autoritet |
| MCP | `server/mcp.ts` ejer SDK-adapter, inputskemaer, værktøjskatalog og sikre fejl. Chat og MCP App bruger samme værktøjshandlere |
| Domæne | `server/domain.ts` ejer adgang, gyldighed, versionskonflikter og atomiske ændringer. Roller genlæses ved hvert kald |
| Persistens | Asynkron kontrakt i `server/storage.ts`; lokal SQLite gennem `server/database.ts`, D1 gennem `server/d1.ts`. Atomiske batches med revisionskontrol. `db/*.sql` genererer første D1-migration; ingen skemaændring under requests |
| Identitet | Lokal ejer konfigureres eksplicit; den private Sites-ejer etableres atomisk ved første autentificerede domænekald, og den gemte ejer bevares. Worker afleder subject alene fra Sites-headeren oai-authenticated-user-id. E-mail og navn giver ingen rettigheder. Det private Sites-ingress er tillidsgrænsen; ingen separat offentlig Worker-route er aktiveret. Roller læses fra databasen. Lokale tokens i `.local/auth.json` er kun til udvikling |
| Viden og foredrag | Publicering og gyldighed kontrolleres server-side. Kladdeindhold holdes ude af almindelige læseveje, også når en bruger tidligere har tilmeldt sig |
| MCP Apps | Foredrag og statistik bruger værktøjsbroen; ingen direkte databaseadgang eller brugercredentials. Statistikressourcen kræver aktuel administratorrolle |
| Events | Krypterede, eksplicit tilvalgte abonnementer og varig leveringskø. Aktuelle rettigheder, filtre og tilstand genkontrolleres ved dispatch; leases og stabile event-id’er gør genoptagelse mulig. Lokal netværkstransport validerer DNS/IP og TLS; Worker bruger HTTPS med eksplicit liste af betroede callbackværter; den faktiske ChatGPT-modtagelse er endnu ikke afprøvet |
| Statistik | Succes og fejl tælles anonymt efter faste kategorier. Intet statistiklag indeholder identitet eller søgetekst. Små emnegrupper undertrykker hele emnerapporten for at forhindre subtraktion fra andre grupperinger |
| Drift | Ratebegrænsning deles gennem den fælles SQLite-/D1-kontrakt. Backup/restore kræver en ny destinationsfil; eventkrypteringsnøglen bevares særskilt og valideres før serveropstart |
| Ekstern aktivering | Worker har planlagt cron-genlevering og eksplicit allowlist af callbackværter. Sites-værktøjer, routing, faktisk login, offentlig reviewadgang og eventmodtagelse skal verificeres før aktivering |

[Projektprofilen](../drift/projektprofil.md) ejer de faktiske opstarts- og valideringskommandoer. [MVP-planen](../roadmap/chatgpt-app-mvp/index.md) ejer det resterende scope.
