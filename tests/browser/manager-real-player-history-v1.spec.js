import { expect, test } from "@playwright/test";
import { getPlayerClubHistory, getPlayerSummary, createRosterViewModel } from "../../src/ui/manager-player-workspace-v1.js";

test("real-player history helper never invents club identities", () => {
  const clubs = new Map([["lyn", "Lyn"], ["rana", "Rana"]]);
  const history = getPlayerClubHistory({
    name: "Sample",
    clubAffiliations: [
      { clubId: "lyn", relation: "played_for", source: "belagt" },
      { clubId: "unknown", relation: "played_for", source: "utledet" },
      { clubId: "lyn", relation: "played_for", source: "belagt" },
      { clubId: "rana", relation: "played_for", source: "utledet" }
    ]
  }, clubs);
  expect(history).toEqual([
    { clubId: "lyn", name: "Lyn", relation: "played_for", evidence: "belagt" },
    { clubId: "rana", name: "Rana", relation: "played_for", evidence: "ikke verifisert" }
  ]);
  expect(getPlayerClubHistory({ name: "No history" }, clubs)).toEqual([]);
  const rows = createRosterViewModel({
    players: [{ id: "known", name: "Known", naturalPositions: ["CB"], clubAffiliations: [{ clubId: "lyn", source: "belagt" }] }],
    unlockedPlayerIds: new Set(["known"]),
    clubsById: clubs
  });
  expect(rows[0].clubHistory[0].name).toBe("Lyn");
  expect(rows).toHaveLength(1);
});

test("card summary uses only registered traits and openly marks modeled information", () => {
  const summary = getPlayerSummary({
    strengths: ["finishing"], archetypes: ["finisher", "duel_winner"], preferredRoles: ["poacher"]
  }, {
    attributeNames: new Map([["finishing", { name: "Avslutninger" }]]),
    roleNames: new Map([["poacher", { name: "Boksspiss" }]])
  });
  expect(summary.registeredStrengths).toEqual(["Avslutninger"]);
  expect(summary.modelTraits).toEqual(["Avslutter", "Duellsterk"]);
  expect(summary.preferredRoles).toEqual(["Boksspiss"]);
  expect(getPlayerSummary({ id: "unknown", archetypes: [] }).registeredStrengths).toEqual([]);
  expect(getPlayerSummary({ id: "unknown", strengths: [] }).modelTraits).toEqual([]);
});

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "player_history_cards_v1",
      clubName: "Min egen klubb",
      managerName: "Manager",
      leagueName: "HG Liga",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerRosterBody tr").first()).toBeAttached();
});

test("mobile squad cards show historic club before modeled game values", async ({ page }) => {
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="squad"]').click();

  const first = page.locator("#managerRosterBody tr").first();
  await expect(first).toBeVisible();
  await expect(first.locator(".manager-roster-clubs")).toBeVisible();
  await expect(first.locator(".manager-roster-identity")).toBeVisible();
  await expect(first.locator(".manager-roster-model-values")).toContainText("Spillverdier (modell 1–20):");
  const details = await first.locator("td:first-child").innerText();
  expect(details).toMatch(/Spilte for:|Registrert klubbtilknytning:|Klubbhistorikk mangler/);
  expect(details).not.toMatch(/Alder: \d+/);

  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(pageOverflow).toBeLessThanOrEqual(1);
});

test("player details preserve club history and disclose that 1–20 ratings are modeled", async ({ page }) => {
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="squad"]').click();
  const first = page.locator("#managerRosterBody tr").first();
  const initialHistory = await first.locator(".manager-roster-clubs").innerText();
  await first.locator(".manager-roster-player-link").click();
  const dialog = page.locator("#managerPlayerProfileDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".manager-profile-club-history")).toHaveText(initialHistory);
  await expect(dialog.locator(".manager-player-summary")).toBeVisible();
  await expect(dialog.locator(".manager-player-summary-strengths")).toBeVisible();
  await expect(dialog.locator(".manager-player-summary-model")).toBeVisible();
  await expect(dialog.locator(".manager-player-summary-values")).toBeVisible();
  await expect(dialog.locator(".manager-player-summary-note")).toContainText("ikke dokumentert biografi");
  await expect(dialog.getByText("Spillverdier (beregnet modell)")).toBeVisible();
  await dialog.locator(".manager-player-profile-tabs button").filter({ hasText: "Historikk" }).click();
  await expect(dialog.getByText("Registrert klubbhistorikk")).toBeVisible();
  await expect(dialog.getByText(initialHistory)).toHaveCount(2);
});
