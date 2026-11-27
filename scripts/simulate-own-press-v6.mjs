import { resolveSourcedCreativeBreakthrough, resolveCompactBlockAttack, annotateCompactBlockChances, resolveDoubleMidfieldScreen } from "../src/football-matchday-compact-block-v6.js";
// Deterministic causal pressing: high press, mid-block trap, counterpress and escapes.
import assert from "node:assert/strict";
import { resolveOpponentRunSequence, resolveOpponentSwitchCrossSequence, annotateOpponentRunChances, resolveOpponentZonalShift, annotateOpponentZonalShiftChances, resolveOpponentRehearsedOutlet, annotateOpponentRehearsedOutletChances, resolveOpponentDirectSecondBall, annotateOpponentDirectSecondBallChances, resolveOpponentSetPiece, annotateOpponentSetPieceChances, annotateOpponentCreativeAttackChances, resolveOpponentFullbackOverlap, annotateOpponentFullbackOverlapChances, annotateOpponentShortCombinationChances, resolveOpponentThreeSpaceCombination, annotateOpponentThreeSpaceChances, resolveOpponentSelectiveTransition, annotateOpponentSelectiveTransitionChances, resolveOpponentWingbackPin, annotateOpponentWingbackPinChances } from "../src/football-matchday-sequence-v8.js";
import { readFileSync } from "node:fs";
import { resolveOwnPressAgainstOpponent, annotateOwnPressChances }
  from "../src/football-matchday-own-press-v6.js";
import { advanceMatchClock, finalizeMatchdaySession, generateMatchdayEvents, applyOpponentAdaptation }
  from "../src/football-matchday-engine.js";
import { highPressPhaseRoll, resolveHighPressBuildUp, opponentPressWorkload }
  from "../src/football-matchday-high-press-v6.js";
