import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  html: read("../index.html"),
  app: read("../src/app.js"),
  presentation: read("../src/ui/manager-club-presentation.js"),
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
check("presentasjonen eier operasjonsnavigasjonen", files.presentation.includes("CLUB_OPERATIONS_NAV"));
check("fasiliteter åpnes uten å lage ny flate", files.presentation.includes('{ target: "facilities", label: "Fasiliteter"') && files.presentation.includes('removeAttribute("data-shell-hidden")'));
check("marked åpnes uten å lage ny flate", files.presentation.includes('{ target: "market", label: "Marked"') && files.presentation.includes('removeAttribute("data-shell-hidden")'));
check("undernavigasjonen bruker eksisterende board-parent", files.presentation.includes('button.dataset.subnavParent = "board"'));
check("undernavigasjonen bruker eksisterende target-kontrakt", files.presentation.includes("button.dataset.tabTarget = target") && files.presentation.includes("onOpenTarget?.(target)"));
check("seks statuser bygges", ["board", "scouting", "development", "facilities", "staff", "market"].every((id) => files.presentation.includes(`"${id}"`)));
check("fasilitetslesningen bruker bare eksisterende klubbverdier", files.presentation.includes("clubState?.trainingCulture") && files.presentation.includes("clubState?.mediaPressure") && files.presentation.includes("players") && files.presentation.includes("hiredStaff"));
check("markedslesningen bruker bare eksisterende klubbverdier", files.presentation.includes("trust.score") && files.presentation.includes("morale.score") && files.presentation.includes("media.score"));
check("ingen ny lagring eller nettverksmotor", !files.presentation.includes("localStorage") && !files.presentation.includes("sessionStorage") && !files.presentation.includes("fetch(") && !files.presentation.includes("Math.random"));
check("ingen ny økonomi- eller sponsormotor dokumenteres", files.docs.includes("ingen kjøp-/oppgraderingsmotor") && files.docs.includes("ingen sponsoravtaler") && files.docs.includes("Ingen nye localStorage-nøkler"));
check("legacy-simuleringen forventer seks områder", files.legacySim.includes("seks varige klubbfunksjoner") && files.legacySim.includes('"facilities", "market"'));
check("legacy-auditen beskytter de to nye inngangene", files.legacyAudit.includes("seks operative statuskort") && files.legacyAudit.includes("nettleservakten kontrollerer nye klubbflater"));
check("browsertesten åpner fasiliteter", files.browser.includes('data-club-target="facilities"') && files.browser.includes('id="facilityOverallValue"') === false && files.browser.includes("#facilityOverallValue"));
check("browsertesten åpner marked", files.browser.includes('data-club-target="market"') && files.browser.includes("#marketMediaValue"));
check("browsertesten dekker undernavigasjon", files.browser.includes('data-subnav-parent="board"][data-tab-target="facilities"]') && files.browser.includes('data-subnav-parent="board"][data-tab-target="market"]'));
check("browsertesten dekker mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browsertesten dekker WCAG A/AA", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("operasjonssimuleringen er registrert", files.package.includes('"sim:manager-club-operations-v1"'));
check("operasjonsauditen er registrert", files.package.includes('"audit:manager-club-operations-v1"'));
check("CI kjører operasjonsportene", files.ci.includes("audit:manager-club-operations-v1") && files.ci.includes("sim:manager-club-operations-v1"));

console.log(`\nManager Club Operations v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
