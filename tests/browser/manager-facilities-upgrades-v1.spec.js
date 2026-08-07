import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openFacilities(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
  await page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
  await expect(page.locator("#clubCommandPanel")).toBeVisible();
  await page.locator('.club-command-status[data-club-target="facilities"]').click();
  await expect(page.locator('[data-tab-section="facilities"]')).toBeVisible();
  await expect(page.locator("#managerFacilitiesWorkspace")).toBeVisible();
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
      activeLeagueSaveId: "facilities_v1",
      clubName: "Bislett FK",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Bygg klubben."
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("fasiliteter har tre reelle nivåer og ett managerstyrt valg per uke", async ({ page }) => {
  await openFacilities(page);
  await expect(page.locator(".manager-facility-card")).toHaveCount(3);
  await expect(page.locator('.manager-facility-card[data-facility-id="training"] .manager-facility-level')).toHaveText("Nivå 1 av 3");
  await expect(page.locator(".facility-upgrade-action:enabled")).toHaveCount(3);

  await page.locator('.facility-upgrade-action[data-facility-id="training"]').click();
  await expect(page.locator('.manager-facility-card[data-facility-id="training"] .manager-facility-level')).toHaveText("Nivå 2 av 3");
  await expect(page.locator(".facility-upgrade-action:enabled")).toHaveCount(0);
  await expect(page.locator(".facility-week-choice")).toContainText("Treningsanlegg");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}"));
  expect(saved.facilities.levels.training).toBe(2);
  expect(saved.facilities.lastUpgradeWeek).toBeGreaterThanOrEqual(1);

  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await openFacilities(page);
  await expect(page.locator('.manager-facility-card[data-facility-id="training"] .manager-facility-level')).toHaveText("Nivå 2 av 3");
});

test("fasilitetsflaten fungerer på 390 px uten overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFacilities(page);
  await expect(page.locator(".manager-facility-grid")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("fasilitetsflaten har ingen alvorlige WCAG-brudd", async ({ page }) => {
  await openFacilities(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="facilities"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
