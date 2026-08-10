import { resolveClubSquadAccess } from "../football-club-squad.js";
import {
  buildStarterSquadPlayerIds,
  normalizePlayerPoolSquadState,
  normalizeRecruitmentState,
  setPlayerSquadMembership
} from "../football-recruitment.js";

const DIALOG_ID = "playerPoolSquadDrawer";
const STYLE_ID = "managerPlayerPoolSquadV1Style";
const DATA = Object.freeze({
  players: new URL("../../data/football_players.json", import.meta.url),
  unlocks: new URL("../../data/football_unlocks.json", import.meta.url),
  clubs: new URL("../../data/football_clubs.json", import.meta.url)
});
const STORAGE = Object.freeze({
  merits: "hgfm.teamMerits.v1",
  start: "hgfm.gameStartState.v1",
  visited: "visited_places",
  groundhopper: "hg_groundhopper_stats_v1",
  learning: "hg_learning_log_v1"
});
const QUIZ_EVENTS = new Set(["quiz_perfect", "quiz_set_complete", "quiz_legacy"]);
const POSITION_ORDER = Object.freeze({ GK: 0, CB: 10, LB: 11, RB: 12, WB: 13, DM: 20, CM: 21, AM: 22, LW: 30, RW: 31, ST: 40 });

let runtime = null;
let renderFrame = 0;

