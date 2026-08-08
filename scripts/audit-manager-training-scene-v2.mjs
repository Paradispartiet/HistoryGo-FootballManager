import fs from "node:fs";

const files = {
  html: fs.readFileSync(new URL("../index.html", import.meta.url), "utf8"),
  app: fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8"),
  presentation: fs.readFileSync(new URL("../src/ui/manager-training-presentation.js", import.meta.url), "utf8"),
  trainingStyle: fs.readFileSync(new URL("../src/ui/manager-training-scene-v2.css", import.meta.url), "utf8"),
  day: fs.readFileSync(new URL("../src/ui/manager-training-day-v1.js", import.meta.url), "utf8"),
  dayStyle: fs.readFileSync(new URL("../src/ui/manager-training-day-v1.css", import.meta.url), "utf8"),
  calendar: fs.readFileSync(new URL("../src/ui/manager-calendar-workspace-v1.js", import.meta.url), "utf8"),
  shell: fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8"),
  teamDrawer: fs.readFileSync(new URL("../src/ui/manager-team-choice-drawer-v1.js", import.meta.url), "utf8"),
  package: fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ci: fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_TRAINING_DAY_V1.md", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-training-scene-v2.spec.js", import.meta.url), "utf8"),
  shellBrowser: fs.readFileSync(new URL("../tests/browser/manager-shell-v3.spec.js", import.meta.url), "utf8")
};

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Training Day v1 audit");
check("eksisterende treningskommando beholdes som underliggende datakilde", files.html.includes('id="trainingCommandPanel"') && files.app.includes("renderManagerTrainingCommand"));
check("eksisterende arbeidssteg er bevart", ["trainingProgramStep", "trainingFocusStep", "individualTrainingStep"].every((id) => files.html.includes(`id="${id}"`)));
check("kalenderkoblet treningsdag lastes fra managerskallet", files.shell.includes('import "./manager-training-day-v1.js"'));
check("treningsdagen har egen samlet hovedflate", files.day.includes('const SURFACE_ID = "managerTrainingDay"') && files.day.includes("Treningsdag"));
check("gammel kommandovegg og stegflate demoteres kun visuelt", files.dayStyle.includes("#trainingCommandPanel") && files.dayStyle.includes("#trainingDepth") && files.dayStyle.includes("display: none !important"));

check("Kalender sender arbeidskontekst før navigasjon", files.calendar.includes("emitCalendarWorkContext(day, entry)") && files.calendar.includes('new CustomEvent("hgfm:calendar-open-work"') && files.calendar.includes("activateTarget(entry.target)"));
check("Treningsdagen mottar kalenderkonteksten eksplisitt", files.day.includes('window.addEventListener("hgfm:calendar-open-work", acceptCalendarContext)') && files.day.includes("detail.target !== \"trening\""));
check("kalenderkontekst lagres bare i runtime-minne", files.day.includes("let calendarContext = null") && !files.day.includes("localStorage.setItem"));
check("retur åpner Kontor og samme kalenderdag", files.day.includes('data-tab-target="dashboard"') && files.day.includes("manager-calendar-day-button") && files.day.includes("context.dayIndex"));
check("direkte Lag-åpning bruker eksisterende Club Week som fallback", files.day.includes("clubWeekState()") && files.day.includes("currentManagerDayIndex"));
check("lokasjonen viser kalenderdagen inne i Lag", files.day.includes("Lag · Trening · ${context.day}"));

check("valgt program leses fra eksisterende trenings-DOM", files.day.includes("training-program-card.is-selected") && files.day.includes("teamSelectedTrainingProgram"));
check("fire økter vises uten ny treningslogikk", files.day.includes(".slice(0, 4)") && files.day.includes("while (rows.length < 4)"));
check("ukens fokus leses fra eksisterende valgstate", files.day.includes("teamSelectedTrainingFocus") && files.day.includes("weeklyTrainingStatus"));
check("individuell oppfølging leses fra eksisterende trening", files.day.includes("individualTrainingAssignments") && files.day.includes("teamSelectedIndividualTraining"));
check("assistent og troppstilstand gjenbrukes", files.day.includes("training-assistant-signal") && files.day.includes('data-training-target="details"'));
check("neste motstander gjenbrukes fra eksisterende treningspresentasjon", files.day.includes("training-opponent-brief"));

check("programalternativer åpnes i felles Lag-drawer", files.day.includes("teamChangeTrainingProgram") && files.teamDrawer.includes('source: program'));
check("fokusalternativer åpnes i felles Lag-drawer", files.day.includes("teamChangeTrainingFocus") && files.teamDrawer.includes('source: focus'));
check("individuelle alternativer åpnes i felles Lag-drawer", files.day.includes("teamChangeIndividualTraining") && files.teamDrawer.includes('source: individual'));
check("ingen ny treningsmotor eller tilfeldig logikk", !files.day.includes("Math.random") && !files.day.includes("fetch(") && !files.day.includes("localStorage.setItem"));

check("eksisterende treningsmotorer er fortsatt sannhetskilder", files.app.includes("getSelectedTrainingProgramComposition()") && files.app.includes("getTrainingFocus(state.weeklyTrainingFocus?.focusId") && files.app.includes("summarizeSquadCondition(getPlayerCondition())"));
check("mobilregler finnes for treningsdagen", files.dayStyle.includes("@media (max-width: 560px)") && files.dayStyle.includes("grid-template-columns: 1fr"));
check("browser tester kalender til Trening og tilbake", files.browser.includes("kalenderhendelsen eier dagkonteksten") && files.browser.includes("data-day\", \"4"));
check("browser tester komplette valg i drawer", files.browser.includes("komplette eksisterende valg") && files.browser.includes("#managerTeamChoiceDrawerBody #trainingPrograms"));
check("shell-vakten forventer treningsdag i stedet for pedagogiske steg", files.shellBrowser.includes("kalenderkoblet treningsdag med valg i drawer") && files.shellBrowser.includes("#managerTrainingDay"));
check("nettleservakten kontrollerer overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("nettleservakten kontrollerer WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("simuleringen er registrert", files.package.includes('"sim:manager-training-scene-v2"'));
check("auditen er registrert", files.package.includes('"audit:manager-training-scene-v2"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-training-scene-v2") && files.ci.includes("sim:manager-training-scene-v2"));
check("dokumentasjonen låser Kalender som tidseier", files.docs.includes("Kalenderen er fasit for uke og dag") && files.docs.includes("ikke som en egen progresjonsverden"));
check("dokumentasjonen låser motorgrensene", files.docs.includes("Ingen ny treningsmotor") && files.docs.includes("Ingen ny localStorage-nøkkel") && files.docs.includes("football-training-plan.js"));

console.log(`\nManager Training Day v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
