import fs from "node:fs";

const files = {
  shell: fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8"),
  organization: fs.readFileSync(new URL("../src/ui/manager-club-organization-v1.js", import.meta.url), "utf8"),
  style: fs.readFileSync(new URL("../src/ui/manager-club-organization-v1.css", import.meta.url), "utf8"),
  learning: fs.readFileSync(new URL("../src/ui/manager-club-learning-v1.js", import.meta.url), "utf8"),
  learningStyle: fs.readFileSync(new URL("../src/ui/manager-club-learning-v1.css", import.meta.url), "utf8"),
  medicalModel: fs.readFileSync(new URL("../src/football-medical-decision-learning.js", import.meta.url), "utf8"),
  opponentAnalysis: fs.readFileSync(new URL("../src/football-opponent-analysis.js", import.meta.url), "utf8"),
  opponentBridge: fs.readFileSync(new URL("../src/football-opponent-analysis-bridge.js", import.meta.url), "utf8"),
  readiness: fs.readFileSync(new URL("../src/football-matchday-readiness.js", import.meta.url), "utf8"),
  nextAction: fs.readFileSync(new URL("../src/football-next-action.js", import.meta.url), "utf8"),
  matchday: fs.readFileSync(new URL("../src/football-matchday-engine.js", import.meta.url), "utf8"),
  postMatch: fs.readFileSync(new URL("../src/ui/manager-post-match-analysis-v1.js", import.meta.url), "utf8"),
  app: fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8"),
  modeSessions: fs.readFileSync(new URL("../src/football-mode-sessions.js", import.meta.url), "utf8"),
  oldClub: fs.readFileSync(new URL("../src/ui/manager-club-presentation.js", import.meta.url), "utf8"),
  facilities: fs.readFileSync(new URL("../src/ui/manager-facilities-workspace-v1.js", import.meta.url), "utf8"),
  cleanup: fs.readFileSync(new URL("../src/ui/manager-legacy-cleanup-v1.js", import.meta.url), "utf8"),
  clubs: fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"),
  staff: fs.readFileSync(new URL("../data/football_staff.json", import.meta.url), "utf8"),
  docs: fs.readFileSync(new URL("../docs/MANAGER_CLUB_ORGANIZATION_V1.md", import.meta.url), "utf8"),
  browser: fs.readFileSync(new URL("../tests/browser/manager-club-organization-v1.spec.js", import.meta.url), "utf8"),
  medicalBrowser: fs.readFileSync(new URL("../tests/browser/manager-medical-decision-learning-v1.spec.js", import.meta.url), "utf8"),
  analysisBrowser: fs.readFileSync(new URL("../tests/browser/manager-opponent-analysis-preparation-v1.spec.js", import.meta.url), "utf8"),
  package: fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ci: fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8")
};

