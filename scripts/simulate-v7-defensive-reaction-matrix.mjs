// Kampmotor v7: deterministic counterfactual quality matrix for sourced
// player differences across escape lanes, deadlines and two-player handoffs.
// All metres/seconds below are AUTHOR-DEFINED game scenarios, not tracking.
import assert from "node:assert/strict";
import { resolveOwnPressAgainstOpponent } from "../src/football-matchday-own-press-v6.js";
import { sourcedDefensiveReactionSkillsForPlayer }
  from "../src/football-player-stats.js";

const positions = ["GK", "CB", "DM", "CM", "AM", "ST", "LW", "RW", "LB", "RB", "CB"];
const eleven = positions.map((position, i) => ({
  playerId: "v7-matrix-" + i, position,
  roleId: position === "DM" ? "balancing_six" :
    position === "CM" ? "pressing_midfielder" :
    ["LB", "RB"].includes(position) ? "support_fullback" :
      position === "CB" ? "ball_playing_centre_back" : "role_" + position,
  matchScore: 75, matchFitKnown: true
}));
const opponent = {
  id: "v7-matrix-opponent", strength: 72, defensiveStructure: 69,
  pressResistance: 72, transitionThreat: 78,
  styleTraits: { shortBuildUp: 82, possessionControl: 80,
    transitionThreat: 78, highLine: 67, defensiveCompactness: 54,
    pressIntensity: 55 }
};
const profile = {
  pressScore: 78, balanceScore: 74, restDefenseScore: 71,
  buildUpScore: 69, depthScore: 71, widthScore: 69,
  relationshipScore: 72, teamScore: 75
};
const routeActions = {
  third_man: ["receive", "layoff", "third_runner", "through_pass"],
  switch_play: ["receive", "release", "switch_pass", "wide_attack"],
  direct: ["receive", "direct_ball", "first_touch", "support_run"]
};
const routeChannels = {
  third_man: "central_between_lines",
  switch_play: "far_side_wide",
  direct: "depth_behind_press"
};
const situations = [
  { route: "third_man", side: null, label: "central lane" },
  { route: "switch_play", side: "left", label: "left flank" },
  { route: "switch_play", side: "right", label: "right flank" },
  { route: "direct", side: null, label: "depth" }
];
// The production v7 model recognises DOCUMENTED traits, not numerical
// 1-100 speed/positioning ratings. An unproved claim must act like 'none'.
const sourced = (strengths, proof = strengths) =>
  sourcedDefensiveReactionSkillsForPlayer({
    strengths,
    attributes: { provenance: Object.fromEntries(proof.map(s => [s, "belagt"])) }
  });
const traits = [
  { label: "none", sourced: [] },
  { label: "pace", sourced: sourced(["pace"]), helps: true },
  { label: "positioning", sourced: sourced(["positioning"]), helps: true },
  { label: "anticipation", sourced: sourced(["anticipation"]), helps: true },
  { label: "game_reading", sourced: sourced(["game_reading"]), helps: true },
  { label: "defensive_reading", sourced: sourced(["defensive_reading"]), helps: true },
  { label: "combined", sourced: sourced(["pace", "positioning", "game_reading"]), helps: true },
  { label: "unproved", sourced: sourced(["pace", "positioning"], []), helps: false },
  { label: "marking_only", sourced: sourced(["marking"]), helps: false },
  { label: "tackling_only", sourced: sourced(["tackling"]), helps: false }
];
assert.deepEqual(traits.find(t => t.label === "unproved").sourced, []);
for (const t of traits) assert.ok(t.sourced.every(s => typeof s === "string"));
const makeSession = (lineupSnapshot, tacticalBehaviour) => ({
  id: "v7-quality-matrix", version: 2, causalPressingVersion: 1,
  causalCompactBlockVersion: 1, causalTransitionsVersion: 1,
  selectedTacticId: "midfield_press_trap",
  tacticSnapshot: { id: "midfield_press_trap" },
  opponent: { ...opponent, tacticalBehaviour }, lineupSnapshot,
  teamFitSnapshot: { historicalScore: 70, tacticalProfile: profile },
  strengthSnapshot: { finalStrength: 74, modifiers: { missing: 0 } },
  planMatchup: { edge: 1.5 },
  events: [], timeline: [], minuteLog: [], score: { for: 0, against: 0 },
  decisions: [], substitutions: [], planChanges: []
});
const run = (lineupSnapshot, tacticalBehaviour, protectionDraw = 0.99) =>
  resolveOwnPressAgainstOpponent(makeSession(lineupSnapshot, tacticalBehaviour), {
    pressureRoll: () => 0.99, protectionRoll: () => protectionDraw
  });
