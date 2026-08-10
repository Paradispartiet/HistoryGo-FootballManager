import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const exists = (path) => fs.existsSync(new URL(path, import.meta.url));
const files = {
  html: read("../index.html"),
  app: read("../src/app.js"),
  organization: read("../src/ui/manager-club-organization-v1.js"),
  shell: read("../src/ui/manager-shell-elements.js"),
  scouting: read("../src/ui/manager-scouting-workspace-v1.js"),
  calendar: read("../src/ui/manager-calendar-workspace-v1.js"),
  cleanup: read("../src/ui/manager-legacy-cleanup-v1.js"),
  docs: read("../docs/MANAGER_CLUB_OPERATIONS_V1.md"),
  cleanupDocs: read("../docs/MANAGER_LEGACY_CLEANUP_V1.md"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml"),
  browser: read("../tests/browser/manager-club-organization-v1.spec.js")
};

let checks = 0;
let failures = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Club Operations v1 audit");
check("legacy klubbmarkup er fysisk fjernet", !/data-tab-section="(?:facilities|market)"|clubCommandPanel|clubDepth/.test(files.html));
check("cleanupen gjør bare save-migrering", !/document\.|querySelector/.test(files.cleanup) && files.cleanup.includes("migrateLegacyManagerStorage"));
check("klubborganisasjonen er eneste klubbinngang", files.organization.includes('const SURFACE_ID = "managerClubOrganization"') && files.html.includes('data-tab-section="board"'));
check("gammelt klubbdashboard importeres eller rendres ikke", !/manager-club-presentation|renderManagerClubScene|createManagerClubSceneModel/.test(files.app));
check("eksisterende adminflate finnes", files.html.includes('data-tab-section="admin"') && files.html.includes('id="availableStaffList"'));
check("Klubben ligger under Kontor", files.shell.includes('createSubtab(subnav, "board", "Klubbdrift")') && files.calendar.includes('board.textContent = "Klubben"'));
check("Speiding er eget hovedområde", files.scouting.includes('historySection.dataset.tabParent = "historygo"'));
check("dype legacy-underfaner opprettes ikke", !/createSubtab\(subnav, "(?:facilities|market)"/.test(files.shell));
check("avviste runtimefiler er slettet", [
  "../src/football-facilities.js",
  "../src/ui/manager-facilities-workspace-v1.js",
  "../src/ui/manager-facilities-workspace-v1.css",
  "../src/ui/manager-club-presentation.js",
  "../src/ui/manager-club-scene-v1.css"
].every((path) => !exists(path)));
check("app har ingen fasilitets- eller markedskall", !/renderFacilities|renderMarketRoom|facilityEffects|recoveryBonus/.test(files.app));
check("ingen ny økonomi- eller sponsormotor", /ingen sponsoravtaler/i.test(files.docs) && files.docs.includes("Ingen nye localStorage-nøkler"));
check("save-migreringen er dokumentert som eneste kompatibilitet", files.cleanupDocs.includes("Save-migreringen beholdes") && files.cleanupDocs.includes("fysisk slettet"));
check("browser krever fysisk fravær", files.browser.includes("ikke lenger som skjulte parallelle flater") && files.browser.includes("#clubCommandPanel, #clubDepth") && files.browser.includes("toHaveCount(0)"));
check("browser dekker mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browser dekker WCAG A/AA", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("operasjonsauditen er registrert", files.package.includes('"audit:manager-club-operations-v1"'));
check("gamle scene-skript er ute av package", !files.package.includes("manager-club-scene-v1") && !files.package.includes("sim:manager-club-operations-v1"));
check("CI kjører operasjonsauditen uten gamle sceneporter", files.ci.includes("audit:manager-club-operations-v1") && !files.ci.includes("manager-club-scene-v1") && !files.ci.includes("sim:manager-club-operations-v1"));

console.log(`\nManager Club Operations v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
