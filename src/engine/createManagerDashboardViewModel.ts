// src/engine/createManagerDashboardViewModel.ts

import type {
  DashboardActionCard,
  DashboardKnowledgeCard,
  DashboardMetricCard,
  DashboardRoleChangeCard,
  DashboardSeverity,
  DashboardTrainingCard,
  DashboardWeakPointCard,
  ManagerDashboardData,
} from "./createManagerDashboardData.js";

export type DashboardViewModelCardClass =
  | "is-positive"
  | "is-neutral"
  | "is-warning"
  | "is-critical";

export type DashboardScoreViewModel = {
  label: string;
  setupScoreText: string;
  teamBalanceText: string;
  reportLevelText: string;
  className: DashboardViewModelCardClass;
};

export type DashboardSummaryViewModel = {
  title: string;
  summary: string;
  reportSummary: string;
};

// Visningsklare felter for fullføring/snitt som speiler det eldre scorepanelet.
export type DashboardCompletionViewModel = {
  completeCountText: string;
  isComplete: boolean;
  roleFitAverageText: string;
  tacticFitAverageText: string;
  duplicateCountText: string;
  hasDuplicates: boolean;
};

export type DashboardMetricViewModel = {
  code: string;
  label: string;
  valueText: string;
  className: DashboardViewModelCardClass;
};

export type DashboardActionViewModel = {
  code: string;
  priorityText: string;
  sourceText: string;
  label: string;
  rationale: string;
  relatedPlayerText: string;
  className: DashboardViewModelCardClass;
};

export type DashboardTrainingViewModel = {
  areaText: string;
  intensityText: string;
  priorityText: string;
  label: string;
  suggestedSession: string;
  relatedPlayerText: string;
};

export type DashboardRoleChangeViewModel = {
  playerId: string;
  position: string;
  currentRoleId: string;
  currentRoleNameText: string;
  currentFitText: string;
  statusText: string;
  label: string;
};

export type DashboardWeakPointViewModel = {
  code: string;
  categoryText: string;
  severityText: string;
  scoreText: string;
  label: string;
  suggestedAction: string;
  relatedPlayerText: string;
  className: DashboardViewModelCardClass;
};

export type DashboardKnowledgeViewModel = {
  principleId: string;
  title: string;
  categoryText: string;
  priorityText: string;
  reason: string;
  coachAdvice: string;
  trainingSession: string;
  tooltipText: string;
  handbookText: string;
};

export type ManagerDashboardViewModel = {
  teamId: string;
  tacticId: string;

  score: DashboardScoreViewModel;
  summary: DashboardSummaryViewModel;
  completion: DashboardCompletionViewModel;

  metrics: DashboardMetricViewModel[];

  topActions: DashboardActionViewModel[];

  keyStrengths: string[];
  keyProblems: string[];

  trainingPlan: DashboardTrainingViewModel[];

  roleChanges: DashboardRoleChangeViewModel[];

  weakPoints: DashboardWeakPointViewModel[];

  knowledgeRecommendations: DashboardKnowledgeViewModel[];

  emptyStates: {
    topActions: string | null;
    keyStrengths: string | null;
    keyProblems: string | null;
    trainingPlan: string | null;
    roleChanges: string | null;
    weakPoints: string | null;
    knowledgeRecommendations: string | null;
  };
};

function classFromSeverity(severity: DashboardSeverity): DashboardViewModelCardClass {
  if (severity === "positive") return "is-positive";
  if (severity === "warning") return "is-warning";
  if (severity === "critical") return "is-critical";
  return "is-neutral";
}

function scoreText(value: number): string {
  return `${Math.round(value)}`;
}

function priorityText(priority: string): string {
  if (priority === "critical") return "Kritisk";
  if (priority === "high") return "Høy";
  if (priority === "medium") return "Middels";
  return "Lav";
}

function sourceText(source: string): string {
  if (source === "weak_point") return "Svakhet";
  if (source === "role_change") return "Rollebytte";
  if (source === "coach_advice") return "Trenerråd";
  if (source === "training_focus") return "Trening";
  return source;
}

function intensityText(intensity: string): string {
  if (intensity === "high") return "Høy intensitet";
  if (intensity === "medium") return "Middels intensitet";
  return "Lav intensitet";
}

function roleChangeStatusText(status: string): string {
  if (status === "strong_change") return "Tydelig rollebytte";
  if (status === "consider_change") return "Vurder rollebytte";
  if (status === "keep_role") return "Behold rolle";
  if (status === "cannot_evaluate") return "Kan ikke vurderes";
  return status;
}

function weakPointSeverityText(severity: string): string {
  if (severity === "high") return "Alvorlig";
  if (severity === "medium") return "Middels";
  return "Lav";
}

function weakPointCategoryText(category: string): string {
  if (category === "completion") return "Fullføring";
  if (category === "role_fit") return "Rollefit";
  if (category === "team_balance") return "Lagbalanse";
  if (category === "attack") return "Angrep";
  if (category === "defence") return "Forsvar";
  if (category === "midfield") return "Midtbane";
  if (category === "pressing") return "Press";
  if (category === "width") return "Bredde";
  if (category === "risk") return "Risiko";
  return category;
}

function knowledgePriorityText(priority: string): string {
  if (priority === "high") return "Høy";
  if (priority === "medium") return "Middels";
  return "Lav";
}

