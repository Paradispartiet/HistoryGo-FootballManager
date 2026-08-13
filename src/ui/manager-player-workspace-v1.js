import { derivePlayerAttributeIndex, normalizeAttributeCatalogue } from "../football-player-attributes.js";
import { describeCondition, freshnessFor, isInjured } from "../football-player-condition.js";
import { describeRoleFamiliarity, getRoleFamiliarity } from "../football-role-familiarity-engine.js";
import {
  buildStarterSquadPlayerIds,
  normalizePlayerPoolSquadState,
  normalizeRecruitmentState
} from "../football-recruitment.js";

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
const CATEGORY_LABELS = Object.freeze({ teknisk: "Teknisk", mental: "Mental", taktisk: "Taktisk", fysisk: "Fysisk" });
let runtimePromise = null;
let runtime = null;
let currentProfileTab = "season";
let rosterFrame = 0;
let lastRosterSignature = "";
const sessionPlayerPool = new Set();

const asArray = (value) => (Array.isArray(value) ? value : []);
function text(value, fallback = "") { const normalized = String(value ?? "").trim(); return normalized || fallback; }
function node(tag, className = "", value) { const element = document.createElement(tag); if (className) element.className = className; if (value !== undefined) element.textContent = String(value); return element; }
function readStorage(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function formatToken(value) { return text(value, "–").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
async function loadJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}: ${response.status}`); return response.json(); }

function historyGoPlaceIds() {
  const ids = new Set();
  const visited = readStorage(STORAGE.visitedPlaces, null);
  if (Array.isArray(visited)) visited.filter(Boolean).forEach((id) => ids.add(String(id)));
  else if (visited && typeof visited === "object") Object.entries(visited).forEach(([id, value]) => { if (value) ids.add(String(id)); });
  const groundhopper = readStorage(STORAGE.groundhopper, null);
  const places = groundhopper?.visited_groundhopper_places || groundhopper?.visitedGroundhopperPlaces || groundhopper?.visitedPlaces;
  asArray(places).forEach((entry) => { const id = typeof entry === "string" ? entry : entry?.placeId || entry?.id; if (id) ids.add(String(id)); });
  return ids;
}

function resolveUnlockedPlayerIds(players, unlockData) {
  const merits = readStorage(STORAGE.merits, {});
  const squadState = normalizePlayerPoolSquadState(merits);
  if (squadState.playerPoolSquadVersion === 1) {
    sessionPlayerPool.clear();
    squadState.squadPlayerIds
      .filter((id) => players.some((player) => String(player.id) === id))
      .forEach((id) => sessionPlayerPool.add(String(id)));
    return new Set(sessionPlayerPool);
  }
  const recruitment = normalizeRecruitmentState(merits);
  const placeIds = historyGoPlaceIds();
  asArray(merits?.unlockedPlaceIds).forEach((id) => placeIds.add(String(id)));
  const starterCandidateIds = new Set();
  const eligibleCandidateIds = new Set();
  asArray(unlockData?.placeUnlocks).forEach((place) => {
    const nationalArena = text(place?.placeRole).includes("national");
    asArray(place?.unlocks).forEach((unlock) => {
      if (unlock?.type !== "player_candidate" || !unlock?.targetId || nationalArena) return;
      const id = String(unlock.targetId);
      starterCandidateIds.add(id);
      if (placeIds.has(String(place?.placeId))) eligibleCandidateIds.add(id);
    });
  });
  const localIds = asArray(merits?.localStart?.playerIds).map(String);
  const starterIds = localIds.length ? [] : buildStarterSquadPlayerIds(players, [...starterCandidateIds], 15);
  const current = new Set([...starterIds, ...localIds]);
  if (localIds.length) sessionPlayerPool.clear();
  recruitment.recruitedPlayerIds.forEach((id) => {
    if (eligibleCandidateIds.has(String(id))) current.add(String(id));
  });
  current.forEach((id) => sessionPlayerPool.add(id));
  return new Set(sessionPlayerPool);
}

function conditionStatus(condition) {
  if (isInjured(condition)) return { id: "injured", label: "Skadet", tone: "negative" };
  const fresh = freshnessFor(condition);
  if (fresh < 45) return { id: "tired", label: "Sliten", tone: "negative" };
  if (fresh < 70) return { id: "loaded", label: "Belastet", tone: "attention" };
  return { id: "ready", label: "Klar", tone: "positive" };
}
function formStatus(condition) { const form = Number(condition?.form) || 0; return form >= .8 ? { label: "↑", text: "God form", rank: 2 } : form <= -.8 ? { label: "↓", text: "Svak form", rank: 0 } : { label: "→", text: "Normal form", rank: 1 }; }
function tacticFit(player, tacticId) { if (!tacticId) return { id: "neutral", label: "–", rank: 1 }; if (asArray(player?.likesTactics).includes(tacticId)) return { id: "good", label: "God", rank: 2 }; if (asArray(player?.dislikesTactics).includes(tacticId)) return { id: "poor", label: "Svak", rank: 0 }; return { id: "neutral", label: "Nøytral", rank: 1 }; }
function bestRole(player, rolesById, store) {
  const preferred = asArray(player?.preferredRoles);
  if (!preferred.length) return { id: null, name: "–", familiarity: 0, familiarityLabel: "Ingen rolledata" };
  const role = preferred.map((id) => ({ id, name: rolesById.get(id)?.name || formatToken(id), familiarity: getRoleFamiliarity(store, player.id, id) }))
    .sort((a, b) => b.familiarity - a.familiarity || a.name.localeCompare(b.name, "nb"))[0];
  return { ...role, familiarityLabel: describeRoleFamiliarity(role.familiarity).label };
}

export function createRosterViewModel({ players = [], unlockedPlayerIds = new Set(), statsRows = [], conditions = [], roleFamiliarity = {}, individualTraining = [], roles = [], tacticId = "" } = {}) {
  const stats = new Map(asArray(statsRows).map((row) => [String(row.playerId), row]));
  const conditionMap = new Map(asArray(conditions).map((entry) => [String(entry.playerId), entry]));
  const trainingMap = new Map(asArray(individualTraining).map((entry) => [String(entry.playerId), entry]));
  const rolesById = new Map(asArray(roles).map((role) => [role.id, role]));
  const unlocked = unlockedPlayerIds instanceof Set ? unlockedPlayerIds : new Set(asArray(unlockedPlayerIds).map(String));
  return asArray(players).filter((player) => unlocked.has(String(player.id))).map((player) => {
    const stat = stats.get(String(player.id)) || {};
    const condition = conditionMap.get(String(player.id)) || { playerId: player.id, load: 0, form: 0, injury: null };
    return {
      id: player.id, player, name: player.name || player.id, nationality: player.nationality || "",
      naturalPositions: asArray(player.naturalPositions), usablePositions: asArray(player.usablePositions),
      role: bestRole(player, rolesById, roleFamiliarity), status: conditionStatus(condition), form: formStatus(condition), fit: tacticFit(player, tacticId),
      appearances: Number(stat.appearances) || 0, goals: Number(stat.goals) || 0, assists: Number(stat.assists) || 0, minutes: Number(stat.minutes) || 0,
      condition, training: trainingMap.get(String(player.id)) || null, positionRank: POSITION_ORDER[asArray(player.naturalPositions)[0]] ?? 99
    };
  });
}

export function filterRosterRows(rows, { query = "", position = "all", availability = "all", sort = "position" } = {}) {
  const needle = text(query).toLocaleLowerCase("nb-NO");
  const filtered = asArray(rows).filter((row) => {
    const positions = [...asArray(row.naturalPositions), ...asArray(row.usablePositions)];
    const haystack = `${row.name} ${positions.join(" ")} ${row.role?.name || ""}`.toLocaleLowerCase("nb-NO");
    return (!needle || haystack.includes(needle)) && (position === "all" || positions.includes(position)) && (availability === "all" || row.status?.id === availability);
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

async function loadRuntime() {
  if (runtimePromise) return runtimePromise;
  runtimePromise = Promise.all([loadJson(DATA.players), loadJson(DATA.unlocks), loadJson(DATA.roles), loadJson(DATA.attributes), loadJson(DATA.training).catch(() => ({ tracks: [] }))])
    .then(([playersData, unlocks, rolesData, attributesData, trainingData]) => {
      const players = asArray(playersData?.players); const roles = asArray(rolesData?.roles); const catalogue = normalizeAttributeCatalogue(attributesData);
      runtime = { players, unlocks, roles, catalogue, attributeIndex: derivePlayerAttributeIndex(players, { catalogue, roles }), placesById: new Map(asArray(unlocks?.placeUnlocks).map((place) => [place.placeId, place.placeName || formatToken(place.placeId)])), trainingById: new Map(asArray(trainingData?.tracks).map((track) => [track.id, track])) };
      return runtime;
    });
  return runtimePromise;
}

function selectedTacticId() { return document.querySelector("#tacticSelect")?.value || ""; }
function liveRows({ includePlayerId = null } = {}) {
  if (!runtime) return [];
  const merits = readStorage(STORAGE.merits, {}); const stats = readStorage(STORAGE.stats, { rows: [] }); const conditions = readStorage(STORAGE.conditions, []); const individual = readStorage(STORAGE.individualTraining, { assignments: [] });
  const unlocked = resolveUnlockedPlayerIds(runtime.players, runtime.unlocks); if (includePlayerId) unlocked.add(String(includePlayerId));
  return createRosterViewModel({ players: runtime.players, unlockedPlayerIds: unlocked, statsRows: stats?.rows, conditions, roleFamiliarity: merits?.roleFamiliarity || {}, individualTraining: individual?.assignments, roles: runtime.roles, tacticId: selectedTacticId() });
}

function ensureStyles() { if (document.getElementById(STYLE_ID)) return; const link = document.createElement("link"); link.id = STYLE_ID; link.rel = "stylesheet"; link.href = new URL("./manager-player-workspace-v1.css", import.meta.url).href; document.head.append(link); }
function ensureCompactStatus() {
  const tactics = document.querySelector('[data-tab-section="tactics"]'); const gate = document.getElementById("squadSetupGate"); if (!tactics || !gate) return null;
  let rail = document.getElementById(STATUS_ID); if (!rail) { rail = node("section", "manager-squad-compact-status"); rail.id = STATUS_ID; rail.setAttribute("aria-label", "Lagstatus"); tactics.insertBefore(rail, gate); }
  if (!gate.classList.contains("is-replaced-by-compact-status")) gate.classList.add("is-replaced-by-compact-status");
  const old = document.getElementById("squadTacticsCommandPanel"); if (old && !old.classList.contains("is-replaced-by-compact-status")) old.classList.add("is-replaced-by-compact-status"); return rail;
}
function parseRatio(id, total) { const match = text(document.getElementById(id)?.textContent).match(/(\d+)\s*\/\s*(\d+)/); return { current: match ? Number(match[1]) : 0, total: match ? Number(match[2]) : total }; }
function renderCompactStatus(rows = liveRows()) {
  const rail = ensureCompactStatus(); if (!rail) return; const starters = parseRatio("squadGateStarters", 11); const bench = parseRatio("squadGateBench", 4); const unavailable = rows.filter((row) => ["injured", "tired"].includes(row.status.id)).length; const formation = text(document.querySelector("#formationSelect")?.selectedOptions?.[0]?.textContent, "Ingen formasjon");
  const labels = [`Tropp ${rows.length}`, `Ellever ${starters.current}/${starters.total}`, `Benk ${bench.current}/${bench.total}`, unavailable ? `${unavailable} utilgjengelig` : "Alle tilgjengelige", formation]; const signature = labels.join("|"); if (rail.dataset.signature === signature) return; rail.dataset.signature = signature; rail.replaceChildren(...labels.map((label, i) => node("span", i === 3 && unavailable ? "has-warning" : "", label)));
}

function ensureWorkspace() {
  const panel = document.getElementById("rosterReadinessPanel"); if (!panel) return null; panel.classList.add("has-manager-player-workspace"); let workspace = document.getElementById(WORKSPACE_ID); if (workspace) return workspace;
  workspace = node("div", "manager-player-workspace"); workspace.id = WORKSPACE_ID; workspace.innerHTML = `
    <header class="manager-player-workspace-head"><div><p class="eyebrow">Lag · Tropp</p><h2>Troppen din</h2><p class="muted-text">Dette er spillerne klubben bruker i oppstilling, roller, trening og kamp. Åpne en spiller for detaljene, eller velg Endre tropp for å hente alternativer fra Min spillerpool.</p></div><strong id="managerRosterCount" class="manager-roster-count">0 spillere</strong></header>
    <form class="manager-roster-tools" id="managerRosterTools" role="search"><label><span>Søk spiller</span><input id="managerRosterSearch" type="search" autocomplete="off" placeholder="Navn eller rolle"></label><label><span>Posisjon</span><select id="managerRosterPosition"><option value="all">Alle posisjoner</option></select></label><label><span>Tilgjengelighet</span><select id="managerRosterAvailability"><option value="all">Alle</option><option value="ready">Klar</option><option value="loaded">Belastet</option><option value="tired">Sliten</option><option value="injured">Skadet</option></select></label><label><span>Sorter</span><select id="managerRosterSort"><option value="position">Posisjon</option><option value="name">Navn</option><option value="appearances">Kamper</option><option value="goals">Mål</option><option value="assists">Målgivende</option><option value="status">Status</option></select></label></form>
    <div class="manager-roster-table-wrap"><table class="manager-roster-table"><thead><tr><th>Spiller</th><th>Pos</th><th>Rolle</th><th>Status</th><th>Fit</th><th>Form</th><th>Kamper</th><th>Mål</th><th>Målgivende</th><th>Trening</th></tr></thead><tbody id="managerRosterBody"></tbody></table><div id="managerRosterEmpty" class="manager-roster-empty" hidden>Ingen spillere matcher filtrene.</div></div>`;
  panel.append(workspace); const positionSelect = workspace.querySelector("#managerRosterPosition"); Object.keys(POSITION_ORDER).sort((a, b) => POSITION_ORDER[a] - POSITION_ORDER[b]).forEach((position) => { const option = node("option", "", position); option.value = position; positionSelect?.append(option); });
  workspace.querySelector("#managerRosterTools")?.addEventListener("input", scheduleRosterRender); workspace.querySelector("#managerRosterTools")?.addEventListener("change", scheduleRosterRender); return workspace;
}
function rosterControls(workspace) { return { query: workspace.querySelector("#managerRosterSearch")?.value || "", position: workspace.querySelector("#managerRosterPosition")?.value || "all", availability: workspace.querySelector("#managerRosterAvailability")?.value || "all", sort: workspace.querySelector("#managerRosterSort")?.value || "position" }; }
function rosterSignature(rows, controls) { return JSON.stringify({ controls, rows: rows.map((row) => [row.id, row.status.id, row.fit.id, row.form.label, row.appearances, row.goals, row.assists, row.training?.trackId || row.training?.roleId || ""]) }); }
function createPlayerLink(row) { const button = node("button", "manager-roster-player-link"); button.type = "button"; button.dataset.playerProfileId = row.id; button.append(node("strong", "", row.name), node("small", "", row.nationality || "")); button.addEventListener("click", () => openManagerPlayerProfile(row.id, { allowLocked: true })); return button; }
function renderRoster(rows = liveRows(), { force = false } = {}) {
  const workspace = ensureWorkspace(); if (!workspace) return; const controls = rosterControls(workspace); const visible = filterRosterRows(rows, controls); const signature = rosterSignature(visible, controls); const count = workspace.querySelector("#managerRosterCount"); const empty = workspace.querySelector("#managerRosterEmpty"); if (count) count.textContent = `${visible.length} av ${rows.length} spillere`; if (empty) empty.hidden = visible.length > 0; if (!force && signature === lastRosterSignature) return; lastRosterSignature = signature;
  const body = workspace.querySelector("#managerRosterBody"); if (!body) return; const fragment = document.createDocumentFragment(); visible.forEach((row) => {
    const tr = document.createElement("tr"); tr.dataset.playerId = row.id; const playerCell = document.createElement("td"); playerCell.append(createPlayerLink(row)); const positionCell = node("td", "manager-roster-positions", row.naturalPositions.join("/") || "–"); positionCell.title = row.usablePositions.length ? `Kan også brukes: ${row.usablePositions.join("/")}` : ""; const roleCell = document.createElement("td"); roleCell.append(node("span", "", row.role.name), node("small", "", row.role.familiarity ? `${row.role.familiarity}% · ${row.role.familiarityLabel}` : row.role.familiarityLabel)); const statusCell = node("td", "", row.status.label); statusCell.dataset.tone = row.status.tone; statusCell.title = describeCondition(row.condition); const fitCell = node("td", "", row.fit.label); fitCell.dataset.fit = row.fit.id; const formCell = node("td", "manager-roster-form", row.form.label); formCell.title = row.form.text; const trainingLabel = row.training ? runtime.trainingById.get(row.training.trackId)?.name || formatToken(row.training.trackId || row.training.roleId) : "–";
    [playerCell, positionCell, roleCell, statusCell, fitCell, formCell, node("td", "manager-roster-number", row.appearances), node("td", "manager-roster-number", row.goals), node("td", "manager-roster-number", row.assists), node("td", "manager-roster-training", trainingLabel)].forEach((cell) => tr.append(cell)); tr.addEventListener("dblclick", () => openManagerPlayerProfile(row.id, { allowLocked: true })); fragment.append(tr);
  }); body.replaceChildren(fragment);
}
function scheduleRosterRender() { cancelAnimationFrame(rosterFrame); rosterFrame = requestAnimationFrame(() => { rosterFrame = 0; if (!runtime) return; const rows = liveRows(); renderCompactStatus(rows); renderRoster(rows); }); }

function profileData(playerId, allowLocked = false) {
  if (!runtime) return null; const unlocked = resolveUnlockedPlayerIds(runtime.players, runtime.unlocks); const rows = liveRows({ includePlayerId: allowLocked ? playerId : null }); const row = rows.find((entry) => String(entry.id) === String(playerId)); if (!row) return null; return { row, player: row.player, attributes: runtime.attributeIndex?.profiles?.[playerId] || null, recruitable: unlocked.has(String(playerId)) };
}
function ensureProfileDialog() { let dialog = document.getElementById(PROFILE_ID); if (dialog) return dialog; dialog = document.createElement("dialog"); dialog.id = PROFILE_ID; dialog.className = "manager-player-profile-dialog"; dialog.setAttribute("aria-label", "Spillerprofil"); dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }); document.body.append(dialog); return dialog; }
function renderMiniPitch(player) { const pitch = node("div", "manager-player-mini-pitch"); pitch.setAttribute("aria-label", "Spillerens posisjoner"); [[asArray(player.naturalPositions), "natural", "Naturlig"], [asArray(player.usablePositions), "usable", "Brukbar"], [asArray(player.poorFits), "poor", "Dårlig fit"]].forEach(([positions, kind, label]) => positions.forEach((position) => { const point = POSITION_POINTS[position]; if (!point) return; const marker = node("span", `manager-player-position-marker is-${kind}`, position); marker.style.left = `${point[0]}%`; marker.style.top = `${point[1]}%`; marker.title = `${position} · ${label}`; pitch.append(marker); })); return pitch; }
function attributeGroups(profile) { const groups = { teknisk: [], mental: [], taktisk: [], fysisk: [] }; Object.entries(profile?.values || {}).forEach(([id, value]) => { const meta = runtime.catalogue.byId.get(id); const category = meta?.category || "teknisk"; groups[category]?.push({ name: meta?.name || formatToken(id), value, source: profile.provenance?.[id] || "utledet" }); }); Object.values(groups).forEach((entries) => entries.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "nb"))); return groups; }
function renderAttributes(profile) { const host = node("section", "manager-player-attributes"); const heading = node("div", "manager-player-section-head"); heading.append(node("h3", "", "Ferdighetsprofil"), node("span", "", "1–20 · ingen overall")); host.append(heading); const grid = node("div", "manager-player-attribute-groups"); const groups = attributeGroups(profile); ["teknisk", "mental", "taktisk", "fysisk"].forEach((category) => { const section = node("section", "manager-player-attribute-group"); section.append(node("h4", "", CATEGORY_LABELS[category])); groups[category].forEach((attribute) => { const line = node("div", "manager-player-attribute-line"); line.title = attribute.source === "belagt" ? "Belagt styrke i spillergrunnlaget" : `Utledet fra ${attribute.source}`; line.append(node("span", "", attribute.name), node("strong", "", attribute.value)); section.append(line); }); grid.append(section); }); host.append(grid); return host; }
function tokenList(title, values, className = "") { const section = node("section", `manager-player-token-section ${className}`.trim()); section.append(node("h3", "", title)); const list = node("div", "manager-player-token-list"); const tokens = asArray(values); if (!tokens.length) list.append(node("span", "is-empty", "Ingen registrerte data")); tokens.forEach((value) => list.append(node("span", "", formatToken(value)))); section.append(list); return section; }
function renderRolePanel(player) { const store = readStorage(STORAGE.merits, {})?.roleFamiliarity || {}; const roleMap = new Map(runtime.roles.map((role) => [role.id, role])); const section = node("section", "manager-player-role-panel"); section.append(node("h3", "", "Aktuelle roller")); const list = node("div", "manager-player-role-list"); const roles = asArray(player.preferredRoles); if (!roles.length) list.append(node("p", "muted-text", "Ingen foretrukne roller er registrert.")); roles.forEach((roleId) => { const familiarity = getRoleFamiliarity(store, player.id, roleId); const description = describeRoleFamiliarity(familiarity); const card = node("article", "manager-player-role-card"); card.append(node("strong", "", roleMap.get(roleId)?.name || formatToken(roleId)), node("span", "", `${familiarity}% · ${description.label}`), node("small", "", description.hint)); list.append(card); }); section.append(list); return section; }
function renderCurrentPanel(data) { const { row, player, recruitable } = data; const section = node("section", "manager-player-current-panel"); section.append(node("h3", "", "Akkurat nå")); const metrics = node("div", "manager-player-current-grid"); [["Kampklarhet", row.status.label, describeCondition(row.condition)], ["Form", row.form.text, `${row.appearances} kamper denne sesongen`], ["Taktisk fit", row.fit.label, selectedTacticId() ? "Mot valgt kampplan" : "Velg kampplan for vurdering"], ["Tropp", recruitable ? "I troppen" : "Ikke i troppen", recruitable ? "Spilleren kan brukes i oppstilling, trening og kamp." : "Profilen kan undersøkes uten at spilleren er valgt til klubbtroppen."], ["Individuell trening", row.training ? runtime.trainingById.get(row.training.trackId)?.name || formatToken(row.training.trackId || row.training.roleId) : "Ingen", row.training?.roleId ? `Rollefokus: ${formatToken(row.training.roleId)}` : "Ingen aktiv oppfølging"]].forEach(([label, value, detail]) => { const article = node("article"); article.append(node("span", "", label), node("strong", "", value), node("small", "", detail)); metrics.append(article); }); section.append(metrics); if (player.warningWhenMisused) { const warning = node("div", "manager-player-misuse-warning"); warning.append(node("span", "", "Misbruksvarsel"), node("strong", "", player.warningWhenMisused)); section.append(warning); } return section; }
function profileTabContent(data, tab) { const { row, player } = data; const host = node("div", "manager-player-profile-tab-content"); if (tab === "training") { host.append(tokenList("Det spilleren trenger", player.needs)); const box = node("section", "manager-player-history-card"); box.append(node("h3", "", "Individuell trening")); if (row.training) { box.append(node("strong", "", runtime.trainingById.get(row.training.trackId)?.name || formatToken(row.training.trackId || row.training.roleId))); if (row.training.roleId) box.append(node("p", "muted-text", `Rollefokus: ${formatToken(row.training.roleId)}`)); } else box.append(node("p", "muted-text", "Ingen individuell trening er satt denne uka.")); host.append(box); return host; } if (tab === "history") { const places = asArray(player.sourcePlaceIds).map((id) => runtime.placesById.get(id) || formatToken(id)); const source = node("section", "manager-player-history-card"); source.append(node("h3", "", "History Go-opprinnelse"), node("p", "", places.length ? places.join(" · ") : "Ingen stedskilde registrert.")); if (player.era) source.append(node("small", "", `Epoke: ${formatToken(player.era)}`)); host.append(source, tokenList("Taktikker spilleren trives i", player.likesTactics, "is-positive"), tokenList("Taktikker spilleren mistrives i", player.dislikesTactics, "is-negative")); return host; } const season = node("section", "manager-player-season-card"); [["Kamper", row.appearances], ["Minutter", row.minutes], ["Mål", row.goals], ["Målgivende", row.assists]].forEach(([label, value]) => { const article = node("article"); article.append(node("span", "", label), node("strong", "", value)); season.append(article); }); host.append(season, tokenList("Styrker", player.strengths, "is-positive")); return host; }

function renderProfile(playerId, allowLocked = false) {
  const data = profileData(playerId, allowLocked); if (!data) return false; const dialog = ensureProfileDialog(); const { row, player, attributes } = data; const shell = node("article", "manager-player-profile-shell"); const top = node("header", "manager-player-profile-head"); const identity = node("div", "manager-player-profile-identity"); identity.append(node("p", "eyebrow", "Spillerprofil"), node("h2", "", row.name), node("p", "", [player.nationality, [...row.naturalPositions, ...row.usablePositions].join(" / ")].filter(Boolean).join(" · "))); const close = node("button", "manager-player-profile-close", "×"); close.type = "button"; close.setAttribute("aria-label", "Lukk spillerprofil"); close.addEventListener("click", () => dialog.close()); top.append(identity, close);
  const overview = node("div", "manager-player-profile-overview"); const left = node("div", "manager-player-profile-left"); left.append(renderMiniPitch(player), renderRolePanel(player)); const right = node("div", "manager-player-profile-right"); right.append(renderCurrentPanel(data), tokenList("Styrker", player.strengths, "is-positive"), tokenList("Trenger rundt seg", player.needs)); overview.append(left, renderAttributes(attributes), right);
  const tabs = node("nav", "manager-player-profile-tabs"); tabs.setAttribute("aria-label", "Spillerprofil detaljer"); [["season", "Sesong"], ["training", "Trening"], ["history", "Historikk"]].forEach(([id, label]) => { const button = node("button", id === currentProfileTab ? "is-active" : "", label); button.type = "button"; button.setAttribute("aria-pressed", id === currentProfileTab ? "true" : "false"); button.addEventListener("click", () => { currentProfileTab = id; renderProfile(playerId, allowLocked); }); tabs.append(button); }); shell.append(top, overview, tabs, profileTabContent(data, currentProfileTab)); dialog.replaceChildren(shell); return true;
}
export function openManagerPlayerProfile(playerId, { allowLocked = false } = {}) { if (!runtime || !playerId) return false; currentProfileTab = "season"; const dialog = ensureProfileDialog(); if (!renderProfile(String(playerId), allowLocked)) return false; if (!dialog.open) dialog.showModal(); return true; }

function enhanceLineupChoices() {
  if (!runtime) return; document.querySelectorAll("#lineupPlayerChoices > .lineup-player-card:not([data-player-workspace-enhanced])").forEach((selectButton) => { const name = text(selectButton.querySelector("strong")?.textContent); if (!name) return; const positions = text(selectButton.querySelector("span")?.textContent, "–"); const player = runtime.players.find((entry) => entry.name === name); const wrapper = node("div", "lineup-player-choice-row"); const profileButton = node("button", "lineup-player-profile-link"); profileButton.type = "button"; profileButton.append(node("strong", "", name), node("span", "", positions)); profileButton.addEventListener("click", () => { if (player) openManagerPlayerProfile(player.id); }); selectButton.dataset.playerWorkspaceEnhanced = "true"; selectButton.classList.add("lineup-player-select-action"); const selected = selectButton.classList.contains("is-selected"); selectButton.replaceChildren(node("strong", "", selected ? "Valgt" : "Velg"), node("span", "", "Sett inn")); selectButton.setAttribute("aria-label", `${selected ? "Valgt" : "Sett inn"} ${name} på valgt plass`); selectButton.replaceWith(wrapper); wrapper.append(profileButton, selectButton); });
}
function installObservers() { const choices = document.getElementById("lineupPlayerChoices"); if (choices) new MutationObserver(() => requestAnimationFrame(enhanceLineupChoices)).observe(choices, { childList: true }); const gate = document.getElementById("squadSetupGate"); if (gate) new MutationObserver(scheduleRosterRender).observe(gate, { subtree: true, childList: true, characterData: true, attributes: true }); document.addEventListener("change", (event) => { if (event.target?.matches?.("#formationSelect, #tacticSelect")) scheduleRosterRender(); }); window.addEventListener("updateProfile", scheduleRosterRender); window.addEventListener("storage", scheduleRosterRender); window.addEventListener("hgfm:team-merits-changed", scheduleRosterRender); window.addEventListener("hgfm:open-player-profile", (event) => { const playerId = event.detail?.playerId; if (playerId) openManagerPlayerProfile(playerId, { allowLocked: event.detail?.allowLocked !== false }); }); }
async function boot() { ensureStyles(); ensureWorkspace(); ensureCompactStatus(); try { await loadRuntime(); const rows = liveRows(); renderCompactStatus(rows); renderRoster(rows, { force: true }); enhanceLineupChoices(); installObservers(); } catch (error) { console.error("Kunne ikke bygge spillerliste og spillerprofil", error); const empty = document.getElementById("managerRosterEmpty"); if (empty) { empty.hidden = false; empty.textContent = "Spillerlisten kunne ikke lastes. De eksisterende lagfunksjonene er fortsatt tilgjengelige."; } } }
if (typeof document !== "undefined") { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true }); else boot(); }
