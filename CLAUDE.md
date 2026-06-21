# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core design principle (non-negotiable)

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
> ("Every player is good enough. The question is whether the manager understands them.")

This is **not** a rating game. `overall` describes a player's class, not their match value. A lower-`overall` player can outperform a higher one if used in the right position, role, tactic and relational pattern. Misuse must always be explained as a **manager error**, never a player weakness. Do not add features that turn the project into a conventional rating game — `overall` must never decide an outcome alone. Role fit, tactic fit, position fit, relationships, team balance and misuse penalties must weigh more heavily.

The codebase, docs, comments, commit history and data are written in **Norwegian**. Follow that convention when editing user-facing text, data labels and comments.

## Commands

There is **no test framework and no test runner**. Verification is done by standalone read-only Node scripts under `scripts/` (standard library only, no dependencies). Each script exits `1` on failure, `0` on success — treat them as the test suite.

```bash
npm run typecheck          # tsc --noEmit — type-check the TS engine
npm run build              # tsc — compile src/**/*.ts to dist/

# Data audits (validate JSON schemas / referential integrity)
npm run audit:knowledge        # football_knowledge_principles.json (also run in CI)
npm run audit:hg-football      # data/hgFootball/ historical formation module
npm run audit:hg-historical-fit
npm run audit:hg-coach-context

# UI-/flyt-vakter (statisk, leser index.html + src/app.js, also run in CI)
npm run check:dom-ids          # querySelector("#id")-oppslag finnes i index.html
npm run audit:flow             # hele spilløkka (start → mini-sesong) er wiret

# Simulations (exercise the live JS engines end-to-end, no DOM/localStorage)
npm run sim:matchday           # matchday session loop (football-matchday-engine.js)
npm run sim:mini-season        # mini-season loop
npm run sim:training-week      # weekly training focus
```

Run a single script directly, e.g. `node scripts/simulate-matchday-v02.mjs`. When you change a live engine in `src/*.js`, run the matching `sim:*` / `audit:*` script; when you change a JSON data file, run the matching `audit:*` script. **CI runs `typecheck`, `audit:knowledge`, `check:dom-ids`, `audit:flow` and `build`** (`.github/workflows/pages.yml`), so the other scripts must be run manually.

### Running the app

Static HTML/CSS/JS, no framework, no bundler. Opening `index.html` directly fails because JSON is loaded via `fetch`; serve it instead:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Pushing to `main` deploys the whole repo to GitHub Pages.

## Architecture: two parallel layers

The single most important thing to understand is that this repo contains **two independent engine layers** that must not be conflated.

### 1. Live legacy app (vanilla JS, no build step)

`index.html` loads `src/app.js` and `src/hg-formation-library.js` as native ES modules. This is the **actually-running product**. `src/app.js` (~8.5k lines) is the controller; it `fetch`es the `data/*.json` files and orchestrates a set of pure `.js` engines:

- `football-fit-engine.js` — individual player fit (positionFit, roleFit, tacticFit, misusePenalty, matchScore).
- `football-team-fit-engine.js` — whole-team fit (`calculateTeamFit`): balance, width, depth, build-up, press, rest-defence, relationships, badge effects, duplicates.
- `football-relationship-engine.js` — whether roles support or block each other (`calculateRoleRelationships`).
- `football-badge-effect-engine.js` — badge bonuses nudged on top of base metrics.
- `football-matchday-engine.js` — matchday session loop (events → decisions → report), opponent profiles.
- `football-mini-season.js`, `football-match-consequences.js`, `football-training-week.js` — mini-season, Club Week consequences, weekly training focus.
- `hg-formation-library.js`, `hg-football-formation-adapter.js`, `hg-football-coach-context-engine.js`, `hg-football-historical-fit-engine.js` — the historical formation library (`data/hgFootball/`) and its adapters.

These `.js` files are plain ESM and run unbuilt in the browser **and** in the `scripts/*.mjs` simulations.

### 2. TypeScript "manager core" engine (compiled to `dist/`)

`src/domain/`, `src/engine/`, `src/sample/` and `src/index.ts` are a separate, stricter rebuild of the manager brain. It is **pure and data-driven**: it must not read the DOM, manipulate HTML, touch `localStorage`, `fetch`, import `src/app.js`, or mutate legacy data. UI passes data in; the engine returns structured output.

It contains **two computation paths**, but the live UI is now driven by one of them:

