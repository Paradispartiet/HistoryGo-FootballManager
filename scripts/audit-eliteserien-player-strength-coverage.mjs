// Reproduserbar, read-only kvalitetsdekning for Eliteserien.
// Spillerdata, kildeclaims, posisjoner og laguttak endres aldri av denne rapporten.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  P1_NEW_DOCUMENTED, P1_EXISTING_SUPPLEMENTS,
  getP1HeritageForPlayer, getP1NewSourceRecord, applyP1SourceClaims
} from "../src/football-player-source-claims-p1.js";
import { P2_DOCUMENTED, getP2SourceRecord, applyP2SourceClaims }
  from "../src/football-player-source-claims-p2.js";
import { SOURCE_DEPTH_DOCUMENTED, getSourceDepthRecord, applySourceDepthClaims }
  from "../src/football-player-source-claims-depth.js";
import {
  listClubPoolPlayers, listPlayableClubPoolPlayers, resolveClubSquadAccess
} from "../src/football-club-squad.js";

const read = (file) => JSON.parse(fs.readFileSync(new URL("../data/" + file, import.meta.url), "utf8"));
const rawPlayers = read("football_players.json").players;
const clubs = read("football_clubs.json").clubs.filter((club) => club.tier === "eliteserien");
const placeUnlocks = read("football_unlocks.json").placeUnlocks || [];
const nationalPlaces = new Set(placeUnlocks
  .filter((place) => String(place.placeRole || "").includes("national"))
  .map((place) => place.placeId));
const candidateIds = new Set(rawPlayers
  .filter((player) => !(player.sourcePlaceIds || []).some((id) => nationalPlaces.has(id)))
  .map((player) => player.id));

const afterP1 = applyP1SourceClaims(rawPlayers);
const afterP2 = applyP2SourceClaims(afterP1);
const effectivePlayers = applySourceDepthClaims(afterP2);
const effectiveById = new Map(effectivePlayers.map((player) => [player.id, player]));
const p1Documented = new Map(P1_NEW_DOCUMENTED.map((record) => [record.playerId, record]));
const p1Supplements = new Map(P1_EXISTING_SUPPLEMENTS.map((record) => [record.playerId, record]));
const p2Documented = new Map(P2_DOCUMENTED.map((record) => [record.playerId, record]));
const depthDocumented = new Map(SOURCE_DEPTH_DOCUMENTED.map((record) => [record.playerId, record]));
const arr = (value) => Array.isArray(value) ? value : [];

function sourceFor(raw, effective) {
  const rawStrengths = arr(raw.strengths);
  const heritage = getP1HeritageForPlayer(raw);
  const p1Record = p1Documented.get(raw.id) || p1Supplements.get(raw.id);
  const p2Record = p2Documented.get(raw.id);
  const depthRecord = depthDocumented.get(raw.id);
  const p1Status = heritage?.generation === "new" ? getP1NewSourceRecord(raw)?.status : null;

  // P1 kan eie en spiller selv om ingen styrkepåstand er godkjent.
  // Rå katalogstyrker må ikke uriktig gis en spesifikk URL fra et senere register.
  let origin = "none";
  let record = null;
  if (p1Record && arr(effective.strengths).length > 0) {
    origin = "p1_claim";
    record = p1Record;
  } else if (rawStrengths.length > 0 && arr(effective.strengths).length > 0) {
    origin = "catalogue_raw";
  } else if (p2Record && arr(effective.strengths).length > 0) {
    origin = "p2_snl";
    record = p2Record;
  } else if (depthRecord && arr(effective.strengths).length > 0) {
    origin = "source_depth";
    record = depthRecord;
  }
  return {
    strengthOrigin: origin,
    p1Heritage: heritage?.key || null,
    p1Status,
    claim: record?.claim || null,
    sourceUrl: record?.source || null,
    sourceKind: record?.sourceKind || (origin === "p2_snl" ? "encyclopedia" : null)
  };
}

function laneFor(raw, affiliation) {
  if (getP1HeritageForPlayer(raw)) return "P1_owned";
  if (getP2SourceRecord(raw)) return "P2_SNL_owned";
  if (arr(raw.strengths).length > 0) return "catalogue_review";
  if (getSourceDepthRecord(raw)) return "source_depth_existing";
  if (affiliation?.source === "belagt") return "source_depth_eligible";
  return "affiliation_needs_review";
}

