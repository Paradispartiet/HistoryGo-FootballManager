// Targeted regression: the same eleven and roles, but one sourced player swap
// must alter EXISTING tactical dimensions and the matchday snapshot.
// No new rating, inferred weaknesses or random simulation fixtures.
import assert from "node:assert/strict";
import fs from "node:fs";
import { calculateTeamFit } from "../src/football-team-fit-engine.js";
import { calculateTeamFit as calculateLiveTypescriptTeamFit } from "../dist/index.js";
import { calculateMatchStrength, simulateMatchday, createMatchdaySession, advanceMatchClock, applyMatchdaySubstitution, finalizeMatchdaySession, OPPONENT_PROFILES } from "../src/football-matchday-engine.js";

const read = (path) => JSON.parse(fs.readFileSync(new URL("../data/" + path, import.meta.url), "utf8"));
const formation = read("football_formations.json").formations.find((item) => item.id === "4-3-3");
const roles = read("football_roles.json").roles;
const tactics = read("football_tactics.json").tactics;
const tactic = {
  ...tactics.find((item) => item.id === "central_possession_4231"),
  // Leave room below the 100-point cap so sourced CB qualities stay visible.
  tags: ["high_line", "rest_defense"]
};
assert.ok(formation?.slots?.length === 11 && tactic.id, "fixture must use actual formations/tactics");

const defaultRole = (position) =>
  roles.find((role) => role.validPositions.includes(position))?.id;
const baseLineup = Object.fromEntries(formation.slots.map((slot, index) => [
  slot.slotId,
  { playerId: "neutral_" + index,
    roleId: slot.position === "CB" ? "ball_playing_centre_back" : defaultRole(slot.position) }
]));
const baseline = formation.slots.map((slot, index) => ({
  id: "neutral_" + index,
  name: "Spiller " + index,
  naturalPositions: [slot.position],
  usablePositions: [], poorFits: [], preferredRoles: [], needs: [],
  likesTactics: [], dislikesTactics: [], archetypes: [],
  strengths: [], classHeight: 85, warningWhenMisused: "",
  attributes: { values: {}, provenance: {} }
}));
const cbSlot = formation.slots.find((slot) => slot.slotId === "lcb");
assert.ok(cbSlot && defaultRole("GK") && defaultRole("ST"), "fixture must resolve canonical roles");
const baseId = baseLineup[cbSlot.slotId].playerId;
const sourced = (id, strengths, evidence = "belagt") => ({
  ...baseline.find((player) => player.id === baseId),
  id, name: id, strengths,
  attributes: {
    values: {},
    provenance: Object.fromEntries(strengths.map((skill) => [skill, evidence]))
  }
});
const evaluateInEngine = (player, engine, chosenTactic = tactic) => {
  const players = baseline.filter((item) => item.id !== baseId).concat(player);
  const lineup = { ...baseLineup,
    [cbSlot.slotId]: { playerId: player.id, roleId: "ball_playing_centre_back" } };
  const fit = engine({ lineup, formation, tactic: chosenTactic, players, roles });
  assert.equal(fit.completeCount, 11, "both candidate teams must have a real eleven");
  return fit;
};
const evaluate = (player, chosenTactic = tactic) => evaluateInEngine(player, calculateTeamFit, chosenTactic);
const evaluateTyped = (player, chosenTactic = tactic) => evaluateInEngine(player, calculateLiveTypescriptTeamFit, chosenTactic);

const passer = evaluate(sourced("pasningssterk_stopper", ["passing_range", "composure"]));
const fast = evaluate(sourced("hurtig_stopper", ["pace", "game_reading"]));
console.log("Pre-adjustment tactical comparison:", JSON.stringify({ passer: passer.baseMetrics, fast: fast.baseMetrics, sourcedPasser: passer.sourcedSkillTendencies, sourcedFast: fast.sourcedSkillTendencies }));
assert.ok(passer.baseMetrics.buildUpScore > fast.baseMetrics.buildUpScore,
  "documented passing must improve actual team build-up for identical CB role");
assert.ok(fast.baseMetrics.restDefenseScore > passer.baseMetrics.restDefenseScore,
  "documented speed/reading must improve high-line rest-defence for identical CB role");
assert.ok(passer.metrics.buildUpScore > fast.metrics.buildUpScore,
  "historical formation & badge adjustments must preserve build-up contrast");
assert.ok(fast.metrics.restDefenseScore > passer.metrics.restDefenseScore,
  "historical formation & badge adjustments must preserve defensive contrast");

