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
  await expect(page.locator('#trainingDaySessions .training-day-session-advice')).toHaveCount(4);
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

test("spillet gir fire økter fra valgt program, uten manuell øvelsesbank", async ({ page }) => {
  await openTraining(page);
  const sessions = page.locator("#trainingDaySessions .training-day-session");
  await expect(sessions).toHaveCount(4);
  await expect(sessions.locator(".training-day-session-advice")).toHaveCount(4);
  await expect(page.locator("#trainingDayExerciseHint")).toContainText("taktikk");
  await expect(page.locator("#managerTrainingExerciseDesignV1")).toBeHidden();
  await expect(page.locator("#trainingDaySessions input, #trainingDaySessions textarea")).toHaveCount(0);
  await expect(page.locator("#trainingDaySessions .training-day-session[role=button]")).toHaveCount(0);

  const advice = sessions.first().locator(".training-day-session-advice");
  await advice.locator("summary").click();
  await expect(advice).toHaveAttribute("open", "");
  await expect(advice.locator(".training-day-session-advice-body strong")).not.toBeEmpty();
  await expect(advice.locator(".training-day-session-advice-body p")).toContainText("Mot");
  await expect(advice.locator(".training-day-session-advice-body small")).toContainText("belastning");
});

test("neste motstander og kampplan står i begrunnelsen for anbefalt øvelse", async ({ page }) => {
  await openTraining(page);
  const card = page.locator("#trainingPrograms .training-program-card.is-selected");
  await expect(card).toHaveCount(1);
  const list = card.locator(".training-program-sessions li");
  await expect(list).toHaveCount(4);
  const tactical = await page.locator("#tacticSelect").inputValue();
  expect(tactical).toBeTruthy();

  const all = await list.evaluateAll((nodes) => nodes.map((li) => ({
    exercise: li.dataset.exercise,
    relevance: li.dataset.relevance,
    load: li.dataset.load,
    basis: li.dataset.basis
  })));
  expect(all).toHaveLength(4);
  expect(all.every((item) => item.exercise && item.relevance && item.load && item.basis)).toBeTruthy();
  expect(all.every((item) => /Viking|Brann|motstanderen|Mot /.test(item.relevance))).toBeTruthy();

  const session = page.locator("#trainingDaySessions .training-day-session").first();
  await session.locator("summary").click();
  const recommendation = session.locator(".training-day-session-advice-body");
  await expect(recommendation).toContainText(all[0].exercise);
  await expect(recommendation).toContainText(all[0].relevance);
});

test("øktforslag er lesbare og tilgjengelige på mobil uten horisontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTraining(page);
  const first = page.locator("#trainingDaySessions .training-day-session-advice").first();
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");
  await expectNoHorizontalOverflow(page);

  const results = await new AxeBuilder({ page })
    .include("#managerTrainingDay")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
