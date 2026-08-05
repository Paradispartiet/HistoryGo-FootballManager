import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openArea(page, target) {
  await page.locator(`.main-nav [role="tab"][data-tab-target="${target}"]`).click();
}

async function prepareActiveSeason(page) {
  await openArea(page, "tactics");
  const trainingTab = page.locator('.app-subtab[data-tab-target="trening"]').first();
  await expect(trainingTab).toBeAttached();
  await trainingTab.evaluate((node) => node.click());
  const focusButton = page.locator("#weeklyTrainingOptions button:not([disabled])").first();
  await expect(focusButton).toBeAttached();
  await focusButton.evaluate((node) => node.click());

  await openArea(page, "dashboard");
  const startSeason = page.locator("#leagueOnboardingSteps button", { hasText: "Start sesongen" });
  await expect(startSeason).toBeVisible();
  await startSeason.click();
  await expect(page.locator("#officeCommandPanel")).toBeVisible();
  await expect(page.locator("#officeCommand h2")).toHaveText("Managerkontoret");
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
      activeLeagueSaveId: "office_inbox_scene_v1",
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

test("managerkontoret prioriterer én hovedsak og fire operative statuser", async ({ page }) => {
  await prepareActiveSeason(page);

  await expect(page.locator(".office-priority-card")).toBeVisible();
  await expect(page.locator(".office-priority-card strong")).not.toBeEmpty();
  await expect(page.locator(".office-next-match-card")).toBeVisible();
  await expect(page.locator(".office-status-card")).toHaveCount(4);
  await expect(page.locator("#officeCommand .next-action-primary")).toHaveCount(0);
  await expect(page.locator("#nextActionPrimary")).toHaveCount(1);
  expect(await page.locator("#officeDepth").getAttribute("open")).toBeNull();

  await page.locator('.office-status-card[data-office-target="inbox"]').click();
  await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
});

test("assistentråden viser én fokussak og resten som kø", async ({ page }) => {
  await prepareActiveSeason(page);
  await page.locator('.app-subtab[data-tab-target="inbox"]').click();

  await expect(page.locator("#inboxFocusTitle")).not.toBeEmpty();
  await expect(page.locator("#inboxThreadList .inbox-thread-card.is-open, #inboxThreadList .message-card.is-empty")).toHaveCount(1);
  await expect(page.locator(".inbox-inline-stats")).toBeVisible();
  await expect(page.locator("#inboxSignalUnread")).toBeVisible();
  await expect(page.locator("#inboxSignalReplies")).toBeVisible();
  await expect(page.locator("#inboxThreadList .inbox-thread-toggle[aria-expanded=\"true\"]")).toHaveCount(1);
  await expect(page.locator("#inboxQueueList .inbox-thread-toggle[aria-expanded=\"true\"]")).toHaveCount(0);

  const queue = page.locator("#inboxQueueList .inbox-thread-toggle");
  if (await queue.count()) {
    const before = await page.locator("#inboxFocusTitle").textContent();
    await queue.first().click();
    await expect(page.locator("#inboxFocusTitle")).not.toHaveText(before || "");
    await expect(page.locator("#inboxThreadList .inbox-thread-card.is-open")).toHaveCount(1);
  }
});

test("assistentråd går direkte videre til trening", async ({ page }) => {
  await prepareActiveSeason(page);
  await page.locator('.app-subtab[data-tab-target="inbox"]').click();
  await page.locator("#inboxGoTraining").click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
});

test("kontor og assistentråd har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareActiveSeason(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.app-subtab[data-tab-target="inbox"]').click();
  await expectNoHorizontalOverflow(page);
});

test("assistentråden har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await prepareActiveSeason(page);
  await page.locator('.app-subtab[data-tab-target="inbox"]').click();
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="inbox"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
