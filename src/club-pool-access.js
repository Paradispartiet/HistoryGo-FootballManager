import { buildClubBaseSquad } from "./football-club-squad-pool.js";
import { createClubPoolContext } from "./club-pool-context.js";
import { createClubPoolView } from "./club-pool-view.js";

const asIdSet = (value) => value instanceof Set ? value : value ? new Set(value) : null;

export function resolveClubSquadAccess({
  club = null,
  players = [],
  unlockedPlaceIds = [],
  candidateIds = null,
  squadSize = 15
} = {}) {
  if (!club?.id) return null;

  const { documented, playable, playableIds, unprofiled, common } = createClubPoolContext({
    club,
    players,
    visitedPlaceIds: unlockedPlaceIds,
    squadSize
  });
  const archiveNote = unprofiled.length
    ? ` ${unprofiled.length} kildeprofiler uten dokumentert posisjon beholdes som historikkposter og kan ikke velges i laget.`
    : "";

  if (!common.poolReady) {
    return {
      ...common,
      mode: "unavailable",
      heritage: [],
      heritageCount: documented.length,
      lockedCount: documented.length,
      playableLockedCount: playable.length,
      baseSquad: [],
      headline: `${club.name} har ikke en ferdig spillbar spillerpool ennå.`,
      detail: `Klubben har ${documented.length} dokumenterte spillerprofiler, men bare ${playable.length} med dokumentert posisjon. Det trengs minst ${squadSize} spillbare profiler før klubben kan overtas.${archiveNote}`,
      todo: ["Dokumenter minst én posisjon før en historikkprofil gjøres valgbar i simuleringen."]
    };
  }

  if (common.visited) {
    return {
      ...common,
      mode: "heritage",
      heritage: documented.map(createClubPoolView),
      heritageCount: documented.length,
      lockedCount: 0,
      playableLockedCount: 0,
      baseSquad: [],
      headline: `Du har vært på ${common.groundName}. ${playable.length} spillbare ${club.name}-profiler er tilgjengelige.`,
      detail: `Klubbhistorikken omfatter ${documented.length} dokumenterte navn. Bare profiler med dokumentert posisjon kan velges.${archiveNote}`,
      todo: ["Velg blant klubbens spillbare historiske profiler når du setter troppen."]
    };
  }

  const allowed = asIdSet(candidateIds);
  const eligibleIds = allowed
    ? new Set([...playableIds].filter((id) => allowed.has(id)))
    : playableIds;
  const basePoolIds = eligibleIds.size >= squadSize ? eligibleIds : playableIds;
  const baseSquad = buildClubBaseSquad({ players, candidateIds: basePoolIds, size: squadSize, clubId: club.id });
  const playableLockedCount = Math.max(0, playable.length - baseSquad.length);

  return {
    ...common,
    mode: "base",
    heritage: [],
    heritageCount: documented.length,
    lockedCount: Math.max(0, documented.length - baseSquad.length),
    playableLockedCount,
    baseSquad,
    headline: common.homePlaceId
      ? `Du har ikke vært på ${common.groundName}.`
      : `${club.name} har en spillbar spillerpool, men ingen History Go-bane koblet til ennå.`,
    detail: common.homePlaceId
      ? `Du får en automatisk ${club.name}-grunntropp med ${baseSquad.length} spillere. De resterende ${playableLockedCount} spillbare profilene åpnes når du besøker ${common.groundName}.${archiveNote}`
      : `Du får en ${club.name}-grunntropp med ${baseSquad.length} spillere fra klubbens spillbare pool.${archiveNote}`,
    todo: common.homePlaceId
      ? [`Besøk ${common.groundName} for å åpne resten av de spillbare historiske profilene.`]
      : ["Koble klubben til riktig History Go-bane for å gjøre resten av den spillbare poolen samlebar."]
  };
}
