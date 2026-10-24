---
type: "Plan Implementation"
title: "Afprøv Sites, login og eventunderstøttelse"
description: "Tidlig teknisk afklaring af de platformforudsætninger, resten af planen afhænger af."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Afprøv Sites, login og eventunderstøttelse

Fase 0 i [implementeringen](../implementering.md). Produktløftet og bestillingsgrænsen står i [visionen](../vision.md).

**Formål:** Verificér at de implementerede hovedfunktioner fungerer gennem Sites, login og MCP Events og kan indgå i offentlig indsendelse.

1. Genbrug det eksisterende Sites-projekt og dets versionsstyrede kilde. Bevar `mcp` og D1-bindingen `DB` i `.openai/hosting.json`; brug ingen R2-binding i MVP'en.
2. Afprøv den private deployments `server/discover`, `tools/list` og et autentificeret `get_profile`. Brug MCP `2026-07-28`, som Sites-instruktionerne foreskriver.
3. Verificér to forskellige konti og at Sites leverer stabilt, Site-afgrænset bruger-id. Kontrollér at klienten ikke kan forfalske identitet via egne headers.
4. Afprøv én statisk MCP App og ét testabonnement med callback-verifikation og faktisk eventlevering til en inaktiv chat.
5. Afprøv en understøttet, ubemandet måde at genoptage fejlede leveringer på Sites. Start med et beskyttet endpoint, som en tilknyttet cloud-opgave kan kalde. Verificér adgang uden en åben brugersession; antag ikke, at vilkårlige Worker-cronjobs eller evigt kørende processer findes.
6. Afklar offentlig indsendelse: udgiveridentitet, domæneverifikation, Sites-login og revieweradgang. En privat Sites-pluginforbindelse er ikke dokumentation for, at offentlig godkendelse er mulig.

**Leverance:** Gennemfør et afgrænset integrationsforsøg, og fold kun nødvendige platformbegrænsninger ind i de berørte kontrakter; opret ingen særskilt bevisrapport. MCP Events er aktuelt dokumenteret til Work på web, Work/Cloud på desktop og dots; almindelig chat må ikke loves samme understøttelse.

**Færdig når:** Login, MCP-rendering og eventlevering er demonstreret. Eventuelle mangler i auth/review eller varig genlevering er konkret beskrevet og løst i arkitekturen, før de afhængige funktioner færdiggøres. Byg ikke en ekstra OAuth-server som uafklaret reservevej.

## Planmodning ved en begrænsning

MCP-protokol og runtimeoplysninger er undersøgelsesgrundlag fra planlægningen den 23. oktober 2026. Genkontrollér dem mod den aktuelle officielle dokumentation. Hvis Sites ikke kan opfylde et centralt løfte, beskrives den konkrete begrænsning og et gennemarbejdet valg efter projektets beslutningsproces; ændr ikke hosting, auth eller aftalt scope stiltiende.

Platformdetaljer skal genkontrolleres ved implementering; dokumentationen ændrer sig.

- [MCP Events og understøttede ChatGPT-oplevelser](https://developers.openai.com/plugins/build/mcp-events)
- [MCP Apps: ressourcer, bro og indlejret UI](https://developers.openai.com/plugins/build/chatgpt-ui)
- [Plugin guidelines: data, review og brugeroplevelse](https://developers.openai.com/plugins/plugin-guidelines)
- [Offentlig indsendelse, domæneverifikation og revieweradgang](https://developers.openai.com/plugins/deploy/submission)
- [OpenAI MCP Extensions: implementeringsvejledning](https://github.com/openai/mcp-extensions/blob/main/AGENTS.md)

Sites-starterens aktuelle instruktioner for MCP, identitet, D1-migrationer og ubemandede opdateringer læses før de relevante faser. Der antages ikke yderligere hostingfunktioner ud over det, der er verificeret i denne afprøvning.

## Aktuelle forudsætninger for forsøget

Det officielle [MCP Extensions-grundlag](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md) beskriver `server/discover` og protokolversionen. Sites' egne instruktioner ejer login, hostingmanifest og ubemandede kørsler; disse må ikke udledes alene af planens forslag.

Orkestratoren har terminal, GitHub, Sites og underagenter. Det eksisterende Site har et verificeret hosted databaseskema og en kanonisk privat MCP-plugin; næste forsøg bruger denne forbindelse med rigtig brugeridentitet. Et deployment eller lokal injektion af identitetsheaders erstatter ikke faktisk autentificeret accept. [Arbejdsoversigten](../../../orkestrering/arbejdsoversigt.md) ejer næste handling.

[Data- og forbindelsesvejledningen](https://developers.openai.com/codex/sites/data-and-connections) beskriver D1 og Sites-login, men etablerer ikke den stabile Site-afgrænsede identitet, som adgangsmodellen kræver. [Indsendelsesvejledningen](https://developers.openai.com/plugins/deploy/submission) beskriver offentlig pluginadgang og reviewerens normale loginvej. Sammenhængen mellem Sites-login og offentlig pluginadgang skal demonstreres i forsøget; dokumenternes separate funktioner er ikke bevis for en fungerende samlet adgangsmodel.
