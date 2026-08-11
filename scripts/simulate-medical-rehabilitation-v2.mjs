import {
  MEDICAL_REHABILITATION_APPROACHES,
  MEDICAL_REHABILITATION_STAGES,
  createMedicalRehabilitationPath,
  createRehabilitationMatchEvidence,
  evaluateRehabilitationAvailability,
  sanitizeMedicalRehabilitationPlan,
  updateMedicalRehabilitationPlan
} from "../src/football-medical-decision-learning.js";

let passed = 0;
let failed = 0;
function check(label, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS ${label}`);
  } else {
    failed += 1;
    console.error(`FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const injured = {
  playerId: "rehab-player",
  name: "Rehabspiller",
  load: 76,
  form: 0.4,
  consecutiveFullMatches: 5,
  injury: { weeksOut: 2, reason: "belastning" }
};
const individualTraining = { week: 3, assignments: [{ playerId: injured.playerId, trackId: "rehab" }] };

console.log("Medisinsk rehabiliteringsforløp v2\n");

check("forløpet har fem fotballfaglige trinn", MEDICAL_REHABILITATION_STAGES.length === 5);
check("forløpet tilbyr tre arbeidsmåter", MEDICAL_REHABILITATION_APPROACHES.length === 3);

const initial = createMedicalRehabilitationPath({ conditions: [injured], individualTraining, currentWeek: 3 });
check("faktisk skade oppretter forløp", initial?.playerId === injured.playerId);
check("to skadeuker starter i individuell rehabilitering", initial?.currentStage.id === "individual_rehab");
check("eksisterende Opptrening registreres", initial?.hasRehabAssignment === true);
check("uten lagret plan kan forløpet ikke avanseres", initial?.canAdvance === false);

const startedPlan = updateMedicalRehabilitationPlan(initial, {
  actionId: "start",
  approachId: "criteria_led",
  currentWeek: 3,
  baselineMatchId: "before-rehab"
});
check("kriteriestyrt plan lagres lesbart", startedPlan?.approachId === "criteria_led");
check("planen lagrer ingen score", !Object.keys(startedPlan || {}).some((key) => /score|bonus|effect/i.test(key)));

const lastInjuryWeek = createMedicalRehabilitationPath({
  conditions: [{ ...injured, injury: { ...injured.injury, weeksOut: 1 } }],
  individualTraining,
  plan: startedPlan,
  currentWeek: 4
});
check("siste skadeuke vises som tilpasset fotballtrening", lastInjuryWeek.currentStage.id === "adapted_training");
check("kalenderen alene åpner ikke neste trinn", lastInjuryWeek.canAdvance === false);

const returned = createMedicalRehabilitationPath({
  conditions: [{ ...injured, load: 62, injury: null }],
  individualTraining,
  plan: startedPlan,
  currentWeek: 5
});
check("skadefri condition åpner delvis lagtrening", returned.currentStage.id === "partial_team_training");
check("moderat belastning støtter full lagtrening, ikke kampklarhet", returned.maximumSupportedStageIndex === 3);
check("manageren kan registrere overgang når signalene støtter det", returned.canAdvance === true);

const fullTeamPlan = updateMedicalRehabilitationPlan(returned, { actionId: "advance", currentWeek: 5 });
const fullTeam = createMedicalRehabilitationPath({
  conditions: [{ ...injured, load: 62, injury: null }],
  individualTraining,
  plan: fullTeamPlan,
  currentWeek: 5
});
check("registrert overgang gir full lagtrening", fullTeam.currentStage.id === "full_team_training");
check("belastning over 50 holder igjen kampklarhet", fullTeam.canAdvance === false);

const freshEnough = createMedicalRehabilitationPath({
  conditions: [{ ...injured, load: 44, injury: null }],
  individualTraining,
  plan: fullTeamPlan,
  currentWeek: 6
});
check("lavere eksisterende belastning støtter kampklarhetsvurdering", freshEnough.canAdvance === true);
const matchReadyPlan = updateMedicalRehabilitationPlan(freshEnough, { actionId: "advance", currentWeek: 6 });
const matchReady = createMedicalRehabilitationPath({
  conditions: [{ ...injured, load: 44, injury: null }],
  individualTraining,
  plan: matchReadyPlan,
  currentWeek: 6
});
check("forløpet når kampklarhetsvurdering", matchReady.currentStage.id === "match_ready");

check("start mens spilleren er skadet avvises som for tidlig",
  evaluateRehabilitationAvailability(lastInjuryWeek, "start")?.status === "premature");
check("benk støttes etter full lagtrening",
  evaluateRehabilitationAvailability(fullTeam, "bench")?.status === "supported");
check("start kan støttes ved kampklarhetsvurdering",
  evaluateRehabilitationAvailability(matchReady, "start")?.status === "supported");

const clearancePlan = updateMedicalRehabilitationPlan(matchReady, {
  actionId: "availability",
  availabilityDecisionId: "bench",
  currentWeek: 6,
  baselineMatchId: "before-return"
});
const afterMatch = createMedicalRehabilitationPath({
  conditions: [{ ...injured, load: 55, injury: null }],
  individualTraining,
  plan: clearancePlan,
  currentWeek: 6,
  lastMatch: {
    id: "return-match",
    opponent: { name: "Motstander" },
    playerStats: { appearances: [{ playerId: injured.playerId, minutes: 24 }] }
  }
});
const evidence = createRehabilitationMatchEvidence(afterMatch);
check("etterkamp sammenligner plan og faktiske minutter", evidence?.intended === "begrensede minutter" && evidence?.minutes === 24);
check("etterkamp skiller observasjon fra årsak", /beviser ikke alene/.test(evidence?.uncertainty || ""));

const before = JSON.stringify([injured]);
createMedicalRehabilitationPath({ conditions: [injured], individualTraining, plan: clearancePlan });
check("læringsforløpet muterer ikke player-condition", JSON.stringify([injured]) === before);
check("korrupt plan avvises", sanitizeMedicalRehabilitationPlan({ playerId: "x", approachId: "ukjent" }) === null);
const replacementPatient = createMedicalRehabilitationPath({
  conditions: [{ ...injured, playerId: "new-injury", name: "Ny skade" }],
  individualTraining: null,
  plan: clearancePlan
});
check("plan for en spiller som mangler blir ikke feiltilordnet en annen",
  replacementPatient?.playerId === "new-injury" && replacementPatient?.plan === null);
check("ingen oppdiktet pasient uten skade eller aktiv plan",
  createMedicalRehabilitationPath({ conditions: [{ ...injured, injury: null }], individualTraining: null }) === null);

console.log(`\nMedisinsk rehabiliteringsforløp v2: ${passed}/${passed + failed}`);
if (failed > 0) process.exitCode = 1;
