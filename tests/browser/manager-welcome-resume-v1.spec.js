import { expect, test } from "@playwright/test";

test("nye spillere ser en kompakt velkomstskjerm og en ærlig, deaktivert fortsett-knapp", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeVisible();
  await expect(page.locator("#continueSavedGame")).toBeDisabled();
  await expect(page.locator("#welcomeResumeSummary")).toHaveText("Ingen lagring funnet på denne enheten.");
  await expect(page.locator('[data-start-mode="league"]')).toBeVisible();
  await expect(page.locator('[data-start-mode="national"]')).toBeVisible();
  await expect(page.locator('[data-start-mode="scenario"]')).toBeVisible();
  await expect(page.locator('[data-start-mode="training"]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("fortsett fra lagret klubb åpner eksisterende sesjon uten nytt klubbvalg", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      activeLeagueSaveId: "saved-rosenborg-career"
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: { league: {}, scenario: null, national: null, training: null }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  // Vanlig omlasting gjenopptar automatisk; spilleren kan åpne startmenyen fra Innstillinger.
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator("#settingsButton").click();
  await page.locator('[data-settings-action="mode"]').click();
  await expect(page.locator("#onboardingScreen")).toBeVisible();
  const resume = page.locator("#continueSavedGame");
  await expect(resume).toBeEnabled();
  await expect(page.locator("#welcomeResumeSummary")).toHaveText("Ligaspill · Rosenborg");
  const savedBefore = await page.evaluate(() => ({
    start: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1")),
    envelope: JSON.parse(localStorage.getItem("hgfm.modeSessions.v1"))
  }));
  await resume.click();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#onboardingClubStep")).toBeHidden();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  const savedAfter = await page.evaluate(() => ({
    start: JSON.parse(localStorage.getItem("hgfm.gameStartState.v1")),
    envelope: JSON.parse(localStorage.getItem("hgfm.modeSessions.v1"))
  }));
  expect(savedAfter.start.clubName).toBe(savedBefore.start.clubName);
  expect(savedAfter.start.managerName).toBe(savedBefore.start.managerName);
  expect(savedAfter.envelope.activeMode).toBe(savedBefore.envelope.activeMode);
  expect(savedAfter.start.activeLeagueSaveId).toBe(savedBefore.start.activeLeagueSaveId);
});
