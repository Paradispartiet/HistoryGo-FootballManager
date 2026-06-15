// scripts/simulate-training-program-compositions.mjs
//
// Deterministisk simulering + validering av Training Program Composition v1
// (src/football-training-program-compositions.js). Rent Node-script
// (standardbibliotek + de plain-ESM .js-motorene) — ingen DOM, localStorage
// eller bygg kreves.
//
// Verifiserer:
//   - fast schema på hvert program og hver økt
//   - 2–4 programmer ved fullt datagrunnlag
//   - trygg degradering uten opponent / teamFit / coachContext
//   - recovery får bonus ved høy fatigue/wear
//   - recovery får overusePenalty hvis brukt for ofte
//   - defensiv struktur prioriteres før sterk/risky motstander
//   - oppbygging prioriteres mot høyt press / build-up-risiko
//   - pressuke får riskAdjustment/penalty ved høy fatigue
//   - determinisme (to like kall gir byte-identisk JSON)
//   - alle relatedTrainingFocusIds peker på ekte fokus-id-er
//
// Exit code 1 hvis en sjekk feiler, ellers 0.

import {
  createTrainingProgramCompositions,
  scoreTrainingProgramComposition,
  flattenTrainingProgramSessions,
  getTrainingProgramCompositionById,
  getTrainingProgramCompositionIds
} from "../src/football-training-program-compositions.js";
import { TRAINING_FOCUSES } from "../src/football-training-week.js";
import { OPPONENT_PROFILES } from "../src/football-matchday-engine.js";

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

const validFocusIds = new Set(TRAINING_FOCUSES.map((f) => f.id));
const INTENSITY = new Set(["low", "medium", "high"]);
const DURATION = new Set(["short", "normal", "long"]);

// --- Felles testfikstur ----------------------------------------------------
const teamFit = {
  teamScore: 68,
  metrics: {
    balanceScore: 60,
    widthScore: 55,
    depthScore: 50,
    buildUpScore: 48,
    pressScore: 66,
    restDefenseScore: 52,
    roleFitAverage: 61,
    relationshipScore: 60,
    individualFitAverage: 70,
    tacticFitAverage: 66
  }
};

const coachContext = {
  coachUnderstanding: 48,
  formationFamiliarity: 50,
  activeStaff: [{ category: "tactical_coach" }, { category: "fitness_coach" }],
  effectProfile: { pressingDrills: 70, defensiveOrganisation: 66, attackingPatterns: 64 }
};

const strongOpponent = OPPONENT_PROFILES.find((o) => o.id === "direct_counter_opponent");
const highPressOpponent = OPPONENT_PROFILES.find((o) => o.id === "high_press_opponent");
const possessionOpponent = OPPONENT_PROFILES.find((o) => o.id === "possession_opponent");

const riskyMatchup = {
  lean: "risky",
  risks: [{ token: "high_press" }, { token: "direct_counter" }],
  advantages: []
};

const formation = { id: "total_343", name: "Total 3-4-3", tacticalDifficulty: "high" };

// --- Schemavalidering ------------------------------------------------------
function validateSession(s, label) {
  check(`${label}: day er ikke-tom streng`, typeof s.day === "string" && s.day.length > 0);
  check(`${label}: title er ikke-tom streng`, typeof s.title === "string" && s.title.length > 0);
  check(`${label}: focusId er ikke-tom streng`, typeof s.focusId === "string" && s.focusId.length > 0);
  check(`${label}: intensity gyldig`, INTENSITY.has(s.intensity));
  check(`${label}: duration gyldig`, DURATION.has(s.duration));
  check(`${label}: tacticalObjective er ikke-tom streng`, typeof s.tacticalObjective === "string" && s.tacticalObjective.length > 0);
  check(`${label}: expectedEffect er strengarray`, Array.isArray(s.expectedEffect) && s.expectedEffect.every((x) => typeof x === "string"));
  check(`${label}: fatigueLoad er tall`, typeof s.fatigueLoad === "number" && Number.isFinite(s.fatigueLoad));
  check(`${label}: injuryRiskModifier er tall`, typeof s.injuryRiskModifier === "number" && Number.isFinite(s.injuryRiskModifier));
}

