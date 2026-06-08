// src/app-manager-engine-bridge.js

/**
 * Browser bridge mellom eksisterende statisk JS-demo og ny TypeScript engine.
 *
 * Denne filen gjør ingen DOM-endringer.
 * Den prøver bare å laste bygget TypeScript-engine fra dist/.
 *
 * Hvis dist/ ikke finnes ennå, returnerer den null.
 * Da fortsetter gammel demo å fungere uendret.
 */

let managerEnginePromise = null;

async function loadManagerEngine() {
  if (!managerEnginePromise) {
    managerEnginePromise = import("../dist/index.js").catch((error) => {
      console.warn(
        "Ny manager-engine er ikke tilgjengelig ennå. Gammel demo fortsetter.",
        error,
      );

      return null;
    });
  }

  return managerEnginePromise;
}

function findSelectedItem(items, selectedId) {
  return items.find((item) => item.id === selectedId) || items[0] || null;
}

export async function createLegacyManagerAppStateFromBrowserState({
  teamId = "browser_legacy_team",
  teamName = "Browser Legacy Team",
  players,
  roles,
  tactics,
  formations,
  selectedTacticId,
  selectedFormationId,
  lineup,
  knowledgePrinciples = [],
}) {
  const engine = await loadManagerEngine();

  if (!engine?.createLegacyManagerAppState) {
    return null;
  }

  const tactic = findSelectedItem(tactics, selectedTacticId);
  const formation = findSelectedItem(formations, selectedFormationId);

  if (!tactic || !formation) {
    return null;
  }

  return engine.createLegacyManagerAppState({
    teamId,
    teamName,
    players,
    roles,
    tactic,
    formation,
    lineup,
    knowledgePrinciples,
  });
}

export function getDashboardViewModelFromLegacyManagerState(legacyManagerState) {
  return legacyManagerState?.appState?.dashboardViewModel ?? null;
}

// ---------------------------------------------------------------------------
// Club Week Engine v1 – browser-bridge
//
// Tynne async wrappere rundt Club Week Engine. Bruker bygget engine fra dist/
// hvis tilgjengelig, ellers en enkel innebygd fallback slik at uke/fase
// fungerer selv uten bygg. Ingen DOM eller localStorage her.
// ---------------------------------------------------------------------------

const CLUB_WEEK_FALLBACK_PHASE_ORDER = [
  "analysis",
  "training",
  "club_work",
  "match_preparation",
  "match_day",
];

const CLUB_WEEK_FALLBACK_PHASE_LABELS = {
  analysis: "Analyse",
  training: "Trening",
  club_work: "Klubbdrift",
  match_preparation: "Kampforberedelse",
  match_day: "Kampdag",
};

function createFallbackClubWeekState(overrides = {}) {
  const base = {
    week: 1,
    phase: "analysis",
    boardTrust: 50,
    playerMorale: 50,
    tacticalClarity: 50,
    trainingCulture: 50,
    mediaPressure: 50,
  };

  const merged = { ...base, ...overrides };

  const week =
    Number.isInteger(merged.week) && merged.week >= 1 ? merged.week : 1;
  const phase = CLUB_WEEK_FALLBACK_PHASE_ORDER.includes(merged.phase)
    ? merged.phase
    : "analysis";

  const clamp = (value) => {
    if (!Number.isFinite(value)) {
      return 50;
    }

    return Math.max(0, Math.min(100, Math.round(value)));
  };

  return {
    week,
    phase,
    boardTrust: clamp(merged.boardTrust),
    playerMorale: clamp(merged.playerMorale),
    tacticalClarity: clamp(merged.tacticalClarity),
    trainingCulture: clamp(merged.trainingCulture),
    mediaPressure: clamp(merged.mediaPressure),
  };
}

function advanceFallbackClubWeekPhase(state) {
  const current = createFallbackClubWeekState(state);
  const currentIndex = CLUB_WEEK_FALLBACK_PHASE_ORDER.indexOf(current.phase);
  const nextPhase = CLUB_WEEK_FALLBACK_PHASE_ORDER[currentIndex + 1];

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

function getFallbackClubWeekPhaseLabel(phase) {
  return CLUB_WEEK_FALLBACK_PHASE_LABELS[phase] || "Analyse";
}

function createFallbackClubWeekSummary(state) {
  const current = createFallbackClubWeekState(state);
  return `Uke ${current.week} · ${getFallbackClubWeekPhaseLabel(current.phase)}`;
}

export async function createInitialClubWeekStateFromBrowser(overrides = {}) {
  const engine = await loadManagerEngine();

  if (engine?.createInitialClubWeekState) {
    return engine.createInitialClubWeekState(overrides);
  }

  return createFallbackClubWeekState(overrides);
}

export async function advanceClubWeekPhaseFromBrowser(state) {
  const engine = await loadManagerEngine();

  if (engine?.advanceClubWeekPhase) {
    return engine.advanceClubWeekPhase(state);
  }

  return advanceFallbackClubWeekPhase(state);
}

export async function createClubWeekSummaryFromBrowser(state) {
  const engine = await loadManagerEngine();

  if (engine?.createClubWeekSummary) {
    return engine.createClubWeekSummary(state);
  }

  return createFallbackClubWeekSummary(state);
}

export async function getClubWeekPhaseLabelFromBrowser(phase) {
  const engine = await loadManagerEngine();

  if (engine?.getClubWeekPhaseLabel) {
    return engine.getClubWeekPhaseLabel(phase);
  }

  return getFallbackClubWeekPhaseLabel(phase);
}
