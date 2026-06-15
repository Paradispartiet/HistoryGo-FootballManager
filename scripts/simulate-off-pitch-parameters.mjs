// scripts/simulate-off-pitch-parameters.mjs
//
// Deterministisk simulering + validering av Off-pitch Parameters v1
// (src/football-off-pitch-parameters.js). Rent Node-script (standardbibliotek +
// de plain-ESM .js-motorene) — ingen DOM, localStorage eller bygg kreves.
//
// Verifiserer:
//   - createDefaultOffPitchState gir gyldig schema
//   - normalizeOffPitchState tåler tomt/ufullstendig input og clamper 0–100
//   - applyOffPitchEvent endrer riktige parametre deterministisk
//   - høy fatigue gir synlig signal om tung belastning
//   - høy hiddenStress gir synlig, men ikke fullstendig avslørende signal
//   - recovery-program reduserer fatigue/wear/injuryRisk
//   - pressuke øker fatigue/wear og får høyere risiko ved høy fatigue
//   - formasjonstilvenning øker taktisk klarhet
//   - scoreOffPitchFitForTrainingProgram favoriserer recovery / straffer press
//   - to like kall gir byte-identisk JSON
//   - integrasjon med training program compositions og suggested setups
//
// Exit code 1 hvis en sjekk feiler, ellers 0.

