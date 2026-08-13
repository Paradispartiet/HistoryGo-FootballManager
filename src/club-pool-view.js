import { asArray, isSimulationReadyPlayer } from "./football-club-squad-model.js";

export function createClubPoolView(player) {
  return {
    id: player.id,
    name: player.name,
    naturalPositions: asArray(player.naturalPositions),
    usablePositions: asArray(player.usablePositions),
    simulationReady: isSimulationReadyPlayer(player)
  };
}
