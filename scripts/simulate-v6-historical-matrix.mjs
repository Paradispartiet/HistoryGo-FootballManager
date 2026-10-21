// V6 historical-opponent matrix: coverage, evidence, sensitivity, xG ledger.
// This verifies SOFTWARE behavior against authored opponent STYLE ARCHETYPES,
// NOT predictive accuracy or historical match events.
import assert from "node:assert/strict";
import { TACTICAL_SEQUENCES } from "../src/football-tactical-sequences.js";
import { HISTORICAL_OPPONENT_PROFILES }
  from "../src/football-historical-opponent-profiles.js";
import { resolveHighPressBuildUp }
  from "../src/football-matchday-high-press-v6.js";
import { resolveCompactBlockAttack }
  from "../src/football-matchday-compact-block-v6.js";
import { resolveOwnPressAgainstOpponent }
  from "../src/football-matchday-own-press-v6.js";
import { resolveGameControlPhase }
  from "../src/football-matchday-control-v6.js";
import { advanceMatchClock }
  from "../src/football-matchday-engine.js";

const canonicalPlans = [...new Set(TACTICAL_SEQUENCES.map(p => p.tacticId))];
assert.equal(canonicalPlans.length, 18,
  "the tactical matrix should use all 18 canonical plans from source data");
assert.equal(HISTORICAL_OPPONENT_PROFILES.length, 12,
  "matrix baseline assumes the reviewed 12 historical style archetypes");

const positions = ["GK","CB","CB","DM","CM","AM","ST","LW","RW","LB","RB"];
const lineup = (fit = 82, known = true) => positions.map((position,i) => ({
  playerId: "matrix-player-" + i, roleId: "test-role-" + position + "-" + i,
  position, matchScore: fit, matchFitKnown: known
}));
const teamFit = {
  teamScore: 78, buildUpScore: 79, balanceScore: 79, widthScore: 79,
  depthScore: 79, pressScore: 79, restDefenseScore: 79, relationshipScore: 79
};
function session(plan, opponent, options = {}) {
  return {
    id: "v6-matrix:" + plan + ":" + opponent.id,
    version: 2, causalTransitionsVersion: 1,
    causalCompactBlockVersion: 1,
    causalPressingVersion: 1,
    causalGameControlVersion: 1,
    selectedTacticId: plan, tacticSnapshot: { id: plan },
    opponent, lineupSnapshot: lineup(),
    teamFitSnapshot: { tacticalProfile: teamFit, historicalScore: 76 },
    strengthSnapshot: { finalStrength: 75, modifiers: { missing: 0 } },
    // A leading game state is required for 'see_out_the_game'.
    score: { for: 1, against: 0 }, planMatchup: { edge: 1.5 },
    events: [], timeline: [], minuteLog: [], decisions: [],
    substitutions: [], planChanges: [],
    ...options
  };
}

// This is intentionally the SAME precedence as advanceMatchClock, but all
// rolls here are fixed. The engine uses match-specific stable rolls instead.
function phaseFor(s, roll = 0.46) {
  return resolveHighPressBuildUp(s,{rng:()=>roll}) ||
    resolveCompactBlockAttack(s,{rng:()=>roll}) ||
    resolveOwnPressAgainstOpponent(s,{
      pressureRoll:()=>roll, protectionRoll:()=>roll
    }) ||
    resolveGameControlPhase(s,{rng:()=>roll}) || null;
}

