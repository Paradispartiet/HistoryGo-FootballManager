// Recruitment v1: separates access to a player candidate from squad membership.
// Pure helpers only. No fees, contracts, wages, negotiations or transfer market simulation.

export const RECRUITMENT_STATE_VERSION = 1;

export function normalizePlayerIdList(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id) => typeof id === "string").map((id) => id.trim()))].filter(Boolean)
    : [];
}

export function normalizeRecruitmentState(merits = {}) {
  const base = merits && typeof merits === "object" && !Array.isArray(merits) ? merits : {};
  return {
    recruitmentVersion: Number(base.recruitmentVersion) === RECRUITMENT_STATE_VERSION
      ? RECRUITMENT_STATE_VERSION
      : 0,
    recruitedPlayerIds: normalizePlayerIdList(base.recruitedPlayerIds)
  };
}

export function recruitPlayerToMerits(merits, playerId) {
  const base = merits && typeof merits === "object" && !Array.isArray(merits) ? merits : {};
  const id = typeof playerId === "string" ? playerId.trim() : "";
  const current = normalizeRecruitmentState(base);
  if (!id) {
    return { merits: { ...base, ...current }, changed: false };
  }
  const nextIds = normalizePlayerIdList([...current.recruitedPlayerIds, id]);
  return {
    merits: {
      ...base,
      recruitmentVersion: RECRUITMENT_STATE_VERSION,
      recruitedPlayerIds: nextIds
    },
    changed: !current.recruitedPlayerIds.includes(id) || current.recruitmentVersion !== RECRUITMENT_STATE_VERSION
  };
}

export function migrateLegacyRecruitmentState(merits, eligibleCandidatePlayerIds = []) {
  const base = merits && typeof merits === "object" && !Array.isArray(merits) ? merits : {};
  const current = normalizeRecruitmentState(base);
  if (current.recruitmentVersion === RECRUITMENT_STATE_VERSION) {
    return { merits: { ...base, ...current }, migrated: false };
  }
  // Before recruitment v1 every eligible History Go candidate was automatically
  // usable in the squad. Preserve that exact roster once for existing saves.
  const recruitedPlayerIds = normalizePlayerIdList([
    ...current.recruitedPlayerIds,
    ...normalizePlayerIdList(eligibleCandidatePlayerIds)
  ]);
  return {
    merits: {
      ...base,
      recruitmentVersion: RECRUITMENT_STATE_VERSION,
      recruitedPlayerIds
    },
    migrated: true
  };
}

export function buildSquadPlayerIds({ localStartPlayerIds = [], recruitedPlayerIds = [], eligibleCandidatePlayerIds = [] } = {}) {
  const local = normalizePlayerIdList(localStartPlayerIds);
  const eligible = new Set(normalizePlayerIdList(eligibleCandidatePlayerIds));
  const recruited = normalizePlayerIdList(recruitedPlayerIds).filter((id) => eligible.has(id));
  return [...new Set([...local, ...recruited])];
}
