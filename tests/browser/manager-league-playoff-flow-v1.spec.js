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
    seed: "playoff-browser-regression",
    seasonNumber: 2,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 6,
    status: "completed",
    fixtures: pairings.map((pairs, roundIndex) => ({
      round: roundIndex + 1,
      status: "completed",
      matches: pairs.map(([homeClubId, awayClubId], matchIndex) => ({
        id: `playoff-season-r${roundIndex + 1}-${matchIndex}`,
        round: roundIndex + 1,
        homeClubId,
        awayClubId,
        status: "completed",
        result: { homeGoals: 1, awayGoals: 1, simulated: homeClubId !== "rosenborg" && awayClubId !== "rosenborg" }
      }))
    })),
    completedMatchIds: pairings.flatMap((pairs, roundIndex) =>
      pairs.map((_, matchIndex) => `playoff-season-r${roundIndex + 1}-${matchIndex}`)
    ),
    createdFrom: "browser playoff regression"
  };
}

function activePlayoff() {
  return {
    version: "historygo-football-manager.league-playoff.v1",
    kind: "relegation",
    seed: "playoff-browser-regression-kval",
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

test("aktiv kvalifisering erstatter død ny-sesong-handling i Stats", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_browser_regression",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#leagueSeasonPanel")).toBeVisible();

  const command = page.locator("#seasonCommand");
  await expect(command).toHaveAttribute("data-state", "playoff");
  await expect(command).toContainText(/kvalifisering/i);
  await expect(command.locator(".season-next-match")).toContainText("Odd");

  const goToMatch = command.getByRole("button", { name: "Gå til kamp" });
  await expect(goToMatch).toBeEnabled();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();

  await goToMatch.click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator('.main-nav [role="tab"][data-tab-target="kamp"]')).toHaveAttribute("aria-selected", "true");
});


test("aktiv kvalifisering er en spillbar kamp i Kampdag-porten", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 31,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    const analysisPlan = {
      version: "opponent-analysis.v1",
      fixtureId: "playoff-browser-regression-kval-kval-r1-k1",
      opponentId: "odd",
      opponentName: "Odd",
      round: 1,
      week: 31,
      focusId: "press",
      focusLabel: "Presset deres",
      question: "Hvor starter presset, og hvilken pasning forsøker de å tvinge fram?",
      hypothesis: "Behold en fri spiller bak første pressledd.",
      evidence: ["Odd presser høyt"],
      countermeasureId: "free_player",
      countermeasureLabel: "Skap en fri spiller",
      target: "system",
      targetLabel: "Systemet",
      why: "Kvalikkampen er analysert.",
      risk: "Å lokke presset inn krever presisjon nær eget mål.",
      watch: "Se hvem som blir fri når første pressledd går mot ballfører."
    };

    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_browser_regression",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 31,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: { opponentAnalysisPlan: analysisPlan },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  const goToMatch = page.locator("#seasonCommand").getByRole("button", { name: "Gå til kamp" });
  await expect(goToMatch).toBeEnabled();
  await goToMatch.click();

  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-status", "ready");
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("#matchdayReadiness")).not.toContainText("Start ligasesongen før kamp");
  await expect(page.locator("#playMatchdayButton")).toBeEnabled();
});
