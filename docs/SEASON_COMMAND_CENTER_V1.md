# Sesongkontroll v1

Sesongfanen skal være managerens konkurranseflate, ikke en samling tabeller.
Denne leveransen bygger derfor en egen presentasjonsmodell oppå den eksisterende
ligamotoren. Ingen konkurranse-, kamp-, statistikk-, lagrings- eller History Go-
logikk er endret.

## Informasjonshierarki

Sesongflaten viser i denne rekkefølgen:

1. **Managerens situasjon** – nivå, sesong, serierunde og aktiv status.
2. **Neste kamp** – motstander, hjemme/borte og stadion.
3. **Nøkkeltall** – plassering, poeng, målforskjell og siste form.
4. **Tabellbildet rundt egen klubb** – en kompakt tabell, ikke hele serien.
5. **Kamprytmen** – tre siste resultater og tre kommende kamper.
6. **Full dybde** – komplett tabell og terminliste bak ett eksplisitt nivå.
7. **Spillerstatistikk, sesongdom og merittliste** – videre ned på samme flate.

## Direkte handlinger

Sesongkontrollen har to tydelige veier videre:

- **Gå til kamp** åpner den eksisterende kampflaten når en aktiv kamp finnes.
- **Juster laget** åpner den eksisterende Lag-flaten.

Knappene starter ingen ny motor og muterer ingen tilstand. De er rene
navigasjonshandlinger.

## Teknisk eierskap

`src/ui/manager-season-presentation.js` eier den kvalitative presentasjonen:
kompakt tabell, form, neste kamp, resultat-/terminlister og sesongkommando.
`src/football-league-season.js` er fortsatt eneste sannhetskilde for sesongen,
terminlisten og tabellen. `src/app.js` binder disse sammen.

## Testkontrakt

- Ren simulering kontrollerer aktiv sesong, før-sesong, ferdig sesong, form,
  målforskjell, neste kamp og kompakt tabell.
- Nettlesertester kontrollerer managerhierarki, direkte kampnavigasjon,
  tabell-/terminlistedyp og mobil overflow.
- Eksisterende visuelle baseliner for Kontor, Lag, Trening og Kamp endres ikke.
