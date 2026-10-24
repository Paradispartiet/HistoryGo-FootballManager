import { resolvePressEscapeEvidence } from "./football-live-tactical-exchange.js";

// Kampmotor v6: own collective pressing versus an opponent's build-up.
// The outcome of ONE linked chain is priced before period chance generation.
// FIFA/England Football support the principles, not these game probability values.
const ROUTES = Object.freeze({
  front_press: {
    plans: ["high_press_343"],
    opponentMetric: "shortBuildUp", opponentMin: 65,
    positions: [["ST"], ["LW", "RW", "WB", "LB", "RB"], ["DM", "CM"], ["CB"]],
    metrics: ["pressScore", "balanceScore", "restDefenseScore"],
    steps: [
      "Spissen styrer motstanderens første oppspill til én side",
      "Kant eller vingback presser mottakeren samtidig",
      "Midtbanen skjermer støttepasningen og returen",
      "Stopperleddet sikrer rommet bak når presset utløses"
    ],
    regain: "Samordnet førsteforsvar og pasningsdekning vinner ballen høyt.",
    xgFor: 0.11
  },
  midfield_trap: {
    plans: ["midfield_press_trap"],
    opponentMetric: "possessionControl", opponentMin: 65,
    positions: [["ST", "AM"], ["DM", "CM"], ["CM", "DM", "AM"], ["CB"]],
    metrics: ["pressScore", "balanceScore", "restDefenseScore"],
    steps: [
      "Fremste ledd lar ballen spilles inn i midtbaneområdet",
      "Sekseren skjermer sentral mottaker",
      "Neste midtbanespiller presser på avtalt pasningssignal",
      "Stopperne sikrer rommet når ballen brytes"
    ],
    regain: "Kollektiv midtbanefelle stenger mottakerens neste pasning og gir gjenvinning.",
    xgFor: 0.08
  },
  recovery_press: {
    plans: ["counter_press_recovery"],
    opponentMetric: "transitionThreat", opponentMin: 66,
    positions: [["ST", "LW", "RW", "AM"], ["DM", "CM"], ["CB"]],
    metrics: ["pressScore", "restDefenseScore", "balanceScore"],
    steps: [
      "Et balltap setter motstanderens overgang i gang",
      "Nærmeste angrepsspiller setter inn umiddelbart press",
      "Midtbanen stenger første vertikale pasning",
      "Stopperen sikrer rommet bak presset og angriper returen"
    ],
    regain: "Kollektivt gjenvinningspress hindrer første utpasning og vinner andreballen.",
    xgFor: 0.08
  }
});
// Counterplay is a second, route-specific four-action chain. The named
// mechanisms are tactical hypotheses, not observed passes or positional data.
// Preserve the existing probabilistic model until route-specific effects are
// separately falsified; this layer records *which* space is attacked and what
// prevents or completes the outlet, without awarding a second xG event.
// Third-player: first pass, lay-off, blind-side run, through pass (FIFA).
// Switch: attract pressure, release, weak-side receiver, exploit far flank (FIFA).
const PRESS_EXIT_PATHWAYS = Object.freeze({
  third_man: Object.freeze({
    label: "Tredjemann gjennom midtbanen",
    exposedChannel: "central_between_lines",
    actions: Object.freeze([
      "Første pasning finner en mottaker under sentralt press",
      "Mottakeren legger av til en støttepasning bak presslinjen",
      "Tredjemann tar et timet løp utenfor markeringen",
      "Neste pasning finner tredjemann i rommet bak midtbanen"
    ]),
    containedCause: "Motstanderens avlegg og tredjemannsløp bryter midtbanepresset, men sikringen fanger løperen.",
    escapedCause: "Motstanderen bruker avlegg og tredjemannsløp til å angripe rommet bak midtbanepresset."
  }),
  switch_play: Object.freeze({
    label: "Sideskift til motsatt kant",
    exposedChannel: "far_side_wide",
    actions: Object.freeze([
      "Motstanderen samler ball og støtte på én side og trekker presset dit",
      "En bakover- eller tverrpasning frigjør tid til å vende",
      "Et raskt sideskift finner mottaker på motsatt side",
      "Mottakeren angriper ytre korridor før sikringen rekker over"
    ]),
    containedCause: "Motstanderen vender spillet forbi ballsidepresset, men restforsvaret dekker den motsatte kanten.",
    escapedCause: "Motstanderen vender raskt fra ballside til motsatt kant og angriper rommet bak sidesikringen."
  }),
  direct: Object.freeze({
    label: "Direkte utspill bak presset",
    exposedChannel: "depth_behind_press",
    actions: Object.freeze([
      "Ballfører leser pressleddet og søker direkte pasning",
      "Laget spiller tidlig over eller gjennom første pressledd",
      "Fremre mottaker tar imot bak pressutløseren",
      "Støtteløpet angriper rommet før laget rekker å reorganisere"
    ]),
    containedCause: "Motstanderen går direkte forbi første pressledd, men restforsvaret kontrollerer mottakeren.",
    escapedCause: "Motstanderen spiller direkte bak pressleddet og angriper rommet før sikringen er på plass."
  })
});

// Route-specific defensive replies inspect real formation slots, player role
// evidence and existing team metrics. They describe *possible* protection,
// not a free probability/xG boost and not observed player coordinates.
// Without a documented target flank, both backs must be known for a switch.
// With an explicitly documented DEFENDING-team left/right target flank, inspect
// only that flank. This is nominal formation coverage, not live tracking data.
const PRESS_EXIT_DEFENCES = Object.freeze({
  third_man: Object.freeze({
    id: "screen_layoff_and_track_third_runner",
    title: "Sikre avlegget og følge tredjemann",
    target: "central_between_lines",
    actions: Object.freeze([
      "Sekseren skygger avlegget til støttepasningen",
      "Nærmeste indreløper følger tredjemannsbevegelsen",
      "Midtstopperen holder igjen og sikrer mellomrommet",
      "Bakre ledd møter gjennomspillet uten å åpne rom sentralt"
    ])
  }),
  switch_play: Object.freeze({
    id: "recover_far_side_and_hold_width",
    title: "Forskyve og sikre motsatt kant",
    target: "far_side_wide",
    actions: Object.freeze([
      "Ballsidepresset holder igjen den første vendingen",
      "Midtbanen flytter samlet idet pasningen vendes",
      "Motsatt back sikrer ytterkorridoren",
      "Bakre ledd beskytter boksen mens kanten får støtte"
    ])
  }),
  direct: Object.freeze({
    id: "hold_depth_and_compete_for_second_ball",
    title: "Sikre dybden og andreballen",
    target: "depth_behind_press",
    actions: Object.freeze([
      "Første stopper faller av foran den direkte pasningen",
      "Andre stopper dekker mottakerens første berøring",
      "Sekseren orienterer seg mot nedfalls- eller avleggsrommet",
      "Bakre ledd står igjen for å stoppe løpet etter mottaket"
    ])
  })
});