// Browser gets the compiled TypeScript engine, not the JS fallback.
// Compare both against the same entire starting XI and tactical input.
for (const [candidate, label] of [
  [sourced("pasningssterk_stopper", ["passing_range", "composure"]), "passing"],
  [sourced("hurtig_stopper", ["pace", "game_reading"]), "high_line_defence"],
  [sourced("utledet_stopper", ["passing_range"], "utledet"), "unknown_source"],
]) {
  const fromJs = evaluate(candidate);
  const fromTs = evaluateTyped(candidate);
  assert.deepEqual(fromTs.sourcedSkillTendencies, fromJs.sourcedSkillTendencies,
    label + ": live TypeScript engine must carry identical sourced contribution");
  assert.deepEqual(fromTs.baseMetrics, fromJs.baseMetrics,
    label + ": live TypeScript base tactical metrics must match JS");
  assert.deepEqual(fromTs.metrics, fromJs.metrics,
    label + ": matchday tactical profile must match in TS and JS");
  assert.equal(fromTs.teamScore, fromJs.teamScore,
    label + ": final team scores must match live TS versus fallback JS");
  assert.deepEqual(fromTs.report, fromJs.report,
    label + ": manager must see the same player-specific explanations in both engines");
}

const passerMatch = calculateMatchStrength({ teamFit: passer, formation });
const fastMatch = calculateMatchStrength({ teamFit: fast, formation });
assert.ok(passerMatch.tacticalProfile.buildUpScore > fastMatch.tacticalProfile.buildUpScore,
  "player substitution must reach the matchday build-up tactical profile");
assert.ok(fastMatch.tacticalProfile.restDefenseScore > passerMatch.tacticalProfile.restDefenseScore,
  "player substitution must reach matchday defensive risk");

// The same match engine uses the team dimensions to create chances for/against.
// Freeze other contributors to isolate the actual sourced role-specific effect;
// do NOT assert stochastic goal results, only deterministic xG.
const opponent = OPPONENT_PROFILES.find((profile) => profile.id === "high_press_opponent");
assert.ok(opponent, "fixed opponent profile must exist");
const neutralMatch = (fit) => ({
  ...fit,
  teamScore: 72,
  historicalFormationFit: { historicalScore: 65, historicalBonus: 0, historicalPenalty: 0 },
  relationships: { relationshipScore: 60 }
});
const passerOutcome = simulateMatchday({
  teamFit: neutralMatch(passer), formation, opponent, activeClassifications: []
});
const fastOutcome = simulateMatchday({
  teamFit: neutralMatch(fast), formation, opponent, activeClassifications: []
});
assert.ok(passerOutcome.expectedGoals.for > fastOutcome.expectedGoals.for,
  "documented CB passing should raise expected chances through real matchday xG");
assert.ok(fastOutcome.expectedGoals.against < passerOutcome.expectedGoals.against,
  "documented CB pace & reading under a high line must cut chances conceded");

// The playable v0.2 session must preserve and display starter evidence, without
// pretending that a substituted player was responsible for the full 90 minutes.
const kickoff = createMatchdaySession({
  teamFit: neutralMatch(passer), formation, tactic, opponent,
  roles, activeClassifications: []
});
assert.ok(kickoff.sourcedStartersSnapshot?.buildUpScore?.players.includes("pasningssterk_stopper"),
  "kickoff must retain name and source-backed team contribution");
const report = finalizeMatchdaySession(kickoff);
assert.ok(report?.analysis?.some((line) =>
  line.includes("Spillerprofilene ved avspark") && line.includes("pasningssterk_stopper")),
  "completed in-game match analysis must explain sourced starter contribution");

const inferred = evaluate(sourced("modellert_stopper", ["passing_range", "composure"], "utledet"));
const missing = evaluate(sourced("ukjent_stopper", ["passing_range", "composure"], ""));
assert.equal(inferred.baseMetrics.buildUpScore, missing.baseMetrics.buildUpScore,
  "derived or unproven skills must not grant documentary team bonuses");
assert.equal(inferred.sourcedSkillTendencies.buildUpScore.bonus, 0,
  "derived provenance cannot masquerade as sourced player traits");
const noProfile = evaluate({ ...sourced("uten_profil", ["passing_range"]), attributes: null });
assert.equal(noProfile.sourcedSkillTendencies.buildUpScore.bonus, 0,
  "missing attribute profile is neutral, not a source claim");
const lowLine = { ...tactic, tags: ["possession", "structured_build_up"] };
const lowFast = evaluate(sourced("hurtig_lav_linje", ["pace", "game_reading"]), lowLine);
const lowPass = evaluate(sourced("pasning_lav_linje", ["passing_range", "composure"]), lowLine);
assert.equal(lowFast.sourcedSkillTendencies.restDefenseScore.bonus, 0,
  "pace under a low line is not automatically a high-line defensive bonus");
