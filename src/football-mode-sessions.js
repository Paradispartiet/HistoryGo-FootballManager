// Mode Isolation v1
//
// The envelope is the single owner of the active mode and of the mutable
// manager-session snapshots.  The football engines remain stateless and are
// reused by every mode; only their input/output state is namespaced here.
// Legacy league keys are read once and copied into `sessions.league`.  They are
// deliberately not deleted until the envelope has been written successfully.

export const MODE_SESSION_KEY = "hgfm.modeSessions.v1";
export const MODE_SESSION_VERSION = "mode-sessions.v1";
export const MODES = Object.freeze(["league", "scenario", "training", "national"]);

export const SESSION_STATE_FIELDS = Object.freeze([
  "selectedFormationId", "selectedTacticId", "lineup", "slotPositions",
  "weeklyTrainingFocus", "weeklyTrainingProgram", "individualTraining", "trainingWeek",
  "opponentAnalysisPlan",
  "activeKnowledgeFocusId", "completedKnowledgeFocusIds", "clubWeekState",
  "clubWeekFeedback", "clubWeekEventLog", "matchday", "miniSeason",
  "readInboxMessageIds", "deliveredInboxMessageIds", "selectedInboxChoices",
  "firstTimePlaythrough", "teamMerits", "leagueSeason",
  "nationalTeam", "tournament", "tournamentHistory", "playerSeasonStats",
  "playerCondition", "playerConditionMatchIds", "seasonArchive", "seasonReview", "federationVerdict", "federationTrust"
]);

// Set-felt: disse er `Set` i app-staten, men `JSON.stringify(new Set())` gir
// `"{}"` — så en naiv JSON-runde (captureModeSession → applyModeSession) gjorde
// dem om til tomme objekter. Neste `state.deliveredInboxMessageIds.has(...)`
// kastet da «has is not a function», renderApp stoppet, og appen ble stående i
// «Feil». Vi serialiserer dem som arrays og rehydrerer til `Set` igjen.
export const SET_STATE_FIELDS = Object.freeze([
  "readInboxMessageIds", "deliveredInboxMessageIds", "completedKnowledgeFocusIds"
]);

function toIdArray(value) {
  if (value instanceof Set || Array.isArray(value)) return Array.from(value);
  return [];
}

const LEGACY_KEYS = Object.freeze({
  selectedFormationId: "hgfm.selectedFormation.v1",
  selectedTacticId: "hgfm.selectedTactic.v1",
  lineup: "hgfm.lineup.v1",
  // v2: v1 bar den gamle, feilaktige brikkefordelingen (se POSITIONS_KEY i
  // app.js). Migrering fra v1 ville dratt feilen inn i modus-konvolutten.
  slotPositions: "hgfm.slotPositions.v2",
  weeklyTrainingFocus: "hgfm.weeklyTrainingFocus.v1",
  // Ukas individuelle oppfølging. Isolert per modus som resten: slitasje og
  // rolletrening fra klubbsesongen følger ikke med inn i et scenario.
  individualTraining: "hgfm.individualTraining.v1",
  weeklyTrainingProgram: "hgfm.weeklyTrainingProgram.v1",
  trainingWeek: "hgfm.trainingWeek.v1",
  clubWeekState: "hgfm.clubWeekState.v1",
  clubWeekFeedback: "hgfm.clubWeekFeedback.v1",
  clubWeekEventLog: "hgfm.clubWeekEventLog.v1",
  matchday: "hgfm.matchday.v1",
  playerSeasonStats: "hgfm.playerSeasonStats.v1",
  playerCondition: "hgfm.playerCondition.v1",
  seasonArchive: "hgfm.seasonArchive.v1",
  miniSeason: "historygo-football-manager.mini-season.v1",
  firstTimePlaythrough: "hgfm.firstTimePlaythrough.v1"
});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function cloneSessionValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export function normalizeMode(value, fallback = "league") {
  return MODES.includes(value) ? value : fallback;
}

export function captureModeSession(state) {
  const snapshot = {};
  SESSION_STATE_FIELDS.forEach((field) => {
    if (state[field] === undefined) return;
    snapshot[field] = SET_STATE_FIELDS.includes(field)
      ? toIdArray(state[field])
      : cloneSessionValue(state[field]);
  });
  return snapshot;
}

export function applyModeSession(state, session) {
  if (!isObject(session)) return state;
  SESSION_STATE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(session, field)) {
      state[field] = SET_STATE_FIELDS.includes(field)
        ? new Set(toIdArray(session[field]))
        : cloneSessionValue(session[field]);
    } else {
      delete state[field];
    }
  });
  return state;
}

