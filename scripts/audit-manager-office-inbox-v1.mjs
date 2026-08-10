#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("index.html");
const app = read("src/app.js");
const css = `${read("style.css")}\n${read("src/ui/manager-calendar-workspace-v1.css")}`;
const office = read("src/ui/manager-office-presentation.js");
const shell = read("src/ui/manager-shell-elements.js");
const calendar = read("src/ui/manager-calendar-workspace-v1.js");
const calendarModel = read("src/football-manager-calendar.js");
const browser = read("tests/browser/manager-office-inbox-v1.spec.js");
const packageJson = read("package.json");
const workflow = read(".github/workflows/ci.yml");
const docs = read("docs/MANAGER_OFFICE_INBOX_V1.md");

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });

// Eksisterende innboksmotor og dataflyt skal beholdes.
check("kontoret har fortsatt kompatibilitetspresentasjon", existsSync(join(root, "src/ui/manager-office-presentation.js")) && /createOfficeSceneModel/.test(office) && /renderOfficeCommand/.test(office));
check("appen binder eksisterende kontor- og inbox-state", /manager-office-presentation\.js/.test(app) && /renderOfficeScene\(teamFit\)/.test(app) && /football-inbox-events\.js/.test(app));
check("Innboks har aktiv fokussak i intern DOM", /id="inboxFocusTitle"/.test(html) && /id="inboxThreadList"/.test(html) && /inbox-focus-panel/.test(read("style.css")));
check("Innboks har inline beslutningsstøtte", /inbox-inline-stats/.test(html) && /id="inboxSignalUnread"/.test(html) && /id="inboxSignalReplies"/.test(html));
check("Innboks har kø", /id="inboxQueueList"/.test(html) && /queueCandidates/.test(app) && /selectedCandidate/.test(app));
check("historikk er adskilt fra aktiv sak", /modalInboxArchive/.test(html) && /inboxThreadArchive/.test(app) && !/modalInboxWhy/.test(html));
check("køvalg flyttes fortsatt til fokus", /state\.openInboxThreadId/.test(app) && /focusCandidate = selectedCandidate/.test(app));

// Ny normal IA: meldingene ligger i Kalender.
check("Kontor åpner Kalender i aktiv ligasave", /redirectOfficeToCalendar/.test(calendar) && /Kontor åpner Kalender/.test(browser));
check("separat Innboks-fane skjules", /inbox\.classList\.add\("office-subnav-proxy"\)/.test(calendar) && /Innboks og Oppstartshjelp/.test(browser));
check("Oppstartshjelp skjules etter oppstart", /officeHelp\.classList\.toggle\("office-subnav-proxy", normalSave\)/.test(calendar));
check("Klubben er synlig Kontor-motpart", /board\.textContent = "Klubben"/.test(calendar));
check("melding er kalenderhendelse", /kind: "message"/.test(calendarModel) && /Les mail/.test(calendarModel));
check("drawer bruker eksakt klubbmail", /getClubCommunicationMessage/.test(calendar) && /article\.dataset\.messageId = message\.id/.test(calendar) && /managerCalendarDrawerBody \.manager-club-mail/.test(browser));
check("drawer lukkes tilbake til samme dag", /closeInboxDrawer/.test(calendar) && /samme kalenderdag/.test(browser));
check("trening nås fra kalenderhendelsen", /data-event-id=\\?"team-training\\?"/.test(browser) && /data-tab-section=\\?"trening\\?"/.test(browser));
check("global Next-footer skjules i normal save", /manager-next-action/.test(css) && /data-manager-office-calendar-v1="active"/.test(css));
check("legacy hjelpeflaten lager ingen ekstra primærhandling", !/next-action-primary/.test(office));

// Ingen ny motor eller lagring.
check("kalenderintegrasjonen skriver ingen state", !/localStorage\.setItem/.test(calendar) && !/localStorage/.test(calendarModel));
check("innboksmotoren forblir sannhetskilde i dokumentasjonen", /football-inbox-events\.js/.test(docs) && /club_inbox_\*/.test(docs));
check("dokumentasjonen sier ingen ny motor", /ingen ny motor/i.test(docs) && /MANAGER_CALENDAR_V1\.md/.test(docs));

// Permanente porter.
check("ren inbox-simulering finnes", existsSync(join(root, "scripts/simulate-manager-office-inbox-v1.mjs")) && /18\/18/.test(execFileSync(process.execPath, [join(root, "scripts/simulate-manager-office-inbox-v1.mjs")], { encoding: "utf8" })));
check("simulering og audit er i package", /sim:manager-office-inbox-v1/.test(packageJson) && /audit:manager-office-inbox-v1/.test(packageJson));
check("simulering og audit kjører i CI", /npm run sim:manager-office-inbox-v1/.test(workflow) && /npm run audit:manager-office-inbox-v1/.test(workflow));
check("nettleservakten dekker melding, trening og mobil", /inboxThreadList/.test(browser) && /managerCalendarMessageDrawer/.test(browser) && /team-training/.test(browser) && /width: 390/.test(browser) && /scrollWidth - document\.documentElement\.clientWidth/.test(browser));
check("tilgjengelighet testes på Kalender og melding", /AxeBuilder/.test(browser) && /wcag2aa/.test(browser));
check("mobiloppsettet er eksplisitt", /max-width: 760px/.test(css) && /manager-calendar-drawer-panel/.test(css));
check("gammel oversiktsstøtte er fortsatt isolert i Oppstartshjelp", ["officeCommandPanel", "officeDepth", "leagueOnboardingPanel"].every((id) => shell.includes(`"${id}"`)));

const failed = checks.filter((entry) => !entry.ok);
console.log("Managerkontor og Innboks v1-audit\n");
for (const entry of checks) console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` (${entry.detail})` : ""}`);
console.log(`\n${checks.length - failed.length}/${checks.length} sjekker bestått.`);
if (failed.length) process.exit(1);
