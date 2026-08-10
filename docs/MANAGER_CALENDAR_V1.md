# Kalender og ekte manageruke v1

Kalender v1 er nå Kontorets tids- og orkestreringsflate. Den gjør manageruka synlig uten å innføre en ny tidsmotor eller en ny progresjonsmotor.

## Prinsipp

**Club Week er fortsatt sannhetskilden for uke og fase.** Kalenderen leser denne staten og projiserer den på mandag til søndag.

Kalenderen er startflaten i en aktiv ligasave og Kontorets standardflate. Den viser hva som faktisk skjer i arbeidsdagen, og åpner de eksisterende arbeidsflatene der oppgaven hører hjemme.

Det betyr:

- kalenderen flytter ikke uka av seg selv;
- den oppretter ingen ny daglig save-state;
- den endrer ikke kamp-, trenings-, innboks-, liga- eller konsekvensmotorene;
- den bruker eksisterende systemer som sannhetskilder og samler dem i tid.

## Kontor etter redesign

I normal managerloop åpner **Kontor** direkte på **Kalender**.

Innboks er ikke lenger en parallell Kontor-fane. En melding er en hendelse i managerens dag, for eksempel:

```text
08:30 · Melding fra fysioterapeut
10:00 · Trener- og klubbmøte
11:00 · Trening
14:30 · Oppfølging etter økta
```

Trykk på en melding åpner den eksakte mailen som tilhører hendelsen i et drawer over kalenderen. Når meldingen lukkes, står brukeren fortsatt på samme kalenderdag. Den videre kontrakten for konkrete, state-drevne mailer ligger i `MANAGER_CLUB_COMMUNICATION_V3.md`.

Den eksisterende klubbflaten presenteres som **Klubben**. Dype legacy-flater beholdes teknisk der de fortsatt trengs, men de skal ikke konkurrere som likeverdige Kontor-faner.

Oppstartshjelp skjules fra Kontor når en vanlig ligasave er i gang. Den kan fortsatt brukes under faktisk oppstart, slik at gamle og nye saves ikke får dead ends.

## Kalenderfooter

Den eksisterende `manager-next-action`-hosten er den vedvarende kalenderfooteren i en aktiv ligasave. Den viser:

- aktuell uke og ukedag;
- neste relevante hendelse på den faktiske arbeidsdagen;
- tidspunkt og kort forklaring;
- én lenke tilbake til dagens kalender.

Footeren er synlig også når manageren arbeider i Lag, Speiding, Kamp eller Stats. Et klikk åpner aktuell kalenderdag. Det flytter aldri tid og gjennomfører aldri hendelsen.

Den interne `next-action`-logikken kan fortsatt brukes av eksisterende systemer under oppstart og i andre modi. I ligasaven eier kalenderen den synlige footeren; den generiske Next-modellen er ikke en parallell veiviser.

Detaljert manglende arbeid vises fortsatt der arbeidet skjer:

```text
11:00 · Trening
Treningsprogram mangler.
Velg program
```

Dette er navigasjon til eksisterende trening, ikke en ny progresjonskommando.

## Ukerytme

Den eksisterende seksfasemodellen presenteres fortsatt som syv dager:

| Dag | Eksisterende fase | Arbeid |
|---|---|---|
| Mandag | `analysis` | Analyse og restitusjon |
| Tirsdag | `inbox` | Møter og meldinger |
| Onsdag | `training` | Treningsarbeid |
| Torsdag | `training` | Individuell oppfølging og analyse |
| Fredag | `match_prep` | Kampforberedelse |
| Lørdag | `matchday` | Kampdag |
| Søndag | `review` | Etterkamp og kampanalyse |

Torsdag er fortsatt en videreføring av den eksisterende treningsfasen. Vi lager ikke en syvfasers motor bare fordi kalenderen har syv dager.

## Arbeidsdagen

Uka vises først som en kompakt dagstripe:

```text
MAN ✓ · TIR ✓ · ONS ● · TOR · FRE · LØR ⚽ · SØN
```

En dag kan velges uten å endre Club Week. Under dagstripen vises dagens faktiske hendelser kronologisk.

Hendelser kan være:

- melding;
- trenermøte;
- trening;
- individuell oppfølging;
- analyse;
- kampforberedelse;
- kamp;
- etterkamp.

En hendelse kan åpne en eksisterende arbeidsflate. Det er bare navigasjon. Kalenderen utfører ikke motorhandlingen på brukerens vegne.

## Dynamisk innhold

Kalenderen gjenbruker eksisterende data og UI-signaler:

- `teamMerits.clubWeekState` for uke og fase;
- eksisterende ligasesong for neste motstander, hjemme/borte og runde;
- eksisterende treningsvalg for om ukas treningsarbeid er satt;
- eksisterende kampstate for siste resultat;
- eksisterende kampklar-status for ellever og benk;
- eksisterende innbokstråder og konkrete klubbmailer for meldingshendelsene.

Ingen av disse dataene skrives av kalenderen.

## Visuelt prinsipp

Kalenderen er ikke en vegg av kort. Den består primært av:

- dagstripe;
- tidslinje;
- valgte/aktuelle hendelser;
- drawer for melding.

Aktuell dag og manglende arbeid har størst visuell tyngde. Alternativer vises først når brukeren åpner riktig arbeidsflate.

På mobil og tablet beholdes de syv dagene som en kompakt stripe, mens hendelsene ligger vertikalt under. Det skal ikke oppstå horisontal side-overflow.

## Motorgrenser

Kalender v1 introduserer:

- ingen ny tidsmotor;
- ingen ny uke-engine;
- ingen ny fase-engine;
- ingen ny kalenderlagring;
- ingen automatisk dagprogresjon;
- ingen ny «Neste»-motor; kalenderen gjenbruker den eksisterende footer-hosten;
- ingen endring i kamp-, trenings-, inbox-, liga- eller konsekvensmotorene.

`src/football-manager-calendar.js` er en ren view-model. `src/ui/manager-calendar-workspace-v1.js` eier presentasjon, Kontor-ruting og meldingsdrawer.

## Regresjonsvern

Permanent simulering låser:

- fase → ukedag;
- syvdagersuka;
- kronologiske hendelser;
- melding som kalenderhendelse;
- manglende treningsvalg på selve treningshendelsen;
- kamp på lørdag;
- etterkamp på søndag;
- ny uke på mandag;
- ingen ny progresjonsfunksjon.

Browser-vakten låser:

- aktiv ligasave starter direkte i Kalender;
- separat Innboks-fane er skjult;
- Klubbdrift presenteres som Klubben;
- Oppstartshjelp er skjult etter oppstart;
- syv valgbare dager;
- kronologisk arbeidsdag;
- meldingsdrawer uten å forlate kalenderdagen;
- kalenderfooteren er synlig i hele ligasaven og returnerer til aktuell dag;
- Kontor forblir valgt hovedområde;
- mobil uten horisontal overflow;
- WCAG 2 A/AA med axe.
