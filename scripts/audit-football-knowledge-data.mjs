// scripts/audit-football-knowledge-data.mjs

/**
 * Data-audit for Football Knowledge Engine.
 *
 * Kontrollerer at data/football_knowledge_principles.json er trygg å bygge
 * videre på: gyldig schema, unike IDs, riktige felter, gyldige category-/
 * phase-verdier, ikke-tomme tekster og array-felter.
 *
 * Dette er et rent Node-script (standardbibliotek, ingen dependencies). Det
 * rører ikke TypeScript-engine, UI-filer eller scorelogikk, og legger ingen
 * audit-logikk inn i browser-runtime.
 *
 * Exit code 1 hvis det finnes errors, ellers 0. Warnings feiler ikke build.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "football_knowledge_principles.json");
const DATA_LABEL = "data/football_knowledge_principles.json";

const EXPECTED_SCHEMA = "historygo-football-manager.knowledge-principles.v1";

const VALID_CATEGORIES = new Set([
  "keeper",
  "forsvar",
  "press",
  "bredde",
  "dybde",
  "oppbygging",
  "midtbanekontroll",
  "angrepsstruktur",
  "restforsvar",
  "rolleforståelse",
  "kampanalyse",
  "treningsmetodikk",
]);

const VALID_PHASES = new Set([
  "attack",
  "defence",
  "transition",
  "set_piece",
  "general",
]);

const REQUIRED_FIELDS = [
  "id",
  "title",
  "category",
  "phase",
  "summary",
  "appliesToWeakPoints",
  "appliesToTrainingAreas",
  "relatedTags",
  "coachAdvice",
  "trainingSession",
];

const STRING_FIELDS = ["id", "title", "category", "phase", "summary", "coachAdvice", "trainingSession"];
const ARRAY_FIELDS = ["appliesToWeakPoints", "appliesToTrainingAreas", "relatedTags"];

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;

const SUMMARY_MIN_LENGTH = 80;
const COACH_ADVICE_MIN_LENGTH = 40;
const TRAINING_SESSION_MIN_LENGTH = 40;

const errors = [];
const warnings = [];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Beskriver et principle for feilmeldinger, selv når id mangler. */
function principleLabel(principle, index) {
  if (isPlainObject(principle) && isNonEmptyString(principle.id)) {
    return `principle[${index}] (id="${principle.id}")`;
  }
  return `principle[${index}]`;
}

function validateStringField(principle, index, field, label) {
  if (!isNonEmptyString(principle[field])) {
    errors.push(`${label}: "${field}" må være en ikke-tom string.`);
    return false;
  }
  return true;
}

function validateArrayField(principle, index, field, label) {
  const value = principle[field];
  if (!Array.isArray(value)) {
    errors.push(`${label}: "${field}" må være en array.`);
    return false;
  }
  for (const [i, item] of value.entries()) {
    if (!isNonEmptyString(item)) {
      errors.push(`${label}: "${field}[${i}]" må være en ikke-tom string.`);
    }
  }
  return true;
}

