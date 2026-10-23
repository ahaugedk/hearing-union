---
type: "Validation Method"
title: "Smoke ved hver task og milepæl"
description: "Mindste kontrol af opstart og centralt kerneforløb i aktuel kode."
status: "stable"
---
# Smoke ved hver task og milepæl

Smoke svarer på ét spørgsmål: starter systemet, og virker det centrale kerneforløb stadig? Den afslutter hver task og milepæl. [Projektprofilen](../../drift/projektprofil.md) ejer den konkrete kommando og det mindste kerneforløb.

1. Kør projektets relevante statiske kontrol eller build.
2. Start eller verificér udviklingsmiljøet med den aktuelle kode.
3. Gennemfør det fastlagte kerneforløb gennem de normale indgange med reel identitet, persistens og genlæsning. Afprøv også den normale agent- eller API-indgang, hvis den er central for produktet.
4. Kør en særskilt, målrettet kontrol af netop det ændrede forløb mod det kørende miljø. Den bliver ikke en ny del af smoke.

Resultatet er bestået eller fejlet med første konkrete fejl. En fejl rettes før færdigmelding. Genkør kun efter en relevant ændring; gentagen kontrol af uændret arbejde er ingen leverance.

Smoke starter ikke automatisk miljøet og nulstiller det aldrig. Dev-reset vælges særskilt ved ændrede oprindelige migrationer før v1. En restorekontrol vælges kun, når backup eller restore er berørt. Gamle miljødata beviser ikke ny kode.

Smoke må ikke vokse til en suite. Nye brugerforløb hører til [gennemgangen](visuel-gennemgang.md). En konkret risiko får en selvstændig kontrol efter behov; ingen tests af blot navne, lister, tællinger eller filstruktur. Midlertidig udviklingstestkode slettes før afslutning. Aflever resultatet kort uden rapport, hash-manifest eller bevisregnskab.
