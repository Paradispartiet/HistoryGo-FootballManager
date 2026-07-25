// HG Football Manager — Tournament v1 (EM / VM for landslagsmodus)
//
// Landslagsmodus hadde spillere, men ingenting å spille om. Denne motoren gir
// den et mesterskap: gruppespill og utslagsrunder, med en tabell som betyr noe
// og en vei som kan ta slutt.
//
// Ren ESM-motor på samme premiss som mini-sesongen og ligasesongen: ingen DOM,
// ingen fetch, ingen localStorage, ingen app-state, ingen Math.random og ingen
// Date.now. Lik input gir byte-identisk output. app.js eier lagring.
//
// Motoren SIMULERER IKKE managerens egen kamp. Den konsumerer resultatet fra
// Kampdag v0.2 (samme kontrakt som ligasesongen) og avgjør bare turneringens
// gang. De andre kampene i turneringen avgjøres deterministisk fra seed og
// styrke — de er ramme, ikke fasit.
//
// Kjerneprinsipp (CLAUDE.md): «Alle spillere er gode nok. Spørsmålet er om
// treneren forstår dem.» Styrketallene her setter forventningen rundt en kamp
// og avgjør de simulerte kampene i bakgrunnen. De rører aldri managerens egen
// kamp — den avgjøres av oppstilling, roller, taktikk og relasjoner.

export const TOURNAMENT_VERSION = "historygo-football-manager.tournament.v1";

export const TOURNAMENT_STAGE_LABELS = Object.freeze({
  group: "Gruppespill",
  quarterfinal: "Kvartfinale",
  semifinal: "Semifinale",
  final: "Finale",
  completed: "Ferdig"
});

// Utslagsrunder er alltid singel kamp: uavgjort avgjøres på straffer.
export const TOURNAMENT_POINTS = Object.freeze({ win: 3, draw: 1, loss: 0 });

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ----------------------------------------------------------------------------
// Rene hjelpere.
// ----------------------------------------------------------------------------
function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

// Samme FNV-1a som ligasesongen: stabil på tvers av kjøringer og plattformer.
function hash(text) {
  let value = 0x811c9dc5;
  for (const char of String(text)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[æ]/g, "ae").replace(/[ø]/g, "o").replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "nasjon";
}

// ----------------------------------------------------------------------------
// Oppsett.
// ----------------------------------------------------------------------------
function normalizeTournamentDefinition(definition) {
  const d = isObject(definition) ? definition : {};
  const groupCount = Math.max(1, Math.round(num(d.groupCount, 2)));
  const groupSize = Math.max(2, Math.round(num(d.groupSize, 4)));
  return {
    id: isNonEmptyString(d.id) ? d.id : "turnering",
    name: isNonEmptyString(d.name) ? d.name : "Mesterskap",
    fullName: isNonEmptyString(d.fullName) ? d.fullName : "Mesterskap",
    confederation: isNonEmptyString(d.confederation) ? d.confederation : "verden",
    groupCount,
    groupSize,
    teamCount: groupCount * groupSize,
    knockoutStages: asArray(d.knockoutStages).filter(isNonEmptyString),
    // Antall kamper manageren selv spiller: gruppekampene pluss utslagsrundene.
    // Utledes fra strukturen, så den aldri kan komme i utakt med den.
    managerMatches: (groupSize - 1) + asArray(d.knockoutStages).filter(isNonEmptyString).length,
    summary: isNonEmptyString(d.summary) ? d.summary : "",
    learningFrame: isNonEmptyString(d.learningFrame) ? d.learningFrame : ""
  };
}

function normalizeNation(nation) {
  const n = isObject(nation) ? nation : {};
  const nationality = isNonEmptyString(n.nationality) ? n.nationality : "";
  return {
    id: slugify(nationality),
    nationality,
    styleProfileId: isNonEmptyString(n.styleProfileId) ? n.styleProfileId : null,
    styleHeritage: isNonEmptyString(n.styleHeritage) ? n.styleHeritage : "",
    strength: num(n.strength, 75),
    confederations: asArray(n.confederations).filter(isNonEmptyString)
  };
}

