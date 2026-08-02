// Spilte du klubbens fotball?
//
// Klubbvalget lovet noe spillet ikke holdt. Onboardingen sa «Tradisjon:
// Godfoten. Styret venter at du spiller klubbens fotball» — og `inheritedStyleName`
// ble satt og aldri lest av noe. Løftet hadde ingen dekning, og ingenting feilet.
//
// Vakten måler tre ting som hver for seg er den vanlige feilen her:
//   1. at bøttene faktisk brukes (terskler som klumper er ingen terskler)
//   2. at toppdommen er OPPNÅELIG for hver klubb (en dom du aldri kan få er
//      ingen dom — første utgave var uoppnåelig for 44 av 60 klubber)
//   3. at dommen aldri rører en kamp
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  PARAMETER_AXES, buildTraditionThresholds, deriveClubParameterProfile,
  compareTraditionToSetup, achievableTraditionRange, judgeClubTradition
} from "../src/football-club-tradition.js";
import { createSeasonReview } from "../src/football-season-review.js";

const profiles = JSON.parse(
  fs.readFileSync(new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8")
).profiles;
const knowledgeDoc = JSON.parse(
  fs.readFileSync(new URL("../data/hgFootball/formationKnowledge.json", import.meta.url), "utf8")
);
const formations = Array.isArray(knowledgeDoc.knowledge) ? knowledgeDoc.knowledge : Object.values(knowledgeDoc.knowledge);
const formationProfiles = formations.map((entry) => entry.parameterProfile).filter(Boolean);
const thresholds = buildTraditionThresholds(profiles);
const byId = new Map(profiles.map((profile) => [profile.clubId, profile]));
const formationById = new Map(formations.map((entry) => [entry.formationId, entry]));

let checks = 0;
const check = (name, condition, detail = "") => {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
};

// ---------------------------------------------------------------------------
// 1. Samme akser på begge sider
//
// Sammenligningen er bare gyldig fordi klubben og formasjonen beskrives på DE
// SAMME ni aksene med DET SAMME vokabularet. Driver de fra hverandre, blir det
// en kategorifeil av samme slag som å gi Molde Barcelonas arketyp.
// ---------------------------------------------------------------------------
check("alle formasjoner har en parameterProfile", formationProfiles.length === formations.length, `${formationProfiles.length}/${formations.length}`);
for (const [axis, scale] of Object.entries(PARAMETER_AXES)) {
  assert.deepEqual(knowledgeDoc.vocab.parameterAxes[axis], scale, `aksen «${axis}» har drevet fra formasjonskunnskapens vokabular`);
  checks += 1;
}
for (const formation of formations) {
  for (const [axis, value] of Object.entries(formation.parameterProfile)) {
    check(`${formation.formationId}: «${axis}» bruker kjent vokabular`, PARAMETER_AXES[axis]?.includes(value), value);
  }
}

// ---------------------------------------------------------------------------
// 2. Bøttene må BRUKES
//
// Aksene har vidt forskjellige spenn (pressIntensity 25–82, intensity 52–85).
// Én fast grense ville dyttet noen akser helt over i én bøtte — samme klasse som
// skalafeilene i CLAUDE.md. Tersilene regnes derfor ut av korpuset, og her måles
// det at hver akse faktisk fordeler seg.
// ---------------------------------------------------------------------------
const distribution = {};
for (const profile of profiles) {
  const axes = deriveClubParameterProfile(profile, thresholds);
  check(`${profile.clubId}: har alle ni aksene`, Object.keys(axes).length === 9);
  for (const [axis, value] of Object.entries(axes)) {
    check(`${profile.clubId}: «${axis}» er gyldig`, PARAMETER_AXES[axis].includes(value), value);
    distribution[axis] = distribution[axis] || {};
    distribution[axis][value] = (distribution[axis][value] || 0) + 1;
  }
}
for (const [axis, counts] of Object.entries(distribution)) {
  check(`aksen «${axis}» bruker alle tre bøttene`, Object.keys(counts).length === 3, JSON.stringify(counts));
  const biggest = Math.max(...Object.values(counts));
  check(`aksen «${axis}» klumper seg ikke i én bøtte`, biggest <= profiles.length * 0.7, JSON.stringify(counts));
}

// ---------------------------------------------------------------------------
// 3. Sammenligningen peker riktig vei
// ---------------------------------------------------------------------------
const identical = compareTraditionToSetup({
  traditionProfile: deriveClubParameterProfile(byId.get("rosenborg"), thresholds),
  formationProfile: deriveClubParameterProfile(byId.get("rosenborg"), thresholds)
});
check("et system som er klubbens tradisjon gir 100 %", identical.alignment === 100, String(identical.alignment));
check("da driver ingen akse", identical.drifted.length === 0);

const opposite = compareTraditionToSetup({
  traditionProfile: { pressHeight: "high", defensiveLine: "high", width: "wide", possession: "patient", tempo: "high", transition: "high", restDefence: "strong", pressingScheme: "man_oriented", risk: "high" },
  formationProfile: { pressHeight: "low", defensiveLine: "deep", width: "narrow", possession: "direct", tempo: "low", transition: "low", restDefence: "weak", pressingScheme: "zonal", risk: "low" }
});
check("motsatt ende på hver akse gir 0 %", opposite.alignment === 0, String(opposite.alignment));
check("da driver alle ni aksene", opposite.drifted.length === 9);
check("avvikene er sortert med det største først", opposite.drifted.every((entry, i) => i === 0 || entry.distance <= opposite.drifted[i - 1].distance));

// ---------------------------------------------------------------------------
// 4. Dommen må være OPPNÅELIG — for hver klubb
//
// Første utgave målte mot 100 %. Målt mot de 46 formasjonene kunne 44 av 60
// klubber da ALDRI nå toppdommen, uansett hva manageren valgte. En dom ingen kan
// få er ingen dom — den forteller bare at biblioteket ikke har en perfekt kopi.
// ---------------------------------------------------------------------------
let unreachableTop = 0;
let unreachableBottom = 0;
for (const profile of profiles) {
  const tradition = deriveClubParameterProfile(profile, thresholds);
  const range = achievableTraditionRange(tradition, formationProfiles);
  check(`${profile.clubId}: har et oppnåelig spenn`, range && range.best > range.worst, JSON.stringify(range));

  const scored = formations
    .map((formation) => ({ formation, alignment: compareTraditionToSetup({ traditionProfile: tradition, formationProfile: formation.parameterProfile }).alignment }))
    .sort((a, b) => b.alignment - a.alignment);

  const atBest = judgeClubTradition({ clubProfile: profile, formationProfile: scored[0].formation.parameterProfile, formationName: scored[0].formation.displayName, thresholds, profiles, formationProfiles });
  const atWorst = judgeClubTradition({ clubProfile: profile, formationProfile: scored[scored.length - 1].formation.parameterProfile, formationName: scored[scored.length - 1].formation.displayName, thresholds, profiles, formationProfiles });
  if (atBest.verdict !== "klubbens_fotball") unreachableTop += 1;
  if (atWorst.verdict !== "fremmed") unreachableBottom += 1;
  check(`${profile.clubId}: beste system slår det verste`, atBest.relativeAlignment > atWorst.relativeAlignment);
}
check("hver klubb KAN få toppdommen med sitt beste system", unreachableTop === 0, `${unreachableTop} klubber kan aldri nå den`);
check("hver klubb KAN få bunndommen med sitt verste system", unreachableBottom === 0, `${unreachableBottom} klubber kan aldri få den`);

// ---------------------------------------------------------------------------
// 5. Dommen gir mening som fotball
// ---------------------------------------------------------------------------
const traditionFor = (id) => deriveClubParameterProfile(byId.get(id), thresholds);
const bestFormationFor = (id) => formations
  .map((formation) => ({ formation, alignment: compareTraditionToSetup({ traditionProfile: traditionFor(id), formationProfile: formation.parameterProfile }).alignment }))
  .sort((a, b) => b.alignment - a.alignment)[0].formation.formationId;
// En ballbesittende klubb skal ikke få catenaccio som sitt beste system, og en
// lavblokk-klubb skal ikke få et høypressystem.
for (const id of ["rosenborg", "bodo_glimt", "fredrikstad", "molde"]) {
  check(`${byId.get(id).styleName}: beste system er ikke en lav blokk`, !/catenaccio|low_block|verrou/.test(bestFormationFor(id)), bestFormationFor(id));
}
for (const id of ["kristiansund", "sandefjord"]) {
  check(`${byId.get(id).styleName}: beste system er ikke et høypressystem`, !/gegen|press_433|high_press/.test(bestFormationFor(id)), bestFormationFor(id));
}

// Og at forklaringen alltid peker på en MANAGERBESLUTNING, aldri på spillerne.
const harsh = judgeClubTradition({
  clubProfile: byId.get("rosenborg"),
  formationProfile: formationById.get("catenaccio_532").parameterProfile,
  formationName: "Catenaccio 5-3-2", thresholds, profiles, formationProfiles
});
check("en hard dom forklarer seg", harsh.headline.length > 0 && harsh.reasons.length >= 1);
check("forklaringen peker på systemvalget", harsh.reasons.every((line) => /systemvalg|akser/.test(line)), harsh.reasons.join(" | "));
check("forklaringen skylder aldri på spillerne", harsh.reasons.every((line) => !/spillerne er|troppen er for|for dårlig/.test(line)));
const kind = judgeClubTradition({
  clubProfile: byId.get("rosenborg"),
  formationProfile: formationById.get(bestFormationFor("rosenborg")).parameterProfile,
  formationName: "beste system", thresholds, profiles, formationProfiles
});
check("toppdommen leder ikke med en klage", !/klubben spiller «/.test(kind.reasons[0]), kind.reasons[0]);

// ---------------------------------------------------------------------------
// 6. Dommen rører ALDRI en kamp
//
// Dette er kjerneprinsippet: `overall` avgjør ikke, og det gjør ikke klubbens
// tradisjon heller. Den er en styredom, på linje med sesongdommen.
// ---------------------------------------------------------------------------
check("dommen sier selv at den ikke påvirker kamputfall", harsh.affectsMatchOutcome === false);
const engineSource = fs.readFileSync(new URL("../src/football-club-tradition.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("motoren er ren", !/document|localStorage|fetch\(|Date\.now|Math\.random/.test(engineSource));
check("motoren rører ikke overall eller matchScore", !/overall|matchScore|finalStrength/.test(engineSource));

// Sesongdommen skal være BIT-IDENTISK uten en overtatt klubb.
const table = [
  { clubId: "m", club: "Manager FK", isManager: true, position: 4, points: 60, played: 30, goalsFor: 50, goalsAgainst: 30 },
  ...Array.from({ length: 15 }, (_, i) => ({ clubId: `c${i}`, club: `K${i}`, position: i < 3 ? i + 1 : i + 2, points: 50 - i, played: 30, goalsFor: 40, goalsAgainst: 40 }))
];
const base = { season: { seasonNumber: 1 }, table, target: { targetPosition: 3, label: "Topp 3" } };
assert.equal(JSON.stringify(createSeasonReview(base)), JSON.stringify(createSeasonReview({ ...base, tradition: null })),
  "sesongdommen er ikke lenger uendret for en egenopprettet klubb");
checks += 1;
const withTradition = createSeasonReview({ ...base, tradition: harsh });
check("dommen legger tradisjonslinja sist", withTradition.reasons[withTradition.reasons.length - 1].includes(harsh.headline));
check("dommen bærer tradisjonen videre", withTradition.tradition?.verdict === harsh.verdict);
check("tradisjonen endrer ikke tabellplass eller styretillit",
  withTradition.position === createSeasonReview(base).position
  && withTradition.boardTrustAfter === createSeasonReview(base).boardTrustAfter);

// Og at app.js faktisk henter dommen.
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app.js dømmer klubbens tradisjon", /judgeClubTradition\(/.test(app));
check("app.js gir dommen til sesongdommen", /tradition: getClubTraditionVerdict\(\)/.test(app));
check("app.js måler mot det oppnåelige", /formationProfiles:/.test(app));

console.log(JSON.stringify({
  ok: true, sjekker: checks,
  klubber: profiles.length, formasjoner: formations.length,
  eksempel: {
    "Godfoten + beste system": `${kind.relativeAlignment}% → ${kind.verdictLabel}`,
    "Godfoten + catenaccio": `${harsh.relativeAlignment}% → ${harsh.verdictLabel}`
  }
}, null, 2));
