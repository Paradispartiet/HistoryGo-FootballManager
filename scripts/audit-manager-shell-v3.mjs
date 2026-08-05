#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("index.html");
const app = read("src/app.js");
const css = `${read("style.css")}\n${read("src/ui/manager-shell-v3.css")}\n${read("src/ui/manager-shell-foundation.css")}`;
const browser = read("tests/browser/manager-shell-v3.spec.js");
const shellElements = read("src/ui/manager-shell-elements.js");
const workflow = read(".github/workflows/ci.yml");
const snapshotDir = join(root, "tests/browser/manager-shell-v3.spec.js-snapshots");
const snapshots = existsSync(snapshotDir) ? readdirSync(snapshotDir).filter((name) => name.endsWith("-chromium-linux.png")) : [];

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });
const panelCount = [...html.matchAll(/class="([^"]*)"/g)]
  .filter((match) => match[1].split(/\s+/).includes("panel")).length;

check("nøyaktig én autoritativ neste handling", (shellElements.match(/class="next-action-primary"/g) || []).length === 1);
check("konkurrerende neste-knapper er fjernet", !/advanceClubWeekPhase|leagueOnboardingPrimary|portalPriorityAction/.test(html));
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
check("fem visuelle differansetester er låst", (browser.match(/toHaveScreenshot\(/g) || []).length === 5 && snapshots.length === 5);
check("CI sammenligner mot baseliner uten å omskrive dem", /run: npm run test:browser\s*$/.test(workflow) && !/update-snapshots/.test(workflow));
check("tilgjengelighet testes med axe", /AxeBuilder/.test(browser) && /wcag2aa/.test(browser));
check("tastatur og fokusfelle testes", /Shift\+Tab/.test(browser) && /toBeFocused/.test(browser));
check("horisontal overflow testes", /scrollWidth - document\.documentElement\.clientWidth/.test(browser));
check("primærhandling uten scroll testes", /expectPrimaryActionInViewport/.test(browser));
check("modalene har fokusfelle i appen", /event\.key !== "Tab"/.test(app) && /lastModalOpener\.focus/.test(app));
check("foreldet portal-/fase-CSS er fjernet", !/portal-priority-card|#advanceClubWeekPhase/.test(css));

const failed = checks.filter((entry) => !entry.ok);
console.log("Manager Shell v3 completion-audit\n");
for (const entry of checks) console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` (${entry.detail})` : ""}`);
console.log(`\n${checks.length - failed.length}/${checks.length} sjekker bestått.`);
if (failed.length) process.exit(1);
