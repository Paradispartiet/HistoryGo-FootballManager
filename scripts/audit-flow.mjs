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
const shellElements = readFileSync(join(root, "src/ui/manager-shell-elements.js"), "utf8");

// ---- Hjelpere ---------------------------------------------------------------

const htmlIds = new Set();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) htmlIds.add(match[1]);

const tabTargets = new Set();
for (const match of html.matchAll(/data-tab-target="([^"]+)"/g)) tabTargets.add(match[1]);

const tabSections = new Set();
for (const match of html.matchAll(/<[^>]*data-tab-section="([^"]+)"[^>]*>/g)) {
  if (!/\bdata-shell-hidden\b/.test(match[0])) tabSections.add(match[1]);
}

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
  /const ordered = \[\.\.\.players\][\s\S]{0,260}Number\(a\.classHeight\)[\s\S]{0,40}Number\(b\.classHeight\)/.test(app)
);
{
  // Datakontrakt: klubbanleggene må ha nok spillere til en spillbar tropp,
  // ellers blir skillet en blindvei.
  const playersData = JSON.parse(readFileSync(join(root, "data/football_players.json"), "utf8"));
  const players = playersData.players || [];
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
  // Båndet er ikke lenger 85–100. Spillerne er tiered på ekte nivå, så en solid
  // toppdivisjonsspiller ligger rundt 79 og bare de aller største når 99.
  // Grensene leses av nivåtabellen i dataene — en hardkodet grense her ville
  // drevet fra den, og det var nettopp det som skjedde.
  const tiers = Object.values(playersData.classTiers || {});
  const bandLow = Math.min(...tiers.map((tier) => tier.min));
  const bandHigh = Math.max(...tiers.map((tier) => tier.max));
  check("nivåtabellen finnes i spillerdataene", tiers.length >= 5, String(tiers.length));
  check(
    `alle spillere ligger i nivåbåndet (${bandLow}-${bandHigh})`,
    players.every((p) => Number(p.classHeight) >= bandLow && Number(p.classHeight) <= bandHigh)
  );
  // Og det var poenget med båndet i utgangspunktet: ingen spiller er dårlig.
  check("ingen spiller ligger under bredde-nivået",
    players.every((p) => Number(p.classHeight) >= 75));
}
check(
  "computeAvailability() trekker inn lokal tropp",
  app.includes("const localStartPlayerIds = getLocalStartPlayerIds();")
    && app.includes("localStartPlayerIds.forEach((playerId) =>")
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
requireId("lineupPlayerChoices");
requireId("lineupRoleChoices");
check("gamle spiller-/rolle-selecter er fjernet", !html.includes('id="slotPlayerSelect"') && !html.includes('id="slotRoleSelect"'));
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
  ["clubWeek", "saveClubWeek", "loadClubWeek"],
  ["trainingState", "saveTrainingState", "loadTrainingState"],
  ["individualTraining", "saveIndividualTraining", "loadIndividualTraining"],
  ["inboxState", "saveInboxState", "loadInboxState"],
  ["staffState", "saveStaffState", "loadStaffState"],
  ["playerCondition", "savePlayerCondition", "loadPlayerCondition"],
  ["playerSeasonStats", "savePlayerSeasonStats", "loadPlayerSeasonStats"]
];
for (const [store, save, load] of stores) {
  check(`${store}: ${save}() finnes`, symbolExists(save));
  check(`${store}: ${load}() finnes`, symbolExists(load));
  check(`${store}: ${save}() er wiret`, wired(save), `forekomster=${occurrences(save)}`);
  check(`${store}: ${load}() er wiret`, wired(load), `forekomster=${occurrences(load)}`);
}
check("manager shell-elements er lastet", shellElements.includes("managerShellElements"));

// ---- Rapport ---------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
for (const result of results) {
  const mark = result.ok ? "✓" : "✗";
  const detail = result.detail ? ` — ${result.detail}` : "";
  console.log(`${mark} [${result.stage}] ${result.label}${detail}`);
}
if (failed.length) {
  console.error(`\n✗ Flow-audit: ${failed.length}/${results.length} feil.`);
  process.exit(1);
}
console.log(`\n✓ Flow-audit: ${results.length}/${results.length} PASS`);
