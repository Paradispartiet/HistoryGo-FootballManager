// Falsifiable team-fit sensitivity across real formation/role definitions.
// Synthetic player profiles are controlled fixtures; they are NOT historical claims.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateTeamFit } from "../src/football-team-fit-engine.js";
import { calculateMatchStrength, createMatchdaySession, advanceMatchClock, simulateMatchday } from "../src/football-matchday-engine.js";
import { evaluatePlanVsOpponent } from "../src/football-match-plan.js";
import { HISTORICAL_OPPONENT_PROFILES } from "../src/football-historical-opponent-profiles.js";
import { TACTICAL_SEQUENCES } from "../src/football-tactical-sequences.js";

const read = (file) => JSON.parse(readFileSync(new URL("../data/" + file, import.meta.url), "utf8"));
const formations = read("football_formations.json").formations;
const roles = read("football_roles.json").roles;
const tactics = read("football_tactics.json").tactics;
const roleById = new Map(roles.map(role => [role.id, role]));
const canonicalIds = new Set(TACTICAL_SEQUENCES.map(sequence => sequence.tacticId));
const modes = ["safe", "press", "depth", "width", "build_up"];
const signals = ["balanceScore", "widthScore", "depthScore", "buildUpScore", "pressScore", "restDefenseScore"];
assert.equal(tactics.length, 18, "exercise every authored tactic");
assert.equal(canonicalIds.size, tactics.length, "exercise the canonical v6 plans only");
assert.ok(tactics.every(tactic => canonicalIds.has(tactic.id)));
assert.equal(formations.length, 5, "review new formation catalog changes deliberately");
assert.equal(HISTORICAL_OPPONENT_PROFILES.length, 12);

