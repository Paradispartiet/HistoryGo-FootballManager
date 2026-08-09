// Klubbvalget bestemmer spillerpoolen; banen bestemmer hvor mye av den som åpnes.
//
// Å ta over Rosenborg skal ikke dele ut hele Eggens lag, men en automatisk
// grunntropp skal heller aldri fylles med tilfeldige spillere fra andre klubber.
// Uten Lerkendal får du et spillbart gulv fra Rosenborg-poolen. Med Lerkendal
// åpnes hele den historiske klubbpoolen og manageren velger selv.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  listClubHeritagePlayers, hasVisitedClubGround, buildClubBaseSquad, resolveClubSquadAccess, clubStatusRank, clubStatusFor
} from "../src/football-club-squad.js";

const clubs = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8")).clubs;
const players = JSON.parse(fs.readFileSync(new URL("../data/football_players.json", import.meta.url), "utf8")).players;
const placeUnlocks = JSON.parse(fs.readFileSync(new URL("../data/football_unlocks.json", import.meta.url), "utf8")).placeUnlocks || [];

const placeIds = new Set(placeUnlocks.map((place) => place.placeId));
const nationalPlaceIds = new Set(placeUnlocks.filter((place) => String(place.placeRole).includes("national")).map((place) => place.placeId));
const clubCandidateIds = new Set(
  players.filter((player) => !(player.sourcePlaceIds || []).some((id) => nationalPlaceIds.has(id))).map((player) => player.id)
);
const byId = new Map(clubs.map((club) => [club.id, club]));
const REQUIRED = 15;

let checks = 0;
const check = (name, condition, detail = "") => {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
};

// ---------------------------------------------------------------------------
// 1. Koblingen klubb → bane peker på steder som finnes
// ---------------------------------------------------------------------------
const withGround = clubs.filter((club) => club.homePlaceId);
check("noen klubber er koblet til en bane", withGround.length >= 5, String(withGround.length));
for (const club of withGround) {
  check(`${club.name}: homePlaceId finnes som sted`, placeIds.has(club.homePlaceId), club.homePlaceId);
  check(`${club.name}: banen er ikke en landslagsarena`, !nationalPlaceIds.has(club.homePlaceId), club.homePlaceId);
}
check("ingen to klubber deler bane", new Set(withGround.map((club) => club.homePlaceId)).size === withGround.length);

// Og stedet må hete det klubben sier at banen heter.
//
// `bryne_stadion` ble opprettet med navnet «Melløs stadion» og Moss' notat,
// fordi importskriptet var kopiert fra Moss-importen og bare id-en ble byttet.
// Id-en var riktig, klubbkoblingen var riktig, alle 68 spillerne var riktige —
// og spilleren som besøkte Bryne stadion fikk se «Melløs stadion». Det gikk
// gjennom hele suiten og ut på main, fordi ingen vakt sammenlignet NAVNET på
// stedet med noe som helst.
//
// To krav, og det andre er det som fanger nettopp denne feilen: to steder kan
// ikke hete det samme.
{
  const forenkle = (value) => String(value).toLowerCase()
    .replace(/stadion|arena|park|idrettsanlegg|kunstgress|campus/g, " ")
    .replace(/[^a-zà-ÿ]/g, "").trim();
  for (const club of withGround) {
    const place = placeUnlocks.find((entry) => entry.placeId === club.homePlaceId);
    if (!place) continue;
    check(`${club.name}: stedet heter det banen heter`,
      forenkle(place.placeName) === forenkle(club.ground)
      || forenkle(club.homePlaceId).includes(forenkle(club.ground))
      || forenkle(club.ground).includes(forenkle(place.placeName)),
      `${club.ground} mot «${place.placeName}»`);
  }
  const navn = new Map();
  const delte = [];
  for (const place of placeUnlocks) {
    if (navn.has(place.placeName)) delte.push(`${navn.get(place.placeName)} / ${place.placeId} = ${place.placeName}`);
    navn.set(place.placeName, place.placeId);
  }
  check("ingen to steder deler navn", delte.length === 0, delte.join(" · "));
}

