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
const brattvag = clubs.find((club) => club.id === "brattvag");
assert.ok(brattvag, "Brattvåg mangler i klubbkatalogen");
assert.equal(brattvag.homePlaceId, "brattvag_stadion");

const documented = listClubPoolPlayers({ clubId: "brattvag", players });
const playable = listPlayableClubPoolPlayers({ clubId: "brattvag", players });
const heritageOnly = documented.filter((player) => !isSimulationReadyPlayer(player));
assert.equal(documented.length, 81, "Brattvåg skal bevare 81 dokumenterte klubbprofiler");
assert.equal(playable.length, 18, "Brattvåg skal ha 18 profiler med dokumentert posisjon");
assert.equal(heritageOnly.length, 63, "Brattvåg skal ha 63 historikkprofiler uten dokumentert posisjon");
assert.equal(Number(brattvag.playerPoolSize), 81);
assert.equal(Number(brattvag.playablePlayerPoolSize), 18);
assert.equal(brattvag.playerPoolStatus, "ready");

const place = unlockData.placeUnlocks.find((entry) => entry.placeId === "brattvag_stadion");
assert.ok(place, "brattvag_stadion mangler i unlock-katalogen");
const unlockIds = place.unlocks
  .filter((entry) => entry.type === "player_candidate")
  .map((entry) => entry.targetId)
  .sort();
const playableIds = playable.map((player) => player.id).sort();
assert.deepEqual(unlockIds, playableIds, "Brattvåg stadion skal bare åpne spillbare Brattvåg-profiler");

// Kampantallet er den eneste ekstra opplysningen kilden har utover Pors', og
// den er nettopp den som ikke får bli noe. Ingen ny Brattvåg-profil skal bære
// en ferdighet, en arketype, en rollepreferanse eller en taktisk preferanse:
// alt av det ville vært utledet av «han spilte mange kamper».
const nyeEksklusive = players.filter((player) => (player.sourcePlaceIds || []).includes("brattvag_stadion"));
assert.equal(nyeEksklusive.length, 79, "79 nye canonical Brattvåg-profiler");
for (const player of nyeEksklusive) {
  assert.equal((player.strengths || []).length, 0, `${player.id}: kampantall er ikke en ferdighet`);
  assert.equal((player.archetypeIds || []).length, 0, `${player.id}: ingen arketype er kildebelagt`);
  assert.equal((player.preferredRoles || []).length, 0, `${player.id}: ingen rollepreferanse er kildebelagt`);
  assert.equal((player.likesTactics || []).length, 0, `${player.id}: ingen taktisk preferanse er kildebelagt`);
  assert.equal(player.classSource, "utledet");
  assert.equal(player.eraSource, "utledet", `${player.id}: kilden har ingen årstall`);
}

// De to krysskoblingene. Begge er navngitte påstander, og begge beholder sin
// egen sourcePlaceId — medlemskapet materialiseres i clubAffiliations, slik at
// den frosne P1-nevneren står urørt.
const krysskoblet = [
  ["sivert_solli", "extra_arena"],
  ["ulrik_valderhaug_syversen", "color_line_stadion"]
];
for (const [id, egenBane] of krysskoblet) {
  const player = players.find((entry) => entry.id === id);
  assert.ok(player, `${id}: canonical profil mangler`);
  assert.ok(player.clubAffiliations?.some((entry) => entry.clubId === "brattvag"), `${id}: Brattvåg-krysskobling mangler`);
  assert.ok((player.sourcePlaceIds || []).includes(egenBane), `${id}: egen arv skal stå`);
  assert.ok(!(player.sourcePlaceIds || []).includes("brattvag_stadion"), `${id}: eldre sourcePlaceIds skal ikke omskrives`);
}

const cold = resolveClubSquadAccess({
  club: brattvag,
  players,
  unlockedPlaceIds: [],
  candidateIds: new Set(playableIds),
  squadSize: 15
});
assert.equal(cold.mode, "base");
assert.equal(cold.baseSquad.length, 15);
assert.equal(cold.documentedCount, 81);
assert.equal(cold.poolSize, 18);
assert.equal(cold.unprofiledCount, 63);
assert.ok(cold.baseSquad.every((id) => playableIds.includes(id)));

const full = resolveClubSquadAccess({
  club: brattvag,
  players,
  unlockedPlaceIds: ["brattvag_stadion"],
  candidateIds: new Set(playableIds),
  squadSize: 15
});
assert.equal(full.mode, "heritage");
assert.equal(full.heritage.length, 18);
assert.equal(full.documentedCount, 81);
assert.equal(full.unprofiledCount, 63);
assert.ok(full.heritage.every((entry) => entry.simulationReady));

console.log(JSON.stringify({
  ok: true,
  clubId: "brattvag",
  documented: documented.length,
  playable: playable.length,
  heritageOnly: heritageOnly.length,
  nyeProfiler: nyeEksklusive.length,
  krysskoblet: krysskoblet.length,
  stadiumUnlocks: unlockIds.length,
  baseSquad: cold.baseSquad.length,
  fullPool: full.heritage.length
}, null, 2));
