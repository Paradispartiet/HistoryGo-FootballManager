// src/sample/readLegacyManagerAppStateSample.ts

import type {
  LegacyFootballFormation,
  LegacyFootballPlayer,
  LegacyFootballRole,
  LegacyFootballTactic,
  LegacyLineup,
} from "../engine/adaptLegacyFootballData.js";

import type {
  LegacyManagerAppState,
} from "../engine/createLegacyManagerAppState.js";

import { createLegacyManagerAppState } from "../engine/createLegacyManagerAppState.js";

export type ReadableLegacyManagerAppStateSample = {
  teamId: string;
  tacticId: string;

  summary: string;
  status: string;

  adaptedPlayers: number;
  adaptedRoles: number;
  adaptedAssignments: number;

  setupScore: string;
  teamBalance: string;
  reportLevel: string;

  managerSummary: string;

  topActions: string[];
  trainingPlan: string[];
  roleChanges: string[];
  weakPoints: string[];
};

export const legacySamplePlayers: LegacyFootballPlayer[] = [
  {
    id: "legacy_gk_01",
    name: "Legacy Sweeperkeeper",
    classHeight: 92,
    naturalPositions: ["GK"],
    usablePositions: [],
    poorFits: ["CB", "DM", "ST"],
    archetypes: ["sweeper_keeper", "distribution"],
    strengths: ["distribution", "sweeping", "composure"],
    needs: ["high_line", "passing_options", "structured_build_up"],
    preferredRoles: ["sweeperkeeper"],
    likesTactics: ["high_line", "possession", "structured_build_up"],
    dislikesTactics: ["deep_block_only", "clearance_only"],
    warningWhenMisused: "Keeperen bør brukes aktivt i oppbyggingen.",
  },
  {
    id: "legacy_lb_01",
    name: "Legacy Venstreback",
    classHeight: 88,
    naturalPositions: ["LB"],
    usablePositions: ["RB"],
    poorFits: ["CB", "ST"],
    archetypes: ["overlap", "wide_support"],
    strengths: ["overlapping_runs", "stamina", "wide_support"],
    needs: ["wide_lane", "cover_from_midfield", "attacking_width"],
    preferredRoles: ["overlapping_fullback"],
    likesTactics: ["wide_attack", "overloads", "high_width"],
    dislikesTactics: ["narrow_fullback", "no_cover"],
    warningWhenMisused: "Backen trenger bred korridor og sikring bak seg.",
  },
  {
    id: "legacy_lcb_01",
    name: "Legacy Ballspillende stopper",
    classHeight: 91,
    naturalPositions: ["CB"],
    usablePositions: ["DM"],
    poorFits: ["ST", "LW", "RW"],
    archetypes: ["build_up_defender", "passer"],
    strengths: ["passing_range", "composure", "line_breaking_pass"],
    needs: ["structured_build_up", "passing_options", "midfield_angles"],
    preferredRoles: ["ball_playing_centre_back"],
    likesTactics: ["possession", "structured_build_up", "central_control"],
    dislikesTactics: ["clearance_only", "deep_block_only"],
    warningWhenMisused: "Stopperen bør få bygge spill.",
  },
  {
    id: "legacy_rcb_01",
    name: "Legacy Duellstopper",
    classHeight: 89,
    naturalPositions: ["CB"],
    usablePositions: [],
    poorFits: ["DM", "CM", "ST"],
    archetypes: ["duel", "box_defender"],
    strengths: ["heading", "duels", "blocking", "defensive_presence"],
    needs: ["covering_partner", "compact_shape", "box_protection"],
    preferredRoles: ["duel_centre_back"],
    likesTactics: ["compact_shape", "cross_defense", "second_balls"],
    dislikesTactics: ["very_high_line", "constant_open_space"],
    warningWhenMisused: "Stopperen bør ikke isoleres i store rom.",
  },
  {
    id: "legacy_rb_01",
    name: "Legacy Høyreback",
    classHeight: 88,
    naturalPositions: ["RB"],
    usablePositions: ["LB"],
    poorFits: ["CB", "ST"],
    archetypes: ["overlap", "wide_support"],
    strengths: ["overlapping_runs", "stamina", "wide_support"],
    needs: ["wide_lane", "cover_from_midfield", "attacking_width"],
    preferredRoles: ["overlapping_fullback"],
    likesTactics: ["wide_attack", "overloads", "high_width"],
    dislikesTactics: ["narrow_fullback", "no_cover"],
    warningWhenMisused: "Backen trenger bred korridor og sikring bak seg.",
  },
  {
    id: "legacy_dm_01",
    name: "Legacy Balanserende sekser",
    classHeight: 90,
    naturalPositions: ["DM"],
    usablePositions: ["CM"],
    poorFits: ["ST", "LW", "RW"],
    archetypes: ["balance", "screen", "positioning"],
    strengths: ["positioning", "covering", "simple_passing", "defensive_balance"],
    needs: ["clear_structure", "compact_midfield", "stable_rest_defense"],
    preferredRoles: ["balancing_six"],
    likesTactics: ["compact_shape", "rest_defense", "medium_press", "possession"],
    dislikesTactics: ["chaos", "constant_forward_runs"],
    warningWhenMisused: "Sekseren skal gi balanse, ikke fri offensiv løping.",
  },
  {
    id: "legacy_lcm_01",
    name: "Legacy Dyp playmaker",
    classHeight: 93,
    naturalPositions: ["CM", "DM"],
    usablePositions: [],
    poorFits: ["ST", "LW", "RW"],
    archetypes: ["controller", "passer", "tempo_setter"],
    strengths: ["passing_range", "vision", "tempo_control", "switches_of_play"],
    needs: ["passing_options", "structured_build_up", "wide_receivers"],
    preferredRoles: ["deep_playmaker"],
    likesTactics: ["possession", "structured_build_up", "central_control"],
    dislikesTactics: ["chaos", "long_ball_only"],
    warningWhenMisused: "Playmakeren trenger pasningsvinkler og struktur.",
  },
  {
    id: "legacy_rcm_01",
    name: "Legacy Boks-til-boks",
    classHeight: 90,
    naturalPositions: ["CM"],
    usablePositions: ["AM", "DM"],
    poorFits: ["CB", "ST"],
    archetypes: ["runner", "engine", "transition_midfielder"],
    strengths: ["stamina", "pressing", "late_runs", "ball_carrying"],
    needs: ["vertical_space", "pressing_triggers", "cover_behind"],
    preferredRoles: ["box_to_box"],
    likesTactics: ["high_press", "fast_transitions", "vertical_play"],
    dislikesTactics: ["static_low_tempo", "fixed_holding_role"],
    warningWhenMisused: "Midtbanespilleren må få løpe, presse og komme i andre bølge.",
  },
  {
    id: "legacy_lw_01",
    name: "Legacy Venstrekant",
    classHeight: 91,
    naturalPositions: ["LW"],
    usablePositions: ["RW", "AM"],
    poorFits: ["ST", "DM", "CB"],
    archetypes: ["dribbler", "wide_creator", "one_vs_one"],
    strengths: ["dribbling", "acceleration", "isolation", "chance_creation"],
    needs: ["wide_space", "one_vs_one", "overlapping_fullback", "quick_switches"],
    preferredRoles: ["wide_dribbler"],
    likesTactics: ["wide_attack", "fast_transitions", "creative_freedom"],
    dislikesTactics: ["back_to_goal_striker", "narrow_low_tempo"],
    warningWhenMisused: "Kanten trenger rom til å utfordre.",
  },
  {
    id: "legacy_st_01",
    name: "Legacy Presspiss",
    classHeight: 90,
    naturalPositions: ["ST"],
    usablePositions: ["LW", "RW"],
    poorFits: ["CB", "DM"],
    archetypes: ["runner", "pace", "depth_threat"],
    strengths: ["acceleration", "off_ball_runs", "finishing", "pressing_runs"],
    needs: ["space_behind", "early_through_balls", "direct_play"],
    preferredRoles: ["pressing_forward"],
    likesTactics: ["high_press", "fast_transitions", "vertical_play"],
    dislikesTactics: ["slow_possession", "back_to_goal_striker"],
    warningWhenMisused: "Spissen trenger rom og pressmuligheter.",
  },
  {
    id: "legacy_rw_01",
    name: "Legacy Høyrekant",
    classHeight: 92,
    naturalPositions: ["RW"],
    usablePositions: ["LW", "AM"],
    poorFits: ["ST", "DM", "CB"],
    archetypes: ["dribbler", "wide_creator", "one_vs_one"],
    strengths: ["dribbling", "agility", "isolation", "cut_inside"],
    needs: ["wide_space", "one_vs_one", "overlapping_fullback", "quick_switches"],
    preferredRoles: ["inverted_winger"],
    likesTactics: ["wide_attack", "central_combinations", "creative_freedom"],
    dislikesTactics: ["crossing_only", "deep_block_only"],
    warningWhenMisused: "Kanten bør få utfordre eller skjære inn med støtte rundt seg.",
  },
];

