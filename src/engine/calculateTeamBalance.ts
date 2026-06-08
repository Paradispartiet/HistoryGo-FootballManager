// src/engine/calculateTeamBalance.ts

import type {
  FitReason,
  Player,
  PlayerAttribute,
  PlayerRoleFitResult,
  Role,
  RoleAssignment,
  Score100,
  Tactic,
  Team,
  TeamBalanceResult,
} from "../domain/footballTypes";

/**
 * HG Football Manager Core v0.1
 *
 * TeamBalanceEngine vurderer ikke enkeltspillere isolert.
 * Den vurderer om trenerens lag faktisk henger sammen.
 *
 * Den svarer på:
 * - Har laget nok bredde?
 * - Har laget nok sikring?
 * - Har laget nok press?
 * - Har laget nok midtbanekontroll?
 * - Har laget nok angrepstrusler?
 * - Er risikoen balansert?
 *
 * Dette er motoren som hindrer at brukeren bare kan stable 11 geniale spillere
 * uten tanke for roller, struktur og balanse.
 */

const NEUTRAL_SCORE: Score100 = 70;

type SelectedSlot = {
  assignment: RoleAssignment;
  player?: Player;
  role?: Role;
};

function clampScore(value: number): Score100 {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[], fallback = NEUTRAL_SCORE): Score100 {
  if (values.length === 0) return fallback;
  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
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

function countWhere<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

function hasAttribute(player: Player | undefined, attribute: PlayerAttribute, minValue: number): boolean {
  if (!player) return false;
  return player.attributes[attribute] >= minValue;
}

function buildSelectedSlots(team: Team, tactic: Tactic, roles: Role[]): SelectedSlot[] {
  return tactic.roleAssignments.map((assignment) => {
    const player = team.squad.find((candidate) => candidate.id === assignment.playerId);
    const role = roles.find((candidate) => candidate.id === assignment.roleId);

    return {
      assignment,
      player,
      role,
    };
  });
}

function calculateAttackingBalance(slots: SelectedSlot[], tactic: Tactic, reasons: FitReason[]): Score100 {
  let score = NEUTRAL_SCORE;

  const creators = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("creator")),
  );

  const runners = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("runner")),
  );

  const finishers = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("finisher")),
  );

  const wideProgressors = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("wide_progressor")),
  );

  const buildUpPlayers = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("build_up_player")),
  );

  const riskTakers = countWhere(slots, ({ role }) =>
    role?.riskProfile === "aggressive" || Boolean(role?.behaviour.takesRisks),
  );

  if (creators >= 2) {
    score += 8;
    addReason(
      reasons,
      "attack_has_creators",
      "balance",
      "Laget har flere skapende roller og bør kunne produsere sjanser.",
      8,
    );
  } else if (creators === 0) {
    score -= 14;
    addReason(
      reasons,
      "attack_lacks_creator",
      "balance",
      "Laget mangler en tydelig skaperrolle.",
      -14,
    );
  }

  if (runners >= 2) {
    score += 7;
    addReason(
      reasons,
      "attack_has_runners",
      "balance",
      "Laget har nok løpstrusler til å true bakrom og åpne rom.",
      7,
    );
  } else if (runners === 0) {
    score -= 12;
    addReason(
      reasons,
      "attack_lacks_runners",
      "balance",
      "Laget mangler spillere som angriper rom.",
      -12,
    );
  }

  if (finishers >= 1) {
    score += 6;
    addReason(
      reasons,
      "attack_has_finisher",
      "balance",
      "Laget har minst én tydelig avslutterrolle.",
      6,
    );
  } else {
    score -= 10;
    addReason(
      reasons,
      "attack_lacks_finisher",
      "balance",
      "Laget mangler en tydelig avslutter.",
      -10,
    );
  }

  if (tactic.principles.width === "wide" && wideProgressors < 2) {
    score -= 8;
    addReason(
      reasons,
      "wide_attack_lacks_wide_progressors",
      "balance",
      "Taktikken ber om bredde, men laget har for få brede progresjonsroller.",
      -8,
    );
  }

  if (tactic.principles.possession === "patient" && buildUpPlayers < 2) {
    score -= 9;
    addReason(
      reasons,
      "patient_attack_lacks_build_up",
      "balance",
      "Laget vil spille tålmodig, men mangler nok oppbyggingsspillere.",
      -9,
    );
  }

  if (tactic.principles.possession === "direct" && runners >= 2 && finishers >= 1) {
    score += 7;
    addReason(
      reasons,
      "direct_attack_supported",
      "balance",
      "Direkte angrep støttes av løpstrusler og avslutterrolle.",
      7,
    );
  }

  if (riskTakers >= 5 && tactic.principles.mentality === "attacking") {
    score += 4;
    addReason(
      reasons,
      "attacking_mentality_has_risk",
      "balance",
      "Angripende mentalitet støttes av flere risikovillige roller.",
      4,
    );
  }

  return clampScore(score);
}

