from pathlib import Path
import json
import re

root = Path('.')

module = r'''// HG Football Manager — Role-based first-team staff roster v1
// Pure deterministic model. No DOM, storage or network access.

export const STAFF_ROLE_REQUIREMENTS = Object.freeze([
  Object.freeze({ id: "assistant_coach", label: "Assistenttrener", required: 1, acceptedTypes: Object.freeze(["assistant_coach"]) }),
  Object.freeze({ id: "training_coach", label: "Trener", required: 3, acceptedTypes: Object.freeze(["training_coach", "coach", "physical_coach"]) }),
  Object.freeze({ id: "physio", label: "Fysio", required: 1, acceptedTypes: Object.freeze(["physio"]) }),
  Object.freeze({ id: "goalkeeper_coach", label: "Keepertrener", required: 1, acceptedTypes: Object.freeze(["goalkeeper_coach", "former_goalkeeper_goalkeeper_coach"]) })
]);

export const REQUIRED_FIRST_TEAM_STAFF = STAFF_ROLE_REQUIREMENTS.reduce((sum, role) => sum + role.required, 0);
const asArray = (value) => Array.isArray(value) ? value : [];
const staffId = (member) => member?.id == null ? "" : String(member.id);

export function getStaffCandidateTypes(member) {
  const types = new Set();
  if (member?.staffType) types.add(String(member.staffType));
  asArray(member?.canBeHiredAs).forEach((type) => { if (type) types.add(String(type)); });
  return [...types];
}

export function canStaffFillRole(member, roleId) {
  const requirement = STAFF_ROLE_REQUIREMENTS.find((role) => role.id === roleId);
  if (!requirement || !staffId(member)) return false;
  const types = new Set(getStaffCandidateTypes(member));
  return requirement.acceptedTypes.some((type) => types.has(type));
}

function expandedSlots() {
  return STAFF_ROLE_REQUIREMENTS.flatMap((role) => Array.from({ length: role.required }, (_, index) => ({
    id: `${role.id}:${index + 1}`,
    roleId: role.id,
    label: role.label
  })));
}

function preferenceScore(member, roleId) {
  const type = String(member?.staffType || "");
  if (type === roleId) return 100;
  if (roleId === "training_coach" && type === "coach") return 90;
  if (roleId === "training_coach" && type === "physical_coach") return 80;
  if (asArray(member?.canBeHiredAs).includes(roleId)) return 75;
  if (roleId === "training_coach" && asArray(member?.canBeHiredAs).includes("coach")) return 65;
  return 50;
}

function assignmentKey(assignments) {
  return assignments.map((entry) => `${entry.slotId}=${entry.staffId || "~"}`).join("|");
}

export function assignFirstTeamStaff(staff = []) {
  const candidates = asArray(staff).filter((member) => staffId(member)).slice().sort((a, b) => staffId(a).localeCompare(staffId(b)));
  const slots = expandedSlots();
  let best = { filled: -1, preference: -1, key: "", assignments: [] };
  function visit(index, used, assignments, filled, preference) {
    if (index >= slots.length) {
      const key = assignmentKey(assignments);
      if (filled > best.filled || (filled === best.filled && preference > best.preference) || (filled === best.filled && preference === best.preference && (!best.key || key < best.key))) {
        best = { filled, preference, key, assignments: assignments.map((entry) => ({ ...entry })) };
      }
      return;
    }
    const slot = slots[index];
    const eligible = candidates.filter((member) => !used.has(staffId(member)) && canStaffFillRole(member, slot.roleId)).sort((a, b) => preferenceScore(b, slot.roleId) - preferenceScore(a, slot.roleId) || staffId(a).localeCompare(staffId(b)));
    for (const member of eligible) {
      const id = staffId(member);
      used.add(id);
      assignments.push({ slotId: slot.id, roleId: slot.roleId, label: slot.label, staffId: id, member });
      visit(index + 1, used, assignments, filled + 1, preference + preferenceScore(member, slot.roleId));
      assignments.pop();
      used.delete(id);
    }
    assignments.push({ slotId: slot.id, roleId: slot.roleId, label: slot.label, staffId: null, member: null });
    visit(index + 1, used, assignments, filled, preference);
    assignments.pop();
  }
  visit(0, new Set(), [], 0, 0);
  return best.assignments;
}

export function summarizeStaffRoster(staff = []) {
  const assignments = assignFirstTeamStaff(staff);
  const byRole = STAFF_ROLE_REQUIREMENTS.map((requirement) => {
    const assigned = assignments.filter((entry) => entry.roleId === requirement.id && entry.staffId);
    return {
      id: requirement.id,
      label: requirement.label,
      required: requirement.required,
      filled: assigned.length,
      complete: assigned.length >= requirement.required,
      staffIds: assigned.map((entry) => entry.staffId),
      names: assigned.map((entry) => entry.member?.name || entry.staffId)
    };
  });
  const filledCount = byRole.reduce((sum, role) => sum + role.filled, 0);
  const missing = byRole.filter((role) => !role.complete).map((role) => ({ ...role, missing: role.required - role.filled }));
  return {
    assignments,
    byRole,
    filledCount,
    requiredCount: REQUIRED_FIRST_TEAM_STAFF,
    complete: missing.length === 0,
    missing,
    missingLabel: missing.map((role) => `${role.label} ${role.filled}/${role.required}`).join(" · ")
  };
}

export function decorateHiredStaffWithAssignments(staff = []) {
  const roleById = new Map(assignFirstTeamStaff(staff).filter((entry) => entry.staffId).map((entry) => [entry.staffId, entry.roleId]));
  return asArray(staff).map((member) => {
    const assignedStaffRole = roleById.get(staffId(member)) || null;
    return assignedStaffRole ? { ...member, originalStaffType: member.staffType || null, assignedStaffRole, staffType: assignedStaffRole } : { ...member, assignedStaffRole: null };
  });
}

export function selectStarterStaffCandidates(staff = []) {
  const starters = asArray(staff).filter((member) => member?.starterStaff === true && staffId(member));
  const selectedIds = new Set(assignFirstTeamStaff(starters).filter((entry) => entry.staffId).map((entry) => entry.staffId));
  return starters.filter((member) => selectedIds.has(staffId(member)));
}
'''
(root / 'src/football-staff-roster.js').write_text(module, encoding='utf-8')

