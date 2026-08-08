import {
  closeManagerTeamChoiceDrawer,
  openManagerTeamChoiceDrawer
} from "./manager-team-choice-drawer-v1.js";

const STYLE_ID = "managerSystemWorkspaceV2Style";
const WORKSPACE_ID = "managerSystemWorkspaceV2";
const CHOICE_SOURCE_ID = "managerSystemParameterChoices";
const TACTICS_URL = new URL("../../data/football_tactics.json", import.meta.url);

const PARAMS = Object.freeze({
  pressing: Object.freeze({ label: "Press", action: "Endre press" }),
  defensiveLine: Object.freeze({ label: "Forsvarslinje", action: "Endre forsvarslinje" }),
  buildUp: Object.freeze({ label: "Oppbygging", action: "Endre oppbygging" }),
  width: Object.freeze({ label: "Bredde", action: "Endre bredde" })
});

const VALUE_LABELS = Object.freeze({
  very_high: "Svært høyt",
  high: "Høyt",
  medium_high: "Middels høyt",
  medium: "Middels",
  medium_low: "Middels lavt",
  low: "Lavt",
  very_low: "Svært lavt",
  wide: "Stor",
  medium_wide: "Middels stor",
  narrow: "Smal",
  controlled: "Kontrollert",
  fast: "Rask",
  slow: "Rolig",
  structured_build_up: "Strukturert og kort",
  aggressive_build_up: "Aggressiv og framoverrettet",
  secure_first: "Sikker først",
  direct_build_up: "Direkte",
  vertical_build_up: "Vertikal",
  patient_build_up: "Tålmodig",
  calm_build_up: "Rolig"
});

const PARAM_EXPLANATIONS = Object.freeze({
  pressing: Object.freeze({
    very_high: "Første pressledd søker ballen svært høyt. Det krever samtidighet og etterlater større rom hvis presset brytes.",
    high: "Laget forsøker å etablere presset høyt og forkorte veien til mål ved gjenvinning.",
    medium_high: "Presset starter relativt høyt, men laget har litt mer sikkerhet bak første pressledd.",
    medium: "Laget balanserer aktivt press med evnen til å holde formen samlet.",
    medium_low: "Laget prioriterer formen før det går aggressivt i press.",
    low: "Laget faller av og beskytter rom nærmere eget mål før presset settes."
  }),
  defensiveLine: Object.freeze({
    high: "Forsvarslinjen står høyt for å komprimere banen. Rommet bak linjen blir samtidig viktig å kontrollere.",
    medium_high: "Linjen støtter et relativt høyt lag uten å stå helt på maksimal risiko.",
    medium: "Forsvarslinjen balanserer rommet foran og bak seg.",
    medium_low: "Linjen prioriterer mer dybdesikring og gir noe mer rom foran seg.",
    low: "Forsvarslinjen beskytter bakrommet og egen boks, men laget får lengre vei fram ved gjenvinning."
  }),
  buildUp: Object.freeze({
    structured_build_up: "Oppbyggingen søker faste støtteledd og kontrollerte pasningslinjer før laget går framover.",
    aggressive_build_up: "Laget forsøker å spille framover tidligere og aksepterer høyere risiko i første fase.",
    secure_first: "Første prioritet er å beholde ballen og unngå unødvendige tap i egen oppbygging.",
    direct_build_up: "Oppbyggingen søker raskere fram til neste ledd og hopper oftere over mellomrom.",
    vertical_build_up: "Pasningsvalgene søker framover gjennom ledd når rommet åpnes.",
    patient_build_up: "Laget bruker tid og flytter motstanderen før det angriper neste rom."
  }),
  width: Object.freeze({
    wide: "Laget bruker stor bredde for å strekke motstanderen og åpne kanaler mellom dem.",
    medium_wide: "Bredden er tydelig, men spillerne holder fortsatt korte nok forbindelser til sentrale rom.",
    medium: "Laget balanserer sentrale forbindelser og bruk av sidene.",
    narrow: "Spillerne samles mer sentralt for korte avstander og kombinasjoner, med mindre permanent bredde."
  })
});

let tactics = [];
let renderFrame = 0;

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function node(tag, className = "", value = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value) element.textContent = value;
  return element;
}

function valueLabel(value) {
  const id = text(value);
  return VALUE_LABELS[id] || id.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("nb-NO")) || "Ikke dokumentert";
}

function explanation(parameter, value) {
  return PARAM_EXPLANATIONS[parameter]?.[value] || "Denne egenskapen kommer direkte fra den valgte eksisterende kampplanen.";
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-system-workspace-v2.css", import.meta.url).href;
  document.head.append(link);
}

