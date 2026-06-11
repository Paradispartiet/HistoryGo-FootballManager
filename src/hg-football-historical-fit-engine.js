// HG Football Manager — Historical Formation Fit Engine (v1)
//
// Gjør historiske hgFootball-formasjoner spillmessig relevante i lagfitmotoren.
// Modulen sammenligner den valgte ellerens legacy-roller mot formasjonens
// historiske krav (roleRequirements/preferredPlayerTypes/misusedPlayerTypes) og
// lar formasjonens matchEngineEffects nudginge de eksisterende metrikkene –
// uten å erstatte dem.
//
// Designprinsipper:
//   - Ren modul: ingen DOM, ingen fetch, ingen localStorage, ingen app-state,
//     ingen sideeffekter. Alt utledes fra inn-argumentene.
//   - Ingen formasjoner hardkodes her. Krav, foretrukne og misbrukte spillertyper
//     leses fra den adapterte hgFootball-formasjonen.
//   - Historisk justering er en forsiktig dytt, ikke en overstyring. Gamle
//     formasjoner blir ikke automatisk dårlige; krevende formasjoner krever
//     riktig rolledekning i stedet for å få flat straff.
//
// Kjerneprinsipp: alle spillere er gode. Treneren avgjør om systemet får frem
// styrkene deres. Historiske formasjoner er ikke svakere; de er krevende på
// andre måter.

