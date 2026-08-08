import { expect, test } from "@playwright/test";

const LEAGUE_KEY = "historygo-football-manager.league-season.v3";

async function openEconomy(page) {
  await page.getByRole("tab", { name: "Kontor", exact: true }).click();
  await page.getByRole("tab", { name: "Klubbdrift", exact: true }).click();
  await expect(page.locator("#clubCommand")).toBeVisible();
  await page.locator('[data-club-target="admin"]').first().click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#managerTransferMarketWorkspace")).toBeVisible();
}

async function openScouting(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="historygo"]').click();
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
  await expect.poll(async () => page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').count()).toBeGreaterThan(0);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function setLeagueRound(page, round) {
  await page.evaluate(({ key, roundNumber }) => {
    const season = JSON.parse(localStorage.getItem(key) || "null");
    if (!season) throw new Error("Mangler ligasesong i browser-test");
    season.currentRound = roundNumber;
    season.status = "active";
    localStorage.setItem(key, JSON.stringify(season));
    window.dispatchEvent(new Event("updateProfile"));
  }, { key: LEAGUE_KEY, roundNumber: round });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "transfer_market_v2",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      recruitmentVersion: 1,
      recruitedPlayerIds: ["erik_johnsen"],
      unlockedPlaceIds: ["kfum_arena"],
      hiredStaffIds: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubEconomy: {
        version: 1,
        balance: 100,
        wageBudget: 60,
        lastSettledSeason: 1,
        contracts: {
          erik_johnsen: {
            playerId: "erik_johnsen",
            remainingSeasons: 2,
            wageUnits: 3,
            signedSeason: 1,
            source: "recruited"
          }
        },
        ledger: []
      },
      transferMarket: {
        version: 2,
        listedPlayerIds: [],
        offers: {},
        closedOfferKeys: [],
        history: [],
        lastSeenWindowKey: "s1:opening"
      }
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#managerTransferMarketWorkspace")).toBeAttached();
});

test("listing gir bud i samme økt og Godta bud gjør salget atomisk", async ({ page }) => {
  await openEconomy(page);
  const workspace = page.locator("#managerTransferMarketWorkspace");
  await expect(workspace).toContainText("Vindu åpent");
  const card = workspace.locator('[data-transfer-player="erik_johnsen"]');
  await expect(card).toContainText("Erik Johnsen");

  await card.getByRole("button", { name: "Gjør Erik Johnsen tilgjengelig for bud" }).click();
  await expect(card).toContainText("Bud mottatt");
  await expect(card.getByRole("button", { name: "Godta bud på Erik Johnsen" })).toBeVisible();
  const offerText = await card.locator(".transfer-offer strong").innerText();
  expect(offerText).toMatch(/15 klubbmidler/);

  await card.getByRole("button", { name: "Godta bud på Erik Johnsen" }).click();
  await expect(workspace).toContainText("kjøper spilleren for 15 HGFM-klubbmidler");
  await expect(workspace.locator('[data-transfer-player="erik_johnsen"]')).toHaveCount(0);

  const saved = await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    const snapshot = envelope.sessions?.league?.teamMerits || {};
    return {
      recruited: merits.recruitedPlayerIds || [],
      contract: merits.clubEconomy?.contracts?.erik_johnsen,
      balance: merits.clubEconomy?.balance,
      ledgerType: merits.clubEconomy?.ledger?.at(-1)?.type,
      historyType: merits.transferMarket?.history?.at(-1)?.type,
      snapshotRecruited: snapshot.recruitedPlayerIds || [],
      snapshotBalance: snapshot.clubEconomy?.balance
    };
  });
  expect(saved.recruited).not.toContain("erik_johnsen");
  expect(saved.contract).toBeUndefined();
  expect(saved.balance).toBe(115);
  expect(saved.ledgerType).toBe("transfer_sale");
  expect(saved.historyType).toBe("sold");
  expect(saved.snapshotRecruited).not.toContain("erik_johnsen");
  expect(saved.snapshotBalance).toBe(115);
});

test("stengt vindu vises i klubbdrift og blokkerer ny rekruttering", async ({ page }) => {
  await setLeagueRound(page, 5);
  await openEconomy(page);
  const workspace = page.locator("#managerTransferMarketWorkspace");
  await expect(workspace).toContainText("Vindu stengt");
  await expect(workspace).toContainText("Neste HGFM-vindu åpner i runde 16");
  await expect(workspace.getByRole("button", { name: "Gjør Erik Johnsen tilgjengelig for bud" })).toBeDisabled();

  await openScouting(page);
  const row = page.locator('#scoutingRecruitableBody tr[data-squad-status="candidate"]').first();
  const playerId = await row.getAttribute("data-player-id");
  const playerName = await row.locator(".scouting-player-link strong").innerText();
  await row.getByRole("button", { name: `Hent ${playerName} til troppen` }).click();
  await expect(page.locator("#scoutingRecruitmentFeedback")).toContainText("overgangsvinduet er stengt");
  const recruited = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").recruitedPlayerIds || []);
  expect(recruited).not.toContain(playerId);
});

test("avslått bud blir ikke erstattet av nytt bud i samme vindu", async ({ page }) => {
  await openEconomy(page);
  const card = page.locator('[data-transfer-player="erik_johnsen"]');
  await card.getByRole("button", { name: "Gjør Erik Johnsen tilgjengelig for bud" }).click();
  await expect(card).toContainText("Bud mottatt");
  await card.getByRole("button", { name: "Avslå bud på Erik Johnsen" }).click();
  await expect(card).toContainText("Budet i dette vinduet er avslått");
  await expect(card).not.toContainText("Bud mottatt");
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").transferMarket || {});
  expect(state.history.at(-1)?.type).toBe("rejected");
  expect(state.offers?.erik_johnsen).toBeUndefined();
});

test("overgangsmarkedet fungerer på 390px uten global sideoverflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openEconomy(page);
  await expect(page.locator("#managerTransferMarketWorkspace")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
