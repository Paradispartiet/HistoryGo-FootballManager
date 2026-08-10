import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  engine: read("src/football-club-communication.js"),
  calendar: read("src/football-manager-calendar.js"),
  ui: read("src/ui/manager-calendar-workspace-v1.js"),
  css: read("src/ui/manager-calendar-workspace-v1.css"),
  app: read("src/app.js"),
  docs: read("docs/MANAGER_CLUB_COMMUNICATION_V2.md"),
  browser: read("tests/browser/manager-club-communication-v2.spec.js"),
  package: read("package.json"),
  ci: read(".github/workflows/ci.yml")
};

const checks = [];
const check = (label, ok) => checks.push([label, Boolean(ok)]);
check("ren klubbkommunikasjonsmodell finnes", files.engine.includes("createClubCommunicationTimeline") && !/localStorage|document\.|window\./.test(files.engine));
check("mailene bruker kamp, trening, condition, analyse og stab", ["lastMatch", "training", "playerConditions", "analysisPlan", "staffMember"].every((token) => files.engine.includes(token)));
check("kalenderhendelsen bærer eksakt message", files.calendar.includes("message = null") && files.calendar.includes("message\n      }") || files.calendar.includes("message\n    ))"));
check("UI slår opp eksakt melding-ID", files.ui.includes("getClubCommunicationMessage") && files.ui.includes("article.dataset.messageId = message.id"));
check("legacy-kort flyttes ikke", !files.ui.includes("findInboxCard") && !files.ui.includes("append(card)") && !files.ui.includes("insertBefore(state.card"));
check("lesing og svar har eksplisitte broer", files.ui.includes("hgfm:club-communication-read") && files.ui.includes("hgfm:club-communication-choice") && files.app.includes("getClubCommunicationContext"));
check("lesing flytter ikke Club Week", !files.app.includes("acknowledgeInboxThisWeek") && !/club-communication-read[\s\S]{0,800}syncClubWeekPhaseToProgress/.test(files.app));
check("mailen har semantisk avsender, fakta og svar", ["manager-club-mail-sender", "manager-club-mail-facts", "manager-club-mail-choices", "manager-club-mail-reply"].every((token) => files.ui.includes(token)));
check("mailen har mobil- og fokusvern", files.css.includes(".manager-club-mail-action:focus-visible") && files.css.includes(".manager-club-mail-fact") && files.css.includes("@media (max-width: 760px)"));
check("ingen ny lagringsnøkkel", !/hgfm\.[A-Za-z-]+\.v2/.test(files.engine + files.ui));
check("dokumentasjonen låser læringssløyfe og motorgrense", files.docs.includes("situasjon → handling → konsekvens → forklaring") && files.docs.includes("ingen ny localStorage-nøkkel"));
check("browser låser eksakt mail og isolert lesing", files.browser.includes("samme mail-ID") && files.browser.includes("flytter ikke fasen") && files.browser.includes("to forskjellige mailer"));
check("audit og simulering er registrert", files.package.includes("audit:manager-club-communication-v2") && files.package.includes("sim:manager-club-communication-v2"));
check("CI kjører begge porter", files.ci.includes("audit:manager-club-communication-v2") && files.ci.includes("sim:manager-club-communication-v2"));

const output = execFileSync(process.execPath, [fileURLToPath(new URL("./simulate-manager-club-communication-v2.mjs", import.meta.url))], { encoding: "utf8" });
check("deterministisk simulering er grønn", output.includes("Klubbkommunikasjon v2: 17/17"));

checks.forEach(([label, ok]) => console.log(`${ok ? "✓" : "✗"} ${label}`));
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Klubbkommunikasjon v2 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Klubbkommunikasjon v2 audit: ${checks.length}/${checks.length}`);
