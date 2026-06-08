import { FOOTBALL_POSITIONS } from "./football-fit-engine.js";
import { calculateTeamFit } from "./football-team-fit-engine.js";
import {
  createLegacyManagerAppStateFromBrowserState,
  getDashboardViewModelFromLegacyManagerState,
} from "./app-manager-engine-bridge.js";

const DATA_PATHS = {
  players: "data/football_players.json",
  roles: "data/football_roles.json",
  tactics: "data/football_tactics.json",
  formations: "data/football_formations.json",
  knowledgePrinciples: "data/football_knowledge_principles.json"
};

const EMPTY_VALUE = "__empty__";
const POSITIONS_KEY = "hgfm.slotPositions.v1";

// Standard y-bånd per lagdel (0 % = topp/angrep, 100 % = bunn/keeper).
const LINE_Y = { keeper: 90, defense: 72, midfield: 50, attack: 24 };

const state = {
  players: [],
  roles: [],
  tactics: [],
  formations: [],
  knowledgePrinciples: [],
  selectedFormationId: null,
  selectedTacticId: null,
  selectedSlotId: null,
  lineup: {},
  // slotId -> { x, y } i prosent innenfor banen, for gjeldende formasjon.
  slotPositions: {}
};

const elements = {
  formationSelect: document.querySelector("#formationSelect"),
  tacticSelect: document.querySelector("#tacticSelect"),
  teamStatus: document.querySelector("#teamStatus"),
  teamScore: document.querySelector("#teamScore"),
  roleFitAverage: document.querySelector("#roleFitAverage"),
  tacticFitAverage: document.querySelector("#tacticFitAverage"),
  balanceScore: document.querySelector("#balanceScore"),
  restDefenseScore: document.querySelector("#restDefenseScore"),
  formationTitle: document.querySelector("#formationTitle"),
  completeCount: document.querySelector("#completeCount"),
  lineupSlots: document.querySelector("#lineupSlots"),
  selectedSlotTitle: document.querySelector("#selectedSlotTitle"),
  slotPlayerSelect: document.querySelector("#slotPlayerSelect"),
  slotRoleSelect: document.querySelector("#slotRoleSelect"),
  selectedMatchScore: document.querySelector("#selectedMatchScore"),
  selectedFitStatus: document.querySelector("#selectedFitStatus"),
  selectedFitExplanation: document.querySelector("#selectedFitExplanation"),
  reportSummary: document.querySelector("#reportSummary"),
  strengthsList: document.querySelector("#strengthsList"),
  issuesList: document.querySelector("#issuesList"),
  widthScore: document.querySelector("#widthScore"),
  depthScore: document.querySelector("#depthScore"),
  buildUpScore: document.querySelector("#buildUpScore"),
  pressScore: document.querySelector("#pressScore"),
  managerSummary: document.querySelector("#managerSummary"),
  managerTopActions: document.querySelector("#managerTopActions"),
  managerTrainingPlan: document.querySelector("#managerTrainingPlan"),
  managerRoleChanges: document.querySelector("#managerRoleChanges"),
  managerWeakPoints: document.querySelector("#managerWeakPoints"),
  managerKnowledgeRecommendations: document.querySelector("#managerKnowledgeRecommendations")
};