export const legacySampleRoles: LegacyFootballRole[] = [
  {
    id: "sweeperkeeper",
    name: "Sweeperkeeper",
    positionGroup: "keeper",
    validPositions: ["GK"],
    requires: ["distribution", "sweeping", "high_line", "structured_build_up", "composure"],
    goodWith: ["ball_playing_centre_back", "high_line", "possession"],
    badFor: ["deep_block_only", "clearance_only"],
    tacticalLikes: ["high_line", "possession", "structured_build_up"],
    tacticalDislikes: ["deep_block_only", "clearance_only"],
  },
  {
    id: "overlapping_fullback",
    name: "Overlappende back",
    positionGroup: "fullback",
    validPositions: ["LB", "RB"],
    requires: ["overlapping_runs", "crossing", "stamina", "wide_lane", "wide_support"],
    goodWith: ["wide_dribbler", "inverted_winger", "box_striker"],
    badFor: ["narrow_fullback", "no_cover"],
    tacticalLikes: ["wide_attack", "overloads", "high_width"],
    tacticalDislikes: ["narrow_low_tempo", "no_cover"],
  },
  {
    id: "ball_playing_centre_back",
    name: "Ballspillende stopper",
    positionGroup: "defender",
    validPositions: ["CB"],
    requires: ["passing_range", "composure", "line_breaking_pass", "structured_build_up"],
    goodWith: ["deep_playmaker", "sweeperkeeper", "central_control"],
    badFor: ["clearance_only", "no_passing_options"],
    tacticalLikes: ["possession", "structured_build_up", "central_control"],
    tacticalDislikes: ["clearance_only", "deep_block_only"],
  },
  {
    id: "duel_centre_back",
    name: "Duellstopper",
    positionGroup: "defender",
    validPositions: ["CB"],
    requires: ["heading", "duels", "blocking", "compact_shape", "box_protection"],
    goodWith: ["ball_playing_centre_back", "low_block"],
    badFor: ["very_high_line", "constant_open_space"],
    tacticalLikes: ["compact_shape", "cross_defense", "second_balls"],
    tacticalDislikes: ["very_high_line", "high_risk_build_up"],
  },
  {
    id: "balancing_six",
    name: "Balanserende sekser",
    positionGroup: "midfield",
    validPositions: ["DM"],
    requires: ["positioning", "covering", "defensive_balance", "compact_midfield", "stable_rest_defense"],
    goodWith: ["deep_playmaker", "box_to_box"],
    badFor: ["constant_forward_runs", "unprotected_midfield"],
    tacticalLikes: ["compact_shape", "rest_defense", "medium_press", "possession"],
    tacticalDislikes: ["chaos", "high_risk_build_up"],
  },
  {
    id: "deep_playmaker",
    name: "Dyp playmaker",
    positionGroup: "midfield",
    validPositions: ["DM", "CM"],
    requires: ["passing_range", "vision", "tempo_control", "passing_options"],
    goodWith: ["wide_receivers", "channel_runner", "structured_build_up"],
    badFor: ["chaos", "isolated_midfield"],
    tacticalLikes: ["possession", "structured_build_up", "central_control"],
    tacticalDislikes: ["long_ball_only", "chaos"],
  },
  {
    id: "box_to_box",
    name: "Boks-til-boks",
    positionGroup: "midfield",
    validPositions: ["CM"],
    requires: ["stamina", "pressing", "late_runs", "vertical_space", "ball_carrying"],
    goodWith: ["balancing_six", "deep_playmaker", "linking_striker"],
    badFor: ["fixed_holding_role", "static_low_tempo"],
    tacticalLikes: ["high_press", "fast_transitions", "vertical_play"],
    tacticalDislikes: ["static_low_tempo", "deep_block_only"],
  },
  {
    id: "wide_dribbler",
    name: "Bred dribler",
    positionGroup: "wing",
    validPositions: ["LW", "RW"],
    requires: ["dribbling", "one_vs_one", "acceleration", "wide_space", "isolation"],
    goodWith: ["overlapping_fullback", "fast_transitions", "wide_attack"],
    badFor: ["back_to_goal_striker", "narrow_low_tempo"],
    tacticalLikes: ["wide_attack", "fast_transitions", "creative_freedom"],
    tacticalDislikes: ["narrow_low_tempo", "static_crossing"],
  },
  {
    id: "inverted_winger",
    name: "Innoverkant",
    positionGroup: "wing",
    validPositions: ["LW", "RW"],
    requires: ["dribbling", "cut_inside", "chance_creation", "acceleration"],
    goodWith: ["overlapping_fullback", "central_combinations"],
    badFor: ["wide_lane_only", "no_overlap"],
    tacticalLikes: ["wide_attack", "central_combinations", "creative_freedom"],
    tacticalDislikes: ["crossing_only", "deep_block_only"],
  },
  {
    id: "pressing_forward",
    name: "Presspiss",
    positionGroup: "striker",
    validPositions: ["ST"],
    requires: ["pressing_runs", "stamina", "off_ball_runs", "acceleration", "pressing"],
    goodWith: ["high_press", "box_to_box", "vertical_play"],
    badFor: ["deep_block_only", "static_low_tempo"],
    tacticalLikes: ["high_press", "fast_transitions", "vertical_play", "pressing"],
    tacticalDislikes: ["low_block", "slow_possession"],
  },
];

