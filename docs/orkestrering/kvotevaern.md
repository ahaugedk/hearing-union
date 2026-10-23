---
type: "Working Agreement"
title: "Kapacitet og kvoteværn"
description: "Målt kapacitet styrer bestilling, reserve, pause og sikker overdragelse."
status: "stable"
---
# Kapacitet og kvoteværn

Konkrete værktøjer, forbrugspuljer, aflæsningsvej, arbejdsprioritet, reserver og maksimal miljøkapacitet fastlægges i [projektprofilen](../drift/projektprofil.md). Faktisk aktivering, pause og målt rest har hjem i [planlagte kørsler](planlagte-koersler.md). Der er ingen universel modelversion, procentgrænse eller kapacitetsgrænse i pakken.

Orkestratoren aflæser relevante puljer ved rundens start og før nye bestillinger. Ukendt forbrug er ikke nul. Kan en aftalt pulje ikke aflæses, startes intet nyt i den; meld fejlen én gang, og fortsæt arbejde i en faktisk tilgængelig pulje inden for mandatet.

Brug puljerne efter den fastlagte prioritet, og bevar kapacitet til koordination og review. Når en puljes grænse er nået eller produktejeren frakobler den:

1. Opdatér den faktiske status med målt rest og kendt nulstillingstid.
2. Stop nye bestillinger. Bed kørende arbejdere standse ved næste sikre punkt og committe på egne grene.
3. Overdrag åbent arbejde med gren, ejergrænse og næste handling i arbejdsoversigten; undgå dobbeltbestilling.

Når review eller orkestrering ikke kan fortsætte, pauses den berørte proces. Intet flettes uden review. Kvotenulstilling er ingen automatisk genoptagelse; følg projektets dokumenterede aktiveringsmandat.
