import {
  derivePlayerAttributeIndex,
  normalizeAttributeCatalogue
} from "../football-player-attributes.js";
import {
  describeCondition,
  freshnessFor,
  isInjured
} from "../football-player-condition.js";
import {
  describeRoleFamiliarity,
  getRoleFamiliarity
} from "../football-role-familiarity-engine.js";

const STYLE_ID = "managerPlayerWorkspaceV1Style";
const WORKSPACE_ID = "managerPlayerWorkspace";
const PROFILE_ID = "managerPlayerProfileDialog";
const STATUS_ID = "squadCompactStatus";

const DATA = Object.freeze({
  players: new URL("../../data/football_players.json", import.meta.url),
  unlocks: new URL("../../data/football_unlocks.json", import.meta.url),
  roles: new URL("../../data/football_roles.json", import.meta.url),
  attributes: new URL("../../data/football_attributes.json", import.meta.url),
  training: new URL("../../data/football_individual_training.json", import.meta.url)
});

const STORAGE = Object.freeze({
  merits: "hgfm.teamMerits.v1",
  stats: "hgfm.playerSeasonStats.v1",
  conditions: "hgfm.playerCondition.v1",
  individualTraining: "hgfm.individualTraining.v1",
  visitedPlaces: "visited_places",
  groundhopper: "hg_groundhopper_stats_v1"
});

const POSITION_ORDER = Object.freeze({
  GK: 0, CB: 10, LB: 11, RB: 12, WB: 13,
  DM: 20, CM: 21, AM: 22, LW: 30, RW: 31, ST: 40
});

const POSITION_POINTS = Object.freeze({
  GK: [50, 88], CB: [50, 72], LB: [20, 69], RB: [80, 69], WB: [14, 55],
  DM: [50, 57], CM: [50, 43], AM: [50, 29], LW: [20, 25], RW: [80, 25], ST: [50, 12]
});

const CATEGORY_LABELS = Object.freeze({
  teknisk: "Teknisk",
  mental: "Mental",
  taktisk: "Taktisk",
  fysisk: "Fysisk"
});

const STARTER_SQUAD_GROUPS = Object.freeze([
  { positions: ["GK"], count: 2 },
  { positions: ["CB", "LB", "RB", "WB"], count: 5 },
  { positions: ["DM", "CM", "AM"], count: 5 },
  { positions: ["ST", "LW", "RW"], count: 3 }
]);

