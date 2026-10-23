---
type: "Plan Implementation"
title: "Faseinddelt implementering af ChatGPT-appens MVP"
description: "Eksisterende afsæt, milepæle, ejergrænser, validering og completion."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Faseinddelt implementering af ChatGPT-appens MVP

[Visionen](vision.md) ejer scope og godkendelsesgrundlag, og [scenarierne](scenarier.md) ejer den observerbare målform. [Arbejdsoversigten](../../orkestrering/arbejdsoversigt.md) ejer igangsættelse, tildeling og operationelle afhængigheder. [Kontrakterne](kontrakter/index.md) beskriver foreslåede kodeændringer uden at gøre dem til gældende arkitektur.

## Eksisterende afsæt

Projektet har lokal Node/SQLite-kode med konti, roller, præferencesamtykke, importeret kildebaseret viden, foredrag, eventabonnementer, holdbar leveringskø, anonym statistik og en autentificeret MCP-indgang, valideret gennem lokale HTTP-kald. Lokale informationssider, ratebegrænsning og backup/restore findes. Begge MCP Apps har kilde og build, men den visuelle hostoplevelse er ikke afprøvet. Sites-hosting, faktisk ChatGPT-login, faktisk eventmodtagelse i inaktiv chat, vedvarende host-trigger og offentlig udgivelse er endnu ikke leveret. Projektet ligger i Git-repositoriet `ahaugedk/hearing-union`; `main` er integrationsgren. Den lokale delleverance afslutter ikke nogen af de fulde platformafhængige faser nedenfor.

Anders har efterfølgende bestilt lokal udvikling uden at afvente Sites-deployment. Lokale domænefunktioner, database og MCP-indgang udvikles og valideres nu; hostens identitet, D1-integration, faktisk ChatGPT-rendering og eventlevering verificeres ved den senere platformafprøvning. Lokal SQLite og lokal udviklingsidentitet dokumenterer ikke disse platformegenskaber. Faseafhængighederne gælder fortsat endelig capability-validering og udgivelse, men blokerer ikke det udtrykkeligt bestilte lokale arbejde.

## Milepæle og afhængigheder

