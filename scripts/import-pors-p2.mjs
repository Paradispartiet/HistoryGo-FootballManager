import assert from "node:assert/strict";
import fs from "node:fs";

const PLAYERS_PATH = new URL("../data/football_players.json", import.meta.url);
const CLUBS_PATH = new URL("../data/football_clubs.json", import.meta.url);
const UNLOCKS_PATH = new URL("../data/football_unlocks.json", import.meta.url);

const PLACE_ID = "pors_stadion";
const CLUB_ID = "pors";
const SOURCE_URL = "https://porsfotball.no/historie";

const records = [
  // Tidlige A-lags-/landslagsprofiler eksplisitt omtalt i klubbhistorikken.
  { name: "Aksel Fjeld", era: "historical", positions: ["GK"] },
  { name: "Erling Olsen", era: "historical" },
  { name: "Leif Lindstad", era: "historical" },
  { name: "Frank Olsen", era: "historical" },
  { name: "Karl Skifjeld", era: "historical" },
  { name: "Einar «Jeisen» Gundersen", era: "historical" },
  { name: "Morten Røed", era: "historical" },
  { name: "Kjell Gundersen", era: "historical" },
  { name: "Arnold Johannesen", era: "historical" },

  // A-laget som sikret opprykket til toppserien mot Stag i 1969.
  ...[
    "Kjell Madsen", "Kåre Bergstrøm", "Asbjørn Marthinsen", "Arild Weholt",
    "Jan Magnussen", "Ragnar Numme", "Svein Halvorsen", "Kai Gulliksen",
    "Thor Halvorsen", "John E. Odden", "Øystein Numme", "Roy Elseth",
    "Rolf Nilsen", "Rolf Askedalen", "Basse Hansen", "Thorbjørn Gravklev"
  ].map((name) => ({ name, era: "historical" })),

  // Det ubeseirede opprykkslaget fra 1988, eksplisitt listet av klubben.
  ...[
    "Per William Nilssen", "Espen Gundersen", "Terje Isaksen", "Bent Tommy Larsen",
    "Terje Bråthen", "Hans Olav Berge", "Tor Arne Stølan", "Erik Skretveidt",
    "Jon Arve Olsen", "Arvid Tveit", "Jarle Steen", "Einar Rossbach",
    "Birger Kittilsen", "Kjell Inge Davik", "Gøran Heimdahl", "Terje Bordi",
    "Peter Aam", "Jarle Rognlien", "Erik Wickmann", "Tor Dreyer"
  ].map((name) => ({ name, era: "historical" })),

  // Opprykksstallen fra 2003, eksplisitt listet av klubben.
  ...[
    "John Erling Kleppe", "Fredrik Nordkvelle", "Svein Roger Dahlen", "Frode Klingberg",
    "Marius Solberg", "Bård Andre Nilssen", "Erik Pedersen", "Thomas Bråthen",
    "Sandro Occhipinti", "Vetle Odden", "Torkild Lorentzen", "Knut Stian Knutsen",
    "Kjell Gunnar Ildhusøy", "Ole Halvor Kolstad", "Tore Arne Sannerholt",
    "Trond Viggo Toresen", "Jan Erik Suarez", "Terje Isaksen", "Christer Fjellstad"
  ].map((name) => ({ name, era: "modern" }))
];

const normalizeName = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/æ/g, "ae")
  .replace(/ø/g, "o")
  .replace(/å/g, "a")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const toId = (name) => normalizeName(name).replace(/ /g, "_");

const deduped = [];
const seenSourceNames = new Set();
for (const record of records) {
  const key = normalizeName(record.name);
  if (seenSourceNames.has(key)) continue;
  seenSourceNames.add(key);
  deduped.push(record);
}
assert.equal(deduped.length, 63, `forventet 63 unike Pors-navn, fikk ${deduped.length}`);

const playerData = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf8"));
const clubData = JSON.parse(fs.readFileSync(CLUBS_PATH, "utf8"));
const unlockData = JSON.parse(fs.readFileSync(UNLOCKS_PATH, "utf8"));
const players = playerData.players || [];
const clubs = clubData.clubs || [];
const placeUnlocks = unlockData.placeUnlocks || [];

const club = clubs.find((entry) => entry.id === CLUB_ID);
assert.ok(club, "Pors mangler i football_clubs.json");

const byNormalizedName = new Map();
for (const player of players) {
  const key = normalizeName(player.name);
  const list = byNormalizedName.get(key) || [];
  list.push(player);
  byNormalizedName.set(key, list);
}