function calculateDefensiveBalance(slots: SelectedSlot[], tactic: Tactic, reasons: FitReason[]): Score100 {
  let score = NEUTRAL_SCORE;

  const defenders = countWhere(slots, ({ role }) => role?.positionGroup === "DEF");
  const defensiveMidfielders = countWhere(slots, ({ assignment }) => assignment.position === "DM");

  const coverPlayers = countWhere(slots, ({ role }) =>
    Boolean(role?.behaviour.coversBehind),
  );

  const protectionPlayers = countWhere(slots, ({ role }) =>
    Boolean(role?.behaviour.protectsDefence) ||
    Boolean(role?.tacticalFunctions.includes("balance_player")) ||
    Boolean(role?.tacticalFunctions.includes("cover_player")),
  );

  const aggressiveDefenders = countWhere(slots, ({ role }) =>
    role?.positionGroup === "DEF" &&
    (role.riskProfile === "aggressive" || Boolean(role.behaviour.takesRisks)),
  );

  const highLine = tactic.principles.defensiveLine === "high";
  const attackingMentality = tactic.principles.mentality === "attacking";

  if (defenders >= 4) {
    score += 5;
    addReason(
      reasons,
      "defence_has_back_four",
      "balance",
      "Laget har minst fire forsvarsroller i strukturen.",
      5,
    );
  } else if (defenders < 3) {
    score -= 18;
    addReason(
      reasons,
      "defence_too_few_defenders",
      "balance",
      "Laget har for få forsvarsspillere i strukturen.",
      -18,
    );
  }

  if (defensiveMidfielders >= 1 || protectionPlayers >= 2) {
    score += 8;
    addReason(
      reasons,
      "defence_has_protection",
      "balance",
      "Laget har beskyttelse foran eller rundt forsvarslinjen.",
      8,
    );
  } else {
    score -= 12;
    addReason(
      reasons,
      "defence_lacks_protection",
      "balance",
      "Forsvaret mangler tydelig beskyttelse.",
      -12,
    );
  }

  if (coverPlayers >= 1) {
    score += 6;
    addReason(
      reasons,
      "defence_has_cover",
      "balance",
      "Laget har minst én rolle som dekker bakrom.",
      6,
    );
  } else if (highLine) {
    score -= 13;
    addReason(
      reasons,
      "high_line_lacks_cover",
      "balance",
      "Laget står høyt uten tydelig sikrende rolle bak.",
      -13,
    );
  }

  if (aggressiveDefenders >= 2 && highLine) {
    score -= 10;
    addReason(
      reasons,
      "aggressive_defenders_high_line_risk",
      "balance",
      "Flere aggressive forsvarere kombinert med høy linje gir stor bakromsrisiko.",
      -10,
    );
  }

  if (attackingMentality && protectionPlayers === 0) {
    score -= 8;
    addReason(
      reasons,
      "attacking_without_protection",
      "balance",
      "Angripende mentalitet uten balanse-/sikringsrolle gjør laget sårbart.",
      -8,
    );
  }

  return clampScore(score);
}

