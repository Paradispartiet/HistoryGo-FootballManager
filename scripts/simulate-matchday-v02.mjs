// scripts/simulate-matchday-v02.mjs
//
// Read-only simulering av Kampdag v0.2 (src/football-matchday-engine.js).
//
// Verifiserer hele sesjonsløkken uten DOM/localStorage:
//   - kampstart med gyldig (syntetisk) teamFit lager en pre_match-sesjon,
//   - sesjonen får nøyaktig 3 hendelser med 2-4 valg hver,
//   - alle valg kan vurderes (resolveMatchdayDecision) og gir tone + effekter,
//   - decisionEffects summeres inn i sluttresultatet (finalizeMatchdaySession),
//   - sluttrapporten har v0.2-feltene (beste/svakeste grep, systemdom, råd),
//   - ulike formasjonsfamilier gir ulike hendelser,
//   - sterke vs. svake forutsetninger gir flere positive vs. negative toner,
//   - Kampdag ↔ Club Week-porten krever en kamp spilt i gjeldende uke,
//   - v1-simulateMatchday er fortsatt intakt.
//
// Rent Node-script (standardbibliotek + prosjektets egne ESM-moduler). Skriver
// ingen filer. Exit code 1 hvis en sjekk feiler, ellers 0.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { adaptHgFormations } from "../src/hg-football-formation-adapter.js";
import {
  simulateMatchday,
  createMatchReport,
  OPPONENT_PROFILES,
  pickOpponentProfile,
  getFormationFamily,
  generateMatchdayEvents,
  createMatchdaySession,
  resolveMatchdayDecision,
  finalizeMatchdaySession,
  getSessionEventIndex
} from "../src/football-matchday-engine.js";
import { buildMatchExplanation } from "../src/football-match-explanation-engine.js";
import { getHistoricalOpponentProfile } from "../src/football-historical-opponent-profiles.js";
import {
  computeMatchdayConsequences,
  evaluateClubWeekMatchdayGate
} from "../src/football-match-consequences.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf8"));
}

const formationsData = readJson("data/hgFootball/formations.json");
const erasData = readJson("data/hgFootball/formationEras.json");
const formations = adaptHgFormations(formationsData, erasData);

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

function getFormationById(id) {
  return formations.find((formation) => formation.id === id);
}

// Syntetisk teamFit med samme felter som kampmotoren leser. level styrer om
// laget har sterke eller svake forutsetninger.
function buildTeamFit(level) {
  const strong = level === "strong";
  const metricValue = strong ? 74 : 42;
  return {
    teamScore: strong ? 76 : 40,
    completeCount: 11,
    totalSlots: 11,
    metrics: {
      balanceScore: metricValue,
      widthScore: metricValue,
      depthScore: metricValue,
      buildUpScore: metricValue,
      pressScore: metricValue,
      restDefenseScore: metricValue,
      roleFitAverage: metricValue
    },
    relationships: { relationshipScore: metricValue },
    historicalFormationFit: {
      historicalScore: strong ? 74 : 42,
      historicalBonus: strong ? 2 : 0,
      historicalPenalty: strong ? 0 : 2
    },
    badgeEffects: {}
  };
}

const strongCoach = {
  coachUnderstanding: 68,
  formationFamiliarity: 66,
  tacticalLearningSpeed: 60,
  roleFitClarity: 62
};
const weakCoach = {
  coachUnderstanding: 38,
  formationFamiliarity: 36,
  tacticalLearningSpeed: 35,
  roleFitClarity: 35
};

const tactic = { id: "central_possession_4231", name: "Sentralt possession-spill", pressing: "medium", tempo: "controlled", width: "medium", buildUp: "structured_build_up" };

console.log("Kampdag v0.2-simulering");

