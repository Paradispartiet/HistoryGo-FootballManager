# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig managerprototype koblet til History Go / Civication.

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Dette er ikke et vanlig ratingspill. `overall` beskriver klasse, ikke automatisk kampverdi. En spiller med lavere `overall` kan prestere bedre enn en høyere rated spiller dersom han brukes i riktigere posisjon, rolle, taktikk og relasjonelt mønster.

## Status 30.06.2026

Prosjektet har mange virkende motorer, men README og UI har blitt for mye feature-logg og for lite spillkart. Denne README-en er derfor gjort om til en **spillbar flow-kontrakt**: hva spilleren skal gjøre, hvilke systemer som eier hvilke deler av flyten, og hvor dead ends oppstår.

Det som finnes nå:

1. **Managerkontor / startellever** – formasjon, taktikk, spillere, roller og grønn taktikkbane.
2. **Individuell fitmotor** – vurderer posisjon, rolle, taktikk og feilbruk.
3. **Lagfitmotor** – vurderer balanse, bredde, dybde, oppbygging, press, restforsvar, relasjoner, badges og duplikater.
4. **Relasjonsmotor** – forklarer hvilke roller som hjelper eller blokkerer hverandre.
5. **History Go-unlocks** – steder gir spillere, stab, ekspertise, treningsprogrammer, badges og formasjoner.
6. **Lokal/offentlig start** – kan gi en spillbar starttropp uten å skrive til ekte History Go-progresjon.
7. **Stab, ekspertise og trening** – staff og ekspertise påvirker treningsprogrammer og læringsstøtte.
8. **Off-pitch Parameters** – slitasje, moral, garderobe, press, styre/media og taktisk klarhet.
9. **Innboks / klubbuke** – levende tråder, svarvalg, kontekstsignaler og klubbverdier.
10. **Kampdag** – historiske motstanderarketyper, managergrep og forklarende kamprapport.
11. **Scenarioer / prøveperiode** – fem kamper oppå Club Week når spilleren aktivt velger en scenario-utfordring, ikke som standard ligastart.
12. **Role Familiarity** – spillere bygger rollefortrolighet ved riktig bruk over kamper.
13. **Historisk formasjonsbibliotek** – `data/hgFootball/` med epoker, systemer, rolletyper og kunnskapslag.

Dette er fortsatt ikke et ferdig Football Manager-spill. Full ligadybde, overgangsmarked, økonomi, kontrakter, kalender, fasilitetsutbygging og lang sesong gjenstår. V0.1 må først bli lett å spille gjennom, men produktregelen er allerede fast: HG Football Manager skal starte som Football Manager, ikke som en taktisk historieleksjon.

## Spillmoduser

### Ligaspill

Hovedmodusen i HG Football Manager. Spilleren tar over en klubb og spiller en tradisjonell sesong med tropp, trening, terminliste, tabell, innboks og kampdag. Ligaspill er primærvalget fra start, og første handling skal alltid peke mot spillbar tropp, startellever, trening eller neste ligakamp.

### Scenarioer

Valgfrie korte utfordringer basert på historiske lag, taktiske ideer eller bestemte læringsmål. Eksempel: Ajax 1971–73 / totalfotball. Scenarioer kan bruke eksisterende femkampers prøveperiode, styreoppdrag og læringslogikk, men de skal startes aktivt fra Scenarioer-valget.

### Treningsrom

Lavrisiko-modus for å forstå formasjoner, roller og taktiske prinsipper uten at det påvirker ligasesongen.

Standard start skal alltid være ligaspill eller valg av spillmodus. Et scenario skal aldri være hardkodet som første obligatoriske handling.

## Spillbar hovedvei

Spilleren skal ikke måtte forstå hele arkitekturen for å komme til første kamp. Den første spillbare løkken skal være:

```txt
Oversikt
  ↓
Skaff spillbar tropp
  ↓
Lag & taktikk
  ↓
Innboks
  ↓
Trening
  ↓
Kampplan / kampforberedelse
  ↓
Kamp
  ↓
Kamprapport
  ↓
Neste uke
```

