# Deployment til det eksisterende private Site

Bevar https://hearing-union.ahaugedk.chatgpt.site og projekt `appgprj_6adb6ca4b9a0819187d043ebb4c091a5`. [.openai/hosting.json](../.openai/hosting.json) deklarerer projektet og den logiske D1-binding `DB`; Sites skal provisionere og forbinde databasen. Ingen egen Cloudflare-konto, ekstern OAuth-udsteder, audience eller eksisterende database-id skal konfigureres.

## Byg, kontrollér og pak

Kræver Node 24+, GNU tar og Python 3.9+. Fra projektroden:

```sh
npm ci
npm run build
npm run smoke
npm run smoke:worker
npm run check:deployment
npm run check:docs
npm run pack
npm run check:package
```

`build` typekontrollerer, bygger begge MCP Apps som tekstmoduler, kontrollerer den versionerede D1-migration og udfører kun Wrangler dry-run. Outputtet er `dist/worker/worker.js` med to tekstmoduler; det er en Worker, ikke en statisk `index.html`-mappe. Arkivet `dist/hearing-union-deployment.tar.gz` indeholder Worker, tekstmoduler, `.openai/hosting.json`, `db/migrations/0001_initial.sql`, portabel Wrangler-konfiguration, kildeudsnit og pluginmetadata. Ingen lokale databaser, udviklingstokens eller nøglemateriale indgår. Pakning udelader Wranglers tidsstemplede informationsfil og normaliserer rækkefølge, filrettigheder, ejer og tidsstempler; `check:package` sammenligner to pakninger byte for byte og afprøver den udpakkede Worker med dry-run.

I dette administrerede miljø uden skrivbar standardkonfigurationsmappe kan Wrangler køres med `XDG_CONFIG_HOME=/tmp/hearing-config`; npm kan bruge `--cache /tmp/hearing-npm-cache`. Bevar miljøets proxy og CA-tillid.

## Identitet og roller

Sites leverer `oai-authenticated-user-id`, `oai-authenticated-user-email` og eventuelt `oai-authenticated-user-full-name`. Appen bruger kun det stabile **user-id** som subject. E-mail og navn giver ingen rettigheder og gemmes ikke uden produktbehov. Manglende eller ugyldigt user-id afvises; et Bearer-token eller en e-mail alene er utilstrækkeligt. Der findes ingen egne login-, callback-, OAuth-metadata- eller sessionroutes.

Det private Sites-ingress er tillidsgrænsen: platformen skal fjerne klientangivne identitetsheaders og indsætte den autentificerede bruger. Workeren må kun være tilgængelig gennem det eksisterende Site; `workers_dev`, preview-URL'er og separate offentlige routes er deaktiveret. Lokal headerinjektion i smoke simulerer platformen og beviser ikke den faktiske ingressbeskyttelse.

Sitet er foreløbig privat til ejeren. Ved første autentificerede domænekald etableres denne bruger atomisk som ejer; den gemte ejer er derefter autoritativ. Efterfølgende bruger-id'er får almindelig brugerrolle, også hvis e-mailadressen matcher ejerens. Bevar privat ejeradgang, til ejeren er etableret, og verificér ejerrollen før deling udvides. Der er ikke et konfigurationskrav om et manuelt ejer-subject. Alle rolleændringer og adgang til egne data kontrolleres i databasen.

## D1 og migrationer

`db/schema.sql`, `db/events.sql`, `db/operations.sql`, `db/concurrency.sql` og `db/runtime.sql` ejer skemaet. `npm run db:generate` regenererer den versionerede første migration før produktions-v1. Build afviser drift mellem skemafiler og migration. Skema oprettes aldrig under requests; Sites skal anvende den pakkede migration ved deployment. `npm run db:local` anvender den kun på lokal D1.

`0001_initial.sql` er før-v1-grundskemaet og ikke en datamigration til en ukendt produktionsdatabase. Sites skal bevare bindingen og data ved efterfølgende deployment. Eksisterende lokal SQLite, lokale tokens og lokale krypteringsnøgler kopieres ikke automatisk til det hostede miljø. Inden en eksisterende database ændres, skal skema og backup være kendt; nulstil ingen data som del af deploymentforberedelsen.

Domæneændringer samles i en atomisk D1-batch med revisionskontrol. En revisionskonflikt genlæses og genprøves højst otte gange; en ukendt netværks-/skrivefejl genafspilles ikke automatisk. Ingen netværkslevering udføres i en transaktion, der kan genprøves. Forespørgsler opdeles efter D1's parametergrænse.

