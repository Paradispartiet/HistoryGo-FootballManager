import assert from "node:assert/strict";
import fs from "node:fs";

const playersPath = new URL("../data/football_players.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
const players = Array.isArray(data.players) ? data.players : [];
const byId = new Map(players.map((player) => [player.id, player]));

const PLACE_ID = "pors_stadion";
const CLUB_ID = "pors";
const crosslinks = [
  "einar_rossbach",
  "fredrik_nordkvelle",
  "erik_pedersen",
  "tor_arne_sannerholt",
  "christer_fjellstad"
];

for (const id of crosslinks) {
  const player = byId.get(id);
  assert.ok(player, `Pors-krysskobling: mangler ${id}`);

  // P1-nevneren er eksplisitt frosset på opprinnelig sourcePlaceIds. Pors er
  // her en ny klubbrelasjon og en ny stadion-unlock, ikke en omskriving av
  // stedet den allerede auditerte profilen kom fra.
  player.sourcePlaceIds = (player.sourcePlaceIds || []).filter((placeId) => placeId !== PLACE_ID);
  if (player.clubStatus && typeof player.clubStatus === "object") delete player.clubStatus[PLACE_ID];
  if (player.clubStatusSource && typeof player.clubStatusSource === "object") delete player.clubStatusSource[PLACE_ID];

  const affiliations = Array.isArray(player.clubAffiliations) ? player.clubAffiliations : [];
  const withoutPors = affiliations.filter((entry) => entry.clubId !== CLUB_ID);
  player.clubAffiliations = [
    ...withoutPors,
    { clubId: CLUB_ID, relation: "played_for", status: "club_profile", source: "belagt" }
  ].sort((a, b) => a.clubId.localeCompare(b.clubId));
}

fs.writeFileSync(playersPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, preservedP1Crosslinks: crosslinks.length }, null, 2));
