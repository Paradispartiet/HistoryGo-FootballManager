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
  | "inbox"
  | "training"
  | "match_prep"
  | "matchday"
  | "review";

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
  "inbox",
  "training",
  "match_prep",
  "matchday",
  "review",
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
  inbox: "Innboks",
  training: "Trening",
  match_prep: "Kampplan",
  matchday: "Kampdag",
  review: "Oppsummering",
};

// Kort, handlingsrettet norsk veiledning per fase: "gjør dette nå". Ren tekst,
// ingen logikk — orchestratoren bruker dette til å lede manageren gjennom uka.
const CLUB_WEEK_PHASE_GUIDANCE: Record<ClubWeekPhase, string> = {
  analysis:
    "Les laget og motstanderen. Sjekk lagfit, svake punkter og forslag før uka settes i gang.",
  inbox:
    "Rydd innboksen. Hvert svar påvirker stemningen utenfor banen og legger føringer for uka.",
  training:
    "Velg ett treningsfokus. Det former kroppene og hodene, og kan dempe motstanderens styrker på kampdag.",
  match_prep:
    "Legg kampplanen. Bekreft formasjon, roller og taktikk mot det analysen og treningen peker på.",
  matchday: "Spill kampen. Ta grepene underveis — treningen og konteksten følger med inn.",
  review:
    "Oppsummer uka. Se konsekvensene av kampen, les nye innbokstråder og ta med lærdommen inn i neste uke.",
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

export function getClubWeekPhaseGuidance(phase: ClubWeekPhase): string {
  return CLUB_WEEK_PHASE_GUIDANCE[isClubWeekPhase(phase) ? phase : "analysis"];
}

// Hele faserekken med etikett + veiledning, i rekkefølge. Lar UI tegne en
// fase-stripe der gjeldende fase markeres uten å duplisere etikett-tabellen.
export function listClubWeekPhases(): { phase: ClubWeekPhase; label: string; guidance: string }[] {
  return CLUB_WEEK_PHASE_ORDER.map((phase) => ({
    phase,
    label: CLUB_WEEK_PHASE_LABELS[phase],
    guidance: CLUB_WEEK_PHASE_GUIDANCE[phase],
  }));
}

export function createClubWeekSummary(state: ClubWeekState): string {
  const current = normalizeClubWeekState(state);
  return `Uke ${current.week} · ${getClubWeekPhaseLabel(current.phase)}`;
}
