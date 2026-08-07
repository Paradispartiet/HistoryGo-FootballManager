const SETTINGS_ICON = `
  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V19a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1H4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.56V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83-2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.56 1H20a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>
  </svg>`;

const OFFICE_DEEP_TARGETS = new Set(["progression", "admin", "facilities", "market"]);
const LOCATION_LABELS = Object.freeze({
  dashboard: "Kontor · Oppstartshjelp",
  inbox: "Kontor · Innboks",
  calendar: "Kontor · Kalender",
  board: "Kontor · Klubbdrift",
  historygo: "Kontor · Speiding",
  progression: "Kontor · Klubbdrift · Utvikling",
  admin: "Kontor · Klubbdrift · Stab & drift",
  facilities: "Kontor · Klubbdrift · Fasiliteter",
  market: "Kontor · Klubbdrift · Marked",
  officeHelp: "Kontor · Oppstartshjelp",
  tactics: "Lag · Oppstilling",
  squad: "Lag · Tropp & benk",
  trening: "Lag · Trening",
  system: "Lag · Systemet",
  kamp: "Kamp · Kampdag",
  analyse: "Kamp · Analyse",
  statistikk: "Stats",
  scenarios: "Scenario",
  hgfmLibrary: "Fotballvitenskap"
});

function currentMode() {
  try {
    return JSON.parse(localStorage.getItem("hgfm.gameStartState.v1"))?.selectedMode || "league";
  } catch {
    return "league";
  }
}

function ensureShellStyle() {
  if (document.getElementById("manager-information-architecture-v4-style")) return;
  const style = document.createElement("style");
  style.id = "manager-information-architecture-v4-style";
  style.textContent = `
    .office-subnav-proxy { display: none !important; }
    .manager-location-bar {
      display: flex;
      align-items: center;
      gap: .55rem;
      min-width: 0;
      padding: .45rem clamp(.75rem, 2vw, 1.1rem);
      border-bottom: 1px solid rgba(255,255,255,.12);
      background: #070a0f;
      color: rgba(255,255,255,.72);
      font-size: .78rem;
    }
    .manager-location-bar span {
      font-size: .66rem;
      font-weight: 900;
      letter-spacing: .09em;
      text-transform: uppercase;
      color: rgba(255,255,255,.48);
    }
    .manager-location-bar strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #fff;
    }
    .app-subtab.is-office-group-active {
      border-color: rgba(255,255,255,.82);
      color: #fff;
      background: rgba(255,255,255,.10);
    }
    .office-help-shell {
      display: grid;
      gap: 1rem;
    }
    .office-help-intro {
      padding: clamp(1rem, 2vw, 1.4rem);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 14px;
      background: #0b1018;
    }
    .office-help-intro h2,
    .office-help-intro p { margin-top: .35rem; margin-bottom: 0; }
    .next-action-secondary { display: none !important; }
    .next-action-destination {
      display: block;
      margin-top: .2rem;
      color: rgba(255,255,255,.62);
      font-size: .72rem;
    }
    .statistikk-view .season-depth { border-color: rgba(255,255,255,.26); }
    .statistikk-view .season-depth > summary { font-weight: 900; }
    @media (max-width: 640px) {
      .manager-location-bar { padding-inline: .7rem; }
    }
  `;
  document.head.append(style);
}

