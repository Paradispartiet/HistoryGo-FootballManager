import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CLUB_SQUAD_VERSION,
  clubAffiliationFor,
  hasVisitedClubGround,
  isSimulationReadyPlayer,
  listClubHeritagePlayers,
  listClubPoolPlayers,
  listPlayableClubPoolPlayers,
  playerAffiliatedWithClub,
  reconcileClubBaseSquadSave,
  resolveClubSquadAccess
} from "../src/football-club-squad.js";

const { clubs } = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
const { players } = JSON.parse(fs.readFileSync(new URL("../data/football_players.json", import.meta.url), "utf8"));
const unlockData = JSON.parse(fs.readFileSync(new URL("../data/football_unlocks.json", import.meta.url), "utf8"));
const placeUnlocks = Array.isArray(unlockData.placeUnlocks) ? unlockData.placeUnlocks : [];
const placeIds = new Set(placeUnlocks.map((place) => place.placeId));
const nationalPlaceIds = new Set(placeUnlocks.filter((place) => String(place.placeRole).includes("national")).map((place) => place.placeId));
const candidateIds = new Set(players
  .filter((player) => !(player.sourcePlaceIds || []).some((placeId) => nationalPlaceIds.has(placeId)))
  .map((player) => player.id));
const byId = new Map(players.map((player) => [player.id, player]));
const clubById = new Map(clubs.map((club) => [club.id, club]));
const REQUIRED = 15;

let checks = 0;
function check(name, condition, detail = "") {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
}

check("klubbtroppmotoren er v6", CLUB_SQUAD_VERSION.endsWith(".v6"), CLUB_SQUAD_VERSION);
check("alle spiller-id-er er unike", new Set(players.map((player) => player.id)).size === players.length);
check("alle klubb-id-er er unike", new Set(clubs.map((club) => club.id)).size === clubs.length);

const affiliationCount = players.reduce((sum, player) => sum + (player.clubAffiliations || []).length, 0);
check("katalogen har eksplisitte klubbtilknytninger", affiliationCount > 1000, String(affiliationCount));
for (const player of players) {
  const seen = new Set();
  for (const affiliation of player.clubAffiliations || []) {
    check(`${player.id}: kjent klubb`, clubById.has(affiliation.clubId), affiliation.clubId);
    check(`${player.id}: unik klubbtilknytning`, !seen.has(affiliation.clubId), affiliation.clubId);
    seen.add(affiliation.clubId);
    check(`${player.id}: relasjon`, Boolean(affiliation.relation));
    check(`${player.id}: kildegrad`, ["belagt", "utledet"].includes(affiliation.source), affiliation.source);
  }
}

const engineSource = fs.readFileSync(new URL("../src/football-club-squad.js", import.meta.url), "utf8");
const engineWithoutComments = engineSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("runtime utleder ikke medlemskap fra sourcePlaceIds", !/sourcePlaceIds/.test(engineWithoutComments));
check("motoren er ren", !/\bdocument\b|localStorage|fetch\(|Date\.now|Math\.random/.test(engineWithoutComments));

for (const club of clubs) {
  const documented = listClubPoolPlayers({ clubId: club.id, players });
  const playable = listPlayableClubPoolPlayers({ clubId: club.id, players });
  check(`${club.name}: dokumentert poolstørrelse`, Number(club.playerPoolSize || 0) === documented.length,
    `${club.playerPoolSize}/${documented.length}`);
  check(`${club.name}: spillbar poolstørrelse`, Number(club.playablePlayerPoolSize || 0) === playable.length,
    `${club.playablePlayerPoolSize}/${playable.length}`);
  check(`${club.name}: status følger spillbar pool`,
    club.playerPoolStatus === (playable.length >= REQUIRED ? "ready" : "pending"), `${club.playerPoolStatus}/${playable.length}`);
  check(`${club.name}: eksplisitt retur`, documented.every((player) => playerAffiliatedWithClub(player, club.id)));
  check(`${club.name}: spillbar delmengde`, playable.every(isSimulationReadyPlayer) && playable.length <= documented.length);
}

for (const club of clubs.filter((entry) => entry.homePlaceId)) {
  const explicitIds = new Set(listClubPoolPlayers({ clubId: club.id, players }).map((player) => player.id));
  const legacy = listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players });
  check(`${club.name}: legacy-status er delmengde`, legacy.every((player) => explicitIds.has(player.id)));
}

