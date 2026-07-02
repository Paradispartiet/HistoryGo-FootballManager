// src/engine/selectFootballBookText.ts

import type { FootballKnowledgePhase, FootballKnowledgePrinciple } from "../domain/footballKnowledgeTypes.js";

export type FootballBookTextSurface =
  | "tooltip"
  | "assistant"
  | "training"
  | "matchReport"
  | "handbook";

export type FootballBookTextContext = FootballBookTextSurface;

const textFieldBySurface = {
  tooltip: "tooltipText",
  assistant: "assistantText",
  training: "trainingText",
  matchReport: "matchReportText",
  handbook: "handbookText",
} as const satisfies Record<FootballBookTextSurface, keyof FootballKnowledgePrinciple>;

export type FootballBookGameTextContext = {
  principles?: FootballKnowledgePrinciple[];
  weakPoints?: readonly string[];
  trainingAreas?: readonly string[];
  relatedTags?: readonly string[];
  phase?: FootballKnowledgePhase | null;
  surface: FootballBookTextSurface;
  existingFeedback?: string;
  maxResults?: number;
};

export type FootballBookGameTextMatch = {
  principleId: string;
  title: string;
  text: string;
  score: number;
  matchType: "weakPoint" | "trainingArea" | "tag";
};

export type SelectFootballBookTextInput = {
  principle?: FootballKnowledgePrinciple | null;
  context: FootballBookTextSurface;
  existingFeedback: string;
};

const WEAK_POINT_ALIAS_GROUPS = [
  ["pressing_weak", "press_weak", "pressing_coherence_weak", "weak_pressing_coherence"],
  ["rest_defense_weak", "defensive_balance_weak", "weak_defensive_balance", "risk_balance_weak", "weak_risk_balance"],
  ["team_balance_weak", "defensive_balance_weak", "weak_defensive_balance", "risk_balance_weak", "weak_risk_balance"],
  ["relationships_weak", "role_balance_weak", "role_understanding_weak", "team_balance_weak"],
  ["role_fit_weak", "average_role_fit_weak", "individual_role_fit_weak", "weak_average_role_fit"],
  ["attack_weak", "attacking_balance_weak"],
  ["build_up_weak", "midfield_control_weak"],
  ["width_weak", "width_balance_weak", "weak_width_balance"],
] as const;

const WEAK_POINT_ALIASES: Record<string, string[]> = WEAK_POINT_ALIAS_GROUPS.reduce(
  (aliases, group) => {
    for (const code of group) {
      aliases[code] = group.filter((candidate) => candidate !== code);
    }
    return aliases;
  },
  {} as Record<string, string[]>,
);

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function expandWeakPointCodes(codes: readonly string[] = []): Set<string> {
  const result = new Set<string>();
  for (const code of codes) {
    const normalized = normalize(code);
    result.add(normalized);
    for (const alias of WEAK_POINT_ALIASES[normalized] ?? []) {
      result.add(normalize(alias));
    }
  }
  return result;
}

function toNormalizedSet(values: readonly string[] = []): Set<string> {
  return new Set(values.map(normalize).filter(Boolean));
}

function hasIntersection(values: readonly string[], candidates: Set<string>): boolean {
  return values.some((value) => candidates.has(normalize(value)));
}

function surfaceAllowsMatch(
  surface: FootballBookTextSurface,
  matchType: FootballBookGameTextMatch["matchType"],
): boolean {
  if (surface === "assistant" || surface === "matchReport") {
    return matchType === "weakPoint";
  }

  if (surface === "training") {
    return matchType === "weakPoint" || matchType === "trainingArea";
  }

  return true;
}

function scorePrinciple(
  principle: FootballKnowledgePrinciple,
  context: FootballBookGameTextContext,
): FootballBookGameTextMatch["matchType"] | null {
  const weakPoints = expandWeakPointCodes(context.weakPoints);
  const matchesWeakPoint = weakPoints.size > 0 && hasIntersection(principle.appliesToWeakPoints, weakPoints);
  const trainingAreas = toNormalizedSet(context.trainingAreas);
  const matchesTrainingArea = trainingAreas.size > 0 && hasIntersection(principle.appliesToTrainingAreas, trainingAreas);

  if (weakPoints.size > 0 && !matchesWeakPoint) {
    return null;
  }

  if (context.surface === "training" && weakPoints.size > 0 && trainingAreas.size > 0) {
    if (matchesWeakPoint && matchesTrainingArea) {
      return "weakPoint";
    }

    return null;
  }

  if (matchesWeakPoint) {
    return surfaceAllowsMatch(context.surface, "weakPoint") ? "weakPoint" : null;
  }

  if (matchesTrainingArea) {
    return surfaceAllowsMatch(context.surface, "trainingArea") ? "trainingArea" : null;
  }

  const tags = toNormalizedSet(context.relatedTags);
  if (tags.size > 0 && hasIntersection(principle.relatedTags, tags)) {
    return surfaceAllowsMatch(context.surface, "tag") ? "tag" : null;
  }

  return null;
}

function matchScore(matchType: FootballBookGameTextMatch["matchType"], principle: FootballKnowledgePrinciple, context: FootballBookGameTextContext): number {
  const base = matchType === "weakPoint" ? 300 : matchType === "trainingArea" ? 200 : 100;
  const phaseBonus = context.phase && principle.phase === context.phase ? 25 : 0;
  return base + phaseBonus;
}

/**
 * Matcher tilpasset Fotballboka-spilltekst mot eksisterende spillkontekst.
 * Prioritet er bevisst: weak points først, deretter training areas, deretter
 * tags. På treningsflaten må en oppgitt weakPoint og en oppgitt øktflate
 * peke på samme prinsipp, slik at teksten både forklarer problemet og passer
 * eksisterende treningsområde. Uten eksplisitt match returneres ingen teori,
 * bare eksisterende fallback.
 */
export function getFootballBookGameText(context: FootballBookGameTextContext): FootballBookGameTextMatch[] {
  const field = textFieldBySurface[context.surface];
  const maxResults = context.maxResults ?? (context.surface === "handbook" ? 2 : 1);
  const principles = context.principles ?? [];

  return principles
    .map((principle) => {
      const text = principle[field];
      if (!hasText(text)) return null;

      const matchType = scorePrinciple(principle, context);
      if (!matchType) return null;

      return {
        principleId: principle.id,
        title: principle.title,
        text,
        score: matchScore(matchType, principle, context),
        matchType,
      } satisfies FootballBookGameTextMatch;
    })
    .filter((match): match is FootballBookGameTextMatch => match !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, Math.max(0, maxResults));
}

/**
 * Bakoverkompatibel helper for kode som allerede har valgt et prinsipp.
 */
export function selectFootballBookText(input: SelectFootballBookTextInput): string {
  const field = textFieldBySurface[input.context];
  const value = input.principle?.[field];

  if (hasText(value)) {
    return value;
  }

  return input.existingFeedback;
}
