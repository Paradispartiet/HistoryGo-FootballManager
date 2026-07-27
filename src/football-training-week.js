// HG Football Manager — Training Week v0.2
//
// En liten, ren modell for ett taktisk treningsfokus per Club Week. Modulen
// kjenner ikke DOM, localStorage, unlocks eller app-state. app.js eier lagring,
// mens kampmotoren får et låst snapshot når en kampsesjon opprettes.

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const FOCUS_DEFINITIONS = [
  {
    id: "rest_defence",
    name: "Restforsvar",
    shortDescription: "Sikre laget ved balltap og dempe kontringer.",
    effectHint: "Kan hjelpe mot kontringer og bakrom.",
    affectedMetrics: ["restDefenseScore", "balanceScore"],
    bestAgainstOpponentStyles: ["direct_counter_opponent"],
    relatedStaffTypes: ["manager", "assistant_coach", "first_team_coach", "goalkeeper_coach", "fitness_coach", "analyst"],
    relatedFormationEffects: ["restDefenceSecurity", "defensiveSecurity"]
  },
  {
    id: "pressing",
    name: "Pressing",
    shortDescription: "Samkjør presshøyde, retning og gjenvinning.",
    effectHint: "Kan styrke grep som presser høyere.",
    affectedMetrics: ["pressScore"],
    bestAgainstOpponentStyles: ["possession_opponent"],
    relatedStaffTypes: ["fitness_coach", "training_coach", "tactical_coach", "coach", "first_team_coach"],
    relatedFormationEffects: ["pressingIntensity"]
  },
  {
    id: "build_up",
    name: "Oppbygging",
    shortDescription: "Spill tryggere og raskere gjennom første pressledd.",
    effectHint: "Kan hjelpe mot høyt press.",
    affectedMetrics: ["buildUpScore", "roleFitAverage"],
    bestAgainstOpponentStyles: ["high_press_opponent"],
    relatedStaffTypes: ["manager", "assistant_coach", "tactical_coach", "technical_coach", "analyst"],
    relatedFormationEffects: ["buildUpQuality", "centralControl"]
  },
  {
    id: "width",
    name: "Bredde",
    shortDescription: "Skap og bruk rom utenfor en kompakt blokk.",
    effectHint: "Kan hjelpe mot lav blokk og tette rom.",
    affectedMetrics: ["widthScore"],
    bestAgainstOpponentStyles: ["low_block_opponent"],
    relatedStaffTypes: ["manager", "assistant_coach", "tactical_coach", "technical_coach", "first_team_coach"],
    relatedFormationEffects: ["widthCreation", "wideOverloads"]
  },
  {
    id: "depth_runs",
    name: "Dybdeløp",
    shortDescription: "Timing og bevegelser bak motstanderens ledd.",
    effectHint: "Kan true rom bak press eller en høy linje.",
    affectedMetrics: ["depthScore"],
    bestAgainstOpponentStyles: ["high_press_opponent", "low_block_opponent"],
    relatedStaffTypes: ["fitness_coach", "training_coach", "technical_coach", "first_team_coach"],
    relatedFormationEffects: ["transitionThreat", "attackingPatterns"]
  },
  {
    id: "role_understanding",
    name: "Rolleforståelse",
    shortDescription: "Gjør ansvar, relasjoner og valg i systemet tydeligere.",
    effectHint: "Kan gi litt tryggere managergrep i krevende situasjoner.",
    affectedMetrics: ["roleFitAverage"],
    bestAgainstOpponentStyles: [],
    relatedStaffTypes: ["assistant_coach", "tactical_coach", "training_coach", "technical_coach", "coach", "goalkeeper_coach"],
    relatedFormationEffects: ["coachingDemand"]
  },
  {
    id: "set_pieces",
    name: "Dødballer",
    shortDescription: "Markeringsansvar og disiplin rundt egen boks.",
    effectHint: "Kan dempe dødball- og duelltrussel.",
    affectedMetrics: ["restDefenseScore", "balanceScore"],
    bestAgainstOpponentStyles: ["physical_set_piece_opponent"],
    relatedStaffTypes: ["assistant_coach", "first_team_coach", "goalkeeper_coach", "analyst", "coach"],
    relatedFormationEffects: ["defensiveSecurity"]
  },
  {
    id: "formation_familiarity",
    name: "Formasjonstilvenning",
    shortDescription: "Repeter avstander og bevegelser i valgt system.",
    effectHint: "Kan gi litt bedre systemforståelse og tilvenning.",
    affectedMetrics: ["formationFamiliarity", "coachUnderstanding"],
    bestAgainstOpponentStyles: [],
    relatedStaffTypes: ["manager", "assistant_coach", "tactical_coach", "training_coach", "first_team_coach", "analyst"],
    relatedFormationEffects: ["coachingDemand"]
  }
];

