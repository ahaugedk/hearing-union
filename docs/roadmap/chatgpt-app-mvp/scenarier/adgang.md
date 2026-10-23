---
type: "Plan Scenarios"
title: "Adskil konti og delegér administration"
description: "Ejeren styrer administratoradgang, mens alle kald håndhæver bruger- og rollegrænser."
status: "draft"
plan: "chatgpt-app-mvp"
role: "scenarios"
---
# Adskil konti og delegér administration

Anders er verificeret ejer. Lene har en almindelig konto og skal kunne vedligeholde indhold. Mikkel er en anden almindelig bruger med egne præferencer og tilmeldinger.

1. Anders finder Lenes verificerede konto gennem ejerfunktionen og tildeler administratorrollen. Lene kan herefter bruge indholds- og statistikværktøjer gennem sin egen ChatGPT-forbindelse.
2. Lene forsøger at tildele en anden administrator. Serveren afviser handlingen, også hvis værktøjet kaldes direkte frem for gennem den synlige værktøjsliste.
3. Mikkel forsøger at læse Lenes personlige oplysninger eller anvende en administratorfunktion. Ingen personlige data eller privilegeret handling bliver tilgængelige ved at sende et andet bruger-id eller en rolle i input.
4. Anders fjerner Lenes administratoradgang. Næste kald fra en allerede åbnet MCP App kontrollerer rollen på ny og afviser privilegeret adgang.
5. En anonym request eller en klient med selvvalgte identitetsheaders kan ikke overtage en anden konto. Ejerskab må ikke opstå ved blot at være første besøgende.

[Fundamentet](../kontrakter/fundament.md) ejer identitet og rettigheder; [platformafprøvningen](../kontrakter/platform.md) verificerer hostingens tillidsgrænse. Forløbet er en forventning, ikke et kørselsresultat.
