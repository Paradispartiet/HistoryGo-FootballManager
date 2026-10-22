// Role/formation sensitivity with CANONICAL game formations and role IDs.
// Players here are named synthetic CONTROL fixtures, not historical athletes.
// This test runs the real player-fit -> team-fit -> matchday pipeline; no
// invented historical abilities or claims of empirical effect sizes.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateTeamFit } from "../src/football-team-fit-engine.js";
import {
  calculateMatchStrength, createMatchdaySession, advanceMatchClock
} from "../src/football-matchday-engine.js";
import { evaluatePlanVsOpponent, scorePlanNow } from "../src/football-match-plan.js";
import { HISTORICAL_OPPONENT_PROFILES } from "../src/football-historical-opponent-profiles.js";
import { TACTICAL_SEQUENCES } from "../src/football-tactical-sequences.js";

const load = (name) => JSON.parse(readFileSync(new URL("../data/" + name, import.meta.url), "utf8"));
const formations = load("football_formations.json").formations;
const roles = load("football_roles.json").roles;
const plans = load("football_tactics.json").tactics;
const byPlan = new Map(plans.map((plan) => [plan.id, plan]));
const byFormation = new Map(formations.map((formation) => [formation.id, formation]));
const byRole = new Map(roles.map((role) => [role.id, role]));
const canonicalPlanIds = new Set(TACTICAL_SEQUENCES.map((item) => item.tacticId));

assert.equal(canonicalPlanIds.size, 18);
assert.equal(plans.length, 18);
assert.equal(HISTORICAL_OPPONENT_PROFILES.length, 12);
assert.ok(byFormation.has("4-3-3") && byFormation.has("3-4-3"));
for (const plan of plans) assert.ok(canonicalPlanIds.has(plan.id), plan.id);

const defaultRoles = Object.freeze({
  GK: "sweeperkeeper", LB: "support_fullback", RB: "support_fullback",
  CB: "ball_playing_centre_back", DM: "balancing_six", CM: "box_to_box",
  AM: "classic_ten", WB: "wingback", LW: "wide_dribbler",
  RW: "inverted_winger", ST: "channel_runner"
});

const attackRoles = Object.freeze({
  lb: "overlapping_fullback", rb: "overlapping_fullback",
  dm: "deep_playmaker", lcm: "pressing_midfielder",
  st: "pressing_forward"
});

function buildFixture(formationId, tactic, roleOverrides = {}, sourcedCb = null) {
  const formation = byFormation.get(formationId);
  assert.ok(formation?.slots?.length === 11, "canonical XI required: " + formationId);
  const lineup = {};
  const players = [];
  for (const [index, slot] of formation.slots.entries()) {
    const roleId = roleOverrides[slot.slotId] || defaultRoles[slot.position];
    const role = byRole.get(roleId);
    assert.ok(role?.validPositions?.includes(slot.position),
      "illegal " + roleId + " in " + formationId + "/" + slot.slotId);
    const id = "control-player-" + slot.slotId + "-" + index;
    const skills = slot.slotId === "lcb" && sourcedCb
      ? sourcedCb === "passer" ? ["passing_range", "composure"]
        : ["pace", "game_reading"]
      : [];
    players.push({
      id, name: "Kontrollspiller " + slot.slotId,
      naturalPositions: [slot.position], usablePositions: [], poorFits: [],
      preferredRoles: [], needs: [], likesTactics: [], dislikesTactics: [],
      archetypes: [], strengths: skills, classHeight: 85, warningWhenMisused: "",
      attributes: { values: {},
        provenance: Object.fromEntries(skills.map((skill) => [skill, "belagt"])) }
    });
    lineup[slot.slotId] = { playerId: id, roleId };
  }
  const fit = calculateTeamFit({ lineup, formation, tactic, players, roles });
  assert.equal(fit.completeCount, 11);
  assert.equal(fit.totalSlots, 11);
  assert.equal(fit.duplicatePlayers.length, 0);
  const strength = calculateMatchStrength({ teamFit: fit, formation });
  for (const metric of ["pressScore", "depthScore", "widthScore",
    "balanceScore", "buildUpScore", "restDefenseScore"]) {
    assert.ok(Number.isFinite(fit.metrics[metric]), metric + " missing team-fit");
    assert.equal(strength.tacticalProfile[metric], fit.metrics[metric],
      metric + " must flow unchanged to matchday");
  }
  return { formation, tactic, lineup, players, fit, strength };
}

