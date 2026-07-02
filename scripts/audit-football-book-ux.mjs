// scripts/audit-football-book-ux.mjs
// QA for Fotballboka game-text surfaces: relevant matches only, concise help, and safe fallback.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getFootballBookGameText } from "../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const indexPath = join(root, "data", "football_book_knowledge_principles.json");

const scenarios = [
  { code: "pressing_coherence_weak", trainingArea: "Press" },
  { code: "defensive_balance_weak", trainingArea: "Restforsvar" },
  { code: "attacking_balance_weak", trainingArea: "Angrepsstruktur" },
  { code: "midfield_control_weak", trainingArea: "Midtbanekontroll" },
  { code: "average_role_fit_weak", trainingArea: "Rolleforståelse" },
];

const actionWords = ["tren", "juster", "bruk", "velg", "flytt", "gi", "gjør", "sørg", "koble", "start", "avklar", "reduser", "øk", "hold", "la "];
const errors = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadPrinciples() {
  const index = readJson(indexPath);
  return index.files.flatMap((file) => readJson(join(root, file)).principles || []);
}

function words(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean);
}

function hasAction(text) {
  const normalized = String(text || "").toLowerCase();
  return actionWords.some((word) => normalized.includes(word));
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

const principles = loadPrinciples();

for (const scenario of scenarios) {
  const base = { principles, weakPoints: [scenario.code], maxResults: 1 };
  const assistant = getFootballBookGameText({ ...base, surface: "assistant" })[0];
  check(assistant, `${scenario.code}: assistant mangler Fotballboka-match`);
  if (assistant) {
    check(assistant.matchType === "weakPoint", `${scenario.code}: assistant matcher ${assistant.matchType}, ikke weakPoint`);
    check(words(assistant.text).length <= 28, `${scenario.code}: assistantText er for lang (${words(assistant.text).length} ord)`);
    check(hasAction(assistant.text), `${scenario.code}: assistantText peker ikke tydelig til neste handling`);
  }

  const training = getFootballBookGameText({
    principles,
    weakPoints: [scenario.code],
    trainingAreas: [scenario.trainingArea],
    surface: "training",
    maxResults: 1,
  })[0];
  check(training, `${scenario.code}: training mangler Fotballboka-match`);
  if (training) {
    check(["weakPoint", "trainingArea"].includes(training.matchType), `${scenario.code}: training matcher uventet ${training.matchType}`);
    check(words(training.text).length <= 34, `${scenario.code}: trainingText er for lang (${words(training.text).length} ord)`);
    check(hasAction(training.text), `${scenario.code}: trainingText forklarer ikke anvendbar økt`);
  }

  const report = getFootballBookGameText({ ...base, surface: "matchReport" })[0];
  check(report, `${scenario.code}: matchReport mangler Fotballboka-match`);
  if (report) {
    check(report.matchType === "weakPoint", `${scenario.code}: matchReport matcher ${report.matchType}, ikke weakPoint`);
    check(words(report.text).length <= 34, `${scenario.code}: matchReportText er for lang (${words(report.text).length} ord)`);
  }

  const tooltip = getFootballBookGameText({ ...base, surface: "tooltip" })[0];
  check(tooltip, `${scenario.code}: tooltip mangler Fotballboka-match`);
  if (tooltip) {
    check(words(tooltip.text).length <= 18, `${scenario.code}: tooltipText er for lang (${words(tooltip.text).length} ord)`);
  }

  const handbook = getFootballBookGameText({ ...base, surface: "handbook", maxResults: 2 });
  check(handbook.length > 0 && handbook.length <= 2, `${scenario.code}: handbook skal være sekundær og begrenset`);
}

const noMatchBase = {
  principles,
  weakPoints: ["no_matching_weak_point"],
  trainingAreas: ["Restforsvar"],
  relatedTags: ["tilfeldig teori"],
  maxResults: 1,
};
for (const surface of ["assistant", "training", "matchReport", "tooltip", "handbook"]) {
  const matches = getFootballBookGameText({ ...noMatchBase, surface });
  check(matches.length === 0, `no_matching_weak_point: ${surface} viser Fotballboka-tekst uten match`);
}

const mismatchedTraining = getFootballBookGameText({
  principles,
  weakPoints: ["pressing_coherence_weak"],
  trainingAreas: ["Keeper"],
  surface: "training",
  maxResults: 1,
});
check(
  mismatchedTraining.length === 0,
  "training: viser Fotballboka-tekst når weakPoint og eksisterende training area peker i ulike retninger",
);

console.log("Fotballboka UX QA Audit");
console.log(`Principles: ${principles.length}`);
console.log(`Scenarios: ${scenarios.map((scenario) => scenario.code).join(", ")}, no_matching_weak_point`);

if (errors.length) {
  console.error("Errors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK");
