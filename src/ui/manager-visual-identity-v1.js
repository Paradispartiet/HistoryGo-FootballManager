// Manager Visual Identity v1
//
// Presentasjonskontekst for Pass 6. Modulen leser bare hvilken eksisterende
// managerflate som er valgt og eksponerer dette som data-attributter/CSS-token.
// Den eier ingen motor, progresjon, nettverk eller lagring.

const STYLE_ID = "managerVisualIdentityV1Style";
const LAYOUT_STYLE_ID = "managerVisualIdentityLayoutV1Style";
const CORE_MANAGER_AREAS = new Set(["office", "team", "scouting", "match", "stats"]);

const AREA_BY_TARGET = Object.freeze({
  dashboard: "office",
  calendar: "office",
  inbox: "office",
  board: "office",
  officeHelp: "office",
  admin: "office",
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

function appendStylesheet(id, filename) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = new URL(filename, import.meta.url).href;
  document.head.append(link);
}

function ensureStyles() {
  if (typeof document === "undefined") return;
  appendStylesheet(STYLE_ID, "./manager-visual-identity-v1.css");
  appendStylesheet(LAYOUT_STYLE_ID, "./manager-visual-identity-layout-v1.css");
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

function isActuallyVisible(element) {
  return Boolean(element) && !element.hidden && getComputedStyle(element).display !== "none";
}

function activeShellTarget() {
  const activeSubtab = [...document.querySelectorAll('.app-subnav .app-subtab[data-tab-target][aria-selected="true"]')]
    .find(isActuallyVisible);
  if (activeSubtab?.dataset.tabTarget) return activeSubtab.dataset.tabTarget;

  const activeMain = [...document.querySelectorAll('.main-nav .nav-tab[data-tab-target][aria-selected="true"]')]
    .find(isActuallyVisible);
  if (activeMain?.dataset.tabTarget) return activeMain.dataset.tabTarget;

  const section = [...document.querySelectorAll("[data-tab-section]")]
    .find(isActuallyVisible);
  return section?.dataset.tabSection || "dashboard";
}

function targetParent(target) {
  return document.querySelector(`[data-tab-section="${CSS.escape(String(target || ""))}"]`)?.dataset.tabParent || "";
}

function visibleMainTabCount() {
  return [...document.querySelectorAll('.main-nav .nav-tab[data-tab-target]')]
    .filter((button) => !button.hidden).length;
}

export function syncManagerVisualContext() {
  if (typeof document === "undefined") return null;
  const target = activeShellTarget();
  const context = resolveManagerVisualContext(target, targetParent(target));
  // Ligaspillets canonical shell har fem stabile hovedområder. Å lese computed
  // visibility mens Speiding repurposes gammel Klubb-fane skapte et kort
  // oppstartsøyeblikk med 3 kolonner. For de fem managerområdene er derfor
  // femkolonne-layouten selve kontrakten; andre modi bruker faktisk fanetall.
  const count = CORE_MANAGER_AREAS.has(context.area)
    ? 5
    : Math.max(1, visibleMainTabCount());
  const targets = [document.documentElement, document.body].filter(Boolean);
  targets.forEach((node) => {
    node.dataset.managerArea = context.area;
    node.dataset.managerSurface = context.surface;
    node.dataset.managerSceneKind = context.kind;
    node.style.setProperty("--manager-nav-count", String(count));
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
      attributeFilter: ["hidden", "aria-selected", "class", "style", "data-tab-target", "data-tab-parent"]
    });
  });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(".main-nav, .app-subnav")) return;
    // Enkelte eksisterende nav-handlere (bl.a. Speiding) gjør selve målbyttet i
    // queueMicrotask. Legg vår synk bak den køen og behold RAF som sikkerhetsnett
    // for eventuelle etterfølgende DOM-mutasjoner.
    queueMicrotask(syncManagerVisualContext);
    scheduleSync();
  });
  window.addEventListener("hgfm:team-merits-changed", scheduleSync);
  window.addEventListener("updateProfile", scheduleSync);
  window.addEventListener("pageshow", scheduleSync);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}
