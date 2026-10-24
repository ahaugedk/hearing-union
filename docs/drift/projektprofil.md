---
type: "Project Configuration"
title: "Projektets konkrete arbejdsgrundlag"
description: "Ét hjem for produktfase, kode, værktøjer, miljøer og valideringskommandoer."
status: "draft"
---
# Projektets konkrete arbejdsgrundlag

Profilen beskriver værktøjerne i projektsamtalen. Sites-deployment er gennemført; hosted databaseskema og privat MCP-plugin er verificeret. Native ejerprofil er læst i en frisk kontekst; den samlede autentificerede brugeroplevelse er stadig åben. Produktvalg og procesmandat har hjem i [mandatet](../orkestrering/mandat.md) eller den relevante plan.

| Felt | Faktisk værdi |
|---|---|
| Projektnavn og produktejer | Høreforeningens ChatGPT-app; Anders |
| Produktfase | Før første produktions-v1; lokale domænefunktioner, kildeimport, MCP Apps, events og drift implementeret; smoke og målrettede kontroller består; fuld MVP er ikke leveret |
| Kildekode og integrationsgren | `ahaugedk/hearing-union`; `main`; underagenter afleverer på egne arbejdsgrene |
| Orkestrator, arbejder- og reviewværktøjer | `/root` i projektsamtalen har terminal, GitHub og Sites; navngivne underagenter implementerer. Orkestratoren ejer selv arkitekturreview, code review, slutbrugertest og deployment; Codex Cloud bruges ikke |
| Arbejdsmapper, grenform og miljøejere | Verificér aktuelt checkout ved hver genoptagelse. Underagenter har egne grene/worktrees; parallelle skrivere har adskilte ejergrænser og miljøer |
| Adskilte porte, data og samtidige miljøer | Egen worktree og egne lokale data pr. arbejder. Lokal dev bruger `PORT` (standard 3000) på 127.0.0.1; tildel forskellige porte. Smoke bruger midlertidig database og OS-tildelt port. Samtidighed følger værktøjets aktuelle kapacitet |
| Statisk kontrol eller build | `npm ci`, `npm run build` og `python3 scripts/check_okf.py` fra projektroden. Node 24+; Python 3.9+ til dokumentkontrol |
| Opstart med aktuel kode | `npm run dev` fra projektroden; lokal Node/SQLite-adapter, kun 127.0.0.1. hostet adapter: server/worker.ts med D1 og Sites-identitet |
| Smoke-kommando mod kørende miljø | `npm run smoke` starter eget lokalt miljø og afprøver autentificeret MCP, foredragstilmelding og genfinding efter genstart. Validerer ikke Sites-login eller faktisk ChatGPT-forbindelse |
| Mindste kerneforløb og normale indgange | Lokal Bearer-identitet, ejer publicerer foredrag, bruger tilmelder gennem MCP og genfinder efter genstart; anden konto ser ingen af tilmeldingerne |
| Kerneflader og relevant mobilbredde | Én installationsknap samt korte privatlivs-, vilkårs- og supportsider; foredrag/statistik i ChatGPT. Kontrollér snæver mobilvisning, tastatur og den faktiske MCP App-host; en genereret side beviser ikke hostens UI |
| Browser til visuel kontrol | Cloud-browser er tilgængelig. Genereret installationsforside er visuelt kontrolleret med syntetisk mål; privat Site kræver login. MCP Apps og faktisk ChatGPT-host er endnu ikke valideret |
| Særskilt dev-reset og genopbygning | Smoke opretter og fjerner kun egne midlertidige data. Intet automatisk reset af det private Sites-D1; bevar data og anvendt migrationshistorik |
| Diagnose og midlertidige artefakter | `.local/` til database, genererede MCP Apps, syntetiske identiteter, eventkrypteringsnøgle og særskilt drain-token. Nøglefiler er owner-only; intet hemmeligt indhold logges. Smoke bruger en midlertidig mappe |
| Forbrugspuljer og aflæsningsvej | Denne sessions værktøjer er tilgængelige; forbrug, rest og nulstillingstid kan ikke aflæses. Ingen ekstra puljer aktiveres på antagelser |
| Puljeprioritet, reserver og pausegrænser | Brug den tilgængelige projektsession; bevar kapacitet til root-review. Ingen ekstra pulje eller målt reserve er aftalt. Ved faktisk kvotefejl standses nye bestillinger og arbejdet committes efter kvoteværnet |
| Kildeimport | Lokal import: `npm run import:knowledge -- --verify-sources`. Hosted: native ejer/admin gemmer kladder, relationer og publicerer konkrete versioner; 25 kildeposter er nu publiceret. Genkørsel læser eksisterende slugs/versioner før skrivning; ingen automatisk overskrivning eller rå D1-seed |
| Eventkø | Administratorens `admin_deliver_events` genbruger den begrænsede leveringsfunktion gennem autentificeret MCP; faktisk cloud-planlægning er endnu ikke aktiveret. Første forsøg startes efter publicering. `npm run events:drain` udfører en begrænset lokal køpassage; særskilt serviceautentificeret `POST /internal/deliveries/drain` kan kaldes af en senere host-trigger. Ingen vedvarende trigger er aktiveret |
| Lokal backup og restore | `npm run backup -- backup .local/hearing-union.sqlite NY-FIL` og `npm run backup -- restore BACKUP NY-FIL`; eksisterende destinationer overskrives ikke. Den matchende eventkrypteringsnøgle skal sikres separat |
| Deployment og driftsansvar | Orkestratoren udgiver til https://hearing-union.ahaugedk.chatgpt.site med eksisterende privat adgang. Projekt-id og seneste udgivelse står i `.openai/hosting.json` og `.openai/deployment-handoff.json`. Følg [deploymentvejledningen](../../release/README.md). Native ejerrolle og MCP-kald samt hosted schema er verificeret. En anden konto, MCP App-host, faktisk eventmodtagelse og D1-gendannelse er fortsat uverificeret |

Kerneforløbet skal være lille og repræsentativt: faktisk login, central brugerhandling, gemt og genfundet resultat og eventuel agent- eller API-indgang, hvis den er central for produktet. Den ændrede feature afprøves særskilt uden at vokse ind i smoke. Profilen er ingen kørsel eller leveringsrapport.
