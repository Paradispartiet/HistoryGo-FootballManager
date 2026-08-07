import {
  CLUB_STATUS_LABEL,
  clubStatusFor,
  listClubHeritagePlayers
} from "../football-club-squad.js";

const STYLE_ID = "managerScoutingWorkspaceV1Style";
const RECRUITABLE_ID = "managerScoutingRecruitable";
const CLUBS_SECTION = "scoutingClubs";

const DATA = Object.freeze({
  players: new URL("../../data/football_players.json", import.meta.url),
  unlocks: new URL("../../data/football_unlocks.json", import.meta.url),
  clubs: new URL("../../data/football_clubs.json", import.meta.url)
});

const STORAGE = Object.freeze({
  merits: "hgfm.teamMerits.v1",
  start: "hgfm.gameStartState.v1",
  visitedPlaces: "visited_places",
  groundhopper: "hg_groundhopper_stats_v1"
});

const POSITION_ORDER = Object.freeze({
  GK: 0, CB: 10, LB: 11, RB: 12, WB: 13,
  DM: 20, CM: 21, AM: 22, LW: 30, RW: 31, ST: 40
});

let runtime = null;
let renderFrame = 0;
let activeClubId = null;

const asArray = (value) => (Array.isArray(value) ? value : []);
function text(value, fallback = "") { const normalized = String(value ?? "").trim(); return normalized || fallback; }
function node(tag, className = "", value) { const element = document.createElement(tag); if (className) element.className = className; if (value !== undefined) element.textContent = String(value); return element; }
function readStorage(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function formatToken(value) { return text(value, "–").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
async function loadJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}: ${response.status}`); return response.json(); }

function currentHistoryGoPlaceIds() {
  const ids = new Set();
  const visited = readStorage(STORAGE.visitedPlaces, null);
  if (Array.isArray(visited)) visited.filter(Boolean).forEach((id) => ids.add(String(id)));
  else if (visited && typeof visited === "object") Object.entries(visited).forEach(([id, value]) => { if (value) ids.add(String(id)); });
  const groundhopper = readStorage(STORAGE.groundhopper, null);
  const places = groundhopper?.visited_groundhopper_places || groundhopper?.visitedGroundhopperPlaces || groundhopper?.visitedPlaces;
  asArray(places).forEach((entry) => {
    const id = typeof entry === "string" ? entry : entry?.placeId || entry?.id;
    if (id) ids.add(String(id));
  });
  return ids;
}

export function buildRecruitablePlayers({ players = [], unlockData = {}, merits = {}, visitedPlaceIds = [] } = {}) {
  const unlockedPlaces = visitedPlaceIds instanceof Set ? new Set(visitedPlaceIds) : new Set(asArray(visitedPlaceIds).map(String));
  asArray(merits?.unlockedPlaceIds).forEach((id) => unlockedPlaces.add(String(id)));
  const localIds = new Set(asArray(merits?.localStart?.playerIds).map(String));
  const sources = new Map();

  asArray(unlockData?.placeUnlocks).forEach((place) => {
    if (!unlockedPlaces.has(String(place?.placeId))) return;
    asArray(place?.unlocks).forEach((unlock) => {
      if (unlock?.type !== "player_candidate" || !unlock?.targetId) return;
      const id = String(unlock.targetId);
      if (!sources.has(id)) sources.set(id, []);
      sources.get(id).push({ placeId: String(place.placeId), placeName: text(place.placeName, formatToken(place.placeId)) });
    });
  });

  return asArray(players)
    .filter((player) => localIds.has(String(player.id)) || sources.has(String(player.id)))
    .map((player) => ({
      id: String(player.id),
      name: text(player.name, player.id),
      nationality: text(player.nationality),
      naturalPositions: asArray(player.naturalPositions),
      usablePositions: asArray(player.usablePositions),
      preferredRoles: asArray(player.preferredRoles),
      sources: sources.get(String(player.id)) || [],
      sourceLabel: sources.has(String(player.id))
        ? [...new Set(sources.get(String(player.id)).map((source) => source.placeName))].join(" · ")
        : "Starttropp",
      positionRank: POSITION_ORDER[asArray(player.naturalPositions)[0]] ?? 99,
      player
    }))
    .sort((a, b) => a.positionRank - b.positionRank || a.name.localeCompare(b.name, "nb"));
}

export function filterRecruitablePlayers(rows, { query = "", position = "all" } = {}) {
  const needle = text(query).toLocaleLowerCase("nb-NO");
  return asArray(rows).filter((row) => {
    const positions = [...asArray(row.naturalPositions), ...asArray(row.usablePositions)];
    const haystack = `${row.name} ${row.nationality} ${positions.join(" ")} ${row.preferredRoles.join(" ")} ${row.sourceLabel}`.toLocaleLowerCase("nb-NO");
    return (!needle || haystack.includes(needle)) && (position === "all" || positions.includes(position));
  });
}

export function buildClubScoutingRows({ clubs = [], players = [], currentClubId = null, tierNames = {} } = {}) {
  return asArray(clubs)
    .filter((club) => club?.id && String(club.id) !== String(currentClubId || ""))
    .map((club) => {
      const candidates = listClubHeritagePlayers({ homePlaceId: club.homePlaceId || null, players });
      return {
        id: String(club.id),
        name: text(club.name, club.id),
        city: text(club.city),
        ground: text(club.ground),
        tier: text(club.tier),
        tierName: tierNames[club.tier] || formatToken(club.tier),
        homePlaceId: club.homePlaceId || null,
        candidates
      };
    })
    .sort((a, b) => a.tierName.localeCompare(b.tierName, "nb") || a.name.localeCompare(b.name, "nb"));
}

export function filterClubScoutingRows(rows, { query = "", tier = "all" } = {}) {
  const needle = text(query).toLocaleLowerCase("nb-NO");
  return asArray(rows).filter((row) => {
    const haystack = `${row.name} ${row.city} ${row.ground} ${row.tierName}`.toLocaleLowerCase("nb-NO");
    return (!needle || haystack.includes(needle)) && (tier === "all" || row.tier === tier);
  });
}

function openPlayerProfile(playerId, allowLocked = true) {
  window.dispatchEvent(new CustomEvent("hgfm:open-player-profile", {
    detail: { playerId, allowLocked }
  }));
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-scouting-workspace-v1.css", import.meta.url).href;
  document.head.append(link);
}

function showScoutingTarget(target) {
  const section = document.querySelector(`[data-tab-section="${target}"]`);
  if (!section) return;
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => { candidate.hidden = candidate !== section; });
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "historygo";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(".app-subtab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === target;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  const subnav = document.getElementById("appSubnav");
  if (subnav) subnav.hidden = false;
  syncScoutingLocation();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function scoutingIcon() {
  return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/><path d="M8 10.5h5M10.5 8v5"/></svg>`;
}