function validateProgram(p, label) {
  const isArr = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");
  check(`${label}: id ikke-tom streng`, typeof p.id === "string" && p.id.length > 0);
  check(`${label}: title ikke-tom streng`, typeof p.title === "string" && p.title.length > 0);
  check(`${label}: type === training_program`, p.type === "training_program");
  check(`${label}: category ikke-tom streng`, typeof p.category === "string" && p.category.length > 0);
  check(`${label}: summary ikke-tom streng`, typeof p.summary === "string" && p.summary.length > 0);
  check(`${label}: weekGoal ikke-tom streng`, typeof p.weekGoal === "string" && p.weekGoal.length > 0);
  check(`${label}: recommendedBecause strengarray`, isArr(p.recommendedBecause) && p.recommendedBecause.length > 0);
  check(`${label}: conditions strengarray`, isArr(p.conditions) && p.conditions.length > 0);
  check(`${label}: sessions har 1+ økter`, Array.isArray(p.sessions) && p.sessions.length > 0);
  (Array.isArray(p.sessions) ? p.sessions : []).forEach((s, i) => validateSession(s, `${label}.sessions[${i}]`));
  check(`${label}: targetMetrics strengarray`, isArr(p.targetMetrics) && p.targetMetrics.length > 0);
  check(
    `${label}: relatedTrainingFocusIds peker på ekte fokus`,
    isArr(p.relatedTrainingFocusIds) && p.relatedTrainingFocusIds.length > 0 && p.relatedTrainingFocusIds.every((id) => validFocusIds.has(id))
  );
  check(`${label}: risks strengarray`, isArr(p.risks) && p.risks.length > 0);
  check(`${label}: suggestedAdjustments strengarray`, isArr(p.suggestedAdjustments) && p.suggestedAdjustments.length > 0);

  const sc = p.scoring;
  check(`${label}: scoring finnes`, sc && typeof sc === "object");
  if (sc && typeof sc === "object") {
    check(`${label}: baseScore tall`, typeof sc.baseScore === "number" && Number.isFinite(sc.baseScore));
    check(`${label}: contextBonus tall`, typeof sc.contextBonus === "number" && Number.isFinite(sc.contextBonus));
    check(`${label}: overusePenalty tall <= 0`, typeof sc.overusePenalty === "number" && sc.overusePenalty <= 0);
    check(`${label}: riskAdjustment tall`, typeof sc.riskAdjustment === "number" && Number.isFinite(sc.riskAdjustment));
    check(`${label}: totalScore tall`, typeof sc.totalScore === "number" && Number.isFinite(sc.totalScore));
    check(
      `${label}: totalScore = base+context+overuse+risk`,
      sc.totalScore === sc.baseScore + sc.contextBonus + sc.overusePenalty + sc.riskAdjustment
    );
    check(`${label}: explanation strengarray`, isArr(sc.explanation) && sc.explanation.length > 0);
  }
  check(`${label}: confidence i [0,1]`, typeof p.confidence === "number" && p.confidence >= 0 && p.confidence <= 1);
  check(`${label}: sourceSignals strengarray`, isArr(p.sourceSignals));
}

function validateList(list, label, { min = 2, max = 4 } = {}) {
  check(`${label}: er array`, Array.isArray(list));
  check(`${label}: ${min}–${max} programmer`, Array.isArray(list) && list.length >= min && list.length <= max);
  const ids = (Array.isArray(list) ? list : []).map((p) => p.id);
  check(`${label}: unike id-er`, new Set(ids).size === ids.length);
  (Array.isArray(list) ? list : []).forEach((p, i) => validateProgram(p, `${label}[${i}]`));
}

console.log("Training Program Composition v1 — simulering\n");

// === 1. Fullt datagrunnlag =================================================
console.log("Fullt datagrunnlag:");
const full = createTrainingProgramCompositions({
  teamFit,
  opponent: strongOpponent,
  formation,
  tactic: { id: "balanced", name: "Balansert" },
  formationMatchup: riskyMatchup,
  coachContext,
  lastMatchWeaknessMetric: "restDefenseScore",
  fatigueRisk: 0.3,
  wearRisk: 0.25,
  injuryRisk: 0.2,
  recentTrainingFocusIds: [],
  limit: 4
});
validateList(full, "full");

