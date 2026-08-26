// P2 source-claim-registeret, målt mot katalogen og mot P1.
//
// Registeret er det eneste stedet en spiller utenfor de 18 P1-arvene kan få en
// kildebelagt styrke. Det gjør det til nøyaktig den slags fil som stille kan
// vokse seg feil: et token som ikke finnes, en spiller som er borte, en kilde
// som ikke er en kilde, eller en overlapp med P1 som gjør at rekkefølgen
// avgjør resultatet.
//
// Vakten krever i tillegg at hver post FAKTISK er belagt: `claim` må sitere
// kilden, og et sitat kjennes på anførselstegnene. En parafrase kan ikke
// kontrolleres uten å åpne kilden, og da er den ikke verdt mer enn en påstand.
import assert from "node:assert/strict";
import fs from "node:fs";
import { P2_DOCUMENTED, applyP2SourceClaims, applyP2SourceClaimsToPlayer } from "../src/football-player-source-claims-p2.js";
import { getP1HeritageForPlayer, applyP1SourceClaims } from "../src/football-player-source-claims-p1.js";

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
const medStyrker = etterBegge.filter((p) => (p.strengths || []).length > 0).length;
krev(medStyrker >= P2_DOCUMENTED.length, "P2-postene forsvant i kjeden");

const klubbnavn = new Map(clubs.map((c) => [c.id, c.name]));
const perKlubb = {};
for (const rad of P2_DOCUMENTED) {
  for (const a of byId.get(rad.playerId).clubAffiliations || []) {
    perKlubb[klubbnavn.get(a.clubId)] = (perKlubb[klubbnavn.get(a.clubId)] || 0) + 1;
  }
}

console.log(JSON.stringify({
  ok: true,
  sjekker,
  dokumenterte: P2_DOCUMENTED.length,
  ferdighetstokens: [...new Set(P2_DOCUMENTED.flatMap((r) => r.strengths))].length,
  spillereMedStyrkerTotalt: medStyrker,
  perKlubb: Object.fromEntries(Object.entries(perKlubb).sort((a, b) => b[1] - a[1]).slice(0, 12))
}, null, 2));
