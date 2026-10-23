import { currentManagerDayIndex } from "../football-manager-calendar.js";
import { getTrainingProgramCompositionById } from "../football-training-program-compositions.js";
import { MODE_SESSION_KEY } from "../football-mode-sessions.js";

const STYLE_ID = "managerTrainingDayV1Style";
const SURFACE_ID = "managerTrainingDay";
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
const WEEKLY_TRAINING_PROGRAM_KEY = "hgfm.weeklyTrainingProgram.v1";
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
  // Prefer active mode-session data. The legacy league snapshot is only a
  // fallback; otherwise switching modes can display the wrong calendar week.
  const envelope = readJson(MODE_SESSION_KEY, null);
  const activeWeek = envelope?.sessions?.[envelope.activeMode]?.clubWeekState;
  if (activeWeek && Number(activeWeek.week) >= 1) return activeWeek;
  if (envelope?.activeMode && envelope.activeMode !== "league") return { week: 1, phase: "analysis" };
  const merits = readJson(TEAM_MERITS_KEY, {}) || {};
  return merits.clubWeekState || { week: 1, phase: "analysis" };
}

function activeModeLearningState() {
  const envelope = readJson(MODE_SESSION_KEY, null);
  return envelope?.sessions?.[envelope?.activeMode] || {};
}

function currentContext() {
  const clubWeek = clubWeekState();
  const week = Math.max(1, Number(clubWeek.week) || 1);
  // A calendar navigation context belongs to one concrete club week. Once
  // matchday advances the save, don't keep displaying last week's Wednesday.
  if (calendarContext?.target === "trening" && Number(calendarContext.week) === week) {
    return calendarContext;
  }
  if (calendarContext && Number(calendarContext.week) !== week) calendarContext = null;
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
  surface.innerHTML = `
    <header class="training-day-head">
      <div>
        <button type="button" class="training-day-calendar-link" id="trainingDayBackCalendar">Kalender · Uke 1 · Onsdag</button>
        <p class="eyebrow" id="trainingDayEyebrow">Lag · Trening · Onsdag</p>
        <h2>Treningsdag</h2>
        <p class="training-day-lede" id="trainingDayLede">Velg ukas program, se de fire øktene og tilpass fokus. Følg opp enkeltspillere ved behov.</p>
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
            <small class="training-day-exercise-hint" id="trainingDayExerciseHint">Spillet foreslår øvelser ut fra ukas program, taktikk, motstander og tropp.</small>
          </div>
          <button type="button" class="training-day-action" id="trainingDayChangeProgram">Endre program</button>
        </header>
        <ol class="training-day-sessions" id="trainingDaySessions" aria-label="Fire treningsøkter"></ol>
      </section>

      <aside class="training-day-side">
        <section class="training-day-card training-day-problem-suggestion" id="trainingDayProblemSuggestion" hidden>
          <header><span>Forslag fra etterkampen</span><button type="button" id="trainingDayChooseSuggestedFocus">Velg fokus</button></header>
          <strong id="trainingDayProblemTitle">Problem å følge opp</strong>
          <p id="trainingDayProblemDetail"></p>
          <small>Forslaget endrer ikke program eller fokus automatisk. Du tar fortsatt valget.</small>
        </section>
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

    <details class="training-day-resources" id="trainingDayResources">
      <summary>Fotballfaglig fordypning</summary>
      <div class="training-day-resources-body" id="trainingDayResourcesBody"></div>
    </details>

    <footer class="training-day-footer">
      <div><span>Neste kamp</span><strong id="trainingDayOpponent">Motstander ikke klar</strong></div>
      <button type="button" class="training-day-calendar-return" id="trainingDayReturnCalendar">Tilbake til kalenderdagen</button>
    </footer>`;

  const anchor = document.getElementById("trainingCommandPanel") || section.firstElementChild;
  section.insertBefore(surface, anchor || null);
  // Keep the old educational modal actions reachable, but fold them into the
  // actual training scene instead of leaving a second standalone button wall.
  const resources = section.querySelector(".training-support-actions");
  const resourcesBody = surface.querySelector("#trainingDayResourcesBody");
  if (resources && resourcesBody) resourcesBody.append(resources);

  const openExistingChoice = (id) => document.getElementById(id)?.click();
  surface.querySelector("#trainingDayChangeProgram")?.addEventListener("click", () => openExistingChoice("teamChangeTrainingProgram"));
  surface.querySelector("#trainingDayChangeFocus")?.addEventListener("click", () => openExistingChoice("teamChangeTrainingFocus"));
  surface.querySelector("#trainingDayChangeIndividual")?.addEventListener("click", () => openExistingChoice("teamChangeIndividualTraining"));
  surface.querySelector("#trainingDayChooseSuggestedFocus")?.addEventListener("click", () => openExistingChoice("teamChangeTrainingFocus"));
  surface.querySelector("#trainingDayBackCalendar")?.addEventListener("click", returnToCalendarDay);
  surface.querySelector("#trainingDayReturnCalendar")?.addEventListener("click", returnToCalendarDay);
  return surface;
}

