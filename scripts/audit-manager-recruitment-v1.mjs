import fs from "node:fs";

const engine = fs.readFileSync(new URL("../src/football-recruitment.js", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const poolUi = fs.readFileSync(new URL("../src/ui/manager-player-pool-squad-v1.js", import.meta.url), "utf8");
const poolCss = fs.readFileSync(new URL("../src/ui/manager-player-pool-squad-v1.css", import.meta.url), "utf8");
const scouting = fs.readFileSync(new URL("../src/ui/manager-scouting-workspace-v1.js", import.meta.url), "utf8");
const playerWorkspace = fs.readFileSync(new URL("../src/ui/manager-player-workspace-v1.js", import.meta.url), "utf8");
const shell = fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8");
const seed = fs.readFileSync(new URL("../data/football_team_merits.example.json", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../tests/browser/manager-recruitment-v1.spec.js", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/MANAGER_RECRUITMENT_V1.md", import.meta.url), "utf8");
const packageJson = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");
const ci = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const runtime = `${engine}\n${app}\n${poolUi}\n${scouting}`;
const economyPattern = /\b(?:transferFee|salary|wage|contractLength|agentFee|marketValue|askingPrice|releaseClause)\s*[:=]/i;

const checks = [
  ["canonical pool/tropp-state finnes", engine.includes("PLAYER_POOL_SQUAD_STATE_VERSION") && engine.includes("squadPlayerIds")],
  ["spillerpool og valgt tropp er separate runtime-mengder", app.includes("playerPoolIds") && app.includes("legacyPlayablePlayerIds") && app.includes("unlockedPlayerIds")],
  ["kampmotorintegrasjonen bruker fortsatt eksisterende unlocked-getter", app.includes("function getUnlockedPlayers()") && app.includes("return getAvailability().unlockedPlayers")],
  ["poolen lagres ikke parallelt", !/playerPoolIds\s*[:=][^\n]*localStorage/i.test(runtime) && !/hgfm\.playerPool/i.test(runtime)],
  ["troppsvalget bor i eksisterende teamMerits", poolUi.includes('merits: "hgfm.teamMerits.v1"') && seed.includes('"squadPlayerIds"')],
  ["legacy recruitedPlayerIds er kun migreringskilde", engine.includes("migrateLegacyPlayerPoolSquadState") && docs.includes("legacy-data")],
  ["gamle saves migreres én gang", app.includes("migration.migrated") && app.includes("playerPoolSquadVersion")],
  ["nye poolfunn legges ikke automatisk i troppen", engine.includes("buildSelectedSquadPlayerIds") && engine.includes("eligiblePoolPlayerIds")],
  ["valgt tilstand vises før alternativer", playerWorkspace.includes("Troppen din") && poolUi.includes("Endre tropp") && poolUi.includes("Number(b.inSquad) - Number(a.inSquad)")],
  ["drawer støtter inn og ut", poolUi.includes('"squad-add"') && poolUi.includes('"squad-remove"') && scouting.includes("setPlayerSquadMembership")],
  ["starter må ut av oppstilling før uttak", poolUi.includes("selectedLineupIds") && poolUi.includes("Bytt spilleren på Oppstilling")],
  ["ingen troppsgrense eller byttefrist i UI", poolUi.includes("ingen troppsgrense eller byttefrist")],
  ["History Go-quiz og nasjonalarena-port beholdes", poolUi.includes("QUIZ_EVENTS") && poolUi.includes('includes("national")')],
  ["same-session refresh finnes", poolUi.includes("hgfm:team-merits-changed") && app.includes("hgfm:team-merits-changed")],
  ["managerskallet laster pool/tropp-UI", shell.includes("manager-player-pool-squad-v1.js")],
  ["mobil drawer er stylet", poolCss.includes("100dvh") && poolCss.includes("@media (max-width: 680px)")],
  ["browser dekker drawer, state og mobil", browser.includes("openPlayerPoolSquadDrawer") && browser.includes("squadPlayerIds") && browser.includes("390")],
  ["browser dekker WCAG", browser.includes("AxeBuilder") && browser.includes("wcag2aa")],
  ["ingen ny overgangsøkonomi", !economyPattern.test(`${engine}\n${poolUi}\n${scouting}`) && !`${engine}\n${poolUi}`.includes("Math.random")],
  ["ingen Overall introduseres", !/overall\s*[:=]/i.test(`${poolUi}\n${engine}`)],
  ["dokumentasjonen avviser nye regler", docs.includes("ingen troppsgrense") && docs.includes("ingen ny progresjonsscore")],
  ["simulering og audit er registrert", packageJson.includes('"sim:manager-recruitment-v1"') && packageJson.includes('"audit:manager-recruitment-v1"')],
  ["CI kjører begge porter", ci.includes("audit:manager-recruitment-v1") && ci.includes("sim:manager-recruitment-v1")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Min spillerpool → Tropp v1 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Min spillerpool → Tropp v1 audit: ${checks.length}/${checks.length}`);
