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
      id: `exercise-r${number}-${index}`,
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
    seed: "manager-training-exercise-design-v1",
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
    completedMatchIds: ["exercise-r1-0", "exercise-r1-1"],
    createdFrom: "browser training exercise design v1"
  };
}

async function openTraining(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await expect(page.locator('#trainingDaySessions .training-day-session[data-exercise-openable="true"]')).toHaveCount(4);
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
      activeLeagueSaveId: "exercise_design_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("hgfm.weeklyTrainingProgram.v1", JSON.stringify({
      programId: "recovery_prevention",
      week: 1,
      applied: false
    }));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerTrainingDay")).toBeAttached();
});

test("en konkret treningsøkt åpner et interaktivt øvelsesverksted", async ({ page }) => {
  await openTraining(page);
  const first = page.locator('#trainingDaySessions .training-day-session[data-exercise-openable="true"]').first();
  await expect(first).toHaveAttribute("role", "button");
  await expect(first).toHaveAttribute("aria-haspopup", "dialog");
  await first.click();

  const dialog = page.locator("#managerTrainingExerciseDesignV1");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#trainingExerciseTitle")).not.toBeEmpty();
  await expect(dialog.locator("#trainingExerciseObjective")).not.toBeEmpty();
  await expect(dialog.locator(".training-exercise-control")).toHaveCount(4);
  await expect(dialog.locator(".training-exercise-effect")).toHaveCount(4);
  await expect(dialog.locator("#trainingExerciseCoachingPoints li")).toHaveCount(3);
  await expect(dialog.locator("#trainingExerciseGuardrail")).toContainText("endrer ikke lagret treningsbelastning");
});

test("areal retning og touch endrer forklaringen uten å endre save-state", async ({ page }) => {
  await openTraining(page);
  const before = await page.evaluate(() => ({
    program: localStorage.getItem("hgfm.weeklyTrainingProgram.v1"),
    keys: Object.keys(localStorage).sort()
  }));

  await page.locator('#trainingDaySessions .training-day-session[data-exercise-openable="true"]').first().click();
  const dialog = page.locator("#managerTrainingExerciseDesignV1");
  const originalArea = await dialog.locator('[data-effect="area"] p').textContent();

  await dialog.locator('input[name="area"][value="large"]').check();
  await dialog.locator('input[name="direction"][value="transition"]').check();
  await dialog.locator('input[name="touches"][value="two"]').check();

  await expect(dialog.locator('[data-effect="area"] p')).not.toHaveText(originalArea || "");
  await expect(dialog.locator('[data-effect="direction"] p')).toContainText("balltap");
  await expect(dialog.locator('[data-effect="touches"] p')).toContainText("orientering");

  const after = await page.evaluate(() => ({
    program: localStorage.getItem("hgfm.weeklyTrainingProgram.v1"),
    keys: Object.keys(localStorage).sort()
  }));
  expect(after.program).toBe(before.program);
  expect(after.keys).toEqual(before.keys);
  expect(after.keys.some((key) => /exercise.?design/i.test(key))).toBe(false);
});

test("øvelsesdesign kan åpnes med tastatur og lukkes uten å flytte manageren", async ({ page }) => {
  await openTraining(page);
  const first = page.locator('#trainingDaySessions .training-day-session[data-exercise-openable="true"]').first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#managerTrainingExerciseDesignV1")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#managerTrainingExerciseDesignV1")).toBeHidden();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
});

test("øvelsesverkstedet har ingen mobil overflow eller alvorlige WCAG-brudd", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTraining(page);
  await page.locator('#trainingDaySessions .training-day-session[data-exercise-openable="true"]').first().click();
  await expect(page.locator("#managerTrainingExerciseDesignV1")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const results = await new AxeBuilder({ page })
    .include("#managerTrainingExerciseDesignV1")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