const baseBehaviour = spec => ({
  pressEscapeRoute: spec.route,
  ...(spec.side ? { pressEscapeTargetFlank: spec.side } : {})
});
const idsFor = spec => {
  const preview = run(eleven, baseBehaviour(spec));
  assert.ok(preview, spec.label + " should be a playable press escape");
  assert.equal(preview.counterplay?.defensiveReply?.roleReadiness, "supported_by_roles");
  const ids = preview.counterplay.defensiveReply.evidence.supportingPlayerIds;
  assert.ok(ids.length >= 1);
  assert.equal(new Set(ids).size, ids.length);
  return ids;
};
const withPlayer = (id, skills) => eleven.map(player =>
  player.playerId === id
    ? { ...player, playerId: id + "-replacement",
      sourcedDefensiveReactionSkills: skills }
    : player);
const authored = (spec, ids, deadline, candidateId) => ({
  basis: "authored_action_sequence", route: spec.route,
  actions: routeActions[spec.route].map((id, i) => ({
    id, durationSeconds: [0.7, 0.5, 0.7, 0.9][i]
  })),
  defenderResponsesByPlayerId: Object.fromEntries(ids.map(id => [
    id === ids[0] ? candidateId : id,
    { recognitionDelaySeconds: id === ids[0] ? 0.35 : 0.1,
      coverMoveSeconds: id === ids[0] ? 1.6 : 0.6,
      triggerActionId: "receive",
      ...(deadline ? { mustCoverByActionId: deadline } : {}) }
  ]))
});
const trial = (spec, ids, deadline, skills = [], draw = 0.99) => {
  const candidateId = ids[0] + "-replacement";
  return run(withPlayer(ids[0], skills), {
    ...baseBehaviour(spec),
    pressEscapeActionSequence: authored(spec, ids, deadline, candidateId)
  }, draw);
};

