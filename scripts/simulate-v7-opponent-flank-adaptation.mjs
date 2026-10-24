// v7.1 – deterministic opponent target selection, no fabricated scouting.
import assert from "node:assert/strict";
import { resolveOwnPressAgainstOpponent } from "../src/football-matchday-own-press-v6.js";
import { applyOpponentAdaptation } from "../src/football-matchday-engine.js";

const positions = ["GK", "CB", "DM", "CM", "AM", "ST", "LW", "RW", "LB", "RB", "CB"];
const xi = positions.map((position, i) => ({
  playerId: "v7-1-" + i, position, matchScore: 75, matchFitKnown: true,
  roleId: position === "DM" ? "balancing_six" :
    position === "CM" ? "pressing_midfielder" :
      ["LB", "RB"].includes(position) ? "support_fullback" :
      position === "CB" ? "ball_playing_centre_back" : "role_" + position
}));
const opponent = {
  id: "v7-1-opponent", strength: 72, pressResistance: 72,
  defensiveStructure: 69, transitionThreat: 78,
  styleTraits: { shortBuildUp: 82, possessionControl: 80, transitionThreat: 78 }
};
const profile = {
  pressScore: 78, balanceScore: 74, restDefenseScore: 71,
  buildUpScore: 69, depthScore: 71, widthScore: 69,
  relationshipScore: 72, teamScore: 75
};
const situation = (lineupSnapshot, tacticalBehaviour, plan = "midfield_press_trap") => ({
  id: "v7-1-match", version: 2, causalPressingVersion: 1,
  selectedTacticId: plan, tacticSnapshot: { id: plan },
  lineupSnapshot, opponent: { ...opponent, tacticalBehaviour },
  teamFitSnapshot: { tacticalProfile: profile, historicalScore: 70 },
  strengthSnapshot: { finalStrength: 74, modifiers: { missing: 0 } },
  planMatchup: { edge: 1.5 },
  score: { for: 0, against: 0 }, timeline: [], minuteLog: [],
  events: [], decisions: [], substitutions: [], planChanges: []
});
const policy = {
  pressEscapeRoute: "switch_play",
  pressEscapeTargetPolicy: "weakest_verified_flank"
};
const phase = (players, behaviour = policy, draw = 0.99, plan) =>
  resolveOwnPressAgainstOpponent(situation(players, behaviour, plan), {
    pressureRoll: () => 0.99, protectionRoll: () => draw
  });
const modify = (arr, position, attributes) => arr.map(p =>
  p.position === position ? { ...p, ...attributes } : p);
const assertNoExtraBonus = (before, after) => {
  assert.equal(before.probability, after.probability,
    "target selection never buys first-press probability");
  assert.equal(before.xgDeltaAgainst, after.xgDeltaAgainst,
    "one unchanged terminal chance, not stacked xG");
  assert.ok(before.routeCoverAdjustment <= 0.03);
  assert.ok(after.routeCoverAdjustment <= 0.03);
  // When the target flank lacks its support role entirely, the existing
  // cover gate correctly reports 'not_applicable', not an elapsed-time claim.
  for (const result of [before, after]) {
    assert.ok(["not_applicable", "not_provided"].includes(
      result.evidence.routeCoverTiming.status));
  }
};
let assertions = 0;

// Opponent targets a demonstrably unsupported left defensive wide role.
const leftGap = modify(xi, "LB", { roleId: "overlapping_fullback" });
const adaptedLeft = phase(leftGap);
const manualRight = phase(leftGap, {
  ...policy, pressEscapeTargetFlank: "right"
});
assert.equal(adaptedLeft.evidence.opponentFlankAdaptation.status, "selected");
assert.equal(adaptedLeft.evidence.opponentFlankAdaptation.selectedFlank, "left");
assert.equal(adaptedLeft.evidence.opponentFlankAdaptation.reason,
  "verified_role_coverage_gap");