// --- 1) Motstanderprofiler ---------------------------------------------------
console.log("\nMotstanderprofiler:");
check("5 motstanderprofiler finnes", OPPONENT_PROFILES.length === 5);
check(
  "alle profiler har id/name/style/strengths/weaknesses/pressurePoints",
  OPPONENT_PROFILES.every(
    (profile) =>
      profile.id &&
      profile.name &&
      profile.style &&
      Array.isArray(profile.strengths) &&
      Array.isArray(profile.weaknesses) &&
      Array.isArray(profile.pressurePoints)
  )
);
check("pickOpponentProfile(2) er deterministisk", pickOpponentProfile(2).id === OPPONENT_PROFILES[2].id);

// --- 2) Formasjonsfamilier og hendelsesgenerering ---------------------------
console.log("\nFormasjonsfamilier og hendelser:");
const familyExpectations = [
  ["wm_3223", "wm"],
  ["catenaccio_1432", "catenaccio"],
  ["total_433", "total"],
  ["brazil_424", "brazil"],
  ["scottish_combination_235", "pyramid"],
  ["gegen_4222", "press"],
  ["positional_325", "rest"],
  ["classic_442", "modern"]
];
familyExpectations.forEach(([id, family]) => {
  const formation = getFormationById(id);
  check(`${id} → familie ${family}`, formation && getFormationFamily(formation) === family);
});

const strongFit = buildTeamFit("strong");
const opponent = pickOpponentProfile(0);

const eventSets = new Map();
familyExpectations.forEach(([id]) => {
  const formation = getFormationById(id);
  const events = generateMatchdayEvents({
    formation,
    tacticalProfile: { ...strongFit.metrics, relationshipScore: 74 },
    opponent
  });
  eventSets.set(id, events);
  check(`${id}: 3 hendelser med 2-4 valg`, events.length === 3 && events.every((event) => event.options.length >= 2 && event.options.length <= 4));
  check(
    `${id}: motstanderhendelsen er med`,
    events.some((event) => event.id.startsWith("opp_"))
  );
});

const wmIds = eventSets.get("wm_3223").map((event) => event.id).sort().join(",");
const catIds = eventSets.get("catenaccio_1432").map((event) => event.id).sort().join(",");
const totalIds = eventSets.get("total_433").map((event) => event.id).sort().join(",");
check("WM, catenaccio og totalfotball gir ulike hendelser", wmIds !== catIds && catIds !== totalIds && wmIds !== totalIds);

// --- 3) Full sesjonsløkke ----------------------------------------------------
console.log("\nSesjonsløkke (sterkt lag, sterk stab):");
const wmFormation = getFormationById("wm_3223");
const session = createMatchdaySession({
  teamFit: strongFit,
  formation: wmFormation,
  tactic,
  activeClassifications: [],
  coachContext: strongCoach,
  opponent: pickOpponentProfile(1)
});

check("sesjonen starter i pre_match", session.phase === "pre_match");
check("sesjonen har motstander, formasjon og taktikk", Boolean(session.opponent?.id && session.formationSnapshot?.name && session.tacticSnapshot?.name));
check("teamFitSnapshot har tacticalProfile med roleFitAverage", Number.isFinite(session.teamFitSnapshot?.tacticalProfile?.roleFitAverage));
check("3 hendelser generert", session.events.length === 3);

session.phase = "event_1";
const tones = [];
while (getSessionEventIndex(session) !== null) {
  const index = getSessionEventIndex(session);
  const event = session.events[index];
  const option = event.options[0];
  const resolution = resolveMatchdayDecision({
    event,
    option,
    tacticalProfile: session.teamFitSnapshot.tacticalProfile,
    matchEngineEffects: session.matchEngineEffects,
    coachSnapshot: session.coachSnapshot
  });
  check(
    `hendelse ${index + 1}: beslutning gir tone og effekter`,
    resolution && ["positive", "neutral", "negative"].includes(resolution.tone) && typeof resolution.effects.xgDeltaFor === "number"
  );
  tones.push(resolution.tone);
  session.decisions.push({
    eventId: event.id,
    eventTitle: event.title,
    optionId: option.id,
    optionLabel: option.label,
    tone: resolution.tone,
    effects: resolution.effects,
    feedback: resolution.feedback
  });
  session.phase = index + 1 < session.events.length ? `event_${index + 2}` : "resolved";
}

