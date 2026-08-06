# Manager Training Scene v2

Denne leveransen gjør Trening til én beslutningsstyrt managerscene. Den bygger ingen ny treningsmotor og flytter ikke eierskap til program, fokus, belastning, spillerform eller kampklarhet.

## Scenens hierarki

Øverst vises bare det manageren trenger for å forstå uka:

1. uke og klubbukefase;
2. neste motstander og arena;
3. assistentens viktigste signal;
4. ukas beregnede belastning og program–fokus-samsvar;
5. fire operative statuser: tropp, program, fokus og individuell oppfølging;
6. første uferdige handling.

Planstatus og troppsdetaljer ligger i ett foldet dybdenivå. Den eksisterende treningsarbeidsflaten beholder program, fokus og individuell oppfølging, men bare ett steg er åpent om gangen.

## Arbeidsflyt

```text
Kontor / Assistentråd
→ les signalet
→ velg treningsprogram
→ velg ukas fokus
→ vurder eventuell individuell oppfølging
→ gå til Kamp
```

Kommandoflaten åpner alltid det første uferdige steget. Når planmodellen ikke har et gjenstående steg, peker den lokale handlingen til Kamp. Den faste globale `Neste handling`-komponenten forblir autoritativ for hele manageruka.

## Motorgrenser

Følgende eksisterende systemer er sannhetskilder:

- `football-training-plan.js` eier rekkefølge, belastning og program–fokus-samsvar;
- `football-training-program-compositions.js` eier treningsprogrammene;
- `football-training-week.js` eier ukas taktiske fokus og kampbonus;
- `football-player-condition.js` eier slitasje, friskhet og skader;
- `football-individual-training.js` eier individuell kapasitet og oppfølging;
- Club Week, innboksen og kampflyten eier fase, signaler og neste motstander;
- `football-next-action.js` eier den globale neste handlingen.

`src/ui/manager-training-presentation.js` er et rent presentasjonslag. Det mottar ferdig utledet tilstand, bygger en lesbar scenemodell og binder statuskortene til eksisterende faner og arbeidssteg.

## Testkontrakt

- ren simulering kontrollerer tom, delvis valgt og ferdig treningsuke;
- scene-audit krever kommandoflate, foldet dybde, eksisterende motorgrenser og permanente CI-porter;
- Playwright kontrollerer hierarki, direkte steg, ett åpent arbeidssteg, mobil overflow og WCAG 2 A/AA;
- eksisterende trenings-, kamp-, flyt- og lagringstester skal fortsatt bestå.