export function createSecondarySession(league, mode) {
  const session = cloneSessionValue(isObject(league) ? league : {});
  session.matchday = { lastMatch: null, session: null };
  // En scenario- eller landslagsøkt arver ikke klubbens scoringsliste.
  session.playerSeasonStats = { rows: [], matchIds: [] };
  // Slitasjen fra klubbsesongen følger ikke med inn i et scenario eller til
  // landslaget: det er en annen tropp og en annen kalender.
  session.playerCondition = [];
  session.playerConditionMatchIds = [];
  // Merittlista tilhører klubbkarrieren. Et scenario eller landslag arver den
  // ikke — og bygger heller ikke sin egen.
  session.seasonArchive = [];
  session.seasonReview = null;
  session.miniSeason = null;
  session.leagueSeason = null;
  const feedbackByMode = {
    scenario: "Velg scenario.",
    national: "Velg nasjon og ta ut landslagstroppen.",
    training: "Fotballvitenskap er klar."
  };
  session.clubWeekState = { week: 1, phase: mode === "scenario" ? "analysis" : "training" };
  session.clubWeekFeedback = feedbackByMode[mode] || feedbackByMode.training;
  // Landslagsmodus har sin egen nasjon, tropp og mesterskap, isolert fra
  // klubblaget. Merittlisten starter tom.
  if (mode === "national") {
    session.nationalTeam = { nationality: null, squadPlayerIds: [] };
    session.tournament = null;
    session.tournamentHistory = [];
    session.federationVerdict = null;
    session.federationTrust = 50;
  }
  session.clubWeekEventLog = [];
  session.weeklyTrainingFocus = null;
  session.weeklyTrainingProgram = null;
  const firstStepByMode = { scenario: "scenario_select", national: "nation_select", training: "training" };
  session.firstTimePlaythrough = { started: false, completed: false, currentStep: firstStepByMode[mode] || "training" };
  return session;
}

export function normalizeModeEnvelope(value) {
  const source = isObject(value) ? value : {};
  const sessions = isObject(source.sessions) ? source.sessions : {};
  return {
    version: MODE_SESSION_VERSION,
    activeMode: normalizeMode(source.activeMode),
    sessions: {
      league: isObject(sessions.league) ? cloneSessionValue(sessions.league) : {},
      scenario: isObject(sessions.scenario) ? cloneSessionValue(sessions.scenario) : null,
      training: isObject(sessions.training) ? cloneSessionValue(sessions.training) : null,
      national: isObject(sessions.national) ? cloneSessionValue(sessions.national) : null
    }
  };
}

function readJson(storage, key) {
  try {
    const raw = storage?.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch (_) {
    return undefined;
  }
}

export function migrateModeSessions(storage) {
  const existing = readJson(storage, MODE_SESSION_KEY);
  if (isObject(existing) && existing.version === MODE_SESSION_VERSION) {
    return normalizeModeEnvelope(existing);
  }

  const oldStart = readJson(storage, "hgfm.gameStartState.v1");
  const league = {};
  Object.entries(LEGACY_KEYS).forEach(([field, key]) => {
    const value = readJson(storage, key);
    if (value !== undefined) league[field] = value;
  });
  const envelope = normalizeModeEnvelope({
    activeMode: normalizeMode(oldStart?.selectedMode),
    sessions: { league }
  });
  // Idempotent, non-destructive migration: legacy data remains intact. A
  // failed write cannot turn valid league data into an empty save.
  try { storage?.setItem(MODE_SESSION_KEY, JSON.stringify(envelope)); } catch (_) { /* memory-only fallback */ }
  return envelope;
}

export function persistModeEnvelope(storage, envelope) {
  const normalized = normalizeModeEnvelope(envelope);
  storage?.setItem(MODE_SESSION_KEY, JSON.stringify(normalized));
  return normalized;
}

export function switchModeSession(envelope, state, nextMode, { reset = false } = {}) {
  const current = normalizeMode(envelope?.activeMode);
  const next = normalizeMode(nextMode);
  const updated = normalizeModeEnvelope(envelope);
  updated.sessions[current] = captureModeSession(state);
  if (next !== "league" && (reset || !updated.sessions[next])) {
    updated.sessions[next] = createSecondarySession(updated.sessions.league, next);
  }
  updated.activeMode = next;
  applyModeSession(state, updated.sessions[next]);
  return updated;
}

export function resetSecondarySession(envelope, state, mode) {
  const target = normalizeMode(mode);
  if (target === "league") return normalizeModeEnvelope(envelope);
  const updated = normalizeModeEnvelope(envelope);
  updated.sessions[target] = createSecondarySession(updated.sessions.league, target);
  if (updated.activeMode === target) applyModeSession(state, updated.sessions[target]);
  return updated;
}
