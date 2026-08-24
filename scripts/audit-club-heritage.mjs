// P2-arvene, målt av ÉN vakt.
//
// Pors og Brattvåg fikk hver sin vakt, og de var 190 linjer av samme sjekk to
// ganger. Med seksten klubber igjen i 2. divisjon ville det blitt atten kopier
// som driver fra hverandre én rettelse om gangen — nøyaktig den formen for rot
// som gjør at en regel gjelder for noen klubber og ikke for andre.
//
// Her er kontrakten skrevet én gang og forventningene per klubb er data. Å
// legge til neste klubb er én rad i tabellen, ikke en ny fil, og en skjerpelse
// av regelen treffer alle klubbene samtidig.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  isSimulationReadyPlayer,
  listClubPoolPlayers,
  listPlayableClubPoolPlayers,
  resolveClubSquadAccess
} from "../src/football-club-squad.js";

// Én rad per leveranse. `dokumentert` er hele den kildebårne klubbpoolen,
// `spillbar` er de med kildebelagt posisjon, og `nye` er profilene arven eier
// alene — differansen mot `dokumentert` er krysskoblingene.
const ARVER = [
  {
    clubId: "pors",
    placeId: "pors_stadion",
    dokumentert: 63,
    spillbar: 16,
    nye: 58,
    // Pors-kilden er klubbhistorikk uten kampantall. Fem navn fantes fra før.
    krysskoblet: [
      "einar_rossbach",
      "fredrik_nordkvelle",
      "erik_pedersen",
      "tor_arne_sannerholt",
      "christer_fjellstad"
    ],
    // Pors-kilden daterer: hver profil har en epoke fra kilden selv.
    eraSource: "belagt",
    doc: "docs/P2_PORS_SOURCE_PASS.md"
  },
  {
    clubId: "brattvag",
    placeId: "brattvag_stadion",
    dokumentert: 81,
    spillbar: 18,
    nye: 79,
    // Brattvåg-kilden har kampantall per mann (546 ned til 143). Det er den ene
    // opplysningen Pors ikke hadde, og derfor den ene fristelsen: en kamp er
    // individuell og dokumentert, men den er tilgjengelighet, ikke en ferdighet.
    krysskoblet: ["sivert_solli", "ulrik_valderhaug_syversen"],
    // Brattvåg-kilden har ingen årstall i det hele tatt — bare kampantall og en
    // troppsliste — så epoken er lest av hvilken liste navnet står i.
    eraSource: "utledet",
    doc: "docs/P2_BRATTVAG_SOURCE_PASS.md"
  },
  {
    clubId: "kvik_halden",
    placeId: "halden_stadion",
    dokumentert: 41,
    spillbar: 23,
    nye: 39,
    // Kvik-kilden er to lag i ett: FK Kvik-perioden 1906–1997 med cupgullet i
    // 1918, og A-lagstroppen 2023. To navn fantes fra før, begge bekreftet av
    // sin egen individkilde.
    krysskoblet: ["raymond_kvisvik", "fabian_stensrud_ness"],
    // Klubbens historikk daterer landslagsuttakene år for år, og troppen er
    // datert 27.07.2023 — hver profil har en epoke fra kilden selv.
    eraSource: "belagt",
    doc: "docs/P2_KVIK_HALDEN_SOURCE_PASS.md"
  }
];

const { clubs } = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
const { players } = JSON.parse(fs.readFileSync(new URL("../data/football_players.json", import.meta.url), "utf8"));
const unlockData = JSON.parse(fs.readFileSync(new URL("../data/football_unlocks.json", import.meta.url), "utf8"));

