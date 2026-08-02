// ============================================================================
// Kvalifisering (opp-/nedrykkskamper) v1
//
// Sesongen endte på en kvalifiseringsplass. Det er en PLASS, ikke en dom — og
// derfor skal manageren spille den, ikke få den regnet ut. Uten dette var 3.
// plass i OBOS og 14. plass i Eliteserien to plasseringer spillet nevnte og så
// ikke gjorde noe med.
//
// Motoren eier kvalifiseringens PROGRESJON, ikke fotballen. Som mini-sesongen,
// serien og mesterskapet simulerer den aldri managerens egen kamp: den tar imot
// Kampdag-resultatet og bestemmer bare hva som skjer videre.
//
// Formatet er det norske: to kamper, sammenlagt. Utfordreren nedenfra spiller
// første kamp hjemme og andre borte — den som forsvarer plassen avslutter på
// egen bane. Står det likt sammenlagt avgjør bortemål, deretter straffer.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random.
// Deterministisk — lik input og seed gir byte-identisk output.
// ============================================================================

export const LEAGUE_PLAYOFF_VERSION = "historygo-football-manager.league-playoff.v1";

function hash(text) {
  let value = 0x811c9dc5;
  for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 0x01000193); }
  return value >>> 0;
}

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

// Hvem møter du? Managerens egen serie er den eneste som spilles, så motparten
// må velges fra nabonivået. Den velges der den faktisk ville kommet fra:
// oppover møter du bunnen av divisjonen over, nedover møter du toppen av
// divisjonen under. Utvalget er seedet, ikke tilfeldig.
function pickOpponent(pool, { fromTop, seed, exclude = [] }) {
  const candidates = pool
    .filter((club) => !exclude.includes(club.id))
    .sort((a, b) => (fromTop ? num(b.strength) - num(a.strength) : num(a.strength) - num(b.strength)) || a.id.localeCompare(b.id))
    .slice(0, 4);
  if (candidates.length === 0) return null;
  return candidates[hash(seed) % candidates.length];
}

function createLeg(legNumber, homeAway) {
  return { leg: legNumber, homeAway, status: "scheduled", score: null };
}

// En omgang = to kamper. `role` sier om manageren utfordrer eller forsvarer;
// det bestemmer hvilken vei banene går.
function createRound(index, name, role, opponent, description) {
  const managerFinishesHome = role !== "challenger";
  return {
    index, name, role, description,
    opponent: opponent ? { ...opponent } : null,
    legs: [
      createLeg(1, managerFinishesHome ? "away" : "home"),
      createLeg(2, managerFinishesHome ? "home" : "away")
    ],
    status: "active",
    aggregate: { for: 0, against: 0 },
    awayGoals: { manager: 0, opponent: 0 },
    decidedBy: null
  };
}

// Kvalifisering er bare aktuelt fra en kvalifiseringsplass. Alt annet gir null,
// og da ruller sesongen videre som før.
export function createLeaguePlayoff({ outcome, managerClub, allClubs = [], tiers = [], seed = "kval-1" } = {}) {
  if (!outcome || !managerClub) return null;
  const kind = outcome.movement === "promotion_playoff" ? "promotion"
    : outcome.movement === "relegation_playoff" ? "relegation"
      : null;
  if (!kind) return null;

  const tier = tiers.find((entry) => entry.id === outcome.tierId);
  if (!tier) return null;
  const rules = kind === "promotion" ? tier.promotion : tier.relegation;
  const targetTier = tiers.find((entry) => entry.id === rules?.toTier);
  if (!targetTier) return null;

  const roundCount = Math.max(1, num(rules?.playoffRounds, 1));
  const rounds = [];

  // Første omgang i en to-trinns kvalifisering går mot en likemann: den andre
  // avdelingens toer. 2. divisjon er delt, så den kampen finnes på ekte.
  if (roundCount > 1) {
    const peers = allClubs.filter((club) => club.tier === tier.id && club.group && club.group !== managerClub.group);
    const peer = pickOpponent(peers, { fromTop: true, seed: `${seed}:peer`, exclude: [managerClub.id] });
    rounds.push(createRound(0, "Avdelingsoppgjøret", "peer", peer,
      `Toerne i de to avdelingene møtes. Vinneren går videre til kvalifisering mot ${targetTier.name}.`));
  }

  const bridgePool = allClubs.filter((club) => club.tier === targetTier.id);
  const bridgeOpponent = pickOpponent(bridgePool, {
    // Skal du OPP, møter du bunnen av divisjonen over. Skal du overleve, møter
    // du den som vant seg fram nedenfra.
    fromTop: kind === "relegation",
    seed: `${seed}:bro`,
    exclude: [managerClub.id]
  });
  rounds.push(createRound(rounds.length,
    kind === "promotion" ? `Opprykkskvalifisering mot ${targetTier.name}` : `Nedrykkskvalifisering mot ${targetTier.name}`,
    kind === "promotion" ? "challenger" : "defender",
    bridgeOpponent,
    kind === "promotion"
      ? `Vinner du sammenlagt, spiller du i ${targetTier.name} neste sesong.`
      : `Vinner du sammenlagt, beholder du plassen i ${tier.name}.`));

  return {
    version: LEAGUE_PLAYOFF_VERSION,
    kind, seed,
    tierId: tier.id, tierName: tier.name,
    targetTierId: targetTier.id, targetTierName: targetTier.name,
    seasonNumber: num(outcome.seasonNumber, 1),
    fromPosition: outcome.position,
    managerClubId: managerClub.id,
    rounds,
    currentRoundIndex: 0,
    status: "active",
    resolution: null
  };
}

