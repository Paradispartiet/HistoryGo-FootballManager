import { currentManagerDayIndex } from "../football-manager-calendar.js";

const STYLE_ID = "managerTrainingDayV1Style";
const SURFACE_ID = "managerTrainingDay";
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
const DAYS = Object.freeze(["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]);

let calendarContext = null;
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

function clubWeekState() {
  const merits = readJson(TEAM_MERITS_KEY, {}) || {};
  return merits.clubWeekState || { week: 1, phase: "analysis" };
}

function currentContext() {
  if (calendarContext?.target === "trening") return calendarContext;
  const clubWeek = clubWeekState();
  const week = Math.max(1, Number(clubWeek.week) || 1);
  const dayIndex = currentManagerDayIndex(clubWeek);
  return {
    week,
    dayIndex,
    day: DAYS[dayIndex - 1] || "Onsdag",
    time: dayIndex === 3 ? "11:00" : "",
    eventId: "training-direct",
    eventTitle: dayIndex === 3 ? "Trening" : "Treningsarbeid",
    target: "trening",
    source: "direct"
  };
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-training-day-v1.css", import.meta.url).href;
  document.head.append(link);
}

function returnToCalendarDay() {
  const context = currentContext();
  const office = document.querySelector('.main-nav [role="tab"][data-tab-target="dashboard"]');
  if (!(office instanceof HTMLElement)) return;
  office.click();
  requestAnimationFrame(() => {
    const day = document.querySelector(`#managerCalendarDays .manager-calendar-day-button[data-day="${context.dayIndex}"]`);
    if (day instanceof HTMLElement) day.click();
  });
}

function ensureSurface() {
  const section = document.querySelector('[data-tab-section="trening"]');
  if (!section) return null;
  section.classList.add("has-manager-training-day-v1");
  let surface = document.getElementById(SURFACE_ID);
  if (surface) return surface;

  surface = node("section", "manager-training-day");
  surface.id = SURFACE_ID;
  surface.setAttribute("aria-label", "Treningsdag");
  surface.setAttribute("aria-live", "polite");
  surface.innerHTML = `
    <header class="training-day-head">
      <div>
        <button type="button" class="training-day-calendar-link" id="trainingDayBackCalendar">Kalender · Uke 1 · Onsdag</button>
        <p class="eyebrow" id="trainingDayEyebrow">Lag · Trening · Onsdag</p>
        <h2>Treningsdag</h2>
        <p class="training-day-lede" id="trainingDayLede">Dagens treningsarbeid samler program, økter, fokus og individuell oppfølging.</p>
      </div>
      <div class="training-day-clock">
        <span id="trainingDayTime">11:00</span>
        <strong id="trainingDayEvent">Trening</strong>
      </div>
    </header>

    <div class="training-day-grid">
      <section class="training-day-main" aria-labelledby="trainingDayProgramTitle">
        <header class="training-day-section-head">
          <div>
            <span>Valgt program</span>
            <h3 id="trainingDayProgramTitle">Ikke valgt</h3>
            <small class="training-day-exercise-hint" id="trainingDayExerciseHint">Klikk en økt for å åpne øvelsesdesign.</small>
          </div>
          <button type="button" class="training-day-action" id="trainingDayChangeProgram">Endre program</button>
        </header>
        <ol class="training-day-sessions" id="trainingDaySessions" aria-label="Fire treningsøkter"></ol>
      </section>

      <aside class="training-day-side">
        <section class="training-day-card">
          <header><span>Ukens fokus</span><button type="button" id="trainingDayChangeFocus">Endre</button></header>
          <strong id="trainingDayFocus">Ikke valgt</strong>
          <p id="trainingDayFocusHint">Velg kampens viktigste treningstema.</p>
        </section>
        <section class="training-day-card">
          <header><span>Individuell oppfølging</span><button type="button" id="trainingDayChangeIndividual">Endre</button></header>
          <strong id="trainingDayIndividual">Ingen oppfølging valgt</strong>
          <p id="trainingDayIndividualHint">Rolle, belastning, form og skadeoppfølging bruker eksisterende individuell trening.</p>
        </section>
        <section class="training-day-card training-day-assistant">
          <span>Assistent</span>
          <strong id="trainingDayAssistant">Les dagens signaler før økta.</strong>
          <p id="trainingDayAssistantDetail"></p>
        </section>
        <section class="training-day-card training-day-condition">
          <span>Troppstilstand</span>
          <strong id="trainingDayCondition">Ingen akutte varsler</strong>
          <p id="trainingDayLoad">Belastning beregnes fra valgt program.</p>
        </section>
      </aside>
    </div>

    <footer class="training-day-footer">
      <div><span>Neste kamp</span><strong id="trainingDayOpponent">Motstander ikke klar</strong></div>
      <button type="button" class="training-day-calendar-return" id="trainingDayReturnCalendar">Tilbake til kalenderdagen</button>
    </footer>`;

  const anchor = document.getElementById("trainingCommandPanel") || section.firstElementChild;
  section.insertBefore(surface, anchor || null);

  const openExistingChoice = (id) => document.getElementById(id)?.click();
  surface.querySelector("#trainingDayChangeProgram")?.addEventListener("click", () => openExistingChoice("teamChangeTrainingProgram"));
  surface.querySelector("#trainingDayChangeFocus")?.addEventListener("click", () => openExistingChoice("teamChangeTrainingFocus"));
  surface.querySelector("#trainingDayChangeIndividual")?.addEventListener("click", () => openExistingChoice("teamChangeIndividualTraining"));
  surface.querySelector("#trainingDayBackCalendar")?.addEventListener("click", returnToCalendarDay);
  surface.querySelector("#trainingDayReturnCalendar")?.addEventListener("click", returnToCalendarDay);
  return surface;
}

function selectedProgramTitle() {
  const card = document.querySelector("#trainingPrograms .training-program-card.is-selected");
  return String(card?.querySelector(".training-program-head h3")?.textContent || "").trim()
    || String(document.getElementById("teamSelectedTrainingProgram")?.textContent || "").trim()
    || "Treningsprogram ikke valgt";
}

function parseSession(text, index) {
  const value = String(text || "").trim().replace(/\s+/g, " ");
  const match = value.match(/^([^:]+):\s*(.*?)(?:\s*\(([^)]+)\))?$/);
  if (!match) return { day: `Økt ${index + 1}`, title: value || "Velg treningsprogram", intensity: "" };
  return { day: match[1], title: match[2], intensity: match[3] || "" };
}

function selectedSessions() {
  const rows = Array.from(document.querySelectorAll("#trainingPrograms .training-program-card.is-selected .training-program-sessions li"))
    .slice(0, 4)
    .map((item, index) => parseSession(item.textContent, index));
  while (rows.length < 4) {
    rows.push({ day: `Økt ${rows.length + 1}`, title: "Velg treningsprogram for å fylle økta", intensity: "Ikke satt" });
  }
  return rows;
}

function isExerciseSession(session) {
  return Boolean(session?.title) && !/^velg treningsprogram/i.test(String(session.title));
}

function openExerciseDesign(session, index, context) {
  if (!isExerciseSession(session)) return;
  window.dispatchEvent(new CustomEvent("hgfm:training-exercise-open", {
    detail: {
      session: {
        ...session,
        index,
        programTitle: selectedProgramTitle(),
        calendarDay: context.day
      }
    }
  }));
}

function compactText(selector, fallback = "") {
  return String(document.querySelector(selector)?.textContent || fallback).trim().replace(/\s+/g, " ");
}

function selectedFocus() {
  return compactText("#teamSelectedTrainingFocus", compactText("#weeklyTrainingStatus", "Treningsfokus ikke valgt"));
}

function selectedIndividual() {
  const assignmentText = compactText("#individualTrainingAssignments");
  if (assignmentText) return assignmentText;
  return compactText("#teamSelectedIndividualTraining", compactText("#individualTrainingCapacity", "Ingen individuell oppfølging valgt"));
}

function renderSessions(surface, context) {
  const list = surface.querySelector("#trainingDaySessions");
  if (!list) return;
  const fragment = document.createDocumentFragment();
  selectedSessions().forEach((session, index) => {
    const item = node("li", "training-day-session");
    const sameDay = session.day.toLocaleLowerCase("nb-NO").startsWith(context.day.toLocaleLowerCase("nb-NO"));
    const openable = isExerciseSession(session);
    item.dataset.currentCalendarDay = sameDay ? "true" : "false";
    item.dataset.exerciseOpenable = openable ? "true" : "false";
    item.append(
      node("span", "training-day-session-index", String(index + 1).padStart(2, "0")),
      node("span", "training-day-session-day", session.day),
      node("strong", "training-day-session-title", session.title),
      node("small", "training-day-session-intensity", session.intensity)
    );

    if (openable) {
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-haspopup", "dialog");
      item.setAttribute("aria-label", `Åpne øvelsesdesign for ${session.title}`);
      item.title = "Åpne øvelsesdesign";
      item.addEventListener("click", () => openExerciseDesign(session, index, context));
      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openExerciseDesign(session, index, context);
      });
    } else {
      item.setAttribute("aria-disabled", "true");
    }
    fragment.append(item);
  });
  list.replaceChildren(fragment);
}

