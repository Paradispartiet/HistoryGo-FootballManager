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
import { derivePlayerAttributes, normalizeAttributeCatalogue } from "../src/football-player-attributes.js";
import { applyP2SourceClaimsToPlayer, getP2SourceRecord } from "../src/football-player-source-claims-p2.js";

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


// Full-XI counterfactual for the midfield trap: use ACTUAL calculated team
// metrics and snapshots, not a handcrafted tacticalProfile. Change exactly
// one opponent condition at a time, retaining the same valid XI, match state,
// plan, opponent identity, and deterministic matchday seed.
const cfTrap = byPlan.get("midfield_press_trap");
const cfXI = buildFixture("4-3-3", cfTrap, {
  st: "pressing_forward", lcm: "pressing_midfielder"
});
const cfProfile = cfXI.strength.tacticalProfile;
assert.ok(cfProfile.pressScore >= 59,
  "complete XI must actually supply the static midblock pressing prerequisite");
assert.ok(cfProfile.balanceScore >= 62,
  "complete XI must actually supply the static midblock collective cover");
assert.equal(cfXI.fit.completeCount, 11);
assert.equal(cfXI.fit.duplicatePlayers.length, 0);
const cfHistorical = HISTORICAL_OPPONENT_PROFILES[0];
const cfOpponent = Object.freeze({
  ...cfHistorical,
  id: "controlled-midfield-trap-opponent",
  transitionThreat: 72,
  pressResistance: 77,
  tacticalBehaviour: null,
  styleTraits: {
    ...cfHistorical.styleTraits,
    possessionControl: 65,
    transitionThreat: 72
  }
});
const withCfOpponent = (patch = {}) => ({
  ...cfOpponent,
  ...patch,
  styleTraits: { ...cfOpponent.styleTraits, ...(patch.styleTraits || {}) }
});
const cfTrial = (label, rival, setup = cfXI) => {
  const unchanged = JSON.stringify(rival);
  const summary = evaluatePlanVsOpponent(cfTrap, rival, {
    tacticalProfile: setup.strength.tacticalProfile
  });
  const session = kickoff(setup, rival);
  session.id = "stable-midfield-trap-xi-seed";
  session.score = { for: 1, against: 0 };
  const lineupIds = session.lineupSnapshot.map(p => p.playerId);
  assert.equal(new Set(lineupIds).size, 11);
  assert.ok(session.lineupSnapshot.every(p => p.matchFitKnown === true));
  assert.equal(session.teamFitSnapshot.tacticalProfile.pressScore,
    setup.fit.metrics.pressScore);
  const forcedBreak = resolveOwnPressAgainstOpponent(session, {
    pressureRoll: () => 0.99, protectionRoll: () => 0.99
  });
  const period = advanceMatchClock(session).timeline[0];
  assert.ok(period && Number.isFinite(period.expectedGoals.for) &&
    Number.isFinite(period.expectedGoals.against));
  if (forcedBreak) {
    assert.equal(forcedBreak.route, "midfield_trap");
    assert.equal(forcedBreak.status, "escaped");
    assert.equal(forcedBreak.side, "against");
    assert.equal(period.tacticalPhase?.route, "midfield_trap",
      "full-XI counterfactual must reach actual matchday v6 press phase");
    assert.equal(period.tacticalXg, undefined, "no double static xG payment");
    for (const side of ["for", "against"]) {
      const delta = Math.round((period.expectedGoals[side] -
        period.baselineExpectedGoals[side]) * 100) / 100;
      assert.equal(delta, period.tacticalPhase[
        side === "for" ? "xgDeltaFor" : "xgDeltaAgainst"
      ], "one causal terminal phase controls each xG delta");
    }
  }
  assert.equal(JSON.stringify(rival), unchanged, "opponent must not mutate");
  const info = {
    label, ownPress: setup.fit.metrics.pressScore,
    ownBalance: setup.fit.metrics.balanceScore,
    ownRestDefense: setup.fit.metrics.restDefenseScore,
    trigger: rival.styleTraits.possessionControl,
    resistance: Number.isFinite(rival.pressResistance) ? rival.pressResistance : null,
    escape: rival.tacticalBehaviour?.pressEscapeRoute ||
      rival.tacticalBehaviour?.pressEscape || "unknown",
    sequence: summary.sequences[0]?.status || "no_trigger",
    liveExchange: summary.sequences[0]?.liveExchange?.status || "unobserved",
    staticEdge: summary.edge,
    forcedBreak: forcedBreak?.status || "not_eligible",
    pressProbability: forcedBreak?.probability ?? null,
    containmentProbability: forcedBreak?.containmentProbability ?? null,
    forcedBreakXgAgainst: forcedBreak?.xgDeltaAgainst ?? null,
    matchdayPhase: period.tacticalPhase?.status || "fallback",
    baselineXg: period.baselineExpectedGoals || null,
    actualXg: period.expectedGoals
  };
  console.log("  " + JSON.stringify(info));
  return { info, summary, session, period, forcedBreak };
};

console.log("Kampmotor v6 – full XI, one-variable midfield-trap counterfactuals");
const cfBase = cfTrial("ready_65_resistance_77", withCfOpponent());
const cfBeforeTrigger = cfTrial("below_trigger_64", withCfOpponent({
  styleTraits: { possessionControl: 64 }
}));
assert.equal(cfBase.summary.sequences[0]?.status, "advantage");
assert.equal(cfBeforeTrigger.summary.sequences.length, 0);
assert.equal(cfBeforeTrigger.forcedBreak, null);
assert.ok(cfBase.forcedBreak, "known central possession must trigger own press");

const cfCounter = cfTrial("resistance_78", withCfOpponent({
  pressResistance: 78
}));
assert.equal(cfCounter.summary.sequences[0]?.status, "countered");
assert.equal(cfCounter.summary.edge, 0);
assert.equal(cfBase.summary.edge, 1);
assert.ok(cfCounter.forcedBreak.probability < cfBase.forcedBreak.probability,
  "documented opponent resistance must lower real press success probability");

const cfThirdMan = cfTrial("documented_third_man", withCfOpponent({
  tacticalBehaviour: { pressEscapeRoute: "third_man" }
}));
const cfSwitch = cfTrial("documented_switch_play", withCfOpponent({
  tacticalBehaviour: { pressEscapeRoute: "switch_play" }
}));
assert.ok(cfThirdMan.forcedBreak.probability < cfBase.forcedBreak.probability);
assert.ok(cfSwitch.forcedBreak.probability < cfBase.forcedBreak.probability);
assert.equal(cfThirdMan.summary.sequences[0].status, "countered",
  "an explicit third-man outlet must now counter the static chain as well");
assert.equal(cfSwitch.summary.sequences[0].status, "countered",
  "documented offensive switch-play must counter the static press chain");
assert.equal(cfThirdMan.summary.edge, 0);
assert.equal(cfSwitch.summary.edge, 0);
assert.equal(cfThirdMan.forcedBreak.evidence.opponentEscapeRoute, "third_man");
assert.equal(cfSwitch.forcedBreak.evidence.opponentEscapeRoute, "switch_play");
assert.equal(cfThirdMan.forcedBreak.counterplay.pathwayId, "third_man");
assert.equal(cfThirdMan.forcedBreak.counterplay.exposedChannel, "central_between_lines");
assert.equal(cfSwitch.forcedBreak.counterplay.pathwayId, "switch_play");
assert.equal(cfSwitch.forcedBreak.counterplay.exposedChannel, "far_side_wide");
assert.equal(cfThirdMan.forcedBreak.counterplay.defensiveReply.roleReadiness,
  "supported_by_roles", "canonical pressing CM and balancing six protect central release");
assert.equal(cfSwitch.forcedBreak.counterplay.defensiveReply.roleReadiness,
  "supported_by_roles", "two support fullbacks provide candidate far-side protection");
assert.ok(cfThirdMan.forcedBreak.routeCoverAdjustment >= 0 &&
  cfThirdMan.forcedBreak.routeCoverAdjustment <= 0.03);
assert.ok(cfSwitch.forcedBreak.routeCoverAdjustment >= 0 &&
  cfSwitch.forcedBreak.routeCoverAdjustment <= 0.03);
assert.equal(cfThirdMan.forcedBreak.routeCoverAdjustment,
  cfThirdMan.forcedBreak.counterplay.defensiveReply.containmentAdjustment);
