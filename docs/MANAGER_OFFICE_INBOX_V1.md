# Managerkontor og Assistentråd v1

Denne leveransen etablerte Kontor- og innboksfunksjonene som egne managerflater. **Presentasjonsdelen er nå videreført av `MANAGER_CALENDAR_V1.md`: i en aktiv ligasave ligger Innboks inne i Kalender i stedet for å være en parallell Kontor-fane.**

Motorene og dataene fra denne leveransen består. Det er bare informasjonsarkitekturen som er endret.

## Canonical presentasjon etter Kalender + Kontor redesign

Kontor åpner nå på **Kalender**. En innbokssak er en hendelse i managerens arbeidsdag, ikke et separat hovedrom ved siden av tiden.

Eksempel:

```text
08:30 · Melding fra fysioterapeut
10:00 · Trener- og klubbmøte
11:00 · Trening
14:30 · Oppfølging etter økta
```

Når brukeren åpner meldingshendelsen, flyttes den eksisterende innbokstråden midlertidig inn i et drawer over kalenderen. Dermed beholdes eksisterende avsender, tråd, svarvalg og konsekvenslogikk uten å kopiere eller erstatte `football-inbox-events.js`.

Når draweret lukkes, er brukeren fortsatt på samme kalenderdag.

## Hva som fortsatt er gyldig fra Assistentråd v1

Den underliggende innboksmodellen behandles fortsatt som et beslutningsrom:

- én aktiv sak kan ligge i fokus;
- saken beholder avsender, forklaring og eksisterende svarvalg;
- uleste signaler, ventende svar og fase kan brukes som beslutningsstøtte;
- andre åpne saker ligger i kø;
- et køvalg kan flyttes til fokus uten å endre hendelses- eller svarmotoren;
- avsluttede og arkiverte saker ligger i historikk.

Disse strukturene kan fortsatt rendres internt og brukes av meldingsdrawer, arkiv eller senere filtre. De skal ikke tvinge fram en egen synlig Innboks-fane i normal managerloop.

## Gammel Kontor-oversikt

`src/ui/manager-office-presentation.js` beholdes foreløpig som kompatibilitets- og oppstartslag. Dens gamle «Ukas hovedsak», fire statuskort og klubbpuls er **ikke lenger Kontorets normale førsteside**.

Oppstartshjelp kan bruke dette laget mens en save faktisk settes opp. Etter oppstart skjules Oppstartshjelp fra normal Kontor-navigasjon.

Det betyr også at den globale Next-footeren ikke lenger skal være den synlige autoritative navigasjonen i en vanlig ligasave. `football-next-action.js` kan fortsatt eksistere internt for å beregne mangler og kompatibilitet, men brukergrensesnittet viser mangelen der arbeidet faktisk skjer, for eksempel på kalenderens treningshendelse.

## Motorgrenser

Følgende eksisterende systemer er fortsatt sannhetskilder:

- `football-inbox-events.js` og `club_inbox_*` eier saker, svar og konsekvenser;
- Club Week eier uke og fase;
- kampklarhetsmodulen eier om kamp kan startes;
- off-pitch-parametrene eier moral, styre, medier og taktisk klarhet;
- ligamotoren eier terminliste, resultater og tabell;
- `football-next-action.js` kan fortsatt beregne intern neste-handling-status, men eier ikke lenger en permanent synlig footer i normal managerloop.

Kalenderintegrasjonen bygger **ingen ny motor**. Den skriver ingen ny innboks- eller kalenderstate og endrer ikke eksisterende svar- eller konsekvenslogikk.

## Testkontrakt

Permanent verifikasjon skal nå låse at:

- innboksmotoren og dens fokus/kø/historikk fortsatt finnes;
- Kontor åpner Kalender i aktiv ligasave;
- separat Innboks-fane er skjult i normal managerloop;
- en eksisterende innbokstråd kan åpnes fra en kalenderhendelse i drawer;
- lukking av drawer returnerer til samme kalenderdag;
- trening og andre handlinger åpnes fra den relevante hendelsen;
- den globale Next-footeren er skjult i normal managerloop;
- mobil ikke får horisontal overflow;
- Kalender og meldingsdrawer består WCAG 2 A/AA-vaktene.

Den detaljerte canonical tids- og IA-kontrakten ligger i `docs/MANAGER_CALENDAR_V1.md`.