function installNavigation() {
  const nav = document.querySelector(".main-nav-inner");
  const scoutingTab = document.querySelector('.main-nav .nav-tab[data-tab-target="board"]')
    || document.querySelector('.main-nav .nav-tab[data-tab-target="historygo"]');
  const lagTab = document.querySelector('.main-nav .nav-tab[data-tab-target="tactics"]');
  if (scoutingTab) {
    scoutingTab.hidden = false;
    scoutingTab.dataset.tabTarget = "historygo";
    scoutingTab.dataset.navModes = "league";
    scoutingTab.classList.remove("nav-tab-club");
    scoutingTab.classList.add("nav-tab-scouting");
    const label = scoutingTab.querySelector(".nav-label");
    if (label) label.textContent = "Speiding";
    const icon = scoutingTab.querySelector(".nav-icon");
    if (icon) icon.outerHTML = scoutingIcon();
    if (lagTab && lagTab.nextElementSibling !== scoutingTab) lagTab.after(scoutingTab);
    scoutingTab.addEventListener("click", () => queueMicrotask(() => showScoutingTarget("historygo")));
  }

  const historySection = document.querySelector('[data-tab-section="historygo"]');
  if (historySection) historySection.dataset.tabParent = "historygo";

  const subnav = document.getElementById("appSubnav");
  if (!subnav) return;
  const recruitable = subnav.querySelector('.app-subtab[data-tab-target="historygo"]');
  if (recruitable) {
    recruitable.dataset.subnavParent = "historygo";
    recruitable.textContent = "Rekrutterbare";
    recruitable.classList.remove("office-subnav-proxy");
    recruitable.addEventListener("click", () => queueMicrotask(() => showScoutingTarget("historygo")));
  }
  let clubs = subnav.querySelector(`.app-subtab[data-tab-target="${CLUBS_SECTION}"]`);
  if (!clubs) {
    clubs = node("button", "app-subtab", "Andre klubber");
    clubs.type = "button";
    clubs.setAttribute("role", "tab");
    clubs.dataset.subnavParent = "historygo";
    clubs.dataset.tabTarget = CLUBS_SECTION;
    clubs.setAttribute("aria-selected", "false");
    recruitable?.after(clubs);
  }
  clubs.addEventListener("click", () => showScoutingTarget(CLUBS_SECTION));
}

