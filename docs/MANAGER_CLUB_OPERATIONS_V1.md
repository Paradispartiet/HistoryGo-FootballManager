# Manager Club Operations v1

## Formål

Klubb/Mer skal være et faktisk arbeidsområde for hele klubbapparatet, ikke bare en styreoversikt med skjulte avdelinger.

Denne versjonen gjør de eksisterende flatene **Fasiliteter** og **Marked** navigerbare sammen med Klubboversikt, Speiding, Klubbutvikling og Stab & drift.

## Autoritative kilder

Ingen ny klubbmotor introduseres. Presentasjonen leser bare eksisterende tilstand:

- `clubWeekState.boardTrust`
- `clubWeekState.playerMorale`
- `clubWeekState.tacticalClarity`
- `clubWeekState.trainingCulture`
- `clubWeekState.mediaPressure`
- eksisterende roster-readiness og tilgjengelige spillere
- eksisterende engasjert/tilgjengelig stab
- eksisterende History Go-steder, ekspertise, utviklingsprogrammer, badges og lagklasse

De eksisterende rendererne i `app.js` fortsetter å eie innholdet i Fasiliteter, Stab & drift og Marked. `manager-club-presentation.js` eier bare klubboversikt, navigasjonsinnganger og kvalitative statussignaler.

## Seks klubbområder

1. **Styret** — forventning og styretillit.
2. **Speiding** — spillere, stab og ressurser fra History Go.
3. **Klubbutvikling** — ekspertise, utviklingsprogrammer, badges og lagklasse.
4. **Stab & drift** — stall, tilgjengelig stab og engasjert stab.
5. **Fasiliteter** — eksisterende kvalitativ stand på treningsanlegg, stadion, akademi og medisinsk avdeling.
6. **Marked** — eksisterende kvalitative signaler for omdømme, fans og sponsorinteresse.

## Viktige grenser

- Fasilitetsnivåene er fortsatt avledede lesesignaler. Det finnes ingen kjøp-/oppgraderingsmotor i denne versjonen.
- Marked viser temperatur og interesse, men oppretter ingen sponsoravtaler.
- Stab & drift viser eksisterende stab og stall, men oppretter ingen økonomi-, lønns- eller kontraktsmotor.
- Ingen nye localStorage-nøkler, save-felt eller History Go-unlocks.
- Ingen endringer i kamp-, trening-, liga-, availability- eller konsekvensmotorer.

## Navigasjon

Når Klubbkontoret rendres, sikrer presentasjonslaget at Fasiliteter og Marked finnes i den eksisterende Klubb-undernavigasjonen. De to legacy-markørene `data-shell-hidden` fjernes bare fra disse allerede eksisterende seksjonene. Navigasjonen bruker den samme `onOpenTarget`-callbacken som de øvrige klubbstatusene.

Dermed finnes det ingen blindvei fra de nye statuskortene: begge åpner en eksisterende, live-renderet flate og hovedfanen Klubb forblir aktiv via `data-tab-parent="board"`.

## Permanente porter

- `audit:manager-club-operations-v1`
- `sim:manager-club-operations-v1`
- nettleservakt for seks statuser, undernavigasjon, klikkflyt, mobil overflow og WCAG A/AA