function syncLocation(context) {
  const section = document.querySelector('[data-tab-section="trening"]');
  if (!section || section.hidden) return;
  const location = document.getElementById("managerLocationText");
  if (location) location.textContent = `Lag · Trening · ${context.day}`;
}

function renderTrainingDay() {
  const surface = ensureSurface();
  if (!surface) return;
  const context = currentContext();

  const back = surface.querySelector("#trainingDayBackCalendar");
  const eyebrow = surface.querySelector("#trainingDayEyebrow");
  const lede = surface.querySelector("#trainingDayLede");
  const time = surface.querySelector("#trainingDayTime");
  const event = surface.querySelector("#trainingDayEvent");
  if (back) back.textContent = `Kalender · Uke ${context.week} · ${context.day}`;
  if (eyebrow) eyebrow.textContent = `Lag · Trening · Uke ${context.week} · ${context.day}`;
  if (lede) lede.textContent = context.source === "calendar"
    ? `Åpnet fra kalenderen. Fullfør arbeidet for ${context.day.toLocaleLowerCase("nb-NO")} uten å opprette en ny tidsflyt.`
    : "Dette treningsarbeidet ligger i kalenderuka. Kalenderen er fortsatt fasit for når arbeidet skjer.";
  if (time) time.textContent = context.time || "Trening";
  if (event) event.textContent = context.eventTitle || "Treningsarbeid";

  const program = surface.querySelector("#trainingDayProgramTitle");
  const focus = surface.querySelector("#trainingDayFocus");
  const focusHint = surface.querySelector("#trainingDayFocusHint");
  const individual = surface.querySelector("#trainingDayIndividual");
  const assistant = surface.querySelector("#trainingDayAssistant");
  const assistantDetail = surface.querySelector("#trainingDayAssistantDetail");
  const condition = surface.querySelector("#trainingDayCondition");
  const load = surface.querySelector("#trainingDayLoad");
  const opponent = surface.querySelector("#trainingDayOpponent");

  if (program) program.textContent = selectedProgramTitle();
  if (focus) focus.textContent = selectedFocus();
  if (focusHint) focusHint.textContent = compactText("#weeklyTrainingRecommendation", "Fokuset kobles til den eksisterende kamp- og treningsplanen.");
  if (individual) individual.textContent = selectedIndividual();
  if (assistant) assistant.textContent = compactText(".training-assistant-signal strong", "Les dagens signaler før økta.");
  if (assistantDetail) assistantDetail.textContent = compactText(".training-assistant-signal p", "Assistentens råd bruker den eksisterende treningskonteksten.");
  if (condition) condition.textContent = compactText('.training-command-status[data-training-target="details"] .training-command-status-value', "Ingen akutte varsler");
  if (load) load.textContent = compactText(".training-load-brief", "Belastning beregnes fra valgt program.");
  if (opponent) opponent.textContent = compactText(".training-opponent-brief strong", "Motstander ikke klar");

  renderSessions(surface, context);
  syncLocation(context);
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderTrainingDay();
  });
}