import { sourcedDefensiveReactionSkillsForPlayer, sourcedCreativeSkillsForPlayer, createLineupSnapshot }
  from "../src/football-player-stats.js";

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
// Viking's scoped direct outlet is a documented high-press response, not
// evidence that the club generally builds short.
const leagueProfiles = JSON.parse(readFileSync(new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8")).profiles;
const viking = leagueProfiles.find(p => p.clubId === "viking");
assert.equal(viking.styleTraits.shortBuildUp, 56);
assert.equal(viking.tacticalBehaviourEvidence?.era, "2023");
assert.equal(viking.tacticalBehaviourEvidence?.eraByPattern?.highPressEscapeRoute,"2023");
assert.equal(viking.tacticalBehaviourEvidence?.eraByPattern?.attackingRunPattern,"1971–1975");
assert.equal(viking.tacticalBehaviourEvidence?.eraByPattern?.shortCombinationPattern,"1971–1975");
const vikingOpponent = { ...viking, id: viking.clubId, strength: 72 };
const { tacticalBehaviour: _vikingEscape, ...unknownViking } = vikingOpponent;
const vikingSession = session("high_press_343", { opponent: vikingOpponent });
assert.equal(resolve(session("high_press_343", { opponent: unknownViking }), 0.99, 0.99), null);
const vikingEscaped = resolve(vikingSession, 0.99, 0.99);
assert.equal(vikingEscaped.status, "escaped");
assert.equal(vikingEscaped.probability, 0.477);
assert.equal(vikingEscaped.containmentProbability, 0.57);
assert.equal(vikingEscaped.evidence.opponentTriggerBasis, "documented_direct_high_press_escape");
assert.equal(vikingEscaped.counterplay.pathwayId, "direct");
assert.equal(vikingEscaped.xgDeltaAgainst, 0.06);
const vikingContained = resolve(vikingSession, 0.99, 0);
assert.equal(vikingContained.status, "contained");
assert.equal(vikingContained.xgDeltaAgainst, 0.02);
const vikingRegain = resolve(vikingSession, 0, 0.99);
assert.equal(vikingRegain.status, "regain");
assert.equal(vikingRegain.xgDeltaFor, 0.11);
assert.equal(resolve({ ...vikingSession, causalPressingVersion: undefined }, 0, 0), null);
assert.equal(resolve(session("high_press_343", {
  opponent: { ...vikingOpponent, tacticalBehaviour: { ...vikingOpponent.tacticalBehaviour, pressEscape: "isolated" } }
}), 0.99, 0.99), null);
for (const plan of ["midfield_press_trap", "counter_press_recovery"]) {
  // Eligible control fixture: the scoped field must not leak into other phases.
  const traits = { ...vikingOpponent.styleTraits, possessionControl: 75, transitionThreat: 75 };
  const known = resolve(session(plan, { opponent: { ...vikingOpponent, styleTraits: traits } }), 0.99, 0.99);
  const unknown = resolve(session(plan, { opponent: { ...unknownViking, styleTraits: traits } }), 0.99, 0.99);
  assert.ok(known && unknown);
  assert.deepEqual(known, unknown);
}
assert.equal(resolve(session("high_press_343", {
  opponent: { ...vikingOpponent, styleTraits: { ...vikingOpponent.styleTraits, shortBuildUp: undefined } }
}), 0, 0), null, "the scoped route cannot fabricate a missing metric");

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
  assert.equal(phase.counterplay.defensiveReply.coverTimingExplanation.kind,
    "unknown", "no authored timing must not imply a defensive error");
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

 

// The six and the covering runner can have DIFFERENT intervention deadlines.
// The six may have to close the third-runner lane BEFORE the final pass,
// while the other player still has until the end of the full escape.
const timedByAction = deadlineAction => authoredSequence(1.2, {
  ...sequenceResponse,
  [centralIds[0]]: {
    recognitionDelaySeconds: 0.4, coverMoveSeconds: 1,
    triggerActionId: "receive",
    mustCoverByActionId: deadlineAction
  }
});
const readyForFinalPass = sequenceTrial(timedByAction("through_pass"));
const tooLateForThirdRunner = sequenceTrial(timedByAction("third_runner"));
assert.equal(readyForFinalPass.evidence.routeCoverTiming.status, "in_time");
assert.equal(tooLateForThirdRunner.evidence.routeCoverTiming.status, "late");
assert.equal(readyForFinalPass.evidence.routeCoverTiming.deadlineModel,
  "per_defender_action_start");
assert.equal(readyForFinalPass.evidence.routeCoverTiming.criticalDefenderId,
  centralIds[0]);
assert.equal(readyForFinalPass.evidence.routeCoverTiming.criticalDeadlineSeconds, 1.9);
assert.equal(readyForFinalPass.evidence.routeCoverTiming.marginSeconds, 0.5);
assert.equal(tooLateForThirdRunner.evidence.routeCoverTiming.criticalDeadlineSeconds, 1.2);
assert.equal(tooLateForThirdRunner.evidence.routeCoverTiming.marginSeconds, -0.2);
assert.equal(readyForFinalPass.evidence.routeCoverTiming.attackWindowSeconds, 3.1);
assert.equal(readyForFinalPass.probability, tooLateForThirdRunner.probability);
assert.ok(readyForFinalPass.containmentProbability >
  tooLateForThirdRunner.containmentProbability);
const deadlineDraw = (readyForFinalPass.containmentProbability +
  tooLateForThirdRunner.containmentProbability) / 2;
assert.equal(sequenceTrial(timedByAction("through_pass"), deadlineDraw)
  .status, "contained");
assert.equal(sequenceTrial(timedByAction("third_runner"), deadlineDraw)
  .status, "escaped");
assert.equal(sequenceTrial(timedByAction("through_pass"), deadlineDraw)
  .xgDeltaAgainst, 0.02);
assert.equal(sequenceTrial(timedByAction("third_runner"), deadlineDraw)
  .xgDeltaAgainst, 0.06);
for (const malformed of [null, "", "missing_action", 5]) {
  const invalid = sequenceTrial(timedByAction(malformed));
  assert.equal(invalid.evidence.routeCoverTiming.status, "invalid_or_incomplete");
  assert.equal(invalid.routeCoverAdjustment, noWindow.routeCoverAdjustment);
}

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
    ...(options.mustCoverByActionId !== undefined
      ? { mustCoverByActionId: options.mustCoverByActionId } : {}),
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
  assert.equal(wrongLane.counterplay.defensiveReply
    .coverTimingExplanation.kind, "wrong_corridor");
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
    assert.equal(invalid.counterplay.defensiveReply
      .coverTimingExplanation.kind, "unknown");
    assert.ok(invalid.routeCoverAdjustment > 0,
      "invalid scenario does not fabricate a late recovery penalty");
  }
  // Route-specific deadline: a runner, far-side back or CB can reach the
  // FINAL corridor but miss the earlier pass that opens it.
  const deadlines = spec.route === "third_man"
    ? ["layoff", "third_runner"] :
      spec.route === "switch_play" ? ["switch_pass", "wide_attack"] :
        ["first_touch", "support_run"];
  const missedIntervention = routeSpatialPhase(spec, {
    mustCoverByActionId: deadlines[0]
  });
  const reachedIntervention = routeSpatialPhase(spec, {
    mustCoverByActionId: deadlines[1]
  });
  assert.equal(missedIntervention.evidence.routeCoverTiming.status, "late",
    spec.route + " early defensive intervention");
  assert.equal(reachedIntervention.evidence.routeCoverTiming.status, "in_time",
    spec.route + " late defensive intervention");
  assert.equal(missedIntervention.routeCoverAdjustment, 0);
  assert.equal(reachedIntervention.routeCoverAdjustment, timely.routeCoverAdjustment);
  assert.equal(missedIntervention.probability, reachedIntervention.probability);
  assert.equal(missedIntervention.xgDeltaAgainst, reachedIntervention.xgDeltaAgainst);
  const wrongAction = routeSpatialPhase(spec, {
    mustCoverByActionId: "action_not_on_this_route"
  });
  assert.equal(wrongAction.evidence.routeCoverTiming.status,
    "invalid_or_incomplete");
  assert.ok(wrongAction.routeCoverAdjustment > 0);
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
// Defensive reactions are one LINKED chain, not three independent cover
// bonuses. A late first screen cannot be rescued by a timely FINAL position.
const defensiveTaskRoutes = {
  third_man: {
    actions: ["receive", "layoff", "third_runner", "through_pass"],
    tasks: ["screen_layoff", "follow_third_runner", "drop_for_through_pass"]
  },
  switch_play: {
    actions: ["receive", "release", "switch_pass", "wide_attack"],
    tasks: ["delay_release", "shift_to_far_side", "hold_wide_channel"]
  },
  direct: {
    actions: ["receive", "direct_ball", "first_touch", "support_run"],
    tasks: ["drop_behind_press", "challenge_first_touch", "protect_support_run"]
  }
};
const linkedDefensiveReply = (route, side = null, lateFirst = false,
  draw = 0.99, edit = null, handoffOptions = null) => {
  const config = defensiveTaskRoutes[route];
  const basePhase = route === "switch_play" && side
    ? targetedSwitch(side, eleven) : replyRun(route);
  const ids = basePhase.counterplay.defensiveReply.evidence.supportingPlayerIds;
  assert.ok(ids.length, route + " has known specialists");
  const stages = config.tasks.map((taskId, i) => ({
    taskId,
    triggerActionId: config.actions[i],
    recognitionDelaySeconds: 0.1,
    coverMoveSeconds: i === 0 ? (lateFirst ? 0.66 : 0.4) :
      i === 1 ? 0.2 : 0.3
  }));
  if (edit) edit(stages);
  const responders = Object.fromEntries(ids.map((id, i) => [id, i === 0 ?
    { defensiveActionChain: stages } :
    { recognitionDelaySeconds: 0.1,
      coverMoveSeconds: handoffOptions?.receiverMoveSeconds ?? 1.9 }]));
  const coverHandoff = handoffOptions ? {
    fromDefenderId: ids[0], toDefenderId: ids[1],
    releaseTaskId: config.tasks[1],
    coveredChannel: {
      third_man: "central_between_lines",
      switch_play: "far_side_wide", direct: "depth_behind_press"
    }[route],
    ...(side ? { targetFlank: side } : {})
  } : null;
  if (handoffOptions?.editHandoff) handoffOptions.editHandoff(coverHandoff);
  const timeline = {
    basis: "authored_action_sequence", route,
    actions: config.actions.map((id, i) => ({
      id, durationSeconds: [0.7, 0.5, 0.7, 1.2][i]
    })),
    defenderResponsesByPlayerId: responders,
    ...(coverHandoff ? { defenderCoverHandoff: coverHandoff } : {})
  };
  return resolve(session("midfield_press_trap", {
    lineupSnapshot: eleven,
    opponent: { ...opponent, tacticalBehaviour: {
      pressEscapeRoute: route,
      ...(side ? { pressEscapeTargetFlank: side } : {}),
      pressEscapeActionSequence: timeline
    } }
  }), 0.99, draw);
};
for (const [route, side] of [
  ["third_man", null], ["switch_play", null],
  ["switch_play", "left"], ["switch_play", "right"], ["direct", null]
]) {
  const timely = linkedDefensiveReply(route, side);
  const lateEarlyScreen = linkedDefensiveReply(route, side, true);
  const good = timely.evidence.routeCoverTiming;
  const late = lateEarlyScreen.evidence.routeCoverTiming;
  assert.equal(good.status, "in_time", route + " " + side);
  assert.equal(late.status, "late", route + " " + side);
  assert.equal(timely.counterplay.defensiveReply.coverTimingExplanation.kind,
    "in_time");
  assert.equal(lateEarlyScreen.counterplay.defensiveReply.coverTimingExplanation.kind,
    "late_task");
  assert.ok(lateEarlyScreen.counterplay.defensiveReply
    .coverTimingExplanation.description.length > 20);
  assert.equal(annotateOwnPressChances([
    { side: "against", quality: 0.1 }
  ], lateEarlyScreen)[0].tacticalMoment.counterplay
    .defensiveReply.coverTimingExplanation.kind, "late_task",
    "the replay chance must retain the same explanation");
  assert.equal(good.defensiveSequenceModel, "sequential_defender_tasks");
  assert.equal(good.defensiveTransitions.length, 3);
  assert.equal(late.defensiveTransitions[0].status, "late");
  assert.equal(late.defensiveTransitions[1].status, "in_time");
  assert.equal(late.defensiveTransitions[2].status, "in_time");
  assert.equal(late.criticalTaskId, defensiveTaskRoutes[route].tasks[0]);
  assert.equal(late.defensiveTransitions[2].completionSeconds,
    good.defensiveTransitions[2].completionSeconds,
    "same last arrival does NOT erase missed first transition");
  assert.equal(timely.probability, lateEarlyScreen.probability);
  assert.equal(timely.routeCoverAdjustment > 0, true);
  assert.equal(lateEarlyScreen.routeCoverAdjustment, 0);
  assert.equal(timely.xgDeltaAgainst, lateEarlyScreen.xgDeltaAgainst);
  const cutoff = (timely.containmentProbability +
    lateEarlyScreen.containmentProbability) / 2;
  assert.equal(linkedDefensiveReply(route, side, false, cutoff).status,
    "contained");
  assert.equal(linkedDefensiveReply(route, side, true, cutoff).status,
    "escaped");
  assert.equal(linkedDefensiveReply(route, side, false, cutoff).xgDeltaAgainst,
    0.02);
  assert.equal(linkedDefensiveReply(route, side, true, cutoff).xgDeltaAgainst,
    0.06);
  for (const badEdit of [
    stages => { stages[0].taskId = "task_from_another_route"; },
    stages => { stages[1].taskId = stages[0].taskId; },
    stages => { stages[1].triggerActionId = "missing_cue"; },
    stages => { stages[1].coverMoveSeconds = -1; },
    stages => { stages[1].coverMovement = { basis: "authored_pitch_geometry" }; }
  ]) {
    const bad = linkedDefensiveReply(route, side, false, 0.99, badEdit);
    assert.equal(bad.evidence.routeCoverTiming.status,
      "invalid_or_incomplete", route + " " + side + " invalid chain");
    assert.equal(bad.routeCoverAdjustment, timely.routeCoverAdjustment,
      "invalid chain stays neutral, never fabricates a defensive failure");
  }
}
// A player leaving to track the runner cannot leave his former corridor
// unattended. The receiver must be set BEFORE the source starts its next
// move. Both original individual covers are otherwise on time.
for (const route of ["third_man", "direct"]) {
  const onTime = linkedDefensiveReply(route, null, false, 0.99, null,
    { receiverMoveSeconds: 0.6 });
  const tooLate = linkedDefensiveReply(route, null, false, 0.99, null,
    { receiverMoveSeconds: 1.0 });
  const a = onTime.evidence.routeCoverTiming;
  const b = tooLate.evidence.routeCoverTiming;
  assert.equal(a.status, "in_time", route + " timely handoff");
  assert.equal(b.status, "late", route + " missing handoff");
  assert.equal(a.coverHandoff.status, "in_time");
  assert.equal(b.coverHandoff.status, "late");
  assert.equal(onTime.counterplay.defensiveReply.coverTimingExplanation.kind,
    "in_time");
  assert.equal(tooLate.counterplay.defensiveReply.coverTimingExplanation.kind,
    "late_handoff");
  assert.match(tooLate.counterplay.defensiveReply
    .coverTimingExplanation.description, /Avløseren/);
  assert.equal(a.coverHandoff.releaseSeconds, 0.8);
  assert.equal(a.coverHandoff.takeoverSeconds, 0.7);
  assert.equal(b.coverHandoff.takeoverSeconds, 1.1);
  assert.equal(b.coverHandoff.marginSeconds, -0.3);
  assert.equal(b.criticalDefenderId, b.coverHandoff.toDefenderId);
  assert.equal(b.criticalHandoff.releaseTaskId,
    defensiveTaskRoutes[route].tasks[1]);
  assert.equal(b.defensiveTransitions.every(step =>
    step.status === "in_time"), true,
    "all individual tasks succeed; only the missing transfer fails");
  assert.equal(onTime.probability, tooLate.probability);
  assert.ok(onTime.routeCoverAdjustment > 0);
  assert.equal(tooLate.routeCoverAdjustment, 0);
  assert.equal(onTime.xgDeltaAgainst, tooLate.xgDeltaAgainst);
  const threshold = (onTime.containmentProbability +
    tooLate.containmentProbability) / 2;
  assert.equal(linkedDefensiveReply(route, null, false, threshold, null,
    { receiverMoveSeconds: 0.6 }).status, "contained");
  assert.equal(linkedDefensiveReply(route, null, false, threshold, null,
    { receiverMoveSeconds: 1.0 }).status, "escaped");
  const noTransfer = linkedDefensiveReply(route);
  assert.equal(noTransfer.evidence.routeCoverTiming.coverHandoff, undefined,
    "old action chains must keep existing behaviour");
  for (const editHandoff of [
    h => { h.fromDefenderId = h.toDefenderId; },
    h => { h.toDefenderId = "unregistered-defender"; },
    h => { h.releaseTaskId = "missing-task"; },
    h => { h.releaseTaskId = defensiveTaskRoutes[route].tasks[0]; },
    h => { h.coveredChannel = "wrong_corridor"; },
    h => { h.targetFlank = "unknown"; }
  ]) {
    const bad = linkedDefensiveReply(route, null, false, 0.99, null,
      { receiverMoveSeconds: 0.6, editHandoff });
    assert.equal(bad.evidence.routeCoverTiming.status,
      "invalid_or_incomplete", route + " invalid handoff");
    assert.equal(bad.routeCoverAdjustment, noTransfer.routeCoverAdjustment,
      "untrusted handoffs are neutral, not asserted tactical failures");
  }
}
// Without a named target flank a switch-play handoff may not assert\n// that two opposite-side backs share one specific defensive corridor.\nconst unscoutedSwitchHandoff = linkedDefensiveReply("switch_play", null,\n  false, 0.99, null, { receiverMoveSeconds: 0.6 });\nassert.equal(unscoutedSwitchHandoff.evidence.routeCoverTiming.status,\n  "invalid_or_incomplete");\nassert.ok(unscoutedSwitchHandoff.routeCoverAdjustment > 0);\n// When the far-side back is the ONLY known relevant covering specialist,
// do not invent another fullback to create a handoff on either flank.
for (const side of ["left", "right"]) {
  const invalid = linkedDefensiveReply("switch_play", side, false, 0.99,
    null, { receiverMoveSeconds: 0.6 });
  assert.equal(invalid.evidence.routeCoverTiming.status,
    "invalid_or_incomplete");
  assert.ok(invalid.routeCoverAdjustment > 0);
}
// v7 counterfactual: same roles, formation, opposition, attack tempo and
// random draw, but ONE defensive slot has a DIFFERENT sourced player.
// Named authored inputs are remapped to the new player ID; we do not
// pretend to know a real player's tracking or sprint time.
const reactionStrongRecord = {
  strengths: ["pace", "positioning", "game_reading", "tackling"],
  attributes: { provenance: {
    pace: "belagt", positioning: "belagt",
    game_reading: "belagt", tackling: "belagt"
  } }
};
const reactionUnprovedRecord = {
  ...reactionStrongRecord,
  attributes: { provenance: { pace: "udokumentert", game_reading: "belagt" } }
};
const sourcedSkillEvidence = sourcedDefensiveReactionSkillsForPlayer;
assert.deepEqual(sourcedSkillEvidence(reactionStrongRecord),
  ["game_reading", "pace", "positioning", "tackling"]);
assert.deepEqual(sourcedSkillEvidence(reactionUnprovedRecord),
  ["game_reading"]);
// The matchday snapshot must carry sourced skills, never raw unproved claims.
const v7Snapshot = createLineupSnapshot({ assignments: [{
  player: { id: "sourced-defender", name: "Kontrollstopper", ...reactionStrongRecord },
  slot: { slotId: "cb1", position: "CB" },
  role: { id: "ball_playing_centre_back", name: "Stopper" },
  fit: { matchScore: 75 }
}] });
assert.deepEqual(v7Snapshot[0].sourcedDefensiveReactionSkills,
  sourcedSkillEvidence(reactionStrongRecord));
const v7DefenderId = centralIds[0];
const v7SecondId = centralIds[1];
const v7Fixture = (playerId, traits) => eleven.map(player =>
  player.playerId === v7DefenderId
    ? { ...player, playerId, sourcedDefensiveReactionSkills: traits } : player);
const v7Sequence = playerId => authoredSequence(0.2, {
  [playerId]: { recognitionDelaySeconds: 0.4, coverMoveSeconds: 1.75 },
  [v7SecondId]: { recognitionDelaySeconds: 0.4, coverMoveSeconds: 1.2 }
});
const v7Trial = (playerId, traits, draw = 0.99) =>
  sequenceTrial(v7Sequence(playerId), draw, undefined,
    v7Fixture(playerId, traits));
const v7Plain = v7Trial("ordinary-defender", []);
const v7Sourced = v7Trial("sourced-defender", sourcedSkillEvidence(reactionStrongRecord));
assert.equal(v7Plain.evidence.routeCoverTiming.status, "late");
assert.equal(v7Sourced.evidence.routeCoverTiming.status, "in_time");
assert.equal(v7Plain.evidence.routeCoverTiming.marginSeconds < 0, true);
assert.equal(v7Sourced.evidence.routeCoverTiming.marginSeconds > 0, true);
assert.equal(v7Plain.probability, v7Sourced.probability,
  "player effects do not buy another first-press probability");
assert.ok(v7Plain.routeCoverAdjustment === 0 && v7Sourced.routeCoverAdjustment > 0,
  "individual timing gates the ONE existing route-specific containment term");
assert.deepEqual(v7Plain.evidence.routeCoverTiming.defenderSkillTiming, undefined,
  "missing evidence is neutral");
assert.deepEqual(v7Sourced.evidence.routeCoverTiming.defenderSkillTiming[0].skills,
  ["game_reading", "pace", "positioning"]);
assert.ok(v7Sourced.evidence.routeCoverTiming.defenderSkillTiming[0].secondsSaved <= 0.25);
assert.match(v7Sourced.counterplay.defensiveReply.coverTimingExplanation.description,
  /Kildebelagte spilleregenskaper/);
assert.equal(sourcedSkillEvidence(reactionUnprovedRecord).includes("pace"), false);
const v7NotSourced = v7Trial("unproven-defender", []);
assert.equal(v7NotSourced.evidence.routeCoverTiming.status, v7Plain.evidence.routeCoverTiming.status);
const v7Midpoint = (v7Plain.containmentProbability + v7Sourced.containmentProbability) / 2;
assert.equal(v7Trial("ordinary-defender", [], v7Midpoint).status, "escaped");
assert.equal(v7Trial("sourced-defender", sourcedSkillEvidence(reactionStrongRecord),
  v7Midpoint).status, "contained");
assert.equal(v7Plain.xgDeltaAgainst, v7Sourced.xgDeltaAgainst,
  "identical chance roll still yields the old single terminal outcome, not stacked xG");
const v7WithNoTimeline = timedThird(undefined, 0.99,
  v7Fixture("sourced-defender", sourcedSkillEvidence(reactionStrongRecord)));
assert.equal(v7WithNoTimeline.evidence.routeCoverTiming.status, "not_provided");
assert.equal(v7WithNoTimeline.routeCoverAdjustment, noWindow.routeCoverAdjustment,
  "player speed is not inferred without an authored movement scenario");
console.log("OK: v7 one-player counterfactual, neutral provenance, single cover gate.");

console.log("OK: two-defender handoffs gate one existing cover term.");

console.log("OK: linked defensive tasks for all routes and both flanks.");

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
// Real league profile: two sourced Glimt outlets, simulated route selection.
const glimtProfile = JSON.parse(readFileSync(new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8")).profiles.find(p => p.clubId === "bodo_glimt");
assert.deepEqual(glimtProfile.tacticalBehaviour.pressEscapeCandidateRoutes, ["third_man", "switch_play"]);
const glimtOpponent = { ...glimtProfile, id: glimtProfile.clubId, strength: 72 };
const { tacticalBehaviour: _glimtOutlets, ...unknownGlimt } = glimtOpponent;
const glimtLineup = ["GK","CB","CB","DM","CM","AM","ST","LW","RW","LB","RB"].map((position,i) => ({
  position, playerId: "glimt-test-" + i, matchScore: 75, matchFitKnown: true,
  roleId: ({DM:"balancing_six",CM:"pressing_midfielder",CB:"ball_playing_centre_back",LB:"support_fullback",RB:"support_fullback"})[position] || "role_" + position
}));
const glimtWeakWide = glimtLineup.map(p => p.position === "LB" ? { ...p, roleId:"overlapping_fullback" } : p);
const glimtWeakCenter = glimtLineup.map(p => p.position === "CM" ? { ...p, roleId:"deep_playmaker" } : p.position === "LB" ? { ...p, matchScore:70 } : p);
const glimtRun = (lineupSnapshot, changes = {}, pressure = 0.99, protection = 0.99) =>
  resolve(session("high_press_343", {
    opponent: glimtOpponent, lineupSnapshot, causalOpponentRouteAdaptationVersion: 1,
    causalOpponentSequenceVersion: 1, ...changes
  }), pressure, protection);
const glimtWide = glimtRun(glimtWeakWide);
const glimtCenter = glimtRun(glimtWeakCenter);
assert.equal(glimtWide.counterplay.pathwayId, "switch_play");
assert.equal(glimtWide.evidence.opponentRouteAdaptation.candidates.find(p => p.route === "switch_play").targetFlank, "left");
assert.equal(glimtCenter.counterplay.pathwayId, "third_man");
assert.equal(glimtWide.probability, 0.405);
assert.equal(glimtCenter.probability, glimtWide.probability);
assert.equal(glimtWide.xgDeltaAgainst, 0.06);
assert.equal(glimtCenter.xgDeltaAgainst, 0.06);
assert.equal(glimtRun(glimtLineup).evidence.opponentRouteAdaptation.status, "insufficient_or_conflicting_evidence");
assert.equal(glimtRun(glimtLineup).counterplay, null);
assert.equal(glimtRun(glimtWeakWide, {opponent:unknownGlimt}).probability, 0.555);
assert.equal(glimtRun(glimtWeakWide, {causalOpponentRouteAdaptationVersion:undefined}).counterplay, null);
assert.equal(glimtRun(glimtWeakWide, {}, 0, 0.99).xgDeltaFor, 0.11);
assert.equal(glimtRun(glimtWeakWide, {}, 0.99, 0).xgDeltaAgainst, 0.02);

// Molde 2022: switching to the far-side wingback against concentrated press.
const moldeProfile = leagueProfiles.find(p => p.clubId === "molde");
assert.equal(moldeProfile.tacticalBehaviour.pressEscapeRoute, "switch_play");
assert.equal(moldeProfile.tacticalBehaviourEvidence.era, "2022");
const moldeOpponent = { ...moldeProfile, id: moldeProfile.clubId, strength: 72 };
const { tacticalBehaviour: _moldeEscape, ...unknownMolde } = moldeOpponent;
const moldeRun = (opponent, plan = "high_press_343", pressure = 0.99, protection = 0.99) =>
  resolve(session(plan, { opponent, lineupSnapshot: glimtLineup }), pressure, protection);
const moldeEscaped = moldeRun(moldeOpponent);
assert.equal(moldeEscaped.status, "escaped");
assert.equal(moldeEscaped.counterplay.pathwayId, "switch_play");
assert.equal(moldeEscaped.counterplay.documentedTargetFlank, null);
assert.equal(moldeEscaped.probability, 0.437);
assert.equal(moldeRun(unknownMolde).probability, 0.587);
assert.equal(moldeEscaped.containmentProbability, 0.593);
assert.equal(moldeEscaped.xgDeltaAgainst, 0.06);
assert.equal(moldeRun(moldeOpponent, "high_press_343", 0.99, 0).status, "contained");
assert.equal(moldeRun(moldeOpponent, "high_press_343", 0.99, 0).xgDeltaAgainst, 0.02);
assert.equal(moldeRun(moldeOpponent, "high_press_343", 0, 0.99).xgDeltaFor, 0.11);
assert.equal(moldeRun(moldeOpponent, "midfield_press_trap").counterplay.pathwayId, "switch_play");
assert.equal(moldeRun(moldeOpponent, "counter_press_recovery"), null);

// Eggen's attacking 4-3-3 remains the league identity. The direct Milan
// outlet is contextual evidence, not an automatic league escape route.
const rbkProfile = leagueProfiles.find(p => p.clubId === "rosenborg");
assert.ok(rbkProfile.style.includes("4-3-3"));
assert.ok(rbkProfile.attackingStyle.includes("løp i bakrom"));
assert.ok(rbkProfile.attackingStyle.includes("tredjebevegelser"));
assert.equal(rbkProfile.tacticalBehaviour.pressCoordination, "collective");
assert.equal(rbkProfile.tacticalBehaviour.passingLaneCover, "central");
assert.equal(rbkProfile.tacticalBehaviour.highPressEscapeRoute, undefined);
assert.equal(rbkProfile.tacticalBehaviour.pressEscapeRoute, undefined);
const rbkOpponent = { ...rbkProfile, id: rbkProfile.clubId, strength: 72 };
const rbkRun = (opponent, plan = "high_press_343", pressure = 0.99, protection = 0.99) =>
  resolve(session(plan, { opponent, lineupSnapshot: glimtLineup }), pressure, protection);
const rbkDefault = rbkRun(rbkOpponent);
assert.equal(rbkDefault.probability, 0.603);
assert.equal(rbkDefault.counterplay, null);
// A deliberately authored Milan-like situation can still use the direct route.
const milanScenario = { ...rbkOpponent, tacticalBehaviour: { ...rbkOpponent.tacticalBehaviour, highPressEscapeRoute: "direct" } };
const rbkEscaped = rbkRun(milanScenario);
assert.equal(rbkEscaped.counterplay.pathwayId, "direct");
assert.equal(rbkEscaped.probability, 0.453);
assert.equal(rbkEscaped.containmentProbability, 0.609);
assert.equal(rbkEscaped.xgDeltaAgainst, 0.06);
assert.deepEqual(rbkRun(milanScenario, "midfield_press_trap"), rbkRun(rbkOpponent, "midfield_press_trap"));

// Sourced opponent runs: a single causal period, not an automatic press escape.
const runFixture = session("wide_fast_433", {
  causalOpponentRunVersion: 1,
  opponent: rbkOpponent, lineupSnapshot: glimtLineup,
  tacticSnapshot: {id:"wide_fast_433",defensiveLine:"high"},
  planMatchup:{edge:1.5}
});
const runSequence = (changes = {}, draw = 0.43) =>
  resolveOpponentRunSequence({...runFixture,...changes},{rng:()=>draw});
const highRun = runSequence();
const lowRun = runSequence({activePlanSnapshot:{id:"wide_fast_433",defensiveLine:"low"}});
assert.equal(highRun.status,"breakthrough");
assert.equal(lowRun.status,"contained");
assert.equal(highRun.probability,0.552);
assert.equal(lowRun.probability,0.312);
assert.equal(highRun.xgDeltaAgainst,0.06);
assert.equal(lowRun.xgDeltaAgainst,-0.03);
assert.equal(highRun.evidence.eventCount,1);
assert.equal(highRun.evidence.randomDraws,1);
assert.equal(highRun.steps.length,4);
assert.equal(new Set(highRun.evidence.supportingPlayers.map(p=>p.playerId)).size,5);
assert.equal(runSequence({causalOpponentRunVersion:undefined}),null);
assert.equal(runSequence({opponent:{...rbkOpponent,tacticalBehaviour:{}}}),null);
assert.equal(runSequence({tacticSnapshot:{id:"wide_fast_433"}}),null);
assert.equal(runSequence({lineupSnapshot:glimtLineup.map(p=>p.position==="LB"?{...p,matchFitKnown:false}:p)}),null);
assert.ok(runSequence({lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)}).probability>highRun.probability);
assert.equal(annotateOpponentRunChances([],highRun).length,0);
const runChances=[{side:"against"},{side:"against"},{side:"for"}];
assert.equal(annotateOpponentRunChances(runChances,highRun).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentRunChances(runChances,lowRun),runChances);
let runSeed;
for(let i=0;i<3000;i++){
  const s={...runFixture,id:"eggen-runs-"+i};
  const draw=highPressPhaseRoll(s,"0:opponent-runs");
  if(draw>=lowRun.probability&&draw<highRun.probability){runSeed=s;break;}
}
assert.ok(runSeed,"same deterministic roll separates high and low line");
const runRandom=Math.random;
try{
  Math.random=()=>0.99;
  for(const [s,status] of [[runSeed,"breakthrough"],[{...runSeed,activePlanSnapshot:{id:"wide_fast_433",defensiveLine:"low"}},"contained"]]){
    const played=advanceMatchClock(s),period=played.timeline[0];
    assert.equal(period.tacticalPhase.situation,"opponent_coordinated_runs");
    assert.equal(period.tacticalPhase.status,status);
    assert.equal(period.tacticalXg,undefined,"no duplicate plan-edge contribution");
    for(const side of ["for","against"]){
      assert.equal(Math.round((period.expectedGoals[side]-period.baselineExpectedGoals[side])*100)/100,
        period.tacticalPhase[side==="for"?"xgDeltaFor":"xgDeltaAgainst"]);
    }
    assert.equal(played.minuteLog.length,period.chances);
    assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
    assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(s))).timeline[0].tacticalPhase,period.tacticalPhase);
  }
  assert.equal(advanceMatchClock({...runSeed,causalOpponentRunVersion:undefined}).timeline[0].tacticalPhase,undefined);
  const specialised=advanceMatchClock({...runSeed,selectedTacticId:"high_press_343",tacticSnapshot:{id:"high_press_343",defensiveLine:"high"}});
  assert.equal(specialised.timeline[0].tacticalPhase.situation,"our_press_vs_opponent_build_up","specialist phase retains priority");
}finally{Math.random=runRandom;}

