import {
  createManagerWeekCalendar,
  MANAGER_WEEK_PHASE_ORDER
} from "../football-manager-calendar.js";
import {
  LEAGUE_SEASON_VERSION,
  getNextLeagueOpponent,
  normalizeLeagueSeason
} from "../football-league-season.js";

const STYLE_ID = "managerCalendarWorkspaceV1Style";
const SECTION_ID = "managerCalendarSection";
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
const GAME_START_KEY = "hgfm.gameStartState.v1";
const MATCHDAY_KEY = "hgfm.matchday.v1";
const TRAINING_PROGRAM_KEY = "hgfm.weeklyTrainingProgram.v1";
const TRAINING_FOCUS_KEY = "hgfm.weeklyTrainingFocus.v1";

const PHASE_BY_LABEL = Object.freeze({
  analyse: "analysis",
  innboks: "inbox",
  trening: "training",
  kampplan: "match_prep",
  kampdag: "matchday",
  oppsummering: "review"
});

const DAY_ABBR = Object.freeze(["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"]);

let renderFrame = 0;
let selectedDayIndex = null;
let selectedWeek = null;
let redirectQueued = false;
let drawerState = null;

function node(tag, className = "", value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = String(value);
  return element;
}

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function phaseIndex(phase) {
  return Math.max(0, MANAGER_WEEK_PHASE_ORDER.indexOf(phase));
}

function gameStartState() {
  return readJson(GAME_START_KEY, {}) || {};
}

function isNormalLeagueSave() {
  const start = gameStartState();
  if ((start.selectedMode || "league") !== "league") return false;
  if (!start.activeLeagueSaveId && start.leagueSeasonStatus !== "active") return false;
  if (localStorage.getItem("hgfm.onboarded.v1") === "1") return true;
  const onboarding = document.getElementById("onboardingScreen");
  return !onboarding || onboarding.hidden;
}

function clubWeekState() {
  const merits = readJson(TEAM_MERITS_KEY, {});
  if (merits?.clubWeekState?.phase) return merits.clubWeekState;

  const summary = document.getElementById("clubWeekSummary")?.textContent || "";
  const phaseLabel = (document.getElementById("clubWeekPhase")?.textContent || "").trim().toLocaleLowerCase("nb-NO");
  const week = Number(summary.match(/Uke\s+(\d+)/i)?.[1]) || 1;
  const phase = PHASE_BY_LABEL[phaseLabel] || "analysis";
  return { week, phase };
}

function leagueOpponent() {
  const season = normalizeLeagueSeason(readJson(LEAGUE_SEASON_VERSION, null));
  return season?.status === "active" ? getNextLeagueOpponent(season) : null;
}

function lastMatch() {
  return readJson(MATCHDAY_KEY, {})?.lastMatch || null;
}

function trainingSelected() {
  const program = readJson(TRAINING_PROGRAM_KEY, null);
  const focus = readJson(TRAINING_FOCUS_KEY, null);
  return Boolean(program?.programId || focus?.focusId);
}

function lineupReady() {
  const starters = document.getElementById("squadGateStarters")?.textContent || "";
  const bench = document.getElementById("squadGateBench")?.textContent || "";
  return /^\s*11\s*\/\s*11\s*$/.test(starters) && /^\s*[4-9]\d*\s*\/\s*4\s*$/.test(bench);
}

function inboxSnapshot() {
  const title = (document.getElementById("inboxFocusTitle")?.textContent || "").trim() || "Melding fra klubben";
  const cards = document.querySelectorAll("#inboxThreadList .inbox-thread-card, #inboxQueueList .inbox-thread-card");
  return { title, attentionCount: cards.length };
}

