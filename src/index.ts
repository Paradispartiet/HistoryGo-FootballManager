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

export type {
  WeakPoint,
  WeakPointAnalysis,
  WeakPointCategory,
  WeakPointSeverity,
} from "./engine/analyzeWeakPoints.js";

export type {
  ManagerInsight,
  ManagerInsightAction,
  ManagerInsightActionSource,
  ManagerInsightInput,
  ManagerInsightPriority,
} from "./engine/createManagerInsight.js";

export type {
  TacticalComparisonInput,
  TacticalComparisonItem,
  TacticalComparisonResult,
  TacticalComparisonStatus,
} from "./engine/compareTactics.js";

export type {
  FormationComparisonInput,
  FormationComparisonItem,
  FormationComparisonResult,
  FormationComparisonStatus,
} from "./engine/compareFormations.js";

export type {
  TrainingFocusArea,
  TrainingFocusIntensity,
  TrainingFocusItem,
  TrainingFocusPlan,
} from "./engine/createTrainingFocus.js";

export { calculateRoleFit } from "./engine/calculateRoleFit.js";
export { calculateTeamBalance } from "./engine/calculateTeamBalance.js";
export { evaluateTeamSetup } from "./engine/evaluateTeamSetup.js";
export { createTeamSetupReport } from "./engine/createTeamSetupReport.js";
export { recommendRoleChanges } from "./engine/recommendRoleChanges.js";
export { analyzeWeakPoints } from "./engine/analyzeWeakPoints.js";
export { createManagerInsight } from "./engine/createManagerInsight.js";
export { compareTactics } from "./engine/compareTactics.js";
export { compareFormations } from "./engine/compareFormations.js";
export { createTrainingFocus } from "./engine/createTrainingFocus.js";