// Hvilke mesterskap kan denne nasjonen delta i? EM krever europeisk tilhørighet;
// VM er åpent. Uten treff faller vi tilbake til VM, slik at en nasjon som mangler
// konføderasjonsdata aldri blir stående uten noe å spille.
export function getEligibleTournaments(tournaments, nations, nationality) {
  const pool = asArray(nations).map(normalizeNation);
  const nation = pool.find((item) => item.nationality === nationality) || null;
  const confederations = new Set(nation ? nation.confederations : []);
  return asArray(tournaments)
    .map(normalizeTournamentDefinition)
    .filter((definition) => {
      if (confederations.size === 0) return definition.confederation === "verden";
      if (!confederations.has(definition.confederation)) return false;
      // Nok motstandere til å fylle mesterskapet?
      const available = pool.filter(
        (item) => item.nationality !== nationality && item.confederations.includes(definition.confederation)
      ).length;
      return available >= definition.teamCount - 1;
    });
}

// Deterministisk seeding: managerens nasjon først (den er alltid med), deretter
// de sterkeste motstanderne, blandet av seed slik at to mesterskap med samme
// nasjon ikke blir identiske.
function selectTeams(definition, nations, managerNationality, seed) {
  const pool = asArray(nations).map(normalizeNation).filter((nation) => nation.nationality);
  const manager = pool.find((nation) => nation.nationality === managerNationality) || {
    id: slugify(managerNationality), nationality: managerNationality, styleProfileId: null,
    styleHeritage: "", strength: 78, confederations: []
  };
  const opponents = pool
    .filter((nation) => nation.nationality !== managerNationality)
    .filter((nation) => nation.confederations.includes(definition.confederation))
    .sort((a, b) => {
      const diff = b.strength - a.strength;
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    })
    .slice(0, Math.max(0, definition.teamCount - 1));

  const teams = [{ ...manager, isManager: true }, ...opponents.map((nation) => ({ ...nation, isManager: false }))];
  // Seedet trekning, men managerens nasjon beholder ikke en fast gruppe: den
  // fordeles som alle andre.
  return teams.sort((a, b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id));
}

function buildGroups(definition, teams) {
  const groups = [];
  for (let index = 0; index < definition.groupCount; index += 1) {
    const letter = GROUP_LETTERS[index] || String(index + 1);
    groups.push({ id: `group_${letter.toLowerCase()}`, letter, name: `Gruppe ${letter}`, teamIds: [] });
  }
  // Slangefordeling: lag 0 → A, 1 → B, … og tilbake igjen. Med seedet rekkefølge
  // gir det jevne grupper uten at en gruppe samler alle de sterkeste.
  teams.forEach((team, index) => {
    const row = Math.floor(index / definition.groupCount);
    const column = index % definition.groupCount;
    const groupIndex = row % 2 === 0 ? column : definition.groupCount - 1 - column;
    groups[groupIndex].teamIds.push(team.id);
  });
  return groups;
}

// Enkel serie i hver gruppe (circle method), like mange runder for alle grupper.
function buildGroupFixtures(groups, seed) {
  const fixtures = [];
  groups.forEach((group) => {
    let rotation = [...group.teamIds];
    const rounds = rotation.length - 1;
    for (let round = 1; round <= rounds; round += 1) {
      for (let index = 0; index < rotation.length / 2; index += 1) {
        let homeId = rotation[index];
        let awayId = rotation[rotation.length - 1 - index];
        if ((round + index) % 2 === 0) [homeId, awayId] = [awayId, homeId];
        fixtures.push({
          id: `${seed}-${group.id}-r${round}-${homeId}-${awayId}`,
          stage: "group", groupId: group.id, round,
          homeId, awayId, status: "scheduled", result: null
        });
      }
      rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
    }
  });
  return fixtures;
}

