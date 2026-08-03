const POSITION_GROUPS = {
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
  ST: "striker"
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function countOverlap(a = [], b = []) {
  const target = new Set(b);
  return a.filter((item) => target.has(item)).length;
}

function hasAny(a = [], b = []) {
  return countOverlap(a, b) > 0;
}

function formatRoleNames(roleIds = [], roles = []) {
  return roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.name || roleId);
}

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
  "ST"
];

export function calculatePositionFit(player, assignment) {
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
    ...player.usablePositions.map((pos) => POSITION_GROUPS[pos])
  ]);

  const assignmentGroup = POSITION_GROUPS[position];

  if (playerGroups.includes(assignmentGroup)) {
    return 66;
  }

  return 50;
}

export function calculateRoleFit(player, role) {
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

export function calculateTacticFit(player, tactic, role) {
  let score = 48;
  const tacticTags = tactic.tags || [];

  score += countOverlap(player.likesTactics, tacticTags) * 7;
  score += countOverlap(role.tacticalLikes, tacticTags) * 5;
  score += countOverlap(player.needs, tacticTags) * 4;
  score -= countOverlap(player.dislikesTactics, tacticTags) * 10;
  score -= countOverlap(role.tacticalDislikes, tacticTags) * 8;

  return clamp(Math.round(score));
}

export function calculateMisusePenalty(player, assignment, role, tactic) {
  let penalty = 0;
  const position = assignment.position;
  const tacticTags = tactic.tags || [];

  if (player.poorFits.includes(position)) {
    penalty += 18;
  }

  if (!player.preferredRoles.includes(role.id) && !player.usablePositions.includes(position) && !player.naturalPositions.includes(position)) {
    penalty += 10;
  }

  if (!role.validPositions.includes(position)) {
    penalty += 12;
  }

  if (hasAny(player.dislikesTactics, tacticTags)) {
    penalty += countOverlap(player.dislikesTactics, tacticTags) * 5;
  }

  if (player.archetypes.includes("dribbler") && position === "ST") {
    penalty += 24;
  }

  if (player.archetypes.includes("wide_creator") && role.positionGroup === "striker") {
    penalty += 18;
  }

  if (player.archetypes.includes("depth_threat") && !tacticTags.includes("space_behind") && !tacticTags.includes("direct_counter")) {
    penalty += 12;
  }

  if (player.archetypes.includes("target") && !tacticTags.includes("crossing") && !tacticTags.includes("second_balls")) {
    penalty += 12;
  }

  if (player.archetypes.includes("sweeper_keeper") && tacticTags.includes("low_block")) {
    penalty += 12;
  }

  if (player.archetypes.includes("shot_stopper") && tacticTags.includes("high_line")) {
    penalty += 12;
  }

  return clamp(Math.round(penalty), 0, 55);
}

function getStatus(matchScore, misusePenalty) {
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

function buildWarnings(player, assignment, role, tactic, misusePenalty) {
  const warnings = [];
  const tacticTags = tactic.tags || [];

  if (player.poorFits.includes(assignment.position)) {
    warnings.push(`${player.name} har ${assignment.position} som en dårlig posisjonsmatch.`);
  }

  if (!role.validPositions.includes(assignment.position)) {
    warnings.push(`${role.name} passer normalt ikke i posisjonen ${assignment.position}.`);
  }

  if (player.archetypes.includes("dribbler") && assignment.position === "ST") {
    warnings.push("Driblere mister ofte verdi som spiss med ryggen mot mål. De trenger bredde, rom og 1v1-situasjoner.");
  }

  if (player.archetypes.includes("wide_creator") && role.positionGroup === "striker") {
    warnings.push("En bred skaper mister ofte de beste aksjonene sine når han flyttes inn i en sentral spissrolle.");
  }

  if (hasAny(player.dislikesTactics, tacticTags)) {
    warnings.push("Taktikken treffer noen av spillerens tydelige misliker-punkter.");
  }

  if (misusePenalty >= 28 && warnings.length === 0) {
    warnings.push(player.warningWhenMisused);
  }

  return warnings;
}

function buildExplanation({ player, assignment, role, tactic, positionFit, roleFit, tacticFit, misusePenalty, status }) {
  if (status === "perfekt") {
    return `${player.name} brukes svært godt som ${role.name} i ${assignment.position}. Rollen, posisjonen og taktikken gjør at spilleren ofte får brukt styrkene sine: ${player.strengths.slice(0, 4).join(", ")}.`;
  }

  if (status === "god") {
    return `${player.name} passer godt her, men det finnes fortsatt noen detaljer treneren kan justere. Posisjonsfit er ${positionFit}, rollefit er ${roleFit}, og taktisk fit er ${tacticFit}.`;
  }

  if (status === "brukbar") {
    return `${player.name} kan fungere her, men dette er ikke den tydeligste bruken av spilleren. Treneren får noe ut av kvaliteten, men ikke nok av spillerens foretrukne situasjoner.`;
  }

  if (player.archetypes.includes("dribbler") && assignment.position === "ST") {
    return `${player.name} er fortsatt en klassespiller, men blir feilbrukt her. Spilleren mister bredde, 1v1-situasjoner og rom til å utfordre. Problemet er trenerens bruk, ikke spillerens kvalitet.`;
  }

  return `${player.name} brukes på en måte som skjuler for mange av styrkene hans. Feilbruk-penalty er ${misusePenalty}. Treneren bør vurdere annen rolle, annen posisjon eller en taktikk som bedre treffer spillerens behov.`;
}

// Ferdighetsprofilen henges på spilleren ved innlasting
// (`football-player-attributes.js`). Mangler den — usammensatt TS-testdata,
// eller demoen før dataene er lastet — faller vi tilbake på klassehøyden alene.
// Fallbacket er bevisst det gamle uttrykket, så gammel og ny vei er
// sammenlignbare i stedet for stilltiende ulike.
export const CLASS_BONUS_MAX = 7.7;

export function calculateClassBonus(player, role) {
  const values = player?.attributes?.values;
  const skills = Array.isArray(role?.requiredSkills) ? role.requiredSkills : [];
  if (!values || skills.length === 0) {
    return (num(player?.classHeight, 85) - 85) * 0.55;
  }
  const total = skills.reduce((sum, id) => sum + (Number.isFinite(values[id]) ? values[id] : 4), 0);
  // Eksplisitt normalisering fra ferdighetsskalaen (1–20) til bonusspennet,
  // ikke et klem. Skala-mismatch er husets tilbakevendende bug.
  return (total / skills.length / 20) * CLASS_BONUS_MAX;
}

export function calculatePlayerMatchFit(player, assignment, role, tactic, roles = []) {
  const positionFit = calculatePositionFit(player, assignment);
  const roleFit = calculateRoleFit(player, role);
  const tacticFit = calculateTacticFit(player, tactic, role);
  const misusePenalty = calculateMisusePenalty(player, assignment, role, tactic);

  // Klassebonusen er ikke lenger et flatt løft spilleren bærer med seg overalt.
  // Den måles på nytt for HVER rolle: hvor godt treffer ferdighetene hans det
  // nettopp denne rollen krever? Det er derfor en spiller med lavere
  // klassehøyde kan slå en med høyere — målt over de 27 rollene har 23 av dem
  // en annen best-treffende spiller enn den med høyest klassehøyde.
  //
  // Spennet er bevisst identisk med det gamle (0–7,7), så resten av
  // matchScore-kalibreringen står. `role.requiredSkills` er rollens
  // ferdighetskrav, løst opp ved innlasting — rollens `requires` blander
  // ferdigheter med FORHOLD systemet må gi (`space_behind`), og bare de første
  // hører hjemme i en spillervurdering.
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
    tactic,
    positionFit,
    roleFit,
    tacticFit,
    misusePenalty,
    status
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
    suggestedRoles
  };
}