function defensiveReplyForPressExit(route, lineup, profile, outcome, targetFlank = null) {
  const config = PRESS_EXIT_DEFENCES[route];
  if (!config) return null;
  const all = Array.isArray(lineup) ? lineup : [];
  const known = all.filter(player => player?.playerId &&
    player.matchFitKnown === true && finite(player.matchScore) &&
    typeof player.roleId === "string" && player.roleId.length);
  const list = (positions, roles = null) => known.filter(player =>
    positions.includes(player.position) &&
    (!roles || roles.includes(player.roleId))).map(player => player.playerId);
  const screeningSix = list(["DM", "CM"], ["balancing_six"]);
  const pressingMidfielder = list(["CM", "DM"], ["pressing_midfielder"]);
  const leftSupport = list(["LB"], ["support_fullback"]);
  const rightSupport = list(["RB"], ["support_fullback"]);
  const documentedFlank = route === "switch_play" &&
    ["left", "right"].includes(targetFlank) ? targetFlank : null;
  const targetSideSupport = documentedFlank === "left" ? leftSupport :
    documentedFlank === "right" ? rightSupport : [...leftSupport, ...rightSupport];
  const centralBacks = list(["CB"]);
  const knownTacticalRoles = known.some(player => [
    "balancing_six", "pressing_midfielder", "support_fullback",
    "overlapping_fullback", "ball_playing_centre_back", "wingback"
  ].includes(player.roleId));
  const sufficientEvidence = known.length >= 10 && knownTacticalRoles &&
    finite(profile?.balanceScore) && finite(profile?.restDefenseScore);
  const roleSupported = route === "third_man"
    ? screeningSix.length > 0 && pressingMidfielder.length > 0
    : route === "switch_play"
      ? documentedFlank ? targetSideSupport.length > 0 :
        leftSupport.length > 0 && rightSupport.length > 0
      : centralBacks.length >= 2 && screeningSix.length > 0;
  const activeCover = route === "third_man"
    ? [...screeningSix, ...pressingMidfielder]
    : route === "switch_play"
      ? targetSideSupport
      : [...centralBacks, ...screeningSix];
  return {
    id: config.id, title: config.title, target: config.target,
    // Weak evidence must not be misreported as a tactical weakness.
    roleReadiness: !sufficientEvidence ? "unknown" :
      roleSupported ? "supported_by_roles" : "not_supported_by_checked_roles",
    simulatedResult: outcome === "regain" ? "not_required" :
      outcome === "contained" ? "stopped_attack" : "could_not_stop_attack",
    actions: config.actions.map((action, index) => ({
      action, result: outcome === "regain" ? "not_required" :
        outcome === "contained" && index === 3 ? "completed" :
          outcome === "escaped" && index === 3 ? "breached" : "attempted"
    })),
    evidence: {
      supportingPlayerIds: [...new Set(activeCover)],
      screenedCentralBy: screeningSix, thirdRunnerTrackedBy: pressingMidfielder,
      farSideBackCandidates: { left: leftSupport, right: rightSupport },
      documentedTargetFlank: documentedFlank,
      availableCentreBacks: centralBacks,
      formationPositions: known.map(player => player.position),
      balanceScore: finite(profile?.balanceScore) ? profile.balanceScore : null,
      restDefenseScore: finite(profile?.restDefenseScore) ? profile.restDefenseScore : null
    },
    basis: "documented_lineup_roles_and_calculated_team_metrics",
    // Press probability is unchanged; only downstream containment is conditional.
    probabilityAdjustment: 0
  };
}

// Recovery timing is an OPTIONAL authored-scenario input, never inferred from
// positions, player fit, or tactical labels. All complementary specialists must
// reach their cover positions before the documented attacking outlet deadline.
// The timing result only GATES the existing <=0.03 coordination bonus: it
// cannot penalise generic rest defence, alter initial pressure or add xG.
// Missing / untrusted timing data preserves the previous baseline exactly.
// Each route has four named post-break attack decisions. Durations are
// explicitly authored and start AFTER the first press has been beaten. The
// scenario does not assert that these were observed movements or GPS points.
const PRESS_EXIT_TIMED_ACTIONS = Object.freeze({
  third_man: Object.freeze(["receive", "layoff", "third_runner", "through_pass"]),
  switch_play: Object.freeze(["receive", "release", "switch_pass", "wide_attack"]),
  direct: Object.freeze(["receive", "direct_ball", "first_touch", "support_run"])
});

// Named defensive tasks pair an actual change of defensive responsibility
// with the *next attacking action* it must prevent. These are authored
// tactical contracts; neither movement times nor positions are inferred.
// A chain is evaluated IN ORDER, with no reset of the defender's clock.
// This is the same single route-cover gate, not one modifier per transition.
const PRESS_EXIT_DEFENSIVE_TASKS = Object.freeze({
  third_man: Object.freeze({
    screen_layoff: "layoff",
    follow_third_runner: "third_runner",
    drop_for_through_pass: "through_pass"
  }),
  switch_play: Object.freeze({
    delay_release: "release",
    shift_to_far_side: "switch_pass",
    hold_wide_channel: "wide_attack"
  }),
  direct: Object.freeze({
    drop_behind_press: "direct_ball",
    challenge_first_touch: "first_touch",
    protect_support_run: "support_run"
  })
});

// Resolve authored action durations and each specialist's independent
// recognition + repositioning delays, anchored to an optional named cue.
// No time is inferred from ratings,
// nominal formations, historical players, or a generic 'fast' tactic tag.
// Optional discrete geometry is an AUTHORED scenario calculation, not
// observed tracking or a movement speed derived from a player's skill score.
// The pitch size must be explicit; coordinates use metres from a shared
// defending-team viewpoint (x across the width, y along the length).
function authoredCoverMove(response, sequence) {
  const withSeconds = Object.prototype.hasOwnProperty.call(response, "coverMoveSeconds");
  const withGeometry = Object.prototype.hasOwnProperty.call(response, "coverMovement");
  // Both modes supplied (or neither) is ambiguous and cannot earn cover.
  if (withSeconds === withGeometry) return null;
  if (withSeconds) return finite(response.coverMoveSeconds) &&
    response.coverMoveSeconds >= 0 && response.coverMoveSeconds <= 20
    ? { seconds: response.coverMoveSeconds, model: "authored_move_seconds" } : null;
  const pitch = sequence.pitchDimensionsMeters;
  const movement = response.coverMovement;
  if (!pitch || typeof pitch !== "object" || Array.isArray(pitch) ||
    !finite(pitch.widthMeters) || pitch.widthMeters < 45 || pitch.widthMeters > 90 ||
    !finite(pitch.lengthMeters) || pitch.lengthMeters < 90 || pitch.lengthMeters > 120 ||
    !movement || typeof movement !== "object" || Array.isArray(movement) ||
    movement.basis !== "authored_pitch_geometry" ||
    !finite(movement.averageSpeedMetersPerSecond) ||
    movement.averageSpeedMetersPerSecond < 0.5 ||
    movement.averageSpeedMetersPerSecond > 10) return null;
  const validPoint = point => point && typeof point === "object" &&
    !Array.isArray(point) && finite(point.x) && finite(point.y) &&
    point.x >= 0 && point.x <= pitch.widthMeters &&
    point.y >= 0 && point.y <= pitch.lengthMeters;
  if (!validPoint(movement.startMeters) || !validPoint(movement.coverMeters))
    return null;
  const dx = movement.coverMeters.x - movement.startMeters.x;
  const dy = movement.coverMeters.y - movement.startMeters.y;
  const distanceMeters = Math.hypot(dx, dy);
  const seconds = distanceMeters / movement.averageSpeedMetersPerSecond;
  return finite(seconds) && seconds <= 20
    ? { seconds, model: "authored_pitch_geometry" } : null;
}

// Optional *route-specific* lane contract. These fractions are EXPLICIT game
// zoning conventions (central half / outer quarter / defending half), not
// inferred tracking coordinates or evidence that a real player occupied them.
// A scenario with such a contract must assign all route specialists geometry
// inside the SAME defended channel. Older scenarios remain fully compatible.
function authoredLaneCheck(route, sequence, playerIds, targetFlank) {
  const lane = sequence.spatialLane;
  if (lane == null) return "not_provided";
  const pitch = sequence.pitchDimensionsMeters;
  const expectedChannel = PRESS_EXIT_DEFENCES[route]?.target;
  if (!lane || typeof lane !== "object" || Array.isArray(lane) ||
    lane.basis !== "authored_route_lane" || lane.route !== route ||
    lane.channel !== expectedChannel ||
    lane.coordinateFrame !== "defending_goal_y0_right_xmax" ||
    !pitch || !finite(pitch.widthMeters) || !finite(pitch.lengthMeters))
    return "invalid";
  const side = lane.targetFlank;
  if (route === "switch_play") {
    if (!["left", "right"].includes(side) || side !== targetFlank) return "invalid";
  } else if (Object.prototype.hasOwnProperty.call(lane, "targetFlank"))
    return "invalid";
  // Invalid or missing movement evidence cannot claim a known positional
  // error. Only a VALID authored endpoint in the wrong defensive lane
  // produces a genuine tactical failure rather than a neutral fallback.
  const moves = playerIds.map(id =>
    sequence.defenderResponsesByPlayerId?.[id]?.coverMovement);
  if (moves.some((move, i) =>
    move?.basis !== "authored_pitch_geometry" ||
    !authoredCoverMove(sequence.defenderResponsesByPlayerId[playerIds[i]], sequence)))
    return "invalid";
  const isAligned = point => {
    if (route === "third_man")
      return point.x >= pitch.widthMeters * 0.25 &&
        point.x <= pitch.widthMeters * 0.75;
    if (route === "switch_play")
      return side === "left"
        ? point.x <= pitch.widthMeters * 0.25
        : point.x >= pitch.widthMeters * 0.75;
    return route === "direct" && point.y <= pitch.lengthMeters * 0.5;
  };
  return moves.every(move => isAligned(move.coverMeters))
    ? "aligned" : "wrong_corridor";
}

