---
type: "Operational Configuration"
title: "Planlagte udviklingskørsler"
description: "Opsætning, faktisk aktivering og pause er forskellige oplysninger."
status: "stable"
---
# Planlagte udviklingskørsler

En ChatGPT-automation er oprettet og aktiveret efter Anders' bestilling den 23. oktober 2026. Oprettelsen bekræfter den gemte tidsplan; første automatiske genoptagelse og adgang til det lokale projekt er endnu ikke verificeret. En installeret timer er ikke bevis for udført udvikling.

| Kørsel eller pulje | Kadence eller udløser | Faktisk status | Ansvar og aktiveringsgrundlag |
|---|---|---|---|
| Høreforeningens udviklingsorkestrering | Hver time; Europe/Copenhagen | Gemte indstillinger er enabled; første kørsel endnu ikke observeret | Denne projektsamtale, `/root`, efter mandatet |

Automationens prompt læser AGENTS, roadmap, mandat og arbejdsoversigt, kontrollerer eksisterende arbejderes status, reviewer afleveringer og starter næste afklarede leverance uden at dobbeltbestille. Den giver besked ved en milepæl, en fejl eller et nødvendigt svar; ellers er runden stille. Den skal stoppe med en konkret blokering, hvis projektfiler eller nødvendige værktøjer ikke er tilgængelige. Den aktuelle lokale eksekveringsforbindelse har meldt transportfrakobling; antag ikke adgang alene ud fra tidsplanen.

Ved konkret aktivering registreres ansvarlig session, faktisk fungerende vækkemekanisme, kadence, afleveringssignal og driftens forudsætninger. Verificér, at mekanismen kan vække den relevante session; en opsætningsbesked er ikke nok. Vælg en passende sikkerhedsrunde og reager på afleveringer, hvor værktøjet understøtter det.

Dokumentér begrænsninger som appens levetid, sessionens tilgængelighed og maskinens dvale, hvor de faktisk gælder. Ved pause startes ingen ny runde; gem sikkert arbejdsgrundlag og commit. Faktisk rest og nulstillingstid noteres efter [kvoteværnet](kvotevaern.md). Genoptagelse følger [mandatet](mandat.md).
