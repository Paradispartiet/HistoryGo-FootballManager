import { summarizeStaffRoster, summarizeStarterStaffReadiness } from "../football-staff-roster.js";

const MERITS_KEY = "hgfm.teamMerits.v1";
const GAME_START_KEY = "hgfm.gameStartState.v1";
const SURFACE_ID = "managerStaffRosterV1";
const STYLE_ID = "managerStaffRosterV1Style";
let staffCatalogue = [];
let lastSignature = "";

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function readMerits() {
  return readJson(MERITS_KEY);
}
function readGameStart() {
  return readJson(GAME_START_KEY);
}
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link"); link.id = STYLE_ID; link.rel = "stylesheet";
  link.href = new URL("./manager-staff-workspace-v1.css", import.meta.url).href; document.head.append(link);
}
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; }
function currentHiredStaff() {
  const merits = readMerits();
  const ids = new Set(Array.isArray(merits?.hiredStaffIds) ? merits.hiredStaffIds.map(String) : []);
  return staffCatalogue.filter((member) => ids.has(String(member.id)));
}
function currentClubId() {
  return readGameStart()?.takeoverClubId || null;
}
function ensureSurface() {
  const section = document.querySelector('[data-tab-section="admin"]'); if (!section) return null;
  let surface = document.getElementById(SURFACE_ID); if (surface) return surface;
  surface = el("section", "manager-staff-roster-v1"); surface.id = SURFACE_ID; surface.setAttribute("aria-labelledby", "managerStaffRosterTitle"); section.prepend(surface); return surface;
}
function roleCard(role) {
  const card = el("article", "staff-role-slot");
  const head = el("div", "staff-role-slot-head"); head.append(el("strong", "", role.label), el("span", "staff-role-count", `${role.filled}/${role.required} maks`)); card.append(head);
  if (role.names.length) { const list = el("ul", "staff-role-names"); role.names.forEach((name) => list.append(el("li", "", name))); card.append(list); }
  else card.append(el("p", "staff-role-missing", "Ingen aktiv"));
  return card;
}
export function renderManagerStaffRoster() {
  if (!staffCatalogue.length) return; ensureStyles(); const surface = ensureSurface(); if (!surface) return;
  const hired = currentHiredStaff();
  const clubId = currentClubId();
  const signature = `${clubId || "generic"}|${hired.map((member) => member.id).sort().join("|")}`;
  if (signature === lastSignature && surface.childElementCount) return; lastSignature = signature;
  const capacity = summarizeStaffRoster(hired);
  const readiness = summarizeStarterStaffReadiness(staffCatalogue, clubId, hired);
  surface.textContent = ""; surface.dataset.complete = readiness.complete ? "true" : "false";
  const head = el("header", "staff-roster-head"); const copy = el("div");
  const eyebrow = el("p", "eyebrow", "Kontor · Klubbdrift · Stab & drift");
  const title = el("h2", "", "Førstelagsstab"); title.id = "managerStaffRosterTitle";
  copy.append(
    eyebrow,
    title,
    el("p", "muted-text", "Rollefeltene viser aktiv bruk mot maksimal kapasitet. Før seriestart må startersettet for valgt klubb engasjeres.")
  );
  head.append(copy, el("strong", "staff-roster-total", `${readiness.hiredCount}/${readiness.requiredCount} starterstab`));
  const grid = el("div", "staff-role-grid"); capacity.byRole.forEach((role) => grid.append(roleCard(role)));
  const statusText = readiness.complete
    ? readiness.usesCuratedClubSet
      ? "Starterstabens rollebehov er dekket."
      : "Den generiske starterstaben er engasjert."
    : readiness.missingLabel
      ? `Mangler i starterstabens rolledekning: ${readiness.missingLabel}.`
      : `Starterstab: ${readiness.hiredCount}/${readiness.requiredCount} engasjert.`;
  const status = el("p", "staff-roster-status", statusText); status.setAttribute("aria-live", "polite");
  surface.append(head, grid, status);
}
async function loadStaff() {
  try { const response = await fetch(new URL("../../data/football_staff.json", import.meta.url)); const data = await response.json(); staffCatalogue = Array.isArray(data?.staff) ? data.staff : []; renderManagerStaffRoster(); }
  catch (error) { console.warn("Kunne ikke laste stabsoversikten", error); }
}
function scheduleRender() { window.setTimeout(() => { lastSignature = ""; renderManagerStaffRoster(); }, 0); }
window.addEventListener("hgfm:team-merits-changed", scheduleRender);
window.addEventListener("storage", (event) => { if (event.key === MERITS_KEY || event.key === GAME_START_KEY) scheduleRender(); });
document.addEventListener("click", (event) => { if (event.target?.closest?.('[data-tab-section="admin"], [data-club-target="admin"]')) scheduleRender(); }, true);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadStaff, { once: true }); else loadStaff();
