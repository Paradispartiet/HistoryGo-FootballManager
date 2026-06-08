// src/engine/analyzeWeakPoints.ts

import type {
  PlayerRoleFitResult,
  Score100,
} from "../domain/footballTypes.js";

import type {
  TeamSetupEvaluation,
} from "./evaluateTeamSetup.js";

export type WeakPointCategory =
  | "completion"
  | "role_fit"
  | "team_balance"
  | "attack"
  | "defence"
  | "midfield"
  | "pressing"
  | "width"
  | "risk";

export type WeakPointSeverity =
  | "low"
  | "medium"
  | "high";

export type WeakPoint = {
  code: string;
  category: WeakPointCategory;
  severity: WeakPointSeverity;
  score: Score100;
  label: string;
  rationale: string;
  suggestedAction: string;
  relatedPlayerIds: string[];
};

export type WeakPointAnalysis = {
  teamId: string;
  tacticId: string;

  weakPoints: WeakPoint[];
  highPriorityWeakPoints: WeakPoint[];
  mediumPriorityWeakPoints: WeakPoint[];
  lowPriorityWeakPoints: WeakPoint[];

  mainWeakPoint: WeakPoint | null;

  summary: string;
};

const HIGH_WEAKNESS_LIMIT = 55;
const MEDIUM_WEAKNESS_LIMIT = 65;
const LOW_WEAKNESS_LIMIT = 72;

function clampScore(value: number): Score100 {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[], fallback = 0): Score100 {
  if (values.length === 0) return fallback;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getSeverity(score: Score100): WeakPointSeverity {
  if (score < HIGH_WEAKNESS_LIMIT) {
    return "high";
  }

  if (score < MEDIUM_WEAKNESS_LIMIT) {
    return "medium";
  }

  return "low";
}

function addWeakPoint(
  weakPoints: WeakPoint[],
  weakPoint: WeakPoint,
): void {
  weakPoints.push(weakPoint);
}

function getAverageRoleFit(roleFitResults: PlayerRoleFitResult[]): Score100 {
  return average(roleFitResults.map((result) => result.finalFit), 0);
}

function getWorstPlayerIds(roleFitResults: PlayerRoleFitResult[], limit = 3): string[] {
  return [...roleFitResults]
    .sort((a, b) => a.finalFit - b.finalFit)
    .slice(0, limit)
    .map((result) => result.playerId);
}

function analyzeCompletion(
  evaluation: TeamSetupEvaluation,
  weakPoints: WeakPoint[],
): void {
  if (evaluation.isComplete) {
    return;
  }

  const missingCount = evaluation.totalAssignmentCount - evaluation.validAssignmentCount;

  addWeakPoint(weakPoints, {
    code: "incomplete_setup",
    category: "completion",
    severity: "high",
    score: 0,
    label: "Startelleveren er ikke komplett.",
    rationale: `Oppsettet har ${evaluation.validAssignmentCount}/${evaluation.totalAssignmentCount} gyldige rolleplasseringer.`,
    suggestedAction: "Fullfør alle elleve spiller-/rolleplasseringer før taktikken vurderes som endelig.",
    relatedPlayerIds: [],
  });

  if (evaluation.missingAssignments.length > 0 || missingCount > 0) {
    addWeakPoint(weakPoints, {
      code: "missing_assignments",
      category: "completion",
      severity: "high",
      score: 0,
      label: "Noen rolleplasseringer mangler gyldig spiller eller rolle.",
      rationale: "Motoren kan bare beregne full lagbalanse når alle rolleplasseringer peker til eksisterende spillere og roller.",
      suggestedAction: "Rett manglende playerId eller roleId i taktikkens roleAssignments.",
      relatedPlayerIds: evaluation.missingAssignments.map((assignment) => assignment.playerId),
    });
  }
}

function analyzeRoleFit(
  evaluation: TeamSetupEvaluation,
  weakPoints: WeakPoint[],
): void {
  const averageRoleFit = getAverageRoleFit(evaluation.roleFitResults);

  if (averageRoleFit > 0 && averageRoleFit < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "average_role_fit_weak",
      category: "role_fit",
      severity: getSeverity(averageRoleFit),
      score: averageRoleFit,
      label: "Samlet rollefit er svak.",
      rationale: "Flere spillere ser ut til å brukes i roller som ikke fullt ut får frem styrkene deres.",
      suggestedAction: "Se på de svakeste individuelle rollefitene først, og vurder alternative roller i samme posisjon.",
      relatedPlayerIds: getWorstPlayerIds(evaluation.roleFitResults),
    });
  }

  const weakIndividualFits = evaluation.roleFitResults.filter((result) => result.finalFit < MEDIUM_WEAKNESS_LIMIT);

  if (weakIndividualFits.length > 0) {
    addWeakPoint(weakPoints, {
      code: "individual_role_fit_weak",
      category: "role_fit",
      severity: "medium",
      score: average(weakIndividualFits.map((result) => result.finalFit), 0),
      label: "Én eller flere spillere har svak individuell rollefit.",
      rationale: "Disse spillerne kan fortsatt være gode, men trenerens rollevalg skjuler for mye av kvaliteten deres.",
      suggestedAction: "Test alternative roller for spillerne med lavest finalFit.",
      relatedPlayerIds: weakIndividualFits.map((result) => result.playerId),
    });
  }
}

