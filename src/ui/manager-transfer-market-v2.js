import {
  acceptTransferOfferInMerits,
  listRecruitedPlayerForTransfer,
  reconcileTransferMarketInMerits,
  rejectTransferOfferInMerits,
  transferWindowForSeason,
  withdrawRecruitedPlayerFromTransfer
} from "../football-transfer-market.js";
import { LEAGUE_SEASON_VERSION } from "../football-league-season.js";
import { migrateModeSessions, persistModeEnvelope } from "../football-mode-sessions.js";

const STYLE_ID = "managerTransferMarketV2Style";
const WORKSPACE_ID = "managerTransferMarketWorkspace";
const STORAGE = Object.freeze({
  merits: "hgfm.teamMerits.v1",
  start: "hgfm.gameStartState.v1",
  leagueSeason: LEAGUE_SEASON_VERSION
});

let runtime = null;
let frame = 0;
let internalWrite = false;
let feedbackState = { message: "", tone: "neutral" };

const asArray = (value) => (Array.isArray(value) ? value : []);
function text(value, fallback = "") { const normalized = String(value ?? "").trim(); return normalized || fallback; }
function node(tag, className = "", value) { const element = document.createElement(tag); if (className) element.className = className; if (value !== undefined) element.textContent = String(value); return element; }
function readJson(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
async function loadJson(url) { const response = await fetch(url); if (!response.ok) throw new Error(`Kunne ikke laste ${url.pathname}: ${response.status}`); return response.json(); }

function isLeagueMode() {
  return text(readJson(STORAGE.start, {})?.selectedMode, "league") === "league";
}

function leagueSeason() {
  return readJson(STORAGE.leagueSeason, null) || {
    seasonNumber: 1,
    currentRound: 1,
    status: "active",
    competition: { rounds: 30 },
    clubs: [],
    managerClubId: null
  };
}

function syncModeEnvelope(merits) {
  try {
    const envelope = migrateModeSessions(localStorage);
    if (envelope.activeMode !== "league") return;
    envelope.sessions.league = { ...envelope.sessions.league, teamMerits: merits };
    persistModeEnvelope(localStorage, envelope);
  } catch (_) {
    // teamMerits remains canonical if an old envelope cannot be migrated.
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

function setFeedback(message, tone = "neutral") {
  feedbackState = { message: String(message || ""), tone };
  const target = document.getElementById("managerTransferFeedback");
  if (target) {
    target.textContent = feedbackState.message;
    target.dataset.tone = feedbackState.tone;
  }
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-transfer-market-v2.css", import.meta.url).href;
  document.head.append(link);
}

function ensureWorkspace() {
  const economy = document.getElementById("managerEconomyWorkspace");
  if (!economy) return null;
  let workspace = document.getElementById(WORKSPACE_ID);
  if (!workspace) {
    workspace = node("section", "manager-transfer-market-v2");
    workspace.id = WORKSPACE_ID;
    workspace.setAttribute("aria-live", "polite");
    economy.after(workspace);
  }
  return workspace;
}

function playerName(playerId) {
  return runtime?.playersById?.get(String(playerId))?.name || String(playerId);
}

function actionButton(label, handler, { primary = false, disabled = false, ariaLabel = null } = {}) {
  const button = node("button", `transfer-action${primary ? " transfer-action-primary" : ""}`, label);
  button.type = "button";
  button.disabled = disabled;
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", handler);
  return button;
}

function handleResult(result, action, playerId) {
  setFeedback(result.reason, result.changed ? "positive" : "attention");
  if (result.changed) writeMerits(result.merits, { action, playerId });
  scheduleRender();
}

function contractCard(playerId, contract, market, season, windowState) {
  const card = node("article", "transfer-player-card");
  card.dataset.transferPlayer = playerId;
  const header = node("div", "transfer-player-head");
  const titleWrap = node("div");
  titleWrap.append(node("strong", "", playerName(playerId)), node("small", "", `${contract.remainingSeasons} sesong${contract.remainingSeasons === 1 ? "" : "er"} igjen · ${contract.wageUnits} lønnsenheter`));
  const listed = market.listedPlayerIds.includes(playerId);
  header.append(titleWrap, node("span", `transfer-status ${listed ? "is-listed" : ""}`, listed ? "Tilgjengelig for bud" : "Ikke listet"));
  card.append(header);

  const offer = market.offers[playerId];
  if (offer) {
    const offerBox = node("div", "transfer-offer");
    offerBox.append(
      node("span", "", "Bud mottatt"),
      node("strong", "", `${offer.bidderClubName} · ${offer.amount} klubbmidler`),
      node("small", "", "HGFM-spillbud – ikke historisk overgangssum eller markedsverdi.")
    );
    const actions = node("div", "transfer-actions");
    actions.append(
      actionButton("Godta bud", () => handleResult(acceptTransferOfferInMerits(readJson(STORAGE.merits, {}), playerId, season), "transfer-accept", playerId), { primary: true, ariaLabel: `Godta bud på ${playerName(playerId)}` }),
      actionButton("Avslå", () => handleResult(rejectTransferOfferInMerits(readJson(STORAGE.merits, {}), playerId, season), "transfer-reject", playerId), { ariaLabel: `Avslå bud på ${playerName(playerId)}` })
    );
    card.append(offerBox, actions);
    return card;
  }

  const actions = node("div", "transfer-actions");
  if (listed) {
    const declinedThisWindow = market.closedOfferKeys.includes(`${windowState.key}:${playerId}`);
    card.append(node("p", "transfer-player-note", declinedThisWindow ? "Budet i dette vinduet er avslått. Ny interesse kan komme i neste vindu." : "Spilleren er gjort tilgjengelig. Markedet søker etter interesse i dette vinduet."));
    actions.append(actionButton("Ta av markedet", () => handleResult(withdrawRecruitedPlayerFromTransfer(readJson(STORAGE.merits, {}), playerId, season), "transfer-withdraw", playerId), { ariaLabel: `Ta ${playerName(playerId)} av markedet` }));
  } else {
    actions.append(actionButton("Gjør tilgjengelig", () => handleResult(listRecruitedPlayerForTransfer(readJson(STORAGE.merits, {}), playerId, season), "transfer-list", playerId), {
      primary: true,
      disabled: !windowState.open,
      ariaLabel: `Gjør ${playerName(playerId)} tilgjengelig for bud`
    }));
  }
  card.append(actions);
  return card;
}

function renderWorkspace() {
  if (!runtime || !isLeagueMode()) return;
  const workspace = ensureWorkspace();
  if (!workspace) return;
  const merits = readJson(STORAGE.merits, {});
  const season = leagueSeason();
  const windowState = transferWindowForSeason(season);
  const market = reconcileTransferMarketInMerits(merits, season).market;
  const contracts = merits?.clubEconomy?.contracts && typeof merits.clubEconomy.contracts === "object" ? merits.clubEconomy.contracts : {};
  const recruitedIds = asArray(merits?.recruitedPlayerIds).map(String).filter((id) => contracts[id]);

  workspace.replaceChildren();
  const heading = node("div", "transfer-market-head");
  const titleWrap = node("div");
  titleWrap.append(node("span", "transfer-eyebrow", "Overgangsmarked v2"), node("h4", "", "Utgående spillere og bud"));
  const badge = node("span", `transfer-window-badge ${windowState.open ? "is-open" : "is-closed"}`, windowState.open ? "Vindu åpent" : "Vindu stengt");
  heading.append(titleWrap, badge);

  const status = node("p", "transfer-window-text", windowState.open
    ? `${windowState.label}. Nye signeringer og spillersalg kan gjennomføres nå.`
    : `${windowState.label}. ${windowState.nextLabel || "Ingen overganger kan gjennomføres nå."}`);
  const disclaimer = node("p", "transfer-disclaimer", "Bud og beløp er HGFM-spillverdier. De er ikke historiske overgangssummer, markedsverdier eller påstander om ekte klubbers økonomi.");
  const feedback = node("p", "transfer-feedback", feedbackState.message);
  feedback.id = "managerTransferFeedback";
  feedback.dataset.tone = feedbackState.tone;
  feedback.setAttribute("role", "status");

  const list = node("div", "transfer-player-list");
  if (!recruitedIds.length) {
    list.append(node("p", "transfer-empty", "Ingen rekrutterte spillere kan selges ennå. Starttroppen er fortsatt et fast spillbarhetsgulv i v2."));
  } else {
    recruitedIds.forEach((playerId) => list.append(contractCard(playerId, contracts[playerId], market, season, windowState)));
  }

  workspace.append(heading, status, disclaimer, feedback, list);
}

function reconcileAndRender() {
  if (!runtime || !isLeagueMode()) return;
  const merits = readJson(STORAGE.merits, {});
  const result = reconcileTransferMarketInMerits(merits, leagueSeason());
  if (result.changed) writeMerits(result.merits, { action: "transfer-reconcile" });
  scheduleRender();
}

function transferWindowRecruitmentGate(event) {
  if (!runtime || !isLeagueMode()) return;
  const target = event.target instanceof Element ? event.target.closest("[data-recruit-player]") : null;
  if (!target) return;
  const windowState = transferWindowForSeason(leagueSeason());
  if (windowState.open) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const scoutingFeedback = document.getElementById("scoutingRecruitmentFeedback");
  if (scoutingFeedback) scoutingFeedback.textContent = `Kan ikke hente spilleren: overgangsvinduet er stengt. ${windowState.nextLabel || ""}`.trim();
  setFeedback(`Overgangsvinduet er stengt. ${windowState.nextLabel || ""}`.trim(), "attention");
}

function scheduleRender() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = 0;
    renderWorkspace();
  });
}

function installSeasonGuard() {
  const target = document.getElementById("seasonCommand") || document.getElementById("leagueSeasonPanel");
  if (!target) return;
  const observer = new MutationObserver(() => queueMicrotask(reconcileAndRender));
  observer.observe(target, { childList: true, subtree: true, characterData: true });
}

async function boot() {
  ensureStyles();
  try {
    const data = await loadJson(new URL("../../data/football_players.json", import.meta.url));
    const players = asArray(data?.players);
    runtime = { playersById: new Map(players.map((player) => [String(player.id), player])) };
    document.addEventListener("click", transferWindowRecruitmentGate, true);
    window.addEventListener("hgfm:team-merits-changed", () => { if (!internalWrite) reconcileAndRender(); });
    window.addEventListener("storage", reconcileAndRender);
    window.addEventListener("updateProfile", reconcileAndRender);
    installSeasonGuard();
    reconcileAndRender();
  } catch (error) {
    console.error("Kunne ikke bygge overgangsmarked v2", error);
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
