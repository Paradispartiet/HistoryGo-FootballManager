import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openOffice(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
}

async function openClub(page) {
  await openOffice(page);
  await page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
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
      activeLeagueSaveId: "manager_club_scene_v1",
      clubName: "Bislett FK",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Bygg klubben med en tydelig sportslig retning."
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="calendar"]')).toBeAttached();
});

test("Klubben ligger under Kontor mens Speiding er eget hovedområde", async ({ page }) => {
  await openClub(page);
  await expect(page.locator("#managerClubOrganization h2")).toHaveText("Bislett FK");
  await expect(page.locator(".club-organization-room")).toHaveCount(8);
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Klubben");
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="board"]')).toHaveCount(0);
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="historygo"]')).toHaveText("Speiding");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]')).toHaveText("Klubben");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="calendar"]')).toHaveText("Kalender");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"]:visible')).toHaveCount(2);

  // Legacy-scenen beholdes i DOM for trygg migrering, men er ikke lenger live IA.
  await expect(page.locator("#clubCommandPanel")).toBeAttached();
  await expect(page.locator("#clubCommandPanel")).toBeHidden();
  await expect(page.locator("#clubDepth")).toBeHidden();
});

test("Klubben åpner faktiske rom mens Speiding forblir separat", async ({ page }) => {
  await openClub(page);
  await page.locator('[data-club-room="coaches"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await expect(page.locator("#managerClubRoomTitle")).toHaveText("Trenerteam");
  await page.locator("#managerClubRoomDrawer .club-room-close").click();

  await page.locator('[data-club-room="development"]').click();
  await page.locator('[data-club-room-action="progression"]').click();
  await expect(page.locator('[data-tab-section="progression"]')).toBeVisible();
  await expect(page.locator('[data-tab-section="progression"] > .club-organization-back')).toBeVisible();
  await page.locator('[data-tab-section="progression"] > .club-organization-back').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();

  await page.locator('.main-nav .nav-tab[data-tab-target="historygo"]').click();
  await expect(page.locator('[data-tab-section="historygo"]')).toBeVisible();
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Speiding · Min spillerpool");

  await openClub(page);
  await expect(page.locator('[data-tab-section="facilities"]')).toBeHidden();
  await expect(page.locator('[data-tab-section="market"]')).toBeHidden();
});

test("klubborganisasjonen og rommene har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openClub(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('[data-club-room="stadium"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("klubborganisasjonen og rommene har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openClub(page);
  let results = await new AxeBuilder({ page })
    .include("#managerClubOrganization")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  let serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);

  await page.locator('[data-club-room="board"]').click();
  results = await new AxeBuilder({ page })
    .include("#managerClubRoomDrawer")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
