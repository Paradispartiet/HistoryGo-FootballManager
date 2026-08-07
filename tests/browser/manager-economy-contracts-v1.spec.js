import { expect, test } from "@playwright/test";

async function openScouting(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="historygo"]').click();
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
  await expect.poll(async () => page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').count()).toBeGreaterThan(0);
}

async function openEconomy(page) {
  await page.getByRole("tab", { name: "Kontor", exact: true }).click();
  await page.getByRole("tab", { name: "Klubbdrift", exact: true }).click();
  await expect(page.locator("#clubCommand")).toBeVisible();
  await page.locator('[data-club-target="admin"]').first().click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#managerEconomyWorkspace")).toBeVisible();
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
      activeLeagueSaveId: "economy_contracts_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      recruitmentVersion: 1,
      recruitedPlayerIds: [],
      unlockedPlaceIds: ["kfum_arena"],
      hiredStaffIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubEconomy: {
        version: 1,
        balance: 100,
        wageBudget: 60,
        lastSettledSeason: 1,
        contracts: {},
        ledger: []
      }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerEconomyWorkspace")).toBeAttached();
});

test("økonomimotoren håndterer signering, fornyelse, utløp, release og legacy-save", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const economy = await import("/src/football-club-economy.js");
    const context = { tierId: "eliteserien", seasonNumber: 1, baseSquadCount: 15 };
    const base = {
      recruitmentVersion: 1,
      recruitedPlayerIds: ["new-player"],
      clubEconomy: { version: 1, balance: 100, wageBudget: 60, lastSettledSeason: 1, contracts: {}, ledger: [] }
    };
    const signed = economy.signRecruitmentContractInMerits(base, "new-player", context);
    const seasonTwo = economy.settleClubEconomySeasonInMerits(signed.merits, 2, { tierId: "eliteserien" });
    const renewed = economy.renewRecruitmentContractInMerits(seasonTwo.merits, "new-player", { ...context, seasonNumber: 2 });
    const seasonThree = economy.settleClubEconomySeasonInMerits(renewed.merits, 3, { tierId: "eliteserien" });
    const seasonFour = economy.settleClubEconomySeasonInMerits(seasonThree.merits, 4, { tierId: "eliteserien" });

    const releaseBase = economy.signRecruitmentContractInMerits({
      recruitmentVersion: 1,
      recruitedPlayerIds: ["release-player"],
      clubEconomy: { version: 1, balance: 100, wageBudget: 60, lastSettledSeason: 1, contracts: {}, ledger: [] }
    }, "release-player", context);
    const released = economy.releaseRecruitmentContractInMerits(releaseBase.merits, "release-player", context);

    const legacy = economy.initializeClubEconomyInMerits({
      recruitmentVersion: 1,
      recruitedPlayerIds: ["legacy-player"]
    }, { tierId: "obosligaen", seasonNumber: 1 });

    const wageBlocked = economy.canRecruitWithEconomy({
      version: 1,
      balance: 100,
      wageBudget: 31,
      lastSettledSeason: 1,
      contracts: {},
      ledger: []
    }, { tierId: "eliteserien", seasonNumber: 1, baseSquadCount: 15 });

    return {
      signed: {
        changed: signed.changed,
        balance: signed.economy.balance,
        remaining: signed.contract.remainingSeasons,
        wage: signed.contract.wageUnits
      },
      seasonTwo: {
        balance: seasonTwo.economy.balance,
        remaining: seasonTwo.economy.contracts["new-player"]?.remainingSeasons
      },
      renewed: {
        changed: renewed.changed,
        balance: renewed.economy.balance,
        remaining: renewed.contract?.remainingSeasons
      },
      expired: {
        playerStillRecruited: seasonFour.merits.recruitedPlayerIds.includes("new-player"),
        contractExists: Boolean(seasonFour.economy.contracts["new-player"]),
        expiredIds: seasonFour.expiredPlayerIds
      },
      released: {
        changed: released.changed,
        playerStillRecruited: released.merits.recruitedPlayerIds.includes("release-player"),
        contractExists: Boolean(released.economy.contracts["release-player"])
      },
      legacy: legacy.economy.contracts["legacy-player"],
      wageBlocked: { allowed: wageBlocked.allowed, reason: wageBlocked.reason },
      thirdTier: economy.economyPresetForTier("andredivisjon")
    };
  });

  expect(result.signed).toEqual({ changed: true, balance: 90, remaining: 2, wage: 3 });
  expect(result.seasonTwo).toEqual({ balance: 130, remaining: 1 });
  expect(result.renewed).toEqual({ changed: true, balance: 124, remaining: 2 });
  expect(result.expired.playerStillRecruited).toBe(false);
  expect(result.expired.contractExists).toBe(false);
  expect(result.expired.expiredIds).toContain("new-player");
  expect(result.released).toEqual({ changed: true, playerStillRecruited: false, contractExists: false });
  expect(result.legacy).toEqual(expect.objectContaining({ source: "legacy", wageUnits: 0, remainingSeasons: 2 }));
  expect(result.wageBlocked.allowed).toBe(false);
  expect(result.wageBlocked.reason).toContain("Lønnsrammen");
  expect(result.thirdTier).toEqual({ openingBalance: 60, wageBudget: 48, seasonGrant: 24 });
});

