#!/usr/bin/env node
// Read-only sim for Role Familiarity Engine v1.
// Verifiserer kjerneideen: spillere bygger fortrolighet i en rolle ved RIKTIG
// bruk over kamper, og forvitrer litt ved feilbruk — uten å røre overall eller
// matchScore. Sjekker vekstregler, klamping, lineup-oppsummering + den lille
// kampstyrke-bonusen, normalisering av korrupte data og determinisme.
//
// Ren motor (ingen DOM/fetch/localStorage). Standardbibliotek. Exit 1 ved brudd.

import {
  ROLE_FAMILIARITY_MAX,
  ROLE_FAMILIARITY_BONUS_CAP,
  normalizeRoleFamiliarity,
  getRoleFamiliarity,
  recordMatchRoleUsage,
  describeRoleFamiliarity,
  summarizeLineupFamiliarity
} from "../src/football-role-familiarity-engine.js";

const failures = [];
const check = (label, ok) => {
  if (!ok) failures.push(label);
};

// 1) Riktig bruk bygger fortrolighet; perfekt vokser mer enn god.
{
  let store = {};
  store = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "perfekt" }]);
  store = recordMatchRoleUsage(store, [{ playerId: "p2", roleId: "r1", status: "god" }]);
  const p1 = getRoleFamiliarity(store, "p1", "r1");
  const p2 = getRoleFamiliarity(store, "p2", "r1");
  check("perfekt bruk gir vekst", p1 > 0);
  check("perfekt vokser mer enn god", p1 > p2);
}

// 2) Fortrolighet akkumulerer over flere kamper, og klampes til maks.
{
  let store = {};
  for (let i = 0; i < 30; i++) {
    store = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "perfekt" }]);
  }
  check("akkumulert fortrolighet klampes til maks", getRoleFamiliarity(store, "p1", "r1") === ROLE_FAMILIARITY_MAX);
}

// 3) Feilbruk bygger IKKE forståelse — den forvitrer.
{
  let store = {};
  store = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "god" }]);
  store = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "god" }]);
  const before = getRoleFamiliarity(store, "p1", "r1");
  store = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "feilbrukt" }]);
  const after = getRoleFamiliarity(store, "p1", "r1");
  check("feilbruk forvitrer fortrolighet", after < before);
}

// 4) Fortrolighet er rollespesifikk: samme spiller i en annen rolle starter på 0.
{
  let store = {};
  store = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "perfekt" }]);
  check("fortrolighet er bundet til rollen", getRoleFamiliarity(store, "p1", "r2") === 0);
}

// 5) recordMatchRoleUsage muterer ikke inn-staten (rent funksjonell).
{
  const store = {};
  const next = recordMatchRoleUsage(store, [{ playerId: "p1", roleId: "r1", status: "perfekt" }]);
  check("inn-staten muteres ikke", Object.keys(store).length === 0 && next !== store);
}

// 6) Nivåbeskrivelser stiger med verdien.
{
  check("0 → ny i rollen", describeRoleFamiliarity(0).level === "ny");
  check("40 → i utvikling", describeRoleFamiliarity(40).level === "i_utvikling");
  check("60 → etablert", describeRoleFamiliarity(60).level === "etablert");
  check("90 → mester", describeRoleFamiliarity(90).level === "mester");
  check("over maks klampes", describeRoleFamiliarity(999).value === ROLE_FAMILIARITY_MAX);
}

// 7) Lineup-oppsummering: snitt, etablerte og en liten, klampet bonus.
{
  const store = {
    "p1::r1": 100,
    "p2::r2": 100,
    "p3::r3": 0
  };
  const assignments = [
    { playerId: "p1", roleId: "r1" },
    { playerId: "p2", roleId: "r2" },
    { playerId: "p3", roleId: "r3" }
  ];
  const summary = summarizeLineupFamiliarity(store, assignments);
  check("snitt beregnes", summary.averageFamiliarity === Math.round((100 + 100 + 0) / 3));
  check("etablerte telles", summary.settledCount === 2);
  check("bonus er positiv og innenfor kapasiteten", summary.bonus > 0 && summary.bonus <= ROLE_FAMILIARITY_BONUS_CAP);
}

// 8) Full fortrolighet gir maksbonusen; tomt lag gir ingen bonus.
{
  const allMax = summarizeLineupFamiliarity({ "p1::r1": 100 }, [{ playerId: "p1", roleId: "r1" }]);
  check("full fortrolighet gir maksbonus", allMax.bonus === ROLE_FAMILIARITY_BONUS_CAP);
  const none = summarizeLineupFamiliarity({}, []);
  check("tomt lag gir ingen bonus", none.bonus === 0 && none.averageFamiliarity === 0);
}

// 9) Normalisering rydder bort korrupte data.
{
  const cleaned = normalizeRoleFamiliarity({ "p1::r1": 50, badkey: 10, "p2::r2": -5, "p3::r3": "x", "p4::r4": 250 });
  check("gyldig nøkkel beholdes", cleaned["p1::r1"] === 50);
  check("nøkkel uten :: droppes", !("badkey" in cleaned));
  check("ikke-positiv verdi droppes", !("p2::r2" in cleaned));
  check("ikke-tall droppes", !("p3::r3" in cleaned));
  check("over maks klampes", cleaned["p4::r4"] === ROLE_FAMILIARITY_MAX);
}

// 10) Determinisme: lik input gir byte-identisk output.
{
  const a = recordMatchRoleUsage({ "p1::r1": 40 }, [{ playerId: "p1", roleId: "r1", status: "god" }]);
  const b = recordMatchRoleUsage({ "p1::r1": 40 }, [{ playerId: "p1", roleId: "r1", status: "god" }]);
  check("determinisme", JSON.stringify(a) === JSON.stringify(b));
}

// 11) Tåler tomme/tynne kall uten å kaste.
{
  check("tom record kaster ikke", typeof recordMatchRoleUsage(undefined, undefined) === "object");
  check("tom summarize kaster ikke", summarizeLineupFamiliarity(undefined, undefined).bonus === 0);
}

if (failures.length) {
  console.error("✗ Role Familiarity-sim feilet:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      sampleGrowth: getRoleFamiliarity(
        recordMatchRoleUsage({}, [{ playerId: "p1", roleId: "r1", status: "perfekt" }]),
        "p1",
        "r1"
      ),
      maxBonus: ROLE_FAMILIARITY_BONUS_CAP
    },
    null,
    2
  )
);
process.exit(0);
