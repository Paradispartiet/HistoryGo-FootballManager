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
6. **Lokal starttropp** – valgfri startmodus der manageren kan begynne med de 15 nærmeste kvalifiserte spillerne uten å markere stedene som samlet i History Go.
7. **Innboks / klubbuke** – trådbasert innboks, svarvalg og klubbverdier.
8. **Stab, ekspertise og trening** – staff og ekspertise åpner treningsprogrammer og badgeprogresjon.
9. **Lagidentitet** – lagklasser basert på opptjente badges og utviklingsretning.
10. **Stedsrapporter** – forklarer hva sportsteder gir manageren.
11. **Historisk formasjonsbibliotek** – egen `data/hgFootball/`-modul med historiske epoker, formasjoner, rolletyper og unlock-regler.

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
  football_place_locations.json
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

docs/
  local-start-squad.md

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

## Lokal starttropp

HG Football Manager skal også støtte et valgfritt startvalg der brukeren kan begynne med de 15 kvalifiserte fotballspillerne som er geografisk nærmest nåværende lokasjon eller valgt offentlig startsted.

Dette er en startsnarvei, ikke en erstatning for History Go-samlingen. Spillere fra lokal start skal kunne brukes i managerdelen og telle mot 15-spillerkravet, men stedene deres skal ikke automatisk markeres som samlet eller besøkt i History Go.

Prinsippet er:

```txt
local_start = spillbar starttropp
visited_place = ekte History Go-samling
```

Den tekniske planen ligger i:

```txt
docs/local-start-squad.md
```

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

## HG Football Manager som læringsspill

> **Designretning.** Denne seksjonen beskriver hva spillet skal være, ikke hva som er ferdig bygget. Mye av poeng-, forslags- og kontekstlogikken under er foreløpig **arkitekturkrav og retning**, ikke implementert motor. Den eksisterende fitmotoren, relasjonsmotoren, lagfitmotoren og det historiske formasjonsbiblioteket er grunnmuren dette skal bygges videre på.

HG Football Manager skal ikke bare være et manager-spill. Det skal være et **læringsspill om fotball** – en spillbar fotballskole om taktikk, trening, formasjoner og kontekstuell managerforståelse.

Grunnprinsippet:

> Forslagene viser hva som normalt er riktig.
> Dokumentasjonen forklarer hvorfor.
> Egne valg lar spilleren gå forbi standardløsningen når spilleren forstår konteksten bedre.

### 1. Spillets pedagogiske kjerne

Spilleren skal lære:

- hvorfor en formasjon passer eller ikke passer
- hvorfor en treningsuke bør settes sammen på en bestemt måte
- hvordan motstanderens styrker og svakheter påvirker egne valg
- hvordan taktiske parametre står mot hverandre
- hvorfor ingen taktikk er perfekt i alle situasjoner
- hvordan kontekstuelle managergrep kan slå taktisk sterkere lag

Spillet skal lære spilleren å se *hva som er riktig*, ikke bare gi et fasitsvar. Derfor finnes forslagene – og derfor finnes muligheter utover forslagene.

### 2. Forslag ved alle store valg

Alle større valg skal ha **foreslåtte setups**. Dette gjelder blant annet:

- formasjon
- kampplan
- treningsprogram
- rollevalg
- spillerutvikling
- restitusjon/skadeforebygging
- defensiv struktur
- offensiv struktur
- overgangsstrategi
- stab/fasiliteter/administrasjon når dette bygges ut

Prinsipp: spilleren skal aldri bare møte et tomt valg. Spillet skal alltid gi noen faglig logiske forslag. Spilleren kan velge et forslag, se variasjoner, eller lage egen løsning.

### 3. Treningsprogrammer som sammensatte setups

Treningsprogrammet skal bygges rundt presenterte programsammensetninger, for eksempel:

- balansert uke
- kampforberedende uke
- restitusjonsuke
- skadeforebyggende uke
- defensiv struktur
- offensiv samhandling
- press og gjenvinning
- teknisk utvikling
- individuell spissutvikling
- ungdomsutvikling
- taktisk innkjøring

Hver programsammensetning skal kunne ha **variasjoner** – f.eks. normal belastning, høy intensitet, lav belastning, kamp om tre dager, skadeforebyggende variant, ungdomsvennlig variant, variant mot sterk motstander, variant etter svak kamp, variant etter tett kampprogram. Spilleren skal også kunne lage og lagre egne programsammensetninger.

### 4. Poeng etter relevante parametre, ikke universelt riktige valg

