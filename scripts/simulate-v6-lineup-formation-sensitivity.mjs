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
import { resolveOwnPressAgainstOpponent } from "../src/football-matchday-own-press-v6.js";

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
  CB: "ball_playing_centre_back", DM: "balancing_six", CM: "deep_playmaker",
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


// Isolated tactical counterfactuals for the 4-4-2 mid-block press trap.
// The broad 648-case test can legitimately keep the same static edge across
// its synthetic roles. Here we vary ONE known readiness/counter condition
// at a time, without inventing match events or player strengths.
const trap = byPlan.get("midfield_press_trap");
const trapTeam = Object.freeze({
  pressScore: 68, balanceScore: 67, restDefenseScore: 67,
  depthScore: 62, widthScore: 58, buildUpScore: 60
});
const trapOpponent = Object.freeze({
  id: "synthetic-midblock-opponent",
  pressResistance: 70, defensiveStructure: 65,
  styleTraits: {
    possessionControl: 76, pressIntensity: 50,
    defensiveCompactness: 50, highLine: 50,
    shortBuildUp: 50, transitionThreat: 50
  }
});
const trapPreview = (team = trapTeam, rival = trapOpponent) =>
  evaluatePlanVsOpponent(trap, rival, { tacticalProfile: team });
const trapReady = trapPreview();
assert.equal(trapReady.sequences.length, 1);
assert.equal(trapReady.sequences[0].status, "advantage");
assert.equal(trapReady.edge, 1, "supported mid-block trigger has one specific static edge");
for (const [metric, insufficient] of [["pressScore", 58], ["balanceScore", 61]]) {
  const result = trapPreview({ ...trapTeam, [metric]: insufficient });
  assert.equal(result.sequences[0].status, "unsupported",
    "missing " + metric + " must break the collective press trap");
  assert.equal(result.edge, 0, "incomplete mid-block must receive no free edge");
}
const pressEscape = trapPreview(trapTeam,
  { ...trapOpponent, pressResistance: 82 });
assert.equal(pressEscape.sequences[0].status, "countered");
assert.equal(pressEscape.edge, 0, "press resistance must neutralise the full chain");
const { pressResistance: omittedResistance, ...unscoutedOpponent } = trapOpponent;
assert.equal(omittedResistance, 70);
const unknownCounter = trapPreview(trapTeam, unscoutedOpponent);
assert.equal(unknownCounter.sequences[0].status, "unknown_counter");
assert.equal(unknownCounter.edge, 0, "unscouted counter must not be treated as absent");
const noTrigger = trapPreview(trapTeam, {
  ...trapOpponent,
  styleTraits: { ...trapOpponent.styleTraits, possessionControl: 58 }
});
assert.equal(noTrigger.sequences.length, 0);
assert.equal(noTrigger.edge, 0, "without the central-pass trigger no trap is awarded");
const observedEscape = trapPreview(trapTeam, {
  ...trapOpponent, tacticalBehaviour: { pressEscape: "supported" }
});
assert.equal(observedEscape.sequences[0].liveExchange?.status, "countered");
assert.equal(observedEscape.edge, 0, "observed third-man escape overrides optimistic portrait");
const observedNoEscape = trapPreview(trapTeam, {
  ...trapOpponent, pressResistance: 82,
  tacticalBehaviour: { pressEscape: "isolated" }
});
assert.equal(observedNoEscape.sequences[0].liveExchange?.status, "advantage");
assert.equal(observedNoEscape.edge, 1, "specific observed isolation overrides generic resistance");
const unrelated = byPlan.get("central_possession_4231");
const unrelatedEdge = rival => evaluatePlanVsOpponent(unrelated, rival,
  { tacticalProfile: trapTeam }).edge;
assert.equal(unrelatedEdge(trapOpponent),
  unrelatedEdge({ ...trapOpponent, pressResistance: 82 }),
  "mid-block escape test must not award every unrelated plan a generic edge");
console.log("OK: midfield press trap controlled readiness, trigger, counter, unknown-data and observed escape contrasts.");


// Full-XI midfield-press counterfactual regression. Unlike the static evaluator
// contracts above, these use the actual 11-player team fit and a match session.
// Do not silently replace recorded player ability with hand-authored team scores.
const completeTrapXI = buildFixture("4-3-3", trap, { st: "pressing_forward" });
const unsupportedTrapXI = buildFixture("4-3-3", trap);
const trapMetrics = completeTrapXI.fit.metrics;
assert.equal(completeTrapXI.fit.completeCount, 11);
assert.equal(completeTrapXI.fit.duplicatePlayers.length, 0);
assert.ok(trapMetrics.pressScore >= 59 && trapMetrics.balanceScore >= 62,
  "actual canonical XI must support the collective trap, not a synthetic teamScore");
