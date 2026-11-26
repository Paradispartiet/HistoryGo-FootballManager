// v8.0 first step: when no specialised v6 phase owns the period, resolve
// an already-authored four-action plan sequence BEFORE chance generation.
// Do not add a second motor, RNG, chance or static sequenceEdge modifier.
// This is a bounded deterministic gameplay hypothesis, NOT tracking data.
import { TACTICAL_SEQUENCES } from "./football-tactical-sequences.js";
import { tirednessOf } from "./football-substitutions.js";

const finite = x => typeof x === "number" && Number.isFinite(x);
const ATTACK = new Set(["in_possession", "transition_attack"]);
const DEFEND = new Set(["out_of_possession", "transition_defend"]);

function verifiedMatchLineup(lineup) {
  return Array.isArray(lineup) && lineup.length >= 10 && lineup.length <= 11 &&
    lineup.every(p => typeof p?.playerId === "string" && p.playerId &&
      typeof p.roleId === "string" && p.roleId &&
      p.matchFitKnown === true && finite(p.matchScore) &&
      p.matchScore >= 0 && p.matchScore <= 100) &&
    new Set(lineup.map(p => p.playerId)).size === lineup.length;
}

export function resolveAuthoredSequencePeriod(session) {
  if (session?.causalDirectionalSequenceVersion !== 1 ||
    !verifiedMatchLineup(session.lineupSnapshot)) return null;
  const planId = session.activePlanSnapshot?.id ||
    session.tacticSnapshot?.id || session.selectedTacticId;
  const canonical = TACTICAL_SEQUENCES.find(x => x.tacticId === planId);
  const sequence = session.planMatchup?.sequences?.find(x => x.id === planId);
  if (!canonical || !sequence || ![...ATTACK, ...DEFEND].includes(canonical.phase) ||
    !Array.isArray(canonical.moves) || canonical.moves.length !== 4 ||
    !Array.isArray(sequence.moves) ||
    JSON.stringify(sequence.moves) !== JSON.stringify(canonical.moves) ||
    sequence.phase !== canonical.phase || sequence.ready !== true ||
    !Array.isArray(sequence.missing) || sequence.missing.length ||
    !["advantage", "countered"].includes(sequence.status) ||
    !Object.entries(canonical.requires).every(([key, threshold]) =>
      finite(session.teamFitSnapshot?.tacticalProfile?.[key]) &&
      session.teamFitSnapshot.tacticalProfile[key] >= threshold))
    return null;

  // The plan evaluator has established a KNOWN counter-condition or a
  // documented live exchange. Unknown opponent response remains unresolved.
  const countered = sequence.status === "countered";
  const phase = canonical.phase;
  const offensive = ATTACK.has(phase);
  // Declared small game heuristics, not empirical xG coefficients:
  // a defensive success can prevent xG but NEVER manufacture our own shot.
  // A broken chain yields only conceded risk, not an automatic opponent goal.
  const xgDeltaFor = offensive && !countered ? 0.04 : 0;
  const xgDeltaAgainst = countered ? offensive ? 0.03 : 0.05 :
    offensive ? 0 : -0.04;
  const keyStep = countered ? 2 : 3;
  const steps = canonical.moves.map((action, index) => ({
    action, order: index + 1,
    result: countered
      ? index < keyStep ? "simulated_available" :
        index === keyStep ? "countered" : "not_reached"
      : "simulated_available"
  }));
  const supportedRoles = session.lineupSnapshot.map(p => ({
    playerId: p.playerId, roleId: p.roleId,
    position: p.position, matchScore: p.matchScore
  }));
  const requirements = Object.entries(canonical.requires)
    .map(([metric, minimum]) => ({
      metric, minimum,
      actual: session.teamFitSnapshot.tacticalProfile[metric]
    }));
  const side = xgDeltaFor > 0 ? "for" : xgDeltaAgainst > 0 ? "against" : null;
  return {
    version: 6,
    situation: "authored_four_step_sequence",
    planId, route: canonical.phase, status: countered ? "countered" : "advantage",
    side, xgDeltaFor, xgDeltaAgainst,
    cause: countered
      ? "Simulert taktisk kjede blir brutt av et kjent motgrep: " + canonical.counter + "."
      : "Simulert firetrinnskjede gjennomføres med kjent lag- og motstandergrunnlag.",
    steps,
    counterplay: {
      status: countered ? "simulated_counter" : "not_triggered",
      counter: canonical.counter,
      nextManagerResponse: canonical.response,
      nextPlanId: canonical.responsePlanId || null,
      // A suggested manager switch is NOT silently executed.
      automaticallyExecuted: false
    },
    evidence: {
      source: "existing_authored_tactical_sequence_and_verified_match_lineup",
      basis: "bounded_game_heuristic_not_observed",
      sequenceId: canonical.tacticId,
      sequencePhase: canonical.phase,
      opponentCondition: canonical.opponentCondition,
      counterCondition: canonical.counterCondition,
      sourceSequenceStatus: sequence.status,
      namedCounter: canonical.counter,
      requirements,
      supportingPlayers: supportedRoles,
      eventCount: 1,
      extraRandomDraws: 0
    }
  };
}

