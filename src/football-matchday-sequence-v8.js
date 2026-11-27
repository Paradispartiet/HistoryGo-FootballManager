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
  const counterattack = phase?.situation === "opponent_switch_cross" && phase?.status === "counterattack" && phase?.side === "for";
  if (!Array.isArray(chances) || (phase?.side !== "against" && !counterattack)) return chances;
  const at = chances.findIndex(c => c.side === phase.side);
  if (at < 0) return chances;
  return chances.map((c, i) => i !== at ? c : {
    ...c, tacticalMoment: {
      kind: counterattack ? "cross_recovery_counterattack" : phase.situation === "opponent_switch_cross" ? "opponent_switch_cross" : "opponent_coordinated_runs",
      label: counterattack ? "Kontring etter brutt innlegg" : phase.situation === "opponent_switch_cross" ? "Spillvending og tidlig innlegg" : "Samordnet gjennombruddsløp",
      description: phase.cause, planId: phase.planId, status: counterattack ? "advantage" : "countered",
      side: phase.side, keyAction: counterattack ? phase.steps.at(-1).action : phase.steps[phase.situation === "opponent_switch_cross" ? 2 : 1].action, cause: phase.cause,
      steps: phase.steps, counterplay: phase.counterplay, observed: false,
      basis: "simulated_opponent_run_sequence", xgDelta: counterattack ? phase.xgDeltaFor : phase.xgDeltaAgainst
    }
  });
}

// A central switch to an early cross is distinct from a through-ball run.
// Resolve both linked gates with ONE roll; no invented target flank, opposing
// players, shot, or historical success rates. Only verified nominal defending
// roles and team metrics feed these bounded game heuristics.
// Controlling an early cross need not mean possession is retained. Resolve
// the potential counterattack inside the existing box-contained interval of
// the same draw. No extra opponent weakness, shot or tracking data inferred.
function crossRecoveryRelease(session, profile, backs, centre, lineup, roll, crossProbability, boxProbability) {
  if (session.causalOpponentCrossRecoveryVersion !== 1 ||
      session.opponent?.tacticalBehaviour?.crossRecoveryExposure !== "committed_box_runs") return null;
  const plan = session.activePlanSnapshot || session.tacticSnapshot;
  if (!["fast","direct_when_possible"].includes(plan?.tempo)) return null;
  const {buildUpScore,depthScore} = profile || {};
  if (![buildUpScore,depthScore].every(v=>finite(v)&&v>=0&&v<=100)) return null;
  // Require known complementary outlet roles. A clearance alone is not
  // evidence of a counterattack, and formation names alone are insufficient.
  const distributor = centre[0];
  if (!["balancing_six","deep_playmaker","box_to_box"].includes(distributor.roleId)) return null;
  const runner = lineup.filter(p => p.position === "ST" &&
      ["channel_runner","advanced_forward"].includes(p.roleId))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId))[0];
  const first = backs[0];
  if (!runner || new Set([first.playerId,distributor.playerId,runner.playerId]).size!==3) return null;
  const support = [first,distributor,runner];
  const avg = support.reduce((sum,p)=>sum+p.matchScore,0)/support.length;
  const floor = Math.min(...support.map(p=>p.matchScore));
  const probability = Math.max(0.12,Math.min(0.82,
    0.45+(buildUpScore-65)*0.004+(depthScore-65)*0.004+(avg-65)*0.003+(floor-65)*0.001));
  const intervalStart = crossProbability*boxProbability;
  const intervalWidth = crossProbability*(1-boxProbability);
  const released = (roll-intervalStart)/intervalWidth < probability;
  return {
    status: released?"counterattack":"no_release",
    basis:"sourced_exposure_bounded_game_heuristic_not_observed",
    conditionalReleaseProbability:Math.round(probability*1000)/1000,
    unconditionalCounterProbability:Math.round(intervalWidth*probability*1000)/1000,
    eventCount:1,extraRandomDraws:0,
    support:support.map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
    steps:[
      {action:"Stopperen bryter innlegget og forsøker kontrollert gjenvinning",result:released?"completed":"simulated_available"},
      {action:"Midtbanestøtten søker en tidlig fremoverpasning",result:released?"completed":"blocked"},
      {action:"Bakromsspissen angriper rommet bak de fremrykkede spillerne",result:released?"simulated_available":"not_reached"}
    ]
  };
}

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
  const recovery = crossAvailable && !chanceWindow
    ? crossRecoveryRelease(session,profile,backs,centre,lineup,roll,crossProbability,boxProbability) : null;
  const counterattack = recovery?.status === "counterattack";
  const status = !crossAvailable ? "wide_contained" : chanceWindow ? "breakthrough" : counterattack ? "counterattack" : "box_contained";
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
    side:chanceWindow?"against":counterattack?"for":null,
    probability:Math.round(crossProbability*boxProbability*1000)/1000,
    xgDeltaFor:counterattack?0.06:0, xgDeltaAgainst:chanceWindow?0.07:status==="wide_contained"?-0.03:-0.02,
    cause:counterattack?"Innlegget brytes, og kontrollert gjenvinning frigjør en fremoverpasning til bakromsspissen før motstanderen organiserer seg.":status==="wide_contained"
      ?"Kantforsvaret stenger innleggsvinduet etter spillvendingen."
      :status==="box_contained"
        ?"Innlegget kommer frem til boksen, men stopperne og midtbanestøtten kontrollerer avslutningsrommet."
        :"Spillvendingen frigjør kanten, og samtidige boksløp åpner et avslutningsvindu.",
    steps:[...actions.map((action,index)=>({action,order:index+1,
      result:status==="wide_contained"?(index===0?"simulated_available":index===1?"countered":"not_reached"):
        ["box_contained","counterattack"].includes(status)?(index===3?"countered":"simulated_available"):"simulated_available"})),
      ...(recovery?.steps || []).map((step,i)=>({...step,order:actions.length+i+1}))],
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
      ...(recovery?{crossRecovery:recovery}:{}),
      eventCount:1,randomDraws:1}
  };
}

