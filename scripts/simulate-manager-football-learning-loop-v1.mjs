import assert from "node:assert/strict";
import {
  createActualLineupRoleLesson,
  createMatchSignalLearningLesson,
  createRoleRelationshipLesson,
  createSystemLearningLesson,
  createTrainingLearningLesson,
  createTrainingMatchLearningThread
} from "../src/ui/manager-football-learning-loop-v1.js";

const roles = [
  { id: "wide_dribbler", name: "Bred dribler", goodWith: ["overlapping_fullback"], badFor: ["narrow_low_tempo"] },
  { id: "overlapping_fullback", name: "Overlappende back", goodWith: ["wide_dribbler"], badFor: ["no_cover"] }
];

const relation = createRoleRelationshipLesson(roles[0], roles, ["Overlappende back"]);
assert.equal(relation.isInLineup, true);
assert.equal(relation.partnerName, "Overlappende back");
assert.match(relation.risk, /samme brede kanal/i);
assert.match(relation.watch, /timing/i);

const actualLineup = createActualLineupRoleLesson({
  selectedSlotId: "lw",
  roleList: roles,
  lineup: [
    { slotId: "lw", slotLabel: "Venstrekant", playerId: "winger", playerName: "Vingen", roleId: "wide_dribbler", roleName: "Bred dribler", x: 15, y: 25 },
    { slotId: "lb", slotLabel: "Venstreback", playerId: "fullback", playerName: "Backen", roleId: "overlapping_fullback", roleName: "Overlappende back", x: 16, y: 66 }
  ]
});
assert.equal(actualLineup.status, "actual_pair");
assert.equal(actualLineup.selected.playerName, "Vingen");
assert.equal(actualLineup.partner.playerName, "Backen");
assert.equal(actualLineup.partner.slotLabel, "Venstreback");
assert.match(actualLineup.benefit, /to-mot-en/i);

const missingActualPartner = createActualLineupRoleLesson({
  selectedSlotId: "lw",
  roleList: roles,
  lineup: [
    { slotId: "lw", slotLabel: "Venstrekant", playerId: "winger", playerName: "Vingen", roleId: "wide_dribbler", roleName: "Bred dribler", x: 15, y: 25 }
  ]
});
assert.equal(missingActualPartner.status, "missing_curated_partner");
assert.equal(missingActualPartner.partner, null);
assert.equal(missingActualPartner.suggestedPartnerName, "Overlappende back");

const emptySlotIsNotAPartner = createActualLineupRoleLesson({
  selectedSlotId: "lw",
  roleList: roles,
  lineup: [
    { slotId: "lw", slotLabel: "Venstrekant", playerId: "winger", playerName: "Vingen", roleId: "wide_dribbler", roleName: "Bred dribler", x: 15, y: 25 },
    { slotId: "lb", slotLabel: "Venstreback", playerId: "", playerName: "Tom plass", roleId: "overlapping_fullback", roleName: "Overlappende back", x: 16, y: 66 }
  ]
});
assert.equal(emptySlotIsNotAPartner.status, "missing_curated_partner");
assert.equal(emptySlotIsNotAPartner.partner, null);

const pressTraining = createTrainingLearningLesson("Høyt press treningsprogram");
assert.match(pressTraining.title, /Press/);
assert.match(pressTraining.principle, /Første pressledd/i);
assert.match(pressTraining.watch, /følger/i);

const restDefense = createTrainingLearningLesson("Restforsvar treningsprogram");
assert.match(restDefense.title, /Restforsvar/);
assert.match(restDefense.watch, /mister ballen/i);

const helpedTrainingThread = createTrainingMatchLearningThread({
  trainingFocus: {
    focusId: "pressing",
    name: "Pressing",
    helped: true,
    summary: "Ukens pressing støttet et relevant managergrep."
  },
  tacticalSignals: ["Det høye presset traff motstanderens svake oppbygging."]
});
assert.equal(helpedTrainingThread.status, "helped");
assert.equal(helpedTrainingThread.relatedSignals.length, 1);
assert.match(helpedTrainingThread.reportSummary, /relevant managergrep/i);
assert.match(helpedTrainingThread.evidence, /samme problemområde/i);

const limitedTrainingThread = createTrainingMatchLearningThread({
  trainingFocus: {
    focusId: "rest_defence",
    name: "Restforsvar",
    helped: false,
    summary: "Ukens restforsvar ga liten effekt i denne kampen."
  },
  tacticalSignals: ["Laget ble tatt i kontring etter eget balltap."]
});
assert.equal(limitedTrainingThread.status, "limited");
assert.match(limitedTrainingThread.evidence, /ikke bevis/i);

const concreteHypothesisThread = createTrainingMatchLearningThread({
  trainingFocus: { focusId: "rest_defence", name: "Restforsvar", helped: false, summary: "Restforsvaret ga liten effekt." },
  hypothesis: {
    archetypeId: "rest_defence",
    title: "Restforsvar",
    setup: "Stort område · Overtall med ball · Omstilling ved balltap · Maks 3 touch",
    hypothesis: "Laget må kontrollere større kontringsrom.",
    watch: "Har laget nok spillere bak ballen før balltapet?"
  },
  tacticalSignals: ["Laget ble tatt i kontring etter eget balltap."]
});
assert.match(concreteHypothesisThread.setup, /Stort område/);
assert.match(concreteHypothesisThread.intent, /større kontringsrom/i);
assert.match(concreteHypothesisThread.matchQuestion, /før balltapet/i);
assert.match(concreteHypothesisThread.uncertainty, /beviser ikke/i);

const noInventedTrainingSignal = createTrainingMatchLearningThread({
  trainingFocus: {
    focusId: "build_up",
    name: "Oppbygging",
    helped: true,
    summary: "Ukens oppbygging dempet risikoen i en relevant hendelse."
  },
  tacticalSignals: ["Avslutningene kom fra gode rom."]
});
assert.equal(noInventedTrainingSignal.relatedSignals.length, 0);
assert.match(noInventedTrainingSignal.evidence, /ikke til en oppdiktet kamphendelse/i);

const laterTrainingSignal = createTrainingMatchLearningThread({
  trainingFocus: { focusId: "pressing", name: "Pressing", helped: false },
  tacticalSignals: [
    "Avslutningene kom fra gode rom.",
    "Bredden skapte flere innlegg.",
    "Det høye presset sprakk etter første pasning."
  ]
});
assert.equal(laterTrainingSignal.relatedSignals.length, 1);
assert.match(laterTrainingSignal.evidence, /Det høye presset sprakk/);

const system = createSystemLearningLesson({
  intent: "Vinn ballen høyt og angrip raskt.",
  risk: "Rom bak presset.",
  parameters: [{ label: "Press", value: "Høyt", explanation: "Presset starter høyt." }]
});
assert.equal(system.intent, "Vinn ballen høyt og angrip raskt.");
assert.equal(system.tradeoff, "Rom bak presset.");
assert.match(system.watch, /første pressledd/i);

const match = createMatchSignalLearningLesson("Det høye presset sprakk og åpnet rom bak første pressledd.");
assert.equal(match.principle, "Press");
assert.match(match.explanation, /kollektivt/i);

const generic = createMatchSignalLearningLesson("Et uklart, men registrert taktisk signal.");
assert.equal(generic.principle, "Kampatferd");
assert.match(generic.watch, /ett eller to trekk tilbake/i);

console.log("Manager football learning loop v1: 36/36");