async function loadTactics() {
  try {
    const response = await fetch(TACTICS_URL);
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    tactics = Array.isArray(data?.tactics) ? data.tactics : [];
  } catch (error) {
    console.warn("Kunne ikke laste taktikkdata til Systemet", error);
    tactics = [];
  }
}

function currentTactic() {
  const select = document.getElementById("tacticSelect");
  if (!(select instanceof HTMLSelectElement)) return null;
  const id = text(select.value);
  const selectedName = text(select.selectedOptions?.[0]?.textContent).toLocaleLowerCase("nb-NO");
  return tactics.find((tactic) => text(tactic?.id) === id)
    || tactics.find((tactic) => text(tactic?.name).toLocaleLowerCase("nb-NO") === selectedName)
    || null;
}

function currentFormation() {
  const select = document.getElementById("formationSelect");
  if (!(select instanceof HTMLSelectElement)) return "Formasjon ikke valgt";
  return text(select.selectedOptions?.[0]?.textContent || select.value, "Formasjon ikke valgt");
}

function ensureWorkspace() {
  const section = document.querySelector('[data-tab-section="system"]');
  if (!section) return null;
  section.classList.add("has-manager-system-workspace-v2");
  let workspace = document.getElementById(WORKSPACE_ID);
  if (workspace) return workspace;
  workspace = node("section", "manager-system-workspace-v2");
  workspace.id = WORKSPACE_ID;
  workspace.setAttribute("aria-label", "Aktivt taktisk system");
  const panel = document.getElementById("tacticalSystemPanel");
  if (panel?.parentElement === section) section.insertBefore(workspace, panel);
  else section.prepend(workspace);

  let choiceSource = document.getElementById(CHOICE_SOURCE_ID);
  if (!choiceSource) {
    choiceSource = node("div", "manager-system-choice-source manager-team-alternative-source");
    choiceSource.id = CHOICE_SOURCE_ID;
    choiceSource.hidden = true;
    section.append(choiceSource);
  }
  return workspace;
}

function pressPosition(value) {
  return ({ very_high: 16, high: 24, medium_high: 32, medium: 42, medium_low: 52, low: 62, very_low: 70 })[value] || 42;
}

function defensivePosition(value) {
  return ({ high: 34, medium_high: 42, medium: 50, medium_low: 59, low: 68, very_low: 74 })[value] || 50;
}

function widthPercent(value) {
  return ({ wide: 92, medium_wide: 82, medium: 72, narrow: 58 })[value] || 72;
}

function buildPitch(tactic) {
  const pitch = node("div", "manager-system-pitch-v2");
  pitch.style.setProperty("--system-press-y", `${pressPosition(tactic?.pressing)}%`);
  pitch.style.setProperty("--system-defence-y", `${defensivePosition(tactic?.defensiveLine)}%`);
  pitch.style.setProperty("--system-width", `${widthPercent(tactic?.width)}%`);
  pitch.setAttribute("role", "img");
  pitch.setAttribute("aria-label", `Systemillustrasjon. Press ${valueLabel(tactic?.pressing)}, forsvarslinje ${valueLabel(tactic?.defensiveLine)}, bredde ${valueLabel(tactic?.width)}, oppbygging ${valueLabel(tactic?.buildUp)}.`);
  pitch.innerHTML = `
    <div class="system-pitch-halfway" aria-hidden="true"></div>
    <div class="system-pitch-width" aria-hidden="true"><span>Bredde</span></div>
    <div class="system-pitch-press" aria-hidden="true"><span>Press</span></div>
    <div class="system-pitch-defence" aria-hidden="true"><span>Forsvarslinje</span></div>
    <div class="system-pitch-build" aria-hidden="true"><span>Oppbygging ↑</span></div>`;
  return pitch;
}

function parameterRow(parameter, tactic) {
  const config = PARAMS[parameter];
  const row = node("article", "manager-system-principle");
  row.dataset.systemParameter = parameter;
  const copy = node("div", "manager-system-principle-copy");
  copy.append(
    node("span", "manager-system-principle-label", config.label),
    node("strong", "manager-system-principle-value", valueLabel(tactic?.[parameter])),
    node("p", "manager-system-principle-explanation", explanation(parameter, tactic?.[parameter]))
  );
  const button = node("button", "manager-system-principle-action", config.action);
  button.type = "button";
  button.addEventListener("click", () => openParameterChoices(parameter, button));
  row.append(copy, button);
  return row;
}

