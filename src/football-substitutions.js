// Innbytte v1 — benken kommer på banen
//
// Spillet har alltid KREVD fire benkespillere (`REQUIRED_BENCH = 4`): du kom
// ikke til kamp uten dem. Så satt de der. Ingen av dem kom noen gang inn.
// Statistikkflata avslørte det selv — etter tre kamper sto alle elleve med
// nøyaktig tre kamper, fordi ingen kunne rotere.
//
// Et innbytte er en beslutning på linje med managergrepene og planbyttene: det
// har en pris, det kan treffe eller bomme, og det forklares. Effektformen er
// derfor den samme (`eventScoreDelta`, `xgDeltaFor`, `xgDeltaAgainst`,
// `momentumDelta`, `riskDelta`, `tacticalClarityDelta`), slik at
// `finalizeMatchdaySession` summerer alt i ett regnestykke.
//
// Kjerneprinsippet: **det er ikke `overall` som avgjør.** Den som kommer inn
// måles på hvor godt han passer PLASSEN han går inn i — posisjonen og rollen
// han overtar — mot den som går av. En «dårligere» spiller på papiret kan løfte
// laget fordi han passer plassen bedre. Og setter du en spiss inn på stopper,
// er det feilbruk: motoren stopper deg ikke, men den sier det rett ut.
//
// Motoren er ren: ingen DOM, ingen lagring, ingen `Date.now`.

import { calculatePlayerMatchFit } from "./football-fit-engine.js";
import { sourcedTeamSkillTendencies } from "./football-team-fit-engine.js";
import { sourcedRecoverySkillsForPlayer, sourcedDefensiveReactionSkillsForPlayer } from "./football-player-stats.js";

// Fire på benken, tre bytter. Du kan ikke bruke alle — valget skal koste noe.
export const MAX_SUBSTITUTIONS = 3;

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Math.round(num(value) * 100) / 100;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}


// Same sourced skill rules as the pre-match team-fit engine. Snapshot raw
// role-specific contributions, not a new player rating or fictional ability.
// The existing +6 team cap is reapplied after every substitution.
const SOURCED_METRIC_LABELS = Object.freeze({
  balanceScore: "balansen",
  widthScore: "bredden",
  depthScore: "dybden",
  buildUpScore: "oppbyggingen",
  pressScore: "presset",
  restDefenseScore: "restforsvaret"
});
const SOURCED_METRICS = Object.keys(SOURCED_METRIC_LABELS);

export function sourcedMetricBonusesForAssignment(assignment, tactic) {
  if (!assignment?.player || !assignment?.slot || !assignment?.role) return {};
  const sourced = sourcedTeamSkillTendencies([assignment], tactic);
  return Object.fromEntries(SOURCED_METRICS.map((metric) => [
    metric, clamp(num(sourced[metric]?.bonus), 0, 4)
  ]));
}

export function aggregateSourcedMetricBonuses(lineup) {
  return Object.fromEntries(SOURCED_METRICS.map((metric) => [
    metric,
    Math.min(6, asArray(lineup).reduce((sum, entry) =>
      sum + clamp(num(entry?.sourcedMetricBonuses?.[metric]), 0, 4), 0))
  ]));
}

function sourcedChangesForSwap(session, outgoingId, incomingBonuses) {
  const lineup = asArray(session.lineupSnapshot);
  const before = aggregateSourcedMetricBonuses(lineup);
  const afterLineup = lineup.map((entry) =>
    entry.playerId === outgoingId ? { ...entry, sourcedMetricBonuses: incomingBonuses } : entry);
  const after = aggregateSourcedMetricBonuses(afterLineup);

  // For v2 sessions, derive each live value from the ORIGINAL kick-off
  // tactical profile and the CURRENT set of players, not the previous
  // rounded/clamped value. Repeated substitutions then cannot accumulate
  // 100-point clipping errors or depend on their order.
  const kickoff = session?.sourcedSubstitutionBaseline;
  const currentProfile = session?.teamFitSnapshot?.tacticalProfile;
  if (session?.sourcedSubstitutionVersion === 2
      && kickoff?.tacticalProfile && kickoff?.bonuses && currentProfile) {
    return Object.fromEntries(SOURCED_METRICS.map((metric) => {
      const target = clamp(num(kickoff.tacticalProfile[metric])
        + after[metric] - num(kickoff.bonuses[metric]), 0, 100);
      return [metric, target - clamp(num(currentProfile[metric]), 0, 100)];
    }));
  }

  // v1 sessions created before this adjustment keep their existing rules.
  return Object.fromEntries(SOURCED_METRICS.map((metric) => [
    metric, after[metric] - before[metric]
  ]));
}