assert.equal(cfSwitch.forcedBreak.routeCoverAdjustment,
  cfSwitch.forcedBreak.counterplay.defensiveReply.containmentAdjustment);
assert.ok(cfThirdMan.forcedBreak.containmentProbability >=
  cfBase.forcedBreak.containmentProbability);
assert.ok(cfSwitch.forcedBreak.containmentProbability >=
  cfBase.forcedBreak.containmentProbability);
assert.equal(cfThirdMan.forcedBreak.probability,
  cfSwitch.forcedBreak.probability,
  "different defensive counters act AFTER identical first-press probabilities");
assert.deepEqual(cfSwitch.forcedBreak.counterplay.defensiveReply.evidence
  .farSideBackCandidates.left.length, 1);
assert.deepEqual(cfSwitch.forcedBreak.counterplay.defensiveReply.evidence
  .farSideBackCandidates.right.length, 1);
assert.notDeepEqual(cfThirdMan.forcedBreak.counterplay.actions,
  cfSwitch.forcedBreak.counterplay.actions,
  "same XI and random draw must yield distinct third-man and far-side causal explanations");
assert.ok(cfThirdMan.forcedBreak.xgDeltaAgainst >
  cfSwitch.forcedBreak.xgDeltaAgainst,
  "documented central penetration must price one higher-quality terminal chance than a wide switch");
// These authored offensive routes currently share one probability penalty;
// do not claim that the engine already distinguishes their spatial mechanics.
assert.equal(cfThirdMan.forcedBreak.probability,
  cfSwitch.forcedBreak.probability,
  "two known offensive exits are currently modelled with one shared penalty");

const cfObservedEscape = cfTrial("live_press_escape_supported", withCfOpponent({
  tacticalBehaviour: { pressEscape: "supported" }
}));
assert.equal(cfObservedEscape.summary.sequences[0]?.liveExchange?.status, "countered");
assert.equal(cfObservedEscape.summary.edge, 0);
// Static and dynamic v6 phases now consume the SAME explicit escape evidence
// without changing any probabilities, thresholds or historical source data.
assert.ok(cfObservedEscape.forcedBreak.probability <
  cfBase.forcedBreak.probability,
  "observed successful press escape must also challenge causal v6 pressing");
assert.equal(cfObservedEscape.forcedBreak.probability,
  cfThirdMan.forcedBreak.probability,
  "observed and authored successful escapes share the existing v6 penalty");
const cfObservedIsolation = cfTrial("observed_isolation_overrides_authored_route",
  withCfOpponent({ tacticalBehaviour: {
    pressEscape: "isolated", pressEscapeRoute: "third_man"
  }}));
assert.equal(cfObservedIsolation.summary.sequences[0]?.status, "advantage",
  "explicit isolation is stronger evidence than a previously authored route");
assert.equal(cfObservedIsolation.forcedBreak.probability,
  cfBase.forcedBreak.probability,
  "explicit lack of route support must not pay an escape penalty");

// Same random draw on either side of the documented escape probability:
// one available outlet changes the terminal consequence, not only the label.
const cfSharedDraw = (cfBase.forcedBreak.probability +
  cfThirdMan.forcedBreak.probability) / 2;
const replayCf = rival => {
  const session = kickoff(cfXI, rival);
  session.id = "same-xi-same-seed-middle-draw";
  session.score = { for: 1, against: 0 };
  return resolveOwnPressAgainstOpponent(session, {
    pressureRoll: () => cfSharedDraw, protectionRoll: () => 0.99
  });
};
const cfRecovered = replayCf(withCfOpponent());
const cfEscaped = replayCf(withCfOpponent({
  tacticalBehaviour: { pressEscapeRoute: "third_man" }
}));
assert.equal(cfRecovered.status, "regain");
assert.equal(cfEscaped.status, "escaped");
assert.equal(cfRecovered.evidence.support.length, 4);
assert.deepEqual(cfRecovered.evidence.support.map(p => p.playerId),
  cfEscaped.evidence.support.map(p => p.playerId));
assert.ok(cfRecovered.xgDeltaFor > cfEscaped.xgDeltaFor);
assert.ok(cfEscaped.xgDeltaAgainst > cfRecovered.xgDeltaAgainst,
  "a known exit must expose the same rest defence on a shared causal draw");

const cfMissingResistance = cfTrial("unscouted_resistance", withCfOpponent({
  pressResistance: undefined
}));
assert.equal(cfMissingResistance.summary.sequences[0]?.status,
  "unknown_counter");
assert.equal(cfMissingResistance.summary.edge, 0);
assert.equal(cfMissingResistance.forcedBreak, null,
  "unscouted press resistance cannot create a causal v6 opportunity");

const cfLowPressXI = buildFixture("4-3-3", cfTrap);
assert.deepEqual(cfLowPressXI.players.map(p => p.id),
  cfXI.players.map(p => p.id), "role variation retains the eleven players");
const cfLowPress = cfTrial("same_players_without_press_roles",
  withCfOpponent(), cfLowPressXI);
assert.ok(cfLowPress.info.ownPress < cfBase.info.ownPress);
assert.equal(cfLowPress.summary.sequences[0]?.status, "unsupported");
assert.ok(cfLowPress.forcedBreak && cfBase.forcedBreak &&
  cfLowPress.forcedBreak.probability < cfBase.forcedBreak.probability,
  "removing pressing roles must reduce causal v6 press success, not merely the static evaluation");
assert.deepEqual(cfLowPress.forcedBreak.evidence.support.map(p => p.playerId),
  cfBase.forcedBreak.evidence.support.map(p => p.playerId),
  "causal role variation must retain the same four distinct pressing players");

// Remove back protection via legal role choices, keeping the exact same
// player identities and an unchanged opponent. A broken press has a second
// independent containment stage; better width must not yield free cover.
const cfHighBacksXI = buildFixture("4-3-3", cfTrap, {
  st: "pressing_forward", lcm: "pressing_midfielder",
  lb: "overlapping_fullback", rb: "overlapping_fullback"
});
assert.deepEqual(cfHighBacksXI.players.map(p => p.id),
  cfXI.players.map(p => p.id));
assert.ok(cfHighBacksXI.fit.metrics.widthScore >= cfXI.fit.metrics.widthScore);
assert.ok(cfHighBacksXI.fit.metrics.restDefenseScore <
  cfXI.fit.metrics.restDefenseScore, "advancing both backs exposes actual cover");
const cfHighBacks = cfTrial("same_players_higher_backs",
  withCfOpponent(), cfHighBacksXI);
assert.ok(cfHighBacks.forcedBreak.containmentProbability <
  cfBase.forcedBreak.containmentProbability,
  "lower calculated cover must worsen real containment after escaped press");
assert.ok(cfHighBacks.forcedBreak.xgDeltaAgainst >=
  cfBase.forcedBreak.xgDeltaAgainst,
  "weak rest defence cannot erase the chance conceded after press failure");
const cfHighSwitch = cfTrial("same_players_higher_backs_switch_play",
  withCfOpponent({ tacticalBehaviour: { pressEscapeRoute: "switch_play" } }), cfHighBacksXI);
assert.equal(cfHighSwitch.forcedBreak.counterplay.pathwayId, "switch_play");
assert.equal(cfHighSwitch.forcedBreak.counterplay.advancedFullbacks.length, 2);
assert.equal(cfHighSwitch.forcedBreak.counterplay.defensiveReply.roleReadiness,
  "not_supported_by_checked_roles",
  "both overlapping fullbacks remove documented far-side support roles");
assert.equal(cfHighSwitch.forcedBreak.routeCoverAdjustment, 0);
assert.equal(cfHighSwitch.forcedBreak.containmentProbability,
  cfHighBacks.forcedBreak.containmentProbability,
  "without specialist cover, same calculated XI must have no hidden route bonus");
assert.equal(cfHighSwitch.forcedBreak.counterplay.defensiveReply.evidence.restDefenseScore,
  cfHighBacksXI.fit.metrics.restDefenseScore,
  "defensive reply must cite the calculated XI rather than an invented skill score");
assert.equal(cfSwitch.forcedBreak.counterplay.advancedFullbacks.length, 0);
assert.ok(cfHighSwitch.forcedBreak.containmentProbability <
  cfSwitch.forcedBreak.containmentProbability,
  "far-side role exposure must flow through the actual calculated rest-defence metric");
assert.equal(Number((cfHighSwitch.forcedBreak.xgDeltaAgainst -
  cfHighBacks.forcedBreak.xgDeltaAgainst).toFixed(3)), -0.01,
  "the wide outlet changes the existing terminal chance quality, not rest-defence metrics");
