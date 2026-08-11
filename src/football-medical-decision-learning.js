// Medisinsk vurdering og retur til spill v1
//
// Dette er et rent læringslag over eksisterende player-condition. Det stiller
// manageren overfor en beslutning og forklarer hva condition-staten faktisk
// støtter. Det diagnostiserer ingen skade, endrer ingen spiller og avgjør aldri
// retur til trening eller kamp på egen hånd.

export const MEDICAL_DECISION_LEARNING_VERSION = "historygo-football-manager.medical-decision-learning.v1";
export const MEDICAL_REHABILITATION_VERSION = "historygo-football-manager.medical-rehabilitation.v2";

export const MEDICAL_REHABILITATION_STAGES = Object.freeze([
  Object.freeze({
    id: "individual_rehab",
    label: "Individuell rehabilitering",
    shortLabel: "Rehab",
    purpose: "Bygge grunnkapasitet uten å late som kalenderen alene gjør spilleren fotballklar.",
    watch: "Følg symptomer, kontroll og respons på gradvis belastning."
  }),
  Object.freeze({
    id: "adapted_training",
    label: "Tilpasset fotballtrening",
    shortLabel: "Tilpasset",
    purpose: "Føre spilleren tilbake til løp, vendinger og ballhandlinger under kontrollerte krav.",
    watch: "Se etter smerterespons, trygghet og om fotballhandlingene tåles."
  }),
  Object.freeze({
    id: "partial_team_training",
    label: "Delvis lagtrening",
    shortLabel: "Delvis lag",
    purpose: "Prøve spilleren i deler av lagets arbeid før full treningsmengde.",
    watch: "Se om intensitet, retningsendringer og kontakt med medspillere tåles."
  }),
  Object.freeze({
    id: "full_team_training",
    label: "Full lagtrening",
    shortLabel: "Fullt lag",
    purpose: "Teste hele fotballkravet uten å gjøre én symptomfri økt til automatisk kampklarering.",
    watch: "Vurder respons under økta og etter at belastningen har fått virke."
  }),
  Object.freeze({
    id: "match_ready",
    label: "Kampklarhetsvurdering",
    shortLabel: "Kampklar",
    purpose: "Velge ute, benk eller start ut fra funksjon, belastning og usikkerhet.",
    watch: "Sammenlign planlagte minutter med kampens faktiske belastningssignal."
  })
]);

export const MEDICAL_REHABILITATION_APPROACHES = Object.freeze([
  Object.freeze({
    id: "cautious",
    label: "Forsiktig progresjon",
    summary: "Mindre steg og mer tid til å vurdere respons mellom belastningene.",
    consequence: "Reduserer presset om rask retur, men kan holde spilleren utenfor lagsarbeidet lenger enn nødvendig."
  }),
  Object.freeze({
    id: "criteria_led",
    label: "Kriteriestyrt progresjon",
    summary: "Neste trinn åpnes når eksisterende skade- og belastningssignaler støtter det.",
    consequence: "Skiller kalender, treningsklarhet og kampklarhet uten å love at ett kriterium gir en sikker retur."
  }),
  Object.freeze({
    id: "accelerated",
    label: "Raskere tilbakeføring",
    summary: "Kortere mellomrom mellom fotballkravene og mindre margin for ny vurdering.",
    consequence: "Kan få spilleren tidligere inn i lagarbeidet, men øker usikkerheten dersom symptomer og funksjon ikke er godt nok undersøkt."
  })
]);

const TIRED_THRESHOLD = 50;

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizedConditions(conditions) {
  return asArray(conditions)
    .filter((entry) => entry && text(entry.playerId))
    .map((entry) => ({
      playerId: text(entry.playerId),
      name: text(entry.name, entry.playerId),
      load: Math.max(0, Math.min(100, number(entry.load))),
      form: Math.max(-3, Math.min(3, number(entry.form))),
      consecutiveFullMatches: Math.max(0, Math.trunc(number(entry.consecutiveFullMatches))),
      injury: number(entry?.injury?.weeksOut) > 0
        ? {
            weeksOut: Math.max(1, Math.trunc(number(entry.injury.weeksOut))),
            reason: text(entry.injury.reason, "Skadeårsak er ikke nærmere registrert")
          }
        : null
    }));
}