// v7: modest causal sensitivity to independently sourced PLAYER strengths.
// These are explicit GAME calibration factors, not measured running speeds.
// They shorten only the supplied, authored action timings; missing skills
// leave those timings untouched. Never invent a sequence from team ratings.
// One task's total saving is bounded to 0.25 seconds, with no xG multiplier.
function sourcedDefensiveTaskTiming(playerId, lineup, recognitionSeconds, moveSeconds, taskId = null) {
  const player = Array.isArray(lineup)
    ? lineup.find(entry => entry?.playerId === playerId) : null;
  const sourced = Array.isArray(player?.sourcedDefensiveReactionSkills)
    ? player.sourcedDefensiveReactionSkills : [];
  const valid = new Set(["pace", "positioning", "anticipation", "game_reading",
    "defensive_reading", "marking", "tackling"]);
  const skills = [...new Set(sourced.filter(skill => valid.has(skill)))];
  const recognition = skills.some(skill =>
    ["anticipation", "game_reading", "defensive_reading"].includes(skill))
    ? recognitionSeconds * 0.75 : recognitionSeconds;
  let move = moveSeconds * (skills.includes("pace") ? 0.80 : 1) *
    (skills.includes("positioning") ? 0.90 : 1);
  // A documented defensive strength helps with the actual contest, not an
  // unrelated covering run or a positional assignment.
  if (taskId && ["challenge_first_touch", "follow_third_runner",
    "protect_support_run"].includes(taskId) &&
    skills.some(skill => ["marking", "tackling"].includes(skill)))
    move *= 0.92;
  const saving = recognitionSeconds + moveSeconds - recognition - move;
  const scale = saving > 0.25 ? 0.25 / saving : 1;
  const result = {
    recognitionSeconds: recognitionSeconds - (recognitionSeconds - recognition) * scale,
    moveSeconds: moveSeconds - (moveSeconds - move) * scale,
    secondsSaved: Math.round(Math.min(0.25, saving) * 1000) / 1000,
    // Report only traits that had a relevant effect on this task.
    skills: [
      ...skills.filter(skill => ["anticipation", "game_reading",
        "defensive_reading"].includes(skill) && recognitionSeconds > 0),
      ...skills.filter(skill => ["pace", "positioning"].includes(skill) && moveSeconds > 0),
      ...skills.filter(skill => ["marking", "tackling"].includes(skill) && moveSeconds > 0 &&
        ["challenge_first_touch", "follow_third_runner", "protect_support_run"].includes(taskId))
    ]
  };
  return result;
}

function recoveryFromAuthoredActions(route, playerIds, sequence, lineup, targetFlank) {
  const expected = PRESS_EXIT_TIMED_ACTIONS[route];
  if (!expected || sequence?.route !== route ||
    !Array.isArray(sequence.actions) || sequence.actions.length !== expected.length ||
    !sequence.actions.every((entry, index) =>
      entry?.id === expected[index] && finite(entry.durationSeconds) &&
      entry.durationSeconds > 0 && entry.durationSeconds <= 20)) return null;
  const attackWindowSeconds = sequence.actions.reduce(
    (total, entry) => total + entry.durationSeconds, 0);
  if (attackWindowSeconds > 20) return null;
  const responses = sequence.defenderResponsesByPlayerId;
  if (!responses || typeof responses !== "object" || Array.isArray(responses) ||
    !Array.isArray(playerIds) || playerIds.length === 0) return null;
  const laneStatus = authoredLaneCheck(route, sequence, playerIds, targetFlank);
  if (laneStatus === "invalid") return null;
  const defenderArrivalSecondsByPlayerId = {};
  const defenderDeadlineSecondsByPlayerId = {};
  const defenderTransitionStages = [];
  const defenderSkillTiming = [];
  let defenderCoverHandoff = null;
  let usesIndividualDeadline = false;
  const movementModels = new Set();
  for (const id of playerIds) {
    const response = Object.prototype.hasOwnProperty.call(responses, id)
      ? responses[id] : null;
    if (!response || typeof response !== "object" || Array.isArray(response))
      return null;
    // An optional sequential reply replaces, rather than stacks on top of,
    // the legacy single-response model. A defender starts each next move no
    // earlier than BOTH the named cue and the end of the previous move.
    if (Object.prototype.hasOwnProperty.call(response, "defensiveActionChain")) {
      const tasks = PRESS_EXIT_DEFENSIVE_TASKS[route];
      const stages = response.defensiveActionChain;
      if (laneStatus !== "not_provided" ||
        ["recognitionDelaySeconds", "coverMoveSeconds", "coverMovement",
          "triggerActionId", "sourcedCue", "mustCoverByActionId"]
          .some(key => Object.prototype.hasOwnProperty.call(response, key)) ||
        !Array.isArray(stages) || stages.length < 2 || stages.length > 3)
        return null;
      let previousCompletion = 0;
      let previousTaskIndex = -1;
      let previousDeadlineIndex = -1;
      const taskNames = Object.keys(tasks);
      for (const stage of stages) {
        if (!stage || typeof stage !== "object" || Array.isArray(stage) ||
          !Object.prototype.hasOwnProperty.call(tasks, stage.taskId) ||
          !Object.prototype.hasOwnProperty.call(stage, "triggerActionId") ||
          !finite(stage.recognitionDelaySeconds) ||
          stage.recognitionDelaySeconds < 0 ||
          stage.recognitionDelaySeconds > 20) return null;
        const taskIndex = taskNames.indexOf(stage.taskId);
        const deadlineActionId = tasks[stage.taskId];
        const deadlineIndex = expected.indexOf(deadlineActionId);
        const cueIndex = expected.indexOf(stage.triggerActionId);
        // A reply cannot be completed before it is triggered, skip back to a
        // previous task, or count two independent moves for the same deadline.
        if (cueIndex < 0 || cueIndex >= deadlineIndex ||
          deadlineIndex <= previousDeadlineIndex ||
          taskIndex <= previousTaskIndex) return null;
        const move = authoredCoverMove(stage, sequence);
        // Explicit times are supported for these named sub-corridors.
        // Unverified geometry across different corridors is NOT.
        if (move?.model !== "authored_move_seconds") return null;
        const cueSeconds = sequence.actions.slice(0, cueIndex)
          .reduce((sum, action) => sum + action.durationSeconds, 0);
        const deadlineSeconds = sequence.actions.slice(0, deadlineIndex)
          .reduce((sum, action) => sum + action.durationSeconds, 0);
        const skillTiming = sourcedDefensiveTaskTiming(id, lineup,
          stage.recognitionDelaySeconds, move.seconds, stage.taskId);
        if (skillTiming.secondsSaved > 0) defenderSkillTiming.push({
          defenderId: id, taskId: stage.taskId, skills: skillTiming.skills,
          secondsSaved: skillTiming.secondsSaved
        });
        const movementStartSeconds = Math.max(cueSeconds, previousCompletion) +
          skillTiming.recognitionSeconds;
        const completionSeconds = movementStartSeconds + skillTiming.moveSeconds;
        if (completionSeconds > 20) return null;
        defenderTransitionStages.push({
          defenderId: id, taskId: stage.taskId,
          triggerActionId: stage.triggerActionId, deadlineActionId,
          movementStartSeconds, completionSeconds, deadlineSeconds
        });
        previousCompletion = completionSeconds;
        previousTaskIndex = taskIndex;
        previousDeadlineIndex = deadlineIndex;
      }
      defenderArrivalSecondsByPlayerId[id] = previousCompletion;
      defenderDeadlineSecondsByPlayerId[id] = sequence.actions
        .slice(0, previousDeadlineIndex)
        .reduce((sum, action) => sum + action.durationSeconds, 0);
      usesIndividualDeadline = true;
      movementModels.add("authored_sequential_moves");
      continue;
    }
    if (!finite(response.recognitionDelaySeconds) ||
      response.recognitionDelaySeconds < 0 || response.recognitionDelaySeconds > 20)
      return null;
    const travel = authoredCoverMove(response, sequence);
    if (!travel) return null;
    movementModels.add(travel.model);
    // Recognition starts when the defender sees a named attacking cue.
    // No cue means the first action, preserving old scenario behaviour.
    const hasCue = Object.prototype.hasOwnProperty.call(response, "triggerActionId");
    const hasSourcedCue = Object.prototype.hasOwnProperty.call(response, "sourcedCue");
    if (hasCue && hasSourcedCue) return null;
    let cueId = hasCue ? response.triggerActionId : expected[0];
    if (hasSourcedCue) {
      const cue = response.sourcedCue;
      const validSkill = ["anticipation", "game_reading", "defensive_reading"]
        .includes(cue?.skill);
      if (!cue || typeof cue !== "object" || Array.isArray(cue) ||
        !validSkill || !expected.includes(cue.earlyActionId) ||
        !expected.includes(cue.defaultActionId) ||
        expected.indexOf(cue.earlyActionId) > expected.indexOf(cue.defaultActionId))
        return null;
      const player = Array.isArray(lineup)
        ? lineup.find(entry => entry?.playerId === id) : null;
      const sourceConfirmed = Array.isArray(player?.sourcedRecoverySkills) &&
        player.sourcedRecoverySkills.includes(cue.skill);
      cueId = sourceConfirmed ? cue.earlyActionId : cue.defaultActionId;
    }
    const cueIndex = expected.indexOf(cueId);
    if (cueIndex < 0) return null;
    const elapsedBeforeCue = sequence.actions.slice(0, cueIndex)
      .reduce((sum, action) => sum + action.durationSeconds, 0);
    const skillTiming = sourcedDefensiveTaskTiming(id, lineup,
      response.recognitionDelaySeconds, travel.seconds);
    if (skillTiming.secondsSaved > 0) defenderSkillTiming.push({
      defenderId: id, taskId: null, skills: skillTiming.skills,
      secondsSaved: skillTiming.secondsSaved
    });
    const arrival = elapsedBeforeCue + skillTiming.recognitionSeconds +
      skillTiming.moveSeconds;
    if (arrival > 20) return null;
    defenderArrivalSecondsByPlayerId[id] = arrival;
    // A specialist may have to seal a pass or runner BEFORE the next
    // attacking action begins, not just before this four-step move ends.
    // The optional deadline is an authored scenario premise, never a
    // duration inferred from player skills or formation.
    const hasDeadline = Object.prototype.hasOwnProperty.call(
      response, "mustCoverByActionId");
    const deadlineIndex = hasDeadline
      ? expected.indexOf(response.mustCoverByActionId) : expected.length;
    if (deadlineIndex < 0) return null;
    if (hasDeadline) usesIndividualDeadline = true;
    defenderDeadlineSecondsByPlayerId[id] = sequence.actions
      .slice(0, deadlineIndex)
      .reduce((sum, action) => sum + action.durationSeconds, 0);
  }
  // An authored handoff connects TWO of the existing route specialists.
  // The incoming player must take the shared corridor BEFORE the departing
  // defender starts moving toward his NEXT defensive task. Neither a second
  // bonus nor arbitrary new players are introduced by this contract.
  if (Object.prototype.hasOwnProperty.call(sequence, "defenderCoverHandoff")) {
    const h = sequence.defenderCoverHandoff;
    if (!h || typeof h !== "object" || Array.isArray(h) ||
      !playerIds.includes(h.fromDefenderId) ||
      !playerIds.includes(h.toDefenderId) ||
      h.fromDefenderId === h.toDefenderId ||
      h.coveredChannel !== PRESS_EXIT_DEFENCES[route].target)
      return null;
    // An unobserved target flank cannot be invented from a general
    // switch-play label. Require a named defensive side and two relevant
    // specialists on that side when a flank-specific handoff is claimed.
    if (route === "switch_play"
      ? !["left", "right"].includes(targetFlank) ||
        h.targetFlank !== targetFlank
      : Object.prototype.hasOwnProperty.call(h, "targetFlank"))
      return null;
    const sourceStages = defenderTransitionStages.filter(
      stage => stage.defenderId === h.fromDefenderId);
    const departingStage = sourceStages.find(
      stage => stage.taskId === h.releaseTaskId);
    const receiver = responses[h.toDefenderId];
    // Without explicit intermediate corridor occupancy, a receiver who is
    // already executing another chain cannot be asserted to still be here.
    if (sourceStages.indexOf(departingStage) < 1 ||
      Object.prototype.hasOwnProperty.call(receiver, "defensiveActionChain"))
      return null;
    defenderCoverHandoff = {
      fromDefenderId: h.fromDefenderId,
      toDefenderId: h.toDefenderId,
      coveredChannel: h.coveredChannel,
      releaseTaskId: h.releaseTaskId,
      releaseSeconds: departingStage.movementStartSeconds,
      takeoverSeconds: defenderArrivalSecondsByPlayerId[h.toDefenderId]
    };
  }
  return { basis: "authored_scenario", route, attackWindowSeconds,
    defenderArrivalSecondsByPlayerId,
    ...(usesIndividualDeadline ? { defenderDeadlineSecondsByPlayerId } : {}),
    ...(defenderTransitionStages.length ? { defenderTransitionStages } : {}),
    ...(defenderSkillTiming.length ? { defenderSkillTiming } : {}),
    ...(defenderCoverHandoff ? { defenderCoverHandoff } : {}),
    movementModel: movementModels.size === 1 ? [...movementModels][0] :
      "mixed_authored_responses",
    spatialLane: sequence.spatialLane?.channel || null,
    laneStatus };
}

