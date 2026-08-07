import fs from "node:fs";

const files = {
  html: fs.readFileSync(new URL("../index.html", import.meta.url), "utf8"),
  app: fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8"),
  presentation: fs.readFileSync(new URL("../src/ui/manager-club-presentation.js", import.meta.url), "utf8"),
  shell: fs.readFileSync(new URL("../src/ui/manager-shell-elements.js", import.meta.url), "utf8"),
  scouting: fs.readFileSync(new URL("../src/ui/manager-scouting-workspace-v1.js", import.meta.url), "utf8"),
  style: fs.readFileSync(new URL("../src/ui/manager-club-scene-v1.css", import.meta.url), "utf8"),
  package: fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ci: fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_CLUB_SCENE_V1.md", import.meta.url), "utf8"),
  operationsDocs: fs.readFileSync(new URL("../docs/MANAGER_CLUB_OPERATIONS_V1.md", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-club-scene-v1.spec.js", import.meta.url), "utf8")
};

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Club Scene v1 audit");
check("Klubb er ikke eget hovedområde", files.shell.includes('clubMainTab.hidden = true') && files.browser.includes("Klubbdrift ligger under Kontor"));
check("Klubbdrift ligger under Kontor", files.shell.includes('createSubtab(subnav, "board", "Klubbdrift")') && files.browser.includes('data-subnav-parent="dashboard"'));
check("Speiding er løftet ut av Klubbdrift", files.scouting.includes('scoutingTab.dataset.tabTarget = "historygo"') && files.browser.includes("Speiding er eget hovedområde"));
check("egen klubbkommandoflate finnes", files.html.includes('id="clubCommandPanel"') && files.html.includes('id="clubCommand"'));
check("styrets dybde er foldet", files.html.includes('id="clubDepth"') && files.html.includes("Styrets vurdering og klubbverdier"));
check("eksisterende klubbflater er bevart", ["board", "historygo", "progression", "admin", "facilities", "market"].every((id) => files.html.includes(`data-tab-section="${id}"`)));
check("Kontor eier fem varige klubbdriftsflater", ["board", "progression", "admin", "facilities", "market"].every((id) => files.shell.includes(`"${id}"`)) && files.shell.includes('section.dataset.tabParent = "dashboard"'));
check("egen presentasjonsmodul importeres", files.app.includes('from "./ui/manager-club-presentation.js"'));
check("klubbscenen rendres fra eksisterende state", files.app.includes("createManagerClubSceneModel") && files.app.includes("renderManagerClubCommand") && files.app.includes("renderManagerClubScene()"));
check("Club Week er sannhetskilde", files.app.includes("clubState: state.clubWeekState"));
check("availability er sannhetskilde", files.app.includes("const availability = getAvailability()") && files.app.includes("availability.rosterReadiness"));
check("stabidentiteten gjenbrukes", files.app.includes("getStaffIdentitySummary()"));
check("History Go-progresjonen gjenbrukes", files.app.includes("getUnlockedExpertise()") && files.app.includes("getEarnedBadges()") && files.app.includes("badgeProgress"));
check("ingen ny klubbmotor eller lagring er innført", !files.presentation.includes("localStorage") && !files.presentation.includes("fetch(") && !files.presentation.includes("Math.random"));
check("seks operative statuskort finnes", ["board", "scouting", "development", "facilities", "staff", "market"].every((id) => files.presentation.includes(`"${id}"`)));
check("lokal prioritet og status peker til eksisterende flater", ["details", "historygo", "admin", "progression", "facilities", "market"].every((target) => files.presentation.includes(`"${target}"`)));
check("mobilregler finnes", files.style.includes("Manager Club Scene v1") && files.style.includes("@media (max-width: 640px)"));
check("nettleservakten kontrollerer klubbfunksjoner og separat Speiding", files.browser.includes('data-club-target="facilities"') && files.browser.includes('data-club-target="market"') && files.browser.includes('data-tab-target="historygo"'));
check("nettleservakten kontrollerer overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("nettleservakten kontrollerer WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("simuleringen er registrert", files.package.includes('"sim:manager-club-scene-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-club-scene-v1"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-club-scene-v1") && files.ci.includes("sim:manager-club-scene-v1"));
check("opprinnelig dokumentasjon låser motorgrensene", /ingen ny styre-, speider-, stabs-/i.test(files.docs) && files.docs.includes("football-staff-identity-engine.js"));
check("operasjonsdokumentasjonen avviser nye økonomi- og sponsormotorer", files.operationsDocs.includes("ingen sponsoravtaler") && files.operationsDocs.includes("Ingen nye localStorage-nøkler"));

console.log(`\nManager Club Scene v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
