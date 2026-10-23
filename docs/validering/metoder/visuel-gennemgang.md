---
type: "Validation Method"
title: "Visuel gennemgang"
description: "Synlig browserbetjening vurderer hele brugeroplevelsen og gentages efter rettelser."
status: "stable"
---
# Visuel gennemgang

Gennemgangen vurderer det kørende produkt: forståelse, findbarhed, handlinger, tilgængelighed, grafisk kvalitet og oplevet ventetid. Browser, kerneflader, målgruppe, sproglige krav og relevant mobilbredde vælges i [projektprofilen](../../drift/projektprofil.md). Brug den indbyggede browser som udgangspunkt, hvor miljøet tilbyder den; vælg en faktisk tilgængelig browser eksplicit.

## Kadence og betjening

Let kontrol køres ved milepæle, der ændrer det, brugeren ser. En gennemgang med rettelsesrunder køres før en større feature erklæres færdig og når produktejeren beder om den. En større feature er en plan eller selvstændig milepæl, der giver en ny capability. Smoke afslutter stadig hver task og milepæl.

Den ansvarlige for gennemgangen udfører den selv; den venter ikke på produktejeren. Browseren skal faktisk tegne siden før et skærmbillede bruges. Betjen synlig UI med klik, tekst, scroll og tastatur. Læs den nye tilstand efter hver væsentlig handling. Interne API-kald, SQL og håndseedning er diagnose, ingen fuldendt brugeropgave; det oprindelige trin forbliver fejlet.

Brug syntetiske testidentiteter og indhold. Skærmbilleder og noter ligger i midlertidige kørselsartefakter og committes ikke. Fjern persondata og secrets før deling.

## Let kontrol

Gå projektets kerneflader igennem på desktop og ved relevant mobilbredde, inklusive foldet navigation. Sammenlign med seneste tilgængelige kontrol. Se efter tomme sider, brudt layout, uforståelig tekst, manglende handlinger, døde knapper og mærkbart langsommere svar. Notér også overfyldte eller tekniske flader.

Resultatet er OK eller en kort regressionsliste. Ret en regression straks eller gør den synlig i den relevante plan eller arbejdsoversigt; uafklarede regressioner må ikke forsvinde i en færdigmelding. Det er en let kontrol, ikke en fuld designundersøgelse.

## Gennemgang med rettelsesrunder

Brug featurens scenarie eller et [genbrugeligt scenarie](../scenarier/index.md). Start med aktuel kode og den normale etableringsvej. Hvis produktet har agenter, udfører en produktagent sin del gennem normal adgang og egen identitet; udviklingsagentens interne adgang er ikke en erstatning.

### Gennemløbet

- Giv personaen en opgave i produktets egne ord. Giv en eventuel produktagent mål og faktisk adgang, men ingen tvungen metode eller konklusion. Scriptet indhold viser ikke dømmekraft.
- Notér førstehåndsindtrykket før første interaktion: fokus, troværdighed, sammenhæng og finish i forhold til målgruppen.
- Forklar ved checkpoints ud fra skærmen: aktiv rolle og kontekst, hvad der er sket, hvem der gjorde det, hvad der mangler, og næste mulige handling. Genfind resultatet fra normal indgang uden hjælperens chat.
- Kontrollér checkpoints på desktop og mobil: tastatur, fokus, labels, landmarks, sprog samt fejl-, tom- og ventetilstande, som produktet kan fremkalde.
- Afprøv relevante sessionskift, logout og adgangsafslag. Et afslag må ikke lække indhold, links eller tællinger; fravær i menuen er ingen adgangsbeskyttelse.
- Et blokeret trin stopper kun afhængige trin. En manglende capability er et fund og simuleres ikke. Ved ukendt skriveudfald genlæses produktet før retry; handlinger gentages aldrig blindt.

### Bunken

Saml noter under gennemløbet og ret bagefter. Hver note beskriver synlig årsag, konsekvens for brugeren og konkret rettelse i den gældende designretning. Vurdér look and feel ud fra aktuelle skærmbilleder, eventuelt med et tilgængeligt designreviewværktøj, ikke fra gammel kode eller gamle billeder.

| Kategori | Vurdering |
|---|---|
| Brugervenlighed | Logik, findbarhed, omveje, udfald, næste handling og oplevet ventetid |
| Visuelt udtryk | Hierarki, komposition, typografi, farver, komponentfinish og tillid hos målgruppen |
| Overfyldt og teknisk UI | Interne begreber, id'er, prosa og valg uden umiddelbar brugsværdi; ret med klarere handlinger og gradvis visning frem for mere forklaring |
| Øvrige | Fejl, adgang, tekst og andre mangler |

Visuelle fund er ikke automatisk kosmetik; prioriter effekt på første indtryk, tillid og læsbarhed. Opleves noget som langsomt, undersøges årsagen målrettet før rettelsen. Ingen rutinemålinger, tællinger eller performancemål; [skaleringsreglen](../../arbejdsregler/levering/skalering.md) gælder.

### Rettelsesrunder

1. Forelæg strukturelle produktvalg efter [afklaringsarbejdsgangen](../../orkestrering/afklaringer/arbejdsgang.md). Arbejderne retter øvrige fund inden for mandatet; kode reviewes før integration.
2. Nulstil gennemgangens afgrænsede miljø, og kør scenariet igen fra start med den rettede kode. Reset er et særskilt valgt indgreb efter miljøreglen, ikke en skjult del af en testkommando. Tilføj nye fund til bunken.
3. Fortsæt, indtil scenariet virker gennem normale indgange, og bunken er løst. Et åbent produktvalg eller aftalt uleveret scope betyder, at den afhængige capability stadig ikke er færdig.
4. Fold varige fund i relevant plan eller emne. Slet derefter bunken; ingen rapport eller bevisbogføring.

En agents gennemgang er ingen empirisk brugerundersøgelse. En mobilvisning i browseren er ingen fysisk telefon.
