// Klubbvalg: lag din egen, eller ta over en som finnes.
//
// Det siste hullet i pyramiden. Onboardingen lot deg bare skrive et navn, så
// klubbidentiteten var en tekststreng: `strength: 75`, ingen nivå, ingen
// tradisjon, og et styre som forventet nøyaktig det samme uansett hvem du var.
//
// Det som gjør valget til noe mer enn en meny, er hva du IKKE arver: troppen.
// Spillerne kommer fortsatt fra samlingen — ellers ville klubbvalget omgått
// hele kjernesløyfen (Sted → Person → Ekspertise → Trening → Badge → Lagklasse).
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  listSelectableClubs, deriveClubExpectation, rankClubInTier,
  createManagerClubFromSelection, createOwnManagerClub, describeClubSelection,
  resolveStartTier
} from "../src/football-club-selection.js";
import { deriveSeasonTarget } from "../src/football-season-review.js";
import { createLeagueSeason, roundsForClubCount } from "../src/football-league-season.js";

const { tiers, clubs: allClubs } = JSON.parse(
  fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8")
);
const profiles = Object.fromEntries(
  JSON.parse(fs.readFileSync(new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8"))
    .profiles.map((profile) => [profile.clubId, profile])
);
const tierById = new Map(tiers.map((tier) => [tier.id, tier]));

let checks = 0;
const check = (name, condition, detail = "") => {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
};

// ---------------------------------------------------------------------------
// 1. Hele pyramiden kan velges, og lista er data
// ---------------------------------------------------------------------------
const groups = listSelectableClubs({ clubs: allClubs, tiers, profiles });
check("lista er gruppert etter nivå", groups.length === tiers.length, String(groups.length));
check("alle 60 klubbene kan velges", groups.reduce((sum, group) => sum + group.clubs.length, 0) === allClubs.length);
check("nivåene kommer i rekkefølge ovenfra", groups.every((group, index) => index === 0 || group.level > groups[index - 1].level));
for (const group of groups) {
  check(`${group.tierName}: klubbene er sortert sterkest først`,
    group.clubs.every((club, index) => index === 0 || club.strength <= group.clubs[index - 1].strength));
  for (const club of group.clubs) {
    check(`${club.name}: har bane og etikett i lista`, Boolean(club.ground && club.shortLabel));
    check(`${club.name}: har en forventning`, Boolean(club.expectationLabel));
  }
}

// Klubbene skal aldri stå i markupen — de er data.
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
for (const club of ["Rosenborg", "Bodø/Glimt", "Strømsgodset", "Skeid"]) {
  check(`«${club}» er ikke hardkodet i index.html`, !html.includes(club));
}
check("onboardingen har en beholder lista fylles i", html.includes('id="onboardingClubList"'));

// ---------------------------------------------------------------------------
// 2. Forventningen kommer fra klubbens standing — og den må SPRE seg
//
// En forventning som er lik for alle er ingen forventning. Det er samme måling
// som styleTraits-spredningen: en modell som ser ut til å virke fordi ingen har
// sett på fordelingen.
// ---------------------------------------------------------------------------
const expectations = allClubs.map((club) => ({
  club,
  expectation: deriveClubExpectation(club, allClubs, tierById.get(club.tier))
}));
check("hver klubb har en forventning", expectations.every((entry) => entry.expectation?.targetPosition));
const labels = new Set(expectations.map((entry) => entry.expectation.label));
check("forventningene er ikke alle like", labels.size >= 4, [...labels].join(", "));
const pressures = new Set(expectations.map((entry) => entry.expectation.pressure));
check("presset varierer", pressures.size === 3, [...pressures].join(", "));

// Og at den peker riktig vei: den sterkeste klubben på et nivå skal ha et
// hardere krav enn den svakeste.
for (const tier of tiers) {
  const inTier = expectations
    .filter((entry) => entry.club.tier === tier.id && (!tier.groups || tier.groups === 1 || entry.club.group === "avdeling1"))
    .sort((a, b) => b.club.strength - a.club.strength);
  const strongest = inTier[0];
  const weakest = inTier[inTier.length - 1];
  check(`${tier.name}: sterkeste klubb har hardere krav enn svakeste`,
    strongest.expectation.targetPosition < weakest.expectation.targetPosition,
    `${strongest.club.name} topp ${strongest.expectation.targetPosition} vs ${weakest.club.name} topp ${weakest.expectation.targetPosition}`);
  check(`${tier.name}: sterkeste klubb har høyt press`, strongest.expectation.pressure === "høy", strongest.club.name);
}

// Konkret, så forventningen kan leses av et menneske og ikke bare av en test.
const glimt = expectations.find((entry) => entry.club.id === "bodo_glimt").expectation;
check("Bodø/Glimt måles mot gullet", glimt.targetPosition === 1, glimt.label);
const kfum = expectations.find((entry) => entry.club.id === "kfum").expectation;
check("KFUM måles mot en trygg plass, ikke mot gull", kfum.targetPosition > 8, kfum.label);
check("KFUM har lavere press enn Bodø/Glimt", kfum.pressure === "lav" && glimt.pressure === "høy");

// ---------------------------------------------------------------------------
// 3. Styrets mål første sesong arves fra klubben
//
// Uten dette ville alle startet på «topp 8» — også den som tok over Bodø/Glimt.
// ---------------------------------------------------------------------------
const ownTarget = deriveSeasonTarget({ clubCount: 16, seasonNumber: 1 });
check("egenopprettet klubb får det tålmodige målet", ownTarget.targetPosition === 8 && !ownTarget.fromClub, ownTarget.label);
const glimtTarget = deriveSeasonTarget({ clubCount: 16, seasonNumber: 1, clubExpectation: glimt });
check("Bodø/Glimt-styret krever gull fra sesong én", glimtTarget.targetPosition === 1 && glimtTarget.fromClub === true, glimtTarget.label);
check("klubbmålet er hardere enn standardmålet", glimtTarget.targetPosition < ownTarget.targetPosition);
const kfumTarget = deriveSeasonTarget({ clubCount: 16, seasonNumber: 1, clubExpectation: kfum });
check("KFUM-styret er tålmodigere enn standardmålet", kfumTarget.targetPosition > ownTarget.targetPosition, kfumTarget.label);
// Andre sesong måles du mot deg selv igjen — klubbforventningen er et STARTPUNKT,
// ikke et tak som følger deg for alltid.
const secondSeason = deriveSeasonTarget({ clubCount: 16, seasonNumber: 2, previousPosition: 5, clubExpectation: glimt });
check("fra sesong to måles du mot din egen forrige plassering", secondSeason.targetPosition === 4, secondSeason.label);
// Og målet må få plass i tabellen.
for (const tier of tiers) {
  for (const entry of expectations.filter((item) => item.club.tier === tier.id)) {
    const target = deriveSeasonTarget({ clubCount: tier.groupSize, seasonNumber: 1, clubExpectation: entry.expectation });
    check(`${entry.club.name}: målet finnes i tabellen`, target.targetPosition >= 1 && target.targetPosition <= tier.groupSize, String(target.targetPosition));
  }
}

// ---------------------------------------------------------------------------
// 4. Tar du over en klubb, starter du der KLUBBEN står
// ---------------------------------------------------------------------------
for (const clubId of ["rosenborg", "odd", "skeid", "bjarg"]) {
  const club = allClubs.find((entry) => entry.id === clubId);
  const tier = tierById.get(club.tier);
  const managerClub = createManagerClubFromSelection({ club, profile: profiles[club.id] });
  check(`${club.name}: managerklubben arver nivået`, managerClub.tier === club.tier);
  check(`${club.name}: managerklubben arver bane og styrke`, managerClub.ground === club.ground && managerClub.strength === club.strength);
  check(`${club.name}: managerklubben arver klubbens stil`, managerClub.inheritedStyleName === profiles[club.id].styleName);
  check(`${club.name}: er merket som overtatt`, managerClub.isTakenOver === true);

  // Og sesongen må faktisk kunne settes opp: klubben er én av deltakerne, så
  // det skal stå igjen nøyaktig nok motstandere.
  const pool = allClubs.filter((entry) => entry.tier === tier.id && (!club.group || entry.group === club.group));
  const season = createLeagueSeason({ managerClub, opponents: pool, tier, seed: `overtakelse-${clubId}` });
  check(`${club.name}: sesongen har riktig antall klubber`, season.clubs.length === tier.groupSize, String(season.clubs.length));
  check(`${club.name}: klubben møter ikke seg selv`, new Set(season.clubs.map((entry) => entry.id)).size === tier.groupSize);
  check(`${club.name}: sesongen spilles på klubbens nivå`, season.competition.tierId === tier.id);
  check(`${club.name}: riktig antall runder`, season.competition.rounds === roundsForClubCount(tier.groupSize));
}

// Nivået sesongen faktisk starter på — målt, ikke lest ut av kildekoden. En
// vakt som bare leter etter et funksjonsnavn består selv om nivået ignoreres
// (det gjorde den: bitetesten «overtatt klubb starter likevel på toppnivået»
// gikk gjennom fordi navnet fortsatt sto der).
for (const clubId of ["rosenborg", "odd", "skeid", "bjarg", "traff"]) {
  const club = allClubs.find((entry) => entry.id === clubId);
  const start = resolveStartTier({ takeoverClub: club, tiers, clubs: allClubs });
  check(`${club.name}: starter på klubbens eget nivå`, start.tier.id === club.tier, `${start.tier.id} ≠ ${club.tier}`);
  check(`${club.name}: starter i klubbens egen avdeling`, (start.group || null) === (club.group || null), `${start.group} ≠ ${club.group}`);
  check(`${club.name}: motstanderne er fra samme nivå og avdeling`,
    start.opponents.every((entry) => entry.tier === club.tier && (!club.group || entry.group === club.group)));
  check(`${club.name}: motstanderlista fyller avdelingen`, start.opponents.length === tierById.get(club.tier).groupSize);
}
// Uten overtakelse starter man på toppnivået.
const defaultStart = resolveStartTier({ takeoverClub: null, tiers, clubs: allClubs });
check("egen klubb starter på nivå 1", defaultStart.tier.level === 1, defaultStart.tier.name);
check("egen klubb får ingen avdelingsbinding", defaultStart.group === null);

// En egenopprettet klubb har ingen arv og ingen nivåbinding.
const ownClub = createOwnManagerClub({ clubName: "Bislett FK", saveId: "save-1", tier: tierById.get("eliteserien") });
check("egen klubb får sitt eget navn", ownClub.name === "Bislett FK" && ownClub.ground === "Bislett FK stadion");
check("egen klubb arver ingen stil", ownClub.inheritedStyleName === null && ownClub.isTakenOver === false);
check("egen klubb bruker lagrings-id-en, ikke en klubb-id", ownClub.id === "save-1");
check("tomt klubbnavn gir ingen klubb", createOwnManagerClub({ clubName: "  ", saveId: "s" }) === null);

// ---------------------------------------------------------------------------
// 5. Det du IKKE arver må stå der før du velger
//
// Troppen følger ikke med. Sier ikke valget det, tror spilleren han får
// Rosenborgs lag — og klubbvalget ville dessuten omgått kjernesløyfen.
// ---------------------------------------------------------------------------
for (const clubId of ["rosenborg", "skeid"]) {
  const club = allClubs.find((entry) => entry.id === clubId);
  const summary = describeClubSelection({ club, tier: tierById.get(club.tier), allClubs, profile: profiles[club.id] });
  check(`${club.name}: oppsummeringen sier hva du arver`, summary.inherits.length >= 3);
  check(`${club.name}: oppsummeringen sier at troppen IKKE følger med`,
    summary.doesNotInherit.some((line) => /[Tt]ropp/.test(line)), JSON.stringify(summary.doesNotInherit));
  check(`${club.name}: oppsummeringen nevner nivået`, summary.inherits.some((line) => line.includes(summary.tierName)));
  check(`${club.name}: oppsummeringen nevner styrets krav`, summary.inherits.some((line) => line.includes("Styrets krav")));
  check(`${club.name}: standing er lesbar`, /\d+\. sterkeste klubb av \d+/.test(summary.standing), summary.standing);
}
const rank = rankClubInTier(allClubs.find((club) => club.id === "bodo_glimt"), allClubs);
check("sterkeste klubb rangeres først", rank.position === 1 && rank.of === 16, JSON.stringify(rank));

// ---------------------------------------------------------------------------
// 6. Motoren er ren, og app.js bruker den faktisk
// ---------------------------------------------------------------------------
const engineSource = fs.readFileSync(new URL("../src/football-club-selection.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("klubbvalgmotoren er ren", !/document|localStorage|fetch\(|Date\.now|Math\.random/.test(engineSource));

const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app.js bygger klubblista fra motoren", /listSelectableClubs\(/.test(app));
check("app.js viser hva valget innebærer", /describeClubSelection\(/.test(app));
check("app.js lager managerklubben fra valget", /createManagerClubFromSelection\(/.test(app));
check("app.js starter sesongen på den overtatte klubbens nivå", /resolveStartTier\(/.test(app));
check("app.js gir klubbforventningen til sesongmålet", /clubExpectation: getClubExpectation\(\)/.test(app));
check("valget lagres, så det overlever en omlasting", /takeoverClubId/.test(app));

console.log(JSON.stringify({
  ok: true, sjekker: checks,
  valgbareKlubber: allClubs.length,
  forventninger: [...labels].sort(),
  eksempler: {
    "Bodø/Glimt": `${glimt.label} (topp ${glimtTarget.targetPosition})`,
    "KFUM Oslo": `${kfum.label} (topp ${kfumTarget.targetPosition})`,
    "Egen klubb": `${ownTarget.label}`
  }
}, null, 2));