// Late-match fatigue: use the same tiredness curve as substitutions.
const fatigueLineup = glimtLineup.map(p => ({...p,startFreshness:100,onFrom:0}));
const fatigueFixture = {...runFixture,causalOpponentRunFatigueVersion:1,lineupSnapshot:fatigueLineup,timeline:[]};
const fatigueRun = (minute,changes={}) => resolveOpponentRunSequence({...fatigueFixture,...changes},{minute,rng:()=>0.6});
const runPeriod = (status,to) => ({range:{to},tacticalPhase:{situation:"opponent_coordinated_runs",status,evidence:{opponentPattern:"coordinated_433_breakthrough"}}});
assert.equal(fatigueRun(0).probability,0.552);
assert.equal(fatigueRun(68).probability,0.597);
const tiredRun = fatigueRun(68,{lineupSnapshot:fatigueLineup.map(p=>({...p,startFreshness:40}))});
assert.equal(tiredRun.probability,0.669);
assert.equal(tiredRun.status,"breakthrough");
const repeatRun = fatigueRun(68,{timeline:[runPeriod("breakthrough",23),runPeriod("contained",45)]});
assert.equal(repeatRun.probability,0.567);
assert.equal(repeatRun.status,"contained");
assert.equal(repeatRun.evidence.fatigue.opponentRunLoad,0.03);
const freshSubs = fatigueRun(68,{lineupSnapshot:fatigueLineup.map(p=>p.position==="CB"?{...p,playerId:p.playerId+"-sub",onFrom:65}:p)});
assert.equal(freshSubs.probability,0.579);
assert.equal(fatigueRun(68,{lineupSnapshot:fatigueLineup.map(p=>({...p,startFreshness:undefined}))}).probability,0.552);
assert.equal(fatigueRun(68,{causalOpponentRunFatigueVersion:undefined}).probability,0.552);
assert.equal(fatigueRun(68,{timeline:[runPeriod("breakthrough",90)]}).probability,0.597);
assert.equal(fatigueRun(90,{timeline:Array.from({length:8},(_,i)=>runPeriod("breakthrough",10+i*10))}).evidence.fatigue.opponentRunLoad,0.06);
assert.equal(tiredRun.xgDeltaAgainst,0.06);
assert.equal(repeatRun.xgDeltaAgainst,-0.03);
assert.equal(tiredRun.evidence.randomDraws,1);
// Real clock integration: the first played period starts at zero; the
// subsequent period uses its real start and only completed timeline entries.
let fatigueClock={...fatigueFixture,id:"eggen-fatigue-clock",events:[{},{},{}]};
const savedRandom=Math.random;
try{
  Math.random=()=>0.99;
  for(let i=0;i<4;i++){
    fatigueClock=advanceMatchClock(fatigueClock);
    const period=fatigueClock.timeline[i];
    assert.equal(period.tacticalPhase.situation,"opponent_coordinated_runs");
    assert.equal(period.tacticalPhase.evidence.fatigue.minute,period.range.from-1);
    assert.equal(period.tacticalPhase.evidence.eventCount,1);
    assert.equal(period.tacticalXg,undefined);
    assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,
      period.tacticalPhase.xgDeltaAgainst);
  }
}finally{Math.random=savedRandom;}

// Brann's ball-near counterpress is a continuation of the SAME recovery.
const brannProfile = leagueProfiles.find(p=>p.clubId==="brann");
const brannOpponent = {...brannProfile,id:brannProfile.clubId,strength:72};
const brannSession = session("counter_press_recovery",{
  opponent:brannOpponent,causalRegainCounterpressVersion:1
});
const brannRetained=resolve(brannSession,0.3,0.99);
const brannLost=resolve(brannSession,0.6,0.99);
assert.equal(brannRetained.status,"regain");
assert.equal(brannRetained.probability,0.659);
assert.equal(brannRetained.evidence.regainCounterpress.conditionalReleaseProbability,0.693);
assert.equal(brannRetained.evidence.regainCounterpress.retainedRegainProbability,0.457);
assert.equal(brannRetained.xgDeltaFor,0.08);
assert.equal(brannLost.status,"regain_lost");
assert.equal(brannLost.side,null);
assert.equal(brannLost.xgDeltaFor,0);
assert.equal(brannLost.xgDeltaAgainst,0);
assert.equal(brannLost.evidence.regainCounterpress.extraRandomDraws,0);
assert.equal(brannLost.evidence.regainCounterpress.eventCount,1);
assert.equal(resolve(brannSession,0.99,0.99).status,"escaped");
assert.equal(resolve({...brannSession,causalRegainCounterpressVersion:undefined},0.6,0.99).status,"regain");
assert.equal(resolve({...brannSession,opponent:{...brannOpponent,tacticalBehaviour:{}}},0.6,0.99).status,"regain");
assert.equal(resolve({...brannSession,teamFitSnapshot:{tacticalProfile:{...brannSession.teamFitSnapshot.tacticalProfile,buildUpScore:undefined}}},0.6,0.99).status,"regain");
const brannChances=[{side:"for",quality:0.08},{side:"against",quality:0.07}];
assert.equal(annotateOwnPressChances(brannChances,brannLost),brannChances);
assert.equal(annotateOwnPressChances([],brannRetained).length,0);
let brannSeed;
for(let i=0;i<3000;i++){
  const candidate={...brannSession,id:"brann-regain-counterpress-"+i};
  if(resolve(candidate,highPressPhaseRoll(candidate,"0:own-pressure"),0.99)?.status==="regain_lost"){brannSeed=candidate;break;}
}
assert.ok(brannSeed);
const brannRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(brannSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.status,"regain_lost");
  assert.equal(period.tacticalPhase.xgDeltaFor,0);
  assert.equal(period.tacticalPhase.xgDeltaAgainst,0);
  assert.equal(period.tacticalXg,undefined);
  assert.equal(played.minuteLog.length,period.chances);
  assert.equal(played.minuteLog.filter(c=>c.tacticalMoment).length,0);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(brannSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=brannRandom;}