// Annotate ONE shot that was actually produced by the existing period motor.
// A successful defensive chain's prevented xG cannot be attached to a shot
// that never happened. The timeline stores that causal defensive evidence.
export function annotateAuthoredSequenceChances(chances, phase) {
  if (!Array.isArray(chances) || !phase?.side) return chances;
  const index = chances.findIndex(chance => chance.side === phase.side);
  if (index < 0) return chances;
  return chances.map((chance, i) => i === index ? {
    ...chance,
    tacticalMoment: {
      kind: phase.status === "advantage" ? "sequence_attack" : "sequence_counter",
      label: phase.status === "advantage" ? "Firetrinnsangrep" : "Brutt spillkjede",
      description: phase.cause, planId: phase.planId,
      status: phase.status, side: phase.side,
      keyAction: phase.steps.find(s => s.result === "countered")?.action ||
        phase.steps[phase.steps.length - 1].action,
      cause: phase.cause, steps: phase.steps,
      counterplay: phase.counterplay,
      observed: false, basis: "simulated_directional_sequence_v8",
      xgDelta: phase.side === "for" ? phase.xgDeltaFor : phase.xgDeltaAgainst
    }
  } : chance);
}

// Sourced opponent movement patterns, independent of a press-escape route.
// An explicitly selected defensive line and known defending unit are required.
// This is a simulated possession, not reconstructed tracking or opponent XI.
const BREAKTHROUGH_LINE_EXPOSURE = Object.freeze({
  low: -0.12, medium_low: -0.06, medium: 0, medium_high: 0.06, high: 0.12
});
const COORDINATED_RUNS = Object.freeze([
  "Midtspissen møter ballen og forsøker å trekke en stopper ut",
  "Gjennombruddsspissen starter motsatt bevegelse inn i bakrommet",
  "Indreløperen følger opp i rommet som åpnes",
  "Den offensive backen gir bredde og overlapp; flere løp truer boksen"
]);

// Reuse the substitution engine's freshness/minutes curve. Only actual played
// periods count towards the opponent's collective workload. This is a bounded
// gameplay model of repeated attempts, not measured opponent fitness.
function opponentRunFatigue(session, support, minute) {
  if (session.causalOpponentRunFatigueVersion !== 1 ||
      !finite(minute) || minute < 0 || minute > 90) return null;
  const verified = support.every(p => finite(p.startFreshness) &&
    p.startFreshness >= 0 && p.startFreshness <= 100 &&
    finite(p.onFrom) && p.onFrom >= 0 && p.onFrom <= minute);
  const tiredness = verified
    ? support.map(p => ({ playerId: p.playerId, minutes: minute - p.onFrom,
        startFreshness: p.startFreshness, tiredness: tirednessOf(p, minute) }))
    : [];
  const defendingFatigue = verified
    ? tiredness.reduce((sum, p) => sum + p.tiredness, 0) / tiredness.length * 0.12
    : 0;
  const previous = Array.isArray(session.timeline) ? session.timeline : [];
  let opponentRunLoad = 0;
  for (const period of previous) {
    const phase = period?.tacticalPhase;
    if (!finite(period?.range?.to) || period.range.to > minute ||
        phase?.situation !== "opponent_coordinated_runs" ||
        phase.evidence?.opponentPattern !== "coordinated_433_breakthrough") continue;
    if (phase.status === "breakthrough") opponentRunLoad += 0.02;
    else if (phase.status === "contained") opponentRunLoad += 0.01;
  }
  opponentRunLoad = Math.min(0.06, opponentRunLoad);
  return { minute, defendingEvidence: verified ? "known" : "unknown",
    defendingFatigue, opponentRunLoad, supportingPlayers: tiredness,
    basis: "simulated_repeat_workload_and_existing_match_tiredness" };
}

