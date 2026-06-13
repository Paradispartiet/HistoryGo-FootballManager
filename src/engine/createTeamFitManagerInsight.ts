// src/engine/createTeamFitManagerInsight.ts
//
// Managerinnsikt (sammendrag + topp-grep) avledet fra det LIVE teamFit-objektet,
// slik at manager-detalj-panelets headline-tekst og prioriterte grep bygger på
// samme score/metrikker (calculateTeamFit) som resten av panelet. Erstatter den
// strukturerte createManagerInsight (setupScore) som UI-kilde; den strukturerte
// finnes fortsatt for dashboard-pipeline-/sample-stien.

import type { FitRole, FitTactic } from "./calculatePlayerMatchFit.js";
import type { TeamFit } from "./calculateTeamFit.js";
import { analyzeWeakPointsFromTeamFit, type TeamFitWeakPoint } from "./analyzeWeakPointsFromTeamFit.js";
import { recommendRoleChangesFromTeamFit } from "./recommendRoleChangesFromTeamFit.js";

export type TeamFitManagerActionPriority = "Høy" | "Middels";

export type TeamFitManagerAction = {
  priorityText: TeamFitManagerActionPriority;
  label: string;
};

export type TeamFitManagerInsight = {
  summary: string;
  topActions: TeamFitManagerAction[];
};

const MAX_TOP_ACTIONS = 5;

function buildSummary(teamFit: TeamFit, weakPoints: TeamFitWeakPoint[]): string {
  if (teamFit.completeCount < teamFit.totalSlots) {
    return `Laget er ikke komplett ennå (${teamFit.completeCount}/${teamFit.totalSlots}). Fyll de resterende plassene før vurderingen blir helt pålitelig.`;
  }

  const score = teamFit.teamScore;
  const mainWeak = weakPoints[0];
  const weakTail = mainWeak ? ` Største forbedringspunkt nå: ${mainWeak.label.toLowerCase()}` : "";

  if (score >= 85) {
    return `Laget er svært godt satt opp (lagscore ${score}). Rollebruk og struktur peker i samme retning.${weakTail}`;
  }
  if (score >= 75) {
    return `Laget er godt satt opp (lagscore ${score}), men noen detaljer kan forbedres.${weakTail}`;
  }
  if (score >= 65) {
    return `Laget fungerer (lagscore ${score}), men har tydelige justeringspunkter i rollebruk eller balanse.${weakTail}`;
  }
  return `Laget har store strukturelle problemer (lagscore ${score}). Spillerne kan være gode, men oppsettet skjuler kvalitet – dette er en trenerutfordring, ikke en spillersvakhet.${weakTail}`;
}

/**
 * Bygg sammendrag + prioriterte grep fra teamFit. Topp-grepene kombinerer
 * alvorlige svakheter og tydelige rollebytter, vurdert med samme motor som
 * elleveren/headline.
 */
export function createTeamFitManagerInsight(
  teamFit: TeamFit,
  context: { tactic: FitTactic; roles: FitRole[] },
): TeamFitManagerInsight {
  const weakPoints = analyzeWeakPointsFromTeamFit(teamFit);
  const roleChanges = recommendRoleChangesFromTeamFit(teamFit, context);

  const actions: TeamFitManagerAction[] = [];

  // Alvorlige svakheter først.
  for (const weakPoint of weakPoints) {
    if (weakPoint.severity === "high") {
      actions.push({ priorityText: "Høy", label: `${weakPoint.label} ${weakPoint.suggestedAction}` });
    }
  }

  // Deretter tydelige rollebytter.
  for (const change of roleChanges) {
    if (change.status === "strong_change") {
      actions.push({ priorityText: "Høy", label: change.label });
    }
  }

  // Fyll opp med moderate punkter hvis det er plass.
  for (const weakPoint of weakPoints) {
    if (actions.length >= MAX_TOP_ACTIONS) break;
    if (weakPoint.severity === "medium") {
      actions.push({ priorityText: "Middels", label: `${weakPoint.label} ${weakPoint.suggestedAction}` });
    }
  }
  for (const change of roleChanges) {
    if (actions.length >= MAX_TOP_ACTIONS) break;
    if (change.status === "consider_change") {
      actions.push({ priorityText: "Middels", label: change.label });
    }
  }

  return {
    summary: buildSummary(teamFit, weakPoints),
    topActions: actions.slice(0, MAX_TOP_ACTIONS),
  };
}
