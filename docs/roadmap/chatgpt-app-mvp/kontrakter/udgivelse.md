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

- Hold webdelen ultra minimal: forsiden har kun én knap til appens verificerede installationsside i ChatGPT. Ingen ekstra hero, funktionsoversigt eller webadministration. Uden verificeret katalogadresse vises en kort utilgængelighedsbesked frem for et opdigtet link.
- Bevar kun korte støttesider for privatliv, vilkår og support/udgiver. Tekniske forbindelsesforklaringer hører i driftsdokumenterne. Siderne skal svare til faktiske dataforhold og reviewerens behov; en udviklingsforklaring er ikke en færdig privatlivspolitik. Tilføj kun platformkrævede challenge-ruter.
- Brug Høreforeningens visuelle identitet: hvid baggrund, mørk grå tekst, limegrøn accent og Trebuchet MS som tilgængelig fontfallback. Accentfarven er en skærmtilnærmelse, ikke en påstand om nøjagtig Pantone-gengivelse. Logo og navnetræk må ikke genskabes eller ændres. [Foreningens designguide](https://hoereforeningen.dk/media/1367/hoereforeningen_designguide.pdf) ejer identiteten; ældre kontaktoplysninger fra guiden genbruges ikke.
- Beskriv hvilke interesser og driftsdata der gemmes, hvorfor, hvor længe og hvordan de slettes. Giv brugeren kontrol over præferencer, eventabonnementer og konto; indhent nødvendigt samtykke før lagring af følsomme interessevalg.
- Implementér `delete_account`: deaktivér levering, fjern præferencer, tilmeldinger og abonnementshemmeligheder, og håndtér eventuelle auditreferencer uden at bevare unødvendig identitet. Beskyt ejeren mod utilsigtet tab af sidste ejerkonto.
- Sæt input-/resultatgrænser og ratebegrænsning, som fungerer på tværs af Worker-instanser. Log ingen komplette tool-inputs eller webhookbodies. Sundhedstjek må ikke eksponere persondata.
- Fastlæg backup-/gendannelsesmuligheder for D1 i den faktiske Sites-platform, og afprøv gendannelse med testdata. Dokumentér nøgleskift, fejlede leveringer og opdatering af indhold.
- Klargør udgiveroplysninger, logo, beskrivelser, eksempelsamtaler, permissions og revieweradgang med syntetiske data. Verificér den accepterede reviewvej for Sites/OpenAI-login; indfør ingen produktions-bypass til reviewer.

**Færdig når:** Reviewmateriale, offentlige sider, sletning og driftsvejledning svarer til den faktiske implementering. Indholdet er informationsformidling med kilder, ikke personlig diagnosticering.

Et lokalt [metadata- og reviewudkast](../../../../release/README.md) indeholder de planlagte fem positive og tre negative indsendelsescases. Det erstatter ikke faktisk hostgennemgang, revieweradgang, ikonmateriale eller en komplet MCP-pakke.

Anders' bestillinger den 24. oktober 2026 fastlægger installationsforsiden og den minimale, brandtilpassede webdel. [OpenAI's indsendelsesvejledning](https://developers.openai.com/plugins/deploy/submission) og [pluginretningslinjer](https://developers.openai.com/plugins/plugin-guidelines) ejer de aktuelle reviewkrav, herunder publiceret privatlivspolitik og oplysninger til faktisk afprøvning. Et minimalt site garanterer ingen godkendelse. Orkestratoren kontrollerer gældende krav og normale reviewerindgange før indsendelse.