export function resolveOpponentRunSequence(session, { rng = Math.random, minute } = {}) {
  if (session?.causalOpponentRunVersion !== 1 ||
      session.opponent?.tacticalBehaviour?.attackingRunPattern !== "coordinated_433_breakthrough" ||
      !verifiedMatchLineup(session.lineupSnapshot)) return null;
  const plan = session.activePlanSnapshot || session.tacticSnapshot;
  const line = plan?.defensiveLine;
  if (!plan?.id || !Object.prototype.hasOwnProperty.call(BREAKTHROUGH_LINE_EXPOSURE, line)) return null;
  const profile = session.teamFitSnapshot?.tacticalProfile;
  const metrics = [profile?.balanceScore, profile?.restDefenseScore];
  if (!metrics.every(v => finite(v) && v >= 0 && v <= 100)) return null;
  const lineup = session.lineupSnapshot;
  const best = (positions, count = 1) => lineup.filter(p => positions.includes(p.position))
    .sort((a, b) => b.matchScore - a.matchScore || a.playerId.localeCompare(b.playerId)).slice(0, count);
  const centreBacks = best(["CB"], 2), screen = best(["DM", "CM"]);
  const left = best(["LB", "LWB"]), right = best(["RB", "RWB"]);
  // No target flank is documented: verify both sides or leave the phase unknown.
  if (centreBacks.length !== 2 || !screen.length || !left.length || !right.length) return null;
  const support = [...centreBacks, ...screen, ...left, ...right];
  const avg = support.reduce((sum, p) => sum + p.matchScore, 0) / support.length;
  const floor = Math.min(...support.map(p => p.matchScore));
  // Bounded game heuristic, not an empirical rate. One draw for the complete
  // combination, no individual opponent skill or additional formation penalty.
  const fatigue = opponentRunFatigue(session, support, minute);
  const probability = Math.max(0.12, Math.min(0.82,
    0.50 + BREAKTHROUGH_LINE_EXPOSURE[line] +
    (fatigue?.defendingFatigue || 0) - (fatigue?.opponentRunLoad || 0) -
    (avg - 65) * 0.004 - (floor - 65) * 0.001 -
    (Math.min(...metrics) - 65) * 0.003));
  const draw = rng();
  if (!finite(draw)) return null;
  const breakthrough = Math.max(0, Math.min(0.999999999, draw)) < probability;
  return {
    version: 6, situation: "opponent_coordinated_runs",
    planId: plan.id, route: "coordinated_433_breakthrough",
    status: breakthrough ? "breakthrough" : "contained",
    side: breakthrough ? "against" : null,
    probability: Math.round(probability * 1000) / 1000,
    xgDeltaFor: 0, xgDeltaAgainst: breakthrough ? 0.06 : -0.03,
    cause: breakthrough
      ? "Motstanderens motsatte bevegelser og støtte åpner et gjennombruddsvindu bak eller mellom forsvarsleddene."
      : "Stopperne holder dybden, midtbanen skjermer avlegget og backene sikrer løpsrommet.",
    steps: COORDINATED_RUNS.map((action, index) => ({
      action, order: index + 1,
      result: breakthrough || index === 0 ? "simulated_available" :
        index === 1 ? "countered" : "not_reached"
    })),
    counterplay: { status: breakthrough ? "not_triggered" : "simulated_counter",
      counter: "Hold stopperdybde, skjerm avlegget og følg indreløpet",
      nextManagerResponse: "Vurder lavere forsvarslinje og støtte fra sekseren; sikre begge kanter.",
      automaticallyExecuted: false },
    evidence: { basis: "sourced_opponent_pattern_bounded_game_heuristic_not_observed",
      opponentPattern: "coordinated_433_breakthrough", defensiveLine: line,
      lineExposure: BREAKTHROUGH_LINE_EXPOSURE[line],
      balanceScore: metrics[0], restDefenseScore: metrics[1], weakestCoverFit: floor,
      supportingPlayers: support.map(({playerId, roleId, position, matchScore}) =>
        ({playerId, roleId, position, matchScore})),
      ...(fatigue ? { fatigue } : {}),
      eventCount: 1, randomDraws: 1 }
  };
}

export function annotateOpponentRunChances(chances, phase) {
  if (!Array.isArray(chances) || phase?.side !== "against") return chances;
  const at = chances.findIndex(c => c.side === "against");
  if (at < 0) return chances;
  return chances.map((c, i) => i !== at ? c : {
    ...c, tacticalMoment: {
      kind: phase.situation === "opponent_switch_cross" ? "opponent_switch_cross" : "opponent_coordinated_runs",
      label: phase.situation === "opponent_switch_cross" ? "Spillvending og tidlig innlegg" : "Samordnet gjennombruddsløp",
      description: phase.cause, planId: phase.planId, status: "countered",
      side: "against", keyAction: phase.steps[phase.situation === "opponent_switch_cross" ? 2 : 1].action, cause: phase.cause,
      steps: phase.steps, counterplay: phase.counterplay, observed: false,
      basis: "simulated_opponent_run_sequence", xgDelta: phase.xgDeltaAgainst
    }
  });
}

