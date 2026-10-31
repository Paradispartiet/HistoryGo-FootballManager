/**
 * Football Manager universe v1 — presentation only.
 *
 * Portal and inbox are read-only projections of the live manager context.
 * Opening a mail hands the precise message back to the canonical calendar
 * drawer, which alone owns read receipts, decisions and game consequences.
 */
import { createClubCommunicationTimeline } from "../football-club-communication.js";

const GAME_START_KEY = "hgfm.gameStartState.v1";
const SECTION_HOME = "universeHome";
const SECTION_INBOX = "universeInbox";
const MAX_PREVIEW = 5;
let selectedId = "";
let activeFilter = "all";
let currentMessages = [];
let refreshPending = false;

function el(tag, className = "", text = "") {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text) item.textContent = String(text);
  return item;
}

function readStart() {
  try { return JSON.parse(localStorage.getItem(GAME_START_KEY) || "{}") || {}; }
  catch { return {}; }
}

function leagueReady() {
  const start = readStart();
  const onboarding = document.getElementById("onboardingScreen");
  return (start.selectedMode || "league") === "league"
    && (Boolean(start.activeLeagueSaveId) || start.leagueSeasonStatus === "active")
    && (localStorage.getItem("hgfm.onboarded.v1") === "1" || Boolean(onboarding?.hidden));
}

function context() {
  const detail = { context: null };
  window.dispatchEvent(new CustomEvent("hgfm:request-club-communication-context", { detail }));
  return detail.context && typeof detail.context === "object" ? detail.context : {};
}

function messages() {
  const source = context();
  const timeline = createClubCommunicationTimeline(source);
  return Array.isArray(timeline?.messages) ? timeline.messages : [];
}

function shortDate(message) {
  const days = ["", "Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  return (days[message.dayIndex] || "Uke") + " · " + (message.time || "");
}

function text(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = String(value || "");
}

function button(label, target, className = "") {
  const item = el("button", className, label);
  item.type = "button";
  item.addEventListener("click", () => navigate(target));
  return item;
}

function activeSection() {
  return document.querySelector('[data-tab-section]:not([hidden])');
}

function showSurface(id) {
  if (!leagueReady()) return;
  const section = document.querySelector('[data-tab-section="' + id + '"]');
  if (!section) return;
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => {
    candidate.hidden = candidate !== section;
  });
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((item) => {
    const active = item.dataset.tabTarget === "dashboard";
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });
  const subnav = document.getElementById("appSubnav");
  if (subnav) subnav.hidden = true;
  section.scrollTop = 0;
  text("managerLocationText", id === SECTION_HOME ? "Hjem · Portal" : "Hjem · Innboks");
  updateNavigation();
  refresh();
}

function navigate(target) {
  if (target === "home") return showSurface(SECTION_HOME);
  if (target === "inbox") return showSurface(SECTION_INBOX);

  // Reuse the original tab click handlers. Never mutate save-state here.
  const parentFor = { squad: "tactics", trening: "tactics",
    board: "dashboard", admin: "dashboard", calendar: "dashboard" };
  const parent = parentFor[target];
  if (parent) {
    document.querySelector('.main-nav .nav-tab[data-tab-target="' + parent + '"]')?.click();
    if (target !== parent) {
      queueMicrotask(() => {
        document.querySelector('.app-subtab[data-tab-target="' + target + '"]')?.click();
      });
    }
    return;
  }
  const main = document.querySelector('.main-nav .nav-tab[data-tab-target="' + target + '"]');
  if (main && !main.hidden) main.click();
}

function openCanonicalMail(message) {
  if (!message?.id) return;
  navigate("calendar");
  // The manager calendar is the authoritative message viewer and reply owner.
  // Select the message's actual day and event ID rather than a generic thread.
  queueMicrotask(() => {
    const day = document.querySelector('#managerCalendarDays [data-day="' + message.dayIndex + '"]');
    day?.click();
    queueMicrotask(() => {
      const exact = Array.from(document.querySelectorAll(
        '#managerCalendarTimeline [data-event-kind="message"]'
      )).find((node) => node.dataset.eventId === message.id);
      exact?.click();
    });
  });
}

