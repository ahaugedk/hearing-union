---
type: "Validation Criterion"
title: "Hvornår en leverance er færdig"
description: "Hele capabilityen virker gennem normale indgange og den relevante validering."
status: "stable"
---
# Hvornår en leverance er færdig

En leverance er færdig, når hele den aftalte capability virker gennem de normale indgange, [smoke](../metoder/smoke.md) består, og [let visuel kontrol](../metoder/visuel-gennemgang.md#let-kontrol) ikke viser regressioner, hvor brugerfladen er ændret. En større feature er først færdig, når [gennemgangen med rettelsesrunder](../metoder/visuel-gennemgang.md#gennemgang-med-rettelsesrunder) har kørt dens scenarie igennem, og bunken er løst.

Kvaliteten er rigtig: faktisk identitet og adgang, persistens, fejl og genoptagelse, isolation, tilgængelighed og sikkerhed, hvor det er relevant. Ingen falske loginveje, hardkodede svar, demo- eller fixtureveje i produktet, døde knapper eller skjulte arkitekturfallbacks.

Nævn mangler kort; uleveret aftalt scope bliver åbent i planen. En delvis leverance gør ikke en hel plan færdig. Før første produktionsversion skelnes der ikke mellem færdig og produktionsvalideret.