export const legacySampleFormation: LegacyFootballFormation = {
  id: "4-3-3",
  name: "4-3-3",
  description: "Legacy sample-formasjon.",
  slots: [
    { slotId: "gk", label: "Keeper", position: "GK", line: "keeper" },
    { slotId: "lb", label: "Venstreback", position: "LB", line: "defense" },
    { slotId: "lcb", label: "Venstre stopper", position: "CB", line: "defense" },
    { slotId: "rcb", label: "Høyre stopper", position: "CB", line: "defense" },
    { slotId: "rb", label: "Høyreback", position: "RB", line: "defense" },
    { slotId: "dm", label: "Sekser", position: "DM", line: "midfield" },
    { slotId: "lcm", label: "Venstre indreløper", position: "CM", line: "midfield" },
    { slotId: "rcm", label: "Høyre indreløper", position: "CM", line: "midfield" },
    { slotId: "lw", label: "Venstrekant", position: "LW", line: "attack" },
    { slotId: "st", label: "Spiss", position: "ST", line: "attack" },
    { slotId: "rw", label: "Høyrekant", position: "RW", line: "attack" },
  ],
};

export const legacySampleTactic: LegacyFootballTactic = {
  id: "legacy_wide_fast_433",
  name: "Legacy bredt og hurtig 4-3-3",
  formation: "4-3-3",
  pressing: "high",
  tempo: "fast",
  width: "wide",
  buildUp: "direct_wide",
  chanceCreation: "isolate_wingers",
  defensiveLine: "medium_high",
  tags: ["wide_attack", "fast_transitions", "isolate_wingers", "high_width", "vertical_play"],
};

