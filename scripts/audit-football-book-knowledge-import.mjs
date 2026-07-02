// scripts/audit-football-book-knowledge-import.mjs
// Validates the split Fotballboka knowledge import without touching the tactics engine.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const indexPath = join(root, "data", "football_book_knowledge_principles.json");
const expectedIndexSchema = "historygo-football-manager.football-book-knowledge-index.v1";
const expectedChunkSchema = "historygo-football-manager.football-book-knowledge-principles.v1";
const validCategories = new Set(["keeper", "forsvar", "press", "bredde", "dybde", "oppbygging", "midtbanekontroll", "angrepsstruktur", "restforsvar", "rolleforståelse", "kampanalyse", "treningsmetodikk"]);
const validPhases = new Set(["attack", "defence", "transition", "set_piece", "general"]);
const requiredFields = ["id", "title", "category", "phase", "summary", "appliesToWeakPoints", "appliesToTrainingAreas", "relatedTags", "coachAdvice", "trainingSession", "tooltipText", "assistantText", "trainingText", "matchReportText", "handbookText"];
const gameTextFields = ["tooltipText", "assistantText", "trainingText", "matchReportText", "handbookText"];
const errors = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${path}: ${error.message}`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePrinciple(principle, sourceFile, seenIds) {
  const id = principle && principle.id ? principle.id : "<missing id>";
  for (const field of requiredFields) {
    if (!(field in principle)) errors.push(`${sourceFile}:${id}: mangler ${field}`);
  }
  if (!/^[a-z][a-z0-9_]*$/.test(id)) errors.push(`${sourceFile}:${id}: ugyldig id-format`);
  if (seenIds.has(id)) errors.push(`${sourceFile}:${id}: duplikat id`);
  seenIds.add(id);
  if (!validCategories.has(principle.category)) errors.push(`${sourceFile}:${id}: ugyldig category ${principle.category}`);
  if (!validPhases.has(principle.phase)) errors.push(`${sourceFile}:${id}: ugyldig phase ${principle.phase}`);
  for (const field of ["title", "summary", "coachAdvice", "trainingSession", ...gameTextFields]) {
    if (!isNonEmptyString(principle[field])) errors.push(`${sourceFile}:${id}: ${field} må være tekst`);
  }
  if (isNonEmptyString(principle.tooltipText) && principle.tooltipText.split(/[.!?]+/).filter(Boolean).length > 2) {
    errors.push(`${sourceFile}:${id}: tooltipText skal være 1-2 korte setninger`);
  }
  for (const field of ["appliesToWeakPoints", "appliesToTrainingAreas", "relatedTags"]) {
    if (!Array.isArray(principle[field])) errors.push(`${sourceFile}:${id}: ${field} må være array`);
  }
}

const index = readJson(indexPath);
const seenIds = new Set();
let principleCount = 0;

if (index) {
  if (index.schema !== expectedIndexSchema) errors.push(`index: feil schema ${index.schema}`);
  if (!Array.isArray(index.files)) errors.push("index: files må være array");
  for (const file of index.files || []) {
    const chunk = readJson(join(root, file));
    if (!chunk) continue;
    if (chunk.schema !== expectedChunkSchema) errors.push(`${file}: feil schema ${chunk.schema}`);
    if (!Array.isArray(chunk.principles)) errors.push(`${file}: principles må være array`);
    for (const principle of chunk.principles || []) {
      principleCount += 1;
      validatePrinciple(principle, file, seenIds);
    }
  }
  if (principleCount !== index.principlesCount) {
    errors.push(`index: principlesCount=${index.principlesCount}, faktisk=${principleCount}`);
  }
}

console.log("Fotballboka Knowledge Import Audit");
console.log(`Principles: ${principleCount}`);

if (errors.length) {
  console.error("Errors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK");
