#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("index.html");
const app = read("src/app.js");
const css = `${read("style.css")}\n${read("src/ui/manager-shell-v3.css")}\n${read("src/ui/manager-shell-foundation.css")}\n${read("src/ui/manager-calendar-workspace-v1.css")}`;
const browser = read("tests/browser/manager-shell-v3.spec.js");
const calendarBrowser = read("tests/browser/manager-calendar-v1.spec.js");
const seasonBrowser = read("tests/browser/manager-season-scene-v1.spec.js");
const matchdayBrowser = read("tests/browser/manager-matchday-scene-v1.spec.js");
const postMatchBrowser = read("tests/browser/manager-post-match-analysis-v1.spec.js");
const shellElements = read("src/ui/manager-shell-elements.js");
const shellView = read("src/ui/manager-shell-view.js");
const scouting = read("src/ui/manager-scouting-workspace-v1.js");
const calendar = read("src/ui/manager-calendar-workspace-v1.js");
const workflow = read(".github/workflows/ci.yml");
const packageJson = read("package.json");
const seasonPresentation = read("src/ui/manager-season-presentation.js");

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });
const panelCount = [...html.matchAll(/class="([^"]*)"/g)].filter((match) => match[1].split(/\s+/).includes("panel")).length;

// Shellens stabile hovedstruktur.
check("fem stabile hovedområder er browser-låst", /har fem stabile hovedområder/.test(browser) && /\["Kontor", "Lag", "Speiding", "Kamp", "Stats"\]/.test(browser));
check("konkurrerende gamle progresjonsknapper er fjernet", !/advanceClubWeekPhase|leagueOnboardingPrimary|portalPriorityAction/.test(html));
check("legacy Next-kontrollen finnes bare én gang i skallet", (shellElements.match(/class="next-action-primary"/g) || []).length === 1);
check("footeren viser neste kalenderhendelse i normal ligasave", /manager-office-calendar-v1="active"/.test(css) && /renderCalendarFooter/.test(calendar) && /kalenderfooteren viser dagens neste hendelse/.test(calendarBrowser));

// Kontor + Kalender er den nye autoritative IA-en for tid.
check("Kalender lastes fra managerskallet", /manager-calendar-workspace-v1\.js/.test(shellView) && /Kontor · Kalender/.test(calendar));
check("Kalender ligger under Kontor", /section\.dataset\.tabParent = "dashboard"/.test(calendar) && /button\.dataset\.subnavParent = "dashboard"/.test(calendar));
check("ligasaven starter direkte i Kalender", /openLeagueCalendarAtStartup/.test(calendar) && /starter direkte i managerkalenderen/.test(calendarBrowser));
check("Innboks er skjult som parallell Kontor-fane", /inbox\.classList\.add\("office-subnav-proxy"\)/.test(calendar) && /separat Innboks/.test(calendarBrowser));
check("Klubbdrift presenteres som Klubben", /board\.textContent = "Klubben"/.test(calendar) && /Klubben/.test(calendarBrowser));
check("Oppstartshjelp skjules etter oppstart", /officeHelp\.classList\.toggle\("office-subnav-proxy", normalSave\)/.test(calendar) && /officeHelp/.test(calendarBrowser));
check("Kalenderen lager ingen egen progresjonsmotor", !/advanceClubWeekPhase|advanceWeek|nextPhase|Fortsett uka|Neste fase/.test(calendar));
check("manglende arbeid vises lokalt i kalenderen", /Treningsprogram mangler/.test(calendarBrowser) && /Velg program/.test(calendarBrowser));
check("meldinger åpnes som kalenderdrawer", /openInboxDrawer/.test(calendar) && /managerCalendarMessageDrawer/.test(calendar) && /melding åpnes i drawer/.test(calendarBrowser));
check("fast Du er her-linje finnes", /managerLocationBar/.test(shellElements) && /managerLocationText/.test(calendarBrowser));

// Speiding og resten av femområdeskallet skal fortsatt bestå.
check("Speiding repurposer tidligere Klubb-hovedfane", /scoutingTab\.dataset\.tabTarget = "historygo"/.test(scouting) && /lagTab\.after\(scoutingTab\)/.test(scouting));
check("Speiding har egne underflater", /Min spillerpool/.test(scouting) && /Andre klubber/.test(scouting) && /scoutingClubs/.test(scouting));
check("Speiding lastes fra managerskallet", /manager-scouting-workspace-v1\.js/.test(shellView));
check("gammel Klubb-hovedfane skjules", /clubMainTab\.hidden = true/.test(shellElements));
check("Oversikt er ikke synlig ligaunderfane", /overview\.classList\.add\("office-subnav-proxy"\)/.test(shellElements));