function returnToPlayCase(condition) {
  const weeks = condition.injury.weeksOut;
  return {
    id: `return-to-play:${condition.playerId}`,
    kind: "return_to_play",
    playerId: condition.playerId,
    playerName: condition.name,
    headline: `${condition.name}: fra opptrening til fotball`,
    situation: `Spillercondition registrerer skade og et ukeestimat på ${weeks} ${weeks === 1 ? "uke" : "uker"}. Årsak i spillet: ${condition.injury.reason}.`,
    known: [
      `Spilleren er fortsatt markert som skadet i den eksisterende condition-staten.`,
      `Belastning i save: ${Math.round(condition.load)} av 100.`,
      `Ukeestimatet beskriver forventet fravær, ikke dokumentert funksjon i dag.`
    ],
    missing: [
      "smerterespons ved undersøkelse og belastning",
      "styrke, bevegelighet og fotballspesifikk funksjon",
      "løp og sprint uten smerte eller usikkerhet",
      "spillerens trygghet og støtteapparatets samlede vurdering"
    ],
    question: "Hva er best begrunnet neste steg med informasjonen spillet faktisk har?",
    recommendedChoiceId: "rehab_and_assess",
    choices: [
      { id: "full_return_now", label: "Klarér full trening og kamp nå" },
      { id: "calendar_only", label: "Vent til ukeestimatet er null" },
      { id: "rehab_and_assess", label: "Fortsett opptrening og vurder funksjon" }
    ]
  };
}

function loadManagementCase(condition) {
  const freshness = Math.max(0, Math.round(100 - condition.load));
  return {
    id: `load-management:${condition.playerId}`,
    kind: "load_management",
    playerId: condition.playerId,
    playerName: condition.name,
    headline: `${condition.name}: belastning før neste økt`,
    situation: `Spilleren er ikke registrert skadet, men har belastning ${Math.round(condition.load)} og friskhet ${freshness}.`,
    known: [
      `Spilleren har ${condition.consecutiveFullMatches} fulle kamper på rad.`,
      "Player-condition sier at høy belastning kan svekke kampbidraget og øke skaderisikoen.",
      "Fravær av registrert skade betyr ikke at nye symptomer er undersøkt."
    ],
    missing: [
      "spillerens egen respons etter siste kamp",
      "smerte, stivhet eller endret funksjon",
      "hva spilleren tåler i neste fotballøkt"
    ],
    question: "Hvordan bør støtteapparatet håndtere belastningssignalet?",
    recommendedChoiceId: "adjust_and_review",
    choices: [
      { id: "full_load", label: "Behold full kamp- og treningsbelastning" },
      { id: "complete_rest", label: "Ta spilleren helt ut uten ny vurdering" },
      { id: "adjust_and_review", label: "Juster belastningen og vurder responsen" }
    ]
  };
}

export function createMedicalDecisionCase(conditions = []) {
  const list = normalizedConditions(conditions);
  const injured = list
    .filter((entry) => entry.injury)
    .sort((a, b) => b.injury.weeksOut - a.injury.weeksOut || b.load - a.load)[0];
  if (injured) return returnToPlayCase(injured);

  const tired = list
    .filter((entry) => entry.load > TIRED_THRESHOLD)
    .sort((a, b) => b.load - a.load || b.consecutiveFullMatches - a.consecutiveFullMatches)[0];
  if (tired) return loadManagementCase(tired);

  return {
    id: "no-active-case",
    kind: "no_case",
    playerId: null,
    playerName: null,
    headline: "Ingen aktiv medisinsk beslutning",
    situation: "Spillercondition registrerer ingen skade eller forhøyet belastning som krever et valg akkurat nå.",
    known: [],
    missing: [],
    question: "Et konkret beslutningsverksted åpnes når save-staten faktisk har et skade- eller belastningssignal.",
    recommendedChoiceId: null,
    choices: []
  };
}

