# HG Football Manager – Engine Architecture

Dette dokumentet beskriver arkitekturen i TypeScript-motoren for HistoryGo Football Manager.

Målet med motoren er å bygge et profesjonelt manager-system der trenerens valg avgjør: rollebruk, taktikk, lagbalanse, svakheter, treningsfokus og managerinnsikt. Spillet skal ikke først og fremst handle om rå overall-rating, men om hvordan klassespillere brukes riktig eller feil.

Kjerneprinsipp:

Alle spillere er gode. Treneren avgjør. Riktig rolle + riktig taktikk + riktig lagbalanse = høy prestasjon. Feil rollebruk skjuler kvalitet.

> **Statusoppdatering (juni 2026):** Avsnittene «Nåværende status» (18) og «Neste steg» (19–20) under er historiske. De legacy-motorene er nå portet til TS og parity-testet byte-identisk: `calculatePlayerMatchFit.ts`, `calculateRoleRelationships.ts`, `calculateBadgeMetricEffects.ts`, `calculateHistoricalFormationFit.ts`, `buildCoachContext.ts` og sammenstillingen `calculateTeamFit.ts`. `app.js`-funksjonen `getTeamFit()` kjører nå TS-`calculateTeamFit` (via `getLoadedManagerEngine()`) med legacy-fallback uten bygget `dist/`. TS-motoren er dermed live source of truth for `teamFit` (scorepanel, rapport, ellever, kampdag); den strukturerte dashboard-pipelinen under mater kun det additive manager-detalj-panelet. Se CLAUDE.md for den oppdaterte oversikten.

## 1. Hovedstruktur

Prosjektet har to parallelle lag:

1. Eksisterende legacy-demo
2. Ny TypeScript core engine

Legacy-demoen ligger fortsatt som statisk HTML/CSS/JS og bruker:

- `index.html`
- `style.css`
- `src/app.js`
- `src/football-fit-engine.js`
- `src/football-team-fit-engine.js`
- `data/football_players.json`
- `data/football_roles.json`
- `data/football_tactics.json`
- `data/football_formations.json`

Den nye TypeScript-motoren ligger under:

- `src/domain/`
- `src/engine/`
- `src/sample/`
- `src/index.ts`

Legacy-demoen skal ikke rives opp. Den nye motoren bygges ved siden av, og kobles senere inn gjennom adaptere og app-state.

## 2. Domain-laget

### `src/domain/footballTypes.ts`

Dette er grunnkontrakten for hele TypeScript-motoren.

Den definerer blant annet:

- `Player`
- `Role`
- `Tactic`
- `Team`
- `RoleAssignment`
- `PlayerRoleFitResult`
- `TeamBalanceResult`
- `MatchInput`
- `MatchResult`

Dette er rene typer. Filen skal ikke inneholde motorlogikk.

Viktig prinsipp:

`overall` finnes, men skal ikke være hovedmotoren. Det er bare kvalitetsgulvet. Den faktiske vurderingen skjer gjennom attributter, traits, roller, taktikk og lagbalanse.

## 3. Første motorlag: rollefit og lagbalanse

### `src/engine/calculateRoleFit.ts`

Beregner hvor godt én spiller passer i én rolle i én posisjon i én taktikk.

Input:

- `Player`
- `Role`
- `RoleAssignment`
- `Tactic`

Output:

- `PlayerRoleFitResult`

Den vurderer:

- attributtfit
- traitfit
- posisjonsfit
- taktikkfit
- foreløpig nøytral kjemi
- samlet finalFit
- forklarende reasons

Denne filen er grunnmotoren for rollebruk.

### `src/engine/calculateTeamBalance.ts`

Beregner om hele laget henger sammen som struktur.

Input:

- `Team`
- `Tactic`
- `Role[]`
- eventuelt `PlayerRoleFitResult[]`

Output:

- `TeamBalanceResult`

Den vurderer:

- attackingBalance
- defensiveBalance
- midfieldControl
- pressingCoherence
- widthBalance
- riskBalance
- finalBalance
- forklarende reasons