export function getCurrentPlayoffRound(playoff) {
  if (!playoff || playoff.status !== "active") return null;
  return playoff.rounds[playoff.currentRoundIndex] || null;
}

export function getCurrentPlayoffLeg(playoff) {
  const round = getCurrentPlayoffRound(playoff);
  if (!round) return null;
  return round.legs.find((leg) => leg.status !== "completed") || null;
}

// Motstanderen slik Kampdag vil ha den. Formen er den samme som en serierunde,
// så kampdagen ikke trenger å vite at dette er en kvalifisering.
export function getPlayoffMatchdayOpponent(playoff) {
  const round = getCurrentPlayoffRound(playoff);
  const leg = getCurrentPlayoffLeg(playoff);
  if (!round?.opponent || !leg) return null;
  return {
    ...round.opponent,
    homeAway: leg.homeAway,
    round: round.index + 1,
    leg: leg.leg,
    matchId: `${playoff.seed}-kval-r${round.index + 1}-k${leg.leg}`,
    isPlayoff: true,
    playoffRoundName: round.name
  };
}

function decideRound(round, seed) {
  const [first, second] = round.legs;
  const managerGoals = num(first.score?.for) + num(second.score?.for);
  const opponentGoals = num(first.score?.against) + num(second.score?.against);
  round.aggregate = { for: managerGoals, against: opponentGoals };

  // Bortemål: managerens mål i den kampen han spilte borte, mot motstanderens
  // mål i den kampen han spilte hjemme.
  const managerAwayLeg = round.legs.find((leg) => leg.homeAway === "away");
  const managerHomeLeg = round.legs.find((leg) => leg.homeAway === "home");
  round.awayGoals = {
    manager: num(managerAwayLeg?.score?.for),
    opponent: num(managerHomeLeg?.score?.against)
  };

  if (managerGoals !== opponentGoals) {
    round.status = managerGoals > opponentGoals ? "won" : "lost";
    round.decidedBy = "sammenlagt";
    return round;
  }
  if (round.awayGoals.manager !== round.awayGoals.opponent) {
    round.status = round.awayGoals.manager > round.awayGoals.opponent ? "won" : "lost";
    round.decidedBy = "bortemål";
    return round;
  }
  // Helt likt etter to kamper og bortemål. Da går det til straffer — og det er
  // seedet, ikke tilfeldig, så en omlasting aldri endrer utfallet.
  round.status = hash(`${seed}:straffer:${round.index}`) % 2 === 0 ? "won" : "lost";
  round.decidedBy = "straffer";
  return round;
}

