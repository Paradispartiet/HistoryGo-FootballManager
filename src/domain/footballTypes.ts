// src/domain/footballTypes.ts

export type ID = string;
export type Score100 = number;
export type OverallScore = number;

export type PlayerAttribute =
  | "technique"
  | "firstTouch"
  | "passing"
  | "vision"
  | "creativity"
  | "dribbling"
  | "finishing"
  | "movement"
  | "offTheBall"
  | "pressing"
  | "positioning"
  | "duels"
  | "pace"
  | "tempo"
  | "strength"
  | "stamina"
  | "composure"
  | "leadership";

export type PlayerTrait =
  | "elite_dribbler"
  | "one_touch_player"
  | "through_ball_specialist"
  | "tempo_controller"
  | "late_box_runner"
  | "box_finisher"
  | "pressing_forward"
  | "target_player"
  | "space_attacker"
  | "wide_creator"
  | "inverted_creator"
  | "line_breaker"
  | "ball_winner"
  | "deep_playmaker"
  | "defensive_leader"
  | "aggressive_duelist"
  | "cover_defender"
  | "sweeper_keeper"
  | "risk_taker"
  | "safe_circulator"
  | "big_game_player";

export type PositionGroup =
  | "GK"
  | "DEF"
  | "MID"
  | "ATT";

export type Position =
  | "GK"
  | "RB"
  | "RCB"
  | "CB"
  | "LCB"
  | "LB"
  | "RWB"
  | "LWB"
  | "DM"
  | "RCM"
  | "CM"
  | "LCM"
  | "AM"
  | "RW"
  | "LW"
  | "ST";

export type TacticalFunction =
  | "creator"
  | "runner"
  | "finisher"
  | "press_trigger"
  | "tempo_controller"
  | "space_holder"
  | "duel_winner"
  | "balance_player"
  | "cover_player"
  | "build_up_player"
  | "wide_progressor";

export type RiskProfile =
  | "safe"
  | "balanced"
  | "aggressive";

export type PressingLevel =
  | "low"
  | "medium"
  | "high"
  | "ultra";

export type PossessionStyle =
  | "direct"
  | "balanced"
  | "patient";

export type WidthStyle =
  | "narrow"
  | "balanced"
  | "wide";

export type TempoStyle =
  | "slow"
  | "balanced"
  | "fast";

export type DefensiveLine =
  | "low"
  | "medium"
  | "high";

export type CreativeFreedom =
  | "low"
  | "medium"
  | "high";

export type Mentality =
  | "cautious"
  | "balanced"
  | "positive"
  | "attacking";

export type PlayerAttributes = Record<PlayerAttribute, Score100>;

export type TacticalNeeds = {
  needsWidth?: boolean;
  needsFreedom?: boolean;
  needsRunnersAround?: boolean;
  needsLowBlockBehind?: boolean;
  needsHighPressTeam?: boolean;
  needsBallDominance?: boolean;
  needsDirectService?: boolean;
  needsCombinationPlayers?: boolean;
  needsDefensiveCover?: boolean;
};

export type Player = {
  id: ID;
  name: string;
  overall: OverallScore;
  naturalPositions: Position[];
  attributes: PlayerAttributes;
  traits: PlayerTrait[];
  preferredRoles: ID[];
  weakRoles: ID[];
  tacticalNeeds?: TacticalNeeds;
};

export type RoleBehaviour = {
  holdsWidth?: boolean;
  attacksSpace?: boolean;
  dropsDeep?: boolean;
  playsBackToGoal?: boolean;
  receivesBetweenLines?: boolean;
  carriesBall?: boolean;
  crossesOften?: boolean;
  cutsInside?: boolean;
  pressesHigh?: boolean;
  protectsDefence?: boolean;
  dictatesTempo?: boolean;
  takesRisks?: boolean;
  coversBehind?: boolean;
};

export type Role = {
  id: ID;
  name: string;
  positionGroup: PositionGroup;
  allowedPositions: Position[];
  requiredAttributes: Partial<Record<PlayerAttribute, Score100>>;
  preferredTraits: PlayerTrait[];
  badTraits: PlayerTrait[];
  tacticalFunctions: TacticalFunction[];
  riskProfile: RiskProfile;
  behaviour: RoleBehaviour;
};

export type TacticPrinciples = {
  pressing: PressingLevel;
  possession: PossessionStyle;
  width: WidthStyle;
  tempo: TempoStyle;
  defensiveLine: DefensiveLine;
  creativeFreedom: CreativeFreedom;
  mentality: Mentality;
};

export type RoleAssignment = {
  playerId: ID;
  roleId: ID;
  position: Position;
};

export type Tactic = {
  id: ID;
  name: string;
  formation: string;
  principles: TacticPrinciples;
  roleAssignments: RoleAssignment[];
};

export type Team = {
  id: ID;
  name: string;
  squad: Player[];
  activeTacticId?: ID;
};

export type FitReasonCategory =
  | "attribute"
  | "trait"
  | "role"
  | "position"
  | "tactic"
  | "chemistry"
  | "balance";

export type FitReason = {
  code: string;
  category: FitReasonCategory;
  label: string;
  impact: number;
};

export type PlayerRoleFitResult = {
  playerId: ID;
  roleId: ID;
  position: Position;
  attributeFit: Score100;
  traitFit: Score100;
  positionFit: Score100;
  tacticFit: Score100;
  chemistryFit: Score100;
  finalFit: Score100;
  reasons: FitReason[];
};

export type TeamBalanceResult = {
  teamId: ID;
  attackingBalance: Score100;
  defensiveBalance: Score100;
  midfieldControl: Score100;
  pressingCoherence: Score100;
  widthBalance: Score100;
  riskBalance: Score100;
  finalBalance: Score100;
  reasons: FitReason[];
};

export type MatchSide = "home" | "away";

export type MatchContext = {
  homeAdvantage?: boolean;
  weather?: "normal" | "rain" | "wind" | "snow" | "heat";
  importance?: "low" | "normal" | "high" | "final";
  fatigueModifier?: number;
};

export type MatchEventType =
  | "chance"
  | "goal"
  | "big_chance"
  | "yellow_card"
  | "red_card"
  | "injury"
  | "substitution"
  | "tactical_shift"
  | "momentum_shift";

export type MatchEvent = {
  minute: number;
  type: MatchEventType;
  teamId: ID;
  playerId?: ID;
  assistPlayerId?: ID;
  description: string;
  reasons?: FitReason[];
};

export type PlayerMatchRating = {
  playerId: ID;
  roleId: ID;
  position: Position;
  rating: number;
  notes: string[];
};

export type TacticalMatchSummary = {
  teamId: ID;
  strengths: string[];
  weaknesses: string[];
  keyExplanations: string[];
};

export type MatchResult = {
  homeTeamId: ID;
  awayTeamId: ID;
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  playerRatings: PlayerMatchRating[];
  tacticalSummaries: TacticalMatchSummary[];
};

export type MatchInput = {
  homeTeam: Team;
  awayTeam: Team;
  homeTactic: Tactic;
  awayTactic: Tactic;
  roles: Role[];
  context?: MatchContext;
};
