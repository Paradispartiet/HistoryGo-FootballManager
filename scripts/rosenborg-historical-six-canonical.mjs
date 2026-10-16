// Midlertidig, avgrenset datamigrering for historiske Rosenborg-spillere.
// Kjøres én gang i GitHub Actions fordi katalogen er større enn GitHub-koblingens skrivegrense.
import assert from "node:assert/strict";
import fs from "node:fs";

const url = new URL("../data/football_players.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(url, "utf8"));
const documentedRosenborgPlayers = new Set([
  "harald_petersen",
  "tore_lindseth",
  "oystein_wormdal",
  "erling_meirik",
  "terje_morkved",
  "harald_gulbrandsen"
]);

let updated = 0;
for (const player of data.players) {
  if (!documentedRosenborgPlayers.has(player.id)) continue;
  const affiliation = player.clubAffiliations?.find((entry) =>
    entry.clubId === "rosenborg" && entry.relation === "played_for");
  assert.ok(affiliation, player.id + ": mangler eksisterende Rosenborg-tilknytning");
  assert.equal(affiliation.source, "utledet", player.id + ": uventet kildestatus");
  assert.equal(player.clubStatusSource?.lerkendal_stadion, "utledet",
    player.id + ": uventet stadion-kildestatus");
  assert.deepEqual(player.strengths, [], player.id + ": skal ikke endre råstyrker");
  affiliation.source = "belagt";
  player.clubStatusSource.lerkendal_stadion = "belagt";
  updated++;
}
assert.equal(updated, documentedRosenborgPlayers.size,
  "alle seks eksisterende Rosenborg-identiteter må oppdateres");
fs.writeFileSync(url, JSON.stringify(data, null, 2) + "\n");
console.log("Oppdatert dokumentert klubbtilknytning for", updated, "spillere");