function validatePrinciple(principle, index, seenIds) {
  const label = principleLabel(principle, index);

  if (!isPlainObject(principle)) {
    errors.push(`${label}: må være et objekt.`);
    return;
  }

  // Manglende felter.
  for (const field of REQUIRED_FIELDS) {
    if (!(field in principle)) {
      errors.push(`${label}: mangler påkrevd felt "${field}".`);
    }
  }

  // Ukjente ekstra felter.
  for (const field of Object.keys(principle)) {
    if (!REQUIRED_FIELDS.includes(field)) {
      errors.push(`${label}: ukjent ekstra felt "${field}".`);
    }
  }

  // String-felter.
  for (const field of STRING_FIELDS) {
    if (field in principle) {
      validateStringField(principle, index, field, label);
    }
  }

  // category / phase mot gyldige verdier (kun hvis det er en string i det hele tatt).
  if (typeof principle.category === "string" && !VALID_CATEGORIES.has(principle.category)) {
    errors.push(`${label}: "category" har ugyldig verdi "${principle.category}".`);
  }
  if (typeof principle.phase === "string" && !VALID_PHASES.has(principle.phase)) {
    errors.push(`${label}: "phase" har ugyldig verdi "${principle.phase}".`);
  }

  // Array-felter.
  const arraysOk = {};
  for (const field of ARRAY_FIELDS) {
    arraysOk[field] = field in principle ? validateArrayField(principle, index, field, label) : false;
  }

  // id-format og duplikater.
  if (isNonEmptyString(principle.id)) {
    if (!ID_PATTERN.test(principle.id)) {
      errors.push(`${label}: "id" følger ikke snake_case-format (${ID_PATTERN}).`);
    }
    if (seenIds.has(principle.id)) {
      errors.push(`${label}: "id" er duplikat av en tidligere id.`);
    } else {
      seenIds.add(principle.id);
    }
  }

  // --- Warnings (feiler ikke build) ---

  if (isNonEmptyString(principle.summary) && principle.summary.length < SUMMARY_MIN_LENGTH) {
    warnings.push(`${label}: "summary" er kort (${principle.summary.length} < ${SUMMARY_MIN_LENGTH} tegn).`);
  }
  if (isNonEmptyString(principle.coachAdvice) && principle.coachAdvice.length < COACH_ADVICE_MIN_LENGTH) {
    warnings.push(`${label}: "coachAdvice" er kort (${principle.coachAdvice.length} < ${COACH_ADVICE_MIN_LENGTH} tegn).`);
  }
  if (isNonEmptyString(principle.trainingSession) && principle.trainingSession.length < TRAINING_SESSION_MIN_LENGTH) {
    warnings.push(`${label}: "trainingSession" er kort (${principle.trainingSession.length} < ${TRAINING_SESSION_MIN_LENGTH} tegn).`);
  }

  const weakEmpty = arraysOk.appliesToWeakPoints && principle.appliesToWeakPoints.length === 0;
  const trainingEmpty = arraysOk.appliesToTrainingAreas && principle.appliesToTrainingAreas.length === 0;

  if (weakEmpty) {
    warnings.push(`${label}: "appliesToWeakPoints" er tom.`);
  }
  if (trainingEmpty) {
    warnings.push(`${label}: "appliesToTrainingAreas" er tom.`);
  }
  if (arraysOk.relatedTags && principle.relatedTags.length === 0) {
    warnings.push(`${label}: "relatedTags" er tom.`);
  }
  if (arraysOk.relatedTags && principle.relatedTags.length > 0) {
    const seenTags = new Set();
    const dupTags = new Set();
    for (const tag of principle.relatedTags) {
      if (typeof tag === "string") {
        if (seenTags.has(tag)) dupTags.add(tag);
        else seenTags.add(tag);
      }
    }
    if (dupTags.size > 0) {
      warnings.push(`${label}: "relatedTags" har duplikater: ${[...dupTags].join(", ")}.`);
    }
  }

  // Prinsipp som verken matcher weakPoints eller trainingAreas.
  if (weakEmpty && trainingEmpty) {
    warnings.push(`${label}: matcher verken weakPoints eller trainingAreas (begge arrays er tomme).`);
  }
}

function main() {
  let principleCount = 0;

  let raw;
  try {
    raw = readFileSync(DATA_PATH, "utf8");
  } catch (err) {
    errors.push(`Kunne ikke lese datafil: ${err.message}`);
  }

  let data;
  if (raw !== undefined) {
    try {
      data = JSON.parse(raw);
    } catch (err) {
      errors.push(`Ugyldig JSON: ${err.message}`);
    }
  }

  if (data !== undefined) {
    if (!isPlainObject(data)) {
      errors.push('Toppnivå må være et objekt.');
    } else {
      if (data.schema !== EXPECTED_SCHEMA) {
        errors.push(`Feil "schema": forventet "${EXPECTED_SCHEMA}", fikk ${JSON.stringify(data.schema)}.`);
      }
      if (typeof data.version !== "number") {
        errors.push(`"version" må være et tall, fikk ${JSON.stringify(data.version)}.`);
      }
      if (!Array.isArray(data.principles)) {
        errors.push('"principles" må være en array.');
      } else {
        principleCount = data.principles.length;
        const seenIds = new Set();
        data.principles.forEach((principle, index) => {
          validatePrinciple(principle, index, seenIds);
        });
      }
    }
  }

  // --- Rapport ---
  const lines = [];
  lines.push("Football Knowledge Data Audit");
  lines.push(`File: ${DATA_LABEL}`);
  lines.push(`Principles: ${principleCount}`);
  lines.push("");

  if (errors.length === 0 && warnings.length === 0) {
    lines.push("Errors: 0");
    lines.push("Warnings: 0");
    lines.push("Result: PASS");
    console.log(lines.join("\n"));
    process.exit(0);
  }

  lines.push(`Errors:${errors.length === 0 ? " 0" : ""}`);
  for (const error of errors) {
    lines.push(`- ${error}`);
  }
  lines.push("");
  lines.push(`Warnings:${warnings.length === 0 ? " 0" : ""}`);
  for (const warning of warnings) {
    lines.push(`- ${warning}`);
  }
  lines.push("");
  lines.push("Result:");
  lines.push(errors.length > 0 ? "FAIL" : "PASS");

  console.log(lines.join("\n"));
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
