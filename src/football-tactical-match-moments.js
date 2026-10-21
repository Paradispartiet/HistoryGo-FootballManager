// A tactical explanation anchored to a chance the existing xG/clock engine
// already generated. NEVER generates another chance, roll, goal or xG bonus.
// Historical opponents lack event tracking: these labels are simulated causal
// hypotheses, not claims about the movements of individual real-world players.
const ADVANTAGE_KINDS = Object.freeze({
  in_possession: ["breakthrough", "Gjennombrudd", "Pasningskjeden skaper en sjanse."],
  out_of_possession: ["recovery", "Gjenvinning", "Samlet press gir mulighet til å gjenvinne og angripe."],
  transition_defend: ["recovery", "Motpress", "Nærmeste gjenvinningsledd kan vinne tilbake ballen."],
  transition_attack: ["counterattack", "Kontring", "Første fremoverpasning åpner kontringsrommet."]
});
const COUNTERED_KINDS = Object.freeze({
  in_possession: ["turnover", "Balltap", "Motspillet bryter en pasningsforbindelse før sjansen imot."],
  out_of_possession: ["press_broken", "Press brutt", "Motstanderen spiller forbi første pressledd."],
  transition_defend: ["press_broken", "Motpress brutt", "Motstanderen spiller ut av gjenvinningspresset."],
  transition_attack: ["turnover", "Stoppet kontring", "Første overgang blir stengt, og motstanderen kan angripe."]
});

export function deriveTacticalChanceMoment(session, chance) {
  const planId = session?.activePlanSnapshot?.id || session?.selectedTacticId;
  const sequences = session?.planMatchup?.sequences;
  const entry = Array.isArray(sequences)
    ? sequences.find((sequence) => sequence?.id === planId && sequence.ready && sequence.liveExchange)
    : null;
  if (!entry || !chance || !["for", "against"].includes(chance.side)) return null;

  const exchange = entry.liveExchange;
  if (!["advantage", "countered"].includes(exchange.status)
      || entry.status !== exchange.status || !Array.isArray(exchange.steps)
      || exchange.steps.length !== 4) return null;

  // A positive plan is an explanation only of OUR existing chance; a blocked
  // plan can explain ONLY an already-created chance against us.
  const side = exchange.status === "advantage" ? "for" : "against";
  if (chance.side !== side) return null;
  const phase = entry.phase;
  // Legacy sequence results do not carry phase; caller can supply the
  // canonical plan phase from a stable game model without re-evaluation.
  const mapping = exchange.status === "advantage" ? ADVANTAGE_KINDS : COUNTERED_KINDS;
  const descriptor = mapping[phase];
  if (!descriptor) return null;

  const [kind, label, description] = descriptor;
  const actions = exchange.steps.map((step) => ({
    action: String(step.action || ""),
    outcome: step.result === "blocked" ? "blocked" : "available"
  }));
  const breakpoint = actions.findIndex((step) => step.outcome === "blocked");
  if ((exchange.status === "countered" && breakpoint < 0)
      || (exchange.status === "advantage" && breakpoint >= 0)) return null;
  return {
    kind, label, description, planId, planTitle: entry.title || planId,
    status: exchange.status, side, keyAction: breakpoint >= 0
      ? actions[breakpoint].action : actions[actions.length - 1].action,
    cause: exchange.cause || "", steps: actions,
    failureConsequence: exchange.failureConsequence || null,
    observed: false, // simulated attribution to an ACTUAL generated chance
    xgDelta: 0
  };
}

// At most one tactical annotation per already-generated period. Associating
// every chance with the same hypothetical four-step chain would be spam and
// would wrongly suggest the tactical pattern caused each attempt.
export function annotatePeriodTacticalChances(session, chances) {
  if (!Array.isArray(chances) || chances.length === 0) return [];
  let annotated = false;
  return chances.map((chance) => {
    if (annotated) return { ...chance };
    const tacticalMoment = deriveTacticalChanceMoment(session, chance);
    if (!tacticalMoment) return { ...chance };
    annotated = true;
    return { ...chance, tacticalMoment };
  });
}