const rows = [];
const clubSummaries = [];
for (const club of [...clubs].sort((a, b) => a.id.localeCompare(b.id))) {
  const pool = listClubPoolPlayers({ clubId: club.id, players: rawPlayers });
  const playable = listPlayableClubPoolPlayers({ clubId: club.id, players: rawPlayers });
  // Samme no-visit og candidate-filter som scripts/simulate-club-squad.mjs.
  const access = resolveClubSquadAccess({
    club, players: rawPlayers, candidateIds, unlockedPlaceIds: [], squadSize: 15
  });
  const baseIds = new Set(arr(access?.baseSquad));
  const playableIds = new Set(playable.map((player) => player.id));
  assert.equal(new Set(pool.map((player) => player.id)).size, pool.length, club.id + ": duplicate player");
  const positionCoverage = {};
  let withStrengths = 0, withExplicitSourceClaim = 0, playableWithStrengths = 0, baseWithStrengths = 0;
  for (const raw of pool) {
    const effective = effectiveById.get(raw.id);
    assert.ok(effective, raw.id + ": missing effective player");
    const strengths = arr(effective.strengths);
    const natural = arr(raw.naturalPositions);
    const usable = arr(raw.usablePositions);
    const positions = [...new Set([...natural, ...usable])];
    const primary = natural[0] || usable[0] || "UNPROFILED";
    const isPlayable = playableIds.has(raw.id);
    const inBaseSquad = baseIds.has(raw.id);
    const affiliation = arr(raw.clubAffiliations).find((item) => item.clubId === club.id);
    const provenance = sourceFor(raw, effective);
    const priority = strengths.length
      ? "covered"
      : inBaseSquad ? "high_base_squad"
      : isPlayable ? "medium_playable_pool"
      : "needs_position_evidence";
    withStrengths += Number(strengths.length > 0);
    withExplicitSourceClaim += Number(Boolean(provenance.sourceUrl));
    playableWithStrengths += Number(isPlayable && strengths.length > 0);
    baseWithStrengths += Number(inBaseSquad && strengths.length > 0);
    const bucket = positionCoverage[primary] || { count: 0, withStrengths: 0 };
    bucket.count += 1;
    bucket.withStrengths += Number(strengths.length > 0);
    positionCoverage[primary] = bucket;
    rows.push({
      clubId: club.id,
      clubName: club.name,
      playerId: raw.id,
      playerName: raw.name,
      era: raw.era || null,
      clubRelation: affiliation?.relation || null,
      clubAffiliationSource: affiliation?.source || null,
      naturalPositions: natural,
      usablePositions: usable,
      positions,
      primaryPosition: primary,
      playable: isPlayable,
      inNoVisitBaseSquad: inBaseSquad,
      rawStrengths: arr(raw.strengths),
      effectiveStrengths: strengths,
      ...provenance,
      researchLane: laneFor(raw, affiliation),
      priority
    });
  }
  clubSummaries.push({
    clubId: club.id,
    clubName: club.name,
    documentedPool: pool.length,
    playablePool: playable.length,
    noVisitBaseSquad: baseIds.size,
    withStrengths,
    withoutStrengths: pool.length - withStrengths,
    withExplicitSourceClaim,
    playableWithStrengths,
    baseWithStrengths,
    coveragePercent: Math.round(1000 * withStrengths / (pool.length || 1)) / 10,
    byPrimaryPosition: Object.fromEntries(
      Object.entries(positionCoverage).sort(([a], [b]) => a.localeCompare(b))
    )
  });
}
const summary = {
  schema: "historygo-football-manager.eliteserien-player-strength-coverage.v1",
  cataloguePlayers: rawPlayers.length,
  catalogueWithEffectiveStrengths: effectivePlayers.filter((player) => arr(player.strengths).length > 0).length,
  clubs: clubs.length,
  affiliations: rows.length,
  affiliationsWithStrengths: rows.filter((row) => row.effectiveStrengths.length > 0).length,
  affiliationsWithoutStrengths: rows.filter((row) => row.effectiveStrengths.length === 0).length,
  uniqueAffiliatedPlayers: new Set(rows.map((row) => row.playerId)).size,
  sourceClaimCount: rows.filter((row) => row.sourceUrl).length,
  priorityCounts: Object.fromEntries(
    ["high_base_squad", "medium_playable_pool", "needs_position_evidence", "covered"]
      .map((priority) => [priority, rows.filter((row) => row.priority === priority).length])
  )
};

// Data integrity, not a frozen coverage quota. New sourced strengths must not
// trigger CI failure just because coverage improves.
assert.equal(clubs.length, 16, "expected the 16 Eliteserien clubs");
assert.equal(effectivePlayers.length, rawPlayers.length, "overlay changed catalogue size");
assert.equal(effectiveById.size, rawPlayers.length, "duplicate player IDs");
assert.equal(rows.length, clubSummaries.reduce((n, club) => n + club.documentedPool, 0));
assert.equal(summary.affiliationsWithStrengths + summary.affiliationsWithoutStrengths, rows.length);
for (let i = 0; i < rawPlayers.length; i += 1) {
  assert.equal(rawPlayers[i].id, effectivePlayers[i].id, "source overlay changed order/identity");
}
for (const club of clubSummaries) {
  assert.ok(club.playablePool <= club.documentedPool, club.clubId + ": playable exceeds documented");
  assert.ok(club.baseWithStrengths <= club.noVisitBaseSquad, club.clubId + ": impossible base coverage");
}

const args = process.argv.slice(2);
const allowed = new Set(["--check", "--summary", "--json", "--csv"]);
assert.ok(args.every((arg) => allowed.has(arg)), "use --check, --summary, --json or --csv");
assert.ok(args.length < 2, "choose one output format");
if (args.includes("--csv")) {
  const columns = [
    "clubId", "clubName", "playerId", "playerName", "era",
    "clubRelation", "clubAffiliationSource", "naturalPositions", "usablePositions",
    "primaryPosition", "playable", "inNoVisitBaseSquad",
    "rawStrengths", "effectiveStrengths", "strengthOrigin", "p1Heritage", "p1Status",
    "sourceUrl", "sourceKind", "claim", "researchLane", "priority"
  ];
  const cell = (value) => {
    const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
    return '"' + text.replaceAll('"', '""') + '"';
  };
  console.log(columns.join(","));
  for (const row of rows) console.log(columns.map((column) => cell(row[column])).join(","));
} else if (args.includes("--check") || args.includes("--summary")) {
  console.log(JSON.stringify({ ...summary, clubs: clubSummaries }, null, 2));
} else {
  console.log(JSON.stringify({ summary, clubs: clubSummaries, players: rows }, null, 2));
}
