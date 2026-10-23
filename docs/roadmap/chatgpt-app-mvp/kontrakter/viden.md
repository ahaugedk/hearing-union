---
type: "Plan Implementation"
title: "Vidensindeks og aktualitet"
description: "Import, emnetræ, søgning, publicering og håndhævelse af gyldighed."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Vidensindeks og aktualitet

Fase 3 i [implementeringen](../implementering.md). Følg [visionens scope](../vision.md) og [vidensscenariet](../scenarier/viden.md). [Fundamentet](fundament.md) ejer tabeller og værktøjsnavne.

1. Kortlæg et afgrænset udsnit af hoereforeningen.dk, og verificér hver konkret kilde-URL. Sigt mod 20–30 nyttige vidensposter, grupperet efter foreningen, rådgivning, høreproblemer, hjælpemidler og aktiviteter; den endelige struktur følger de fundne kilder.
2. Lav et engangsimportscript, som upserter noder og relationer via samme validering som administratorfunktionerne. Eventuelle importfiler er kun input; runtime læser altid fra databasen.
3. Implementér dansk søgning over titel, resumé og søgeord med SQLite FTS5, efter verificering i D1. Rangér titel og synonymer højest; hent altid de aktuelle poster fra hovedtabellen efter søgning.
4. Implementér trænavigation med `parent_id`, og separate relaterede-emne-links. Afvis cykler og ugyldige forældre. Skjul en gren for almindelige opslag, hvis en overordnet node er upubliceret eller udløbet.
5. Implementér versionskontrol og revisionshistorik. En ændret udløbsdato skal gælde fra næste opslag, også når indholdet tidligere var uden udløb.

Alle almindelige læseveje, også søgeresuméer, filtrerer efter publicering og gyldighed:

```sql
WHERE status = 'published'
  AND (expires_at IS NULL OR expires_at > :now)
```

Opslag returnerer `id`, `version`, resumé, kilder, `retrievedAt`, `verifiedAt` og `expiresAt`. Ved udløb returneres ingen gammel brødtekst; svaret angiver, at posten kræver opdatering. Administratorer har en separat læsevej til kladder og udløbne poster.

Appens instruktioner og værktøjsbeskrivelser kræver kildehenvisninger og et nyt opslag ved nye faktuelle spørgsmål. Frabed altid lagring af foreningens viden i ChatGPT-hukommelsen, også ved `expiresAt: null`. Brug ingen indholdscache mellem samtaler i MVP'en. Dette håndhæver aktuelle serversvar, men kan ikke tilbagekalde allerede leveret samtaletekst eller garantere ChatGPTs hukommelsesadfærd.

Administratorens ChatGPT-flow er: find post, redigér kladde, gennemgå ændringen og publicér den konkrete version. Efter første import sker løbende vedligehold gennem disse værktøjer; ingen automatisk crawling er del af MVP'en.

**Færdig når:** Brugeren kan finde relevante emner med virkende kilder. En publiceret ændring eller ny udløbsdato får virkning i søgning, direkte opslag og trænavigation uden redeployment.
