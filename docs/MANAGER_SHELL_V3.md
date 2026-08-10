# Manager Shell v3

Manager Shell v3 gjør HG Football Manager til et tydelig managerspill uten å endre motorene eller den lagrede spilltilstanden.

## Hovedstruktur

Ligaspillet har fem stabile hovedområder:

1. **Kontor** – innboks, kalender, klubbdrift og oppstartshjelp.
2. **Lag** – oppstilling, tropp, trening og systemkunnskap.
3. **Speiding** – rekrutterbare spillere og andre klubbers HG-koblede spillerpool.
4. **Kamp** – kampdag og kampanalyse.
5. **Stats** – tabell, terminliste, spillerstatistikk og sesongdom.

`Klubb` er ikke et eget hovedområde. Styret, utvikling, stab/drift, fasiliteter og marked eies av **Kontor → Klubbdrift**. Speiding er eget hovedområde fordi spillerjakt er en egen, gjentakende manageroppgave.

## Kontor og manageruka

Kontor åpner på Innboks og har fire synlige underflater:

**Innboks · Kalender · Klubbdrift · Oppstartshjelp**

Kalenderen er et tidslag over eksisterende Club Week-state, ikke en ny progresjonsmotor. Den viser den eksisterende seksfaserytmen som en vanlig uke:

- mandag: analyse og restitusjon;
- tirsdag: innboks og klubbdrift;
- onsdag: trening;
- torsdag: videre trening og individuell oppfølging;
- fredag: kampforberedelse;
- lørdag: kampdag;
- søndag: etterkamp og oppsummering.

Torsdag deler den eksisterende `training`-fasen. Kalenderen lager derfor ikke en kunstig syvende fase bare for å fylle syv ukedager.

## Autoritativ handling

`football-next-action.js` er fortsatt kilden til neste handling. Skallet viser én primær handling i den faste footeren: `Forslag til neste steg`.

Ingen hovedflate eller underflate – heller ikke Kalender eller Speiding – bygger en parallell Neste-knapp, «fortsett dag»-kontroll eller automatisk arbeidsflyt. Kalenderen viser tid; `Forslag til neste steg` leder progresjonen.

## Lag og spillerpresentasjon

Lag følger skillet:

- **Troppsliste** brukes til å sammenligne mange spillere.
- **Spillerprofil** brukes til å forstå én spiller.
- **Oppstilling** bruker bane, spiller, rolle og benk.

Spillernavnet åpner profil. Å endre startelleveren krever en eksplisitt `Velg`/`Sett inn`-handling. Det finnes ingen Overall-kolonne eller ny samlet spillerverdi.

Spillerprofilen gjenbruker eksisterende posisjoner, 1–20-ferdigheter, styrker, behov, taktiske signaler, rollefortrolighet, condition, sesongstatistikk, individuell trening og History Go-kilde.

## Speiding

Speiding har to underflater:

- **Min spillerpool** – spillere manageren har samlet gjennom eksisterende `player_candidate`-opplåsinger, klubbtilgang eller starttropp.
- **Andre klubber** – alle øvrige klubber i ligapyramiden med spillere HG-dataene knytter til klubbens `homePlaceId` via `sourcePlaceIds`.

Andre klubbers spillerlister er klubbtilknyttede/historiske HG-kandidater. De presenteres aldri som en påstått live stall. Begge underflater bruker den samme spillerprofilen som Lag.

## Trening

Trening eies av Lag. Program, ukefokus og individuell trening ligger inline i én arbeidsflate, med nøyaktig ett utvidet arbeidssteg om gangen. Den eksisterende planmotoren beholder sin rekkefølge og sine motorgrenser.

## Klubbidentitet og hierarki

Klubb-ID, navn og bane fra eksisterende klubbdata driver et generert klubbskjold, en stabil klubbfarge og en stadionlinje i headeren. Skjoldet er en presentasjonsidentitet, ikke en påstand om å være klubbens offisielle logo.

## Kampdag

Kampdag bruker hele arbeidsbredden. Den eksisterende kampmotoren beholder kampklokke, minuttlogg, managergrep, planbytter, motstanderjusteringer og innbyttere. Presentasjonslaget visualiserer kampbildet uten å beregne resultatet på nytt.

## Kodegrenser

- `src/ui/manager-shell-elements.js` eier header, footer og grunnleggende Kontor-IA.
- `src/football-manager-calendar.js` projiserer eksisterende Club Week til mandag–søndag uten egen state.
- `src/ui/manager-calendar-workspace-v1.js` eier Kalender-presentasjonen under Kontor.
- `src/ui/manager-player-workspace-v1.js` eier troppslisten og spillerprofilen.
- `src/ui/manager-scouting-workspace-v1.js` eier Speiding-presentasjonen.
- `src/ui/manager-club-identity.js` eier klubbens visuelle identitet.
- `src/ui/training-workspace-view.js` eier accordion-presentasjonen i trening.
- `src/ui/manager-shell-view.js` laster de permanente manager-workspacene.
- `src/app.js` binder eksisterende state og motorresultater til DOM-en.

Kalender v1 introduserer ingen ny uke-/fase-engine, ingen ny kalenderlagring og ingen ny progresjonshandling. Speiding v1 introduserer ingen overgangs-, kontrakts-, lønns- eller rekrutteringsmotor.

## Regresjonsvern

`tests/browser/manager-shell-v3.spec.js` låser hovedstrukturen:

**Kontor · Lag · Speiding · Kamp · Stats**

`tests/browser/manager-calendar-v1.spec.js` låser:

- Kalender som Kontor-underfane;
- syv dager fra mandag til søndag;
- riktig aktuell dag fra Club Week-fasen;
- ingen egen progresjonsknapp;
- uendret femområdes hovedmeny;
- mobil uten horisontal lekkasje;
- WCAG 2 A/AA.

Permanente audit- og simuleringsporter kontrollerer samtidig at Kalender bare projiserer eksisterende Club Week-/liga-/kampdata og ikke introduserer en ny spillsannhet.
