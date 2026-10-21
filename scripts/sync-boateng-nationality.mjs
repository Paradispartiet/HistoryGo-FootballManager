// One-shot canonical data correction; the playable identity migration remains unchanged.
// Source: Colorado Rapids' Nana / Bismark Adjei-Boateng profile:
// https://www.coloradorapids.com/players/nana-boateng/  (Citizenship: Ghana)
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../data/football_players.json", import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path, "utf8"));
const ids = ["nana_boateng", "bismark_adjei_boateng"];
let changed = 0;
for (const id of ids) {
  const matches = (catalog.players || []).filter(player => player.id === id);
  if (matches.length !== 1) throw new Error("Expected exactly one catalog entry for " + id);
  const player = matches[0];
  if (!player.sourcePlaceIds?.includes("marienlyst_stadion"))
    throw new Error("Unexpected club heritage for " + id);
  if (!["Norge", "Norway", "Ghana"].includes(player.nationality))
    throw new Error("Unexpected nationality for " + id + ": " + player.nationality);
  if (player.nationality !== "Ghana") {
    player.nationality = "Ghana";
    changed += 1;
  }
}
if (!changed) {
  console.log("Boateng legacy and canonical catalogue nationalities already match Ghana.");
} else if (!process.argv.includes("--write")) {
  throw new Error("Boateng canonical raw nationalities need syncing: " + changed);
} else {
  fs.writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log("Corrected Ghana nationality on " + changed + " known Boateng identity record(s).");
  console.log("Preserved IDs, positions, clubs, attributes, unlocks and historic save alias.");
}