check("alle 3 beslutninger registrert", session.decisions.length === 3);

const result = finalizeMatchdaySession(session);
check("sluttresultat har score og utfall", result && Number.isInteger(result.score.for) && ["win", "draw", "loss"].includes(result.outcome));
check(
  "decisionTotals er summert",
  result.decisionTotals &&
    Math.abs(
      result.decisionTotals.xgDeltaFor -
        session.decisions.reduce((sum, decision) => sum + decision.effects.xgDeltaFor, 0)
    ) < 0.001
);
check("beste grep finnes i rapporten", Boolean(result.bestDecision?.label));
check("systemdom finnes", typeof result.formationVerdict === "string" && result.formationVerdict.length > 0);
check("avgjørende lagdel finnes", typeof result.decisiveUnit === "string" && result.decisiveUnit.length > 0);
check("råd for neste uke finnes", typeof result.nextWeekAdvice === "string" && result.nextWeekAdvice.length > 0);
check("History Go-hint finnes", typeof result.historyGoHint === "string" && result.historyGoHint.length > 0);

const report = createMatchReport(result);
check("createMatchReport tar med v0.2-feltene", report.decisions.length === 3 && Boolean(report.formationVerdict) && Boolean(report.opponentStyle));

// --- 3b) Match Explanation v1.5 ---------------------------------------------
console.log("\nKampforklaring (Match Explanation v1.5):");
const explanation = result.explanation;
check("kampresultatet har en explanation", Boolean(explanation) && typeof explanation === "object");
check(
  "explanation har alle forventede felter",
  explanation &&
    typeof explanation.headline === "string" &&
    typeof explanation.resultSummary === "string" &&
    Array.isArray(explanation.decisiveFactors) &&
    Array.isArray(explanation.tacticalFactors) &&
    Array.isArray(explanation.trainingFactors) &&
    Array.isArray(explanation.offPitchFactors) &&
    Array.isArray(explanation.relationshipFactors) &&
    Array.isArray(explanation.learningPoints) &&
    Array.isArray(explanation.nextWeekSuggestions)
);
check("headline og resultSummary er ikke tomme", explanation.headline.length > 0 && explanation.resultSummary.length > 0);
check("decisiveFactors er ikke tom", explanation.decisiveFactors.length > 0);
check("learningPoints er ikke tom", explanation.learningPoints.length > 0);
check("createMatchReport tar med explanation", Boolean(report.explanation) && report.explanation === result.explanation);

// Determinisme: samme sesjon → samme forklaring (ingen tilfeldighet i motoren).
const explanationAgain = buildMatchExplanation({ result, session });
check(
  "buildMatchExplanation er deterministisk",
  JSON.stringify(explanationAgain) === JSON.stringify(buildMatchExplanation({ result, session }))
);

