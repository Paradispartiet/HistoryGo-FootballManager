// scripts/simulate-suggested-setups.mjs
//
// Deterministisk simulering + validering av Suggested Setups v1
// (src/football-suggested-setups.js). Rent Node-script (standardbibliotek + de
// plain-ESM .js-motorene) — ingen DOM, localStorage eller bygg kreves.
//
// Verifiserer:
//   - schema/form på hvert forslag (alle felter til stede, riktige typer)
//   - at forslag genereres for alle tre typer med fullt datagrunnlag
//   - trygg degradering: uten motstander, uten formasjonskunnskap, uten stab,
//     uten teamFit — aldri en runtime-feil, alltid gyldige (evt. kortere) lister
//   - kontekstuell korrekthet (matchup-relevant treningsfokus prioriteres osv.)
//   - determinisme (to kall gir byte-identisk output)
//
// Exit code 1 hvis en sjekk feiler, ellers 0.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  createSuggestedSetups,
  suggestFormationSetups,
  suggestMatchPlanSetups,
  suggestTrainingWeekSetups,
  flattenSuggestedSetups
} from "../src/football-suggested-setups.js";
import { TRAINING_FOCUSES } from "../src/football-training-week.js";
import { OPPONENT_PROFILES } from "../src/football-matchday-engine.js";
import { getHistoricalOpponentProfile } from "../src/football-historical-opponent-profiles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
function loadJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

// --- Data og felles testfikstur -------------------------------------------
const formations = loadJson("data/hgFootball/formations.json").formations;
const knowledge = loadJson("data/hgFootball/formationKnowledge.json").knowledge;
const knowledgeById = Object.fromEntries(knowledge.map((k) => [k.formationId, k]));
const formationById = Object.fromEntries(formations.map((f) => [f.id, f]));
const validFocusIds = new Set(TRAINING_FOCUSES.map((f) => f.id));
const VALID_TYPES = new Set(["formation", "match_plan", "training_week"]);

// Velg en formasjon som faktisk har kunnskapsoppslag, så matchup-stien testes.
const currentFormation = formationById[knowledge[0].formationId];
// possession_433 er svak mot høyt press → gir en risikabel matchup mot
// Pressmaskinen, perfekt for å teste matchup-relevant treningsfokus.
const possession = formationById.possession_433;
const highPressOpponent = OPPONENT_PROFILES.find((o) => o.id === "high_press_opponent");

const coachContext = {
  coachUnderstanding: 60,
  formationFamiliarity: 58,
  tacticalLearningSpeed: 62,
  roleFitClarity: 60,
  activeStaff: [
    { category: "tactical_coach" },
    { category: "fitness_coach" },
    { category: "assistant_coach" }
  ],
  effectProfile: {
    pressingDrills: 70,
    defensiveOrganisation: 66,
    attackingPatterns: 64,
    roleFitClarity: 62,
    formationFamiliarity: 64
  }
};

const teamFit = {
  teamScore: 68,
  completeCount: 11,
  totalSlots: 11,
  metrics: {
    balanceScore: 60,
    widthScore: 55,
    depthScore: 58,
    buildUpScore: 48, // bevisst lavest → blir lagets svakeste ledd
    pressScore: 64,
    restDefenseScore: 52,
    roleFitAverage: 61,
    relationshipScore: 60,
    individualFitAverage: 70,
    tacticFitAverage: 66
  },
  relationships: { relationshipScore: 60 }
};

const tactic = { id: "central_possession_4231", name: "Sentralt possession-spill 4-2-3-1" };

