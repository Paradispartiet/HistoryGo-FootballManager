// ============================================================================
// Authoritative matchday readiness — Manager grunnflyt v1
//
// Pure and deterministic. All match-start surfaces consume this result.
// ============================================================================

export const MATCHDAY_READINESS_STATUS = Object.freeze({
  LOADING: "loading",
  BLOCKED: "blocked",
  READY: "ready",
  IN_PROGRESS: "in_progress"
});

export const MATCHDAY_BLOCKER_ORDER = Object.freeze([
  "lineup_incomplete",
  "duplicate_player",
  "bench_incomplete",
  "squad_too_small",
  "training_missing",
  "opponent_analysis_missing",
  "season_inactive",
  "fixture_missing",
  "club_week_blocked"
]);

function integer(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : fallback;
}

function assignmentsFrom(value) {
  return (Array.isArray(value) ? value : []).map((assignment) => ({
    playerId: assignment?.playerId || null,
    roleId: assignment?.roleId || null
  }));
}

function blocker(code, message, target, summary) {
  return { code, message, target, summary };
}

function blockedSummary(first) {
  return first?.summary || `Laget er ikke kampklart: ${first?.message || "fullfør kampforberedelsene."}`;
}

export function evaluateMatchdayReadiness(input = {}) {
  if (input.matchInProgress) {
    return {
      status: MATCHDAY_READINESS_STATUS.IN_PROGRESS,
      canStartMatch: false,
      isReady: false,
      blockers: [],
      primaryBlocker: null,
      summary: "Kamp pågår.",
      reasons: []
    };
  }

  if (input.dataLoaded === false) {
    const loading = blocker(
      "data_loading",
      "Lagdataene lastes inn.",
      "tactics",
      "Lagdataene må lastes før kampklarhet kan vurderes."
    );
    return {
      status: MATCHDAY_READINESS_STATUS.LOADING,
      canStartMatch: false,
      isReady: false,
      blockers: [loading],
      primaryBlocker: loading,
      summary: loading.summary,
      reasons: [loading.message]
    };
  }

  const expectedStarters = integer(input.expectedStarters, 11) || 11;
  const minimumBench = integer(input.minimumBench, 4) || 4;
  const minimumSquadSize = integer(input.minimumSquadSize, 15) || 15;
  const assignments = assignmentsFrom(input.starterAssignments);
  const completeAssignments = assignments.filter((item) => item.playerId && item.roleId);
  const duplicatePlayerIds = new Set(
    (Array.isArray(input.duplicatePlayerIds) ? input.duplicatePlayerIds : []).filter(Boolean)
  );
  const blockers = [];

  if (assignments.length < expectedStarters || completeAssignments.length < expectedStarters) {
    blockers.push(blocker(
      "lineup_incomplete",
      "Sett alle elleve startplasser med spiller og rolle.",
      "tactics",
      "Startelleveren må fullføres før laget kan bli kampklart."
    ));
  }

  if (duplicatePlayerIds.size > 0) {
    blockers.push(blocker(
      "duplicate_player",
      "Samme spiller kan ikke brukes flere ganger.",
      "tactics",
      "Rett dobbeltbruken i startelleveren før laget kan bli kampklart."
    ));
  }

  if (integer(input.benchCount) < minimumBench) {
    blockers.push(blocker(
      "bench_incomplete",
      `Sett minst ${minimumBench} spillere på benken.`,
      "tactics",
      "Benken må fylles før troppen er klar."
    ));
  }

  if (integer(input.unlockedPlayerCount) < minimumSquadSize) {
    blockers.push(blocker(
      "squad_too_small",
      `Troppen må ha minst ${minimumSquadSize} tilgjengelige spillere.`,
      "historygo",
      "Troppen er for liten til å være kampklar."
    ));
  }

  if (!input.hasTrainingChoice) {
    blockers.push(blocker(
      "training_missing",
      "Velg treningsprogram før kamp.",
      "trening",
      "Treningsuka må fullføres før laget er kampklart."
    ));
  }

  if (input.requiresOpponentAnalysis && !input.hasOpponentAnalysisPlan) {
    blockers.push(blocker(
      "opponent_analysis_missing",
      `Analyser ${input.opponentName || "neste motstander"} og lagre ett observasjonspunkt før kamp.`,
      "board",
      "Motstanderforberedelsen må være registrert før laget er kampklart."
    ));
  }

  const mode = input.selectedMode || null;
  if (mode === "league" && !input.leagueSeasonActive) {
    blockers.push(blocker(
      "season_inactive",
      "Start ligasesongen før kamp.",
      "statistikk",
      "Ligasesongen må være startet før laget kan bli kampklart."
    ));
  } else if (!input.hasPlayableMatch) {
    blockers.push(blocker(
      "fixture_missing",
      "Aktiv spillmodus har ingen kamp som kan spilles.",
      mode === "scenario" || mode === "national" ? "dashboard" : "statistikk",
      "Velg eller start en kamp i den aktive spillmodusen."
    ));
  }

  if (input.clubWeekBlocked) {
    blockers.push(blocker(
      "club_week_blocked",
      input.clubWeekReason || "Klubbuka er ikke kommet til kampdag ennå.",
      "dashboard",
      "Driv klubbuka fram til kampdag før kampen kan startes."
    ));
  }

  if (blockers.length > 0) {
    const primaryBlocker = blockers[0];
    return {
      status: MATCHDAY_READINESS_STATUS.BLOCKED,
      canStartMatch: false,
      isReady: false,
      blockers,
      primaryBlocker,
      summary: blockedSummary(primaryBlocker),
      reasons: blockers.map((item) => item.message)
    };
  }

  return {
    status: MATCHDAY_READINESS_STATUS.READY,
    canStartMatch: true,
    isReady: true,
    blockers: [],
    primaryBlocker: null,
    summary: "Laget er kampklart.",
    reasons: []
  };
}
