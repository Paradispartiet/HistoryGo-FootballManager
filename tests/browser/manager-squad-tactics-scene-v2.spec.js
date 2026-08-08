import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openTeam(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#squadCompactStatus")).toBeVisible();
  await expect(page.locator("#teamTacticsSelectedState")).toBeVisible();
}

async function openRoster(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="squad"]').click();
  await expect(page.locator('[data-tab-section="squad"]')).toBeVisible();
  await expect(page.locator("#managerPlayerWorkspace")).toBeVisible();
  await expect.poll(async () => page.locator("#managerRosterBody tr").count()).toBeGreaterThanOrEqual(15);
}

async function openTraining(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await expect(page.locator("#teamTrainingSelectedState")).toBeHidden();
}

async function openSystem(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="system"]').click();
  await expect(page.locator('[data-tab-section="system"]')).toBeVisible();
  await expect(page.locator("#managerSystemWorkspaceV2")).toBeVisible();
  await expect(page.locator("#teamSystemSelectedState")).toBeHidden();
}

async function closeChoiceDrawer(page) {
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
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
      activeLeagueSaveId: "player_workspace_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeAttached();
});

test("Lag viser valgt tilstand først mens formasjon og kampplan åpnes i drawer", async ({ page }) => {
  await openTeam(page);
  await expect(page.locator("#squadCompactStatus")).toContainText("Tropp");
  await expect(page.locator("#squadCompactStatus")).toContainText("Ellever");
  await expect(page.locator("#squadCompactStatus")).toContainText("Benk");
  await expect(page.locator("#squadSetupGate")).toBeHidden();
  await expect(page.locator(".squad-tactics-command-action")).toBeHidden();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#teamSelectedFormation")).not.toBeEmpty();
  await expect(page.locator("#teamSelectedTactic")).not.toBeEmpty();
  await expect(page.locator("#formationSelect")).toBeHidden();
  await expect(page.locator("#tacticSelect")).toBeHidden();

  await page.locator("#teamChangeFormation").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Formasjon og kampplan");
  await expect(page.locator("#formationSelect")).toBeVisible();
  await expect(page.locator("#tacticSelect")).toBeVisible();
  await closeChoiceDrawer(page);
  await expect(page.locator("#formationSelect")).toBeHidden();
});

test("Oppstilling åpner alle spiller- og rollealternativer i samme valgdrawer", async ({ page }) => {
  await openTeam(page);
  await expect(page.locator("#teamLineupSelectedState")).toBeVisible();
  await expect.poll(async () => page.locator("#lineupPlayerChoices .lineup-player-choice-row").count()).toBeGreaterThan(0);
  await expect(page.locator("#lineupPlayerChoices")).toBeHidden();
  await expect(page.locator("#lineupRoleChoices")).toBeHidden();

  await page.locator("#teamChangePlayerRole").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices .lineup-player-choice-row").first()).toBeVisible();
  await closeChoiceDrawer(page);
});

test("Tropp er en tett spillerliste med søk, filter og sesongkolonner", async ({ page }) => {
  await openRoster(page);
  await expect(page.locator("#teamRosterSelectedState")).toContainText("faktiske troppen");
  await expect(page.locator(".manager-roster-table thead")).toContainText("Spiller");
  await expect(page.locator(".manager-roster-table thead")).toContainText("Status");
  await expect(page.locator(".manager-roster-table thead")).toContainText("Målgivende");

  const firstName = await page.locator(".manager-roster-player-link strong").first().innerText();
  await page.locator("#managerRosterSearch").fill(firstName);
  await expect(page.locator("#managerRosterBody tr")).toHaveCount(1);
  await page.locator("#managerRosterSearch").fill("");
  await expect.poll(async () => page.locator("#managerRosterBody tr").count()).toBeGreaterThanOrEqual(15);
});

test("Trening beholder valgene, men program fokus og individuell picker åpnes først ved Endre", async ({ page }) => {
  await openTraining(page);
  await expect(page.locator("#trainingDayProgramTitle")).not.toBeEmpty();
  await expect(page.locator("#trainingDayFocus")).not.toBeEmpty();
  await expect(page.locator("#trainingDayIndividual")).not.toBeEmpty();
  await expect(page.locator("#trainingDaySessions .training-day-session")).toHaveCount(4);
  await expect(page.locator("#trainingPrograms")).toBeHidden();
  await expect(page.locator("#weeklyTrainingOptions")).toBeHidden();
  await expect(page.locator("#individualTrainingPicker")).toBeHidden();
  await expect(page.locator("#teamChangeTrainingProgram")).toBeAttached();

  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Velg treningsprogram");
  await expect(page.locator("#trainingPrograms")).toBeVisible();
  await closeChoiceDrawer(page);

  await page.locator("#trainingDayChangeFocus").click();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Velg treningsfokus");
  await expect(page.locator("#weeklyTrainingOptions")).toBeVisible();
  await closeChoiceDrawer(page);

  await page.locator("#trainingDayChangeIndividual").click();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Individuell oppfølging");
  await expect(page.locator("#individualTrainingPicker")).toBeVisible();
  await closeChoiceDrawer(page);
});

