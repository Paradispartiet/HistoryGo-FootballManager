// Kvalifiseringskampene: opp- og nedrykk avgjøres på banen, ikke i en tabell.
//
// Før dette var 3. plass i OBOS og 14. plass i Eliteserien to plasseringer
// spillet NEVNTE og så ikke gjorde noe med — `promotion_playoff` var en streng
// uten kamper bak seg, og sesongen rullet videre som om plasseringen var 4. og
// 13. Det er samme klasse som resten av feilene i dette prosjektet: ingenting
// feilet, det bare skjedde ikke noe.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createLeagueSeason, completeLeagueRound, resolveLeagueOutcome,
  startNextLeagueSeason, isPlayoffPending, roundsForClubCount
} from "../src/football-league-season.js";
import {
  createLeaguePlayoff, completePlayoffLeg, resolveLeaguePlayoff, describePlayoff,
  getCurrentPlayoffRound, getCurrentPlayoffLeg, getPlayoffMatchdayOpponent,
  normalizeLeaguePlayoff, LEAGUE_PLAYOFF_VERSION
} from "../src/football-league-playoff.js";

const { tiers, clubs: allClubs } = JSON.parse(
  fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8")
);
const tierById = new Map(tiers.map((tier) => [tier.id, tier]));
const managerIn = (tierId, group = null) => ({
  id: "manager-fk", name: "Manager FK", ground: "Klubbankeret", city: "Testby",
  tier: tierId, ...(group ? { group } : {}), strength: 66, form: 55
});
const opponentsFor = (tier, group = null) =>
  allClubs.filter((club) => club.tier === tier.id && (!group || club.group === group));

let checks = 0;
const check = (name, condition, detail = "") => {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
};

// ---------------------------------------------------------------------------
// 1. Kvalifisering finnes bare fra en kvalifiseringsplass
// ---------------------------------------------------------------------------
const obos = tierById.get("obosligaen");
for (const movement of ["promoted", "relegated", "stay", "champion", "bottom"]) {
  const playoff = createLeaguePlayoff({
    outcome: { movement, tierId: "obosligaen", position: 5, seasonNumber: 1 },
    managerClub: managerIn("obosligaen"), allClubs, tiers, seed: "x"
  });
  check(`«${movement}» gir ingen kvalifisering`, playoff === null);
}

// ---------------------------------------------------------------------------
// 2. Formatet: to kamper, og den som forsvarer plassen avslutter hjemme
//
// Utfordreren nedenfra åpner hjemme og avslutter borte. Det er den norske
// rekkefølgen, og det er en reell fordel — så den må ligge riktig vei.
// ---------------------------------------------------------------------------
const promotionPlayoff = createLeaguePlayoff({
  outcome: { movement: "promotion_playoff", tierId: "obosligaen", position: 3, seasonNumber: 1 },
  managerClub: managerIn("obosligaen"), allClubs, tiers, seed: "kval-opp"
});
check("opprykkskvalifisering har én omgang", promotionPlayoff.rounds.length === 1);
check("utfordreren åpner hjemme", promotionPlayoff.rounds[0].legs[0].homeAway === "home");
check("utfordreren avslutter borte", promotionPlayoff.rounds[0].legs[1].homeAway === "away");
check("motparten kommer fra nivået over", tierById.get(promotionPlayoff.targetTierId).level < obos.level);
const upOpponent = allClubs.find((club) => club.id === promotionPlayoff.rounds[0].opponent.id);
check("motparten oppover er en klubb i divisjonen over", upOpponent.tier === "eliteserien", upOpponent.name);
// Skal du opp, møter du BUNNEN av divisjonen over — det er der 14.-plassen er.
const topTierSorted = [...allClubs.filter((club) => club.tier === "eliteserien")].sort((a, b) => a.strength - b.strength);
check("motparten oppover er hentet fra bunnsjiktet", topTierSorted.slice(0, 4).some((club) => club.id === upOpponent.id), upOpponent.name);

const relegationPlayoff = createLeaguePlayoff({
  outcome: { movement: "relegation_playoff", tierId: "eliteserien", position: 14, seasonNumber: 1 },
  managerClub: managerIn("eliteserien"), allClubs, tiers, seed: "kval-ned"
});
check("nedrykkskvalifisering har én omgang", relegationPlayoff.rounds.length === 1);
check("den som forsvarer plassen åpner borte", relegationPlayoff.rounds[0].legs[0].homeAway === "away");
check("den som forsvarer plassen avslutter hjemme", relegationPlayoff.rounds[0].legs[1].homeAway === "home");
const downOpponent = allClubs.find((club) => club.id === relegationPlayoff.rounds[0].opponent.id);
check("motparten nedover er en klubb i divisjonen under", downOpponent.tier === "obosligaen", downOpponent.name);
// Forsvarer du plassen, møter du den som har spilt seg fram nedenfra — toppen.
const obosSorted = [...allClubs.filter((club) => club.tier === "obosligaen")].sort((a, b) => b.strength - a.strength);
check("motparten nedover er hentet fra toppsjiktet", obosSorted.slice(0, 4).some((club) => club.id === downOpponent.id), downOpponent.name);

