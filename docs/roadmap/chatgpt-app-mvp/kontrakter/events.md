---
type: "Plan Implementation"
title: "Præferencer og varig eventlevering"
description: "Abonnementer, matching, outbox, sikker webhooklevering og genoptagelse."
status: "draft"
plan: "chatgpt-app-mvp"
role: "implementation"
---
# Præferencer og varig eventlevering

Fase 5 i [implementeringen](../implementering.md). Følg [visionens scope](../vision.md) og [eventscenariet](../scenarier/events.md). [Fundamentet](fundament.md) ejer datamodellen; [foredrag](foredrag.md) ejer publicering og tilmelding.

Præferencer er eksplicit valgte interesser, ikke registrerede diagnoser. Gem emner, regioner og fysisk/online. Tom emneliste betyder alle emner; tom regionsliste betyder alle regioner. Onlineforedrag er ikke geografisk begrænset. Vis de valgte kriterier, før brugeren opretter sit abonnement.

Definér eventet `lecture.relevant_published` i `contracts/events.ts`. Eventpayload indeholder foredrags-id/version og en kort beskrivelse; alle aktuelle detaljer og tilmeldingsstatus hentes gennem `lecture_get`. Eventet er data, ikke instruktioner til modellen.

Implementér følgende flow:

1. `events/subscribe` binder det protokoloprettede abonnement til den autentificerede konto. Brugeren skal udtrykkeligt bede ChatGPT om at abonnere; et almindeligt `update_preferences` opretter ikke et ChatGPT-abonnement.
2. Validér filtre og callback, gennemfør protokollens challenge, og gem først et aktivt abonnement efter succes. Afled deterministisk abonnementsidentitet, så gentagelser og fornyelse opdaterer samme række.
3. Publicering af et nyt foredrag skriver foredrag og `outbox_events` atomisk. En eksplicit genpublicering kan oprette en ny hændelse; almindelige kladder og tilmeldinger gør ikke.
4. Match hændelsen mod aktive abonnementer og aktuelle præferencer. Opret højst én leveringsrække per event/abonnement. Match kun hændelser fra abonnementets aktive periode; ingen automatisk udsendelse af historiske foredrag.
5. En begrænset leveringsfunktion låser ventende rækker, genkontrollerer konto, abonnement, præferencer og foredragsstatus og sender en signeret webhook. Stop levering af aflyste eller ikke længere relevante foredrag.
6. Registrér succes eller planlæg genforsøg med stigende ventetid. Bevar event-id ved genforsøg. Låse udløber efter procesfejl; permanente fejl synliggøres for administratoren uden hemmelige data.
7. `events/unsubscribe` stopper nye leveringer idempotent. Fornyelse og nøgleskift følger protokollen; udløbne abonnementer sender ikke. Kontosletning deaktiverer abonnementer og ventende leveringer.

Brug Worker-kompatibel Standard Webhooks-signering. Krypter abonnementsnøgler i databasen med en deploymenthemmelighed; læg aldrig hemmeligheder i kildekode, logs eller modelresultater. Callbackbeskyttelse skal blokere private destinationer og redirects på både verifikation og levering. Verificér den nødvendige netværkskontrol i [platformafprøvningen](platform.md); en URL-regex alene er utilstrækkelig.

Første levering forsøges efter commit via den verificerede Worker-mekanisme. Varige genforsøg drives af den ubemandede mekanisme fra [platformafprøvningen](platform.md), fx en Sites-tilknyttet cloud-opgave, der kalder `POST /internal/deliveries/drain` med særskilt serviceautorisation. Det kræver hverken en åben chat eller redeployment. In-memory timere og `waitUntil` alene er ikke en varig kø. Den faktisk mulige retrykadence dokumenteres før lancering.

ChatGPT skal efter modtaget event kunne fortælle om foredraget, vise MCP App og udføre en udtrykkelig tilmelding. Modtagelse af event er aldrig i sig selv samtykke til foredragstilmelding. Test, at hændelsen kan behandles, mens den oprindelige chat er inaktiv.

**Færdig når:** Relevante nye foredrag udløser en faktisk besked i en understøttet ChatGPT-oplevelse, irrelevante foredrag ikke gør, og genforsøg, afmelding og genstart ikke skaber nye logiske hændelser eller taber køen. Beskriv leveringen som mindst én gang; netværksfejl kan give gentaget webhooklevering med samme event-id.