// Bengtsson-era zonal defending: pressure, cover and collective shifting.
// This is an attacking possession against a sourced defensive pattern, not
// a claim about press height, a permanently covered lane or observed positions.
const ZONAL_WIDTH_PLANS = new Set(["wide_fast_433","positional_overloads","crossing_box_presence","overlap_channels"]);
export function resolveOpponentZonalShift(session,{rng=Math.random}={}) {
  if(session?.causalOpponentZonalShiftVersion!==1 ||
      session.opponent?.tacticalBehaviour?.defensivePattern!=="zonal_pressure_cover_shift" ||
      session.opponent?.tacticalBehaviour?.pressCoordination!=="collective" ||
      !verifiedMatchLineup(session.lineupSnapshot)) return null;
  const planId=session.activePlanSnapshot?.id || session.tacticSnapshot?.id || session.selectedTacticId;
  if(!ZONAL_WIDTH_PLANS.has(planId)) return null;
  const {buildUpScore,widthScore,depthScore,balanceScore}=session.teamFitSnapshot?.tacticalProfile||{};
  if(![buildUpScore,widthScore,depthScore,balanceScore].every(v=>finite(v)&&v>=0&&v<=100))return null;
  const best=positions=>session.lineupSnapshot.filter(p=>positions.includes(p.position))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId))[0];
  const pivot=best(["DM","CM"]),left=best(["LW","LM","LB","LWB"]),right=best(["RW","RM","RB","RWB"]),runner=best(["ST","AM"]);
  if(!pivot||!left||!right||!runner)return null;
  const circulation=[pivot,left,right],penetration=[left,right,runner];
  const avg=ps=>ps.reduce((sum,p)=>sum+p.matchScore,0)/ps.length;
  const floor=ps=>Math.min(...ps.map(p=>p.matchScore));
  const clamp=v=>Math.max(0.12,Math.min(0.88,v));
  // Two linked gates on one draw. The first prices our ability to move the
  // ball around pressure; the second prices timing against the shifting cover.
  const circulationProbability=clamp(0.58+(buildUpScore-65)*0.004+
    (balanceScore-65)*0.002+(avg(circulation)-65)*0.003+(floor(circulation)-65)*0.001);
  const penetrationProbability=clamp(0.48+(widthScore-65)*0.004+
    (depthScore-65)*0.004+(avg(penetration)-65)*0.003+(floor(penetration)-65)*0.001);
  const draw=rng();
  if(!finite(draw))return null;
  const roll=Math.max(0,Math.min(0.999999999,draw));
  const circulated=roll<circulationProbability;
  const advantage=circulated&&roll<circulationProbability*penetrationProbability;
  const stop=advantage?null:circulated?"shift_cover":"ball_pressure";
  const actions=[
    "Motstanderens nærmeste spiller presser ballføreren",
    "Vi forsøker å frigjøre støttepasning via midtbanen og bredden",
    "Motstanderens øvrige ledd sikrer og sideforskyver samlet",
    "Vi forsøker å utnytte et nytt rom med et timet løp"
  ];
  return {
    version:6,situation:"opponent_zonal_shift",planId,route:"zonal_pressure_cover_shift",
    status:advantage?"advantage":"countered",side:advantage?"for":null,
    probability:Math.round(circulationProbability*penetrationProbability*1000)/1000,
    xgDeltaFor:advantage?0.06:-0.03,xgDeltaAgainst:0,
    cause:advantage?"Ballflytting og timet løp åpner et angrepsrom før soneforsvaret rekker å forskyve seg."
      :stop==="ball_pressure"?"Ballførerpress og sikring hindrer den første støttepasningen."
      :"Ballflyttingen lykkes, men kollektiv sideforskyvning og sikring stenger neste angrepsrom.",
    steps:actions.map((action,index)=>({action,order:index+1,result:
      advantage?"simulated_available":stop==="ball_pressure"?(index===0?"simulated_available":index===1?"countered":"not_reached"):
      index===3?"countered":"simulated_available"})),
    counterplay:{status:advantage?"not_triggered":"simulated_counter",
      counter:"Press på ballfører, sikring og kollektiv sideforskyvning",
      nextManagerResponse:"Bruk støttepasningen, flytt ballen i bredden og time løpet før neste forskyvning.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_zonal_pattern_bounded_game_heuristic_not_observed",opponentPattern:"zonal_pressure_cover_shift",
      targetFlank:null,stop,buildUpScore,widthScore,depthScore,balanceScore,
      circulationProbability:Math.round(circulationProbability*1000)/1000,
      conditionalPenetrationProbability:Math.round(penetrationProbability*1000)/1000,
      circulationSupport:circulation.map(p=>p.playerId),penetrationSupport:penetration.map(p=>p.playerId),
      supportingPlayers:[pivot,left,right,runner].map(({playerId,roleId,position,matchScore})=>({playerId,roleId,position,matchScore})),
      eventCount:1,randomDraws:1}
  };
}
export function annotateOpponentZonalShiftChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_zonal_shift"||phase.status!=="advantage")return chances;
  const index=chances.findIndex(c=>c.side==="for");
  if(index<0)return chances;
  const annotated=annotateAuthoredSequenceChances(chances,phase);
  return annotated.map((c,i)=>i===index
    ? {...c,tacticalMoment:{...c.tacticalMoment,kind:"zonal_shift_beaten",label:"Soneforsvar spilt av",basis:"simulated_zonal_shift"}}
    :c);
}

