# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig prototype for fotballmanager-delen av History Go / Civication.

Prosjektet skal bygge en fotballfaglig manager der trenerens forståelse er viktigere enn rå rating. Dette er ikke et vanlig samlekortspill der spilleren bare finner bedre og bedre kort.

## Kjerneidé

Dette prosjektet bygger på én grunnregel:

> Alle spillere er klassespillere. Trenerens bruk av dem avgjør.

Alle spillere skal i utgangspunktet ligge mellom 85 og 100 i `overall`. Det finnes ikke dårlige funn. En spiller med 86 i `overall` kan prestere bedre enn en spiller med 99 dersom han brukes i riktigere rolle, posisjon, taktikk og relasjonelt mønster.

`overall` betyr klasse. Det er ikke fasit for kampverdi.

Spillet skal derfor spørre:

- Hva slags spiller er dette?
- Hvilke rom trenger han?
- Hvilken rolle får frem styrkene hans?
- Hvilken taktikk passer spillerens fotballtype?
- Hvilke medspillere gjør ham bedre?
- Hvilke trenerfeil skjuler kvaliteten hans?

## Hva denne versjonen gjør

Denne versjonen har gått fra én-spiller-test til startellever-test.

Appen lar deg nå:

1. velge formasjon
2. velge taktikk
3. fylle elleve posisjonsslots
4. velge spiller per slot
5. velge rolle per slot
6. se individuell spillerfit for valgt plass
7. se samlet lagfit
8. lese en enkel lagrapport med styrker og problemer

Dette er fortsatt ikke full kampmotor, liga, tabell, tropp, benk eller sesong. Målet med denne versjonen er å teste om en hel ellever henger sammen taktisk.

## Nåværende filstruktur

```txt
index.html
style.css
README.md
src/
  app.js
  football-fit-engine.js
  football-team-fit-engine.js
data/
  football_players.json
  football_roles.json
  football_tactics.json
  football_formations.json
```

## Kjøring

Prosjektet er foreløpig et statisk HTML/CSS/JS-prosjekt uten framework og uten build-system.

Direkte åpning av `index.html` kan feile i enkelte nettlesere fordi appen laster JSON-filer med `fetch`. Bruk derfor GitHub Pages eller en enkel lokal server.

Eksempel lokalt:

```bash
python3 -m http.server 8000
```

Åpne deretter:

```txt
http://localhost:8000
```

## Designprinsipper

### 1. Ingen dårlige spillere

Spilleren skal ikke samle seg opp fra svake spillere til sterke spillere. Alle funn er klassespillere. Forskjellen ligger i spillerens type, ikke i om han er brukbar eller ubrukelig.

### 2. Rating er sekundært

`overall` skal ikke dominere kampverdien. Det skal være en liten klassebonus. Rolle, posisjon, taktikk og feilbruk skal veie mer.

### 3. Trenerfeil skal være synlige

Hvis en driblende kantspiller brukes som møtende spiss, skal appen forklare at spilleren mister bredde, 1v1-situasjoner og rom til å utfordre. Det betyr ikke at spilleren er dårlig. Det betyr at treneren bruker ham feil.

### 4. Forklaring er like viktig som tall

Spillet skal ikke bare vise `72`. Det skal forklare hvorfor spilleren får 72, hva som fungerer, hva som ikke fungerer, og hvilke roller som passer bedre.

### 5. Posisjon og rolle er ikke det samme

En spiller kan stå i LW, men rollen kan være bred dribler, innoverkant eller fri offensiv skaper. Motoren må derfor vurdere både posisjon og rolle.

### 6. Laget er mer enn summen av spillerne

Samlet lagfit skal ikke bare være gjennomsnitt av elleve spillere. Laget må også vurderes for balanse, bredde, dybde, oppbygging, press og restforsvar.

## Datakontrakt

### `data/football_players.json`

Spillerdata ligger under toppfeltet `players`.

Hver spiller skal ha:

