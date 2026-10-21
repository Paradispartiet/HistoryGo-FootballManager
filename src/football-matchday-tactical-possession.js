// A matchday possession / transition account, attached to an ALREADY scored
// manager decision. Never generate a second xG effect, goal or random roll.
// These are simulated event resolutions: not historical player tracking.
const SITUATIONS = Object.freeze({
  press_winback_high: "press_for",
  press_baited: "press_for",
  opp_possession_grind: "press_for",
  opp_possession_switch: "press_for",
  opp_high_press: "escape_press",
  opp_press_second_balls: "second_ball",
  press_first_line_broken: "escape_press",
  cat_libero_pressed: "escape_press",
  cat_second_ball_pressure: "second_ball",
  pyramid_second_ball: "second_ball",
  opp_set_piece_second_ball: "second_ball",
  opp_counter_threat: "defend_counter",
  opp_counter_second_wave: "defend_counter",
  modern_transition_threat: "defend_counter",
  rest_counter_test: "defend_counter",
  rest_counterpress_gap: "defend_counter",
  press_space_behind: "defend_counter",
  cat_counter_window: "attack_counter",
  cat_wingback_escape: "attack_counter"
});

const STAGES = Object.freeze({
  press_for: {
    positive: ["Pressutløser oppstår", "Førsteforsvarer presser ballen",
      "Støttespillerne bryter neste pasning", "Laget vinner ballen og kan fortsette angrepet"],
    negative: ["Presset settes inn", "Støtten rundt ballfører mangler",
      "Motstanderen spiller forbi pressleddet", "Laget må løpe hjem og forsvare neste angrep"]
  },
  escape_press: {
    positive: ["Motstanderen presser oppspillet", "Ballfører finner støttevinkel",
      "Laget spiller forbi første pressledd", "Kontrollert videre angrep blir mulig"],
    negative: ["Motstanderen presser oppspillet", "Støttevinklene stenges",
      "Oppspillet brytes eller må klareres", "Motstanderen får gunstig utgangspunkt for nytt angrep"]
  },
  second_ball: {
    positive: ["Første duell utkjempes", "Støttespillerne er på plass",
      "Laget sikrer andreballen", "Ny angrepsfase blir mulig"],
    negative: ["Første duell utkjempes", "Nedfallsrommet blir stående åpent",
      "Motstanderen får andreballen", "Et nytt angrep må forsvares"]
  },
  defend_counter: {
    positive: ["Balltap eller klarering utløser overgangstrussel",
      "Restforsvaret stenger første vertikale pasning",
      "Støttespillerne samler blokken", "Kontringen stoppes før det siste rommet åpnes"],
    negative: ["Balltap eller klarering utløser overgangstrussel",
      "Første pasning spiller forbi sikringen",
      "Kontringsløpet angriper rommet bak midtbanen",
      "Motstanderen får en farligere angrepssituasjon"]
  },
  attack_counter: {
    positive: ["Laget vinner eller mottar ball i overgang",
      "Første fremoverpasning treffer en støttespiller",
      "Et dybdeløp setter motstanderen i ubalanse",
      "Laget får mulighet til å angripe siste ledd"],
    negative: ["Laget vinner eller mottar ball i overgang",
      "Første pasning mangler riktig støtte",
      "Motstanderens restforsvar tar ned kontringen",
      "Overgangen stopper og laget må etablere ny balanse"]
  }
});

const finite = (v) => typeof v === "number" && Number.isFinite(v);

// Selected events only. A neutral choice, missing effects or a non-transition
// event is not evidence that a decisive ball recovery/turnover happened.
export function resolveTacticalPossession({ event, decision } = {}) {
  const kind = SITUATIONS[event?.id];
  if (!kind || !["positive", "negative"].includes(decision?.tone) ||
      !decision?.effects || !finite(decision.effects.xgDeltaFor) ||
      !finite(decision.effects.xgDeltaAgainst)) return null;
  const favourable = decision.tone === "positive";
  const steps = STAGES[kind][favourable ? "positive" : "negative"];
  const xgFor = decision.effects.xgDeltaFor;
  const xgAgainst = decision.effects.xgDeltaAgainst;
  const direction = ["defend_counter"].includes(kind)
    ? (favourable ? "for" : "against")
    : favourable ? "for" : "against";
  const hasShotPressure = direction === "against" ? xgAgainst > 0 : xgFor > 0;
  return {
    eventId: event.id,
    eventSequence: event.sequence || null,
    decisionId: decision.optionId,
    kind,
    outcome: favourable ? "successful" : "broken",
    side: direction,
    steps: steps.map((action, index) => ({
      order: index + 1, action,
      result: !favourable && index >= 2 ? "countered" : "played"
    })),
    summary: steps[3],
    // This is the EXACT already-counted decision modifier, not an xG
    // measurement for a specific pass, shot, ball carrier or pitch region.
    existingXgEffect: { for: xgFor, against: xgAgainst },
    chancePressure: hasShotPressure ? "increased" : "not_increased",
    scoring: "existing_decision_only"
  };
}

export function summarizeTacticalPossessions(decisions = []) {
  const chains = decisions.map((entry) => entry?.tacticalPossession).filter(Boolean);
  return {
    total: chains.length,
    successful: chains.filter((chain) => chain.outcome === "successful").length,
    broken: chains.filter((chain) => chain.outcome === "broken").length,
    kinds: [...new Set(chains.map((chain) => chain.kind))],
    // No summed xG: decisions already provide these exact effects.
    xgAlreadyCounted: true
  };
}