// ---------------------------------------------------------------------------
// 3. 2. divisjon har to omganger: avdelingsoppgjøret først
//
// Toerne i de to avdelingene møtes, og vinneren går videre mot OBOS. Uten det
// ville et delt nivå oppført seg som et udelt.
// ---------------------------------------------------------------------------
const secondDivision = tierById.get("andredivisjon");
const twoRound = createLeaguePlayoff({
  outcome: { movement: "promotion_playoff", tierId: "andredivisjon", position: 2, seasonNumber: 1 },
  managerClub: managerIn("andredivisjon", "avdeling1"), allClubs, tiers, seed: "kval-2div"
});
check("2. divisjon har to omganger", twoRound.rounds.length === 2, String(twoRound.rounds.length));
check("første omgang er avdelingsoppgjøret", twoRound.rounds[0].role === "peer");
const peer = allClubs.find((club) => club.id === twoRound.rounds[0].opponent.id);
check("avdelingsoppgjøret går mot den ANDRE avdelingen", peer.tier === "andredivisjon" && peer.group === "avdeling2", `${peer.name} (${peer.group})`);
check("andre omgang går mot OBOS-ligaen", allClubs.find((club) => club.id === twoRound.rounds[1].opponent.id).tier === "obosligaen");
check("antall omganger følger pyramidens playoffRounds", twoRound.rounds.length === secondDivision.promotion.playoffRounds);

// ---------------------------------------------------------------------------
// 4. Avgjørelsen: sammenlagt → bortemål → straffer
//
// Hver vei må prøves. Bortemålsregelen er den lette å få feil vei rundt, siden
// «managerens bortemål» er målene i den kampen HAN spilte borte.
// ---------------------------------------------------------------------------
function playTie(playoff, legScores) {
  let state = playoff;
  for (const score of legScores) state = completePlayoffLeg(state, { score });
  return state;
}
const freshUp = () => createLeaguePlayoff({
  outcome: { movement: "promotion_playoff", tierId: "obosligaen", position: 3, seasonNumber: 1 },
  managerClub: managerIn("obosligaen"), allClubs, tiers, seed: "kval-avgjor"
});

// Hjemme først (utfordrer): kamp 1 hjemme, kamp 2 borte.
const wonOnAggregate = playTie(freshUp(), [{ for: 2, against: 0 }, { for: 0, against: 1 }]);
check("vinner sammenlagt", wonOnAggregate.status === "won");
check("avgjort på sammenlagt", wonOnAggregate.rounds[0].decidedBy === "sammenlagt");
check("sammenlagt er summert riktig", wonOnAggregate.rounds[0].aggregate.for === 2 && wonOnAggregate.rounds[0].aggregate.against === 1);

const lostOnAggregate = playTie(freshUp(), [{ for: 0, against: 1 }, { for: 1, against: 3 }]);
check("taper sammenlagt", lostOnAggregate.status === "lost");

// 1–1 hjemme, 1–1 borte: 2–2 sammenlagt. Manageren scoret 1 borte, motstanderen
// scoret 1 hos manageren. Fortsatt likt → straffer.
const toPenalties = playTie(freshUp(), [{ for: 1, against: 1 }, { for: 1, against: 1 }]);
check("helt likt går til straffer", toPenalties.rounds[0].decidedBy === "straffer", String(toPenalties.rounds[0].decidedBy));
check("straffer gir et utfall", ["won", "lost"].includes(toPenalties.status));
// Seedet, ikke tilfeldig: samme kamper skal gi samme utfall hver gang.
check("straffeutfallet er deterministisk", playTie(freshUp(), [{ for: 1, against: 1 }, { for: 1, against: 1 }]).status === toPenalties.status);

