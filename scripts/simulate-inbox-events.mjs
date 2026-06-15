// scripts/simulate-inbox-events.mjs
//
// Deterministisk simulering + validering av Inbox Event Integration v1
// (src/football-inbox-events.js). Rent Node-script (standardbibliotek + de
// plain-ESM .js-motorene) — ingen DOM, localStorage eller bygg kreves.
//
// Verifiserer:
//   - createInboxState gir gyldig schema
//   - normalizeInboxState tåler tomt/ufullstendig input
//   - høy fatigue genererer medisinsk tråd
//   - høy boardPressure genererer styretråd
//   - høy mediaPressure genererer pressetråd
//   - lav morale/cohesion genererer garderobetråd
//   - lav tacticalClarity genererer assistent-/treningstråd
//   - manglende 15-spillerkrav genererer scouting/History Go-tråd
//   - valg i tråd gir offPitchEvent/effects
//   - applyInboxChoice markerer tråd som resolved/read
//   - archiveInboxThread flytter tråd til arkiv
//   - getUnreadInboxCount teller korrekt
//   - samme kontekst genererer deterministisk samme threads
//   - ingen duplisering av samme tråd ved samme context hash
//   - integrasjon med off-pitch / training programs / suggested setups
//
// Exit code 1 hvis en sjekk feiler, ellers 0.

import {
  createInboxState,
  normalizeInboxState,
  createInboxThreads,
  createInboxThreadFromOffPitchSignal,
  createInboxThreadFromTrainingProgram,
  createInboxThreadFromMatchday,
  integrateInboxThreads,
  applyInboxChoice,
  archiveInboxThread,
  markInboxThreadRead,
  getActiveInboxThreads,
  getArchivedInboxThreads,
  getUnreadInboxCount,
  summarizeInboxPulse
} from "../src/football-inbox-events.js";
import {
  createDefaultOffPitchState,
  normalizeOffPitchState,
  applyOffPitchEvent,
  getVisibleOffPitchSignals
} from "../src/football-off-pitch-parameters.js";
import { createTrainingProgramCompositions } from "../src/football-training-program-compositions.js";
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

function findThread(threads, type) {
  return threads.find((t) => t.type === type) || null;
}

console.log("Inbox Event Integration v1 — simulering\n");

// === 1. Default-state schema =================================================
console.log("Default-state:");
const def = createInboxState();
check("version er inbox.v1", def.version === "historygo-football-manager.inbox.v1");
check("threads/archived/read/resolved/history er arrays",
  Array.isArray(def.threads) &&
    Array.isArray(def.archivedThreadIds) &&
    Array.isArray(def.readThreadIds) &&
    Array.isArray(def.resolvedThreadIds) &&
    Array.isArray(def.history));
check("lastGeneratedContextHash starter som null", def.lastGeneratedContextHash === null);
check("createInboxState er deterministisk", JSON.stringify(createInboxState()) === JSON.stringify(createInboxState()));

// === 2. normalizeInboxState — robusthet =====================================
console.log("\nNormalisering:");
check("normalizeInboxState(undefined) kaster ikke", (() => { try { normalizeInboxState(undefined); return true; } catch { return false; } })());
check("tomt input gir samme som default", JSON.stringify(normalizeInboxState({})) === JSON.stringify(createInboxState()));
const messy = normalizeInboxState({
  threads: [
    { id: "a", type: "tøys", priority: "EKSTREM", choices: [{ id: "x", effects: { fatigue: 5, ukjent: 99 } }] },
    { id: "a", type: "medical" }, // duplikat-id skal forsvinne
    { foo: "bar" } // mangler id → droppes
  ],
  archivedThreadIds: ["a"],
  history: "ikke en array"
});
check("ukjent type faller til admin", messy.threads[0].type === "admin");
check("ugyldig priority faller til medium", messy.threads[0].priority === "medium");
check("duplikat-id fjernes", messy.threads.filter((t) => t.id === "a").length === 1);
check("tråd uten id droppes", messy.threads.every((t) => t.id.length > 0));
check("ukjente effekt-nøkler strippes fra valg", !("ukjent" in messy.threads[0].choices[0].effects) && messy.threads[0].choices[0].effects.fatigue === 5);
check("arkivert id setter status=archived", messy.threads[0].status === "archived");
check("history-feiltype gir tom array", Array.isArray(messy.history) && messy.history.length === 0);

