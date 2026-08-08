import { expect, test } from "@playwright/test";

const LEAGUE_KEY = "historygo-football-manager.league-season.v3";

async function openClub(page) {
  await page.getByRole("tab", { name: "Kontor", exact: true }).click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.getByRole("tab", { name: "Klubben", exact: true }).click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
}

async function openAdministration(page) {
  await openClub(page);
  await page.locator('[data-club-room="administration"]').click();
  await page.locator('[data-club-room-action="admin"]').click();
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function seedCanonicalLeagueSeason(page) {
  await page.evaluate(async () => {
    const { LEAGUE_SEASON_VERSION, createLeagueSeason } = await import("/src/football-league-season.js");
    const clubsData = await fetch("/data/football_clubs.json").then((response) => response.json());
    const managerClub = clubsData.clubs.find((club) => club.id === "rosenborg");
    if (!managerClub) throw new Error("Mangler Rosenborg i canonical klubbdata");
    const tier = clubsData.tiers.find((entry) => entry.id === managerClub.tier);
    if (!tier) throw new Error(`Mangler tier ${managerClub.tier}`);
    const opponents = clubsData.clubs.filter((club) => club.tier === tier.id && club.id !== managerClub.id);
    const season = createLeagueSeason({ managerClub, opponents, tier, seed: "transfer-market-v2-browser", seasonNumber: 1 });
    localStorage.setItem(LEAGUE_SEASON_VERSION, JSON.stringify(season));
    window.dispatchEvent(new Event("updateProfile"));
  });
  await expect.poll(async () => page.evaluate((key) => Boolean(localStorage.getItem(key)), LEAGUE_KEY)).toBe(true);
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
          erik_johnsen: { playerId: "erik_johnsen", remainingSeasons: 2, wageUnits: 3, signedSeason: 1, source: "recruited" }
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
  await seedCanonicalLeagueSeason(page);
  await expect(page.locator("#managerTransferMarketWorkspace")).toBeAttached();
});

test("legacy overgangsmarked initialiseres men er ute av live IA", async ({ page }) => {
  await openAdministration(page);
  const workspace = page.locator("#managerTransferMarketWorkspace");
  await expect(workspace).toBeAttached();
  await expect(workspace).toBeHidden();
  await expect(page.locator('[data-tab-section="market"]')).toBeHidden();
  await expect(page.locator("#managerClubOrganization")).not.toContainText(/overgangsvindu|overgangsbud|Gjør tilgjengelig for bud/i);
});

test("legacy overgangsmotoren er fortsatt tilgjengelig for trygg Pass 7-migrering", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const transfer = await import("/src/football-transfer-market.js");
    const season = {
      seasonNumber: 1,
      currentRound: 1,
      status: "active",
      managerClubId: "rosenborg",
      tier: { id: "eliteserien", rounds: 30 },
      competition: { tierId: "eliteserien", rounds: 30 },
      clubs: [{ id: "rosenborg" }, { id: "brann" }, { id: "viking" }]
    };
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    const listed = transfer.listRecruitedPlayerForTransfer(merits, "erik_johnsen", season);
    const accepted = transfer.acceptTransferOfferInMerits(listed.merits, "erik_johnsen", season);
    return {
      listed: listed.changed,
      offer: listed.offer?.amount,
      sold: accepted.changed,
      recruited: accepted.merits.recruitedPlayerIds.includes("erik_johnsen"),
      balance: accepted.merits.clubEconomy.balance
    };
  });
  expect(result).toEqual({ listed: true, offer: 15, sold: true, recruited: false, balance: 115 });
});

test("eksisterende transfer-state overlever refresh uten å bli eksponert", async ({ page }) => {
  await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.transferMarket.listedPlayerIds = ["erik_johnsen"];
    merits.transferMarket.history = [{ type: "listed", playerId: "erik_johnsen" }];
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
  });
  await page.reload();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}").transferMarket || {});
  expect(saved.listedPlayerIds).toContain("erik_johnsen");
  expect(saved.history.at(-1)?.type).toBe("listed");
  await openAdministration(page);
  await expect(page.locator("#managerTransferMarketWorkspace")).toBeHidden();
});

test("skjult legacy overgangsmarked skaper ikke mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdministration(page);
  await expect(page.locator("#managerTransferMarketWorkspace")).toBeHidden();
  await expectNoHorizontalOverflow(page);
});
