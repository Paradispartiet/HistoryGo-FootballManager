// src/engine/calculatePlayerMatchFit.ts
//
// TypeScript-port av src/football-fit-engine.js (individuell spiller-fit).
//
// Produserer den eldre fit-vokabularet (matchScore/status/explanation/warnings/
// suggestedRoles) som lagrapport-konsumentene (renderLineup, renderSidePanel)
// leser i dag. Porten er trofast mot legacy og opererer på den eksisterende
// legacy-dataformen (strengths/needs/likesTactics/archetypes …), slik at en
// sammenstilt legacy-kompatibel teamFit (senere steg) matcher legacy uten
// regresjon.
//
// Merk: dette er en egen vurdering enn TS-domenets calculateRoleFit (som
// jobber på strukturerte attributter/traits). Denne porten finnes for å mate
// det legacy-formede teamFit-objektet; konsolidering kan vurderes senere.

const POSITION_GROUPS: Record<string, string> = {
  GK: "keeper",
  CB: "defender",
  LB: "fullback",
  RB: "fullback",
  WB: "fullback",
  DM: "midfield",
  CM: "midfield",
  AM: "attacking_midfield",
  LW: "wing",
  RW: "wing",
  ST: "striker",
};

export const FOOTBALL_POSITIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "WB",
  "DM",
  "CM",
  "AM",
  "LW",
  "RW",
  "ST",
];

export type PlayerMatchFitStatus = "feilbrukt" | "perfekt" | "god" | "brukbar";

/** Ferdighetsprofilen slik den henges på spilleren ved innlasting. */
export type FitAttributeProfile = {
  values: Record<string, number>;
};

export type FitPlayer = {
  id: string;
  name: string;
  /**
   * Klassehøyde — hvor høyt kilden bærer spilleren. Dette er en INPUT til
   * ferdighetsprofilen, aldri en score: klassen manageren ser regnes ut mot en
   * posisjon eller en rolle. Feltet het `overall` og var nettopp ratingen.
   */
  classHeight: number;
  attributes?: FitAttributeProfile;
  naturalPositions: string[];
  usablePositions: string[];
  poorFits: string[];
  preferredRoles: string[];
  strengths?: string[];
  needs?: string[];
  likesTactics?: string[];
  dislikesTactics?: string[];
  archetypes?: string[];
  warningWhenMisused?: string;
};

export type FitRole = {
  id: string;
  name: string;
  validPositions: string[];
  positionGroup?: string;
  requires?: string[];
  /**
   * Rollens ferdighetskrav, løst opp ved innlasting. `requires` blander
   * ferdigheter spilleren må ha (`crossing`) med FORHOLD systemet må gi ham
   * (`space_behind`, `wide_lane`) — målt over de 27 rollene er 96 krav
   * ferdigheter og 38 forhold. Bare de første hører hjemme i en vurdering av
   * spilleren; forholdene eies av lag- og relasjonsmotorene.
   */
  requiredSkills?: string[];
  tacticalLikes?: string[];
  tacticalDislikes?: string[];
  badFor?: string[];
};

export type FitTactic = {
  id: string;
  tags?: string[];
};

export type FitAssignment = {
  position: string;
};

export type PlayerMatchFit = {
  playerId: string;
  roleId: string;
  tacticId: string;
  position: string;
  classHeight: number;
  /** Rollens andel av kampscoren — måles på nytt for hver rolle. */
  roleClassBonus: number;
  positionFit: number;
  roleFit: number;
  tacticFit: number;
  misusePenalty: number;
  matchScore: number;
  status: PlayerMatchFitStatus;
  explanation: string;
  warnings: string[];
  suggestedRoles: string[];
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function countOverlap(a: string[] = [], b: string[] = []): number {
  const target = new Set(b);
  return a.filter((item) => target.has(item)).length;
}

function hasAny(a: string[] = [], b: string[] = []): boolean {
  return countOverlap(a, b) > 0;
}

function formatRoleNames(roleIds: string[] = [], roles: FitRole[] = []): string[] {
  return roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.name || roleId);
}

export function calculatePositionFit(player: FitPlayer, assignment: FitAssignment): number {
  const position = assignment.position;

  if (player.naturalPositions.includes(position)) {
    return 96;
  }

  if (player.usablePositions.includes(position)) {
    return 78;
  }

  if (player.poorFits.includes(position)) {
    return 30;
  }

  const playerGroups = unique([
    ...player.naturalPositions.map((pos) => POSITION_GROUPS[pos]),
    ...player.usablePositions.map((pos) => POSITION_GROUPS[pos]),
  ]);

  const assignmentGroup = POSITION_GROUPS[position];

  if (assignmentGroup !== undefined && playerGroups.includes(assignmentGroup)) {
    return 66;
  }

  return 50;
}

