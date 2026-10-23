---
type: Validation Contract
title: Let validering af aktuelt arbejde
description: Smoke-test og visuel gennemgang guider udviklingen uden bevisbogføring.
status: stable
---
# Let validering af aktuelt arbejde

Validering guider udviklingsprocessen. Den består af tre niveauer efter [valideringsområdet](../../validering/index.md):

1. [Smoke-test](../../validering/metoder/smoke.md) ved afslutning af hver task og milepæl.
2. [Let visuel kontrol](../../validering/metoder/visuel-gennemgang.md#let-kontrol) ved milepæle, der ændrer det, brugeren ser.
3. [Gennemgang med rettelsesrunder](../../validering/metoder/visuel-gennemgang.md#gennemgang-med-rettelsesrunder), når en større feature er færdig, før den erklæres færdig, og når produktejeren beder om den.

Ud over dem vælges en kontrol kun ved en konkret risiko: angiv risikoen, vælg den mindste kontrol, og genkør kun efter en relevant ændring. Ingen suite, ingen rutinemæssige målinger, og ingen tests eller kontroller, der fastholder kodens form (lister, navne, tællinger, filstruktur). Performance har ingen mål eller tællinger; den vurderes i den visuelle gennemgang, og kode, der åbenlyst ikke skalerer, afvises efter [skaleringsreglen](skalering.md).

Opstart, reset og browser er agentens egne valg under [arbejdsdelingens stående procesmandat](../samarbejde/arbejdsdeling.md); gammel miljøstate siger intet om ny kode.

Validering efterlader ingen bevisbogføring: ingen hash-manifester, adoptionsrecords, frosne kildebaser eller bevisregnskaber. Afleveringen siger kort, hvad der er lavet, smoke-testens resultat og hvad der mangler; [kriteriet for færdig](../../validering/kriterier/leverancestatus.md) gælder.
