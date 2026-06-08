// src/engine/createManagerAppState.ts

import type {
  Role,
  Tactic,
  Team,
} from "../domain/footballTypes.js";

import type {
  ManagerDashboardData,
} from "./createManagerDashboardData.js";

import type {
  ManagerDashboardViewModel,
} from "./createManagerDashboardViewModel.js";

import type {
  ManagerInsight,
} from "./createManagerInsight.js";

import type {
  FootballKnowledgePrinciple,
} from "../domain/footballKnowledgeTypes.js";

import { createManagerDashboardData } from "./createManagerDashboardData.js";
import { createManagerDashboardViewModel } from "./createManagerDashboardViewModel.js";
import { createManagerInsight } from "./createManagerInsight.js";

export type ManagerAppStateStatus =
  | "ready"
  | "incomplete"
  | "has_warnings"
  | "has_critical_issues";

export type ManagerAppStateInput = {
  team: Team;
  tactic: Tactic;
  roles: Role[];
  knowledgePrinciples?: FootballKnowledgePrinciple[];
};

export type ManagerAppState = {
  teamId: string;
  tacticId: string;

  status: ManagerAppStateStatus;

  insight: ManagerInsight;
  dashboardData: ManagerDashboardData;
  dashboardViewModel: ManagerDashboardViewModel;

  summary: string;
};

function getStateStatus(insight: ManagerInsight): ManagerAppStateStatus {
  if (!insight.setup.isComplete) {
    return "incomplete";
  }

  const hasCriticalActions = insight.topActions.some((action) => action.priority === "critical");

  if (hasCriticalActions) {
    return "has_critical_issues";
  }

  const hasWarnings = insight.topActions.some(
    (action) => action.priority === "high" || action.priority === "medium",
  );

  if (hasWarnings) {
    return "has_warnings";
  }

  return "ready";
}

function buildSummary(
  status: ManagerAppStateStatus,
  insight: ManagerInsight,
): string {
  if (status === "incomplete") {
    return "App-state er opprettet, men laget er ikke komplett. UI bør vise dette som foreløpig vurdering.";
  }

  if (status === "has_critical_issues") {
    return "App-state er opprettet med kritiske problemer. UI bør vise topphandlingene tydelig først.";
  }

  if (status === "has_warnings") {
    return "App-state er opprettet med tydelige forbedringspunkter. UI bør vise tiltak, svakheter og treningsfokus.";
  }

  return `App-state er klar. ${insight.summary}`;
}

export function createManagerAppState(input: ManagerAppStateInput): ManagerAppState {
  const insight = createManagerInsight({
    team: input.team,
    tactic: input.tactic,
    roles: input.roles,
    knowledgePrinciples: input.knowledgePrinciples ?? [],
  });
  const dashboardData = createManagerDashboardData(insight);
  const dashboardViewModel = createManagerDashboardViewModel(dashboardData);
  const status = getStateStatus(insight);

  return {
    teamId: input.team.id,
    tacticId: input.tactic.id,

    status,

    insight,
    dashboardData,
    dashboardViewModel,

    summary: buildSummary(status, insight),
  };
}