Denne filen hindrer at brukeren bare kan stable elleve gode spillere uten balanse.

## 4. Samlet lagvurdering

### `src/engine/evaluateTeamSetup.ts`

Dette er første samlelag.

Den kjører:

- `calculateRoleFit()` for alle gyldige rolleplasseringer
- `calculateTeamBalance()` for hele laget

Input:

- `Team`
- `Tactic`
- `Role[]`

Output:

- `TeamSetupEvaluation`

Den returnerer:

- `setupScore`
- `roleFitResults`
- `teamBalance`
- `missingAssignments`
- `bestFits`
- `worstFits`
- `strengths`
- `issues`
- `summary`

Dette er første komplette vurdering av en startellever.

## 5. Rapportmotor

### `src/engine/createTeamSetupReport.ts`

Lager en mer lesbar manager-rapport basert på `TeamSetupEvaluation`.

Input:

- `TeamSetupEvaluation`

Output:

- `TeamSetupReport`

Den returnerer:

- `overallSummary`
- `keyStrengths`
- `keyProblems`
- `bestPlayers`
- `problemPlayers`
- `balanceOverview`
- `coachAdvice`
- `rawIssues`

Denne filen endrer ikke motorverdier. Den tolker og forklarer resultatene.

## 6. Rolleendringsmotor

### `src/engine/recommendRoleChanges.ts`

Foreslår rollebytter for samme spiller i samme posisjon.

Input:

- `Team`
- `Tactic`
- `Role[]`

Output:

- `RoleChangeRecommendationResult`

Den gjør dette:

- finner spiller og nåværende rolle
- beregner currentFit
- tester alternative roller i samme posisjon
- anbefaler endring bare hvis forbedringen er tydelig

Den skal ikke:

- bytte spiller
- bytte posisjon
- endre taktikk
- skrive til datafiler

Denne motoren gjør spillet mer manager-aktig, fordi den foreslår konkrete trenergrep.

## 7. Svakhetsanalyse

### `src/engine/analyzeWeakPoints.ts`

Analyserer hva som er svakt i laget.

Input:

- `TeamSetupEvaluation`

Output:

- `WeakPointAnalysis`

Den identifiserer svakheter innen:

- completion
- role_fit
- team_balance
- attack
- defence
- midfield
- pressing
- width
- risk

Hvert weak point har:

- category
- severity
- score
- label
- rationale
- suggestedAction
- relatedPlayerIds

Dette er motoren som peker på hva treneren faktisk må rette.

## 8. Treningsfokus

### `src/engine/createTrainingFocus.ts`

Oversetter svakheter til treningsfokus.

Input:

- `TeamSetupEvaluation`

Output:

- `TrainingFocusPlan`

Den bruker `analyzeWeakPoints()` og lager:

- `focusItems`
- `primaryFocus`
- `weeklyPlan`
- `summary`

Treningsområder:

- rolleforståelse
- press
- bredde
- restforsvar
- midtbanekontroll
- angrepsstruktur
- risikobalanse
- lagstruktur
- fullføring

Dette gjør at svakheter ikke bare blir rapportert, men omgjort til trening.

## 9. Managerinnsikt

### `src/engine/createManagerInsight.ts`

Dette er hovedhjernen i motoren.

Den kombinerer:

- `evaluateTeamSetup()`
- `createTeamSetupReport()`
- `recommendRoleChanges()`
- `analyzeWeakPoints()`
- `createTrainingFocus()`

Input:

- `Team`
- `Tactic`
- `Role[]`

Output:

- `ManagerInsight`

Den returnerer:

- setup
- report
- weakPointAnalysis
- roleChangeRecommendations
- trainingFocusPlan
- topActions
- summary

Dette er den viktigste samlefunksjonen i hele motoren per nå.

## 10. Taktikk- og formasjonsanalyse

### `src/engine/compareTactics.ts`

Sammenligner flere taktikker for samme lag.

Input:

- `Team`
- `Tactic[]`
- `Role[]`

Output:

- `TacticalComparisonResult`

Den vurderer:

- setupScore
- teamBalanceScore
- averageRoleFit
- status
- strengths
- issues

