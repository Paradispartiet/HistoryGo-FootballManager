import { buildStarterSquadPlayerIds } from "../football-recruitment.js";
import {
  RECRUIT_CONTRACT,
  canRecruitWithEconomy,
  initializeClubEconomyInMerits,
  releaseRecruitmentContractInMerits,
  renewRecruitmentContractInMerits,
  settleClubEconomySeasonInMerits,
  signRecruitmentContractInMerits,
  summarizeClubEconomy
} from "../football-club-economy.js";
import { LEAGUE_SEASON_VERSION } from "../football-league-season.js";
import { migrateModeSessions, persistModeEnvelope } from "../football-mode-sessions.js";

const STYLE_ID = "managerEconomyContractsV1Style";
const WORKSPACE_ID = "managerEconomyWorkspace";

const DATA = Object.freeze({
  players: new URL("../../data/football_players.json", import.meta.url),
  unlocks: new URL("../../data/football_unlocks.json", import.meta.url),
  clubs: new URL("../../data/football_clubs.json", import.meta.url)
});

const STORAGE = Object.freeze({
  merits: "hgfm.teamMerits.v1",
  start: "hgfm.gameStartState.v1",
  leagueSeason: LEAGUE_SEASON_VERSION
});

let runtime = null;
let renderFrame = 0;
let internalWrite = false;

