// Deterministic causal pressing: high press, mid-block trap, counterpress and escapes.
import assert from "node:assert/strict";
import { resolveOwnPressAgainstOpponent, annotateOwnPressChances }
  from "../src/football-matchday-own-press-v6.js";
import { advanceMatchClock, finalizeMatchdaySession }
  from "../src/football-matchday-engine.js";
import { highPressPhaseRoll }
  from "../src/football-matchday-high-press-v6.js";

const lineup = ["GK", "CB", "DM", "CM", "AM", "ST", "LW", "RW", "LB", "RB"].map((position, i) => ({
  playerId: "press-" + i, position, roleId: "role_" + position,
  matchScore: 75, matchFitKnown: true
}));
const opponent = {
  id: "possession_opponent", strength: 72, defensiveStructure: 69,
  pressResistance: 72, transitionThreat: 78,
  styleTraits: { shortBuildUp: 82, possessionControl: 80, transitionThreat: 78,
    highLine: 67, defensiveCompactness: 54, pressIntensity: 55 }
};
function session(plan = "high_press_343", changes = {}) {
  return {
    id: "press-testing-1",
    version: 2, causalPressingVersion: 1, causalCompactBlockVersion: 1,
    causalTransitionsVersion: 1,
    selectedTacticId: plan, tacticSnapshot: { id: plan },
    opponent, lineupSnapshot: lineup,
    teamFitSnapshot: { historicalScore: 70, tacticalProfile: {
      pressScore: 78, balanceScore: 74, restDefenseScore: 71,
      buildUpScore: 69, depthScore: 71, widthScore: 69,
      relationshipScore: 72, teamScore: 75
    }},
    strengthSnapshot: { finalStrength: 74, modifiers: { missing: 0 } },
    planMatchup: { edge: 1.5 },
    events: [], timeline: [], minuteLog: [], score: { for: 0, against: 0 },
    decisions: [], substitutions: [], planChanges: [],
    ...changes
  };
}
const resolve = (s, p, c) => resolveOwnPressAgainstOpponent(s, {
  pressureRoll: () => p, protectionRoll: () => c
});

const routes = { high_press_343: "front_press",
  midfield_press_trap: "midfield_trap", counter_press_recovery: "recovery_press" };
for (const [plan, route] of Object.entries(routes)) {
  const phase = resolve(session(plan), 0, 0);
  assert.equal(phase.situation, "our_press_vs_opponent_build_up");
  assert.equal(phase.route, route);
  assert.equal(phase.status, "regain");
  assert.equal(phase.side, "for");
  assert.equal(phase.steps.length, 4);
  assert.equal(phase.evidence.support.length, plan === "counter_press_recovery" ? 3 : 4);
  assert.ok(phase.xgDeltaFor > 0);
  assert.equal(phase.xgDeltaAgainst, -0.01);
}
const base = resolve(session(), 0.4, 0.4);
const counter = resolve(session("high_press_343", {
  opponent: { ...opponent, tacticalBehaviour: { pressEscapeRoute: "third_man" } }
}), 0.4, 0.4);
assert.ok(counter.probability < base.probability, "known third-man escape defeats some pressing");
assert.equal(counter.evidence.opponentEscapeRoute, "third_man");
// Different known offensive exits must resolve to different *causal* sequences,
// not one generic press-bypass explanation. No extra xG is awarded per step.
const knownExit = route => session("midfield_press_trap", {
  opponent: { ...opponent, tacticalBehaviour: { pressEscapeRoute: route } }
});
const three = resolve(knownExit("third_man"), 0.99, 0.99);
const switchExit = resolve(knownExit("switch_play"), 0.99, 0.99);
const directExit = resolve(knownExit("direct"), 0.99, 0.99);
for (const [phase, pathway, channel] of [
  [three, "third_man", "central_between_lines"],
  [switchExit, "switch_play", "far_side_wide"],
  [directExit, "direct", "depth_behind_press"]
]) {
  assert.equal(phase.status, "escaped");
  assert.equal(phase.counterplay?.pathwayId, pathway);
  assert.equal(phase.evidence.resolvedEscapePathway, pathway);
  assert.equal(phase.counterplay?.exposedChannel, channel);
  assert.equal(phase.counterplay?.actions.length, 4);
  assert.ok(phase.counterplay.actions.every(action => action.result === "completed"));
  assert.equal(phase.counterplay.basis, "simulated_tactical_hypothesis_v6");
  assert.equal(phase.xgDeltaAgainst, 0.06, "one terminal concession, not four");
}
assert.notDeepEqual(three.counterplay.actions, switchExit.counterplay.actions);
assert.notEqual(three.cause, switchExit.cause);
assert.notEqual(switchExit.cause, directExit.cause);
const thirdPrevented = resolve(knownExit("third_man"), 0, 0);
assert.equal(thirdPrevented.counterplay.status, "prevented");
assert.deepEqual(thirdPrevented.counterplay.actions.map(a => a.result),
  ["interrupted", "not_reached", "not_reached", "not_reached"]);
