# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig første prototype for fotballmanager-delen av History Go / Civication.

Prosjektet skal bygge en fotballfaglig manager der trenerens forståelse er viktigere enn rå rating. Det er ikke et vanlig samlekortspill der spilleren bare finner bedre og bedre kort.

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

## Hva første versjon gjør

Første MVP tester bare én ting:

> Velg spiller → velg posisjon → velg rolle → velg taktikk → se om treneren bruker spilleren riktig.

Denne prototypen har ikke full kampmotor, liga, tabell, tropp, startellever, benk eller sesong. Første mål er å bevise at rollefit-motoren fungerer.

## Nåværende filstruktur

```txt
index.html
style.css
README.md
src/
  app.js
  football-fit-engine.js
data/
  football_players.json
  football_roles.json
  football_tactics.json
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

## Fit-motor

Fit-motoren ligger i:

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

## Hvordan score skal forstås

`matchScore` er ikke en objektiv sannhet om spilleren. Det er en vurdering av hvordan treneren bruker spilleren i akkurat denne rollen, posisjonen og taktikken.

En høy score betyr:

- posisjonen passer
- rollen passer
- taktikken passer
- spillerens behov blir møtt
- treneren legger til rette for foretrukne situasjoner

En lav score betyr:

- spilleren brukes på feil sted
- rollen skjuler styrkene hans
- taktikken treffer misliker-punkter
- spilleren får ikke nok av situasjonene han trenger
- treneren gjør en strukturell feil

## Eksempel: riktig bruk

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

## Eksempel: feil bruk

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

## Appflyt

`src/app.js` gjør dette:

1. laster JSON-data med `fetch`
2. fyller select-feltene
3. setter første spiller/rolle/taktikk
4. lytter på brukerens valg
5. sender valgt kombinasjon til fit-motoren
6. viser score, status, forklaring, advarsler og bedre roller

`index.html` inneholder bare første demo-UI. Det skal ikke inneholde hardkodet spillerdata.

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
- Nye tagger bør enten være bevisst nye eller gjenbrukes på tvers av spiller/rolle/taktikk.

### Motor

- `overall` skal aldri alene avgjøre resultatet.
- Feil rolle/posisjon skal gi tydelig utslag.
- Forklaringsteksten skal ikke antyde at spilleren er dårlig.
- Feilbruk skal beskrives som trenerfeil.
- Dribler som spiss skal fortsatt gi tydelig advarsel.

### UI

- Appen skal ikke hardkode spillerdata.
- Endring i JSON skal kunne vises uten endring i app-logikken.
- Kontrollene skal fungere på mobil/iPad.
- Resultatet skal vise forklaring, ikke bare tall.

## Bevisste avgrensninger i denne versjonen

Følgende er ikke bygget ennå:

- full startellever
- benk
- troppskrav på 15 spillere
- samlet lagfit
- relasjoner mellom spillere
- kampmotor
- kamprapport
- ukekamp
- liga
- sesong
- tabell
- History Go-unlocks
- historiske personer
- lisensierte spillernavn
- ekte klubbdata

Dette er bevisst. Først må grunnmotoren for rollefit bli riktig.

## Neste utviklingsrekkefølge

Anbefalt videre rekkefølge:

1. Utvid fra én-spiller-test til full startellever.
2. Lag `football_formations.json` med posisjonsslots.
3. Lag samlet lagfit basert på elleve spillere.
4. Legg inn enkle relasjoner mellom roller.
5. Legg inn benk og troppskrav på 15 spillere.
6. Lag enkel ukekamp uten live-kampmotor.
7. Lag kamprapport som forklarer trenerens valg.
8. Lag liga og sesong.
9. Koble spillere og taktiske tradisjoner til History Go-steder.
10. Legg inn historiske tidstråder.

## Fremtidige datasett

Mulige senere filer:

```txt
data/
  football_formations.json
  football_team_state.json
  football_relationships.json
  football_match_events.json
  football_leagues.json
  football_unlocks.json
  football_timeline_threads.json
```

Mulige senere JS-filer:

```txt
src/
  football-lineup-engine.js
  football-team-fit-engine.js
  football-match-sim.js
  football-report-engine.js
  football-storage.js
```

## Fast regel for videre arbeid

Ikke bygg nye lag på en måte som gjør prosjektet til et vanlig rating-spill.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