function activateShellTarget(target) {
  const section = document.querySelector(`[data-tab-section="${target}"]`);
  if (!section) return;
  document.querySelectorAll("[data-tab-section]").forEach((candidate) => {
    candidate.hidden = candidate !== section;
  });

  const parent = section.dataset.tabParent || target;
  document.querySelectorAll(".nav-tab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === parent;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
  document.querySelectorAll(".app-subtab[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === target;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });

  const subnav = document.querySelector("#appSubnav");
  if (subnav && parent === "dashboard") subnav.hidden = false;
  window.scrollTo({ top: 0, behavior: "auto" });
  syncOrientation();
}

function createSubtab(subnav, target, label, { visible = true } = {}) {
  let button = subnav.querySelector(`.app-subtab[data-tab-target="${target}"]`);
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "app-subtab";
    button.setAttribute("role", "tab");
    button.dataset.tabTarget = target;
    button.addEventListener("click", () => activateShellTarget(target));
    subnav.append(button);
  }
  button.dataset.subnavParent = "dashboard";
  button.textContent = label;
  button.classList.toggle("office-subnav-proxy", !visible);
  return button;
}

function ensureOfficeHelpSection() {
  let section = document.querySelector('[data-tab-section="officeHelp"]');
  if (!section) {
    section = document.createElement("div");
    section.className = "tab-section dept office-help-shell";
    section.dataset.tabSection = "officeHelp";
    section.dataset.tabParent = "dashboard";
    section.hidden = true;
    section.innerHTML = `
      <section class="office-help-intro" aria-label="Oppstartshjelp">
        <p class="eyebrow">Hjelp</p>
        <h2>Oppstartshjelp og klubbuke</h2>
        <p class="muted-text">Dette er støtteinformasjon, ikke managerkontorets førsteside. Bruk den hvis du står fast eller vil se hele klubbukens detaljer.</p>
      </section>`;
    document.querySelector("#app")?.append(section);
  }

  ["leagueOnboardingPanel", "officeCommandPanel", "officeDepth"].forEach((id) => {
    const node = document.querySelector(`#${id}`);
    if (node && node.parentElement !== section) section.append(node);
  });
  return section;
}

function installLocationBar() {
  let bar = document.querySelector("#managerLocationBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "managerLocationBar";
    bar.className = "manager-location-bar";
    bar.setAttribute("aria-live", "polite");
    bar.innerHTML = '<span>Du er her</span><strong id="managerLocationText">Kontor · Innboks</strong>';
    document.querySelector("#appSubnav")?.before(bar);
  }
  return bar;
}

function syncStatsPresentation() {
  const statsLabel = document.querySelector('.nav-tab[data-tab-target="statistikk"] .nav-label');
  if (statsLabel && statsLabel.textContent !== "Stats") statsLabel.textContent = "Stats";
  const statsTitle = document.querySelector("#seasonCommand h2");
  if (statsTitle && statsTitle.textContent !== "Stats") statsTitle.textContent = "Stats";
  const depth = document.querySelector("#leagueSeasonOverview .season-depth");
  if (depth) {
    if (!depth.open) depth.open = true;
    const summary = depth.querySelector(":scope > summary");
    if (summary && summary.textContent !== "Full tabell og terminliste") {
      summary.textContent = "Full tabell og terminliste";
    }
  }
}

function redirectLeagueDashboardToInbox() {
  if (currentMode() !== "league") return;
  const active = document.querySelector('[data-tab-section="dashboard"]:not([hidden])');
  if (!active) return;
  const inbox = document.querySelector('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="inbox"]');
  if (inbox && !inbox.hidden) queueMicrotask(() => inbox.click());
}

function syncOrientation() {
  syncStatsPresentation();
  redirectLeagueDashboardToInbox();

  const active = document.querySelector('[data-tab-section]:not([hidden])');
  const target = active?.dataset.tabSection || "inbox";
  const location = document.querySelector("#managerLocationText");
  if (location) location.textContent = LOCATION_LABELS[target] || target;

  const clubTab = document.querySelector('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]');
  if (clubTab) {
    const grouped = OFFICE_DEEP_TARGETS.has(target);
    clubTab.classList.toggle("is-office-group-active", grouped);
    if (grouped) clubTab.setAttribute("aria-selected", "true");
  }

  const destination = document.querySelector("#nextActionDestination");
  const tag = document.querySelector("#nextActionPrimaryTag")?.textContent?.trim();
  if (destination) destination.textContent = tag || "neste arbeidsflate";
}

function applyManagerInformationArchitectureV4() {
  if (document.documentElement.dataset.managerIaV4 === "true") return;
  document.documentElement.dataset.managerIaV4 = "true";
  ensureShellStyle();

  const clubMainTab = document.querySelector('.nav-tab[data-tab-target="board"]');
  if (clubMainTab) clubMainTab.hidden = true;

  const inboxHeading = document.querySelector('.dept-inbox h2');
  if (inboxHeading) inboxHeading.textContent = "Innboks";

  ["board", "historygo", "progression", "admin", "facilities", "market"].forEach((target) => {
    const section = document.querySelector(`[data-tab-section="${target}"]`);
    if (!section) return;
    section.dataset.tabParent = "dashboard";
    section.removeAttribute("data-shell-hidden");
  });

  ensureOfficeHelpSection();

  const subnav = document.querySelector("#appSubnav");
  if (subnav) {
    const overview = subnav.querySelector('.app-subtab[data-tab-target="dashboard"]');
    if (overview) overview.classList.add("office-subnav-proxy");
    const inbox = subnav.querySelector('.app-subtab[data-tab-target="inbox"]');
    if (inbox) {
      inbox.dataset.subnavParent = "dashboard";
      inbox.textContent = "Innboks";
    }

    const legacyLabels = {
      board: "Klubbdrift",
      historygo: "Speiding",
      progression: "Utvikling",
      admin: "Stab & drift",
      facilities: "Fasiliteter",
      market: "Marked"
    };
    Object.entries(legacyLabels).forEach(([target, label]) => {
      const existing = subnav.querySelector(`.app-subtab[data-tab-target="${target}"]`);
      if (!existing) return;
      existing.dataset.subnavParent = "dashboard";
      existing.textContent = label;
      existing.classList.toggle("office-subnav-proxy", OFFICE_DEEP_TARGETS.has(target));
    });

    createSubtab(subnav, "board", "Klubbdrift");
    createSubtab(subnav, "historygo", "Speiding");
    createSubtab(subnav, "officeHelp", "Oppstartshjelp");
    createSubtab(subnav, "progression", "Utvikling", { visible: false });
    createSubtab(subnav, "admin", "Stab & drift", { visible: false });
    createSubtab(subnav, "facilities", "Fasiliteter", { visible: false });
    createSubtab(subnav, "market", "Marked", { visible: false });
  }

  installLocationBar();

  const observer = new MutationObserver(() => queueMicrotask(syncOrientation));
  document.querySelectorAll("[data-tab-section]").forEach((section) => {
    observer.observe(section, { attributes: true, attributeFilter: ["hidden"] });
  });
  const tag = document.querySelector("#nextActionPrimaryTag");
  if (tag) observer.observe(tag, { childList: true, characterData: true, subtree: true });
  syncOrientation();
}

function scheduleInformationArchitecture() {
  if (typeof document === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyManagerInformationArchitectureV4, { once: true });
  } else {
    applyManagerInformationArchitectureV4();
  }
}

