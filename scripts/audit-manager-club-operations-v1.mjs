import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  html: read("../index.html"),
  app: read("../src/app.js"),
  presentation: read("../src/ui/manager-club-presentation.js"),
  shell: read("../src/ui/manager-shell-elements.js"),
  scouting: read("../src/ui/manager-scouting-workspace-v1.js"),
  calendar: read("../src/ui/manager-calendar-workspace-v1.js"),
  cleanup: read("../src/ui/manager-legacy-cleanup-v1.js"),
  facilities: read("../src/football-facilities.js"),
  docs: read("../docs/MANAGER_CLUB_OPERATIONS_V1.md"),
  cleanupDocs: read("../docs/MANAGER_LEGACY_CLEANUP_V1.md"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml"),
  browser: read("../tests/browser/manager-club-scene-v1.spec.js"),
  organizationBrowser: read("../tests/browser/manager-club-organization-v1.spec.js"),
  legacyAudit: read("./audit-manager-club-scene-v1.mjs"),
  legacySim: read("./simulate-manager-club-scene-v1.mjs")
};

let checks = 0;
let failures = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Club Operations v1 audit");
check("legacy markup finnes fortsatt bare som monolitt-kompatibilitet", files.html.includes('data-tab-section="facilities"') && files.html.includes('data-tab-section="market"'));
check("Pass 7 fjerner legacy markup fra runtime-DOM", files.cleanup.includes('[data-tab-section="facilities"]') && files.cleanup.includes('[data-tab-section="market"]'));
check("eksisterende adminflate finnes", files.html.includes('data-tab-section="admin"') && files.html.includes('id="availableStaffList"'));
check("legacy fasilitetsrenderer kan fortsatt no-op-e trygt", files.app.includes("function renderFacilities()"));
check("legacy markedsrenderer kan treffe fjernet DOM uten å skape ny flate", files.app.includes("function renderMarketRoom()"));
check("adminrenderer finnes i appen", files.app.includes("function renderAdminRoom()"));
check("gammel presentasjon kan leses under monolittnedbygging", ["board", "scouting", "development", "facilities", "staff", "market"].every((id) => files.presentation.includes(`"${id}"`)));
check("Klubben ligger under Kontor", files.shell.includes('createSubtab(subnav, "board", "Klubbdrift")') && files.calendar.includes('board.textContent = "Klubben"') && files.shell.includes('section.dataset.tabParent = "dashboard"'));
check("Klubb fjernes som eget hovedområde", files.shell.includes('clubMainTab.hidden = true') && files.scouting.includes('scoutingTab.dataset.tabTarget = "historygo"'));
check("Speiding er eget hovedområde", files.scouting.includes('historySection.dataset.tabParent = "historygo"') && files.calendar.includes('board.textContent = "Klubben"'));
check("legacy fasiliteter og marked kan ikke være live arbeidsflater", files.cleanup.includes("managerFacilitiesWorkspace") && files.cleanup.includes("managerTransferMarketWorkspace"));
check("dype klubbflater skjules fra Kontors primære underfaneliste", files.shell.includes('createSubtab(subnav, "facilities", "Fasiliteter", { visible: false })') && files.shell.includes('createSubtab(subnav, "market", "Marked", { visible: false })'));
check("gammel presentasjon introduserer ingen ny lagring eller nettverksmotor", !files.presentation.includes("localStorage") && !files.presentation.includes("sessionStorage") && !files.presentation.includes("fetch(") && !files.presentation.includes("Math.random"));
check("fasilitetseffekter er nøytrale", files.facilities.includes("weeklyRecoveryBonus: 0") && files.facilities.includes("analysisClarityBonus: 0"));
check("ingen ny økonomi- eller sponsormotor introduseres", files.docs.includes("ingen sponsoravtaler") && files.docs.includes("Ingen nye localStorage-nøkler"));
check("Pass 7-dokumentasjonen avviser økonomi kontrakt og overgangsmarked", files.cleanupDocs.includes("fiktiv klubbøkonomi") && files.cleanupDocs.includes("overgangsvinduer") && files.cleanupDocs.includes("spilleroppdagelsen"));
check("legacy-simuleringen for gammel presentasjon beholdes til monolitten deles", files.legacySim.includes("seks varige klubbfunksjoner") && files.legacySim.includes('"facilities", "market"'));
check("legacy-auditen beskytter Kontor-hierarkiet", files.legacyAudit.includes("Klubben er ikke eget hovedområde") && files.legacyAudit.includes("Klubben ligger under Kontor ved siden av Kalender") && files.legacyAudit.includes("Speiding er løftet ut av Klubben"));
check("browsertesten krever Treningsanlegg-rom uten legacy fasilitets-DOM", files.organizationBrowser.includes("treningsanlegget dikter ikke nivå eller oppgraderingsbonus") && files.organizationBrowser.includes("#managerFacilitiesWorkspace") && files.organizationBrowser.includes("toHaveCount(0)"));
check("browsertesten krever økonomi marked kontrakter fysisk ute av runtime-DOM", files.organizationBrowser.includes("ikke lenger som skjulte parallelle flater") && files.organizationBrowser.includes("#managerTransferMarketWorkspace") && files.organizationBrowser.includes("toHaveCount(0)"));
check("browsertesten bekrefter at board ikke finnes som hovedmål", files.browser.includes('.main-nav .nav-tab[data-tab-target="board"]') && files.browser.includes("toHaveCount(0)"));
check("browsertesten bekrefter separat Speiding-hovedfane", files.browser.includes('.main-nav .nav-tab[data-tab-target="historygo"]') && files.browser.includes('toHaveText("Speiding")'));
check("browsertesten dekker mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browsertesten dekker WCAG A/AA", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("operasjonssimuleringen er registrert", files.package.includes('"sim:manager-club-operations-v1"'));
check("operasjonsauditen er registrert", files.package.includes('"audit:manager-club-operations-v1"'));
check("CI kjører operasjonsportene", files.ci.includes("audit:manager-club-operations-v1") && files.ci.includes("sim:manager-club-operations-v1"));

console.log(`\nManager Club Operations v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
