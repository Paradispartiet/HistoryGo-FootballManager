// src/sample/readManagerInsightSample.ts

import type {
  ManagerInsight,
  ManagerInsightAction,
} from "../engine/createManagerInsight.js";

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

export type ReadableManagerInsight = {
  teamId: string;
  tacticId: string;

  setupScore: number;
  reportLevel: string;

  summary: string;
  reportSummary: string;
  weakPointSummary: string;
  roleChangeSummary: string;

  topActions: ReadableManagerAction[];

  keyStrengths: string[];
  keyProblems: string[];

  mainWeakPoint: string | null;

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

    topActions: insight.topActions.map(toReadableAction),

    keyStrengths: insight.report.keyStrengths,
    keyProblems: insight.report.keyProblems,

    mainWeakPoint: insight.weakPointAnalysis.mainWeakPoint?.label ?? null,

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
