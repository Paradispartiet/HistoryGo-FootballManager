// One-time, exact-scope Molde provenance sync; no inferred player skills.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../data/football_players.json", import.meta.url));
const content = fs.readFileSync(path, "utf8");
const catalog = JSON.parse(content);
const matches = catalog.players.filter(player => player.id === "eidur_gudjohnsen");
if (matches.length !== 1) throw new Error("Expected exactly one Eidur Gudjohnsen");
const player = matches[0];
if (JSON.stringify(player.sourcePlaceIds) !== JSON.stringify(["aker_stadion"]) ||
    player.classSource !== "belagt" || (player.strengths || []).length !== 0) {
  throw new Error("Eidur identity, P1 ownership or raw skill baseline changed");
}
const affiliation = (player.clubAffiliations || []).filter(a => a.clubId === "molde" && a.relation === "played_for");
if (affiliation.length !== 1) throw new Error("Expected exactly one Molde affiliation");
const source = affiliation[0].source;
if (source === "belagt") {
  console.log("Eidur's Molde affiliation is already source-backed");
} else if (source !== "utledet") {
  throw new Error("Unexpected prior club-affiliation provenance: " + source);
} else if (!process.argv.includes("--write")) {
  console.error("Eidur Molde affiliation still inferred; run with --write after verifying Molde official club history");
  process.exitCode = 1;
} else {
  // Official Molde appearance roll: https://www.moldefk.no/om-klubben/var-historie/adelskalendere-i-mfk/antall-offisielle-kamper-totalt-1934-2024-numerisk
  affiliation[0].source = "belagt";
  fs.writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n");
  console.log("Verified Eidur Molde affiliation upgraded; no identities, positions or strengths modified");
}
