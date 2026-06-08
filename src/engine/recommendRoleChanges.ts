// src/engine/recommendRoleChanges.ts

import type {
  FitReason,
  Player,
  PlayerRoleFitResult,
  Role,
  RoleAssignment,
  Score100,
  Tactic,
  Team,
} from "../domain/footballTypes.js";

import { calculateRoleFit } from "./calculateRoleFit.js";

export type RoleChangeRecommendationStatus =
  | "keep_role"
  | "consider_change"
  | "strong_change"
  | "cannot_evaluate";

export type RoleChangeCandidate = {
  roleId: string;
  roleName: string;
  fit: Score100;
  improvement: number;
  keyReasons: string[];
};

export type RoleChangeRecommendation = {
  playerId: string;
  position: string;

  currentRoleId: string;
  currentRoleName?: string;
  currentFit?: Score100;

  status: RoleChangeRecommendationStatus;

  label: string;

  candidates: RoleChangeCandidate[];
};

export type RoleChangeRecommendationResult = {
  teamId: string;
  tacticId: string;

  recommendations: RoleChangeRecommendation[];

  strongChanges: RoleChangeRecommendation[];
  consideredChanges: RoleChangeRecommendation[];
  keepRoles: RoleChangeRecommendation[];
  cannotEvaluate: RoleChangeRecommendation[];

  summary: string;
};

const CONSIDER_CHANGE_THRESHOLD = 6;
const STRONG_CHANGE_THRESHOLD = 12;
const MAX_CANDIDATES_PER_PLAYER = 3;

function getKeyReasons(reasons: FitReason[], limit = 3): string[] {
  return [...reasons]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, limit)
    .map((reason) => reason.label);
}

function findPlayer(team: Team, playerId: string): Player | undefined {
  return team.squad.find((player) => player.id === playerId);
}

function findRole(roles: Role[], roleId: string): Role | undefined {
  return roles.find((role) => role.id === roleId);
}

function findAlternativeRoles(
  roles: Role[],
  assignment: RoleAssignment,
  currentRoleId: string,
): Role[] {
  return roles.filter((role) =>
    role.id !== currentRoleId &&
    role.allowedPositions.includes(assignment.position),
  );
}

function toCandidate(
  role: Role,
  fit: PlayerRoleFitResult,
  currentFit: Score100,
): RoleChangeCandidate {
  return {
    roleId: role.id,
    roleName: role.name,
    fit: fit.finalFit,
    improvement: fit.finalFit - currentFit,
    keyReasons: getKeyReasons(fit.reasons),
  };
}

function getStatus(improvement: number): RoleChangeRecommendationStatus {
  if (improvement >= STRONG_CHANGE_THRESHOLD) {
    return "strong_change";
  }

  if (improvement >= CONSIDER_CHANGE_THRESHOLD) {
    return "consider_change";
  }

  return "keep_role";
}

function buildCannotEvaluateRecommendation(
  assignment: RoleAssignment,
  player: Player | undefined,
  currentRole: Role | undefined,
): RoleChangeRecommendation {
  const missingParts: string[] = [];

  if (!player) {
    missingParts.push("spiller");
  }

  if (!currentRole) {
    missingParts.push("rolle");
  }

  const recommendation: RoleChangeRecommendation = {
    playerId: assignment.playerId,
    position: assignment.position,
    currentRoleId: assignment.roleId,
    status: "cannot_evaluate",
    label: `Kan ikke vurdere rollebytte fordi ${missingParts.join(" og ")} mangler.`,
    candidates: [],
  };

  if (currentRole) {
    recommendation.currentRoleName = currentRole.name;
  }

  return recommendation;
}

