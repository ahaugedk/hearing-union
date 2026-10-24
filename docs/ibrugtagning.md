---
type: "Setup Guide"
title: "Arbejd i Høreforeningens projekt"
description: "Indgang til produktretning, udvikling, validering og GitHub-baseret koordinering."
status: "stable"
---
# Arbejd i Høreforeningens projekt

GitHub er fælles sandhed for produktdokumenter, kode, review og udgivelsesstatus. Underagenter implementerer i denne projektsamtale; orkestratoren ejer review, slutbrugertest og deployment.

1. Læs [produktvisionen](produkt/retning/vision.md) og [kompasset](produkt/retning/kompas.md).
2. Find igangsat scope og scenarier i [roadmappet](roadmap/index.md).
3. Følg [systemgrænserne](arkitektur/systemgraenser.md) og [projektprofilen](drift/projektprofil.md).
4. Kontrollér [mandatet](orkestrering/mandat.md) og [arbejdsoversigten](orkestrering/arbejdsoversigt.md).
5. Brug [udgivelseskontrakten](drift/sites-udgivelse.md) ved Sites-overdragelse.

En arbejder afleverer resultat, branch og commit, smoke-resultat og mangler. Orkestratoren reviewer hele ændringen mod aktuel `main`; intet integreres eller publiceres med uløste fund. `.openai/deployment-handoff.json` peger på den præcise deployerbare kodecommit, som godt kan ligge før en separat handoff-commit.

Kun modne spørgsmål eller handlinger til Anders placeres i [afklaringsindbakken](orkestrering/afklaringer/indbakke.md). Samtidig sendes en kort Gmail efter [afklaringsarbejdsgangen](orkestrering/afklaringer/arbejdsgang.md). GitHub er autoritativ; mailen er kun notifikation.

Kør dokumentkontrollen fra projektroden:

```sh
python3 scripts/check_okf.py
```

Build-, smoke- og opstartskommandoer står i [projektprofilen](drift/projektprofil.md). [Skabelonerne](skabeloner/index.md) er bevidst generelle og udfyldes først, når de kopieres til en konkret leverance.