// === 2. Degradering: uten opponent =========================================
console.log("\nDegradering — uten opponent:");
const noOpponent = createTrainingProgramCompositions({ teamFit, coachContext, formation, limit: 4 });
validateList(noOpponent, "noOpponent");

// === 3. Degradering: uten teamFit ==========================================
console.log("\nDegradering — uten teamFit:");
const noTeamFit = createTrainingProgramCompositions({ opponent: strongOpponent, coachContext, limit: 4 });
validateList(noTeamFit, "noTeamFit");

// === 4. Degradering: uten coachContext =====================================
console.log("\nDegradering — uten coachContext:");
const noCoach = createTrainingProgramCompositions({ teamFit, opponent: strongOpponent, limit: 4 });
validateList(noCoach, "noCoach");

// === 5. Helt tomt input ====================================================
console.log("\nDegradering — tomt input:");
let empty;
let threw = false;
try {
  empty = createTrainingProgramCompositions();
} catch (e) {
  threw = true;
  console.error("    kastet:", e.message);
}
check("tomt input kaster ikke", !threw);
validateList(empty, "empty");
check("tomt input inkluderer balansert fallback", empty.some((p) => p.id === "balanced_learning"));

// === 6. Recovery: bonus ved høy fatigue/wear ===============================
console.log("\nRecovery — slitasjekontekst:");
const tired = createTrainingProgramCompositions({
  teamFit,
  fatigueRisk: 0.85,
  wearRisk: 0.8,
  injuryRisk: 0.6,
  limit: 4
});
const tiredRecovery = tired.find((p) => p.id === "recovery_prevention");
check("recovery er med ved høy slitasje", Boolean(tiredRecovery));
check("recovery får positiv contextBonus ved slitasje", tiredRecovery && tiredRecovery.scoring.contextBonus > 0);
check("recovery får positiv riskAdjustment ved skaderisiko", tiredRecovery && tiredRecovery.scoring.riskAdjustment > 0);

// Uten slitasje skal recovery IKKE ha contextbonus (ikke alltid positivt).
const fresh = getTrainingProgramCompositionById("recovery_prevention", { teamFit });
check("recovery uten slitasje gir ingen contextBonus", fresh && fresh.scoring.contextBonus === 0);
check(
  "recovery rangerer høyere når sliten enn når frisk",
  tiredRecovery.scoring.totalScore > fresh.scoring.totalScore
);

// === 7. Recovery: overusePenalty ved gjentatt bruk =========================
console.log("\nRecovery — overforbruk:");
const overusedRecovery = getTrainingProgramCompositionById("recovery_prevention", {
  teamFit,
  fatigueRisk: 0.85,
  wearRisk: 0.8,
  recentTrainingFocusIds: ["recovery_prevention", "recovery_prevention", "recovery_prevention"]
});
check("recovery får overusePenalty ved gjentatt bruk", overusedRecovery.scoring.overusePenalty < 0);
check(
  "overforbruk senker totalScore vs. samme slitasje uten overforbruk",
  overusedRecovery.scoring.totalScore <
    getTrainingProgramCompositionById("recovery_prevention", { teamFit, fatigueRisk: 0.85, wearRisk: 0.8 }).scoring.totalScore
);

// === 8. Defensiv struktur prioriteres før sterk/risky motstander ===========
console.log("\nDefensiv struktur — sterk motstander:");
const vsStrong = createTrainingProgramCompositions({
  teamFit,
  opponent: strongOpponent,
  formationMatchup: riskyMatchup,
  limit: 4
});
const defStrong = vsStrong.find((p) => p.id === "defensive_structure");
check("defensiv struktur er med mot sterk/risky motstander", Boolean(defStrong));
check("defensiv struktur får contextBonus mot sterk/risky motstander", defStrong && defStrong.scoring.contextBonus > 0);
const defWeak = getTrainingProgramCompositionById("defensive_structure", { teamFit });
check(
  "defensiv struktur skårer høyere mot sterk motstander enn uten",
  defStrong.scoring.totalScore > defWeak.scoring.totalScore
);

