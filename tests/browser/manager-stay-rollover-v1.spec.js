import { expect, test } from "@playwright/test";
import { createLeagueSeason } from "../../src/football-league-season.js";

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
  const managerClub = { id: "rosenborg", name: "Rosenborg", tier: "eliteserien", strength: 82 };
  const opponents = [
    { id: "brann", name: "Brann", tier: "eliteserien", strength: 80 },
    { id: "viking", name: "Viking", tier: "eliteserien", strength: 79 },
    { id: "molde", name: "Molde", tier: "eliteserien", strength: 78 }
  ];

  const season = createLeagueSeason({
    managerClub,
    opponents,
    tier,
    seed: "browser-stay-rollover",
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

test("midtabell ruller neste sesong på samme nivå med stay-dom", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "stay_rollover_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.removeItem("historygo-football-manager.league-playoff.v1");
  }, completedStaySeason());

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeEnabled();
  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      status: season?.status || null,
      tierId: season?.competition?.tierId || null,
      tierName: season?.competition?.tierName || null,
      movement: season?.previousOutcome?.movement || null,
      position: Number(season?.previousOutcome?.position) || null,
      viaPlayoff: Boolean(season?.previousOutcome?.viaPlayoff),
      playoff,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    seasonNumber: 2,
    status: "active",
    tierId: "eliteserien",
    tierName: "Eliteserien",
    movement: "stay",
    position: 2,
    viaPlayoff: false,
    playoff: null,
    archiveCount: 1
  });

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#seasonCommand")).toContainText("Eliteserien");
});