ui = r'''import { summarizeStaffRoster } from "../football-staff-roster.js";

const MERITS_KEY = "hgfm.teamMerits.v1";
const SURFACE_ID = "managerStaffRosterV1";
const STYLE_ID = "managerStaffRosterV1Style";
let staffCatalogue = [];
let lastSignature = "";

function readMerits() {
  try { return JSON.parse(localStorage.getItem(MERITS_KEY) || "{}"); } catch { return {}; }
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
function ensureSurface() {
  const section = document.querySelector('[data-tab-section="admin"]'); if (!section) return null;
  let surface = document.getElementById(SURFACE_ID); if (surface) return surface;
  surface = el("section", "manager-staff-roster-v1"); surface.id = SURFACE_ID; surface.setAttribute("aria-labelledby", "managerStaffRosterTitle"); section.prepend(surface); return surface;
}
function roleCard(role) {
  const card = el("article", "staff-role-slot"); card.dataset.complete = role.complete ? "true" : "false";
  const head = el("div", "staff-role-slot-head"); head.append(el("strong", "", role.label), el("span", "staff-role-count", `${role.filled}/${role.required}`)); card.append(head);
  if (role.names.length) { const list = el("ul", "staff-role-names"); role.names.forEach((name) => list.append(el("li", "", name))); card.append(list); }
  else card.append(el("p", "staff-role-missing", "Ledig rolle"));
  return card;
}
export function renderManagerStaffRoster() {
  if (!staffCatalogue.length) return; ensureStyles(); const surface = ensureSurface(); if (!surface) return;
  const hired = currentHiredStaff(); const signature = hired.map((member) => member.id).sort().join("|");
  if (signature === lastSignature && surface.childElementCount) return; lastSignature = signature;
  const summary = summarizeStaffRoster(hired); surface.textContent = ""; surface.dataset.complete = summary.complete ? "true" : "false";
  const head = el("header", "staff-roster-head"); const copy = el("div");
  const eyebrow = el("p", "eyebrow", "Kontor · Klubbdrift · Stab & drift");
  const title = el("h2", "", "Førstelagsstab"); title.id = "managerStaffRosterTitle";
  copy.append(eyebrow, title, el("p", "muted-text", "Klubben trenger konkrete roller rundt laget. Tilgjengelig stab må engasjeres før de teller."));
  head.append(copy, el("strong", "staff-roster-total", `${summary.filledCount}/${summary.requiredCount} roller`));
  const grid = el("div", "staff-role-grid"); summary.byRole.forEach((role) => grid.append(roleCard(role)));
  const status = el("p", "staff-roster-status", summary.complete ? "Førstelagsstaben er komplett: assistenttrener, tre trenere, fysio og keepertrener." : `Mangler: ${summary.missingLabel || "roller i støtteapparatet"}.`); status.setAttribute("aria-live", "polite");
  surface.append(head, grid, status);
}
async function loadStaff() {
  try { const response = await fetch(new URL("../../data/football_staff.json", import.meta.url)); const data = await response.json(); staffCatalogue = Array.isArray(data?.staff) ? data.staff : []; renderManagerStaffRoster(); }
  catch (error) { console.warn("Kunne ikke laste stabsoversikten", error); }
}
function scheduleRender() { window.setTimeout(() => { lastSignature = ""; renderManagerStaffRoster(); }, 0); }
window.addEventListener("hgfm:team-merits-changed", scheduleRender);
window.addEventListener("storage", (event) => { if (event.key === MERITS_KEY) scheduleRender(); });
document.addEventListener("click", (event) => { if (event.target?.closest?.('[data-tab-section="admin"], [data-club-target="admin"]')) scheduleRender(); }, true);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadStaff, { once: true }); else loadStaff();
'''
(root / 'src/ui/manager-staff-workspace-v1.js').write_text(ui, encoding='utf-8')

