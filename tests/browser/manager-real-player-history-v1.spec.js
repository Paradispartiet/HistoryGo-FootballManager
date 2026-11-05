import { expect, test } from "@playwright/test";
import { getPlayerClubHistory, getPlayerSummary, getPlayerSourcedSummary, createRosterViewModel } from "../../src/ui/manager-player-workspace-v1.js";

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


test("historical playing styles require an individually registered source and preserve P1 priority", () => {
  const p1 = getPlayerSourcedSummary({ id: "torgeir_borven", sourcePlaceIds: ["skagerak_arena"] });
  expect(p1?.sourceUrl).toContain("aftenposten.no");
  expect(p1?.description).toContain("Odd-spiss");

  const p2 = getPlayerSourcedSummary({ id: "erik_mykland", sourcePlaceIds: [] }, {
    attributeNames: new Map([["dribbling", { name: "Dribling" }]])
  });
  expect(p2?.sourceUrl).toBe("https://snl.no/Erik_Mykland");
  expect(p2?.description).toContain("Dribling");

  const depth = getPlayerSourcedSummary({ id: "eidur_gudjohnsen", sourcePlaceIds: [] });
  expect(depth?.sourceUrl).toContain("bt.no");
  expect(getPlayerSourcedSummary({ id: "erik_mykland", sourcePlaceIds: ["skagerak_arena"] })).toBeNull();
  expect(getPlayerSourcedSummary({ id: "unknown", sourcePlaceIds: [] })).toBeNull();
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

test("historical source is linked inside the real player profile and history tab", async ({ page }) => {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("hgfm:open-player-profile", {
      detail: { playerId: "erik_mykland", allowLocked: true }
    }));
  });
  const dialog = page.locator("#managerPlayerProfileDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".manager-player-summary .manager-player-source-evidence")).toContainText("Dribling");
  await expect(dialog.locator(".manager-player-summary .manager-player-source-link")).toHaveAttribute("href", "https://snl.no/Erik_Mykland");
  await dialog.locator(".manager-player-profile-tabs button").filter({ hasText: "Historikk" }).click();
  await expect(dialog.locator(".manager-player-history-card .manager-player-source-link")).toHaveAttribute("href", "https://snl.no/Erik_Mykland");
});


test("mobilprofil er kompakt og har 44px lukkeknapp og faner uten å miste kildehistorikken", async ({ page }) => {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("hgfm:open-player-profile", {
      detail: { playerId: "erik_mykland", allowLocked: true }
    }));
  });
  const dialog = page.locator("#managerPlayerProfileDialog");
  await expect(dialog).toBeVisible();

  for (const width of [360, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await dialog.evaluate((modal) => {
      const box = (selector) => modal.querySelector(selector).getBoundingClientRect();
      const close = box(".manager-player-profile-close");
      const pitch = box(".manager-player-mini-pitch");
      const tabs = [...modal.querySelectorAll(".manager-player-profile-tabs button")]
        .map((button) => button.getBoundingClientRect().height);
      return {
        closeWidth: close.width,
        closeHeight: close.height,
        pitchWidth: pitch.width,
        pitchHeight: pitch.height,
        modalRight: modal.getBoundingClientRect().right,
        tabHeights: tabs,
        overflow: modal.scrollWidth - modal.clientWidth
      };
    });
    expect(dimensions.closeWidth, "close width at " + width).toBeGreaterThanOrEqual(44);
    expect(dimensions.closeHeight, "close height at " + width).toBeGreaterThanOrEqual(44);
    expect(dimensions.tabHeights.length, "tabs at " + width).toBeGreaterThanOrEqual(2);
    expect(dimensions.tabHeights.every((height) => height >= 44), "tab targets at " + width).toBe(true);
    expect(dimensions.modalRight, "modal edge at " + width).toBeLessThanOrEqual(width + 1);
    expect(dimensions.overflow, "modal overflow at " + width).toBeLessThanOrEqual(1);
    if (width <= 430) {
      expect(dimensions.pitchWidth, "compact pitch width at " + width).toBeLessThanOrEqual(181);
      expect(dimensions.pitchHeight, "compact pitch height at " + width).toBeLessThanOrEqual(281);
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(dialog.locator(".manager-player-summary .manager-player-source-link"))
    .toHaveAttribute("href", "https://snl.no/Erik_Mykland");
  await dialog.locator(".manager-player-profile-tabs button").filter({ hasText: "Historikk" }).click();
  await expect(dialog.locator(".manager-player-history-card .manager-player-source-link"))
    .toHaveAttribute("href", "https://snl.no/Erik_Mykland");
  await dialog.locator(".manager-player-profile-close").click();
  await expect(dialog).toBeHidden();
});

test("360–430px har lavere profilbane uten å miste full profil eller trygge knapper", async ({ page }) => {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("hgfm:open-player-profile", {
      detail: { playerId: "erik_mykland", allowLocked: true }
    }));
  });
  const dialog = page.locator("#managerPlayerProfileDialog");
  await expect(dialog).toBeVisible();

  for (const width of [320, 360, 390, 430, 500]) {
    await page.setViewportSize({ width, height: 844 });
    const m = await dialog.evaluate((modal) => {
      const pitch = modal.querySelector(".manager-player-mini-pitch").getBoundingClientRect();
      const close = modal.querySelector(".manager-player-profile-close").getBoundingClientRect();
      const tabs = [...modal.querySelectorAll(".manager-player-profile-tabs button")]
        .map((button) => button.getBoundingClientRect());
      return {
        width: pitch.width,
        height: pitch.height,
        ratio: pitch.height / pitch.width,
        closeWidth: close.width,
        closeHeight: close.height,
        tabs: tabs.map((rect) => rect.height),
        overflow: modal.scrollWidth - modal.clientWidth,
        hasSummary: Boolean(modal.querySelector(".manager-player-summary")),
        hasPositionMarkers: Boolean(modal.querySelector(".manager-player-position-marker"))
      };
    });
    if (width >= 360 && width <= 430) {
      expect(m.width, "reduced field width at " + width).toBeLessThanOrEqual(161);
      expect(m.width, "readable field width at " + width).toBeGreaterThanOrEqual(145);
      expect(m.height, "reduced field height at " + width).toBeLessThanOrEqual(249);
    } else if (width === 320) {
      expect(m.width, "320px fallback field width").toBeGreaterThanOrEqual(145);
    } else {
      expect(m.width, "medium-width field unchanged").toBeGreaterThanOrEqual(200);
    }
    expect(m.ratio, "same field proportions at " + width).toBeGreaterThan(1.5);
    expect(m.ratio, "same field proportions at " + width).toBeLessThan(1.58);
    expect(m.closeWidth, "close width at " + width).toBeGreaterThanOrEqual(44);
    expect(m.closeHeight, "close height at " + width).toBeGreaterThanOrEqual(44);
    expect(m.tabs.every((height) => height >= 44), "tabs at " + width).toBe(true);
    expect(m.hasSummary).toBe(true);
    expect(m.hasPositionMarkers).toBe(true);
    expect(m.overflow, "no modal overflow at " + width).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(dialog.locator(".manager-player-summary .manager-player-source-link"))
    .toHaveAttribute("href", "https://snl.no/Erik_Mykland");
  await dialog.locator(".manager-player-profile-close").click();
  await expect(dialog).toBeHidden();
});
