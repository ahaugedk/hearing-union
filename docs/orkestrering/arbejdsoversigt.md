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
| [MVP: lokale eventabonnementer og leveringskø](../roadmap/chatgpt-app-mvp/kontrakter/events.md) | Lokal udvikling bestilt uden at afvente Sites; deployment udskudt | `/root`; `orchestration/platform-readiness`, eksisterende cloud-checkout | Klar | Byg videre på det lokale database-/MCP-fundament: udtrykkeligt abonnement, varig kø, afmelding og sikre retries. Faktisk ChatGPT-levering og ubemandet host-trigger valideres senere; kildeimport, statistikvisning og resten af roadmappet står fortsat åbent |
| [Timebaseret orkestrering](planlagte-koersler.md) | Bestilt 23. oktober 2026 | `/root` | Afventer | Sessionsværktøjerne kan ikke administrere automationer. Ny automation skal oprettes og genoptagelse med projektadgang verificeres; Anders har bekræftet, at ingen eksisterende automation skal genbruges |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
