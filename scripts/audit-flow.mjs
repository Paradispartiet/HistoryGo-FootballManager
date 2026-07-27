#!/usr/bin/env node
// Read-only flow-audit: verifiserer at hele spilløkka faktisk henger sammen i
// kontrolleren (src/app.js) og UI-stillaset (index.html) — fra app-start til
// mini-sesong. Sim-/audit-scriptene dekker hver motor for seg, og
// check-dom-ids dekker at querySelector-id-er finnes; ingen av dem sjekker at
// selve flyt-limet mellom stegene er på plass.
//
// Dette scriptet er en strukturell (statisk) sjekk — det kjører ikke DOM-en.
// Det speiler flow-audit-stegene: app-start, faner, lokal tropp, roster 11/15,
// formasjon/rolle, treningsvalg, Club Week-faser, innboks, kamp, mini-sesong,
// state lagres/nullstilles. For hvert steg kreves at de nødvendige id-ene,
// handler-funksjonene og motor-importene finnes og er referert (wiret).
//
// Standardbibliotek, ingen avhengigheter. Exit 1 ved brudd, 0 ellers.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const app = readFileSync(join(root, "src/app.js"), "utf8");

// ---- Hjelpere ---------------------------------------------------------------

const htmlIds = new Set();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) htmlIds.add(match[1]);

const tabTargets = new Set();
for (const match of html.matchAll(/data-tab-target="([^"]+)"/g)) tabTargets.add(match[1]);

const tabSections = new Set();
for (const match of html.matchAll(/data-tab-section="([^"]+)"/g)) tabSections.add(match[1]);

const hasId = (id) => htmlIds.has(id);

// Et symbol regnes som definert hvis app.js deklarerer det som function, eller
// importerer det (named import). Dekker både lokale handlere og motor-API.
const defines = (name) =>
  new RegExp(`function\\s+${name}\\s*\\(`).test(app) ||
  new RegExp(`(?:^|[,{\\s])${name}(?:\\s+as\\s+\\w+)?\\s*[,}]`, "m").test(importBlock(name));

// Importblokk-tekst der et navn forekommer (for named-import-deteksjon).
function importBlock(name) {
  // Slå opp alle import { ... } blokker og returner samlet tekst.
  let blocks = "";
  for (const m of app.matchAll(/import\s*\{([\s\S]*?)\}\s*from/g)) blocks += m[1] + "\n";
  return blocks;
}
const importedNames = (() => {
  const set = new Set();
  for (const m of app.matchAll(/import\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim();
      if (name) set.add(name);
      const alias = raw.trim().split(/\s+as\s+/)[1];
      if (alias) set.add(alias.trim());
    }
  }
  return set;
})();

// Definert (function-deklarasjon) ELLER importert.
const symbolExists = (name) =>
  new RegExp(`function\\s+${name}\\s*\\(`).test(app) || importedNames.has(name);

// Referert som mer enn bare definisjonen (wiring-proxy): minst N forekomster.
const occurrences = (name) => {
  const re = new RegExp(`\\b${name}\\b`, "g");
  return (app.match(re) || []).length;
};
const wired = (name, min = 2) => occurrences(name) >= min;

// ---- Sjekk-rammeverk --------------------------------------------------------

const results = [];
let currentStage = "";
function stage(name) {
  currentStage = name;
}
function check(label, ok, detail = "") {
  results.push({ stage: currentStage, label, ok: Boolean(ok), detail });
}
// Krev at en handler både finnes og er wiret (referert utover definisjonen).
function requireHandler(name) {
  check(`handler ${name}() finnes`, symbolExists(name));
  check(`handler ${name}() er wiret (referert)`, wired(name), `forekomster=${occurrences(name)}`);
}
function requireId(id) {
  check(`#${id} finnes i index.html`, hasId(id));
}
function requireImport(name) {
  check(`motor-API ${name} importert`, importedNames.has(name), wired(name) ? "" : "importert men ikke brukt");
}