// Bengtsson-era rehearsed longer passing and coordinated movement. The
// particular reception and support gates are a generic game hypothesis,
// not a documented target player, flank, pass length or press escape.
export function resolveOpponentRehearsedOutlet(session,{rng=Math.random}={}){
  if(session?.causalOpponentRehearsedOutletVersion!==1 ||
      session.opponent?.tacticalBehaviour?.attackingRunPattern!=="rehearsed_longer_pass_support" ||
      !verifiedMatchLineup(session.lineupSnapshot))return null;
  const plan=session.activePlanSnapshot||session.tacticSnapshot;
  const line=plan?.defensiveLine;
  if(!plan?.id||!Object.prototype.hasOwnProperty.call(BREAKTHROUGH_LINE_EXPOSURE,line))return null;
  const {balanceScore,restDefenseScore}=session.teamFitSnapshot?.tacticalProfile||{};
  if(![balanceScore,restDefenseScore].every(v=>finite(v)&&v>=0&&v<=100))return null;
  const best=(positions,count=1)=>session.lineupSnapshot.filter(p=>positions.includes(p.position))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId)).slice(0,count);
  const backs=best(["CB"],2),centre=best(["DM","CM"]),left=best(["LB","LWB"]),right=best(["RB","RWB"]);
  if(backs.length!==2||!centre.length||!left.length||!right.length)return null;
  const receivingCover=backs,followingCover=[...centre,...left,...right];
  const avg=ps=>ps.reduce((sum,p)=>sum+p.matchScore,0)/ps.length;
  const floor=ps=>Math.min(...ps.map(p=>p.matchScore));
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  const reception=clamp(0.54+BREAKTHROUGH_LINE_EXPOSURE[line]/2-
    (avg(receivingCover)-65)*0.004-(floor(receivingCover)-65)*0.001-(balanceScore-65)*0.002);
  const continuation=clamp(0.50-(avg(followingCover)-65)*0.003-
    (floor(followingCover)-65)*0.001-(restDefenseScore-65)*0.004);
  const draw=rng();
  if(!finite(draw))return null;
  const roll=Math.max(0,Math.min(0.999999999,draw));
  const received=roll<reception,breakthrough=received&&roll<reception*continuation;
  const status=breakthrough?"breakthrough":received?"support_contained":"reception_contained";
  const actions=["Motstanderen søker et innøvd lengre oppspill",
    "Fremre mottaker forsøker å kontrollere ballen mot stopperleddet",
    "Støttespillere forsøker å følge opp i timede bevegelser",
    "Vår midtbane og sidesikring forsøker å stenge videre angrep"];
  return {version:6,situation:"opponent_rehearsed_outlet",planId:plan.id,
    route:"rehearsed_longer_pass_support",status,side:breakthrough?"against":null,
    probability:Math.round(reception*continuation*1000)/1000,xgDeltaFor:0,
    xgDeltaAgainst:breakthrough?0.06:-0.03,
    cause:breakthrough?"Det lengre oppspillet kontrolleres, og støtteløpene åpner et videre angrepsrom.":
      received?"Mottakeren kontrollerer oppspillet, men vår sikring stanser den neste bevegelsen.":
      "Stopperleddet kontrollerer mottaksrommet og hindrer at oppspillet blir et angrep.",
    steps:actions.map((action,index)=>({action,order:index+1,result:breakthrough?"simulated_available":
      !received?(index===0?"simulated_available":index===1?"countered":"not_reached"):
      index===3?"countered":"simulated_available"})),
    counterplay:{status:breakthrough?"not_triggered":"simulated_counter",
      counter:"Hold stopperdybden og steng støttespillernes videre pasning",
      nextManagerResponse:"Sikre mottaksrommet med stopperne; behold midtbanestøtte og dekning på begge sider.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_general_principle_generic_game_hypothesis_not_observed",
      opponentPattern:"rehearsed_longer_pass_support",targetFlank:null,defensiveLine:line,
      receptionProbability:Math.round(reception*1000)/1000,
      conditionalContinuationProbability:Math.round(continuation*1000)/1000,
      receivingCover:receivingCover.map(p=>p.playerId),followingCover:followingCover.map(p=>p.playerId),
      supportingPlayers:[...receivingCover,...followingCover].map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      eventCount:1,randomDraws:1}};
}
export function annotateOpponentRehearsedOutletChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_rehearsed_outlet"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");
  if(i<0)return chances;
  const annotated=annotateOpponentRunChances(chances,phase);
  return annotated.map((c,index)=>index===i?{...c,tacticalMoment:{...c.tacticalMoment,
    kind:"opponent_rehearsed_outlet",label:"Innøvd lengre oppspill",
    basis:"simulated_rehearsed_outlet",keyAction:phase.steps[2].action}}:c);
}

// LSK's direct-play tradition: first contact and control of the loose ball
// are distinct. The four outcomes are gameplay hypotheses, not tracking data.
// This represents an anonymous opponent in a historical-style simulation.
// No opponent XI, player rating, measured dribble success or named player.
function resolveAnonymousCreativeAttack({plan,backs,screen,balanceScore,restDefenseScore,roll,creativeWeight}){
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  const rounded=v=>Math.round(v*1000)/1000;
  const avg=ps=>ps.reduce((sum,p)=>sum+p.matchScore,0)/ps.length;
  const presser=screen.slice().sort((a,b)=>Number(b.roleId==="pressing_midfielder")-Number(a.roleId==="pressing_midfielder")||b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId))[0];
  const cover=screen.find(p=>p.playerId!==presser.playerId&&["balancing_six","holding_midfielder"].includes(p.roleId));
  const coveringUnit=cover?[...backs,cover]:backs;
  // First engagement and remaining central cover are separate. A second
  // dedicated screen can protect the passing lane without double-counting
  // the first presser. Match fit is a bounded proxy, not a tackling rating.
  const dribble=clamp(0.55-(presser.matchScore-65)*0.005-(balanceScore-65)*0.002);
  const release=clamp(0.53-(avg(coveringUnit)-65)*0.004-(restDefenseScore-65)*0.003-(cover?0.08:0));
  const passed=roll<dribble,success=passed&&roll<dribble*release;
  const status=success?"creative_breakthrough":passed?"release_contained":"dribble_contained";
  const cause=success?"En kreativ motspiller passerer første forsvarer og finner rom for videre spill.":
    passed?"Første forsvarer passeres, men gjenværende sentral sikring stenger videre pasning.":
    "Vår første forsvarer stanser den individuelle utfordringen.";
  const actions=["En motspiller søker ballen mellom leddene","Første forsvarer utfordres individuelt",
    "Gjenværende sikring forsøker å stenge neste pasningsrom","Motstanderen forsøker å spille videre"];
  return {version:6,situation:"opponent_creative_attack",planId:plan.id,route:"historical_individual_creativity",
    status,side:success?"against":null,probability:rounded(dribble*release),
    xgDeltaFor:0,xgDeltaAgainst:success?0.07:-0.03,cause,
    steps:actions.map((action,i)=>({action,order:i+1,result:i===0||success||(passed&&i===1)?"simulated_available":
      !passed&&i>1?"not_reached":i===3?"not_reached":"countered"})),
    counterplay:{status:success?"not_triggered":"simulated_counter",
      counter:"Press med én spiller og behold sentral sikring bak ham",
      nextManagerResponse:"Bruk en egen balanserende sekser ved siden av den første presspilleren; unngå at begge går i samme duell.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_historical_creativity_anonymous_game_hypothesis_not_observed",
      selectedPattern:"historical_individual_creativity",creativeAlternativeWeight:creativeWeight,
      opponentPlayerId:null,targetFlank:null,dribbleProbability:rounded(dribble),
      conditionalReleaseProbability:rounded(release),firstDefenderId:presser.playerId,
      dedicatedCoverId:cover?.playerId||null,coveringPlayers:coveringUnit.map(p=>p.playerId),
      supportingPlayers:[presser,...coveringUnit].map(({playerId,roleId,position,matchScore})=>({playerId,roleId,position,matchScore})),
      eventCount:1,randomDraws:1}};
}
export function annotateOpponentCreativeAttackChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_creative_attack"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");
  if(i<0)return chances;
  return annotateOpponentRunChances(chances,phase).map((c,index)=>index===i?
    {...c,tacticalMoment:{...c.tacticalMoment,kind:"opponent_creative_attack",
      label:"Individuelt gjennombrudd imot",basis:"simulated_anonymous_creativity",keyAction:phase.steps[1].action}}:c);
}

