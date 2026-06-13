// src/engine/calculateTeamFit.ts
//
// TypeScript-port av calculateTeamFit i src/football-team-fit-engine.js.
//
// Dette er sammenstillingen ("assembly"): den bygger et legacy-kompatibelt
// teamFit-objekt fra de allerede portede TS-motorene (individuell spiller-fit,
// relasjoner, historisk formasjonsfit, badge-effekter, coach-context) og de
// portede metrikk-kalkulatorene under. Output-formen matcher legacy slik at
// lagrapport-konsumentene (renderLineup/renderSidePanel/buildNextDecisions/
// matchday) kan mates uten regresjon i et senere steg.
//
// Porten er trofast mot legacy: samme assignment-bygging, samme metrikkvekter,
// samme rekkefølge (individuell fit → baseMetrics → historisk → badges →
// teamScore) og samme rapportlogikk.

import {
  calculatePlayerMatchFit,
  type FitPlayer,
  type FitRole,
  type FitTactic,
  type PlayerMatchFit,
} from "./calculatePlayerMatchFit.js";
import {
  calculateRoleRelationships,
  type RelationshipAssignment,
  type RoleRelationshipResult,
} from "./calculateRoleRelationships.js";
import {
  applyBadgeEffectsToMetrics,
  buildEarnedBadgeEffectContext,
  calculateBadgeMetricEffects,
  type BadgeMetricEffects,
  type TrainingBadgeCatalog,
} from "./calculateBadgeMetricEffects.js";
import {
  buildHistoricalFormationReport,
  calculateHistoricalFormationFit,
  type HistoricalAssignment,
  type HistoricalCoachContext,
  type HistoricalFormation,
  type HistoricalFormationFit,
  type HistoricalMetricAdjustmentResult,
} from "./calculateHistoricalFormationFit.js";

// ---------------------------------------------------------------------------
// Typer (legacy-formen som konsumentene leser)
// ---------------------------------------------------------------------------
export type TeamFitLineupSlotState = { playerId?: string; roleId?: string };
export type TeamFitLineup = Record<string, TeamFitLineupSlotState | undefined>;

export type TeamFitFormationSlot = { slotId: string; position: string; label: string };

export type TeamFitFormation = HistoricalFormation & {
  slots: TeamFitFormationSlot[];
};

export type TeamFitPlayer = FitPlayer;
export type TeamFitRole = FitRole;
export type TeamFitTactic = FitTactic;

export type TeamFitAssignment = {
  slot: TeamFitFormationSlot;
  player: TeamFitPlayer | null;
  role: TeamFitRole | null;
  fit: PlayerMatchFit | null;
  isComplete: boolean;
};

type CompleteTeamFitAssignment = TeamFitAssignment & {
  player: TeamFitPlayer;
  role: TeamFitRole;
  fit: PlayerMatchFit;
};

export type TeamFitMetrics = {
  individualFitAverage: number;
  roleFitAverage: number;
  tacticFitAverage: number;
  misuseAverage: number;
  balanceScore: number;
  widthScore: number;
  depthScore: number;
  buildUpScore: number;
  pressScore: number;
  restDefenseScore: number;
  relationshipScore: number;
  duplicatePenalty: number;
};

export type TeamFitReport = {
  summary: string;
  strengths: string[];
  issues: string[];
};

export type TeamFit = {
  teamScore: number;
  completeCount: number;
  totalSlots: number;
  metrics: TeamFitMetrics;
  baseMetrics: TeamFitMetrics;
  preBadgeMetrics: TeamFitMetrics;
  badgeEffects: BadgeMetricEffects;
  relationships: RoleRelationshipResult;
  historicalFormationFit: HistoricalFormationFit;
  historicalMetricAdjustments: HistoricalMetricAdjustmentResult;
  coachContext: HistoricalCoachContext | null;
  assignments: TeamFitAssignment[];
  duplicatePlayers: TeamFitPlayer[];
  report: TeamFitReport;
};

