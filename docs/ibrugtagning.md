---
type: "Setup Guide"
title: "Arbejd i Høreforeningens projekt"
description: "Kort indgang til produktretning, udvikling, validering og GitHub-baseret koordinering."
status: "stable"
---
# Arbejd i Høreforeningens projekt

Projektet bygger Høreforeningens ChatGPT-app på OpenAI Sites. GitHub er fælles sandhed for produktdokumenter, kodeleverancer, review og overdragelse mellem Codex Cloud og Sites-udgiveren.

## Find det autoritative grundlag

1. Læs [produktvisionen](produkt/retning/vision.md) og [kompasset](produkt/retning/kompas.md) for det samlede løfte og produktets grænser.
2. Brug [roadmappet](roadmap/index.md) til igangsat scope, scenarier og implementeringskontrakter.
3. Følg [systemgrænserne](arkitektur/systemgraenser.md) og [projektprofilen](drift/projektprofil.md) for den aktuelle arkitektur, kommandoer og miljøer.
4. Læs [mandatet](orkestrering/mandat.md) og [arbejdsoversigten](orkestrering/arbejdsoversigt.md), før nyt arbejde bestilles eller påbegyndes.
5. Følg [udgivelseskontrakten](drift/sites-udgivelse.md), når en leverance skal overdrages til ChatGPT Sites.

Et udsagn har ét autoritativt hjem. Koden ejer implementeringsdetaljer; varige dokumenter ejer gældende produktløfter, arkitektur og arbejdsregler; midlertidige leverancer og beslutningsspor bliver i den aktive plan og Git.

## Arbejdsgang for en kodeleverance

En arbejder bruger en afgrænset branch og læser kun de relevante dokumentgrene. Leverancen implementeres og valideres efter [risikobaseret validering](arbejdsregler/levering/risikobaseret-validering.md). Afleveringen indeholder resultat, branch og commit, smoke-resultat og konkrete mangler.

Orkestratoren reviewer hele ændringen mod aktuel `main`, arkitektur og plan. Fund sendes samlet tilbage gennem GitHub. Intet integreres eller publiceres med uløste reviewfund.

Ved Sites-udgivelse angiver `.openai/deployment-handoff.json` den præcise deployerbare commit. En separat handoff-commit kan derfor ligge efter kodecommitten. Sites-udgiveren publicerer den angivne kodecommit, bevarer projektets adgangspolitik og skriver version, URL eller blokering tilbage i GitHub.

## Afklaringer til produktejeren

Kun modne spørgsmål, der kræver et produktvalg eller en handling fra Anders, placeres i [afklaringsindbakken](orkestrering/afklaringer/indbakke.md). Tekniske problemer, som teamet selv kan løse, bliver på leverancen. Når en indbakkepost oprettes, sendes samtidig en kort Gmail med link til posten efter [afklaringsarbejdsgangen](orkestrering/afklaringer/arbejdsgang.md).

## Kontrol

Kør dokumentkontrollen fra projektroden:

```sh
python3 scripts/check_okf.py
```

Projektets konkrete build-, smoke- og opstartskommandoer står i [projektprofilen](drift/projektprofil.md). Skabeloner under [docs/skabeloner](skabeloner/index.md) er bevidst generelle og udfyldes kun, når de kopieres ind i en konkret plan eller leverance.
