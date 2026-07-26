// Simulering: brikkefordelingen på den grønne taktikktavla.
//
// Bakgrunnen er en konkret feil: HVER linje ble strukket ut til sidelinja, så
// spissparet i 4-4-2 havnet på 14 % og 86 % — ute på vingen, der ingen spiss
// står. Samtidig ble tette formasjoner klemt inn i det samme smale båndet, så
// radene la seg oppå hverandre.
//
// Denne vakta kjører adapteren for ALLE historiske formasjoner og sjekker
// geometrien: at breddespillere står bredt, at sentrale spillere står sentralt,
// at ingen brikke havner utenfor banen, og at radene har nok avstand.
// Exit 1 ved brudd.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  buildFormationSlots,
  detectLiberoLead,
  isWideLine,
  lineXPositions,
  parseShape
} from "../src/hg-football-formation-adapter.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const formations = JSON.parse(
  readFileSync(join(root, "data/hgFootball/formations.json"), "utf8")
).formations || [];

const checks = [];
function check(label, run) {
  run();
  checks.push(label);
  console.log(`  ok   ${label}`);
}

console.log("Banelayout — brikkefordeling for alle historiske formasjoner\n");

// Hvor bredt står ytterkantene? Skal bare brukes av ekte breddespillere.
const WIDE_EDGE = 14;
const WIDE_POSITIONS = new Set(["LB", "RB", "WB", "LW", "RW"]);

check("en sentral linje strekkes ikke ut til sidelinja", () => {
  // Selve feilen: to spisser skal stå sentralt, ikke på 14/86.
  assert.deepEqual(lineXPositions(["ST", "ST"]), [39, 61]);
  assert.deepEqual(lineXPositions(["CB", "CB"]), [39, 61]);
  assert.deepEqual(lineXPositions(["CM", "CM", "CM"]), [28, 50, 72]);
  assert.deepEqual(lineXPositions(["AM"]), [50]);
});

check("en linje med breddespillere bruker hele bredden", () => {
  assert.deepEqual(lineXPositions(["LB", "CB", "CB", "RB"]), [14, 38, 62, 86]);
  assert.deepEqual(lineXPositions(["LW", "CM", "CM", "RW"]), [14, 38, 62, 86]);
  assert.equal(isWideLine(["LB", "CB", "CB", "RB"]), true);
  assert.equal(isWideLine(["ST", "ST"]), false);
});

check("classic_442 gir en ekte 4-4-2 (spissene sentralt)", () => {
  const slots = buildFormationSlots("4-4-2");
  const byPosition = (position) => slots.filter((slot) => slot.position === position);
  const strikers = byPosition("ST");
  assert.equal(strikers.length, 2);
  assert.deepEqual(strikers.map((slot) => slot.x).sort((a, b) => a - b), [39, 61]);
  // Backene skal derimot stå bredt.
  assert.equal(byPosition("LB")[0].x, 14);
  assert.equal(byPosition("RB")[0].x, 86);
  assert.equal(slots.length, 11);
});

// ---------------------------------------------------------------------------
// Hele katalogen.
const results = [];
for (const formation of formations) {
  const slots = buildFormationSlots(formation.baseShape, {
    liberoLead: detectLiberoLead(formation)
  });
  results.push({ formation, slots });
}

check("alle formasjoner gir elleve brikker", () => {
  assert.ok(results.length >= 40, `for få formasjoner: ${results.length}`);
  results.forEach(({ formation, slots }) => {
    assert.equal(slots.length, 11, `${formation.id} ga ${slots.length} brikker`);
    const counts = parseShape(formation.baseShape);
    assert.ok(counts, `${formation.id} har ugyldig baseShape`);
  });
});

check("ingen brikke havner utenfor banen", () => {
  results.forEach(({ formation, slots }) => {
    slots.forEach((slot) => {
      assert.ok(slot.x >= 10 && slot.x <= 90, `${formation.id}/${slot.slotId}: x=${slot.x}`);
      assert.ok(slot.y >= 10 && slot.y <= 93, `${formation.id}/${slot.slotId}: y=${slot.y}`);
    });
  });
});

check("bare breddespillere står helt ute ved sidelinja", () => {
  results.forEach(({ formation, slots }) => {
    slots.forEach((slot) => {
      const atEdge = slot.x <= WIDE_EDGE || slot.x >= 100 - WIDE_EDGE;
      if (!atEdge) return;
      assert.ok(
        WIDE_POSITIONS.has(slot.position),
        `${formation.id}: ${slot.position} (${slot.slotId}) står på x=${slot.x} uten å være en breddespiller`
      );
    });
  });
});

check("naboer på samme rad har nok avstand", () => {
  results.forEach(({ formation, slots }) => {
    const rows = new Map();
    slots.forEach((slot) => {
      if (!rows.has(slot.y)) rows.set(slot.y, []);
      rows.get(slot.y).push(slot);
    });
    rows.forEach((row, y) => {
      const xs = row.map((slot) => slot.x).sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i += 1) {
        const gap = xs[i] - xs[i - 1];
        // 10 % er nok til at brikkene kan skaleres ned og fortsatt stå fritt.
        assert.ok(gap >= 10, `${formation.id}: rad y=${y} har bare ${gap.toFixed(1)} % mellom to brikker`);
      }
    });
  });
});

check("radene har nok avstand — også i formasjoner med mange linjer", () => {
  results.forEach(({ formation, slots }) => {
    const ys = [...new Set(slots.map((slot) => slot.y))].sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i += 1) {
      const gap = ys[i] - ys[i - 1];
      assert.ok(gap >= 12, `${formation.id}: bare ${gap.toFixed(1)} % mellom rad ${ys[i - 1]} og ${ys[i]}`);
    }
  });
});

check("mange linjer tar i bruk mer av banens dybde", () => {
  // En 4-4-2 (3 utespillerlinjer) skal ligge i standardbåndet; en diamant
  // (5 linjer) skal strekkes, ellers blir radene for tette.
  const flat = buildFormationSlots("4-4-2");
  const diamond = buildFormationSlots("4-1-2-1-2");
  const span = (slots) => {
    const ys = slots.filter((slot) => slot.position !== "GK").map((slot) => slot.y);
    return Math.max(...ys) - Math.min(...ys);
  };
  assert.equal(span(flat), 48);
  assert.ok(span(diamond) > span(flat), "diamanten må bruke mer dybde enn 4-4-2");
});

check("keeperen står alene nederst, sentralt", () => {
  results.forEach(({ formation, slots }) => {
    const keepers = slots.filter((slot) => slot.position === "GK");
    assert.equal(keepers.length, 1, `${formation.id} har ${keepers.length} keepere`);
    const keeper = keepers[0];
    assert.equal(keeper.x, 50, `${formation.id}: keeperen står på x=${keeper.x}`);
    const deepest = Math.max(...slots.filter((s) => s.position !== "GK").map((s) => s.y));
    assert.ok(keeper.y > deepest, `${formation.id}: keeperen står ikke bakerst`);
  });
});

check("fordelingen er deterministisk", () => {
  results.forEach(({ formation }) => {
    const a = buildFormationSlots(formation.baseShape, { liberoLead: detectLiberoLead(formation) });
    const b = buildFormationSlots(formation.baseShape, { liberoLead: detectLiberoLead(formation) });
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  });
});

console.log(`\nAlle ${checks.length} layoutsjekker besto (${results.length} formasjoner).`);
