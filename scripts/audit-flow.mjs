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

import { readFileSync } from "node:fs";
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

// ---- 3) Lokal starttropp ----------------------------------------------------
stage("3. Lokal starttropp");
requireId("activateLocalStart");
requireId("clearLocalStart");
requireId("activatePublicPlaceStart");
requireHandler("getLocalStartPlayerIds");
requireHandler("clearLocalStartSquad");
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
check("klubbidentitet krever eksplisitt klubbanker eller aktiv league-save", app.includes("hasClubIdentity = hasPublicStart || (isLeagueSeasonActive()"));
check("sesongstart bruker eksplisitt league-save/status", app.includes("activeLeagueSaveId") && app.includes("leagueSeasonStatus") && app.includes("isLeagueSeasonActive"));
check("onboarding har egne steg for trening og sesongstart", app.includes('id: "trening"') && app.includes('id: "sesong"'));
check("CTA ruter til konkrete flater", app.includes("activateLeagueOnboardingTarget") && app.includes("#unlockedPlayersList") && app.includes("#availableStaffList") && app.includes("#weeklyTrainingOptions"));
check("kampdag gates av aktiv ligasesong i next-action", readFileSync(join(root, "src/football-next-action.js"), "utf8").includes("(!ctx.leagueModeActive || ctx.leagueSeasonActive)"));
check("league-save-modell får id og norsk status", app.includes("function getLeagueSaveModel") && app.includes("activeLeagueSaveId") && app.includes("Før sesong") && app.includes("Aktiv sesong") && app.includes("Fullført sesong"));
check("klubbkort vises i ligamodus", html.includes('id="leagueClubCard"') && app.includes("renderLeagueClubCard(teamFit)") && app.includes("card.hidden = !isLeagueModeActive()"));
check("klubbkort viser klubbanker", html.includes('id="leagueClubAnchor"') && app.includes("Klubbanker / hjemsted") && app.includes("model.placeName"));
check("aktiv save viser ligastatus og terminliste", html.includes("Terminliste og tabell") && app.includes("Neste kamp:") && app.includes("getNextLeagueOpponent(state.leagueSeason)"));
check("nullstilling er namespacet og rydder aldri league-save", app.includes("resetSecondarySession") && !/function resetMiniSeason\(\)[\s\S]{0,300}clearLeagueSaveState/.test(app) && !app.includes("placeUnlocks = []"));

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