function fillCards(host, source, emptyText, limit = source.length) {
  if (!host) return;
  host.replaceChildren();
  if (!source.length) {
    host.append(el("p", "fmuv-empty", emptyText));
    return;
  }
  source.slice(0, limit).forEach((message) => {
    const row = el("button", "fmuv-message");
    row.type = "button";
    row.dataset.messageId = message.id;
    row.dataset.unread = String(!message.isRead);
    const symbol = el("span", "fmuv-message-icon", message.priority === "urgent" || message.priority === "high" ? "!" : "✉");
    const copy = el("span", "fmuv-message-copy");
    copy.append(el("strong", "", message.subject), el("small", "", message.sender?.name || "Klubbkontoret"));
    const time = el("span", "fmuv-message-time", shortDate(message));
    row.append(symbol, copy, time);
    row.addEventListener("click", () => {
      if (host.id === "fmuvHomeMail") showSurface(SECTION_INBOX);
      selectedId = message.id;
      drawInbox();
    });
    host.append(row);
  });
}

function makePanel(title, className, id) {
  const panel = el("section", "fmuv-panel " + className);
  if (id) panel.id = id;
  panel.append(el("h3", "fmuv-panel-title", title));
  return panel;
}

function ensureSections() {
  const app = document.getElementById("app");
  if (!app || document.getElementById("fmuvHome")) return;
  const home = el("div", "tab-section fmuv-screen fmuv-home");
  home.id = "fmuvHome";
  home.dataset.tabSection = SECTION_HOME;
  home.dataset.tabParent = "dashboard";
  home.hidden = true;

  const heading = el("header", "fmuv-screen-heading");
  const titles = el("div");
  titles.append(el("p", "fmuv-eyebrow", "MANAGERKONTORET"),
    el("h2", "", "Hjem"),
    el("p", "fmuv-lede", "Din klubb, neste kamp og de viktigste meldingene."));
  heading.append(titles, button("Åpne innboks", "inbox", "fmuv-primary"));
  home.append(heading);

  const overview = el("div", "fmuv-home-grid");
  const match = makePanel("NESTE KAMP", "fmuv-match", "fmuvHomeMatch");
  match.append(el("p", "fmuv-eyebrow", "Kalender og terminliste"),
    el("strong", "fmuv-match-name", "Ingen kamp oppført"));
  match.querySelector(".fmuv-match-name").id = "fmuvMatchName";
  match.append(el("p", "fmuv-secondary", "Vis terminlisten for flere detaljer."));
  const matchActions = el("div", "fmuv-actions");
  matchActions.append(button("Kampdag", "kamp", "fmuv-primary"),
    button("Laguttak", "tactics", "fmuv-outline"));
  match.append(matchActions);

  const week = makePanel("MANAGERUKA", "fmuv-week");
  week.append(el("strong", "fmuv-large", "Uke 1"),
    el("p", "fmuv-secondary", "Kalenderen eier fremdriften."));
  week.querySelector(".fmuv-large").id = "fmuvWeek";
  const weekAction = button("Åpne kalender", "calendar", "fmuv-outline");
  week.append(weekAction);

  const season = makePanel("SESONGEN", "fmuv-season");
  const seasonFacts = el("dl", "fmuv-season-facts");
  [
    ["Plassering", "fmuvHomeStanding"],
    ["Spilte kamper", "fmuvHomeMatches"],
    ["Mål", "fmuvHomeGoals"]
  ].forEach(([label, id]) => {
    const item = el("div");
    const value = el("dd", "", "–");
    value.id = id;
    item.append(el("dt", "", label), value);
    seasonFacts.append(item);
  });
  season.append(seasonFacts, button("Se tabell og statistikk", "statistikk", "fmuv-outline"));

  const homeInbox = makePanel("INNBOKS", "fmuv-home-inbox");
  const mailHead = el("div", "fmuv-panel-head");
  const unread = el("span", "fmuv-unread", "0 uleste");
  unread.id = "fmuvUnread";
  mailHead.append(unread, button("Se alle", "inbox", "fmuv-text-button"));
  homeInbox.append(mailHead);
  const preview = el("div", "fmuv-message-list");
  preview.id = "fmuvHomeMail";
  homeInbox.append(preview);
  overview.append(match, season, homeInbox, week);
  home.append(overview);

  const quick = makePanel("HURTIGHANDLINGER", "fmuv-shortcuts");
  const quickGrid = el("div", "fmuv-quick-grid");
  [
    ["Tropp", "squad", "Spillere og roller"],
    ["Taktikk", "tactics", "Laguttak og faser"],
    ["Kampdag", "kamp", "Forberedelser"],
    ["Rekruttering", "historygo", "Speiding og spillerpool"],
    ["Klubb", "board", "Klubbdrift"],
    ["Statistikk", "statistikk", "Sesongen"],
    ["Ansatte", "admin", "Stab og drift"]
  ].forEach(([title, target, note]) => {
    const item = button(title, target, "fmuv-quick-action");
    item.append(el("small", "", note));
    quickGrid.append(item);
  });
  quick.append(quickGrid);
  home.append(quick);

  const inbox = el("div", "tab-section fmuv-screen fmuv-inbox");
  inbox.id = "fmuvInbox";
  inbox.dataset.tabSection = SECTION_INBOX;
  inbox.dataset.tabParent = "dashboard";
  inbox.hidden = true;
  const inboxHeading = el("header", "fmuv-screen-heading");
  const inboxTitle = el("div");
  inboxTitle.append(el("p", "fmuv-eyebrow", "KLUBBKOMMUNIKASJON"),
    el("h2", "", "Innboks"),
    el("p", "fmuv-lede", "Les meldingene. Beslutninger og svar håndteres i managerkalenderen."));
  inboxHeading.append(inboxTitle, button("Til hjem", "home", "fmuv-outline"));
  inbox.append(inboxHeading);
  const layout = el("div", "fmuv-inbox-grid");
  const filters = makePanel("MAPPER", "fmuv-filters");
  [
    ["Alle meldinger", "all"], ["Uleste", "unread"], ["Viktige", "important"]
  ].forEach(([label, filter]) => {
    const tab = el("button", "fmuv-filter", label);
    tab.type = "button";
    tab.dataset.filter = filter;
    tab.setAttribute("aria-pressed", String(filter === "all"));
    tab.addEventListener("click", () => {
      activeFilter = filter;
      drawInbox();
    });
    filters.append(tab);
  });
  const list = makePanel("MELDINGER", "fmuv-list-panel");
  const listBody = el("div", "fmuv-message-list");
  listBody.id = "fmuvInboxList";
  list.append(listBody);
  const detail = makePanel("MELDING", "fmuv-detail-panel");
  const detailBody = el("div", "fmuv-detail");
  detailBody.id = "fmuvInboxDetail";
  detail.append(detailBody);
  layout.append(filters, list, detail);
  inbox.append(layout);
  app.append(home, inbox);
}

