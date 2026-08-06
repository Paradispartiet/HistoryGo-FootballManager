# Manager Matchday Scene v1

Denne leveransen gjør Kamp til én sammenhengende managerscene fra forberedelse til rapport. Den bygger ingen ny kamp-, kampplan-, liga-, trenings-, spillerform- eller lagringsmotor.

## Scenens rekkefølge

```text
Forberedelse
→ kampklarhet og motstanderbrief
→ avspark
→ les kampbildet og ta managergrep
→ sluttresultat
→ rapport og læringspunkt
```

Kampdagen har fem presentasjonstilstander:

1. **blocked** – laget mangler et autoritativt kampkrav;
2. **ready** – laget kan åpne kampforberedelsen;
3. **pre_match** – kampsesjonen finnes og avspark venter;
4. **live** – kampklokken og hendelsesrekken pågår;
5. **report** – sluttresultatet er lagret og rapporten kan analyseres.

Presentasjonslaget oppretter aldri disse tilstandene. Det leser bare eksisterende readiness, kampsesjon og siste kamp.

## Før kamp

Første nivå viser:

- klubb og motstander;
- konkurranse-, runde-, arena- og motstanderkontekst når den finnes;
- kampklarhet og første reelle blokkering;
- valgt formasjon og kampplan;
- ukas trening;
- assistentens siste signal;
- motstanderens viktigste trussel;
- én primær handling.

Den primære handlingen peker enten til første manglende krav, oppretter eksisterende kampforberedelse eller starter eksisterende avspark. Kampdetaljer og de gamle tekniske kontrollene ligger foldet under scenen.

## Under kampen

Den eksisterende `football-matchday-engine.js` eier fortsatt:

- kampsesjonen;
- kampklokken;
- hendelsene;
- managergrepene og konsekvensene;
- bytter og kampplanendringer;
- motstanderens tilpasninger;
- sluttberegningen.

Scenen viser bare at kampen er live og fører manageren til den aktive hendelsen. Den endrer ingen poeng, momentum, xG, spillerstatistikk eller konsekvenser.

## Etter kampen

Når `lastMatch` finnes uten aktiv kampsesjon, viser scenen:

- utfall og resultat;
- kampens viktigste utslag;
- ett læringspunkt for neste uke;
- direkte inngang til den eksisterende Analyse-flaten.

Den fullstendige rapporten under scenen og Analyse-flaten bruker fortsatt `createMatchReport()` og eksisterende lagfit-, forklarings- og statistikkdata.

## Motorgrenser

Følgende systemer er sannhetskilder:

- `football-matchday-readiness.js` eier kampklarhet og blokkeringer;
- `football-matchday-engine.js` eier kamp og rapportgrunnlag;
- `football-match-plan.js` eier kampplan og kampbildet;
- `football-player-condition.js` eier form, slitasje og skader;
- historiske motstanderprofiler eier motstanderidentitet og trusler;
- `football-league-season.js` eier terminliste, serierunde og tabell;
- `football-next-action.js` eier managerukas globale vei videre;
- `src/ui/manager-matchday-presentation.js` eier bare presentasjonshierarkiet.

## Testkontrakt

- ren simulering kontrollerer blokkert, klar, før avspark, live og rapport;
- scene-audit krever presentasjonsmodul, foldet dybde, permanente CI-porter og uendrede motorgrenser;
- Playwright kontrollerer scenehierarki, første blokkering, kampforberedelse, mobil overflow, WCAG 2 A/AA og visuell baseline;
- eksisterende kamp-, liga-, trening-, spillerform-, managergrep- og flyttester skal fortsatt bestå.
