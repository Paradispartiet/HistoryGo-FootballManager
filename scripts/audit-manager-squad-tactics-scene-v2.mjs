import fs from "node:fs";

const files = {
  lineup: fs.readFileSync("src/ui/manager-lineup-presentation.js", "utf8"),
  shell: fs.readFileSync("src/ui/manager-shell-view.js", "utf8"),
  workspace: fs.readFileSync("src/ui/manager-player-workspace-v1.js", "utf8"),
  css: fs.readFileSync("src/ui/manager-player-workspace-v1.css", "utf8"),
  drawer: fs.readFileSync("src/ui/manager-team-choice-drawer-v1.js", "utf8"),
  drawerCss: fs.readFileSync("src/ui/manager-team-choice-drawer-v1.css", "utf8"),
  systemV2: fs.readFileSync("src/ui/manager-system-workspace-v2.js", "utf8"),
  docs: fs.readFileSync("docs/PLAYER_LIST_PROFILE_V1.md", "utf8"),
  selectedDocs: fs.readFileSync("docs/MANAGER_TEAM_SELECTED_STATE_V1.md", "utf8"),
  package: fs.readFileSync("package.json", "utf8"),
  ci: fs.readFileSync(".github/workflows/ci.yml", "utf8"),
  browser: fs.readFileSync("tests/browser/manager-squad-tactics-scene-v2.spec.js", "utf8")
};

