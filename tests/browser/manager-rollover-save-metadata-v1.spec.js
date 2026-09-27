import { expect, test } from "@playwright/test";
import { createLeagueSeason } from "../../src/football-league-season.js";
import { deriveClubExpectation } from "../../src/football-club-selection.js";

function completedPromotionSeason() {
  const tier = {
    id: "andredivisjon",
    name: "2. divisjon",
    level: 3,
    clubCount: 4,
    groupSize: 4,
    groups: 1,
    rounds: 6,
    promotion: { toTier: "obosligaen", direct: 1, playoff: 1, playoffRounds: 2 },
    relegation: null
  };
  const managerClub = { id: "rosenborg", name: "Rosenborg", tier: "andredivisjon", strength: 82 };
  const opponents = [
    { id: "skeid", name: "Skeid", tier: "andredivisjon", strength: 72 },
    { id: "eidsvold-turn", name: "Eidsvold Turn", tier: "andredivisjon", strength: 68 },
    { id: "strindheim", name: "Strindheim", tier: "andredivisjon", strength: 66 }
  ];

  const season = createLeagueSeason({
    managerClub,
    opponents,
    tier,
    seed: "browser-rollover-save-metadata",
    seasonNumber: 1
  });

  season.status = "completed";
  season.currentRound = season.competition.rounds;
  season.completedMatchIds = [];
  season.fixtures.forEach((round) => {
    round.status = "completed";
    round.matches.forEach((match) => {
      const managerHome = match.homeClubId === season.managerClubId;
      const managerAway = match.awayClubId === season.managerClubId;
      match.status = "completed";
      match.result = managerHome
        ? { homeGoals: 4, awayGoals: 0, simulated: false }
        : managerAway
          ? { homeGoals: 0, awayGoals: 4, simulated: false }
          : { homeGoals: 0, awayGoals: 0, simulated: true };
      season.completedMatchIds.push(match.id);
    });
  });

  return season;
}

test("opprykk synkroniserer league-save metadata med den nye sesongen", async ({ page }) => {
  const season = completedPromotionSeason();
  const gameStart = {
    selectedMode: "league",
    activeLeagueSaveId: "rollover_save_metadata_ui",
    clubName: "Rosenborg",
    takeoverClubId: "rosenborg",
    managerName: "Manager",
    leagueName: "2. divisjon",
    seasonLabel: "Sesong 1",
    leagueSeasonStatus: "completed",
    boardExpectation: "Seriegull",
    seasonObjective: "Vinn 2. divisjon."
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, gameStart }) => {
    if (localStorage.getItem("hgfm.test.rolloverSaveMetadataSeeded") === "1") return;
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify(gameStart));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("hgfm.seasonArchive.v1", "[]");
    localStorage.removeItem("historygo-football-manager.league-playoff.v1");
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
    localStorage.setItem("hgfm.test.rolloverSaveMetadataSeeded", "1");
  }, { season, gameStart });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();

  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const nextSeason = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const nextGameStart = JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null");
    return {
      season: nextSeason,
      gameStart: nextGameStart
    };
  })).toMatchObject({
    season: {
      seasonNumber: 2,
      status: "active",
      tier: { id: "obosligaen", name: "OBOS-ligaen" },
      previousOutcome: { movement: "promoted" }
    }
  });

  const snapshot = await page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }));
  const managerClub = snapshot.season.clubs.find((club) => club.id === snapshot.season.managerClubId);
  const expected = deriveClubExpectation(managerClub, snapshot.season.clubs, snapshot.season.tier);

  expect(expected).not.toBeNull();
  expect(snapshot.gameStart).toMatchObject({
    leagueName: snapshot.season.tier.name,
    seasonLabel: `Sesong ${snapshot.season.seasonNumber}`,
    boardExpectation: expected.label,
    leagueSeasonStatus: "active"
  });

  await expect(page.locator("#clubIdentityHeader")).toContainText(snapshot.season.tier.name);
  await expect(page.locator("#statsBoardGoal")).toHaveText(expected.label);
  await expect(page.locator("#statsBoardGoal")).not.toHaveText("Seriegull");

  // Mode-session eier den aktive league-snapshoten ved oppstart. Reload må derfor
  // bevise at snapshotet ikke kan gjeninnføre den gamle divisjonen eller målet.
  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();

  const reloaded = await page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }));
  expect(reloaded.season).toMatchObject({
    seasonNumber: 2,
    status: "active",
    tier: { id: "obosligaen", name: "OBOS-ligaen" },
    previousOutcome: { movement: "promoted" }
  });
  expect(reloaded.gameStart).toMatchObject({
    leagueName: "OBOS-ligaen",
    seasonLabel: "Sesong 2",
    boardExpectation: expected.label,
    leagueSeasonStatus: "active"
  });
  await expect(page.locator("#clubIdentityHeader")).toContainText("OBOS-ligaen");
  await expect(page.locator("#statsBoardGoal")).toHaveText(expected.label);
  await expect(page.locator("#statsBoardGoal")).not.toHaveText("Seriegull");
});
