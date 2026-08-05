import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("har fem stabile hovedområder", async ({ page }) => {
  const leagueTabs = page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible');
  await expect(leagueTabs).toHaveCount(5);
  await expect(leagueTabs).toHaveText(["Kontor", "Lag", "Kamp", "Sesong", "Klubb"]);
});

test("lagflaten holder bane og direkte uttak i arbeidsområdet", async ({ page }) => {
  await page.getByRole("tab", { name: "Lag" }).click();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeVisible();
  await expect(page.locator("#benchPlayersList")).toBeVisible();

  const [app, pitch] = await Promise.all([
    page.locator("#app").boundingBox(),
    page.locator("#lineupSlots").boundingBox()
  ]);
  expect(app).not.toBeNull();
  expect(pitch).not.toBeNull();
  expect(pitch.x).toBeGreaterThanOrEqual(app.x - 1);
  expect(pitch.x + pitch.width).toBeLessThanOrEqual(app.x + app.width + 1);
});

test("trening er én inline arbeidsflate uten kjernemodaler", async ({ page }) => {
  await page.getByRole("tab", { name: "Lag" }).click();
  await page.getByRole("button", { name: "Trening", exact: true }).click();
  await expect(page.locator("#trainingWorkspace")).toBeVisible();
  await expect(page.locator("#trainingProgramStep")).toBeVisible();
  await expect(page.locator("#trainingFocusStep")).toBeVisible();
  await expect(page.locator("#individualTrainingStep")).toBeVisible();
  await expect(page.locator("#modalTrainingProgram, #modalTrainingFocusPick, #modalIndividualTraining")).toHaveCount(0);
});

test("kampdagen bruker hele arbeidsbredden", async ({ page }) => {
  await page.getByRole("tab", { name: "Kamp" }).click();
  const [app, panel] = await Promise.all([
    page.locator("#app").boundingBox(),
    page.locator(".matchday-panel").boundingBox()
  ]);
  expect(app).not.toBeNull();
  expect(panel).not.toBeNull();
  expect(panel.width / app.width).toBeGreaterThan(0.78);
});

test("mobilskallet har fast bunnmeny uten horisontal lekkasje", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "Lag" }).click();
  const navPosition = await page.locator(".main-nav").evaluate((node) => getComputedStyle(node).position);
  expect(navPosition).toBe("fixed");
  await expect(page.locator(".nav-tab-club .nav-label")).toHaveText("Klubb");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const [app, pitch] = await Promise.all([
    page.locator("#app").boundingBox(),
    page.locator("#lineupSlots").boundingBox()
  ]);
  expect(pitch.x).toBeGreaterThanOrEqual(app.x - 1);
  expect(pitch.x + pitch.width).toBeLessThanOrEqual(app.x + app.width + 1);
});
