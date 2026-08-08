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
      id: `training-r${number}-${index}`,
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
    seed: "manager-training-scene-v2",
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
    completedMatchIds: ["training-r1-0", "training-r1-1"],
    createdFrom: "browser training scene v2"
  };
}

async function openTraining(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
}

async function openCalendarTraining(page, day = 3, eventId = "team-training") {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator(`#managerCalendarDays .manager-calendar-day-button[data-day="${day}"]`).click();
  await page.locator(`#managerCalendarTimeline [data-event-id="${eventId}"]`).click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
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
      activeLeagueSaveId: "training_scene_v2",
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
  await expect(page.locator("#managerTrainingDay")).toBeAttached();
});

test("Trening er én faktisk treningsdag med fire økter og uten gammel kommandovegg", async ({ page }) => {
  await openTraining(page);
  await expect(page.locator("#managerTrainingDay h2")).toHaveText("Treningsdag");
  await expect(page.locator("#trainingDayBackCalendar")).toContainText("Kalender · Uke");
  await expect(page.locator("#trainingDaySessions .training-day-session")).toHaveCount(4);
  await expect(page.locator("#trainingDayAssistant")).not.toBeEmpty();
  await expect(page.locator("#trainingDayCondition")).not.toBeEmpty();
  await expect(page.locator("#trainingDayOpponent")).not.toBeEmpty();
  await expect(page.locator("#trainingCommandPanel")).toBeHidden();
  await expect(page.locator("#trainingDepth")).toBeHidden();
  await expect(page.locator("#teamTrainingSelectedState")).toBeHidden();
});

test("program fokus og individuell oppfølging åpner komplette eksisterende valg i felles drawer", async ({ page }) => {
  await openTraining(page);
  await expect(page.locator("#teamChangeTrainingProgram")).toBeAttached();

  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#managerTeamChoiceDrawerBody #trainingPrograms")).toBeVisible();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();

  await page.locator("#trainingDayChangeFocus").click();
  await expect(page.locator("#managerTeamChoiceDrawerBody #weeklyTrainingOptions")).toBeVisible();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();

  await page.locator("#trainingDayChangeIndividual").click();
  await expect(page.locator("#managerTeamChoiceDrawerBody #individualTrainingPicker")).toBeVisible();
});

test("kalenderhendelsen eier dagkonteksten og retur går tilbake til samme dag", async ({ page }) => {
  await openCalendarTraining(page, 4, "individual-follow-up");
  await expect(page.locator("#trainingDayBackCalendar")).toContainText("Torsdag");
  await expect(page.locator("#trainingDayEvent")).toHaveText("Individuell oppfølging");
  await expect(page.locator("#managerLocationText")).toHaveText("Lag · Trening · Torsdag");

  await page.locator("#trainingDayReturnCalendar").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator('#managerCalendarDays .manager-calendar-day-button[aria-selected="true"]')).toHaveAttribute("data-day", "4");
  await expect(page.locator("#managerCalendarSelectedDay")).toContainText("Torsdag");
});

test("treningsdagen og valgdraweren har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalendarTraining(page, 3, "team-training");
  await expectNoHorizontalOverflow(page);
  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("treningsdagen har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openCalendarTraining(page, 3, "team-training");
  const results = await new AxeBuilder({ page })
    .include("#managerTrainingDay")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
