---
type: "Working Agreement"
title: "Mandat for udviklingsorkestrering"
description: "Ét dokumenteret mandat afgrænser koordination, proceshandlinger og igangsættelse."
status: "draft"
---
# Mandat for udviklingsorkestrering

Anders har den 23. oktober 2026 i projektets orkestratorsamtale bestilt: »start udviklingen som orkestrator i projektet«. Den efterfølgende bestilling fastlægger én koordineringsrunde i timen. Mandatet gælder [MVP-planens scope](../roadmap/chatgpt-app-mvp/vision.md), ikke nye væsentlige produktvalg. [Projektprofilen](../drift/projektprofil.md) ejer værktøjer og miljøer.

| Mandatfelt | Faktisk aftale |
|---|---|
| Produktejer | Anders; konsulentopgave for Høreforeningen |
| Orkestrator og ansvarlig session | Denne projektsamtale, `/root`; planlagte kørsler genoptager samme ansvar og kontrollerer eksisterende arbejde før ny bestilling |
| Reviewer og integrationsansvarlig | Orkestratoren fordeler uafhængigt review; integration kræver afsluttet review og faktisk Git-adgang |
| Stående procesmandat | Research, konkretisering, udvikling og nødvendige reversible udviklingshandlinger inden for MVP'en, jf. bestillingen den 23. oktober 2026 |
| Sat i gang | MVP'en; først platformmodning. Konkrete ejergrænser og næste arbejde står i arbejdsoversigten |
| Fletning og push | Reviewet integration inden for projektet; opret ingen ny ekstern Git-remote uden konkret grundlag. Teknisk adgang skal først verificeres |
| Ekstern deployment og publicering | Udviklingsdeployment på den aftalte OpenAI Sites-platform indgår i MVP-arbejdet. Offentlig indsendelse følger planens reviewkrav; publicér ikke en ufærdig eller ikke-reviewet løsning |

Den genbrugelige arbejdsform har én orkestrator. Produktejeren sætter planer eller leverancer i gang. Inden for det igangsatte scope vælger orkestratoren rækkefølge, parallelitet og ejerfordeling efter afhængigheder og kapacitet. Research, planmodning og afstemning mod kode kan foregå uden igangsættelse af produktkode.

Et stående procesmandat bør afklare research, forsøg, udviklingskontroller, installation af udviklingsafhængigheder, miljøopstart, udviklingsaktivering, særskilt valgt dev-reset, review, integration og relevant push. Når mandatet er givet, udføres almindelige proceshandlinger uden nye autorisationsspørgsmål. Det godkender ingen væsentlige produktvalg. Omfang og teknisk adgang er forskellige ting.

Arbejdere bruger egne worktrees, grene og adskilte miljøer efter [koordinationen](koordinering.md). De afleverer til orkestratoren; der flettes aldrig uden [review](review.md). Værktøjer, leverandører og modeller vælges lokalt, uden en konkurrerende orkestrator eller reviewvej.

Aktivering og genoptagelse kræver produktejerens konkrete instruktion. Pause følger [kvoteværnet](kvotevaern.md). Parkeret arbejde kræver særskilt genoptagelse. Udviklingsorkestrering er adskilt fra produktets runtime og giver ingen produktagent ekstra råderum.
