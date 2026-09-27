import { expect, test } from "@playwright/test";
import { createLeagueSeason } from "../../src/football-league-season.js";

function completedFailedSeason() {
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
    seed: "browser-dismissal-terminal",
    seasonNumber: 2
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
        ? { homeGoals: 0, awayGoals: 4, simulated: false }
        : managerAway
          ? { homeGoals: 4, awayGoals: 0, simulated: false }
          : { homeGoals: 1, awayGoals: 1, simulated: true };
      season.completedMatchIds.push(match.id);
    });
  });

  return season;
}

const priorArchive = [
  {
    seasonNumber: 1,
    position: 4,
    points: 0,
    played: 6,
    goalsFor: 0,
    goalsAgainst: 18,
    verdict: "failed",
    verdictLabel: "Langt under forventning",
    champion: "Brann",
    targetPosition: 2,
    warning: true,
    sacked: false,
    topScorer: null
  }
];

async function expectDismissalTerminal(page) {
  await expect(page.getByText(/avslutter samarbeidet/i)).toBeVisible();

  const startNextSeason = page.locator("#startNewLeagueSeasonButton");
  const actionable = await startNextSeason.evaluate((button) => {
    const style = window.getComputedStyle(button);
    const visible = !button.hidden && style.display !== "none" && style.visibility !== "hidden";
    return visible && !button.disabled;
  });
  expect(actionable).toBe(false);

  const state = await page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      status: season?.status || null,
      archiveCount: archive.length,
      priorWarning: Boolean(archive[0]?.warning),
      priorSacked: Boolean(archive[0]?.sacked)
    };
  });

  expect(state).toEqual({
    seasonNumber: 2,
    status: "completed",
    archiveCount: 1,
    priorWarning: true,
    priorSacked: false
  });
}

test("andre katastrofesesong avslutter managerjobben og sperrer samme karriere etter reload", async ({ page }) => {
  const season = completedFailedSeason();
  const gameStart = {
    selectedMode: "league",
    activeLeagueSaveId: "dismissal_terminal_ui",
    clubName: "Rosenborg",
    takeoverClubId: "rosenborg",
    managerName: "Manager",
    leagueName: "Eliteserien",
    leagueSeasonStatus: "completed",
    boardExpectation: "Øvre halvdel"
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, gameStart, archive }) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify(gameStart));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("hgfm.seasonArchive.v1", JSON.stringify(archive));
    localStorage.removeItem("historygo-football-manager.league-playoff.v1");
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          leagueSeason: season,
          leaguePlayoff: null,
          seasonArchive: archive,
          gameStartState: gameStart
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season, gameStart, archive: priorArchive });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expectDismissalTerminal(page);

  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expectDismissalTerminal(page);
});
