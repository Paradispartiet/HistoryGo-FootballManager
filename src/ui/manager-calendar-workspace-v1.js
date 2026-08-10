import {
  createManagerWeekCalendar,
  MANAGER_WEEK_PHASE_ORDER
} from "../football-manager-calendar.js";
import {
  createClubCommunicationTimeline,
  getClubCommunicationMessage
} from "../football-club-communication.js";
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
const MODE_SESSION_KEY = "hgfm.modeSessions.v1";

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
let startupRouteApplied = false;
let drawerState = null;
let communicationTimeline = { messages: [] };
let lastCalendarModel = null;

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

function requestCommunicationContext() {
  const detail = { context: null };
  window.dispatchEvent(new CustomEvent("hgfm:request-club-communication-context", { detail }));
  if (detail.context && typeof detail.context === "object") return detail.context;

  const envelope = readJson(MODE_SESSION_KEY, {});
  const league = envelope?.sessions?.league || {};
  return {
    week: Number(clubWeekState()?.week) || 1,
    clubWeekState: clubWeekState(),
    opponent: leagueOpponent(),
    lastMatch: lastMatch(),
    training: {
      programLabel: readJson(TRAINING_PROGRAM_KEY, null)?.programId || "",
      focusLabel: readJson(TRAINING_FOCUS_KEY, null)?.focusId || ""
    },
    analysisPlan: league.opponentAnalysisPlan || null,
    playerConditions: Array.isArray(league.playerCondition) ? league.playerCondition : [],
    staff: [],
    inboxSignals: [],
    readMessageIds: Array.isArray(league.readInboxMessageIds) ? league.readInboxMessageIds : []
  };
}