| Fase | Slutleverance og kodeansvar | Forudsætning | Normal indgang og afslutning |
| --- | --- | --- | --- |
| 0: platformmodning | [Sites, login, MCP App, events og reviewvej](kontrakter/platform.md); starter, manifest og afgrænset endpointforsøg | Konkret projektgrundlag, udviklingsadgang og særskilt mandat til eventuel deployment | Faktisk ChatGPT-forbindelse og levering med inaktiv chat; afgørende usikkerhed løst eller forelagt som konkret valg |
| 1: identitet og data | [Datamodel og autorisation](kontrakter/fundament.md#fase-1--database-og-adgang); `db/`, `drizzle/`, `server/auth/` og repositories | Afprøvet runtime/auth og fastlagte ejergrænser | To konti oprettes og genfinder egne data; rolle- og isolationsgrænser virker |
| 2: fælles MCP-kald | [Protokol og kontrakter](kontrakter/fundament.md#fase-2--mcp-kontrakter); `app/mcp/`, `server/mcp/`, `contracts/` | Datagrundlag og serverafledt aktør | Chat og MCP App rammer samme funktion; afslag og fejl giver forståelige resultater |
| 3: viden | [Import, søgning og aktualitet](kontrakter/viden.md); vidensfunktioner og engangsimport | Fælles kaldesti og verificerede kilder | Vidensscenariet gennemføres med genfinding, kilde og ændret udløb |
| 4: foredrag | [Arrangementer, tilmelding og MCP App](kontrakter/foredrag.md); foredragsfunktioner og `mcp-ui/lectures/` | Identitet, emner og fælles kontrakter | Administrator opretter; bruger finder, tilmelder, genåbner og afmelder uden overbooking |
| 5: proaktivitet | [Præferencer, abonnementer og levering](kontrakter/events.md); `server/events/` og eventmetoder | Publicering, afprøvet callback og ubemandet retryvej | Reelt match udløser besked; afmelding, fejl og genstart håndteres |
| 6: statistik | [Anonyme aggregater og MCP App](kontrakter/statistik.md); fælles tællere og `mcp-ui/analytics/` | Faktiske brugerhandlinger og administratoradgang | Administrator undersøger aggregeret brug uden personhistorik |
| 7: udgivelsesklarhed | [Sider, datalivscyklus, drift og reviewadgang](kontrakter/udgivelse.md) | Afprøvet platformgrundlag og fuldt brugerflow | Kontosletning og reviewerens normale adgang virker med syntetiske data |
| 8: samlet gennemgang | Integreret capability, løste arkitektur-/UI-fund og klargjort offentlig indsendelse | Hele aftalte scope og konkret publiceringsmandat | Alle målforløb kan gennemføres gennem normale indgange; deployment og ekstern reviewstatus skelnes |

Faserne angiver rækkefølge, ikke tilladelse til at reducere v1 til et tidligt udsnit. Offentlige reviewkrav undersøges tidligt og færdiggøres i fase 7. Der er ingen aktuel parallel bestilling; ved senere igangsættelse fordeler orkestratoren kodeejerskab, grene og fælles kontrakter gennem arbejdsoversigten.

## Validering gennem udviklingen

Følg [risikobaseret validering](../../arbejdsregler/levering/risikobaseret-validering.md): smoke ved hver task og milepæl, let visuel kontrol ved UI-ændringer og gennemgang med rettelsesrunder før en større feature erklæres færdig. Arkitekturreview af hele ændringen ligger før integration; mellem faser samles parallelle modeller og særveje, hvis de opstår.

Projektprofilen skal før implementering eje den konkrete build-/smoke-kommando og det minimale kerneforløb: log ind, udfør en central handling gennem MCP, gem resultatet og genfind det fra en ny læsning. Når foredrag findes, er tilmelding og genfinding et repræsentativt kerneforløb. Udvid ikke smoke til alle scenarier.

Vælg yderligere kontrol kun ved konkret risiko: eksempelvis samtidige tilmeldinger til sidste plads, ændret udløb gennem alle læseveje, callbacks og genforsøg efter procesfejl eller ophørt adgang fra en allerede åben MCP App. Det er målrettede udviklingskontroller, ikke en permanent suite, måleprogram eller bevisbogføring. Midlertidig testkode fjernes før afslutning. Verificér hostens rigtige identitet særskilt fra lokal mock-auth.

Fase 8 gennemgår [målforløbene](scenarier/index.md) i den integrerede løsning med rettelser, herunder faktisk eventmodtagelse med inaktiv chat og MCP Apps på desktop og mobil. Kør relevant statisk kontrol/build og smoke på den aktuelle kode. Løs arkitekturfund om authgrænse, fælles kaldesti, atomiske skrivninger, gyldighed og varig levering før færdigmelding.

## Aktivering og completion

Deploy gennem Sites' kildekode- og deploymentflow under det konkrete mandat. Genbrug Site/plugin-identitet. Følg [før-/efter-v1-reglen](../../arbejdsregler/levering/modelaendringer.md) for skemaændringer; indholdsændringer går gennem værktøjerne uden redeployment. Fjern midlertidige platformforsøg, når de rigtige funktioner overtager.

Fungerende privat deployment, offentlig indsendelse og offentlig godkendelse er forskellige milepæle. Indsend først med fuldt scope og gennemgået reviewmateriale. Hvis OpenAI endnu ikke har godkendt appen, står det åbent; skriv ikke, at offentlig release er leveret.

Ved completion foldes godkendte produktløfter i produktgrenen, ansvar og platformgrænser i arkitekturen og faktiske kommandoer og driftsprocedurer i drift. Koden overtager felter, signaturer og algoritmer. Registrér én linje i udviklingsoversigten og fjern først hele planen, når dens scope er afsluttet efter [completionreglen](../../arbejdsregler/planer/levering/completion.md). Delvis levering efterlader det resterende scope synligt, uden leverings- eller bevisregnskaber.