export const TRAINING_FOCUSES = Object.freeze(FOCUS_DEFINITIONS.map((focus) => Object.freeze({ ...focus })));

export function getTrainingFocus(focusId) {
  return TRAINING_FOCUSES.find((focus) => focus.id === focusId) || null;
}

// Matchup-risiko-token (motstanderens spillestil ditt system sliter mot) → hvilket
// treningsfokus som adresserer den. Kobler Formation Knowledge Engine til
// treningsuka: å trene det matchupen er risikabel på er kontekstuelt relevant
// (README pkt. 4 – belønn relevante valg, ikke universelt «beste» valg).
const RISK_TOKEN_TO_FOCUS = {
  high_press: "build_up",
  aggressive_man_press: "build_up",
  build_from_back: "pressing",
  possession_positional: "pressing",
  direct_counter: "rest_defence",
  fast_transition: "rest_defence",
  fast_runners_in_behind: "rest_defence",
  switching_play: "rest_defence",
  wide_overload: "rest_defence",
  deep_low_block: "width",
  passive_mid_block: "width",
  compact_532: "width",
  narrow_442: "width",
  three_at_back: "width",
  target_man_direct: "set_pieces",
  two_striker_press: "build_up"
};

// Hvilke treningsfokus som er relevante mot en gitt formasjons-matchup (utledet
// fra matchupens risiko-tokens). Tom liste hvis ingen matchup/risiko.
export function getMatchupRelevantFocusIds(formationMatchup) {
  const risks = asArray(formationMatchup?.risks);
  const focusIds = risks
    .map((risk) => RISK_TOKEN_TO_FOCUS[risk?.token])
    .filter(Boolean);
  return [...new Set(focusIds)];
}

// Svakhetsmetrikk fra forrige kamp (UNIT_LABELS-nøkkel) → treningsfokus som
// adresserer den. Lar treningsuka belønne å fikse det som faktisk gikk galt
// (reaktiv kontekst, komplementært til den proaktive matchup-relevansen).
const WEAKNESS_METRIC_TO_FOCUS = {
  restDefenseScore: "rest_defence",
  balanceScore: "rest_defence",
  pressScore: "pressing",
  buildUpScore: "build_up",
  widthScore: "width",
  depthScore: "depth_runs",
  roleFitAverage: "role_understanding",
  relationshipScore: "role_understanding"
};

export function getWeaknessRelevantFocusId(weaknessMetric) {
  return WEAKNESS_METRIC_TO_FOCUS[weaknessMetric] || null;
}

// Lesbare navn på svakhetsmetrikkene (for treningsråd-teksten).
const UNIT_LABELS_TEXT = {
  restDefenseScore: "restforsvaret",
  balanceScore: "midtbanebalansen",
  pressScore: "presslinjen",
  buildUpScore: "oppbyggingsspillet",
  widthScore: "kantspillet",
  depthScore: "bakromstruslene",
  roleFitAverage: "rolleforståelsen",
  relationshipScore: "rollerelasjonene"
};