function kickoff(setup, opponent) {
  const session = createMatchdaySession({
    teamFit: setup.fit, formation: setup.formation, tactic: setup.tactic,
    opponent, activeClassifications: [], roles
  });
  session.id = "sensitivity:" + setup.formation.id + ":" +
    setup.tactic.id + ":" + opponent.id + ":" + setup.fit.metrics.pressScore;
  session.score = ["chase_the_equaliser", "all_out_attack"].includes(setup.tactic.id)
    ? { for: 0, against: 1 } : { for: 1, against: 0 };
  const unique = new Set(session.lineupSnapshot.map((player) => player.playerId));
  assert.equal(unique.size, 11, "all four-link actions need different players");
  assert.ok(session.lineupSnapshot.every((player) => player.matchFitKnown === true),
    "real fit engine must document each control player's actual role fit");
  return session;
}

const wide = byPlan.get("wide_fast_433");
const highPress = byPlan.get("high_press_343");
const balanced = buildFixture("4-3-3", wide);
const aggressive = buildFixture("4-3-3", wide, attackRoles);
const wingbacks = buildFixture("3-4-3", wide);

// Isolate tactical role changes: SAME players, slots, tactic and formation.
assert.deepEqual(balanced.players.map((p) => p.id), aggressive.players.map((p) => p.id));
assert.ok(aggressive.fit.baseMetrics.widthScore > balanced.fit.baseMetrics.widthScore,
  "two overlapping fullbacks must improve width over conservative fullbacks");
assert.ok(aggressive.fit.baseMetrics.pressScore > balanced.fit.baseMetrics.pressScore,
  "pressing forward + pressing midfielder must strengthen the press");
assert.ok(aggressive.fit.baseMetrics.restDefenseScore < balanced.fit.baseMetrics.restDefenseScore,
  "double overlapping fullbacks without a holding six must expose rest defence");
// Formation can create different strengths AND vulnerabilities; no rock-paper-scissors bonus.
assert.ok(wingbacks.fit.baseMetrics.widthScore > balanced.fit.baseMetrics.widthScore);
assert.ok(wingbacks.fit.baseMetrics.restDefenseScore < balanced.fit.baseMetrics.restDefenseScore);

// Same 4-3-3 role, different *sourced* strengths: the existing provenance
// mechanism changes different dimensions; no generic star-player shortcut.
const passer = buildFixture("4-3-3", highPress, {}, "passer");
const defender = buildFixture("4-3-3", highPress, {}, "defender");
assert.ok(passer.fit.baseMetrics.buildUpScore > defender.fit.baseMetrics.buildUpScore);
assert.ok(defender.fit.baseMetrics.restDefenseScore > passer.fit.baseMetrics.restDefenseScore);
assert.deepEqual(passer.players.map((p) => p.id), defender.players.map((p) => p.id));
assert.ok(passer.fit.sourcedSkillTendencies.buildUpScore.players.length === 1);
assert.ok(defender.fit.sourcedSkillTendencies.restDefenseScore.players.length === 1);
const exampleOpponent = HISTORICAL_OPPONENT_PROFILES[0];
const passerKickoff = kickoff(passer, exampleOpponent);
const defenderKickoff = kickoff(defender, exampleOpponent);
assert.ok(passerKickoff.teamFitSnapshot.tacticalProfile.buildUpScore >
  defenderKickoff.teamFitSnapshot.tacticalProfile.buildUpScore);
assert.ok(defenderKickoff.teamFitSnapshot.tacticalProfile.restDefenseScore >
  passerKickoff.teamFitSnapshot.tacticalProfile.restDefenseScore);