### 1. Oversikt eier starten

Spilleren skal starte i **Oversikt**. Øverst skal **Neste handling** fortelle nøyaktig hva som må gjøres nå. De andre kortene i Oversikt kan forklare hvorfor, men de skal ikke konkurrere med Neste handling.

Regel:

```txt
Neste handling eier veien videre.
Club Week eier fase/status.
Innboks eier kontekst og historikk.
History Go eier tilgang.
Kamp eier kamp og rapport.
```

### 2. Første krav er spillbar tropp

Før spilleren sendes inn i prøveperiode, kamp eller avanserte valg, må spillet sikre at manageren faktisk har en spillbar tropp.

Kravet i v0.1 er:

```txt
15 opplåste spillere totalt
= 11 startere + minst 4 benkespillere
```

Hvis spilleren ikke har nok spillere, skal primærhandlingen være én av disse:

- **Bruk History Go-samlingen min**
- **Velg offentlig startsted**
- **Finn nærmeste spillere**
- **Samle flere spillere**

Spilleren skal ikke få beskjed om å starte prøveperiode før spillerpoolen er reell.

### 3. Lag & taktikk fyller laget

Når 15-spillerkravet er mulig å oppfylle, skal spilleren gå til **Lag & taktikk**:

1. Velg eller behold formasjon.
2. Fyll 11 plasser.
3. Velg roller.
4. Rett feilbruk og duplikater.
5. Sjekk at benken har minst 4 spillere.

Dette er kjernen i spillet: treneren forstår spilleren gjennom posisjon, rolle, taktikk og relasjon.

### 4. Innboks gir signaler før trening

Når laget er kampklart, skal spilleren lese de relevante signalene fra klubben før treningen låses inn. Innboksen er ikke “mail som bare ligger der”; den er klubbens signalapparat.

Innboksen skal forklare:

- hva assistenttreneren ser taktisk
- hva fysio/medisinsk apparat ser av slitasje og risiko
- hva garderoben signaliserer
- hva styret og presse presser på med
- hva scouting/History Go peker mot

I første uke bør innboksen gi ett tydelig signal før kamp, ikke mange likeverdige tråder.

### 5. Trening velges etter signalene

Når spilleren har sett klubbens signaler, skal han velge:

- ett ukentlig treningsfokus
- ett treningsprogram / ukeprogram

Forslagene skal være trygge standardvalg, men ikke fasit. Et bevisst kontekstuelt valg kan være bedre enn standardforslaget.

### 6. Kamp og rapport avslutter uka

Kampfanen skal:

1. forklare om laget er kampklart
2. vise motstander og kampbrief
3. la spilleren ta managergrep
4. vise resultat
5. forklare hvorfor resultatet skjedde
6. gi ett tydelig råd for neste uke

Etter rapporten skal Neste handling peke til neste fase eller neste uke.

## Hvorfor spillet oppleves rotete

Rotet skyldes ikke én enkelt motorfeil. Det skyldes at flere riktige systemer er synlige samtidig uten en hard spillbar rekkefølge.

### Dead end 1: default-state gir ikke spillere

`football_team_merits.example.json` starter med `kfum_arena` som opplåst sted. I `football_unlocks.json` er KFUM Arena bevisst definert som trener-/kompetansekilde, ikke spillerkilde. Stedet låser opp trenere, ekspertise og treningsmodell, men ingen `player_candidate`.

Samtidig sier availability-logikken at spillerlisten bare kommer fra konkrete `player_candidate`-unlocks på opplåste steder eller lokal start. Den faller aldri tilbake til alle spillere.

Konsekvens:

```txt
Ny spiller → KFUM Arena → 0 spillere → 15-spillerkravet feiler → kamp låses
```

Dette er riktig datalogikk, men feil førsteopplevelse. Førsteopplevelsen må sende spilleren til lokal/offentlig start eller et sted som faktisk gir nok spillere.

### Dead end 2: First-Time Playthrough antar for mye

