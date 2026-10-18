import fs from "node:fs";
import assert from "node:assert/strict";

const file = "data/football_players.json";
const ledgerPath = "data/research/stromsgodset-affiliations-2026-10-18.json";
const catalog = JSON.parse(fs.readFileSync(file, "utf8"));
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const ids = [
  "finn_aksel_olsen",
  "svein_dahl_andersen",
  "bjorn_erik_billy_halvorsen",
  "runar_larsen",
  "ivar_eriksen",
  "mattias_andersson",
  "steffen_nystrom",
  "enock_kwakwa",
  "prosper_mendy",
  "krister_aunan"
];
const byId = new Map(catalog.players.map((p) => [p.id,p]));
const documented = new Set(ledger.entries.map((e) => e.playerId));
for (const id of ids) {
  const player = byId.get(id);
  assert.ok(player, id + ": missing canonical ID");
  assert.ok(documented.has(id), id + ": missing permanent research ledger");
  const affiliation = player.clubAffiliations?.find((a) =>
    a.clubId === "stromsgodset" && a.relation === "played_for");
  assert.ok(affiliation, id + ": no played_for club affiliation");
  assert.equal(affiliation.source, "utledet", id + ": previously modified");
  assert.equal(player.clubStatusSource?.marienlyst_stadion, "utledet",
    id + ": place source out of sync");
  affiliation.source = "belagt";
  player.clubStatusSource.marienlyst_stadion = "belagt";
}
fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + "\n");
console.log("Updated 10 existing, source-backed Strømsgodset affiliations.");
