---
type: "Documentation Contract"
title: "Projektets OKF v0.2-profil"
description: "Markdown og YAML-frontmatter forbinder små emner gennem almindelige relative links."
status: "stable"
---
# Projektets OKF v0.2-profil

Pakken følger [OKF v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md). Et koncept er en UTF-8 Markdown-fil med YAML-frontmatter; type er påkrævet i standarden. Denne projektprofil kræver også title, description og status. Filstien uden .md er konceptets id. Rodindekset docs/index.md erklærer okf_version: "0.2"; underindeks har ingen frontmatter.

status er dokumentstabilitet, aldrig produktgodkendelse eller leveringsbevis. Brug draft til uafklaret tekst og stable til tekst klar til brug. Konkrete godkendelser med scope, dato og reference hører i planens beslutningshjem. Planblade bruger desuden plan og role efter [de tre roller](../planer/struktur/tre-roller.md).

Relative links forbinder emner og konkrete kodeejere uden registry, dokumentkopi eller database. Alle direkte dokumenter og underindeks linkes i indeksprosaen. Læs relevante blade og nødvendige links, ikke automatisk hele korpus.

Sources bruges kun til faktisk kildestøtte for emnets betydning. Generated og verified bruges kun med kendt ophav eller faktisk kontrol, aldrig med opdigtet aktør eller dato. Pakken kræver ikke disse metadata, attestationer eller bevisregistre.

Kør python3 scripts/check_okf.py fra projektroden efter dokumentopdateringer. Det medfølgende værktøj kontrollerer denne profils enkle frontmatter med én skalar pr. linje, lokale links og ankre, indeksnavigation og planroller. Det er ikke en fuld YAML-parser, en generel OKF-certificering eller en kontrol af produktkode og prosakvalitet. Udvid kun parseren, hvis projektet får konkret brug for mere YAML. [Semantisk gennemgang](vedligeholdelse.md) er stadig nødvendig; afkort ikke betydning til et budget.
