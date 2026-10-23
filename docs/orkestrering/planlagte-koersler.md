---
type: "Operational Configuration"
title: "Planlagte udviklingskørsler"
description: "Opsætning, faktisk aktivering og pause er forskellige oplysninger."
status: "stable"
---
# Planlagte udviklingskørsler

Anders har bestilt timebaseret genoptagelse den 23. oktober 2026 og præciseret, at både Site og automation skal oprettes fra bunden. Tidligere tekst om en aktiveret automation er derfor afløst. Den aktuelle session har intet automationsværktøj og kan ikke oprette tidsplanen. Ingen timer er oprettet, og timebaseret genoptagelse er ikke verificeret.

| Kørsel eller pulje | Kadence eller udløser | Faktisk status | Ansvar og aktiveringsgrundlag |
|---|---|---|---|
| Høreforeningens udviklingsorkestrering | Hver time; Europe/Copenhagen | Ikke oprettet; kræver et tilgængeligt automationsværktøj | Denne projektsamtale, `/root`, efter mandatet |

Automationens prompt læser AGENTS, roadmap, mandat og arbejdsoversigt, kontrollerer eksisterende arbejderes status, reviewer afleveringer og starter næste afklarede leverance uden at dobbeltbestille. Den giver besked ved en milepæl, en fejl eller et nødvendigt svar; ellers er runden stille. Den skal stoppe med en konkret blokering, hvis projektfiler eller nødvendige værktøjer ikke er tilgængelige. Den aktuelle cloud-session kan læse projektet og køre dokumentkontrollen; en fremtidig automation skal selv verificere samme adgang. En lokal baggrundsproces kan ikke antages at overleve cloud-taskens ophør eller genoptage ChatGPT-sessionen.

Ved konkret aktivering registreres ansvarlig session, faktisk fungerende vækkemekanisme, kadence, afleveringssignal og driftens forudsætninger. Verificér, at mekanismen kan vække den relevante session; en opsætningsbesked er ikke nok. Vælg en passende sikkerhedsrunde og reager på afleveringer, hvor værktøjet understøtter det.

Dokumentér begrænsninger som appens levetid, sessionens tilgængelighed og maskinens dvale, hvor de faktisk gælder. Ved pause startes ingen ny runde; gem sikkert arbejdsgrundlag og commit. Faktisk rest og nulstillingstid noteres efter [kvoteværnet](kvotevaern.md). Genoptagelse følger [mandatet](mandat.md).
