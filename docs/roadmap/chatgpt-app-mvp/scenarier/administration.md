---
type: "Plan Scenarios"
title: "Vedligehold indhold og forstå brugen"
description: "En administrator redigerer viden og foredrag og undersøger aggregeret brug gennem ChatGPT."
status: "draft"
plan: "chatgpt-app-mvp"
role: "scenarios"
---
# Vedligehold indhold og forstå brugen

Lene er administrator, men ikke ejer. Hun vil opdatere en kildebaseret videnspost, annoncere et foredrag og se, hvilke emner der bliver brugt.

1. I ChatGPT finder hun den eksisterende post, beder om en ændring og gennemgår kladden med kilder og gyldighed. Hun publicerer den konkrete version, som derefter kan findes af almindelige brugere.
2. En anden administrator har i mellemtiden ændret samme post. Lene får en versionskonflikt og kan hente den aktuelle post; hendes ændring overskriver ikke den andens arbejde stiltiende.
3. Hun opretter et foredrag som kladde med tid, emner, format og kapacitet og publicerer det. Kladden giver ingen brugerbesked; publiceringen kan udløse relevante abonnementer.
4. Hun genfinder foredraget, ser de nødvendige deltageroplysninger og kan ændre eller aflyse arrangementet. Andre brugeres præferencer og opslagshistorik indgår ikke i deltagerlisten.
5. Lene beder om brugsstatistik for en periode. MCP App viser aggregerede opslag, emner, tilmeldingshandlinger og leveringsfejl. Hun kan ændre periode og få samme rapport gennem chat.
6. Rapporten må ikke udlede unikke brugere eller vise enkeltpersoners søgninger. Et leveret event tæller ikke som et læst event. Administrative ændringer kan ses separat i auditloggen.

[Videnskontrakten](../kontrakter/viden.md), [foredragskontrakten](../kontrakter/foredrag.md) og [statistikkontrakten](../kontrakter/statistik.md) ejer de respektive trin. Forløbet er en forventning, ikke et kørselsresultat.
