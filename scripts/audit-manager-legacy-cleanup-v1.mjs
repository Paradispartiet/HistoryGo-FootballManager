import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const exists = (path) => fs.existsSync(new URL(path, import.meta.url));

const files = {
  migration: read("../src/football-legacy-save-migration.js"),
  cleanup: read("../src/ui/manager-legacy-cleanup-v1.js"),
  shell: read("../src/ui/manager-shell-view.js"),
  facilities: read("../src/football-facilities.js"),
  facilitiesUi: read("../src/ui/manager-facilities-workspace-v1.js"),
  seed: read("../data/football_team_merits.example.json"),
  docs: read("../docs/MANAGER_LEGACY_CLEANUP_V1.md"),
  browser: read("../tests/browser/manager-legacy-cleanup-v1.spec.js"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml")
};

let checks = 0;
let failures = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Legacy Cleanup v1 audit");

check("migreringen fjerner nøyaktig tre avviste merits-felt",
  files.migration.includes('"facilities"') && files.migration.includes('"clubEconomy"') && files.migration.includes('"transferMarket"'));
check("ren migreringsmodul bruker ikke browserlagring", !/localStorage|sessionStorage|document\.|window\./.test(files.migration));
check("mode-envelope migreres per teamMerits", files.migration.includes("migrateLegacyModeEnvelope") && files.migration.includes("session.teamMerits"));
check("cleanup bruker eksisterende merits- og mode-nøkler", files.cleanup.includes('"hgfm.teamMerits.v1"') && files.cleanup.includes("MODE_SESSION_KEY"));
check("cleanup oppretter ingen ny legacy-lagringsnøkkel", !/hgfm\.legacy|cleanup\.v1|migration\.v1/.test(files.cleanup));
check("managerskallet kjører cleanup før øvrige arbeidsflater", files.shell.trimStart().startsWith('import "./manager-legacy-cleanup-v1.js"'));
check("økonomi-UI lastes ikke lenger", !files.shell.includes("manager-economy-contracts-v1.js"));
check("overgangs-UI lastes ikke lenger", !files.shell.includes("manager-transfer-market-v2.js"));
check("canonical merits-seed mangler facilities", !files.seed.includes('"facilities"'));
check("canonical merits-seed mangler clubEconomy", !files.seed.includes('"clubEconomy"'));
check("canonical merits-seed mangler transferMarket", !files.seed.includes('"transferMarket"'));
check("fasilitetsdefinisjoner er tomme", files.facilities.includes("FACILITY_DEFINITIONS = Object.freeze([])"));
check("fasilitetseffekter er nøytralisert", ["trainingLoadReduction: 0", "weeklyRecoveryBonus: 0", "medicalTrainingProtection: 0", "analysisClarityBonus: 0"].every((token) => files.facilities.includes(token)));
check("fasilitetsstate skrives ikke tilbake", files.facilities.includes("return undefined") && files.facilities.includes("delete next.facilities"));
check("fasilitetsworkspace rendrer ingen nivå-UI", files.facilitiesUi.includes("replaceChildren") && files.facilitiesUi.includes('dataset.legacyRemoved = "true"') && !files.facilitiesUi.includes("facility-upgrade-action"));

const permanentlyRemoved = [
  "../src/football-club-economy.js",
  "../src/football-transfer-market.js",
  "../src/ui/manager-economy-contracts-v1.js",
  "../src/ui/manager-economy-contracts-v1.css",
  "../src/ui/manager-transfer-market-v2.js",
  "../src/ui/manager-transfer-market-v2.css",
  "../docs/FACILITIES_UPGRADES_V1.md",
  "../docs/MANAGER_ECONOMY_CONTRACTS_V1.md",
  "../docs/MANAGER_TRANSFER_MARKET_V2.md",
  "../scripts/audit-manager-facilities-upgrades-v1.mjs",
  "../scripts/simulate-manager-facilities-upgrades-v1.mjs",
  "../scripts/audit-manager-transfer-market-v2.mjs",
  "../scripts/simulate-transfer-market-v2.mjs",
  "../tests/browser/manager-economy-contracts-v1.spec.js",
  "../tests/browser/manager-facilities-upgrades-v1.spec.js",
  "../tests/browser/manager-transfer-market-v2.spec.js"
];
check("avviste motor-/UI-/testfiler er fysisk slettet", permanentlyRemoved.every((path) => !exists(path)));

check("browser verifiserer save-migrering", files.browser.includes("clubEconomy") && files.browser.includes("transferMarket") && files.browser.includes("recruitedPlayerIds"));
check("browser verifiserer at legacy DOM er borte", files.browser.includes("managerEconomyWorkspace") && files.browser.includes("managerTransferMarketWorkspace") && files.browser.includes('data-tab-section="facilities"'));
check("browser verifiserer at rekrutteringsklikk ikke blokkeres", files.browser.includes("defaultPrevented") && files.browser.includes("dataset.recruitPlayer"));
check("dokumentasjonen låser History Go som spillerkilde", files.docs.includes("History Go eier fortsatt spilleroppdagelsen"));
check("dokumentasjonen låser ingen ny lagringsnøkkel", files.docs.includes("ingen ny lagringsnøkkel"));
check("Pass 7 audit er registrert", files.package.includes('"audit:manager-legacy-cleanup-v1"'));
check("Pass 7 sim er registrert", files.package.includes('"sim:manager-legacy-cleanup-v1"'));
check("gamle fasilitets-/transferporter er ute av package", !files.package.includes("manager-facilities-upgrades-v1") && !files.package.includes("manager-transfer-market-v2"));
check("CI kjører Pass 7 audit og sim", files.ci.includes("audit:manager-legacy-cleanup-v1") && files.ci.includes("sim:manager-legacy-cleanup-v1"));
check("CI kjører ikke de gamle portene", !files.ci.includes("manager-facilities-upgrades-v1") && !files.ci.includes("manager-transfer-market-v2"));

console.log(`\nManager Legacy Cleanup v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