```json
{
  "id": "wide_dribbler_left",
  "name": "Driblende venstrekant",
  "overall": 91,
  "naturalPositions": ["LW"],
  "usablePositions": ["RW", "AM"],
  "poorFits": ["ST", "DM", "CB"],
  "archetypes": ["dribbler", "wide_creator", "one_vs_one"],
  "strengths": ["dribbling", "acceleration", "isolation", "chance_creation"],
  "needs": ["wide_space", "one_vs_one", "overlapping_fullback", "quick_switches"],
  "preferredRoles": ["wide_dribbler", "inverted_winger", "free_creator"],
  "likesTactics": ["wide_attack", "fast_transitions", "creative_freedom", "isolate_wingers"],
  "dislikesTactics": ["back_to_goal_striker", "static_crossing", "narrow_low_tempo", "central_target_play"],
  "warningWhenMisused": "Denne spilleren mister verdi hvis han brukes feilvendt, sentralt og uten rom til å utfordre."
}
```

Forklaring av feltene:

- `id`: stabil intern ID
- `name`: visningsnavn
- `overall`: klasse/nivå, normalt 85–100
- `naturalPositions`: posisjoner spilleren naturlig passer i
- `usablePositions`: posisjoner spilleren kan brukes i
- `poorFits`: posisjoner som normalt skjuler spillerens kvalitet
- `archetypes`: spillerens fotballtype
- `strengths`: konkrete ferdigheter
- `needs`: situasjoner og strukturer spilleren trenger
- `preferredRoles`: roller som passer spilleren best
- `likesTactics`: taktiske tagger som passer spilleren
- `dislikesTactics`: taktiske tagger som svekker spilleren
- `warningWhenMisused`: tekst som forklarer typisk trenerfeil

### `data/football_roles.json`

Rolledata ligger under toppfeltet `roles`.

Hver rolle skal ha:

```json
{
  "id": "wide_dribbler",
  "name": "Bred dribler",
  "positionGroup": "wing",
  "validPositions": ["LW", "RW"],
  "requires": ["dribbling", "one_vs_one", "acceleration", "wide_space", "isolation"],
  "goodWith": ["overlapping_fullback", "switches_of_play", "fast_transitions", "wide_attack"],
  "badFor": ["back_to_goal_striker", "narrow_low_tempo", "central_target_play"],
  "tacticalLikes": ["wide_attack", "fast_transitions", "isolate_wingers", "creative_freedom"],
  "tacticalDislikes": ["narrow_low_tempo", "central_target_play", "static_crossing"]
}
```

Forklaring av feltene:

- `id`: stabil intern rolle-ID
- `name`: visningsnavn
- `positionGroup`: overordnet rollegruppe
- `validPositions`: posisjoner rollen normalt kan brukes i
- `requires`: ferdigheter/situasjoner rollen krever
- `goodWith`: tagger/roller/spillmønstre som passer rollen
- `badFor`: tagger/roller/spillmønstre som svekker rollen
- `tacticalLikes`: taktiske tagger rollen liker
- `tacticalDislikes`: taktiske tagger rollen misliker

### `data/football_tactics.json`

Taktikkdata ligger under toppfeltet `tactics`.

Hver taktikk skal ha:

```json
{
  "id": "wide_fast_433",
  "name": "Bredt og hurtig 4-3-3",
  "formation": "4-3-3",
  "pressing": "high",
  "tempo": "fast",
  "width": "wide",
  "buildUp": "direct_wide",
  "chanceCreation": "isolate_wingers",
  "defensiveLine": "medium_high",
  "tags": ["wide_attack", "fast_transitions", "isolate_wingers", "high_width", "overloads", "vertical_play"]
}
```

Taktiske `tags` er det viktigste koblingsfeltet. De brukes av fit-motoren for å se om spillerens behov, rolle og taktikk peker i samme retning.

### `data/football_formations.json`

Formasjonsdata ligger under toppfeltet `formations`.

Hver formasjon skal ha nøyaktig elleve slots:

```json
{
  "id": "4-3-3",
  "name": "4-3-3",
  "description": "Balansert formasjon med tre angripere, tre midtbanespillere og naturlig bredde.",
  "slots": [
    { "slotId": "gk", "label": "Keeper", "position": "GK", "line": "keeper" },
    { "slotId": "lb", "label": "Venstreback", "position": "LB", "line": "defense" }
  ]
}
```

