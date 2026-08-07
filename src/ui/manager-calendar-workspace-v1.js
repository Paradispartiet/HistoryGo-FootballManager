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

let renderFrame = 0;

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

function buildCalendar() {
  const clubWeek = clubWeekState();
  return createManagerWeekCalendar({
    clubWeekState: clubWeek,
    opponent: leagueOpponent(),
    inboxHandled: phaseIndex(clubWeek.phase) > phaseIndex("inbox"),
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
  const section = document.querySelector('[data-tab-section="calendar"]');
  if (!section || section.hidden) return;
  const location = document.getElementById("managerLocationText");
  if (location && location.textContent !== "Kontor · Kalender") location.textContent = "Kontor · Kalender";
}

function activateCalendar() {
  const section = document.querySelector('[data-tab-section="calendar"]');
  if (!section) return;
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
  syncCalendarLocation();
  scheduleRender();
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
          <p class="muted-text">Kalenderen organiserer det som allerede skjer i spillet. Den flytter ikke uka og erstatter ikke «Forslag til neste steg».</p>
        </div>
        <div class="manager-calendar-now"><span>Nå</span><strong id="managerCalendarNow">Uke 1 · Mandag</strong></div>
      </header>
      <div class="manager-calendar-context" aria-label="Ukas kamp">
        <span>Neste kamp</span><strong id="managerCalendarMatch">Ingen terminfestet kamp</strong>
      </div>
      <ol id="managerCalendarDays" class="manager-calendar-days" aria-label="Mandag til søndag"></ol>
      <footer class="manager-calendar-rule"><strong>Tidslinje, ikke veiviser.</strong><span>Handlingene gjøres fortsatt i Kontor, Lag, Speiding, Kamp og Stats.</span></footer>
    </section>`;
  document.getElementById("app")?.append(section);
  return section;
}

function ensureSubtab() {
  const subnav = document.getElementById("appSubnav");
  if (!subnav) return null;
  let button = subnav.querySelector('.app-subtab[data-tab-target="calendar"]');
  if (button) return button;
  button = node("button", "app-subtab", "Kalender");
  button.type = "button";
  button.setAttribute("role", "tab");
  button.dataset.subnavParent = "dashboard";
  button.dataset.tabTarget = "calendar";
  button.setAttribute("aria-selected", "false");
  button.addEventListener("click", activateCalendar);
  const inbox = subnav.querySelector('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="inbox"]');
  inbox?.after(button);
  return button;
}

function renderCalendar() {
  const section = ensureSection();
  const model = buildCalendar();
  const now = section.querySelector("#managerCalendarNow");
  const match = section.querySelector("#managerCalendarMatch");
  const days = section.querySelector("#managerCalendarDays");
  if (now) now.textContent = model.summary;
  if (match) match.textContent = model.nextMatchLabel;
  if (!days) return;

  const fragment = document.createDocumentFragment();
  model.days.forEach((day) => {
    const item = node("li", `manager-calendar-day is-${day.status}`);
    item.dataset.day = String(day.dayIndex);
    item.dataset.phase = day.phase;
    item.dataset.status = day.status;
    if (day.isCurrent) item.setAttribute("aria-current", "date");
    const date = node("div", "manager-calendar-day-label");
    date.append(node("span", "", day.day), node("strong", "", String(day.dayIndex)));
    const content = node("div", "manager-calendar-day-content");
    content.append(node("strong", "", day.title), node("p", "", day.detail), node("small", "", day.owner));
    const status = node("span", "manager-calendar-day-status", day.status === "completed" ? "Ferdig" : day.status === "current" ? "I dag" : "Kommer");
    item.append(date, content, status);
    fragment.append(item);
  });
  days.replaceChildren(fragment);
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderCalendar();
    syncCalendarLocation();
  });
}

function installObservers() {
  const weekNodes = ["clubWeekSummary", "clubWeekPhase", "squadGateStarters", "squadGateBench"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (weekNodes.length) {
    const observer = new MutationObserver(scheduleRender);
    weekNodes.forEach((element) => observer.observe(element, { subtree: true, childList: true, characterData: true }));
  }
  const calendarSection = document.querySelector('[data-tab-section="calendar"]');
  if (calendarSection) {
    new MutationObserver(() => queueMicrotask(syncCalendarLocation))
      .observe(calendarSection, { attributes: true, attributeFilter: ["hidden"] });
  }
  window.addEventListener("storage", scheduleRender);
  window.addEventListener("updateProfile", scheduleRender);
}

function boot() {
  ensureStyles();
  ensureSection();
  ensureSubtab();
  renderCalendar();
  installObservers();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