assert.equal(adaptedLeft.evidence.documentedTargetFlank, null);
assert.equal(adaptedLeft.counterplay.documentedTargetFlank, null);
assert.equal(adaptedLeft.counterplay.simulatedTargetFlank, "left");
assert.equal(adaptedLeft.counterplay.defensiveReply.evidence.simulatedTargetFlank, "left");
assert.match(adaptedLeft.cause, /venstre kant/);
assert.equal(adaptedLeft.routeCoverAdjustment, 0);
assert.ok(manualRight.routeCoverAdjustment > 0);
assert.equal(manualRight.evidence.opponentFlankAdaptation, undefined,
  "explicitly scouted target wins over adaptive choice");
assert.equal(manualRight.evidence.documentedTargetFlank, "right");
assertNoExtraBonus(adaptedLeft, manualRight);
assertions += 13;

// The same roles with an exposed RIGHT channel switch the target.
const rightGap = modify(xi, "RB", { roleId: "overlapping_fullback" });
const adaptedRight = phase(rightGap);
assert.equal(adaptedRight.evidence.opponentFlankAdaptation.selectedFlank, "right");
assert.match(adaptedRight.cause, /høyre kant/);
assert.equal(adaptedRight.routeCoverAdjustment, 0);
assertNoExtraBonus(adaptedLeft, adaptedRight);
assertions += 5;

// Both roles still cover width: select the weaker verified match fit,
// re-evaluating the CURRENT match lineup after a managerial change.
const original = modify(modify(xi, "LB", { matchScore: 65 }),
  "RB", { matchScore: 85 });
const strengthenedLeft = modify(original, "LB", {
  playerId: "manager-new-left-back", matchScore: 90
});
const initial = phase(original);
const revised = phase(strengthenedLeft);
assert.equal(initial.evidence.opponentFlankAdaptation.selectedFlank, "left");
assert.equal(initial.evidence.opponentFlankAdaptation.reason,
  "weaker_documented_role_fit");
assert.equal(revised.evidence.opponentFlankAdaptation.selectedFlank, "right");
assert.equal(revised.evidence.opponentFlankAdaptation.reason,
  "weaker_documented_role_fit");
assert.ok(initial.routeCoverAdjustment < revised.routeCoverAdjustment,
  "better weakest-role fit preserves more of the existing cover term");
assertNoExtraBonus(initial, revised);
// A player swap must not rewrite the SIMULATED opponent's next available
// route or previous saved period; only a new resolve reads the new lineup.
assert.equal(phase(original).evidence.opponentFlankAdaptation.selectedFlank, "left");
assert.deepEqual(phase(JSON.parse(JSON.stringify(strengthenedLeft))),
  phase(strengthenedLeft), "save/replay gives the same tactical response");
assertions += 9;

// Same draw near the exact containment threshold can change terminal status
// when real defensive role coverage changes. Never grant another bonus.
const mid = (manualRight.containmentProbability +
  adaptedLeft.containmentProbability) / 2;
assert.equal(phase(leftGap, policy, mid).status, "escaped");
assert.equal(phase(leftGap, { ...policy, pressEscapeTargetFlank: "right" }, mid).status,
  "contained");
assert.equal(phase(leftGap, policy, mid).xgDeltaAgainst, 0.06);
assert.equal(phase(leftGap, { ...policy, pressEscapeTargetFlank: "right" }, mid)
  .xgDeltaAgainst, 0.02);
assertions += 4;

