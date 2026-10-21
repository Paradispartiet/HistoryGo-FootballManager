// Kampmotor v6: one pre-chance high-press/build-up possession per period.
// All numbers are explicit GAME-MODEL probabilities, not tracked match events.
// Only existing role fit, available positions, tactical axes and opponent style
// enter the calculation. A missing datum prevents a new v6 bonus/penalty.
const ROUTES = Object.freeze({
  third_man: {
    plans: ["patient_build_up", "central_possession_4231"],
    positions: [["GK"], ["CB"], ["DM", "CM"], ["AM", "CM", "ST"]],
    metrics: ["buildUpScore", "balanceScore"],
    actions: [
      "Keeper trekker til seg første pressledd",
      "Stopper skaper støttevinkel",
      "Sekser eller indreløper legger av",
      "Tredjemann angriper rommet bak presset"
    ],
    success: "Tredjemann spilles fri bak førstepresset."
  },
  switch_play: {
    plans: ["switching_play", "overlap_channels", "wide_overload_433"],
    positions: [["CB"], ["DM", "CM"], ["LB", "RB", "LW", "RW"]],
    metrics: ["buildUpScore", "widthScore"],
    actions: [
      "Første press trekkes mot ballside",
      "Midtbanestøtten sikrer pasningsvinkelen",
      "Spillet vendes mot ledig bredde",
      "Bred spiller fører angrepet forbi presset"
    ],
    success: "Vendingen flytter angrepet utenfor pressfellen."
  },
  direct_outlet: {
    plans: ["direct_second_balls", "direct_counter_442"],
    positions: [["GK", "CB"], ["ST"], ["DM", "CM"]],
    metrics: ["depthScore", "balanceScore"],
    actions: [
      "Ballfører vurderer presset",
      "Direktepasningen finner fremre oppspillspunkt",
      "Midtbanen angriper andreballen",
      "Laget etablerer angrep høyere i banen"
    ],
    success: "Direkte oppspill og andreball frigjør laget fra presset."
  }
});

const finite = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function selectedRoute(session) {
  const id = session?.activePlanSnapshot?.id || session?.tacticSnapshot?.id || session?.selectedTacticId;
  return Object.entries(ROUTES).map(([name, route]) => ({ name, ...route }))
    .find((route) => route.plans.includes(id)) || null;
}

function pressingOpponent(opponent) {
  const traits = opponent?.styleTraits;
  // The named high-press archetype is an authored game scenario. For other
  // opponents, intensity AND a high line must be supplied explicitly.
  const archetype = opponent?.id === "high_press_opponent" ||
    (Array.isArray(opponent?.matchupStyles) && opponent.matchupStyles.includes("high_press"));
  const specificPress = finite(traits?.pressIntensity) && traits.pressIntensity >= 70 &&
    finite(traits?.highLine) && traits.highLine >= 62;
  if (!archetype && !specificPress) return null;
  const intensity = finite(traits?.pressIntensity) ? traits.pressIntensity : archetype ? 74 : null;
  return finite(intensity) ? intensity : null;
}

function supportedPlayers(lineup, groups) {
  const used = new Set();
  const picked = [];
  for (const positions of groups) {
    const options = lineup.filter((player) => !used.has(player.playerId)
      && player.matchFitKnown === true
      && finite(player.matchScore)
      && player.playerId
      && positions.includes(player.position));
    // No fictional individual pass, speed or duel attribute is manufactured:
    // role matchScore is the pre-existing evaluated fit for the selected XI.
    const best = options.sort((a, b) => b.matchScore - a.matchScore)[0];
    if (!best) return null;
    used.add(best.playerId);
    picked.push(best);
  }
  return picked;
}