// Collective workload: count only completed press actions.
const workloadFixture={...brannSession,causalOpponentPressWorkloadVersion:1};
const workloadPeriod=(segment,tacticalPhase)=>({segment,range:{to:(segment+1)*15},expectedGoals:{for:0.2,against:0.2},tacticalPhase});
const workloadFirst=resolve(workloadFixture,0.47,0.99);
const workloadBuild=s=>resolveHighPressBuildUp({...s,selectedTacticId:"patient_build_up",tacticSnapshot:{id:"patient_build_up"}},{rng:()=>0.35});
const workloadHigh=workloadBuild(workloadFixture);
const workloadHistory=[workloadPeriod(0,workloadFirst),workloadPeriod(1,workloadHigh),workloadPeriod(2,workloadFirst)];
const workloadLater=resolve({...workloadFixture,timeline:workloadHistory},0.47,0.99);
const workloadLaterHigh=workloadBuild({...workloadFixture,timeline:workloadHistory});
assert.equal(workloadFirst.status,"regain_lost");
assert.equal(workloadLater.status,"regain");
assert.equal(workloadLater.xgDeltaFor,0.08);
assert.equal(workloadLater.evidence.regainCounterpress.conditionalReleaseProbability,0.753);
assert.equal(workloadLater.evidence.regainCounterpress.retainedRegainProbability,0.496);
assert.equal(workloadLater.evidence.regainCounterpress.opponentPressWorkload.adjustment,0.06);
assert.equal(workloadHigh.status,"turnover");
assert.equal(workloadLaterHigh.status,"breakthrough");
assert.ok(Math.abs(workloadLaterHigh.probability-workloadHigh.probability-0.06)<=0.0011);
assert.equal(resolve({...workloadFixture,timeline:workloadHistory,causalOpponentPressWorkloadVersion:undefined},0.47,0.99).status,"regain_lost");
assert.equal(opponentPressWorkload({...workloadFixture,timeline:[workloadPeriod(0,workloadFirst),workloadPeriod(0,workloadFirst)]}).adjustment,0.02);
assert.equal(opponentPressWorkload({...workloadFixture,timeline:[workloadPeriod(0,{situation:"game_control_and_release",status:"controlled"})]}).adjustment,0);
assert.equal(opponentPressWorkload({...workloadFixture,timeline:Array.from({length:6},(_,i)=>workloadPeriod(i,workloadFirst))}).adjustment,0.08);
assert.equal(opponentPressWorkload({...workloadFixture,opponent:{...brannOpponent,tacticalBehaviour:{}}}),null);
let workloadClock={...workloadFixture,id:"brann-workload-clock",events:[{},{},{}]};
const workloadRandom=Math.random;
try{
  Math.random=()=>0.99;
  for(let i=0;i<4;i++){
    const prior=opponentPressWorkload(workloadClock);
    workloadClock=advanceMatchClock(workloadClock);
    const period=workloadClock.timeline[i];
    const continuation=period.tacticalPhase?.evidence?.regainCounterpress;
    if(continuation) assert.deepEqual(continuation.opponentPressWorkload,prior);
    assert.equal(period.tacticalXg,undefined);
    assert.equal(Math.round((period.expectedGoals.for-period.baselineExpectedGoals.for)*100)/100,period.tacticalPhase.xgDeltaFor);
  }
}finally{Math.random=workloadRandom;}

// Godset's switch-to-cross attack: distinct wide and box gates, one roll.
const godsetOpponent = {...leagueProfiles.find(p=>p.clubId==="stromsgodset"),id:"stromsgodset",strength:72};
const godsetFixture = session("wide_fast_433",{
  causalOpponentSwitchCrossVersion:1,opponent:godsetOpponent,
  lineupSnapshot:glimtLineup,tacticSnapshot:{id:"wide_fast_433",defensiveLine:"medium"}
});
const godsetCross = (draw,changes={})=>resolveOpponentSwitchCrossSequence({...godsetFixture,...changes},{rng:()=>draw});
const godsetChance=godsetCross(0.1),godsetBox=godsetCross(0.3),godsetWide=godsetCross(0.6);
assert.equal(godsetChance.status,"breakthrough");
assert.equal(godsetBox.status,"box_contained");
assert.equal(godsetWide.status,"wide_contained");
assert.equal(godsetChance.probability,0.195);
assert.equal(godsetChance.evidence.crossProbability,0.456);
assert.equal(godsetChance.evidence.conditionalBoxProbability,0.428);
assert.equal(godsetChance.xgDeltaAgainst,0.07);
assert.equal(godsetBox.xgDeltaAgainst,-0.02);
assert.equal(godsetWide.xgDeltaAgainst,-0.03);
assert.equal(godsetChance.evidence.eventCount,1);
assert.equal(godsetChance.evidence.randomDraws,1);
assert.equal(godsetChance.evidence.targetFlank,null);
const godsetWeakWide=godsetCross(0.1,{lineupSnapshot:glimtLineup.map(p=>["LB","RB"].includes(p.position)?{...p,matchScore:55}:p)});
const godsetWeakBox=godsetCross(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)});
assert.equal(godsetWeakWide.evidence.crossProbability,0.536);
assert.equal(godsetWeakWide.evidence.conditionalBoxProbability,0.428);
assert.equal(godsetWeakBox.evidence.crossProbability,0.456);
assert.equal(godsetWeakBox.evidence.conditionalBoxProbability,0.508);
assert.equal(godsetCross(0.1,{causalOpponentSwitchCrossVersion:undefined}),null);
assert.equal(godsetCross(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="LB")}),null);
assert.equal(godsetCross(0.1,{opponent:{...godsetOpponent,tacticalBehaviour:{}}}),null);
assert.equal(godsetCross(NaN),null);
assert.equal(annotateOpponentRunChances([{side:"against"},{side:"against"}],godsetChance).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentRunChances([{side:"against"}],godsetBox)[0].tacticalMoment,undefined);
assert.equal(annotateOpponentRunChances([],godsetChance).length,0);
let godsetSeed;
for(let i=0;i<3000;i++){
  const s={...godsetFixture,id:"godset-cross-"+i};
  if(godsetCross(highPressPhaseRoll(s,"0:opponent-switch-cross")).status==="breakthrough"){godsetSeed=s;break;}
}
assert.ok(godsetSeed);
const godsetRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(godsetSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_switch_cross");
  assert.equal(period.tacticalPhase.status,"breakthrough");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(godsetSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.equal(advanceMatchClock({...godsetSeed,causalOpponentSwitchCrossVersion:undefined}).timeline[0].tacticalPhase,undefined);
}finally{Math.random=godsetRandom;}

// A contained cross can release a counter only with actual supporting roles.
const crossRecoveryLineup=glimtLineup.map(p=>p.position==="ST"?{...p,roleId:"channel_runner"}:p);
const crossRecoveryFixture={...godsetFixture,causalOpponentCrossRecoveryVersion:1,
  lineupSnapshot:crossRecoveryLineup,tacticSnapshot:{id:"wide_fast_433",defensiveLine:"medium",tempo:"fast"}};
const crossRelease=(draw,changes={})=>resolveOpponentSwitchCrossSequence({...crossRecoveryFixture,...changes},{rng:()=>draw});
const crossReleased=crossRelease(0.3),crossHeld=crossRelease(0.4);
assert.equal(crossReleased.status,"counterattack");
assert.equal(crossReleased.side,"for");
assert.equal(crossReleased.probability,0.195);
assert.equal(crossReleased.xgDeltaFor,0.06);
assert.equal(crossReleased.xgDeltaAgainst,-0.02);
assert.equal(crossReleased.evidence.crossRecovery.conditionalReleaseProbability,0.53);
assert.equal(crossReleased.evidence.crossRecovery.unconditionalCounterProbability,0.138);
assert.equal(crossReleased.evidence.crossRecovery.extraRandomDraws,0);
assert.equal(crossReleased.evidence.eventCount,1);
assert.equal(crossReleased.evidence.randomDraws,1);
assert.equal(crossRelease(0.1).status,"breakthrough");
assert.equal(crossRelease(0.1).evidence.crossRecovery,undefined);
assert.equal(crossRelease(0.6).status,"wide_contained");
assert.equal(crossRelease(0.6).evidence.crossRecovery,undefined);
assert.equal(crossHeld.status,"box_contained");
assert.equal(crossHeld.xgDeltaFor,0);
assert.equal(crossRelease(0.3,{causalOpponentCrossRecoveryVersion:undefined}).status,"box_contained");
assert.equal(crossRelease(0.3,{tacticSnapshot:{...crossRecoveryFixture.tacticSnapshot,tempo:"controlled"}}).status,"box_contained");
assert.equal(crossRelease(0.3,{opponent:{...godsetOpponent,tacticalBehaviour:{...godsetOpponent.tacticalBehaviour,crossRecoveryExposure:undefined}}}).status,"box_contained");
assert.equal(crossRelease(0.3,{lineupSnapshot:crossRecoveryLineup.map(p=>p.position==="ST"?{...p,roleId:"box_striker"}:p)}).status,"box_contained");
assert.equal(crossRelease(0.3,{lineupSnapshot:crossRecoveryLineup.map(p=>p.position==="ST"?{...p,matchScore:55}:p)}).evidence.crossRecovery.conditionalReleaseProbability,0.49);
const crossAnnotated=annotateOpponentRunChances([{side:"against"},{side:"for"},{side:"for"}],crossReleased);
assert.equal(crossAnnotated.filter(c=>c.tacticalMoment).length,1);
assert.equal(crossAnnotated[1].tacticalMoment.kind,"cross_recovery_counterattack");
assert.equal(crossAnnotated[1].tacticalMoment.xgDelta,0.06);
assert.equal(annotateOpponentRunChances([],crossReleased).length,0);
let crossRecoverySeed;
for(let i=0;i<3000;i++){
  const s={...crossRecoveryFixture,id:"godset-cross-recovery-"+i};
  if(crossRelease(highPressPhaseRoll(s,"0:opponent-switch-cross")).status==="counterattack"){crossRecoverySeed=s;break;}
}
assert.ok(crossRecoverySeed);
const crossRecoveryRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(crossRecoverySeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.status,"counterattack");
  assert.equal(period.tacticalPhase.situation,"opponent_switch_cross");
  assert.equal(period.tacticalXg,undefined);
  for(const side of ["for","against"]){
    assert.equal(Math.round((period.expectedGoals[side]-period.baselineExpectedGoals[side])*100)/100,period.tacticalPhase[side==="for"?"xgDeltaFor":"xgDeltaAgainst"]);
  }
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(crossRecoverySeed))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.equal(advanceMatchClock({...crossRecoverySeed,causalOpponentCrossRecoveryVersion:undefined}).timeline[0].tacticalPhase.status,"box_contained");
}finally{Math.random=crossRecoveryRandom;}

// Bengtsson's zonal pressure, cover and shifting: one linked possession.
const vifOpponent={...leagueProfiles.find(p=>p.clubId==="valerenga"),id:"valerenga",strength:72};
const vifFixture=session("wide_fast_433",{causalOpponentZonalShiftVersion:1,opponent:vifOpponent,lineupSnapshot:glimtLineup,tacticSnapshot:{id:"wide_fast_433"}});
const vifRun=(draw,changes={})=>resolveOpponentZonalShift({...vifFixture,...changes},{rng:()=>draw});
const vifSuccess=vifRun(0.2),vifShift=vifRun(0.5),vifPressure=vifRun(0.8);
assert.equal(vifSuccess.status,"advantage");
assert.equal(vifSuccess.probability,0.366);
assert.equal(vifSuccess.evidence.circulationProbability,0.654);
assert.equal(vifSuccess.evidence.conditionalPenetrationProbability,0.56);
assert.equal(vifShift.evidence.stop,"shift_cover");
assert.equal(vifPressure.evidence.stop,"ball_pressure");
assert.equal(vifSuccess.xgDeltaFor,0.06);
assert.equal(vifShift.xgDeltaFor,-0.03);
assert.equal(vifPressure.xgDeltaFor,-0.03);
assert.ok([vifSuccess,vifShift,vifPressure].every(p=>p.xgDeltaAgainst===0));
assert.equal(vifShift.side,null);
assert.equal(vifPressure.side,null);
assert.equal(vifSuccess.evidence.eventCount,1);
assert.equal(vifSuccess.evidence.randomDraws,1);
assert.equal(vifSuccess.evidence.targetFlank,null);
const vifWeak=vifRun(0.2,{lineupSnapshot:glimtLineup.map(p=>["LW","RW","LB","RB"].includes(p.position)?{...p,matchScore:55}:p)});
assert.equal(vifWeak.probability,0.297);
const vifShallow=vifRun(0.2,{teamFitSnapshot:{tacticalProfile:{...vifFixture.teamFitSnapshot.tacticalProfile,depthScore:51}}});
assert.equal(vifShallow.evidence.circulationProbability,0.654);
assert.equal(vifShallow.evidence.conditionalPenetrationProbability,0.48);
assert.equal(vifRun(0.2,{causalOpponentZonalShiftVersion:undefined}),null);
assert.equal(vifRun(0.2,{opponent:{...vifOpponent,tacticalBehaviour:{pressCoordination:"collective"}}}),null);
assert.equal(vifRun(0.2,{lineupSnapshot:glimtLineup.filter(p=>!["LB","LW"].includes(p.position))}),null);
assert.equal(vifRun(0.2,{tacticSnapshot:{id:"high_press_343"}}),null);
assert.equal(vifRun(NaN),null);
const vifChances=[{side:"against"},{side:"for"},{side:"for"}];
const vifAnnotated=annotateOpponentZonalShiftChances(vifChances,vifSuccess);
assert.equal(vifAnnotated.filter(c=>c.tacticalMoment).length,1);
assert.equal(vifAnnotated[1].tacticalMoment.kind,"zonal_shift_beaten");
assert.equal(annotateOpponentZonalShiftChances(vifChances,vifShift),vifChances);
assert.equal(annotateOpponentZonalShiftChances([],vifSuccess).length,0);
let vifSeed;
for(let i=0;i<3000;i++){
  const s={...vifFixture,id:"vif-zonal-shift-"+i};
  if(vifRun(highPressPhaseRoll(s,"0:opponent-zonal-shift")).status==="advantage"){vifSeed=s;break;}
}
assert.ok(vifSeed);
const vifRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(vifSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_zonal_shift");
  assert.equal(period.tacticalPhase.status,"advantage");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.for-period.baselineExpectedGoals.for)*100)/100,period.tacticalPhase.xgDeltaFor);
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(vifSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.equal(advanceMatchClock({...vifSeed,causalOpponentZonalShiftVersion:undefined}).timeline[0].tacticalPhase,undefined);
}finally{Math.random=vifRandom;}