`line` brukes foreløpig for visuell plassering på banen:

- `keeper`
- `defense`
- `midfield`
- `attack`

## Individuell fit-motor

Individuell fit-motor ligger i:

```txt
src/football-fit-engine.js
```

Den eksporterer:

```js
FOOTBALL_POSITIONS
calculatePositionFit(player, assignment)
calculateRoleFit(player, role)
calculateTacticFit(player, tactic, role)
calculateMisusePenalty(player, assignment, role, tactic)
calculatePlayerMatchFit(player, assignment, role, tactic, roles)
```

`calculatePlayerMatchFit` returnerer:

```json
{
  "playerId": "wide_dribbler_left",
  "roleId": "wide_dribbler",
  "tacticId": "wide_fast_433",
  "position": "LW",
  "overall": 91,
  "positionFit": 96,
  "roleFit": 100,
  "tacticFit": 92,
  "misusePenalty": 0,
  "matchScore": 94,
  "status": "perfekt",
  "explanation": "...",
  "warnings": [],
  "suggestedRoles": ["Bred dribler", "Innoverkant", "Fri offensiv skaper"]
}
```

Status skal være:

- `perfekt`
- `god`
- `brukbar`
- `feilbrukt`

## Lagfit-motor

Lagfit-motoren ligger i:

```txt
src/football-team-fit-engine.js
```

Den bygger på individuell fit og legger til helhetsvurdering av laget.