function ensureHeaderActions() {
  const header = document.querySelector("#clubIdentityHeader .header-inner");
  if (!header || document.getElementById("fmuvHeaderActions")) return;
  const actions = el("nav", "fmuv-header-actions");
  actions.id = "fmuvHeaderActions";
  actions.setAttribute("aria-label", "Hjem og innboks");
  const home = button("Hjem", "home", "fmuv-header-button");
  home.id = "fmuvOpenHome";
  const inbox = button("Innboks", "inbox", "fmuv-header-button");
  inbox.id = "fmuvOpenInbox";
  actions.append(home, inbox);
  header.querySelector("#settingsButton")?.before(actions);
  if (!actions.parentElement) header.append(actions);
}

function updateNavigation() {
  const section = activeSection()?.dataset.tabSection || "";
  document.querySelectorAll("#fmuvHeaderActions button").forEach((item) => {
    const active = section === (item.id === "fmuvOpenHome" ? SECTION_HOME : SECTION_INBOX);
    item.classList.toggle("is-current", active);
    item.setAttribute("aria-current", active ? "page" : "false");
  });
}

function renderHome() {
  const start = readStart();
  const fallbackClub = start.clubName || "Klubben";
  const club = document.getElementById("headerClubName")?.textContent?.trim() || fallbackClub;
  const next = document.getElementById("managerCalendarMatch")?.textContent?.trim();
  const week = document.getElementById("managerCalendarNow")?.textContent?.trim();
  text("fmuvMatchName", next && next !== "Ingen terminfestet kamp" ? next : "Ingen terminfestet kamp");
  text("fmuvWeek", week || "Manageruka");
  text("fmuvHomeStanding", document.getElementById("statsStanding")?.textContent?.trim() || "Ikke startet");
  text("fmuvHomeMatches", document.getElementById("statsMatches")?.textContent?.trim() || "0");
  text("fmuvHomeGoals", document.getElementById("statsGoals")?.textContent?.trim() || "0");
  const unread = currentMessages.filter((item) => !item.isRead).length;
  text("fmuvUnread", unread + " uleste");
  fillCards(document.getElementById("fmuvHomeMail"), currentMessages, "Ingen meldinger ennå.", MAX_PREVIEW);
  const homeHeading = document.querySelector("#fmuvHome .fmuv-lede");
  if (homeHeading) homeHeading.textContent = club + " · neste kamp og de viktigste meldingene.";
}

