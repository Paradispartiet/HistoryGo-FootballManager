// Medisinsk vurdering og retur til spill v1
//
// Dette er et rent læringslag over eksisterende player-condition. Det stiller
// manageren overfor en beslutning og forklarer hva condition-staten faktisk
// støtter. Det diagnostiserer ingen skade, endrer ingen spiller og avgjør aldri
// retur til trening eller kamp på egen hånd.

export const MEDICAL_DECISION_LEARNING_VERSION = "historygo-football-manager.medical-decision-learning.v1";

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
