---
type: "Operational Configuration"
title: "Planlagte udviklingskørsler"
description: "Opsætning, faktisk aktivering og pause er forskellige oplysninger."
status: "stable"
---
# Planlagte udviklingskørsler

ChatGPT-automationen **Hearing Union koordinering** er aktiveret med timebaseret kadence i Europe/Copenhagen. Den genoptager orkestratorens arbejde i `ahaugedk/hearing-union` efter [mandatet](mandat.md). Faktisk aktivering og seneste resultat kontrolleres gennem automationsværktøjet.

| Kørsel eller pulje | Kadence eller udløser | Faktisk status | Ansvar og aktiveringsgrundlag |
|---|---|---|---|
| Hearing Union koordinering | Hver time; Europe/Copenhagen | Aktiveret i ChatGPT | Denne projektsamtale, `/root`, efter mandatet |

Prompten læser AGENTS, relevante planer, mandat, arbejdsoversigt og GitHub-afleveringer. Den kontrollerer eksisterende arbejdere før bestilling, delegerer implementering til underagenter og beholder arkitekturreview, code review, slutbrugertest og deployment hos orkestratoren. Nye svar i indbakkens registrerede HU-Q-mailtråde behandles efter [afklaringsarbejdsgangen](afklaringer/arbejdsgang.md). [Udgivelseskontrakten](../drift/sites-udgivelse.md) gælder også ved genoptagelse; allerede udgivne commits springes over. Dokumentændringer udløser ikke alene en ny produktudgivelse.

Giv kun besked efter en handling, fejl eller et nødvendigt svar. Hver fremtidig kørsel verificerer selv adgang til GitHub, terminal, underagenter og Sites og registrerer præcise begrænsninger. Aktivering beviser ikke, at alle fremtidige værktøjskald eller tests kan gennemføres.

Dokumentér begrænsninger som appens levetid, sessionens tilgængelighed og maskinens dvale, hvor de faktisk gælder. Ved pause startes ingen ny runde; gem sikkert arbejdsgrundlag og commit. Faktisk rest og nulstillingstid noteres efter [kvoteværnet](kvotevaern.md). Genoptagelse følger [mandatet](mandat.md).
