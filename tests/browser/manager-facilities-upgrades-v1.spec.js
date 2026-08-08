import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openTrainingGround(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="training-ground"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await expect(page.locator("#managerClubRoomTitle")).toHaveText("Treningsanlegg");
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
      activeLeagueSaveId: "facilities_v1",
      clubName: "Bislett FK",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Bygg klubben."
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerFacilitiesWorkspace")).toBeAttached();
});

test("legacy fasilitetsnivåer beholdes i runtime men er ute av live IA", async ({ page }) => {
  await openTrainingGround(page);
  await expect(page.locator('[data-tab-section="facilities"]')).toBeHidden();
  await expect(page.locator("#managerFacilitiesWorkspace")).toBeHidden();
  const body = page.locator("#managerClubRoomBody");
  await expect(body).toContainText("Fysisk anleggsdata er ikke dokumentert ennå");
  await expect(body).toContainText("ikke oppdiktede nivå 1–3");
  await expect(body).not.toContainText(/Nivå 1 av 3|Oppgrader til|\+\d+%/i);
});

test("eksisterende fasilitetsstate overlever refresh fram til trygg Pass 7-migrering", async ({ page }) => {
  await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.facilities = {
      version: 1,
      levels: { training: 2, medical: 3, analysis: 1 },
      lastUpgradeWeek: 4,
      lastUpgradeFacilityId: "medical"
    };
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
  });
  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").facilities);
  expect(saved).toEqual(expect.objectContaining({
    levels: { training: 2, medical: 3, analysis: 1 },
    lastUpgradeWeek: 4,
    lastUpgradeFacilityId: "medical"
  }));
  await openTrainingGround(page);
  await expect(page.locator("#managerFacilitiesWorkspace")).toBeHidden();
  await expect(page.locator("#managerClubRoomBody")).not.toContainText(/Nivå 2 av 3|Nivå 3 av 3/i);
});

test("Treningsanlegg-rommet fungerer på 390 px uten overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTrainingGround(page);
  await expectNoHorizontalOverflow(page);
});

test("Treningsanlegg-rommet har ingen alvorlige WCAG-brudd", async ({ page }) => {
  await openTrainingGround(page);
  const results = await new AxeBuilder({ page })
    .include("#managerClubRoomDrawer")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
