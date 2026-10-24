// v7.2: multiple AUTHORED available outlets, evidence-based choice at runtime.
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
let checks = 0;
const first = phase(baseline);
assert.equal(first.evidence.opponentEscapeRoute, "unknown",
  "route candidate list is not an authored single escape route");
assert.equal(first.evidence.opponentRouteAdaptation.selectedRoute, "third_man");
assert.equal(first.counterplay.pathwayId, "third_man");
assert.equal(first.counterplay.opponentRouteAdaptation.selectedRoute, "third_man");
assert.equal(first.evidence.opponentRouteAdaptation.candidates.length, 2);
assert.match(first.cause, /tredjemann sentralt/);
assert.equal(first.xgDeltaAgainst, 0.06);
checks += 7;

// Improve our weak central CM, then weaken a CB. The same opponent switches
// from third-man to direct, with no new attack route inferred from ratings.
const changed = revise(revise(baseline, "CM", {
  playerId: "manager-new-cm", matchScore: 92
}), "CB", { matchScore: 64 });
const later = phase(changed);
assert.equal(later.evidence.opponentRouteAdaptation.selectedRoute, "direct");
assert.equal(later.counterplay.pathwayId, "direct");
assert.match(later.cause, /direkte utspill/);
assert.equal(later.xgDeltaAgainst, first.xgDeltaAgainst);
assert.equal(later.probability !== first.probability, true,
  "genuine player improvement still changes first-press fit");
assert.equal(phase(baseline).evidence.opponentRouteAdaptation.selectedRoute,
  "third_man", "previous saved lineup is unaffected");
assert.deepEqual(phase(JSON.parse(JSON.stringify(changed))), later,
  "reloaded snapshot is deterministic");
checks += 7;

// A supported left-to-right switch is compared fairly only if BOTH back
// roles are known, and the target side was verified by the prior v7.1 rule.
const exposedLeft = revise(revise(baseline, "CM", { matchScore: 92 }),
  "LB", { roleId: "overlapping_fullback" });
const widePolicy = { ...policy, pressEscapeCandidateRoutes: [
  "third_man", "switch_play", "direct"
] };
const wide = phase(exposedLeft, widePolicy);
assert.equal(wide.evidence.opponentRouteAdaptation.selectedRoute, "switch_play");
assert.equal(wide.evidence.opponentFlankAdaptation, undefined,
  "the route choice is recorded separately from authored v7.1-only policy");
assert.equal(wide.counterplay.simulatedTargetFlank, "left");
assert.equal(wide.evidence.documentedTargetFlank, null);
assert.equal(wide.routeCoverAdjustment, 0);
assert.equal(wide.counterplay.opponentRouteAdaptation.selectedRoute, "switch_play");
checks += 6;

// Exact same XI and rolls: choosing between authored routes can alter only
// the SINGLE existing cover gate, never grant a second xG line.
const manuallyCentral = phase(baseline, {
  pressEscape: "supported", pressEscapeRoute: "third_man"
});
const manuallyDirect = phase(baseline, {
  pressEscape: "supported", pressEscapeRoute: "direct"
});
assert.equal(first.probability, manuallyCentral.probability);
assert.equal(first.probability, manuallyDirect.probability);
assert.equal(first.routeCoverAdjustment, manuallyCentral.routeCoverAdjustment);
assert.equal(first.xgDeltaAgainst, manuallyCentral.xgDeltaAgainst);
assert.ok(manuallyDirect.routeCoverAdjustment > first.routeCoverAdjustment);
const boundary = (first.containmentProbability + manuallyDirect.containmentProbability) / 2;
assert.equal(phase(baseline, policy, boundary).status, "escaped");
assert.equal(phase(baseline, {
  pressEscape: "supported", pressEscapeRoute: "direct"
}, boundary).status, "contained");
assert.equal(phase(baseline, policy, boundary).xgDeltaAgainst, 0.06);
assert.equal(phase(baseline, {
  pressEscape: "supported", pressEscapeRoute: "direct"
}, boundary).xgDeltaAgainst, 0.02);
checks += 9;

// Near ties and unsupported evidence must be neutral: don't select an
// arbitrary route, or read an absent player/role as a scored weakness.
for (const [lineup, behaviour, additions] of [
  [revise(baseline, "CM", { matchScore: 83 }), policy],
  [revise(baseline, "DM", { matchFitKnown: false }), policy],
  [baseline.filter(p => p.position !== "DM"), policy],
  [baseline, { ...policy, pressEscape: "isolated" }],
  [baseline, { ...policy, pressEscapeCandidateRoutes: ["direct", "direct"] }],
  [baseline, { ...policy, pressEscapeCandidateRoutes: ["direct", "unobserved"] }],
  [baseline, { ...policy, pressEscapeCandidateRoutes: ["direct"] }],
  [baseline, { ...policy, pressEscapeTiming: { basis: "authored" } }],
  [baseline, { ...policy, pressEscapeActionSequence: { route: "direct" } }],
  [baseline, { ...policy, pressEscapeRoute: "direct" }],
  [baseline, policy, { causalOpponentRouteAdaptationVersion: undefined }]
]) {
  const neutral = phase(lineup, behaviour, 0.99, additions);
  assert.equal(neutral.evidence.opponentRouteAdaptation?.status === "selected", false);
  assert.equal(neutral.counterplay?.opponentRouteAdaptation, undefined);
  checks += 2;
}
// An explicitly authored single outlet wins, including when an alternate list
// is supplied; first-run and legacy saves never silently acquire v7.2.
assert.equal(phase(baseline, { ...policy, pressEscapeRoute: "direct" })
  .evidence.resolvedEscapePathway, "direct");
checks++;

// A genuine in-match opponent adjustment keeps only the previously authored
// route choices if the updated scouting profile supports a press escape.
const live = match(baseline, policy, {
  timeline: [{}], score: { for: 1, against: 0 }
});
const adapted = applyOpponentAdaptation(live);
assert.equal(adapted.opponentAdjustments.length, 1);
assert.equal(adapted.opponent.tacticalBehaviour.pressEscapeRoutePolicy,
  "weakest_verified_cover");
assert.deepEqual(adapted.opponent.tacticalBehaviour.pressEscapeCandidateRoutes,
  policy.pressEscapeCandidateRoutes);
const adaptedPhase = resolveOwnPressAgainstOpponent(adapted, {
  pressureRoll: () => 0.99, protectionRoll: () => 0.99
});
assert.equal(adaptedPhase.evidence.opponentRouteAdaptation.selectedRoute, "third_man");
const legacy = applyOpponentAdaptation({
  ...live, causalOpponentRouteAdaptationVersion: undefined
});
assert.equal(legacy.opponent.tacticalBehaviour.pressEscapeRoutePolicy, undefined);
const unsupported = applyOpponentAdaptation({
  ...live, opponent: { ...live.opponent, pressResistance: 60 }
});
assert.equal(unsupported.opponent.tacticalBehaviour.pressEscapeRoutePolicy, undefined);
assert.equal(applyOpponentAdaptation(adapted), adapted,
  "opponent reacts only once per authored game state");
checks += 7;

console.log(JSON.stringify({
  ok: true, version: "v7.2", checks, routeOptions: 3,
  tests: ["verified weakest route", "player counterfactual", "wide flank",
    "one containment gate", "explicit single-route precedence",
    "unknown evidence", "save/replay", "in-match adaptation", "legacy neutral"]
}, null, 2));