function calculateMidfieldControl(slots: SelectedSlot[], tactic: Tactic, reasons: FitReason[]): Score100 {
  let score = NEUTRAL_SCORE;

  const midfielders = slots.filter(({ role }) => role?.positionGroup === "MID");

  const tempoControllers = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("tempo_controller")) ||
    Boolean(role?.behaviour.dictatesTempo),
  );

  const ballWinners = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("duel_winner")),
  );

  const buildUpPlayers = countWhere(slots, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("build_up_player")),
  );

  const midfieldCreators = countWhere(midfielders, ({ role }) =>
    Boolean(role?.tacticalFunctions.includes("creator")),
  );

  const highPassingPlayers = countWhere(midfielders, ({ player }) =>
    hasAttribute(player, "passing", 85) &&
    hasAttribute(player, "vision", 82) &&
    hasAttribute(player, "composure", 80),
  );

  if (midfielders.length >= 3) {
    score += 7;
    addReason(
      reasons,
      "midfield_has_numbers",
      "balance",
      "Laget har nok midtbanespillere til å kontrollere sentrale rom.",
      7,
    );
  } else if (midfielders.length <= 1) {
    score -= 16;
    addReason(
      reasons,
      "midfield_outnumbered",
      "balance",
      "Laget har for få midtbanespillere og kan miste sentral kontroll.",
      -16,
    );
  }

  if (tempoControllers >= 1) {
    score += 8;
    addReason(
      reasons,
      "midfield_has_tempo_controller",
      "balance",
      "Laget har en rolle som kan kontrollere tempoet.",
      8,
    );
  } else if (tactic.principles.possession === "patient") {
    score -= 12;
    addReason(
      reasons,
      "patient_possession_lacks_tempo_controller",
      "balance",
      "Tålmodig possession uten tempo-kontrollør gir svakere kampkontroll.",
      -12,
    );
  }

  if (ballWinners >= 1) {
    score += 5;
    addReason(
      reasons,
      "midfield_has_ball_winner",
      "balance",
      "Laget har en rolle som kan vinne dueller og bryte spill.",
      5,
    );
  } else if (tactic.principles.pressing === "high" || tactic.principles.pressing === "ultra") {
    score -= 7;
    addReason(
      reasons,
      "high_press_lacks_ball_winner",
      "balance",
      "Høyt press mangler en tydelig ballvinner sentralt.",
      -7,
    );
  }

  if (buildUpPlayers >= 2 && highPassingPlayers >= 2) {
    score += 8;
    addReason(
      reasons,
      "midfield_build_up_supported",
      "balance",
      "Oppbyggingsspillet støttes av både roller og pasningskvalitet.",
      8,
    );
  }

  if (midfieldCreators >= 2 && tactic.principles.tempo === "fast") {
    score += 4;
    addReason(
      reasons,
      "fast_tempo_with_midfield_creators",
      "balance",
      "Hurtig tempo støttes av kreative midtbaneroller.",
      4,
    );
  }

  return clampScore(score);
}

