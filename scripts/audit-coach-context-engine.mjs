// scripts/audit-coach-context-engine.mjs
//
// Audit/test for coachContext-motoren (src/hg-football-coach-context-engine.js)
// og dens kobling inn i den historiske formasjonsfit-motoren.
//
// Verifiserer kjerneprinsippene:
//   - Ingen ansatt stab gir gyldig, nøytral coachContext uten crash.
//   - Assistenttrener øker tacticalLearningSpeed/roleFitClarity/formationFamiliarity.
//   - Tre treningscoacher gir mer læring enn én, men clamps trygt.
//   - Keepertrener øker goalkeeperDevelopment og litt defensiveOrganisation,
//     men ikke angrepsmønstre.
//   - Fysio øker injuryRecovery, men ikke coachUnderstanding direkte.
//   - Taktisk/analytiker-stab hjelper high/very_high formasjoner mer enn low.
//   - very_high-formasjon får lav relief med svak stab og høyere med relevant stab.
//   - coachContext reduserer historicalPenalty litt, men fjerner ikke
//     misusedPlayerTypes-penalty.
//   - Gammel sti uten coachContext fungerer fortsatt.
//
// Rent Node-script (standardbibliotek + prosjektets egne ESM-moduler). Skriver
// ingen filer. Exit code 1 hvis en sjekk feiler, ellers 0.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { adaptHgFormations } from "../src/hg-football-formation-adapter.js";
import {
  buildCoachContext,
  calculateStaffEffectProfile,
  calculateFormationFamiliarity
} from "../src/hg-football-coach-context-engine.js";
import {
  calculateHistoricalFormationFit,
  calculateHistoricalRoleCoverage
} from "../src/hg-football-historical-fit-engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf8"));
}

const formationsData = readJson("data/hgFootball/formations.json");
const erasData = readJson("data/hgFootball/formationEras.json");
const staffRolesData = readJson("data/hgFootball/staffRoles.json");
const staffRoles = staffRolesData.staffRoles;

const formations = adaptHgFormations(formationsData, erasData);

function getFormation(id) {
  const formation = formations.find((item) => item.id === id);
  if (!formation) {
    throw new Error(`Fant ikke adaptert formasjon: ${id}`);
  }
  return formation;
}

// Syntetiske stab-profiler (ingen enkeltperson hardkodes i motoren).
function staff(id, staffType, expertiseIds = []) {
  return { id, name: id, staffType, canBeHiredAs: [staffType], expertiseIds, roles: [], fitsClubs: [] };
}

// --- Hjelpere (samme stil som audit-historical-formation-fit) ----------------
let slotCounter = 0;
function makeAssignment(roleId) {
  slotCounter += 1;
  return {
    slot: { slotId: `slot${slotCounter}`, position: "CM", label: roleId },
    player: { id: `p${slotCounter}`, name: `Spiller ${slotCounter}` },
    role: { id: roleId, name: roleId },
    fit: { matchScore: 80, status: "god", roleFit: 80, tacticFit: 80, misusePenalty: 0 }
  };
}
function lineup(roleIds) {
  return roleIds.map((roleId) => makeAssignment(roleId));
}
function neutralBaseMetrics(overrides = {}) {
  return {
    individualFitAverage: 78,
    roleFitAverage: 78,
    tacticFitAverage: 78,
    misuseAverage: 5,
    balanceScore: 62,
    widthScore: 58,
    depthScore: 56,
    buildUpScore: 60,
    pressScore: 55,
    restDefenseScore: 58,
    relationshipScore: 70,
    duplicatePenalty: 0,
    ...overrides
  };
}

const failures = [];
const results = [];

