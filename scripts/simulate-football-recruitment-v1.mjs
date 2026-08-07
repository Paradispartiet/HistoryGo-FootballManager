import assert from "node:assert/strict";
import {
  RECRUITMENT_STATE_VERSION,
  buildSquadPlayerIds,
  buildStarterSquadPlayerIds,
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

check("eksisterende startgulv bygger en balansert 15-spillerstropp", () => {
  const positions = [
    "GK", "GK",
    "CB", "CB", "LB", "RB", "WB",
    "DM", "CM", "CM", "AM", "DM",
    "ST", "LW", "RW"
  ];
  const players = positions.map((position, index) => ({
    id: `starter_${index + 1}`,
    classHeight: 20 + index,
    naturalPositions: [position],
    usablePositions: []
  }));
  const ids = buildStarterSquadPlayerIds(players, players.map((player) => player.id), 15);
  assert.equal(ids.length, 15);
  assert.equal(new Set(ids).size, 15);
  assert.equal(ids.filter((id) => players.find((player) => player.id === id)?.naturalPositions.includes("GK")).length, 2);
});

check("kandidattilgang alene gjør ikke spilleren til troppsmedlem utover startgulvet", () => {
  const squad = buildSquadPlayerIds({
    starterPlayerIds: ["starter_1"],
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

check("rekruttert og fortsatt kvalifisert kandidat legges oppå starttroppen", () => {
  const squad = buildSquadPlayerIds({
    starterPlayerIds: ["starter_1"],
    recruitedPlayerIds: ["candidate_1"],
    eligibleCandidatePlayerIds: ["candidate_1", "candidate_2"]
  });
  assert.deepEqual(squad, ["starter_1", "candidate_1"]);
});

check("rekruttert id uten gyldig kandidattilgang slipper ikke gjennom", () => {
  const squad = buildSquadPlayerIds({
    starterPlayerIds: ["starter_1"],
    recruitedPlayerIds: ["candidate_without_source"],
    eligibleCandidatePlayerIds: ["candidate_1"]
  });
  assert.deepEqual(squad, ["starter_1"]);
});

check("eksplisitt lokal starttropp beholdes uavhengig av kandidatlisten", () => {
  const squad = buildSquadPlayerIds({
    localStartPlayerIds: ["local_1", "local_2"],
    recruitedPlayerIds: [],
    eligibleCandidatePlayerIds: []
  });
  assert.deepEqual(squad, ["local_1", "local_2"]);
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