export function resolveOpponentDirectSecondBall(session,{rng=Math.random}={}){
  if(session?.causalOpponentDirectSecondBallVersion!==1 ||
      session.opponent?.tacticalBehaviour?.attackingRunPattern!=="direct_duel_second_ball" ||
      !verifiedMatchLineup(session.lineupSnapshot))return null;
  const plan=session.activePlanSnapshot||session.tacticSnapshot;
  if(!plan?.id)return null;
  const {balanceScore,restDefenseScore}=session.teamFitSnapshot?.tacticalProfile||{};
  if(![balanceScore,restDefenseScore].every(v=>finite(v)&&v>=0&&v<=100))return null;
  const best=(positions,count)=>session.lineupSnapshot.filter(p=>positions.includes(p.position))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId)).slice(0,count);
  const backs=best(["CB"],2),screen=best(["DM","CM"],2);
  if(backs.length!==2||!screen.length)return null;
  const avg=ps=>ps.reduce((sum,p)=>sum+p.matchScore,0)/ps.length;
  const floor=ps=>Math.min(...ps.map(p=>p.matchScore));
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  // Positional match fit is a proxy, not a measured aerial-duel attribute.
  const first=clamp(0.54-(avg(backs)-65)*0.004-(floor(backs)-65)*0.001-(balanceScore-65)*0.002);
  const cover=(avg(screen)-65)*0.003+(floor(screen)-65)*0.001+(restDefenseScore-65)*0.004;
  const afterWon=clamp(0.62-cover),afterLost=clamp(0.38-cover);
  const draw=rng();
  if(!finite(draw))return null;
  const rawRoll=Math.max(0,Math.min(0.999999999,draw));
  const creativeEnabled=session.causalOpponentCreativeAlternativeVersion===1 &&
    session.opponent.tacticalBehaviour.creativePattern==="historical_individual_creativity";
  // One uniform draw selects the alternative AND resolves its conditional gates.
  // The 25% weight is an explicit gameplay choice, not observed LSK frequency.
  const creativeWeight=creativeEnabled?0.25:0;
  if(creativeEnabled&&rawRoll<creativeWeight){
    return resolveAnonymousCreativeAttack({plan,backs,screen,balanceScore,restDefenseScore,
      roll:rawRoll/creativeWeight,creativeWeight});
  }
  const roll=(rawRoll-creativeWeight)/(1-creativeWeight);
  const firstWon=roll<first;
  const secondWon=firstWon?roll<first*afterWon:roll<first+(1-first)*afterLost;
  const status=firstWon?(secondWon?"duel_and_second_ball":"second_ball_contained"):
    (secondWon?"second_ball_recovered":"both_contained");
  const cause={
    duel_and_second_ball:"Motstanderen vinner første duell og sikrer nedfallet til videre angrep.",
    second_ball_contained:"Motstanderen vinner første duell, men vår midtbane tar kontroll på andreballen.",
    second_ball_recovered:"Våre stoppere vinner første duell, men motstanderen samler den løse ballen.",
    both_contained:"Våre stoppere og midtbane vinner både første duell og andreballen."
  }[status];
  const actions=["Motstanderen spiller direkte framover","Første duell avgjøres",
    "Lagene konkurrerer om andreballen","Nedfallet sikres eller brukes til videre angrep"];
  const rounded=v=>Math.round(v*1000)/1000;
  return {version:6,situation:"opponent_direct_second_ball",planId:plan.id,
    route:"direct_duel_second_ball",status,side:secondWon?"against":null,
    probability:rounded(first*afterWon+(1-first)*afterLost),xgDeltaFor:0,
    xgDeltaAgainst:secondWon?(firstWon?0.07:0.04):-0.03,cause,
    steps:actions.map((action,index)=>({action,order:index+1,result:index===0?"simulated_available":
      index===1?(firstWon?"simulated_available":"countered"):
      index===2?(secondWon?"simulated_available":"countered"):
      secondWon?"simulated_available":"not_reached"})),
    counterplay:{status:secondWon?"not_triggered":"simulated_counter",
      counter:"Vinn første duell og behold sentral sikring rundt nedfallet",
      nextManagerResponse:"Sikre både stopperduellen og andreballrommet med sentral midtbanestøtte.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_direct_play_generic_second_ball_hypothesis_not_observed",
      opponentPattern:"direct_duel_second_ball",targetFlank:null,
      firstDuelProbability:rounded(first),secondBallAfterWonDuelProbability:rounded(afterWon),
      secondBallAfterLostDuelProbability:rounded(afterLost),firstDuelWonByOpponent:firstWon,
      secondBallWonByOpponent:secondWon,duelCover:backs.map(p=>p.playerId),
      secondBallCover:screen.map(p=>p.playerId),
      supportingPlayers:[...backs,...screen].map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      ...(creativeEnabled?{creativeAlternativeWeight:creativeWeight,selectedPattern:"direct_duel_second_ball"}:{}),
      eventCount:1,randomDraws:1}};
}
export function annotateOpponentDirectSecondBallChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_direct_second_ball"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");
  if(i<0)return chances;
  return annotateOpponentRunChances(chances,phase).map((c,index)=>index===i?
    {...c,tacticalMoment:{...c.tacticalMoment,kind:"opponent_direct_second_ball",
      label:"Direkte spill og andreball",basis:"simulated_direct_second_ball",keyAction:phase.steps[2].action}}:c);
}

