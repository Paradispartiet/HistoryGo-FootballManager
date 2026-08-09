import {
  buildClubScoutingRows,
  buildRecruitablePlayers,
  filterClubScoutingRows,
  filterRecruitablePlayers
} from "../src/ui/manager-scouting-workspace-v1.js";

const checks = [];
const check = (label, ok, detail = "") => checks.push({ label, ok: Boolean(ok), detail });

const players = [
  { id: "maker", name: "Maker", nationality: "Norge", naturalPositions: ["AM"], usablePositions: ["CM"], preferredRoles: ["classic_ten"], sourcePlaceIds: ["ground_a"], clubAffiliations: [{ clubId: "ours", relation: "played_for", status: "club_profile", source: "belagt" }] },
  { id: "stopper", name: "Stopper", nationality: "Norge", naturalPositions: ["CB"], usablePositions: [], preferredRoles: ["stopper"], sourcePlaceIds: ["ground_b"], clubAffiliations: [{ clubId: "other", relation: "played_for", status: "club_profile", source: "belagt" }] },
  { id: "runner", name: "Runner", nationality: "Norge", naturalPositions: ["ST"], usablePositions: [], preferredRoles: ["advanced_forward"], sourcePlaceIds: ["ground_a"], clubAffiliations: [{ clubId: "ours", relation: "played_for", status: "squad_profile", source: "utledet" }] },
  { id: "tourist", name: "Tourist", nationality: "Norge", naturalPositions: ["CM"], usablePositions: [], preferredRoles: [], sourcePlaceIds: ["ground_b"] }
];

const unlockData = {
  placeUnlocks: [
    { placeId: "ground_a", placeName: "Ground A", unlocks: [{ type: "player_candidate", targetId: "maker" }, { type: "player_candidate", targetId: "runner" }] },
    { placeId: "ground_b", placeName: "Ground B", unlocks: [{ type: "player_candidate", targetId: "stopper" }] }
  ]
};

// Denne simuleringen tester stedskilden isolert. En eksplisitt lokal startmarkør
// slår av auto-starttroppen her; selve 15-spillers startgulvet testes i
// simulate-football-recruitment-v1.mjs.
const recruitable = buildRecruitablePlayers({
  players,
  unlockData,
  merits: {
    recruitmentVersion: 1,
    recruitedPlayerIds: [],
    unlockedPlaceIds: ["ground_a"],
    localStart: { playerIds: ["fixture_local_start"] }
  },
  visitedPlaceIds: []
});
check("kun spillere fra åpnet sted er rekrutterbare", recruitable.length === 2, String(recruitable.length));
check("stedskilden følger spilleren", recruitable.every((row) => row.sourceLabel === "Ground A"));
check("posisjonsfilter virker", filterRecruitablePlayers(recruitable, { position: "ST" })[0]?.id === "runner");
check("søk virker", filterRecruitablePlayers(recruitable, { query: "maker" })[0]?.id === "maker");
check("ingen overall introduseres", recruitable.every((row) => !Object.hasOwn(row, "overall")));

const clubs = [
  { id: "ours", name: "Vår klubb", city: "Oslo", ground: "Ground A", tier: "top", homePlaceId: "ground_a" },
  { id: "other", name: "Andre FK", city: "Bergen", ground: "Ground B", tier: "top", homePlaceId: "ground_b" }
];
const clubRows = buildClubScoutingRows({ clubs, players, currentClubId: "ours", tierNames: { top: "Toppdivisjon" } });
check("egen klubb filtreres bort", clubRows.length === 1 && clubRows[0].id === "other", clubRows.map((row) => row.id).join(","));
check("andre klubb får dokumentert spillerpool", clubRows[0].candidates.length === 1 && clubRows[0].candidates[0].id === "stopper");
check("sourcePlaceIds alene gir ikke klubbmedlemskap", !clubRows[0].candidates.some((player) => player.id === "tourist"));
check("klubbsøk virker", filterClubScoutingRows(clubRows, { query: "bergen" }).length === 1);
check("nivåfilter virker", filterClubScoutingRows(clubRows, { tier: "top" }).length === 1);

const failed = checks.filter((entry) => !entry.ok);
checks.forEach((entry) => console.log(`${entry.ok ? "✓" : "✗"} ${entry.label}${entry.detail ? ` — ${entry.detail}` : ""}`));
if (failed.length) {
  console.error(`\n✗ Speiding v1 feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Speiding v1: ${checks.length}/${checks.length}`);
