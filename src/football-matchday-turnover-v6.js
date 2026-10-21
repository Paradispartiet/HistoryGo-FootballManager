// Kampmotor v6: connected defensive transition AFTER a simulated build-up loss.
// The ball loss is the cause, not a second independently drawn tactical event.
// Everything here is a game-model hypothesis, never observed player tracking.
// Only documented lineup role fit and existing team/opponent dimensions count.
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round3 = (value) => Math.round(value * 1000) / 1000;

function coveringPlayers(lineup) {
  if (!Array.isArray(lineup)) return null;
  const eligible = lineup.filter((entry) => entry?.playerId &&
    entry.matchFitKnown === true && finite(entry.matchScore));
  const centreBack = eligible.filter((entry) => entry.position === "CB")
    .sort((a, b) => b.matchScore - a.matchScore)[0];
  const midfieldCover = eligible.filter((entry) =>
    ["DM", "CM"].includes(entry.position) && entry.playerId !== centreBack?.playerId)
    .sort((a, b) => b.matchScore - a.matchScore)[0];
  if (!centreBack || !midfieldCover) return null;
  return [centreBack, midfieldCover];
}

// In a high press the opponent has won OUR build-up ball. Can the first
// forward pass evade the counterpress? If so, does our rest defence hold?
// Resolve both dependencies before xG/chance generation. A stop in either
// stage ends the chain, and its single terminal outcome owns its xG effect.
export function resolveTurnoverTransition(session, buildUpPhase, {
  firstPassRoll = Math.random,
  coverRoll = Math.random
} = {}) {
  // Old in-progress saves never gain new v6 causal rules mid-match.
  if (session?.causalTransitionsVersion !== 1 ||
      buildUpPhase?.situation !== "high_press_vs_build_up" ||
      buildUpPhase?.status !== "turnover") return null;

  const profile = session?.teamFitSnapshot?.tacticalProfile;
  const press = profile?.pressScore;
  const balance = profile?.balanceScore;
  const restDefence = profile?.restDefenseScore;
  const threat = session?.opponent?.transitionThreat ??
    session?.opponent?.styleTraits?.transitionThreat;
  const cover = coveringPlayers(session?.lineupSnapshot);
  // Absence of team/opposition evidence is UNKNOWN, not an imaginary weak
  // defender or assumed successful first pass. Fall back to existing v6.
  if (!finite(press) || !finite(balance) || !finite(restDefence) ||
      !finite(threat) || !cover) return null;

  const fit = (cover[0].matchScore + cover[1].matchScore) / 2;
  const firstPassProbability = clamp(
    0.48 + (threat - 70) * 0.004 -
      (press - 65) * 0.003 - (balance - 65) * 0.002,
    0.12, 0.88
  );
  // Rest defence here includes positional support from actual selected
  // players. A good CB alone cannot ensure cover without the midfield link.
  const containProbability = clamp(
    0.44 + (restDefence - 65) * 0.005 +
      (balance - 65) * 0.002 + (fit - 65) * 0.002 -
      (threat - 70) * 0.003,
    0.12, 0.88
  );
  const firstRoll = firstPassRoll();
  if (!finite(firstRoll)) return null;
  const passCompleted = clamp(firstRoll, 0, 0.999999999) < firstPassProbability;
  const coverValue = passCompleted ? coverRoll() : null;
  if (passCompleted && !finite(coverValue)) return null;
  const contained = passCompleted &&
    clamp(coverValue, 0, 0.999999999) < containProbability;
  const outcome = !passCompleted ? "regained"
    : contained ? "contained"
    : "counterattack";
  const steps = [
    { side: "against", action: "Motstanderen vinner ballen i vår oppbygging", result: "completed" },
    { side: "against", action: "Første fremoverpasning forsøker å passere gjenvinningspresset",
      result: passCompleted ? "completed" : "intercepted" },
    { side: "for", action: "Nærmeste spiller presser mens støtte stenger neste pasningsvei",
      result: passCompleted ? "bypassed" : "regained" },
    { side: "for", action: "Midtbanedekning og stoppere sikrer rommet bak ballen",
      result: !passCompleted ? "not_reached" : contained ? "contained" : "broken" },
    { side: "against", action: "Motstanderen angriper åpent kontringsrom",
      result: outcome === "counterattack" ? "chance_window" : "not_reached" }
  ];

  return {
    version: 6,
    situation: "turnover_to_defensive_transition",
    trigger: buildUpPhase.situation,
    outcome,
    status: outcome,
    // This REPLACES the turnover's preliminary risk: 0.04/0.08/0.12
    // must never be added on top of the terminal transition outcome.
    xgDeltaAgainst: outcome === "counterattack" ? 0.14
      : outcome === "contained" ? 0.02 : 0,
    xgDeltaFor: 0,
    probabilities: { firstForwardPass: round3(firstPassProbability),
      defensiveContainment: round3(containProbability) },
    cause: outcome === "regained"
      ? "Første fremoverpasning stanses av kollektivt gjenvinningspress."
      : outcome === "contained"
        ? "Presset passeres, men midtbanedekning og restforsvar forsinker kontringen."
        : "Første pasning bryter gjenvinningspresset, og restforsvaret mister rommet bak.",
    steps,
    evidence: {
      transitionThreat: threat, pressScore: press,
      balanceScore: balance, restDefenseScore: restDefence,
      cover: cover.map((entry) => ({
        playerId: entry.playerId, roleId: entry.roleId,
        position: entry.position, matchScore: entry.matchScore
      }))
    }
  };
}
