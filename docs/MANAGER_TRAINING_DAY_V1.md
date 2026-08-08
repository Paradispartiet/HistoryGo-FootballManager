# Manager Training Day v1

## Formål

Trening skal oppleves som en faktisk arbeidsdag i manageruka, ikke som en egen progresjonsverden ved siden av Kalender.

Kalenderen eier fortsatt tiden. Når manageren åpner en treningshendelse fra onsdag eller torsdag, åpnes den eksisterende `Lag · Trening`-flaten med kalenderkonteksten synlig. Manageren kan alltid gå tilbake til samme kalenderdag.

## Permanent kontrakt

- Kalenderen er fasit for uke og dag.
- Trening oppretter ingen ny dag, fase eller `Neste`-funksjon.
- `football-manager-calendar.js` organiserer eksisterende Club Week i dager og hendelser.
- `manager-calendar-workspace-v1.js` sender den valgte arbeidskonteksten før navigasjon.
- `manager-training-day-v1.js` mottar konteksten og er bare et presentasjonslag over eksisterende trening.
- Ingen ny localStorage-nøkkel.
- Ingen ny treningsmotor.
- Ingen ny progresjonsmotor.

## Treningsdagen

Hovedflaten skal vise det manageren trenger for den faktiske treningsdagen:

1. kalenderkontekst: uke, dag, tidspunkt og hendelse;
2. valgt treningsprogram;
3. fire økter fra det valgte programmet;
4. ukens treningsfokus;
5. individuell oppfølging;
6. assistentens viktigste signal;
7. troppstilstand og belastning;
8. neste motstander.

Den gamle kommandoflaten og den pedagogiske stegvisningen beholdes som underliggende DOM/state-kilder, men skal ikke konkurrere visuelt med treningsdagen.

## Valg

Alternativer skal ikke fjernes.

`Endre program`, `Endre fokus` og `Endre oppfølging` bruker den felles Lag-valgdraweren fra Pass 2. Draweren flytter de eksisterende kontrollene midlertidig inn i menyen og tilbake igjen ved lukking. Dermed brukes samme event handlers, samme state og samme motorer.

## Kalenderkobling

Kalenderen kjenner allerede den valgte uka, dagen og hendelsen. Før den åpner en vanlig arbeidsflate sender den derfor et transient `hgfm:calendar-open-work`-event med uke, dag, tidspunkt, hendelses-ID, hendelsestittel og target.

Treningsdagen lytter bare på denne hendelsen når target er `trening`. Kalenderkonteksten holdes i runtime-minne og lagres ikke. Trening rekonstruerer dermed ikke eller gjetter hvilken dag manageren kom fra.

Treningsdagen kan derfor vise for eksempel:

`Kalender · Uke 3 · Onsdag → Lag · Trening`

`Tilbake til kalenderdagen` åpner Kontor → Kalender og velger den samme dagen igjen. Det endrer ikke Club Week-fasen og avanserer ikke tiden.

Hvis Trening åpnes direkte fra Lag, bruker presentasjonen eksisterende Club Week som fallback og tilbyr fortsatt en vei tilbake til den relevante kalenderdagen.

## Motorgrenser

Sannhetskilder er fortsatt blant annet:

- `football-training-plan.js`
- `football-training-program-compositions.js`
- `football-training-week.js`
- `football-individual-training.js`
- `football-player-condition.js`
- Club Week-state
- eksisterende liga-/motstanderkontekst

Presentasjonslaget må ikke beregne nye treningseffekter eller gjennomføre fasebytter.