function calculatePressingCoherence(slots: SelectedSlot[], tactic: Tactic, reasons: FitReason[]): Score100 {
  let score = NEUTRAL_SCORE;

  const pressingRoles = countWhere(slots, ({ role }) =>
    Boolean(role?.behaviour.pressesHigh) ||
    Boolean(role?.tacticalFunctions.includes("press_trigger")),
  );

  const highPressPlayers = countWhere(slots, ({ player }) =>
    hasAttribute(player, "pressing", 82) &&
    hasAttribute(player, "stamina", 80) &&
    hasAttribute(player, "tempo", 78),
  );

  const lowPressPlayers = countWhere(slots, ({ player }) =>
    player !== undefined &&
    (player.attributes.pressing < 70 || player.attributes.stamina < 70),
  );

  if (tactic.principles.pressing === "low") {
    if (pressingRoles >= 4) {
      score -= 8;
      addReason(
        reasons,
        "low_press_with_many_pressing_roles",
        "balance",
        "Taktikken ligger lavt, men flere roller er laget for høyt press.",
        -8,
      );
    } else {
      score += 5;
      addReason(
        reasons,
        "low_press_coherent",
        "balance",
        "Lavt press passer rollefordelingen.",
        5,
      );
    }

    return clampScore(score);
  }

  if (tactic.principles.pressing === "medium") {
    if (pressingRoles >= 3) {
      score += 6;
      addReason(
        reasons,
        "medium_press_supported",
        "balance",
        "Middels press støttes av flere pressroller.",
        6,
      );
    }

    if (lowPressPlayers >= 4) {
      score -= 7;
      addReason(
        reasons,
        "medium_press_many_weak_pressers",
        "balance",
        "Flere spillere har svak presskapasitet for middels press.",
        -7,
      );
    }

    return clampScore(score);
  }

  if (tactic.principles.pressing === "high" || tactic.principles.pressing === "ultra") {
    if (pressingRoles >= 5) {
      score += 10;
      addReason(
        reasons,
        "high_press_roles_supported",
        "balance",
        "Høyt press støttes av mange pressroller.",
        10,
      );
    } else {
      score -= 12;
      addReason(
        reasons,
        "high_press_lacks_pressing_roles",
        "balance",
        "Høyt press mangler nok roller som faktisk presser.",
        -12,
      );
    }

    if (highPressPlayers >= 6) {
      score += 8;
      addReason(
        reasons,
        "high_press_players_supported",
        "balance",
        "Spillergruppen har nok pressing, stamina og tempo til høyt press.",
        8,
      );
    } else {
      score -= 9;
      addReason(
        reasons,
        "high_press_players_not_suited",
        "balance",
        "Spillergruppen har ikke nok fysisk/pressmessig grunnlag for høyt press.",
        -9,
      );
    }

    if (lowPressPlayers >= 3) {
      score -= 8;
      addReason(
        reasons,
        "high_press_contains_passengers",
        "balance",
        "Høyt press svekkes av flere spillere med lav presskapasitet.",
        -8,
      );
    }
  }

  return clampScore(score);
}

function calculateWidthBalance(slots: SelectedSlot[], tactic: Tactic, reasons: FitReason[]): Score100 {
  let score = NEUTRAL_SCORE;

  const widthRoles = countWhere(slots, ({ role }) =>
    Boolean(role?.behaviour.holdsWidth) ||
    Boolean(role?.behaviour.crossesOften) ||
    Boolean(role?.tacticalFunctions.includes("wide_progressor")),
  );

  const insideRoles = countWhere(slots, ({ role }) =>
    Boolean(role?.behaviour.cutsInside) ||
    Boolean(role?.behaviour.receivesBetweenLines),
  );

  const widePositions = countWhere(slots, ({ assignment }) =>
    ["RB", "LB", "RWB", "LWB", "RW", "LW"].includes(assignment.position),
  );

  if (tactic.principles.width === "wide") {
    if (widthRoles >= 3 && widePositions >= 4) {
      score += 10;
      addReason(
        reasons,
        "wide_structure_supported",
        "balance",
        "Bred taktikk støttes av brede posisjoner og roller.",
        10,
      );
    } else {
      score -= 12;
      addReason(
        reasons,
        "wide_structure_not_supported",
        "balance",
        "Taktikken ber om bredde, men laget har ikke nok brede roller/posisjoner.",
        -12,
      );
    }

    if (insideRoles >= 4 && widthRoles < 2) {
      score -= 9;
      addReason(
        reasons,
        "wide_tactic_too_many_inside_roles",
        "balance",
        "For mange roller søker innover i en taktikk som trenger bredde.",
        -9,
      );
    }
  }

  if (tactic.principles.width === "narrow") {
    if (insideRoles >= 3) {
      score += 8;
      addReason(
        reasons,
        "narrow_structure_supported",
        "balance",
        "Smal taktikk støttes av roller som søker mellomrom og sentrale soner.",
        8,
      );
    }

    if (widthRoles >= 4) {
      score -= 7;
      addReason(
        reasons,
        "narrow_structure_too_wide",
        "balance",
        "Smal taktikk svekkes av for mange breddeholdende roller.",
        -7,
      );
    }
  }

  if (tactic.principles.width === "balanced") {
    if (widthRoles >= 2 && insideRoles >= 2) {
      score += 8;
      addReason(
        reasons,
        "balanced_width_supported",
        "balance",
        "Laget har både bredde og spillere som søker innover.",
        8,
      );
    } else {
      score -= 6;
      addReason(
        reasons,
        "balanced_width_unbalanced",
        "balance",
        "Breddestrukturen er litt ensidig.",
        -6,
      );
    }
  }

  return clampScore(score);
}

