# Spillerliste og spillerprofil v1

## Formål

Lag skal kjennes som et fotballmanagerarbeidsrom, ikke som et dashboard med mange like kort.

Dette passet låser ett tydelig skille:

- **Spillerliste = sammenligne mange spillere.**
- **Spillerprofil = forstå én spiller.**
- **Oppstilling = endre laget eksplisitt.**

Ingen ny motor, kalender eller «Neste»-funksjon innføres. `Forslag til neste steg` er fortsatt spillets eneste progresjonsveiviser.

## Research-retning

Sports Interactive beskriver FM26-grensesnittet med prinsippene **Efficiency, Familiarity, Predictability** og sier at oversikter skal gjøre nøkkelinformasjon raskt tilgjengelig, mens mer detaljert informasjon ligger dypere. FM26 Touch reduserer samtidig mengden informasjon per skjerm på mindre flater. Det er den strukturelle ideen vi bruker her.

Kilder:

- Football Manager: *FM26's Reimagined User Interface* — https://www.footballmanager.com/fm26/features/fm26s-reimagined-user-interface
- Football Manager: *FM26 Touch: New Features Revealed* — https://www.footballmanager.com/fm26/features/fm26-touch-new-features-revealed
- PC Gamer, FM26 review — https://www.pcgamer.com/games/sports/football-manager-26-review/
- GameSpot, FM26 review — https://www.gamespot.com/reviews/football-manager-26-review/1900-6418439/

Kritikken av FM26 er også relevant: flere anmeldelser peker på informasjon som blir begravet og flere klikk enn nødvendig. HG kopierer derfor ikke et tile-/popup-lag for hver datakilde. Vi bruker FM-strukturen, men holder hovedflaten tettere.

## Lag-simplification

Den tidligere `manager-squad-tactics-scene-v2` la fire store statuskort, «Viktigste problemområde» og en egen handlingsknapp foran taktikkarbeidet. Importen av denne scenen er fjernet fra runtime.

Lag viser i stedet én kompakt statuslinje:

`Tropp · Ellever · Benk · tilgjengelighet · formasjon`

Den er **informasjon**, ikke navigasjon. Kampklar-gaten brukes fortsatt av eksisterende logikk, men det store gatepanelet skjules i presentasjonen. Kampmotor, readiness-regler og lagring røres ikke.

## Lag → Tropp

`Tropp` viser den faktisk valgte klubbtroppen først. Hele spillerpoolen åpnes eksplisitt med `Endre tropp`. Desktop viser en tett tabell med:

- spiller
- naturlige posisjoner
- foretrukket/innarbeidet rolle
- tilgjengelighet
- kvalitativ taktikk-fit
- form
- kamper
- mål
- målgivende
- individuell trening

Over listen ligger kun arbeidsverktøyene som trengs for listen: søk, posisjon, tilgjengelighet og sortering.

Det finnes ingen Overall-kolonne. `classHeight` brukes bare av eksisterende data-/starttropp-logikk og eksponeres ikke som spillerverdi i UI-et.

## Spillerprofil

Klikk på spillerens navn åpner en egen profil uten å endre laguttaket.

Profilen består av:

1. **Identitet og posisjonskart** — naturlige, brukbare og dårlige posisjonsfit vises på en liten grønn bane.
2. **Aktuelle roller** — foretrukne roller og eksisterende rollefortrolighet.
3. **Ferdighetsprofil** — eksisterende 1–20-ferdigheter gruppert som Teknisk, Mental, Taktisk og Fysisk. Ingen ny samlescore beregnes.
4. **Akkurat nå** — kampklarhet, form, taktikk-fit og individuell trening.
5. **Styrker / trenger rundt seg / misbruksvarsel** — eksisterende spillerdata.
6. **Sesong / Trening / Historikk** — kamper, minutter, mål, målgivende, individuell oppfølging, History Go-opprinnelse og taktikkpreferanser.

## Oppstilling: profil er ikke handling

Den gamle direkte spillerknappen gjorde både identitet og laguttak til samme treffmål.

V1 deler dette i to:

- spillerens **navn/profil** åpner spillerprofilen;
- en separat **Velg / Sett inn**-knapp endrer laget.

Dermed kan manageren undersøke en kandidat uten risiko for å gjøre et laguttak ved et profilklikk.

## Mobil

Mobilversjonen bruker ikke en horisontal monstertabell. Tabellen brytes ned til kompakte spillerrader med navn, posisjon, status og `K · M · A`. Rollen, fit og trening ligger i fullprofilen der plassen er bedre brukt.

Spillerprofilen blir fullskjerm på små flater og stabler bane, ferdigheter og status vertikalt.

## Autoritative eksisterende kilder

UI-laget leser eksisterende kilder og beregner ingen ny fotballrating:

- `data/football_players.json`
- `data/football_unlocks.json`
- `data/football_roles.json`
- `data/football_attributes.json`
- `data/football_individual_training.json`
- `hgfm.playerSeasonStats.v1`
- `hgfm.playerCondition.v1`
- `hgfm.teamMerits.v1` (`roleFamiliarity`)
- `hgfm.individualTraining.v1`
- eksisterende History Go-stedsprogresjon

Ferdighetsverdiene kommer fra den eksisterende `football-player-attributes.js`-motoren. Condition og rollefortrolighet leses gjennom de eksisterende rene motorene.

## Ikke del av v1

- kalender / manageruke som nytt navigasjonslag
- ny Next-/Fortsett-funksjon
- ny spiller-, fit-, condition- eller kampmotor
- oppdiktet alder, lønn eller kontrakt
- Overall-rating
- nye lagringsformater
