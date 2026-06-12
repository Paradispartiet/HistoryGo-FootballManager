// scripts/audit-hg-football-data.mjs

/**
 * Data-audit for HG Football Manager (data/hgFootball/).
 *
 * Leser data/hgFootball/manifest.json, laster alle registrerte JSON-filer og
 * validerer at datagrunnlaget henger sammen:
 *   - gyldig JSON i alle filer
 *   - alle formation.eraId finnes i formationEras.json
 *   - rolle-referanser (roleRequirements/preferredPlayerTypes/misusedPlayerTypes)
 *     peker på gyldige roleTypes-IDs
 *   - unlockRules som gjelder formasjoner peker på gyldige formation-IDs
 *   - alle formasjoner har baseShape, inPossessionShape, outOfPossessionShape,
 *     pressShape, lowBlockShape og restDefenceShape
 *   - matchEngineEffects finnes med alle nøkler og 0-10-verdier
 *   - tacticalDifficulty bruker kun low/medium/high/very_high
 *   - lokale startsteder har gyldig schema, unike placeId-er som finnes i
 *     football_unlocks.json, og finite latitude/longitude-verdier
 *
 * Rent Node-script (standardbibliotek, ingen dependencies). Read-only: skriver
 * ingen filer. Exit code 1 hvis det finnes errors, ellers 0. Warnings feiler
 * ikke build.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MANIFEST_REL = "data/hgFootball/manifest.json";

const MATCH_ENGINE_KEYS = [
  "attackingWidth",
  "centralControl",
  "defensiveSecurity",
  "transitionThreat",
  "pressingIntensity",
  "restDefenceSecurity",
  "roleComplexity",
  "staminaDemand",
  "creativityDemand",
  "coachingDemand",
];

const REQUIRED_SHAPES = [
  "baseShape",
  "inPossessionShape",
  "outOfPossessionShape",
  "pressShape",
  "lowBlockShape",
  "restDefenceShape",
];

const VALID_DIFFICULTY = new Set(["low", "medium", "high", "very_high"]);

const errors = [];
const warnings = [];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/** Leser og parser en JSON-fil relativt til repo-roten. Returnerer undefined ved feil. */
function loadJson(relPath) {
  let raw;
  try {
    raw = readFileSync(join(ROOT, relPath), "utf8");
  } catch (err) {
    errors.push(`Kunne ikke lese ${relPath}: ${err.message}`);
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    errors.push(`Ugyldig JSON i ${relPath}: ${err.message}`);
    return undefined;
  }
}

function collectIds(arr, label) {
  const ids = new Set();
  if (!Array.isArray(arr)) return ids;
  for (const item of arr) {
    if (isPlainObject(item) && isNonEmptyString(item.id)) {
      if (ids.has(item.id)) errors.push(`${label}: duplikat id "${item.id}".`);
      ids.add(item.id);
    }
  }
  return ids;
}

function validateRoleRefs(formationLabel, field, value, roleIds) {
  if (value === undefined) {
    errors.push(`${formationLabel}: mangler "${field}".`);
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`${formationLabel}: "${field}" må være en array.`);
    return;
  }
  for (const ref of value) {
    if (!isNonEmptyString(ref)) {
      errors.push(`${formationLabel}: "${field}" inneholder en tom verdi.`);
      continue;
    }
    if (!roleIds.has(ref)) {
      errors.push(`${formationLabel}: "${field}" peker på ukjent roleType "${ref}".`);
    }
  }
}