// Eksisterende profiler kobles bare etter eksplisitt identitetskontroll.
// Alle fire er verifisert mot Pors-historikken og ekstern karrierehistorikk/NFF.
const LINK_IDS = new Map([
  [normalizeName("Einar Rossbach"), "einar_rossbach"],
  [normalizeName("Fredrik Nordkvelle"), "fredrik_nordkvelle"],
  [normalizeName("Erik Pedersen"), "erik_pedersen"],
  [normalizeName("Christer Fjellstad"), "christer_fjellstad"]
]);

const collisions = [];
for (const record of deduped) {
  const key = normalizeName(record.name);
  const existing = byNormalizedName.get(key) || [];
  if (!existing.length) continue;
  const chosenId = LINK_IDS.get(key);
  if (!chosenId || !existing.some((player) => player.id === chosenId)) {
    collisions.push({
      sourceName: record.name,
      candidates: existing.map((player) => ({
        id: player.id,
        name: player.name,
        sourcePlaceIds: player.sourcePlaceIds || [],
        clubAffiliations: player.clubAffiliations || []
      }))
    });
  }
}
if (collisions.length) {
  console.error("PORS_IDENTITY_COLLISIONS");
  console.error(JSON.stringify(collisions, null, 2));
  process.exit(42);
}

const addedIds = [];
const linkedIds = [];
for (const record of deduped) {
  const key = normalizeName(record.name);
  const existing = byNormalizedName.get(key) || [];
  let player = null;
  if (existing.length) {
    player = existing.find((entry) => entry.id === LINK_IDS.get(key));
    assert.ok(player, `${record.name}: eksplisitt lenke mangler`);
    linkedIds.push(player.id);
  } else {
    let id = toId(record.name);
    if (players.some((entry) => entry.id === id)) id = `${id}_pors`;
    player = {
      id,
      name: record.name,
      nationality: "Norge",
      era: record.era,
      eraSource: "belagt",
      sourcePlaceIds: [],
      // Canonical grunnnivå for en seniorprofil uten eget nivåbelegg. Dette er
      // teknisk baseline, ikke en kildepåstand om hvor god personen var.
      classHeight: 79,
      classSource: "utledet",
      naturalPositions: record.positions || [],
      usablePositions: [],
      poorFits: [],
      archetypeIds: [],
      archetypes: [],
      strengths: [],
      needs: [],
      preferredRoles: [],
      likesTactics: [],
      dislikesTactics: [],
      warningWhenMisused: record.positions?.length
        ? "Ingen individuelle styrker er lagt til uten kildebelegg."
        : "Posisjon og individuelle styrker er ikke kildebelagt i Pors-historikken.",
      clubStatus: {},
      clubStatusSource: {},
      clubAffiliations: []
    };
    players.push(player);
    byNormalizedName.set(key, [player]);
    addedIds.push(player.id);
  }

  player.sourcePlaceIds = [...new Set([...(player.sourcePlaceIds || []), PLACE_ID])];
  player.clubStatus = { ...(player.clubStatus || {}), [PLACE_ID]: "club_profile" };
  player.clubStatusSource = { ...(player.clubStatusSource || {}), [PLACE_ID]: "belagt" };
}

club.homePlaceId = PLACE_ID;

const unlockIds = deduped.map((record) => {
  const key = normalizeName(record.name);
  const candidates = byNormalizedName.get(key) || [];
  const linkedId = LINK_IDS.get(key);
  const player = linkedId ? candidates.find((entry) => entry.id === linkedId) : candidates[0];
  assert.ok(player, `${record.name}: finner ikke canonical spiller etter import`);
  return player.id;
});

const existingUnlockIndex = placeUnlocks.findIndex((entry) => entry.placeId === PLACE_ID);
const unlockEntry = {
  placeId: PLACE_ID,
  placeName: "Pors Stadion",
  placeRole: "historical_club_ground_source",
  notes: `Klubbanlegg: Pors' hjemmebane i Porsgrunn. Spillerutvalget er kildebåret fra klubbens egen 105-årshistorie (${SOURCE_URL}); juniorlag uten eksplisitt seniorbelegg er ikke importert.`,
  unlocks: unlockIds.map((targetId) => ({ type: "player_candidate", targetId }))
};
if (existingUnlockIndex >= 0) placeUnlocks[existingUnlockIndex] = unlockEntry;
else placeUnlocks.push(unlockEntry);

playerData.players = players;
clubData.clubs = clubs;
unlockData.placeUnlocks = placeUnlocks;
fs.writeFileSync(PLAYERS_PATH, `${JSON.stringify(playerData, null, 2)}\n`);
fs.writeFileSync(CLUBS_PATH, `${JSON.stringify(clubData, null, 2)}\n`);
fs.writeFileSync(UNLOCKS_PATH, `${JSON.stringify(unlockData, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  source: SOURCE_URL,
  sourceNames: deduped.length,
  added: addedIds.length,
  linked: linkedIds.length,
  addedIds,
  linkedIds
}, null, 2));