const RETURN_OUTCOMES = Object.freeze({
  full_return_now: Object.freeze({
    status: "premature",
    label: "For tidlig konklusjon",
    explanation: "Condition-staten sier fortsatt skadet, og spillet har ingen funksjonsdata som støtter full retur nå.",
    consequence: "Full fotballbelastning kan ikke forsvares bare fordi manageren ønsker spilleren tilbake. Fortsett opptreningen og vurder faktisk kapasitet."
  }),
  calendar_only: Object.freeze({
    status: "incomplete",
    label: "Ukeestimatet er ikke en test",
    explanation: "Tid kan inngå i planleggingen, men et nullstilt ukeestimat dokumenterer ikke smertefri funksjon, sprintkapasitet eller trygghet.",
    consequence: "Retur må bygge på hva spilleren tåler i fotballhandlinger og en samlet vurdering, ikke kalenderen alene."
  }),
  rehab_and_assess: Object.freeze({
    status: "supported",
    label: "Best begrunnet neste steg",
    explanation: "Individuell, kriteriebasert opptrening lar belastningen økes etter symptomer og kapasitet fram mot fotballens krav.",
    consequence: "Bruk eksisterende individuell opptrening, og vurder smerte, funksjon, løp/sprint og spillerens trygghet før støtteapparatet tar en delt returbeslutning."
  })
});

const LOAD_OUTCOMES = Object.freeze({
  full_load: Object.freeze({
    status: "premature",
    label: "Belastningssignalet blir oversett",
    explanation: "Save-staten viser allerede at spilleren er brukt hardt. Uendret full belastning svarer ikke på signalet.",
    consequence: "Eksisterende condition-logikk kan gi lavere kampbidrag og økt skaderisiko når belastningen fortsetter å stige."
  }),
  complete_rest: Object.freeze({
    status: "incomplete",
    label: "Tiltak uten ny vurdering",
    explanation: "Avlastning kan være riktig, men total hvile uten å undersøke respons og funksjon gjør beslutningen unødvendig grov.",
    consequence: "Tilpass belastningen til situasjonen og vurder spilleren på nytt før neste kampkrav."
  }),
  adjust_and_review: Object.freeze({
    status: "supported",
    label: "Best begrunnet neste steg",
    explanation: "Belastningsstyring kobler kampminutter, trening og spillerens respons i stedet for å behandle dem som separate tall.",
    consequence: "Bruk restitusjon eller individuell belastningsoppfølging, og vurder responsen før neste fulle økt eller 90-minutter."
  })
});

export function evaluateMedicalDecision(decisionCase, choiceId) {
  if (!decisionCase || decisionCase.kind === "no_case") return null;
  const choices = decisionCase.kind === "return_to_play" ? RETURN_OUTCOMES : LOAD_OUTCOMES;
  const outcome = choices[choiceId];
  if (!outcome) return null;
  return {
    choiceId,
    playerId: decisionCase.playerId,
    status: outcome.status,
    label: outcome.label,
    explanation: outcome.explanation,
    consequence: outcome.consequence,
    isRecommended: choiceId === decisionCase.recommendedChoiceId,
    guardrail: "Læringsvalget endrer ikke skade, belastning, tilgjengelighet eller save-state."
  };
}

function stageIndex(stageId) {
  const index = MEDICAL_REHABILITATION_STAGES.findIndex((stage) => stage.id === text(stageId));
  return index >= 0 ? index : 0;
}

function approachById(approachId) {
  return MEDICAL_REHABILITATION_APPROACHES.find((approach) => approach.id === text(approachId)) || null;
}

function stageByIndex(index) {
  return MEDICAL_REHABILITATION_STAGES[Math.max(0, Math.min(MEDICAL_REHABILITATION_STAGES.length - 1, Math.trunc(number(index))))];
}

