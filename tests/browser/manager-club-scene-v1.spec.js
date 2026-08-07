import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openOffice(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
}

async function openClub(page) {
  await openOffice(page);
  await page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
  await expect(page.locator("#clubCommandPanel")).toBeVisible();
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
});

test("Klubbdrift ligger under Kontor mens Speiding er eget hovedområde", async ({ page }) => {
  await openClub(page);
  await expect(page.locator("#clubCommand h2")).toHaveText("Klubbkontoret");
  await expect(page.locator(".club-expectation-card strong")).not.toBeEmpty();
  await expect(page.locator(".club-priority-card strong")).not.toBeEmpty();
  await expect(page.locator(".club-command-action")).toBeVisible();
  await expect(page.locator(".club-command-status")).toHaveCount(6);
  await expect(page.locator(".club-command-metrics article")).toHaveCount(5);
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Klubbdrift");
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="board"]')).toHaveCount(0);
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="historygo"]')).toHaveText("Speiding");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]')).toHaveText("Klubbdrift");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"]:visible')).toHaveCount(3);
  expect(await page.locator("#clubDepth").getAttribute("open")).toBeNull();
});

test("klubbstatus åpner Speiding som hovedområde og øvrige klubbfunksjoner under Kontor", async ({ page }) => {
  await openClub(page);
  await page.locator('.club-command-status[data-club-target="admin"]').click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#availableStaffList")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Klubbdrift · Stab & drift");

  await openClub(page);
  await page.locator('.club-command-status[data-club-target="historygo"]').click();
  await expect(page.locator('[data-tab-section="historygo"]')).toBeVisible();
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Speiding · Rekrutterbare");

  await openClub(page);
  await page.locator('.club-command-status[data-club-target="progression"]').click();
  await expect(page.locator('[data-tab-section="progression"]')).toBeVisible();
  await expect(page.locator("#unlockedExpertiseList")).toBeVisible();

  await openClub(page);
  await page.locator('.club-command-status[data-club-target="facilities"]').click();
  await expect(page.locator('[data-tab-section="facilities"]')).toBeVisible();
  await expect(page.locator("#facilityOverallValue")).toBeVisible();

  await openClub(page);
  await page.locator('.club-command-status[data-club-target="market"]').click();
  await expect(page.locator('[data-tab-section="market"]')).toBeVisible();
  await expect(page.locator("#marketMediaValue")).toBeVisible();

  await openClub(page);
  await page.locator('.club-command-status[data-club-target="details"]').click();
  await expect(page.locator("#clubDepth")).toHaveAttribute("open", "");
});

test("klubbkontoret og klubbfunksjonene har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openClub(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.club-command-status[data-club-target="facilities"]').click();
  await expectNoHorizontalOverflow(page);
  await openClub(page);
  await page.locator('.club-command-status[data-club-target="market"]').click();
  await expectNoHorizontalOverflow(page);
});

test("klubbkontoret og klubbfunksjonene har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  for (const target of ["board", "facilities", "market"]) {
    await openClub(page);
    if (target !== "board") await page.locator(`.club-command-status[data-club-target="${target}"]`).click();
    const results = await new AxeBuilder({ page })
      .include(`[data-tab-section="${target}"]`)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  }
});
