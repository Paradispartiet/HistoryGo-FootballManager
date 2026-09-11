// P2 source-claim-registeret, målt mot katalogen og mot P1.
//
// P2 er SNL-laget utenfor de 18 P1-arvene. Senere source-depth har sitt eget
// register og audit; denne vakten måler likevel klubbdekningen etter HELE
// overlay-kjeden, ellers ville den rapportert Junkeren som null selv etter at
// runtime faktisk har fått et kildebelagt claim.
//
// Vakten krever i tillegg at hver post FAKTISK er belagt: `claim` må sitere
// kilden, og et sitat kjennes på anførselstegnene. En parafrase kan ikke
// kontrolleres uten å åpne kilden, og da er den ikke verdt mer enn en påstand.
import assert from "node:assert/strict";
import fs from "node:fs";
import { P2_DOCUMENTED, applyP2SourceClaims, applyP2SourceClaimsToPlayer } from "../src/football-player-source-claims-p2.js";
import { getP1HeritageForPlayer, applyP1SourceClaims } from "../src/football-player-source-claims-p1.js";
import { applySourceDepthClaims } from "../src/football-player-source-claims-depth.js";

const les = (fil) => JSON.parse(fs.readFileSync(new URL(`../data/${fil}`, import.meta.url), "utf8"));
const players = les("football_players.json").players;
const clubs = les("football_clubs.json").clubs;
const gyldige = new Set(les("football_attributes.json").attributes.map((a) => a.id));
const byId = new Map(players.map((p) => [p.id, p]));

let sjekker = 0;
const krev = (betingelse, melding) => { sjekker += 1; assert.ok(betingelse, melding); };

krev(P2_DOCUMENTED.length > 0, "registeret er tomt");
krev(new Set(P2_DOCUMENTED.map((r) => r.playerId)).size === P2_DOCUMENTED.length,
  "samme spiller står to ganger i registeret");