// Never infer a weakness from unknown roles, incomplete backs or ties.
for (const players of [
  modify(xi, "LB", { matchFitKnown: false }),
  xi.filter(player => player.position !== "LB"),
  modify(modify(xi, "LB", { matchScore: 74 }),
    "RB", { matchScore: 76 }),
  modify(modify(xi, "LB", { roleId: "overlapping_fullback" }),
    "RB", { roleId: "overlapping_fullback" })
]) {
  const ambiguous = phase(players);
  assert.equal(ambiguous.evidence.opponentFlankAdaptation.status,
    "insufficient_or_conflicting_evidence");
  assert.equal(ambiguous.evidence.documentedTargetFlank, null);
  assert.equal(ambiguous.counterplay?.simulatedTargetFlank, undefined);
  assertions += 3;
}
// The feature requires explicit policy and a route confirmed as available.
// It never invents a route, overrides observed isolation or changes old saves.
for (const behaviour of [
  { pressEscapeRoute: "switch_play" },
  { ...policy, pressEscapeTargetPolicy: "unknown_policy" },
  { ...policy, pressEscape: "isolated" },
  { pressEscape: "supported", pressEscapeTargetPolicy: "weakest_verified_flank" },
  { ...policy, pressEscapeActionSequence: { route: "switch_play" } }
]) {
  const result = phase(leftGap, behaviour);
  assert.equal(result.evidence.opponentFlankAdaptation?.status === "selected",
    false, "unknown or conflicting evidence cannot select a flank");
  assert.equal(result.evidence.documentedTargetFlank, null);
  assertions += 2;
}
// Existing plan identifiers all use the same causal protection test.
for (const plan of ["midfield_press_trap", "high_press_343",
  "counter_press_recovery"]) {
  const result = phase(rightGap, policy, 0.99, plan);
  assert.equal(result.evidence.opponentFlankAdaptation.selectedFlank, "right");
  assert.equal(result.evidence.resolvedEscapePathway, "switch_play");
  assert.equal(result.routeCoverAdjustment, 0);
  assertions += 3;
}
// Genuine in-match activation: the opponent reacts to a scoreboard lead.
// The already documented wide outlet is retained ONLY for this new session,
// and only when the changed opponent profile supports a press escape.
const liveBase = {
  ...situation(leftGap, { pressEscapeRoute: "switch_play" }),
  causalOpponentFlankAdaptationVersion: 1,
  opponent: { ...opponent, pressResistance: 85,
    tacticalBehaviour: { pressEscapeRoute: "switch_play" } },
  timeline: [{}], score: { for: 1, against: 0 }
};
const adjusted = applyOpponentAdaptation(liveBase);
assert.notEqual(adjusted, liveBase);
assert.equal(adjusted.opponentAdjustments.length, 1);
assert.equal(adjusted.opponentAdjustments[0].id, "push_up");
assert.equal(adjusted.opponent.tacticalBehaviour.pressEscape, "supported");
assert.equal(adjusted.opponent.tacticalBehaviour.pressEscapeRoute, "switch_play");
assert.equal(adjusted.opponent.tacticalBehaviour.pressEscapeTargetPolicy,
  "weakest_verified_flank");
const inMatch = resolveOwnPressAgainstOpponent(adjusted, {
  pressureRoll: () => 0.99, protectionRoll: () => 0.99
});
assert.equal(inMatch.evidence.opponentFlankAdaptation.selectedFlank, "left");
assert.equal(inMatch.counterplay.simulatedTargetFlank, "left");
const legacySession = applyOpponentAdaptation({
  ...liveBase, causalOpponentFlankAdaptationVersion: undefined
});
assert.equal(legacySession.opponent.tacticalBehaviour.pressEscapeTargetPolicy,
  undefined, "old saves never silently gain adaptive scouting");
const routeUnknown = applyOpponentAdaptation({
  ...liveBase, opponent: { ...liveBase.opponent,
    tacticalBehaviour: { pressEscape: "supported" } }
});
assert.equal(routeUnknown.opponent.tacticalBehaviour.pressEscapeTargetPolicy,
  undefined, "generic opposition profile cannot invent a flank route");
const poorEvidence = applyOpponentAdaptation({
  ...liveBase, opponent: { ...liveBase.opponent, pressResistance: 65 }
});
assert.equal(poorEvidence.opponent.tacticalBehaviour.pressEscapeTargetPolicy,
  undefined, "weak scouting data cannot create verified escape");
assert.equal(applyOpponentAdaptation(adjusted), adjusted,
  "the same in-match opponent adjustment is not applied twice");
assertions += 13;

console.log(JSON.stringify({
  ok: true, version: "v7.1", verifiedAssertions: assertions,
  tested: ["left/right role gap", "known match-fit weakness",
    "manager lineup response", "RNG counterfactual", "neutral missing evidence",
    "manual scouting priority", "three pressing plans", "save/replay"],
  premise: "explicit opponent policy, no speculative scouting or extra xG"
}, null, 2));
