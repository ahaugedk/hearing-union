---
type: "Plan Scenarios"
title: "Find, tilmeld og genåbn et foredrag"
description: "En bruger finder et foredrag og får samme tilmelding gennem chat og indlejret visning."
status: "draft"
plan: "chatgpt-app-mvp"
role: "scenarios"
---
# Find, tilmeld og genåbn et foredrag

Mikkel har en intern konto og søger et kommende onlineforedrag om et emne, han interesserer sig for. En administrator har publiceret foredraget med tidspunkt og kapacitet.

1. Mikkel spørger ChatGPT efter relevante kommende foredrag. MCP App viser dato, format, beskrivelse og pladsstatus.
2. Han åbner et foredrag og klikker »Tilmeld«. Serverens resultat afgør, om visningen viser succes eller fuldt hus; et klik alene tæller ikke som tilmelding.
3. Mikkel skriver »Tilmeld mig til det samme foredrag«. Han får samme tilmelding og optager ikke en ekstra plads.
4. I en ny samtale spørger han efter egne tilmeldinger og genfinder foredraget. Han kan afmelde gennem chat eller visning, hvorefter pladsen frigives.
5. To forskellige konti forsøger at tage den sidste plads samtidigt. Kun én får en plads; den anden får et forståeligt udfald. Et aflyst eller allerede startet foredrag kan ikke tilmeldes.

Tomme søgeresultater, en snæver skærm eller en manglende grafisk host må ikke skjule resultatet af en handling. De samme værktøjer skal kunne bruges gennem chat alene.

[Foretragskontrakten](../kontrakter/foredrag.md) ejer kapacitet og UI. Forløbet er en forventning, ikke et kørselsresultat.
