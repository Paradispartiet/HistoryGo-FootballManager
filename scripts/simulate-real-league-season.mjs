import assert from "node:assert/strict";
import { createLeagueSeason, createLeagueTable, completeLeagueRound, getNextLeagueOpponent, startNextLeagueSeason, normalizeLeagueSeason } from "../src/football-league-season.js";

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
console.log(JSON.stringify({ ok: true, clubs: 8, rounds: 14, matches: 56, completed: played.completedMatchIds.length }, null, 2));