`calculateTeamFit` returnerer:

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
    "duplicatePenalty": 0
  },
  "assignments": [],
  "duplicatePlayers": [],
  "report": {
    "summary": "...",
    "strengths": [],
    "issues": []
  }
}
```

Lagfit vurderer foreløpig:

- individuell fit
- rollefit
- taktisk fit
- feilbruk
- balanse
- bredde
- dybde
- oppbygging
- press
- restforsvar
- duplikatspillere

## Hvordan score skal forstås

`matchScore` er ikke en objektiv sannhet om spilleren. Det er en vurdering av hvordan treneren bruker spilleren i akkurat denne rollen, posisjonen og taktikken.

`teamScore` er ikke bare gjennomsnittet av spillerne. Det er en vurdering av om laget henger sammen som helhet.

En høy individuell score betyr:

- posisjonen passer
- rollen passer
- taktikken passer
- spillerens behov blir møtt
- treneren legger til rette for foretrukne situasjoner

En høy lagscore betyr:

- flere spillere brukes riktig
- rollene passer taktikken
- laget har balanse
- laget har nok bredde/dybde
- oppbygging og press passer spillerne
- restforsvaret tåler lagets angrepsmønster

En lav score betyr ikke at spillerne er dårlige. Det betyr at treneren har satt sammen laget feil.

## Eksempel: riktig individuell bruk

Driblende venstrekant:

- posisjon: `LW`
- rolle: `wide_dribbler`
- taktikk: `wide_fast_433`

Forventet vurdering:

- høy posisjonsfit
- høy rollefit
- høy taktisk fit
- lav eller ingen feilbruk
- status: `perfekt` eller `god`

Forklaring: spilleren får bredde, rom, 1v1-situasjoner og støtte i et system som isolerer kantspillere.

## Eksempel: feil individuell bruk

Driblende venstrekant:

- posisjon: `ST`
- rolle: `linking_striker`
- taktikk: sentral possession eller annen smal struktur

Forventet vurdering:

- lav posisjonsfit
- lavere rollefit
- høy feilbruk
- status: `feilbrukt`

Forklaring: spilleren mister bredde, 1v1-situasjoner og rom til å utfordre. Problemet er trenerens bruk, ikke spillerens kvalitet.

## Eksempel: lagproblem

Et lag kan ha mange gode enkeltspillere, men fortsatt få lavere lagfit hvis:

- begge backene går høyt uten balanserende sekser
- taktikken søker bakrom, men laget mangler bakromsløpere
- laget spiller possession uten dyp playmaker, ballspillende stopper eller sweeperkeeper
- laget spiller høyt press uten presspiss eller pressende midtbanespiller
- samme spiller brukes flere steder

## Appflyt

`src/app.js` gjør dette:

1. laster JSON-data med `fetch`
2. validerer spillere, roller, taktikker og formasjoner
3. fyller formasjon- og taktikkvalg
4. auto-fyller en startellever basert på formasjon
5. lar brukeren klikke en slot på banen
6. lar brukeren endre spiller og rolle for valgt slot
7. hindrer valg av samme spiller i flere slots via disabled player-options
8. sender hele elleveren til `calculateTeamFit`
9. viser lagscore, delmetrikker og rapport

`index.html` inneholder bare demo-UI. Det skal ikke inneholde hardkodet spillerdata.

## Kvalitetssjekk før nye endringer

Før nye endringer bør dette sjekkes:

### Data

- Alle JSON-filer må være gyldig JSON.
- Alle `player.preferredRoles` må finnes som `role.id` i `football_roles.json`.
- Alle spillere bør ha `overall` mellom 85 og 100.
- Alle spillere bør ha minst én `naturalPositions`.
- Alle spillere bør ha minst én `preferredRoles`.
- Alle roller bør ha minst én `validPositions`.
- Alle taktikker bør ha minst én `tags`.
- Alle formasjoner må ha nøyaktig 11 slots.
- Alle formasjonsslots må ha gyldig `position`.
- Nye tagger bør enten være bevisst nye eller gjenbrukes på tvers av spiller/rolle/taktikk.

### Motor

- `overall` skal aldri alene avgjøre resultatet.
- Feil rolle/posisjon skal gi tydelig utslag.
- Forklaringsteksten skal ikke antyde at spilleren er dårlig.
- Feilbruk skal beskrives som trenerfeil.
- Dribler som spiss skal fortsatt gi tydelig advarsel.
- Lagfit skal ikke bare være gjennomsnitt av enkeltspillere.
- Duplikatspillere skal oppdages og gi problem i rapporten.

### UI

- Appen skal ikke hardkode spillerdata.
- Endring i JSON skal kunne vises uten endring i app-logikken.
- Kontrollene skal fungere på mobil/iPad.
- Resultatet skal vise forklaring, ikke bare tall.
- Banen skal være lesbar også når formasjoner har ulike linjer.

## Bevisste avgrensninger i denne versjonen

Følgende er ikke bygget ennå:

- benk
- troppskrav på 15 spillere
- spillerrelasjoner som egen motor
- motstanderprofil
- kampmotor
- kamprapport etter kamp
- ukekamp
- liga
- sesong
- tabell
- History Go-unlocks
- historiske personer
- lisensierte spillernavn
- ekte klubbdata

Dette er bevisst. Først må grunnmotoren for rollefit og lagfit bli riktig.

## Neste utviklingsrekkefølge

Anbefalt videre rekkefølge:

1. Kvalitetssikre startellever-UI i nettleser/iPad.
2. Legg inn flere spillere slik at alle formasjoner kan fylles bedre.
3. Legg inn benk og troppskrav på 15 spillere.
4. Lag en tydeligere relasjonsmotor mellom roller.
5. Lag motstanderprofiler.
6. Lag enkel ukekamp uten live-kampmotor.
7. Lag kamprapport som forklarer trenerens valg.
8. Lag liga og sesong.
9. Koble spillere og taktiske tradisjoner til History Go-steder.
10. Legg inn historiske tidstråder.

## Fremtidige datasett

Mulige senere filer:

```txt
data/
  football_team_state.json
  football_relationships.json
  football_opponents.json
  football_match_events.json
  football_leagues.json
  football_unlocks.json
  football_timeline_threads.json
```

Mulige senere JS-filer:

```txt
src/
  football-lineup-engine.js
  football-relationship-engine.js
  football-opponent-engine.js
  football-match-sim.js
  football-report-engine.js
  football-storage.js
```

## Fast regel for videre arbeid

Ikke bygg nye lag på en måte som gjør prosjektet til et vanlig rating-spill.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