// Off-pitch, relasjoner og trening dukker opp NÅR input tilsier det: en sesjon
// med lav moral/høyt medietrykk/høy slitasje, klare relasjoner og en pressuke.
const richSession = createMatchdaySession({
  teamFit: {
    ...buildTeamFit("strong"),
    relationships: {
      relationshipScore: 78,
      positiveRelations: [
        { type: "positive", points: 12, title: "Bred dribler får støtte", explanation: "Backen gir overlapp og frigjør driblefoten.", roleIds: ["winger", "overlapping_fullback"] }
      ],
      negativeRelations: [
        { type: "negative", points: 11, title: "Møtende spiss uten løp rundt seg", explanation: "Targetspissen får ingen som angriper bakrommet.", roleIds: ["target_striker"] }
      ]
    }
  },
  formation: getFormationById("gegen_4222"),
  tactic,
  activeClassifications: [],
  coachContext: strongCoach,
  opponent: pickOpponentProfile(0),
  trainingFocus: {
    focusId: "pressing",
    name: "Pressing",
    week: 3,
    effectHint: "Kan styrke grep som presser høyere.",
    affectedMetrics: ["pressScore"],
    staffSupport: { level: "medium", label: "Medium" },
    opponentFit: true,
    contextRelevant: true,
    metricBonuses: { pressScore: 3 }
  },
  relationships: {
    relationshipScore: 78,
    positiveRelations: [
      { type: "positive", points: 12, title: "Bred dribler får støtte", explanation: "Backen gir overlapp og frigjør driblefoten.", roleIds: ["winger", "overlapping_fullback"] }
    ],
    negativeRelations: [
      { type: "negative", points: 11, title: "Møtende spiss uten løp rundt seg", explanation: "Targetspissen får ingen som angriper bakrommet.", roleIds: ["target_striker"] }
    ]
  },
  offPitchContext: {
    morale: 34,
    confidence: 36,
    cohesion: 38,
    fatigue: 72,
    wear: 68,
    injuryRisk: 64,
    mediaPressure: 70,
    boardPressure: 68,
    tacticalClarity: 40,
    recentTrainingProgramIds: ["press_week"],
    hiddenHint: "Det ligger en uro under overflaten som tallene ikke fullt ut forklarer.",
    topConcerns: ["Forventningspresset rundt laget er høyt."],
    positives: []
  }
});
check("sesjonen lagrer relationshipSnapshot", Boolean(richSession.relationshipSnapshot));
check("sesjonen lagrer offPitchSnapshot", Boolean(richSession.offPitchSnapshot));

// Spill gjennom med et tap-aktig forløp: velg første valg i hver hendelse.
richSession.phase = "event_1";
while (getSessionEventIndex(richSession) !== null) {
  const idx = getSessionEventIndex(richSession);
  const ev = richSession.events[idx];
  const opt = ev.options[0];
  const res = resolveMatchdayDecision({
    event: ev,
    option: opt,
    tacticalProfile: richSession.teamFitSnapshot.tacticalProfile,
    matchEngineEffects: richSession.matchEngineEffects,
    coachSnapshot: richSession.coachSnapshot,
    trainingFocus: richSession.trainingFocus
  });
  richSession.decisions.push({
    eventId: ev.id,
    eventTitle: ev.title,
    optionId: opt.id,
    optionLabel: opt.label,
    tone: res.tone,
    effects: res.effects,
    feedback: res.feedback,
    trainingImpact: res.trainingImpact
  });
  richSession.phase = idx + 1 < richSession.events.length ? `event_${idx + 2}` : "resolved";
}
const richResult = finalizeMatchdaySession(richSession);
const richExplanation = richResult.explanation;
check("rik sesjon: offPitchFactors dukker opp", richExplanation.offPitchFactors.length > 0);
check("rik sesjon: relationshipFactors dukker opp", richExplanation.relationshipFactors.length > 0);
check("rik sesjon: trainingFactors dukker opp", richExplanation.trainingFactors.length > 0);
check(
  "rik sesjon: tynn-input gir færre off-pitch-faktorer enn rik input",
  buildMatchExplanation({ result }).offPitchFactors.length < richExplanation.offPitchFactors.length
);

// --- 4) Forutsetninger påvirker tonene --------------------------------------
console.log("\nForutsetninger (sterkt vs. svakt lag):");
function countTones(teamFit, coach) {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  // Kjør over alle familier og alle valg for et stabilt bilde.
  familyExpectations.forEach(([id]) => {
    const formation = getFormationById(id);
    const trial = createMatchdaySession({
      teamFit,
      formation,
      tactic,
      activeClassifications: [],
      coachContext: coach,
      opponent: pickOpponentProfile(0)
    });
    trial.events.forEach((event) => {
      event.options.forEach((option) => {
        const resolution = resolveMatchdayDecision({
          event,
          option,
          tacticalProfile: trial.teamFitSnapshot.tacticalProfile,
          matchEngineEffects: trial.matchEngineEffects,
          coachSnapshot: trial.coachSnapshot
        });
        counts[resolution.tone] += 1;
      });
    });
  });
  return counts;
}

