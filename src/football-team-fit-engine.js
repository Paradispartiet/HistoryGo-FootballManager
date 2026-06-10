import { calculatePlayerMatchFit } from "./football-fit-engine.js";
import {
  buildEarnedBadgeEffectContext,
  calculateBadgeMetricEffects,
  applyBadgeEffectsToMetrics
} from "./football-badge-effect-engine.js";
import { calculateRoleRelationships } from "./football-relationship-engine.js";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  const cleanValues = values.filter((value) => Number.isFinite(value));

  if (cleanValues.length === 0) {
    return 0;
  }

  return Math.round(cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length);
}

function hasRole(assignments, roleId) {
  return assignments.some((assignment) => assignment.role?.id === roleId);
}

function hasAnyRole(assignments, roleIds) {
  return roleIds.some((roleId) => hasRole(assignments, roleId));
}

function countRoles(assignments, roleIds) {
  return assignments.filter((assignment) => roleIds.includes(assignment.role?.id)).length;
}

function countPositions(assignments, positions) {
  return assignments.filter((assignment) => positions.includes(assignment.slot.position)).length;
}

function getDuplicatePlayers(assignments) {
  const counts = new Map();

  assignments.forEach((assignment) => {
    if (!assignment.player?.id) {
      return;
    }

    counts.set(assignment.player.id, (counts.get(assignment.player.id) || 0) + 1);
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([playerId]) => assignments.find((assignment) => assignment.player?.id === playerId)?.player)
    .filter(Boolean);
}

function buildAssignmentResults(lineup, formation, tactic, players, roles) {
  return formation.slots.map((slot) => {
    const slotState = lineup[slot.slotId] || {};
    const player = players.find((item) => item.id === slotState.playerId) || null;
    const role = roles.find((item) => item.id === slotState.roleId) || null;

    if (!player || !role) {
      return {
        slot,
        player,
        role,
        fit: null,
        isComplete: false
      };
    }

    return {
      slot,
      player,
      role,
      fit: calculatePlayerMatchFit(player, { position: slot.position }, role, tactic, roles),
      isComplete: true
    };
  });
}

function calculateBalanceScore(assignments) {
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

  if (countRoles(assignments, ["overlapping_fullback", "wingback"]) >= 2 && !hasAnyRole(assignments, ["balancing_six", "holding_midfielder"])) {
    score -= 18;
  }

  if (countPositions(assignments, ["CB"]) >= 3) {
    score += 8;
  }

  return clamp(score);
}

function calculateWidthScore(assignments, tactic) {
  let score = tactic.tags.includes("wide_attack") || tactic.tags.includes("high_width") ? 64 : 52;

  if (hasAnyRole(assignments, ["wide_dribbler", "inverted_winger"])) {
    score += 12;
  }

  if (hasAnyRole(assignments, ["overlapping_fullback", "wingback"])) {
    score += 14;
  }

  if (tactic.tags.includes("wide_attack") && !hasAnyRole(assignments, ["wide_dribbler", "inverted_winger", "overlapping_fullback", "wingback"])) {
    score -= 24;
  }

  if (tactic.tags.includes("central_combinations") && hasAnyRole(assignments, ["classic_ten", "linking_striker", "false_nine"])) {
    score += 4;
  }

  return clamp(score);
}

function calculateDepthScore(assignments, tactic) {
  let score = 52;

  if (hasAnyRole(assignments, ["channel_runner", "advanced_forward"])) {
    score += 20;
  }

  if (hasAnyRole(assignments, ["false_nine", "linking_striker"]) && hasAnyRole(assignments, ["wide_dribbler", "inverted_winger", "channel_runner"])) {
    score += 10;
  }

  if (tactic.tags.includes("space_behind") || tactic.tags.includes("vertical_play")) {
    score += 8;
  }

  if (tactic.tags.includes("space_behind") && !hasAnyRole(assignments, ["channel_runner", "advanced_forward"])) {
    score -= 20;
  }

  if (hasAnyRole(assignments, ["linking_striker", "false_nine"]) && !hasAnyRole(assignments, ["channel_runner", "advanced_forward", "box_to_box"])) {
    score -= 12;
  }

  return clamp(score);
}

function calculateBuildUpScore(assignments, tactic) {
  let score = tactic.tags.includes("structured_build_up") || tactic.tags.includes("possession") ? 60 : 52;

  if (hasAnyRole(assignments, ["deep_playmaker", "regista"])) {
    score += 16;
  }

  if (hasAnyRole(assignments, ["ball_playing_centre_back", "libero"])) {
    score += 14;
  }

  if (hasAnyRole(assignments, ["sweeperkeeper"])) {
    score += 8;
  }

  if (tactic.tags.includes("structured_build_up") && !hasAnyRole(assignments, ["deep_playmaker", "regista", "ball_playing_centre_back", "libero", "sweeperkeeper"])) {
    score -= 22;
  }

  if (tactic.tags.includes("direct_counter") && hasAnyRole(assignments, ["target_striker", "channel_runner", "advanced_forward"])) {
    score += 8;
  }

  return clamp(score);
}

function calculatePressScore(assignments, tactic) {
  let score = tactic.tags.includes("high_press") ? 58 : 52;

  if (hasAnyRole(assignments, ["pressing_forward", "pressing_midfielder", "box_to_box"])) {
    score += 18;
  }

  if (tactic.tags.includes("high_press") && !hasAnyRole(assignments, ["pressing_forward", "pressing_midfielder", "box_to_box"])) {
    score -= 20;
  }

  if (hasAnyRole(assignments, ["line_keeper", "duel_centre_back"]) && tactic.tags.includes("high_line")) {
    score -= 10;
  }

  return clamp(score);
}

function calculateRestDefenseScore(assignments, tactic) {
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

  if (tactic.tags.includes("rest_defense")) {
    score += 8;
  }

  return clamp(score);
}

function buildTeamReport({ assignmentResults, metrics, tactic, duplicatePlayers, relationships }) {
  const strengths = [];
  const issues = [];
  const completeAssignments = assignmentResults.filter((assignment) => assignment.isComplete);

  if (metrics.balanceScore >= 76) {
    strengths.push("Laget har god balanse mellom frihet og sikring.");
  } else if (metrics.balanceScore < 58) {
    issues.push("Laget mangler balanse. Vurder en balanserende sekser eller tydeligere restforsvar.");
  }

  if (metrics.widthScore >= 76) {
    strengths.push("Laget har tydelig bredde og flere måter å skape rom ute på.");
  } else if (tactic.tags.includes("wide_attack")) {
    issues.push("Taktikken vil spille bredt, men rollevalgene gir ikke nok bredde.");
  }

  if (metrics.depthScore >= 76) {
    strengths.push("Laget truer bakrom og gir skaperne løp foran seg.");
  } else if (tactic.tags.includes("space_behind") || tactic.tags.includes("vertical_play")) {
    issues.push("Taktikken søker bakrom, men laget mangler nok løp som angriper rommet.");
  }

  if (metrics.buildUpScore >= 76) {
    strengths.push("Oppbyggingen har gode pasningsspillere og nok struktur.");
  } else if (tactic.tags.includes("structured_build_up") || tactic.tags.includes("possession")) {
    issues.push("Taktikken krever strukturert oppbygging, men laget mangler tydelige oppbyggingsroller.");
  }

  if (metrics.pressScore < 55 && tactic.tags.includes("high_press")) {
    issues.push("Høyt press krever flere pressroller. Nå blir presset lett halvhjertet.");
  }

  if (metrics.restDefenseScore < 55) {
    issues.push("Restforsvaret er sårbart når laget angriper.");
  }

  if (relationships?.relationshipScore >= 76) {
    strengths.push("Rolle-relasjonene støtter laget: flere spillere får riktige medspillere rundt seg.");
  } else if (relationships?.relationshipScore < 50) {
    issues.push("Rolle-relasjonene trekker laget ned. Flere roller trenger støtte laget ikke gir dem.");
  }

  (relationships?.positiveRelations || []).slice(0, 3).forEach((relation) => {
    strengths.push(`${relation.title}: ${relation.explanation}`);
  });

  (relationships?.negativeRelations || []).slice(0, 4).forEach((relation) => {
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

  return {
    summary: completeAssignments.length === 11
      ? "Laget er komplett. Rapporten vurderer om helheten henger sammen taktisk."
      : "Laget er ikke komplett ennå. Fyll alle elleve plasser før rapporten blir fullt nyttig.",
    strengths,
    issues
  };
}

export function calculateTeamFit({ lineup, formation, tactic, players, roles, earnedBadgeIds = [], trainingBadges = null }) {
  const assignmentResults = buildAssignmentResults(lineup, formation, tactic, players, roles);
  const completeAssignments = assignmentResults.filter((assignment) => assignment.isComplete);
  const duplicatePlayers = getDuplicatePlayers(completeAssignments);
  const relationships = calculateRoleRelationships(completeAssignments, tactic);
  const individualScores = completeAssignments.map((assignment) => assignment.fit.matchScore);
  const roleFits = completeAssignments.map((assignment) => assignment.fit.roleFit);
  const tacticFits = completeAssignments.map((assignment) => assignment.fit.tacticFit);
  const misusePenalties = completeAssignments.map((assignment) => assignment.fit.misusePenalty);

  const baseMetrics = {
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
    duplicatePenalty: duplicatePlayers.length * 12
  };

  // Forsiktig kobling av opptjente badges: beregn små bonuser og legg dem oppå
  // basismetrikkene. Uten badges blir adjusted metrics identisk med base.
  const badgeContext = buildEarnedBadgeEffectContext({ earnedBadgeIds, trainingBadges });
  const badgeEffects = calculateBadgeMetricEffects(badgeContext);
  const metrics = applyBadgeEffectsToMetrics(baseMetrics, badgeEffects);

  const teamScore = clamp(Math.round(
    metrics.individualFitAverage * 0.26 +
    metrics.roleFitAverage * 0.11 +
    metrics.tacticFitAverage * 0.11 +
    metrics.balanceScore * 0.09 +
    metrics.widthScore * 0.07 +
    metrics.depthScore * 0.07 +
    metrics.buildUpScore * 0.08 +
    metrics.pressScore * 0.06 +
    metrics.restDefenseScore * 0.07 +
    metrics.relationshipScore * 0.08 -
    metrics.misuseAverage * 0.08 -
    metrics.duplicatePenalty
  ));

  return {
    teamScore: completeAssignments.length === 0 ? 0 : teamScore,
    completeCount: completeAssignments.length,
    totalSlots: formation.slots.length,
    metrics,
    baseMetrics,
    badgeEffects,
    relationships,
    assignments: assignmentResults,
    duplicatePlayers,
    report: buildTeamReport({ assignmentResults, metrics, tactic, duplicatePlayers, relationships })
  };
}
