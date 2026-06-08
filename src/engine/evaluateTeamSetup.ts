// src/engine/evaluateTeamSetup.ts

import type {
  Player,
  PlayerRoleFitResult,
  Role,
  RoleAssignment,
  Score100,
  Tactic,
  Team,
  TeamBalanceResult,
} from "../domain/footballTypes.js";

import { calculateRoleFit } from "./calculateRoleFit.js";
import { calculateTeamBalance } from "./calculateTeamBalance.js";

export type TeamSetupIssueSeverity = "info" | "warning" | "critical";

export type TeamSetupIssue = {
  code: string;
  severity: TeamSetupIssueSeverity;
  label: string;
  playerId?: string;
  roleId?: string;
};

export type MissingAssignment = {
  playerId: string;
  roleId: string;
  position: string;
  missingPlayer: boolean;
  missingRole: boolean;
};

export type TeamSetupEvaluationInput = {
  team: Team;
  tactic: Tactic;
  roles: Role[];
};

export type TeamSetupEvaluation = {
  teamId: string;
  tacticId: string;

  isComplete: boolean;
  validAssignmentCount: number;
  totalAssignmentCount: number;

  setupScore: Score100;

  roleFitResults: PlayerRoleFitResult[];
  teamBalance: TeamBalanceResult;

  missingAssignments: MissingAssignment[];

  bestFits: PlayerRoleFitResult[];
  worstFits: PlayerRoleFitResult[];

  strengths: string[];
  issues: TeamSetupIssue[];

  summary: string;
};

type ResolvedAssignment = {
  assignment: RoleAssignment;
  player: Player;
  role: Role;
};

const LOW_SCORE = 60;
const LIMITED_SCORE = 65;
const GOOD_SCORE = 78;
const STRONG_SCORE = 82;

