#!/usr/bin/env node
import assert from "node:assert/strict";
import { createSeasonSceneModel } from "../src/ui/manager-season-presentation.js";

const clubs = [
  { id: "hg", name: "HG FK", isManager: true, ground: "Historien stadion" },
  { id: "a", name: "Alpha", ground: "Alpha stadion" },
  { id: "b", name: "Beta", ground: "Beta stadion" },
  { id: "c", name: "Gamma", ground: "Gamma stadion" },
  { id: "d", name: "Delta", ground: "Delta stadion" },
  { id: "e", name: "Epsilon", ground: "Epsilon stadion" }
];

const season = {
  status: "active",
  seasonNumber: 2,
  managerClubId: "hg",
  currentRound: 4,
  competition: { tierName: "HG Liga", rounds: 10 },
  clubs,
  fixtures: [
    { round: 1, matches: [{ id: "r1", round: 1, homeClubId: "hg", awayClubId: "a", status: "completed", result: { homeGoals: 2, awayGoals: 0 } }] },
    { round: 2, matches: [{ id: "r2", round: 2, homeClubId: "b", awayClubId: "hg", status: "completed", result: { homeGoals: 1, awayGoals: 1 } }] },
    { round: 3, matches: [{ id: "r3", round: 3, homeClubId: "hg", awayClubId: "c", status: "completed", result: { homeGoals: 0, awayGoals: 1 } }] },
    { round: 4, matches: [{ id: "r4", round: 4, homeClubId: "d", awayClubId: "hg", status: "scheduled", result: null }] },
    { round: 5, matches: [{ id: "r5", round: 5, homeClubId: "hg", awayClubId: "e", status: "scheduled", result: null }] }
  ]
};

const table = [
  { clubId: "a", club: "Alpha", position: 1, played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 8, goalsAgainst: 2, goalDifference: 6, points: 9 },
  { clubId: "b", club: "Beta", position: 2, played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 6, goalsAgainst: 3, goalDifference: 3, points: 7 },
  { clubId: "c", club: "Gamma", position: 3, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 6 },
  { clubId: "d", club: "Delta", position: 4, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 4 },
  { clubId: "hg", club: "HG FK", isManager: true, position: 5, played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 4 },
  { clubId: "e", club: "Epsilon", position: 6, played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 1, goalsAgainst: 8, goalDifference: -7, points: 0 }
];

const model = createSeasonSceneModel({
  season,
  table,
  nextMatch: { name: "Delta", round: 4, homeAway: "away", ground: "Delta stadion", matchId: "r4" },
  boardExpectation: "Øvre halvdel"
});

assert.equal(model.state, "active");
assert.equal(model.statusLabel, "Serierunde 4 av 10");
assert.equal(model.managerRow.club, "HG FK");
assert.equal(model.goalDifferenceLabel, "+1");
assert.deepEqual(model.form, ["V", "U", "T"]);
assert.equal(model.nextMatch.opponent, "Delta");
assert.equal(model.nextMatch.venue, "Borte");
assert.equal(model.recent[0].opponent, "Gamma");
assert.equal(model.recent[0].result.outcome, "loss");
assert.equal(model.upcoming[0].opponent, "Delta");
assert.equal(model.upcoming[1].opponent, "Epsilon");
assert.ok(model.compactTable.some((row) => row.isManager), "managerklubben må alltid være i kompaktabellen");
assert.ok(model.compactTable.length <= 6, "kompaktabellen skal ikke bli en ny full tabell");

const preseason = createSeasonSceneModel({ boardExpectation: "Bygg klubben" });
assert.equal(preseason.state, "preseason");
assert.equal(preseason.nextMatch, null);
assert.equal(preseason.formLabel, "Ingen form ennå");

const completed = createSeasonSceneModel({ season: { ...season, status: "completed" }, table });
assert.equal(completed.state, "completed");
assert.equal(completed.statusLabel, "Sesongen er ferdigspilt");

console.log("Manager Season Scene v1: 18/18 sjekker bestått.");
