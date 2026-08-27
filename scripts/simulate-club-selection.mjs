import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createManagerClubFromSelection,
  createOwnManagerClub,
  deriveClubExpectation,
  describeClubSelection,
  isClubTakeoverReady,
  listSelectableClubs,
  rankClubInTier,
  resolveStartTier
} from "../src/football-club-selection.js";
import { deriveSeasonTarget } from "../src/football-season-review.js";
import { createLeagueSeason, roundsForClubCount } from "../src/football-league-season.js";

const { tiers, clubs: allClubs } = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
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
// 1. Overtakelseslista viser bare klubber med spillbar dokumentert pool
// ---------------------------------------------------------------------------
const ready = allClubs.filter((club) => isClubTakeoverReady(club));
const pending = allClubs.filter((club) => !isClubTakeoverReady(club));
const groups = listSelectableClubs({ clubs: allClubs, tiers, profiles });
const selectable = groups.flatMap((group) => group.clubs);
const selectableIds = new Set(selectable.map((club) => club.id));

check("det finnes overtakbare klubber", ready.length > 0, String(ready.length));
// Alle 60 klubbene er overtakbare etter at Sotra ble landet, så det finnes
// ingen pending-klubb å måle mot lenger. Det som må holde er REGELEN — at en
// klubb uten ferdig pool holdes utenfor lista — og den måles mot en konstruert
// klubb i stedet for mot en tilstand katalogen har vokst fra.
const syntetiskPending = { ...allClubs[0], id: "syntetisk_pending", name: "Uferdig FK", playerPoolStatus: "pending", playerPoolSize: 0, playablePlayerPoolSize: 0 };
check("en klubb uten ferdig pool er ikke overtakbar", !isClubTakeoverReady(syntetiskPending));
check("en klubb uten ferdig pool havner ikke på lista",
  !listSelectableClubs({ clubs: [...allClubs, syntetiskPending], tiers, profiles })
    .flatMap((group) => group.clubs).some((club) => club.id === "syntetisk_pending"));
check("overtakelseslista inneholder nøyaktig ready-klubbene", selectable.length === ready.length,
  `${selectable.length}/${ready.length}`);
check("ingen pending-klubb kan velges", pending.every((club) => !selectableIds.has(club.id)));
check("alle ready-klubber kan velges", ready.every((club) => selectableIds.has(club.id)));
check("alle viste klubber har minst 15 spillere", selectable.every((club) => club.playerPoolSize >= 15));

for (const group of groups) {
  check(`${group.tierName}: klubbene er sortert sterkest først`,
    group.clubs.every((club, index) => index === 0 || club.strength <= group.clubs[index - 1].strength));
  for (const club of group.clubs) {
    check(`${club.name}: viser poolstørrelse`, Number.isFinite(Number(club.playerPoolSize)) && club.playerPoolSize >= 15);
    check(`${club.name}: har forventning`, Boolean(club.expectationLabel));
  }
}

// Backward compatibility: fixtures uten poolmetadata skal ikke forsvinne bare
// fordi eldre tester/data ikke er migrert ennå.
check("legacy-klubb uten poolmetadata anses spillbar", isClubTakeoverReady({ id: "legacy" }) === true);
check("eksplisitt pending klubb anses ikke spillbar", isClubTakeoverReady({ id: "pending", playerPoolStatus: "pending", playerPoolSize: 14 }) === false);

// ---------------------------------------------------------------------------
// 2. Forventningene kommer fortsatt fra standing, ikke spillerpoolen
// ---------------------------------------------------------------------------
const expectations = allClubs.map((club) => ({
  club,
  expectation: deriveClubExpectation(club, allClubs, tierById.get(club.tier))
}));
check("hver klubb har en forventning", expectations.every((entry) => entry.expectation?.targetPosition));
const labels = new Set(expectations.map((entry) => entry.expectation.label));
check("forventningene sprer seg", labels.size >= 4, [...labels].join(", "));
check("alle tre pressnivåer finnes", new Set(expectations.map((entry) => entry.expectation.pressure)).size === 3);

for (const tier of tiers) {
  const inTier = expectations
    .filter((entry) => entry.club.tier === tier.id && (!tier.groups || tier.groups === 1 || entry.club.group === "avdeling1"))
    .sort((a, b) => b.club.strength - a.club.strength);
  if (inTier.length < 2) continue;
  check(`${tier.name}: sterkeste har hardere mål enn svakeste`,
    inTier[0].expectation.targetPosition < inTier[inTier.length - 1].expectation.targetPosition);
}

const glimt = expectations.find((entry) => entry.club.id === "bodo_glimt")?.expectation;
const kfum = expectations.find((entry) => entry.club.id === "kfum")?.expectation;
check("Bodø/Glimt måles mot gull", glimt?.targetPosition === 1, glimt?.label || "");
check("KFUM har mykere mål enn Glimt", kfum?.targetPosition > glimt?.targetPosition);

