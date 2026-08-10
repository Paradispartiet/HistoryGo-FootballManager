import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openMedicalRoom(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="medical"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();
  await expect(page.locator(".medical-decision-workshop-v1")).toBeVisible();
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
      activeLeagueSaveId: "medical_decision_learning_v1",
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
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubWeekState: { week: 3, phase: "training", boardTrust: 58, playerMorale: 55, tacticalClarity: 54, trainingCulture: 56, mediaPressure: 43 }
    }));
    localStorage.setItem("hgfm.playerCondition.v1", JSON.stringify([
      {
        playerId: "medical-case-player",
        name: "Testspiller",
        load: 76,
        form: 0.4,
        matchesPlayed: 5,
        minutesPlayed: 450,
        consecutiveFullMatches: 5,
        injury: { weeksOut: 2, reason: "5 fulle kamper på rad uten avlastning" }
      }
    ]));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("medisinsk apparat gjør faktisk skade til valg og forklaring uten save-mutasjon", async ({ page }) => {
  await openMedicalRoom(page);
  const workshop = page.locator(".medical-decision-workshop-v1");
  await expect(workshop).toHaveAttribute("data-case-kind", "return_to_play");
  await expect(workshop).toContainText("Testspiller");
  await expect(workshop).toContainText("Dette vet vi");
  await expect(workshop).toContainText("Dette mangler før en sikker konklusjon");
  await expect(workshop).toContainText("løp og sprint");

  const choiceNodeRemainsStable = await page.evaluate(async () => {
    const choice = document.querySelector('[data-medical-decision="full_return_now"]');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return choice === document.querySelector('[data-medical-decision="full_return_now"]');
  });
  expect(choiceNodeRemainsStable).toBe(true);

  const conditionBefore = await page.evaluate(() => localStorage.getItem("hgfm.playerCondition.v1"));
  await workshop.locator('[data-medical-decision="full_return_now"]').click();
  await expect(workshop.locator(".medical-decision-outcome")).toHaveAttribute("data-status", "premature");
  await expect(workshop.locator(".medical-decision-outcome")).toContainText("For tidlig konklusjon");

  await workshop.locator('[data-medical-decision="calendar_only"]').click();
  await expect(workshop.locator(".medical-decision-outcome")).toHaveAttribute("data-status", "incomplete");
  await expect(workshop.locator(".medical-decision-outcome")).toContainText("Ukeestimatet er ikke en test");

  await workshop.locator('[data-medical-decision="rehab_and_assess"]').click();
  await expect(workshop.locator(".medical-decision-outcome")).toHaveAttribute("data-status", "supported");
  await expect(workshop.locator(".medical-decision-outcome")).toContainText("Best begrunnet neste steg");
  const conditionAfter = await page.evaluate(() => localStorage.getItem("hgfm.playerCondition.v1"));
  expect(conditionAfter).toBe(conditionBefore);
});

test("medisinsk apparat leser aktiv modussnapshot fremfor delt legacy-key", async ({ page }) => {
  await page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    envelope.activeMode = "league";
    envelope.sessions = envelope.sessions || {};
    envelope.sessions.league = { ...(envelope.sessions.league || {}), playerCondition: [] };
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify(envelope));
  });
  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await openMedicalRoom(page);
  const workshop = page.locator(".medical-decision-workshop-v1");
  await expect(workshop).toHaveAttribute("data-case-kind", "no_case");
  await expect(workshop).not.toContainText("Testspiller");
});

test("medisinsk rom åpner eksisterende individuell oppfølging", async ({ page }) => {
  await openMedicalRoom(page);
  await page.locator('#managerClubRoomDrawer [data-club-room-action="individual-training"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#individualTrainingPicker")).toBeVisible();
});

test("medisinsk beslutningsverksted er responsivt og tilgjengelig", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMedicalRoom(page);
  await expectNoHorizontalOverflow(page);
  const results = await new AxeBuilder({ page })
    .include(".medical-decision-workshop-v1")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