const changedMidRolesXI = buildFixture("4-3-3", cfTrap, {
  st: "pressing_forward"
});
assert.deepEqual(changedMidRolesXI.players.map(p => p.id),
  cfXI.players.map(p => p.id));
const weakThirdCover = cfTrial("same_players_without_tracking_midfielder",
  withCfOpponent({ tacticalBehaviour: { pressEscapeRoute: "third_man" } }),
  changedMidRolesXI);
const intactFlankCover = cfTrial("same_players_unrelated_cm_change_switch",
  withCfOpponent({ tacticalBehaviour: { pressEscapeRoute: "switch_play" } }),
  changedMidRolesXI);
assert.equal(weakThirdCover.forcedBreak.counterplay.defensiveReply.roleReadiness,
  "not_supported_by_checked_roles");
assert.equal(weakThirdCover.forcedBreak.routeCoverAdjustment, 0,
  "a holding six alone cannot claim the coordinated tracking-midfielder bonus");
assert.equal(intactFlankCover.forcedBreak.counterplay.defensiveReply.roleReadiness,
  "supported_by_roles",
  "the unchanged fullbacks still offer route-specific far-side protection");
assert.equal(cfObservedEscape.forcedBreak.routeCoverAdjustment, 0,
  "generic escape awareness cannot invent specialist defensive coverage");
assert.equal(cfObservedIsolation.forcedBreak.routeCoverAdjustment, 0,
  "observed lack of outlet prevents stale offensive route bonuses");
assert.equal(cfMissingResistance.forcedBreak, null,
  "unknown opposition resistance still gates the entire causal phase");
console.log("OK: full-XI midfield pressure, route-dependent downstream cover, matched evidence, rest-defence trade-off, unknown scouting and role fit.");


// Two source-audited REAL footballers, compared in the SAME canonical CM
// position, with the same other ten control players, roles and match context.
// This is not a claim that the composite XI ever played together. Unlike the
// other 648 fixtures, the differing CM skills and their original source URLs
// come from the existing P2 claim registry (SNL), never from invented ratings.
const rawCanonicalPlayers = load("football_players.json").players;
const attributeCatalogue = normalizeAttributeCatalogue(load("football_attributes.json"));
const realMidfielderSetup = playerId => {
  const raw = rawCanonicalPlayers.find(p => p.id === playerId);
  assert.ok(raw && raw.naturalPositions.includes("CM"),
    "selected source-backed athlete must be a real canonical central midfielder");
  const record = getP2SourceRecord(raw);
  assert.ok(record?.source?.startsWith("https://snl.no/"),
    "historical skill claim must retain its real source URL");
  const sourced = applyP2SourceClaimsToPlayer(raw);
  assert.deepEqual(sourced.strengths, record.strengths);
  const attributes = derivePlayerAttributes(sourced, {
    catalogue: attributeCatalogue, roles
  });
  assert.ok(attributes?.provenance, "canonical sourced attributes required");
  const livePlayer = { ...sourced, attributes };
  const control = buildFixture("4-3-3", cfTrap, {
    st: "pressing_forward", lcm: "pressing_midfielder"
  });
  const oldId = control.lineup.lcm.playerId;
  const players = control.players.filter(p => p.id !== oldId).concat(livePlayer);
  const lineup = {
    ...control.lineup,
    lcm: { playerId: livePlayer.id, roleId: "pressing_midfielder" }
  };
  const fit = calculateTeamFit({
    lineup, formation: control.formation, tactic: cfTrap, players, roles
  });
  assert.equal(fit.completeCount, 11);
  assert.equal(fit.duplicatePlayers.length, 0);
  assert.ok(fit.assignments.find(a => a.player?.id === playerId)
    ?.fit?.matchScore > 0, "real player must have calculated role fit");
  const strength = calculateMatchStrength({
    teamFit: fit, formation: control.formation
  });
  return { ...control, lineup, players, fit, strength, source: record.source };
};
const riiseXI = realMidfielderSetup("bjorn_helge_riise");
const legernesXI = realMidfielderSetup("arne_legernes");
const riiseContribution = riiseXI.fit.sourcedSkillTendencies.pressScore;
const legernesContribution = legernesXI.fit.sourcedSkillTendencies.pressScore;
assert.ok(riiseContribution.players.includes("Bjørn Helge Riise"));
assert.ok(legernesContribution.players.includes("Arne Legernes"));
assert.ok(riiseContribution.bonus > legernesContribution.bonus,
  "SNL-backed work_rate + stamina should provide more press-specific evidence than stamina alone");
assert.ok(riiseXI.fit.baseMetrics.pressScore >
  legernesXI.fit.baseMetrics.pressScore,
  "actual documented pressing skills must change actual calculated team metric");
const riiseRun = cfTrial("source_backed_bjorn_helge_riise",
  withCfOpponent(), riiseXI);
const legernesRun = cfTrial("source_backed_arne_legernes",
  withCfOpponent(), legernesXI);
console.log("Real-source midfield contrast: " + JSON.stringify({
  riise: { source: riiseXI.source, sourcedPressBonus: riiseContribution.bonus,
    pressScore: riiseRun.info.ownPress,
    phase: riiseRun.info.matchdayPhase, xg: riiseRun.info.actualXg },
  legernes: { source: legernesXI.source,
    sourcedPressBonus: legernesContribution.bonus,
    pressScore: legernesRun.info.ownPress,
    phase: legernesRun.info.matchdayPhase, xg: legernesRun.info.actualXg }
}));
console.log("OK: two source-backed real CM profiles flow through player-fit, team-fit and the same v6 match phase.");


