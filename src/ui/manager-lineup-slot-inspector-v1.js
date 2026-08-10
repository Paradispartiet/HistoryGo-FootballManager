import {
  closeManagerTeamChoiceDrawer,
  openManagerTeamChoiceDrawer
} from "./manager-team-choice-drawer-v1.js";

const STYLE_ID = "managerLineupSlotInspectorV1Style";
const INSPECTOR_ID = "managerLineupSlotInspector";
const ROLE_DATA_URL = new URL("../../data/football_roles.json", import.meta.url);

let activePitchCard = null;
let roles = [];
let rolesLoaded = false;

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function tokenLabel(value) {
  return text(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("nb-NO"));
}

function normalizeLabel(value) {
  return text(value)
    .replace(/^rolle\s*:\s*/i, "")
    .replace(/^valgt\s*:\s*/i, "")
    .trim()
    .toLocaleLowerCase("nb-NO");
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-lineup-slot-inspector-v1.css", import.meta.url).href;
  document.head.append(link);
}

async function loadRoles() {
  if (rolesLoaded) return roles;
  rolesLoaded = true;
  try {
    const response = await fetch(ROLE_DATA_URL);
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    roles = Array.isArray(data?.roles) ? data.roles : [];
  } catch (error) {
    console.warn("Kunne ikke laste rolledata til oppstillingsinspektøren", error);
    roles = [];
  }
  return roles;
}

