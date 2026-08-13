const list = (value) => Array.isArray(value) ? value : [];

export function reconcileClubBaseSquadSave({ localStart = null, access = null } = {}) {
  if (!localStart || typeof localStart !== "object" || localStart.source !== "auto_squad" || !access?.clubId) {
    return { changed: false, localStart, reason: null, message: "" };
  }

  const current = list(localStart.playerIds).filter((id) => typeof id === "string");
  const nextState = (enabled, playerIds) => ({
    ...localStart,
    enabled,
    clubId: access.clubId,
    poolVersion: access.version,
    generatedFrom: "club_pool",
    playerIds
  });

  if (access.mode !== "base") {
    const changed = Boolean(localStart.enabled || current.length);
    return {
      changed,
      reason: changed ? "pool_state" : null,
      message: changed ? `${access.clubId}: automatisk grunntropp er ryddet mot gjeldende klubbpool.` : "",
      localStart: nextState(false, [])
    };
  }

  const expected = list(access.baseSquad);
  const expectedSet = new Set(expected);
  const foreign = current.filter((id) => !expectedSet.has(id));
  const stale = localStart.clubId !== access.clubId
    || localStart.poolVersion !== access.version
    || localStart.generatedFrom !== "club_pool"
    || current.length !== expected.length
    || current.some((id, index) => id !== expected[index]);

  if (!stale) return { changed: false, localStart, reason: null, message: "" };
  return {
    changed: true,
    reason: foreign.length ? "foreign_players" : "pool_version",
    message: foreign.length
      ? `${access.clubId}: profiler utenfor klubbpoolen er fjernet fra grunntroppen.`
      : `${access.clubId}: grunntroppen er oppdatert til gjeldende klubbpool.`,
    localStart: nextState(true, expected)
  };
}
