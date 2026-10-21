// One-shot canonical catalog sync. No skill tokens or player identities are inferred.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { P1_EXISTING_ROLE_CORRECTIONS, P1_ROLE_FIELDS } from "../src/football-player-source-claims-p1.js";

const path = fileURLToPath(new URL("../data/football_players.json", import.meta.url));
const before = fs.readFileSync(path, "utf8");
const catalog = JSON.parse(before);
const expected = new Set(["leif_amundsen", "hans_brandtun", "jan_erik_osland"]);
if (P1_EXISTING_ROLE_CORRECTIONS.length !== 3 ||
  P1_EXISTING_ROLE_CORRECTIONS.some((entry) => !expected.has(entry.playerId))) {
  throw new Error("Brann role source list changed; review before syncing raw data");
}

const changes = [];
for (const correction of P1_EXISTING_ROLE_CORRECTIONS) {
  const matches = catalog.players.filter((entry) => entry.id === correction.playerId);
  if (matches.length !== 1 || matches[0].sourcePlaceIds?.join() !== correction.placeId) {
    throw new Error(`Expected one exclusive Brann record: ${correction.playerId}`);
  }
  const player = matches[0];
  for (const field of P1_ROLE_FIELDS) {
    if (!(field in correction)) throw new Error(`Missing sourced field: ${field}`);
    if (JSON.stringify(player[field]) !== JSON.stringify(correction[field])) {
      changes.push(`${correction.playerId}.${field}`);
      player[field] = Array.isArray(correction[field]) ? [...correction[field]] : correction[field];
    }
  }
}
if (!changes.length) {
  console.log("Brann canonical roles already match P1; no changes.");
} else if (process.argv.includes("--write")) {
  fs.writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Synced ${changes.length} role fields: ${changes.join(", ")}`);
} else {
  console.error("Raw catalog differs from sourced Brann roles:", changes.join(", "));
  console.error("Run node scripts/sync-brann-raw-roles.mjs --write to update.");
  process.exitCode = 1;
}
