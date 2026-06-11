// scripts/audit-historical-formation-fit.mjs
//
// Audit/test for den historiske formasjonsfit-motoren
// (src/hg-football-historical-fit-engine.js).
//
// Bygger syntetiske, komplette assignments mot ekte adapterte hgFootball-
// formasjoner og verifiserer at den historiske fit-motoren oppfører seg som
// tiltenkt:
//   - WM 3-2-2-3 og Box Midfield 3-2-2-3 (samme tall, ulike systemer) gir
//     ulik vurdering.
//   - Catenaccio/libero får positiv dekning når libero brukes, og en tydelig
//     issue når libero mangler.
//   - Den historiske pyramide-2-3-5 blir ikke automatisk dårlig.
//   - Et moderne 3-2-5 krever høyere restforsvar/rolledekning.
//   - misusedPlayerTypes gir penalty.
//   - Manglende roleRequirements/matchEngineEffects krasjer ikke.
//
// Rent Node-script (standardbibliotek + prosjektets egne ESM-moduler). Skriver
// ingen filer. Exit code 1 hvis en sjekk feiler, ellers 0.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { adaptHgFormations } from "../src/hg-football-formation-adapter.js";
import {
  calculateHistoricalRoleCoverage,
  calculateHistoricalMetricAdjustments,
  calculateHistoricalFormationFit
} from "../src/hg-football-historical-fit-engine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(ROOT, relPath), "utf8"));
}

const formationsData = readJson("data/hgFootball/formations.json");
const erasData = readJson("data/hgFootball/formationEras.json");
const formations = adaptHgFormations(formationsData, erasData);

function getFormation(id) {
  const formation = formations.find((item) => item.id === id);
  if (!formation) {
    throw new Error(`Fant ikke adaptert formasjon: ${id}`);
  }
  return formation;
}

let slotCounter = 0;

// Bygger en minimal, komplett assignment slik team-fit-motoren ville levert den.
function makeAssignment(roleId, roleName) {
  slotCounter += 1;
  return {
    slot: { slotId: `slot${slotCounter}`, position: "CM", label: roleName },
    player: { id: `p${slotCounter}`, name: `Spiller ${slotCounter}` },
    role: { id: roleId, name: roleName },
    fit: { matchScore: 80, status: "god", roleFit: 80, tacticFit: 80, misusePenalty: 0 }
  };
}

function lineup(roleIds) {
  return roleIds.map((roleId) => makeAssignment(roleId, roleId));
}

// Nøytrale basismetrikker som etterligner et middels lag.
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

// --- 1) Catenaccio med libero gir tydelig positiv dekning ---------------------
{
  const formation = getFormation("catenaccio_1432");
  // libero -> libero, wingback -> wing_back, holding_midfielder -> destroyer,
  // channel_runner -> channel_runner, duel_centre_back -> man_marker.
  const withLibero = lineup([
    "libero",
    "duel_centre_back",
    "wingback",
    "holding_midfielder",
    "channel_runner"
  ]);
  const fit = calculateHistoricalFormationFit({
    assignments: withLibero,
    baseMetrics: neutralBaseMetrics(),
    formation,
    tactic: { tags: [] }
  });
  check(
    "Catenaccio: libero gir høy rolledekning",
    fit.roleCoverage.coverageScore >= 80,
    `coverageScore=${fit.roleCoverage.coverageScore}`
  );
  check(
    "Catenaccio: libero gir ingen libero-issue",
    !fit.issues.some((issue) => issue.includes("libero")),
    fit.issues.join(" | ")
  );
}

// --- 2) Catenaccio uten libero gir tydelig issue ------------------------------
{
  const formation = getFormation("catenaccio_1432");
  const withoutLibero = lineup([
    "stopper",
    "duel_centre_back",
    "support_fullback",
    "deep_playmaker",
    "advanced_forward"
  ]);
  const fit = calculateHistoricalFormationFit({
    assignments: withoutLibero,
    baseMetrics: neutralBaseMetrics(),
    formation,
    tactic: { tags: [] }
  });
  check(
    "Catenaccio uten libero: issue om libero/man-marker",
    fit.issues.some((issue) => issue.toLowerCase().includes("libero")),
    fit.issues.join(" | ")
  );
  check(
    "Catenaccio uten libero: lavere historicalScore enn med libero",
    fit.historicalScore < 70,
    `historicalScore=${fit.historicalScore}`
  );
}