export function createTournament({ definition, nations = [], managerNationality, seed = "turnering-1" } = {}) {
  if (!isNonEmptyString(managerNationality)) {
    throw new Error("Mesterskapet krever en valgt nasjon.");
  }
  const normalized = normalizeTournamentDefinition(definition);
  const teams = selectTeams(normalized, nations, managerNationality, seed);
  if (teams.length !== normalized.teamCount) {
    throw new Error(
      `${normalized.name} krever ${normalized.teamCount} nasjoner, fant ${teams.length}.`
    );
  }
  const groups = buildGroups(normalized, teams);
  const withGroups = teams.map((team) => ({
    ...team,
    groupId: groups.find((group) => group.teamIds.includes(team.id))?.id || null
  }));

  return {
    version: TOURNAMENT_VERSION,
    tournamentId: normalized.id,
    name: normalized.name,
    fullName: normalized.fullName,
    summary: normalized.summary,
    learningFrame: normalized.learningFrame,
    knockoutStages: [...normalized.knockoutStages],
    seed,
    managerNationality,
    managerTeamId: withGroups.find((team) => team.isManager)?.id || null,
    teams: withGroups,
    groups: groups.map((group) => ({ ...group, teamIds: [...group.teamIds] })),
    stage: "group",
    round: 1,
    fixtures: buildGroupFixtures(groups, seed),
    status: "active",
    outcome: null,
    log: []
  };
}

// ----------------------------------------------------------------------------
// Oppslag.
// ----------------------------------------------------------------------------
export function getTournamentTeam(state, teamId) {
  return asArray(state?.teams).find((team) => team.id === teamId) || null;
}

// Managerens neste kamp: første ikke-spilte kamp i gjeldende steg der
// managerlaget er med.
export function getCurrentTournamentMatch(state) {
  if (!state || state.status !== "active") return null;
  const managerId = state.managerTeamId;
  return (
    asArray(state.fixtures).find(
      (fixture) =>
        fixture.status !== "completed" &&
        fixture.stage === state.stage &&
        (fixture.homeId === managerId || fixture.awayId === managerId)
    ) || null
  );
}

// Neste motstander som en beskrivelse app.js kan legge oppå en stil-profil.
export function getTournamentNextOpponent(state) {
  const fixture = getCurrentTournamentMatch(state);
  if (!fixture) return null;
  const managerId = state.managerTeamId;
  const opponentId = fixture.homeId === managerId ? fixture.awayId : fixture.homeId;
  const opponent = getTournamentTeam(state, opponentId);
  if (!opponent) return null;
  const group = state.groups.find((entry) => entry.id === fixture.groupId) || null;
  const stageLabel = TOURNAMENT_STAGE_LABELS[fixture.stage] || fixture.stage;
  return {
    ...opponent,
    matchId: fixture.id,
    stage: fixture.stage,
    stageLabel: fixture.stage === "group" && group ? `${stageLabel} · ${group.name}` : stageLabel,
    round: fixture.round,
    homeAway: fixture.homeId === managerId ? "home" : "away",
    knockout: fixture.stage !== "group",
    narrativeHook: opponent.styleHeritage
      ? `${stageLabel} mot ${opponent.nationality}. ${opponent.styleHeritage}.`
      : `${stageLabel} mot ${opponent.nationality}.`
  };
}

export function isCurrentTournamentMatchPlayed(state) {
  return getCurrentTournamentMatch(state) === null && state?.status === "active";
}

// ----------------------------------------------------------------------------
// Resultater.
// ----------------------------------------------------------------------------
function scoreFromResult(result) {
  const goalsFor = Math.max(0, Math.round(num(result?.score?.for ?? result?.goalsFor)));
  const goalsAgainst = Math.max(0, Math.round(num(result?.score?.against ?? result?.goalsAgainst)));
  return { goalsFor, goalsAgainst };
}

