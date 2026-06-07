# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig første prototype for fotballmanager-delen av History Go / Civication.

Dette er ikke et vanlig ratingbasert samlekortspill.

Alle spillere er klassespillere. Alle spillere skal ligge mellom 85 og 100 i overall. Ingen spillere skal være dårlige funn. Spillets kjerne er at treneren må forstå spillertypene og bruke dem riktig.

En 86-spiller brukt perfekt skal kunne prestere bedre enn en 99-spiller brukt feil.

## Grunnregel

Football Manager-delen skal bygges rundt trenerforståelse:

- riktig posisjon
- riktig rolle
- riktig taktikk
- riktig relasjon til medspillere
- riktig bruk av spillerens styrker

Overall betyr klasse, ikke fasit. Kampverdi og fit skal primært komme fra hvordan spilleren brukes.

## Første MVP

Første versjon tester bare én ting:

> Velg spiller → velg posisjon → velg rolle → velg taktikk → se om treneren bruker spilleren riktig.

Denne prototypen har ikke full kampmotor, liga, tabell eller sesong. Den skal først bevise at rollefit-motoren fungerer.

## Filstruktur

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

## Datamodell

### Spillere

Spillere har ikke bare rating. De har fotballidentitet:

- naturalPositions
- usablePositions
- poorFits
- archetypes
- strengths
- needs
- preferredRoles
- likesTactics
- dislikesTactics
- warningWhenMisused

### Roller

Roller beskriver hva spilleren faktisk gjør på banen. En LW kan for eksempel være bred dribler, innoverkant eller fri skaper. Posisjon og rolle er ikke det samme.

### Taktikk

Taktikken beskriver lagets spillestil. En spiller kan være god i én taktisk kontekst og feilbrukt i en annen.

## Fit-motor

Fit-motoren regner ut:

- positionFit
- roleFit
- tacticFit
- misusePenalty
- matchScore
- status
- explanation
- warnings
- suggestedRoles

Status skal være:

- perfekt
- god
- brukbar
- feilbrukt

## Viktig fotballfaglig prinsipp

En driblende kantspiller som brukes bredt, med rom til å utfordre og støtte fra overlappende back, skal få høy fit.

Den samme spilleren brukt som møtende spiss skal få tydelig lavere fit og forklaring:

> Spilleren mister bredde, 1v1-situasjoner og rom til å utfordre.

Dette betyr ikke at spilleren er dårlig. Det betyr at treneren bruker ham feil.

## Videre utvikling

Neste steg etter denne MVP-en:

1. full startellever
2. benk
3. samlet lagfit
4. relasjoner mellom spillere
5. enkel ukekamp
6. kamprapport
7. liga og sesong
8. History Go-unlocks
9. taktiske tidstråder
10. historiske spillere og trenere

## Lokal kjøring

Dette er et statisk prosjekt uten build-system. Det kan kjøres via GitHub Pages eller en enkel lokal server.

Direkte åpning av `index.html` kan feile i enkelte nettlesere fordi JSON-data lastes med `fetch`. Bruk derfor helst en enkel lokal server eller GitHub Pages.
