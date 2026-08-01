import assert from "node:assert/strict";
import { createLeagueSeason, createLeagueTable, completeLeagueRound, getNextLeagueOpponent, startNextLeagueSeason, normalizeLeagueSeason, LEAGUE_OPPONENT_PROFILES } from "../src/football-league-season.js";
import { getHistoricalOpponentProfile } from "../src/football-historical-opponent-profiles.js";
import fs from "node:fs";

const managerClub = { id: "manager-fk", name: "Manager FK", ground: "Klubbankeret", strength: 75, form: 55, tacticalIdentity: "managerens valg" };
const fresh = () => createLeagueSeason({ managerClub, seed: "qa-seed" });
const season = fresh();
assert.equal(season.clubs.length, 8); assert.equal(season.fixtures.length, 14);
assert.equal(season.fixtures.flatMap((round) => round.matches).length, 56);
for (const round of season.fixtures) {
  assert.equal(round.matches.length, 4);
  assert.equal(new Set(round.matches.flatMap((match) => [match.homeClubId, match.awayClubId])).size, 8);
  assert.ok(round.matches.every((match) => match.homeClubId !== match.awayClubId));
}
const matches = season.fixtures.flatMap((round) => round.matches);
assert.equal(new Set(matches.map((match) => match.id)).size, 56);
assert.deepEqual(fresh().fixtures, season.fixtures);
const pairs = new Map();
for (const match of matches) {
  const key = [match.homeClubId, match.awayClubId].sort().join(":");
  pairs.set(key, [...(pairs.get(key) || []), `${match.homeClubId}>${match.awayClubId}`]);
}
assert.equal(pairs.size, 28);
for (const meetings of pairs.values()) assert.equal(new Set(meetings).size, 2);

const firstOpponent = getNextLeagueOpponent(season);
let played = completeLeagueRound(season, { score: { for: 2, against: 1 } });
assert.equal(played.currentRound, 2); assert.equal(played.fixtures[0].status, "completed"); assert.equal(played.fixtures[0].matches.filter((match) => match.status === "completed").length, 4);
assert.equal(played.completedMatchIds.length, 4); assert.equal(completeLeagueRound(season, { score: { for: 2, against: 1 } }).fixtures[0].matches.length, 4);
assert.notEqual(getNextLeagueOpponent(played).matchId, firstOpponent.matchId);
let table = createLeagueTable(played); assert.equal(table.length, 8); assert.equal(table.reduce((sum, row) => sum + row.played, 0), 8);
assert.ok(table.every((row) => row.goalDifference === row.goalsFor - row.goalsAgainst));
assert.equal(table.reduce((sum, row) => sum + row.won, 0), table.reduce((sum, row) => sum + row.lost, 0));
assert.deepEqual(createLeagueTable(played), table);
for (let round = 2; round <= 14; round++) played = completeLeagueRound(played, { score: { for: round % 3, against: (round + 1) % 3 } });
assert.equal(played.status, "completed"); assert.equal(played.currentRound, 14); assert.equal(played.completedMatchIds.length, 56); assert.equal(getNextLeagueOpponent(played), null);
assert.deepEqual(normalizeLeagueSeason(JSON.parse(JSON.stringify(played))), played);
const next = startNextLeagueSeason(played); assert.equal(next.status, "active"); assert.equal(next.currentRound, 1); assert.equal(createLeagueTable(next).every((row) => row.played === 0), true); assert.equal(next.managerClubId, played.managerClubId);
assert.deepEqual(next.clubs, played.clubs); assert.notDeepEqual(next.fixtures, played.fixtures);

// ---------------------------------------------------------------------------
// Ligaen skal være fotball, ikke aritmetikk
//
// Hver klubb spiller en historisk taktisk skole. Dette steget måler at en HEL
// sesong faktisk byr på ulike motstandere — det er den målingen som mangler
// når feilen er «alt ser riktig ut, men alle er like».
//
// Feilen den ville fanget: oppslaget i app.js lette etter klubb-id-en blant de
// fem GENERISKE profilene (`high_press_opponent` …), der en klubb-id aldri kan
// finnes. Fallbacken slo derfor inn hver eneste gang, og alle fjorten runder
// ble spilt mot samme profil med byttet navnelapp. Ingen feilmelding, ingen
// rød vakt — bare en sesong uten variasjon.
// ---------------------------------------------------------------------------
for (const club of LEAGUE_OPPONENT_PROFILES) {
  assert.ok(club.archetypeId, `${club.name} mangler archetypeId`);
  assert.ok(getHistoricalOpponentProfile(club.archetypeId), `${club.name} peker på en arketype som ikke finnes: ${club.archetypeId}`);
}
assert.equal(
  new Set(LEAGUE_OPPONENT_PROFILES.map((club) => club.archetypeId)).size,
  LEAGUE_OPPONENT_PROFILES.length,
  "to ligaklubber deler taktisk skole — da mister sesongen variasjon"
);

// Gå gjennom en hel sesong og se hvem du faktisk møter.
const schools = new Map();
const styleTokens = new Set();
let walk = fresh();
for (let round = 1; round <= 14; round += 1) {
  const opponent = getNextLeagueOpponent(walk);
  assert.ok(opponent, `runde ${round} har ingen motstander`);
  const profile = getHistoricalOpponentProfile(opponent.archetypeId);
  assert.ok(profile, `runde ${round}: ${opponent.name} har ingen arketypeprofil`);
  schools.set(profile.id, (schools.get(profile.id) || 0) + 1);
  profile.matchupStyles.forEach((token) => styleTokens.add(token));
  walk = completeLeagueRound(walk, { score: { for: 1, against: 1 } });
}
assert.equal(schools.size, 7, `sesongen bød på ${schools.size} ulike taktiske skoler, ikke 7`);
for (const [id, count] of schools) assert.equal(count, 2, `${id} møtes ${count} ganger, ikke to (hjemme + borte)`);
assert.ok(styleTokens.size >= 8, `bare ${styleTokens.size} ulike spillestil-tokens i sesongen`);

// Og at app.js faktisk slår opp arketypen — ikke klubb-id-en.
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
assert.ok(
  /getHistoricalOpponentProfile\(opponent\.archetypeId\)/.test(app),
  "app.js slår ikke opp ligamotstanderens arketype"
);
assert.ok(
  !/OPPONENT_PROFILES\.find\(\(profile\) => profile\.id === opponent\.id\)/.test(app),
  "app.js leter fortsatt etter klubb-id blant de generiske profilene — den kan aldri treffe"
);

console.log(JSON.stringify({
  ok: true, clubs: 8, rounds: 14, matches: 56, completed: played.completedMatchIds.length,
  taktiskeSkolerPerSesong: schools.size, spillestilTokens: styleTokens.size
}, null, 2));
