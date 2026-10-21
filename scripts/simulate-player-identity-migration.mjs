import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CANONICAL_BOATENG_ID as canonical,
  LEGACY_BOATENG_ID as legacy,
  canonicalPlayerId,
  normalizePlayablePlayerCatalog,
  migratePlayerIdReferences,
  migrateSavedPlayerIdentityStorage
} from "../src/football-player-identity.js";

const catalogue = JSON.parse(readFileSync(new URL("../data/football_players.json", import.meta.url))).players;
// Protect the source-backed nationality in BOTH historic raw IDs, not just runtime.
for (const id of [legacy, canonical]) {
  const entries = catalogue.filter(player => player.id === id);
  assert.equal(entries.length, 1, id + " should have exactly one raw identity record");
  assert.equal(entries[0].nationality, "Ghana",
    id + ": Colorado Rapids citizenship must be reflected in canonical player data");
  assert.ok(entries[0].sourcePlaceIds.includes("marienlyst_stadion"),
    id + ": only the existing Strømsgodset heritage is allowed");
}
const playable = normalizePlayablePlayerCatalog(catalogue);
assert.equal(playable.filter((player) => player.id === canonical).length, 1);
assert.equal(playable.some((player) => player.id === legacy), false);
assert.equal(playable.find((player) => player.id === canonical).nationality, "Ghana");
assert.equal(playable.length, catalogue.length - 1, "one redundant historic record is hidden from gameplay");
assert.equal(canonicalPlayerId(legacy), canonical);
assert.equal(canonicalPlayerId("nana_boateng_other"), "nana_boateng_other");

const unlocks = JSON.parse(readFileSync(new URL("../data/football_unlocks.json", import.meta.url))).placeUnlocks;
const marienlyst = unlocks.find((entry) => entry.placeId === "marienlyst_stadion");
assert.equal(marienlyst.unlocks.filter((entry) => entry.targetId === canonical).length, 1);
assert.equal(marienlyst.unlocks.some((entry) => entry.targetId === legacy), false);

const oldMerits = {
  squadPlayerIds: [legacy, canonical, "other"],
  recruitedPlayerIds: [legacy, canonical],
  localStart: { enabled: true, playerIds: [legacy] },
  roleFamiliarity: { [legacy + "::box_to_box"]: 44, [canonical + "::box_to_box"]: 62 },
  playerPartnerships: {
    ["team_mate::" + legacy]: 5,
    [canonical + "::team_mate"]: 7,
    [legacy + "::" + canonical]: 8
  },
  weaknessProgress: { [legacy + "::passing"]: 82, [canonical + "::passing"]: 20 }
};
const oldStats = { rows: [
  { playerId: legacy, name: "Nana Boateng", appearances: 2, minutes: 150, goals: 1, assists: 0, points: 1 },
  { playerId: canonical, name: "Bismark Adjei-Boateng", appearances: 4, minutes: 300, goals: 1, assists: 2, points: 3 }
], matchIds: ["game1", "game2"] };
const oldCondition = [
  { playerId: legacy, name: "Nana Boateng", load: 35, matchesPlayed: 2, minutesPlayed: 140, injury: { weeksOut: 2 } },
  { playerId: canonical, name: "Bismark Adjei-Boateng", load: 15, matchesPlayed: 4, minutesPlayed: 300, injury: null }
];
const oldModeEnvelope = {
  version: "mode-sessions.v1",
  activeMode: "league",
  sessions: {
    league: { teamMerits: oldMerits, lineup: { CM1: { playerId: legacy }, CM2: { playerId: canonical } }, playerSeasonStats: oldStats, playerCondition: oldCondition },
    scenario: { teamMerits: { squadPlayerIds: [legacy] }, lineup: { CM1: { playerId: legacy } } },
    training: null, national: null
  }
};
const migrated = migratePlayerIdReferences(oldModeEnvelope);
const league = migrated.sessions.league;
assert.deepEqual(league.teamMerits.squadPlayerIds, [canonical, "other"]);
assert.deepEqual(league.teamMerits.recruitedPlayerIds, [canonical]);
assert.deepEqual(league.teamMerits.localStart.playerIds, [canonical]);
assert.equal(league.teamMerits.roleFamiliarity[canonical + "::box_to_box"], 62);
assert.equal(league.teamMerits.playerPartnerships[canonical + "::team_mate"], 7);
assert.equal(league.teamMerits.playerPartnerships[canonical + "::" + canonical], undefined);
assert.equal(league.teamMerits.weaknessProgress[canonical + "::passing"], 82);
assert.equal(league.playerSeasonStats.rows.length, 1);
assert.deepEqual(
  (({ appearances, minutes, goals, assists, points }) => ({ appearances, minutes, goals, assists, points }))(league.playerSeasonStats.rows[0]),
  { appearances: 6, minutes: 450, goals: 2, assists: 2, points: 4 }
);
assert.equal(league.playerCondition.length, 1);
assert.equal(league.playerCondition[0].load, 35);
assert.equal(league.playerCondition[0].injury.weeksOut, 2);
assert.deepEqual(league.lineup, { CM1: { playerId: canonical }, CM2: { playerId: null } });
assert.equal(migrated.sessions.scenario.lineup.CM1.playerId, canonical);
assert.deepEqual(migratePlayerIdReferences(migrated), migrated, "migration is idempotent");

function makeStorage(entries) {
  const map = new Map(Object.entries(entries));
  return {
    get length() { return map.size; },
    key(index) { return [...map.keys()][index] || null; },
    getItem(key) { return map.get(key) ?? null; },
    setItem(key, value) { map.set(key, value); }
  };
}
const foreignHistory = JSON.stringify({ note: legacy });
const storage = makeStorage({
  "hgfm.modeSessions.v1": JSON.stringify(oldModeEnvelope),
  "hgfm.teamMerits.v1": JSON.stringify(oldMerits),
  "hgfm.playerSeasonStats.v1": JSON.stringify(oldStats),
  "visited_places": foreignHistory,
  "hgfm.bad-json": "{not json"
});
const first = migrateSavedPlayerIdentityStorage(storage);
assert.deepEqual(first.changedKeys.sort(), ["hgfm.modeSessions.v1", "hgfm.playerSeasonStats.v1", "hgfm.teamMerits.v1"].sort());
assert.equal(storage.getItem("visited_places"), foreignHistory, "History Go storage remains untouched");
assert.deepEqual(JSON.parse(storage.getItem("hgfm.teamMerits.v1")).squadPlayerIds, [canonical, "other"]);
assert.deepEqual(migrateSavedPlayerIdentityStorage(storage).changedKeys, []);
assert.equal(storage.getItem("hgfm.bad-json"), "{not json");

console.log("✓ Nana/Bismark is one playable catalogue entry and unlock");
console.log("✓ Historic league/scenario saves retain lineup, role growth, partnerships, injuries and stats");
console.log("✓ Manager storage migration is idempotent and never rewrites History Go progress");