// Bengtsson's longer-pass principle: reception and support are linked.
const vifOutletFixture=session("midfield_press_trap",{causalOpponentRehearsedOutletVersion:1,
  opponent:vifOpponent,lineupSnapshot:glimtLineup,tacticSnapshot:{id:"midfield_press_trap",defensiveLine:"medium"}});
const vifOutlet=(draw,changes={})=>resolveOpponentRehearsedOutlet({...vifOutletFixture,...changes},{rng:()=>draw});
const outletSuccess=vifOutlet(0.1),outletSupport=vifOutlet(0.3),outletReception=vifOutlet(0.6);
assert.equal(outletSuccess.status,"breakthrough");
assert.equal(outletSupport.status,"support_contained");
assert.equal(outletReception.status,"reception_contained");
assert.equal(outletSuccess.probability,0.206);
assert.equal(outletSuccess.evidence.receptionProbability,0.472);
assert.equal(outletSuccess.evidence.conditionalContinuationProbability,0.436);
assert.equal(outletSuccess.xgDeltaAgainst,0.06);
assert.equal(outletSupport.xgDeltaAgainst,-0.03);
assert.equal(outletReception.xgDeltaAgainst,-0.03);
assert.equal(outletSuccess.evidence.targetFlank,null);
assert.equal(outletSuccess.evidence.randomDraws,1);
assert.equal(vifOutlet(0.1,{tacticSnapshot:{id:"high_press_343",defensiveLine:"high"}}).probability,0.232);
assert.equal(vifOutlet(0.1,{tacticSnapshot:{id:"low_block_transition_541",defensiveLine:"low"}}).probability,0.18);
const outletWeakCB=vifOutlet(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)});
const outletWeakSupport=vifOutlet(0.1,{lineupSnapshot:glimtLineup.map(p=>["DM","CM","LB","RB"].includes(p.position)?{...p,matchScore:55}:p)});
assert.equal(outletWeakCB.evidence.receptionProbability,0.572);
assert.equal(outletWeakCB.evidence.conditionalContinuationProbability,0.436);
assert.equal(outletWeakSupport.evidence.receptionProbability,0.472);
assert.equal(outletWeakSupport.evidence.conditionalContinuationProbability,0.516);
assert.equal(vifOutlet(0.1,{causalOpponentRehearsedOutletVersion:undefined}),null);
assert.equal(vifOutlet(0.1,{opponent:{...vifOpponent,tacticalBehaviour:{}}}),null);
assert.equal(vifOutlet(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="LB")}),null);
assert.equal(vifOutlet(0.1,{tacticSnapshot:{id:"midfield_press_trap"}}),null);
assert.equal(vifOutlet(NaN),null);
const outletChances=[{side:"for"},{side:"against"},{side:"against"}];
const outletAnnotated=annotateOpponentRehearsedOutletChances(outletChances,outletSuccess);
assert.equal(outletAnnotated.filter(c=>c.tacticalMoment).length,1);
assert.equal(outletAnnotated[1].tacticalMoment.kind,"opponent_rehearsed_outlet");
assert.equal(annotateOpponentRehearsedOutletChances(outletChances,outletSupport),outletChances);
assert.equal(annotateOpponentRehearsedOutletChances([],outletSuccess).length,0);
let outletSeed;
for(let i=0;i<3000;i++){
  const s={...vifOutletFixture,id:"vif-outlet-"+i};
  if(vifOutlet(highPressPhaseRoll(s,"0:opponent-rehearsed-outlet")).status==="breakthrough"){outletSeed=s;break;}
}
assert.ok(outletSeed);
const outletRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(outletSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_rehearsed_outlet");
  assert.equal(period.tacticalPhase.status,"breakthrough");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(outletSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.equal(advanceMatchClock({...outletSeed,causalOpponentRehearsedOutletVersion:undefined}).timeline[0].tacticalPhase,undefined);
  const zonal=advanceMatchClock({...outletSeed,causalOpponentZonalShiftVersion:1,selectedTacticId:"wide_fast_433",tacticSnapshot:{id:"wide_fast_433",defensiveLine:"medium"}});
  assert.equal(zonal.timeline[0].tacticalPhase.situation,"opponent_zonal_shift");
}finally{Math.random=outletRandom;}

// LSK: a clearance is not the same as control of the loose ball.
const lskProfile=leagueProfiles.find(p=>p.clubId==="lillestrom");
assert.equal(lskProfile.tacticalBehaviour.attackingRunPattern,"direct_duel_second_ball");
assert.equal(lskProfile.tacticalBehaviour.pressEscapeRoute,undefined);
const lskFixture=session("midfield_press_trap",{causalOpponentDirectSecondBallVersion:1,
  opponent:{...lskProfile,id:"lillestrom",strength:72},lineupSnapshot:glimtLineup,
  tacticSnapshot:{id:"midfield_press_trap",defensiveLine:"medium"}});
const lskRun=(draw,changes={})=>resolveOpponentDirectSecondBall({...lskFixture,...changes},{rng:()=>draw});
const lskBoth=lskRun(0.1),lskFirst=lskRun(0.3),lskSecond=lskRun(0.55),lskNeither=lskRun(0.8);
assert.deepEqual([lskBoth,lskFirst,lskSecond,lskNeither].map(p=>p.status),
  ["duel_and_second_ball","second_ball_contained","second_ball_recovered","both_contained"]);
assert.deepEqual([lskBoth,lskFirst,lskSecond,lskNeither].map(p=>p.xgDeltaAgainst),[0.07,-0.03,0.04,-0.03]);
assert.equal(lskBoth.evidence.firstDuelProbability,0.472);
assert.equal(lskBoth.evidence.secondBallAfterWonDuelProbability,0.556);
assert.equal(lskBoth.evidence.secondBallAfterLostDuelProbability,0.316);
assert.equal(lskBoth.probability,0.429);
assert.equal(lskSecond.evidence.firstDuelWonByOpponent,false);
assert.equal(lskSecond.evidence.secondBallWonByOpponent,true);
const lskWeakBacks=lskRun(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)});
const lskWeakScreen=lskRun(0.1,{lineupSnapshot:glimtLineup.map(p=>["DM","CM"].includes(p.position)?{...p,matchScore:55}:p)});
assert.ok(lskWeakBacks.evidence.firstDuelProbability>lskBoth.evidence.firstDuelProbability);
assert.equal(lskWeakBacks.evidence.secondBallAfterLostDuelProbability,lskBoth.evidence.secondBallAfterLostDuelProbability);
assert.equal(lskWeakScreen.evidence.firstDuelProbability,lskBoth.evidence.firstDuelProbability);
assert.ok(lskWeakScreen.evidence.secondBallAfterLostDuelProbability>lskBoth.evidence.secondBallAfterLostDuelProbability);
assert.equal(lskRun(0.1,{causalOpponentDirectSecondBallVersion:undefined}),null);
assert.equal(lskRun(0.1,{opponent:{...lskFixture.opponent,tacticalBehaviour:{}}}),null);
assert.equal(lskRun(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="DM"&&p.position!=="CM")}),null);
assert.equal(lskRun(NaN),null);
let lskDraws=0;
resolveOpponentDirectSecondBall(lskFixture,{rng:()=>{lskDraws++;return 0.55;}});
assert.equal(lskDraws,1);
const lskChances=[{side:"for"},{side:"against"},{side:"against"}];
assert.equal(annotateOpponentDirectSecondBallChances(lskChances,lskSecond).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentDirectSecondBallChances(lskChances,lskSecond)[1].tacticalMoment.kind,"opponent_direct_second_ball");
assert.equal(annotateOpponentDirectSecondBallChances(lskChances,lskFirst),lskChances);
assert.deepEqual(annotateOpponentDirectSecondBallChances([],lskBoth),[]);
let lskSeed;
for(let i=0;i<3000;i++){
  const s={...lskFixture,id:"lsk-direct-"+i};
  if(lskRun(highPressPhaseRoll(s,"0:opponent-direct-second-ball")).status==="second_ball_recovered"){lskSeed=s;break;}
}
assert.ok(lskSeed);
const lskRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(lskSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_direct_second_ball");
  assert.equal(period.tacticalPhase.status,"second_ball_recovered");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(lskSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.equal(advanceMatchClock({...lskSeed,causalOpponentDirectSecondBallVersion:undefined}).timeline[0].tacticalPhase,undefined);
}finally{Math.random=lskRandom;}

// Only the existing scheduled dead-ball situation replaces the open-play phase.
const lskDeadFixture={...lskFixture,causalOpponentSetPieceVersion:1,events:[{id:"opp_set_piece_threat"}]};
const lskDead=(draw,changes={})=>resolveOpponentSetPiece({...lskDeadFixture,...changes},{rng:()=>draw});
const lskDeadFirst=lskDead(0.1),lskDeadSecond=lskDead(0.6),lskDeadStop=lskDead(0.95);
assert.deepEqual([lskDeadFirst,lskDeadSecond,lskDeadStop].map(p=>p.status),
  ["first_contact_threat","second_ball_threat","contained"]);
assert.deepEqual([lskDeadFirst,lskDeadSecond,lskDeadStop].map(p=>p.xgDeltaAgainst),[0.08,0.04,-0.03]);
const lskAwayDead=lskDead(0.1,{events:[{id:"opp_set_piece_second_ball"}]});
assert.equal(lskAwayDead.status,"second_ball_threat");
assert.equal(lskAwayDead.evidence.firstContactProbability,null);
assert.equal(lskAwayDead.evidence.afterClearance,true);
assert.equal(lskDead(0.1,{events:[]}),null);
assert.equal(lskDead(0.1,{timeline:[{}]}),null);
assert.equal(lskDead(0.1,{causalOpponentSetPieceVersion:undefined}),null);
assert.equal(lskDead(0.1,{opponent:{...lskFixture.opponent,tacticalBehaviour:{}}}),null);
assert.equal(lskDead(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="GK")}),null);
assert.equal(lskDead(NaN),null);
const weakDeadBacks=lskDead(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)});
const weakDeadScreen=lskDead(0.1,{lineupSnapshot:glimtLineup.map(p=>["DM","CM"].includes(p.position)?{...p,matchScore:55}:p)});
assert.ok(weakDeadBacks.evidence.firstContactProbability>lskDeadFirst.evidence.firstContactProbability);
assert.equal(weakDeadBacks.evidence.conditionalRecoveryProbability,lskDeadFirst.evidence.conditionalRecoveryProbability);
assert.equal(weakDeadScreen.evidence.firstContactProbability,lskDeadFirst.evidence.firstContactProbability);
assert.ok(weakDeadScreen.evidence.conditionalRecoveryProbability>lskDeadFirst.evidence.conditionalRecoveryProbability);
assert.equal(annotateOpponentSetPieceChances(lskChances,lskDeadFirst).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentSetPieceChances(lskChances,lskDeadStop),lskChances);
const deadRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(lskDeadFixture),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_set_piece");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(lskDeadFixture))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.notEqual(advanceMatchClock(played).timeline[1].tacticalPhase?.situation,"opponent_set_piece");
  assert.equal(advanceMatchClock({...lskDeadFixture,causalOpponentSetPieceVersion:undefined}).timeline[0].tacticalPhase.situation,"opponent_direct_second_ball");
}finally{Math.random=deadRandom;}

// Directly sourced dribbling + vision in a suitable current role unlock a
// conditional creative route, not an automatic goal or universal club buff.
const creativeXI=glimtLineup.map(p=>p.position==="AM"?{...p,roleId:"free_creator",name:"Kreatør",sourcedCreativeSkills:["dribbling","vision"]}:p);
const creativeFixture=session("central_possession_4231",{causalSourcedCreativeBreakthroughVersion:1,
  lineupSnapshot:creativeXI,tacticSnapshot:{id:"central_possession_4231"},
  opponent:{...lskFixture.opponent,styleTraits:{defensiveCompactness:78,highLine:45}}});
