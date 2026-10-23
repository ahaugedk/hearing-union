---
type: "Project Configuration"
title: "Projektets konkrete arbejdsgrundlag"
description: "Ét hjem for produktfase, kode, værktøjer, miljøer og valideringskommandoer."
status: "draft"
---
# Projektets konkrete arbejdsgrundlag

Profilen beskriver det tilgængelige cloud-miljø. Produktets runtime er endnu ikke afprøvet; ukendte platformforhold er ikke standardvalg. Produktvalg og procesmandat har hjem i [mandatet](../orkestrering/mandat.md) eller den relevante plan.

| Felt | Faktisk værdi |
|---|---|
| Projektnavn og produktejer | Høreforeningens ChatGPT-app; Anders |
| Produktfase | Før første produktions-v1; kun dokumentation og dokumentkontrol er implementeret |
| Kildekode og integrationsgren | ahaugedk/hearing-union; main. HTTPS Git-læsning virker; push er ikke afprøvet |
| Orkestrator, arbejder- og reviewværktøjer | `/root`; navngivne underagenter til afgrænset arbejde og uafhængigt review |
| Arbejdsmapper, grenform og miljøejere | `/workspace/hearing-union`, ejet af `/root`; denne cloud-task er isoleret. Brug eksisterende checkout, og opret kun worktree ved udtrykkelig bestilling. Parallelle skrivere kræver adskilte ejergrænser og grene |
| Adskilte porte, data og samtidige miljøer | Ikke udfyldt |
| Statisk kontrol eller build | `python3 scripts/check_okf.py` fra projektroden; Python 3.9+ uden eksterne pakker. Miljøet har Python 3.12, Node 24 og npm 11 |
| Opstart med aktuel kode | Ingen produktservice findes endnu. Sites-starter og deploymentadgang er ikke tilgængelige i denne session |
| Smoke-kommando mod kørende miljø | Ikke fastlagt før platformforsøget; dokumentkontrol validerer ikke login, MCP eller produktadfærd |
| Mindste kerneforløb og normale indgange | Ikke udfyldt |
| Kerneflader og relevant mobilbredde | Ikke udfyldt; 390 px er et muligt udgangspunkt |
| Browser til visuel kontrol | Ikke udfyldt |
| Særskilt dev-reset og genopbygning | Ikke udfyldt |
| Diagnose og midlertidige artefakter | Ikke udfyldt; uden for versionerede docs |
| Forbrugspuljer og aflæsningsvej | Denne sessions værktøjer er tilgængelige; forbrug, rest og nulstillingstid kan ikke aflæses. Ingen ekstra puljer aktiveres på antagelser |
| Puljeprioritet, reserver og pausegrænser | Ikke udfyldt |
| Deployment og driftsansvar | Mål: OpenAI Sites efter platformkontrakten. Ingen Sites-/automationsværktøjer er eksponeret i denne session; faktisk deployment og timegenoptagelse er ikke verificeret |

Kerneforløbet skal være lille og repræsentativt: faktisk login, central brugerhandling, gemt og genfundet resultat og eventuel agent- eller API-indgang, hvis den er central for produktet. Den ændrede feature afprøves særskilt uden at vokse ind i smoke. Profilen er ingen kørsel eller leveringsrapport.
