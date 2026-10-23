---
type: "Project Configuration"
title: "Projektets konkrete arbejdsgrundlag"
description: "Ét hjem for produktfase, kode, værktøjer, miljøer og valideringskommandoer."
status: "draft"
---
# Projektets konkrete arbejdsgrundlag

Profilen beskriver det tilgængelige cloud-miljø. Den hostede Sites-runtime er endnu ikke afprøvet; ukendte platformforhold er ikke standardvalg. Produktvalg og procesmandat har hjem i [mandatet](../orkestrering/mandat.md) eller den relevante plan.

| Felt | Faktisk værdi |
|---|---|
| Projektnavn og produktejer | Høreforeningens ChatGPT-app; Anders |
| Produktfase | Før første produktions-v1; lokale domænefunktioner, kildeimport, MCP Apps, events og drift implementeret; smoke og målrettede kontroller består; fuld MVP er ikke leveret |
| Kildekode og integrationsgren | ahaugedk/hearing-union; main. HTTPS Git-læsning virker; push er ikke afprøvet |
| Orkestrator, arbejder- og reviewværktøjer | `/root`; navngivne underagenter til afgrænset arbejde og uafhængigt review |
| Arbejdsmapper, grenform og miljøejere | `/workspace/hearing-union`, ejet af `/root`; denne cloud-task er isoleret. Brug eksisterende checkout, og opret kun worktree ved udtrykkelig bestilling. Parallelle skrivere kræver adskilte ejergrænser og grene |
| Adskilte porte, data og samtidige miljøer | Ikke udfyldt |
| Statisk kontrol eller build | `npm ci`, `npm run build` og `python3 scripts/check_okf.py` fra projektroden. Node 24+; Python 3.9+ til dokumentkontrol |
| Opstart med aktuel kode | `npm run dev` fra projektroden; lokal Node/SQLite-adapter, kun 127.0.0.1. Sites-deployment er udskudt |
| Smoke-kommando mod kørende miljø | `npm run smoke` starter eget lokalt miljø og afprøver autentificeret MCP, foredragstilmelding og genfinding efter genstart. Validerer ikke Sites-login eller faktisk ChatGPT-forbindelse |
| Mindste kerneforløb og normale indgange | Lokal Bearer-identitet, ejer publicerer foredrag, bruger tilmelder gennem MCP og genfinder efter genstart; anden konto ser ingen af tilmeldingerne |
| Kerneflader og relevant mobilbredde | Ikke udfyldt; 390 px er et muligt udgangspunkt |
| Browser til visuel kontrol | Chromium findes, men headless screenshotforsøg i cloud-miljøet timed out. Visuel MCP App-kontrol og faktisk ChatGPT-host er endnu ikke valideret |
| Særskilt dev-reset og genopbygning | Ikke udfyldt |
| Diagnose og midlertidige artefakter | `.local/` til database, genererede MCP Apps, syntetiske identiteter, eventkrypteringsnøgle og særskilt drain-token. Nøglefiler er owner-only; intet hemmeligt indhold logges. Smoke bruger en midlertidig mappe |
| Forbrugspuljer og aflæsningsvej | Denne sessions værktøjer er tilgængelige; forbrug, rest og nulstillingstid kan ikke aflæses. Ingen ekstra puljer aktiveres på antagelser |
| Puljeprioritet, reserver og pausegrænser | Ikke udfyldt |
| Kildeimport | `npm run import:knowledge -- --verify-sources`; 25 verificerede kildeposter. Genkørsel bevarer eksisterende poster; `--refresh` kræver konkrete slugs |
| Eventkø | Første forsøg startes efter publicering. `npm run events:drain` udfører en begrænset lokal køpassage; særskilt serviceautentificeret `POST /internal/deliveries/drain` kan kaldes af en senere host-trigger. Ingen vedvarende trigger er aktiveret |
| Lokal backup og restore | `npm run backup -- backup .local/hearing-union.sqlite NY-FIL` og `npm run backup -- restore BACKUP NY-FIL`; eksisterende destinationer overskrives ikke. Den matchende eventkrypteringsnøgle skal sikres separat |
| Deployment og driftsansvar | Eksisterende Site: https://hearing-union.ahaugedk.chatgpt.site (oplyst af Anders). Uautentificeret HTTP-kald svarer 401; indhold og kobling til dette checkout er ikke verificeret. Deployment er fortsat udskudt. Ingen Sites-/automationsværktøjer er eksponeret her |

Kerneforløbet skal være lille og repræsentativt: faktisk login, central brugerhandling, gemt og genfundet resultat og eventuel agent- eller API-indgang, hvis den er central for produktet. Den ændrede feature afprøves særskilt uden at vokse ind i smoke. Profilen er ingen kørsel eller leveringsrapport.
