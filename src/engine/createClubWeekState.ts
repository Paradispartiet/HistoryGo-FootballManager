// src/engine/createClubWeekState.ts

/**
 * Club Week Engine v1.
 *
 * Ren TypeScript-engine for ukerytme og klubbtilstand.
 *
 * Denne filen skal ikke vite noe om DOM, localStorage, CSS, app.js,
 * kampmotor, meldingssystem eller Football Knowledge UI.
 *
 * Ansvar:
 * - holde styr på uke og fase
 * - holde en enkel klubbtilstand
 * - flytte spillet til neste fase
 * - bruke små effekter på klubbverdier
 * - lage enkel norsk visningstekst
 */

export type ClubWeekPhase =
  | "analysis"
  | "training"
  | "club_work"
  | "match_preparation"
  | "match_day";

export type ClubWeekMetric =
  | "boardTrust"
  | "playerMorale"
  | "tacticalClarity"
  | "trainingCulture"
  | "mediaPressure";

export type ClubWeekState = {
  week: number;
  phase: ClubWeekPhase;
  boardTrust: number;
  playerMorale: number;
  tacticalClarity: number;
  trainingCulture: number;
  mediaPressure: number;
};

export type ClubWeekEffects = Partial<Record<ClubWeekMetric, number>>;

export const CLUB_WEEK_PHASE_ORDER: readonly ClubWeekPhase[] = [
  "analysis",
  "training",
  "club_work",
  "match_preparation",
  "match_day",
];

export const CLUB_WEEK_METRICS: readonly ClubWeekMetric[] = [
  "boardTrust",
  "playerMorale",
  "tacticalClarity",
  "trainingCulture",
  "mediaPressure",
];

const CLUB_WEEK_PHASE_LABELS: Record<ClubWeekPhase, string> = {
  analysis: "Analyse",
  training: "Trening",
  club_work: "Klubbdrift",
  match_preparation: "Kampforberedelse",
  match_day: "Kampdag",
};

const DEFAULT_CLUB_WEEK_STATE: ClubWeekState = {
  week: 1,
  phase: "analysis",
  boardTrust: 50,
  playerMorale: 50,
  tacticalClarity: 50,
  trainingCulture: 50,
  mediaPressure: 50,
};

export function isClubWeekPhase(value: unknown): value is ClubWeekPhase {
  return typeof value === "string" && CLUB_WEEK_PHASE_ORDER.includes(value as ClubWeekPhase);
}

function normalizeWeek(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 ? value : 1;
}

export function clampClubMetric(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeClubWeekState(state: ClubWeekState): ClubWeekState {
  return {
    week: normalizeWeek(state.week),
    phase: isClubWeekPhase(state.phase) ? state.phase : "analysis",
    boardTrust: clampClubMetric(state.boardTrust),
    playerMorale: clampClubMetric(state.playerMorale),
    tacticalClarity: clampClubMetric(state.tacticalClarity),
    trainingCulture: clampClubMetric(state.trainingCulture),
    mediaPressure: clampClubMetric(state.mediaPressure),
  };
}

export function createInitialClubWeekState(overrides: Partial<ClubWeekState> = {}): ClubWeekState {
  return normalizeClubWeekState({
    ...DEFAULT_CLUB_WEEK_STATE,
    ...overrides,
  });
}

export function applyClubWeekEffects(
  state: ClubWeekState,
  effects: ClubWeekEffects = {},
): ClubWeekState {
  const next = normalizeClubWeekState(state);

  for (const metric of CLUB_WEEK_METRICS) {
    const effect = effects[metric] ?? 0;
    next[metric] = clampClubMetric(next[metric] + effect);
  }

  return next;
}

export function advanceClubWeekPhase(state: ClubWeekState): ClubWeekState {
  const current = normalizeClubWeekState(state);
  const currentIndex = CLUB_WEEK_PHASE_ORDER.indexOf(current.phase);
  const nextPhase = CLUB_WEEK_PHASE_ORDER[currentIndex + 1];

  if (!nextPhase) {
    return {
      ...current,
      week: current.week + 1,
      phase: "analysis",
    };
  }

  return {
    ...current,
    phase: nextPhase,
  };
}

export function getClubWeekPhaseLabel(phase: ClubWeekPhase): string {
  return CLUB_WEEK_PHASE_LABELS[phase];
}

export function createClubWeekSummary(state: ClubWeekState): string {
  const current = normalizeClubWeekState(state);
  return `Uke ${current.week} · ${getClubWeekPhaseLabel(current.phase)}`;
}
