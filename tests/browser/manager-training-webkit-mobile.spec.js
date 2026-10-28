import { expect, test } from "@playwright/test";

// Linux WebKit emulates Safari's engine, not physical iOS Safari.
// Seed only missing storage keys: reloading must NOT replace saved choices.
function seededSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 82 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 80 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 79 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const round = (number, matches, done = false) => ({
    round: number, status: done ? "completed" : "scheduled",
    matches: matches.map((m, index) => ({
      id: "webkit-r" + number + "-" + index, round: number,
      status: done ? "completed" : "scheduled", result: done ? m.result : null,
      homeClubId: m.home, awayClubId: m.away
    }))
  });
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 6, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "training-webkit-mobile", seasonNumber: 1, managerClubId: "rosenborg",
    clubs, currentRound: 2, status: "active",
    fixtures: [
      round(1, [{ home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } }, { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }])
    ],
    completedMatchIds: ["webkit-r1-0", "webkit-r1-1"], createdFrom: "browser webkit training QA"
  };
}

async function openTraining(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
}

async function noHorizontalOverflow(page) {
  const difference = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(difference).toBeLessThanOrEqual(1);
}

async function readSavedChoices(page) {
  return page.evaluate(() => {
    const program = JSON.parse(localStorage.getItem("hgfm.weeklyTrainingProgram.v1") || "null");
    const focus = JSON.parse(localStorage.getItem("hgfm.weeklyTrainingFocus.v1") || "null");
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    return {
      programId: program?.programId || null,
      focusId: focus?.focusId || null,
      week: merits.clubWeekState?.week ?? null,
      phase: merits.clubWeekState?.phase ?? null,
      keys: Object.keys(localStorage).sort()
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    if (!localStorage.getItem("hgfm.onboarded.v1")) {
      localStorage.setItem("hgfm.onboarded.v1", "1");
    }
    if (!localStorage.getItem("hgfm.gameStartState.v1")) {
      localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
        selectedMode: "league", activeLeagueSaveId: "training_webkit_mobile",
        clubName: "Rosenborg", takeoverClubId: "rosenborg", managerName: "Manager",
        leagueName: "Eliteserien", leagueSeasonStatus: "active", boardExpectation: "Øvre halvdel"
      }));
    }
    if (!localStorage.getItem("historygo-football-manager.league-season.v3")) {
      localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    }
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerTrainingDay")).toBeAttached();
});

test("iPhone WebKit: reelle treningsvalg overlever reload og Til Kamp flytter ikke fasen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "webkit-training-iphone", "Bare iPhone-emulering");
  await openTraining(page);
  await expect(page.locator("#trainingDaySessions .training-day-session")).toHaveCount(4);
  await noHorizontalOverflow(page);

  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawerBody #trainingPrograms")).toBeVisible();
  await page.locator("#managerTeamChoiceDrawerBody .training-program-select:enabled").first().click();
  await expect.poll(async () => (await readSavedChoices(page)).programId).not.toBeNull();
  const programTitle = (await page.locator("#trainingDayProgramTitle").textContent()).trim();
  expect(programTitle).not.toBe("Ikke valgt");

  const done = page.locator("#managerTeamChoiceDrawer .manager-team-choice-done");
  if (await done.isVisible()) await done.click();
  await page.locator("#trainingDayChangeFocus").click();
  await expect(page.locator("#managerTeamChoiceDrawerBody #weeklyTrainingOptions")).toBeVisible();
  await page.locator("#managerTeamChoiceDrawerBody #weeklyTrainingOptions .weekly-training-card button:enabled").first().click();
  await expect.poll(async () => (await readSavedChoices(page)).focusId).not.toBeNull();
  const selectedFocus = (await page.locator("#trainingDayFocus").textContent()).trim();
  expect(selectedFocus).not.toBe("Ikke valgt");
  if (await done.isVisible()) await done.click();

  const stored = await readSavedChoices(page);
  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await openTraining(page);
  await expect(page.locator("#trainingDayProgramTitle")).toHaveText(programTitle);
  await expect(page.locator("#trainingDayFocus")).toHaveText(selectedFocus);
  const reloaded = await readSavedChoices(page);
  expect(reloaded.programId).toBe(stored.programId);
  expect(reloaded.focusId).toBe(stored.focusId);
  expect(reloaded.week).toBe(stored.week);
  expect(reloaded.phase).toBe(stored.phase);

  await expect(page.locator("#trainingDayNextAction")).toHaveText("Til Kamp");
  const beforeNavigation = await readSavedChoices(page);
  await page.locator("#trainingDayNextAction").click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  const afterNavigation = await readSavedChoices(page);
  expect(afterNavigation.week).toBe(beforeNavigation.week);
  expect(afterNavigation.phase).toBe(beforeNavigation.phase);
  expect(afterNavigation.programId).toBe(beforeNavigation.programId);
  expect(afterNavigation.focusId).toBe(beforeNavigation.focusId);
  expect(afterNavigation.keys).toEqual(beforeNavigation.keys);
});

test("iPad WebKit: lesbare fire økter, drawere og navngitt troppspanel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "webkit-training-ipad", "Bare iPad-emulering");
  await openTraining(page);
  await expect(page.locator("#trainingDaySessions .training-day-session")).toHaveCount(4);
  await expect(page.locator("#trainingDayCondition")).not.toBeEmpty();
  await expect(page.locator("#trainingDayNextTitle")).not.toBeEmpty();
  await noHorizontalOverflow(page);

  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawerBody #trainingPrograms")).toBeVisible();
  await noHorizontalOverflow(page);
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await page.locator("#trainingDayChangeFocus").click();
  await expect(page.locator("#managerTeamChoiceDrawerBody #weeklyTrainingOptions")).toBeVisible();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();

  const keysBefore = (await readSavedChoices(page)).keys;
  await page.evaluate(() => {
    const list = document.getElementById("squadConditionList");
    list.replaceChildren(...[
      ["is-injured", "Skadet testspiller", "Ute 2 uker."],
      ["is-tired", "Sliten testspiller", "Bør hviles før neste kamp."]
    ].map(([type, name, advice]) => {
      const row = document.createElement("li");
      row.className = type;
      const label = document.createElement("strong");
      label.textContent = name;
      const detail = document.createElement("span");
      detail.textContent = advice;
      row.append(label, detail);
      return row;
    }));
  });
  await expect(page.locator("#trainingDayRiskDetails")).toBeVisible();
  const riskSummary = page.locator("#trainingDayRiskSummary");
  await riskSummary.click();
  await expect(page.locator("#trainingDayRiskList .is-injured strong")).toHaveText("Skadet testspiller");
  await expect(page.locator("#trainingDayRiskList .is-tired span")).toContainText("Bør hviles");
  await noHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/training-day-webkit-ipad.png", animations: "disabled" });
  await riskSummary.click();
  await expect(page.locator("#trainingDayRiskList")).toBeHidden();
  await page.evaluate(() => document.getElementById("squadConditionList").replaceChildren());
  await expect(page.locator("#trainingDayRiskDetails")).toBeHidden();
  expect((await readSavedChoices(page)).keys).toEqual(keysBefore);
});
