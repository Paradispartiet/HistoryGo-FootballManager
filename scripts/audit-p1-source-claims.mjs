import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  P1_HERITAGES,
  P1_NEW_DOCUMENTED,
  P1_NEW_PARTIAL,
  P1_EXISTING_SUPPLEMENTS,
  getP1HeritageForPlayer,
  getP1NewSourceRecord,
  applyP1NewSourceClaims
} from "../src/football-player-source-claims-p1.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const players = readJson("data/football_players.json").players || [];
const attributeData = readJson("data/football_attributes.json");

let checks = 0;
const fail = (message) => { throw new Error(`P1 source-claim audit: ${message}`); };
const ok = (condition, message) => { checks += 1; if (!condition) fail(message); };
const asArray = (value) => Array.isArray(value) ? value : [];

const playerById = new Map(players.map((player) => [player.id, player]));
const heritageByPlace = new Map(P1_HERITAGES.map((heritage) => [heritage.placeId, heritage]));
const newHeritages = P1_HERITAGES.filter((heritage) => heritage.generation === "new");
const existingHeritages = P1_HERITAGES.filter((heritage) => heritage.generation === "existing");
const validAttributes = new Set(asArray(attributeData.attributes).map((entry) => entry.id));

ok(P1_HERITAGES.length === 18, `expected 18 P1 heritages, got ${P1_HERITAGES.length}`);
ok(new Set(P1_HERITAGES.map((entry) => entry.placeId)).size === 18, "heritage placeIds must be unique");

const exclusiveByPlace = new Map();
for (const heritage of P1_HERITAGES) {
  const exclusive = players.filter((player) => {
    const ids = asArray(player.sourcePlaceIds);
    return ids.length === 1 && ids[0] === heritage.placeId;
  });
  exclusiveByPlace.set(heritage.placeId, exclusive);
  ok(exclusive.length === heritage.expectedExclusive,
    `${heritage.key}: expected ${heritage.expectedExclusive} exclusive profiles, got ${exclusive.length}`);
}

const allExclusive = P1_HERITAGES.flatMap((heritage) => exclusiveByPlace.get(heritage.placeId));
const newExclusive = newHeritages.flatMap((heritage) => exclusiveByPlace.get(heritage.placeId));
const existingExclusive = existingHeritages.flatMap((heritage) => exclusiveByPlace.get(heritage.placeId));
ok(allExclusive.length === 936, `expected combined P1 denominator 936, got ${allExclusive.length}`);
ok(newExclusive.length === 701, `expected new-pass denominator 701, got ${newExclusive.length}`);
ok(existingExclusive.length === 235, `expected existing-pass denominator 235, got ${existingExclusive.length}`);
ok(new Set(allExclusive.map((player) => player.id)).size === 936, "exclusive P1 player IDs must be unique");

// The 13 new passes begin from the post-conversion zero-strength baseline.
for (const player of newExclusive) {
  ok(asArray(player.strengths).length === 0,
    `${player.id}: new P1 baseline must have empty strengths before source-claim overlay`);
  const heritage = getP1HeritageForPlayer(player);
  ok(heritage?.generation === "new", `${player.id}: failed new-P1 heritage resolution`);
}

const explicitRecords = [...P1_NEW_DOCUMENTED, ...P1_NEW_PARTIAL, ...P1_EXISTING_SUPPLEMENTS];
ok(new Set(explicitRecords.map((record) => record.playerId)).size === explicitRecords.length,
  "explicit P1 records must not duplicate player IDs");

