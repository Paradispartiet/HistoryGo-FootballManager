import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function seededSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 82 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 80 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 79 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const round = (number, matches, completed = false) => ({
    round: number,
    status: completed ? "completed" : "scheduled",
    matches: matches.map((match, index) => ({
      id: `office-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });

  return {
    version: "historygo-football-manager.league-season.v3",
    competition: {
      id: "hg-eliteserien",
      mode: "league",
      tierId: "eliteserien",
      tierName: "Eliteserien",
      tierLevel: 1,
      clubCount: 4,
      rounds: 6,
      homeAndAway: true,
      points: { win: 3, draw: 1, loss: 0 },
      version: 3
    },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-office-inbox-scene",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [
        { home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } },
        { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }
      ], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["office-r1-0", "office-r1-1"],
    createdFrom: "browser office and inbox scene"
  };
}

async function openOffice(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
}

async function openTuesdayMessage(page) {
  await openOffice(page);
  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="2"]').click();
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Tirsdag");
  const message = page.locator('#managerCalendarTimeline [data-event-kind="message"]');
  await expect(message).toBeVisible();
  await message.click();
  await expect(page.locator("#managerCalendarMessageDrawer")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "office_inbox_scene_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="calendar"]')).toBeAttached();
});

test("Kontor åpner Kalender; Innboks og Oppstartshjelp er ikke parallelle normalfaner", async ({ page }) => {
  await openOffice(page);
  await expect(page.locator('.app-subtab[data-tab-target="dashboard"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="inbox"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="officeHelp"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="board"]')).toHaveText("Klubben");
  await expect(page.locator("#officeCommandPanel")).toBeHidden();
});

test("innboksmotoren beholder fokus og kø som intern meldingskilde", async ({ page }) => {
  await openOffice(page);
  await expect(page.locator("#inboxFocusTitle")).not.toBeEmpty();
  await expect(page.locator("#inboxThreadList")).toBeAttached();
  await expect(page.locator("#inboxQueueList")).toBeAttached();
  await expect(page.locator("#inboxSignalUnread")).toBeAttached();
  await expect(page.locator("#inboxSignalReplies")).toBeAttached();
  await expect(page.locator('[data-tab-section="inbox"]')).toBeHidden();
});

test("melding åpnes fra tirsdag i drawer med eksakt klubbmail", async ({ page }) => {
  await expect(page.locator("#inboxThreadList .inbox-thread-card, #inboxQueueList .inbox-thread-card").first()).toBeAttached();
  await openTuesdayMessage(page);
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender · Melding");
  await expect(page.locator("#managerCalendarDrawerBody .manager-club-mail")).toHaveCount(1);
  const eventId = await page.locator('#managerCalendarTimeline [data-event-kind="message"]').first().getAttribute("data-event-id");
  await expect(page.locator("#managerCalendarDrawerBody .manager-club-mail")).toHaveAttribute("data-message-id", eventId || "");
  await expect(page.locator("#managerCalendarDrawerTitle")).not.toBeEmpty();
});

test("lukking av melding returnerer til samme kalenderdag", async ({ page }) => {
  await openTuesdayMessage(page);
  await page.locator("#managerCalendarMessageDrawer .manager-calendar-drawer-close").click();
  await expect(page.locator("#managerCalendarMessageDrawer")).toBeHidden();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Tirsdag");
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
});

test("kalenderens treningshendelse går direkte til trening", async ({ page }) => {
  await openOffice(page);
  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="3"]').click();
  await page.locator('#managerCalendarTimeline [data-event-id="team-training"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
});

test("Kontor, Kalender og meldingsdrawer har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openOffice(page);
  await expectNoHorizontalOverflow(page);
  await openTuesdayMessage(page);
  await expectNoHorizontalOverflow(page);
});

test("Kalender og meldingsdrawer har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openTuesdayMessage(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="calendar"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