const strongTones = countTones(buildTeamFit("strong"), strongCoach);
const weakTones = countTones(buildTeamFit("weak"), weakCoach);
check(
  `sterkt lag får flere positive grep (${strongTones.positive} vs ${weakTones.positive})`,
  strongTones.positive > weakTones.positive
);
check(
  `svakt lag får flere negative grep (${weakTones.negative} vs ${strongTones.negative})`,
  weakTones.negative > strongTones.negative
);

const weakNoCoach = countTones(buildTeamFit("weak"), weakCoach);
const weakWithCoach = countTones(buildTeamFit("weak"), strongCoach);
check(
  `sterk stab mildner svakt lag (${weakWithCoach.negative} < ${weakNoCoach.negative} negative)`,
  weakWithCoach.negative < weakNoCoach.negative
);

// --- 5) Club Week Consequence Loop v1 ----------------------------------------
console.log("\nKampkonsekvenser (Club Week Consequence Loop v1):");

// Konsekvens fra et ekte fullført v0.2-resultat.
const liveConsequences = computeMatchdayConsequences({
  lastMatch: result,
  coachSnapshot: session.coachSnapshot,
  historicalScore: session.teamFitSnapshot.historicalScore
});
check("fullført kamp gir konsekvens", Boolean(liveConsequences));
check(
  "konsekvensen peker på brukt formationId",
  liveConsequences?.formationId === "wm_3223"
);
check(
  "formationFamiliarity-økningen er 1-6",
  Number.isInteger(liveConsequences?.familiarityGain) &&
    liveConsequences.familiarityGain >= 1 &&
    liveConsequences.familiarityGain <= 6
);
check(
  "alle klubbeffekter er små (maks ±4)",
  Object.values(liveConsequences?.clubEffects || {}).every(
    (delta) => Number.isInteger(delta) && Math.abs(delta) <= 4 && delta !== 0
  )
);

// Syntetiske resultater med kontrollert utfall.
function buildSyntheticResult(overrides = {}) {
  return {
    id: "synthetic-match",
    version: 2,
    outcome: "win",
    teamStrength: 60,
    opponent: { id: "opp", name: "Testlaget", strength: 60 },
    expectedGoals: { for: 1.4, against: 1.0 },
    formationSnapshot: { id: "wm_3223", name: "WM" },
    decisions: [],
    decisionTotals: { eventScoreDelta: 0, xgDeltaFor: 0, xgDeltaAgainst: 0, momentumDelta: 0, riskDelta: 0, tacticalClarityDelta: 0 },
    ...overrides
  };
}

const winConsequences = computeMatchdayConsequences({ lastMatch: buildSyntheticResult() });
check(
  "seier gir positiv moral og styretillit og lavere medietrykk",
  winConsequences.clubEffects.playerMorale > 0 &&
    winConsequences.clubEffects.boardTrust > 0 &&
    winConsequences.clubEffects.mediaPressure < 0
);

const lossConsequences = computeMatchdayConsequences({
  lastMatch: buildSyntheticResult({ outcome: "loss", expectedGoals: { for: 0.8, against: 1.9 } })
});
check(
  "tap gir negativ moral/styretillit og økt medietrykk",
  lossConsequences.clubEffects.playerMorale < 0 &&
    lossConsequences.clubEffects.boardTrust < 0 &&
    lossConsequences.clubEffects.mediaPressure > 0
);