// === 3. Kontekstgenerering — trådtyper ======================================
console.log("\nTrådgenerering fra kontekst:");

const tiredCtx = { offPitchState: normalizeOffPitchState({ team: { fatigue: 82, wear: 78, injuryRisk: 60 } }) };
const tiredThreads = createInboxThreads(tiredCtx);
check("høy fatigue genererer medisinsk tråd", Boolean(findThread(tiredThreads, "medical")));
check("medisinsk tråd peker mot recovery-program", findThread(tiredThreads, "medical")?.linkedAction.id === "recovery_prevention");
check("medisinsk tråd har valg med effekter", findThread(tiredThreads, "medical")?.choices.some((c) => Object.keys(c.effects).length > 0));

const boardThreads = createInboxThreads({ offPitchState: normalizeOffPitchState({ team: { boardPressure: 75 } }) });
check("høy boardPressure genererer styretråd", Boolean(findThread(boardThreads, "board")));

const mediaThreads = createInboxThreads({ offPitchState: normalizeOffPitchState({ team: { mediaPressure: 72 } }) });
check("høy mediaPressure genererer pressetråd", Boolean(findThread(mediaThreads, "media")));

const squadThreads = createInboxThreads({ offPitchState: normalizeOffPitchState({ team: { morale: 30, cohesion: 34 }, squad: { roleFrustration: 64 } }) });
check("lav morale/cohesion genererer garderobetråd", Boolean(findThread(squadThreads, "squad")));
check("garderobetråd gir halvskjult signal (ingen rå tall)", (() => {
  const t = findThread(squadThreads, "squad");
  return Boolean(t) && t.summary.length > 0 && !/\d/.test(t.summary);
})());

const clarityThreads = createInboxThreads({ offPitchState: normalizeOffPitchState({ squad: { tacticalClarity: 30 } }), formation: { name: "4-3-3" } });
check("lav tacticalClarity genererer assistent-/treningstråd", Boolean(findThread(clarityThreads, "assistant")));

const scoutingCtx = { availability: { rosterReadiness: { unlockedCount: 9, hasEnoughUnlocked: false, missingUnlocked: 6 } } };
const scoutingThreads = createInboxThreads(scoutingCtx);
check("manglende 15-spillerkrav genererer scouting/History Go-tråd", Boolean(findThread(scoutingThreads, "scouting")));
check("scouting-tråd har ingen valg (muterer ikke History Go)", findThread(scoutingThreads, "scouting")?.choices.length === 0);

const calmThreads = createInboxThreads({ offPitchState: createDefaultOffPitchState() });
check("rolig standardkontekst gir ingen bekymringstråder", calmThreads.length === 0);

// Kampdag-tråd
const lossThread = createInboxThreadFromMatchday({ outcome: "loss", opponentName: "Rival FK", matchId: "m1" });
check("tap genererer kampdagstråd med valg", lossThread?.type === "matchday" && lossThread.choices.length > 0);
const winThread = createInboxThreadFromMatchday({ goalsFor: 3, goalsAgainst: 1, matchId: "m2" });
check("seier utledes fra mål og gir kampdagstråd", winThread?.type === "matchday");

// Signal-inngang
const sigThread = createInboxThreadFromOffPitchSignal({ category: "physical" }, tiredCtx);
check("createInboxThreadFromOffPitchSignal gir medisinsk tråd fra physical-signal", sigThread?.type === "medical");

// === 4. Determinisme + ingen duplisering ====================================
console.log("\nDeterminisme:");
check("samme kontekst gir byte-identiske threads",
  JSON.stringify(createInboxThreads(tiredCtx)) === JSON.stringify(createInboxThreads(tiredCtx)));