export function calculateLegacyRoleFit(player: FitPlayer, role: FitRole): number {
  let score = 42;

  if (player.preferredRoles.includes(role.id)) {
    score += 42;
  }

  score += countOverlap(player.strengths, role.requires) * 5;
  score += countOverlap(player.needs, role.requires) * 5;
  score += countOverlap(player.likesTactics, role.tacticalLikes) * 3;
  score += countOverlap(player.dislikesTactics, role.tacticalLikes) * -9;

  if (hasAny(player.dislikesTactics, role.badFor)) {
    score -= 12;
  }

  return clamp(Math.round(score));
}

export function calculateTacticFit(player: FitPlayer, tactic: FitTactic, role: FitRole): number {
  let score = 48;
  const tacticTags = tactic.tags || [];

  score += countOverlap(player.likesTactics, tacticTags) * 7;
  score += countOverlap(role.tacticalLikes, tacticTags) * 5;
  score += countOverlap(player.needs, tacticTags) * 4;
  score -= countOverlap(player.dislikesTactics, tacticTags) * 10;
  score -= countOverlap(role.tacticalDislikes, tacticTags) * 8;

  return clamp(Math.round(score));
}

export function calculateMisusePenalty(
  player: FitPlayer,
  assignment: FitAssignment,
  role: FitRole,
  tactic: FitTactic,
): number {
  let penalty = 0;
  const position = assignment.position;
  const tacticTags = tactic.tags || [];
  const archetypes = player.archetypes || [];

  if (player.poorFits.includes(position)) {
    penalty += 18;
  }

  if (
    !player.preferredRoles.includes(role.id) &&
    !player.usablePositions.includes(position) &&
    !player.naturalPositions.includes(position)
  ) {
    penalty += 10;
  }

  if (!role.validPositions.includes(position)) {
    penalty += 12;
  }

  if (hasAny(player.dislikesTactics, tacticTags)) {
    penalty += countOverlap(player.dislikesTactics, tacticTags) * 5;
  }

  if (archetypes.includes("dribbler") && position === "ST") {
    penalty += 24;
  }

  if (archetypes.includes("wide_creator") && role.positionGroup === "striker") {
    penalty += 18;
  }

  if (archetypes.includes("depth_threat") && !tacticTags.includes("space_behind") && !tacticTags.includes("direct_counter")) {
    penalty += 12;
  }

  if (archetypes.includes("target") && !tacticTags.includes("crossing") && !tacticTags.includes("second_balls")) {
    penalty += 12;
  }

  if (archetypes.includes("sweeper_keeper") && tacticTags.includes("low_block")) {
    penalty += 12;
  }

  if (archetypes.includes("shot_stopper") && tacticTags.includes("high_line")) {
    penalty += 12;
  }

  return clamp(Math.round(penalty), 0, 55);
}

function getStatus(matchScore: number, misusePenalty: number): PlayerMatchFitStatus {
  if (misusePenalty >= 28 || matchScore < 62) {
    return "feilbrukt";
  }

  if (matchScore >= 88) {
    return "perfekt";
  }

  if (matchScore >= 75) {
    return "god";
  }

  return "brukbar";
}

function buildWarnings(
  player: FitPlayer,
  assignment: FitAssignment,
  role: FitRole,
  tactic: FitTactic,
  misusePenalty: number,
): string[] {
  const warnings: string[] = [];
  const tacticTags = tactic.tags || [];
  const archetypes = player.archetypes || [];

  if (player.poorFits.includes(assignment.position)) {
    warnings.push(`${player.name} har ${assignment.position} som en dårlig posisjonsmatch.`);
  }

  if (!role.validPositions.includes(assignment.position)) {
    warnings.push(`${role.name} passer normalt ikke i posisjonen ${assignment.position}.`);
  }

  if (archetypes.includes("dribbler") && assignment.position === "ST") {
    warnings.push("Driblere mister ofte verdi som spiss med ryggen mot mål. De trenger bredde, rom og 1v1-situasjoner.");
  }

  if (archetypes.includes("wide_creator") && role.positionGroup === "striker") {
    warnings.push("En bred skaper mister ofte de beste aksjonene sine når han flyttes inn i en sentral spissrolle.");
  }

  if (hasAny(player.dislikesTactics, tacticTags)) {
    warnings.push("Taktikken treffer noen av spillerens tydelige misliker-punkter.");
  }

  if (misusePenalty >= 28 && warnings.length === 0 && player.warningWhenMisused) {
    warnings.push(player.warningWhenMisused);
  }

  return warnings;
}