const rapport = [];
for (const arv of ARVER) {
  const merke = arv.clubId;
  const club = clubs.find((entry) => entry.id === arv.clubId);
  assert.ok(club, `${merke}: mangler i klubbkatalogen`);
  assert.equal(club.homePlaceId, arv.placeId, `${merke}: feil homePlaceId`);
  assert.ok(fs.existsSync(new URL(`../${arv.doc}`, import.meta.url)), `${merke}: ${arv.doc} mangler`);

  const documented = listClubPoolPlayers({ clubId: arv.clubId, players });
  const playable = listPlayableClubPoolPlayers({ clubId: arv.clubId, players });
  const heritageOnly = documented.filter((player) => !isSimulationReadyPlayer(player));
  assert.equal(documented.length, arv.dokumentert, `${merke}: dokumenterte klubbprofiler`);
  assert.equal(playable.length, arv.spillbar, `${merke}: profiler med dokumentert posisjon`);
  assert.equal(heritageOnly.length, arv.dokumentert - arv.spillbar, `${merke}: historikkprofiler`);
  assert.equal(Number(club.playerPoolSize), arv.dokumentert, `${merke}: playerPoolSize`);
  assert.equal(Number(club.playablePlayerPoolSize), arv.spillbar, `${merke}: playablePlayerPoolSize`);
  assert.equal(club.playerPoolStatus, "ready", `${merke}: playerPoolStatus`);

  // Banen åpner bare de spillbare. En historikkpost uten posisjon skal ikke
  // kunne komme inn i en simulering som må gjette hva han var.
  const place = unlockData.placeUnlocks.find((entry) => entry.placeId === arv.placeId);
  assert.ok(place, `${merke}: ${arv.placeId} mangler i unlock-katalogen`);
  const unlockIds = place.unlocks
    .filter((entry) => entry.type === "player_candidate")
    .map((entry) => entry.targetId)
    .sort();
  const playableIds = playable.map((player) => player.id).sort();
  assert.deepEqual(unlockIds, playableIds, `${merke}: banen skal bare åpne spillbare profiler`);

  // Ingen ny P2-profil bærer en modellert egenskap. Kilden gir navn, av og til
  // posisjon, og ingenting mer — så alt som kunne blitt utledet av «han spilte
  // mange kamper» eller «han spilte i denne posisjonen» skal stå tomt.
  const nyeEksklusive = players.filter((player) => (player.sourcePlaceIds || []).includes(arv.placeId));
  assert.equal(nyeEksklusive.length, arv.nye, `${merke}: nye canonical profiler`);
  for (const player of nyeEksklusive) {
    for (const felt of ["strengths", "archetypeIds", "preferredRoles", "likesTactics"]) {
      assert.equal((player[felt] || []).length, 0, `${merke}/${player.id}: ${felt} er ikke kildebelagt`);
    }
    // `classSource` er `utledet` for alle P2-arver: en 2.-divisjonskilde når
    // aldri en karrierepåstand. `eraSource` er derimot per kilde — Pors daterer
    // seg selv, Brattvåg har ikke ett eneste årstall — og forskjellen skal stå
    // i tabellen, ikke skjules i en felles antakelse.
    assert.equal(player.classSource, "utledet", `${merke}/${player.id}: classSource`);
    assert.equal(player.eraSource, arv.eraSource, `${merke}/${player.id}: eraSource`);
  }

  // Krysskoblingene er navngitte påstander. Hver av dem beholder sin egen
  // arv — medlemskapet materialiseres i clubAffiliations — slik at den frosne
  // P1-nevneren står urørt.
  assert.equal(arv.dokumentert - arv.nye, arv.krysskoblet.length, `${merke}: antall krysskoblinger`);
  for (const id of arv.krysskoblet) {
    const player = players.find((entry) => entry.id === id);
    assert.ok(player, `${merke}/${id}: canonical profil mangler`);
    assert.ok(player.clubAffiliations?.some((entry) => entry.clubId === arv.clubId),
      `${merke}/${id}: krysskobling mangler i clubAffiliations`);
    assert.ok(!(player.sourcePlaceIds || []).includes(arv.placeId),
      `${merke}/${id}: eldre sourcePlaceIds skal ikke omskrives`);
    assert.ok((player.sourcePlaceIds || []).length > 0, `${merke}/${id}: skal beholde sin egen arv`);
  }

  const cold = resolveClubSquadAccess({
    club, players, unlockedPlaceIds: [], candidateIds: new Set(playableIds), squadSize: 15
  });
  assert.equal(cold.mode, "base", `${merke}: uten besøk skal grunntroppen gjelde`);
  assert.equal(cold.baseSquad.length, 15, `${merke}: grunntropp`);
  assert.equal(cold.documentedCount, arv.dokumentert, `${merke}: documentedCount (kald)`);
  assert.equal(cold.poolSize, arv.spillbar, `${merke}: poolSize (kald)`);
  assert.equal(cold.unprofiledCount, arv.dokumentert - arv.spillbar, `${merke}: unprofiledCount (kald)`);
  assert.ok(cold.baseSquad.every((id) => playableIds.includes(id)), `${merke}: grunntropp utenfor poolen`);

  const full = resolveClubSquadAccess({
    club, players, unlockedPlaceIds: [arv.placeId], candidateIds: new Set(playableIds), squadSize: 15
  });
  assert.equal(full.mode, "heritage", `${merke}: besøk skal gi arv`);
  assert.equal(full.heritage.length, arv.spillbar, `${merke}: arvepool`);
  assert.equal(full.documentedCount, arv.dokumentert, `${merke}: documentedCount (arv)`);
  assert.equal(full.unprofiledCount, arv.dokumentert - arv.spillbar, `${merke}: unprofiledCount (arv)`);
  assert.ok(full.heritage.every((entry) => entry.simulationReady), `${merke}: arvepool skal være simulerbar`);

  rapport.push({
    clubId: arv.clubId,
    dokumentert: documented.length,
    spillbar: playable.length,
    historikkposter: heritageOnly.length,
    nyeProfiler: nyeEksklusive.length,
    krysskoblet: arv.krysskoblet.length,
    baneåpner: unlockIds.length
  });
}

console.log(JSON.stringify({ ok: true, arver: rapport.length, rapport }, null, 2));
