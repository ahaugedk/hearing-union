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
| [Minimal installations- og reviewwebdel](../roadmap/chatgpt-app-mvp/kontrakter/udgivelse.md) | Igangsat ved Anders' bestillinger 24. oktober 2026 | `/root/workflow_docs`; `feature/minimal-brand-site`; review, slutbrugertest og deployment hos `/root` | I gang | Installationsknap er implementeret og deployet i version 3, men katalogadressen er endnu ikke verificeret. Tilpas stil og minimale støttesider; bekræft faktiske udgiver-/privatlivsoplysninger og kataloglink før offentlig indsendelse |
| [MVP: platformkontrakt](../roadmap/chatgpt-app-mvp/kontrakter/platform.md) | Igangsat; se mandat | `/root`; migrationsrettelse hos `/root/sites_migrations` på egen gren | I gang | Version 3 erklærer native MCP, men discovery svarer 503, og hostet DB har ingen tabeller. Ret pakkens hosted migrationsintegration; verificér derefter `/health`, `/mcp`, ejerrolle og faktisk ChatGPT-forbindelse |
| [MVP: samlet platformgennemgang](../roadmap/chatgpt-app-mvp/implementering.md) | MVP og privat Sites-deployment igangsat | `/root`; afgrænsede implementeringsopgaver til underagenter | Klar | Deployment er gennemført, men fuld MVP er ikke accepteret. Afprøv ChatGPT-eventmodtagelse, vedvarende retry-trigger, D1-bevaring/restore og faktisk brugeroplevelse. Offentlig pakke og revieweradgang følger planens særskilte krav |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
