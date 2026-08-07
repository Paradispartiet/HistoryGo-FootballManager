#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("index.html");
const app = read("src/app.js");
const css = `${read("style.css")}\n${read("src/ui/manager-shell-v3.css")}\n${read("src/ui/manager-shell-foundation.css")}`;
const browser = read("tests/browser/manager-shell-v3.spec.js");
const seasonBrowser = read("tests/browser/manager-season-scene-v1.spec.js");
const clubBrowser = read("tests/browser/manager-club-scene-v1.spec.js");
const shellElements = read("src/ui/manager-shell-elements.js");
const workflow = read(".github/workflows/ci.yml");
const packageJson = read("package.json");
const seasonPresentation = read("src/ui/manager-season-presentation.js");
const visualSceneSpecs = [
  "tests/browser/manager-training-scene-v2.spec.js",
  "tests/browser/manager-matchday-scene-v1.spec.js",
  "tests/browser/manager-squad-tactics-scene-v2.spec.js",
  "tests/browser/manager-post-match-analysis-v1.spec.js"
];
const visualSceneCoverage = visualSceneSpecs.every((path) => existsSync(join(root, path)) && /toHaveScreenshot\(/.test(read(path)));

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });
const panelCount = [...html.matchAll(/class="([^"]*)"/g)]
  .filter((match) => match[1].split(/\s+/).includes("panel")).length;

check("nøyaktig én autoritativ neste handling", (shellElements.match(/class="next-action-primary"/g) || []).length === 1);
check("konkurrerende neste-knapper er fjernet", !/advanceClubWeekPhase|leagueOnboardingPrimary|portalPriorityAction/.test(html));
check("Neste handling viser eksplisitt målflate", /nextActionDestination/.test(shellElements) && /Forslag til neste steg/.test(shellElements));
check("fire stabile hovedområder er browser-låst", /har fire stabile hovedområder/.test(browser) && /\["Kontor", "Lag", "Kamp", "Stats"\]/.test(browser));
check("Klubb er fjernet som eget hovedområde", /clubMainTab\.hidden = true/.test(shellElements) && /data-tab-target=\\?"board\\?"/.test(clubBrowser));
check("Kontor åpner på Innboks i ligaspill", /redirectLeagueDashboardToInbox/.test(shellElements) && /Kontor åpner på Innboks/.test(browser));
check("Oversikt er fjernet som synlig ligaunderfane", /overview\.classList\.add\("office-subnav-proxy"\)/.test(shellElements) && /data-tab-target=\\?"dashboard\\?"/.test(browser));
check("oppstartshjelp eier tidligere oversiktsstøtte", ["leagueOnboardingPanel", "officeCommandPanel", "officeDepth"].every((id) => shellElements.includes(`"${id}"`)) && /Oppstartshjelp/.test(browser));
check("Innboks er tydelig navngitt", /inboxHeading\.textContent = "Innboks"/.test(shellElements) && /data-tab-target=\\?"inbox\\?"/.test(browser));
check("fast Du er her-linje finnes", /managerLocationBar/.test(shellElements) && /managerLocationText/.test(browser));
check("direkte uttak har spillerkort og rolleknapper", /id="lineupPlayerChoices"/.test(html) && /id="lineupRoleChoices"/.test(html));
check("gamle spiller-/rolle-selecter er fjernet", !/slotPlayerSelect|slotRoleSelect/.test(html));
check("numerisk lagfit-sirkel er fjernet", !/id="teamScore"|score-ring-label">Lagfit/.test(html));
check("panelrammene er kraftig redusert", panelCount <= 30, `panel tokens=${panelCount}`);
check("treningen er et accordion med tre steg", (html.match(/data-training-step-toggle/g) || []).length === 3 && /syncTrainingWorkspace/.test(app));
check("klubbidentiteten har skjold og stadionlinje", /id="headerClubMark"/.test(shellElements) && /id="headerClubGround"/.test(shellElements));
check("klubbidentiteten bruker egen presentasjonsmodul", /manager-club-identity\.js/.test(app) && existsSync(join(root, "src/ui/manager-club-identity.js")));
check("HTML-skallet er modulert i egne custom elements", /<manager-club-header>/.test(html) && /<manager-next-action>/.test(html) && existsSync(join(root, "src/ui/manager-shell-elements.js")));
check("CSS-skallet har egen foundation", /manager-shell-foundation\.css/.test(read("src/ui/manager-shell-v3.css")) && existsSync(join(root, "src/ui/manager-shell-foundation.css")));
check("responsive nettleservakter dekker 390/768/1280", [390, 768, 1280].every((width) => browser.includes(`width: ${width}`)));
check("visuell regresjon ligger i dedikerte scenevakter", visualSceneCoverage);
check("shell-testen låser ikke hovedmenyen med helskjermbilder", !/toHaveScreenshot\(/.test(browser));
check("CI kjører nettleservaktene uten å omskrive baseliner", /run: npm run test:browser\s*$/.test(workflow) && !/update-snapshots/.test(workflow));
check("tilgjengelighet testes med axe", /AxeBuilder/.test(browser) && /wcag2aa/.test(browser));
check("tastatur og fokusfelle testes", /Shift\+Tab/.test(browser) && /toBeFocused/.test(browser));
check("horisontal overflow testes", /scrollWidth - document\.documentElement\.clientWidth/.test(browser));
check("primærhandling uten scroll testes", /expectPrimaryActionInViewport/.test(browser));
check("modalene har fokusfelle i appen", /event\.key !== "Tab"/.test(app) && /lastModalOpener\.focus/.test(app));
check("foreldet portal-/fase-CSS er fjernet", !/portal-priority-card|#advanceClubWeekPhase/.test(css));
check(
  "Stats bruker eksisterende sesongpresentasjon",
  /manager-season-presentation\.js/.test(app)
    && /createSeasonSceneModel/.test(seasonPresentation)
    && /renderSeasonCommand/.test(seasonPresentation)
    && /renderSeasonLeagueOverview/.test(seasonPresentation)
    && /syncStatsPresentation/.test(shellElements)
);
check(
  "Stats samler kommando, tabell og spillerstatistikk",
  html.indexOf('id="seasonCommand"') > -1
    && html.indexOf('id="statsSummary"') > -1
    && html.indexOf('id="playerStatsTable"') > -1
    && /Stats samler tabell, terminliste og spillerstatistikk/.test(browser)
);
check("full tabell og terminliste åpnes i Stats", /depth\.open = true/.test(shellElements) && /season-full-table/.test(seasonBrowser));
check(
  "Stats har permanent simulering i CI",
  /sim:manager-season-scene-v1/.test(packageJson)
    && /npm run sim:manager-season-scene-v1/.test(workflow)
    && existsSync(join(root, "scripts/simulate-manager-season-scene-v1.mjs"))
);
check(
  "Stats har nettleservakt for handling og mobil",
  /Stats gir direkte vei til kamp/.test(seasonBrowser)
    && /data-tab-section=\\?"kamp\\?"/.test(seasonBrowser)
    && /width: 390/.test(seasonBrowser)
    && /scrollWidth - document\.documentElement\.clientWidth/.test(seasonBrowser)
);

const failed = checks.filter((entry) => !entry.ok);
console.log("Manager Shell v3 completion-audit\n");
for (const entry of checks) console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` (${entry.detail})` : ""}`);
console.log(`\n${checks.length - failed.length}/${checks.length} sjekker bestått.`);
if (failed.length) process.exit(1);