const switchContained = resolve(knownExit("switch_play"), 0.99, 0);
assert.equal(switchContained.counterplay.status, "contained_by_rest_defence");
assert.equal(switchContained.counterplay.actions[3].result, "contained");
assert.equal(switchContained.side, null);
const observedUnknownPath = resolve(session("midfield_press_trap", {
  opponent: { ...opponent, tacticalBehaviour: { pressEscape: "supported" } }
}), 0.99, 0.99);
assert.ok(observedUnknownPath.probability < resolve(session("midfield_press_trap"), 0.99, 0.99).probability);
assert.equal(observedUnknownPath.counterplay, null,
  "generic supported outlet must not invent a named four-pass route");
const isolationOverride = resolve(session("midfield_press_trap", {
  opponent: { ...opponent, tacticalBehaviour: {
    pressEscape: "isolated", pressEscapeRoute: "third_man"
  } }
}), 0.99, 0.99);
assert.equal(isolationOverride.counterplay, null);
assert.equal(isolationOverride.evidence.resolvedEscapePathway, "unknown");
const highFullbacksSwitch = resolve(session("midfield_press_trap", {
  opponent: knownExit("switch_play").opponent,
  lineupSnapshot: lineup.map(player => ["LB", "RB"].includes(player.position)
    ? { ...player, roleId: "overlapping_fullback" } : player)
}), 0.99, 0.99);
assert.equal(highFullbacksSwitch.counterplay.advancedFullbacks.length, 2);
assert.equal(switchExit.counterplay.advancedFullbacks.length, 0);
assert.equal(highFullbacksSwitch.containmentProbability,
  switchExit.containmentProbability,
  "advanced fullback evidence is not a second hidden defensive penalty");
const annotatedSwitch = annotateOwnPressChances([
  { side: "against", quality: 0.1 }
], switchExit);
assert.equal(annotatedSwitch[0].tacticalMoment.counterplay.pathwayId, "switch_play");
const resistant = resolve(session("high_press_343", {
  opponent: { ...opponent, pressResistance: 90 }
}), 0.4, 0.4);
assert.ok(resistant.probability < base.probability, "opponent press resistance matters");
const weakPlayers = resolve(session("high_press_343", {
  lineupSnapshot: lineup.map(p =>
    ["ST","LW","RW","DM","CM","CB"].includes(p.position)
      ? { ...p, matchScore: 44 } : p)
}), 0.4, 0.4);
assert.ok(base.probability > weakPlayers.probability,
  "same formation but worse collective role compatibility");
const regained = resolve(session(), 0, 0);
const contained = resolve(session(), 0.99, 0);
const escaped = resolve(session(), 0.99, 0.99);
assert.deepEqual([regained.status, contained.status, escaped.status],
  ["regain", "contained", "escaped"]);
assert.deepEqual([regained.xgDeltaAgainst, contained.xgDeltaAgainst, escaped.xgDeltaAgainst],
  [-0.01, 0.02, 0.06]);