const asArray = (value) => (Array.isArray(value) ? value : []);
function text(value, fallback = "") { const normalized = String(value ?? "").trim(); return normalized || fallback; }
function node(tag, className = "", value) { const element = document.createElement(tag); if (className) element.className = className; if (value !== undefined) element.textContent = String(value); return element; }
function readJson(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
async function loadJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}: ${response.status}`); return response.json(); }

function isLeagueMode() {
  return text(readJson(STORAGE.start, {})?.selectedMode, "league") === "league";
}

function currentContext() {
  const start = readJson(STORAGE.start, {});
  const league = readJson(STORAGE.leagueSeason, null);
  const takeoverClub = runtime?.clubsById?.get(String(start?.takeoverClubId || "")) || null;
  return {
    tierId: text(league?.tier?.id || league?.competition?.tierId || takeoverClub?.tier, "obosligaen"),
    seasonNumber: Math.max(1, Math.trunc(Number(league?.seasonNumber)) || 1)
  };
}

function baseSquadPlayerIds(merits = readJson(STORAGE.merits, {})) {
  const local = asArray(merits?.localStart?.playerIds).map(String).filter(Boolean);
  if (local.length) return [...new Set(local)];
  return buildStarterSquadPlayerIds(runtime?.players || [], runtime?.starterCandidateIds || [], 15);
}

function syncModeEnvelope(merits) {
  try {
    const envelope = migrateModeSessions(localStorage);
    if (envelope.activeMode !== "league") return;
    envelope.sessions.league = { ...envelope.sessions.league, teamMerits: merits };
    persistModeEnvelope(localStorage, envelope);
  } catch (_) {
    // Legacy teamMerits-write below remains the best-effort save path.
  }
}

function writeMerits(merits, detail = {}) {
  try {
    internalWrite = true;
    localStorage.setItem(STORAGE.merits, JSON.stringify(merits));
    syncModeEnvelope(merits);
    window.dispatchEvent(new CustomEvent("hgfm:team-merits-changed", { detail }));
    return true;
  } catch (_) {
    return false;
  } finally {
    internalWrite = false;
  }
}

function playerName(playerId) {
  return runtime?.playersById?.get(String(playerId))?.name || String(playerId);
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-economy-contracts-v1.css", import.meta.url).href;
  document.head.append(link);
}

function ensureWorkspace() {
  const note = document.getElementById("adminEconomyNote");
  const article = note?.closest("article");
  if (!article) return null;
  let workspace = document.getElementById(WORKSPACE_ID);
  if (!workspace) {
    workspace = node("div", "manager-economy-workspace-v1");
    workspace.id = WORKSPACE_ID;
    workspace.setAttribute("aria-live", "polite");
    note.after(workspace);
  }
  article.querySelector(".board-future-note")?.setAttribute("hidden", "");
  if (note) note.textContent = "HGFM-spilløkonomi og save-kontrakter. Tallene er spillverdier, ikke historiske lønninger eller virkelige avtaler.";
  return workspace;
}

function metric(label, value, detail = "") {
  const card = node("article", "economy-metric");
  card.append(node("span", "", label), node("strong", "", value));
  if (detail) card.append(node("small", "", detail));
  return card;
}

function contractStatus(contract) {
  if (contract.source === "legacy") return "Overgangsavtale fra eldre save";
  if (contract.remainingSeasons <= 1) return "Utløper etter sesongen";
  return `${contract.remainingSeasons} sesonger igjen`;
}

function contractActions(playerId, contract, context, baseSquadCount) {
  const host = node("div", "economy-contract-actions");
  const renew = node("button", "economy-action economy-action-primary", "Forny");
  renew.type = "button";
  renew.dataset.economyRenew = playerId;
  renew.disabled = contract.remainingSeasons > 1;
  renew.title = contract.remainingSeasons > 1 ? "Fornyelse åpnes når én sesong gjenstår." : `Forny for ${RECRUIT_CONTRACT.renewalCost} klubbmidler.`;
  renew.addEventListener("click", () => {
    const merits = readJson(STORAGE.merits, {});
    const result = renewRecruitmentContractInMerits(merits, playerId, { ...context, baseSquadCount });
    setFeedback(result.reason, result.changed ? "positive" : "attention");
    if (result.changed) writeMerits(result.merits, { action: "economy-renew", playerId });
    scheduleRender();
  });

  const release = node("button", "economy-action", "Frigi");
  release.type = "button";
  release.dataset.economyRelease = playerId;
  release.addEventListener("click", () => {
    const merits = readJson(STORAGE.merits, {});
    const result = releaseRecruitmentContractInMerits(merits, playerId, context);
    setFeedback(result.reason, result.changed ? "positive" : "attention");
    if (result.changed) writeMerits(result.merits, { action: "economy-release", playerId });
    scheduleRender();
  });
  host.append(renew, release);
  return host;
}

function setFeedback(message, tone = "neutral") {
  const feedback = document.getElementById("managerEconomyFeedback");
  if (!feedback) return;
  feedback.textContent = message || "";
  feedback.dataset.tone = tone;
}

function renderWorkspace() {
  if (!runtime || !isLeagueMode()) return;
  const workspace = ensureWorkspace();
  if (!workspace) return;
  const merits = readJson(STORAGE.merits, {});
  const context = currentContext();
  const baseIds = baseSquadPlayerIds(merits);
  const initialized = initializeClubEconomyInMerits(merits, { ...context, recruitedPlayerIds: merits?.recruitedPlayerIds });
  const summary = summarizeClubEconomy(initialized.economy, { ...context, baseSquadCount: baseIds.length });
  const contracts = Object.values(summary.economy.contracts)
    .sort((a, b) => a.remainingSeasons - b.remainingSeasons || playerName(a.playerId).localeCompare(playerName(b.playerId), "nb"));

  workspace.replaceChildren();
  const disclaimer = node("p", "economy-disclaimer", "Spilløkonomi: ingen av beløpene nedenfor er påstander om virkelige spillerlønninger, overgangssummer eller kontrakter.");
  const metrics = node("div", "economy-metrics");
  metrics.append(
    metric("Klubbmidler", String(summary.balance), `+ sesongramme på nivå ${context.tierId}`),
    metric("Lønnsramme", `${summary.wageUsed}/${summary.wageBudget}`, `${summary.wageAvailable} ledig`),
    metric("Grunntropp", `${baseIds.length} spillere`, `${summary.baseWages} lønnsenheter`),
    metric("Rekrutteringsavtaler", String(summary.activeContractCount), `${summary.contractWages} lønnsenheter`)
  );

  const deal = node("div", "economy-standard-deal");
  deal.append(
    node("strong", "", "Standardavtale for ny rekruttering"),
    node("span", "", `${RECRUIT_CONTRACT.signingCost} klubbmidler · ${RECRUIT_CONTRACT.wageUnits} lønnsenheter · ${RECRUIT_CONTRACT.seasons} sesonger`)
  );
  const feedback = node("p", "economy-feedback", "");
  feedback.id = "managerEconomyFeedback";
  feedback.setAttribute("role", "status");

  const section = node("section", "economy-contracts");
  section.append(node("h4", "", "Spilleravtaler"));
  if (!contracts.length) {
    section.append(node("p", "economy-empty", "Ingen rekrutteringsavtaler ennå. Grunntroppen ligger innenfor klubbens faste ramme i v1."));
  } else {
    const wrap = node("div", "economy-contract-table-wrap");
    const table = document.createElement("table");
    table.className = "economy-contract-table";
    table.innerHTML = "<thead><tr><th>Spiller</th><th>Avtale</th><th>Lønn</th><th>Handling</th></tr></thead>";
    const body = document.createElement("tbody");
    contracts.forEach((contract) => {
      const row = document.createElement("tr");
      row.dataset.contractPlayer = contract.playerId;
      row.append(
        node("td", "economy-contract-player", playerName(contract.playerId)),
        node("td", contract.remainingSeasons <= 1 ? "is-expiring" : "", contractStatus(contract)),
        node("td", "", `${contract.wageUnits} enheter`)
      );
      const actionCell = document.createElement("td");
      actionCell.append(contractActions(contract.playerId, contract, context, baseIds.length));
      row.append(actionCell);
      body.append(row);
    });
    table.append(body);
    wrap.append(table);
    section.append(wrap);
  }

  workspace.append(disclaimer, metrics, deal, feedback, section);
}

function reconcileEconomy() {
  if (!runtime || !isLeagueMode()) return;
  const merits = readJson(STORAGE.merits, {});
  const context = currentContext();
  const initialized = initializeClubEconomyInMerits(merits, { ...context, recruitedPlayerIds: merits?.recruitedPlayerIds });
  const settled = settleClubEconomySeasonInMerits(initialized.merits, context.seasonNumber, { tierId: context.tierId });
  const changed = initialized.changed || settled.changed;
  if (changed) {
    writeMerits(settled.merits, {
      action: "economy-reconcile",
      expiredPlayerIds: settled.expiredPlayerIds || []
    });
  }
}

function recruitmentGate(event) {
  if (!runtime || !isLeagueMode()) return;
  const target = event.target instanceof Element ? event.target.closest("[data-recruit-player]") : null;
  if (!target) return;
  const playerId = text(target.dataset.recruitPlayer);
  if (!playerId) return;
  const merits = readJson(STORAGE.merits, {});
  const context = currentContext();
  const initialized = initializeClubEconomyInMerits(merits, { ...context, recruitedPlayerIds: merits?.recruitedPlayerIds });
  const gate = canRecruitWithEconomy(initialized.economy, { ...context, baseSquadCount: baseSquadPlayerIds(merits).length });
  if (gate.allowed) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const scoutingFeedback = document.getElementById("scoutingRecruitmentFeedback");
  if (scoutingFeedback) scoutingFeedback.textContent = `Kan ikke hente spilleren: ${gate.reason}`;
  setFeedback(gate.reason, "attention");
}

function onTeamMeritsChanged(event) {
  if (!runtime || !isLeagueMode() || internalWrite) return;
  const action = event?.detail?.action;
  if (action === "recruit" && event.detail.playerId) {
    const playerId = String(event.detail.playerId);
    const merits = readJson(STORAGE.merits, {});
    const context = currentContext();
    const result = signRecruitmentContractInMerits(merits, playerId, {
      ...context,
      baseSquadCount: baseSquadPlayerIds(merits).length
    });
    if (result.changed && writeMerits(result.merits, { action: "economy-contract", playerId })) {
      const scoutingFeedback = document.getElementById("scoutingRecruitmentFeedback");
      if (scoutingFeedback) scoutingFeedback.textContent = `${playerName(playerId)} er hentet på en ${RECRUIT_CONTRACT.seasons}-sesongers HGFM-avtale.`;
    }
  }
  scheduleRender();
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderWorkspace();
  });
}

async function boot() {
  ensureStyles();
  try {
    const [playersData, unlocks, clubsData] = await Promise.all([
      loadJson(DATA.players),
      loadJson(DATA.unlocks),
      loadJson(DATA.clubs)
    ]);
    const players = asArray(playersData?.players);
    const starterCandidateIds = new Set();
    asArray(unlocks?.placeUnlocks).forEach((place) => {
      if (text(place?.placeRole).includes("national")) return;
      asArray(place?.unlocks).forEach((unlock) => {
        if (unlock?.type === "player_candidate" && unlock?.targetId) starterCandidateIds.add(String(unlock.targetId));
      });
    });
    runtime = {
      players,
      playersById: new Map(players.map((player) => [String(player.id), player])),
      clubsById: new Map(asArray(clubsData?.clubs).map((club) => [String(club.id), club])),
      starterCandidateIds: [...starterCandidateIds]
    };
    document.addEventListener("click", recruitmentGate, true);
    window.addEventListener("hgfm:team-merits-changed", onTeamMeritsChanged);
    window.addEventListener("storage", scheduleRender);
    reconcileEconomy();
    renderWorkspace();
  } catch (error) {
    console.error("Kunne ikke bygge økonomi og kontrakter", error);
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
