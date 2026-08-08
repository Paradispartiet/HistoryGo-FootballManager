import assert from "node:assert/strict";
import { createClubIdentityView } from "../src/ui/manager-club-identity.js";
import { resolveManagerVisualContext } from "../src/ui/manager-visual-identity-v1.js";

const expected = new Map([
  ["calendar", ["office", "timeline"]],
  ["board", ["office", "organization"]],
  ["tactics", ["team", "pitch"]],
  ["squad", ["team", "roster"]],
  ["trening", ["team", "training"]],
  ["system", ["team", "system"]],
  ["historygo", ["scouting", "scouting-list"]],
  ["scoutingClubs", ["scouting", "club-list"]],
  ["kamp", ["match", "matchday"]],
  ["analysis", ["match", "analysis"]],
  ["statistikk", ["stats", "stats"]]
]);

for (const [target, [area, kind]] of expected) {
  const context = resolveManagerVisualContext(target);
  assert.equal(context.area, area, `${target} skal tilhøre ${area}`);
  assert.equal(context.kind, kind, `${target} skal bruke scenetype ${kind}`);
}

assert.deepEqual(
  resolveManagerVisualContext("unknown", "tactics"),
  { area: "team", surface: "unknown", kind: "team" }
);

const rosenborg = createClubIdentityView({
  clubName: "Rosenborg",
  clubId: "rosenborg",
  ground: "Lerkendal stadion",
  city: "Trondheim"
});
const brann = createClubIdentityView({
  clubName: "Brann",
  clubId: "brann",
  ground: "Brann Stadion",
  city: "Bergen"
});

assert.equal(rosenborg.isEstablished, true);
assert.equal(brann.isEstablished, true);
assert.notEqual(rosenborg.accent, brann.accent, "etablerte klubber skal kunne ha ulik HGFM-identitet");
assert.equal(rosenborg.groundLine, "Lerkendal stadion · Trondheim");
assert.equal(brann.groundLine, "Brann Stadion · Bergen");

console.log(`✓ Manager Visual Identity v1: ${expected.size} flater er sceneplassert og klubbidentiteten er datadrevet.`);