function buildCalendar() {
  const clubWeek = clubWeekState();
  const communicationContext = requestCommunicationContext();
  communicationTimeline = createClubCommunicationTimeline({
    ...communicationContext,
    week: Number(clubWeek?.week) || communicationContext.week || 1,
    clubWeekState: clubWeek,
    opponent: communicationContext.opponent || leagueOpponent(),
    lastMatch: communicationContext.lastMatch || lastMatch()
  });
  return createManagerWeekCalendar({
    clubWeekState: clubWeek,
    opponent: leagueOpponent(),
    trainingSelected: trainingSelected() || phaseIndex(clubWeek.phase) > phaseIndex("training"),
    lineupReady: lineupReady(),
    lastMatch: lastMatch(),
    communications: communicationTimeline.messages
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
  if (calendar && !calendar.hidden) {
    location.textContent = "Kontor · Kalender";
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

function revealDeepTarget(focusId) {
  if (!focusId) return;
  requestAnimationFrame(() => {
    const destination = document.getElementById(focusId);
    if (!destination) return;

    destination.closest("details")?.setAttribute("open", "");
    if (destination.classList.contains("training-workspace-step")) {
      const toggle = destination.querySelector("[data-training-step-toggle]");
      if (toggle?.getAttribute("aria-expanded") === "false") toggle.click();
    }
    if (!destination.hasAttribute("tabindex")) destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function activateTarget(target, focusId = "") {
  if (!target) return;
  const subtab = document.querySelector(`.app-subtab[data-tab-target="${target}"]:not(.office-subnav-proxy)`);
  if (subtab) {
    subtab.click();
    revealDeepTarget(focusId);
    return;
  }
  const main = document.querySelector(`.main-nav .nav-tab[data-tab-target="${target}"]`);
  if (main) {
    main.click();
    revealDeepTarget(focusId);
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
  revealDeepTarget(focusId);
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
      <footer class="manager-calendar-rule"><strong>Klubben snakker gjennom arbeidsdagen.</strong><span>Mailene forklarer eksisterende kamp-, trenings- og klubbstate. De gir ingen ny score eller skjult bonus.</span></footer>
    </section>
    <div id="managerCalendarMessageDrawer" class="manager-calendar-drawer" role="dialog" aria-modal="true" aria-labelledby="managerCalendarDrawerTitle" hidden>
      <button type="button" class="manager-calendar-drawer-backdrop" data-calendar-drawer-close aria-label="Lukk melding"></button>
      <aside class="manager-calendar-drawer-panel">
        <header class="manager-calendar-drawer-head">
          <div><p class="eyebrow">Klubbmail</p><h3 id="managerCalendarDrawerTitle">Melding</h3></div>
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

  // Speiding flyttes av sin egen workspace fra Kontor til hovedområdet Speiding.
  // Kalenderen skal bare skjule den gamle Kontor-proxyen; når fanen er
  // reparentet til `historygo`, eies synligheten av Speiding selv.
  const scoutingMain = document.querySelector('.main-nav .nav-tab[data-tab-target="historygo"]');
  if (historygo?.dataset.subnavParent === "dashboard" && scoutingMain && !scoutingMain.hidden) {
    historygo.classList.add("office-subnav-proxy");
  } else if (historygo?.dataset.subnavParent === "historygo") {
    historygo.classList.remove("office-subnav-proxy");
  }

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

function emitCalendarWorkContext(day, entry) {
  if (!entry?.target) return;
  const fallbackWeek = Math.max(1, Number(clubWeekState()?.week) || 1);
  window.dispatchEvent(new CustomEvent("hgfm:calendar-open-work", {
    detail: {
      week: selectedWeek || fallbackWeek,
      dayIndex: day.dayIndex,
      day: day.day,
      time: entry.time,
      eventId: entry.id,
      eventTitle: entry.title,
      target: entry.target,
      source: "calendar"
    }
  }));
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
    if (entry.attention) meta.append(node("span", "manager-calendar-event-warning", entry.kind === "message" ? "Ny" : "Mangler"));
    meta.append(node("span", "manager-calendar-event-action", entry.actionLabel));
    button.append(time, copy, meta);
    button.addEventListener("click", () => {
      if (entry.kind === "message") {
        openInboxDrawer(entry, button);
        return;
      }
      emitCalendarWorkContext(day, entry);
      activateTarget(entry.target);
    });
    item.append(button);
    fragment.append(item);
  });
  timeline.replaceChildren(fragment);
}

function initials(value) {
  return String(value || "K")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("nb-NO"))
    .join("") || "K";
}

function dispatchCommunicationRead(message) {
  if (!message || message.isRead) return;
  message.isRead = true;
  window.dispatchEvent(new CustomEvent("hgfm:club-communication-read", {
    detail: { messageId: message.id, threadId: message.threadId, source: message.source || null }
  }));
}

function dispatchCommunicationChoice(message, choice) {
  if (!message || !choice) return;
  window.dispatchEvent(new CustomEvent("hgfm:club-communication-choice", {
    detail: {
      messageId: message.id,
      threadId: message.threadId,
      choiceId: choice.id,
      source: choice.source || message.source || null
    }
  }));
  setTimeout(renderCalendar, 0);
}

function renderMailMessage(body, message) {
  body.textContent = "";
  if (!message) {
    const fallback = node("article", "manager-calendar-message-fallback");
    fallback.append(node("strong", "", "Meldingen finnes ikke lenger"), node("p", "", "Kalenderen er oppdatert fra den aktive manageruka."));
    body.append(fallback);
    return;
  }

  const article = node("article", "manager-club-mail");
  article.dataset.messageId = message.id;
  article.dataset.priority = message.priority || "normal";

  const sender = node("header", "manager-club-mail-sender");
  sender.append(node("span", "manager-club-mail-avatar", initials(message.sender?.name)));
  const identity = node("span", "manager-club-mail-identity");
  identity.append(node("strong", "", message.sender?.name || "Klubbkontoret"), node("small", "", message.sender?.role || "Klubbkommunikasjon"));
  const time = node("time", "manager-club-mail-time", message.time || "");
  sender.append(identity, time);

  const heading = node("div", "manager-club-mail-heading");
  heading.append(node("h4", "", message.subject), node("p", "", message.preview));
  article.append(sender, heading);

  const copy = node("div", "manager-club-mail-copy");
  (message.body || []).forEach((paragraph) => copy.append(node("p", "", paragraph)));
  article.append(copy);

  if (message.facts?.length) {
    const facts = node("dl", "manager-club-mail-facts");
    message.facts.forEach((fact) => {
      const row = node("div", "manager-club-mail-fact");
      row.append(node("dt", "", fact.label), node("dd", "", fact.value));
      facts.append(row);
    });
    article.append(facts);
  }

  if (message.guidance && Object.values(message.guidance).some(Boolean)) {
    const guidance = node("section", "manager-club-mail-guidance");
    guidance.append(node("h5", "", "Fra informasjon til managerarbeid"));
    [
      ["Situasjonen", message.guidance.situation],
      ["Hva det betyr", message.guidance.meaning],
      ["Managerspørsmålet", message.guidance.question],
      ["Se etter", message.guidance.watch]
    ].filter(([, value]) => value).forEach(([label, value]) => {
      const row = node("div", "manager-club-mail-guidance-row");
      row.append(node("strong", "", label), node("p", "", value));
      guidance.append(row);
    });
    article.append(guidance);
  }

  if (message.reply) {
    const reply = node("section", "manager-club-mail-reply");
    reply.append(node("small", "", "Ditt svar"), node("strong", "", message.reply.title), node("p", "", message.reply.body));
    article.append(reply);
  } else if (message.choices?.length) {
    const choices = node("section", "manager-club-mail-choices");
    choices.append(node("h5", "", "Hva svarer du?"));
    message.choices.forEach((choice) => {
      const button = node("button", "manager-club-mail-choice");
      button.type = "button";
      button.dataset.choiceId = choice.id;
      button.append(node("strong", "", choice.label));
      if (choice.description) button.append(node("span", "", choice.description));
      button.addEventListener("click", () => dispatchCommunicationChoice(message, choice));
      choices.append(button);
    });
    article.append(choices);
  }

  const mailLinks = Array.isArray(message.links) && message.links.length
    ? message.links
    : message.action?.target ? [message.action] : [];
  if (mailLinks.length) {
    const links = node("nav", "manager-club-mail-links");
    links.setAttribute("aria-label", "Arbeidslenker fra mailen");
    links.append(node("h5", "", "Gå til arbeidet"));
    mailLinks.forEach((route) => {
      const link = node("a", "manager-club-mail-action", route.label || "Åpne arbeidsflaten");
      link.href = `#${route.target}${route.focusId ? `/${route.focusId}` : ""}`;
      link.dataset.target = route.target;
      if (route.focusId) link.dataset.focusId = route.focusId;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        closeInboxDrawer();
        activateTarget(route.target, route.focusId);
      });
      links.append(link);
    });
    article.append(links);
  }

  body.append(article);
}

function openInboxDrawer(entry, trigger) {
  const section = ensureSection();
  const drawer = section.querySelector("#managerCalendarMessageDrawer");
  const body = section.querySelector("#managerCalendarDrawerBody");
  const title = section.querySelector("#managerCalendarDrawerTitle");
  if (!drawer || !body || !title) return;

  const message = entry?.message || getClubCommunicationMessage(communicationTimeline, entry?.id);
  title.textContent = message?.subject || entry?.title || "Melding";
  drawerState = { messageId: message?.id || entry?.id || "", returnFocus: trigger || null };
  renderMailMessage(body, message);
  drawer.hidden = false;
  dispatchCommunicationRead(message);
  syncCalendarLocation();
  drawer.querySelector(".manager-calendar-drawer-close")?.focus();
}

function refreshOpenMail(section) {
  const drawer = section.querySelector("#managerCalendarMessageDrawer");
  if (!drawer || drawer.hidden || !drawerState?.messageId) return;
  const message = getClubCommunicationMessage(communicationTimeline, drawerState.messageId);
  const body = section.querySelector("#managerCalendarDrawerBody");
  const title = section.querySelector("#managerCalendarDrawerTitle");
  if (title && message) title.textContent = message.subject;
  if (body) renderMailMessage(body, message);
}

function closeInboxDrawer() {
  const drawer = document.getElementById("managerCalendarMessageDrawer");
  if (!drawer || drawer.hidden) return;
  const state = drawerState;
  drawer.hidden = true;
  drawerState = null;
  drawer.querySelector("#managerCalendarDrawerBody")?.replaceChildren();
  syncCalendarLocation();
  if (state?.returnFocus?.isConnected) state.returnFocus.focus();
}

function syncText(element, value) {
  if (element && element.textContent !== value) element.textContent = value;
}

function syncAttribute(element, name, value) {
  if (element && element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function renderCalendarFooter(model) {
  if (!model || !isNormalLeagueSave()) return;
  const host = document.querySelector("manager-next-action");
  const strip = host?.querySelector("#nextActionStrip");
  const primary = host?.querySelector("#nextActionPrimary");
  if (!host || !strip || !primary) return;

  const day = model.currentDay;
  const nextEvent = day?.events?.find((entry) => entry.attention) || day?.events?.[0] || null;
  const title = nextEvent ? `${day.day} · ${nextEvent.title}` : `${day.day} · ${day.title}`;
  const hint = nextEvent?.detail || "Åpne managerkalenderen og se arbeidsdagen i riktig rekkefølge.";
  const destination = nextEvent?.time ? `${day.day} kl. ${nextEvent.time}` : day.day;

  if (host.hidden) host.hidden = false;
  if (strip.hidden) strip.hidden = false;
  if (host.dataset.calendarOwned !== "true") host.dataset.calendarOwned = "true";
  if (strip.dataset.surface !== "manager-calendar") strip.dataset.surface = "manager-calendar";
  strip.dataset.calendarInteractive = "true";
  syncText(host.querySelector(".next-action-head .eyebrow"), "Managerkalender");
  syncAttribute(strip, "aria-label", "Managerkalender · neste hendelse");
  syncText(host.querySelector("#nextActionPhase"), model.summary);
  syncText(host.querySelector("#nextActionPrimaryTag"), "Kalender");
  syncText(host.querySelector("#nextActionPrimaryTitle"), title);
  syncText(host.querySelector("#nextActionPrimaryHint"), hint);
  syncText(host.querySelector("#nextActionDestination"), destination);
  syncAttribute(primary, "aria-label", `Åpne managerkalenderen. ${model.summary}. ${title}. ${hint}`);
  if (primary.disabled) primary.disabled = false;
  primary.onclick = () => {
    selectedDayIndex = model.currentDayIndex;
    activateCalendar();
  };
  // Footeren oppfattes visuelt som én samlet kontroll. La derfor også klikk på
  // overskriften og den øvrige stripen åpne kalenderen, mens den egentlige
  // knappen fortsatt er den fokuserbare og semantiske tastaturkontrollen.
  strip.onclick = (event) => {
    if (event.target?.closest?.("button, a, input, select, textarea")) return;
    primary.click();
  };
  const secondary = host.querySelector("#nextActionSecondary");
  if (secondary?.childElementCount) secondary.replaceChildren();
  window.dispatchEvent(new CustomEvent("hgfm:manager-calendar-footer-ready"));
}

function renderCalendar() {
  const section = ensureSection();
  const model = buildCalendar();
  lastCalendarModel = model;
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
  refreshOpenMail(section);
  renderCalendarFooter(model);
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

function openLeagueCalendarAtStartup() {
  if (startupRouteApplied || !isNormalLeagueSave()) return;
  startupRouteApplied = true;
  selectedDayIndex = lastCalendarModel?.currentDayIndex || 1;
  activateCalendar();
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

  const footerStrip = document.getElementById("nextActionStrip");
  if (footerStrip) {
    const observer = new MutationObserver(() => queueMicrotask(() => renderCalendarFooter(lastCalendarModel)));
    observer.observe(footerStrip, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "disabled"] });
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
  openLeagueCalendarAtStartup();
  syncCalendarLocation();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