let cataloguePromise = null;
let runtime = null;
let activePlayerId = null;
let currentProfileTab = "season";
let scheduled = false;

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function formatToken(value) {
  return text(value, "–")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}: ${response.status}`);
  return response.json();
}

function historyGoPlaceIds() {
  const ids = new Set();
  const visited = readStorage(STORAGE.visitedPlaces, null);
  if (visited && typeof visited === "object" && !Array.isArray(visited)) {
    Object.entries(visited).forEach(([id, value]) => {
      if (value) ids.add(id);
    });
  } else if (Array.isArray(visited)) {
    visited.filter(Boolean).forEach((id) => ids.add(String(id)));
  }

  const groundhopper = readStorage(STORAGE.groundhopper, null);
  const groundhopperIds = groundhopper?.visited_groundhopper_places
    || groundhopper?.visitedGroundhopperPlaces
    || groundhopper?.visitedPlaces;
  asArray(groundhopperIds).forEach((entry) => {
    const id = typeof entry === "string" ? entry : entry?.placeId || entry?.id;
    if (id) ids.add(String(id));
  });
  return ids;
}

function buildStarterSquad(players, candidateIds, limit = 15) {
  const candidates = asArray(players)
    .filter((player) => candidateIds.has(player.id))
    .sort((a, b) => {
      const level = (Number(a.classHeight) || 0) - (Number(b.classHeight) || 0);
      return level || String(a.id).localeCompare(String(b.id));
    });
  const chosen = [];
  const used = new Set();
  const playsIn = (player, positions) => [
    ...asArray(player.naturalPositions),
    ...asArray(player.usablePositions)
  ].some((position) => positions.includes(position));

  STARTER_SQUAD_GROUPS.forEach((group) => {
    let need = group.count;
    candidates.forEach((player) => {
      if (need <= 0 || used.has(player.id) || chosen.length >= limit || !playsIn(player, group.positions)) return;
      chosen.push(player.id);
      used.add(player.id);
      need -= 1;
    });
  });
  candidates.forEach((player) => {
    if (chosen.length < limit && !used.has(player.id)) {
      chosen.push(player.id);
      used.add(player.id);
    }
  });
  return chosen;
}

function resolveUnlockedPlayerIds(players, unlockData) {
  const merits = readStorage(STORAGE.merits, {});
  const placeIds = historyGoPlaceIds();
  asArray(merits?.unlockedPlaceIds).forEach((id) => placeIds.add(String(id)));

  const candidateIds = new Set();
  const unlocked = new Set(asArray(merits?.localStart?.playerIds).map(String));
  asArray(unlockData?.placeUnlocks).forEach((place) => {
    asArray(place?.unlocks).forEach((entry) => {
      if (entry?.type === "player_candidate" && entry?.targetId) {
        candidateIds.add(String(entry.targetId));
        if (placeIds.has(String(place.placeId))) unlocked.add(String(entry.targetId));
      }
    });
  });

  if (unlocked.size === 0) {
    buildStarterSquad(players, candidateIds).forEach((id) => unlocked.add(id));
  }
  return unlocked;
}

function conditionStatus(condition) {
  if (isInjured(condition)) return { id: "injured", label: "Skadet", tone: "negative" };
  const fresh = freshnessFor(condition);
  if (fresh < 45) return { id: "tired", label: "Sliten", tone: "negative" };
  if (fresh < 70) return { id: "loaded", label: "Belastet", tone: "attention" };
  return { id: "ready", label: "Klar", tone: "positive" };
}

function formStatus(condition) {
  const form = Number(condition?.form) || 0;
  if (form >= 0.8) return { label: "↑", text: "God form", rank: 2 };
  if (form <= -0.8) return { label: "↓", text: "Svak form", rank: 0 };
  return { label: "→", text: "Normal form", rank: 1 };
}

function tacticFit(player, tacticId) {
  if (!tacticId) return { id: "neutral", label: "–", rank: 1 };
  if (asArray(player?.likesTactics).includes(tacticId)) return { id: "good", label: "God", rank: 2 };
  if (asArray(player?.dislikesTactics).includes(tacticId)) return { id: "poor", label: "Svak", rank: 0 };
  return { id: "neutral", label: "Nøytral", rank: 1 };
}

function bestRole(player, rolesById, familiarityStore) {
  const preferred = asArray(player?.preferredRoles);
  if (!preferred.length) return { id: null, name: "–", familiarity: 0, familiarityLabel: "Ingen rolledata" };
  const ranked = preferred
    .map((roleId) => ({
      id: roleId,
      name: rolesById.get(roleId)?.name || formatToken(roleId),
      familiarity: getRoleFamiliarity(familiarityStore, player.id, roleId)
    }))
    .sort((a, b) => b.familiarity - a.familiarity);
  const role = ranked[0];
  return { ...role, familiarityLabel: describeRoleFamiliarity(role.familiarity).label };
}

export function createRosterViewModel({
  players = [],
  unlockedPlayerIds = new Set(),
  statsRows = [],
  conditions = [],
  roleFamiliarity = {},
  individualTraining = [],
  roles = [],
  tacticId = ""
} = {}) {
  const stats = new Map(asArray(statsRows).map((row) => [String(row.playerId), row]));
  const conditionMap = new Map(asArray(conditions).map((entry) => [String(entry.playerId), entry]));
  const trainingMap = new Map(asArray(individualTraining).map((entry) => [String(entry.playerId), entry]));
  const rolesById = new Map(asArray(roles).map((role) => [role.id, role]));
  const unlocked = unlockedPlayerIds instanceof Set ? unlockedPlayerIds : new Set(asArray(unlockedPlayerIds).map(String));

  return asArray(players)
    .filter((player) => unlocked.has(String(player.id)))
    .map((player) => {
      const stat = stats.get(String(player.id)) || {};
      const condition = conditionMap.get(String(player.id)) || { playerId: player.id, load: 0, form: 0, injury: null };
      const status = conditionStatus(condition);
      const form = formStatus(condition);
      const role = bestRole(player, rolesById, roleFamiliarity);
      const fit = tacticFit(player, tacticId);
      const training = trainingMap.get(String(player.id)) || null;
      return {
        id: player.id,
        player,
        name: player.name || player.id,
        nationality: player.nationality || "",
        naturalPositions: asArray(player.naturalPositions),
        usablePositions: asArray(player.usablePositions),
        role,
        status,
        form,
        fit,
        appearances: Number(stat.appearances) || 0,
        goals: Number(stat.goals) || 0,
        assists: Number(stat.assists) || 0,
        minutes: Number(stat.minutes) || 0,
        condition,
        training,
        positionRank: POSITION_ORDER[asArray(player.naturalPositions)[0]] ?? 99
      };
    });
}

export function filterRosterRows(rows, { query = "", position = "all", availability = "all", sort = "position" } = {}) {
  const needle = text(query).toLocaleLowerCase("nb");
  const filtered = asArray(rows).filter((row) => {
    const positions = [...asArray(row.naturalPositions), ...asArray(row.usablePositions)];
    if (needle && !`${row.name} ${positions.join(" ")} ${row.role?.name || ""}`.toLocaleLowerCase("nb").includes(needle)) return false;
    if (position !== "all" && !positions.includes(position)) return false;
    if (availability !== "all" && row.status?.id !== availability) return false;
    return true;
  });

  const compare = {
    name: (a, b) => a.name.localeCompare(b.name, "nb"),
    appearances: (a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name, "nb"),
    goals: (a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name, "nb"),
    assists: (a, b) => b.assists - a.assists || b.goals - a.goals || a.name.localeCompare(b.name, "nb"),
    status: (a, b) => (a.status?.id || "").localeCompare(b.status?.id || "") || a.positionRank - b.positionRank,
    position: (a, b) => a.positionRank - b.positionRank || a.name.localeCompare(b.name, "nb")
  }[sort] || ((a, b) => a.positionRank - b.positionRank);
  return filtered.sort(compare);
}

function selectedTacticId() {
  return document.querySelector("#tacticSelect")?.value || "";
}

async function loadRuntime() {
  if (cataloguePromise) return cataloguePromise;
  cataloguePromise = Promise.all([
    loadJson(DATA.players),
    loadJson(DATA.unlocks),
    loadJson(DATA.roles),
    loadJson(DATA.attributes),
    loadJson(DATA.training).catch(() => ({ tracks: [] }))
  ]).then(([playersData, unlocks, rolesData, attributesData, trainingData]) => {
    const players = asArray(playersData?.players);
    const roles = asArray(rolesData?.roles);
    const catalogue = normalizeAttributeCatalogue(attributesData);
    const attributeIndex = derivePlayerAttributeIndex(players, { catalogue, roles });
    const placesById = new Map(asArray(unlocks?.placeUnlocks).map((place) => [place.placeId, place.placeName || formatToken(place.placeId)]));
    const trainingById = new Map(asArray(trainingData?.tracks).map((track) => [track.id, track]));
    runtime = { players, unlocks, roles, catalogue, attributeIndex, placesById, trainingById };
    return runtime;
  });
  return cataloguePromise;
}

function liveRows() {
  if (!runtime) return [];
  const merits = readStorage(STORAGE.merits, {});
  const stats = readStorage(STORAGE.stats, { rows: [] });
  const conditions = readStorage(STORAGE.conditions, []);
  const individual = readStorage(STORAGE.individualTraining, { assignments: [] });
  const unlocked = resolveUnlockedPlayerIds(runtime.players, runtime.unlocks);
  return createRosterViewModel({
    players: runtime.players,
    unlockedPlayerIds: unlocked,
    statsRows: stats?.rows,
    conditions,
    roleFamiliarity: merits?.roleFamiliarity || {},
    individualTraining: individual?.assignments,
    roles: runtime.roles,
    tacticId: selectedTacticId()
  });
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-player-workspace-v1.css", import.meta.url).href;
  document.head.append(link);
}

function ensureCompactStatus() {
  const tactics = document.querySelector('[data-tab-section="tactics"]');
  const gate = document.getElementById("squadSetupGate");
  if (!tactics || !gate) return null;
  let rail = document.getElementById(STATUS_ID);
  if (!rail) {
    rail = node("section", "manager-squad-compact-status");
    rail.id = STATUS_ID;
    rail.setAttribute("aria-label", "Lagstatus");
    tactics.insertBefore(rail, gate);
  }
  gate.classList.add("is-replaced-by-compact-status");
  document.getElementById("squadTacticsCommandPanel")?.classList.add("is-replaced-by-compact-status");
  return rail;
}

function parseRatio(id, total) {
  const match = text(document.getElementById(id)?.textContent).match(/(\d+)\s*\/\s*(\d+)/);
  return { current: match ? Number(match[1]) : 0, total: match ? Number(match[2]) : total };
}

function renderCompactStatus(rows = []) {
  const rail = ensureCompactStatus();
  if (!rail) return;
  const starters = parseRatio("squadGateStarters", 11);
  const bench = parseRatio("squadGateBench", 4);
  const unavailable = rows.filter((row) => row.status.id === "injured" || row.status.id === "tired").length;
  const formation = document.querySelector("#formationSelect")?.selectedOptions?.[0]?.textContent || "Ingen formasjon";
  rail.replaceChildren();
  [
    `Tropp ${rows.length}`,
    `Ellever ${starters.current}/${starters.total}`,
    `Benk ${bench.current}/${bench.total}`,
    unavailable ? `${unavailable} utilgjengelig` : "Alle tilgjengelige",
    text(formation, "Ingen formasjon")
  ].forEach((label, index) => {
    const item = node("span", index === 3 && unavailable ? "has-warning" : "", label);
    rail.append(item);
  });
}

function ensureWorkspace() {
  const panel = document.getElementById("rosterReadinessPanel");
  if (!panel) return null;
  panel.classList.add("has-manager-player-workspace");
  let workspace = document.getElementById(WORKSPACE_ID);
  if (workspace) return workspace;

  workspace = node("div", "manager-player-workspace");
  workspace.id = WORKSPACE_ID;
  workspace.innerHTML = `
    <header class="manager-player-workspace-head">
      <div>
        <p class="eyebrow">Lag · Tropp</p>
        <h2>Spillerliste</h2>
        <p class="muted-text">Sammenlign troppen her. Åpne en spiller for detaljene; laguttak endres bare med en eksplisitt Velg-knapp på Oppstilling.</p>
      </div>
      <strong id="managerRosterCount" class="manager-roster-count">0 spillere</strong>
    </header>
    <form class="manager-roster-tools" id="managerRosterTools" role="search">
      <label><span>Søk spiller</span><input id="managerRosterSearch" type="search" autocomplete="off" placeholder="Navn eller rolle"></label>
      <label><span>Posisjon</span><select id="managerRosterPosition"><option value="all">Alle posisjoner</option></select></label>
      <label><span>Tilgjengelighet</span><select id="managerRosterAvailability"><option value="all">Alle</option><option value="ready">Klar</option><option value="loaded">Belastet</option><option value="tired">Sliten</option><option value="injured">Skadet</option></select></label>
      <label><span>Sorter</span><select id="managerRosterSort"><option value="position">Posisjon</option><option value="name">Navn</option><option value="appearances">Kamper</option><option value="goals">Mål</option><option value="assists">Målgivende</option><option value="status">Status</option></select></label>
    </form>
    <div class="manager-roster-table-wrap">
      <table class="manager-roster-table">
        <thead><tr><th>Spiller</th><th>Pos</th><th>Rolle</th><th>Status</th><th>Fit</th><th>Form</th><th>K</th><th>M</th><th>A</th><th>Trening</th></tr></thead>
        <tbody id="managerRosterBody"></tbody>
      </table>
      <div id="managerRosterEmpty" class="manager-roster-empty" hidden>Ingen spillere matcher filtrene.</div>
    </div>`;
  panel.append(workspace);

  const positions = Object.keys(POSITION_ORDER).sort((a, b) => POSITION_ORDER[a] - POSITION_ORDER[b]);
  const select = workspace.querySelector("#managerRosterPosition");
  positions.forEach((position) => {
    const option = node("option", "", position);
    option.value = position;
    select.append(option);
  });
  workspace.querySelector("#managerRosterTools")?.addEventListener("input", scheduleRender);
  workspace.querySelector("#managerRosterTools")?.addEventListener("change", scheduleRender);
  return workspace;
}

function rowButton(row) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "manager-roster-player-link";
  button.dataset.playerProfileId = row.id;
  button.innerHTML = `<strong>${row.name}</strong><small>${row.nationality || ""}</small>`;
  button.addEventListener("click", () => openPlayerProfile(row.id));
  return button;
}

function renderRoster(rows) {
  const workspace = ensureWorkspace();
  if (!workspace) return;
  const controls = {
    query: workspace.querySelector("#managerRosterSearch")?.value || "",
    position: workspace.querySelector("#managerRosterPosition")?.value || "all",
    availability: workspace.querySelector("#managerRosterAvailability")?.value || "all",
    sort: workspace.querySelector("#managerRosterSort")?.value || "position"
  };
  const visible = filterRosterRows(rows, controls);
  const body = workspace.querySelector("#managerRosterBody");
  const empty = workspace.querySelector("#managerRosterEmpty");
  const count = workspace.querySelector("#managerRosterCount");
  if (!body) return;
  body.replaceChildren();
  if (count) count.textContent = `${visible.length} av ${rows.length} spillere`;
  if (empty) empty.hidden = visible.length > 0;

  visible.forEach((row) => {
    const tr = document.createElement("tr");
    tr.dataset.playerId = row.id;
    const playerCell = document.createElement("td");
    playerCell.append(rowButton(row));
    const positionCell = node("td", "manager-roster-positions", row.naturalPositions.join("/") || "–");
    positionCell.title = row.usablePositions.length ? `Kan også brukes: ${row.usablePositions.join("/")}` : "";
    const roleCell = document.createElement("td");
    roleCell.innerHTML = `<span>${row.role.name}</span><small>${row.role.familiarity ? `${row.role.familiarity}% · ${row.role.familiarityLabel}` : row.role.familiarityLabel}</small>`;
    const statusCell = node("td", "", row.status.label);
    statusCell.dataset.tone = row.status.tone;
    statusCell.title = describeCondition(row.condition);
    const fitCell = node("td", "", row.fit.label);
    fitCell.dataset.fit = row.fit.id;
    const formCell = node("td", "manager-roster-form", row.form.label);
    formCell.title = row.form.text;
    const trainingLabel = row.training
      ? runtime.trainingById.get(row.training.trackId)?.name || formatToken(row.training.trackId || row.training.roleId)
      : "–";
    [playerCell, positionCell, roleCell, statusCell, fitCell, formCell,
      node("td", "manager-roster-number", row.appearances),
      node("td", "manager-roster-number", row.goals),
      node("td", "manager-roster-number", row.assists),
      node("td", "manager-roster-training", trainingLabel)
    ].forEach((cell) => tr.append(cell));
    tr.addEventListener("dblclick", () => openPlayerProfile(row.id));
    body.append(tr);
  });
}

function profileData(playerId) {
  const rows = liveRows();
  const row = rows.find((entry) => String(entry.id) === String(playerId));
  if (!row) return null;
  const attributes = runtime.attributeIndex?.profiles?.[playerId] || null;
  return { row, player: row.player, attributes };
}

function roleCards(player, familiarityStore) {
  const roleMap = new Map(runtime.roles.map((role) => [role.id, role]));
  return asArray(player.preferredRoles).map((roleId) => {
    const familiarity = getRoleFamiliarity(familiarityStore, player.id, roleId);
    const description = describeRoleFamiliarity(familiarity);
    return {
      id: roleId,
      name: roleMap.get(roleId)?.name || formatToken(roleId),
      familiarity,
      label: description.label,
      hint: description.hint
    };
  });
}

function ensureProfileDialog() {
  let dialog = document.getElementById(PROFILE_ID);
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = PROFILE_ID;
  dialog.className = "manager-player-profile-dialog";
  dialog.setAttribute("aria-label", "Spillerprofil");
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.body.append(dialog);
  return dialog;
}

function renderMiniPitch(player) {
  const pitch = node("div", "manager-player-mini-pitch");
  pitch.setAttribute("aria-label", "Spillerens posisjoner");
  const groups = [
    [asArray(player.naturalPositions), "natural", "Naturlig"],
    [asArray(player.usablePositions), "usable", "Brukbar"],
    [asArray(player.poorFits), "poor", "Dårlig fit"]
  ];
  groups.forEach(([positions, kind, label]) => positions.forEach((position) => {
    const point = POSITION_POINTS[position];
    if (!point) return;
    const marker = node("span", `manager-player-position-marker is-${kind}`, position);
    marker.style.left = `${point[0]}%`;
    marker.style.top = `${point[1]}%`;
    marker.title = `${position} · ${label}`;
    pitch.append(marker);
  }));
  return pitch;
}

function attributeGroups(profile) {
  const groups = { teknisk: [], mental: [], taktisk: [], fysisk: [] };
  if (!profile) return groups;
  Object.entries(profile.values || {}).forEach(([id, value]) => {
    const meta = runtime.catalogue.byId.get(id);
    const category = meta?.category || "teknisk";
    groups[category]?.push({ id, name: meta?.name || formatToken(id), value, source: profile.provenance?.[id] || "utledet" });
  });
  Object.values(groups).forEach((entries) => entries.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "nb")));
  return groups;
}

function renderAttributes(profile) {
  const host = node("section", "manager-player-attributes");
  const heading = node("div", "manager-player-section-head");
  heading.innerHTML = `<h3>Ferdighetsprofil</h3><span>1–20 · ingen overall</span>`;
  host.append(heading);
  const grid = node("div", "manager-player-attribute-groups");
  const groups = attributeGroups(profile);
  ["teknisk", "mental", "taktisk", "fysisk"].forEach((category) => {
    const section = node("section", "manager-player-attribute-group");
    section.append(node("h4", "", CATEGORY_LABELS[category]));
    groups[category].forEach((attribute) => {
      const line = node("div", "manager-player-attribute-line");
      line.title = attribute.source === "belagt" ? "Belagt styrke i spillergrunnlaget" : `Utledet fra ${attribute.source}`;
      line.append(node("span", "", attribute.name), node("strong", "", attribute.value));
      section.append(line);
    });
    grid.append(section);
  });
  host.append(grid);
  return host;
}

function tokenList(title, values, className = "") {
  const section = node("section", `manager-player-token-section ${className}`.trim());
  section.append(node("h3", "", title));
  const list = node("div", "manager-player-token-list");
  const tokens = asArray(values);
  if (!tokens.length) list.append(node("span", "is-empty", "Ingen registrerte data"));
  tokens.forEach((value) => list.append(node("span", "", formatToken(value))));
  section.append(list);
  return section;
}

function renderRolePanel(player) {
  const merits = readStorage(STORAGE.merits, {});
  const roles = roleCards(player, merits?.roleFamiliarity || {});
  const section = node("section", "manager-player-role-panel");
  section.append(node("h3", "", "Aktuelle roller"));
  const list = node("div", "manager-player-role-list");
  if (!roles.length) list.append(node("p", "muted-text", "Ingen foretrukne roller er registrert."));
  roles.forEach((role) => {
    const card = node("article", "manager-player-role-card");
    card.innerHTML = `<strong>${role.name}</strong><span>${role.familiarity}% · ${role.label}</span><small>${role.hint}</small>`;
    list.append(card);
  });
  section.append(list);
  return section;
}

function renderCurrentPanel(row, player) {
  const section = node("section", "manager-player-current-panel");
  section.append(node("h3", "", "Akkurat nå"));
  const metrics = node("div", "manager-player-current-grid");
  const current = [
    ["Kampklarhet", row.status.label, describeCondition(row.condition)],
    ["Form", row.form.text, `${row.appearances} kamper denne sesongen`],
    ["Taktisk fit", row.fit.label, selectedTacticId() ? "Mot valgt kampplan" : "Velg kampplan for vurdering"],
    ["Individuell trening", row.training ? runtime.trainingById.get(row.training.trackId)?.name || formatToken(row.training.trackId || row.training.roleId) : "Ingen", row.training?.roleId ? `Rolle: ${formatToken(row.training.roleId)}` : "Ingen aktiv oppfølging"]
  ];
  current.forEach(([label, value, detail]) => {
    const article = node("article", "");
    article.append(node("span", "", label), node("strong", "", value), node("small", "", detail));
    metrics.append(article);
  });
  section.append(metrics);
  if (player.warningWhenMisused) {
    const warning = node("div", "manager-player-misuse-warning");
    warning.append(node("span", "", "Misbruksvarsel"), node("strong", "", player.warningWhenMisused));
    section.append(warning);
  }
  return section;
}

function profileTabContent(data, tab) {
  const { row, player } = data;
  const host = node("div", "manager-player-profile-tab-content");
  if (tab === "training") {
    const training = row.training;
    host.append(tokenList("Det spilleren trenger", player.needs));
    const trainingBox = node("section", "manager-player-history-card");
    trainingBox.append(node("h3", "", "Individuell trening"));
    if (training) {
      const name = runtime.trainingById.get(training.trackId)?.name || formatToken(training.trackId || training.roleId);
      trainingBox.append(node("strong", "", name));
      if (training.roleId) trainingBox.append(node("p", "muted-text", `Rollefokus: ${formatToken(training.roleId)}`));
    } else {
      trainingBox.append(node("p", "muted-text", "Ingen individuell trening er satt denne uka."));
    }
    host.append(trainingBox);
    return host;
  }
  if (tab === "history") {
    const places = asArray(player.sourcePlaceIds).map((id) => runtime.placesById.get(id) || formatToken(id));
    const source = node("section", "manager-player-history-card");
    source.append(node("h3", "", "History Go-opprinnelse"));
    source.append(node("p", "", places.length ? places.join(" · ") : "Ingen stedskilde registrert."));
    if (player.era) source.append(node("small", "", `Epoke: ${formatToken(player.era)}`));
    host.append(source, tokenList("Taktikker spilleren trives i", player.likesTactics, "is-positive"), tokenList("Taktikker spilleren mistrives i", player.dislikesTactics, "is-negative"));
    return host;
  }
  const season = node("section", "manager-player-season-card");
  season.innerHTML = `
    <article><span>Kamper</span><strong>${row.appearances}</strong></article>
    <article><span>Minutter</span><strong>${row.minutes}</strong></article>
    <article><span>Mål</span><strong>${row.goals}</strong></article>
    <article><span>Målgivende</span><strong>${row.assists}</strong></article>`;
  host.append(season, tokenList("Styrker", player.strengths, "is-positive"));
  return host;
}

function renderProfile(playerId) {
  const dialog = ensureProfileDialog();
  const data = profileData(playerId);
  if (!data) return;
  const { row, player, attributes } = data;
  dialog.replaceChildren();

  const shell = node("article", "manager-player-profile-shell");
  const top = node("header", "manager-player-profile-head");
  const identity = node("div", "manager-player-profile-identity");
  identity.append(
    node("p", "eyebrow", "Spillerprofil"),
    node("h2", "", row.name),
    node("p", "", [player.nationality, [...row.naturalPositions, ...row.usablePositions].join(" / ")].filter(Boolean).join(" · "))
  );
  const close = document.createElement("button");
  close.type = "button";
  close.className = "manager-player-profile-close";
  close.setAttribute("aria-label", "Lukk spillerprofil");
  close.textContent = "×";
  close.addEventListener("click", () => dialog.close());
  top.append(identity, close);

  const overview = node("div", "manager-player-profile-overview");
  const left = node("div", "manager-player-profile-left");
  left.append(renderMiniPitch(player), renderRolePanel(player));
  const middle = renderAttributes(attributes);
  const right = node("div", "manager-player-profile-right");
  right.append(renderCurrentPanel(row, player), tokenList("Styrker", player.strengths, "is-positive"), tokenList("Trenger rundt seg", player.needs));
  overview.append(left, middle, right);

  const tabs = node("nav", "manager-player-profile-tabs");
  tabs.setAttribute("aria-label", "Spillerprofil detaljer");
  [["season", "Sesong"], ["training", "Trening"], ["history", "Historikk"]].forEach(([id, label]) => {
    const button = node("button", id === currentProfileTab ? "is-active" : "", label);
    button.type = "button";
    button.dataset.profileTab = id;
    button.setAttribute("aria-pressed", id === currentProfileTab ? "true" : "false");
    button.addEventListener("click", () => {
      currentProfileTab = id;
      renderProfile(playerId);
    });
    tabs.append(button);
  });

  shell.append(top, overview, tabs, profileTabContent(data, currentProfileTab));
  dialog.append(shell);
}

function openPlayerProfile(playerId) {
  activePlayerId = playerId;
  currentProfileTab = "season";
  const dialog = ensureProfileDialog();
  renderProfile(playerId);
  if (!dialog.open) dialog.showModal();
}

function enhanceLineupChoices() {
  document.querySelectorAll("#lineupPlayerChoices > .lineup-player-card:not([data-player-workspace-enhanced])").forEach((selectButton) => {
    const name = text(selectButton.querySelector("strong")?.textContent);
    const positions = text(selectButton.querySelector("span")?.textContent, "–");
    if (!name) return;
    const player = runtime?.players.find((entry) => entry.name === name);
    const wrapper = node("div", "lineup-player-choice-row");
    const profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.className = "lineup-player-profile-link";
    profileButton.innerHTML = `<strong>${name}</strong><span>${positions}</span>`;
    profileButton.addEventListener("click", () => {
      if (player) openPlayerProfile(player.id);
    });

    selectButton.dataset.playerWorkspaceEnhanced = "true";
    selectButton.classList.add("lineup-player-select-action");
    selectButton.innerHTML = `<strong>${selectButton.classList.contains("is-selected") ? "Valgt" : "Velg"}</strong><span>Sett inn</span>`;
    selectButton.setAttribute("aria-label", `${selectButton.classList.contains("is-selected") ? "Valgt" : "Sett inn"} ${name} på valgt plass`);
    selectButton.replaceWith(wrapper);
    wrapper.append(profileButton, selectButton);
  });
}

function renderAll() {
  if (!runtime) return;
  const rows = liveRows();
  renderCompactStatus(rows);
  renderRoster(rows);
  enhanceLineupChoices();
  if (activePlayerId && document.getElementById(PROFILE_ID)?.open) renderProfile(activePlayerId);
}

function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    renderAll();
  });
}

function installObservers() {
  const playerChoices = document.getElementById("lineupPlayerChoices");
  if (playerChoices) new MutationObserver(scheduleRender).observe(playerChoices, { childList: true });
  const gate = document.getElementById("squadSetupGate");
  if (gate) new MutationObserver(scheduleRender).observe(gate, { subtree: true, childList: true, characterData: true, attributes: true });
  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("#formationSelect, #tacticSelect")) scheduleRender();
  });
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("storage", scheduleRender);
}

async function boot() {
  ensureStyles();
  ensureWorkspace();
  ensureCompactStatus();
  try {
    await loadRuntime();
    renderAll();
    installObservers();
  } catch (error) {
    console.error("Kunne ikke bygge spillerliste og spillerprofil", error);
    const empty = document.getElementById("managerRosterEmpty");
    if (empty) {
      empty.hidden = false;
      empty.textContent = "Spillerlisten kunne ikke lastes. De eksisterende lagfunksjonene er fortsatt tilgjengelige.";
    }
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}
