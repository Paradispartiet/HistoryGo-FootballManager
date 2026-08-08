import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const AREAS = [
  ["Kontor", "dashboard", "office", "calendar", ".manager-calendar-surface"],
  ["Lag", "tactics", "team", "tactics", ".pitch-stage"],
  ["Speiding", "historygo", "scouting", "historygo", "#managerScoutingRecruitable"],
  ["Kamp", "kamp", "match", "kamp", '[data-tab-section="kamp"]'],
  ["Stats", "statistikk", "stats", "statistikk", '[data-tab-section="statistikk"]']
];
const CONTEXT_BY_TARGET = Object.fromEntries(AREAS.map(([, target, area, surface]) => [target, { area, surface }]));

async function openArea(page, target) {
  await page.locator(`.main-nav [role="tab"][data-tab-target="${target}"]`).click();
  const expected = CONTEXT_BY_TARGET[target];
  if (expected) {
    await expect(page.locator("body")).toHaveAttribute("data-manager-area", expected.area);
    await expect(page.locator("body")).toHaveAttribute("data-manager-surface", expected.surface);
  }
}

async function expectFiveColumnNav(page) {
  await expect.poll(async () => page.locator(".main-nav-inner").evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      display: style.display,
      columns: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length
    };
  })).toEqual({ display: "grid", columns: 5 });
}

async function noOverflow(page) {
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
      activeLeagueSaveId: "manager_visual_identity_v1",
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
  await expect(page.locator("#managerVisualIdentityV1Style")).toBeAttached();
  await expect(page.locator("#managerVisualIdentityLayoutV1Style")).toBeAttached();
  await expect(page.locator("body")).toHaveAttribute("data-manager-area", "office");
});

test("fem hovedområder får riktig visuell scene og lesbar femkolonne-nav", async ({ page }) => {
  const visibleTabs = page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible');
  await expect(visibleTabs).toHaveCount(5);
  await expect(visibleTabs).toHaveText(["Kontor", "Lag", "Speiding", "Kamp", "Stats"]);
  await expect(page.locator(".main-nav .nav-group-label-primary")).toBeHidden();
  await expectFiveColumnNav(page);

  for (const [, target] of AREAS) await openArea(page, target);
});

test("hovedscenene har ulike visuelle karakterer uten ny kortvegg", async ({ page }) => {
  const backgrounds = [];
  for (const [, target, , , selector] of AREAS) {
    await openArea(page, target);
    const targetNode = page.locator(selector).first();
    await expect(targetNode).toBeVisible();
    const appearance = await targetNode.evaluate((el) => {
      const style = getComputedStyle(el);
      return { backgroundImage: style.backgroundImage, borderRadius: style.borderRadius };
    });
    backgrounds.push(appearance.backgroundImage);
  }
  expect(new Set(backgrounds).size).toBeGreaterThanOrEqual(4);

  await openArea(page, "dashboard");
  const calendarRadius = await page.locator(".manager-calendar-surface").evaluate((el) => getComputedStyle(el).borderRadius);
  expect(parseFloat(calendarRadius) || 0).toBe(0);

  await openArea(page, "historygo");
  const scoutingRadius = await page.locator("#managerScoutingRecruitable").evaluate((el) => getComputedStyle(el).borderRadius);
  expect(parseFloat(scoutingRadius) || 0).toBe(0);
});

test("klubbfargen går igjen som identitetsmarkør uten heldekkende klubbflate", async ({ page }) => {
  const clubAccent = await page.locator("body").evaluate((el) => getComputedStyle(el).getPropertyValue("--club-accent").trim());
  expect(clubAccent).toMatch(/^#[0-9a-f]{6}$/i);

  await openArea(page, "dashboard");
  const selectedDay = page.locator('#managerCalendarDays .manager-calendar-day-button[aria-current="date"]');
  await expect(selectedDay).toBeVisible();
  const selectedBorder = await selectedDay.evaluate((el) => getComputedStyle(el).borderTopColor);
  expect(selectedBorder).not.toBe("rgba(0, 0, 0, 0)");

  const bodyBackground = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bodyBackground).not.toBe(clubAccent);
});

test("sceneoverskrift er sterkere enn sekundær informasjon", async ({ page }) => {
  await openArea(page, "dashboard");
  const [headingSize, detailSize] = await Promise.all([
    page.locator(".manager-calendar-head h2").evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    page.locator(".manager-calendar-event-detail").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  ]);
  expect(headingSize).toBeGreaterThan(detailSize * 1.7);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 }
]) {
  test(`Pass 6 har ingen global overflow ved ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const [, target] of AREAS) {
      await openArea(page, target);
      await noOverflow(page);
    }
    await expectFiveColumnNav(page);
  });
}

test("Pass 6 beholder alvorlig WCAG A/AA ren", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArea(page, "dashboard");
  const results = await new AxeBuilder({ page })
    .include("body")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
