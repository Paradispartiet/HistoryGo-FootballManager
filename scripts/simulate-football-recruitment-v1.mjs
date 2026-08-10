import assert from "node:assert/strict";
import {
  PLAYER_POOL_SQUAD_STATE_VERSION,
  buildSelectedSquadPlayerIds,
  migrateLegacyPlayerPoolSquadState,
  normalizePlayerPoolSquadState,
  setPlayerSquadMembership
} from "../src/football-recruitment.js";
import { buildPlayerPoolSquadRows } from "../src/ui/manager-player-pool-squad-v1.js";

let checks = 0;
function check(label, fn) { fn(); checks += 1; console.log(`✓ ${label}`); }

check("canonical state normaliserer og dedupliserer troppen", () => {
  const state = normalizePlayerPoolSquadState({ playerPoolSquadVersion: 1, squadPlayerIds: ["a", "a", " b ", null] });
  assert.equal(state.playerPoolSquadVersion, PLAYER_POOL_SQUAD_STATE_VERSION);
  assert.deepEqual(state.squadPlayerIds, ["a", "b"]);
});

check("spiller kan velges inn uten troppsgrense", () => {
  const initial = { playerPoolSquadVersion: 1, squadPlayerIds: Array.from({ length: 30 }, (_, index) => `p${index}`) };
  const result = setPlayerSquadMembership(initial, "p30", true);
  assert.equal(result.changed, true);
  assert.equal(result.merits.squadPlayerIds.length, 31);
});

check("samme spiller legges ikke inn to ganger", () => {
  const first = setPlayerSquadMembership({ playerPoolSquadVersion: 1, squadPlayerIds: [] }, "a", true);
  const second = setPlayerSquadMembership(first.merits, "a", true);
  assert.equal(second.changed, false);
  assert.deepEqual(second.merits.squadPlayerIds, ["a"]);
});

check("spiller kan tas ut uten å fjernes fra andre merits", () => {
  const result = setPlayerSquadMembership({ playerPoolSquadVersion: 1, squadPlayerIds: ["a", "b"], earnedBadgeIds: ["badge"] }, "a", false);
  assert.deepEqual(result.merits.squadPlayerIds, ["b"]);
  assert.deepEqual(result.merits.earnedBadgeIds, ["badge"]);
});

check("bare spillere som fortsatt finnes i poolen blir spillbare", () => {
  const selected = buildSelectedSquadPlayerIds({ squadPlayerIds: ["a", "gone", "b"], eligiblePoolPlayerIds: ["a", "b", "c"] });
  assert.deepEqual(selected, ["a", "b"]);
});

check("et nytt poolfunn blir ikke automatisk troppsmedlem", () => {
  const selected = buildSelectedSquadPlayerIds({ squadPlayerIds: ["a"], eligiblePoolPlayerIds: ["a", "new"] });
  assert.deepEqual(selected, ["a"]);
});

check("legacy save migrerer nøyaktig tidligere spillbar tropp", () => {
  const migration = migrateLegacyPlayerPoolSquadState(
    { recruitmentVersion: 1, recruitedPlayerIds: ["recruited"], unlockedPlaceIds: ["ground"] },
    ["starter", "heritage", "recruited"]
  );
  assert.equal(migration.migrated, true);
  assert.equal(migration.merits.playerPoolSquadVersion, 1);
  assert.deepEqual(migration.merits.squadPlayerIds, ["starter", "heritage", "recruited"]);
  assert.deepEqual(migration.merits.recruitedPlayerIds, ["recruited"]);
});

check("canonical save migreres ikke på nytt når poolen vokser", () => {
  const first = migrateLegacyPlayerPoolSquadState({}, ["starter"]);
  const second = migrateLegacyPlayerPoolSquadState(first.merits, ["starter", "new"]);
  assert.equal(second.migrated, false);
  assert.deepEqual(second.merits.squadPlayerIds, ["starter"]);
});

check("UI-modellen viser valgt tropp først og beholder poolalternativer", () => {
  const players = [
    { id: "selected", name: "Valgt", naturalPositions: ["CB"] },
    { id: "alternative", name: "Alternativ", naturalPositions: ["ST"] }
  ];
  const rows = buildPlayerPoolSquadRows({
    players,
    unlockData: { placeUnlocks: [{ placeId: "ground", placeName: "Banen", unlocks: [{ type: "player_candidate", targetId: "alternative" }] }] },
    merits: { playerPoolSquadVersion: 1, squadPlayerIds: ["selected"], unlockedPlaceIds: ["ground"], localStart: { playerIds: ["selected"] } }
  });
  assert.deepEqual(rows.map((row) => [row.id, row.inSquad]), [["selected", true], ["alternative", false]]);
});

check("quiz-porten holder et nytt History Go-funn utenfor poolen", () => {
  const rows = buildPlayerPoolSquadRows({
    players: [{ id: "locked", name: "Låst", naturalPositions: ["CM"] }],
    unlockData: { placeUnlocks: [{ placeId: "ground", unlocks: [{ type: "player_candidate", targetId: "locked" }] }] },
    clubs: [{ id: "ours", name: "Vår klubb", homePlaceId: "club_ground" }],
    start: { takeoverClubId: "ours" },
    merits: { playerPoolSquadVersion: 1, squadPlayerIds: [] },
    visitedPlaceIds: new Set(["ground"]),
    quizCompletedPlaceIds: new Set()
  });
  assert.deepEqual(rows, []);
});

console.log(`\n✓ Min spillerpool → Tropp v1 simulering: ${checks}/${checks}`);