css = r'''.manager-staff-roster-v1{display:grid;gap:1rem;margin:0 0 1.2rem;padding:1rem;border:1px solid rgba(255,255,255,.55);background:rgba(0,0,0,.5)}
.staff-roster-head{display:flex;align-items:end;justify-content:space-between;gap:1rem}.staff-roster-head h2{margin:.15rem 0 .35rem}.staff-roster-total{white-space:nowrap;font-size:1.05rem}.staff-role-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem}.staff-role-slot{min-width:0;padding:.75rem;border-top:2px solid rgba(255,255,255,.75);background:rgba(255,255,255,.04)}.staff-role-slot[data-complete="false"]{border-top-style:dashed;opacity:.82}.staff-role-slot-head{display:flex;justify-content:space-between;gap:.5rem}.staff-role-count{font-variant-numeric:tabular-nums}.staff-role-names{margin:.55rem 0 0;padding-left:1.05rem}.staff-role-names li+li{margin-top:.25rem}.staff-role-missing,.staff-roster-status{margin:.55rem 0 0}.manager-staff-roster-v1[data-complete="true"] .staff-roster-status{font-weight:700}@media(max-width:760px){.staff-roster-head{align-items:start;flex-direction:column}.staff-role-grid{grid-template-columns:1fr 1fr}}@media(max-width:430px){.manager-staff-roster-v1{padding:.8rem}.staff-role-grid{grid-template-columns:1fr}.staff-role-slot-head{align-items:baseline}}
'''
(root / 'src/ui/manager-staff-workspace-v1.css').write_text(css, encoding='utf-8')

staff_path = root / 'data/football_staff.json'
staff_data = json.loads(staff_path.read_text(encoding='utf-8'))
staff = staff_data.get('staff', [])
for member in staff:
    if member.get('id') in {'ullevaal_final_pressure_mentor', 'ekeberg_recruitment_coach', 'bislett_speed_specialist'}:
        member['starterStaff'] = True
