// Kampmotor v6: compact-low-block attacking chain, resolved BEFORE chance creation.
// Principles: FIFA switch of play / third-man combinations and England Football
// attacking width. The probabilities below are GAME-MODEL HEURISTICS, not
// probabilities inferred from historical player tracking.
const ROUTES = Object.freeze({
  wide_isolation: {
    plans: ["positional_overloads", "wide_fast_433", "overlap_channels"],
    groups: [["CB", "DM", "CM"], ["LW", "RW", "LM", "RM"], ["LB", "RB"]],
    metrics: ["widthScore", "buildUpScore"],
    actions: [
      "Første støttepasning trekker den kompakte blokken mot ballside",
      "Kantspilleren binder sin forsvarer ute",
      "Backen tilbyr overlapp og åpner pasningsvinkelen",
      "Vending og løp angriper rommet som oppstår på motsatt side"
    ],
    counterKey: "wideCover",
    success: "Breddeovertallet tvinger blokken til å forskyve seg og åpner et angrepsrom.",
    xg: 0.10
  },
  crossing: {
    plans: ["crossing_box_presence"],
    groups: [["LB", "RB"], ["LW", "RW", "LM", "RM"], ["ST"], ["CM", "DM"]],
    metrics: ["widthScore", "balanceScore"],
    actions: [
      "Back og kant skaper et overtall før innleggsområdet",
      "Kantspilleren frigjøres til innleggsrom",
      "Spissen angriper innleggssonen mens midtbanen følger etter",
      "Midtbanestøtten sikrer returrommet etter innlegget"
    ],
    counterKey: "boxCover",
    success: "Overtall ute og samtidige løp gir et reelt innleggs- og avslutningsvindu.",
    xg: 0.10
  },
  wall_pass: {
    plans: ["target_man_focus", "central_possession_4231"],
    groups: [["DM", "CM"], ["ST"], ["AM", "CM"]],
    metrics: ["buildUpScore", "depthScore"],
    actions: [
      "Midtbanen finner første støttepasning foran blokken",
      "Spissen møter og holder oppspillet",
      "Spissen legger av til rettvendt tredjemann",
      "Tredjemann angriper mellom eller rundt forsvarsleddene"
    ],
    counterKey: "centralCover",
    success: "Spissens avlegg frigjør tredjemann før den kompakte blokken rekker å reorganisere.",
    xg: 0.09
  },
  late_commitment: {
    plans: ["chase_the_equaliser", "all_out_attack"],
    groups: [["DM", "CM"], ["LW", "RW", "LM", "RM"], ["ST"], ["CB"]],
    metrics: ["widthScore", "depthScore"],
    actions: [
      "Midtbanen flytter laget høyere og søker støtte i bredden",
      "Kanten utfordrer utenfor den kompakte blokken",
      "Spissen og neste løper fyller boksen",
      "Stopper og midtbane må sikre returrommet mens angrepet avsluttes"
    ],
    counterKey: "boxCover",
    success: "Kollektivt slutttrykk finner et avslutningsvindu, med restforsvaret fortsatt utsatt.",
    xg: 0.12
  }
});
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round3 = (n) => Math.round(n * 1000) / 1000;

function knownCompactBlock(opponent) {
  const traits = opponent?.styleTraits;
  const authored = opponent?.id === "low_block_opponent" ||
    opponent?.baseStyleId === "low_block_opponent";
  // A named low-block scenario is a deliberately-authored preset; arbitrary
  // opponents must have BOTH compactness and low line evidenced numerically.
  const compactness = finite(traits?.defensiveCompactness)
    ? traits.defensiveCompactness : authored ? 82 : null;
  const line = finite(traits?.highLine) ? traits.highLine : authored ? 35 : null;
  return finite(compactness) && finite(line) &&
    compactness >= 72 && line <= 55 ? { compactness, line } : null;
}

function roleChain(lineup, groups) {
  const used = new Set();
  const chosen = [];
  for (const group of groups) {
    const candidate = lineup.filter((p) => p?.playerId &&
      !used.has(p.playerId) && p.matchFitKnown === true &&
      finite(p.matchScore) && group.includes(p.position))
      .sort((a, b) => b.matchScore - a.matchScore)[0];
    if (!candidate) return null;
    used.add(candidate.playerId);
    chosen.push(candidate);
  }
  return chosen;
}

