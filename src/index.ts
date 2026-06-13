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
  RelationshipAssignment,
  RoleRelationship,
  RoleRelationshipResult,
  RoleRelationshipType,
} from "./engine/calculateRoleRelationships.js";

export { calculateRoleRelationships } from "./engine/calculateRoleRelationships.js";

export type {
  BadgeLevel,
  BadgeMetricEffects,
  BuildEarnedBadgeEffectContextInput,
  EarnedBadgeEffectContext,
  TrainingBadgeCatalog,
  TrainingBadgeFamily,
  TrainingBadgeLevelEntry,
} from "./engine/calculateBadgeMetricEffects.js";

export {
  applyBadgeEffectsToMetrics,
  buildEarnedBadgeEffectContext,
  calculateBadgeMetricEffects,
} from "./engine/calculateBadgeMetricEffects.js";

export type {
  HistoricalAssignment,
  HistoricalAssignmentFit,
  HistoricalAssignmentFitTone,
  HistoricalCoachContext,
  HistoricalFormation,
  HistoricalFormationFit,
  HistoricalMetricAdjustment,
  HistoricalMetricAdjustmentResult,
  HistoricalRoleCoverage,
  LegacyTeamMetrics,
  MatchEngineEffects,
} from "./engine/calculateHistoricalFormationFit.js";

export {
  buildHistoricalFormationReport,
  calculateHistoricalFormationFit,
  calculateHistoricalMetricAdjustments,
  calculateHistoricalRoleCoverage,
  mapLegacyRoleToHgRoleTypes,
} from "./engine/calculateHistoricalFormationFit.js";

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
  TrainingFocusArea,
  TrainingFocusIntensity,
  TrainingFocusItem,
  TrainingFocusPlan,
} from "./engine/createTrainingFocus.js";

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
  DashboardActionCard,
  DashboardCompletionPanel,
  DashboardKnowledgeCard,
  DashboardMetricCard,
  DashboardRoleChangeCard,
  DashboardScorePanel,
  DashboardSeverity,
  DashboardSummaryPanel,
  DashboardTrainingCard,
  DashboardWeakPointCard,
  ManagerDashboardData,
} from "./engine/createManagerDashboardData.js";

export type {
  DashboardActionViewModel,
  DashboardCompletionViewModel,
  DashboardKnowledgeViewModel,
  DashboardMetricViewModel,
  DashboardRoleChangeViewModel,
  DashboardScoreViewModel,
  DashboardSummaryViewModel,
  DashboardTrainingViewModel,
  DashboardViewModelCardClass,
  DashboardWeakPointViewModel,
  ManagerDashboardViewModel,
} from "./engine/createManagerDashboardViewModel.js";

export type {
  ManagerAppState,
  ManagerAppStateInput,
  ManagerAppStateStatus,
} from "./engine/createManagerAppState.js";

export type {
  FootballKnowledgeCategory,
  FootballKnowledgePhase,
  FootballKnowledgePriority,
  FootballKnowledgePrinciple,
  FootballKnowledgeRecommendation,
} from "./domain/footballKnowledgeTypes.js";

export type {
  FootballKnowledgeRecommendationInput,
} from "./engine/createFootballKnowledgeRecommendations.js";

export type {
  AdaptLegacyTacticInput,
  AdaptLegacyTeamInput,
  LegacyFootballFormation,
  LegacyFootballFormationSlot,
  LegacyFootballPlayer,
  LegacyFootballRole,
  LegacyFootballTactic,
  LegacyLineup,
  LegacyLineupSlotState,
} from "./engine/adaptLegacyFootballData.js";

export type {
  LegacyManagerAppState,
  LegacyManagerAppStateInput,
} from "./engine/createLegacyManagerAppState.js";

export type {
  ClubWeekEffects,
  ClubWeekMetric,
  ClubWeekPhase,
  ClubWeekState,
} from "./engine/createClubWeekState.js";

export { calculateRoleFit } from "./engine/calculateRoleFit.js";
export { calculateTeamBalance } from "./engine/calculateTeamBalance.js";
export { evaluateTeamSetup } from "./engine/evaluateTeamSetup.js";
export { createTeamSetupReport } from "./engine/createTeamSetupReport.js";
export { recommendRoleChanges } from "./engine/recommendRoleChanges.js";
export { analyzeWeakPoints } from "./engine/analyzeWeakPoints.js";
export { createTrainingFocus } from "./engine/createTrainingFocus.js";
export { createManagerInsight } from "./engine/createManagerInsight.js";
export { compareTactics } from "./engine/compareTactics.js";
export { compareFormations } from "./engine/compareFormations.js";
export { createManagerDashboardData } from "./engine/createManagerDashboardData.js";
export { createManagerDashboardViewModel } from "./engine/createManagerDashboardViewModel.js";
export { createManagerAppState } from "./engine/createManagerAppState.js";
export { createFootballKnowledgeRecommendations } from "./engine/createFootballKnowledgeRecommendations.js";

export {
  adaptLegacyPlayers,
  adaptLegacyRoles,
  adaptLegacyTactic,
  adaptLegacyTeam,
} from "./engine/adaptLegacyFootballData.js";

export { createLegacyManagerAppState } from "./engine/createLegacyManagerAppState.js";

export {
  advanceClubWeekPhase,
  applyClubWeekEffects,
  clampClubMetric,
  createClubWeekSummary,
  createInitialClubWeekState,
  getClubWeekPhaseLabel,
  isClubWeekPhase,
  normalizeClubWeekState,
} from "./engine/createClubWeekState.js";