additions = [
    {'id':'kfum_training_coach','name':'KFUM treningscoach','staffType':'coach','isPlaceholder':True,'needsResearch':True,'starterStaff':True,'canBeHiredAs':['coach'],'sourcePlaceIds':['kfum_arena'],'expertiseIds':['development_culture','passing_training','team_organisation'],'roles':['field_coach','player_development_coach'],'fitsClubs':['development_project','modern_training_environment'],'warningWhenMisused':'Denne plassholderprofilen representerer en ordinær treningscoach og skal erstattes når en dokumentert klubbperson er kuratert.'},
    {'id':'bislett_first_team_physio','name':'Bislett førstelagsfysio','staffType':'physio','isPlaceholder':True,'needsResearch':True,'starterStaff':True,'canBeHiredAs':['physio'],'sourcePlaceIds':['bislett_stadion'],'expertiseIds':['load_management','physical_preparation'],'roles':['first_team_physio','load_management'],'fitsClubs':['high_intensity_team','development_project'],'warningWhenMisused':'Denne plassholderprofilen representerer fysiorollen, ikke en identifisert virkelig person.'},
    {'id':'ullevaal_goalkeeper_coach','name':'Ullevaal keepertrener','staffType':'goalkeeper_coach','isPlaceholder':True,'needsResearch':True,'starterStaff':True,'canBeHiredAs':['goalkeeper_coach'],'sourcePlaceIds':['ullevaal_stadion'],'expertiseIds':['team_organisation','match_discipline'],'roles':['goalkeeper_development','match_preparation_coach'],'fitsClubs':['development_project','big_match_team'],'warningWhenMisused':'Denne plassholderprofilen representerer keepertrenerrollen, ikke en identifisert virkelig person.'}
]
existing = {member.get('id') for member in staff}
staff.extend(item for item in additions if item['id'] not in existing)
staff_path.write_text(json.dumps(staff_data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

shell_path = root / 'src/ui/manager-shell-view.js'
shell = shell_path.read_text(encoding='utf-8')
anchor = 'import "./manager-calendar-workspace-v1.js";'
if 'manager-staff-workspace-v1.js' not in shell:
    if anchor not in shell: raise SystemExit('manager shell import anchor missing')
    shell = shell.replace(anchor, anchor + '\nimport "./manager-staff-workspace-v1.js";', 1)
shell_path.write_text(shell, encoding='utf-8')

app_path = root / 'src/app.js'
app = app_path.read_text(encoding='utf-8')
import_anchor = 'import { migrateLegacyRecruitmentState, normalizeRecruitmentState } from "./football-recruitment.js";'
staff_import = 'import { decorateHiredStaffWithAssignments, selectStarterStaffCandidates, summarizeStaffRoster } from "./football-staff-roster.js";'
if staff_import not in app:
    if import_anchor not in app: raise SystemExit('app import anchor missing')
    app = app.replace(import_anchor, import_anchor + '\n' + staff_import, 1)
if 'const REQUIRED_STAFF_SIZE = 3;' not in app: raise SystemExit('old REQUIRED_STAFF_SIZE missing')
app = app.replace('const REQUIRED_STAFF_SIZE = 3;', 'const REQUIRED_STAFF_SIZE = 6;', 1)
old_starter = '''function getStarterSquadStaffCandidates(staff, limit = REQUIRED_STAFF_SIZE) {\n  if (!isStarterSquadActive()) return [];\n  const list = Array.isArray(staff) ? staff.filter((member) => member && member.id) : [];\n  return [...list]\n    .sort((a, b) => String(a.id).localeCompare(String(b.id)))\n    .slice(0, Math.max(0, limit));\n}'''
new_starter = '''function getStarterSquadStaffCandidates(staff) {\n  if (!isStarterSquadActive()) return [];\n  return selectStarterStaffCandidates(staff);\n}'''
if old_starter not in app: raise SystemExit('starter staff function not found')
app = app.replace(old_starter, new_starter, 1)
app = app.replace('const starterStaff = getStarterSquadStaffCandidates(staff, REQUIRED_STAFF_SIZE + 2);', 'const starterStaff = getStarterSquadStaffCandidates(staff);', 1)
old_hired = '''function getHiredStaff() {\n  const hiredIds = new Set(\n    Array.isArray(state.teamMerits?.hiredStaffIds) ? state.teamMerits.hiredStaffIds : []\n  );\n  return getUnlockedStaff().filter((member) => hiredIds.has(member.id));\n}'''
new_hired = '''function getHiredStaff() {\n  const hiredIds = new Set(\n    Array.isArray(state.teamMerits?.hiredStaffIds) ? state.teamMerits.hiredStaffIds : []\n  );\n  const hired = getUnlockedStaff().filter((member) => hiredIds.has(member.id));\n  return decorateHiredStaffWithAssignments(hired);\n}'''
if old_hired not in app: raise SystemExit('getHiredStaff function not found')
app = app.replace(old_hired, new_hired, 1)
marker = 'const hiredStaff = getHiredStaff().length;'
if marker not in app: raise SystemExit('preseason hiredStaff marker missing')
app = app.replace(marker, 'const staffRoster = summarizeStaffRoster(getHiredStaff());\n  const hiredStaff = staffRoster.filledCount;', 1)
old_item = '{ id: "stab", title: "Velg stab", done: hiredStaff >= REQUIRED_STAFF_SIZE, detail: `${hiredStaff}/${REQUIRED_STAFF_SIZE} stabsmedlemmer valgt. Tilgjengelig stab teller først når du faktisk engasjerer dem.`, tab: "historygo" },'
new_item = '{ id: "stab", title: "Velg stab", done: staffRoster.complete, detail: staffRoster.complete ? "Førstelagsstaben er komplett: assistenttrener, tre trenere, fysio og keepertrener." : `${hiredStaff}/${REQUIRED_STAFF_SIZE} roller dekket. Mangler: ${staffRoster.missingLabel || "rolledekning"}.`, tab: "admin" },'
if old_item not in app: raise SystemExit('preseason staff checklist item missing')
app = app.replace(old_item, new_item, 1)
app = app.replace('getHiredStaff().length >= REQUIRED_STAFF_SIZE', 'summarizeStaffRoster(getHiredStaff()).complete')
app_path.write_text(app, encoding='utf-8')

sim = r'''import fs from "node:fs";
import assert from "node:assert/strict";
import { REQUIRED_FIRST_TEAM_STAFF, STAFF_ROLE_REQUIREMENTS, assignFirstTeamStaff, decorateHiredStaffWithAssignments, selectStarterStaffCandidates, summarizeStaffRoster } from "../src/football-staff-roster.js";
const staff = JSON.parse(fs.readFileSync(new URL("../data/football_staff.json", import.meta.url), "utf8")).staff || [];
let checks=0; const check=(condition,message)=>{assert.ok(condition,message);checks+=1;console.log(`✓ ${checks}. ${message}`)};
check(REQUIRED_FIRST_TEAM_STAFF===6,"førstelagsstaben krever seks personer");
check(STAFF_ROLE_REQUIREMENTS.find(r=>r.id==="assistant_coach")?.required===1,"én assistenttrener kreves");
check(STAFF_ROLE_REQUIREMENTS.find(r=>r.id==="training_coach")?.required===3,"tre trenere kreves");
check(STAFF_ROLE_REQUIREMENTS.find(r=>r.id==="physio")?.required===1,"én fysio kreves");
check(STAFF_ROLE_REQUIREMENTS.find(r=>r.id==="goalkeeper_coach")?.required===1,"én keepertrener kreves");
const starters=selectStarterStaffCandidates(staff); const starterSummary=summarizeStaffRoster(starters);
check(starters.length===6,"startgulvet velger seks rollekompatible stabsprofiler"); check(starterSummary.complete,"startgulvet dekker alle roller"); check(starters.every(m=>m.isPlaceholder===true),"starterstaben bruker bare plassholderprofiler");
const three=[{id:"a",staffType:"coach",canBeHiredAs:["coach"]},{id:"b",staffType:"coach",canBeHiredAs:["coach"]},{id:"c",staffType:"coach",canBeHiredAs:["coach"]}]; const incomplete=summarizeStaffRoster(three);
check(!incomplete.complete,"tre vilkårlige trenere er ikke komplett stab"); check(incomplete.byRole.find(r=>r.id==="training_coach")?.filled===3,"tre trenere fyller bare trenerplassene"); check(incomplete.missing.some(r=>r.id==="assistant_coach"),"manglende assistent oppdages"); check(incomplete.missing.some(r=>r.id==="physio"),"manglende fysio oppdages"); check(incomplete.missing.some(r=>r.id==="goalkeeper_coach"),"manglende keepertrener oppdages");
const assignments=assignFirstTeamStaff(starters); check(assignments.filter(e=>e.staffId).length===6,"seks rolleplasser tildeles"); check(new Set(assignments.filter(e=>e.staffId).map(e=>e.staffId)).size===6,"samme person fyller ikke to plasser"); const decorated=decorateHiredStaffWithAssignments(starters); check(decorated.filter(m=>m.assignedStaffRole).length===6,"coach-context får tildelte roller"); check(decorated.some(m=>m.staffType==="physio"),"fysiorollen mates videre"); check(decorated.some(m=>m.staffType==="goalkeeper_coach"),"keepertrenerrollen mates videre"); console.log(`\n${checks}/${checks} staff-roster-sjekker bestått.`);
'''
(root / 'scripts/simulate-manager-staff-roster-v1.mjs').write_text(sim, encoding='utf-8')

audit = r'''import fs from "node:fs"; import assert from "node:assert/strict";
const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8"); const app=read("src/app.js"),shell=read("src/ui/manager-shell-view.js"),ui=read("src/ui/manager-staff-workspace-v1.js"),module=read("src/football-staff-roster.js"),ci=read(".github/workflows/ci.yml"); const pkg=JSON.parse(read("package.json")); const staff=JSON.parse(read("data/football_staff.json")).staff||[]; let checks=0; const check=(value,message)=>{assert.ok(value,message);checks+=1;console.log(`✓ ${checks}. ${message}`)};
check(app.includes('const REQUIRED_STAFF_SIZE = 6;'),"0/3-kravet er erstattet"); check(!app.includes('const REQUIRED_STAFF_SIZE = 3;'),"tre-personers gate er borte"); check(app.includes('summarizeStaffRoster(getHiredStaff())'),"før-sesong bruker rolledekning"); check(app.includes('decorateHiredStaffWithAssignments(hired)'),"coach-context får faktisk rolle"); check(app.includes('selectStarterStaffCandidates(staff)'),"startgulvet er rollebasert"); check(module.includes('required: 3')&&module.includes('goalkeeper_coach')&&module.includes('physio'),"modellen låser 1+3+1+1"); check(shell.includes('manager-staff-workspace-v1.js'),"stabsflaten lastes"); check(ui.includes('Førstelagsstab')&&ui.includes('staff-role-grid'),"konkrete rolleplasser vises"); check(staff.filter(m=>m.starterStaff===true).length===6,"seks starterprofiler finnes"); check(staff.some(m=>m.staffType==='physio'),"fysiokandidat finnes"); check(staff.some(m=>m.staffType==='goalkeeper_coach'),"keepertrenerkandidat finnes"); check(staff.filter(m=>m.starterStaff===true).every(m=>m.isPlaceholder===true),"starterstaben dikter ikke om ekte personer"); check(pkg.scripts['audit:manager-staff-roster-v1'],"audit er registrert"); check(pkg.scripts['sim:manager-staff-roster-v1'],"simulering er registrert"); check(ci.includes('audit:manager-staff-roster-v1')&&ci.includes('sim:manager-staff-roster-v1'),"CI kjører stabsportene"); check(!app.includes('done: hiredStaff >= REQUIRED_STAFF_SIZE'),"ingen count-only før-sesongsgate gjenstår"); console.log(`\n${checks}/${checks} staff-roster-auditsjekker bestått.`);
'''
(root / 'scripts/audit-manager-staff-roster-v1.mjs').write_text(audit, encoding='utf-8')

browser = r'''import AxeBuilder from "@axe-core/playwright"; import { expect, test } from "@playwright/test";
const COMPLETE=["ullevaal_final_pressure_mentor","ekeberg_recruitment_coach","bislett_speed_specialist","kfum_training_coach","bislett_first_team_physio","ullevaal_goalkeeper_coach"];
async function openStaff(page){await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();await page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]').click();await page.locator('.club-command-status[data-club-target="admin"]').click();await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();await expect(page.locator("#managerStaffRosterV1")).toBeVisible();}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)}
test.beforeEach(async({page})=>{await page.setViewportSize({width:1280,height:900});await page.emulateMedia({reducedMotion:"reduce"});await page.addInitScript((ids)=>{localStorage.setItem("hgfm.onboarded.v1","1");localStorage.setItem("hgfm.gameStartState.v1",JSON.stringify({selectedMode:"league",activeLeagueSaveId:"staff_v1",clubName:"Bislett FK",managerName:"Manager",leagueName:"Eliteserien",leagueSeasonStatus:"active"}));localStorage.setItem("hgfm.teamMerits.v1",JSON.stringify({recruitmentVersion:1,recruitedPlayerIds:[],unlockedPlaceIds:[],hiredStaffIds:ids,roleFamiliarity:{},localStart:{enabled:false,playerIds:[]}}));},COMPLETE);await page.goto("/");await expect(page.locator("#formationSelect option").first()).toBeAttached();await expect(page.locator("#onboardingScreen")).toBeHidden();});
test("viser 1 assistent, 3 trenere, fysio og keepertrener",async({page})=>{await openStaff(page);await expect(page.locator("#managerStaffRosterV1 .staff-role-slot")).toHaveCount(4);await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("6/6 roller");await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete","true");await expect(page.locator("#managerStaffRosterV1")).toContainText("Assistenttrener");await expect(page.locator("#managerStaffRosterV1")).toContainText("3/3");await expect(page.locator("#managerStaffRosterV1")).toContainText("Fysio");await expect(page.locator("#managerStaffRosterV1")).toContainText("Keepertrener");});
test("tre trenere er ikke komplett støtteapparat",async({page})=>{await openStaff(page);await page.evaluate(()=>{const merits=JSON.parse(localStorage.getItem("hgfm.teamMerits.v1")||"{}");merits.hiredStaffIds=["ekeberg_recruitment_coach","bislett_speed_specialist","kfum_training_coach"];localStorage.setItem("hgfm.teamMerits.v1",JSON.stringify(merits));window.dispatchEvent(new CustomEvent("hgfm:team-merits-changed"));});await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete","false");await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("3/6 roller");});
test("390px uten overflow",async({page})=>{await page.setViewportSize({width:390,height:844});await openStaff(page);await noOverflow(page);});
test("ingen alvorlige WCAG-brudd",async({page})=>{await openStaff(page);const results=await new AxeBuilder({page}).include('#managerStaffRosterV1').withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();const serious=results.violations.filter(v=>["serious","critical"].includes(v.impact));expect(serious,serious.map(v=>`${v.id}: ${v.help}`).join("\n")).toEqual([]);});
'''
(root / 'tests/browser/manager-staff-roster-v1.spec.js').write_text(browser, encoding='utf-8')

(root / 'docs/STAFF_ROSTER_V1.md').write_text('# Rollebasert førstelagsstab v1\n\nFør seriestart trenger klubben **1 assistenttrener, 3 trenere, 1 fysio og 1 keepertrener**. Modellen bruker eksisterende `staffRoles`, stabsdata og coach-context; den er ikke en parallell stabsmotor. `hiredStaffIds` forblir lagringens sannhetskilde, mens rollefordelingen beregnes deterministisk.\n\nNye saves får seks tydelig merkede plassholderprofiler som et nøytralt spillbarhetsgulv. De er ikke påstander om virkelige personer. History Go-opplåst stab fortsetter å komme fra eksisterende stedskoblinger.\n', encoding='utf-8')

pkg_path=root/'package.json'; pkg=json.loads(pkg_path.read_text(encoding='utf-8')); pkg['scripts']['audit:manager-staff-roster-v1']='node scripts/audit-manager-staff-roster-v1.mjs'; pkg['scripts']['sim:manager-staff-roster-v1']='node scripts/simulate-manager-staff-roster-v1.mjs'; pkg_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ci_path=root/'.github/workflows/ci.yml'; ci=ci_path.read_text(encoding='utf-8');
if 'audit:manager-staff-roster-v1' not in ci: ci=ci.replace('          npm run audit:manager-calendar-v1\n','          npm run audit:manager-calendar-v1\n          npm run audit:manager-staff-roster-v1\n',1)
if 'sim:manager-staff-roster-v1' not in ci: ci=ci.replace('          npm run sim:manager-calendar-v1\n','          npm run sim:manager-calendar-v1\n          npm run sim:manager-staff-roster-v1\n',1)
ci_path.write_text(ci,encoding='utf-8')
