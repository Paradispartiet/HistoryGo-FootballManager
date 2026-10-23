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
assert.equal(annotatedSwitch[0].tacticalMoment.counterplay.pathwayId, "switch_play");

// A full XI, with existing role vocabulary, supplies distinct COVERAGE
// requirements for each opponent exit. Coverage is role evidence, not an
// invented deterministic success or another hidden modifier to probabilities.
const eleven = lineup.concat([{
  playerId: "press-second-cb", position: "CB",
  roleId: "ball_playing_centre_back", matchScore: 75, matchFitKnown: true
}]).map(player => ({
  ...player,
  roleId: player.position === "DM" ? "balancing_six" :
    player.position === "CM" ? "pressing_midfielder" :
    ["LB", "RB"].includes(player.position) ? "support_fullback" :
    player.position === "CB" ? "ball_playing_centre_back" : player.roleId
}));
const replyRun = (route, currentLineup = eleven) =>
  resolve(session("midfield_press_trap", {
    opponent: knownExit(route).opponent,
    lineupSnapshot: currentLineup
  }), 0.99, 0.99);
const centralCover = replyRun("third_man");
const flankCover = replyRun("switch_play");
const depthCover = replyRun("direct");
assert.deepEqual([
  centralCover.counterplay.defensiveReply.id,
  flankCover.counterplay.defensiveReply.id,
  depthCover.counterplay.defensiveReply.id
], [
  "screen_layoff_and_track_third_runner",
  "recover_far_side_and_hold_width",
  "hold_depth_and_compete_for_second_ball"
]);
for (const phase of [centralCover, flankCover, depthCover]) {
  assert.equal(phase.counterplay.defensiveReply.roleReadiness, "supported_by_roles");
  assert.equal(phase.counterplay.defensiveReply.simulatedResult, "could_not_stop_attack");
  assert.equal(phase.counterplay.defensiveReply.actions.length, 4);
  assert.equal(phase.counterplay.defensiveReply.actions[3].result, "breached");
  assert.equal(phase.counterplay.defensiveReply.probabilityAdjustment, 0);
  assert.ok(phase.routeCoverAdjustment > 0 && phase.routeCoverAdjustment <= 0.03,
    "known role-fitting defensive coordination should influence containment");
  assert.equal(phase.counterplay.defensiveReply.containmentAdjustment,
    phase.routeCoverAdjustment);
  assert.equal(phase.counterplay.defensiveReply.weakestCoverFit, 75);
  assert.equal(phase.evidence.routeCoverFitFloor, 75);
  assert.equal(phase.xgDeltaAgainst, 0.06);
}
assert.notDeepEqual(centralCover.counterplay.defensiveReply.actions,
  flankCover.counterplay.defensiveReply.actions);
const swapRole = (position, roleId) => eleven.map(player =>
  player.position === position ? { ...player, roleId } : player);
const withoutPressMid = replyRun("third_man", swapRole("CM", "deep_playmaker"));
assert.equal(withoutPressMid.counterplay.defensiveReply.roleReadiness,
  "not_supported_by_checked_roles");
assert.equal(replyRun("switch_play", swapRole("CM", "deep_playmaker"))
  .counterplay.defensiveReply.roleReadiness, "supported_by_roles",
  "changing central cover must not disable an unrelated far-side reply");
const withHighLeftBack = replyRun("switch_play", swapRole("LB", "overlapping_fullback"));
assert.equal(withHighLeftBack.counterplay.defensiveReply.roleReadiness,
  "not_supported_by_checked_roles");
assert.equal(replyRun("third_man", swapRole("LB", "overlapping_fullback"))
  .counterplay.defensiveReply.roleReadiness, "supported_by_roles",
  "advanced back changes the flank defence but not central role coverage");
// A supported far-side SWITCH can name its actual destination in the
// defending team's left/right frame. One high back must not erase sound cover
// on the other flank; without destination evidence, remain conservative.
const asymmetricBacks = swapRole("LB", "overlapping_fullback");
const targetedSwitch = (targetFlank, lineupToUse = asymmetricBacks, draw = 0.99,
  pressEscape = undefined) => resolve(session("midfield_press_trap", {
  opponent: { ...opponent, tacticalBehaviour: {
    pressEscapeRoute: "switch_play", pressEscapeTargetFlank: targetFlank,
    ...(pressEscape ? { pressEscape } : {})
  } },
  lineupSnapshot: lineupToUse
}), 0.99, draw);
const unsightedSwitch = targetedSwitch(undefined);
const rightSideSwitch = targetedSwitch("right");
const leftSideSwitch = targetedSwitch("left");
const badSideSwitch = targetedSwitch("centre");
assert.equal(unsightedSwitch.routeCoverAdjustment, 0);
assert.equal(badSideSwitch.routeCoverAdjustment, 0,
  "unrecognised flank name cannot become invented spatial information");
