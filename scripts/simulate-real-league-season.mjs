import assert from "node:assert/strict";
import { createLeagueSeason, createLeagueTable, completeLeagueRound, getNextLeagueOpponent, startNextLeagueSeason, normalizeLeagueSeason, LEAGUE_OPPONENT_PROFILES } from "../src/football-league-season.js";
import { getHistoricalOpponentProfileIds } from "../src/football-historical-opponent-profiles.js";
import fs from "node:fs";

const managerClub = { id: "manager-fk", name: "Manager FK", ground: "Klubbankeret", strength: 75, form: 55, tacticalIdentity: "managerens valg" };
const fresh = () => createLeagueSeason({ managerClub, seed: "qa-seed" });
const season = fresh();
assert.equal(season.clubs.length, 8); assert.equal(season.fixtures.length, 14);
assert.equal(season.fixtures.flatMap((round) => round.matches).length, 56);
for (const round of season.fixtures) {
  assert.equal(round.matches.length, 4);
  assert.equal(new Set(round.matches.flatMap((match) => [match.homeClubId, match.awayClubId])).size, 8);
  assert.ok(round.matches.every((match) => match.homeClubId !== match.awayClubId));
}
const matches = season.fixtures.flatMap((round) => round.matches);
assert.equal(new Set(matches.map((match) => match.id)).size, 56);
assert.deepEqual(fresh().fixtures, season.fixtures);
const pairs = new Map();
for (const match of matches) {
  const key = [match.homeClubId, match.awayClubId].sort().join(":");
  pairs.set(key, [...(pairs.get(key) || []), `${match.homeClubId}>${match.awayClubId}`]);
}
assert.equal(pairs.size, 28);
for (const meetings of pairs.values()) assert.equal(new Set(meetings).size, 2);

const firstOpponent = getNextLeagueOpponent(season);
let played = completeLeagueRound(season, { score: { for: 2, against: 1 } });
assert.equal(played.currentRound, 2); assert.equal(played.fixtures[0].status, "completed"); assert.equal(played.fixtures[0].matches.filter((match) => match.status === "completed").length, 4);
assert.equal(played.completedMatchIds.length, 4); assert.equal(completeLeagueRound(season, { score: { for: 2, against: 1 } }).fixtures[0].matches.length, 4);
assert.notEqual(getNextLeagueOpponent(played).matchId, firstOpponent.matchId);
let table = createLeagueTable(played); assert.equal(table.length, 8); assert.equal(table.reduce((sum, row) => sum + row.played, 0), 8);
assert.ok(table.every((row) => row.goalDifference === row.goalsFor - row.goalsAgainst));
assert.equal(table.reduce((sum, row) => sum + row.won, 0), table.reduce((sum, row) => sum + row.lost, 0));
assert.deepEqual(createLeagueTable(played), table);
for (let round = 2; round <= 14; round++) played = completeLeagueRound(played, { score: { for: round % 3, against: (round + 1) % 3 } });
assert.equal(played.status, "completed"); assert.equal(played.currentRound, 14); assert.equal(played.completedMatchIds.length, 56); assert.equal(getNextLeagueOpponent(played), null);
assert.deepEqual(normalizeLeagueSeason(JSON.parse(JSON.stringify(played))), played);
const next = startNextLeagueSeason(played); assert.equal(next.status, "active"); assert.equal(next.currentRound, 1); assert.equal(createLeagueTable(next).every((row) => row.played === 0), true); assert.equal(next.managerClubId, played.managerClubId);
assert.deepEqual(next.clubs, played.clubs); assert.notDeepEqual(next.fixtures, played.fixtures);

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

for (const club of LEAGUE_OPPONENT_PROFILES) {
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
assert.equal(
  new Set(LEAGUE_OPPONENT_PROFILES.map((club) => clubProfiles.get(club.id).styleName)).size,
  LEAGUE_OPPONENT_PROFILES.length,
  "to ligaklubber deler spillestil — da mister sesongen variasjon"
);

// Gå gjennom en hel sesong og se hvem du faktisk møter.
const styles = new Map();
const styleTokens = new Set();
let walk = fresh();
for (let round = 1; round <= 14; round += 1) {
  const opponent = getNextLeagueOpponent(walk);
  assert.ok(opponent, `runde ${round} har ingen motstander`);
  const profile = clubProfiles.get(opponent.id);
  assert.ok(profile, `runde ${round}: ${opponent.name} har ingen spillestilprofil`);
  styles.set(profile.styleName, (styles.get(profile.styleName) || 0) + 1);
  profile.matchupStyles.forEach((token) => styleTokens.add(token));
  walk = completeLeagueRound(walk, { score: { for: 1, against: 1 } });
}
assert.equal(styles.size, 7, `sesongen bød på ${styles.size} ulike spillestiler, ikke 7`);
for (const [name, count] of styles) assert.equal(count, 2, `${name} møtes ${count} ganger, ikke to (hjemme + borte)`);
assert.ok(styleTokens.size >= 8, `bare ${styleTokens.size} ulike spillestil-tokens i sesongen`);

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
  ok: true, clubs: 8, rounds: 14, matches: 56, completed: played.completedMatchIds.length,
  spillestilerPerSesong: styles.size, spillestilTokens: styleTokens.size
}, null, 2));
