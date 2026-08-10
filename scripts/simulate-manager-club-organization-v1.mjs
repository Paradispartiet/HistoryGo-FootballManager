import { createClubOrganizationModel } from "../src/ui/manager-club-organization-v1.js";
import {
  createMedicalDecisionCase,
  evaluateMedicalDecision
} from "../src/football-medical-decision-learning.js";
import {
  createOpponentAnalysisPlan,
  createOpponentAnalysisWorkspace,
  isOpponentAnalysisPlanForFixture,
  normalizeOpponentAnalysisPlan
} from "../src/football-opponent-analysis.js";
import { evaluateMatchdayReadiness } from "../src/football-matchday-readiness.js";

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

const model = createClubOrganizationModel({
  clubName: "Rosenborg",
  club: {
    id: "rosenborg",
    name: "Rosenborg",
    ground: "Lerkendal",
    city: "Trondheim",
    homePlaceId: "lerkendal_stadion"
  },
  hiredStaff: [
    { id: "assistant", name: "Assistent", staffType: "assistant_coach" },
    { id: "physio", name: "Fysio", staffType: "physio" }
  ],
  boardExpectation: "Øvre halvdel",
  boardTrust: 58,
  squadCount: 19,
  formation: "4–3–3",
  tactic: "Høyt press",
  trainingProgram: "Formasjonstilvenning",
  trainingFocus: "Press og avstander",
  conditionSignal: "To spillere trenger oppfølging",
  loadSignal: "Middels belastning",
  nextOpponent: "Viking · runde 4",
  development: { expertiseCount: 4, activePrograms: 1, badgeCount: 2 }
});

console.log("\nManager Club Organization v1 simulation");
check("klubbidentiteten bruker canonical hjemmebane", model.clubName === "Rosenborg" && model.ground === "Lerkendal" && model.city === "Trondheim");
check("organisasjonen har to menneskelige/faglige grupper", model.groups.join("|") === "Fotballavdelingen|Klubben");
check("trenerteam er et eksplisitt rom", model.rooms.some((room) => room.id === "coaches" && room.label === "Trenerteam"));
check("treningsanlegget dikter ikke nivå", model.rooms.some((room) => room.id === "training-ground" && /ikke dokumentert/i.test(room.summary)));
check("medisinsk apparat leser faktisk stabsprofil", model.rooms.some((room) => room.id === "medical" && /Fysio/.test(room.summary)));
check("analyse viser aktivt system", model.rooms.some((room) => room.id === "analysis" && room.summary.includes("4–3–3") && room.summary.includes("Høyt press")));
check("styret er organisasjonsrom og ikke rå måler", model.rooms.some((room) => room.id === "board" && /Styret/.test(room.label) && !/58\/100/.test(room.summary)));
check("administrasjon nevner tropp og støtteapparat", model.rooms.some((room) => room.id === "administration" && room.summary.includes("19 spillere") && room.summary.includes("2 i støtteapparatet")));
check("stadion kommer fra klubbdata", model.rooms.some((room) => room.id === "stadium" && room.summary.includes("Lerkendal") && room.summary.includes("Trondheim")));
check("klubbutvikling beholder History Go-arbeidet", model.rooms.some((room) => room.id === "development" && room.actions.some((action) => action.id === "progression")));
check("akademi lages ikke uten datagrunnlag", !model.rooms.some((room) => room.id === "academy"));
check("ingen room-id representerer økonomi marked eller fasilitetsoppgradering", !model.rooms.some((room) => /economy|transfer|market|facility-upgrade/.test(room.id)));

const academyModel = createClubOrganizationModel({
  clubName: "Dataklubb",
  club: { id: "data", name: "Dataklubb", academyName: "Dokumentert akademi" }
});
check("akademi vises når data faktisk finnes", academyModel.rooms.some((room) => room.id === "academy" && room.summary === "Dokumentert akademi"));

const injured = createMedicalDecisionCase([
  { playerId: "one", name: "Én uke", load: 40, injury: { weeksOut: 1, reason: "belastning" } },
  { playerId: "three", name: "Tre uker", load: 65, injury: { weeksOut: 3, reason: "fem fulle kamper" } }
]);
check("medisinsk verksted prioriterer faktisk lengste skadefravær", injured.kind === "return_to_play" && injured.playerId === "three" && /fem fulle kamper/.test(injured.situation));
check("medisinsk sak skiller kjent fra manglende informasjon", injured.known.length >= 3 && injured.missing.length >= 4);
check("medisinsk sak gir tre reelle returvalg", injured.choices.map((choice) => choice.id).join("|") === "full_return_now|calendar_only|rehab_and_assess");
check("full retur uten funksjonsdata avvises", evaluateMedicalDecision(injured, "full_return_now")?.status === "premature");
check("ukeestimat alene er utilstrekkelig", evaluateMedicalDecision(injured, "calendar_only")?.status === "incomplete");
const rehab = evaluateMedicalDecision(injured, "rehab_and_assess");
check("kriteriebasert opptrening er best begrunnet", rehab?.status === "supported" && rehab?.isRecommended === true && /endrer ikke/i.test(rehab?.guardrail));

