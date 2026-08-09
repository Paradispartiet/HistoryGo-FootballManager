import assert from "node:assert/strict";
import {
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

console.log("Manager football learning loop v1: 18/18");
