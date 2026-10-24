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
  const staff = page.locator('.app-subtab[data-tab-target="admin"]');
  await expect(staff).toBeVisible();
  await staff.click();
  await expect(staff).toHaveAttribute("aria-selected", "true");
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
    if (!localStorage.getItem("hgfm.teamMerits.v1")) localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
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

test("viser aktiv rollekapasitet og komplett generisk starterstab", async ({ page }) => {
  await openStaff(page);
  await expect(page.locator("#managerStaffRosterV1 .staff-role-slot")).toHaveCount(4);
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("6/6 starterstab");
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "true");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("Assistenttrener");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("3/3");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("Fysio");
  await expect(page.locator("#managerStaffRosterV1")).toContainText("Keepertrener");
});

test("Administrasjon bruker startersettets størrelse som terskel", async ({ page }) => {
  await openStaff(page);
  const metric = page.locator("#adminDriftMetrics .admin-metric").filter({ hasText: "Stab engasjert" });
  await expect(metric).toHaveCount(1);
  await expect(metric.locator(".admin-metric-value")).toHaveText("6/6");
});

test("tre trenere alene fullfører ikke det generiske startersettet", async ({ page }) => {
  await openStaff(page);
  await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.hiredStaffIds = ["ekeberg_recruitment_coach", "bislett_speed_specialist", "kfum_training_coach"];
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
    window.dispatchEvent(new CustomEvent("hgfm:team-merits-changed"));
  });
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "false");
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("3/6 starterstab");
});

test("engasjer fra Stab og behold ansatte etter oppdatering", async ({ page }) => {
  await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.hiredStaffIds = [];
    // The available-staff list only shows candidates earned from an unlocked
    // place (or the active local starter squad). Give this hiring test a real
    // source instead of assuming an empty collection offers staff.
    merits.unlockedPlaceIds = [...new Set([
      ...(Array.isArray(merits.unlockedPlaceIds) ? merits.unlockedPlaceIds : []),
      "kfum_arena"
    ])];
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
    window.dispatchEvent(new CustomEvent("hgfm:team-merits-changed"));
  });
  await openStaff(page);
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("0/6 starterstab");

  const candidate = page.locator("#availableStaffList .staff-person-card").first();
  await expect(candidate).toBeVisible();
  const name = await candidate.locator(".unlock-card-title").innerText();
  await candidate.getByRole("button", { name: "Engasjer" }).click();

  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("1/6 starterstab");
  await expect(page.locator("#availableStaffList .staff-person-card").filter({ hasText: name })).toHaveCount(0);
  await page.locator(".staff-workspace-fold").first().locator("summary").click();
  await expect(page.locator("#hiredStaffList")).toContainText(name);

  await page.reload();
  await openStaff(page);
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("1/6 starterstab");
});

test("Stab er tilgjengelig på 320px og 390px uten horisontal scroll", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await openStaff(page);
    await expect(page.locator("#availableStaffTitle")).toBeVisible();
    await noOverflow(page);
  }
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