// Posisjonsgrupper brukes til å lese om byttet svarer på kampbildet: jager du
// utligningen eller lukker du kampen?
const ATTACKING = new Set(["ST", "LW", "RW", "AM"]);
const DEFENSIVE = new Set(["GK", "CB", "LB", "RB", "DM"]);

// ---------------------------------------------------------------------------
// Benken slik motoren trenger den
// ---------------------------------------------------------------------------

// For hver benkespiller: hvor godt han ville passet på HVER av de elleve
// plassene. Regnes én gang ved avspark, slik at sesjonen er selvforsynt og
// ingen roller/taktikk må bæres videre inn i lagringen.
//
// 4 × 11 = 44 utregninger. Billig, og det gjør at UI-et kan vise «hva skjer om
// jeg setter ham der» før du bestemmer deg — ikke bare etterpå.
export function createBenchSnapshot({ benchPlayers, teamFit, tactic, roles = [] } = {}) {
  const assignments = asArray(teamFit?.assignments).filter((assignment) => assignment?.player?.id && assignment.slot);

  return asArray(benchPlayers)
    .filter((player) => player?.id)
    .map((player) => {
      const fitBySlot = {};
      assignments.forEach((assignment) => {
        const slotId = str(assignment.slot.slotId);
        if (!slotId) return;
        const fit = calculatePlayerMatchFit(player, { position: assignment.slot.position }, assignment.role, tactic, roles);
        fitBySlot[slotId] = {
          matchScore: num(fit?.matchScore, 50),
          positionFit: num(fit?.positionFit),
          roleFit: num(fit?.roleFit),
          misusePenalty: num(fit?.misusePenalty),
          sourcedMetricBonuses: sourcedMetricBonusesForAssignment({
            player, slot: assignment.slot, role: assignment.role
          }, tactic)
        };
      });

      return {
        playerId: str(player.id),
        name: str(player.name) || str(player.id),
        naturalPositions: asArray(player.naturalPositions).map((position) => str(position).toUpperCase()),
        sourcedRecoverySkills: sourcedRecoverySkillsForPlayer(player),
        sourcedDefensiveReactionSkills: sourcedDefensiveReactionSkillsForPlayer(player),
        fitBySlot
      };
    });
}

// Hvem kan fortsatt komme inn, og hvem står på banen akkurat nå.
export function availableSubstitutions(session) {
  const used = new Set(asArray(session?.substitutions).map((entry) => str(entry.inPlayerId)));
  const onPitch = new Set(asArray(session?.lineupSnapshot).map((entry) => str(entry.playerId)));
  return {
    bench: asArray(session?.benchSnapshot).filter((entry) => !used.has(entry.playerId) && !onPitch.has(entry.playerId)),
    onPitch: asArray(session?.lineupSnapshot),
    remaining: substitutionsRemaining(session)
  };
}

export function substitutionsRemaining(session) {
  return Math.max(0, MAX_SUBSTITUTIONS - asArray(session?.substitutions).length);
}

// ---------------------------------------------------------------------------
// Vurderingen
// ---------------------------------------------------------------------------

// Hvor sliten er den som går av? Vi bruker minuttene han faktisk har spilt i
// DENNE kampen — ingen ny, skjult spillertilstand mellom kamper. Under 55
// minutter er det ingen friskhetsgevinst i å bytte ham; etter 90 er den full.
function tirednessOf(entry, minute) {
  const playedFrom = num(entry?.onFrom, 0);
  const played = Math.max(0, num(minute, 0) - playedFrom);
  // Kom han sliten inn i kampen, er han tom tidligere. Friskhet 100 = full
  // terskel på 55 minutter; friskhet 40 = terskelen faller til rundt 28.
  const startFreshness = clamp(num(entry?.startFreshness, 100), 0, 100);
  const threshold = 20 + (startFreshness / 100) * 35;
  return clamp((played - threshold) / 35, 0, 1);
}

