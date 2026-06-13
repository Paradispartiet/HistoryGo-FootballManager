// src/engine/recommendRoleChangesFromTeamFit.ts
//
// Rolleendringsanbefalinger avledet fra det LIVE teamFit-objektet (calculateTeamFit),
// slik at manager-detalj-panelet bruker NØYAKTIG samme fit-motor som ellever-
// visningen (calculatePlayerMatchFit / matchScore). Dette forener detalj-panelet
// med headline: en spiller som vises som "perfekt" i elleveren får ikke lenger
// et motstridende "bytt rolle"-forslag fra en parallell strukturert fit.
//
// Den strukturerte recommendRoleChanges (calculateRoleFit/finalFit) finnes
// fortsatt for dashboard-pipeline-/sample-stien, men driver ikke lenger UI.

import {
  calculatePlayerMatchFit,
  type FitRole,
  type FitTactic,
} from "./calculatePlayerMatchFit.js";
import type { TeamFit } from "./calculateTeamFit.js";

export type TeamFitRoleChangeStatus = "keep_role" | "consider_change" | "strong_change";

export type TeamFitRoleChangeCandidate = {
  roleId: string;
  roleName: string;
  matchScore: number;
  improvement: number;
};

export type TeamFitRoleChange = {
  playerId: string;
  playerName: string;
  position: string;
  slotId: string;
  currentRoleId: string;
  currentRoleName: string;
  currentFit: number;
  status: TeamFitRoleChangeStatus;
  label: string;
  candidates: TeamFitRoleChangeCandidate[];
};

const CONSIDER_CHANGE_THRESHOLD = 6;
const STRONG_CHANGE_THRESHOLD = 12;
const MAX_CANDIDATES_PER_PLAYER = 3;

function getStatus(improvement: number): TeamFitRoleChangeStatus {
  if (improvement >= STRONG_CHANGE_THRESHOLD) {
    return "strong_change";
  }
  if (improvement >= CONSIDER_CHANGE_THRESHOLD) {
    return "consider_change";
  }
  return "keep_role";
}

/**
 * Avled rollebytte-anbefalinger fra teamFit. For hver komplett ellever-plass
 * testes alternative roller som er gyldige i plassens posisjon, vurdert med
 * calculatePlayerMatchFit (samme matchScore som elleveren viser).
 */
export function recommendRoleChangesFromTeamFit(
  teamFit: Pick<TeamFit, "assignments">,
  context: { tactic: FitTactic; roles: FitRole[] },
): TeamFitRoleChange[] {
  const { tactic, roles } = context;
  const recommendations: TeamFitRoleChange[] = [];

  for (const assignment of teamFit.assignments) {
    if (!assignment.isComplete || !assignment.player || !assignment.role || !assignment.fit) {
      continue;
    }

    const player = assignment.player;
    const currentRole = assignment.role;
    const position = assignment.slot.position;
    const currentFit = assignment.fit.matchScore;

    const candidates: TeamFitRoleChangeCandidate[] = roles
      .filter((role) => role.id !== currentRole.id && role.validPositions.includes(position))
      .map((role) => {
        const matchScore = calculatePlayerMatchFit(player, { position }, role, tactic, roles).matchScore;
        return {
          roleId: role.id,
          roleName: role.name,
          matchScore,
          improvement: matchScore - currentFit,
        };
      })
      .filter((candidate) => candidate.improvement > 0)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, MAX_CANDIDATES_PER_PLAYER);

    const best = candidates[0];
    const status = best ? getStatus(best.improvement) : "keep_role";

    let label: string;
    if (!best) {
      label = `${player.name} bør beholde rollen ${currentRole.name}. Ingen alternativ rolle i samme posisjon gir bedre fit.`;
    } else if (status === "strong_change") {
      label = `${player.name} bør vurderes tydelig i rollen ${best.roleName}. Den gir ${best.improvement} poeng bedre fit enn ${currentRole.name}.`;
    } else if (status === "consider_change") {
      label = `${player.name} kan vurderes i rollen ${best.roleName}. Forbedringen er moderat, men tydelig nok til å testes.`;
    } else {
      label = `${player.name} bør beholde rollen ${currentRole.name}. Alternativene gir ikke stor nok forbedring.`;
    }

    recommendations.push({
      playerId: player.id,
      playerName: player.name,
      position,
      slotId: assignment.slot.slotId,
      currentRoleId: currentRole.id,
      currentRoleName: currentRole.name,
      currentFit,
      status,
      label,
      candidates,
    });
  }

  return recommendations;
}