let st = integrateInboxThreads(createInboxState(), tiredCtx);
const countAfterFirst = st.threads.length;
check("integrate legger til tråder", countAfterFirst > 0);
const st2 = integrateInboxThreads(st, tiredCtx);
check("samme context hash gir ingen nye tråder", st2.threads.length === countAfterFirst);
check("lastGeneratedContextHash settes", typeof st2.lastGeneratedContextHash === "string" && st2.lastGeneratedContextHash.length > 0);
const stWorse = integrateInboxThreads(st2, { offPitchState: normalizeOffPitchState({ team: { fatigue: 82, wear: 78, injuryRisk: 60, boardPressure: 75 } }) });
check("ny kontekst (styrepress) gir en ny tråd", stWorse.threads.length > countAfterFirst);

// === 5. Valg → offPitchEvent + status =======================================
console.log("\nValg og status:");
const seeded = integrateInboxThreads(createInboxState(), tiredCtx);
const medicalId = getActiveInboxThreads(seeded).find((t) => t.type === "medical").id;
const choiceResult = applyInboxChoice(seeded, medicalId, "ease_load", tiredCtx);
check("applyInboxChoice gir offPitchEvent med effects", Boolean(choiceResult.offPitchEvent) && Object.keys(choiceResult.offPitchEvent.effects).length > 0);
check("offPitchEvent har gyldig type", ["training", "board", "media", "squad", "matchday", "private"].includes(choiceResult.offPitchEvent.type));
check("valgt tråd markeres resolved", choiceResult.inboxState.threads.find((t) => t.id === medicalId)?.status === "resolved");
check("valgt tråd markeres read", choiceResult.inboxState.readThreadIds.includes(medicalId));
check("valg legges i history", choiceResult.inboxState.history.some((h) => h.threadId === medicalId && h.choiceId === "ease_load"));
check("applyInboxChoice muterer ikke input", seeded.threads.find((t) => t.id === medicalId)?.status === "unread");
check("ugyldig choiceId gir null offPitchEvent", applyInboxChoice(seeded, medicalId, "finnes_ikke", tiredCtx).offPitchEvent === null);
check("applyInboxChoice er deterministisk",
  JSON.stringify(applyInboxChoice(seeded, medicalId, "ease_load", tiredCtx).inboxState) ===
    JSON.stringify(applyInboxChoice(seeded, medicalId, "ease_load", tiredCtx).inboxState));

// === 6. Off-pitch-integrasjon: event kan anvendes ===========================
console.log("\nOff-pitch-integrasjon:");
let opThrew = false;
let appliedOffPitch;
try {
  appliedOffPitch = applyOffPitchEvent(tiredCtx.offPitchState, choiceResult.offPitchEvent);
} catch (e) {
  opThrew = true;
  console.error("    kastet:", e.message);
}
check("offPitchEvent fra inbox kan sendes til applyOffPitchEvent", !opThrew && Boolean(appliedOffPitch));
check("ease_load senker fatigue i off-pitch-staten", appliedOffPitch.team.fatigue < tiredCtx.offPitchState.team.fatigue);

// === 7. Arkiv + telling =====================================================
console.log("\nArkiv og telling:");
const archived = archiveInboxThread(seeded, medicalId);
check("archiveInboxThread flytter tråd til arkiv", getArchivedInboxThreads(archived).some((t) => t.id === medicalId));
check("arkivert tråd er ikke lenger aktiv", !getActiveInboxThreads(archived).some((t) => t.id === medicalId));
const unreadBefore = getUnreadInboxCount(seeded);
const afterRead = markInboxThreadRead(seeded, medicalId);
check("markInboxThreadRead reduserer ulest-telling", getUnreadInboxCount(afterRead) === unreadBefore - 1);
check("getUnreadInboxCount teller bare uleste aktive", getUnreadInboxCount(seeded) === getActiveInboxThreads(seeded).filter((t) => t.status === "unread").length);
const pulse = summarizeInboxPulse(seeded);
check("summarizeInboxPulse gir unread/active/headline", typeof pulse.unread === "number" && typeof pulse.active === "number" && typeof pulse.headline === "string");

