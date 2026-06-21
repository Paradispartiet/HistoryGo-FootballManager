// scripts/audit-historical-opponents.mjs
//
// Audit/test for Historical Opponent Archetypes v1
// (src/football-historical-opponent-profiles.js).
//
// Verifiserer at de historiske stil-motstanderne er gyldige LÆRINGSPROFILER,
// runtime-kompatible med kampmotoren, og at matchup-vurderingen er deterministisk
// og forklarende. Kjerneprinsipper:
//   - Alle profiler har de nødvendige feltene (rike + runtime).
//   - Alle id-er er unike.
//   - Hver formationId finnes i formasjonsbiblioteket — eller har eksplisitt
//     formationFallback === true.
//   - strengths/weaknesses/keyBattles (og flere lærefelt) finnes.
//   - matchupStyles ligger innenfor formasjonskunnskapens vokabular.
//   - baseStyleId peker på en gyldig generisk motstander (hendelsesbibliotek).
//   - Ingen profil krever logo/bilde/drakt/emblem/grafikk.
//   - evaluateHistoricalOpponentMatchup gir deterministisk output (byte-identisk
//     ved lik input) og kan kjøres for alle profiler uten crash.
//
// Rent Node-script (standardbibliotek + prosjektets egne ESM-moduler). Skriver
// ingen filer. Exit code 1 hvis en sjekk feiler, ellers 0.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  HISTORICAL_OPPONENT_PROFILES,
  getHistoricalOpponentProfile,
  getHistoricalOpponentProfileIds,
  pickHistoricalOpponentProfile,
  evaluateHistoricalOpponentMatchup
} from "../src/football-historical-opponent-profiles.js";
import { OPPONENT_PROFILES } from "../src/football-matchday-engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf8"));
}

const formationsData = readJson("data/hgFootball/formations.json");
const knowledgeData = readJson("data/hgFootball/formationKnowledge.json");
const formationIds = new Set((formationsData.formations || []).map((f) => f.id));
const opponentStyleVocab = new Set(knowledgeData.vocab?.opponentStyles || []);
const baseStyleIds = new Set(OPPONENT_PROFILES.map((p) => p.id));