// 0–1 hjemme, 1–0 borte: 1–1 sammenlagt. Manageren har ett bortemål, motparten
// har ett mål hjemme hos manageren — likt, så straffer. Prøv i stedet 1–2
// hjemme og 2–1 borte: 3–3, manager 2 borte mot motpartens 2 hjemme … også likt.
// Bortemål må derfor prøves med ulik fordeling: 0–0 hjemme, 2–2 borte.
const awayGoalsWin = playTie(freshUp(), [{ for: 0, against: 0 }, { for: 2, against: 2 }]);
check("2–2 sammenlagt med ulik fordeling avgjøres på bortemål", awayGoalsWin.rounds[0].decidedBy === "bortemål", String(awayGoalsWin.rounds[0].decidedBy));
check("managerens bortemål teller riktig vei", awayGoalsWin.status === "won", JSON.stringify(awayGoalsWin.rounds[0].awayGoals));
// Og motsatt: 2–2 hjemme, 0–0 borte gir motparten to bortemål.
const awayGoalsLoss = playTie(freshUp(), [{ for: 2, against: 2 }, { for: 0, against: 0 }]);
check("motpartens bortemål teller også riktig vei", awayGoalsLoss.rounds[0].decidedBy === "bortemål" && awayGoalsLoss.status === "lost");

// ---------------------------------------------------------------------------
// 5. En tapt omgang stopper kvalifiseringen der og da
// ---------------------------------------------------------------------------
const stoppedEarly = playTie(twoRound, [{ for: 0, against: 2 }, { for: 0, against: 2 }]);
check("tapt avdelingsoppgjør avslutter kvalifiseringen", stoppedEarly.status === "lost");
check("andre omgang ble aldri spilt", stoppedEarly.rounds[1].legs.every((leg) => leg.status === "scheduled"));

const throughToBridge = playTie(twoRound, [{ for: 3, against: 0 }, { for: 0, against: 1 }]);
check("vunnet avdelingsoppgjør går videre", throughToBridge.status === "active");
check("kvalifiseringen står nå i andre omgang", throughToBridge.currentRoundIndex === 1);
check("neste kamp er mot OBOS-motparten", getCurrentPlayoffRound(throughToBridge).opponent.id === twoRound.rounds[1].opponent.id);

// ---------------------------------------------------------------------------
// 6. Utfallet betyr noe: nivået neste sesong
// ---------------------------------------------------------------------------
const upWon = resolveLeaguePlayoff(wonOnAggregate);
check("vunnet opprykkskvalifisering gir opprykk", upWon.movement === "promoted" && upWon.toTierId === "eliteserien");
const upLost = resolveLeaguePlayoff(lostOnAggregate);
check("tapt opprykkskvalifisering beholder nivået", upLost.movement === "stay" && upLost.toTierId === "obosligaen");

const downWon = resolveLeaguePlayoff(playTie(relegationPlayoff, [{ for: 1, against: 0 }, { for: 2, against: 0 }]));
check("vunnet nedrykkskvalifisering berger plassen", downWon.movement === "stay" && downWon.toTierId === "eliteserien");
const downLost = resolveLeaguePlayoff(playTie(relegationPlayoff, [{ for: 0, against: 2 }, { for: 0, against: 2 }]));
check("tapt nedrykkskvalifisering gir nedrykk", downLost.movement === "relegated" && downLost.toTierId === "obosligaen");
for (const resolution of [upWon, upLost, downWon, downLost]) {
  check("utfallet forklarer seg selv", Boolean(resolution.headline && resolution.reason && resolution.decidedBy));
}

// ---------------------------------------------------------------------------
// 7. Sesongen kan ikke rulle videre før kvalifiseringen er spilt
//
// Uten denne vakten ville en kvalifiseringsplass stille sluppet manageren forbi
// kampene han skulle spilt — nøyaktig det som var tilfellet før.
// ---------------------------------------------------------------------------
let season = createLeagueSeason({
  managerClub: managerIn("obosligaen"), opponents: opponentsFor(obos), tier: obos, seed: "kvaltest"
});
let round = 1;
while (season.status === "active") {
  season = completeLeagueRound(season, { score: { for: (1 + round) % 3, against: (2 + round) % 3 === 0 ? 2 : 0 } });
  round += 1;
}
const seasonOutcome = resolveLeagueOutcome(season);
check("den spilte sesongen endte faktisk på kvalifiseringsplass", seasonOutcome.movement === "promotion_playoff", `plass ${seasonOutcome.position}`);
check("kvalifiseringen er registrert som uspilt", isPlayoffPending(season) === true);
assert.throws(
  () => startNextLeagueSeason(season, { allClubs, tiers }),
  /Kvalifiseringen er ikke spilt/,
  "sesongen rullet videre uten at kvalifiseringen ble spilt"
);
checks += 1;

const realPlayoff = createLeaguePlayoff({
  outcome: { ...seasonOutcome, seasonNumber: season.seasonNumber },
  managerClub: season.clubs.find((club) => club.id === season.managerClubId),
  allClubs, tiers, seed: `${season.seed}-kval`
});
check("den spilte sesongen ga en ekte kvalifisering", Boolean(realPlayoff));

