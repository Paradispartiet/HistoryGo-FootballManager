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
      id: `match-calendar-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 6, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-match-calendar-v1",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [{ home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } }, { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["match-calendar-r1-0", "match-calendar-r1-1"],
    createdFrom: "browser manager match calendar v1"
  };
}

async function openCalendarDay(page, day) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  const button = page.locator(`#managerCalendarDays .manager-calendar-day-button[data-day="${day}"]`);
  await button.click();
  await expect(button).toHaveAttribute("aria-selected", "true");
}

async function setPhase(page, phase) {
  await page.evaluate((next) => sessionStorage.setItem("hgfm.test.matchCalendarPhase", next), phase);
  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
}

async function storedClubWeekPhase(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").clubWeekState?.phase);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    const phase = sessionStorage.getItem("hgfm.test.matchCalendarPhase") || "match_prep";
    const week = {
      week: 4,
      phase,
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_match_calendar_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(week));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: [],
      hiredStaffIds: [],
      earnedBadgeIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubWeekState: week
    }));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({ focusId: "formation_familiarity", week: 4, appliedSessionId: null }));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="calendar"]')).toBeAttached();
});

test("fredagens kalenderhendelse eier kampforberedelsen", async ({ page }) => {
  await openCalendarDay(page, 5);
  const event = page.locator('#managerCalendarTimeline .manager-calendar-event-button[data-event-id="match-prep"]');
  await expect(event).toContainText("Kampforberedelse");
  await event.click();

  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#managerMatchPrepDay")).toBeVisible();
  await expect(page.locator("#matchPrepBackCalendar")).toContainText("Fredag");
  await expect(page.locator("#matchPrepEvent")).toHaveText("Kampforberedelse");
  await expect(page.locator("#matchPrepOpponent")).toContainText("Viking");
  await expect(page.locator("#managerLocationText")).toHaveText("Lag · Oppstilling · Fredag");
});

test("fredagens kampforberedelse bruker komplette eksisterende valg i drawer", async ({ page }) => {
  await openCalendarDay(page, 5);
  await page.locator('#managerCalendarTimeline [data-event-id="match-prep"]').click();
  await page.locator("#matchPrepChangeSystem").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Formasjon og kampplan");
  await expect(page.locator("#formationSelect")).toBeVisible();
  await expect(page.locator("#tacticSelect")).toBeVisible();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
});

test("fredag returnerer til samme kalenderdag uten å flytte Club Week", async ({ page }) => {
  await openCalendarDay(page, 5);
  await page.locator('#managerCalendarTimeline [data-event-id="match-prep"]').click();
  await page.locator("#matchPrepReturnCalendar").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="5"]')).toHaveAttribute("aria-selected", "true");
  expect(await storedClubWeekPhase(page)).toBe("match_prep");
});

test("lørdagens kalenderhendelse eier Kamp og beholder eksisterende kampdag", async ({ page }) => {
  await setPhase(page, "matchday");
  await openCalendarDay(page, 6);
  const event = page.locator('#managerCalendarTimeline .manager-calendar-event-button[data-event-id="matchday"]');
  await expect(event).toContainText("Kamp mot Viking");
  await event.click();

  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator("#managerMatchCalendarContext")).toBeVisible();
  await expect(page.locator("#matchdayBackCalendar")).toContainText("Lørdag");
  await expect(page.locator("#matchdayCalendarEvent")).toContainText("Kamp mot Viking");
  await expect(page.locator("#matchdayCommand .matchday-scene")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kamp · Lørdag");
});

test("lørdag returnerer til samme kalenderdag uten å starte kamp", async ({ page }) => {
  await setPhase(page, "matchday");
  await openCalendarDay(page, 6);
  await page.locator('#managerCalendarTimeline [data-event-id="matchday"]').click();
  await expect(page.locator("#matchdayCommand .matchday-scene")).not.toHaveAttribute("data-phase", "live");
  await page.locator("#matchdayBackCalendar").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="6"]')).toHaveAttribute("aria-selected", "true");
  expect(await storedClubWeekPhase(page)).toBe("matchday");
});

test("fredag og lørdag har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalendarDay(page, 5);
  await page.locator('#managerCalendarTimeline [data-event-id="match-prep"]').click();
  await expectNoHorizontalOverflow(page);

  await setPhase(page, "matchday");
  await openCalendarDay(page, 6);
  await page.locator('#managerCalendarTimeline [data-event-id="matchday"]').click();
  await expectNoHorizontalOverflow(page);
});

test("de kalenderbundne kampflatene har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openCalendarDay(page, 5);
  await page.locator('#managerCalendarTimeline [data-event-id="match-prep"]').click();
  const fridayResults = await new AxeBuilder({ page })
    .include("#managerMatchPrepDay")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const fridaySerious = fridayResults.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(fridaySerious, fridaySerious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);

  await setPhase(page, "matchday");
  await openCalendarDay(page, 6);
  await page.locator('#managerCalendarTimeline [data-event-id="matchday"]').click();
  const saturdayResults = await new AxeBuilder({ page })
    .include("#managerMatchCalendarContext")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const saturdaySerious = saturdayResults.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(saturdaySerious, saturdaySerious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
