---
type: "Product Vision"
title: "Høreforeningens ChatGPT-app"
description: "Aktuel viden, aktiviteter og personlige handlinger fra Høreforeningen direkte i ChatGPT."
status: "stable"
---
# Høreforeningens ChatGPT-app

Høreforeningens viden og aktiviteter skal være tilgængelige dér, hvor brugeren allerede stiller sine spørgsmål: i ChatGPT. Appen giver kildebaserede, aktuelle svar om hørelse og foreningens tilbud og forbinder dem med handlinger som interessevalg, søgning efter foredrag, tilmelding og afmelding.

Brugeren møder én sammenhængende, autentificeret tjeneste. Personlige præferencer og tilmeldinger gemmes på brugerens egen interne konto og må ikke flyde mellem konti. Proaktive beskeder om relevante foredrag kræver et udtrykkeligt tilvalg. Administratorer vedligeholder viden og foredrag gennem de samme ChatGPT-indgange, og ejeren styrer administratoradgang.

Produktet skal kunne optages i den offentlige ChatGPT-appfortegnelse. En privat Sites-udgivelse er udviklings- og valideringsmiljø, ikke det endelige udgivelsesmål. OpenAIs eksterne godkendelse kan understøttes med en komplet og reviewbar løsning, men kan ikke garanteres af projektet.

## Produktgrænser

- Appen giver information og adgang til foreningens aktiviteter; den diagnosticerer eller behandler ikke.
- Viden leveres med kilder og gyldighedskontrol. Appen instruerer ChatGPT i at hente den aktuelle version og ikke gemme den som hukommelse, men kan ikke tilbagekalde allerede leveret tekst eller garantere modellens hukommelsesadfærd.
- Der gemmes ikke diagnoser, rå samtaletekst eller identificerbar brugshistorik. Statistik er aggregeret og anonym.
- Foredrag og tilmeldinger ligger i projektets egen database. Eksterne medlems-, booking- og betalingssystemer indgår ikke i MVP'en.
- Produktet foretager ingen egne modelkald og kræver ingen OpenAI API-nøgle.
- Den daglige administration sker gennem ChatGPT. Webfladen begrænses til nødvendige informations-, privatlivs-, support- og forbindelsessider.

Den igangsatte leverance og dens præcise MVP-scope står i [roadmappet](../../roadmap/chatgpt-app-mvp/index.md). [Kompasset](kompas.md) bruges ved løbende valg uden at udvide dette løfte.
