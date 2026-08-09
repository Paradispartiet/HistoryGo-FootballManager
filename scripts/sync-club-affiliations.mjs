import assert from "node:assert/strict";
import fs from "node:fs";

const writeMode = process.argv.includes("--write");
const playersUrl = new URL("../data/football_players.json", import.meta.url);
const clubsUrl = new URL("../data/football_clubs.json", import.meta.url);
const playerData = JSON.parse(fs.readFileSync(playersUrl, "utf8"));
const clubData = JSON.parse(fs.readFileSync(clubsUrl, "utf8"));
const players = Array.isArray(playerData.players) ? playerData.players : [];
const clubs = Array.isArray(clubData.clubs) ? clubData.clubs : [];

const clubById = new Map(clubs.map((club) => [club.id, club]));
const clubByHomePlaceId = new Map(
  clubs.filter((club) => club.homePlaceId).map((club) => [club.homePlaceId, club])
);

function normalizedRelation(status) {
  return status === "academy_export" ? "academy" : "played_for";
}

function normalizeExistingAffiliations(player) {
  const result = new Map();
  const source = Array.isArray(player.clubAffiliations) ? player.clubAffiliations : [];
  for (const affiliation of source) {
    if (!affiliation || typeof affiliation.clubId !== "string" || !clubById.has(affiliation.clubId)) continue;
    result.set(affiliation.clubId, {
      clubId: affiliation.clubId,
      relation: typeof affiliation.relation === "string" && affiliation.relation ? affiliation.relation : "played_for",
      status: typeof affiliation.status === "string" && affiliation.status ? affiliation.status : null,
      source: affiliation.source === "belagt" ? "belagt" : "utledet"
    });
  }
  return result;
}

let migratedAffiliations = 0;
for (const player of players) {
  const affiliations = normalizeExistingAffiliations(player);
  const statuses = player && typeof player.clubStatus === "object" && player.clubStatus ? player.clubStatus : {};
  const sources = player && typeof player.clubStatusSource === "object" && player.clubStatusSource ? player.clubStatusSource : {};

  for (const [placeId, status] of Object.entries(statuses)) {
    const club = clubByHomePlaceId.get(placeId);
    if (!club) continue;
    const existing = affiliations.get(club.id);
    if (!existing) migratedAffiliations += 1;
    affiliations.set(club.id, {
      clubId: club.id,
      relation: existing?.relation || normalizedRelation(status),
      status: status || existing?.status || null,
      source: sources[placeId] === "belagt" ? "belagt" : (existing?.source || "utledet")
    });
  }

  player.clubAffiliations = [...affiliations.values()]
    .sort((a, b) => a.clubId.localeCompare(b.clubId));
}

const poolSizeByClub = new Map(clubs.map((club) => [club.id, 0]));
for (const player of players) {
  const seen = new Set();
  for (const affiliation of Array.isArray(player.clubAffiliations) ? player.clubAffiliations : []) {
    assert.ok(clubById.has(affiliation.clubId), `${player.id}: ukjent clubId ${affiliation.clubId}`);
    assert.ok(!seen.has(affiliation.clubId), `${player.id}: duplisert clubAffiliation ${affiliation.clubId}`);
    seen.add(affiliation.clubId);
    poolSizeByClub.set(affiliation.clubId, (poolSizeByClub.get(affiliation.clubId) || 0) + 1);
  }
}

for (const club of clubs) {
  const poolSize = poolSizeByClub.get(club.id) || 0;
  club.playerPoolSize = poolSize;
  club.playerPoolStatus = poolSize >= 15 ? "ready" : "pending";
}

playerData.clubAffiliationSchema = "historygo-football-manager.player-club-affiliations.v1";
playerData.clubAffiliationVersion = 1;
clubData.playerPoolSchema = "historygo-football-manager.club-player-pool.v1";
clubData.playerPoolVersion = 1;

// Valider at den eksplisitte klubbtilknytningen dekker alle eksisterende
// klubbrelsjoner som allerede var dokumentert gjennom clubStatus. Dette er
// migreringsbroen; runtime skal etter denne migreringen ikke bruke
// sourcePlaceIds til å avgjøre klubbmedlemskap.
for (const player of players) {
  const affiliationIds = new Set((player.clubAffiliations || []).map((entry) => entry.clubId));
  for (const placeId of Object.keys(player.clubStatus || {})) {
    const club = clubByHomePlaceId.get(placeId);
    if (!club) continue;
    assert.ok(affiliationIds.has(club.id), `${player.id}: mangler eksplisitt klubbtilknytning til ${club.id}`);
  }
}

const readyClubs = clubs.filter((club) => club.playerPoolStatus === "ready");
const pendingClubs = clubs.filter((club) => club.playerPoolStatus === "pending");
assert.ok(readyClubs.length > 0, "ingen klubber fikk ferdig spillerpool");
assert.ok(readyClubs.every((club) => club.playerPoolSize >= 15), "ready-klubb med for liten pool");
assert.ok(pendingClubs.every((club) => club.playerPoolSize < 15), "pending-klubb med stor nok pool");

if (writeMode) {
  fs.writeFileSync(playersUrl, `${JSON.stringify(playerData, null, 2)}\n`);
  fs.writeFileSync(clubsUrl, `${JSON.stringify(clubData, null, 2)}\n`);
}

console.log(JSON.stringify({
  ok: true,
  mode: writeMode ? "write" : "check",
  players: players.length,
  affiliations: players.reduce((sum, player) => sum + (player.clubAffiliations || []).length, 0),
  migratedAffiliations,
  readyClubs: readyClubs.length,
  pendingClubs: pendingClubs.length,
  smallestReadyPool: Math.min(...readyClubs.map((club) => club.playerPoolSize))
}, null, 2));
