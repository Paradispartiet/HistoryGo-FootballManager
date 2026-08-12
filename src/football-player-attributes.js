import * as base from "./football-player-attributes-base.js";
import {
  applyP1SourceClaims,
  applyP1SourceClaimsToPlayer
} from "./football-player-source-claims-p1.js";

export const PLAYER_ATTRIBUTES_VERSION = base.PLAYER_ATTRIBUTES_VERSION;
export const ATTRIBUTE_SCALE = base.ATTRIBUTE_SCALE;
export const normalizeAttributeCatalogue = base.normalizeAttributeCatalogue;
export const resolveAttributeToken = base.resolveAttributeToken;
export const splitRoleRequirements = base.splitRoleRequirements;
export const classCeilingFactor = base.classCeilingFactor;
export const describePositionDemands = base.describePositionDemands;
export const calculateRoleAttributeFit = base.calculateRoleAttributeFit;

export function derivePlayerAttributes(player, options = {}) {
  return base.derivePlayerAttributes(applyP1SourceClaimsToPlayer(player), options);
}

export function buildAttributeScaling(players, options = {}) {
  return base.buildAttributeScaling(applyP1SourceClaims(players), options);
}

export function derivePlayerAttributeIndex(players, options = {}) {
  return base.derivePlayerAttributeIndex(applyP1SourceClaims(players), options);
}