const creativeBlock={compactness:78,line:45};
const creativeRun=(draw,changes={})=>resolveSourcedCreativeBreakthrough({...creativeFixture,...changes},creativeBlock,{rng:()=>draw});
const creativeGood=creativeRun(0.1),creativeStop=creativeRun(0.4),creativeBlocked=creativeRun(0.8);
assert.deepEqual([creativeGood.status,creativeStop.status,creativeBlocked.status],["breakthrough","release_contained","dribble_contained"]);
assert.equal(creativeGood.xgDeltaFor,0.09);
assert.equal(creativeStop.xgDeltaFor,0);
assert.equal(creativeGood.evidence.creatorId,creativeXI.find(p=>p.position==="AM").playerId);
assert.notEqual(creativeGood.evidence.receiverId,creativeGood.evidence.creatorId);
assert.equal(creativeGood.evidence.randomDraws,1);
assert.equal(creativeRun(0.1,{causalSourcedCreativeBreakthroughVersion:undefined}),null);
assert.equal(creativeRun(0.1,{lineupSnapshot:creativeXI.map(p=>({...p,sourcedCreativeSkills:[]}))}),null);
assert.equal(creativeRun(0.1,{lineupSnapshot:creativeXI.map(p=>p.position==="AM"?{...p,sourcedCreativeSkills:["vision"]}:p)}),null);
assert.equal(creativeRun(0.1,{lineupSnapshot:creativeXI.map(p=>p.position==="AM"?{...p,roleId:"pressing_midfielder"}:p)}),null);
assert.equal(creativeRun(NaN),null);
assert.deepEqual(sourcedCreativeSkillsForPlayer({strengths:["vision","dribbling"],attributes:{provenance:{vision:"belagt",dribbling:"utledet"}}}),["vision"]);
assert.equal(resolveCompactBlockAttack(creativeFixture,{rng:()=>0.1}).route,"sourced_creative_breakthrough");
assert.equal(resolveCompactBlockAttack({...creativeFixture,causalSourcedCreativeBreakthroughVersion:undefined},{rng:()=>0.1}).route,"wall_pass");
const creativeMoment=annotateCompactBlockChances([{side:"for"},{side:"for"}],creativeGood);
assert.equal(creativeMoment.filter(c=>c.tacticalMoment).length,1);
assert.equal(creativeMoment[0].tacticalMoment.creatorId,creativeGood.evidence.creatorId);
let creativeSeed;
for(let i=0;i<3000;i++){
  const s={...creativeFixture,id:"creator-"+i};
  if(creativeRun(highPressPhaseRoll(s,"0:compact-block")).status==="breakthrough"){creativeSeed=s;break;}
}
assert.ok(creativeSeed);
const creativeRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(creativeSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.route,"sourced_creative_breakthrough");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.for-period.baselineExpectedGoals.for)*100)/100,period.tacticalPhase.xgDeltaFor);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(creativeSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=creativeRandom;}


// Anonymous historical-style opponent creativity shares the direct-play draw.
const lskCreativeFixture={...lskFixture,causalOpponentCreativeAlternativeVersion:1};
const lskCreative=(roll,changes={})=>resolveOpponentDirectSecondBall({...lskCreativeFixture,...changes},{rng:()=>roll});
const lskCreativeSuccess=lskCreative(0.01),lskCreativeRelease=lskCreative(0.1),lskCreativeStop=lskCreative(0.2);
assert.deepEqual([lskCreativeSuccess.status,lskCreativeRelease.status,lskCreativeStop.status],
  ["creative_breakthrough","release_contained","dribble_contained"]);
assert.deepEqual([lskCreativeSuccess.xgDeltaAgainst,lskCreativeRelease.xgDeltaAgainst,lskCreativeStop.xgDeltaAgainst],[0.07,-0.03,-0.03]);
assert.equal(lskCreativeSuccess.evidence.opponentPlayerId,null);
assert.equal(lskCreativeSuccess.evidence.creativeAlternativeWeight,0.25);
assert.equal(lskCreativeSuccess.evidence.randomDraws,1);
assert.equal(lskCreative(0.25).situation,"opponent_direct_second_ball");
assert.equal(lskCreative(0.01,{causalOpponentCreativeAlternativeVersion:undefined}).situation,"opponent_direct_second_ball");
assert.equal(lskCreative(0.01,{opponent:{...lskFixture.opponent,tacticalBehaviour:{attackingRunPattern:"direct_duel_second_ball"}}}).situation,"opponent_direct_second_ball");
let actualCreativeDraws=0;
resolveOpponentDirectSecondBall(lskCreativeFixture,{rng:()=>{actualCreativeDraws++;return 0.01;}});
assert.equal(actualCreativeDraws,1);
const lskCreativeNoCover=lskCreative(0.01,{lineupSnapshot:glimtLineup.map(p=>["CM","DM"].includes(p.position)?{...p,roleId:"pressing_midfielder"}:p)});
assert.ok(lskCreativeSuccess.evidence.dedicatedCoverId);
assert.equal(lskCreativeNoCover.evidence.dedicatedCoverId,null);
assert.equal(lskCreativeSuccess.evidence.dribbleProbability,lskCreativeNoCover.evidence.dribbleProbability);
assert.ok(lskCreativeSuccess.evidence.conditionalReleaseProbability<lskCreativeNoCover.evidence.conditionalReleaseProbability);
const lskCreativeWeakPress=lskCreative(0.01,{lineupSnapshot:glimtLineup.map(p=>["CM","DM"].includes(p.position)?{...p,matchScore:55}:p)});
assert.ok(lskCreativeWeakPress.evidence.dribbleProbability>lskCreativeSuccess.evidence.dribbleProbability);
assert.equal(annotateOpponentCreativeAttackChances(lskChances,lskCreativeSuccess).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentCreativeAttackChances(lskChances,lskCreativeStop),lskChances);
let lskCreativeSeed;
for(let i=0;i<3000;i++){
  const s={...lskCreativeFixture,id:"lsk-creative-"+i};
  if(lskCreative(highPressPhaseRoll(s,"0:opponent-direct-second-ball")).status==="creative_breakthrough"){lskCreativeSeed=s;break;}
}
assert.ok(lskCreativeSeed);
const lskCreativeRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(lskCreativeSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_creative_attack");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.ok(played.minuteLog.filter(c=>c.tacticalMoment).length<=1);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(lskCreativeSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
  assert.equal(advanceMatchClock({...lskCreativeSeed,causalOpponentSetPieceVersion:1,events:[{id:"opp_set_piece_threat"}]}).timeline[0].tacticalPhase.situation,"opponent_set_piece");
}finally{Math.random=lskCreativeRandom;}

// Viking: equal flank cover stays anonymous; wide and central gates are separate.
const vikingProfile=JSON.parse(readFileSync(new URL("../data/football_league_club_profiles.json",import.meta.url),"utf8")).profiles.find(p=>p.clubId==="viking");
const vikingOverlapFixture=session("midfield_press_trap",{causalOpponentFullbackOverlapVersion:1,
  opponent:{...vikingProfile,id:"viking",strength:72},lineupSnapshot:glimtLineup,
  tacticSnapshot:{id:"midfield_press_trap",defensiveLine:"medium"}});
const vikingOverlap=(roll,changes={})=>resolveOpponentFullbackOverlap({...vikingOverlapFixture,...changes},{rng:()=>roll});
const vikingSuccess=vikingOverlap(0.1),vikingBox=vikingOverlap(0.3),vikingWide=vikingOverlap(0.9);
assert.deepEqual([vikingSuccess.status,vikingBox.status,vikingWide.status],["overlap_breakthrough","box_contained","overlap_contained"]);
assert.deepEqual([vikingSuccess.xgDeltaAgainst,vikingBox.xgDeltaAgainst,vikingWide.xgDeltaAgainst],[0.07,-0.02,-0.03]);
assert.equal(vikingSuccess.evidence.targetFlank,null);
assert.equal(vikingSuccess.evidence.opponentPlayerId,null);
const vikingLeft=vikingOverlap(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="LW"?{...p,matchScore:55}:p)});
assert.equal(vikingLeft.evidence.targetFlank,"left");
assert.ok(vikingLeft.evidence.overlapProbability>vikingSuccess.evidence.overlapProbability);
assert.equal(vikingLeft.evidence.conditionalBoxProbability,vikingSuccess.evidence.conditionalBoxProbability);
const vikingWeakBox=vikingOverlap(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)});
assert.equal(vikingWeakBox.evidence.overlapProbability,vikingSuccess.evidence.overlapProbability);
assert.ok(vikingWeakBox.evidence.conditionalBoxProbability>vikingSuccess.evidence.conditionalBoxProbability);
assert.equal(vikingOverlap(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="LW")}),null);
assert.equal(vikingOverlap(0.1,{causalOpponentFullbackOverlapVersion:undefined}),null);
assert.equal(vikingOverlap(0.1,{opponent:{...vikingOverlapFixture.opponent,tacticalBehaviour:{}}}),null);
assert.equal(vikingOverlap(NaN),null);
let vikingDraws=0;resolveOpponentFullbackOverlap(vikingOverlapFixture,{rng:()=>{vikingDraws++;return 0.1;}});
assert.equal(vikingDraws,1);
assert.equal(annotateOpponentFullbackOverlapChances(lskChances,vikingSuccess).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentFullbackOverlapChances(lskChances,vikingWide),lskChances);
let vikingOverlapSeed;
for(let i=0;i<3000;i++){
  const s={...vikingOverlapFixture,id:"viking-overlap-"+i};
  if(vikingOverlap(highPressPhaseRoll(s,"0:opponent-fullback-overlap")).status==="overlap_breakthrough"){vikingOverlapSeed=s;break;}
}
assert.ok(vikingOverlapSeed);
const vikingOverlapRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(vikingOverlapSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_fullback_overlap");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(vikingOverlapSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=vikingOverlapRandom;}

// Viking short-pass alternative uses the same period draw as overlap.
const vikingShortFixture={...vikingOverlapFixture,causalOpponentShortCombinationVersion:1};
const vikingShort=(draw,changes={})=>resolveOpponentFullbackOverlap({...vikingShortFixture,...changes},{rng:()=>draw});
const shortWin=vikingShort(0.02),shortRelease=vikingShort(0.14),shortStop=vikingShort(0.36);
assert.deepEqual([shortWin.status,shortRelease.status,shortStop.status],
  ["combination_breakthrough","third_man_contained","support_pass_contained"]);
assert.deepEqual([shortWin.xgDeltaAgainst,shortRelease.xgDeltaAgainst,shortStop.xgDeltaAgainst],[0.07,-0.02,-0.03]);
assert.equal(shortWin.evidence.opponentPlayerId,null);
assert.equal(shortWin.evidence.shortCombinationWeight,0.4);
assert.notEqual(shortWin.evidence.firstPresserId,shortWin.evidence.centralCoverId);
assert.equal(shortWin.evidence.dedicatedCover,true);
assert.equal(vikingShort(0.4).situation,"opponent_fullback_overlap");
assert.equal(vikingShort(0.02,{causalOpponentShortCombinationVersion:undefined}).situation,"opponent_fullback_overlap");
assert.equal(vikingShort(0.02,{opponent:{...vikingShortFixture.opponent,tacticalBehaviour:{attackingRunPattern:"rehearsed_fullback_overlap"}}}).situation,"opponent_fullback_overlap");
assert.equal(vikingShort(0.02,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="DM")}).situation,"opponent_fullback_overlap");
let shortDraws=0;resolveOpponentFullbackOverlap(vikingShortFixture,{rng:()=>{shortDraws++;return 0.02;}});
assert.equal(shortDraws,1);
const weakFirst=vikingShort(0.02,{lineupSnapshot:glimtLineup.map(p=>p.position==="CM"?{...p,matchScore:55}:p)});
assert.ok(weakFirst.evidence.supportPassProbability>shortWin.evidence.supportPassProbability);
assert.equal(weakFirst.evidence.conditionalThirdManProbability,shortWin.evidence.conditionalThirdManProbability);
const weakScreen=vikingShort(0.02,{lineupSnapshot:glimtLineup.map(p=>p.position==="DM"?{...p,roleId:"deep_playmaker"}:p)});
assert.equal(weakScreen.evidence.supportPassProbability,shortWin.evidence.supportPassProbability);
assert.ok(weakScreen.evidence.conditionalThirdManProbability>shortWin.evidence.conditionalThirdManProbability);
assert.equal(annotateOpponentShortCombinationChances(lskChances,shortWin).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentShortCombinationChances(lskChances,shortStop),lskChances);
let vikingShortSeed;
for(let i=0;i<3000;i++){
  const s={...vikingShortFixture,id:"viking-short-"+i};
  if(vikingShort(highPressPhaseRoll(s,"0:opponent-fullback-overlap")).status==="combination_breakthrough"){vikingShortSeed=s;break;}
}
assert.ok(vikingShortSeed);
const vikingShortRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(vikingShortSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_short_combination");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(vikingShortSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=vikingShortRandom;}

// Knapp's dead-ball focus uses the existing event slot and resolver.
const knappHome=[],knappAway=[];
for(let n=0;n<100;n++){
  for(const homeAway of ["home","away"]){
    const opp={...vikingProfile,id:"viking",homeAway,matchId:"viking-"+n+"-"+homeAway};
    const generated=generateMatchdayEvents({opponent:opp,tacticalProfile:vikingShortFixture.teamFitSnapshot.tacticalProfile});
    assert.equal(generated.length,3);
    assert.equal(new Set(generated.map(e=>e.id)).size,3);
    assert.deepEqual(generateMatchdayEvents({opponent:opp,tacticalProfile:vikingShortFixture.teamFitSnapshot.tacticalProfile}),generated);
    (homeAway==="home"?knappHome:knappAway).push({opp,generated});
  }
}
const knappHomeDead=knappHome.find(x=>x.generated[1].id==="opp_set_piece_threat");
const knappAwayDead=knappAway.find(x=>x.generated[1].id==="opp_set_piece_second_ball");
assert.ok(knappHomeDead&&knappAwayDead);
assert.ok(knappHome.some(x=>x.generated[1].id!=="opp_set_piece_threat"));
assert.ok(knappAway.some(x=>x.generated[1].id!=="opp_set_piece_second_ball"));
assert.equal(knappHomeDead.generated[1].title,"Dødball mot boksen");
assert.equal(vikingProfile.tacticalBehaviourEvidence.eraByPattern.setPiecePattern,"1978–1981");
const knappFixture={...vikingShortFixture,causalOpponentSetPieceVersion:1,events:[knappHomeDead.generated[1]]};
const knappFirst=resolveOpponentSetPiece(knappFixture,{rng:()=>0.1});
assert.equal(knappFirst.route,"historical_set_piece_focus");
assert.equal(knappFirst.evidence.opponentPattern,"historical_set_piece_focus");
assert.equal(knappFirst.status,"first_contact_threat");
assert.equal(knappFirst.xgDeltaAgainst,lskDeadFirst.xgDeltaAgainst);
assert.equal(resolveOpponentSetPiece({...knappFixture,events:[]},{rng:()=>0.1}),null);
assert.equal(resolveOpponentSetPiece({...knappFixture,causalOpponentSetPieceVersion:undefined},{rng:()=>0.1}),null);
const knappSecond=resolveOpponentSetPiece({...knappFixture,events:[knappAwayDead.generated[1]]},{rng:()=>0.1});
assert.equal(knappSecond.status,"second_ball_threat");
assert.equal(knappSecond.evidence.firstContactProbability,null);
const knappOriginalRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(knappFixture),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_set_piece");
  assert.equal(period.tacticalPhase.route,"historical_set_piece_focus");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.notEqual(advanceMatchClock(played).timeline[1].tacticalPhase?.situation,"opponent_set_piece");
}finally{Math.random=knappOriginalRandom;}

