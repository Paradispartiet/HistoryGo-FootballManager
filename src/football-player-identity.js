// A single historical player must have a single playable identity.
// Older saves and History Go integrations used nana_boateng before the
// Bismark Adjei-Boateng / "Nana" identification was resolved.
// Keep this migration intentionally small; it does not invent player skills.
export const CANONICAL_BOATENG_ID = "bismark_adjei_boateng";
export const LEGACY_BOATENG_ID = "nana_boateng";
export const PLAYER_ID_ALIASES = Object.freeze({
  [LEGACY_BOATENG_ID]: CANONICAL_BOATENG_ID
});

// The raw historic catalogue can retain a legacy record during migration;
// only its canonical identity may enter gameplay, pools and lineup selection.
export function normalizePlayablePlayerCatalog(players) {
  if (!Array.isArray(players)) return [];
  const canonicalExists = players.some((player) => player?.id === CANONICAL_BOATENG_ID);
  const selected = new Set();
  return players.filter((player) => {
    if (!player || typeof player.id !== "string") return false;
    if (canonicalExists && player.id === LEGACY_BOATENG_ID) return false;
    const id = canonicalPlayerId(player.id);
    if (selected.has(id)) return false;
    selected.add(id);
    return true;
  }).map((player) => {
    const canonical = player.id === LEGACY_BOATENG_ID
      ? { ...player, id: CANONICAL_BOATENG_ID, name: "Bismark Adjei-Boateng" }
      : player;
    // Colorado Rapids' own player profile records citizenship as Ghana.
    // The historic catalogue incorrectly says Norge for both old entries.
    return canonical.id === CANONICAL_BOATENG_ID
      ? { ...canonical, nationality: "Ghana" }
      : canonical;
  });
}

