// src/football-mini-season.js
//
// Mini Season v1 / League Loop v1 — bygger oppå eksisterende Club Week og
// Kampdag v0.2. Fem Club Weeks blir én sammenhengende sportslig prøveperiode:
// en deterministisk kamprekke, poeng, formkurve, momentum, en lett
// prøveperiode-tabell, styreforventninger per kamp og en samlet styrevurdering
// etter fem kamper.
//
// Ren ESM-motor: ingen DOM, ingen fetch, ingen localStorage, ingen app-state.
// Alle funksjoner er deterministiske — lik input gir byte-identisk output
// (ingen Date.now / Math.random her; app.js eier lagring og evt. unike id-er).
//
// Dette er IKKE en ligasimulator: ingen 20-lags-tabell, overgangsmarked,
// økonomi, kontrakter eller ny kamp-/Club Week-motor. Mini-sesongen KONSUMERER
// kampdagens resultat og konsekvenser — den lager dem ikke selv.
//
// Kjerneprinsipp (CLAUDE.md): «Alle spillere er gode nok. Spørsmålet er om
// treneren forstår dem.» Resultat alene avgjør ikke styrets dom — kontekst
// (forventning mot motstand, taktisk/treningsmessig identitet, belastning og
// uro utenfor banen) veier minst like tungt. `overall` avgjør ingenting her.

import { OPPONENT_PROFILES } from "./football-matchday-engine.js";

export const MINI_SEASON_VERSION = "historygo-football-manager.mini-season.v1";
export const MINI_SEASON_TOTAL_WEEKS = 5;

// Poengmodellen: seier 3, uavgjort 1, tap 0.
export const MINI_SEASON_POINTS = { win: 3, draw: 1, loss: 0 };

export const MINI_SEASON_OUTCOME_LABELS = {
  win: "Seier",
  draw: "Uavgjort",
  loss: "Tap"
};

// Formkurvebokstaver.
const FORM_LETTERS = { win: "W", draw: "D", loss: "L" };

// ----------------------------------------------------------------------------
// Små, rene hjelpere.
// ----------------------------------------------------------------------------
function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

