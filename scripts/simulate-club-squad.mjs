// Klubbens historiske spillere ligger på banen, ikke i klubbvalget.
//
// Å ta over Rosenborg skal ikke dele ut Eggens lag. Det skal gi tilgang til
// klubbens historiske spillere — men bare hvis du faktisk har vært på Lerkendal.
// Har du ikke det, får du en automatisk tropp og samler resten selv.
//
// Det er kjernesløyfen brukt PÅ klubbovertakelsen i stedet for å omgå den. Uten
// gaten ville klubbvalget vært den snarveien rundt History Go som hele
// designet er bygget for å unngå.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  listClubHeritagePlayers, hasVisitedClubGround, buildClubBaseSquad, resolveClubSquadAccess, clubStatusRank
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
check("Rosenborg har historiske spillere på Lerkendal", heritage.length >= 5, String(heritage.length));
check("alle er faktisk knyttet til Lerkendal", heritage.every((player) => player.sourcePlaceIds.includes("lerkendal_stadion")));
check("lista er sortert sterkest først", heritage.every((player, i) => i === 0 || player.classHeight <= heritage[i - 1].classHeight));
check("uten bane finnes ingen arv", listClubHeritagePlayers({ homePlaceId: null, players }).length === 0);

// ---------------------------------------------------------------------------
// 3. Gaten: banen avgjør, ikke klubbvalget
// ---------------------------------------------------------------------------
check("besøkt bane gir tilgang", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: ["lerkendal_stadion"] }) === true);
check("ubesøkt bane gir ikke tilgang", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: ["brann_stadion"] }) === false);
check("et annet stadion åpner ikke Lerkendal", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: ["aspmyra_stadion", "aker_stadion"] }) === false);
check("tom progresjon gir ikke tilgang", hasVisitedClubGround({ homePlaceId: "lerkendal_stadion", unlockedPlaceIds: [] }) === false);

const visited = resolveClubSquadAccess({ club: rosenborg, players, unlockedPlaceIds: ["lerkendal_stadion"], candidateIds: clubCandidateIds, squadSize: REQUIRED });
const notVisited = resolveClubSquadAccess({ club: rosenborg, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });

check("besøkt bane gir arvemodus", visited.mode === "heritage");
check("besøkt bane lister klubbens spillere", visited.heritage.length === heritage.length, String(visited.heritage.length));
check("besøkt bane deler ikke ut en ferdig tropp", visited.baseSquad.length === 0);
check("besøkt bane sier at DU velger", /velge blant|plukker selv/.test(`${visited.headline} ${visited.detail}`));

check("ubesøkt bane gir grunntropp", notVisited.mode === "base");
check("grunntroppen er full", notVisited.baseSquad.length === REQUIRED, String(notVisited.baseSquad.length));
check("ubesøkt bane lister ingen arvespillere", notVisited.heritage.length === 0);
check("men den sier hvor mange som er låst", notVisited.lockedCount === heritage.length, String(notVisited.lockedCount));
check("og den sier hva du må gjøre", notVisited.todo.some((line) => line.includes(rosenborg.ground)), notVisited.todo.join(" | "));

// Den viktigste: grunntroppen gir ALDRI bort klubbens historiske navn. Gjorde
// den det, ville gaten vært pynt — du fikk Eggens spillere uten å gå til
// Lerkendal.
const heritageIds = new Set(heritage.map((player) => player.id));
check("grunntroppen inneholder ingen av klubbens historiske spillere",
  !notVisited.baseSquad.some((id) => heritageIds.has(id)),
  notVisited.baseSquad.filter((id) => heritageIds.has(id)).join(", "));

// ---------------------------------------------------------------------------
// 4. Grunntroppen er et GULV, ikke en snarvei
// ---------------------------------------------------------------------------
const squadPlayers = notVisited.baseSquad.map((id) => players.find((player) => player.id === id));
check("grunntroppen er spillbar: minst én keeper", squadPlayers.some((player) => [...player.naturalPositions, ...(player.usablePositions || [])].includes("GK")));
for (const [label, positions] of [["forsvar", ["CB", "LB", "RB", "WB"]], ["midtbane", ["DM", "CM", "AM"]], ["angrep", ["ST", "LW", "RW"]]]) {
  const count = squadPlayers.filter((player) => [...player.naturalPositions, ...(player.usablePositions || [])].some((pos) => positions.includes(pos))).length;
  check(`grunntroppen dekker ${label}`, count >= 3, String(count));
}
// Ingen landslagsarena-spillere: én visit skal ikke sikre en nasjons beste.
check("grunntroppen deler ikke ut landslagsarena-spillere",
  !squadPlayers.some((player) => (player.sourcePlaceIds || []).some((id) => nationalPlaceIds.has(id))));
