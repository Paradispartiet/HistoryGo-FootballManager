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