const results = [];
const failures = [];
function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  if (!condition) {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ---------------------------------------------------------------------------
// 0) Grunnleggende: minst 8 profiler, alle id-er unike.
// ---------------------------------------------------------------------------
check("minst 8 historiske profiler finnes", HISTORICAL_OPPONENT_PROFILES.length >= 8, `antall=${HISTORICAL_OPPONENT_PROFILES.length}`);

const ids = HISTORICAL_OPPONENT_PROFILES.map((p) => p.id);
check("alle id-er er unike", new Set(ids).size === ids.length);
check("getHistoricalOpponentProfileIds() matcher", getHistoricalOpponentProfileIds().length === ids.length);

// ---------------------------------------------------------------------------
// 1) Påkrevde felter (rike + runtime). styleTraits-nøkler.
// ---------------------------------------------------------------------------
const REQUIRED_STRING_FIELDS = [
  "id",
  "displayName",
  "archetypeName",
  "era",
  "referenceTeam",
  "referenceCoach",
  "tacticalSchool",
  "formationId",
  "inPossessionShape",
  "outOfPossessionShape",
  "pressShape",
  "defensiveBlock",
  "buildUpStyle",
  "attackingStyle",
  "tempo",
  "riskLevel",
  "style",
  "name",
  "baseStyleId",
  "historicalNote",
  "learningFocus"
];
const REQUIRED_NUMBER_FIELDS = [
  "strength",
  "pressResistance",
  "defensiveStructure",
  "transitionThreat",
  "chanceConversion"
];
const REQUIRED_ARRAY_FIELDS = [
  "keyPlayers",
  "matchupStyles",
  "strengths",
  "weaknesses",
  "vulnerableZones",
  "dangerZones",
  "keyBattles",
  "pressurePoints",
  "managerHints"
];
const REQUIRED_TRAIT_KEYS = [
  "pressIntensity",
  "transitionThreat",
  "defensiveCompactness",
  "highLine",
  "shortBuildUp",
  "possessionControl",
  "tacticalComplexity",
  "relationDemand",
  "intensity"
];
// Felter som ALDRI skal finnes — disse ville antyde logo/grafikk/branding.
const FORBIDDEN_FIELDS = ["logo", "badge", "crest", "emblem", "kit", "image", "img", "logoUrl", "shirt", "branding"];

for (const profile of HISTORICAL_OPPONENT_PROFILES) {
  const id = profile.id || "(uten id)";

  REQUIRED_STRING_FIELDS.forEach((field) => {
    check(`${id}: ${field} er en ikke-tom streng`, typeof profile[field] === "string" && profile[field].length > 0);
  });
  REQUIRED_NUMBER_FIELDS.forEach((field) => {
    const v = profile[field];
    check(`${id}: ${field} er et tall i [0,100]`, Number.isFinite(v) && v >= 0 && v <= 100, `verdi=${v}`);
  });
  REQUIRED_ARRAY_FIELDS.forEach((field) => {
    check(`${id}: ${field} er et ikke-tomt array`, Array.isArray(profile[field]) && profile[field].length > 0);
  });

  // name skal speile displayName (runtime-visning).
  check(`${id}: name === displayName`, profile.name === profile.displayName);

  // styleTraits: objekt med alle nødvendige 0–100-nøkler.
  const traits = profile.styleTraits;
  check(`${id}: styleTraits er et objekt`, traits && typeof traits === "object");
  if (traits && typeof traits === "object") {
    REQUIRED_TRAIT_KEYS.forEach((key) => {
      const v = traits[key];
      check(`${id}: styleTraits.${key} er et tall i [0,100]`, Number.isFinite(v) && v >= 0 && v <= 100, `verdi=${v}`);
    });
  }

  // formationId finnes i biblioteket — eller eksplisitt fallback.
  check(
    `${id}: formationId finnes i biblioteket eller har formationFallback`,
    formationIds.has(profile.formationId) || profile.formationFallback === true,
    `formationId=${profile.formationId}`
  );

  // matchupStyles innenfor vokabular (så formasjons-matchupen er gyldig).
  check(
    `${id}: alle matchupStyles ligger i vokabularet`,
    Array.isArray(profile.matchupStyles) && profile.matchupStyles.every((s) => opponentStyleVocab.has(s)),
    `styles=${(profile.matchupStyles || []).join(",")}`
  );

  // baseStyleId peker på en gyldig generisk motstander (hendelsesbibliotek).
  check(`${id}: baseStyleId peker på en generisk motstanderprofil`, baseStyleIds.has(profile.baseStyleId), `baseStyleId=${profile.baseStyleId}`);

  // riskLevel er en kjent verdi.
  check(`${id}: riskLevel er low/medium/high`, ["low", "medium", "high"].includes(profile.riskLevel), `riskLevel=${profile.riskLevel}`);

  // Ingen forbudte logo-/grafikk-felter.
  const forbidden = FORBIDDEN_FIELDS.filter((field) => field in profile);
  check(`${id}: ingen logo/drakt/emblem/grafikk-felter`, forbidden.length === 0, forbidden.join(","));
}

// ---------------------------------------------------------------------------
// 2) Oppslag/plukk.
// ---------------------------------------------------------------------------
check("getHistoricalOpponentProfile(kjent id) returnerer en kopi", getHistoricalOpponentProfile(ids[0])?.id === ids[0]);
check("getHistoricalOpponentProfile(ukjent id) returnerer null", getHistoricalOpponentProfile("finnes_ikke_xyz") === null);
check("pickHistoricalOpponentProfile(0) er deterministisk", pickHistoricalOpponentProfile(0).id === HISTORICAL_OPPONENT_PROFILES[0].id);

// ---------------------------------------------------------------------------
// 3) Matchup-vurdering: kan kjøres for alle profiler uten crash, gyldig form.
// ---------------------------------------------------------------------------
const teamFitSample = {
  metrics: {
    buildUpScore: 64,
    pressScore: 60,
    restDefenseScore: 52,
    widthScore: 58,
    depthScore: 55,
    balanceScore: 62,
    relationshipScore: 66,
    roleFitAverage: 70
  },
  relationships: { relationshipScore: 66 }
};
const offPitchSample = { team: { fatigue: 62, wear: 40 }, squad: { tacticalClarity: 48 } };

let matchupCrashed = false;
for (const profile of HISTORICAL_OPPONENT_PROFILES) {
  try {
    const out = evaluateHistoricalOpponentMatchup({
      teamFit: teamFitSample,
      opponentProfile: profile,
      offPitchContext: offPitchSample,
      trainingFocus: { focusId: "build_up" }
    });
    check(`${profile.id}: matchup gir et objekt`, out && typeof out === "object");
    check(`${profile.id}: matchupScore i [0,100]`, Number.isFinite(out.matchupScore) && out.matchupScore >= 0 && out.matchupScore <= 100, `score=${out?.matchupScore}`);
    check(`${profile.id}: riskLevel er gyldig`, ["favourable", "balanced", "risky"].includes(out.riskLevel), `riskLevel=${out?.riskLevel}`);
    check(`${profile.id}: advantages/vulnerabilities er arrays`, Array.isArray(out.advantages) && Array.isArray(out.vulnerabilities));
    check(`${profile.id}: keyBattles er ikke-tomt`, Array.isArray(out.keyBattles) && out.keyBattles.length > 0);
    check(`${profile.id}: historicalLearningPoint er en ikke-tom streng`, typeof out.historicalLearningPoint === "string" && out.historicalLearningPoint.length > 0);
    check(`${profile.id}: explanationTags er et array`, Array.isArray(out.explanationTags));
  } catch (error) {
    matchupCrashed = true;
    check(`${profile.id}: matchup kjørte uten crash`, false, String(error?.message || error));
  }
}
check("ingen matchup-evaluering krasjet", !matchupCrashed);

// ---------------------------------------------------------------------------
// 4) Determinisme: lik input gir byte-identisk output.
// ---------------------------------------------------------------------------
const det1 = evaluateHistoricalOpponentMatchup({ teamFit: teamFitSample, opponentProfile: HISTORICAL_OPPONENT_PROFILES[2], offPitchContext: offPitchSample });
const det2 = evaluateHistoricalOpponentMatchup({ teamFit: teamFitSample, opponentProfile: HISTORICAL_OPPONENT_PROFILES[2], offPitchContext: offPitchSample });
check("matchup er deterministisk (byte-identisk output)", JSON.stringify(det1) === JSON.stringify(det2));

// ---------------------------------------------------------------------------
// 5) Trygg degradering: uten styleTraits / uten teamFit.
// ---------------------------------------------------------------------------
check("matchup uten profil gir null", evaluateHistoricalOpponentMatchup({ teamFit: teamFitSample }) === null);
check(
  "matchup mot generisk profil (uten styleTraits) gir null",
  evaluateHistoricalOpponentMatchup({ teamFit: teamFitSample, opponentProfile: OPPONENT_PROFILES[0] }) === null
);
{
  let degraded = null;
  let crashed = false;
  try {
    degraded = evaluateHistoricalOpponentMatchup({ opponentProfile: HISTORICAL_OPPONENT_PROFILES[0] });
  } catch (error) {
    crashed = true;
  }
  check("matchup uten teamFit kjører uten crash", !crashed && degraded && typeof degraded === "object");
}

// ---------------------------------------------------------------------------
console.log("Historical opponent archetypes audit\n");
for (const result of results) {
  const mark = result.ok ? "ok" : "FEIL";
  // Hold loggen kort: vis kun feil + en kort oppsummering.
  if (!result.ok) console.log(`  [${mark}] ${result.name}${result.detail ? `  (${result.detail})` : ""}`);
}
console.log("");

if (failures.length > 0) {
  console.error(`${failures.length} av ${results.length} sjekker feilet:`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log(`Alle ${results.length} sjekker passerte (${HISTORICAL_OPPONENT_PROFILES.length} historiske profiler).`);
