// src/engine/createTeamSetupReport.ts

import type {
  FitReason,
  PlayerRoleFitResult,
  Score100,
  TeamBalanceResult,
} from "../domain/footballTypes.js";

import type {
  TeamSetupEvaluation,
  TeamSetupIssue,
} from "./evaluateTeamSetup.js";

export type TeamSetupReportLevel =
  | "elite"
  | "good"
  | "unstable"
  | "poor";

export type TeamSetupReportSeverity =
  | "positive"
  | "neutral"
  | "warning"
  | "critical";

export type PlayerFitReportStatus =
  | "svært_sterk_fit"
  | "god_fit"
  | "brukbar_fit"
  | "svak_fit";

export type PlayerFitReport = {
  playerId: string;
  roleId: string;
  position: string;
  finalFit: Score100;
  status: PlayerFitReportStatus;
  keyReasons: string[];
};

export type BalanceReportItem = {
  code: string;
  label: string;
  score: Score100;
  severity: TeamSetupReportSeverity;
};

export type TeamBalanceReport = {
  finalBalance: Score100;
  items: BalanceReportItem[];
  keyReasons: string[];
};

export type CoachAdvicePriority = 1 | 2 | 3;

export type CoachAdvice = {
  code: string;
  priority: CoachAdvicePriority;
  label: string;
  rationale: string;
};

export type TeamSetupReport = {
  teamId: string;
  tacticId: string;

  setupScore: Score100;
  level: TeamSetupReportLevel;

  overallSummary: string;

  keyStrengths: string[];
  keyProblems: string[];

  bestPlayers: PlayerFitReport[];
  problemPlayers: PlayerFitReport[];

  balanceOverview: TeamBalanceReport;

  coachAdvice: CoachAdvice[];

  rawIssues: TeamSetupIssue[];
};

const ELITE_SCORE = 85;
const GOOD_SCORE = 75;
const STABLE_SCORE = 65;
const LOW_SCORE = 60;
const STRONG_FIT = 85;
const GOOD_FIT = 75;
const USABLE_FIT = 65;

function clampScore(value: number): Score100 {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[], fallback = 0): Score100 {
  if (values.length === 0) return fallback;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getAverageRoleFit(evaluation: TeamSetupEvaluation): Score100 {
  return average(evaluation.roleFitResults.map((result) => result.finalFit), 0);
}

function getKeyReasons(reasons: FitReason[], limit: number): string[] {
  return [...reasons]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, limit)
    .map((reason) => reason.label);
}

function getReportLevel(evaluation: TeamSetupEvaluation): TeamSetupReportLevel {
  const hasCriticalIssue = evaluation.issues.some((issue) => issue.severity === "critical");

  if (hasCriticalIssue) {
    return "poor";
  }

  if (evaluation.setupScore >= ELITE_SCORE) {
    return "elite";
  }

  if (evaluation.setupScore >= GOOD_SCORE) {
    return "good";
  }

  if (evaluation.setupScore >= STABLE_SCORE) {
    return "unstable";
  }

  return "poor";
}

function getMetricSeverity(score: Score100): TeamSetupReportSeverity {
  if (score >= GOOD_SCORE) {
    return "positive";
  }

  if (score < LOW_SCORE) {
    return "warning";
  }

  return "neutral";
}

function getPlayerFitStatus(finalFit: Score100): PlayerFitReportStatus {
  if (finalFit >= STRONG_FIT) {
    return "svært_sterk_fit";
  }

  if (finalFit >= GOOD_FIT) {
    return "god_fit";
  }

  if (finalFit >= USABLE_FIT) {
    return "brukbar_fit";
  }

  return "svak_fit";
}

function toPlayerFitReport(result: PlayerRoleFitResult): PlayerFitReport {
  return {
    playerId: result.playerId,
    roleId: result.roleId,
    position: result.position,
    finalFit: result.finalFit,
    status: getPlayerFitStatus(result.finalFit),
    keyReasons: getKeyReasons(result.reasons, 3),
  };
}

