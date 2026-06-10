// src/football-relationship-engine.js
//
// Relasjonsmotor for HG Football Manager.
//
// Dette laget vurderer om rollene i elleveren hjelper eller blokkerer hverandre.
// Det endrer ikke spillernes grunnkvalitet. Det vurderer trenerens struktur:
// får spillerne riktige medspillere rundt seg, eller blir styrkene isolert?

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hasRole(assignments, roleId) {
  return assignments.some((assignment) => assignment.role?.id === roleId);
}

function hasAnyRole(assignments, roleIds) {
  return roleIds.some((roleId) => hasRole(assignments, roleId));
}

function countRoles(assignments, roleIds) {
  return assignments.filter((assignment) => roleIds.includes(assignment.role?.id)).length;
}

function getRolePlayers(assignments, roleIds) {
  return assignments
    .filter((assignment) => roleIds.includes(assignment.role?.id))
    .map((assignment) => assignment.player?.name || assignment.role?.name || assignment.slot?.label)
    .filter(Boolean);
}

function addPositive(relations, points, title, explanation, roleIds = []) {
  relations.push({ type: "positive", points, title, explanation, roleIds });
}

function addNegative(relations, points, title, explanation, roleIds = []) {
  relations.push({ type: "negative", points, title, explanation, roleIds });
}

