// Exact, source-backed Sandefjord position correction. Idempotent and narrow.
// 2003 Dagbladet squad: https://www.dagbladet.no/sport/dagbladet-tipper-1-divisjon/65880176
// Johansen CB per 2006 coach: https://www.bt.no/sport/i/500xdE/sandefjord-vurderer-gabrielsen-og-bjoerdal
// Eftedal RB per contemporary Sandefjord lineups and later biography:
// https://www.fotball.no/fotballdata/kamp/?fiksId=3481393
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../data/football_players.json", import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path, "utf8"));
const corrections = [
  {
    id: "hjalmar_johansen",
    oldPosition: "ST",
    newPosition: "CB",
    warning: "Johansen var Sandefjord-midtstopper, ikke spiss. Midtstopperrollen er dokumentert i treneruttalelse fra 2006."
  },
  {
    id: "thomas_eftedal",
    oldPosition: "CM",
    newPosition: "RB",
    warning: "Eftedal ble brukt som høyreback i Sandefjord, ikke som sentral midtbanespiller."
  }
];
const changes = [];
const fields = ["naturalPositions", "usablePositions", "poorFits", "archetypeIds", "archetypes",
  "needs", "preferredRoles", "likesTactics", "dislikesTactics", "warningWhenMisused"];
for (const correction of corrections) {
  const matches = (catalog.players || []).filter((player) => player.id === correction.id);
  if (matches.length !== 1) throw new Error("Expected exactly one " + correction.id);
  const player = matches[0];
  if (!player.sourcePlaceIds?.includes("jotun_arena") ||
      !player.clubAffiliations?.some(a => a.clubId === "sandefjord")) {
    throw new Error(correction.id + ": canonical Sandefjord player identity not verified");
  }
  if (JSON.stringify(player.naturalPositions) !== JSON.stringify([correction.oldPosition]) &&
      JSON.stringify(player.naturalPositions) !== JSON.stringify([correction.newPosition])) {
    throw new Error(correction.id + ": unexpected previous position " + JSON.stringify(player.naturalPositions));
  }
  const desired = {
    naturalPositions: [correction.newPosition],
    usablePositions: [],
    poorFits: [],
    archetypeIds: [],
    archetypes: [],
    needs: [],
    preferredRoles: [],
    likesTactics: [],
    dislikesTactics: [],
    warningWhenMisused: correction.warning
  };
  for (const field of fields) {
    if (JSON.stringify(player[field]) !== JSON.stringify(desired[field])) {
      changes.push(correction.id + "." + field);
      player[field] = desired[field];
    }
  }
}
if (!changes.length) {
  console.log("Sandefjord canonical position records already synchronized");
} else if (!process.argv.includes("--write")) {
  throw new Error("Sandefjord roles require sync: " + changes.join(", "));
} else {
  fs.writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log("Synced Sandefjord source-backed roles: " + changes.join(", "));
  console.log("Only two source-verified player records updated; all strengths, identities and classes preserved");
}