// Og den skal favorisere de JEVNESTE, ikke toppsjiktet: toppen er noe du samler
// deg til. Målt på ekte data ligger grunntroppen på 86,8 mot et poolsnitt på
// 88,5 — snur man sorteringen havner den på 90,0. Terskelen må ligge MELLOM de
// to, ellers skiller vakten dem ikke (den gjorde ikke det: en bitetest som snur
// sorteringen gikk rett gjennom en «<= snitt + 1»-grense).
const pool = players.filter((player) => clubCandidateIds.has(player.id));
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const squadAvg = mean(squadPlayers.map((player) => player.classHeight));
const poolAvg = mean(pool.map((player) => player.classHeight));
check("grunntroppen ligger UNDER snittet i katalogen", squadAvg < poolAvg, `${squadAvg.toFixed(2)} mot ${poolAvg.toFixed(2)}`);
// Og nær gulvet, ikke midt i mellom: den skal ikke være et kompromiss.
const floor = Math.min(...pool.map((player) => player.classHeight));
check("grunntroppen ligger nærmere gulvet enn snittet",
  squadAvg - floor < poolAvg - squadAvg,
  `snitt ${squadAvg.toFixed(2)}, gulv ${floor}, pool ${poolAvg.toFixed(2)}`);

// ---------------------------------------------------------------------------
// 5. Ingen klubb blir en blindvei
//
// Uansett klubb og uansett progresjon må manageren ende opp med spillere. En
// klubb du kan velge, men ikke spille, ville vært den verste blindveien av alle.
// ---------------------------------------------------------------------------
for (const club of clubs) {
  const cold = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });
  check(`${club.name}: gir spillere uten noen History Go-progresjon`,
    cold.mode === "heritage" ? cold.heritage.length > 0 : cold.baseSquad.length === REQUIRED,
    `${cold.mode} / ${cold.baseSquad.length}`);
  check(`${club.name}: forklarer hva du får`, Boolean(cold.headline && cold.detail && cold.todo.length));
}
// Også for en klubb uten bane i History Go — den skal si det rett ut.
const skeid = byId.get("skeid");
const noGround = resolveClubSquadAccess({ club: skeid, players, unlockedPlaceIds: [], candidateIds: clubCandidateIds, squadSize: REQUIRED });
check("klubb uten bane sier det rett ut", /ingen bane i History Go/.test(noGround.headline), noGround.headline);
check("klubb uten bane får likevel en tropp", noGround.baseSquad.length === REQUIRED);

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
}

// ---------------------------------------------------------------------------
// 5b. Klubbstatus følger med arven — fra dataene, ikke fra en egen motor
// ---------------------------------------------------------------------------
const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
// Statusen lå en periode i to parallelle profilmotorer med hardkodede
// navnelister. Den bor på spilleren nå, og arven skal bære den videre uten at
// klubbtroppmotoren eier en eneste spiller.
for (const club of clubs.filter((entry) => entry.homePlaceId)) {
  const heritage = listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players });
  if (heritage.length === 0) continue;
  check(`${club.name}: alle arvespillere har klubbstatus`,
    heritage.every((player) => player.clubStatus),
    heritage.filter((player) => !player.clubStatus).map((player) => player.name).join(", "));
  // Sorteringen: klassehøyde først, status som skille ved likhet.
  check(`${club.name}: arven er sortert på klassehøyde først`,
    heritage.every((player, i) => i === 0 || num(player.classHeight) <= num(heritage[i - 1].classHeight)));
  for (let i = 1; i < heritage.length; i += 1) {
    if (num(heritage[i].classHeight) !== num(heritage[i - 1].classHeight)) continue;
    check(`${club.name}: lik klassehøyde skilles av status`,
      clubStatusRank(heritage[i]) <= clubStatusRank(heritage[i - 1]));
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
    utenLerkendal: `${notVisited.baseSquad.length} i grunntropp, ${notVisited.lockedCount} låst`,
    medLerkendal: `${visited.heritage.length} historiske spillere å velge blant`
  }
}, null, 2));
