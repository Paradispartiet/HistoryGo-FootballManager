// HG Football Manager — Match Plan v1
//
// Kampplanen er STRATEGI, ikke en rangering. Ingen plan er best i seg selv: den
// passer eller passer ikke til spillerne dine, motstanderens stil og kampbildet.
// Denne motoren svarer på to ting:
//
//   1) Hvordan står planen seg mot DENNE motstanderen i DETTE kampbildet?
//   2) Hva koster det å bytte plan midt i kampen?
//
// Byttet er aldri gratis. Laget må stille om, og omstillingen koster taktisk
// klarhet — mest når spranget er stort og treneren forstår systemet dårlig.
// Det er nettopp derfor byttet er en managerbeslutning og ikke en gratis knapp.
//
// Ren ESM-motor: ingen DOM, ingen fetch, ingen localStorage, ingen app-state,
// ingen Math.random og ingen Date.now. Lik input gir byte-identisk output.
//
// Kjerneprinsipp (CLAUDE.md): «Alle spillere er gode nok. Spørsmålet er om
// treneren forstår dem.» En plan som ikke passer troppen straffes selv om den
// er «riktig» mot motstanderen — og motsatt.

export const MATCH_PLAN_VERSION = "historygo-football-manager.match-plan.v1";

export const GAME_STATE_LABELS = Object.freeze({
  leading: "Du styrer bildet",
  level: "Jevnt",
  behind: "Du er under"
});

// Kampbildet leses av kampens gang, ikke av en resultattavle: momentum og
// risiko fra grepene så langt forteller om laget har tak i kampen.
export const GAME_STATES = Object.freeze(["leading", "level", "behind"]);

// Aksene en plan beskrives langs. Avstanden mellom to planer på disse aksene er
// «hvor stort» byttet er — og dermed hvor mye omstilling det krever.
const AXIS_SCALES = Object.freeze({
  pressing: { low: 0, medium_low: 25, medium: 50, high: 75, very_high: 100 },
  tempo: { controlled: 0, direct_when_possible: 55, fast: 100 },
  width: { compact: 0, medium: 40, medium_wide: 70, wide: 100 },
  defensiveLine: { low: 0, medium_low: 25, medium: 50, medium_high: 75, high: 100 },
  buildUp: { secure_first: 0, structured_build_up: 30, direct_wide: 60, direct_play: 75, aggressive_build_up: 100 }
});

const AXIS_KEYS = Object.freeze(Object.keys(AXIS_SCALES));

// ----------------------------------------------------------------------------
// Hjelpere.
// ----------------------------------------------------------------------------
function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Math.round(num(value) * 100) / 100;
}

function axisValue(plan, key) {
  const scale = AXIS_SCALES[key];
  const raw = plan?.[key];
  return Object.prototype.hasOwnProperty.call(scale, raw) ? scale[raw] : 50;
}

export function normalizeMatchPlan(plan) {
  if (!isObject(plan)) return null;
  return {
    id: typeof plan.id === "string" ? plan.id : "",
    name: typeof plan.name === "string" ? plan.name : "",
    family: typeof plan.family === "string" ? plan.family : "",
    intent: typeof plan.intent === "string" ? plan.intent : "",
    formation: typeof plan.formation === "string" ? plan.formation : "",
    strengths: asArray(plan.strengths).filter((s) => typeof s === "string"),
    risks: asArray(plan.risks).filter((s) => typeof s === "string"),
    gameStates: asArray(plan.gameStates).filter((s) => GAME_STATES.includes(s)),
    intensity: clamp(num(plan.intensity, 60)),
    tags: asArray(plan.tags).filter((s) => typeof s === "string"),
    pressing: plan.pressing || "medium",
    tempo: plan.tempo || "controlled",
    width: plan.width || "medium",
    buildUp: plan.buildUp || "structured_build_up",
    defensiveLine: plan.defensiveLine || "medium"
  };
}

// ----------------------------------------------------------------------------
// Kampbildet. Leses av grepene så langt — ikke av en resultattavle, som denne
// kampmodellen ikke har. Momentum sier om laget har tak i kampen; risiko sier
// hvor mye du allerede har satt på spill.
// ----------------------------------------------------------------------------
export function readGameState(session) {
  const decisions = asArray(session?.decisions);
  const totals = decisions.reduce(
    (acc, decision) => {
      const effects = decision?.effects || {};
      acc.momentum += num(effects.momentumDelta);
      acc.risk += num(effects.riskDelta);
      acc.clarity += num(effects.tacticalClarityDelta);
      return acc;
    },
    { momentum: 0, risk: 0, clarity: 0 }
  );

  const state = totals.momentum >= 2 ? "leading" : totals.momentum <= -2 ? "behind" : "level";
  return {
    state,
    label: GAME_STATE_LABELS[state],
    momentum: round2(totals.momentum),
    risk: round2(totals.risk),
    clarity: round2(totals.clarity),
    decisionsMade: decisions.length
  };
}