// Kampdagen er spilt: ta imot resultatet. Muterer ikke inn-staten.
export function completePlayoffLeg(playoff, managerResult) {
  if (!playoff || playoff.status !== "active") return playoff;
  const next = structuredClone(playoff);
  const round = next.rounds[next.currentRoundIndex];
  const leg = round?.legs.find((entry) => entry.status !== "completed");
  if (!leg) return playoff;

  leg.score = {
    for: Math.max(0, Math.round(num(managerResult?.score?.for ?? managerResult?.goalsFor))),
    against: Math.max(0, Math.round(num(managerResult?.score?.against ?? managerResult?.goalsAgainst)))
  };
  leg.status = "completed";

  if (round.legs.every((entry) => entry.status === "completed")) {
    decideRound(round, next.seed);
    if (round.status === "lost") {
      next.status = "lost";
    } else if (next.currentRoundIndex === next.rounds.length - 1) {
      next.status = "won";
    } else {
      next.currentRoundIndex += 1;
    }
  }
  return next;
}

// Hva kvalifiseringen betyr for nivået neste sesong. Samme form som
// resolveLeagueOutcome, så sesongrullen kan bruke den uten å vite forskjell.
export function resolveLeaguePlayoff(playoff) {
  if (!playoff || playoff.status === "active") return null;
  const won = playoff.status === "won";
  const lastRound = playoff.rounds[playoff.rounds.length - 1];
  const decided = playoff.rounds.find((round) => round.status === "lost") || lastRound;

  if (playoff.kind === "promotion") {
    return {
      movement: won ? "promoted" : "stay",
      toTierId: won ? playoff.targetTierId : playoff.tierId,
      won,
      decidedBy: decided?.decidedBy || null,
      roundName: decided?.name || null,
      aggregate: decided?.aggregate || null,
      headline: won ? `Opprykk til ${playoff.targetTierName}!` : `Kvalifiseringen holdt ikke — ${playoff.tierName} også neste sesong.`,
      reason: won
        ? `Du gikk gjennom kvalifiseringen fra ${playoff.fromPosition}. plass og er oppe.`
        : `Du kom til kvalifisering fra ${playoff.fromPosition}. plass, men kom ikke gjennom. Avgjort på ${decided?.decidedBy || "sammenlagt"}.`
    };
  }
  return {
    movement: won ? "stay" : "relegated",
    toTierId: won ? playoff.tierId : playoff.targetTierId,
    won,
    decidedBy: decided?.decidedBy || null,
    roundName: decided?.name || null,
    aggregate: decided?.aggregate || null,
    headline: won ? `Plassen i ${playoff.tierName} er berget.` : `Nedrykk til ${playoff.targetTierName}.`,
    reason: won
      ? `Du berget plassen i kvalifiseringen. Avgjort på ${decided?.decidedBy || "sammenlagt"}.`
      : `Kvalifiseringen gikk tapt på ${decided?.decidedBy || "sammenlagt"}. Nivået neste sesong er ${playoff.targetTierName}.`
  };
}

// Lesbar status til UI: hvor i kvalifiseringen står du, og hva står på spill.
export function describePlayoff(playoff) {
  if (!playoff) return null;
  const round = getCurrentPlayoffRound(playoff);
  const leg = getCurrentPlayoffLeg(playoff);
  if (playoff.status !== "active") {
    const resolution = resolveLeaguePlayoff(playoff);
    return { active: false, headline: resolution.headline, detail: resolution.reason, resolution };
  }
  const played = round.legs.filter((entry) => entry.status === "completed");
  const standing = played.length === 1
    ? `Sammenlagt etter én kamp: ${num(played[0].score?.for)}–${num(played[0].score?.against)}.`
    : "Ingen kamper spilt ennå.";
  return {
    active: true,
    headline: `${round.name} — kamp ${leg.leg} av 2 ${leg.homeAway === "home" ? "hjemme" : "borte"}`,
    detail: `${round.description} ${standing} Står det likt sammenlagt, avgjør bortemål, deretter straffer.`,
    opponentName: round.opponent?.name || "ukjent motstander",
    resolution: null
  };
}

export function normalizeLeaguePlayoff(value) {
  if (!value || value.version !== LEAGUE_PLAYOFF_VERSION) return null;
  if (!Array.isArray(value.rounds) || value.rounds.length === 0) return null;
  if (!value.rounds.every((round) => Array.isArray(round.legs) && round.legs.length === 2)) return null;
  return structuredClone(value);
}