let failures = 0;
let checks = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Club Organization v1 audit");
check("managerskallet laster klubborganisasjonen", files.shell.includes('import "./manager-club-organization-v1.js"'));
check("Klubben reparentes til Kontor", files.organization.includes('boardButton.dataset.subnavParent = "dashboard"') && files.organization.includes('boardSection.dataset.tabParent = "dashboard"'));
check("Klubben heter Klubben og ikke Klubboversikt", files.organization.includes('boardButton.textContent = "Klubben"'));
check("dype gamle underfaner skjules", files.organization.includes('["progression", "admin"]') && files.style.includes(".club-organization-deep-proxy"));
check("hovedflaten er romkatalog", files.organization.includes('const SURFACE_ID = "managerClubOrganization"') && files.organization.includes("club-organization-room-list"));
check("organisasjonen har Trenerteam", files.organization.includes('"coaches"') && files.organization.includes('"Trenerteam"'));
check("organisasjonen har Treningsanlegg uten nivå", files.organization.includes('"training-ground"') && files.organization.includes("ikke oppdiktede nivå 1–3"));
check("organisasjonen har Medisinsk apparat", files.organization.includes('"medical"') && files.organization.includes('"Medisinsk apparat"'));
check("medisinsk rom har situasjon valg og konsekvens", files.learning.includes("appendMedicalDecisionWorkshop") && files.learning.includes("evaluateMedicalDecision") && files.learning.includes('setAttribute("aria-live", "polite")'));
check("medisinsk læringsmodell er ren og deterministisk", !/\bdocument\b|\bwindow\b|localStorage|sessionStorage|Math\.random|Date\.now/.test(files.medicalModel));
check("faktisk skade og belastning gir sak uten oppdiktet pasient", files.medicalModel.includes('kind: "return_to_play"') && files.medicalModel.includes('kind: "load_management"') && files.medicalModel.includes('kind: "no_case"'));
check("returvalgene skiller for tidlig kalender og kriterier", ["full_return_now", "calendar_only", "rehab_and_assess"].every((id) => files.medicalModel.includes(id)));
check("medisinsk UI leser aktiv modussnapshot", files.learning.includes("MODE_SESSION_KEY") && files.learning.includes("envelope?.sessions?.[activeMode]") && files.modeSessions.includes('playerCondition: "hgfm.playerCondition.v1"'));
check("legacy condition er bare fallback og UI skriver ingen state", files.learning.includes("PLAYER_CONDITION_KEY") && !files.learning.includes("localStorage.setItem"));
check("medisinsk valg har ingen ny score eller skjult motor", !/medicalScore|recoveryScore|returnScore|medicalOverall/i.test(files.medicalModel));
check("åpent klubbrom erstattes ikke under interaksjon", !files.organization.includes("openRoom(drawerState.roomId, drawerState.trigger)"));
check("organisasjonen har Analyse", files.organization.includes('"analysis"') && files.organization.includes('"Analyse"'));
check("analyse er et spillbart situasjon hypotese motgrep-verksted", files.learning.includes("appendOpponentAnalysisWorkshop") && files.learning.includes("createOpponentAnalysisPlan") && files.learning.includes("openOpponentAnalysisTarget"));
check("motstanderanalysen er ren og deterministisk", !/\bdocument\b|\bwindow\b|localStorage|sessionStorage|Math\.random|Date\.now/.test(files.opponentAnalysis));
check("analysen bruker terminfestet motstander profil og matchup", files.app.includes("getOpponentAnalysisFixtures") && files.app.includes("leagueOpponentProfile") && files.opponentAnalysis.includes("fixture.formationMatchup"));
check("analyseplanen persisteres bare i aktiv modussnapshot", files.modeSessions.includes('"opponentAnalysisPlan"') && files.app.includes("state.modeEnvelope.sessions[state.modeEnvelope.activeMode] = captureModeSession(state)") && !files.opponentBridge.includes("localStorage"));
check("bare analyseplan for samme fixture teller", files.opponentAnalysis.includes("isOpponentAnalysisPlanForFixture") && files.app.includes("analysisFixture.fixtureId"));
check("readiness bruker eksisterende autoritative port", files.readiness.includes('"opponent_analysis_missing"') && files.app.includes("requiresOpponentAnalysis") && files.app.includes("hasOpponentAnalysisPlan"));
check("readiness sender manageren til Analyse-rommet", files.nextAction.includes("opponent_analysis_missing") && files.nextAction.includes('room: "analysis"'));
check("analyseplan gir ingen styrke xG eller skjult bonus", !/analysisBonus|analysisScore|scoutingScore|opponentBonus/i.test(files.opponentAnalysis + files.app) && files.learning.includes("endrer ingen spillerverdier, kampstyrke, xG eller skjulte bonuser"));
check("analyseplanen følger lesbart inn i kampbrief og etterkamp", files.app.includes('"Analyseavdelingens plan"') && files.matchday.includes("opponentAnalysisPlan: session.opponentAnalysisPlan") && files.matchday.includes("Analyseplanen prioriterte") && files.postMatch.includes("Analysehypotesen før kamp"));
check("organisasjonen har Styret", files.organization.includes('"board"') && files.organization.includes('"Styret"'));
check("organisasjonen har Administrasjon", files.organization.includes('"administration"') && files.organization.includes('"Administrasjon"'));
check("organisasjonen har Stadion og hjemmebane", files.organization.includes('"stadium"') && files.organization.includes('"Stadion og hjemmebane"'));
check("organisasjonen beholder Klubbutvikling", files.organization.includes('"development"') && files.organization.includes('"Klubbutvikling"'));
check("akademi vises bare betinget fra data", files.organization.includes("academyName") && files.organization.includes("if (academyName)"));
check("canonical klubbdata lastes", files.organization.includes("football_clubs.json") && files.clubs.includes('"ground"') && files.clubs.includes('"homePlaceId"'));
check("canonical stab lastes", files.organization.includes("football_staff.json") && files.staff.includes('"staffType"'));
check("ingen ny localStorage-skriving", !files.organization.includes("localStorage.setItem") && !files.organization.includes("writeStorage"));
check("ingen ny klubb- eller progresjonsmotor", !files.organization.includes("Math.random") && !files.organization.includes("advanceClubWeek") && !files.organization.includes("createMatchdaySession"));
check("fasilitetskompatibilitet rendrer ingen nivå-UI", files.facilities.includes("renderManagerFacilitiesWorkspace") && files.facilities.includes('dataset.legacyRemoved = "true"'));
check("Pass 7 cleanup fjerner økonomi marked og fasilitets-DOM", files.cleanup.includes("managerEconomyWorkspace") && files.cleanup.includes("managerTransferMarketWorkspace") && files.cleanup.includes("managerFacilitiesWorkspace"));
check("økonomi- og overgangs-UI lastes ikke av managerskallet", !files.shell.includes("manager-economy-contracts-v1") && !files.shell.includes("manager-transfer-market-v2"));
check("gammel klubbdashboard-presentasjon er fortsatt tilgjengelig mens monolitten fases ned", files.oldClub.includes("createManagerClubSceneModel") && files.style.includes("#clubCommandPanel"));
check("rom åpnes i drawer", files.organization.includes('const DRAWER_ID = "managerClubRoomDrawer"') && files.style.includes(".manager-club-room-drawer"));
check("mobil drawer blir bottom sheet", files.style.includes("@media (max-width: 560px)") && files.style.includes("border-radius: 18px 18px 0 0"));
check("browser tester Kontor Kalender Klubben", files.browser.includes("ved siden av Kalender") && files.browser.includes('data-subnav-parent", "dashboard"'));
check("browser tester at legacy økonomi marked og fasiliteter er fysisk borte", files.browser.includes("ikke lenger som skjulte parallelle flater") && files.browser.includes("managerTransferMarketWorkspace"));
check("browser tester canonical stadiondata", files.browser.includes("stadionrommet bruker canonical klubbdata") && files.browser.includes("Lerkendal"));
check("browser tester ingen fasilitetsnivå", files.browser.includes("dikter ikke nivå eller oppgraderingsbonus"));
check("browser tester mobil overflow", files.browser.includes("scrollWidth") && files.browser.includes("clientWidth"));
check("browser tester WCAG", files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("browser tester medisinsk valg uten save-mutasjon", files.medicalBrowser.includes("conditionBefore") && files.medicalBrowser.includes("conditionAfter") && files.medicalBrowser.includes('data-medical-decision="rehab_and_assess"'));
check("browser tester aktiv modus uten condition-lekkasje", files.medicalBrowser.includes("aktiv modussnapshot") && files.medicalBrowser.includes('playerCondition: []'));
check("browser tester medisinsk navigasjon mobil og WCAG", files.medicalBrowser.includes('[data-tab-section="trening"]') && files.medicalBrowser.includes("expectNoHorizontalOverflow") && files.medicalBrowser.includes("AxeBuilder"));
check("browser tester analysevalg lagring og aktiv modussnapshot", files.analysisBrowser.includes("choosePressPlan") && files.analysisBrowser.includes("hgfm.modeSessions.v1") && files.analysisBrowser.includes("opponentAnalysisPlan"));
check("browser tester at senere kamp ikke åpner nærmeste kamp", files.analysisBrowser.includes("senere terminlistekamp") && files.analysisBrowser.includes("Nærmeste kamp trenger fortsatt"));
check("browser tester analyseverksted mobil og WCAG", files.analysisBrowser.includes("expectNoHorizontalOverflow") && files.analysisBrowser.includes("AxeBuilder"));
check("dokumentasjonen låser rejected live IA", files.docs.includes("Rejected live IA") && files.docs.includes("overgangsvinduer") && files.docs.includes("fasilitetsnivå 1–3"));
check("dokumentasjonen peker cleanup til Pass 7", files.docs.includes("Pass 7"));
check("dokumentasjonen låser medisinsk faggrunnlag og state-grense", files.docs.includes("London International Consensus") && files.docs.includes("aktive `hgfm.modeSessions.v1`-sesjonen") && files.docs.includes("gir ikke medisinske råd"));
check("simuleringen er registrert", files.package.includes('"sim:manager-club-organization-v1"'));
check("auditen er registrert", files.package.includes('"audit:manager-club-organization-v1"'));
check("CI kjører begge permanente porter", files.ci.includes("audit:manager-club-organization-v1") && files.ci.includes("sim:manager-club-organization-v1"));

console.log(`\nManager Club Organization v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