// ----------------------------------------------------------------------------
// Hvor stort er byttet? Avstanden mellom to planer langs aksene, 0-100.
// ----------------------------------------------------------------------------
export function planDistance(fromPlan, toPlan) {
  const a = normalizeMatchPlan(fromPlan);
  const b = normalizeMatchPlan(toPlan);
  if (!a || !b) return 0;
  const total = AXIS_KEYS.reduce((sum, key) => sum + Math.abs(axisValue(a, key) - axisValue(b, key)), 0);
  return Math.round(total / AXIS_KEYS.length);
}

// ----------------------------------------------------------------------------
// Hva koster byttet? Omstillingen tapper taktisk klarhet. Treneren som forstår
// systemet sitt mister mindre; et stort sprang koster mer; og jo lenger ut i
// kampen, jo mindre tid har laget på å finne seg til rette.
// ----------------------------------------------------------------------------
export function calculateSwitchCost({ fromPlan, toPlan, coachSnapshot, eventsRemaining = 0 } = {}) {
  const distance = planDistance(fromPlan, toPlan);
  if (distance === 0) {
    return { distance: 0, clarityCost: 0, riskCost: 0, settled: true, explanation: "Samme plan – ingen omstilling." };
  }

  const understanding = clamp(num(coachSnapshot?.coachUnderstanding, 50));
  const familiarity = clamp(num(coachSnapshot?.formationFamiliarity, 50));
  // 0 = treneren forstår systemet godt, 1 = ingen støtte i omstillingen.
  const friction = clamp(100 - (understanding * 0.6 + familiarity * 0.4), 0, 100) / 100;

  // Sent bytte gir laget mindre tid til å sette seg. Ingen hendelser igjen =
  // full sen-effekt.
  const lateness = eventsRemaining <= 0 ? 1 : eventsRemaining === 1 ? 0.7 : 0.45;

  const clarityCost = round2(-(distance / 100) * (1 + friction) * lateness * 2.2);
  const riskCost = round2((distance / 100) * lateness * 1.4);

  const explanation =
    distance >= 55
      ? "Stort sprang: laget må bygge om hele bildet midt i kampen."
      : distance >= 25
        ? "Merkbar justering: laget trenger noen minutter på å finne formen."
        : "Liten justering: laget kjenner igjen det meste.";

  return { distance, clarityCost, riskCost, settled: false, explanation, friction: round2(friction), lateness };
}

// ----------------------------------------------------------------------------
// Passer planen kampbildet? Rent forklarende — ingen plan blir «riktig» av
// dette alene, men en plan som er laget for et annet bilde koster deg noe.
// ----------------------------------------------------------------------------
// Hvor godt passer planen akkurat nå? Kampbildet og motstanderen i ett tall
// (-100..100). Dette er grunnlaget for å belønne en FORBEDRING: spiller du
// dårlig og bytter til noe som faktisk passer bedre, skal det lønne seg.
export function scorePlanNow(plan, { gameState = "level", opponent } = {}) {
  const normalized = normalizeMatchPlan(plan);
  if (!normalized) return 0;
  const stateFit = evaluatePlanForGameState(normalized, gameState);
  const matchup = evaluatePlanVsOpponent(normalized, opponent);
  // Kampbildet veier tyngst: en plan for feil bilde er feil plan, uansett hvor
  // fin den ser ut mot motstanderens stil.
  return clamp(num(stateFit?.fits ? 45 : -45) + num(matchup?.edge) * 18, -100, 100);
}

export function evaluatePlanForGameState(plan, gameState) {
  const normalized = normalizeMatchPlan(plan);
  if (!normalized) return null;
  const state = GAME_STATES.includes(gameState) ? gameState : "level";
  const fits = normalized.gameStates.includes(state);
  const only = normalized.gameStates.length === 1 ? normalized.gameStates[0] : null;

  let note;
  if (fits) {
    note = `${normalized.name} er laget for dette bildet (${GAME_STATE_LABELS[state].toLowerCase()}).`;
  } else if (only) {
    note = `${normalized.name} hører hjemme når ${GAME_STATE_LABELS[only].toLowerCase()} – ikke nå.`;
  } else {
    note = `${normalized.name} er ikke ment for dette bildet.`;
  }

  return { fits, state, note, momentumDelta: fits ? 0.6 : -0.6 };
}

