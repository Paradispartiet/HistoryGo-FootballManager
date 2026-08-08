// League Next suppression v1
//
// Kalenderen eier tid og progresjon i vanlig ligaspill. Den gamle globale
// «Forslag til neste steg»-footeren beholdes kun som kompatibilitet for andre
// modi, men skal aldri konkurrere med Kalender/Lag/Kamp i en aktiv ligasave.

function currentMode() {
  try {
    return JSON.parse(localStorage.getItem("hgfm.gameStartState.v1"))?.selectedMode || "league";
  } catch {
    return "league";
  }
}

function suppressLeagueNextSurface() {
  const host = document.querySelector("manager-next-action");
  if (!host) return;

  const leagueMode = currentMode() === "league";
  host.hidden = leagueMode;
  host.dataset.leagueSuppressed = leagueMode ? "true" : "false";

  // app.js kan fortsatt rendre den interne Next-modellen for onboarding og
  // kompatibilitet. I ligaspill holdes også selve stripen eksplisitt skjult,
  // slik at senere renders ikke kan få den fram på Lag/Trening/Kamp.
  if (leagueMode) {
    const strip = host.querySelector("#nextActionStrip");
    if (strip) strip.hidden = true;
  }
}

function installLeagueNextSuppression() {
  suppressLeagueNextSurface();

  // Hoved- og undernavigasjon endrer `hidden` på arbeidsflatene. Det gir en
  // liten, avgrenset synkroniseringskrok som også dekker modusskifter uten å
  // observere hele DOM-en eller innføre ny state.
  const observer = new MutationObserver(() => queueMicrotask(suppressLeagueNextSurface));
  document.querySelectorAll("[data-tab-section]").forEach((section) => {
    observer.observe(section, { attributes: true, attributeFilter: ["hidden"] });
  });
  window.addEventListener("storage", suppressLeagueNextSurface);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installLeagueNextSuppression, { once: true });
  } else {
    installLeagueNextSuppression();
  }
}
