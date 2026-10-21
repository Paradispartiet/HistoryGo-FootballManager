// Source-backed, exact-scope role correction for Tor Gunnar Hagbø.
// Molde's 1983 archive explicitly describes his "solid stopperspill":
// https://www.moldefk.no/om-klubben/var-historie/1980-1989/1983
// NFF lineup (1984) independently confirms he played outside goalkeeper:
// https://www.fotball.no/fotballdata/kamp/?fiksId=3463294
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../data/football_players.json", import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path, "utf8"));
const matches = (catalog.players || []).filter((player) => player.id === "tor_gunnar_hagbo");
if (matches.length !== 1) throw new Error("Expected exactly one canonical Tor Gunnar Hagbø");
const player = matches[0];
if (JSON.stringify(player.sourcePlaceIds) !== JSON.stringify(["aker_stadion"])) {
  throw new Error("Hagbø must belong exclusively to Molde's Aker heritage");
}
if (!Array.isArray(player.strengths) || player.strengths.length !== 0) {
  throw new Error("Hagbø raw strength baseline changed: no speculative skills allowed");
}
const desired = {
  naturalPositions: ["CB"],
  usablePositions: [],
  poorFits: ["GK"],
  archetypeIds: [],
  archetypes: [],
  needs: [],
  preferredRoles: [],
  likesTactics: [],
  dislikesTactics: [],
  warningWhenMisused: "Hagbø er historisk dokumentert som stopper i Molde, ikke keeper. Spill ham i forsvar; ingen individuelle ferdighetsstyrker er kildebelagt."
};
const existing = player.naturalPositions;
if (JSON.stringify(existing) !== JSON.stringify(["GK"]) &&
    JSON.stringify(existing) !== JSON.stringify(["CB"])) {
  throw new Error("Unexpected original Hagbø primary position: " + JSON.stringify(existing));
}
const changed = Object.entries(desired)
  .filter(([key, value]) => JSON.stringify(player[key]) !== JSON.stringify(value))
  .map(([key]) => key);
if (!changed.length) {
  console.log("Hagbø canonical stopper role already synchronized; no change.");
} else if (!process.argv.includes("--write")) {
  console.error("Sourced Hagbø role needs syncing: " + changed.join(", "));
  process.exitCode = 1;
} else {
  for (const [key, value] of Object.entries(desired)) player[key] = value;
  fs.writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log("Synchronized exactly one Molde player; role fields: " + changed.join(", "));
  console.log("Preserved player ID, club affiliations, class, raw skills and match history.");
}