const ready = clubs.filter((club) => club.playerPoolStatus === "ready");
const pending = clubs.filter((club) => club.playerPoolStatus === "pending");
check("det finnes ready-klubber", ready.length > 0, String(ready.length));
check("det finnes pending-klubber", pending.length > 0, String(pending.length));

for (const club of ready) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
  const documented = listClubPoolPlayers({ clubId: club.id, players });
  const playable = listPlayableClubPoolPlayers({ clubId: club.id, players });
  const playableIds = new Set(playable.map((player) => player.id));
  check(`${club.name}: kald start er base`, access.mode === "base", access.mode);
  check(`${club.name}: 15 i grunntropp`, access.baseSquad.length === REQUIRED, String(access.baseSquad.length));
  check(`${club.name}: bare egne spillbare profiler`, access.baseSquad.every((id) => playableIds.has(id)));
  check(`${club.name}: dokumentert antall`, access.documentedCount === documented.length);
  check(`${club.name}: spillbart antall`, access.poolSize === playable.length);
  check(`${club.name}: arkivantall`, access.unprofiledCount === documented.length - playable.length);
  check(`${club.name}: låst antall`, access.lockedCount === playable.length - REQUIRED);
  check(`${club.name}: minst én keeper`, access.baseSquad.some((id) =>
    [...(byId.get(id)?.naturalPositions || []), ...(byId.get(id)?.usablePositions || [])].includes("GK")));
}

for (const club of pending) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
  check(`${club.name}: pending er unavailable`, access.mode === "unavailable", access.mode);
  check(`${club.name}: ingen global fallback`, access.baseSquad.length === 0);
}

for (const club of ready.filter((entry) => entry.homePlaceId)) {
  check(`${club.name}: stadion finnes`, placeIds.has(club.homePlaceId), club.homePlaceId);
  check(`${club.name}: stadion er ikke nasjonalarena`, !nationalPlaceIds.has(club.homePlaceId), club.homePlaceId);
  check(`${club.name}: ubesøkt`, !hasVisitedClubGround({ homePlaceId: club.homePlaceId, unlockedPlaceIds: [] }));
  check(`${club.name}: besøkt`, hasVisitedClubGround({ homePlaceId: club.homePlaceId, unlockedPlaceIds: [club.homePlaceId] }));
  const full = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [club.homePlaceId], candidateIds, squadSize: REQUIRED });
  const documented = listClubPoolPlayers({ clubId: club.id, players });
  const playable = listPlayableClubPoolPlayers({ clubId: club.id, players });
  check(`${club.name}: heritage-modus`, full.mode === "heritage", full.mode);
  check(`${club.name}: bare spillbare profiler åpnes`, full.heritage.length === playable.length);
  check(`${club.name}: historikkantall bevares`, full.documentedCount === documented.length);
  check(`${club.name}: arkivposter er ikke valgbar pool`, full.clubPoolIds.length === playable.length);
  check(`${club.name}: ingen basetropp ved full tilgang`, full.baseSquad.length === 0);
}

const playableSeed = players.filter(isSimulationReadyPlayer).slice(0, REQUIRED);
const syntheticClub = { id: "synthetic_pool_only", name: "Pool FK", ground: "Ukjent bane" };
const syntheticPlayers = playableSeed.map((player) => ({
  ...player,
  clubAffiliations: [{ clubId: syntheticClub.id, relation: "played_for", status: "squad_profile", source: "utledet" }]
}));
const synthetic = resolveClubSquadAccess({ club: syntheticClub, players: syntheticPlayers, unlockedPlaceIds: [], squadSize: REQUIRED });
check("spillbar pool kan finnes uten stadion", synthetic.mode === "base" && synthetic.baseSquad.length === REQUIRED);

