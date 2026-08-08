import { expect, test } from "@playwright/test";

async function expectLeagueNextHidden(page) {
  await expect(page.locator("manager-next-action")).toBeHidden();
  await expect(page.locator("#nextActionStrip")).toBeHidden();
  await expect(page.locator("#nextActionPrimary")).toBeHidden();
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

test("global Forslag til neste steg er skjult gjennom hele ligaspillet", async ({ page }) => {
  await expectLeagueNextHidden(page);

  const areas = ["tactics", "historygo", "kamp", "statistikk", "dashboard"];
  for (const target of areas) {
    await page.locator(`.main-nav [data-tab-target="${target}"]`).click();
    await expectLeagueNextHidden(page);
  }
});

test("Neste-flaten kommer ikke tilbake på Lag · Trening", async ({ page }) => {
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await expectLeagueNextHidden(page);
});

test("Neste-flaten er også borte på smal iPad/mobilbredde", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await expectLeagueNextHidden(page);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