Brukes for å finne hvilken taktikk som får mest ut av laget.

### `src/engine/compareFormations.ts`

Sammenligner formasjoner basert på taktikkens `formation`.

Input:

- `Team`
- `Tactic[]`
- `Role[]`

Output:

- `FormationComparisonResult`

Siden vi foreløpig ikke har egen `Formation`-type i domenelaget, grupperer den taktikker etter `tactic.formation`.

## 11. Dashboard-data

### `src/engine/createManagerDashboardData.ts`

Gjør `ManagerInsight` om til strukturert dashboard-data.

Input:

- `ManagerInsight`

Output:

- `ManagerDashboardData`

Returnerer blant annet:

- scorePanel
- summaryPanel
- metrics
- topActions
- keyStrengths
- keyProblems
- trainingPlan
- roleChanges
- weakPoints

Dette er første bro mellom motor og UI.

### `src/engine/createManagerDashboardViewModel.ts`

Gjør dashboard-data om til visningsklare felter.

Input:

- `ManagerDashboardData`

Output:

- `ManagerDashboardViewModel`

Den lager:

- tekstverdier
- CSS-klasser
- tomtilstander
- ferdige kortdata

Dette laget gjør at UI senere slipper å forstå hele motorstrukturen direkte.

## 12. App-state

### `src/engine/createManagerAppState.ts`

Samler hele motoren til én app-state.

Input:

- `Team`
- `Tactic`
- `Role[]`

Output:

- `ManagerAppState`

Den kjører:

- `createManagerInsight()`
- `createManagerDashboardData()`
- `createManagerDashboardViewModel()`

Returnerer:

- status
- insight
- dashboardData
- dashboardViewModel
- summary

Dette er den reneste inngangen for fremtidig UI-integrasjon.

## 13. Legacy-adapter

### `src/engine/adaptLegacyFootballData.ts`

Oversetter eksisterende JSON-demo til de nye TypeScript-typene.

Legacy-dataene bruker et annet schema enn TypeScript-motoren.

Legacy-spillere har blant annet:

- `naturalPositions`
- `usablePositions`
- `poorFits`
- `archetypes`
- `strengths`
- `needs`
- `preferredRoles`
- `likesTactics`
- `dislikesTactics`

Legacy-roller har blant annet:

- `validPositions`
- `requires`
- `goodWith`
- `badFor`
- `tacticalLikes`
- `tacticalDislikes`

Legacy-taktikker har blant annet:

- `pressing`
- `tempo`
- `width`
- `buildUp`
- `chanceCreation`
- `defensiveLine`
- `tags`

Adapteren lager:

- `Player[]`
- `Role[]`
- `Team`
- `Tactic`

Den endrer ikke legacy-data. Den leser og oversetter.

### `src/engine/createLegacyManagerAppState.ts`

Kobler legacy-data direkte til ny motor.

Input:

- legacy players
- legacy roles
- legacy tactic
- legacy formation
- legacy lineup

Output:

- `LegacyManagerAppState`

Den kjører:

- `adaptLegacyTeam()`
- `adaptLegacyRoles()`
- `adaptLegacyTactic()`
- `createManagerAppState()`

Dette er broen mellom gammel demo og ny motor.

## 14. Sample-laget

Sample-filene ligger under:

- `src/sample/`

De er ikke kjerne-API. De skal normalt ikke eksporteres fra `src/index.ts`.

### `src/sample/elite433Sample.ts`

Inneholder et komplett TypeScript-sample:

- 11 spillere
- roller
- én 4-3-3-taktikk
- `sampleEvaluation`

Brukes for å se at ny motor fungerer uten legacy-data.

### `src/sample/readSampleEvaluation.ts`

Lager lesbar output fra `sampleEvaluation`.

### `src/sample/readManagerInsightSample.ts`

Lager lesbar output fra `createManagerInsight()`.

### `src/sample/readManagerDashboardSample.ts`

Lager lesbar output fra `createManagerDashboardData()`.

### `src/sample/readManagerDashboardViewModelSample.ts`