// Recovery timing is OPTIONAL scenario input, never inferred from fitness,
// player fit or coordinates. A late specialist gates only an ALREADY earned
// route-specific coordination term; there is no new xG, time bonus or penalty.
function specialistRecoveryWindow(route, playerIds, timing, lineup, targetFlank) {
  const neutral = { status: "not_provided", basis: null,
    attackWindowSeconds: null, latestRecoverySeconds: null, marginSeconds: null,
    movementModel: null, spatialLane: null };
  if (timing == null) return neutral;
  const invalid = { ...neutral, status: "invalid_or_incomplete" };
  if (!timing || typeof timing !== "object" || Array.isArray(timing)) return invalid;
  const isSequence = timing.basis === "authored_action_sequence";
  const derived = isSequence
    ? recoveryFromAuthoredActions(route, playerIds, timing, lineup, targetFlank) : timing;
  if (!derived || derived.basis !== "authored_scenario" ||
    derived.route !== route || !finite(derived.attackWindowSeconds) ||
    derived.attackWindowSeconds <= 0 || derived.attackWindowSeconds > 20 ||
    !derived.defenderArrivalSecondsByPlayerId ||
    typeof derived.defenderArrivalSecondsByPlayerId !== "object" ||
    Array.isArray(derived.defenderArrivalSecondsByPlayerId) ||
    !Array.isArray(playerIds) || playerIds.length === 0) return invalid;
  const arrival = playerIds.map(id =>
    Object.prototype.hasOwnProperty.call(derived.defenderArrivalSecondsByPlayerId, id)
      ? derived.defenderArrivalSecondsByPlayerId[id] : null);
  if (!arrival.every(time => finite(time) && time >= 0 && time <= 20))
    return invalid;
  const latest = Math.max(...arrival);
  const actionDeadlines = isSequence
    ? derived.defenderDeadlineSecondsByPlayerId : null;
  const deadlineSeconds = actionDeadlines
    ? playerIds.map(id => Object.prototype.hasOwnProperty.call(actionDeadlines, id)
      ? actionDeadlines[id] : null)
    : playerIds.map(() => derived.attackWindowSeconds);
  if (!deadlineSeconds.every(time => finite(time) &&
    time >= 0 && time <= derived.attackWindowSeconds)) return invalid;
  const transitionStages = isSequence ? derived.defenderTransitionStages : null;
  // Every required earlier task is decisive even if the defender reaches the
  // FINAL corridor on time. The smallest margin across ALL required tasks
  // controls the single existing containment adjustment.
  const candidates = [
    ...(transitionStages || []).map(stage => ({
      defenderId: stage.defenderId, taskId: stage.taskId,
      arrival: stage.completionSeconds, deadline: stage.deadlineSeconds
    })),
    ...(isSequence && derived.defenderCoverHandoff ? [{
      defenderId: derived.defenderCoverHandoff.toDefenderId,
      taskId: null, handoff: derived.defenderCoverHandoff,
      arrival: derived.defenderCoverHandoff.takeoverSeconds,
      deadline: derived.defenderCoverHandoff.releaseSeconds
    }] : []),
    ...playerIds.map((id, i) => ({
      defenderId: id, taskId: null,
      arrival: arrival[i], deadline: deadlineSeconds[i]
    }))
  ];
  const critical = candidates.reduce((a, b) =>
    b.deadline - b.arrival < a.deadline - a.arrival ? b : a);
  const margin = critical.deadline - critical.arrival;
  return {
    status: isSequence && derived.laneStatus === "wrong_corridor"
      ? "wrong_corridor" : margin >= 0 ? "in_time" : "late",
    basis: isSequence ? "authored_action_sequence" : "authored_scenario",
    attackWindowSeconds: Math.round(derived.attackWindowSeconds * 1000) / 1000,
    latestRecoverySeconds: Math.round(latest * 1000) / 1000,
    marginSeconds: Math.round(margin * 1000) / 1000,
    movementModel: isSequence ? derived.movementModel : null,
    spatialLane: isSequence ? derived.spatialLane : null,
    ...(isSequence && derived.defenderSkillTiming?.length ? {
      defenderSkillTiming: derived.defenderSkillTiming
    } : {}),
    ...(actionDeadlines ? {
      deadlineModel: "per_defender_action_start",
      criticalDefenderId: critical.defenderId,
      criticalDeadlineSeconds: Math.round(critical.deadline * 1000) / 1000,
      ...(critical.taskId ? { criticalTaskId: critical.taskId } : {}),
      ...(critical.handoff ? { criticalHandoff: {
        fromDefenderId: critical.handoff.fromDefenderId,
        toDefenderId: critical.handoff.toDefenderId,
        releaseTaskId: critical.handoff.releaseTaskId
      } } : {})
    } : {}),
    ...(isSequence && derived.defenderCoverHandoff ? {
      coverHandoff: {
        fromDefenderId: derived.defenderCoverHandoff.fromDefenderId,
        toDefenderId: derived.defenderCoverHandoff.toDefenderId,
        coveredChannel: derived.defenderCoverHandoff.coveredChannel,
        releaseTaskId: derived.defenderCoverHandoff.releaseTaskId,
        releaseSeconds: round3(derived.defenderCoverHandoff.releaseSeconds),
        takeoverSeconds: round3(derived.defenderCoverHandoff.takeoverSeconds),
        marginSeconds: round3(derived.defenderCoverHandoff.releaseSeconds -
          derived.defenderCoverHandoff.takeoverSeconds),
        status: derived.defenderCoverHandoff.takeoverSeconds <=
          derived.defenderCoverHandoff.releaseSeconds ? "in_time" : "late"
      }
    } : {}),
    ...(transitionStages?.length ? {
      defensiveSequenceModel: "sequential_defender_tasks",
      defensiveTransitions: transitionStages.map(stage => ({
        defenderId: stage.defenderId, taskId: stage.taskId,
        triggerActionId: stage.triggerActionId,
        deadlineActionId: stage.deadlineActionId,
        completionSeconds: round3(stage.completionSeconds),
        deadlineSeconds: round3(stage.deadlineSeconds),
        marginSeconds: round3(stage.deadlineSeconds - stage.completionSeconds),
        status: stage.completionSeconds <= stage.deadlineSeconds ?
          "in_time" : "late"
      }))
    } : {})
  };
}

