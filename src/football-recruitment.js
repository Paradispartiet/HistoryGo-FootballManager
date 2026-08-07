// Recruitment v1: separates access to a player candidate from squad membership.
// Pure helpers only. No fees, contracts, wages, negotiations or transfer market simulation.

export const RECRUITMENT_STATE_VERSION = 1;

const STARTER_SQUAD_GROUPS = Object.freeze([
  { positions: ["GK"], count: 2 },
  { positions: ["CB", "LB", "RB", "WB"], count: 5 },
  { positions: ["DM", "CM", "AM"], count: 5 },
  { positions: ["ST", "LW", "RW"], count: 3 }
]);

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

export function buildStarterSquadPlayerIds(players = [], candidatePlayerIds = [], limit = 15) {
  const candidateIds = new Set(normalizePlayerIdList(candidatePlayerIds));
  const ordered = (Array.isArray(players) ? players : [])
    .filter((player) => player?.id && candidateIds.has(String(player.id)))
    .sort((a, b) => {
      const diff = (Number(a.classHeight) || 0) - (Number(b.classHeight) || 0);
      return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id));
    });
  const chosen = [];
  const used = new Set();
  const playsIn = (player, positions) => [
    ...(Array.isArray(player?.naturalPositions) ? player.naturalPositions : []),
    ...(Array.isArray(player?.usablePositions) ? player.usablePositions : [])
  ].some((position) => positions.includes(position));

  STARTER_SQUAD_GROUPS.forEach((group) => {
    let need = group.count;
    ordered.forEach((player) => {
      if (need <= 0 || chosen.length >= limit || used.has(player.id) || !playsIn(player, group.positions)) return;
      chosen.push(String(player.id));
      used.add(player.id);
      need -= 1;
    });
  });
  ordered.forEach((player) => {
    if (chosen.length >= limit || used.has(player.id)) return;
    chosen.push(String(player.id));
    used.add(player.id);
  });
  return chosen.slice(0, Math.max(0, Number(limit) || 0));
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

export function buildSquadPlayerIds({ starterPlayerIds = [], localStartPlayerIds = [], recruitedPlayerIds = [], eligibleCandidatePlayerIds = [] } = {}) {
  const starter = normalizePlayerIdList(starterPlayerIds);
  const local = normalizePlayerIdList(localStartPlayerIds);
  const eligible = new Set(normalizePlayerIdList(eligibleCandidatePlayerIds));
  const recruited = normalizePlayerIdList(recruitedPlayerIds).filter((id) => eligible.has(id));
  return [...new Set([...starter, ...local, ...recruited])];
}