export function sanitizeMedicalRehabilitationPlan(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const playerId = text(value.playerId);
  const approach = approachById(value.approachId);
  if (!playerId || !approach) return null;
  const stage = stageByIndex(stageIndex(value.stageId));
  const availabilityDecisionId = ["out", "bench", "start"].includes(text(value.availabilityDecisionId))
    ? text(value.availabilityDecisionId)
    : null;
  return {
    version: MEDICAL_REHABILITATION_VERSION,
    playerId,
    playerName: text(value.playerName, playerId),
    approachId: approach.id,
    stageId: stage.id,
    startedWeek: Math.max(1, Math.trunc(number(value.startedWeek, 1))),
    updatedWeek: Math.max(1, Math.trunc(number(value.updatedWeek, value.startedWeek || 1))),
    availabilityDecisionId,
    availabilityDecisionWeek: availabilityDecisionId
      ? Math.max(1, Math.trunc(number(value.availabilityDecisionWeek, value.updatedWeek || 1)))
      : null,
    baselineMatchId: availabilityDecisionId ? text(value.baselineMatchId) || null : null,
    history: asArray(value.history).slice(-20).map((entry) => ({
      week: Math.max(1, Math.trunc(number(entry?.week, 1))),
      action: ["started", "advanced", "held", "availability"].includes(text(entry?.action)) ? text(entry.action) : "held",
      stageId: stageByIndex(stageIndex(entry?.stageId)).id,
      note: text(entry?.note)
    }))
  };
}

function minimumStageIndex(condition) {
  if (condition?.injury?.weeksOut > 1) return 0;
  if (condition?.injury?.weeksOut === 1) return 1;
  return 2;
}

function maximumSupportedStageIndex(condition) {
  if (condition?.injury?.weeksOut > 1) return 0;
  if (condition?.injury?.weeksOut === 1) return 1;
  if (condition?.load > 70) return 2;
  if (condition?.load > 50) return 3;
  return 4;
}

function rehabilitationCriteria(stage, condition, hasRehabAssignment) {
  const injured = Boolean(condition?.injury);
  const load = Math.round(number(condition?.load));
  const criteria = {
    individual_rehab: [
      { label: "Skadesignalet er registrert i player-condition", met: injured },
      { label: "Opptrening er valgt i eksisterende individuell oppfølging", met: hasRehabAssignment }
    ],
    adapted_training: [
      { label: "Condition-estimatet er nede i siste registrerte skadeuke", met: condition?.injury?.weeksOut === 1 },
      { label: "Fotballfunksjon og symptomrespons må fortsatt observeres", met: false }
    ],
    partial_team_training: [
      { label: "Spilleren er ikke lenger markert skadet", met: !injured },
      { label: `Belastningen er under høyrisikoområdet (${load}/100)`, met: load <= 70 }
    ],
    full_team_training: [
      { label: "Spilleren er ikke markert skadet", met: !injured },
      { label: `Belastningen gir rom for full lagøkt (${load}/100)`, met: load <= 50 }
    ],
    match_ready: [
      { label: "Condition markerer spilleren som skadefri", met: !injured },
      { label: `Belastningen er ikke over tretthetsgrensen (${load}/100)`, met: load <= 50 },
      { label: "Kampminutter må fortsatt være et eksplisitt managervalg", met: true }
    ]
  };
  return criteria[stage.id] || [];
}

