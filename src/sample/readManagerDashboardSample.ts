// src/sample/readManagerDashboardSample.ts

import type {
  DashboardActionCard,
  DashboardMetricCard,
  DashboardRoleChangeCard,
  DashboardTrainingCard,
  DashboardWeakPointCard,
  ManagerDashboardData,
} from "../engine/createManagerDashboardData.js";

import { createManagerDashboardData } from "../engine/createManagerDashboardData.js";
import { createManagerInsight } from "../engine/createManagerInsight.js";

import {
  sampleRoles,
  sampleTactic,
  sampleTeam,
} from "./elite433Sample.js";

export type ReadableDashboardScore = {
  label: string;
  setupScore: number;
  teamBalanceScore: number;
  reportLevel: string;
  severity: string;
};

export type ReadableDashboardSummary = {
  title: string;
  summary: string;
  reportSummary: string;
};

export type ReadableDashboardData = {
  teamId: string;
  tacticId: string;

  score: ReadableDashboardScore;
  summary: ReadableDashboardSummary;

  metrics: DashboardMetricCard[];

  topActions: DashboardActionCard[];

  keyStrengths: string[];
  keyProblems: string[];

  trainingPlan: DashboardTrainingCard[];

  roleChanges: DashboardRoleChangeCard[];

  weakPoints: DashboardWeakPointCard[];
};

export const managerDashboardSampleInsight = createManagerInsight({
  team: sampleTeam,
  tactic: sampleTactic,
  roles: sampleRoles,
});

export const managerDashboardSampleData = createManagerDashboardData(
  managerDashboardSampleInsight,
);

export function readManagerDashboardSample(
  dashboard: ManagerDashboardData = managerDashboardSampleData,
): ReadableDashboardData {
  return {
    teamId: dashboard.teamId,
    tacticId: dashboard.tacticId,

    score: {
      label: dashboard.scorePanel.label,
      setupScore: dashboard.scorePanel.setupScore,
      teamBalanceScore: dashboard.scorePanel.teamBalanceScore,
      reportLevel: dashboard.scorePanel.reportLevel,
      severity: dashboard.scorePanel.severity,
    },

    summary: {
      title: dashboard.summaryPanel.title,
      summary: dashboard.summaryPanel.summary,
      reportSummary: dashboard.summaryPanel.reportSummary,
    },

    metrics: dashboard.metrics,

    topActions: dashboard.topActions,

    keyStrengths: dashboard.keyStrengths,
    keyProblems: dashboard.keyProblems,

    trainingPlan: dashboard.trainingPlan,

    roleChanges: dashboard.roleChanges,

    weakPoints: dashboard.weakPoints,
  };
}

export const readableManagerDashboardSample = readManagerDashboardSample();
