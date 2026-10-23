---
type: "Plan Implementation"
title: "Kontrakt for en konkret del"
description: "Kodeejere, data, adgang og udførelse forbinder input med et observerbart resultat."
status: "draft"
plan: "emne"
role: "implementation"
---
# Kontrakt for en konkret del

## Formål og ejerskab

Link til relevant [scenarie](../scenarier.md), [milepæl](../implementering.md) og [beslutningsgrundlag](../beslutninger.md). Navngiv ansvarlig komponent og berørte kodeområder eller eksisterende filer. Et fælles interface har én ejer.

## Konkret input og output

Vis et realistisk eksempel med syntetiske værdier og forventet synligt resultat. Beskriv type, lagring og transport kun i det omfang det er nødvendigt for ændringen. Link eksisterende kontrakter frem for at kopiere dem.

## Udførelsesvej

Beskriv sammenhængen fra normal indgang til autentifikation, autoritativ adgang, data eller ekstern effekt, persistens og genlæsning. Angiv relevante API-/SDK-, skema- og hostansvar samt bygning, installation og aktivering. Et build er ikke i sig selv aktiv adfærd.

## Grænser og fejl

Beskriv relevant isolation, afslag uden lækage, ændret eller forældet grundlag, idempotens, ukendt udfald, sikker retry og genoptagelse. Angiv dataejerskab, sletning og bevaring, hvor de er berørt. Anvend projektets produktfase på modelskift; opret ingen legacybro før v1.

## Kontrol og færdig

Link til det præcise scenarietrin og den eksisterende smoke-vej. Navngiv en konkret risiko, før der vælges en ekstra målrettet kontrol. Beskriv det observerbare afslutningskriterium uden rutinemålinger eller performancemål. Leveret arbejde erstattes senere af et link til kode og den gældende betydning, ingen bevisrapport.
