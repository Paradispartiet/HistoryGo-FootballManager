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

## Troppstilstand og neste steg (kompakt visning)

- **Navngitt oppfølging:** Den eksisterende `#squadConditionList` er fortsatt sannhetskilden for hvilke spillere som er skadde eller trenger hvile. Treningsdagen viser disse som en sammenleggbar, tilgjengelig liste i troppstilstandskortet. Er det ingen slike spillere, skjules listen uten at vi dikter opp et varsel.
- **Neste treningsvalg:** Treningsdagen leser `#trainingPlanSteps` og `#trainingChoiceStatus`, som allerede rendres av `football-training-plan.js`. Innboks åpnes via gjeldende planhandling; program, fokus og individuell oppfølging åpnes via de eksisterende Lag-valgdrawerene.
- **Plan klar:** Når eksisterende ukeplan er klar, viser den kompakte handlingslinjen veien til Kamp. Individuell oppfølging forblir valgfri, også når planen har et uferdig individuelt steg.
- Den globale **«Neste handling»** styrer fortsatt klubbukas progresjon; lokal handlingslinje i treningen introduserer verken ekstra fase, bonus, belastningsberegning, eller lagringsnøkkel.
- Kilden til navngitt spillerstatus og plansteg beholdes i skjult DOM for kompatibilitet med appens opprinnelige renderere. Bare korte, lesbare presentasjoner vises på treningsdagen.

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

## Relevant økter direkte i spillet (kontekstavhengig arbeidsflyt)

Spillet foreslår ikke en løs øvelsesbank. Manageren velger blant eksisterende **kontekstrangerte treningsprogrammer**, og hvert program eier de fire faktiske øktene. Oppsettene for øktene er spillets anbefaling, ikke frie øvelser spilleren må bygge selv.

- Programrangeringen bruker eksisterende taktikkanalyse, motstanderprofil og off-pitch-signaler; faktisk belastning fra de eksisterende spillerregistreringene tas nå også inn som `fatigueRisk` i **samme** programscorer.
- Hver av de fire øktene viser en ferdig foreslått øvelse, hvorfor den inngår (kampplan, motstander og øktas fotballfaglige mål), og konkret påminnelse om skadde eller slitne spillere.
- Rådet vises i et naturlig `details/summary`-felt direkte under riktig økt. Ingen manuell banetegning, oppgavebank, radio-valg eller ekstra treningshypoteser er nødvendige.
- Øktas canonical `intensity`, `fatigueLoad`, `injuryRiskModifier`, `duration` og `tacticalObjective` blir ikke endret av teksten i anbefalingen. Spillmotoren styrer fortsatt faktisk virkning, og spilleren bruker eksisterende program- og fokusvalg.
- Ingen nye lagringsnøkler, evalueringsmotorer eller bonusregler.

Dette gjelder særlig det prioriterte ligaspillet i Eliteserien og OBOS-ligaen.

## Revisjonskontroll – relevans, lagring og visuell prioritet

Ved kvalitetssikring av treningssystemet er disse kontraktene presisert:

- En autoritativ aktiv modussesjon eier valgt treningsprogram og klubbuke. Eldre liganøkler brukes bare som fallback for ligasaver uten disse feltene, aldri for å blande trening mellom moduser.
- Anbefalt øvelse **er synlig i selve økta uten ekstra trykk**; manageren kan folde ut begrunnelse og belastningsråd ved behov. Det er ikke et eget øvelsesverksted eller en oppgavebank.
- Gamle lagrede treningshypoteser beholdes internt for bakoverkompatibilitet, men er **ikke en del av den aktive treningsdagen**. Et slikt notat skal ikke distrahere fra programmets faktiske fire økter.
- Motstandertilpasning bruker klubbenes eksisterende `matchupStyles` (blant annet `high_press`, `direct_counter`, `compact_532` og `deep_low_block`). Beskrivende stilnavn brukes bare som fallback; det er ikke forsvarlig å trekke taktiske slutninger bare fra et poetisk klubbkallenavn.
- De eksisterende skademotorene, off-pitch-signalene, valgt fokus, treningsprogram og ukebelastning er fortsatt autoritative. Den nye presentasjonen verken overstyrer intensitet eller simulerer nye økteffekter.
- Responsiv nettleserkontroll må dekke svært smal mobil (320 px), vanlig mobil (390 px), nettbrett (768–820 px) og PC (1280 px). Øvelsestittel, valgknapper og belastningsråd må være leselige og tastaturtilgjengelige.

Dette er en teknisk og faglig korrekthetsport, ikke en påstand om at enhver navngitt klubb følger akkurat den foreslåtte treningsøvelsen i virkeligheten.
