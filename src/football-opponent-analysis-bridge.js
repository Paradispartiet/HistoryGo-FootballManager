// Tynn modulgrense mellom app-state og det modulære klubbrommet. Appen eier
// state/persistens; UI-et ber bare om et snapshot eller sender en eksplisitt
// lagrings-/navigasjonshandling.

let bridge = null;

export function registerOpponentAnalysisBridge(value) {
  bridge = value && typeof value === "object" ? value : null;
}

export function getOpponentAnalysisContext() {
  return typeof bridge?.getContext === "function" ? bridge.getContext() : null;
}

export function saveOpponentAnalysisPlan(plan) {
  return typeof bridge?.savePlan === "function" ? bridge.savePlan(plan) : { saved: false, reason: "Analysebroen er ikke klar." };
}

export function openOpponentAnalysisTarget(target) {
  return typeof bridge?.openTarget === "function" ? bridge.openTarget(target) : false;
}
