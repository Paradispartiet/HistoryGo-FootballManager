from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT / path).read_text(encoding="utf-8")

def write(path, text):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing replacement target: {label}")
    if text.count(old) != 1:
        raise SystemExit(f"replacement target not unique ({text.count(old)}): {label}")
    return text.replace(old, new, 1)

def replace_between(text, start, end, replacement, label):
    a = text.find(start)
    if a < 0:
        raise SystemExit(f"missing start marker: {label}")
    b = text.find(end, a)
    if b < 0:
        raise SystemExit(f"missing end marker: {label}")
    return text[:a] + replacement + text[b:]

# ---------------------------------------------------------------------------
# New pure facility domain module.
# ---------------------------------------------------------------------------
write("src/football-facilities.js", r'''// Reelle fasilitetsoppgraderinger v1.
//
// Fasiliteter er klubbens varige arbeidsforhold, ikke en ny økonomimotor.
// State bor i eksisterende hgfm.teamMerits.v1, og manageren kan gjøre ett
// eksplisitt anleggsvalg per klubbuke. Ingen ny valuta og ingen auto-progresjon.

export const FACILITIES_VERSION = 1;
export const FACILITY_MAX_LEVEL = 3;

export const FACILITY_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "training",
    title: "Treningsanlegg",
    description: "Bedre arbeidsforhold gjør harde treningsuker mindre kostbare og øker trivselen i treningsarbeidet.",
    levelEffects: Object.freeze([
      "Standard treningsramme.",
      "−1 treningsslitasje og +1 treningstrivsel per gjennomført treningsuke.",
      "−2 treningsslitasje og +2 treningstrivsel per gjennomført treningsuke."
    ])
  }),
  Object.freeze({
    id: "medical",
    title: "Medisinsk avdeling",
    description: "Bedre restitusjon og skadeforebygging hjelper laget mellom kampene.",
    levelEffects: Object.freeze([
      "Standard restitusjon.",
      "+3 ekstra belastningspoeng restituert per uke og bedre skadebeskyttelse i trening.",
      "+6 ekstra belastningspoeng restituert per uke og sterkere skadebeskyttelse i trening."
    ])
  }),
  Object.freeze({
    id: "analysis",
    title: "Analyseavdeling",
    description: "Bedre analyse gjør treningsarbeidet taktisk tydeligere uten å lage en ny taktikkmotor.",
    levelEffects: Object.freeze([
      "Standard analysegrunnlag.",
      "+1 taktisk klarhet fra hver gjennomførte treningsuke.",
      "+2 taktisk klarhet fra hver gjennomførte treningsuke."
    ])
  })
]);

const FACILITY_IDS = new Set(FACILITY_DEFINITIONS.map((item) => item.id));

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function level(value) {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(FACILITY_MAX_LEVEL, parsed));
}

function weekNumber(value) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function normalizeFacilityState(input) {
  const src = isObject(input) ? input : {};
  const levels = isObject(src.levels) ? src.levels : {};
  const lastUpgradeWeek = Math.trunc(Number(src.lastUpgradeWeek));
  const lastUpgradeFacilityId = FACILITY_IDS.has(src.lastUpgradeFacilityId) ? src.lastUpgradeFacilityId : null;
  return {
    version: FACILITIES_VERSION,
    levels: {
      training: level(levels.training),
      medical: level(levels.medical),
      analysis: level(levels.analysis)
    },
    lastUpgradeWeek: Number.isFinite(lastUpgradeWeek) && lastUpgradeWeek >= 1 ? lastUpgradeWeek : null,
    lastUpgradeFacilityId
  };
}

export function calculateFacilityEffects(input) {
  const state = normalizeFacilityState(input);
  const training = state.levels.training - 1;
  const medical = state.levels.medical - 1;
  const analysis = state.levels.analysis - 1;
  return {
    trainingLoadReduction: training,
    trainingHappinessBonus: training,
    weeklyRecoveryBonus: medical * 3,
    medicalTrainingProtection: medical,
    analysisClarityBonus: analysis
  };
}

export function canUpgradeFacility(input, facilityId, { week = 1 } = {}) {
  const state = normalizeFacilityState(input);
  const normalizedWeek = weekNumber(week);
  if (!FACILITY_IDS.has(facilityId)) return { allowed: false, reason: "Ukjent fasilitet." };
  if (state.levels[facilityId] >= FACILITY_MAX_LEVEL) return { allowed: false, reason: "Maksnivå er nådd." };
  if (state.lastUpgradeWeek === normalizedWeek) {
    return { allowed: false, reason: "Ukens anleggsvalg er allerede brukt." };
  }
  return { allowed: true, reason: "Ett anleggsvalg er tilgjengelig denne manageruka." };
}

export function upgradeFacilityInMerits(merits, facilityId, { week = 1 } = {}) {
  const source = isObject(merits) ? merits : {};
  const facilities = normalizeFacilityState(source.facilities);
  const normalizedWeek = weekNumber(week);
  const gate = canUpgradeFacility(facilities, facilityId, { week: normalizedWeek });
  if (!gate.allowed) {
    return { changed: false, reason: gate.reason, merits: source, facilities };
  }
  const fromLevel = facilities.levels[facilityId];
  const nextFacilities = {
    ...facilities,
    levels: { ...facilities.levels, [facilityId]: fromLevel + 1 },
    lastUpgradeWeek: normalizedWeek,
    lastUpgradeFacilityId: facilityId
  };
  return {
    changed: true,
    reason: "Oppgradert.",
    facilityId,
    fromLevel,
    toLevel: fromLevel + 1,
    facilities: nextFacilities,
    merits: { ...source, facilities: nextFacilities }
  };
}

export function summarizeFacilityState(input) {
  const state = normalizeFacilityState(input);
  const total = Object.values(state.levels).reduce((sum, value) => sum + value, 0);
  const label = total >= 8 ? "Sterk" : total >= 6 ? "Solid" : total >= 4 ? "På vei" : "Grunnleggende";
  const tone = total >= 8 ? "positive" : total >= 6 ? "neutral" : total >= 4 ? "attention" : "neutral";
  return {
    label,
    tone,
    total,
    maxTotal: FACILITY_DEFINITIONS.length * FACILITY_MAX_LEVEL,
    detail: `Trening ${state.levels.training}/3 · Medisinsk ${state.levels.medical}/3 · Analyse ${state.levels.analysis}/3.`
  };
}
''')