function buildRecommendationForAssignment(
  team: Team,
  tactic: Tactic,
  roles: Role[],
  assignment: RoleAssignment,
): RoleChangeRecommendation {
  const player = findPlayer(team, assignment.playerId);
  const currentRole = findRole(roles, assignment.roleId);

  if (!player || !currentRole) {
    return buildCannotEvaluateRecommendation(assignment, player, currentRole);
  }

  const currentFitResult = calculateRoleFit(player, currentRole, assignment, tactic);
  const currentFit = currentFitResult.finalFit;

  const candidates = findAlternativeRoles(roles, assignment, currentRole.id)
    .map((candidateRole) => {
      const fit = calculateRoleFit(player, candidateRole, assignment, tactic);

      return toCandidate(candidateRole, fit, currentFit);
    })
    .filter((candidate) => candidate.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, MAX_CANDIDATES_PER_PLAYER);

  const bestCandidate = candidates[0];

  if (!bestCandidate) {
    return {
      playerId: player.id,
      position: assignment.position,
      currentRoleId: currentRole.id,
      currentRoleName: currentRole.name,
      currentFit,
      status: "keep_role",
      label: `${player.name} bør beholde rollen ${currentRole.name}. Ingen alternativ rolle i samme posisjon gir bedre fit.`,
      candidates,
    };
  }

  const status = getStatus(bestCandidate.improvement);

  if (status === "strong_change") {
    return {
      playerId: player.id,
      position: assignment.position,
      currentRoleId: currentRole.id,
      currentRoleName: currentRole.name,
      currentFit,
      status,
      label: `${player.name} bør vurderes tydelig i rollen ${bestCandidate.roleName}. Den gir ${bestCandidate.improvement} poeng bedre fit enn ${currentRole.name}.`,
      candidates,
    };
  }

  if (status === "consider_change") {
    return {
      playerId: player.id,
      position: assignment.position,
      currentRoleId: currentRole.id,
      currentRoleName: currentRole.name,
      currentFit,
      status,
      label: `${player.name} kan vurderes i rollen ${bestCandidate.roleName}. Forbedringen er moderat, men tydelig nok til å testes.`,
      candidates,
    };
  }

  return {
    playerId: player.id,
    position: assignment.position,
    currentRoleId: currentRole.id,
    currentRoleName: currentRole.name,
    currentFit,
    status: "keep_role",
    label: `${player.name} bør beholde rollen ${currentRole.name}. Alternativene gir ikke stor nok forbedring.`,
    candidates,
  };
}

function buildSummary(recommendations: RoleChangeRecommendation[]): string {
  const strongCount = recommendations.filter((recommendation) => recommendation.status === "strong_change").length;
  const considerCount = recommendations.filter((recommendation) => recommendation.status === "consider_change").length;
  const cannotEvaluateCount = recommendations.filter((recommendation) => recommendation.status === "cannot_evaluate").length;

  if (cannotEvaluateCount > 0) {
    return `Rolleendringsmotoren fant ${cannotEvaluateCount} plassering(er) som ikke kan vurderes fordi spiller eller rolle mangler.`;
  }

  if (strongCount > 0) {
    return `Rolleendringsmotoren fant ${strongCount} tydelige rollebytte(r) som bør vurderes først.`;
  }

  if (considerCount > 0) {
    return `Rolleendringsmotoren fant ${considerCount} moderate rollebytte(r) som kan testes.`;
  }

  return "Rolleendringsmotoren fant ingen tydelige rollebytter. Nåværende rollebruk bør i hovedsak beholdes.";
}

export function recommendRoleChanges(
  team: Team,
  tactic: Tactic,
  roles: Role[],
): RoleChangeRecommendationResult {
  const recommendations = tactic.roleAssignments.map((assignment) =>
    buildRecommendationForAssignment(team, tactic, roles, assignment),
  );

  const strongChanges = recommendations.filter((recommendation) => recommendation.status === "strong_change");
  const consideredChanges = recommendations.filter((recommendation) => recommendation.status === "consider_change");
  const keepRoles = recommendations.filter((recommendation) => recommendation.status === "keep_role");
  const cannotEvaluate = recommendations.filter((recommendation) => recommendation.status === "cannot_evaluate");

  return {
    teamId: team.id,
    tacticId: tactic.id,

    recommendations,

    strongChanges,
    consideredChanges,
    keepRoles,
    cannotEvaluate,

    summary: buildSummary(recommendations),
  };
}