function main() {
  const counts = {
    formations: 0,
    eras: 0,
    roleTypes: 0,
    staffRoles: 0,
    unlockRules: 0,
    fitRules: 0,
    placeLocations: 0,
  };

  const manifest = loadJson(MANIFEST_REL);
  if (manifest === undefined) {
    return finish(counts);
  }
  if (!Array.isArray(manifest.sourceOfTruth)) {
    errors.push(`${MANIFEST_REL}: "sourceOfTruth" må være en array.`);
  }

  // Last kjernedataene (source of truth).
  const eras = loadJson("data/hgFootball/formationEras.json");
  const formations = loadJson("data/hgFootball/formations.json");
  const roleTypes = loadJson("data/hgFootball/roleTypes.json");
  const staffRoles = loadJson("data/hgFootball/staffRoles.json");
  const unlockRules = loadJson("data/hgFootball/unlockRules.json");
  const fitRules = loadJson("data/hgFootball/playerRoleFitRules.json");

  // Bekreft at hver source-of-truth-fil i manifest faktisk lar seg lese som JSON.
  if (Array.isArray(manifest.sourceOfTruth)) {
    for (const rel of manifest.sourceOfTruth) {
      if (isNonEmptyString(rel)) loadJson(rel);
    }
  }

  const eraIds = collectIds(eras && eras.eras, "formationEras");
  const roleIds = collectIds(roleTypes && roleTypes.roleTypes, "roleTypes");
  const formationIds = collectIds(formations && formations.formations, "formations");

  if (eras) counts.eras = eraIds.size;
  if (roleTypes) counts.roleTypes = roleIds.size;
  if (staffRoles && Array.isArray(staffRoles.staffRoles)) counts.staffRoles = staffRoles.staffRoles.length;
  if (fitRules && Array.isArray(fitRules.rules)) {
    counts.fitRules = fitRules.rules.length + (Array.isArray(fitRules.misuseRules) ? fitRules.misuseRules.length : 0);
  }

  // --- Formasjoner ---
  if (formations && Array.isArray(formations.formations)) {
    counts.formations = formations.formations.length;
    for (const [i, f] of formations.formations.entries()) {
      const label = isPlainObject(f) && isNonEmptyString(f.id)
        ? `formation[${i}] (id="${f.id}")`
        : `formation[${i}]`;
      if (!isPlainObject(f)) {
        errors.push(`${label}: må være et objekt.`);
        continue;
      }

      // eraId
      if (!isNonEmptyString(f.eraId)) {
        errors.push(`${label}: mangler "eraId".`);
      } else if (!eraIds.has(f.eraId)) {
        errors.push(`${label}: "eraId" = "${f.eraId}" finnes ikke i formationEras.json.`);
      }

      // Faseformasjoner
      for (const shape of REQUIRED_SHAPES) {
        if (!isNonEmptyString(f[shape])) {
          errors.push(`${label}: mangler eller tom "${shape}".`);
        }
      }

      // Rolle-referanser
      validateRoleRefs(label, "roleRequirements", f.roleRequirements, roleIds);
      validateRoleRefs(label, "preferredPlayerTypes", f.preferredPlayerTypes, roleIds);
      validateRoleRefs(label, "misusedPlayerTypes", f.misusedPlayerTypes, roleIds);

      // tacticalDifficulty
      if (!VALID_DIFFICULTY.has(f.tacticalDifficulty)) {
        errors.push(`${label}: "tacticalDifficulty" = ${JSON.stringify(f.tacticalDifficulty)} må være low/medium/high/very_high.`);
      }

      // matchEngineEffects
      const mee = f.matchEngineEffects;
      if (!isPlainObject(mee)) {
        errors.push(`${label}: mangler "matchEngineEffects"-objekt.`);
      } else {
        for (const key of MATCH_ENGINE_KEYS) {
          const v = mee[key];
          if (typeof v !== "number" || !Number.isFinite(v)) {
            errors.push(`${label}: matchEngineEffects."${key}" må være et tall.`);
          } else if (v < 0 || v > 10) {
            errors.push(`${label}: matchEngineEffects."${key}" = ${v} er utenfor 0-10.`);
          }
        }
        for (const key of Object.keys(mee)) {
          if (!MATCH_ENGINE_KEYS.includes(key)) {
            warnings.push(`${label}: matchEngineEffects har ukjent nøkkel "${key}".`);
          }
        }
      }
    }
  } else if (formations) {
    errors.push('formations.json: "formations" må være en array.');
  }

  // --- unlockRules: formasjons-referanser ---
  if (unlockRules && Array.isArray(unlockRules.rules)) {
    counts.unlockRules = unlockRules.rules.length;
    for (const [i, r] of unlockRules.rules.entries()) {
      if (!isPlainObject(r)) continue;
      const label = `unlockRule[${i}]${isNonEmptyString(r.id) ? ` (id="${r.id}")` : ""}`;
      if (r.appliesTo === "formation") {
        if (!isNonEmptyString(r.formationId)) {
          errors.push(`${label}: appliesTo=formation men mangler "formationId".`);
        } else if (!formationIds.has(r.formationId)) {
          errors.push(`${label}: "formationId" = "${r.formationId}" finnes ikke i formations.json.`);
        }
      }
    }
  } else if (unlockRules) {
    errors.push('unlockRules.json: "rules" må være en array.');
  }

  // --- Koordinater for lokal starttropp ---
  const footballUnlocks = loadJson("data/football_unlocks.json");
  const placeLocations = loadJson("data/football_place_locations.json");
  const unlockPlaceIds = new Set(
    Array.isArray(footballUnlocks?.placeUnlocks)
      ? footballUnlocks.placeUnlocks.map((place) => place?.placeId).filter(isNonEmptyString)
      : []
  );

  if (placeLocations) {
    if (placeLocations.schema !== "historygo-football-manager.place-locations.v1") {
      errors.push('football_place_locations.json: ugyldig "schema".');
    }
    if (!Array.isArray(placeLocations.places)) {
      errors.push('football_place_locations.json: "places" må være en array.');
    } else {
      counts.placeLocations = placeLocations.places.length;
      const seenPlaceIds = new Set();
      for (const [i, place] of placeLocations.places.entries()) {
        const label = `football_place_locations.places[${i}]`;
        if (!isPlainObject(place) || !isNonEmptyString(place.placeId)) {
          errors.push(`${label}: mangler gyldig "placeId".`);
          continue;
        }
        if (seenPlaceIds.has(place.placeId)) {
          errors.push(`${label}: duplikat placeId "${place.placeId}".`);
        }
        seenPlaceIds.add(place.placeId);
        if (!unlockPlaceIds.has(place.placeId)) {
          errors.push(`${label}: placeId "${place.placeId}" finnes ikke i football_unlocks.json.`);
        }
        if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
          errors.push(`${label}: latitude/longitude må være finite numbers.`);
        }
      }
    }
  }

  // --- fitRules: rolle-referanser (warning, ikke hard feil) ---
  if (fitRules) {
    const ruleArrays = [
      ["rules", fitRules.rules],
      ["misuseRules", fitRules.misuseRules],
    ];
    for (const [name, arr] of ruleArrays) {
      if (!Array.isArray(arr)) continue;
      for (const [i, r] of arr.entries()) {
        if (isPlainObject(r) && isNonEmptyString(r.roleType) && roleIds.size > 0 && !roleIds.has(r.roleType)) {
          warnings.push(`playerRoleFitRules.${name}[${i}]: "roleType" = "${r.roleType}" finnes ikke i roleTypes.json.`);
        }
      }
    }
  }

  return finish(counts);
}

