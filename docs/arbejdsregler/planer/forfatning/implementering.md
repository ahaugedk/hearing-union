---
type: "Authoring Contract"
title: "Forfatning af implementeringsplan"
description: "Faseinddelte kontrakter gør arbejdet udførbart uden nye væsentlige designvalg."
status: "stable"
---
# Forfatning af implementeringsplan

Indgangen ejer milepæle, rækkefølge, afhængigheder og completion og linker til fælles scope og beslutningsstatus. Status har sit eget hjem, når planens størrelse kræver det. Små kontraktblade forgrenes efter ansvar eller problem.

Hver milepæl navngiver slutleverance, ændrede kodeejere, konkret forudsætning, normal produktindgang, observerbart resultat og afslutningskriterium. Beskriv eksisterende mekanik og det, der skal bygges. En fase er mere end en beslutningsliste.

Et kontraktblad angiver ændringer og berørte kodeområder, input- og outputeksempel, API-/SDK-, skema- og hostansvar samt vejen fra kilde, binding og bygning til faktisk aktivering og brug, hvor det er relevant. Beskriv identitet, adgang, isolation, persistens, kompatibilitet, fejl, ukendt udfald og genoptagelse. Link de krævende scenarietrin og afhængigheder. Brug [kontraktskabelonen](../../../skabeloner/plan/kontrakter/kontrakt.md) efter behov.

Planen efterlader ingen væsentlige produktvalg til udførelsen. Afgørende teknisk usikkerhed navngives som planmodning; almindelige kodevalg kan stå åbne. Planen er detaljeret, mens arbejdet er planlagt. Når en del er leveret, ejer koden detaljerne, og planen får én linje Leveret. Ingen leverings-, måle- eller bevisafsnit, performancemål eller løbende prisregnskaber; [skalering](../../levering/skalering.md) er et designkrav.

Afhængige leverancer er udkast indtil konkretisering og nødvendig godkendelse. Følg [gennemgangen](gennemgang.md).