assert.equal(lowFast.baseMetrics.restDefenseScore, lowPass.baseMetrics.restDefenseScore,
  "without high-line conditions no invented speed advantage should appear");


// An actual in-match substitution must change the tactical snapshot and the
// *next* period's chances, without rewriting already played periods.
// Give both bench candidates the exact same slot fit so the existing freshness,
// coach and situational substitution effects cancel out.
const fastBenchPlayer = sourced("hurtig_innbytter", ["pace", "acceleration"]);
const passingBenchPlayer = sourced("pasnings_innbytter", ["passing_range", "composure"]);
const liveKickoff = createMatchdaySession({
  teamFit: neutralMatch(passer), formation, tactic, opponent, roles,
  benchPlayers: [fastBenchPlayer, passingBenchPlayer],
  activeClassifications: []
});
const firstHalf = advanceMatchClock(advanceMatchClock(liveKickoff));
const leveledBench = firstHalf.benchSnapshot.map((benchPlayer) => ({
  ...benchPlayer,
  fitBySlot: {
    ...benchPlayer.fitBySlot,
    [cbSlot.slotId]: {
      ...benchPlayer.fitBySlot[cbSlot.slotId],
      matchScore: 75, misusePenalty: 0
    }
  }
}));
const controlledHalf = { ...firstHalf, benchSnapshot: leveledBench };
const swap = (inPlayerId) => applyMatchdaySubstitution(controlledHalf, {
  outPlayerId: "pasningssterk_stopper", inPlayerId, minute: 45, gameState: "level"
});
const speedSub = swap("hurtig_innbytter");
const passingSub = swap("pasnings_innbytter");
assert.equal(speedSub.substitutions.length, 1, "real match engine must accept documented CB substitute");
assert.deepEqual(speedSub.substitutions[0].effects, passingSub.substitutions[0].effects,
  "equal fit, fatigue and situation must leave only sourced traits different");
assert.ok(speedSub.teamFitSnapshot.tacticalProfile.restDefenseScore
  > passingSub.teamFitSnapshot.tacticalProfile.restDefenseScore,
  "documented CB speed must improve live high-line defence");
assert.ok(passingSub.teamFitSnapshot.tacticalProfile.buildUpScore
  > speedSub.teamFitSnapshot.tacticalProfile.buildUpScore,
  "documented CB passing must improve live buildup");
assert.ok(speedSub.substitutions[0].reasons.some((line) => line.includes("Kildebelagte styrker")),
  "substitution rationale must disclose live tactical changes");
const nextWithSpeed = advanceMatchClock(JSON.parse(JSON.stringify(speedSub)));
const nextWithPassing = advanceMatchClock(JSON.parse(JSON.stringify(passingSub)));
const speedPeriod = nextWithSpeed.timeline.at(-1);
const passingPeriod = nextWithPassing.timeline.at(-1);
assert.ok(speedPeriod.expectedGoals.against < passingPeriod.expectedGoals.against,
  "live source-backed speed must cut next-period expected chances against");
assert.ok(passingPeriod.expectedGoals.for > speedPeriod.expectedGoals.for,
  "live source-backed passing must improve next-period expected chances for");
assert.deepEqual(nextWithSpeed.timeline.slice(0, 2), controlledHalf.timeline,
  "a substitute must not rewrite past chance generation");
const formerSave = { ...controlledHalf };
delete formerSave.sourcedSubstitutionVersion;
const legacySwap = applyMatchdaySubstitution(formerSave, {
  outPlayerId: "pasningssterk_stopper", inPlayerId: "hurtig_innbytter", minute: 45
});
assert.deepEqual(legacySwap.teamFitSnapshot, formerSave.teamFitSnapshot,
  "legacy in-progress match sessions must keep their original tactical snapshot");

console.log(JSON.stringify({
  ok: true, completeCount: 11,
  ballPlayingCB: {
    passing: { buildUp: passer.metrics.buildUpScore, restDefense: passer.metrics.restDefenseScore },
    pace: { buildUp: fast.metrics.buildUpScore, restDefense: fast.metrics.restDefenseScore }
  },
  matchdayReceivesBothDifferences: true,
  xGComparison: {
    passingCB: passerOutcome.expectedGoals,
    fastCB: fastOutcome.expectedGoals
  },
  kickoffEvidenceAppearsInFinalReport: true,
  modeledAndMissingEvidenceNeutral: true
}, null, 2));
