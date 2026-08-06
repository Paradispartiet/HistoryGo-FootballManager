import AxeBuilder from "@axe-core/playwright";
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
      id: `matchday-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 6, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-matchday-scene-v1",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [{ home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } }, { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["matchday-r1-0", "matchday-r1-1"],
    createdFrom: "browser matchday scene v1"
  };
}

async function openMatchday(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator("#matchdayCommandPanel")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function prepareAndOpenPreMatch(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  const focusButton = page.locator("#weeklyTrainingOptions button:not([disabled])").first();
  await expect(focusButton).toBeAttached();
  await focusButton.evaluate((node) => node.click());

  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  const startSeasonAction = page.locator("#leagueOnboardingSteps button", { hasText: "Start sesongen" });
  if (await startSeasonAction.isVisible()) await startSeasonAction.click();

  await openMatchday(page);
  const play = page.locator("#playMatchdayButton");
  await expect(play).toBeEnabled();
  await play.click();
  await expect(page.locator(".matchday-kickoff-button")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "matchday_scene_v1",
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
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("kampdagen viser én scene med tre faser og fire operative statuser", async ({ page }) => {
  await openMatchday(page);
  await expect(page.locator("#matchdayCommand h2")).toHaveText("Kampdagen");
  await expect(page.locator(".matchday-stage")).toHaveCount(3);
  await expect(page.locator('.matchday-stage[data-state="active"]')).toHaveCount(1);
  await expect(page.locator(".matchday-scene-team")).toHaveCount(2);
  await expect(page.locator(".matchday-scene-context-card")).toHaveCount(3);
  await expect(page.locator(".matchday-scene-status-card")).toHaveCount(4);
  await expect(page.locator(".matchday-scene-action")).toBeVisible();
  expect(await page.locator("#matchdayDepth").getAttribute("open")).toBeNull();
});

test("statuskort åpner eksisterende kampdetaljer og arbeidsflater", async ({ page }) => {
  await openMatchday(page);
  await page.locator('.matchday-scene-status-card[data-matchday-target="details"]').first().click();
  await expect(page.locator("#matchdayDepth")).toHaveAttribute("open", "");

  await page.locator('.matchday-scene-status-card[data-matchday-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

  await openMatchday(page);
  await page.locator('.matchday-scene-status-card[data-matchday-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
});

test("kampforberedelsen går videre til eksisterende avspark", async ({ page }) => {
  await prepareAndOpenPreMatch(page);
  await expect(page.locator("#matchdayCommand .matchday-scene")).toHaveAttribute("data-phase", "pre_match");
  await expect(page.locator("#matchdayCommand .matchday-scene-action")).toHaveText("Start kampen");
  await page.locator("#matchdayCommand .matchday-scene-action").click();
  await expect(page.locator("#matchdayCommand .matchday-scene")).toHaveAttribute("data-phase", "live");
});

test("kampdagen har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMatchday(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.matchday-scene-status-card[data-matchday-target="details"]').first().click();
  await expectNoHorizontalOverflow(page);
});

test("kampdagen har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openMatchday(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="kamp"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("kampdagen har en låst visuell baseline på nettbrett", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await openMatchday(page);
  await page.locator("#matchdayCommandPanel").scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot("matchday-768.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
});
