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
  });
}

export function getDashboardViewModelFromLegacyManagerState(legacyManagerState) {
  return legacyManagerState?.appState?.dashboardViewModel ?? null;
}
