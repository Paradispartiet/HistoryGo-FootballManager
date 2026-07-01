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
// Synkron cache av den ferdig lastede motoren. Settes når dynamisk import er
// løst, slik at render-stien kan kjøre synkront etter preloadManagerEngine().
let loadedManagerEngine = null;

async function loadManagerEngine() {
  if (!managerEnginePromise) {
    managerEnginePromise = import("../dist/index.js")
      .then((engine) => {
        loadedManagerEngine = engine;
        return engine;
      })
      .catch((error) => {
        console.warn(
          "Ny manager-engine er ikke tilgjengelig ennå. Gammel demo fortsetter.",
          error,
        );

        return null;
      });
  }

  return managerEnginePromise;
}

/**
 * Pre-resolver TypeScript-motoren én gang ved oppstart. Etter at denne har
 * løst seg, kan render-stien lese motoren synkront via getLoadedManagerEngine()
 * og slipper async-overskriving/blink. Returnerer motoren eller null.
 */
export async function preloadManagerEngine() {
  return loadManagerEngine();
}

/**
 * Synkron tilgang til den ferdig lastede motoren. Returnerer null hvis motoren
 * ikke er lastet ennå (eller dist/ ikke er bygget).
 */
export function getLoadedManagerEngine() {
  return loadedManagerEngine;
}

function findSelectedItem(items, selectedId) {
  return items.find((item) => item.id === selectedId) || items[0] || null;
}

// Felles kjerne for både async og synkron app-state-bygging. Tar en allerede
// løst motor inn; returnerer null hvis motoren mangler eller taktikk/formasjon
// ikke kan velges.
function buildLegacyManagerAppState(engine, {
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

export async function createLegacyManagerAppStateFromBrowserState(args) {
  const engine = await loadManagerEngine();

  return buildLegacyManagerAppState(engine, args);
}

/**
 * Synkron variant: bygger app-state fra den allerede preloadede motoren.
 * Returnerer null hvis motoren ikke er lastet ennå – kalleren bør da falle
 * tilbake til den async-varianten.
 */
export function createLegacyManagerAppStateFromBrowserStateSync(args) {
  return buildLegacyManagerAppState(getLoadedManagerEngine(), args);
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
  "inbox",
  "training",
  "match_prep",
  "matchday",
  "review",
];

const CLUB_WEEK_FALLBACK_PHASE_LABELS = {
  analysis: "Analyse",
  inbox: "Innboks",
  training: "Trening",
  match_prep: "Kampplan",
  matchday: "Kampdag",
  review: "Oppsummering",
};

const CLUB_WEEK_FALLBACK_PHASE_GUIDANCE = {
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

function getFallbackClubWeekPhaseGuidance(phase) {
  return (
    CLUB_WEEK_FALLBACK_PHASE_GUIDANCE[phase] ||
    CLUB_WEEK_FALLBACK_PHASE_GUIDANCE.analysis
  );
}

function listFallbackClubWeekPhases() {
  return CLUB_WEEK_FALLBACK_PHASE_ORDER.map((phase) => ({
    phase,
    label: CLUB_WEEK_FALLBACK_PHASE_LABELS[phase],
    guidance: CLUB_WEEK_FALLBACK_PHASE_GUIDANCE[phase],
  }));
}

function createFallbackClubWeekSummary(state) {
  const current = createFallbackClubWeekState(state);
  return `Uke ${current.week} · ${getFallbackClubWeekPhaseLabel(current.phase)}`;
}

// Felles kjerne for Club Week-wrapperne under: kall motorens metode hvis den
// er lastet og finnes, ellers den lokale fallback-implementasjonen. Holder
// engine/fallback-grenen på ett sted i stedet for gjentatt i hver wrapper.
async function callEngineOrFallback(methodName, fallbackFn, ...args) {
  const engine = await loadManagerEngine();

  if (engine?.[methodName]) {
    return engine[methodName](...args);
  }

  return fallbackFn(...args);
}

export function createInitialClubWeekStateFromBrowser(overrides = {}) {
  return callEngineOrFallback("createInitialClubWeekState", createFallbackClubWeekState, overrides);
}

export function advanceClubWeekPhaseFromBrowser(state) {
  return callEngineOrFallback("advanceClubWeekPhase", advanceFallbackClubWeekPhase, state);
}

function applyFallbackClubWeekEffects(state, effects = {}) {
  const next = createFallbackClubWeekState(state);

  const clamp = (value) => {
    if (!Number.isFinite(value)) {
      return 50;
    }

    return Math.max(0, Math.min(100, Math.round(value)));
  };

  return {
    ...next,
    boardTrust: clamp(next.boardTrust + (effects.boardTrust ?? 0)),
    playerMorale: clamp(next.playerMorale + (effects.playerMorale ?? 0)),
    tacticalClarity: clamp(next.tacticalClarity + (effects.tacticalClarity ?? 0)),
    trainingCulture: clamp(next.trainingCulture + (effects.trainingCulture ?? 0)),
    mediaPressure: clamp(next.mediaPressure + (effects.mediaPressure ?? 0)),
  };
}

export function applyClubWeekEffectsFromBrowser(state, effects = {}) {
  return callEngineOrFallback("applyClubWeekEffects", applyFallbackClubWeekEffects, state, effects);
}

export function createClubWeekSummaryFromBrowser(state) {
  return callEngineOrFallback("createClubWeekSummary", createFallbackClubWeekSummary, state);
}

export function getClubWeekPhaseLabelFromBrowser(phase) {
  return callEngineOrFallback("getClubWeekPhaseLabel", getFallbackClubWeekPhaseLabel, phase);
}

export function getClubWeekPhaseGuidanceFromBrowser(phase) {
  return callEngineOrFallback("getClubWeekPhaseGuidance", getFallbackClubWeekPhaseGuidance, phase);
}

export function listClubWeekPhasesFromBrowser() {
  return callEngineOrFallback("listClubWeekPhases", listFallbackClubWeekPhases);
}
