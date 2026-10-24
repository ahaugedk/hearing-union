---
type: "Operations"
title: "Udgivelse til ChatGPT Sites"
description: "Fast kontrakt mellem kodeleverancen i GitHub og udgivelsen af hearing-union i Sites."
status: "stable"
---
# Udgivelse til ChatGPT Sites

Underagenter implementerer og afleverer til orkestratoren i projektsamtalen. Orkestratoren ejer arkitekturreview, code review, slutbrugertest og udgivelse. GitHub bevarer kode, review og [den maskinlæsbare overdragelse](../../.openai/deployment-handoff.json); Codex Cloud indgår ikke. En kodeleverance kan gøres klar med `ready` og den præcise deployerbare commit. Dokumentændringer kræver ikke i sig selv en ny produktudgivelse.

## Fast mål

- Repository: `ahaugedk/hearing-union`
- Sites-projekt: `appgprj_6adb6ca4b9a0819187d043ebb4c091a5`
- Liveadresse: `https://hearing-union.ahaugedk.chatgpt.site`
- Adgang: projektets gældende Sites-politik; ændres ikke som del af en kodeudgivelse.

## Platformkontrakt

Sites håndterer login. Worker-kode læser den verificerede bruger fra `oai-authenticated-user-id` og kan bruge `oai-authenticated-user-email` og `oai-authenticated-user-full-name`; den opretter ikke en særskilt OAuth/OIDC-loginstrøm og kræver ingen ekstern issuer eller audience.

D1 erklæres som en logisk binding i `.openai/hosting.json`, normalt `DB`. Sites provisionerer og binder databasen. Projektet kræver derfor hverken Cloudflare-konto-id, fysisk D1-id eller en Cloudflare-adgangsnøgle.

Hemmelige værdier må ikke skrives i Git, pull requests eller overdragelsesfilen. Eventuelle øvrige runtime-hemmeligheder oprettes i den relevante platform og refereres kun ved navn.

## GitHub-overdragelse

Underagenten:

1. holder `.openai/hosting.json`, Worker-indgangspunkt og eventuelle migrationer reproducerbare fra Git;
2. kører den dokumenterede smoke-validering;
3. afleverer gren, præcis kodecommit, validering og mangler til orkestratoren.

Orkestratoren reviewer hele ændringen, udfører relevante slutbrugertests og færdiggør overdragelsen. En separat sidste commit må opdatere handoffet uden at ændre den deployerbare kodecommit. En udgivelsesklar pull request mærkes `[sites-deploy]`.

Orkestratoren kontrollerer overdragelsen og PR-head, bygger fra den angivne commit, anvender nødvendige migrationer gennem Sites og udgiver til projektet ovenfor. Ved succes registreres Sites-version, liveadresse og udgivet commit; ved fejl den konkrete blokering. Allerede registrerede deployments gentages ikke. Ingen credentials opfindes, og adgangspolitikken bevares.

Automatisk udgivelse må ikke fortsætte, hvis commit ikke matcher, valideringen ikke er bestået, overdragelsen har blokeringer, eller ændringen kræver en væsentlig produktbeslutning.