// De andre kampene: deterministisk fra seed og styrkeforskjell. Ingen
// tilfeldighet, ingen skjult modell — de er ramme rundt managerens turnering.
function simulateFixture(state, fixture) {
  const home = getTournamentTeam(state, fixture.homeId);
  const away = getTournamentTeam(state, fixture.awayId);
  const base = hash(`${state.seed}:${fixture.id}`);
  const edge = num(home?.strength, 75) - num(away?.strength, 75);
  const homeGoals = Math.max(0, (base % 3) + (edge >= 4 ? 1 : 0));
  const awayGoals = Math.max(0, ((base >>> 7) % 3) + (edge <= -4 ? 1 : 0));
  return { homeGoals, awayGoals, simulated: true };
}

// Utslagskamp må ha en vinner. Uavgjort går til straffer, avgjort av seed.
function resolveKnockout(state, fixture, result) {
  if (result.homeGoals !== result.awayGoals) {
    return { ...result, winnerId: result.homeGoals > result.awayGoals ? fixture.homeId : fixture.awayId };
  }
  const pick = hash(`${state.seed}:straffer:${fixture.id}`) % 2;
  const winnerId = pick === 0 ? fixture.homeId : fixture.awayId;
  const loserId = winnerId === fixture.homeId ? fixture.awayId : fixture.homeId;
  return {
    ...result,
    winnerId,
    penalties: {
      winnerId, loserId,
      // Deterministisk, men troverdig straffesluttresultat.
      score: `${4 + (hash(`${state.seed}:p1:${fixture.id}`) % 2)}–${2 + (hash(`${state.seed}:p2:${fixture.id}`) % 2)}`
    }
  };
}

export function createTournamentGroupTable(state, groupId) {
  const group = asArray(state?.groups).find((entry) => entry.id === groupId);
  if (!group) return [];
  const rows = group.teamIds.map((teamId) => {
    const team = getTournamentTeam(state, teamId);
    return {
      teamId, nationality: team?.nationality || teamId, isManager: Boolean(team?.isManager),
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
    };
  });
  const byId = new Map(rows.map((row) => [row.teamId, row]));
  asArray(state?.fixtures).forEach((fixture) => {
    if (fixture.stage !== "group" || fixture.groupId !== groupId) return;
    if (fixture.status !== "completed" || !fixture.result) return;
    const home = byId.get(fixture.homeId);
    const away = byId.get(fixture.awayId);
    if (!home || !away) return;
    const hg = num(fixture.result.homeGoals);
    const ag = num(fixture.result.awayGoals);
    home.played += 1; away.played += 1;
    home.goalsFor += hg; home.goalsAgainst += ag;
    away.goalsFor += ag; away.goalsAgainst += hg;
    if (hg > ag) { home.won += 1; away.lost += 1; home.points += TOURNAMENT_POINTS.win; }
    else if (hg < ag) { away.won += 1; home.lost += 1; away.points += TOURNAMENT_POINTS.win; }
    else { home.drawn += 1; away.drawn += 1; home.points += TOURNAMENT_POINTS.draw; away.points += TOURNAMENT_POINTS.draw; }
  });
  rows.forEach((row) => { row.goalDifference = row.goalsFor - row.goalsAgainst; });
  rows.sort((a, b) =>
    b.points - a.points || b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor || a.teamId.localeCompare(b.teamId));
  rows.forEach((row, index) => { row.position = index + 1; });
  return rows;
}

// Bracket-oppsettet: gruppevinner mot toer fra nabogruppen, deretter par for par.
function buildKnockoutFixtures(state, stage) {
  const seed = state.seed;
  if (stage === state.knockoutStages[0]) {
    const qualified = state.groups.map((group) => {
      const table = createTournamentGroupTable(state, group.id);
      return { group, first: table[0]?.teamId || null, second: table[1]?.teamId || null };
    });
    const pairs = [];
    for (let index = 0; index < qualified.length; index += 1) {
      const partner = qualified[(index + 1) % qualified.length];
      pairs.push([qualified[index].first, partner.second]);
    }
    return pairs
      .filter(([homeId, awayId]) => homeId && awayId)
      .map(([homeId, awayId], index) => ({
        id: `${seed}-${stage}-m${index + 1}-${homeId}-${awayId}`,
        stage, groupId: null, round: index + 1,
        homeId, awayId, status: "scheduled", result: null
      }));
  }
  const previousStage = state.knockoutStages[state.knockoutStages.indexOf(stage) - 1];
  const winners = asArray(state.fixtures)
    .filter((fixture) => fixture.stage === previousStage && fixture.status === "completed")
    .sort((a, b) => a.round - b.round)
    .map((fixture) => fixture.result?.winnerId)
    .filter(isNonEmptyString);
  const fixtures = [];
  for (let index = 0; index + 1 < winners.length; index += 2) {
    fixtures.push({
      id: `${seed}-${stage}-m${fixtures.length + 1}-${winners[index]}-${winners[index + 1]}`,
      stage, groupId: null, round: fixtures.length + 1,
      homeId: winners[index], awayId: winners[index + 1], status: "scheduled", result: null
    });
  }
  return fixtures;
}

