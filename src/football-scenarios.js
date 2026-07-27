// Scenarioer v2 — flere enn ett
//
// Scenarioer var en hel spillmodus med ETT innhold: Ajax 1971–73, hardkodet som
// et kort i `index.html` og en id i `app.js`. Modusen lovet «historiske og
// taktiske utfordringer» i flertall og leverte én.
//
// Nå kommer de fra `data/football_scenarios.json`, som alt annet innhold i
// spillet. Motstanderne er de historiske arketypene som allerede finnes —
// scenarioet velger bare hvilke fem du møter, og i hvilken rekkefølge.
//
// Motoren er ren: ingen DOM, ingen lagring, ingen fetch. `app.js` laster JSON-en
// og sender den inn.

import { getHistoricalOpponentProfile } from "./football-historical-opponent-profiles.js";

export const SCENARIOS_SCHEMA = "historygo-football-manager.scenarios.v1";

function str(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// Ett scenario, normalisert. Feltene som forklarer scenarioet for manageren er
// obligatoriske: et scenario som ikke sier hva du skal lære, er bare en kamp.
export function normalizeScenario(raw) {
  const id = str(raw?.id);
  if (!id) return null;

  const opponentIds = asArray(raw?.opponentIds).map(str).filter(Boolean);
  if (opponentIds.length === 0) return null;

  const firstOpponentId = str(raw?.firstOpponentId) || opponentIds[0];

  return {
    id,
    name: str(raw?.name) || id,
    era: str(raw?.era),
    subtitle: str(raw?.subtitle),
    lede: str(raw?.lede),
    challenge: str(raw?.challenge),
    learningFocus: str(raw?.learningFocus),
    firstOpponentId,
    opponentIds,
    // Fast rekkefølge når fortellingen krever det (kronologien i «Taktikkens
    // historie»). Uten den sorterer mini-sesongen etter styrke som før.
    opponentOrder: asArray(raw?.opponentOrder).map(str).filter(Boolean)
  };
}

export function normalizeScenarios(data) {
  return asArray(data?.scenarios).map(normalizeScenario).filter(Boolean);
}

export function getScenario(scenarios, scenarioId) {
  return asArray(scenarios).find((entry) => entry.id === str(scenarioId)) || null;
}

// Motstanderne scenarioet faktisk møter, som fulle arketypeprofiler.
// Ukjente id-er hoppes over i stedet for å krasje — `audit:scenarios` fanger
// dem i data, der de hører hjemme.
export function resolveScenarioOpponents(scenario) {
  return asArray(scenario?.opponentIds)
    .map((id) => getHistoricalOpponentProfile(id))
    .filter(Boolean);
}

// Konteksten mini-sesongmotoren trenger for å bygge terminlista. Scenarioet
// begrenser bare hvem du møter — resten av motoren er den samme som ellers.
export function createScenarioMiniSeasonContext(scenario, base = {}) {
  const opponents = resolveScenarioOpponents(scenario);
  if (opponents.length === 0) return null;

  const order = asArray(scenario?.opponentOrder).filter((id) =>
    opponents.some((opponent) => opponent.id === id)
  );

  return {
    ...base,
    seasonId: `scenario-${scenario.id}`,
    opponents,
    firstOpponentId: scenario.firstOpponentId,
    opponentOrder: order.length > 0 ? order : null,
    teamName: base.teamName || "HG-laget"
  };
}

// Kort, lesbar oppsummering til scenariokortet.
export function describeScenario(scenario) {
  const opponents = resolveScenarioOpponents(scenario);
  return {
    id: scenario.id,
    name: scenario.name,
    era: scenario.era,
    subtitle: scenario.subtitle,
    lede: scenario.lede,
    challenge: scenario.challenge,
    learningFocus: scenario.learningFocus,
    matchCount: 5,
    opponentNames: opponents.map((opponent) => opponent.displayName || opponent.name || opponent.id),
    // Er rekkefølgen fortellingen selv (kronologi), sier vi det.
    isOrdered: asArray(scenario.opponentOrder).length > 0
  };
}
