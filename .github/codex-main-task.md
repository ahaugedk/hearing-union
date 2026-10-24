@codex Kontrollér koordineringen efter push til main-commit {{MAIN_COMMIT}} i ahaugedk/hearing-union.

Start en ny Cloud-task med denne PR som kommunikationspunkt. PR'en kan allerede være merged: dens gamle head er ikke arbejdets udgangspunkt. Hent origin/main, kontrollér at {{MAIN_COMMIT}} er en del af main, og brug nyeste main på en ny arbejdsgren. Hvis en nyere koordineringstask allerede ejer samme arbejde, skriv kort status og undlad dobbeltarbejde.

Læs AGENTS.md, docs/drift/sites-udgivelse.md, .openai/deployment-handoff.json og de relevante GitHub-tilbagemeldinger fra Sites-udgiveren. Reagér på konkrete implementerings- eller deploymentblokeringer inden for det dokumenterede mandat. Ændr ikke produktvalg eller adgangspolitik, og påbegynd ikke nye features alene på grund af dette koordineringstjek. Hvis der ikke er noget at rette, skriv et kort resultat i denne PR uden en kodecommit.

Hvis en konkret rettelse er nødvendig, implementér og validér den og åbn en ny PR. Ved en Sites-leverance skal den deployerbare kodecommit og den sidste, separate ready-handoff-commit følge udgivelseskontrakten; PR-titlen skal begynde med [sites-deploy]. Push eller merge ikke direkte til main. Sites-udgiveren ejer publicering og livekontrol; ingen Cloudflare-nøgle, konto-id, fysisk D1-id, ekstern OAuth/OIDC eller særlig Sites-token skal efterspørges.

Hvis GitHub-integrationen ikke kan starte en Cloud-task fra denne botkommentar, rapportér den konkrete begrænsning i PR'en. En afsendt kommentar er ikke i sig selv bevis for, at tasken kører. Opret ingen genudløsningssløjfe eller dummyjob.
