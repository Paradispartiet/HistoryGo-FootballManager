import * as base from "./football-player-attributes-base.js";
import {
  applyP1SourceClaims,
  applyP1SourceClaimsToPlayer
} from "./football-player-source-claims-p1.js";
import {
  applyP2SourceClaims,
  applyP2SourceClaimsToPlayer
} from "./football-player-source-claims-p2.js";

// P1 FØRST, SÅ P2. De to registrene overlapper ikke — P2 dekker bare spillere
// utenfor de 18 frosne P1-arvene — men rekkefølgen er likevel eksplisitt, og
// P2 lar en profil som alt har styrker stå. Da kan ikke rekkefølgen snu et
// resultat, uansett hvordan registrene vokser.
const applySourceClaims = (players) => applyP2SourceClaims(applyP1SourceClaims(players));
const applySourceClaimsToPlayer = (player) => applyP2SourceClaimsToPlayer(applyP1SourceClaimsToPlayer(player));

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