// Spill den, og se at nivået faktisk flytter seg.
const resolved = resolveLeaguePlayoff(playTie(realPlayoff, [{ for: 2, against: 0 }, { for: 1, against: 1 }]));
check("kvalifiseringen ble vunnet", resolved.won === true);
check("kvalifiseringen er ikke lenger uspilt", isPlayoffPending(season, resolved) === false);
const nextSeason = startNextLeagueSeason(season, { allClubs, tiers, playoffResolution: resolved });
check("neste sesong spilles i Eliteserien", nextSeason.competition.tierId === "eliteserien", nextSeason.competition.tierName);
check("neste sesong har 16 klubber", nextSeason.clubs.length === 16);
check("opprykket er notert på sesongen", nextSeason.previousOutcome?.viaPlayoff === true);
check("neste sesong har riktig antall runder", nextSeason.competition.rounds === roundsForClubCount(16));

// Og at et TAP holder manageren på nivået i stedet.
const lostResolution = resolveLeaguePlayoff(playTie(realPlayoff, [{ for: 0, against: 1 }, { for: 0, against: 1 }]));
const stayedSeason = startNextLeagueSeason(season, { allClubs, tiers, playoffResolution: lostResolution });
check("tapt kvalifisering holder manageren i OBOS-ligaen", stayedSeason.competition.tierId === "obosligaen");

// ---------------------------------------------------------------------------
// 8. Kampdag og UI får det de trenger
// ---------------------------------------------------------------------------
const matchdayOpponent = getPlayoffMatchdayOpponent(realPlayoff);
check("Kampdag får en motstander med bane og styrke", Boolean(matchdayOpponent.name && matchdayOpponent.ground && matchdayOpponent.strength));
check("Kampdag får hjemme/borte", ["home", "away"].includes(matchdayOpponent.homeAway));
check("kampen er merket som kvalifisering", matchdayOpponent.isPlayoff === true);
check("kamp-id-en er unik per omgang og kamp", matchdayOpponent.matchId.includes("kval"));
const described = describePlayoff(realPlayoff);
check("kvalifiseringen forklarer hva som står på spill", described.active && described.headline.length > 0 && described.detail.includes("bortemål"));
const finished = describePlayoff(playTie(realPlayoff, [{ for: 2, against: 0 }, { for: 1, against: 1 }]));
check("ferdig kvalifisering forklarer utfallet", finished.active === false && Boolean(finished.headline));

// Lagring: en kvalifisering skal overleve en omlasting, og en ødelagt en skal
// forkastes i stedet for å lastes halvveis.
check("lagret kvalifisering leses tilbake likt", JSON.stringify(normalizeLeaguePlayoff(JSON.parse(JSON.stringify(realPlayoff)))) === JSON.stringify(realPlayoff));
check("feil versjon forkastes", normalizeLeaguePlayoff({ ...realPlayoff, version: "gammel" }) === null);
check("kvalifisering uten omganger forkastes", normalizeLeaguePlayoff({ version: LEAGUE_PLAYOFF_VERSION, rounds: [] }) === null);
check("omgang uten to kamper forkastes", normalizeLeaguePlayoff({ version: LEAGUE_PLAYOFF_VERSION, rounds: [{ legs: [{}] }] }) === null);

// Motoren simulerer aldri managerens egen kamp — den tar imot resultatet.
// Kommentarene strippes først: motorens egen overskrift NEVNER Math.random og
// localStorage for å si at den ikke bruker dem, og en vakt som leser prosa i
// stedet for kode ville slått ut på nettopp den setningen (det gjorde den).
const engineSource = fs.readFileSync(new URL("../src/football-league-playoff.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("kvalifiseringsmotoren simulerer ikke kampen selv", !/Math\.random|simulateFixture/.test(engineSource));
check("kvalifiseringsmotoren er ren (ingen DOM/lagring/klokke)", !/document|localStorage|fetch\(|Date\.now/.test(engineSource));

// Og at app.js faktisk spiller kvalifiseringen i stedet for å hoppe over den.
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app.js henter kvalifiseringsmotstanderen til Kampdag", /getPlayoffMatchdayOpponent\(/.test(app));
check("app.js mater kampdagresultatet inn i kvalifiseringen", /completePlayoffLeg\(/.test(app));
check("app.js gir kvalifiseringsutfallet videre til neste sesong", /playoffResolution/.test(app));

console.log(JSON.stringify({
  ok: true, sjekker: checks,
  format: "to kamper sammenlagt · bortemål · straffer",
  omganger: { eliteserien: 1, obosligaen: 1, andredivisjon: secondDivision.promotion.playoffRounds },
  spiltEksempel: `${seasonOutcome.position}. plass i OBOS → kvalifisering mot ${realPlayoff.rounds[0].opponent.name} → ${resolved.headline}`
}, null, 2));