export function sanitizeWeeklyTrainingFocus(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const week = Number(value.week);
  const focus = getTrainingFocus(value.focusId);
  if (!focus || !Number.isInteger(week) || week < 1) return null;
  return {
    focusId: focus.id,
    week,
    appliedSessionId: typeof value.appliedSessionId === "string" && value.appliedSessionId
      ? value.appliedSessionId
      : null
  };
}

export function calculateTrainingStaffSupport({ focusId, coachContext } = {}) {
  const focus = getTrainingFocus(focusId);
  if (!focus) return { level: "weak", label: "Svak", score: 0, matchedStaffTypes: [] };

  const activeStaff = asArray(coachContext?.activeStaff);
  const matched = activeStaff
    .map((member) => member?.category)
    .filter((category) => focus.relatedStaffTypes.includes(category));
  const uniqueMatched = [...new Set(matched)];

  const profile = coachContext?.effectProfile || {};
  let profileSupport = 0;
  if (focus.id === "pressing" || focus.id === "depth_runs") profileSupport = Number(profile.pressingDrills) || 0;
  else if (focus.id === "rest_defence" || focus.id === "set_pieces") profileSupport = Number(profile.defensiveOrganisation) || 0;
  else if (focus.id === "build_up" || focus.id === "width") profileSupport = Number(profile.attackingPatterns) || 0;
  else if (focus.id === "role_understanding") profileSupport = Number(profile.roleFitClarity) || 0;
  else if (focus.id === "formation_familiarity") profileSupport = Number(profile.formationFamiliarity) || 0;

  const score = clamp(uniqueMatched.length * 24 + profileSupport * 0.55, 0, 100);
  const level = score >= 62 ? "strong" : score >= 30 ? "medium" : "weak";
  const label = level === "strong" ? "Sterk" : level === "medium" ? "Middels" : "Svak";
  return { level, label, score: Math.round(score), matchedStaffTypes: uniqueMatched };
}

export function recommendTrainingFocus({ opponent, teamFit, formationMatchup, lastMatchWeaknessMetric } = {}) {
  // Matchup-bevisst råd har førsteprioritet: tren det den konkrete matchupen mot
  // neste motstander er risikabel på (proaktiv kontekstuell relevans).
  const matchupFocusIds = getMatchupRelevantFocusIds(formationMatchup);
  if (matchupFocusIds.length > 0) {
    const riskTokens = asArray(formationMatchup?.risks).map((risk) => risk?.token).filter(Boolean);
    const names = matchupFocusIds.map((id) => getTrainingFocus(id)?.name).filter(Boolean);
    return {
      focusIds: matchupFocusIds.slice(0, 2),
      reason: `Matchup mot ${opponent?.name || "neste motstander"} er risikabel på ${riskTokens.join(", ")}. ${names.join(" eller ")} adresserer det.`
    };
  }

  // Reaktiv kontekst: tren det forrige kamp avslørte som svakest.
  const weaknessFocusId = getWeaknessRelevantFocusId(lastMatchWeaknessMetric);
  if (weaknessFocusId) {
    const focus = getTrainingFocus(weaknessFocusId);
    return {
      focusIds: [weaknessFocusId],
      reason: `Forrige kamp avslørte svakhet i ${UNIT_LABELS_TEXT[lastMatchWeaknessMetric] || "et lagområde"}. ${focus?.name} adresserer det.`
    };
  }

  const opponentId = opponent?.id || null;
  const opponentMatches = TRAINING_FOCUSES.filter((focus) => focus.bestAgainstOpponentStyles.includes(opponentId));
  if (opponentMatches.length > 0) {
    return {
      focusIds: opponentMatches.slice(0, 2).map((focus) => focus.id),
      reason: `Motstander: ${opponent.name || "kjent profil"}. ${opponentMatches.map((focus) => focus.name).join(" eller ")} passer kampbildet.`
    };
  }

  const metrics = teamFit?.metrics || {};
  const candidates = [
    ["rest_defence", metrics.restDefenseScore],
    ["pressing", metrics.pressScore],
    ["build_up", metrics.buildUpScore],
    ["width", metrics.widthScore],
    ["depth_runs", metrics.depthScore],
    ["role_understanding", metrics.roleFitAverage]
  ].filter(([, value]) => Number.isFinite(Number(value)));
  candidates.sort((a, b) => Number(a[1]) - Number(b[1]));
  const focusId = candidates[0]?.[0] || "role_understanding";
  const focus = getTrainingFocus(focusId);
  return {
    focusIds: [focusId],
    reason: `Generelt råd: ${focus.name} kan styrke lagets svakeste kampområde.`
  };
}

