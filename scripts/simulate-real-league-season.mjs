import assert from "node:assert/strict";
import {
  createLeagueSeason, createLeagueTable, completeLeagueRound, getNextLeagueOpponent,
  startNextLeagueSeason, normalizeLeagueSeason, roundsForClubCount, longestVenueRun,
  classifyLeaguePosition, resolveLeagueOutcome
} from "../src/football-league-season.js";
import { getHistoricalOpponentProfileIds } from "../src/football-historical-opponent-profiles.js";
import fs from "node:fs";

// ---------------------------------------------------------------------------
// Seriepyramiden er kilden: Eliteserien / OBOS-ligaen / 2. divisjon.
// Motoren eier FORMATET, datafila eier klubbene og nivåene.
// ---------------------------------------------------------------------------
const pyramid = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
const { tiers, clubs: allClubs } = pyramid;
const topTier = tiers.find((tier) => tier.level === 1);
const LEAGUE_OPPONENT_PROFILES = allClubs.filter((club) => club.tier === topTier.id);

const managerClub = { id: "manager-fk", name: "Manager FK", ground: "Klubbankeret", city: "Testby", strength: 75, form: 55, tacticalIdentity: "managerens valg" };
const opponentsFor = (tier) => {
  const pool = allClubs.filter((club) => club.tier === tier.id);
  if (tier.groups <= 1) return pool;
  const group = [...new Set(pool.map((club) => club.group))].sort()[0];
  return pool.filter((club) => club.group === group);
};
const fresh = (tier = topTier) => createLeagueSeason({ managerClub, opponents: opponentsFor(tier), tier, seed: "qa-seed" });

// Serien spilles slik den faktisk spilles: 16 lag, 30 runder, 240 kamper.
const season = fresh();
const TOP_CLUBS = topTier.groupSize;
const TOP_ROUNDS = roundsForClubCount(TOP_CLUBS);
assert.equal(TOP_CLUBS, 16, "Eliteserien skal ha 16 lag, slik den spilles i dag");
assert.equal(TOP_ROUNDS, 30, "16 lag hjemme og borte er 30 runder");
assert.equal(season.clubs.length, TOP_CLUBS);
assert.equal(season.fixtures.length, TOP_ROUNDS);
assert.equal(season.fixtures.flatMap((round) => round.matches).length, TOP_ROUNDS * (TOP_CLUBS / 2));
for (const round of season.fixtures) {
  assert.equal(round.matches.length, TOP_CLUBS / 2);
  assert.equal(new Set(round.matches.flatMap((match) => [match.homeClubId, match.awayClubId])).size, TOP_CLUBS);
  assert.ok(round.matches.every((match) => match.homeClubId !== match.awayClubId));
}
const matches = season.fixtures.flatMap((round) => round.matches);
assert.equal(new Set(matches.map((match) => match.id)).size, matches.length);
assert.deepEqual(fresh().fixtures, season.fixtures, "terminlisten er ikke deterministisk");
const pairs = new Map();
for (const match of matches) {
  const key = [match.homeClubId, match.awayClubId].sort().join(":");
  pairs.set(key, [...(pairs.get(key) || []), `${match.homeClubId}>${match.awayClubId}`]);
}
assert.equal(pairs.size, (TOP_CLUBS * (TOP_CLUBS - 1)) / 2);
for (const meetings of pairs.values()) assert.equal(new Set(meetings).size, 2, "et par møtes ikke én gang hver vei");

