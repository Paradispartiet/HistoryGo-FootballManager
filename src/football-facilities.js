// Pass 7 compatibility facade for den tidligere nivåbaserte fasilitetsmotoren.
//
// app.js importerer fortsatt disse navnene mens den store app-fila fases ned.
// De skal derfor være trygge no-op-er, ikke et skjult spillssystem. Reelle
// treningsanlegg og medisinske arbeidsprosesser eies nå av Klubben/Trening.

export const FACILITIES_VERSION = 0;
export const FACILITY_MAX_LEVEL = 0;
export const FACILITY_DEFINITIONS = Object.freeze([]);

const NEUTRAL_FACILITY_EFFECTS = Object.freeze({
  trainingLoadReduction: 0,
  trainingHappinessBonus: 0,
  weeklyRecoveryBonus: 0,
  medicalTrainingProtection: 0,
  analysisClarityBonus: 0
});

// `undefined` er bevisst: normalizeTeamMerits i legacy app.js beholder fortsatt
// en `facilities`-property i minnet, men JSON.stringify utelater undefined. Nye
// saves kan dermed ikke skrive tilbake den gamle nivåstaten etter Pass 7.
export function normalizeFacilityState() {
  return undefined;
}

export function calculateFacilityEffects() {
  return { ...NEUTRAL_FACILITY_EFFECTS };
}

export function canUpgradeFacility() {
  return {
    allowed: false,
    reason: "Nivåbaserte fasilitetsoppgraderinger er fjernet. Bruk klubbens faktiske arbeidsrom."
  };
}

export function upgradeFacilityInMerits(merits) {
  const source = merits && typeof merits === "object" && !Array.isArray(merits) ? merits : {};
  const next = { ...source };
  const changed = Object.prototype.hasOwnProperty.call(next, "facilities");
  delete next.facilities;
  return {
    changed,
    reason: "Nivåbaserte fasilitetsoppgraderinger er fjernet.",
    merits: next,
    facilities: undefined
  };
}

export function summarizeFacilityState() {
  return {
    label: "Arbeidsrom",
    tone: "neutral",
    total: 0,
    maxTotal: 0,
    detail: "Fasiliteter beskrives gjennom dokumenterte klubbforhold og faktisk fotballarbeid, ikke nivå 1–3."
  };
}
