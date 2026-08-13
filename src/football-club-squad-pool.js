import {
  CLUB_STATUS_RANK,
  SQUAD_GROUPS,
  affiliationStatusRank,
  asArray,
  clubStatusFor,
  isSimulationReadyPlayer,
  num,
  playerAffiliatedWithClub,
  playsIn
} from "./football-club-squad-model.js";

export function listClubPoolPlayers({ clubId = null, players = [] } = {}) {
  if (!clubId) return [];
  return asArray(players)
    .filter((player) => playerAffiliatedWithClub(player, clubId))
    .slice()
    .sort((a, b) =>
      num(b.classHeight) - num(a.classHeight)
      || affiliationStatusRank(b, clubId) - affiliationStatusRank(a, clubId)
      || String(a.id).localeCompare(String(b.id))
    );
}

export function listPlayableClubPoolPlayers({ clubId = null, players = [] } = {}) {
  return listClubPoolPlayers({ clubId, players }).filter(isSimulationReadyPlayer);
}

export function listClubHeritagePlayers({ clubId = null, homePlaceId = null, players = [] } = {}) {
  if (clubId) return listClubPoolPlayers({ clubId, players });
  if (!homePlaceId) return [];
  return asArray(players)
    .filter((player) => Boolean(clubStatusFor(player, homePlaceId)))
    .slice()
    .sort((a, b) =>
      num(b.classHeight) - num(a.classHeight)
      || (CLUB_STATUS_RANK[clubStatusFor(b, homePlaceId)] ?? 0) - (CLUB_STATUS_RANK[clubStatusFor(a, homePlaceId)] ?? 0)
      || String(a.id).localeCompare(String(b.id))
    );
}

export function hasVisitedClubGround({ homePlaceId = null, unlockedPlaceIds = [] } = {}) {
  if (!homePlaceId) return false;
  const ids = unlockedPlaceIds instanceof Set ? unlockedPlaceIds : new Set(asArray(unlockedPlaceIds));
  return ids.has(homePlaceId);
}

export function buildClubBaseSquad({
  players = [], candidateIds = null, excludePlayerIds = [], size = 15, clubId = null
} = {}) {
  const excluded = excludePlayerIds instanceof Set ? excludePlayerIds : new Set(asArray(excludePlayerIds));
  const allowed = candidateIds instanceof Set ? candidateIds : candidateIds ? new Set(candidateIds) : null;
  const ordered = asArray(players)
    .filter((player) => player && isSimulationReadyPlayer(player) && !excluded.has(player.id) && (!allowed || allowed.has(player.id)))
    .slice()
    .sort((a, b) => {
      if (clubId) {
        const statusDelta = affiliationStatusRank(a, clubId) - affiliationStatusRank(b, clubId);
        if (statusDelta) return statusDelta;
      }
      return num(a.classHeight) - num(b.classHeight) || String(a.id).localeCompare(String(b.id));
    });

  const picked = [];
  const taken = new Set();
  for (const group of SQUAD_GROUPS) {
    let need = group.count;
    for (const player of ordered) {
      if (need <= 0 || picked.length >= size) break;
      if (taken.has(player.id) || !playsIn(player, group.positions)) continue;
      picked.push(player.id);
      taken.add(player.id);
      need -= 1;
    }
  }
  for (const player of ordered) {
    if (picked.length >= size) break;
    if (taken.has(player.id)) continue;
    picked.push(player.id);
    taken.add(player.id);
  }
  return picked;
}
