# Manager Post-match Analysis v1

## Formål

Etterkampen skal avslutte kampen som en managerbeslutning, ikke som en løs resultatboks. Scenen samler resultat, kampforklaring, taktisk evaluering, managergrep, spillerbidrag, klubbkonsekvenser og neste uke i én lesbar arbeidsflyt.

Flyten er:

**Resultat → hvorfor → taktikk → grep → spillere → konsekvenser → neste uke**

## Autoritative kilder

Presentasjonslaget regner ikke kampen på nytt. Det leser bare eksisterende resultater fra:

- `football-matchday-engine.js` og `createMatchReport(lastMatch)`
- `football-match-explanation-engine.js`
- `lastMatch.playerStats`
- `lastMatch.decisions`, `bestDecision` og `worstDecision`
- `lastMatch.clubConsequences`
- `football-match-consequences.js`
- eksisterende fanemål `trening` og `analyse`

`manager-matchday-presentation.js` kobler den eksisterende rapportfasen til `manager-post-match-analysis-v1.js`. Begge eier bare scenehierarki, tekstvalg og navigasjon.

## Scenens innhold

### Resultat og kampbilde

Viser utfall, score, xG, forklaringsmotorens overskrift og en kort resultatsammenheng.

### Hvorfor kampen endte slik

Bruker `explanation.decisiveFactors`. Dersom eldre kampdata mangler forklaringsobjektet, brukes eksisterende `keyFactors` og `analysis` som fallback.

### Taktisk evaluering

Samler formasjonsdom, taktiske faktorer og rollerelasjoner. Den forklarer managerens bruk av systemet og omtaler ikke spillere som en samlet skjult overall.

### Managerens grep

Viser beste og svakeste registrerte kampbeslutning. Ingen nye vurderinger konstrueres i UI-laget.

### Spillerbidrag

Viser mål og målgivende fra `lastMatch.playerStats.goals`, aggregert som konkrete målpoeng. Det innføres ingen kampkarakter eller skjult spiller-rating.

### Konsekvenser

Viser de faktiske deltaene som allerede er brukt på styretillit, moral, taktisk klarhet, treningskultur og medietrykk, samt lagret formasjonstilvenning.

### Neste handling

Primær handling er `Planlegg neste treningsuke` og bruker eksisterende `trening`-mål. Full teknisk rapport er fortsatt tilgjengelig via `analyse`. Etterkampen har derfor ingen dead end.

## Skade, belastning og suspensjon

Scenen viser skade- og belastningssignaler når de finnes i kampens eksisterende `explanation.offPitchFactors`. Den oppretter ingen ny skade- eller suspensjonsmotor. Suspensjoner skal først vises her når en autoritativ suspensjonskilde finnes i kamp- eller sesongtilstanden.

## Permanente porter

- `audit:manager-post-match-analysis-v1`
- `sim:manager-post-match-analysis-v1`
- Playwright: struktur, navigasjon, mobil overflow, WCAG 2 A/AA og 768 px visuell baseline
- simulering av seier, uavgjort, tap og kamp med eksisterende skadesignal
