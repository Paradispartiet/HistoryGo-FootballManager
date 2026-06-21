// scripts/simulate-formation-matchup.mjs
//
// Read-only demonstrasjon + validering av Formation Knowledge Engine sitt
// beregningslag (src/engine/evaluateFormationMatchup.ts, bygget til dist/).
//
// Kjorer matchups mellom alle dekkede formasjoner, sjekker strukturelle
// invarianter (gyldige tokens fra vocab, score = fordeler - risikoer, gyldig
// lean), bekrefter et par kjente taktiske utfall, og skriver en lean-matrise.
//
// Rent Node-script (standardbibliotek + bygget dist/). Krever `npm run build`.
// Exit code 1 hvis en sjekk feiler, ellers 0.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

let engine;
try {
  engine = await import(join(ROOT, "dist/index.js"));
} catch (error) {
  console.error("Kunne ikke laste dist/. Kjor `npm run build` forst.", error.message);
  process.exit(1);
}
const { evaluateFormationMatchup, evaluateFormationVsOpponentStyles } = engine;

// Live .js-kampmotor (plain ESM, ingen build): motstanderprofiler + .js-matchup.
const { OPPONENT_PROFILES, evaluateFormationMatchupVsOpponent, calculateMatchStrength } = await import(
  join(ROOT, "src/football-matchday-engine.js")
);

// Historical Opponent Archetypes v1: de historiske stil-profilene bærer samme
// matchupStyles-felt og må også gi gyldig TS/JS-paritet i formasjons-matchupen.
const { HISTORICAL_OPPONENT_PROFILES } = await import(
  join(ROOT, "src/football-historical-opponent-profiles.js")
);

const knowledgeData = loadJson("data/hgFootball/formationKnowledge.json");
const formations = loadJson("data/hgFootball/formations.json").formations;
const byId = Object.fromEntries(formations.map((f) => [f.id, f]));

const vocab = new Set(knowledgeData.vocab.opponentStyles);
const LEANS = new Set(["favourable", "balanced", "risky"]);
const SOURCES = new Set(["opponent_weakness", "own_strength", "opponent_strength", "own_weakness"]);
const historicalFormationIds = new Set(HISTORICAL_OPPONENT_PROFILES.map((profile) => profile.formationId));

const entries = knowledgeData.knowledge.map((k) => ({
  formationId: k.formationId,
  name: byId[k.formationId]?.name ?? k.formationId,
  baseShape: byId[k.formationId]?.baseShape,
  parameterProfile: k.parameterProfile,
  strongAgainst: k.strongAgainst,
  weakAgainst: k.weakAgainst,
  learningPoints: k.learningPoints,
  relatedOpponentArchetypes: k.relatedOpponentArchetypes,
  matchupSignals: k.matchupSignals,
}));

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

// 1) Strukturelle invarianter over alle par.
for (const you of entries) {
  for (const opp of entries) {
    const r = evaluateFormationMatchup(you, opp);
    const label = `${you.formationId} vs ${opp.formationId}`;

    check(Array.isArray(r.yourTokens) && Array.isArray(r.opponentTokens), `${label}: tokens ikke array`);
    check([...r.yourTokens, ...r.opponentTokens].every((t) => vocab.has(t)), `${label}: token utenfor vocab`);
    check(Array.isArray(r.advantages) && Array.isArray(r.risks), `${label}: adv/risk ikke array`);
    check([...r.advantages, ...r.risks].every((p) => SOURCES.has(p.source) && vocab.has(p.token)), `${label}: ugyldig point`);
    check(r.score === r.advantages.length - r.risks.length, `${label}: score != adv - risk`);
    check(LEANS.has(r.lean), `${label}: ugyldig lean ${r.lean}`);
    check(typeof r.summary === "string" && r.summary.length > 0, `${label}: tomt summary`);
  }
  check(Array.isArray(you.learningPoints) && you.learningPoints.length > 0, `${you.formationId}: mangler læringspunkter`);
  check(Array.isArray(you.matchupSignals) && you.matchupSignals.length > 0, `${you.formationId}: mangler matchupSignals`);
  if (historicalFormationIds.has(you.formationId)) {
    check(Array.isArray(you.relatedOpponentArchetypes) && you.relatedOpponentArchetypes.length > 0, `${you.formationId}: historisk formasjon mangler opponent-kobling`);
  }
}

// 2) Kjente taktiske utfall (forankret i de authored dataene).
const possessionVsGegen = evaluateFormationMatchup(
  entries.find((e) => e.formationId === "possession_433"),
  entries.find((e) => e.formationId === "gegen_4222"),
);
check(possessionVsGegen.lean === "risky", `possession_433 vs gegen_4222: forventet risky, fikk ${possessionVsGegen.lean}`);

const catenaccioVsPossession = evaluateFormationMatchup(
  entries.find((e) => e.formationId === "catenaccio_532"),
  entries.find((e) => e.formationId === "possession_433"),
);
check(catenaccioVsPossession.lean === "favourable", `catenaccio_532 vs possession_433: forventet favourable, fikk ${catenaccioVsPossession.lean}`);

// 3) «Ingen taktikk er perfekt mot alt»: minst én formasjon skal ha bade en
//    favourable og en risky matchup mot ulike motstandere.
let hasMixedFormation = false;
for (const you of entries) {
  const leans = entries.filter((o) => o.formationId !== you.formationId).map((o) => evaluateFormationMatchup(you, o).lean);
  if (leans.includes("favourable") && leans.includes("risky")) {
    hasMixedFormation = true;
    break;
  }
}
check(hasMixedFormation, "Ingen formasjon hadde bade favourable og risky matchup – matchup-logikken gir for flate utfall");

