// src/engine/createFootballKnowledgeRecommendations.ts

import type {
  FootballKnowledgePrinciple,
  FootballKnowledgePriority,
  FootballKnowledgeRecommendation,
} from "../domain/footballKnowledgeTypes.js";

import type {
  WeakPoint,
  WeakPointAnalysis,
} from "./analyzeWeakPoints.js";

import type {
  TrainingFocusItem,
  TrainingFocusPlan,
} from "./createTrainingFocus.js";

/**
 * Input til kunnskapsmotoren.
 *
 * Funksjonen tar bare de delene av managerinnsikten den faktisk bruker
 * (svakhetsanalyse og treningsfokus). Det holder funksjonen ren og testbar,
 * og lar createManagerInsight bygge anbefalingene uten en sirkulær avhengighet
 * til en ferdig ManagerInsight.
 *
 * Prinsippene sendes inn som parameter – funksjonen leser ikke filer, gjør
 * ikke fetch og rører ikke DOM.
 */
export type FootballKnowledgeRecommendationInput = {
  weakPointAnalysis: WeakPointAnalysis;
  trainingFocusPlan: TrainingFocusPlan;
  principles: FootballKnowledgePrinciple[];
};

function priorityRank(priority: FootballKnowledgePriority): number {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function matchedWeakPoints(
  principle: FootballKnowledgePrinciple,
  weakPoints: WeakPoint[],
): WeakPoint[] {
  const codes = new Set(principle.appliesToWeakPoints);
  return weakPoints.filter((weakPoint) => codes.has(weakPoint.code));
}

function matchedTrainingFocus(
  principle: FootballKnowledgePrinciple,
  weeklyPlan: TrainingFocusItem[],
): TrainingFocusItem[] {
  const areas = new Set(principle.appliesToTrainingAreas);
  return weeklyPlan.filter((item) => areas.has(item.area));
}

function resolvePriority(
  matchedWeak: WeakPoint[],
  matchedTraining: TrainingFocusItem[],
  mainWeakPointCode: string | null,
  highPriorityCodes: Set<string>,
): FootballKnowledgePriority {
  const matchesMainOrHigh = matchedWeak.some(
    (weakPoint) =>
      weakPoint.code === mainWeakPointCode || highPriorityCodes.has(weakPoint.code),
  );

  if (matchesMainOrHigh) {
    return "high";
  }

  if (matchedTraining.length > 0) {
    return "medium";
  }

  return "low";
}

function buildReason(
  matchedWeak: WeakPoint[],
  matchedTraining: TrainingFocusItem[],
): string {
  const parts: string[] = [];

  if (matchedWeak.length > 0) {
    const labels = matchedWeak.map((weakPoint) => weakPoint.label).join(" ");
    parts.push(`Knyttet til svakhet i oppsettet: ${labels}`);
  }

  if (matchedTraining.length > 0) {
    const areas = [...new Set(matchedTraining.map((item) => item.area))].join(", ");
    parts.push(`Støtter ukens treningsfokus: ${areas}.`);
  }

  if (parts.length === 0) {
    return "Generelt fotballfaglig prinsipp for dette oppsettet.";
  }

  return parts.join(" ");
}

/**
 * Kobler fotballfaglige prinsipper mot managerinnsikten.
 *
 * Funksjonen leser svakhetsanalysen og treningsfokuset i innsikten, matcher
 * prinsipper på weakPoint-koder og treningsområder, deduplikerer på prinsipp-id
 * og prioriterer hver anbefaling.
 */
export function createFootballKnowledgeRecommendations(
  input: FootballKnowledgeRecommendationInput,
): FootballKnowledgeRecommendation[] {
  const { weakPointAnalysis, trainingFocusPlan, principles } = input;

  const weakPoints = weakPointAnalysis.weakPoints;
  const weeklyPlan = trainingFocusPlan.weeklyPlan;

  const mainWeakPointCode = weakPointAnalysis.mainWeakPoint?.code ?? null;
  const highPriorityCodes = new Set(
    weakPointAnalysis.highPriorityWeakPoints.map((weakPoint) => weakPoint.code),
  );

  const seen = new Set<string>();
  const recommendations: FootballKnowledgeRecommendation[] = [];

  for (const principle of principles) {
    if (seen.has(principle.id)) {
      continue;
    }

    const matchedWeak = matchedWeakPoints(principle, weakPoints);
    const matchedTraining = matchedTrainingFocus(principle, weeklyPlan);

    if (matchedWeak.length === 0 && matchedTraining.length === 0) {
      continue;
    }

    seen.add(principle.id);

    const priority = resolvePriority(
      matchedWeak,
      matchedTraining,
      mainWeakPointCode,
      highPriorityCodes,
    );

    recommendations.push({
      principleId: principle.id,
      title: principle.title,
      category: principle.category,
      priority,
      reason: buildReason(matchedWeak, matchedTraining),
      coachAdvice: principle.coachAdvice,
      trainingSession: principle.trainingSession,
      tooltipText: principle.tooltipText,
      assistantText: principle.assistantText,
      trainingText: principle.trainingText,
      matchReportText: principle.matchReportText,
      handbookText: principle.handbookText,
    });
  }

  return recommendations.sort(
    (a, b) => priorityRank(b.priority) - priorityRank(a.priority),
  );
}
