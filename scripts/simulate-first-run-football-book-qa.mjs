#!/usr/bin/env node
// First Run QA with Fotballboka enabled.
// Verifies that the first playable loop remains league-first while the
// knowledge layer only explains matching engine signals on existing surfaces.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeNextActions } from "../src/football-next-action.js";
import { getFootballBookGameText } from "../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const errors = [];
const check = (label, ok) => { if (!ok) errors.push(label); };
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const words = (text) => String(text || "").trim().split(/\s+/).filter(Boolean);

const principles = readJson("data/football_book_knowledge_principles.json")
  .files.flatMap((file) => readJson(file).principles || []);

const baseLeague = {
  hasSession: false,
  opponentName: null,
  roster: { enoughUnlocked: true, enoughBench: true, unlockedCount: 15 },
  lineup: { totalSlots: 11, emptyCount: 0, firstEmptySlotId: null, misused: null, duplicate: null },
  clubWeekGate: { isBlocked: false, reason: "" },
  hasTrainingChoice: false,
  matchdayReady: true,
  unreadThreads: 0,
  hasUnseenReport: false,
  miniSeasonActive: false,
  scenarioModeActive: false,
  clubWeek: { week: 1, phase: "training", phaseLabel: "Trening" },
  firstTime: { active: true, started: false, completed: false },
};

const titles = (ctx) => computeNextActions(ctx).map((action) => action.title);
const primary = (ctx) => computeNextActions(ctx)[0];

check("standard first run starts with league training, not scenario", primary(baseLeague)?.title === "Velg treningsprogram");
check("league first run does not expose Ajax scenario as next action", !titles(baseLeague).includes("Start Ajax 1971–73-scenario"));
check("scenario remains optional when explicitly selected", titles({ ...baseLeague, scenarioModeActive: true }).includes("Start Ajax 1971–73-scenario"));
check("first-time player without enough players is routed to playable squad", primary({ ...baseLeague, roster: { enoughUnlocked: false, enoughBench: false, unlockedCount: 0 }, lineup: { ...baseLeague.lineup, emptyCount: 11, firstEmptySlotId: "GK" } })?.title === "Skaff spillbar tropp");
check("local/public start with 15 players routes to team setup", primary({ ...baseLeague, roster: { enoughUnlocked: true, enoughBench: false, unlockedCount: 15 }, lineup: { ...baseLeague.lineup, emptyCount: 11, firstEmptySlotId: "GK" } })?.title === "Sett opp laget");
check("after match report points to next week", primary({ ...baseLeague, hasTrainingChoice: true, hasUnseenReport: false, clubWeek: { week: 1, phase: "review", phaseLabel: "Oppsummering" } })?.title === "Gå til neste uke");

const weakPointScenarios = [
  ["pressing_coherence_weak", "Press"],
  ["defensive_balance_weak", "Restforsvar"],
  ["attacking_balance_weak", "Angrepsstruktur"],
  ["midfield_control_weak", "Midtbanekontroll"],
];
for (const [weakPoint, trainingArea] of weakPointScenarios) {
  const assistant = getFootballBookGameText({ principles, weakPoints: [weakPoint], surface: "assistant", maxResults: 1 })[0];
  const training = getFootballBookGameText({ principles, weakPoints: [weakPoint], trainingAreas: [trainingArea], surface: "training", maxResults: 1 })[0];
  const report = getFootballBookGameText({ principles, weakPoints: [weakPoint], surface: "matchReport", maxResults: 1 })[0];
  const tooltip = getFootballBookGameText({ principles, weakPoints: [weakPoint], surface: "tooltip", maxResults: 1 })[0];
  check(`${weakPoint}: assistant uses matching weak point`, assistant?.matchType === "weakPoint" && words(assistant.text).length <= 28);
  check(`${weakPoint}: training explains matching session`, training && ["weakPoint", "trainingArea"].includes(training.matchType) && words(training.text).length <= 34);
  check(`${weakPoint}: match report stays concise`, report?.matchType === "weakPoint" && words(report.text).length <= 34);
  check(`${weakPoint}: tooltip stays short`, tooltip && words(tooltip.text).length <= 18);
}

const noMatchSurfaces = ["assistant", "training", "matchReport", "tooltip", "handbook"];
for (const surface of noMatchSurfaces) {
  const result = getFootballBookGameText({ principles, weakPoints: ["no_matching_weak_point"], trainingAreas: ["Ikke relevant"], surface, maxResults: 1 });
  check(`no match fallback stays quiet on ${surface}`, result.length === 0);
}

for (const weakPoint of ["defensive_line_exposed", "attacking_width_missing", "pressing_coherence_weak", "team_cohesion_strong"]) {
  const result = getFootballBookGameText({ principles, weakPoints: [weakPoint], surface: "matchReport", maxResults: 2 });
  check(`${weakPoint}: report has no long book dump`, result.length <= 2 && result.every((item) => words(item.text).length <= 34));
}

const indexHtml = readFileSync(join(root, "index.html"), "utf8");
check("Fotballboka is not its own main nav tab", !/data-tab-target=["'](?:footballBook|fotballboka|book)["']/i.test(indexHtml));

console.log("First Run Fotballboka QA");
console.log(`Principles: ${principles.length}`);
console.log(`Weak point scenarios: ${weakPointScenarios.map(([code]) => code).join(", ")}`);
if (errors.length) {
  console.error("Errors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("OK");
