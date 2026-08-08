import fs from "node:fs";

const files = {
  shell: fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8"),
  organization: fs.readFileSync(new URL("../src/ui/manager-club-organization-v1.js", import.meta.url), "utf8"),
  style: fs.readFileSync(new URL("../src/ui/manager-club-organization-v1.css", import.meta.url), "utf8"),
  oldClub: fs.readFileSync(new URL("../src/ui/manager-club-presentation.js", import.meta.url), "utf8"),
  facilities: fs.readFileSync(new URL("../src/ui/manager-facilities-workspace-v1.js", import.meta.url), "utf8"),
  cleanup: fs.readFileSync(new URL("../src/ui/manager-legacy-cleanup-v1.js", import.meta.url), "utf8"),
  clubs: fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"),
  staff: fs.readFileSync(new URL("../data/football_staff.json", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_CLUB_ORGANIZATION_V1.md", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-club-organization-v1.spec.js", import.meta.url), "utf8"),
  package: fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ci: fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8")
};

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Club Organization v1 audit");
check("managerskallet laster klubborganisasjonen", files.shell.includes('import "./manager-club-organization-v1.js"'));
check("Klubben reparentes til Kontor", files.organization.includes('boardButton.dataset.subnavParent = "dashboard"') && files.organization.includes('boardSection.dataset.tabParent = "dashboard"'));
check("Klubben heter Klubben og ikke Klubboversikt", files.organization.includes('boardButton.textContent = "Klubben"'));
check("dype gamle underfaner skjules", files.organization.includes('["progression", "admin"]') && files.style.includes(".club-organization-deep-proxy"));
check("hovedflaten er romkatalog", files.organization.includes('const SURFACE_ID = "managerClubOrganization"') && files.organization.includes("club-organization-room-list"));
check("organisasjonen har Trenerteam", files.organization.includes('"coaches"') && files.organization.includes('"Trenerteam"'));
check("organisasjonen har Treningsanlegg uten nivå", files.organization.includes('"training-ground"') && files.organization.includes("ikke oppdiktede nivå 1–3"));
check("organisasjonen har Medisinsk apparat", files.organization.includes('"medical"') && files.organization.includes('"Medisinsk apparat"'));
check("organisasjonen har Analyse", files.organization.includes('"analysis"') && files.organization.includes('"Analyse"'));
check("organisasjonen har Styret", files.organization.includes('"board"') && files.organization.includes('"Styret"'));
check("organisasjonen har Administrasjon", files.organization.includes('"administration"') && files.organization.includes('"Administrasjon"'));
check("organisasjonen har Stadion og hjemmebane", files.organization.includes('"stadium"') && files.organization.includes('"Stadion og hjemmebane"'));
check("organisasjonen beholder Klubbutvikling", files.organization.includes('"development"') && files.organization.includes('"Klubbutvikling"'));
check("akademi vises bare betinget fra data", files.organization.includes("academyName") && files.organization.includes("if (academyName)"));
check("canonical klubbdata lastes", files.organization.includes("football_clubs.json") && files.clubs.includes('"ground"') && files.clubs.includes('"homePlaceId"'));
check("canonical stab lastes", files.organization.includes("football_staff.json") && files.staff.includes('"staffType"'));
check("ingen ny localStorage-skriving", !files.organization.includes("localStorage.setItem") && !files.organization.includes("writeStorage"));
check("ingen ny klubb- eller progresjonsmotor", !files.organization.includes("Math.random") && !files.organization.includes("advanceClubWeek") && !files.organization.includes("createMatchdaySession"));
check("fasilitetskompatibilitet rendrer ingen nivå-UI", files.facilities.includes("renderManagerFacilitiesWorkspace") && files.facilities.includes('dataset.legacyRemoved = "true"'));
check("Pass 7 cleanup fjerner økonomi marked og fasilitets-DOM", files.cleanup.includes("managerEconomyWorkspace") && files.cleanup.includes("managerTransferMarketWorkspace") && files.cleanup.includes("managerFacilitiesWorkspace"));
check("økonomi- og overgangs-UI lastes ikke av managerskallet", !files.shell.includes("manager-economy-contracts-v1") && !files.shell.includes("manager-transfer-market-v2"));
check("gammel klubbdashboard-presentasjon er fortsatt tilgjengelig mens monolitten fases ned", files.oldClub.includes("createManagerClubSceneModel") && files.style.includes("#clubCommandPanel"));
check("rom åpnes i drawer", files.organization.includes('const DRAWER_ID = "managerClubRoomDrawer"') && files.style.includes(".manager-club-room-drawer"));
check("mobil drawer blir bottom sheet", files.style.includes("@media (max-width: 560px)") && files.style.includes("border-radius: 18px 18px 0 0"));
check("browser tester Kontor Kalender Klubben", files.browser.includes("ved siden av Kalender") && files.browser.includes('data-subnav-parent", "dashboard"'));
check("browser tester at legacy økonomi marked og fasiliteter er fysisk borte", files.browser.includes("ikke lenger som skjulte parallelle flater") && files.browser.includes("managerTransferMarketWorkspace"));
check("browser tester canonical stadiondata", files.browser.includes("stadionrommet bruker canonical klubbdata") && files.browser.includes("Lerkendal"));
check("browser tester ingen fasilitetsnivå", files.browser.includes("dikter ikke nivå eller oppgraderingsbonus"));
check("browser tester mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browser tester WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("dokumentasjonen låser rejected live IA", files.docs.includes("Rejected live IA") && files.docs.includes("overgangsvinduer") && files.docs.includes("fasilitetsnivå 1–3"));
check("dokumentasjonen peker cleanup til Pass 7", files.docs.includes("Pass 7"));
check("simuleringen er registrert", files.package.includes('"sim:manager-club-organization-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-club-organization-v1"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-club-organization-v1") && files.ci.includes("sim:manager-club-organization-v1"));

console.log(`\nManager Club Organization v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
