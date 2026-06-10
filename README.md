# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig managerprototype koblet til History Go / Civication. Prosjektet bygger på ett fast prinsipp:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Dette er ikke et vanlig ratingspill. `overall` beskriver klasse, ikke automatisk kampverdi. En spiller med lavere `overall` kan prestere bedre enn en høyere rated spiller dersom han brukes i riktigere posisjon, rolle, taktikk og relasjonelt mønster.

## Nåværende hovedstatus

Appen har nå flere lag:

1. **Managerkontor / startellever** – velg formasjon, taktikk, spillere og roller på banen.
2. **Individuell fitmotor** – vurderer posisjon, rolle, taktikk og feilbruk for hver spiller.
3. **Lagfitmotor** – vurderer helheten: balanse, bredde, dybde, oppbygging, press, restforsvar, relasjoner, badges og duplikatspillere.
4. **Relasjonsmotor** – vurderer om rollene hjelper eller blokkerer hverandre.
5. **History Go-unlocks** – spillere, stab, ekspertise, treningsprogrammer og badges kan knyttes til besøkte/samlede steder.
6. **Innboks / klubbuke** – trådbasert innboks, svarvalg og klubbverdier.
7. **Stab, ekspertise og trening** – staff og ekspertise åpner treningsprogrammer og badgeprogresjon.
8. **Lagidentitet** – lagklasser basert på opptjente badges og utviklingsretning.
9. **Stedsrapporter** – forklarer hva sportsteder gir manageren.
10. **Historisk formasjonsbibliotek** – egen `data/hgFootball/`-modul med historiske epoker, formasjoner, rolletyper og unlock-regler.

Dette er fortsatt ikke et ferdig spill. Kampmotor, motstanderprofiler, liga, sesong og full simulering gjenstår.

## Viktige filer

```txt
index.html
style.css
README.md

src/
  app.js
  app-manager-engine-bridge.js
  football-fit-engine.js
  football-team-fit-engine.js
  football-relationship-engine.js
  football-badge-effect-engine.js
  hg-formation-library.js

data/
  football_players.json
  football_player_archetypes.json
  football_roles.json
  football_tactics.json
  football_formations.json
  football_knowledge_principles.json
  football_unlocks.json
  football_staff.json
  football_expertise.json
  football_training_programs.json
  football_training_badges.json
  football_team_classifications.json
  football_place_reports.json
  football_team_merits.example.json
  club_inbox_threads.json
  club_inbox_senders.json
  club_inbox_messages/
  club_inbox_choices/
  hgFootball/

scripts/
  audit-hg-football-data.mjs
```

## Kjøring

Prosjektet er foreløpig en statisk HTML/CSS/JS-app uten framework.

Direkte åpning av `index.html` kan feile fordi JSON-data lastes med `fetch`. Bruk GitHub Pages eller en enkel lokal server:

```bash
python3 -m http.server 8000
```

Åpne deretter:

```txt
http://localhost:8000
```

## Designprinsipper

### 1. Ingen dårlige spillere

Spilleren skal ikke samle seg opp fra svake spillere til sterke spillere. Alle funn er klassespillere. Forskjellen ligger i type, rolle, behov og systempassform.

### 2. Rating er sekundært

`overall` skal aldri alene avgjøre resultatet. Rollefit, taktikkfit, posisjonsfit, relasjoner, lagbalanse og feilbruk skal veie tyngre.

### 3. Trenerfeil skal forklares

Hvis en dribler brukes som møtende spiss, skal systemet forklare at spilleren mister bredde, 1v1-situasjoner og rom til å utfordre. Det betyr ikke at spilleren er dårlig. Det betyr at treneren bruker ham feil.

### 4. Relasjoner er en del av taktikken

Laget skal vurderes på om rollene støtter hverandre:

- bred dribler + overlappende back / vingback
- møtende spiss / falsk nier + løp rundt seg
- dyp playmaker / regista + bakromsløper
- targetspiss + innleggskilde
- ballspillende stopper / libero + dyp playmaker
- sweeperkeeper + ballspillende forsvar
- presspiss + pressende midtbane
- fri offensiv skaper + sluttprodukt foran seg

Negative relasjoner skal også forklares:

- kant uten støtte i bred taktikk
- møtende spiss uten løp
- targetspiss uten service
- playmaker uten beskyttelse
- flere frie skapere i samme rom
- begge back-/vingback-sider høyt uten sikring
- presspiss uten ettertrykk
- linjekeeper bak høy linje

## Individuell fitmotor

Ligger i:

```txt
src/football-fit-engine.js
```

Den vurderer blant annet:

- `positionFit`
- `roleFit`
- `tacticFit`
- `misusePenalty`
- `matchScore`
- `status`
- forklaring og rolleforslag

## Lagfitmotor

Ligger i:

```txt
src/football-team-fit-engine.js
```

Den bygger på individuell fit og vurderer laget som helhet. `calculateTeamFit` returnerer blant annet:

```json
{
  "teamScore": 78,
  "completeCount": 11,
  "totalSlots": 11,
  "metrics": {
    "individualFitAverage": 80,
    "roleFitAverage": 76,
    "tacticFitAverage": 72,
    "misuseAverage": 8,
    "balanceScore": 74,
    "widthScore": 82,
    "depthScore": 69,
    "buildUpScore": 77,
    "pressScore": 61,
    "restDefenseScore": 70,
    "relationshipScore": 73,
    "duplicatePenalty": 0
  },
  "baseMetrics": {},
  "badgeEffects": {},
  "relationships": {},
  "assignments": [],
  "duplicatePlayers": [],
  "report": {
    "summary": "...",
    "strengths": [],
    "issues": []
  }
}
```

Badge-effekter legges forsiktig oppå base-metrics. Relasjoner inngår nå som egen `relationshipScore` og som egne rapportpunkter i styrker/problemer.

## Relasjonsmotor

Ligger i:

```txt
src/football-relationship-engine.js
```

Motoren vurderer om rollene i elleveren hjelper eller blokkerer hverandre. Den endrer ikke spillernes grunnkvalitet. Den vurderer trenerens struktur: får spillerne riktige medspillere rundt seg, eller blir styrkene isolert?

`calculateRoleRelationships(assignments, tactic)` returnerer:

```json
{
  "relationshipScore": 72,
  "positivePoints": 24,
  "negativePoints": 7,
  "positiveRelations": [],
  "negativeRelations": [],
  "involvedPlayers": {
    "widthCreators": [],
    "runners": [],
    "controllers": [],
    "holders": []
  }
}
```

## History Go-unlocks

Appen leser ekte History Go-progresjon fra localStorage:

```txt
visited_places
hg_groundhopper_stats_v1
```

Disse brukes til å finne besøkte/samlede sportsteder som finnes i Football Manager-unlockdata. Spillere velges ikke fritt: tilgjengelige spillere kommer fra `player_candidate`-unlocks på opplåste steder.

## Stab, ekspertise, trening og badges

Stab og ekspertise låses opp via steder og unlock-regler. Treningsprogrammer krever relevant ekspertise og riktig type ansatt stab. Badgeprogresjon kan gi små metriske bonuser til laget, for eksempel på press, restforsvar, oppbygging eller bredde.

## Innboks og klubbuke

Innboksen er trådbasert. Meldinger kan ha svarvalg. Svarvalg kan gi små effekter på Club Week-verdier som styretillit, moral, taktisk klarhet, treningskultur og medietrykk.

## Historisk formasjonsbibliotek

`data/hgFootball/` er et eget historisk datagrunnlag for HG Football Manager. Det inneholder blant annet:

- historiske formasjonsepoker
- formasjonssystemer
- rolletyper
- spiller-/rolle-fit-regler
- staff-roller
- unlock-regler

`src/hg-formation-library.js` leser dette som et eget formasjonsbibliotek i appen. Formasjoner behandles som historiske taktiske systemer, ikke bare tall.

Audit for dette datagrunnlaget:

```bash
npm run audit:hg-football
```

eller:

```bash
node scripts/audit-hg-football-data.mjs
```

## Kvalitetssjekk før nye endringer

### Data

- Alle JSON-filer må være gyldig JSON.
- Alle spillerroller må peke på eksisterende rolle-id-er.
- Alle spillere bør ligge i 85–100-prinsippet.
- Nye spiller-unlocks må peke på ekte spiller-id-er, ikke arketype-id-er.
- Steder som ikke skal gi spillere, for eksempel KFUM Arena/Bislett i nåværende dataregler, må ikke få player-unlocks.
- Nye tagger bør gjenbrukes på tvers av spiller/rolle/taktikk der det er mulig.

### Motor

- `overall` skal aldri alene avgjøre resultatet.
- Feil rolle/posisjon skal gi tydelig utslag.
- Feilbruk skal beskrives som trenerfeil, ikke spillerfeil.
- Lagfit skal ikke bare være gjennomsnitt av enkeltspillere.
- Relasjoner skal forklare hvorfor roller støtter eller blokkerer hverandre.
- Badges skal nudge, ikke dominere.

### UI

- Appen skal ikke hardkode spillerdata.
- Banen og managerkontoret skal være lesbart på iPad.
- Nye data skal helst kunne vises uten å bygge om app-logikken.
- Relasjonsdata vises foreløpig via lagrapporten; egen UI-metrikk kan legges til senere.

## Ikke ferdig ennå

Følgende gjenstår som større spill-lag:

- benk og 15-spillerkrav
- motstanderprofiler
- kampmotor
- kamprapport etter kamp
- ukekamp
- liga
- sesong
- tabell
- full kobling mellom historisk formasjonsbibliotek og aktiv kampmotor

## Neste anbefalte utviklingsrekkefølge

1. Test managerkontoret i nettleser/iPad etter relasjonsmotoren.
2. Legg relasjonsscore inn som egen synlig metrikk i UI.
3. Legg inn benk og krav om 15 opplåste spillere.
4. Lag motstanderprofiler.
5. Lag tekstbasert ukekamp.
6. Lag kamprapport som forklarer trenerens valg.
7. Koble historiske formasjoner fra `data/hgFootball/` dypere inn i aktiv lagfit/kampmotor.
8. Lag liga og sesong.

## Fast regel for videre arbeid

Ikke bygg nye lag på en måte som gjør prosjektet til et vanlig rating-spill.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
