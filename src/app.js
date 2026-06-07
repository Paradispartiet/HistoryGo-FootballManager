import { FOOTBALL_POSITIONS, calculatePlayerMatchFit } from "./football-fit-engine.js";

const DATA_PATHS = {
  players: "data/football_players.json",
  roles: "data/football_roles.json",
  tactics: "data/football_tactics.json"
};

const state = {
  players: [],
  roles: [],
  tactics: [],
  selectedPlayerId: null,
  selectedPosition: "LW",
  selectedRoleId: null,
  selectedTacticId: null
};

const elements = {
  playerSelect: document.querySelector("#playerSelect"),
  positionSelect: document.querySelector("#positionSelect"),
  roleSelect: document.querySelector("#roleSelect"),
  tacticSelect: document.querySelector("#tacticSelect"),
  fitStatus: document.querySelector("#fitStatus"),
  matchScore: document.querySelector("#matchScore"),
  positionFit: document.querySelector("#positionFit"),
  roleFit: document.querySelector("#roleFit"),
  tacticFit: document.querySelector("#tacticFit"),
  misusePenalty: document.querySelector("#misusePenalty"),
  fitExplanation: document.querySelector("#fitExplanation"),
  warningBox: document.querySelector("#warningBox"),
  warningsList: document.querySelector("#warningsList"),
  suggestionBox: document.querySelector("#suggestionBox"),
  suggestedRoles: document.querySelector("#suggestedRoles")
};

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Kunne ikke laste ${path}`);
  }

  return response.json();
}

function setOptions(select, items, getValue, getLabel) {
  select.innerHTML = "";

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    select.append(option);
  });
}

function getSelectedData() {
  const player = state.players.find((item) => item.id === state.selectedPlayerId);
  const role = state.roles.find((item) => item.id === state.selectedRoleId);
  const tactic = state.tactics.find((item) => item.id === state.selectedTacticId);

  return { player, role, tactic };
}

function renderWarnings(warnings) {
  elements.warningsList.innerHTML = "";
  elements.warningBox.hidden = warnings.length === 0;

  warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.textContent = warning;
    elements.warningsList.append(item);
  });
}

function renderSuggestions(suggestions) {
  elements.suggestedRoles.innerHTML = "";
  elements.suggestionBox.hidden = suggestions.length === 0;

  suggestions.forEach((suggestion) => {
    const item = document.createElement("li");
    item.textContent = suggestion;
    elements.suggestedRoles.append(item);
  });
}

function renderFit() {
  const { player, role, tactic } = getSelectedData();

  if (!player || !role || !tactic) {
    return;
  }

  const result = calculatePlayerMatchFit(
    player,
    { position: state.selectedPosition },
    role,
    tactic,
    state.roles
  );

  elements.fitStatus.textContent = result.status;
  elements.matchScore.textContent = result.matchScore;
  elements.positionFit.textContent = result.positionFit;
  elements.roleFit.textContent = result.roleFit;
  elements.tacticFit.textContent = result.tacticFit;
  elements.misusePenalty.textContent = result.misusePenalty;
  elements.fitExplanation.textContent = result.explanation;

  renderWarnings(result.warnings);
  renderSuggestions(result.suggestedRoles);
}

function bindEvents() {
  elements.playerSelect.addEventListener("change", (event) => {
    state.selectedPlayerId = event.target.value;
    renderFit();
  });

  elements.positionSelect.addEventListener("change", (event) => {
    state.selectedPosition = event.target.value;
    renderFit();
  });

  elements.roleSelect.addEventListener("change", (event) => {
    state.selectedRoleId = event.target.value;
    renderFit();
  });

  elements.tacticSelect.addEventListener("change", (event) => {
    state.selectedTacticId = event.target.value;
    renderFit();
  });
}

function setInitialSelections() {
  state.selectedPlayerId = state.players[0]?.id || null;
  state.selectedPosition = state.players[0]?.naturalPositions?.[0] || "LW";
  state.selectedRoleId = state.players[0]?.preferredRoles?.[0] || state.roles[0]?.id || null;
  state.selectedTacticId = state.tactics[0]?.id || null;

  elements.playerSelect.value = state.selectedPlayerId;
  elements.positionSelect.value = state.selectedPosition;
  elements.roleSelect.value = state.selectedRoleId;
  elements.tacticSelect.value = state.selectedTacticId;
}

function renderControls() {
  setOptions(
    elements.playerSelect,
    state.players,
    (player) => player.id,
    (player) => `${player.name} · ${player.overall}`
  );

  setOptions(
    elements.positionSelect,
    FOOTBALL_POSITIONS,
    (position) => position,
    (position) => position
  );

  setOptions(
    elements.roleSelect,
    state.roles,
    (role) => role.id,
    (role) => role.name
  );

  setOptions(
    elements.tacticSelect,
    state.tactics,
    (tactic) => tactic.id,
    (tactic) => tactic.name
  );
}

async function init() {
  try {
    const [playersData, rolesData, tacticsData] = await Promise.all([
      loadJson(DATA_PATHS.players),
      loadJson(DATA_PATHS.roles),
      loadJson(DATA_PATHS.tactics)
    ]);

    state.players = playersData.players;
    state.roles = rolesData.roles;
    state.tactics = tacticsData.tactics;

    renderControls();
    setInitialSelections();
    bindEvents();
    renderFit();
  } catch (error) {
    elements.fitStatus.textContent = "Feil";
    elements.fitExplanation.textContent = `${error.message}. Kjør prosjektet via GitHub Pages eller en enkel lokal server.`;
  }
}

init();
