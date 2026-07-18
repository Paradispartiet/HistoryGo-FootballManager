// Mode Isolation v1
//
// The envelope is the single owner of the active mode and of the mutable
// manager-session snapshots.  The football engines remain stateless and are
// reused by every mode; only their input/output state is namespaced here.
// Legacy league keys are read once and copied into `sessions.league`.  They are
// deliberately not deleted until the envelope has been written successfully.

export const MODE_SESSION_KEY = "hgfm.modeSessions.v1";
export const MODE_SESSION_VERSION = "mode-sessions.v1";
export const MODES = Object.freeze(["league", "scenario", "training"]);

export const SESSION_STATE_FIELDS = Object.freeze([
  "selectedFormationId", "selectedTacticId", "lineup", "slotPositions",
  "weeklyTrainingFocus", "weeklyTrainingProgram", "trainingWeek",
  "activeKnowledgeFocusId", "completedKnowledgeFocusIds", "clubWeekState",
  "clubWeekFeedback", "clubWeekEventLog", "matchday", "miniSeason",
  "readInboxMessageIds", "deliveredInboxMessageIds", "selectedInboxChoices",
  "inboxAcknowledgedWeek", "firstTimePlaythrough", "teamMerits", "leagueSeason"
]);

const LEGACY_KEYS = Object.freeze({
  selectedFormationId: "hgfm.selectedFormation.v1",
  selectedTacticId: "hgfm.selectedTactic.v1",
  lineup: "hgfm.lineup.v1",
  slotPositions: "hgfm.slotPositions.v1",
  weeklyTrainingFocus: "hgfm.weeklyTrainingFocus.v1",
  weeklyTrainingProgram: "hgfm.weeklyTrainingProgram.v1",
  trainingWeek: "hgfm.trainingWeek.v1",
  clubWeekState: "hgfm.clubWeekState.v1",
  clubWeekFeedback: "hgfm.clubWeekFeedback.v1",
  clubWeekEventLog: "hgfm.clubWeekEventLog.v1",
  matchday: "hgfm.matchday.v1",
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
    if (state[field] !== undefined) snapshot[field] = cloneSessionValue(state[field]);
  });
  return snapshot;
}

export function applyModeSession(state, session) {
  if (!isObject(session)) return state;
  SESSION_STATE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(session, field)) {
      state[field] = cloneSessionValue(session[field]);
    } else {
      delete state[field];
    }
  });
  return state;
}

export function createSecondarySession(league, mode) {
  const session = cloneSessionValue(isObject(league) ? league : {});
  session.matchday = { lastMatch: null, session: null };
  session.miniSeason = null;
  session.leagueSeason = null;
  session.clubWeekState = { week: 1, phase: mode === "scenario" ? "analysis" : "training" };
  session.clubWeekFeedback = mode === "scenario" ? "Velg scenario." : "Treningsrommet er klart.";
  session.clubWeekEventLog = [];
  session.weeklyTrainingFocus = null;
  session.weeklyTrainingProgram = null;
  session.firstTimePlaythrough = mode === "scenario"
    ? { started: false, completed: false, currentStep: "scenario_select" }
    : { started: false, completed: false, currentStep: "training" };
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
      training: isObject(sessions.training) ? cloneSessionValue(sessions.training) : null
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