test("Stab & drift viser klubbmidler, lønnsramme og kontraktsflate", async ({ page }) => {
  await openEconomy(page);
  const workspace = page.locator("#managerEconomyWorkspace");
  await expect(workspace).toContainText("Spilløkonomi");
  await expect(workspace).toContainText("Klubbmidler");
  await expect(workspace).toContainText("100");
  await expect(workspace).toContainText("30/60");
  await expect(workspace).toContainText("Standardavtale for ny rekruttering");
  await expect(workspace).toContainText("ikke historiske");
});

test("Hent til troppen lager avtale, trekker midler og synker league-snapshotet", async ({ page }) => {
  await openScouting(page);
  const row = page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').first();
  const playerId = await row.getAttribute("data-player-id");
  const playerName = await row.locator(".scouting-player-link strong").innerText();
  expect(playerId).toBeTruthy();

  await row.getByRole("button", { name: `Hent ${playerName} til troppen` }).click();
  await expect(page.locator("#scoutingRecruitmentFeedback")).toContainText(`${playerName} er hentet til troppen`);
  await expect(row).toHaveAttribute("data-squad-status", "squad");

  const saved = await page.evaluate((id) => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    return {
      balance: merits.clubEconomy?.balance,
      contract: merits.clubEconomy?.contracts?.[id],
      snapshotContract: envelope.sessions?.league?.teamMerits?.clubEconomy?.contracts?.[id]
    };
  }, playerId);
  expect(saved.balance).toBe(90);
  expect(saved.contract).toEqual(expect.objectContaining({ remainingSeasons: 2, wageUnits: 3, source: "recruited" }));
  expect(saved.snapshotContract).toEqual(expect.objectContaining({ remainingSeasons: 2, wageUnits: 3 }));
});

test("rekruttering blokkeres før troppsstate endres når klubbkassen er tom", async ({ page }) => {
  await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.clubEconomy.balance = 0;
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
  });
  await openScouting(page);
  const row = page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').first();
  const playerId = await row.getAttribute("data-player-id");
  const playerName = await row.locator(".scouting-player-link strong").innerText();
  await row.getByRole("button", { name: `Hent ${playerName} til troppen` }).click();
  await expect(page.locator("#scoutingRecruitmentFeedback")).toContainText("Kan ikke hente spilleren");
  await expect(page.locator("#scoutingRecruitmentFeedback")).toContainText("10 klubbmidler");
  await expect(row).toHaveAttribute("data-squad-status", "candidate");
  const recruited = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").recruitedPlayerIds || []);
  expect(recruited).not.toContain(playerId);
});

test("økonomiflaten fungerer på 390px uten sideoverflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openEconomy(page);
  await expect(page.locator("#managerEconomyWorkspace")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
