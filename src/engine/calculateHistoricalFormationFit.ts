// src/engine/calculateHistoricalFormationFit.ts
//
// TypeScript-port av src/hg-football-historical-fit-engine.js.
//
// Gjør historiske hgFootball-formasjoner spillmessig relevante: sammenligner
// elleverens legacy-roller mot formasjonens historiske krav
// (roleRequirements/preferredPlayerTypes/misusedPlayerTypes) og lar
// formasjonens matchEngineEffects nudginge eksisterende metrikker uten å
// erstatte dem. Porten er trofast mot legacy (samme vekter, terskler og
// formler), slik at TS-motoren kan overta uten regresjon.
//
// Kjerneprinsipp: alle spillere er gode. Treneren avgjør om systemet får frem
// styrkene deres. Historiske formasjoner er ikke svakere; de er krevende på
// andre måter.

// ---------------------------------------------------------------------------
// Legacy-rolle → hgRoleType-mapping (port av mapLegacyRoleToHgRoleTypes i
// hg-football-formation-adapter.js). Holdes her for å unngå .js-interop; må
// holdes i synk med adapteren (paritetstesten vokter dette).
// ---------------------------------------------------------------------------
const LEGACY_ROLE_TO_HG: Record<string, string[]> = {
  wide_dribbler: ["classic_winger", "dribbler_forward", "outside_forward", "inside_forward"],
  inverted_winger: ["inverted_winger", "inside_forward", "wide_playmaker"],
  linking_striker: ["second_striker", "deep_lying_forward", "withdrawn_centre_forward"],
  false_nine: ["false_nine"],
  channel_runner: ["channel_runner", "poacher"],
  pressing_forward: ["pressing_forward"],
  advanced_forward: ["complete_forward", "poacher", "centre_forward"],
  target_striker: ["target_forward"],
  box_striker: ["poacher"],
  free_creator: ["attacking_midfielder", "classic_ten", "wide_playmaker"],
  classic_ten: ["classic_ten", "attacking_midfielder"],
  deep_playmaker: ["deep_lying_playmaker", "regista"],
  regista: ["regista", "deep_lying_playmaker"],
  balancing_six: ["holding_midfielder", "half_back"],
  holding_midfielder: ["holding_midfielder", "destroyer", "ball_winner"],
  box_to_box: ["box_to_box_midfielder", "mezzala", "advanced_eight"],
  pressing_midfielder: ["ball_winner", "box_to_box_midfielder", "mezzala"],
  overlapping_fullback: ["overlapping_full_back", "wing_back"],
  wingback: ["wing_back", "defensive_wing_back"],
  inverted_fullback: ["inverted_full_back"],
  support_fullback: ["traditional_full_back"],
  ball_playing_centre_back: ["ball_playing_centre_back", "wide_centre_back"],
  libero: ["libero", "libero_classic"],
  duel_centre_back: ["stopper_centre_back", "man_marker"],
  stopper: ["stopper_centre_back", "cover_centre_back"],
  sweeperkeeper: ["sweeper_keeper", "distributor_keeper"],
  line_keeper: ["line_keeper", "shot_stopper"],
};

export function mapLegacyRoleToHgRoleTypes(legacyRoleId: string): string[] {
  if (typeof legacyRoleId !== "string") {
    return [];
  }

  const aliases = LEGACY_ROLE_TO_HG[legacyRoleId] ?? [];
  return [...new Set([legacyRoleId, ...aliases])];
}

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------
export type MatchEngineEffects = Record<string, number>;

export type HistoricalFormation = {
  id?: string;
  name?: string;
  tacticalSchool?: string;
  tacticalDifficulty?: string;
  roleRequirements?: string[];
  preferredPlayerTypes?: string[];
  misusedPlayerTypes?: string[];
  matchEngineEffects?: MatchEngineEffects | null;
};

export type HistoricalAssignment = {
  slotId: string;
  playerId: string;
  roleId: string;
  roleName: string;
};

export type HistoricalCoachContext = {
  coachUnderstanding?: number;
  formationFamiliarity?: number;
  formationDifficultyRelief?: number;
  historicalFitSupport?: number;
  roleFitClarity?: number;
  staffCount?: number;
};

export type LegacyTeamMetrics = Record<string, number>;

export type HistoricalAssignmentFitTone = "positive" | "neutral" | "warning";

export type HistoricalAssignmentFit = {
  slotId: string;
  playerId: string;
  roleId: string;
  matchedRequired: string | null;
  matchedPreferred: string | null;
  matchedMisused: string | null;
  tone: HistoricalAssignmentFitTone;
  text: string;
};

export type HistoricalRoleCoverage = {
  requiredCount: number;
  requiredMatched: string[];
  requiredMissing: string[];
  preferredMatched: string[];
  misusedMatched: string[];
  coverageScore: number;
  preferredBonus: number;
  misusePenalty: number;
  assignmentHistoricalFits: HistoricalAssignmentFit[];
};