// Lag, klubbidentitet og modaladferd skal ikke regresere i Pass 1.
check("direkte uttak har spillerkort og rolleknapper", /id="lineupPlayerChoices"/.test(html) && /id="lineupRoleChoices"/.test(html));
check("gamle spiller-/rolle-selecter er fjernet", !/slotPlayerSelect|slotRoleSelect/.test(html));
check("numerisk lagfit-sirkel er fjernet", !/id="teamScore"|score-ring-label">Lagfit/.test(html));
check("panelrammene er fortsatt kraftig redusert", panelCount <= 30, `panel tokens=${panelCount}`);
check("treningen er et accordion med tre steg", (html.match(/data-training-step-toggle/g) || []).length === 3 && /syncTrainingWorkspace/.test(app));
check("klubbidentiteten har skjold og stadionlinje", /id="headerClubMark"/.test(shellElements) && /id="headerClubGround"/.test(shellElements));
check("klubbidentiteten bruker egen presentasjonsmodul", /manager-club-identity\.js/.test(app) && existsSync(join(root, "src/ui/manager-club-identity.js")));
check("HTML-skallet er modulert i custom elements", /<manager-club-header>/.test(html) && /<manager-next-action>/.test(html) && existsSync(join(root, "src/ui/manager-shell-elements.js")));
check("CSS-skallet har egen foundation", /manager-shell-foundation\.css/.test(read("src/ui/manager-shell-v3.css")) && existsSync(join(root, "src/ui/manager-shell-foundation.css")));

// Responsive, tilgjengelighet og sesongflater.
check("responsive nettleservakter dekker 390/768/1280", [390, 768, 1280].every((width) => browser.includes(`width: ${width}`)));
check("visuell regresjon finnes på isolert kampkomponent", /toHaveScreenshot\(/.test(postMatchBrowser) && /matchday-post-match-score/.test(postMatchBrowser));
check("shell og kampdag låser ikke IA med helskjermbilder", !/toHaveScreenshot\(/.test(browser) && !/toHaveScreenshot\(/.test(matchdayBrowser));
check("CI kjører nettleservaktene uten å omskrive baseliner", /run: npm run test:browser\s*$/.test(workflow) && !/update-snapshots/.test(workflow));
check("tilgjengelighet testes med axe", /AxeBuilder/.test(browser) && /wcag2aa/.test(browser));
check("tastatur og fokusfelle testes", /Shift\+Tab/.test(browser) && /toBeFocused/.test(browser));
check("horisontal overflow testes", /scrollWidth - document\.documentElement\.clientWidth/.test(browser));
check("modalene har fokusfelle i appen", /event\.key !== "Tab"/.test(app) && /lastModalOpener\.focus/.test(app));
check("foreldet portal-/fase-CSS er fjernet", !/portal-priority-card|#advanceClubWeekPhase/.test(css));
check("Stats bruker eksisterende sesongpresentasjon", /manager-season-presentation\.js/.test(app) && /createSeasonSceneModel/.test(seasonPresentation) && /renderSeasonCommand/.test(seasonPresentation) && /renderSeasonLeagueOverview/.test(seasonPresentation) && /syncStatsPresentation/.test(shellElements));
check("Stats samler kommando, tabell og spillerstatistikk", html.includes('id="seasonCommand"') && html.includes('id="statsSummary"') && html.includes('id="playerStatsTable"') && /Stats samler tabell, terminliste og spillerstatistikk/.test(browser));
check("full tabell og terminliste åpnes i Stats", /depth\.open = true/.test(shellElements) && /season-full-table/.test(seasonBrowser));
check("Stats har permanent simulering i CI", /sim:manager-season-scene-v1/.test(packageJson) && /npm run sim:manager-season-scene-v1/.test(workflow) && existsSync(join(root, "scripts/simulate-manager-season-scene-v1.mjs")));
check("Stats har nettleservakt for handling og mobil", /Stats gir direkte vei til kamp/.test(seasonBrowser) && /data-tab-section=\\?"kamp\\?"/.test(seasonBrowser) && /width: 390/.test(seasonBrowser) && /scrollWidth - document\.documentElement\.clientWidth/.test(seasonBrowser));

const failed = checks.filter((entry) => !entry.ok);
console.log("Manager Shell v3 completion-audit\n");
for (const entry of checks) console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` (${entry.detail})` : ""}`);
console.log(`\n${checks.length - failed.length}/${checks.length} sjekker bestått.`);
if (failed.length) process.exit(1);
