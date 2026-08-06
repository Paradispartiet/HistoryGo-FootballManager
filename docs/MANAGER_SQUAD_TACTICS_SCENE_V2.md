# Manager Squad & Tactics Scene v2

Denne leveransen gjør **Lag** til managerens samlede sportslige arbeidsrom. Den bygger ingen ny laguttaks-, taktikk-, rolle-, tilgjengelighets-, form- eller ratingmotor.

## Scenens rekkefølge

```text
Lagstatus
→ startellever
→ taktisk identitet
→ problemområde
→ benk og dekning
→ Trening eller Kamp
```

Kommandonivået viser fire operative statuser:

1. **Startellever** – statusen fra den eksisterende 11-spillerporten.
2. **Formasjon og kampplan** – de valgte verdiene fra dagens taktikkflate og den eksisterende rolle-/feilbruksstatusen.
3. **Tilgjengelighet** – eksisterende skade-, slitasje- og troppssignaler.
4. **Benk og dekning** – statusen fra den eksisterende 4-spillerporten.

## Autoritative kilder

- `football-team-fit-engine.js` eier spiller-/rollefit, lagbalanse, relasjoner, styrker og problemer.
- `football-matchday-readiness.js` eier kampklarhet og blokkeringer.
- dagens availability-, form- og troppsdata eier skade, slitasje og tilgjengelighet.
- formasjon-, kampplan- og rolledataene eier de taktiske valgene.
- dagens uttaks-, benke- og kampklarhetsflater rendrer autoritativ status til DOM.
- `manager-squad-tactics-scene-v2.js` leser disse ferdigrendrede statusene og eier bare scenehierarki, managerspråk og navigasjon.

Presentasjonslaget har ingen egen laguttakslogikk, ingen `localStorage`, ingen ratingberegning og ingen parallell kampklarhetsmotor.

## Interaksjon

Statuskortene fører direkte til eksisterende flater:

- startelleveren og banen;
- formasjon og kampplan;
- benken og tilgjengeligheten;
- den eksisterende første laghandlingen når laget er blokkert;
- Trening når den gjenstående kampforberedelsen ligger der;
- Kamp når laget kan tas videre til kampdag.

Taktikkbrettet forblir scenens visuelle sentrum. Spillerkort, direkte spiller-/rollevalg, drag-and-drop, benk og full motoranalyse beholdes under kommandonivået.

## Testkontrakt

- ren simulering verifiserer ufullstendig ellever, manglende benk, rolleproblem, manglende trening og kampklart lag;
- audit krever presentasjonslag, permanent styling, dokumenterte motorgrenser, lineup-wiring og CI-porter;
- Playwright kontrollerer kommandonivå, fire klikkbare statuser, eksisterende taktikkbrett, mobil overflow og WCAG 2 A/AA;
- eksisterende laguttaks-, rollefit-, kampklarhets-, trenings- og kampdagstester skal fortsatt bestå.