test("Systemet viser aktivt system og åpner de samme eksisterende alternativene i drawer", async ({ page }) => {
  await openSystem(page);
  await expect(page.locator("#managerSystemWorkspaceV2 .manager-system-head-copy-v2 h2")).not.toBeEmpty();
  await expect(page.locator("#managerSystemWorkspaceV2 .manager-system-plan-name")).not.toBeEmpty();
  await expect(page.locator("#managerSystemWorkspaceV2 .manager-system-pitch-v2")).toBeVisible();
  await expect(page.locator("#tacticalSystemPanel")).toBeVisible();

  await page.locator("#managerSystemWorkspaceV2").getByRole("button", { name: "Endre formasjon" }).click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#managerTeamChoiceDrawerTitle")).toHaveText("Formasjon og kampplan");
  await expect(page.locator("#formationSelect")).toBeVisible();
  await expect(page.locator("#tacticSelect")).toBeVisible();
  await closeChoiceDrawer(page);
});

test("Spillernavn åpner en full profil uten å endre laguttaket", async ({ page }) => {
  await openRoster(page);
  const selectedBefore = await page.locator(".lineup-player-card.is-selected").count();
  const firstName = await page.locator(".manager-roster-player-link strong").first().innerText();
  await page.locator(".manager-roster-player-link").first().click();

  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  await expect(page.locator(".manager-player-profile-identity h2")).toHaveText(firstName);
  await expect(page.locator(".manager-player-mini-pitch")).toBeVisible();
  await expect(page.locator(".manager-player-attribute-group")).toHaveCount(4);
  await expect(page.locator(".manager-player-section-head")).toContainText("ingen overall");
  await expect(page.locator(".manager-player-profile-tabs")).toContainText("Sesong");
  await expect(page.locator(".manager-player-profile-tabs")).toContainText("Trening");
  await expect(page.locator(".manager-player-profile-tabs")).toContainText("Historikk");
  expect(await page.locator(".lineup-player-card.is-selected").count()).toBe(selectedBefore);
});

test("Oppstilling skiller profilklikk fra eksplisitt Velg-handling inne i valgdrawer", async ({ page }) => {
  await openTeam(page);
  await page.locator("#teamChangePlayerRole").click();
  await expect.poll(async () => page.locator(".lineup-player-choice-row").count()).toBeGreaterThan(0);
  const chosenBefore = await page.locator(".lineup-player-select-action.is-selected").count();
  await page.locator(".lineup-player-profile-link").first().click();
  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  expect(await page.locator(".lineup-player-select-action.is-selected").count()).toBe(chosenBefore);
  await page.locator(".manager-player-profile-close").click();
  await expect(page.locator(".lineup-player-select-action").first()).toContainText(/Velg|Valgt/);
});

test("valgdraweren returnerer fokus og har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openTeam(page);
  const opener = page.locator("#teamChangeFormation");
  await opener.focus();
  await opener.click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include("#managerTeamChoiceDrawer")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  await expect(opener).toBeFocused();
});

test("Lag, Tropp, Trening, Systemet og valgdrawer har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTeam(page);
  await expectNoHorizontalOverflow(page);
  await page.locator("#teamChangePlayerRole").click();
  await expectNoHorizontalOverflow(page);
  await closeChoiceDrawer(page);

  await openRoster(page);
  await expectNoHorizontalOverflow(page);
  await page.locator(".manager-roster-player-link").first().click();
  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator(".manager-player-profile-close").click();

  await openTraining(page);
  await expectNoHorizontalOverflow(page);
  await page.locator("#trainingDayChangeProgram").click();
  await expectNoHorizontalOverflow(page);
  await closeChoiceDrawer(page);

  await openSystem(page);
  await expectNoHorizontalOverflow(page);
});

test("Tropp og spillerprofil har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openRoster(page);
  await page.locator(".manager-roster-player-link").first().click();
  const results = await new AxeBuilder({ page })
    .include("#managerPlayerProfileDialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
