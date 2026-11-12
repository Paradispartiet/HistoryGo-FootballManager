// v8.0 first step: when no specialised v6 phase owns the period, resolve
// an already-authored four-action plan sequence BEFORE chance generation.
// Do not add a second motor, RNG, chance or static sequenceEdge modifier.
// This is a bounded deterministic gameplay hypothesis, NOT tracking data.
import { TACTICAL_SEQUENCES } from "./football-tactical-sequences.js";

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