function selectedProgramModel() {
  const envelope = readJson(MODE_SESSION_KEY, null);
  const activeSession = envelope?.sessions?.[envelope.activeMode] || {};
  // The mode-session is authoritative for the currently active save. Only
  // league or pre-envelope games may read the legacy league key.
  const stored = Object.hasOwn(activeSession, "weeklyTrainingProgram")
    ? activeSession.weeklyTrainingProgram
    : envelope?.activeMode && envelope.activeMode !== "league"
      ? null
      : readJson(WEEKLY_TRAINING_PROGRAM_KEY, null);
  const programId = typeof stored?.programId === "string" ? stored.programId : "";
  const currentWeek = Math.max(1, Number(clubWeekState().week) || 1);
  if (Number(stored?.week) !== currentWeek) return null;
  return programId ? getTrainingProgramCompositionById(programId) : null;
}

function selectedProgramTitle() {
  const card = document.querySelector("#trainingPrograms .training-program-card.is-selected");
  return String(card?.querySelector(".training-program-head h3")?.textContent || "").trim()
    || String(document.getElementById("teamSelectedTrainingProgram")?.textContent || "").trim()
    || String(selectedProgramModel()?.title || "").trim()
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
    .map((item, index) => ({
      ...parseSession(item.textContent, index),
      exercise: item.dataset.exercise || "",
      relevance: item.dataset.relevance || "",
      load: item.dataset.load || "",
      basis: item.dataset.basis || ""
    }));

  if (!rows.length) {
    const program = selectedProgramModel();
    rows.push(...(Array.isArray(program?.sessions) ? program.sessions : []).slice(0, 4).map((session, index) => ({
      day: String(session?.day || `Økt ${index + 1}`),
      title: String(session?.title || "Velg treningsprogram"),
      intensity: String(session?.intensity || ""),
      exercise: String(session?.tacticalObjective || ""),
      relevance: "Økta følger det valgte treningsprogrammets fotballfaglige mål.",
      load: "Belastningen styres av ukas valgte program.",
      basis: "valgt program"
    })));
  }

  while (rows.length < 4) {
    rows.push({ day: `Økt ${rows.length + 1}`, title: "Velg treningsprogram for å fylle økta", intensity: "Ikke satt" });
  }
  return rows;
}

function isExerciseSession(session) {
  return Boolean(session?.title) && !/^velg treningsprogram/i.test(String(session.title));
}

function compactText(selector, fallback = "") {
  return String(document.querySelector(selector)?.textContent || fallback).trim().replace(/\s+/g, " ");
}

function selectedFocus() {
  return compactText("#teamSelectedTrainingFocus", compactText("#weeklyTrainingStatus", "Treningsfokus ikke valgt"));
}

export function summarizeVisibleIndividualAssignments(names = []) {
  const players = (Array.isArray(names) ? names : []).map((name) => String(name || "").trim()).filter(Boolean);
  if (!players.length) return "Ingen individuell oppfølging valgt";
  return `${players.length} ${players.length === 1 ? "spiller" : "spillere"}: ${players.join(" · ")}`;
}

function selectedIndividual() {
  const names = [...document.querySelectorAll("#individualTrainingAssignments .individual-training-card h5")]
    .map((title) => title.textContent);
  return summarizeVisibleIndividualAssignments(names);
}

function individualCapacityHint() {
  const value = compactText("#individualTrainingCapacity");
  const headline = value.match(/^.*?[.!?](?=\s|$)/)?.[0] || value;
  return `Valgfritt · ${headline || "Velg en spiller dersom noen trenger individuell oppfølging."}`;
}

function renderSessions(surface, context) {
  const list = surface.querySelector("#trainingDaySessions");
  if (!list) return;
  const sessions = selectedSessions();
  const signature = JSON.stringify({
    week: Number(context.week) || 1,
    dayIndex: Number(context.dayIndex) || 3,
    day: String(context.day || ""),
    sessions: sessions.map((session) => ({
      day: String(session.day || ""),
      title: String(session.title || ""),
      intensity: String(session.intensity || ""),
      openable: isExerciseSession(session),
      exercise: String(session.exercise || ""),
      relevance: String(session.relevance || ""),
      load: String(session.load || ""),
      basis: String(session.basis || "")
    }))
  });
  if (list.dataset.renderSignature === signature) return;

  const fragment = document.createDocumentFragment();
  sessions.forEach((session, index) => {
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
      const details = node("details", "training-day-session-advice");
      const summary = node("summary", "");
      summary.append(
        node("span", "training-day-session-advice-label", "Anbefalt øvelse"),
        node("strong", "training-day-session-recommendation", session.exercise || session.title),
        node("span", "training-day-session-expand", "Hvorfor denne øvelsen?")
      );
      details.append(summary);
      const recommendation = node("div", "training-day-session-advice-body");
      recommendation.append(
        node("p", "", session.relevance || "Denne økta følger det valgte treningsprogrammets mål."),
        node("small", "", session.load || "Belastningen følger det valgte programmet.")
      );
      details.append(recommendation);
      item.append(details);
    } else {
      item.setAttribute("aria-disabled", "true");
    }
    fragment.append(item);
  });
  list.replaceChildren(fragment);
  list.dataset.renderSignature = signature;
}

