---
type: "Architecture Contract"
title: "Projektets systemgrænser"
description: "Projektets konkrete komponenter, dataejere, adgang og udførelsesgrænser."
status: "draft"
---
# Projektets systemgrænser

Det lokale fundament har én database og én fælles applikationsfunktion pr. værktøj. Sites-aktivering og platformens identitet er endnu ikke afprøvet. Det lokale miljø erstatter ikke den planlagte hosting- eller adgangsmodel.

| Ansvar | Aktuel grænse |
|---|---|
| Lokal transport | `server/local.ts` binder kun loopback og afleder syntetisk aktør fra en lokalt genereret nøgle. Klienten kan ikke angive bruger-id eller rolle som autoritet |
| MCP | `server/mcp.ts` ejer SDK-adapter, inputskemaer, værktøjskatalog og sikre fejl. Chat og MCP App bruger samme værktøjshandlere |
| Domæne | `server/domain.ts` ejer adgang, gyldighed, versionskonflikter og atomiske ændringer. Roller genlæses ved hvert kald |
| Persistens | Lokal SQLite gennem `server/database.ts` og `db/schema.sql`; produktets D1-adapter er endnu ikke aktiveret. Skema oprettes ved lokal opstart, aldrig under requests |
| Identitet | Ejerens subject konfigureres eksplicit. Lokale tokens i `.local/auth.json` er kun til udvikling; ingen hostet auth-bypass er implementeret |
| Viden og foredrag | Publicering og gyldighed kontrolleres server-side. Kladdeindhold holdes ude af almindelige læseveje, også når en bruger tidligere har tilmeldt sig |
| MCP App | `mcp-ui/lectures.ts` viser serverresultater og kalder værktøjsbroen; ingen direkte databaseadgang eller brugercredentials |
| Events og statistik | Publicering gemmer outbox, og værktøjskald tælles uden brugeridentitet. Eventabonnementer, faktisk levering og statistikvisning er endnu ikke implementeret |
| Ekstern aktivering | Sites-deployment er udskudt. Offentlig reviewadgang, eventlevering og ubemandet genlevering kræver senere platformforsøg |

[Projektprofilen](../drift/projektprofil.md) ejer de faktiske opstarts- og valideringskommandoer. [MVP-planen](../roadmap/chatgpt-app-mvp/index.md) ejer det resterende scope.
