import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openCalendar(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
  const calendar = page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="calendar"]');
  await expect(calendar).toHaveText("Kalender");
  await calendar.click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
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
      activeLeagueSaveId: "manager_calendar_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: [],
      hiredStaffIds: [],
      earnedBadgeIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubWeekState: {
        week: 3,
        phase: "training",
        boardTrust: 50,
        playerMorale: 50,
        tacticalClarity: 50,
        trainingCulture: 50,
        mediaPressure: 50
      }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="calendar"]')).toBeAttached();
});

test("Kalender ligger under Kontor og viser en syvdagers manageruke", async ({ page }) => {
  await openCalendar(page);
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
  await expect(page.locator("#managerCalendarNow")).toHaveText("Uke 3 · Onsdag");
  await expect(page.locator("#managerCalendarDays > li")).toHaveCount(7);
  await expect(page.locator("#managerCalendarDays > li").nth(0)).toContainText("Mandag");
  await expect(page.locator("#managerCalendarDays > li").nth(6)).toContainText("Søndag");
  await expect(page.locator('#managerCalendarDays > li[aria-current="date"]')).toHaveCount(1);
  await expect(page.locator('#managerCalendarDays > li[aria-current="date"]')).toContainText("Onsdag");
});

test("manageruka plasserer eksisterende funksjoner på riktige dager", async ({ page }) => {
  await openCalendar(page);
  const days = page.locator("#managerCalendarDays > li");
  await expect(days.nth(1)).toContainText("Innboks og klubbdrift");
  await expect(days.nth(2)).toContainText("Treningsarbeid");
  await expect(days.nth(3)).toContainText("individuell oppfølging");
  await expect(days.nth(4)).toContainText("Kampforberedelse");
  await expect(days.nth(5)).toContainText(/Kampdag|Kamp mot/);
  await expect(days.nth(6)).toContainText("Etterkamp og oppsummering");
});

test("Kalender har ingen egen progresjonsknapp", async ({ page }) => {
  await openCalendar(page);
  await expect(page.locator('[data-tab-section="calendar"] button')).toHaveCount(0);
  await expect(page.locator("#nextActionPrimary")).toHaveCount(1);
  await expect(page.locator(".manager-calendar-rule")).toContainText("Tidslinje, ikke veiviser");
});

test("Kalender endrer ikke de fem hovedområdene", async ({ page }) => {
  const leagueTabs = page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible');
  await expect(leagueTabs).toHaveCount(5);
  await expect(leagueTabs).toHaveText(["Kontor", "Lag", "Speiding", "Kamp", "Stats"]);
  await openCalendar(page);
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="dashboard"]')).toHaveAttribute("aria-selected", "true");
});

test("Kalender har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalendar(page);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("#managerCalendarDays > li")).toHaveCount(7);
});

test("Kalender har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openCalendar(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="calendar"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
