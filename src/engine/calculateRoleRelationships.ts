// src/engine/calculateRoleRelationships.ts
//
// Relasjonsmotor for HG Football Manager (TypeScript-port av
// src/football-relationship-engine.js).
//
// Dette laget vurderer om rollene i elleveren hjelper eller blokkerer
// hverandre. Det endrer ikke spillernes grunnkvalitet. Det vurderer trenerens
// struktur: får spillerne riktige medspillere rundt seg, eller blir styrkene
// isolert? Porten er trofast mot legacy-reglene (samme rolle-id-er, samme
// tagg-betingelser, samme poeng), slik at TS-motoren kan overta uten regresjon.

import type { ID, Position, Score100, Tactic } from "../domain/footballTypes.js";

export type RelationshipAssignment = {
  roleId: ID;
  position: Position;
  playerName: string;
};

export type RoleRelationshipType = "positive" | "negative";

export type RoleRelationship = {
  type: RoleRelationshipType;
  points: number;
  title: string;
  explanation: string;
  roleIds: ID[];
};

export type RoleRelationshipResult = {
  relationshipScore: Score100;
  positivePoints: number;
  negativePoints: number;
  positiveRelations: RoleRelationship[];
  negativeRelations: RoleRelationship[];
  involvedPlayers: {
    widthCreators: string[];
    runners: string[];
    controllers: string[];
    holders: string[];
  };
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function hasRole(assignments: RelationshipAssignment[], roleId: ID): boolean {
  return assignments.some((assignment) => assignment.roleId === roleId);
}

function hasAnyRole(assignments: RelationshipAssignment[], roleIds: ID[]): boolean {
  return roleIds.some((roleId) => hasRole(assignments, roleId));
}

function countRoles(assignments: RelationshipAssignment[], roleIds: ID[]): number {
  return assignments.filter((assignment) => roleIds.includes(assignment.roleId)).length;
}

function getRolePlayers(assignments: RelationshipAssignment[], roleIds: ID[]): string[] {
  return assignments
    .filter((assignment) => roleIds.includes(assignment.roleId))
    .map((assignment) => assignment.playerName)
    .filter((name): name is string => Boolean(name));
}

function addRelation(
  relations: RoleRelationship[],
  type: RoleRelationshipType,
  points: number,
  title: string,
  explanation: string,
  roleIds: ID[] = [],
): void {
  relations.push({ type, points, title, explanation, roleIds });
}

export function calculateRoleRelationships(
  assignments: RelationshipAssignment[],
  tactic: Tactic,
): RoleRelationshipResult {
  const tacticTags = tactic.tags ?? [];
  const positives: RoleRelationship[] = [];
  const negatives: RoleRelationship[] = [];

  const hasWidthCreator = hasAnyRole(assignments, ["wide_dribbler", "inverted_winger"]);
  const hasOverlap = hasAnyRole(assignments, ["overlapping_fullback", "wingback"]);
  const hasRunner = hasAnyRole(assignments, ["channel_runner", "advanced_forward", "box_to_box"]);
  const hasDepthRunner = hasAnyRole(assignments, ["channel_runner", "advanced_forward"]);
  const hasLinkForward = hasAnyRole(assignments, ["linking_striker", "false_nine"]);
  const hasCentralCreator = hasAnyRole(assignments, ["classic_ten", "free_creator"]);
  const hasController = hasAnyRole(assignments, ["deep_playmaker", "regista"]);
  const hasHolder = hasAnyRole(assignments, ["balancing_six", "holding_midfielder"]);
  const hasBuildUpDefender = hasAnyRole(assignments, ["ball_playing_centre_back", "libero"]);
  const hasSweeperKeeper = hasRole(assignments, "sweeperkeeper");
  const hasLineKeeper = hasRole(assignments, "line_keeper");
  const hasTarget = hasRole(assignments, "target_striker");
  const hasBoxStriker = hasRole(assignments, "box_striker");
  const hasPressForward = hasRole(assignments, "pressing_forward");
  const hasPressMidfielder = hasAnyRole(assignments, ["pressing_midfielder", "box_to_box"]);
  const hasDuelCentreBack = hasAnyRole(assignments, ["duel_centre_back", "stopper"]);

  // Positive relasjoner: spillerne får hverandre til å havne oftere i riktige
  // situasjoner.
  if (hasWidthCreator && hasOverlap) {
    addRelation(
      positives,
      "positive",
      11,
      "Kant + overlapp",
      "Bred/innovervendt kant får støtte fra overlappende back eller vingback. Det gir 1v1, bredde og bedre vinkler rundt kantspilleren.",
      ["wide_dribbler", "inverted_winger", "overlapping_fullback", "wingback"],
    );
  }

  if (hasLinkForward && hasRunner) {
    addRelation(
      positives,
      "positive",
      10,
      "Møtende spiss + løp rundt",
      "Møtende spiss eller falsk nier har løpere rundt seg. Det gjør at oppspill og kombinasjoner faktisk truer bakrommet.",
      ["linking_striker", "false_nine", "channel_runner", "advanced_forward", "box_to_box"],
    );
  }

  if (hasController && hasDepthRunner) {
    addRelation(
      positives,
      "positive",
      9,
      "Playmaker + bakromstrussel",
      "Dyp playmaker eller regista har en spiller som angriper bakrom. Pasningskvaliteten kobles til reell dybdetrussel.",
      ["deep_playmaker", "regista", "channel_runner", "advanced_forward"],
    );
  }

  if (hasTarget && hasOverlap) {
    addRelation(
      positives,
      "positive",
      8,
      "Targetspiss + innleggskilde",
      "Targetspissen har bredde og innlegg rundt seg. Rollen får service i boksen i stedet for å bli isolert.",
      ["target_striker", "overlapping_fullback", "wingback"],
    );
  }

  if (hasCentralCreator && (hasDepthRunner || hasBoxStriker)) {
    addRelation(
      positives,
      "positive",
      8,
      "Skaper + sluttprodukt",
      "Fri skaper eller klassisk tier har løp, boksnærvær eller spissbevegelser foran seg. Kreativiteten får et endepunkt.",
      ["classic_ten", "free_creator", "channel_runner", "advanced_forward", "box_striker"],
    );
  }

  if (hasBuildUpDefender && hasController) {
    addRelation(
      positives,
      "positive",
      8,
      "Første pasning + midtbanekontroll",
      "Ballspillende stopper/libero og dyp playmaker/regista gir laget en tydelig oppbyggingsakse.",
      ["ball_playing_centre_back", "libero", "deep_playmaker", "regista"],
    );
  }

  if (hasSweeperKeeper && hasBuildUpDefender) {
    addRelation(
      positives,
      "positive",
      7,
      "Sweeperkeeper + ballspillende forsvar",
      "Keeper og stoppere kan bygge spill sammen. Laget får tryggere første fase og bedre romkontroll bak høyere linje.",
      ["sweeperkeeper", "ball_playing_centre_back", "libero"],
    );
  }

  if (
    hasHolder &&
    (countRoles(assignments, ["overlapping_fullback", "wingback"]) >= 1 || hasCentralCreator)
  ) {
    addRelation(
      positives,
      "positive",
      8,
      "Frihet med sikring",
      "En balanserende sekser/holdende midtbane gir friere roller trygghet bak seg. Laget kan angripe uten å miste restforsvaret helt.",
      ["balancing_six", "holding_midfielder", "overlapping_fullback", "wingback", "classic_ten", "free_creator"],
    );
  }

  if (hasPressForward && hasPressMidfielder) {
    addRelation(
      positives,
      "positive",
      8,
      "Førstepress + ettertrykk",
      "Presspiss har midtbanespillere som følger opp. Presset blir en kollektiv mekanisme, ikke bare én spiller som løper alene.",
      ["pressing_forward", "pressing_midfielder", "box_to_box"],
    );
  }

  if (hasDuelCentreBack && hasBuildUpDefender) {
    addRelation(
      positives,
      "positive",
      6,
      "Duell + oppbygging i stopperparet",
      "En duellsterk stopper og en ballspillende stopper/libero utfyller hverandre: én beskytter boksen, én bygger spill.",
      ["duel_centre_back", "stopper", "ball_playing_centre_back", "libero"],
    );
  }

  if (hasLineKeeper && hasDuelCentreBack && tacticTags.includes("low_block")) {
    addRelation(
      positives,
      "positive",
      7,
      "Linjekeeper + kompakt boksforsvar",
      "Linjekeeper og duellstopper passer en lavere, kompakt struktur der boksen beskyttes tydelig.",
      ["line_keeper", "duel_centre_back", "stopper"],
    );
  }

  // Negative relasjoner: roller som trenger noe laget ikke gir dem, eller roller
  // som tråkker i samme rom.
  if (hasWidthCreator && !hasOverlap && tacticTags.includes("wide_attack")) {
    addRelation(
      negatives,
      "negative",
      10,
      "Kant uten støtte",
      "Laget vil spille bredt, men kantspilleren mangler overlapp/vingback-støtte. Han kan bli isolert uten nok vinkler.",
      ["wide_dribbler", "inverted_winger"],
    );
  }

  if (hasLinkForward && !hasRunner) {
    addRelation(
      negatives,
      "negative",
      12,
      "Møtende spiss uten løp",
      "Møtende spiss/falsk nier kommer mot ball, men laget mangler løp rundt og foran ham. Rollen mister hensikten.",
      ["linking_striker", "false_nine"],
    );
  }

  if (
    hasTarget &&
    !hasOverlap &&
    !tacticTags.includes("crossing") &&
    !tacticTags.includes("second_balls")
  ) {
    addRelation(
      negatives,
      "negative",
      11,
      "Targetspiss uten service",
      "Targetspissen får ikke nok innlegg, andreballstøtte eller bokstjeneste. En sterk rolle blir stående uten forsyning.",
      ["target_striker"],
    );
  }

  if (
    hasController &&
    !hasHolder &&
    countRoles(assignments, ["box_to_box", "pressing_midfielder", "classic_ten", "free_creator"]) >= 2
  ) {
    addRelation(
      negatives,
      "negative",
      9,
      "Playmaker uten beskyttelse",
      "Dyp playmaker/regista har for mange frie/løpende roller rundt seg uten nok sikring. Oppbyggingen kan bli sårbar ved balltap.",
      ["deep_playmaker", "regista"],
    );
  }

  if (countRoles(assignments, ["classic_ten", "free_creator"]) > 1) {
    addRelation(
      negatives,
      "negative",
      10,
      "Flere frie skapere i samme rom",
      "Flere frie skapere kan søke samme mellomrom. Det gir kreativitet, men også uklar struktur og færre faste løp.",
      ["classic_ten", "free_creator"],
    );
  }

  if (countRoles(assignments, ["overlapping_fullback", "wingback"]) >= 2 && !hasHolder) {
    addRelation(
      negatives,
      "negative",
      12,
      "Begge sider frem uten sikring",
      "Begge back-/vingback-sidene går høyt uten balanserende sekser. Restforsvaret blir utsatt når angrepet bryter sammen.",
      ["overlapping_fullback", "wingback"],
    );
  }

  if (hasPressForward && !hasPressMidfielder && tacticTags.includes("high_press")) {
    addRelation(
      negatives,
      "negative",
      9,
      "Presspiss uten ettertrykk",
      "Presspissen starter presset, men midtbanen følger ikke tydelig nok. Motstanderen kan spille gjennom første pressledd.",
      ["pressing_forward"],
    );
  }

  if (hasLineKeeper && tacticTags.includes("high_line")) {
    addRelation(
      negatives,
      "negative",
      9,
      "Linjekeeper bak høy linje",
      "Linjekeeperen er sterk nær egen boks, men høy linje krever mer sweeper-atferd og romkontroll bak forsvaret.",
      ["line_keeper"],
    );
  }

  const positivePoints = positives.reduce((sum, relation) => sum + relation.points, 0);
  const negativePoints = negatives.reduce((sum, relation) => sum + relation.points, 0);
  const relationshipScore = clamp(Math.round(55 + positivePoints - negativePoints));

  return {
    relationshipScore,
    positivePoints,
    negativePoints,
    positiveRelations: positives,
    negativeRelations: negatives,
    involvedPlayers: {
      widthCreators: getRolePlayers(assignments, ["wide_dribbler", "inverted_winger"]),
      runners: getRolePlayers(assignments, ["channel_runner", "advanced_forward", "box_to_box"]),
      controllers: getRolePlayers(assignments, ["deep_playmaker", "regista"]),
      holders: getRolePlayers(assignments, ["balancing_six", "holding_midfielder"]),
    },
  };
}
