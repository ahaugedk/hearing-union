---
type: "Operations"
title: "Udgivelse til ChatGPT Sites"
description: "Fast kontrakt mellem kodeleverancen i GitHub og udgivelsen af hearing-union i Sites."
status: "stable"
---
# Udgivelse til ChatGPT Sites

GitHub er overdragelsespunkt mellem den agent, der bygger produktet, og den agent, der udgiver det. En kodeleverance er klar til udgivelse, når dens pull request ændrer [den maskinlæsbare overdragelse](../../.openai/deployment-handoff.json) til `ready` og angiver den præcise commit. Udgiveren bruger denne commit, ikke en bevægelig gren, og skriver resultatet tilbage i samme fil og i pull requesten.

## Fast mål

- Repository: `ahaugedk/hearing-union`
- Sites-projekt: `appgprj_6adb6ca4b9a0819187d043ebb4c091a5`
- Liveadresse: `https://hearing-union.ahaugedk.chatgpt.site`
- Adgang: projektets gældende Sites-politik; ændres ikke som del af en kodeudgivelse.

## Platformkontrakt

Sites håndterer login. Worker-kode læser den verificerede bruger fra `oai-authenticated-user-id` og kan bruge `oai-authenticated-user-email` og `oai-authenticated-user-full-name`; den opretter ikke en særskilt OAuth/OIDC-loginstrøm og kræver ingen ekstern issuer eller audience.

D1 erklæres som en logisk binding i `.openai/hosting.json`, normalt `DB`. Sites provisionerer og binder databasen. Projektet kræver derfor hverken Cloudflare-konto-id, D1-id eller en Cloudflare-adgangsnøgle i Codex Cloud.

Hemmelige værdier må ikke skrives i Git, pull requests eller overdragelsesfilen. Eventuelle øvrige runtime-hemmeligheder oprettes i den relevante platform og refereres kun ved navn.

## GitHub-overdragelse

Den implementerende agent:

1. holder `.openai/hosting.json`, Worker-indgangspunkt og eventuelle migrationer reproducerbare fra Git;
2. kører den dokumenterede smoke-validering;
3. udfylder `.openai/deployment-handoff.json` i sidste kodecommit og sætter kun `status` til `ready`, når den angivne commit kan udgives;
4. åbner en pull request med titlen `[sites-deploy] ...`.

Udgivelsesagenten kontrollerer overdragelsen og PR-head, bygger fra den angivne commit, anvender nødvendige migrationer gennem Sites og udgiver til projektet ovenfor. Ved succes registrerer den Sites-version, liveadresse og udgivet commit; ved fejl registrerer den den konkrete blokering uden at opfinde credentials eller ændre adgangspolitik.

Automatisk udgivelse må ikke fortsætte, hvis commit ikke matcher, valideringen ikke er bestået, overdragelsen har blokeringer, eller ændringen kræver en væsentlig produktbeslutning.