// ---- 1) App-start -----------------------------------------------------------
stage("1. App-start");
check("init() finnes", /async function init\s*\(/.test(app));
check("init() har feilhåndtering (try/catch -> UI)", /catch\s*\(error\)/.test(app) && /reportSummary/.test(app));
requireHandler("preloadManagerEngine");
check("initTabs() kalles i init()", /init(?:Tabs)?\(\);/.test(app) && /initTabs\(\)/.test(app));

// ---- 2) Faner ---------------------------------------------------------------
stage("2. Faner");
check("minst én fane finnes", tabTargets.size > 0, `targets=${tabTargets.size}`);
{
  const missingSection = [...tabTargets].filter((t) => !tabSections.has(t));
  const orphanSection = [...tabSections].filter((s) => !tabTargets.has(s));
  check("hver fane-knapp har matchende seksjon", missingSection.length === 0, missingSection.map((t) => `target=${t}`).join(", "));
  check("ingen foreldreløse seksjoner", orphanSection.length === 0, orphanSection.map((s) => `section=${s}`).join(", "));
}
requireHandler("activateTab");
requireHandler("initTabs");

// ---- 3) Starttropp uten History Go ------------------------------------------
// Stedsanker og geolokasjon er faset ut: starttroppen bygges nå direkte fra
// spillerkatalogen (auto-fyll), uten koordinater, sted eller posisjonstilgang.
stage("3. Starttropp uten History Go");
requireId("autoFillSquad");
requireId("clearLocalStart");
requireHandler("getLocalStartPlayerIds");
requireHandler("clearLocalStartSquad");
requireHandler("getStarterSquadPlayerIds");
requireHandler("activateStarterSquad");
check(
  "auto-troppen gir også stabskandidater (så «Velg stab» er mulig uten samling)",
  app.includes("getStarterSquadStaffCandidates(staff, REQUIRED_STAFF_SIZE")
);
check(
  "ingen geolokasjon eller stedsanker i starttroppen",
  !app.includes("navigator.geolocation") && !app.includes("getPublicStartAnchor") && !html.includes('id="publicStartPlaceSelect"')
);

// Klubbspillere vs landslagsspillere: en landslagsarena (Ullevaal, Maracanã)
// skal aldri gi spillere til klubblaget – ellers kunne ett besøk sikre hele
// Norges beste. Landslagsspillere er speidet, men må signeres via klubbanlegg.
check(
  "landslagsarena gir ikke klubbspillere (isNationalArenaPlace)",
  app.includes("function isNationalArenaPlace") && app.includes("nationalOnlyPlayerIds")
);

// Quiz-porten: besøk gjør spilleren speidet, quiz gjør ham signerbar. Kilden er
// History Gos læringslogg (verifisert mot Paradispartiet/History-Go).
check(
  "quiz-porten leser History Gos læringslogg (ikke quiz_progress, som er per kategori)",
  app.includes('HISTORY_GO_LEARNING_LOG_KEY = "hg_learning_log_v1"')
    && app.includes('"quiz_perfect"') && app.includes('"quiz_set_complete"') && app.includes('"quiz_legacy"')
    && app.includes("parentTargetId")
);
check(
  "quiz-porten gjelder kun ekte History Go-steder",
  /const needsQuiz =[\s\S]{0,200}historyGoPlaceIds\.has\(place\.placeId\)/.test(app)
);
// Sikring mot blindvei: mangler læringsloggen, skal porten IKKE håndheves.
check(
  "manglende læringslogg slår AV quiz-porten (ingen blindvei)",
  /function getHistoryGoQuizCompletedPlaceIds\(\)[\s\S]{0,600}return null;/.test(app)
    && app.includes("const quizGateActive = quizCompletedPlaceIds !== null")
);
check(
  "Football Manager skriver aldri til History Gos læringslogg",
  !new RegExp("setItem\\(\\s*HISTORY_GO_LEARNING_LOG_KEY").test(app)
    && !app.includes('setItem("hg_learning_log_v1"')
);
check(
  "quiz-porten er dokumentert",
  existsSync(join(root, "docs/HISTORY_GO_QUIZ_GATE.md"))
);
check(
  "auto-troppen hopper over landslagsarenaer",
  /const candidateIds = new Set\(\);[\s\S]{0,320}if \(isNationalArenaPlace\(place\)\) return;/.test(app)
);
check(
  "auto-troppen tar de jevne klubbspillerne først (stjerner må samles)",
  /const ordered = \[\.\.\.players\][\s\S]{0,260}Number\(a\.overall\)[\s\S]{0,40}Number\(b\.overall\)/.test(app)
);
{
  // Datakontrakt: klubbanleggene må ha nok spillere til en spillbar tropp,
  // ellers blir skillet en blindvei.
  const players = JSON.parse(readFileSync(join(root, "data/football_players.json"), "utf8")).players || [];
  const placeUnlocks = JSON.parse(readFileSync(join(root, "data/football_unlocks.json"), "utf8")).placeUnlocks || [];
  const clubIds = new Set();
  const natIds = new Set();
  for (const place of placeUnlocks) {
    const isNat = String(place?.placeRole || "").includes("national");
    for (const unlock of place?.unlocks || []) {
      if (!String(unlock?.type || "").includes("player")) continue;
      (isNat ? natIds : clubIds).add(unlock.targetId);
    }
  }
  const byId = new Map(players.map((p) => [p.id, p]));
  const posCount = (positions) =>
    [...clubIds].filter((id) => (byId.get(id)?.naturalPositions || []).some((p) => positions.includes(p))).length;
  check("nok klubbspillere til en spillbar tropp (>=15)", clubIds.size >= 15, `klubb-scope=${clubIds.size}`);
  check("klubb-scope har minst 2 keepere", posCount(["GK"]) >= 2, `GK=${posCount(["GK"])}`);
  check("landslagsstjerner finnes som eksklusiv samlebelønning", [...natIds].some((id) => !clubIds.has(id)));
  check(
    "alle spillere er gode (overall 85-100)",
    players.every((p) => Number(p.overall) >= 85 && Number(p.overall) <= 100)
  );
}
check(
  "computeAvailability() trekker inn lokal tropp",
  /getLocalStartPlayerIds\(\)\.forEach/.test(app) ||
    /computeAvailability[\s\S]{0,4000}getLocalStartPlayerIds\(\)/.test(app)
);
// Kjerneprinsipp: lokal start skriver ALDRI til ekte History Go-progresjon.
check(
  "ingen setItem til visited_places / hg_groundhopper_stats",
  !/setItem\(\s*["'`](?:visited_places|hg_groundhopper_stats)/.test(app)
);

// ---- 4) Roster readiness (11/15) -------------------------------------------
stage("4. Roster readiness");
requireHandler("computeRosterReadiness");
requireHandler("getMatchdayReadiness");

// ---- 5) Formasjon / rolle ---------------------------------------------------
stage("5. Formasjon & rolle");
requireId("formationSelect");
requireId("tacticSelect");
requireId("slotPlayerSelect");
requireId("slotRoleSelect");
requireHandler("seedLineupForFormation");
requireHandler("getDefaultRoleForPlayer");
requireHandler("sanitizeLineupForUnlockedPlayers");
requireHandler("sanitizeSelectedFormation");

// ---- 6) Treningsvalg --------------------------------------------------------
stage("6. Treningsvalg");
requireId("trainingPrograms");
requireId("weeklyTrainingOptions");
requireId("advanceTrainingWeek");
requireHandler("selectWeeklyTrainingFocus");
requireHandler("selectWeeklyTrainingProgram");
requireImport("createTrainingProgramCompositions");

// ---- 7) Club Week-faser -----------------------------------------------------
stage("7. Club Week-faser");
requireId("advanceClubWeekPhase");
requireHandler("advanceClubWeekPhaseAction");
requireImport("createInitialClubWeekStateFromBrowser");
requireImport("advanceClubWeekPhaseFromBrowser");
requireHandler("getClubWeekMatchdayGate");
check("ny uke nullstiller ukens trening", /weeklyTrainingFocus\s*=\s*null/.test(app) && /weeklyTrainingProgram\s*=\s*null/.test(app));
check("ny uke ruller mini-sesongen", /advanceMiniSeasonForNewWeek\(\)/.test(app));
// Club Week Orchestrator v1.1: handlingene driver fasen framover (gate-sikkert).
requireHandler("syncClubWeekPhaseToProgress");
requireHandler("clubWeekPhaseTargetFromProgress");
check("fase-synk går aldri forbi kampdag-porten", /if\s*\(getClubWeekMatchdayGate\(\)\.isBlocked\)\s*break;/.test(app));
check("fase-synk stopper på review (ruller ikke til ny uke)", /clubWeekPhaseTargetFromProgress[\s\S]{0,400}return "review";/.test(app));

// ---- 8) Innboks -------------------------------------------------------------
stage("8. Innboks");
requireImport("integrateInboxThreads");
requireImport("applyInboxChoice");
requireHandler("chooseInboxEventChoice");
requireHandler("markInboxEventThreadRead");

// ---- 9) Kamp ----------------------------------------------------------------
stage("9. Kamp");
requireId("playMatchdayButton");
requireId("resetMatchdayButton");
requireHandler("playMatchday");
requireHandler("startMatchdayKickoff");
requireHandler("chooseMatchdayDecision");
requireImport("createMatchdaySession");
requireImport("finalizeMatchdaySession");

// ---- 10) Mini-sesong (5 kamper) --------------------------------------------
stage("10. Mini-sesong");
requireId("startMiniSeasonButton");
requireId("resetMiniSeasonButton");
requireHandler("startMiniSeason");
requireHandler("resetMiniSeason");
requireHandler("advanceMiniSeasonForNewWeek");
requireImport("MINI_SEASON_TOTAL_WEEKS");
requireImport("advanceMiniSeasonWeek");
requireImport("applyMiniSeasonMatchResult");

// ---- 11) State lagres / nullstilles ----------------------------------------
stage("11. State save/reset");
const stores = [
  ["leagueSeason", "saveLeagueSeason", "loadLeagueSeason"],
  ["miniSeason", "saveMiniSeason", "loadMiniSeason"],
  ["matchday", "saveMatchdayState", "loadMatchdayState"],
  ["clubWeekState", "saveClubWeekState", "loadClubWeekState"],
  ["weeklyTrainingFocus", "saveWeeklyTrainingFocus", "loadWeeklyTrainingFocus"],
  ["weeklyTrainingProgram", "saveWeeklyTrainingProgram", "loadWeeklyTrainingProgram"]
];
for (const [name, save, load] of stores) {
  check(`${name}: save+load symmetrisk`, symbolExists(save) && symbolExists(load), `${save}/${load}`);
}
check("reset-sti finnes (localStorage.removeItem)", /localStorage\.removeItem\(/.test(app));
requireHandler("resetMiniSeason");


// ---- 12) Ligaspill før-sesong gate -----------------------------------------
stage("12. Ligaspill før-sesong gate");
check("onboarding bruker valgt stab, ikke bare tilgjengelig stab", app.includes("hiredStaff >= REQUIRED_STAFF_SIZE") && app.includes("Tilgjengelig stab teller først når du faktisk engasjerer dem"));
// Klubbidentitet kommer nå fra klubben spilleren OPPRETTER i onboardingen
// (navn), ikke fra et History Go-stedsanker. Stedsanker er faset ut som
// identitetskilde.
check("klubbidentitet krever opprettet klubb (navn) eller aktiv league-save", app.includes("hasClubIdentity = Boolean(getSavedClubName()) || (isLeagueSeasonActive()"));
check("klubben opprettes i onboardingen med eget navn", app.includes("function bindOnboardingClub") && html.includes('id="onboardingClubName"') && app.includes("selectGameMode(\"league\", managerName ? { clubName, managerName } : { clubName })"));
check("klubbnavn avledes ikke av et History Go-sted", !/function getTemporaryClubName\([\s\S]{0,400}placeName/.test(app));
check("sesongstart bruker eksplisitt league-save/status", app.includes("activeLeagueSaveId") && app.includes("leagueSeasonStatus") && app.includes("isLeagueSeasonActive"));
check("onboarding har egne steg for trening og sesongstart", app.includes('id: "trening"') && app.includes('id: "sesong"'));
check("CTA ruter til konkrete flater", app.includes("activateLeagueOnboardingTarget") && app.includes("#unlockedPlayersList") && app.includes("#availableStaffList") && app.includes("#weeklyTrainingOptions"));
check("kampdag gates av aktiv ligasesong i next-action", readFileSync(join(root, "src/football-next-action.js"), "utf8").includes("(!ctx.leagueModeActive || ctx.leagueSeasonActive)"));
check("league-save-modell får id og norsk status", app.includes("function getLeagueSaveModel") && app.includes("activeLeagueSaveId") && app.includes("Før sesong") && app.includes("Aktiv sesong") && app.includes("Fullført sesong"));
check("klubbidentiteten står i toppen, ikke i en egen boks på Kontor", html.includes('id="headerClubName"') && html.includes('id="headerClubManager"') && app.includes("function renderHeaderClubIdentity"));
// «Klubben din» gjentok tall som allerede sto i managerportalen, klubbuka og
// footeren. Identiteten flyttet til toppen; plassering og styremål til
// Statistikk, ved siden av tabellen de leses av.
check("klubbkortet på Kontor er fjernet", !html.includes('id="leagueClubCard"') && !app.includes("renderLeagueClubCard"));
check("plassering og styremål ligger på Statistikk", html.includes('id="statsStanding"') && html.includes('id="statsBoardGoal"') && app.includes("managerRow.position"));
check("klubbidentiteten viser navn og manager utenfor ligamodus også", app.includes("model.managerName"));
check("klubbkortet har ikke stedsanker eller sesongoppdrag", !html.includes('id="leagueClubAnchor"') && !html.includes("Sesongoppdrag") && !app.includes("Klubbanker / hjemsted"));
check("aktiv save viser ligastatus og terminliste", html.includes("Terminliste og tabell") && app.includes("Neste kamp:") && app.includes("getNextLeagueOpponent(state.leagueSeason)"));
check("nullstilling er namespacet og rydder aldri league-save", app.includes("resetSecondarySession") && !/function resetMiniSeason\(\)[\s\S]{0,300}clearLeagueSaveState/.test(app) && !app.includes("placeUnlocks = []"));

// ---- 13) Landslagsmodus ------------------------------------------------------
// Landslagsspillerne du speider på Ullevaal kan ikke signeres til klubblaget,
// men de er hele poenget med landslagsmodus: der leder du nasjonen du har
// samlet nok spillere fra. Modusen har egen nasjon og tropp, isolert fra klubben.
stage("13. Landslagsmodus");
{
  const modes = readFileSync(join(root, "src/football-mode-sessions.js"), "utf8");
  check(
    "«national» er en registrert modus med egen sesjon",
    /MODES = Object\.freeze\(\[[^\]]*"national"/.test(modes)
      && modes.includes('SESSION_STATE_FIELDS') && /"nationalTeam"/.test(modes)
      && /national: isObject\(sessions\.national\)/.test(modes)
  );
  check(
    "ny landslagssesjon starter uten nasjon, tropp og mesterskap",
    /if \(mode === "national"\) \{[\s\S]{0,400}session\.nationalTeam = \{ nationality: null, squadPlayerIds: \[\] \};[\s\S]{0,200}session\.tournament = null;[\s\S]{0,200}session\.tournamentHistory = \[\];/.test(modes)
  );
}
check(
  "landslagsmodus kan startes fra onboardingen",
  html.includes('data-start-mode="national"')
);
check(
  "landslagsspillere blir tilgjengelige kun i landslagsmodus",
  /if \(isNationalModeActive\(\)\) \{[\s\S]{0,400}nationalOnlyPlayerIds\.forEach/.test(app)
    && app.includes('function isNationalModeActive() {')
);
check(
  "troppen filtreres på valgt nasjon",
  /getNationalTeamNationality\(\)[\s\S]{0,400}nationality !== nationality/.test(app)
);
check(
  "nasjonsvelgeren teller spillerne og krever full tropp",
  app.includes("function getAvailableNations")
    && /playable: record\.ids\.size >= REQUIRED_SQUAD_SIZE/.test(app)
);
// Blindveivakt: landslagsmodus må være spillbar uten History Go-progresjon,
// ellers møter en ny manager et tomt landslag og ingen vei videre.
check(
  "landslaget har en spillbar grunnstamme uten History Go",
  app.includes("function getNationalBasePlayers") && app.includes("function getNationalBasePlayerIds")
    && /getNationalBasePlayerIds\(nationality\)\.forEach/.test(app)
);
check(
  "grunnstammen er grunnsjiktet – stjernene må fortsatt samles",
  /function getNationalBasePlayers\(\)[\s\S]{0,900}Number\(player\.overall\) < NAME_TIER_MIN/.test(app)
);
check(
  "nasjonskortet skiller grunnstamme fra samlede spillere",
  /spillere å velge blant[\s\S]{0,40}samlet i History Go/.test(app)
);
// Blindveivakt: uten nasjoner må panelet forklare hvor man får spillere.
check(
  "tom nasjonsliste forklarer hvordan man samler spillere",
  /Ingen nasjoner er tilgjengelige ennå[\s\S]{0,160}Ullevaal/.test(app)
);
check(
  "«national» er en gyldig spillmodus i gameStartState",
  /\["league", "national", "scenario", "training"\]\.includes\(value\?\.selectedMode\)/.test(app)
);
check(
  "neste handling ber om nasjonsvalg før alt annet i landslagsmodus",
  readFileSync(join(root, "src/football-next-action.js"), "utf8").includes("national-choose-nation")
    && app.includes("nationalModeActive: isNationalModeActive()")
    && app.includes("nationalNationChosen: Boolean(getNationalTeamNationality())")
);
check(
  "landslagspanelet finnes og er skjult utenfor modusen",
  html.includes('id="nationalTeamPanel"') && html.includes('id="nationalNationList"')
    && app.includes("panel.hidden = !isNationalModeActive()")
    && app.includes("renderNationalTeamPanel()")
);
check(
  "landslagsmodus er dokumentert",
  existsSync(join(root, "docs/landslagsmodus.md"))
);
check(
  "nytt nasjonsvalg nullstiller troppen (spillerpoolen endres)",
  /function selectNationalTeamNation\([\s\S]{0,400}state\.nationalTeam = \{ nationality: nation, squadPlayerIds: \[\] \}/.test(app)
);

// ---- 14) Mesterskap (EM/VM) -------------------------------------------------
// Landslaget hadde spillere, men ingenting å spille om. Mesterskapet er det som
// gjør landslagsmodus til et spill: gruppespill, utslagsrunder og en vei som kan
// ta slutt. Motoren er ren; app.js kobler den til kampdagen.
stage("14. Mesterskap (EM/VM)");
check(
  "mesterskapsdata finnes og lastes fra data (ingen nasjoner hardkodet i JS)",
  existsSync(join(root, "data/football_tournaments.json"))
    && app.includes('tournaments: "data/football_tournaments.json"')
    && app.includes("state.tournamentDefinitions")
    && app.includes("state.tournamentNations")
);
check(
  "turneringsmotoren er ren ESM uten DOM/lagring/tilfeldighet",
  (() => {
    // Kommentarene i motoren OMTALER det den ikke gjør («ingen localStorage»),
    // så vi må måle koden – ikke prosaen – for å unngå en falsk alarm.
    const engine = readFileSync(join(root, "src/football-tournament.js"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
    return !/document\.|localStorage|sessionStorage|window\.|fetch\(|Math\.random|Date\.now/.test(engine);
  })()
);
check(
  "app.js bruker motoren, og duplikerer den ikke",
  app.includes("from \"./football-tournament.js\"")
    && app.includes("createTournament(") && app.includes("applyTournamentMatchResult(")
);
check(
  "mesterskapet gir kampdagen motstanderen i landslagsmodus",
  /if \(isNationalModeActive\(\)\) \{\s*\n\s*return getTournamentMatchdayOpponent\(\);/.test(app)
    && app.includes("function getTournamentMatchdayOpponent")
);
check(
  "kampresultatet registreres i mesterskapet",
  /function registerMatchInMiniSeason\(lastMatch\) \{\s*\n\s*if \(isNationalModeActive\(\)\) \{\s*\n\s*registerMatchInTournament\(lastMatch\);/.test(app)
);
check(
  "motstanderen arver en historisk stil-arketype (ikke en generisk bot)",
  /getHistoricalOpponentProfile\(next\.styleProfileId\)/.test(app)
);
check(
  "mesterskapspanelet finnes og er skjult utenfor landslagsmodus",
  html.includes('id="tournamentPanel"') && html.includes('id="tournamentChoices"')
    && html.includes('id="tournamentGroupTable"') && html.includes('id="tournamentBracket"')
    && /panel\.hidden = !isNationalModeActive\(\) \|\| !nationality/.test(app)
);
check(
  "påmelding, gruppetabell, bracket og merittliste rendres",
  app.includes("function renderTournamentPanel")
    && app.includes("createTournamentGroupTable(tournament")
    && app.includes("createTournamentBracket(tournament")
    && html.includes('id="tournamentHistoryList"')
);
// Blindveivakt: nasjonsbytte må ikke etterlate et mesterskap med feil nasjon.
check(
  "nytt nasjonsvalg avslutter et mesterskap som tilhørte forrige nasjon",
  /if \(previous !== nation\) state\.tournament = null;/.test(app)
);
// Blindveivakt: manglende mesterskapsdata skal ikke låse landslagsmodus.
check(
  "manglende mesterskapsdata gir enkeltkamper, ikke en låst modus",
  /loadJson\(DATA_PATHS\.tournaments\)\.catch\(\(\) => null\)/.test(app)
    && app.includes("Landslagsmodus spilles som enkeltkamper")
);
check(
  "du kan trekke laget og melde på igjen",
  html.includes('id="tournamentAbandon"') && app.includes("function abandonTournament")
);
check(
  "neste handling foreslår påmelding når laget er satt",
  readFileSync(join(root, "src/football-next-action.js"), "utf8").includes("national-enter-tournament")
);
check(
  "mesterskapet er dokumentert",
  existsSync(join(root, "docs/mesterskap.md"))
);

// ---- 16) Kampplan: strategi, og bytte underveis -----------------------------
// Kampplanen var fem valg låst før avspark. Nå er den et strategivalg med
// familier, og den kan byttes midt i kampen — med en pris, ellers er byttet
// bare en gratis knapp og ikke en managerbeslutning.
stage("16. Kampplan");
{
  const tactics = JSON.parse(readFileSync(join(root, "data/football_tactics.json"), "utf8"));
  const matchdayEngine = readFileSync(join(root, "src/football-matchday-engine.js"), "utf8");
  const matchPlanEngine = readFileSync(join(root, "src/football-match-plan.js"), "utf8");
  check("kampplankatalogen er utvidet og gruppert", 
    (tactics.tactics || []).length >= 15 && (tactics.families || []).length >= 5,
    `${(tactics.tactics || []).length} planer i ${(tactics.families || []).length} familier`);
  check(
    "planmotoren er ren ESM uten DOM/lagring/tilfeldighet",
    (() => {
      const engine = readFileSync(join(root, "src/football-match-plan.js"), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      return !/document\.|localStorage|sessionStorage|window\.|fetch\(|Math\.random|Date\.now/.test(engine);
    })()
  );
  check(
    "kampdagsmotoren kan bytte plan underveis",
    readFileSync(join(root, "src/football-matchday-engine.js"), "utf8").includes("export function applyMatchPlanChange")
  );
  // Byttet må koste noe, ellers er det ikke en beslutning.
  check(
    "omstillingen koster taktisk klarhet",
    readFileSync(join(root, "src/football-match-plan.js"), "utf8").includes("clarityCost")
      && readFileSync(join(root, "src/football-match-plan.js"), "utf8").includes("calculateSwitchCost")
  );
  // Og byttet må faktisk telle i resultatet, ikke bare stå i loggen.
  // Sjekker INTENSJONEN (planbyttene er med i summeringen), ikke den nøyaktige
  // listen — ellers brekker vakta hver gang en ny beslutningstype legges til,
  // uten at noe faktisk er galt. Innbyttene kom inn i samme kall.
  check(
    "planbytter summeres inn i kampresultatet",
    /sumDecisionEffects\(\[[^\]]*\.\.\.planChanges[^\]]*\]\)/.test(
      readFileSync(join(root, "src/football-matchday-engine.js"), "utf8")
    )
  );
  check(
    "planbytteren finnes i kampflyten",
    app.includes("function appendMatchPlanSwitcher") && app.includes("function switchMatchPlanDuringMatch")
      && app.includes("rankPlansForSituation")
  );
  check(
    "rapporten forteller hva byttet kostet",
    app.includes("function appendMatchPlanChangeLog") && app.includes("Kampplan underveis")
  );
  check(
    "kampbildet leses av kampens gang, ikke av en resultattavle",
    readFileSync(join(root, "src/football-match-plan.js"), "utf8").includes("export function readGameState")
  );
  // Planen du VELGER må telle mot motstanderen fra avspark. Uten dette var
  // planvalget gratis så lenge du lot det stå.
  check(
    "valgt kampplan teller mot motstanderen fra avspark",
    /planMatchup: evaluatePlanVsOpponent\(tactic, matchOpponent\)/.test(matchdayEngine)
      && /planEdge: num\(session\.planMatchup\?\.edge\)/.test(matchdayEngine)
      && matchdayEngine.includes("expectedGoalsFor += num(planEdge)")
  );
  // Motstanderen må svare, ellers holder det å lese kampen riktig én gang.
  check(
    "motstanderen justerer seg etter kampbildet",
    matchdayEngine.includes("export function applyOpponentAdaptation")
      && matchPlanEngine.includes("export function deriveOpponentAdjustment")
      && app.includes("applyOpponentAdaptation(session)")
  );
  check(
    "motstanderens grep vises i kampen og i rapporten",
    app.includes("matchday-opponent-shift") && app.includes("function appendOpponentAdjustmentLog")
  );
  // Å rette opp et dårlig kampbilde må lønne seg, ellers er byttet bare en straff.
  check(
    "planbytte belønnes for FORBEDRING, ikke bare for å passe",
    matchPlanEngine.includes("export function scorePlanNow")
      && matchPlanEngine.includes("const improvement =")
      && matchPlanEngine.includes("rescueBonus")
  );
  // Ekte løpende stilling: kampen spilles periode for periode, og
  // sluttresultatet ER stillingen manageren så underveis.
  check(
    "kampen har en løpende stilling (kampklokke)",
    matchdayEngine.includes("export function advanceMatchClock")
      && /score: \{ for: 0, against: 0 \}/.test(matchdayEngine)
      && matchdayEngine.includes("timeline: []")
  );
  check(
    "sluttresultatet er stillingen, ikke et nytt terningkast",
    matchdayEngine.includes("const playedByClock = timeline.length > 0")
      && /playedByClock \? num\(session\.score\?\.for\)/.test(matchdayEngine)
  );
  // Kallstedene ALENE er ikke nok: `advanceMatchClock(session)` sto tre steder
  // i app.js uten at funksjonen var importert. Modulen parset fint, men kallet
  // kastet ReferenceError i nettleseren og kampen startet aldri. Krev derfor at
  // hver motor-API app.js bruker faktisk er importert.
  check(
    "klokka går ved avspark og etter hvert grep",
    (app.match(/advanceMatchClock\(session\)/g) || []).length >= 3
  );
  ["advanceMatchClock", "applyMatchPlanChange", "applyOpponentAdaptation"].forEach((name) => {
    check(`${name} er importert i app.js`, importedNames.has(name));
  });
  check(
    "kampbildet leser den ekte stillingen",
    matchPlanEngine.includes("const played = asArray(session?.timeline).length > 0")
      && matchPlanEngine.includes("scoreKnown")
  );
  check(
    "stillingen vises i kampen",
    app.includes("function appendMatchScoreboard") && app.includes("matchday-scoreboard")
  );
  // Minutt for minutt: fire perioder var fire tall, ikke en kamp.
  check(
    "kampen logges minutt for minutt",
    matchdayEngine.includes("minuteLog: []")
      && matchdayEngine.includes("function buildChances")
      && matchdayEngine.includes("export function logMatchMoment")
  );
  check(
    "målene faller ut av sjansene",
    /const goalsFor = chances\.filter\(\(c\) => c\.side === "for" && c\.scored\)\.length/.test(matchdayEngine)
  );
  check(
    "grep, planbytte og motstanderens svar står i samme spor",
    app.includes('type: "decision"') && matchdayEngine.includes('type: "plan"')
      && matchdayEngine.includes('type: "opponent"')
  );
  check(
    "minuttloggen vises i kampen og i rapporten",
    app.includes("function appendMatchMinuteLog") && app.includes("Kampen minutt for minutt")
  );
  check("logMatchMoment er importert i app.js", importedNames.has("logMatchMoment"));

  // Live-avspilling: kampen skal kunne SES mens den spilles, ikke bare leses
  // etterpå. Perioden er avgjort i motoren; UI-et avdekker den minutt for minutt.
  check(
    "sesjonen holder styr på hvor langt kampen er sett",
    matchdayEngine.includes("liveMinute: 0")
      && /range,/.test(matchdayEngine)
  );
  check(
    "avspillingen kan startes, pauses og hoppes over",
    app.includes("function startMatchLive") && app.includes("function stopMatchLive")
      && app.includes("function skipMatchLive") && app.includes("function toggleMatchLive")
  );
  // Blindveivakt: en usynlig timer som tikker videre etter at du har forlatt
  // kampflaten ville skrevet til en sesjon ingen ser.
  check(
    "klokka stoppes når man forlater kampen eller nullstiller",
    /if \(target !== "kamp"\) stopMatchLive\(\);/.test(app)
      && /function resetMatchday\(\) \{[\s\S]{0,200}stopMatchLive\(\);/.test(app)
  );
  // Stillingen må følge avspillingen, ellers avslører tavla målet før du ser det.
  check(
    "stillingen følger avspillingen, ikke fasiten",
    app.includes("function visibleScore") && app.includes("function visibleMinuteLog")
      && /const score = visibleScore\(session\);/.test(app)
  );
  // Beslutningen skal ikke kunne tas i et minutt du ikke har sett.
  check(
    "grepet åpner først når perioden er spilt av",
    /const periodSeen = Number\(session\.liveMinute\) >= currentPeriodEndMinute\(session\)/.test(app)
      && app.includes("button.disabled = !periodSeen")
  );
  check(
    "kampplanene er dokumentert",
    existsSync(join(root, "docs/kampplaner.md"))
  );
}

// ---- Rapport ----------------------------------------------------------------

const failed = results.filter((r) => !r.ok);
const byStage = new Map();
for (const r of results) {
  if (!byStage.has(r.stage)) byStage.set(r.stage, []);
  byStage.get(r.stage).push(r);
}

console.log("Flow-audit: spilløkka fra app-start til mini-sesong\n");
for (const [stageName, items] of byStage) {
  const stageFailed = items.filter((i) => !i.ok).length;
  console.log(`${stageFailed === 0 ? "✓" : "✗"} ${stageName}`);
  for (const item of items) {
    if (item.ok) continue;
    console.log(`    ✗ ${item.label}${item.detail ? ` (${item.detail})` : ""}`);
  }
}

console.log(`\n${results.length - failed.length}/${results.length} sjekker bestått.`);

if (failed.length > 0) {
  console.error(`\n✗ Flow-audit feilet: ${failed.length} brutt(e) ledd i spilløkka.`);
  process.exit(1);
}

console.log("\n✓ Flow-audit OK: alle ledd i spilløkka er på plass og wiret.");
process.exit(0);
