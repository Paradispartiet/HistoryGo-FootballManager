import fs from "node:fs";

const files = {
  shell: fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8"),
  calendar: fs.readFileSync(new URL("../src/ui/manager-calendar-workspace-v1.js", import.meta.url), "utf8"),
  matchCalendar: fs.readFileSync(new URL("../src/ui/manager-match-calendar-v1.js", import.meta.url), "utf8"),
  style: fs.readFileSync(new URL("../src/ui/manager-match-calendar-v1.css", import.meta.url), "utf8"),
  matchday: fs.readFileSync(new URL("../src/ui/manager-matchday-presentation.js", import.meta.url), "utf8"),
  drawer: fs.readFileSync(new URL("../src/ui/manager-team-choice-drawer-v1.js", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-match-calendar-v1.spec.js", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_MATCH_CALENDAR_V1.md", import.meta.url), "utf8"),
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

console.log("\nManager Match Calendar v1 audit");
check("managerskallet laster kalenderbundet kamparbeid", files.shell.includes('import "./manager-match-calendar-v1.js"'));
check("Kalender sender arbeidskontekst før navigasjon", files.calendar.includes('hgfm:calendar-open-work') && files.calendar.includes("emitCalendarWorkContext(day, entry)"));
check("Pass 4 lytter til samme kalenderkontrakt", files.matchCalendar.includes('window.addEventListener("hgfm:calendar-open-work"'));
check("fredag bruker eksisterende Lag-arbeidsflate", files.matchCalendar.includes('target === "tactics"') && files.matchCalendar.includes('data-tab-section="tactics"'));
check("lørdag bruker eksisterende Kamp-arbeidsflate", files.matchCalendar.includes('target === "kamp"') && files.matchCalendar.includes('data-tab-section="kamp"'));
check("fredag viser egen kampforberedelsesflate", files.matchCalendar.includes('const PREP_ID = "managerMatchPrepDay"') && files.matchCalendar.includes("Kampforberedelse"));
check("lørdag beholder eksisterende kampdagsscene", files.matchCalendar.includes('const MATCH_CONTEXT_ID = "managerMatchCalendarContext"') && files.matchday.includes("renderManagerMatchdayCommand"));
check("retur velger samme kalenderdag", files.matchCalendar.includes("manager-calendar-day-button") && files.matchCalendar.includes("context.dayIndex"));
check("direkte åpning bruker Club Week som fallback", files.matchCalendar.includes("currentManagerDayIndex") && files.matchCalendar.includes("directContext"));
check("kalenderkontekst er bare runtime-minne", files.matchCalendar.includes("let prepCalendarContext = null") && files.matchCalendar.includes("let matchCalendarContext = null") && !files.matchCalendar.includes("localStorage.setItem"));
check("ingen ny progresjonsmotor", !files.matchCalendar.includes("advanceClubWeek") && !files.matchCalendar.includes("nextAction") && !files.matchCalendar.includes("Math.random"));
check("ingen ny kampmotor", !files.matchCalendar.includes("football-matchday-engine") && !files.matchCalendar.includes("createMatchdaySession") && !files.matchCalendar.includes("finalizeMatchdaySession"));
check("oppstillingsvalg gjenbruker eksisterende drawer-knapper", files.matchCalendar.includes("teamChangePlayerRole") && files.matchCalendar.includes("teamChangeFormation") && files.drawer.includes("openManagerTeamChoiceDrawer"));
check("fredag leser eksisterende kampklarhet", files.matchCalendar.includes("#matchdayReadiness") && files.matchCalendar.includes("#squadGateStarters") && files.matchCalendar.includes("#squadGateBench"));
check("fredag leser eksisterende trening", files.matchCalendar.includes("teamSelectedTrainingProgram") && files.matchCalendar.includes("teamSelectedTrainingFocus"));
check("fredag leser eksisterende motstanderbrief", files.matchCalendar.includes("Motstanderens trussel") && files.matchCalendar.includes("matchday-scene-status-card"));
check("fredag skjuler bare gammel kommandopresentasjon", files.style.includes("#squadTacticsCommandPanel") && !files.style.includes("#lineupSlots") && !files.style.includes("#teamTacticsSelectedState"));
check("mobilregler finnes", files.style.includes("@media (max-width: 560px)") && files.style.includes("grid-template-columns: 1fr"));
check("browser tester fredag fra Kalender", files.browser.includes("fredagens kalenderhendelse eier kampforberedelsen") && files.browser.includes('data-event-id="match-prep"'));
check("browser tester lørdag fra Kalender", files.browser.includes("lørdagens kalenderhendelse eier Kamp") && files.browser.includes('data-event-id="matchday"'));
check("browser tester retur til samme dag", files.browser.includes("aria-selected") && files.browser.includes('data-day="5"') && files.browser.includes('data-day="6"'));
check("browser tester valgdrawer", files.browser.includes("#managerTeamChoiceDrawer") && files.browser.includes("#matchPrepChangeSystem"));
check("browser tester mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browser tester WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("dokumentasjonen låser Kalender som tidseier", files.docs.includes("Kalenderen eier fredag og lørdag") && files.docs.includes("Ingen ny `Neste`-funksjon"));
check("dokumentasjonen låser motorgrensene", files.docs.includes("football-matchday-engine.js") && files.docs.includes("football-matchday-readiness.js") && files.docs.includes("Ingen ny kampmotor"));
check("simuleringen er registrert", files.package.includes('"sim:manager-match-calendar-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-match-calendar-v1"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-match-calendar-v1") && files.ci.includes("sim:manager-match-calendar-v1"));

console.log(`\nManager Match Calendar v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
