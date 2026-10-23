---
type: "Architecture Principle"
title: "Databevaring efter v1"
description: "Modelskift efter produktions-v1 bevarer data og gældende garantier."
status: "stable"
---
# Databevaring efter v1

Efter første produktions-v1 bevarer modelskift produktionsdata og nødvendig historik. Drop/re-create med tab eller et produktreset er ingen migrationsstrategi. Relevante adgangs-, sletnings- og referencegarantier består gennem et skift.

Den konkrete leverance beskriver omformning, aktivering, fejl og genoptagelse samt den mindste kontrol af bevaring, som ændringens risiko kræver. En migrering genudfører ikke forretningshandlinger eller eksterne effekter. Den konkrete mekanik følger projektets datamodel; kildeprojektets mekanik overføres ikke.

Før v1 gælder [modelændringsreglen](../arbejdsregler/levering/modelaendringer.md). Produktfasen har ét hjem i [projektprofilen](../drift/projektprofil.md).