assert.ok(unsupportedTrapXI.fit.metrics.pressScore < 59,
  "without the pressing-forward role the actual XI must be below static press readiness");
assert.deepEqual(completeTrapXI.players.map(p => p.id),
  unsupportedTrapXI.players.map(p => p.id),
  "the role counterfactual must use exactly the same eleven players");

function observedTrapOpponent({
  possessionControl = 65, pressResistance = 77,
  pressEscapeRoute = null, pressEscape = null, unknownResistance = false
} = {}) {
  const behaviour = {};
  if (pressEscapeRoute) behaviour.pressEscapeRoute = pressEscapeRoute;
  if (pressEscape) behaviour.pressEscape = pressEscape;
  const opponent = {
    ...trapOpponent,
    id: "midfield-counterfactual-one-opponent",
    name: "Kontrollert sentral oppbygging",
    strength: 74, chanceConversion: 70, transitionThreat: 72,
    pressResistance,
    // Keep every other opponent dimension fixed across pairs.
    styleTraits: { ...trapOpponent.styleTraits, possessionControl, transitionThreat: 72 },
    tacticalBehaviour: Object.keys(behaviour).length ? behaviour : null
  };
  if (unknownResistance) delete opponent.pressResistance;
  return opponent;
}

function sessionForTrap(setup, rival) {
  const session = kickoff(setup, rival);
  // No automatic leading/behind plan switch; equivalent first-match period.
  session.score = { for: 0, against: 0 };
  session.id = "midfield-press-fixed-complete-XI-period";
  return session;
}
const xiCases = [
  { id: "ready", xi: completeTrapXI, rival: observedTrapOpponent() },
  { id: "no-trigger-64", xi: completeTrapXI,
    rival: observedTrapOpponent({ possessionControl: 64 }) },
  { id: "counter-78", xi: completeTrapXI,
    rival: observedTrapOpponent({ pressResistance: 78 }) },
  { id: "unknown-resistance", xi: completeTrapXI,
    rival: observedTrapOpponent({ unknownResistance: true }) },
  { id: "third-man-route", xi: completeTrapXI,
    rival: observedTrapOpponent({ pressEscapeRoute: "third_man" }) },
  { id: "switch-play-route", xi: completeTrapXI,
    rival: observedTrapOpponent({ pressEscapeRoute: "switch_play" }) },
  { id: "observed-escape", xi: completeTrapXI,
    rival: observedTrapOpponent({ pressEscape: "supported" }) },
  { id: "unsupported-role", xi: unsupportedTrapXI,
    rival: observedTrapOpponent() }
];
const xiAudit = [];
for (const entry of xiCases) {
  const preview = evaluatePlanVsOpponent(trap, entry.rival, {
    tacticalProfile: entry.xi.strength.tacticalProfile
  });
  const session = sessionForTrap(entry.xi, entry.rival);
  const directPhase = resolveOwnPressAgainstOpponent(session, {
    pressureRoll: () => 0,
    protectionRoll: () => 0.999
  });
  const actualPeriod = advanceMatchClock(session).timeline[0];
  assert.ok(actualPeriod && Number.isFinite(actualPeriod.baselineExpectedGoals.for)
    && Number.isFinite(actualPeriod.expectedGoals.against),
  "complete XI must produce real matchday/xG snapshots");
  if (actualPeriod.tacticalPhase) {
    assert.equal(actualPeriod.tacticalPhase.version, 6);
    assert.equal(actualPeriod.tacticalXg, undefined,
      "static edge must never stack an extra credit on a causal v6 phase");
    for (const side of ["for", "against"]) {
      const actual = Math.round((actualPeriod.expectedGoals[side] -
        actualPeriod.baselineExpectedGoals[side]) * 100) / 100;
      assert.equal(actual, actualPeriod.tacticalPhase[
        side === "for" ? "xgDeltaFor" : "xgDeltaAgainst"
      ], entry.id + ": one phase, one xG settlement");
    }
  }
  xiAudit.push({
    case: entry.id, press: entry.xi.fit.metrics.pressScore,
    balance: entry.xi.fit.metrics.balanceScore,
    restDefense: entry.xi.fit.metrics.restDefenseScore,
    trigger: entry.rival.styleTraits.possessionControl,
    resistance: entry.rival.pressResistance ?? "unknown",
    previewStatus: preview.sequences[0]?.status || "no-trigger",
    staticEdge: preview.edge,
    directV6: directPhase ? {
      route: directPhase.route, status: directPhase.status,
      regainProbability: directPhase.probability,
      containmentProbability: directPhase.containmentProbability,
      xgFor: directPhase.xgDeltaFor, xgAgainst: directPhase.xgDeltaAgainst
    } : null,
    matchV6: actualPeriod.tacticalPhase?.route || "fallback",
    baselineXg: actualPeriod.baselineExpectedGoals,
    finalXg: actualPeriod.expectedGoals
  });
}
const xiByCase = Object.fromEntries(xiAudit.map(row => [row.case, row]));
assert.equal(xiByCase.ready.previewStatus, "advantage");
assert.equal(xiByCase.ready.staticEdge, 1);
assert.equal(xiByCase["no-trigger-64"].previewStatus, "no-trigger");
assert.equal(xiByCase["no-trigger-64"].staticEdge, 0);
assert.equal(xiByCase["no-trigger-64"].directV6, null,
  "the real matchday press phase also needs a known central build-up trigger");