function renderSystem() {
  const workspace = ensureWorkspace();
  if (!workspace) return;
  const tactic = currentTactic();
  const formation = currentFormation();
  workspace.replaceChildren();

  const header = node("header", "manager-system-head-v2");
  const headCopy = node("div", "manager-system-head-copy-v2");
  headCopy.append(
    node("p", "eyebrow", "Lag · Systemet"),
    node("h2", "", formation),
    node("strong", "manager-system-plan-name", tactic?.name || text(document.getElementById("teamSystemTactic")?.textContent, "Kampplan ikke valgt")),
    node("p", "manager-system-intent", tactic?.intent || "Velg en eksisterende kampplan for å se hvordan laget faktisk skal spille.")
  );
  const headActions = node("div", "manager-system-head-actions-v2");
  const formationButton = node("button", "", "Endre formasjon");
  formationButton.type = "button";
  formationButton.addEventListener("click", () => document.getElementById("teamChangeFormation")?.click());
  const tacticButton = node("button", "", "Endre kampplan");
  tacticButton.type = "button";
  tacticButton.addEventListener("click", () => document.getElementById("teamChangeTactic")?.click());
  headActions.append(formationButton, tacticButton);
  header.append(headCopy, headActions);

  const main = node("div", "manager-system-main-v2");
  main.append(buildPitch(tactic));
  const principles = node("div", "manager-system-principles-v2");
  Object.keys(PARAMS).forEach((parameter) => principles.append(parameterRow(parameter, tactic)));
  main.append(principles);

  const knowledge = node("section", "manager-system-knowledge-v2");
  knowledge.append(node("h3", "", "Hva kampplanen gir og risikerer"));
  const strengths = node("div", "manager-system-knowledge-column");
  strengths.append(node("strong", "", "Styrker"));
  const strengthList = node("ul");
  (Array.isArray(tactic?.strengths) && tactic.strengths.length ? tactic.strengths : ["Velg kampplan for å se dokumenterte styrker."]).forEach((item) => strengthList.append(node("li", "", item)));
  strengths.append(strengthList);
  const risks = node("div", "manager-system-knowledge-column");
  risks.append(node("strong", "", "Risiko"));
  const riskList = node("ul");
  (Array.isArray(tactic?.risks) && tactic.risks.length ? tactic.risks : ["Velg kampplan for å se dokumenterte risikoer."]).forEach((item) => riskList.append(node("li", "", item)));
  risks.append(riskList);
  knowledge.append(strengths, risks);

  workspace.append(header, main, knowledge);
  const legacySelected = document.getElementById("teamSystemSelectedState");
  if (legacySelected) legacySelected.dataset.replacedBySystemV2 = "true";
}

function buildChoiceSource(parameter) {
  const source = document.getElementById(CHOICE_SOURCE_ID);
  if (!source) return null;
  source.hidden = false;
  source.replaceChildren();
  const current = currentTactic();
  const intro = node("p", "manager-system-choice-intro", `${PARAMS[parameter].label} er en del av den eksisterende kampplanen. Velg en eksisterende plan med den egenskapen du vil bruke; ingen ny taktikkmotor opprettes.`);
  source.append(intro);
  const list = node("div", "manager-system-choice-list");
  tactics.forEach((tactic) => {
    const button = node("button", "manager-system-choice-row");
    button.type = "button";
    button.dataset.tacticId = text(tactic.id);
    if (current?.id === tactic.id) button.classList.add("is-selected");
    button.innerHTML = `<span>${PARAMS[parameter].label}</span><strong>${valueLabel(tactic?.[parameter])}</strong><b>${text(tactic?.name, tactic?.id)}</b><small>${text(tactic?.intent, "Eksisterende kampplan")}</small>`;
    button.addEventListener("click", () => selectTactic(tactic.id));
    list.append(button);
  });
  source.append(list);
  return source;
}

function openParameterChoices(parameter, trigger) {
  const source = buildChoiceSource(parameter);
  if (!source) return;
  openManagerTeamChoiceDrawer({
    source,
    title: PARAMS[parameter].action,
    eyebrow: "Lag · Systemet",
    detail: `Alle eksisterende kampplaner vises med ${PARAMS[parameter].label.toLocaleLowerCase("nb-NO")} slik at endringen fortsatt går gjennom den autoritative tacticSelect-state.`,
    trigger
  });
}

function selectTactic(tacticId) {
  const select = document.getElementById("tacticSelect");
  if (!(select instanceof HTMLSelectElement)) return;
  const option = Array.from(select.options).find((entry) => entry.value === tacticId);
  if (!option) return;
  select.value = tacticId;
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
  closeManagerTeamChoiceDrawer();
  scheduleRender();
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderSystem();
  });
}

function installObservers() {
  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("#formationSelect, #tacticSelect")) scheduleRender();
  });
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.('.app-subtab[data-tab-target="system"]')) requestAnimationFrame(renderSystem);
  });
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.target?.id === "teamSystemFormation" || mutation.target?.id === "teamSystemTactic")) scheduleRender();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
}

async function boot() {
  ensureStyles();
  await loadTactics();
  ensureWorkspace();
  renderSystem();
  installObservers();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => queueMicrotask(boot), { once: true });
  else queueMicrotask(boot);
}