// A central switch to an early cross is distinct from a through-ball run.
// Resolve both linked gates with ONE roll; no invented target flank, opposing
// players, shot, or historical success rates. Only verified nominal defending
// roles and team metrics feed these bounded game heuristics.
export function resolveOpponentSwitchCrossSequence(session, { rng = Math.random } = {}) {
  if (session?.causalOpponentSwitchCrossVersion !== 1 ||
      session.opponent?.tacticalBehaviour?.attackingRunPattern !== "central_switch_early_cross" ||
      !verifiedMatchLineup(session.lineupSnapshot)) return null;
  const planId = session.activePlanSnapshot?.id || session.tacticSnapshot?.id || session.selectedTacticId;
  if (!planId) return null;
  const profile = session.teamFitSnapshot?.tacticalProfile;
  const { widthScore, balanceScore, restDefenseScore } = profile || {};
  if (![widthScore, balanceScore, restDefenseScore].every(v => finite(v) && v >= 0 && v <= 100)) return null;
  const lineup = session.lineupSnapshot;
  const best = (positions, count = 1) => lineup.filter(p => positions.includes(p.position))
    .sort((a,b) => b.matchScore - a.matchScore || a.playerId.localeCompare(b.playerId)).slice(0,count);
  const left = best(["LB","LWB"]), right = best(["RB","RWB"]);
  const centre = best(["DM","CM"]), backs = best(["CB"],2);
  if (!left.length || !right.length || !centre.length || backs.length !== 2) return null;
  const wideUnit = [...left,...right,...centre], boxUnit = [...backs,...centre];
  const average = ps => ps.reduce((n,p)=>n+p.matchScore,0)/ps.length;
  const floor = ps => Math.min(...ps.map(p=>p.matchScore));
  const clamp = v => Math.max(0.12,Math.min(0.82,v));
  const crossProbability = clamp(0.54 - (widthScore-65)*0.004 -
    (balanceScore-65)*0.002 - (average(wideUnit)-65)*0.003 - (floor(wideUnit)-65)*0.002);
  const boxProbability = clamp(0.52 - (restDefenseScore-65)*0.004 -
    (balanceScore-65)*0.002 - (average(boxUnit)-65)*0.003 - (floor(boxUnit)-65)*0.002);
  const draw = rng();
  if (!finite(draw)) return null;
  const roll = Math.max(0,Math.min(0.999999999,draw));
  const crossAvailable = roll < crossProbability;
  const chanceWindow = crossAvailable && roll < crossProbability*boxProbability;
  const status = !crossAvailable ? "wide_contained" : chanceWindow ? "breakthrough" : "box_contained";
  const actions = [
    "Sentralt vendingsledd søker ledig bredde",
    "Kantspilleren forsøker å komme fri før innlegget",
    "Tidlig innlegg søker samtidige løp inn i boksen",
    "Stopperne og midtbanedekningen møter løpene ved avslutningsrommet"
  ];
  const support = [...new Map([...wideUnit,...boxUnit].map(p=>[p.playerId,p])).values()];
  return {
    version:6, situation:"opponent_switch_cross",
    planId, route:"central_switch_early_cross", status,
    side:chanceWindow?"against":null,
    probability:Math.round(crossProbability*boxProbability*1000)/1000,
    xgDeltaFor:0, xgDeltaAgainst:chanceWindow?0.07:status==="wide_contained"?-0.03:-0.02,
    cause:status==="wide_contained"
      ?"Kantforsvaret stenger innleggsvinduet etter spillvendingen."
      :status==="box_contained"
        ?"Innlegget kommer frem til boksen, men stopperne og midtbanestøtten kontrollerer avslutningsrommet."
        :"Spillvendingen frigjør kanten, og samtidige boksløp åpner et avslutningsvindu.",
    steps:actions.map((action,index)=>({action,order:index+1,
      result:status==="wide_contained"?(index===0?"simulated_available":index===1?"countered":"not_reached"):
        status==="box_contained"?(index===3?"countered":"simulated_available"):"simulated_available"})),
    counterplay:{status:chanceWindow?"not_triggered":"simulated_counter",
      counter:"Sikre begge kanter og behold stopper- og midtbanedekning i boksen",
      nextManagerResponse:"Forskyv mot kanten tidlig, men la stopperne og sekseren sikre innløpene.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_opponent_pattern_bounded_game_heuristic_not_observed",
      opponentPattern:"central_switch_early_cross",targetFlank:null,
      crossProbability:Math.round(crossProbability*1000)/1000,
      conditionalBoxProbability:Math.round(boxProbability*1000)/1000,
      widthScore,balanceScore,restDefenseScore,
      wideSupport:wideUnit.map(p=>p.playerId),boxSupport:boxUnit.map(p=>p.playerId),
      supportingPlayers:support.map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      eventCount:1,randomDraws:1}
  };
}
