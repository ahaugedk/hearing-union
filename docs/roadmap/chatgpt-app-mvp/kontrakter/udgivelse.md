---
type: "Plan Implementation"
title: "Review, datalivscyklus og drift"
description: "Nødvendige sider, sletning, drift og klargøring til offentlig indsendelse."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Review, datalivscyklus og drift

Fase 7 i [implementeringen](../implementering.md). Følg [visionens scope](../vision.md), [kontoscenariet](../scenarier/konto.md) og det afklarede [platformgrundlag](platform.md).

- Opret minimale offentlige sider for appens formål, udgiver, privatliv, vilkår og support. Tilføj kun de forbindelses-/loginoplysninger og domænechallenge-ruter, som platformen kræver.
- Beskriv hvilke interesser og driftsdata der gemmes, hvorfor, hvor længe og hvordan de slettes. Giv brugeren kontrol over præferencer, eventabonnementer og konto; indhent nødvendigt samtykke før lagring af følsomme interessevalg.
- Implementér `delete_account`: deaktivér levering, fjern præferencer, tilmeldinger og abonnementshemmeligheder, og håndtér eventuelle auditreferencer uden at bevare unødvendig identitet. Beskyt ejeren mod utilsigtet tab af sidste ejerkonto.
- Sæt input-/resultatgrænser og ratebegrænsning, som fungerer på tværs af Worker-instanser. Log ingen komplette tool-inputs eller webhookbodies. Sundhedstjek må ikke eksponere persondata.
- Fastlæg backup-/gendannelsesmuligheder for D1 i den faktiske Sites-platform, og afprøv gendannelse med testdata. Dokumentér nøgleskift, fejlede leveringer og opdatering af indhold.
- Klargør udgiveroplysninger, logo, beskrivelser, eksempelsamtaler, permissions og revieweradgang med syntetiske data. Verificér den accepterede reviewvej for Sites/OpenAI-login; indfør ingen produktions-bypass til reviewer.

**Færdig når:** Reviewmateriale, offentlige sider, sletning og driftsvejledning svarer til den faktiske implementering. Indholdet er informationsformidling med kilder, ikke personlig diagnosticering.
