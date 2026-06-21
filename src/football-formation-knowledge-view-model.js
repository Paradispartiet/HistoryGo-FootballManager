// HG Football Manager — Formation Knowledge View Model v1
//
// Ren formatter for data/hgFootball/formationKnowledge.json. Modulen eier ikke
// data, leser ikke DOM/localStorage og gjør ingen sideeffekter. Den gjør
// kunnskapsoppslagene korte nok til managerkontorets UI-flater.

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanStrings(value) {
  return asArray(value).filter((item) => typeof item === "string" && item.trim().length > 0);
}

function firstStrings(value, limit) {
  return cleanStrings(value).slice(0, limit);
}

function roleLabel(roleId, roleIndex) {
  if (!roleId) return null;
  const role = roleIndex instanceof Map ? roleIndex.get(roleId) : null;
  return role?.name || role?.displayName || roleId;
}

function opponentLabel(opponentId, opponentIndex) {
  if (!opponentId) return null;
  const opponent = opponentIndex instanceof Map ? opponentIndex.get(opponentId) : null;
  return opponent?.displayName || opponent?.name || opponent?.archetypeName || opponentId;
}

export function buildOpponentProfileIndex(opponents = []) {
  return new Map(asArray(opponents).filter((profile) => profile?.id).map((profile) => [profile.id, profile]));
}

export function buildFormationKnowledgeIndex(formationKnowledgeData) {
  const entries = asArray(formationKnowledgeData?.knowledge);
  return Object.fromEntries(entries.filter((entry) => entry?.formationId).map((entry) => [entry.formationId, entry]));
}

export function createFormationKnowledgeViewModel({ formation, knowledge, roleIndex, opponentIndex } = {}) {
  if (!formation && !knowledge) return null;
  const formationId = knowledge?.formationId || formation?.id || null;
  const displayName = knowledge?.displayName || formation?.name || formationId || "Ukjent formasjon";
  const baseShape = knowledge?.baseShape || formation?.baseShape || "";
  const era = knowledge?.era || formation?.eraName || formation?.period || "";
  const tacticalSchool = knowledge?.tacticalSchool || formation?.tacticalSchool || "";

  const roleRequirements = firstStrings(knowledge?.roleRequirements || formation?.roleRequirements, 4)
    .map((roleId) => roleLabel(roleId, roleIndex))
    .filter(Boolean);
  const relatedOpponentLabels = firstStrings(knowledge?.relatedOpponentArchetypes, 4)
    .map((opponentId) => opponentLabel(opponentId, opponentIndex))
    .filter(Boolean);

  return {
    formationId,
    displayName,
    subtitle: [baseShape, era, tacticalSchool].filter(Boolean).join(" · "),
    era,
    tacticalSchool,
    baseShape,
    corePrinciple: knowledge?.corePrinciple || knowledge?.summary || firstStrings(formation?.principles, 1)[0] || "",
    quickStrengths: firstStrings(knowledge?.strengths || formation?.strengths, 3),
    quickWeaknesses: firstStrings(knowledge?.weaknesses || formation?.weaknesses, 3),
    roleRequirements,
    managerHints: firstStrings(knowledge?.managerHints, 2),
    matchupSignals: firstStrings(knowledge?.matchupSignals, 3),
    relatedOpponentLabels,
    learningPoints: firstStrings(knowledge?.learningPoints, 3),
    worksWellAgainst: firstStrings(knowledge?.worksWellAgainst || knowledge?.strongAgainst, 3),
    strugglesAgainst: firstStrings(knowledge?.strugglesAgainst || knowledge?.weakAgainst, 3)
  };
}

export function getFormationLearningHint(knowledge) {
  if (!knowledge || typeof knowledge !== "object") return null;
  const hints = cleanStrings(knowledge?.managerHints);
  if (hints.length) return hints[0];
  const learning = cleanStrings(knowledge?.learningPoints);
  if (learning.length) return learning[0];
  const risks = cleanStrings(knowledge?.tacticalRisks || knowledge?.weaknesses);
  if (risks.length) return `Pass på: ${risks[0]}.`;
  const roles = cleanStrings(knowledge?.roleRequirements);
  if (roles.length) return `Krever tydelige nøkkelroller: ${roles.slice(0, 2).join(", ")}.`;
  return "Les systemet som roller og avstander, ikke bare tall.";
}