// Cross-formation route-cover falsification. Synthetic named control players,
// ACTUAL calculateTeamFit + matchday pipeline: no invented source attributes.
// Test (1) four canonical formations, (2) low/high known role familiarity,
// (3) three distinct offensive exits, (4) observed isolation, (5) same-draw
// terminal outcomes. Only existing complementary specialist roles count.
const routeMatrix = [
  { formation: "4-3-3",
    overrides: { st: "pressing_forward", lcm: "pressing_midfielder" },
    specialistSlots: ["dm", "lcm", "lb", "rb", "lcb", "rcb"],
    supported: ["third_man", "switch_play", "direct"] },
  { formation: "4-2-3-1",
    overrides: { st: "pressing_forward", rdm: "pressing_midfielder" },
    specialistSlots: ["ldm", "rdm", "lb", "rb", "lcb", "rcb"],
    supported: ["third_man", "switch_play", "direct"] },
  { formation: "4-4-2",
    overrides: { lst: "pressing_forward", lcm: "pressing_midfielder" },
    specialistSlots: ["lb", "rb"],
    supported: ["switch_play"] },
  { formation: "3-4-3",
    overrides: { st: "pressing_forward", lcm: "pressing_midfielder" },
    specialistSlots: ["lcb", "ccb", "rcb"],
    supported: [] }
];
const offensiveExits = ["third_man", "switch_play", "direct"];
function enhanceKnownRoleFit(setup, slotIds) {
  const preferred = new Set(slotIds);
  const enhancedPlayers = setup.players.map(player => {
    const slot = setup.formation.slots.find(candidate =>
      setup.lineup[candidate.slotId]?.playerId === player.id);
    assert.ok(slot, "same canonical player must retain exact XI slot");
    return {
      ...player,
      preferredRoles: preferred.has(slot.slotId)
        ? [setup.lineup[slot.slotId].roleId] : player.preferredRoles
    };
  });
  const fit = calculateTeamFit({
    lineup: setup.lineup, formation: setup.formation, tactic: setup.tactic,
    players: enhancedPlayers, roles
  });
  assert.equal(fit.completeCount, 11);
  assert.equal(fit.duplicatePlayers.length, 0);
  const strength = calculateMatchStrength({ teamFit: fit,
    formation: setup.formation });
  return { ...setup, players: enhancedPlayers, fit, strength };
}
function routeMatrixPhase(setup, behaviour, protectionDraw = 0.99) {
  const rival = withCfOpponent({ tacticalBehaviour: behaviour });
  const session = kickoff(setup, rival);
  session.id = "route-cover-cross-formation-fixed-seed";
  session.score = { for: 1, against: 0 };
  const phase = resolveOwnPressAgainstOpponent(session, {
    pressureRoll: () => 0.99, protectionRoll: () => protectionDraw
  });
  assert.ok(phase, setup.formation.id + " must have complete known XI");
  assert.equal(phase.route, "midfield_trap");
  assert.equal(phase.version, 6);
  return phase;
}
let crossFormationChecks = 0, routeContainmentFlips = 0;
for (const row of routeMatrix) {
  const baseline = buildFixture(row.formation, cfTrap, row.overrides);
  const enhanced = enhanceKnownRoleFit(baseline, row.specialistSlots);
  assert.deepEqual(enhanced.players.map(p => p.id),
    baseline.players.map(p => p.id), "higher role-fit must not replace players");
  assert.ok(enhanced.fit.averageMatchScore >= baseline.fit.averageMatchScore ||
    enhanced.fit.metrics.roleFitAverage >= baseline.fit.metrics.roleFitAverage,
    "known preferred-role evidence cannot lower aggregate lineup fit");
  const byVariant = [];
  for (const [level, setup] of [["baseline", baseline], ["preferred", enhanced]]) {
    const outcomes = [];
    for (const exit of offensiveExits) {
      const named = routeMatrixPhase(setup, { pressEscapeRoute: exit });
      const isolated = routeMatrixPhase(setup, {
        pressEscapeRoute: exit, pressEscape: "isolated"
      });
      assert.equal(named.status, "escaped");
      assert.equal(isolated.status, "escaped");
      assert.equal(isolated.routeCoverAdjustment, 0,
        "observed isolation beats stale authored route across formations");
      const expected = row.supported.includes(exit);
      assert.equal(named.counterplay?.defensiveReply?.roleReadiness,
        expected ? "supported_by_roles" : "not_supported_by_checked_roles",
        row.formation + " " + exit + " documented complementary roles");
      assert.ok(named.routeCoverAdjustment >= 0 &&
        named.routeCoverAdjustment <= 0.03);
      assert.equal(named.routeCoverAdjustment > 0, expected,
        "only relevant valid roles with positive calculated match-fit get cover");
      assert.ok(Math.abs((named.containmentProbability -
        isolated.containmentProbability) - named.routeCoverAdjustment) <= 0.0011,
        "route specialization may affect stage-two containment exactly once");
      assert.equal(named.counterplay.defensiveReply.containmentAdjustment,
        named.routeCoverAdjustment);
      assert.equal(Number((named.xgDeltaAgainst -
        isolated.xgDeltaAgainst).toFixed(3)),
        { third_man: 0.01, direct: 0, switch_play: -0.01 }[exit],
        "a verified route replaces one terminal chance quality, never creates a second event");
      if (expected) {
        const midpoint = (named.containmentProbability +
          isolated.containmentProbability) / 2;
        const saved = routeMatrixPhase(setup,
          { pressEscapeRoute: exit }, midpoint);
        const exposed = routeMatrixPhase(setup,
          { pressEscapeRoute: exit, pressEscape: "isolated" }, midpoint);
        assert.equal(saved.status, "contained",
          "relevant cover must stop the same real matchday draw");
        assert.equal(exposed.status, "escaped",
          "without observed supported route the same draw must escape");
        assert.equal(saved.xgDeltaAgainst, 0.02);
        assert.ok(exposed.xgDeltaAgainst > saved.xgDeltaAgainst);
        routeContainmentFlips += 1;
      }
      outcomes.push(named);
      crossFormationChecks += 1;
    }
    assert.equal(new Set(outcomes.map(p => p.probability)).size, 1,
      "three named offensive exits use same initial press chance");
    assert.equal(new Set(outcomes.map(p => p.xgDeltaAgainst)).size, 3,
      "three distinct verified outlets must yield three distinct terminal chance qualities");
    byVariant.push(outcomes);
  }
  for (let i = 0; i < offensiveExits.length; i++) {
    assert.ok(byVariant[1][i].routeCoverAdjustment >=
      byVariant[0][i].routeCoverAdjustment,
      "better real specialist fit must not worsen complementary cover");
  }
}
assert.equal(crossFormationChecks, 4 * 2 * 3);
assert.equal(routeContainmentFlips, (3 + 3 + 1) * 2);
console.log("OK: " + crossFormationChecks +
  " canonical 4-3-3/4-2-3-1/4-4-2/3-4-3 route-cover checks, " +
  routeContainmentFlips + " controlled containment flips; no extra xG.");


// Real calculated XI, asymmetric fullback choices and documented target side.
// Same 4-3-3 players, team metrics, opponent and press roll, so any difference
// comes only from the match between the threatened flank and its surviving
// support fullback. No coordinates or recovery times are invented.
const cfLeftHighXI = buildFixture("4-3-3", cfTrap, {
  st: "pressing_forward", lcm: "pressing_midfielder",
  lb: "overlapping_fullback"
});
assert.deepEqual(cfLeftHighXI.players.map(p => p.id),
  cfXI.players.map(p => p.id));
const cfDirectionalSwitch = side => cfTrial("asymmetric_switch_target_" +
  String(side), withCfOpponent({ tacticalBehaviour: {
    pressEscapeRoute: "switch_play",
    ...(side ? { pressEscapeTargetFlank: side } : {})
  }}), cfLeftHighXI);
const cfUnknownFlank = cfDirectionalSwitch(null);
const cfRightFlank = cfDirectionalSwitch("right");
const cfLeftFlank = cfDirectionalSwitch("left");
assert.equal(cfUnknownFlank.forcedBreak.routeCoverAdjustment, 0,
  "unknown weak-side direction cannot use only one support back");
assert.equal(cfLeftFlank.forcedBreak.routeCoverAdjustment, 0,
  "advanced LB has no documented support cover on own left");
assert.ok(cfRightFlank.forcedBreak.routeCoverAdjustment > 0,
  "right support back protects a documented right-side switch");
assert.equal(cfRightFlank.forcedBreak.probability,
  cfLeftFlank.forcedBreak.probability,
  "actual destination cannot rewrite first pressing stage");
assert.ok(cfRightFlank.forcedBreak.containmentProbability >
  cfLeftFlank.forcedBreak.containmentProbability,
  "side-appropriate role-fit must affect only secondary containment");
assert.equal(cfRightFlank.forcedBreak.xgDeltaAgainst,
  cfLeftFlank.forcedBreak.xgDeltaAgainst);
const rightSideDraw = (cfRightFlank.forcedBreak.containmentProbability +
  cfLeftFlank.forcedBreak.containmentProbability) / 2;
const onSameDraw = side => resolveOwnPressAgainstOpponent(
  kickoff(cfLeftHighXI, withCfOpponent({ tacticalBehaviour: {
    pressEscapeRoute: "switch_play", pressEscapeTargetFlank: side
  }})), { pressureRoll: () => 0.99, protectionRoll: () => rightSideDraw });
assert.equal(onSameDraw("right").status, "contained");
assert.equal(onSameDraw("left").status, "escaped");
console.log("OK: production XI proves directional switch protection with one advanced back.");


// Real-XI regression for optional authored recovery timing. Exact player IDs
// come from the full production lineup snapshot and the engine's matched
// third-man defensive unit, not a fabricated positional estimate.
const cfTrackingIds = cfThirdMan.forcedBreak.counterplay.defensiveReply.evidence
  .supportingPlayerIds;
const cfTiming = attackWindowSeconds => ({
  basis: "authored_scenario",
  route: "third_man",
  attackWindowSeconds,
  defenderArrivalSecondsByPlayerId: Object.fromEntries(
    cfTrackingIds.map(id => [id, 2.5]))
});
const cfTimingTrial = (windowSeconds, protectionDraw = 0.99) =>
  resolveOwnPressAgainstOpponent(kickoff(cfXI, withCfOpponent({
    tacticalBehaviour: {
      pressEscapeRoute: "third_man",
      pressEscapeTiming: cfTiming(windowSeconds)
    }
  })), { pressureRoll: () => 0.99, protectionRoll: () => protectionDraw });
const cfTimely = cfTimingTrial(3.0);
const cfLate = cfTimingTrial(2.0);
assert.equal(cfTimely.evidence.routeCoverTiming.status, "in_time");
assert.equal(cfLate.evidence.routeCoverTiming.status, "late");
assert.equal(cfLate.routeCoverAdjustment, 0);
assert.ok(cfTimely.routeCoverAdjustment > 0);
assert.equal(cfTimely.probability, cfLate.probability);
assert.equal(cfTimely.evidence.routeCoverFitFloor,
  cfLate.evidence.routeCoverFitFloor,
  "recovery timing must not rewrite the real computed player role fit");
