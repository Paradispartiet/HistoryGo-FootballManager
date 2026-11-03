// Read-only diagrams from the canonical historical formation phase fields.
// Positions show an illustrative distribution of the current XI, not simulated
// runs, tactical orders, or a second source of truth for selection.
import { buildFormationSlots, detectLiberoLead } from "../hg-football-formation-adapter.js";

const PHASE_FIELD = Object.freeze({
  in: "inPossessionShape",
  out: "outOfPossessionShape"
});

function squaredDistance(a, b) {
  const dx = (a.x - b.x) / 75;
  const dy = (a.y - b.y) / 75;
  return dx * dx + 1.4 * dy * dy;
}

function bitCount(n) {
  let count = 0;
  while (n) {
    n &= n - 1;
    count += 1;
  }
  return count;
}

// Deterministic minimum-distance assignment. No player is duplicated or
// dropped when a 4-2-3-1 becomes a 2-4-3-1 or 4-4-1-1.
function assignFieldPlayers(players, targetSlots) {
  const count = players.length;
  const size = 1 << count;
  const cost = new Float64Array(size).fill(Infinity);
  const previousMask = new Int32Array(size).fill(-1);
  const lastTarget = new Int32Array(size).fill(-1);
  cost[0] = 0;

  for (let mask = 0; mask < size; mask += 1) {
    const playerIndex = bitCount(mask);
    if (playerIndex >= count || !Number.isFinite(cost[mask])) continue;
    for (let targetIndex = 0; targetIndex < count; targetIndex += 1) {
      const bit = 1 << targetIndex;
      if (mask & bit) continue;
      const next = mask | bit;
      const newCost = cost[mask] + squaredDistance(players[playerIndex], targetSlots[targetIndex]);
      if (newCost < cost[next]) {
        cost[next] = newCost;
        previousMask[next] = mask;
        lastTarget[next] = targetIndex;
      }
    }
  }

  const assigned = new Array(count);
  let mask = size - 1;
  for (let index = count - 1; index >= 0; index -= 1) {
    const slotIndex = lastTarget[mask];
    if (slotIndex < 0) return null;
    assigned[index] = { ...players[index], slot: targetSlots[slotIndex] };
    mask = previousMask[mask];
  }
  return assigned;
}

export function projectFormationPhase(players, formation, phase = "out") {
  const fieldName = PHASE_FIELD[phase];
  const shape = fieldName && formation?.[fieldName];
  if (typeof shape !== "string" || !Array.isArray(players) || players.length !== 11) return null;

  const slots = buildFormationSlots(shape, {
    liberoLead: detectLiberoLead({ ...formation, baseShape: shape })
  });
  if (slots.length !== 11 || slots[0].position !== "GK") return null;

  const normalized = players.map((player) => ({
    ...player,
    x: Number(player.x),
    y: Number(player.y)
  }));
  if (normalized.some((player) => !Number.isFinite(player.x) || !Number.isFinite(player.y))) return null;

  const keepers = normalized.filter((player) => player.position === "GK");
  if (keepers.length !== 1) return null;
  const others = normalized.filter((player) => player.position !== "GK");
  const assigned = assignFieldPlayers(others, slots.slice(1));
  if (!assigned) return null;

  const keeper = { ...keepers[0], slot: slots[0] };
  const byId = new Map([keeper, ...assigned].map((player) => [player.id, player]));
  if (byId.size !== 11) return null;

  return {
    formationId: formation.id,
    phase,
    shape,
    // Preserve source order to make selection and label updates predictable.
    players: normalized.map((player) => byId.get(player.id)).map((player) => ({
      id: player.id,
      x: player.slot.x,
      y: player.slot.y,
      position: player.slot.position
    }))
  };
}