// ---------------------------------------------------------------------------
// Terminlisten: ingen lange hjemme-/bortestrekk
//
// Den gamle terminlisten ga HVER klubb sju strake bortekamper og så sju strake
// hjemmekamper. Ingen feilmelding — tabellen summerte riktig, hver motstander
// ble møtt to ganger, og ingen vakt så på rekkefølgen. Med 16 lag ville det
// blitt femten strake. Feilen lå i hjemme/borte-regelen: den brukte plassen i
// rotasjonen, som betyr noe helt annet for et lag som roterer enn for det faste.
//
// Dette er samme klasse som skalafeilene i CLAUDE.md: bare en MÅLING avslører
// den. Så her måles den, på hvert nivå, for hver klubb.
// ---------------------------------------------------------------------------
const MAX_VENUE_RUN = 2;
for (const tier of tiers) {
  const tierSeason = fresh(tier);
  for (const club of tierSeason.clubs) {
    const run = longestVenueRun(tierSeason, club.id);
    assert.ok(run <= MAX_VENUE_RUN, `${tier.name}: ${club.name} har ${run} kamper på rad på samme bane`);
  }
  // Og ingen møter samme motstander to runder på rad (skjøten mellom halvsesongene).
  for (const club of tierSeason.clubs) {
    let previous = null;
    for (const round of tierSeason.fixtures) {
      const match = round.matches.find((entry) => entry.homeClubId === club.id || entry.awayClubId === club.id);
      const opponent = match.homeClubId === club.id ? match.awayClubId : match.homeClubId;
      assert.notEqual(opponent, previous, `${tier.name}: ${club.name} møter ${opponent} to runder på rad`);
      previous = opponent;
    }
  }
}

// Hvert nivå spilles med sitt eget format.
for (const tier of tiers) {
  const tierSeason = fresh(tier);
  assert.equal(tierSeason.clubs.length, tier.groupSize, `${tier.name} har feil antall klubber`);
  assert.equal(tierSeason.competition.rounds, roundsForClubCount(tier.groupSize), `${tier.name} har feil antall runder`);
  assert.equal(tierSeason.competition.tierId, tier.id);
}

const firstOpponent = getNextLeagueOpponent(season);
let played = completeLeagueRound(season, { score: { for: 2, against: 1 } });
assert.equal(played.currentRound, 2); assert.equal(played.fixtures[0].status, "completed");
assert.equal(played.fixtures[0].matches.filter((match) => match.status === "completed").length, TOP_CLUBS / 2);
assert.equal(played.completedMatchIds.length, TOP_CLUBS / 2);
assert.notEqual(getNextLeagueOpponent(played).matchId, firstOpponent.matchId);
let table = createLeagueTable(played); assert.equal(table.length, TOP_CLUBS); assert.equal(table.reduce((sum, row) => sum + row.played, 0), TOP_CLUBS);
assert.ok(table.every((row) => row.goalDifference === row.goalsFor - row.goalsAgainst));
assert.equal(table.reduce((sum, row) => sum + row.won, 0), table.reduce((sum, row) => sum + row.lost, 0));
assert.deepEqual(createLeagueTable(played), table);
for (let round = 2; round <= TOP_ROUNDS; round++) played = completeLeagueRound(played, { score: { for: round % 3, against: (round + 1) % 3 } });
assert.equal(played.status, "completed"); assert.equal(played.currentRound, TOP_ROUNDS);
assert.equal(played.completedMatchIds.length, TOP_ROUNDS * (TOP_CLUBS / 2));
assert.equal(getNextLeagueOpponent(played), null);
assert.deepEqual(normalizeLeagueSeason(JSON.parse(JSON.stringify(played))), played);
// En lagret sesong der format og klubbtall ikke henger sammen skal forkastes,
// ikke lastes inn halvveis.
assert.equal(normalizeLeagueSeason({ ...played, clubs: played.clubs.slice(0, 15) }), null);

const next = startNextLeagueSeason(played, { allClubs, tiers });
assert.equal(next.status, "active"); assert.equal(next.currentRound, 1);
assert.equal(createLeagueTable(next).every((row) => row.played === 0), true);
assert.equal(next.managerClubId, played.managerClubId);
assert.notDeepEqual(next.fixtures, played.fixtures);