// === 8. Integrasjon: training program compositions ==========================
console.log("\nIntegrasjon — training program compositions:");
let tpThrew = false;
let trainingThread;
try {
  const programs = createTrainingProgramCompositions({
    offPitchState: normalizeOffPitchState({ team: { fatigue: 85, wear: 80, injuryRisk: 60 } }),
    limit: 6
  });
  trainingThread = createInboxThreadFromTrainingProgram(
    programs.find((p) => p.id === "recovery_prevention"),
    {}
  );
  // Full kontekst-vei: treningsprogrammer kan lenkes fra inbox uten runtime-feil.
  createInboxThreads({
    offPitchState: normalizeOffPitchState({ team: { fatigue: 85, wear: 80, injuryRisk: 60 } }),
    trainingPrograms: programs
  });
} catch (e) {
  tpThrew = true;
  console.error("    kastet:", e.message);
}
check("training program compositions kobles uten runtime-feil", !tpThrew);
check("off-pitch-relevant program gir treningstråd", Boolean(trainingThread) && trainingThread.type === "training");
check("treningstråd peker på programmet via linkedAction", trainingThread?.linkedAction.id === "recovery_prevention");
check("irrelevant program gir ingen tråd", createInboxThreadFromTrainingProgram({ id: "x", scoring: { contextBonus: 0 } }, {}) === null);

// === 9. Integrasjon: suggested setups =======================================
console.log("\nIntegrasjon — suggested setups:");
let ssThrew = false;
try {
  const bundle = createSuggestedSetups({
    teamFit: { teamScore: 68, metrics: { buildUpScore: 48, restDefenseScore: 52, pressScore: 64, roleFitAverage: 61 } },
    formation: { id: "x", name: "Testformasjon", tacticalDifficulty: "medium" },
    offPitchState: normalizeOffPitchState({ squad: { tacticalClarity: 30 } }),
    limit: 4
  });
  createInboxThreads({
    offPitchState: normalizeOffPitchState({ squad: { tacticalClarity: 30 } }),
    suggestedSetups: bundle,
    formation: { name: "Testformasjon" }
  });
} catch (e) {
  ssThrew = true;
  console.error("    kastet:", e.message);
}
check("suggested setups kobles uten runtime-feil", !ssThrew);

// === 10. Visible signals → tråd =============================================
console.log("\nSynlige signaler → tråd:");
const signals = getVisibleOffPitchSignals(normalizeOffPitchState({ team: { fatigue: 80, wear: 78 } }));
const physicalSignal = signals.find((s) => s.category === "physical");
check("synlig physical-signal kan bli en medisinsk tråd",
  createInboxThreadFromOffPitchSignal(physicalSignal, { offPitchState: normalizeOffPitchState({ team: { fatigue: 80, wear: 78 } }) })?.type === "medical");

// --- Rapport ---------------------------------------------------------------
console.log("\nEksempel — aktive tråder ved tung uke + styrepress:");
const demo = integrateInboxThreads(createInboxState(), {
  offPitchState: normalizeOffPitchState({ team: { fatigue: 80, wear: 76, boardPressure: 72, mediaPressure: 66 }, squad: { tacticalClarity: 30 } }),
  matchdayResult: { outcome: "loss", opponentName: "Rival FK", matchId: "demo" },
  formation: { name: "4-3-3" }
});
for (const t of getActiveInboxThreads(demo)) {
  console.log(`  • [${t.sender}] (${t.priority}) ${t.title} — ${t.summary}`);
}
console.log("\nPuls:", summarizeInboxPulse(demo).headline);

if (failures > 0) {
  console.log(`\n${failures} sjekk(er) feilet. Result: FAIL`);
  process.exit(1);
}
console.log("\nAlle Inbox Event Integration-sjekker besto.");
process.exit(0);
