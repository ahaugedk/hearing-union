---
type: "Setup Guide"
title: "Tag arbejdsgangen i brug"
description: "Tilpas projektets egne fakta og mandat, før første leverance bestilles."
status: "stable"
---
# Tag arbejdsgangen i brug

Pakken giver arbejdsformen; det nye projekt giver produktløfter, arkitektur, adgang og miljø. Indarbejd den i eksisterende dokumenter frem for at skabe et parallelt dokumentationssystem.

## Første afstemning

1. Udfyld [projektprofilen](drift/projektprofil.md): produktfase, kildekode, kørsel, miljøejere, smoke-kommando og kerneforløb samt browser og integrationsvej. Ret eksisterende oplysninger frem for at kopiere dem flere steder.
2. Skriv [produktvisionen](produkt/retning/vision.md) og [kompasset](produkt/retning/kompas.md). Fastlæg målgruppe, samlet løfte og produktets grænser. Tre spørgsmål er et kompas med dømmekraft, ingen score eller obligatorisk gate.
3. Udfyld [systemgrænserne](arkitektur/systemgraenser.md). Generaliseringen overfører ikke kildeprojektets konkrete databaser, runtimes, pakkeformat eller forbud mod modelkørsel. Vælg projektets arkitektur på eget grundlag.
4. Fastlæg [mandatet](orkestrering/mandat.md): hvem koordinerer og reviewer, hvad procesmandatet omfatter, hvilke planer der er sat i gang, og hvem der må integrere og publicere. Pakken indeholder ingen historiske godkendelser. Der kræves ikke en ny procesgodkendelse for hver handling inden for et allerede givet mandat.
5. Opret første plans [tre roller](arbejdsregler/planer/struktur/tre-roller.md) fra [planskabelonen](skabeloner/plan/index.md). Afgørende teknisk usikkerhed undersøges, og væsentlige valg modnes før forelæggelse.
6. Gennemgå [implementeringsklarheden](arbejdsregler/planer/forfatning/gennemgang.md), og sæt den konkrete leverance i [arbejdsoversigten](orkestrering/arbejdsoversigt.md). Retning, implementeringsklarhed og igangsættelse er tre forskellige forhold.
7. Kør dokumentkontrollen med python3 scripts/check_okf.py fra projektroden. Den kontrollerer struktur, metadata og lokale links; den udfylder ikke projektets fakta og godkender intet produktvalg.

## Første bestilling til en agent

Læs AGENTS.md, docs/index.md og docs/drift/projektprofil.md. Læs kun de relevante arbejdsregler og planer. Undersøg eksisterende kode og kontrakter. Konkretisér første plan med vision, scenarier og faseinddelt implementering; markér antagelser og væsentlige produktvalg. Registrér modningsarbejdet i arbejdsoversigten. Byg kun produktkode inden for dokumenteret igangsættelse og mandat.

## Tilpasning uden dobbelt autoritet

| Kildeprojektets konkrete valg | Genbrugelig form |
|---|---|
| Et bestemt produkt og tre strategiske spørgsmål | Egen vision og tre spørgsmål i kompasset |
| Bestemte runtime-, data- og adgangsregler | Egne systemgrænser med ét ansvar pr. fakta og beslutning |
| Navngivne modeller, apps og CLI-kommandoer | Roller og konkrete værktøjer i projektprofilen |
| Et bestemt antal miljøer og kvotereserver | Faktisk kapacitet og reserver i samme profil |
| Stående tilladelser givet på bestemte datoer | Projektets eget eksplicitte mandat med scope og reference |
| Allerede aktive planer, spørgsmål og timere | Tomme oversigter og inaktive kørsler |

Redaktion, der bevarer betydning, kræver ingen ny produktbeslutning. Et ændret produktprincip gør. Brug [dokumentvedligeholdelsen](arbejdsregler/dokumentation/vedligeholdelse.md) ved enhver opdatering.