import { mapLegacyRoleToHgRoleTypes } from "./hg-football-formation-adapter.js";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function num(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

// matchEngineEffects er 0-10 per dimensjon. Oversett til de gamle 0-100-skalaene.
function effectToScore(value) {
  return clamp(Math.round(num(value) * 10));
}

// Libero-/sweeper-familien. Brukes til tydelige catenaccio/libero-vurderinger.
const LIBERO_ROLE_TYPES = ["libero", "libero_classic"];

// Mapper en hgFootball-formasjons tacticalDifficulty til hvor høy rolledekning
// systemet realistisk krever for å fungere. Difficulty er IKKE en straff for å
// være avansert; den hever kravet til riktig bruk.
const DIFFICULTY_COVERAGE_DEMAND = {
  low: 35,
  medium: 50,
  high: 62,
  very_high: 72
};

// Bygger et oppslag legacyRoleId -> Set(hgRoleTypeIds) for de komplette
// assignmentene, og et samlet sett over alle hgRoleTypes laget faktisk bruker.
function buildAssignmentRoleMaps(completeAssignments) {
  const usedHgRoleTypes = new Set();

  const assignmentMaps = completeAssignments.map((assignment) => {
    const hgIds = new Set(mapLegacyRoleToHgRoleTypes(assignment.role.id));
    hgIds.forEach((id) => usedHgRoleTypes.add(id));
    return { assignment, hgIds };
  });

  return { assignmentMaps, usedHgRoleTypes };
}

// 1) Historisk rolledekning.
//
// Sammenligner de valgte legacy-rollene mot formasjonens roleRequirements,
// preferredPlayerTypes og misusedPlayerTypes via mapLegacyRoleToHgRoleTypes.
export function calculateHistoricalRoleCoverage({ assignments, formation } = {}) {
  const completeAssignments = asArray(assignments).filter(
    (assignment) => assignment && assignment.role && assignment.player && assignment.slot
  );

  const roleRequirements = asArray(formation?.roleRequirements);
  const preferredTypes = asArray(formation?.preferredPlayerTypes);
  const misusedTypes = asArray(formation?.misusedPlayerTypes);

  const { assignmentMaps } = buildAssignmentRoleMaps(completeAssignments);

  const requiredMatched = [];
  const requiredMissing = [];
  roleRequirements.forEach((requirement) => {
    const covered = assignmentMaps.some((entry) => entry.hgIds.has(requirement));
    if (covered) {
      requiredMatched.push(requirement);
    } else {
      requiredMissing.push(requirement);
    }
  });

  const preferredMatched = preferredTypes.filter((type) =>
    assignmentMaps.some((entry) => entry.hgIds.has(type))
  );
  const misusedMatched = misusedTypes.filter((type) =>
    assignmentMaps.some((entry) => entry.hgIds.has(type))
  );

  const requiredCount = roleRequirements.length;

  // coverageScore (0-100). Uten registrerte rollekrav er vurderingen nøytral.
  // Med krav skaleres dekningsandelen til 38 (nesten ingen) - 95 (alle dekket),
  // bevisst ikke brutalt: gamle formasjoner skal kunne testes uten å rasere laget.
  let coverageScore = 60;
  if (requiredCount > 0) {
    const ratio = requiredMatched.length / requiredCount;
    coverageScore = Math.round(38 + ratio * 57);
  }

  // preferredBonus (0-8): liten positiv uttelling for foretrukne typer som brukes.
  let preferredBonus = 0;
  if (preferredTypes.length > 0) {
    preferredBonus = Math.round(Math.min(8, (preferredMatched.length / preferredTypes.length) * 8));
  }

  // misusePenalty (0-20): tydelig, men ødelegger ikke hele score alene.
  const misusePenalty = Math.min(20, misusedMatched.length * 7);

  const formationName = formation?.name || "systemet";

  const assignmentHistoricalFits = assignmentMaps.map((entry) => {
    const { assignment, hgIds } = entry;
    const matchedRequired = roleRequirements.find((id) => hgIds.has(id)) || null;
    const matchedPreferred = preferredTypes.find((id) => hgIds.has(id)) || null;
    const matchedMisused = misusedTypes.find((id) => hgIds.has(id)) || null;

    let tone = "neutral";
    let text = `Ingen direkte historisk rollekrav registrert for ${assignment.role.name}.`;

    if (matchedRequired) {
      tone = "positive";
      text = `Rollen dekker systemets nøkkelkrav: ${assignment.role.name} er sentral i ${formationName}.`;
    } else if (matchedMisused) {
      tone = "warning";
      text = `Mulig feilbruk: ${assignment.role.name} mister ofte verdi i ${formationName}.`;
    } else if (matchedPreferred) {
      tone = "positive";
      text = `Rollen løfter systemet: ${assignment.role.name} passer ${formationName}.`;
    }

    return {
      slotId: assignment.slot.slotId,
      playerId: assignment.player.id,
      roleId: assignment.role.id,
      matchedRequired,
      matchedPreferred,
      matchedMisused,
      tone,
      text
    };
  });

  return {
    requiredCount,
    requiredMatched,
    requiredMissing,
    preferredMatched,
    misusedMatched,
    coverageScore: clamp(coverageScore),
    preferredBonus,
    misusePenalty,
    assignmentHistoricalFits
  };
}

// Metrikkene som kan justeres av en formasjons matchEngineEffects, med kilde og
// en kort forklaring per justering.
const METRIC_EFFECT_MAP = [
  {
    metric: "widthScore",
    baseline: (effects) => effectToScore(effects.attackingWidth),
    sourceKey: "attackingWidth",
    reason: (name, value) => `Bredde justert av ${name}: systemets breddekrav (${value}) drar laget mot riktig breddebruk.`
  },
  {
    metric: "pressScore",
    baseline: (effects) => effectToScore(effects.pressingIntensity),
    sourceKey: "pressingIntensity",
    reason: (name, value) => `Press justert av ${name}: systemets pressintensitet (${value}) styrer pressuttellingen.`
  },
  {
    metric: "balanceScore",
    baseline: (effects) => effectToScore((num(effects.defensiveSecurity) + num(effects.restDefenceSecurity)) / 2),
    sourceKey: "defensiveSecurity+restDefenceSecurity",
    reason: (name, value) => `Balanse justert av ${name}: defensiv sikkerhet og restforsvar (${value}) veies inn.`
  },
  {
    metric: "restDefenseScore",
    baseline: (effects) => effectToScore(effects.restDefenceSecurity ?? effects.defensiveSecurity),
    sourceKey: "restDefenceSecurity",
    reason: (name, value) => `Restforsvar justert av ${name}: systemet krever restforsvarssikkerhet (${value}).`
  },
  {
    metric: "buildUpScore",
    baseline: (effects) => effectToScore((num(effects.centralControl) + num(effects.creativityDemand)) / 2),
    sourceKey: "centralControl+creativityDemand",
    reason: (name, value) => `Oppbygging justert av ${name}: sentral kontroll og kreativitetskrav (${value}) veies inn.`
  },
  {
    metric: "depthScore",
    baseline: (effects) => effectToScore(effects.transitionThreat),
    sourceKey: "transitionThreat",
    reason: (name, value) => `Dybde justert av ${name}: systemets overgangstrussel (${value}) påvirker dybdescoren.`
  }
];

// 2) Forsiktig metrikkjustering.
//
// Historisk formasjon skal nudginge eksisterende metrics, ikke erstatte dem:
//   blended = base * 0.75 + formationBaseline * 0.25
// Deretter brukes roleCoverage som kvalitetsfaktor: høy dekning lar formasjonens
// baseline få full effekt, lav dekning demper uttellingen (et krevende system
// gir svakere uttelling uten riktig rolledekning).
export function calculateHistoricalMetricAdjustments({ baseMetrics, formation, roleCoverage } = {}) {
  const metrics = { ...(baseMetrics || {}) };
  const adjustments = [];
  const notes = [];
  const effects = formation?.matchEngineEffects;

  if (!effects || typeof effects !== "object") {
    notes.push("Formasjonen mangler matchEngineEffects; metrics justeres ikke historisk.");
    return { metrics, adjustments, formationBaseline: null, notes };
  }

  const formationName = formation?.name || "formasjonen";
  const coverageScore = clamp(roleCoverage?.coverageScore ?? 60);

  // Kvalitetsfaktor 0.5-1.0: ved 0 % dekning får formasjonen halv dytt, ved
  // 100 % dekning får den full dytt. Dette beskytter gamle formasjoner mot å
  // bli dratt ned, og lar krevende systemer kreve riktige roller for full effekt.
  const quality = 0.5 + 0.5 * (coverageScore / 100);

  const formationBaseline = {};

  METRIC_EFFECT_MAP.forEach((mapping) => {
    const baseValue = metrics[mapping.metric];
    const formationValue = mapping.baseline(effects);
    formationBaseline[mapping.metric] = formationValue;

    if (typeof baseValue !== "number") {
      return;
    }

    const blended = baseValue * 0.75 + formationValue * 0.25;
    const adjusted = clamp(Math.round(baseValue + (blended - baseValue) * quality));

    if (adjusted !== baseValue) {
      metrics[mapping.metric] = adjusted;
      adjustments.push({
        metric: mapping.metric,
        before: baseValue,
        after: adjusted,
        formationValue,
        reason: mapping.reason(formationName, formationValue)
      });
    }
  });

  return { metrics, adjustments, formationBaseline, notes };
}

const HISTORICAL_METRIC_KEYS = [
  "widthScore",
  "pressScore",
  "balanceScore",
  "restDefenseScore",
  "buildUpScore",
  "depthScore"
];

// Hvor godt de eksisterende metrikkene allerede ligner formasjonens baseline.
// Mindre gjennomsnittlig avvik gir høyere alignment (0-100).
function calculateMetricAlignment(baseMetrics, formationBaseline) {
  if (!formationBaseline) {
    return 60;
  }

  const diffs = HISTORICAL_METRIC_KEYS.map((key) =>
    Math.abs(num(baseMetrics?.[key] ?? 50) - num(formationBaseline[key]))
  );
  const avgDiff = diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
  return clamp(Math.round(100 - avgDiff));
}

// 3) Samlet historisk formasjonsfit.
//
// coachContext (valgfri) kobler trenerapparatet inn: ansatt stab gjør treneren
// bedre til å forstå og lære systemet, og letter krevende formasjoner forsiktig.
// Staben kan IKKE dekke opp for helt feil spillertyper – misusedPlayerTypes-
// straffen står; staben hjelper bare treneren å forstå systemet. Uten
// coachContext oppfører motoren seg nøyaktig som før (bakoverkompatibel).
export function calculateHistoricalFormationFit({ assignments, baseMetrics, formation, tactic, coachContext } = {}) {
  void tactic;

  const completeAssignments = asArray(assignments).filter(
    (assignment) => assignment && assignment.role && assignment.player && assignment.slot
  );

  const roleCoverage = calculateHistoricalRoleCoverage({ assignments: completeAssignments, formation });
  const metricAdjustmentResult = calculateHistoricalMetricAdjustments({ baseMetrics, formation, roleCoverage });

  const effects = formation?.matchEngineEffects;
  const formationName = formation?.name || "systemet";
  const metricAlignment = calculateMetricAlignment(baseMetrics, metricAdjustmentResult.formationBaseline);

  // Difficulty + coachingDemand hever kravet til rolledekning. Det er et krav om
  // riktig bruk, ikke en straff for å være avansert.
  const difficulty = formation?.tacticalDifficulty;
  const coachingDemand = num(effects?.coachingDemand);
  const demand = clamp((DIFFICULTY_COVERAGE_DEMAND[difficulty] ?? 50) + coachingDemand, 0, 80);

  // Trenerstøtte (valgfri). Staben hjelper treneren å forstå et krevende system
  // og letter dekningsgapet litt – men den fjerner ikke misbruk av spillertyper.
  const coachUnderstanding = num(coachContext?.coachUnderstanding);
  const formationFamiliarity = num(coachContext?.formationFamiliarity);
  const formationDifficultyRelief = Math.max(0, num(coachContext?.formationDifficultyRelief));
  const historicalFitSupport = Math.max(0, num(coachContext?.historicalFitSupport));
  const hasCoachContext = Boolean(coachContext);

  const coverageGap = Math.max(0, demand - roleCoverage.coverageScore);
  const effectiveCoverageGap = Math.max(0, coverageGap - formationDifficultyRelief);

  // historicalScore (0-100). Bygger på rolledekning, hvor godt metrikkene matcher
  // formasjonens baseline, og om laget møter systemets krav. En gammel formasjon
  // med riktige roller kan få høy score; en moderne kompleks formasjon med feil
  // roller kan få lav score.
  let historicalScore =
    roleCoverage.coverageScore * 0.55 +
    metricAlignment * 0.3 +
    60 * 0.15;
  historicalScore -= effectiveCoverageGap * 0.4;
  historicalScore += roleCoverage.preferredBonus;
  historicalScore -= roleCoverage.misusePenalty * 0.5;
  if (hasCoachContext) {
    // Forsiktig trenerløft: god forståelse/tilvenning gjør systemet mer spillbart.
    historicalScore += (coachUnderstanding - 50) * 0.08;
    historicalScore += (formationFamiliarity - 50) * 0.07;
    historicalScore += historicalFitSupport * 0.05;
  }
  historicalScore = clamp(Math.round(historicalScore));

  // historicalBonus (0-8): god rolledekning + god match mellom metrics og effects.
  let bonus = 0;
  if (roleCoverage.coverageScore >= 75) {
    bonus += 4;
  } else if (roleCoverage.coverageScore >= 65) {
    bonus += 2;
  }
  if (metricAlignment >= 70) {
    bonus += 2;
  }
  bonus += Math.min(2, roleCoverage.preferredBonus / 4);
  const historicalBonus = clamp(Math.round(bonus), 0, 8);

  // historicalPenalty (0-15): dårlig rolledekning, mange misusedPlayerTypes og
  // høy tacticalDifficulty uten dekning.
  let penalty = 0;
  // Trenerstøtten letter dekningsgapet, men ikke misbruk av spillertyper.
  penalty += Math.min(8, effectiveCoverageGap * 0.18);
  penalty += Math.min(6, roleCoverage.misusePenalty * 0.4);
  if (roleCoverage.coverageScore < 45) {
    penalty += 3;
  }
  if (hasCoachContext) {
    penalty -= Math.min(5, formationDifficultyRelief * 0.35);
  }
  const historicalPenalty = clamp(Math.round(penalty), 0, 15);

  // Hvilke hgRoleTypes laget faktisk bruker (for libero-/sweeper-vurdering).
  const usedHgRoleTypes = new Set();
  completeAssignments.forEach((assignment) => {
    mapLegacyRoleToHgRoleTypes(assignment.role.id).forEach((id) => usedHgRoleTypes.add(id));
  });

  const roleRequirements = asArray(formation?.roleRequirements);
  const requiresLibero =
    roleRequirements.some((id) => LIBERO_ROLE_TYPES.includes(id)) ||
    /catenaccio|libero|verrou/i.test(`${formation?.id || ""} ${formation?.tacticalSchool || ""}`);
  const hasLibero = LIBERO_ROLE_TYPES.some((id) => usedHgRoleTypes.has(id));

  const baseline = metricAdjustmentResult.formationBaseline;

  const strengths = [];
  const issues = [];

  if (roleCoverage.requiredMatched.length > 0 && roleCoverage.coverageScore >= 70) {
    strengths.push("Formasjonen får frem nøkkelrollene sine.");
  }

  if (baseline && num(baseline.restDefenseScore) >= 65 && num(baseMetrics?.restDefenseScore) >= num(baseline.restDefenseScore) - 6) {
    strengths.push("Restforsvaret matcher systemets krav.");
  } else if (baseline && num(baseline.restDefenseScore) >= 65 && num(baseMetrics?.restDefenseScore) < num(baseline.restDefenseScore) - 10) {
    issues.push("Systemet krever høyere restforsvar enn laget viser.");
  }

  if (baseline && num(baseline.widthScore) >= 70 && num(baseMetrics?.widthScore) >= num(baseline.widthScore) - 8) {
    strengths.push(`Laget bruker bredden slik ${formationName} trenger.`);
  }

  if (baseline && num(baseline.buildUpScore) >= 70 && num(baseMetrics?.buildUpScore) >= num(baseline.buildUpScore) - 8) {
    strengths.push("Laget får nok sentral kontroll til systemet.");
  }

  if (requiresLibero && hasLibero) {
    strengths.push(`Libero-/sweeperrollen støtter ${formationName}-strukturen.`);
  } else if (requiresLibero && !hasLibero) {
    issues.push("Catenaccio/libero uten libero/man-marker mister mye av poenget.");
  }

  if (roleCoverage.requiredMissing.length > 0) {
    issues.push(
      roleCoverage.requiredMissing.length === 1
        ? "Formasjonen mangler en nøkkelrolle."
        : "Formasjonen mangler flere nøkkelroller."
    );
  }

  if ((difficulty === "high" || difficulty === "very_high") && roleCoverage.coverageScore < 55) {
    issues.push("Dette er en kompleks formasjon uten nok rolledekning.");
  }

  if (roleCoverage.misusedMatched.length > 0) {
    issues.push("Systemet brukes med spillertyper det historisk svekker.");
  }

  // Trenerstøtte: flett inn forsiktige styrker/problemer fra coachContext, uten
  // å overstyre rolledekningens egne vurderinger.
  if (hasCoachContext) {
    const demanding = difficulty === "high" || difficulty === "very_high";
    if (coachUnderstanding >= 62 && demanding) {
      strengths.push("Trenerteamet hjelper laget å forstå den krevende formasjonen.");
    }
    if (formationFamiliarity >= 60 && (coachContext.staffCount || 0) > 0) {
      strengths.push("Staben øker formasjonstilvenningen.");
    }
    if (num(coachContext.roleFitClarity) >= 60) {
      strengths.push("Assistent/trenere gir systemet bedre rolleforståelse.");
    }
    if (demanding && coachUnderstanding < 52) {
      issues.push("Formasjonen er taktisk krevende, men trenerteamet gir foreløpig lite støtte.");
    }
    if (demanding && formationFamiliarity < 50) {
      issues.push("Laget mangler formasjonstilvenning til dette systemet.");
    }
  }

  const notes = [...metricAdjustmentResult.notes];
  if (roleCoverage.requiredCount === 0) {
    notes.push("Formasjonen har ingen registrerte rollekrav; historisk vurdering er nøytral.");
  }

  return {
    roleCoverage,
    metricAdjustmentResult,
    historicalScore,
    historicalBonus,
    historicalPenalty,
    strengths,
    issues,
    notes
  };
}

// 4) Forklarende rapporttekst.
//
// Bygger en kort historisk rapportdel som lagrapporten kan flette inn uten ny
// UI-struktur. Returnerer { strengths, issues, notes } med de viktigste punktene.
export function buildHistoricalFormationReport({ historicalFormationFit, formation } = {}) {
  if (!historicalFormationFit) {
    return { strengths: [], issues: [], notes: [] };
  }

  const roleCoverage = historicalFormationFit.roleCoverage || {};
  const formationName = formation?.name || "systemet";
  const difficulty = formation?.tacticalDifficulty;

  const strengths = [...asArray(historicalFormationFit.strengths)];
  const issues = [...asArray(historicalFormationFit.issues)];
  const notes = [...asArray(historicalFormationFit.notes)];

  // Tydelig setning når en gammel formasjon faktisk fungerer fordi rollene passer.
  if ((roleCoverage.coverageScore ?? 0) >= 75 && asArray(roleCoverage.requiredMatched).length > 0) {
    strengths.push(`${formationName} fungerer her fordi laget faktisk dekker nøkkelrollene systemet bygger på.`);
  }

  // Tydelig setning når et krevende system mangler rolledekning – uten å kalle
  // formasjonen svak.
  if ((difficulty === "high" || difficulty === "very_high") && (roleCoverage.coverageScore ?? 60) < 55) {
    issues.push(
      `${formationName} er ikke en svak formasjon; laget får bare ikke frem nøkkelprinsippene den krever ennå.`
    );
  }

  return { strengths, issues, notes };
}