// --- Schemavalidering ------------------------------------------------------
function validateSuggestion(s, expectedType, label) {
  const isArr = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");
  check(`${label}: id er ikke-tom streng`, typeof s.id === "string" && s.id.length > 0);
  check(`${label}: title er ikke-tom streng`, typeof s.title === "string" && s.title.length > 0);
  check(`${label}: type === ${expectedType}`, s.type === expectedType && VALID_TYPES.has(s.type));
  check(`${label}: summary er ikke-tom streng`, typeof s.summary === "string" && s.summary.length > 0);
  check(`${label}: why er strengarray`, isArr(s.why) && s.why.length > 0);
  check(`${label}: recommendedBecause er strengarray`, isArr(s.recommendedBecause));
  check(`${label}: risks er strengarray`, isArr(s.risks));
  check(`${label}: suggestedAdjustments er strengarray`, isArr(s.suggestedAdjustments) && s.suggestedAdjustments.length > 0);
  check(`${label}: relatedTrainingFocusIds peker på ekte fokus`, isArr(s.relatedTrainingFocusIds) && s.relatedTrainingFocusIds.every((id) => validFocusIds.has(id)));
  check(`${label}: confidence i [0,1]`, typeof s.confidence === "number" && s.confidence >= 0 && s.confidence <= 1);
  check(`${label}: sourceSignals er strengarray`, isArr(s.sourceSignals));
}

function validateBundle(bundle, label, { maxPerType = 4 } = {}) {
  ["formation", "match_plan", "training_week"].forEach((type) => {
    const list = bundle[type];
    check(`${label}.${type} er array`, Array.isArray(list));
    check(`${label}.${type} har 0–${maxPerType} forslag`, Array.isArray(list) && list.length <= maxPerType);
    (Array.isArray(list) ? list : []).forEach((s, i) => validateSuggestion(s, type, `${label}.${type}[${i}]`));
    // Unike id-er per type.
    const ids = (Array.isArray(list) ? list : []).map((s) => s.id);
    check(`${label}.${type} har unike id-er`, new Set(ids).size === ids.length);
  });
}

console.log("Suggested Setups v1 — simulering\n");

// === 1. Fullt datagrunnlag =================================================
console.log("Fullt datagrunnlag (formasjon + kunnskap + motstander + stab + teamFit):");
const full = createSuggestedSetups({
  teamFit,
  formation: possession,
  tactic,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: highPressOpponent,
  coachContext,
  lastMatchWeaknessMetric: "restDefenseScore",
  limit: 4
});
validateBundle(full, "full");
check("full: minst 2 formasjonsforslag", full.formation.length >= 2);
check("full: minst 2 kampplanforslag", full.match_plan.length >= 2);
check("full: minst 2 treningsforslag", full.training_week.length >= 2);

// Matchup-relevant treningsfokus skal prioriteres: possession_433 er svak mot
// høyt press → build_up adresserer det → skal være første treningsforslag.
check(
  "full: build_up prioriteres som treningsfokus mot høyt press",
  full.training_week[0]?.relatedTrainingFocusIds.includes("build_up")
);
check(
  "full: treningsforslag bærer matchup-signal",
  full.training_week[0]?.sourceSignals.includes("formationKnowledge")
);

// Kampplan skal ha en matchup-basert hovedplan.
check(
  "full: kampplan inneholder matchup-basert plan",
  full.match_plan.some((p) => p.id.startsWith("match_plan:matchup_"))
);
// Formasjonsforslag mot høyt press skal advare mot oppbygging under press.
const possessionSuggestion = full.formation.find((s) => s.id === "formation:possession_433");
check(
  "full: possession_433-forslag har risiko mot høyt press",
  Boolean(possessionSuggestion) && possessionSuggestion.risks.length > 0
);

// === 2. Determinisme =======================================================
console.log("\nDeterminisme:");
const fullAgain = createSuggestedSetups({
  teamFit,
  formation: possession,
  tactic,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: highPressOpponent,
  coachContext,
  lastMatchWeaknessMetric: "restDefenseScore",
  limit: 4
});
check("to kall gir byte-identisk output", JSON.stringify(full) === JSON.stringify(fullAgain));

// === 3. Degradering: uten motstander =======================================
console.log("\nDegradering — uten motstander:");
const noOpponent = createSuggestedSetups({
  teamFit,
  formation: possession,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: null,
  coachContext,
  limit: 4
});
validateBundle(noOpponent, "noOpponent");
check("uten motstander: fortsatt formasjonsforslag", noOpponent.formation.length >= 1);
check("uten motstander: fortsatt kampplanforslag (fra teamFit)", noOpponent.match_plan.length >= 1);
check("uten motstander: fortsatt treningsforslag (fra lagsvakhet)", noOpponent.training_week.length >= 1);
check(
  "uten motstander: svakeste ledd (buildUp) gir build_up-trening",
  flattenSuggestedSetups(noOpponent).some((s) => s.type === "training_week" && s.relatedTrainingFocusIds.includes("build_up"))
);