// ---------------------------------------------------------------------------
// Opp- og nedrykk: karrieren har et sted å gå
//
// Uten dette er en managerkarriere en flat linje — samme nivå, samme sytten
// motstandere, sesong etter sesong. Reglene kommer fra pyramiden, ikke fra
// motoren, og de skal stemme med hvordan seriene faktisk spilles.
// ---------------------------------------------------------------------------
for (const tier of tiers) {
  const size = tier.groupSize;
  const verdicts = Array.from({ length: size }, (_, index) => classifyLeaguePosition(index + 1, size, tier));
  // Hver plass må ha en dom — ingen udefinerte hull.
  assert.ok(verdicts.every((verdict) => verdict.movement && verdict.reason), `${tier.name}: en plassering mangler dom`);
  const directUp = verdicts.filter((verdict) => verdict.movement === "promoted").length;
  const playoffUp = verdicts.filter((verdict) => verdict.movement === "promotion_playoff").length;
  const directDown = verdicts.filter((verdict) => verdict.movement === "relegated").length;
  const playoffDown = verdicts.filter((verdict) => verdict.movement === "relegation_playoff").length;
  assert.equal(directUp, Number(tier.promotion?.direct) || 0, `${tier.name}: feil antall direkte opprykk`);
  assert.equal(playoffUp, Number(tier.promotion?.playoff) || 0, `${tier.name}: feil antall opprykkskvalifiseringer`);
  assert.equal(directDown, tier.relegation?.toTier ? Number(tier.relegation.direct) || 0 : 0, `${tier.name}: feil antall direkte nedrykk`);
  assert.equal(playoffDown, tier.relegation?.toTier ? Number(tier.relegation.playoff) || 0 : 0, `${tier.name}: feil antall nedrykkskvalifiseringer`);
  // Toppen har ingen vei opp, bunnen ingen vei ned — og begge deler skal SIES.
  if (!tier.promotion) assert.equal(verdicts[0].movement, "champion", `${tier.name}: førsteplassen er ikke seriegull`);
  if (!tier.relegation?.toTier) assert.equal(verdicts[size - 1].movement, "bottom", `${tier.name}: bunnplassen later som den er grei`);
  // Opprykk peker oppover, nedrykk nedover.
  for (const verdict of verdicts) {
    if (verdict.movement === "promoted") assert.ok(tiers.find((entry) => entry.id === verdict.toTierId).level < tier.level, `${tier.name}: opprykk peker ikke oppover`);
    if (verdict.movement === "relegated") assert.ok(tiers.find((entry) => entry.id === verdict.toTierId).level > tier.level, `${tier.name}: nedrykk peker ikke nedover`);
  }
}

// Hele stigen, spilt: fra bunnen til toppen og ned igjen.
const bottomTier = tiers.find((tier) => tier.level === Math.max(...tiers.map((entry) => entry.level)));
const climbStart = { ...managerClub, tier: bottomTier.id, group: "avdeling1" };
let climb = createLeagueSeason({ managerClub: climbStart, opponents: opponentsFor(bottomTier), tier: bottomTier, seed: "stige" });
const climbed = [];
for (let seasonIndex = 0; seasonIndex < 3; seasonIndex += 1) {
  while (climb.status === "active") climb = completeLeagueRound(climb, { score: { for: 4, against: 0 } });
  climbed.push(resolveLeagueOutcome(climb).tierId);
  climb = startNextLeagueSeason(climb, { allClubs, tiers });
}
assert.deepEqual(climbed, ["andredivisjon", "obosligaen", "eliteserien"], `vinner du alt, skal du klatre — fikk ${climbed.join(" → ")}`);
assert.equal(climb.competition.tierId, "eliteserien", "manageren havnet ikke i Eliteserien etter to opprykk");

let fall = createLeagueSeason({ managerClub: { ...managerClub, tier: topTier.id }, opponents: opponentsFor(topTier), tier: topTier, seed: "fall" });
const fell = [];
for (let seasonIndex = 0; seasonIndex < 2; seasonIndex += 1) {
  while (fall.status === "active") fall = completeLeagueRound(fall, { score: { for: 0, against: 4 } });
  fell.push(resolveLeagueOutcome(fall).tierId);
  fall = startNextLeagueSeason(fall, { allClubs, tiers });
}
assert.deepEqual(fell, ["eliteserien", "obosligaen"], `taper du alt, skal du falle — fikk ${fell.join(" → ")}`);

