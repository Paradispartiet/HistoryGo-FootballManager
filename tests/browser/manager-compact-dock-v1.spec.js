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
  await expect(page.locator("#fmuvHome")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Hjem · Portal");
  await page.locator('.main-nav [data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="calendar"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
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
  await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="calendar"]').click();
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


test("tynn footer på mobil og iPad beholder 44px trykkflater", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844, mobile: true },
    { width: 760, height: 1024, mobile: true },
    { width: 768, height: 1024, mobile: false },
    { width: 1194, height: 834, mobile: false },
    { width: 1280, height: 900, mobile: false }
  ]) {
    await page.setViewportSize(viewport);
    const action = page.locator("#nextActionPrimary");
    await expect(action).toBeVisible();
    const measurements = await page.evaluate(() => {
      const footer = document.querySelector("manager-next-action .site-footer");
      const primary = document.querySelector("#nextActionPrimary");
      const tabs = [...document.querySelectorAll('.main-nav .nav-tab[data-nav-modes~="league"]:not([hidden])')];
      return {
        height: footer.getBoundingClientRect().height,
        primaryHeight: primary.getBoundingClientRect().height,
        tabHeights: tabs.filter((tab) => getComputedStyle(tab).display !== "none").map((tab) => tab.getBoundingClientRect().height),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(measurements.height, `footer at ${viewport.width}px`).toBeLessThanOrEqual(viewport.mobile ? 108 : 64);
    expect(measurements.primaryHeight).toBeGreaterThanOrEqual(44);
    expect(measurements.tabHeights).toHaveLength(5);
    expect(measurements.tabHeights.every((height) => height >= 44)).toBe(true);
    expect(measurements.overflow).toBeLessThanOrEqual(1);
  }
  await page.locator("#nextActionPrimary").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
});
