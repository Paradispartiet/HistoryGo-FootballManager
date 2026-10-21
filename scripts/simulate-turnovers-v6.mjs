// Deterministic v6 turnover -> counterpress -> rest-defence integration checks.
import assert from "node:assert/strict";
import { resolveTurnoverTransition } from "../src/football-matchday-turnover-v6.js";
import { highPressPhaseRoll, resolveHighPressBuildUp, annotateHighPressBuildUpChances }
  from "../src/football-matchday-high-press-v6.js";
import { advanceMatchClock, finalizeMatchdaySession }
  from "../src/football-matchday-engine.js";

const pl = (playerId, position, matchScore = 72) => ({
  playerId, position, roleId: "role_" + playerId, matchFitKnown: true, matchScore
});
const lineup = [pl("gk", "GK"), pl("cb", "CB"), pl("dm", "DM"),
  pl("am", "AM"), pl("rb", "RB"), pl("st", "ST")];
const opponent = {
  id: "high_press_opponent", strength: 74,
  matchupStyles: ["high_press"], defensiveStructure: 66,
  pressResistance: 62, transitionThreat: 78
};
function session(options = {}) {
  return {
    id: "test-transition",
    version: 2,
    causalTransitionsVersion: 1,
    selectedTacticId: "patient_build_up",
    tacticSnapshot: { id: "patient_build_up" },
    lineupSnapshot: lineup,
    opponent,
    teamFitSnapshot: {
      historicalScore: 65,
      tacticalProfile: { teamScore: 73, balanceScore: 70,
        buildUpScore: 75, pressScore: 74, restDefenseScore: 72,
        depthScore: 73, widthScore: 70, relationshipScore: 70 }
    },
    strengthSnapshot: { finalStrength: 73, modifiers: { missing: 0 } },
    planMatchup: { edge: 1.5 }, events: [], timeline: [],
    score: { for: 0, against: 0 }, minuteLog: [],
    decisions: [], planChanges: [], substitutions: [],
    ...options
  };
}
const buildUp = {
  situation: "high_press_vs_build_up", status: "turnover",
  side: "against", planId: "patient_build_up", route: "third_man",
  steps: [{ action: "Tredjemann blir stengt", result: "blocked" }],
  xgDeltaAgainst: 0.12, xgDeltaFor: 0,
  cause: "Oppbyggingen stopper."
};
const direct = (first, cover) => resolveTurnoverTransition(session(), buildUp, {
  firstPassRoll: () => first, coverRoll: () => cover
});
const regained = direct(0.99, 0);
const held = direct(0, 0);
const counter = direct(0, 0.99);
assert.deepEqual([regained.outcome, held.outcome, counter.outcome],
  ["regained", "contained", "counterattack"]);
assert.deepEqual([regained.xgDeltaAgainst, held.xgDeltaAgainst, counter.xgDeltaAgainst],
  [0, 0.02, 0.14], "one terminal risk replaces, never adds to, preliminary turnover risk");
for (const event of [regained, held, counter]) {
  assert.equal(event.steps.length, 5);
  assert.equal(event.evidence.cover.length, 2);
  assert.ok(event.probabilities.firstForwardPass >= 0.12);
  assert.ok(event.probabilities.defensiveContainment <= 0.88);
}
assert.equal(regained.steps[1].result, "intercepted");
assert.equal(regained.steps[3].result, "not_reached");
assert.equal(held.steps[3].result, "contained");
assert.equal(counter.steps[4].result, "chance_window");

assert.equal(resolveTurnoverTransition(session(), { ...buildUp, status: "breakthrough" }), null);
assert.equal(resolveTurnoverTransition(session({ causalTransitionsVersion: undefined }), buildUp), null,
  "legacy ongoing save remains on previous model");
assert.equal(resolveTurnoverTransition(session({ opponent: { ...opponent, transitionThreat: undefined } }), buildUp), null);
assert.equal(resolveTurnoverTransition(session({ teamFitSnapshot: {
  historicalScore: 65, tacticalProfile: {
    ...session().teamFitSnapshot.tacticalProfile, restDefenseScore: null
  }
} }), buildUp), null);
assert.equal(resolveTurnoverTransition(session({ lineupSnapshot: lineup.map(p =>
  p.position === "CB" ? { ...p, matchFitKnown: false } : p) }), buildUp), null);

const poorCover = session({ lineupSnapshot: lineup.map(p =>
  ["cb", "dm"].includes(p.playerId) ? { ...p, matchScore: 42 } : p) });