function syncScoutingLocation() {
  const active = document.querySelector('[data-tab-section]:not([hidden])')?.dataset.tabSection;
  if (active !== "historygo" && active !== CLUBS_SECTION) return;
  const location = document.getElementById("managerLocationText");
  if (location) location.textContent = active === "historygo" ? "Speiding · Rekrutterbare" : "Speiding · Andre klubber";
}

function createRecruitableWorkspace() {
  const section = document.querySelector('[data-tab-section="historygo"]');
  if (!section) return null;
  section.classList.add("has-manager-scouting-workspace");
  let workspace = document.getElementById(RECRUITABLE_ID);
  if (workspace) return workspace;
  workspace = node("section", "manager-scouting-surface scouting-recruitable");
  workspace.id = RECRUITABLE_ID;
  workspace.innerHTML = `
    <header class="scouting-head"><div><p class="eyebrow">Speiding · Rekrutterbare</p><h2>Tilgjengelige spillere</h2><p class="muted-text">Spillere du allerede har tilgang til gjennom History Go eller starttroppen. Sammenlign mange her; åpne profilen for å forstå én.</p></div><strong id="scoutingRecruitableCount">0 spillere</strong></header>
    <form id="scoutingRecruitableTools" class="scouting-tools" role="search"><label><span>Søk spiller</span><input id="scoutingRecruitableSearch" type="search" autocomplete="off" placeholder="Navn, rolle eller sted"></label><label><span>Posisjon</span><select id="scoutingRecruitablePosition"><option value="all">Alle posisjoner</option></select></label></form>
    <div class="scouting-table-wrap"><table class="scouting-player-table"><thead><tr><th>Spiller</th><th>Posisjon</th><th>Roller</th><th>Tilgang fra</th><th>Status</th></tr></thead><tbody id="scoutingRecruitableBody"></tbody></table><p id="scoutingRecruitableEmpty" class="scouting-empty" hidden>Ingen tilgjengelige spillere matcher filtrene.</p></div>`;
  section.prepend(workspace);
  const position = workspace.querySelector("#scoutingRecruitablePosition");
  Object.keys(POSITION_ORDER).sort((a, b) => POSITION_ORDER[a] - POSITION_ORDER[b]).forEach((id) => { const option = node("option", "", id); option.value = id; position?.append(option); });
  workspace.querySelector("#scoutingRecruitableTools")?.addEventListener("input", scheduleRender);
  workspace.querySelector("#scoutingRecruitableTools")?.addEventListener("change", scheduleRender);
  return workspace;
}

