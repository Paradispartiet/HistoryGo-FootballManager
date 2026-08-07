import fs from "node:fs";

const engine = fs.readFileSync(new URL("../src/football-recruitment.js", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const scouting = fs.readFileSync(new URL("../src/ui/manager-scouting-workspace-v1.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/ui/manager-scouting-workspace-v1.css", import.meta.url), "utf8");
const seed = fs.readFileSync(new URL("../data/football_team_merits.example.json", import.meta.url), "utf8");
const shellBrowser = fs.readFileSync(new URL("../tests/browser/manager-shell-v3.spec.js", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../tests/browser/manager-recruitment-v1.spec.js", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/MANAGER_RECRUITMENT_V1.md", import.meta.url), "utf8");
const packageJson = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");
const ci = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const recruitmentRuntime = `${scouting}\n${engine}`;
const economyFieldPattern = /\b(?:transferFee|salary|wage|contractLength|agentFee|marketValue|askingPrice|releaseClause)\s*[:=]/i;

const checks = [
  ["fem hovedområder er uendret", shellBrowser.includes('["Kontor", "Lag", "Speiding", "Kamp", "Stats"]')],
  ["rekruttering ligger under Speiding", scouting.includes("Speiding · Rekrutterbare") && scouting.includes("Hent til troppen")],
  ["kandidat og tropp er separate state-begreper", app.includes("candidatePlayerIds") && app.includes("recruitedPlayerIds")],
  ["troppsmedlemskap bor i eksisterende teamMerits", scouting.includes('merits: "hgfm.teamMerits.v1"') && seed.includes('"recruitedPlayerIds"')],
  ["ingen separat recruitment-localStorage-key", !/hgfm\.(recruitment|transfer|market)/i.test(recruitmentRuntime)],
  ["samme-session state refresh finnes", scouting.includes("hgfm:team-merits-changed") && app.includes("hgfm:team-merits-changed")],
  ["gamle saves har eksplisitt engangsmigrering", engine.includes("migrateLegacyRecruitmentState") && app.includes("migration.migrated")],
  ["nye saves starter uten automatisk kandidatimport", seed.includes('"recruitmentVersion": 1') && seed.includes('"recruitedPlayerIds": []')],
  ["rekruttert spiller må fortsatt være kvalifisert kandidat", engine.includes("eligible.has(id)") && app.includes("candidatePlayerIds.has(playerId)")],
  ["nasjonalarena og quiz-port beholdes", scouting.includes("isNationalArenaPlace") && scouting.includes("currentQuizCompletedPlaceIds")],
  ["History Go-samling skilles fra tropp", app.includes("collectedPlayerIds") && app.includes("unlockedPlayerIds: collectedPlayerIds")],
  ["ingen ny Neste-/Fortsett-flyt", !/Neste dag|Fortsett|nextAction|next-action/i.test(recruitmentRuntime)],
  ["ingen overgangsøkonomiske runtime-felt i v1", !economyFieldPattern.test(recruitmentRuntime)],
  ["ingen Overall introduseres", !/overall\s*[:=]/i.test(recruitmentRuntime)],
  ["mobil rekrutteringshandling er stylet", css.includes(".scouting-recruit-button") && css.includes("@media (max-width: 680px)")],
  ["browser tester kandidat til tropp i samme økt", browser.includes("Hent til troppen") && browser.includes("recruitedPlayerIds") && browser.includes("formationSelect")],
  ["browser tester mobil og WCAG", browser.includes("390") && browser.includes("AxeBuilder")],
  ["dokumentasjonen avgrenser v1", docs.includes("ingen overgangssum") && docs.includes("Forslag til neste steg")],
  ["simulering og audit er registrert", packageJson.includes('"sim:manager-recruitment-v1"') && packageJson.includes('"audit:manager-recruitment-v1"')],
  ["CI kjører begge permanente porter", ci.includes("audit:manager-recruitment-v1") && ci.includes("sim:manager-recruitment-v1")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Rekruttering v1 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Rekruttering v1 audit: ${checks.length}/${checks.length}`);
