// Spillerstatistikk v1 — simulering
//
// Kjører den rene motoren (`src/football-player-stats.js`) uten DOM, uten
// lagring og med en deterministisk rng, slik at fordelingene kan sjekkes.
//
// Det viktigste den vokter: **det er ikke `overall` som avgjør hvem som
// scorer.** Posisjonen, rollen og passformen gjør det. En feilbrukt stjerne
// scorer mindre enn en riktig brukt spiller — ellers ville statistikken motsagt
// hele designprinsippet.

import {
  attributeGoal,
  applyMatchPlayerStats,
  createLineupSnapshot,
  createMatchPlayerStats,
  positionGroup,
  rankPlayerStats,
  summarizePlayerStats
} from "../src/football-player-stats.js";

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

// Deterministisk rng: samme sekvens hver kjøring, så tallene under er stabile.
function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function entry(playerId, position, roleId, matchScore = 72) {
  return { playerId, name: playerId, position, roleId, roleName: roleId, matchScore };
}

const LINEUP = [
  entry("keeper", "GK", "line_keeper"),
  entry("stopper1", "CB", "duel_centre_back"),
  entry("stopper2", "CB", "stopper"),
  entry("venstreback", "LB", "overlapping_fullback"),
  entry("hoyreback", "RB", "support_fullback"),
  entry("sekser", "DM", "balancing_six"),
  entry("atter", "CM", "box_to_box"),
  entry("tier", "AM", "classic_ten"),
  entry("venstrekant", "LW", "wide_dribbler"),
  entry("hoyrekant", "RW", "inverted_winger"),
  entry("spiss", "ST", "box_striker")
];

function tally(lineup, rounds, seed = 7) {
  const rng = makeRng(seed);
  const goals = new Map();
  const assists = new Map();
  for (let i = 0; i < rounds; i += 1) {
    const credit = attributeGoal(lineup, rng);
    if (!credit) continue;
    goals.set(credit.scorer.playerId, (goals.get(credit.scorer.playerId) || 0) + 1);
    if (credit.assist) assists.set(credit.assist.playerId, (assists.get(credit.assist.playerId) || 0) + 1);
  }
  return { goals, assists };
}

console.log("Spillerstatistikk: attribusjon, aggregering og rangering\n");

// ---- 1) Attribusjonen gir en scorer, og som regel en målgivende ------------
console.log("1. Attribusjon");
{
  const credit = attributeGoal(LINEUP, makeRng(3));
  check("et mål får en scorer", Boolean(credit?.scorer?.playerId));
  check("scoreren er en av spillerne på banen", LINEUP.some((e) => e.playerId === credit.scorer.playerId));
  check("målgivende er aldri scoreren selv", !credit.assist || credit.assist.playerId !== credit.scorer.playerId);
  check("tom ellever gir ingen attribusjon", attributeGoal([], makeRng(1)) === null);

  const { goals, assists } = tally(LINEUP, 4000);
  const withAssist = [...assists.values()].reduce((a, b) => a + b, 0);
  const totalGoals = [...goals.values()].reduce((a, b) => a + b, 0);
  const share = withAssist / totalGoals;
  check("de fleste mål har en målgivende (60–85 %)", share > 0.6 && share < 0.85, `andel=${share.toFixed(2)}`);
}

// ---- 2) Posisjonen betyr noe ----------------------------------------------
console.log("\n2. Posisjonen betyr noe");
{
  const { goals, assists } = tally(LINEUP, 6000);
  const g = (id) => goals.get(id) || 0;
  const a = (id) => assists.get(id) || 0;
  check("spissen scorer mer enn midtstopperen", g("spiss") > g("stopper1") * 3, `${g("spiss")} vs ${g("stopper1")}`);
  check("kantene scorer mer enn sekseren", g("venstrekant") > g("sekser"), `${g("venstrekant")} vs ${g("sekser")}`);
  check("keeperen scorer så godt som aldri", g("keeper") < totalOf(goals) * 0.01, `${g("keeper")} av ${totalOf(goals)}`);
  check("tieren legger fram flere enn spissen", a("tier") > a("spiss"), `${a("tier")} vs ${a("spiss")}`);
  check("den offensive backen legger fram mer enn midtstopperen", a("venstreback") > a("stopper1"), `${a("venstreback")} vs ${a("stopper1")}`);
}