// Et sted som låser opp en spiller må stå i spillerens EGNE sourcePlaceIds.
// Ellers lyver stedet: unlocken lover en spiller som aldri dukker opp som
// klubbarv, fordi arven leses fra spilleren. Gikk rett på den da Brede
// Hangeland ble lagt til Vikings bane mens han bare pekte på Ullevaal.
const playerById = new Map(players.map((player) => [player.id, player]));
for (const place of placeUnlocks) {
  for (const unlock of place.unlocks || []) {
    if (!/player/.test(unlock.type || "")) continue;
    const player = playerById.get(unlock.targetId);
    check(`${place.placeId}: «${unlock.targetId}» finnes i spillerkatalogen`, Boolean(player));
    if (!player) continue;
    check(`${place.placeId}: «${player.name}» peker tilbake på stedet`,
      (player.sourcePlaceIds || []).includes(place.placeId),
      (player.sourcePlaceIds || []).join(", "));
  }
}

// Og motsatt vei: en klubbs arvespillere må faktisk låses opp av banen, ellers
// er de synlige i lista men ikke samlebare.
for (const club of clubs.filter((entry) => entry.homePlaceId)) {
  const place = placeUnlocks.find((entry) => entry.placeId === club.homePlaceId);
  const unlocked = new Set((place?.unlocks || []).filter((u) => /player/.test(u.type || "")).map((u) => u.targetId));
  for (const player of listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players })) {
    check(`${club.name}: «${player.name}» låses faktisk opp av banen`, unlocked.has(player.id));
  }
}

// ---------------------------------------------------------------------------
// 2. Arven utledes av data som allerede fantes
//
// `sourcePlaceIds` knyttet allerede spillere til steder. Ingen ny liste er
// laget, og ingen påstand om hvilken klubb en ekte spiller «egentlig» tilhørte
// utover det stedet dataene allerede sier.
// ---------------------------------------------------------------------------
const rosenborg = byId.get("rosenborg");
const heritage = listClubHeritagePlayers({ homePlaceId: rosenborg.homePlaceId, players });
check("Rosenborg har historiske spillere på Lerkendal", heritage.length >= REQUIRED, String(heritage.length));
check("alle er faktisk knyttet til Lerkendal", heritage.every((player) => player.sourcePlaceIds.includes("lerkendal_stadion")));
check("lista er sortert sterkest først", heritage.every((player, i) => i === 0 || player.classHeight <= heritage[i - 1].classHeight));
check("uten bane finnes ingen arv", listClubHeritagePlayers({ homePlaceId: null, players }).length === 0);

// ---------------------------------------------------------------------------
// 3. Gaten: klubbvalget bestemmer poolen, banen bestemmer dybden
// ---------------------------------------------------------------------------
check("besøkt bane gir tilgang", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: ["lerkendal_stadion"] }) === true);
check("ubesøkt bane gir ikke full tilgang", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: ["brann_stadion"] }) === false);
check("et annet stadion åpner ikke Lerkendal", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: ["aspmyra_stadion", "aker_stadion"] }) === false);
check("tom progresjon gir ikke full tilgang", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: [] }) === false);

const visited = resolveClubSquadAccess({ club: rosenborg, players, unlockedPlaceIds: ["lerkendal_stadion"], candidateIds: clubCandidateIds, squadSize: REQUIRED });
const notVisited = resolveClubSquadAccess({ club: rosenborg, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });

check("besøkt bane gir arvemodus", visited.mode === "heritage");
check("besøkt bane lister hele klubbpoolen", visited.heritage.length === heritage.length, String(visited.heritage.length));
check("besøkt bane deler ikke ut en ferdig tropp", visited.baseSquad.length === 0);
check("besøkt bane sier at DU velger", /velge blant|plukker selv/.test(`${visited.headline} ${visited.detail}`));

check("ubesøkt bane gir grunntropp", notVisited.mode === "base");
check("grunntroppen er full", notVisited.baseSquad.length === REQUIRED, String(notVisited.baseSquad.length));
check("ubesøkt bane lister ikke hele arven som valgfri", notVisited.heritage.length === 0);
const heritageIds = new Set(heritage.map((player) => player.id));
check("grunntroppen består BARE av klubbens egne spillere",
  notVisited.baseSquad.every((id) => heritageIds.has(id)),
  notVisited.baseSquad.filter((id) => !heritageIds.has(id)).join(", "));
