// Real League Season v3. Pure competition state layered over the existing
// matchday result contract. It owns fixtures/table progression, not football
// simulation, tactics, players or History Go unlocks.
//
// v3 gjør to ting v2 ikke kunne:
//
// 1. NIVÅ. Serien er ikke lenger åtte klubber og fjorten runder, men det nivået
//    du faktisk står på: Eliteserien 16 lag / 30 runder, OBOS-ligaen det samme,
//    2. divisjon to avdelinger à 14 / 26 runder. Klubbene og nivåene ligger i
//    data/football_clubs.json — motoren tar dem inn, den eier dem ikke.
// 2. OPP- OG NEDRYKK. Sesongen slutter ikke bare med en tabell, den slutter med
//    et nivå for neste sesong. Uten det er en managerkarriere en flat linje.
//
// Merk hvorfor terminlisten ble skrevet om: den gamle ga HVER klubb sju
// strake bortekamper etterfulgt av sju strake hjemmekamper. Feilen lå i
// hjemme/borte-regelen, ikke i sirkelmetoden, og den ville blitt femten strake
// med 16 lag. Se `createDoubleRoundRobinFixtures`.

export const LEAGUE_SEASON_VERSION = "historygo-football-manager.league-season.v3";

// Konkurransereglene (poeng) er de samme på alle nivåer; formatet kommer fra
// nivået. Beholdt som eget objekt fordi lagrede sesonger leser det.
export const LEAGUE_POINTS = Object.freeze({ win: 3, draw: 1, loss: 0 });

// Fallback-nivå når ingen er oppgitt: toppnivået slik det faktisk spilles.
// Klubbene kommer alltid utenfra — dette er formatet, ikke deltakerne.
export const DEFAULT_LEAGUE_TIER = Object.freeze({
  id: "eliteserien", level: 1, name: "Eliteserien", shortName: "Eliteserien",
  clubCount: 16, groups: 1, groupSize: 16, rounds: 30,
  promotion: null,
  relegation: Object.freeze({ toTier: "obosligaen", direct: 2, playoff: 1 })
});

function hash(text) {
  let value = 0x811c9dc5;
  for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 0x01000193); }
  return value >>> 0;
}

function seededOrder(clubs, seed) {
  return [...clubs].sort((a, b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id));
}

// Antall runder i en dobbel serie: alle møter alle to ganger.
export function roundsForClubCount(clubCount) {
  return Math.max(0, (Number(clubCount) || 0) - 1) * 2;
}

// Terminliste: sirkelmetode + korrekt hjemme/borte + rotert returrunde.
//
// Den gamle utgaven hadde to feil som forsterket hverandre. Sirkelmetoden roterer
// alle lag unntatt det på plass 0, men hjemme/borte-regelen brukte `index` —
// som betyr noe helt annet for et lag som flytter seg gjennom rotasjonen enn for
// det faste. Resultatet var strekk på (n/2 − 1) kamper i hver retning. Deretter
// ble returrunden lagt på som en speilet blokk rett etterpå, så strekket ble
// dobbelt så langt i skjøten.
//
// Her settes hjemme/borte på det faste laget etter rundeparitet og på resten
// etter parets plass, og returrunden roteres én runde før den legges på. Målt
// gir det lengste strekk på 2 kamper for 8, 14 og 16 klubber — mot 7 før.
export function createDoubleRoundRobinFixtures(clubs, seed = "season-1") {
  if (!Array.isArray(clubs) || clubs.length < 2 || clubs.length % 2) throw new Error("Terminlisten krever et partall klubber.");
  const ids = seededOrder(clubs, seed).map((club) => club.id);
  const n = ids.length;
  const m = n - 1; // antall roterende plasser; ids[m] står i ro

  const firstLegPairs = [];
  for (let round = 0; round < m; round += 1) {
    const pairs = [];
    // Det faste laget møter den som står på plass `round`. Det alternerer
    // hjemme/borte etter rundeparitet — ellers får nettopp dette laget strekket.
    pairs.push(round % 2 === 0 ? [ids[m], ids[round % m]] : [ids[round % m], ids[m]]);
    for (let i = 1; i < n / 2; i += 1) {
      const a = ids[(round + i) % m];
      const b = ids[(((round - i) % m) + m) % m];
      pairs.push(i % 2 === 0 ? [a, b] : [b, a]);
    }
    firstLegPairs.push(pairs);
  }

  // Returrunden speiles (bane byttes) og roteres én runde, slik at skjøten
  // mellom halvsesongene ikke legger to like kamper etter hverandre.
  const mirrored = firstLegPairs.map((pairs) => pairs.map(([home, away]) => [away, home]));
  const secondLegPairs = [...mirrored.slice(1), mirrored[0]];

  return [...firstLegPairs, ...secondLegPairs].map((pairs, index) => {
    const round = index + 1;
    return {
      round,
      status: "scheduled",
      matches: pairs.map(([homeClubId, awayClubId]) => ({
        id: `${seed}-r${round}-${homeClubId}-${awayClubId}`,
        round, homeClubId, awayClubId, status: "scheduled", result: null
      }))
    };
  });
}

