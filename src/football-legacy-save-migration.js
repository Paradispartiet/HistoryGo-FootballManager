// Manager Legacy Cleanup v1 — ren, idempotent save-migrering.
//
// Pass 7 fjerner tre tidligere FM-lignende systemer fra canonical teamMerits:
// nivåbaserte fasiliteter, fiktiv klubbøkonomi/kontrakter og overgangsmarked.
// Alle andre felt bevares uendret. Modulen kjenner ikke DOM eller motorer.

export const LEGACY_TEAM_MERITS_FIELDS = Object.freeze([
  "facilities",
  "clubEconomy",
  "transferMarket"
]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function migrateLegacyTeamMerits(input) {
  if (!isObject(input)) return { changed: false, merits: input, removedFields: [] };
  const merits = { ...input };
  const removedFields = [];
  LEGACY_TEAM_MERITS_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(merits, field)) return;
    delete merits[field];
    removedFields.push(field);
  });
  return { changed: removedFields.length > 0, merits, removedFields };
}

export function migrateLegacyModeEnvelope(input) {
  if (!isObject(input) || !isObject(input.sessions)) {
    return { changed: false, envelope: input, migratedModes: [] };
  }
  const sessions = { ...input.sessions };
  const migratedModes = [];
  Object.entries(sessions).forEach(([mode, session]) => {
    if (!isObject(session) || !isObject(session.teamMerits)) return;
    const migrated = migrateLegacyTeamMerits(session.teamMerits);
    if (!migrated.changed) return;
    sessions[mode] = { ...session, teamMerits: migrated.merits };
    migratedModes.push(mode);
  });
  return {
    changed: migratedModes.length > 0,
    envelope: migratedModes.length ? { ...input, sessions } : input,
    migratedModes
  };
}
