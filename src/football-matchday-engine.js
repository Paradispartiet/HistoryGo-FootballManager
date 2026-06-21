import { evaluateTrainingDecisionSupport } from "./football-training-week.js";
import { buildMatchExplanation } from "./football-match-explanation-engine.js";
import { evaluateHistoricalOpponentMatchup } from "./football-historical-opponent-profiles.js";

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
export function calculateMatchStrength({ teamFit, formation, activeClassifications, formationMatchup } = {}) {
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
        matchupTendency: 0,
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

  // Formasjons-matchup mot motstanderens spillestil gir KUN en liten tendens
  // (aldri hovedscore): gunstig matchup løfter litt, risikabel trekker litt ned.
  // Dette belønner å lese den konkrete matchupen – ikke en universelt «beste»
  // formasjon. Skala holdes på linje med de andre tendensene (±5).
  const matchupScore = formationMatchup ? num(formationMatchup.score) : 0;
  const matchupTendency = clampRange(matchupScore * 1.5, -5, 5);

  let finalStrength = baseTeamScore;
  finalStrength -= incompletePenalty;
  finalStrength += historicalModifier;
  finalStrength += matchEngineTendency;
  finalStrength += matchupTendency;
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
      matchupTendency: Math.round(matchupTendency * 10) / 10,
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

// Felles xG-grunnlag for kampdag v1 og v0.2-sesjoner. Samme modell som før:
// styrkeforskjell + offensive metrikker styrer xG for, restforsvar/balanse/
// relasjoner demper xG mot. Returnerer urundede basisverdier slik at v0.2 kan
// legge beslutningsdeltaer oppå før klamping.
function computeBaseExpectedGoals({ tp, historicalScore, opponent, teamStrength, isIncomplete, missing }) {
  const strengthGap = teamStrength - num(opponent.strength);

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
  expectedGoalsFor -= (num(opponent.defensiveStructure) - 70) * 0.006;
  if (isIncomplete) {
    expectedGoalsFor -= 0.3;
  }

  let expectedGoalsAgainst = 1.15;
  expectedGoalsAgainst -= strengthGap * 0.01;
  expectedGoalsAgainst -= metricBalance(tp.restDefenseScore) * 0.45;
  expectedGoalsAgainst -= metricBalance(tp.balanceScore) * 0.3;
  expectedGoalsAgainst -= metricBalance(tp.relationshipScore) * 0.25;
  // Motstanderens overgangstrussel øker presset bakover.
  expectedGoalsAgainst += (num(opponent.transitionThreat) - 70) * 0.006;
  if (tp.restDefenseScore < 50) {
    expectedGoalsAgainst += (50 - tp.restDefenseScore) * 0.012;
  }
  if (isIncomplete) {
    expectedGoalsAgainst += 0.4 + missing * 0.05;
  }

  return { expectedGoalsFor, expectedGoalsAgainst, strengthGap };
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

  const baseXg = computeBaseExpectedGoals({
    tp,
    historicalScore,
    opponent: matchOpponent,
    teamStrength,
    isIncomplete,
    missing
  });
  const strengthGap = baseXg.strengthGap;
  const expectedGoalsFor = clampRange(round2(baseXg.expectedGoalsFor), 0.2, 4.0);
  const expectedGoalsAgainst = clampRange(round2(baseXg.expectedGoalsAgainst), 0.1, 4.0);

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
    analysis: asArray(matchResult.analysis),
    // Kampdag v0.2-felter (tomme/null for v1-resultater — rent additivt).
    opponentStyle: opponent.style || "",
    // Historical Opponent Archetypes v1: historisk arketyp-kontekst (null for
    // generiske motstandere).
    opponentArchetype: opponent.archetypeName || "",
    opponentEra: opponent.era || "",
    opponentTacticalSchool: opponent.tacticalSchool || "",
    historicalMatchup: matchResult.historicalMatchup || null,
    tacticName: matchResult.tacticSnapshot?.name || "",
    decisions: asArray(matchResult.decisions),
    bestDecision: matchResult.bestDecision || null,
    worstDecision: matchResult.worstDecision || null,
    formationVerdict: matchResult.formationVerdict || "",
    trainingFocus: matchResult.trainingFocus || null,
    decisiveUnit: matchResult.decisiveUnit || "",
    nextWeekAdvice: matchResult.nextWeekAdvice || "",
    historyGoHint: matchResult.historyGoHint || "",
    // Match Explanation v1.5: strukturert kampforklaring (null for v1-resultater).
    explanation: matchResult.explanation || null
  };
}

// ============================================================================
// Kampdag v0.2 — managerbeslutninger og formasjonsspesifikke kamp-hendelser
//
// Bygger PÅ Kampdag v1 uten å endre den: samme styrkeberegning
// (calculateMatchStrength) og samme xG-grunnlag (computeBaseExpectedGoals).
// v0.2 legger et tynt beslutningslag oppå:
//   laguttak → kampplan (pre_match) → 3 hendelser (event_1..3) →
//   managergrep per hendelse → summerte beslutningseffekter → resultat →
//   forklarende sluttrapport (resolved).
//
// Fortsatt ren modul: ingen DOM, fetch, localStorage eller app-state. app.js
// eier sesjonen (lagring/visning); motoren lager, vurderer og avslutter den.
// Ingen liga, tabell, sesong, økonomi, livekamp eller ny unlockmotor.
// ============================================================================

// ----------------------------------------------------------------------------
// B. Enkle motstanderprofiler. Samme numeriske felter som v1-motstanderen
// (strength, defensiveStructure, transitionThreat ...) slik at xG-modellen kan
// lese dem direkte, pluss style/strengths/weaknesses/pressurePoints for UI og
// hendelsesvalg.
// ----------------------------------------------------------------------------
export const OPPONENT_PROFILES = [
  {
    id: "high_press_opponent",
    name: "Pressmaskinen",
    style: "Høyt press og rask gjenvinning",
    strength: 74,
    pressResistance: 62,
    defensiveStructure: 66,
    transitionThreat: 76,
    chanceConversion: 70,
    strengths: ["jager ballfører høyt", "vinner ballen i din oppbygging"],
    weaknesses: ["rom bak presslinjen", "sårbar når presset brytes"],
    pressurePoints: ["oppbygging under press", "keeper og stoppere med ball"],
    matchupStyles: ["high_press", "aggressive_man_press"]
  },
  {
    id: "low_block_opponent",
    name: "Lavblokklaget",
    style: "Lav blokk og tette rom",
    strength: 70,
    pressResistance: 74,
    defensiveStructure: 82,
    transitionThreat: 62,
    chanceConversion: 66,
    strengths: ["kompakt femmer/firer bak ballen", "vinner boksdueller"],
    weaknesses: ["lite egen ballbesittelse", "sliter mot rask sideforflytning"],
    pressurePoints: ["tålmodighet i angrep", "bredde og innlegg"],
    matchupStyles: ["deep_low_block", "compact_532"]
  },
  {
    id: "direct_counter_opponent",
    name: "Kontringslaget",
    style: "Direkte kontringer i bakrom",
    strength: 72,
    pressResistance: 66,
    defensiveStructure: 70,
    transitionThreat: 84,
    chanceConversion: 74,
    strengths: ["lynraske overganger", "spisser som lever i bakrommet"],
    weaknesses: ["lite kontroll med ball", "kan presses lavt"],
    pressurePoints: ["restforsvaret ditt", "balansen ved balltap"],
    matchupStyles: ["direct_counter", "fast_transition", "fast_runners_in_behind"]
  },
  {
    id: "possession_opponent",
    name: "Ballbesitterne",
    style: "Rolig possession og posisjonsspill",
    strength: 76,
    pressResistance: 80,
    defensiveStructure: 72,
    transitionThreat: 66,
    chanceConversion: 70,
    strengths: ["holder ballen i lange perioder", "flytter blokken din"],
    weaknesses: ["sårbar for målrettet press", "lav egen dybdetrussel"],
    pressurePoints: ["pressdisiplinen din", "tålmodighet uten ball"],
    matchupStyles: ["possession_positional", "build_from_back", "switching_play"]
  },
  {
    id: "physical_set_piece_opponent",
    name: "Duellaget",
    style: "Fysisk spill og dødballer",
    strength: 71,
    pressResistance: 68,
    defensiveStructure: 74,
    transitionThreat: 64,
    chanceConversion: 72,
    strengths: ["dominerer i lufta", "farlige på alle dødballer"],
    weaknesses: ["lavt tempo i eget angrepsspill", "sliter mot teknisk kombinasjonsspill"],
    pressurePoints: ["disiplin nær egen boks", "markering ved dødball"],
    matchupStyles: ["target_man_direct", "two_striker_press"]
  }
];

