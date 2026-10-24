// v7.3: persistent, evidence-based opponent reaction between simulated match phases.
// Same pressure RNG and same terminal xG gate as the existing v7 motor.
import assert from "node:assert/strict";
import { resolveOwnPressAgainstOpponent } from "../src/football-matchday-own-press-v6.js";
import { applyOpponentAdaptation } from "../src/football-matchday-engine.js";

const positions = ["GK","CB","DM","CM","AM","ST","LW","RW","LB","RB","CB"];
const roles = {
  CB: "ball_playing_centre_back", DM: "balancing_six",
  CM: "pressing_midfielder", LB: "support_fullback", RB: "support_fullback"
};
const baseline = positions.map((position, i) => ({
  playerId: "v72-" + i, position, roleId: roles[position] || "role_" + position,
  matchFitKnown: true, matchScore: position === "DM" ? 84 :
    position === "CM" ? 64 : position === "CB" ? 83 : 75
}));
const opponent = {
  id: "v72-opponent", strength: 72, pressResistance: 85,
  defensiveStructure: 69, transitionThreat: 78,
  styleTraits: { shortBuildUp: 82, possessionControl: 80, transitionThreat: 78 }
};
const profile = {
  pressScore: 78, balanceScore: 74, restDefenseScore: 71,
  buildUpScore: 69, depthScore: 71, widthScore: 69,
  relationshipScore: 72, teamScore: 75
};
const policy = {
  pressEscape: "supported",
  pressEscapeRoutePolicy: "weakest_verified_cover",
  pressEscapeCandidateRoutes: ["third_man", "direct"]
};
function match(lineupSnapshot, tacticalBehaviour, additions = {}) {
  return {
    id: "v72-match", version: 2, causalPressingVersion: 1,
    causalOpponentRouteAdaptationVersion: 1,
    selectedTacticId: "midfield_press_trap",
    tacticSnapshot: { id: "midfield_press_trap" },
    lineupSnapshot,
    opponent: { ...opponent, tacticalBehaviour },
    teamFitSnapshot: { tacticalProfile: profile, historicalScore: 70 },
    strengthSnapshot: { finalStrength: 74, modifiers: { missing: 0 } },
    planMatchup: { edge: 1.5 }, timeline: [], minuteLog: [],
    events: [], decisions: [], substitutions: [], planChanges: [],
    score: { for: 0, against: 0 }, ...additions
  };
}
function phase(lineup, behaviour = policy, protection = 0.99, additions = {}) {
  return resolveOwnPressAgainstOpponent(match(lineup, behaviour, additions), {
    pressureRoll: () => 0.99, protectionRoll: () => protection
  });
}
function revise(lineup, pos, changes) {
  return lineup.map(p => p.position === pos ? { ...p, ...changes } : p);
}
// v7.4: a deliberate manager press counter must cause an on-pitch tradeoff,
// not award free xG or infer an unseen opposing attack route.
import { applyMatchPressCounter } from "../src/football-matchday-engine.js";
import { getManagerPressCounterOptions } from "../src/football-matchday-own-press-v6.js";

let checks = 0;
const flags = {
  causalOpponentSequenceVersion: 1,
  causalManagerPressCounterVersion: 1
};
const opening = phase(baseline, policy, 0.99, flags);
assert.equal(opening.status, "escaped");
assert.equal(opening.evidence.opponentRouteAdaptation.selectedRoute, "third_man");
const played = [{
  segment: 0, range: { from: 1, to: 23 }, tacticalPhase: opening
}];
const current = match(baseline, policy, {
  ...flags, timeline: played, phase: "event_1", liveMinute: 23
});
const options = getManagerPressCounterOptions(current);
assert.equal(options.observedRoute, "third_man");
assert.deepEqual(options.routes, ["third_man"],
  "Never offer a fully capped or otherwise inert counter");
checks += 4;

const premature = { ...current, liveMinute: 15 };
assert.equal(applyMatchPressCounter(premature, "third_man"), premature);
assert.equal(applyMatchPressCounter(current, "unverified_route"), current);
const acted = applyMatchPressCounter(current, "third_man");
assert.notEqual(acted, current);
assert.deepEqual(acted.managerPressCounter, {
  route: "third_man", observedRoute: "third_man", sourceSegment: 0,
  basis: "manager_choice_after_verified_executed_press"
});
assert.equal(acted.timeline, current.timeline,
  "Completed periods remain the same objects");
