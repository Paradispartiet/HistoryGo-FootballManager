import fs from "node:fs";

const files = {
  html: fs.readFileSync(new URL("../index.html", import.meta.url), "utf8"),
  app: fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8"),
  presentation: fs.readFileSync(new URL("../src/ui/manager-training-presentation.js", import.meta.url), "utf8"),
  trainingStyle: fs.readFileSync(new URL("../src/ui/manager-training-scene-v2.css", import.meta.url), "utf8"),
  package: fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ci: fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_TRAINING_SCENE_V2.md", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-training-scene-v2.spec.js", import.meta.url), "utf8")
};

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Training Scene v2 audit");
check("egen kommandoflate finnes", files.html.includes('id="trainingCommandPanel"') && files.html.includes('id="trainingCommand"'));
check("plan- og troppsdetaljer er foldet", files.html.includes('id="trainingDepth"') && files.html.includes("Planstatus og troppsdetaljer"));
check("eksisterende arbeidssteg er bevart", ["trainingProgramStep", "trainingFocusStep", "individualTrainingStep"].every((id) => files.html.includes(`id="${id}"`)));
check("egen presentasjonsmodul importeres", files.app.includes('from "./ui/manager-training-presentation.js"'));
check("kommandoflaten rendres fra eksisterende plan", files.app.includes("createManagerTrainingSceneModel") && files.app.includes("renderManagerTrainingCommand") && files.app.includes("renderManagerTrainingScene(plan)"));
check("ingen ny treningsmotor er innført", !files.presentation.includes("localStorage") && !files.presentation.includes("fetch(") && !files.presentation.includes("Math.random"));
check("program og fokus leses fra eksisterende state", files.app.includes("getSelectedTrainingProgramComposition()") && files.app.includes("getTrainingFocus(state.weeklyTrainingFocus?.focusId"));
check("troppstilstand leses fra eksisterende motor", files.app.includes("summarizeSquadCondition(getPlayerCondition())"));
check("neste motstander leses fra eksisterende kampflyt", files.app.includes("getMiniSeasonNextOpponent()"));
check("første uferdige steg kan åpnes direkte", files.presentation.includes("trainingProgramStep") && files.presentation.includes("trainingFocusStep") && files.presentation.includes("individualTrainingStep"));
check("Kamp er slutten på den lokale flyten", files.presentation.includes('target: "kamp"'));
check("det finnes fire operative statuskort", files.presentation.includes('id: "squad"') && files.presentation.includes('id: "program"') && files.presentation.includes('id: "focus"') && files.presentation.includes('id: "individual"'));
check("mobilregler finnes", files.trainingStyle.includes("Manager Training Scene v2") && files.trainingStyle.includes("@media (max-width: 640px)"));
check("nettleservakten kontrollerer overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("nettleservakten kontrollerer WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("simuleringen er registrert", files.package.includes('"sim:manager-training-scene-v2"'));
check("auditen er registrert", files.package.includes('"audit:manager-training-scene-v2"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-training-scene-v2") && files.ci.includes("sim:manager-training-scene-v2"));
check("dokumentasjonen låser motorgrensene", /ingen ny treningsmotor/i.test(files.docs) && files.docs.includes("football-training-plan.js"));

console.log(`\nManager Training Scene v2 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
