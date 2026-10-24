---
type: "Operational Inbox"
title: "Spørgsmål klar til dit svar"
description: "Kun modne produktvalg og handlinger med oplæg og præcist afhængigt scope."
status: "stable"
---
# Spørgsmål klar til dit svar

## Kobl Codex-environmentet til GitHub-repositoryet

**Ejer:** Anders  
**Anbefaling:** Genbrug environmentet `hearing-union`; åbn dets indstillinger, kontrollér at `ahaugedk/hearing-union` er valgt som repository, og gem eller genforbind GitHub-adgangen. Opret kun et nyt environment, hvis det eksisterende ikke kan knyttes til repositoryet.

**Hvorfor:** En instruktion i [deployment-PR #3](https://github.com/ahaugedk/hearing-union/pull/3) med `@codex address that feedback` blev afvist med beskeden “create an environment for this repo”. Den eksisterende Cloud-worker kan pushe, men GitHub kan ikke vække en Codex-worker fra PR-kanalen.

**Svarmuligheder:**

1. Bekræft, at det eksisterende environment er genforbundet til repositoryet.
2. Oplys, at indstillingen ikke findes eller fejler, så orkestratoren kan dokumentere begrænsningen og vælge en anden workerkanal.

**Blokeret scope:** Automatisk delegation og genoptagelse af workeropgaver direkte fra GitHub-kommentarer. Den aktuelle reviewrettelse og øvrigt uafhængigt arbejde fortsætter.