assert.equal(rightSideSwitch.counterplay.documentedTargetFlank, "right");
assert.equal(rightSideSwitch.counterplay.defensiveReply.evidence.documentedTargetFlank,
  "right");
assert.equal(rightSideSwitch.counterplay.defensiveReply.roleReadiness,
  "supported_by_roles", "supported RIGHT back can protect named right flank");
assert.ok(rightSideSwitch.routeCoverAdjustment > 0);
assert.equal(rightSideSwitch.counterplay.defensiveReply.evidence
  .supportingPlayerIds.length, 1,
  "targeted switch must not include irrelevant opposite-side back in fit floor");
assert.equal(leftSideSwitch.routeCoverAdjustment, 0,
  "advanced left back cannot claim left-side containment");
assert.equal(leftSideSwitch.counterplay.defensiveReply.roleReadiness,
  "not_supported_by_checked_roles");
assert.equal(leftSideSwitch.counterplay.documentedTargetFlank, "left");
assert.equal(rightSideSwitch.probability, leftSideSwitch.probability,
  "changing destination of switch never changes initial press");
assert.equal(rightSideSwitch.xgDeltaAgainst, leftSideSwitch.xgDeltaAgainst,
  "side-aware cover must not pay additional expected goals");
assert.ok(rightSideSwitch.containmentProbability >
  leftSideSwitch.containmentProbability);
const flankMidpoint = (rightSideSwitch.containmentProbability +
  leftSideSwitch.containmentProbability) / 2;
const protectedRight = targetedSwitch("right", asymmetricBacks, flankMidpoint);
const exposedLeft = targetedSwitch("left", asymmetricBacks, flankMidpoint);
assert.equal(protectedRight.status, "contained");
assert.equal(exposedLeft.status, "escaped");
assert.equal(protectedRight.xgDeltaAgainst, 0.02);
assert.equal(exposedLeft.xgDeltaAgainst, 0.06);
assert.equal(targetedSwitch("right", asymmetricBacks, 0.99, "isolated")
  .routeCoverAdjustment, 0,
  "explicitly observed isolation must suppress an older labelled exit");

const withoutHoldingSix = replyRun("direct", swapRole("DM", "deep_playmaker"));
assert.equal(withoutHoldingSix.counterplay.defensiveReply.roleReadiness,
  "not_supported_by_checked_roles");
// Only the RELEVANT defensive pairing changes stage-two containment.
// The first pressing chance and terminal xG size stay untouched.
for (const [altered, normal] of [
  [withoutPressMid, centralCover],
  [withHighLeftBack, flankCover],
  [withoutHoldingSix, depthCover]
]) {
  assert.equal(altered.probability, normal.probability,
    "route-specific defensive roles must not rewrite initial press outcome");
  assert.equal(altered.routeCoverAdjustment, 0,
    "a missing complementary role cannot claim specialist cover");
  assert.ok(normal.routeCoverAdjustment > 0);
  assert.ok(altered.containmentProbability < normal.containmentProbability,
    "missing route-specific cover must matter to downstream containment");
  assert.equal(altered.xgDeltaAgainst, normal.xgDeltaAgainst,
    "one terminal xG event; route readiness must not pay xG again");
}
assert.equal(replyRun("switch_play", swapRole("CM", "deep_playmaker"))
  .containmentProbability, flankCover.containmentProbability,
  "removing a central runner should not weaken unchanged far-side cover");
assert.equal(replyRun("third_man", swapRole("LB", "overlapping_fullback"))
  .containmentProbability, centralCover.containmentProbability,
  "moving a back high cannot erase verified central-cover pairing");
assert.equal(replyRun("direct", swapRole("CM", "deep_playmaker"))
  .containmentProbability, depthCover.containmentProbability,
  "uninvolved CM role must not influence depth-control synergy");
// Same pressure roll yields a broken press in both versions; on the exact same
// protection draw a complementary role changes the terminal phase from
// conceded chance to contained. That is causal gameplay, not a new label.
const midpoint = (centralCover.containmentProbability +
  withoutPressMid.containmentProbability) / 2;