function buildBalanceOverview(teamBalance: TeamBalanceResult): TeamBalanceReport {
  const items: BalanceReportItem[] = [
    {
      code: "attacking_balance",
      label: "Angrepsbalanse",
      score: teamBalance.attackingBalance,
      severity: getMetricSeverity(teamBalance.attackingBalance),
    },
    {
      code: "defensive_balance",
      label: "Forsvarsbalanse",
      score: teamBalance.defensiveBalance,
      severity: getMetricSeverity(teamBalance.defensiveBalance),
    },
    {
      code: "midfield_control",
      label: "Midtbanekontroll",
      score: teamBalance.midfieldControl,
      severity: getMetricSeverity(teamBalance.midfieldControl),
    },
    {
      code: "pressing_coherence",
      label: "Press-sammenheng",
      score: teamBalance.pressingCoherence,
      severity: getMetricSeverity(teamBalance.pressingCoherence),
    },
    {
      code: "width_balance",
      label: "Breddestruktur",
      score: teamBalance.widthBalance,
      severity: getMetricSeverity(teamBalance.widthBalance),
    },
    {
      code: "risk_balance",
      label: "Risikobalanse",
      score: teamBalance.riskBalance,
      severity: getMetricSeverity(teamBalance.riskBalance),
    },
  ];

  return {
    finalBalance: teamBalance.finalBalance,
    items,
    keyReasons: getKeyReasons(teamBalance.reasons, 6),
  };
}

function buildOverallSummary(
  evaluation: TeamSetupEvaluation,
  level: TeamSetupReportLevel,
  averageRoleFit: Score100,
): string {
  if (!evaluation.isComplete) {
    return "Startelleveren er ikke komplett. Rapporten kan lese deler av oppsettet, men vurderingen bør ikke brukes som endelig manageranalyse før alle elleve plasser er gyldige.";
  }

  if (level === "elite") {
    return `Laget er svært godt satt opp. Setup-score er ${evaluation.setupScore}, samlet rollefit er ${averageRoleFit}, og lagbalansen peker tydelig i samme retning som rollebruken.`;
  }

  if (level === "good") {
    return `Laget er godt satt opp. Setup-score er ${evaluation.setupScore}. Rollenivået og lagbalansen fungerer, men noen detaljer kan fortsatt forbedres.`;
  }

  if (level === "unstable") {
    return `Laget fungerer, men oppsettet er ustabilt. Setup-score er ${evaluation.setupScore}. Det finnes nok kvalitet, men treneren bør justere rollebruk, balanse eller risikonivå.`;
  }

  return `Laget har store strukturelle problemer. Setup-score er ${evaluation.setupScore}. Spillerne kan fortsatt være gode, men oppsettet skjuler for mye av kvaliteten deres.`;
}

function buildKeyStrengths(evaluation: TeamSetupEvaluation, averageRoleFit: Score100): string[] {
  const strengths = [...evaluation.strengths];

  if (averageRoleFit >= STRONG_FIT) {
    strengths.push("Den gjennomsnittlige rollefiten er svært sterk.");
  }

  if (evaluation.teamBalance.finalBalance >= ELITE_SCORE) {
    strengths.push("Lagbalansen er på elitenivå i denne vurderingen.");
  }

  if (strengths.length === 0 && evaluation.setupScore >= GOOD_SCORE) {
    strengths.push("Laget har et solid grunnoppsett uten én enkelt dominerende svakhet.");
  }

  return strengths;
}

function buildKeyProblems(evaluation: TeamSetupEvaluation): string[] {
  return evaluation.issues.map((issue) => issue.label);
}

function addAdvice(
  advice: CoachAdvice[],
  code: string,
  priority: CoachAdvicePriority,
  label: string,
  rationale: string,
): void {
  advice.push({
    code,
    priority,
    label,
    rationale,
  });
}