const checks = [
  ["gammel Lag-kommandoscene er koblet ut av runtime", !files.lineup.includes('import "./manager-squad-tactics-scene-v2.js"')],
  ["spillerarbeidsrommet lastes fra managerskallet", files.shell.includes('import "./manager-player-workspace-v1.js"')],
  ["felles Lag-valgdrawer lastes fra managerskallet", files.shell.includes('import "./manager-team-choice-drawer-v1.js"')],
  ["arbeidsrommet har kompakt Lag-status", files.workspace.includes('const STATUS_ID = "squadCompactStatus"')],
  ["kampklar-gaten beholdes som datakilde", files.workspace.includes('document.getElementById("squadSetupGate")')],
  ["gammelt gatepanel skjules bare i presentasjonen", files.css.includes("#squadSetupGate.is-replaced-by-compact-status")],

  ["én felles modal drawer finnes", files.drawer.includes('const DRAWER_ID = "managerTeamChoiceDrawer"') && files.drawer.includes('aria-modal')],
  ["drawer flytter eksisterende DOM i stedet for å kopiere motorlogikk", files.drawer.includes("activeMove = { source, parent, nextSibling") && files.drawer.includes("parent.insertBefore(source")],
  ["drawer har Escape og fokusfelle", files.drawer.includes('event.key === "Escape"') && files.drawer.includes('event.key !== "Tab"')],
  ["drawer returnerer fokus til åpner", files.drawer.includes("trigger?.isConnected") && files.drawer.includes("trigger.focus()")],
  ["drawer introduserer ingen ny lagring", !/localStorage|sessionStorage/.test(files.drawer)],
  ["drawer bruker eksisterende formasjon og kampplan", files.drawer.includes('document.getElementById("formationSelect")') && files.drawer.includes('document.getElementById("tacticSelect")')],

  ["Oppstilling viser valgt formasjon og kampplan", files.drawer.includes('id = "teamTacticsSelectedState"') && files.drawer.includes('teamSelectedFormation') && files.drawer.includes('teamSelectedTactic')],
  ["formasjon og kampplan åpnes med Endre", files.drawer.includes("teamChangeFormation") && files.drawer.includes("teamChangeTactic")],
  ["spiller- og rollealternativer samles i drawer", files.drawer.includes("teamLineupChoiceSource") && files.drawer.includes("lineupPlayerChoices") && files.drawer.includes("lineupRoleChoices")],
  ["valgt spiller og rolle vises på hovedflaten", files.drawer.includes("teamSelectedPlayer") && files.drawer.includes("teamSelectedRole")],
  ["spiller- og rollemenyen har eksplisitt Endre", files.drawer.includes("teamChangePlayerRole")],

  ["Trening viser valgte verdier på hovedflaten", files.drawer.includes("teamTrainingSelectedState") && files.drawer.includes("teamSelectedTrainingProgram") && files.drawer.includes("teamSelectedTrainingFocus")],
  ["treningsprogramalternativer flyttes til drawer", files.drawer.includes('trainingSource("trainingPrograms")') && files.drawer.includes("teamChangeTrainingProgram")],
  ["treningsfokusalternativer flyttes til drawer", files.drawer.includes('trainingSource("weeklyTrainingOptions")') && files.drawer.includes("teamChangeTrainingFocus")],
  ["individuell picker flyttes til drawer", files.drawer.includes('trainingSource("individualTrainingPicker")') && files.drawer.includes("teamChangeIndividualTraining")],
  ["Systemet viser aktiv formasjon og kampplan", files.drawer.includes("teamSystemSelectedState") && files.drawer.includes("teamSystemFormation") && files.drawer.includes("teamSystemTactic")],
  ["Systemet v2 delegerer formasjon og kampplan til eksisterende valg", files.systemV2.includes('document.getElementById("teamChangeFormation")?.click()') && files.systemV2.includes('document.getElementById("teamChangeTactic")?.click()')],
  ["Systemet beholder samme autoritative formasjon/kampplan-drawer", files.drawer.includes("teamChangeSystem") && files.drawer.includes('source: form')],

  ["alternativkilder skjules bare på hovedflaten", files.drawerCss.includes(".manager-team-alternative-source") && files.drawerCss.includes(".is-in-team-choice-drawer")],
  ["desktop bruker sidedrawer", files.drawerCss.includes("grid-template-columns: minmax(0, 1fr) minmax(24rem, 42rem)")],
  ["mobil bruker bottom sheet", files.drawerCss.includes("@media (max-width: 760px)") && files.drawerCss.includes("align-self: end")],
  ["fokustilstander finnes for drawer", files.drawerCss.includes(":focus-visible")],

  ["Tropp er en faktisk tabell", files.workspace.includes('class="manager-roster-table"')],
  ["Tropp har spillersøk", files.workspace.includes('id="managerRosterSearch"')],
  ["Tropp har posisjonsfilter", files.workspace.includes('id="managerRosterPosition"')],
  ["Tropp har tilgjengelighetsfilter", files.workspace.includes('id="managerRosterAvailability"')],
  ["Tropp har sortering", files.workspace.includes('id="managerRosterSort"')],
  ["spillerprofil har egen dialog", files.workspace.includes('const PROFILE_ID = "managerPlayerProfileDialog"')],
  ["profil og laguttak har separate treffmål", files.workspace.includes("lineup-player-profile-link") && files.workspace.includes("lineup-player-select-action")],
  ["ingen ny overall-rating introduseres", !/\boverall\b/i.test(files.workspace.replace("ingen overall", ""))],

  ["dokumentasjonen sier eksplisitt at alternativer ikke fjernes", files.selectedDocs.includes("alternativer fjernes") && files.selectedDocs.includes("popup/drawer")],
  ["dokumentasjonen låser eksisterende motorer", files.selectedDocs.includes("ingen ny taktikkmotor") && files.selectedDocs.includes("ingen ny treningsmotor") && files.selectedDocs.includes("ingen ny localStorage-nøkkel")],
  ["dokumentasjonen låser komplett alternativmeny", files.selectedDocs.includes("Alternativene skal være komplette")],
  ["opprinnelig spillerliste/profil-skille beholdes", files.docs.includes("Spillerliste = sammenligne mange spillere") && files.docs.includes("Spillerprofil = forstå én spiller")],

  ["audit-script er fortsatt registrert", files.package.includes("audit:manager-squad-tactics-scene-v2")],
  ["audit kjøres fortsatt i CI", files.ci.includes("npm run audit:manager-squad-tactics-scene-v2")],
  ["browser tester formasjon i drawer", files.browser.includes("formasjon og kampplan åpnes i drawer") && files.browser.includes("#teamChangeFormation")],
  ["browser tester spiller og rolle i drawer", files.browser.includes("spiller- og rollealternativer") && files.browser.includes("#teamChangePlayerRole")],
  ["browser tester trening i drawer", files.browser.includes("program fokus og individuell picker") && files.browser.includes("#teamChangeTrainingProgram")],
  ["browser tester Systemet v2 til eksisterende drawer", files.browser.includes("Systemet viser aktivt system") && files.browser.includes("#managerSystemWorkspaceV2") && files.browser.includes('name: "Endre formasjon"')],
  ["browser tester mobil overflow", files.browser.includes("valgdrawer har ingen mobil overflow")],
  ["browser tester tilgjengelighet og fokusretur", files.browser.includes("returnerer fokus") && files.browser.includes("AxeBuilder")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Lag · valgt tilstand og valgdrawer v1 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Lag · valgt tilstand og valgdrawer v1 audit: ${checks.length}/${checks.length}`);