- **The faithful legacy ports (the live brain)** — TS ports of the `.js` engines, parity-tested to byte-identical output: `calculatePlayerMatchFit.ts` (individual fit), `calculateRoleRelationships.ts`, `calculateBadgeMetricEffects.ts`, `calculateHistoricalFormationFit.ts`, `buildCoachContext.ts`, and `calculateTeamFit.ts` (the assembly wiring them into a legacy-shaped `teamFit`). **`calculateTeamFit` is what `app.js`'s `getTeamFit()` runs at runtime** (see below). On top of it sit teamFit-derived view helpers — `recommendRoleChangesFromTeamFit.ts`, `analyzeWeakPointsFromTeamFit.ts`, `createTeamFitManagerInsight.ts` (summary + top actions), `createTrainingFocusFromTeamFit.ts` — that use the *same* `matchScore`/metrics as the lineup. So this path is the single source of truth for the headline score panel, report, lineup, side panel, decisions, matchday **and** the manager-detail panel's assessment (summary, top actions, role changes, weak points, training focus).
- **The structured dashboard pipeline** — a stricter rebuild over `src/domain/footballTypes.ts` (`calculateRoleFit` → `calculateTeamBalance` → `evaluateTeamSetup` → `analyzeWeakPoints`/`recommendRoleChanges`/`createTrainingFocus` → `createManagerInsight` → `createManagerDashboardData` → `createManagerDashboardViewModel` → `createManagerAppState`). It computes scores differently (`setupScore` vs legacy `teamScore`) and **no longer drives the team assessment**. It now powers only the separate **knowledge sub-feature** (`createFootballKnowledgeRecommendations` + active knowledge focus + training history), which matches football principles by structured weak-point codes and is left on this pipeline deliberately. It also remains the parity-tested rebuild exercised by `src/sample/`.

`src/index.ts` is the public surface — every engine type and function is re-exported there; **sample files must not be exported from it**. `src/domain/footballTypes.ts` is the shared type contract and must stay logic-free.

### The bridge between the two layers

`src/engine/adaptLegacyFootballData.ts` translates the legacy JSON schema (`naturalPositions`, `poorFits`, `preferredRoles`, `likesTactics`, …) into the TS domain types without mutating it. `createLegacyManagerAppState.ts` chains that into the structured pipeline. At runtime, `src/app-manager-engine-bridge.js` resolves the built engine: `init()` calls `preloadManagerEngine()` (a one-time lazy `import("../dist/index.js")`) so the engine is available **synchronously** for the rest of the session via `getLoadedManagerEngine()`. `getTeamFit()` then runs the TS `calculateTeamFit` when loaded and **falls back to the legacy `.js` engine when `dist/` is absent** — output is byte-identical either way, so the legacy demo still works unbuilt. The TS engine is therefore the live source of truth for `teamFit` when built, with legacy as a transparent fallback.

`src/sample/elite433Sample.ts` is a hand-built 11-player 4-3-3 used to exercise the TS engine without legacy data; the `read*Sample.ts` files produce readable output from each pipeline stage.

## Data model & conventions

`data/*.json` is the source of truth — **never hardcode players, roles, formations or coordinates in `app.js` or the UI**. Files carry a `schema`/`version` field (e.g. `historygo-football-manager.players.v2`). Key referential rules enforced by the audits and expected of new data:

- Player role/archetype references must point at existing role/archetype ids. Player unlocks must point at real **player** ids, not archetype ids.
- Players should sit in the high-class band (≈85–100). There are no "bad" players by design.
- `data/hgFootball/` is an **additive** historical module under its own schema namespace `history-go.hg-football.*`, living beside the `historygo-football-manager.*` files. Load it via its `manifest.json`; every formation must define all six phase shapes (base / inPossession / outOfPossession / press / lowBlock / restDefence). Read `data/hgFootball/README.md` and `README_HGFM_DATA_V1.md` before touching it.

### Core game loop (unlocks)

```
Sted → Person → Ekspertise → Trening → Badge → Lagklasse
(Place → Person → Expertise → Training → Badge → Team class)
```

Players/staff are **not** freely available — they are gated by real History Go progression read from `localStorage` (`visited_places`, `hg_groundhopper_stats_v1`). Available players come from `player_candidate` unlocks on collected places. The optional **local start squad** (15 nearest qualified players, see `docs/local-start-squad.md`) is a playable shortcut that must integrate into `computeAvailability()` and must **never** write to `visited_places` / `hg_groundhopper_stats_v1` or hardcode player data.

## Git workflow

- Develop on the assigned feature branch; create it locally if absent. Never push to `main` without explicit permission (pushing to `main` triggers a Pages deploy).
- Push with `git push -u origin <branch>`. Do not open a PR unless explicitly asked.
- The legacy demo must keep working: build the TS engine alongside it, don't tear it down.
