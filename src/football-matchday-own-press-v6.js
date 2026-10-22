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
function specialistRecoveryWindow(route, playerIds, timing) {
  const neutral = { status: "not_provided", basis: null,
    attackWindowSeconds: null, latestRecoverySeconds: null, marginSeconds: null };
  if (timing == null) return neutral;
  const invalid = { ...neutral, status: "invalid_or_incomplete" };
  if (!timing || typeof timing !== "object" || Array.isArray(timing) ||
    timing.basis !== "authored_scenario" || timing.route !== route ||
    !finite(timing.attackWindowSeconds) ||
    timing.attackWindowSeconds <= 0 || timing.attackWindowSeconds > 20 ||
    !timing.defenderArrivalSecondsByPlayerId ||
    typeof timing.defenderArrivalSecondsByPlayerId !== "object" ||
    Array.isArray(timing.defenderArrivalSecondsByPlayerId) ||
    !Array.isArray(playerIds) || playerIds.length === 0) return invalid;
  const arrival = playerIds.map(id =>
    Object.prototype.hasOwnProperty.call(timing.defenderArrivalSecondsByPlayerId, id)
      ? timing.defenderArrivalSecondsByPlayerId[id] : null);
  if (!arrival.every(time => finite(time) && time >= 0 && time <= 20))
    return invalid;
  const latest = Math.max(...arrival);
  const margin = timing.attackWindowSeconds - latest;
  return {
    status: margin >= 0 ? "in_time" : "late",
    basis: "authored_scenario",
    attackWindowSeconds: timing.attackWindowSeconds,
    latestRecoverySeconds: latest,
    marginSeconds: Math.round(margin * 1000) / 1000
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
  const timing = specialistRecoveryWindow(opponentRoute, ids, timingInput);
  const specialistAdjustment = clamp((weakestCoverFit - 60) * 0.0015, 0, 0.03);
  return {
    adjustment: timing.status === "late" ? 0 : specialistAdjustment,
    weakestCoverFit,
    timing
  };
}

function counterplayForPressExit(opponentRoute, escapeEvidence, outcome, lineup, profile, cover, targetFlank) {
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
    documentedTargetFlank: targetFlank,
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
      containmentAdjustment: round3(cover.adjustment),
      weakestCoverFit: cover.weakestCoverFit,
      coverTiming: cover.timing
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
  const counter = opponent?.tacticalBehaviour?.pressEscapeRoute;
  // Both a known authored outlet and simulated live pressEscape describe
  // one documented route through the press. "isolated" is stronger direct
  // evidence than an older route label; unknown data awards no free bypass.
  const escapeEvidence = resolvePressEscapeEvidence(opponent?.tacticalBehaviour);
  // Input convention: target flank is expressed from OUR defending viewpoint.
  // No guess from a route label or lineup when the destination is unknown.
  const targetFlankInput = opponent?.tacticalBehaviour?.pressEscapeTargetFlank;
  const targetFlank = counter === "switch_play" && escapeEvidence === "supported" &&
    ["left", "right"].includes(targetFlankInput) ? targetFlankInput : null;
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
  const cover = routeCoverEvidence(counter, escapeEvidence,
    session.lineupSnapshot, profile, targetFlank,
    opponent?.tacticalBehaviour?.pressEscapeTiming);
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
  const counterplay = counterplayForPressExit(counter, escapeEvidence,
    outcome, session.lineupSnapshot, profile, cover, targetFlank);
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
      contained
        ? counterplay?.containedCause ||
          "Motstanderen spiller seg ut av første press, men restforsvaret stanser overgangen."
        : counterplay?.escapedCause ||
          (documentedEscape
            ? "Motstanderen bruker dokumentert utvei fra presset; bakre sikring blir utfordret."
            : "Første pressledd brytes og restforsvaret rekker ikke å stenge neste rom."),
    steps, counterplay,
    evidence: {
      opponentTrigger: config.opponentMetric, opponentValue: scenario,
      pressResistance: resistance, transitionThreat: threat,
      opponentEscapeRoute: counter || "unknown",
      documentedTargetFlank: targetFlank,
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
