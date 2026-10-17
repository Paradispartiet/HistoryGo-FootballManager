// Engangsmigrering av 9 allerede eksisterende og nå klubb-dokumenterte RBK-spillere.
// Filen fjernes før PR opprettes. Ingen annen spillerdata skal endres.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
const path = new URL("../data/football_players.json", import.meta.url);
const data = JSON.parse(readFileSync(path, "utf8"));
const ids = new Set([
  "ragnar_iversen",
  "sigurd_larsen",
  "egil_nygaard",
  "paul_fornes",
  "svein_erik_jakobsen",
  "knut_jenssen",
  "svein_haagenrud",
  "erling_naess",
  "magnar_florholmen"
]);
let changed = 0;
for (const player of data.players) {
  if (!ids.has(player.id)) continue;
  const rbk = player.clubAffiliations?.find(a => a.clubId === "rosenborg" && a.relation === "played_for");
  assert.ok(rbk, player.id + ": must already have Rosenborg career");
  assert.equal(rbk.source, "utledet", player.id + ": unexpected source");
  assert.equal(player.clubStatusSource?.lerkendal_stadion, "utledet", player.id + ": unexpected place source");
  assert.deepEqual(player.strengths, [], player.id + ": raw strengths must remain empty");
  rbk.source = "belagt";
  player.clubStatusSource.lerkendal_stadion = "belagt";
  changed++;
}
assert.equal(changed, ids.size, "expected nine identities");
writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("Upgraded source for", changed, "historical Rosenborg affiliations");
