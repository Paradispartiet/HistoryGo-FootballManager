import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openTeam(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#lineupSlots .player-chip").first()).toBeVisible();
}

async function openSystem(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="system"]').click();
  await expect(page.locator('[data-tab-section="system"]')).toBeVisible();
  await expect(page.locator("#managerSystemWorkspaceV2")).toBeVisible();
}

async function openClub(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
}

async function closeTeamDrawer(page) {
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
}

async function closeClubRoom(page) {
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
      activeLeagueSaveId: "markdown_completion_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: ["lerkendal_stadion"],
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
});

test("trykk på spillerplass åpner inspektør før spiller- og rollealternativer", async ({ page }) => {
  await openTeam(page);
  const slot = page.locator("#lineupSlots .player-chip").first();
  await slot.click();
  const inspector = page.locator("#managerLineupSlotInspector");
  await expect(inspector).toBeVisible();
  await expect(inspector).toContainText("Valgt");
  await expect(inspector).toContainText("Rolle");
  await expect(inspector.locator('[data-slot-action="player"]')).toHaveText("Bytt spiller");
  await expect(inspector.locator('[data-slot-action="role"]')).toHaveText("Endre rolle");
  await expect(inspector.locator('[data-slot-action="profile"]')).toHaveText("Se egenskaper");
  await expect(inspector.locator('[data-slot-action="learn-role"]')).toHaveText("Lær om rollen");
  await expect(page.locator("#teamLineupSelectedState")).toBeHidden();

  await inspector.locator('[data-slot-action="player"]').click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeHidden();
  await closeTeamDrawer(page);

  await slot.click();
  await expect(inspector).toBeVisible();
  await inspector.locator('[data-slot-action="role"]').click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeHidden();
});

test("Systemet viser valgte taktiske prinsipper og visualiserer dem på banen", async ({ page }) => {
  await openSystem(page);
  await expect(page.locator(".manager-system-pitch-v2")).toBeVisible();
  await expect(page.locator('[data-system-parameter="pressing"]')).toContainText("Press");
  await expect(page.locator('[data-system-parameter="defensiveLine"]')).toContainText("Forsvarslinje");
  await expect(page.locator('[data-system-parameter="buildUp"]')).toContainText("Oppbygging");
  await expect(page.locator('[data-system-parameter="width"]')).toContainText("Bredde");
  await expect(page.locator("#teamSystemSelectedState")).toBeHidden();

  await page.locator('[data-system-parameter="pressing"] .manager-system-principle-action').click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Endre press");
  await expect.poll(async () => page.locator("#managerSystemParameterChoices .manager-system-choice-row").count()).toBeGreaterThan(3);
  await expect(page.locator("#managerSystemParameterChoices")).toContainText("eksisterende kampplan");
});

test("Treningsanlegg og medisinsk apparat lærer fagarbeidet uten oppdiktede nivåer", async ({ page }) => {
  await openClub(page);
  await page.locator('[data-club-room="training-ground"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await expect(page.locator(".club-room-learning-v1")).toContainText("Baner og underlag");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Utstyr og materialforvaltning");
  await expect(page.locator(".club-room-learning-v1")).toContainText("ikke dokumentert");
  await expect(page.locator("#managerClubRoomBody")).not.toContainText(/nivå 2|\+\d+% recovery/i);
  await closeClubRoom(page);

  await page.locator('[data-club-room="medical"]').click();
  await expect(page.locator(".club-room-learning-v1")).toContainText("Identifisere");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Undersøke");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Akuttbehandle");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Rehabilitere");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Forebygge");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Belastningsstyre");
  await expect(page.locator(".club-room-learning-v1")).toContainText("Returnere");
});

test("completion-flatene fungerer på 390px uten sideoverflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTeam(page);
  await page.locator("#lineupSlots .player-chip").first().click();
  await expect(page.locator("#managerLineupSlotInspector")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator("#managerLineupSlotInspector .lineup-slot-inspector-close").click();

  await openSystem(page);
  await expectNoHorizontalOverflow(page);
  await openClub(page);
  await page.locator('[data-club-room="medical"]').click();
  await expectNoHorizontalOverflow(page);
});

test("nye inspector- og systemflater har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openTeam(page);
  await page.locator("#lineupSlots .player-chip").first().click();
  let results = await new AxeBuilder({ page })
    .include("#managerLineupSlotInspector")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  let serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  await page.locator("#managerLineupSlotInspector .lineup-slot-inspector-close").click();

  await openSystem(page);
  results = await new AxeBuilder({ page })
    .include("#managerSystemWorkspaceV2")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