function createOtherClubsSection() {
  let section = document.querySelector(`[data-tab-section="${CLUBS_SECTION}"]`);
  if (section) return section;
  section = node("div", "tab-section scouting-clubs-view");
  section.dataset.tabSection = CLUBS_SECTION;
  section.dataset.tabParent = "historygo";
  section.hidden = true;
  section.innerHTML = `
    <section class="manager-scouting-surface"><header class="scouting-head"><div><p class="eyebrow">Speiding · Andre klubber</p><h2>Klubbtilknyttede spillere</h2><p class="muted-text">Alle andre klubber i ligapyramiden og spillerne HG-dataene knytter til klubbens stadion. Dette er mulige/historiske kandidater – ikke en påstand om klubbens live 2026-stall.</p></div><strong id="scoutingClubCount">0 klubber</strong></header>
    <form id="scoutingClubTools" class="scouting-tools" role="search"><label><span>Søk klubb</span><input id="scoutingClubSearch" type="search" autocomplete="off" placeholder="Klubb, by eller stadion"></label><label><span>Nivå</span><select id="scoutingClubTier"><option value="all">Alle nivåer</option></select></label></form>
    <div class="scouting-club-layout"><div class="scouting-club-list-wrap"><table class="scouting-club-table"><thead><tr><th>Klubb</th><th>Nivå</th><th>Mulige spillere</th></tr></thead><tbody id="scoutingClubBody"></tbody></table></div><aside id="scoutingClubDetail" class="scouting-club-detail" aria-live="polite"><p class="scouting-empty">Velg en klubb for å se spillerne.</p></aside></div></section>`;
  document.getElementById("app")?.append(section);
  section.querySelector("#scoutingClubTools")?.addEventListener("input", scheduleRender);
  section.querySelector("#scoutingClubTools")?.addEventListener("change", scheduleRender);
  return section;
}

function currentRecruitableRows() {
  if (!runtime) return [];
  return buildRecruitablePlayers({
    players: runtime.players,
    unlockData: runtime.unlocks,
    merits: readStorage(STORAGE.merits, {}),
    visitedPlaceIds: currentHistoryGoPlaceIds()
  });
}

function currentClubRows() {
  if (!runtime) return [];
  const start = readStorage(STORAGE.start, {});
  return buildClubScoutingRows({
    clubs: runtime.clubs,
    players: runtime.players,
    currentClubId: start?.takeoverClubId || null,
    tierNames: runtime.tierNames
  });
}

function playerProfileButton(player, secondary = "") {
  const button = node("button", "scouting-player-link");
  button.type = "button";
  button.append(node("strong", "", player.name || player.id));
  if (secondary) button.append(node("small", "", secondary));
  button.addEventListener("click", () => openPlayerProfile(player.id, true));
  return button;
}

function renderRecruitable() {
  const workspace = createRecruitableWorkspace();
  if (!workspace) return;
  const all = currentRecruitableRows();
  const rows = filterRecruitablePlayers(all, {
    query: workspace.querySelector("#scoutingRecruitableSearch")?.value || "",
    position: workspace.querySelector("#scoutingRecruitablePosition")?.value || "all"
  });
  const count = workspace.querySelector("#scoutingRecruitableCount");
  const body = workspace.querySelector("#scoutingRecruitableBody");
  const empty = workspace.querySelector("#scoutingRecruitableEmpty");
  if (count) count.textContent = `${rows.length} av ${all.length} spillere`;
  if (empty) empty.hidden = rows.length > 0;
  if (!body) return;
  const fragment = document.createDocumentFragment();
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const playerCell = document.createElement("td"); playerCell.append(playerProfileButton(row, row.nationality));
    tr.append(
      playerCell,
      node("td", "scouting-positions", row.naturalPositions.join("/") || "–"),
      node("td", "", row.preferredRoles.length ? row.preferredRoles.map(formatToken).join(" · ") : "–"),
      node("td", "scouting-source", row.sourceLabel),
      node("td", "scouting-status", "Tilgjengelig nå")
    );
    fragment.append(tr);
  });
  body.replaceChildren(fragment);
}

