import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const COMPLETE = [
  "ullevaal_final_pressure_mentor",
  "ekeberg_recruitment_coach",
  "bislett_speed_specialist",
  "kfum_training_coach",
  "bislett_first_team_physio",
  "ullevaal_goalkeeper_coach"
];

async function openStaff(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="coaches"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await page.locator('[data-club-room-action="admin"]').click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#managerStaffRosterV1")).toBeVisible();
}

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((ids) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "staff_v1",
      clubName: "Bislett FK",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      recruitmentVersion: 1,
      recruitedPlayerIds: [],
      unlockedPlaceIds: [],
      hiredStaffIds: ids,
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] }
    }));
  }, COMPLETE);
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("viser 1 assistent, 3 trenere, fysio og keepertrener", async ({ page }) => {
  await openStaff(page);
  await expect(page.locator("#managerStaffRosterV1 .staff-role-slot")).toHaveCount(4);
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("6/6 roller");
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "true");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("Assistenttrener");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("3/3");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("Fysio");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("Keepertrener");
});

test("tre trenere er ikke komplett støtteapparat", async ({ page }) => {
  await openStaff(page);
  await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.hiredStaffIds = ["ekeberg_recruitment_coach", "bislett_speed_specialist", "kfum_training_coach"];
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
    window.dispatchEvent(new CustomEvent("hgfm:team-merits-changed"));
  });
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "false");
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("3/6 roller");
});

test("390px uten overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStaff(page);
  await noOverflow(page);
});

test("ingen alvorlige WCAG-brudd", async ({ page }) => {
  await openStaff(page);
  const results = await new AxeBuilder({ page })
    .include("#managerStaffRosterV1")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
