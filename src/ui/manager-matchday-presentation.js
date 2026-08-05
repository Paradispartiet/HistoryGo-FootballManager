// ============================================================================
// Matchday scene presentation model — visual hierarchy on top of existing state.
// Pure functions: no match engine, DOM or persistence ownership.
// ============================================================================

function text(value, fallback) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function opponentParts(opponentBrief) {
  const parts = text(opponentBrief, "Historisk motstander · trekkes ved avspark")
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    name: parts[0] || "Historisk motstander",
    context: parts.slice(1).join(" · ") || "Trekkes ved avspark"
  };
}

export function createMatchdaySceneModel({
  teamName,
  opponentBrief,
  formationName,
  tacticName,
  trainingLabel,
  lastSignal,
  primaryAction,
  readiness = {}
} = {}) {
  const opponent = opponentParts(opponentBrief);
  const status = readiness.status || "blocked";
  const canStart = Boolean(readiness.canStartMatch);
  const statusByState = {
    loading: { label: "Laster kampbildet", tone: "loading", kickoff: "Venter" },
    blocked: { label: "Forberedelser mangler", tone: "blocked", kickoff: "Avspark låst" },
    ready: { label: "Klar til avspark", tone: "ready", kickoff: "Klar" },
    in_progress: { label: "Kampen pågår", tone: "live", kickoff: "Live" }
  };
  const statusView = statusByState[status] || statusByState.blocked;

  return {
    teamName: text(teamName, "Ditt lag"),
    opponentName: opponent.name,
    opponentContext: opponent.context,
    statusLabel: statusView.label,
    statusTone: statusView.tone,
    kickoffLabel: statusView.kickoff,
    canStart,
    planLabel: [formationName, tacticName].filter(Boolean).join(" · ") || "Ingen kampplan valgt",
    trainingLabel: text(trainingLabel, "Ikke valgt"),
    signalLabel: text(lastSignal, "Ingen uleste signaler"),
    primaryAction: text(primaryAction, canStart ? "Spill kamp" : "Fullfør forberedelser"),
    summary: text(readiness.summary, canStart ? "Laget er kampklart." : "Kampforberedelsene er ikke fullført."),
    blockers: (Array.isArray(readiness.blockers) ? readiness.blockers : [])
      .map((item) => ({
        code: item?.code || "blocker",
        message: text(item?.message, "Fullfør kampforberedelsen."),
        target: item?.target || "dashboard"
      }))
  };
}
