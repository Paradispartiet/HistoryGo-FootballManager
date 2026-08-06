import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openClub(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="board"]').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
  await expect(page.locator("#clubCommandPanel")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_club_scene_v1",
      clubName: "Bislett FK",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Bygg klubben med en tydelig sportslig retning."
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("klubbkontoret samler forventning, prioritet og fire operative funksjoner", async ({ page }) => {
  await openClub(page);
  await expect(page.locator("#clubCommand h2")).toHaveText("Klubbkontoret");
  await expect(page.locator(".club-expectation-card strong")).not.toBeEmpty();
  await expect(page.locator(".club-priority-card strong")).not.toBeEmpty();
  await expect(page.locator(".club-command-action")).toBeVisible();
  await expect(page.locator(".club-command-status")).toHaveCount(4);
  await expect(page.locator(".club-command-metrics article")).toHaveCount(5);
  await expect(page.locator('.app-subtab[data-subnav-parent="board"][data-tab-target="board"]')).toHaveText("Klubboversikt");
  expect(await page.locator("#clubDepth").getAttribute("open")).toBeNull();
  await expect(page.locator('.app-subtab[data-tab-target="facilities"]')).toHaveCount(0);
  await expect(page.locator('.app-subtab[data-tab-target="market"]')).toHaveCount(0);
});

test("statuskort åpner eksisterende klubbflater og styredybde", async ({ page }) => {
  await openClub(page);
  await page.locator('.club-command-status[data-club-target="admin"]').click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#availableStaffList")).toBeVisible();

  await page.locator('.main-nav [role="tab"][data-tab-target="board"]').click();
  await expect(page.locator("#clubCommandPanel")).toBeVisible();
  await page.locator('.club-command-status[data-club-target="historygo"]').click();
  await expect(page.locator('[data-tab-section="historygo"]')).toBeVisible();
  await expect(page.locator("#unlockedPlayersList")).toBeVisible();

  await page.locator('.main-nav [role="tab"][data-tab-target="board"]').click();
  await page.locator('.club-command-status[data-club-target="details"]').click();
  await expect(page.locator("#clubDepth")).toHaveAttribute("open", "");
});

test("klubbkontoret har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openClub(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.club-command-status[data-club-target="details"]').click();
  await expectNoHorizontalOverflow(page);
});

test("klubbkontoret har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openClub(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="board"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("klubbkontoret har en låst visuell baseline på nettbrett", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await openClub(page);
  await page.locator("#clubCommandPanel").scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot("club-768.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
});
