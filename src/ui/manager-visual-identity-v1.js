// Manager Visual Identity v1
//
// Presentasjonskontekst for Pass 6. Modulen leser bare hvilken eksisterende
// managerflate som er synlig og eksponerer dette som data-attributter/CSS-token.
// Den eier ingen motor, progresjon, nettverk eller lagring.

const STYLE_ID = "managerVisualIdentityV1Style";

const AREA_BY_TARGET = Object.freeze({
  dashboard: "office",
  calendar: "office",
  inbox: "office",
  board: "office",
  officeHelp: "office",
  admin: "office",
  facilities: "office",
  market: "office",
  progression: "office",
  tactics: "team",
  squad: "team",
  trening: "team",
  system: "team",
  historygo: "scouting",
  scoutingClubs: "scouting",
  kamp: "match",
  analysis: "match",
  statistikk: "stats",
  scenarios: "scenario",
  hgfmLibrary: "science"
});

const KIND_BY_TARGET = Object.freeze({
  calendar: "timeline",
  board: "organization",
  tactics: "pitch",
  squad: "roster",
  trening: "training",
  system: "system",
  historygo: "scouting-list",
  scoutingClubs: "club-list",
  kamp: "matchday",
  analysis: "analysis",
  statistikk: "stats",
  scenarios: "scenario",
  hgfmLibrary: "science"
});

function ensureStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-visual-identity-v1.css", import.meta.url).href;
  document.head.append(link);
}

export function resolveManagerVisualContext(target, parent = "") {
  const normalizedTarget = String(target || "").trim();
  const normalizedParent = String(parent || "").trim();
  const area = AREA_BY_TARGET[normalizedTarget]
    || AREA_BY_TARGET[normalizedParent]
    || "office";
  const surface = normalizedTarget || normalizedParent || "dashboard";
  return {
    area,
    surface,
    kind: KIND_BY_TARGET[surface]
      || (area === "office" ? "office" : area)
  };
}

function visibleSection() {
  return [...document.querySelectorAll("[data-tab-section]")]
    .find((section) => !section.hidden && getComputedStyle(section).display !== "none") || null;
}

function visibleMainTabCount() {
  return [...document.querySelectorAll('.main-nav .nav-tab[data-tab-target]')]
    .filter((button) => !button.hidden && getComputedStyle(button).display !== "none").length;
}

export function syncManagerVisualContext() {
  if (typeof document === "undefined") return null;
  const section = visibleSection();
  const context = resolveManagerVisualContext(section?.dataset.tabSection, section?.dataset.tabParent);
  const count = Math.max(1, visibleMainTabCount());
  const targets = [document.documentElement, document.body].filter(Boolean);
  targets.forEach((target) => {
    target.dataset.managerArea = context.area;
    target.dataset.managerSurface = context.surface;
    target.dataset.managerSceneKind = context.kind;
    target.style.setProperty("--manager-nav-count", String(count));
  });
  return { ...context, navCount: count };
}

let frame = 0;
function scheduleSync() {
  if (typeof requestAnimationFrame !== "function") return syncManagerVisualContext();
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = 0;
    syncManagerVisualContext();
  });
}

function boot() {
  ensureStyles();
  syncManagerVisualContext();
  const observer = new MutationObserver(scheduleSync);
  const subnav = document.getElementById("appSubnav");
  const app = document.getElementById("app");
  const mainNav = document.querySelector(".main-nav");
  [app, subnav, mainNav].filter(Boolean).forEach((target) => {
    observer.observe(target, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden", "aria-selected", "data-tab-target", "data-tab-parent"]
    });
  });
  window.addEventListener("hgfm:team-merits-changed", scheduleSync);
  window.addEventListener("updateProfile", scheduleSync);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}
