---
type: "Development Overview"
title: "Færdige forbedringer"
description: "Én linje pr. større logisk ændring med dato, forbedring og commit."
status: "stable"
---
# Færdige forbedringer

- 2026-10-24 — Afgrænset administratorværktøj til event-genforsøg og officielle reviewikoner/farver; faktisk eventaktivering og offentlig review er fortsat åbne — [PR #16](https://github.com/ahaugedk/hearing-union/pull/16), [PR #17](https://github.com/ahaugedk/hearing-union/pull/17).

- 2026-10-24 — Konkret resterende udgivelsesvej og kø; fjernet ubekræftet udgiver fra metadata, valgt uddannelseskategori og præciseret reviewcasenes forberedelse — `orchestration/release-completion`.
- 2026-10-24 — Hosted D1-schema anvendes gennem Sites' migrationssidecar under korrekt arkivrod; tabeller verificeret efter udgivelse — [PR #15](https://github.com/ahaugedk/hearing-union/pull/15).

- 2026-10-24 — Minimal installationsforside med verificerbar katalogadresse som runtime-konfiguration og native MCP-deklaration; faktisk installation afventer kataloglink og fungerende hosted MCP — [PR #12](https://github.com/ahaugedk/hearing-union/pull/12).
- 2026-10-24 — Hvid, grå og limegrøn installationsflade med Trebuchet-fallback; fjernet teknisk forbindelsesside, opdigtet standardudgiver og ubekræftet adresse — [PR #14](https://github.com/ahaugedk/hearing-union/pull/14).
- 2026-10-24 — GitHub-overdragelse mellem Codex Cloud og ChatGPT Sites med fast platformkontrakt og maskinlæsbar deploymentstatus — `e9e0294269851e3a64320d668c913d8e73306559`.
- 23. oktober 2026: Lokalt persistent MCP-fundament med konti, roller, gyldig viden og foredragstilmelding; smoke og uafhængigt review bestået. Commit `13904a3`.

- 23. oktober 2026: Lokale eventabonnementer og leveringskø, 25 kildeposter, anonym statistik, backup/restore og reviewudkast med brugerens kontaktoplysninger. Commit `2b821c7`.

Registrering følger [completion](arbejdsregler/planer/levering/completion.md) og beviser ikke i sig selv, at en capability virker.

- 2026-10-24: Fælles asynkron persistens, Cloudflare Worker/D1, Sites’ indbyggede brugeridentitet og reproducerbar deploymentpakke til det eksisterende Site; se Git-commit på deployment/cloudflare-sites. Ekstern aktivering kræver Sites-provisionering og platformadgang.

- 2026-10-24: Deterministisk deploymentpakke og valideret GitHub-overdragelse til Sites-udgiveren, med kodecommit adskilt fra sidste handoff-commit; se Git på deployment/cloudflare-sites.