const viking = clubById.get("viking");
const vikingPool = listPlayableClubPoolPlayers({ clubId: viking.id, players });
const vikingIds = new Set(vikingPool.map((player) => player.id));
const vikingAccess = resolveClubSquadAccess({ club: viking, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
assert.deepEqual(vikingAccess.baseSquad,
  resolveClubSquadAccess({ club: viking, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED }).baseSquad,
  "Viking-grunntroppen er ikke deterministisk");
checks += 1;
check("Viking-grunntroppen er bare spillbare Viking-profiler", vikingAccess.baseSquad.every((id) => vikingIds.has(id)));

const foreignPlayer = players.find((player) => !vikingIds.has(player.id));
const oldVikingSave = {
  enabled: true,
  source: "auto_squad",
  playerIds: [foreignPlayer.id, ...vikingAccess.baseSquad.slice(1)],
  createdAt: "2026-08-01T00:00:00.000Z"
};
const repaired = reconcileClubBaseSquadSave({ localStart: oldVikingSave, access: vikingAccess });
check("gammel save repareres", repaired.changed && repaired.reason === "foreign_players", repaired.reason);
check("reparert save er spillbar Viking", repaired.localStart.playerIds.every((id) => vikingIds.has(id)));
check("save-reparasjon er idempotent", !reconcileClubBaseSquadSave({ localStart: repaired.localStart, access: vikingAccess }).changed);

const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app importerer save-reparasjonen", /reconcileClubBaseSquadSave/.test(app));
check("localStart lagrer clubId", /clubId: typeof base\.clubId/.test(app));
check("localStart lagrer poolVersion", /poolVersion: typeof base\.poolVersion/.test(app));

const docs = fs.readFileSync(new URL("../docs/klubbvalg.md", import.meta.url), "utf8");
const start = docs.indexOf("| Klubb | Bane | Historiske spillere |");
check("arvetabellen finnes", start >= 0);
const lines = docs.slice(start).split("\n");
const end = lines.findIndex((line, index) => index > 0 && !line.startsWith("|"));
const rows = [...lines.slice(0, end === -1 ? lines.length : end).join("\n")
  .matchAll(/^\| ([^|]+?) \| ([^|]+?) \| (\d+) \|$/gm)]
  .map((match) => ({ clubs: match[1].split(",").map((value) => value.trim()), count: Number(match[3]) }));
const documentedByName = new Map(clubs.filter((club) => club.homePlaceId).map((club) =>
  [club.name, listClubPoolPlayers({ clubId: club.id, players }).length]));
for (const row of rows.filter((entry) => entry.count > 0)) {
  for (const name of row.clubs) {
    check(`docs: ${name} finnes`, documentedByName.has(name), name);
    if (documentedByName.has(name)) check(`docs: ${name} historikkantall`, documentedByName.get(name) === row.count,
      `${documentedByName.get(name)}/${row.count}`);
  }
}

const pors = clubById.get("pors");
const porsDocumented = listClubPoolPlayers({ clubId: "pors", players });
const porsPlayable = listPlayableClubPoolPlayers({ clubId: "pors", players });
check("Pors 63 dokumenterte", porsDocumented.length === 63, String(porsDocumented.length));
check("Pors 16 spillbare", porsPlayable.length === 16, String(porsPlayable.length));
check("Pors 47 historikkposter", porsDocumented.length - porsPlayable.length === 47);
const porsFull = resolveClubSquadAccess({ club: pors, players, unlockedPlaceIds: [pors.homePlaceId], candidateIds, squadSize: REQUIRED });
check("Pors åpner bare 16", porsFull.clubPoolIds.length === 16 && porsFull.heritage.length === 16);

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  spillere: players.length,
  klubbtilknytninger: affiliationCount,
  readyKlubber: ready.length,
  pendingKlubber: pending.length,
  porsDokumentert: porsDocumented.length,
  porsSpillbar: porsPlayable.length,
  porsArkiv: porsDocumented.length - porsPlayable.length
}, null, 2));