// === 4. Degradering: uten formasjonskunnskap ===============================
console.log("\nDegradering — uten formasjonskunnskap:");
const noKnowledge = createSuggestedSetups({
  teamFit,
  formation: possession,
  availableFormations: formations,
  formationKnowledgeById: {},
  opponent: highPressOpponent,
  coachContext,
  limit: 4
});
validateBundle(noKnowledge, "noKnowledge");
check("uten kunnskap: formasjonsforslag finnes likevel", noKnowledge.formation.length >= 1);
check(
  "uten kunnskap: formasjonsforslag bruker vanskelighetsgrad, ikke matchup",
  noKnowledge.formation.every((s) => !s.sourceSignals.includes("formationKnowledge"))
);

// === 5. Degradering: uten stab =============================================
console.log("\nDegradering — uten stab (coachContext = null):");
const noStaff = createSuggestedSetups({
  teamFit,
  formation: possession,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: highPressOpponent,
  coachContext: null,
  limit: 4
});
validateBundle(noStaff, "noStaff");
check(
  "uten stab: treningsforslag flagger manglende stab som risiko",
  noStaff.training_week.every((s) => s.risks.some((r) => /stab/i.test(r)))
);

// === 6. Degradering: helt tomt input =======================================
console.log("\nDegradering — tomt/manglende input:");
let empty;
let threw = false;
try {
  empty = createSuggestedSetups();
} catch (error) {
  threw = true;
  console.error("    kastet:", error.message);
}
check("tomt input kaster ikke", !threw);
check("tomt input gir tre arrays", empty && Array.isArray(empty.formation) && Array.isArray(empty.match_plan) && Array.isArray(empty.training_week));
// Uten noe datagrunnlag skal training fortsatt gi et trygt standardfokus.
check("tomt input gir et trygt standard treningsfokus", empty.training_week.length >= 1 && empty.training_week[0].relatedTrainingFocusIds.length > 0);

// Enkeltgeneratorer skal også tåle helt tomt kall.
check("suggestFormationSetups() uten args kaster ikke", Array.isArray(suggestFormationSetups()));
check("suggestMatchPlanSetups() uten args kaster ikke", Array.isArray(suggestMatchPlanSetups()));
check("suggestTrainingWeekSetups() uten args kaster ikke", Array.isArray(suggestTrainingWeekSetups()));

// === 7. limit respekteres ==================================================
console.log("\nGrenser (limit):");
const limited = createSuggestedSetups({
  teamFit,
  formation: possession,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: highPressOpponent,
  coachContext,
  limit: 2
});
validateBundle(limited, "limited", { maxPerType: 2 });
check("limit=2: høyst 2 formasjonsforslag", limited.formation.length <= 2);
check("limit=2: høyst 2 treningsforslag", limited.training_week.length <= 2);

// === 8. Alle motstanderprofiler gir gyldige bunter =========================
console.log("\nAlle motstanderprofiler:");
let allProfilesOk = true;
for (const profile of OPPONENT_PROFILES) {
  const bundle = createSuggestedSetups({
    teamFit,
    formation: possession,
    availableFormations: formations,
    formationKnowledgeById: knowledgeById,
    opponent: profile,
    coachContext,
    limit: 4
  });
  const flat = flattenSuggestedSetups(bundle);
  const ok = flat.length > 0
    && flat.every((s) => VALID_TYPES.has(s.type) && s.confidence >= 0 && s.confidence <= 1)
    && flat.every((s) => s.relatedTrainingFocusIds.every((id) => validFocusIds.has(id)));
  if (!ok) {
    allProfilesOk = false;
    console.error(`    FEIL for profil ${profile.id}`);
  }
}
check("alle motstanderprofiler gir gyldige forslag", allProfilesOk);