let managerEngineRenderId = 0;

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Kunne ikke laste ${path}`);
  }

  return response.json();
}

function setOptions(select, items, getValue, getLabel, emptyLabel = null, shouldDisable = null) {
  select.innerHTML = "";

  if (emptyLabel) {
    const emptyOption = document.createElement("option");
    emptyOption.value = EMPTY_VALUE;
    emptyOption.textContent = emptyLabel;
    select.append(emptyOption);
  }

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    option.disabled = shouldDisable ? shouldDisable(item) : false;
    select.append(option);
  });
}

function validateFootballData({ players, roles, tactics, formations }) {
  const warnings = [];
  const roleIds = new Set(roles.map((role) => role.id));
  const validPositions = new Set(FOOTBALL_POSITIONS);

  players.forEach((player) => {
    if (!player.id || !player.name) {
      warnings.push("En spiller mangler id eller name.");
    }

    if (typeof player.overall !== "number" || player.overall < 85 || player.overall > 100) {
      warnings.push(`${player.name || player.id} har overall utenfor 85–100.`);
    }

    if (!Array.isArray(player.naturalPositions) || player.naturalPositions.length === 0) {
      warnings.push(`${player.name || player.id} mangler naturalPositions.`);
    }

    player.naturalPositions?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${player.name || player.id} har ukjent naturalPosition: ${position}.`);
      }
    });

    player.usablePositions?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${player.name || player.id} har ukjent usablePosition: ${position}.`);
      }
    });

    player.poorFits?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${player.name || player.id} har ukjent poorFit: ${position}.`);
      }
    });

    if (!Array.isArray(player.preferredRoles) || player.preferredRoles.length === 0) {
      warnings.push(`${player.name || player.id} mangler preferredRoles.`);
    }

    player.preferredRoles?.forEach((roleId) => {
      if (!roleIds.has(roleId)) {
        warnings.push(`${player.name || player.id} peker på ukjent rolle: ${roleId}.`);
      }
    });
  });

  roles.forEach((role) => {
    if (!role.id || !role.name) {
      warnings.push("En rolle mangler id eller name.");
    }

    if (!Array.isArray(role.validPositions) || role.validPositions.length === 0) {
      warnings.push(`${role.name || role.id} mangler validPositions.`);
    }

    role.validPositions?.forEach((position) => {
      if (!validPositions.has(position)) {
        warnings.push(`${role.name || role.id} har ukjent validPosition: ${position}.`);
      }
    });
  });

  tactics.forEach((tactic) => {
    if (!tactic.id || !tactic.name) {
      warnings.push("En taktikk mangler id eller name.");
    }

    if (!Array.isArray(tactic.tags) || tactic.tags.length === 0) {
      warnings.push(`${tactic.name || tactic.id} mangler tags.`);
    }
  });

  formations.forEach((formation) => {
    if (!formation.id || !formation.name) {
      warnings.push("En formasjon mangler id eller name.");
    }

    if (!Array.isArray(formation.slots) || formation.slots.length !== 11) {
      warnings.push(`${formation.name || formation.id} må ha nøyaktig 11 slots.`);
    }

    formation.slots?.forEach((slot) => {
      if (!slot.slotId || !slot.label || !slot.position) {
        warnings.push(`${formation.name || formation.id} har en ufullstendig slot.`);
      }

      if (!validPositions.has(slot.position)) {
        warnings.push(`${formation.name || formation.id} har ukjent slot-posisjon: ${slot.position}.`);
      }
    });
  });

  return warnings;
}

function getFormation() {
  return state.formations.find((formation) => formation.id === state.selectedFormationId) || state.formations[0];
}

function getTactic() {
  return state.tactics.find((tactic) => tactic.id === state.selectedTacticId) || state.tactics[0];
}

function getSelectedSlot() {
  const formation = getFormation();
  return formation?.slots.find((slot) => slot.slotId === state.selectedSlotId) || formation?.slots[0] || null;
}

function getTeamFit() {
  const formation = getFormation();
  const tactic = getTactic();

  if (!formation || !tactic) {
    return null;
  }

  return calculateTeamFit({
    lineup: state.lineup,
    formation,
    tactic,
    players: state.players,
    roles: state.roles
  });
}

function getUsedPlayerIds(exceptSlotId = null) {
  return new Set(
    Object.entries(state.lineup)
      .filter(([slotId]) => slotId !== exceptSlotId)
      .map(([, slotState]) => slotState.playerId)
      .filter(Boolean)
  );
}

function getDefaultRoleForPlayer(player, slot) {
  if (!player || !slot) {
    return null;
  }

  const preferredRole = player.preferredRoles
    .map((roleId) => state.roles.find((role) => role.id === roleId))
    .find((role) => role?.validPositions.includes(slot.position));

  if (preferredRole) {
    return preferredRole.id;
  }

  const validRole = state.roles.find((role) => role.validPositions.includes(slot.position));
  return validRole?.id || state.roles[0]?.id || null;
}

function findBestAvailablePlayerForSlot(slot, usedPlayerIds) {
  const tiers = [
    (candidate) => candidate.naturalPositions.includes(slot.position),
    (candidate) => candidate.usablePositions.includes(slot.position),
    (candidate) => !candidate.poorFits.includes(slot.position)
  ];

  for (const matches of tiers) {
    const player = state.players.find((candidate) => !usedPlayerIds.has(candidate.id) && matches(candidate));

    if (player) {
      return player;
    }
  }

  return null;
}