export const legacySampleLineup: LegacyLineup = {
  gk: { playerId: "legacy_gk_01", roleId: "sweeperkeeper" },
  lb: { playerId: "legacy_lb_01", roleId: "overlapping_fullback" },
  lcb: { playerId: "legacy_lcb_01", roleId: "ball_playing_centre_back" },
  rcb: { playerId: "legacy_rcb_01", roleId: "duel_centre_back" },
  rb: { playerId: "legacy_rb_01", roleId: "overlapping_fullback" },
  dm: { playerId: "legacy_dm_01", roleId: "balancing_six" },
  lcm: { playerId: "legacy_lcm_01", roleId: "deep_playmaker" },
  rcm: { playerId: "legacy_rcm_01", roleId: "box_to_box" },
  lw: { playerId: "legacy_lw_01", roleId: "wide_dribbler" },
  st: { playerId: "legacy_st_01", roleId: "pressing_forward" },
  rw: { playerId: "legacy_rw_01", roleId: "inverted_winger" },
};

export const legacyManagerAppStateSample = createLegacyManagerAppState({
  teamId: "legacy_sample_team",
  teamName: "Legacy Sample Team",
  players: legacySamplePlayers,
  roles: legacySampleRoles,
  tactic: legacySampleTactic,
  formation: legacySampleFormation,
  lineup: legacySampleLineup,
});

export function readLegacyManagerAppStateSample(
  state: LegacyManagerAppState = legacyManagerAppStateSample,
): ReadableLegacyManagerAppStateSample {
  return {
    teamId: state.teamId,
    tacticId: state.tacticId,

    summary: state.summary,
    status: state.appState.status,

    adaptedPlayers: state.adaptedTeam.squad.length,
    adaptedRoles: state.adaptedRoles.length,
    adaptedAssignments: state.adaptedTactic.roleAssignments.length,

    setupScore: state.appState.dashboardViewModel.score.setupScoreText,
    teamBalance: state.appState.dashboardViewModel.score.teamBalanceText,
    reportLevel: state.appState.dashboardViewModel.score.reportLevelText,

    managerSummary: state.appState.dashboardViewModel.summary.summary,

    topActions: state.appState.dashboardViewModel.topActions.map((action) => action.label),

    trainingPlan: state.appState.dashboardViewModel.trainingPlan.map((item) => item.label),

    roleChanges: state.appState.dashboardViewModel.roleChanges.map((change) => change.label),

    weakPoints: state.appState.dashboardViewModel.weakPoints.map((weakPoint) => weakPoint.label),
  };
}

export const readableLegacyManagerAppStateSample =
  readLegacyManagerAppStateSample(legacyManagerAppStateSample);
