// Pass 7 compatibility facade.
// Den gamle fasilitets-workspacen rendrer ikke lenger nivåer eller knapper.
// Eksportnavnene beholdes midlertidig fordi legacy app.js fortsatt importerer
// dem; selve live IA eies av Kontor → Klubben.

export function createManagerFacilitiesModel({ week = 1 } = {}) {
  return {
    week: Math.max(1, Math.trunc(Number(week)) || 1),
    state: null,
    summary: {
      label: "Arbeidsrom",
      tone: "neutral",
      detail: "Nivåbaserte fasiliteter er fjernet."
    },
    effects: {
      trainingLoadReduction: 0,
      trainingHappinessBonus: 0,
      weeklyRecoveryBonus: 0,
      medicalTrainingProtection: 0,
      analysisClarityBonus: 0
    },
    facilities: []
  };
}

export function renderManagerFacilitiesWorkspace(container) {
  if (!container) return;
  container.replaceChildren();
  container.hidden = true;
  container.dataset.legacyRemoved = "true";
}
