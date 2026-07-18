// Real League Season v1. Pure competition state layered over the existing
// matchday result contract. It owns fixtures/table progression, not football
// simulation, tactics, players or History Go unlocks.

export const LEAGUE_SEASON_VERSION = "historygo-football-manager.league-season.v2";
export const LEAGUE_COMPETITION = Object.freeze({
  id: "hg-league-v1", mode: "league", clubCount: 8, rounds: 14,
  homeAndAway: true, points: Object.freeze({ win: 3, draw: 1, loss: 0 }), version: 2
});

export const LEAGUE_OPPONENT_PROFILES = Object.freeze([
  { id: "valerenga", name: "Vålerenga", ground: "Intility Arena", strength: 74, form: 55, tacticalIdentity: "høyt press" },
  { id: "brann", name: "Brann", ground: "Brann stadion", strength: 76, form: 58, tacticalIdentity: "bredt angrepsspill" },
  { id: "rosenborg", name: "Rosenborg", ground: "Lerkendal", strength: 77, form: 56, tacticalIdentity: "4-3-3 og gjenvinning" },
  { id: "viking", name: "Viking", ground: "Lyse Arena", strength: 75, form: 57, tacticalIdentity: "direkte overganger" },
  { id: "lillestrom", name: "Lillestrøm", ground: "Åråsen", strength: 73, form: 53, tacticalIdentity: "duellkraft" },
  { id: "tromso", name: "Tromsø", ground: "Romssa Arena", strength: 72, form: 54, tacticalIdentity: "kompakt struktur" },
  { id: "molde", name: "Molde", ground: "Aker stadion", strength: 78, form: 59, tacticalIdentity: "posisjonsspill" }
]);

function hash(text) {
  let value = 0x811c9dc5;
  for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 0x01000193); }
  return value >>> 0;
}

function seededOrder(clubs, seed) {
  return [...clubs].sort((a, b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id));
}

// Circle method: seven first-leg rounds, then an exact venue-reversed return.
export function createDoubleRoundRobinFixtures(clubs, seed = "season-1") {
  if (!Array.isArray(clubs) || clubs.length < 2 || clubs.length % 2) throw new Error("Terminlisten krever et partall klubber.");
  let rotation = seededOrder(clubs, seed).map((club) => club.id);
  const firstLeg = [];
  for (let round = 1; round < rotation.length; round += 1) {
    const matches = [];
    for (let index = 0; index < rotation.length / 2; index += 1) {
      let homeClubId = rotation[index];
      let awayClubId = rotation[rotation.length - 1 - index];
      if ((round + index) % 2 === 0) [homeClubId, awayClubId] = [awayClubId, homeClubId];
      matches.push({ id: `${seed}-r${round}-${homeClubId}-${awayClubId}`, round, homeClubId, awayClubId, status: "scheduled", result: null });
    }
    firstLeg.push({ round, status: "scheduled", matches });
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }
  const secondLeg = firstLeg.map((entry) => ({
    round: entry.round + firstLeg.length, status: "scheduled",
    matches: entry.matches.map((match) => ({
      id: `${seed}-r${entry.round + firstLeg.length}-${match.awayClubId}-${match.homeClubId}`,
      round: entry.round + firstLeg.length, homeClubId: match.awayClubId, awayClubId: match.homeClubId,
      status: "scheduled", result: null
    }))
  }));
  return [...firstLeg, ...secondLeg];
}

export function createLeagueSeason({ managerClub, opponents = LEAGUE_OPPONENT_PROFILES, seed = "season-1", seasonNumber = 1 } = {}) {
  if (!managerClub?.id) throw new Error("Managerklubben må ha stabil klubb-ID.");
  const clubs = [{ ...managerClub, isManager: true }, ...opponents.filter((club) => club.id !== managerClub.id).slice(0, 7).map((club) => ({ ...club, isManager: false }))];
  if (clubs.length !== 8 || new Set(clubs.map((club) => club.id)).size !== 8) throw new Error("HG Liga krever åtte unike klubber.");
  return { version: LEAGUE_SEASON_VERSION, competition: { ...LEAGUE_COMPETITION }, seed, seasonNumber, managerClubId: managerClub.id, clubs, currentRound: 1, status: "active", fixtures: createDoubleRoundRobinFixtures(clubs, seed), completedMatchIds: [], createdFrom: "fm-owned competition profiles" };
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

export function startNextLeagueSeason(season) {
  return createLeagueSeason({ managerClub: season.clubs.find((club) => club.id === season.managerClubId), opponents: season.clubs.filter((club) => club.id !== season.managerClubId), seed: `season-${season.seasonNumber + 1}`, seasonNumber: season.seasonNumber + 1 });
}

export function normalizeLeagueSeason(value) {
  if (!value || value.version !== LEAGUE_SEASON_VERSION || value.competition?.rounds !== 14 || value.clubs?.length !== 8 || value.fixtures?.length !== 14) return null;
  return structuredClone(value);
}