check("låst-tallet er resten av klubbpoolen",
  notVisited.lockedCount === heritage.length - notVisited.baseSquad.length,
  `${notVisited.lockedCount} mot ${heritage.length - notVisited.baseSquad.length}`);
check("og den sier hva du må gjøre", notVisited.todo.some((line) => line.includes(rosenborg.ground)), notVisited.todo.join(" | "));
check("teksten sier at grunntroppen kommer fra klubbens pool", /egen spillerpool|registrert på denne klubben/.test(`${notVisited.detail} ${notVisited.todo.join(" ")}`));

// ---------------------------------------------------------------------------
// 4. Grunntroppen er et GULV i klubbpoolen, ikke en global snarvei
// ---------------------------------------------------------------------------
const squadPlayers = notVisited.baseSquad.map((id) => players.find((player) => player.id === id));
check("grunntroppen er spillbar: minst én keeper", squadPlayers.some((player) => [...player.naturalPositions, ...(player.usablePositions || [])].includes("GK")));
for (const [label, positions] of [["forsvar", ["CB", "LB", "RB", "WB"]], ["midtbane", ["DM", "CM", "AM"]], ["angrep", ["ST", "LW", "RW"]]]) {
  const count = squadPlayers.filter((player) => [...player.naturalPositions, ...(player.usablePositions || [])].some((pos) => positions.includes(pos))).length;
  check(`grunntroppen dekker ${label}`, count >= 3, String(count));
}
const eligibleHeritage = heritage.filter((player) => clubCandidateIds.has(player.id));
const pool = eligibleHeritage.length >= REQUIRED ? eligibleHeritage : heritage;
const poolIds = new Set(pool.map((player) => player.id));
check("kandidatfilter kan bare snevre inn klubbpoolen",
  squadPlayers.every((player) => poolIds.has(player.id)),
  squadPlayers.filter((player) => !poolIds.has(player.id)).map((player) => player.name).join(", "));
if (eligibleHeritage.length >= REQUIRED) {
  check("grunntroppen deler ikke ut landslagsarena-spillere når klubbpoolen er stor nok",
    !squadPlayers.some((player) => (player.sourcePlaceIds || []).some((id) => nationalPlaceIds.has(id))));
}
// Og den skal favorisere de jevneste i KLUBBPOOLEN, ikke toppsjiktet.
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const squadAvg = mean(squadPlayers.map((player) => player.classHeight));
const poolAvg = mean(pool.map((player) => player.classHeight));
check("grunntroppen ligger UNDER snittet i klubbpoolen", squadAvg < poolAvg, `${squadAvg.toFixed(2)} mot ${poolAvg.toFixed(2)}`);
const floor = Math.min(...pool.map((player) => player.classHeight));
check("grunntroppen ligger nærmere klubbpoolens gulv enn snittet",
  squadAvg - floor < poolAvg - squadAvg,
  `snitt ${squadAvg.toFixed(2)}, gulv ${floor}, pool ${poolAvg.toFixed(2)}`);

