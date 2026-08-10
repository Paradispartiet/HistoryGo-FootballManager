import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  app: read("../src/app.js"),
  engine: read("../src/football-matchday-engine.js"),
  explanation: read("../src/football-match-explanation-engine.js"),
  consequences: read("../src/football-match-consequences.js"),
  players: read("../src/football-player-stats.js"),
  presentation: read("../src/ui/manager-matchday-presentation.js"),
  postMatch: read("../src/ui/manager-post-match-analysis-v1.js"),
  style: read("../src/ui/manager-post-match-analysis-v1.css"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml"),
  docs: read("../docs/MANAGER_POST_MATCH_ANALYSIS_V1.md"),
  browser: read("../tests/browser/manager-post-match-analysis-v1.spec.js")
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

console.log("\nManager Post-match Analysis v1 audit");
check("egen ren etterkampmodell finnes", files.postMatch.includes("export function createPostMatchAnalysisModel"));
check("kampdagmodulen importerer etterkampmodulen", files.presentation.includes('from "./manager-post-match-analysis-v1.js"'));
check("etterkampen er en del av eksisterende report-fase", files.presentation.includes('phase === "report" ? createPostMatchAnalysisModel'));
check("eksisterende createMatchdaySceneModel beholdes", files.presentation.includes("export function createMatchdaySceneModel"));
check("eksisterende renderManagerMatchdayCommand beholdes", files.presentation.includes("export function renderManagerMatchdayCommand"));
check("rapporten bruker forklaringsmotorens avgjørende faktorer", files.postMatch.includes("explanation.decisiveFactors"));
check("rapporten bruker taktiske faktorer", files.postMatch.includes("explanation.tacticalFactors"));
check("rapporten bruker trening og off-pitch-signaler", files.postMatch.includes("explanation.trainingFactors") && files.postMatch.includes("explanation.offPitchFactors"));
check("lagret treningsrapport føres videre uten ny beregning", files.postMatch.includes("lastMatch.trainingFocus") && files.postMatch.includes("trainingEvidence"));
check("treningsrapporten eksponeres til læringslaget", files.postMatch.includes("dataset.trainingFocusId") && files.postMatch.includes("dataset.trainingSummary"));
check("rapporten bruker faktiske spillerstatistikker", files.postMatch.includes("lastMatch?.playerStats?.goals"));
check("rapporten bruker faktiske klubbkonsekvenser", files.postMatch.includes("lastMatch?.clubConsequences?.effects"));
check("beste og svakeste managergrep vises", files.postMatch.includes("report?.bestDecision") && files.postMatch.includes("report?.worstDecision"));
check("seier, uavgjort og tap har egne toner", ["positive", "neutral", "negative"].every((tone) => files.postMatch.includes(`"${tone}"`)));
check("neste handling går til Trening eller eksplisitt problemforslag", files.postMatch.includes('"carry_training_problem"') && files.postMatch.includes(': "trening"'));
check("full rapport går til eksisterende Analyse", files.postMatch.includes('secondaryTarget: "analyse"'));
check("etterkampen har semantisk overskrift", files.postMatch.includes('aria-labelledby", "postMatchAnalysisTitle"'));
check("etterkampen viser konkrete spillerbidrag uten overall", files.postMatch.includes("buildContributors") && !files.postMatch.includes("overall"));
check("presentasjonslaget eier ingen lagring", !files.presentation.includes("localStorage") && !files.postMatch.includes("localStorage"));
check("presentasjonslaget eier ingen tilfeldighet", !files.presentation.includes("Math.random") && !files.postMatch.includes("Math.random"));
check("presentasjonslaget starter ingen ny kampmotor", !files.presentation.includes("createMatchdaySession(") && !files.postMatch.includes("createMatchdaySession("));
check("appen bruker eksisterende rapporttransformasjon", files.app.includes("createMatchReport(lastMatch)"));
check("kampmotoren eier spillerstatistikken", files.engine.includes("playerStats: createMatchPlayerStats"));
check("forklaringsmotoren eier decisiveFactors", files.explanation.includes("decisiveFactors") && files.explanation.includes("nextWeekSuggestions"));
check("konsekvensmotoren eier klubbdeltaene", files.consequences.includes("clubEffects") && files.consequences.includes("familiarityGain"));
check("spillerstatistikkmotoren eier mål og målgivende", files.players.includes("scorerName") && files.players.includes("assistName"));
check("egen etterkamp-CSS finnes", files.style.includes("Manager Post-match Analysis v1"));
check("CSS dekker mobil", files.style.includes("@media (max-width: 640px)"));
check("CSS lastes som separat presentasjonsressurs", files.postMatch.includes("manager-post-match-analysis-v1.css"));
check("browsertest dekker struktur", files.browser.includes("managergrep, spillerbidrag og konsekvenser"));
check("browsertest dekker eksplisitt videreføring og analyse", files.browser.includes('[data-matchday-target="carry_training_problem"]') && files.browser.includes('[data-matchday-target="analyse"]'));
check("browsertest dekker mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browsertest dekker WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("browsertest har visuell baseline", files.browser.includes('toHaveScreenshot("post-match-analysis-768.png"'));
check("simuleringen er registrert", files.package.includes('"sim:manager-post-match-analysis-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-post-match-analysis-v1"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-post-match-analysis-v1") && files.ci.includes("sim:manager-post-match-analysis-v1"));
check("dokumentasjonen låser motorgrensene", ["football-matchday-engine.js", "football-match-explanation-engine.js", "football-match-consequences.js"].every((name) => files.docs.includes(name)));
check("dokumentasjonen avviser ny suspensjonsmotor", files.docs.includes("ingen ny skade- eller suspensjonsmotor"));

console.log(`\nManager Post-match Analysis v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
