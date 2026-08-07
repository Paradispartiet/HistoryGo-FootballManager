#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("index.html");
const app = read("src/app.js");
const css = read("style.css");
const office = read("src/ui/manager-office-presentation.js");
const shell = read("src/ui/manager-shell-elements.js");
const browser = read("tests/browser/manager-office-inbox-v1.spec.js");
const packageJson = read("package.json");
const workflow = read(".github/workflows/ci.yml");
const docs = read("docs/MANAGER_OFFICE_INBOX_V1.md");

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });

check("kontoret har egen presentasjonsmodul", existsSync(join(root, "src/ui/manager-office-presentation.js")) && /createOfficeSceneModel/.test(office) && /renderOfficeCommand/.test(office));
check("appen binder kontormodellen til eksisterende state", /manager-office-presentation\.js/.test(app) && /renderOfficeScene\(teamFit\)/.test(app) && /computeManagerNextActions\(teamFit\)/.test(app));
check("Kontor åpner på Innboks i ligaspill", /redirectLeagueDashboardToInbox/.test(shell) && /Kontor åpner på Innboks/.test(browser));
check("gammel kontoroversikt flyttes til Oppstartshjelp", ["officeCommandPanel", "officeDepth", "leagueOnboardingPanel"].every((id) => shell.includes(`"${id}"`)) && /Oppstartshjelp/.test(browser));
check("klubbukas detaljer er fortsatt foldet", /<details class="office-depth"/.test(html) && /Vis klubbukas detaljer og signaler/.test(html));
check("kontoret lager ingen ny primærhandling", !/next-action-primary/.test(office) && /autoritative «Neste handling»/.test(office));
check("hjelpeflaten beholder fire operative statuser", /office-status-grid/.test(office) && /"lineup"/.test(office) && /"training"/.test(office) && /"inbox"/.test(office) && /"readiness"/.test(office));
check("statuskortene peker til eksisterende flater", /dataset\.officeTarget/.test(office) && /onOpenArea\("kamp"\)/.test(office) && /onOpenArea\("statistikk"\)/.test(office));
check("Innboks har aktiv fokussak", /id="inboxFocusTitle"/.test(html) && /id="inboxThreadList"/.test(html) && /inbox-focus-panel/.test(css));
check("Innboks har inline beslutningsstøtte", /inbox-inline-stats/.test(html) && /id="inboxSignalUnread"/.test(html) && /id="inboxSignalReplies"/.test(html));
check("Innboks har kø", /id="inboxQueueList"/.test(html) && /queueCandidates/.test(app) && /selectedCandidate/.test(app));
check("historikk er adskilt fra aktiv sak", /modalInboxArchive/.test(html) && /inboxThreadArchive/.test(app) && !/modalInboxWhy/.test(html));
check("køvalg flyttes til fokus", /state\.openInboxThreadId/.test(app) && /focusCandidate = selectedCandidate/.test(app));
check("mobiloppsettet er eksplisitt", /max-width: 640px/.test(css) && /inbox-command-layout/.test(css) && /office-status-grid/.test(css));
check("ren simulering finnes", existsSync(join(root, "scripts/simulate-manager-office-inbox-v1.mjs")) && /18\/18/.test(execFileSync(process.execPath, [join(root, "scripts/simulate-manager-office-inbox-v1.mjs")], { encoding: "utf8" })));
check("simulering og audit er i package", /sim:manager-office-inbox-v1/.test(packageJson) && /audit:manager-office-inbox-v1/.test(packageJson));
check("simulering og audit kjører i CI", /npm run sim:manager-office-inbox-v1/.test(workflow) && /npm run audit:manager-office-inbox-v1/.test(workflow));
check("nettleservakten dekker Innboks, hjelp, navigasjon og mobil", /inboxThreadList/.test(browser) && /officeHelp/.test(browser) && /inboxGoTraining/.test(browser) && /width: 390/.test(browser) && /scrollWidth - document\.documentElement\.clientWidth/.test(browser));
check("tilgjengelighet testes på Innboks", /AxeBuilder/.test(browser) && /wcag2aa/.test(browser));
check("dokumentasjonen låser motorgrensene", /(uten å bygge nye motorer|Ingen ny motor)/i.test(docs) && /football-next-action\.js/.test(docs) && /football-inbox-events\.js/.test(docs));

const failed = checks.filter((entry) => !entry.ok);
console.log("Managerkontor og Innboks v1-audit\n");
for (const entry of checks) console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` (${entry.detail})` : ""}`);
console.log(`\n${checks.length - failed.length}/${checks.length} sjekker bestått.`);
if (failed.length) process.exit(1);
