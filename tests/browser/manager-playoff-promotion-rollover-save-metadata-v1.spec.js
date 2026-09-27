import { expect, test } from "@playwright/test";
import { deriveClubExpectation } from "../../src/football-club-selection.js";

function completedSecondDivisionSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 76 },
    { id: "skeid", name: "Skeid", isManager: false, ground: "Nordre Åsen", strength: 69 },
    { id: "eidsvold-turn", name: "Eidsvold Turn", isManager: false, ground: "Myhrer stadion", strength: 66 },
    { id: "strindheim", name: "Strindheim", isManager: false, ground: "Leangen", strength: 64 }
  ];
  const pairings = [
    [["rosenborg", "skeid"], ["eidsvold-turn", "strindheim"]],
    [["eidsvold-turn", "rosenborg"], ["skeid", "strindheim"]],
    [["rosenborg", "strindheim"], ["skeid", "eidsvold-turn"]],
    [["skeid", "rosenborg"], ["strindheim", "eidsvold-turn"]],
    [["rosenborg", "eidsvold-turn"], ["strindheim", "skeid"]],
    [["strindheim", "rosenborg"], ["eidsvold-turn", "skeid"]]
  ];

  return {
    version: "historygo-football-manager.league-season.v3",
    competition: {
      id: "hg-andredivisjon-avdeling1",
      mode: "league",
      tierId: "andredivisjon",
      tierName: "2. divisjon",
      tierLevel: 3,
      clubCount: 4,
      rounds: 6,
      homeAndAway: true,
      points: { win: 3, draw: 1, loss: 0 },
      version: 3
    },
    tier: {
      id: "andredivisjon",
      name: "2. divisjon",
      level: 3,
      clubCount: 4,
      groupSize: 4,
      rounds: 6,
      promotion: { toTier: "obosligaen", direct: 1, playoff: 1, playoffRounds: 2 }
    },
    seed: "playoff-promotion-rollover-save-metadata",
    seasonNumber: 2,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 6,
    status: "completed",
    fixtures: pairings.map((pairs, roundIndex) => ({
      round: roundIndex + 1,
      status: "completed",
      matches: pairs.map(([homeClubId, awayClubId], matchIndex) => ({
        id: `playoff-promotion-metadata-r${roundIndex + 1}-${matchIndex}`,
        round: roundIndex + 1,
        homeClubId,
        awayClubId,
        status: "completed",
        result: { homeGoals: 1, awayGoals: 1, simulated: homeClubId !== "rosenborg" && awayClubId !== "rosenborg" }
      }))
    })),
    completedMatchIds: pairings.flatMap((pairs, roundIndex) =>
      pairs.map((_, matchIndex) => `playoff-promotion-metadata-r${roundIndex + 1}-${matchIndex}`)
    ),
    createdFrom: "browser playoff promotion metadata regression"
  };
}

function wonPromotionPlayoff() {
  return {
    version: "historygo-football-manager.league-playoff.v1",
    kind: "promotion",
    seed: "playoff-promotion-rollover-save-metadata-kval",
    tierId: "andredivisjon",
    tierName: "2. divisjon",
    targetTierId: "obosligaen",
    targetTierName: "OBOS-ligaen",
    seasonNumber: 2,
    fromPosition: 2,
    managerClubId: "rosenborg",
    currentRoundIndex: 1,
    status: "won",
    resolution: null,
    rounds: [
      {
        index: 0,
        name: "Avdelingsoppgjøret",
        role: "peer",
        description: "Vinneren går videre til kvalifisering mot OBOS-ligaen.",
        opponent: {
          id: "kjelsas",
          name: "Kjelsås",
          ground: "Grefsen stadion",
          strength: 65,
          tier: "andredivisjon",
          group: "avdeling2"
        },
        legs: [
          { leg: 1, homeAway: "away", status: "completed", score: { for: 2, against: 0 } },
          { leg: 2, homeAway: "home", status: "completed", score: { for: 1, against: 0 } }
        ],
        status: "won",
        aggregate: { for: 3, against: 0 },
        awayGoals: { manager: 2, opponent: 0 },
        decidedBy: "sammenlagt"
      },
      {
        index: 1,
        name: "Opprykkskvalifisering mot OBOS-ligaen",
        role: "challenger",
        description: "Vinner du sammenlagt, spiller du i OBOS-ligaen neste sesong.",
        opponent: {
          id: "odd",
          name: "Odd",
          ground: "Skagerak Arena",
          strength: 68,
          tier: "obosligaen"
        },
        legs: [
          { leg: 1, homeAway: "home", status: "completed", score: { for: 2, against: 0 } },
          { leg: 2, homeAway: "away", status: "completed", score: { for: 1, against: 0 } }
        ],
        status: "won",
        aggregate: { for: 3, against: 0 },
        awayGoals: { manager: 1, opponent: 0 },
        decidedBy: "sammenlagt"
      }
    ]
  };
}

test("playoff-opprykk synkroniserer league-save metadata og overlever reload", async ({ page }) => {
  const season = completedSecondDivisionSeason();
  const playoff = wonPromotionPlayoff();
  const gameStart = {
    selectedMode: "league",
    activeLeagueSaveId: "playoff_promotion_rollover_save_metadata_ui",
    clubName: "Rosenborg",
    takeoverClubId: "rosenborg",
    managerName: "Manager",
    leagueName: "2. divisjon",
    seasonLabel: "Sesong 2",
    leagueSeasonStatus: "completed",
    boardExpectation: "Seriegull",
    seasonObjective: "Vinn 2. divisjon."
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff, gameStart }) => {
    if (localStorage.getItem("hgfm.test.playoffPromotionRolloverSaveMetadataSeeded") === "1") return;
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify(gameStart));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.seasonArchive.v1", "[]");
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      clubWeekState: {
        week: 34,
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
    localStorage.setItem("hgfm.test.playoffPromotionRolloverSaveMetadataSeeded", "1");
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
      previousOutcome: { movement: "promoted", viaPlayoff: true }
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
  await expect(page.locator("#statsBoardGoal")).not.toHaveText("Seriegull");

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
    previousOutcome: { movement: "promoted", viaPlayoff: true }
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
  await expect(page.locator("#statsBoardGoal")).not.toHaveText("Seriegull");
});
