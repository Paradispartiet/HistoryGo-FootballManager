#!/usr/bin/env node
import assert from "node:assert/strict";
import { compactPlayerName, describeTacticalFit } from "../src/ui/manager-lineup-presentation.js";
import { createMatchdaySceneModel } from "../src/ui/manager-matchday-presentation.js";

let passed = 0;
function check(label, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${passed}: ${label}`);
}

check("svært høy fit blir kvalitativt svært godt samsvar", () => {
  assert.equal(describeTacticalFit({ matchScore: 96, status: "perfekt" }).label, "Svært godt samsvar");
});
check("god fit blir kvalitativt godt samsvar", () => {
  assert.equal(describeTacticalFit({ matchScore: 81 }).shortLabel, "God");
});
check("feilbruk vinner over høy poengsum", () => {
  assert.equal(describeTacticalFit({ matchScore: 92, status: "feilbrukt" }).tone, "misused");
});
check("manglende fit gir ikke en oppdiktet score", () => {
  assert.equal(describeTacticalFit({}).label, "Ikke vurdert");
});
check("lange navn komprimeres lesbart", () => {
  assert.equal(compactPlayerName("Daniel Arnefjord Nordmann"), "D. Nordmann");
});
check("to navn beholdes", () => {
  assert.equal(compactPlayerName("Lars Hirschfeld"), "Lars Hirschfeld");
});
check("kampkommando deler motstander og kontekst", () => {
  const view = createMatchdaySceneModel({ opponentBrief: "Ajax · Totalfotball" });
  assert.equal(view.opponentName, "Ajax");
  assert.equal(view.opponentContext, "Totalfotball");
});
check("blokkert kamp får låst avspark", () => {
  const view = createMatchdaySceneModel({ readiness: { status: "blocked", canStartMatch: false } });
  assert.equal(view.kickoffLabel, "Avspark låst");
});
check("klar kamp får klarstatus", () => {
  const view = createMatchdaySceneModel({ readiness: { status: "ready", canStartMatch: true } });
  assert.equal(view.statusTone, "ready");
  assert.equal(view.canStart, true);
});
check("kampplan kombinerer formasjon og taktikk", () => {
  const view = createMatchdaySceneModel({ formationName: "4-2-3-1", tacticName: "Sentralt spill" });
  assert.equal(view.planLabel, "4-2-3-1 · Sentralt spill");
});
check("blokkeringer normaliseres uten å endre målet", () => {
  const view = createMatchdaySceneModel({ readiness: { blockers: [{ code: "training_missing", message: "Velg trening", target: "trening" }] } });
  assert.deepEqual(view.blockers[0], { code: "training_missing", message: "Velg trening", target: "trening" });
});
check("visningsmodellen eier ikke motorverdier", () => {
  const input = { readiness: { status: "ready", canStartMatch: true, blockers: [] } };
  createMatchdaySceneModel(input);
  assert.deepEqual(input.readiness, { status: "ready", canStartMatch: true, blockers: [] });
});

console.log(`Manager scenes v1: ${passed}/12 PASS`);