// Lengste strekk av hjemme- eller bortekamper for én klubb. Eksportert fordi det
// er en MÅLING, ikke en detalj: det var akkurat den som avslørte terminlistefeilen,
// og vakten kjører den på hver klubb i hver sesong.
export function longestVenueRun(season, clubId) {
  let longest = 0, run = 0, previous = "";
  for (const round of season?.fixtures || []) {
    const match = round.matches.find((entry) => entry.homeClubId === clubId || entry.awayClubId === clubId);
    if (!match) continue;
    const venue = match.homeClubId === clubId ? "H" : "B";
    run = venue === previous ? run + 1 : 1;
    previous = venue;
    if (run > longest) longest = run;
  }
  return longest;
}

export function createLeagueSeason({ managerClub, opponents = [], tier = DEFAULT_LEAGUE_TIER, seed = "season-1", seasonNumber = 1 } = {}) {
  if (!managerClub?.id) throw new Error("Managerklubben må ha stabil klubb-ID.");
  const groupSize = Number(tier?.groupSize) || Number(tier?.clubCount) || 0;
  if (groupSize < 2 || groupSize % 2) throw new Error("Nivået må ha et partall klubber i hver avdeling.");

  const pool = opponents.filter((club) => club.id !== managerClub.id);
  const clubs = [
    { ...managerClub, isManager: true },
    ...pool.slice(0, groupSize - 1).map((club) => ({ ...club, isManager: false }))
  ];
  if (clubs.length !== groupSize || new Set(clubs.map((club) => club.id)).size !== groupSize) {
    throw new Error(`${tier?.name || "Nivået"} krever ${groupSize} unike klubber — fikk ${clubs.length}.`);
  }

  const rounds = roundsForClubCount(groupSize);
  return {
    version: LEAGUE_SEASON_VERSION,
    competition: {
      id: `hg-${tier.id}`, mode: "league", tierId: tier.id, tierName: tier.name, tierLevel: tier.level,
      clubCount: groupSize, rounds, homeAndAway: true, points: { ...LEAGUE_POINTS }, version: 3
    },
    tier: structuredClone(tier),
    seed, seasonNumber, managerClubId: managerClub.id, clubs,
    currentRound: 1, status: "active",
    fixtures: createDoubleRoundRobinFixtures(clubs, seed),
    completedMatchIds: [],
    createdFrom: "fm-owned competition profiles"
  };
}

export function getLeagueRound(season, round = season?.currentRound) { return season?.fixtures?.find((entry) => entry.round === round) || null; }
export function getManagerFixture(season, round = season?.currentRound) { return getLeagueRound(season, round)?.matches.find((match) => match.homeClubId === season.managerClubId || match.awayClubId === season.managerClubId) || null; }
export function getNextLeagueOpponent(season) {
  if (season?.status !== "active") return null;
  const fixture = getManagerFixture(season);
  if (!fixture) return null;
  const opponentId = fixture.homeClubId === season.managerClubId ? fixture.awayClubId : fixture.homeClubId;
  return { ...season.clubs.find((club) => club.id === opponentId), homeAway: fixture.homeClubId === season.managerClubId ? "home" : "away", round: fixture.round, matchId: fixture.id };
}

function scoreFromResult(result) {
  const goalsFor = Math.max(0, Math.round(Number(result?.score?.for ?? result?.goalsFor) || 0));
  const goalsAgainst = Math.max(0, Math.round(Number(result?.score?.against ?? result?.goalsAgainst) || 0));
  return { goalsFor, goalsAgainst };
}

function simulateFixture(season, fixture) {
  const home = season.clubs.find((club) => club.id === fixture.homeClubId);
  const away = season.clubs.find((club) => club.id === fixture.awayClubId);
  const base = hash(`${season.seed}:${fixture.id}`);
  const homeEdge = (Number(home?.strength) || 72) + 2 - (Number(away?.strength) || 72);
  return { homeGoals: Math.max(0, (base % 4) + (homeEdge >= 4 ? 1 : 0)), awayGoals: Math.max(0, ((base >>> 5) % 4) + (homeEdge <= -4 ? 1 : 0)), simulated: true };
}