function calculateRiskBalance(slots: SelectedSlot[], tactic: Tactic, reasons: FitReason[]): Score100 {
  let score = NEUTRAL_SCORE;

  const aggressiveRoles = countWhere(slots, ({ role }) =>
    role?.riskProfile === "aggressive" || Boolean(role?.behaviour.takesRisks),
  );

  const safeRoles = countWhere(slots, ({ role }) =>
    role?.riskProfile === "safe",
  );

  const coverRoles = countWhere(slots, ({ role }) =>
    Boolean(role?.behaviour.coversBehind) ||
    Boolean(role?.behaviour.protectsDefence) ||
    Boolean(role?.tacticalFunctions.includes("balance_player")) ||
    Boolean(role?.tacticalFunctions.includes("cover_player")),
  );

  if (aggressiveRoles >= 6) {
    score -= 14;
    addReason(
      reasons,
      "too_many_aggressive_roles",
      "balance",
      "Laget har for mange aggressive/risikofylte roller samtidig.",
      -14,
    );
  } else if (aggressiveRoles >= 3 && coverRoles >= 2) {
    score += 8;
    addReason(
      reasons,
      "risk_supported_by_cover",
      "balance",
      "Risikofylte roller balanseres av nok sikring.",
      8,
    );
  }

  if (safeRoles >= 7 && tactic.principles.mentality === "attacking") {
    score -= 8;
    addReason(
      reasons,
      "attacking_with_too_many_safe_roles",
      "balance",
      "Angripende mentalitet svekkes av for mange trygge roller.",
      -8,
    );
  }

  if (tactic.principles.mentality === "cautious" && aggressiveRoles >= 4) {
    score -= 9;
    addReason(
      reasons,
      "cautious_with_many_aggressive_roles",
      "balance",
      "Forsiktig mentalitet passer dårlig med mange aggressive roller.",
      -9,
    );
  }

  if (tactic.principles.defensiveLine === "high" && aggressiveRoles >= 5 && coverRoles < 2) {
    score -= 12;
    addReason(
      reasons,
      "high_line_high_risk_little_cover",
      "balance",
      "Høy linje, mange risikoroller og lite dekning gir strukturell sårbarhet.",
      -12,
    );
  }

  if (coverRoles >= 2) {
    score += 5;
    addReason(
      reasons,
      "risk_has_structural_cover",
      "balance",
      "Laget har nok roller som kan sikre når andre tar risiko.",
      5,
    );
  }

  return clampScore(score);
}

function calculateAverageRoleFit(
  roleFitResults: PlayerRoleFitResult[] | undefined,
  reasons: FitReason[],
): Score100 {
  if (!roleFitResults || roleFitResults.length === 0) {
    addReason(
      reasons,
      "role_fit_not_supplied",
      "role",
      "Lagbalansen er beregnet uten ferdige rollefit-resultater.",
      0,
    );

    return NEUTRAL_SCORE;
  }

  const score = average(roleFitResults.map((fit) => fit.finalFit));

  if (score >= 85) {
    addReason(
      reasons,
      "team_role_fit_strong",
      "role",
      "Spillerne passer samlet sett svært godt til rollene sine.",
      8,
    );
  } else if (score >= 76) {
    addReason(
      reasons,
      "team_role_fit_good",
      "role",
      "Spillerne passer samlet sett godt til rollene sine.",
      4,
    );
  } else if (score < 62) {
    addReason(
      reasons,
      "team_role_fit_weak",
      "role",
      "Flere spillere brukes i roller som ikke passer dem.",
      -10,
    );
  } else if (score < 70) {
    addReason(
      reasons,
      "team_role_fit_limited",
      "role",
      "Rollefit er litt svak samlet sett.",
      -5,
    );
  }

  return score;
}

