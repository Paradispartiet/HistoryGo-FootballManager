import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LEGACY_FIELDS = ["facilities", "clubEconomy", "transferMarket"];

function oldMerits() {
  return {
    schema: "historygo-football-manager.team_merits.v1",
    version: 1,
    recruitmentVersion: 1,
    recruitedPlayerIds: ["erik_johnsen"],
    hiredStaffIds: ["nils_arne_eggen"],
    unlockedPlaceIds: ["kfum_arena"],
    unlockedExpertiseIds: ["pressing_structure"],
    earnedBadgeIds: ["training_culture_bronze"],
    roleFamiliarity: { "erik_johnsen:GK": 51 },
    localStart: { enabled: false, playerIds: [] },
    facilities: { version: 1, levels: { training: 3, medical: 3, analysis: 3 }, lastUpgradeWeek: 4 },
    clubEconomy: { version: 1, balance: 0, wageBudget: 0, contracts: {}, ledger: [] },
    transferMarket: { version: 2, listedPlayerIds: [], offers: {}, closedOfferKeys: [], history: [], lastSeenWindowKey: "s1:closed" }
  };
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((seed) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "pass7_legacy_cleanup",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(seed));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: { selectedFormationId: "classic_442", teamMerits: seed },
        scenario: { selectedFormationId: "wm_3223", teamMerits: { ...seed, recruitedPlayerIds: ["odd_iversen"] } },
        training: null,
        national: null
      }
    }));
  }, oldMerits());
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("gammel save mister bare de tre avviste managerfeltene", async ({ page }) => {
  const state = await page.evaluate(() => ({
    merits: JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}"),
    envelope: JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}")
  }));

  for (const field of LEGACY_FIELDS) {
    expect(state.merits[field]).toBeUndefined();
    expect(state.envelope.sessions.league.teamMerits[field]).toBeUndefined();
    expect(state.envelope.sessions.scenario.teamMerits[field]).toBeUndefined();
  }
  expect(state.merits.recruitedPlayerIds).toContain("erik_johnsen");
  expect(state.merits.hiredStaffIds).toContain("nils_arne_eggen");
  expect(state.merits.unlockedPlaceIds).toContain("kfum_arena");
  expect(state.merits.earnedBadgeIds).toContain("training_culture_bronze");
  expect(state.envelope.sessions.league.selectedFormationId).toBe("classic_442");
  expect(state.envelope.sessions.scenario.selectedFormationId).toBe("wm_3223");
  expect(state.envelope.sessions.scenario.teamMerits.recruitedPlayerIds).toContain("odd_iversen");
});

test("legacy økonomi, marked og fasilitetsflater finnes ikke lenger i DOM", async ({ page }) => {
  await expect(page.locator("#managerEconomyWorkspace, #managerTransferMarketWorkspace, #managerFacilitiesWorkspace")).toHaveCount(0);
  await expect(page.locator('[data-tab-section="facilities"], [data-tab-section="market"]')).toHaveCount(0);
  await expect(page.locator('.app-subtab[data-tab-target="facilities"], .app-subtab[data-tab-target="market"]')).toHaveCount(0);
  await expect(page.locator("#adminEconomyNote")).toHaveCount(0);
});

test("History Go-rekrutteringsklikk blokkeres ikke av skjult økonomi eller overgangsvindu", async ({ page }) => {
  const result = await page.evaluate(() => {
    const probe = document.createElement("button");
    probe.type = "button";
    probe.dataset.recruitPlayer = "pass7_probe";
    document.body.append(probe);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const dispatchResult = probe.dispatchEvent(event);
    const defaultPrevented = event.defaultPrevented;
    probe.remove();
    return { dispatchResult, defaultPrevented };
  });
  expect(result).toEqual({ dispatchResult: true, defaultPrevented: false });
});

test("legacy fasilitetsfasader lastes ikke lenger i runtime", async ({ page }) => {
  const loadedScripts = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  expect(loadedScripts.some((url) => /football-facilities|manager-facilities-workspace/.test(url))).toBe(false);
});

test("Pass 7 beholder mobilflyt og WCAG A/AA", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "Kontor", exact: true }).click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).include("body").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