Lager lesbar output fra `createManagerDashboardViewModel()`.

### `src/sample/readManagerAppStateSample.ts`

Lager lesbar output fra `createManagerAppState()`.

### `src/sample/readLegacyManagerAppStateSample.ts`

Lager sample-output fra legacy-adapteren og ny app-state.

Denne filen viser at gammel JSON-form kan kobles inn i ny motor uten at legacy-demoen endres direkte.

## 15. Eksportfil

### `src/index.ts`

Dette er hovedeksporten for TypeScript-motoren.

Den skal eksportere engine-typer og engine-funksjoner.

Den skal eksportere:

- domain types fra `footballTypes.ts`
- `calculateRoleFit`
- `calculateTeamBalance`
- `evaluateTeamSetup`
- `createTeamSetupReport`
- `recommendRoleChanges`
- `analyzeWeakPoints`
- `createTrainingFocus`
- `createManagerInsight`
- `compareTactics`
- `compareFormations`
- `createManagerDashboardData`
- `createManagerDashboardViewModel`
- `createManagerAppState`
- `adaptLegacyFootballData`
- `createLegacyManagerAppState`

Den skal normalt ikke eksportere sample-filer.

## 16. Overordnet dataflyt

Ny TypeScript-flyt:

Player + Role + Tactic + Team  
→ `calculateRoleFit()`  
→ `calculateTeamBalance()`  
→ `evaluateTeamSetup()`  
→ `createTeamSetupReport()`  
→ `analyzeWeakPoints()`  
→ `recommendRoleChanges()`  
→ `createTrainingFocus()`  
→ `createManagerInsight()`  
→ `createManagerDashboardData()`  
→ `createManagerDashboardViewModel()`  
→ `createManagerAppState()`

Legacy-flyt:

Legacy JSON  
→ `adaptLegacyFootballData.ts`  
→ `createLegacyManagerAppState.ts`  
→ ny TypeScript motor  
→ dashboard view model  
→ fremtidig UI

## 17. Viktig arkitekturregel

Motoren skal være ren og datadrevet.

Den skal ikke:

- lese DOM
- manipulere HTML
- lagre direkte i localStorage
- hente filer med fetch
- blande seg med `src/app.js`
- endre legacy-data
- være avhengig av UI

UI-laget skal sende inn data. Motoren skal returnere strukturert output.

## 18. Nåværende status

Per nå har vi bygget:

- typekontrakt
- rollefit-motor
- lagbalanse-motor
- lagvurdering
- rapportmotor
- rolleendringsmotor
- svakhetsanalyse
- treningsfokus
- managerinnsikt
- taktikk-sammenligning
- formasjons-sammenligning
- dashboard-data
- dashboard-viewmodel
- app-state
- legacy-adapter
- legacy app-state bridge
- samplefiler for å lese output

Dette betyr at prosjektet nå har en reell manager-kjerne, ikke bare en UI-demo.

## 19. Neste naturlige steg

Neste steg bør være én av disse, i denne rekkefølgen:

1. Rydde og sikre at `src/index.ts` eksporterer alle engine-filer én gang.
2. Lage en liten intern audit/oversikt over manglende eksport hvis ønskelig.
3. Koble `createLegacyManagerAppState()` forsiktig inn i eksisterende `src/app.js`.
4. Vise ny dashboard-output i UI uten å fjerne gammel visning.
5. Først etter dette: begynne på enkel kampmotor.

Kampmotor bør ikke bygges før vi har sett at:

- legacy-data adapteres riktig
- app-state kan lages fra faktisk UI-lineup
- dashboard-viewmodel gir nyttige tekster
- eksisterende demo fortsatt fungerer

## 20. Prinsipp for videre arbeid

Ikke bygg mer kompleksitet før broen til UI fungerer.

Riktig neste tekniske steg er derfor ikke flere analysefiler, men en forsiktig integrasjon:

Legacy UI state  
→ `createLegacyManagerAppState()`  
→ dashboard view model  
→ vises i eksisterende paneler

Når dette fungerer, kan kampmotoren bygges på toppen av en stabil managerkjerne.