function buildCoachAdvice(
  evaluation: TeamSetupEvaluation,
  averageRoleFit: Score100,
): CoachAdvice[] {
  const advice: CoachAdvice[] = [];
  const balance = evaluation.teamBalance;
  const weakestFit = evaluation.worstFits[0];

  if (!evaluation.isComplete) {
    addAdvice(
      advice,
      "complete_lineup",
      1,
      "Fullfør startelleveren før du vurderer finjusteringer.",
      "Motoren trenger elleve gyldige spiller-/rolleplasseringer for at lagbalansen skal bli pålitelig.",
    );
  }

  if (averageRoleFit > 0 && averageRoleFit < GOOD_FIT) {
    addAdvice(
      advice,
      "improve_role_fit",
      1,
      "Se først på rollebruken.",
      "Samlet rollefit er lavere enn ønskelig. Det tyder på at flere spillere brukes i roller som ikke får frem styrkene deres.",
    );
  }

  if (weakestFit && weakestFit.finalFit < USABLE_FIT) {
    addAdvice(
      advice,
      "fix_worst_fit",
      1,
      `Vurder rollen til ${weakestFit.playerId}.`,
      `Denne spilleren har laveste registrerte rollefit (${weakestFit.finalFit}) i oppsettet.`,
    );
  }

  if (balance.defensiveBalance < LOW_SCORE) {
    addAdvice(
      advice,
      "strengthen_defensive_balance",
      1,
      "Legg inn tydeligere sikring.",
      "Forsvarsbalansen er svak. Laget trenger bedre dekning, lavere risiko eller en tydeligere balanse-/sikringsrolle.",
    );
  }

  if (balance.riskBalance < LOW_SCORE) {
    addAdvice(
      advice,
      "reduce_structural_risk",
      1,
      "Reduser samlet risiko i rollevalgene.",
      "Risikobalansen er svak. For mange aggressive roller samtidig kan gjøre laget sårbart i overgangene.",
    );
  }

  if (balance.pressingCoherence < LOW_SCORE) {
    addAdvice(
      advice,
      "align_pressing",
      2,
      "Samkjør presset.",
      "Presset henger dårlig sammen. Enten trenger laget flere pressroller, eller så bør presshøyden senkes.",
    );
  }

  if (balance.widthBalance < LOW_SCORE) {
    addAdvice(
      advice,
      "fix_width_structure",
      2,
      "Rydd breddestrukturen.",
      "Bredden fungerer svakt. Laget bør ha tydeligere roller som holder bredde eller en taktikk som passer smalere rollevalg.",
    );
  }

  if (balance.midfieldControl < LOW_SCORE) {
    addAdvice(
      advice,
      "improve_midfield_control",
      2,
      "Styrk midtbanekontrollen.",
      "Midtbanen gir for lite kontroll. Vurder tempo-kontrollør, bedre oppbyggingsrolle eller tydeligere balanse sentralt.",
    );
  }

  if (advice.length === 0) {
    addAdvice(
      advice,
      "keep_structure",
      3,
      "Behold grunnstrukturen.",
      "Oppsettet har ingen tydelige kritiske problemer i denne rapporten. Neste steg bør være finjustering, ikke stor ombygging.",
    );
  }

  return advice;
}

export function createTeamSetupReport(evaluation: TeamSetupEvaluation): TeamSetupReport {
  const averageRoleFit = getAverageRoleFit(evaluation);
  const level = getReportLevel(evaluation);

  return {
    teamId: evaluation.teamId,
    tacticId: evaluation.tacticId,

    setupScore: evaluation.setupScore,
    level,

    overallSummary: buildOverallSummary(evaluation, level, averageRoleFit),

    keyStrengths: buildKeyStrengths(evaluation, averageRoleFit),
    keyProblems: buildKeyProblems(evaluation),

    bestPlayers: evaluation.bestFits.map(toPlayerFitReport),
    problemPlayers: evaluation.worstFits.map(toPlayerFitReport),

    balanceOverview: buildBalanceOverview(evaluation.teamBalance),

    coachAdvice: buildCoachAdvice(evaluation, averageRoleFit),

    rawIssues: evaluation.issues,
  };
}