let comparisons = 0;
let matchupDifferences = 0;
let resolvedPhases = 0;
let differingPhaseOutcomes = 0;
const summaries = [];
for (const tactic of plans) {
  const setups = [
    buildFixture("4-3-3", tactic),
    buildFixture("4-3-3", tactic, attackRoles),
    buildFixture("3-4-3", tactic)
  ];
  let tacticChanges = 0;
  let phaseChanges = 0;
  let tacticResolved = 0;
  for (const opponent of HISTORICAL_OPPONENT_PROFILES) {
    const seen = [];
    for (const setup of setups) {
      const before = JSON.stringify(setup.fit);
      const rivalBefore = JSON.stringify(opponent);
      const matchup = evaluatePlanVsOpponent(tactic, opponent, {
        tacticalProfile: setup.strength.tacticalProfile
      });
      assert.ok(Number.isFinite(matchup.edge));
      assert.deepEqual(matchup, evaluatePlanVsOpponent(tactic, opponent, {
        tacticalProfile: setup.strength.tacticalProfile
      }), "same profile must produce the same tactical analysis");
      const state = ["chase_the_equaliser","all_out_attack"].includes(tactic.id)
        ? "behind" : "leading";
      const score = scorePlanNow(tactic, { gameState: state,
        opponent, tacticalProfile: setup.strength.tacticalProfile });
      assert.ok(Number.isFinite(score));
      const session = kickoff(setup, opponent);
      assert.equal(session.planMatchup.edge, matchup.edge,
        "kickoff must use same player/role/formation matchup as preview");
      const played = advanceMatchClock(session);
      const period = played.timeline[0];
      assert.ok(period);
      assert.ok(Number.isFinite(period.expectedGoals.for));
      assert.ok(Number.isFinite(period.expectedGoals.against));
      if (period.tacticalPhase) {
        tacticResolved += 1;
        resolvedPhases += 1;
        assert.equal(period.tacticalPhase.version, 6);
        assert.equal(period.tacticalXg, undefined,
          "causal v6 and static matchup must never both receive xG credit");
        for (const side of ["for","against"]) {
          const observed = Math.round((period.expectedGoals[side] -
            period.baselineExpectedGoals[side]) * 100) / 100;
          const expected = period.tacticalPhase[
            side === "for" ? "xgDeltaFor" : "xgDeltaAgainst"
          ];
          assert.equal(observed, expected, "each v6 period has one xG outcome");
        }
      }
      assert.equal(JSON.stringify(setup.fit), before, "cannot mutate player/team fit");
      assert.equal(JSON.stringify(opponent), rivalBefore, "cannot mutate opponent");
      comparisons += 1;
      seen.push({
        edge: matchup.edge, stateScore: score,
        phase: period.tacticalPhase?.situation || "fallback",
        xg: period.expectedGoals
      });
    }
    if (new Set(seen.map((x) => x.edge)).size > 1) {
      matchupDifferences += 1; tacticChanges += 1;
    }
    if (new Set(seen.map((x) => JSON.stringify([
      x.phase, x.xg.for, x.xg.against
    ]))).size > 1) {
      differingPhaseOutcomes += 1; phaseChanges += 1;
    }
  }
  summaries.push({ plan: tactic.id, matchup: tacticChanges,
    outcome: phaseChanges, causal: tacticResolved });
}
assert.equal(comparisons, 18 * 12 * 3);
assert.ok(matchupDifferences > 0, "changing roles/formation must alter at least some matches");
assert.ok(differingPhaseOutcomes > 0,
  "player-role-formation variations must reach real expected-goal outcomes");
assert.ok(resolvedPhases > 0, "canonical XI must reach at least one causal v6 phase");
console.log("Kampmotor v6 – spiller/rolle/formasjon, intern sensitivitetsmatrise");
for (const row of summaries) {
  console.log("  " + row.plan.padEnd(29) + " matchup " +
    String(row.matchup).padStart(2) + "/12 | xG/fase " +
    String(row.outcome).padStart(2) + "/12 | v6 " + row.causal);
}
console.log("OK: " + comparisons + " plan × opponent × real-lineup-pipeline comparisons; " +
  matchupDifferences + " matchup contrasts; " +
  differingPhaseOutcomes + " outcome contrasts; " + resolvedPhases + " v6 phases.");