function clampScore(value, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampRange(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

const VALID_OUTCOMES = ["win", "draw", "loss"];
const VALID_STATUS = ["not_started", "active", "completed"];
const VALID_DIFFICULTY = ["low", "medium", "high", "elite"];
const VALID_EXPECTATION = ["win", "avoid_loss", "compete", "free_hit"];
const DIFFICULTY_RANK = { low: 0, medium: 1, high: 2, elite: 3 };

// Deterministisk strenghash (FNV-1a) → 0..1. Brukes kun til den deterministiske
// prøveperiode-tabellen; aldri til kampresultater.
function hashFloat(str) {
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// ----------------------------------------------------------------------------
// Kontekstlesing: mini-sesongen leser managerens kontekst (off-pitch og/eller
// Club Week-verdier) uten å eie dem. Faller alltid trygt tilbake til nøytrale
// verdier. Ingen History Go-progresjon leses her.
// ----------------------------------------------------------------------------
function readContextSignals(context) {
  const ctx = isObject(context) ? context : {};
  const off = isObject(ctx.offPitch) ? ctx.offPitch : {};
  const team = isObject(off.team) ? off.team : {};
  const squad = isObject(off.squad) ? off.squad : {};
  const cw = isObject(ctx.clubWeekState) ? ctx.clubWeekState : {};

  const pick = (...candidates) => {
    for (const candidate of candidates) {
      if (Number.isFinite(Number(candidate))) return Number(candidate);
    }
    return candidates[candidates.length - 1];
  };

  return {
    fatigue: pick(team.fatigue, ctx.fatigue, 30),
    wear: pick(team.wear, ctx.wear, 25),
    morale: pick(team.morale, cw.playerMorale, ctx.morale, 55),
    cohesion: pick(team.cohesion, ctx.cohesion, 52),
    tacticalClarity: pick(squad.tacticalClarity, cw.tacticalClarity, ctx.tacticalClarity, 50),
    boardPressure: pick(team.boardPressure, ctx.boardPressure, 35),
    mediaPressure: pick(team.mediaPressure, cw.mediaPressure, ctx.mediaPressure, 30),
    hiddenStress: pick(squad.hiddenStress, ctx.hiddenStress, 22),
    boardTrust: pick(cw.boardTrust, ctx.boardTrust, 50)
  };
}

// Snapshot av hvor stabil konteksten er (0–100): høyt når belastning, press og
// uro er lavt og moral/samhold/klarhet er greit. Brukes som contextStabilityScore.
function computeContextStability(ctx) {
  let score = 50;
  score += (55 - (ctx.fatigue + ctx.wear) / 2) * 0.4;
  score += (40 - (ctx.boardPressure + ctx.mediaPressure) / 2) * 0.3;
  score += (ctx.morale - 50) * 0.3;
  score += (ctx.cohesion - 50) * 0.3;
  score += (ctx.tacticalClarity - 50) * 0.2;
  score -= (ctx.hiddenStress - 22) * 0.3;
  return clampScore(score);
}

// ----------------------------------------------------------------------------
// Sesongmål: avledes deterministisk fra konteksten ved sesongstart. Lite og
// lesbart — ingen objective engine.
// ----------------------------------------------------------------------------
function deriveSeasonGoal(context) {
  const ctx = readContextSignals(context);
  if (ctx.fatigue >= 60 || ctx.wear >= 60) return "Få kontroll på belastningen";
  if (ctx.tacticalClarity < 45) return "Bygg en tydelig spillestil";
  if (ctx.morale < 45 || ctx.cohesion < 45) return "Stabiliser laget";
  if (ctx.boardPressure >= 60) return "Lever resultater raskt";
  if (ctx.tacticalClarity < 55) return "Utvikle taktisk identitet";
  return "Bygg en tydelig spillestil";
}

// Samlet styreforventning for hele perioden (sesongnivå). Per-kamp-forventning
// ligger i selve kamprekka.
function deriveBoardExpectation(context) {
  const ctx = readContextSignals(context);
  if (ctx.boardPressure >= 60 || ctx.boardTrust < 40) {
    return "Styret er utålmodig og venter umiddelbar sportslig retning i prøveperioden.";
  }
  if (ctx.boardTrust >= 60) {
    return "Styret har tro på prosjektet og vil se at retningen holder over fem kamper.";
  }
  return "Styret vil se en tydelig sportslig retning og rimelige resultater i prøveperioden.";
}

// ----------------------------------------------------------------------------
// Motstanderplan (deterministisk 5-kampers schedule).
//
// Bruker de eksisterende motstanderprofilene (matchday-engine). Vanskelighets-
// grad avledes av profilens styrke, hjemme/borte og forventning av graden, og en
// kort «narrativ krok» av hva kampen tester. Rekkefølgen er deterministisk
// (sortert på styrke + en fast bølge-ordning), uavhengig av input-rekkefølge.
// ----------------------------------------------------------------------------
function difficultyFromStrength(strength) {
  const s = num(strength);
  if (s >= 76) return "elite";
  if (s >= 73) return "high";
  if (s >= 71) return "medium";
  return "low";
}

function matchExpectation(difficulty, homeAway) {
  if (difficulty === "low") return homeAway === "home" ? "win" : "avoid_loss";
  if (difficulty === "medium") return homeAway === "home" ? "avoid_loss" : "compete";
  if (difficulty === "high") return "compete";
  return "free_hit"; // elite
}

const EXPECTATION_FRAMING = {
  win: "Svakere lag — styret venter tre poeng.",
  avoid_loss: "Jevn motstander — unngå tap og vis kontroll.",
  compete: "Sterkere lag — konkurrer godt; prestasjonen teller mer enn tabellen.",
  free_hit: "Tøffeste motstand — fri kamp der prestasjon veier mer enn resultat."
};

function opponentTestTheme(opponent) {
  const styles = asArray(opponent?.matchupStyles);
  const has = (...tokens) => tokens.some((t) => styles.includes(t));
  if (has("high_press", "aggressive_man_press")) return "test av oppbyggingsspillet under press";
  if (has("deep_low_block", "compact_532", "passive_mid_block")) return "test av sjanseskapingen mot en lav blokk";
  if (has("direct_counter", "fast_transition", "fast_runners_in_behind")) return "test av restforsvaret mot kontringer";
  if (has("possession_positional", "build_from_back", "switching_play")) return "test av pressdisiplinen mot ballbesittelse";
  if (has("target_man_direct", "two_striker_press")) return "test av dueller og dødballforsvar";
  return "en allsidig test av laget";
}

// Fast bølge-ordning: sortér på styrke stigende, plukk så vekselvis fra bunn og
// topp slik at lett/tung motstand veksler. Deterministisk for et gitt sett.
function arrangeOpponentWave(sorted) {
  const order = [];
  let lo = 0;
  let hi = sorted.length - 1;
  let takeLow = true;
  while (lo <= hi) {
    if (takeLow) {
      order.push(sorted[lo]);
      lo += 1;
    } else {
      order.push(sorted[hi]);
      hi -= 1;
    }
    takeLow = !takeLow;
  }
  return order;
}

function resolveOpponents(context) {
  const fromContext = asArray(context?.opponents).filter((o) => isObject(o) && isNonEmptyString(o.id));
  const pool = fromContext.length > 0 ? fromContext : OPPONENT_PROFILES;
  return pool.map((o) => ({ ...o }));
}

// Bygg en deterministisk schedule på nøyaktig MINI_SEASON_TOTAL_WEEKS runder.
// Med færre motstandere enn runder sykles det gjennom dem (fortsatt determinist).
export function buildMiniSeasonSchedule(context = {}) {
  const opponents = resolveOpponents(context);
  if (opponents.length === 0) {
    return [];
  }

  const firstOpponentId = isNonEmptyString(context.firstOpponentId) ? context.firstOpponentId : null;
  const firstOpponent = firstOpponentId ? opponents.find((opponent) => opponent.id === firstOpponentId) : null;

  // Noen scenarioer ER en rekkefølge: «Taktikkens historie» går kronologisk,
  // fordi hvert system er et svar på problemet det forrige skapte. Da skal ikke
  // styrkesorteringen stokke om på fortellingen.
  const explicitOrder = asArray(context?.opponentOrder)
    .map((id) => opponents.find((opponent) => opponent.id === id))
    .filter(Boolean);

  const sorted = [...opponents].sort((a, b) => {
    const diff = num(a.strength) - num(b.strength);
    return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id));
  });
  const waved = explicitOrder.length > 0 ? explicitOrder : arrangeOpponentWave(sorted);

  // Den valgte første motstanderen løftes til FRONTEN av rekkefølgen — den
  // erstatter ikke bare runde 1.
  //
  // Før ble runde 1 overstyrt mens resten fortsatte fra `waved[1]`. Da forsvant
  // `waved[0]` helt, og førstemotstanderen dukket opp igjen senere i lista.
  // «Kontringens kunst» endte med å spille Leicester to ganger og Inter aldri —
  // et scenario som lovet fem motstandere leverte fire.
  const order = firstOpponent && explicitOrder.length === 0
    ? [firstOpponent, ...waved.filter((opponent) => opponent.id !== firstOpponent.id)]
    : waved;

  const schedule = [];
  for (let round = 1; round <= MINI_SEASON_TOTAL_WEEKS; round += 1) {
    const opponent = order[(round - 1) % order.length];
    const difficulty = difficultyFromStrength(opponent.strength);
    // Sterkere lag spilles borte, svakere/jevne hjemme — slik styremålene
    // (seier hjemme, prestasjon borte) får en naturlig ramme.
    const homeAway = DIFFICULTY_RANK[difficulty] >= 2 ? "away" : "home";
    const boardExpectation = matchExpectation(difficulty, homeAway);
    const theme = opponentTestTheme(opponent);
    const venueLabel = homeAway === "home" ? "Hjemme" : "Borte";

    schedule.push({
      round,
      opponentId: opponent.id,
      opponentName: opponent.name || "Ukjent motstander",
      opponentStrength: num(opponent.strength),
      difficulty,
      homeAway,
      boardExpectation,
      narrativeHook: `${EXPECTATION_FRAMING[boardExpectation]} ${venueLabel}: ${theme}.`
    });
  }
  return schedule;
}

function normalizeScheduleEntry(entry, fallbackRound) {
  const e = isObject(entry) ? entry : {};
  const round = Number.isInteger(e.round) && e.round >= 1 ? e.round : fallbackRound;
  const difficulty = VALID_DIFFICULTY.includes(e.difficulty) ? e.difficulty : "medium";
  const homeAway = e.homeAway === "away" ? "away" : "home";
  const boardExpectation = VALID_EXPECTATION.includes(e.boardExpectation)
    ? e.boardExpectation
    : matchExpectation(difficulty, homeAway);
  return {
    round,
    opponentId: isNonEmptyString(e.opponentId) ? e.opponentId : `opponent-${round}`,
    opponentName: isNonEmptyString(e.opponentName) ? e.opponentName : "Ukjent motstander",
    opponentStrength: num(e.opponentStrength),
    difficulty,
    homeAway,
    boardExpectation,
    narrativeHook: isNonEmptyString(e.narrativeHook) ? e.narrativeHook : EXPECTATION_FRAMING[boardExpectation]
  };
}

// ----------------------------------------------------------------------------
// Resultat-adapter: konsumér kampdagens resultat. Bruker score når den finnes,
// ellers en trygg, deterministisk mapping fra utfall (ingen falsk presisjon).
// ----------------------------------------------------------------------------
function adaptMatchResult(matchdayResult) {
  const r = isObject(matchdayResult) ? matchdayResult : {};
  const rawFor = r.score?.for ?? r.goalsFor;
  const rawAgainst = r.score?.against ?? r.goalsAgainst;
  const hasGoals = Number.isFinite(Number(rawFor)) && Number.isFinite(Number(rawAgainst));

  let outcome = VALID_OUTCOMES.includes(r.outcome) ? r.outcome : null;
  let goalsFor = Math.max(0, Math.round(num(rawFor)));
  let goalsAgainst = Math.max(0, Math.round(num(rawAgainst)));

  if (!outcome) {
    outcome = goalsFor > goalsAgainst ? "win" : goalsFor < goalsAgainst ? "loss" : "draw";
  }

  if (!hasGoals) {
    // Trygg, beskjeden mapping fra utfall — kun for å holde mål-kolonnene
    // konsistente når kampmotoren ikke ga en konkret stilling.
    if (outcome === "win") {
      goalsFor = 2;
      goalsAgainst = 1;
    } else if (outcome === "loss") {
      goalsFor = 0;
      goalsAgainst = 2;
    } else {
      goalsFor = 1;
      goalsAgainst = 1;
    }
  }

  return { outcome, goalsFor, goalsAgainst };
}

// Hvor godt resultatet møter styrets forventning til DENNE kampen. Et tap mot
// elite borte (free_hit) straffes langt mildere enn tap hjemme mot svakere (win).
function scoreExpectation(outcome, expectation) {
  switch (expectation) {
    case "win":
      return outcome === "win" ? 2 : outcome === "draw" ? -1 : -3;
    case "avoid_loss":
      return outcome === "win" ? 2 : outcome === "draw" ? 1 : -2;
    case "compete":
      return outcome === "win" ? 3 : outcome === "draw" ? 1 : 0;
    case "free_hit":
      return outcome === "win" ? 3 : outcome === "draw" ? 2 : 0;
    default:
      return outcome === "win" ? 2 : outcome === "draw" ? 0 : -1;
  }
}

// ----------------------------------------------------------------------------
// State: opprett, normalisér, start.
// ----------------------------------------------------------------------------
function aggregateFromHistory(history) {
  const agg = {
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    form: []
  };
  for (const entry of history) {
    const outcome = VALID_OUTCOMES.includes(entry.outcome) ? entry.outcome : "draw";
    agg.points += MINI_SEASON_POINTS[outcome] || 0;
    if (outcome === "win") agg.wins += 1;
    else if (outcome === "draw") agg.draws += 1;
    else agg.losses += 1;
    agg.goalsFor += Math.max(0, Math.round(num(entry.goalsFor)));
    agg.goalsAgainst += Math.max(0, Math.round(num(entry.goalsAgainst)));
    agg.form.push(FORM_LETTERS[outcome] || "D");
  }
  return agg;
}

function normalizeHistoryEntry(entry, fallbackRound) {
  const e = isObject(entry) ? entry : {};
  const outcome = VALID_OUTCOMES.includes(e.outcome) ? e.outcome : "draw";
  const goalsFor = Math.max(0, Math.round(num(e.goalsFor)));
  const goalsAgainst = Math.max(0, Math.round(num(e.goalsAgainst)));
  const round = Number.isInteger(e.round) && e.round >= 1 ? e.round : fallbackRound;
  return {
    round,
    matchId: isNonEmptyString(e.matchId) ? e.matchId : `mini-r${round}`,
    opponentId: isNonEmptyString(e.opponentId) ? e.opponentId : `opponent-${round}`,
    opponentName: isNonEmptyString(e.opponentName) ? e.opponentName : "Ukjent motstander",
    difficulty: VALID_DIFFICULTY.includes(e.difficulty) ? e.difficulty : "medium",
    homeAway: e.homeAway === "away" ? "away" : "home",
    boardExpectation: VALID_EXPECTATION.includes(e.boardExpectation) ? e.boardExpectation : "compete",
    outcome,
    goalsFor,
    goalsAgainst,
    scoreLine: `${goalsFor}–${goalsAgainst}`,
    teamStrength: num(e.teamStrength),
    opponentStrength: num(e.opponentStrength),
    decisionScore: num(e.decisionScore),
    expectationScore: num(e.expectationScore)
  };
}

// Normalisér en (muligens tom/ufullstendig/korrupt) state til full v1-form.
// Returnerer null kun når input ikke er et objekt i det hele tatt. Aggregatene
// (poeng, W/D/L, mål, form) regnes alltid fra matchHistory, som er fasit.
// Deterministisk: ingen tidsstempler, ingen tilfeldighet.
export function normalizeMiniSeasonState(state) {
  if (!isObject(state)) {
    return null;
  }

  const totalWeeks = MINI_SEASON_TOTAL_WEEKS;

  let schedule = asArray(state.opponentSchedule).map((entry, i) => normalizeScheduleEntry(entry, i + 1));
  if (schedule.length === 0) {
    // Uten lagret plan kan vi ikke gjenskape kamprekka; behold tom plan slik at
    // kalleren kan oppdage at sesongen ikke er spillbar.
    schedule = [];
  }

  // Dedupliser historikk på round og matchId, kapp til antall runder.
  const seenRounds = new Set();
  const seenIds = new Set();
  const history = [];
  asArray(state.matchHistory).forEach((entry, i) => {
    const normalized = normalizeHistoryEntry(entry, i + 1);
    if (seenRounds.has(normalized.round) || seenIds.has(normalized.matchId)) {
      return;
    }
    if (history.length >= totalWeeks) {
      return;
    }
    seenRounds.add(normalized.round);
    seenIds.add(normalized.matchId);
    history.push(normalized);
  });

  const agg = aggregateFromHistory(history);
  const historyLen = history.length;

  let weekIndex = Number.isInteger(state.weekIndex) ? state.weekIndex : historyLen;
  const minIndex = Math.max(0, historyLen - 1);
  const maxIndex = Math.min(totalWeeks, historyLen);
  weekIndex = Math.max(minIndex, Math.min(maxIndex, weekIndex));

  let status = VALID_STATUS.includes(state.status) ? state.status : "active";
  // Hele kamprekka spilt ⇒ alltid fullført. En lagret «completed» beholdes også
  // når perioden ble avsluttet tidlig (completeMiniSeason). En «not_started» med
  // spilte kamper er inkonsistent og løftes til «active».
  if (weekIndex >= totalWeeks && historyLen >= totalWeeks) {
    status = "completed";
  } else if (status === "not_started" && historyLen > 0) {
    status = "active";
  }

  return {
    version: MINI_SEASON_VERSION,
    status,
    seasonId: isNonEmptyString(state.seasonId) ? state.seasonId : "mini-season-v1",
    weekIndex,
    totalWeeks,
    points: agg.points,
    wins: agg.wins,
    draws: agg.draws,
    losses: agg.losses,
    goalsFor: agg.goalsFor,
    goalsAgainst: agg.goalsAgainst,
    form: agg.form,
    boardExpectation: isNonEmptyString(state.boardExpectation)
      ? state.boardExpectation
      : "Styret vil se en tydelig sportslig retning og rimelige resultater i prøveperioden.",
    seasonGoal: isNonEmptyString(state.seasonGoal) ? state.seasonGoal : "Bygg en tydelig spillestil",
    opponentSchedule: schedule,
    matchHistory: history,
    momentum: clampRange(state.momentum, -10, 10),
    boardTrustTrend: clampRange(state.boardTrustTrend, -12, 12),
    tacticalIdentityScore: clampScore(state.tacticalIdentityScore, 50),
    trainingIdentityScore: clampScore(state.trainingIdentityScore, 50),
    contextStabilityScore: clampScore(state.contextStabilityScore, 50),
    finalReview: isObject(state.finalReview) ? state.finalReview : null
  };
}

// Opprett en ny mini-sesong (status not_started) med ferdig kamprekke, avledet
// sesongmål og styreforventning. Deterministisk for lik context.
export function createMiniSeasonState(context = {}) {
  const schedule = buildMiniSeasonSchedule(context);
  return normalizeMiniSeasonState({
    version: MINI_SEASON_VERSION,
    status: "not_started",
    seasonId: isNonEmptyString(context.seasonId) ? context.seasonId : "mini-season-v1",
    weekIndex: 0,
    totalWeeks: MINI_SEASON_TOTAL_WEEKS,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    form: [],
    boardExpectation: deriveBoardExpectation(context),
    seasonGoal: deriveSeasonGoal(context),
    opponentSchedule: schedule,
    matchHistory: [],
    momentum: 0,
    boardTrustTrend: 0,
    tacticalIdentityScore: 50,
    trainingIdentityScore: 50,
    contextStabilityScore: computeContextStability(readContextSignals(context)),
    finalReview: null
  });
}

// Start prøveperioden: en ny state satt til active. Returnerer null hvis det
// ikke finnes nok motstandere til en kamprekke (kan ikke spilles).
export function startMiniSeason(context = {}) {
  const state = createMiniSeasonState(context);
  if (!state || state.opponentSchedule.length < MINI_SEASON_TOTAL_WEEKS) {
    return null;
  }
  return normalizeMiniSeasonState({ ...state, status: "active" });
}

// ----------------------------------------------------------------------------
// Kamprekke-navigasjon.
// ----------------------------------------------------------------------------

// Gjeldende kamp (schedule-oppføringen for inneværende uke), eller null når
// sesongen ikke er aktiv eller alle kamper er spilt.
export function getCurrentMiniSeasonMatch(state) {
  const s = normalizeMiniSeasonState(state);
  if (!s || s.status !== "active") {
    return null;
  }
  if (s.weekIndex < 0 || s.weekIndex >= s.totalWeeks) {
    return null;
  }
  return s.opponentSchedule[s.weekIndex] || null;
}

// Sann når inneværende ukes kamp er spilt, men uka ennå ikke er rullet videre.
export function isCurrentMiniSeasonMatchPlayed(state) {
  const s = normalizeMiniSeasonState(state);
  if (!s) return false;
  return s.matchHistory.length > s.weekIndex;
}

// ----------------------------------------------------------------------------
// Resultatregistrering: konsumér kampdagens resultat for inneværende runde.
// Endrer ikke weekIndex (det gjør advanceMiniSeasonWeek). Idempotent: samme
// runde/matchId registreres aldri to ganger (reload/dobbeltkall er trygt).
// Returnerer alltid en ny, normalisert state — input muteres aldri.
// ----------------------------------------------------------------------------
export function applyMiniSeasonMatchResult(state, matchdayResult, context = {}) {
  const s = normalizeMiniSeasonState(state);
  if (!s || s.status !== "active") {
    return s;
  }

  const idx = s.weekIndex;
  if (idx < 0 || idx >= s.totalWeeks) {
    return s;
  }
  const match = s.opponentSchedule[idx];
  if (!match) {
    return s;
  }

  const round = match.round;
  // Idempotens: denne runden er allerede registrert.
  if (s.matchHistory.some((h) => h.round === round)) {
    return s;
  }

  const adapted = adaptMatchResult(matchdayResult);
  const matchId = isNonEmptyString(matchdayResult?.matchId)
    ? matchdayResult.matchId
    : isNonEmptyString(matchdayResult?.id)
    ? matchdayResult.id
    : `mini-${s.seasonId}-r${round}`;
  if (s.matchHistory.some((h) => h.matchId === matchId)) {
    return s;
  }

  const ctx = readContextSignals(context);
  const rank = DIFFICULTY_RANK[match.difficulty] ?? 1;

  // Beslutningsdata fra kampdagen (driver taktisk identitet, ikke resultatet).
  const decisions = asArray(matchdayResult?.decisions);
  const positiveCount = decisions.filter((d) => d?.tone === "positive").length;
  const negativeCount = decisions.filter((d) => d?.tone === "negative").length;
  const decisionScore = num(matchdayResult?.decisionTotals?.eventScoreDelta);
  const training = isObject(matchdayResult?.trainingFocus) ? matchdayResult.trainingFocus : null;
  const trainingHelped = Boolean(training?.helped);
  const trainingStrong = training?.staffSupport === "strong";

  // Momentum: opp ved seier (mer mot sterke), ned ved tap (mer mot svake/jevne).
  let momentum = s.momentum;
  if (adapted.outcome === "win") {
    momentum += 2 + (rank >= 2 ? 2 : 0);
  } else if (adapted.outcome === "draw") {
    momentum += rank >= 2 ? 1 : rank === 0 ? -1 : 0;
  } else {
    momentum -= 2 + (rank <= 1 ? 2 : 0);
  }
  if (ctx.hiddenStress >= 55 || ctx.boardPressure >= 65) momentum -= 1;
  if (ctx.morale >= 65 && adapted.outcome !== "loss") momentum += 1;
  momentum = clampRange(momentum, -10, 10);

  // Styretillit-trend: resultat veid mot kampens forventning.
  const expectationScore = scoreExpectation(adapted.outcome, match.boardExpectation);
  const boardTrustTrend = clampRange(s.boardTrustTrend + expectationScore, -12, 12);

  // Taktisk identitet: tydelige, vellykkede grep og kontekst-relevant trening
  // bygger identitet; kaotiske grep river den ned. Resultat alene gjør ingenting.
  let tactical = s.tacticalIdentityScore;
  if (decisionScore > 0) tactical += 3;
  else if (decisionScore < 0) tactical -= 3;
  if (positiveCount >= 2) tactical += 2;
  if (negativeCount >= 2) tactical -= 3;
  if (trainingHelped) tactical += 2;
  const tacticalIdentityScore = clampScore(tactical);

  // Treningsidentitet: et valgt, godt støttet og treffende treningsfokus bygger
  // en rød tråd; ingen trening svekker den.
  let trainingScore = s.trainingIdentityScore;
  if (training) {
    trainingScore += 2;
    if (trainingStrong) trainingScore += 2;
    if (trainingHelped) trainingScore += 2;
  } else {
    trainingScore -= 3;
  }
  const trainingIdentityScore = clampScore(trainingScore);

  const contextStabilityScore = computeContextStability(ctx);

  const entry = {
    round,
    matchId,
    opponentId: match.opponentId,
    opponentName: match.opponentName,
    difficulty: match.difficulty,
    homeAway: match.homeAway,
    boardExpectation: match.boardExpectation,
    outcome: adapted.outcome,
    goalsFor: adapted.goalsFor,
    goalsAgainst: adapted.goalsAgainst,
    scoreLine: `${adapted.goalsFor}–${adapted.goalsAgainst}`,
    teamStrength: num(matchdayResult?.teamStrength),
    opponentStrength: num(matchdayResult?.opponent?.strength) || num(match.opponentStrength),
    decisionScore,
    expectationScore
  };

  return normalizeMiniSeasonState({
    ...s,
    matchHistory: [...s.matchHistory, entry],
    momentum,
    boardTrustTrend,
    tacticalIdentityScore,
    trainingIdentityScore,
    contextStabilityScore
  });
}

// Rull mini-sesongen til neste uke/kamp. Krever at inneværende ukes kamp er
// spilt (ellers no-op). Når siste runde er spilt fullføres sesongen og styrets
// sluttvurdering bygges. Idempotent og deterministisk.
export function advanceMiniSeasonWeek(state, context = {}) {
  const s = normalizeMiniSeasonState(state);
  if (!s || s.status !== "active") {
    return s;
  }
  // Inneværende kamp må være spilt før uka kan rulle.
  if (s.matchHistory.length <= s.weekIndex) {
    return s;
  }

  const nextIndex = s.weekIndex + 1;
  if (nextIndex >= s.totalWeeks) {
    return completeMiniSeason({ ...s, weekIndex: s.totalWeeks }, context);
  }
  return normalizeMiniSeasonState({ ...s, weekIndex: nextIndex });
}

// Fullfør prøveperioden: sett completed og bygg styrets sluttvurdering.
export function completeMiniSeason(state, context = {}) {
  const s = normalizeMiniSeasonState(state);
  if (!s) {
    return s;
  }
  const review = createMiniSeasonBoardReview(s, context);
  return normalizeMiniSeasonState({
    ...s,
    status: "completed",
    weekIndex: s.totalWeeks,
    finalReview: review
  });
}

// ----------------------------------------------------------------------------
// Styrevurdering: per kamp + samlet dom etter perioden. Kontekstuell —
// forventning, identitet, momentum og kontekststabilitet veier sammen med poeng.
// ----------------------------------------------------------------------------
const VERDICT_CONTENT = {
  trusted: {
    label: "Styret gir tillit",
    headline: "Styret gir deg tillit etter prøveperioden.",
    recommendation: "Anbefalt neste steg: fortsett med systemet — laget er klart for en lengre periode."
  },
  pressure: {
    label: "Fortsetter under press",
    headline: "Styret gir deg mer tid, men du fortsetter under press.",
    recommendation:
      "Anbefalt neste steg: stabiliser klubbverdiene gjennom klubbukene og bygg en tydeligere identitet neste periode."
  },
  failed: {
    label: "Prøveperioden feilet",
    headline: "Prøveperioden overbeviste ikke styret.",
    recommendation:
      "Anbefalt neste steg: nullstill perioden, juster system, laguttak og belastning, og prøv igjen."
  }
};

const EXPECTATION_LABELS = {
  win: "forventet seier",
  avoid_loss: "unngå tap",
  compete: "konkurrer godt",
  free_hit: "fri kamp"
};

function matchReviewNote(entry) {
  const outcomeLabel = MINI_SEASON_OUTCOME_LABELS[entry.outcome] || "Kamp";
  const expLabel = EXPECTATION_LABELS[entry.boardExpectation] || "forventning";
  const venue = entry.homeAway === "home" ? "hjemme" : "borte";
  let met = "met";
  if (entry.expectationScore > 0) met = "over";
  else if (entry.expectationScore < 0) met = "under";

  let verdict;
  if (met === "over") verdict = "over forventning";
  else if (met === "under") verdict = "under forventning";
  else verdict = "som forventet";

  return {
    round: entry.round,
    opponentName: entry.opponentName,
    homeAway: entry.homeAway,
    difficulty: entry.difficulty,
    outcome: entry.outcome,
    scoreLine: entry.scoreLine,
    expectation: entry.boardExpectation,
    met,
    note: `Runde ${entry.round} (${venue}) mot ${entry.opponentName}: ${outcomeLabel} ${entry.scoreLine} — ${verdict} (${expLabel}).`
  };
}

export function createMiniSeasonBoardReview(state, context = {}) {
  const s = normalizeMiniSeasonState(state);
  if (!s) {
    return null;
  }

  const ctx = readContextSignals(context);
  const played = s.matchHistory.length;
  const matchReviews = s.matchHistory.map(matchReviewNote);

  // Samlet poengscore: resultater + forventnings-trend + identitet + kontekst.
  let score = s.points;
  score += s.boardTrustTrend;
  score += Math.round(s.momentum / 2);
  if (s.tacticalIdentityScore >= 60) score += 2;
  else if (s.tacticalIdentityScore < 40) score -= 2;
  if (s.trainingIdentityScore >= 60) score += 1;
  else if (s.trainingIdentityScore < 40) score -= 1;
  if (s.contextStabilityScore < 35) score -= 2;
  else if (s.contextStabilityScore >= 65) score += 1;
  if (ctx.boardTrust < 40) score -= 2;
  else if (ctx.boardTrust >= 60) score += 1;

  let verdict = "pressure";
  if (score >= 14 && s.boardTrustTrend >= 0) {
    verdict = "trusted";
  } else if (score <= 4 || s.boardTrustTrend <= -6) {
    verdict = "failed";
  }

  const content = VERDICT_CONTENT[verdict];
  const overCount = matchReviews.filter((m) => m.met === "over").length;
  const underCount = matchReviews.filter((m) => m.met === "under").length;

  const detailParts = [
    `${s.points} poeng på ${played} kamp${played === 1 ? "" : "er"} (${s.wins} S / ${s.draws} U / ${s.losses} T, ${s.goalsFor}–${s.goalsAgainst}).`,
    `${overCount} kamp${overCount === 1 ? "" : "er"} over forventning, ${underCount} under.`
  ];
  if (s.tacticalIdentityScore >= 60 || s.trainingIdentityScore >= 60) {
    detailParts.push("Laget viser en tydelig taktisk og treningsmessig identitet.");
  } else if (s.tacticalIdentityScore < 40) {
    detailParts.push("Den taktiske identiteten framstår uklar etter perioden.");
  }
  if (s.contextStabilityScore < 35) {
    detailParts.push("Belastning og uro utenfor banen preget perioden.");
  }

  return {
    verdict,
    label: content.label,
    headline: content.headline,
    detail: detailParts.join(" "),
    recommendation: content.recommendation,
    points: s.points,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalsFor - s.goalsAgainst,
    boardTrustTrend: s.boardTrustTrend,
    momentum: s.momentum,
    tacticalIdentityScore: s.tacticalIdentityScore,
    trainingIdentityScore: s.trainingIdentityScore,
    contextStabilityScore: s.contextStabilityScore,
    seasonGoal: s.seasonGoal,
    matchReviews
  };
}

// ----------------------------------------------------------------------------
// Prøveperiode-tabell (light league): HG-laget mot 3–4 rivaler. IKKE en
// simulert liga — rivalenes rekorder er deterministisk avledet av styrke og en
// per-lag-seed, over like mange kamper som HG har spilt. Stabil for lik input.
// ----------------------------------------------------------------------------
function syntheticRivalRecord(opponent, played, seed) {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  const winP = clamp01((num(opponent.strength) - 60) / 25);

  for (let i = 0; i < played; i += 1) {
    const roll = hashFloat(`${seed}:${i}:r`);
    if (roll < winP) {
      wins += 1;
      goalsFor += 1 + Math.round(hashFloat(`${seed}:${i}:gf`) * 2);
      goalsAgainst += Math.round(hashFloat(`${seed}:${i}:ga`));
    } else if (roll < winP + 0.3) {
      draws += 1;
      goalsFor += 1;
      goalsAgainst += 1;
    } else {
      losses += 1;
      goalsFor += Math.round(hashFloat(`${seed}:${i}:gf`));
      goalsAgainst += 1 + Math.round(hashFloat(`${seed}:${i}:ga`) * 2);
    }
  }

  return { wins, draws, losses, goalsFor, goalsAgainst };
}

function compareTableRows(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return String(a.name).localeCompare(String(b.name));
}

export function createMiniSeasonTable(state, context = {}) {
  const s = normalizeMiniSeasonState(state);
  if (!s) {
    return null;
  }

  const played = s.matchHistory.length;
  const teamName = isNonEmptyString(context.teamName) ? context.teamName : "HG-laget";

  const hgRow = {
    id: "hg_team",
    name: teamName,
    isHg: true,
    played,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalsFor - s.goalsAgainst,
    points: s.points
  };

  // Inntil fire rivaler fra motstanderprofilene gir en 4–5-lags tabell.
  const rivals = resolveOpponents(context)
    .slice(0, 4)
    .map((opponent) => {
      const rec = syntheticRivalRecord(opponent, played, `${s.seasonId}:${opponent.id}`);
      return {
        id: opponent.id,
        name: opponent.name || "Rival",
        isHg: false,
        played,
        wins: rec.wins,
        draws: rec.draws,
        losses: rec.losses,
        goalsFor: rec.goalsFor,
        goalsAgainst: rec.goalsAgainst,
        goalDifference: rec.goalsFor - rec.goalsAgainst,
        points: rec.wins * MINI_SEASON_POINTS.win + rec.draws * MINI_SEASON_POINTS.draw
      };
    });

  const rows = [hgRow, ...rivals].sort(compareTableRows).map((row, index) => ({
    ...row,
    position: index + 1
  }));

  return {
    played,
    totalRounds: s.totalWeeks,
    rows
  };
}

// ----------------------------------------------------------------------------
// Formkurve.
// ----------------------------------------------------------------------------
export function createMiniSeasonFormGuide(state) {
  const s = normalizeMiniSeasonState(state);
  if (!s) {
    return null;
  }

  const form = s.form;
  const recent = form.slice(-5);

  let unbeatenStreak = 0;
  for (let i = form.length - 1; i >= 0; i -= 1) {
    if (form[i] === "L") break;
    unbeatenStreak += 1;
  }
  let winlessStreak = 0;
  for (let i = form.length - 1; i >= 0; i -= 1) {
    if (form[i] === "W") break;
    winlessStreak += 1;
  }

  const trend = s.momentum >= 3 ? "rising" : s.momentum <= -3 ? "falling" : "stable";
  const trendLabel = trend === "rising" ? "stigende" : trend === "falling" ? "fallende" : "stabil";

  let note;
  if (form.length === 0) {
    note = "Ingen kamper spilt ennå — formkurven starter med første kamp.";
  } else if (unbeatenStreak >= 3) {
    note = `Ubeseiret i ${unbeatenStreak} kamper — formkurven er ${trendLabel}.`;
  } else if (winlessStreak >= 3) {
    note = `Uten seier i ${winlessStreak} kamper — formkurven er ${trendLabel}.`;
  } else {
    note = `Formkurven er ${trendLabel}.`;
  }

  return {
    form,
    recent,
    formText: recent.join(" "),
    points: s.points,
    momentum: s.momentum,
    trend,
    trendLabel,
    unbeatenStreak,
    winlessStreak,
    note
  };
}

// ----------------------------------------------------------------------------
// Lesbar oppsummering (status + «hva betyr dette nå?»).
// ----------------------------------------------------------------------------
export function summarizeMiniSeason(state) {
  const s = normalizeMiniSeasonState(state);
  if (!s) {
    return null;
  }

  const played = s.matchHistory.length;
  const nextMatch = getCurrentMiniSeasonMatch(s);
  const formGuide = createMiniSeasonFormGuide(s);
  const record = `${s.wins}-${s.draws}-${s.losses}`;
  const goals = `${s.goalsFor}–${s.goalsAgainst}`;

  let headline;
  if (s.status === "not_started") {
    headline = `Prøveperiode klar: ${s.totalWeeks} kamper venter. Sesongmål: ${s.seasonGoal}.`;
  } else if (s.status === "completed") {
    const verdictLabel = s.finalReview?.label || "Styret har felt sin dom";
    headline = `Prøveperioden er fullført: ${s.points} poeng (${record}). ${verdictLabel}.`;
  } else {
    headline = `Runde ${Math.min(s.weekIndex + 1, s.totalWeeks)} av ${s.totalWeeks} · ${s.points} poeng (${record}).`;
  }

  const lines = [];
  lines.push(`Sesongmål: ${s.seasonGoal}.`);
  lines.push(`Poeng: ${s.points} · Mål: ${goals} · Form: ${formGuide.formText || "—"}.`);
  if (nextMatch) {
    const venue = nextMatch.homeAway === "home" ? "hjemme" : "borte";
    lines.push(`Neste: ${nextMatch.opponentName} (${venue}). ${nextMatch.narrativeHook}`);
  } else if (s.status === "completed" && s.finalReview) {
    lines.push(s.finalReview.detail);
  }

  return {
    seasonId: s.seasonId,
    status: s.status,
    weekIndex: s.weekIndex,
    totalWeeks: s.totalWeeks,
    played,
    points: s.points,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalsFor - s.goalsAgainst,
    record,
    form: s.form,
    formText: formGuide.formText,
    momentum: s.momentum,
    boardExpectation: s.boardExpectation,
    seasonGoal: s.seasonGoal,
    nextOpponent: nextMatch,
    headline,
    lines
  };
}

// ----------------------------------------------------------------------------
// Off-pitch-kobling: foreslå en off-pitch-hendelse FRA mini-sesongens kontekst
// etter en kamp (god/dårlig prestasjon mot forventning, tett kamp med høy
// belastning, tydelig/kaotisk retning). Komponerer MED applyMatchdayOffPitchEffects
// i app.js — dupliserer den ikke. Returnerer en event ({ id, type, title,
// description, effects }) eller null. Påvirker ikke History Go-progresjon.
// ----------------------------------------------------------------------------
export function createMiniSeasonOffPitchEvent(state, context = {}) {
  const s = normalizeMiniSeasonState(state);
  if (!s) {
    return null;
  }
  const entry = s.matchHistory[s.matchHistory.length - 1];
  if (!entry) {
    return null;
  }

  const ctx = readContextSignals(context);
  const effects = {};

  // Prestasjon mot forventning farger selvtillit/press.
  if (entry.expectationScore >= 2) {
    effects.confidence = 4;
    effects.morale = 2;
    effects.tacticalClarity = 2;
  } else if (entry.expectationScore <= -2) {
    effects.pressure = 4;
    effects.boardPressure = 4;
    effects.mediaPressure = 3;
  } else if (entry.expectationScore < 0) {
    effects.boardPressure = 2;
    effects.mediaPressure = 2;
  }

  // Tydelig taktisk retning løfter samhold/klarhet; kaotisk periode gir uro.
  if (s.tacticalIdentityScore >= 62) {
    effects.cohesion = (effects.cohesion || 0) + 2;
    effects.tacticalClarity = (effects.tacticalClarity || 0) + 1;
  } else if (s.tacticalIdentityScore <= 38) {
    effects.hiddenStress = (effects.hiddenStress || 0) + 3;
    effects.roleFrustration = (effects.roleFrustration || 0) + 2;
  }

  // Tett kamp med høy belastning sliter ekstra.
  const tight = Math.abs(entry.goalsFor - entry.goalsAgainst) <= 1;
  if (tight && (ctx.fatigue >= 55 || ctx.wear >= 55)) {
    effects.fatigue = (effects.fatigue || 0) + 4;
    effects.wear = (effects.wear || 0) + 3;
  }

  if (Object.keys(effects).length === 0) {
    return null;
  }

  const outcomeLabel = MINI_SEASON_OUTCOME_LABELS[entry.outcome] || "Kamp";
  return {
    id: `mini-season:r${entry.round}:${entry.outcome}`,
    type: "board",
    title: `Prøveperioden – runde ${entry.round}`,
    description: `${outcomeLabel} ${entry.scoreLine} mot ${entry.opponentName} satte spor i konteksten rundt laget.`,
    effects
  };
}