// One stable roll per match and period: identical pre-period state must not
// change its press outcome merely because the player reopens/replays the UI.
// Comparisons of substitutions on the SAME match thus share the same scenario.
// Standalone legacy fixtures without an id can still inject a deterministic rng.
export function highPressPhaseRoll(session, periodIndex) {
  if (!session?.id) return Math.random();
  const key = String(session.id) + ":" + String(periodIndex);
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

export function resolveHighPressBuildUp(session, { rng = Math.random } = {}) {
  if (!session || typeof session !== "object") return null;
  const route = selectedRoute(session);
  const pressure = pressingOpponent(session.opponent);
  if (!route || pressure === null) return null;
  const players = supportedPlayers(
    Array.isArray(session.lineupSnapshot) ? session.lineupSnapshot : [], route.positions
  );
  const profile = session.teamFitSnapshot?.tacticalProfile;
  const restDefense = profile?.restDefenseScore;
  const metricValues = route.metrics.map((metric) => profile?.[metric]);
  if (!players || !finite(restDefense) || !metricValues.every(finite)) return null;

  const avgFit = players.reduce((sum, player) => sum + player.matchScore, 0) / players.length;
  const weakestFit = Math.min(...players.map((player) => player.matchScore));
  const axis = Math.min(...metricValues);
  // Confirmed shape/cover is allowed to counter a route, but unknown cover
  // does NOT mean an open lane. It contributes a neutral adjustment.
  const shape = session.opponent?.tacticalBehaviour;
  const coveredLane = shape?.pressCoordination === "collective" &&
    ((route.name === "third_man" && shape.passingLaneCover === "central") ||
     (route.name === "switch_play" && shape.passingLaneCover === "wide"));
  const probability = clamp(
    0.48 + (avgFit - 65) * 0.004 + (axis - 65) * 0.003
      + (weakestFit - 60) * 0.0015 - (pressure - 70) * 0.003
      - (coveredLane ? 0.2 : 0),
    0.12, 0.82
  );
  const rawRoll = Number(rng());
  // An invalid RNG must not create certainty or a phantom success.
  if (!finite(rawRoll)) return null;
  const succeeded = clamp(rawRoll, 0, 0.999999999) < probability;
  const attacking = succeeded;
  const failureStep = coveredLane ? route.name === "third_man" ? 2 : 1 : route.actions.length - 1;
  const steps = route.actions.map((action, i) => ({
    action,
    result: succeeded || i < failureStep ? "available" : "blocked"
  }));
  const xgDeltaFor = succeeded ? route.name === "third_man" ? 0.12 : 0.09 : 0;
  const xgDeltaAgainst = succeeded ? -0.02
    : restDefense >= 66 ? 0.04 : restDefense < 50 ? 0.12 : 0.08;

  return {
    version: 6,
    situation: "high_press_vs_build_up",
    planId: session?.activePlanSnapshot?.id || session?.selectedTacticId || session?.tacticSnapshot?.id,
    route: route.name,
    status: succeeded ? "breakthrough" : "turnover",
    side: attacking ? "for" : "against",
    probability: Math.round(probability * 1000) / 1000,
    cause: succeeded ? route.success
      : coveredLane
        ? "Samordnet press og dokumentert pasningsdekning bryter kjeden."
        : "Utførelsen lykkes ikke mot presset; ballen tapes før neste angrep.",
    steps,
    // Period deltas, not multipliers and not independent per-action bonuses.
    xgDeltaFor,
    xgDeltaAgainst,
    evidence: {
      pressIntensity: pressure,
      laneCover: shape?.passingLaneCover || "unknown",
      coordination: shape?.pressCoordination || "unknown",
      support: players.map((player) => ({
        playerId: player.playerId, position: player.position, roleId: player.roleId,
        matchScore: player.matchScore
      })),
      metricNames: route.metrics.slice(),
      metricValues,
      restDefenseScore: restDefense
    }
  };
}

// The chance is generated ONLY AFTER the phase affected its expected goals.
// Connect at most one matching real chance to the causal chain; never add a
// second chance or a separate scoring event.
export function annotateHighPressBuildUpChances(chances, phase) {
  if (!Array.isArray(chances) || !phase) return chances;
  // A recovered or contained transition did NOT create a counterattack
  // chance. Record it on the period only, never mislabel another shot.
  const transition = phase.transition;
  if (transition && transition.outcome !== "counterattack") return chances;
  const selected = chances.findIndex((chance) => chance.side === phase.side);
  if (selected < 0) return chances;
  const counter = transition?.outcome === "counterattack";
  const steps = counter ? [...phase.steps, ...transition.steps] : phase.steps;
  const cause = counter ? transition.cause : phase.cause;
  return chances.map((chance, index) => index !== selected ? chance : {
    ...chance,
    tacticalMoment: {
      kind: counter ? "counterattack" : phase.status,
      label: counter ? "Kontring etter balltap"
        : phase.status === "breakthrough" ? "Presset spilt av" : "Balltap under høyt press",
      description: cause,
      planId: phase.planId,
      planTitle: "Høyt press mot oppbygging",
      status: phase.status === "breakthrough" ? "advantage" : "countered",
      side: phase.side,
      keyAction: counter ? transition.steps.at(-1).action
        : steps.find((step) => step.result === "blocked")?.action ||
          steps[steps.length - 1]?.action,
      cause, steps,
      observed: false,
      basis: "simulated_before_chances_v6",
      xgDelta: phase.side === "for" ? phase.xgDeltaFor : phase.xgDeltaAgainst
    }
  });
}
