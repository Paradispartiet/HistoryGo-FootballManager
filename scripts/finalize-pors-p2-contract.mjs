import assert from "node:assert/strict";
import fs from "node:fs";

const simPath = new URL("./simulate-club-squad.mjs", import.meta.url);
const docsPath = new URL("../docs/klubbvalg.md", import.meta.url);
const clubsPath = new URL("../data/football_clubs.json", import.meta.url);
const playersPath = new URL("../data/football_players.json", import.meta.url);

// Canonical v5 sier allerede at clubAffiliations er medlemskap og sourcePlaceIds
// er oppdagelsessted. Den gamle likhetsvakten krevde likevel at eksplisitt pool
// og legacy place-status hadde samme størrelse, og gjorde dermed legacy-feltet
// canonical igjen. Krysskoblinger skal kunne finnes bare i clubAffiliations.
let sim = fs.readFileSync(simPath, "utf8");
const oldBlock = `// Kompatibilitetsfunksjonen må ikke gå tilbake til sourcePlaceIds heller.\nfor (const club of clubs.filter((entry) => entry.homePlaceId)) {\n  const explicit = listClubPoolPlayers({ clubId: club.id, players });\n  const legacy = listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players });\n  check(\`${'${club.name}'}: legacy place-status og eksplisitt pool har samme størrelse etter migreringen\`,\n    explicit.length === legacy.length, \`${'${explicit.length}'}/${'${legacy.length}'}\`);\n}\n`;
const newBlock = `// Kompatibilitetsfunksjonen må ikke gå tilbake til sourcePlaceIds heller.\n// Legacy place-status er nå bare en migreringsbro: alle legacy-medlemmer må\n// finnes i den eksplisitte poolen, men en kildeverifisert krysskobling kan være\n// eksplisitt medlemskap uten å omskrive spillerens gamle oppdagelsessted.\nfor (const club of clubs.filter((entry) => entry.homePlaceId)) {\n  const explicit = listClubPoolPlayers({ clubId: club.id, players });\n  const explicitIds = new Set(explicit.map((player) => player.id));\n  const legacy = listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players });\n  check(\`${'${club.name}'}: legacy place-status er delmengde av eksplisitt pool\`,\n    legacy.every((player) => explicitIds.has(player.id)),\n    legacy.filter((player) => !explicitIds.has(player.id)).map((player) => player.id).join(\", \"));\n  check(\`${'${club.name}'}: eksplisitt pool kan ikke være mindre enn legacy\`,\n    explicit.length >= legacy.length, \`${'${explicit.length}'}/${'${legacy.length}'}\`);\n}\n`;
assert.ok(sim.includes(oldBlock) || sim.includes(newBlock), "fant ikke legacy/explicit-vakten i club-squad-simuleringen");
if (sim.includes(oldBlock)) {
  sim = sim.replace(oldBlock, newBlock);
  fs.writeFileSync(simPath, sim);
}

const clubs = JSON.parse(fs.readFileSync(clubsPath, "utf8")).clubs || [];
const players = JSON.parse(fs.readFileSync(playersPath, "utf8")).players || [];
const pors = clubs.find((club) => club.id === "pors");
assert.ok(pors?.playerPoolStatus === "ready" && pors.playerPoolSize === 63, `Pors-pool ikke 63/ready: ${JSON.stringify(pors)}`);
const affiliationCount = players.reduce((sum, player) => sum + (player.clubAffiliations || []).length, 0);
const multiClubCount = players.filter((player) => (player.clubAffiliations || []).length >= 2).length;
const readyWithGround = clubs.filter((club) => club.playerPoolStatus === "ready" && club.homePlaceId).length;

let docs = fs.readFileSync(docsPath, "utf8");
if (!docs.includes("| Pors | Pors stadion | 63 |")) {
  const marker = "| KFUM Oslo | KFUM Arena | 66 |\n";
  assert.ok(docs.includes(marker), "fant ikke Pors-innsettingspunkt i klubbarvtabellen");
  docs = docs.replace(marker, `${marker}| Pors | Pors stadion | 63 |\n`);
}
docs = docs.replace("Åsane, Jerv, Notodden", "Åsane, Jerv, Pors, Notodden");
docs = docs.replace(/— \d+ arveplasser fordelt på\nalle \d+,/, `— ${affiliationCount} arveplasser fordelt på\nalle ${readyWithGround},`);
docs = docs.replace(/Summen er \*plasser\*, ikke personer: \d+ spillere står på to eller flere baner/, `Summen er *plasser*, ikke personer: ${multiClubCount} spillere står på to eller flere baner`);

const crosslinkNote = "En kildeverifisert krysskobling trenger derfor ikke å få et nytt `sourcePlaceId`: klubbmedlemskapet kan ligge bare i `clubAffiliations`, mens klubbens stadion-unlock åpner hele den eksplisitte poolen. Dette bevarer eldre, frosne kildepass uten å duplisere samme person.";
if (!docs.includes(crosslinkNote)) {
  const tableMarker = "\n| Klubb | Bane | Historiske spillere |";
  assert.ok(docs.includes(tableMarker), "fant ikke klubbarvtabellen i klubbvalg-docs");
  docs = docs.replace(tableMarker, `\n\n${crosslinkNote}\n${tableMarker}`);
}
fs.writeFileSync(docsPath, docs);

console.log(JSON.stringify({
  ok: true,
  porsPool: pors.playerPoolSize,
  affiliations: affiliationCount,
  multiClubPlayers: multiClubCount,
  readyWithGround
}, null, 2));