const poor = resolveTurnoverTransition(poorCover, buildUp, { firstPassRoll: () => 0, coverRoll: () => 0 });
assert.ok(held.probabilities.defensiveContainment > poor.probabilities.defensiveContainment,
  "same shape, different CB/midfield pairing must matter");

const lowThreat = resolveTurnoverTransition(session({ opponent: { ...opponent, transitionThreat: 40 } }),
  buildUp, { firstPassRoll: () => 0, coverRoll: () => 0 });
assert.ok(counter.probabilities.firstForwardPass > lowThreat.probabilities.firstForwardPass);
assert.ok(counter.probabilities.defensiveContainment < lowThreat.probabilities.defensiveContainment);

const chances = [{ side: "for", quality: 0.12 }, { side: "against", quality: 0.14 }];
for (const result of [regained, held]) {
  assert.equal(annotateHighPressBuildUpChances(chances, { ...buildUp, transition: result }), chances,
    "no counterattack chance attribution when press recovers or rest defence holds");
}
const annotated = annotateHighPressBuildUpChances(chances, {
  ...buildUp, transition: counter, xgDeltaAgainst: counter.xgDeltaAgainst
});
assert.equal(annotated.length, 2);
assert.equal(annotated.filter(c => c.tacticalMoment).length, 1);
assert.equal(annotated[1].tacticalMoment.kind, "counterattack");
assert.equal(annotated[1].tacticalMoment.steps.length, 6);

function findScenario(outcome) {
  for (let n = 0; n < 3000; n += 1) {
    const scenario = session({ id: "v6-transition-scenario-" + n });
    const phase = resolveHighPressBuildUp(scenario, {
      rng: () => highPressPhaseRoll(scenario, 0)
    });
    if (phase?.status !== "turnover") continue;
    const transition = resolveTurnoverTransition(scenario, phase, {
      firstPassRoll: () => highPressPhaseRoll(scenario, "0:forward-pass"),
      coverRoll: () => highPressPhaseRoll(scenario, "0:rest-defence")
    });
    if (transition?.outcome === outcome) return scenario;
  }
  throw new Error("No deterministic scenario found for " + outcome);
}
const random = Math.random;
try {
  // Shot conversion is irrelevant to the tested tactical causal chain.
  Math.random = () => 0.99;
  for (const [outcome, contribution] of [
    ["regained", 0], ["contained", 0.02], ["counterattack", 0.14]
  ]) {
    const seed = findScenario(outcome);
    const match = advanceMatchClock(seed);
    const period = match.timeline[0];
    assert.equal(period.tacticalPhase?.transition?.outcome, outcome);
    assert.equal(period.tacticalPhase.transition.xgDeltaAgainst, contribution);
    const delta = Math.round((period.expectedGoals.against -
      period.baselineExpectedGoals.against) * 100) / 100;
    assert.equal(delta, period.tacticalPhase.xgDeltaAgainst,
      "period xG equals precisely one outcome after rounding");
    assert.equal(period.tacticalXg, undefined,
      "old plan-edge contribution is absent when v6 resolves the period");
    assert.equal(match.minuteLog.length, period.chances,
      "no phantom shot or goal from an intercepted first pass");
    assert.equal(match.minuteLog.some(e => e.tacticalMoment?.kind === "counterattack"),
      outcome === "counterattack", "only real chances get counterattack annotation");
    assert.equal(advanceMatchClock(match), match);
    const replay = advanceMatchClock(JSON.parse(JSON.stringify(seed)));
    assert.deepEqual(replay.timeline[0].tacticalPhase, period.tacticalPhase,
      "the same match/period must replay the same tactical outcome");
    const result = finalizeMatchdaySession(match);
    assert.equal(result.expectedGoals.against, period.expectedGoals.against);
  }
  // The same newly created model with absent evidence must still use the old
  // preliminary turnover risk rather than fabricate the missing player trait.
  const seed = findScenario("counterattack");
  const noData = { ...seed, opponent: { ...seed.opponent, transitionThreat: undefined } };
  const old = advanceMatchClock(noData);
  assert.equal(old.timeline[0].tacticalPhase.transition, undefined);
  const previousSave = advanceMatchClock({ ...seed, causalTransitionsVersion: undefined });
  assert.equal(previousSave.timeline[0].tacticalPhase.transition, undefined);
} finally {
  Math.random = random;
}
console.log("OK: causal turnover/first pass/counterpress/rest-defence across three outcomes");
