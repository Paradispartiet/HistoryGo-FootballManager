import "./manager-legacy-cleanup-v1.js";
import "./manager-player-workspace-v1.js";
import "./manager-team-choice-drawer-v1.js";
import "./manager-lineup-slot-inspector-v1.js";
import "./manager-scouting-workspace-v1.js";
import "./manager-calendar-workspace-v1.js";
import "./manager-training-day-v1.js";
import "./manager-match-calendar-v1.js";
import "./manager-staff-workspace-v1.js";
import "./manager-club-organization-v1.js";
import "./manager-club-learning-v1.js";
import "./manager-club-organization-location-v1.js";
import "./manager-system-workspace-v2.js";
import "./manager-football-learning-loop-v1.js";
import "./manager-visual-identity-v1.js";
import "./manager-league-next-suppression-v1.js";

export function createMatchFlowSnapshot(session, visibleLog = []) {
  const log = Array.isArray(visibleLog) ? visibleLog : [];
  let ownThreat = 1;
  let opponentThreat = 1;

  log.forEach((entry) => {
    const weight = entry?.type === "goal" ? 3 : entry?.type === "chance" ? 1 : 0;
    if (entry?.side === "for") ownThreat += weight;
    if (entry?.side === "against") opponentThreat += weight;
  });

  const total = ownThreat + opponentThreat;
  const ownShare = Math.round((ownThreat / total) * 100);
  const opponentShare = 100 - ownShare;
  const neutralShare = Math.max(12, 34 - Math.round(Math.abs(ownShare - 50) / 2));
  const attackingShare = Math.round((ownShare * (100 - neutralShare)) / 100);
  const defensiveShare = 100 - neutralShare - attackingShare;
  const diff = ownThreat - opponentThreat;

  return {
    defensiveShare,
    neutralShare,
    attackingShare,
    momentum: diff >= 3 ? "Vi presser" : diff <= -3 ? "Motstanderen presser" : "Kampen er i balanse",
    tone: diff >= 3 ? "positive" : diff <= -3 ? "negative" : "neutral",
    minute: Number(session?.liveMinute) || 0,
    opponentShare
  };
}
