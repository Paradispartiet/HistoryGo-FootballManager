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
let checks = 0;
const newFlag = { causalOpponentSequenceVersion: 1 };
const opening = phase(baseline, policy, 0.99, newFlag);
assert.equal(opening.status, "escaped");
assert.equal(opening.evidence.opponentRouteAdaptation.selectedRoute, "third_man");
assert.equal(opening.evidence.opponentRouteAdaptation.sequence.status, "first_executed_route");
assert.equal(opening.evidence.opponentRouteAdaptation.sequence.phaseNumber, 1);
assert.ok(opening.evidence.opponentRouteAdaptation.candidates
  .every(candidate => candidate.defenders.length > 0));
checks += 5;

const timeline1 = [{ segment: 0, tacticalPhase: opening }];
const held = phase(baseline, policy, 0.99, { ...newFlag, timeline: timeline1 });
const unchanged = held.evidence.opponentRouteAdaptation.sequence;
assert.equal(unchanged.status, "held_route");
assert.equal(unchanged.previousRoute, "third_man");
assert.equal(unchanged.currentRoute, "third_man");
assert.deepEqual(unchanged.coverChanges, []);
assert.equal(held.xgDeltaAgainst, opening.xgDeltaAgainst);
checks += 5;

// Manager changes the verified central-midfield and centre-back coverage.
// The next match phase reevaluates the *same* authored routes, without
// observing fictional tracking data or applying another xG modifier.
const revised = revise(revise(baseline, "CM", {
  playerId: "new-verified-cm", matchScore: 92
}), "CB", { matchScore: 64 });
const timeline2 = [...timeline1, { segment: 1, tacticalPhase: held }];
const changed = phase(revised, policy, 0.99, {
  ...newFlag, timeline: timeline2,
  substitutions: [{ atPhase: "event_2", outPlayerId: "v72-3",
    inPlayerId: "new-verified-cm" }]
});
const follow = changed.evidence.opponentRouteAdaptation.sequence;
assert.equal(changed.evidence.opponentRouteAdaptation.selectedRoute, "direct");
assert.equal(follow.status, "switched_route");
assert.equal(follow.previousPhaseNumber, 2);
assert.equal(follow.phaseNumber, 3);
assert.equal(follow.previousRoute, "third_man");
assert.equal(follow.currentRoute, "direct");
assert.ok(follow.coverChanges.some(entry => entry.route === "third_man" &&
  entry.defendersChanged && entry.currentDefenders.some(p =>
    p.playerId === "new-verified-cm")));
assert.ok(follow.coverChanges.some(entry => entry.route === "direct"));
assert.match(changed.cause, /forrige dokumenterte pressfase/);
assert.equal(changed.xgDeltaAgainst, opening.xgDeltaAgainst);
assert.deepEqual(phase(JSON.parse(JSON.stringify(revised)), policy, 0.99,
  { ...newFlag, timeline: JSON.parse(JSON.stringify(timeline2)) }).evidence
  .opponentRouteAdaptation.sequence, follow);
checks += 11;

// Existing saves and new games missing v7.3 stay on the byte-equivalent
// v7.2 evidence contract: no defender snapshots or guessed sequence.
const legacy = phase(revised, policy, 0.99, {
  timeline: timeline2, causalOpponentSequenceVersion: undefined
});
assert.equal(legacy.evidence.opponentRouteAdaptation.sequence, undefined);
assert.equal(legacy.evidence.opponentRouteAdaptation.candidates[0].defenders, undefined);
assert.equal(legacy.evidence.opponentRouteAdaptation.selectedRoute, "direct");
checks += 3;

// Explicitly authored routes and ambiguous scouting retain precedence.
const explicit = phase(revised, { ...policy, pressEscapeRoute: "direct" },
  0.99, { ...newFlag, timeline: timeline2 });
assert.equal(explicit.evidence.opponentRouteAdaptation, undefined);
const ambiguous = phase(revise(baseline, "CM", { matchScore: 83 }),
  policy, 0.99, newFlag);
assert.equal(ambiguous.evidence.opponentRouteAdaptation.status,
  "insufficient_or_conflicting_evidence");
assert.equal(ambiguous.evidence.opponentRouteAdaptation.sequence, undefined);
checks += 3;

// A regained first press does NOT count as an executed opposition route.
// A later phase must compare against the last executed escape, not a
// route the opponent never used.
const recovered = resolveOwnPressAgainstOpponent(match(revised, policy,
  { ...newFlag, timeline: timeline2 }), {
    pressureRoll: () => 0, protectionRoll: () => 0.99
  });
assert.equal(recovered.status, "regain");
assert.equal(recovered.evidence.opponentRouteAdaptation.sequence.status,
  "press_regained");
const resumed = phase(revised, policy, 0.99, {
  ...newFlag, timeline: [...timeline2,
    { segment: 2, tacticalPhase: recovered }]
});
assert.equal(resumed.evidence.opponentRouteAdaptation.sequence.previousPhaseNumber, 2);
checks += 3;

console.log(JSON.stringify({
  ok: true, version: "v7.3", checks,
  coverage: ["multiple phases", "manager roster counterplay",
    "individual defensive evidence", "save/replay determinism",
    "legacy neutral", "ambiguous routes", "regained press ignored",
    "unchanged xG and probabilities"]
}, null, 2));
