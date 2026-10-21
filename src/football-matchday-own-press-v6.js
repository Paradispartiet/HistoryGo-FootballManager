// Kampmotor v6: own collective pressing versus an opponent's build-up.
// The outcome of ONE linked chain is priced before period chance generation.
// FIFA/England Football support the principles, not these game probability values.
const ROUTES = Object.freeze({
  front_press: {
    plans: ["high_press_343"],
    opponentMetric: "shortBuildUp", opponentMin: 65,
    positions: [["ST"], ["LW", "RW", "WB", "LB", "RB"], ["DM", "CM"], ["CB"]],
    metrics: ["pressScore", "balanceScore", "restDefenseScore"],
    steps: [
      "Spissen styrer motstanderens første oppspill til én side",
      "Kant eller vingback presser mottakeren samtidig",
      "Midtbanen skjermer støttepasningen og returen",
      "Stopperleddet sikrer rommet bak når presset utløses"
    ],
    regain: "Samordnet førsteforsvar og pasningsdekning vinner ballen høyt.",
    xgFor: 0.11
  },
  midfield_trap: {
    plans: ["midfield_press_trap"],
    opponentMetric: "possessionControl", opponentMin: 65,
    positions: [["ST", "AM"], ["DM", "CM"], ["CM", "DM", "AM"], ["CB"]],
    metrics: ["pressScore", "balanceScore", "restDefenseScore"],
    steps: [
      "Fremste ledd lar ballen spilles inn i midtbaneområdet",
      "Sekseren skjermer sentral mottaker",
      "Neste midtbanespiller presser på avtalt pasningssignal",
      "Stopperne sikrer rommet når ballen brytes"
    ],
    regain: "Kollektiv midtbanefelle stenger mottakerens neste pasning og gir gjenvinning.",
    xgFor: 0.08
  },
  recovery_press: {
    plans: ["counter_press_recovery"],
    opponentMetric: "transitionThreat", opponentMin: 66,
    positions: [["ST", "LW", "RW", "AM"], ["DM", "CM"], ["CB"]],
    metrics: ["pressScore", "restDefenseScore", "balanceScore"],
    steps: [
      "Et balltap setter motstanderens overgang i gang",
      "Nærmeste angrepsspiller setter inn umiddelbart press",
      "Midtbanen stenger første vertikale pasning",
      "Stopperen sikrer rommet bak presset og angriper returen"
    ],
    regain: "Kollektivt gjenvinningspress hindrer første utpasning og vinner andreballen.",
    xgFor: 0.08
  }
});
const finite = n => typeof n === "number" && Number.isFinite(n);
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const round3 = n => Math.round(n * 1000) / 1000;

function distinctSupport(lineup, groups) {
  if (!Array.isArray(lineup)) return null;
  const used = new Set(), selected = [];
  for (const positions of groups) {
    const player = lineup.filter(p => p?.playerId &&
      !used.has(p.playerId) && p.matchFitKnown === true &&
      finite(p.matchScore) && positions.includes(p.position))
      .sort((a,b) => b.matchScore - a.matchScore)[0];
    if (!player) return null;
    used.add(player.playerId);
    selected.push(player);
  }
  return selected;
}

