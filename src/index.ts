// src/index.ts

export type {
  CreativeFreedom,
  DefensiveLine,
  FitReason,
  FitReasonCategory,
  ID,
  MatchContext,
  MatchEvent,
  MatchEventType,
  MatchInput,
  MatchResult,
  MatchSide,
  Mentality,
  OverallScore,
  Player,
  PlayerAttribute,
  PlayerAttributes,
  PlayerMatchRating,
  PlayerRoleFitResult,
  PlayerTrait,
  Position,
  PositionGroup,
  PressingLevel,
  PossessionStyle,
  RiskProfile,
  Role,
  RoleAssignment,
  RoleBehaviour,
  Score100,
  Tactic,
  TacticPrinciples,
  TacticalFunction,
  TacticalMatchSummary,
  TacticalNeeds,
  Team,
  TeamBalanceResult,
  TempoStyle,
  WidthStyle,
} from "./domain/footballTypes.js";

export type {
  MissingAssignment,
  TeamSetupEvaluation,
  TeamSetupEvaluationInput,
  TeamSetupIssue,
  TeamSetupIssueSeverity,
} from "./engine/evaluateTeamSetup.js";

export type {
  BalanceReportItem,
  CoachAdvice,
  CoachAdvicePriority,
  PlayerFitReport,
  PlayerFitReportStatus,
  TeamBalanceReport,
  TeamSetupReport,
  TeamSetupReportLevel,
  TeamSetupReportSeverity,
} from "./engine/createTeamSetupReport.js";

export type {
  RoleChangeCandidate,
  RoleChangeRecommendation,
  RoleChangeRecommendationResult,
  RoleChangeRecommendationStatus,
} from "./engine/recommendRoleChanges.js";

export { calculateRoleFit } from "./engine/calculateRoleFit.js";
export { calculateTeamBalance } from "./engine/calculateTeamBalance.js";
export { evaluateTeamSetup } from "./engine/evaluateTeamSetup.js";
export { createTeamSetupReport } from "./engine/createTeamSetupReport.js";
export { recommendRoleChanges } from "./engine/recommendRoleChanges.js";