// === 9. Oppbygging prioriteres mot høyt press ==============================
console.log("\nOppbygging — mot høyt press:");
const vsPress = createTrainingProgramCompositions({
  teamFit,
  opponent: highPressOpponent,
  formationMatchup: { lean: "risky", risks: [{ token: "high_press" }], advantages: [] },
  limit: 4
});
const buildUp = vsPress.find((p) => p.id === "buildup_vs_press");
check("oppbygging er med mot høyt press", Boolean(buildUp));
check("oppbygging får contextBonus mot høyt press", buildUp && buildUp.scoring.contextBonus > 0);
const buildUpNeutral = getTrainingProgramCompositionById("buildup_vs_press", { teamFit });
check(
  "oppbygging skårer høyere mot høyt press enn nøytralt",
  buildUp.scoring.totalScore > buildUpNeutral.scoring.totalScore
);

// === 10. Pressuke får riskAdjustment/penalty ved høy fatigue ===============
console.log("\nPressuke — høy fatigue:");
const pressTired = getTrainingProgramCompositionById("press_week", {
  teamFit,
  opponent: possessionOpponent,
  fatigueRisk: 0.85,
  wearRisk: 0.8
});
check("pressuke får negativ riskAdjustment ved høy fatigue", pressTired.scoring.riskAdjustment < 0);
const pressFresh = getTrainingProgramCompositionById("press_week", { teamFit, opponent: possessionOpponent });
check(
  "pressuke skårer lavere sliten enn frisk (samme motstander)",
  pressTired.scoring.totalScore < pressFresh.scoring.totalScore
);

// === 11. Determinisme ======================================================
console.log("\nDeterminisme:");
const a = createTrainingProgramCompositions({
  teamFit,
  opponent: strongOpponent,
  formation,
  formationMatchup: riskyMatchup,
  coachContext,
  fatigueRisk: 0.3,
  limit: 4
});
const b = createTrainingProgramCompositions({
  teamFit,
  opponent: strongOpponent,
  formation,
  formationMatchup: riskyMatchup,
  coachContext,
  fatigueRisk: 0.3,
  limit: 4
});
check("to like kall gir byte-identisk JSON", JSON.stringify(a) === JSON.stringify(b));

// === 12. relatedTrainingFocusIds på alle maler =============================
console.log("\nRelaterte fokus-id-er:");
let allFocusOk = true;
for (const id of getTrainingProgramCompositionIds()) {
  const comp = getTrainingProgramCompositionById(id);
  const ok = comp && comp.relatedTrainingFocusIds.length > 0 && comp.relatedTrainingFocusIds.every((f) => validFocusIds.has(f));
  if (!ok) {
    allFocusOk = false;
    console.error(`    FEIL: ${id} har ugyldige relatedTrainingFocusIds`);
  }
}
check("alle programmer peker på ekte treningsfokus", allFocusOk);

// === 13. flatten + score offentlig API =====================================
console.log("\nHjelpe-API:");
const flat = flattenTrainingProgramSessions(full[0]);
check("flattenTrainingProgramSessions gir øktene", Array.isArray(flat) && flat.length === full[0].sessions.length);
const flatMany = flattenTrainingProgramSessions(full);
check("flattenTrainingProgramSessions tåler liste", Array.isArray(flatMany) && flatMany.length >= flat.length);
const scored = scoreTrainingProgramComposition(full[0], { teamFit, opponent: strongOpponent });
check("scoreTrainingProgramComposition gir gyldig regnskap", scored && typeof scored.totalScore === "number");
check("getTrainingProgramCompositionById(ukjent) gir null", getTrainingProgramCompositionById("finnes_ikke") === null);

// === 14. limit respekteres =================================================
console.log("\nGrenser (limit):");
const limited = createTrainingProgramCompositions({ teamFit, opponent: strongOpponent, limit: 2 });
check("limit=2 gir nøyaktig 2 programmer", limited.length === 2);
const overLimit = createTrainingProgramCompositions({ teamFit, limit: 99 });
check("limit kappes på 4", overLimit.length === 4);

