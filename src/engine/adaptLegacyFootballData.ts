// src/engine/adaptLegacyFootballData.ts

import type {
  Player,
  PlayerAttribute,
  PlayerAttributes,
  PlayerTrait,
  Position,
  PositionGroup,
  PressingLevel,
  Role,
  RoleAssignment,
  Score100,
  Tactic,
  TacticPrinciples,
  TacticalFunction,
  TacticalNeeds,
  Team,
  TempoStyle,
  WidthStyle,
} from "../domain/footballTypes.js";

export type LegacyFootballPlayer = {
  id: string;
  name: string;
  overall: number;
  naturalPositions: string[];
  usablePositions?: string[];
  poorFits?: string[];
  archetypes?: string[];
  strengths?: string[];
  needs?: string[];
  preferredRoles?: string[];
  likesTactics?: string[];
  dislikesTactics?: string[];
  warningWhenMisused?: string;
};

export type LegacyFootballRole = {
  id: string;
  name: string;
  positionGroup: string;
  validPositions: string[];
  requires?: string[];
  goodWith?: string[];
  badFor?: string[];
  tacticalLikes?: string[];
  tacticalDislikes?: string[];
};

export type LegacyFootballTactic = {
  id: string;
  name: string;
  formation: string;
  pressing?: string;
  tempo?: string;
  width?: string;
  buildUp?: string;
  chanceCreation?: string;
  defensiveLine?: string;
  tags?: string[];
};

export type LegacyFootballFormationSlot = {
  slotId: string;
  label: string;
  position: string;
  line: string;
};

export type LegacyFootballFormation = {
  id: string;
  name: string;
  description?: string;
  slots: LegacyFootballFormationSlot[];
};

export type LegacyLineupSlotState = {
  playerId?: string;
  roleId?: string;
};

export type LegacyLineup = Record<string, LegacyLineupSlotState>;

export type AdaptLegacyTeamInput = {
  teamId: string;
  teamName: string;
  players: LegacyFootballPlayer[];
};

export type AdaptLegacyTacticInput = {
  tactic: LegacyFootballTactic;
  formation: LegacyFootballFormation;
  lineup: LegacyLineup;
};

const DEFAULT_ATTRIBUTE_VALUE: Score100 = 76;
const STRONG_ATTRIBUTE_VALUE: Score100 = 88;
const ELITE_ATTRIBUTE_VALUE: Score100 = 92;

const VALID_POSITIONS = new Set<Position>([
  "GK",
  "RB",
  "RCB",
  "CB",
  "LCB",
  "LB",
  "RWB",
  "LWB",
  "DM",
  "RCM",
  "CM",
  "LCM",
  "AM",
  "RW",
  "LW",
  "ST",
]);