// Stage two only: a documented offensive escape meets the *matching*
// defensive reply. The small additional coverage term is a bounded GAME
// HYPOTHESIS, not an empirically calibrated percentage. It is earned only by
// known, correct complementary roles with a verified real match-fit score.
// Unknown scouting/fit gets 0, never a fictitious weakness or free bonus.
// Existing aggregate rest-defence/balance metrics remain the base probability;
// this additional term measures route-specific COORDINATION, once per phase.
function routeCoverEvidence(opponentRoute, escapeEvidence, lineup, profile, targetFlank, timingInput) {
  const neutral = { adjustment: 0, weakestCoverFit: null, timing: {
    status: "not_applicable", basis: null, attackWindowSeconds: null,
    latestRecoverySeconds: null, marginSeconds: null
  } };
  if (escapeEvidence !== "supported" ||
    !Object.prototype.hasOwnProperty.call(PRESS_EXIT_DEFENCES, opponentRoute))
    return neutral;
  const reply = defensiveReplyForPressExit(opponentRoute, lineup, profile, "preflight", targetFlank);
  if (reply?.roleReadiness !== "supported_by_roles") return neutral;
  const ids = reply.evidence.supportingPlayerIds;
  if (!ids.length) return neutral;
  const scores = ids.map(id => lineup.find(player =>
    player?.playerId === id && player.matchFitKnown === true &&
    finite(player.matchScore))?.matchScore);
  if (scores.length !== ids.length || !scores.every(finite)) return neutral;
  const weakestCoverFit = Math.min(...scores);
  // Missing authored timing never changes existing gameplay. Fully evidenced
  // late coordination forfeits ONLY the specialist term already earned.
  const timing = specialistRecoveryWindow(opponentRoute, ids, timingInput, lineup, targetFlank);
  const specialistAdjustment = clamp((weakestCoverFit - 60) * 0.0015, 0, 0.03);
  return {
    adjustment: ["late", "wrong_corridor"].includes(timing.status)
      ? 0 : specialistAdjustment,
    weakestCoverFit,
    timing
  };
}

// The tactical replay can explain the decisive COVER failure without
// pretending to have live tracking data. Explanations are descriptive only:
// the probability and the single terminal xG result remain unchanged.
const DEFENSIVE_TASK_LABELS = Object.freeze({
  screen_layoff: "skjermingen av avlegget",
  follow_third_runner: "følgingen av tredjemann",
  drop_for_through_pass: "fallet mot gjennomspillet",
  delay_release: "forsinkelsen av vendingen",
  shift_to_far_side: "forskyvningen mot motsatt side",
  hold_wide_channel: "sikringen av ytterkorridoren",
  drop_behind_press: "fallet bak pressleddet",
  challenge_first_touch: "presset mot førsteberøringen",
  protect_support_run: "sikringen av støtteløpet"
});

function explainDefensiveCoverTiming(timing) {
  if (!timing || timing.status === "not_applicable" ||
    timing.status === "not_provided") return {
    kind: "unknown", label: "Sikring uten tidsmåling",
    description: "Ingen dokumenterte individuelle sikringstider er tilgjengelige."
  };
  if (timing.status === "invalid_or_incomplete") return {
    kind: "unknown", label: "Uavklart sikringsforløp",
    description: "Sikringsdataene er ufullstendige eller motstridende. Det er ikke påvist en defensiv tidsfeil."
  };
  if (timing.status === "wrong_corridor") return {
    kind: "wrong_corridor", label: "Feil sikringsrom",
    description: "Forsvaret rekker frem, men sikrer ikke den dokumenterte angrepskorridoren."
  };
  if (timing.status === "in_time") return {
    kind: "in_time", label: "Sikringen er på plass",
    description: (timing.coverHandoff
      ? "Sikringsbyttet og de nødvendige defensive handlingene ble fullført innen fristene."
      : "De defensive handlingene ble fullført innen fristene.") +
      (timing.defenderSkillTiming?.length
        ? " Kildebelagte spilleregenskaper forkortet reaksjons- eller forflytningstiden i simuleringen."
        : "")
  };
  if (timing.status === "late" && timing.criticalHandoff) return {
    kind: "late_handoff", label: "For sent sikringsbytte",
    description: "Avløseren nådde sikringskorridoren etter at første forsvarer startet sin neste oppgave."
  };
  if (timing.status === "late" && timing.criticalTaskId) return {
    kind: "late_task", label: "For sen defensiv handling",
    description: "Forsvaret kom for sent med " +
      (DEFENSIVE_TASK_LABELS[timing.criticalTaskId] || "den nødvendige sikringsoppgaven") +
      "."
  };
  return {
    kind: "late_recovery", label: "For sen sikring",
    description: "En nødvendig forsvarer nådde ikke sikringsrommet innen sin dokumenterte frist."
  };
}

