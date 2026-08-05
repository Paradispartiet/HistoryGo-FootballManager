import assert from "node:assert/strict";

import {
  DEFAULT_LEAGUE_FORMATION_ID,
  DEFAULT_LEAGUE_MATCH_PLAN_ID,
  selectDefaultFormation,
  selectDefaultMatchPlan
} from "../src/football-default-formation.js";
import { evaluateMatchdayReadiness } from "../src/football-matchday-readiness.js";
import { computeNextActions } from "../src/football-next-action.js";

const formations = [
  { id: "pre_modern_rush_118" },
  { id: "modern_4231" },
  { id: "modern_433" },
  { id: "classic_442" }
];

assert.equal(selectDefaultFormation({ mode: "league", availableFormations: formations }), DEFAULT_LEAGUE_FORMATION_ID);
assert.equal(selectDefaultFormation({ mode: "league", savedFormationId: "classic_442", availableFormations: formations }), "classic_442");
assert.equal(selectDefaultFormation({ mode: "league", savedFormationId: "missing", availableFormations: formations }), "modern_4231");
assert.equal(selectDefaultFormation({ mode: "scenario", scenarioFormationId: "pre_modern_rush_118", availableFormations: formations }), "pre_modern_rush_118");
assert.deepEqual(formations.map((item) => item.id), ["pre_modern_rush_118", "modern_4231", "modern_433", "classic_442"]);
assert.equal(selectDefaultFormation({ mode: "league", availableFormations: formations.filter((item) => item.id !== "modern_4231") }), "modern_433");
assert.equal(selectDefaultFormation({ mode: "league", availableFormations: [{ id: "classic_442" }] }), "classic_442");
assert.equal(selectDefaultMatchPlan({ availableMatchPlans: [{ id: "wide_433" }, { id: "central_possession_4231" }] }), DEFAULT_LEAGUE_MATCH_PLAN_ID);
assert.equal(selectDefaultMatchPlan({ savedMatchPlanId: "wide_433", availableMatchPlans: [{ id: "wide_433" }, { id: "central_possession_4231" }] }), "wide_433");

const completeXi = Array.from({ length: 11 }, (_, index) => ({ playerId: `p${index + 1}`, roleId: `r${index + 1}` }));
const readyInput = {
  dataLoaded: true,
  starterAssignments: completeXi,
  duplicatePlayerIds: [],
  unlockedPlayerCount: 15,
  benchCount: 4,
  hasTrainingChoice: true,
  selectedMode: "league",
  leagueSeasonActive: true,
  hasPlayableMatch: true,
  clubWeekBlocked: false,
  matchInProgress: false
};

assert.equal(evaluateMatchdayReadiness({ ...readyInput, starterAssignments: [] }).primaryBlocker.code, "lineup_incomplete");
assert.equal(evaluateMatchdayReadiness({ ...readyInput, benchCount: 3 }).primaryBlocker.code, "bench_incomplete");
assert.equal(evaluateMatchdayReadiness({ ...readyInput, duplicatePlayerIds: ["p1"] }).primaryBlocker.code, "duplicate_player");
assert.equal(evaluateMatchdayReadiness({ ...readyInput, hasTrainingChoice: false }).primaryBlocker.code, "training_missing");
assert.equal(evaluateMatchdayReadiness({ ...readyInput, leagueSeasonActive: false }).primaryBlocker.code, "season_inactive");
assert.equal(evaluateMatchdayReadiness({ ...readyInput, clubWeekBlocked: true }).primaryBlocker.code, "club_week_blocked");
assert.equal(evaluateMatchdayReadiness(readyInput).canStartMatch, true);
assert.equal(evaluateMatchdayReadiness({ ...readyInput, matchInProgress: true }).status, "in_progress");

const multiple = evaluateMatchdayReadiness({
  ...readyInput,
  starterAssignments: [],
  duplicatePlayerIds: ["p1"],
  benchCount: 0,
  unlockedPlayerCount: 0,
  hasTrainingChoice: false,
  leagueSeasonActive: false,
  hasPlayableMatch: false,
  clubWeekBlocked: true
});
assert.deepEqual(multiple.blockers.map((item) => item.code), [
  "lineup_incomplete",
  "duplicate_player",
  "bench_incomplete",
  "squad_too_small",
  "training_missing",
  "season_inactive",
  "club_week_blocked"
]);
assert.equal(multiple.primaryBlocker.code, "lineup_incomplete");

const baseNextAction = {
  selectedMode: "league",
  hasSession: false,
  roster: { enoughUnlocked: true, enoughBench: true, unlockedCount: 15 },
  lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: null, duplicate: null },
  clubWeekGate: { isBlocked: true, reason: "Kampdagfasen venter på kampen." },
  unreadThreads: 0,
  hasUnseenReport: false,
  leagueModeActive: true,
  leagueSeasonActive: true,
  leaguePreseasonReady: true,
  leaguePreseasonStep: null,
  clubWeek: { week: 1, phase: "matchday", phaseLabel: "Kampdag" }
};

const trainingBlocked = evaluateMatchdayReadiness({ ...readyInput, hasTrainingChoice: false });
const trainingAction = computeNextActions({
  ...baseNextAction,
  hasTrainingChoice: false,
  matchdayReadiness: trainingBlocked,
  matchdayReady: false
})[0];
assert.equal(trainingAction.title, "Velg treningsprogram");
assert.equal(trainingAction.action.tab, "trening");

const ready = evaluateMatchdayReadiness(readyInput);
const matchAction = computeNextActions({
  ...baseNextAction,
  hasTrainingChoice: true,
  matchdayReadiness: ready,
  matchdayReady: true
})[0];
assert.equal(matchAction.title, "Spill kamp");
assert.equal(matchAction.action.tab, "kamp");

console.log("Manager grunnflyt v1: formation, readiness and next-action checks passed.");
