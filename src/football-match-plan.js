import { evaluateTacticalSequences } from "./football-tactical-sequences.js";
import { behaviourForOpponentAdjustment } from "./football-live-tactical-exchange.js";

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
  leading: "Du leder",
  level: "Jevnt",
  behind: "Du ligger under"
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

  // Stillingen er fasit når kampen faktisk er i gang: «du er under» skal bety
  // at du ligger under, ikke bare at det føles tungt. Momentum avgjør når det
  // står likt — da er det spillet, ikke tavla, som forteller hvor kampen bærer.
  const played = asArray(session?.timeline).length > 0;
  const goalsFor = num(session?.score?.for);
  const goalsAgainst = num(session?.score?.against);
  const goalDiff = goalsFor - goalsAgainst;

  let state;
  let label;
  if (played && goalDiff !== 0) {
    state = goalDiff > 0 ? "leading" : "behind";
    label = GAME_STATE_LABELS[state];
  } else {
    // Once the score is known, a level score is ALWAYS the "level" state.
    // Momentum still describes who has initiative in the label, not whether
    // a score-dependent plan qualifies for a tactical bonus.
    state = played ? "level"
      : totals.momentum >= 2 ? "leading" : totals.momentum <= -2 ? "behind" : "level";
    // Står det likt, er det SPILLET som går din vei — ikke tavla. «Du leder»
    // ved 1-1 var en direkte løgn mot resultattavla ved siden av.
    label = totals.momentum >= 2
      ? "Jevnt – du har taket"
      : totals.momentum <= -2
        ? "Jevnt – de har taket"
        : GAME_STATE_LABELS.level;
  }

  return {
    state,
    label,
    momentum: round2(totals.momentum),
    risk: round2(totals.risk),
    clarity: round2(totals.clarity),
    decisionsMade: decisions.length,
    // Stillingen slik den står nå (0-0 før avspark).
    score: { for: goalsFor, against: goalsAgainst },
    goalDifference: goalDiff,
    scoreKnown: played
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
export function scorePlanNow(plan, { gameState = "level", opponent, tacticalProfile } = {}) {
  const normalized = normalizeMatchPlan(plan);
  if (!normalized) return 0;
  const stateFit = evaluatePlanForGameState(normalized, gameState);
  const matchup = evaluatePlanVsOpponent(normalized, opponent, { tacticalProfile });
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
// En kampplan får først uttelling når lagets FAKTISKE rolle-, ferdighets- og
// formasjonsbidrag kan utføre den. Forhåndsvisning og eldre lagringer uten
// dokumenterte lagmetrikker får status "unknown", aldri en gratis bonus.
function tacticalMetricReadiness(profile, key, minimum) {
  const value = profile?.[key];
  if (!Number.isFinite(value)) return "unknown";
  return value >= minimum ? "ready" : "gap";
}

export function evaluatePlanVsOpponent(plan, opponent, { tacticalProfile } = {}) {
  const normalized = normalizeMatchPlan(plan);
  if (!normalized) return null;
  const traits = isObject(opponent?.styleTraits) ? opponent.styleTraits : {};
  const highLine = num(traits.highLine, 50);
  const shortBuildUp = num(traits.shortBuildUp, 50);
  const compactness = num(traits.defensiveCompactness, 50);
  const pressIntensity = num(traits.pressIntensity, 50);
  const transitionThreat = num(traits.transitionThreat, 50);

  const notes = [];
  const opportunities = [];
  let edge = 0;

  const planPress = axisValue(normalized, "pressing");
  const planLine = axisValue(normalized, "defensiveLine");
  const planTempo = axisValue(normalized, "tempo");
  const planWidth = axisValue(normalized, "width");

  // The same engine that determines xG keeps the evidence for its advantage.
  // Missing metrics are unknown, not evidence that the player is weak.
  const recordOpportunity = (id, label, metric) => {
    const value = tacticalProfile?.[metric];
    const metricValue = Number.isFinite(value) ? value : null;
    const readiness = tacticalMetricReadiness(tacticalProfile, metric, 60);
    opportunities.push({
      id, label, metric, metricValue, threshold: 60, readiness
    });
    return readiness;
  };

  // Utsatte motstandere er ikke nok: egne roller må gjennomføre planen.
  // Profilmetrikkene bygges allerede av dokumenterte spillerferdigheter,
  // relasjoner og formasjon. Ingen nye eller gjettede individuelle egenskaper.
  if (planPress >= 70 && shortBuildUp >= 60) {
    const pressReadiness = recordOpportunity("press_build_up", "Høyt press mot kort oppbygging", "pressScore");
    if (pressReadiness === "ready") {
      edge += 1;
      notes.push("Presset treffer oppbyggingen deres.");
    } else if (pressReadiness === "unknown") {
      notes.push("Kort oppbygging gir en mulig pressmulighet, men lagets pressdekning er ukjent; ingen bonus beregnes.");
    } else {
      notes.push("Kort oppbygging kan presses, men dine pressroller og samspill gir ikke nok samlet press ennå.");
    }
  }
  if (planLine >= 75 && transitionThreat >= 65) {
    edge -= 1;
    notes.push("Den høye linja gir dem akkurat rommet de vil ha.");
  }
  if (planTempo >= 55 && highLine >= 65) {
    const depthReadiness = recordOpportunity("runs_behind", "Dybdeløp mot høy forsvarslinje", "depthScore");
    if (depthReadiness === "ready") {
      edge += 1;
      notes.push("Dybderollene treffer bakrommet bak den høye linja deres.");
    } else if (depthReadiness === "unknown") {
      notes.push("Motstanderen gir bakrom, men lagets dybdetrussel er ukjent; ingen bonus beregnes.");
    } else {
      notes.push("De gir bakrom, men dine angriperroller skaper ikke nok dybdetrussel til å utnytte det.");
    }
  }
  if (planWidth >= 70 && compactness >= 65) {
    const widthReadiness = recordOpportunity("stretch_compact", "Bredde mot kompakt forsvar", "widthScore");
    if (widthReadiness === "ready") {
      edge += 1;
      notes.push("Kant- og backrollene strekker den kompakte blokka deres.");
    } else if (widthReadiness === "unknown") {
      notes.push("Den kompakte blokka kan strekkes, men lagets breddekapasitet er ukjent; ingen bonus beregnes.");
    } else {
      notes.push("Den kompakte blokka kan strekkes, men lagets faktiske bredderoller gir for lite bredde.");
    }
  }
  if (planPress <= 30 && axisValue(normalized, "buildUp") <= 30 && pressIntensity >= 70) {
    edge -= 1;
    notes.push("Den rolige oppbyggingen blir presset ned i eget område.");
  }

  // Sammensatte taktiske mønstre: ikke tre isolerte motsetningspar.
  // En samhandling kan kreve 2, 3 eller 4 samtidige LAG-egenskaper,
  // og ett dokumentert motgrep kan nøytralisere den samlede fordelen.
  // Samme lagmetrikker kommer fra faktisk rolle-, formasjons- og spillerfit.
  const patterns = [
    {
      id: "coordinated_press_chain",
      opportunityId: "press_build_up",
      label: "Fireleddet pressfelle",
      factors: [
        { metric: "pressScore", minimum: 65, label: "Førstepress fra angrepet" },
        { metric: "balanceScore", minimum: 60, label: "Midtbane som stenger neste pasning" },
        { metric: "restDefenseScore", minimum: 60, label: "Sikring bak presset" },
        { metric: "depthScore", minimum: 58, label: "Dybdeledd som binder motstanderen" }
      ],
      counter: { metric: "pressResistance", minimum: 85,
        label: "Pressresistens: én fri tredjemann spiller forbi hele pressfellen" },
      answer: "Bryt presset med sikret oppbygging eller velg et mindre aggressivt pressmønster."
    },
    {
      id: "deep_run_support_chain",
      opportunityId: "runs_behind",
      label: "Dybdeløp med pasningsstøtte",
      factors: [
        { metric: "depthScore", minimum: 65, label: "Løp bak forsvarslinjen" },
        { metric: "buildUpScore", minimum: 60, label: "Pasningsledd som finner løpet" },
        { metric: "balanceScore", minimum: 58, label: "Andreball og sentral sikring" }
      ],
      counter: { metric: "pressIntensity", minimum: 85,
        label: "Aggressivt motpress på pasningsleggeren bryter hele løpskombinasjonen" },
      answer: "Flytt pasningsstarten eller skap rommet med sideskift før dybdeløpet."
    },
    {
      id: "wide_overload_chain",
      opportunityId: "stretch_compact",
      label: "Breddeovertall med sikring",
      factors: [
        { metric: "widthScore", minimum: 65, label: "Kant og back gir bredde" },
        { metric: "buildUpScore", minimum: 60, label: "Pasningsstøtte som vender spillet" },
        { metric: "balanceScore", minimum: 58, label: "Sentralt ledd som sikrer ved balltap" }
      ],
      counter: { metric: "defensiveStructure", minimum: 82,
        label: "Solid sidesikring fjerner rommet selv om bredden er riktig" },
      answer: "Angrip motsatt halvrom når blokken har flyttet seg mot ballside."
    }
  ];
  const combinations = [];
  for (const pattern of patterns) {
    const primary = opportunities.find((item) => item.id === pattern.opportunityId);
    if (!primary) continue;
    const factors = pattern.factors.map(({ metric, minimum, label }) => {
      const raw = tacticalProfile?.[metric];
      const value = Number.isFinite(raw) ? raw : null;
      return { metric, label, value, minimum,
        status: tacticalMetricReadiness(tacticalProfile, metric, minimum) };
    });
    const allReady = factors.every((factor) => factor.status === "ready");
    const unknown = factors.some((factor) => factor.status === "unknown");
    const responseValue = pattern.counter.metric === "pressResistance"
      ? opponent?.pressResistance
      : traits[pattern.counter.metric] ?? opponent?.[pattern.counter.metric];
    const responseKnown = Number.isFinite(responseValue);
    const counterActive = responseKnown && responseValue >= pattern.counter.minimum;
    // No speculative benefit from unknown or unsourced player abilities.
    // Bonus is deliberately capped below the existing primary advantage.
    if (allReady && responseKnown && !counterActive) {
      edge += 0.5;
      notes.push(pattern.label + ": alle ledd har dekning og virker sammen.");
    }
    if (allReady && !responseKnown) {
      notes.push(pattern.label + ": laget har dekning, men motstanderens motgrep er ikke undersøkt.");
    }
    // A single counter blocks the baseline advantage as well as the
    // multi-factor synergy, but never creates a fake player weakness.
    if (counterActive && primary.readiness === "ready") {
      edge -= 1;
      notes.push(pattern.counter.label + ". Motstanderens ene grep bryter den samlede fordelen.");
    }
    const status = unknown ? "unknown"
      : allReady && !responseKnown ? "unknown_counter"
      : counterActive ? "countered"
      : allReady ? "ready"
      : "partial";
    combinations.push({
      id: pattern.id, label: pattern.label, opportunityId: pattern.opportunityId,
      factors, status, readyCount: factors.filter((factor) => factor.status === "ready").length,
      counter: { label: pattern.counter.label, metric: pattern.counter.metric,
        value: responseKnown ? responseValue : null, minimum: pattern.counter.minimum,
        status: responseKnown ? counterActive ? "active" : "inactive" : "unknown" },
      answer: pattern.answer
    });
  }

  // In addition to the three generic evidence combinations, all 18 plans
  // have one authored four-action scenario, a countermove and a reply.
  // These are possibilities, not a literal four-pass event simulator.
  const sequences = evaluateTacticalSequences(normalized.id, opponent, tacticalProfile);
  const sequenceEdge = Math.min(1, sequences.reduce((sum, sequence) => sum + sequence.edgeDelta, 0));
  edge += sequenceEdge;
  sequences.forEach((sequence) => {
    if (sequence.status === "advantage") notes.push(`Spillkjede: ${sequence.title}. Laget har dekning for bevegelsene.`);
    else if (sequence.status === "countered") notes.push(`Motspill: ${sequence.counter}. Ditt mulige svar: ${sequence.response}.`);
    else if (sequence.status === "unknown_counter") notes.push(`Spillkjeden ${sequence.title} har rolledekning, men motstanderens mulige motgrep er ikke undersøkt.`);
    else notes.push(`Spillkjeden ${sequence.title} trenger bedre faktisk rolle- og formasjonsdekning.`);
    if (sequence.liveExchange) {
      notes.push(`Dynamisk motspill: ${sequence.liveExchange.cause}`);
      if (sequence.liveExchange.failureConsequence) notes.push(sequence.liveExchange.failureConsequence);
    }
  });
  const verdict = edge > 0 ? "gunstig" : edge < 0 ? "risikabel" : "nøytral";
  return { edge, verdict, notes, opportunities, combinations, sequences };
}

// ----------------------------------------------------------------------------
// Selve byttet. Returnerer effektene i SAMME form som en managerbeslutning, så
// finalizeMatchdaySession kan summere dem uten særtilfeller.
// ----------------------------------------------------------------------------
export function createPlanChange({ fromPlan, toPlan, session, opponent, eventsRemaining = 0, nextTacticalProfile } = {}) {
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
  const tacticalProfile = session?.teamFitSnapshot?.tacticalProfile;
  const afterProfile = nextTacticalProfile || tacticalProfile;
  const matchup = evaluatePlanVsOpponent(to, opponent || session?.opponent, { tacticalProfile: afterProfile });

  // Effektene: omstillingen koster klarhet og legger på risiko. Men det som
  // faktisk belønnes er FORBEDRINGEN — hvor mye bedre den nye planen passer
  // bildet og motstanderen enn den du forlot. Å bytte fra noe som virker til
  // noe som ikke virker skal svi, selv om den nye planen «ser riktig ut».
  const edge = num(matchup?.edge);
  const context = { gameState: gameState.state, opponent: opponent || session?.opponent, tacticalProfile };
  const scoreBefore = from ? scorePlanNow(from, context) : 0;
  // A tactical switch changes the team's role-and-formation compatibility.
  // Judge the old plan with its old XI profile and the new plan with its new
  // tactical fit, not the identical (stale) profile for both.
  const scoreAfter = scorePlanNow(to, { ...context, tacticalProfile: afterProfile });
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
export function rankPlansForSituation(plans, { currentPlan, gameState = "level", opponent, tacticalProfile, tacticalProfilesByPlan } = {}) {
  return asArray(plans)
    .map((plan) => normalizeMatchPlan(plan))
    .filter(Boolean)
    .map((plan) => {
      const stateFit = evaluatePlanForGameState(plan, gameState);
      const candidateProfile = Object.prototype.hasOwnProperty.call(tacticalProfilesByPlan || {}, plan.id)
        ? tacticalProfilesByPlan[plan.id] : tacticalProfile;
      const matchup = evaluatePlanVsOpponent(plan, opponent, { tacticalProfile: candidateProfile });
      const distance = currentPlan ? planDistance(currentPlan, plan) : 0;
      return {
        plan,
        fitsGameState: Boolean(stateFit?.fits),
        matchupEdge: num(matchup?.edge),
        matchupVerdict: matchup?.verdict || "nøytral",
        sequenceStatus: matchup?.sequences?.[0]?.status || null,
        sequenceTitle: matchup?.sequences?.[0]?.title || null,
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
    // Dynamic behaviour is tied to an EXPLICIT in-match reaction, not a
    // guessed historical opponent observation. A different reaction replaces
    // the previous lane/spacing/cover model.
    tacticalBehaviour: behaviourForOpponentAdjustment(adjustment.id, { ...opponent, styleTraits: shifted }) || opponent.tacticalBehaviour || null,
    adjustmentId: adjustment.id,
    adjustmentLabel: adjustment.label
  };
}
