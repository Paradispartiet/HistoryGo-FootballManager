import assert from "node:assert/strict";
import fs from "node:fs";
import {
  isSimulationReadyPlayer,
  listClubPoolPlayers,
  listPlayableClubPoolPlayers,
  resolveClubSquadAccess
} from "../src/football-club-squad.js";

const { clubs } = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
const { players } = JSON.parse(fs.readFileSync(new URL("../data/football_players.json", import.meta.url), "utf8"));
const unlockData = JSON.parse(fs.readFileSync(new URL("../data/football_unlocks.json", import.meta.url), "utf8"));
const pors = clubs.find((club) => club.id === "pors");
assert.ok(pors, "Pors mangler i klubbkatalogen");
assert.equal(pors.homePlaceId, "pors_stadion");

const documented = listClubPoolPlayers({ clubId: "pors", players });
const playable = listPlayableClubPoolPlayers({ clubId: "pors", players });
const heritageOnly = documented.filter((player) => !isSimulationReadyPlayer(player));
assert.equal(documented.length, 63, "Pors skal bevare 63 dokumenterte klubbprofiler");
assert.equal(playable.length, 16, "Pors skal ha 16 profiler med dokumentert posisjon");
assert.equal(heritageOnly.length, 47, "Pors skal ha 47 historikkprofiler uten dokumentert posisjon");
assert.equal(Number(pors.playerPoolSize), 63);
assert.equal(Number(pors.playablePlayerPoolSize), 16);
assert.equal(pors.playerPoolStatus, "ready");

const place = unlockData.placeUnlocks.find((entry) => entry.placeId === "pors_stadion");
assert.ok(place, "pors_stadion mangler i unlock-katalogen");
const unlockIds = place.unlocks
  .filter((entry) => entry.type === "player_candidate")
  .map((entry) => entry.targetId)
  .sort();
const playableIds = playable.map((player) => player.id).sort();
assert.deepEqual(unlockIds, playableIds, "Pors Stadion skal bare åpne spillbare Pors-profiler");

const cold = resolveClubSquadAccess({
  club: pors,
  players,
  unlockedPlaceIds: [],
  candidateIds: new Set(playableIds),
  squadSize: 15
});
assert.equal(cold.mode, "base");
assert.equal(cold.baseSquad.length, 15);
assert.equal(cold.documentedCount, 63);
assert.equal(cold.poolSize, 16);
assert.equal(cold.unprofiledCount, 47);
assert.ok(cold.baseSquad.every((id) => playableIds.includes(id)));

const full = resolveClubSquadAccess({
  club: pors,
  players,
  unlockedPlaceIds: ["pors_stadion"],
  candidateIds: new Set(playableIds),
  squadSize: 15
});
assert.equal(full.mode, "heritage");
assert.equal(full.heritage.length, 16);
assert.equal(full.documentedCount, 63);
assert.equal(full.unprofiledCount, 47);
assert.ok(full.heritage.every((entry) => entry.simulationReady));

const crossLinkedIds = [
  "einar_rossbach",
  "fredrik_nordkvelle",
  "erik_pedersen",
  "tor_arne_sannerholt",
  "christer_fjellstad"
];
for (const id of crossLinkedIds) {
  const player = players.find((entry) => entry.id === id);
  assert.ok(player, `${id}: canonical profil mangler`);
  assert.ok(player.clubAffiliations?.some((entry) => entry.clubId === "pors"), `${id}: Pors-krysskobling mangler`);
  assert.ok(!(player.sourcePlaceIds || []).includes("pors_stadion"), `${id}: eldre sourcePlaceIds skal ikke omskrives`);
}

console.log(JSON.stringify({
  ok: true,
  clubId: "pors",
  documented: documented.length,
  playable: playable.length,
  heritageOnly: heritageOnly.length,
  stadiumUnlocks: unlockIds.length,
  baseSquad: cold.baseSquad.length,
  fullPool: full.heritage.length
}, null, 2));
