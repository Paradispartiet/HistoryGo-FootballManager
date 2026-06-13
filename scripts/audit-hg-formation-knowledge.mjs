// scripts/audit-hg-formation-knowledge.mjs
//
// Data-audit for Formation Knowledge Engine (kunnskapslaget).
//
// Validerer data/hgFootball/formationKnowledge.json mot:
//   - gyldig schema/version og selvbeskrivende vocab,
//   - at hver formationId finnes i formations.json (og er unik),
//   - at strongAgainst/weakAgainst kun bruker tokens fra vocab.opponentStyles,
//     og at ingen stil er både strong og weak,
//   - at parameterProfile dekker alle akser i vocab.parameterAxes med gyldige
//     verdier (og ingen ukjente akser),
//   - at trainingLinks peker på ekte badge-familier i football_training_badges.json,
//   - at requiredConditions/tacticalRisks/summary er ikke-tomme,
//   - (warning) at doc-filen finnes, og (warning) hvilke formasjoner som ennå
//     mangler et kunnskapsoppslag (additiv dekning – feiler ikke).
//
// Rent Node-script (standardbibliotek, ingen dependencies). Rører ikke motor,
// UI eller scorelogikk. Exit code 1 hvis errors, ellers 0. Warnings feiler ikke.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const KNOWLEDGE_REL = "data/hgFootball/formationKnowledge.json";
const FORMATIONS_REL = "data/hgFootball/formations.json";
const BADGES_REL = "data/football_training_badges.json";

const errors = [];
const warnings = [];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function loadJson(rel) {
  const abs = join(ROOT, rel);
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch (error) {
    errors.push(`${rel}: kunne ikke lese/parse JSON (${error.message}).`);
    return null;
  }
}

const knowledge = loadJson(KNOWLEDGE_REL);
const formationsData = loadJson(FORMATIONS_REL);
const badgesData = loadJson(BADGES_REL);

// Referansesett fra eksisterende data.
const formationIds = new Set(
  formationsData && Array.isArray(formationsData.formations)
    ? formationsData.formations.map((f) => f && f.id).filter(isNonEmptyString)
    : [],
);
const badgeFamilyIds = new Set(
  badgesData && Array.isArray(badgesData.badgeFamilies)
    ? badgesData.badgeFamilies.map((f) => f && f.id).filter(isNonEmptyString)
    : [],
);

