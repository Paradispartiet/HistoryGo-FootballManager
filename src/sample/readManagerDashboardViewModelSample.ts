// src/sample/readManagerDashboardViewModelSample.ts

import type {
  ManagerDashboardViewModel,
} from "../engine/createManagerDashboardViewModel.js";

import { createManagerDashboardData } from "../engine/createManagerDashboardData.js";
import { createManagerDashboardViewModel } from "../engine/createManagerDashboardViewModel.js";
import { createManagerInsight } from "../engine/createManagerInsight.js";

import {
  sampleRoles,
  sampleTactic,
  sampleTeam,
} from "./elite433Sample.js";

export type ReadableDashboardViewModelSample = {
  teamId: string;
  tacticId: string;

  score: {
    label: string;
    setupScoreText: string;
    teamBalanceText: string;
    reportLevelText: string;
    className: string;
  };

  summary: {
    title: string;
    summary: string;
    reportSummary: string;
  };

  metrics: {
    code: string;
    label: string;
    valueText: string;
    className: string;
  }[];

  topActions: {
    priorityText: string;
    sourceText: string;
    label: string;
    rationale: string;
    relatedPlayerText: string;
    className: string;
  }[];

  keyStrengths: string[];
  keyProblems: string[];

  trainingPlan: {
    areaText: string;
    intensityText: string;
    priorityText: string;
    label: string;
    suggestedSession: string;
    relatedPlayerText: string;
  }[];

  roleChanges: {
    playerId: string;
    position: string;
    currentRoleNameText: string;
    currentFitText: string;
    statusText: string;
    label: string;
  }[];

  weakPoints: {
    categoryText: string;
    severityText: string;
    scoreText: string;
    label: string;
    suggestedAction: string;
    relatedPlayerText: string;
    className: string;
  }[];

  emptyStates: ManagerDashboardViewModel["emptyStates"];
};

export const managerDashboardViewModelSampleInsight = createManagerInsight({
  team: sampleTeam,
  tactic: sampleTactic,
  roles: sampleRoles,
});

export const managerDashboardViewModelSampleData = createManagerDashboardData(
  managerDashboardViewModelSampleInsight,
);

export const managerDashboardViewModelSample = createManagerDashboardViewModel(
  managerDashboardViewModelSampleData,
);

export function readManagerDashboardViewModelSample(
  viewModel: ManagerDashboardViewModel = managerDashboardViewModelSample,
): ReadableDashboardViewModelSample {
  return {
    teamId: viewModel.teamId,
    tacticId: viewModel.tacticId,

    score: {
      label: viewModel.score.label,
      setupScoreText: viewModel.score.setupScoreText,
      teamBalanceText: viewModel.score.teamBalanceText,
      reportLevelText: viewModel.score.reportLevelText,
      className: viewModel.score.className,
    },

    summary: {
      title: viewModel.summary.title,
      summary: viewModel.summary.summary,
      reportSummary: viewModel.summary.reportSummary,
    },

    metrics: viewModel.metrics.map((metric) => ({
      code: metric.code,
      label: metric.label,
      valueText: metric.valueText,
      className: metric.className,
    })),

    topActions: viewModel.topActions.map((action) => ({
      priorityText: action.priorityText,
      sourceText: action.sourceText,
      label: action.label,
      rationale: action.rationale,
      relatedPlayerText: action.relatedPlayerText,
      className: action.className,
    })),

    keyStrengths: viewModel.keyStrengths,
    keyProblems: viewModel.keyProblems,

    trainingPlan: viewModel.trainingPlan.map((item) => ({
      areaText: item.areaText,
      intensityText: item.intensityText,
      priorityText: item.priorityText,
      label: item.label,
      suggestedSession: item.suggestedSession,
      relatedPlayerText: item.relatedPlayerText,
    })),

    roleChanges: viewModel.roleChanges.map((change) => ({
      playerId: change.playerId,
      position: change.position,
      currentRoleNameText: change.currentRoleNameText,
      currentFitText: change.currentFitText,
      statusText: change.statusText,
      label: change.label,
    })),

    weakPoints: viewModel.weakPoints.map((weakPoint) => ({
      categoryText: weakPoint.categoryText,
      severityText: weakPoint.severityText,
      scoreText: weakPoint.scoreText,
      label: weakPoint.label,
      suggestedAction: weakPoint.suggestedAction,
      relatedPlayerText: weakPoint.relatedPlayerText,
      className: weakPoint.className,
    })),

    emptyStates: viewModel.emptyStates,
  };
}

export const readableManagerDashboardViewModelSample =
  readManagerDashboardViewModelSample(managerDashboardViewModelSample);
