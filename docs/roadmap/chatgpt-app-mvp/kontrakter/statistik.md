---
type: "Plan Implementation"
title: "Anonym brugsstatistik i MCP App"
description: "Aggregering og administratorrapportering uden individuelle opslagshistorikker."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Anonym brugsstatistik i MCP App

Fase 6 i [implementeringen](../implementering.md). Følg [visionens scope](../vision.md) og [administrationsscenariet](../scenarier/administration.md). [Fundamentet](fundament.md) ejer datamodellen og adgangskontrollen.

Tilføj serverbaserede tællere omkring de fælles funktioner. Registrér dato, værktøj/handling, udfald og det relevante vidensemne. Skeln mellem søgeresultater, direkte opslag, tilmelding og webhooklevering; et leveret event er ikke dokumentation for, at brugeren har læst det.

Opdatér `usage_daily` med atomisk upsert. Gem ingen fritekstsøgninger, samtaletekst, IP-adresser, callbackdata eller stabile bruger-id'er i statistiklaget. MVP'en må derfor ikke påstå at kunne vise unikke brugere eller individuelle brugerrejser. Teknisk fejllogning begrænses til request-id, fejlkode, varighed og tidspunkt.

Implementér `admin_usage_report({ from, to, groupBy })` med begrænsede datointervaller og tilladte grupperinger. Returnér tællere og trends for emner, handlinger, tilmeldinger og leveringsfejl. Undertryk små segmenter ved følsomme emner for at begrænse udledning om enkelte brugere.

Byg `mcp-ui/analytics/` som en separat MCP-ressource med datovalg, oversigtstal og tabeller/enkle grafer. Den bruger samme administratorværktøj som chatten. Brugerpræferencer og deltagerlister kan ikke kobles til statistikken gennem rapportværktøjet; auditloggen forbliver separat.

**Færdig når:** Administratoren kan undersøge brugen gennem både chat og MCP App, almindelige brugere afvises, og statistikdatamodellen ikke indeholder brugeridentifikatorer.