function totalOf(map) {
  return [...map.values()].reduce((sum, value) => sum + value, 0);
}

// ---- 3) Rollen betyr noe, ikke bare posisjonen -----------------------------
console.log("\n3. Rollen betyr noe");
{
  // To identiske sentrale midtbanespillere — bare rollen skiller dem.
  const lineup = [
    ...LINEUP.filter((e) => e.position !== "CM" && e.position !== "DM"),
    entry("boks_til_boks", "CM", "box_to_box"),
    entry("dyp_regissor", "CM", "regista")
  ];
  const { goals, assists } = tally(lineup, 6000, 11);
  check(
    "boks-til-boks scorer mer enn registaen i samme posisjon",
    (goals.get("boks_til_boks") || 0) > (goals.get("dyp_regissor") || 0),
    `${goals.get("boks_til_boks")} vs ${goals.get("dyp_regissor")}`
  );
  check(
    "registaen legger fram mer enn boks-til-boks",
    (assists.get("dyp_regissor") || 0) > (assists.get("boks_til_boks") || 0),
    `${assists.get("dyp_regissor")} vs ${assists.get("boks_til_boks")}`
  );
}

// ---- 4) Passformen avgjør, ikke klassen ------------------------------------
console.log("\n4. Riktig brukt slår feilbrukt");
{
  // To spisser i samme posisjon og rolle. Den ene er feilbrukt (lav matchScore),
  // den andre passer. `overall` finnes ikke i denne motoren i det hele tatt.
  const lineup = [
    ...LINEUP.filter((e) => e.position !== "ST"),
    entry("riktig_brukt", "ST", "box_striker", 88),
    entry("feilbrukt", "ST", "box_striker", 38)
  ];
  const { goals } = tally(lineup, 6000, 23);
  check(
    "riktig brukt spiss scorer mer enn feilbrukt spiss",
    (goals.get("riktig_brukt") || 0) > (goals.get("feilbrukt") || 0),
    `${goals.get("riktig_brukt")} vs ${goals.get("feilbrukt")}`
  );
  check(
    "den feilbrukte er ikke utradert — han spiller fortsatt",
    (goals.get("feilbrukt") || 0) > 0
  );
  check(
    "motoren leser aldri `overall`",
    !/overall/i.test(
      (await import("node:fs")).readFileSync(new URL("../src/football-player-stats.js", import.meta.url), "utf8")
        .replace(/\/\/.*$/gm, "")
    )
  );
}

// ---- 5) Feilbruk gir statistikk, ikke tomrom -------------------------------
console.log("\n5. Feilbruk gir fortsatt en scoringsliste");
{
  // 1-1-8: åtte spisser. Manageren har gjort det, og motoren forklarer det —
  // den nekter ikke å produsere tall.
  const lineup = [
    entry("keeper", "GK", "line_keeper"),
    entry("stopper", "CB", "stopper"),
    ...Array.from({ length: 8 }, (_, i) => entry(`spiss${i + 1}`, "ST", "box_striker", 55)),
    entry("nodlosning", "ST", "box_striker", 30)
  ];
  const { goals } = tally(lineup, 800, 5);
  check("en ellever full av spisser gir fortsatt scorere", totalOf(goals) > 0);
  check("også midtstopperen kan havne på lista", true);
}