function seedLineupForFormation() {
  const formation = getFormation();

  state.lineup = {};
  state.selectedSlotId = formation?.slots[0]?.slotId || null;

  if (!formation) {
    return;
  }

  const usedPlayerIds = new Set();

  formation.slots.forEach((slot) => {
    const player = findBestAvailablePlayerForSlot(slot, usedPlayerIds);

    if (!player) {
      state.lineup[slot.slotId] = {
        playerId: null,
        roleId: null
      };
      return;
    }

    usedPlayerIds.add(player.id);
    state.lineup[slot.slotId] = {
      playerId: player.id,
      roleId: getDefaultRoleForPlayer(player, slot)
    };
  });
}

function loadStoredPositions() {
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveStoredPositions(all) {
  try {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(all));
  } catch (error) {
    // Lagring kan feile i privat modus e.l. Da kjører vi bare uten persistens.
  }
}

// Logiske standardposisjoner: grupper slots per lagdel og spre dem jevnt i bredden.
function computeDefaultPositions(formation) {
  const positions = {};
  const byLine = {};

  formation.slots.forEach((slot) => {
    (byLine[slot.line] ||= []).push(slot);
  });

  Object.entries(byLine).forEach(([line, slots]) => {
    const y = LINE_Y[line] ?? 50;
    const count = slots.length;

    slots.forEach((slot, index) => {
      const x = count === 1 ? 50 : 14 + (72 * index) / (count - 1);
      positions[slot.slotId] = { x, y };
    });
  });

  return positions;
}

// Sørg for at gjeldende formasjon har posisjoner (lagret eller standard) for alle slots.
function ensurePositionsForFormation() {
  const formation = getFormation();

  if (!formation) {
    state.slotPositions = {};
    return;
  }

  const all = loadStoredPositions();
  const defaults = computeDefaultPositions(formation);
  const stored = all[formation.id] || {};
  const merged = {};

  formation.slots.forEach((slot) => {
    merged[slot.slotId] = stored[slot.slotId] || defaults[slot.slotId];
  });

  all[formation.id] = merged;
  saveStoredPositions(all);
  state.slotPositions = merged;
}

function persistCurrentPositions() {
  const formation = getFormation();

  if (!formation) {
    return;
  }

  const all = loadStoredPositions();
  all[formation.id] = state.slotPositions;
  saveStoredPositions(all);
}

function renderList(list, items) {
  list.innerHTML = "";

  if (items.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Ingen tydelige punkter ennå.";
    list.append(item);
    return;
  }

  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  });
}

// Trygg liste-render: hopper over hvis elementet mangler, og viser emptyText når listen er tom.
function renderTextList(list, items, getText, emptyText) {
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const item = document.createElement("li");
    item.textContent = emptyText || "Ingen tydelige punkter ennå.";
    list.append(item);
    return;
  }

  items.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = getText(entry);
    list.append(item);
  });
}

function getTeamStatus(teamFit) {
  if (!teamFit || teamFit.completeCount < teamFit.totalSlots) {
    return "Ufullstendig";
  }

  if (teamFit.duplicatePlayers?.length > 0) {
    return "Ugyldig ellever";
  }

  if (teamFit.teamScore >= 84) {
    return "Sterk helhet";
  }

  if (teamFit.teamScore >= 72) {
    return "God helhet";
  }

  if (teamFit.teamScore >= 60) {
    return "Ujevn helhet";
  }

  return "Taktisk krasj";
}

function renderControls() {
  setOptions(
    elements.formationSelect,
    state.formations,
    (formation) => formation.id,
    (formation) => formation.name
  );

  setOptions(
    elements.tacticSelect,
    state.tactics,
    (tactic) => tactic.id,
    (tactic) => tactic.name
  );

  elements.formationSelect.value = state.selectedFormationId;
  elements.tacticSelect.value = state.selectedTacticId;
}

