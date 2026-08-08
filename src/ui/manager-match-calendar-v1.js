import { currentManagerDayIndex } from "../football-manager-calendar.js";

const STYLE_ID = "managerMatchCalendarV1Style";
const PREP_ID = "managerMatchPrepDay";
const MATCH_CONTEXT_ID = "managerMatchCalendarContext";
const TEAM_MERITS_KEY = "hgfm.teamMerits.v1";
const CLUB_WEEK_KEY = "hgfm.clubWeekState.v1";
const DAYS = Object.freeze(["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]);

let prepCalendarContext = null;
let matchCalendarContext = null;
let renderFrame = 0;
let pendingCalendarTarget = "";

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
  const direct = readJson(CLUB_WEEK_KEY, null);
  if (direct?.phase) return direct;
  const merits = readJson(TEAM_MERITS_KEY, {}) || {};
  return merits.clubWeekState || { week: 1, phase: "analysis" };
}

function validDayIndex(value, fallback) {
  const dayIndex = Number(value);
  return Number.isInteger(dayIndex) && dayIndex >= 1 && dayIndex <= 7 ? dayIndex : fallback;
}

export function createManagerMatchCalendarContext(detail = {}, clubWeek = {}) {
  const target = detail?.target === "kamp" ? "kamp" : detail?.target === "tactics" ? "tactics" : "";
  if (!target) return null;
  const fallbackDay = target === "kamp" ? 6 : 5;
  const dayIndex = validDayIndex(detail?.dayIndex, fallbackDay);
  const week = Math.max(1, Number(detail?.week ?? clubWeek?.week) || 1);
  return {
    week,
    dayIndex,
    day: String(detail?.day || DAYS[dayIndex - 1] || DAYS[fallbackDay - 1]),
    time: String(detail?.time || (target === "kamp" ? "15:00" : "10:00")),
    eventId: String(detail?.eventId || (target === "kamp" ? "matchday" : "match-prep")),
    eventTitle: String(detail?.eventTitle || (target === "kamp" ? "Kampdag" : "Kampforberedelse")),
    target,
    source: detail?.source === "calendar" ? "calendar" : "direct"
  };
}

function directContext(target) {
  const clubWeek = clubWeekState();
  const requiredPhase = target === "kamp" ? "matchday" : "match_prep";
  if (clubWeek?.phase !== requiredPhase) return null;
  const dayIndex = currentManagerDayIndex(clubWeek);
  return createManagerMatchCalendarContext({
    target,
    dayIndex,
    day: DAYS[dayIndex - 1],
    source: "direct"
  }, clubWeek);
}

function currentPrepContext() {
  const week = Math.max(1, Number(clubWeekState()?.week) || 1);
  if (prepCalendarContext?.week === week) return prepCalendarContext;
  return directContext("tactics");
}

function currentMatchContext() {
  const week = Math.max(1, Number(clubWeekState()?.week) || 1);
  if (matchCalendarContext?.week === week) return matchCalendarContext;
  return directContext("kamp");
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-match-calendar-v1.css", import.meta.url).href;
  document.head.append(link);
}

function compactText(selector, fallback = "") {
  return String(document.querySelector(selector)?.textContent || fallback).trim().replace(/\s+/g, " ");
}

function selectedLabel(selectSelector, valueSelector, fallback) {
  const selected = compactText(valueSelector);
  if (selected) return selected;
  const select = document.querySelector(selectSelector);
  return String(select?.selectedOptions?.[0]?.textContent || select?.value || fallback).trim() || fallback;
}

function opponentLabel() {
  const calendar = compactText("#managerCalendarMatch");
  if (calendar && !/ingen terminfestet/i.test(calendar)) return calendar;
  const scene = compactText("#matchdayCommand .matchday-scene-team.is-away strong");
  return scene || "Motstander ikke klar";
}

function opponentThreat() {
  const cards = Array.from(document.querySelectorAll("#matchdayCommand .matchday-scene-status-card"));
  const card = cards.find((candidate) => /motstanderens trussel/i.test(candidate.textContent || ""));
  return String(card?.querySelector("strong")?.textContent || "").trim()
    || "Motstanderbriefen bruker eksisterende kamp- og motstanderdata.";
}

function readinessText() {
  return compactText("#matchdayReadiness", "Kampklarhet kontrolleres av eksisterende readiness.");
}

function lineupStatus() {
  const starters = compactText("#squadGateStarters", "0/11");
  const roles = compactText("#squadGateRoles", "Roller ikke kontrollert");
  return { starters, roles };
}

function benchStatus() {
  return {
    bench: compactText("#squadGateBench", "0/4"),
    availability: compactText("#rosterReadinessNote", "Ingen akutte tilgjengelighetsvarsler.")
  };
}

function trainingStatus() {
  const program = compactText("#teamSelectedTrainingProgram", "Treningsprogram ikke valgt");
  const focus = compactText("#teamSelectedTrainingFocus", "Fokus ikke valgt");
  return { program, focus };
}

function returnToCalendarDay(context) {
  if (!context) return;
  const office = document.querySelector('.main-nav [role="tab"][data-tab-target="dashboard"]');
  if (!(office instanceof HTMLElement)) return;
  office.click();
  requestAnimationFrame(() => {
    const day = document.querySelector(`#managerCalendarDays .manager-calendar-day-button[data-day="${context.dayIndex}"]`);
    if (day instanceof HTMLElement) day.click();
  });
}

function clickExisting(id) {
  const target = document.getElementById(id);
  if (target instanceof HTMLElement) target.click();
}

function ensurePrepSurface() {
  const section = document.querySelector('[data-tab-section="tactics"]');
  if (!section) return null;
  let surface = document.getElementById(PREP_ID);
  if (surface) return surface;

  surface = node("section", "manager-match-prep-day");
  surface.id = PREP_ID;
  surface.hidden = true;
  surface.setAttribute("aria-label", "Kampforberedelse");
  surface.setAttribute("aria-live", "polite");
  surface.innerHTML = `
    <header class="match-prep-head">
      <div>
        <button type="button" class="match-calendar-link" id="matchPrepBackCalendar">Kalender · Uke 1 · Fredag</button>
        <p class="eyebrow" id="matchPrepEyebrow">Lag · Oppstilling · Fredag</p>
        <h2>Kampforberedelse</h2>
        <p class="match-prep-lede" id="matchPrepLede">Fredagens arbeid samler laguttak, roller, kampplan, tilgjengelighet og motstander før kampdagen.</p>
      </div>
      <div class="match-calendar-clock">
        <span id="matchPrepTime">10:00</span>
        <strong id="matchPrepEvent">Kampforberedelse</strong>
      </div>
    </header>

    <section class="match-prep-opponent" aria-label="Neste kamp">
      <div><span>Neste kamp</span><strong id="matchPrepOpponent">Motstander ikke klar</strong></div>
      <p id="matchPrepReadiness">Kampklarhet kontrolleres av eksisterende readiness.</p>
    </section>

    <div class="match-prep-grid">
      <article class="match-prep-card">
        <span>Startellever og roller</span>
        <strong id="matchPrepLineup">0/11</strong>
        <p id="matchPrepRoles">Roller ikke kontrollert</p>
        <button type="button" id="matchPrepChangePlayerRole">Endre spiller eller rolle</button>
      </article>
      <article class="match-prep-card">
        <span>Formasjon og kampplan</span>
        <strong id="matchPrepFormation">Formasjon ikke valgt</strong>
        <p id="matchPrepTactic">Kampplan ikke valgt</p>
        <button type="button" id="matchPrepChangeSystem">Endre formasjon eller kampplan</button>
      </article>
      <article class="match-prep-card">
        <span>Benk og tilgjengelighet</span>
        <strong id="matchPrepBench">0/4</strong>
        <p id="matchPrepAvailability">Ingen akutte tilgjengelighetsvarsler.</p>
        <button type="button" id="matchPrepChangeBench">Endre spiller eller rolle</button>
      </article>
      <article class="match-prep-card">
        <span>Treningsuka</span>
        <strong id="matchPrepTraining">Treningsprogram ikke valgt</strong>
        <p id="matchPrepFocus">Fokus ikke valgt</p>
      </article>
    </div>

    <section class="match-prep-brief">
      <span>Motstanderens viktigste trussel</span>
      <strong id="matchPrepThreat">Motstanderbriefen bruker eksisterende kamp- og motstanderdata.</strong>
      <p>Dette er en presentasjon av den eksisterende kampbriefen. Kampmotor, kampplan og motstanderprofil er uendret.</p>
    </section>

    <footer class="match-calendar-footer">
      <div><span>Tidsregel</span><strong>Kampdagen skjer lørdag i Kalender. Fredag flytter ikke tiden.</strong></div>
      <button type="button" class="match-calendar-return" id="matchPrepReturnCalendar">Tilbake til kalenderdagen</button>
    </footer>`;

  const anchor = document.getElementById("squadCompactStatus") || section.firstElementChild;
  section.insertBefore(surface, anchor || null);
  surface.querySelector("#matchPrepBackCalendar")?.addEventListener("click", () => returnToCalendarDay(currentPrepContext()));
  surface.querySelector("#matchPrepReturnCalendar")?.addEventListener("click", () => returnToCalendarDay(currentPrepContext()));
  surface.querySelector("#matchPrepChangePlayerRole")?.addEventListener("click", () => clickExisting("teamChangePlayerRole"));
  surface.querySelector("#matchPrepChangeBench")?.addEventListener("click", () => clickExisting("teamChangePlayerRole"));
  surface.querySelector("#matchPrepChangeSystem")?.addEventListener("click", () => clickExisting("teamChangeFormation"));
  return surface;
}

function ensureMatchContextSurface() {
  const panel = document.getElementById("matchdayCommandPanel");
  if (!panel) return null;
  let surface = document.getElementById(MATCH_CONTEXT_ID);
  if (surface) return surface;

  surface = node("section", "manager-match-calendar-context");
  surface.id = MATCH_CONTEXT_ID;
  surface.hidden = true;
  surface.setAttribute("aria-label", "Kampdag i kalenderen");
  surface.innerHTML = `
    <button type="button" class="match-calendar-link" id="matchdayBackCalendar">Kalender · Uke 1 · Lørdag</button>
    <div class="match-calendar-context-copy">
      <div><p class="eyebrow" id="matchdayCalendarEyebrow">Kamp · Lørdag</p><strong id="matchdayCalendarEvent">Kampdag</strong></div>
      <div class="match-calendar-clock"><span id="matchdayCalendarTime">15:00</span><strong id="matchdayCalendarOpponent">Motstander ikke klar</strong></div>
    </div>`;
  panel.insertBefore(surface, panel.firstChild);
  surface.querySelector("#matchdayBackCalendar")?.addEventListener("click", () => returnToCalendarDay(currentMatchContext()));
  return surface;
}

function setText(root, selector, value) {
  const target = root?.querySelector(selector);
  if (target && target.textContent !== String(value)) target.textContent = String(value);
}

function renderPrepSurface() {
  const section = document.querySelector('[data-tab-section="tactics"]');
  const surface = ensurePrepSurface();
  if (!section || !surface) return;
  const context = currentPrepContext();
  const visible = Boolean(context);
  surface.hidden = !visible;
  section.classList.toggle("has-manager-match-prep-day-v1", visible);
  if (!context) return;

  const lineup = lineupStatus();
  const bench = benchStatus();
  const training = trainingStatus();
  setText(surface, "#matchPrepBackCalendar", `Kalender · Uke ${context.week} · ${context.day}`);
  setText(surface, "#matchPrepEyebrow", `Lag · Oppstilling · Uke ${context.week} · ${context.day}`);
  setText(surface, "#matchPrepLede", context.source === "calendar"
    ? `Åpnet fra kalenderen. Fullfør kampforberedelsen for ${context.day.toLocaleLowerCase("nb-NO")} uten å opprette en ny tidsflyt.`
    : "Kampforberedelsen ligger i den eksisterende manageruka. Kalenderen er fortsatt fasit for når kampdagen skjer.");
  setText(surface, "#matchPrepTime", context.time || "10:00");
  setText(surface, "#matchPrepEvent", context.eventTitle || "Kampforberedelse");
  setText(surface, "#matchPrepOpponent", opponentLabel());
  setText(surface, "#matchPrepReadiness", readinessText());
  setText(surface, "#matchPrepLineup", `${lineup.starters} klare`);
  setText(surface, "#matchPrepRoles", lineup.roles);
  setText(surface, "#matchPrepFormation", selectedLabel("#formationSelect", "#teamSelectedFormation", "Formasjon ikke valgt"));
  setText(surface, "#matchPrepTactic", selectedLabel("#tacticSelect", "#teamSelectedTactic", "Kampplan ikke valgt"));
  setText(surface, "#matchPrepBench", `${bench.bench} kampklare`);
  setText(surface, "#matchPrepAvailability", bench.availability);
  setText(surface, "#matchPrepTraining", training.program);
  setText(surface, "#matchPrepFocus", training.focus);
  setText(surface, "#matchPrepThreat", opponentThreat());
}

function renderMatchContextSurface() {
  const surface = ensureMatchContextSurface();
  if (!surface) return;
  const context = currentMatchContext();
  surface.hidden = !context;
  if (!context) return;
  setText(surface, "#matchdayBackCalendar", `Kalender · Uke ${context.week} · ${context.day}`);
  setText(surface, "#matchdayCalendarEyebrow", `Kamp · Uke ${context.week} · ${context.day}`);
  setText(surface, "#matchdayCalendarEvent", context.eventTitle || "Kampdag");
  setText(surface, "#matchdayCalendarTime", context.time || "15:00");
  setText(surface, "#matchdayCalendarOpponent", opponentLabel());
}

function syncLocation() {
  const location = document.getElementById("managerLocationText");
  if (!location) return;
  const tactics = document.querySelector('[data-tab-section="tactics"]');
  const kamp = document.querySelector('[data-tab-section="kamp"]');
  const prep = currentPrepContext();
  const match = currentMatchContext();
  let value = "";
  if (tactics && !tactics.hidden && prep) value = `Lag · Oppstilling · ${prep.day}`;
  else if (kamp && !kamp.hidden && match) value = `Kamp · ${match.day}`;
  if (value && location.textContent !== value) location.textContent = value;
}

function renderAll() {
  renderPrepSurface();
  renderMatchContextSurface();
  syncLocation();
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderAll();
  });
}

