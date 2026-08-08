const STYLE_ID = "managerTeamChoiceDrawerV1Style";
const DRAWER_ID = "managerTeamChoiceDrawer";
const DRAWER_BODY_ID = "managerTeamChoiceDrawerBody";

let activeMove = null;
let activeTrigger = null;
let mutationFrame = 0;

function node(tag, className = "", value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = String(value);
  return element;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-team-choice-drawer-v1.css", import.meta.url).href;
  document.head.append(link);
}

function focusables(root) {
  return Array.from(root.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function ensureDrawer() {
  let drawer = document.getElementById(DRAWER_ID);
  if (drawer) return drawer;

  drawer = node("div", "manager-team-choice-drawer");
  drawer.id = DRAWER_ID;
  drawer.hidden = true;
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-labelledby", "managerTeamChoiceDrawerTitle");
  drawer.innerHTML = `
    <button type="button" class="manager-team-choice-backdrop" data-team-choice-close aria-label="Lukk valgmeny"></button>
    <aside class="manager-team-choice-panel">
      <header class="manager-team-choice-head">
        <div>
          <p class="eyebrow" id="managerTeamChoiceDrawerEyebrow">Lag · Endre</p>
          <h2 id="managerTeamChoiceDrawerTitle">Velg alternativ</h2>
          <p id="managerTeamChoiceDrawerDetail" class="muted-text"></p>
        </div>
        <button type="button" class="manager-team-choice-close" data-team-choice-close aria-label="Lukk valgmeny">×</button>
      </header>
      <div id="${DRAWER_BODY_ID}" class="manager-team-choice-body"></div>
      <footer class="manager-team-choice-footer">
        <span>Valgene bruker de eksisterende lag-, taktikk- og treningssystemene.</span>
        <button type="button" class="manager-team-choice-done" data-team-choice-close>Ferdig</button>
      </footer>
    </aside>`;
  document.body.append(drawer);

  drawer.querySelectorAll("[data-team-choice-close]").forEach((button) => {
    button.addEventListener("click", () => closeManagerTeamChoiceDrawer());
  });

  drawer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeManagerTeamChoiceDrawer();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusables(drawer);
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return drawer;
}

function restoreActiveMove() {
  if (!activeMove?.source) return;
  const { source, parent, nextSibling } = activeMove;
  source.classList.remove("is-in-team-choice-drawer");
  if (parent?.isConnected) {
    const sibling = nextSibling?.parentElement === parent ? nextSibling : null;
    parent.insertBefore(source, sibling);
  }
  activeMove = null;
}

export function closeManagerTeamChoiceDrawer({ restoreFocus = true } = {}) {
  const drawer = document.getElementById(DRAWER_ID);
  if (!drawer || drawer.hidden) return;
  restoreActiveMove();
  drawer.hidden = true;
  document.documentElement.classList.remove("has-manager-team-choice-drawer");
  const trigger = activeTrigger;
  activeTrigger = null;
  syncSelectedState();
  if (restoreFocus && trigger?.isConnected) trigger.focus();
}

export function openManagerTeamChoiceDrawer({ source, title, eyebrow = "Lag · Endre", detail = "", trigger = null } = {}) {
  if (!(source instanceof HTMLElement)) return false;
  const drawer = ensureDrawer();
  const body = drawer.querySelector(`#${DRAWER_BODY_ID}`);
  if (!body) return false;

  if (!drawer.hidden) closeManagerTeamChoiceDrawer({ restoreFocus: false });
  const parent = source.parentElement;
  if (!parent) return false;

  activeMove = { source, parent, nextSibling: source.nextSibling };
  activeTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement instanceof HTMLElement ? document.activeElement : null;
  drawer.querySelector("#managerTeamChoiceDrawerTitle").textContent = title || "Velg alternativ";
  drawer.querySelector("#managerTeamChoiceDrawerEyebrow").textContent = eyebrow;
  drawer.querySelector("#managerTeamChoiceDrawerDetail").textContent = detail;

  source.classList.add("is-in-team-choice-drawer");
  body.replaceChildren(source);
  drawer.hidden = false;
  document.documentElement.classList.add("has-manager-team-choice-drawer");
  queueMicrotask(() => drawer.querySelector(".manager-team-choice-close")?.focus());
  return true;
}

function selectedOptionLabel(select, fallback) {
  if (!(select instanceof HTMLSelectElement)) return fallback;
  return String(select.selectedOptions?.[0]?.textContent || select.value || fallback).trim() || fallback;
}

function markAlternativeSource(element) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.add("manager-team-alternative-source");
}

function createSelectedField({ label, valueId, actionId, actionLabel, onOpen }) {
  const field = node("article", "manager-team-selected-field");
  field.append(
    node("span", "manager-team-selected-label", label),
    node("strong", "manager-team-selected-value", "–")
  );
  field.querySelector("strong").id = valueId;
  const action = node("button", "manager-team-selected-action", actionLabel);
  action.type = "button";
  action.id = actionId;
  action.addEventListener("click", () => onOpen(action));
  field.append(action);
  return field;
}

function ensureTacticsSelectors() {
  const form = document.getElementById("teamForm");
  if (!form || document.getElementById("teamTacticsSelectedState")) return;
  markAlternativeSource(form);

  const state = node("section", "manager-team-selected-state manager-team-tactics-selected");
  state.id = "teamTacticsSelectedState";
  state.setAttribute("aria-label", "Valgt formasjon og kampplan");
  state.append(
    createSelectedField({
      label: "Formasjon",
      valueId: "teamSelectedFormation",
      actionId: "teamChangeFormation",
      actionLabel: "Endre formasjon",
      onOpen: (trigger) => openManagerTeamChoiceDrawer({
        source: form,
        title: "Formasjon og kampplan",
        eyebrow: "Lag · Oppstilling",
        detail: "Alle tilgjengelige formasjons- og kampplanalternativer ligger her. Velg det du vil bruke; hovedflaten viser bare det aktive valget.",
        trigger
      })
    }),
    createSelectedField({
      label: "Kampplan",
      valueId: "teamSelectedTactic",
      actionId: "teamChangeTactic",
      actionLabel: "Endre kampplan",
      onOpen: (trigger) => openManagerTeamChoiceDrawer({
        source: form,
        title: "Formasjon og kampplan",
        eyebrow: "Lag · Oppstilling",
        detail: "Formasjon og kampplan bruker de eksisterende taktikkdataene. Ingenting er fjernet; alternativene er flyttet ut av hovedscenen.",
        trigger
      })
    })
  );
  form.parentElement?.insertBefore(state, form);
}

function ensureLineupChoiceSource() {
  const playerChoices = document.getElementById("lineupPlayerChoices");
  const roleChoices = document.getElementById("lineupRoleChoices");
  const editor = playerChoices?.closest(".lineup-direct-editor") || roleChoices?.closest(".lineup-direct-editor");
  if (!playerChoices || !roleChoices || !editor) return null;

  let source = document.getElementById("teamLineupChoiceSource");
  if (!source) {
    source = node("div", "manager-team-lineup-choice-source manager-team-alternative-source");
    source.id = "teamLineupChoiceSource";
    playerChoices.parentElement?.insertBefore(source, playerChoices);
    source.append(playerChoices, roleChoices);
  }
  return { source, editor };
}

function selectedPlayerLabel() {
  const selected = document.querySelector("#lineupPlayerChoices .lineup-player-select-action.is-selected, #lineupPlayerChoices [aria-pressed=\"true\"]");
  const row = selected?.closest?.(".lineup-player-choice-row");
  const profile = row?.querySelector?.(".lineup-player-profile-link strong, .lineup-player-profile-link");
  return String(profile?.textContent || "Ingen spiller valgt").trim();
}

function selectedRoleLabel() {
  const selected = document.querySelector("#lineupRoleChoices button.is-selected, #lineupRoleChoices button.is-active, #lineupRoleChoices [aria-pressed=\"true\"], #lineupRoleChoices [aria-selected=\"true\"]");
  return String(selected?.textContent || "Rolle velges for plassen").trim();
}

function selectedPitchSlotLabel() {
  const selected = document.querySelector("#lineupSlots .lineup-player-card.is-selected, #lineupSlots [aria-selected=\"true\"]");
  const label = selected?.getAttribute?.("aria-label") || selected?.textContent;
  return String(label || "Valgt plass").trim().replace(/\s+/g, " ");
}

function ensureLineupSelectedState() {
  const context = ensureLineupChoiceSource();
  if (!context || document.getElementById("teamLineupSelectedState")) return;
  const { source, editor } = context;

  const existingTitle = editor.querySelector("h3");
  if (existingTitle) existingTitle.textContent = "Valgt spiller og rolle";
  const existingHint = editor.querySelector(":scope > .muted-text, .lineup-direct-head + .muted-text");
  if (existingHint) existingHint.textContent = "Trykk Endre for å åpne alle spiller- og rollealternativene i valgmenyen.";

  const state = node("section", "manager-team-selected-state manager-lineup-selected-state");
  state.id = "teamLineupSelectedState";
  state.innerHTML = `
    <article class="manager-team-selected-field">
      <span class="manager-team-selected-label" id="teamSelectedSlot">Valgt plass</span>
      <strong class="manager-team-selected-value" id="teamSelectedPlayer">Ingen spiller valgt</strong>
      <small class="manager-team-selected-detail" id="teamSelectedRole">Rolle velges for plassen</small>
      <button type="button" class="manager-team-selected-action" id="teamChangePlayerRole">Endre spiller eller rolle</button>
    </article>`;
  source.parentElement?.insertBefore(state, source);
  state.querySelector("#teamChangePlayerRole")?.addEventListener("click", (event) => openManagerTeamChoiceDrawer({
    source,
    title: "Spiller og rolle",
    eyebrow: "Lag · Oppstilling",
    detail: "Alle tilgjengelige spillere og roller vises her. Velg eksplisitt spiller og rolle for den aktive plassen på banen.",
    trigger: event.currentTarget
  }));
}

function trainingSource(id) {
  const source = document.getElementById(id);
  if (source) markAlternativeSource(source);
  return source;
}

function ensureTrainingSelectedState() {
  const workspace = document.getElementById("trainingWorkspace");
  if (!workspace || document.getElementById("teamTrainingSelectedState")) return;

  const program = trainingSource("trainingPrograms");
  const focus = trainingSource("weeklyTrainingOptions");
  const individual = trainingSource("individualTrainingPicker");
  if (!program || !focus || !individual) return;

  const state = node("section", "manager-team-selected-state manager-training-selected-state");
  state.id = "teamTrainingSelectedState";
  state.setAttribute("aria-label", "Valgte treningsvalg");
  state.append(
    createSelectedField({
      label: "Program",
      valueId: "teamSelectedTrainingProgram",
      actionId: "teamChangeTrainingProgram",
      actionLabel: "Endre program",
      onOpen: (trigger) => openManagerTeamChoiceDrawer({
        source: program,
        title: "Velg treningsprogram",
        eyebrow: "Lag · Trening",
        detail: String(document.getElementById("trainingChoiceSignal")?.textContent || "Velg programmet som skal styre ukas ramme og belastning.").trim(),
        trigger
      })
    }),
    createSelectedField({
      label: "Fokus",
      valueId: "teamSelectedTrainingFocus",
      actionId: "teamChangeTrainingFocus",
      actionLabel: "Endre fokus",
      onOpen: (trigger) => openManagerTeamChoiceDrawer({
        source: focus,
        title: "Velg treningsfokus",
        eyebrow: "Lag · Trening",
        detail: String(document.getElementById("weeklyTrainingRecommendation")?.textContent || "Velg det taktiske temaet laget skal prioritere.").trim(),
        trigger
      })
    }),
    createSelectedField({
      label: "Individuell oppfølging",
      valueId: "teamSelectedIndividualTraining",
      actionId: "teamChangeIndividualTraining",
      actionLabel: "Endre oppfølging",
      onOpen: (trigger) => openManagerTeamChoiceDrawer({
        source: individual,
        title: "Individuell oppfølging",
        eyebrow: "Lag · Trening",
        detail: "Velg spiller og oppfølgingsspor. Eksisterende individuelle treningsmotor og kapasitetsregler brukes uendret.",
        trigger
      })
    })
  );
  workspace.parentElement?.insertBefore(state, workspace);
}

function ensureSystemSelectedState() {
  const panel = document.getElementById("tacticalSystemPanel");
  const form = document.getElementById("teamForm");
  if (!panel || !form || document.getElementById("teamSystemSelectedState")) return;

  const state = node("section", "manager-team-selected-state manager-system-selected-state");
  state.id = "teamSystemSelectedState";
  state.innerHTML = `
    <article class="manager-team-selected-field">
      <span class="manager-team-selected-label">Aktivt system</span>
      <strong class="manager-team-selected-value" id="teamSystemFormation">–</strong>
      <small class="manager-team-selected-detail" id="teamSystemTactic">–</small>
      <button type="button" class="manager-team-selected-action" id="teamChangeSystem">Endre system</button>
    </article>`;
  panel.parentElement?.insertBefore(state, panel);
  state.querySelector("#teamChangeSystem")?.addEventListener("click", (event) => openManagerTeamChoiceDrawer({
    source: form,
    title: "Endre system",
    eyebrow: "Lag · Systemet",
    detail: "Systemet viser det laget faktisk spiller med. Alle tilgjengelige formasjons- og kampplanalternativer åpnes her når du vil endre det.",
    trigger: event.currentTarget
  }));
}

function ensureRosterState() {
  const workspace = document.getElementById("managerPlayerWorkspace");
  if (!workspace || document.getElementById("teamRosterSelectedState")) return;
  const note = node("div", "manager-roster-selected-note");
  note.id = "teamRosterSelectedState";
  note.innerHTML = `<strong>Dette er den faktiske troppen.</strong><span>Søk og filter endrer bare visningen. Spiller- og rollealternativer for laguttaket åpnes fra Oppstilling.</span>`;
  workspace.prepend(note);
}

function statusText(id, fallback) {
  return String(document.getElementById(id)?.textContent || fallback).trim().replace(/\s+/g, " ");
}

function syncSelectedState() {
  const formation = selectedOptionLabel(document.getElementById("formationSelect"), "Formasjon ikke valgt");
  const tactic = selectedOptionLabel(document.getElementById("tacticSelect"), "Kampplan ikke valgt");

  const formationValue = document.getElementById("teamSelectedFormation");
  const tacticValue = document.getElementById("teamSelectedTactic");
  const systemFormation = document.getElementById("teamSystemFormation");
  const systemTactic = document.getElementById("teamSystemTactic");
  if (formationValue) formationValue.textContent = formation;
  if (tacticValue) tacticValue.textContent = tactic;
  if (systemFormation) systemFormation.textContent = formation;
  if (systemTactic) systemTactic.textContent = tactic;

  const slot = document.getElementById("teamSelectedSlot");
  const player = document.getElementById("teamSelectedPlayer");
  const role = document.getElementById("teamSelectedRole");
  if (slot) slot.textContent = selectedPitchSlotLabel();
  if (player) player.textContent = selectedPlayerLabel();
  if (role) role.textContent = selectedRoleLabel();

  const programValue = document.getElementById("teamSelectedTrainingProgram");
  const focusValue = document.getElementById("teamSelectedTrainingFocus");
  const individualValue = document.getElementById("teamSelectedIndividualTraining");
  if (programValue) programValue.textContent = statusText("weeklyTrainingProgramStatus", "Treningsprogram ikke valgt");
  if (focusValue) focusValue.textContent = statusText("weeklyTrainingStatus", "Treningsfokus ikke valgt");
  if (individualValue) individualValue.textContent = statusText("individualTrainingCapacity", "Ingen individuell oppfølging valgt");
}

function installSelectedStateContract() {
  ensureStyles();
  ensureDrawer();
  ensureTacticsSelectors();
  ensureLineupSelectedState();
  ensureTrainingSelectedState();
  ensureSystemSelectedState();
  ensureRosterState();
  syncSelectedState();
}

function scheduleInstall() {
  cancelAnimationFrame(mutationFrame);
  mutationFrame = requestAnimationFrame(() => {
    mutationFrame = 0;
    installSelectedStateContract();
  });
}

function boot() {
  installSelectedStateContract();

  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("#formationSelect, #tacticSelect")) queueMicrotask(syncSelectedState);
  });
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.("#lineupSlots, #lineupPlayerChoices, #lineupRoleChoices, #trainingPrograms, #weeklyTrainingOptions, #individualTrainingPicker")) {
      queueMicrotask(syncSelectedState);
    }
  });

  const observer = new MutationObserver((mutations) => {
    const drawer = document.getElementById(DRAWER_ID);
    const ownOnly = drawer && mutations.every((mutation) => drawer.contains(mutation.target));
    if (ownOnly) {
      queueMicrotask(syncSelectedState);
      return;
    }
    scheduleInstall();
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}