function renderClubDetail(club) {
  const host = document.getElementById("scoutingClubDetail");
  if (!host) return;
  host.replaceChildren();
  const head = node("header", "scouting-club-detail-head");
  head.append(node("p", "eyebrow", club.tierName), node("h3", "", club.name), node("p", "muted-text", [club.city, club.ground].filter(Boolean).join(" · ")));
  host.append(head);
  if (!club.candidates.length) {
    host.append(node("p", "scouting-empty", "Ingen klubbtilknyttede spillere er registrert for denne banen i HG-dataene ennå."));
    return;
  }
  const list = node("div", "scouting-club-player-list");
  club.candidates.forEach((player) => {
    const article = node("article", "scouting-club-player-row");
    const status = clubStatusFor(player, club.homePlaceId);
    article.append(
      playerProfileButton(player, [player.nationality, asArray(player.naturalPositions).join("/")].filter(Boolean).join(" · ")),
      node("span", "scouting-club-status", CLUB_STATUS_LABEL[status] || "Klubbtilknytning")
    );
    list.append(article);
  });
  host.append(list);
}

function renderOtherClubs() {
  const section = createOtherClubsSection();
  const all = currentClubRows();
  const rows = filterClubScoutingRows(all, {
    query: section.querySelector("#scoutingClubSearch")?.value || "",
    tier: section.querySelector("#scoutingClubTier")?.value || "all"
  });
  const tierSelect = section.querySelector("#scoutingClubTier");
  if (tierSelect && tierSelect.options.length === 1) {
    [...new Map(all.map((row) => [row.tier, row.tierName])).entries()].forEach(([id, label]) => { const option = node("option", "", label); option.value = id; tierSelect.append(option); });
  }
  const count = section.querySelector("#scoutingClubCount");
  if (count) count.textContent = `${rows.length} av ${all.length} klubber`;
  const body = section.querySelector("#scoutingClubBody");
  if (!body) return;
  const fragment = document.createDocumentFragment();
  rows.forEach((club) => {
    const tr = document.createElement("tr");
    tr.className = club.id === activeClubId ? "is-active" : "";
    const clubCell = document.createElement("td");
    const button = node("button", "scouting-club-button"); button.type = "button"; button.dataset.clubId = club.id; button.append(node("strong", "", club.name), node("small", "", [club.city, club.ground].filter(Boolean).join(" · "))); button.addEventListener("click", () => { activeClubId = club.id; renderOtherClubs(); }); clubCell.append(button);
    tr.append(clubCell, node("td", "", club.tierName), node("td", "scouting-club-candidate-count", club.candidates.length));
    fragment.append(tr);
  });
  body.replaceChildren(fragment);
  const selected = rows.find((club) => club.id === activeClubId) || rows[0] || null;
  if (selected) { activeClubId = selected.id; renderClubDetail(selected); }
  else { const detail = document.getElementById("scoutingClubDetail"); if (detail) detail.innerHTML = '<p class="scouting-empty">Ingen klubber matcher filtrene.</p>'; }
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    if (!runtime) return;
    renderRecruitable();
    renderOtherClubs();
    syncScoutingLocation();
  });
}

function installLocationGuard() {
  const observer = new MutationObserver(() => queueMicrotask(syncScoutingLocation));
  document.querySelectorAll("[data-tab-section]").forEach((section) => observer.observe(section, { attributes: true, attributeFilter: ["hidden"] }));
}

async function boot() {
  ensureStyles();
  createRecruitableWorkspace();
  createOtherClubsSection();
  installNavigation();
  try {
    const [playersData, unlocks, clubsData] = await Promise.all([loadJson(DATA.players), loadJson(DATA.unlocks), loadJson(DATA.clubs)]);
    runtime = {
      players: asArray(playersData?.players),
      unlocks,
      clubs: asArray(clubsData?.clubs),
      tierNames: Object.fromEntries(asArray(clubsData?.tiers).map((tier) => [tier.id, tier.name || tier.shortName || formatToken(tier.id)]))
    };
    renderRecruitable();
    renderOtherClubs();
    installLocationGuard();
    window.addEventListener("updateProfile", scheduleRender);
    window.addEventListener("storage", scheduleRender);
    syncScoutingLocation();
  } catch (error) {
    console.error("Kunne ikke bygge Speiding", error);
    const empty = document.getElementById("scoutingRecruitableEmpty");
    if (empty) { empty.hidden = false; empty.textContent = "Speiderdata kunne ikke lastes."; }
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