export type CalculateTeamFitInput = {
  lineup: TeamFitLineup;
  formation: TeamFitFormation;
  tactic: TeamFitTactic;
  players: TeamFitPlayer[];
  roles: TeamFitRole[];
  earnedBadgeIds?: string[];
  trainingBadges?: TrainingBadgeCatalog;
  coachContext?: HistoricalCoachContext | null;
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  const cleanValues = values.filter((value) => Number.isFinite(value));

  if (cleanValues.length === 0) {
    return 0;
  }

  return Math.round(cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length);
}

function hasRole(assignments: CompleteTeamFitAssignment[], roleId: string): boolean {
  return assignments.some((assignment) => assignment.role.id === roleId);
}

function hasAnyRole(assignments: CompleteTeamFitAssignment[], roleIds: string[]): boolean {
  return roleIds.some((roleId) => hasRole(assignments, roleId));
}

function countRoles(assignments: CompleteTeamFitAssignment[], roleIds: string[]): number {
  return assignments.filter((assignment) => roleIds.includes(assignment.role.id)).length;
}

function countPositions(assignments: CompleteTeamFitAssignment[], positions: string[]): number {
  return assignments.filter((assignment) => positions.includes(assignment.slot.position)).length;
}

function getDuplicatePlayers(assignments: CompleteTeamFitAssignment[]): TeamFitPlayer[] {
  const counts = new Map<string, number>();

  assignments.forEach((assignment) => {
    if (!assignment.player.id) {
      return;
    }
    counts.set(assignment.player.id, (counts.get(assignment.player.id) ?? 0) + 1);
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([playerId]) => assignments.find((assignment) => assignment.player.id === playerId)?.player)
    .filter((player): player is TeamFitPlayer => Boolean(player));
}

function buildAssignmentResults(
  lineup: TeamFitLineup,
  formation: TeamFitFormation,
  tactic: TeamFitTactic,
  players: TeamFitPlayer[],
  roles: TeamFitRole[],
): TeamFitAssignment[] {
  return formation.slots.map((slot) => {
    const slotState = lineup[slot.slotId] ?? {};
    const player = players.find((item) => item.id === slotState.playerId) ?? null;
    const role = roles.find((item) => item.id === slotState.roleId) ?? null;

    if (!player || !role) {
      return { slot, player, role, fit: null, isComplete: false };
    }

    return {
      slot,
      player,
      role,
      fit: calculatePlayerMatchFit(player, { position: slot.position }, role, tactic, roles),
      isComplete: true,
    };
  });
}

function isCompleteAssignment(assignment: TeamFitAssignment): assignment is CompleteTeamFitAssignment {
  return assignment.isComplete && assignment.player !== null && assignment.role !== null && assignment.fit !== null;
}

// ---------------------------------------------------------------------------
// Metrikk-kalkulatorer (port)
// ---------------------------------------------------------------------------
function calculateBalanceScore(assignments: CompleteTeamFitAssignment[]): number {
  let score = 62;

  if (hasAnyRole(assignments, ["balancing_six", "holding_midfielder"])) {
    score += 18;
  }
  if (hasAnyRole(assignments, ["deep_playmaker", "regista"])) {
    score += 8;
  }
  if (countRoles(assignments, ["free_creator", "classic_ten"]) > 1) {
    score -= 12;
  }
  if (
    countRoles(assignments, ["overlapping_fullback", "wingback"]) >= 2 &&
    !hasAnyRole(assignments, ["balancing_six", "holding_midfielder"])
  ) {
    score -= 18;
  }
  if (countPositions(assignments, ["CB"]) >= 3) {
    score += 8;
  }

  return clamp(score);
}

function calculateWidthScore(assignments: CompleteTeamFitAssignment[], tactic: TeamFitTactic): number {
  const tags = tactic.tags ?? [];
  let score = tags.includes("wide_attack") || tags.includes("high_width") ? 64 : 52;

  if (hasAnyRole(assignments, ["wide_dribbler", "inverted_winger"])) {
    score += 12;
  }
  if (hasAnyRole(assignments, ["overlapping_fullback", "wingback"])) {
    score += 14;
  }
  if (tags.includes("wide_attack") && !hasAnyRole(assignments, ["wide_dribbler", "inverted_winger", "overlapping_fullback", "wingback"])) {
    score -= 24;
  }
  if (tags.includes("central_combinations") && hasAnyRole(assignments, ["classic_ten", "linking_striker", "false_nine"])) {
    score += 4;
  }

  return clamp(score);
}

function calculateDepthScore(assignments: CompleteTeamFitAssignment[], tactic: TeamFitTactic): number {
  const tags = tactic.tags ?? [];
  let score = 52;

  if (hasAnyRole(assignments, ["channel_runner", "advanced_forward"])) {
    score += 20;
  }
  if (hasAnyRole(assignments, ["false_nine", "linking_striker"]) && hasAnyRole(assignments, ["wide_dribbler", "inverted_winger", "channel_runner"])) {
    score += 10;
  }
  if (tags.includes("space_behind") || tags.includes("vertical_play")) {
    score += 8;
  }
  if (tags.includes("space_behind") && !hasAnyRole(assignments, ["channel_runner", "advanced_forward"])) {
    score -= 20;
  }
  if (hasAnyRole(assignments, ["linking_striker", "false_nine"]) && !hasAnyRole(assignments, ["channel_runner", "advanced_forward", "box_to_box"])) {
    score -= 12;
  }

  return clamp(score);
}

function calculateBuildUpScore(assignments: CompleteTeamFitAssignment[], tactic: TeamFitTactic): number {
  const tags = tactic.tags ?? [];
  let score = tags.includes("structured_build_up") || tags.includes("possession") ? 60 : 52;

  if (hasAnyRole(assignments, ["deep_playmaker", "regista"])) {
    score += 16;
  }
  if (hasAnyRole(assignments, ["ball_playing_centre_back", "libero"])) {
    score += 14;
  }
  if (hasAnyRole(assignments, ["sweeperkeeper"])) {
    score += 8;
  }
  if (tags.includes("structured_build_up") && !hasAnyRole(assignments, ["deep_playmaker", "regista", "ball_playing_centre_back", "libero", "sweeperkeeper"])) {
    score -= 22;
  }
  if (tags.includes("direct_counter") && hasAnyRole(assignments, ["target_striker", "channel_runner", "advanced_forward"])) {
    score += 8;
  }

  return clamp(score);
}

function calculatePressScore(assignments: CompleteTeamFitAssignment[], tactic: TeamFitTactic): number {
  const tags = tactic.tags ?? [];
  let score = tags.includes("high_press") ? 58 : 52;

  if (hasAnyRole(assignments, ["pressing_forward", "pressing_midfielder", "box_to_box"])) {
    score += 18;
  }
  if (tags.includes("high_press") && !hasAnyRole(assignments, ["pressing_forward", "pressing_midfielder", "box_to_box"])) {
    score -= 20;
  }
  if (hasAnyRole(assignments, ["line_keeper", "duel_centre_back"]) && tags.includes("high_line")) {
    score -= 10;
  }

  return clamp(score);
}

function calculateRestDefenseScore(assignments: CompleteTeamFitAssignment[], tactic: TeamFitTactic): number {
  const tags = tactic.tags ?? [];
  let score = 58;

  if (hasAnyRole(assignments, ["balancing_six", "holding_midfielder"])) {
    score += 16;
  }
  if (countPositions(assignments, ["CB"]) >= 3) {
    score += 10;
  }
  if (countRoles(assignments, ["overlapping_fullback", "wingback"]) >= 2) {
    score -= 10;
  }
  if (countRoles(assignments, ["free_creator", "classic_ten"]) > 1) {
    score -= 8;
  }
  if (tags.includes("rest_defense")) {
    score += 8;
  }

  return clamp(score);
}

// ---------------------------------------------------------------------------
// Rapport (port)
// ---------------------------------------------------------------------------
function buildTeamReport(input: {
  assignmentResults: TeamFitAssignment[];
  metrics: TeamFitMetrics;
  tactic: TeamFitTactic;
  duplicatePlayers: TeamFitPlayer[];
  relationships: RoleRelationshipResult;
  formation: TeamFitFormation;
  historicalFormationFit: HistoricalFormationFit | null;
}): TeamFitReport {
  const { assignmentResults, metrics, tactic, duplicatePlayers, relationships, formation, historicalFormationFit } = input;
  const tags = tactic.tags ?? [];
  const strengths: string[] = [];
  const issues: string[] = [];
  const completeAssignments = assignmentResults.filter(isCompleteAssignment);

  if (metrics.balanceScore >= 76) {
    strengths.push("Laget har god balanse mellom frihet og sikring.");
  } else if (metrics.balanceScore < 58) {
    issues.push("Laget mangler balanse. Vurder en balanserende sekser eller tydeligere restforsvar.");
  }

  if (metrics.widthScore >= 76) {
    strengths.push("Laget har tydelig bredde og flere måter å skape rom ute på.");
  } else if (tags.includes("wide_attack")) {
    issues.push("Taktikken vil spille bredt, men rollevalgene gir ikke nok bredde.");
  }

  if (metrics.depthScore >= 76) {
    strengths.push("Laget truer bakrom og gir skaperne løp foran seg.");
  } else if (tags.includes("space_behind") || tags.includes("vertical_play")) {
    issues.push("Taktikken søker bakrom, men laget mangler nok løp som angriper rommet.");
  }

  if (metrics.buildUpScore >= 76) {
    strengths.push("Oppbyggingen har gode pasningsspillere og nok struktur.");
  } else if (tags.includes("structured_build_up") || tags.includes("possession")) {
    issues.push("Taktikken krever strukturert oppbygging, men laget mangler tydelige oppbyggingsroller.");
  }

  if (metrics.pressScore < 55 && tags.includes("high_press")) {
    issues.push("Høyt press krever flere pressroller. Nå blir presset lett halvhjertet.");
  }

  if (metrics.restDefenseScore < 55) {
    issues.push("Restforsvaret er sårbart når laget angriper.");
  }

  if (relationships.relationshipScore >= 76) {
    strengths.push("Rolle-relasjonene støtter laget: flere spillere får riktige medspillere rundt seg.");
  } else if (relationships.relationshipScore < 50) {
    issues.push("Rolle-relasjonene trekker laget ned. Flere roller trenger støtte laget ikke gir dem.");
  }

  relationships.positiveRelations.slice(0, 3).forEach((relation) => {
    strengths.push(`${relation.title}: ${relation.explanation}`);
  });

  relationships.negativeRelations.slice(0, 4).forEach((relation) => {
    issues.push(`${relation.title}: ${relation.explanation}`);
  });

  duplicatePlayers.forEach((player) => {
    issues.push(`${player.name} er brukt flere steder i samme ellever. Hver spiller bør bare brukes én gang.`);
  });

  const misusedPlayers = completeAssignments.filter((assignment) => assignment.fit.status === "feilbrukt");
  const bestFit = [...completeAssignments].sort((a, b) => b.fit.matchScore - a.fit.matchScore)[0];

  if (bestFit) {
    strengths.push(`${bestFit.player.name} brukes best akkurat nå som ${bestFit.role.name} i ${bestFit.slot.label}.`);
  }

  misusedPlayers.slice(0, 3).forEach((assignment) => {
    issues.push(`${assignment.player.name} er feilbrukt i ${assignment.slot.label}: ${assignment.fit.explanation}`);
  });

  if (completeAssignments.length < 11) {
    issues.push(`Startelleveren mangler ${11 - completeAssignments.length} spiller${11 - completeAssignments.length === 1 ? "" : "e"}.`);
  }

  if (historicalFormationFit) {
    const historicalReport = buildHistoricalFormationReport({ historicalFormationFit, formation });
    historicalReport.strengths.slice(0, 3).forEach((strength) => strengths.push(strength));
    historicalReport.issues.slice(0, 4).forEach((issue) => issues.push(issue));
  }

  return {
    summary:
      completeAssignments.length === 11
        ? "Laget er komplett. Rapporten vurderer om helheten henger sammen taktisk."
        : "Laget er ikke komplett ennå. Fyll alle elleve plasser før rapporten blir fullt nyttig.",
    strengths,
    issues,
  };
}

// ---------------------------------------------------------------------------
// Sammenstilling
// ---------------------------------------------------------------------------
export function calculateTeamFit(input: CalculateTeamFitInput): TeamFit {
  const { lineup, formation, tactic, players, roles } = input;
  const earnedBadgeIds = input.earnedBadgeIds ?? [];
  const trainingBadges = input.trainingBadges ?? null;
  const coachContext = input.coachContext ?? null;

  const assignmentResults = buildAssignmentResults(lineup, formation, tactic, players, roles);
  const completeAssignments = assignmentResults.filter(isCompleteAssignment);
  const duplicatePlayers = getDuplicatePlayers(completeAssignments);

  const relationshipAssignments: RelationshipAssignment[] = completeAssignments.map((assignment) => ({
    roleId: assignment.role.id,
    position: assignment.slot.position,
    playerName: assignment.player.name || assignment.role.name || assignment.slot.label,
  }));
  const relationships = calculateRoleRelationships(relationshipAssignments, tactic);

  const individualScores = completeAssignments.map((assignment) => assignment.fit.matchScore);
  const roleFits = completeAssignments.map((assignment) => assignment.fit.roleFit);
  const tacticFits = completeAssignments.map((assignment) => assignment.fit.tacticFit);
  const misusePenalties = completeAssignments.map((assignment) => assignment.fit.misusePenalty);

  const baseMetrics: TeamFitMetrics = {
    individualFitAverage: average(individualScores),
    roleFitAverage: average(roleFits),
    tacticFitAverage: average(tacticFits),
    misuseAverage: average(misusePenalties),
    balanceScore: calculateBalanceScore(completeAssignments),
    widthScore: calculateWidthScore(completeAssignments, tactic),
    depthScore: calculateDepthScore(completeAssignments, tactic),
    buildUpScore: calculateBuildUpScore(completeAssignments, tactic),
    pressScore: calculatePressScore(completeAssignments, tactic),
    restDefenseScore: calculateRestDefenseScore(completeAssignments, tactic),
    relationshipScore: relationships.relationshipScore,
    duplicatePenalty: duplicatePlayers.length * 12,
  };

  // Historisk formasjonsfit FØR badges (samme rekkefølge som legacy).
  const historicalAssignments: HistoricalAssignment[] = completeAssignments.map((assignment) => ({
    slotId: assignment.slot.slotId,
    playerId: assignment.player.id,
    roleId: assignment.role.id,
    roleName: assignment.role.name,
  }));
  const historicalFormationFit = calculateHistoricalFormationFit({
    assignments: historicalAssignments,
    baseMetrics,
    formation,
    tactic,
    coachContext,
  });
  const historicalMetricAdjustments = historicalFormationFit.metricAdjustmentResult;
  // Historisk justering bevarer alle baseMetrics-nøklene (kopierer + justerer
  // kun de seks historiske), så cast tilbake til den navngitte typen er trygt.
  const preBadgeMetrics = historicalMetricAdjustments.metrics as TeamFitMetrics;

  const badgeContext = buildEarnedBadgeEffectContext({ earnedBadgeIds, trainingBadges });
  const badgeEffects = calculateBadgeMetricEffects(badgeContext);
  const metrics = applyBadgeEffectsToMetrics(preBadgeMetrics, badgeEffects);

  const teamScore = clamp(
    Math.round(
      metrics.individualFitAverage * 0.26 +
        metrics.roleFitAverage * 0.11 +
        metrics.tacticFitAverage * 0.11 +
        metrics.balanceScore * 0.08 +
        metrics.widthScore * 0.06 +
        metrics.depthScore * 0.06 +
        metrics.buildUpScore * 0.07 +
        metrics.pressScore * 0.05 +
        metrics.restDefenseScore * 0.06 +
        metrics.relationshipScore * 0.07 +
        historicalFormationFit.historicalScore * 0.07 +
        historicalFormationFit.historicalBonus -
        historicalFormationFit.historicalPenalty * 0.35 -
        metrics.misuseAverage * 0.08 -
        metrics.duplicatePenalty,
    ),
  );

  return {
    teamScore: completeAssignments.length === 0 ? 0 : teamScore,
    completeCount: completeAssignments.length,
    totalSlots: formation.slots.length,
    metrics,
    baseMetrics,
    preBadgeMetrics,
    badgeEffects,
    relationships,
    historicalFormationFit,
    historicalMetricAdjustments,
    coachContext,
    assignments: assignmentResults,
    duplicatePlayers,
    report: buildTeamReport({
      assignmentResults,
      metrics,
      tactic,
      duplicatePlayers,
      relationships,
      formation,
      historicalFormationFit,
    }),
  };
}