assert.ok(cfTimely.containmentProbability > cfLate.containmentProbability);
const cfWindowDraw = (cfTimely.containmentProbability +
  cfLate.containmentProbability) / 2;
assert.equal(cfTimingTrial(3.0, cfWindowDraw).status, "contained");
assert.equal(cfTimingTrial(2.0, cfWindowDraw).status, "escaped");
console.log("OK: real lineup demonstrates only documented specialist recovery timing can gate containment.");
 
// Real formation/player match-fit stays in the existing engine. Only a
// separately documented in-match action trace supplies elapsed seconds.
const cfSequence = (finalPassSeconds) => ({
  basis: "authored_action_sequence", route: "third_man",
  actions: [
    { id: "receive", durationSeconds: 0.7 },
    { id: "layoff", durationSeconds: 0.5 },
    { id: "third_runner", durationSeconds: 0.7 },
    { id: "through_pass", durationSeconds: finalPassSeconds }
  ],
  defenderResponsesByPlayerId: Object.fromEntries(cfTrackingIds.map(id =>
    [id, { recognitionDelaySeconds: 0.4, coverMoveSeconds: 2.1 }]))
});
const cfSequenceTrial = (finalPassSeconds, triggeredOn = null) => {
  const sequence = cfSequence(finalPassSeconds);
  if (triggeredOn) sequence.defenderResponsesByPlayerId =
    Object.fromEntries(cfTrackingIds.map(id => [id, {
      recognitionDelaySeconds: 0.4, coverMoveSeconds: 2.1,
      triggerActionId: triggeredOn
    }]));
  return resolveOwnPressAgainstOpponent(kickoff(cfXI, withCfOpponent({
    tacticalBehaviour: {
      pressEscapeRoute: "third_man",
      pressEscapeActionSequence: sequence
    }
  })), { pressureRoll: () => 0.99, protectionRoll: () => 0.99 });
};
const cfSequenceOnTime = cfSequenceTrial(1.2);
const cfSequenceTooLate = cfSequenceTrial(0.2);
assert.equal(cfSequenceOnTime.evidence.routeCoverTiming.basis, "authored_action_sequence");
assert.equal(cfSequenceOnTime.evidence.routeCoverTiming.status, "in_time");
assert.equal(cfSequenceTooLate.evidence.routeCoverTiming.status, "late");
assert.equal(cfSequenceOnTime.probability, cfSequenceTooLate.probability);
assert.equal(cfSequenceOnTime.evidence.routeCoverFitFloor,
  cfSequenceTooLate.evidence.routeCoverFitFloor);
assert.ok(cfSequenceOnTime.containmentProbability > cfSequenceTooLate.containmentProbability);
const cfRecognitionEarly = cfSequenceTrial(1.2, "receive");
const cfRecognitionLate = cfSequenceTrial(1.2, "layoff");
assert.equal(cfRecognitionEarly.evidence.routeCoverTiming.status, "in_time");
assert.equal(cfRecognitionLate.evidence.routeCoverTiming.status, "late");
assert.equal(cfRecognitionEarly.probability, cfRecognitionLate.probability);
assert.ok(cfRecognitionEarly.containmentProbability >
  cfRecognitionLate.containmentProbability);
// Real calculated XI continues to own role/formation fit; the new spatial
// field changes only the documented timing of the second defensive phase.
const cfSpatialTrial = (distanceMeters, protectionDraw = 0.99) => {
  const spatial = cfSequence(1.2);
  spatial.pitchDimensionsMeters = { widthMeters: 68, lengthMeters: 105 };
  spatial.defenderResponsesByPlayerId = Object.fromEntries(
    cfTrackingIds.map((id, index) => [id, {
      recognitionDelaySeconds: 0.4,
      triggerActionId: "receive",
      coverMovement: {
        basis: "authored_pitch_geometry",
        startMeters: { x: 15, y: 55 },
        coverMeters: { x: 15 + (index === 0 ? 6 : distanceMeters), y: 55 },
        averageSpeedMetersPerSecond: 4
      }
    }]));
  return resolveOwnPressAgainstOpponent(kickoff(cfXI, withCfOpponent({
    tacticalBehaviour: {
      pressEscapeRoute: "third_man", pressEscapeActionSequence: spatial
    }
  })), { pressureRoll: () => 0.99, protectionRoll: () => protectionDraw });
};
const cfSpatialClose = cfSpatialTrial(6);
const cfSpatialFar = cfSpatialTrial(14);
assert.equal(cfSpatialClose.evidence.routeCoverTiming.status, "in_time");
assert.equal(cfSpatialFar.evidence.routeCoverTiming.status, "late");
assert.equal(cfSpatialClose.evidence.routeCoverTiming.movementModel,
  "authored_pitch_geometry");
assert.equal(cfSpatialClose.evidence.routeCoverFitFloor,
  cfSpatialFar.evidence.routeCoverFitFloor);
assert.equal(cfSpatialClose.probability, cfSpatialFar.probability);
assert.ok(cfSpatialClose.containmentProbability > cfSpatialFar.containmentProbability);
const cfSpatialThreshold = (cfSpatialClose.containmentProbability +
  cfSpatialFar.containmentProbability) / 2;
assert.equal(cfSpatialTrial(6, cfSpatialThreshold).status, "contained");
assert.equal(cfSpatialTrial(14, cfSpatialThreshold).status, "escaped");

// Production-fit XI: the same specialist must actually defend a route-aligned
// centre lane. A central runner and a far-side back are not interchangeable.
const cfLaneResponse = (inLane) => {
  const line = cfSequence(1.2);
  line.pitchDimensionsMeters = { widthMeters: 68, lengthMeters: 105 };
  line.spatialLane = {
    basis: "authored_route_lane", route: "third_man",
    channel: "central_between_lines",
    coordinateFrame: "defending_goal_y0_right_xmax"
  };
  line.defenderResponsesByPlayerId = Object.fromEntries(cfTrackingIds.map(id => [
    id, {
      recognitionDelaySeconds: 0.4,
      coverMovement: {
        basis: "authored_pitch_geometry",
        startMeters: { x: 30, y: 55 },
        coverMeters: { x: inLane ? 36 : 58, y: 55 },
        averageSpeedMetersPerSecond: 4
      }
    }
  ]));
  return resolveOwnPressAgainstOpponent(kickoff(cfXI, withCfOpponent({
    tacticalBehaviour: { pressEscapeRoute: "third_man",
      pressEscapeActionSequence: line }
  })), { pressureRoll: () => 0.99, protectionRoll: () => 0.99 });
};
const cfLaneAligned = cfLaneResponse(true);
const cfLaneMiss = cfLaneResponse(false);
assert.equal(cfLaneAligned.evidence.routeCoverTiming.status, "in_time");
assert.equal(cfLaneMiss.evidence.routeCoverTiming.status,
  "wrong_corridor");
assert.equal(cfLaneMiss.routeCoverAdjustment, 0);
assert.ok(cfLaneAligned.routeCoverAdjustment > 0);
assert.equal(cfLaneAligned.probability, cfLaneMiss.probability);
assert.equal(cfLaneAligned.evidence.routeCoverFitFloor,
  cfLaneMiss.evidence.routeCoverFitFloor);

// The production XI has a known six + pressing midfielder. Arrival at
// 1.4 s beats the through-pass trigger (1.9 s), but not the
// third-runner trigger (1.2 s) within the SAME 3.1 s attacking sequence.
const cfActionDeadlineTrial = deadlineAction => {
  const sequence = cfSequence(1.2);
  sequence.defenderResponsesByPlayerId = Object.fromEntries(
    cfTrackingIds.map((id, index) => [id, {
      recognitionDelaySeconds: 0.4,
      coverMoveSeconds: index === 0 ? 1.0 : 2.1,
      mustCoverByActionId: index === 0 ? deadlineAction : undefined
    }]));
  for (const id of cfTrackingIds.slice(1)) {
    delete sequence.defenderResponsesByPlayerId[id].mustCoverByActionId;
  }
  return resolveOwnPressAgainstOpponent(kickoff(cfXI, withCfOpponent({
    tacticalBehaviour: {
      pressEscapeRoute: "third_man", pressEscapeActionSequence: sequence
    }
  })), { pressureRoll: () => 0.99, protectionRoll: () => 0.99 });
};
const cfBeforePass = cfActionDeadlineTrial("through_pass");
const cfBeforeRunner = cfActionDeadlineTrial("third_runner");
assert.equal(cfBeforePass.evidence.routeCoverTiming.status, "in_time");
assert.equal(cfBeforeRunner.evidence.routeCoverTiming.status, "late");
assert.equal(cfBeforePass.evidence.routeCoverTiming.deadlineModel,
  "per_defender_action_start");
