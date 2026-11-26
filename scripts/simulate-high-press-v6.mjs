// Focused deterministic regression for matchday v6's first playable situation.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

// A real league profile, not an invented opponent: the source-backed 2024
// Brann style is passed through by the app's league opponent snapshot.
const leagueProfiles = JSON.parse(readFileSync(
  new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8"
)).profiles;
const brann = leagueProfiles.find(profile => profile.clubId === "brann");
assert.ok(brann, "Brann league profile must exist");
assert.equal(brann.tacticalBehaviourEvidence?.era, "2024");
assert.ok(brann.tacticalBehaviourEvidence?.sources?.length >= 2);
const brannOpponent = { ...brann, id: brann.clubId, name: "Brann", strength: 74 };
const { tacticalBehaviour: _cover, ...unknownBrann } = brannOpponent;
const brannKnown = resolveHighPressBuildUp(session({ opponent: brannOpponent }), { rng: () => 0.42 });
const brannUnknown = resolveHighPressBuildUp(session({ opponent: unknownBrann }), { rng: () => 0.42 });
assert.equal(brannUnknown.evidence.laneCover, "unknown");
assert.equal(brannKnown.evidence.laneCover, "central");
assert.equal(brannKnown.evidence.coordination, "collective");
assert.equal(brannUnknown.probability, 0.525);
assert.equal(brannKnown.probability, 0.325);
assert.equal(brannUnknown.status, "breakthrough");
assert.equal(brannKnown.status, "turnover");
assert.equal(brannUnknown.xgDeltaFor, 0.12);
assert.equal(brannKnown.xgDeltaFor, 0);
assert.equal(brannKnown.xgDeltaAgainst, 0.04);
assert.equal(brannKnown.steps[2].result, "blocked");
assert.equal(resolveHighPressBuildUp(session({ opponent: brannOpponent }), { rng: () => 0.01 }).status, "breakthrough",
  "central coverage reduces probability but does not make success impossible");
const widePlan = { selectedTacticId: "switching_play", tacticSnapshot: { id: "switching_play" } };
const wideKnown = resolveHighPressBuildUp(session({ ...widePlan, opponent: brannOpponent }), { rng: () => 0.42 });
const wideUnknown = resolveHighPressBuildUp(session({ ...widePlan, opponent: unknownBrann }), { rng: () => 0.42 });
assert.equal(wideKnown.probability, wideUnknown.probability,
  "central coverage must not penalize the wide route or grant a bonus");
const rosenborg = leagueProfiles.find(profile => profile.clubId === "rosenborg");
assert.equal(rosenborg.tacticalBehaviourEvidence?.era, "1994–1999");
const rbkOpponent = { ...rosenborg, id: rosenborg.clubId, name: "Rosenborg", strength: 74 };
const { tacticalBehaviour: _rbkCover, ...unknownRbk } = rbkOpponent;
const rbkKnown = resolveHighPressBuildUp(session({ opponent: rbkOpponent }), { rng: () => 0.42 });
const rbkUnknown = resolveHighPressBuildUp(session({ opponent: unknownRbk }), { rng: () => 0.42 });
assert.equal(rbkKnown.evidence.laneCover, "central");
assert.equal(rbkKnown.evidence.coordination, "collective");
assert.equal(rbkUnknown.evidence.laneCover, "unknown");
assert.equal(rbkUnknown.probability, 0.585);
assert.equal(rbkKnown.probability, 0.385);
assert.equal(rbkUnknown.status, "breakthrough");
assert.equal(rbkKnown.status, "turnover");
assert.equal(rbkKnown.xgDeltaAgainst, 0.04);
assert.equal(rbkKnown.xgDeltaFor, 0);
assert.equal(rbkUnknown.xgDeltaFor, 0.12);
assert.equal(resolveHighPressBuildUp(session({ opponent: rbkOpponent }), { rng: () => 0.01 }).status, "breakthrough");
assert.ok(rbkKnown.probability > brannKnown.probability, "different club pressure remains meaningful");
assert.equal(
  resolveHighPressBuildUp(session({ ...widePlan, opponent: rbkOpponent }), { rng: () => 0.42 }).probability,
  resolveHighPressBuildUp(session({ ...widePlan, opponent: unknownRbk }), { rng: () => 0.42 }).probability
);
const godset = leagueProfiles.find(profile => profile.clubId === "stromsgodset");
assert.equal(godset.tacticalBehaviourEvidence?.era, "2011–2014");
assert.ok(godset.tacticalBehaviourEvidence?.sources?.length >= 2);
const godsetOpponent = { ...godset, id: godset.clubId, name: "Strømsgodset", strength: 74 };
const { tacticalBehaviour: _godsetCover, ...unknownGodset } = godsetOpponent;
const godsetKnown = resolveHighPressBuildUp(session({ opponent: godsetOpponent }), { rng: () => 0.42 });
const godsetUnknown = resolveHighPressBuildUp(session({ opponent: unknownGodset }), { rng: () => 0.42 });
assert.equal(godsetKnown.evidence.laneCover, "central");
assert.equal(godsetKnown.evidence.coordination, "collective");
assert.equal(godsetUnknown.evidence.laneCover, "unknown");
assert.equal(godsetUnknown.probability, 0.546);
assert.equal(godsetKnown.probability, 0.346);
assert.equal(godsetUnknown.status, "breakthrough");
assert.equal(godsetKnown.status, "turnover");
assert.equal(godsetKnown.xgDeltaAgainst, 0.04);
assert.equal(godsetKnown.xgDeltaFor, 0);
assert.equal(godsetUnknown.xgDeltaFor, 0.12);
assert.equal(resolveHighPressBuildUp(session({ opponent: godsetOpponent }), { rng: () => 0.01 }).status, "breakthrough");
assert.ok(brannKnown.probability < godsetKnown.probability && godsetKnown.probability < rbkKnown.probability);
assert.equal(
  resolveHighPressBuildUp(session({ ...widePlan, opponent: godsetOpponent }), { rng: () => 0.42 }).probability,
  resolveHighPressBuildUp(session({ ...widePlan, opponent: unknownGodset }), { rng: () => 0.42 }).probability
);
const undocumented = leagueProfiles.find(profile => profile.clubId === "valerenga" && !profile.tacticalBehaviour);
if (undocumented) {
  const phase = resolveHighPressBuildUp(session({ opponent: { ...undocumented, id: undocumented.clubId } }), { rng: () => 0.42 });
  assert.equal(phase.evidence.laneCover, "unknown");
}

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

  // Same random draw and same XI: only the sourced league cover changes.
  Math.random = () => 0.42;
  const brannPeriodKnown = advanceMatchClock(session({ opponent: brannOpponent })).timeline[0];
  const brannPeriodUnknown = advanceMatchClock(session({ opponent: unknownBrann })).timeline[0];
  assert.equal(brannPeriodKnown.tacticalPhase.status, "turnover");
  assert.equal(brannPeriodUnknown.tacticalPhase.status, "breakthrough");
  assert.equal(brannPeriodKnown.tacticalPhase.xgDeltaFor, 0);
  assert.equal(brannPeriodUnknown.tacticalPhase.xgDeltaFor, 0.12);
  assert.equal(brannPeriodKnown.tacticalPhase.xgDeltaAgainst, 0.04);

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