function buildCalendar() {
  const clubWeek = clubWeekState();
  const inbox = inboxSnapshot();
  return createManagerWeekCalendar({
    clubWeekState: clubWeek,
    opponent: leagueOpponent(),
    inboxHandled: phaseIndex(clubWeek.phase) > phaseIndex("inbox"),
    inboxTitle: inbox.title,
    inboxAttentionCount: inbox.attentionCount,
    trainingSelected: trainingSelected() || phaseIndex(clubWeek.phase) > phaseIndex("training"),
    lineupReady: lineupReady(),
    lastMatch: lastMatch()
  });
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-calendar-workspace-v1.css", import.meta.url).href;
  document.head.append(link);
}

function syncCalendarLocation() {
  const location = document.getElementById("managerLocationText");
  if (!location) return;
  const calendar = document.querySelector('[data-tab-section="calendar"]');
  const board = document.querySelector('[data-tab-section="board"]');
  const drawer = document.getElementById("managerCalendarMessageDrawer");
  if (calendar && !calendar.hidden) {
    location.textContent = drawer && !drawer.hidden ? "Kontor · Kalender · Melding" : "Kontor · Kalender";
  } else if (board && !board.hidden) {
    location.textContent = "Kontor · Klubben";
  }
}

function activateCalendar() {
  const section = ensureSection();
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => {
    candidate.hidden = candidate !== section;
  });
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "dashboard";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(".app-subtab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === "calendar";
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  const subnav = document.getElementById("appSubnav");
  if (subnav) subnav.hidden = false;
  renderCalendar();
  syncCalendarLocation();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function activateTarget(target) {
  if (!target) return;
  const subtab = document.querySelector(`.app-subtab[data-tab-target="${target}"]:not(.office-subnav-proxy)`);
  if (subtab) {
    subtab.click();
    return;
  }
  const main = document.querySelector(`.main-nav .nav-tab[data-tab-target="${target}"]`);
  if (main) {
    main.click();
    return;
  }
  const section = document.querySelector(`[data-tab-section="${target}"]`);
  if (!section) return;
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => {
    candidate.hidden = candidate !== section;
  });
  const parent = section.dataset.tabParent || target;
  document.querySelectorAll(".main-nav .nav-tab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === parent;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(".app-subtab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === target;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  syncCalendarLocation();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function ensureSection() {
  let section = document.querySelector('[data-tab-section="calendar"]');
  if (section) return section;
  section = node("div", "tab-section manager-calendar-view");
  section.id = SECTION_ID;
  section.dataset.tabSection = "calendar";
  section.dataset.tabParent = "dashboard";
  section.hidden = true;
  section.innerHTML = `
    <section class="manager-calendar-surface" aria-label="Managerkalender" aria-live="polite">
      <header class="manager-calendar-head">
        <div>
          <p class="eyebrow">Kontor · Kalender</p>
          <h2 id="managerCalendarTitle">Manageruka</h2>
          <p class="muted-text">Tiden, meldingene og arbeidsoppgavene samles i samme uke. Kalenderen bruker den eksisterende Club Week-staten.</p>
        </div>
        <div class="manager-calendar-now"><span>Nå</span><strong id="managerCalendarNow">Uke 1 · Mandag</strong></div>
      </header>
      <div class="manager-calendar-context" aria-label="Ukas kamp">
        <span>Neste kamp</span><strong id="managerCalendarMatch">Ingen terminfestet kamp</strong>
      </div>
      <ol id="managerCalendarDays" class="manager-calendar-days" role="tablist" aria-label="Mandag til søndag"></ol>
      <section class="manager-calendar-workday" aria-labelledby="managerCalendarSelectedDay">
        <header class="manager-calendar-workday-head">
          <div><p class="eyebrow">Arbeidsdagen</p><h3 id="managerCalendarSelectedDay">Mandag</h3></div>
          <span id="managerCalendarSelectedStatus" class="manager-calendar-selected-status">I dag</span>
        </header>
        <ol id="managerCalendarTimeline" class="manager-calendar-timeline" aria-label="Dagens hendelser"></ol>
      </section>
      <footer class="manager-calendar-rule"><strong>Kalenderen eier presentasjonen av tiden.</strong><span>Club Week, kamp, trening, innboks og konsekvensmotorene er fortsatt sannhetskildene.</span></footer>
    </section>
    <div id="managerCalendarMessageDrawer" class="manager-calendar-drawer" role="dialog" aria-modal="true" aria-labelledby="managerCalendarDrawerTitle" hidden>
      <button type="button" class="manager-calendar-drawer-backdrop" data-calendar-drawer-close aria-label="Lukk melding"></button>
      <aside class="manager-calendar-drawer-panel">
        <header class="manager-calendar-drawer-head">
          <div><p class="eyebrow">Kalender · Melding</p><h3 id="managerCalendarDrawerTitle">Melding</h3></div>
          <button type="button" class="manager-calendar-drawer-close" data-calendar-drawer-close aria-label="Lukk melding">×</button>
        </header>
        <div id="managerCalendarDrawerBody" class="manager-calendar-drawer-body"></div>
      </aside>
    </div>`;
  document.getElementById("app")?.append(section);
  section.querySelectorAll("[data-calendar-drawer-close]").forEach((button) => button.addEventListener("click", closeInboxDrawer));
  return section;
}

function ensureSubtab() {
  const subnav = document.getElementById("appSubnav");
  if (!subnav) return null;
  let button = subnav.querySelector('.app-subtab[data-tab-target="calendar"]');
  if (!button) {
    button = node("button", "app-subtab", "Kalender");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.dataset.subnavParent = "dashboard";
    button.dataset.tabTarget = "calendar";
    button.setAttribute("aria-selected", "false");
    subnav.append(button);
  }
  button.dataset.subnavParent = "dashboard";
  button.textContent = "Kalender";
  button.classList.remove("office-subnav-proxy");
  if (button.dataset.calendarBound !== "true") {
    button.dataset.calendarBound = "true";
    button.addEventListener("click", activateCalendar);
  }
  return button;
}

function applyOfficeNavigationContract() {
  const normalSave = isNormalLeagueSave();
  document.documentElement.dataset.managerOfficeCalendarV1 = normalSave ? "active" : "startup";

  const subnav = document.getElementById("appSubnav");
  if (!subnav) return;
  const calendar = ensureSubtab();
  const overview = subnav.querySelector('.app-subtab[data-tab-target="dashboard"]');
  const inbox = subnav.querySelector('.app-subtab[data-tab-target="inbox"]');
  const board = subnav.querySelector('.app-subtab[data-tab-target="board"]');
  const officeHelp = subnav.querySelector('.app-subtab[data-tab-target="officeHelp"]');
  const historygo = subnav.querySelector('.app-subtab[data-tab-target="historygo"]');

  if (overview) overview.classList.add("office-subnav-proxy");
  if (inbox) inbox.classList.add("office-subnav-proxy");
  if (board) {
    board.textContent = "Klubben";
    board.classList.remove("office-subnav-proxy");
  }
  if (officeHelp) officeHelp.classList.toggle("office-subnav-proxy", normalSave);

  // Dersom Speiding allerede finnes som egen hovedinngang, skal den ikke også
  // ligge som parallell Kontor-fane. Hvis ikke, beholdes den eksisterende
  // inngangen inntil hovednavigasjonen eksplisitt flyttes i en senere pass.
  const scoutingMain = document.querySelector('.main-nav .nav-tab[data-tab-target="historygo"]');
  if (historygo && scoutingMain && !scoutingMain.hidden) historygo.classList.add("office-subnav-proxy");

  if (calendar && board && calendar.parentElement === board.parentElement) subnav.insertBefore(calendar, board);
  else if (calendar) subnav.prepend(calendar);
}

function markerForDay(day) {
  if (day.dayIndex === 6 && day.status === "upcoming") return "⚽";
  if (day.status === "completed") return "✓";
  if (day.status === "current") return "●";
  return "";
}

function statusLabel(status) {
  if (status === "completed") return "Ferdig";
  if (status === "current") return "I dag";
  return "Kommer";
}

function renderDayRail(section, model) {
  const days = section.querySelector("#managerCalendarDays");
  if (!days) return;
  const fragment = document.createDocumentFragment();
  model.days.forEach((day, index) => {
    const item = node("li", "manager-calendar-day");
    item.setAttribute("role", "presentation");
    const button = node("button", `manager-calendar-day-button is-${day.status}`);
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "managerCalendarTimeline");
    button.dataset.day = String(day.dayIndex);
    button.dataset.status = day.status;
    button.setAttribute("aria-selected", selectedDayIndex === day.dayIndex ? "true" : "false");
    if (day.isCurrent) button.setAttribute("aria-current", "date");
    button.append(
      node("span", "manager-calendar-day-name", DAY_ABBR[index]),
      node("span", "manager-calendar-day-marker", markerForDay(day)),
      node("small", "manager-calendar-day-title", day.title)
    );
    button.addEventListener("click", () => {
      selectedDayIndex = day.dayIndex;
      renderCalendar();
    });
    item.append(button);
    fragment.append(item);
  });
  days.replaceChildren(fragment);
}

function renderTimeline(section, day) {
  const title = section.querySelector("#managerCalendarSelectedDay");
  const status = section.querySelector("#managerCalendarSelectedStatus");
  const timeline = section.querySelector("#managerCalendarTimeline");
  if (title) title.textContent = `${day.day} · ${day.title}`;
  if (status) {
    status.textContent = statusLabel(day.status);
    status.dataset.status = day.status;
  }
  if (!timeline) return;

  const fragment = document.createDocumentFragment();
  day.events.forEach((entry) => {
    const item = node("li", `manager-calendar-event${entry.attention ? " has-attention" : ""}`);
    const button = node("button", "manager-calendar-event-button");
    button.type = "button";
    button.dataset.eventId = entry.id;
    button.dataset.eventKind = entry.kind;
    if (entry.target) button.dataset.target = entry.target;
    const time = node("time", "manager-calendar-event-time", entry.time);
    const copy = node("span", "manager-calendar-event-copy");
    copy.append(node("strong", "", entry.title), node("span", "manager-calendar-event-detail", entry.detail));
    const meta = node("span", "manager-calendar-event-meta");
    meta.append(node("small", "", entry.owner));
    if (entry.attention) meta.append(node("span", "manager-calendar-event-warning", "Mangler"));
    meta.append(node("span", "manager-calendar-event-action", entry.actionLabel));
    button.append(time, copy, meta);
    button.addEventListener("click", () => {
      if (entry.kind === "message") openInboxDrawer(entry, button);
      else activateTarget(entry.target);
    });
    item.append(button);
    fragment.append(item);
  });
  timeline.replaceChildren(fragment);
}

function findInboxCard() {
  return document.querySelector("#inboxThreadList .inbox-thread-card, #inboxQueueList .inbox-thread-card");
}

function openInboxDrawer(entry, trigger) {
  const section = ensureSection();
  const drawer = section.querySelector("#managerCalendarMessageDrawer");
  const body = section.querySelector("#managerCalendarDrawerBody");
  const title = section.querySelector("#managerCalendarDrawerTitle");
  if (!drawer || !body || !title) return;

  closeInboxDrawer();
  body.textContent = "";
  title.textContent = entry?.title || "Melding";
  const card = findInboxCard();
  drawerState = { card: null, parent: null, nextSibling: null, returnFocus: trigger || null };

  if (card && card.parentElement) {
    drawerState.card = card;
    drawerState.parent = card.parentElement;
    drawerState.nextSibling = card.nextSibling;
    body.append(card);
  } else {
    const fallback = node("article", "manager-calendar-message-fallback");
    fallback.append(node("strong", "", entry?.title || "Melding fra klubben"), node("p", "", entry?.detail || "Meldingen er registrert i manageruka."));
    body.append(fallback);
  }

  drawer.hidden = false;
  syncCalendarLocation();
  drawer.querySelector(".manager-calendar-drawer-close")?.focus();
}

function closeInboxDrawer() {
  const drawer = document.getElementById("managerCalendarMessageDrawer");
  if (!drawer || drawer.hidden) return;
  const state = drawerState;
  if (state?.card) {
    const replacementExists = state.parent?.querySelector?.(".inbox-thread-card");
    if (state.parent?.isConnected && !replacementExists) {
      const sibling = state.nextSibling?.parentElement === state.parent ? state.nextSibling : null;
      state.parent.insertBefore(state.card, sibling);
    } else {
      state.card.remove();
    }
  }
  drawer.hidden = true;
  drawerState = null;
  syncCalendarLocation();
  if (state?.returnFocus?.isConnected) state.returnFocus.focus();
  scheduleRender();
}

function renderCalendar() {
  const section = ensureSection();
  const model = buildCalendar();
  if (selectedWeek !== model.week) {
    selectedWeek = model.week;
    selectedDayIndex = model.currentDayIndex;
  }
  if (!model.days.some((day) => day.dayIndex === selectedDayIndex)) selectedDayIndex = model.currentDayIndex;

  const now = section.querySelector("#managerCalendarNow");
  const match = section.querySelector("#managerCalendarMatch");
  if (now) now.textContent = model.summary;
  if (match) match.textContent = model.nextMatchLabel;
  renderDayRail(section, model);
  renderTimeline(section, model.days.find((day) => day.dayIndex === selectedDayIndex) || model.currentDay);
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    applyOfficeNavigationContract();
    renderCalendar();
    syncCalendarLocation();
  });
}

