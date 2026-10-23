---
type: Delivery Contract
title: Fold ved completion
description: Afsluttet arbejde registreres læsbart, varig viden foldes, og planer ryddes efter faktisk levering.
status: stable
---
# Fold ved completion

Følg [arbejdsdelingen](../../samarbejde/arbejdsdeling.md), [implementeringsklarheden](../forfatning/gennemgang.md) og [kriteriet for færdig](../../../validering/kriterier/leverancestatus.md).

Leveranceejeren afleverer kort: hvad er lavet, gren og commit, smoke-testens resultat og hvad der mangler. Orkestratoren ejer den samlede afslutning efter integration:

1. Kontrollér, at hele den aftalte capability er leveret. Selvstændigt afsluttede leverancer kan registreres, mens en større plan fortsat er åben; uleveret scope forbliver synligt i planen og arbejdsoversigten.
2. Fold varige beslutninger, nødvendige begrundelser og væsentlige huller ind i deres autoritative emner efter [vedligeholdelsesreglen](../../dokumentation/vedligeholdelse.md). Erstat afløst tekst.
3. Skriv én linje i [udviklingsoversigten](../../../udviklingsoversigt.md): dato, forbedringen i én sætning og commit. Saml beslægtede ændringer i én linje.
4. Fjern afsluttede rækker fra arbejdsoversigten og besvarede spørgsmål fra indbakken. Ved hele planens completion fjernes planen, dens roadmap-link og aktive indgang; ret berørte indeks og indgående links. Delvis levering fjerner ikke den samlede plan.

Detaljeret udviklings- og beslutningshistorik ligger i Git.
