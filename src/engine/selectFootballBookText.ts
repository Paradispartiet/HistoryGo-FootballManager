// src/engine/selectFootballBookText.ts

import type { FootballKnowledgePrinciple } from "../domain/footballKnowledgeTypes.js";

export type FootballBookTextContext =
  | "tooltip"
  | "assistant"
  | "training"
  | "matchReport"
  | "handbook";

const textFieldByContext = {
  tooltip: "tooltipText",
  assistant: "assistantText",
  training: "trainingText",
  matchReport: "matchReportText",
  handbook: "handbookText",
} as const satisfies Record<FootballBookTextContext, keyof FootballKnowledgePrinciple>;

export type SelectFootballBookTextInput = {
  principle?: FootballKnowledgePrinciple | null;
  context: FootballBookTextContext;
  existingFeedback: string;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Henter spilltilpasset Fotballboka-tekst for en konkret flate.
 *
 * Selector-en gjør ingen matching og finner ikke på teori selv: hvis prinsippet
 * mangler tekstvarianten for konteksten, returneres eksisterende feedback fra
 * taktikkmotoren/managerinnsikten.
 */
export function selectFootballBookText(input: SelectFootballBookTextInput): string {
  const field = textFieldByContext[input.context];
  const value = input.principle?.[field];

  if (hasText(value)) {
    return value;
  }

  return input.existingFeedback;
}
