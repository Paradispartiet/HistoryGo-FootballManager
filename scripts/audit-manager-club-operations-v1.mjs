import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  html: read("../index.html"),
  app: read("../src/app.js"),
  presentation: read("../src/ui/manager-club-presentation.js"),
  shell: read("../src/ui/manager-shell-elements.js"),
  scouting: read("../src/ui/manager-scouting-workspace-v1.js"),
  calendar: read("../src/ui/manager-calendar-workspace-v1.js"),
  docs: read("../docs/MANAGER_CLUB_OPERATIONS_V1.md"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml"),
  browser: read("../tests/browser/manager-club-scene-v1.spec.js"),
  legacyAudit: read("./audit-manager-club-scene-v1.mjs"),
  legacySim: read("./simulate-manager-club-scene-v1.mjs")
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

console.log("\nManager Club Operations v1 audit");
check("eksisterende fasilitetsflate finnes", files.html.includes('data-tab-section="facilities"') && files.html.includes('id="facilityOverallValue"'));
check("eksisterende markedsflate finnes", files.html.includes('data-tab-section="market"') && files.html.includes('id="marketMediaValue"'));
check("eksisterende adminflate finnes", files.html.includes('data-tab-section="admin"') && files.html.includes('id="availableStaffList"'));
check("fasilitetsrenderer finnes i appen", files.app.includes("function renderFacilities()"));
check("markedsrenderer finnes i appen", files.app.includes("function renderMarketRoom()"));
check("adminrenderer finnes i appen", files.app.includes("function renderAdminRoom()"));
check("presentasjonen eier seks operasjonsstatuser foreløpig", ["board", "scouting", "development", "facilities", "staff", "market"].every((id) => files.presentation.includes(`"${id}"`)));
check("Klubben ligger under Kontor", files.shell.includes('createSubtab(subnav, "board", "Klubbdrift")') && files.calendar.includes('board.textContent = "Klubben"') && files.shell.includes('section.dataset.tabParent = "dashboard"'));
check("Klubb fjernes som eget hovedområde", files.shell.includes('clubMainTab.hidden = true') && files.scouting.includes('scoutingTab.dataset.tabTarget = "historygo"'));
check("Speiding løftes ut av Kontor uten å flytte klubbflatene", files.scouting.includes('historySection.dataset.tabParent = "historygo"') && files.calendar.includes('board.textContent = "Klubben"'));
check("fasiliteter og marked åpnes som eksisterende dypflater", files.presentation.includes('"facilities"') && files.presentation.includes('"market"') && files.shell.includes('section.removeAttribute("data-shell-hidden")'));
check("dype klubbflater skjules fra Kontors primære underfaneliste", files.shell.includes('createSubtab(subnav, "facilities", "Fasiliteter", { visible: false })') && files.shell.includes('createSubtab(subnav, "market", "Marked", { visible: false })'));
check("statuskort bruker eksisterende target-kontrakt", files.presentation.includes("onOpenTarget(item.target)"));
check("fasiliteter bruker eksplisitt save-state", files.presentation.includes("summarizeFacilityState") && files.app.includes("facilities: normalizeFacilityState(base.facilities)"));
check("markedslesningen bruker bare eksisterende klubbverdier", files.presentation.includes("trust.score") && files.presentation.includes("morale.score") && files.presentation.includes("media.score"));
check("ingen ny lagring eller nettverksmotor i presentasjonen", !files.presentation.includes("localStorage") && !files.presentation.includes("sessionStorage") && !files.presentation.includes("fetch(") && !files.presentation.includes("Math.random"));
check("ingen økonomi- eller sponsormotor introduseres av denne presentasjonen", files.docs.includes("ingen sponsoravtaler") && files.docs.includes("Ingen nye localStorage-nøkler"));
check("legacy-simuleringen forventer seks områder", files.legacySim.includes("seks varige klubbfunksjoner") && files.legacySim.includes('"facilities", "market"'));
check("legacy-auditen beskytter nytt Kontor-hierarki", files.legacyAudit.includes("Klubben er ikke eget hovedområde") && files.legacyAudit.includes("Klubben ligger under Kontor ved siden av Kalender") && files.legacyAudit.includes("Speiding er løftet ut av Klubben"));
check("browsertesten åpner fasiliteter fra Klubben", files.browser.includes('data-club-target="facilities"') && files.browser.includes("#facilityOverallValue"));
check("browsertesten åpner marked fra Klubben", files.browser.includes('data-club-target="market"') && files.browser.includes("#marketMediaValue"));
check("browsertesten bekrefter at board ikke finnes som hovedmål", files.browser.includes('.main-nav .nav-tab[data-tab-target="board"]') && files.browser.includes("toHaveCount(0)"));
check("browsertesten bekrefter separat Speiding-hovedfane", files.browser.includes('.main-nav .nav-tab[data-tab-target="historygo"]') && files.browser.includes('toHaveText("Speiding")'));
check("browsertesten dekker mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browsertesten dekker WCAG A/AA", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("operasjonssimuleringen er registrert", files.package.includes('"sim:manager-club-operations-v1"'));
check("operasjonsauditen er registrert", files.package.includes('"audit:manager-club-operations-v1"'));
check("CI kjører operasjonsportene", files.ci.includes("audit:manager-club-operations-v1") && files.ci.includes("sim:manager-club-operations-v1"));

console.log(`\nManager Club Operations v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;