function finish(counts) {
  const lines = [];
  lines.push("HG Football Manager Data Audit");
  lines.push(`Manifest: ${MANIFEST_REL}`);
  lines.push(`Formations: ${counts.formations}`);
  lines.push(`Eras: ${counts.eras}`);
  lines.push(`Role types: ${counts.roleTypes}`);
  lines.push(`Staff roles: ${counts.staffRoles}`);
  lines.push(`Fit rules: ${counts.fitRules}`);
  lines.push(`Unlock rules: ${counts.unlockRules}`);
  lines.push(`Place locations: ${counts.placeLocations}`);
  lines.push("");

  if (errors.length === 0 && warnings.length === 0) {
    lines.push("Errors: 0");
    lines.push("Warnings: 0");
    lines.push("Result: PASS");
    console.log(lines.join("\n"));
    process.exit(0);
  }

  lines.push(`Errors:${errors.length === 0 ? " 0" : ""}`);
  for (const error of errors) lines.push(`- ${error}`);
  lines.push("");
  lines.push(`Warnings:${warnings.length === 0 ? " 0" : ""}`);
  for (const warning of warnings) lines.push(`- ${warning}`);
  lines.push("");
  lines.push("Result:");
  lines.push(errors.length > 0 ? "FAIL" : "PASS");

  console.log(lines.join("\n"));
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