const protectionDraw = currentLineup => resolve(session("midfield_press_trap", {
  opponent: knownExit("third_man").opponent, lineupSnapshot: currentLineup
}), 0.99, midpoint);
const defended = protectionDraw(eleven);
const undeterred = protectionDraw(swapRole("CM", "deep_playmaker"));
assert.equal(defended.status, "contained");
assert.equal(undeterred.status, "escaped");
assert.equal(defended.xgDeltaAgainst, 0.02);
assert.equal(undeterred.xgDeltaAgainst, 0.06);
assert.equal(defended.counterplay.defensiveReply.simulatedResult, "stopped_attack");
assert.equal(undeterred.counterplay.defensiveReply.simulatedResult,
  "could_not_stop_attack");
const unknownCover = replyRun("switch_play", eleven.map(player =>
  ({ ...player, matchFitKnown: false })));
assert.equal(unknownCover, null,
  "unknown role fit cannot enter a causal pressing phase");
const unnamedRoles = replyRun("switch_play", eleven.map(player =>
  ({ ...player, roleId: "unverified_role" })));
assert.equal(unnamedRoles.counterplay.defensiveReply.roleReadiness, "unknown",
  "unverified role vocabulary must not imply specific defensive weakness");
assert.equal(unnamedRoles.routeCoverAdjustment, 0);
assert.equal(observedUnknownPath.routeCoverAdjustment, 0,
  "generic supported escape cannot invent specialist cover");
assert.equal(isolationOverride.routeCoverAdjustment, 0,
  "explicit observed isolation overrides old labelled offensive exit");
const weakerSpecialists = replyRun("third_man", eleven.map(player =>
  ["DM", "CM"].includes(player.position) ? { ...player, matchScore: 63 } : player));
assert.ok(weakerSpecialists.routeCoverAdjustment < centralCover.routeCoverAdjustment,
  "specialist cover must reflect actual role-match fit, not role labels alone");
assert.ok(weakerSpecialists.routeCoverAdjustment > 0);
assert.equal(replyRun("third_man").counterplay.defensiveReply.evidence
  .supportingPlayerIds.length, 2);

// Optional explicit response times do NOT create fictitious movement.
// Only the complementing specialists in the SAME XI may earn the existing
// route-cover term when every defender arrives before the outlet window.
const centralIds = centralCover.counterplay.defensiveReply.evidence.supportingPlayerIds;
const arrivalById = Object.fromEntries(centralIds.map(id => [id, 2.5]));
const authoredWindow = (attackWindowSeconds, defenderArrivalSecondsByPlayerId = arrivalById,
  route = "third_man", basis = "authored_scenario") => ({
  basis, route, attackWindowSeconds, defenderArrivalSecondsByPlayerId
});
const timedThird = (timing, draw = 0.99, currentLineup = eleven) => resolve(
  session("midfield_press_trap", {
    lineupSnapshot: currentLineup,
    opponent: { ...opponent, tacticalBehaviour: {
      pressEscapeRoute: "third_man",
      ...(timing === undefined ? {} : { pressEscapeTiming: timing })
    }}
  }), 0.99, draw);
const onTime = timedThird(authoredWindow(3.0));
const late = timedThird(authoredWindow(2.0));
const noWindow = timedThird();
assert.equal(onTime.evidence.routeCoverTiming.status, "in_time");
assert.equal(onTime.evidence.routeCoverTiming.basis, "authored_scenario");
assert.equal(onTime.evidence.routeCoverTiming.marginSeconds, 0.5);
assert.equal(late.evidence.routeCoverTiming.status, "late");
assert.equal(late.evidence.routeCoverTiming.marginSeconds, -0.5);
assert.equal(late.routeCoverAdjustment, 0,
  "late support cannot claim specialist coordination");
assert.equal(onTime.routeCoverAdjustment, noWindow.routeCoverAdjustment,
  "timely support retains existing role-fit bonus, never a new bonus");
assert.equal(noWindow.evidence.routeCoverTiming.status, "not_provided");
assert.equal(onTime.probability, late.probability,
  "timing of second phase cannot affect the initial press");
assert.ok(Math.abs(late.containmentProbability -
  (noWindow.containmentProbability - noWindow.routeCoverAdjustment)) < 0.0011,
  "timing only gates the existing route-specific coordination contribution");