if (knowledge) {
  if (knowledge.schema !== "history-go.hg-football.formation-knowledge.v1") {
    errors.push(`${KNOWLEDGE_REL}: ugyldig "schema".`);
  }
  if (knowledge.version !== 1) {
    errors.push(`${KNOWLEDGE_REL}: ugyldig "version".`);
  }

  // Vocab.
  const vocab = knowledge.vocab;
  let opponentStyles = new Set();
  let parameterAxes = {};
  if (!isPlainObject(vocab)) {
    errors.push(`${KNOWLEDGE_REL}: "vocab" mangler eller er ugyldig.`);
  } else {
    if (!isNonEmptyStringArray(vocab.opponentStyles)) {
      errors.push(`${KNOWLEDGE_REL}: "vocab.opponentStyles" må være en ikke-tom liste med strenger.`);
    } else {
      opponentStyles = new Set(vocab.opponentStyles);
    }
    if (!isPlainObject(vocab.parameterAxes) || Object.keys(vocab.parameterAxes).length === 0) {
      errors.push(`${KNOWLEDGE_REL}: "vocab.parameterAxes" må være et ikke-tomt objekt.`);
    } else {
      parameterAxes = vocab.parameterAxes;
      for (const [axis, values] of Object.entries(parameterAxes)) {
        if (!isNonEmptyStringArray(values)) {
          errors.push(`${KNOWLEDGE_REL}: vocab.parameterAxes."${axis}" må være en ikke-tom liste med strenger.`);
        }
      }
    }
  }
  const axisKeys = Object.keys(parameterAxes);

  // Knowledge-oppslag.
  const entries = knowledge.knowledge;
  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push(`${KNOWLEDGE_REL}: "knowledge" må være en ikke-tom liste.`);
  } else {
    const seenIds = new Set();
    const coveredIds = new Set();

    for (const [i, entry] of entries.entries()) {
      const label = `${KNOWLEDGE_REL} knowledge[${i}]`;
      if (!isPlainObject(entry)) {
        errors.push(`${label}: ikke et objekt.`);
        continue;
      }

      // formationId.
      if (!isNonEmptyString(entry.formationId)) {
        errors.push(`${label}: mangler "formationId".`);
      } else {
        if (seenIds.has(entry.formationId)) {
          errors.push(`${label}: duplikat formationId "${entry.formationId}".`);
        }
        seenIds.add(entry.formationId);
        coveredIds.add(entry.formationId);
        if (formationIds.size > 0 && !formationIds.has(entry.formationId)) {
          errors.push(`${label}: formationId "${entry.formationId}" finnes ikke i formations.json.`);
        }
      }

      if (!isNonEmptyString(entry.summary)) {
        errors.push(`${label}: "summary" må være ikke-tom.`);
      }
      if (!isNonEmptyStringArray(entry.requiredConditions)) {
        errors.push(`${label}: "requiredConditions" må være en ikke-tom liste.`);
      }
      if (!isNonEmptyStringArray(entry.tacticalRisks)) {
        errors.push(`${label}: "tacticalRisks" må være en ikke-tom liste.`);
      }

      // strongAgainst / weakAgainst.
      const strong = entry.strongAgainst;
      const weak = entry.weakAgainst;
      for (const [field, value] of [["strongAgainst", strong], ["weakAgainst", weak]]) {
        if (!isNonEmptyStringArray(value)) {
          errors.push(`${label}: "${field}" må være en ikke-tom liste.`);
          continue;
        }
        for (const token of value) {
          if (opponentStyles.size > 0 && !opponentStyles.has(token)) {
            errors.push(`${label}.${field}: "${token}" finnes ikke i vocab.opponentStyles.`);
          }
        }
      }
      if (Array.isArray(strong) && Array.isArray(weak)) {
        const overlap = strong.filter((t) => weak.includes(t));
        if (overlap.length > 0) {
          errors.push(`${label}: stil(er) er både strongAgainst og weakAgainst: ${overlap.join(", ")}.`);
        }
      }

      // parameterProfile.
      const profile = entry.parameterProfile;
      if (!isPlainObject(profile)) {
        errors.push(`${label}: "parameterProfile" mangler eller er ugyldig.`);
      } else if (axisKeys.length > 0) {
        for (const axis of axisKeys) {
          if (!(axis in profile)) {
            errors.push(`${label}.parameterProfile: mangler akse "${axis}".`);
          } else if (!parameterAxes[axis].includes(profile[axis])) {
            errors.push(`${label}.parameterProfile."${axis}": ugyldig verdi "${profile[axis]}".`);
          }
        }
        for (const key of Object.keys(profile)) {
          if (!axisKeys.includes(key)) {
            errors.push(`${label}.parameterProfile: ukjent akse "${key}".`);
          }
        }
      }

      // trainingLinks.
      const links = entry.trainingLinks;
      if (!isNonEmptyStringArray(links)) {
        errors.push(`${label}: "trainingLinks" må være en ikke-tom liste.`);
      } else {
        const seenLinks = new Set();
        for (const link of links) {
          if (seenLinks.has(link)) {
            warnings.push(`${label}.trainingLinks: duplikat "${link}".`);
          }
          seenLinks.add(link);
          if (badgeFamilyIds.size > 0 && !badgeFamilyIds.has(link)) {
            errors.push(`${label}.trainingLinks: "${link}" finnes ikke som badge-familie i football_training_badges.json.`);
          }
        }
      }

      // doc (warning hvis fil mangler).
      if (entry.doc !== undefined) {
        if (!isNonEmptyString(entry.doc) || !entry.doc.endsWith(".md")) {
          errors.push(`${label}: "doc" må være en .md-sti.`);
        } else if (!existsSync(join(ROOT, entry.doc))) {
          warnings.push(`${label}: doc-fil mangler ennå: ${entry.doc}.`);
        }
      }
    }

    // Dekningsgap (warning, ikke error – kunnskapslaget er additivt).
    if (formationIds.size > 0) {
      const missing = [...formationIds].filter((id) => !coveredIds.has(id));
      if (missing.length > 0) {
        warnings.push(`Formasjoner uten kunnskapsoppslag (${missing.length}): ${missing.join(", ")}.`);
      }
    }
  }
}

// Rapport.
const lines = [];
lines.push("Formation Knowledge audit");
lines.push(`Formasjoner i formations.json: ${formationIds.size}`);
lines.push(`Badge-familier: ${badgeFamilyIds.size}`);
lines.push(`Kunnskapsoppslag: ${Array.isArray(knowledge?.knowledge) ? knowledge.knowledge.length : 0}`);
lines.push(`Errors: ${errors.length}`);
lines.push(`Warnings: ${warnings.length}`);
if (errors.length > 0) {
  lines.push("Feil:");
  for (const error of errors) lines.push(`- ${error}`);
}
if (warnings.length > 0) {
  lines.push("Advarsler:");
  for (const warning of warnings) lines.push(`- ${warning}`);
}
lines.push(`Result: ${errors.length === 0 ? "PASS" : "FAIL"}`);
console.log(lines.join("\n"));

process.exit(errors.length === 0 ? 0 : 1);