let cells = 0;
let decisive = 0;
let neutral = 0;
const table = [];
for (const spec of situations) {
  const ids = idsFor(spec);
  const actionNames = routeActions[spec.route];
  // Early deadline, near-boundary deadline, and end-of-sequence deadline.
  // These are distinct action contracts; changing only the action deadline
  // must never change the initial press probability.
  for (const deadline of [actionNames[2], actionNames[3], null]) {
    const ordinary = trial(spec, ids, deadline);
    const ordinaryTime = ordinary.evidence.routeCoverTiming;
    assert.equal(ordinaryTime.basis, "authored_action_sequence");
    assert.equal(ordinaryTime.movementModel, "authored_move_seconds");
    for (const trait of traits) {
      const improved = trial(spec, ids, deadline, trait.sourced);
      const time = improved.evidence.routeCoverTiming;
      const cell = spec.label + " / " + (deadline || "full sequence") +
        " / " + trait.label;
      assert.equal(improved.probability, ordinary.probability,
        cell + ": individual strength cannot buy first-press probability");
      assert.equal(improved.xgDeltaAgainst, ordinary.xgDeltaAgainst,
        cell + ": fixed draw cannot create an extra xG event");
      assert.equal(improved.evidence.routeCoverFitFloor,
        ordinary.evidence.routeCoverFitFloor, cell + ": role fit unchanged");
      assert.ok(time.marginSeconds >= ordinaryTime.marginSeconds - 0.001,
        cell + ": a sourced trait must not slow the same defender");
      assert.ok(improved.routeCoverAdjustment >= ordinary.routeCoverAdjustment,
        cell + ": individual cover cannot remove earned specialist cover");
      assert.ok(improved.routeCoverAdjustment <= 0.03,
        cell + ": specialist term cannot stack above its existing cap");
      for (const entry of time.defenderSkillTiming || []) {
        assert.ok(entry.secondsSaved > 0 && entry.secondsSaved <= 0.25,
          cell + ": max 0.25 seconds per authored task");
        assert.equal(entry.defenderId, ids[0] + "-replacement");
        assert.ok(entry.skills.every(skill => trait.sourced.includes(skill)));
      }
      if (!trait.helps) {
        assert.equal(time.marginSeconds, ordinaryTime.marginSeconds,
          cell + ": unrelated or undocumented trait remains neutral");
        assert.equal(improved.routeCoverAdjustment, ordinary.routeCoverAdjustment);
        neutral++;
      }
      if (deadline === actionNames[3] && trait.helps) {
        assert.equal(ordinaryTime.status, "late",
          cell + ": near-boundary ordinary defender misses last-action deadline");
        assert.equal(time.status, "in_time",
          cell + ": relevant sourced strength meets same deadline");
        assert.equal(ordinary.routeCoverAdjustment, 0);
        assert.ok(improved.routeCoverAdjustment > 0);
        assert.ok((time.defenderSkillTiming || []).length >= 1);
        const threshold = (ordinary.containmentProbability +
          improved.containmentProbability) / 2;
        assert.equal(trial(spec, ids, deadline, [], threshold).status, "escaped");
        assert.equal(trial(spec, ids, deadline, trait.sourced, threshold).status,
          "contained", cell + ": deterministic player swap changes terminal outcome");
        decisive++;
      }
      const replay = improved.counterplay.defensiveReply.coverTimingExplanation;
      assert.equal(replay.kind, time.status === "late"
        ? "late_recovery" : "in_time", cell + ": replay explains the result");
      table.push({ lane: spec.label, deadline: deadline || "end",
        trait: trait.label, status: time.status, margin: time.marginSeconds });
      cells++;
    }
  }
}
// Two-player cover: the departing defender may reach all individual tasks,
// while a different defender must take over the corridor before he leaves.
for (const spec of [situations[0], situations[3]]) {
  const ids = idsFor(spec);
  const actions = routeActions[spec.route];
  const sourceTasks = spec.route === "third_man"
    ? ["screen_layoff", "follow_third_runner", "drop_for_through_pass"]
    : ["drop_behind_press", "challenge_first_touch", "protect_support_run"];
  const candidateId = ids[1] + "-replacement";
  const response = {
    [ids[0]]: { defensiveActionChain: sourceTasks.map((taskId, i) => ({
      taskId, triggerActionId: actions[i], recognitionDelaySeconds: 0.1,
      coverMoveSeconds: [0.4, 0.2, 0.3][i]
    })) },
    [candidateId]: { recognitionDelaySeconds: 0.1, coverMoveSeconds: 0.75 }
  };
  for (const id of ids.slice(2)) response[id] = {
    recognitionDelaySeconds: 0.1, coverMoveSeconds: 0.5
  };
  const behaviour = {
    ...baseBehaviour(spec),
    pressEscapeActionSequence: {
      basis: "authored_action_sequence", route: spec.route,
      actions: actions.map((id, i) => ({
        id, durationSeconds: [0.7, 0.5, 0.7, 1.2][i]
      })),
      defenderResponsesByPlayerId: response,
      defenderCoverHandoff: {
        fromDefenderId: ids[0], toDefenderId: candidateId,
        releaseTaskId: sourceTasks[1], coveredChannel: routeChannels[spec.route]
      }
    }
  };
  const pair = skills => run(eleven.map(player => player.playerId === ids[1]
    ? { ...player, playerId: candidateId,
      sourcedDefensiveReactionSkills: skills } : player), behaviour);
  const ordinary = pair([]);
  const sourcedPartner = pair(sourced(["pace", "positioning"]));
  assert.equal(ordinary.evidence.routeCoverTiming.status, "late");
  assert.equal(sourcedPartner.evidence.routeCoverTiming.status, "in_time");
  assert.equal(ordinary.evidence.routeCoverTiming.coverHandoff.status, "late");
  assert.equal(sourcedPartner.evidence.routeCoverTiming.coverHandoff.status, "in_time");
  assert.ok(sourcedPartner.evidence.routeCoverTiming.coverHandoff.takeoverSeconds <
    ordinary.evidence.routeCoverTiming.coverHandoff.takeoverSeconds);
  assert.equal(ordinary.evidence.routeCoverTiming.defensiveTransitions.every(
    stage => stage.status === "in_time"), true);
  assert.equal(ordinary.probability, sourcedPartner.probability);
  assert.equal(ordinary.xgDeltaAgainst, sourcedPartner.xgDeltaAgainst);
  assert.equal(ordinary.routeCoverAdjustment, 0);
  assert.ok(sourcedPartner.routeCoverAdjustment > 0);
  assert.equal(sourcedPartner.counterplay.defensiveReply.coverTimingExplanation.kind,
    "in_time");
  assert.equal(ordinary.counterplay.defensiveReply.coverTimingExplanation.kind,
    "late_handoff");
  const threshold = (ordinary.containmentProbability +
    sourcedPartner.containmentProbability) / 2;
  const pairAt = skills => run(eleven.map(player => player.playerId === ids[1]
    ? { ...player, playerId: candidateId,
      sourcedDefensiveReactionSkills: skills } : player), behaviour, threshold);
  assert.equal(pairAt([]).status, "escaped");
  assert.equal(pairAt(sourced(["pace", "positioning"])).status, "contained");
}
console.log(JSON.stringify({
  ok: true, version: "v7", matrixCells: cells,
  decisiveCounterfactuals: decisive, neutralControls: neutral,
  coverHandoffCases: 2, routes: situations.map(s => s.label),
  assumptions: "authored times, documented binary strengths, fixed rolls",
  sample: table.filter(t => t.deadline !== "end" &&
    t.trait === "combined")
}, null, 2));