assert.deepEqual([regained.side, contained.side, escaped.side], ["for", null, "against"]);
assert.ok(escaped.steps.some(s => s.result === "exposed"));
const exposed = resolve(session("high_press_343", {
  teamFitSnapshot: { ...session().teamFitSnapshot,
    tacticalProfile: {
      ...session().teamFitSnapshot.tacticalProfile, restDefenseScore: 42
    }}
}), 0.99, 0.99);
assert.equal(exposed.xgDeltaAgainst, 0.12);
assert.equal(resolve(session("high_press_343", {
  opponent: { ...opponent, styleTraits: { ...opponent.styleTraits, shortBuildUp: undefined } }
}), 0), null, "unknown build-up cannot trigger high press");
assert.equal(resolve(session("midfield_press_trap", {
  opponent: { ...opponent, styleTraits: { ...opponent.styleTraits, possessionControl: 40 } }
}), 0), null);
assert.equal(resolve(session("counter_press_recovery", {
  opponent: { ...opponent, transitionThreat: undefined,
    styleTraits: { ...opponent.styleTraits, transitionThreat: undefined } }
}), 0), null);
assert.equal(resolve(session("high_press_343", {
  opponent: { ...opponent, pressResistance: undefined }
}), 0), null);
assert.equal(resolve(session("high_press_343", {
  lineupSnapshot: lineup.map(p => p.position === "ST"
    ? { ...p, matchFitKnown: false } : p)
}), 0), null, "undocumented fit cannot masquerade as high press striker");
assert.equal(resolve(session("high_press_343", { causalPressingVersion: undefined }), 0), null);
assert.equal(resolve(session("wide_fast_433"), 0), null);
const shots = [{ side: "against", quality: 0.12 }, { side: "for", quality: 0.08 }];
assert.equal(annotateOwnPressChances(shots, contained), shots,
  "contained opponent escape must not claim a distinct shot");
assert.equal(annotateOwnPressChances(shots, escaped).filter(s => s.tacticalMoment).length, 1);
assert.equal(annotateOwnPressChances(shots, regained)[1].tacticalMoment.kind, "press_regain");
assert.equal(annotateOwnPressChances([], regained).length, 0, "no synthetic shots");

function seedFor(outcome) {
  for (let i = 0; i < 3000; i += 1) {
    const seed = session("high_press_343", { id: "press-match-" + i });
    const phase = resolve(seed,
      highPressPhaseRoll(seed, "0:own-pressure"),
      highPressPhaseRoll(seed, "0:press-protection"));
    if (phase?.status === outcome) return seed;
  }
  throw new Error("No deterministic press scenario " + outcome);
}
const oldRandom = Math.random;
try {
  Math.random = () => 0.99;
  for (const outcome of ["regain","contained","escaped"]) {
    const seed = seedFor(outcome);
    const played = advanceMatchClock(seed);
    const period = played.timeline[0];
    assert.equal(period.tacticalPhase.situation, "our_press_vs_opponent_build_up");
    assert.equal(period.tacticalPhase.status, outcome);
    assert.equal(period.tacticalXg, undefined, "no double payment of static edge");
    const diff = key => Math.round((period.expectedGoals[key] -
      period.baselineExpectedGoals[key]) * 100) / 100;
    assert.equal(diff("for"), period.tacticalPhase.xgDeltaFor);
    assert.equal(diff("against"), period.tacticalPhase.xgDeltaAgainst);
    assert.equal(played.minuteLog.length, period.chances);
    assert.equal(played.minuteLog.filter(m => m.tacticalMoment).length <= 1, true);
    assert.equal(advanceMatchClock(played), played);
    assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(seed))).timeline[0].tacticalPhase,
      period.tacticalPhase);
    const final = finalizeMatchdaySession(played);
    assert.equal(final.expectedGoals.for, period.expectedGoals.for);
    assert.equal(final.expectedGoals.against, period.expectedGoals.against);
  }
  const legacy = advanceMatchClock(session("high_press_343", {
    causalPressingVersion: undefined
  }));
  assert.equal(legacy.timeline[0].tacticalPhase, undefined);
} finally {
  Math.random = oldRandom;
}
console.log("OK: v6 own press, midblock, counterpress, known escape, non-stacked xG");
