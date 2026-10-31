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
  await expect(page.locator("#fmuvHomeStanding")).toHaveText(await page.locator("#statsStanding").textContent());
  await expect(page.locator("#fmuvHomeMatches")).toHaveText(await page.locator("#statsMatches").textContent());
  await expect(page.locator("#fmuvHomeGoals")).toHaveText(await page.locator("#statsGoals").textContent());
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


test("Tropp viser faktiske spillertall fra den samme spillerlisten", async ({ page }) => {
  await page.locator(".main-nav [data-tab-target='tactics']").click();
  await page.locator(".app-subtab[data-tab-target='squad']").click();
  await expect(page.locator("#managerPlayerWorkspace")).toBeVisible();
  await expect.poll(() => page.locator("#managerRosterBody tr").count()).toBeGreaterThan(0);
  const count = Number(await page.locator("#fmuvRosterTotal").textContent());
  const ready = Number(await page.locator("#fmuvRosterReady").textContent());
  const loaded = Number(await page.locator("#fmuvRosterLoaded").textContent());
  const injured = Number(await page.locator("#fmuvRosterInjured").textContent());
  expect(count).toBeGreaterThan(0);
  expect(ready + loaded + injured).toBe(count);
  await expect(page.locator("#managerRosterBody tr").first()).toHaveAttribute("data-position-group", /^(defense|midfield|attack)$/);
});

test("Taktikk beholder spiller-ID og startellever ved sammenligning og tilbake", async ({ page }) => {
  await page.locator(".main-nav [data-tab-target='tactics']").click();
  await expect(page.locator("#fmResponsiveTacticsGrid")).toBeVisible();
  const chips = page.locator("#lineupSlots .player-chip");
  await expect(chips).toHaveCount(11);
  const before = await chips.evaluateAll((items) => items.map((chip) => [
    chip.dataset.slotId, chip.dataset.playerId || ""
  ]));
  await page.locator("#fmComparePhases").click();
  await expect(page.locator("#fmAttackPitch")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await page.locator("#fmComparePhases").click();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  const after = await chips.evaluateAll((items) => items.map((chip) => [
    chip.dataset.slotId, chip.dataset.playerId || ""
  ]));
  expect(after).toEqual(before);
});


test("Portal og Innboks tilpasser iPad i begge retninger uten sidelekkasje", async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1194, height: 834 },
    { width: 834, height: 1194 }
  ]) {
    await page.setViewportSize(viewport);
    for (const [trigger, section] of [["#fmuvOpenHome", "#fmuvHome"], ["#fmuvOpenInbox", "#fmuvInbox"]]) {
      await page.locator(trigger).click();
      await expect(page.locator(section)).toBeVisible();
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, "overflow at " + viewport.width + "x" + viewport.height).toBeLessThanOrEqual(1);
    }
  }
});

test("Innboksfiltre endrer kun presentasjon, ikke meldingens identitet", async ({ page }) => {
  await page.locator("#fmuvOpenInbox").click();
  const list = page.locator("#fmuvInboxList [data-message-id]");
  await expect.poll(() => list.count()).toBeGreaterThan(0);
  const allIds = await list.evaluateAll((items) => items.map((item) => item.dataset.messageId));
  await page.locator('#fmuvInbox .fmuv-filter[data-filter="unread"]').click();
  const unreadIds = await list.evaluateAll((items) => items.map((item) => item.dataset.messageId));
  expect(unreadIds.every((id) => allIds.includes(id))).toBe(true);
  await page.locator('#fmuvInbox .fmuv-filter[data-filter="important"]').click();
  const importantIds = await list.evaluateAll((items) => items.map((item) => item.dataset.messageId));
  expect(importantIds.every((id) => allIds.includes(id))).toBe(true);
  await page.locator('#fmuvInbox .fmuv-filter[data-filter="all"]').click();
  const restoredIds = await list.evaluateAll((items) => items.map((item) => item.dataset.messageId));
  expect(restoredIds).toEqual(allIds);
});