function analyzeTeamBalance(
  evaluation: TeamSetupEvaluation,
  weakPoints: WeakPoint[],
): void {
  const balance = evaluation.teamBalance;

  if (balance.finalBalance < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "team_balance_weak",
      category: "team_balance",
      severity: getSeverity(balance.finalBalance),
      score: balance.finalBalance,
      label: "Lagbalansen er svak.",
      rationale: "Laget fungerer ikke godt nok som struktur, selv om enkeltspillere kan ha høy kvalitet.",
      suggestedAction: "Se etter konflikt mellom mentalitet, risiko, presshøyde, bredde og sikring.",
      relatedPlayerIds: [],
    });
  }

  if (balance.attackingBalance < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "attacking_balance_weak",
      category: "attack",
      severity: getSeverity(balance.attackingBalance),
      score: balance.attackingBalance,
      label: "Angrepsbalansen er svak.",
      rationale: "Laget mangler enten skapere, løpstrusler, avsluttere eller tydelig sammenheng mellom dem.",
      suggestedAction: "Sørg for at laget har minst én skaper, én romangriper og én tydelig avslutterrolle.",
      relatedPlayerIds: [],
    });
  }

  if (balance.defensiveBalance < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "defensive_balance_weak",
      category: "defence",
      severity: getSeverity(balance.defensiveBalance),
      score: balance.defensiveBalance,
      label: "Forsvarsbalansen er svak.",
      rationale: "Laget har for lite sikring, for høy risiko eller for svak beskyttelse rundt forsvarslinjen.",
      suggestedAction: "Legg inn tydeligere sikringsrolle, balanserende sekser eller tryggere forsvarsrolle.",
      relatedPlayerIds: [],
    });
  }

  if (balance.midfieldControl < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "midfield_control_weak",
      category: "midfield",
      severity: getSeverity(balance.midfieldControl),
      score: balance.midfieldControl,
      label: "Midtbanekontrollen er svak.",
      rationale: "Laget får for lite kontroll i sentrale rom, enten i oppbygging, tempo eller duellspill.",
      suggestedAction: "Vurder tempo-kontrollør, dyp playmaker, ballvinner eller tydeligere rollefordeling sentralt.",
      relatedPlayerIds: [],
    });
  }

  if (balance.pressingCoherence < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "pressing_coherence_weak",
      category: "pressing",
      severity: getSeverity(balance.pressingCoherence),
      score: balance.pressingCoherence,
      label: "Presset henger dårlig sammen.",
      rationale: "Presshøyde, spillerkapasitet og roller peker ikke tydelig nok i samme retning.",
      suggestedAction: "Enten senk presshøyden eller legg inn flere roller som faktisk kan presse høyt.",
      relatedPlayerIds: [],
    });
  }

  if (balance.widthBalance < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "width_balance_weak",
      category: "width",
      severity: getSeverity(balance.widthBalance),
      score: balance.widthBalance,
      label: "Breddestrukturen er svak.",
      rationale: "Laget har ikke nok samsvar mellom taktisk bredde og rollene som faktisk holder eller skaper bredde.",
      suggestedAction: "Bruk bred kant, overlappende back eller smalere taktikk dersom rollene søker innover.",
      relatedPlayerIds: [],
    });
  }

  if (balance.riskBalance < LOW_WEAKNESS_LIMIT) {
    addWeakPoint(weakPoints, {
      code: "risk_balance_weak",
      category: "risk",
      severity: getSeverity(balance.riskBalance),
      score: balance.riskBalance,
      label: "Risikonivået er dårlig balansert.",
      rationale: "For mange roller kan ta risiko samtidig uten nok dekning bak.",
      suggestedAction: "Reduser én aggressiv rolle eller legg inn en tydelig balanse-/sikringsrolle.",
      relatedPlayerIds: [],
    });
  }
}

function sortWeakPoints(weakPoints: WeakPoint[]): WeakPoint[] {
  const severityRank: Record<WeakPointSeverity, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...weakPoints].sort((a, b) => {
    const severityDiff = severityRank[b.severity] - severityRank[a.severity];

    if (severityDiff !== 0) {
      return severityDiff;
    }

    return a.score - b.score;
  });
}

function buildSummary(weakPoints: WeakPoint[]): string {
  const highCount = weakPoints.filter((weakPoint) => weakPoint.severity === "high").length;
  const mediumCount = weakPoints.filter((weakPoint) => weakPoint.severity === "medium").length;

  if (highCount > 0) {
    return `Svakhetanalysen fant ${highCount} alvorlige problem(er) i oppsettet. Disse bør løses før finjustering.`;
  }

  if (mediumCount > 0) {
    return `Svakhetanalysen fant ${mediumCount} tydelige forbedringspunkt(er). Laget fungerer, men treneren bør justere strukturen.`;
  }

  if (weakPoints.length > 0) {
    return "Svakhetanalysen fant bare mindre justeringspunkter. Oppsettet virker i hovedsak stabilt.";
  }

  return "Svakhetanalysen fant ingen tydelige svakheter i denne vurderingen.";
}

export function analyzeWeakPoints(evaluation: TeamSetupEvaluation): WeakPointAnalysis {
  const weakPoints: WeakPoint[] = [];

  analyzeCompletion(evaluation, weakPoints);
  analyzeRoleFit(evaluation, weakPoints);
  analyzeTeamBalance(evaluation, weakPoints);

  const sortedWeakPoints = sortWeakPoints(weakPoints);

  const highPriorityWeakPoints = sortedWeakPoints.filter((weakPoint) => weakPoint.severity === "high");
  const mediumPriorityWeakPoints = sortedWeakPoints.filter((weakPoint) => weakPoint.severity === "medium");
  const lowPriorityWeakPoints = sortedWeakPoints.filter((weakPoint) => weakPoint.severity === "low");

  return {
    teamId: evaluation.teamId,
    tacticId: evaluation.tacticId,

    weakPoints: sortedWeakPoints,
    highPriorityWeakPoints,
    mediumPriorityWeakPoints,
    lowPriorityWeakPoints,

    mainWeakPoint: sortedWeakPoints[0] ?? null,

    summary: buildSummary(sortedWeakPoints),
  };
}
