---
type: Documentation Contract
title: Validering ved hver dokumentopdatering
description: Agenten vurderer betydning og struktur og retter uhensigtsmæssig organisering.
status: stable
---
# Validering ved hver dokumentopdatering

Ved hver samlet dokumentopdatering vurderer agenten indhold og struktur, også når kun et afsnit ændres. Agenten opdager og retter selv strukturelle problemer som del af opgaven; den eksisterende placering er ingen begrundelse for at bevare dem.

1. Find udsagnets hjem; læs berørte blade, søskende, indeks og nødvendige naboemner. Erstat afløst tekst og fjern dubletter. Bevar gyldige forbehold og forskellen mellem regel og implementering. Fjern bogholderi: leverings- og bevisafsnit, hashes, tællinger og logbøger. Fjern udviklingshistorik efter [emneautoriteten](autoritet.md); fold betydningen ud, hvis den ellers kræver kendskab til en plan eller tidligere beslutning.
2. Vurdér om navne, emnegrænser og opdeling hjælper agenten med at finde svaret. Misvisende navne, uklart ejerskab, blandede ansvar, konkurrerende hjem for samme spørgsmål og vanskelig indeksprosa er signaler om en forkert struktur. Omdøb, flyt, del eller flet efter behov; fjern tomme/dekorative mellemled. Ret den berørte sammenhæng med bevaret betydning, frem for blot at tilføje tekst til det nærmeste dokument. Balance følger ansvar og læsebehov, aldrig faste antal, længder eller ens dybde.
3. Ret indeksprosa, navigation og indgående links efter [forfatningsreglerne](forfatning.md). Læs indekset uden at følge links: giver det et forståeligt overblik uden at samle bladenes detaljer igen? Er sammenhængen svær at forklare kort, genvurdér strukturen i trin 2. Alle direkte børn skal linkes i prosaen. Læs de ændrede emner uden chat, kontrollér bevaret betydning, og kør dokumentkontrollen fra projektroden med python3 scripts/check_okf.py for metadata, links og ankre.

Strukturkontrollen kan ikke afgøre redundans, relevans eller balance. Den semantiske gennemgang og nødvendige omstrukturering er agentens ansvar; ingen automatisk produkttest/reset/audit følger med.