function clampScore(value: number): Score100 {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[], fallback = 0): Score100 {
  if (values.length === 0) return fallback;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function findPlayer(team: Team, playerId: string): Player | undefined {
  return team.squad.find((player) => player.id === playerId);
}

function findRole(roles: Role[], roleId: string): Role | undefined {
  return roles.find((role) => role.id === roleId);
}

function resolveAssignments(
  team: Team,
  tactic: Tactic,
  roles: Role[],
): {
  resolvedAssignments: ResolvedAssignment[];
  missingAssignments: MissingAssignment[];
} {
  const resolvedAssignments: ResolvedAssignment[] = [];
  const missingAssignments: MissingAssignment[] = [];

  for (const assignment of tactic.roleAssignments) {
    const player = findPlayer(team, assignment.playerId);
    const role = findRole(roles, assignment.roleId);

    if (!player || !role) {
      missingAssignments.push({
        playerId: assignment.playerId,
        roleId: assignment.roleId,
        position: assignment.position,
        missingPlayer: !player,
        missingRole: !role,
      });

      continue;
    }

    resolvedAssignments.push({
      assignment,
      player,
      role,
    });
  }

  return {
    resolvedAssignments,
    missingAssignments,
  };
}

function calculateAverageRoleFit(roleFitResults: PlayerRoleFitResult[]): Score100 {
  return average(roleFitResults.map((result) => result.finalFit), 0);
}

function getBestFits(roleFitResults: PlayerRoleFitResult[]): PlayerRoleFitResult[] {
  return [...roleFitResults]
    .sort((a, b) => b.finalFit - a.finalFit)
    .slice(0, 3);
}

function getWorstFits(roleFitResults: PlayerRoleFitResult[]): PlayerRoleFitResult[] {
  return [...roleFitResults]
    .sort((a, b) => a.finalFit - b.finalFit)
    .slice(0, 3);
}

function addIssue(
  issues: TeamSetupIssue[],
  code: string,
  severity: TeamSetupIssueSeverity,
  label: string,
): void {
  issues.push({
    code,
    severity,
    label,
  });
}

function buildStrengths(
  teamBalance: TeamBalanceResult,
  averageRoleFit: Score100,
): string[] {
  const strengths: string[] = [];

  if (teamBalance.finalBalance >= GOOD_SCORE) {
    strengths.push("Laget har god taktisk balanse.");
  }

  if (averageRoleFit >= STRONG_SCORE) {
    strengths.push("Laget har sterk samlet rollefit.");
  }

  if (teamBalance.pressingCoherence >= GOOD_SCORE) {
    strengths.push("Presset henger godt sammen.");
  }

  if (teamBalance.widthBalance >= GOOD_SCORE) {
    strengths.push("Breddestrukturen fungerer godt.");
  }

  if (teamBalance.defensiveBalance >= GOOD_SCORE) {
    strengths.push("Forsvarsbalansen er solid.");
  }

  if (teamBalance.midfieldControl >= GOOD_SCORE) {
    strengths.push("Midtbanen gir god kontroll.");
  }

  return strengths;
}

function buildIssues(
  missingAssignments: MissingAssignment[],
  teamBalance: TeamBalanceResult,
  averageRoleFit: Score100,
): TeamSetupIssue[] {
  const issues: TeamSetupIssue[] = [];

  if (missingAssignments.length > 0) {
    addIssue(
      issues,
      "missing_assignments",
      "critical",
      "Startelleveren har manglende eller ugyldige rolleplasseringer.",
    );
  }

  if (averageRoleFit > 0 && averageRoleFit < 70) {
    addIssue(
      issues,
      "weak_average_role_fit",
      "warning",
      "Laget har svak samlet rollefit.",
    );
  }

  if (teamBalance.finalBalance < LIMITED_SCORE) {
    addIssue(
      issues,
      "weak_team_balance",
      "warning",
      "Lagbalansen har tydelige strukturelle problemer.",
    );
  }

  if (teamBalance.pressingCoherence < LOW_SCORE) {
    addIssue(
      issues,
      "weak_pressing_coherence",
      "warning",
      "Presset henger dårlig sammen.",
    );
  }

  if (teamBalance.widthBalance < LOW_SCORE) {
    addIssue(
      issues,
      "weak_width_balance",
      "warning",
      "Breddestrukturen er svak.",
    );
  }

  if (teamBalance.defensiveBalance < LOW_SCORE) {
    addIssue(
      issues,
      "weak_defensive_balance",
      "warning",
      "Forsvarsbalansen er sårbar.",
    );
  }

  if (teamBalance.riskBalance < LOW_SCORE) {
    addIssue(
      issues,
      "weak_risk_balance",
      "warning",
      "Risikonivået er dårlig balansert.",
    );
  }

  return issues;
}

function buildSummary(
  isComplete: boolean,
  setupScore: Score100,
  issues: TeamSetupIssue[],
): string {
  if (!isComplete) {
    return "Startelleveren er ikke komplett. Vurderingen viser hva som kan beregnes, men laget må fullføres før rapporten blir helt pålitelig.";
  }

  const hasCriticalIssues = issues.some((issue) => issue.severity === "critical");

  if (hasCriticalIssues) {
    return "Laget har kritiske oppsettproblemer som må rettes før vurderingen er pålitelig.";
  }

  if (setupScore >= 85) {
    return "Laget er svært godt satt opp. Rollebruk og lagbalanse peker i samme retning.";
  }

  if (setupScore >= 75) {
    return "Laget er godt satt opp, men noen detaljer kan fortsatt forbedres.";
  }

  if (setupScore >= 65) {
    return "Laget fungerer, men har tydelige justeringspunkter i rollebruk eller balanse.";
  }

  return "Laget har store strukturelle problemer. Spillerne kan være gode, men trenerens oppsett skjuler for mye kvalitet.";
}

export function evaluateTeamSetup(input: TeamSetupEvaluationInput): TeamSetupEvaluation {
  const { team, tactic, roles } = input;

  const { resolvedAssignments, missingAssignments } = resolveAssignments(team, tactic, roles);

  const roleFitResults = resolvedAssignments.map(({ player, role, assignment }) =>
    calculateRoleFit(player, role, assignment, tactic),
  );

  const teamBalance = calculateTeamBalance(team, tactic, roles, roleFitResults);
  const averageRoleFit = calculateAverageRoleFit(roleFitResults);

  const totalAssignmentCount = tactic.roleAssignments.length;
  const validAssignmentCount = resolvedAssignments.length;
  const isComplete =
    totalAssignmentCount === 11 &&
    validAssignmentCount === 11 &&
    missingAssignments.length === 0;

  const setupScore = clampScore(
    teamBalance.finalBalance * 0.65 +
      averageRoleFit * 0.35 -
      missingAssignments.length * 6,
  );

  const bestFits = getBestFits(roleFitResults);
  const worstFits = getWorstFits(roleFitResults);

  const strengths = buildStrengths(teamBalance, averageRoleFit);
  const issues = buildIssues(missingAssignments, teamBalance, averageRoleFit);
  const summary = buildSummary(isComplete, setupScore, issues);

  return {
    teamId: team.id,
    tacticId: tactic.id,

    isComplete,
    validAssignmentCount,
    totalAssignmentCount,

    setupScore,

    roleFitResults,
    teamBalance,

    missingAssignments,

    bestFits,
    worstFits,

    strengths,
    issues,

    summary,
  };
}
