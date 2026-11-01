import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1194, height: 834 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "portal_landing_ipad_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#fmuvHome")).toBeVisible();
});

async function noPageOverflow(page) {
  const excess = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(excess).toBeLessThanOrEqual(1);
}

async function useButton(page, selector, touch = false) {
  const button = page.locator(selector);
  await expect(button).toBeVisible();
  if (touch) await button.tap();
  else await button.click();
}

test("Hjem er naturlig landing mens Kalender eier ukas faktiske fremdrift", async ({ page }) => {
  await expect(page.locator("#fmuvHome")).toBeVisible();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeHidden();
  await expect(page.locator("#managerLocationText")).toHaveText("Hjem · Portal");

  const savedWeek = await page.locator("#managerCalendarNow").textContent();
  await page.locator('.main-nav [data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerCalendarNow")).toHaveText(savedWeek || "");
  await expect(page.locator("#managerCalendarDays .manager-calendar-day-button")).toHaveCount(7);
  await page.locator("#fmuvOpenHome").click();
  await expect(page.locator("#fmuvHome")).toBeVisible();
  await expect(page.locator("#fmuvWeek")).toHaveText(savedWeek || "");
});

test("stående og liggende iPad: Hjem, Innboks og tilbake med store trykkflater", async ({ page, browserName }) => {
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 1194, height: 834 },
    { width: 834, height: 1194 }
  ]) {
    await page.setViewportSize(viewport);
    await useButton(page, "#fmuvOpenHome", browserName === "webkit");
    await expect(page.locator("#fmuvHome")).toBeVisible();
    await noPageOverflow(page);
    await useButton(page, "#fmuvOpenInbox", browserName === "webkit");
    await expect(page.locator("#fmuvInbox")).toBeVisible();
    await noPageOverflow(page);

    const hitboxes = await page.locator("#fmuvHeaderActions button").evaluateAll((buttons) =>
      buttons.map((button) => ({
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height
      }))
    );
    expect(hitboxes.length).toBe(2);
    expect(hitboxes.every((size) => size.height >= 44 && size.width >= 44)).toBe(true);
  }
});

test("Innboks åpner kanonisk melding, og en retur til Hjem endrer ikke lagring", async ({ page }) => {
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").clubWeekState
  );
  await page.locator("#fmuvOpenInbox").click();
  const mails = page.locator("#fmuvInboxList [data-message-id]");
  await expect.poll(() => mails.count()).toBeGreaterThan(0);
  const selectedId = await mails.first().getAttribute("data-message-id");
  await mails.first().click();
  await page.locator("#fmuvInboxDetail .fmuv-mail-open").click();
  await expect(page.locator("#managerCalendarMessageDrawer")).toBeVisible();
  await expect(page.locator("#managerCalendarDrawerBody .manager-club-mail"))
    .toHaveAttribute("data-message-id", selectedId || "");
  await page.locator("#managerCalendarMessageDrawer .manager-calendar-drawer-close").click();
  await page.locator("#fmuvOpenHome").click();
  await expect(page.locator("#fmuvHome")).toBeVisible();
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").clubWeekState
  );
  expect(after?.week).toBe(before?.week);
  expect(after?.phase).toBe(before?.phase);

  await page.reload();
  await expect(page.locator("#fmuvHome")).toBeVisible();
});
