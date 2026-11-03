import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_medium_mobile_density_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("431–760px beholder kompakt Manageruka-prioritet uten sidelekkasje", async ({ page }) => {
  for (const width of [431, 500, 600, 760]) {
    await page.setViewportSize({ width, height: 932 });
    await expect(page.locator("html")).toHaveAttribute("data-manager-compact-dock", "mobile");
    await page.locator("#fmuvOpenHome").click();
    await expect(page.locator("#fmuvHome")).toBeVisible();

    const layout = await page.evaluate(() => {
      const box = (selector) => document.querySelector(selector).getBoundingClientRect();
      const match = box("#fmuvHome .fmuv-match");
      const week = box("#fmuvHome .fmuv-week");
      const season = box("#fmuvHome .fmuv-season");
      const inbox = box("#fmuvHome .fmuv-home-inbox");
      const matchStyle = getComputedStyle(document.querySelector("#fmuvHome .fmuv-match"));
      const nameStyle = getComputedStyle(document.querySelector("#fmuvHome .fmuv-match-name"));
      const action = box("#nextActionPrimary");
      return {
        ordered: match.bottom <= week.top + 1
          && week.bottom <= season.top + 1
          && season.bottom <= inbox.top + 1,
        minimumMatchHeight: parseFloat(matchStyle.minHeight),
        minimumNameHeight: parseFloat(nameStyle.minHeight),
        cardPadding: parseFloat(matchStyle.paddingTop),
        actionHeight: action.height,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });

    expect(layout.ordered, "order at " + width + "px").toBe(true);
    expect(layout.minimumMatchHeight, "match min-height at " + width + "px").toBeLessThanOrEqual(1);
    expect(layout.minimumNameHeight, "match title min-height at " + width + "px").toBeLessThanOrEqual(1);
    expect(layout.cardPadding, "card padding at " + width + "px").toBeLessThanOrEqual(12);
    expect(layout.actionHeight, "next action at " + width + "px").toBeGreaterThanOrEqual(44);
    expect(layout.overflow, "page overflow at " + width + "px").toBeLessThanOrEqual(1);
  }
});
