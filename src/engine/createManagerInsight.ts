// src/engine/createManagerInsight.ts

import type {
  Role,
  Tactic,
  Team,
} from "../domain/footballTypes.js";

import type {
  TeamSetupEvaluation,
} from "./evaluateTeamSetup.js";

import type {
  TeamSetupReport,
} from "./createTeamSetupReport.js";

import type {
  RoleChangeRecommendationResult,
} from "./recommendRoleChanges.js";

import type {
  WeakPointAnalysis,
  WeakPointSeverity,
} from "./analyzeWeakPoints.js";

import { evaluateTeamSetup } from "./evaluateTeamSetup.js";
import { createTeamSetupReport } from "./createTeamSetupReport.js";
import { recommendRoleChanges } from "./recommendRoleChanges.js";
import { analyzeWeakPoints } from "./analyzeWeakPoints.js";

export type ManagerInsightPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type ManagerInsightActionSource =
  | "weak_point"
  | "role_change"
  | "coach_advice";

export type ManagerInsightAction = {
  code: string;
  priority: ManagerInsightPriority;
  source: ManagerInsightActionSource;
  label: string;
  rationale: string;
  relatedPlayerIds: string[];
};

export type ManagerInsightInput = {
  team: Team;
  tactic: Tactic;
  roles: Role[];
};

export type ManagerInsight = {
  teamId: string;
  tacticId: string;

  setup: TeamSetupEvaluation;
  report: TeamSetupReport;
  weakPointAnalysis: WeakPointAnalysis;
  roleChangeRecommendations: RoleChangeRecommendationResult;

  topActions: ManagerInsightAction[];

  summary: string;
};

const MAX_TOP_ACTIONS = 8;

function priorityValue(priority: ManagerInsightPriority): number {
  if (priority === "critical") return 4;
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function weakPointPriority(severity: WeakPointSeverity): ManagerInsightPriority {
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function dedupeActions(actions: ManagerInsightAction[]): ManagerInsightAction[] {
  const seen = new Set<string>();
  const result: ManagerInsightAction[] = [];

  for (const action of actions) {
    const key = `${action.source}:${action.code}:${action.label}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(action);
  }

  return result;
}

function sortActions(actions: ManagerInsightAction[]): ManagerInsightAction[] {
  return [...actions].sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority));
}

function buildWeakPointActions(analysis: WeakPointAnalysis): ManagerInsightAction[] {
  return analysis.weakPoints.map((weakPoint) => ({
    code: `weak_point_${weakPoint.code}`,
    priority: weakPoint.category === "completion"
      ? "critical"
      : weakPointPriority(weakPoint.severity),
    source: "weak_point",
    label: weakPoint.suggestedAction,
    rationale: weakPoint.rationale,
    relatedPlayerIds: weakPoint.relatedPlayerIds,
  }));
}

function buildRoleChangeActions(
  recommendations: RoleChangeRecommendationResult,
): ManagerInsightAction[] {
  const strongActions: ManagerInsightAction[] = recommendations.strongChanges.map((recommendation) => ({
    code: `strong_role_change_${recommendation.playerId}_${recommendation.position}`,
    priority: "high",
    source: "role_change",
    label: recommendation.label,
    rationale: "Rolleendringsmotoren fant et alternativ i samme posisjon med tydelig bedre fit.",
    relatedPlayerIds: [recommendation.playerId],
  }));

  const consideredActions: ManagerInsightAction[] = recommendations.consideredChanges.map((recommendation) => ({
    code: `consider_role_change_${recommendation.playerId}_${recommendation.position}`,
    priority: "medium",
    source: "role_change",
    label: recommendation.label,
    rationale: "Rolleendringsmotoren fant et alternativ i samme posisjon med moderat bedre fit.",
    relatedPlayerIds: [recommendation.playerId],
  }));

  return [
    ...strongActions,
    ...consideredActions,
  ];
}

function coachAdvicePriority(priority: 1 | 2 | 3): ManagerInsightPriority {
  if (priority === 1) return "high";
  if (priority === 2) return "medium";
  return "low";
}

function buildCoachAdviceActions(report: TeamSetupReport): ManagerInsightAction[] {
  return report.coachAdvice.map((advice) => ({
    code: `coach_advice_${advice.code}`,
    priority: coachAdvicePriority(advice.priority),
    source: "coach_advice",
    label: advice.label,
    rationale: advice.rationale,
    relatedPlayerIds: [],
  }));
}

function buildTopActions(
  report: TeamSetupReport,
  weakPointAnalysis: WeakPointAnalysis,
  roleChangeRecommendations: RoleChangeRecommendationResult,
): ManagerInsightAction[] {
  const actions = [
    ...buildWeakPointActions(weakPointAnalysis),
    ...buildRoleChangeActions(roleChangeRecommendations),
    ...buildCoachAdviceActions(report),
  ];

  return sortActions(dedupeActions(actions)).slice(0, MAX_TOP_ACTIONS);
}

function buildSummary(
  setup: TeamSetupEvaluation,
  report: TeamSetupReport,
  weakPointAnalysis: WeakPointAnalysis,
  roleChangeRecommendations: RoleChangeRecommendationResult,
): string {
  if (!setup.isComplete) {
    return "Managerinnsikten er foreløpig: startelleveren må fullføres før treneren kan stole på helhetsvurderingen.";
  }

  const mainWeakPoint = weakPointAnalysis.mainWeakPoint;
  const strongRoleChanges = roleChangeRecommendations.strongChanges.length;

  if (mainWeakPoint) {
    return `Managerinnsikten peker først på dette: ${mainWeakPoint.label} ${mainWeakPoint.suggestedAction}`;
  }

  if (strongRoleChanges > 0) {
    return `Managerinnsikten fant ${strongRoleChanges} tydelige rolleendring(er) som bør vurderes før taktikken endres.`;
  }

  if (report.level === "elite") {
    return "Managerinnsikten viser et svært sterkt oppsett. Behold grunnstrukturen og gjør bare små justeringer.";
  }

  if (report.level === "good") {
    return "Managerinnsikten viser et godt oppsett. Laget fungerer, men treneren kan hente mer ut gjennom finjusteringer.";
  }

  if (report.level === "unstable") {
    return "Managerinnsikten viser et ustabilt oppsett. Kvaliteten finnes, men rollebruk og balanse bør strammes opp.";
  }

  return "Managerinnsikten viser et svakt oppsett. Problemet ligger i trenerens struktur, ikke nødvendigvis i spillerkvaliteten.";
}

export function createManagerInsight(input: ManagerInsightInput): ManagerInsight {
  const setup = evaluateTeamSetup(input);
  const report = createTeamSetupReport(setup);
  const weakPointAnalysis = analyzeWeakPoints(setup);
  const roleChangeRecommendations = recommendRoleChanges(input.team, input.tactic, input.roles);

  const topActions = buildTopActions(
    report,
    weakPointAnalysis,
    roleChangeRecommendations,
  );

  return {
    teamId: input.team.id,
    tacticId: input.tactic.id,

    setup,
    report,
    weakPointAnalysis,
    roleChangeRecommendations,

    topActions,

    summary: buildSummary(
      setup,
      report,
      weakPointAnalysis,
      roleChangeRecommendations,
    ),
  };
}