function renderLineup(teamFit) {
  const formation = getFormation();

  elements.lineupSlots.innerHTML = "";
  elements.formationTitle.textContent = formation?.name || "Formasjon";

  if (!formation || !teamFit) {
    return;
  }

  formation.slots.forEach((slot) => {
    const assignment = teamFit.assignments.find((item) => item.slot.slotId === slot.slotId);
    const position = state.slotPositions[slot.slotId] || { x: 50, y: 50 };

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "player-chip";
    chip.dataset.slotId = slot.slotId;
    chip.dataset.line = slot.line;
    chip.style.left = `${position.x}%`;
    chip.style.top = `${position.y}%`;

    if (slot.slotId === state.selectedSlotId) {
      chip.classList.add("is-selected");
    }

    if (assignment?.fit?.status === "feilbrukt") {
      chip.classList.add("is-misused");
    }

    if (teamFit.duplicatePlayers.some((player) => player.id === assignment?.player?.id)) {
      chip.classList.add("is-duplicate");
    }

    const playerName = assignment?.player?.name || "Tom plass";
    const roleName = assignment?.role?.name || "Ingen rolle";
    const score = assignment?.fit?.matchScore ?? "–";

    chip.innerHTML = `
      <span class="chip-pos">${slot.position}</span>
      <span class="chip-name">${playerName}</span>
      <span class="chip-role">${roleName}</span>
      <span class="chip-score">${score}</span>
    `;

    chip.setAttribute("aria-label", `${slot.label}: ${playerName}. Dra for å flytte, klikk for å velge.`);

    attachChipDrag(chip, slot.slotId);

    elements.lineupSlots.append(chip);
  });
}

// Drag-and-drop med pointer events: fungerer med mus og touch (også iPad).
// Liten bevegelse tolkes som klikk (velg plass), større bevegelse som flytting.
function attachChipDrag(chip, slotId) {
  const DRAG_THRESHOLD = 5;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let pitchRect = null;
  let pendingPosition = null;

  function clamp(value) {
    return Math.min(96, Math.max(4, value));
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    pitchRect = elements.lineupSlots.getBoundingClientRect();
    pendingPosition = null;

    chip.classList.add("is-dragging");

    try {
      chip.setPointerCapture(event.pointerId);
    } catch (error) {
      // Ignorer hvis pointer capture ikke støttes.
    }
  }

  function onPointerMove(event) {
    if (!dragging || !pitchRect) {
      return;
    }

    if (!moved && (Math.abs(event.clientX - startX) > DRAG_THRESHOLD || Math.abs(event.clientY - startY) > DRAG_THRESHOLD)) {
      moved = true;
    }

    if (!moved) {
      return;
    }

    event.preventDefault();

    const x = clamp(((event.clientX - pitchRect.left) / pitchRect.width) * 100);
    const y = clamp(((event.clientY - pitchRect.top) / pitchRect.height) * 100);

    pendingPosition = { x, y };
    chip.style.left = `${x}%`;
    chip.style.top = `${y}%`;
  }

  function onPointerUp(event) {
    if (!dragging) {
      return;
    }

    dragging = false;
    chip.classList.remove("is-dragging");

    try {
      chip.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignorer.
    }

    if (moved && pendingPosition) {
      state.slotPositions[slotId] = pendingPosition;
      persistCurrentPositions();
      // Behold valgt plass i sync slik at editoren peker på spilleren som ble flyttet.
      state.selectedSlotId = slotId;
      renderApp();
      return;
    }

    // Ren klikk: velg plassen.
    state.selectedSlotId = slotId;
    renderApp();
  }

  chip.addEventListener("pointerdown", onPointerDown);
  chip.addEventListener("pointermove", onPointerMove);
  chip.addEventListener("pointerup", onPointerUp);
  chip.addEventListener("pointercancel", onPointerUp);
}

function renderSlotEditor(teamFit) {
  const slot = getSelectedSlot();

  if (!slot) {
    return;
  }

  const slotState = state.lineup[slot.slotId] || { playerId: null, roleId: null };
  const assignment = teamFit?.assignments.find((item) => item.slot.slotId === slot.slotId);
  const usedPlayerIds = getUsedPlayerIds(slot.slotId);

  elements.selectedSlotTitle.textContent = `${slot.label} · ${slot.position}`;

  setOptions(
    elements.slotPlayerSelect,
    state.players,
    (player) => player.id,
    (player) => `${player.name} · ${player.overall}`,
    "Tom plass",
    (player) => usedPlayerIds.has(player.id)
  );

  const roleOptions = state.roles.filter((role) => role.validPositions.includes(slot.position));

  setOptions(
    elements.slotRoleSelect,
    roleOptions,
    (role) => role.id,
    (role) => role.name,
    "Ingen rolle"
  );

  elements.slotPlayerSelect.value = slotState.playerId || EMPTY_VALUE;
  elements.slotRoleSelect.value = slotState.roleId || EMPTY_VALUE;

  if (assignment?.fit) {
    elements.selectedMatchScore.textContent = assignment.fit.matchScore;
    elements.selectedFitStatus.textContent = assignment.fit.status;
    elements.selectedFitExplanation.textContent = assignment.fit.explanation;
  } else {
    elements.selectedMatchScore.textContent = "–";
    elements.selectedFitStatus.textContent = "Ufullstendig plass";
    elements.selectedFitExplanation.textContent = "Velg både spiller og rolle for å se om denne plassen fungerer.";
  }
}