const clarityConsequences = computeMatchdayConsequences({
  lastMatch: buildSyntheticResult({
    outcome: "draw",
    decisionTotals: { eventScoreDelta: 3, xgDeltaFor: 0.3, xgDeltaAgainst: 0, momentumDelta: 2, riskDelta: 0, tacticalClarityDelta: 3 }
  })
});
check(
  "god beslutningsrekke gir taktisk klarhet",
  clarityConsequences.clubEffects.tacticalClarity > 0
);

const riskyLoss = computeMatchdayConsequences({
  lastMatch: buildSyntheticResult({
    outcome: "loss",
    decisionTotals: { eventScoreDelta: -2, xgDeltaFor: 0, xgDeltaAgainst: 0.4, momentumDelta: -2, riskDelta: 5, tacticalClarityDelta: -2 }
  })
});
check(
  "høy risiko som feiler gir ekstra medietrykk",
  riskyLoss.clubEffects.mediaPressure > lossConsequences.clubEffects.mediaPressure
);

const goodMatchGain = computeMatchdayConsequences({
  lastMatch: buildSyntheticResult({
    decisionTotals: { eventScoreDelta: 3, xgDeltaFor: 0.4, xgDeltaAgainst: 0, momentumDelta: 2, riskDelta: 0, tacticalClarityDelta: 3 }
  }),
  coachSnapshot: strongCoach,
  historicalScore: 74
}).familiarityGain;
const badMatchGain = computeMatchdayConsequences({
  lastMatch: buildSyntheticResult({
    outcome: "loss",
    decisions: [{ tone: "negative" }, { tone: "negative" }, { tone: "neutral" }],
    decisionTotals: { eventScoreDelta: -3, xgDeltaFor: 0, xgDeltaAgainst: 0.5, momentumDelta: -2, riskDelta: 4, tacticalClarityDelta: -2 }
  }),
  coachSnapshot: weakCoach,
  historicalScore: 40
}).familiarityGain;
check(
  `god kamp gir mer formasjonstilvenning enn dårlig (${goodMatchGain} > ${badMatchGain})`,
  goodMatchGain > badMatchGain && badMatchGain >= 1
);

// Engangsbruk og bakoverkompatibilitet.
check(
  "resultat med consequencesApplied gir ingen ny konsekvens",
  computeMatchdayConsequences({ lastMatch: buildSyntheticResult({ consequencesApplied: true }) }) === null
);
check(
  "gammelt v1-resultat (uten version 2) gir ingen konsekvens",
  computeMatchdayConsequences({ lastMatch: buildSyntheticResult({ version: undefined }) }) === null
);
check("manglende resultat gir ingen konsekvens", computeMatchdayConsequences({ lastMatch: null }) === null);

// --- 6) Kampdag ↔ Club Week-porten -------------------------------------------
console.log("\nKampdag ↔ Club Week-port (kampdagfasen krever spilt kamp):");

const matchDayWeek = { week: 3, phase: "matchday" };
check(
  "uten Club Week-state er porten åpen",
  evaluateClubWeekMatchdayGate({}).isBlocked === false
);
check(
  "utenfor kampdagfasen er porten åpen",
  evaluateClubWeekMatchdayGate({ clubWeekState: { week: 3, phase: "training" } }).isBlocked === false
);
check(
  "kampdagfase uten spilt kamp stenger porten",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek }).isBlocked === true
);
check(
  "pågående kampsesjon stenger porten",
  evaluateClubWeekMatchdayGate({
    clubWeekState: matchDayWeek,
    lastMatch: { playedInClubWeek: 3 },
    hasActiveSession: true
  }).isBlocked === true
);
check(
  "kamp fra en tidligere uke teller ikke som ukens kamp",
  evaluateClubWeekMatchdayGate({
    clubWeekState: matchDayWeek,
    lastMatch: { playedInClubWeek: 2 }
  }).isBlocked === true
);
check(
  "gammelt resultat uten ukemerke teller ikke som ukens kamp",
  evaluateClubWeekMatchdayGate({
    clubWeekState: matchDayWeek,
    lastMatch: buildSyntheticResult()
  }).isBlocked === true
);
check(
  "kamp spilt denne uka åpner porten",
  evaluateClubWeekMatchdayGate({
    clubWeekState: matchDayWeek,
    lastMatch: { playedInClubWeek: 3 }
  }).isBlocked === false
);
check(
  "stengt port har en norsk begrunnelse",
  evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek }).reason.length > 0 &&
    evaluateClubWeekMatchdayGate({ clubWeekState: matchDayWeek, lastMatch: { playedInClubWeek: 3 } }).reason === ""
);