# ---------------------------------------------------------------------------
# New facilities presentation module.
# ---------------------------------------------------------------------------
write("src/ui/manager-facilities-workspace-v1.js", r'''import {
  FACILITY_DEFINITIONS,
  FACILITY_MAX_LEVEL,
  canUpgradeFacility,
  calculateFacilityEffects,
  normalizeFacilityState,
  summarizeFacilityState
} from "../football-facilities.js";

function text(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value;
  return el;
}

export function createManagerFacilitiesModel({ facilityState = null, week = 1 } = {}) {
  const state = normalizeFacilityState(facilityState);
  const summary = summarizeFacilityState(state);
  const effects = calculateFacilityEffects(state);
  const normalizedWeek = Math.max(1, Math.trunc(Number(week)) || 1);
  const usedThisWeek = state.lastUpgradeWeek === normalizedWeek;
  const chosen = FACILITY_DEFINITIONS.find((item) => item.id === state.lastUpgradeFacilityId) || null;
  return {
    week: normalizedWeek,
    state,
    summary,
    effects,
    weeklyStatus: usedThisWeek
      ? `Ukens anleggsvalg er brukt${chosen ? ` på ${chosen.title}` : ""}.`
      : "Ett anleggsvalg er tilgjengelig denne manageruka.",
    facilities: FACILITY_DEFINITIONS.map((definition) => {
      const currentLevel = state.levels[definition.id];
      const gate = canUpgradeFacility(state, definition.id, { week: normalizedWeek });
      return {
        ...definition,
        currentLevel,
        levelLabel: `Nivå ${currentLevel} av ${FACILITY_MAX_LEVEL}`,
        effect: definition.levelEffects[currentLevel - 1],
        nextEffect: currentLevel < FACILITY_MAX_LEVEL ? definition.levelEffects[currentLevel] : "Maksnivå er nådd.",
        canUpgrade: gate.allowed,
        blockedReason: gate.reason,
        actionLabel: currentLevel < FACILITY_MAX_LEVEL ? `Oppgrader til nivå ${currentLevel + 1}` : "Maksnivå"
      };
    })
  };
}

export function renderManagerFacilitiesWorkspace(container, model, { onUpgrade } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.week = String(model.week);
  container.dataset.lastUpgradeWeek = model.state.lastUpgradeWeek ? String(model.state.lastUpgradeWeek) : "";

  const summary = document.querySelector("#facilityOverallValue");
  if (summary) {
    summary.textContent = model.summary.label;
    summary.setAttribute("aria-label", `${model.summary.label}. ${model.summary.detail}`);
  }

  const weekly = text("p", "facility-week-choice", model.weeklyStatus);
  weekly.setAttribute("role", "status");
  container.append(weekly);

  const grid = document.createElement("div");
  grid.className = "manager-facility-grid";

  model.facilities.forEach((facility) => {
    const card = document.createElement("article");
    card.className = "manager-facility-card";
    card.dataset.facilityId = facility.id;
    card.dataset.level = String(facility.currentLevel);

    const head = document.createElement("div");
    head.className = "manager-facility-head";
    head.append(
      text("h3", "", facility.title),
      text("strong", "manager-facility-level", facility.levelLabel)
    );

    const current = text("p", "manager-facility-effect", facility.effect);
    const next = text("p", "manager-facility-next", `Neste: ${facility.nextEffect}`);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "facility-upgrade-action";
    button.dataset.facilityId = facility.id;
    button.textContent = facility.actionLabel;
    button.disabled = !facility.canUpgrade;
    button.setAttribute("aria-describedby", `facility-${facility.id}-reason`);
    if (facility.canUpgrade && typeof onUpgrade === "function") {
      button.addEventListener("click", () => onUpgrade(facility.id));
    }
    const reason = text("small", "manager-facility-reason", facility.canUpgrade ? "Én eksplisitt managerbeslutning — ingen kostnad eller auto-oppgradering." : facility.blockedReason);
    reason.id = `facility-${facility.id}-reason`;

    card.append(
      head,
      text("p", "manager-facility-description", facility.description),
      current,
      next,
      button,
      reason
    );
    grid.append(card);
  });

  container.append(grid);
}
''')