function buildExplanation(input: {
  player: FitPlayer;
  assignment: FitAssignment;
  role: FitRole;
  positionFit: number;
  roleFit: number;
  tacticFit: number;
  misusePenalty: number;
  status: PlayerMatchFitStatus;
}): string {
  const { player, assignment, role, positionFit, roleFit, tacticFit, misusePenalty, status } = input;
  const archetypes = player.archetypes || [];

  if (status === "perfekt") {
    return `${player.name} brukes svært godt som ${role.name} i ${assignment.position}. Rollen, posisjonen og taktikken gjør at spilleren ofte får brukt styrkene sine: ${(player.strengths || []).slice(0, 4).join(", ")}.`;
  }

  if (status === "god") {
    return `${player.name} passer godt her, men det finnes fortsatt noen detaljer treneren kan justere. Posisjonsfit er ${positionFit}, rollefit er ${roleFit}, og taktisk fit er ${tacticFit}.`;
  }

  if (status === "brukbar") {
    return `${player.name} kan fungere her, men dette er ikke den tydeligste bruken av spilleren. Treneren får noe ut av kvaliteten, men ikke nok av spillerens foretrukne situasjoner.`;
  }

  if (archetypes.includes("dribbler") && assignment.position === "ST") {
    return `${player.name} er fortsatt en klassespiller, men blir feilbrukt her. Spilleren mister bredde, 1v1-situasjoner og rom til å utfordre. Problemet er trenerens bruk, ikke spillerens kvalitet.`;
  }

  return `${player.name} brukes på en måte som skjuler for mange av styrkene hans. Feilbruk-penalty er ${misusePenalty}. Treneren bør vurdere annen rolle, annen posisjon eller en taktikk som bedre treffer spillerens behov.`;
}

export const CLASS_BONUS_MAX = 7.7;

/**
 * Mangler ferdighetsprofilen — usammensatt testdata, eller demoen før dataene
 * er lastet — faller vi tilbake på klassehøyden alene. Fallbacket er bevisst
 * det gamle uttrykket, så gammel og ny vei er sammenlignbare.
 */
export function calculateClassBonus(player: FitPlayer, role: FitRole): number {
  const values = player.attributes?.values;
  const skills = Array.isArray(role.requiredSkills) ? role.requiredSkills : [];
  if (!values || skills.length === 0) {
    return ((Number.isFinite(player.classHeight) ? player.classHeight : 85) - 85) * 0.55;
  }
  const total = skills.reduce((sum, id) => {
    const value = values[id];
    return sum + (typeof value === "number" && Number.isFinite(value) ? value : 4);
  }, 0);
  // Eksplisitt normalisering fra ferdighetsskalaen (1–20) til bonusspennet.
  return (total / skills.length / 20) * CLASS_BONUS_MAX;
}

export function calculatePlayerMatchFit(
  player: FitPlayer,
  assignment: FitAssignment,
  role: FitRole,
  tactic: FitTactic,
  roles: FitRole[] = [],
): PlayerMatchFit {
  const positionFit = calculatePositionFit(player, assignment);
  const roleFit = calculateLegacyRoleFit(player, role);
  const tacticFit = calculateTacticFit(player, tactic, role);
  const misusePenalty = calculateMisusePenalty(player, assignment, role, tactic);

  // Speiler football-fit-engine.js nøyaktig: bonusen er ikke lenger et flatt
  // løft spilleren bærer med seg overalt, men hvor godt ferdighetene hans
  // treffer det NETTOPP DENNE rollen krever.
  const classBonus = calculateClassBonus(player, role);
  const rawScore = 35 + classBonus + positionFit * 0.2 + roleFit * 0.27 + tacticFit * 0.25 - misusePenalty * 0.65;
  const matchScore = clamp(Math.round(rawScore), 1, 100);
  const status = getStatus(matchScore, misusePenalty);
  const warnings = buildWarnings(player, assignment, role, tactic, misusePenalty);
  const suggestedRoles = formatRoleNames(player.preferredRoles, roles);
  const explanation = buildExplanation({
    player,
    assignment,
    role,
    positionFit,
    roleFit,
    tacticFit,
    misusePenalty,
    status,
  });

  return {
    playerId: player.id,
    roleId: role.id,
    tacticId: tactic.id,
    position: assignment.position,
    classHeight: player.classHeight,
    roleClassBonus: Math.round(classBonus * 10) / 10,
    positionFit,
    roleFit,
    tacticFit,
    misusePenalty,
    matchScore,
    status,
    explanation,
    warnings,
    suggestedRoles,
  };
}
