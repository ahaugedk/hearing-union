---
type: "Plan Scenarios"
title: "Slet en konto og stop aktive leveringer"
description: "Brugeren kan afslutte sin konto uden efterfølgende personlige data eller ventende beskeder."
status: "draft"
plan: "chatgpt-app-mvp"
role: "scenarios"
---
# Slet en konto og stop aktive leveringer

Anna har gemte interesser, en foredragstilmelding og et aktivt eventabonnement. Hun vil stoppe forbindelsen og få sine data slettet gennem ChatGPT.

1. Hun beder om at få kontoen slettet og kan forstå, hvilke personlige data og tilmeldinger handlingen fjerner. Sletning af appkontoen fremstilles ikke som sletning af tidligere ChatGPT-samtaler.
2. Efter hendes udtrykkelige bestilling deaktiverer backend aktive abonnementer og ventende leveringer og fjerner præferencer, tilmeldinger og abonnementshemmeligheder.
3. En allerede kølagt levering genkontrollerer konto og abonnement og må ikke sende efter sletningen. Administratorrapporten indeholder fortsat kun anonyme aggregater og kan ikke genskabe hendes historik.
4. Hvis der findes nødvendige auditreferencer, håndteres de uden unødvendig bevarelse af identitet. Ejeren kan ikke utilsigtet slette systemets sidste ejeradgang gennem samme almindelige kontofunktion.

[Udgivelseskontrakten](../kontrakter/udgivelse.md) ejer datalivscyklussen, og [eventkontrakten](../kontrakter/events.md) ejer stop af ventende leveringer. Forløbet er en forventning, ikke et kørselsresultat.
