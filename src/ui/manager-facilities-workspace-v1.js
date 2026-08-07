import {
  FACILITY_DEFINITIONS,
  FACILITY_MAX_LEVEL,
  canUpgradeFacility,
  calculateFacilityEffects,
  normalizeFacilityState,
  summarizeFacilityState
} from "../football-facilities.js";

function text(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value;
  return el;
}

export function createManagerFacilitiesModel({ facilityState = null, week = 1 } = {}) {
  const state = normalizeFacilityState(facilityState);
  const summary = summarizeFacilityState(state);
  const effects = calculateFacilityEffects(state);
  const normalizedWeek = Math.max(1, Math.trunc(Number(week)) || 1);
  const usedThisWeek = state.lastUpgradeWeek === normalizedWeek;
  const chosen = FACILITY_DEFINITIONS.find((item) => item.id === state.lastUpgradeFacilityId) || null;
  return {
    week: normalizedWeek,
    state,
    summary,
    effects,
    weeklyStatus: usedThisWeek
      ? `Ukens anleggsvalg er brukt${chosen ? ` på ${chosen.title}` : ""}.`
      : "Ett anleggsvalg er tilgjengelig denne manageruka.",
    facilities: FACILITY_DEFINITIONS.map((definition) => {
      const currentLevel = state.levels[definition.id];
      const gate = canUpgradeFacility(state, definition.id, { week: normalizedWeek });
      return {
        ...definition,
        currentLevel,
        levelLabel: `Nivå ${currentLevel} av ${FACILITY_MAX_LEVEL}`,
        effect: definition.levelEffects[currentLevel - 1],
        nextEffect: currentLevel < FACILITY_MAX_LEVEL ? definition.levelEffects[currentLevel] : "Maksnivå er nådd.",
        canUpgrade: gate.allowed,
        blockedReason: gate.reason,
        actionLabel: currentLevel < FACILITY_MAX_LEVEL ? `Oppgrader til nivå ${currentLevel + 1}` : "Maksnivå"
      };
    })
  };
}

export function renderManagerFacilitiesWorkspace(container, model, { onUpgrade } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.week = String(model.week);
  container.dataset.lastUpgradeWeek = model.state.lastUpgradeWeek ? String(model.state.lastUpgradeWeek) : "";

  const summary = document.querySelector("#facilityOverallValue");
  if (summary) {
    summary.textContent = model.summary.label;
    summary.setAttribute("aria-label", `${model.summary.label}. ${model.summary.detail}`);
  }

  const weekly = text("p", "facility-week-choice", model.weeklyStatus);
  weekly.setAttribute("role", "status");
  container.append(weekly);

  const grid = document.createElement("div");
  grid.className = "manager-facility-grid";

  model.facilities.forEach((facility) => {
    const card = document.createElement("article");
    card.className = "manager-facility-card";
    card.dataset.facilityId = facility.id;
    card.dataset.level = String(facility.currentLevel);

    const head = document.createElement("div");
    head.className = "manager-facility-head";
    head.append(
      text("h3", "", facility.title),
      text("strong", "manager-facility-level", facility.levelLabel)
    );

    const current = text("p", "manager-facility-effect", facility.effect);
    const next = text("p", "manager-facility-next", `Neste: ${facility.nextEffect}`);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "facility-upgrade-action";
    button.dataset.facilityId = facility.id;
    button.textContent = facility.actionLabel;
    button.disabled = !facility.canUpgrade;
    button.setAttribute("aria-describedby", `facility-${facility.id}-reason`);
    if (facility.canUpgrade && typeof onUpgrade === "function") {
      button.addEventListener("click", () => onUpgrade(facility.id));
    }
    const reason = text("small", "manager-facility-reason", facility.canUpgrade ? "Én eksplisitt managerbeslutning — ingen kostnad eller auto-oppgradering." : facility.blockedReason);
    reason.id = `facility-${facility.id}-reason`;

    card.append(
      head,
      text("p", "manager-facility-description", facility.description),
      current,
      next,
      button,
      reason
    );
    grid.append(card);
  });

  container.append(grid);
}
