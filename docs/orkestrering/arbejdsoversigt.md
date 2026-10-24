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
| [Minimal installations- og reviewwebdel](../roadmap/chatgpt-app-mvp/kontrakter/udgivelse.md) | Igangsat ved Anders' bestillinger 24. oktober 2026 | `/root`; implementering integreret fra underagent | Afventer | Minimal brandtilpasset flade er udgivet. Verificér katalogadressen før knappen aktiveres; udgiver/persondataansvar/support afventer [HU-Q-20261024-01](afklaringer/indbakke.md). Offentlig indsendelse er ikke gennemført |
| [MVP: platformkontrakt](../roadmap/chatgpt-app-mvp/kontrakter/platform.md) | Igangsat; se mandat | `/root`; migrationsrettelse reviewet og integreret | Klar | Hosted schema er verificeret, og privat MCP-plugin er oprettet. Næste kontrol er autentificeret `/health`, MCP-værktøjer, ejerrolle og faktisk ChatGPT-forbindelse; deployment alene er ikke accept |
| [MVP: samlet platformgennemgang](../roadmap/chatgpt-app-mvp/implementering.md) | MVP og privat Sites-deployment igangsat | `/root`; afgrænsede implementeringsopgaver til underagenter | Klar | Deployment er gennemført, men fuld MVP er ikke accepteret. Afprøv ChatGPT-eventmodtagelse, vedvarende retry-trigger, D1-bevaring/restore og faktisk brugeroplevelse. Offentlig pakke og revieweradgang følger planens særskilte krav |

Planmodning og tekniske ejerafstemninger står på leverancen. Kun præcist afhængigt scope venter. En afsluttet række fjernes efter integration og completion; oversigten er ingen historisk log.