function acceptCalendarContext(event) {
  const detail = event?.detail || {};
  if (detail.target !== "trening") return;
  const dayIndex = Number(detail.dayIndex);
  calendarContext = {
    week: Math.max(1, Number(detail.week) || 1),
    dayIndex: Number.isInteger(dayIndex) && dayIndex >= 1 && dayIndex <= 7 ? dayIndex : 3,
    day: String(detail.day || DAYS[dayIndex - 1] || "Onsdag"),
    time: String(detail.time || ""),
    eventId: String(detail.eventId || "training-calendar"),
    eventTitle: String(detail.eventTitle || "Treningsarbeid"),
    target: "trening",
    source: "calendar"
  };
  renderTrainingDay();
  requestAnimationFrame(() => {
    renderTrainingDay();
    syncLocation(calendarContext);
  });
}

function installObservers() {
  window.addEventListener("hgfm:calendar-open-work", acceptCalendarContext);
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("storage", scheduleRender);

  document.addEventListener("click", (event) => {
    if (event.target?.closest?.("#trainingPrograms, #weeklyTrainingOptions, #individualTrainingPicker, #individualTrainingAssignments")) {
      queueMicrotask(scheduleRender);
    }
    if (event.target?.closest?.('.main-nav [data-tab-target="tactics"]')) calendarContext = null;
  });
  document.addEventListener("change", scheduleRender);

  const observer = new MutationObserver((mutations) => {
    const surface = document.getElementById(SURFACE_ID);
    if (surface && mutations.every((mutation) => surface.contains(mutation.target))) return;
    scheduleRender();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "data-selected"] });
}

function boot() {
  ensureStyles();
  renderTrainingDay();
  installObservers();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}