// ---------------------------------------------------------------------------
// Formasjons-matchup (Formation Knowledge Engine, kampmotor-siden).
//
// Trofast .js-motstykke til evaluateFormationVsOpponentStyles i
// src/engine/evaluateFormationMatchup.ts: veier DITT systems authored
// strongAgainst/weakAgainst (fra formationKnowledge.json) mot motstanderprofilens
// matchupStyles. Holdes i synk med TS-versjonen (parity-testet i
// sim:formation-matchup). app.js gjør all datalasting.
// ---------------------------------------------------------------------------
function uniqueStrings(values) {
  return [...new Set(asArray(values).filter((v) => typeof v === "string" && v.length > 0))];
}

function matchupLeanFromScore(score) {
  if (score >= 2) return "favourable";
  if (score <= -2) return "risky";
  return "balanced";
}

// Risiko-token → konkret kontekstuell justering. Trofast kopi av RISK_ADJUSTMENTS
// i src/engine/evaluateFormationMatchup.ts (parity-testet i sim:formation-matchup).
const MATCHUP_RISK_ADJUSTMENTS = {
  high_press: "Senk tempoet og bygg tryggere ut – eller spill mer direkte forbi presset.",
  aggressive_man_press: "Bruk bevegelse og rotasjoner for å bryte manndekningen; tilby flere pasningsvinkler.",
  direct_counter: "Styrk restforsvaret og hold én back-side lavere ved angrep.",
  fast_transition: "Reduser risikoen høyt og sørg for tydelig sikring bak ballen.",
  fast_runners_in_behind: "Senk forsvarslinjen litt for å ta bort bakrommet.",
  deep_low_block: "Vær tålmodig; bruk bredde, sideskift og overtall for å åpne blokken.",
  switching_play: "Hold laget kompakt sideveis og vær rask til å forflytte blokken.",
  possession_positional: "Velg pressutløsere bevisst; ikke jag ballen ukoordinert.",
  build_from_back: "Press oppspillet målrettet for å tvinge frem feil.",
  wide_overload: "Doble opp i bredden og sørg for at backen får støtte.",
  target_man_direct: "Vinn førsteballene og sikre andreballene rundt targetspissen.",
  compact_532: "Skap overtall sentralt og bruk indreløp i halvrommene.",
  narrow_442: "Bruk bredden; strekk den flate midtbanen med kant og overlapp.",
  two_striker_press: "Sikre overtall i oppbyggingen mot de to spissene (en ekstra mann bak).",
  three_at_back: "Angrip kantrommene utenfor de tre stopperne.",
  passive_mid_block: "Tør å holde ballen og dra blokken ut av posisjon."
};

// formationKnowledge: { strongAgainst, weakAgainst } for valgt formasjon.
// opponentStyles: motstanderprofilens matchupStyles. Returnerer null hvis det
// ikke finnes kunnskap for formasjonen (graceful – ikke alle formasjoner dekkes).
export function evaluateFormationMatchupVsOpponent(formationKnowledge, opponentStyles, opponentName) {
  if (!formationKnowledge || typeof formationKnowledge !== "object") {
    return null;
  }
  const strong = uniqueStrings(formationKnowledge.strongAgainst);
  const weak = uniqueStrings(formationKnowledge.weakAgainst);
  const opponentTokens = uniqueStrings(opponentStyles);

  const advantages = strong
    .filter((token) => opponentTokens.includes(token))
    .map((token) => ({
      token,
      source: "own_strength",
      text: `Ditt system er sterkt mot «${token}» – slik motstanderen spiller.`
    }));
  const risks = weak
    .filter((token) => opponentTokens.includes(token))
    .map((token) => ({
      token,
      source: "own_weakness",
      text: `Ditt system sliter mot «${token}» – slik motstanderen spiller.`
    }));

  const suggestions = [
    ...new Set(risks.map((r) => MATCHUP_RISK_ADJUSTMENTS[r.token]).filter(Boolean))
  ];

  const score = advantages.length - risks.length;
  const lean = matchupLeanFromScore(score);
  const name = opponentName || "motstanderen";

  let summary;
  if (lean === "favourable") {
    summary = `Gunstig matchup mot ${name}: systemet passer godt mot denne spillestilen.`;
  } else if (lean === "risky") {
    summary = `Risikabel matchup mot ${name}: spillestilen treffer systemets svakheter. Vurder kontekstuelle justeringer.`;
  } else {
    summary = `Balansert matchup mot ${name}: ingen tydelig taktisk overvekt mot denne spillestilen.`;
  }

  return { opponentTokens, advantages, risks, suggestions, score, lean, summary };
}

// Enkel tilfeldig motstander ved kampstart. Egen funksjon slik at app/test kan
// styre valget deterministisk via index om ønskelig.
export function pickOpponentProfile(index = null) {
  const pool = OPPONENT_PROFILES;
  const i = Number.isInteger(index) && index >= 0 && index < pool.length
    ? index
    : Math.floor(Math.random() * pool.length);
  return { ...pool[i] };
}

// ----------------------------------------------------------------------------
// C. Formasjonsfamilier og hendelsesbibliotek.
//
// Hver hgFootball-formasjon mappes til en taktisk familie via id-mønster, og
// hver familie har 3 korte, fotballfaglige hendelser. I tillegg gir hver
// motstanderprofil én egen hendelse. En kamp = 2 familiehendelser + 1
// motstanderhendelse.
// ----------------------------------------------------------------------------
const FORMATION_FAMILY_PATTERNS = [
  { family: "wm", pattern: /^(wm_|metodo|danubian|hungarian_mm)/ },
  { family: "catenaccio", pattern: /^(catenaccio|verrou|low_block|defensive_|libero_)/ },
  { family: "total", pattern: /^(total_|ajax_diamond|possession_433)/ },
  { family: "brazil", pattern: /^(brazil_424|early_433|attacking_343|rush_|creator_3412)/ },
  { family: "pyramid", pattern: /^(pyramid|scottish|direct_english|early_balance|early_false_nine)/ },
  { family: "press", pattern: /^(gegen|pressing_|modern_442_press|narrow_4312_press)/ },
  { family: "rest", pattern: /^(positional_325|modern_rest_235|box_midfield|modern_3241|inverted_fullback|conte_343|modern_3421|alonso_3421)/ }
];

export function getFormationFamily(formation) {
  const id = String(formation?.id || "");
  const match = FORMATION_FAMILY_PATTERNS.find((entry) => entry.pattern.test(id));
  return match ? match.family : "modern";
}

// Sjekk-hjelpere for kompakte hendelsesdefinisjoner.
//   m  = teamFit-metrikk (0-100) må være >= min
//   mw = teamFit-metrikk (0-100) må være <= max ("weak"-sjekk)
//   e  = formation.matchEngineEffects-dimensjon (0-10) må være >= min
//   c  = coachContext-verdi (0-100) må være >= min
function m(key, min) {
  return { type: "metric", key, min };
}
function mw(key, max) {
  return { type: "metric", key, max };
}
function e(key, min) {
  return { type: "effect", key, min };
}
function c(key, min) {
  return { type: "coach", key, min };
}

// Standard effektprofiler for managervalg. Verdiene er taket ved positivt
// utfall; negativt utfall inverteres/skaleres i resolveMatchdayDecision.
const IMPACTS = {
  aggressive: { xgFor: 0.35, xgAgainst: 0.05, momentum: 2, clarity: 0 },
  balanced: { xgFor: 0.2, xgAgainst: -0.1, momentum: 1, clarity: 1 },
  defensive: { xgFor: -0.05, xgAgainst: -0.3, momentum: 0, clarity: 1 },
  holdPlan: { xgFor: 0.1, xgAgainst: -0.1, momentum: 1, clarity: 1 }
};

function opt(id, label, checks, impact, risk = 0) {
  return { id, label, checks, impact, risk };
}