export function createMedicalRehabilitationPath({
  conditions = [],
  individualTraining = null,
  plan = null,
  currentWeek = 1,
  lastMatch = null
} = {}) {
  const list = normalizedConditions(conditions);
  const savedPlan = sanitizeMedicalRehabilitationPlan(plan);
  const plannedCondition = savedPlan ? list.find((entry) => entry.playerId === savedPlan.playerId) : null;
  const activePlan = plannedCondition ? savedPlan : null;
  const injured = [...list]
    .filter((entry) => entry.injury)
    .sort((a, b) => b.injury.weeksOut - a.injury.weeksOut || b.load - a.load)[0] || null;
  const condition = plannedCondition || injured;
  if (!condition) return null;

  const assignments = asArray(individualTraining?.assignments);
  const hasRehabAssignment = assignments.some((entry) => entry?.playerId === condition.playerId && entry?.trackId === "rehab");
  const minimum = minimumStageIndex(condition);
  const maximum = maximumSupportedStageIndex(condition);
  const requested = activePlan ? stageIndex(activePlan.stageId) : minimum;
  const currentIndex = Math.max(minimum, Math.min(maximum, requested));
  const stage = stageByIndex(currentIndex);
  const criteria = rehabilitationCriteria(stage, condition, hasRehabAssignment);
  const approach = activePlan ? approachById(activePlan.approachId) : null;

  return {
    version: MEDICAL_REHABILITATION_VERSION,
    playerId: condition.playerId,
    playerName: condition.name,
    condition,
    plan: activePlan,
    approach,
    stages: MEDICAL_REHABILITATION_STAGES.map((item, index) => ({
      ...item,
      status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending"
    })),
    currentStage: stage,
    currentStageIndex: currentIndex,
    maximumSupportedStageIndex: maximum,
    canAdvance: Boolean(activePlan) && currentIndex < maximum,
    hasRehabAssignment,
    criteria,
    known: [
      condition.injury
        ? `Player-condition registrerer fortsatt ${condition.injury.weeksOut} ${condition.injury.weeksOut === 1 ? "skadeuke" : "skadeuker"}.`
        : "Player-condition markerer ikke lenger spilleren som skadet.",
      `Belastning: ${Math.round(condition.load)} av 100.`,
      hasRehabAssignment
        ? "Opptrening er valgt i eksisterende individuell oppfølging."
        : "Opptrening er ikke valgt i denne ukas individuelle oppfølging."
    ],
    missing: [
      "Spillet har ikke kliniske testresultater eller en dokumentert diagnose.",
      "En faseetikett beviser ikke smertefri sprint, full fotballfunksjon eller trygg retur.",
      "Støtteapparatets og spillerens faktiske vurdering må fortsatt inngå."
    ],
    currentWeek: Math.max(1, Math.trunc(number(currentWeek, 1))),
    lastMatch
  };
}

export function updateMedicalRehabilitationPlan(path, {
  actionId,
  approachId = null,
  availabilityDecisionId = null,
  currentWeek = path?.currentWeek || 1,
  baselineMatchId = null
} = {}) {
  if (!path?.playerId) return null;
  const week = Math.max(1, Math.trunc(number(currentWeek, 1)));
  const current = sanitizeMedicalRehabilitationPlan(path.plan);
  const approach = approachById(approachId) || approachById(current?.approachId) || approachById("criteria_led");
  const base = current || {
    version: MEDICAL_REHABILITATION_VERSION,
    playerId: path.playerId,
    playerName: path.playerName,
    approachId: approach.id,
    stageId: path.currentStage.id,
    startedWeek: week,
    updatedWeek: week,
    availabilityDecisionId: null,
    availabilityDecisionWeek: null,
    baselineMatchId: null,
    history: []
  };
  let nextStageId = path.currentStage.id;
  let historyAction = current ? "held" : "started";
  let note = current ? "Forløpet ble holdt på samme trinn." : `Arbeidsmåte valgt: ${approach.label}.`;

  if (actionId === "advance" && path.canAdvance) {
    nextStageId = stageByIndex(path.currentStageIndex + 1).id;
    historyAction = "advanced";
    note = `Kriteriene ble registrert som tålt; neste trinn er ${stageByIndex(path.currentStageIndex + 1).label}.`;
  } else if (actionId === "availability" && ["out", "bench", "start"].includes(availabilityDecisionId)) {
    historyAction = "availability";
    note = `Kampbruken ble satt til ${availabilityDecisionId === "out" ? "ute" : availabilityDecisionId === "bench" ? "benk" : "start"}.`;
  }

  return sanitizeMedicalRehabilitationPlan({
    ...base,
    approachId: approach.id,
    stageId: nextStageId,
    updatedWeek: week,
    availabilityDecisionId: actionId === "availability" ? availabilityDecisionId : base.availabilityDecisionId,
    availabilityDecisionWeek: actionId === "availability" ? week : base.availabilityDecisionWeek,
    baselineMatchId: actionId === "availability" ? text(baselineMatchId) || null : base.baselineMatchId,
    history: [...asArray(base.history), { week, action: historyAction, stageId: nextStageId, note }]
  });
}