// Only the existing scripted set-piece event can trigger this phase.
// Away scenario explicitly starts after a clearance; never replay its first duel.
export function resolveOpponentSetPiece(session,{rng=Math.random}={}){
  const pattern=session?.opponent?.tacticalBehaviour?.setPiecePattern;
  if(session?.causalOpponentSetPieceVersion!==1 ||
      !["historical_delivery_box_duel","historical_set_piece_focus"].includes(pattern) ||
      !verifiedMatchLineup(session.lineupSnapshot))return null;
  const segment=Array.isArray(session.timeline)?session.timeline.length:0;
  const eventId=session.events?.[segment]?.id;
  if(!["opp_set_piece_threat","opp_set_piece_second_ball"].includes(eventId))return null;
  const afterClearance=eventId==="opp_set_piece_second_ball";
  const planId=session.activePlanSnapshot?.id||session.tacticSnapshot?.id||session.selectedTacticId;
  if(!planId)return null;
  const {balanceScore,restDefenseScore}=session.teamFitSnapshot?.tacticalProfile||{};
  if(![balanceScore,restDefenseScore].every(v=>finite(v)&&v>=0&&v<=100))return null;
  const best=(positions,count)=>session.lineupSnapshot.filter(p=>positions.includes(p.position))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId)).slice(0,count);
  const backs=best(["CB"],2),keeper=best(["GK"],1),screen=best(["DM","CM"],2);
  if(backs.length!==2||keeper.length!==1||!screen.length)return null;
  const avg=ps=>ps.reduce((sum,p)=>sum+p.matchScore,0)/ps.length;
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  const delivery=clamp(0.52-(avg(backs)-65)*0.004-(keeper[0].matchScore-65)*0.002-(balanceScore-65)*0.002);
  const recovery=clamp(0.44-(avg(screen)-65)*0.004-(restDefenseScore-65)*0.004);
  const draw=rng();
  if(!finite(draw))return null;
  const roll=Math.max(0,Math.min(0.999999999,draw));
  const first=!afterClearance&&roll<delivery;
  const second=!first&&(afterClearance?roll<recovery:roll<delivery+(1-delivery)*recovery);
  const status=first?"first_contact_threat":second?"second_ball_threat":"contained";
  const cause=first?"Motstanderen når først fram til dødballen i boksen.":
    second?"Motstanderen tar nedfallet etter klareringen og opprettholder angrepet.":
    "Vårt forsvar sikrer klareringen og nedfallsrommet.";
  const actions=afterClearance?["Dødballen er allerede klarert","Lagene konkurrerer om nedfallet","Nedfallet kontrolleres eller avverges"]:
    ["Motstanderen slår en dødball mot boksen","Første kontakt avgjøres","Ved klarering konkurrerer lagene om nedfallet","Angrepet fortsetter eller avverges"];
  const results=afterClearance?["simulated_available",second?"simulated_available":"countered",second?"simulated_available":"not_reached"]:
    ["simulated_available",first?"simulated_available":"countered",first?"not_reached":second?"simulated_available":"countered",(first||second)?"simulated_available":"not_reached"];
  const rounded=v=>Math.round(v*1000)/1000;
  return {version:6,situation:"opponent_set_piece",planId,route:pattern,status,
    side:first||second?"against":null,probability:rounded(afterClearance?recovery:delivery+(1-delivery)*recovery),
    xgDeltaFor:0,xgDeltaAgainst:first?0.08:second?0.04:-0.03,cause,
    steps:actions.map((action,index)=>({action,order:index+1,result:results[index]})),
    counterplay:{status:first||second?"not_triggered":"simulated_counter",
      counter:"Beskytt boksen og nedfallsrommet",nextManagerResponse:"Behold stopperdekning og sentral sikring etter klarering.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_set_piece_tradition_scripted_scenario_not_observed",opponentPattern:pattern,eventId,afterClearance,
      firstContactProbability:afterClearance?null:rounded(delivery),conditionalRecoveryProbability:rounded(recovery),
      targetFlank:null,boxCover:[...backs,...keeper].map(p=>p.playerId),secondBallCover:screen.map(p=>p.playerId),
      supportingPlayers:[...backs,...keeper,...screen].map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      eventCount:1,randomDraws:1}};
}
export function annotateOpponentSetPieceChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_set_piece"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");
  if(i<0)return chances;
  return annotateOpponentRunChances(chances,phase).map((c,index)=>index===i?
    {...c,tacticalMoment:{...c.tacticalMoment,kind:"opponent_set_piece",label:"Dødball og nedfall",
      basis:"simulated_set_piece_scenario",keyAction:phase.steps[1].action}}:c);
}

