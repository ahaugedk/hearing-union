---
type: "Authoring Contract"
title: "Planens tre roller"
description: "Vision, scenarier og implementering hænger sammen gennem fælles scope og links."
status: "stable"
---
# Planens tre roller

Alle planer har separate [vision](../forfatning/vision.md), [scenarier](../forfatning/scenarier.md) og [implementeringsplan](../forfatning/implementering.md). Find eksisterende arbejde gennem [roadmappet](../../../roadmap/index.md), før en ny plan oprettes.

En ny plan ligger i docs/roadmap/<emne>/ med index.md, vision.md, scenarier.md og implementering.md. Brug et beskrivende emnenavn. [Planskabelonen](../../../skabeloner/plan/index.md) viser formen. Opret kun ekstra blade og grene med selvstændigt læsebehov; detaljerede planer er tilsigtede, men indgange gentager ikke specifikationen.

Fælles scope, mandat og godkendelser har ét hjem, typisk visionen eller et beslutningsblad. Andre roller linker. Planens leveret, mangler og næste milepæle står i et statusblad, når der er behov; leveret arbejde får én linje i stedet for leverings-, måle- eller bevisafsnit. Operationel klarhed, afhængigheder, igangsættelse og trådansvar bor i [arbejdsoversigten](../../../orkestrering/arbejdsoversigt.md), ikke i særlige ready-mapper eller work_status-felter.

Genbrugelige målscenarier og deres protokoller bor i [valideringsscenarierne](../../../validering/scenarier/index.md); ændringsspecifikke scenarier bliver i planen. Der er ingen særskilt aktiv plan eller planindgang i projektroden.

Rolleblade har fælles plan-id samt role: vision, scenarios eller implementation. Brug henholdsvis type: Plan Vision, Plan Scenarios og Plan Implementation. Kontrakt- og scenariedelblade deler plan-id og den relevante rolle. Et rent planindeks har ingen rollemærkning. status beskriver dokumentets stabilitet, ikke godkendelse, readiness eller produktionsbevis. Metadataformen står i [OKF-profilen](../../dokumentation/okf.md).