function counterplayForPressExit(opponentRoute, escapeEvidence, outcome, lineup, profile, cover, targetFlank, adaptiveChoice = null) {
  // An explicit observation of isolation overrides an older authored route.
  // A generic 'supported' observation with no named route must not invent one.
  if (escapeEvidence !== "supported" ||
    !Object.prototype.hasOwnProperty.call(PRESS_EXIT_PATHWAYS, opponentRoute)) return null;
  const pathway = PRESS_EXIT_PATHWAYS[opponentRoute];
  const advancedFullbacks = Array.isArray(lineup) && opponentRoute === "switch_play"
    ? lineup.filter(player => ["LB", "RB"].includes(player.position) &&
        player.roleId === "overlapping_fullback")
      .map(player => player.playerId) : [];
  return {
    pathwayId: opponentRoute, label: pathway.label,
    documentedTargetFlank: adaptiveChoice ? null : targetFlank,
    ...(adaptiveChoice ? {
      simulatedTargetFlank: targetFlank,
      opponentAdaptation: {
        policy: "weakest_verified_flank",
        selectedFlank: targetFlank,
        reason: adaptiveChoice.reason,
        basis: adaptiveChoice.basis
      }
    } : {}),
    exposedChannel: pathway.exposedChannel,
    basis: "simulated_tactical_hypothesis_v6",
    status: outcome === "regain" ? "prevented" :
      outcome === "contained" ? "contained_by_rest_defence" : "progressed",
    actions: pathway.actions.map((action, index) => ({
      action, result: outcome === "regain"
        ? index === 0 ? "interrupted" : "not_reached"
        : index === pathway.actions.length - 1 && outcome === "contained"
          ? "contained" : "completed"
    })),
    // This is descriptive role evidence. Rest-defence already affects the
    // containment probability; never count these advanced backs a second time.
    advancedFullbacks,
    defensiveReply: {
      ...defensiveReplyForPressExit(opponentRoute, lineup, profile, outcome, targetFlank),
      ...(adaptiveChoice ? { evidence: {
        ...defensiveReplyForPressExit(opponentRoute, lineup, profile, outcome, targetFlank).evidence,
        documentedTargetFlank: null, simulatedTargetFlank: targetFlank
      } } : {}),
      containmentAdjustment: round3(cover.adjustment),
      weakestCoverFit: cover.weakestCoverFit,
      coverTiming: cover.timing,
      coverTimingExplanation: explainDefensiveCoverTiming(cover.timing)
    },
    containedCause: pathway.containedCause,
    escapedCause: pathway.escapedCause
  };
}

const finite = n => typeof n === "number" && Number.isFinite(n);
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const round3 = n => Math.round(n * 1000) / 1000;

function distinctSupport(lineup, groups) {
  if (!Array.isArray(lineup)) return null;
  const used = new Set(), selected = [];
  for (const positions of groups) {
    const player = lineup.filter(p => p?.playerId &&
      !used.has(p.playerId) && p.matchFitKnown === true &&
      finite(p.matchScore) && positions.includes(p.position))
      .sort((a,b) => b.matchScore - a.matchScore)[0];
    if (!player) return null;
    used.add(player.playerId);
    selected.push(player);
  }
  return selected;
}


// v7.1 opponent choice: a KNOWN wide-escape route may select the weaker
// VERIFIED defensive flank. The opt-in describes a simulated tactical
// decision, not historical scouting or hidden positional tracking.
// We require both backs and their role fits, so missing data is not treated
// as proof of a defensive weakness. Tied or near-equal fits are neutral.
function selectVerifiedWeakFlank(lineup, profile) {
  if (!Array.isArray(lineup) || !finite(profile?.balanceScore) ||
    !finite(profile?.restDefenseScore)) return null;
  const known = lineup.filter(player => player?.playerId &&
    player.matchFitKnown === true && finite(player.matchScore) &&
    typeof player.roleId === "string" && player.roleId.length);
  if (known.length < 10) return null;
  const back = position => {
    const candidates = lineup.filter(player => player?.position === position);
    if (candidates.length !== 1) return null;
    const p = candidates[0];
    return p?.playerId && p.matchFitKnown === true &&
      finite(p.matchScore) && p.matchScore >= 0 && p.matchScore <= 100 &&
      typeof p.roleId === "string" && p.roleId.length ? p : null;
  };
  const left = back("LB");
  const right = back("RB");
  if (!left || !right || left.playerId === right.playerId) return null;
  const leftCovered = left.roleId === "support_fullback";
  const rightCovered = right.roleId === "support_fullback";
  // No evidence of ANY supported wide cover: do not rank two unknown gaps.
  if (!leftCovered && !rightCovered) return null;
  if (leftCovered !== rightCovered) return {
    flank: leftCovered ? "right" : "left",
    reason: "verified_role_coverage_gap",
    basis: "known_formation_roles_and_fit"
  };
  // A 5-point game-model threshold avoids arbitrary switches on tiny fit
  // differences. Ratings remain role-match evidence, not measured speed.
  if (Math.abs(left.matchScore - right.matchScore) < 5) return null;
  return {
    flank: left.matchScore < right.matchScore ? "left" : "right",
    reason: "weaker_documented_role_fit",
    basis: "known_formation_roles_and_fit"
  };
}


// v7.2: an opponent may CHOOSE only among explicitly supplied, independently
// verified available outlets. Neither generic possession ratings nor the
// defending XI create an attacking route. Each candidate uses the existing
// single cover gate; unknown evidence or near-ties yield no inferred route.
const VERIFIED_OUTLETS = new Set(["third_man", "switch_play", "direct"]);
function selectVerifiedWeakOutlet(shape, lineup, profile, includeDefenderEvidence = false, managerCounter = null) {
  const candidates = shape?.pressEscapeCandidateRoutes;
  if (shape?.pressEscape !== "supported" ||
    shape?.pressEscapeRoutePolicy !== "weakest_verified_cover" ||
    !Array.isArray(candidates) || candidates.length < 2 || candidates.length > 3 ||
    candidates.some(route => !VERIFIED_OUTLETS.has(route)) ||
    new Set(candidates).size !== candidates.length ||
    !Array.isArray(lineup)) return null;

  const flank = candidates.includes("switch_play")
    ? selectVerifiedWeakFlank(lineup, profile) : null;
  // A wide target with unknown left/right cover cannot be fairly compared
  // against centrally named outlets.
  if (candidates.includes("switch_play") && !flank) return null;
  const verified = [];
  for (const route of candidates) {
    const target = route === "switch_play" ? flank.flank : null;
    const reply = defensiveReplyForPressExit(
      route, lineup, profile, "preflight", target);
    if (!reply || reply.roleReadiness === "unknown") return null;
    const cover = routeCoverEvidence(
      route, "supported", lineup, profile, target, null);
    verified.push({
      route, targetFlank: target,
      roleReadiness: reply.roleReadiness,
      coverAdjustment: round3(cover.adjustment),
      // v7.3 snapshots exactly the defender evidence used for this candidate.
      // Earlier v7.2 sessions keep their original payload.
      ...(includeDefenderEvidence ? {
        defenders: reply.evidence.supportingPlayerIds.map(playerId => {
          const player = lineup.find(entry => entry.playerId === playerId);
          return {
            playerId, position: player.position, roleId: player.roleId,
            matchScore: player.matchScore
          };
        })
      } : {})
    });
  }
  // v7.4: manager may redistribute an ALREADY EARNED specialist cover term
  // from one documented route to another. No new defensive skill is created:
  // the donor loses exactly what the prioritised route gains. The transfer
  // requires positively verified roles in both corridors and a route the
  // manager explicitly named after an actual executed press escape.
  let adjusted = verified;
  let redistribution = null;
  const focus = managerCounter?.route &&
    verified.find(item => item.route === managerCounter.route);
  if (focus?.roleReadiness === "supported_by_roles" &&
    includeDefenderEvidence) {
    const donor = [...verified]
      .filter(item => item.route !== focus.route &&
        item.roleReadiness === "supported_by_roles")
      .sort((a, b) => b.coverAdjustment - a.coverAdjustment ||
        a.route.localeCompare(b.route))[0];
    const transferred = donor ? round3(Math.min(0.017,
      0.03 - focus.coverAdjustment, donor.coverAdjustment)) : 0;
    if (transferred >= 0.001) {
      adjusted = verified.map(item => item.route === focus.route
        ? { ...item, coverAdjustment: round3(item.coverAdjustment + transferred) }
        : item.route === donor.route
          ? { ...item, coverAdjustment: round3(item.coverAdjustment - transferred) }
          : item);
      redistribution = {
        status: "redistributed", prioritisedRoute: focus.route,
        exposedRoute: donor.route, transfer: transferred,
        sourceSegment: managerCounter.sourceSegment,
        basis: "manager_reallocation_of_existing_verified_cover"
      };
    }
  }

  // Least protected FIRST, with a 0.008 probability-point separation
  // between the two weakest lanes. This is an explicit model threshold,
  // never observed opponent intelligence. Identical / near-tied routes
  // remain unknown rather than being selected by array order.
  const sorted = [...adjusted].sort((a, b) =>
    a.coverAdjustment - b.coverAdjustment || a.route.localeCompare(b.route));
  if (sorted[1].coverAdjustment - sorted[0].coverAdjustment < 0.008) return null;
  return {
    route: sorted[0].route,
    flankChoice: sorted[0].route === "switch_play" ? flank : null,
    candidates: adjusted, redistribution,
    basis: "authored_available_routes_and_verified_defensive_roles"
  };
}



