// Scenarioer v2 — simulering
//
// Kjører den rene motoren (`src/football-scenarios.js`) sammen med
// mini-sesongmotoren, og sjekker at et scenario faktisk former kampene du
// spiller — ikke bare navnet over dem.
//
// Det viktigste den vokter: at hvert scenario gir et ANNET motstanderfelt.
// Fem scenarioer som ender med samme fem kamper er ett scenario med fem navn.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  createScenarioMiniSeasonContext,
  describeScenario,
  getScenario,
  normalizeScenario,
  normalizeScenarios,
  resolveScenarioOpponents
} from "../src/football-scenarios.js";
import { buildMiniSeasonSchedule, createMiniSeasonState } from "../src/football-mini-season.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(readFileSync(join(root, "data/football_scenarios.json"), "utf8"));
const scenarios = normalizeScenarios(raw);

let failed = 0;
let passed = 0;
function check(label, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FEIL ${label}${detail ? ` (${detail})` : ""}`);
  }
}

console.log("Scenarioer: flere enn ett, og faktisk forskjellige\n");

// ---- 1) Normalisering er robust -------------------------------------------
console.log("1. Normalisering");
{
  check("katalogen gir flere scenarioer", scenarios.length >= 5, `antall=${scenarios.length}`);
  check("scenario uten id forkastes", normalizeScenario({ opponentIds: ["a"] }) === null);
  check("scenario uten motstandere forkastes", normalizeScenario({ id: "x" }) === null);
  check("tom inndata gir tom liste", normalizeScenarios(null).length === 0);
  check("første motstander faller tilbake til den første i lista", normalizeScenario({ id: "x", opponentIds: ["a", "b"] }).firstOpponentId === "a");
  check("oppslag på ukjent id gir null", getScenario(scenarios, "finnes_ikke") === null);
  check("oppslag på kjent id treffer", getScenario(scenarios, scenarios[0].id)?.id === scenarios[0].id);
}

// ---- 2) Motstanderne løses opp til ekte arketyper --------------------------
console.log("\n2. Motstandere");
for (const scenario of scenarios) {
  const opponents = resolveScenarioOpponents(scenario);
  check(`${scenario.id}: fem ekte arketyper`, opponents.length === 5, `antall=${opponents.length}`);
  check(`${scenario.id}: hver motstander har en spillestil kampmotoren kan lese`,
    opponents.every((opponent) => opponent.styleTraits && opponent.strength > 0));
}

// ---- 3) Terminlista formes av scenarioet ----------------------------------
console.log("\n3. Terminlista");
{
  const felt = new Map();
  for (const scenario of scenarios) {
    const context = createScenarioMiniSeasonContext(scenario, { teamName: "Test" });
    check(`${scenario.id}: gir en gyldig mini-sesongkontekst`, Boolean(context) && context.opponents.length === 5);

    const schedule = buildMiniSeasonSchedule(context);
    check(`${scenario.id}: fem runder`, schedule.length === 5, `antall=${schedule.length}`);

    const brukte = schedule.map((round) => round.opponentId);
    const utenfor = brukte.filter((id) => !scenario.opponentIds.includes(id));
    check(`${scenario.id}: bare scenarioets egne motstandere spilles`, utenfor.length === 0, utenfor.join(", "));
    check(`${scenario.id}: hver runde forklarer seg`, schedule.every((round) => round.narrativeHook && round.boardExpectation));

    // Fem motstandere, fem kamper: hver skal spilles nøyaktig én gang. Da den
    // valgte førstemotstanderen bare overstyrte runde 1, forsvant én motstander
    // helt og en annen ble spilt to ganger.
    check(
      `${scenario.id}: alle fem motstanderne spilles nøyaktig én gang`,
      new Set(brukte).size === 5 && scenario.opponentIds.every((id) => brukte.includes(id)),
      brukte.join(" → ")
    );

    felt.set(scenario.id, brukte.join("|"));
  }

  // To scenarioer skal ikke gi identisk kampprogram.
  const nøkler = [...felt.keys()];
  for (let i = 0; i < nøkler.length; i += 1) {
    for (let j = i + 1; j < nøkler.length; j += 1) {
      check(
        `${nøkler[i]} og ${nøkler[j]} gir ulikt kampprogram`,
        felt.get(nøkler[i]) !== felt.get(nøkler[j])
      );
    }
  }
}

// ---- 4) Fast rekkefølge når fortellingen krever det -----------------------
console.log("\n4. Fast rekkefølge");
{
  const ordered = scenarios.filter((scenario) => scenario.opponentOrder.length > 0);
  check("minst ett scenario har en fast rekkefølge", ordered.length > 0, `antall=${ordered.length}`);

  for (const scenario of ordered) {
    const schedule = buildMiniSeasonSchedule(createScenarioMiniSeasonContext(scenario, {}));
    const faktisk = schedule.map((round) => round.opponentId);
    check(
      `${scenario.id}: kampene kommer i den oppgitte rekkefølgen`,
      faktisk.join("|") === scenario.opponentOrder.join("|"),
      `fikk ${faktisk.join(" → ")}`
    );
  }

  // Uten fast rekkefølge sorterer motoren fortsatt etter styrke som før.
  const fri = scenarios.find((scenario) => scenario.opponentOrder.length === 0);
  if (fri) {
    const schedule = buildMiniSeasonSchedule(createScenarioMiniSeasonContext(fri, {}));
    check(`${fri.id}: uten fast rekkefølge starter du mot den oppgitte første motstanderen`,
      schedule[0].opponentId === fri.firstOpponentId, schedule[0].opponentId);
  }
}

// ---- 5) Determinisme -------------------------------------------------------
console.log("\n5. Determinisme");
{
  const scenario = scenarios[0];
  const a = buildMiniSeasonSchedule(createScenarioMiniSeasonContext(scenario, {}));
  const b = buildMiniSeasonSchedule(createScenarioMiniSeasonContext(scenario, {}));
  check("samme scenario gir samme terminliste hver gang",
    a.map((r) => r.opponentId).join("|") === b.map((r) => r.opponentId).join("|"));

  const state = createMiniSeasonState(createScenarioMiniSeasonContext(scenario, {}));
  check("mini-sesongen bygges uten feil", Boolean(state) && state.opponentSchedule.length === 5);
  check("sesongen har en id som peker på scenarioet", String(state.seasonId).includes(scenario.id), state.seasonId);
}

// ---- 6) Kortene forklarer seg ----------------------------------------------
console.log("\n6. Kortene");
for (const scenario of scenarios) {
  const info = describeScenario(scenario);
  check(`${scenario.id}: kortet har navn, epoke, utfordring og læringsfokus`,
    Boolean(info.name && info.era && info.challenge && info.learningFocus));
  check(`${scenario.id}: kortet lister motstanderne med lesbare navn`,
    info.opponentNames.length === 5 && info.opponentNames.every((name) => name && !name.includes("_")),
    info.opponentNames.join(", "));
  check(`${scenario.id}: kortet sier fem kamper`, info.matchCount === 5);
}

// ---- 7) Motoren er ren ------------------------------------------------------
console.log("\n7. Renhet");
{
  const source = readFileSync(join(root, "src/football-scenarios.js"), "utf8").replace(/\/\/.*$/gm, "");
  check("ingen DOM", !/document\.|window\./.test(source));
  check("ingen lagring", !/localStorage/.test(source));
  check("ingen fetch", !/fetch\(/.test(source));
  check("ingen hardkodede spillere eller formasjoner", !/naturalPositions|slotId/.test(source));
}

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Scenario-simulering feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Scenarioer OK.");
process.exit(0);
