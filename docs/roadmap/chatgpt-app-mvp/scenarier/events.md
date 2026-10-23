---
type: "Plan Scenarios"
title: "Få besked om et nyt relevant foredrag"
description: "Et udtrykkeligt abonnement giver besked med lukket samtale og mulighed for efterfølgende tilmelding."
status: "draft"
plan: "chatgpt-app-mvp"
role: "scenarios"
---
# Få besked om et nyt relevant foredrag

Sara bruger en ChatGPT-oplevelse, hvor MCP Events er understøttet. Hun vil høre om nye onlineforedrag om høreproblemer og vælger sine interesser gennem appen.

1. Sara gemmer emner, geografisk område og fysisk/online. Hun kan se, hvilke kriterier der er valgt. Dette opretter ikke i sig selv et ChatGPT-abonnement.
2. Hun beder ChatGPT: »Giv mig besked, når der kommer nye foredrag, der passer til mine interesser.« ChatGPT opretter eventabonnementet med sin callback. En fejlet verifikation skal give et forståeligt udfald uden et falsk aktivt abonnement.
3. Sara lukker samtalen. En administrator publicerer et matchende foredrag. ChatGPT modtager eventet og kan give beskeden »Der er et nyt foredrag, som kunne være relevant for dig« uden at kræve et nyt spørgsmål fra Sara.
4. Hun åbner beskeden og ser aktuelle foredragsdetaljer i MCP App. Først når hun klikker »Tilmeld« eller beder om det i chat, oprettes tilmeldingen.
5. Et foredrag uden match giver ingen besked. Ved en kortvarig leveringsfejl genoptages køen uden en åben brugersession; genforsøg bruger samme event-id. Et aflyst foredrag eller et ophørt abonnement må ikke fortsætte med ventende leveringer.
6. Sara ændrer interesser eller stopper overvågningen gennem ChatGPT. Fremtidige leveringer følger de aktuelle præferencer og abonnementsstatus, også efter servergenstart.

[Eventkontrakten](../kontrakter/events.md) beskriver matching og genoptagelse; [platformafprøvningen](../kontrakter/platform.md) ejer verificering af faktisk hostunderstøttelse. Forløbet er en forventning, ikke et kørselsresultat.
