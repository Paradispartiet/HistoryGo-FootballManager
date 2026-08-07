import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openScouting(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="historygo"]').click();
  await expect(page.locator('[data-tab-section="historygo"]')).toBeVisible();
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
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
      activeLeagueSaveId: "scouting_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: ["kfum_arena"],
      hiredStaffIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("Rekrutterbare er en tett liste og bruker den delte spillerprofilen", async ({ page }) => {
  await openScouting(page);
  await expect(page.locator("#managerLocationText")).toHaveText("Speiding · Rekrutterbare");
  await expect.poll(async () => page.locator("#scoutingRecruitableBody tr").count()).toBeGreaterThan(3);
  await expect(page.locator(".scouting-player-table thead")).toContainText("Tilgang fra");
  await expect(page.locator(".scouting-player-table thead")).not.toContainText("Overall");

  const firstName = await page.locator("#scoutingRecruitableBody .scouting-player-link strong").first().innerText();
  await page.locator("#scoutingRecruitableSearch").fill(firstName);
  await expect(page.locator("#scoutingRecruitableBody tr")).toHaveCount(1);
  await page.locator("#scoutingRecruitableBody .scouting-player-link").first().click();
  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  await expect(page.locator(".manager-player-profile-identity h2")).toHaveText(firstName);
});

test("Andre klubber viser hele ligapyramiden unntatt egen klubb og HG-kandidater", async ({ page }) => {
  await openScouting(page);
  await page.locator('.app-subtab[data-tab-target="scoutingClubs"]').click();
  await expect(page.locator('[data-tab-section="scoutingClubs"]')).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Speiding · Andre klubber");
  await expect.poll(async () => page.locator("#scoutingClubBody tr").count()).toBeGreaterThan(30);
  await expect(page.locator("#scoutingClubBody")).not.toContainText("Rosenborg");

  const valenga = page.locator(".scouting-club-button", { hasText: "Vålerenga" });
  await expect(valenga).toBeVisible();
  await valenga.click();
  await expect(page.locator("#scoutingClubDetail h3")).toHaveText("Vålerenga");
  await expect.poll(async () => page.locator("#scoutingClubDetail .scouting-club-player-row").count()).toBeGreaterThan(0);
  await page.locator("#scoutingClubDetail .scouting-player-link").first().click();
  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
});

test("Speiding har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openScouting(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.app-subtab[data-tab-target="scoutingClubs"]').click();
  await expectNoHorizontalOverflow(page);
  await page.locator(".scouting-club-button").first().click();
  await expectNoHorizontalOverflow(page);
});

test("Speiding har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openScouting(page);
  for (const target of ["historygo", "scoutingClubs"]) {
    if (target === "scoutingClubs") await page.locator('.app-subtab[data-tab-target="scoutingClubs"]').click();
    const results = await new AxeBuilder({ page })
      .include(`[data-tab-section="${target}"]`)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  }
});
