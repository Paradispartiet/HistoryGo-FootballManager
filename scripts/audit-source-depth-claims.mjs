// Permanent source-depth audit.
//
// Dette laget skal aldri bli en bakdør for modellerte spillerattributter.
// Hver post må være en eksisterende profil uten P1/P2-eierskap, med tom rå
// styrkeliste og en eksplisitt sitert ferdighetsbeskrivelse fra en navngitt
// kilde. Overlayet får bare endre `strengths`.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  SOURCE_DEPTH_DOCUMENTED,
  applySourceDepthClaims,
  applySourceDepthClaimsToPlayer
} from "../src/football-player-source-claims-depth.js";
import {
  applyP1SourceClaims,
  getP1HeritageForPlayer
} from "../src/football-player-source-claims-p1.js";
import {
  applyP2SourceClaims,
  getP2SourceRecord
} from "../src/football-player-source-claims-p2.js";

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../data/${file}`, import.meta.url), "utf8"));
const players = read("football_players.json").players;
const validStrengths = new Set(read("football_attributes.json").attributes.map((entry) => entry.id));
const byId = new Map(players.map((player) => [player.id, player]));
const allowedSourceKinds = new Set(["club", "press", "football_editorial", "encyclopedia"]);

let checks = 0;
const ok = (condition, message) => {
  checks += 1;
  assert.ok(condition, message);
};

ok(SOURCE_DEPTH_DOCUMENTED.length > 0, "source-depth-registeret er tomt");
ok(
  new Set(SOURCE_DEPTH_DOCUMENTED.map((entry) => entry.playerId)).size === SOURCE_DEPTH_DOCUMENTED.length,
  "samme spiller står flere ganger i source-depth-registeret"
);

for (const record of SOURCE_DEPTH_DOCUMENTED) {
  const player = byId.get(record.playerId);
  ok(Boolean(player), `${record.playerId}: finnes ikke i canonical spillerkatalog`);
  ok(!getP1HeritageForPlayer(player), `${record.playerId}: tilhører P1 og skal ikke ligge i source-depth`);
  ok(!getP2SourceRecord(player), `${record.playerId}: har P2-post og skal ikke dupliseres i source-depth`);
  ok((player.strengths || []).length === 0, `${record.playerId}: rå styrkeliste må være tom før source-depth`);

  ok(Array.isArray(record.strengths) && record.strengths.length > 0,
    `${record.playerId}: dokumentert post må ha minst én styrke`);
  ok(new Set(record.strengths).size === record.strengths.length,
    `${record.playerId}: duplisert styrketoken`);
  for (const strength of record.strengths) {
    ok(validStrengths.has(strength), `${record.playerId}: ukjent styrketoken ${strength}`);
  }

  ok(/^https:\/\//.test(record.source || ""), `${record.playerId}: kilden må være https`);
  ok(allowedSourceKinds.has(record.sourceKind),
    `${record.playerId}: ukjent sourceKind ${JSON.stringify(record.sourceKind)}`);
  ok(typeof record.claim === "string" && record.claim.length >= 12,
    `${record.playerId}: claim er for kort`);
  ok(/[«"]/.test(record.claim), `${record.playerId}: claim må sitere kilden direkte`);

  const after = applySourceDepthClaimsToPlayer(player);
  assert.deepEqual(
    { ...after, strengths: null },
    { ...player, strengths: null },
    `${record.playerId}: source-depth endret annet enn strengths`
  );
  assert.deepEqual(after.strengths, [...record.strengths],
    `${record.playerId}: source-depth-styrkene kom ikke gjennom`);
}

// Precedence: eldre canonical claims vinner. Source-depth fyller bare reelle hull.
const beforeDepth = applyP2SourceClaims(applyP1SourceClaims(players));
const afterDepth = applySourceDepthClaims(beforeDepth);
const beforeCount = beforeDepth.filter((player) => (player.strengths || []).length > 0).length;
const afterCount = afterDepth.filter((player) => (player.strengths || []).length > 0).length;
ok(afterCount === beforeCount + SOURCE_DEPTH_DOCUMENTED.length,
  `source-depth skulle øke dokumenterte profiler ${beforeCount} -> ${beforeCount + SOURCE_DEPTH_DOCUMENTED.length}, fikk ${afterCount}`);

const ivar = byId.get("ivar_johannes_jakobsen_unhjem");
ok(ivar?.clubAffiliations?.some((entry) => entry.clubId === "junkeren" && entry.source === "belagt"),
  "Ivar Unhjem må ha kildebelagt Junkeren-tilknytning før styrkeclaimet kan brukes");

console.log(JSON.stringify({
  ok: true,
  checks,
  documented: SOURCE_DEPTH_DOCUMENTED.length,
  beforeCount,
  afterCount,
  clubsDeepened: ["junkeren"]
}, null, 2));
