// src/engine/createManagerDashboardData.ts

import type {
  Score100,
} from "../domain/footballTypes.js";

import type {
  ManagerInsight,
  ManagerInsightAction,
  ManagerInsightPriority,
} from "./createManagerInsight.js";

import type {
  FootballKnowledgeRecommendation,
} from "../domain/footballKnowledgeTypes.js";

export type DashboardSeverity =
  | "positive"
  | "neutral"
  | "warning"
  | "critical";

export type DashboardScorePanel = {
  teamId: string;
  tacticId: string;
  setupScore: Score100;
  teamBalanceScore: Score100;
  reportLevel: string;
  severity: DashboardSeverity;
  label: string;
};

export type DashboardSummaryPanel = {
  title: string;
  summary: string;
  reportSummary: string;
};

export type DashboardMetricCard = {
  code: string;
  label: string;
  value: Score100;
  severity: DashboardSeverity;
};

export type DashboardActionCard = {
  code: string;
  priority: ManagerInsightPriority;
  severity: DashboardSeverity;
  source: string;
  label: string;
  rationale: string;
  relatedPlayerIds: string[];
};

export type DashboardTrainingCard = {
  area: string;
  intensity: string;
  priority: number;
  label: string;
  suggestedSession: string;
  relatedPlayerIds: string[];
};

export type DashboardRoleChangeCard = {
  playerId: string;
  position: string;
  currentRoleId: string;
  currentRoleName?: string;
  currentFit?: Score100;
  status: string;
  label: string;
};

export type DashboardWeakPointCard = {
  code: string;
  category: string;
  severity: string;
  score: Score100;
  label: string;
  suggestedAction: string;
  relatedPlayerIds: string[];
};

export type DashboardKnowledgeCard = {
  principleId: string;
  title: string;
  category: string;
  priority: string;
  reason: string;
  coachAdvice: string;
  trainingSession: string;
};

export type ManagerDashboardData = {
  teamId: string;
  tacticId: string;

  scorePanel: DashboardScorePanel;
  summaryPanel: DashboardSummaryPanel;

  metrics: DashboardMetricCard[];

  topActions: DashboardActionCard[];

  keyStrengths: string[];
  keyProblems: string[];

  trainingPlan: DashboardTrainingCard[];

  roleChanges: DashboardRoleChangeCard[];

  weakPoints: DashboardWeakPointCard[];

  knowledgeRecommendations: DashboardKnowledgeCard[];
};

function severityFromScore(score: Score100): DashboardSeverity {
  if (score >= 78) return "positive";
  if (score >= 65) return "neutral";
  if (score >= 50) return "warning";
  return "critical";
}

function severityFromPriority(priority: ManagerInsightPriority): DashboardSeverity {
  if (priority === "critical") return "critical";
  if (priority === "high") return "warning";
  if (priority === "medium") return "neutral";
  return "positive";
}

function buildScoreLabel(score: Score100): string {
  if (score >= 85) {
    return "Svært sterkt oppsett";
  }

  if (score >= 75) {
    return "Godt oppsett";
  }

  if (score >= 65) {
    return "Ustabilt, men brukbart oppsett";
  }

  return "Svakt oppsett";
}

function toKnowledgeCard(
  recommendation: FootballKnowledgeRecommendation,
): DashboardKnowledgeCard {
  return {
    principleId: recommendation.principleId,
    title: recommendation.title,
    category: recommendation.category,
    priority: recommendation.priority,
    reason: recommendation.reason,
    coachAdvice: recommendation.coachAdvice,
    trainingSession: recommendation.trainingSession,
  };
}

function toActionCard(action: ManagerInsightAction): DashboardActionCard {
  return {
    code: action.code,
    priority: action.priority,
    severity: severityFromPriority(action.priority),
    source: action.source,
    label: action.label,
    rationale: action.rationale,
    relatedPlayerIds: action.relatedPlayerIds,
  };
}

export function createManagerDashboardData(insight: ManagerInsight): ManagerDashboardData {
  const setupScore = insight.setup.setupScore;
  const teamBalance = insight.setup.teamBalance;

  return {
    teamId: insight.teamId,
    tacticId: insight.tacticId,

    scorePanel: {
      teamId: insight.teamId,
      tacticId: insight.tacticId,
      setupScore,
      teamBalanceScore: teamBalance.finalBalance,
      reportLevel: insight.report.level,
      severity: severityFromScore(setupScore),
      label: buildScoreLabel(setupScore),
    },

    summaryPanel: {
      title: "Managerinnsikt",
      summary: insight.summary,
      reportSummary: insight.report.overallSummary,
    },

    metrics: [
      {
        code: "attacking_balance",
        label: "Angrep",
        value: teamBalance.attackingBalance,
        severity: severityFromScore(teamBalance.attackingBalance),
      },
      {
        code: "defensive_balance",
        label: "Forsvar",
        value: teamBalance.defensiveBalance,
        severity: severityFromScore(teamBalance.defensiveBalance),
      },
      {
        code: "midfield_control",
        label: "Midtbane",
        value: teamBalance.midfieldControl,
        severity: severityFromScore(teamBalance.midfieldControl),
      },
      {
        code: "pressing_coherence",
        label: "Press",
        value: teamBalance.pressingCoherence,
        severity: severityFromScore(teamBalance.pressingCoherence),
      },
      {
        code: "width_balance",
        label: "Bredde",
        value: teamBalance.widthBalance,
        severity: severityFromScore(teamBalance.widthBalance),
      },
      {
        code: "risk_balance",
        label: "Risiko",
        value: teamBalance.riskBalance,
        severity: severityFromScore(teamBalance.riskBalance),
      },
    ],

    topActions: insight.topActions.map(toActionCard),

    keyStrengths: insight.report.keyStrengths,
    keyProblems: insight.report.keyProblems,

    trainingPlan: insight.trainingFocusPlan.weeklyPlan.map((item) => ({
      area: item.area,
      intensity: item.intensity,
      priority: item.priority,
      label: item.label,
      suggestedSession: item.suggestedSession,
      relatedPlayerIds: item.relatedPlayerIds,
    })),

    roleChanges: [
      ...insight.roleChangeRecommendations.strongChanges,
      ...insight.roleChangeRecommendations.consideredChanges,
    ].map((recommendation) => ({
      playerId: recommendation.playerId,
      position: recommendation.position,
      currentRoleId: recommendation.currentRoleId,
      ...(recommendation.currentRoleName !== undefined
        ? { currentRoleName: recommendation.currentRoleName }
        : {}),
      ...(recommendation.currentFit !== undefined
        ? { currentFit: recommendation.currentFit }
        : {}),
      status: recommendation.status,
      label: recommendation.label,
    })),

    weakPoints: insight.weakPointAnalysis.weakPoints.map((weakPoint) => ({
      code: weakPoint.code,
      category: weakPoint.category,
      severity: weakPoint.severity,
      score: weakPoint.score,
      label: weakPoint.label,
      suggestedAction: weakPoint.suggestedAction,
      relatedPlayerIds: weakPoint.relatedPlayerIds,
    })),

    knowledgeRecommendations: insight.knowledgeRecommendations.map(toKnowledgeCard),
  };
}