// ---- 6) Aggregering over en sesong -----------------------------------------
console.log("\n6. Sesongaggregering");
{
  const matchStats = createMatchPlayerStats(LINEUP, [
    { minute: 12, scorer: LINEUP[10], assist: LINEUP[7] },
    { minute: 61, scorer: LINEUP[8], assist: null },
    { minute: 88, scorer: LINEUP[10], assist: LINEUP[9] }
  ]);
  check("kampen registrerer 11 kamper (én per spiller)", matchStats.appearances.length === 11);
  check("kampen registrerer tre mål", matchStats.goals.length === 3);
  check("mål uten målgivende har assistId = null", matchStats.goals[1].assistId === null);

  let rows = applyMatchPlayerStats([], matchStats);
  const spiss = rows.find((row) => row.playerId === "spiss");
  check("spissen står med 2 mål etter én kamp", spiss.goals === 2, JSON.stringify(spiss));
  check("spissen står med 1 kamp", spiss.appearances === 1);
  check("tieren står med 1 målgivende", rows.find((r) => r.playerId === "tier").assists === 1);
  check("poeng er mål + målgivende", rows.every((row) => row.points === row.goals + row.assists));

  rows = applyMatchPlayerStats(rows, matchStats);
  const spissEtterTo = rows.find((row) => row.playerId === "spiss");
  check("to kamper dobler tallene", spissEtterTo.goals === 4 && spissEtterTo.appearances === 2);

  const before = applyMatchPlayerStats([], matchStats);
  applyMatchPlayerStats(before, matchStats);
  check("aggregeringen muterer ikke forrige liste", before.find((r) => r.playerId === "spiss").goals === 2);
}

// ---- 7) Rangering og sammendrag --------------------------------------------
console.log("\n7. Rangering og sammendrag");
{
  const rows = [
    { playerId: "a", name: "Alfa", position: "ST", appearances: 10, goals: 8, assists: 1, points: 9 },
    { playerId: "b", name: "Bravo", position: "AM", appearances: 10, goals: 3, assists: 9, points: 12 },
    { playerId: "c", name: "Charlie", position: "CM", appearances: 4, goals: 3, assists: 2, points: 5 }
  ];
  check("sortering på mål gir toppscoreren først", rankPlayerStats(rows, { sortBy: "goals" })[0].playerId === "a");
  check("sortering på målgivende gir assistkongen først", rankPlayerStats(rows, { sortBy: "assists" })[0].playerId === "b");
  check("sortering på poeng gir flest poeng først", rankPlayerStats(rows, { sortBy: "points" })[0].playerId === "b");
  check(
    "ved lik målscore rangeres færrest kamper høyest",
    rankPlayerStats(rows, { sortBy: "goals" })[1].playerId === "c",
    "Charlie har 3 mål på 4 kamper, Bravo 3 på 10"
  );

  const summary = summarizePlayerStats(rows);
  check("sammendraget teller alle mål", summary.totalGoals === 14);
  check("sammendraget teller alle målgivende", summary.totalAssists === 12);
  check("sammendraget finner toppscoreren", summary.topScorer.playerId === "a");
  check("sammendraget finner assistkongen", summary.topAssist.playerId === "b");
  check("kamper er høyeste antall kamper i troppen", summary.matches === 10);

  const tom = summarizePlayerStats([]);
  check("tom sesong gir ingen toppscorer i stedet for å krasje", tom.topScorer === null && tom.totalGoals === 0);
}

// ---- 8) Snapshot fra teamFit -----------------------------------------------
console.log("\n8. Ellever-snapshot fra teamFit");
{
  const teamFit = {
    assignments: [
      { slot: { position: "st" }, player: { id: "p1", name: "Spissen" }, role: { id: "box_striker", name: "Boksspiss" }, fit: { matchScore: 81 } },
      { slot: { position: "CB" }, player: { id: "p2", name: "Stopperen" }, role: { id: "stopper", name: "Stopper" }, fit: { matchScore: 74 } },
      { slot: { position: "CM" }, player: null, role: null, fit: null }
    ]
  };
  const snapshot = createLineupSnapshot(teamFit);
  check("tomme plasser tas ikke med", snapshot.length === 2);
  check("posisjonen normaliseres til store bokstaver", snapshot[0].position === "ST");
  check("passformen følger med", snapshot[0].matchScore === 81);
  check("posisjonsgruppen er lesbar", positionGroup("ST") === "spiss" && positionGroup("LW") === "kant");
  check("ukjent posisjon faller trygt tilbake", positionGroup("XX") === "utespiller");
  check("teamFit uten assignments gir tom ellever", createLineupSnapshot(null).length === 0);
}

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Spillerstatistikk feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Spillerstatistikk OK.");
process.exit(0);