function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  if (!condition) {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const veryHigh = getFormation("total_433"); // very_high, posisjonsspill/total
const low = getFormation("low_block_541"); // low

// --- 1) Ingen stab gir gyldig, nøytral coachContext uten crash ----------------
{
  let crashed = false;
  let context = null;
  try {
    context = buildCoachContext({ hiredStaff: [], staffRoles, formation: veryHigh, teamMerits: null });
    // Tomme/null-argumenter skal heller ikke krasje.
    buildCoachContext({});
    buildCoachContext({ hiredStaff: null, staffRoles: null, formation: null, teamMerits: null });
  } catch (error) {
    crashed = true;
    check("Ingen stab krasjer ikke", false, error.message);
  }
  if (!crashed) {
    check("Ingen stab krasjer ikke", true);
  }
  check(
    "Ingen stab: gyldig staffCount 0",
    context && context.staffCount === 0,
    `staffCount=${context?.staffCount}`
  );
  check(
    "Ingen stab: nøytral/lav læring (~40)",
    context && context.tacticalLearningSpeed >= 35 && context.tacticalLearningSpeed <= 50,
    `learning=${context?.tacticalLearningSpeed}`
  );
  check(
    "Ingen stab: spesialfelt på 0 (goalkeeperDevelopment/injuryRecovery)",
    context && context.goalkeeperDevelopment === 0 && context.injuryRecovery === 0,
    `gk=${context?.goalkeeperDevelopment}, injury=${context?.injuryRecovery}`
  );
}

// --- 2) Assistenttrener øker læring/rolleklarhet/tilvenning --------------------
{
  const none = calculateStaffEffectProfile({ hiredStaff: [], staffRoles }).effectProfile;
  const withAssistant = calculateStaffEffectProfile({
    hiredStaff: [staff("ass1", "assistant_coach")],
    staffRoles
  }).effectProfile;

  check(
    "Assistenttrener øker tacticalLearningSpeed",
    withAssistant.tacticalLearningSpeed > none.tacticalLearningSpeed,
    `${none.tacticalLearningSpeed} -> ${withAssistant.tacticalLearningSpeed}`
  );
  check(
    "Assistenttrener øker roleFitClarity",
    withAssistant.roleFitClarity > none.roleFitClarity,
    `${none.roleFitClarity} -> ${withAssistant.roleFitClarity}`
  );
  check(
    "Assistenttrener øker formationFamiliarity-profil",
    withAssistant.formationFamiliarity > none.formationFamiliarity,
    `${none.formationFamiliarity} -> ${withAssistant.formationFamiliarity}`
  );
}

// --- 3) Tre treningscoacher gir mer læring enn én, men clamps trygt -----------
{
  const one = calculateStaffEffectProfile({
    hiredStaff: [staff("tc1", "training_coach")],
    staffRoles
  }).effectProfile;
  const three = calculateStaffEffectProfile({
    hiredStaff: [
      staff("tc1", "training_coach"),
      staff("tc2", "training_coach"),
      staff("tc3", "training_coach")
    ],
    staffRoles
  }).effectProfile;

  check(
    "Tre treningscoacher > én på læring",
    three.tacticalLearningSpeed > one.tacticalLearningSpeed,
    `1=${one.tacticalLearningSpeed}, 3=${three.tacticalLearningSpeed}`
  );
  check(
    "Tre treningscoacher clamps trygt (<= 90)",
    three.tacticalLearningSpeed <= 90 && three.formationFamiliarity <= 90,
    `learning=${three.tacticalLearningSpeed}, familiarity=${three.formationFamiliarity}`
  );
}

// --- 4) Keepertrener: goalkeeperDevelopment + litt defensiveOrganisation -------
{
  const profile = calculateStaffEffectProfile({
    hiredStaff: [staff("gk1", "goalkeeper_coach")],
    staffRoles
  }).effectProfile;

  check(
    "Keepertrener øker goalkeeperDevelopment",
    profile.goalkeeperDevelopment > 0,
    `gk=${profile.goalkeeperDevelopment}`
  );
  check(
    "Keepertrener øker defensiveOrganisation litt",
    profile.defensiveOrganisation > 0,
    `def=${profile.defensiveOrganisation}`
  );
  check(
    "Keepertrener påvirker ikke angrepsmønstre",
    profile.attackingPatterns === 0,
    `att=${profile.attackingPatterns}`
  );
}

// --- 5) Fysio: injuryRecovery, men ikke coachUnderstanding direkte ------------
{
  const noneCtx = buildCoachContext({ hiredStaff: [], staffRoles, formation: low, teamMerits: null });
  const physioCtx = buildCoachContext({
    hiredStaff: [staff("phys1", "physio")],
    staffRoles,
    formation: low,
    teamMerits: null
  });

  check(
    "Fysio øker injuryRecovery",
    physioCtx.injuryRecovery > 0,
    `injury=${physioCtx.injuryRecovery}`
  );
  check(
    "Fysio gir ikke direkte taktisk forståelse",
    physioCtx.coachUnderstanding === noneCtx.coachUnderstanding,
    `none=${noneCtx.coachUnderstanding}, physio=${physioCtx.coachUnderstanding}`
  );
}

// --- 6) Taktisk/analytiker-stab hjelper very_high mer enn low ------------------
// Med samme sterke taktiske stab skal en krevende formasjon få større
// vanskelighets-relief enn en enkel formasjon (relief skalerer med difficulty).
{
  const tacticalStaff = [
    staff("tac1", "tactical_coach", ["passing_training", "team_organisation", "build_up_play"]),
    staff("ana1", "analyst", ["team_organisation"]),
    staff("tc1", "training_coach", ["team_organisation"])
  ];

  const veryHighCtx = buildCoachContext({ hiredStaff: tacticalStaff, staffRoles, formation: veryHigh, teamMerits: null });
  const lowCtx = buildCoachContext({ hiredStaff: tacticalStaff, staffRoles, formation: low, teamMerits: null });

  check(
    "Taktisk/analytiker-stab gir very_high mer relief enn low",
    veryHighCtx.formationDifficultyRelief > lowCtx.formationDifficultyRelief,
    `veryHigh=${veryHighCtx.formationDifficultyRelief}, low=${lowCtx.formationDifficultyRelief}`
  );
}

// --- 7) very_high relief: lav med svak stab, høyere med relevant stab ----------
{
  const weak = buildCoachContext({
    hiredStaff: [staff("phys1", "physio")],
    staffRoles,
    formation: veryHigh,
    teamMerits: null
  });
  const strong = buildCoachContext({
    hiredStaff: [
      staff("mgr1", "head_coach", ["team_organisation"]),
      staff("tac1", "tactical_coach", ["passing_training", "team_organisation", "build_up_play"]),
      staff("ana1", "analyst", ["team_organisation"]),
      staff("tc1", "training_coach", ["team_organisation"])
    ],
    staffRoles,
    formation: veryHigh,
    teamMerits: null
  });

  check(
    "very_high: svak stab gir lav relief (<= 2)",
    weak.formationDifficultyRelief <= 2,
    `relief=${weak.formationDifficultyRelief}`
  );
  check(
    "very_high: relevant stab gir høyere relief (>= 4)",
    strong.formationDifficultyRelief >= 4 && strong.formationDifficultyRelief > weak.formationDifficultyRelief,
    `weak=${weak.formationDifficultyRelief}, strong=${strong.formationDifficultyRelief}`
  );
}

// --- 8) coachContext reduserer penalty litt, men fjerner ikke misuse ----------
{
  // Lav blokk misbruker false_nine/classic_ten/dribbler. Bygg en feilbrukende
  // ellever på en krevende formasjon der både coverageGap og misuse bidrar.
  const formation = getFormation("catenaccio_1432"); // high, krever libero
  const assignments = lineup(["false_nine", "classic_ten", "wide_dribbler", "free_creator", "regista"]);
  const baseMetrics = neutralBaseMetrics({ restDefenseScore: 45 });

  const without = calculateHistoricalFormationFit({ assignments, baseMetrics, formation, tactic: { tags: [] } });
  const strongStaff = [
    staff("def1", "assistant_coach", ["rest_defense", "defensive_structure", "match_discipline"]),
    staff("tac1", "tactical_coach", ["rest_defense", "team_organisation"]),
    staff("tc1", "training_coach", ["team_organisation"])
  ];
  const coachContext = buildCoachContext({ hiredStaff: strongStaff, staffRoles, formation, teamMerits: null });
  const withStaff = calculateHistoricalFormationFit({
    assignments,
    baseMetrics,
    formation,
    tactic: { tags: [] },
    coachContext
  });

  const coverage = calculateHistoricalRoleCoverage({ assignments, formation });

  check(
    "Feilbruk gir misusePenalty (staff kan ikke fjerne den)",
    coverage.misusePenalty > 0,
    `misusePenalty=${coverage.misusePenalty}`
  );
  check(
    "coachContext reduserer historicalPenalty litt",
    withStaff.historicalPenalty < without.historicalPenalty,
    `without=${without.historicalPenalty}, with=${withStaff.historicalPenalty}`
  );
  check(
    "coachContext fjerner ikke hele penalty (misuse står igjen)",
    withStaff.historicalPenalty > 0,
    `with=${withStaff.historicalPenalty}`
  );
}

// --- 9) Gammel sti uten coachContext fungerer fortsatt ------------------------
{
  const assignments = lineup(["libero", "duel_centre_back", "wingback", "holding_midfielder", "channel_runner"]);
  const fit = calculateHistoricalFormationFit({
    assignments,
    baseMetrics: neutralBaseMetrics(),
    formation: getFormation("catenaccio_1432"),
    tactic: { tags: [] }
    // ingen coachContext
  });
  check(
    "Uten coachContext: gyldig historicalScore",
    Number.isFinite(fit.historicalScore) && fit.historicalScore >= 0 && fit.historicalScore <= 100,
    `historicalScore=${fit.historicalScore}`
  );
}

// --- 10) Lagret formationFamiliarity brukes som grunnlag ----------------------
{
  const effectProfile = calculateStaffEffectProfile({ hiredStaff: [], staffRoles }).effectProfile;
  const stored = calculateFormationFamiliarity({
    formation: veryHigh,
    effectProfile,
    teamMerits: { formationFamiliarity: { [veryHigh.id]: 88 } },
    expertiseTokens: new Set()
  });
  check(
    "Lagret formationFamiliarity brukes som grunnlag (~88)",
    stored >= 80,
    `familiarity=${stored}`
  );
}

// --- Rapport ------------------------------------------------------------------
console.log("Coach context engine audit\n");
results.forEach((result) => {
  const mark = result.ok ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${result.name}${result.detail ? `  (${result.detail})` : ""}`);
});

console.log("");
if (failures.length > 0) {
  console.error(`${failures.length} sjekk(er) feilet.`);
  process.exit(1);
}
console.log(`Alle ${results.length} sjekker passerte.`);