const timeMidpoint = (onTime.containmentProbability + late.containmentProbability) / 2;
const onTimeStop = timedThird(authoredWindow(3.0), timeMidpoint);
const lateEscape = timedThird(authoredWindow(2.0), timeMidpoint);
assert.equal(onTimeStop.status, "contained");
assert.equal(lateEscape.status, "escaped");
assert.equal(onTimeStop.xgDeltaAgainst, 0.02);
assert.equal(lateEscape.xgDeltaAgainst, 0.06);
assert.equal(onTimeStop.counterplay.defensiveReply.coverTiming.status, "in_time");
assert.equal(lateEscape.counterplay.defensiveReply.coverTiming.status, "late");
for (const invalidTiming of [
  authoredWindow(0), authoredWindow(99),
  authoredWindow(2, Object.fromEntries([[centralIds[0], 1]])),
  authoredWindow(2, { ...arrivalById, [centralIds[1]]: -1 }),
  authoredWindow(2, arrivalById, "switch_play"),
  authoredWindow(2, arrivalById, "third_man", "claimed_observation"),
  { route: "third_man", basis: "authored_scenario",
    attackWindowSeconds: 2, defenderArrivalSecondsByPlayerId: [] }
]) {
  const result = timedThird(invalidTiming);
  assert.equal(result.evidence.routeCoverTiming.status, "invalid_or_incomplete");
  assert.equal(result.routeCoverAdjustment, noWindow.routeCoverAdjustment,
    "invalid / stale / unsupported timing must not make up fast or slow recovery");
}
assert.equal(timedThird(authoredWindow(2), 0.99,
  swapRole("CM", "deep_playmaker")).routeCoverAdjustment, 0,
  "timing cannot rescue a missing complementary specialist role");

 
// Match-situation timeline: four explicit offensive actions against the
// defenders' own trigger recognition and recovery movement. This feeds the
// SAME stage-two gate, not a newly minted movement probability or xG event.
const sequenceResponse = Object.fromEntries(centralIds.map(id => [id, {
  recognitionDelaySeconds: 0.4, coverMoveSeconds: 2.1
}]));
const authoredSequence = (finalPassSeconds, defenders = sequenceResponse,
  route = "third_man") => ({
  basis: "authored_action_sequence", route,
  actions: [
    { id: "receive", durationSeconds: 0.7 },
    { id: "layoff", durationSeconds: 0.5 },
    { id: "third_runner", durationSeconds: 0.7 },
    { id: "through_pass", durationSeconds: finalPassSeconds }
  ],
  defenderResponsesByPlayerId: defenders
});
const sequenceTrial = (timeline, draw = 0.99, withLegacy = undefined,
  activeEleven = eleven) => resolve(
  session("midfield_press_trap", {
    lineupSnapshot: activeEleven,
    opponent: { ...opponent, tacticalBehaviour: {
      pressEscapeRoute: "third_man",
      pressEscapeActionSequence: timeline,
      ...(withLegacy === undefined ? {} : { pressEscapeTiming: withLegacy })
    } }
  }), 0.99, draw);
const sequenceTimely = sequenceTrial(authoredSequence(1.2));
const sequenceLate = sequenceTrial(authoredSequence(0.2));
assert.equal(sequenceTimely.evidence.routeCoverTiming.status, "in_time");
assert.equal(sequenceLate.evidence.routeCoverTiming.status, "late");
assert.equal(sequenceTimely.evidence.routeCoverTiming.basis, "authored_action_sequence");
assert.equal(sequenceTimely.evidence.routeCoverTiming.attackWindowSeconds, 3.1);
assert.equal(sequenceLate.evidence.routeCoverTiming.marginSeconds, -0.4);
assert.equal(sequenceTimely.routeCoverAdjustment, noWindow.routeCoverAdjustment);
assert.equal(sequenceLate.routeCoverAdjustment, 0);
assert.equal(sequenceTimely.probability, sequenceLate.probability);
assert.equal(sequenceTimely.xgDeltaAgainst, sequenceLate.xgDeltaAgainst);
const sequenceCutoff = (sequenceTimely.containmentProbability +
  sequenceLate.containmentProbability) / 2;