// ---------------------------------------------------------------------------
// Ligaen skal være fotball, ikke aritmetikk
//
// Hver klubb spiller SIN EGEN stil, tegnet på klubbens spilletradisjon. Dette
// steget måler at en HEL sesong faktisk byr på ulike motstandere — det er den
// målingen som mangler når feilen er «alt ser riktig ut, men alle er like».
//
// Feilen den ville fanget: oppslaget i app.js lette etter klubb-id-en blant de
// fem GENERISKE profilene (`high_press_opponent` …), der en klubb-id aldri kan
// finnes. Fallbacken slo derfor inn hver eneste gang, og alle fjorten runder
// ble spilt mot samme profil med byttet navnelapp. Ingen feilmelding, ingen
// rød vakt — bare en sesong uten variasjon.
//
// Og feilen ETTER den: første retting ga klubbene HISTORISKE arketyper, så
// Molde «var» Barcelona 2008–12. Det brant opp arketypene, som hører til
// scenarioer og mesterskap. Derfor krever vakten nå at ligaprofilene er
// klubbenes egne — ingen av dem får peke på en historisk arketyp.
// ---------------------------------------------------------------------------
const clubProfilesFile = JSON.parse(
  fs.readFileSync(new URL("../data/football_league_club_profiles.json", import.meta.url), "utf8")
);
const clubProfiles = new Map(clubProfilesFile.profiles.map((profile) => [profile.clubId, profile]));
const archetypeIds = new Set(getHistoricalOpponentProfileIds());

// Vaktene gjelder HELE pyramiden, ikke bare toppnivået. Rykker du ned, møter du
// de klubbene tretti runder i strekk — ensartethet der er nøyaktig like ille.
// Første forslag var generiske «stilfamilier» for de lavere nivåene; det var
// feil, for klubbene der nede har storhetstider også (Moss 1987, Stabæk 2008,
// Strømsgodset 1970 og 2013, Lyn 1964/68, Skeid åtte cupgull, Odd tolv).
for (const club of allClubs) {
  const profile = clubProfiles.get(club.id);
  assert.ok(profile, `${club.name} mangler spillestilprofil`);
  assert.ok(profile.styleName, `${club.name} mangler styleName`);
  assert.ok(profile.matchupStyles?.length >= 2, `${club.name} har for få matchupStyles`);
  assert.ok(profile.styleTraits && Object.keys(profile.styleTraits).length >= 8, `${club.name} har for tynne styleTraits`);
  assert.ok(profile.keyBattles?.length >= 1 && profile.managerHints?.length >= 1, `${club.name} forklarer ikke hva du møter`);
  // Klubben spiller seg selv, ikke et kostyme.
  assert.ok(!archetypeIds.has(profile.styleName), `${club.name} bruker en historisk arketyp som stil`);
  assert.ok(!("archetypeId" in profile), `${club.name} peker på en historisk arketyp`);
  // Profilen leverer stilen, ikke nivået.
  assert.ok(!("strength" in profile), `${club.name} setter styrke i profilen — nivået eies av klubben`);
}
// Unikhet måles PER AVDELING — det er der du møter alle to ganger. To klubber i
// hver sin divisjon kan gjerne ligne; de deler aldri en sesong.
const groupsOfClubs = new Map();
for (const club of allClubs) {
  const key = club.group ? `${club.tier}/${club.group}` : club.tier;
  groupsOfClubs.set(key, [...(groupsOfClubs.get(key) || []), club]);
}
for (const [key, group] of groupsOfClubs) {
  assert.equal(
    new Set(group.map((club) => clubProfiles.get(club.id).styleName)).size, group.length,
    `${key}: to klubber deler spillestil — da mister sesongen variasjon`
  );
  // Ulikt NAVN er ikke nok: to klubber kan hete forskjellig og likevel spille
  // helt likt for motorene. Det er stil-fingeravtrykket som må være unikt.
  assert.equal(
    new Set(group.map((club) => [...clubProfiles.get(club.id).matchupStyles].sort().join("+"))).size, group.length,
    `${key}: to klubber har identisk matchupStyles — ulikt navn, samme fotball`
  );
}

// Er du usikker på hvordan en klubb spilte, ta utgangspunkt i storhetstiden —
// den da de faktisk vant. «tradisjon» er ikke en epoke, det er en unnvikelse:
// det er nettopp den formuleringen som lot Vålerenga og Lillestrøm gli sammen
// til det samme duellslaget. Derfor må hver profil peke på et konkret årstall.
for (const club of allClubs) {
  assert.ok(
    /\b(18|19|20)\d{2}\b/.test(String(clubProfiles.get(club.id).era)),
    `${club.name}: era «${clubProfiles.get(club.id).era}» navngir ingen storhetstid`
  );
}

