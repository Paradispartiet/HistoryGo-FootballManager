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
  ["kalenderen inneholder ingen progresjonshandling", !/advanceClubWeek|nextAction|data-tab-target/.test(calendar)],
  ["UI-et har ingen fortsett- eller neste-knapp", !/Neste fase|Fortsett uka|advanceClubWeek/.test(ui)],
  ["Kalender ligger under Kontor", ui.includes('section.dataset.tabParent = "dashboard"') && ui.includes('button.dataset.subnavParent = "dashboard"')],
  ["Kalender er ikke hovedfane", !ui.includes("main-nav-inner") && !ui.includes("nav-tab-calendar")],
  ["Kalender lastes fra managerskallet", shellView.includes('manager-calendar-workspace-v1.js')],
  ["Kalender bruker eksisterende ligasesong for motstander", ui.includes("LEAGUE_SEASON_VERSION") && ui.includes("getNextLeagueOpponent")],
  ["Kalender leser eksisterende team merits", ui.includes('const TEAM_MERITS_KEY = "hgfm.teamMerits.v1"')],
  ["Kalender skriver ingen ny lagring", !ui.includes("localStorage.setItem") && !calendar.includes("localStorage")],
  ["Kalender lager ingen ny motor eller rating", !calendar.includes("Math.random") && !calendar.includes("overall")],
  ["mobilkalenderen er eksplisitt", css.includes("@media (max-width: 680px)") && css.includes("grid-template-columns: 1fr")],
  ["browser tester syv dager", browser.includes("toHaveCount(7)")],
  ["browser tester at Kalender ligger under Kontor", browser.includes("Kontor · Kalender") && browser.includes('data-subnav-parent="dashboard"')],
  ["browser tester at kalenderen ikke har progresjonsknapp", browser.includes("ingen egen progresjonsknapp")],
  ["browser tester mobil overflow", browser.includes("scrollWidth") && browser.includes("390")],
  ["browser tester WCAG", browser.includes("AxeBuilder") && browser.includes("wcag2aa")],
  ["dokumentasjonen låser én veiviser", docs.includes("Forslag til neste steg") && docs.includes("eneste progresjonsveiviser")],
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
