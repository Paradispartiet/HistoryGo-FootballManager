// HG Football Manager — Player Role Learning v1
// Ren view-model for kompakt rolleforståelse. Ingen DOM, fetch, storage eller sideeffekter.

import { calculatePlayerMatchFit } from "./football-fit-engine.js";
import { getFormationLearningHint } from "./football-formation-knowledge-view-model.js";

function asArray(value) { return Array.isArray(value) ? value : []; }
function firstNonEmpty(...lists) { return lists.flat().filter(Boolean).slice(0, 3); }
function fmt(value) { return String(value || "").replace(/_/g, " ").trim(); }
function cap(value) { const text = fmt(value); return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }
function unique(values) { return [...new Set(asArray(values).filter(Boolean))]; }
function overlap(a, b) { const s = new Set(asArray(b)); return asArray(a).filter((item) => s.has(item)); }

const ROLE_NEEDS = {
  wide_dribbler: "trenger støtte/overlapp så han ikke blir isolert",
  inverted_winger: "trenger overlapp og løp i boksen når han går innover",
  linking_striker: "trenger løp rundt seg når han møter ball",
  false_nine: "trenger løp foran seg som angriper rommet han åpner",
  target_striker: "trenger innlegg, andreballer og service i boksen",
  classic_ten: "trenger sluttprodukt og løp foran seg",
  free_creator: "trenger sluttprodukt foran seg og struktur bak seg",
  deep_playmaker: "trenger pasningsvinkler og beskyttelse rundt sonen sin",
  regista: "trenger beskyttelse bak/ved siden av seg",
  wingback: "trenger sikring bak seg når han gir bredde høyt",
  overlapping_fullback: "trenger sikring bak seg og kant foran seg å støtte",
  pressing_forward: "trenger ettertrykk fra midtbanen bak presset"
};

function relationTexts(relationships, roleId, type) {
  const key = type === "positive" ? "positiveRelations" : "negativeRelations";
  return asArray(relationships?.[key])
    .filter((relation) => asArray(relation.roleIds).includes(roleId))
    .sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0))
    .map((relation) => relation.title ? `${relation.title}: ${relation.explanation}` : relation.explanation)
    .filter(Boolean)
    .slice(0, 2);
}

function buildManagerHint({ role, fit, relationships, formationKnowledge }) {
  const negative = relationTexts(relationships, role.id, "negative")[0];
  if (fit?.misusePenalty >= 24) return "Endre rolle/posisjon eller taktikk slik at spilleren får brukt styrkene sine — dette er managerens ansvar.";
  if (negative) return "Løs relasjonen rundt rollen før du bytter spilleren ut.";
  const formationHint = getFormationLearningHint(formationKnowledge);
  if (formationHint) return formationHint;
  if (ROLE_NEEDS[role.id]) return `Gi rollen det den trenger: ${ROLE_NEEDS[role.id]}.`;
  return "Behold rollen hvis den gir spilleren kjente styrker og tydelige medspillere rundt seg.";
}

export function createRoleLearningViewModel({ player, role, slot, tactic, roles, relationships, formationKnowledge, fit } = {}) {
  if (!player || !role || !slot) return null;
  const calculatedFit = fit || (tactic ? calculatePlayerMatchFit(player, { position: slot.position }, role, tactic, asArray(roles)) : null);
  const usedStrengths = firstNonEmpty(overlap(player.strengths, role.requires), overlap(player.needs, role.requires), overlap(player.likesTactics, role.tacticalLikes));
  const lost = calculatedFit?.misusePenalty >= 18
    ? firstNonEmpty(overlap(player.strengths, role.badFor), player.warningWhenMisused ? [player.warningWhenMisused] : [], player.strengths)
    : firstNonEmpty(overlap(player.dislikesTactics, role.tacticalLikes), overlap(player.strengths, role.tacticalDislikes));
  const positiveRelations = relationTexts(relationships, role.id, "positive");
  const negativeRelations = relationTexts(relationships, role.id, "negative");
  const relationNeed = ROLE_NEEDS[role.id] ? [ROLE_NEEDS[role.id]] : asArray(role.goodWith).slice(0, 2).map((item) => `fungerer bedre med ${fmt(item)}`);
  const alternativeRoles = unique(asArray(player.preferredRoles))
    .filter((id) => id !== role.id)
    .map((id) => asArray(roles).find((item) => item.id === id)?.name || id)
    .slice(0, 3);

  return {
    playerId: player.id,
    playerName: player.name || player.id,
    roleId: role.id,
    roleName: role.name || role.id,
    playerType: asArray(player.archetypes).slice(0, 3).map(cap).join(" · ") || "Fleksibel spiller",
    roleCore: asArray(role.requires).slice(0, 4).map(cap),
    fitLabel: calculatedFit?.status || "ukjent",
    fitScore: calculatedFit?.matchScore ?? null,
    usesStrengths: usedStrengths.map(cap),
    losesStrengths: lost.map((item) => item.includes(" ") ? item : cap(item)),
    relationNeeds: [...relationNeed, ...positiveRelations].slice(0, 3),
    relationWarnings: negativeRelations,
    misuseExplanation: calculatedFit?.misusePenalty >= 18 ? (calculatedFit.warnings?.[0] || calculatedFit.explanation) : "Ingen tydelig feilbruk — rollen gir spilleren relevante situasjoner.",
    formationRoleHint: getFormationLearningHint(formationKnowledge) || "",
    managerHint: buildManagerHint({ role, fit: calculatedFit, relationships, formationKnowledge }),
    alternativeRoles
  };
}

export function createMatchRoleLearningPoints({ teamFit, relationships } = {}) {
  const assignments = asArray(teamFit?.assignments).filter((item) => item?.isComplete && item.fit && item.role);
  const misused = assignments
    .filter((item) => item.fit.misusePenalty >= 22 || item.fit.status === "feilbrukt")
    .sort((a, b) => (b.fit.misusePenalty || 0) - (a.fit.misusePenalty || 0))[0];
  if (misused) {
    const vm = createRoleLearningViewModel({ player: misused.player, role: misused.role, slot: misused.slot, fit: misused.fit, roles: assignments.map((a) => a.role), relationships });
    return [`${misused.role.name}: ${vm.managerHint}`];
  }
  const negative = asArray(relationships?.negativeRelations).sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0))[0];
  if (negative) return [`${negative.title}: ${negative.explanation}`];
  return [];
}
