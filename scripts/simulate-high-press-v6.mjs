// Focused deterministic regression for matchday v6's first playable situation.
import assert from "node:assert/strict";
import { resolveHighPressBuildUp, annotateHighPressBuildUpChances }
  from "../src/football-matchday-high-press-v6.js";
import { advanceMatchClock, finalizeMatchdaySession }
  from "../src/football-matchday-engine.js";

const highPress = {
  id: "high_press_opponent",
  strength: 74,
  defensiveStructure: 66,
  transitionThreat: 76,
  pressResistance: 62,
  matchupStyles: ["high_press"]
};
const player = (playerId, position, matchScore = 74, known = true) => ({
  playerId, position, roleId: "test_" + position.toLowerCase(),
  matchScore, matchFitKnown: known
});
const lineup = [
  player("gk", "GK"), player("cb", "CB"), player("dm", "DM"),
  player("cm", "CM"), player("am", "AM"), player("lb", "LB"),
  player("rb", "RB"), player("st", "ST")
];
function session(overrides = {}) {
  return {
    selectedFormationId: "same_433",
    selectedTacticId: "patient_build_up",
    tacticSnapshot: { id: "patient_build_up" },
    lineupSnapshot: lineup,
    opponent: highPress,
    teamFitSnapshot: {
      historicalScore: 65,
      tacticalProfile: {
        buildUpScore: 75, balanceScore: 73, widthScore: 71,
        depthScore: 72, restDefenseScore: 68,
        pressScore: 65, relationshipScore: 65, teamScore: 75
      }
    },
    strengthSnapshot: { finalStrength: 72, modifiers: { missing: 0 } },
    planMatchup: { edge: 1.5 },
    events: [], timeline: [], decisions: [], substitutions: [],
    planChanges: [], minuteLog: [], score: { for: 0, against: 0 },
    ...overrides
  };
}
function withProfile(changes, other = {}) {
  const s = session(other);
  return { ...s, teamFitSnapshot: {
    ...s.teamFitSnapshot,
    tacticalProfile: { ...s.teamFitSnapshot.tacticalProfile, ...changes }
  }};
}

const positive = resolveHighPressBuildUp(session(), { rng: () => 0.01 });
assert.equal(positive.route, "third_man");
assert.equal(positive.status, "breakthrough");
assert.equal(positive.steps.length, 4);
assert.equal(positive.evidence.support.length, 4);
assert.equal(positive.xgDeltaFor, 0.12);
assert.equal(positive.xgDeltaAgainst, -0.02);

const turnover = resolveHighPressBuildUp(session(), { rng: () => 0.99 });
assert.equal(turnover.status, "turnover");
assert.equal(turnover.xgDeltaFor, 0);
assert.equal(turnover.xgDeltaAgainst, 0.04);
assert.equal(turnover.steps.filter(x => x.result === "blocked").length, 1);

const exposed = resolveHighPressBuildUp(withProfile({ restDefenseScore: 40 }), { rng: () => 0.99 });
assert.equal(exposed.xgDeltaAgainst, 0.12, "weak rest defence exposes turnovers");

const better = resolveHighPressBuildUp(session(), { rng: () => 0.5 });
const worse = resolveHighPressBuildUp(session({ lineupSnapshot: lineup.map(x => ({
  ...x, matchScore: x.playerId === "gk" || x.playerId === "cb" ||
    x.playerId === "dm" || x.playerId === "am" ? 45 : x.matchScore
})) }), { rng: () => 0.5 });
assert.ok(better.probability > worse.probability, "same formation, different players");

const covered = resolveHighPressBuildUp(session({ opponent: {
  ...highPress,
  tacticalBehaviour: { pressCoordination: "collective", passingLaneCover: "central" }
}}), { rng: () => 0.5 });
assert.ok(covered.probability < better.probability);
assert.equal(covered.evidence.laneCover, "central");

const missing = session({ lineupSnapshot: lineup.map((entry) =>
  entry.position === "DM" || entry.position === "CM" ? { ...entry, matchFitKnown: false } : entry
) });
assert.equal(resolveHighPressBuildUp(missing), null, "missing role fit must not become invented skill");
assert.equal(resolveHighPressBuildUp(withProfile({ buildUpScore: null })), null, "missing metric blocks v6");
assert.equal(resolveHighPressBuildUp(session({ opponent: { id: "low_block_opponent", styleTraits: {} } })), null);

const switching = resolveHighPressBuildUp(session({
  selectedTacticId: "switching_play", tacticSnapshot: { id: "switching_play" }
}), { rng: () => 0 });
assert.equal(switching.route, "switch_play");
const direct = resolveHighPressBuildUp(session({
  selectedTacticId: "direct_second_balls", tacticSnapshot: { id: "direct_second_balls" }
}), { rng: () => 0 });
assert.equal(direct.route, "direct_outlet");

const existing = [{ side: "for", quality: 0.1 }, { side: "against", quality: 0.2 }];
const attached = annotateHighPressBuildUpChances(existing, positive);
assert.equal(attached.length, existing.length, "no extra chance");
assert.equal(attached.filter(x => x.tacticalMoment).length, 1, "one event attached at most");
assert.equal(attached[0].tacticalMoment.xgDelta, 0.12);

const roll = Math.random;
try {
  Math.random = () => 0.01;
  const advanced = advanceMatchClock(session());
  const period = advanced.timeline[0];
  assert.equal(period.tacticalPhase.status, "breakthrough");
  assert.equal(period.tacticalXg, undefined, "legacy plan-edge is not re-applied");
  assert.equal(Math.round((period.expectedGoals.for - period.baselineExpectedGoals.for) * 100) / 100,
    period.tacticalPhase.xgDeltaFor);
  assert.equal(Math.round((period.expectedGoals.against - period.baselineExpectedGoals.against) * 100) / 100,
    period.tacticalPhase.xgDeltaAgainst);
  assert.equal(advanced.minuteLog.length, period.chances, "v6 adds no phantom chances");
  assert.equal(advanced.minuteLog.filter(x => x.tacticalMoment).length <= 1, true);
  assert.equal(advanced.score.for, advanced.minuteLog.filter(x => x.type === "goal" && x.side === "for").length);
  assert.equal(advanced.score.against, advanced.minuteLog.filter(x => x.type === "goal" && x.side === "against").length);
  assert.equal(advanceMatchClock(advanced), advanced, "completed clock is idempotent");

  Math.random = () => 0.99;
  const failed = advanceMatchClock(session());
  assert.equal(failed.timeline[0].tacticalPhase.status, "turnover");
  assert.ok(failed.timeline[0].expectedGoals.against > failed.timeline[0].baselineExpectedGoals.against);

  const old = advanceMatchClock(session({ lineupSnapshot: lineup.map(({ matchFitKnown, ...entry }) => entry) }));
  assert.equal(old.timeline[0].tacticalPhase, undefined, "legacy save gets legacy model");

  // The match report must use the exact same period xG, not apply v6 again.
  const result = finalizeMatchdaySession(advanced);
  assert.equal(result.expectedGoals.for, period.expectedGoals.for);
  assert.equal(result.expectedGoals.against, period.expectedGoals.against);
} finally {
  Math.random = roll;
}
console.log("OK: v6 high-press/build-up causal chain, conservation, evidence and legacy fallback");