// Hvert token må finnes i formasjonskunnskapens vokabular. En skrivefeil her gir
// ingen feilmelding — matchupen scorer bare stille null på det tokenet.
const styleVocab = new Set(
  JSON.parse(fs.readFileSync(new URL("../data/hgFootball/formationKnowledge.json", import.meta.url), "utf8")).vocab.opponentStyles
);
for (const club of allClubs) {
  for (const token of clubProfiles.get(club.id).matchupStyles) {
    assert.ok(styleVocab.has(token), `${club.name}: ukjent spillestil-token «${token}»`);
  }
}

// Den korte etiketten spilleren ser først må beskrive SAMME fotball som profilen.
// Den bodde tidligere på klubben, i en annen fil enn fotballen den beskrev, og
// drev fra hverandre: Lillestrøm sto med «raske vendinger» i lista lenge etter
// at profilen var rettet til langball og dueller. Nå bor den i profilen — og
// vakten sørger for at duplikatet ikke sniker seg tilbake.
for (const club of allClubs) {
  assert.ok(!("tacticalIdentity" in club), `${club.name}: klubbdataene har fått en stil-etikett igjen — den hører i profilen, ellers driver de fra hverandre`);
}
const IDENTITY_STOPWORDS = new Set(["ballen", "vinnes", "deres", "eller", "gjennom", "andre", "uten"]);
for (const club of allClubs) {
  const profile = clubProfiles.get(club.id);
  assert.ok(profile.shortLabel, `${club.name}: mangler kort etikett`);
  const blob = [profile.styleName, profile.tacticalSchool, profile.style, profile.historicalNote, profile.inPossessionShape, profile.outOfPossessionShape, profile.buildUpStyle, profile.attackingStyle].join(" ").toLowerCase();
  const words = String(profile.shortLabel).toLowerCase().split(/[^0-9a-zæøå-]+/).filter((word) => word.length >= 4 && !IDENTITY_STOPWORDS.has(word));
  assert.ok(words.length >= 1, `${club.name}: etiketten er for tynn til å si noe`);
  assert.ok(
    words.some((word) => blob.includes(word)),
    `${club.name}: etiketten «${profile.shortLabel}» beskriver ikke stilen i profilen`
  );
}

assert.equal(LEAGUE_OPPONENT_PROFILES.length, 16, "Eliteserien har ikke 16 klubber");
assert.equal(clubProfilesFile.profiles.length, allClubs.length, "ikke alle klubbene i pyramiden har spillestilprofil");
// `styleBasis` skiller dokumentert spilletradisjon fra klubbkarakter. En klubb
// som aldri har vunnet noe har ingen tradisjon å slå opp, og da er det ærligere
// å si det enn å dikte opp en. Men da må notatet SI at det er karakter.
for (const club of allClubs) {
  const profile = clubProfiles.get(club.id);
  assert.ok(["tradisjon", "klubbkarakter"].includes(profile.styleBasis), `${club.name}: styleBasis må være tradisjon eller klubbkarakter`);
  if (profile.styleBasis === "klubbkarakter") {
    assert.ok(
      /klubbkarakter/.test(profile.historicalNote),
      `${club.name}: profilen er klubbkarakter, men notatet later som den er en spilletradisjon`
    );
  }
}

// Gå gjennom en hel sesong og se hvem du faktisk møter.
const styles = new Map();
const styleTokens = new Set();
let walk = fresh();
const OPPONENT_COUNT = TOP_CLUBS - 1;
for (let round = 1; round <= TOP_ROUNDS; round += 1) {
  const opponent = getNextLeagueOpponent(walk);
  assert.ok(opponent, `runde ${round} har ingen motstander`);
  const profile = clubProfiles.get(opponent.id);
  assert.ok(profile, `runde ${round}: ${opponent.name} har ingen spillestilprofil`);
  styles.set(profile.styleName, (styles.get(profile.styleName) || 0) + 1);
  profile.matchupStyles.forEach((token) => styleTokens.add(token));
  walk = completeLeagueRound(walk, { score: { for: 1, against: 1 } });
}
assert.equal(styles.size, OPPONENT_COUNT, `sesongen bød på ${styles.size} ulike spillestiler, ikke ${OPPONENT_COUNT}`);
for (const [name, count] of styles) assert.equal(count, 2, `${name} møtes ${count} ganger, ikke to (hjemme + borte)`);
assert.equal(styleTokens.size, 16, `bare ${styleTokens.size} ulike spillestil-tokens i sesongen — hele vokabularet skal være i bruk`);