assert.equal(cfBeforePass.probability, cfBeforeRunner.probability);
assert.ok(cfBeforePass.containmentProbability >
  cfBeforeRunner.containmentProbability);

console.log("OK: production XI preserves roles and validates central cover lane.");

console.log("OK: production XI consumes authored geometric recovery distance.");
console.log("OK: production XI consumes a four-action timeline and cue-specific delay.");
// Deterministic, conditional stage-two sensitivity rather than a claim about
// real-world frequencies. The identical calculated XI, opposition, match
// state and failed initial press are held fixed across each protection draw.
// The only contrast is a supported, documented outlet versus an observed
// isolation. Only the ONE terminal press phase may change xG against.
const protectionDraws = Array.from({ length: 101 },
  (_, index) => (index + 0.5) / 101);
const routeSensitivityReport = [];
for (const row of routeMatrix) {
  const base = buildFixture(row.formation, cfTrap, row.overrides);
  const setup = enhanceKnownRoleFit(base, row.specialistSlots);
  for (const routeId of offensiveExits) {
    const runGrid = (observedIsolation) => {
      const behaviour = {
        pressEscapeRoute: routeId,
        ...(observedIsolation ? { pressEscape: "isolated" } : {})
      };
      const reference = routeMatrixPhase(setup, behaviour);
      let contained = 0, escaped = 0, concededXg = 0;
      let normalizedConcededXg = 0;
      for (const draw of protectionDraws) {
        const phase = routeMatrixPhase(setup, behaviour, draw);
        assert.equal(phase.probability, reference.probability,
          "only the secondary containment draw can change");
        assert.equal(phase.containmentProbability,
          reference.containmentProbability,
          "the model probability is fixed across deterministic draws");
        assert.equal(phase.xgDeltaFor, 0,
          "an already broken press cannot claim a second attacking xG reward");
        if (phase.status === "contained") {
          contained += 1;
          assert.equal(phase.xgDeltaAgainst, 0.02,
            "one contained transition owns one terminal risk");
        } else {
          assert.equal(phase.status, "escaped",
            "initial press is deliberately broken in the entire sensitivity grid");
          escaped += 1;
          assert.ok(phase.xgDeltaAgainst > 0.02,
            "escaped transition exposes more risk than contained transition");
        }
        concededXg += phase.xgDeltaAgainst;
        // Separate the routed attack's terminal SHOT QUALITY from how
        // effectively the defending XI contained that attack. Comparing
        // raw xG of a named central run against an isolated/unknown
        // outlet would falsely attribute a stronger chance to the cover.
        normalizedConcededXg += phase.xgDeltaAgainst -
          (phase.evidence.terminalChanceQuality?.routeOffsetXg || 0);
      }
      assert.equal(contained + escaped, protectionDraws.length);
      assert.ok(Math.abs(contained / protectionDraws.length -
        reference.containmentProbability) <= 1 / protectionDraws.length + 0.002,
        "conditional containment frequency must follow the game's declared probability");
      return { reference, contained, escaped,
        meanConcededXg: Number((concededXg / protectionDraws.length).toFixed(4)),
        normalizedMeanXgAgainst: Number((normalizedConcededXg /
          protectionDraws.length).toFixed(4)) };
    };
    const covered = runGrid(false);
    const isolated = runGrid(true);
    assert.ok(covered.contained >= isolated.contained,
      "documented route-specific coverage cannot make a broken press less secure");
    assert.ok(covered.normalizedMeanXgAgainst <=
      isolated.normalizedMeanXgAgainst + 0.0001,
      "after controlling for route shot quality, specialist cover must not worsen terminal risk");
    if (!row.supported.includes(routeId)) {
      assert.equal(covered.reference.routeCoverAdjustment, 0,
        "unsupported nominal roles cannot be awarded an invented route bonus");
      assert.equal(covered.contained, isolated.contained,
        "unsupported formation must have no containment gain");
    }
    routeSensitivityReport.push({
      formation: row.formation, route: routeId,
      roleSupport: row.supported.includes(routeId),
      adjustment: covered.reference.routeCoverAdjustment,
      containedWithCover: covered.contained,
      containedWithoutCover: isolated.contained,
      meanXgAgainstWithCover: covered.meanConcededXg,
      meanXgAgainstWithoutCover: isolated.meanConcededXg
    });
  }
}
assert.equal(routeSensitivityReport.length, routeMatrix.length * offensiveExits.length);
console.log("V6 deterministic route-cover sensitivity (101 fixed draws per case): " +
  JSON.stringify(routeSensitivityReport));
// v6 evidence gate: the complete ON-PITCH lineup must be documented before
// a specialist response or a learned weak flank can earn a route advantage.
// An otherwise irrelevant goalkeeper with unknown fit is not evidence that
// the other ten players form a fully observed defensive unit.
const evidenceSession = kickoff(cfXI, withCfOpponent({
  tacticalBehaviour: { pressEscapeRoute: "third_man" }
}));
const evidencePhase = session => resolveOwnPressAgainstOpponent(session, {
  pressureRoll: () => 0.99, protectionRoll: () => 0.99
});
const completeEvidence = evidencePhase(evidenceSession);
assert.ok(completeEvidence.routeCoverAdjustment > 0,
  "fully documented canonical XI must retain the specialist response");
const nonPressPlayer = evidenceSession.lineupSnapshot.find(player =>
  player.position === "GK");
assert.ok(nonPressPlayer, "fixture must have a goalkeeper outside the press unit");
const unknownEvidence = structuredClone(evidenceSession);
unknownEvidence.lineupSnapshot.find(player =>
  player.playerId === nonPressPlayer.playerId).matchFitKnown = false;
const unknownPhase = evidencePhase(unknownEvidence);
assert.ok(unknownPhase, "other ten known players still permit an initial phase");
assert.equal(unknownPhase.routeCoverAdjustment, 0,
  "one unknown member of the starting eleven removes claimed collective cover");
assert.equal(unknownPhase.counterplay.defensiveReply.roleReadiness, "unknown",
  "missing evidence must not be described as a verified tactical weakness");
assert.equal(unknownPhase.probability, completeEvidence.probability,
  "unrelated missing goalkeeper evidence cannot rewrite initial press probability");
assert.ok(unknownPhase.containmentProbability <
  completeEvidence.containmentProbability,
  "unknown role evidence must not pay the specialist cover term");

// Invalid stored fit and duplicate player identifiers must not turn a partial
// XI into a "verified" one. No user save migration or model tuning is needed.
const invalidEvidence = structuredClone(evidenceSession);
invalidEvidence.lineupSnapshot.find(player =>
  player.playerId === nonPressPlayer.playerId).matchScore = 101;
assert.equal(evidencePhase(invalidEvidence).routeCoverAdjustment, 0,
  "out-of-range player match-fit must be treated as missing evidence");
const duplicateEvidence = structuredClone(evidenceSession);
duplicateEvidence.lineupSnapshot.find(player =>
  player.position === "RW").playerId = nonPressPlayer.playerId;
assert.equal(evidencePhase(duplicateEvidence).routeCoverAdjustment, 0,
  "duplicate identity must not count as independent verified cover");

// Ten actual, separately documented players can still form a legal
// short-handed defensive unit. This tests the evidence threshold only, NOT
// red-card effects, match-state recalculation or a historical ten-player XI.
const tenKnownEvidence = structuredClone(evidenceSession);
tenKnownEvidence.lineupSnapshot = tenKnownEvidence.lineupSnapshot.filter(
  player => player.position !== "RW");
assert.equal(tenKnownEvidence.lineupSnapshot.length, 10);
assert.equal(evidencePhase(tenKnownEvidence).routeCoverAdjustment,
  completeEvidence.routeCoverAdjustment,
  "known and distinct ten-player support remains eligible after a dismissal");

