---
type: "Working Agreement"
title: "Fra produktretning til færdig capability"
description: "Sammenhængen mellem planmodning, beslutning, bestilling, integration og afslutning."
status: "stable"
---
# Fra produktretning til færdig capability

Forløbet nedenfor forbinder arbejdsreglernes ansvar. En uafklaret afhængighed standser kun den berørte leverance; uafhængig research og godkendt arbejde fortsætter.

| Trin | Næste konkrete resultat | Autoritativt hjem |
|---|---|---|
| Forstå problemet | Aktør, ønsket effekt og grænse er konkrete | [Produktretning](../produkt/retning/index.md) og planens vision |
| Undersøg grundlaget | Faktisk kode, kontrakter og afgørende usikkerhed er afstemt | [Researchreglen](beslutninger/forberedelse/grundlag.md) og relevante planblade |
| Modn planen | Vision, scenarier og faseinddelt implementering kan bruges uden chat | [Planens tre roller](planer/struktur/tre-roller.md) og [gennemgangen](planer/forfatning/gennemgang.md) |
| Afklar væsentlige valg | Faktisk svar har eksplicit scope, dato og reference | Planens beslutningshjem via [afklaringsarbejdsgangen](../orkestrering/afklaringer/arbejdsgang.md) |
| Vurder klarhed og igangsættelse | Leverancen har ejergrænse, afhængigheder og et faktisk startsignal | [Arbejdsoversigten](../orkestrering/arbejdsoversigt.md) efter mandatet |
| Bestil og byg | En arbejder leverer afgrænset capability på egen gren | [Koordination](../orkestrering/koordinering.md), plan og konkret kode |
| Aflever og review | Hele grenen er gennemgået; fund er behandlet | [Review](../orkestrering/review.md), arbejderens gren og kort aflevering |
| Integrér og afprøv | Samlet kode virker i det faktiske miljø | [Smoke](../validering/metoder/smoke.md) og relevant [browsergennemgang](../validering/metoder/visuel-gennemgang.md) |
| Ret og gennemgå igen | Større capability virker fra start, og bunken er løst | Den samme plan og gennemgang, uden en ny bevislog |
| Afslut | Varig viden er foldet, forbedring registreret og afsluttet plan fjernet | [Completion](planer/levering/completion.md) |

Godkendt retning er ikke det samme som en implementeringsklar leverance. En klar leverance er ikke automatisk sat i gang. Et commit eller et grønt smoke-resultat gør heller ikke hele capabilityen færdig; [færdigkriteriet](../validering/kriterier/leverancestatus.md) gælder.

Ved en selvstændig delafslutning kan den leverede del registreres, mens resten af den samlede plan forbliver åben. Mellem faser vurderes den fælles arkitektur, så dublerede begreber og særveje ikke bliver grundlag for næste lag.