import {
  createDefaultOffPitchState,
  normalizeOffPitchState,
  deriveOffPitchSignals,
  applyOffPitchEvent,
  applyTrainingProgramOffPitchEffects,
  applyMatchdayOffPitchEffects,
  getVisibleOffPitchSignals,
  getHiddenOffPitchModifiers,
  summarizeOffPitchContext,
  scoreOffPitchFitForTrainingProgram,
  createOffPitchDebugSnapshot
} from "../src/football-off-pitch-parameters.js";
import {
  createTrainingProgramCompositions,
  getTrainingProgramCompositionById
} from "../src/football-training-program-compositions.js";
import { createSuggestedSetups } from "../src/football-suggested-setups.js";

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FEIL ${label}`);
  }
}

const SECTIONS = ["team", "squad", "manager", "hidden"];
function allValuesInRange(state) {
  return SECTIONS.every((section) =>
    Object.values(state[section]).every((v) => typeof v === "number" && v >= 0 && v <= 100 && Number.isInteger(v))
  );
}

console.log("Off-pitch Parameters v1 — simulering\n");

// === 1. Default-state schema =================================================
console.log("Default-state:");
const def = createDefaultOffPitchState();
check("version er off-pitch.v1", def.version === "historygo-football-manager.off-pitch.v1");
check("team/squad/manager/hidden finnes", SECTIONS.every((s) => def[s] && typeof def[s] === "object"));
check("recentSignals/recentEvents/recentTrainingProgramIds er arrays",
  Array.isArray(def.recentSignals) && Array.isArray(def.recentEvents) && Array.isArray(def.recentTrainingProgramIds));
check("alle default-verdier i [0,100]", allValuesInRange(def));
check("default er deterministisk (byte-identisk)", JSON.stringify(createDefaultOffPitchState()) === JSON.stringify(createDefaultOffPitchState()));

// === 2. normalizeOffPitchState — robusthet + clamping =======================
console.log("\nNormalisering:");
check("normalizeOffPitchState(undefined) kaster ikke", (() => { try { normalizeOffPitchState(undefined); return true; } catch { return false; } })());
check("tomt input gir samme som default", JSON.stringify(normalizeOffPitchState({})) === JSON.stringify(createDefaultOffPitchState()));
const clamped = normalizeOffPitchState({
  team: { fatigue: 9999, morale: -50, pressure: 73.6 },
  squad: { hiddenStress: "abc" },
  manager: null,
  hidden: { mentalLoad: 250 }
});
check("for høy verdi clampes til 100", clamped.team.fatigue === 100);
check("negativ verdi clampes til 0", clamped.team.morale === 0);
check("desimal rundes", clamped.team.pressure === 74);
check("ugyldig verdi faller til default", clamped.squad.hiddenStress === createDefaultOffPitchState().squad.hiddenStress);
check("manglende seksjon fylles med default", clamped.manager.credibility === createDefaultOffPitchState().manager.credibility);
check("hidden clampes også", clamped.hidden.mentalLoad === 100);
check("normalisert state har alle verdier i [0,100]", allValuesInRange(clamped));

// === 3. applyOffPitchEvent — riktige parametre, deterministisk ==============
console.log("\nHendelser:");
const baseEvent = createDefaultOffPitchState();
const mediaEvent = {
  id: "press_storm",
  type: "media",
  title: "Mediestorm før toppkamp",
  description: "Avisene skriver om press på manageren.",
  effects: { mediaPressure: 25, boardPressure: 10, hiddenStress: 8, morale: -5 }
};
const afterEvent = applyOffPitchEvent(baseEvent, mediaEvent);
check("event muterer ikke input", baseEvent.team.mediaPressure === createDefaultOffPitchState().team.mediaPressure);
check("mediaPressure øker riktig", afterEvent.team.mediaPressure === baseEvent.team.mediaPressure + 25);
check("boardPressure øker riktig", afterEvent.team.boardPressure === baseEvent.team.boardPressure + 10);
check("hiddenStress (squad) øker riktig", afterEvent.squad.hiddenStress === baseEvent.squad.hiddenStress + 8);
check("morale synker riktig", afterEvent.team.morale === baseEvent.team.morale - 5);
check("event legges i recentEvents", afterEvent.recentEvents.some((e) => e.id === "press_storm"));
check("event lager et recentSignal", afterEvent.recentSignals.some((s) => s.text === "Mediestorm før toppkamp"));
check("ukjent effekt-param ignoreres trygt", (() => {
  const r = applyOffPitchEvent(createDefaultOffPitchState(), { effects: { tøys: 50 } });
  return JSON.stringify(r.team) === JSON.stringify(createDefaultOffPitchState().team);
})());
check("to like event-kall gir byte-identisk JSON",
  JSON.stringify(applyOffPitchEvent(createDefaultOffPitchState(), mediaEvent)) ===
    JSON.stringify(applyOffPitchEvent(createDefaultOffPitchState(), mediaEvent)));

// === 4. Synlige signaler — tung belastning og skjult uro ====================
console.log("\nSynlige signaler:");
const tiredState = normalizeOffPitchState({ team: { fatigue: 82, wear: 78 } });
const tiredSignals = getVisibleOffPitchSignals(tiredState);
const physical = tiredSignals.find((s) => s.category === "physical");
check("høy fatigue gir fysisk signal om tung belastning", Boolean(physical) && /tung|slitne|belastning/i.test(physical.text));
check("fysisk signal er flagget som alert", physical && physical.severity === "alert");
check("getVisibleOffPitchSignals gir én per kjernekategori (7)", tiredSignals.length === 7);

const stressedState = normalizeOffPitchState({ squad: { hiddenStress: 72 } });
const stressedSignals = getVisibleOffPitchSignals(stressedState);
const mental = stressedSignals.find((s) => s.category === "mental");
check("høy hiddenStress gir et synlig signal", Boolean(mental) && mental.text.length > 0);
check("hiddenStress-signal er vagt (avslører ikke tallet)", mental && /uro|urolig|ikke tydelig/i.test(mental.text) && !/72/.test(mental.text));
check("hidden-tall lekker ikke ut i de synlige signalene",
  stressedSignals.every((s) => !/\d/.test(s.text)));

// === 5. Skjulte modifikatorer skiller seg fra synlige ======================
console.log("\nSkjulte modifikatorer:");
const hiddenMods = getHiddenOffPitchModifiers(normalizeOffPitchState({ squad: { hiddenStress: 80 }, hidden: { mentalLoad: 70, privatePressure: 60 } }));
check("getHiddenOffPitchModifiers gir performanceDrag", typeof hiddenMods.performanceDrag === "number");
check("høy skjult belastning gir positiv performanceDrag", hiddenMods.performanceDrag > 0);
check("summarizeOffPitchContext eksponerer IKKE rå hidden-tall", (() => {
  const sum = summarizeOffPitchContext(normalizeOffPitchState({ squad: { hiddenStress: 80 } }));
  return typeof sum.headline === "string" && !("mentalLoad" in sum) && !("privatePressure" in sum);
})());

// === 6. Recovery-program reduserer fatigue/wear/injuryRisk ==================
console.log("\nTreningsprogram-effekter:");
const loaded = normalizeOffPitchState({ team: { fatigue: 70, wear: 65, injuryRisk: 55 } });
const recoveryProgram = getTrainingProgramCompositionById("recovery_prevention");
const afterRecovery = applyTrainingProgramOffPitchEffects(loaded, recoveryProgram);
check("recovery senker fatigue", afterRecovery.team.fatigue < loaded.team.fatigue);
check("recovery senker wear", afterRecovery.team.wear < loaded.team.wear);
check("recovery senker injuryRisk", afterRecovery.team.injuryRisk < loaded.team.injuryRisk);
check("recovery legger program-id i recentTrainingProgramIds", afterRecovery.recentTrainingProgramIds.includes("recovery_prevention"));

const pressProgram = getTrainingProgramCompositionById("press_week");
const afterPress = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), pressProgram);
check("pressuke øker fatigue", afterPress.team.fatigue > createDefaultOffPitchState().team.fatigue);
check("pressuke øker wear", afterPress.team.wear > createDefaultOffPitchState().team.wear);

const shapeProgram = getTrainingProgramCompositionById("formation_familiarisation");
const afterShape = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), shapeProgram);
check("formasjonstilvenning øker taktisk klarhet", afterShape.squad.tacticalClarity > createDefaultOffPitchState().squad.tacticalClarity);
check("formasjonstilvenning gir 'stigende' taktisk klarhet-signal",
  getVisibleOffPitchSignals(afterShape).find((s) => s.category === "tacticalClarity")?.severity === "good");

// === 7. Kampdag-effekter ====================================================
console.log("\nKampdag-effekter:");
const afterWin = applyMatchdayOffPitchEffects(createDefaultOffPitchState(), { outcome: "win", importance: 80 });
check("seier løfter moral", afterWin.team.morale > createDefaultOffPitchState().team.morale);
check("seier letter styrepress", afterWin.team.boardPressure < createDefaultOffPitchState().team.boardPressure);
check("kamp øker fatigue uansett", afterWin.team.fatigue > createDefaultOffPitchState().team.fatigue);
const afterLoss = applyMatchdayOffPitchEffects(createDefaultOffPitchState(), { outcome: "loss" });
check("tap senker moral", afterLoss.team.morale < createDefaultOffPitchState().team.morale);
check("tap øker styrepress", afterLoss.team.boardPressure > createDefaultOffPitchState().team.boardPressure);
check("kampdag-effekt er deterministisk",
  JSON.stringify(applyMatchdayOffPitchEffects(createDefaultOffPitchState(), { outcome: "loss" })) ===
    JSON.stringify(applyMatchdayOffPitchEffects(createDefaultOffPitchState(), { outcome: "loss" })));

// === 8. scoreOffPitchFitForTrainingProgram =================================
console.log("\nOff-pitch-fit for treningsprogram:");
const fresh = createDefaultOffPitchState();
const tired = normalizeOffPitchState({ team: { fatigue: 85, wear: 80, injuryRisk: 60 } });
const recoveryTired = scoreOffPitchFitForTrainingProgram(recoveryProgram, tired);
const recoveryFresh = scoreOffPitchFitForTrainingProgram(recoveryProgram, fresh);
check("recovery favoriseres ved høy fatigue (score > 0)", recoveryTired.score > 0);
check("recovery skårer høyere sliten enn frisk", recoveryTired.score > recoveryFresh.score);
const pressTired = scoreOffPitchFitForTrainingProgram(pressProgram, tired);
const pressFresh = scoreOffPitchFitForTrainingProgram(pressProgram, fresh);
check("pressuke straffes ved høy fatigue (score < 0)", pressTired.score < 0);
check("pressuke skårer lavere sliten enn frisk", pressTired.score < pressFresh.score);
const shapeLowClarity = scoreOffPitchFitForTrainingProgram(shapeProgram, normalizeOffPitchState({ squad: { tacticalClarity: 30 } }));
check("formasjonstilvenning favoriseres ved lav taktisk klarhet", shapeLowClarity.score > 0);
check("scoreOffPitchFitForTrainingProgram gir explanation", Array.isArray(recoveryTired.explanation) && recoveryTired.explanation.length > 0);

// === 9. deriveOffPitchSignals + debug-snapshot ==============================
console.log("\nUtledning + debug:");
const derived = deriveOffPitchSignals({ offPitchState: tired, fatigueRisk: 0.9 });
check("deriveOffPitchSignals gir state/visible/hidden/summary",
  derived.state && Array.isArray(derived.visible) && derived.hidden && derived.summary);
check("rå fatigueRisk-hint overstyrer fatigue", derived.state.team.fatigue === 90);
check("deriveOffPitchSignals tåler tomt input", (() => { try { deriveOffPitchSignals(); return true; } catch { return false; } })());
const snapshot = createOffPitchDebugSnapshot(tired);
check("debug-snapshot inkluderer hidden-tall (kun for debug)", snapshot.hidden && typeof snapshot.hidden.performanceDrag === "number");

// === 10. Integrasjon: training program compositions =========================
console.log("\nIntegrasjon — training program compositions:");
let tpThrew = false;
let tpHigh;
let tpNone;
try {
  tpHigh = createTrainingProgramCompositions({ offPitchState: tired, limit: 4 });
  tpNone = createTrainingProgramCompositions({ limit: 4 });
} catch (e) {
  tpThrew = true;
  console.error("    kastet:", e.message);
}
check("offPitchState som input kaster ikke", !tpThrew);
check("gir gyldige programmer med offPitchState", Array.isArray(tpHigh) && tpHigh.length >= 2);
const recHigh = createTrainingProgramCompositions({ offPitchState: tired, limit: 7 }).find((p) => p.id === "recovery_prevention");
const recNone = getTrainingProgramCompositionById("recovery_prevention");
check("recovery får contextBonus av off-pitch-slitasje", recHigh && recHigh.scoring.contextBonus > 0);
check("recovery skårer høyere med off-pitch-slitasje enn uten", recHigh && recHigh.scoring.totalScore > recNone.scoring.totalScore);
check("recovery bærer off-pitch som kilde", recHigh && recHigh.sourceSignals.includes("offPitch"));
const shapeLow = createTrainingProgramCompositions({ offPitchState: normalizeOffPitchState({ squad: { tacticalClarity: 25 } }), limit: 7 })
  .find((p) => p.id === "formation_familiarisation");
check("formasjonstilvenning får off-pitch-bonus ved lav taktisk klarhet", shapeLow && shapeLow.scoring.contextBonus > 0);
const pressOff = getTrainingProgramCompositionById("press_week", { offPitchState: tired });
check("pressuke får negativ riskAdjustment av off-pitch-slitasje", pressOff.scoring.riskAdjustment < 0);
// Backcompat: uten off-pitch skal recovery fortsatt være nøytral.
check("recovery uten off-pitch og uten slitasje gir 0 contextBonus", recNone.scoring.contextBonus === 0);

// === 11. Integrasjon: suggested setups ======================================
console.log("\nIntegrasjon — suggested setups:");
let ssThrew = false;
let bundle;
const pressuredState = normalizeOffPitchState({ team: { pressure: 78, boardPressure: 72, fatigue: 80, wear: 76 } });
try {
  bundle = createSuggestedSetups({
    teamFit: { teamScore: 68, metrics: { buildUpScore: 48, restDefenseScore: 52, pressScore: 64, roleFitAverage: 61 } },
    formation: { id: "x", name: "Testformasjon", tacticalDifficulty: "medium" },
    offPitchState: pressuredState,
    limit: 4
  });
} catch (e) {
  ssThrew = true;
  console.error("    kastet:", e.message);
}
check("offPitchState som input kaster ikke", !ssThrew);
const flatTraining = bundle ? bundle.training_week : [];
check("treningsforslag kan bære off-pitch-signal", flatTraining.some((s) => s.sourceSignals.includes("offPitch")));
check("treningsforslag nevner off-pitch i justeringer", flatTraining.some((s) => s.suggestedAdjustments.some((a) => /Off-pitch/i.test(a))));
// Trygg degradering: uten offPitch skal forslag fortsatt fungere uten off-pitch-signal.
const noOff = createSuggestedSetups({
  teamFit: { teamScore: 68, metrics: { buildUpScore: 48, restDefenseScore: 52 } },
  formation: { id: "x", name: "Testformasjon", tacticalDifficulty: "medium" },
  limit: 4
});
check("uten offPitch: ingen offPitch-signal lekker inn",
  noOff.training_week.every((s) => !s.sourceSignals.includes("offPitch")));

// --- Rapport ---------------------------------------------------------------
console.log("\nEksempel — synlige signaler ved tung uke og høyt press:");
for (const sig of getVisibleOffPitchSignals(pressuredState)) {
  console.log(`  • [${sig.label}] (${sig.severity}) ${sig.text}`);
}
console.log("\nSammendrag:", summarizeOffPitchContext(pressuredState).headline);

if (failures > 0) {
  console.log(`\n${failures} sjekk(er) feilet. Result: FAIL`);
  process.exit(1);
}
console.log("\nAlle Off-pitch Parameters-sjekker besto.");
process.exit(0);