export type HistoricalMetricAdjustment = {
  metric: string;
  before: number;
  after: number;
  formationValue: number;
  reason: string;
};

export type HistoricalMetricAdjustmentResult = {
  metrics: LegacyTeamMetrics;
  adjustments: HistoricalMetricAdjustment[];
  formationBaseline: Record<string, number> | null;
  notes: string[];
};

export type HistoricalFormationFit = {
  roleCoverage: HistoricalRoleCoverage;
  metricAdjustmentResult: HistoricalMetricAdjustmentResult;
  historicalScore: number;
  historicalBonus: number;
  historicalPenalty: number;
  strengths: string[];
  issues: string[];
  notes: string[];
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function num(value: unknown): number {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

// matchEngineEffects er 0-10 per dimensjon. Oversett til de gamle 0-100-skalaene.
function effectToScore(value: unknown): number {
  return clamp(Math.round(num(value) * 10));
}

const LIBERO_ROLE_TYPES = ["libero", "libero_classic"];

const DIFFICULTY_COVERAGE_DEMAND: Record<string, number> = {
  low: 35,
  medium: 50,
  high: 62,
  very_high: 72,
};

function buildAssignmentRoleMaps(completeAssignments: HistoricalAssignment[]): {
  assignmentMaps: { assignment: HistoricalAssignment; hgIds: Set<string> }[];
  usedHgRoleTypes: Set<string>;
} {
  const usedHgRoleTypes = new Set<string>();

  const assignmentMaps = completeAssignments.map((assignment) => {
    const hgIds = new Set(mapLegacyRoleToHgRoleTypes(assignment.roleId));
    hgIds.forEach((id) => usedHgRoleTypes.add(id));
    return { assignment, hgIds };
  });

  return { assignmentMaps, usedHgRoleTypes };
}

// ---------------------------------------------------------------------------
// 1) Historisk rolledekning.
// ---------------------------------------------------------------------------
export function calculateHistoricalRoleCoverage(input: {
  assignments?: HistoricalAssignment[];
  formation?: HistoricalFormation;
}): HistoricalRoleCoverage {
  const { assignments, formation } = input;
  const completeAssignments = asArray(assignments);

  const roleRequirements = asArray(formation?.roleRequirements);
  const preferredTypes = asArray(formation?.preferredPlayerTypes);
  const misusedTypes = asArray(formation?.misusedPlayerTypes);

  const { assignmentMaps } = buildAssignmentRoleMaps(completeAssignments);

  const requiredMatched: string[] = [];
  const requiredMissing: string[] = [];
  roleRequirements.forEach((requirement) => {
    const covered = assignmentMaps.some((entry) => entry.hgIds.has(requirement));
    if (covered) {
      requiredMatched.push(requirement);
    } else {
      requiredMissing.push(requirement);
    }
  });

  const preferredMatched = preferredTypes.filter((type) =>
    assignmentMaps.some((entry) => entry.hgIds.has(type)),
  );
  const misusedMatched = misusedTypes.filter((type) =>
    assignmentMaps.some((entry) => entry.hgIds.has(type)),
  );

  const requiredCount = roleRequirements.length;

  let coverageScore = 60;
  if (requiredCount > 0) {
    const ratio = requiredMatched.length / requiredCount;
    coverageScore = Math.round(38 + ratio * 57);
  }

  let preferredBonus = 0;
  if (preferredTypes.length > 0) {
    preferredBonus = Math.round(Math.min(8, (preferredMatched.length / preferredTypes.length) * 8));
  }

  const misusePenalty = Math.min(20, misusedMatched.length * 7);

  const formationName = formation?.name || "systemet";

  const assignmentHistoricalFits: HistoricalAssignmentFit[] = assignmentMaps.map((entry) => {
    const { assignment, hgIds } = entry;
    const matchedRequired = roleRequirements.find((id) => hgIds.has(id)) ?? null;
    const matchedPreferred = preferredTypes.find((id) => hgIds.has(id)) ?? null;
    const matchedMisused = misusedTypes.find((id) => hgIds.has(id)) ?? null;

    let tone: HistoricalAssignmentFitTone = "neutral";
    let text = `Ingen direkte historisk rollekrav registrert for ${assignment.roleName}.`;

    if (matchedRequired) {
      tone = "positive";
      text = `Rollen dekker systemets nøkkelkrav: ${assignment.roleName} er sentral i ${formationName}.`;
    } else if (matchedMisused) {
      tone = "warning";
      text = `Mulig feilbruk: ${assignment.roleName} mister ofte verdi i ${formationName}.`;
    } else if (matchedPreferred) {
      tone = "positive";
      text = `Rollen løfter systemet: ${assignment.roleName} passer ${formationName}.`;
    }

    return {
      slotId: assignment.slotId,
      playerId: assignment.playerId,
      roleId: assignment.roleId,
      matchedRequired,
      matchedPreferred,
      matchedMisused,
      tone,
      text,
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
    assignmentHistoricalFits,
  };
}

// ---------------------------------------------------------------------------
// 2) Forsiktig metrikkjustering.
// ---------------------------------------------------------------------------
type MetricEffectMapping = {
  metric: string;
  baseline: (effects: MatchEngineEffects) => number;
  reason: (name: string, value: number) => string;
};

const METRIC_EFFECT_MAP: MetricEffectMapping[] = [
  {
    metric: "widthScore",
    baseline: (effects) => effectToScore(effects.attackingWidth),
    reason: (name, value) => `Bredde justert av ${name}: systemets breddekrav (${value}) drar laget mot riktig breddebruk.`,
  },
  {
    metric: "pressScore",
    baseline: (effects) => effectToScore(effects.pressingIntensity),
    reason: (name, value) => `Press justert av ${name}: systemets pressintensitet (${value}) styrer pressuttellingen.`,
  },
  {
    metric: "balanceScore",
    baseline: (effects) => effectToScore((num(effects.defensiveSecurity) + num(effects.restDefenceSecurity)) / 2),
    reason: (name, value) => `Balanse justert av ${name}: defensiv sikkerhet og restforsvar (${value}) veies inn.`,
  },
  {
    metric: "restDefenseScore",
    baseline: (effects) => effectToScore(effects.restDefenceSecurity ?? effects.defensiveSecurity),
    reason: (name, value) => `Restforsvar justert av ${name}: systemet krever restforsvarssikkerhet (${value}).`,
  },
  {
    metric: "buildUpScore",
    baseline: (effects) => effectToScore((num(effects.centralControl) + num(effects.creativityDemand)) / 2),
    reason: (name, value) => `Oppbygging justert av ${name}: sentral kontroll og kreativitetskrav (${value}) veies inn.`,
  },
  {
    metric: "depthScore",
    baseline: (effects) => effectToScore(effects.transitionThreat),
    reason: (name, value) => `Dybde justert av ${name}: systemets overgangstrussel (${value}) påvirker dybdescoren.`,
  },
];

export function calculateHistoricalMetricAdjustments(input: {
  baseMetrics?: LegacyTeamMetrics;
  formation?: HistoricalFormation;
  roleCoverage?: HistoricalRoleCoverage;
}): HistoricalMetricAdjustmentResult {
  const { baseMetrics, formation, roleCoverage } = input;
  const metrics: LegacyTeamMetrics = { ...(baseMetrics || {}) };
  const adjustments: HistoricalMetricAdjustment[] = [];
  const notes: string[] = [];
  const effects = formation?.matchEngineEffects;

  if (!effects || typeof effects !== "object") {
    notes.push("Formasjonen mangler matchEngineEffects; metrics justeres ikke historisk.");
    return { metrics, adjustments, formationBaseline: null, notes };
  }

  const formationName = formation?.name || "formasjonen";
  const coverageScore = clamp(roleCoverage?.coverageScore ?? 60);

  const quality = 0.5 + 0.5 * (coverageScore / 100);

  const formationBaseline: Record<string, number> = {};

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
        reason: mapping.reason(formationName, formationValue),
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
  "depthScore",
];

function calculateMetricAlignment(
  baseMetrics: LegacyTeamMetrics | undefined,
  formationBaseline: Record<string, number> | null,
): number {
  if (!formationBaseline) {
    return 60;
  }

  const diffs = HISTORICAL_METRIC_KEYS.map((key) =>
    Math.abs(num(baseMetrics?.[key] ?? 50) - num(formationBaseline[key])),
  );
  const avgDiff = diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
  return clamp(Math.round(100 - avgDiff));
}

// ---------------------------------------------------------------------------
// 3) Samlet historisk formasjonsfit.
// ---------------------------------------------------------------------------
export function calculateHistoricalFormationFit(input: {
  assignments?: HistoricalAssignment[];
  baseMetrics?: LegacyTeamMetrics;
  formation?: HistoricalFormation;
  tactic?: unknown;
  coachContext?: HistoricalCoachContext | null;
}): HistoricalFormationFit {
  const { assignments, baseMetrics, formation, coachContext } = input;

  const completeAssignments = asArray(assignments);

  const roleCoverage = calculateHistoricalRoleCoverage({
    assignments: completeAssignments,
    ...(formation !== undefined ? { formation } : {}),
  });
  const metricAdjustmentResult = calculateHistoricalMetricAdjustments({
    roleCoverage,
    ...(baseMetrics !== undefined ? { baseMetrics } : {}),
    ...(formation !== undefined ? { formation } : {}),
  });

  const effects = formation?.matchEngineEffects;
  const formationName = formation?.name || "systemet";
  const metricAlignment = calculateMetricAlignment(baseMetrics, metricAdjustmentResult.formationBaseline);

  const difficulty = formation?.tacticalDifficulty;
  const coachingDemand = num(effects?.coachingDemand);
  const demand = clamp((DIFFICULTY_COVERAGE_DEMAND[difficulty ?? ""] ?? 50) + coachingDemand, 0, 80);

  const coachUnderstanding = num(coachContext?.coachUnderstanding);
  const formationFamiliarity = num(coachContext?.formationFamiliarity);
  const formationDifficultyRelief = Math.max(0, num(coachContext?.formationDifficultyRelief));
  const historicalFitSupport = Math.max(0, num(coachContext?.historicalFitSupport));
  const hasCoachContext = Boolean(coachContext);

  const coverageGap = Math.max(0, demand - roleCoverage.coverageScore);
  const effectiveCoverageGap = Math.max(0, coverageGap - formationDifficultyRelief);

  let historicalScore =
    roleCoverage.coverageScore * 0.55 +
    metricAlignment * 0.3 +
    60 * 0.15;
  historicalScore -= effectiveCoverageGap * 0.4;
  historicalScore += roleCoverage.preferredBonus;
  historicalScore -= roleCoverage.misusePenalty * 0.5;
  if (hasCoachContext) {
    historicalScore += (coachUnderstanding - 50) * 0.08;
    historicalScore += (formationFamiliarity - 50) * 0.07;
    historicalScore += historicalFitSupport * 0.05;
  }
  historicalScore = clamp(Math.round(historicalScore));

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

  let penalty = 0;
  penalty += Math.min(8, effectiveCoverageGap * 0.18);
  penalty += Math.min(6, roleCoverage.misusePenalty * 0.4);
  if (roleCoverage.coverageScore < 45) {
    penalty += 3;
  }
  if (hasCoachContext) {
    penalty -= Math.min(5, formationDifficultyRelief * 0.35);
  }
  const historicalPenalty = clamp(Math.round(penalty), 0, 15);

  const usedHgRoleTypes = new Set<string>();
  completeAssignments.forEach((assignment) => {
    mapLegacyRoleToHgRoleTypes(assignment.roleId).forEach((id) => usedHgRoleTypes.add(id));
  });

  const roleRequirements = asArray(formation?.roleRequirements);
  const requiresLibero =
    roleRequirements.some((id) => LIBERO_ROLE_TYPES.includes(id)) ||
    /catenaccio|libero|verrou/i.test(`${formation?.id || ""} ${formation?.tacticalSchool || ""}`);
  const hasLibero = LIBERO_ROLE_TYPES.some((id) => usedHgRoleTypes.has(id));

  const baseline = metricAdjustmentResult.formationBaseline;

  const strengths: string[] = [];
  const issues: string[] = [];

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
        : "Formasjonen mangler flere nøkkelroller.",
    );
  }

  if ((difficulty === "high" || difficulty === "very_high") && roleCoverage.coverageScore < 55) {
    issues.push("Dette er en kompleks formasjon uten nok rolledekning.");
  }

  if (roleCoverage.misusedMatched.length > 0) {
    issues.push("Systemet brukes med spillertyper det historisk svekker.");
  }

  if (hasCoachContext && coachContext) {
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
    notes,
  };
}

// ---------------------------------------------------------------------------
// 4) Forklarende rapporttekst.
// ---------------------------------------------------------------------------
export function buildHistoricalFormationReport(input: {
  historicalFormationFit?: HistoricalFormationFit | null;
  formation?: HistoricalFormation;
}): { strengths: string[]; issues: string[]; notes: string[] } {
  const { historicalFormationFit, formation } = input;

  if (!historicalFormationFit) {
    return { strengths: [], issues: [], notes: [] };
  }

  const roleCoverage = historicalFormationFit.roleCoverage;
  const formationName = formation?.name || "systemet";
  const difficulty = formation?.tacticalDifficulty;

  const strengths = [...asArray(historicalFormationFit.strengths)];
  const issues = [...asArray(historicalFormationFit.issues)];
  const notes = [...asArray(historicalFormationFit.notes)];

  if ((roleCoverage.coverageScore ?? 0) >= 75 && asArray(roleCoverage.requiredMatched).length > 0) {
    strengths.push(`${formationName} fungerer her fordi laget faktisk dekker nøkkelrollene systemet bygger på.`);
  }

  if ((difficulty === "high" || difficulty === "very_high") && (roleCoverage.coverageScore ?? 60) < 55) {
    issues.push(
      `${formationName} er ikke en svak formasjon; laget får bare ikke frem nøkkelprinsippene den krever ennå.`,
    );
  }

  return { strengths, issues, notes };
}
