// Revisjon av seriepyramiden (data/football_clubs.json).
//
// Klubben eier IDENTITET og NIVÅ. Fotballen — hvordan klubben spiller — ligger
// i football_league_club_profiles.json. Denne vakten passer på skillet, og på at
// pyramiden faktisk henger sammen: at nivåene peker på hverandre begge veier, at
// hver avdeling har akkurat så mange klubber som formatet sier, og at ingen
// klubb finnes to steder.
//
// Hvorfor det trengs: en pyramide som ikke stemmer feiler ikke høylytt. Den
// feiler ved at et opprykk lander på et nivå med 15 klubber, og sesongen kastes
// midt i en karriere — eller ved at en klubb står i to divisjoner og møter seg
// selv. Samme klasse som resten: ingen feilmelding, bare feil spill.
import assert from "node:assert/strict";
import fs from "node:fs";

const doc = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
const profilesDoc = JSON.parse(fs.readFileSync(new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8"));

let checks = 0;
const check = (name, condition, detail = "") => {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
};

check("schema er satt", doc.schema === "historygo-football-manager.clubs.v1", doc.schema);
check("pyramiden har nivåer", Array.isArray(doc.tiers) && doc.tiers.length >= 2);
check("pyramiden har klubber", Array.isArray(doc.clubs) && doc.clubs.length > 0);

const tierById = new Map(doc.tiers.map((tier) => [tier.id, tier]));

// --- Nivåene ---------------------------------------------------------------
const levels = doc.tiers.map((tier) => tier.level);
check("nivåene er unike", new Set(levels).size === levels.length, levels.join(","));
check("nivåene starter på 1", Math.min(...levels) === 1);
check("nivåene er sammenhengende", levels.slice().sort((a, b) => a - b).every((level, index) => level === index + 1), levels.join(","));

for (const tier of doc.tiers) {
  const label = tier.name || tier.id;
  check(`${label}: har navn og id`, Boolean(tier.id && tier.name));
  check(`${label}: avdelingsstørrelse er partall`, tier.groupSize % 2 === 0, String(tier.groupSize));
  check(`${label}: klubbtall = avdelinger × avdelingsstørrelse`, tier.clubCount === tier.groups * tier.groupSize, `${tier.clubCount} ≠ ${tier.groups} × ${tier.groupSize}`);
  check(`${label}: runder stemmer med avdelingsstørrelsen`, tier.rounds === (tier.groupSize - 1) * 2, `${tier.rounds} ≠ (${tier.groupSize} − 1) × 2`);
  check(`${label}: styrkebånd er stigende`, Array.isArray(tier.strengthBand) && tier.strengthBand[0] < tier.strengthBand[1], JSON.stringify(tier.strengthBand));

  // Opprykk peker oppover, nedrykk nedover — og på et nivå som finnes.
  if (tier.promotion) {
    const target = tierById.get(tier.promotion.toTier);
    check(`${label}: opprykk peker på et nivå som finnes`, Boolean(target), tier.promotion.toTier);
    check(`${label}: opprykk peker oppover`, target.level < tier.level, `${target.level} ikke over ${tier.level}`);
  } else {
    check(`${label}: bare toppnivået mangler opprykk`, tier.level === 1);
  }
  if (tier.relegation?.toTier) {
    const target = tierById.get(tier.relegation.toTier);
    check(`${label}: nedrykk peker på et nivå som finnes`, Boolean(target), tier.relegation.toTier);
    check(`${label}: nedrykk peker nedover`, target.level > tier.level, `${target.level} ikke under ${tier.level}`);
  } else {
    check(`${label}: bare bunnivået mangler nedrykk`, tier.level === Math.max(...levels));
  }
  // Opp- og nedrykksplasser må få plass i tabellen, ellers overlapper de.
  const up = (Number(tier.promotion?.direct) || 0) + (Number(tier.promotion?.playoff) || 0);
  const down = (Number(tier.relegation?.direct) || 0) + (Number(tier.relegation?.playoff) || 0);
  check(`${label}: opp- og nedrykksplasser overlapper ikke`, up + down < tier.groupSize, `${up} opp + ${down} ned i en tabell på ${tier.groupSize}`);
}

// Nivåene må peke på hverandre begge veier: rykker du opp fra B til A, må A
// kunne sende deg ned til B igjen. Ellers er karrieren en enveisbillett.
for (const tier of doc.tiers) {
  if (!tier.promotion) continue;
  const above = tierById.get(tier.promotion.toTier);
  check(`${above.name} sender ned til ${tier.name}`, above.relegation?.toTier === tier.id, `${above.relegation?.toTier}`);
}

// --- Klubbene --------------------------------------------------------------
const ids = doc.clubs.map((club) => club.id);
check("klubb-id-ene er unike", new Set(ids).size === ids.length);
check("klubbnavnene er unike", new Set(doc.clubs.map((club) => club.name)).size === doc.clubs.length);

for (const club of doc.clubs) {
  check(`${club.name}: har id, bane og by`, Boolean(club.id && club.ground && club.city));
  const tier = tierById.get(club.tier);
  check(`${club.name}: står på et nivå som finnes`, Boolean(tier), club.tier);
  check(`${club.name}: styrke er innenfor nivåets bånd`, club.strength >= tier.strengthBand[0] && club.strength <= tier.strengthBand[1], `${club.strength} utenfor ${tier.strengthBand.join("–")}`);
  // Klubben eier nivået, profilen eier fotballen. Ingen stil-felter her.
  for (const forbidden of ["tacticalIdentity", "matchupStyles", "styleName", "archetypeId", "styleTraits"]) {
    check(`${club.name}: har ikke «${forbidden}» (det hører i profilen)`, !(forbidden in club));
  }
  if (tier.groups > 1) check(`${club.name}: har avdeling`, Boolean(club.group));
  else check(`${club.name}: har ikke avdeling på et udelt nivå`, !club.group);
}

// Hvert nivå og hver avdeling må være nøyaktig full. En avdeling med 15 klubber
// kaster sesongen først når noen faktisk rykker opp dit.
for (const tier of doc.tiers) {
  const inTier = doc.clubs.filter((club) => club.tier === tier.id);
  check(`${tier.name}: har ${tier.clubCount} klubber`, inTier.length === tier.clubCount, String(inTier.length));
  if (tier.groups > 1) {
    const groups = [...new Set(inTier.map((club) => club.group))];
    check(`${tier.name}: har ${tier.groups} avdelinger`, groups.length === tier.groups, groups.join(","));
    for (const group of groups) {
      const inGroup = inTier.filter((club) => club.group === group);
      check(`${tier.name}/${group}: har ${tier.groupSize} klubber`, inGroup.length === tier.groupSize, String(inGroup.length));
    }
  }
}

// --- Kobling til spillestilprofilene ---------------------------------------
// Toppnivået møter du to ganger i året. Der er en manglende profil det samme som
// en klubb uten fotball, og da faller den tilbake på noe generisk uten å si fra.
const profileIds = new Set(profilesDoc.profiles.map((profile) => profile.clubId));
const topTier = doc.tiers.find((tier) => tier.level === 1);
for (const club of doc.clubs.filter((entry) => entry.tier === topTier.id)) {
  check(`${club.name}: har spillestilprofil`, profileIds.has(club.id));
}
for (const profile of profilesDoc.profiles) {
  check(`profil ${profile.clubId}: peker på en klubb som finnes`, ids.includes(profile.clubId));
  check(`profil ${profile.clubId}: setter ikke styrke (nivået eies av klubben)`, !("strength" in profile));
}

console.log(JSON.stringify({
  ok: true, sjekker: checks,
  nivåer: doc.tiers.map((tier) => `${tier.name} (nivå ${tier.level}): ${tier.clubCount} klubber, ${tier.rounds} runder`),
  klubber: doc.clubs.length,
  medProfil: doc.clubs.filter((club) => profileIds.has(club.id)).length
}, null, 2));
