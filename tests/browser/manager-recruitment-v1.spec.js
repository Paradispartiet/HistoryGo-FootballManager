import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openScouting(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="historygo"]').click();
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
  await expect.poll(async () => page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').count()).toBeGreaterThan(0);
}

async function openRoster(page) {
  await page.getByRole("tab", { name: "Lag", exact: true }).click();
  const rosterTab = page.getByRole("tab", { name: "Tropp & benk", exact: true });
  if (await rosterTab.count()) await rosterTab.click();
  await expect(page.locator("#managerPlayerWorkspace")).toBeVisible();
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
      activeLeagueSaveId: "recruitment_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      recruitmentVersion: 1,
      recruitedPlayerIds: [],
      unlockedPlaceIds: ["kfum_arena"],
      hiredStaffIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("kandidat er ikke i troppen før Hent til troppen, og blir tilgjengelig i samme økt", async ({ page }) => {
  await openScouting(page);
  const candidateRow = page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').first();
  const playerId = await candidateRow.getAttribute("data-player-id");
  expect(playerId).toBeTruthy();
  const playerName = await candidateRow.locator(".scouting-player-link strong").innerText();
  await expect(candidateRow.getByRole("button", { name: `Hent ${playerName} til troppen` })).toBeVisible();

  await openRoster(page);
  await expect(page.locator(`#managerRosterBody tr[data-player-id="${playerId}"]`)).toHaveCount(0);

  await openScouting(page);
  const freshRow = page.locator(`#scoutingRecruitableBody tr[data-player-id="${playerId}"]`);
  await freshRow.getByRole("button", { name: `Hent ${playerName} til troppen` }).click();
  await expect(page.locator("#scoutingRecruitmentFeedback")).toContainText(`${playerName} er hentet`);
  await expect(freshRow).toHaveAttribute("data-squad-status", "squad");
  await expect(freshRow).toContainText("I troppen");

  const merits = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}"));
  expect(merits.recruitmentVersion).toBe(1);
  expect(merits.recruitedPlayerIds).toContain(playerId);

  await openRoster(page);
  await expect(page.locator(`#managerRosterBody tr[data-player-id="${playerId}"]`)).toBeVisible();
});

test("rekrutteringshandlingen fungerer på 390px uten horisontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openScouting(page);
  await expectNoHorizontalOverflow(page);
  const button = page.locator(".scouting-recruit-button").first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator(".scouting-in-squad").first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("rekrutteringsflaten har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openScouting(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="historygo"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