for (const record of P1_NEW_DOCUMENTED) {
  const player = playerById.get(record.playerId);
  ok(Boolean(player), `${record.playerId}: documented record player missing from canonical catalogue`);
  const heritage = getP1HeritageForPlayer(player);
  ok(heritage?.generation === "new", `${record.playerId}: documented record must belong to a new P1 heritage`);
  ok(heritage?.placeId === record.placeId,
    `${record.playerId}: record place ${record.placeId} differs from canonical ${heritage?.placeId}`);
  ok(typeof record.claim === "string" && record.claim.trim().length > 20,
    `${record.playerId}: documented claim must be concrete`);
  ok(/^https:\/\//.test(record.source || ""), `${record.playerId}: documented claim needs an https source`);
  ok(asArray(record.strengths).length > 0, `${record.playerId}: DOKUMENTERT requires at least one strength`);
  ok(new Set(record.strengths).size === record.strengths.length, `${record.playerId}: duplicate strength token`);
  for (const strength of record.strengths) {
    ok(validAttributes.has(strength), `${record.playerId}: unknown attribute token ${strength}`);
  }
}

for (const record of P1_NEW_PARTIAL) {
  const player = playerById.get(record.playerId);
  ok(Boolean(player), `${record.playerId}: DELVIS player missing from canonical catalogue`);
  const heritage = getP1HeritageForPlayer(player);
  ok(heritage?.generation === "new" && heritage.placeId === record.placeId,
    `${record.playerId}: DELVIS record is outside its canonical exclusive population`);
  ok(typeof record.claim === "string" && record.claim.trim().length > 20,
    `${record.playerId}: DELVIS needs a concrete career/role claim`);
  ok(/^https:\/\//.test(record.source || ""), `${record.playerId}: DELVIS needs an https source`);
  ok(asArray(record.strengths).length === 0, `${record.playerId}: DELVIS strengths must stay empty`);
}

for (const record of P1_EXISTING_SUPPLEMENTS) {
  const player = playerById.get(record.playerId);
  ok(Boolean(player), `${record.playerId}: existing supplement player missing from canonical catalogue`);
  const heritage = getP1HeritageForPlayer(player);
  ok(heritage?.generation === "existing" && heritage.placeId === record.placeId,
    `${record.playerId}: existing supplement is outside its canonical exclusive population`);
  ok(asArray(player.strengths).length === 0,
    `${record.playerId}: supplement must fill a previously empty raw strengths list`);
  ok(typeof record.claim === "string" && record.claim.trim().length > 20,
    `${record.playerId}: supplement claim must be concrete`);
  ok(/^https:\/\//.test(record.source || ""), `${record.playerId}: supplement needs an https source`);
  ok(asArray(record.strengths).length > 0, `${record.playerId}: supplement DOKUMENTERT requires strengths`);
  for (const strength of record.strengths) {
    ok(validAttributes.has(strength), `${record.playerId}: unknown supplement attribute ${strength}`);
  }
}

const statusCounts = { DOKUMENTERT: 0, DELVIS: 0, "THIN-SOURCE": 0 };
for (const player of newExclusive) {
  const record = getP1NewSourceRecord(player);
  ok(Boolean(record), `${player.id}: every new P1 profile must resolve to a source status`);
  ok(Object.hasOwn(statusCounts, record.status), `${player.id}: invalid P1 status ${record.status}`);
  statusCounts[record.status] += 1;
  if (record.status !== "DOKUMENTERT") {
    ok(asArray(record.strengths).length === 0, `${player.id}: ${record.status} strengths must stay empty`);
  }
}
ok(Object.values(statusCounts).reduce((sum, count) => sum + count, 0) === 701,
  "new status distribution must cover 701/701 exactly once");
ok(statusCounts.DOKUMENTERT === P1_NEW_DOCUMENTED.length, "DOKUMENTERT count drift");
ok(statusCounts.DELVIS === P1_NEW_PARTIAL.length, "DELVIS count drift");

const overlaid = applyP1NewSourceClaims(players);
const overlaidById = new Map(overlaid.map((player) => [player.id, player]));
for (const player of newExclusive) {
  const record = getP1NewSourceRecord(player);
  const strengths = asArray(overlaidById.get(player.id)?.strengths);
  ok(JSON.stringify(strengths) === JSON.stringify(record.strengths),
    `${player.id}: source-claim overlay differs from audited record`);
}

// The five earlier passes remain provenance for already-materialized claims.
// Three source-verified supplements close the materialization gaps found by the
// audit (one Viking profile and two Lillestrøm profiles).
for (const heritage of existingHeritages) {
  const population = exclusiveByPlace.get(heritage.placeId);
  const effectivePopulation = population.map((player) => overlaidById.get(player.id));
  const documented = effectivePopulation.filter((player) => asArray(player.strengths).length > 0);
  const empty = effectivePopulation.length - documented.length;
  ok(documented.length === heritage.expectedDocumented,
    `${heritage.key}: expected ${heritage.expectedDocumented} effective documented profiles, got ${documented.length}`);
  ok(empty === heritage.expectedPartial + heritage.expectedThin,
    `${heritage.key}: existing DELVIS + THIN-SOURCE empty count drift`);
  ok(Boolean(heritage.sourcePass), `${heritage.key}: existing pass must name its audited source-pass artifact`);
}

const existingStatusCounts = existingHeritages.reduce((totals, heritage) => {
  totals.DOKUMENTERT += heritage.expectedDocumented;
  totals.DELVIS += heritage.expectedPartial;
  totals["THIN-SOURCE"] += heritage.expectedThin;
  return totals;
}, { DOKUMENTERT: 0, DELVIS: 0, "THIN-SOURCE": 0 });
const totalStatusCounts = {
  DOKUMENTERT: statusCounts.DOKUMENTERT + existingStatusCounts.DOKUMENTERT,
  DELVIS: statusCounts.DELVIS + existingStatusCounts.DELVIS,
  "THIN-SOURCE": statusCounts["THIN-SOURCE"] + existingStatusCounts["THIN-SOURCE"]
};
ok(totalStatusCounts.DOKUMENTERT === 45, `expected 45 total documented P1 profiles, got ${totalStatusCounts.DOKUMENTERT}`);
ok(totalStatusCounts.DELVIS === 15, `expected 15 total partial P1 profiles, got ${totalStatusCounts.DELVIS}`);
ok(totalStatusCounts["THIN-SOURCE"] === 876, `expected 876 total thin-source P1 profiles, got ${totalStatusCounts["THIN-SOURCE"]}`);
ok(Object.values(totalStatusCounts).reduce((sum, count) => sum + count, 0) === 936,
  "combined status distribution must cover 936/936");

// Stabæk identity regressions that caused the final denominator mismatch.
const stabakExclusiveIds = new Set(exclusiveByPlace.get("nadderud_stadion").map((player) => player.id));
ok(!stabakExclusiveIds.has("antonio_nusa"), "Antonio Nusa must stay outside Stabæk exclusive P1");
ok(!stabakExclusiveIds.has("kjell_roar_kaasa"), "Kjell Roar Kaasa must stay outside Stabæk exclusive P1");
ok(stabakExclusiveIds.has("christer_basma"), "Christer Basma must remain the separate Nadderud-only canonical profile");
ok(playerById.get("ole_christer_basma")?.sourcePlaceIds?.[0] === "lerkendal_stadion",
  "Ole Christer Basma must remain a separate Lerkendal profile");

for (const record of explicitRecords) {
  ok(heritageByPlace.has(record.placeId), `${record.playerId}: record place is outside frozen P1 denominator`);
}

console.log(`P1 source-claim audit PASS: ${checks} checks`);
console.log(`P1 population: 936/936 across 18 heritages (701 new + 235 existing)`);
console.log(`New-pass statuses: ${statusCounts.DOKUMENTERT} DOKUMENTERT · ${statusCounts.DELVIS} DELVIS · ${statusCounts["THIN-SOURCE"]} THIN-SOURCE`);
console.log(`Combined P1 statuses: ${totalStatusCounts.DOKUMENTERT} DOKUMENTERT · ${totalStatusCounts.DELVIS} DELVIS · ${totalStatusCounts["THIN-SOURCE"]} THIN-SOURCE`);