// Hendelser per formasjonsfamilie. relevantWhen gjør at hendelser som treffer
// lagets faktiske svakheter/styrker prioriteres ved utvalg.
const FAMILY_EVENTS = {
  wm: [
    {
      id: "wm_space_behind_halfbacks",
      title: "Rom bak half-back-linjen",
      text: "Motstanderen drar half-backene dine ut og finner rom bak dem.",
      pressure: "high",
      relevantWhen: { metric: "balanceScore", below: 60 },
      options: [
        opt("hold_plan", "Behold planen", [m("balanceScore", 62), e("defensiveSecurity", 5)], IMPACTS.holdPlan, 0),
        opt("drop_off", "Senk presset og fall av", [e("defensiveSecurity", 4), m("restDefenseScore", 50)], IMPACTS.defensive, 0),
        opt("press_higher", "Press høyere for å vinne ballen tidlig", [m("pressScore", 65), c("coachUnderstanding", 55)], IMPACTS.aggressive, 2)
      ]
    },
    {
      id: "wm_inside_forward_pockets",
      title: "Inside forwards finner lommer",
      text: "Indreløperne dine får rom mellom motstanderens ledd.",
      pressure: "medium",
      relevantWhen: { metric: "buildUpScore", above: 60 },
      options: [
        opt("attack_central", "Angrip mer sentralt gjennom lommene", [m("buildUpScore", 60), e("centralControl", 5)], IMPACTS.balanced, 1),
        opt("attack_wide", "Angrip bredere og strekk leddene", [m("widthScore", 60)], IMPACTS.balanced, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    },
    {
      id: "wm_midfield_imbalance",
      title: "Midten mister balansen",
      text: "WM-ens midtfirkant brukes feil og laget mister grepet sentralt.",
      pressure: "high",
      relevantWhen: { metric: "balanceScore", below: 58 },
      options: [
        opt("conservative_halfbacks", "Bruk half-backene mer konservativt", [e("defensiveSecurity", 4), m("balanceScore", 55)], IMPACTS.defensive, 0),
        opt("go_direct", "Spill mer direkte forbi midten", [m("depthScore", 60)], IMPACTS.aggressive, 1),
        opt("free_creator", "Gi frihet til den kreative indreløperen", [m("roleFitAverage", 62), c("roleFitClarity", 55)], IMPACTS.balanced, 1)
      ]
    }
  ],
  catenaccio: [
    {
      id: "cat_counter_window",
      title: "Lav blokk gir kontringsmulighet",
      text: "Laget forsvarer lavt og motstanderen blottlegger bakrommet.",
      pressure: "medium",
      relevantWhen: { metric: "depthScore", above: 55 },
      options: [
        opt("seek_depth", "Be laget søke bakrom umiddelbart", [m("depthScore", 60), e("transitionThreat", 5)], IMPACTS.aggressive, 1),
        opt("hold_plan", "Behold den rolige planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0),
        opt("press_higher", "Press høyere etter brudd", [m("pressScore", 65), e("pressingIntensity", 5)], IMPACTS.aggressive, 2)
      ]
    },
    {
      id: "cat_libero_pressed",
      title: "Libero-en utfordres av press",
      text: "Motstanderen presser sisteleddet, og markering/libero avgjør om laget tåler det.",
      pressure: "high",
      relevantWhen: { metric: "restDefenseScore", below: 60 },
      options: [
        opt("conservative_libero", "Bruk libero/stopper mer konservativt", [e("defensiveSecurity", 6)], IMPACTS.defensive, 0),
        opt("go_direct", "Spill mer direkte over presset", [m("depthScore", 55)], IMPACTS.balanced, 1),
        opt("calm_buildup", "Bygg roligere bakfra gjennom presset", [m("buildUpScore", 62), c("coachUnderstanding", 55)], IMPACTS.balanced, 2)
      ]
    },
    {
      id: "cat_high_press_against",
      title: "Høyt press mot systemet",
      text: "Motstanderens høye press straffer laget hvis oppspillet er feil satt opp.",
      pressure: "high",
      relevantWhen: { metric: "buildUpScore", below: 58 },
      options: [
        opt("go_direct", "Slå direkte og hopp over presset", [m("depthScore", 58)], IMPACTS.balanced, 1),
        opt("calm_buildup", "Hold fast på rolig oppbygging", [m("buildUpScore", 65), e("centralControl", 5)], IMPACTS.balanced, 2),
        opt("protect_box", "Senk laget og beskytt boksen", [m("restDefenseScore", 55), e("restDefenceSecurity", 5)], IMPACTS.defensive, 0)
      ]
    }
  ],
  total: [
    {
      id: "total_position_swaps",
      title: "Posisjonsbytter skaper overtall",
      text: "Rotasjonene gir overtall, men krever at alle leser byttene riktig.",
      pressure: "medium",
      relevantWhen: { metric: "roleFitAverage", above: 60 },
      options: [
        opt("free_rotation", "Gi rotasjonene fulle tøyler", [m("roleFitAverage", 62), c("coachUnderstanding", 58)], IMPACTS.aggressive, 1),
        opt("keep_structure", "Behold strukturen, bytt kontrollert", [m("balanceScore", 58)], IMPACTS.holdPlan, 0),
        opt("attack_wide", "Angrip bredere med kantene", [m("widthScore", 60)], IMPACTS.balanced, 1)
      ]
    },
    {
      id: "total_structure_risk",
      title: "Strukturen slår sprekker",
      text: "Med lav rolleforståelse mister laget strukturen i posisjonsbyttene.",
      pressure: "high",
      relevantWhen: { metric: "roleFitAverage", below: 60 },
      options: [
        opt("simplify_direct", "Forenkle: spill mer direkte", [m("depthScore", 55)], IMPACTS.balanced, 1),
        opt("trust_system", "Stol på totalfotballen", [m("roleFitAverage", 65), c("formationFamiliarity", 58)], IMPACTS.aggressive, 2),
        opt("protect_rest", "Beskytt restforsvaret", [m("restDefenseScore", 55)], IMPACTS.defensive, 0)
      ]
    },
    {
      id: "total_technical_control",
      title: "Teknisk fleksibilitet gir kontroll",
      text: "Lagets tekniske trygghet kan kvele kampen — hvis tempoet styres riktig.",
      pressure: "low",
      relevantWhen: { metric: "buildUpScore", above: 60 },
      options: [
        opt("calm_buildup", "Bygg roligere og styr tempoet", [m("buildUpScore", 62)], IMPACTS.balanced, 0),
        opt("counterpress", "Press høyere ved balltap", [m("pressScore", 62), e("pressingIntensity", 6)], IMPACTS.aggressive, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    }
  ],
  brazil: [
    {
      id: "brazil_wing_chaos",
      title: "Vingene skaper kaos",
      text: "Vingene og angriperne dine lager uorden i motstanderens backlinje.",
      pressure: "medium",
      relevantWhen: { metric: "widthScore", above: 58 },
      options: [
        opt("attack_wide", "Angrip enda bredere", [m("widthScore", 62), e("attackingWidth", 6)], IMPACTS.aggressive, 1),
        opt("early_box", "Spill tidligere inn i boksen", [m("depthScore", 58)], IMPACTS.balanced, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    },
    {
      id: "brazil_midfield_overrun",
      title: "Midtbanen blir overkjørt",
      text: "Tomannsmidtbanen tappes for krefter og mister kontrollen.",
      pressure: "high",
      relevantWhen: { metric: "balanceScore", below: 58 },
      options: [
        opt("compact_middle", "Senk presset og gjør midten kompakt", [m("balanceScore", 55)], IMPACTS.defensive, 0),
        opt("striker_helps", "Trekk en angriper hjem i forsvar", [m("restDefenseScore", 52), c("coachUnderstanding", 55)], IMPACTS.defensive, 0),
        opt("trust_talent", "Stol på individuell klasse", [m("roleFitAverage", 68)], IMPACTS.aggressive, 2)
      ]
    },
    {
      id: "brazil_individual_moment",
      title: "Individuell ferdighet kan vippe kampen",
      text: "Den kreative spilleren din ber om friere rolle i avgjørende fase.",
      pressure: "medium",
      relevantWhen: { metric: "roleFitAverage", above: 60 },
      options: [
        opt("free_creator", "Gi frihet til den kreative spilleren", [m("roleFitAverage", 63)], IMPACTS.aggressive, 1),
        opt("combine_central", "Kombiner sentralt rundt ham", [m("buildUpScore", 60), e("centralControl", 4)], IMPACTS.balanced, 0),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    }
  ],
  pyramid: [
    {
      id: "pyramid_width_pressure",
      title: "Femmannsangrepet gir trykk",
      text: "Bredden i femmannsrekka strekker motstanderen fra side til side.",
      pressure: "medium",
      relevantWhen: { metric: "widthScore", above: 58 },
      options: [
        opt("attack_wide", "Angrip bredere med ytterløperne", [m("widthScore", 60)], IMPACTS.aggressive, 1),
        opt("go_direct", "Spill mer direkte mot lengste", [m("depthScore", 58)], IMPACTS.balanced, 1),
        opt("keep_passing", "Hold på pasningsmønsteret", [m("buildUpScore", 62)], IMPACTS.balanced, 0)
      ]
    },
    {
      id: "pyramid_halfback_balance",
      title: "Half-backene avgjør balansen",
      text: "Motstanderen angriper rommene half-backene etterlater.",
      pressure: "high",
      relevantWhen: { metric: "balanceScore", below: 60 },
      options: [
        opt("conservative_halfbacks", "Bruk half-backene konservativt", [m("balanceScore", 56), e("defensiveSecurity", 4)], IMPACTS.defensive, 0),
        opt("halfbacks_support", "La half-backene støtte angrepet", [m("buildUpScore", 60), m("restDefenseScore", 55)], IMPACTS.balanced, 1),
        opt("drop_off", "Senk presset og sikre midten", [e("defensiveSecurity", 4)], IMPACTS.defensive, 0)
      ]
    },
    {
      id: "pyramid_passing_vs_direct",
      title: "Pasningskultur mot direkte spill",
      text: "Kampen står mellom kortpasningskulturen din og det direkte spillet.",
      pressure: "medium",
      relevantWhen: { metric: "buildUpScore", above: 58 },
      options: [
        opt("calm_buildup", "Bygg roligere gjennom leddene", [m("buildUpScore", 62)], IMPACTS.balanced, 0),
        opt("go_direct", "Slå direkte bak backlinjen", [m("depthScore", 60)], IMPACTS.aggressive, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    }
  ],
  press: [
    {
      id: "press_winback_high",
      title: "Gjenvinning høyt gir overganger",
      text: "Presset ditt vinner ballen høyt — overgangene kan avgjøre kampen.",
      pressure: "medium",
      relevantWhen: { metric: "pressScore", above: 62 },
      options: [
        opt("press_higher", "Press enda høyere", [m("pressScore", 66), e("pressingIntensity", 7)], IMPACTS.aggressive, 1),
        opt("hold_press", "Hold pressnivået", [m("pressScore", 58)], IMPACTS.holdPlan, 0),
        opt("save_energy", "Senk presset og spar krefter", [m("balanceScore", 55)], IMPACTS.defensive, 0)
      ]
    },
    {
      id: "press_space_behind",
      title: "Rom bak den høye linjen",
      text: "Motstanderen slår tidlige baller bak den høye linjen din.",
      pressure: "high",
      relevantWhen: { metric: "restDefenseScore", below: 60 },
      options: [
        opt("protect_rest", "Beskytt restforsvaret", [m("restDefenseScore", 56), e("restDefenceSecurity", 5)], IMPACTS.defensive, 0),
        opt("keep_high", "Behold det høye presset", [m("pressScore", 68)], IMPACTS.aggressive, 2),
        opt("drop_line", "Senk linjen noen meter", [m("balanceScore", 55)], IMPACTS.defensive, 0)
      ]
    },
    {
      id: "press_baited",
      title: "Motstanderen lokker presset",
      text: "Oppspillene deres er rigget for å spille seg gjennom presset ditt.",
      pressure: "high",
      relevantWhen: { metric: "pressScore", below: 62 },
      options: [
        opt("smart_zones", "Press smartere i soner", [c("coachUnderstanding", 58), m("pressScore", 60)], IMPACTS.balanced, 1),
        opt("direct_after_win", "Spill direkte etter gjenvinning", [m("depthScore", 58)], IMPACTS.balanced, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    }
  ],
  rest: [
    {
      id: "rest_counter_test",
      title: "Restforsvaret testes av kontringer",
      text: "Treer-toer-sikringen bak ballen må håndtere motstanderens overganger.",
      pressure: "high",
      relevantWhen: { metric: "restDefenseScore", below: 62 },
      options: [
        opt("protect_rest", "Beskytt restforsvaret strengt", [m("restDefenseScore", 58), e("restDefenceSecurity", 6)], IMPACTS.defensive, 0),
        opt("keep_structure", "Behold strukturen", [m("balanceScore", 58)], IMPACTS.holdPlan, 0),
        opt("counterpress", "Press høyere ved balltap", [m("pressScore", 62)], IMPACTS.aggressive, 1)
      ]
    },
    {
      id: "rest_width_overload",
      title: "Breddeholderne skaper press",
      text: "De fem i front pinner motstanderen lavt — rommene åpner seg.",
      pressure: "medium",
      relevantWhen: { metric: "widthScore", above: 58 },
      options: [
        opt("attack_wide", "Angrip bredere via breddeholderne", [m("widthScore", 62), e("attackingWidth", 6)], IMPACTS.aggressive, 1),
        opt("attack_central", "Angrip sentralt gjennom boksmidten", [m("buildUpScore", 60), e("centralControl", 6)], IMPACTS.balanced, 0),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    },
    {
      id: "rest_role_misuse",
      title: "Feil rollebruk gir rom bak ball",
      text: "En feilplassert rolle åpner rom bak ballen når laget angriper.",
      pressure: "high",
      relevantWhen: { metric: "roleFitAverage", below: 62 },
      options: [
        opt("adjust_roles", "Juster rollene konservativt", [c("roleFitClarity", 55), m("balanceScore", 55)], IMPACTS.defensive, 0),
        opt("go_direct", "Spill mer direkte og unngå balltap", [m("depthScore", 56)], IMPACTS.balanced, 1),
        opt("trust_roles", "Behold rollene som planlagt", [m("roleFitAverage", 64)], IMPACTS.holdPlan, 1)
      ]
    }
  ],
  modern: [
    {
      id: "modern_midfield_battle",
      title: "Midtbanekampen er jevn",
      text: "Ingen av lagene eier midten — neste grep kan tippe den.",
      pressure: "medium",
      options: [
        opt("attack_central", "Angrip mer sentralt", [m("buildUpScore", 60)], IMPACTS.balanced, 1),
        opt("attack_wide", "Angrip bredere", [m("widthScore", 60)], IMPACTS.balanced, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    },
    {
      id: "modern_transition_threat",
      title: "Overganger truer begge veier",
      text: "Kampen åpner seg og begge lag får kontringsrom.",
      pressure: "high",
      relevantWhen: { metric: "restDefenseScore", below: 60 },
      options: [
        opt("protect_rest", "Beskytt restforsvaret", [m("restDefenseScore", 55)], IMPACTS.defensive, 0),
        opt("seek_depth", "Be laget søke bakrom", [m("depthScore", 58)], IMPACTS.aggressive, 1),
        opt("hold_plan", "Behold planen", [m("balanceScore", 55)], IMPACTS.holdPlan, 0)
      ]
    },
    {
      id: "modern_tempo_call",
      title: "Tempoet må styres",
      text: "Kampen trenger en tydelig beskjed om tempo.",
      pressure: "low",
      options: [
        opt("calm_buildup", "Bygg roligere bakfra", [m("buildUpScore", 60)], IMPACTS.balanced, 0),
        opt("raise_tempo", "Øk tempoet og spill direkte", [m("depthScore", 58), m("pressScore", 58)], IMPACTS.aggressive, 1),
        opt("hold_plan", "Behold planen", [c("coachUnderstanding", 55)], IMPACTS.holdPlan, 0)
      ]
    }
  ]
};

// Én hendelse per motstanderprofil, slik at motstanderen alltid setter sitt
// preg på kampen uavhengig av egen formasjon.
const OPPONENT_EVENTS = {
  high_press_opponent: {
    id: "opp_high_press",
    title: "Oppspillet ditt presses høyt",
    text: "Pressmaskinen jager keeper og stoppere i hver eneste oppbygging.",
    pressure: "high",
    options: [
      opt("calm_buildup", "Bygg roligere gjennom presset", [m("buildUpScore", 64), e("centralControl", 5)], IMPACTS.aggressive, 2),
      opt("go_direct", "Slå direkte over presset", [m("depthScore", 58)], IMPACTS.balanced, 1),
      opt("safe_long", "La keeper slå langt og trygt", [m("balanceScore", 50)], IMPACTS.defensive, 0)
    ]
  },
  low_block_opponent: {
    id: "opp_low_block",
    title: "Lav blokk stenger rommene",
    text: "Lavblokklaget parkerer bussen og gir deg ballen uten rom.",
    pressure: "medium",
    options: [
      opt("attack_wide", "Angrip bredere og flytt blokken", [m("widthScore", 62)], IMPACTS.balanced, 1),
      opt("quick_central", "Flytt ballen raskere sentralt", [m("buildUpScore", 62), e("centralControl", 5)], IMPACTS.balanced, 1),
      opt("patient", "Vær tålmodig og vent på feilen", [m("roleFitAverage", 60)], IMPACTS.holdPlan, 0)
    ]
  },
  direct_counter_opponent: {
    id: "opp_counter_threat",
    title: "Hvert balltap blir en kontring",
    text: "Kontringslaget venter bare på at du mister ballen på feil sted.",
    pressure: "high",
    options: [
      opt("protect_rest", "Beskytt restforsvaret", [m("restDefenseScore", 56), e("restDefenceSecurity", 5)], IMPACTS.defensive, 0),
      opt("safe_buildup", "Ta færre sjanser i oppbyggingen", [m("buildUpScore", 58)], IMPACTS.balanced, 0),
      opt("keep_attacking", "Fortsett å angripe med mange", [m("depthScore", 62)], IMPACTS.aggressive, 2)
    ]
  },
  possession_opponent: {
    id: "opp_possession_grind",
    title: "Motstanderen holder ballen i ro",
    text: "Ballbesitterne ruller laget ditt rundt og venter på åpningen.",
    pressure: "medium",
    options: [
      opt("press_higher", "Press høyere og bryt rytmen", [m("pressScore", 64), e("pressingIntensity", 6)], IMPACTS.aggressive, 1),
      opt("stay_compact", "Stå kompakt og vent", [m("balanceScore", 58)], IMPACTS.defensive, 0),
      opt("steer_wide", "Styr presset mot sidene", [c("coachUnderstanding", 56), m("pressScore", 56)], IMPACTS.balanced, 1)
    ]
  },
  physical_set_piece_opponent: {
    id: "opp_set_piece_threat",
    title: "Dødballer og dueller truer",
    text: "Duellaget lever på frispark, innkast og corner nær boksen din.",
    pressure: "medium",
    options: [
      opt("stay_disciplined", "Unngå unødige frispark", [m("balanceScore", 56)], IMPACTS.defensive, 0),
      opt("tight_marking", "Marker tett ved dødball", [e("defensiveSecurity", 5), m("restDefenseScore", 54)], IMPACTS.defensive, 0),
      opt("match_physical", "Svar med fysisk press", [m("pressScore", 60)], IMPACTS.aggressive, 1)
    ]
  }
};

// Hvor relevant en hendelse er for lagets faktiske tilstand. Treff på
// relevantWhen gir +1; liten tilfeldighet skiller ellers like kandidater.
function scoreEventRelevance(event, tp) {
  let score = Math.random() * 0.5;
  const rule = event.relevantWhen;
  if (rule && rule.metric) {
    const value = num(tp[rule.metric]);
    if (Number.isFinite(rule.below) && value < rule.below) score += 1;
    if (Number.isFinite(rule.above) && value > rule.above) score += 1;
  }
  return score;
}

// Genererer kampens 3 hendelser: to fra formasjonsfamilien (mest relevante
// først) og én fra motstanderprofilen i midten.
export function generateMatchdayEvents({ formation, tacticalProfile, opponent } = {}) {
  const family = getFormationFamily(formation);
  const pool = FAMILY_EVENTS[family] || FAMILY_EVENTS.modern;
  const tp = tacticalProfile || {};

  const rankedFamily = pool
    .map((event) => ({ event, score: scoreEventRelevance(event, tp) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.event);

  // Historiske stil-motstandere har egne id-er; de peker på en generisk
  // stil-familie via baseStyleId for å gjenbruke hendelsesbiblioteket.
  const opponentEvent = OPPONENT_EVENTS[opponent?.id] || OPPONENT_EVENTS[opponent?.baseStyleId] || null;

  const picked = [rankedFamily[0], opponentEvent, rankedFamily[1]].filter(Boolean).slice(0, 3);

  // Dypkopi slik at sesjonen kan persisteres trygt i localStorage.
  return picked.map((event, index) => ({
    sequence: index + 1,
    id: event.id,
    title: event.title,
    text: event.text,
    pressure: event.pressure || "medium",
    options: event.options.map((option) => ({
      id: option.id,
      label: option.label,
      checks: option.checks.map((check) => ({ ...check })),
      impact: { ...option.impact },
      risk: num(option.risk)
    }))
  }));
}

// ----------------------------------------------------------------------------
// D/E. Managerbeslutninger: vurdering og effekt.
// ----------------------------------------------------------------------------

// Norske navn på sjekk-kilder, til kort konsekvens-/forklaringstekst.
const CHECK_LABELS = {
  balanceScore: "balansen",
  restDefenseScore: "restforsvaret",
  pressScore: "presset",
  buildUpScore: "oppbyggingen",
  widthScore: "bredden",
  depthScore: "dybdetrusselen",
  relationshipScore: "rollerelasjonene",
  roleFitAverage: "rolleforståelsen",
  teamScore: "lagkvaliteten",
  attackingWidth: "systemets angrepsbredde",
  centralControl: "systemets sentrale kontroll",
  defensiveSecurity: "systemets defensive sikkerhet",
  transitionThreat: "systemets overgangstrussel",
  pressingIntensity: "systemets pressintensitet",
  restDefenceSecurity: "systemets restforsvar",
  coachUnderstanding: "trenerteamets systemforståelse",
  formationFamiliarity: "formasjonstilvenningen",
  roleFitClarity: "stabens rolletydelighet",
  tacticalLearningSpeed: "lagets taktiske læring"
};

function describeCheck(check) {
  return CHECK_LABELS[check?.key] || "lagets forutsetninger";
}

// Evaluerer én sjekk mot sesjonens snapshots: +1 oppfylt, -1 ikke oppfylt,
// 0 når kilden mangler (teller ikke mot spilleren).
function evaluateCheck(check, { tacticalProfile, matchEngineEffects, coachSnapshot }) {
  let value = null;

  if (check.type === "metric") {
    value = tacticalProfile ? Number(tacticalProfile[check.key]) : null;
  } else if (check.type === "effect") {
    value = matchEngineEffects ? Number(matchEngineEffects[check.key]) : null;
  } else if (check.type === "coach") {
    value = coachSnapshot ? Number(coachSnapshot[check.key]) : null;
  }

  if (!Number.isFinite(value)) {
    return 0;
  }

  if (Number.isFinite(check.min)) {
    return value >= check.min ? 1 : -1;
  }
  if (Number.isFinite(check.max)) {
    return value <= check.max ? 1 : -1;
  }
  return 0;
}

// Vurderer ett managervalg mot teamFit-snapshot, formasjonens
// matchEngineEffects og coachContext. Returnerer tone (positiv/nøytral/
// negativ), summerbare effekter og en kort konsekvenstekst.
export function resolveMatchdayDecision({ event, option, tacticalProfile, matchEngineEffects, coachSnapshot, trainingFocus } = {}) {
  if (!event || !option) {
    return null;
  }

  const ctx = { tacticalProfile, matchEngineEffects, coachSnapshot };
  const met = [];
  const failed = [];
  let score = 0;

  asArray(option.checks).forEach((check) => {
    const outcome = evaluateCheck(check, ctx);
    score += outcome;
    if (outcome > 0) met.push(check);
    if (outcome < 0) failed.push(check);
  });

  // Ukens treningsfokus er et lite tillegg, aldri hovedgrunnlaget. Relevante
  // grep kan vippe en marginal vurdering, mens restforsvar/dødball kan dempe
  // skaden i en hendelse laget faktisk trente på.
  const trainingSupport = evaluateTrainingDecisionSupport({ event, option, trainingFocus });
  score += trainingSupport.scoreBonus;

  // CoachContext mildner vanskelige valg: god systemforståelse eller
  // formasjonstilvenning redder ett feilet krav.
  const coachSupport =
    num(coachSnapshot?.coachUnderstanding) >= 60 || num(coachSnapshot?.formationFamiliarity) >= 60;
  let coachSoftened = false;
  if (score < 0 && coachSupport) {
    score += 1;
    coachSoftened = true;
  }

  // Høyt hendelsestrykk straffer risikofylte grep som ikke har dekning.
  if (event.pressure === "high" && num(option.risk) >= 2 && score <= 0) {
    score -= 1;
  }

  const tone = score > 0 ? "positive" : score === 0 ? "neutral" : "negative";

  const impact = option.impact || IMPACTS.holdPlan;
  const risk = num(option.risk);
  let effects;

  if (tone === "positive") {
    effects = {
      eventScoreDelta: 1,
      xgDeltaFor: impact.xgFor,
      xgDeltaAgainst: impact.xgAgainst,
      momentumDelta: impact.momentum,
      riskDelta: risk,
      tacticalClarityDelta: impact.clarity
    };
  } else if (tone === "neutral") {
    effects = {
      eventScoreDelta: 0,
      xgDeltaFor: impact.xgFor * 0.2,
      xgDeltaAgainst: impact.xgAgainst * 0.2,
      momentumDelta: 0,
      riskDelta: risk,
      tacticalClarityDelta: 0
    };
  } else {
    // Negativt utfall: grepet koster — mindre trussel fremover, mer trykk mot,
    // og risiko forsterker skaden. Stab med systemforståelse demper.
    const coachDamping = coachSupport ? 0.7 : 1;
    const trainingDamping = trainingSupport.eventMitigation ? 0.82 : 1;
    const damping = coachDamping * trainingDamping;
    effects = {
      eventScoreDelta: -1,
      xgDeltaFor: -Math.abs(impact.xgFor) * 0.6 * damping,
      xgDeltaAgainst: (Math.abs(impact.xgAgainst) * 0.8 + risk * 0.1) * damping,
      momentumDelta: -Math.max(1, Math.abs(impact.momentum)) * damping,
      riskDelta: risk + 1,
      tacticalClarityDelta: -1
    };
  }

  effects = Object.fromEntries(
    Object.entries(effects).map(([key, value]) => [key, round2(num(value))])
  );

  let feedback;
  if (tone === "positive") {
    const reason = met[0] ? ` Sterk ${describeCheck(met[0])} gjorde grepet trygt.` : "";
    feedback = `Grepet satt: laget tok kontroll på situasjonen.${reason}`;
  } else if (tone === "neutral") {
    feedback = "Grepet endret lite — kampbildet fortsatte omtrent som før.";
  } else {
    const reason = failed[0] ? ` Svak ${describeCheck(failed[0])} gjorde laget sårbart.` : "";
    const softened = coachSoftened || coachSupport ? " Trenerteamet dempet skaden noe." : "";
    const trained = trainingSupport.eventMitigation ? ` Ukens ${trainingFocus?.name?.toLowerCase() || "trening"} dempet risikoen.` : "";
    feedback = `Grepet slo feil: motstanderen utnyttet situasjonen.${reason}${softened}${trained}`;
  }

  return {
    tone,
    effects,
    feedback,
    metKeys: met.map((check) => check.key),
    failedKeys: failed.map((check) => check.key),
    coachSoftened,
    trainingImpact: trainingSupport.relevant
      ? {
          focusId: trainingFocus?.focusId || null,
          focusName: trainingFocus?.name || "Treningsfokus",
          scoreBonus: trainingSupport.scoreBonus,
          mitigatedRisk: trainingSupport.eventMitigation
        }
      : null
  };
}

// ----------------------------------------------------------------------------
// A. Sesjonsmodell: én kampdag med faser pre_match → event_1..3 → resolved.
// ----------------------------------------------------------------------------

// Oppretter en ny kampdagsesjon med motstander, snapshots og genererte
// hendelser. app.js eier lagringen (localStorage) og faseflyten.
export function createMatchdaySession({ teamFit, formation, tactic, activeClassifications, coachContext, opponent, trainingFocus, formationKnowledge, offPitchContext, relationships } = {}) {
  const matchOpponent = opponent || pickOpponentProfile();

  // Formasjons-matchup mot motstanderens spillestil (Formation Knowledge Engine).
  // Krever at app.js sender inn valgt formasjons kunnskapsoppslag; null ellers.
  const formationMatchup = formationKnowledge
    ? evaluateFormationMatchupVsOpponent(formationKnowledge, matchOpponent.matchupStyles, matchOpponent.name)
    : null;

  // Historical Opponent Archetypes v1: når motstanderen er en historisk stil-
  // profil (har styleTraits), beregn en forklarende matchup-vurdering mot lagets
  // ledd. Null for de generiske profilene (trygg degradering).
  const historicalMatchup = matchOpponent.styleTraits
    ? evaluateHistoricalOpponentMatchup({
        teamFit,
        formation,
        tactic,
        trainingFocus,
        opponentProfile: matchOpponent,
        relationships: relationships || teamFit?.relationships || null,
        offPitchContext
      })
    : null;

  const strength = calculateMatchStrength({ teamFit, formation, activeClassifications, formationMatchup });
  const tp = strength.tacticalProfile;

  // roleFitAverage trengs av flere hendelses-sjekker, men er ikke del av v1-
  // profilen. Legges til additivt i sesjonens snapshot.
  const tacticalProfile = {
    ...tp,
    roleFitAverage: clamp(num(teamFit?.metrics?.roleFitAverage))
  };
  Object.entries(trainingFocus?.metricBonuses || {}).forEach(([metric, bonus]) => {
    if (Number.isFinite(Number(tacticalProfile[metric]))) {
      tacticalProfile[metric] = clamp(num(tacticalProfile[metric]) + num(bonus));
    }
  });

  const historical = teamFit?.historicalFormationFit || {};

  const events = generateMatchdayEvents({
    formation,
    tacticalProfile,
    opponent: matchOpponent
  });

  // Forklaringsgrunnlag (Match Explanation v1.5): snapshot av relasjoner og
  // off-pitch-kontekst SLIK DE VAR FØR KAMPEN. Lagres på sesjonen så
  // finalizeMatchdaySession kan forklare hvorfor utfallet ble som det ble — og
  // så forklaringen overlever en reload (den persisteres på resultatet, ikke på
  // den flyktige app-staten). Begge er valgfrie; mangler de, blir forklaringen
  // tynnere men fortsatt gyldig. app.js eier all lasting/normalisering.
  const relationshipSource = relationships || teamFit?.relationships || null;
  const relationshipSnapshot = relationshipSource
    ? {
        relationshipScore: clamp(num(relationshipSource.relationshipScore)),
        positiveRelations: asArray(relationshipSource.positiveRelations).map((relation) => ({
          title: relation?.title || "",
          explanation: relation?.explanation || "",
          points: num(relation?.points)
        })),
        negativeRelations: asArray(relationshipSource.negativeRelations).map((relation) => ({
          title: relation?.title || "",
          explanation: relation?.explanation || "",
          points: num(relation?.points)
        }))
      }
    : null;
  const offPitchSnapshot = offPitchContext && typeof offPitchContext === "object" ? { ...offPitchContext } : null;

  return {
    version: 2,
    id: `matchday-session-${Date.now()}`,
    createdAt: new Date().toISOString(),
    phase: "pre_match",
    opponent: { ...matchOpponent },
    formationKnowledge: formationKnowledge ? { ...formationKnowledge } : null,
    formationMatchup,
    historicalMatchup,
    selectedFormationId: formation?.id || null,
    selectedTacticId: tactic?.id || null,
    tacticSnapshot: tactic
      ? {
          id: tactic.id || null,
          name: tactic.name || "",
          pressing: tactic.pressing || "",
          tempo: tactic.tempo || "",
          width: tactic.width || "",
          buildUp: tactic.buildUp || ""
        }
      : null,
    formationSnapshot: strength.formationProfile,
    matchEngineEffects:
      formation?.matchEngineEffects && typeof formation.matchEngineEffects === "object"
        ? { ...formation.matchEngineEffects }
        : null,
    teamFitSnapshot: {
      tacticalProfile,
      historicalScore: num(historical.historicalScore)
    },
    strengthSnapshot: {
      finalStrength: strength.finalStrength,
      baseTeamScore: strength.baseTeamScore,
      modifiers: strength.modifiers
    },
    coachSnapshot: coachContext
      ? {
          coachUnderstanding: clamp(num(coachContext.coachUnderstanding) + num(trainingFocus?.coachBonuses?.coachUnderstanding)),
          formationFamiliarity: clamp(num(coachContext.formationFamiliarity) + num(trainingFocus?.coachBonuses?.formationFamiliarity)),
          tacticalLearningSpeed: num(coachContext.tacticalLearningSpeed),
          roleFitClarity: clamp(num(coachContext.roleFitClarity) + num(trainingFocus?.coachBonuses?.roleFitClarity))
        }
      : null,
    trainingFocus: trainingFocus ? { ...trainingFocus } : null,
    relationshipSnapshot,
    offPitchSnapshot,
    events,
    decisions: []
  };
}

// Hvilket hendelsesindeks (0-basert) en event-fase peker på, ellers null.
export function getSessionEventIndex(session) {
  const match = /^event_(\d+)$/.exec(String(session?.phase || ""));
  if (!match) {
    return null;
  }
  const index = Number(match[1]) - 1;
  return Number.isInteger(index) && index >= 0 && index < asArray(session?.events).length
    ? index
    : null;
}

// ----------------------------------------------------------------------------
// E/H. Sluttberegning: summerte beslutningseffekter oppå v1-xG-modellen, pluss
// forklarende rapportfelter (beste/svakeste grep, systemdom, avgjørende lagdel,
// råd for neste uke og et History Go-hint).
// ----------------------------------------------------------------------------

function sumDecisionEffects(decisions) {
  const totals = {
    eventScoreDelta: 0,
    xgDeltaFor: 0,
    xgDeltaAgainst: 0,
    momentumDelta: 0,
    riskDelta: 0,
    tacticalClarityDelta: 0
  };

  asArray(decisions).forEach((decision) => {
    const effects = decision?.effects || {};
    Object.keys(totals).forEach((key) => {
      totals[key] += num(effects[key]);
    });
  });

  Object.keys(totals).forEach((key) => {
    totals[key] = round2(totals[key]);
  });

  return totals;
}

// Enkel samlescore per beslutning for å rangere beste/svakeste grep.
function decisionImpactScore(decision) {
  const effects = decision?.effects || {};
  return (
    num(effects.eventScoreDelta) +
    num(effects.xgDeltaFor) -
    num(effects.xgDeltaAgainst) +
    num(effects.momentumDelta) * 0.1
  );
}

const UNIT_LABELS = {
  balanceScore: "midtbanebalansen",
  restDefenseScore: "restforsvaret",
  pressScore: "presslinjen",
  buildUpScore: "oppbyggingsspillet",
  widthScore: "kantspillet",
  depthScore: "bakromstruslene",
  relationshipScore: "rollerelasjonene",
  roleFitAverage: "rolleforståelsen"
};

const NEXT_WEEK_ADVICE = {
  balanceScore: "Tren på balansen mellom lagdelene før neste kamp.",
  restDefenseScore: "Jobb med sikringen bak ballen — restforsvaret må stå støere.",
  pressScore: "Tren pressmønsteret slik at laget kan jage mer samlet.",
  buildUpScore: "Tren oppbyggingsspillet slik at laget tåler press med ball.",
  widthScore: "Jobb med å bruke bredden bedre i angrep.",
  depthScore: "Tren bakromsløp og dybdetiming i angrepsspillet.",
  relationshipScore: "Bygg bedre rollerelasjoner mellom nøkkelspillerne.",
  roleFitAverage: "Vurder rollebyttene: flere spillere står i feil rolle."
};

const HISTORY_GO_HINTS = {
  balanceScore: "Et History Go-sted med taktisk stab kan gi systemet bedre balanseforståelse.",
  restDefenseScore: "En defensiv trener eller stopperprofil fra et History Go-sted kan styrke restforsvaret.",
  pressScore: "En pressorientert trener fra et History Go-sted kan løfte gjenvinningsspillet.",
  buildUpScore: "En spillende midtbaneprofil fra et History Go-sted kan trygge oppbyggingen.",
  widthScore: "En kantspiller- eller vingprofil fra et History Go-sted kan gi mer bredde.",
  depthScore: "En hurtig spissprofil fra et History Go-sted kan gi mer bakromstrussel.",
  relationshipScore: "Et History Go-sted med spillere fra samme skole kan styrke relasjonene.",
  roleFitAverage: "En assistenttrener fra et History Go-sted kan gi rollene tydeligere innhold."
};

// Finn metrikken lengst unna «greit nivå» (60) — den avgjørende lagdelen.
function findDecisiveMetric(tacticalProfile) {
  const keys = Object.keys(UNIT_LABELS);
  let bestKey = null;
  let bestDistance = -1;

  keys.forEach((key) => {
    const value = Number(tacticalProfile?.[key]);
    if (!Number.isFinite(value)) {
      return;
    }
    const distance = Math.abs(value - 60);
    if (distance > bestDistance) {
      bestDistance = distance;
      bestKey = key;
    }
  });

  if (!bestKey) {
    return null;
  }
  return { key: bestKey, value: num(tacticalProfile[bestKey]), isStrong: num(tacticalProfile[bestKey]) >= 60 };
}

// Finn lagets svakeste metrikk — grunnlag for treningsråd og History Go-hint.
function findWeakestMetric(tacticalProfile) {
  const keys = Object.keys(UNIT_LABELS);
  let weakestKey = null;
  let weakestValue = Infinity;

  keys.forEach((key) => {
    const value = Number(tacticalProfile?.[key]);
    if (Number.isFinite(value) && value < weakestValue) {
      weakestValue = value;
      weakestKey = key;
    }
  });

  return weakestKey ? { key: weakestKey, value: weakestValue } : null;
}

// Kort dom over hvorfor systemet fungerte eller ikke i denne kampen.
function buildFormationVerdict({ session, totals, positiveCount, negativeCount }) {
  const formationName = session?.formationSnapshot?.name || "Systemet";
  const historicalScore = num(session?.teamFitSnapshot?.historicalScore);
  const coach = session?.coachSnapshot || {};
  const opponentStyle = session?.opponent?.style || "motstanderen";

  const parts = [];

  if (historicalScore >= 70 && positiveCount >= 2) {
    parts.push(`${formationName} ga kontroll: høy historisk fit og riktige grep traff mot ${opponentStyle.toLowerCase()}.`);
  } else if (historicalScore >= 70) {
    parts.push(`${formationName} passet laget godt, men grepene underveis hentet ikke ut alt.`);
  } else if (historicalScore > 0 && historicalScore < 50) {
    parts.push(`${formationName} passet laget dårlig — systemkravene matchet ikke spillerne.`);
  } else {
    parts.push(`${formationName} fungerte greit uten å dominere kampbildet.`);
  }

  if (num(coach.coachUnderstanding) >= 62) {
    parts.push("Trenerteamets systemforståelse styrket gjennomføringen.");
  } else if (num(coach.coachUnderstanding) > 0 && num(coach.coachUnderstanding) < 50) {
    parts.push("Lav trenerstøtte gjorde systemet vanskeligere å styre.");
  }

  if (negativeCount >= 2) {
    parts.push("Flere feilslåtte grep gjorde laget sårbart underveis.");
  } else if (num(totals.riskDelta) >= 4) {
    parts.push("Den høye risikoprofilen åpnet kampen mer enn planlagt.");
  }

  return parts.join(" ");
}

// Avslutter en kampdagsesjon: base-xG fra v1-modellen + summerte
// beslutningseffekter → mål, utfall og forklarende sluttrapport.
export function finalizeMatchdaySession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const tp = session.teamFitSnapshot?.tacticalProfile || {};
  const historicalScore = num(session.teamFitSnapshot?.historicalScore);
  const opponent = session.opponent || createDefaultOpponent();
  const teamStrength = num(session.strengthSnapshot?.finalStrength);
  const missing = num(session.strengthSnapshot?.modifiers?.missing);
  const isIncomplete = missing > 0;

  const baseXg = computeBaseExpectedGoals({
    tp,
    historicalScore,
    opponent,
    teamStrength,
    isIncomplete,
    missing
  });

  const decisions = asArray(session.decisions);
  const totals = sumDecisionEffects(decisions);

  // Beslutningseffekter oppå basis-xG: momentum løfter egen trussel litt,
  // risiko og tapt taktisk klarhet øker trykket mot eget mål.
  let expectedGoalsFor = baseXg.expectedGoalsFor + totals.xgDeltaFor + totals.momentumDelta * 0.04;
  let expectedGoalsAgainst =
    baseXg.expectedGoalsAgainst + totals.xgDeltaAgainst + totals.riskDelta * 0.05 - totals.tacticalClarityDelta * 0.04;

  expectedGoalsFor = clampRange(round2(expectedGoalsFor), 0.2, 4.0);
  expectedGoalsAgainst = clampRange(round2(expectedGoalsAgainst), 0.1, 4.0);

  const goalsFor = rollGoals(expectedGoalsFor);
  const goalsAgainst = rollGoals(expectedGoalsAgainst);

  let outcome = "draw";
  if (goalsFor > goalsAgainst) {
    outcome = "win";
  } else if (goalsFor < goalsAgainst) {
    outcome = "loss";
  }

  const positiveCount = decisions.filter((decision) => decision.tone === "positive").length;
  const negativeCount = decisions.filter((decision) => decision.tone === "negative").length;

  const ranked = [...decisions].sort((a, b) => decisionImpactScore(b) - decisionImpactScore(a));
  const bestDecision = ranked[0] || null;
  const worstDecision = ranked.length > 1 ? ranked[ranked.length - 1] : null;

  const decisive = findDecisiveMetric(tp);
  const weakest = findWeakestMetric(tp);

  const decisiveUnit = decisive
    ? decisive.isStrong
      ? `Sterk ${UNIT_LABELS[decisive.key]} (${decisive.value}) var avgjørende i lagets favør.`
      : `Svak ${UNIT_LABELS[decisive.key]} (${decisive.value}) var lagets største problem.`
    : null;

  const nextWeekAdvice = weakest ? NEXT_WEEK_ADVICE[weakest.key] : null;
  const historyGoHint = weakest ? HISTORY_GO_HINTS[weakest.key] : null;

  const formationVerdict = buildFormationVerdict({ session, totals, positiveCount, negativeCount });

  // Kampanalyse: kort beslutningsoppsummering pluss systembildet.
  const analysis = [];
  if (positiveCount > 0) {
    analysis.push(`${positiveCount} av ${decisions.length} managergrep traff og løftet laget.`);
  }
  if (negativeCount > 0) {
    analysis.push(`${negativeCount} grep slo feil og kostet laget kontroll.`);
  }
  if (totals.momentumDelta >= 2) {
    analysis.push("Laget bygde momentum gjennom kampen.");
  } else if (totals.momentumDelta <= -2) {
    analysis.push("Laget mistet momentum etter grepene som slo feil.");
  }
  if (decisiveUnit) {
    analysis.push(decisiveUnit);
  }
  const weaknessHint = asArray(session.formationSnapshot?.weaknesses)[0];
  if (weaknessHint) {
    analysis.push(`Systemsvakhet som preget kampen: ${weaknessHint}.`);
  }

  // Formasjons-matchup: lukk læringssløyfen ved å forklare at matchupen mot
  // motstanderens spillestil faktisk påvirket lagstyrken (og dermed resultatet).
  const matchup = session.formationMatchup;
  const matchupTendency = num(session.strengthSnapshot?.modifiers?.matchupTendency);
  if (matchup && matchupTendency !== 0) {
    const leanText = matchup.lean === "favourable" ? "gunstig" : matchup.lean === "risky" ? "risikabel" : "balansert";
    const sign = matchupTendency > 0 ? "+" : "";
    analysis.push(`Formasjons-matchup mot ${opponent.name || "motstanderen"} var ${leanText} (${sign}${matchupTendency} lagstyrke).`);
  }

  // Historisk stil-matchup: forklar hvordan den historiske motstanderstilen møtte
  // lagets ledd (kun når motstanderen er en historisk arketype).
  const historicalMatchup = session.historicalMatchup;
  if (historicalMatchup && typeof historicalMatchup === "object") {
    analysis.push(historicalMatchup.summary);
  }

  const keyFactors = [];
  const strengthGap = baseXg.strengthGap;
  if (strengthGap >= 8) {
    keyFactors.push("Lagstyrke over motstanderen");
  } else if (strengthGap <= -8) {
    keyFactors.push("Lagstyrke under motstanderen");
  } else {
    keyFactors.push("Jevn styrke mot motstanderen");
  }
  if (positiveCount >= 2) {
    keyFactors.push("Gode managergrep");
  } else if (negativeCount >= 2) {
    keyFactors.push("Feilslåtte managergrep");
  }
  if (num(totals.riskDelta) >= 4) {
    keyFactors.push("Høy risikoprofil");
  }
  if (num(tp.restDefenseScore) < 50) {
    keyFactors.push("Skjørt restforsvar");
  }
  if (matchup && matchupTendency >= 2) {
    keyFactors.push("Gunstig formasjons-matchup");
  } else if (matchup && matchupTendency <= -2) {
    keyFactors.push("Risikabel formasjons-matchup");
  }
  if (historicalMatchup && historicalMatchup.riskLevel === "favourable") {
    keyFactors.push(`Gunstig stil-matchup mot ${historicalMatchup.archetypeName || "historisk arketype"}`);
  } else if (historicalMatchup && historicalMatchup.riskLevel === "risky") {
    keyFactors.push(`Risikabel stil-matchup mot ${historicalMatchup.archetypeName || "historisk arketype"}`);
  }

  const trainingImpacts = decisions.map((decision) => decision.trainingImpact).filter(Boolean);
  const mitigatedTrainingEvent = trainingImpacts.find((impact) => impact.mitigatedRisk);
  const matchedTrainingDecision = trainingImpacts.find((impact) => num(impact.scoreBonus) > 0);
  let trainingReport = null;
  if (session.trainingFocus) {
    let summary = `Ukens ${String(session.trainingFocus.name || "trening").toLowerCase()} ga liten effekt i denne kampen.`;
    if (mitigatedTrainingEvent) {
      summary = `Ukens ${String(session.trainingFocus.name).toLowerCase()} dempet risikoen i en relevant hendelse.`;
    } else if (matchedTrainingDecision) {
      summary = `Ukens ${String(session.trainingFocus.name).toLowerCase()} støttet et relevant managergrep.`;
    } else if (session.trainingFocus.opponentFit) {
      summary = `Ukens ${String(session.trainingFocus.name).toLowerCase()} passet motstanderprofilen, men ble lite testet.`;
    } else {
      summary = `Ukens ${String(session.trainingFocus.name).toLowerCase()} passet kampbildet dårlig og ga liten effekt.`;
    }
    trainingReport = {
      focusId: session.trainingFocus.focusId,
      name: session.trainingFocus.name,
      week: session.trainingFocus.week,
      staffSupport: session.trainingFocus.staffSupport?.level || "weak",
      helped: Boolean(mitigatedTrainingEvent || matchedTrainingDecision),
      summary
    };
  }

  const result = {
    id: `matchday-${Date.now()}`,
    version: 2,
    playedAt: new Date().toISOString(),
    opponent: { ...opponent },
    formationSnapshot: session.formationSnapshot || {},
    tacticSnapshot: session.tacticSnapshot || null,
    formationMatchup: session.formationMatchup || null,
    historicalMatchup: session.historicalMatchup || null,
    teamStrength,
    score: { for: goalsFor, against: goalsAgainst },
    expectedGoals: { for: expectedGoalsFor, against: expectedGoalsAgainst },
    outcome,
    keyFactors: keyFactors.slice(0, 4),
    analysis: analysis.slice(0, 6),
    decisions: decisions.map((decision) => ({ ...decision })),
    decisionTotals: totals,
    bestDecision: bestDecision
      ? { label: bestDecision.optionLabel, eventTitle: bestDecision.eventTitle, tone: bestDecision.tone }
      : null,
    worstDecision: worstDecision
      ? { label: worstDecision.optionLabel, eventTitle: worstDecision.eventTitle, tone: worstDecision.tone }
      : null,
    formationVerdict,
    trainingFocus: trainingReport,
    decisiveUnit,
    nextWeekAdvice,
    historyGoHint,
    // Maskinlesbar svakhet kampen avslørte (UNIT_LABELS-nøkkel). Lar treningsuka
    // belønne å trene det som faktisk gikk galt (reaktiv kontekst-relevans).
    exposedWeaknessMetric: weakest?.key || null
  };

  // Match Explanation v1.5: bygg den forklarende, pedagogiske sluttforklaringen
  // fra resultatet og sesjonens snapshots, og persistér den på resultatet slik
  // at UI kan vise HVORFOR utfallet ble som det ble — også etter en reload.
  result.explanation = buildMatchExplanation({ result, session });

  return result;
}
