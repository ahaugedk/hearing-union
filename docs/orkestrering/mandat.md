---
type: "Working Agreement"
title: "Mandat for udviklingsorkestrering"
description: "Ét dokumenteret mandat afgrænser koordination, proceshandlinger og igangsættelse."
status: "stable"
---
# Mandat for udviklingsorkestrering

Anders har igangsat [MVP'en](../roadmap/chatgpt-app-mvp/vision.md). Bestillingen den 24. oktober 2026 fastlægger udvikling i denne projektsamtale med underagenter; Codex Cloud indgår ikke. Planlagt genoptagelse er efterfølgende standset af Anders; aktuel status står i [planlagte kørsler](planlagte-koersler.md). Mandatet godkender ingen nye væsentlige produktvalg. [Projektprofilen](../drift/projektprofil.md) ejer værktøjer og miljøer.

| Mandatfelt | Faktisk aftale |
|---|---|
| Produktejer | Anders; konsulentopgave for Høreforeningen |
| Orkestrator og ansvarlig session | Denne projektsamtale, `/root`; planlagte kørsler genoptager samme ansvar og kontrollerer eksisterende arbejde før ny bestilling |
| Implementering og reviewrettelser | Navngivne underagenter med afgrænset bestilling og egen gren; orkestratoren implementerer ikke selv |
| Arkitekturreview, code review og integration | Orkestratoren udfører selv review af hele ændringen; supplerende underagentreview erstatter ikke ansvaret |
| Slutbrugertest og samlet accept | Orkestratoren afprøver relevante brugerforløb; manglende host- eller browserkontrol registreres som uverificeret |
| Stående procesmandat | Research, konkretisering, udvikling og nødvendige reversible udviklingshandlinger inden for MVP'en, jf. bestillingen den 23. oktober 2026 |
| Sat i gang | MVP'en; først platformmodning. Konkrete ejergrænser og næste arbejde står i arbejdsoversigten |
| Fletning og push | Reviewet integration inden for projektet; opret ingen ny ekstern Git-remote uden konkret grundlag. Teknisk adgang skal først verificeres |
| Ekstern deployment og publicering | Udviklingsdeployment på den aftalte OpenAI Sites-platform indgår i MVP-arbejdet. Offentlig indsendelse følger planens reviewkrav; publicér ikke en ufærdig eller ikke-reviewet løsning |

Produktejeren sætter planer eller leverancer i gang. Inden for igangsat scope vælger orkestratoren rækkefølge, parallelitet og ejerfordeling. Underagenter implementerer; orkestratoren udfører research, review, slutbrugertest, integration og deployment. Modne opgaver til Anders går i [indbakken](afklaringer/indbakke.md) og meddeles på Gmail efter [arbejdsgangen](afklaringer/arbejdsgang.md).

Almindelige proceshandlinger inden for mandatet udføres uden nye autorisationsspørgsmål. Omfang og faktisk teknisk adgang er forskellige ting.

Arbejdere bruger egne worktrees, grene og adskilte miljøer efter [koordinationen](koordinering.md). De afleverer til orkestratoren; der flettes aldrig uden [review](review.md). Værktøjer, leverandører og modeller vælges lokalt, uden en konkurrerende orkestrator eller reviewvej.

Aktivering og genoptagelse kræver produktejerens konkrete instruktion. Pause følger [kvoteværnet](kvotevaern.md). Parkeret arbejde kræver særskilt genoptagelse. Udviklingsorkestrering er adskilt fra produktets runtime og giver ingen produktagent ekstra råderum.
