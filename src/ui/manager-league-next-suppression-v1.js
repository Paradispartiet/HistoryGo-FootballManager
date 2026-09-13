// League footer ownership v2
//
// Kalenderen eier den synlige manageruka i vanlig ligaspill. Den eksisterende
// footer-hosten beholdes, men kalender-workspacen fyller den med aktuell dag og
// neste kalenderhendelse. Den gamle generiske Next-modellen kan fortsatt brukes
// under oppstart og i andre modi.

function currentGameStartState() {
  try {
    return JSON.parse(localStorage.getItem("hgfm.gameStartState.v1")) || {};
  } catch {
    return {};
  }
}

function calendarOwnsLeagueFooter() {
  const start = currentGameStartState();
  if ((start.selectedMode || "league") !== "league") return false;
  if (!start.activeLeagueSaveId && start.leagueSeasonStatus !== "active") return false;
  if (localStorage.getItem("hgfm.onboarded.v1") === "1") return true;
  const onboarding = document.getElementById("onboardingScreen");
  return !onboarding || onboarding.hidden;
}

function syncLeagueFooterOwnership() {
  const host = document.querySelector("manager-next-action");
  if (!host) return;

  // Eierskap må følge canonical save-state direkte. Presentasjonsmarkøren
  // managerOfficeCalendarV1 oppdateres av kalenderens render-loop og kan derfor
  // ligge én animation frame etter overgangen preseason → aktiv sesong. Brukes
  // den som sannhet her, kan kalenderen og suppression-laget skrive samme
  // footer frem og tilbake i en MutationObserver/microtask-loop.
  const calendarOwnsFooter = calendarOwnsLeagueFooter();
  if (host.hidden) host.hidden = false;
  if (host.dataset.leagueSuppressed !== "false") host.dataset.leagueSuppressed = "false";
  const ownership = calendarOwnsFooter ? "true" : "false";
  if (host.dataset.calendarOwned !== ownership) host.dataset.calendarOwned = ownership;

  const strip = host.querySelector("#nextActionStrip");
  if (strip && calendarOwnsFooter && strip.hidden) strip.hidden = false;
  if (strip && !calendarOwnsFooter) {
    if (strip.dataset.surface) delete strip.dataset.surface;
    if (strip.dataset.calendarInteractive) delete strip.dataset.calendarInteractive;
    if (strip.onclick) strip.onclick = null;
    if (strip.getAttribute("aria-label") !== "Forslag til neste steg") {
      strip.setAttribute("aria-label", "Forslag til neste steg");
    }
    const label = strip.querySelector(".next-action-head .eyebrow");
    if (label && label.textContent !== "Forslag til neste steg") label.textContent = "Forslag til neste steg";
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
