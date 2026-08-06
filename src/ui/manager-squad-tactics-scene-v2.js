const PANEL_ID = "squadTacticsCommandPanel";
const COMMAND_ID = "squadTacticsCommand";
const STYLE_ID = "managerSquadTacticsSceneV2Style";

function text(value, fallback = "") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function parseRatio(value, fallbackTotal) {
  const match = text(value).match(/(\d+)\s*\/\s*(\d+)/);
  return {
    current: match ? Number(match[1]) : 0,
    total: match ? Number(match[2]) : fallbackTotal
  };
}

function selectedLabel(selector, fallback) {
  const select = document.querySelector(selector);
  if (!select) return fallback;
  const option = select.selectedOptions?.[0];
  return text(option?.textContent || select.value, fallback);
}

function toneFromAvailability(value) {
  const normalized = text(value).toLowerCase();
  if (/skadet|ute|utilgjengelig/.test(normalized)) return "negative";
  if (/sliten|belastning|usikker|tvilsom/.test(normalized)) return "attention";
  return "positive";
}

function roleState(value, misuseValue) {
  const normalized = `${text(value)} ${text(misuseValue)}`.toLowerCase();
  const concern = /trenger|feil|misbruk|problem|vars|mangler/.test(normalized);
  return { concern, tone: concern ? "attention" : "positive" };
}

function actionFrom(source) {
  if (!source.gateReady) {
    return {
      label: text(source.gateActionText, "Løs første lagvalg"),
      target: "gate-action",
      title: text(source.gateTitle, "Laget trenger en beslutning"),
      detail: text(source.gateHint, "Fullfør neste nødvendige valg i startelleveren.")
    };
  }

  const routeText = `${text(source.matchdayTarget)} ${text(source.matchdayActionText)}`.toLowerCase();
  if (routeText.includes("trening")) {
    return {
      label: "Gå til Trening",
      target: "trening",
      title: "Troppen er klar – treningsuka gjenstår",
      detail: "Startellever, roller og benk er satt. Fullfør treningsvalget før kamp."
    };
  }

  return {
    label: "Gå til Kamp",
    target: "kamp",
    title: source.matchdayReady ? "Laget er kampklart" : "Kontroller kampforberedelsen",
    detail: source.matchdayReady
      ? "Laguttaket er klart og kan tas videre til kampdag."
      : "Laguttaket er klart. Kampflaten viser eventuelle gjenstående blokkeringer."
  };
}

export function createManagerSquadTacticsSceneModel(source = {}) {
  const starters = parseRatio(source.starterText, 11);
  const bench = parseRatio(source.benchText, 4);
  const roles = roleState(source.rolesText, source.misuseText);
  const formationName = text(source.formationName, "Formasjon ikke valgt");
  const tacticName = text(source.tacticName, "Kampplan ikke valgt");
  const availabilityText = text(source.availabilityText, "Ingen akutte tilgjengelighetsvarsler.");
  const action = actionFrom(source);
  const lineupReady = starters.current >= starters.total;
  const benchReady = bench.current >= bench.total;
  const issue = !source.gateReady
    ? text(source.gateHint, "Startelleveren eller benken er ikke komplett.")
    : roles.concern
      ? `Rollebruken trenger oppfølging: ${text(source.rolesText, source.misuseText)}.`
      : "Ingen akutte problemområder er registrert i laguttaket.";
  const strength = lineupReady && benchReady
    ? `${formationName} og ${tacticName} gir laget en tydelig kampidentitet.`
    : "Taktisk styrke blir tydeligere når startellever, roller og dekning er komplette.";

  return {
    state: source.gateReady ? "ready" : "blocked",
    headline: text(source.gateHint, action.detail),
    formation: { name: formationName, plan: tacticName },
    reading: { issue, strength, tone: !source.gateReady || roles.concern ? "attention" : "positive" },
    statuses: [
      {
        id: "lineup",
        label: "Startellever",
        value: `${starters.current}/${starters.total} klare`,
        detail: lineupReady ? "Alle startplasser er registrert." : `${Math.max(0, starters.total - starters.current)} plasser mangler.`,
        tone: lineupReady ? "positive" : "negative",
        target: "lineup"
      },
      {
        id: "tactics",
        label: "Formasjon & kampplan",
        value: formationName,
        detail: `${tacticName} · ${roles.concern ? "rollebruken må kontrolleres" : "rollebruken er kontrollert"}.`,
        tone: roles.tone,
        target: "formation"
      },
      {
        id: "availability",
        label: "Tilgjengelighet",
        value: toneFromAvailability(availabilityText) === "positive" ? "Ingen akutte varsler" : "Må følges opp",
        detail: availabilityText,
        tone: toneFromAvailability(availabilityText),
        target: "bench"
      },
      {
        id: "bench",
        label: "Benk & dekning",
        value: `${bench.current}/${bench.total} kampklare`,
        detail: benchReady ? "Minimumsbenken er fylt." : `${Math.max(0, bench.total - bench.current)} reserver mangler.`,
        tone: benchReady ? "positive" : "negative",
        target: "bench"
      }
    ],
    action,
    progress: {
      lineupReady,
      benchReady,
      rolesReady: !roles.concern,
      ready: Boolean(source.gateReady)
    }
  };
}

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-squad-tactics-scene-v2.css", import.meta.url).href;
  document.head.append(link);
}

function ensurePanel() {
  const tactics = document.querySelector('[data-tab-section="tactics"]');
  if (!tactics) return null;
  let panel = document.getElementById(PANEL_ID);
  if (panel) return panel;

  panel = document.createElement("section");
  panel.id = PANEL_ID;
  panel.className = "manager-surface manager-squad-tactics-command-panel";
  panel.setAttribute("aria-label", "Lag og taktikk");
  panel.innerHTML = `<div id="${COMMAND_ID}" aria-live="polite"></div>`;
  const existingGate = document.getElementById("squadSetupGate");
  tactics.insertBefore(panel, existingGate || tactics.firstChild);
  return panel;
}

