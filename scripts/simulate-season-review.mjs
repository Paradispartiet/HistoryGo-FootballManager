// Sesongdom v1 — simulering
//
// Kjører den rene motoren (`src/football-season-review.js`) og sjekker at
// sesongen faktisk får en slutt som betyr noe: et MÅLBART mål, en dom, en
// følge, og et minne.
//
// Det viktigste den vokter: at dommen forklares med det MANAGEREN gjorde, og at
// ingen blir sparket av ett uhell — advarselen må komme først.

import {
  SEASON_REVIEW_VERSION,
  appendSeasonArchive,
  createSeasonArchiveEntry,
  createSeasonReview,
  deriveSeasonTarget,
  summarizeSeasonHistory
} from "../src/football-season-review.js";
import { applySummerBreak, createCondition, freshnessFor, isInjured } from "../src/football-player-condition.js";
import { readFileSync } from "node:fs";

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

// Åtte klubber, manageren på ønsket plass.
function tableWith(position, { points = 20, goalsFor = 20, goalsAgainst = 20, played = 14 } = {}) {
  return Array.from({ length: 8 }, (_, i) => ({
    position: i + 1,
    club: i + 1 === position ? "Bislett FK" : `Klubb ${i + 1}`,
    isManager: i + 1 === position,
    points: i + 1 === position ? points : 40 - i * 3,
    played,
    goalsFor: i + 1 === position ? goalsFor : 20,
    goalsAgainst: i + 1 === position ? goalsAgainst : 20
  }));
}

const season = (seasonNumber = 1) => ({ seasonNumber });

console.log("Sesongdom: styret gjør opp regnskapet\n");

// ---- 1) Målet er en tabellplass, ikke en stemning -------------------------
console.log("1. Målet");
{
  const første = deriveSeasonTarget({ clubCount: 8, seasonNumber: 1 });
  check("første sesong måles mot øvre halvdel", første.targetPosition === 4, `mål=${første.targetPosition}`);
  check("målet forklares", første.description.length > 30);

  const etterFemte = deriveSeasonTarget({ clubCount: 8, seasonNumber: 2, previousPosition: 5 });
  check("etter femteplass vil styret ha fjerde", etterFemte.targetPosition === 4, `mål=${etterFemte.targetPosition}`);

  const etterAndre = deriveSeasonTarget({ clubCount: 8, seasonNumber: 3, previousPosition: 2 });
  check("etter andreplass vil styret ha gullet", etterAndre.targetPosition === 1 && etterAndre.label === "Seriegull");

  const etterGull = deriveSeasonTarget({ clubCount: 8, seasonNumber: 4, previousPosition: 1 });
  check("etter gull kan de ikke kreve mer enn gull", etterGull.targetPosition === 1);

  const etterSist = deriveSeasonTarget({ clubCount: 8, seasonNumber: 2, previousPosition: 8 });
  check("forventningen vokser aldri mer enn ett steg", etterSist.targetPosition === 7, `mål=${etterSist.targetPosition}`);
}

// ---- 2) Dommen følger plasseringen ----------------------------------------
console.log("\n2. Dommen");
{
  const target = deriveSeasonTarget({ clubCount: 8, seasonNumber: 1 }); // topp 4
  const dom = (position, opts) => createSeasonReview({ season: season(1), table: tableWith(position, opts), target });

  check("seriegull er triumf", dom(1).verdict === "triumph");
  check("bedre enn målet er over forventning", dom(2).verdict === "exceeded");
  check("nøyaktig målet er innfridd", dom(4).verdict === "met");
  check("litt under målet er under forventning", dom(6).verdict === "below", dom(6).verdict);
  check("langt under målet er svikt", dom(8).verdict === "failed", dom(8).verdict);

  check("hver dom har en overskrift", [1, 2, 4, 6, 8].every((p) => dom(p).headline.length > 20));
  check("hver dom har en beskjed fra styret", [1, 2, 4, 6, 8].every((p) => dom(p).boardMessage.length > 20));
  check("versjonen er merket", dom(1).version === SEASON_REVIEW_VERSION);
  check("tabell uten manageren gir ingen dom i stedet for å krasje", createSeasonReview({ table: [] }) === null);
}