export function canonicalPlayerId(value) {
  return typeof value === "string" ? (PLAYER_ID_ALIASES[value] || value) : value;
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonicalKey(key, context) {
  const parts = key.split("::");
  const mapped = parts.map(canonicalPlayerId);
  // Partnerships are symmetric and never relate a player to themselves.
  if (context === "playerPartnerships" && mapped.length === 2) {
    if (mapped[0] === mapped[1]) return null;
    return mapped.sort().join("::");
  }
  return mapped.join("::");
}

function mergePlayerRows(rows, type) {
  const output = [];
  const seen = new Map();
  for (const entry of rows) {
    if (!isObject(entry) || typeof entry.playerId !== "string") {
      output.push(entry);
      continue;
    }
    const id = entry.playerId;
    if (!seen.has(id)) {
      seen.set(id, output.length);
      output.push(entry);
      continue;
    }
    const index = seen.get(id);
    const previous = output[index];
    if (type === "playerCondition") {
      const injuries = [previous.injury, entry.injury].filter(isObject);
      const injury = injuries.sort((a, b) => (Number(b.weeksOut) || 0) - (Number(a.weeksOut) || 0))[0] || null;
      output[index] = {
        ...previous,
        name: id === CANONICAL_BOATENG_ID ? "Bismark Adjei-Boateng" : previous.name,
        load: Math.max(Number(previous.load) || 0, Number(entry.load) || 0),
        matchesPlayed: (Number(previous.matchesPlayed) || 0) + (Number(entry.matchesPlayed) || 0),
        minutesPlayed: (Number(previous.minutesPlayed) || 0) + (Number(entry.minutesPlayed) || 0),
        consecutiveFullMatches: Math.max(Number(previous.consecutiveFullMatches) || 0, Number(entry.consecutiveFullMatches) || 0),
        injury
      };
    } else {
      // Two old profile rows may each own recorded appearances/goals.
      // Combine their recorded history, never silently discard either row.
      const next = { ...previous, name: id === CANONICAL_BOATENG_ID ? "Bismark Adjei-Boateng" : previous.name };
      for (const field of ["appearances", "minutes", "goals", "assists"]) {
        next[field] = (Number(previous[field]) || 0) + (Number(entry[field]) || 0);
      }
      next.points = next.goals + next.assists;
      output[index] = next;
    }
  }
  return output;
}

function migrateValue(value, context = "") {
  if (typeof value === "string") return canonicalPlayerId(value);
  if (Array.isArray(value)) {
    const items = value.map((item) => migrateValue(item, context));
    if (/(?:PlayerIds|playerIds|player_ids|playerIDs)$/.test(context)) {
      return [...new Set(items)];
    }
    if (items.some((item) => isObject(item) && item.playerId === CANONICAL_BOATENG_ID)) {
      if (context === "rows" || context === "playerCondition") return mergePlayerRows(items, context);
    }
    return items;
  }
  if (!isObject(value)) return value;

  const result = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = canonicalKey(rawKey, context);
    if (key === null) continue;
    const updated = migrateValue(rawValue, key);
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const existing = result[key];
      if (typeof existing === "number" && typeof updated === "number") {
        // Familiarity/progress must not reset; partnership continuity is capped.
        result[key] = context === "playerPartnerships"
          ? Math.min(30, Math.max(existing, updated))
          : Math.max(existing, updated);
      } else if (Array.isArray(existing) && Array.isArray(updated)) {
        result[key] = [...new Set([...existing, ...updated])];
      } else if (isObject(existing) && isObject(updated)) {
        result[key] = { ...existing, ...updated };
      } else {
        // Preserve the canonical entry when a legacy and canonical key coexist.
        if (rawKey === key) result[key] = updated;
      }
    } else {
      result[key] = updated;
    }
  }

  if (result.playerId === CANONICAL_BOATENG_ID && value.playerId === LEGACY_BOATENG_ID && result.name === "Nana Boateng") {
    result.name = "Bismark Adjei-Boateng";
  }
  if (result.scorerId === CANONICAL_BOATENG_ID && value.scorerId === LEGACY_BOATENG_ID && result.scorerName === "Nana Boateng") {
    result.scorerName = "Bismark Adjei-Boateng";
  }
  if (result.assistId === CANONICAL_BOATENG_ID && value.assistId === LEGACY_BOATENG_ID && result.assistName === "Nana Boateng") {
    result.assistName = "Bismark Adjei-Boateng";
  }
  if (context === "lineup") {
    // A player cannot occupy two slots merely because two historical IDs
    // used to be available. Leave the second slot empty for the manager.
    const occupied = new Set();
    for (const slot of Object.values(result)) {
      if (!isObject(slot) || !slot.playerId) continue;
      if (occupied.has(slot.playerId)) slot.playerId = null;
      else occupied.add(slot.playerId);
    }
  }
  return result;
}

export function migratePlayerIdReferences(value) {
  return migrateValue(value);
}

// Migrate *existing* manager saves before startup hydrates the league and
// the separate mode envelope. Leave History Go's own place/quiz data alone.
// No version bump or deletion of old keys: migration is idempotent.
export function migrateSavedPlayerIdentityStorage(storage) {
  if (!storage) return { changedKeys: [], failedKeys: [] };
  const changedKeys = [];
  const failedKeys = [];
  let keys;
  try {
    keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  } catch (_) {
    return { changedKeys, failedKeys };
  }
  for (const key of keys) {
    if (typeof key !== "string" ||
        !(key.startsWith("hgfm.") || key.startsWith("historygo-football-manager."))) continue;
    try {
      const raw = storage.getItem(key);
      if (typeof raw !== "string" || !raw.includes(LEGACY_BOATENG_ID)) continue;
      const parsed = JSON.parse(raw);
      const next = JSON.stringify(migratePlayerIdReferences(parsed));
      if (next === raw) continue;
      storage.setItem(key, next);
      changedKeys.push(key);
    } catch (_) {
      // Bad JSON or write failures never invalidate the user's original save.
      failedKeys.push(key);
    }
  }
  return { changedKeys, failedKeys };
}
