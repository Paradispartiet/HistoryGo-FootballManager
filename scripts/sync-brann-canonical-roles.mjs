// Synchronize the three source-verified Brann position corrections into
// the canonical player catalog, preserving identities, strengths and all
// unrelated records. Safe to re-run: it writes only when content changes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { P1_EXISTING_ROLE_CORRECTIONS, P1_ROLE_FIELDS } from "../src/football-player-source-claims-p1.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filename = path.join(root, "data/football_players.json");
const original = fs.readFileSync(filename, "utf8");
const catalog = JSON.parse(original);
if (!Array.isArray(catalog.players)) throw new Error("Missing player catalog");
if (P1_EXISTING_ROLE_CORRECTIONS.length !== 3) throw new Error("Expected three Brann corrections");

let count = 0;
for (const correction of P1_EXISTING_ROLE_CORRECTIONS) {
  const matches = catalog.players.filter((player) => player.id === correction.playerId);
  if (matches.length !== 1) throw new Error(`Unexpected player identity: ${correction.playerId}`);
  const player = matches[0];
  if (JSON.stringify(player.sourcePlaceIds) !== JSON.stringify([correction.placeId])) {
    throw new Error(`Unexpected club membership: ${correction.playerId}`);
  }
  if (!/^https:\/\/historie\.brann\.no\/spillere\//.test(correction.source)) {
    throw new Error(`Missing original Brann source: ${correction.playerId}`);
  }
  for (const field of P1_ROLE_FIELDS) {
    if (!(field in player) || !(field in correction)) throw new Error(`Unknown position field: ${field}`);
    player[field] = Array.isArray(correction[field]) ? [...correction[field]] : correction[field];
  }
  count += 1;
}
const updated = JSON.stringify(catalog, null, 2) + "\n";
if (updated !== original) fs.writeFileSync(filename, updated, "utf8");
console.log(`Brann canonical roles: ${count} checked, ${updated === original ? "already aligned" : "synchronized"}`);
