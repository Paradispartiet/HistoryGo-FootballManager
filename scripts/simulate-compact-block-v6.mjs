// Deterministic tests: attack compact low blocks before event / xG generation.
import assert from "node:assert/strict";
import { resolveCompactBlockAttack, annotateCompactBlockChances }
  from "../src/football-matchday-compact-block-v6.js";
import { resolveHighPressBuildUp, highPressPhaseRoll }
  from "../src/football-matchday-high-press-v6.js";
import { advanceMatchClock, finalizeMatchdaySession }
  from "../src/football-matchday-engine.js";

const lineup = ["GK", "CB", "DM", "CM", "AM", "ST", "LW", "RW", "LB", "RB"].map((position, i) => ({
  playerId: "player_" + i, position, roleId: "role_" + position,
  matchScore: 76, matchFitKnown: true
}));
const lowBlock = {
  id: "low_block_opponent", strength: 72,
  defensiveStructure: 81, transitionThreat: 77,
  styleTraits: { defensiveCompactness: 86, highLine: 28, pressIntensity: 31 }
};
function session(planId = "wide_fast_433", more = {}) {
  return {
    id: "compact-block-test",
    version: 2, causalCompactBlockVersion: 1, causalTransitionsVersion: 1,
    selectedTacticId: planId, tacticSnapshot: { id: planId },
    lineupSnapshot: lineup, opponent: lowBlock,
    teamFitSnapshot: {
      historicalScore: 70, tacticalProfile: {
        widthScore: 76, buildUpScore: 73, balanceScore: 72,
        depthScore: 73, pressScore: 66, restDefenseScore: 70,
        relationshipScore: 73, teamScore: 75
      }
    },
    strengthSnapshot: { finalStrength: 74, modifiers: { missing: 0 } },
    events: [], timeline: [], decisions: [], planChanges: [], substitutions: [],
    minuteLog: [], score: { for: 0, against: 0 },
    planMatchup: { edge: 1.5 },
    ...more
  };
}
const resolve = (s, roll) => resolveCompactBlockAttack(s, { rng: () => roll });

const plans = {
  positional_overloads: "wide_isolation", wide_fast_433: "wide_isolation",
  overlap_channels: "wide_isolation", crossing_box_presence: "crossing",
  target_man_focus: "wall_pass", central_possession_4231: "wall_pass",
  chase_the_equaliser: "late_commitment", all_out_attack: "late_commitment"
};
for (const [plan, route] of Object.entries(plans)) {
  const phase = resolve(session(plan, ["chase_the_equaliser", "all_out_attack"].includes(plan)
    ? { score: { for: 0, against: 1 } } : {}), 0);
  assert.equal(phase.route, route, plan);
  assert.equal(phase.status, "breakthrough");
  assert.equal(phase.side, "for");
  assert.equal(phase.steps.length, 4);
  assert.equal(phase.evidence.support.length,
    route === "crossing" || route === "late_commitment" ? 4 : 3);
  assert.ok(phase.xgDeltaFor >= 0.09 && phase.xgDeltaFor <= 0.12);
  assert.equal(phase.xgDeltaAgainst, 0);
}

for (const plan of ["chase_the_equaliser", "all_out_attack"]) {
  const trailing = session(plan, { score: { for: 0, against: 1 } });
  assert.equal(resolve(trailing, 0).route, "late_commitment");
  for (const score of [{ for: 0, against: 0 }, { for: 1, against: 0 },
    { for: 2, against: 2 }, null]) {
    assert.equal(resolve(session(plan, { score }), 0), null,
      plan + " must not win a late-pressure v6 advantage without trailing");
  }
}

const normal = resolve(session(), 0.4);
const protectedLane = resolve(session("wide_fast_433", {
  opponent: { ...lowBlock, tacticalBehaviour: { wideCover: "collective" } }
}), 0.4);
assert.ok(protectedLane.probability < normal.probability,
  "documented collective cover should defeat some wide combinations");
assert.equal(protectedLane.evidence.cover, "collective");

const poor = resolve(session("wide_fast_433", {
  lineupSnapshot: lineup.map((p) => ["RW", "LW", "LB", "RB", "CB", "DM"].includes(p.position)
    ? { ...p, matchScore: 40 } : p)
}), 0.5);
assert.ok(normal.probability > poor.probability, "same shape but different role fit matters");

