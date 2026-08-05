import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 }
];

async function openArea(page, name) {
  await page.getByRole("tab", { name, exact: true }).click();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectPrimaryActionInViewport(page) {
  const action = page.locator("#nextActionPrimary");
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_shell_visual_save",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "HG Liga",
      leagueSeasonStatus: "preseason"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("har fem stabile hovedområder og én autoritativ handling", async ({ page }) => {
  const leagueTabs = page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible');
  await expect(leagueTabs).toHaveCount(5);
  await expect(leagueTabs).toHaveText(["Kontor", "Lag", "Kamp", "Sesong", "Klubb"]);
  await expect(page.locator("#nextActionPrimary")).toHaveCount(1);
  await expect(page.locator("#advanceClubWeekPhase, #leagueOnboardingPrimary, #portalPriorityAction")).toHaveCount(0);
  await expectPrimaryActionInViewport(page);
});

test("lagflaten bruker bare direkte uttak og holder banen i arbeidsområdet", async ({ page }) => {
  await openArea(page, "Lag");
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeVisible();
  await expect(page.locator("#benchPlayersList")).toBeVisible();
  await expect(page.locator("#slotPlayerSelect, #slotRoleSelect, #teamScore")).toHaveCount(0);

  const [app, pitch] = await Promise.all([
    page.locator("#app").boundingBox(),
    page.locator("#lineupSlots").boundingBox()
  ]);
  expect(app).not.toBeNull();
  expect(pitch).not.toBeNull();
  expect(pitch.x).toBeGreaterThanOrEqual(app.x - 1);
  expect(pitch.x + pitch.width).toBeLessThanOrEqual(app.x + app.width + 1);
});

test("trening viser nøyaktig ett utvidet arbeidssteg", async ({ page }) => {
  await openArea(page, "Lag");
  await page.getByRole("button", { name: "Trening", exact: true }).click();
  const toggles = page.locator("[data-training-step-toggle]");
  await expect(toggles).toHaveCount(3);
  await expect(toggles.locator('[aria-expanded="true"]')).toHaveCount(1);

  await toggles.nth(2).click();
  await expect(toggles.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(toggles.locator('[aria-expanded="true"]')).toHaveCount(1);
  await expect(page.locator("#individualTrainingStepBody")).toBeVisible();
  await expect(page.locator("#trainingProgramStepBody, #trainingFocusStepBody")).toBeHidden();
  await expect(page.locator("#modalTrainingProgram, #modalTrainingFocusPick, #modalIndividualTraining")).toHaveCount(0);
});

test("klubbidentiteten viser skjold, klubbfarge og stadion", async ({ page }) => {
  await expect(page.locator("#headerClubMark")).toHaveText("RO");
  await expect(page.locator("#headerClubName")).toContainText("Rosenborg");
  await expect(page.locator("#headerClubGround")).toContainText("Lerkendal");
  const accent = await page.locator("#clubIdentityHeader").evaluate((node) => getComputedStyle(node).getPropertyValue("--club-accent").trim());
  expect(accent).toMatch(/^#[0-9a-f]{6}$/i);
});

for (const viewport of VIEWPORTS) {
  test(`ingen overflow og primærhandlingen er synlig ved ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const area of ["Kontor", "Lag", "Kamp", "Sesong", "Klubb"]) {
      await openArea(page, area);
      await expectNoHorizontalOverflow(page);
    }
    await expectPrimaryActionInViewport(page);
  });
}

test("modaler har tastaturfokus, fokusfelle og fokusretur", async ({ page }) => {
  const opener = page.locator("#settingsButton");
  await opener.focus();
  await opener.press("Enter");
  const modal = page.locator("#modalSettings");
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("#modalSettings :focus")).toHaveCount(1);

  const focusable = modal.locator('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').filter({ visible: true });
  const first = focusable.first();
  const last = focusable.last();
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(opener).toBeFocused();
});

test("hovedskallet har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .include("body")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test.describe("visuelle baseliner", () => {
  test("Kontor · 1280", async ({ page }) => {
    await expect(page).toHaveScreenshot("office-1280.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Lag · 1280", async ({ page }) => {
    await openArea(page, "Lag");
    await expect(page).toHaveScreenshot("lineup-1280.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Trening · 768", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openArea(page, "Lag");
    await page.getByRole("button", { name: "Trening", exact: true }).click();
    await expect(page).toHaveScreenshot("training-768.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Kamp · 1280", async ({ page }) => {
    await openArea(page, "Kamp");
    await expect(page).toHaveScreenshot("matchday-1280.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Kontor · 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page).toHaveScreenshot("office-390.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });
});
