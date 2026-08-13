import assert from "node:assert/strict";
import fs from "node:fs";

const playersPath = new URL("../data/football_players.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
const players = Array.isArray(data.players) ? data.players : [];
const byId = new Map(players.map((player) => [player.id, player]));

// Kun posisjoner som kan belegges utover Pors' navneliste. Dette er akkurat
// nok til at klubbens 15-manns grunntropp kan være en faktisk fotballtropp;
// resten står uten posisjon fremfor å bli gjettet.
//
// Posisjonskilder kontrollert i denne migrasjonen:
// - Pors-historikken: Aksel Fjeld omtales som keeper.
// - NFF: identitet/klubbhistorikk for Rossbach, Nordkvelle og Sannerholt.
// - Transfermarkt/worldfootball/Aftenposten: Dahlen GK, Marius Solberg forsvar/
//   Pors-back, Torkild Lorentzen CB, Christer Fjellstad CB, Kleppe/Nordkvelle/
//   Sannerholt/Toresen/Suarez/Ildhusøy midtbane, Occhipinti RW, Kolstad og
//   Bård Andre Nilssen spiss.
const evidence = new Map([
  ["aksel_fjeld", ["GK"]],
  ["einar_rossbach", ["GK"]],
  ["svein_roger_dahlen", ["GK"]],

  // Solberg omtales som Pors-back og er dokumentert som forsvarer; RB er
  // normaliseringen som matcher katalogens posisjonsvokabular.
  ["marius_solberg", ["RB"]],
  ["torkild_lorentzen", ["CB"]],
  ["christer_fjellstad", ["CB"]],

  ["fredrik_nordkvelle", ["CM", "AM"]],
  ["tor_arne_sannerholt", ["CM"]],
  ["john_erling_kleppe", ["CM"]],
  ["trond_viggo_toresen", ["CM"]],
  ["jan_erik_suarez", ["CM"]],
  ["kjell_gunnar_ildhusoy", ["CM"]],

  ["sandro_occhipinti", ["RW"]],
  ["ole_halvor_kolstad", ["ST"]],
  ["bard_andre_nilssen", ["ST"]]
]);

for (const [id, positions] of evidence) {
  const player = byId.get(id);
  assert.ok(player, `Pors-posisjon: mangler canonical spiller ${id}`);
  player.naturalPositions = [...new Set([...(player.naturalPositions || []), ...positions])];
}

// Bevis selve minimumsdekningen på de kildebelagte Pors-spillerne før den
// generelle club-squad-simuleringen kjører.
const porsPlayers = players.filter((player) =>
  (player.clubStatus && player.clubStatus.pors_stadion) ||
  (player.clubAffiliations || []).some((entry) => entry.clubId === "pors")
);
const positionsOf = (player) => new Set([...(player.naturalPositions || []), ...(player.usablePositions || [])]);
const count = (allowed) => porsPlayers.filter((player) => [...positionsOf(player)].some((position) => allowed.includes(position))).length;
assert.ok(count(["GK"]) >= 1, "Pors-posisjoner: mangler keeper");
assert.ok(count(["CB", "LB", "RB", "WB"]) >= 3, "Pors-posisjoner: mangler tre forsvarere");
assert.ok(count(["DM", "CM", "AM"]) >= 3, "Pors-posisjoner: mangler tre midtbanespillere");
assert.ok(count(["ST", "LW", "RW"]) >= 3, "Pors-posisjoner: mangler tre angrepsspillere");

fs.writeFileSync(playersPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, reviewed: evidence.size, porsPool: porsPlayers.length }, null, 2));
