---
type: "Architecture Contract"
title: "Projektets systemgrænser"
description: "Projektets konkrete komponenter, dataejere, adgang og udførelsesgrænser."
status: "draft"
---
# Projektets systemgrænser

Systemgrænserne er endnu ikke fastlagt. Erstat denne tekst og tabellen med projektets faktiske arkitektur. En udfyldt arkitekturskitse er ikke i sig selv en godkendelse eller en implementering.

| Spørgsmål | Skal fastlægges |
|---|---|
| Primære indgange | Hvordan mennesker, klienter og eventuelle produktagenter bruger systemet |
| Ansvar | Hvilken komponent ejer hvert centralt begreb og hver udførelse |
| Data | Autoritativ kilde, persistens, transaktioner, historik og sletning |
| Identitet og adgang | Autentifikation, håndhævelsessted, isolation og tilbagekaldelse |
| Eksterne effekter | Autorisation, idempotens, kvittering og håndtering af ukendt udfald |
| Intelligens | Om og hvor eventuel modelkørsel hører hjemme i produktet |
| Bygning og aktivering | Fra kildekode og skema til faktisk aktiv adfærd |
| Fejl og genoptagelse | Holdbar fremdrift, sikre retries og diagnoser |
| Udvidelser | Hvilke fælles kontrakter integrationer og nye features bruger |

Henvis til konkrete kodeejere, når de findes; kopier ikke signaturer eller filinventar hertil. Runtimeintelligens er et produktvalg, mens agenter i udviklingsprocessen er en arbejdsform.
