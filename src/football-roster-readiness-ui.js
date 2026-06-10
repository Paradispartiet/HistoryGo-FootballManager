// src/football-roster-readiness-ui.js
//
// Additivt UI-lag for benk og 15-spillerkrav.
// Leser samme datakilder som managerappen, men endrer ikke app.js, unlockmotor,
// lagfit, innboks, badges eller History Go-sync. Målet er å gjøre regelen synlig:
// Du må ha minst 15 opplåste spillere for å starte manager-/kampdelen.

const DATA_PATHS = {
  players: "data/football_players.json",
  unlocks: "data/football_unlocks.json",
  teamMerits: "data/football_team_merits.example.json"
};

const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
const HISTORY_GO_VISITED_PLACES_KEY = "visited_places";
const HISTORY_GO_GROUNDHOPPER_STATS_KEY = "hg_groundhopper_stats_v1";
const REQUIRED_SQUAD_SIZE = 15;
const REQUIRED_STARTERS = 11;
const REQUIRED_BENCH = 4;

const state = {
  players: [],
  unlocks: { placeUnlocks: [] },
  teamMeritsSeed: null,
  ready: false,
  scheduled: false
};

function ensureRosterReadinessStyles() {
  if (document.querySelector("#rosterReadinessStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "rosterReadinessStyles";
  style.textContent = `
    .roster-readiness-panel {
      display: grid;
      gap: 16px;
    }

    .roster-readiness-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
    }

    .roster-readiness-head h2,
    .roster-readiness-panel h3 {
      margin: 0;
    }

    .roster-readiness-badge {
      flex: 0 0 auto;
      border: 2px solid var(--line);
      border-radius: 999px;
      background: #000000;
      color: var(--text);
      font-size: 0.85rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 8px 14px;
    }

    .roster-readiness-badge[data-ready="true"] {
      border-color: var(--good);
      color: var(--good);
    }

    .bench-player-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
    }

    .bench-player-card {
      display: grid;
      gap: 4px;
      border: 2px solid var(--line-soft);
      border-radius: 10px;
      background: var(--panel-strong);
      padding: 12px 14px;
    }

    .bench-player-card.is-registered {
      border-color: var(--line);
    }

    .bench-player-card strong {
      color: var(--text);
      font-size: 1rem;
      line-height: 1.2;
    }

    .bench-player-card span {
      color: var(--muted);
      font-size: 0.88rem;
      line-height: 1.3;
    }

    .bench-empty,
    .roster-readiness-note {
      margin: 0;
    }

    @media (max-width: 760px) {
      .roster-readiness-head {
        display: grid;
      }

      .roster-readiness-badge {
        width: fit-content;
      }
    }
  `;
  document.head.append(style);
}

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Kunne ikke laste ${path}`);
  }

  return response.json();
}

function readJsonLocalStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function getStoredTeamMerits() {
  const stored = readJsonLocalStorage(TEAM_MERITS_KEY, null);
  return stored && typeof stored === "object" && !Array.isArray(stored)
    ? stored
    : state.teamMeritsSeed;
}

function getHistoryGoVisitedPlaceIds() {
  const raw = readJsonLocalStorage(HISTORY_GO_VISITED_PLACES_KEY, null);
  const ids = new Set();

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return ids;
  }

  Object.entries(raw).forEach(([placeId, value]) => {
    if (placeId && value) {
      ids.add(placeId);
    }
  });

  return ids;
}

function getHistoryGoGroundhopperPlaceIds() {
  const raw = readJsonLocalStorage(HISTORY_GO_GROUNDHOPPER_STATS_KEY, null);
  const ids = new Set();

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return ids;
  }

  if (Array.isArray(raw.visited_groundhopper_places)) {
    raw.visited_groundhopper_places.forEach((placeId) => {
      if (typeof placeId === "string" && placeId) {
        ids.add(placeId);
      }
    });
  }

  return ids;
}

function getKnownPlaceIds() {
  return new Set(
    (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : [])
      .map((place) => place?.placeId)
      .filter(Boolean)
  );
}

function getUnlockedPlaceIds() {
  const ids = new Set();
  const teamMerits = getStoredTeamMerits();

  (Array.isArray(teamMerits?.unlockedPlaceIds) ? teamMerits.unlockedPlaceIds : [])
    .filter((placeId) => typeof placeId === "string" && placeId)
    .forEach((placeId) => ids.add(placeId));

  const knownPlaceIds = getKnownPlaceIds();
  getHistoryGoVisitedPlaceIds().forEach((placeId) => {
    if (knownPlaceIds.has(placeId)) {
      ids.add(placeId);
    }
  });
  getHistoryGoGroundhopperPlaceIds().forEach((placeId) => {
    if (knownPlaceIds.has(placeId)) {
      ids.add(placeId);
    }
  });

  return ids;
}

function isPlayerUnlockType(type) {
  return typeof type === "string" && (type === "player_candidate" || /player/i.test(type));
}

function getUnlockedPlayers() {
  const unlockedPlaceIds = getUnlockedPlaceIds();
  const playerIds = new Set();

  (Array.isArray(state.unlocks?.placeUnlocks) ? state.unlocks.placeUnlocks : []).forEach((place) => {
    if (!place || !unlockedPlaceIds.has(place.placeId)) {
      return;
    }

    (Array.isArray(place.unlocks) ? place.unlocks : []).forEach((unlock) => {
      if (unlock && isPlayerUnlockType(unlock.type) && unlock.targetId) {
        playerIds.add(unlock.targetId);
      }
    });
  });

  const byId = new Map(
    state.players
      .filter((player) => player && player.id)
      .map((player) => [player.id, player])
  );

  return [...playerIds].map((playerId) => byId.get(playerId)).filter(Boolean);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getStartingPlayerNames() {
  const names = new Set();

  [...document.querySelectorAll("#lineupSlots .player-chip .chip-name")].forEach((node) => {
    const name = normalizeText(node.textContent);
    if (name && name !== "tom plass") {
      names.add(name);
    }
  });

  return names;
}

function getRosterStatus() {
  const unlockedPlayers = getUnlockedPlayers();
  const startingNames = getStartingPlayerNames();
  const starters = unlockedPlayers.filter((player) => startingNames.has(normalizeText(player.name)));
  const benchCandidates = unlockedPlayers.filter((player) => !startingNames.has(normalizeText(player.name)));

  const unlockedCount = unlockedPlayers.length;
  const starterCount = starters.length;
  const benchCount = benchCandidates.length;
  const hasEnoughUnlocked = unlockedCount >= REQUIRED_SQUAD_SIZE;
  const hasCompleteXi = starterCount >= REQUIRED_STARTERS;
  const hasEnoughBench = benchCount >= REQUIRED_BENCH;

  return {
    unlockedPlayers,
    starters,
    benchCandidates,
    unlockedCount,
    starterCount,
    benchCount,
    hasEnoughUnlocked,
    hasCompleteXi,
    hasEnoughBench,
    isReady: hasEnoughUnlocked && hasCompleteXi && hasEnoughBench,
    missingUnlocked: Math.max(0, REQUIRED_SQUAD_SIZE - unlockedCount),
    missingStarters: Math.max(0, REQUIRED_STARTERS - starterCount),
    missingBench: Math.max(0, REQUIRED_BENCH - benchCount)
  };
}

function ensureTopbarMetric() {
  if (document.querySelector("#rosterReadyCount")) {
    return;
  }

  const topbarMetrics = document.querySelector(".topbar-metrics");
  if (!topbarMetrics) {
    return;
  }

  const article = document.createElement("article");
  article.className = "topbar-metric-roster";

  const label = document.createElement("span");
  label.textContent = "Tropp";

  const value = document.createElement("strong");
  value.id = "rosterReadyCount";
  value.textContent = "0/15";

  article.append(label, value);
  topbarMetrics.append(article);
}

function ensureRosterPanel() {
  if (document.querySelector("#rosterReadinessPanel")) {
    return;
  }

  const decisionStrip = document.querySelector(".decision-strip");
  const office = document.querySelector('[data-tab-section="team"]');
  if (!decisionStrip || !office) {
    return;
  }

  const panel = document.createElement("section");
  panel.id = "rosterReadinessPanel";
  panel.className = "panel roster-readiness-panel";
  panel.setAttribute("aria-live", "polite");

  const head = document.createElement("div");
  head.className = "roster-readiness-head";

  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Tropp og benk";
  const title = document.createElement("h2");
  title.textContent = "Krav: 15 spillere";
  const text = document.createElement("p");
  text.className = "muted-text";
  text.textContent = "Du må ha 11 spillere i startelleveren og minst 4 benkespillere før manager-/kampdelen kan starte.";
  copy.append(eyebrow, title, text);

  const badge = document.createElement("div");
  badge.id = "rosterReadinessBadge";
  badge.className = "roster-readiness-badge";
  badge.textContent = "Låst";

  head.append(copy, badge);

  const metrics = document.createElement("div");
  metrics.className = "metric-grid roster-readiness-metrics";
  metrics.innerHTML = `
    <article><span>Opplåst</span><strong id="rosterUnlockedCount">0/15</strong></article>
    <article><span>Startellever</span><strong id="rosterStarterCount">0/11</strong></article>
    <article><span>Benk</span><strong id="rosterBenchCount">0/4</strong></article>
    <article><span>Status</span><strong id="rosterReadyStatus">Låst</strong></article>
  `;

  const benchTitle = document.createElement("h3");
  benchTitle.textContent = "Benk";

  const benchList = document.createElement("div");
  benchList.id = "benchPlayersList";
  benchList.className = "bench-player-list";

  const note = document.createElement("p");
  note.id = "rosterReadinessNote";
  note.className = "muted-text roster-readiness-note";
  note.textContent = "Samle flere spillere via History Go-steder.";

  panel.append(head, metrics, benchTitle, benchList, note);
  office.insertBefore(panel, decisionStrip);
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function renderBenchList(players) {
  const list = document.querySelector("#benchPlayersList");
  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (players.length === 0) {
    const empty = document.createElement("p");
    empty.className = "bench-empty muted-text";
    empty.textContent = "Ingen benkespillere tilgjengelig ennå.";
    list.append(empty);
    return;
  }

  players.slice(0, Math.max(REQUIRED_BENCH, 8)).forEach((player, index) => {
    const card = document.createElement("article");
    card.className = index < REQUIRED_BENCH ? "bench-player-card is-registered" : "bench-player-card";

    const name = document.createElement("strong");
    name.textContent = player.name || player.id;

    const meta = document.createElement("span");
    const positions = Array.isArray(player.naturalPositions) ? player.naturalPositions.join(", ") : "–";
    meta.textContent = `${positions} · ${Number.isFinite(player.overall) ? player.overall : "–"}`;

    card.append(name, meta);
    list.append(card);
  });
}

function renderRosterReadiness() {
  ensureRosterReadinessStyles();
  ensureTopbarMetric();
  ensureRosterPanel();

  if (!state.ready) {
    setText("#rosterReadyCount", "–/15");
    return;
  }

  const status = getRosterStatus();
  setText("#rosterReadyCount", `${status.unlockedCount}/${REQUIRED_SQUAD_SIZE}`);
  setText("#rosterUnlockedCount", `${status.unlockedCount}/${REQUIRED_SQUAD_SIZE}`);
  setText("#rosterStarterCount", `${status.starterCount}/${REQUIRED_STARTERS}`);
  setText("#rosterBenchCount", `${Math.min(status.benchCount, REQUIRED_BENCH)}/${REQUIRED_BENCH}`);
  setText("#rosterReadyStatus", status.isReady ? "Åpen" : "Låst");

  const badge = document.querySelector("#rosterReadinessBadge");
  if (badge) {
    badge.textContent = status.isReady ? "Spillklar" : "Låst";
    badge.dataset.ready = status.isReady ? "true" : "false";
  }

  const noteParts = [];
  if (status.missingUnlocked > 0) {
    noteParts.push(`samle ${status.missingUnlocked} spiller${status.missingUnlocked === 1 ? "" : "e"} til`);
  }
  if (status.missingStarters > 0) {
    noteParts.push(`fyll ${status.missingStarters} plass${status.missingStarters === 1 ? "" : "er"} i startelleveren`);
  }
  if (status.missingBench > 0) {
    noteParts.push(`ha ${status.missingBench} benkespiller${status.missingBench === 1 ? "" : "e"} til`);
  }

  setText(
    "#rosterReadinessNote",
    status.isReady
      ? "Troppen er spillklar: 11 på banen og minst 4 på benken. Neste steg er kampmotor/motstanderprofil."
      : `Ikke spillklar ennå: ${noteParts.join(", ") || "mangler troppsgrunnlag"}.`
  );

  renderBenchList(status.benchCandidates);
}

function scheduleRender() {
  if (state.scheduled) {
    return;
  }

  state.scheduled = true;
  requestAnimationFrame(() => {
    state.scheduled = false;
    renderRosterReadiness();
  });
}

function observeApp() {
  const targets = [document.querySelector("#lineupSlots"), document.querySelector("#unlockPlacesList")].filter(Boolean);
  targets.forEach((target) => {
    const observer = new MutationObserver(() => scheduleRender());
    observer.observe(target, { childList: true, subtree: true, characterData: true });
  });

  ["#formationSelect", "#tacticSelect", "#slotPlayerSelect", "#slotRoleSelect", "#syncHistoryGoPlaces", "#resetHgTeamMerits"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener("click", () => setTimeout(scheduleRender, 0));
      element.addEventListener("change", () => scheduleRender());
    }
  });

  window.addEventListener("storage", (event) => {
    if ([TEAM_MERITS_KEY, HISTORY_GO_VISITED_PLACES_KEY, HISTORY_GO_GROUNDHOPPER_STATS_KEY].includes(event.key)) {
      scheduleRender();
    }
  });
}

async function initRosterReadiness() {
  try {
    ensureRosterReadinessStyles();
    ensureTopbarMetric();
    ensureRosterPanel();

    const [playersData, unlocksData, teamMeritsData] = await Promise.all([
      loadJson(DATA_PATHS.players),
      loadJson(DATA_PATHS.unlocks),
      loadJson(DATA_PATHS.teamMerits).catch(() => null)
    ]);

    state.players = Array.isArray(playersData.players) ? playersData.players : [];
    state.unlocks = unlocksData && typeof unlocksData === "object" ? unlocksData : { placeUnlocks: [] };
    state.teamMeritsSeed = teamMeritsData && typeof teamMeritsData === "object" ? teamMeritsData : null;
    state.ready = true;

    observeApp();
    scheduleRender();
  } catch (error) {
    console.warn("Tropp-/benk-status kunne ikke lastes:", error);
    setText("#rosterReadyStatus", "Feil");
    setText("#rosterReadinessNote", "Tropp-/benk-status kunne ikke lastes.");
  }
}

initRosterReadiness();