function stageIsComplete(state, stage) {
  const fixtures = asArray(state.fixtures).filter((fixture) => fixture.stage === stage);
  return fixtures.length > 0 && fixtures.every((fixture) => fixture.status === "completed");
}

function managerSurvived(state, stage) {
  const managerId = state.managerTeamId;
  if (stage === "group") {
    const managerTeam = getTournamentTeam(state, managerId);
    const table = createTournamentGroupTable(state, managerTeam?.groupId);
    const row = table.find((entry) => entry.teamId === managerId);
    return Boolean(row && row.position <= 2);
  }
  return asArray(state.fixtures).some(
    (fixture) => fixture.stage === stage && fixture.result?.winnerId === managerId
  );
}

function placementLabel(state, stage, won) {
  if (stage === "final") return won ? "Mester" : "Finaletap";
  const label = TOURNAMENT_STAGE_LABELS[stage] || stage;
  return stage === "group" ? "Ute i gruppespillet" : `Ute i ${label.toLowerCase()}`;
}

// Registrer managerens kampresultat, spill ferdig resten av steget og gå videre.
// Idempotent: er kampen allerede registrert, returneres samme state uendret.
export function applyTournamentMatchResult(state, matchdayResult) {
  if (!state || state.status !== "active") return state;
  const fixture = getCurrentTournamentMatch(state);
  if (!fixture) return state;

  const next = structuredClone(state);
  const managerId = next.managerTeamId;
  const score = scoreFromResult(matchdayResult);
  const managerHome = fixture.homeId === managerId;

  next.fixtures.forEach((entry) => {
    if (entry.stage !== next.stage || entry.status === "completed") return;
    // Bare denne runden av utslagsspillet / denne gruppespillrunden avgjøres nå.
    if (next.stage === "group" && entry.round !== fixture.round) return;
    const base = entry.id === fixture.id
      ? {
          homeGoals: managerHome ? score.goalsFor : score.goalsAgainst,
          awayGoals: managerHome ? score.goalsAgainst : score.goalsFor,
          simulated: false
        }
      : simulateFixture(next, entry);
    entry.result = next.stage === "group" ? base : resolveKnockout(next, entry, base);
    entry.status = "completed";
  });

  const finishedStage = next.stage;
  if (!stageIsComplete(next, finishedStage)) {
    // Flere runder igjen i gruppespillet.
    next.round += 1;
    return next;
  }

  const survived = managerSurvived(next, finishedStage);
  if (finishedStage === "final") {
    next.status = "completed";
    next.stage = "completed";
    next.outcome = {
      stage: "final", advanced: survived,
      placement: placementLabel(next, "final", survived),
      champion: survived ? next.managerNationality
        : getTournamentTeam(next, next.fixtures.find((f) => f.stage === "final")?.result?.winnerId)?.nationality || null
    };
    next.log.push(survived
      ? `${next.name}: ${next.managerNationality} er mester.`
      : `${next.name}: ${next.managerNationality} tapte finalen.`);
    return next;
  }

  if (!survived) {
    next.status = "completed";
    next.stage = "completed";
    next.outcome = {
      stage: finishedStage, advanced: false,
      placement: placementLabel(next, finishedStage, false),
      champion: null
    };
    next.log.push(`${next.name}: ${next.managerNationality} er ute etter ${(TOURNAMENT_STAGE_LABELS[finishedStage] || finishedStage).toLowerCase()}.`);
    return next;
  }

  const nextStage = finishedStage === "group"
    ? next.knockoutStages[0]
    : next.knockoutStages[next.knockoutStages.indexOf(finishedStage) + 1];
  if (!nextStage) {
    next.status = "completed";
    next.stage = "completed";
    next.outcome = { stage: finishedStage, advanced: true, placement: "Ferdig", champion: next.managerNationality };
    return next;
  }

  next.stage = nextStage;
  next.round = 1;
  next.fixtures.push(...buildKnockoutFixtures(next, nextStage));
  next.log.push(`${next.name}: ${next.managerNationality} er klar for ${(TOURNAMENT_STAGE_LABELS[nextStage] || nextStage).toLowerCase()}.`);
  return next;
}