// Live route adaptation: two consecutive failures, remaining time, one
// tactical reaction, no additional xG or fabricated player repositioning.
const flexibleFixture={...vikingShortFixture,causalOpponentAttackAdaptationVersion:1,
  events:knappHomeDead.generated,phase:"event_2",score:{for:0,against:0},
  timeline:[{tacticalPhase:vikingWide},{tacticalPhase:vikingBox}],opponentAdjustments:[]};
const flexibleBefore=JSON.stringify(flexibleFixture);
const varied=applyOpponentAdaptation(flexibleFixture);
assert.equal(JSON.stringify(flexibleFixture),flexibleBefore);
assert.equal(varied.opponentAttackRoutePreference,"short_combination");
assert.equal(varied.opponentAdjustments.at(-1).id,"vary_attack_route");
assert.equal(varied.opponentAdjustments.at(-1).observedPeriods,2);
assert.equal(varied.timeline,flexibleFixture.timeline);
assert.equal(varied.opponent,flexibleFixture.opponent);
assert.equal(varied.planMatchup,flexibleFixture.planMatchup);
assert.equal(applyOpponentAdaptation(varied),varied);
assert.equal(resolveOpponentFullbackOverlap(varied,{rng:()=>0.5}).route,"rehearsed_short_pass_support");
assert.equal(resolveOpponentFullbackOverlap(flexibleFixture,{rng:()=>0.5}).route,"rehearsed_fullback_overlap");
const variedWide=applyOpponentAdaptation({...flexibleFixture,timeline:[{tacticalPhase:shortStop},{tacticalPhase:shortRelease}]});
assert.equal(variedWide.opponentAttackRoutePreference,"fullback_overlap");
assert.equal(resolveOpponentFullbackOverlap(variedWide,{rng:()=>0.2}).route,"rehearsed_fullback_overlap");
for(const invalid of [
  {...flexibleFixture,causalOpponentAttackAdaptationVersion:undefined},
  {...flexibleFixture,timeline:[{tacticalPhase:vikingWide}]},
  {...flexibleFixture,timeline:[{tacticalPhase:vikingWide},{tacticalPhase:shortStop}]},
  {...flexibleFixture,timeline:[{tacticalPhase:vikingWide},{tacticalPhase:vikingSuccess}]},
  {...flexibleFixture,events:[]},
  {...flexibleFixture,opponent:{...flexibleFixture.opponent,tacticalBehaviour:{attackingRunPattern:"rehearsed_fullback_overlap"}}}
])assert.equal(applyOpponentAdaptation(invalid),invalid);
const scoreAdjusted=applyOpponentAdaptation({...flexibleFixture,score:{for:1,against:0}});
assert.equal(scoreAdjusted.opponentAdjustments.at(-1).id,"push_up");
assert.equal(scoreAdjusted.opponent.tacticalBehaviour.attackingRunPattern,"rehearsed_fullback_overlap");
assert.equal(scoreAdjusted.opponent.tacticalBehaviour.shortCombinationPattern,"rehearsed_short_pass_support");
assert.equal(scoreAdjusted.opponent.tacticalBehaviour.setPiecePattern,"historical_set_piece_focus");
assert.equal(scoreAdjusted.opponentAttackRoutePreference,undefined);
assert.ok(resolveOpponentFullbackOverlap(scoreAdjusted,{rng:()=>0.1}));
assert.deepEqual(resolveOpponentFullbackOverlap(JSON.parse(JSON.stringify(varied)),{rng:()=>0.5}),
  resolveOpponentFullbackOverlap(varied,{rng:()=>0.5}));

// Stabæk: one creative opening, depth, then conditional late-run window.
const stabakProfile=leagueProfiles.find(p=>p.clubId==="stabak");
const stabakFixture=session("wide_fast_433",{causalOpponentThreeSpaceVersion:1,
  opponent:{...stabakProfile,id:"stabak",strength:72},lineupSnapshot:glimtLineup,
  tacticSnapshot:{id:"wide_fast_433",defensiveLine:"medium"}});
const stabakRun=(roll,changes={})=>resolveOpponentThreeSpaceCombination({...stabakFixture,...changes},{rng:()=>roll});
const stabakDepth=stabakRun(0.1),stabakLate=stabakRun(0.28),stabakBoth=stabakRun(0.4),stabakStop=stabakRun(0.9);
assert.deepEqual([stabakDepth,stabakLate,stabakBoth,stabakStop].map(p=>p.status),
  ["depth_breakthrough","late_runner_breakthrough","both_runs_contained","creation_contained"]);
assert.deepEqual([stabakDepth,stabakLate,stabakBoth,stabakStop].map(p=>p.xgDeltaAgainst),[0.07,0.05,-0.02,-0.03]);
assert.equal(stabakDepth.evidence.opponentPlayerId,null);
assert.equal(stabakDepth.evidence.sourceSpace,null);
assert.notEqual(stabakDepth.evidence.firstPresserId,stabakDepth.evidence.lateRunnerCoverId);
const stabakWide=stabakRun(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="LW"?{...p,matchScore:55}:p)});
assert.equal(stabakWide.evidence.sourceSpace,"wide");assert.equal(stabakWide.evidence.targetFlank,"left");
const stabakMiddle=stabakRun(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="CM"?{...p,matchScore:55}:p)});
assert.equal(stabakMiddle.evidence.sourceSpace,"between_lines");
assert.equal(stabakMiddle.evidence.targetFlank,null);
const stabakHigh=stabakRun(0.1,{tacticSnapshot:{id:"wide_fast_433",defensiveLine:"high"}});
assert.ok(stabakHigh.evidence.conditionalDepthProbability>stabakDepth.evidence.conditionalDepthProbability);
assert.equal(stabakHigh.evidence.conditionalLateRunnerProbability,stabakDepth.evidence.conditionalLateRunnerProbability);
const stabakWeakCover=stabakRun(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="DM"?{...p,roleId:"deep_playmaker"}:p)});
assert.ok(stabakWeakCover.evidence.conditionalLateRunnerProbability>stabakDepth.evidence.conditionalLateRunnerProbability);
assert.equal(stabakWeakCover.evidence.conditionalDepthProbability,stabakDepth.evidence.conditionalDepthProbability);
assert.equal(stabakRun(0.1,{causalOpponentThreeSpaceVersion:undefined}),null);
assert.equal(stabakRun(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="DM")}),null);
assert.equal(stabakRun(0.1,{tacticSnapshot:{id:"wide_fast_433"}}),null);
assert.equal(stabakRun(NaN),null);
let stabakDraws=0;resolveOpponentThreeSpaceCombination(stabakFixture,{rng:()=>{stabakDraws++;return 0.1;}});
assert.equal(stabakDraws,1);
assert.equal(annotateOpponentThreeSpaceChances(lskChances,stabakLate).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentThreeSpaceChances(lskChances,stabakStop),lskChances);
let stabakSeed;
for(let i=0;i<3000;i++){
  const s={...stabakFixture,id:"stabak-three-"+i};
  if(stabakRun(highPressPhaseRoll(s,"0:opponent-three-space")).status==="depth_breakthrough"){stabakSeed=s;break;}
}
assert.ok(stabakSeed);
const stabakRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(stabakSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_three_space_combination");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(stabakSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=stabakRandom;}

// A wide dribble can displace central cover without extra shots or draws.
const stabakDribbleFixture={...stabakFixture,causalOpponentDribbleDisplacementVersion:1,
  lineupSnapshot:glimtLineup.map(p=>p.position==="LW"?{...p,matchScore:55}:p)};
const stabakDribble=(roll,changes={})=>resolveOpponentThreeSpaceCombination({...stabakDribbleFixture,...changes},{rng:()=>roll});
const dribblePull=stabakDribble(0.02);
assert.equal(dribblePull.evidence.centralCoverDisplaced,true);
assert.equal(dribblePull.evidence.displacedCoverId,dribblePull.evidence.lateRunnerCoverId);
assert.equal(dribblePull.evidence.targetFlank,"left");
assert.ok(dribblePull.evidence.conditionalLateRunnerIfDisplaced>dribblePull.evidence.conditionalLateRunnerProbability);
assert.equal(dribblePull.evidence.conditionalDepthProbability,stabakWide.evidence.conditionalDepthProbability);
const dribbleUndedicated=stabakDribble(0.02,{lineupSnapshot:stabakDribbleFixture.lineupSnapshot.map(p=>p.position==="DM"?{...p,roleId:"deep_playmaker"}:p)});
assert.ok(dribbleUndedicated.evidence.conditionalDisplacementProbability>dribblePull.evidence.conditionalDisplacementProbability);
const dribbleHeld=stabakDribble(0.35);
assert.equal(dribbleHeld.evidence.centralCoverDisplaced,false);
assert.equal(dribbleHeld.evidence.displacedCoverId,null);
const dribbleContained=stabakDribble(0.99);
assert.equal(dribbleContained.status,"creation_contained");
assert.equal(dribbleContained.evidence.centralCoverDisplaced,false);
assert.equal(stabakDribble(0.02,{lineupSnapshot:glimtLineup}).evidence.wideCreationPattern,undefined);
assert.deepEqual(stabakDribble(0.1,{causalOpponentDribbleDisplacementVersion:undefined}),stabakWide);
let stabakDribbleDraws=0;
resolveOpponentThreeSpaceCombination(stabakDribbleFixture,{rng:()=>{stabakDribbleDraws++;return 0.02;}});
assert.equal(stabakDribbleDraws,1);
let displacedLateSeen=false;
for(let n=0;n<1000;n++){
  const phase=stabakDribble(n/1000);
  if(phase.status==="late_runner_breakthrough"&&phase.evidence.centralCoverDisplaced){
    displacedLateSeen=true;assert.equal(phase.xgDeltaAgainst,0.05);
    assert.equal(annotateOpponentThreeSpaceChances(lskChances,phase).filter(c=>c.tacticalMoment).length,1);
  }
}
assert.ok(displacedLateSeen);
assert.deepEqual(resolveOpponentThreeSpaceCombination(JSON.parse(JSON.stringify(stabakDribbleFixture)),{rng:()=>0.02}),dribblePull);

// Separate the support striker's reception from the through-ball release.
const stabakPairFixture={...stabakFixture,causalOpponentSupportStrikerVersion:1,
  causalOpponentDribbleDisplacementVersion:1,
  lineupSnapshot:glimtLineup.map(p=>p.position==="CM"?{...p,matchScore:55}:p)};
const stabakPair=(roll,changes={})=>resolveOpponentThreeSpaceCombination({...stabakPairFixture,...changes},{rng:()=>roll});
const pairDepth=stabakPair(0.1),pairLate=stabakPair(0.22),pairBoth=stabakPair(0.3),
  pairBlocked=stabakPair(0.5),pairNoReceive=stabakPair(0.9);
assert.deepEqual([pairDepth,pairLate,pairBoth,pairBlocked,pairNoReceive].map(p=>p.status),
  ["depth_breakthrough","late_runner_breakthrough","both_runs_contained","through_ball_contained","creation_contained"]);
assert.equal(pairDepth.evidence.centralCreationPattern,"support_striker_through_ball");
assert.equal(pairDepth.evidence.opponentPlayerId,null);
assert.equal(pairBlocked.evidence.supportStrikerReceived,true);
assert.equal(pairBlocked.evidence.throughBallReleased,false);
assert.equal(pairBlocked.xgDeltaAgainst,-0.03);
assert.deepEqual(pairBlocked.steps.slice(2).map(p=>p.result),["countered","not_reached","not_reached"]);
assert.equal(pairNoReceive.evidence.supportStrikerReceived,false);
assert.equal(pairDepth.evidence.conditionalDepthProbability,stabakMiddle.evidence.conditionalDepthProbability);
assert.equal(pairDepth.evidence.conditionalLateRunnerProbability,stabakMiddle.evidence.conditionalLateRunnerProbability);
assert.ok(pairDepth.probability<stabakMiddle.probability);
const pairLessPress=stabakPair(0.1,{teamFitSnapshot:{...stabakPairFixture.teamFitSnapshot,tacticalProfile:{...stabakPairFixture.teamFitSnapshot.tacticalProfile,balanceScore:50}}});
assert.ok(pairLessPress.evidence.conditionalReleaseProbability>pairDepth.evidence.conditionalReleaseProbability);
assert.equal(stabakPair(0.1,{lineupSnapshot:glimtLineup}).evidence.centralCreationPattern,undefined);
assert.equal(stabakPair(0.1,{lineupSnapshot:stabakDribbleFixture.lineupSnapshot}).evidence.centralCreationPattern,undefined);
assert.deepEqual(stabakPair(0.1,{causalOpponentSupportStrikerVersion:undefined}),stabakMiddle);
let pairDraws=0;resolveOpponentThreeSpaceCombination(stabakPairFixture,{rng:()=>{pairDraws++;return 0.1;}});
assert.equal(pairDraws,1);
const pairLateChances=annotateOpponentThreeSpaceChances(lskChances,pairLate);
assert.equal(pairLateChances.filter(c=>c.tacticalMoment).length,1);
assert.equal(pairLateChances.find(c=>c.tacticalMoment).tacticalMoment.keyAction,pairLate.steps.at(-1).action);
assert.equal(annotateOpponentThreeSpaceChances(lskChances,pairBlocked),lskChances);
assert.deepEqual(resolveOpponentThreeSpaceCombination(JSON.parse(JSON.stringify(stabakPairFixture)),{rng:()=>0.22}),pairLate);

// Høgmo: a good rest defence prevents a forced transition, not every
// regain is a shot and the selection remains deterministic.
const tilProfile=leagueProfiles.find(p=>p.clubId==="tromso");
const tilFixture=session("wide_fast_433",{causalOpponentSelectiveTransitionVersion:1,
  opponent:{...tilProfile,id:"tromso",strength:72},lineupSnapshot:glimtLineup,
  tacticSnapshot:{id:"wide_fast_433",defensiveLine:"medium"}});
const tilRun=(roll,changes={})=>resolveOpponentSelectiveTransition({...tilFixture,...changes},{rng:()=>roll});
const tilRetain=tilRun(0.1),tilProtect=tilRun(0.95);
assert.equal(tilRetain.status,"retained");
assert.equal(tilRetain.xgDeltaAgainst,0);
assert.equal(tilProtect.status,"possession_protected");
const tilHigh={tacticSnapshot:{id:"wide_fast_433",defensiveLine:"high"}};
const tilBreak=tilRun(0.1,tilHigh),tilContained=tilRun(0.35,tilHigh);
assert.equal(tilBreak.status,"breakthrough");
assert.equal(tilBreak.xgDeltaAgainst,0.07);
assert.equal(tilContained.status,"transition_contained");
assert.equal(tilBreak.evidence.regainProbability,tilRetain.evidence.regainProbability);
assert.ok(tilBreak.evidence.conditionalBreakthroughProbability>tilRetain.evidence.conditionalBreakthroughProbability);
const tilWeakBuild=tilRun(0.1,{teamFitSnapshot:{...tilFixture.teamFitSnapshot,tacticalProfile:{...tilFixture.teamFitSnapshot.tacticalProfile,buildUpScore:40}}});
assert.ok(tilWeakBuild.evidence.regainProbability>tilRetain.evidence.regainProbability);
assert.equal(tilWeakBuild.evidence.conditionalBreakthroughProbability,tilRetain.evidence.conditionalBreakthroughProbability);
assert.equal(tilRun(0.1,{causalOpponentSelectiveTransitionVersion:undefined}),null);
assert.equal(tilRun(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position!=="DM")}),null);
assert.equal(tilRun(NaN),null);
assert.equal(annotateOpponentSelectiveTransitionChances(lskChances,tilBreak).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentSelectiveTransitionChances(lskChances,tilRetain),lskChances);
let tilSeed;
for(let i=0;i<3000;i++){
  const s={...tilFixture,...tilHigh,id:"til-transition-"+i};
  if(resolveOpponentSelectiveTransition(s,{rng:()=>highPressPhaseRoll(s,"0:opponent-selective-transition")}).status==="breakthrough"){tilSeed=s;break;}
}
assert.ok(tilSeed);
const tilRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(tilSeed),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_selective_transition");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(tilSeed))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=tilRandom;}

