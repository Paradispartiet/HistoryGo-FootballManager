import assert from "node:assert/strict";
import fs from "node:fs";

const PLAYERS_PATH = new URL("../data/football_players.json", import.meta.url);
const CLUBS_PATH = new URL("../data/football_clubs.json", import.meta.url);
const UNLOCKS_PATH = new URL("../data/football_unlocks.json", import.meta.url);

const PLACE_ID = "pors_stadion";
const CLUB_ID = "pors";
const SOURCE_URL = "https://www.pors.no/om-pors/historie/";

const records = [
  // Pors-historikken identifiserer disse som tidlige A-lag/landslagsspillere.
  { name: "Thor Wollebæk", era: "historical" },
  { name: "Erling Norvik", era: "historical" },
  { name: "Aksel Fjeld", era: "historical", positions: ["GK"] },
  { name: "Einar Jeremiassen", era: "historical" },
  // Opprykkslaget 1969.
  ...[
    "Per Andersen", "Gunnar Hidle", "Birger Olausen", "Reidar Stenberg",
    "Thorstein Brattbakk", "Per Inge Holmen", "Jon Arne Juell", "Jan Øverland",
    "Arvid Fjelddalen", "Jan Ragnar Rølland", "Jørgen Dahl", "Ole Bjørnstad",
    "Per Vegard Nilsen", "Roy Gulbrandsen"
  ].map((name) => ({ name, era: "historical" })),
  // Opprykkslaget og reserver 1988.
  ...[
    "Olav Krogsæter", "Bjørn Meland", "Svein Harald Roaas", "Vegard Antonsen",
    "Hans Knutsen", "Christian Møller", "Johan Flaten", "Pål Tangen",
    "Roy Gulbrandsen", "Tormod Coldevin", "Atle Semb", "Ronny Nerland", "Gunnar Holte"
  ].map((name) => ({ name, era: "historical" })),
  // Opprykksstallen 2003.
  ...[
    "Thomas Jacobsen", "Knut Rønningene", "Pål Christian Hansen", "Jonas Holmvåg",
    "Ole Einar Fuglerud", "Espen Holtan", "Einar Sandvand", "Lars Ørbeck",
    "Oskar Sandvand", "Kjetil Moen", "Ove Ås", "Campher Mørk", "Mustafa Abdulla",
    "Tarjei Bugge", "Stian Kristiansen", "Per-Christian Hoppestad", "Kenn Halvorsen",
    "Per Johnny Stigen", "Leif Gunnar Odinsen", "Kjetil Ulvestrand", "Tommy Svendsen",
    "Anders Nygaard", "Hans Roger Bøe"
  ].map((name) => ({ name, era: "modern" })),
  // Andre eksplisitt navngitte A-lagsspillere i klubbhistorikken.
  ...[
    "Ove Eriksen", "Tore Andersen", "Jan Christian Halvorsen", "Bård Antonsen",
    "Henning Kristiansen", "Helge Haugen", "Bo Edin", "Christian Tynnilä"
  ].map((name) => ({ name, era: "modern" })),
  // Klubbhistorikken omtaler disse gjennom landskamp-/kamprekorder.
  { name: "Alf Johansen", era: "historical" },
  { name: "Kåre Fjalestad", era: "historical" }
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

// Eksisterende profiler kobles bare etter en eksplisitt identitetsavgjørelse.
// Første kjøring stopper på samtlige navnekollisjoner og skriver kandidatene til CI-loggen.
const LINK_IDS = new Map([
  // Fylles kun etter positiv kontroll av eksisterende profil mot Pors-kilden.
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
      // 79 er eksisterende canonical grunnnivå for en ukjent seniorprofil;
      // det er teknisk baseline, ikke en ny kildepåstand om ferdighet.
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
  placeName: "Pors stadion",
  placeRole: "historical_club_ground_source",
  notes: `Klubbanlegg: Pors' hjemmebane i Porsgrunn. Spillerutvalget er hentet fra klubbens egen historikk (${SOURCE_URL}).`,
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
