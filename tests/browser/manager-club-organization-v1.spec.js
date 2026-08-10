import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openClub(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  const club = page.locator('.app-subtab[data-tab-target="board"]');
  await expect(club).toBeVisible();
  await expect(club).toHaveText("Klubben");
  await club.click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
}

async function openRoom(page, id) {
  await page.locator(`[data-club-room="${id}"]`).click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
}

async function closeRoom(page) {
  await page.locator("#managerClubRoomDrawer .club-room-close").click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeHidden();
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
      activeLeagueSaveId: "club_organization_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: ["lerkendal_stadion", "kfum_arena"],
      hiredStaffIds: ["jorgen_isnes"],
      earnedBadgeIds: [],
      activeClassifications: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubWeekState: {
        week: 3,
        phase: "training",
        boardTrust: 58,
        playerMorale: 55,
        tacticalClarity: 54,
        trainingCulture: 56,
        mediaPressure: 43
      }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerClubOrganization")).toBeAttached();
});

test("Klubben ligger under Kontor ved siden av Kalender og ikke som ny hovedfane", async ({ page }) => {
  await openClub(page);
  await expect(page.locator('.app-subtab[data-tab-target="board"]')).toHaveAttribute("data-subnav-parent", "dashboard");
  await expect(page.locator('.app-subtab[data-tab-target="calendar"]')).toBeVisible();
  await expect(page.locator('.app-subtab[data-tab-target="progression"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="admin"]')).toBeHidden();
  await expect(page.locator('.main-nav [data-tab-target="dashboard"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('.main-nav [data-tab-target="historygo"] .nav-label')).toHaveText("Speiding");
});

test("Klubben er en romkatalog og den gamle dashboardveggen er demotert", async ({ page }) => {
  await openClub(page);
  await expect(page.locator("#managerClubOrganization h2")).toHaveText("Rosenborg");
  await expect(page.locator(".club-organization-group")).toHaveCount(2);
  await expect(page.locator(".club-organization-room")).toHaveCount(8);
  await expect(page.locator('[data-club-room="coaches"]')).toContainText("Trenerteam");
  await expect(page.locator('[data-club-room="medical"]')).toContainText("Medisinsk apparat");
  await expect(page.locator('[data-club-room="stadium"]')).toContainText("Lerkendal");
  await expect(page.locator("#clubCommandPanel, #clubDepth")).toHaveCount(0);
});

test("stadionrommet bruker canonical klubbdata", async ({ page }) => {
  await openClub(page);
  await openRoom(page, "stadium");
  await expect(page.locator("#managerClubRoomTitle")).toHaveText("Stadion og hjemmebane");
  await expect(page.locator("#managerClubRoomBody")).toContainText("Lerkendal");
  await expect(page.locator("#managerClubRoomBody")).toContainText("Trondheim");
  await expect(page.locator("#managerClubRoomBody")).toContainText("lerkendal_stadion");
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Klubben · Stadion og hjemmebane");
});

test("treningsanlegget dikter ikke nivå eller oppgraderingsbonus", async ({ page }) => {
  await openClub(page);
  await openRoom(page, "training-ground");
  const body = page.locator("#managerClubRoomBody");
  await expect(body).toContainText("ikke dokumentert");
  await expect(body).toContainText("ikke oppdiktede nivå 1–3");
  await expect(body).not.toContainText(/oppgrader til|\+\d+%/i);
  await expect(page.locator('[data-tab-section="facilities"]')).toHaveCount(0);
  await expect(page.locator("#managerFacilitiesWorkspace")).toHaveCount(0);
});

test("fiktiv økonomi kontrakter overgangsmarked og fasilitetsnivå finnes ikke lenger som skjulte parallelle flater", async ({ page }) => {
  await openClub(page);
  await expect(page.locator('[data-tab-section="market"], [data-tab-section="facilities"]')).toHaveCount(0);
  await expect(page.locator("#adminEconomyNote")).toHaveCount(0);
  await expect(page.locator("#managerEconomyWorkspace")).toHaveCount(0);
  await expect(page.locator("#managerTransferMarketWorkspace")).toHaveCount(0);
  await expect(page.locator("#managerFacilitiesWorkspace")).toHaveCount(0);
  await expect(page.locator("#managerClubOrganization")).not.toContainText(/lønnstak|overgangsbud|overgangsvindu|kontraktlengde/i);
});

test("Trenerteam viser faktisk engasjert stab og åpner eksisterende stabsarbeid", async ({ page }) => {
  await openClub(page);
  await openRoom(page, "coaches");
  await expect(page.locator("#managerClubRoomBody")).toContainText("Jørgen Isnes");
  await page.locator('[data-club-room-action="admin"]').click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator('[data-tab-section="admin"] > .club-organization-back')).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Klubben · Administrasjon");
  await expect(page.locator("#adminEconomyNote")).toHaveCount(0);
  await page.locator('[data-tab-section="admin"] > .club-organization-back').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
});

test("klubbutvikling er tilgjengelig fra organisasjonen uten permanent underfane", async ({ page }) => {
  await openClub(page);
  await openRoom(page, "development");
  await page.locator('[data-club-room-action="progression"]').click();
  await expect(page.locator('[data-tab-section="progression"]')).toBeVisible();
  await expect(page.locator('[data-tab-section="progression"] > .club-organization-back')).toBeVisible();
  await expect(page.locator('.app-subtab[data-tab-target="progression"]')).toBeHidden();
  await page.locator('[data-tab-section="progression"] > .club-organization-back').click();
  await expect(page.locator('[data-tab-section="board"]')).toBeVisible();
});

test("klubborganisasjonen og romdraweren har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openClub(page);
  await expectNoHorizontalOverflow(page);
  await openRoom(page, "medical");
  await expectNoHorizontalOverflow(page);
  await closeRoom(page);
});

test("klubborganisasjonen har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openClub(page);
  let results = await new AxeBuilder({ page })
    .include("#managerClubOrganization")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  let serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);

  await openRoom(page, "board");
  results = await new AxeBuilder({ page })
    .include("#managerClubRoomDrawer")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