## Events, nøglemateriale og kildeimport

Abonnementer, filtre, lease, genlevering og signering bruger de eksisterende domænefunktioner. Workeren har en scheduled-handler og cron-deklaration; faktisk understøttelse af tidsstyret genlevering skal verificeres i Sites før dette loves som aktiveret. Efter publicering forsøger Workeren også en begrænset levering via `waitUntil`.

En tilfældig eventkrypteringsnøgle genereres ved første brug og gemmes i D1, så deployment og Worker-genstart ikke mister abonnementernes nøgler. Der findes ingen fast eller manuelt indsat nøgle i kode, manifest eller pakke. D1-adgang og fulde eksporter skal beskyttes som hemmeligheder: backup indeholder både applikationsnøglen og krypterede abonnementer og giver derfor ikke nøgleadskillelse. Lokal udvikling beholder sin eksisterende ejerbeskyttede nøglefil uden for SQLite. Kopiér aldrig udviklingsnøgler til sitet.

`EVENT_CALLBACK_HOSTS` er en valgfri kommasepareret liste over præcise betroede ChatGPT-callbackværter, uden wildcard. Indtil de faktiske værter er verificeret, afvises nye callbackdestinationer sikkert; resten af appen fungerer. Ingen ekstra hemmelighed kræves. HTTPS-levering har størrelses- og tidsgrænser og følger ikke redirects. `PUBLISHER_NAME` og `SUPPORT_URL` kan valgfrit tilpasse de eksisterende udgiveroplysninger.

Det kuraterede kildeudsnit følger med som `knowledge.json` i pakken. Import til hostet D1 skal ske gennem ejerens autentificerede administrationsværktøjer og de fælles domæneregler. Den eksisterende lokale kommando `npm run import:knowledge -- --verify-sources` fungerer fortsat; genkørsel bevarer eksisterende poster, og `--refresh` kræver konkrete slugs. Importér ikke ved at sende selvvalgte Sites-identitetsheaders til en offentlig endpoint eller ved at kopiere lokale konti.

## Platformafprøvning ved aktivering

1. Læs det eksisterende Site og dets kildekode med Sites-værktøjerne. Bevar projekt-id og privat ejeradgang; opret intet nyt Site.
2. Kontrollér deploymentkontrakten mod den faktiske Sites-starter, herunder manifestets logiske DB-binding, migrationernes placering og Workerens tekstmoduler. Lad Sites provisionere/forbinde D1 og anvende migrationen; brug ingen privat Cloudflare-konto eller database-id.
3. Gem en version af det eksisterende projekt og deploy kun gennem Sites' normale workflow, når det er bestilt.
4. Afprøv `/health`, ejerens stabile identitet og rolle, begge MCP Apps, viden, præferencer og foredrag. Bekræft at klientangivne identitetsheaders ikke kan ændre bruger eller rolle gennem platformens ingress. Verificér kontoisolation med en særskilt konto, når sitets deling senere udvides.
5. Afprøv faktisk eventmodtagelse i ChatGPT og understøttet tidsstyret genlevering. Bevar platformens D1-data og genererede nøgle ved en ny version. Afklar offentligt review og juridiske driftsvilkår før offentlig udgivelse.

Den faste [udgivelseskontrakt](../docs/drift/sites-udgivelse.md) ejer rollefordelingen: Codex Cloud implementerer og validerer; ChatGPTs Sites-udgiver publicerer og kontrollerer live-resultatet. GitHub er den autoritative kanal. Manglende direkte Sites-værktøjer i Codex Cloud er ikke en kodeblokering og udløser ingen efterspørgsel efter Cloudflare- eller Sites-credentials.

Efter en valideret kodecommit oprettes en særskilt sidste commit, der alene udfylder `.openai/deployment-handoff.json`: `ready`, branch, den præcise kodecommit, faktisk kørte valideringskommandoer, migrationsbehov, korte release notes og ingen blokeringer. En PR med `[sites-deploy]` i titlen overdrager opgaven. Udgiveren bygger fra kodecommitten, anvender første migration gennem Sites, bevarer privat adgang og melder udgivet commit, Sites-version, tidspunkt og liveadresse eller konkret blokering tilbage i GitHub. Felterne under `deployment` udfyldes kun af udgiveren.