assert.equal(sequenceTrial(authoredSequence(1.2), sequenceCutoff).status, "contained");
assert.equal(sequenceTrial(authoredSequence(0.2), sequenceCutoff).status, "escaped");
assert.equal(sequenceTrial(authoredSequence(1.2), sequenceCutoff).xgDeltaAgainst, 0.02);
assert.equal(sequenceTrial(authoredSequence(0.2), sequenceCutoff).xgDeltaAgainst, 0.06);
// Same four actions, player strengths and RNG; only the observed action
// that triggers defender recognition changes the recovery outcome.
const onFirstCue = Object.fromEntries(centralIds.map(id => [id, {
  ...sequenceResponse[id], triggerActionId: "receive"
}]));
const onLayoffCue = Object.fromEntries(centralIds.map(id => [id, {
  ...sequenceResponse[id], triggerActionId: "layoff"
}]));
const firstCue = sequenceTrial(authoredSequence(1.2, onFirstCue));
const delayedCue = sequenceTrial(authoredSequence(1.2, onLayoffCue));
assert.equal(firstCue.evidence.routeCoverTiming.status, "in_time");
assert.equal(delayedCue.evidence.routeCoverTiming.status, "late");
assert.equal(delayedCue.evidence.routeCoverTiming.latestRecoverySeconds, 3.2);
assert.equal(delayedCue.evidence.routeCoverTiming.marginSeconds, -0.1);
assert.equal(delayedCue.probability, firstCue.probability);
assert.equal(delayedCue.routeCoverAdjustment, 0);
const mixedCue = {
  ...onFirstCue, [centralIds[1]]: onLayoffCue[centralIds[1]]
};
assert.equal(sequenceTrial(authoredSequence(1.2, mixedCue))
  .evidence.routeCoverTiming.status, "late",
  "one required covering player recognising late loses the coordination term");
// The scenario supplies BOTH cue alternatives. Only genuinely sourced
// anticipation (never high generic match fit) authorises the early one.
const adaptiveResponse = { ...onFirstCue, [centralIds[0]]: {
  recognitionDelaySeconds: 0.4, coverMoveSeconds: 2.1,
  sourcedCue: {
    skill: "anticipation", earlyActionId: "receive", defaultActionId: "layoff"
  }
} };
const xiNoProof = eleven.map(player => ({
  ...player, sourcedRecoverySkills: []
}));
const xiWithProof = xiNoProof.map(player =>
  player.playerId === centralIds[0]
    ? { ...player, sourcedRecoverySkills: ["anticipation"] } : player);
const adaptiveWithoutProof = sequenceTrial(
  authoredSequence(1.2, adaptiveResponse), 0.99, undefined, xiNoProof);
const adaptiveWithProof = sequenceTrial(
  authoredSequence(1.2, adaptiveResponse), 0.99, undefined, xiWithProof);
assert.equal(adaptiveWithoutProof.evidence.routeCoverTiming.status, "late");
assert.equal(adaptiveWithProof.evidence.routeCoverTiming.status, "in_time");
assert.equal(adaptiveWithoutProof.probability, adaptiveWithProof.probability);
assert.equal(adaptiveWithoutProof.evidence.routeCoverFitFloor,
  adaptiveWithProof.evidence.routeCoverFitFloor);
assert.ok(adaptiveWithProof.containmentProbability >
  adaptiveWithoutProof.containmentProbability);
for (const bad of [
  authoredSequence(0),
  authoredSequence(25),
  authoredSequence(0.2, {}),
  authoredSequence(0.2, { ...sequenceResponse,
    [centralIds[0]]: { recognitionDelaySeconds: -1, coverMoveSeconds: 2 } }),
  authoredSequence(0.2, { ...sequenceResponse,
    [centralIds[0]]: { ...sequenceResponse[centralIds[0]],
      triggerActionId: "no_actual_action" } }),
  authoredSequence(0.2, { ...sequenceResponse,
    [centralIds[0]]: { ...sequenceResponse[centralIds[0]],
      triggerActionId: null } }),
  authoredSequence(0.2, sequenceResponse, "switch_play"),
  authoredSequence(0.2, { ...adaptiveResponse, [centralIds[0]]: {
    ...adaptiveResponse[centralIds[0]], triggerActionId: "receive"
  } }),
  authoredSequence(0.2, { ...adaptiveResponse, [centralIds[0]]: {
    ...adaptiveResponse[centralIds[0]],
    sourcedCue: { skill: "imaginary", earlyActionId: "receive", defaultActionId: "layoff" }
  } }),
  { ...authoredSequence(0.2), actions: [{ id: "layoff", durationSeconds: 2 }] },
  { ...authoredSequence(0.2), basis: "tracking_observation" }
]) {
  const result = sequenceTrial(bad);
  assert.equal(result.evidence.routeCoverTiming.status, "invalid_or_incomplete");
  assert.equal(result.routeCoverAdjustment, noWindow.routeCoverAdjustment,
    "unverified action timings must never supply a fictitious recovery outcome");
}
assert.equal(sequenceTrial(authoredSequence(0.2), 0.99, authoredWindow(3.0))
  .evidence.routeCoverTiming.basis, "authored_scenario",
  "legacy explicit window wins if both formats are present");

 
