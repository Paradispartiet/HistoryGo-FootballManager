# Flow-audit v1 — henger spilløkka sammen?

> Status: **GRØNN.** Hele løkka fra app-start til mini-sesong henger sammen.
> Dato: 2026-06-21. Branch: `claude/hg-football-flow-audit-o5tv1y`.

Dette er en **konsolideringsoppgave, ikke en ny feature**. Målet var å verifisere
at de mange bevegelige delene (UI-faner, lokal tropp, formasjon/rolle, trening,
Club Week, innboks, kamp, mini-sesong, state) faktisk er koblet sammen i
kontrolleren `src/app.js` og UI-stillaset `index.html` — ikke å bygge noe nytt.

## Hva som ble kjørt

| Sjekk | Resultat |
| --- | --- |
| `npm run typecheck` | ✓ PASS |
| `npm run build` | ✓ PASS |
| `npm run check:dom-ids` | ✓ 140 id-oppslag finnes alle i index.html |
| `npm run audit:knowledge` | ✓ 0 feil / 0 advarsler |
| `npm run audit:hg-football` | ✓ 0 feil / 0 advarsler |
| `npm run audit:hg-historical-fit` | ✓ 13/13 |
| `npm run audit:hg-coach-context` | ✓ 22/22 |
| `npm run audit:hg-formation-knowledge` | ✓ PASS (advarsel: 32 formasjoner uten kunnskapsoppslag) |
| `npm run sim:matchday` | ✓ PASS |
| `npm run sim:mini-season` | ✓ PASS |
| `npm run sim:training-week` | ✓ PASS |
| `npm run sim:formation-matchup` | ✓ PASS |
| `npm run sim:suggested-setups` | ✓ PASS |
| `npm run sim:training-programs` | ✓ PASS |
| `npm run sim:off-pitch` | ✓ PASS |
| `npm run sim:inbox` | ✓ PASS |
| `npm run sim:club-week` | ✓ PASS |
| **`npm run audit:flow`** (ny) | ✓ **89/89** |

Motorlaget var altså allerede dekket av sim-/audit-scriptene. Hullet var at
**ingen sjekk dekket selve flyt-limet** i `app.js` — at stegene er koblet til
hverandre og til UI-knappene. Det dekker den nye `scripts/audit-flow.mjs`.

## Gjennomgang av de 11 flyt-stegene

Hvert punkt er verifisert i kode (referanser er `fil:linje` i `src/app.js` der ikke
annet er nevnt).

1. **Starter appen rent?** `init()` (`app.js:9767`) laster all data via `Promise.all`
   der alt valgfritt har `.catch(() => null)` med trygge fallbacks, og hele blokka
   ligger i `try/catch` som skriver feil til `reportSummary` i UI (`app.js:10017`).
   Mangler `dist/`, faller motoren transparent tilbake til legacy `.js`.
2. **Fungerer hovedfanene?** 11 `data-tab-target` matcher 11 `data-tab-section`
   1:1. `initTabs()`/`activateTab()` (`app.js:9742`) wirer knappene og veksler
   `section.hidden`. Ingen foreldreløse seksjoner.
3. **Kan man velge lokal starttropp?** Knappene `#activateLocalStart`,
   `#clearLocalStart`, `#activatePublicPlaceStart` er wiret (`app.js:9567+`).
   `getLocalStartPlayerIds()` mater kun spillerpoolen i `computeAvailability()`
   (`app.js:1614`) og **skriver aldri** til `visited_places` /
   `hg_groundhopper_stats_v1` (verifisert: ingen `setItem` mot de nøklene).
4. **Får man nok spillere til 11/15?** `computeRosterReadiness()` (`app.js:1804`)
   og `getMatchdayReadiness()` gater kampdag på fullt/gyldig lag.
5. **Formasjon/rollevalg?** `#formationSelect`, `#tacticSelect`,
   `#slotPlayerSelect`, `#slotRoleSelect` wiret (`app.js:9468+`).
   `seedLineupForFormation()` + `sanitizeLineupForUnlockedPlayers()` +
   `sanitizeSelectedFormation()` hindrer at gamle/låste valg omgår unlock-regelen.
6. **Treningsprogramvalg?** `selectWeeklyTrainingFocus()` og
   `selectWeeklyTrainingProgram()` wiret til kortene; påvirker off-pitch én gang
   per uke.
7. **Går Club Week-fasene videre riktig?** `advanceClubWeekPhaseAction()`
   (`app.js:9691`): kampdag-porten (`getClubWeekMatchdayGate()`) blokkerer
   uke-rulling uten spilt kamp; ny uke nullstiller ukens trening og kaller
   `advanceMiniSeasonForNewWeek()`; konsekvenser + logg + feedback settes før
   render.
8. **Genereres innbokstråder?** `integrateInboxThreads()`/`applyInboxChoice()`
   importert og wiret; tråd-/valg-/lese-handlere på plass.
9. **Kan man spille kamp?** `playMatchday()` (`app.js:3114`) →
   `startMatchdayKickoff()` → `chooseMatchdayDecision()` →
   `finalizeMatchdaySession()`. `#playMatchdayButton`/`#resetMatchdayButton` wiret.
10. **Fungerer Mini Season over fem kamper?** `startMiniSeason()`/`resetMiniSeason()`
    wiret; `advanceMiniSeasonForNewWeek()` ruller via `advanceMiniSeasonWeek()` og
    fullfører etter `MINI_SEASON_TOTAL_WEEKS` (5). Bekreftet ende-til-ende av
    `sim:mini-season` og `sim:club-week`.
11. **Lagres/nullstilles state riktig?** Alle fem hovedlagre har symmetrisk
    `save*`/`load*` (miniSeason, matchday, clubWeekState, weeklyTrainingFocus,
    weeklyTrainingProgram), og reset-stier via `localStorage.removeItem` finnes.

## Ny regresjonsvakt: `scripts/audit-flow.mjs`

Read-only, standardbibliotek, exit 1/0 — samme konvensjon som de øvrige
scriptene. Den sjekker statisk (kjører ikke DOM) at for hvert flyt-steg finnes de
nødvendige **DOM-id-ene**, **handler-funksjonene** og **motor-importene**, og at
handlerne er **referert** (wiring-proxy). Negativ-testet: omdøpes en handler,
feiler auditen med exit 1 og peker på riktig ledd.

```bash
npm run audit:flow
```

Den utfyller `check:dom-ids` (som kun sjekker at `querySelector`-id-er finnes) ved
å sjekke fane-paring, handler-definisjoner, motor-import og save/load-symmetri.

## Funn / oppfølging (ikke blokkerende)

- **32 formasjoner uten kunnskapsoppslag** (advarsel fra
  `audit:hg-formation-knowledge`). Ikke et flyt-brudd — kampdag kjører uten
  matchup når oppslag mangler — men relevant for steg 4 i veikartet
  («formasjonsbibliotek som lærings-/matchup-lag»).
- Auditen er **statisk**. Den beviser at limet finnes og er wiret, ikke at en
  faktisk klikk-sekvens i nettleseren produserer rett tilstand. En lett
  DOM-/jsdom-røyktest kan vurderes senere, men er bevisst utenfor scope her for å
  holde scriptene avhengighetsfrie (standardbibliotek).

## Konklusjon

Kroppen henger sammen. Alle 11 ledd i løkka er på plass og wiret, hele
eksisterende suiten er grønn, og en permanent flow-vakt er på plass for å fange
fremtidige brudd i limet. Klar for neste steg i veikartet (kampmotor /
match­forklaring v1.5).
