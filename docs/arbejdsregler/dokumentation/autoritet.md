---
type: Working Agreement
title: Emneautoritet og OKF
description: Små emner ejer gældende viden; navigation og kode ejer deres egne facts.
status: stable
---
# Emneautoritet og OKF

Varige docs bevarer produktløfter, godkendte principper, nødvendige begrundelser, ansvar, arbejds-/driftsregler og væsentlige begrænsninger. Skeln beslutning og implementering.

Koden er dokumentationen: den ejer felter, signaturer, filinventar og algoritmetrin. Link snævert frem for genfortælling. Varige docs beskriver, hvad der gælder, og hvorfor, når begrundelsen er nødvendig. Udviklingshistorik, plan-/fasereferencer, beslutningsnumre, supersession og godkendelsesforløb hører ikke til her, heller ikke i metadata eller kildehenvisninger. Ét udsagn har ét hjem.

Midlertidige planer bor i [docs/roadmap](../../roadmap/index.md). De bevarer ændringens scope, forslag, antagelser, faktisk godkendelsesgrundlag/dato, kodeafleveringer og udeståender. De er ikke gældende arkitektur alene ved placeringen i docs. Bevar kun beslutningsspor, som afgør arbejdets aktuelle mandat; detaljeret afsluttet udviklingshistorik bor i Git. [Udviklingsoversigten](../../udviklingsoversigt.md) er en tæt changelog med én linje pr. større logisk ændring efter [completionreglen](../planer/levering/completion.md): dato, forbedring og commit. Historikken holdes dér frem for i gældende faglige emner. Genbrugelige målscenarier og deres protokoller bor under [valideringens scenarier](../../validering/scenarier/index.md) og skaber intet leveringsbevis.

[Validering](../../validering/index.md) guider udviklingen og efterlader ingen rapporter i docs. Et målefund, der begrunder et valg eller en kendt grænse, skrives kort ved det emne, det begrunder; rå måledata, profiler og kørselslog bliver i kørselsartefakterne. Ingen leverings- eller bevisbogføring i docs.

[Forfatning](forfatning.md), [format](okf.md) og [vedligeholdelse](vedligeholdelse.md) gælder. AGENTS er korte tværgående instruktioner; README navigerer.
