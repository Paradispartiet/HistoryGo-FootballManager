// Audit: data/football_scenarios.json
//
// Scenarioer er innhold, ikke kode. Denne auditen sjekker at katalogen henger
// sammen med resten av spillet — særlig at hver motstander-id faktisk finnes
// blant de historiske arketypene. En id som ikke gjør det ville sett riktig ut
// i JSON-en og gitt et scenario med færre motstandere enn det lover.
//
// Den sjekker også at hvert scenario FORKLARER seg. Et scenario uten
// læringsfokus er bare fem kamper mot tilfeldige lag.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HISTORICAL_OPPONENT_PROFILES } from "../src/football-historical-opponent-profiles.js";
import { SCENARIOS_SCHEMA, normalizeScenarios, resolveScenarioOpponents } from "../src/football-scenarios.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(readFileSync(join(root, "data/football_scenarios.json"), "utf8"));
const html = readFileSync(join(root, "index.html"), "utf8");
const app = readFileSync(join(root, "src/app.js"), "utf8");

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

const archetypeIds = new Set(HISTORICAL_OPPONENT_PROFILES.map((profile) => profile.id));
const scenarios = normalizeScenarios(raw);

console.log("Scenario-audit: data/football_scenarios.json\n");

// ---- 1) Skjema og omfang ---------------------------------------------------
console.log("1. Skjema");
check("skjemanavnet stemmer", raw.schema === SCENARIOS_SCHEMA, raw.schema);
check("versjon er satt", Number.isFinite(Number(raw.version)));
check("katalogen har flere enn ett scenario", scenarios.length > 1, `antall=${scenarios.length}`);
check("alle scenarioer i filen er gyldige", scenarios.length === (raw.scenarios || []).length,
  `${scenarios.length} av ${(raw.scenarios || []).length} overlevde normalisering`);

const ids = scenarios.map((scenario) => scenario.id);
check("ingen duplikate scenario-id-er", new Set(ids).size === ids.length,
  ids.filter((id, i) => ids.indexOf(id) !== i).join(", "));

// ---- 2) Hvert scenario forklarer seg --------------------------------------
console.log("\n2. Hvert scenario forklarer seg");
for (const scenario of scenarios) {
  const felt = ["name", "era", "subtitle", "lede", "challenge", "learningFocus"];
  const mangler = felt.filter((key) => !scenario[key]);
  check(`${scenario.id} har navn, epoke, ingress, utfordring og læringsfokus`, mangler.length === 0, mangler.join(", "));
  check(`${scenario.id}: ingressen er en setning, ikke en etikett`, scenario.lede.length > 40, `${scenario.lede.length} tegn`);
  check(`${scenario.id}: læringsfokus sier hva du lærer`, scenario.learningFocus.length > 25);
}

// ---- 3) Motstanderne finnes ------------------------------------------------
console.log("\n3. Motstanderne finnes");
for (const scenario of scenarios) {
  const ukjente = scenario.opponentIds.filter((id) => !archetypeIds.has(id));
  check(`${scenario.id}: alle motstander-id-er finnes som arketyper`, ukjente.length === 0, ukjente.join(", "));

  const resolved = resolveScenarioOpponents(scenario);
  check(`${scenario.id}: fem motstandere (én per kamp)`, resolved.length === 5, `antall=${resolved.length}`);

  const unike = new Set(scenario.opponentIds);
  check(`${scenario.id}: ingen motstander går igjen`, unike.size === scenario.opponentIds.length);

  check(`${scenario.id}: første motstander er med i utvalget`,
    scenario.opponentIds.includes(scenario.firstOpponentId), scenario.firstOpponentId);

  if (scenario.opponentOrder.length > 0) {
    const utenfor = scenario.opponentOrder.filter((id) => !scenario.opponentIds.includes(id));
    check(`${scenario.id}: rekkefølgen bruker bare egne motstandere`, utenfor.length === 0, utenfor.join(", "));
    check(`${scenario.id}: rekkefølgen dekker alle fem`, scenario.opponentOrder.length === scenario.opponentIds.length);
  }
}

// ---- 4) Scenarioene er faktisk forskjellige --------------------------------
// Fem scenarioer med samme motstandere er ett scenario med fem navn.
console.log("\n4. Scenarioene er forskjellige");
for (let i = 0; i < scenarios.length; i += 1) {
  for (let j = i + 1; j < scenarios.length; j += 1) {
    const a = new Set(scenarios[i].opponentIds);
    const felles = scenarios[j].opponentIds.filter((id) => a.has(id)).length;
    check(
      `${scenarios[i].id} og ${scenarios[j].id} har ulikt motstanderfelt`,
      felles < 5,
      `${felles} av 5 felles`
    );
  }
}

// Og hele arketypebiblioteket bør være i bruk et sted — ellers er det data
// ingen møter.
const brukte = new Set(scenarios.flatMap((scenario) => scenario.opponentIds));
const ubrukte = [...archetypeIds].filter((id) => !brukte.has(id));
check("alle historiske arketyper brukes i minst ett scenario", ubrukte.length === 0, ubrukte.join(", "));

// ---- 5) Katalogen driver faktisk flata ------------------------------------
console.log("\n5. Katalogen driver flata");
check("scenariolista bygges fra data, ikke hardkodet i HTML", html.includes('id="scenarioList"') && !/Start scenario<\/button>/.test(html));
check("app.js rendrer lista", /function renderScenarioList/.test(app));
check("app.js starter valgt scenario", /function startScenario\(/.test(app));
check("mini-sesongen bruker scenarioets motstandere", /createScenarioMiniSeasonContext\(scenario, base\)/.test(app));
check("ingen scenario-id er hardkodet som eneste inngang", !/startAjaxScenarioButton/.test(app) && !/startAjaxScenarioButton/.test(html));

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Scenario-audit feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Scenario-audit OK.");
process.exit(0);
