import assert from "node:assert/strict";
import {
  RECRUITMENT_STATE_VERSION,
  buildSquadPlayerIds,
  migrateLegacyRecruitmentState,
  normalizeRecruitmentState,
  recruitPlayerToMerits
} from "../src/football-recruitment.js";

let checks = 0;
function check(label, fn) {
  fn();
  checks += 1;
  console.log(`✓ ${label}`);
}

check("ny state starter uten automatisk rekruttering", () => {
  const state = normalizeRecruitmentState({ recruitmentVersion: 1, recruitedPlayerIds: [] });
  assert.equal(state.recruitmentVersion, RECRUITMENT_STATE_VERSION);
  assert.deepEqual(state.recruitedPlayerIds, []);
});

check("kandidattilgang alene gjør ikke spilleren til troppsmedlem", () => {
  const squad = buildSquadPlayerIds({
    localStartPlayerIds: ["starter_1"],
    recruitedPlayerIds: [],
    eligibleCandidatePlayerIds: ["candidate_1"]
  });
  assert.deepEqual(squad, ["starter_1"]);
});

check("rekruttering legger kandidaten i teamMerits én gang", () => {
  const first = recruitPlayerToMerits({ recruitmentVersion: 1, recruitedPlayerIds: [] }, "candidate_1");
  const second = recruitPlayerToMerits(first.merits, "candidate_1");
  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.deepEqual(second.merits.recruitedPlayerIds, ["candidate_1"]);
});

check("rekruttert og fortsatt kvalifisert kandidat blir troppsmedlem", () => {
  const squad = buildSquadPlayerIds({
    localStartPlayerIds: ["starter_1"],
    recruitedPlayerIds: ["candidate_1"],
    eligibleCandidatePlayerIds: ["candidate_1", "candidate_2"]
  });
  assert.deepEqual(squad, ["starter_1", "candidate_1"]);
});

check("rekruttert id uten gyldig kandidattilgang slipper ikke gjennom", () => {
  const squad = buildSquadPlayerIds({
    localStartPlayerIds: ["starter_1"],
    recruitedPlayerIds: ["candidate_without_source"],
    eligibleCandidatePlayerIds: ["candidate_1"]
  });
  assert.deepEqual(squad, ["starter_1"]);
});

check("lokal starttropp beholdes uavhengig av kandidatlisten", () => {
  const squad = buildSquadPlayerIds({
    localStartPlayerIds: ["starter_1", "starter_2"],
    recruitedPlayerIds: [],
    eligibleCandidatePlayerIds: []
  });
  assert.deepEqual(squad, ["starter_1", "starter_2"]);
});

check("gamle saves migreres én gang og beholder tidligere spillbare kandidater", () => {
  const migration = migrateLegacyRecruitmentState(
    { unlockedPlaceIds: ["ground_1"] },
    ["candidate_1", "candidate_2"]
  );
  assert.equal(migration.migrated, true);
  assert.equal(migration.merits.recruitmentVersion, 1);
  assert.deepEqual(migration.merits.recruitedPlayerIds, ["candidate_1", "candidate_2"]);
  const again = migrateLegacyRecruitmentState(migration.merits, ["candidate_3"]);
  assert.equal(again.migrated, false);
  assert.deepEqual(again.merits.recruitedPlayerIds, ["candidate_1", "candidate_2"]);
});

check("nye saves med v1 migrerer ikke kandidater automatisk", () => {
  const migration = migrateLegacyRecruitmentState(
    { recruitmentVersion: 1, recruitedPlayerIds: [] },
    ["candidate_1"]
  );
  assert.equal(migration.migrated, false);
  assert.deepEqual(migration.merits.recruitedPlayerIds, []);
});

console.log(`\n✓ Rekruttering v1 simulering: ${checks}/${checks}`);
