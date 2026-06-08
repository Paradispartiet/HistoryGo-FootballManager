// src/sample/readManagerAppStateSample.ts

import type {
  ManagerAppState,
  ManagerAppStateStatus,
} from "../engine/createManagerAppState.js";

import { createManagerAppState } from "../engine/createManagerAppState.js";

import {
  sampleRoles,
  sampleTactic,
  sampleTeam,
} from "./elite433Sample.js";

export type ReadableManagerAppStateSample = {
  teamId: string;
  tacticId: string;

  status: ManagerAppStateStatus;
  summary: string;

  setupScore: string;
  teamBalance: string;
  reportLevel: string;

  managerSummary: string;
  reportSummary: string;

  topActions: {
    priority: string;
    source: string;
    label: string;
    rationale: string;
    relatedPlayerIds: string[];
  }[];

  metrics: {
    code: string;
    label: string;
    value: string;
    className: string;
  }[];

  trainingPlan: {
    area: string;
    intensity: string;
    priority: string;
    label: string;
    suggestedSession: string;
  }[];

  roleChanges: {
    playerId: string;
    position: string;
    role: string;
    currentFit: string;
    status: string;
    label: string;
  }[];

  weakPoints: {
    category: string;
    severity: string;
    score: string;
    label: string;
    suggestedAction: string;
  }[];

  emptyStates: ManagerAppState["dashboardViewModel"]["emptyStates"];
};

export const managerAppStateSample = createManagerAppState({
  team: sampleTeam,
  tactic: sampleTactic,
  roles: sampleRoles,
});

export function readManagerAppStateSample(
  state: ManagerAppState = managerAppStateSample,
): ReadableManagerAppStateSample {
  return {
    teamId: state.teamId,
    tacticId: state.tacticId,

    status: state.status,
    summary: state.summary,

    setupScore: state.dashboardViewModel.score.setupScoreText,
    teamBalance: state.dashboardViewModel.score.teamBalanceText,
    reportLevel: state.dashboardViewModel.score.reportLevelText,

    managerSummary: state.dashboardViewModel.summary.summary,
    reportSummary: state.dashboardViewModel.summary.reportSummary,

    topActions: state.dashboardViewModel.topActions.map((action) => ({
      priority: action.priorityText,
      source: action.sourceText,
      label: action.label,
      rationale: action.rationale,
      relatedPlayerIds: action.relatedPlayerText === "Ingen spesifikke spillere"
        ? []
        : action.relatedPlayerText.split(", "),
    })),

    metrics: state.dashboardViewModel.metrics.map((metric) => ({
      code: metric.code,
      label: metric.label,
      value: metric.valueText,
      className: metric.className,
    })),

    trainingPlan: state.dashboardViewModel.trainingPlan.map((item) => ({
      area: item.areaText,
      intensity: item.intensityText,
      priority: item.priorityText,
      label: item.label,
      suggestedSession: item.suggestedSession,
    })),

    roleChanges: state.dashboardViewModel.roleChanges.map((change) => ({
      playerId: change.playerId,
      position: change.position,
      role: change.currentRoleNameText,
      currentFit: change.currentFitText,
      status: change.statusText,
      label: change.label,
    })),

    weakPoints: state.dashboardViewModel.weakPoints.map((weakPoint) => ({
      category: weakPoint.categoryText,
      severity: weakPoint.severityText,
      score: weakPoint.scoreText,
      label: weakPoint.label,
      suggestedAction: weakPoint.suggestedAction,
    })),

    emptyStates: state.dashboardViewModel.emptyStates,
  };
}

export const readableManagerAppStateSample =
  readManagerAppStateSample(managerAppStateSample);