// Prefer lawful positional roles; all role changes use the same eleven players.
const safe = {
  GK: "line_keeper", CB: "stopper", LB: "support_fullback", RB: "support_fullback",
  WB: "wingback", DM: "balancing_six", CM: "holding_midfielder",
  AM: "classic_ten", LW: "free_creator", RW: "free_creator", ST: "linking_striker"
};
const overrides = {
  safe: {},
  press: { ST: "pressing_forward", DM: "pressing_midfielder", CM: "pressing_midfielder", AM: "pressing_midfielder" },
  depth: { ST: "channel_runner", LW: "wide_dribbler", RW: "wide_dribbler" },
  width: { LB: "overlapping_fullback", RB: "overlapping_fullback", WB: "overlapping_fullback",
    DM: "regista", CM: "deep_playmaker", LW: "wide_dribbler", RW: "wide_dribbler" },
  build_up: { GK: "sweeperkeeper", CB: "ball_playing_centre_back",
    DM: "deep_playmaker", CM: "deep_playmaker" }
};
const naturalByIndex = Array.from({length: 11}, (_, index) => [...new Set(formations.map(f => f.slots[index].position))]);
const players = naturalByIndex.map((positions, index) => ({
  id: "matrix-player-" + index,
  name: "Syntetisk testspiller " + (index + 1),
  naturalPositions: positions, usablePositions: [], poorFits: [],
  preferredRoles: roles.filter(role => role.validPositions.some(position => positions.includes(position)))
    .map(role => role.id),
  needs: [], likesTactics: [], dislikesTactics: [], archetypes: [],
  strengths: [], classHeight: 85, warningWhenMisused: "",
  attributes: { values: {}, provenance: {} }
}));
function fixture(formation, tactic, mode, roster = players) {
  const lineup = Object.fromEntries(formation.slots.map((slot, index) => {
    const chosenId = overrides[mode][slot.position] || safe[slot.position];
    const role = roleById.get(chosenId);
    assert.ok(role?.validPositions.includes(slot.position),
      formation.id + "/" + mode + ": invalid role " + chosenId + " at " + slot.slotId);
    return [slot.slotId, { playerId: roster[index].id, roleId: chosenId }];
  }));
  const fit = calculateTeamFit({ lineup, formation, tactic, players: roster, roles });
  assert.equal(fit.completeCount, 11, formation.id + "/" + tactic.id + "/" + mode);
  assert.equal(fit.totalSlots, 11);
  assert.equal(fit.duplicatePlayers.length, 0);
  assert.equal(new Set(fit.assignments.map(a => a.player?.id)).size, 11);
  assert.ok(fit.assignments.every(a => a.isComplete && Number.isFinite(a.fit?.matchScore)));
  for (const key of signals) {
    assert.ok(Number.isFinite(fit.metrics[key]) && fit.metrics[key] >= 0 && fit.metrics[key] <= 100,
      formation.id + "/" + tactic.id + "/" + mode + ": invalid " + key);
  }
  return fit;
}
const formation433 = formations.find(f => f.id === "4-3-3");
const effects = [];
for (const tactic of tactics) {
  const modesFor433 = Object.fromEntries(modes.map(mode => [mode, fixture(formation433, tactic, mode)]));
  const baseline = modesFor433.safe.baseMetrics;
  // Isolated football mechanisms: changing roles has both a benefit and a cost.
  assert.ok(modesFor433.press.baseMetrics.pressScore > baseline.pressScore,
    tactic.id + ": pressing roles must affect first-line pressure");
  assert.ok(modesFor433.depth.baseMetrics.depthScore > baseline.depthScore,
    tactic.id + ": running roles must affect attacking depth");
  assert.ok(modesFor433.width.baseMetrics.widthScore > baseline.widthScore,
    tactic.id + ": wide roles must actually stretch the field");
  assert.ok(modesFor433.build_up.baseMetrics.buildUpScore > baseline.buildUpScore,
    tactic.id + ": pass support must affect build-up");
  assert.ok(modesFor433.width.baseMetrics.restDefenseScore < baseline.restDefenseScore,
    tactic.id + ": overlapping fullbacks without a holding pivot must expose rest defence");
  assert.ok(modesFor433.width.baseMetrics.balanceScore < baseline.balanceScore,
    tactic.id + ": attacking flank overload must cost midfield balance");
  effects.push({ plan: tactic.id,
    pressure: modesFor433.press.baseMetrics.pressScore - baseline.pressScore,
    depth: modesFor433.depth.baseMetrics.depthScore - baseline.depthScore,
    width: modesFor433.width.baseMetrics.widthScore - baseline.widthScore,
    buildUp: modesFor433.build_up.baseMetrics.buildUpScore - baseline.buildUpScore,
    restRisk: baseline.restDefenseScore - modesFor433.width.baseMetrics.restDefenseScore });
}

// Full cross-product: 18 tactics × 5 canonical formations × 5 role setups × 12
// historical style archetypes. This checks INTEGRATION, not empirical win rates.
let pairChecks = 0;
let sessionChecks = 0;
const observed = new Map(tactics.map(t => [t.id, new Set()]));
for (const tactic of tactics) {
  for (const formation of formations) {
    for (const mode of modes) {
      const fit = fixture(formation, tactic, mode);
      const strength = calculateMatchStrength({ teamFit: fit, formation });
      const profile = strength.tacticalProfile;
      for (const key of signals) {
        assert.equal(profile[key], fit.metrics[key],
          tactic.id + "/" + formation.id + ": source fit lost " + key);
      }
      for (const opponent of HISTORICAL_OPPONENT_PROFILES) {
        const direct = evaluatePlanVsOpponent(tactic, opponent, { tacticalProfile: profile });
        assert.ok(Number.isFinite(direct.edge), tactic.id + "/" + opponent.id);
        assert.ok(direct.opportunities.every(opportunity => opportunity.readiness !== "unknown"),
          "complete real XI must have known team metrics");
        assert.deepEqual(direct, evaluatePlanVsOpponent(tactic, opponent, { tacticalProfile: profile }),
          "identical tactical inputs must yield identical explanation");
        observed.get(tactic.id).add(direct.edge);
        pairChecks += 1;
      }
      // The actual match session, not only preview, must consume the same
      // formation/role-derived team metrics and matchup evidence.
      if (mode === "safe" || mode === "width") {
        const opponent = HISTORICAL_OPPONENT_PROFILES[0];
        const live = createMatchdaySession({ teamFit: fit, formation, tactic, opponent });
        const direct = evaluatePlanVsOpponent(tactic, opponent,
          { tacticalProfile: live.teamFitSnapshot.tacticalProfile });
        assert.equal(live.planMatchup?.edge, direct.edge);
        const played = advanceMatchClock(live);
        const period = played.timeline[0];
        assert.ok(Number.isFinite(period.expectedGoals.for) && Number.isFinite(period.expectedGoals.against));
        if (period.tacticalPhase) {
          assert.equal(period.tacticalXg, undefined, "v6 phase must replace static xG edge");
          assert.equal(played.minuteLog.length, period.chances,
            "one tactical phase cannot invent extra shot events");
        }
        sessionChecks += 1;
      }
    }
  }
}
// An IDENTICAL eleven and role setup, with only one center-back's documentary
// skill profile changed: high-line recovery versus ball progression.
const highPress = tactics.find(t => t.id === "high_press_343");
const cbIndex = formation433.slots.findIndex(s => s.position === "CB");
function sourcedCB(id, skills) {
  const result = players.map(player => ({ ...player }));
  result[cbIndex] = { ...result[cbIndex], id, name: id, strengths: skills,
    attributes: { values: {}, provenance: Object.fromEntries(skills.map(skill => [skill, "belagt"])) } };
  return result;
}
const passer = fixture(formation433, highPress, "build_up",
  sourcedCB("test-documented-passer", ["passing_range", "composure"]));
