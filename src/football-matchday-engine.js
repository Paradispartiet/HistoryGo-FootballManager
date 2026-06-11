// HG Football Manager — Matchday Engine (v1)
//
// Enkel Kampdag v1 som tester det valgte HISTORISKE systemet, ikke bare en
// generisk lagscore. Motoren tar lagets teamFit (med historisk formasjonsfit og
// badgeeffekter allerede innbakt), den valgte hgFootball-formasjonen og en enkel
// standardmotstander, og produserer ett kampresultat med xG, utfall og analyse.
//
// Designprinsipper:
//   - Ren modul: ingen DOM, ingen fetch, ingen localStorage, ingen app-state.
//     Alt utledes fra inn-argumentene. app.js gjør all lasting/lagring/visning.
//   - Bygger PÅ eksisterende motorer i stedet for å duplisere dem: teamFit er
//     allerede justert av fitmotor → historisk formasjonsfit → badgeeffekter.
//     Kampmotoren legger kun et tynt kamplag oppå (xG, terningkast, utfall).
//   - Historisk formasjonsfit og matchEngineEffects brukes som SMÅ tendenser, ikke
//     som hovedscore. Lagets teamScore er fortsatt grunnlaget.
//   - Endrer ikke unlocks, spillerfilter, badgeeffektmotor, fitmotor eller
//     KFUM/Bislett-regler. Ingen serie, tabell, sesong, livekamp, skader osv.

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function clampRange(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function num(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// 0-100-metrikk normalisert til -1..1 rundt midten (50). Brukes til å la sterke
// metrikker gi en liten xG-bonus og svake metrikker en liten reduksjon.
function metricBalance(score) {
  return (clamp(score) - 50) / 50;
}

// Gjennomsnitt av en formasjons matchEngineEffects (0-10). Returnerer null hvis
// formasjonen ikke har effekter, slik at de ikke teller med som tendens.
function averageEffects(effects) {
  if (!effects || typeof effects !== "object") {
    return null;
  }

  const values = Object.values(effects)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Har laget noen aktive badgeeffekter? badgeEffects er et flatt objekt
// metric -> bonus der positive verdier betyr en aktiv effekt.
function hasBadgeAdvantage(badgeEffects) {
  return Boolean(
    badgeEffects &&
      typeof badgeEffects === "object" &&
      Object.values(badgeEffects).some((amount) => Number(amount) > 0)
  );
}

// Standardmotstander for Kampdag v1. En balansert «gjennomsnittsmotstander» slik
// at kampbildet i hovedsak avhenger av lagets eget system og oppsett.
export function createDefaultOpponent() {
  return {
    id: "balanced_opponent_v1",
    name: "Balansert motstander",
    strength: 72,
    style: "balanced",
    pressResistance: 70,
    defensiveStructure: 70,
    transitionThreat: 70,
    chanceConversion: 70
  };
}

// Beregner lagets samlede kampstyrke (0-100) for det valgte systemet.
//
// Grunnlaget er teamFit.teamScore (som allerede inkluderer historisk
// formasjonsfit og badgeeffekter). Oppå det:
//   - ufullstendig lag gir tydelig penalty,
//   - historisk formasjonsfit gir en liten bonus/penalty,
//   - matchEngineEffects gir kun en liten tendens,
//   - aktive lagklasser gir en liten bonus.
export function calculateMatchStrength({ teamFit, formation, activeClassifications } = {}) {
  const fit = teamFit || {};
  const metrics = fit.metrics || {};
  const completeCount = num(fit.completeCount);
  const totalSlots = num(fit.totalSlots) || 11;
  const baseTeamScore = clamp(num(fit.teamScore));

  const historical = fit.historicalFormationFit || {};
  const effects = formation?.matchEngineEffects;

  // Aggregert metrikkbilde som kampsimuleringen leser. Henter de badge-/historisk
  // justerte metrikkene fra teamFit, ikke rå rolleverdier.
  const tacticalProfile = {
    teamScore: baseTeamScore,
    completeCount,
    totalSlots,
    balanceScore: clamp(num(metrics.balanceScore)),
    widthScore: clamp(num(metrics.widthScore)),
    depthScore: clamp(num(metrics.depthScore)),
    buildUpScore: clamp(num(metrics.buildUpScore)),
    pressScore: clamp(num(metrics.pressScore)),
    restDefenseScore: clamp(num(metrics.restDefenseScore)),
    relationshipScore: clamp(num(fit.relationships?.relationshipScore))
  };

  // Historisk identitet, kun for visning/analyse i kampbildet.
  const formationProfile = {
    id: formation?.id || null,
    name: formation?.name || "Ukjent formasjon",
    baseShape: formation?.baseShape || "",
    eraName: formation?.eraName || "",
    tacticalSchool: formation?.tacticalSchool || "",
    tacticalDifficulty: formation?.tacticalDifficulty || "",
    principles: asArray(formation?.principles),
    strengths: asArray(formation?.strengths),
    weaknesses: asArray(formation?.weaknesses)
  };

  const missing = Math.max(0, totalSlots - completeCount);

  // Uten en eneste komplett spiller finnes det ikke noe lag å spille med.
  if (completeCount === 0) {
    return {
      finalStrength: 0,
      baseTeamScore,
      tacticalProfile,
      formationProfile,
      modifiers: {
        incompletePenalty: 0,
        historicalModifier: 0,
        matchEngineTendency: 0,
        classificationBonus: 0,
        missing
      }
    };
  }

  // Ufullstendig lag gir tydelig penalty, skalert med antall tomme plasser.
  const incompletePenalty = missing > 0 ? Math.min(45, 6 + missing * 5) : 0;

  // Liten historisk modifier: bonus/penalty fra historisk formasjonsfit pluss et
  // forsiktig dytt fra historicalScore rundt nøytrale 60.
  const historicalBonus = num(historical.historicalBonus);
  const historicalPenalty = num(historical.historicalPenalty);
  const historicalScore = num(historical.historicalScore);
  const historicalModifier = clampRange(
    historicalBonus - historicalPenalty + (historicalScore - 60) * 0.06,
    -10,
    10
  );

  // matchEngineEffects (0-10) gir kun en liten tendens, aldri hovedscore.
  const effectAverage = averageEffects(effects);
  const matchEngineTendency =
    effectAverage === null ? 0 : clampRange((effectAverage - 5) * 0.8, -4, 4);

  // Aktive lagklasser gir en liten identitetsbonus (maks +4).
  const classificationBonus = Math.min(4, asArray(activeClassifications).length);

  let finalStrength = baseTeamScore;
  finalStrength -= incompletePenalty;
  finalStrength += historicalModifier;
  finalStrength += matchEngineTendency;
  finalStrength += classificationBonus;
  finalStrength = clamp(Math.round(finalStrength));

  return {
    finalStrength,
    baseTeamScore,
    tacticalProfile,
    formationProfile,
    modifiers: {
      incompletePenalty: Math.round(incompletePenalty),
      historicalModifier: Math.round(historicalModifier * 10) / 10,
      matchEngineTendency: Math.round(matchEngineTendency * 10) / 10,
      classificationBonus,
      missing
    }
  };
}

// Enkel terningkast-modell for mål ut fra forventede mål (xG).
//   - bunnen er heltallsdelen av xG,
//   - desimaldelen er sjansen for +1 mål,
//   - litt ekstra sjanse for et bonusmål når xG er høy (> 1.6),
//   - klampes til 0-6 for å holde resultatene realistiske.
function rollGoals(xg) {
  const safeXg = clampRange(num(xg), 0, 6);
  let goals = Math.floor(safeXg);
  const fractional = safeXg - goals;

  if (Math.random() < fractional) {
    goals += 1;
  }

  if (safeXg > 1.6 && Math.random() < 0.18) {
    goals += 1;
  }

  return Math.max(0, Math.min(6, goals));
}

// Bygger inntil 6 analysepunkter for kampen, basert på lagets system og oppsett.
function buildMatchAnalysis({ teamFit, formation, tacticalProfile, isIncomplete, missing }) {
  const analysis = [];
  const tp = tacticalProfile;
  const historical = teamFit?.historicalFormationFit || {};
  const badgeEffects = teamFit?.badgeEffects;
  const formationName = formation?.name || "systemet";

  if (isIncomplete) {
    analysis.push(
      `Laget er ufullstendig: ${missing} plass${missing === 1 ? "" : "er"} står tom${
        missing === 1 ? "" : "me"
      } og svekker kampbildet.`
    );
  }

  const historicalScore = num(historical.historicalScore);
  if (historicalScore >= 70) {
    analysis.push(`Det historiske systemet (${formationName}) passer laget godt.`);
  } else if (historicalScore > 0 && historicalScore < 50) {
    analysis.push(`Det historiske systemet (${formationName}) passer laget dårlig akkurat nå.`);
  }

  if (tp.pressScore >= 70) {
    analysis.push("Godt press setter motstanderen under hardt trykk.");
  }

  if (tp.restDefenseScore < 50) {
    analysis.push("Svakt restforsvar gjør laget sårbart for kontringer.");
  }

  if (tp.buildUpScore >= 70) {
    analysis.push("God oppbygging gir kontroll og rene angrep.");
  }

  if (tp.depthScore >= 70) {
    analysis.push("God dybde truer bakrommet bak motstanderforsvaret.");
  }

  if (tp.widthScore >= 70) {
    analysis.push("God bredde strekker motstanderen og skaper rom ute.");
  }

  if (hasBadgeAdvantage(badgeEffects)) {
    analysis.push("Badgeeffekter ga laget små fordeler i de taktiske metrikkene.");
  }

  const weakness = asArray(formation?.weaknesses)[0];
  if (weakness) {
    analysis.push(`Systemsvakhet å være obs på: ${weakness}.`);
  }

  return analysis.slice(0, 6);
}

// De viktigste faktorene bak resultatet, kort oppsummert (maks 4).
function buildKeyFactors({ tacticalProfile, strengthGap, isIncomplete }) {
  const tp = tacticalProfile;
  const factors = [];

  if (isIncomplete) {
    factors.push("Ufullstendig lag");
  }

  if (strengthGap >= 8) {
    factors.push("Lagstyrke over motstanderen");
  } else if (strengthGap <= -8) {
    factors.push("Lagstyrke under motstanderen");
  } else {
    factors.push("Jevn styrke mot motstanderen");
  }

  if (tp.pressScore >= 70) {
    factors.push("Sterkt press");
  }

  if (tp.restDefenseScore >= 70) {
    factors.push("Solid restforsvar");
  } else if (tp.restDefenseScore < 50) {
    factors.push("Skjørt restforsvar");
  }

  if (tp.buildUpScore >= 70) {
    factors.push("Trygg oppbygging");
  }

  return factors.slice(0, 4);
}

// Simulerer én kampdag for det valgte systemet og returnerer ett resultat.
export function simulateMatchday({ teamFit, formation, activeClassifications, opponent } = {}) {
  const matchOpponent = opponent || createDefaultOpponent();
  const strength = calculateMatchStrength({ teamFit, formation, activeClassifications });
  const tp = strength.tacticalProfile;
  const formationProfile = strength.formationProfile;

  const teamStrength = strength.finalStrength;
  const completeCount = tp.completeCount;
  const isIncomplete = completeCount < tp.totalSlots;
  const missing = strength.modifiers.missing;

  const historical = teamFit?.historicalFormationFit || {};
  const historicalScore = num(historical.historicalScore);

  // Styrkeforskjell mot motstanderen styrer både angreps- og forsvars-xG.
  const strengthGap = teamStrength - num(matchOpponent.strength);

  // Forventede mål FOR laget. Starter nøytralt og påvirkes av styrkeforskjell,
  // offensive metrikker og en liten bonus for god historisk formasjonsfit.
  let expectedGoalsFor = 1.15;
  expectedGoalsFor += strengthGap * 0.012;
  expectedGoalsFor += metricBalance(tp.depthScore) * 0.5;
  expectedGoalsFor += metricBalance(tp.widthScore) * 0.3;
  expectedGoalsFor += metricBalance(tp.buildUpScore) * 0.4;
  expectedGoalsFor += metricBalance(tp.pressScore) * 0.25;
  if (historicalScore > 65) {
    expectedGoalsFor += (historicalScore - 65) * 0.006;
  }
  // Motstanderens defensive struktur demper litt.
  expectedGoalsFor -= (num(matchOpponent.defensiveStructure) - 70) * 0.006;
  if (isIncomplete) {
    expectedGoalsFor -= 0.3;
  }
  expectedGoalsFor = clampRange(round2(expectedGoalsFor), 0.2, 4.0);

  // Forventede mål MOT laget. Starter nøytralt, reduseres av restforsvar, balanse
  // og gode rolle-relasjoner, og øker ved svakt restforsvar eller ufullstendig lag.
  let expectedGoalsAgainst = 1.15;
  expectedGoalsAgainst -= strengthGap * 0.01;
  expectedGoalsAgainst -= metricBalance(tp.restDefenseScore) * 0.45;
  expectedGoalsAgainst -= metricBalance(tp.balanceScore) * 0.3;
  expectedGoalsAgainst -= metricBalance(tp.relationshipScore) * 0.25;
  // Motstanderens overgangstrussel øker presset bakover.
  expectedGoalsAgainst += (num(matchOpponent.transitionThreat) - 70) * 0.006;
  if (tp.restDefenseScore < 50) {
    expectedGoalsAgainst += (50 - tp.restDefenseScore) * 0.012;
  }
  if (isIncomplete) {
    expectedGoalsAgainst += 0.4 + missing * 0.05;
  }
  expectedGoalsAgainst = clampRange(round2(expectedGoalsAgainst), 0.1, 4.0);

  const goalsFor = rollGoals(expectedGoalsFor);
  const goalsAgainst = rollGoals(expectedGoalsAgainst);

  let outcome = "draw";
  if (goalsFor > goalsAgainst) {
    outcome = "win";
  } else if (goalsFor < goalsAgainst) {
    outcome = "loss";
  }

  const analysis = buildMatchAnalysis({
    teamFit,
    formation,
    tacticalProfile: tp,
    isIncomplete,
    missing
  });

  const keyFactors = buildKeyFactors({ tacticalProfile: tp, strengthGap, isIncomplete });

  return {
    id: `matchday-${Date.now()}`,
    playedAt: new Date().toISOString(),
    opponent: { ...matchOpponent },
    formationSnapshot: formationProfile,
    teamStrength,
    score: { for: goalsFor, against: goalsAgainst },
    expectedGoals: { for: expectedGoalsFor, against: expectedGoalsAgainst },
    outcome,
    keyFactors,
    analysis
  };
}

// Norsk utfallstekst for visning.
const OUTCOME_LABELS = {
  win: "Seier",
  draw: "Uavgjort",
  loss: "Tap"
};

// Bygger en lett rapportstruktur fra et kampresultat for visning i UI. Ren
// transformasjon – ingen ny logikk eller tilfeldighet.
export function createMatchReport(matchResult) {
  if (!matchResult || typeof matchResult !== "object") {
    return null;
  }

  const score = matchResult.score || { for: 0, against: 0 };
  const expectedGoals = matchResult.expectedGoals || { for: 0, against: 0 };
  const opponent = matchResult.opponent || {};
  const formationSnapshot = matchResult.formationSnapshot || {};

  return {
    id: matchResult.id || null,
    playedAt: matchResult.playedAt || null,
    opponentName: opponent.name || "Ukjent motstander",
    formationName: formationSnapshot.name || "Ukjent formasjon",
    baseShape: formationSnapshot.baseShape || "",
    eraName: formationSnapshot.eraName || "",
    tacticalSchool: formationSnapshot.tacticalSchool || "",
    scoreLine: `${num(score.for)}–${num(score.against)}`,
    outcome: matchResult.outcome || "draw",
    outcomeLabel: OUTCOME_LABELS[matchResult.outcome] || "Uavgjort",
    teamStrength: num(matchResult.teamStrength),
    expectedGoalsLine: `${round2(num(expectedGoals.for))} – ${round2(num(expectedGoals.against))}`,
    keyFactors: asArray(matchResult.keyFactors),
    analysis: asArray(matchResult.analysis)
  };
}
