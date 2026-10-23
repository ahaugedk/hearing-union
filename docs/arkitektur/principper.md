---
type: "Architecture Principle"
title: "Ansvar, autoritet og konkret kode"
description: "Ét ansvar og én autoritativ vej gør systemet forståeligt og konsistent."
status: "stable"
---
# Ansvar, autoritet og konkret kode

Et begreb eller en adgangsbeslutning har ét navngivet hjem. Fælles indgange bruger de samme kontrakter og rettigheder; nye features opretter ikke en parallel authority, en konkurrerende model eller en skjult særvej. Ansvarsgrænser beskrives i [systemgrænserne](systemgraenser.md).

Implementér aftalt adfærd i konkret kode og data med tydeligt ejerskab. Et ekstra manifest, en DSL, et registry eller konfiguration, der beskriver samme adfærd igen, kræver et konkret behov. Transportform, lagringsform og domænebetydning må gerne være forskellige, men deres afbildning og ejere skal være klare. Kildeprojektets bestemte SQL-, runtime- og modelvalg gælder ikke automatisk her.

Adgang håndhæves i den autoritative vej, også før filtrering, optælling, søgning og udlevering. UI-skjul er ikke adgangskontrol. Faktisk identitet, isolation, persistens og relevante fejl- og genoptagelsesforløb er del af en [færdig leverance](../validering/kriterier/leverancestatus.md).

Fælles problemer løses generelt efter [refaktoreringsreglen](../arbejdsregler/udvikling/arkitektur/refaktorering.md). Mellem faser undersøger orkestratoren, om dublerede begreber og særveje bør samles, før næste lag bygges. Væsentlige principændringer forelægges som produktvalg.