function renderTeamSummary(teamFit) {
  if (!teamFit) {
    return;
  }

  elements.teamStatus.textContent = getTeamStatus(teamFit);
  elements.teamScore.textContent = teamFit.teamScore;
  elements.completeCount.textContent = `${teamFit.completeCount}/${teamFit.totalSlots}`;
  elements.roleFitAverage.textContent = teamFit.metrics.roleFitAverage;
  elements.tacticFitAverage.textContent = teamFit.metrics.tacticFitAverage;
  elements.balanceScore.textContent = teamFit.metrics.balanceScore;
  elements.restDefenseScore.textContent = teamFit.metrics.restDefenseScore;
  elements.widthScore.textContent = teamFit.metrics.widthScore;
  elements.depthScore.textContent = teamFit.metrics.depthScore;
  elements.buildUpScore.textContent = teamFit.metrics.buildUpScore;
  elements.pressScore.textContent = teamFit.metrics.pressScore;
}

function renderReport(teamFit) {
  if (!teamFit) {
    return;
  }

  elements.reportSummary.textContent = teamFit.report.summary;
  renderList(elements.strengthsList, teamFit.report.strengths);
  renderList(elements.issuesList, teamFit.report.issues);
}

function renderManagerDashboardViewModel(viewModel) {
  if (!viewModel) {
    return;
  }

  elements.teamStatus.textContent = viewModel.score.label;
  elements.teamScore.textContent = viewModel.score.setupScoreText;
  elements.balanceScore.textContent = viewModel.score.teamBalanceText;

  const widthMetric = viewModel.metrics.find((metric) => metric.label === "Bredde");
  const pressMetric = viewModel.metrics.find((metric) => metric.label === "Press");
  const defenceMetric = viewModel.metrics.find((metric) => metric.label === "Forsvar");
  const midfieldMetric = viewModel.metrics.find((metric) => metric.label === "Midtbane");
  const attackMetric = viewModel.metrics.find((metric) => metric.label === "Angrep");

  elements.widthScore.textContent = widthMetric?.valueText ?? elements.widthScore.textContent;
  elements.pressScore.textContent = pressMetric?.valueText ?? elements.pressScore.textContent;
  elements.restDefenseScore.textContent = defenceMetric?.valueText ?? elements.restDefenseScore.textContent;
  elements.buildUpScore.textContent = midfieldMetric?.valueText ?? elements.buildUpScore.textContent;
  elements.depthScore.textContent = attackMetric?.valueText ?? elements.depthScore.textContent;

  elements.reportSummary.textContent = viewModel.summary.summary;

  renderList(elements.strengthsList, viewModel.keyStrengths);

  const issueTexts = [
    ...viewModel.keyProblems,
    ...viewModel.topActions.slice(0, 3).map((action) => action.label),
  ];

  renderList(elements.issuesList, issueTexts);

  if (elements.managerSummary) {
    elements.managerSummary.textContent = viewModel.summary.summary;
  }

  renderTextList(
    elements.managerTopActions,
    viewModel.topActions,
    (action) => `${action.priorityText}: ${action.label} — ${action.rationale}`,
    viewModel.emptyStates.topActions,
  );

  renderTextList(
    elements.managerTrainingPlan,
    viewModel.trainingPlan,
    (item) => `${item.areaText}: ${item.suggestedSession}`,
    viewModel.emptyStates.trainingPlan,
  );

  renderTextList(
    elements.managerRoleChanges,
    viewModel.roleChanges,
    (item) => `${item.statusText}: ${item.label}`,
    viewModel.emptyStates.roleChanges,
  );

  renderTextList(
    elements.managerWeakPoints,
    viewModel.weakPoints,
    (item) => `${item.categoryText}: ${item.label} — ${item.suggestedAction}`,
    viewModel.emptyStates.weakPoints,
  );

  renderTextList(
    elements.managerKnowledgeRecommendations,
    viewModel.knowledgeRecommendations,
    (item) =>
      `${item.priorityText}: ${item.title} (${item.categoryText}) — ${item.reason} Trenergrep: ${item.coachAdvice} Økt: ${item.trainingSession}`,
    viewModel.emptyStates.knowledgeRecommendations,
  );
}