// Og det samme målt på HVERT nivå, ikke bare toppen. Rykker du ned i OBOS,
// spiller du tretti runder der — en divisjon med generiske klubber ville vært
// nøyaktig den ensartetheten denne vakten finnes for, bare ett hakk lenger ned.
const perTier = {};
for (const tier of tiers) {
  let tierWalk = fresh(tier);
  const tierStyles = new Set();
  const tierTokens = new Set();
  const rounds = roundsForClubCount(tier.groupSize);
  for (let round = 1; round <= rounds; round += 1) {
    const opponent = getNextLeagueOpponent(tierWalk);
    const profile = clubProfiles.get(opponent.id);
    assert.ok(profile, `${tier.name} runde ${round}: ${opponent.name} har ingen spillestilprofil`);
    tierStyles.add(profile.styleName);
    profile.matchupStyles.forEach((token) => tierTokens.add(token));
    tierWalk = completeLeagueRound(tierWalk, { score: { for: 1, against: 1 } });
  }
  assert.equal(tierStyles.size, tier.groupSize - 1, `${tier.name}: ${tierStyles.size} ulike stiler, ikke ${tier.groupSize - 1}`);
  assert.ok(tierTokens.size >= 12, `${tier.name}: bare ${tierTokens.size} spillestil-tokens på en hel sesong`);
  perTier[tier.name] = `${tierStyles.size} stiler / ${tierTokens.size} tokens`;
}

// De avledede styleTraits må SPRE seg. Tall som klumper seg på midten beskriver
// ingenting — det er samme klasse som skalafeilene: en modell som ser ut til å
// virke fordi ingen har målt spredningen.
for (const key of ["pressIntensity", "defensiveCompactness", "possessionControl", "shortBuildUp", "transitionThreat"]) {
  const values = clubProfilesFile.profiles.map((profile) => profile.styleTraits[key]);
  const spread = Math.max(...values) - Math.min(...values);
  assert.ok(spread >= 30, `styleTraits.${key} spenner bare ${spread} poeng over 60 klubber — tallene beskriver ikke ulik fotball`);
}

// Og at app.js faktisk slår opp klubbprofilen — ikke klubb-id blant de generiske.
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
assert.ok(
  /state\.leagueClubProfiles\[opponent\.id\]/.test(app),
  "app.js slår ikke opp ligaklubbens egen spillestilprofil"
);
assert.ok(
  !/OPPONENT_PROFILES\.find\(\(profile\) => profile\.id === opponent\.id\)/.test(app),
  "app.js leter fortsatt etter klubb-id blant de generiske profilene — den kan aldri treffe"
);
assert.ok(
  /opponent\.isClubProfile \? "Klubbens spillestil" : "Historisk stil-motstander"/.test(app),
  "kampbriefen skiller ikke klubbstil fra historisk arketyp"
);

console.log(JSON.stringify({
  ok: true,
  pyramide: tiers.map((tier) => `${tier.name}: ${tier.clubCount} klubber / ${roundsForClubCount(tier.groupSize)} runder`),
  klubberTotalt: allClubs.length,
  eliteserien: { klubber: TOP_CLUBS, runder: TOP_ROUNDS, kamper: played.completedMatchIds.length },
  lengsteBanestrekk: Math.max(...season.clubs.map((club) => longestVenueRun(season, club.id))),
  spillestilerPerSesong: styles.size,
  spillestilTokens: styleTokens.size,
  perNivå: perTier,
  stigenOpp: climbed.join(" → "),
  stigenNed: fell.join(" → ")
}, null, 2));
