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
  await expect(page.locator("#trainingCommandPanel")).toBeVisible();
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
});

test("treningsscenen viser situasjon, motstander og fire operative statuser", async ({ page }) => {
  await openTraining(page);
  await expect(page.locator("#trainingCommand h2")).toHaveText("Treningsuka");
  await expect(page.locator(".training-assistant-signal strong")).not.toBeEmpty();
  await expect(page.locator(".training-opponent-brief strong")).not.toBeEmpty();
  await expect(page.locator(".training-command-status")).toHaveCount(4);
  await expect(page.locator(".training-command-action")).toBeVisible();
  expect(await page.locator("#trainingDepth").getAttribute("open")).toBeNull();
  await expect(page.locator('#trainingWorkspace [data-training-step-toggle][aria-expanded="true"]')).toHaveCount(1);
});

test("statuskort åpner riktig eksisterende arbeidssteg", async ({ page }) => {
  await openTraining(page);
  await page.locator('.training-command-status[data-training-target="trainingFocusStep"]').click();
  await expect(page.locator('#trainingFocusStep [data-training-step-toggle]')).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#trainingFocusStepBody")).toBeVisible();
  await expect(page.locator("#trainingProgramStepBody")).toBeHidden();

  await page.locator('.training-command-status[data-training-target="details"]').click();
  await expect(page.locator("#trainingDepth")).toHaveAttribute("open", "");
});

test("treningsscenen har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTraining(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.training-command-status[data-training-target="trainingProgramStep"]').click();
  await expectNoHorizontalOverflow(page);
});

test("treningsscenen har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openTraining(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="trening"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
