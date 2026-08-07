import { expect, test } from "@playwright/test";

function seededSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 82 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 80 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 79 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const round = (number, matches, completed = false) => ({
    round: number,
    status: completed ? "completed" : "scheduled",
    matches: matches.map((match, index) => ({
      id: `scene-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });

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
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-season-scene",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [
        { home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } },
        { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }
      ], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["scene-r1-0", "scene-r1-1"],
    createdFrom: "browser season scene"
  };
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_season_scene_save",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#leagueSeasonPanel")).toBeVisible();
});

test("Stats åpner med managerens situasjon og neste kamp", async ({ page }) => {
  const command = page.locator("#seasonCommand");
  await expect(command.locator("h2")).toHaveText("Stats");
  await expect(command).toContainText("Serierunde 2 av 6");
  await expect(command.locator(".season-next-match")).toContainText("Viking");
  await expect(command.locator(".season-command-metrics article")).toHaveCount(4);
  await expect(command.locator(".season-command-metrics")).toContainText("1.");
  await expect(command.locator(".season-command-metrics")).toContainText("3");
  await expect(command.locator(".season-command-metrics")).toContainText("V");
});

test("tabell, kamprytme og full terminliste er samlet i Stats", async ({ page }) => {
  await expect(page.locator(".season-workspace-grid")).toBeVisible();
  const rows = page.locator(".season-compact-table tbody tr:not(.season-table-gap)");
  await expect(rows).toHaveCount(4);
  await expect(page.locator(".season-compact-table tr.is-manager-club")).toContainText("Rosenborg");
  await expect(page.locator(".season-fixture.is-recent")).toContainText("Brann");
  await expect(page.locator(".season-fixture.is-upcoming").first()).toContainText("Viking");
  await expect(page.locator(".season-depth")).toHaveAttribute("open", "");
  await expect(page.locator(".season-full-table")).toBeVisible();
  await expect(page.locator(".season-all-fixtures")).toBeVisible();
  await expect(page.locator("#playerStatsTable")).toBeVisible();
});

test("Stats gir direkte vei til kamp", async ({ page }) => {
  await page.getByRole("button", { name: "Gå til kamp" }).click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator('.main-nav [role="tab"][data-tab-target="kamp"]')).toHaveAttribute("aria-selected", "true");
});

test("Stats har ingen horisontal overflow på mobil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator(".season-command-metrics article")).toHaveCount(4);
  await expect(page.locator(".season-fixture-columns")).toBeVisible();
  await expect(page.locator(".season-full-table")).toBeVisible();
});