function drawInbox() {
  const filtered = currentMessages.filter((message) => {
    if (activeFilter === "unread") return !message.isRead;
    if (activeFilter === "important") return ["urgent", "high"].includes(message.priority);
    return true;
  });
  const filters = document.querySelectorAll("#fmuvInbox .fmuv-filter");
  filters.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === activeFilter)));
  fillCards(document.getElementById("fmuvInboxList"), filtered, "Ingen meldinger i denne mappen.");
  const match = filtered.find((message) => message.id === selectedId) || filtered[0];
  const detail = document.getElementById("fmuvInboxDetail");
  if (!detail) return;
  detail.replaceChildren();
  if (!match) {
    detail.append(el("p", "fmuv-empty", "Velg en annen mappe for å lese meldinger."));
    return;
  }
  selectedId = match.id;
  const heading = el("div", "fmuv-mail-head");
  heading.append(el("p", "fmuv-eyebrow", (match.sender?.role || "Klubbkontoret") + " · " + shortDate(match)),
    el("h3", "", match.subject),
    el("p", "fmuv-secondary", match.sender?.name || "Klubbkontoret"));
  detail.append(heading);
  (Array.isArray(match.body) && match.body.length ? match.body : [match.preview])
    .filter(Boolean).forEach((paragraph) => detail.append(el("p", "fmuv-mail-copy", paragraph)));
  if (Array.isArray(match.facts) && match.facts.length) {
    const facts = el("dl", "fmuv-facts");
    match.facts.forEach((fact) => {
      const pair = el("div");
      pair.append(el("dt", "", fact.label), el("dd", "", fact.value));
      facts.append(pair);
    });
    detail.append(facts);
  }
  const action = el("button", "fmuv-primary fmuv-mail-open", "Les og svar i kalenderen");
  action.type = "button";
  action.addEventListener("click", () => openCanonicalMail(match));
  detail.append(action);
  document.querySelectorAll("#fmuvInboxList [data-message-id]").forEach((row) => {
    row.classList.toggle("is-selected", row.dataset.messageId === selectedId);
  });
}

function refresh() {
  if (!leagueReady()) return;
  currentMessages = messages();
  renderHome();
  drawInbox();
}

function updateMode() {
  const enabled = leagueReady();
  document.documentElement.classList.toggle("hgfm-universe-v2", enabled);
  const actions = document.getElementById("fmuvHeaderActions");
  if (actions) actions.hidden = !enabled;
  if (!enabled && [SECTION_HOME, SECTION_INBOX].includes(activeSection()?.dataset.tabSection)) {
    document.querySelector('.main-nav .nav-tab[data-tab-target="dashboard"]')?.click();
  }
}

function scheduleRefresh() {
  if (refreshPending) return;
  refreshPending = true;
  requestAnimationFrame(() => {
    refreshPending = false;
    updateMode();
    if ([SECTION_HOME, SECTION_INBOX].includes(activeSection()?.dataset.tabSection)) refresh();
    updateNavigation();
  });
}

function boot() {
  const link = el("link");
  link.rel = "stylesheet";
  link.href = new URL("./manager-universe-portal-v1.css", import.meta.url).href;
  link.id = "fmuvStyle";
  if (!document.getElementById(link.id)) document.head.append(link);
  ensureSections();
  ensureHeaderActions();
  updateMode();
  const observed = ["onboardingScreen", "headerClubName", "managerCalendarMatch", "managerCalendarNow", "statsStanding", "statsMatches", "statsGoals"];
  const obs = new MutationObserver(scheduleRefresh);
  observed.map((id) => document.getElementById(id)).filter(Boolean).forEach((item) => {
    obs.observe(item, { attributes: idIsOnboarding(item) ? true : false, attributeFilter: idIsOnboarding(item) ? ["hidden"] : undefined,
      childList: true, subtree: true, characterData: true });
  });
  document.querySelectorAll("[data-tab-section]").forEach((item) => {
    obs.observe(item, { attributes: true, attributeFilter: ["hidden"] });
  });
  window.addEventListener("storage", scheduleRefresh);
  window.addEventListener("updateProfile", scheduleRefresh);
  updateNavigation();
}

function idIsOnboarding(node) { return node.id === "onboardingScreen"; }

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}
