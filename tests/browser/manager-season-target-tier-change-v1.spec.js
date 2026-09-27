import { expect, test } from "@playwright/test";
import { createLeagueSeason } from "../../src/football-league-season.js";
import { deriveSeasonTarget } from "../../src/football-season-review.js";

test("nivåskifte nullstiller gammel tabellplass når styret setter nytt sesongmål", () => {
  const promotedTakeover = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 2,
    previousPosition: 1,
    tierChanged: true,
    clubExpectation: {
      targetPosition: 8,
      label: "Topp 8",
      description: "På det nye nivået hører klubben hjemme i øvre halvdel."
    }
  });

  expect(promotedTakeover).toMatchObject({
    targetPosition: 8,
    label: "Topp 8"
  });

  const promotedOwnClub = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 2,
    previousPosition: 1,
    tierChanged: true
  });
  expect(promotedOwnClub.targetPosition).toBe(8);

  const relegatedTakeover = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 3,
    previousPosition: 16,
    tierChanged: true,
    clubExpectation: {
      targetPosition: 2,
      label: "Opprykk",
      description: "På det lavere nivået er klubben blant opprykksfavorittene."
    }
  });
  expect(relegatedTakeover).toMatchObject({
    targetPosition: 2,
    label: "Opprykk"
  });

  const sameTierChampion = deriveSeasonTarget({
    clubCount: 16,
    seasonNumber: 2,
    previousPosition: 1,
    tierChanged: false,
    clubExpectation: {
      targetPosition: 8,
      label: "Topp 8",
      description: "Denne forventningen skal ikke overstyre progresjonen på samme nivå."
    }
  });
  expect(sameTierChampion).toMatchObject({
    targetPosition: 1,
    label: "Seriegull"
  });
});

test("browseren bruker klubbens standing på nytt nivå etter nedrykk", async ({ page }) => {
  const tier = {
    id: "obosligaen",
    name: "OBOS-ligaen",
    level: 2,
    clubCount: 4,
    groupSize: 4,
    groups: 1,
    rounds: 6,
    promotion: { toTier: "eliteserien", direct: 1, playoff: 1 },
    relegation: { toTier: "andredivisjon", direct: 1, playoff: 0 }
  };
  const managerClub = { id: "rosenborg", name: "Rosenborg", tier: "obosligaen", strength: 90 };
  const opponents = [
    { id: "aalesund", name: "Aalesund", tier: "obosligaen", strength: 78 },
    { id: "start", name: "Start", tier: "obosligaen", strength: 75 },
    { id: "sogndal", name: "Sogndal", tier: "obosligaen", strength: 72 }
  ];
  const season = createLeagueSeason({
    managerClub,
    opponents,
    tier,
    seed: "browser-tier-change-target",
    seasonNumber: 2
  });
  season.previousOutcome = {
    seasonNumber: 1,
    position: 16,
    tierId: "eliteserien",
    tierName: "Eliteserien",
    tierLevel: 1,
    movement: "relegated"
  };

  const archive = [{
    seasonNumber: 1,
    position: 16,
    points: 12,
    played: 30,
    goalsFor: 22,
    goalsAgainst: 58,
    verdict: "failed",
    verdictLabel: "Langt under forventning",
    champion: "Brann",
    targetPosition: 8,
    warning: true,
    sacked: false,
    topScorer: null
  }];
  const gameStart = {
    selectedMode: "league",
    activeLeagueSaveId: "tier_change_target_ui",
    clubName: "Rosenborg",
    takeoverClubId: "rosenborg",
    managerName: "Manager",
    leagueName: "OBOS-ligaen",
    leagueSeasonStatus: "active",
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
  }, { season, gameStart, archive });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();

  const summary = page.locator("#seasonArchiveSummary");
  await expect(summary).toContainText("Rosenborg er blant favorittene i divisjonen");
  await expect(summary).toContainText("Styret venter opprykk");
  await expect(summary).not.toContainText("15. plass");
});