for (const rad of P2_DOCUMENTED) {
  const p = byId.get(rad.playerId);
  krev(Boolean(p), `${rad.playerId}: finnes ikke i katalogen`);

  // Ingen overlapp med P1. Var det overlapp, ville rekkefølgen på de to
  // overlayene bestemme hvilken kilde som vant, og det er ikke en avgjørelse
  // et kall skal ta.
  krev(!getP1HeritageForPlayer(p),
    `${rad.playerId}: ligger i en P1-arv og hører hjemme i P1-registeret, ikke her`);

  krev(rad.strengths.length > 0, `${rad.playerId}: en dokumentert post må ha minst én styrke`);
  krev(new Set(rad.strengths).size === rad.strengths.length, `${rad.playerId}: samme styrke to ganger`);
  for (const s of rad.strengths) krev(gyldige.has(s), `${rad.playerId}: ukjent ferdighet ${JSON.stringify(s)}`);

  krev(/^https:\/\/snl\.no\//.test(rad.source || ""),
    `${rad.playerId}: kilden må være en SNL-artikkel, fikk ${JSON.stringify(rad.source)}`);
  krev(typeof rad.claim === "string" && rad.claim.length > 30, `${rad.playerId}: claim er for kort til å være et belegg`);
  krev(/[«"]/.test(rad.claim), `${rad.playerId}: claim skal sitere kilden, ikke parafrasere den`);

  // Registeret rører ikke identitet. Det legger på styrker, og bare det.
  const etter = applyP2SourceClaimsToPlayer(p);
  assert.deepEqual(
    { ...etter, strengths: null },
    { ...p, strengths: null },
    `${rad.playerId}: overlayet endret noe annet enn styrkene`
  );
  assert.deepEqual(etter.strengths, [...rad.strengths], `${rad.playerId}: styrkene kom ikke gjennom`);
}

// Rekkefølgen kan ikke snu et resultat: en profil som alt har styrker beholder
// dem, uansett hvilken vei overlayene kjøres.
{
  const prøve = { id: P2_DOCUMENTED[0].playerId, strengths: ["leadership"] };
  assert.deepEqual(applyP2SourceClaimsToPlayer(prøve).strengths, ["leadership"],
    "et P2-treff skal ikke overskrive styrker en profil alt har");
}

// En spiller uten post røres ikke.
{
  const uten = players.find((p) => !P2_DOCUMENTED.some((r) => r.playerId === p.id));
  assert.equal(applyP2SourceClaimsToPlayer(uten), uten, "en spiller uten post skal returneres uendret");
}

// Og hele veien gjennom: P1 først, så P2, og ingen av dem mister noe.
const etterBegge = applyP2SourceClaims(applyP1SourceClaims(players));
const medStyrkerP1P2 = etterBegge.filter((p) => (p.strengths || []).length > 0).length;
krev(medStyrkerP1P2 >= P2_DOCUMENTED.length, "P2-postene forsvant i kjeden");
const etterAlle = applySourceDepthClaims(etterBegge);
const medStyrker = etterAlle.filter((p) => (p.strengths || []).length > 0).length;

const klubbnavn = new Map(clubs.map((c) => [c.id, c.name]));
const perKlubb = {};
for (const rad of P2_DOCUMENTED) {
  for (const a of byId.get(rad.playerId).clubAffiliations || []) {
    perKlubb[klubbnavn.get(a.clubId)] = (perKlubb[klubbnavn.get(a.clubId)] || 0) + 1;
  }
}

// Produktstatusen peker eksplisitt på klubbpooler som er komplette, men grunne.
// Derfor må vi kunne måle dette fra canonical runtime-data, ikke telle manuelt
// i et dokument. Her betyr "kildebelagt styrke" at profilen faktisk har minst
// én styrke etter P1- og P2-overlayene; klubbmedlemskapet kommer fortsatt bare
// fra player.clubAffiliations.
const styrkedekningPerKlubb = clubs.map((club) => {
  const pool = etterAlle.filter((player) =>
    (player.clubAffiliations || []).some((entry) => entry?.clubId === club.id)
  );
  const medKildebelagtStyrke = pool.filter((player) => (player.strengths || []).length > 0);
  return {
    clubId: club.id,
    klubb: club.name,
    profiler: pool.length,
    medKildebelagtStyrke: medKildebelagtStyrke.length,
    utenKildebelagtStyrke: pool.length - medKildebelagtStyrke.length,
    nullDekning: medKildebelagtStyrke.length === 0
      ? pool.map((player) => ({ id: player.id, name: player.name }))
      : undefined
  };
}).sort((a, b) =>
  a.medKildebelagtStyrke - b.medKildebelagtStyrke
  || a.klubb.localeCompare(b.klubb, "nb")
);

const nullKlubber = styrkedekningPerKlubb.filter((entry) => entry.medKildebelagtStyrke === 0);
krev(nullKlubber.every((entry) => entry.profiler >= 15),
  "null-dekning skal være et dybdeproblem, ikke en uferdig klubbpool");

// Source-depth er en ratchet: en klubb som først har fått et kildeclaim skal
// ikke kunne falle tilbake til null uten at denne forventningen eksplisitt
// flyttes. Bjarg gikk 10.09.2026 fra null til Pesen som første dokumenterte
// styrkeprofil via den eksisterende Brann-P1-identiteten. Brattvåg fulgte
// samme dag via Ulrik Valderhaug Syversens Aalesund-P1-identitet og klubbens
// eksplisitte lederbeskrivelse. Junkeren følger via Ivar Unhjems eksplisitte
// beskrivelse som hurtig og solid avslutter i det separate source-depth-laget.
// Sandviken følger via Beltran Mvukas eksplisitte egenbeskrivelse av farten.
// Vidar lukker den siste nullplassen via Simen Haughoms eksplisitte beskrivelse
// som hardtarbeidende skarpskytter.
const forventedeNullKlubber = [];
assert.deepEqual(
  nullKlubber.map((entry) => entry.clubId),
  forventedeNullKlubber,
  `nullklubb-ratchet driftet: ${nullKlubber.map((entry) => entry.clubId).join(", ")}`
);

const bjargDekning = styrkedekningPerKlubb.find((entry) => entry.clubId === "bjarg");
krev(bjargDekning?.medKildebelagtStyrke >= 2,
  `Bjarg source-depth skal være minst 2, fikk ${bjargDekning?.medKildebelagtStyrke ?? "mangler"}`);

const brattvagDekning = styrkedekningPerKlubb.find((entry) => entry.clubId === "brattvag");
krev(brattvagDekning?.medKildebelagtStyrke >= 2,
  `Brattvåg source-depth skal være minst 2, fikk ${brattvagDekning?.medKildebelagtStyrke ?? "mangler"}`);

console.log(JSON.stringify({
  ok: true,
  sjekker,
  dokumenterte: P2_DOCUMENTED.length,
  ferdighetstokens: [...new Set(P2_DOCUMENTED.flatMap((r) => r.strengths))].length,
  spillereMedStyrkerTotalt: medStyrker,
  spillereMedStyrkerP1P2: medStyrkerP1P2,
  sourceDepthTillegg: medStyrker - medStyrkerP1P2,
  nullKlubber,
  svakesteKlubber: styrkedekningPerKlubb.slice(0, 12),
  perKlubb: Object.fromEntries(Object.entries(perKlubb).sort((a, b) => b[1] - a[1]).slice(0, 12))
}, null, 2));