export function evaluateRehabilitationAvailability(path, decisionId) {
  if (!path || !["out", "bench", "start"].includes(decisionId)) return null;
  const injured = Boolean(path.condition?.injury);
  const stage = path.currentStageIndex;
  const supported = decisionId === "out"
    ? injured || stage < 3
    : decisionId === "bench"
      ? !injured && stage >= 3
      : !injured && stage >= 4;
  const premature = decisionId !== "out" && injured;
  const labels = { out: "Hold spilleren ute", bench: "Planlegg begrensede minutter", start: "Planlegg startplass" };
  return {
    decisionId,
    status: supported ? "supported" : premature ? "premature" : "incomplete",
    label: labels[decisionId],
    explanation: supported
      ? decisionId === "out"
        ? "Valget respekterer at dagens signaler ennå ikke støtter full kampbelastning."
        : decisionId === "bench"
          ? "Begrensede minutter passer bedre enn full kamp når lagtrening er tålt, men kampkravet fortsatt er usikkert."
          : "Condition og registrert progresjon støtter at startplass kan vurderes, uten at utfallet er risikofritt."
      : premature
        ? "Spilleren er fortsatt markert skadet. Benk eller start kan ikke begrunnes av ønsket om rask retur."
        : "Forløpet har ikke registrert nok fotballbelastning til å støtte dette kampvalget ennå.",
    guardrail: "Valget lagres som managerens plan. Kampmotoren og player-condition endres ikke av etiketten."
  };
}

export function createRehabilitationMatchEvidence(path, lastMatch = path?.lastMatch) {
  const plan = sanitizeMedicalRehabilitationPlan(path?.plan);
  if (!path || !plan?.availabilityDecisionId || !lastMatch?.id || String(lastMatch.id) === String(plan.baselineMatchId || "")) return null;
  const appearance = asArray(lastMatch?.playerStats?.appearances)
    .find((entry) => entry?.playerId === path.playerId) || null;
  const minutes = Math.max(0, Math.round(number(appearance?.minutes)));
  const actual = minutes === 0 ? "ute" : minutes <= 35 ? "begrensede minutter" : "omfattende kampbelastning";
  const intended = plan.availabilityDecisionId === "out" ? "ute" : plan.availabilityDecisionId === "bench" ? "begrensede minutter" : "start";
  const aligned = plan.availabilityDecisionId === "out"
    ? minutes === 0
    : plan.availabilityDecisionId === "bench"
      ? minutes > 0 && minutes <= 35
      : minutes > 35;
  return {
    matchId: String(lastMatch.id),
    opponent: text(lastMatch?.opponent?.name, "siste motstander"),
    intended,
    actual,
    minutes,
    aligned,
    conditionSignal: path.condition?.injury
      ? `Etter kampen er spilleren registrert skadet (${path.condition.injury.weeksOut} ${path.condition.injury.weeksOut === 1 ? "uke" : "uker"}).`
      : `Etter kampen er spilleren ikke registrert skadet; belastningen er ${Math.round(path.condition?.load || 0)}/100.`,
    uncertainty: "Kampen viser bruk og nåværende condition-signal, men beviser ikke alene at rehabiliteringsvalget forårsaket utfallet."
  };
}
