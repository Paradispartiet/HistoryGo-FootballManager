import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openAnalysisRoom(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="analysis"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await expect(page.locator(".opponent-analysis-workshop-v1")).toBeVisible();
}

async function choosePressPlan(page) {
  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await workshop.locator('[data-opponent-analysis-focus="press"]').click();
  await workshop.locator('[data-opponent-analysis-countermeasure="train_escape"]').click();
  await workshop.locator(".opponent-analysis-save").click();
  await expect(workshop.locator(".opponent-analysis-feedback")).toContainText("kampklarheten er oppdatert");
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
      activeLeagueSaveId: "opponent_analysis_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Testliga",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: ["lerkendal_stadion"],
      hiredStaffIds: ["jorgen_isnes"],
      earnedBadgeIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubWeekState: { week: 3, phase: "training", boardTrust: 58, playerMorale: 55, tacticalClarity: 54, trainingCulture: 56, mediaPressure: 43 }
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify({
      version: "historygo-football-manager.league-season.v3",
      competition: { id: "hg-test", mode: "league", tierId: "test", tierName: "Testliga", tierLevel: 1, clubCount: 2, rounds: 2, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
      tier: { id: "test", level: 1, name: "Testliga", clubCount: 2, groupSize: 2, rounds: 2 },
      seed: "analysis-test",
      seasonNumber: 1,
      managerClubId: "rosenborg",
      clubs: [
        { id: "rosenborg", name: "Rosenborg", strength: 78, isManager: true },
        { id: "brann", name: "Brann", strength: 76, isManager: false }
      ],
      currentRound: 1,
      status: "active",
      fixtures: [
        { round: 1, status: "scheduled", matches: [{ id: "analysis-test-r1-rosenborg-brann", round: 1, homeClubId: "rosenborg", awayClubId: "brann", status: "scheduled", result: null }] },
        { round: 2, status: "scheduled", matches: [{ id: "analysis-test-r2-brann-rosenborg", round: 2, homeClubId: "brann", awayClubId: "rosenborg", status: "scheduled", result: null }] }
      ],
      completedMatchIds: [],
      createdFrom: "browser test"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("analyseavdelingen gjør faktisk terminliste og motstanderprofil til en lagret arbeidsplan", async ({ page }) => {
  await openAnalysisRoom(page);
  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await expect(workshop).toHaveAttribute("data-case-kind", "fixture");
  await expect(workshop.locator("#opponentAnalysisFixture option")).toHaveCount(2);
  await expect(workshop).toContainText("Brann");
  await expect(workshop).toContainText("Fotballrepublikken");
  await expect(workshop).toContainText("4-3-3 som presser høyt");
  await expect(workshop).toContainText("Nærmeste kamp · analyse mangler");

  await choosePressPlan(page);
  const stored = await page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    return envelope.sessions?.league?.opponentAnalysisPlan || null;
  });
  expect(stored).toMatchObject({
    version: "opponent-analysis.v1",
    fixtureId: "analysis-test-r1-rosenborg-brann",
    opponentId: "brann",
    focusId: "press",
    countermeasureId: "train_escape",
    target: "training"
  });
  expect(stored).not.toHaveProperty("score");
  expect(stored).not.toHaveProperty("bonus");
});

test("analyseplanen overlever reload i aktiv modussnapshot og åpner eksisterende trening", async ({ page }) => {
  await openAnalysisRoom(page);
  await choosePressPlan(page);
  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await openAnalysisRoom(page);
  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await expect(workshop.locator('[data-opponent-analysis-focus="press"]')).toHaveAttribute("aria-pressed", "true");
  await expect(workshop.locator('[data-opponent-analysis-countermeasure="train_escape"]')).toHaveAttribute("aria-pressed", "true");
  await expect(workshop.locator(".opponent-analysis-save")).toHaveText("Plan lagret");
  await workshop.locator(".opponent-analysis-open-target").click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerClubRoomDrawer")).toBeHidden();
});

test("plan for senere terminlistekamp erstatter ikke kravet til nærmeste kamp", async ({ page }) => {
  await openAnalysisRoom(page);
  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await workshop.locator("#opponentAnalysisFixture").selectOption("analysis-test-r2-brann-rosenborg");
  await workshop.locator('[data-opponent-analysis-focus="transition"]').click();
  await workshop.locator('[data-opponent-analysis-countermeasure="secure_before_loss"]').click();
  await workshop.locator(".opponent-analysis-save").click();
  await expect(workshop.locator(".opponent-analysis-feedback")).toContainText("Nærmeste kamp trenger fortsatt sin egen analyse");
});

test("motstanderforberedelsen er responsiv og tilgjengelig", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAnalysisRoom(page);
  await page.locator('[data-opponent-analysis-focus="spaces"]').click();
  await expectNoHorizontalOverflow(page);
  const results = await new AxeBuilder({ page })
    .include(".opponent-analysis-workshop-v1")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