// ----------------------------------------------------------------------------
// Visning.
// ----------------------------------------------------------------------------
export function summarizeTournament(state) {
  if (!state) return null;
  const managerTeam = getTournamentTeam(state, state.managerTeamId);
  const played = asArray(state.fixtures).filter(
    (fixture) => fixture.status === "completed" &&
      (fixture.homeId === state.managerTeamId || fixture.awayId === state.managerTeamId)
  );
  const record = played.reduce((acc, fixture) => {
    const managerHome = fixture.homeId === state.managerTeamId;
    const goalsFor = num(managerHome ? fixture.result?.homeGoals : fixture.result?.awayGoals);
    const goalsAgainst = num(managerHome ? fixture.result?.awayGoals : fixture.result?.homeGoals);
    acc.goalsFor += goalsFor;
    acc.goalsAgainst += goalsAgainst;
    if (goalsFor > goalsAgainst) acc.won += 1;
    else if (goalsFor < goalsAgainst) acc.lost += 1;
    else acc.drawn += 1;
    return acc;
  }, { won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 });

  const next = getTournamentNextOpponent(state);
  return {
    tournamentId: state.tournamentId,
    name: state.name,
    fullName: state.fullName,
    nationality: state.managerNationality,
    stage: state.stage,
    stageLabel: TOURNAMENT_STAGE_LABELS[state.stage] || state.stage,
    groupName: state.groups.find((group) => group.id === managerTeam?.groupId)?.name || null,
    status: state.status,
    played: played.length,
    ...record,
    outcome: state.outcome,
    nextOpponent: next
      ? { nationality: next.nationality, stageLabel: next.stageLabel, homeAway: next.homeAway, styleHeritage: next.styleHeritage }
      : null
  };
}

export function createTournamentBracket(state) {
  return asArray(state?.knockoutStages).map((stage) => ({
    stage,
    label: TOURNAMENT_STAGE_LABELS[stage] || stage,
    matches: asArray(state.fixtures)
      .filter((fixture) => fixture.stage === stage)
      .sort((a, b) => a.round - b.round)
      .map((fixture) => ({
        id: fixture.id,
        home: getTournamentTeam(state, fixture.homeId)?.nationality || fixture.homeId,
        away: getTournamentTeam(state, fixture.awayId)?.nationality || fixture.awayId,
        involvesManager: fixture.homeId === state.managerTeamId || fixture.awayId === state.managerTeamId,
        status: fixture.status,
        score: fixture.result ? `${fixture.result.homeGoals}–${fixture.result.awayGoals}` : null,
        penalties: fixture.result?.penalties?.score || null,
        winner: fixture.result?.winnerId
          ? getTournamentTeam(state, fixture.result.winnerId)?.nationality || null
          : null
      }))
  }));
}

export function normalizeTournamentState(value) {
  if (!isObject(value) || value.version !== TOURNAMENT_VERSION) return null;
  if (!isNonEmptyString(value.managerTeamId) || !Array.isArray(value.teams) || !Array.isArray(value.fixtures)) {
    return null;
  }
  return structuredClone(value);
}
