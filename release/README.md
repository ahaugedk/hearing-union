# Udkast til offentlig pluginpakke

Dette er redaktionelt reviewmateriale, **ikke en uploadklar pakke**. Intet er indsendt, godkendt eller publiceret. `plugin.json` følger Agent Plugins-formatets metadata og placerer OpenAI-felter under `extensions.com.openai`. Det er ikke et Sites-hostingmanifest.

Udgiver er angivet som Luffe Hansen efter produktejerens oplysninger. Support er Høreforeningen, `mail@hoereforeningen.dk`, Blekinge Boulevard 2, 2630 Taastrup. Adressen og kontaktvejen er kildekontrolleret på [foreningens kontaktside](https://hoereforeningen.dk/kontakt-os). Disse oplysninger dokumenterer ikke juridisk mandat, verificeret udgiveridentitet eller accepterede vilkår.

Listingens fire HTTPS-adresser bruger det eksisterende Site som planlagt base. Det anonyme Site-kald har svaret 401; ingen af undersidernes hostede indhold eller revieweradgang er derfor verificeret. Lokale informationssider er udviklingstekster, ikke godkendte produktionsvilkår.

## Før pakken kan uploades og indsendes

- Verificér Sites-kildekodekobling, D1, serverafledt stabil identitet, login og adgangsisolering. Udfyld derefter en rigtig `mcp.json` med den verificerede HTTPS-MCP-adresse og authkonfiguration. Filen er bevidst udeladt her: et beskyttet endpoint må ikke deklareres som uden auth, og der indsættes ingen fiktive credentials. Serveren skal være med ved første MCP-pluginupload; en senere konvertering fra skills-only understøttes ikke.
- Bekræft udgiverens organisations-/projektadgang og individuelle eller erhvervsmæssige verifikation i portalen. Vælg den faktiske kategori fra dashboardets tilladte kategorier; feltet er udeladt frem for at gætte. Fastlæg eventuelle landebegrænsninger særskilt.
- Afprøv reviewerens normale hostede loginvej. Den officielle portal understøtter OAuth, ingen auth eller mixed adgang; Sites-loginets samlede kompatibilitet skal demonstreres. Gennemfør domænechallenge på den præcise adresse og med den præcise token fra portalen. Opret ingen token på forhånd.
- Forbered syntetisk reviewdata: to adskilte brugerkonti, en administrator med særskilt adgang, en reviewpost og fremtidige foredrag med matchende/ikke-matchende filtre. Indtast reviewercredentials og private logininstruktioner **kun i dashboardets sikre Review details**, aldrig i pakken. Login skal virke uden menneskelig MFA-godkendelse, engangskoder, magic links eller privat netværksadgang.
- Kør samtlige fem positive og tre negative cases i manifestet gennem den faktiske ChatGPT-forbindelse. Cases er forventet adfærd, ikke allerede beståede hosttests. Eventcasen kræver understøttet Work/Cloud-host, faktisk modtagelse i inaktiv chat og en vedvarende retry-trigger. Kontroller begge MCP Apps visuelt på desktop og mobil samt efter tilbagekaldt rolle.
- Optag en reel, reviewer-tilgængelig gennemgang og udfyld `review.demo_recording_url`. Der er ingen eksempelvideo, dummy-URL eller opdigtede screenshots i udkastet. Tilføj kun faktiske screenshots efter gennemgangen.
- Gennemgå offentlige formåls-, support-, privatlivs- og vilkårssider, datalivscyklus, nøglehåndtering og D1-backup/restore. Bekræft at listingens fire URL’er er tilgængelige som tilsigtet. Endelige juridiske vilkår og ansvar skal være fastlagt før udgivelse.
- Udfyld den faktiske pakkelicens; ingen licens er antaget i manifestet. Pak alle refererede filer korrekt, løs portalfund og indsend først derefter til review. Godkendelse og efterfølgende publicering er særskilte trin.

## Officielt logo som kildemateriale

`../assets/hoereforeningen-source-logo.svg` er hentet uændret over HTTPS den 23. oktober 2026 fra hjemmesidens [officielle logo-URL](https://hoereforeningen.dk/sites/hoereforeningen.dk/themes/novus/logo.svg). SVG’en indeholder lokale vektorformer og ingen scripts eller eksterne billedreferencer. Licens og ret til distribution i en offentlig pluginpakke er ikke fastlagt; tilstedeværelsen er ingen godkendelse af brugen.

Originalens dimensioner er 300 × 47. Den opfylder ikke indsendelsens krav om et kvadratisk ikon på mindst 48 × 48. Den er derfor ikke deklareret som `logo` eller `composerIcon`. Der er ikke tegnet ny branding, omformet et logo eller fabrikeret en mørk variant. Tilføj et kvadratisk appikon, før obligatoriske ikonfelter udfyldes.

## Officielt formatgrundlag

- [Offentlig indsendelse og Agent Plugins-manifest](https://developers.openai.com/plugins/deploy/submission): metadata, feltgrænser, præcis fem positive og tre negative cases, sikker revieweradgang og ikonkrav.
- [Agent Plugins-schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json): deklareret format; denne leverance er et ufuldstændigt indsendelsesudkast, ikke dokumentation for portalvalidering.
- [MCP Events](https://developers.openai.com/plugins/build/mcp-events): understøttede hosts, abonnementer, signeret webhooklevering og callbackverifikation.
