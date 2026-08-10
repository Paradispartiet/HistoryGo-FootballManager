import assert from "node:assert/strict";
import {
  EXERCISE_DESIGN_CONTROLS,
  TRAINING_EXERCISE_DESIGN_VERSION,
  createTrainingExerciseHypothesis,
  createDefaultExerciseDesign,
  evaluateTrainingExerciseDesign,
  normalizeExerciseDesignConfig,
  resolveTrainingExerciseArchetype
} from "../src/football-training-exercise-design.js";

let passed = 0;
function ok(label, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${label}`);
}

ok("versjonert læringslag", () => {
  assert.equal(TRAINING_EXERCISE_DESIGN_VERSION, "historygo-football-manager.training-exercise-design.v1");
});

ok("fire organiseringsvalg", () => {
  assert.deepEqual(Object.keys(EXERCISE_DESIGN_CONTROLS), ["area", "numbers", "direction", "touches"]);
  Object.values(EXERCISE_DESIGN_CONTROLS).forEach((options) => assert.equal(options.length, 3));
});

const cases = [
  ["Restforsvar", "rest_defence"],
  ["Høyt press", "pressing"],
  ["Oppbygging under press", "build_up"],
  ["Bredde og innlegg", "width"],
  ["Avslutninger", "finishing"],
  ["Skadeforebygging", "recovery"],
  ["Lett rolleforståelse", "team_shape"],
  ["Eksplosiv hurtighet", "physical"]
];

for (const [title, expected] of cases) {
  ok(`${title} → ${expected}`, () => {
    assert.equal(resolveTrainingExerciseArchetype({ title }).id, expected);
  });
}

ok("ukjent økt får trygg fallback", () => {
  assert.equal(resolveTrainingExerciseArchetype({ title: "Ny spesialøkt" }).id, "generic");
});

ok("konkret økttittel vinner over programtittel", () => {
  const programTitle = "Oppbygging mot høyt press";
  for (const title of ["Oppbygging under press", "Tredjemannsløp", "Pressmotstand", "Keeper og distribusjon"]) {
    assert.equal(resolveTrainingExerciseArchetype({ title, programTitle }).id, "build_up", title);
  }
});

ok("programtittel brukes bare som fallback", () => {
  assert.equal(resolveTrainingExerciseArchetype({ title: "Ny spesialøkt", programTitle: "Oppbygging mot høyt press" }).id, "build_up");
});

ok("defaultoppsett er gyldig", () => {
  const design = createDefaultExerciseDesign({ title: "Restforsvar" });
  assert.equal(design.archetypeId, "rest_defence");
  for (const [key, options] of Object.entries(EXERCISE_DESIGN_CONTROLS)) {
    assert.ok(options.some((option) => option.id === design.config[key]));
  }
});

ok("ugyldig input normaliseres", () => {
  const archetype = resolveTrainingExerciseArchetype({ title: "Oppbygging" });
  const config = normalizeExerciseDesignConfig({ area: "månen", touches: "two" }, archetype);
  assert.equal(config.area, archetype.defaultConfig.area);
  assert.equal(config.touches, "two");
});

ok("areal endrer forklaringen", () => {
  const small = evaluateTrainingExerciseDesign({ title: "Oppbygging" }, { area: "tight" });
  const large = evaluateTrainingExerciseDesign({ title: "Oppbygging" }, { area: "large" });
  assert.notEqual(small.effects.find((effect) => effect.id === "area").text, large.effects.find((effect) => effect.id === "area").text);
  assert.match(small.effects.find((effect) => effect.id === "area").text, /Lite område/);
  assert.match(large.effects.find((effect) => effect.id === "area").text, /Stort område/);
});

ok("overtall endrer læringskravet", () => {
  const attack = evaluateTrainingExerciseDesign({ title: "Oppbygging" }, { numbers: "attack_overload" });
  const defence = evaluateTrainingExerciseDesign({ title: "Oppbygging" }, { numbers: "defence_overload" });
  assert.match(attack.effects.find((effect) => effect.id === "numbers").text, /Overtall med ball/);
  assert.match(defence.effects.find((effect) => effect.id === "numbers").text, /Overtall uten ball/);
});

ok("omstilling gjør balltapet til læringspunkt", () => {
  const result = evaluateTrainingExerciseDesign({ title: "Restforsvar" }, { direction: "transition" });
  assert.match(result.effects.find((effect) => effect.id === "direction").text, /balltap og ballvinning/i);
  assert.match(result.topicEffect, /balltap/i);
});

ok("to touch forklarer både gevinst og risiko", () => {
  const result = evaluateTrainingExerciseDesign({ title: "Oppbygging" }, { touches: "two" });
  const text = result.effects.find((effect) => effect.id === "touches").text;
  assert.match(text, /orientering/i);
  assert.match(text, /kan også/i);
});

ok("restitusjon varsler mot å gjøre økta hard", () => {
  const result = evaluateTrainingExerciseDesign({ title: "Restitusjonsøkt" }, { direction: "transition", touches: "two" });
  assert.match(result.topicEffect, /restitusjon/i);
  assert.match(result.topicEffect, /konkurranse|beslutningstempo/i);
});

ok("coachingpunkter og manager-spørsmål følger økta", () => {
  const result = evaluateTrainingExerciseDesign({ title: "Høyt press" });
  assert.equal(result.coachingPoints.length, 3);
  assert.ok(result.coachingPoints.every(Boolean));
  assert.match(result.managerQuestion, /første spiller|pasning/i);
});

ok("konkret oppsett blir en lesbar hypotese uten score", () => {
  const hypothesis = createTrainingExerciseHypothesis({
    week: 4,
    index: 2,
    day: "Torsdag",
    title: "Restforsvar",
    programTitle: "Kampforberedende uke"
  }, { area: "large", numbers: "attack_overload", direction: "transition", touches: "three" });
  assert.equal(hypothesis.week, 4);
  assert.equal(hypothesis.archetypeId, "rest_defence");
  assert.equal(hypothesis.setup, "Stort område · Overtall med ball · Omstilling ved balltap · Maks 3 touch");
  assert.match(hypothesis.hypothesis, /avstander|balltap/i);
  assert.match(hypothesis.watch, /før balltapet/i);
  assert.doesNotMatch(JSON.stringify(hypothesis), /bonus|score|effect/i);
});

ok("ingen skjult spillscore i output", () => {
  const result = evaluateTrainingExerciseDesign({ title: "Avslutninger" });
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /overall|matchScore|exerciseScore|scoreDelta/i);
  assert.match(result.guardrail, /endrer ikke lagret treningsbelastning/i);
});

console.log(`\nTreningsøvelser v1 simulering: ${passed}/${passed}`);
