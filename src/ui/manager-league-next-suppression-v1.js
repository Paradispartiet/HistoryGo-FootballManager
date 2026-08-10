// League footer ownership v2
//
// Kalenderen eier den synlige manageruka i vanlig ligaspill. Den eksisterende
// footer-hosten beholdes, men kalender-workspacen fyller den med aktuell dag og
// neste kalenderhendelse. Den gamle generiske Next-modellen kan fortsatt brukes
// under oppstart og i andre modi.

function currentMode() {
  try {
    return JSON.parse(localStorage.getItem("hgfm.gameStartState.v1"))?.selectedMode || "league";
  } catch {
    return "league";
  }
}

function syncLeagueFooterOwnership() {
  const host = document.querySelector("manager-next-action");
  if (!host) return;

  const calendarOwnsFooter = currentMode() === "league"
    && document.documentElement.dataset.managerOfficeCalendarV1 === "active";
  host.hidden = false;
  host.dataset.leagueSuppressed = "false";
  host.dataset.calendarOwned = calendarOwnsFooter ? "true" : "false";

  const strip = host.querySelector("#nextActionStrip");
  if (strip && calendarOwnsFooter) strip.hidden = false;
  if (strip && !calendarOwnsFooter) {
    delete strip.dataset.surface;
    strip.setAttribute("aria-label", "Forslag til neste steg");
    const label = strip.querySelector(".next-action-head .eyebrow");
    if (label) label.textContent = "Forslag til neste steg";
  }
}

function installLeagueFooterOwnership() {
  syncLeagueFooterOwnership();

  // Hoved- og undernavigasjon endrer `hidden` på arbeidsflatene. Det gir en
  // liten, avgrenset synkroniseringskrok som også dekker modusskifter uten å
  // observere hele DOM-en eller innføre ny state.
  const observer = new MutationObserver(() => queueMicrotask(syncLeagueFooterOwnership));
  document.querySelectorAll("[data-tab-section]").forEach((section) => {
    observer.observe(section, { attributes: true, attributeFilter: ["hidden"] });
  });
  window.addEventListener("storage", syncLeagueFooterOwnership);
  window.addEventListener("hgfm:manager-calendar-footer-ready", syncLeagueFooterOwnership);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installLeagueFooterOwnership, { once: true });
  } else {
    installLeagueFooterOwnership();
  }
}
