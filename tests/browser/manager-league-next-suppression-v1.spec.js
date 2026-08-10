import { expect, test } from "@playwright/test";

async function expectCalendarFooter(page) {
  const host = page.locator("manager-next-action");
  await expect(host).toBeVisible();
  await expect(host).toHaveAttribute("data-calendar-owned", "true");
  await expect(page.locator("#nextActionStrip")).toHaveAttribute("data-surface", "manager-calendar");
  await expect(page.locator("#nextActionStrip")).toHaveAttribute("aria-label", "Managerkalender · neste hendelse");
  await expect(page.locator("#nextActionStrip .next-action-head .eyebrow")).toHaveText("Managerkalender");
  await expect(page.locator("#nextActionPrimaryTag")).toHaveText("Kalender");
  await expect(page.locator("#nextActionPrimaryTitle")).not.toBeEmpty();
  await expect(page.locator("#nextActionPrimaryHint")).not.toBeEmpty();
  await expect(page.locator("#nextActionPrimary")).toBeEnabled();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "next_suppression_save",
      clubName: "Viking",
      takeoverClubId: "viking",
      managerName: "Manager",
      leagueName: "HG Liga",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("kalenderfooteren er synlig gjennom hele ligaspillet", async ({ page }) => {
  await expectCalendarFooter(page);

  const areas = ["tactics", "historygo", "kamp", "statistikk", "dashboard"];
  for (const target of areas) {
    await page.locator(`.main-nav [data-tab-target="${target}"]`).click();
    await expectCalendarFooter(page);
  }
});

test("kalenderfooteren blir stående på Lag · Trening", async ({ page }) => {
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await expectCalendarFooter(page);
});

test("kalenderfooteren virker også på smal mobilbredde", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await expectCalendarFooter(page);

  await page.locator("#nextActionPrimary").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator('#managerCalendarDays [aria-current="date"]')).toHaveAttribute("aria-selected", "true");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
