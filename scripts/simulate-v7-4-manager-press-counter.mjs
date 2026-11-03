// v7.3: persistent, evidence-based opponent reaction between simulated match phases.
// Same pressure RNG and same terminal xG gate as the existing v7 motor.
import assert from "node:assert/strict";
import { resolveOwnPressAgainstOpponent, getManagerPressCounterOptions } from "../src/football-matchday-own-press-v6.js";
import { applyMatchPressCounter } from "../src/football-matchday-engine.js";

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
let checks = 0;
const optIn = { causalOpponentSequenceVersion: 1,
  causalManagerPressCounterVersion: 1 };
const first = phase(baseline, policy, 0.99, optIn);
assert.equal(first.status, "escaped");
assert.equal(first.evidence.opponentRouteAdaptation.selectedRoute, "third_man");
assert.equal(first.evidence.opponentRouteAdaptation.managerCounter, undefined);
checks += 3;

const watched = match(baseline, policy, {
  ...optIn, phase: "event_1", liveMinute: 23,
  timeline: [{ segment: 0, range: { from: 1, to: 23 }, tacticalPhase: first }]
});
const original = JSON.parse(JSON.stringify(watched));
const available = getManagerPressCounterOptions(watched);
assert.equal(available.observedRoute, "third_man");
assert.deepEqual(available.routes, ["third_man"],
  "cannot offer a fully capped cover focus with no recipient capacity");
assert.equal(available.sourceSegment, 0);
checks += 3;

// A deliberate manager action trades a share of the already earned
// direct-route cover for more cover against third-man, with zero total gain.
const instructed = applyMatchPressCounter(watched, "third_man");
assert.notEqual(instructed, watched);
assert.equal(watched.managerPressCounter, undefined);
assert.deepEqual(watched, original);
assert.equal(instructed.managerPressCounter.route, "third_man");
assert.equal(instructed.managerPressCounter.sourceSegment, 0);
assert.equal(instructed.minuteLog.at(-1).type, "counter");
assert.equal(getManagerPressCounterOptions(instructed), null,
  "same observed phase cannot be used to issue repeated free instructions");
checks += 7;

const byPhases = (session, protection = 0.99) =>
  resolveOwnPressAgainstOpponent(session, {
    pressureRoll: () => 0.99, protectionRoll: () => protection
  });
const uncountered = byPhases(watched);
const afterCounter = byPhases(instructed);
const route = afterCounter.evidence.opponentRouteAdaptation;
const reallocation = route.managerCounter;
assert.equal(uncountered.evidence.opponentRouteAdaptation.selectedRoute, "third_man");
assert.equal(route.selectedRoute, "direct");
assert.equal(reallocation.prioritisedRoute, "third_man");
assert.equal(reallocation.exposedRoute, "direct");
assert.equal(reallocation.transfer, 0.017);
assert.equal(afterCounter.routeCoverAdjustment, 0.013);
assert.equal(uncountered.routeCoverAdjustment, 0.006);
assert.equal(afterCounter.evidence.opponentRouteAdaptation.sequence.status, "switched_route");
assert.equal(route.candidates.reduce((n, x) => n + x.coverAdjustment, 0).toFixed(3),
  first.evidence.opponentRouteAdaptation.candidates
    .reduce((n, x) => n + x.coverAdjustment, 0).toFixed(3));
assert.equal(afterCounter.probability, uncountered.probability);
assert.ok(afterCounter.containmentProbability > uncountered.containmentProbability);
checks += 11;

// The exact same RNG crosses a REAL pre-existing containment boundary.
// Changed outcome uses the one original xG event; no second bonus is created.
const threshold = (afterCounter.containmentProbability +
  uncountered.containmentProbability) / 2;
assert.equal(byPhases(watched, threshold).status, "escaped");
assert.equal(byPhases(instructed, threshold).status, "contained");
assert.equal(byPhases(watched, threshold).xgDeltaAgainst, 0.06);
assert.equal(byPhases(instructed, threshold).xgDeltaAgainst, 0.02);
assert.equal(afterCounter.xgDeltaAgainst, uncountered.xgDeltaAgainst);
checks += 5;

// Cannot choose before the player watches the phase, before kick-off,
// without opt-in, from the wrong route, or after a regained press.
assert.equal(applyMatchPressCounter({ ...watched, liveMinute: 22 }, "third_man").managerPressCounter, undefined);
const preMatch = { ...watched, phase: "pre_match" };
assert.equal(applyMatchPressCounter(preMatch, "third_man"), preMatch);
assert.equal(applyMatchPressCounter(watched, "unobserved"), watched);
const oldSave = { ...watched, causalManagerPressCounterVersion: undefined };
assert.equal(applyMatchPressCounter(oldSave, "third_man"), oldSave);
assert.equal(getManagerPressCounterOptions(oldSave), null);
const gain = resolveOwnPressAgainstOpponent(match(baseline, policy, optIn), {
  pressureRoll: () => 0, protectionRoll: () => 0.99
});
assert.equal(getManagerPressCounterOptions({
  ...watched, timeline: [{ segment: 0, range: { to: 23 }, tacticalPhase: gain }]
}), null);
checks += 7;

const legacyPeriod = byPhases({ ...watched, causalManagerPressCounterVersion: undefined,
  managerPressCounter: instructed.managerPressCounter });
assert.equal(legacyPeriod.routeCoverAdjustment, uncountered.routeCoverAdjustment);
assert.equal(legacyPeriod.evidence.opponentRouteAdaptation.managerCounter, undefined);
assert.deepEqual(byPhases(JSON.parse(JSON.stringify(instructed))), afterCounter);
checks += 3;

// After a NEW executed phase, a new counter is allowed. Older snapshots and
// the earned xG from the previous segment remain unchanged.
const observedAgain = {
  ...instructed, phase: "event_2", liveMinute: 45,
  timeline: [...instructed.timeline, {
    segment: 1, range: { from: 24, to: 45 }, tacticalPhase: afterCounter
  }]
};
const newOptions = getManagerPressCounterOptions(observedAgain);
assert.equal(newOptions.sourceSegment, 1);
assert.ok(newOptions.routes.includes("third_man"));
assert.equal(observedAgain.timeline[0].tacticalPhase, first);
checks += 3;

console.log(JSON.stringify({
  ok: true, version: "v7.4", checks,
  cases: ["watched-phase eligibility", "single manager counter instruction",
    "cover conservation", "opponent reroutes", "real containment and xG outcome",
    "legacy neutral", "unknown route rejection", "save determinism",
    "repeat action guard"]
}, null, 2));