Spillet skal **ikke** gi poeng for at et valg er «bra» isolert sett. Et valg gir uttelling når det treffer riktig kontekst – riktig mengde, riktig tidspunkt.

Eksempler:

- Restitusjon gir poeng når laget har høy slitasje, tett kampprogram eller økt skaderisiko. Restitusjon *hele tiden* gir ikke poeng, fordi laget da mister utvikling, intensitet og kampform.
- Skadeforebyggende trening gir uttelling når belastningsindikatorer tilsier risiko – overbrukt blir den passiv.
- Defensiv struktur gir uttelling før kamper mot klart sterkere lag.
- Press- og gjenvinningstrening gir uttelling når kampplanen faktisk bygger på høyt press.
- Avslutningstrening gir ekstra uttelling hvis den kobles til konkrete bommer fra forrige kamp. Trener du spissen på akkurat den avslutningstypen han bommet på sist, og han scorer på en lignende sjanse neste kamp, skal det kunne gi managerpoeng.

> HG Football Manager skal ikke belønne perfekte valg.
> Det skal belønne **relevante** valg.

Slik kobles trening til faktisk kampdata, og blir årsak–virkning i stedet for menyvalg.

### 5. Forslagene kjenner taktikken, men ikke alt utenfor banen

Det går et bevisst skille mellom **taktisk anbefalt setup** og **kontekstuell managerforståelse**.

De foreslåtte valgene skal være gode etter taktiske parametre: spillertyper, formasjon, motstander, kampplan, struktur, styrkeforhold, taktisk risiko. Men forslagene skal **ikke** vite alt, og skal ikke alltid gi maksimal uttelling. De bør ikke fullt ut fange:

- skjult slitasje
- dårlig moral
- lav selvtillit
- familie-/mediepress
- uro rundt en spiller
- dårlig relasjon mellom spillere
- usynlig formsvikt
- behov for ro, trygghet eller individuell oppfølging

Det er nettopp her spilleren kan slå et taktisk bedre lag: ved å lese situasjonen bedre enn standardsystemet.

### 6. Taktiske fallgruver

Ingen taktikk er perfekt mot alt:

- Høyt press kan fungere mot svakt oppspill, men feile mot raske bakromsspillere.
- Høy backlinje kan gi kontroll, men åpner rom bak for direkte lag.
- Lav blokk kan beskytte mot bedre lag, men gjøre eget lag passivt mot svake lag.
- Ballbesittelse kan gi kontroll, men bli farlig mot aggressivt press.
- Brede backer kan gi overtall, men åpne kontringsrom.
- Mannorientert press kan gi trykk, men brytes av rotasjoner og tredjemannsløp.
- Smal midtbane kan gi sentral kontroll, men være sårbar mot sideskift.

> Det riktige spørsmålet er ikke «hva er best?»
> Det riktige spørsmålet er «hva er riktig nå?»

### 7. Formation Knowledge Engine

Alle formasjoner bør ha **to lag**.

**A. Spillbart datalag** (brukes av motoren). Eksempler på felter:

`id`, `name`, `era`, `baseShape`, `inPossessionShape`, `outOfPossessionShape`, `pressShape`, `strengths`, `weaknesses`, `requiredConditions`, `strongAgainst`, `weakAgainst`, `tacticalRisks`, `trainingLinks`, `playerRoleRequirements`, `parameterProfile`.

Dette utvider den eksisterende `data/hgFootball/`-modulen, som allerede beskriver formasjoner som historiske systemer med faseformasjoner (se *Historisk formasjonsbibliotek* over).

**B. Dokumentasjonslag** (brukes som lærings- og analysegrunnlag). Hver formasjon bør ha en dyp dokumentasjonsfil, foreslått under `docs/formations/`, f.eks. `modern_433.md`, `wm_3223.md`, `brazil_424.md`, `catenaccio_libero.md`, `conte_343.md`. Hver fil bør forklare:

- historisk bakgrunn
- taktisk idé
- styrker og svakheter
- nødvendige rammebetingelser
- hvilke spillertyper som kreves
- hvilke motstandere formasjonen fungerer mot, og hvilke den sliter mot
- vanlige fallgruver
- relevante treningsprogrammer
- parameterkollisjoner mot andre taktikker
- eksempler på historiske eller moderne lag

Foreslått filstruktur (designretning, ikke ferdig):