// Tromsø's midfield screen is not a low-block prerequisite. The attack
// phase separates first and second support, and shares one xG ledger.
const tilScreen={...tilFixture,causalDoubleMidfieldScreenVersion:1,
  selectedTacticId:"central_possession_4231",tacticSnapshot:{id:"central_possession_4231",defensiveLine:"medium"}};
const screenRun=(roll,changes={})=>resolveDoubleMidfieldScreen({...tilScreen,...changes},{rng:()=>roll});
const screenWin=screenRun(0.1),screenSecond=screenRun(0.35),screenFirst=screenRun(0.9);
assert.deepEqual([screenWin.status,screenSecond.status,screenFirst.status],["breakthrough","second_screen_contained","first_screen_contained"]);
assert.equal(screenWin.xgDeltaFor,0.09);
assert.equal(screenWin.xgDeltaAgainst,0);
assert.equal(screenWin.evidence.opponentPlayerId,null);
assert.equal(new Set([...screenWin.evidence.firstSupport,...screenWin.evidence.secondSupport]).size,3);
const screenWide=screenRun(0.1,{tacticSnapshot:{id:"wide_fast_433",defensiveLine:"medium"}});
assert.equal(screenWide.route,"double_screen_wide_bypass");
assert.ok(screenWide.evidence.entryProbability>screenWin.evidence.entryProbability);
assert.equal(screenWide.evidence.targetFlank,null);
const screenWeakPivot=screenRun(0.1,{lineupSnapshot:glimtLineup.map(p=>["DM","CM"].includes(p.position)?{...p,matchScore:55}:p)});
assert.ok(screenWeakPivot.evidence.entryProbability<screenWin.evidence.entryProbability);
const screenWeakRunner=screenRun(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="AM"?{...p,matchScore:55}:p)});
assert.equal(screenWeakRunner.evidence.entryProbability,screenWin.evidence.entryProbability);
assert.ok(screenWeakRunner.evidence.conditionalFinishProbability<=screenWin.evidence.conditionalFinishProbability);
assert.equal(screenRun(0.1,{causalDoubleMidfieldScreenVersion:undefined}),null);
assert.equal(screenRun(0.1,{opponent:{...tilScreen.opponent,tacticalBehaviour:{}}}),null);
assert.equal(screenRun(NaN),null);
assert.equal(resolveCompactBlockAttack(tilScreen,{rng:()=>0.1}).route,"double_screen_central_combination");
let tilScreenDraws=0;resolveCompactBlockAttack(tilScreen,{rng:()=>{tilScreenDraws++;return 0.1;}});
assert.equal(tilScreenDraws,1);
assert.equal(annotateCompactBlockChances(lskChances,screenWin).filter(c=>c.tacticalMoment).length,1);
const weakRest=screenRun(0.9,{teamFitSnapshot:{...tilScreen.teamFitSnapshot,tacticalProfile:{...tilScreen.teamFitSnapshot.tacticalProfile,restDefenseScore:40}}});
assert.equal(weakRest.xgDeltaAgainst,0.03);
const tilScreenRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(tilScreen),period=played.timeline[0];
  assert.equal(period.tacticalPhase.route,"double_screen_central_combination");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.for-period.baselineExpectedGoals.for)*100)/100,period.tacticalPhase.xgDeltaFor);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(tilScreen))).timeline[0].tacticalPhase,period.tacticalPhase);
}finally{Math.random=tilScreenRandom;}

// Helstrup's fourth build-up player: existing press motor and two
// alternative outlets, not a second phase or extra shot.
const tilKeeperFixture=session("high_press_343",{opponent:{...tilProfile,id:"tromso",strength:72},
  lineupSnapshot:glimtLineup,causalOpponentKeeperBuildUpVersion:1});
const keeperRun=(changes={},pressure=0.99,protection=0.99)=>resolve({...tilKeeperFixture,...changes},pressure,protection);
const keeperBase=keeperRun();
assert.equal(keeperBase.evidence.keeperBuildUp.buildUpSlots,4);
assert.equal(keeperBase.evidence.keeperBuildUp.nominalForwardPressRoles,4);
assert.equal(keeperBase.evidence.keeperBuildUp.opponentPlayerId,null);
assert.deepEqual(keeperBase.evidence.keeperBuildUp.availableOutlets,["third_man","direct"]);
assert.equal(keeperBase.evidence.keeperBuildUp.selectedOutlet,null);
const keeperWeakCentral=keeperRun({lineupSnapshot:glimtLineup.map(p=>p.position==="CM"?{...p,roleId:"deep_playmaker"}:p)});
assert.equal(keeperWeakCentral.evidence.keeperBuildUp.selectedOutlet,"third_man");
assert.equal(keeperWeakCentral.counterplay.pathwayId,"third_man");
const keeperWeakDepth=keeperRun({lineupSnapshot:glimtLineup.map(p=>p.position==="CB"?{...p,matchScore:55}:p)});
assert.equal(keeperWeakDepth.evidence.keeperBuildUp.selectedOutlet,"direct");
assert.equal(keeperWeakDepth.counterplay.pathwayId,"direct");
const keeperThree=keeperRun({lineupSnapshot:glimtLineup.map(p=>p.position==="AM"?{...p,position:"CM"}:p)});
assert.ok(keeperThree.evidence.keeperBuildUp.pressPenalty>keeperBase.evidence.keeperBuildUp.pressPenalty);
assert.ok(keeperThree.probability<keeperBase.probability);
assert.equal(keeperRun({},0,0.99).status,"regain");
assert.equal(keeperRun({},0.99,0).status,"contained");
assert.equal(keeperBase.status,"escaped");
assert.equal(keeperRun({causalOpponentKeeperBuildUpVersion:undefined}).evidence.keeperBuildUp,undefined);
assert.equal(keeperRun({tacticSnapshot:{id:"midfield_press_trap"}}).evidence.keeperBuildUp,undefined);
const keeperExplicit=keeperRun({opponent:{...tilKeeperFixture.opponent,tacticalBehaviour:{keeperBuildUpPattern:"keeper_back_four",pressEscape:"isolated"}}});
assert.equal(keeperExplicit.evidence.keeperBuildUp,undefined);
assert.equal(keeperExplicit.evidence.opponentEscapeEvidence,"isolated");
const keeperUnknown=keeperRun({lineupSnapshot:glimtLineup.map(p=>p.position==="AM"?{...p,matchFitKnown:false}:p)});
assert.equal(keeperUnknown.evidence.keeperBuildUp,undefined);
let keeperPressureDraws=0,keeperProtectionDraws=0;
resolveOwnPressAgainstOpponent(tilKeeperFixture,{pressureRoll:()=>{keeperPressureDraws++;return 0.99;},
  protectionRoll:()=>{keeperProtectionDraws++;return 0.99;}});
assert.deepEqual([keeperPressureDraws,keeperProtectionDraws],[1,1]);
assert.deepEqual(resolve(JSON.parse(JSON.stringify(tilKeeperFixture)),0.99,0.99),keeperBase);
const keeperRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(tilKeeperFixture),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"our_press_vs_opponent_build_up");
  assert.equal(period.tacticalPhase.evidence.keeperBuildUp.buildUpSlots,4);
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
}finally{Math.random=keeperRandom;}

// Modern Tromsø: separate wingback cover, midfield screen and depth.
const pinFixture={...tilFixture,causalOpponentWingbackPinVersion:1};
const pinRun=(roll,changes={})=>resolveOpponentWingbackPin({...pinFixture,...changes},{rng:()=>roll});
const pinWin=pinRun(0.1),pinDepth=pinRun(0.35),pinStop=pinRun(0.9);
assert.deepEqual([pinWin.status,pinDepth.status,pinStop.status],["breakthrough","depth_contained","entry_contained"]);
assert.deepEqual([pinWin.xgDeltaAgainst,pinDepth.xgDeltaAgainst,pinStop.xgDeltaAgainst],[0.07,-0.02,-0.03]);
assert.equal(pinWin.evidence.opponentPlayerId,null);
assert.equal(new Set([...pinWin.evidence.wideCover,...pinWin.evidence.centralCover,...pinWin.evidence.depthCover]).size,8);
const pinWeakWide=pinRun(0.1,{lineupSnapshot:glimtLineup.map(p=>p.position==="LW"?{...p,matchScore:45}:p)});
assert.ok(pinWeakWide.evidence.pinPressure>pinWin.evidence.pinPressure);
assert.ok(pinWeakWide.evidence.centralEntryProbability>pinWin.evidence.centralEntryProbability);
assert.equal(pinWeakWide.evidence.conditionalDepthProbability,pinWin.evidence.conditionalDepthProbability);
const pinWeakMiddle=pinRun(0.1,{lineupSnapshot:glimtLineup.map(p=>["CM","DM"].includes(p.position)?{...p,matchScore:50}:p)});
assert.equal(pinWeakMiddle.evidence.sourceSpace,"between_lines");
assert.equal(pinWeakMiddle.evidence.targetFlank,null);
const pinHigh=pinRun(0.1,tilHigh);
assert.ok(pinHigh.evidence.conditionalDepthProbability>pinWin.evidence.conditionalDepthProbability);
assert.equal(pinHigh.evidence.entryProbability,pinWin.evidence.entryProbability);
assert.equal(pinRun(0.1,{causalOpponentWingbackPinVersion:undefined}),null);
assert.equal(pinRun(0.1,{lineupSnapshot:glimtLineup.filter(p=>p.position==="LW"?false:true)}),null);
assert.equal(pinRun(NaN),null);
let pinDraws=0;resolveOpponentWingbackPin(pinFixture,{rng:()=>{pinDraws++;return 0.1;}});
assert.equal(pinDraws,1);
assert.equal(annotateOpponentWingbackPinChances(lskChances,pinWin).filter(c=>c.tacticalMoment).length,1);
assert.equal(annotateOpponentWingbackPinChances(lskChances,pinStop),lskChances);
const pinClock={...pinFixture,events:[{id:"test_1"},{id:"test_2"},{id:"test_3"}]};
const pinRandom=Math.random;
try{
  Math.random=()=>0.99;
  const played=advanceMatchClock(pinClock),period=played.timeline[0];
  assert.equal(period.tacticalPhase.situation,"opponent_wingback_pin");
  assert.equal(period.tacticalXg,undefined);
  assert.equal(Math.round((period.expectedGoals.against-period.baselineExpectedGoals.against)*100)/100,period.tacticalPhase.xgDeltaAgainst);
  assert.equal(played.minuteLog.length,period.chances);
  assert.deepEqual(advanceMatchClock(JSON.parse(JSON.stringify(pinClock))).timeline[0].tacticalPhase,period.tacticalPhase);
  const next=advanceMatchClock(played).timeline[1];
  assert.equal(next.tacticalPhase.situation,"opponent_selective_transition");
}finally{Math.random=pinRandom;}

console.log("OK: v6 own press, midblock, counterpress, known escape, non-stacked xG");