const ownTarget = deriveSeasonTarget({ clubCount: 16, seasonNumber: 1 });
const glimtTarget = deriveSeasonTarget({ clubCount: 16, seasonNumber: 1, clubExpectation: glimt });
check("egen klubb beholder standardmål", ownTarget.targetPosition === 8 && !ownTarget.fromClub);
check("Glimt-styret overstyrer standardmålet", glimtTarget.targetPosition === 1 && glimtTarget.fromClub === true);

// ---------------------------------------------------------------------------
// 3. Ready-klubb kan bygges til managerklubb og starter på riktig nivå
// ---------------------------------------------------------------------------
for (const club of ready) {
  const tier = tierById.get(club.tier);
  const managerClub = createManagerClubFromSelection({ club, profile: profiles[club.id] });
  check(`${club.name}: managerklubben kan opprettes`, Boolean(managerClub));
  check(`${club.name}: arver nivå`, managerClub.tier === club.tier);
  check(`${club.name}: arver klubbpoolmetadata`, managerClub.playerPoolSize === club.playerPoolSize && managerClub.playerPoolStatus === club.playerPoolStatus);

  const start = resolveStartTier({ takeoverClub: club, tiers, clubs: allClubs });
  check(`${club.name}: starter på eget nivå`, start.tier.id === club.tier);
  check(`${club.name}: starter i egen avdeling`, (start.group || null) === (club.group || null));

  const season = createLeagueSeason({ managerClub, opponents: start.opponents, tier: start.tier, seed: `pool-${club.id}` });
  check(`${club.name}: sesongen har riktig klubbantall`, season.clubs.length === tier.groupSize,
    `${season.clubs.length}/${tier.groupSize}`);
  check(`${club.name}: riktig antall runder`, season.competition.rounds === roundsForClubCount(tier.groupSize));
}

// Pending kan fortsatt leses som data og eksisterende gamle saves kan migreres,
// men ny onboarding skal aldri tilby dem.
for (const club of pending.slice(0, 5)) {
  check(`${club.name}: er ikke i ny overtakelsesliste`, !selectableIds.has(club.id));
}

// Egen klubb er uavhengig av historisk pool.
const ownClub = createOwnManagerClub({ clubName: "Bislett FK", saveId: "save-1", tier: tierById.get("eliteserien") });
check("egen klubb opprettes", ownClub?.name === "Bislett FK" && ownClub.isTakenOver === false);
check("egen klubb bruker save-id", ownClub.id === "save-1");
check("tomt klubbnavn avvises", createOwnManagerClub({ clubName: "  ", saveId: "s" }) === null);

// ---------------------------------------------------------------------------
// 4. Oppsummeringen forklarer poolreglene før valget
// ---------------------------------------------------------------------------
for (const club of ready.slice(0, 10)) {
  const summary = describeClubSelection({ club, tier: tierById.get(club.tier), allClubs, profile: profiles[club.id] });
  check(`${club.name}: oppsummeringen viser dokumentert pool`, summary.playerPoolReady && summary.playerPoolSize >= 15);
  check(`${club.name}: oppsummeringen sier grunntropp fra klubbpool`,
    summary.doesNotInherit.some((line) => /grunntropp.*klubbens egen spillerpool/i.test(line)), JSON.stringify(summary.doesNotInherit));
  check(`${club.name}: oppsummeringen sier hvordan resten åpnes`,
    summary.doesNotInherit.some((line) => /Resten av klubbpoolen åpnes/.test(line)));
  check(`${club.name}: standing er lesbar`, /\d+\. sterkeste klubb av \d+/.test(summary.standing), summary.standing);
}

const bodoGlimt = allClubs.find((club) => club.id === "bodo_glimt");
const rank = rankClubInTier(bodoGlimt, allClubs);
const glimtPeers = allClubs.filter((club) =>
  club.tier === bodoGlimt.tier && (!bodoGlimt.group || club.group === bodoGlimt.group));
check("sterkeste klubb rangeres først mot dagens faktiske divisjonsstørrelse",
  rank.position === 1 && rank.of === glimtPeers.length,
  `${JSON.stringify(rank)} / faktiske peers ${glimtPeers.length}`);

// ---------------------------------------------------------------------------
// 5. App/markup bruker datadrevet liste
// ---------------------------------------------------------------------------
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
check("onboardingen har klubbbeholder", html.includes('id="onboardingClubList"'));
for (const name of ["Rosenborg", "Bodø/Glimt", "Strømsgodset", "Skeid"]) {
  check(`${name} er ikke hardkodet i markup`, !html.includes(name));
}

const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app bygger klubblista fra motoren", /listSelectableClubs\(/.test(app));
check("app viser konsekvensen av klubbvalg", /describeClubSelection\(/.test(app));
check("app lagrer takeoverClubId", /takeoverClubId/.test(app));

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  totalKlubber: allClubs.length,
  overtakbareKlubber: ready.length,
  pendingKlubber: pending.length,
  nivåerMedOvertakelse: groups.map((group) => `${group.tierName}: ${group.clubs.length}`)
}, null, 2));