function acceptCalendarContext(event) {
  const detail = event?.detail || {};
  if (!['tactics', 'kamp'].includes(detail.target)) return;
  const context = createManagerMatchCalendarContext(detail, clubWeekState());
  if (!context) return;
  pendingCalendarTarget = context.target;
  if (context.target === "tactics") prepCalendarContext = context;
  else matchCalendarContext = context;
  renderAll();
  queueMicrotask(() => {
    if (pendingCalendarTarget === context.target) pendingCalendarTarget = "";
    scheduleRender();
  });
}

function installObservers() {
  window.addEventListener("hgfm:calendar-open-work", acceptCalendarContext);
  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("storage", scheduleRender);
  document.addEventListener("change", scheduleRender);
  document.addEventListener("click", (event) => {
    const main = event.target?.closest?.('.main-nav [data-tab-target]');
    if (main?.dataset?.tabTarget === "tactics" && pendingCalendarTarget !== "tactics") prepCalendarContext = null;
    if (main?.dataset?.tabTarget === "kamp" && pendingCalendarTarget !== "kamp") matchCalendarContext = null;
    if (event.target?.closest?.("#managerTeamChoiceDrawer, #lineupSlots, #benchPlayersList")) queueMicrotask(scheduleRender);
  }, true);

  const observer = new MutationObserver((mutations) => {
    const prep = document.getElementById(PREP_ID);
    const match = document.getElementById(MATCH_CONTEXT_ID);
    if (mutations.every((mutation) => prep?.contains(mutation.target) || match?.contains(mutation.target))) return;
    scheduleRender();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class", "data-ready", "aria-selected"] });

  const location = document.getElementById("managerLocationText");
  if (location) {
    new MutationObserver(() => queueMicrotask(syncLocation)).observe(location, { childList: true, characterData: true, subtree: true });
  }
}

function boot() {
  ensureStyles();
  renderAll();
  installObservers();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}
