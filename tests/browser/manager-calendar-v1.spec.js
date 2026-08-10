import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openOfficeCalendar(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
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

test("aktiv ligasave starter direkte i managerkalenderen", async ({ page }) => {
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
  await expect(page.locator("#managerCalendarNow")).toHaveText("Uke 3 · Onsdag");
});

test("Kontor åpner Kalender direkte og skjuler separat Innboks", async ({ page }) => {
  await openOfficeCalendar(page);
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="calendar"]')).toBeVisible();
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="inbox"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]')).toHaveText("Klubben");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="officeHelp"]')).toBeHidden();
});

test("Kalender viser syv valgbare dager og den faktiske arbeidsdagen", async ({ page }) => {
  await openOfficeCalendar(page);
  await expect(page.locator("#managerCalendarNow")).toHaveText("Uke 3 · Onsdag");
  const days = page.locator("#managerCalendarDays .manager-calendar-day-button");
  await expect(days).toHaveCount(7);
  await expect(days.nth(0)).toContainText("MAN");
  await expect(days.nth(6)).toContainText("SØN");
  await expect(page.locator('#managerCalendarDays [aria-current="date"]')).toHaveCount(1);
  await expect(page.locator('#managerCalendarDays [aria-current="date"]')).toHaveAttribute("data-day", "3");
  await expect(page.locator('#managerCalendarDays [aria-selected="true"]')).toHaveAttribute("data-day", "3");
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Onsdag");
});

test("onsdag viser kronologisk trening og manglende program der arbeidet skjer", async ({ page }) => {
  await openOfficeCalendar(page);
  const events = page.locator("#managerCalendarTimeline .manager-calendar-event-button");
  await expect(events).toHaveCount(5);
  await expect(page.locator('[data-event-id="training-meeting"]')).toContainText("09:30");
  await expect(page.locator('[data-event-id="training-meeting"]')).toContainText("Trenermøte");
  await expect(page.locator('[data-event-id="team-training"]')).toContainText("11:00");
  await expect(page.locator('[data-event-id="team-training"]')).toContainText("Treningsprogram mangler");
  await expect(page.locator('[data-event-id="team-training"]')).toContainText("Velg program");
});

test("fredag inneholder både kampforberedelse og pressearbeid", async ({ page }) => {
  await openOfficeCalendar(page);
  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="5"]').click();
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Fredag");
  const events = page.locator("#managerCalendarTimeline .manager-calendar-event-button");
  await expect(events).toHaveCount(2);
  await expect(events.nth(0)).toContainText("10:00");
  await expect(events.nth(0)).toContainText("Kampforberedelse");
  await expect(events.nth(1)).toContainText("13:00");
  await expect(events.nth(1)).toContainText("Pressebrief før kamp");
  await expect(page.locator('#managerCalendarTimeline [data-event-id="press-brief"]')).toContainText("Presseansvarlig");
});

test("melding åpnes i drawer og kalenderdagen blir stående", async ({ page }) => {
  await openOfficeCalendar(page);
  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="3"]').click();
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Onsdag");
  const message = page.locator('#managerCalendarTimeline [data-event-kind="message"]').first();
  await expect(message).toBeVisible();
  await expect(message).toContainText("Les mail");
  await message.click();
  await expect(page.locator("#managerCalendarMessageDrawer")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
  await page.locator("#managerCalendarMessageDrawer .manager-calendar-drawer-close").click();
  await expect(page.locator("#managerCalendarMessageDrawer")).toBeHidden();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Onsdag");
});

test("kalenderfooteren viser dagens neste hendelse og åpner aktuell dag", async ({ page }) => {
  await openOfficeCalendar(page);
  await expect(page.locator("manager-next-action")).toBeVisible();
  await expect(page.locator("#nextActionStrip")).toHaveAttribute("data-surface", "manager-calendar");
  await expect(page.locator("#nextActionPrimaryTag")).toHaveText("Kalender");
  await expect(page.locator("#nextActionPhase")).toHaveText("Uke 3 · Onsdag");
  await expect(page.locator("#nextActionPrimaryTitle")).toContainText("Onsdag");

  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="5"]').click();
  await expect(page.locator('#managerCalendarDays [aria-selected="true"]')).toHaveAttribute("data-day", "5");
  await page.locator("#nextActionPrimary").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator('#managerCalendarDays [aria-selected="true"]')).toHaveAttribute("data-day", "3");
});

test("Kalender beholder Kontor som hovedområde", async ({ page }) => {
  await openOfficeCalendar(page);
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="dashboard"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="dashboard"]')).toHaveClass(/is-active/);
});

test("Kalender har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openOfficeCalendar(page);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("#managerCalendarDays .manager-calendar-day-button")).toHaveCount(7);
  await expect(page.locator("#managerCalendarTimeline .manager-calendar-event-button").first()).toBeVisible();
});

test("Kalender har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openOfficeCalendar(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="calendar"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
