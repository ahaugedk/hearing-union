---
type: "Plan Implementation"
title: "Foredrag og tilmelding gennem MCP App"
description: "Søgning, foredragstilstande, atomiske tilmeldinger og den indlejrede brugeroplevelse."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Foredrag og tilmelding gennem MCP App

Fase 4 i [implementeringen](../implementering.md). Følg [visionens scope](../vision.md), [foredragsscenariet](../scenarier/foredrag.md) og [administrationsscenariet](../scenarier/administration.md). [Fundamentet](fundament.md) ejer tabeller, aktør og fælles kaldesti.

Implementér foredragsfunktionerne med tilstandene `draft`, `published` og `cancelled`. Kun publicerede, kommende foredrag er tilmeldingsbare. Filtrér søgning efter fritekst, emne, region, format og dato. `my_registrations` viser kun egne tilmeldinger.

Tilmelding skal være idempotent og kapacitetssikker: kontrollér status, tid og ledige pladser i samme atomiske databaseoperation som oprettelse/genaktivering af tilmeldingen. Brug en betinget SQL-skrivning og relevante constraints eller database-trigger; undgå separat læsning af antal efterfulgt af en ubeskyttet insert. Test konkurrerende tilmeldinger til sidste plads. Afmelding frigør plads; gentagne kald ændrer ikke resultatet.

Byg foredragsvisningen i `mcp-ui/lectures/` og bundle den ved build til en selvstændig HTML-ressource, fx `ui://hoereforeningen/lectures-v1.html`. Bundle importeres som tekst i Worker-outputtet, ikke via runtime-læsning fra disk.

- Tilknyt ressourcen til liste- og detaljeværktøjer med MCP Apps-metadata. Brug den fælles MCP Apps-bro til resultater og værktøjskald.
- Vis titel, dato, format, sted, beskrivelse, pladsstatus og egen tilmelding. Knappen »Tilmeld« kalder `lecture_register`; UI viser først succes efter backendens svar.
- Understøt indlæsning, tom liste, udsolgt, aflyst, netværksfejl og allerede tilmeldt. Opdatér visningen fra serverens resultat efter hver handling.
- Brug dansk tekst, tastaturnavigation, synlig fokus, god kontrast og skærmlæserlabels. Al information skal kunne forstås uden lyd.
- Hold visningen fri for direkte database/API-kald med brugercredentials. Samme funktioner skal fungere uden grafisk visning.

**Færdig når:** Et foredrag kan oprettes gennem ChatGPT, findes, vises og til-/afmeldes både via chat og knap. Ingen overbooking ved samtidige kald.
