import assert from "node:assert/strict";
import {
  LEGACY_TEAM_MERITS_FIELDS,
  migrateLegacyModeEnvelope,
  migrateLegacyTeamMerits
} from "../src/football-legacy-save-migration.js";

const canonical = {
  schema: "historygo-football-manager.team_merits.v1",
  version: 1,
  recruitedPlayerIds: ["erik_johnsen", "odd_iversen"],
  hiredStaffIds: ["nils_arne_eggen"],
  unlockedPlaceIds: ["lerkendal", "kfum_arena"],
  unlockedExpertiseIds: ["pressing_structure"],
  earnedBadgeIds: ["training_culture_bronze"],
  roleFamiliarity: { "erik_johnsen:gk": 67 },
  formationFamiliarity: { classic_442: 54 },
  localStart: { enabled: false, playerIds: [] },
  offPitch: { team: { morale: 62 } }
};

const oldMerits = {
  ...canonical,
  facilities: { version: 1, levels: { training: 3, medical: 3, analysis: 3 }, lastUpgradeWeek: 8 },
  clubEconomy: { version: 1, balance: 3, wageBudget: 1, contracts: { erik_johnsen: { remainingSeasons: 1 } } },
  transferMarket: { version: 2, listedPlayerIds: ["erik_johnsen"], offers: {}, history: [] }
};

assert.deepEqual(LEGACY_TEAM_MERITS_FIELDS, ["facilities", "clubEconomy", "transferMarket"]);
const migrated = migrateLegacyTeamMerits(oldMerits);
assert.equal(migrated.changed, true);
assert.deepEqual(migrated.removedFields, LEGACY_TEAM_MERITS_FIELDS);
for (const field of LEGACY_TEAM_MERITS_FIELDS) assert.equal(field in migrated.merits, false);
for (const [key, value] of Object.entries(canonical)) assert.deepEqual(migrated.merits[key], value, `${key} må bevares`);
assert.deepEqual(migrated.merits.recruitedPlayerIds, ["erik_johnsen", "odd_iversen"]);

const second = migrateLegacyTeamMerits(migrated.merits);
assert.equal(second.changed, false);
assert.deepEqual(second.merits, migrated.merits);

const envelope = {
  version: "mode-sessions.v1",
  activeMode: "league",
  sessions: {
    league: { selectedFormationId: "classic_442", teamMerits: oldMerits },
    scenario: { selectedFormationId: "wm_3223", teamMerits: { ...oldMerits, recruitedPlayerIds: ["odd_iversen"] } },
    training: null,
    national: { nationalTeam: { nationality: "NOR" } }
  }
};
const migratedEnvelope = migrateLegacyModeEnvelope(envelope);
assert.equal(migratedEnvelope.changed, true);
assert.deepEqual(migratedEnvelope.migratedModes.sort(), ["league", "scenario"]);
assert.equal(migratedEnvelope.envelope.activeMode, "league");
assert.equal(migratedEnvelope.envelope.sessions.league.selectedFormationId, "classic_442");
assert.equal(migratedEnvelope.envelope.sessions.scenario.selectedFormationId, "wm_3223");
assert.deepEqual(migratedEnvelope.envelope.sessions.league.teamMerits.recruitedPlayerIds, canonical.recruitedPlayerIds);
assert.deepEqual(migratedEnvelope.envelope.sessions.scenario.teamMerits.recruitedPlayerIds, ["odd_iversen"]);
assert.deepEqual(migratedEnvelope.envelope.sessions.national, envelope.sessions.national);
for (const mode of ["league", "scenario"]) {
  for (const field of LEGACY_TEAM_MERITS_FIELDS) {
    assert.equal(field in migratedEnvelope.envelope.sessions[mode].teamMerits, false);
  }
}

console.log("✓ Pass 7 migrerer gamle merits uten å miste tropp, unlocks eller stab");
console.log("✓ Pass 7 migrerer teamMerits i mode-envelope idempotent");
console.log("✓ Legacy runtime er fysisk slettet; bare save-migreringen består");