write("src/ui/manager-facilities-workspace-v1.css", r'''/* Manager Facilities Workspace v1 */
.manager-facilities-workspace-v1{display:grid;gap:1rem}.facility-week-choice{margin:0;padding:.8rem 1rem;border-left:3px solid currentColor;background:rgba(0,0,0,.58);color:#fff}.manager-facility-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.85rem}.manager-facility-card{display:flex;min-width:0;flex-direction:column;gap:.65rem;padding:1rem;border:1px solid rgba(255,255,255,.62);background:rgba(0,0,0,.72);color:#fff}.manager-facility-head{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem}.manager-facility-head h3{margin:0;font-size:1.05rem}.manager-facility-level{white-space:nowrap;font-variant-numeric:tabular-nums}.manager-facility-description,.manager-facility-effect,.manager-facility-next{margin:0;line-height:1.45}.manager-facility-description{color:#d9dde4}.manager-facility-effect{font-weight:700}.manager-facility-next{color:#eef1f5}.facility-upgrade-action{width:100%;min-height:44px;margin-top:auto;border:1px solid #fff;background:#fff;color:#0b0b0b;font:inherit;font-weight:800;cursor:pointer}.facility-upgrade-action:focus-visible{outline:3px solid #fff;outline-offset:3px}.facility-upgrade-action:disabled{cursor:not-allowed;background:#1e1e1e;color:#cfd4dc;border-color:#6e737b}.manager-facility-reason{display:block;min-height:2.6em;color:#d9dde4;line-height:1.35}@media(max-width:820px){.manager-facility-grid{grid-template-columns:1fr}.manager-facility-card{padding:.9rem}}@media(max-width:430px){.manager-facility-head{align-items:flex-start;flex-direction:column}.manager-facility-level{white-space:normal}}
''')

# ---------------------------------------------------------------------------
# Core app integration.
# ---------------------------------------------------------------------------
app = read("src/app.js")
app = replace_once(
    app,
    'import { decorateHiredStaffWithAssignments, selectStarterStaffCandidates, summarizeStaffRoster } from "./football-staff-roster.js";\n',
    'import { decorateHiredStaffWithAssignments, selectStarterStaffCandidates, summarizeStaffRoster } from "./football-staff-roster.js";\nimport { calculateFacilityEffects, normalizeFacilityState, upgradeFacilityInMerits } from "./football-facilities.js";\nimport { createManagerFacilitiesModel, renderManagerFacilitiesWorkspace } from "./ui/manager-facilities-workspace-v1.js";\n',
    "app facility imports"
)
app = replace_once(
    app,
    '    hiredStaffIds: Array.isArray(base.hiredStaffIds) ? base.hiredStaffIds : [],\n',
    '    hiredStaffIds: Array.isArray(base.hiredStaffIds) ? base.hiredStaffIds : [],\n    // Reelle fasilitetsoppgraderinger v1: varig klubbstate i eksisterende teamMerits.\n    facilities: normalizeFacilityState(base.facilities),\n',
    "team merits facilities normalization"
)
app = replace_once(
    app,
    '  state.playerCondition = applyWeeklyRecovery(getPlayerCondition(), { trainingIntensity });\n',
    '  state.playerCondition = applyWeeklyRecovery(getPlayerCondition(), {\n    trainingIntensity,\n    recoveryBonus: calculateFacilityEffects(state.teamMerits?.facilities).weeklyRecoveryBonus\n  });\n',
    "medical recovery integration"
)
app = replace_once(
    app,
    '    state.teamMerits.offPitch = applyTrainingProgramOffPitchEffects(getOffPitchState(), program);\n',
    '    state.teamMerits.offPitch = applyTrainingProgramOffPitchEffects(\n      getOffPitchState(),\n      program,\n      { facilityEffects: calculateFacilityEffects(state.teamMerits?.facilities) }\n    );\n',
    "training facility integration"
)
app = replace_once(
    app,
    '    unlockedExpertiseCount: getUnlockedExpertise().length,\n',
    '    unlockedExpertiseCount: getUnlockedExpertise().length,\n    facilitiesState: state.teamMerits?.facilities,\n',
    "club scene facilities state"
)
new_render_facilities = r'''function renderFacilities() {
  const facilityState = normalizeFacilityState(state.teamMerits?.facilities);
  const week = Math.max(1, Number(state.clubWeekState?.week) || 1);
  const model = createManagerFacilitiesModel({ facilityState, week });
  renderManagerFacilitiesWorkspace(document.querySelector("#managerFacilitiesWorkspace"), model, {
    onUpgrade: (facilityId) => {
      if (!state.teamMerits) return;
      const result = upgradeFacilityInMerits(state.teamMerits, facilityId, { week });
      if (!result.changed) {
        renderFacilities();
        return;
      }
      state.teamMerits = result.merits;
      saveTeamMerits();
      renderFacilities();
      renderManagerClubScene();
    }
  });
}
'''
app = replace_between(app, "function renderFacilities() {", "\n\nfunction openManagerClubTarget", new_render_facilities, "renderFacilities")
write("src/app.js", app)