// Svarer byttet på kampbildet? Å sende inn en angriper når du jager, eller å
// styrke bakover når du leder, er å lese kampen. Det motsatte er ikke forbudt —
// men det gir ingen bonus.
function situationFitFor(position, gameState) {
  const attacking = ATTACKING.has(position);
  const defensive = DEFENSIVE.has(position);
  if (gameState === "behind") return attacking ? 1 : defensive ? -0.5 : 0;
  if (gameState === "leading") return defensive ? 0.8 : attacking ? -0.3 : 0;
  return 0;
}

// Prisen for å bryte opp et lag som spiller. Et innbytte forstyrrer mindre enn
// et fullt planbytte, men det er ikke gratis — og sent i kampen har laget
// mindre tid på å finne hverandre igjen. En trener som forstår systemet sitt
// betaler mindre.
function switchCost(session, minute) {
  const lateness = clamp(num(minute, 0) / 90, 0, 1);
  const understanding = clamp(num(session?.coachSnapshot?.coachUnderstanding, 50), 0, 100);
  const friction = 1 - (understanding - 50) / 160;
  const clarityCost = -round2((0.35 + lateness * 0.45) * clamp(friction, 0.6, 1.4));
  const riskCost = round2((0.3 + lateness * 0.5) * clamp(friction, 0.6, 1.4));
  return { clarityCost, riskCost };
}