export function resolveCompactBlockAttack(session, { rng = Math.random } = {}) {
  if (!session || session.causalCompactBlockVersion !== 1) return null;
  const id = session.activePlanSnapshot?.id ||
    session.tacticSnapshot?.id || session.selectedTacticId;
  // Reactive pressure is only a score-driven v6 advantage while trailing.
  // Momentum is not a substitute for being a goal behind; missing scores
  // also cannot establish that the team is chasing an equaliser.
  if (id === "chase_the_equaliser" || id === "all_out_attack") {
    if (!finite(session.score?.for) || !finite(session.score?.against) ||
        session.score.for >= session.score.against) return null;
  }
  const routeEntry = Object.entries(ROUTES).find(([, value]) => value.plans.includes(id));
  const block = knownCompactBlock(session.opponent);
  if (!routeEntry || !block) return null;
  const [routeName, route] = routeEntry;
  const profile = session.teamFitSnapshot?.tacticalProfile;
  const values = route.metrics.map((name) => profile?.[name]);
  const restDefense = profile?.restDefenseScore;
  const threat = session.opponent?.transitionThreat ??
    session.opponent?.styleTraits?.transitionThreat;
  const players = roleChain(Array.isArray(session.lineupSnapshot)
    ? session.lineupSnapshot : [], route.groups);
  if (!values.every(finite) || !finite(restDefense) || !finite(threat) || !players) return null;

  const cover = session.opponent?.tacticalBehaviour?.[route.counterKey];
  const collectiveCover = cover === "collective";
  // "unknown" is neutral, never interpreted as absent opposition coverage.
  const averageFit = players.reduce((sum, p) => sum + p.matchScore, 0) / players.length;
  const minimumFit = Math.min(...players.map((p) => p.matchScore));
  const probability = clamp(
    0.52 + (averageFit - 65) * 0.004 +
      (Math.min(...values) - 65) * 0.003 +
      (minimumFit - 60) * 0.001 -
      (block.compactness - 72) * 0.005 -
      (collectiveCover ? 0.18 : 0),
    0.12, 0.82
  );
  const roll = Number(rng());
  if (!finite(roll)) return null;
  const success = clamp(roll, 0, 0.999999999) < probability;
  // Failed attacks do not automatically become shots against: the extra
  // transition-risk window requires the OPPONENT'S transition threat to be
  // known and depends on OUR documented rest defence.
  const counterRisk = success ? 0 :
    restDefense >= 70 ? 0 :
      restDefense >= 55 ? (threat >= 70 ? 0.03 : 0) :
        threat >= 70 ? 0.09 : 0.03;
  const side = success ? "for" : counterRisk > 0 ? "against" : null;
  const failureIndex = collectiveCover ? 2 : 3;
  return {
    version: 6,
    situation: "compact_block_vs_attack",
    planId: id,
    route: routeName,
    status: success ? "breakthrough" : "repelled",
    side,
    probability: round3(probability),
    cause: success ? route.success :
      collectiveCover
        ? "Kollektiv dekning stenger neste løp eller mottaker i angrepskjeden."
        : "Angrepskjeden mister fremdrift mot en kompakt og lav blokk.",
    steps: route.actions.map((action, i) => ({
      action, result: success || i < failureIndex ? "available" : "blocked"
    })),
    xgDeltaFor: success ? route.xg : 0,
    xgDeltaAgainst: counterRisk,
    evidence: {
      defensiveCompactness: block.compactness, highLine: block.line,
      transitionThreat: threat, restDefenseScore: restDefense,
      cover: cover || "unknown", counterKey: route.counterKey,
      support: players.map((p) => ({
        playerId: p.playerId, position: p.position,
        roleId: p.roleId, matchScore: p.matchScore
      })),
      metricNames: route.metrics.slice(), metricValues: values
    }
  };
}

// Attach only to a chance produced by the already-adjusted xG ledger.
// A repelled attack without a counter-risk window must not label an unrelated
// opponent shot as a transition.
export function annotateCompactBlockChances(chances, phase) {
  if (!Array.isArray(chances) || !phase || !phase.side) return chances;
  const index = chances.findIndex((chance) => chance.side === phase.side);
  if (index < 0) return chances;
  const counter = phase.side === "against";
  return chances.map((chance, i) => i !== index ? chance : {
    ...chance,
    tacticalMoment: {
      kind: counter ? "counter_window" : "block_break",
      label: counter ? "Kontringsrom etter brutt angrep" : "Lav blokk brutt",
      description: phase.cause,
      planId: phase.planId, planTitle: "Angrep mot kompakt lav blokk",
      status: counter ? "countered" : "advantage", side: phase.side,
      keyAction: phase.steps.find((step) => step.result === "blocked")?.action ||
        phase.steps[phase.steps.length - 1]?.action,
      cause: phase.cause, steps: phase.steps,
      observed: false, basis: "simulated_before_chances_v6",
      xgDelta: counter ? phase.xgDeltaAgainst : phase.xgDeltaFor
    }
  });
}