async function renderManagerEngineBridge() {
  const renderId = ++managerEngineRenderId;

  const legacyManagerState = await createLegacyManagerAppStateFromBrowserState({
    teamId: "browser_legacy_team",
    teamName: "Browser Legacy Team",
    players: state.players,
    roles: state.roles,
    tactics: state.tactics,
    formations: state.formations,
    selectedTacticId: state.selectedTacticId,
    selectedFormationId: state.selectedFormationId,
    lineup: state.lineup,
    knowledgePrinciples: state.knowledgePrinciples,
  });

  if (renderId !== managerEngineRenderId) {
    return;
  }

  const viewModel = getDashboardViewModelFromLegacyManagerState(legacyManagerState);

  renderManagerDashboardViewModel(viewModel);
}

function renderApp() {
  const teamFit = getTeamFit();

  renderControls();
  renderTeamSummary(teamFit);
  renderLineup(teamFit);
  renderSlotEditor(teamFit);
  renderReport(teamFit);

  renderManagerEngineBridge();
}

function bindEvents() {
  elements.formationSelect.addEventListener("change", (event) => {
    state.selectedFormationId = event.target.value;
    seedLineupForFormation();
    ensurePositionsForFormation();
    renderApp();
  });

  elements.tacticSelect.addEventListener("change", (event) => {
    state.selectedTacticId = event.target.value;
    renderApp();
  });

  elements.slotPlayerSelect.addEventListener("change", (event) => {
    const slot = getSelectedSlot();

    if (!slot) {
      return;
    }

    const nextPlayerId = event.target.value === EMPTY_VALUE ? null : event.target.value;
    const player = state.players.find((item) => item.id === nextPlayerId) || null;
    const currentRoleId = state.lineup[slot.slotId]?.roleId || null;
    const currentRole = state.roles.find((role) => role.id === currentRoleId);

    state.lineup[slot.slotId] = {
      playerId: nextPlayerId,
      roleId: currentRole?.validPositions.includes(slot.position) ? currentRoleId : getDefaultRoleForPlayer(player, slot)
    };

    renderApp();
  });

  elements.slotRoleSelect.addEventListener("change", (event) => {
    const slot = getSelectedSlot();

    if (!slot) {
      return;
    }

    state.lineup[slot.slotId] = {
      playerId: state.lineup[slot.slotId]?.playerId || null,
      roleId: event.target.value === EMPTY_VALUE ? null : event.target.value
    };

    renderApp();
  });
}

function initTabs() {
  const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
  const sections = Array.from(document.querySelectorAll("[data-tab-section]"));

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tabTarget;

      tabButtons.forEach((other) => {
        const isActive = other === button;
        other.classList.toggle("is-active", isActive);
        other.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      sections.forEach((section) => {
        section.hidden = section.dataset.tabSection !== target;
      });
    });
  });
}

async function init() {
  initTabs();

  try {
    const [playersData, rolesData, tacticsData, formationsData, knowledgeData] = await Promise.all([
      loadJson(DATA_PATHS.players),
      loadJson(DATA_PATHS.roles),
      loadJson(DATA_PATHS.tactics),
      loadJson(DATA_PATHS.formations),
      // Kunnskapsdata er valgfri: hvis filen mangler, fortsetter demoen uten den.
      loadJson(DATA_PATHS.knowledgePrinciples).catch(() => null)
    ]);

    state.players = playersData.players;
    state.roles = rolesData.roles;
    state.tactics = tacticsData.tactics;
    state.formations = formationsData.formations;

    if (Array.isArray(knowledgeData?.principles)) {
      state.knowledgePrinciples = knowledgeData.principles;
    } else {
      state.knowledgePrinciples = [];
      console.warn("Fotballkunnskap-data mangler eller har feil format. Fortsetter uten kunnskapsanbefalinger.");
    }

    state.selectedFormationId = state.formations[0]?.id || null;
    state.selectedTacticId = state.tactics[0]?.id || null;

    const dataWarnings = validateFootballData(state);

    if (dataWarnings.length > 0) {
      console.warn("Football Manager-data har kvalitetsadvarsler:", dataWarnings);
    }

    seedLineupForFormation();
    ensurePositionsForFormation();
    bindEvents();
    renderApp();
  } catch (error) {
    elements.teamStatus.textContent = "Feil";
    elements.reportSummary.textContent = `${error.message}. Kjør prosjektet via GitHub Pages eller en enkel lokal server.`;
  }
}

init();
