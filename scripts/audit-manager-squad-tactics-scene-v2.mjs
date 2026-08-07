import fs from "node:fs";

const files = {
  lineup: fs.readFileSync("src/ui/manager-lineup-presentation.js", "utf8"),
  shell: fs.readFileSync("src/ui/manager-shell-view.js", "utf8"),
  workspace: fs.readFileSync("src/ui/manager-player-workspace-v1.js", "utf8"),
  css: fs.readFileSync("src/ui/manager-player-workspace-v1.css", "utf8"),
  docs: fs.readFileSync("docs/PLAYER_LIST_PROFILE_V1.md", "utf8"),
  package: fs.readFileSync("package.json", "utf8"),
  ci: fs.readFileSync(".github/workflows/ci.yml", "utf8"),
  browser: fs.readFileSync("tests/browser/manager-squad-tactics-scene-v2.spec.js", "utf8")
};

const checks = [
  ["gammel Lag-kommandoscene er koblet ut av runtime", !files.lineup.includes('import "./manager-squad-tactics-scene-v2.js"')],
  ["spillerarbeidsrommet lastes fra managerskallet", files.shell.includes('import "./manager-player-workspace-v1.js"')],
  ["arbeidsrommet har kompakt Lag-status", files.workspace.includes('const STATUS_ID = "squadCompactStatus"')],
  ["kampklar-gaten beholdes som datakilde", files.workspace.includes('document.getElementById("squadSetupGate")')],
  ["gammelt gatepanel skjules bare i presentasjonen", files.css.includes("#squadSetupGate.is-replaced-by-compact-status")],
  ["Tropp er en faktisk tabell", files.workspace.includes('class="manager-roster-table"')],
  ["Tropp har spillersøk", files.workspace.includes('id="managerRosterSearch"')],
  ["Tropp har posisjonsfilter", files.workspace.includes('id="managerRosterPosition"')],
  ["Tropp har tilgjengelighetsfilter", files.workspace.includes('id="managerRosterAvailability"')],
  ["Tropp har sortering", files.workspace.includes('id="managerRosterSort"')],
  ["spillerprofil har egen dialog", files.workspace.includes('const PROFILE_ID = "managerPlayerProfileDialog"')],
  ["spillerprofil har posisjonsbane", files.workspace.includes("manager-player-mini-pitch")],
  ["spillerprofil bruker eksisterende ferdighetsmotor", files.workspace.includes("derivePlayerAttributeIndex")],
  ["ferdigheter grupperes i fire faglige grupper", ["Teknisk", "Mental", "Taktisk", "Fysisk"].every((label) => files.workspace.includes(label))],
  ["sesongtall leses fra eksisterende lagring", files.workspace.includes('stats: "hgfm.playerSeasonStats.v1"')],
  ["condition leses fra eksisterende lagring", files.workspace.includes('conditions: "hgfm.playerCondition.v1"')],
  ["rollefortrolighet leses gjennom eksisterende motor", files.workspace.includes("getRoleFamiliarity")],
  ["profil og laguttak har separate treffmål", files.workspace.includes("lineup-player-profile-link") && files.workspace.includes("lineup-player-select-action")],
  ["eksplisitt laguttak heter Velg/Sett inn", files.workspace.includes("Sett inn") && files.workspace.includes("Velg")],
  ["ingen ny overall-rating introduseres", !/\boverall\b/i.test(files.workspace.replace("ingen overall", ""))],
  ["desktop-rader er kompakte", files.css.includes("height: 2.75rem")],
  ["mobil bryter tabellen til kompakte rader", files.css.includes("@media (max-width: 680px)") && files.css.includes(".manager-roster-table thead { display: none; }")],
  ["profil blir fullskjerm på mobil", files.css.includes("height: 100dvh")],
  ["fokustilstander finnes", files.css.includes(":focus-visible")],
  ["dokumentasjonen låser liste/profil-skillet", files.docs.includes("Spillerliste = sammenligne mange spillere") && files.docs.includes("Spillerprofil = forstå én spiller")],
  ["dokumentasjonen låser én veiviser", files.docs.includes("eneste progresjonsveiviser")],
  ["audit-script er fortsatt registrert", files.package.includes("audit:manager-squad-tactics-scene-v2")],
  ["audit kjøres fortsatt i CI", files.ci.includes("npm run audit:manager-squad-tactics-scene-v2")],
  ["browser tester profilklikk uten laguttak", files.browser.includes("uten å endre laguttaket")],
  ["browser tester mobil overflow", files.browser.includes("ingen mobil overflow")],
  ["browser tester tilgjengelighet", files.browser.includes("AxeBuilder")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Spillerliste og spillerprofil v1 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Spillerliste og spillerprofil v1 audit: ${checks.length}/${checks.length}`);
