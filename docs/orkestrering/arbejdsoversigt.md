---
type: "Operational Overview"
title: "Aktuelle udviklingsleverancer"
description: "Én linje pr. leverance med mandat, ejer, status og næste mulige handling."
status: "stable"
---
# Aktuelle udviklingsleverancer

MVP-udviklingen er igangsat efter [mandatet](mandat.md). Først konkretiseres platformgrundlaget. Mærkerne følger [koordinationen](koordinering.md); scope og godkendelsesgrundlag bliver i planen.

| Leverance og planlink | Igangsættelse og reference | Ejer, gren og arbejdsmappe | Mærke | Afhængighed og næste handling |
|---|---|---|---|---|
| [MVP: platformresearch](../roadmap/chatgpt-app-mvp/kontrakter/platform.md) | Igangsat 23. oktober 2026; se mandat | `/root` overtager efter read-only research fra `/root/platform_research`; `orchestration/platform-readiness` | Afventer | Officielle dokumenter kan nu læses. Anders har oprettet Site; adressen står i projektprofilen. Anonymt kald svarer 401. Næste platformhandling er verificering af kildekodekobling, login, Events og reviewvej, når deployment genoptages; lokal udvikling fortsætter |
| [MVP: samlet platformgennemgang og udgivelsesforberedelse](../roadmap/chatgpt-app-mvp/implementering.md) | Lokal udvikling igangsat; Sites-deployment udskudt efter bestilling | `/root`; `orchestration/platform-readiness`, eksisterende cloud-checkout | Afventer | Lokal kode, kildeimport og metadataudkast er implementeret og reviewet med rettelser. Resterende afhængigheder er faktisk Sites-runtime/D1/login, MCP Apps i rigtig host, inaktiv ChatGPT-eventmodtagelse, vedvarende retry-trigger, D1-restore samt offentlig pakke/revieweradgang. De kræver platformadgang og senere aktivering; fuldt roadmap er ikke leveret |
| [Timebaseret orkestrering](planlagte-koersler.md) | Bestilt 23. oktober 2026 | `/root` | Afventer | Sessionsværktøjerne kan ikke administrere automationer. Ny automation skal oprettes og genoptagelse med projektadgang verificeres; Anders har bekræftet, at ingen eksisterende automation skal genbruges |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
