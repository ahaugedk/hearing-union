---
type: "Plan Implementation"
title: "Implementering af ændringen"
description: "Milepæle fra konkret grundlag til samlet validering og afslutning."
status: "draft"
plan: "emne"
role: "implementation"
---
# Implementering af ændringen

[Visionen](vision.md) ejer scope, [beslutningerne](beslutninger.md) ejer godkendelser, og [scenarierne](scenarier.md) ejer målforløbene. Denne indgang ejer leveringsrækkefølge, afhængigheder og completion; [status](status.md) ejer fremdrift. Erstat faseeksemplerne med konkrete leverancer og kodeejere.

## Eksisterende grundlag

Navngiv den faktiske kode, de gældende kontrakter og det, der allerede virker. Beskriv manglende mekanik og afgørende usikkerhed. Henvis til konkrete kilder; en henvisning til en gammel plan beviser ingen implementering.

## Milepæle og afhængigheder

| Milepæl | Konkret slutleverance | Kræver først | Afslutning gennem normal indgang |
|---|---|---|---|
| M0: afklaring | Undersøgt teknisk grundlag og afstemte kontrakter | Relevant eksisterende kode og adgang | Afgørende usikkerhed er afklaret eller gjort til et konkret produktvalg |
| M1: sammenhængende kerne | Mindste ende-til-ende-del af hele det aftalte løfte | Navngivne godkendelser og leverancer | Konkret scenarietrin virker med faktisk adgang og persistens |
| M2: fuldt scope | Resterende aftalt adfærd og relevante fejl- og genoptagelsesveje | De faktiske forudsætninger | Alle aftalte scenarietrin kan gennemføres uden simulering |
| M3: samlet gennemgang | Integreret capability med løste fund | Hele aftalte scope | Scenariet er kørt med rettelsesrunder; bunken er løst |

M1 er en leveringsrækkefølge, ingen reduktion af v1 eller af det samlede scope. Tilpas antallet af milepæle efter ansvar og afhængigheder, ikke efter en fast skabelon. En leverance i en anden plan får et konkret link, en nødvendig kontrakt og en ansvarlig ejer; ingen antaget fremtidig capability.

## Kontrakter og kodeændringer

For hver leverance udfyldes et [kontraktblad](kontrakter/kontrakt.md), når detaljerne har selvstændigt læsebehov. Beskriv konkrete input/output, ejere, kodeområder, skema, adgang, bygning og aktivering samt relevante fejl og retries. Ingen væsentlige produktvalg gemmes i udførelsen.

## Validering og completion

Hver task og milepæl afsluttes med [smoke](../../validering/metoder/smoke.md). UI-ændringer får let visuel kontrol. En større feature får [gennemgang med rettelsesrunder](../../validering/metoder/visuel-gennemgang.md#gennemgang-med-rettelsesrunder). En ekstra kontrol begrundes i den aktuelle risiko og bliver ikke en ny smoke-suite.

Completion kræver hele visionens aftalte scope gennem normale indgange, indarbejdede produktvalg og [færdigkriteriet](../../validering/kriterier/leverancestatus.md). Navngiv her, hvilke varige emner der skal overtage betydningen. Følg [afslutningsreglen](../../arbejdsregler/planer/levering/completion.md); en delvis levering fjerner ikke den samlede plan.