// Club Week Orchestrator v1: hvilke off-pitch-effekter ett valgt treningsfokus
// gir. Dette er den manglende lenken — treningsvalget skal faktisk bevege
// konteksten utenfor banen, ikke bare være et kampdag-snapshot. Tallene er små
// (samme størrelsesorden som innboksvalg) og holdt i tråd med fokusets natur:
// restitusjonspreget arbeid letter kroppene litt, hardt fysisk arbeid koster
// litt, taktisk arbeid løfter klarhet/samhold. Aldri overall, aldri lagscore.
const FOCUS_OFFPITCH_EFFECTS = {
  rest_defence: { fatigue: -4, injuryRisk: -3, tacticalClarity: 4, cohesion: 2 },
  pressing: { fatigue: 6, wear: 4, injuryRisk: 3, tacticalClarity: 3, confidence: 2 },
  build_up: { tacticalClarity: 5, cohesion: 3, fatigue: 2 },
  width: { tacticalClarity: 3, cohesion: 2, fatigue: 3 },
  depth_runs: { fatigue: 5, wear: 3, confidence: 3, tacticalClarity: 2 },
  role_understanding: { tacticalClarity: 6, cohesion: 3, roleFrustration: -3 },
  set_pieces: { tacticalClarity: 3, cohesion: 2, fatigue: 2 },
  formation_familiarity: { tacticalClarity: 5, cohesion: 4, trainingHappiness: 2 }
};

// Hvor hardt et treningsfokus tar på beina. Dette tallet fantes allerede i
// FOCUS_OFFPITCH_EFFECTS, men lå innelåst: `applyWeeklyPlayerRecovery` i app.js
// lette etter `fatigueLoad`/`intensity` på fokus-objektet — felter som ikke
// finnes — og falt derfor alltid tilbake til nøytralt. Treningsvalget påvirket
// aldri hvor mye laget hentet inn igjen.
//
// Skalaen er den samme som i tabellen: −4 (restitusjonspreget) til +6 (press).
export function getTrainingFocusFatigue(focusId) {
  const effects = FOCUS_OFFPITCH_EFFECTS[focusId];
  return effects && Number.isFinite(Number(effects.fatigue)) ? Number(effects.fatigue) : 0;
}

// Bygg en off-pitch-hendelse for et valgt treningsfokus (stabil event-form for
// applyOffPitchEvent: { id, type, title, description, effects }). Returnerer
// null hvis fokuset er ukjent eller mangler definerte effekter.
export function buildTrainingFocusOffPitchEvent(focusId) {
  const focus = getTrainingFocus(focusId);
  const effects = FOCUS_OFFPITCH_EFFECTS[focus?.id];
  if (!focus || !effects) {
    return null;
  }
  return {
    id: `training_focus:${focus.id}`,
    type: "training",
    title: `Treningsfokus: ${focus.name}`,
    description: focus.shortDescription || "",
    effects: { ...effects }
  };
}

