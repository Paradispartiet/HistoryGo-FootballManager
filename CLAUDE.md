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
npm run audit:knowledge          # football_knowledge_principles.json
npm run audit:clubs              # data/football_clubs.json (seriepyramiden)
npm run audit:ci-coverage        # kjører CI-workflowene faktisk hele suiten?
npm run audit:hg-football        # data/hgFootball/ historical formation module
npm run audit:hg-historical-fit
npm run audit:hg-coach-context
npm run audit:hg-formation-knowledge   # data/hgFootball/formationKnowledge.json
npm run audit:historical-opponents     # historical opponent archetypes
npm run audit:tournaments              # data/football_tournaments.json (EM/VM)
npm run audit:tactics                  # data/football_tactics.json (kampplaner)
npm run audit:scenarios                # data/football_scenarios.json (scenarioer)

# UI-/flyt-vakter (statisk, leser index.html + src/app.js)
npm run check:syntax           # alle live JS-moduler parser (fanger død kode som «ser riktig ut»)
npm run check:dom-ids          # querySelector("#id")-oppslag finnes i index.html
npm run audit:flow             # hele spilløkka (start → mini-sesong) er wiret
npm run audit:dead-ends        # ingen blindveier i første spillbare løkke («Senere»-flater, ankre, gating, menykontrakt)

