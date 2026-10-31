import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "universe_portal_v1_test",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#fmuvOpenHome")).toBeVisible();
});

test("Hjem viser ekte kalenderkontekst og snarveier til spillflatene", async ({ page }) => {
  await page.locator("#fmuvOpenHome").click();
  await expect(page.locator("#fmuvHome")).toBeVisible();
  await expect(page.locator("#fmuvMatchName")).not.toBeEmpty();
  await expect(page.locator("#fmuvWeek")).not.toBeEmpty();
  await expect(page.locator("#fmuvHomeMail")).toBeVisible();
  await expect(page.locator("#fmuvHome .fmuv-quick-action")).toHaveCount(7);
  await page.locator("#fmuvHome .fmuv-quick-action").filter({ hasText: "Taktikk" }).click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#lineupSlots")).toBeVisible();
});

test("Innboks bruker canonical meldinger og lar kalenderen håndtere svar", async ({ page }) => {
  await page.locator("#fmuvOpenInbox").click();
  await expect(page.locator("#fmuvInbox")).toBeVisible();
  const mails = page.locator("#fmuvInboxList [data-message-id]");
  await expect.poll(() => mails.count()).toBeGreaterThan(0);
  const id = await mails.first().getAttribute("data-message-id");
  await mails.first().click();
  await expect(page.locator("#fmuvInboxDetail .fmuv-mail-open")).toBeVisible();
  await page.locator("#fmuvInboxDetail .fmuv-mail-open").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerCalendarMessageDrawer")).toBeVisible();
  await expect(page.locator("#managerCalendarDrawerBody .manager-club-mail")).toHaveAttribute("data-message-id", id || "");
  await page.locator("#managerCalendarMessageDrawer .manager-calendar-drawer-close").click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
});

test("Portal og innboks fungerer på mobil uten horisontal lekkasje", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [trigger, section] of [["#fmuvOpenHome", "#fmuvHome"], ["#fmuvOpenInbox", "#fmuvInbox"]]) {
    await page.locator(trigger).click();
    await expect(page.locator(section)).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(width).toBeLessThanOrEqual(1);
  }
});

test("Eksisterende fem hovedområder beholdes og Kalender er fortsatt autoritativ", async ({ page }) => {
  await expect(page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible')).toHaveText([
    "Kontor", "Lag", "Speiding", "Kamp", "Stats"
  ]);
  await page.locator("#fmuvOpenHome").click();
  await page.locator('.main-nav [data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#managerCalendarDays")).toBeVisible();
});