// ---------------------------------------------------------------------------
// 5. Ingen klubb blir en blindvei — og ingen klubb med pool får fremmede navn
// ---------------------------------------------------------------------------
for (const club of clubs) {
  const cold = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });
  check(`${club.name}: gir spillere uten noen History Go-progresjon`,
    cold.mode === "heritage" ? cold.heritage.length > 0 : cold.baseSquad.length === REQUIRED,
    `${cold.mode} / ${cold.baseSquad.length}`);
  check(`${club.name}: forklarer hva du får`, Boolean(cold.headline && cold.detail && cold.todo.length));

  if (club.homePlaceId) {
    const clubPool = new Set(listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players }).map((player) => player.id));
    check(`${club.name}: klubbpoolen er stor nok til grunntropp`, clubPool.size >= REQUIRED, String(clubPool.size));
    check(`${club.name}: automatisk tropp inneholder bare dokumenterte klubbspillere`,
      cold.baseSquad.every((id) => clubPool.has(id)),
      cold.baseSquad.filter((id) => !clubPool.has(id)).map((id) => playerById.get(id)?.name || id).join(", "));
  }
}
// Også for en klubb uten bane i History Go — den skal si det rett ut.
//
// Denne sto med Skeid navngitt som eksempelet, og så fikk Skeid bane. Da feilet
// vakten fordi ARBEIDET LYKTES, ikke fordi noe var galt — samme utløpte premiss
// som klubbstatus-andelen hadde. En vakt skal lese dataene, ikke bære en klubb
// som antakelse.
//
// Kravet går nå begge veier, og den andre halvdelen er den som består når
// pyramiden en dag er komplett: en klubb MED bane skal aldri si at den mangler
// en.
const uten = clubs.filter((club) => !club.homePlaceId);
const med = clubs.filter((club) => club.homePlaceId);
check("det finnes fortsatt klubber uten bane å måle på", uten.length > 0, String(uten.length));
for (const club of uten) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });
  check(`${club.name} uten bane sier det rett ut`, /ingen bane i History Go/.test(access.headline), access.headline);
  check(`${club.name} uten bane får likevel en tropp`, access.baseSquad.length === REQUIRED,
    String(access.baseSquad.length));
}
for (const club of med) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });
  check(`${club.name} med bane påstår ikke at den mangler en`,
    !/ingen bane i History Go/.test(access.headline), access.headline);
}

// ---------------------------------------------------------------------------
// 5b. Dokumentasjonen må stemme med dataene
//
// Arvetabellen i docs/klubbvalg.md har drevet fra dataene tre ganger: et
// redigeringsskript avbrøt midtveis, en delvis redigering ga Rosenborg to rader,
// og HamKam sto både med 26 spillere og i «ingen navn ennå»-raden. Ingenting
// feilet — dokumentasjon leses ikke av noen vakt.
//
// Nå gjør den det. Hver klubb med navn i tabellen må ha nøyaktig det antallet i
// dataene, ingen klubb kan stå to ganger, og en klubb med spillere kan ikke
// samtidig stå oppført som tom.
{
  const docs = fs.readFileSync(new URL("../docs/klubbvalg.md", import.meta.url), "utf8");
  const table = docs.slice(docs.indexOf("| Klubb | Bane | Historiske spillere |"));
  const rows = [...table.matchAll(/^\| ([^|]+?) \| ([^|]+?) \| (\d+) \|$/gm)].map((m) => ({
    clubs: m[1].split(",").map((x) => x.trim()), count: Number(m[3])
  }));
  check("arvetabellen i docs finnes og har rader", rows.length >= 10, String(rows.length));

  const named = rows.filter((row) => row.count > 0);
  const listedTwice = named.flatMap((row) => row.clubs).filter((name, i, all) => all.indexOf(name) !== i);
  check("ingen klubb står to ganger i arvetabellen", listedTwice.length === 0, listedTwice.join(", "));

  const heritageByName = new Map(clubs.filter((club) => club.homePlaceId).map((club) =>
    [club.name, listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players }).length]));
  for (const row of named) {
    for (const name of row.clubs) {
      check(`docs: «${name}» er en klubb med bane`, heritageByName.has(name), name);
      if (!heritageByName.has(name)) continue;
      check(`docs: ${name} står med ${row.count} arvespillere`, heritageByName.get(name) === row.count,
        `dataene sier ${heritageByName.get(name)}`);
    }
  }
  // Og null-raden må faktisk være tom i dataene.
  for (const row of rows.filter((entry) => entry.count === 0)) {
    for (const name of row.clubs) {
      if (!heritageByName.has(name)) continue;
      check(`docs: ${name} er oppført som tom og er det`, heritageByName.get(name) === 0,
        `dataene sier ${heritageByName.get(name)}`);
    }
  }

  // Med Sandefjord inne er null-raden borte, og løkka over sjekker ingenting.
  // En vakt som går tom når feilen den beskytter mot forsvinner, slutter å
  // beskytte — den *neste* klubben med bane kan da legges inn uten at tabellen
  // nevner den. Så snu kravet: hver klubb med bane må stå i tabellen.
  const listed = new Set(rows.flatMap((row) => row.clubs));
  const mangler = [...heritageByName.keys()].filter((name) => !listed.has(name));
  check("alle klubber med bane står i arvetabellen", mangler.length === 0, mangler.join(", "));
  check("arvetabellen dekker like mange klubber som dataene",
    listed.size === heritageByName.size, `docs ${listed.size} mot data ${heritageByName.size}`);
}