export function completeLeagueRound(season, managerResult) {
  if (!season || season.status !== "active") return season;
  const fixture = getManagerFixture(season);
  if (!fixture || fixture.status === "completed" || season.completedMatchIds?.includes(fixture.id)) return season;
  const score = scoreFromResult(managerResult);
  const next = structuredClone(season);
  const round = getLeagueRound(next);
  round.matches.forEach((match) => {
    if (match.id === fixture.id) {
      const managerHome = match.homeClubId === next.managerClubId;
      match.result = { homeGoals: managerHome ? score.goalsFor : score.goalsAgainst, awayGoals: managerHome ? score.goalsAgainst : score.goalsFor, simulated: false };
    } else match.result = simulateFixture(next, match);
    match.status = "completed";
    next.completedMatchIds.push(match.id);
  });
  round.status = "completed";
  if (next.currentRound === next.competition.rounds) next.status = "completed";
  else next.currentRound += 1;
  return next;
}

export function createLeagueTable(season) {
  const rows = (season?.clubs || []).map((club) => ({ clubId: club.id, club: club.name, isManager: club.id === season.managerClubId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }));
  const byId = new Map(rows.map((row) => [row.clubId, row]));
  for (const round of season?.fixtures || []) for (const match of round.matches) if (match.status === "completed" && match.result) {
    const home = byId.get(match.homeClubId); const away = byId.get(match.awayClubId); const hg = match.result.homeGoals; const ag = match.result.awayGoals;
    home.played++; away.played++; home.goalsFor += hg; home.goalsAgainst += ag; away.goalsFor += ag; away.goalsAgainst += hg;
    if (hg > ag) { home.won++; away.lost++; home.points += 3; } else if (hg < ag) { away.won++; home.lost++; away.points += 3; } else { home.drawn++; away.drawn++; home.points++; away.points++; }
  }
  rows.forEach((row) => { row.goalDifference = row.goalsFor - row.goalsAgainst; });
  rows.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.clubId.localeCompare(b.clubId));
  rows.forEach((row, index) => { row.position = index + 1; });
  return rows;
}

// ---------------------------------------------------------------------------
// Opp- og nedrykk
//
// Sesongen slutter med et NIVÅ, ikke bare en tabell. Reglene kommer fra nivået
// (data/football_clubs.json), ikke fra motoren — Eliteserien sender to direkte
// ned og én i kvalifisering, OBOS-ligaen har begge veier, 2. divisjon har bunn
// men ingen tredje divisjon i spillet ennå.
//
// Kvalifiseringsplassen er bevisst IKKE avgjort her: den er en plass, ikke en
// dom. Manageren skal spille den, ikke få den utregnet.
// ---------------------------------------------------------------------------
// Plassering → bevegelse. Skilt ut som ren funksjon fordi den ellers bare kan
// testes ved å spille en hel sesong til akkurat den plasseringen — og da blir
// kvalifiseringsbåndene (3. plass i OBOS, 14. plass) aldri prøvd. Her kan hver
// eneste plass på hvert eneste nivå sjekkes direkte.
export function classifyLeaguePosition(position, total, tier = DEFAULT_LEAGUE_TIER) {
  const promotion = tier?.promotion || null;
  const relegation = tier?.relegation || null;
  const promotionDirect = Math.max(0, Number(promotion?.direct) || 0);
  const promotionPlayoff = Math.max(0, Number(promotion?.playoff) || 0);
  const relegationDirect = Math.max(0, Number(relegation?.direct) || 0);
  const relegationPlayoff = Math.max(0, Number(relegation?.playoff) || 0);
  const tierName = tier?.name || "serien";

  if (position === 1 && !promotion) {
    // Toppnivået har ingen vei opp: førsteplassen ER målet, ikke et mellomsteg.
    return { movement: "champion", toTierId: tier.id, reason: `Seriemester i ${tierName}.` };
  }
  if (promotion && position <= promotionDirect) {
    return { movement: "promoted", toTierId: promotion.toTier, reason: `${position}. plass gir direkte opprykk.` };
  }
  if (promotion && promotionPlayoff > 0 && position <= promotionDirect + promotionPlayoff) {
    return { movement: "promotion_playoff", toTierId: tier.id, reason: `${position}. plass gir kvalifisering om opprykk.` };
  }
  if (position > total - relegationDirect) {
    if (!relegation?.toTier) {
      // Bunnivået har ingen vei ned i spillet ennå. Si det, ikke lat som
      // plasseringen var grei.
      return { movement: "bottom", toTierId: tier.id, reason: `${position}. plass av ${total} — bunnen av pyramiden, det finnes ikke noe nivå under.` };
    }
    return { movement: "relegated", toTierId: relegation.toTier, reason: `${position}. plass av ${total} gir direkte nedrykk.` };
  }
  if (relegation?.toTier && relegationPlayoff > 0 && position > total - relegationDirect - relegationPlayoff) {
    return { movement: "relegation_playoff", toTierId: tier.id, reason: `${position}. plass av ${total} gir kvalifisering om plassen.` };
  }
  return { movement: "stay", toTierId: tier.id, reason: `${position}. plass i ${tierName} — samme nivå neste sesong.` };
}