// --- 3) WM 3-2-2-3 vs Box Midfield 3-2-2-3 (samme tall, ulike systemer) -------
{
  const wm = getFormation("wm_3223");
  const box = getFormation("box_midfield_3223");

  // Roller som passer WM (half_back, inside_forward, stopper_centre_back ...).
  const wmRoles = lineup([
    "support_fullback", // traditional_full_back
    "stopper", // stopper_centre_back
    "balancing_six", // half_back
    "inverted_winger", // inside_forward
    "advanced_forward" // centre_forward
  ]);
  // Samme legacy-roller mot box midfield, som krever helt andre roleTypes.
  const wmFitOnWm = calculateHistoricalFormationFit({
    assignments: wmRoles,
    baseMetrics: neutralBaseMetrics(),
    formation: wm,
    tactic: { tags: [] }
  });
  const wmFitOnBox = calculateHistoricalFormationFit({
    assignments: lineup([
      "support_fullback",
      "stopper",
      "balancing_six",
      "inverted_winger",
      "advanced_forward"
    ]),
    baseMetrics: neutralBaseMetrics(),
    formation: box,
    tactic: { tags: [] }
  });

  check(
    "WM og Box Midfield (3-2-2-3) gir ulik vurdering med samme roller",
    wmFitOnWm.historicalScore !== wmFitOnBox.historicalScore ||
      wmFitOnWm.roleCoverage.coverageScore !== wmFitOnBox.roleCoverage.coverageScore,
    `WM score=${wmFitOnWm.historicalScore}/${wmFitOnWm.roleCoverage.coverageScore}, ` +
      `Box score=${wmFitOnBox.historicalScore}/${wmFitOnBox.roleCoverage.coverageScore}`
  );
  check(
    "WM-roller dekker WM bedre enn Box Midfield",
    wmFitOnWm.roleCoverage.coverageScore > wmFitOnBox.roleCoverage.coverageScore,
    `WM coverage=${wmFitOnWm.roleCoverage.coverageScore}, Box coverage=${wmFitOnBox.roleCoverage.coverageScore}`
  );
}

// --- 4) Historisk pyramide-2-3-5 blir ikke automatisk dårlig ------------------
{
  const formation = getFormation("pyramid_235");
  const fit = calculateHistoricalFormationFit({
    assignments: lineup([
      "support_fullback", // traditional_full_back
      "wide_dribbler", // outside_forward
      "advanced_forward", // centre_forward
      "free_creator",
      "box_to_box"
    ]),
    baseMetrics: neutralBaseMetrics({ restDefenseScore: 48 }),
    formation,
    tactic: { tags: [] }
  });
  check(
    "Pyramide-2-3-5: ikke automatisk dårlig score tross lavere restforsvar",
    fit.historicalScore >= 45,
    `historicalScore=${fit.historicalScore}`
  );
}

// --- 5) Moderne 3-2-5 krever høyere restforsvar/rolledekning ------------------
{
  const formation = getFormation("positional_325");
  // Feil roller for et very_high posisjonelt system.
  const wrongRoles = calculateHistoricalFormationFit({
    assignments: lineup(["target_striker", "stopper", "wide_dribbler", "support_fullback", "advanced_forward"]),
    baseMetrics: neutralBaseMetrics({ restDefenseScore: 45 }),
    formation,
    tactic: { tags: [] }
  });
  // Riktigere roller for posisjonelt 3-2-5.
  const rightRoles = calculateHistoricalFormationFit({
    assignments: lineup(["inverted_fullback", "ball_playing_centre_back", "regista", "inverted_winger", "false_nine"]),
    baseMetrics: neutralBaseMetrics({ restDefenseScore: 70 }),
    formation,
    tactic: { tags: [] }
  });
  check(
    "Moderne 3-2-5: feil roller gir lavere score enn riktige roller",
    rightRoles.historicalScore > wrongRoles.historicalScore,
    `right=${rightRoles.historicalScore}, wrong=${wrongRoles.historicalScore}`
  );
  check(
    "Moderne 3-2-5: feil roller gir historicalPenalty",
    wrongRoles.historicalPenalty > 0,
    `penalty=${wrongRoles.historicalPenalty}`
  );
}

// --- 6) misusedPlayerTypes gir penalty ----------------------------------------
{
  const formation = getFormation("low_block_541");
  // false_nine og classic_ten er misused i lav blokk; wide_dribbler -> dribbler_forward (misused).
  const coverage = calculateHistoricalRoleCoverage({
    assignments: lineup(["false_nine", "classic_ten", "wide_dribbler", "stopper", "target_striker"]),
    formation
  });
  check(
    "Lav blokk: misusedPlayerTypes gir misusePenalty",
    coverage.misusePenalty > 0,
    `misusePenalty=${coverage.misusePenalty}, misusedMatched=${coverage.misusedMatched.join(",")}`
  );
}

// --- 7) Robusthet: manglende roleRequirements/matchEngineEffects krasjer ikke -
{
  const bareFormation = { id: "bare", name: "Bar formasjon", slots: [] };
  const coverage = calculateHistoricalRoleCoverage({
    assignments: lineup(["libero"]),
    formation: bareFormation
  });
  check(
    "Uten roleRequirements: nøytral coverageScore (60)",
    coverage.coverageScore === 60,
    `coverageScore=${coverage.coverageScore}`
  );

  const adjust = calculateHistoricalMetricAdjustments({
    baseMetrics: neutralBaseMetrics(),
    formation: bareFormation,
    roleCoverage: coverage
  });
  check(
    "Uten matchEngineEffects: metrics uendret + note",
    adjust.adjustments.length === 0 && adjust.notes.length > 0 && adjust.metrics.widthScore === 58,
    `adjustments=${adjust.adjustments.length}, notes=${adjust.notes.length}`
  );

  let crashed = false;
  try {
    calculateHistoricalFormationFit({});
    calculateHistoricalFormationFit({ assignments: null, formation: null, baseMetrics: null });
  } catch (error) {
    crashed = true;
    check("Tomme/null-argumenter krasjer ikke", false, error.message);
  }
  if (!crashed) {
    check("Tomme/null-argumenter krasjer ikke", true);
  }
}

// --- Rapport ------------------------------------------------------------------
console.log("Historical formation fit audit\n");
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
