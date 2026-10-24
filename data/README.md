# Kildeudsnit til lokal vidensimport

`knowledge.json` indeholder korte, selvstændige resuméer af et afgrænset udsnit af Høreforeningens offentlige hjemmeside. Hver kilde blev hentet over HTTPS og læst ved den angivne `verifiedAt`-dato. Datoen angiver kildegennemgang, ikke medicinsk godkendelse. Resuméerne erstatter ikke individuel faglig vurdering. Der importeres ingen konkrete arrangementer eller medlemskonti fra hjemmesiden.

Importér efter første lokal opstart, som opretter `.local/auth.json`:

```sh
npx tsx scripts/import-knowledge.ts --verify-sources
```

Importen bruger den lokale ejers identitet og samme validering, adgangskontrol, versionskontrol og publiceringsfunktioner som administrationen. Kildedata er kun importinput; opslag læser fra databasen. `--verify-sources` kontrollerer aktuelle HTTPS-svar, men genlæser eller omskriver ikke resuméer og ændrer ikke deres kontroldato.

Standardkørslen opretter kun manglende slugs. Eksisterende poster, inklusive administratorændringer og kladder, bevares. Gennemgå ændringer før en udtrykkelig opdatering af bestemte poster:

```sh
npx tsx scripts/import-knowledge.ts --refresh tinnitus,hoeretab --verify-sources
```

`--refresh` erstatter indhold, kilder, relationer, forælder og eventuelt udløb for de angivne slugs med inputfilens værdier og publicerer dem. Der findes intet implicit “opdater alle”. Optimistisk versionskontrol afviser ændringer, som en anden administrator når at gemme under kørslen. En afbrudt import kan have efterladt kladder; de overskrives ikke automatisk ved genkørsel. Gennemgå dem og vælg konkrete slugs ved genoptagelse.

Alternative lokale stier vælges med `--database`, `--auth` og `--input`; databasens overmappe skal findes. Auth-filen skal indeholde et eksplicit `ownerSubject`. Identitetsnøgler udskrives ikke og må ikke versionsstyres. Det lokale importværktøj er ikke en Sites-/D1-deploymentvej eller automatisk crawler.
