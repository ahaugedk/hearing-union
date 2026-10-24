# OKF-startpakke til agentisk udvikling

En genbrugelig arbejdsgang fra produktretning og roadmap til reviewet, integreret og valideret software. Pakken er skrevet på dansk og bruger projektets OKF v0.2-profil. Læs [ibrugtagningen](docs/ibrugtagning.md) først; [dokumentationen](docs/index.md) er derefter den fælles indgang.

## Projektets udviklingsplan

[Roadmappet](docs/roadmap/index.md) er indgangen til Høreforeningens ChatGPT-app. Planen har særskilt vision, brugerforløb og faseinddelt implementering; den beskriver planlagt arbejde, ikke et fuldt leveret system.

## Lokal udvikling af Høreforeningens app

Kræver Node.js 24 eller nyere samt Python 3.9+ til dokumentkontrollen. Kør fra projektroden:

```sh
npm ci
npm run build
npm run smoke
npm run dev
```

Det lokale MCP-endpoint er `POST /mcp` på loopback, og `GET /health` viser udviklingsstatus. Første opstart opretter SQLite-database og tilfældige lokale identitetsnøgler i den ignorerede `.local/`-mappe. Smoke bruger sin egen midlertidige database og sletter den igen. Nøglerne i `.local/auth.json` bruges som Bearer-token af en lokal MCP-klient; del eller commit dem aldrig.

Den lokale server har tre syntetiske konti: ejer og to brugere. Den understøtter viden, foredrag, eventabonnementer og anonym statistik. `npm run import:knowledge -- --verify-sources` importerer det afgrænsede kildeudsnit; gentagelse bevarer eksisterende indhold. `npm run events:drain` genoptager en begrænset passage af den holdbare eventkø. Den lokale adapter bruger fortsat syntetiske konti. Den separate Cloudflare Worker bruger D1 og Sites’ indbyggede brugeridentitet; faktisk Sites-kobling, platformens identitetsvideresendelse og eventlevering i ChatGPT kræver platformadgang. [Projektprofilen](docs/drift/projektprofil.md) ejer de gældende kommandoer og afgrænsninger. [Udgivelsesudkastet](release/README.md) beskriver build, pakning, identitetsopsætning, D1 og aktivering af det eksisterende Site. Kør `npm run smoke:worker` for den pakkede Worker og lokal D1; `npm run pack` laver deploymentarkivet.

## Pak ud i et nyt projekt

1. Pak zip-filen ud. Kopiér indholdet af mappen okf-startpakke til projektets rod.
2. I et eksisterende projekt sammenflettes AGENTS.md, README.md, docs og scripts med det eksisterende indhold. En udpakning er ikke en beslutning om at erstatte eksisterende regler.
3. Udfyld [projektprofilen](docs/drift/projektprofil.md), [produktvisionen](docs/produkt/retning/vision.md), [kompasset](docs/produkt/retning/kompas.md) og [systemgrænserne](docs/arkitektur/systemgraenser.md). Fastlæg konkret procesmandat og igangsættelse i [orkestreringsmandatet](docs/orkestrering/mandat.md).
4. Opret første plan med [planskabelonen](docs/skabeloner/plan/index.md). Sæt den i [roadmappet](docs/roadmap/index.md), og registrér næste arbejde i [arbejdsoversigten](docs/orkestrering/arbejdsoversigt.md).
5. Kør dokumentkontrollen fra projektroden med Python 3.9 eller nyere:

    python3 scripts/check_okf.py

Den oprindelige startpakke starter ingen agenter, timere eller reset. Projektets lokale udviklingsserver startes særskilt som beskrevet ovenfor; roadmappets fulde produkt er endnu ikke leveret.

## Det følger med

| Område | Indgang |
|---|---|
| Kort instruktion til agenter | [AGENTS.md](AGENTS.md) |
| Retning og produktløfter | [Produkt](docs/produkt/index.md) |
| Arkitektur, ansvar og databevaring | [Arkitektur](docs/arkitektur/index.md) |
| Arbejdsdeling, valg, planer og dokumentation | [Arbejdsregler](docs/arbejdsregler/index.md) |
| Bestilling, worktrees, review og asynkrone svar | [Orkestrering](docs/orkestrering/index.md) |
| Smoke, browsergennemgang og færdigkriterium | [Validering](docs/validering/index.md) |
| Miljø, opstart, reset og diagnose | [Drift](docs/drift/index.md) |
| Planer, kontrakter, scenarier og afleveringer | [Skabeloner](docs/skabeloner/index.md) |

Reglerne er generaliseret fra Agent Control Plane. Produktnavne, igangværende planer, historiske godkendelser, modelversioner, leverandørbindinger og maskinens kapacitetsgrænser er fjernet. De særlige produktarkitekturvalg er erstattet af et sted at fastlægge projektets egne. Der er ingen overført produktejergodkendelse, aktiv orkestrering eller dokumenteret validering af det nye projekt.