// Hva skjer om jeg setter denne spilleren inn her? Brukes både til å vise
// alternativene FØR valget og til å regne effekten når byttet gjøres.
export function evaluateSubstitution({ session, outPlayerId, inPlayerId, minute = 0, gameState = "level" } = {}) {
  const out = asArray(session?.lineupSnapshot).find((entry) => entry.playerId === outPlayerId) || null;
  const incoming = asArray(session?.benchSnapshot).find((entry) => entry.playerId === inPlayerId) || null;
  if (!out || !incoming) return null;

  const slotId = str(out.slotId);
  const fit = incoming.fitBySlot?.[slotId];
  if (!fit) return null;

  // Passformen på PLASSEN, ikke spillerens klasse. Den som kommer inn overtar
  // posisjonen og rollen til den som går av.
  const fitDelta = num(fit.matchScore) - num(out.matchScore);
  const tiredness = tirednessOf(out, minute);
  const situation = situationFitFor(str(out.position), gameState);
  const misuse = num(fit.misusePenalty);
  // Old saved sessions are deliberately left on their original tactical model.
  const sourcedMetricBonusesAfter = fit.sourcedMetricBonuses || {};
  const sourcedMetricChanges = Number(session?.sourcedSubstitutionVersion) >= 1
    && session?.teamFitSnapshot?.tacticalProfile
    ? sourcedChangesForSwap(session, outPlayerId, sourcedMetricBonusesAfter)
    : Object.fromEntries(SOURCED_METRICS.map((metric) => [metric, 0]));

  const cost = switchCost(session, minute);

  // Forbedringen er summen av tre lesninger: passer han plassen bedre, er den
  // som går av tom, og svarer byttet på kampbildet. Feilbruk trekker fra —
  // synlig, som en trenerfeil.
  const improvement = round2(
    (fitDelta / 100) * 0.55 +
    tiredness * 0.42 +
    situation * 0.3 -
    (misuse / 100) * 0.5
  );

  const effects = {
    eventScoreDelta: 0,
    xgDeltaFor: round2(improvement * 0.26),
    xgDeltaAgainst: round2(cost.riskCost * 0.05 - improvement * 0.14),
    momentumDelta: round2(improvement * 2.2),
    riskDelta: cost.riskCost,
    tacticalClarityDelta: round2(cost.clarityCost + Math.max(0, improvement) * 0.5)
  };

  const reasons = [];
  if (fitDelta >= 4) reasons.push(`${incoming.name} passer plassen bedre (${fit.matchScore} mot ${out.matchScore}).`);
  else if (fitDelta <= -4) reasons.push(`${incoming.name} passer plassen dårligere (${fit.matchScore} mot ${out.matchScore}).`);
  else reasons.push(`Jevn bytte på passform (${fit.matchScore} mot ${out.matchScore}).`);

  if (tiredness >= 0.5) reasons.push(`${out.name} har gått lenge — friske bein betyr noe nå.`);
  if (situation > 0) reasons.push(gameState === "behind" ? "Offensivt bytte når du jager." : "Du styrker laget mens du leder.");
  else if (situation < 0) reasons.push(gameState === "behind" ? "Defensivt bytte mens du jager utligningen." : "Offensivt bytte mens du leder — det åpner bakover.");
  if (misuse >= 12) reasons.push(`Feilbruk: ${incoming.name} er ikke en ${str(out.roleName) || "slik rolle"} — det er ditt valg, ikke hans begrensning.`);
  if (minute >= 75) reasons.push("Sent bytte: laget får kort tid på å finne hverandre igjen.");
  const tacticalChanges = Object.entries(sourcedMetricChanges)
    .filter(([, change]) => change !== 0)
    .map(([metric, change]) => `${SOURCED_METRIC_LABELS[metric]} (${change > 0 ? "+" : ""}${change})`);
  if (tacticalChanges.length > 0) {
    reasons.push(`Kildebelagte styrker endrer ${tacticalChanges.join(", ")} i resten av kampen.`);
  }

  const tone = effects.momentumDelta > 0.2 ? "positive" : effects.momentumDelta < -0.2 ? "negative" : "neutral";

  return {
    slotId,
    outPlayerId: out.playerId,
    outName: out.name,
    inPlayerId: incoming.playerId,
    inName: incoming.name,
    position: out.position,
    roleId: out.roleId,
    roleName: out.roleName,
    matchScoreBefore: num(out.matchScore),
    matchScoreAfter: num(fit.matchScore),
    fitDelta: round2(fitDelta),
    tiredness: round2(tiredness),
    situation: round2(situation),
    misusePenalty: misuse,
    improvement,
    sourcedMetricBonusesAfter,
    sourcedMetricChanges,
    effects,
    tone,
    reasons,
    summary: `${out.name} ut, ${incoming.name} inn (${str(out.roleName) || str(out.position)}).`
  };
}

// Rangér benken for en gitt plass: hvem er det beste byttet her, akkurat nå?
// Rådgiving, ikke automatikk — manageren velger fortsatt selv.
export function rankSubstitutionsForSlot({ session, outPlayerId, minute = 0, gameState = "level" } = {}) {
  const { bench } = availableSubstitutions(session);
  return bench
    .map((entry) => evaluateSubstitution({ session, outPlayerId, inPlayerId: entry.playerId, minute, gameState }))
    .filter(Boolean)
    .sort((a, b) => b.improvement - a.improvement);
}

// ---------------------------------------------------------------------------
// Gjennomføringen
// ---------------------------------------------------------------------------