// Only an already PLAYED, unsuccessful press can inform a new tactical
// manager instruction. Recovered balls do not expose a route, and older
// matches without verified individual snapshots cannot unlock this choice.
export function getManagerPressCounterOptions(session) {
  if (session?.causalManagerPressCounterVersion !== 1 ||
    session?.causalOpponentSequenceVersion !== 1 ||
    session?.causalOpponentRouteAdaptationVersion !== 1 ||
    !/^event_\d+$/.test(session?.phase || "")) return null;
  const behaviour = session.opponent?.tacticalBehaviour;
  const known = behaviour?.pressEscapeCandidateRoutes;
  if (behaviour?.pressEscape !== "supported" ||
    behaviour.pressEscapeRoutePolicy !== "weakest_verified_cover" ||
    !Array.isArray(known) || known.length < 2 ||
    known.length > 3 || new Set(known).size !== known.length ||
    known.some(route => !VERIFIED_OUTLETS.has(route)) ||
    Object.prototype.hasOwnProperty.call(behaviour, "pressEscapeRoute") ||
    Object.prototype.hasOwnProperty.call(behaviour, "pressEscapeTargetFlank") ||
    behaviour.pressEscapeTiming != null ||
    behaviour.pressEscapeActionSequence != null) return null;
  const last = (Array.isArray(session.timeline) ? session.timeline : [])
    .at(-1);
  const phase = last?.tacticalPhase;
  const adaptation = phase?.evidence?.opponentRouteAdaptation;
  if (!Number.isInteger(last?.segment) ||
    phase?.situation !== "our_press_vs_opponent_build_up" ||
    phase.status === "regain" || adaptation?.status !== "selected" ||
    !known.includes(adaptation.selectedRoute) ||
    !Array.isArray(adaptation.candidates) ||
    adaptation.candidates.length !== known.length ||
    !known.every(route => adaptation.candidates.some(item => item.route === route)) ||
    !adaptation.candidates.every(item =>
      Array.isArray(item.defenders) && item.defenders.length > 0 &&
      item.defenders.every(defender => defender?.playerId &&
        Number.isFinite(defender.matchScore)))) return null;
  if (session.managerPressCounter?.sourceSegment === last.segment) return null;
  return {
    sourceSegment: last.segment, observedRoute: adaptation.selectedRoute,
    routes: adaptation.candidates
      .filter(item => item.roleReadiness === "supported_by_roles" &&
        Number.isFinite(item.coverAdjustment) &&
        item.coverAdjustment < 0.03 &&
        adaptation.candidates.some(donor =>
          donor.route !== item.route &&
          donor.roleReadiness === "supported_by_roles" &&
          Number.isFinite(donor.coverAdjustment) &&
          donor.coverAdjustment > 0))
      .map(item => item.route)
  };
}

// v7.3 compares ACTUALLY PLAYED press escapes across stored match phases.
// This is an explanation of the already-calculated v7.2 choice, not a
// second probability adjustment, fabricated opponent route or new xG event.
// Only earlier v7.3 phases with the exact player-evidence snapshot qualify.
function opponentPhaseContinuity(session, choice, outcome) {
  const timeline = Array.isArray(session.timeline) ? session.timeline : [];
  const phaseNumber = timeline.length + 1;
  if (outcome === "regain") return {
    status: "press_regained", phaseNumber, currentRoute: choice.route,
    basis: "simulated_route_not_executed"
  };
  const previous = [...timeline].reverse().find(entry => {
    const phase = entry?.tacticalPhase;
    const saved = phase?.evidence?.opponentRouteAdaptation;
    return phase?.situation === "our_press_vs_opponent_build_up" &&
      phase.status !== "regain" && saved?.status === "selected" &&
      Array.isArray(saved.candidates) &&
      saved.candidates.every(candidate => Array.isArray(candidate.defenders));
  });
  if (!previous) return {
    status: "first_executed_route", phaseNumber,
    currentRoute: choice.route,
    basis: "authored_routes_and_current_verified_defenders"
  };
  const prior = previous.tacticalPhase.evidence.opponentRouteAdaptation;
  const coverChanges = choice.candidates.flatMap(candidate => {
    const before = prior.candidates.find(item => item.route === candidate.route);
    if (!before) return [];
    const defendersChanged = JSON.stringify(before.defenders) !==
      JSON.stringify(candidate.defenders);
    const adjustmentChanged = before.coverAdjustment !== candidate.coverAdjustment;
    if (!defendersChanged && !adjustmentChanged) return [];
    return [{
      route: candidate.route,
      previousAdjustment: before.coverAdjustment,
      currentAdjustment: candidate.coverAdjustment,
      defendersChanged,
      ...(defendersChanged ? {
        previousDefenders: before.defenders,
        currentDefenders: candidate.defenders
      } : {})
    }];
  });
  return {
    status: prior.selectedRoute === choice.route ? "held_route" : "switched_route",
    phaseNumber,
    previousPhaseNumber: previous.segment + 1,
    previousRoute: prior.selectedRoute,
    currentRoute: choice.route,
    coverChanges,
    // These snapshots show correlations, never claim measured opponent intent.
    basis: "simulated_phase_comparison_of_verified_cover"
  };
}