// Authored geometry: same XI and action clock, but a defender starts too far
// from the cover corridor in one scenario. Travel time is calculated from
// documented SCENARIO metres/speed, NEVER from matchScore or invented pace.
const pitchDimensionsMeters = { widthMeters: 68, lengthMeters: 105 };
const scenarioGeometryResponses = Object.fromEntries(centralIds.map(id => [id, {
  recognitionDelaySeconds: 0.4, triggerActionId: "receive",
  coverMovement: {
    basis: "authored_pitch_geometry",
    startMeters: { x: 20, y: 50 },
    coverMeters: { x: 26, y: 50 },
    averageSpeedMetersPerSecond: 4
  }
}]));
const geometricTimeline = responses => ({
  ...authoredSequence(1.2, responses), pitchDimensionsMeters
});
const nearbyCover = sequenceTrial(geometricTimeline(scenarioGeometryResponses));
const farCoverResponses = {
  ...scenarioGeometryResponses,
  [centralIds[1]]: {
    ...scenarioGeometryResponses[centralIds[1]],
    coverMovement: {
      ...scenarioGeometryResponses[centralIds[1]].coverMovement,
      coverMeters: { x: 34, y: 50 }
    }
  }
};
const distantCover = sequenceTrial(geometricTimeline(farCoverResponses));
assert.equal(nearbyCover.evidence.routeCoverTiming.status, "in_time");
assert.equal(distantCover.evidence.routeCoverTiming.status, "late");
assert.equal(nearbyCover.evidence.routeCoverTiming.movementModel,
  "authored_pitch_geometry");
assert.equal(nearbyCover.evidence.routeCoverTiming.latestRecoverySeconds, 1.9);
assert.equal(distantCover.evidence.routeCoverTiming.latestRecoverySeconds, 3.9);
assert.equal(nearbyCover.evidence.routeCoverTiming.attackWindowSeconds, 3.1);
assert.equal(nearbyCover.probability, distantCover.probability);
assert.equal(distantCover.routeCoverAdjustment, 0);
assert.equal(nearbyCover.routeCoverAdjustment, noWindow.routeCoverAdjustment);
const geometryMidpoint = (nearbyCover.containmentProbability +
  distantCover.containmentProbability) / 2;
assert.equal(sequenceTrial(geometricTimeline(scenarioGeometryResponses),
  geometryMidpoint).status, "contained");
assert.equal(sequenceTrial(geometricTimeline(farCoverResponses),
  geometryMidpoint).status, "escaped");
assert.equal(sequenceTrial(geometricTimeline(scenarioGeometryResponses),
  geometryMidpoint).xgDeltaAgainst, 0.02);
assert.equal(sequenceTrial(geometricTimeline(farCoverResponses),
  geometryMidpoint).xgDeltaAgainst, 0.06);
// A sourced cue works with geometry too, without creating a new speed bonus.
const geometryCueResponses = { ...farCoverResponses, [centralIds[1]]: {
  ...farCoverResponses[centralIds[1]],
  coverMovement: {
    ...farCoverResponses[centralIds[1]].coverMovement,
    coverMeters: { x: 30, y: 50 }
  },
  sourcedCue: {
    skill: "anticipation", earlyActionId: "receive",
    defaultActionId: "layoff"
  },
  triggerActionId: undefined
} };
delete geometryCueResponses[centralIds[1]].triggerActionId;
const geomUnproven = sequenceTrial(geometricTimeline(geometryCueResponses),
  0.99, undefined, xiNoProof);
const geomProven = sequenceTrial(geometricTimeline(geometryCueResponses),
  0.99, undefined, xiNoProof.map(player => player.playerId === centralIds[1]
    ? { ...player, sourcedRecoverySkills: ["anticipation"] } : player));
