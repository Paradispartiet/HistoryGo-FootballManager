// ============================================================================
// Default formation selector — Manager grunnflyt v1
//
// Pure selection logic. No DOM, localStorage or app-state access.
// ============================================================================

export const DEFAULT_LEAGUE_FORMATION_ID = "modern_4231";
export const SECONDARY_LEAGUE_FORMATION_ID = "modern_433";
export const DEFAULT_LEAGUE_MATCH_PLAN_ID = "central_possession_4231";

function idsFrom(items) {
  return new Set(
    (Array.isArray(items) ? items : [])
      .map((item) => (typeof item === "string" ? item : item?.id))
      .filter((id) => typeof id === "string" && id)
  );
}

function firstId(items) {
  const first = (Array.isArray(items) ? items : []).find((item) =>
    typeof item === "string" ? Boolean(item) : Boolean(item?.id)
  );
  return typeof first === "string" ? first : first?.id || null;
}

export function selectDefaultFormation({
  mode = "league",
  savedFormationId = null,
  modeFormationId = null,
  scenarioFormationId = null,
  availableFormations = []
} = {}) {
  const availableIds = idsFrom(availableFormations);
  const isAvailable = (id) => typeof id === "string" && availableIds.has(id);

  // Backwards compatibility wins. A valid save must never be silently reset.
  if (isAvailable(savedFormationId)) return savedFormationId;

  // Scenario / mode-owned systems remain authoritative when explicitly set.
  const explicitModeFormationId = scenarioFormationId || modeFormationId;
  if (isAvailable(explicitModeFormationId)) return explicitModeFormationId;

  if (mode === "league") {
    if (isAvailable(DEFAULT_LEAGUE_FORMATION_ID)) return DEFAULT_LEAGUE_FORMATION_ID;
    if (isAvailable(SECONDARY_LEAGUE_FORMATION_ID)) return SECONDARY_LEAGUE_FORMATION_ID;
  }

  return firstId(availableFormations);
}

export function selectDefaultMatchPlan({
  savedMatchPlanId = null,
  availableMatchPlans = []
} = {}) {
  const availableIds = idsFrom(availableMatchPlans);
  if (typeof savedMatchPlanId === "string" && availableIds.has(savedMatchPlanId)) {
    return savedMatchPlanId;
  }
  if (availableIds.has(DEFAULT_LEAGUE_MATCH_PLAN_ID)) {
    return DEFAULT_LEAGUE_MATCH_PLAN_ID;
  }
  return firstId(availableMatchPlans);
}