export function calculateRoleRelationships(assignments, tactic) {
  const completeAssignments = assignments.filter((assignment) => assignment?.isComplete);
  const tacticTags = Array.isArray(tactic?.tags) ? tactic.tags : [];
  const positives = [];
  const negatives = [];

  const hasWidthCreator = hasAnyRole(completeAssignments, ["wide_dribbler", "inverted_winger"]);
  const hasOverlap = hasAnyRole(completeAssignments, ["overlapping_fullback", "wingback"]);
  const hasRunner = hasAnyRole(completeAssignments, ["channel_runner", "advanced_forward", "box_to_box"]);
  const hasDepthRunner = hasAnyRole(completeAssignments, ["channel_runner", "advanced_forward"]);
  const hasLinkForward = hasAnyRole(completeAssignments, ["linking_striker", "false_nine"]);
  const hasCentralCreator = hasAnyRole(completeAssignments, ["classic_ten", "free_creator"]);
  const hasController = hasAnyRole(completeAssignments, ["deep_playmaker", "regista"]);
  const hasHolder = hasAnyRole(completeAssignments, ["balancing_six", "holding_midfielder"]);
  const hasBuildUpDefender = hasAnyRole(completeAssignments, ["ball_playing_centre_back", "libero"]);
  const hasSweeperKeeper = hasRole(completeAssignments, "sweeperkeeper");
  const hasLineKeeper = hasRole(completeAssignments, "line_keeper");
  const hasTarget = hasRole(completeAssignments, "target_striker");
  const hasBoxStriker = hasRole(completeAssignments, "box_striker");
  const hasPressForward = hasRole(completeAssignments, "pressing_forward");
  const hasPressMidfielder = hasAnyRole(completeAssignments, ["pressing_midfielder", "box_to_box"]);
  const hasDuelCentreBack = hasAnyRole(completeAssignments, ["duel_centre_back", "stopper"]);

  // Positive relasjoner: spillerne får hverandre til å havne oftere i riktige situasjoner.
  if (hasWidthCreator && hasOverlap) {
    addPositive(
      positives,
      11,
      "Kant + overlapp",
      "Bred/innovervendt kant får støtte fra overlappende back eller vingback. Det gir 1v1, bredde og bedre vinkler rundt kantspilleren.",
      ["wide_dribbler", "inverted_winger", "overlapping_fullback", "wingback"]
    );
  }

  if (hasLinkForward && hasRunner) {
    addPositive(
      positives,
      10,
      "Møtende spiss + løp rundt",
      "Møtende spiss eller falsk nier har løpere rundt seg. Det gjør at oppspill og kombinasjoner faktisk truer bakrommet.",
      ["linking_striker", "false_nine", "channel_runner", "advanced_forward", "box_to_box"]
    );
  }

  if (hasController && hasDepthRunner) {
    addPositive(
      positives,
      9,
      "Playmaker + bakromstrussel",
      "Dyp playmaker eller regista har en spiller som angriper bakrom. Pasningskvaliteten kobles til reell dybdetrussel.",
      ["deep_playmaker", "regista", "channel_runner", "advanced_forward"]
    );
  }

  if (hasTarget && hasOverlap) {
    addPositive(
      positives,
      8,
      "Targetspiss + innleggskilde",
      "Targetspissen har bredde og innlegg rundt seg. Rollen får service i boksen i stedet for å bli isolert.",
      ["target_striker", "overlapping_fullback", "wingback"]
    );
  }

  if (hasCentralCreator && (hasDepthRunner || hasBoxStriker)) {
    addPositive(
      positives,
      8,
      "Skaper + sluttprodukt",
      "Fri skaper eller klassisk tier har løp, boksnærvær eller spissbevegelser foran seg. Kreativiteten får et endepunkt.",
      ["classic_ten", "free_creator", "channel_runner", "advanced_forward", "box_striker"]
    );
  }

  if (hasBuildUpDefender && hasController) {
    addPositive(
      positives,
      8,
      "Første pasning + midtbanekontroll",
      "Ballspillende stopper/libero og dyp playmaker/regista gir laget en tydelig oppbyggingsakse.",
      ["ball_playing_centre_back", "libero", "deep_playmaker", "regista"]
    );
  }

  if (hasSweeperKeeper && hasBuildUpDefender) {
    addPositive(
      positives,
      7,
      "Sweeperkeeper + ballspillende forsvar",
      "Keeper og stoppere kan bygge spill sammen. Laget får tryggere første fase og bedre romkontroll bak høyere linje.",
      ["sweeperkeeper", "ball_playing_centre_back", "libero"]
    );
  }

  if (hasHolder && (countRoles(completeAssignments, ["overlapping_fullback", "wingback"]) >= 1 || hasCentralCreator)) {
    addPositive(
      positives,
      8,
      "Frihet med sikring",
      "En balanserende sekser/holdende midtbane gir friere roller trygghet bak seg. Laget kan angripe uten å miste restforsvaret helt.",
      ["balancing_six", "holding_midfielder", "overlapping_fullback", "wingback", "classic_ten", "free_creator"]
    );
  }

  if (hasPressForward && hasPressMidfielder) {
    addPositive(
      positives,
      8,
      "Førstepress + ettertrykk",
      "Presspiss har midtbanespillere som følger opp. Presset blir en kollektiv mekanisme, ikke bare én spiller som løper alene.",
      ["pressing_forward", "pressing_midfielder", "box_to_box"]
    );
  }

  if (hasDuelCentreBack && hasBuildUpDefender) {
    addPositive(
      positives,
      6,
      "Duell + oppbygging i stopperparet",
      "En duellsterk stopper og en ballspillende stopper/libero utfyller hverandre: én beskytter boksen, én bygger spill.",
      ["duel_centre_back", "stopper", "ball_playing_centre_back", "libero"]
    );
  }

  if (hasLineKeeper && hasDuelCentreBack && tacticTags.includes("low_block")) {
    addPositive(
      positives,
      7,
      "Linjekeeper + kompakt boksforsvar",
      "Linjekeeper og duellstopper passer en lavere, kompakt struktur der boksen beskyttes tydelig.",
      ["line_keeper", "duel_centre_back", "stopper"]
    );
  }

  // Negative relasjoner: roller som trenger noe laget ikke gir dem, eller roller som tråkker i samme rom.
  if (hasWidthCreator && !hasOverlap && tacticTags.includes("wide_attack")) {
    addNegative(
      negatives,
      10,
      "Kant uten støtte",
      "Laget vil spille bredt, men kantspilleren mangler overlapp/vingback-støtte. Han kan bli isolert uten nok vinkler.",
      ["wide_dribbler", "inverted_winger"]
    );
  }

  if (hasLinkForward && !hasRunner) {
    addNegative(
      negatives,
      12,
      "Møtende spiss uten løp",
      "Møtende spiss/falsk nier kommer mot ball, men laget mangler løp rundt og foran ham. Rollen mister hensikten.",
      ["linking_striker", "false_nine"]
    );
  }

  if (hasTarget && !hasOverlap && !tacticTags.includes("crossing") && !tacticTags.includes("second_balls")) {
    addNegative(
      negatives,
      11,
      "Targetspiss uten service",
      "Targetspissen får ikke nok innlegg, andreballstøtte eller bokstjeneste. En sterk rolle blir stående uten forsyning.",
      ["target_striker"]
    );
  }

  if (hasController && !hasHolder && countRoles(completeAssignments, ["box_to_box", "pressing_midfielder", "classic_ten", "free_creator"]) >= 2) {
    addNegative(
      negatives,
      9,
      "Playmaker uten beskyttelse",
      "Dyp playmaker/regista har for mange frie/løpende roller rundt seg uten nok sikring. Oppbyggingen kan bli sårbar ved balltap.",
      ["deep_playmaker", "regista"]
    );
  }

  if (countRoles(completeAssignments, ["classic_ten", "free_creator"]) > 1) {
    addNegative(
      negatives,
      10,
      "Flere frie skapere i samme rom",
      "Flere frie skapere kan søke samme mellomrom. Det gir kreativitet, men også uklar struktur og færre faste løp.",
      ["classic_ten", "free_creator"]
    );
  }

  if (countRoles(completeAssignments, ["overlapping_fullback", "wingback"]) >= 2 && !hasHolder) {
    addNegative(
      negatives,
      12,
      "Begge sider frem uten sikring",
      "Begge back-/vingback-sidene går høyt uten balanserende sekser. Restforsvaret blir utsatt når angrepet bryter sammen.",
      ["overlapping_fullback", "wingback"]
    );
  }

  if (hasPressForward && !hasPressMidfielder && tacticTags.includes("high_press")) {
    addNegative(
      negatives,
      9,
      "Presspiss uten ettertrykk",
      "Presspissen starter presset, men midtbanen følger ikke tydelig nok. Motstanderen kan spille gjennom første pressledd.",
      ["pressing_forward"]
    );
  }

  if (hasLineKeeper && tacticTags.includes("high_line")) {
    addNegative(
      negatives,
      9,
      "Linjekeeper bak høy linje",
      "Linjekeeperen er sterk nær egen boks, men høy linje krever mer sweeper-atferd og romkontroll bak forsvaret.",
      ["line_keeper"]
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
      widthCreators: getRolePlayers(completeAssignments, ["wide_dribbler", "inverted_winger"]),
      runners: getRolePlayers(completeAssignments, ["channel_runner", "advanced_forward", "box_to_box"]),
      controllers: getRolePlayers(completeAssignments, ["deep_playmaker", "regista"]),
      holders: getRolePlayers(completeAssignments, ["balancing_six", "holding_midfielder"])
    }
  };
}