assert.equal(geomUnproven.evidence.routeCoverTiming.status, "late");
assert.equal(geomProven.evidence.routeCoverTiming.status, "in_time");
assert.equal(geomUnproven.probability, geomProven.probability);
for (const badGeometry of [
  { ...geometricTimeline(scenarioGeometryResponses), pitchDimensionsMeters: null },
  { ...geometricTimeline(scenarioGeometryResponses),
    pitchDimensionsMeters: { widthMeters: 20, lengthMeters: 105 } },
  geometricTimeline({ ...scenarioGeometryResponses, [centralIds[0]]: {
    ...scenarioGeometryResponses[centralIds[0]], coverMoveSeconds: 1
  } }),
  geometricTimeline({ ...scenarioGeometryResponses, [centralIds[0]]: {
    ...scenarioGeometryResponses[centralIds[0]], coverMovement: {
      ...scenarioGeometryResponses[centralIds[0]].coverMovement,
      coverMeters: { x: 70, y: 50 }
    }
  } }),
  geometricTimeline({ ...scenarioGeometryResponses, [centralIds[0]]: {
    ...scenarioGeometryResponses[centralIds[0]], coverMovement: {
      ...scenarioGeometryResponses[centralIds[0]].coverMovement,
      averageSpeedMetersPerSecond: 0
    }
  } }),
  geometricTimeline({ ...scenarioGeometryResponses, [centralIds[0]]: {
    ...scenarioGeometryResponses[centralIds[0]], coverMovement: {
      ...scenarioGeometryResponses[centralIds[0]].coverMovement,
      averageSpeedMetersPerSecond: 11
    }
  } }),
  geometricTimeline({ ...scenarioGeometryResponses, [centralIds[0]]: {
    ...scenarioGeometryResponses[centralIds[0]], coverMovement: {
      ...scenarioGeometryResponses[centralIds[0]].coverMovement,
      startMeters: { x: Number.NaN, y: 50 }
    }
  } })
]) {
  const result = sequenceTrial(badGeometry);
  assert.equal(result.evidence.routeCoverTiming.status, "invalid_or_incomplete");
  assert.equal(result.routeCoverAdjustment, noWindow.routeCoverAdjustment);
}