# ---------------------------------------------------------------------------
# Player condition: medical facilities improve existing recovery, no new engine.
# ---------------------------------------------------------------------------
condition = read("src/football-player-condition.js")
condition = replace_once(
    condition,
    'export function applyWeeklyRecovery(conditions, { trainingIntensity = 1 } = {}) {\n',
    'export function applyWeeklyRecovery(conditions, { trainingIntensity = 1, recoveryBonus = 0 } = {}) {\n',
    "recovery signature"
)
condition = replace_once(
    condition,
    '  const factor = clamp(2 - clamp(num(trainingIntensity, 1), 0.5, 1.6), 0.4, 1.5);\n\n  map.forEach((condition) => {\n    condition.load = round1(clamp(condition.load - BASE_WEEKLY_RECOVERY * factor, 0, 100));\n',
    '  const factor = clamp(2 - clamp(num(trainingIntensity, 1), 0.5, 1.6), 0.4, 1.5);\n  const facilityRecovery = clamp(num(recoveryBonus), 0, 8);\n\n  map.forEach((condition) => {\n    condition.load = round1(clamp(condition.load - (BASE_WEEKLY_RECOVERY * factor + facilityRecovery), 0, 100));\n',
    "recovery bonus"
)
write("src/football-player-condition.js", condition)

# ---------------------------------------------------------------------------
# Off-pitch training: training + analysis + medical facilities feed existing effects.
# ---------------------------------------------------------------------------
offpitch = read("src/football-off-pitch-parameters.js")
offpitch = replace_once(
    offpitch,
    'export function applyTrainingProgramOffPitchEffects(state, trainingProgram) {\n',
    'export function applyTrainingProgramOffPitchEffects(state, trainingProgram, { facilityEffects = {} } = {}) {\n',
    "offpitch facility signature"
)
offpitch = replace_once(
    offpitch,
    '  for (const [param, delta] of Object.entries(base)) {\n    const isPhysical = param === "fatigue" || param === "wear" || param === "injuryRisk";\n    scaled[param] = Math.round(isPhysical ? delta * factor : delta);\n  }\n\n  const next = applyDeltas(state, scaled);\n',
    '  for (const [param, delta] of Object.entries(base)) {\n    const isPhysical = param === "fatigue" || param === "wear" || param === "injuryRisk";\n    scaled[param] = Math.round(isPhysical ? delta * factor : delta);\n  }\n\n  // Fasiliteter modifiserer den eksisterende treningseffekten; de oppretter\n  // ingen parallelle fatigue-, skade- eller taktikkverdier.\n  const trainingRelief = Math.max(0, Math.min(2, Number(facilityEffects?.trainingLoadReduction) || 0));\n  const medicalProtection = Math.max(0, Math.min(2, Number(facilityEffects?.medicalTrainingProtection) || 0));\n  const clarityBonus = Math.max(0, Math.min(2, Number(facilityEffects?.analysisClarityBonus) || 0));\n  const happinessBonus = Math.max(0, Math.min(2, Number(facilityEffects?.trainingHappinessBonus) || 0));\n  if ((scaled.fatigue || 0) > 0) scaled.fatigue = Math.max(0, scaled.fatigue - trainingRelief);\n  if ((scaled.wear || 0) > 0) scaled.wear = Math.max(0, scaled.wear - trainingRelief - medicalProtection);\n  if ((scaled.injuryRisk || 0) > 0) scaled.injuryRisk = Math.max(0, scaled.injuryRisk - medicalProtection);\n  scaled.tacticalClarity = Math.round((scaled.tacticalClarity || 0) + clarityBonus);\n  scaled.trainingHappiness = Math.round((scaled.trainingHappiness || 0) + happinessBonus);\n\n  const next = applyDeltas(state, scaled);\n',
    "offpitch facility application"
)
write("src/football-off-pitch-parameters.js", offpitch)

# ---------------------------------------------------------------------------
# Club command summary: explicit facility state replaces fake derived readout.
# ---------------------------------------------------------------------------
presentation = read("src/ui/manager-club-presentation.js")
if not presentation.startswith('import { summarizeFacilityState }'):
    presentation = 'import { summarizeFacilityState } from "../football-facilities.js";\n\n' + presentation
presentation = replace_between(
    presentation,
    "function deriveFacilityReading(",
    "\n\nfunction deriveMarketReading",
    'function deriveFacilityReading(facilitiesState) {\n  return summarizeFacilityState(facilitiesState);\n}\n',
    "club facility reading"
)
presentation = replace_once(
    presentation,
    '  hiredStaffCount = 0,\n',
    '  hiredStaffCount = 0,\n  facilitiesState = null,\n',
    "club scene facilities param"
)
presentation = replace_once(
    presentation,
    '  const facilities = deriveFacilityReading({ clubState, players, hiredStaff });\n',
    '  const facilities = deriveFacilityReading(facilitiesState);\n',
    "club scene explicit facility summary"
)
write("src/ui/manager-club-presentation.js", presentation)