// ---------------------------------------------------------------------------
// 5c. Klubbstatus følger med arven — fra dataene, ikke fra en egen motor
// ---------------------------------------------------------------------------
const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
// Statusen lå en periode i to parallelle profilmotorer med hardkodede
// navnelister. Den bor på spilleren nå, og arven skal bære den videre uten at
// klubbtroppmotoren eier en eneste spiller.
for (const club of clubs.filter((entry) => entry.homePlaceId)) {
  const heritage = listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players });
  if (heritage.length === 0) continue;
  check(`${club.name}: alle arvespillere har klubbstatus for DENNE banen`,
    heritage.every((player) => clubStatusFor(player, club.homePlaceId)),
    heritage.filter((player) => !clubStatusFor(player, club.homePlaceId)).map((player) => player.name).join(", "));
  // Sorteringen: klassehøyde først, status som skille ved likhet.
  check(`${club.name}: arven er sortert på klassehøyde først`,
    heritage.every((player, i) => i === 0 || num(player.classHeight) <= num(heritage[i - 1].classHeight)));
  for (let i = 1; i < heritage.length; i += 1) {
    if (num(heritage[i].classHeight) !== num(heritage[i - 1].classHeight)) continue;
    check(`${club.name}: lik klassehøyde skilles av status`,
      clubStatusRank(heritage[i], club.homePlaceId) <= clubStatusRank(heritage[i - 1], club.homePlaceId));
  }
}

// Og motoren skal ikke lenger importere noen spillerkatalog.
const squadSource = fs.readFileSync(new URL("../src/football-club-squad.js", import.meta.url), "utf8");
check("klubbtroppmotoren importerer ingen profilkatalog",
  !/player-profiles/.test(squadSource));

// ---------------------------------------------------------------------------
// 6. Motoren rører aldri History Go-progresjonen
// ---------------------------------------------------------------------------
const engineSource = fs.readFileSync(new URL("../src/football-club-squad.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("motoren er ren", !/document|localStorage|fetch\(|Date\.now|Math\.random/.test(engineSource));
check("motoren skriver ikke til History Go", !/visited_places|hg_groundhopper_stats/.test(engineSource));
check("motoren hardkoder ingen spillere", !players.slice(0, 20).some((player) => engineSource.includes(player.name)));

// Determinisme: samme input, samme tropp.
assert.deepEqual(
  buildClubBaseSquad({ players, candidateIds: clubCandidateIds, size: REQUIRED }),
  buildClubBaseSquad({ players, candidateIds: clubCandidateIds, size: REQUIRED }),
  "grunntroppen er ikke deterministisk"
);
checks += 1;

// Og at app.js faktisk bruker gaten.
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app.js løser klubbens spillertilgang", /resolveClubSquadAccess\(/.test(app));
check("app.js leser besøkte steder fra History Go", /unlockedPlaceIds: getHistoryGoCollectedSportPlaceIds\(\)/.test(app));
check("app.js viser tilgangen i klubbvalget", /access\.headline/.test(app));
check("app.js aktiverer grunntroppen ved overtakelse uten besøk", /access\?\.mode === "base"/.test(app));

console.log(JSON.stringify({
  ok: true, sjekker: checks,
  klubberMedBane: withGround.length,
  arvePerKlubb: Object.fromEntries(withGround.map((club) => [club.name, listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players }).length])),
  rosenborg: {
    utenLerkendal: `${notVisited.baseSquad.length} i klubbens grunntropp, ${notVisited.lockedCount} gjenstår`,
    medLerkendal: `${visited.heritage.length} historiske spillere å velge blant`
  }
}, null, 2));