`sim:first-time` tester Next Action-stigen med en idealisert mock der `roster.enoughUnlocked` og `roster.enoughBench` allerede er `true`. Den tester derfor ikke den virkelige første lasten fra seed-data.

Konsekvens:

```txt
Test grønn → faktisk ny spiller kan likevel stå uten spillere
```

Det trengs en egen real-seed-sim som laster seed/unlocks og forventer at første primærhandling er startmodus/spillerpool før prøveperiode.

### Dead end 3: Neste handling kan starte prøveperiode før spillerpool

First-Time-prioriteringen i `football-next-action.js` kan gi **Start femkampers prøveperiode** før den generelle roster-gatingen får stoppe flyten. Etterpå kan spilleren bli sendt til **Fullfør startellever**, men da finnes det kanskje ingen spillere å velge.

Riktig regel:

```txt
Ikke mini-season før availability.rosterReadiness.hasEnoughUnlocked === true.
```

Hvis `unlockedPlayers < 15`, skal Neste handling alltid peke til History Go/startmodus.

### Dead end 4: uferdige avdelinger ligger i hovednavigasjonen

Fasiliteter, Administrasjon, Marked og Styret ligger som primære faner, men flere kort sier i praksis «kommer senere», «ikke koblet på ennå», «ingen data ennå» eller «ikke bygget ennå».

Disse fanene gir riktig managerkontor-følelse, men i v0.1 fungerer de som dead ends hvis de ser like viktige ut som Lag, Trening, Innboks og Kamp.

Regel for v0.1:

```txt
Primærnav = bare spillbar løkke.
Uferdige avdelinger = sekundært, låst, foldet eller tydelig merket «kommer senere».
```

### Dead end 5: for mange «hva nå?»-flater

Oversikt har Neste handling, Managerinnsikt, Foreslåtte oppsett, Kontekst, Neste beslutninger, Mini Season og snarveier. Hver av dem kan være nyttig, men samlet lager de støy.

Regel:

```txt
Én primærhandling.
Maks to sekundære handlinger.
Alt annet er forklaring eller status.
```

## Navigasjonskontrakt for v0.1

### Primærflyt

Disse flatene er del av spillbar hovedvei:

1. **Oversikt** – start, status, Neste handling.
2. **History Go** – tilgang, samling, startmodus, lokal/offentlig start.
3. **Lag & taktikk** – formasjon, startellever, roller, benk.
4. **Innboks** – relevante signaler og valg.
5. **Trening** – treningsfokus og treningsprogram.
6. **Kamp** – kampbrief, kamp, rapport.

### Sekundær/fremtidig flyt

Disse skal ikke være blokkere i v0.1:

- Fasiliteter
- Administrasjon
- Marked
- Styret
- Full sesong/liga
- Økonomi
- Kontrakter
- Overgangsmarked
- Kalender

De kan være synlige som miljø/managerkontor, men de må merkes som **ikke del av første spillbare løkke** til de faktisk har interaksjon.

## Umiddelbar ryddeplan

### 1. Fiks første handling

Når spillet starter, bygg Next Action-konteksten fra faktisk availability:

```txt
if unlockedPlayers < 15:
  primary = "Skaff spillbar tropp"
  action = History Go / startmodus
else if miniSeason not started:
  primary = "Start prøveperiode"
```

### 2. Fiks First-Time-testen

Legg til en test/sim som bruker ekte seed-data:

```txt
npm run sim:first-run-real-seed
```

Den bør feile hvis første handling blir prøveperiode før spillerpoolen er klar.

Minimumssjekker:

- seed med bare KFUM Arena gir ikke kampklar tropp
- primærhandling peker til startmodus / History Go
- offentlig start eller lokal start kan gi inntil 15 spillere
- etter 15 spillere kan flyten gå videre til Lag & taktikk
- etter 11 + 4 kan flyten gå til Innboks / Trening / Kamp

### 3. Rydd primærnavigasjonen

For v0.1 bør synlig hovedløype være:

```txt
Oversikt · Lag & taktikk · Innboks · Trening · Kamp · History Go
```

Fasiliteter, Admin, Marked, Styret og Formasjoner bør enten:

- ligge i en sekundær «Kontor»-skuff
- være låst/merket «kommer senere»
- eller foldes inn som forklaringskort til de faktisk påvirker spillet

### 4. Rydd dashboardet

Oversikt bør prioriteres slik:

1. Neste handling
2. Hvorfor denne handlingen?
3. Status for tropp/uke/kamp
4. Sekundære detaljer foldet under

Ikke vis flere likeverdige «neste»-systemer samtidig.

### 5. Skjul teknisk dybde til spilleren ber om den

Kampforklaring, formation knowledge, staff identity, role familiarity og off-pitch er verdifulle. Men førsteuka skal bare vise det som hjelper spilleren til neste beslutning. Resten må ligge i `<details>` eller «Vis mer».


## First Playthrough QA status (v1)

QA-gjennomgangen av første spilløkt er verifisert gjennom seed- og sim-testene. Hovedveien er nå:

```txt
Oversikt
  ↓
Skaff spillbar tropp
  ↓
History Go / startmodus
  ↓
Lag & taktikk
  ↓
Innboks
  ↓
Trening
  ↓
Kamp
  ↓
Kamprapport
  ↓
Neste uke
```

Verifisert status:

- Ny spiller med repository-seed havner ikke i prøveperiode før 15 spillere.
- Repository-seeden (`kfum_arena`) gir 0 spillere og peker primærhandlingen til History Go/startmodus.
- Når 15 spillere er tilgjengelige, peker flyten til Lag & taktikk.
- Når 11 startere + 4 benk er klart, peker førsteuka til Innboks før Trening.
- Etter innboks og treningsvalg peker flyten til Kamp.
- Etter kamp peker flyten til Kamprapport.
- Etter lest rapport peker flyten til neste uke.
- Primærnavigasjonen holder spillbar løkke adskilt fra kontor-/senere-flater, og primærhandlingene peker ikke til future-flater.

Kjørte QA-kommandoer:

```txt
npm run check:dom-ids
npm run audit:flow
npm run sim:first-run-real-seed
npm run sim:first-time
npm run sim:manager-flow-ui
npm run sim:mini-season
npm run sim:matchday
```

## Viktige filer

```txt
index.html
style.css
README.md

src/
  app.js
  football-next-action.js
  football-fit-engine.js
  football-team-fit-engine.js
  football-relationship-engine.js
  football-off-pitch-parameters.js
  football-inbox-events.js
  football-matchday-engine.js
  football-match-explanation-engine.js
  football-mini-season.js
  football-role-familiarity-engine.js
  football-training-program-compositions.js
  hg-formation-library.js

data/
  football_players.json
  football_unlocks.json
  football_place_locations.json
  football_staff.json
  football_expertise.json
  football_training_programs.json
  football_training_badges.json
  football_team_merits.example.json
  club_inbox_threads.json
  club_inbox_senders.json
  club_inbox_messages/
  club_inbox_choices/
  club_inbox_replies/
  hgFootball/

scripts/
  audit-flow.mjs
  simulate-first-time-playthrough.mjs
  simulate-manager-flow-ui.mjs
  simulate-mini-season.mjs
  simulate-matchday-v02.mjs
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

## Kvalitetssjekk

Kjør relevante kontroller før nye endringer:

```bash
npm run typecheck
npm run build
npm run check:dom-ids
npm run audit:flow
npm run sim:first-time
npm run sim:manager-flow-ui
npm run sim:mini-season
npm run sim:matchday
```

Viktig: `audit:flow` er en strukturell wiring-audit. Den beviser at id-er, handlere og motorimporter finnes, men den beviser ikke at en ny spiller faktisk finner veien fra første skjerm til første kamp. Det må dekkes av en real-seed first-run-sim og manuell spilltest.

## Fast regel for videre arbeid

Ikke bygg flere likeverdige paneler før hovedveien er spillbar.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
