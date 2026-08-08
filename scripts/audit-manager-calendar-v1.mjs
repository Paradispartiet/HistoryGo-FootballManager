import fs from "node:fs";

const calendar = fs.readFileSync(new URL("../src/football-manager-calendar.js", import.meta.url), "utf8");
const ui = fs.readFileSync(new URL("../src/ui/manager-calendar-workspace-v1.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/ui/manager-calendar-workspace-v1.css", import.meta.url), "utf8");
const shellView = fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../tests/browser/manager-calendar-v1.spec.js", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/MANAGER_CALENDAR_V1.md", import.meta.url), "utf8");
const packageJson = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");
const ci = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

const checks = [
  ["kalenderen er en projeksjon av Club Week", calendar.includes("MANAGER_WEEK_PHASE_ORDER") && calendar.includes("clubWeekState")],
  ["kalenderen har mandag til søndag", ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"].every((day) => calendar.includes(day))],
  ["kampdag ligger på lørdag", calendar.includes('dayIndex: 6') && calendar.includes('phase: "matchday"')],
  ["etterkamp ligger på søndag", calendar.includes('dayIndex: 7') && calendar.includes('phase: "review"')],
  ["arbeidsdagen har kronologiske hendelser", calendar.includes('event("training-meeting", "09:30"') && calendar.includes('event("team-training", "11:00"')],
  ["innboks er en kalenderhendelse", calendar.includes('kind: "message"') && calendar.includes('actionLabel: "Åpne melding"')],
  ["manglende trening vises i hendelsen", calendar.includes("Treningsprogram mangler") && calendar.includes('actionLabel: trainingSelected ? "Åpne trening" : "Velg program"')],
  ["kalenderen inneholder ingen progresjonsfunksjon", !/advanceClubWeek|advanceWeek|nextPhase/.test(calendar)],
  ["UI-et har ingen fortsett- eller neste-fasefunksjon", !/Neste fase|Fortsett uka|advanceClubWeek/.test(ui)],
  ["Kalender ligger under Kontor", ui.includes('section.dataset.tabParent = "dashboard"') && ui.includes('button.dataset.subnavParent = "dashboard"')],
  ["Kontor åpner Kalender i normal ligasave", ui.includes("redirectOfficeToCalendar") && ui.includes('target !== "dashboard" && target !== "inbox"')],
  ["separat Innboks skjules fra Kontor", ui.includes('inbox.classList.add("office-subnav-proxy")')],
  ["Klubbdrift presenteres som Klubben", ui.includes('board.textContent = "Klubben"')],
  ["meldinger åpnes i drawer over kalenderen", ui.includes("openInboxDrawer") && ui.includes("managerCalendarMessageDrawer") && ui.includes("closeInboxDrawer")],
  ["Next-footeren er borte i normal save", css.includes('html[data-manager-office-calendar-v1="active"] manager-next-action')],
  ["Kalender lastes fra managerskallet", shellView.includes('manager-calendar-workspace-v1.js')],
  ["Kalender bruker eksisterende ligasesong for motstander", ui.includes("LEAGUE_SEASON_VERSION") && ui.includes("getNextLeagueOpponent")],
  ["Kalender leser eksisterende team merits", ui.includes('const TEAM_MERITS_KEY = "hgfm.teamMerits.v1"')],
  ["Kalender skriver ingen ny lagring", !ui.includes("localStorage.setItem") && !calendar.includes("localStorage")],
  ["Kalender lager ingen ny motor eller rating", !calendar.includes("Math.random") && !calendar.includes("overall")],
  ["mobilkalenderen er eksplisitt", css.includes("@media (max-width: 760px)") && css.includes("grid-template-columns: repeat(7")],
  ["browser tester syv dager", browser.includes("toHaveCount(7)")],
  ["browser tester Kalender som Kontor-standard", browser.includes("Kontor åpner Kalender direkte")],
  ["browser tester meldingsdrawer", browser.includes("melding åpnes i drawer")],
  ["browser tester at Next-footeren er skjult", browser.includes("Next-footeren er skjult")],
  ["browser tester mobil overflow", browser.includes("scrollWidth") && browser.includes("390")],
  ["browser tester WCAG", browser.includes("AxeBuilder") && browser.includes("wcag2aa")],
  ["dokumentasjonen låser kalenderen som tidsflate", docs.includes("Kalenderen er Kontorets standardflate") && docs.includes("ingen ny tidsmotor")],
  ["dokumentasjonen låser Innboks inn i kalenderen", docs.includes("Innboks er ikke lenger en parallell Kontor-fane")],
  ["simuleringen er registrert", packageJson.includes('"sim:manager-calendar-v1"')],
  ["auditen er registrert", packageJson.includes('"audit:manager-calendar-v1"')],
  ["CI kjører kalenderportene", ci.includes("audit:manager-calendar-v1") && ci.includes("sim:manager-calendar-v1")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Kalender og manageruke v1 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Kalender og manageruke v1 audit: ${checks.length}/${checks.length}`);