const coverage = new Map(canonicalPlans.map(plan=>[plan,{
  eligible: 0, unsupported: 0, historicalOpponents: [],
  roleSensitivity: 0, missingEvidenceFallbacks: 0
}]));
let eligiblePairs = 0, checkedPeriodLedgers = 0;
const originalRandom = Math.random;
try {
  Math.random = () => 0.99; // random SHOT scoring never drives v6 eligibility
  for (const plan of canonicalPlans) {
    for (const opponent of HISTORICAL_OPPONENT_PROFILES) {
      const s = session(plan, opponent);
      const phase = phaseFor(s);
      const row = coverage.get(plan);
      if (!phase) {
        row.unsupported += 1;
        continue;
      }
      eligiblePairs += 1;
      row.eligible += 1;
      row.historicalOpponents.push(opponent.id);
      assert.equal(phase.version, 6);
      assert.equal(phase.planId, plan);
      assert.equal(phase.steps.length, 4, plan+" chain length");
      assert.ok(Number.isFinite(phase.probability));
      assert.ok(phase.probability >= 0.12 && phase.probability <= 0.85);
      assert.ok(phase.evidence?.support?.length >= 3);
      assert.equal(
        new Set(phase.evidence.support.map(p=>p.playerId)).size,
        phase.evidence.support.length,
        "one player cannot fill multiple required tactical actions"
      );
      assert.ok(phase.evidence.support.every(p=>Number.isFinite(p.matchScore)),
        "role values must originate from documented fit");
      assert.ok(Number.isFinite(phase.xgDeltaFor));
      assert.ok(Number.isFinite(phase.xgDeltaAgainst));
      assert.ok(phase.side === "for" || phase.side === "against" || phase.side === null);

      const lowFitPhase = phaseFor(session(plan,opponent,{
        lineupSnapshot: lineup(41)
      }));
      assert.ok(lowFitPhase, "weaker, still-documented XI should remain eligible");
      assert.equal(lowFitPhase.situation,phase.situation);
      assert.ok(lowFitPhase.probability <= phase.probability,
        "weaker role fit cannot make the SAME tactic more effective");
      if (lowFitPhase.probability < phase.probability) row.roleSensitivity += 1;

      const unknownPhase = phaseFor(session(plan,opponent,{
        lineupSnapshot: lineup(82,false)
      }));
      assert.equal(unknownPhase,null,
        "unknown individual fit must never become invented football skill");
      row.missingEvidenceFallbacks += 1;

      const played = advanceMatchClock(s);
      const period = played.timeline[0];
      assert.equal(period.tacticalPhase?.situation, phase.situation,
        "engine must resolve the same supported plan/opponent situation");
      assert.equal(period.tacticalPhase?.route,phase.route);
      assert.equal(period.tacticalXg,undefined,
        "v6 must replace, not stack, static plan matchup credit");
      for(const key of ["for","against"]) {
        const actualDelta = Math.round((period.expectedGoals[key] -
          period.baselineExpectedGoals[key])*100)/100;
        assert.equal(actualDelta,period.tacticalPhase[
          key==="for"?"xgDeltaFor":"xgDeltaAgainst"
        ],"one realized terminal contribution per period");
      }
      assert.equal(played.minuteLog.length,period.chances,
        "no tactical event may create a fictitious additional shot");
      assert.ok(played.minuteLog.filter(m=>m.tacticalMoment).length<=1,
        "never annotate more than one real chance per period");
      checkedPeriodLedgers += 1;
    }
  }
} finally {
  Math.random = originalRandom;
}

const uncovered = [...coverage].filter(([,row]) => row.eligible === 0).map(([id])=>id);
assert.deepEqual(uncovered,[],
  "every canonical tactic must be playable against at least one documented historical archetype");
for(const [id,row] of coverage) {
  assert.ok(row.roleSensitivity>0,id+" must respond to documented role fit");
  assert.equal(row.missingEvidenceFallbacks,row.eligible,
    id+" must reject all-unknown individual input");
}
assert.ok(eligiblePairs>canonicalPlans.length,
  "matrix must check more than one sample per tactic on average");
assert.equal(checkedPeriodLedgers,eligiblePairs);

console.log("Kampmotor v6 – historical opponent archetype matrix");
for(const [id,row] of coverage) {
  console.log(" ",id.padEnd(29),"eligible",String(row.eligible).padStart(2),
    "/ 12 | fit-differences",String(row.roleSensitivity).padStart(2),
    "| missing-fit fallback",row.missingEvidenceFallbacks);
}
console.log("OK:",canonicalPlans.length,"plans ×",
  HISTORICAL_OPPONENT_PROFILES.length,"archetypes =",
  canonicalPlans.length*HISTORICAL_OPPONENT_PROFILES.length,
  "comparisons;",eligiblePairs,"eligible phase+xG checks");