# Simulations (exercise the live JS engines end-to-end, no DOM/localStorage)
npm run sim:matchday           # matchday session loop (football-matchday-engine.js)
npm run sim:mini-season        # mini-season loop
npm run sim:tournament         # EM/VM i landslagsmodus (gruppespill → finale)
npm run sim:match-plan         # kampplaner som strategi + bytte underveis
npm run sim:player-stats       # spillerstatistikk: hvem scoret, hvem la den fram
npm run sim:substitutions      # innbytte underveis: benken kommer på banen
npm run sim:player-condition   # form og slitasje mellom kampene (inkl. balansen)
npm run sim:scenarios          # scenarioene former hvem du møter
npm run sim:season-review      # styrets dom, merittlista og sesongskiftet
npm run sim:federation-verdict # forbundets dom etter EM/VM
npm run sim:pitch-layout       # brikkefordelingen på taktikktavla (alle formasjoner)
npm run sim:training-week      # weekly training focus
npm run sim:training-plan      # ukas plan: ramme + tema + individuell, og samsvaret mellom dem
npm run sim:individual-training # individuell oppfølging av én spiller
npm run sim:player-weaknesses  # svake sider: identifisering, trening og uttelling
npm run sim:formation-matchup  # formation-vs-formation knowledge engine
npm run sim:suggested-setups   # self-explaining suggested setups
npm run sim:training-programs   # weekly training-program compositions
npm run sim:off-pitch          # off-pitch context parameters
npm run sim:inbox              # inbox events wired to the context engines
npm run sim:club-week          # Club Week consequences loop
npm run sim:league-season      # seriepyramiden: 16 lag/30 runder, terminliste, opp- og nedrykk
```

Run a single script directly, e.g. `node scripts/simulate-matchday-v02.mjs`. When you change a live engine in `src/*.js`, run the matching `sim:*` / `audit:*` script; when you change a JSON data file, run the matching `audit:*` script.

**Two CI workflows** (`.github/workflows/`):
- `pages.yml` (push to `main`) runs the core gate then deploys: `typecheck`, `audit:knowledge`, `check:syntax`, `check:dom-ids`, `audit:flow`, `audit:dead-ends`, `audit:historical-opponents`, `audit:tournaments`, `audit:tactics`, `build`.
- `ci.yml` (PRs + every non-`main` branch push) is the safety net that runs the **whole** suite — all `audit:*`, `check:*`, `build` **and** every `sim:*` script. That claim used to be false: 15 of 48 scripts were never listed, including the entire league guard, so they only ran when someone ran them by hand. `audit:ci-coverage` now compares `package.json` against both workflows and fails if a script is missing from `ci.yml` or if the pages gate loses one of its core checks — add a script, and CI must list it.

So on a feature branch, expect the full suite to gate your PR; run the relevant scripts locally before pushing.

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
- `football-match-explanation-engine.js` — takes the finished matchday result + session snapshots and builds a structured, pedagogical explanation of **why** the outcome happened.
- `football-historical-opponent-profiles.js` — opponents are historical style-teams (taktiske arketyper) used as learning opponents, not generic bots. **League clubs are NOT archetypes** — they play their own club tradition, from `data/football_league_club_profiles.json` (the club owns identity and strength; the profile owns the football). Giving them historical archetypes was tried and reverted: it made Molde "be" Barcelona 2008–12, and burned the archetypes that scenarios exist for. Before either, the lookup searched for the *club id* among the five generic profiles where it could never match, so all 14 league rounds silently used the same profile. `sim:league-season` walks a whole season and asserts 7 distinct club styles, no `archetypeId` on any club profile, and that the match brief distinguishes club style from historical archetype. See `docs/liga-arketyper.md`.
- `football-mini-season.js`, `football-match-consequences.js`, `football-training-week.js` — mini-season, Club Week consequences, weekly training focus.
- `football-league-season.js` — the league as it is actually played: **Eliteserien 16 clubs / 30 rounds**, OBOS-ligaen the same, 2. divisjon two groups of 14 / 26 rounds, with **promotion and relegation** between them. The pyramid (60 clubs, tiers, promotion/relegation rules) is data — `data/football_clubs.json` — and the engine takes it in; it does not own it. The club owns identity and level, the profile owns the football, and the short style label lives **only** in the profile (it used to live on the club, in a different file from the football it described, and drifted). The fixture generator was rewritten because the old home/away rule gave every club a **fourteen-match** venue streak at 16 clubs; `longestVenueRun()` is exported because it is the measurement that caught it. See `docs/seriepyramiden.md`; guarded by `audit:clubs` and `sim:league-season`.
- `football-training-program-compositions.js` — full weekly training **programs** (multi-session compositions) layered on top of the single-focus training week, each self-explaining.
- `football-training-plan.js` — the one model that binds the training layers into **one week with four steps**: Inbox (signals) → Program (the week's *frame*, i.e. load) → Focus (the *match theme*, i.e. metric bonus) → Individual. Its central rule is that the focus should sit *inside* the chosen program; a mismatch costs a point of metric bonus and is explained as a manager decision. It also normalises the programs' own `fatigueLoad` (6–19 per week) into the recovery input — those numbers existed but were never read. See `docs/trening.md`.
- `football-player-weaknesses.js` — every player has weak sides, and they are *why* position/role fit matters. **Identified from data that already existed** (`role.requires` + data-authored `positionDemands`, minus the player's `strengths`, with `coveredBy` handling overlapping tokens) — never invented claims about a real footballer. A weakness **never subtracts** from anything: the only number it can produce is a small capped bonus (max +4), and only when the manager has *trained* it **and then played him in a role that demands it*. Training opens doors; it does not raise class. See `docs/svake-sider.md`.
- `football-individual-training.js` — per-player training beside the team session: role drills (builds role familiarity), personal recovery, sharpness, rehab. **No track touches `overall` or `matchScore`** — they change what a player *fits*, not how good he is. Catalogue is data (`data/football_individual_training.json`); capacity is `1 + relevant staff`, capped at 5 and never zero.
- `football-suggested-setups.js` — self-explaining 2–4 logical setups (formation / match plan / training week) that advise without replacing the manager's own choice.
- `football-off-pitch-parameters.js` — the human context layer: fatigue, injury risk, morale, confidence, autonomy, dressing-room mood, media/board/family pressure, hidden mental state.
- `football-federation-verdict.js` — the federation's verdict after a tournament. Unlike the club, the expectation comes from the **nation's strength**: a semi-final is a triumph with a minnow and a failure with Brazil. Same warning-before-sacking shape. See `docs/forbundsdom.md`.
- `football-season-review.js` — the board's verdict after 14 rounds: a **numeric** table target that grows one step per season, the verdict, board-trust consequence, warning-before-sacking, and the merit archive. Every reason points at a manager decision, never at the players. See `docs/sesongdom.md`.
- `football-player-condition.js` — load, freshness, form and injuries **between** matches. Never reads `overall`; every explanation points at how the manager used the player. Injuries never make the starting XI unfillable. See `docs/form-og-slitasje.md`.
- `football-substitutions.js` — substitutions during a match. The incoming player takes the **slot** (position + role) of the one going off and is measured on how well he fits *there* — never on `overall`. Bench fit against all eleven slots is computed once at kickoff. See `docs/innbytte.md`.
- `football-player-stats.js` — attributes goals and assists to players from the lineup snapshot, weighted by **position, role and fit — never `overall`** — and aggregates the season table. See `docs/statistikk.md`.
- `football-inbox-events.js` — wires the Inbox ("Klubbens puls") to the context engines (off-pitch params, training programs, matchday, decisions), turning a static UI into live events.
- `football-relationship-metric-ui.js` — thin UI bridge that surfaces the relationship score (engine lives in `football-relationship-engine.js`) without touching `app.js`.
- `hg-formation-library.js`, `hg-football-formation-adapter.js`, `hg-football-coach-context-engine.js`, `hg-football-historical-fit-engine.js` — the historical formation library (`data/hgFootball/`) and its adapters.

These `.js` files are plain ESM and run unbuilt in the browser **and** in the `scripts/*.mjs` simulations.

### 2. TypeScript "manager core" engine (compiled to `dist/`)

`src/domain/`, `src/engine/`, `src/sample/` and `src/index.ts` are a separate, stricter rebuild of the manager brain. It is **pure and data-driven**: it must not read the DOM, manipulate HTML, touch `localStorage`, `fetch`, import `src/app.js`, or mutate legacy data. UI passes data in; the engine returns structured output.

It contains **two computation paths**, but the live UI is now driven by one of them:

- **The faithful legacy ports (the live brain)** — TS ports of the `.js` engines, parity-tested to byte-identical output: `calculatePlayerMatchFit.ts` (individual fit), `calculateRoleRelationships.ts`, `calculateBadgeMetricEffects.ts`, `calculateHistoricalFormationFit.ts`, `buildCoachContext.ts`, and `calculateTeamFit.ts` (the assembly wiring them into a legacy-shaped `teamFit`). **`calculateTeamFit` is what `app.js`'s `getTeamFit()` runs at runtime** (see below). On top of it sit teamFit-derived view helpers — `recommendRoleChangesFromTeamFit.ts`, `analyzeWeakPointsFromTeamFit.ts`, `createTeamFitManagerInsight.ts` (summary + top actions), `createTrainingFocusFromTeamFit.ts` — that use the *same* `matchScore`/metrics as the lineup. So this path is the single source of truth for the headline score panel, report, lineup, side panel, decisions, matchday **and** the manager-detail panel's assessment (summary, top actions, role changes, weak points, training focus).
- **The structured dashboard pipeline** — a stricter rebuild over `src/domain/footballTypes.ts` (`calculateRoleFit` → `calculateTeamBalance` → `evaluateTeamSetup` → `analyzeWeakPoints`/`recommendRoleChanges`/`createTrainingFocus` → `createManagerInsight` → `createManagerDashboardData` → `createManagerDashboardViewModel` → `createManagerAppState`). It computes scores differently (`setupScore` vs legacy `teamScore`) and **no longer drives the team assessment**. It now powers only the separate **knowledge sub-feature** (`createFootballKnowledgeRecommendations` + active knowledge focus + training history), which matches football principles by structured weak-point codes and is left on this pipeline deliberately. It also remains the parity-tested rebuild exercised by `src/sample/`.

Alongside these two paths sit a few **additive TS engines** with their own scopes: the Formation Knowledge engine (`evaluateFormationMatchup.ts` + `compareFormations.ts` / `compareTactics.ts`, audited by `audit:hg-formation-knowledge`, simulated by `sim:formation-matchup`), `createTeamSetupReport.ts` (the report view model), and `createClubWeekState.ts` (Club Week engine). These are pure and re-exported from `src/index.ts` like the rest.

`src/index.ts` is the public surface — every engine type and function is re-exported there; **sample files must not be exported from it**. `src/domain/footballTypes.ts` is the shared type contract and must stay logic-free. `src/domain/footballKnowledgeTypes.ts` holds the knowledge sub-feature's types. For the long-form rationale, see `docs/ENGINE_ARCHITECTURE.md` (the live overview here in CLAUDE.md supersedes its historical "status"/"next steps" sections).

### The bridge between the two layers

`src/engine/adaptLegacyFootballData.ts` translates the legacy JSON schema (`naturalPositions`, `poorFits`, `preferredRoles`, `likesTactics`, …) into the TS domain types without mutating it. `createLegacyManagerAppState.ts` chains that into the structured pipeline. At runtime, `src/app-manager-engine-bridge.js` resolves the built engine: `init()` calls `preloadManagerEngine()` (a one-time lazy `import("../dist/index.js")`) so the engine is available **synchronously** for the rest of the session via `getLoadedManagerEngine()`. `getTeamFit()` then runs the TS `calculateTeamFit` when loaded and **falls back to the legacy `.js` engine when `dist/` is absent** — output is byte-identical either way, so the legacy demo still works unbuilt. The TS engine is therefore the live source of truth for `teamFit` when built, with legacy as a transparent fallback.

`src/sample/elite433Sample.ts` is a hand-built 11-player 4-3-3 used to exercise the TS engine without legacy data; the `read*Sample.ts` files produce readable output from each pipeline stage.

## Data model & conventions

`data/*.json` is the source of truth — **never hardcode players, roles, formations or coordinates in `app.js` or the UI**. Files carry a `schema`/`version` field (e.g. `historygo-football-manager.players.v2`). Key referential rules enforced by the audits and expected of new data:

- Player role/archetype references must point at existing role/archetype ids. Player unlocks must point at real **player** ids, not archetype ids.
- Players should sit in the high-class band (≈85–100). There are no "bad" players by design.
- `data/hgFootball/` is an **additive** historical module under its own schema namespace `history-go.hg-football.*`, living beside the `historygo-football-manager.*` files. Load it via its `manifest.json`; every formation must define all six phase shapes (base / inPossession / outOfPossession / press / lowBlock / restDefence). Read `data/hgFootball/README.md` and `README_HGFM_DATA_V1.md` before touching it.
- The Inbox ("Klubbens puls") is data-driven too: `data/club_inbox_*.json` plus the `club_inbox_messages/`, `club_inbox_replies/`, `club_inbox_choices/` directories, each loaded via a `manifest.json` and keyed by sender. New messages/replies/choices go in these files, not in `app.js`.

### Core game loop (unlocks)

```
Sted → Person → Ekspertise → Trening → Badge → Lagklasse
(Place → Person → Expertise → Training → Badge → Team class)
```

Players/staff are **not** freely available — they are gated by real History Go progression read from `localStorage` (`visited_places`, `hg_groundhopper_stats_v1`). Available players come from `player_candidate` unlocks on collected places. The optional **local start squad** (15 nearest qualified players, see `docs/local-start-squad.md`) is a playable shortcut that must integrate into `computeAvailability()` and must **never** write to `visited_places` / `hg_groundhopper_stats_v1` or hardcode player data.

The game must stay playable **relatively independently of History Go** — History Go is where you *collect*, not a precondition for playing. Every mode therefore has a playable base, with the collection as the upside. Two rules follow, and both are audited:

- **Club vs national players.** A place whose `placeRole` contains `national` (Ullevaal, Maracanã) never hands players to your club side — one visit must not secure a nation's best. Those players are *scouted*, and playable only in national-team mode.
- **No empty starting XI.** `findBestAvailablePlayerForSlot()` ends in an "any free player" tier. When a formation demands more of a position than the squad has (1-1-8 with eight forwards), misuse is the correct outcome — the engine flags and explains it. Leaving slots unfillable would be a dead end, and contradicts the core principle.

### Modes

`src/football-mode-sessions.js` is the single owner of the active mode and of per-mode session snapshots: `league`, `national`, `scenario`, `training`. Secondary modes never write into the league save. **Landslagsmodus** (national-team mode) is where the scouted national-arena players are actually played — its squad is the nation's base tier plus whatever you have collected, filtered by the chosen nation. See `docs/landslagsmodus.md`; guarded by `sim:mode-isolation`, `audit:flow` (stage 13) and `audit:dead-ends` (stage 13).

The `training` mode id is a **storage name only** — in the UI it is **Fotballvitenskap**, a learn-about-football module that opens the historical formation library and is deliberately *outside* the game. It must never route into the team's Trening screen.

What national mode plays *for* is a tournament: **EM and VM** (`src/football-tournament.js` + `data/football_tournaments.json`) — group stage into knockouts, opponents being nations that play as the existing historical style archetypes. Like the mini-season and league-season engines, it never simulates the manager's own match: it consumes the Kampdag result and only decides the tournament's progression. See `docs/mesterskap.md`; guarded by `sim:tournament`, `audit:tournaments` and `audit:flow` (stage 14).

### Navigation contract

The primary nav is exactly **Kontor → Trening → Taktikk → Kamp → Analyse → Statistikk**, in that order, and no label may point at a section its name does not describe. Office surfaces (Speiding, Stab, Assistentråd, Klubbrom, Styret, Fasiliteter) live *on* Kontor as department cards, not as their own tabs — `data-tab-parent` on the section tells `highlightActiveTab()` which tab to light up. Scenarioer is a mode reached from the onboarding page, never a tab inside the league game. The scenario catalogue is data (`data/football_scenarios.json`) — six curated five-match challenges built from the existing historical archetypes; never hardcode a scenario card in `index.html`. See `docs/scenarioer.md`.

Each nav tab carries `data-nav-modes` (which modes show it) and optionally `data-nav-section-modes` (which modes may have the surface open at all); `applyModeScopedNav()` in `renderModeIsolation` enforces both. See `docs/meny.md`; guarded by `audit:dead-ends` stage 17.

Two primary tabs are split into sub-tabs, sharing **one** strip (`#appSubnav`, `renderSubtabs()`): each button carries `data-subnav-parent` naming its primary tab, and only that group is shown. Adding sub-tabs to another tab is markup only — never add a second strip, since each strip needs its own body-grid row (see below).

**Taktikk** is split into *Oppstilling · Tropp & benk · Systemet* — the board is where you work; the squad and the system panel are lookups you go to, not things that lengthen the pitch page.

Kontor is **not one page**: it covers *Oversikt · Assistentråd · Speiding · Klubbutvikling · Stab & drift · Fasiliteter · Klubbrom · Styret*. Each is a real section with `data-tab-parent="dashboard"`; the strip only shows when the active surface's parent actually has sub-tabs. The old department card grid is gone — don't re-add it. **Klubbutvikling** is the History Go chain (Sted → Person → Ekspertise → Utviklingsprogram → Badge → Lagklasse) shown as the chain it is; note that HG badge progressions are called **utviklingsprogrammer**, never "treningsprogrammer", so *trening* means exactly one thing in the UI.

`body` is a grid with **explicitly assigned rows** — one per frame part (header, main nav, mode bar, office sub-nav, screen area, footer). A selector that matches two frame parts (a bare `body > nav`) silently stacks them and collapses the screen area. Guarded by `audit:dead-ends` stage 16.

**No function in two places** (audited by `audit:dead-ends` stage 27): no popup that duplicates the primary nav, no surface with two buttons to the same target, no duplicate ids, no modal opened from two triggers. Staff lists live on *Stab & drift*, places on *Speiding*, the quick-start flow inside Oversikt's pre-season panel — not as shortcut popups somewhere else.

Kontor is the office, not a dashboard: **do not re-add summary boxes there.** Club identity lives in the site header, league standing and the board's expectation live on Statistikk, and mode switching lives in Innstillinger. The Klubbuke phase pills are navigation — each opens the surface that phase happens on (`CLUB_WEEK_PHASE_TABS`).

Tab surfaces scroll — they must not shrink. `.app-shell > .tab-section` is a fixed-height column flexbox, so its children need `flex: 0 0 auto` or they get crushed instead of scrolled (`.dept-hero` has `overflow: hidden` and collapsed to 38px of padding). Guarded by `audit:dead-ends` stage 16.

### Scale mismatches (the bug class that keeps recurring)

**A clamp that always bites is a scale mismatch.** Data and code can each look correct while disagreeing about units, and no existing guard sees it:

- `intensity` in `data/football_tactics.json` is **30–100**; `getMatchIntensityFactor()` clamped it into `[0.6, 1.6]`, so every match plan became maximum intensity and injuries were ~10× too common.
- `getSquadFatiguePenalty()` produced up to 18 against a `[0, 6]` clamp, so a tired squad and a burnt-out squad scored identically.
- `applyWeeklyPlayerRecovery()` read `fatigueLoad`/`intensity` off a training focus — fields that don't exist — and silently did nothing.

When you feed a data value into a bounded engine input, **normalise explicitly against the source range** (`(value - min) / (max - min) * cap`) rather than letting the clamp do the work. Then measure: run the real data through the mapping and check that the outputs spread across the range instead of piling on the ceiling. `sim:player-condition` stage 11 does exactly this and is the template for new mappings.

## Git workflow

- Develop on the assigned feature branch; create it locally if absent. Never push to `main` without explicit permission (pushing to `main` triggers a Pages deploy).
- Push with `git push -u origin <branch>`. Do not open a PR unless explicitly asked.
- The legacy demo must keep working: build the TS engine alongside it, don't tear it down.