export function resolveOwnPressAgainstOpponent(session, {
  pressureRoll = Math.random,
  protectionRoll = Math.random
} = {}) {
  if (session?.causalPressingVersion !== 1) return null;
  const id = session.activePlanSnapshot?.id ||
    session.tacticSnapshot?.id || session.selectedTacticId;
  const entry = Object.entries(ROUTES).find(([, config]) => config.plans.includes(id));
  if (!entry) return null;
  const [route, config] = entry;
  const opponent = session.opponent;
  const scenario = opponent?.styleTraits?.[config.opponentMetric] ??
    (config.opponentMetric === "transitionThreat" ? opponent?.transitionThreat : null);
  const resistance = opponent?.pressResistance;
  const threat = opponent?.transitionThreat ?? opponent?.styleTraits?.transitionThreat;
  const profile = session.teamFitSnapshot?.tacticalProfile;
  const metrics = config.metrics.map(name => profile?.[name]);
  const restDefense = profile?.restDefenseScore;
  const balance = profile?.balanceScore;
  const players = distinctSupport(session.lineupSnapshot, config.positions);
  // Do not mistake missing opposition scouting/role fit for a weakness.
  if (!finite(scenario) || scenario < config.opponentMin ||
    !finite(resistance) || !finite(threat) || !finite(restDefense) ||
    !finite(balance) || !metrics.every(finite) || !players) return null;

  const avgFit = players.reduce((sum, p) => sum + p.matchScore, 0) / players.length;
  const weakestFit = Math.min(...players.map(p => p.matchScore));
  const shape = opponent?.tacticalBehaviour;
  const routePolicyRequested = session.causalOpponentRouteAdaptationVersion === 1 &&
    shape?.pressEscapeRoutePolicy === "weakest_verified_cover" &&
    !Object.prototype.hasOwnProperty.call(shape, "pressEscapeRoute") &&
    !Object.prototype.hasOwnProperty.call(shape, "pressEscapeTargetFlank") &&
    shape.pressEscapeTiming == null && shape.pressEscapeActionSequence == null;
  const routeChoice = routePolicyRequested
    ? selectVerifiedWeakOutlet(shape, session.lineupSnapshot, profile,
        session.causalOpponentSequenceVersion === 1,
        session.causalManagerPressCounterVersion === 1
          ? session.managerPressCounter : null) : null;
  const counter = routeChoice?.route || shape?.pressEscapeRoute;
  // Both a known authored outlet and simulated live pressEscape describe
  // one documented route through the press. "isolated" is stronger direct
  // evidence than an older route label; unknown data awards no free bypass.
  const escapeEvidence = resolvePressEscapeEvidence(opponent?.tacticalBehaviour);
  // Input convention: target flank is expressed from OUR defending viewpoint.
  // No guess from a route label or lineup when the destination is unknown.
  const targetFlankInput = opponent?.tacticalBehaviour?.pressEscapeTargetFlank;
  const explicitlyTargeted = counter === "switch_play" &&
    escapeEvidence === "supported" && ["left", "right"].includes(targetFlankInput);
  const hasAuthoredTarget = Object.prototype.hasOwnProperty.call(
    opponent?.tacticalBehaviour || {}, "pressEscapeTargetFlank");
  const adaptationRequested = counter === "switch_play" &&
    escapeEvidence === "supported" && !hasAuthoredTarget &&
    opponent?.tacticalBehaviour?.pressEscapeTargetPolicy === "weakest_verified_flank";
  // An authored timeline or historic timing window must never be silently
  // remapped to a different channel. Authors must explicitly target it.
  const canAdapt = adaptationRequested &&
    opponent?.tacticalBehaviour?.pressEscapeTiming == null &&
    opponent?.tacticalBehaviour?.pressEscapeActionSequence == null;
  const adaptiveChoice = routeChoice?.flankChoice ||
    (canAdapt ? selectVerifiedWeakFlank(session.lineupSnapshot, profile) : null);
  const targetFlank = explicitlyTargeted ? targetFlankInput :
    adaptiveChoice?.flank || null;
  const documentedEscape = escapeEvidence === "supported";
  const pressProbability = clamp(
    0.53 + (avgFit - 65) * 0.004 +
      (Math.min(...metrics) - 65) * 0.003 +
      (weakestFit - 60) * 0.001 -
      (resistance - 70) * 0.004 -
      (documentedEscape ? 0.15 : 0),
    0.12, 0.85
  );
  const pressResult = Number(pressureRoll());
  if (!finite(pressResult)) return null;
  const regained = clamp(pressResult, 0, 0.999999999) < pressProbability;
  // Rest defence is evaluated only if the opponent gets beyond the press.
  const baseCover = routeCoverEvidence(counter, escapeEvidence,
    session.lineupSnapshot, profile, targetFlank,
    // Explicit aggregate timing retains precedence for older fixtures/saves.
    // A four-action in-match sequence is an alternate, never an extra modifier.
    opponent?.tacticalBehaviour?.pressEscapeTiming ??
      opponent?.tacticalBehaviour?.pressEscapeActionSequence);
  // One single existing specialist cover gate. Its redistributed amount is
  // taken from the OTHER candidate, never stacked onto this outcome.
  const selectedCover = routeChoice?.redistribution
    ? routeChoice.candidates.find(candidate => candidate.route === counter)
    : null;
  const cover = selectedCover
    ? { ...baseCover, adjustment: selectedCover.coverAdjustment }
    : baseCover;
  const containment = clamp(
    0.48 + (restDefense - 65) * 0.005 +
      (balance - 65) * 0.002 +
      (avgFit - 65) * 0.001 -
      (threat - 70) * 0.004 +
      cover.adjustment, 0.12, 0.88
  );
  const protection = regained ? null : Number(protectionRoll());
  if (!regained && !finite(protection)) return null;
  const contained = !regained && clamp(protection, 0, 0.999999999) < containment;
  const outcome = regained ? "regain" : contained ? "contained" : "escaped";
  const originalCounterplay = counterplayForPressExit(counter, escapeEvidence,
    outcome, session.lineupSnapshot, profile, cover, targetFlank, adaptiveChoice);
  const phaseContinuity = routeChoice &&
    session.causalOpponentSequenceVersion === 1
    ? opponentPhaseContinuity(session, routeChoice, outcome) : null;
  const routeAdaptation = routeChoice ? {
    status: "selected", selectedRoute: routeChoice.route,
    candidates: routeChoice.candidates,
    basis: routeChoice.basis,
    ...(routeChoice.redistribution ? {
      managerCounter: routeChoice.redistribution
    } : {}),
    ...(phaseContinuity ? { sequence: phaseContinuity } : {})
  } : routePolicyRequested
    ? { status: "insufficient_or_conflicting_evidence" } : null;
  const counterplay = originalCounterplay && routeChoice ? {
    ...originalCounterplay, opponentRouteAdaptation: routeAdaptation
  } : originalCounterplay;
  const chanceSide = regained ? "for" : outcome === "escaped" ? "against" : null;
  const steps = config.steps.map((action, i) => ({
    action,
    result: regained ? "completed" :
      i === 0 ? "completed" :
        i === 1 ? "bypassed" :
          i === 2 ? "failed" : contained ? "contained" : "exposed"
  }));
  return {
    version: 6,
    situation: "our_press_vs_opponent_build_up",
    planId: id, route, status: outcome, side: chanceSide,
    probability: round3(pressProbability),
    containmentProbability: round3(containment),
    routeCoverAdjustment: round3(cover.adjustment),
    xgDeltaFor: regained ? config.xgFor : 0,
    // The terminal outcome owns this single risk; no separate bonus for
    // stage two or for each player in the pressing unit.
    xgDeltaAgainst: regained ? -0.01 : contained ? 0.02 :
      restDefense >= 70 ? 0.06 : 0.12,
    cause: regained ? config.regain :
      (contained
        ? counterplay?.containedCause ||
          "Motstanderen spiller seg ut av første press, men restforsvaret stanser overgangen."
        : counterplay?.escapedCause ||
          (documentedEscape
            ? "Motstanderen bruker dokumentert utvei fra presset; bakre sikring blir utfordret."
            : "Første pressledd brytes og restforsvaret rekker ikke å stenge neste rom.")) +
      (adaptiveChoice && !regained
        ? " Motstanderen valgte vår " +
          (targetFlank === "left" ? "venstre" : "høyre") +
          " kant ut fra kjent forsvarsrolle og rollepassform."
        : "") +
      (routeChoice && !regained
        ? " Blant kjente utveier valgte motstanderen " +
          (counter === "third_man" ? "tredjemann sentralt" :
            counter === "switch_play" ? "sideskift" : "direkte utspill") +
          " mot vår svakere dokumenterte sikring."
        : "") +
      (phaseContinuity?.status === "switched_route" && !regained
        ? " Fra forrige dokumenterte pressfase har motstanderen skiftet utvei."
        : "") +
      (routeChoice?.redistribution && !regained
        ? " Manageren har omfordelt kjent sikring til " +
          (routeChoice.redistribution.prioritisedRoute === "third_man"
            ? "tredjemann" : routeChoice.redistribution.prioritisedRoute === "switch_play"
              ? "sideskift" : "direkte utspill") +
          ", på bekostning av dekning i en annen kjent korridor."
        : ""),
    steps, counterplay,
    evidence: {
      opponentTrigger: config.opponentMetric, opponentValue: scenario,
      pressResistance: resistance, transitionThreat: threat,
      opponentEscapeRoute: shape?.pressEscapeRoute || "unknown",
      ...(routePolicyRequested ? { opponentRouteAdaptation: routeAdaptation } : {}),
      documentedTargetFlank: adaptiveChoice ? null : targetFlank,
      ...(adaptationRequested ? {
        opponentFlankAdaptation: adaptiveChoice
          ? { status: "selected", selectedFlank: adaptiveChoice.flank,
              reason: adaptiveChoice.reason, basis: adaptiveChoice.basis }
          : { status: "insufficient_or_conflicting_evidence" }
      } : {}),
      opponentEscapeEvidence: escapeEvidence || "unknown",
      resolvedEscapePathway: counterplay?.pathwayId || "unknown",
      routeCoverFitFloor: cover.weakestCoverFit,
      routeCoverTiming: cover.timing,
      support: players.map(p => ({
        playerId: p.playerId, position: p.position,
        roleId: p.roleId, matchScore: p.matchScore
      })),
      metricNames: config.metrics.slice(), metricValues: metrics,
      restDefenseScore: restDefense, balanceScore: balance
    }
  };
}

export function annotateOwnPressChances(chances, phase) {
  if (!Array.isArray(chances) || !phase || !phase.side) return chances;
  const chosen = chances.findIndex(chance => chance.side === phase.side);
  if (chosen < 0) return chances;
  const won = phase.status === "regain";
  return chances.map((chance, i) => i !== chosen ? chance : {
    ...chance,
    tacticalMoment: {
      kind: won ? "press_regain" : "press_broken",
      label: won ? "Kollektiv gjenvinning" : "Motstander spiller av press",
      description: phase.cause,
      planId: phase.planId, planTitle: "Kollektivt press og motspill",
      status: won ? "advantage" : "countered", side: phase.side,
      keyAction: phase.steps.find(step => step.result === "failed")?.action ||
        phase.steps[phase.steps.length - 1]?.action,
      cause: phase.cause, steps: phase.steps, counterplay: phase.counterplay || null,
      observed: false, basis: "simulated_before_chances_v6",
      xgDelta: won ? phase.xgDeltaFor : phase.xgDeltaAgainst
    }
  });
}