function validateSelectedSlots(slots: SelectedSlot[], reasons: FitReason[]): void {
  const missingPlayers = slots.filter((slot) => !slot.player);
  const missingRoles = slots.filter((slot) => !slot.role);

  if (missingPlayers.length > 0) {
    addReason(
      reasons,
      "missing_players_in_tactic",
      "balance",
      `Taktikken inneholder ${missingPlayers.length} rolleplassering(er) uten gyldig spiller.`,
      -20,
    );
  }

  if (missingRoles.length > 0) {
    addReason(
      reasons,
      "missing_roles_in_tactic",
      "balance",
      `Taktikken inneholder ${missingRoles.length} rolleplassering(er) uten gyldig rolle.`,
      -20,
    );
  }

  if (slots.length < 11) {
    addReason(
      reasons,
      "lineup_has_too_few_players",
      "balance",
      "Laget har færre enn 11 rolleplasseringer.",
      -20,
    );
  }

  if (slots.length > 11) {
    addReason(
      reasons,
      "lineup_has_too_many_players",
      "balance",
      "Laget har flere enn 11 rolleplasseringer.",
      -20,
    );
  }
}

export function calculateTeamBalance(
  team: Team,
  tactic: Tactic,
  roles: Role[],
  roleFitResults?: PlayerRoleFitResult[],
): TeamBalanceResult {
  const reasons: FitReason[] = [];

  const slots = buildSelectedSlots(team, tactic, roles);

  validateSelectedSlots(slots, reasons);

  const attackingBalance = calculateAttackingBalance(slots, tactic, reasons);
  const defensiveBalance = calculateDefensiveBalance(slots, tactic, reasons);
  const midfieldControl = calculateMidfieldControl(slots, tactic, reasons);
  const pressingCoherence = calculatePressingCoherence(slots, tactic, reasons);
  const widthBalance = calculateWidthBalance(slots, tactic, reasons);
  const riskBalance = calculateRiskBalance(slots, tactic, reasons);
  const averageRoleFit = calculateAverageRoleFit(roleFitResults, reasons);

  /**
   * Vekting v0.1:
   *
   * Angrep: 15 %
   * Forsvar: 20 %
   * Midtbane: 17.5 %
   * Press: 15 %
   * Bredde: 12.5 %
   * Risiko: 10 %
   * Rollefit: 10 %
   *
   * Rollefit er med, men dominerer ikke.
   * Et lag kan ha gode individuelle rollevalg og likevel være ubalansert.
   */
  const finalBalance = clampScore(
    attackingBalance * 0.15 +
      defensiveBalance * 0.2 +
      midfieldControl * 0.175 +
      pressingCoherence * 0.15 +
      widthBalance * 0.125 +
      riskBalance * 0.1 +
      averageRoleFit * 0.1,
  );

  if (finalBalance >= 85) {
    addReason(
      reasons,
      "team_balance_elite",
      "balance",
      "Laget er svært godt balansert taktisk.",
      10,
    );
  } else if (finalBalance >= 75) {
    addReason(
      reasons,
      "team_balance_good",
      "balance",
      "Laget har god taktisk balanse.",
      5,
    );
  } else if (finalBalance < 60) {
    addReason(
      reasons,
      "team_balance_poor",
      "balance",
      "Laget har tydelige strukturelle svakheter.",
      -12,
    );
  } else if (finalBalance < 70) {
    addReason(
      reasons,
      "team_balance_limited",
      "balance",
      "Laget fungerer, men har flere balanseproblemer.",
      -6,
    );
  }

  return {
    teamId: team.id,

    attackingBalance,
    defensiveBalance,
    midfieldControl,
    pressingCoherence,
    widthBalance,
    riskBalance,

    finalBalance,

    reasons,
  };
}
