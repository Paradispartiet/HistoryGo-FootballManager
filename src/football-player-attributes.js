import * as base from "./football-player-attributes-base.js";
import {
  applyP1SourceClaims,
  applyP1SourceClaimsToPlayer
} from "./football-player-source-claims-p1.js";
import {
  applyP2SourceClaims,
  applyP2SourceClaimsToPlayer
} from "./football-player-source-claims-p2.js";
import {
  applySourceDepthClaims,
  applySourceDepthClaimsToPlayer
} from "./football-player-source-claims-depth.js";

// Precedence er provenance, ikke kvalitetsscore: P1 først, så P2, så senere
// source-depth. Hvert nyere lag fyller bare tomme styrkelister og kan derfor
// aldri overstyre et eldre, allerede kildebelagt claim.
const applySourceClaims = (players) =>
  applySourceDepthClaims(applyP2SourceClaims(applyP1SourceClaims(players)));
const applySourceClaimsToPlayer = (player) =>
  applySourceDepthClaimsToPlayer(applyP2SourceClaimsToPlayer(applyP1SourceClaimsToPlayer(player)));

export const PLAYER_ATTRIBUTES_VERSION = base.PLAYER_ATTRIBUTES_VERSION;
export const ATTRIBUTE_SCALE = base.ATTRIBUTE_SCALE;
export const normalizeAttributeCatalogue = base.normalizeAttributeCatalogue;
export const resolveAttributeToken = base.resolveAttributeToken;
export const splitRoleRequirements = base.splitRoleRequirements;
export const classCeilingFactor = base.classCeilingFactor;
export const describePositionDemands = base.describePositionDemands;
export const calculateRoleAttributeFit = base.calculateRoleAttributeFit;

function synchronizeSourceClaims(players) {
  if (!Array.isArray(players)) return [];
  const effective = applySourceClaims(players);
  for (let index = 0; index < players.length; index += 1) {
    const sourceStrengths = effective[index]?.strengths;
    if (!Array.isArray(sourceStrengths)) continue;
    const currentStrengths = Array.isArray(players[index]?.strengths) ? players[index].strengths : [];
    if (JSON.stringify(currentStrengths) === JSON.stringify(sourceStrengths)) continue;
    players[index].strengths = [...sourceStrengths];
  }
  return players;
}

export function derivePlayerAttributes(player, options = {}) {
  return base.derivePlayerAttributes(applySourceClaimsToPlayer(player), options);
}

export function buildAttributeScaling(players, options = {}) {
  return base.buildAttributeScaling(applySourceClaims(players), options);
}

export function derivePlayerAttributeIndex(players, options = {}) {
  return base.derivePlayerAttributeIndex(synchronizeSourceClaims(players), options);
}
