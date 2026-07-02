// src/domain/footballKnowledgeTypes.ts

/**
 * Football Knowledge Engine – domenetyper.
 *
 * Dette er kunnskapslaget: fotballfaglige prinsipper som regelbasert,
 * testbar data. Typene her beskriver hvordan et prinsipp kobles til
 * svakheter, treningsfokus og managerinnsikt.
 *
 * Ingen DOM, ingen fetch, ingen avhengighet til kampmotoren.
 */

export type FootballKnowledgeCategory =
  | "keeper"
  | "forsvar"
  | "press"
  | "bredde"
  | "dybde"
  | "oppbygging"
  | "midtbanekontroll"
  | "angrepsstruktur"
  | "restforsvar"
  | "rolleforståelse"
  | "kampanalyse"
  | "treningsmetodikk";

export type FootballKnowledgePhase =
  | "attack"
  | "defence"
  | "transition"
  | "set_piece"
  | "general";

export type FootballKnowledgePriority =
  | "high"
  | "medium"
  | "low";

export type FootballKnowledgePrinciple = {
  id: string;
  title: string;
  category: FootballKnowledgeCategory;
  phase: FootballKnowledgePhase;
  summary: string;
  appliesToWeakPoints: string[];
  appliesToTrainingAreas: string[];
  relatedTags: string[];
  coachAdvice: string;
  trainingSession: string;
  tooltipText: string;
  assistantText: string;
  trainingText: string;
  matchReportText: string;
  handbookText: string;
};

export type FootballKnowledgeRecommendation = {
  principleId: string;
  title: string;
  category: FootballKnowledgeCategory;
  priority: FootballKnowledgePriority;
  reason: string;
  coachAdvice: string;
  trainingSession: string;
  tooltipText: string;
  assistantText: string;
  trainingText: string;
  matchReportText: string;
  handbookText: string;
};