// Weak-flank adaptation has the same evidence requirement; do not infer
// an exploitable side merely because both fullbacks happen to be documented.
const flankEvidenceSession = kickoff(cfLeftHighXI, withCfOpponent({
  tacticalBehaviour: {
    pressEscapeRoute: "switch_play",
    pressEscapeTargetPolicy: "weakest_verified_flank"
  }
}));
const knownFlank = evidencePhase(flankEvidenceSession);
assert.equal(knownFlank.evidence.opponentFlankAdaptation.status, "selected",
  "known asymmetric fullbacks can reveal a verified weaker side");
const unknownFlankSession = structuredClone(flankEvidenceSession);
unknownFlankSession.lineupSnapshot.find(player =>
  player.position === "GK").matchFitKnown = false;
const unknownFlank = evidencePhase(unknownFlankSession);
assert.equal(unknownFlank.evidence.opponentFlankAdaptation.status,
  "insufficient_or_conflicting_evidence",
  "unknown teammate prevents claiming a verified collective flank weakness");
assert.equal(unknownFlank.routeCoverAdjustment, 0,
  "unknown on-pitch evidence must never grant specialist cover for a wide exit");
console.log("OK: full XI evidence gating, 10-player support, duplicate/invalid saves and no invented weak-flank scouting.");
// Route-specific specialist choice: a SECOND pressing midfielder is an
// alternative defender, not another mandatory weak link. Start with the
// canonical 4-3-3 XI and legal roles calculated by the real team-fit engine.
// Once that lineup is in the matchday snapshot, change one *non-selected*
// specialist's match-fit in isolation (controlled snapshot, NOT a historical
// player-rating claim). The selected defender and terminal risk must hold.
// Different offensive exits must retain their independently assigned roles.
const alternatePressXI = enhanceKnownRoleFit(buildFixture("4-3-3", cfTrap, {
  st: "pressing_forward",
  lcm: "pressing_midfielder",
  rcm: "pressing_midfielder"
}), ["lcm"]);
const routeAgainst = (setup, routeId) =>
  kickoff(setup, withCfOpponent({ tacticalBehaviour: {
    pressEscapeRoute: routeId
  } }));
const phaseAtBrokenPress = session =>
  resolveOwnPressAgainstOpponent(session, {
    pressureRoll: () => 0.99, protectionRoll: () => 0.99
  });
const sameXIThirdMan = routeAgainst(alternatePressXI, "third_man");
const pressCandidates = sameXIThirdMan.lineupSnapshot.filter(
  player => player.roleId === "pressing_midfielder");
assert.equal(pressCandidates.length, 2,
  "two legal pressing midfielders must be actual calculated XI assignments");
assert.ok(pressCandidates.every(player =>
  player.matchFitKnown === true && Number.isFinite(player.matchScore)));
const expectedPrimary = [...pressCandidates].sort((a, b) =>
  b.matchScore - a.matchScore ||
  String(a.playerId).localeCompare(String(b.playerId)))[0];
const reservePressMidfielder = pressCandidates.find(player =>
  player.playerId !== expectedPrimary.playerId);
const thirdManChoice = phaseAtBrokenPress(sameXIThirdMan);
assert.equal(thirdManChoice.status, "escaped");
assert.deepEqual(thirdManChoice.counterplay.defensiveReply.evidence.thirdRunnerTrackedBy,
  [expectedPrimary.playerId],
  "only the best available pressing midfielder is required to track the runner");
assert.ok(thirdManChoice.routeCoverAdjustment > 0,
  "full valid XI must still earn documented third-man cover");
const lowReserveSession = structuredClone(sameXIThirdMan);
lowReserveSession.lineupSnapshot.find(player =>
  player.playerId === reservePressMidfielder.playerId).matchScore = 0;
const lowReserveThirdMan = phaseAtBrokenPress(lowReserveSession);
assert.deepEqual(lowReserveThirdMan.counterplay.defensiveReply.evidence.thirdRunnerTrackedBy,
  [expectedPrimary.playerId],
  "a weaker second candidate must not replace the verified covering specialist");
assert.equal(lowReserveThirdMan.evidence.routeCoverFitFloor,
  thirdManChoice.evidence.routeCoverFitFloor,
  "an unassigned role alternative must not lower the active cover's weakest link");
assert.equal(lowReserveThirdMan.routeCoverAdjustment,
  thirdManChoice.routeCoverAdjustment,
  "one spare pressing midfielder cannot cancel already established cover");
assert.equal(lowReserveThirdMan.containmentProbability,
  thirdManChoice.containmentProbability);
assert.equal(lowReserveThirdMan.xgDeltaAgainst,
  thirdManChoice.xgDeltaAgainst,
  "the same terminal press decision must not pay for an unused specialist");
const lowPrimarySession = structuredClone(sameXIThirdMan);
lowPrimarySession.lineupSnapshot.find(player =>
  player.playerId === expectedPrimary.playerId).matchScore = 0;
const replacementPhase = phaseAtBrokenPress(lowPrimarySession);
assert.deepEqual(replacementPhase.counterplay.defensiveReply.evidence.thirdRunnerTrackedBy,
  [reservePressMidfielder.playerId],
  "another documented pressing midfielder may take over the same role");
assert.equal(replacementPhase.counterplay.defensiveReply.evidence.screenedCentralBy.length,
  1, "the balancing six remains a separate necessary defensive responsibility");
for (const alternateRoute of ["switch_play", "direct"]) {
  const intact = routeAgainst(alternatePressXI, alternateRoute);
  const lowered = structuredClone(intact);
  lowered.lineupSnapshot.find(player =>
    player.playerId === reservePressMidfielder.playerId).matchScore = 0;
  const before = phaseAtBrokenPress(intact);
  const after = phaseAtBrokenPress(lowered);
  assert.equal(before.routeCoverAdjustment, after.routeCoverAdjustment,
    "unrelated pressing midfielder must not alter " + alternateRoute + " cover");
  assert.deepEqual(before.counterplay.defensiveReply.evidence.supportingPlayerIds,
    after.counterplay.defensiveReply.evidence.supportingPlayerIds,
    "route-specific specialist identities must stay intact for " + alternateRoute);
}
console.log("OK: canonical two-pressing-midfielder XI selects a single real cover specialist; unused alternative cannot invent route-specific risk.");
// v7.5: ONE terminal chance changes quality based on a DOCUMENTED route,
// not because a role bonus or static plan edge was paid a second time.
// The new-match opt-in is added by the actual production session factory;
// older saves, unknown outlets, a recovered press and contained breaks are
// unchanged. This is a bounded game heuristic, not observed shot-quality data.
const routeQualitySession = (route, options = {}) => {
  const actor = kickoff(cfXI, withCfOpponent({
    tacticalBehaviour: route === null ? null : {
      pressEscapeRoute: route, ...(options.isolated
        ? { pressEscape: "isolated" } : {}),
      ...(options.directSecondBall
        ? { directSecondBall: options.directSecondBall } : {})
    }
  }));
  if (options.legacy) {
    delete actor.causalRouteChanceQualityVersion;
    delete actor.causalDirectSecondBallVersion;
  }
  return actor;
};
const routeQualityPhase = (route, options = {}, draw = 0.99) =>
  resolveOwnPressAgainstOpponent(routeQualitySession(route, options), {
    pressureRoll: () => 0.99, protectionRoll: () => draw
  });
const routeQualityNoOutlet = routeQualityPhase(null);
const routeQualityBase = routeQualityNoOutlet.xgDeltaAgainst;
assert.equal(routeQualitySession("third_man").causalRouteChanceQualityVersion, 1,
  "the real new-session factory must opt in");
