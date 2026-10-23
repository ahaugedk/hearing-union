---
type: "Working Agreement"
title: "Review ved aflevering"
description: "Hele ændringen reviewes mod regler, plan og arkitektur, før den flettes."
status: "stable"
---
# Review ved aflevering

Al kode reviewes ved aflevering, før den kommer i main. Den ansvarlige reviewer følger [mandatet](mandat.md). Et uafhængigt review af arbejderens ændring er den normale rollefordeling; tilgængelige værktøjer og identiteter står i projektprofilen.

Læs hele forskellen mellem gældende main og grenen, også skema, migrationer, klientkode, assets, smoke og docs. Hold ændringen op mod AGENTS.md, [arkitekturen](../arkitektur/index.md) og planen: korrekthed, autoritativ adgang, konkret kode, fejl, genoptagelse, isolation og fuldstændig levering.

Følgende er reviewfund:

- Rettelsesmigrationer, legacybroer, datamigration eller bagudkompatibilitet før v1 i strid med [modelændringsreglen](../arbejdsregler/levering/modelaendringer.md).
- Lapper på forkert design, hvor en generel ombygning er den rigtige rettelse.
- Kode, der [åbenlyst ikke skalerer](../arbejdsregler/levering/skalering.md), inklusive N+1.
- En ny model, et begreb eller en særvej, som en eksisterende eller forbedret fælles abstraktion bør bære; navngiv den relevante abstraktion.
- Et ekstra manifest, en DSL eller parallel konfiguration uden konkret behov, hvor kode, almindelige filer eller projektets datamodel kan bære betydningen.
- Udvidelse af smoke ud over det fastlagte kerneforløb eller midlertidig udviklingstestkode, som burde være fjernet.
- Bevisbogføring, kodegentagelser og uklare emneejere i docs.

Review bestiller ikke nye smoke-forløb. En konkret risiko får en selvstændig målrettet kontrol efter behov. Fund gives samlet til arbejderen, som retter på sin gren. Et begrundet afslag vurderes eksplicit af reviewansvarlig; uafklarede fund forsvinder ikke ved aflevering. Efter relevante ændringer læses den berørte diff igen. Ved integrationskonflikter kontrolleres også den samlede løsning.

En stor diff kan fordeles mellem få reviewers efter ansvar, hvis mandat og værktøjer understøtter det. Orkestratoren samler fund og ejer den samlede integration efter [koordinationen](koordinering.md).
