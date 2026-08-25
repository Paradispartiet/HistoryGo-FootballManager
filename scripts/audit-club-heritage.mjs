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
    dokumentert: 89,
    spillbar: 42,
    nye: 83,
    // Pors-kilden er klubbhistorikk uten kampantall. Fem navn fantes fra før;
    // Redon Pllana kom til med 2026-troppen fra NFF.
    krysskoblet: [
      "christer_fjellstad", "einar_rossbach", "erik_pedersen",
      "fredrik_nordkvelle", "redon_pllana", "tor_arne_sannerholt"
    ],
    // Pors-kilden daterer: hver profil har en epoke fra kilden selv.
    eraSource: "belagt",
    doc: "docs/P2_PORS_SOURCE_PASS.md"
  },
  {
    clubId: "brattvag",
    placeId: "brattvag_stadion",
    dokumentert: 93,
    spillbar: 30,
    nye: 91,
    // Brattvåg-kilden har kampantall per mann (546 ned til 143). Det er den ene
    // opplysningen Pors ikke hadde, og derfor den ene fristelsen: en kamp er
    // individuell og dokumentert, men den er tilgjengelighet, ikke en ferdighet.
    krysskoblet: ["sivert_solli", "ulrik_valderhaug_syversen"],
    // Brattvåg-kilden hadde ingen årstall i det hele tatt — bare kampantall og
    // en troppsliste — så epoken var lest av hvilken liste navnet sto i.
    // 2026-suppleringen fra NFF er derimot datert, så arven bærer nå begge.
    eraSource: ["utledet", "belagt"],
    doc: "docs/P2_BRATTVAG_SOURCE_PASS.md"
  },
  {
    clubId: "kvik_halden",
    placeId: "halden_stadion",
    dokumentert: 56,
    spillbar: 38,
    nye: 54,
    // Kvik-kilden er to lag i ett: FK Kvik-perioden 1906–1997 med cupgullet i
    // 1918, og A-lagstroppen 2023. To navn fantes fra før, begge bekreftet av
    // sin egen individkilde.
    krysskoblet: ["raymond_kvisvik", "fabian_stensrud_ness"],
    // Klubbens historikk daterer landslagsuttakene år for år, og troppen er
    // datert 27.07.2023 — hver profil har en epoke fra kilden selv.
    eraSource: "belagt",
    doc: "docs/P2_KVIK_HALDEN_SOURCE_PASS.md"
  },
  // De seks siste i avdeling 1. Alle bygger på NFFs egen lagside, som fører
  // A-lagstroppen gruppert etter lagdel — Keeper, Forsvar, Midtbane, Angrep.
  // Keeper er en presis posisjon; de tre andre er lagdeler og bæres i
  // `usablePositions` med `positionSource: "gruppe"`.
  {
    clubId: "bjarg",
    placeId: "stavollen_kunstgress",
    dokumentert: 32,
    spillbar: 30,
    nye: 31,
    // Rolf Birger Pedersen fantes i Brann-arven som «Pesen» — Bjarg-kilden
    // sier selv at han kom fra Brann. De tre andre historiske er nye.
    krysskoblet: ["rolf_birger_pesen_pedersen"],
    eraSource: "belagt",
    doc: "docs/P2_BJARG_SOURCE_PASS.md"
  },
  {
    clubId: "eik_tonsberg",
    placeId: "tonsberg_gressbane",
    dokumentert: 25,
    spillbar: 25,
    nye: 21,
    // De fire med «kortere klubbopphold» i klubbartikkelen finnes alle fra før.
    krysskoblet: ["erik_soler", "ronny_johnsen", "jan_frode_nornes", "erik_thorstvedt"],
    eraSource: "belagt",
    doc: "docs/P2_EIK_TONSBERG_SOURCE_PASS.md"
  },
  {
    clubId: "lysekloster",
    placeId: "lysekloster_idrettspark",
    dokumentert: 16,
    spillbar: 16,
    nye: 15,
    krysskoblet: ["ola_lerheim_olsen"],
    eraSource: "belagt",
    doc: "docs/P2_LYSEKLOSTER_SOURCE_PASS.md"
  },
  {
    clubId: "traff",
    placeId: "reknesbanen",
    dokumentert: 23,
    spillbar: 23,
    nye: 21,
    // Petter Eichler Jensen er utelatt: NFF fører ham som keeper, katalogen som
    // CB/CM/DM. To menn, eller én kilde som tar feil — ikke en kobling å gjøre.
    // Vegard Valgermo Forren er derimot krysskoblet: no.wikipedia sier at han er
    // «spillende assistenttrener for Træff», altså Moldes Vegard Forren.
    krysskoblet: ["vegard_forren", "kjetil_holand_tosse"],
    eraSource: "belagt",
    doc: "docs/P2_TRAFF_SOURCE_PASS.md"
  },
  {
    clubId: "vidar",
    placeId: "lassa_idrettspark",
    dokumentert: 26,
    spillbar: 26,
    nye: 24,
    krysskoblet: ["william_schjolberg_husebo", "jan_fjetland"],
    eraSource: "belagt",
    doc: "docs/P2_VIDAR_SOURCE_PASS.md"
  },
  {
    clubId: "sandviken",
    placeId: "stemmemyren",
    dokumentert: 31,
    spillbar: 31,
    nye: 29,
    krysskoblet: ["joakim_aasen", "david_sissoko"],
    eraSource: "belagt",
    doc: "docs/P2_SANDVIKEN_SOURCE_PASS.md"
  },
  // Avdeling 2. Samme kilde og samme form som avdeling 1: NFFs lagside, med
  // laget identifisert mot tabellen for 2. divisjon avdeling 2. Ingen av de sju
  // har en redaksjonell kilde som navngir historiske spillere, så poolene er
  // rene troppspooler uten historikkposter.
  {
    clubId: "stjordals_blink",
    placeId: "sandskogan_stadion",
    dokumentert: 24,
    spillbar: 24,
    nye: 24,
    krysskoblet: [],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
  },
  {
    clubId: "rana",
    placeId: "sagbakken",
    dokumentert: 28,
    spillbar: 28,
    nye: 26,
    krysskoblet: ["theo_aksnes_olsen", "adrian_olsen_teigen"],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
  },
  {
    clubId: "junkeren",
    placeId: "nordlandshallen",
    dokumentert: 27,
    spillbar: 27,
    nye: 27,
    krysskoblet: [],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
  },
  {
    clubId: "lorenskog",
    placeId: "rolvsrud_stadion",
    dokumentert: 24,
    spillbar: 24,
    nye: 23,
    krysskoblet: ["leon_dahlstrom"],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
  },
  {
    clubId: "eidsvold_turn",
    placeId: "myhrer_stadion",
    dokumentert: 21,
    spillbar: 21,
    nye: 20,
    krysskoblet: ["lucas_kolstad"],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
  },
  {
    clubId: "follo",
    placeId: "ski_stadion",
    dokumentert: 35,
    spillbar: 35,
    nye: 33,
    krysskoblet: ["henrik_hagen", "otman_khris"],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
  },
  {
    clubId: "trygg_lade",
    placeId: "lade_idrettsanlegg",
    dokumentert: 25,
    spillbar: 25,
    nye: 25,
    krysskoblet: [],
    eraSource: "belagt",
    doc: "docs/P2_AVDELING2_SOURCE_PASS.md"
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
    //
    // En arv kan ha TO kildegenerasjoner. Brattvåg ble landet på en udatert
    // klubbhistorikk (`utledet`) og senere supplert med NFFs 2026-tropp, som er
    // datert (`belagt`). Da er én verdi per arv feil form: profilene har ulik
    // epokebelegg fordi de har ulik kilde. Raden tar derfor en liste når arven
    // har flere, og lista er uttømmende — en tredje verdi feller fortsatt.
    const tillatteEra = Array.isArray(arv.eraSource) ? arv.eraSource : [arv.eraSource];
    assert.equal(player.classSource, "utledet", `${merke}/${player.id}: classSource`);
    assert.ok(tillatteEra.includes(player.eraSource),
      `${merke}/${player.id}: eraSource ${JSON.stringify(player.eraSource)} står ikke i arvens liste ${JSON.stringify(tillatteEra)}`);
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