// 4) Paritet: TS evaluateFormationVsOpponentStyles == .js
//    evaluateFormationMatchupVsOpponent (kampmotorens motstanderprofiler).
//    Bekrefter at den live .js-kampmotoren og TS-motoren gir samme matchup.
let opponentPairs = 0;
for (const you of entries) {
  for (const profile of OPPONENT_PROFILES) {
    const styles = profile.matchupStyles;
    check(Array.isArray(styles) && styles.every((s) => vocab.has(s)), `${profile.id}: ugyldige matchupStyles`);
    const ts = evaluateFormationVsOpponentStyles(you, styles, profile.name);
    const js = evaluateFormationMatchupVsOpponent(
      { strongAgainst: you.strongAgainst, weakAgainst: you.weakAgainst },
      styles,
      profile.name,
    );
    opponentPairs++;
    const same =
      ts.lean === js.lean &&
      ts.score === js.score &&
      ts.summary === js.summary &&
      JSON.stringify(ts.advantages) === JSON.stringify(js.advantages) &&
      JSON.stringify(ts.risks) === JSON.stringify(js.risks) &&
      JSON.stringify(ts.suggestions) === JSON.stringify(js.suggestions);
    check(
      Array.isArray(js.suggestions) &&
        js.suggestions.every((s) => typeof s === "string" && s.length > 0) &&
        js.suggestions.length <= js.risks.length,
      `${you.formationId} vs ${profile.id}: ugyldige suggestions`,
    );
    check(same, `paritet TS!=JS for ${you.formationId} vs ${profile.id} (TS ${ts.lean}/${ts.score}, JS ${js.lean}/${js.score})`);
  }
}

// 4b) Historiske stil-motstandere: matchupStyles i vokabular + TS/JS-paritet.
let historicalPairs = 0;
for (const you of entries) {
  for (const profile of HISTORICAL_OPPONENT_PROFILES) {
    const styles = profile.matchupStyles;
    check(Array.isArray(styles) && styles.every((s) => vocab.has(s)), `${profile.id}: ugyldige matchupStyles (historisk)`);
    const ts = evaluateFormationVsOpponentStyles(you, styles, profile.name);
    const js = evaluateFormationMatchupVsOpponent(
      { strongAgainst: you.strongAgainst, weakAgainst: you.weakAgainst },
      styles,
      profile.name,
    );
    historicalPairs++;
    const same = ts.lean === js.lean && ts.score === js.score && ts.summary === js.summary;
    check(same, `paritet TS!=JS for ${you.formationId} vs ${profile.id} (historisk)`);
  }
}

// 5) Nudge: matchupen pavirker faktisk lagstyrken (liten, capped tendens).
//    Samme lag: gunstig matchup > noytral > risikabel, men forskjellen er liten.
const nudgeTeamFit = {
  teamScore: 72, completeCount: 11, totalSlots: 11,
  metrics: { balanceScore: 70, widthScore: 70, depthScore: 70, buildUpScore: 70, pressScore: 70, restDefenseScore: 70 },
  relationships: { relationshipScore: 70 }, historicalFormationFit: {}, assignments: [],
};
const strFav = calculateMatchStrength({ teamFit: nudgeTeamFit, formation: { id: "x" }, formationMatchup: { score: 3 } });
const strNeu = calculateMatchStrength({ teamFit: nudgeTeamFit, formation: { id: "x" }, formationMatchup: { score: 0 } });
const strRsk = calculateMatchStrength({ teamFit: nudgeTeamFit, formation: { id: "x" }, formationMatchup: { score: -3 } });
check(strFav.finalStrength > strNeu.finalStrength && strNeu.finalStrength > strRsk.finalStrength,
  `nudge-rekkefolge feil: fav ${strFav.finalStrength}, neu ${strNeu.finalStrength}, risky ${strRsk.finalStrength}`);
check(Math.abs(strFav.finalStrength - strNeu.finalStrength) <= 5 && Math.abs(strNeu.finalStrength - strRsk.finalStrength) <= 5,
  "nudge for stor – matchup skal kun gi en liten tendens (<=5)");
check(strNeu.modifiers.matchupTendency === 0, "noytral matchup skal gi 0 tendens");

// Rapport: lean-matrise (din formasjon i rad, motstander i kolonne).
const sym = { favourable: "+", balanced: "·", risky: "-" };
const ids = entries.map((e) => e.formationId);
const short = (id) => id.slice(0, 6).padEnd(6);
console.log("Formation matchup – lean-matrise (rad = ditt system, kolonne = motstander)");
console.log("        " + ids.map(short).join(" "));
for (const you of entries) {
  const row = entries.map((o) => ` ${sym[evaluateFormationMatchup(you, o).lean]}    `.slice(0, 6)).join(" ");
  console.log(short(you.formationId) + "  " + row);
}
console.log(`\nPar vurdert: ${entries.length * entries.length} (formasjon vs formasjon) + ${opponentPairs} (formasjon vs motstanderprofil, TS/JS-paritet) + ${historicalPairs} (formasjon vs historisk stil-profil)`);
const linkedHistorical = entries.filter((entry) => entry.relatedOpponentArchetypes?.length).length;
console.log(`Historiske formation knowledge-koblinger: ${linkedHistorical}`);
console.log("Eksempel – possession_433 mot gegen_4222:");
console.log("  " + possessionVsGegen.summary);
for (const p of [...possessionVsGegen.advantages, ...possessionVsGegen.risks]) console.log("   • " + p.text);

if (failures.length > 0) {
  console.log(`\n${failures.length} sjekk(er) feilet:`);
  for (const f of failures) console.log("- " + f);
  console.log("Result: FAIL");
  process.exit(1);
}
console.log("\nAlle matchup-sjekker besto.");
process.exit(0);