// === 9. Off-pitch context: trygg degradering med og uten ====================
console.log("\nOff-pitch context (med og uten):");
// Forslagene skal bare se det HALVSKJULTE laget (synlige signaler), aldri rå
// hidden-tall. Med høy slitasje/press skal et off-pitch-signal kunne dukke opp
// additivt; uten off-pitch skal forslagene være identiske med før.
const offPitchPressured = {
  version: "historygo-football-manager.off-pitch.v1",
  team: { fatigue: 82, wear: 78, injuryRisk: 55, pressure: 80, boardPressure: 74 },
  squad: { tacticalClarity: 45, hiddenStress: 30 },
  hidden: { mentalLoad: 60, privatePressure: 50, dressingRoomConcern: 40 }
};
let offThrew = false;
let withOff;
try {
  withOff = createSuggestedSetups({
    teamFit,
    formation: possession,
    tactic,
    availableFormations: formations,
    formationKnowledgeById: knowledgeById,
    opponent: highPressOpponent,
    coachContext,
    lastMatchWeaknessMetric: "restDefenseScore",
    offPitchState: offPitchPressured,
    limit: 4
  });
} catch (error) {
  offThrew = true;
  console.error("    kastet:", error.message);
}
check("offPitchState som input kaster ikke", !offThrew);
validateBundle(withOff, "withOff");
check(
  "off-pitch: treningsforslag kan bære offPitch-signal",
  flattenSuggestedSetups(withOff).some((s) => s.type === "training_week" && s.sourceSignals.includes("offPitch"))
);
check(
  "off-pitch: kampplan kan bære offPitch-signal ved høyt press",
  withOff.match_plan.some((s) => s.sourceSignals.includes("offPitch"))
);
check(
  "off-pitch: rå hidden-tall lekker ikke inn i forslagstekst",
  flattenSuggestedSetups(withOff).every((s) =>
    [...s.suggestedAdjustments, ...s.why].every((t) => !/mentalLoad|privatePressure|dressingRoomConcern/.test(t))
  )
);

// Uten off-pitch: byte-identisk med 'full' (ingen offPitch-signal lekker inn).
const withoutOff = createSuggestedSetups({
  teamFit,
  formation: possession,
  tactic,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: highPressOpponent,
  coachContext,
  lastMatchWeaknessMetric: "restDefenseScore",
  limit: 4
});
check("uten off-pitch: byte-identisk med fullt datagrunnlag", JSON.stringify(withoutOff) === JSON.stringify(full));
check(
  "uten off-pitch: ingen offPitch-signal i noe forslag",
  flattenSuggestedSetups(withoutOff).every((s) => !s.sourceSignals.includes("offPitch"))
);

// === Historical Opponent Archetypes v1 =====================================
console.log("\nHistorisk stil-motstander (Inter 1960-tallet — Catenaccio):");
const catenaccio = getHistoricalOpponentProfile("inter_1960s_catenaccio");
const histSetups = createSuggestedSetups({
  teamFit,
  formation: possession,
  tactic,
  availableFormations: formations,
  formationKnowledgeById: knowledgeById,
  opponent: catenaccio,
  coachContext,
  limit: 4
});
validateBundle(histSetups, "historisk");
check("historisk: kampplanforslag genereres", histSetups.match_plan.length >= 2);
check(
  "historisk: et forslag refererer den historiske motstanderens navn",
  flattenSuggestedSetups(histSetups).some((s) =>
    [s.title, s.summary, ...s.why].some((t) => typeof t === "string" && t.includes("Catenaccio"))
  )
);
check(
  "historisk: motstanderens svakhet (bredde/tålmodighet) brukes i en kampplan",
  histSetups.match_plan.some((s) => s.why.some((t) => /bredde|tålmodig|kompakt/i.test(t)))
);

// --- Rapport ---------------------------------------------------------------
console.log("\nEksempel — fullt datagrunnlag mot Pressmaskinen:");
for (const type of ["formation", "match_plan", "training_week"]) {
  console.log(`  [${type}]`);
  for (const s of full[type]) {
    console.log(`   • ${s.title} (konfidens ${s.confidence}) — ${s.summary}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} sjekk(er) feilet. Result: FAIL`);
  process.exit(1);
}
console.log("\nAlle Suggested Setups-sjekker besto.");
process.exit(0);
