import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openSquad(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#squadTacticsCommandPanel")).toBeVisible();
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
      activeLeagueSaveId: "squad_scene_v2",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("Lag viser kommandonivå, fire statuser og eksisterende taktikkbrett", async ({ page }) => {
  await openSquad(page);
  await expect(page.locator("#squadTacticsCommand h2")).toHaveText("Lag og taktikk");
  await expect(page.locator(".squad-tactics-status")).toHaveCount(4);
  await expect(page.locator(".squad-tactics-identity strong")).not.toBeEmpty();
  await expect(page.locator(".squad-tactics-reading-card strong")).not.toBeEmpty();
  await expect(page.locator(".squad-tactics-command-action")).toBeVisible();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#formationSelect")).toBeVisible();
  await expect(page.locator("#tacticSelect")).toBeVisible();
});

test("statuskort fører til eksisterende lagflater", async ({ page }) => {
  await openSquad(page);
  await page.locator('.squad-tactics-status[data-squad-tactics-target="formation"]').click();
  await expect(page.locator("#formationSelect")).toBeFocused();
  await page.locator('.squad-tactics-status[data-squad-tactics-target="lineup"]').click();
  await expect(page.locator("#lineupSlots")).toBeInViewport();
  await page.locator('.squad-tactics-status[data-squad-tactics-target="bench"]').last().click();
  await expect(page.locator("#benchPlayersList")).toBeInViewport();
});

test("Lag og taktikk har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSquad(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.squad-tactics-status[data-squad-tactics-target="formation"]').click();
  await expectNoHorizontalOverflow(page);
});

test("Lag og taktikk har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openSquad(page);
  const results = await new AxeBuilder({ page })
    .include("#squadTacticsCommandPanel")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
