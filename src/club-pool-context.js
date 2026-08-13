import {
  CLUB_PLAYER_POOL_VERSION,
  CLUB_SQUAD_VERSION,
  isSimulationReadyPlayer
} from "./football-club-squad-model.js";
import {
  listClubPoolPlayers,
  listPlayableClubPoolPlayers
} from "./football-club-squad-pool.js";

export function createClubPoolContext({ club, players, visitedPlaceIds, squadSize }) {
  const clubId = club.id;
  const homePlaceId = club.homePlaceId || null;
  const documented = listClubPoolPlayers({ clubId, players });
  const playable = listPlayableClubPoolPlayers({ clubId, players });
  const playableIds = new Set(playable.map((player) => player.id));
  const unprofiled = documented.filter((player) => !isSimulationReadyPlayer(player));
  const visited = homePlaceId ? new Set(visitedPlaceIds || []).has(homePlaceId) : false;
  const groundName = club.ground || "klubbens bane";
  return {
    documented,
    playable,
    playableIds,
    unprofiled,
    common: {
      version: CLUB_SQUAD_VERSION,
      poolVersion: CLUB_PLAYER_POOL_VERSION,
      clubId,
      homePlaceId,
      groundName,
      visited,
      poolReady: playable.length >= squadSize,
      poolSize: documented.length,
      playablePoolSize: playable.length,
      documentedCount: documented.length,
      unprofiledCount: unprofiled.length,
      clubPoolIds: [...playableIds],
      playablePlayerIds: [...playableIds],
      documentedPlayerIds: documented.map((player) => player.id),
      unprofiledPlayerIds: unprofiled.map((player) => player.id)
    }
  };
}
