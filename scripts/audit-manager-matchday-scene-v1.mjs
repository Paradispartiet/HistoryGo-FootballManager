import fs from "node:fs";

const files = {
  html: fs.readFileSync(new URL("../index.html", import.meta.url), "utf8"),
  app: fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8"),
  presentation: fs.readFileSync(new URL("../src/ui/manager-matchday-presentation.js", import.meta.url), "utf8"),
  style: fs.readFileSync(new URL("../src/ui/manager-matchday-scene-v1.css", import.meta.url), "utf8"),
  package: fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ci: fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_MATCHDAY_SCENE_V1.md", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-matchday-scene-v1.spec.js", import.meta.url), "utf8")
};

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

console.log("\nManager Matchday Scene v1 audit");
check("egen kampkommandoflate finnes", files.html.includes('id="matchdayCommandPanel"') && files.html.includes('id="matchdayCommand"'));
check("tekniske kampdetaljer er foldet", files.html.includes('id="matchdayDepth"') && files.html.includes("Kampdetaljer og tekniske kontroller"));
check("kampresultatet beholder eksisterende container", files.html.includes('id="matchdayResult"'));
check("Analyse er fortsatt sekundær kampflate", files.html.includes('data-tab-section="analyse"') && files.html.includes('data-tab-parent="kamp"'));
check("egen kampdag-CSS er lastet", files.html.includes('src/ui/manager-matchday-scene-v1.css'));
check("presentasjonsmodulen rendrer scenen", files.presentation.includes("renderManagerMatchdayCommand") && files.presentation.includes("createMatchdaySceneModel"));
check("alle fem tilstander finnes", ["blocked", "ready", "pre_match", "live", "report"].every((phase) => files.presentation.includes(`${phase}:`)));
check("tretrinnsløypa finnes", ["Forberedelse", "Kamp", "Rapport"].every((label) => files.presentation.includes(label)));
check("fire operative statuskort finnes", ["readiness", "plan", "training", "opponent"].every((id) => files.presentation.includes(`id: "${id}"`)));
check("rapporten viser resultat og læring", files.presentation.includes("turningPoint") && files.presentation.includes("learningPoint") && files.presentation.includes("scoreLine"));
check("presentasjonslaget eier ingen lagring eller kampmotor", !files.presentation.includes("localStorage") && !files.presentation.includes("Math.random") && !files.presentation.includes("createMatchdaySession("));
check("appen importerer renderfunksjonen", files.app.includes("renderManagerMatchdayCommand") && files.app.includes('from "./ui/manager-matchday-presentation.js"'));
check("appen bruker autoritativ readiness", files.app.includes("getMatchdayReadiness(teamFit)"));
check("appen bruker eksisterende rapporttransformasjon", files.app.includes("createMatchReport(lastMatch)"));
check("appen bruker eksisterende avspark", files.app.includes("startMatchdayKickoff"));
check("appen bruker bare validerte eksisterende fanemål", files.app.includes('["dashboard", "tactics", "trening", "analyse"]') && files.app.includes("activateTab(target)"));
check("mobilregler finnes", files.style.includes("Manager Matchday Scene v1") && files.style.includes("@media (max-width: 640px)"));
check("nettleservakten kontrollerer mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("nettleservakten kontrollerer WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("visuell baseline er påkrevd", files.browser.includes('toHaveScreenshot("matchday-768.png"'));
check("simuleringen er registrert", files.package.includes('"sim:manager-matchday-scene-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-matchday-scene-v1"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-matchday-scene-v1") && files.ci.includes("sim:manager-matchday-scene-v1"));
check("dokumentasjonen låser motorgrensene", files.docs.includes("football-matchday-readiness.js") && files.docs.includes("football-matchday-engine.js") && files.docs.includes("football-next-action.js"));

console.log(`\nManager Matchday Scene v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
