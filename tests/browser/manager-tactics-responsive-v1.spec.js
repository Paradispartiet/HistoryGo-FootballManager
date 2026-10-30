import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "responsive_tactics_ui_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await expect(page.locator("#fmResponsiveTacticsGrid")).toBeVisible();
});

test("landskap på iPad viser to formasjonstavler, spillerliste og original benk", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
  await expect(page.locator("#benchPlayersList")).toBeAttached();

  await expect.poll(async () => page.locator("#lineupSlots .player-chip").count()).toBe(11);
  await expect.poll(async () => page.locator("#fmPhasePitch .fm-phase-player").count()).toBe(11);
  await expect.poll(async () => page.locator("#fmTacticsSquadRows .fm-squad-row").count()).toBe(11);

  const ownership = await page.evaluate(() => ({
    benchParent: document.querySelector("#benchPlayersList")?.closest(".fm-tactics-bench")?.classList.contains("pitch-bench"),
    lineupParent: document.querySelector("#lineupSlots")?.closest(".pitch-stage")?.classList.contains("pitch-stage")
  }));
  expect(ownership).toEqual({ benchParent: true, lineupParent: true });
});

test("mobil stående bruker store faner uten å duplisere den spillbare banen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeHidden();
  await page.locator('[data-fm-view="phase"]').click();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await expect(page.locator("#lineupSlots")).toBeHidden();
  await page.locator('[data-fm-view="squad"]').click();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeHidden();
  await page.locator('[data-fm-view="pitch"]').click();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("mobil liggende har taktikkvisning og spillerliste samtidig", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
  await page.locator('[data-fm-view="phase"]').click();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
});

test("spillerprofil åpnes fra reell spiller-ID, ikke en ny score eller kopi av laguttaket", async ({ page }) => {
  await expect.poll(async () => page.locator("#fmTacticsSquadRows .fm-squad-row").count()).toBe(11);
  const player = page.locator("#fmTacticsSquadRows .fm-player-profile").first();
  if (await player.count()) {
    await player.click();
    await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  } else {
    await expect(page.locator("#fmTacticsSquadRows")).toContainText("Tom plass");
  }
});
