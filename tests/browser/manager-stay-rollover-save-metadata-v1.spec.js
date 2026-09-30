import { expect, test } from "@playwright/test";
import { createLeagueSeason } from "../../src/football-league-season.js";
import { deriveClubExpectation } from "../../src/football-club-selection.js";
import { deriveSeasonTarget } from "../../src/football-season-review.js";

function completedStaySeason() {
  const tier = {
    id: "eliteserien",
    name: "Eliteserien",
    level: 1,
    clubCount: 4,
    groupSize: 4,
    groups: 1,
    rounds: 6,
    promotion: null,
    relegation: { toTier: "obosligaen", direct: 1, playoff: 1 }
  };
  // Bevisst svakere enn klubbene i den virkelige Eliteserien-pyramiden:
  // same-tier-målet etter 2.-plass skal derfor avvike fra klubbens styrkebaserte mål.
  const managerClub = { id: "rosenborg", name: "Rosenborg", tier: "eliteserien", strength: 60 };
  const opponents = [
    { id: "brann", name: "Brann", tier: "eliteserien", strength: 80 },
    { id: "viking", name: "Viking", tier: "eliteserien", strength: 79 },
    { id: "molde", name: "Molde", tier: "eliteserien", strength: 78 }
  ];

  const season = createLeagueSeason({
    managerClub,
    opponents,
    tier,
    seed: "browser-stay-rollover-save-metadata",
    seasonNumber: 1
  });

  season.status = "completed";
  season.currentRound = season.competition.rounds;
  season.completedMatchIds = [];
  season.fixtures.forEach((round) => {
    round.status = "completed";
    round.matches.forEach((match) => {
      const home = match.homeClubId;
      const away = match.awayClubId;
      let homeGoals = 0;
      let awayGoals = 0;

      if (home === "brann" || away === "brann") {
        homeGoals = home === "brann" ? 3 : 0;
        awayGoals = away === "brann" ? 3 : 0;
      } else if (home === "rosenborg" || away === "rosenborg") {
        homeGoals = home === "rosenborg" ? 2 : 0;
        awayGoals = away === "rosenborg" ? 2 : 0;
      }

      match.status = "completed";
      match.result = { homeGoals, awayGoals, simulated: home !== "rosenborg" && away !== "rosenborg" };
      season.completedMatchIds.push(match.id);
    });
  });

  return season;
}

test("stay-rollover synkroniserer league-save metadata og overlever reload", async ({ page }) => {
  const season = completedStaySeason();
  const gameStart = {
    selectedMode: "league",
    activeLeagueSaveId: "stay_rollover_save_metadata_ui",
    clubName: "Rosenborg",
    takeoverClubId: "rosenborg",
    managerName: "Manager",
    leagueName: "Eliteserien",
    seasonLabel: "Sesong 1",
    leagueSeasonStatus: "completed",
    boardExpectation: "Utdatert styremål",
    seasonObjective: "Utdatert sesongmål"
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, gameStart }) => {
    if (localStorage.getItem("hgfm.test.stayRolloverSaveMetadataSeeded") === "1") return;
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify(gameStart));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.removeItem("historygo-football-manager.league-playoff.v1");
    localStorage.setItem("hgfm.seasonArchive.v1", "[]");
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      clubWeekState: {
        week: 31,
        phase: "review",
        boardTrust: 50,
        playerMorale: 50,
        tacticalClarity: 50,
        trainingCulture: 50,
        mediaPressure: 50
      }
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          leagueSeason: season,
          leaguePlayoff: null,
          seasonArchive: [],
          gameStartState: gameStart
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
    localStorage.setItem("hgfm.test.stayRolloverSaveMetadataSeeded", "1");
  }, { season, gameStart });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();

  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    playoff: JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null"),
    archive: JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }))).toMatchObject({
    season: {
      seasonNumber: 2,
      status: "active",
      tier: { id: "eliteserien", name: "Eliteserien" },
      previousOutcome: { movement: "stay", position: 2 }
    },
    playoff: null,
    archive: [{ seasonNumber: 1 }]
  });

  const snapshot = await page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    archive: JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }));
  const managerClub = snapshot.season.clubs.find((club) => club.id === snapshot.season.managerClubId);
  const clubExpectation = deriveClubExpectation(managerClub, snapshot.season.clubs, snapshot.season.tier);
  const previous = snapshot.archive.at(-1) || null;
  const expected = deriveSeasonTarget({
    clubCount: snapshot.season.clubs.length,
    seasonNumber: snapshot.season.seasonNumber,
    previousPosition: previous?.position ?? null,
    clubExpectation,
    tierChanged: false
  });

  expect(clubExpectation).not.toBeNull();
  expect(expected.label).not.toBe(clubExpectation.label);
  expect(Boolean(snapshot.season.previousOutcome?.viaPlayoff)).toBe(false);
  expect(snapshot.gameStart).toMatchObject({
    leagueName: "Eliteserien",
    seasonLabel: "Sesong 2",
    boardExpectation: expected.label,
    leagueSeasonStatus: "active"
  });
  expect(snapshot.gameStart.boardExpectation).not.toBe("Utdatert styremål");
  await expect(page.locator("#clubIdentityHeader")).toContainText("Eliteserien");
  await expect(page.locator("#statsBoardGoal")).toHaveText(expected.label);

  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();

  const reloaded = await page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    playoff: JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null"),
    archive: JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }));

  expect(reloaded.season).toMatchObject({
    seasonNumber: 2,
    status: "active",
    tier: { id: "eliteserien", name: "Eliteserien" },
    previousOutcome: { movement: "stay", position: 2 }
  });
  expect(Boolean(reloaded.season.previousOutcome?.viaPlayoff)).toBe(false);
  expect(reloaded.playoff).toBeNull();
  expect(reloaded.archive).toHaveLength(1);
  expect(reloaded.gameStart).toMatchObject({
    leagueName: "Eliteserien",
    seasonLabel: "Sesong 2",
    boardExpectation: expected.label,
    leagueSeasonStatus: "active"
  });
  expect(reloaded.gameStart.boardExpectation).not.toBe("Utdatert styremål");
  await expect(page.locator("#clubIdentityHeader")).toContainText("Eliteserien");
  await expect(page.locator("#statsBoardGoal")).toHaveText(expected.label);
});