assert.equal(xiByCase["counter-78"].previewStatus, "countered");
assert.equal(xiByCase["counter-78"].staticEdge, 0);
assert.equal(xiByCase["unknown-resistance"].previewStatus, "unknown_counter");
assert.equal(xiByCase["unknown-resistance"].staticEdge, 0);
assert.equal(xiByCase["unknown-resistance"].directV6, null,
  "unknown opposition resistance cannot be interpreted as an exposed opponent");
assert.equal(xiByCase["observed-escape"].previewStatus, "countered");
assert.equal(xiByCase["unsupported-role"].previewStatus, "unsupported");
assert.equal(xiByCase["unsupported-role"].staticEdge, 0);
for (const id of ["ready", "counter-78", "third-man-route", "switch-play-route",
  "observed-escape", "unsupported-role"]) {
  assert.equal(xiByCase[id].directV6?.route, "midfield_trap",
    "known complete XI must reach the real probability-based press chain: " + id);
}
assert.ok(xiByCase.ready.directV6.regainProbability >
  xiByCase["counter-78"].directV6.regainProbability,
  "the 77/78 counter threshold is static, while live resistance acts continuously");
assert.ok(xiByCase.ready.directV6.regainProbability >
  xiByCase["third-man-route"].directV6.regainProbability,
  "a known third-man release must reduce actual midfield-press recovery");
assert.ok(xiByCase.ready.directV6.regainProbability >
  xiByCase["switch-play-route"].directV6.regainProbability,
  "an explicit offensive switch-play outlet must reduce press success");
assert.ok(xiByCase.ready.directV6.regainProbability >
  xiByCase["unsupported-role"].directV6.regainProbability,
  "a documented pressing role must improve live success probability over same XI");
assert.equal(xiByCase.ready.staticEdge, xiByCase["third-man-route"].staticEdge,
  "the static model must not misinterpret the live-only pressEscapeRoute as pressEscape");
assert.equal(xiByCase.ready.staticEdge, xiByCase["switch-play-route"].staticEdge,
  "defensive wideShift and offensive switch_play are distinct scouting signals");

// Choose a shared causal roll BETWEEN the measured success probabilities:
// same opponent, same XI, same phase, but one known outlet can flip the terminal
// result from a regain to a broken press with an exposed rest-defence consequence.
const readyProbability = xiByCase.ready.directV6.regainProbability;
const escapedProbability = xiByCase["third-man-route"].directV6.regainProbability;
const sharedRoll = (readyProbability + escapedProbability) / 2;
const settledReady = resolveOwnPressAgainstOpponent(
  sessionForTrap(completeTrapXI, observedTrapOpponent()),
  { pressureRoll: () => sharedRoll, protectionRoll: () => 0.999 });
const settledEscape = resolveOwnPressAgainstOpponent(
  sessionForTrap(completeTrapXI, observedTrapOpponent({ pressEscapeRoute: "third_man" })),
  { pressureRoll: () => sharedRoll, protectionRoll: () => 0.999 });
assert.equal(settledReady.status, "regain");
assert.equal(settledEscape.status, "escaped");
assert.ok(settledReady.xgDeltaFor > settledEscape.xgDeltaFor);
assert.ok(settledEscape.xgDeltaAgainst > settledReady.xgDeltaAgainst,
  "press broken by one known outlet must expose the same XI to more transition xG");
assert.equal(settledEscape.evidence.support.length, 4,
  "all four tactical links must be fulfilled by distinct documented player fits");
console.log("Kampmotor v6 – komplett XI, pressfelle/utløser/motgrep, kontrafaktisk rapport:");
xiAudit.forEach(row => console.log("  " + JSON.stringify(row)));
console.log("OK: one fixed-XI and one role-swap counterfactual; static edge, live press, " +
  "terminal rest-defence and real-period xG reported separately.");