// === 15. Alle motstanderprofiler gir gyldige programmer ====================
console.log("\nAlle motstanderprofiler:");
let allProfilesOk = true;
for (const profile of OPPONENT_PROFILES) {
  const list = createTrainingProgramCompositions({ teamFit, opponent: profile, coachContext, limit: 4 });
  const ok = list.length >= 2 && list.length <= 4 && list.every((p) => p.confidence >= 0 && p.confidence <= 1);
  if (!ok) {
    allProfilesOk = false;
    console.error(`    FEIL for profil ${profile.id}`);
  }
}
check("alle motstanderprofiler gir gyldige programmer", allProfilesOk);

// === 16. Off-pitch context som input =======================================
console.log("\nOff-pitch context:");
// Off-pitch-state leses som ren data (team/squad-felt 0–100). Høy slitasje skal
// gjøre recovery mer verdt og pressuke farligere — uten å bryte API-et.
const offPitchTired = {
  version: "historygo-football-manager.off-pitch.v1",
  team: { fatigue: 84, wear: 78, injuryRisk: 58, pressure: 40, cohesion: 50 },
  squad: { tacticalClarity: 30, hiddenStress: 30 }
};
let offThrew = false;
let withOff;
try {
  withOff = createTrainingProgramCompositions({ teamFit, offPitchState: offPitchTired, limit: 7 });
} catch (e) {
  offThrew = true;
  console.error("    kastet:", e.message);
}
check("offPitchState som input kaster ikke", !offThrew);
const offRecovery = (withOff || []).find((p) => p.id === "recovery_prevention");
check("recovery henter slitasje fra off-pitch-state", offRecovery && offRecovery.scoring.contextBonus > 0);
check("recovery bærer offPitch som sourceSignal", offRecovery && offRecovery.sourceSignals.includes("offPitch"));
const offShape = getTrainingProgramCompositionById("formation_familiarisation", { teamFit, offPitchState: offPitchTired });
check("formasjonstilvenning får off-pitch-bonus ved lav taktisk klarhet", offShape && offShape.scoring.contextBonus > 0);
const offPress = getTrainingProgramCompositionById("press_week", { teamFit, offPitchState: offPitchTired });
check("pressuke straffes av off-pitch-slitasje", offPress.scoring.riskAdjustment < 0);
// offPitchSignals-pakke (med .state) skal også godtas.
const viaSignals = getTrainingProgramCompositionById("recovery_prevention", {
  teamFit,
  offPitchSignals: { state: offPitchTired }
});
check("offPitchSignals.state godtas som kilde", viaSignals.scoring.contextBonus > 0);
// Eksplisitt fatigueRisk skal fortsatt vinne over off-pitch-state.
const explicitWins = getTrainingProgramCompositionById("recovery_prevention", {
  teamFit,
  fatigueRisk: 0,
  wearRisk: 0,
  offPitchState: offPitchTired
});
check("eksplisitt fatigueRisk vinner over off-pitch-state", explicitWins.scoring.contextBonus === 0);

// === Integrasjon: treningsprogram kan lenkes fra inbox =====================
console.log("\nIntegrasjon — treningsprogram → inbox:");
const { createInboxThreadFromTrainingProgram } = await import("../src/football-inbox-events.js");
const relevantProgram = createTrainingProgramCompositions({ teamFit, offPitchState: offPitchTired, limit: 6 })
  .find((p) => p.id === "recovery_prevention");
const inboxTrainingThread = createInboxThreadFromTrainingProgram(relevantProgram, {});
check("off-pitch-relevant program gir en treningstråd", Boolean(inboxTrainingThread) && inboxTrainingThread.type === "training");
check("treningstråd peker tilbake på programmet", inboxTrainingThread?.linkedAction.id === "recovery_prevention");

// --- Rapport ---------------------------------------------------------------
console.log("\nEksempel — fullt datagrunnlag (sortert etter uttelling):");
for (const p of full) {
  console.log(`  • ${p.title} (total ${p.scoring.totalScore}, konfidens ${p.confidence}) — ${p.summary}`);
}

if (failures > 0) {
  console.log(`\n${failures} sjekk(er) feilet. Result: FAIL`);
  process.exit(1);
}
console.log("\nAlle Training Program Composition-sjekker besto.");
process.exit(0);