function readSource() {
  const gate = document.getElementById("squadSetupGate");
  const matchdayCommand = document.getElementById("matchdayCommand");
  const matchdayAction = matchdayCommand?.querySelector(".matchday-command-action");
  return {
    gateReady: gate?.dataset.ready === "true",
    gateTitle: document.getElementById("squadSetupGateTitle")?.textContent,
    gateHint: document.getElementById("squadSetupGateHint")?.textContent,
    gateActionText: document.getElementById("squadSetupGateAction")?.textContent,
    starterText: document.getElementById("squadGateStarters")?.textContent,
    benchText: document.getElementById("squadGateBench")?.textContent,
    rolesText: document.getElementById("squadGateRoles")?.textContent,
    misuseText: document.getElementById("squadGateMisuse")?.textContent,
    formationName: selectedLabel("#formationSelect", "Formasjon ikke valgt"),
    tacticName: selectedLabel("#tacticSelect", "Kampplan ikke valgt"),
    availabilityText: document.getElementById("rosterReadinessNote")?.textContent
      || document.querySelector(".bench-player-list")?.getAttribute("aria-label")
      || "Ingen akutte tilgjengelighetsvarsler.",
    matchdayReady: matchdayCommand?.dataset.ready === "true",
    matchdayTarget: matchdayAction?.dataset.matchdayTarget,
    matchdayActionText: matchdayAction?.textContent
  };
}

function focusOrScroll(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (target.matches("button, select, input, textarea, [tabindex]")) {
    target.focus({ preventScroll: true });
  }
}

function clickTab(selector) {
  const target = document.querySelector(selector);
  if (target instanceof HTMLElement) target.click();
}

function openTarget(target) {
  if (target === "gate-action") {
    document.getElementById("squadSetupGateAction")?.click();
    return;
  }
  if (target === "trening") {
    clickTab('.app-subtab[data-tab-target="trening"]');
    return;
  }
  if (target === "kamp") {
    clickTab('.main-nav [role="tab"][data-tab-target="kamp"]');
    return;
  }

  const selector = {
    lineup: "#lineupSlots",
    formation: "#formationSelect",
    bench: "#benchPlayersList"
  }[target] || "#lineupSlots";
  focusOrScroll(selector);
}

function statusButton(status) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "squad-tactics-status";
  button.dataset.tone = status.tone;
  button.dataset.squadTacticsTarget = status.target;
  button.setAttribute("aria-label", `${status.label}: ${status.value}. ${status.detail}`);
  button.append(
    node("span", "squad-tactics-status-label", status.label),
    node("strong", "squad-tactics-status-value", status.value),
    node("small", "squad-tactics-status-detail", status.detail)
  );
  button.addEventListener("click", () => openTarget(status.target));
  return button;
}

function renderScene() {
  ensureStyles();
  const panel = ensurePanel();
  const container = panel?.querySelector(`#${COMMAND_ID}`);
  if (!container) return;

  const model = createManagerSquadTacticsSceneModel(readSource());
  container.textContent = "";
  container.dataset.state = model.state;
  container.dataset.ready = model.progress.ready ? "true" : "false";

  const header = node("header", "squad-tactics-command-head");
  const heading = node("div");
  heading.append(
    node("p", "eyebrow", "Sportslig arbeidsrom"),
    node("h2", "", "Lag og taktikk"),
    node("p", "squad-tactics-command-headline", model.headline)
  );
  const identity = document.createElement("button");
  identity.type = "button";
  identity.className = "squad-tactics-identity";
  identity.dataset.squadTacticsTarget = "formation";
  identity.append(
    node("span", "", "Taktisk identitet"),
    node("strong", "", model.formation.name),
    node("small", "", model.formation.plan)
  );
  identity.addEventListener("click", () => openTarget("formation"));
  header.append(heading, identity);

  const statusGrid = node("div", "squad-tactics-status-grid");
  model.statuses.forEach((status) => statusGrid.append(statusButton(status)));

  const reading = node("div", "squad-tactics-reading");
  const issue = node("article", "squad-tactics-reading-card");
  issue.dataset.tone = model.reading.tone;
  issue.append(
    node("span", "", "Viktigste problemområde"),
    node("strong", "", model.reading.issue),
    node("p", "", model.reading.strength)
  );

  const decision = node("section", "squad-tactics-next");
  decision.dataset.complete = model.progress.ready ? "true" : "false";
  const copy = node("div");
  copy.append(
    node("span", "", model.progress.ready ? "Troppen er satt" : "Aktiv lagbeslutning"),
    node("strong", "", model.action.title),
    node("small", "", model.action.detail)
  );
  const action = document.createElement("button");
  action.type = "button";
  action.className = "squad-tactics-command-action";
  action.dataset.squadTacticsTarget = model.action.target;
  action.textContent = model.action.label;
  action.addEventListener("click", () => openTarget(model.action.target));
  decision.append(copy, action);
  reading.append(issue, decision);

  container.append(header, statusGrid, reading);
}

let scheduled = false;
function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    renderScene();
  });
}

function boot() {
  renderScene();
  const observer = new MutationObserver((mutations) => {
    const panel = document.getElementById(PANEL_ID);
    const onlyOwnChanges = panel && mutations.every((mutation) => panel.contains(mutation.target));
    if (!onlyOwnChanges) scheduleRender();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("#formationSelect, #tacticSelect")) scheduleRender();
  });
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('[data-tab-target="tactics"]')) scheduleRender();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
}