// Generic short-pass alternative to Viking's overlap, not a documented
// historical sequence or named opponent XI. Separate first press and cover.
function vikingShortCombinationUnits(lineup,backs,balanceScore,restDefenseScore){
  const mids=lineup.filter(p=>["DM","CM"].includes(p.position));
  const order=(a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId);
  const first=mids.slice().sort((a,b)=>Number(b.roleId==="pressing_midfielder")-Number(a.roleId==="pressing_midfielder")||order(a,b))[0];
  if(!first)return null;
  const cover=mids.filter(p=>p.playerId!==first.playerId)
    .sort((a,b)=>Number(["balancing_six","holding_midfielder"].includes(b.roleId))-Number(["balancing_six","holding_midfielder"].includes(a.roleId))||order(a,b))[0];
  if(!cover)return null;
  const dedicated=["balancing_six","holding_midfielder"].includes(cover.roleId);
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  const centre=[cover,...backs],centreFit=centre.reduce((sum,p)=>sum+p.matchScore,0)/centre.length;
  const firstGate=clamp(0.57-(first.matchScore-65)*0.005-(balanceScore-65)*0.003);
  const nextGate=clamp(0.54-(centreFit-65)*0.004-(restDefenseScore-65)*0.004-(dedicated?0.07:0));
  return {first,cover,centre,dedicated,firstGate,nextGate};
}
function resolveVikingShortCombination(planId,units,roll,weight){
  const {first,cover,centre,dedicated,firstGate,nextGate}=units;
  const passed=roll<firstGate,success=passed&&roll<firstGate*nextGate;
  const status=success?"combination_breakthrough":passed?"third_man_contained":"support_pass_contained";
  const rounded=v=>Math.round(v*1000)/1000;
  const actions=["En motspiller møter ballen og tilbyr kort pasning","Første pressledd utfordres av støttepasningen",
    "En tredje spiller søker rommet bak pressleddet","Den gjenværende sikringen prøver å stenge gjennomspillet"];
  return {version:6,situation:"opponent_short_combination",planId,route:"rehearsed_short_pass_support",status,
    side:success?"against":null,probability:rounded(firstGate*nextGate),xgDeltaFor:0,
    xgDeltaAgainst:success?0.07:passed?-0.02:-0.03,
    cause:success?"Støttepasningen flytter første pressledd, og en tredje motspiller finner rom bak det.":
      passed?"Første pressledd passeres, men den gjenværende midtbanen og stopperne stenger gjennomspillet.":
      "Første presspiller stanser støttepasningen før kombinasjonen utvikles.",
    steps:actions.map((action,i)=>({action,order:i+1,result:i===0||success||(passed&&i<3)?"simulated_available":
      !passed&&i>1?"not_reached":"countered"})),
    counterplay:{status:success?"not_triggered":"simulated_counter",
      counter:"Fordel press og sikring mellom to sentrale spillere",
      nextManagerResponse:"La én midtbanespiller presse støttepasningen, mens en annen skjermer rommet bak.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_short_pass_principle_generic_game_hypothesis_not_observed",
      opponentPattern:"rehearsed_short_pass_support",opponentPlayerId:null,targetFlank:null,
      shortCombinationWeight:weight,selectedPattern:"rehearsed_short_pass_support",
      supportPassProbability:rounded(firstGate),conditionalThirdManProbability:rounded(nextGate),
      firstPresserId:first.playerId,centralCoverId:cover.playerId,dedicatedCover:dedicated,
      coveringPlayers:centre.map(p=>p.playerId),
      supportingPlayers:[first,...centre].map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      eventCount:1,randomDraws:1}};
}

// Schou-era offensive fullbacks: a sourced general principle, not an observed
// flank, exact combination, opponent XI or measured historical probability.
export function resolveOpponentFullbackOverlap(session,{rng=Math.random}={}){
  if(session?.causalOpponentFullbackOverlapVersion!==1||
      session.opponent?.tacticalBehaviour?.attackingRunPattern!=="rehearsed_fullback_overlap"||
      !verifiedMatchLineup(session.lineupSnapshot))return null;
  const planId=session.activePlanSnapshot?.id||session.tacticSnapshot?.id||session.selectedTacticId;
  if(!planId)return null;
  const {balanceScore,restDefenseScore}=session.teamFitSnapshot?.tacticalProfile||{};
  if(![balanceScore,restDefenseScore].every(v=>finite(v)&&v>=0&&v<=100))return null;
  const best=(positions,count=1)=>session.lineupSnapshot.filter(p=>positions.includes(p.position))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId)).slice(0,count);
  const left=best(["LB","LWB"]),right=best(["RB","RWB"]);
  const leftSupport=best(["LW","LM"]),rightSupport=best(["RW","RM"]);
  const backs=best(["CB"],2),screen=best(["DM","CM"]);
  if(!left.length||!right.length||!leftSupport.length||!rightSupport.length||backs.length!==2||!screen.length)return null;
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  const rounded=v=>Math.round(v*1000)/1000;
  const cover=(back,support)=>0.6*back.matchScore+0.4*support.matchScore;
  const leftCover=cover(left[0],leftSupport[0]),rightCover=cover(right[0],rightSupport[0]);
  // Weakest side is a game-model vulnerability, not observed scouting or an
  // inferred historical flank. Equal sides remain anonymous.
  const flank=leftCover+2<rightCover?"left":rightCover+2<leftCover?"right":null;
  const wideCover=flank==="left"?leftCover:flank==="right"?rightCover:(leftCover+rightCover)/2;
  const wide=flank==="left"?[...left,...leftSupport]:flank==="right"?[...right,...rightSupport]:[...left,...leftSupport,...right,...rightSupport];
  const box=[...backs,...screen];
  const boxFit=box.reduce((sum,p)=>sum+p.matchScore,0)/box.length;
  const overlap=clamp(0.58-(wideCover-65)*0.006-(balanceScore-65)*0.002);
  const finish=clamp(0.51-(boxFit-65)*0.004-(restDefenseScore-65)*0.004);
  const draw=rng();if(!finite(draw))return null;
  const rawRoll=Math.max(0,Math.min(0.999999999,draw));
  const shortUnits=session.causalOpponentShortCombinationVersion===1&&
    session.opponent.tacticalBehaviour.shortCombinationPattern==="rehearsed_short_pass_support"
    ?vikingShortCombinationUnits(session.lineupSnapshot,backs,balanceScore,restDefenseScore):null;
  // Only when both alternatives have verified defending units. One draw
  // chooses the route and its outcome; 40% is a gameplay assumption.
  const preference=session.causalOpponentAttackAdaptationVersion===1?session.opponentAttackRoutePreference:null;
  const shortWeight=shortUnits?(preference==="short_combination"?0.7:preference==="fullback_overlap"?0.15:0.4):0;
  if(shortUnits&&rawRoll<shortWeight)return resolveVikingShortCombination(planId,shortUnits,rawRoll/shortWeight,shortWeight);
  const roll=(rawRoll-shortWeight)/(1-shortWeight);
  const available=roll<overlap,success=available&&roll<overlap*finish;
  const status=success?"overlap_breakthrough":available?"box_contained":"overlap_contained";
  const actions=["Kantspilleren binder første forsvarer","Backen forsøker å overlappe på utsiden",
    "Overlappingen søker et innleggsvindu","Stopperne og sentral sikring konkurrerer om avslutningsrommet"];
  return {version:6,situation:"opponent_fullback_overlap",planId,route:"rehearsed_fullback_overlap",
    status,side:success?"against":null,probability:rounded(overlap*finish),
    xgDeltaFor:0,xgDeltaAgainst:success?0.07:available?-0.02:-0.03,
    cause:success?"Kant og overlappende back skaper innleggsrom, og motstanderen finner et avslutningsvindu.":
      available?"Overlappingen kommer frem, men stopperne og sentral sikring kontrollerer boksen.":
      "Kantstøtten og backen fordeler dekningen og stanser overlappingen.",
    steps:actions.map((action,i)=>({action,order:i+1,result:i===0||success||(available&&i<3)?"simulated_available":
      !available&&i>1?"not_reached":"countered"})),
    counterplay:{status:success?"not_triggered":"simulated_counter",
      counter:"Fordel kantdekning og behold sentral sikring",
      nextManagerResponse:"La kantstøtten følge overlappende back, og behold stoppere og sentral sikring i boksen.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_overlap_principle_generic_game_hypothesis_not_observed",opponentPattern:"rehearsed_fullback_overlap",
      opponentPlayerId:null,targetFlank:flank,flankSelectionBasis:"simulated_weakest_verified_wide_unit",
      leftCover:rounded(leftCover),rightCover:rounded(rightCover),overlapProbability:rounded(overlap),
      conditionalBoxProbability:rounded(finish),wideSupport:wide.map(p=>p.playerId),boxSupport:box.map(p=>p.playerId),
      supportingPlayers:[...wide,...box].map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      ...(shortUnits?{shortCombinationWeight:shortWeight,selectedPattern:"rehearsed_fullback_overlap"}:{}),
      eventCount:1,randomDraws:1}};
}
export function annotateOpponentFullbackOverlapChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_fullback_overlap"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");if(i<0)return chances;
  return annotateOpponentRunChances(chances,phase).map((c,index)=>index===i?
    {...c,tacticalMoment:{...c.tacticalMoment,kind:"opponent_fullback_overlap",label:"Offensiv backoverlapping",
      basis:"simulated_fullback_overlap",keyAction:phase.steps[1].action}}:c);
}

export function annotateOpponentShortCombinationChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_short_combination"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");if(i<0)return chances;
  return annotateOpponentRunChances(chances,phase).map((c,index)=>index===i?
    {...c,tacticalMoment:{...c.tacticalMoment,kind:"opponent_short_combination",label:"Kortpasningskombinasjon",
      basis:"simulated_rehearsed_short_pass",keyAction:phase.steps[2].action}}:c);
}

// Stabæk 2008: simultaneous room threats. The conditional sequence is a
// gameplay interpretation of documented roles, not a historical fixed move.
// One draw, no named opponent XI or extra shot. Distinct defending players
// contest creation, depth and the late arrival.
export function resolveOpponentThreeSpaceCombination(session,{rng=Math.random}={}){
  if(session?.causalOpponentThreeSpaceVersion!==1||
      session.opponent?.tacticalBehaviour?.attackingRunPattern!=="three_space_combination"||
      !verifiedMatchLineup(session.lineupSnapshot))return null;
  const plan=session.activePlanSnapshot||session.tacticSnapshot;
  const line=plan?.defensiveLine;
  if(!plan?.id||!Object.prototype.hasOwnProperty.call(BREAKTHROUGH_LINE_EXPOSURE,line))return null;
  const {balanceScore,restDefenseScore}=session.teamFitSnapshot?.tacticalProfile||{};
  if(![balanceScore,restDefenseScore].every(v=>finite(v)&&v>=0&&v<=100))return null;
  const best=(positions,count=1)=>session.lineupSnapshot.filter(p=>positions.includes(p.position))
    .sort((a,b)=>b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId)).slice(0,count);
  const left=best(["LB","LWB"]),right=best(["RB","RWB"]),lw=best(["LW","LM"]),rw=best(["RW","RM"]),backs=best(["CB"],2);
  const mids=best(["DM","CM"],2);
  if(!left.length||!right.length||!lw.length||!rw.length||backs.length!==2||mids.length!==2)return null;
  const first=mids.slice().sort((a,b)=>Number(b.roleId==="pressing_midfielder")-Number(a.roleId==="pressing_midfielder")||b.matchScore-a.matchScore||a.playerId.localeCompare(b.playerId))[0];
  const cover=mids.find(p=>p.playerId!==first.playerId);
  const dedicated=["balancing_six","holding_midfielder"].includes(cover.roleId);
  const avg=ps=>ps.reduce((sum,p)=>sum+p.matchScore,0)/ps.length;
  const clamp=v=>Math.max(0.12,Math.min(0.82,v));
  const round=v=>Math.round(v*1000)/1000;
  const leftFit=avg([...left,...lw]),rightFit=avg([...right,...rw]);
  const sideFit=Math.min(leftFit,rightFit);
  const sideGate=clamp(0.58-(sideFit-65)*0.005-(balanceScore-65)*0.002);
  const middleGate=clamp(0.58-(first.matchScore-65)*0.005-(balanceScore-65)*0.002);
  const sourceSpace=sideGate>middleGate+0.01?"wide":middleGate>sideGate+0.01?"between_lines":null;
  const flank=sourceSpace==="wide"?(leftFit+2<rightFit?"left":rightFit+2<leftFit?"right":null):null;
  // The strongest available opening is the gate, never the sum of two
  // threats. A tied evaluation does not fabricate a specific opening.
  const create=Math.max(sideGate,middleGate);
  const depth=clamp(0.52-(avg(backs)-65)*0.005+BREAKTHROUGH_LINE_EXPOSURE[line]-(restDefenseScore-65)*0.002);
  const late=clamp(0.48-(cover.matchScore-65)*0.006-(restDefenseScore-65)*0.004-(dedicated?0.07:0));
  const draw=rng();if(!finite(draw))return null;
  const roll=Math.max(0,Math.min(0.999999999,draw));
  const opened=roll<create;
  // Within the existing wide-opening interval, a second partition models
  // central cover being drawn out by a dribble. No extra draw, shot or
  // assumed opposing player. A dedicated screen resists leaving its zone.
  const dribbleEnabled=session.causalOpponentDribbleDisplacementVersion===1&&
    session.opponent.tacticalBehaviour.wideCreationPattern==="dribble_draw_cover"&&
    sourceSpace==="wide"&&flank!==null;
  const displacement=dribbleEnabled?clamp(0.50-(cover.matchScore-65)*0.005-
    (balanceScore-65)*0.003-(dedicated?0.15:0)):0;
  const pulled=dribbleEnabled&&opened&&roll<create*displacement;
  const displacedLate=dribbleEnabled?clamp(late+0.12):late;
  // Rescale only after the first gate. Conditional depth is unchanged;
  // only the late-run window expands if central cover leaves its zone.
  const localRoll=opened?(pulled?roll/(create*displacement):
    (roll/create-displacement)/(1-displacement)):0;
  const activeLate=pulled?displacedLate:late;
  // A central support striker may receive but still be denied the next
  // pass by renewed pressure. If the pass is intercepted, no downstream
  // run is credited. Keep wide displacement and central release exclusive.
  const pairingEnabled=session.causalOpponentSupportStrikerVersion===1&&
    session.opponent.tacticalBehaviour.centralCreationPattern==="support_striker_through_ball"&&
    sourceSpace==="between_lines";
  const release=pairingEnabled?clamp(0.68-(first.matchScore-65)*0.004-
    (balanceScore-65)*0.002-(first.roleId==="pressing_midfielder"?0.06:0)):1;
  const released=opened&&localRoll<release;
  const runRoll=released?localRoll/release:0;
  const depthWon=released&&runRoll<depth;
  const lateWon=released&&!depthWon&&runRoll<depth+(1-depth)*activeLate;
  const success=depthWon||lateWon;
  const totalProbability=create*release*(depth+(1-depth)*((1-displacement)*late+displacement*displacedLate));
  const status=depthWon?"depth_breakthrough":lateWon?"late_runner_breakthrough":
    released?"both_runs_contained":opened?"through_ball_contained":"creation_contained";
  const actions=["Kreative motspillere søker siderom og mellomrom",pairingEnabled?
    "Støttespissen søker mottak i mellomrommet":dribbleEnabled?
    (pulled?"Driblingen trekker den sentrale sikringen mot kanten":"Dribleren utfordrer kanten mens sentral sikring holder sonen"):"Første mottak forsøker å åpne pasningsvinduet",
    ...(pairingEnabled?["Støttespissen forsøker gjennomspillet under fornyet press"]:[]),
    "Spissen søker et timet gjennombrudd bak stopperne","Et separat midtbaneløp utfordrer sikringen hvis første pasning avverges"];
  const results=["simulated_available",opened?"simulated_available":"countered",
    ...(pairingEnabled?[!opened?"not_reached":released?"simulated_available":"countered"]:[]),
    !released?"not_reached":depthWon?"simulated_available":"countered",
    !released||depthWon?"not_reached":lateWon?"simulated_available":"countered"];
  return {version:6,situation:"opponent_three_space_combination",planId:plan.id,route:"three_space_combination",status,
    side:success?"against":null,probability:round(totalProbability),xgDeltaFor:0,
    xgDeltaAgainst:depthWon?0.07:lateWon?0.05:released?-0.02:-0.03,
    cause:depthWon?(pairingEnabled?"Støttespissen finner gjennomspillet til spissmakkerens timede bakromsløp.":"Kreativ mottaker åpner et pasningsvindu og et timet løp truer bakrommet."):
      lateWon?(pulled?"Driblingen trekker sikringen ut, og et sent midtbaneløp utnytter rommet som åpnes.":"Stopperne stenger første bakromsløp, men et sent midtbaneløp utnytter rommet foran dem."):
      released?"Stopperne stenger bakrommet og en separat midtbanespiller følger det sene løpet.":
      opened?"Støttespissen mottar ballen, men fornyet press avverger gjennomspillet.":
      "Kant- og sentraldekningen stenger det første kreative mottaket.",
    steps:actions.map((action,i)=>({action,order:i+1,result:results[i]})),
    counterplay:{status:success?"not_triggered":"simulated_counter",
      counter:"Behold tre adskilte sikringsoppgaver",
      nextManagerResponse:"Press mottakeren uten å trekke stopperne ut, og behold en egen midtbanespiller til det sene løpet.",
      automaticallyExecuted:false},
    evidence:{basis:"sourced_simultaneous_space_threats_generic_game_hypothesis_not_observed",
      opponentPattern:"three_space_combination",opponentPlayerId:null,sourceSpace,targetFlank:flank,
      sideOpeningProbability:round(sideGate),betweenLinesOpeningProbability:round(middleGate),creationProbability:round(create),
      conditionalDepthProbability:round(depth),conditionalLateRunnerProbability:round(late),
      ...(dribbleEnabled?{wideCreationPattern:"dribble_draw_cover",conditionalDisplacementProbability:round(displacement),
        conditionalLateRunnerIfDisplaced:round(displacedLate),centralCoverDisplaced:pulled,
        displacedCoverId:pulled?cover.playerId:null}:{}),
      ...(pairingEnabled?{centralCreationPattern:"support_striker_through_ball",conditionalReleaseProbability:round(release),
        supportStrikerReceived:opened,throughBallReleased:released,renewedPresserId:first.playerId}:{}),
      firstPresserId:first.playerId,lateRunnerCoverId:cover.playerId,dedicatedCover:dedicated,depthCover:backs.map(p=>p.playerId),
      supportingPlayers:[...left,...right,...lw,...rw,first,cover,...backs].map(({playerId,position,roleId,matchScore})=>({playerId,position,roleId,matchScore})),
      eventCount:1,randomDraws:1}};
}
export function annotateOpponentThreeSpaceChances(chances,phase){
  if(!Array.isArray(chances)||phase?.situation!=="opponent_three_space_combination"||phase.side!=="against")return chances;
  const i=chances.findIndex(c=>c.side==="against");if(i<0)return chances;
  return annotateOpponentRunChances(chances,phase).map((c,index)=>index===i?
    {...c,tacticalMoment:{...c.tacticalMoment,kind:"opponent_three_space_combination",label:"Gjennombrudd i tre rom",
      basis:"simulated_three_space_combination",keyAction:phase.steps[phase.status==="late_runner_breakthrough"?phase.steps.length-1:phase.steps.length-2].action}}:c);
}
