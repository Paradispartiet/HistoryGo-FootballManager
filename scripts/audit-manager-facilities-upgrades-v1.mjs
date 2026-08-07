import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  html: read("../index.html"),
  app: read("../src/app.js"),
  engine: read("../src/football-facilities.js"),
  condition: read("../src/football-player-condition.js"),
  offPitch: read("../src/football-off-pitch-parameters.js"),
  presentation: read("../src/ui/manager-club-presentation.js"),
  ui: read("../src/ui/manager-facilities-workspace-v1.js"),
  css: read("../src/ui/manager-facilities-workspace-v1.css"),
  docs: read("../docs/FACILITIES_UPGRADES_V1.md"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml"),
  browser: read("../tests/browser/manager-facilities-upgrades-v1.spec.js")
};

let checks = 0;
let failures = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Facilities Upgrades v1 audit");
check("fasiliteter ligger fortsatt under Klubbdrift", files.html.includes('data-tab-section="facilities"') && files.html.includes('data-tab-parent="board"'));
check("tre reelle fasiliteter brukes", ["training", "medical", "analysis"].every((id) => files.engine.includes(`id: "${id}"`)));
check("stadion og akademi er ikke falske oppgraderingskort", !files.html.includes('id="facilityStadiumLevel"') && !files.html.includes('id="facilityAcademyLevel"'));
check("nivåene er 1–3", files.engine.includes("FACILITY_MAX_LEVEL = 3") && files.engine.includes("Math.max(1"));
check("ett anleggsvalg per klubbuke", files.engine.includes("lastUpgradeWeek === normalizedWeek") && files.engine.includes("Ukens anleggsvalg er allerede brukt"));
check("state lagres i teamMerits", files.app.includes("facilities: normalizeFacilityState(base.facilities)") && files.app.includes("state.teamMerits = result.merits"));
check("ingen ny localStorage-nøkkel", !files.app.includes("FACILITIES_KEY") && files.docs.includes("ingen ny localStorage-nøkkel"));
check("treningseffekt bruker eksisterende off-pitch-motor", files.app.includes("facilityEffects: calculateFacilityEffects") && files.offPitch.includes("trainingLoadReduction") && files.offPitch.includes("analysisClarityBonus"));
check("medisinsk effekt bruker eksisterende recovery", files.app.includes("weeklyRecoveryBonus") && files.condition.includes("recoveryBonus"));
check("klubbstatus bruker samme fasilitetsstate", files.presentation.includes("summarizeFacilityState") && files.app.includes("facilitiesState: state.teamMerits?.facilities"));
check("oppgradering er eksplisitt knapp", files.ui.includes("facility-upgrade-action") && files.ui.includes("onUpgrade(facility.id)"));
check("ingen penger eller auto-oppgradering", !files.engine.includes("salary") && !files.engine.includes("budget") && files.docs.includes("Ingen penger"));
check("workspace er mobiltilpasset", files.css.includes("@media(max-width:820px)") && files.css.includes("grid-template-columns:1fr"));
check("browser dekker persistens", files.browser.includes("hgfm.teamMerits.v1") && files.browser.includes("page.reload()"));
check("browser dekker mobil og WCAG", files.browser.includes("width: 390") && files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("audit og simulering er registrert", files.package.includes('"audit:manager-facilities-upgrades-v1"') && files.package.includes('"sim:manager-facilities-upgrades-v1"'));
check("CI kjører begge porter", files.ci.includes("audit:manager-facilities-upgrades-v1") && files.ci.includes("sim:manager-facilities-upgrades-v1"));

console.log(`\nManager Facilities Upgrades v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
