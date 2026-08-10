import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openSquad(page) {
  await page.getByRole("tab", { name: "Lag", exact: true }).click();
  await page.getByRole("tab", { name: "Tropp", exact: true }).click();
  await expect(page.locator("#managerPlayerWorkspace")).toBeVisible();
  await expect(page.locator("#openPlayerPoolSquadDrawer")).toBeVisible();
}

async function openDrawer(page) {
  await openSquad(page);
  await page.locator("#openPlayerPoolSquadDrawer").click();
  await expect(page.locator("#playerPoolSquadDrawer")).toBeVisible();
  await expect.poll(async () => page.locator('.player-pool-squad-row[data-in-squad="false"]').count()).toBeGreaterThan(0);
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
      activeLeagueSaveId: "player_pool_squad_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      recruitmentVersion: 1,
      recruitedPlayerIds: [],
      playerPoolSquadVersion: 0,
      squadPlayerIds: [],
      unlockedPlaceIds: ["kfum_arena"],
      hiredStaffIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("gammel save migreres og Min spillerpool kan velge inn og ta ut uten ny motor", async ({ page }) => {
  await openDrawer(page);
  const alternative = page.locator('.player-pool-squad-row[data-in-squad="false"]').first();
  const playerId = await alternative.getAttribute("data-player-id");
  const playerName = await alternative.locator(".player-pool-squad-player strong").innerText();
  expect(playerId).toBeTruthy();

  await expect(page.locator(`#managerRosterBody tr[data-player-id="${playerId}"]`)).toHaveCount(0);
  await alternative.getByRole("button", { name: `Velg ${playerName} inn i troppen` }).click();
  await expect(page.locator("#playerPoolSquadFeedback")).toContainText(`${playerName} er valgt inn`);
  await expect(page.locator(`.player-pool-squad-row[data-player-id="${playerId}"]`)).toHaveAttribute("data-in-squad", "true");

  let merits = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}"));
  expect(merits.playerPoolSquadVersion).toBe(1);
  expect(merits.squadPlayerIds).toContain(playerId);
  expect(merits.recruitedPlayerIds).toEqual([]);

  await page.locator(".player-pool-squad-close").click();
  await expect(page.locator(`#managerRosterBody tr[data-player-id="${playerId}"]`)).toBeVisible();
  await page.locator("#openPlayerPoolSquadDrawer").click();
  await page.locator(`.player-pool-squad-row[data-player-id="${playerId}"]`).getByRole("button", { name: `Ta ${playerName} ut av troppen` }).click();
  await expect(page.locator("#playerPoolSquadFeedback")).toContainText("ligger fortsatt i Min spillerpool");
  merits = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}"));
  expect(merits.squadPlayerIds).not.toContain(playerId);
});

test("en spiller i startelleveren må byttes ut før uttak", async ({ page }) => {
  await openSquad(page);
  const lineupPlayerId = await page.locator('#lineupSlots .player-chip[data-player-id]:not([data-player-id=""])').first().getAttribute("data-player-id");
  expect(lineupPlayerId).toBeTruthy();
  await page.locator("#openPlayerPoolSquadDrawer").click();
  const row = page.locator(`.player-pool-squad-row[data-player-id="${lineupPlayerId}"]`);
  await row.locator(".player-pool-squad-action").click();
  await expect(page.locator("#playerPoolSquadFeedback")).toContainText("Bytt spilleren på Oppstilling");
  await expect(row).toHaveAttribute("data-in-squad", "true");
});

test("Endre tropp fungerer på 390 px uten dokument-overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDrawer(page);
  await expectNoHorizontalOverflow(page);
  const alternative = page.locator('.player-pool-squad-row[data-in-squad="false"]').first();
  await alternative.locator(".player-pool-squad-action").click();
  await expect(alternative).toHaveAttribute("data-in-squad", "true");
  await expectNoHorizontalOverflow(page);
});

test("Tropp og Endre tropp har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openDrawer(page);
  const results = await new AxeBuilder({ page })
    .include("#playerPoolSquadDrawer")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
