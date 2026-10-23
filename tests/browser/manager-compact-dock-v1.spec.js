import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_compact_dock_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "HG Liga",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-manager-compact-dock", "mobile");
});

test("mobilen har én samlet dock, ikke et ekstra navigasjonsfelt over spillet", async ({ page }) => {
  const nav = page.locator(".main-nav");
  const footer = page.locator("manager-next-action .site-footer");
  await expect(footer.locator(".main-nav")).toHaveCount(1);
  await expect(page.locator("body > .main-nav")).toHaveCount(0);

  const tabs = nav.locator('.nav-tab[data-nav-modes~="league"]:visible');
  await expect(tabs).toHaveCount(5);
  await expect(tabs).toHaveText(["Kontor", "Lag", "Speiding", "Kamp", "Stats"]);

  const geometry = await page.evaluate(() => {
    const box = (selector) => document.querySelector(selector).getBoundingClientRect();
    const dock = box("manager-next-action .site-footer");
    const app = box("#app");
    const breadcrumb = box("#managerLocationBar");
    return {
      dockHeight: dock.height,
      appBottom: app.bottom,
      dockTop: dock.top,
      breadcrumbWidth: breadcrumb.width,
      breadcrumbHeight: breadcrumb.height,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(geometry.dockHeight).toBeLessThanOrEqual(125);
  expect(geometry.appBottom).toBeLessThanOrEqual(geometry.dockTop + 1);
  expect(geometry.breadcrumbWidth).toBeLessThanOrEqual(1);
  expect(geometry.breadcrumbHeight).toBeLessThanOrEqual(1);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
});

test("dock-faner og dagens neste handling fungerer etter flytting", async ({ page }) => {
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

  await page.locator("#nextActionPrimary").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  await page.locator('.main-nav [data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  await page.locator('.main-nav [data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
});

test("navigasjonen returnerer til toppen på store skjermer og tilbake ved mobilbredde", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.locator("html")).toHaveAttribute("data-manager-compact-dock", "desktop");
  await expect(page.locator("body > .main-nav")).toHaveCount(1);
  await expect(page.locator("manager-next-action .main-nav")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("html")).toHaveAttribute("data-manager-compact-dock", "mobile");
  await expect(page.locator("manager-next-action .main-nav")).toHaveCount(1);
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
});