// Gjør byttet. Ren funksjon: returnerer en ny sesjon, muterer ingenting.
// Nekter når byttekvoten er brukt opp, eller når spillerne ikke finnes — men
// nekter ALDRI fordi valget er dårlig. Et dårlig bytte er en trenerfeil som
// skal bli synlig, ikke en handling spillet forbyr.
export function applySubstitution(session, { outPlayerId, inPlayerId, minute = 0, gameState = "level" } = {}) {
  if (!session || typeof session !== "object") return session;
  if (substitutionsRemaining(session) <= 0) return session;

  const evaluation = evaluateSubstitution({ session, outPlayerId, inPlayerId, minute, gameState });
  if (!evaluation) return session;

  const lineupSnapshot = asArray(session.lineupSnapshot).map((entry) =>
    entry.playerId !== outPlayerId
      ? entry
      : {
          ...entry,
          playerId: evaluation.inPlayerId,
          name: evaluation.inName,
          matchScore: evaluation.matchScoreAfter,
          // Never inherit recognition evidence from the departing player.
          sourcedRecoverySkills: [
            ...asArray(session.benchSnapshot)
              .find((bench) => bench.playerId === evaluation.inPlayerId)
              ?.sourcedRecoverySkills || []
          ],
          sourcedDefensiveReactionSkills: [
            ...asArray(session.benchSnapshot)
              .find((bench) => bench.playerId === evaluation.inPlayerId)
              ?.sourcedDefensiveReactionSkills || []
          ],
          sourcedMetricBonuses: { ...evaluation.sourcedMetricBonusesAfter },
          // Den som kommer inn har spilt fra dette minuttet — ikke fra avspark.
          onFrom: num(minute),
          cameOnAsSub: true
        }
  );

  const substitution = {
    minute: num(minute),
    slotId: evaluation.slotId,
    outPlayerId: evaluation.outPlayerId,
    outName: evaluation.outName,
    inPlayerId: evaluation.inPlayerId,
    inName: evaluation.inName,
    position: evaluation.position,
    roleName: evaluation.roleName,
    fitDelta: evaluation.fitDelta,
    improvement: evaluation.improvement,
    sourcedMetricChanges: { ...evaluation.sourcedMetricChanges },
    tone: evaluation.tone,
    summary: evaluation.summary,
    reasons: evaluation.reasons,
    effects: evaluation.effects
  };

  const tacticalProfile = session.teamFitSnapshot?.tacticalProfile;
  const adjustedProfile = Number(session.sourcedSubstitutionVersion) >= 1 && tacticalProfile
    ? {
        ...tacticalProfile,
        ...Object.fromEntries(SOURCED_METRICS.map((metric) => [
          metric, clamp(num(tacticalProfile[metric]) + num(evaluation.sourcedMetricChanges[metric]), 0, 100)
        ]))
      }
    : tacticalProfile;

  return {
    ...session,
    lineupSnapshot,
    teamFitSnapshot: adjustedProfile
      ? { ...session.teamFitSnapshot, tacticalProfile: adjustedProfile }
      : session.teamFitSnapshot,
    // Den som gikk av beholdes med minuttene sine, slik at statistikken vet at
    // han faktisk spilte.
    playedPlayers: mergePlayed(session, evaluation, minute),
    substitutions: [...asArray(session.substitutions), substitution]
  };
}

// Alle som har vært på banen i kampen, med minuttene sine. Uten dette ville en
// spiller som ble byttet ut i det 60. forsvunnet fra kampen han spilte.
function mergePlayed(session, evaluation, minute) {
  const played = new Map();
  asArray(session.playedPlayers).forEach((entry) => played.set(entry.playerId, { ...entry }));

  // Første bytte: alle som startet er allerede «på banen fra 0».
  if (played.size === 0) {
    asArray(session.lineupSnapshot).forEach((entry) => {
      played.set(entry.playerId, {
        playerId: entry.playerId,
        name: entry.name,
        position: entry.position,
        from: num(entry.onFrom, 0),
        to: null
      });
    });
  }

  const out = played.get(evaluation.outPlayerId);
  if (out) out.to = num(minute);

  played.set(evaluation.inPlayerId, {
    playerId: evaluation.inPlayerId,
    name: evaluation.inName,
    position: evaluation.position,
    from: num(minute),
    to: null
  });

  return [...played.values()];
}

// Hvem spilte kampen, og hvor lenge? Brukes av spillerstatistikken, så en
// innbytter får kampen sin — og minuttene sine.
export function playedPlayersFor(session, fullTime = 90) {
  const played = asArray(session?.playedPlayers);
  const entries = played.length > 0
    ? played
    : asArray(session?.lineupSnapshot).map((entry) => ({
        playerId: entry.playerId,
        name: entry.name,
        position: entry.position,
        from: num(entry.onFrom, 0),
        to: null
      }));

  return entries.map((entry) => ({
    playerId: entry.playerId,
    name: entry.name,
    position: entry.position,
    minutes: Math.max(0, (entry.to === null || entry.to === undefined ? num(fullTime) : num(entry.to)) - num(entry.from))
  }));
}