export function resolveOwnPressAgainstOpponent(session, {
  pressureRoll = Math.random,
  protectionRoll = Math.random
} = {}) {
  if (session?.causalPressingVersion !== 1) return null;
  const id = session.activePlanSnapshot?.id ||
    session.tacticSnapshot?.id || session.selectedTacticId;
  const entry = Object.entries(ROUTES).find(([, config]) => config.plans.includes(id));
  if (!entry) return null;
  const [route, config] = entry;
  const opponent = session.opponent;
  const scenario = opponent?.styleTraits?.[config.opponentMetric] ??
    (config.opponentMetric === "transitionThreat" ? opponent?.transitionThreat : null);
  const resistance = opponent?.pressResistance;
  const threat = opponent?.transitionThreat ?? opponent?.styleTraits?.transitionThreat;
  const profile = session.teamFitSnapshot?.tacticalProfile;
  const metrics = config.metrics.map(name => profile?.[name]);
  const restDefense = profile?.restDefenseScore;
  const balance = profile?.balanceScore;
  const players = distinctSupport(session.lineupSnapshot, config.positions);
  // Do not mistake missing opposition scouting/role fit for a weakness.
  if (!finite(scenario) || scenario < config.opponentMin ||
    !finite(resistance) || !finite(threat) || !finite(restDefense) ||
    !finite(balance) || !metrics.every(finite) || !players) return null;

  const avgFit = players.reduce((sum, p) => sum + p.matchScore, 0) / players.length;
  const weakestFit = Math.min(...players.map(p => p.matchScore));
  const counter = opponent?.tacticalBehaviour?.pressEscapeRoute;
  // A specific, authored escape route matters only when opposition scouting
  // actually indicates it. Unknown behaviour gives no counterclaim.
  const documentedEscape = ["third_man", "switch_play", "direct"].includes(counter);
  const pressProbability = clamp(
    0.53 + (avgFit - 65) * 0.004 +
      (Math.min(...metrics) - 65) * 0.003 +
      (weakestFit - 60) * 0.001 -
      (resistance - 70) * 0.004 -
      (documentedEscape ? 0.15 : 0),
    0.12, 0.85
  );
  const pressResult = Number(pressureRoll());
  if (!finite(pressResult)) return null;
  const regained = clamp(pressResult, 0, 0.999999999) < pressProbability;
  // Rest defence is evaluated only if the opponent gets beyond the press.
  const containment = clamp(
    0.48 + (restDefense - 65) * 0.005 +
      (balance - 65) * 0.002 +
      (avgFit - 65) * 0.001 -
      (threat - 70) * 0.004, 0.12, 0.88
  );
  const protection = regained ? null : Number(protectionRoll());
  if (!regained && !finite(protection)) return null;
  const contained = !regained && clamp(protection, 0, 0.999999999) < containment;
  const outcome = regained ? "regain" : contained ? "contained" : "escaped";
  const chanceSide = regained ? "for" : outcome === "escaped" ? "against" : null;
  const steps = config.steps.map((action, i) => ({
    action,
    result: regained ? "completed" :
      i === 0 ? "completed" :
        i === 1 ? "bypassed" :
          i === 2 ? "failed" : contained ? "contained" : "exposed"
  }));
  return {
    version: 6,
    situation: "our_press_vs_opponent_build_up",
    planId: id, route, status: outcome, side: chanceSide,
    probability: round3(pressProbability),
    containmentProbability: round3(containment),
    xgDeltaFor: regained ? config.xgFor : 0,
    // The terminal outcome owns this single risk; no separate bonus for
    // stage two or for each player in the pressing unit.
    xgDeltaAgainst: regained ? -0.01 : contained ? 0.02 :
      restDefense >= 70 ? 0.06 : 0.12,
    cause: regained ? config.regain :
      contained
        ? "Motstanderen spiller seg ut av første press, men restforsvaret stanser overgangen."
        : documentedEscape
          ? "Motstanderen bruker dokumentert utvei fra presset; bakre sikring blir utfordret."
          : "Første pressledd brytes og restforsvaret rekker ikke å stenge neste rom.",
    steps,
    evidence: {
      opponentTrigger: config.opponentMetric, opponentValue: scenario,
      pressResistance: resistance, transitionThreat: threat,
      opponentEscapeRoute: counter || "unknown",
      support: players.map(p => ({
        playerId: p.playerId, position: p.position,
        roleId: p.roleId, matchScore: p.matchScore
      })),
      metricNames: config.metrics.slice(), metricValues: metrics,
      restDefenseScore: restDefense, balanceScore: balance
    }
  };
}

export function annotateOwnPressChances(chances, phase) {
  if (!Array.isArray(chances) || !phase || !phase.side) return chances;
  const chosen = chances.findIndex(chance => chance.side === phase.side);
  if (chosen < 0) return chances;
  const won = phase.status === "regain";
  return chances.map((chance, i) => i !== chosen ? chance : {
    ...chance,
    tacticalMoment: {
      kind: won ? "press_regain" : "press_broken",
      label: won ? "Kollektiv gjenvinning" : "Motstander spiller av press",
      description: phase.cause,
      planId: phase.planId, planTitle: "Kollektivt press og motspill",
      status: won ? "advantage" : "countered", side: phase.side,
      keyAction: phase.steps.find(step => step.result === "failed")?.action ||
        phase.steps[phase.steps.length - 1]?.action,
      cause: phase.cause, steps: phase.steps,
      observed: false, basis: "simulated_before_chances_v6",
      xgDelta: won ? phase.xgDeltaFor : phase.xgDeltaAgainst
    }
  });
}
