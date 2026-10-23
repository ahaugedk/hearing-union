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
| [MVP: platformresearch](../roadmap/chatgpt-app-mvp/kontrakter/platform.md) | Igangsat 23. oktober 2026; se mandat | `/root` overtager efter read-only research fra `/root/platform_research`; `orchestration/platform-readiness` | Afventer | Officielle dokumenter kan nu læses. Sites-oprettelse/deployment kræver ChatGPT web/desktop med Sites-værktøjer; de mangler her. Næste handling er oprettelse og faktisk forsøg med login, Events og reviewvej |
| [MVP: lokalt udviklingsfundament](../roadmap/chatgpt-app-mvp/implementering.md) | Lokal udvikling bestilt uden at afvente Sites; deployment udskudt | `/root` integrerer på `orchestration/platform-readiness`; domæne og MCP med adskilte filejere | I gang | Lokal database, domænefunktioner og MCP-forløb er implementeret, smoke-valideret og reviewet med rettelser. Næste leverance er eventabonnementer og holdbar lokal leveringskø; kildeimport, statistikvisning og fuld roadmapleverance står fortsat åbent |
| [Timebaseret orkestrering](planlagte-koersler.md) | Bestilt 23. oktober 2026 | `/root` | Afventer | Sessionsværktøjerne kan ikke administrere automationer. Ny automation skal oprettes og genoptagelse med projektadgang verificeres; Anders har bekræftet, at ingen eksisterende automation skal genbruges |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