// ---- 3) Styretilliten flytter seg ------------------------------------------
console.log("\n3. Styretillit");
{
  const target = deriveSeasonTarget({ clubCount: 8, seasonNumber: 1 });
  const dom = (position) => createSeasonReview({ season: season(1), table: tableWith(position), target, boardTrust: 50 });

  check("gull løfter tilliten mest", dom(1).boardTrustDelta > dom(2).boardTrustDelta);
  check("innfridd gir en liten økning", dom(4).boardTrustDelta > 0 && dom(4).boardTrustDelta < 5);
  check("svikt koster mest", dom(8).boardTrustDelta < dom(6).boardTrustDelta && dom(8).boardTrustDelta < 0);
  check("tilliten holder seg innenfor 0–100", dom(8).boardTrustAfter >= 0 && dom(1).boardTrustAfter <= 100);
  check("tilliten regnes fra der den var", createSeasonReview({ season: season(1), table: tableWith(1), target, boardTrust: 95 }).boardTrustAfter === 100);
}

// ---- 4) Ingen blir sparket av ett uhell ------------------------------------
console.log("\n4. Sparken");
{
  const target = deriveSeasonTarget({ clubCount: 8, seasonNumber: 1 });
  const katastrofe = () => createSeasonReview({ season: season(1), table: tableWith(8), target, previousReviews: [] });

  const første = katastrofe();
  check("første katastrofesesong gir advarsel, ikke sparken", første.warning === true && første.sacked === false);
  check("advarselen sier det rett ut", /én sesong til/.test(første.boardMessage), første.boardMessage);
  check("manageren er trygg etter advarselen", første.managerSafe === true);

  const andre = createSeasonReview({
    season: season(2),
    table: tableWith(8),
    target,
    previousReviews: [createSeasonArchiveEntry(første, {})]
  });
  check("andre katastrofe på rad koster jobben", andre.sacked === true && andre.managerSafe === false);
  check("sparken viser til advarselen", /advarselen/.test(andre.boardMessage), andre.boardMessage);

  // En dårlig, men ikke katastrofal sesong etter en advarsel gir ikke sparken.
  const mildt = createSeasonReview({
    season: season(2),
    table: tableWith(6),
    target,
    previousReviews: [createSeasonArchiveEntry(første, {})]
  });
  check("en middels sesong etter advarsel gir ikke sparken", mildt.sacked === false);

  // Og en god sesong etter advarselen redder deg.
  const redning = createSeasonReview({
    season: season(2),
    table: tableWith(2),
    target,
    previousReviews: [createSeasonArchiveEntry(første, {})]
  });
  check("en god sesong etter advarsel redder jobben", redning.sacked === false && redning.verdict === "exceeded");
}

// ---- 5) Dommen peker på manageren, ikke på spillerne ----------------------
console.log("\n5. Forklaringen");
{
  const target = deriveSeasonTarget({ clubCount: 8, seasonNumber: 1 });
  const playerStats = [
    { playerId: "a", name: "Toppscorer", goals: 12, assists: 2, appearances: 14 },
    { playerId: "b", name: "Playmaker", goals: 1, assists: 9, appearances: 14 },
    ...Array.from({ length: 9 }, (_, i) => ({ playerId: `c${i}`, name: `Spiller ${i}`, goals: 0, assists: 0, appearances: 14 }))
  ];
  const review = createSeasonReview({
    season: season(1),
    table: tableWith(7, { goalsFor: 9, goalsAgainst: 30 }),
    target,
    playerStats
  });

  check("dommen har grunner", review.reasons.length > 0);
  const tekst = review.reasons.join(" ") + " " + review.highlights.join(" ");
  check("ingen grunn skylder på spillerne", !/dårlig(e)? spiller|ikke gode nok|svake spillere/i.test(tekst), tekst);
  check("lite scoring forklares som oppsettet", /oppsettet ga ikke nok trussel/.test(review.reasons.join(" ")));
  check("mye baklengs forklares som balansen", /balansen bakover/.test(review.reasons.join(" ")));
  check("smal rotasjon påpekes", /roterte lite/.test(review.reasons.join(" ")), review.reasons.join(" | "));

  check("toppscoreren krediteres manageren", /plassen og rollen du ga ham/.test(review.highlights.join(" ")));
  check("assistkongen nevnes egen", review.highlights.some((line) => /Playmaker/.test(line)));

  // Bred rotasjon skal roses, ikke straffes.
  const bred = createSeasonReview({
    season: season(1),
    table: tableWith(3),
    target,
    playerStats: Array.from({ length: 18 }, (_, i) => ({ playerId: `p${i}`, name: `P${i}`, goals: 1, assists: 1, appearances: 5 }))
  });
  check("bred bruk av troppen roses", /Bred bruk av troppen/.test(bred.reasons.join(" ")), bred.reasons.join(" | "));
}

