import { sourcedTeamSkillTendencies } from "./football-team-fit-engine.js";

// Present the SAME sourced tactical team contributions that the live TS/JS
// engines calculate. This is an evidence overview, not a new player rating.
const DIMENSIONS = Object.freeze([
  ["buildUpScore", "Oppbygging"],
  ["restDefenseScore", "Restforsvar"],
  ["widthScore", "Bredde"],
  ["depthScore", "Dybde"],
  ["pressScore", "Press"],
  ["balanceScore", "Balanse"]
]);

export function buildSourcedLineupInsights(teamFit) {
  if (!teamFit || Number(teamFit.completeCount) <= 0) return [];
  const tendencies = teamFit.sourcedSkillTendencies || {};
  return DIMENSIONS.map(([key, label]) => {
    const entry = tendencies[key];
    const rawBonus = Number(entry?.bonus);
    const bonus = Number.isFinite(rawBonus) ? Math.max(0, Math.min(6, rawBonus)) : 0;
    const players = Array.isArray(entry?.players)
      ? [...new Set(entry.players.filter((name) => typeof name === "string" && name.trim()))]
      : [];
    const total = players.length;
    return {
      key, label, bonus,
      hasEvidence: bonus > 0 && total > 0,
      players,
      detail: bonus > 0 && total > 0
        ? `${players.slice(0, 2).join(" og ")}${total > 2 ? ` og ${total - 2} til` : ""}`
        : "Ingen direkte dokumenterte bidrag i valgt rolle og kampplan"
    };
  });
}

// Preview the documented contribution to the CURRENT XI for this exact slot
// and the role that will be assigned on click. This deliberately does not
// promise an overall team score or a match result: role fit, chemistry and
// formation effects are calculated by the normal engine after selection.
export function previewSourcedPlayerSwap({ teamFit, slot, role, player, tactic } = {}) {
  if (!teamFit || !slot?.slotId || !role?.id || !player?.id || !tactic) return null;

  const remaining = Array.isArray(teamFit.assignments)
    ? teamFit.assignments.filter((assignment) =>
        assignment?.isComplete && assignment?.slot?.slotId !== slot.slotId)
    : [];
  const after = sourcedTeamSkillTendencies([
    ...remaining, { slot, role, player, isComplete: true }
  ], tactic);
  const before = teamFit.sourcedSkillTendencies || {};
  const changes = DIMENSIONS.map(([key, label]) => {
    const oldBonus = Number(before[key]?.bonus) || 0;
    const newBonus = Number(after[key]?.bonus) || 0;
    return { key, label, delta: newBonus - oldBonus };
  }).filter((change) => change.delta !== 0);
  const ownEvidence = sourcedTeamSkillTendencies([
    { slot, role, player, isComplete: true }
  ], tactic);
  const hasEvidence = DIMENSIONS.some(([key]) => (ownEvidence[key]?.bonus || 0) > 0);
  const description = changes.length
    ? "Ved valg: " + changes.map(({ label, delta }) =>
        `${delta > 0 ? "+" : ""}${delta} ${label.toLocaleLowerCase("nb-NO")}`).join(" · ")
    : hasEvidence
      ? "Dokumenterte styrker, men lagets bonus er uendret"
      : "Ingen direkte dokumenterte bidrag i denne rollen";
  return { changes, hasEvidence, description };
}