function focusables(root) {
  return Array.from(root.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function ensureInspector() {
  let inspector = document.getElementById(INSPECTOR_ID);
  if (inspector) return inspector;
  inspector = document.createElement("div");
  inspector.id = INSPECTOR_ID;
  inspector.className = "manager-lineup-slot-inspector";
  inspector.hidden = true;
  inspector.setAttribute("role", "dialog");
  inspector.setAttribute("aria-modal", "true");
  inspector.setAttribute("aria-labelledby", "managerLineupSlotTitle");
  inspector.innerHTML = `
    <button type="button" class="lineup-slot-inspector-backdrop" data-slot-inspector-close aria-label="Lukk spillerplass"></button>
    <aside class="lineup-slot-inspector-panel">
      <header class="lineup-slot-inspector-head">
        <div>
          <p class="eyebrow">Lag · Oppstilling</p>
          <h2 id="managerLineupSlotTitle">Spillerplass</h2>
        </div>
        <button type="button" class="lineup-slot-inspector-close" data-slot-inspector-close aria-label="Lukk spillerplass">×</button>
      </header>
      <div class="lineup-slot-inspector-body">
        <dl class="lineup-slot-current">
          <div><dt>Valgt</dt><dd id="managerLineupSlotPlayer">Ingen spiller valgt</dd></div>
          <div><dt>Rolle</dt><dd id="managerLineupSlotRole">Ingen rolle valgt</dd></div>
        </dl>
        <div class="lineup-slot-actions" aria-label="Handlinger for spillerplassen">
          <button type="button" data-slot-action="player">Bytt spiller</button>
          <button type="button" data-slot-action="role">Endre rolle</button>
          <button type="button" data-slot-action="profile">Se egenskaper</button>
          <button type="button" data-slot-action="learn-role">Lær om rollen</button>
        </div>
        <section id="managerLineupRoleLearning" class="lineup-slot-role-learning" aria-live="polite" hidden></section>
      </div>
    </aside>`;
  document.body.append(inspector);
  inspector.querySelectorAll("[data-slot-inspector-close]").forEach((button) => button.addEventListener("click", () => closeInspector()));
  inspector.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeInspector();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusables(inspector);
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
  inspector.querySelector('[data-slot-action="player"]')?.addEventListener("click", openPlayerChoices);
  inspector.querySelector('[data-slot-action="role"]')?.addEventListener("click", openRoleChoices);
  inspector.querySelector('[data-slot-action="profile"]')?.addEventListener("click", openSelectedProfile);
  inspector.querySelector('[data-slot-action="learn-role"]')?.addEventListener("click", toggleRoleLearning);
  return inspector;
}

function slotTitle(card) {
  const explicit = text(card?.dataset?.positionLabel || card?.dataset?.position || card?.dataset?.slotLabel || card?.dataset?.slot);
  if (explicit) return tokenLabel(explicit);
  const position = text(card?.querySelector?.(".lineup-position, .lineup-player-position, [data-position-label]")?.textContent);
  if (position) return position;
  const selected = text(document.getElementById("teamSelectedSlot")?.textContent);
  if (selected && selected !== "Valgt plass") return selected;
  const aria = text(card?.getAttribute?.("aria-label"));
  return aria ? aria.split(/[·,]/)[0].trim() : "Spillerplass";
}

function selectedPlayer() {
  return text(document.getElementById("teamSelectedPlayer")?.textContent, "Ingen spiller valgt");
}

function selectedRole() {
  return text(document.getElementById("teamSelectedRole")?.textContent, "Ingen rolle valgt");
}

function selectedPlayerProfileLink() {
  const selected = document.querySelector("#lineupPlayerChoices .lineup-player-select-action.is-selected, #lineupPlayerChoices [aria-pressed=\"true\"]");
  return selected?.closest?.(".lineup-player-choice-row")?.querySelector?.(".lineup-player-profile-link") || null;
}

function selectedRoleModel() {
  const wanted = normalizeLabel(selectedRole());
  if (!wanted || /ingen rolle|rolle velges/.test(wanted)) return null;
  return roles.find((role) => normalizeLabel(role?.name) === wanted || normalizeLabel(role?.id) === wanted) || null;
}

function renderRoleLearning() {
  const region = document.getElementById("managerLineupRoleLearning");
  if (!region) return;
  const role = selectedRoleModel();
  region.replaceChildren();
  if (!role) {
    region.innerHTML = '<h3>Rollen er ikke valgt</h3><p>Velg en rolle først. Rolleforklaringen leses fra den eksisterende rollekatalogen.</p>';
    return;
  }
  const h3 = document.createElement("h3");
  h3.textContent = role.name;
  const requirement = document.createElement("p");
  requirement.innerHTML = `<strong>Krever:</strong> ${Array.isArray(role.requires) ? role.requires.map(tokenLabel).join(" · ") : "Ikke dokumentert"}`;
  const works = document.createElement("p");
  works.innerHTML = `<strong>Fungerer godt med:</strong> ${Array.isArray(role.goodWith) ? role.goodWith.map(tokenLabel).join(" · ") : "Ikke dokumentert"}`;
  const risk = document.createElement("p");
  risk.innerHTML = `<strong>Passer dårlig med:</strong> ${Array.isArray(role.badFor) ? role.badFor.map(tokenLabel).join(" · ") : "Ikke dokumentert"}`;
  const source = document.createElement("small");
  source.textContent = "Forklaringen bruker den eksisterende football_roles-katalogen; den oppretter ingen ny rollemotor.";
  region.append(h3, requirement, works, risk, source);
}

function syncInspector() {
  const inspector = document.getElementById(INSPECTOR_ID);
  if (!inspector || inspector.hidden || !activePitchCard) return;
  inspector.dataset.slotId = text(activePitchCard.dataset.slotId);
  inspector.querySelector("#managerLineupSlotTitle").textContent = slotTitle(activePitchCard);
  inspector.querySelector("#managerLineupSlotPlayer").textContent = selectedPlayer();
  inspector.querySelector("#managerLineupSlotRole").textContent = selectedRole();
  const profile = inspector.querySelector('[data-slot-action="profile"]');
  if (profile) profile.disabled = !selectedPlayerProfileLink();
  const learn = inspector.querySelector('[data-slot-action="learn-role"]');
  if (learn) learn.disabled = !selectedRoleModel();
  if (!inspector.querySelector("#managerLineupRoleLearning")?.hidden) renderRoleLearning();
}

async function openInspector(card) {
  if (!(card instanceof HTMLElement)) return;
  activePitchCard = card;
  const inspector = ensureInspector();
  document.documentElement.classList.add("has-manager-lineup-slot-inspector");
  const legacyState = document.getElementById("teamLineupSelectedState");
  if (legacyState) legacyState.dataset.replacedBySlotInspector = "true";
  inspector.hidden = false;
  syncInspector();
  queueMicrotask(() => inspector.querySelector(".lineup-slot-inspector-close")?.focus());
  await loadRoles();
  syncInspector();
}

function closeInspector({ restoreFocus = true } = {}) {
  const inspector = document.getElementById(INSPECTOR_ID);
  if (!inspector || inspector.hidden) return;
  inspector.hidden = true;
  delete inspector.dataset.slotId;
  document.documentElement.classList.remove("has-manager-lineup-slot-inspector");
  const card = activePitchCard;
  activePitchCard = null;
  if (restoreFocus && card?.isConnected) card.focus?.();
}

function openPlayerChoices() {
  const source = document.getElementById("lineupPlayerChoices");
  const trigger = activePitchCard;
  if (!source) return;
  closeInspector({ restoreFocus: false });
  openManagerTeamChoiceDrawer({
    source,
    title: `Bytt spiller · ${slotTitle(trigger)}`,
    eyebrow: "Lag · Oppstilling",
    detail: "Bare History Go-spillerne som den eksisterende availability-logikken gjør tilgjengelige vises her.",
    trigger
  });
}

function openRoleChoices() {
  const source = document.getElementById("lineupRoleChoices");
  const trigger = activePitchCard;
  if (!source) return;
  closeInspector({ restoreFocus: false });
  openManagerTeamChoiceDrawer({
    source,
    title: `Endre rolle · ${slotTitle(trigger)}`,
    eyebrow: "Lag · Oppstilling",
    detail: "Rollealternativene er de eksisterende rollene for den aktive spillerplassen.",
    trigger
  });
}

function openSelectedProfile() {
  const link = selectedPlayerProfileLink();
  if (!link) return;
  closeInspector({ restoreFocus: false });
  link.click();
}

function toggleRoleLearning() {
  const region = document.getElementById("managerLineupRoleLearning");
  if (!region) return;
  region.hidden = !region.hidden;
  if (!region.hidden) renderRoleLearning();
}

function pitchCardFromTarget(target) {
  const card = target?.closest?.("#lineupSlots .player-chip");
  return card instanceof HTMLElement ? card : null;
}

function tacticsIsVisible() {
  const section = document.querySelector('[data-tab-section="tactics"]');
  return Boolean(section && !section.hidden);
}

function openFromUserActivation(card) {
  openInspector(card);
  // Legacy Oppstilling kan rerendre spillerbrikken i samme input-sekvens.
  // Dialogen er allerede synlig; etter rerender leser vi den oppdaterte
  // valgte spilleren og rollen fra eksisterende stateflate.
  setTimeout(syncInspector, 0);
}

function handlePitchPointerUp(event) {
  // app.js bruker programmatisk `.click()` når uttaket synkroniseres. Pointerup
  // oppstår bare ved faktisk peker-/touch-aktivering og kan derfor ikke åpne
  // inspektøren under intern state-synk.
  if (!(event instanceof PointerEvent) || event.button !== 0 || !event.isPrimary || !tacticsIsVisible()) return;
  const card = pitchCardFromTarget(event.target);
  if (!card) return;
  // Capture på selve banen kjører før spillerbrikkens legacy pointerup, som kan
  // kalle renderApp() og erstatte brikken. Åpne derfor dialogen mens kortet lever.
  openFromUserActivation(card);
}

function handlePitchKeydown(event) {
  if ((event.key !== "Enter" && event.key !== " ") || !tacticsIsVisible()) return;
  const card = pitchCardFromTarget(event.target);
  if (!card) return;
  openFromUserActivation(card);
}

function install() {
  ensureStyles();
  ensureInspector();
  const lineup = document.getElementById("lineupSlots");
  // Lytt direkte på oppstillingsbrettet. Da er aktiveringen uavhengig av eldre
  // dokument-delegering, samtidig som programmatisk `.click()` ikke kan trigge modal.
  lineup?.addEventListener("pointerup", handlePitchPointerUp, true);
  lineup?.addEventListener("keydown", handlePitchKeydown, true);
  window.addEventListener("hgfm:team-merits-changed", syncInspector);
  window.addEventListener("storage", syncInspector);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
}

export { closeInspector as closeManagerLineupSlotInspector };