const loadCase = createMedicalDecisionCase([
  { playerId: "moderate", name: "Moderat", load: 58, consecutiveFullMatches: 2 },
  { playerId: "high", name: "Høy", load: 82, consecutiveFullMatches: 6 }
]);
check("høyeste faktiske belastning gir belastningssak", loadCase.kind === "load_management" && loadCase.playerId === "high");
check("uendret full belastning avvises", evaluateMedicalDecision(loadCase, "full_load")?.status === "premature");
check("justering og ny vurdering støttes", evaluateMedicalDecision(loadCase, "adjust_and_review")?.status === "supported");

const quiet = createMedicalDecisionCase([{ playerId: "fresh", name: "Frisk", load: 22 }]);
check("rolig condition oppretter ingen pasient", quiet.kind === "no_case" && quiet.playerId === null && quiet.choices.length === 0);
check("ukjent medisinsk valg gir ingen oppdiktet konsekvens", evaluateMedicalDecision(injured, "unknown") === null);

const analysisWorkspace = createOpponentAnalysisWorkspace({
  fixture: {
    fixtureId: "season-1-r4-rosenborg-brann",
    round: 4,
    homeAway: "home",
    opponent: {
      id: "brann",
      name: "Brann",
      style: "Intenst 4-3-3 som presser høyt",
      archetypeName: "Fotballrepublikken",
      buildUpStyle: "Kort bakfra og fort vertikalt",
      inPossessionShape: "4-3-3 med høye backer",
      outOfPossessionShape: "4-3-3 som presser høyt",
      defensiveBlock: "Høy blokk",
      attackingStyle: "Vertikalt etter gjenvinning",
      strengths: ["hele laget deltar i presset", "gjenvinner høyt"],
      weaknesses: ["rom bak den høye linja"],
      vulnerableZones: ["bakrommet bak backene"],
      dangerZones: ["egen sekstenmeter i oppbyggingen"],
      keyBattles: ["keeper og stoppere mot første pressledd"],
      pressurePoints: ["finn fri spiller bak første pressledd"]
    },
    formationMatchup: {
      risks: [{ text: "Første oppspill kan låses av presset." }],
      advantages: [{ text: "Rommet bak første pressledd kan angripes." }],
      suggestions: ["Behold en fri spiller sentralt."]
    }
  },
  formation: { name: "4-3-3" },
  tactic: { name: "Kontrollert oppbygging" },
  trainingLabel: "Spille av høyt press"
});
check("terminfestet motstander gir spillbart analyseverksted", analysisWorkspace.kind === "fixture" && analysisWorkspace.opponent.name === "Brann");
check("analyseverkstedet tilbyr fire avgrensede spørsmål", analysisWorkspace.focuses.length === 4);
check("registrerte signaler kommer fra profil og matchup", analysisWorkspace.focuses.every((focus) => focus.signals.length > 0));
check("hvert fokus gir tre faglige motgrep med risiko og observasjon", analysisWorkspace.focuses.every((focus) => focus.countermeasures.length === 3 && focus.countermeasures.every((measure) => measure.risk && measure.watch)));

const analysisPlan = createOpponentAnalysisPlan({
  workspace: analysisWorkspace,
  focusId: "press",
  countermeasureId: "train_escape",
  week: 3
});
check("managerens valg blir en plan for nøyaktig fixture", analysisPlan?.fixtureId === "season-1-r4-rosenborg-brann" && analysisPlan?.focusId === "press");
check("planen lagrer hypotese motgrep risiko og observasjonspunkt", Boolean(analysisPlan?.hypothesis && analysisPlan?.countermeasureLabel && analysisPlan?.risk && analysisPlan?.watch));
check("normalisering beholder gyldig plan og avviser ukjent versjon", normalizeOpponentAnalysisPlan(analysisPlan)?.fixtureId === analysisPlan.fixtureId && normalizeOpponentAnalysisPlan({ ...analysisPlan, version: "unknown" }) === null);
check("bare planen for samme terminfestede kamp teller", isOpponentAnalysisPlanForFixture(analysisPlan, analysisPlan.fixtureId) && !isOpponentAnalysisPlanForFixture(analysisPlan, "next-fixture"));
check("manglende terminliste lager ikke oppdiktet motstander", createOpponentAnalysisWorkspace().kind === "no_fixture");

const readyAssignments = Array.from({ length: 11 }, (_, index) => ({ playerId: `p${index}`, roleId: `r${index}` }));
const readinessBase = {
  starterAssignments: readyAssignments,
  duplicatePlayerIds: [],
  unlockedPlayerCount: 15,
  benchCount: 4,
  hasTrainingChoice: true,
  selectedMode: "league",
  hasPlayableMatch: true,
  leagueSeasonActive: true,
  clubWeekBlocked: false,
  requiresOpponentAnalysis: true,
  opponentName: "Brann"
};
check("manglende analyseplan blokkerer samme autoritative readiness", evaluateMatchdayReadiness(readinessBase).primaryBlocker?.code === "opponent_analysis_missing");
check("registrert analyseplan åpner kampklarheten uten bonus", evaluateMatchdayReadiness({ ...readinessBase, hasOpponentAnalysisPlan: true }).canStartMatch === true);

console.log(`\nManager Club Organization v1: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