// ----------------------------------------------------------------------------
// Planen mot motstanderens stil. Bruker de samme styleTraits som de historiske
// motstanderprofilene allerede bærer — ingen ny motstanderdata.
// ----------------------------------------------------------------------------
export function evaluatePlanVsOpponent(plan, opponent) {
  const normalized = normalizeMatchPlan(plan);
  if (!normalized) return null;
  const traits = isObject(opponent?.styleTraits) ? opponent.styleTraits : {};
  const highLine = num(traits.highLine, 50);
  const shortBuildUp = num(traits.shortBuildUp, 50);
  const compactness = num(traits.defensiveCompactness, 50);
  const pressIntensity = num(traits.pressIntensity, 50);
  const transitionThreat = num(traits.transitionThreat, 50);

  const notes = [];
  let edge = 0;

  const planPress = axisValue(normalized, "pressing");
  const planLine = axisValue(normalized, "defensiveLine");
  const planTempo = axisValue(normalized, "tempo");
  const planWidth = axisValue(normalized, "width");

  // Press mot kort oppbygging er den klassiske gevinsten.
  if (planPress >= 70 && shortBuildUp >= 60) {
    edge += 1;
    notes.push("Presset treffer oppbyggingen deres.");
  }
  // Høy egen linje mot et lag som lever på omstilling er dyrt.
  if (planLine >= 75 && transitionThreat >= 65) {
    edge -= 1;
    notes.push("Den høye linja gir dem akkurat rommet de vil ha.");
  }
  // Fart i rommet mot en høy motstanderlinje.
  if (planTempo >= 55 && highLine >= 65) {
    edge += 1;
    notes.push("Farten treffer bakrommet bak den høye linja deres.");
  }
  // Bredde mot en kompakt blokk trekker dem fra hverandre.
  if (planWidth >= 70 && compactness >= 65) {
    edge += 1;
    notes.push("Bredden strekker den kompakte blokka deres.");
  }
  // Rolig oppbygging mot et aggressivt press inviterer trøbbel.
  if (planPress <= 30 && axisValue(normalized, "buildUp") <= 30 && pressIntensity >= 70) {
    edge -= 1;
    notes.push("Den rolige oppbyggingen blir presset ned i eget område.");
  }

  const verdict = edge > 0 ? "gunstig" : edge < 0 ? "risikabel" : "nøytral";
  return { edge, verdict, notes };
}

// ----------------------------------------------------------------------------
// Selve byttet. Returnerer effektene i SAMME form som en managerbeslutning, så
// finalizeMatchdaySession kan summere dem uten særtilfeller.
// ----------------------------------------------------------------------------
export function createPlanChange({ fromPlan, toPlan, session, opponent, eventsRemaining = 0 } = {}) {
  const from = normalizeMatchPlan(fromPlan);
  const to = normalizeMatchPlan(toPlan);
  if (!to || !to.id) return null;
  if (from && from.id === to.id) return null;

  const gameState = readGameState(session);
  const cost = calculateSwitchCost({
    fromPlan: from,
    toPlan: to,
    coachSnapshot: session?.coachSnapshot,
    eventsRemaining
  });
  const stateFit = evaluatePlanForGameState(to, gameState.state);
  const matchup = evaluatePlanVsOpponent(to, opponent || session?.opponent);

  // Effektene: omstillingen koster klarhet og legger på risiko. Men det som
  // faktisk belønnes er FORBEDRINGEN — hvor mye bedre den nye planen passer
  // bildet og motstanderen enn den du forlot. Å bytte fra noe som virker til
  // noe som ikke virker skal svi, selv om den nye planen «ser riktig ut».
  const edge = num(matchup?.edge);
  const context = { gameState: gameState.state, opponent: opponent || session?.opponent };
  const scoreBefore = from ? scorePlanNow(from, context) : 0;
  const scoreAfter = scorePlanNow(to, context);
  const improvement = round2((scoreAfter - scoreBefore) / 100);

  // En redning i en kamp som glipper er verdt mer enn en finjustering når alt
  // flyter. Jo dypere trøbbel, jo større er gevinsten ved å lese det riktig.
  const trouble = clamp(-num(gameState.momentum), 0, 6) / 6;
  const rescueBonus = improvement > 0 ? round2(improvement * trouble * 1.8) : 0;

  const effects = {
    eventScoreDelta: 0,
    xgDeltaFor: round2(improvement * 0.22 + edge * 0.05 + rescueBonus * 0.12),
    xgDeltaAgainst: round2(cost.riskCost * 0.06 - improvement * 0.16 - edge * 0.03),
    momentumDelta: round2(improvement * 2.4 + rescueBonus * 1.2 + edge * 0.25),
    riskDelta: cost.riskCost,
    tacticalClarityDelta: cost.clarityCost
  };

  const tone = effects.momentumDelta + effects.tacticalClarityDelta > 0.2
    ? "positive"
    : effects.momentumDelta + effects.tacticalClarityDelta < -0.2
      ? "negative"
      : "neutral";

  const verdict = improvement > 0.15
    ? (rescueBonus > 0.1 ? "Grepet leser kampen: laget får et bilde som passer bedre." : "Planen passer situasjonen bedre enn den du forlot.")
    : improvement < -0.15
      ? "Du bytter bort noe som passet bedre enn dette."
      : "Omtrent samme verdi i denne situasjonen.";

  const feedback = [
    cost.explanation,
    verdict,
    stateFit?.note,
    ...asArray(matchup?.notes)
  ].filter(Boolean).join(" ");

  return {
    fromPlanId: from?.id || null,
    fromPlanName: from?.name || "",
    toPlanId: to.id,
    toPlanName: to.name,
    intent: to.intent,
    gameState: gameState.state,
    gameStateLabel: gameState.label,
    distance: cost.distance,
    matchupVerdict: matchup?.verdict || "nøytral",
    improvement,
    rescueBonus,
    tone,
    effects,
    feedback
  };
}

