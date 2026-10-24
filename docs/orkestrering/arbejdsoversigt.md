---
type: "Operational Overview"
title: "Aktuelle udviklingsleverancer"
description: "Én linje pr. leverance med mandat, ejer, status og næste mulige handling."
status: "stable"
---
# Aktuelle udviklingsleverancer

MVP-udviklingen er igangsat efter [mandatet](mandat.md). Underagenter implementerer; `/root` ejer review, slutbrugertest og deployment. Mærkerne følger [koordinationen](koordinering.md); scope og godkendelsesgrundlag bliver i planen.

| Leverance og planlink | Igangsættelse og reference | Ejer, gren og arbejdsmappe | Mærke | Afhængighed og næste handling |
|---|---|---|---|---|
| [MVP: platformkontrakt](../roadmap/chatgpt-app-mvp/kontrakter/platform.md) | Igangsat; se mandat | `/root`; rettelser delegeres til underagent på egen gren | Klar | Kontrollér den eksisterende Sites-versions autentificerede `/health` og `/mcp`, ejerrolle og MCP Apps i faktisk host. Native Site MCP er ikke erklæret; vurder kontrakten før eventuelle rettelser bestilles |
| [MVP: samlet platformgennemgang](../roadmap/chatgpt-app-mvp/implementering.md) | MVP og privat Sites-deployment igangsat | `/root`; afgrænsede implementeringsopgaver til underagenter | Klar | Deployment er gennemført, men fuld MVP er ikke accepteret. Afprøv ChatGPT-eventmodtagelse, vedvarende retry-trigger, D1-bevaring/restore og faktisk brugeroplevelse. Offentlig pakke og revieweradgang følger planens særskilte krav |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