const repelledStrong = resolve(session(), 0.99);
assert.equal(repelledStrong.status, "repelled");
assert.equal(repelledStrong.xgDeltaAgainst, 0);
assert.equal(repelledStrong.side, null, "effective rest defence prevents added counter risk");
const repelledAverage = resolve(session("wide_fast_433", {
  teamFitSnapshot: {
    ...session().teamFitSnapshot,
    tacticalProfile: { ...session().teamFitSnapshot.tacticalProfile, restDefenseScore: 60 }
  }
}), 0.99);
assert.equal(repelledAverage.xgDeltaAgainst, 0.03);
assert.equal(repelledAverage.side, "against");
const repelledWeak = resolve(session("wide_fast_433", {
  teamFitSnapshot: {
    ...session().teamFitSnapshot,
    tacticalProfile: { ...session().teamFitSnapshot.tacticalProfile, restDefenseScore: 43 }
  }
}), 0.99);
assert.equal(repelledWeak.xgDeltaAgainst, 0.09);
assert.ok(repelledWeak.xgDeltaAgainst > repelledAverage.xgDeltaAgainst);
const noTransitionThreat = resolve(session("wide_fast_433", {
  opponent: { ...lowBlock, transitionThreat: undefined,
    styleTraits: { ...lowBlock.styleTraits, transitionThreat: undefined } }
}), 0);
assert.equal(noTransitionThreat, null, "unknown threat must not fabricate transition risk");
assert.equal(resolve(session("wide_fast_433", { causalCompactBlockVersion: undefined }), 0), null);
assert.equal(resolve(session("high_press_343"), 0), null);
assert.equal(resolve(session("wide_fast_433", {
  opponent: { id: "arbitrary", styleTraits: { defensiveCompactness: 86 } }
}), 0), null, "unknown defensive line must not be assumed low");
assert.equal(resolve(session("wide_fast_433", {
  opponent: { ...lowBlock, styleTraits: { defensiveCompactness: 86, highLine: 77 } }
}), 0), null, "high compact block is not automatically a LOW block");
assert.equal(resolve(session("wide_fast_433", {
  lineupSnapshot: lineup.map((p) => ["LB","RB"].includes(p.position)
    ? { ...p, matchFitKnown: false } : p)
}), 0), null, "unknown player fit must never imply a proven overlap");
assert.equal(resolve(session("wide_fast_433", {
  teamFitSnapshot: { ...session().teamFitSnapshot,
    tacticalProfile: { ...session().teamFitSnapshot.tacticalProfile, widthScore: undefined }
  }
}), 0), null);
const chances = [{ side: "for", quality: 0.12 }, { side: "against", quality: 0.07 }];
assert.equal(annotateCompactBlockChances(chances, repelledStrong), chances,
  "repelled attack with intact rest defence must not claim counterattack");
const annotated = annotateCompactBlockChances(chances, repelledWeak);
assert.equal(annotated.filter(x => x.tacticalMoment).length, 1);
assert.equal(annotated[1].tacticalMoment.kind, "counter_window");
assert.equal(annotateCompactBlockChances(chances, normal).filter(x => x.tacticalMoment).length, 1);
assert.equal(annotateCompactBlockChances([], normal).length, 0, "no phantom chances");

function findResult(kind) {
  for (let i = 0; i < 3000; i += 1) {
    const s = session("crossing_box_presence", { id: "compact-match-" + i });
    const phase = resolve(s, highPressPhaseRoll(s, "0:compact-block"));
    if (phase?.status === kind) return s;
  }
  throw new Error("No deterministic " + kind + " candidate");
}
const originalRandom = Math.random;
try {
  Math.random = () => 0.99;
  for (const status of ["breakthrough", "repelled"]) {
    const seed = findResult(status);
    const played = advanceMatchClock(seed);
    const period = played.timeline[0];
    assert.equal(period.tacticalPhase.situation, "compact_block_vs_attack");
    assert.equal(period.tacticalPhase.status, status);
    assert.equal(period.tacticalXg, undefined, "previous static matchup edge must not stack");
    assert.equal(
      Math.round((period.expectedGoals.for - period.baselineExpectedGoals.for) * 100) / 100,
      period.tacticalPhase.xgDeltaFor
    );
    assert.equal(
      Math.round((period.expectedGoals.against - period.baselineExpectedGoals.against) * 100) / 100,
      period.tacticalPhase.xgDeltaAgainst
    );
    assert.equal(played.minuteLog.length, period.chances,
      "every logged chance must have been generated once");
    assert.ok(played.minuteLog.filter(e => e.tacticalMoment).length <= 1);
    assert.deepEqual(advanceMatchClock(played), played, "no repeat of completed period");
    const replay = advanceMatchClock(JSON.parse(JSON.stringify(seed)));
    assert.deepEqual(replay.timeline[0].tacticalPhase, period.tacticalPhase);
    const final = finalizeMatchdaySession(played);
    assert.equal(final.expectedGoals.for, period.expectedGoals.for);
    assert.equal(final.expectedGoals.against, period.expectedGoals.against);
  }
  const highPressOpponent = {
    ...lowBlock, id: "high_press_opponent",
    matchupStyles: ["high_press"],
    styleTraits: { ...lowBlock.styleTraits, highLine: 30 }
  };
  const overlapping = advanceMatchClock(session("overlap_channels", {
    opponent: highPressOpponent
  }));
  // High press gets priority; the same period must never execute BOTH chains.
  assert.equal(overlapping.timeline[0].tacticalPhase.situation, "high_press_vs_build_up");
  const legacy = advanceMatchClock(session("wide_fast_433", {
    causalCompactBlockVersion: undefined
  }));
  assert.equal(legacy.timeline[0].tacticalPhase, undefined);
} finally {
  Math.random = originalRandom;
}
console.log("OK: compact low block chains, 8 plans, causal xG, evidence and regression");
