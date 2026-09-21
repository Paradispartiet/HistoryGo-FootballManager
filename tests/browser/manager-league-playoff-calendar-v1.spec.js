import { expect, test } from "@playwright/test";

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
    seed: "playoff-calendar-regression",
    seasonNumber: 2,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 6,
    status: "completed",
    fixtures: pairings.map((pairs, roundIndex) => ({
      round: roundIndex + 1,
      status: "completed",
      matches: pairs.map(([homeClubId, awayClubId], matchIndex) => ({
        id: `playoff-calendar-r${roundIndex + 1}-${matchIndex}`,
        round: roundIndex + 1,
        homeClubId,
        awayClubId,
        status: "completed",
        result: { homeGoals: 1, awayGoals: 1, simulated: homeClubId !== "rosenborg" && awayClubId !== "rosenborg" }
      }))
    })),
    completedMatchIds: pairings.flatMap((pairs, roundIndex) =>
      pairs.map((_, matchIndex) => `playoff-calendar-r${roundIndex + 1}-${matchIndex}`)
    )
  };
}

function activePlayoff() {
  return {
    version: "historygo-football-manager.league-playoff.v1",
    kind: "relegation",
    seed: "playoff-calendar-regression-kval",
    tierId: "eliteserien",
    tierName: "Eliteserien",
    targetTierId: "obosligaen",
    targetTierName: "OBOS-ligaen",
    seasonNumber: 2,
    fromPosition: 4,
    managerClubId: "rosenborg",
    currentRoundIndex: 0,
    status: "active",
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
        { leg: 1, homeAway: "away", status: "scheduled", score: null },
        { leg: 2, homeAway: "home", status: "scheduled", score: null }
      ],
      status: "active",
      aggregate: { for: 0, against: 0 },
      awayGoals: { manager: 0, opponent: 0 },
      decidedBy: null
    }]
  };
}

test("aktiv kvalifisering holder managerkalenderen i spill", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_calendar_regression",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      clubWeekState: {
        week: 31,
        phase: "analysis",
        boardTrust: 50,
        playerMorale: 50,
        tacticalClarity: 50,
        trainingCulture: 50,
        mediaPressure: 50
      }
    }));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();

  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  await expect(page.locator("#managerCalendarMatch")).toContainText("Odd");
  await expect(page.locator("#nextActionPrimaryTag")).toHaveText("Kalender");
  await expect(page.locator("#nextActionPrimaryTitle")).not.toHaveText("Se sesongdommen");
  await expect(page.locator("#nextActionStrip")).toHaveAttribute("aria-label", "Managerkalender · neste hendelse");
});