# ---------------------------------------------------------------------------
# HTML: three real facilities only; remove fake stadium/academy derivations.
# ---------------------------------------------------------------------------
html = read("index.html")
html = replace_once(
    html,
    '  <link rel="stylesheet" href="src/ui/manager-club-scene-v1.css">\n',
    '  <link rel="stylesheet" href="src/ui/manager-club-scene-v1.css">\n  <link rel="stylesheet" href="src/ui/manager-facilities-workspace-v1.css">\n',
    "facilities stylesheet"
)
facilities_section = r'''    <!-- ============================ FASILITETER ============================ -->
    <div class="tab-section dept dept-facilities" data-tab-section="facilities" data-tab-parent="board" data-shell-hidden hidden>
      <section class="dept-hero dept-hero-facilities">
        <div>
          <p class="eyebrow">Klubbanlegg</p>
          <h2>Fasiliteter</h2>
          <p class="dept-hero-lede">Velg én reell anleggsoppgradering per manageruke. Oppgraderingene lagres i klubbens eksisterende save og virker direkte på trening, restitusjon og taktisk klarhet.</p>
        </div>
        <div class="dept-hero-stat dept-hero-stat-live">
          <strong id="facilityOverallValue">Grunnleggende</strong>
          <span>anleggsstatus</span>
        </div>
      </section>
      <div id="managerFacilitiesWorkspace" class="manager-facilities-workspace-v1" aria-live="polite"></div>
    </div>

'''
html = replace_between(
    html,
    "    <!-- ============================ FASILITETER ============================ -->",
    "    <!-- ============================ ADMINISTRASJON ============================ -->",
    facilities_section,
    "facilities html"
)
write("index.html", html)