// Sorter planene slik manageren skal lese dem: de som passer bildet først,
// deretter de som er nærmest dagens plan (minst omstilling).
export function rankPlansForSituation(plans, { currentPlan, gameState = "level", opponent } = {}) {
  return asArray(plans)
    .map((plan) => normalizeMatchPlan(plan))
    .filter(Boolean)
    .map((plan) => {
      const stateFit = evaluatePlanForGameState(plan, gameState);
      const matchup = evaluatePlanVsOpponent(plan, opponent);
      const distance = currentPlan ? planDistance(currentPlan, plan) : 0;
      return {
        plan,
        fitsGameState: Boolean(stateFit?.fits),
        matchupEdge: num(matchup?.edge),
        matchupVerdict: matchup?.verdict || "nøytral",
        distance,
        isCurrent: Boolean(currentPlan && normalizeMatchPlan(currentPlan)?.id === plan.id),
        note: stateFit?.note || ""
      };
    })
    .sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      if (a.fitsGameState !== b.fitsGameState) return a.fitsGameState ? -1 : 1;
      if (a.matchupEdge !== b.matchupEdge) return b.matchupEdge - a.matchupEdge;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.plan.id.localeCompare(b.plan.id);
    });
}

// ----------------------------------------------------------------------------
// Motstanderen sitter ikke stille. Leser de at kampen glipper, justerer de seg —
// og da er ikke planen din like god lenger. Det er dette som gjør at man må
// LESE kampen på nytt, ikke bare velge riktig én gang.
//
// Justeringen er deterministisk og forklart: ingen skjult motstanderintelligens,
// bare en lesbar reaksjon på kampbildet.
// ----------------------------------------------------------------------------
export const OPPONENT_ADJUSTMENTS = Object.freeze({
  // Du styrer bildet -> de tar mer risiko for å komme tilbake i kampen.
  push_up: {
    id: "push_up",
    label: "De skyver laget opp",
    note: "Motstanderen tar sjansen: høyere linje og mer press for å komme tilbake i kampen.",
    traitShift: { pressIntensity: 18, highLine: 20, defensiveCompactness: -12, transitionThreat: 8 }
  },
  // Du er under -> de sikrer det de har.
  sit_back: {
    id: "sit_back",
    label: "De trekker seg ned",
    note: "Motstanderen sikrer forspranget: dypere blokk, tettere rom, og kontring som plan.",
    traitShift: { pressIntensity: -16, highLine: -22, defensiveCompactness: 16, transitionThreat: 12 }
  }
});

// Hvilken justering gjør motstanderen nå? Null når bildet ikke gir grunn til det.
export function deriveOpponentAdjustment(gameState, { alreadyAdjusted = [] } = {}) {
  const state = typeof gameState === "string" ? gameState : gameState?.state;
  const done = new Set(asArray(alreadyAdjusted));
  if (state === "leading" && !done.has("push_up")) return OPPONENT_ADJUSTMENTS.push_up;
  if (state === "behind" && !done.has("sit_back")) return OPPONENT_ADJUSTMENTS.sit_back;
  return null;
}

// Bruk justeringen på en motstanderprofil. Returnerer en NY profil — motoren
// muterer aldri motstanderdataen.
export function applyOpponentAdjustment(opponent, adjustment) {
  if (!isObject(opponent) || !isObject(adjustment)) return opponent;
  const traits = isObject(opponent.styleTraits) ? opponent.styleTraits : {};
  const shifted = { ...traits };
  Object.entries(adjustment.traitShift || {}).forEach(([key, delta]) => {
    shifted[key] = clamp(num(traits[key], 50) + num(delta));
  });
  return {
    ...opponent,
    styleTraits: shifted,
    adjustmentId: adjustment.id,
    adjustmentLabel: adjustment.label
  };
}
