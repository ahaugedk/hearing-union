---
type: "Delivery Contract"
title: "Før v1 og efter v1"
description: "Produktfasen afgør, hvordan model- og kontraktændringer forholder sig til eksisterende data."
status: "stable"
---
# Før v1 og efter v1

Produktfasen står i [projektprofilen](../../drift/projektprofil.md). Før første produktions-v1 bevares ingen udviklingsdata eller historik ved model- eller kontraktændringer: ingen datamigration, legacybro, bagudkompatibilitet, to samtidige formater eller rettelsesmigration.

- En skemaændring rettes i den migration, der oprindeligt definerer tabellen, policyen eller funktionen. Vælg derefter dev-reset særskilt. En ny migration er kun til ny funktionalitet.
- Afhængige integrationer, pakker, eksempler og kontroller omskrives til den nye form i samme levering. Den gamle form slettes.
- Et forkert design bygges om frem for at få en lap, når det gavner produktet efter [refaktoreringsreglen](../udvikling/arkitektur/refaktorering.md).

Miljøejeren vælger og beskriver dev-reset særskilt med afgrænset miljø og genopbygning fra aktuelle kontrakter efter [miljøreglen](../../drift/udviklingsmiljoe.md). Inden for et allerede givet procesmandat kræves ingen ny autorisation. Gammel state beviser ikke ny kode; frisk state beviser ikke friske builds eller images.

Efter v1 gælder [databevaring ved produktionsmodelskift](../../arkitektur/bevaring.md), aldrig drop/re-create med tab eller produktreset. Før-v1-reglen må ikke anvendes, blot fordi et miljø kaldes dev, hvis det bærer data under produktets bevaringsløfte.