const qualitySummary = {};
for (const [outlet, delta] of [
  ["third_man", 0.01], ["direct", 0], ["switch_play", -0.01]
]) {
  const newPhase = routeQualityPhase(outlet);
  const oldPhase = routeQualityPhase(outlet, { legacy: true });
  const unsupported = routeQualityPhase(outlet, { isolated: true });
  assert.equal(newPhase.status, "escaped");
  assert.equal(oldPhase.status, "escaped");
  assert.equal(newPhase.probability, oldPhase.probability);
  assert.equal(newPhase.containmentProbability, oldPhase.containmentProbability);
  assert.equal(newPhase.routeCoverAdjustment, oldPhase.routeCoverAdjustment);
  assert.equal(newPhase.xgDeltaAgainst,
    Number((routeQualityBase + delta).toFixed(3)),
    "one named terminal route replaces, not stacks, xG quality");
  assert.equal(oldPhase.xgDeltaAgainst, routeQualityBase,
    "old saves must retain the original route-neutral xG");
  assert.equal(unsupported.xgDeltaAgainst, routeQualityBase,
    "an isolated or unsupported outlet cannot earn fabricated shot quality");
  assert.equal(oldPhase.evidence.terminalChanceQuality, undefined);
  assert.equal(unsupported.evidence.terminalChanceQuality, undefined);
  assert.equal(newPhase.evidence.terminalChanceQuality?.eventCount, 1);
  assert.equal(newPhase.evidence.terminalChanceQuality?.route, outlet);
  assert.equal(newPhase.evidence.terminalChanceQuality?.routeOffsetXg, delta);
  assert.equal(newPhase.xgDeltaFor, 0);
  const recovered = resolveOwnPressAgainstOpponent(
    routeQualitySession(outlet), {
      pressureRoll: () => 0, protectionRoll: () => 0.99
    });
  const stopped = routeQualityPhase(outlet, {}, 0);
  assert.equal(recovered.status, "regain");
  assert.equal(recovered.xgDeltaAgainst, -0.01);
  assert.equal(stopped.status, "contained");
  assert.equal(stopped.xgDeltaAgainst, 0.02);
  assert.equal(recovered.evidence.terminalChanceQuality, undefined);
  assert.equal(stopped.evidence.terminalChanceQuality, undefined);
  assert.deepEqual(routeQualityPhase(outlet), newPhase,
    "deterministic route-quality replay must not add RNG");
  qualitySummary[outlet] = { terminalXgAgainst: newPhase.xgDeltaAgainst,
    legacyXgAgainst: oldPhase.xgDeltaAgainst };
}
assert.equal(routeQualityNoOutlet.evidence.terminalChanceQuality, undefined);
assert.equal(routeQualityNoOutlet.xgDeltaAgainst, routeQualityBase);
// Verify the production period consumes its phase delta once: the same
// session and draw can be replayed without a duplicate xG charge.
for (const [outlet, delta] of [
  ["third_man", 0.01], ["switch_play", -0.01]
]) {
  const result = cfTrial("new_terminal_quality_" + outlet,
    withCfOpponent({ tacticalBehaviour: { pressEscapeRoute: outlet } }));
  const baseline = result.period.baselineExpectedGoals.against;
  const actual = result.period.expectedGoals.against;
  assert.equal(Number((actual - baseline).toFixed(2)),
    result.period.tacticalPhase.xgDeltaAgainst,
    "period ledger must own only the single route-priced phase consequence");
  assert.equal(result.forcedBreak.xgDeltaAgainst,
    Number((routeQualityBase + delta).toFixed(3)));
}
console.log("V7.5 documented terminal route quality, legacy guard and one-xG ledger: " +
  JSON.stringify(qualitySummary));


// v7.6: a direct first ball and its rebound are not two random draws or
// separately generated chances. A documented defender XI and explicit
// authored opponent support can CONTEST existing specialist cover once.
// These are authored simulation premises, not inferred player skills.
const originalDirect = routeQualityPhase("direct");
const secondBallBase = originalDirect.evidence.directSecondBall;
assert.equal(routeQualitySession("direct").causalDirectSecondBallVersion, 1);
assert.equal(secondBallBase?.basis, "simulated_game_heuristic_not_observed");
assert.equal(secondBallBase.opponentSupport, "unknown");
assert.equal(secondBallBase.firstBall, "opponent_won");
assert.equal(secondBallBase.secondBall, "opponent_retained");
assert.equal(secondBallBase.eventCount, 1);
assert.ok(originalDirect.routeCoverAdjustment > 0,
  "canonical XI has documented centre-backs and balancing six");
assert.equal(originalDirect.containmentProbability,
  routeQualityPhase("direct", {
    directSecondBall: { basis: "unverified", opponentSupport: "coordinated" }
  }).containmentProbability,
  "unknown authored basis cannot create opponent strengths");

const coordinatedSupport = {
  basis: "authored_scenario", opponentSupport: "coordinated"
};
const contestedDirect = routeQualityPhase("direct", {
  directSecondBall: coordinatedSupport
});
assert.ok(contestedDirect.containmentProbability <
  originalDirect.containmentProbability,
  "authored second-ball coordination contests existing specialist cover");
assert.ok(contestedDirect.routeCoverAdjustment >= 0);
assert.ok(contestedDirect.routeCoverAdjustment <
  originalDirect.routeCoverAdjustment);
assert.equal(contestedDirect.probability, originalDirect.probability,
  "first press remains unchanged");
assert.equal(contestedDirect.evidence.directSecondBall.opponentSupport,
  "authored_coordinated");
assert.equal(contestedDirect.xgDeltaAgainst, originalDirect.xgDeltaAgainst,
  "same escaped terminal phase has no additional xG event");
assert.equal(contestedDirect.evidence.terminalChanceQuality.eventCount, 1);

const firstDuelWin = routeQualityPhase("direct", {}, 0);
assert.equal(firstDuelWin.status, "contained");
assert.equal(firstDuelWin.evidence.directSecondBall.firstBall, "defender_won");
assert.equal(firstDuelWin.evidence.directSecondBall.secondBall, "not_required");
const contestDraw = (originalDirect.containmentProbability +
  contestedDirect.containmentProbability) / 2;
const reboundWin = routeQualityPhase("direct", {}, contestDraw);
const reboundLoss = routeQualityPhase("direct", {
  directSecondBall: coordinatedSupport
}, contestDraw);
assert.equal(reboundWin.status, "contained",
  "known complementary cover wins the ball after losing first duel");
assert.equal(reboundWin.evidence.directSecondBall.firstBall, "opponent_won");
assert.equal(reboundWin.evidence.directSecondBall.secondBall,
  "defender_recovered");
assert.equal(reboundLoss.status, "escaped",
  "explicit coordinated second-ball support defeats the same protection draw");
assert.equal(reboundLoss.evidence.directSecondBall.secondBall,
  "opponent_retained");
assert.equal(reboundWin.xgDeltaAgainst, 0.02);
assert.equal(reboundLoss.xgDeltaAgainst, originalDirect.xgDeltaAgainst);
assert.ok(reboundLoss.xgDeltaAgainst > reboundWin.xgDeltaAgainst);
assert.deepEqual(reboundLoss, routeQualityPhase("direct", {
  directSecondBall: coordinatedSupport
}, contestDraw), "identical seed and XI must replay the same single-ball chain");

const legacySecondBall = routeQualityPhase("direct", {
  legacy: true, directSecondBall: coordinatedSupport
}, contestDraw);
assert.equal(legacySecondBall.evidence.directSecondBall, undefined);
assert.equal(legacySecondBall.containmentProbability,
  originalDirect.containmentProbability);
assert.equal(legacySecondBall.status, reboundWin.status,
  "older saved matches cannot acquire a new second-ball contest");
assert.equal(routeQualityPhase("direct", {
  isolated: true, directSecondBall: coordinatedSupport
}).evidence.directSecondBall, undefined,
  "stale route label cannot override observed isolation");
const unknownEleven = routeQualitySession("direct", {
  directSecondBall: coordinatedSupport
});
unknownEleven.lineupSnapshot.find(p => p.position === "GK").matchFitKnown = false;
const unknownPhase = resolveOwnPressAgainstOpponent(unknownEleven, {
  pressureRoll: () => 0.99, protectionRoll: () => contestDraw
});
assert.equal(unknownPhase.evidence.directSecondBall, undefined);
assert.equal(unknownPhase.routeCoverAdjustment, 0,
  "incomplete known XI cannot award, contest or explain specialist second-ball cover");
const wonPress = resolveOwnPressAgainstOpponent(routeQualitySession("direct", {
  directSecondBall: coordinatedSupport
}), { pressureRoll: () => 0, protectionRoll: () => {
  throw Error("a won press cannot consume a second-ball draw");
} });
assert.equal(wonPress.status, "regain");
assert.equal(wonPress.evidence.directSecondBall, undefined);
let protectionDraws = 0;
const singleDraw = resolveOwnPressAgainstOpponent(routeQualitySession(
  "direct", { directSecondBall: coordinatedSupport }
), {
  pressureRoll: () => 0.99,
  protectionRoll: () => { protectionDraws += 1; return contestDraw; }
});
assert.equal(protectionDraws, 1, "first/second ball reuses one protection roll");
assert.equal(singleDraw.status, reboundLoss.status);
assert.equal(singleDraw.evidence.directSecondBall.eventCount, 1);
console.log("V7.6 direct first-duel/second-ball: role evidence, contested cover, legacy saves and single RNG PASS");