```txt
data/hgFootball/formations/
  formations.json
  formation_matchups.json
  formation_parameters.json
  formation_training_links.json
docs/hgFootball/formations/
  235_pyramid.md
  wm_3223.md
  metodo_2323.md
  brazil_424.md
  catenaccio_libero.md
  modern_433.md
  modern_4231.md
  conte_343.md
  positional_325.md
```

### 8. Parameterlogikk mellom taktikker

Taktikker skal vurderes mot hverandre gjennom parametre. Hver parameter har en motparameter:

| Parameter | Motparameter |
| --- | --- |
| høyt press | direkte spill bak press |
| høy backlinje | bakromstrussel |
| lav blokk | tålmodig posisjonsspill |
| bredde | smal kompakt blokk |
| ballbesittelse | aggressivt press / bruddstyrke |
| mannorientering | rotasjoner / tredjemannsløp |
| mange spillere foran ball | kontringsrisiko |
| smal midtbane | sideskift / overlapp |
| høyt tempo | teknisk feilrate |
| hard belastning | slitasje / skaderisiko |
| relasjonell samhandling | stadige rolle-/formasjonsendringer |

### 9. Samlende designregel

> HG Football Manager skal lære spilleren taktisk korrekt standardforståelse gjennom forslag, men belønne dypere managerforståelse når spilleren gjør relevante kontekstuelle valg som forslagssystemet ikke fullt ut kan se.

Og kortere:

> Foreslåtte setups gir trygg taktisk kvalitet.
> Egne, kontekstuelle justeringer gir managerpoeng og muligheten til å slå sterkere lag.

Dette må alltid leses sammen med kjerneprinsippet: *alle spillere er gode nok – spørsmålet er om treneren forstår dem.* Læringslaget handler om å bygge den forståelsen hos spilleren.

## Kvalitetssjekk før nye endringer

### Data

- Alle JSON-filer må være gyldig JSON.
- Alle spillerroller må peke på eksisterende rolle-id-er.
- Alle spillere bør ligge i 85–100-prinsippet.
- Nye spiller-unlocks må peke på ekte spiller-id-er, ikke arketype-id-er.
- Steder som ikke skal gi spillere, for eksempel KFUM Arena/Bislett i nåværende dataregler, må ikke få player-unlocks.
- Nye tagger bør gjenbrukes på tvers av spiller/rolle/taktikk der det er mulig.
- Lokal starttropp må ikke skrive til `visited_places` eller `hg_groundhopper_stats_v1`.
- Lokal starttropp må ikke hardkode spillerdata eller koordinater i `app.js`.

### Motor

- `overall` skal aldri alene avgjøre resultatet.
- Feil rolle/posisjon skal gi tydelig utslag.
- Feilbruk skal beskrives som trenerfeil, ikke spillerfeil.
- Lagfit skal ikke bare være gjennomsnitt av enkeltspillere.
- Relasjoner skal forklare hvorfor roller støtter eller blokkerer hverandre.
- Badges skal nudge, ikke dominere.
- Lokal starttropp skal integreres i `computeAvailability()`, ikke i en parallell unlock-motor.

### UI

- Appen skal ikke hardkode spillerdata.
- Banen og managerkontoret skal være lesbart på iPad.
- Nye data skal helst kunne vises uten å bygge om app-logikken.
- Relasjonsdata vises foreløpig via lagrapporten; egen UI-metrikk kan legges til senere.
- Lokal starttropp skal vises som `Lokal starttropp`, ikke som et samlet sted.

## Ikke ferdig ennå

Følgende gjenstår som større spill-lag:

- implementere lokal starttropp i runtime etter `docs/local-start-squad.md`
- motstanderprofiler
- kampmotor
- kamprapport etter kamp
- ukekamp
- liga
- sesong
- tabell
- full kobling mellom historisk formasjonsbibliotek og aktiv kampmotor

## Neste anbefalte utviklingsrekkefølge

1. Implementer lokal starttropp i `computeAvailability()` uten å skrive til History Go-progresjon.
2. Test managerkontoret i nettleser/iPad etter relasjonsmotoren.
3. Legg relasjonsscore inn som egen synlig metrikk i UI.
4. Lag motstanderprofiler.
5. Lag tekstbasert ukekamp.
6. Lag kamprapport som forklarer trenerens valg.
7. Koble historiske formasjoner fra `data/hgFootball/` dypere inn i aktiv lagfit/kampmotor.
8. Lag liga og sesong.

## Fast regel for videre arbeid

Ikke bygg nye lag på en måte som gjør prosjektet til et vanlig rating-spill.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