const asArray = (value) => (Array.isArray(value) ? value : []);
function text(value, fallback = "") { const normalized = String(value ?? "").trim(); return normalized || fallback; }
function node(tag, className = "", value) { const element = document.createElement(tag); if (className) element.className = className; if (value !== undefined) element.textContent = String(value); return element; }
function readStorage(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function writeStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
async function loadJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}`); return response.json(); }

function historyPlaceIds() {
  const ids = new Set();
  const visited = readStorage(STORAGE.visited, null);
  if (Array.isArray(visited)) visited.filter(Boolean).forEach((id) => ids.add(String(id)));
  else if (visited && typeof visited === "object") Object.entries(visited).forEach(([id, value]) => { if (value) ids.add(String(id)); });
  const groundhopper = readStorage(STORAGE.groundhopper, null);
  const places = groundhopper?.visited_groundhopper_places || groundhopper?.visitedGroundhopperPlaces || groundhopper?.visitedPlaces;
  asArray(places).forEach((entry) => { const id = typeof entry === "string" ? entry : entry?.placeId || entry?.id; if (id) ids.add(String(id)); });
  return ids;
}

function quizPlaceIds() {
  const log = readStorage(STORAGE.learning, null);
  if (!Array.isArray(log)) return null;
  const ids = new Set();
  log.forEach((event) => {
    if (!event || !QUIZ_EVENTS.has(event.type)) return;
    const parent = text(event.parentTargetId);
    const target = text(event.targetId);
    if (parent) ids.add(parent);
    if (target) ids.add(target.split("::")[0].split("__")[0]);
  });
  return ids;
}

export function buildPlayerPoolSquadRows({
  players = [], unlockData = {}, clubs = [], merits = {}, start = {}, visitedPlaceIds = [], quizCompletedPlaceIds = null
} = {}) {
  const historyIds = visitedPlaceIds instanceof Set ? new Set(visitedPlaceIds) : new Set(asArray(visitedPlaceIds).map(String));
  const unlockedPlaceIds = new Set([...historyIds, ...asArray(merits?.unlockedPlaceIds).map(String)]);
  const quizIds = quizCompletedPlaceIds instanceof Set ? quizCompletedPlaceIds : quizCompletedPlaceIds === null ? null : new Set(asArray(quizCompletedPlaceIds).map(String));
  const allCandidateIds = new Set();
  const poolIds = new Set();
  const sourceById = new Map();

  asArray(unlockData?.placeUnlocks).forEach((place) => {
    const placeId = text(place?.placeId);
    const national = text(place?.placeRole).includes("national");
    const needsQuiz = quizIds !== null && historyIds.has(placeId) && !quizIds.has(placeId);
    asArray(place?.unlocks).forEach((unlock) => {
      if (unlock?.type !== "player_candidate" || !unlock?.targetId || national) return;
      const id = String(unlock.targetId);
      allCandidateIds.add(id);
      if (!unlockedPlaceIds.has(placeId) || needsQuiz) return;
      poolIds.add(id);
      if (!sourceById.has(id)) sourceById.set(id, []);
      sourceById.get(id).push(text(place.placeName, placeId));
    });
  });

  const localIds = asArray(merits?.localStart?.playerIds).map(String);
  localIds.forEach((id) => { poolIds.add(id); sourceById.set(id, ["Lokal starttropp"]); });
  const club = asArray(clubs).find((entry) => String(entry.id) === String(start?.takeoverClubId || "")) || null;
  if (club) {
    const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: historyIds, candidateIds: allCandidateIds, squadSize: 15 });
    const clubIds = access?.mode === "heritage" ? access.clubPoolIds : access?.baseSquad;
    asArray(clubIds).forEach((id) => { poolIds.add(String(id)); sourceById.set(String(id), [club.name]); });
  } else if (!localIds.length) {
    buildStarterSquadPlayerIds(players, [...allCandidateIds], 15).forEach((id) => {
      poolIds.add(id);
      if (!sourceById.has(id)) sourceById.set(id, ["Starttropp"]);
    });
  }

  const squadState = normalizePlayerPoolSquadState(merits);
  const legacy = normalizeRecruitmentState(merits);
  const squadIds = new Set(
    squadState.playerPoolSquadVersion === 1
      ? squadState.squadPlayerIds.filter((id) => poolIds.has(id))
      : [...poolIds].filter((id) => localIds.includes(id) || legacy.recruitedPlayerIds.includes(id) || sourceById.get(id)?.includes(club?.name || "") || sourceById.get(id)?.includes("Starttropp"))
  );

  return asArray(players)
    .filter((player) => poolIds.has(String(player.id)))
    .map((player) => ({
      id: String(player.id),
      name: text(player.name, player.id),
      nationality: text(player.nationality),
      positions: [...new Set([...asArray(player.naturalPositions), ...asArray(player.usablePositions)])],
      source: [...new Set(sourceById.get(String(player.id)) || ["History Go-samling"])].join(" · "),
      inSquad: squadIds.has(String(player.id)),
      rank: POSITION_ORDER[asArray(player.naturalPositions)[0]] ?? 99
    }))
    .sort((a, b) => Number(b.inSquad) - Number(a.inSquad) || a.rank - b.rank || a.name.localeCompare(b.name, "nb"));
}

function currentRows() {
  if (!runtime) return [];
  return buildPlayerPoolSquadRows({
    ...runtime,
    merits: readStorage(STORAGE.merits, {}),
    start: readStorage(STORAGE.start, {}),
    visitedPlaceIds: historyPlaceIds(),
    quizCompletedPlaceIds: quizPlaceIds()
  });
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-player-pool-squad-v1.css", import.meta.url).href;
  document.head.append(link);
}

function ensureDrawer() {
  let dialog = document.getElementById(DIALOG_ID);
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "player-pool-squad-drawer";
  dialog.setAttribute("aria-label", "Endre tropp fra Min spillerpool");
  dialog.innerHTML = `<section class="player-pool-squad-shell"><header><div><p class="eyebrow">Min spillerpool → Tropp</p><h2>Endre tropp</h2><p>Velg hvem klubben bruker i oppstilling, roller, trening og kamp. Det finnes ingen troppsgrense eller byttefrist.</p></div><button type="button" class="player-pool-squad-close" aria-label="Lukk Endre tropp">×</button></header><form class="player-pool-squad-tools" role="search"><label><span>Søk</span><input type="search" id="playerPoolSquadSearch" autocomplete="off" placeholder="Navn, posisjon eller kilde"></label><label><span>Vis</span><select id="playerPoolSquadFilter"><option value="all">Hele spillerpoolen</option><option value="squad">I troppen</option><option value="available">Ikke i troppen</option></select></label></form><p id="playerPoolSquadSummary" class="player-pool-squad-summary" aria-live="polite"></p><div id="playerPoolSquadList" class="player-pool-squad-list"></div><p id="playerPoolSquadFeedback" class="player-pool-squad-feedback" aria-live="polite"></p></section>`;
  dialog.querySelector(".player-pool-squad-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector(".player-pool-squad-tools")?.addEventListener("input", renderDrawer);
  dialog.querySelector(".player-pool-squad-tools")?.addEventListener("change", renderDrawer);
  document.body.append(dialog);
  return dialog;
}

function selectedLineupIds() {
  return new Set([...document.querySelectorAll("#lineupSlots .player-chip[data-player-id]")].map((chip) => chip.dataset.playerId).filter(Boolean));
}

function changeMembership(row, included) {
  const feedback = document.getElementById("playerPoolSquadFeedback");
  if (!included && selectedLineupIds().has(row.id)) {
    if (feedback) feedback.textContent = `${row.name} står i startelleveren. Bytt spilleren på Oppstilling før du tar spilleren ut av troppen.`;
    return;
  }
  const current = readStorage(STORAGE.merits, {});
  const result = setPlayerSquadMembership(current, row.id, included);
  if (!result.changed) return;
  if (!writeStorage(STORAGE.merits, result.merits)) {
    if (feedback) feedback.textContent = "Kunne ikke lagre troppsvalget.";
    return;
  }
  if (feedback) feedback.textContent = included ? `${row.name} er valgt inn i troppen.` : `${row.name} er tatt ut av troppen og ligger fortsatt i Min spillerpool.`;
  window.dispatchEvent(new CustomEvent("hgfm:team-merits-changed", { detail: { action: included ? "squad-add" : "squad-remove", playerId: row.id } }));
  renderDrawer();
}

function renderDrawer() {
  const dialog = ensureDrawer();
  const all = currentRows();
  const needle = text(dialog.querySelector("#playerPoolSquadSearch")?.value).toLocaleLowerCase("nb-NO");
  const filter = dialog.querySelector("#playerPoolSquadFilter")?.value || "all";
  const rows = all.filter((row) => {
    const matches = !needle || `${row.name} ${row.nationality} ${row.positions.join(" ")} ${row.source}`.toLocaleLowerCase("nb-NO").includes(needle);
    return matches && (filter === "all" || (filter === "squad" ? row.inSquad : !row.inSquad));
  });
  const summary = dialog.querySelector("#playerPoolSquadSummary");
  if (summary) summary.textContent = `${all.filter((row) => row.inSquad).length} i troppen · ${all.length} i Min spillerpool`;
  const list = dialog.querySelector("#playerPoolSquadList");
  if (!list) return;
  if (!rows.length) { list.replaceChildren(node("p", "player-pool-squad-empty", "Ingen spillere matcher valget.")); return; }
  list.replaceChildren(...rows.map((row) => {
    const article = node("article", "player-pool-squad-row");
    article.dataset.inSquad = row.inSquad ? "true" : "false";
    article.dataset.playerId = row.id;
    const profile = node("button", "player-pool-squad-player");
    profile.type = "button";
    profile.append(node("strong", "", row.name), node("small", "", `${row.positions.join("/") || "–"} · ${row.source}`));
    profile.addEventListener("click", () => window.dispatchEvent(new CustomEvent("hgfm:open-player-profile", { detail: { playerId: row.id, allowLocked: true } })));
    const action = node("button", "player-pool-squad-action", row.inSquad ? "Ta ut" : "Velg inn");
    action.type = "button";
    action.setAttribute("aria-label", `${row.inSquad ? "Ta" : "Velg"} ${row.name} ${row.inSquad ? "ut av" : "inn i"} troppen`);
    action.addEventListener("click", () => changeMembership(row, !row.inSquad));
    article.append(profile, node("span", "player-pool-squad-state", row.inSquad ? "I troppen" : "I spillerpoolen"), action);
    return article;
  }));
}

function ensureOpenButton() {
  const head = document.querySelector("#managerPlayerWorkspace .manager-player-workspace-head");
  if (!head || head.querySelector("#openPlayerPoolSquadDrawer")) return;
  const controls = node("div", "manager-player-workspace-head-actions");
  const count = head.querySelector("#managerRosterCount");
  if (count) controls.append(count);
  const button = node("button", "player-pool-squad-open", "Endre tropp");
  button.id = "openPlayerPoolSquadDrawer";
  button.type = "button";
  button.addEventListener("click", () => { renderDrawer(); const dialog = ensureDrawer(); if (!dialog.open) dialog.showModal(); });
  controls.append(button);
  head.append(controls);
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => { renderFrame = 0; ensureOpenButton(); if (document.getElementById(DIALOG_ID)?.open) renderDrawer(); });
}

async function boot() {
  ensureStyles();
  const [playersData, unlockData, clubsData] = await Promise.all([loadJson(DATA.players), loadJson(DATA.unlocks), loadJson(DATA.clubs)]);
  runtime = { players: asArray(playersData?.players), unlockData, clubs: asArray(clubsData?.clubs) };
  ensureDrawer();
  ensureOpenButton();
  window.addEventListener("hgfm:team-merits-changed", scheduleRender);
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("storage", scheduleRender);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