// --- 6b) Historical Opponent Archetypes v1 -----------------------------------
console.log("\nHistoriske stil-motstandere:");
const histAjax = getHistoricalOpponentProfile("ajax_1971_73_total_football");
check("historisk profil kan hentes", Boolean(histAjax?.id && histAjax.styleTraits));

const histSession = createMatchdaySession({
  teamFit: strongFit,
  formation: wmFormation,
  tactic,
  activeClassifications: [],
  coachContext: strongCoach,
  opponent: histAjax,
  offPitchContext: { team: { fatigue: 30, wear: 30 }, squad: { tacticalClarity: 60 } }
});
check("kampdag kan bruke en historisk motstander", histSession.opponent?.id === "ajax_1971_73_total_football");
check("sesjonen bærer en historisk stil-matchup", Boolean(histSession.historicalMatchup?.matchupScore >= 0));
check(
  "historisk matchup har advantages/vulnerabilities og læringspunkt",
  Array.isArray(histSession.historicalMatchup?.advantages) &&
    Array.isArray(histSession.historicalMatchup?.vulnerabilities) &&
    typeof histSession.historicalMatchup?.historicalLearningPoint === "string"
);
check(
  "historisk motstander gir likevel en motstanderhendelse (via baseStyleId)",
  histSession.events.some((event) => event.id.startsWith("opp_"))
);

histSession.phase = "event_1";
while (getSessionEventIndex(histSession) !== null) {
  const idx = getSessionEventIndex(histSession);
  const ev = histSession.events[idx];
  const res = resolveMatchdayDecision({
    event: ev,
    option: ev.options[0],
    tacticalProfile: histSession.teamFitSnapshot.tacticalProfile,
    matchEngineEffects: histSession.matchEngineEffects,
    coachSnapshot: histSession.coachSnapshot
  });
  histSession.decisions.push(res);
  histSession.phase = idx + 1 < histSession.events.length ? `event_${idx + 2}` : "resolved";
}
const histResult = finalizeMatchdaySession(histSession);
check("historisk resultat bærer historicalMatchup", Boolean(histResult.historicalMatchup));
check(
  "kampforklaringen får en historisk stil-faktor",
  Array.isArray(histResult.explanation?.historicalFactors) && histResult.explanation.historicalFactors.length > 0
);
const histReport = createMatchReport(histResult);
check(
  "rapporten eksponerer arketyp/epoke/skole",
  Boolean(histReport.opponentArchetype && histReport.opponentEra && histReport.opponentTacticalSchool)
);

// --- 7) v1-motoren er intakt -------------------------------------------------
console.log("\nKampdag v1 (regresjon):");
const v1Result = simulateMatchday({
  teamFit: buildTeamFit("strong"),
  formation: wmFormation,
  activeClassifications: []
});
check(
  "simulateMatchday gir fortsatt gyldig resultat",
  v1Result && Number.isInteger(v1Result.score.for) && ["win", "draw", "loss"].includes(v1Result.outcome) && Array.isArray(v1Result.analysis)
);
const v1Report = createMatchReport(v1Result);
check("v1-resultat gir fortsatt gyldig rapport (uten v0.2-felter)", v1Report.scoreLine.includes("–") && v1Report.decisions.length === 0);

console.log(failures === 0 ? "\nAlle sjekker besto." : `\n${failures} sjekk(er) feilet.`);
process.exit(failures === 0 ? 0 : 1);
