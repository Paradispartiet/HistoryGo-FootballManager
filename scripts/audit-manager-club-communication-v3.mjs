import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  engine: read("src/football-club-communication.js"),
  ui: read("src/ui/manager-calendar-workspace-v1.js"),
  css: read("src/ui/manager-calendar-workspace-v1.css"),
  html: read("index.html"),
  trainingDay: read("src/ui/manager-training-day-v1.js"),
  squad: read("src/ui/manager-squad-tactics-scene-v2.js"),
  system: read("src/ui/manager-system-workspace-v2.js"),
  organization: read("src/ui/manager-club-organization-v1.js"),
  docs: read("docs/MANAGER_CLUB_COMMUNICATION_V3.md"),
  browser: read("tests/browser/manager-club-communication-v2.spec.js"),
  package: read("package.json"),
  ci: read(".github/workflows/ci.yml")
};

const checks = [];
const check = (label, ok) => checks.push([label, Boolean(ok)]);
check("kommunikasjonsmodellen har v3-kontrakt", files.engine.includes("club-communication.v3") && files.engine.includes("guidance") && files.engine.includes("links"));
check("fire managerledd rendres", ["Situasjonen", "Hva det betyr", "Managerspørsmålet", "Se etter"].every((label) => files.ui.includes(label)));
check("arbeidslenker er ekte ankerlenker", files.ui.includes('node("a", "manager-club-mail-action"') && files.ui.includes("link.href = `#${route.target}"));
check("lenkene navigerer og fokuserer presist", files.ui.includes("activateTarget(route.target, route.focusId)") && files.ui.includes("revealDeepTarget"));
check("alle dyplenker finnes i live managerskall", [...files.engine.matchAll(/focusId: "([^"]+)"/g)].every(([, id]) => [files.html, files.trainingDay, files.squad, files.system, files.organization].some((source) => source.includes(id))));
check("treningsmail peker ikke til skjulte legacy-steg", !/["'](?:trainingCommandPanel|trainingProgramStep|trainingFocusStep|individualTrainingStep|squadConditionSummary)["']/.test(files.engine));
check("lenkene har tastatur- og mobilvern", files.css.includes(".manager-club-mail-action:focus-visible") && files.css.includes(".manager-club-mail-links") && files.css.includes("width: 100%"));
check("ingen ny lagring eller motor", !/localStorage|Math\.random|communicationScore|mailScore/.test(files.engine));
check("canonical dokument låser state- og motorgrensen", files.docs.includes("ingen ny localStorage-nøkkel") && files.docs.includes("ingen ny score") && files.docs.includes("presise arbeidslenker"));
check("browser tester veiledning og href", files.browser.includes("presise arbeidslenker") && files.browser.includes("toHaveAttribute(\"href\"") && files.browser.includes("toBeFocused"));
check("v3-portene er registrert", files.package.includes("audit:manager-club-communication-v3") && files.package.includes("sim:manager-club-communication-v3"));
check("CI kjører v3-portene", files.ci.includes("audit:manager-club-communication-v3") && files.ci.includes("sim:manager-club-communication-v3"));

const output = execFileSync(process.execPath, [fileURLToPath(new URL("./simulate-manager-club-communication-v3.mjs", import.meta.url))], { encoding: "utf8" });
check("deterministisk v3-simulering er grønn", output.includes("Klubbkommunikasjon v3: 14/14"));

checks.forEach(([label, ok]) => console.log(`${ok ? "✓" : "✗"} ${label}`));
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Klubbkommunikasjon v3 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Klubbkommunikasjon v3 audit: ${checks.length}/${checks.length}`);
