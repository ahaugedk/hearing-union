---
type: "Operational Overview"
title: "Aktuelle udviklingsleverancer"
description: "Én linje pr. leverance med mandat, ejer, status og næste mulige handling."
status: "stable"
---
# Aktuelle udviklingsleverancer

Arbejdet drives til færdigt og offentligt udgivet produkt efter [mandatet](mandat.md) og [udgivelsesvejen](../roadmap/chatgpt-app-mvp/implementering.md#aktivering-og-completion). Underagenter implementerer; `/root` ejer arkitekturreview, code review, slutbrugertest og deployment. Kun konkrete opgaver til Anders går i [indbakken](afklaringer/indbakke.md) og Gmail. Mærkerne følger [koordinationen](koordinering.md).

| Leverance og planlink | Igangsættelse og reference | Ejer, gren og arbejdsmappe | Mærke | Afhængighed og næste handling |
|---|---|---|---|---|
| [Autentificeret platformadgang](../roadmap/chatgpt-app-mvp/kontrakter/platform.md) | Igangsat; fuldførelsesmandat 24. oktober 2026 | `/root` | Afventer | Afventer Anders' aktivering i [HU-Q-20261024-02](afklaringer/indbakke.md#hu-q-20261024-02-aktivér-den-private-app-til-slutbrugertest); mail er sendt, og orkestratorens aktiveringsværktøjer er udtømt. Kald derefter `/health`/`get_profile` gennem den kanoniske plugin. Færdig når stabil brugeridentitet og ejerrolle er kontrolleret |
| [Samlede brugerforløb](../roadmap/chatgpt-app-mvp/scenarier/index.md) | Igangsat; afhænger af autentificeret adgang | `/root` tester; underagenter retter på egne grene | Afventer | Hostet viden og foredrag er tomme. Importér de 25 kuraterede kildeposter og opret syntetisk reviewforedrag gennem ejerens native adminværktøjer; ingen rå D1-seed eller selvvalgte identitetsheaders. Afprøv kilde/udløb, præferencesamtykke, foredragsvisning/tilmelding/genfinding, roller/isolation, sletning og statistik. Færdig når normale indgange virker og reviewfund er løst |
| [Faktiske events og varig drift](../roadmap/chatgpt-app-mvp/kontrakter/events.md) | Igangsat; afhænger af brugerforløb | `/root` ejer liveaktivering og scheduler-test; rettelser bestilles særskilt hos underagent | Afventer | Opret Work/Cloud-abonnement, publicér match/ikke-match og afmeld. Afprøv genforsøg uden åben chat samt D1-bevaring/restore. Færdig når relevant besked og varig genlevering virker, og afmelding stopper nye leveringer |
| [Listing, sider og reviewmateriale](../roadmap/chatgpt-app-mvp/kontrakter/udgivelse.md) | Igangsat; uafhængig forberedelse fortsætter | `/root`; underagent `orchestration/release-completion` forbereder metadata | I gang | Bekræft udgiver via [HU-Q-20261024-01](afklaringer/indbakke.md); afklar derefter lande. De fire listing-URL'er kræver nu privat login, og politik/vilkår er udkast. Færdiggør offentlig adgang/indhold, ikon, optaget demo, fem positive/tre negative cases og normal revieweradgang. Færdig når materialet er sandt, tilgængeligt og cases kan gennemføres |
| [Offentlig review og installation](../roadmap/chatgpt-app-mvp/kontrakter/udgivelse.md) | Igangsat; afhænger af accepterede brugerforløb og reviewmateriale | `/root`; nødvendige identitets-/domænehandlinger til Anders via indbakke/Gmail | Afventer | Bevar kanonisk Sites-ejerskab; afklar understøttet indsendelsesvej, gennemfør verifikation/scans, indsend og løs fund. Færdig når godkendt release er publiceret, ny installation virker og faktisk katalogadresse aktiverer forsiden |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
