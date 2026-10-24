---
type: "Operations"
title: "Codex-koordinering efter push til main"
description: "GitHub-baseret anmodning om en ny Codex Cloud-task uden en ekstra OpenAI API-nøgle."
status: "draft"
---
# Codex-koordinering efter push til main

[Codex' GitHub-integration](https://developers.openai.com/codex/integrations/github#give-codex-other-tasks) dokumenterer, at en PR-kommentar med `@codex` og en opgave starter en ny Cloud-task. Det bruger repositoryets tilknyttede Codex-integration; det genoptager ikke en eksisterende samtale og kræver ingen ekstra OpenAI API-nøgle.

Workflowet [codex-on-main.yml](../../.github/workflows/codex-on-main.yml) sender ved push til main en sådan opgave til den tilknyttede merged PR. Ved et direkte push bruges den senest opdaterede merged main-PR som kommunikationspunkt. Prompten angiver altid den præcise nye main-commit, så den gamle PR-gren ikke bruges som kilde. Manuelt workflow_dispatch på main kan bruges til afprøvning efter merge.

[Dispatch-scriptet](../../.github/scripts/codex-on-main.cjs) bruger kun workflowets normale GitHub-token til at læse main/PR'er og skrive kommentaren. Det springer forældede commits over og opretter højst én anmodning pr. main-SHA, også ved genkørsel. En kommentar eller botreaktion udløser ikke et nyt push-workflow. [Opgaveteksten](../../.github/codex-main-task.md) afgrænser arbejdet til konkret koordinering og blokeringer efter [Sites-kontrakten](sites-udgivelse.md).

## Aktivering og faktisk begrænsning

Workflowet aktiveres først ved merge til main. Repositoryet skal være forbundet til Codex, og Codex skal acceptere den identitet, som udløser omtalen. Den offentlige dokumentation etablerer PR-kommentarvejen, men garanterer ikke, at en kommentar fra `github-actions[bot]` kan starte en task på brugerens abonnement. Derfor er workflowets afsendelse kun en **anmodning**, indtil en faktisk connector-tilbagemelding eller task er set.

Efter merge køres workflowet på main. Følg kommentarlinket i Actions-summary og kontrollér Codex-connectorens svar og task-link. Hvis botten ikke kan udløse Codex, registrér begrænsningen i PR'en; udgiv ikke løsningen som en verificeret automatisk opstart. En forbundet bruger kan afprøve samme opgave manuelt som PR-kommentar gennem den dokumenterede integration. Der skal ikke kopieres personlige tokens, ChatGPT-login eller skjulte credentials ind i workflowet for at omgå begrænsningen.

Liveafprøvningen er ikke udført alene ved lokal scriptvalidering. CI og dette dispatch-workflow publicerer ikke til Sites og ændrer ikke den eksisterende deployment-handoff.