function syncLocation(context) {
  const section = document.querySelector('[data-tab-section="trening"]');
  if (!section || section.hidden) return;
  const location = document.getElementById("managerLocationText");
  const value = `Lag · Trening · ${context.day}`;
  if (location && location.textContent !== value) location.textContent = value;
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
  if (lede) lede.textContent = "Velg treningsprogram, se øktene og tilpass ukas fokus. Individuell oppfølging er valgfri.";
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
  const learningState = activeModeLearningState();
  const suggestion = learningState.trainingProblemSuggestion;

  if (program) program.textContent = selectedProgramTitle();
  if (focus) focus.textContent = selectedFocus();
  if (focusHint) focusHint.textContent = compactText("#weeklyTrainingRecommendation", "Fokuset kobles til den eksisterende kamp- og treningsplanen.");
  if (individual) individual.textContent = selectedIndividual();
  const individualHint = surface.querySelector("#trainingDayIndividualHint");
  if (individualHint) individualHint.textContent = individualCapacityHint();
  if (assistant) assistant.textContent = compactText(".training-assistant-signal strong", "Les dagens signaler før økta.");
  if (assistantDetail) assistantDetail.textContent = compactText(".training-assistant-signal p", "Assistentens råd bruker den eksisterende treningskonteksten.");
  if (condition) condition.textContent = compactText('.training-command-status[data-training-target="details"] .training-command-status-value', "Ingen akutte varsler");
  if (load) load.textContent = compactText(".training-load-brief", "Belastning beregnes fra valgt program.");
  if (opponent) opponent.textContent = compactText(".training-opponent-brief strong", "Motstander ikke klar");

  const suggestionCard = surface.querySelector("#trainingDayProblemSuggestion");
  if (suggestionCard) {
    suggestionCard.hidden = !suggestion;
    const title = suggestionCard.querySelector("#trainingDayProblemTitle");
    const detail = suggestionCard.querySelector("#trainingDayProblemDetail");
    if (title) title.textContent = suggestion?.title || "Problem å følge opp";
    if (detail) detail.textContent = suggestion?.question || suggestion?.problem || "Vurder problemet før du velger ukas arbeid.";
  }
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
  const renderLearningChange = () => {
    // Hendelsene sendes etter at den aktive modussesjonen er skrevet. Vis
    // resultatet i samme brukerhandling; den planlagte runden synkroniserer
    // fortsatt øvrige DOM-endringer fra app-renderingen.
    renderTrainingDay();
    scheduleRender();
  };
  window.addEventListener("hgfm:training-hypothesis-changed", renderLearningChange);
  window.addEventListener("hgfm:training-problem-suggested", renderLearningChange);
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("storage", scheduleRender);

  document.addEventListener("click", (event) => {
    if (event.target?.closest?.("#trainingPrograms, #weeklyTrainingOptions, #individualTrainingPicker, #individualTrainingAssignments")) {
      queueMicrotask(scheduleRender);
    }
    if (event.target?.closest?.('.main-nav [data-tab-target="tactics"]')) calendarContext = null;
  });
  document.addEventListener("change", scheduleRender);

  const trainingSourceSelector = [
    '[data-tab-section="trening"]',
    "#trainingPrograms",
    "#weeklyTrainingOptions",
    "#individualTrainingPicker",
    "#individualTrainingAssignments",
    "#teamSelectedTrainingProgram",
    "#teamSelectedTrainingFocus",
    "#teamSelectedIndividualTraining",
    "#weeklyTrainingStatus",
    "#individualTrainingCapacity",
    ".training-assistant-signal",
    ".training-command-status",
    ".training-load-brief",
    ".training-opponent-brief"
  ].join(", ");

  const touchesTrainingSource = (mutation) => {
    const target = mutation.target instanceof Element
      ? mutation.target
      : mutation.target?.parentElement;
    if (target?.closest?.(trainingSourceSelector)) return true;
    if (mutation.type !== "childList") return false;
    return [...mutation.addedNodes, ...mutation.removedNodes].some((candidate) => {
      if (!(candidate instanceof Element)) return false;
      return candidate.matches(trainingSourceSelector) || Boolean(candidate.querySelector(trainingSourceSelector));
    });
  };

  const observer = new MutationObserver((mutations) => {
    const surface = document.getElementById(SURFACE_ID);
    if (surface && mutations.every((mutation) => surface.contains(mutation.target))) return;
    if (!mutations.some(touchesTrainingSource)) return;
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