// Three distinct, explicit defending corridors: central third-man lane,
// named far-side channel after a switch, and depth toward our own goal line.
// All scenarios use the SAME XI and preserve first-phase press probability.
// Time values are authored test inputs, not real historical tracking data.
const spatialActions = {
  third_man: ["receive", "layoff", "third_runner", "through_pass"],
  switch_play: ["receive", "release", "switch_pass", "wide_attack"],
  direct: ["receive", "direct_ball", "first_touch", "support_run"]
};
const spatialChannels = {
  third_man: "central_between_lines",
  switch_play: "far_side_wide",
  direct: "depth_behind_press"
};
const spatialCases = [
  { route: "third_man", side: null,
    start: { x: 30, y: 55 }, cover: { x: 34, y: 55 },
    lateStart: { x: 18, y: 55 }, wrong: { x: 60, y: 55 },
    expectedRoles: 2 },
  { route: "switch_play", side: "right",
    start: { x: 50, y: 55 }, cover: { x: 60, y: 55 },
    lateStart: { x: 25, y: 55 }, wrong: { x: 8, y: 55 },
    expectedRoles: 1 },
  { route: "switch_play", side: "left",
    start: { x: 18, y: 55 }, cover: { x: 8, y: 55 },
    lateStart: { x: 43, y: 55 }, wrong: { x: 60, y: 55 },
    expectedRoles: 1 },
  { route: "direct", side: null,
    start: { x: 34, y: 38 }, cover: { x: 34, y: 32 },
    lateStart: { x: 34, y: 60 }, wrong: { x: 34, y: 80 },
    expectedRoles: 3 }
];
const routeSpatialPhase = (spec, options = {}) => {
  const targetFlank = options.side === undefined ? spec.side : options.side;
  const scouting = { pressEscapeRoute: spec.route };
  if (targetFlank !== null) scouting.pressEscapeTargetFlank = targetFlank;
  const supported = resolve(session("midfield_press_trap", {
    lineupSnapshot: eleven,
    opponent: { ...opponent, tacticalBehaviour: scouting }
  }), 0.99, 0.99);
  const ids = supported.counterplay.defensiveReply.evidence.supportingPlayerIds;
  assert.equal(ids.length, targetFlank === null && spec.route === "switch_play"
    ? 2 : spec.expectedRoles, spec.route + " role contract");
  const lateId = ids[ids.length - 1];
  const responses = Object.fromEntries(ids.map(id => [id, {
    recognitionDelaySeconds: 0.3, triggerActionId: "receive",
    coverMovement: {
      basis: "authored_pitch_geometry", startMeters:
        id === lateId && options.late ? spec.lateStart : spec.start,
      coverMeters: id === lateId && options.wrong ? spec.wrong : spec.cover,
      averageSpeedMetersPerSecond: 4
    }
  }]));
  if (options.noGeometry) {
    responses[lateId] = { recognitionDelaySeconds: 0.3,
      coverMoveSeconds: 1 };
  }
  const timeline = {
    basis: "authored_action_sequence", route: spec.route,
    actions: spatialActions[spec.route].map(id => ({
      id, durationSeconds: spec.route === "direct" ? 0.65 : 1
    })),
    pitchDimensionsMeters: { widthMeters: 68, lengthMeters: 105 },
    spatialLane: {
      basis: "authored_route_lane",
      route: options.wrongRoute ? "wrong_route" : spec.route,
      channel: options.wrongChannel ? "wrong_channel" : spatialChannels[spec.route],
      coordinateFrame: "defending_goal_y0_right_xmax",
      ...(spec.route === "switch_play" ? {
        targetFlank: options.laneFlank ?? spec.side
      } : {})
    },
    defenderResponsesByPlayerId: responses
  };
  if (options.noLane) delete timeline.spatialLane;
  if (options.noFrame) delete timeline.spatialLane.coordinateFrame;
  scouting.pressEscapeActionSequence = timeline;
  return resolve(session("midfield_press_trap", {
    lineupSnapshot: eleven,
    opponent: { ...opponent, tacticalBehaviour: scouting }
  }), 0.99, options.draw ?? 0.99);
};
for (const spec of spatialCases) {
  const timely = routeSpatialPhase(spec);
  const distant = routeSpatialPhase(spec, { late: true });
  assert.equal(timely.evidence.routeCoverTiming.status, "in_time", spec.route);
  assert.equal(distant.evidence.routeCoverTiming.status, "late", spec.route);
  assert.equal(timely.evidence.routeCoverTiming.spatialLane,
    spatialChannels[spec.route]);
  assert.equal(timely.evidence.routeCoverTiming.movementModel,
    "authored_pitch_geometry");
  assert.equal(timely.probability, distant.probability);
  assert.equal(timely.xgDeltaAgainst, distant.xgDeltaAgainst);
  assert.ok(timely.routeCoverAdjustment > 0);
  assert.equal(distant.routeCoverAdjustment, 0);
  const cutoff = (timely.containmentProbability +
    distant.containmentProbability) / 2;
  assert.equal(routeSpatialPhase(spec, { draw: cutoff }).status, "contained");
  assert.equal(routeSpatialPhase(spec, { late: true, draw: cutoff }).status,
    "escaped");
  const wrongLane = routeSpatialPhase(spec, { wrong: true });
  assert.equal(wrongLane.evidence.routeCoverTiming.status, "wrong_corridor");
  assert.equal(wrongLane.routeCoverAdjustment, 0,
    "a VALID authored defender moving to the wrong lane loses specialist cover");
  assert.equal(wrongLane.probability, timely.probability);
  for (const invalidOpts of [
    { wrongChannel: true }, { wrongRoute: true },
    { noFrame: true }, { noGeometry: true }
  ]) {
    const invalid = routeSpatialPhase(spec, invalidOpts);
    assert.equal(invalid.evidence.routeCoverTiming.status,
      "invalid_or_incomplete", spec.route + " " + JSON.stringify(invalidOpts));
    assert.ok(invalid.routeCoverAdjustment > 0,
      "invalid scenario does not fabricate a late recovery penalty");
  }
  const legacyCompatible = routeSpatialPhase(spec, { noLane: true });
  assert.equal(legacyCompatible.evidence.routeCoverTiming.status, "in_time");
  assert.equal(legacyCompatible.evidence.routeCoverTiming.spatialLane, null);
  if (spec.route === "switch_play") {
    assert.equal(routeSpatialPhase(spec, { laneFlank:
      spec.side === "left" ? "right" : "left" })
      .evidence.routeCoverTiming.status, "invalid_or_incomplete");
    // A spatially labelled wide lane cannot claim the correct specialist
    // when the attack destination is missing from the scouting source.
    const noScoutedSide = routeSpatialPhase(spec, { side: null });
    assert.equal(noScoutedSide.evidence.routeCoverTiming.status,
      "invalid_or_incomplete");
  }
}
console.log("OK: four route/flank geometries require aligned tactical lanes.");

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