const stopper = fixture(formation433, highPress, "build_up",
  sourcedCB("test-documented-recovery", ["pace", "game_reading"]));
assert.ok(passer.metrics.buildUpScore > stopper.metrics.buildUpScore,
  "source-backed passer must benefit build-up, with the same CB role");
assert.ok(stopper.metrics.restDefenseScore > passer.metrics.restDefenseScore,
  "source-backed pace/reading must support rest-defence in a high line");
const opponent = HISTORICAL_OPPONENT_PROFILES[0];
const neutral = fit => ({ ...fit, teamScore: 72,
  historicalFormationFit: { historicalScore: 65, historicalBonus: 0, historicalPenalty: 0 },
  relationships: { relationshipScore: 60 } });
const pOutcome = simulateMatchday({teamFit: neutral(passer), formation: formation433, opponent});
const sOutcome = simulateMatchday({teamFit: neutral(stopper), formation: formation433, opponent});
assert.ok(pOutcome.expectedGoals.for > sOutcome.expectedGoals.for,
  "CB passing skills must affect actual chance model");
assert.ok(sOutcome.expectedGoals.against < pOutcome.expectedGoals.against,
  "CB recovery ability must affect concession risk");
const undocumented = fixture(formation433, highPress, "build_up",
  players.map((player, index) => index === cbIndex ? { ...player,
    strengths: ["passing_range", "composure"],
    attributes: { values: {}, provenance: { passing_range: "utledet", composure: "utledet" } } } : player));
assert.equal(undocumented.sourcedSkillTendencies.buildUpScore.bonus, 0,
  "inferred skills must not masquerade as documented player strengths");
assert.ok([...observed.values()].every(edges => edges.size > 1),
  "every tactic must have at least two distinct matchups across role, formation and opponent");
console.log("v6 real-role-formation matrix: " + pairChecks +
  " combinations (18 plans × 5 formations × 5 role configurations × 12 opponent styles)");
console.log("Real match session checks:", sessionChecks);
console.log("Baseline 4-3-3 role changes by tactic:", JSON.stringify(effects, null, 2));
console.log("Documented CB source test:", JSON.stringify({
  passing: { buildUp: passer.metrics.buildUpScore, restDefense: passer.metrics.restDefenseScore,
    xg: pOutcome.expectedGoals },
  recovery: { buildUp: stopper.metrics.buildUpScore, restDefense: stopper.metrics.restDefenseScore,
    xg: sOutcome.expectedGoals }
}, null, 2));
console.log("Synthetic test coverage only; no historic or external xG calibration claimed.");
