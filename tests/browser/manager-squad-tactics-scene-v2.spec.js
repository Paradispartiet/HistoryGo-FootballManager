import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openTeam(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#squadCompactStatus")).toBeVisible();
}

async function openRoster(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="squad"]').click();
  await expect(page.locator('[data-tab-section="squad"]')).toBeVisible();
  await expect(page.locator("#managerPlayerWorkspace")).toBeVisible();
  await expect.poll(async () => page.locator("#managerRosterBody tr").count()).toBeGreaterThanOrEqual(15);
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
      activeLeagueSaveId: "player_workspace_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("Lag er ryddet ned til én kompakt statuslinje uten konkurrerende neste-handling", async ({ page }) => {
  await openTeam(page);
  await expect(page.locator("#squadCompactStatus")).toContainText("Tropp");
  await expect(page.locator("#squadCompactStatus")).toContainText("Ellever");
  await expect(page.locator("#squadCompactStatus")).toContainText("Benk");
  await expect(page.locator("#squadSetupGate")).toBeHidden();
  await expect(page.locator(".squad-tactics-command-action")).toBeHidden();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#formationSelect")).toBeVisible();
});

test("Tropp er en tett spillerliste med søk, filter og sesongkolonner", async ({ page }) => {
  await openRoster(page);
  await expect(page.locator(".manager-roster-table thead")).toContainText("Spiller");
  await expect(page.locator(".manager-roster-table thead")).toContainText("Status");
  await expect(page.locator(".manager-roster-table thead")).toContainText("Målgivende");

  const firstName = await page.locator(".manager-roster-player-link strong").first().innerText();
  await page.locator("#managerRosterSearch").fill(firstName);
  await expect(page.locator("#managerRosterBody tr")).toHaveCount(1);
  await page.locator("#managerRosterSearch").fill("");
  await expect.poll(async () => page.locator("#managerRosterBody tr").count()).toBeGreaterThanOrEqual(15);
});

test("Spillernavn åpner en full profil uten å endre laguttaket", async ({ page }) => {
  await openRoster(page);
  const selectedBefore = await page.locator(".lineup-player-card.is-selected").count();
  const firstName = await page.locator(".manager-roster-player-link strong").first().innerText();
  await page.locator(".manager-roster-player-link").first().click();

  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  await expect(page.locator(".manager-player-profile-identity h2")).toHaveText(firstName);
  await expect(page.locator(".manager-player-mini-pitch")).toBeVisible();
  await expect(page.locator(".manager-player-attribute-group")).toHaveCount(4);
  await expect(page.locator(".manager-player-section-head")).toContainText("ingen overall");
  await expect(page.locator(".manager-player-profile-tabs")).toContainText("Sesong");
  await expect(page.locator(".manager-player-profile-tabs")).toContainText("Trening");
  await expect(page.locator(".manager-player-profile-tabs")).toContainText("Historikk");
  expect(await page.locator(".lineup-player-card.is-selected").count()).toBe(selectedBefore);
});

test("Oppstilling skiller profilklikk fra eksplisitt Velg-handling", async ({ page }) => {
  await openTeam(page);
  await expect.poll(async () => page.locator(".lineup-player-choice-row").count()).toBeGreaterThan(0);
  const chosenBefore = await page.locator(".lineup-player-select-action.is-selected").count();
  await page.locator(".lineup-player-profile-link").first().click();
  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  expect(await page.locator(".lineup-player-select-action.is-selected").count()).toBe(chosenBefore);
  await page.locator(".manager-player-profile-close").click();
  await expect(page.locator(".lineup-player-select-action").first()).toContainText(/Velg|Valgt/);
});

test("Spillerlisten og profilen har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRoster(page);
  await expectNoHorizontalOverflow(page);
  await page.locator(".manager-roster-player-link").first().click();
  await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Tropp og spillerprofil har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openRoster(page);
  await page.locator(".manager-roster-player-link").first().click();
  const results = await new AxeBuilder({ page })
    .include("#managerPlayerProfileDialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
