---
type: "Working Agreement"
title: "Kode, der åbenlyst ikke skalerer"
description: "Skalering vurderes i design og review; oplevet ventetid vurderes i brugen."
status: "stable"
---
# Kode, der åbenlyst ikke skalerer

Kode, der åbenlyst ikke skalerer, skrives ikke og accepteres ikke ved review og integration. Det gælder kvadratisk arbejde med voksende data, læsning af hele datasæt for at løse et afgrænset opslag og N+1: ét opslag eller kald pr. element, hvor ét mængdeopslag kan hente det hele.

N+1 er et reviewfund, også før det mærkes. Ret med et mængdeopslag eller en ansvarlig grænse, der lader kalderen spørge samlet. Optælling af kald er ingen rettelse af et forkert design.

Der er ingen mål, budgetter eller gates for SQL-antal, rundture, transaktioner eller latens og ingen før/efter-regnskaber. Et par ekstra kald i en asynkron operation, som brugeren ikke venter på, er ikke et problem i sig selv.

Om systemet er hurtigt nok, vurderes i [gennemgangen](../../validering/metoder/visuel-gennemgang.md). Opleves noget som langsomt, undersøges årsagen målrettet, og rettelsen vurderes på oplevelsen.