export function resolveLeagueOutcome(season) {
  if (!season) return null;
  const table = createLeagueTable(season);
  const row = table.find((entry) => entry.clubId === season.managerClubId);
  if (!row) return null;

  const tier = season.tier || DEFAULT_LEAGUE_TIER;
  const verdict = classifyLeaguePosition(row.position, table.length, tier);

  return {
    position: row.position, points: row.points, played: row.played, total: table.length,
    tierId: tier.id, tierName: tier.name, tierLevel: tier.level,
    ...verdict,
    isChampion: row.position === 1
  };
}

// Neste sesong. Uten nytt nivå/klubbutvalg blir det samme nivå med samme
// klubber — men får motoren pyramiden inn (`allClubs` + `tiers`), flyttes
// manageren dit sesongen sa han skulle.
//
// `playoffResolution` er utfallet av kvalifiseringen (football-league-playoff.js)
// når sesongen endte på en kvalifiseringsplass. Uten den ville plassen vært en
// plass spillet nevnte og aldri gjorde noe med: 3. plass i OBOS ville betydd
// nøyaktig det samme som 4.
export function startNextLeagueSeason(season, { allClubs = null, tiers = null, playoffResolution = null } = {}) {
  const managerClub = season.clubs.find((club) => club.id === season.managerClubId);
  const seasonNumber = season.seasonNumber + 1;
  const seed = `season-${seasonNumber}`;
  const seasonOutcome = resolveLeagueOutcome(season);
  // Kvalifiseringen overstyrer plasseringen — den ER avgjørelsen plasseringen
  // bare ga deg sjansen til.
  const outcome = seasonOutcome && playoffResolution
    ? { ...seasonOutcome, movement: playoffResolution.movement, toTierId: playoffResolution.toTierId, reason: playoffResolution.reason, viaPlayoff: true }
    : seasonOutcome;

  // Står kvalifiseringen uspilt, er sesongen ikke ferdig avgjort. Å rulle videre
  // her ville stille sluppet manageren forbi kampene han skulle spilt.
  if (isPlayoffPending(season, playoffResolution)) {
    throw new Error("Kvalifiseringen er ikke spilt — sesongen kan ikke rulles videre ennå.");
  }

  if (!Array.isArray(allClubs) || !Array.isArray(tiers) || !outcome) {
    return createLeagueSeason({ managerClub, opponents: season.clubs.filter((club) => club.id !== season.managerClubId), tier: season.tier || DEFAULT_LEAGUE_TIER, seed, seasonNumber });
  }

  const nextTier = tiers.find((entry) => entry.id === outcome.toTierId) || season.tier || DEFAULT_LEAGUE_TIER;
  const pool = allClubs.filter((club) => club.tier === nextTier.id && club.id !== managerClub.id);
  // I en avdelt divisjon spiller manageren i én avdeling, ikke mot alle 28.
  const group = nextTier.groups > 1
    ? (allClubs.find((club) => club.id === managerClub.id)?.group || [...new Set(pool.map((club) => club.group))].sort()[0])
    : null;
  const opponents = group ? pool.filter((club) => club.group === group) : pool;

  return {
    ...createLeagueSeason({ managerClub: { ...managerClub, tier: nextTier.id, ...(group ? { group } : {}) }, opponents, tier: nextTier, seed, seasonNumber }),
    previousOutcome: outcome
  };
}

// Endte sesongen på en kvalifiseringsplass som ennå ikke er spilt?
export function isPlayoffPending(season, playoffResolution = null) {
  if (playoffResolution) return false;
  const outcome = resolveLeagueOutcome(season);
  return outcome ? ["promotion_playoff", "relegation_playoff"].includes(outcome.movement) : false;
}

export function normalizeLeagueSeason(value) {
  if (!value || value.version !== LEAGUE_SEASON_VERSION) return null;
  const rounds = Number(value.competition?.rounds);
  const clubCount = Number(value.clubs?.length);
  if (!Number.isFinite(rounds) || !Number.isFinite(clubCount)) return null;
  // Formatet må henge sammen med seg selv: runder = (klubber − 1) × 2.
  if (rounds !== roundsForClubCount(clubCount) || value.fixtures?.length !== rounds) return null;
  return structuredClone(value);
}
