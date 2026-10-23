---
type: "Runbook"
title: "Aktuel kode i et afgrænset udviklingsmiljø"
description: "Opstart, reset og diagnose vælges særskilt og har en ansvarlig ejer."
status: "stable"
---
# Aktuel kode i et afgrænset udviklingsmiljø

De konkrete kommandoer, adresser og ejere har ét hjem i [projektprofilen](projektprofil.md). Hver aktiv arbejder bruger sit eget miljø med adskilte data og porte. Kun miljøejeren ændrer dets state; to processer nulstiller aldrig samme miljø samtidigt.

## Opstart

Kontrollér arbejdsgren, kode, afhængigheder og aktiverede builds. Start miljøet med projektets normale opstartsvej. Et gammelt kørende miljø siger intet om den nye kode. Frisk data siger heller ikke, at de rigtige images eller builds er aktive. Bekræft den ændrede adfærd gennem den normale indgang.

## Dev-reset

Reset er et særskilt, eksplicit valg med navngivet miljø, afgrænsede data og plan for genopbygning. Ved ændret oprindelig migration før v1 følger reset efter [modelændringsreglen](../arbejdsregler/levering/modelaendringer.md). Opstart eller smoke udløser aldrig reset automatisk.

Udfør inden for det stående procesmandat. Genopbyg bagefter fra aktuelle kontrakter, syntetiske identiteter og produktets normale etableringsvej. Brug ikke før-v1-reset på data omfattet af produktionsbevaring.

## Diagnose

Forbind den synlige fejl med den faktiske session, request, log eller komponent. Brug interne kald eller databaseopslag til målrettet diagnose, når det er nødvendigt; de fuldender ikke et fejlet brugertrin. Et ukendt skriveudfald genlæses gennem produktet før retry.

Rå logs, profiler, skærmbilleder og midlertidige kontroller bliver i kørselsartefakter uden for versionerede docs. Fold kun en varig begrænsning eller nødvendig begrundelse ind i det emne, den tilhører. Del ingen secrets eller persondata i artefakter.
