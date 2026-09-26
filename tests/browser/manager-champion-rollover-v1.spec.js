import { expect, test } from "@playwright/test";
import { completeLeagueRound, createLeagueSeason } from "../../src/football-league-season.js";

function completedChampionSeason() {
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

  let season = createLeagueSeason({
    managerClub,
    opponents,
    tier,
    seed: "browser-champion-rollover",
    seasonNumber: 1
  });
  while (season.status === "active") {
    season = completeLeagueRound(season, { score: { for: 2, against: 0 } });
  }
  return season;
}

test("seriemester blir i Eliteserien og bærer champion-dom inn i sesong 2", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "champion_rollover_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.removeItem("historygo-football-manager.league-playoff.v1");
  }, completedChampionSeason());

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
      viaPlayoff: Boolean(season?.previousOutcome?.viaPlayoff),
      isChampion: Boolean(season?.previousOutcome?.isChampion),
      playoff,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    seasonNumber: 2,
    status: "active",
    tierId: "eliteserien",
    tierName: "Eliteserien",
    movement: "champion",
    viaPlayoff: false,
    isChampion: true,
    playoff: null,
    archiveCount: 1
  });

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#seasonCommand")).toContainText("Eliteserien");
});