function clampScore(value: number): Score100 {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function toPosition(position: string): Position | null {
  if (position === "WB") {
    return "RWB";
  }

  if (VALID_POSITIONS.has(position as Position)) {
    return position as Position;
  }

  return null;
}

function toPositions(positions: string[] | undefined): Position[] {
  if (!positions) return [];

  return unique(
    positions
      .map(toPosition)
      .filter((position): position is Position => position !== null),
  );
}

function toPositionGroup(positionGroup: string): PositionGroup {
  if (positionGroup === "keeper") return "GK";
  if (positionGroup === "defender") return "DEF";
  if (positionGroup === "fullback") return "DEF";
  if (positionGroup === "midfield") return "MID";
  if (positionGroup === "attacking_midfield") return "MID";
  if (positionGroup === "wing") return "ATT";
  if (positionGroup === "striker") return "ATT";

  return "MID";
}

function emptyAttributes(): PlayerAttributes {
  return {
    technique: DEFAULT_ATTRIBUTE_VALUE,
    firstTouch: DEFAULT_ATTRIBUTE_VALUE,
    passing: DEFAULT_ATTRIBUTE_VALUE,
    vision: DEFAULT_ATTRIBUTE_VALUE,
    creativity: DEFAULT_ATTRIBUTE_VALUE,
    dribbling: DEFAULT_ATTRIBUTE_VALUE,
    finishing: DEFAULT_ATTRIBUTE_VALUE,
    movement: DEFAULT_ATTRIBUTE_VALUE,
    offTheBall: DEFAULT_ATTRIBUTE_VALUE,
    pressing: DEFAULT_ATTRIBUTE_VALUE,
    positioning: DEFAULT_ATTRIBUTE_VALUE,
    duels: DEFAULT_ATTRIBUTE_VALUE,
    pace: DEFAULT_ATTRIBUTE_VALUE,
    tempo: DEFAULT_ATTRIBUTE_VALUE,
    strength: DEFAULT_ATTRIBUTE_VALUE,
    stamina: DEFAULT_ATTRIBUTE_VALUE,
    composure: DEFAULT_ATTRIBUTE_VALUE,
    leadership: DEFAULT_ATTRIBUTE_VALUE,
  };
}

function boostAttribute(
  attributes: PlayerAttributes,
  attribute: PlayerAttribute,
  value: Score100,
): void {
  attributes[attribute] = Math.max(attributes[attribute], value);
}

function applyLegacyTagToAttributes(
  attributes: PlayerAttributes,
  tag: string,
): void {
  if (
    tag === "dribbling" ||
    tag === "one_vs_one" ||
    tag === "isolation" ||
    tag === "cut_inside" ||
    tag === "ball_carrying"
  ) {
    boostAttribute(attributes, "dribbling", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "technique", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "acceleration" ||
    tag === "pace" ||
    tag === "off_ball_runs" ||
    tag === "space_behind"
  ) {
    boostAttribute(attributes, "pace", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "movement", STRONG_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "offTheBall", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "vision" ||
    tag === "final_pass" ||
    tag === "passing_range" ||
    tag === "switches_of_play"
  ) {
    boostAttribute(attributes, "vision", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "passing", ELITE_ATTRIBUTE_VALUE);
  }

  if (
    tag === "first_touch" ||
    tag === "combination_play" ||
    tag === "hold_up_play"
  ) {
    boostAttribute(attributes, "firstTouch", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "technique", STRONG_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "composure", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "creativity" ||
    tag === "chance_creation" ||
    tag === "creative_freedom"
  ) {
    boostAttribute(attributes, "creativity", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "vision", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "finishing" ||
    tag === "box_finishing" ||
    tag === "box_service"
  ) {
    boostAttribute(attributes, "finishing", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "offTheBall", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "pressing" ||
    tag === "pressing_runs" ||
    tag === "pressing_triggers"
  ) {
    boostAttribute(attributes, "pressing", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "stamina", STRONG_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "tempo", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "stamina" ||
    tag === "engine" ||
    tag === "late_runs" ||
    tag === "transition_moments"
  ) {
    boostAttribute(attributes, "stamina", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "movement", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "positioning" ||
    tag === "covering" ||
    tag === "defensive_balance" ||
    tag === "defensive_reading" ||
    tag === "protected_zone"
  ) {
    boostAttribute(attributes, "positioning", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "composure", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "duels" ||
    tag === "heading" ||
    tag === "aerial" ||
    tag === "blocking" ||
    tag === "defensive_presence"
  ) {
    boostAttribute(attributes, "duels", ELITE_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "strength", STRONG_ATTRIBUTE_VALUE);
  }

  if (
    tag === "distribution" ||
    tag === "sweeping" ||
    tag === "build_up" ||
    tag === "structured_build_up"
  ) {
    boostAttribute(attributes, "passing", STRONG_ATTRIBUTE_VALUE);
    boostAttribute(attributes, "composure", STRONG_ATTRIBUTE_VALUE);
  }
}

function attributesFromLegacyPlayer(player: LegacyFootballPlayer): PlayerAttributes {
  const attributes = emptyAttributes();

  for (const tag of [
    ...(player.archetypes ?? []),
    ...(player.strengths ?? []),
    ...(player.needs ?? []),
  ]) {
    applyLegacyTagToAttributes(attributes, tag);
  }

  const classLift = Math.max(0, player.overall - 85);

  for (const key of Object.keys(attributes) as PlayerAttribute[]) {
    attributes[key] = clampScore(attributes[key] + classLift * 0.4);
  }

  return attributes;
}

function traitsFromLegacyPlayer(player: LegacyFootballPlayer): PlayerTrait[] {
  const tags = new Set([
    ...(player.archetypes ?? []),
    ...(player.strengths ?? []),
    ...(player.needs ?? []),
  ]);

  const traits: PlayerTrait[] = [];

  if (tags.has("dribbler") || tags.has("one_vs_one")) traits.push("elite_dribbler");
  if (tags.has("creator") || tags.has("final_pass")) traits.push("through_ball_specialist");
  if (tags.has("tempo_setter") || tags.has("controller")) traits.push("tempo_controller");
  if (tags.has("runner") || tags.has("late_runs")) traits.push("late_box_runner");
  if (tags.has("box_finishing") || tags.has("box_presence")) traits.push("box_finisher");
  if (tags.has("pressing_runs") || tags.has("pressing")) traits.push("pressing_forward");
  if (tags.has("target") || tags.has("aerial")) traits.push("target_player");
  if (tags.has("depth_threat") || tags.has("space_behind")) traits.push("space_attacker");
  if (tags.has("wide_creator") || tags.has("wide_support")) traits.push("wide_creator");
  if (tags.has("inverted") || tags.has("cut_inside")) traits.push("inverted_creator");
  if (tags.has("line_breaker") || tags.has("line_breaking_pass")) traits.push("line_breaker");
  if (tags.has("balance") || tags.has("screen")) traits.push("ball_winner");
  if (tags.has("passer") || tags.has("deep_playmaker")) traits.push("deep_playmaker");
  if (tags.has("defensive_presence")) traits.push("defensive_leader");
  if (tags.has("duel")) traits.push("aggressive_duelist");
  if (tags.has("covering") || tags.has("defensive_reading")) traits.push("cover_defender");
  if (tags.has("sweeper_keeper")) traits.push("sweeper_keeper");

  return unique(traits);
}

function tacticalNeedsFromLegacyPlayer(player: LegacyFootballPlayer): TacticalNeeds {
  const needs = new Set([
    ...(player.needs ?? []),
    ...(player.likesTactics ?? []),
  ]);

  return {
    needsWidth:
      needs.has("wide_space") ||
      needs.has("wide_attack") ||
      needs.has("wide_lane") ||
      needs.has("attacking_width"),
    needsFreedom:
      needs.has("creative_freedom") ||
      needs.has("space_between_lines"),
    needsRunnersAround:
      needs.has("runners_around") ||
      needs.has("runners_ahead") ||
      needs.has("third_man_runs"),
    needsLowBlockBehind:
      needs.has("compact_defense") ||
      needs.has("medium_or_low_line") ||
      needs.has("protected_box"),
    needsHighPressTeam:
      needs.has("high_press") ||
      needs.has("pressing_triggers"),
    needsBallDominance:
      needs.has("possession") ||
      needs.has("structured_build_up") ||
      needs.has("passing_options") ||
      needs.has("central_control"),
    needsDirectService:
      needs.has("direct_play") ||
      needs.has("direct_counter") ||
      needs.has("early_through_balls"),
    needsCombinationPlayers:
      needs.has("central_combinations") ||
      needs.has("close_support") ||
      needs.has("combination_play"),
    needsDefensiveCover:
      needs.has("cover_from_midfield") ||
      needs.has("cover_behind") ||
      needs.has("rest_defense") ||
      needs.has("stable_rest_defense"),
  };
}

function requiredAttributesFromLegacyRole(
  role: LegacyFootballRole,
): Partial<Record<PlayerAttribute, Score100>> {
  const attributes = emptyAttributes();
  const required: Partial<Record<PlayerAttribute, Score100>> = {};

  for (const tag of role.requires ?? []) {
    applyLegacyTagToAttributes(attributes, tag);
  }

  for (const key of Object.keys(attributes) as PlayerAttribute[]) {
    if (attributes[key] > DEFAULT_ATTRIBUTE_VALUE) {
      required[key] = attributes[key];
    }
  }

  return required;
}

function preferredTraitsFromLegacyRole(role: LegacyFootballRole): PlayerTrait[] {
  const fakePlayer: LegacyFootballPlayer = {
    id: role.id,
    name: role.name,
    overall: 90,
    naturalPositions: role.validPositions,
    archetypes: role.requires ?? [],
    strengths: role.goodWith ?? [],
    needs: role.tacticalLikes ?? [],
    preferredRoles: [role.id],
  };

  return traitsFromLegacyPlayer(fakePlayer);
}

function badTraitsFromLegacyRole(role: LegacyFootballRole): PlayerTrait[] {
  const tags = new Set([
    ...(role.badFor ?? []),
    ...(role.tacticalDislikes ?? []),
  ]);

  const traits: PlayerTrait[] = [];

  if (tags.has("back_to_goal_striker")) traits.push("target_player");
  if (tags.has("chaos")) traits.push("risk_taker");
  if (tags.has("constant_forward_runs")) traits.push("late_box_runner");
  if (tags.has("deep_block_only")) traits.push("sweeper_keeper");
  if (tags.has("long_ball_only")) traits.push("tempo_controller");

  return unique(traits);
}

function tacticalFunctionsFromLegacyRole(role: LegacyFootballRole): TacticalFunction[] {
  const tags = new Set([
    ...(role.requires ?? []),
    ...(role.goodWith ?? []),
    ...(role.tacticalLikes ?? []),
  ]);

  const functions: TacticalFunction[] = [];

  if (tags.has("chance_creation") || tags.has("creativity") || tags.has("vision")) functions.push("creator");
  if (tags.has("off_ball_runs") || tags.has("space_behind") || tags.has("late_runs")) functions.push("runner");
  if (tags.has("finishing") || tags.has("box_finishing") || tags.has("box_service")) functions.push("finisher");
  if (tags.has("pressing") || tags.has("high_press")) functions.push("press_trigger");
  if (tags.has("tempo_control") || tags.has("central_control")) functions.push("tempo_controller");
  if (tags.has("protected_zone") || tags.has("compact_midfield")) functions.push("space_holder");
  if (tags.has("duels") || tags.has("heading")) functions.push("duel_winner");
  if (tags.has("defensive_balance") || tags.has("rest_defense")) functions.push("balance_player");
  if (tags.has("covering") || tags.has("box_protection")) functions.push("cover_player");
  if (tags.has("structured_build_up") || tags.has("build_up")) functions.push("build_up_player");
  if (tags.has("wide_attack") || tags.has("wide_support") || tags.has("wide_lane")) functions.push("wide_progressor");

  return unique(functions.length > 0 ? functions : ["balance_player"]);
}

function adaptPressing(value: string | undefined): PressingLevel {
  if (value === "low") return "low";
  if (value === "medium_low") return "medium";
  if (value === "medium") return "medium";
  if (value === "high") return "high";
  if (value === "very_high") return "ultra";

  return "medium";
}

function adaptTempo(value: string | undefined): TempoStyle {
  if (value === "fast") return "fast";
  if (value === "controlled") return "slow";
  if (value === "direct_when_possible") return "fast";

  return "balanced";
}

function adaptWidth(value: string | undefined): WidthStyle {
  if (value === "wide") return "wide";
  if (value === "medium_wide") return "wide";
  if (value === "compact") return "narrow";
  if (value === "medium") return "balanced";

  return "balanced";
}

function tacticPrinciplesFromLegacyTactic(tactic: LegacyFootballTactic): TacticPrinciples {
  const tags = new Set(tactic.tags ?? []);

  return {
    pressing: adaptPressing(tactic.pressing),
    possession: tags.has("possession") || tags.has("structured_build_up")
      ? "patient"
      : tags.has("direct_counter") || tags.has("direct_play")
        ? "direct"
        : "balanced",
    width: adaptWidth(tactic.width),
    tempo: adaptTempo(tactic.tempo),
    defensiveLine: tactic.defensiveLine === "low" || tactic.defensiveLine === "medium_low"
      ? "low"
      : tactic.defensiveLine === "high" || tactic.defensiveLine === "medium_high"
        ? "high"
        : "medium",
    creativeFreedom: tags.has("creative_freedom") || tags.has("fluid_attack")
      ? "high"
      : "medium",
    mentality: tags.has("low_block")
      ? "cautious"
      : tags.has("high_press") || tags.has("vertical_play")
        ? "positive"
        : "balanced",
  };
}

export function adaptLegacyPlayers(players: LegacyFootballPlayer[]): Player[] {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    overall: clampScore(player.overall),
    naturalPositions: toPositions(player.naturalPositions),
    attributes: attributesFromLegacyPlayer(player),
    traits: traitsFromLegacyPlayer(player),
    preferredRoles: player.preferredRoles ?? [],
    weakRoles: [],
    tacticalNeeds: tacticalNeedsFromLegacyPlayer(player),
  }));
}

export function adaptLegacyRoles(roles: LegacyFootballRole[]): Role[] {
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    positionGroup: toPositionGroup(role.positionGroup),
    allowedPositions: toPositions(role.validPositions),
    requiredAttributes: requiredAttributesFromLegacyRole(role),
    preferredTraits: preferredTraitsFromLegacyRole(role),
    badTraits: badTraitsFromLegacyRole(role),
    tacticalFunctions: tacticalFunctionsFromLegacyRole(role),
    riskProfile: role.tacticalLikes?.includes("high_risk_build_up") ||
      role.tacticalLikes?.includes("all_out_attack")
      ? "aggressive"
      : role.tacticalLikes?.includes("rest_defense") ||
          role.tacticalLikes?.includes("compact_shape")
        ? "safe"
        : "balanced",
    behaviour: {
      holdsWidth: Boolean(role.tacticalLikes?.includes("wide_attack") ||
        role.requires?.includes("wide_lane")),
      attacksSpace: Boolean(role.requires?.includes("space_behind") ||
        role.requires?.includes("off_ball_runs")),
      dropsDeep: role.id === "false_nine" || role.id === "linking_striker",
      playsBackToGoal: role.id === "target_striker" || role.id === "linking_striker",
      receivesBetweenLines: Boolean(role.validPositions.includes("AM") ||
        role.requires?.includes("space_between_lines")),
      carriesBall: Boolean(role.requires?.includes("dribbling") ||
        role.requires?.includes("ball_carrying")),
      crossesOften: Boolean(role.requires?.includes("crossing")),
      cutsInside: role.id === "inverted_winger" || Boolean(role.requires?.includes("cut_inside")),
      pressesHigh: Boolean(role.tacticalLikes?.includes("high_press") ||
        role.requires?.includes("pressing")),
      protectsDefence: Boolean(role.requires?.includes("defensive_balance") ||
        role.tacticalLikes?.includes("rest_defense")),
      dictatesTempo: Boolean(role.requires?.includes("tempo_control") ||
        role.requires?.includes("passing_range")),
      takesRisks: Boolean(role.tacticalLikes?.includes("creative_freedom")) ||
        role.id === "free_creator",
      coversBehind: Boolean(role.requires?.includes("covering") ||
        role.tacticalLikes?.includes("rest_defense")),
    },
  }));
}

export function adaptLegacyTeam(input: AdaptLegacyTeamInput): Team {
  return {
    id: input.teamId,
    name: input.teamName,
    squad: adaptLegacyPlayers(input.players),
  };
}

export function adaptLegacyTactic(input: AdaptLegacyTacticInput): Tactic {
  const roleAssignments: RoleAssignment[] = input.formation.slots
    .map((slot): RoleAssignment | null => {
      const state = input.lineup[slot.slotId];

      if (!state?.playerId || !state.roleId) {
        return null;
      }

      const position = toPosition(slot.position);

      if (!position) {
        return null;
      }

      return {
        playerId: state.playerId,
        roleId: state.roleId,
        position,
        slotId: slot.slotId,
      };
    })
    .filter((assignment): assignment is RoleAssignment => assignment !== null);

  return {
    id: input.tactic.id,
    name: input.tactic.name,
    formation: input.tactic.formation,
    principles: tacticPrinciplesFromLegacyTactic(input.tactic),
    roleAssignments,
    // Bær med rå legacy-tagger slik at den tagg-drevne relasjonsmotoren får
    // samme input som legacy (exactOptionalPropertyTypes: utelat hvis tom).
    ...(input.tactic.tags ? { tags: input.tactic.tags } : {}),
  };
}
