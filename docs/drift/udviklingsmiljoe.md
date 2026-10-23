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

## Indhold og persondata

Kildeinputtet i `data/knowledge.json` er et afgrænset redaktionelt udsnit, ikke en kopi af hjemmesiden. Import bruger de samme validerings- og publiceringsfunktioner som administratorværktøjerne. Standardgenkørsel overskriver ikke administratorændringer. Efter import foregår daglig vedligehold gennem MCP; arkiv og udløb håndhæves på alle almindelige læseveje.

Præferencer gemmes først efter udtrykkeligt samtykke til de viste emner og områder. Eventtilvalg er særskilt og tilmelder aldrig automatisk til et foredrag. Kontosletning fjerner personlige relationer, abonnementshemmeligheder og ventende leveringer samt kontoreferencer i rolleaudit. Tidligere ChatGPT-samtaler og eksterne sikkerhedskopier slettes ikke af kontoværktøjet.

## Leveringskø og nøgler

Et publiceret foredrag skriver hændelsen atomisk med indholdet. Første lokale levering forsøges efter commit; fejlede forsøg forbliver i databasen. Køpassagen fra projektprofilen kan genoptages efter procesgenstart. Den er ingen timevækkemekanisme for orkestratoren, og ingen ekstern trigger er konfigureret. Levering er mindst én gang: modtageren kan få samme event-id igen efter et ukendt netværksudfald. En allerede afsendt request kan ikke tilbagekaldes; ventende leveringer genkontrolleres før dispatch.

Callbacknøgler krypteres med den lokale eventnøgle. Sikr den matchende nøgle sammen med databasesnapshottet i et beskyttet lager; databasen alene er utilstrækkelig til at genoptage levering. Serveren afviser manglende eller forkert nøgle ved eksisterende krypterede abonnementer. Udskift ikke nøglefilen for at omgå fejlen. Gendan det matchende sæt, eller vælg særskilt et afgrænset dev-reset.

Webhooknøgleskift foretages ved fornyelse af det samme abonnement med ny signeringsnøgle; det korte overlap bruger begge signaturer. Rotation af selve lagringskrypteringsnøglen kræver en særskilt offline-genkrypteringsprocedure, som skal fastlægges i den faktiske hostingplatform før produktion.

Administratorens eventstatus viser kun aggregerede leveringsstatusser. Ved permanente fejl kontrolleres modtageradgang og abonnement gennem den normale forbindelse; kopier aldrig callbacknøgler til logs eller samtalen.

## Gendannelse

Backup og restore fra projektprofilen tager et konsistent SQLite-snapshot, også når data ligger i WAL. Begge validerer integritet og fremmednøgler. Restore skriver kun til en ny fil; stop den ejerstyrede service før et særskilt valg af en gendannet database. Bevar originalen, indtil det normale kerneforløb er gennemført mod det gendannede miljø. D1-backup og -restore er endnu ikke afprøvet og må ikke udledes af det lokale forsøg.