function redirectOfficeToCalendar() {
  if (!isNormalLeagueSave() || redirectQueued) return;
  const active = document.querySelector('[data-tab-section]:not([hidden])');
  const target = active?.dataset.tabSection;
  if (target !== "dashboard" && target !== "inbox") return;
  redirectQueued = true;
  queueMicrotask(() => {
    redirectQueued = false;
    activateCalendar();
  });
}

function installObservers() {
  const weekNodes = ["clubWeekSummary", "clubWeekPhase", "squadGateStarters", "squadGateBench", "inboxFocusTitle", "inboxFocusStatus", "inboxThreadList", "inboxQueueList"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (weekNodes.length) {
    const observer = new MutationObserver(() => {
      if (!document.getElementById("managerCalendarMessageDrawer")?.hidden) return;
      scheduleRender();
    });
    weekNodes.forEach((element) => observer.observe(element, { subtree: true, childList: true, characterData: true }));
  }

  const sections = Array.from(document.querySelectorAll("[data-tab-section]"));
  if (sections.length) {
    const observer = new MutationObserver(() => queueMicrotask(() => {
      applyOfficeNavigationContract();
      redirectOfficeToCalendar();
      syncCalendarLocation();
    }));
    sections.forEach((section) => observer.observe(section, { attributes: true, attributeFilter: ["hidden"] }));
  }

  const dashboardTab = document.querySelector('.main-nav .nav-tab[data-tab-target="dashboard"]');
  if (dashboardTab && dashboardTab.dataset.calendarOfficeBound !== "true") {
    dashboardTab.dataset.calendarOfficeBound = "true";
    dashboardTab.addEventListener("click", () => queueMicrotask(redirectOfficeToCalendar));
  }

  window.addEventListener("storage", scheduleRender);
  window.addEventListener("updateProfile", scheduleRender);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("managerCalendarMessageDrawer")?.hidden) closeInboxDrawer();
  });
}

function boot() {
  ensureStyles();
  ensureSection();
  ensureSubtab();
  applyOfficeNavigationContract();
  renderCalendar();
  installObservers();
  redirectOfficeToCalendar();
  syncCalendarLocation();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}