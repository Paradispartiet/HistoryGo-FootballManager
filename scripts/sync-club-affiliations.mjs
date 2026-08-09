import assert from "node:assert/strict";
import fs from "node:fs";

const writeMode = process.argv.includes("--write");
const playersUrl = new URL("../data/football_players.json", import.meta.url);
const clubsUrl = new URL("../data/football_clubs.json", import.meta.url);
const playerData = JSON.parse(fs.readFileSync(playersUrl, "utf8"));
const clubData = JSON.parse(fs.readFileSync(clubsUrl, "utf8"));
const players = Array.isArray(playerData.players) ? playerData.players : [];
const clubs = Array.isArray(clubData.clubs) ? clubData.clubs : [];

const AFFILIATION_SCHEMA = "historygo-football-manager.player-club-affiliations.v1";
const POOL_SCHEMA = "historygo-football-manager.club-player-pool.v1";
const MIN_POOL = 15;

const clubById = new Map(clubs.map((club) => [club.id, club]));
const clubByHomePlaceId = new Map(
  clubs.filter((club) => club.homePlaceId).map((club) => [club.homePlaceId, club])
);

function normalizedRelation(status) {
  return status === "academy_export" ? "academy" : "played_for";
}

function normalizeAffiliation(affiliation) {
  if (!affiliation || typeof affiliation.clubId !== "string" || !clubById.has(affiliation.clubId)) return null;
  return {
    clubId: affiliation.clubId,
    relation: typeof affiliation.relation === "string" && affiliation.relation ? affiliation.relation : "played_for",
    status: typeof affiliation.status === "string" && affiliation.status ? affiliation.status : null,
    source: affiliation.source === "belagt" ? "belagt" : "utledet"
  };
}

function expectedAffiliations(player) {
  const result = new Map();
  for (const raw of Array.isArray(player.clubAffiliations) ? player.clubAffiliations : []) {
    const affiliation = normalizeAffiliation(raw);
    if (affiliation) result.set(affiliation.clubId, affiliation);
  }

  // Migreringsbro: clubStatus var allerede klubbrelasjon, bare nøkkelt på
  // klubbens placeId. Vi bruker ALDRI sourcePlaceIds til denne migreringen.
  const statuses = player && typeof player.clubStatus === "object" && player.clubStatus ? player.clubStatus : {};
  const sources = player && typeof player.clubStatusSource === "object" && player.clubStatusSource ? player.clubStatusSource : {};
  for (const [placeId, status] of Object.entries(statuses)) {
    const club = clubByHomePlaceId.get(placeId);
    if (!club) continue;
    const existing = result.get(club.id);
    result.set(club.id, {
      clubId: club.id,
      relation: existing?.relation || normalizedRelation(status),
      status: status || existing?.status || null,
      source: sources[placeId] === "belagt" ? "belagt" : (existing?.source || "utledet")
    });
  }
  return [...result.values()].sort((a, b) => a.clubId.localeCompare(b.clubId));
}

let generatedAffiliations = 0;
for (const player of players) {
  const expected = expectedAffiliations(player);
  generatedAffiliations += expected.length;
  if (writeMode) {
    player.clubAffiliations = expected;
  } else {
    assert.deepEqual(
      Array.isArray(player.clubAffiliations) ? player.clubAffiliations : [],
      expected,
      `${player.id}: clubAffiliations har driftet fra canonical migrering`
    );
  }
}

const poolSizeByClub = new Map(clubs.map((club) => [club.id, 0]));
for (const player of players) {
  const seen = new Set();
  for (const affiliation of Array.isArray(player.clubAffiliations) ? player.clubAffiliations : []) {
    assert.ok(clubById.has(affiliation.clubId), `${player.id}: ukjent clubId ${affiliation.clubId}`);
    assert.ok(!seen.has(affiliation.clubId), `${player.id}: duplisert clubAffiliation ${affiliation.clubId}`);
    seen.add(affiliation.clubId);
    assert.ok(["played_for", "academy", "origin_club", "predecessor_club"].includes(affiliation.relation),
      `${player.id}: ukjent klubbrelasjon ${affiliation.relation}`);
    assert.ok(["belagt", "utledet"].includes(affiliation.source), `${player.id}: ugyldig kildegrad ${affiliation.source}`);
    poolSizeByClub.set(affiliation.clubId, (poolSizeByClub.get(affiliation.clubId) || 0) + 1);
  }
}

for (const club of clubs) {
  const expectedSize = poolSizeByClub.get(club.id) || 0;
  const expectedStatus = expectedSize >= MIN_POOL ? "ready" : "pending";
  if (writeMode) {
    club.playerPoolSize = expectedSize;
    club.playerPoolStatus = expectedStatus;
  } else {
    assert.equal(Number(club.playerPoolSize || 0), expectedSize, `${club.id}: playerPoolSize har driftet`);
    assert.equal(club.playerPoolStatus, expectedStatus, `${club.id}: playerPoolStatus har driftet`);
  }
}

if (writeMode) {
  playerData.clubAffiliationSchema = AFFILIATION_SCHEMA;
  playerData.clubAffiliationVersion = 1;
  clubData.playerPoolSchema = POOL_SCHEMA;
  clubData.playerPoolVersion = 1;
} else {
  assert.equal(playerData.clubAffiliationSchema, AFFILIATION_SCHEMA, "mangler canonical clubAffiliationSchema");
  assert.equal(playerData.clubAffiliationVersion, 1, "mangler clubAffiliationVersion 1");
  assert.equal(clubData.playerPoolSchema, POOL_SCHEMA, "mangler canonical playerPoolSchema");
  assert.equal(clubData.playerPoolVersion, 1, "mangler playerPoolVersion 1");
}

// Alle gamle klubbstatusrelasjoner skal være dekket av eksplisitt medlemskap.
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
assert.ok(readyClubs.length > 0, "ingen klubber har ferdig spillerpool");
assert.ok(readyClubs.every((club) => club.playerPoolSize >= MIN_POOL), "ready-klubb med for liten pool");
assert.ok(pendingClubs.every((club) => club.playerPoolSize < MIN_POOL), "pending-klubb med stor nok pool");

if (writeMode) {
  fs.writeFileSync(playersUrl, `${JSON.stringify(playerData, null, 2)}\n`);
  fs.writeFileSync(clubsUrl, `${JSON.stringify(clubData, null, 2)}\n`);
}

console.log(JSON.stringify({
  ok: true,
  mode: writeMode ? "write" : "audit",
  players: players.length,
  affiliations: generatedAffiliations,
  readyClubs: readyClubs.length,
  pendingClubs: pendingClubs.length,
  smallestReadyPool: Math.min(...readyClubs.map((club) => club.playerPoolSize))
}, null, 2));
