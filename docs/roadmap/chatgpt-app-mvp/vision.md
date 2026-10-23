---
type: "Plan Vision"
title: "Høreforeningens ChatGPT-app: løfte og scope"
description: "Aftalt MVP, aktører, produktgrænser og grundlag for planlægningen."
status: "draft"
plan: "chatgpt-app-mvp"
role: "vision"
---
# Høreforeningens ChatGPT-app: løfte og scope

## Problem og produktløfte

Høreforeningens viden og aktiviteter skal kunne bruges direkte i ChatGPT med tydelige kilder og en autentificeret forbindelse til brugerens egen konto. Brugeren skal kunne finde relevant viden, vælge interesser, få proaktiv besked om et nyt relevant foredrag og tilmelde sig gennem chat eller en indlejret MCP App. Administratoren skal kunne vedligeholde samme indhold og forstå brugen uden en særskilt administrationshjemmeside.

Målet er en MVP på OpenAI Sites med database, som kan indsendes til den offentlige ChatGPT-appfortegnelse. En privat forbindelse er en udviklingsmilepæl; den opfylder ikke alene udgivelsesmålet. OpenAIs godkendelse er ekstern og kan ikke garanteres.

## Aftalt scope

- Et databasebaseret, OKF-inspireret emnetræ med korte resuméer, søgeord, relationer, kildehenvisninger og metadata fra et afgrænset udsnit af hoereforeningen.dk. Hele hjemmesiden kopieres ikke.
- Autentificerede opslag og handlinger i brugerens kontekst med OpenAI-login og intern konto. Ingen eksterne medlems- eller bookingsystemer.
- Egne præferencer for emner, geografisk område og fysisk/online; ingen registrering af diagnoser eller udledning af interesser fra opslagshistorik.
- Intern foredragsdatabase med søgning, detaljer, tilmelding og afmelding gennem både chat og MCP App.
- Udtrykkeligt tilvalgte MCP Events om nye relevante foredrag, også når samtalen er inaktiv. En besked giver adgang til foredragsvisningen, men tilmelder ikke automatisk brugeren.
- Ingen udløbsdato på viden som standard. Administratoren kan tilføje eller ændre udløbet senere. Appen beder altid ChatGPT hente aktuel viden og undlade at gemme den i hukommelsen. Backend skal afvise udløbet indhold, men kan ikke tilbagekalde allerede leveret tekst eller garantere ChatGPTs hukommelsesadfærd.
- Al daglig administration af viden og foredrag foregår gennem ChatGPT. Webdelen begrænses til nødvendige informations-, privatlivs-, support- og forbindelsessider.
- Aggregeret, anonym brugsstatistik i en MCP App for administratorer. Ingen rå samtaletekst eller identificerbare brugerhistorikker; kontodata, præferencer og tilmeldinger opbevares separat.
- Anders er ejer og kan tildele og fjerne administratoradgang. Administratorer vedligeholder indhold og ser statistik, men kan ikke delegere roller.

Betaling og egne modelkald indgår ikke i det planlagte flow; foredragene kan derfor tilmeldes uden checkout. Den tekniske løsning kræver ikke en OpenAI API-nøgle. Dette afgrænser implementeringen, ikke hvilke aktiviteter foreningen ellers kan tilbyde.

## Grundlag og godkendelsesgrænse

Produktejerens bestilling og afklarende svar i denne samtale den 23. oktober 2026 fastlægger det ovenstående produktløfte: offentlig fortegnelse, konsulentopgave for foreningen, interne kontodata, foredrag og MCP Events, præferencefelter, standard uden udløb samt ejerens delegation. Efter overførslen til roadmappet har Anders bestilt opstart af udviklingen med denne session som orkestrator og efterfølgende en koordineringsrunde hver time. Det konkrete procesmandat står i [orkestreringsmandatet](../../orkestrering/mandat.md).

MVP-udviklingen er igangsat med platformmodning først. Bestillingen godkender ikke stiltiende nye væsentlige produktvalg. Runtime, datamodel og kodeopdeling i [implementeringskontrakterne](kontrakter/index.md) konkretiseres gennem udviklingen; almindelige kodevalg træffes selvstændigt, mens væsentlige ændringer i binding, adgang, databevaring eller produktløfte følger [beslutningsreglen](../../arbejdsregler/beslutninger/afklaring/vaesentlige-valg.md).

[Platformafprøvningen](kontrakter/platform.md) skal afklare login, offentligt review, faktisk eventunderstøttelse og ubemandet genlevering. Det er nødvendigt planmodningsarbejde, ikke en begrundelse for at fjerne aftalt v1. Projektets generiske [kompas](../../produkt/retning/kompas.md), [profil](../../drift/projektprofil.md) og [procesmandat](../../orkestrering/mandat.md) er endnu ikke konkretiseret; udfyld dem før udviklingsleverancer bestilles uden at fremstille planforslag som gældende arkitektur.

[Scenarierne](scenarier.md) gør løftet observerbart, [implementeringen](implementering.md) fordeler faserne, og [arbejdsoversigten](../../orkestrering/arbejdsoversigt.md) ejer den operationelle igangsættelse.