// ---- 6) Sesongen huskes ----------------------------------------------------
console.log("\n6. Merittlista");
{
  const target = deriveSeasonTarget({ clubCount: 8, seasonNumber: 1 });
  const playerStats = [{ playerId: "a", name: "Toppscorer", goals: 15, assists: 3, appearances: 14 }];
  const review = createSeasonReview({ season: season(1), table: tableWith(1, { points: 34 }), target, playerStats });
  const entry = createSeasonArchiveEntry(review, { playerStats });

  check("arkivoppføringen har sesongnummer og plassering", entry.seasonNumber === 1 && entry.position === 1);
  check("arkivoppføringen husker toppscoreren", entry.topScorer.name === "Toppscorer" && entry.topScorer.goals === 15);
  check("arkivoppføringen husker dommen", entry.verdict === "triumph" && entry.verdictLabel === "Seriemester");
  check("arkivoppføringen husker målet", entry.targetPosition === 4);

  let archive = appendSeasonArchive([], entry);
  check("arkivet får én sesong", archive.length === 1);

  const andre = createSeasonArchiveEntry(createSeasonReview({ season: season(2), table: tableWith(3), target }), {});
  archive = appendSeasonArchive(archive, andre);
  check("arkivet får to sesonger i rekkefølge", archive.length === 2 && archive[0].seasonNumber === 1 && archive[1].seasonNumber === 2);

  // Samme sesong to ganger skal ikke gi duplikat (idempotens ved reload).
  archive = appendSeasonArchive(archive, andre);
  check("samme sesong arkiveres ikke to ganger", archive.length === 2);

  check("null-oppføring endrer ingenting", appendSeasonArchive(archive, null).length === 2);

  const summary = summarizeSeasonHistory(archive);
  check("sammendraget teller sesonger", summary.seasons === 2);
  check("sammendraget teller seriegull", summary.titles === 1);
  check("sammendraget finner beste plassering", summary.bestPosition === 1);
  check("tomt arkiv krasjer ikke", summarizeSeasonHistory([]).seasons === 0);
}

// ---- 7) Sommerferien nullstiller troppen ----------------------------------
console.log("\n7. Sommerferie");
{
  const conditions = [
    { ...createCondition("a", "A"), load: 88, form: 2.4, consecutiveFullMatches: 9, matchesPlayed: 14, minutesPlayed: 1260 },
    { ...createCondition("b", "B"), load: 60, form: -1.8, injury: { weeksOut: 3, reason: "belastning" } }
  ];
  const etter = applySummerBreak(conditions);

  check("belastningen er nullstilt", etter.every((entry) => entry.load === 0));
  check("alle er friske igjen", etter.every((entry) => freshnessFor(entry) === 100));
  check("skader er ferdig grodd", etter.every((entry) => !isInjured(entry)));
  check("kamprekka er brutt", etter.every((entry) => entry.consecutiveFullMatches === 0));
  check("sesongtellerne er nullstilt", etter.every((entry) => entry.matchesPlayed === 0 && entry.minutesPlayed === 0));
  check("formen faller mot normalen, men nulles ikke helt", etter[0].form > 0 && etter[0].form < 2.4, `form=${etter[0].form}`);
  check("svak form henter seg også inn", etter[1].form < 0 && etter[1].form > -1.8);
  check("spillerne beholder identiteten sin", etter[0].playerId === "a" && etter[0].name === "A");
  check("tom tropp krasjer ikke", applySummerBreak([]).length === 0);
  check("inndata muteres ikke", conditions[0].load === 88);
}

// ---- 8) Motoren er ren ------------------------------------------------------
console.log("\n8. Renhet");
{
  const source = readFileSync(new URL("../src/football-season-review.js", import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
  check("ingen DOM", !/document\.|window\./.test(source));
  check("ingen lagring", !/localStorage/.test(source));
  check("ingen tilfeldighet", !/Math\.random/.test(source));
  check("ingen Date.now", !/Date\.now/.test(source));
  check("dommen leser ikke overall", !/\boverall\b/.test(source));
}

console.log(`\n${passed}/${passed + failed} sjekker bestått.`);
if (failed > 0) {
  console.error(`\n✗ Sesongdom feilet: ${failed} sjekk(er).`);
  process.exit(1);
}
console.log("\n✓ Sesongdom OK.");
process.exit(0);
