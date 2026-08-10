import assert from "node:assert/strict";
import {
  createActualLineupRoleLesson,
  createMatchSignalLearningLesson,
  createRoleRelationshipLesson,
  createSystemLearningLesson,
  createTrainingLearningLesson
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
    { slotId: "lw", slotLabel: "Venstrekant", playerName: "Vingen", roleId: "wide_dribbler", roleName: "Bred dribler", x: 15, y: 25 },
    { slotId: "lb", slotLabel: "Venstreback", playerName: "Backen", roleId: "overlapping_fullback", roleName: "Overlappende back", x: 16, y: 66 }
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
    { slotId: "lw", slotLabel: "Venstrekant", playerName: "Vingen", roleId: "wide_dribbler", roleName: "Bred dribler", x: 15, y: 25 }
  ]
});
assert.equal(missingActualPartner.status, "missing_curated_partner");
assert.equal(missingActualPartner.partner, null);
assert.equal(missingActualPartner.suggestedPartnerName, "Overlappende back");

const pressTraining = createTrainingLearningLesson("Høyt press treningsprogram");
assert.match(pressTraining.title, /Press/);
assert.match(pressTraining.principle, /Første pressledd/i);
assert.match(pressTraining.watch, /følger/i);

const restDefense = createTrainingLearningLesson("Restforsvar treningsprogram");
assert.match(restDefense.title, /Restforsvar/);
assert.match(restDefense.watch, /mister ballen/i);

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

console.log("Manager football learning loop v1: 24/24");
