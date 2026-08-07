// Reelle fasilitetsoppgraderinger v1.
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
