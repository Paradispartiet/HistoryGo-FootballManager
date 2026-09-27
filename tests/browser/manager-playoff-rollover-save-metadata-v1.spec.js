import { expect, test } from "@playwright/test";
import { deriveClubExpectation } from "../../src/football-club-selection.js";

function completedSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 76 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 79 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 82 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const pairings = [
    [["rosenborg", "brann"], ["viking", "molde"]],
    [["viking", "rosenborg"], ["brann", "molde"]],
    [["rosenborg", "molde"], ["brann", "viking"]],
    [["brann", "rosenborg"], ["molde", "viking"]],
    [["rosenborg", "viking"], ["molde", "brann"]],
    [["molde", "rosenborg"], ["viking", "brann"]]
  ];

  return {
    version: "historygo-football-manager.league-season.v3",
    competition: {
      id: "hg-eliteserien",
      mode: "league",
      tierId: "eliteserien",
      tierName: "Eliteserien",
      tierLevel: 1,
      clubCount: 4,
      rounds: 6,
      homeAndAway: true,
      points: { win: 3, draw: 1, loss: 0 },
      version: 3
    },
    tier: {
      id: "eliteserien",
      name: "Eliteserien",
      level: 1,
      clubCount: 4,
      groupSize: 4,
      rounds: 6,
      relegation: { toTier: "obosligaen", direct: 0, playoff: 1, playoffRounds: 1 }
    },
    seed: "playoff-rollover-save-metadata",
    seasonNumber: 2,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 6,
    status: "completed",
    fixtures: pairings.map((pairs, roundIndex) => ({
      round: roundIndex + 1,
      status: "completed",
      matches: pairs.map(([homeClubId, awayClubId], matchIndex) => ({
        id: `playoff-metadata-r${roundIndex + 1}-${matchIndex}`,
        round: roundIndex + 1,
        homeClubId,
        awayClubId,
        status: "completed",
        result: { homeGoals: 1, awayGoals: 1, simulated: homeClubId !== "rosenborg" && awayClubId !== "rosenborg" }
      }))
    })),
    completedMatchIds: pairings.flatMap((pairs, roundIndex) =>
      pairs.map((_, matchIndex) => `playoff-metadata-r${roundIndex + 1}-${matchIndex}`)
    ),
    createdFrom: "browser playoff metadata regression"
  };
}

function lostRelegationPlayoff() {
  return {
    version: "historygo-football-manager.league-playoff.v1",
    kind: "relegation",
    seed: "playoff-rollover-save-metadata-kval",
    tierId: "eliteserien",
    tierName: "Eliteserien",
    targetTierId: "obosligaen",
    targetTierName: "OBOS-ligaen",
    seasonNumber: 2,
    fromPosition: 4,
    managerClubId: "rosenborg",
    currentRoundIndex: 0,
    status: "lost",
    resolution: null,
    rounds: [{
      index: 0,
      name: "Nedrykkskvalifisering mot OBOS-ligaen",
      role: "defender",
      description: "Vinner du sammenlagt, beholder du plassen i Eliteserien.",
      opponent: {
        id: "odd",
        name: "Odd",
        ground: "Skagerak Arena",
        strength: 68,
        tier: "obosligaen"
      },
      legs: [
        { leg: 1, homeAway: "away", status: "completed", score: { for: 0, against: 2 } },
        { leg: 2, homeAway: "home", status: "completed", score: { for: 0, against: 1 } }
      ],
      status: "lost",
      aggregate: { for: 0, against: 3 },
      awayGoals: { manager: 0, opponent: 1 },
      decidedBy: "sammenlagt"
    }]
  };
}

test("playoff-nedrykk synkroniserer league-save metadata og overlever reload", async ({ page }) => {
  const season = completedSeason();
  const playoff = lostRelegationPlayoff();
  const gameStart = {
    selectedMode: "league",
    activeLeagueSaveId: "playoff_rollover_save_metadata_ui",
    clubName: "Rosenborg",
    takeoverClubId: "rosenborg",
    managerName: "Manager",
    leagueName: "Eliteserien",
    seasonLabel: "Sesong 2",
    leagueSeasonStatus: "completed",
    boardExpectation: "Øvre halvdel",
    seasonObjective: "Hold plassen i Eliteserien."
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff, gameStart }) => {
    if (localStorage.getItem("hgfm.test.playoffRolloverSaveMetadataSeeded") === "1") return;
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify(gameStart));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
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
          leaguePlayoff: playoff,
          seasonArchive: [],
          gameStartState: gameStart
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
    localStorage.setItem("hgfm.test.playoffRolloverSaveMetadataSeeded", "1");
  }, { season, playoff, gameStart });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();

  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    playoff: JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }))).toMatchObject({
    season: {
      seasonNumber: 3,
      status: "active",
      tier: { id: "obosligaen", name: "OBOS-ligaen" },
      previousOutcome: { movement: "relegated", viaPlayoff: true }
    },
    playoff: null
  });

  const snapshot = await page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }));
  const managerClub = snapshot.season.clubs.find((club) => club.id === snapshot.season.managerClubId);
  const expected = deriveClubExpectation(managerClub, snapshot.season.clubs, snapshot.season.tier);

  expect(expected).not.toBeNull();
  expect(snapshot.gameStart).toMatchObject({
    leagueName: "OBOS-ligaen",
    seasonLabel: "Sesong 3",
    boardExpectation: expected.label,
    leagueSeasonStatus: "active"
  });
  await expect(page.locator("#clubIdentityHeader")).toContainText("OBOS-ligaen");
  await expect(page.locator("#statsBoardGoal")).toHaveText(expected.label);
  await expect(page.locator("#statsBoardGoal")).not.toHaveText("Øvre halvdel");

  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();

  const reloaded = await page.evaluate(() => ({
    season: JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null"),
    playoff: JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null"),
    gameStart: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "null")
  }));
  expect(reloaded.season).toMatchObject({
    seasonNumber: 3,
    status: "active",
    tier: { id: "obosligaen", name: "OBOS-ligaen" },
    previousOutcome: { movement: "relegated", viaPlayoff: true }
  });
  expect(reloaded.playoff).toBeNull();
  expect(reloaded.gameStart).toMatchObject({
    leagueName: "OBOS-ligaen",
    seasonLabel: "Sesong 3",
    boardExpectation: expected.label,
    leagueSeasonStatus: "active"
  });
  await expect(page.locator("#clubIdentityHeader")).toContainText("OBOS-ligaen");
  await expect(page.locator("#statsBoardGoal")).toHaveText(expected.label);
  await expect(page.locator("#statsBoardGoal")).not.toHaveText("Øvre halvdel");
});
