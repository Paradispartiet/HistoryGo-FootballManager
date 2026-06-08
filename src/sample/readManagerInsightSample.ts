// src/sample/readManagerInsightSample.ts

import type {
  ManagerInsight,
  ManagerInsightAction,
} from "../engine/createManagerInsight.js";

import type {
  TrainingFocusItem,
} from "../engine/createTrainingFocus.js";

import { createManagerInsight } from "../engine/createManagerInsight.js";

import {
  sampleRoles,
  sampleTactic,
  sampleTeam,
} from "./elite433Sample.js";

export type ReadableManagerAction = {
  priority: string;
  source: string;
  label: string;
  rationale: string;
  relatedPlayerIds: string[];
};

export type ReadableTrainingFocus = {
  area: string;
  intensity: string;
  priority: number;
  label: string;
  suggestedSession: string;
  relatedPlayerIds: string[];
};

export type ReadableManagerInsight = {
  teamId: string;
  tacticId: string;

  setupScore: number;
  reportLevel: string;

  summary: string;
  reportSummary: string;
  weakPointSummary: string;
  roleChangeSummary: string;
  trainingFocusSummary: string;

  topActions: ReadableManagerAction[];

  keyStrengths: string[];
  keyProblems: string[];

  mainWeakPoint: string | null;

  primaryTrainingFocus: ReadableTrainingFocus | null;
  weeklyTrainingPlan: ReadableTrainingFocus[];

  strongRoleChanges: string[];
  consideredRoleChanges: string[];
};

function toReadableAction(action: ManagerInsightAction): ReadableManagerAction {
  return {
    priority: action.priority,
    source: action.source,
    label: action.label,
    rationale: action.rationale,
    relatedPlayerIds: action.relatedPlayerIds,
  };
}

function toReadableTrainingFocus(item: TrainingFocusItem): ReadableTrainingFocus {
  return {
    area: item.area,
    intensity: item.intensity,
    priority: item.priority,
    label: item.label,
    suggestedSession: item.suggestedSession,
    relatedPlayerIds: item.relatedPlayerIds,
  };
}

export function readManagerInsightSample(
  insight: ManagerInsight = createManagerInsight({
    team: sampleTeam,
    tactic: sampleTactic,
    roles: sampleRoles,
  }),
): ReadableManagerInsight {
  return {
    teamId: insight.teamId,
    tacticId: insight.tacticId,

    setupScore: insight.setup.setupScore,
    reportLevel: insight.report.level,

    summary: insight.summary,
    reportSummary: insight.report.overallSummary,
    weakPointSummary: insight.weakPointAnalysis.summary,
    roleChangeSummary: insight.roleChangeRecommendations.summary,
    trainingFocusSummary: insight.trainingFocusPlan.summary,

    topActions: insight.topActions.map(toReadableAction),

    keyStrengths: insight.report.keyStrengths,
    keyProblems: insight.report.keyProblems,

    mainWeakPoint: insight.weakPointAnalysis.mainWeakPoint?.label ?? null,

    primaryTrainingFocus: insight.trainingFocusPlan.primaryFocus
      ? toReadableTrainingFocus(insight.trainingFocusPlan.primaryFocus)
      : null,

    weeklyTrainingPlan: insight.trainingFocusPlan.weeklyPlan.map(toReadableTrainingFocus),

    strongRoleChanges: insight.roleChangeRecommendations.strongChanges.map(
      (recommendation) => recommendation.label,
    ),

    consideredRoleChanges: insight.roleChangeRecommendations.consideredChanges.map(
      (recommendation) => recommendation.label,
    ),
  };
}

export const managerInsightSample = createManagerInsight({
  team: sampleTeam,
  tactic: sampleTactic,
  roles: sampleRoles,
});

export const readableManagerInsightSample = readManagerInsightSample(managerInsightSample);