function knowledgeCategoryText(category: string): string {
  if (category.length === 0) {
    return category;
  }

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function relatedPlayerText(playerIds: string[]): string {
  if (playerIds.length === 0) {
    return "Ingen spesifikke spillere";
  }

  return playerIds.join(", ");
}

function toMetricViewModel(card: DashboardMetricCard): DashboardMetricViewModel {
  return {
    code: card.code,
    label: card.label,
    valueText: scoreText(card.value),
    className: classFromSeverity(card.severity),
  };
}

function toActionViewModel(card: DashboardActionCard): DashboardActionViewModel {
  return {
    code: card.code,
    priorityText: priorityText(card.priority),
    sourceText: sourceText(card.source),
    label: card.label,
    rationale: card.rationale,
    relatedPlayerText: relatedPlayerText(card.relatedPlayerIds),
    className: classFromSeverity(card.severity),
  };
}

function toTrainingViewModel(card: DashboardTrainingCard): DashboardTrainingViewModel {
  return {
    areaText: card.area,
    intensityText: intensityText(card.intensity),
    priorityText: `Prioritet ${card.priority}`,
    label: card.label,
    suggestedSession: card.suggestedSession,
    relatedPlayerText: relatedPlayerText(card.relatedPlayerIds),
  };
}

function toRoleChangeViewModel(card: DashboardRoleChangeCard): DashboardRoleChangeViewModel {
  return {
    playerId: card.playerId,
    position: card.position,
    currentRoleId: card.currentRoleId,
    currentRoleNameText: card.currentRoleName ?? "Ukjent rolle",
    currentFitText: card.currentFit === undefined ? "–" : scoreText(card.currentFit),
    statusText: roleChangeStatusText(card.status),
    label: card.label,
  };
}

function severityFromWeakPoint(score: number): DashboardSeverity {
  if (score >= 78) return "positive";
  if (score >= 65) return "neutral";
  if (score >= 50) return "warning";
  return "critical";
}

function toWeakPointViewModel(card: DashboardWeakPointCard): DashboardWeakPointViewModel {
  return {
    code: card.code,
    categoryText: weakPointCategoryText(card.category),
    severityText: weakPointSeverityText(card.severity),
    scoreText: scoreText(card.score),
    label: card.label,
    suggestedAction: card.suggestedAction,
    relatedPlayerText: relatedPlayerText(card.relatedPlayerIds),
    className: classFromSeverity(severityFromWeakPoint(card.score)),
  };
}

function toKnowledgeViewModel(card: DashboardKnowledgeCard): DashboardKnowledgeViewModel {
  return {
    principleId: card.principleId,
    title: card.title,
    categoryText: knowledgeCategoryText(card.category),
    priorityText: knowledgePriorityText(card.priority),
    reason: card.reason,
    coachAdvice: card.coachAdvice,
    trainingSession: card.trainingSession,
    tooltipText: card.tooltipText,
    handbookText: card.handbookText,
  };
}

function emptyState<T>(items: T[], text: string): string | null {
  return items.length === 0 ? text : null;
}

export function createManagerDashboardViewModel(
  dashboard: ManagerDashboardData,
): ManagerDashboardViewModel {
  const metrics = dashboard.metrics.map(toMetricViewModel);
  const topActions = dashboard.topActions.map(toActionViewModel);
  const trainingPlan = dashboard.trainingPlan.map(toTrainingViewModel);
  const roleChanges = dashboard.roleChanges.map(toRoleChangeViewModel);
  const weakPoints = dashboard.weakPoints.map(toWeakPointViewModel);
  const knowledgeRecommendations = dashboard.knowledgeRecommendations.map(toKnowledgeViewModel);

  return {
    teamId: dashboard.teamId,
    tacticId: dashboard.tacticId,

    score: {
      label: dashboard.scorePanel.label,
      setupScoreText: scoreText(dashboard.scorePanel.setupScore),
      teamBalanceText: scoreText(dashboard.scorePanel.teamBalanceScore),
      reportLevelText: dashboard.scorePanel.reportLevel,
      className: classFromSeverity(dashboard.scorePanel.severity),
    },

    summary: {
      title: dashboard.summaryPanel.title,
      summary: dashboard.summaryPanel.summary,
      reportSummary: dashboard.summaryPanel.reportSummary,
    },

    completion: {
      completeCountText: `${dashboard.completion.completeCount}/${dashboard.completion.totalSlots}`,
      isComplete: dashboard.completion.isComplete,
      roleFitAverageText: scoreText(dashboard.completion.roleFitAverage),
      tacticFitAverageText: scoreText(dashboard.completion.tacticFitAverage),
      duplicateCountText: `${dashboard.completion.duplicateCount}`,
      hasDuplicates: dashboard.completion.duplicateCount > 0,
    },

    metrics,

    topActions,

    keyStrengths: dashboard.keyStrengths,
    keyProblems: dashboard.keyProblems,

    trainingPlan,

    roleChanges,

    weakPoints,

    knowledgeRecommendations,

    emptyStates: {
      topActions: emptyState(topActions, "Ingen prioriterte tiltak akkurat nå."),
      keyStrengths: emptyState(dashboard.keyStrengths, "Ingen tydelige styrker er identifisert ennå."),
      keyProblems: emptyState(dashboard.keyProblems, "Ingen tydelige problemer er identifisert ennå."),
      trainingPlan: emptyState(trainingPlan, "Ingen treningsfokus er foreslått ennå."),
      roleChanges: emptyState(roleChanges, "Ingen rollebytter er foreslått."),
      weakPoints: emptyState(weakPoints, "Ingen tydelige svakheter er funnet."),
      knowledgeRecommendations: emptyState(
        knowledgeRecommendations,
        "Ingen kunnskapsanbefalinger er koblet inn ennå.",
      ),
    },
  };
}