class ManagerClubHeader extends HTMLElement {
  connectedCallback() {
    if (this.firstElementChild) return;
    this.innerHTML = `
      <header class="manager-header club-identity-header" id="clubIdentityHeader">
        <button class="header-club club-mark-button" id="headerClubButton" type="button" aria-label="Åpne klubboversikten">
          <span class="club-mark" id="headerClubMark" aria-hidden="true">HG</span>
          <span class="header-club-copy">
            <strong id="headerClubName">HG Manager</strong>
            <span class="header-club-ground" id="headerClubGround">Managerkontoret</span>
          </span>
        </button>
        <div class="header-actions">
          <button id="settingsButton" class="icon-button" type="button" aria-label="Innstillinger">${SETTINGS_ICON}</button>
        </div>
      </header>
    `;
  }
}

class ManagerNextAction extends HTMLElement {
  connectedCallback() {
    if (this.firstElementChild) return;
    this.innerHTML = `
      <section class="next-action" aria-live="polite">
        <div class="next-action-label">
          <span>Forslag til neste steg</span>
          <strong id="nextActionPrimaryTag">Kontor</strong>
          <small id="nextActionDestination" class="next-action-destination">neste arbeidsflate</small>
        </div>
        <button id="nextActionPrimary" class="next-action-primary" type="button">
          <span class="next-action-primary-copy">
            <strong id="nextActionPrimaryTitle">Åpne managerkontoret</strong>
            <span id="nextActionPrimaryHint">Se hva som krever oppmerksomhet.</span>
          </span>
          <span class="next-action-primary-arrow" aria-hidden="true">→</span>
        </button>
        <button id="nextActionSecondary" class="next-action-secondary" type="button" hidden>Detaljer</button>
      </section>
    `;
  }
}

class ManagerModeStrip extends HTMLElement {
  connectedCallback() {
    if (this.firstElementChild) return;
    this.innerHTML = `
      <div class="mode-strip" id="modeStrip" aria-label="Aktiv spillmodus">
        <div class="mode-strip-copy">
          <span>Modus</span>
          <strong id="modeStripLabel">Ligaspill</strong>
        </div>
        <button type="button" id="modeStripSwitch" class="mode-strip-switch">Bytt modus</button>
      </div>
    `;
  }
}

customElements.define("manager-club-header", ManagerClubHeader);
customElements.define("manager-next-action", ManagerNextAction);
customElements.define("manager-mode-strip", ManagerModeStrip);

scheduleInformationArchitecture();