# ---------------------------------------------------------------------------
# Example save gets the explicit default field. No new storage key.
# ---------------------------------------------------------------------------
merits_path = ROOT / "data/football_team_merits.example.json"
merits = json.loads(merits_path.read_text(encoding="utf-8"))
merits["facilities"] = {
    "version": 1,
    "levels": {"training": 1, "medical": 1, "analysis": 1},
    "lastUpgradeWeek": None,
    "lastUpgradeFacilityId": None
}
merits_path.write_text(json.dumps(merits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# ---------------------------------------------------------------------------
# Current docs: facility readout is superseded by explicit upgrades.
# ---------------------------------------------------------------------------
docs = read("docs/MANAGER_CLUB_OPERATIONS_V1.md")
docs = docs.replace(
    "Ingen ny klubbmotor introduseres. Presentasjonen leser bare eksisterende tilstand:",
    "Klubbdriftens øvrige områder leser fortsatt eksisterende tilstand. Fasiliteter har fra Facilities Upgrades v1 en liten, eksplisitt save-modell i eksisterende `teamMerits`:"
)
docs = docs.replace(
    "- Fasilitetsnivåene er avledede lesesignaler. Det finnes ingen kjøp-/oppgraderingsmotor i denne versjonen.",
    "- Fasilitetsnivåene er ikke lenger avledet fra medietrykk/spillerantall. Facilities Upgrades v1 lagrer nivå 1–3 for trening, medisinsk og analyse i eksisterende `teamMerits`, med ett managerstyrt valg per klubbuke."
)
docs = docs.replace(
    "- Ingen nye localStorage-nøkler, save-felt eller History Go-unlocks.",
    "- Ingen nye localStorage-nøkler eller History Go-unlocks. Fasilitetsstate er et nytt felt i eksisterende `hgfm.teamMerits.v1`."
)
write("docs/MANAGER_CLUB_OPERATIONS_V1.md", docs)

write("docs/FACILITIES_UPGRADES_V1.md", r'''# Reelle fasilitetsoppgraderinger v1

## Kontrakt

Fasiliteter ligger under **Kontor → Klubbdrift → Fasiliteter**. De er ikke en ny hovedfane og de lager ingen konkurrerende «neste»-motor.

V1 har tre fasiliteter med faktisk mottaker i eksisterende motorer:

- **Treningsanlegg** — reduserer positiv fatigue/wear fra eksisterende treningsprogram og øker eksisterende `trainingHappiness`.
- **Medisinsk avdeling** — gir ekstra restitusjon i `applyWeeklyRecovery()` og reduserer eksisterende wear/injuryRisk fra trening.
- **Analyseavdeling** — øker eksisterende `tacticalClarity` fra gjennomført treningsprogram.

Keeperanlegg, akademi, stadion og speideranlegg er bevisst ikke oppgraderbare i v1 fordi de mangler en tilstrekkelig presis mottakermotor eller ville risikere å omgå History Go-gater.

## State og progresjon

Det opprettes **ingen ny localStorage-nøkkel**. State lagres i eksisterende `hgfm.teamMerits.v1`:

```json
{
  "facilities": {
    "version": 1,
    "levels": { "training": 1, "medical": 1, "analysis": 1 },
    "lastUpgradeWeek": null,
    "lastUpgradeFacilityId": null
  }
}
```

Gamle saves normaliseres til nivå 1. Manageren kan gjøre **ett anleggsvalg per klubbuke**. Ingen penger, lønn, fiktiv budsjettvaluta eller auto-oppgradering er innført. Nivåene er 1–3.

## Permanente porter

- `audit:manager-facilities-upgrades-v1`
- `sim:manager-facilities-upgrades-v1`
- Browser: desktop, 390 px, persistens og WCAG A/AA
''')

# ---------------------------------------------------------------------------
# Existing club audits/sims evolve from read-only facilities to explicit state.
# ---------------------------------------------------------------------------
audit_ops = read("scripts/audit-manager-club-operations-v1.mjs")
audit_ops = audit_ops.replace(
    'check("fasilitetslesningen bruker bare eksisterende klubbverdier", files.presentation.includes("clubState?.trainingCulture") && files.presentation.includes("clubState?.mediaPressure") && files.presentation.includes("players") && files.presentation.includes("hiredStaff"));',
    'check("fasiliteter bruker eksplisitt save-state", files.presentation.includes("summarizeFacilityState") && files.app.includes("facilities: normalizeFacilityState(base.facilities)"));'
)
audit_ops = audit_ops.replace(
    'check("ingen ny økonomi- eller sponsormotor dokumenteres", files.docs.includes("ingen kjøp-/oppgraderingsmotor") && files.docs.includes("ingen sponsoravtaler") && files.docs.includes("Ingen nye localStorage-nøkler"));',
    'check("ingen økonomi- eller sponsormotor introduseres", files.docs.includes("ingen sponsoravtaler") && files.docs.includes("Ingen nye localStorage-nøkler"));'
)
write("scripts/audit-manager-club-operations-v1.mjs", audit_ops)

audit_scene = read("scripts/audit-manager-club-scene-v1.mjs")
audit_scene = audit_scene.replace(
    'check("operasjonsdokumentasjonen avviser nye økonomi- og sponsormotorer", files.operationsDocs.includes("ingen kjøp-/oppgraderingsmotor") && files.operationsDocs.includes("ingen sponsoravtaler") && files.operationsDocs.includes("Ingen nye localStorage-nøkler"));',
    'check("operasjonsdokumentasjonen avviser nye økonomi- og sponsormotorer", files.operationsDocs.includes("ingen sponsoravtaler") && files.operationsDocs.includes("Ingen nye localStorage-nøkler"));'
)
write("scripts/audit-manager-club-scene-v1.mjs", audit_scene)

sim_ops = read("scripts/simulate-manager-club-operations-v1.mjs")
sim_ops = sim_ops.replace(
    '    unlockedExpertiseCount: 5,\n',
    '    unlockedExpertiseCount: 5,\n    facilitiesState: { levels: { training: 3, medical: 3, analysis: 3 } },\n'
)
sim_ops = sim_ops.replace(
    'check("fasilitetslesningen bruker antall spillere", healthy.facilities.detail.includes("20 spillere"));\ncheck("fasilitetslesningen bruker engasjert stab", healthy.facilities.detail.includes("5 i stab"));\ncheck("fasilitetslesningen bruker treningskultur", healthy.facilities.detail.includes("treningskultur 70"));',
    'check("fasilitetslesningen bruker eksplisitte nivåer", healthy.facilities.detail.includes("Trening 3/3") && healthy.facilities.detail.includes("Medisinsk 3/3") && healthy.facilities.detail.includes("Analyse 3/3"));'
)
sim_ops = sim_ops.replace(
    'check("fasiliteter forblir lesesignal også under press", ["Sterk", "Solid", "Grunnleggende", "Ikke lest"].includes(pressured.facilities.label));',
    'check("fasiliteter påvirkes ikke kunstig av medietrykk", pressured.facilities.label === "Sterk");'
)
sim_ops = sim_ops.replace(
    '  activeClassificationCount: 0\n});',
    '  activeClassificationCount: 0,\n  facilitiesState: { levels: { training: 1, medical: 1, analysis: 1 } }\n});'
)
sim_ops = sim_ops.replace(
    'check("manglende stall prioriteres fortsatt foran read-only klubbflater", bare.priority.target === "historygo");',
    'check("manglende stall prioriteres fortsatt foran dype klubbflater", bare.priority.target === "historygo");'
)
write("scripts/simulate-manager-club-operations-v1.mjs", sim_ops)

sim_scene = read("scripts/simulate-manager-club-scene-v1.mjs")
sim_scene = sim_scene.replace(
    'check("fasilitetslesningen bruker eksisterende stab og treningskultur", staffGap.facilities.detail.includes("2 i stab") && staffGap.facilities.detail.includes("treningskultur 54"));',
    'check("fasiliteter starter på eksplisitt grunnnivå", staffGap.facilities.label === "Grunnleggende" && staffGap.facilities.detail.includes("Trening 1/3"));'
)
sim_scene = sim_scene.replace(
    '  activeClassificationCount: 1\n});',
    '  activeClassificationCount: 1,\n  facilitiesState: { levels: { training: 3, medical: 3, analysis: 3 } }\n});'
)
write("scripts/simulate-manager-club-scene-v1.mjs", sim_scene)

# ---------------------------------------------------------------------------
# New permanent static audit.
# ---------------------------------------------------------------------------
write("scripts/audit-manager-facilities-upgrades-v1.mjs", r'''import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const files = {
  html: read("../index.html"),
  app: read("../src/app.js"),
  engine: read("../src/football-facilities.js"),
  condition: read("../src/football-player-condition.js"),
  offPitch: read("../src/football-off-pitch-parameters.js"),
  presentation: read("../src/ui/manager-club-presentation.js"),
  ui: read("../src/ui/manager-facilities-workspace-v1.js"),
  css: read("../src/ui/manager-facilities-workspace-v1.css"),
  docs: read("../docs/FACILITIES_UPGRADES_V1.md"),
  package: read("../package.json"),
  ci: read("../.github/workflows/ci.yml"),
  browser: read("../tests/browser/manager-facilities-upgrades-v1.spec.js")
};

let checks = 0;
let failures = 0;
function check(label, condition) {
  checks += 1;
  if (condition) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FEIL ${label}`); }
}

console.log("\nManager Facilities Upgrades v1 audit");
check("fasiliteter ligger fortsatt under Klubbdrift", files.html.includes('data-tab-section="facilities"') && files.html.includes('data-tab-parent="board"'));
check("tre reelle fasiliteter brukes", ["training", "medical", "analysis"].every((id) => files.engine.includes(`id: "${id}"`)));
check("stadion og akademi er ikke falske oppgraderingskort", !files.html.includes('id="facilityStadiumLevel"') && !files.html.includes('id="facilityAcademyLevel"'));
check("nivåene er 1–3", files.engine.includes("FACILITY_MAX_LEVEL = 3") && files.engine.includes("Math.max(1"));
check("ett anleggsvalg per klubbuke", files.engine.includes("lastUpgradeWeek === normalizedWeek") && files.engine.includes("Ukens anleggsvalg er allerede brukt"));
check("state lagres i teamMerits", files.app.includes("facilities: normalizeFacilityState(base.facilities)") && files.app.includes("state.teamMerits = result.merits"));
check("ingen ny localStorage-nøkkel", !files.app.includes("FACILITIES_KEY") && files.docs.includes("ingen ny localStorage-nøkkel"));
check("treningseffekt bruker eksisterende off-pitch-motor", files.app.includes("facilityEffects: calculateFacilityEffects") && files.offPitch.includes("trainingLoadReduction") && files.offPitch.includes("analysisClarityBonus"));
check("medisinsk effekt bruker eksisterende recovery", files.app.includes("weeklyRecoveryBonus") && files.condition.includes("recoveryBonus"));
check("klubbstatus bruker samme fasilitetsstate", files.presentation.includes("summarizeFacilityState") && files.app.includes("facilitiesState: state.teamMerits?.facilities"));
check("oppgradering er eksplisitt knapp", files.ui.includes("facility-upgrade-action") && files.ui.includes("onUpgrade(facility.id)"));
check("ingen penger eller auto-oppgradering", !files.engine.includes("salary") && !files.engine.includes("budget") && files.docs.includes("Ingen penger"));
check("workspace er mobiltilpasset", files.css.includes("@media(max-width:820px)") && files.css.includes("grid-template-columns:1fr"));
check("browser dekker persistens", files.browser.includes("hgfm.teamMerits.v1") && files.browser.includes("page.reload()"));
check("browser dekker mobil og WCAG", files.browser.includes("width: 390") && files.browser.includes("AxeBuilder") && files.browser.includes("wcag2aa"));
check("audit og simulering er registrert", files.package.includes('"audit:manager-facilities-upgrades-v1"') && files.package.includes('"sim:manager-facilities-upgrades-v1"'));
check("CI kjører begge porter", files.ci.includes("audit:manager-facilities-upgrades-v1") && files.ci.includes("sim:manager-facilities-upgrades-v1"));

console.log(`\nManager Facilities Upgrades v1 audit: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
''')

# ---------------------------------------------------------------------------
# New behavior simulation.
# ---------------------------------------------------------------------------
write("scripts/simulate-manager-facilities-upgrades-v1.mjs", r'''import {
  calculateFacilityEffects,
  canUpgradeFacility,
  normalizeFacilityState,
  summarizeFacilityState,
  upgradeFacilityInMerits
} from "../src/football-facilities.js";
import { applyWeeklyRecovery } from "../src/football-player-condition.js";
import { applyTrainingProgramOffPitchEffects, createDefaultOffPitchState } from "../src/football-off-pitch-parameters.js";

let checks = 0;
let failures = 0;
function check(label, condition, detail = "") {
  checks += 1;
  if (condition) console.log(`  ok   ${label}${detail ? ` (${detail})` : ""}`);
  else { failures += 1; console.error(`  FEIL ${label}${detail ? ` (${detail})` : ""}`); }
}

console.log("\nFacilities Upgrades v1 simulation");
const fresh = normalizeFacilityState(null);
check("gamle saves starter 1/1/1", fresh.levels.training === 1 && fresh.levels.medical === 1 && fresh.levels.analysis === 1);
check("grunnstate er grunnleggende", summarizeFacilityState(fresh).label === "Grunnleggende");
check("første valg i uke 4 er lov", canUpgradeFacility(fresh, "training", { week: 4 }).allowed === true);

const first = upgradeFacilityInMerits({ teamName: "Test" }, "training", { week: 4 });
check("oppgradering endrer nivå", first.changed && first.facilities.levels.training === 2);
check("andre fasilitet samme uke blokkeres", upgradeFacilityInMerits(first.merits, "medical", { week: 4 }).changed === false);
check("andre uke åpner nytt valg", canUpgradeFacility(first.facilities, "medical", { week: 5 }).allowed === true);
check("uvedkommende save-felt bevares", first.merits.teamName === "Test");

let merits = first.merits;
merits = upgradeFacilityInMerits(merits, "training", { week: 5 }).merits;
check("trening kan nå nivå 3", normalizeFacilityState(merits.facilities).levels.training === 3);
check("maksnivå kan ikke overskrides", upgradeFacilityInMerits(merits, "training", { week: 6 }).changed === false);

const strong = normalizeFacilityState({ levels: { training: 3, medical: 3, analysis: 3 } });
const effects = calculateFacilityEffects(strong);
check("sterkt treningsanlegg gir relief 2", effects.trainingLoadReduction === 2);
check("sterk medisinsk gir recovery +6", effects.weeklyRecoveryBonus === 6);
check("sterk analyse gir klarhet +2", effects.analysisClarityBonus === 2);
check("3/3/3 oppsummeres som Sterk", summarizeFacilityState(strong).label === "Sterk");

const condition = [{ playerId: "p1", name: "Spiller", load: 60, form: 0, matchesPlayed: 2, minutesPlayed: 180, consecutiveFullMatches: 2, injury: null }];
const normalRecovery = applyWeeklyRecovery(condition, { trainingIntensity: 1 });
const medicalRecovery = applyWeeklyRecovery(condition, { trainingIntensity: 1, recoveryBonus: 6 });
check("medisinsk avdeling restituerer mer", medicalRecovery[0].load < normalRecovery[0].load, `${medicalRecovery[0].load} < ${normalRecovery[0].load}`);

const shape = { id: "shape", title: "Formasjonsarbeid", category: "shape", sessions: [{ fatigueLoad: 3 }] };
const baselineOffPitch = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), shape);
const improvedOffPitch = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), shape, { facilityEffects: effects });
check("analyse gir mer taktisk klarhet", improvedOffPitch.squad.tacticalClarity > baselineOffPitch.squad.tacticalClarity);
check("treningsanlegg reduserer fatigue fra økta", improvedOffPitch.team.fatigue < baselineOffPitch.team.fatigue);
check("treningsanlegg øker treningstrivsel", improvedOffPitch.squad.trainingHappiness > baselineOffPitch.squad.trainingHappiness);

const pressing = { id: "press", title: "Pressuke", category: "pressing", sessions: [{ fatigueLoad: 5 }] };
const normalPress = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), pressing);
const protectedPress = applyTrainingProgramOffPitchEffects(createDefaultOffPitchState(), pressing, { facilityEffects: effects });
check("medisinsk avdeling senker injuryRisk-økning", protectedPress.team.injuryRisk < normalPress.team.injuryRisk);

console.log(`\nFacilities Upgrades v1: ${checks - failures}/${checks} bestått.`);
if (failures > 0) process.exitCode = 1;
''')

# ---------------------------------------------------------------------------
# Browser coverage.
# ---------------------------------------------------------------------------
write("tests/browser/manager-facilities-upgrades-v1.spec.js", r'''import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openFacilities(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]').click();
  await expect(page.locator("#clubCommandPanel")).toBeVisible();
  await page.locator('.club-command-status[data-club-target="facilities"]').click();
  await expect(page.locator('[data-tab-section="facilities"]')).toBeVisible();
  await expect(page.locator("#managerFacilitiesWorkspace")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "facilities_v1",
      clubName: "Bislett FK",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Bygg klubben."
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("fasiliteter har tre reelle nivåer og ett managerstyrt valg per uke", async ({ page }) => {
  await openFacilities(page);
  await expect(page.locator(".manager-facility-card")).toHaveCount(3);
  await expect(page.locator('.manager-facility-card[data-facility-id="training"] .manager-facility-level')).toHaveText("Nivå 1 av 3");
  await expect(page.locator(".facility-upgrade-action:enabled")).toHaveCount(3);

  await page.locator('.facility-upgrade-action[data-facility-id="training"]').click();
  await expect(page.locator('.manager-facility-card[data-facility-id="training"] .manager-facility-level')).toHaveText("Nivå 2 av 3");
  await expect(page.locator(".facility-upgrade-action:enabled")).toHaveCount(0);
  await expect(page.locator(".facility-week-choice")).toContainText("Treningsanlegg");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}"));
  expect(saved.facilities.levels.training).toBe(2);
  expect(saved.facilities.lastUpgradeWeek).toBeGreaterThanOrEqual(1);

  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await openFacilities(page);
  await expect(page.locator('.manager-facility-card[data-facility-id="training"] .manager-facility-level')).toHaveText("Nivå 2 av 3");
});

test("fasilitetsflaten fungerer på 390 px uten overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFacilities(page);
  await expect(page.locator(".manager-facility-grid")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("fasilitetsflaten har ingen alvorlige WCAG-brudd", async ({ page }) => {
  await openFacilities(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="facilities"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
''')

# ---------------------------------------------------------------------------
# package + CI registration.
# ---------------------------------------------------------------------------
package_path = ROOT / "package.json"
package = json.loads(package_path.read_text(encoding="utf-8"))
scripts = package["scripts"]
scripts["audit:manager-facilities-upgrades-v1"] = "node scripts/audit-manager-facilities-upgrades-v1.mjs"
scripts["sim:manager-facilities-upgrades-v1"] = "node scripts/simulate-manager-facilities-upgrades-v1.mjs"
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

ci = read(".github/workflows/ci.yml")
ci = replace_once(
    ci,
    "          npm run audit:manager-staff-roster-v1\n",
    "          npm run audit:manager-staff-roster-v1\n          npm run audit:manager-facilities-upgrades-v1\n",
    "CI facility audit"
)
ci = replace_once(
    ci,
    "          npm run sim:manager-staff-roster-v1\n",
    "          npm run sim:manager-staff-roster-v1\n          npm run sim:manager-facilities-upgrades-v1\n",
    "CI facility sim"
)
write(".github/workflows/ci.yml", ci)

print("facilities v1 materialized")
