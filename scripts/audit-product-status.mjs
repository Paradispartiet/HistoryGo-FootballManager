import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const files = {
  readme: read("README.md"),
  status: read("docs/PRODUCT_STATUS.md"),
  menu: read("docs/meny.md"),
  recruitment: read("src/football-recruitment.js"),
  exercise: read("src/football-training-exercise-design.js"),
  communication: read("src/football-club-communication.js"),
  learning: read("src/ui/manager-football-learning-loop-v1.js"),
  medical: read("src/football-medical-decision-learning.js"),
  opponent: read("src/football-opponent-analysis.js"),
  postMatch: read("src/ui/manager-post-match-analysis-v1.js"),
  modes: read("src/football-mode-sessions.js"),
  package: read("package.json"),
  ci: read(".github/workflows/ci.yml")
};

let checks = 0;
let failures = 0;

function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

console.log("\nCanonical product status audit");

check("README peker på canonical produktstatus", files.readme.includes("docs/PRODUCT_STATUS.md"));
check("README bruker dagens fem hovedområder", files.readme.includes("Kontor · Lag · Speiding · Kamp · Stats"));
check("menykontrakten og README er enige", files.menu.includes("Kontor · Lag · Speiding · Kamp · Stats"));
check("README bruker classHeight og ikke gammel Overall-forklaring", files.readme.includes("`classHeight`") && !/`overall` beskriver klasse/i.test(files.readme));

const staleClaims = [
  /Status 30\.06\.2026/,
  /Full ligadybde, overgangsmarked, økonomi, kontrakter, kalender[^\n]*gjenstår/i,
  /Oversikt · Lag & taktikk · Innboks · Trening · Kamp · History Go/,
  /Fasiliteter, Administrasjon, Marked og Styret ligger som primære faner/i,
  /Kalender[^\n]{0,80}(?:ikke bygget|gjenstår)/i
];
check("README inneholder ingen kjente utgåtte nåstatuspåstander", staleClaims.every((pattern) => !pattern.test(files.readme)));

check("statusen skiller implementert fra avtalt ikke-system", files.status.includes("Implementerte hovedkontrakter") && files.status.includes("Avtalte ikke-systemer"));
check("statusen krever kode og permanente porter", files.status.includes("live kode") && files.status.includes("permanent audit") && files.status.includes("browservern"));
check("statusen avviser uavklarte troppsgrenser", files.status.includes("Troppsgrenser, overgangsregler og fasilitetseffekter er ikke åpne kodeoppgaver"));
// Formuleringen ble byttet da den siste `pending`-klubben ble landet: null står
// igjen, så «ferdigstille pooler som står pending» beskrev arbeid som ikke
// finnes. Vakten sjekker nå etterfølgeren, som er det arbeidet som FAKTISK er
// åpent — dybde i pooler som er komplette, men grunne.
check("statusen beskriver reelt dataarbeid", files.status.includes("fordype dokumenterte spillerpooler som er komplette, men grunne"));

check("spillerpool/tropp er faktisk implementert", files.recruitment.includes("PLAYER_POOL_SQUAD_STATE_VERSION") && files.recruitment.includes("squadPlayerIds"));
check("øvelsesdesign er faktisk implementert", files.exercise.includes("evaluateTrainingExerciseDesign") && files.exercise.includes("EXERCISE_DESIGN_CONTROLS"));
check("klubbkommunikasjon er faktisk implementert", files.communication.includes("createClubCommunicationTimeline") && files.status.includes("Klubbkommunikasjon"));
check("faktisk ellever leses av læringslaget", files.learning.includes("createActualLineupRoleLesson") && files.learning.includes("Relasjonen i din faktiske ellever"));
check("medisinsk beslutningsverksted er faktisk implementert", files.medical.includes("createMedicalDecisionCase") && files.medical.includes("evaluateMedicalDecision"));
check("motstanderforberedelse er faktisk implementert", files.opponent.includes("createOpponentAnalysisWorkspace") && files.opponent.includes("createOpponentAnalysisPlan"));
check("etterkampen er faktisk implementert", files.postMatch.includes("createPostMatchAnalysisModel") && files.postMatch.includes("renderPostMatchAnalysis"));
check("alle fire modussnapshots finnes", ["league", "scenario", "training", "national"].every((mode) => files.modes.includes(`"${mode}"`)));

check("audit er registrert i package", files.package.includes('"audit:product-status"'));
check("CI kjører statusauditen", files.ci.includes("npm run audit:product-status"));

console.log(`\nCanonical product status audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