export function createTrainingMatchdaySnapshot({ selection, clubWeek, coachContext, opponent, formationMatchup, lastMatchWeaknessMetric } = {}) {
  const stored = sanitizeWeeklyTrainingFocus(selection);
  const week = Number(clubWeek);
  if (!stored || !Number.isInteger(week) || stored.week !== week || stored.appliedSessionId) return null;

  const focus = getTrainingFocus(stored.focusId);
  const staffSupport = calculateTrainingStaffSupport({ focusId: focus.id, coachContext });
  const baseBonus = staffSupport.level === "strong" ? 4 : staffSupport.level === "medium" ? 3 : 2;

  // Kontekstuell relevans (README pkt. 4): fokuset belønnes når det treffer
  // konteksten – enten proaktivt (adresserer en matchup-risiko mot neste
  // motstander) eller reaktivt (fikser svakheten forrige kamp avslørte). Et
  // irrelevant fokus får kun base – relevante valg belønnes, ikke alle valg.
  const addressesMatchup = getMatchupRelevantFocusIds(formationMatchup).includes(focus.id);
  const addressesLastWeakness = getWeaknessRelevantFocusId(lastMatchWeaknessMetric) === focus.id;
  const contextRelevant = addressesMatchup || addressesLastWeakness;
  const metricBonus = contextRelevant ? baseBonus + 1 : baseBonus;
  const metricBonuses = {};
  focus.affectedMetrics.forEach((metric) => {
    if (!["formationFamiliarity", "coachUnderstanding"].includes(metric)) metricBonuses[metric] = metricBonus;
  });

  return {
    focusId: focus.id,
    name: focus.name,
    week,
    effectHint: focus.effectHint,
    affectedMetrics: [...focus.affectedMetrics],
    staffSupport: { ...staffSupport },
    opponentFit: focus.bestAgainstOpponentStyles.includes(opponent?.id),
    contextRelevant,
    contextReason: addressesMatchup ? "matchup" : addressesLastWeakness ? "forrige_kamp" : null,
    metricBonuses,
    coachBonuses: focus.id === "formation_familiarity"
      ? { formationFamiliarity: metricBonus, coachUnderstanding: Math.max(1, metricBonus - 1) }
      : focus.id === "role_understanding"
        ? { roleFitClarity: metricBonus }
        : {}
  };
}

const OPTION_FOCUS = {
  pressing: ["press_higher", "counterpress", "match_physical", "steer_wide"],
  build_up: ["play_through", "play_out", "short_build", "use_keeper", "drop_deeper"],
  width: ["switch_play", "attack_wide", "use_width", "overlap", "cross_early"],
  depth_runs: ["attack_space", "run_beyond", "keep_attacking", "direct_ball"],
  rest_defence: ["stay_compact", "protect_center", "hold_shape", "drop_deeper", "secure_rest_defence"],
  set_pieces: ["stay_disciplined", "tight_marking"],
  role_understanding: ["trust_system", "hold_shape", "stay_compact"],
  formation_familiarity: ["trust_system", "hold_shape", "stay_compact"]
};

function eventMatchesFocus(event, focusId) {
  const id = String(event?.id || "");
  if (focusId === "rest_defence" && /counter|transition|ball_loss/.test(id)) return true;
  if (focusId === "set_pieces" && /set_piece|duel/.test(id)) return true;
  return false;
}

export function evaluateTrainingDecisionSupport({ event, option, trainingFocus } = {}) {
  const focus = getTrainingFocus(trainingFocus?.focusId);
  if (!focus) return { relevant: false, eventMitigation: false, scoreBonus: 0 };

  const checkKeys = asArray(option?.checks).map((check) => check?.key).filter(Boolean);
  const optionMatch = asArray(OPTION_FOCUS[focus.id]).includes(option?.id);
  const metricMatch = focus.affectedMetrics.some((metric) => checkKeys.includes(metric));
  const eventMitigation = eventMatchesFocus(event, focus.id);
  const relevant = optionMatch || metricMatch || eventMitigation;
  if (!relevant) return { relevant: false, eventMitigation: false, scoreBonus: 0 };

  const support = trainingFocus.staffSupport?.level;
  const scoreBonus = optionMatch || metricMatch ? (support === "strong" ? 0.75 : support === "medium" ? 0.5 : 0.25) : 0;
  return { relevant: true, eventMitigation, scoreBonus };
}
