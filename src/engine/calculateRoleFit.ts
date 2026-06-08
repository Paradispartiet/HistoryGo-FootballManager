// src/engine/calculateRoleFit.ts

import type {
  FitReason,
  Player,
  PlayerAttribute,
  PlayerRoleFitResult,
  PlayerTrait,
  Role,
  RoleAssignment,
  Score100,
  Tactic,
} from "../domain/footballTypes.js";

/**
 * Første motorbit i HG Football Manager Core.
 *
 * Denne funksjonen svarer på:
 * - Hvor godt passer spilleren i rollen?
 * - Hvorfor passer han?
 * - Hvorfor passer han ikke?
 * - Hvilke taktiske valg hjelper eller skader ham?
 *
 * Viktig prinsipp:
 * Overall avgjør ikke direkte.
 * Rollefit avgjøres av attributter, traits, posisjon og taktisk kontekst.
 */

const NEUTRAL_FIT: Score100 = 70;

function clampScore(value: number): Score100 {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[], fallback = NEUTRAL_FIT): Score100 {
  if (values.length === 0) return fallback;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function hasTrait(player: Player, trait: PlayerTrait): boolean {
  return player.traits.includes(trait);
}

function addReason(
  reasons: FitReason[],
  code: string,
  category: FitReason["category"],
  label: string,
  impact: number,
): void {
  reasons.push({
    code,
    category,
    label,
    impact,
  });
}

function calculateAttributeFit(
  player: Player,
  role: Role,
  reasons: FitReason[],
): Score100 {
  const entries = Object.entries(role.requiredAttributes) as [PlayerAttribute, number][];

  if (entries.length === 0) {
    addReason(
      reasons,
      "no_required_attributes",
      "attribute",
      "Rollen har ingen tydelige attributtkrav ennå.",
      0,
    );

    return NEUTRAL_FIT;
  }

  const attributeScores = entries.map(([attribute, requiredValue]) => {
    const playerValue = player.attributes[attribute];

    /**
     * Hvis spillerens attributt matcher kravet nøyaktig:
     * score rundt 72.
     *
     * Over kravet:
     * tydelig bonus.
     *
     * Under kravet:
     * tydelig minus.
     */
    const diff = playerValue - requiredValue;
    const score = clampScore(72 + diff * 0.9);

    if (diff >= 10) {
      addReason(
        reasons,
        `strong_attribute_${attribute}`,
        "attribute",
        `${player.name} har svært god ${attribute} for rollen ${role.name}.`,
        6,
      );
    } else if (diff >= 5) {
      addReason(
        reasons,
        `good_attribute_${attribute}`,
        "attribute",
        `${player.name} har god nok ${attribute} for rollen ${role.name}.`,
        3,
      );
    } else if (diff <= -15) {
      addReason(
        reasons,
        `weak_attribute_${attribute}`,
        "attribute",
        `${player.name} mangler tydelig ${attribute} for rollen ${role.name}.`,
        -8,
      );
    } else if (diff <= -8) {
      addReason(
        reasons,
        `limited_attribute_${attribute}`,
        "attribute",
        `${player.name} er litt svak på ${attribute} for rollen ${role.name}.`,
        -4,
      );
    }

    return score;
  });

  return average(attributeScores);
}

function calculateTraitFit(
  player: Player,
  role: Role,
  reasons: FitReason[],
): Score100 {
  let score = NEUTRAL_FIT;

  for (const trait of role.preferredTraits) {
    if (!hasTrait(player, trait)) continue;

    score += 8;

    addReason(
      reasons,
      `preferred_trait_${trait}`,
      "trait",
      `${player.name} har traiten ${trait}, som passer rollen ${role.name}.`,
      8,
    );
  }

  for (const trait of role.badTraits) {
    if (!hasTrait(player, trait)) continue;

    score -= 10;

    addReason(
      reasons,
      `bad_trait_${trait}`,
      "trait",
      `${player.name} har traiten ${trait}, som passer dårlig med rollen ${role.name}.`,
      -10,
    );
  }

  if (player.preferredRoles.includes(role.id)) {
    score += 12;

    addReason(
      reasons,
      "preferred_role",
      "role",
      `${player.name} har ${role.name} som foretrukket rolle.`,
      12,
    );
  }

  if (player.weakRoles.includes(role.id)) {
    score -= 16;

    addReason(
      reasons,
      "weak_role",
      "role",
      `${player.name} fungerer normalt svakt i rollen ${role.name}.`,
      -16,
    );
  }

  return clampScore(score);
}

function calculatePositionFit(
  player: Player,
  role: Role,
  assignment: RoleAssignment,
  reasons: FitReason[],
): Score100 {
  const roleAllowsPosition = role.allowedPositions.includes(assignment.position);
  const playerKnowsPosition = player.naturalPositions.includes(assignment.position);

  if (roleAllowsPosition && playerKnowsPosition) {
    addReason(
      reasons,
      "natural_allowed_position",
      "position",
      `${player.name} spiller i en naturlig posisjon for rollen ${role.name}.`,
      8,
    );

    return 100;
  }

  if (roleAllowsPosition && !playerKnowsPosition) {
    addReason(
      reasons,
      "allowed_but_not_natural_position",
      "position",
      `${assignment.position} passer rollen ${role.name}, men er ikke en naturlig posisjon for ${player.name}.`,
      -6,
    );

    return 82;
  }

  if (!roleAllowsPosition && playerKnowsPosition) {
    addReason(
      reasons,
      "natural_position_wrong_role_zone",
      "position",
      `${player.name} kjenner posisjonen, men rollen ${role.name} er ikke laget for ${assignment.position}.`,
      -14,
    );

    return 58;
  }

  addReason(
    reasons,
    "bad_position_fit",
    "position",
    `${player.name} er brukt utenfor både naturlig posisjon og rolleområde.`,
    -22,
  );

  return 45;
}

function calculateTacticFit(
  player: Player,
  role: Role,
  tactic: Tactic,
  reasons: FitReason[],
): Score100 {
  let score = NEUTRAL_FIT;

  const needs = player.tacticalNeeds;

  if (!needs) {
    addReason(
      reasons,
      "no_tactical_needs",
      "tactic",
      `${player.name} har ingen spesifikke taktiske behov registrert ennå.`,
      0,
    );

    return score;
  }

  if (needs.needsWidth) {
    if (role.behaviour.holdsWidth || tactic.principles.width === "wide") {
      score += 7;

      addReason(
        reasons,
        "width_need_supported",
        "tactic",
        `${player.name} får bredde eller 1v1-rom gjennom rolle/taktikk.`,
        7,
      );
    } else if (tactic.principles.width === "narrow") {
      score -= 9;

      addReason(
        reasons,
        "width_need_blocked",
        "tactic",
        `${player.name} trenger bredde, men taktikken er smal.`,
        -9,
      );
    }
  }

  if (needs.needsFreedom) {
    if (
      tactic.principles.creativeFreedom === "high" ||
      role.behaviour.takesRisks ||
      role.behaviour.receivesBetweenLines
    ) {
      score += 7;

      addReason(
        reasons,
        "freedom_need_supported",
        "tactic",
        `${player.name} får kreativ frihet i rollen/taktikken.`,
        7,
      );
    } else if (tactic.principles.creativeFreedom === "low") {
      score -= 10;

      addReason(
        reasons,
        "freedom_need_blocked",
        "tactic",
        `${player.name} trenger frihet, men taktikken begrenser ham.`,
        -10,
      );
    }
  }

  if (needs.needsHighPressTeam) {
    if (tactic.principles.pressing === "high" || tactic.principles.pressing === "ultra") {
      score += 6;

      addReason(
        reasons,
        "high_press_need_supported",
        "tactic",
        `${player.name} passer godt i et lag som presser høyt.`,
        6,
      );
    } else if (tactic.principles.pressing === "low") {
      score -= 9;

      addReason(
        reasons,
        "high_press_need_blocked",
        "tactic",
        `${player.name} mister verdi fordi laget presser lavt.`,
        -9,
      );
    }
  }

  if (needs.needsBallDominance) {
    if (tactic.principles.possession === "patient" || tactic.principles.possession === "balanced") {
      score += 6;

      addReason(
        reasons,
        "ball_dominance_supported",
        "tactic",
        `${player.name} får nok ballkontakt i denne possession-strukturen.`,
        6,
      );
    } else if (tactic.principles.possession === "direct") {
      score -= 8;

      addReason(
        reasons,
        "ball_dominance_blocked",
        "tactic",
        `${player.name} trenger ballkontroll, men laget spiller direkte.`,
        -8,
      );
    }
  }

  if (needs.needsDirectService) {
    if (tactic.principles.possession === "direct" || tactic.principles.tempo === "fast") {
      score += 6;

      addReason(
        reasons,
        "direct_service_supported",
        "tactic",
        `${player.name} får direkte service og hurtigere angrep.`,
        6,
      );
    } else if (tactic.principles.possession === "patient" && tactic.principles.tempo === "slow") {
      score -= 8;

      addReason(
        reasons,
        "direct_service_blocked",
        "tactic",
        `${player.name} trenger tidligere service, men laget spiller sakte og tålmodig.`,
        -8,
      );
    }
  }

  if (needs.needsLowBlockBehind) {
    if (tactic.principles.defensiveLine === "low" || tactic.principles.defensiveLine === "medium") {
      score += 5;

      addReason(
        reasons,
        "low_block_supported",
        "tactic",
        `${player.name} får bedre sikring bak seg.`,
        5,
      );
    } else if (tactic.principles.defensiveLine === "high") {
      score -= 8;

      addReason(
        reasons,
        "low_block_blocked",
        "tactic",
        `${player.name} trenger mer sikring, men laget står høyt.`,
        -8,
      );
    }
  }

  if (needs.needsCombinationPlayers) {
    if (
      tactic.principles.possession === "patient" ||
      role.behaviour.dropsDeep ||
      role.behaviour.receivesBetweenLines
    ) {
      score += 5;

      addReason(
        reasons,
        "combination_need_supported",
        "tactic",
        `${player.name} får kombinasjonsspill rundt seg.`,
        5,
      );
    } else if (tactic.principles.possession === "direct") {
      score -= 6;

      addReason(
        reasons,
        "combination_need_blocked",
        "tactic",
        `${player.name} trenger kombinasjoner, men laget spiller for direkte.`,
        -6,
      );
    }
  }

  if (needs.needsDefensiveCover) {
    if (role.behaviour.coversBehind || role.behaviour.protectsDefence) {
      score += 5;

      addReason(
        reasons,
        "defensive_cover_supported",
        "tactic",
        `${player.name} får defensiv dekning gjennom rolleatferden.`,
        5,
      );
    } else if (role.riskProfile === "aggressive") {
      score -= 7;

      addReason(
        reasons,
        "defensive_cover_blocked",
        "tactic",
        `${player.name} trenger dekning, men rollen er aggressiv og risikofylt.`,
        -7,
      );
    }
  }

  return clampScore(score);
}

/**
 * Chemistry er foreløpig nøytral fordi vi ikke har laget TeamBalanceEngine ennå.
 * Senere skal denne beregnes fra relasjoner, naboposisjoner, rollepar og lagstruktur.
 */
function calculateInitialChemistryFit(reasons: FitReason[]): Score100 {
  addReason(
    reasons,
    "chemistry_pending",
    "chemistry",
    "Kjemi beregnes nøytralt inntil lagbalansemotoren er laget.",
    0,
  );

  return NEUTRAL_FIT;
}

export function calculateRoleFit(
  player: Player,
  role: Role,
  assignment: RoleAssignment,
  tactic: Tactic,
): PlayerRoleFitResult {
  const reasons: FitReason[] = [];

  const attributeFit = calculateAttributeFit(player, role, reasons);
  const traitFit = calculateTraitFit(player, role, reasons);
  const positionFit = calculatePositionFit(player, role, assignment, reasons);
  const tacticFit = calculateTacticFit(player, role, tactic, reasons);
  const chemistryFit = calculateInitialChemistryFit(reasons);

  /**
   * Vekting v0.1:
   *
   * Attributter: 35 %
   * Traits/rolleidentitet: 25 %
   * Posisjon: 20 %
   * Taktisk kontekst: 15 %
   * Kjemi: 5 %
   *
   * Dette gjør at spilleren ikke bare vurderes etter rå attributter.
   * Rolle og kontekst er nesten like viktige.
   */
  const finalFit = clampScore(
    attributeFit * 0.35 +
      traitFit * 0.25 +
      positionFit * 0.2 +
      tacticFit * 0.15 +
      chemistryFit * 0.05,
  );

  return {
    playerId: player.id,
    roleId: role.id,
    position: assignment.position,

    attributeFit,
    traitFit,
    positionFit,
    tacticFit,
    chemistryFit,

    finalFit,

    reasons,
  };
}
