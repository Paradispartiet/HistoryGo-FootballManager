// src/football-match-consequences.js
//
// Club Week Consequence Loop v1: ren beregningsmodell som leser et fullført
// Kampdag v0.2-resultat (finalizeMatchdaySession) og regner ut små, lesbare
// konsekvenser for eksisterende Club Week-verdier og formasjonstilvenning.
//
// Ingen DOM, ingen localStorage, ingen ny motor: app.js eier all state og
// bestemmer hvor effektene skrives. Alle tall er små — én kamp skal aldri
// velte klubben. Gamle v1-kamper (uten version 2) gir aldri konsekvens.

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampRange(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Maks utslag per klubbverdi fra én enkelt kamp.
const MAX_METRIC_DELTA = 4;

// Formasjonstilvenning per spilt kamp: alltid minst 1, aldri mer enn 6.
const MIN_FAMILIARITY_GAIN = 1;
const MAX_FAMILIARITY_GAIN = 6;

// Beregn kampkonsekvenser fra et fullført v0.2-resultat. coachSnapshot og
// historicalScore kommer fra kampsesjonen (session.coachSnapshot /
// session.teamFitSnapshot) hvis tilgjengelig — begge er valgfrie.
//
// Returnerer null hvis resultatet mangler, ikke er et v0.2-resultat eller
// allerede har fått konsekvensen sin (consequencesApplied). Ellers:
//   {
//     matchId,
//     formationId,
//     clubEffects: { boardTrust?, playerMorale?, tacticalClarity?,
//                    trainingCulture?, mediaPressure? },   // kun ≠ 0, clampet ±4
//     familiarityGain                                      // 1-6
//   }
export function computeMatchdayConsequences({ lastMatch, coachSnapshot = null, historicalScore = 0 } = {}) {
  if (!lastMatch || typeof lastMatch !== "object" || Array.isArray(lastMatch)) {
    return null;
  }
  // Kun Kampdag v0.2-resultater har beslutningsdata nok til en konsekvens.
  if (lastMatch.version !== 2) {
    return null;
  }
  // Engangsvern: et resultat som allerede er brukt gir aldri ny konsekvens.
  if (lastMatch.consequencesApplied) {
    return null;
  }

  const outcome = ["win", "draw", "loss"].includes(lastMatch.outcome) ? lastMatch.outcome : "draw";
  const totals = lastMatch.decisionTotals && typeof lastMatch.decisionTotals === "object"
    ? lastMatch.decisionTotals
    : {};
  const decisions = Array.isArray(lastMatch.decisions) ? lastMatch.decisions : [];
  const positiveCount = decisions.filter((decision) => decision?.tone === "positive").length;
  const negativeCount = decisions.filter((decision) => decision?.tone === "negative").length;

  const teamStrength = num(lastMatch.teamStrength);
  const opponentStrength = num(lastMatch.opponent?.strength);
  const xgDiff = num(lastMatch.expectedGoals?.for) - num(lastMatch.expectedGoals?.against);
  const clarityDelta = num(totals.tacticalClarityDelta);
  const riskDelta = num(totals.riskDelta);
  const historical = num(historicalScore);
  const coachUnderstanding = num(coachSnapshot?.coachUnderstanding);

  const effects = {
    boardTrust: 0,
    playerMorale: 0,
    tacticalClarity: 0,
    trainingCulture: 0,
    mediaPressure: 0
  };

  // Resultatet: seier løfter moral og styretillit og letter medietrykket,
  // tap trekker ned og øker trykket. Uavgjort gir et lite moralpluss.
  if (outcome === "win") {
    effects.playerMorale += 3;
    effects.boardTrust += 2;
    effects.mediaPressure -= 1;
  } else if (outcome === "draw") {
    effects.playerMorale += 1;
  } else {
    effects.playerMorale -= 2;
    effects.boardTrust -= 2;
    effects.mediaPressure += 2;
  }

  // Styrkeforholdet: overraskelser teller litt ekstra begge veier.
  if (outcome === "win" && opponentStrength >= teamStrength + 8) {
    effects.boardTrust += 1;
  }
  if (outcome === "loss" && teamStrength >= opponentStrength + 8) {
    effects.boardTrust -= 1;
    effects.mediaPressure += 1;
  }

  // Beslutningsrekken: god taktisk klarhet i grepene gir klubben taktisk
  // klarhet; flere feilslåtte grep koster klarhet og gir medietrykk.
  effects.tacticalClarity += clampRange(Math.round(clarityDelta / 2), -2, 2);
  if (positiveCount >= 2) {
    effects.tacticalClarity += 1;
  }
  if (negativeCount >= 2) {
    effects.tacticalClarity -= 1;
    effects.mediaPressure += 1;
  }

  // Høy risiko som feiler legger press på manageren.
  if (riskDelta >= 4 && outcome === "loss") {
    effects.mediaPressure += 1;
  }

  // God kampplan med riktig system: høy historisk fit pluss seier eller
  // xG-overtak styrker treningskulturen litt.
  if (historical >= 70 && (outcome === "win" || xgDiff >= 0.5)) {
    effects.trainingCulture += 1;
  }

  // Klamp og behold kun reelle utslag.
  const clubEffects = {};
  Object.entries(effects).forEach(([metric, delta]) => {
    const clamped = clampRange(Math.round(delta), -MAX_METRIC_DELTA, MAX_METRIC_DELTA);
    if (clamped !== 0) {
      clubEffects[metric] = clamped;
    }
  });

  // Formasjonstilvenning: en spilt kamp gir alltid litt, en god kamp med god
  // beslutningsrekke og godt trenerteam gir mer, en svak kamp gir mindre.
  let familiarityGain = 2;
  if (outcome === "win") {
    familiarityGain += 1;
  }
  if (outcome === "loss") {
    familiarityGain -= 1;
  }
  if (clarityDelta >= 2) {
    familiarityGain += 1;
  }
  if (coachUnderstanding >= 62) {
    familiarityGain += 1;
  }
  if (negativeCount >= 2) {
    familiarityGain -= 1;
  }
  if (historical > 0 && historical < 45) {
    familiarityGain -= 1;
  }
  // Egen formasjonstilvenning denne uka gir ett lite ekstra steg. Dette skjer
  // fortsatt innenfor samme engangs-konsekvens og samme eksisterende merits-felt.
  const trainedFormationFamiliarity = lastMatch.trainingFocus?.focusId === "formation_familiarity";
  if (trainedFormationFamiliarity) {
    familiarityGain += lastMatch.trainingFocus?.staffSupport === "strong" ? 2 : 1;
  }
  familiarityGain = clampRange(familiarityGain, MIN_FAMILIARITY_GAIN, MAX_FAMILIARITY_GAIN);

  return {
    matchId: lastMatch.id || null,
    formationId: lastMatch.formationSnapshot?.id || null,
    clubEffects,
    familiarityGain,
    trainingFamiliarityBonus: trainedFormationFamiliarity
  };
}

// Kampdag ↔ Club Week-kobling v1: i fasen "matchday" må ukas kamp faktisk
// spilles før uka kan rulle videre, slik at kampdagen og klubbuka er én
// sammenhengende rytme. Ren lesefunksjon — app.js eier all state og bestemmer
// hva som skjer når porten er stengt.
//
// Reglene:
//   - uten Club Week-state, eller utenfor kampdagfasen, er porten alltid åpen,
//   - en pågående kampsesjon må fullføres før uka kan rulle,
//   - ellers kreves et fullført resultat merket med gjeldende uke
//     (lastMatch.playedInClubWeek === clubWeekState.week). Eldre resultater
//     uten merket teller aldri som ukas kamp.
//
// Returnerer { isBlocked, reason } der reason er en kort norsk forklaring
// (tom streng når porten er åpen).
export function evaluateClubWeekMatchdayGate({
  clubWeekState = null,
  lastMatch = null,
  hasActiveSession = false
} = {}) {
  if (!clubWeekState || typeof clubWeekState !== "object" || clubWeekState.phase !== "matchday") {
    return { isBlocked: false, reason: "" };
  }

  if (hasActiveSession) {
    return {
      isBlocked: true,
      reason: "Fullfør kampen som er i gang før uka kan rulle videre."
    };
  }

  if (
    lastMatch &&
    typeof lastMatch === "object" &&
    !Array.isArray(lastMatch) &&
    lastMatch.playedInClubWeek === clubWeekState.week
  ) {
    return { isBlocked: false, reason: "" };
  }

  return {
    isBlocked: true,
    reason: "Spill ukens kamp i kampdagpanelet før uka kan rulle videre."
  };
}
