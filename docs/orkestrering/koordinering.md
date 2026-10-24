---
type: "Working Agreement"
title: "Koordination af udviklingsleverancer"
description: "Korte runder integrerer færdigt arbejde og starter næste afklarede leverance."
status: "stable"
---
# Koordination af udviklingsleverancer

Orkestratoren bestiller implementering og rettelser direkte hos underagenter i denne samtale. GitHub bevarer kode, review og varig status; Codex Cloud og GitHub-omtaler af eksterne workers indgår ikke.

En koordineringsrunde kontrollerer eksisterende arbejde og fortsætter uafhængigt af menneskesvar:

1. Aflæs kapacitet og forbrug efter [kvoteværnet](kvotevaern.md).
2. Læs [arbejdsoversigten](arbejdsoversigt.md), nye afleveringer og Git-status for berørte grene. Kontrollér, at en ejer stadig arbejder, før arbejdet genbestilles.
3. Orkestratoren udfører selv arkitektur- og [code review](review.md) af afleverede grene mod gældende main og plan. Send samlede fund tilbage til arbejderen. Flet først, når fund er løst eller et begrundet afslag er vurderet og accepteret. Orkestratoren ejer slutbrugertest, smoke ved milepælen, visuel kontrol ved UI-ændring og rettelsesrunder før en større feature accepteres.
4. Start næste klarlagte leverance inden for igangsat scope efter rækkefølge, afhængigheder og ejergrænser. Parallelisér kun uafhængigt arbejde. Overhold faktisk miljøkapacitet fra projektprofilen, og dobbeltbestil aldrig samme leverance.
5. Opdatér arbejdsoversigten, og føj kun modne spørgsmål til [indbakken](afklaringer/indbakke.md).
6. Fortsæt nødvendige afleverings- og rettelsesrunder i den aktive samtale. Ved en planlagt runde gemmes sikkert arbejdsgrundlag før afslutning. Giv besked ved en afsluttet milepæl, fejl eller nødvendigt svar; uændret tilstand er stille.

En [bestilling](../skabeloner/bestilling.md) angiver slutleverance, plan og relevante blade, ejergrænse, afhængigheder, arbejdsmappe, gren og normal valideringsvej. Et fælles interface har én navngiven ejer, før afhængigt arbejde starter.

Hver arbejder har egen worktree, gren og isoleret dev-miljø med egne data og porte. Egne ændringer committes løbende. Fletning og push følger det dokumenterede mandat; arbejdsgrene publiceres ikke som en automatisk del af arbejdsgangen. Reset vælges særskilt, og to agenter nulstiller aldrig samme miljø samtidigt. Aflevering er højst ti linjer med resultat, gren, commit, smoke og mangler efter [skabelonen](../skabeloner/aflevering.md).

Ved afslutning følges [completion](../arbejdsregler/planer/levering/completion.md). Mellem faser holdes arkitekturen op mod produktløftet: dublerede begreber, parallelle modeller og særveje samles, hvor en fælles løsning gavner produktet. Fund bliver konkrete planer; væsentlige valg godkendes før ombygningen.

| Mærke i arbejdsoversigten | Betydning |
|---|---|
| Planmodning | Kontrakt, forsøg eller beslutningsgrundlag skal konkretiseres |
| Klar | Scope, ejergrænse og afsæt er klar; igangsættelse er en særskilt oplysning |
| I gang | En navngiven arbejder udfører en konkret bestilling |
| Afventer | En navngiven afhængighed eller et svar blokerer præcist scope |

Arbejdsoversigten angiver også, om scope er sat i gang. Mærket Klar er ingen implementeringsautorisation.