assert.ok(acted.minuteLog.some(e => e.type === "counter"));
assert.equal(getManagerPressCounterOptions(acted), null,
  "One decision only per completed phase");
checks += 6;

// Simulate the NEXT period with identical playing XI and deterministic
// RNG: the opponent selects the exposed direct outlet, not a fictitious
// extra route; pressure chance remains exactly unchanged.
const unchanged = phase(baseline, policy, 0.99, {
  ...flags, timeline: played
});
const adjusted = resolveOwnPressAgainstOpponent(acted, {
  pressureRoll: () => 0.99, protectionRoll: () => 0.99
});
const info = adjusted.evidence.opponentRouteAdaptation;
assert.equal(info.selectedRoute, "direct");
assert.equal(info.managerCounter.status, "redistributed");
assert.equal(info.managerCounter.prioritisedRoute, "third_man");
assert.equal(info.managerCounter.exposedRoute, "direct");
assert.ok(info.managerCounter.transfer > 0);
assert.equal(adjusted.counterplay.pathwayId, "direct");
assert.equal(adjusted.probability, unchanged.probability);
assert.equal(adjusted.xgDeltaAgainst, unchanged.xgDeltaAgainst);
assert.equal(adjusted.evidence.opponentEscapeRoute, "unknown");
assert.match(adjusted.cause, /omfordelt kjent sikring/);
checks += 10;

const original = unchanged.evidence.opponentRouteAdaptation.candidates;
const changed = info.candidates;
const sum = array => array.reduce((total, entry) =>
  total + entry.coverAdjustment, 0);
assert.equal(Math.round(sum(original) * 1000),
  Math.round(sum(changed) * 1000),
  "The manager cannot create a second cover bonus");
assert.ok(changed.every(item => item.coverAdjustment >= 0 &&
  item.coverAdjustment <= 0.03));
assert.ok(changed.find(item => item.route === "third_man").coverAdjustment >
  original.find(item => item.route === "third_man").coverAdjustment);
assert.ok(changed.find(item => item.route === "direct").coverAdjustment <
  original.find(item => item.route === "direct").coverAdjustment);
checks += 4;

// Scenario and saved-session parity.
const restored = JSON.parse(JSON.stringify(acted));
assert.deepEqual(resolveOwnPressAgainstOpponent(restored, {
  pressureRoll: () => 0.99, protectionRoll: () => 0.99
}), adjusted);
const legacy = phase(baseline, policy, 0.99, {
  ...flags, causalManagerPressCounterVersion: undefined,
  timeline: played, managerPressCounter: acted.managerPressCounter
});
assert.equal(legacy.evidence.opponentRouteAdaptation.selectedRoute,
  unchanged.evidence.opponentRouteAdaptation.selectedRoute);
assert.equal(legacy.evidence.opponentRouteAdaptation.managerCounter, undefined);
assert.equal(getManagerPressCounterOptions(match(baseline, policy, {
  ...flags, causalManagerPressCounterVersion: undefined,
  timeline: played, phase: "event_1"
})), null);
checks += 4;

// An unknown, regained or explicitly authored route never permits a manager
// to trigger this new mechanism.
const recovered = resolveOwnPressAgainstOpponent(match(baseline, policy, flags), {
  pressureRoll: () => 0, protectionRoll: () => 0.99
});
assert.equal(getManagerPressCounterOptions({
  ...current, timeline: [{ segment: 0, tacticalPhase: recovered }]
}), null);
const explicit = match(baseline,
  { ...policy, pressEscapeRoute: "direct" }, {
    ...flags, timeline: played, phase: "event_1"
  });
assert.equal(getManagerPressCounterOptions(explicit), null);
assert.equal(applyMatchPressCounter(explicit, "third_man"), explicit);
checks += 3;

console.log(JSON.stringify({
  ok: true, version: "v7.4", checks,
  tests: ["real completed phase", "manager decision", "no inert counter",
    "opponent changes route", "zero sum coverage", "same RNG and terminal xG",
    "unchanged old saves", "serialized deterministic replay",
    "neutral unknown evidence", "preplay prevented"]
}, null, 2));
