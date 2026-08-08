import assert from "node:assert/strict";
import {
  acceptTransferOfferInMerits,
  generateTransferOfferForListedPlayer,
  listRecruitedPlayerForTransfer,
  reconcileTransferMarketInMerits,
  rejectTransferOfferInMerits,
  transferOfferUnits,
  transferWindowForSeason
} from "../src/football-transfer-market.js";

function season(round = 1, status = "active") {
  return {
    seasonNumber: 1,
    currentRound: round,
    status,
    managerClubId: "manager",
    tier: { id: "eliteserien", rounds: 30 },
    competition: { tierId: "eliteserien", rounds: 30 },
    clubs: [
      { id: "manager", name: "Managerklubben" },
      { id: "brann", name: "Brann" },
      { id: "viking", name: "Viking" },
      { id: "molde", name: "Molde" }
    ]
  };
}

function merits(playerId = "player_one") {
  return {
    recruitmentVersion: 1,
    recruitedPlayerIds: [playerId],
    clubEconomy: {
      version: 1,
      balance: 100,
      wageBudget: 60,
      lastSettledSeason: 1,
      contracts: {
        [playerId]: { playerId, remainingSeasons: 2, wageUnits: 3, signedSeason: 1, source: "recruited" }
      },
      ledger: []
    }
  };
}

assert.equal(transferWindowForSeason(season(1)).open, true);
assert.equal(transferWindowForSeason(season(4)).open, true);
assert.equal(transferWindowForSeason(season(5)).open, false);
assert.equal(transferWindowForSeason(season(16)).open, true);
assert.equal(transferWindowForSeason(season(18)).open, true);
assert.equal(transferWindowForSeason(season(19)).open, false);
assert.equal(transferWindowForSeason(season(30, "completed")).open, false);
assert.equal(transferOfferUnits({ remainingSeasons: 2, wageUnits: 3 }), 15);
assert.equal(transferOfferUnits({ remainingSeasons: 1, wageUnits: 3 }), 13);

const listed = listRecruitedPlayerForTransfer(merits(), "player_one", season(1));
assert.equal(listed.changed, true);
assert.deepEqual(listed.merits.transferMarket.listedPlayerIds, ["player_one"]);

const generated = generateTransferOfferForListedPlayer(listed.merits, "player_one", season(1));
assert.equal(generated.changed, true);
assert.equal(generated.offer.amount, 15);
assert.notEqual(generated.offer.bidderClubId, "manager");

const accepted = acceptTransferOfferInMerits(generated.merits, "player_one", season(1));
assert.equal(accepted.changed, true);
assert.equal(accepted.merits.recruitedPlayerIds.includes("player_one"), false);
assert.equal(Boolean(accepted.merits.clubEconomy.contracts.player_one), false);
assert.equal(accepted.merits.clubEconomy.balance, 115);
assert.equal(accepted.merits.transferMarket.history.at(-1)?.type, "sold");
assert.equal(accepted.merits.clubEconomy.ledger.at(-1)?.type, "transfer_sale");

const second = merits("player_two");
const secondListed = listRecruitedPlayerForTransfer(second, "player_two", season(1));
const secondOffer = generateTransferOfferForListedPlayer(secondListed.merits, "player_two", season(1));
const rejected = rejectTransferOfferInMerits(secondOffer.merits, "player_two", season(1));
assert.equal(rejected.changed, true);
assert.equal(Boolean(rejected.merits.transferMarket.offers.player_two), false);
assert.equal(rejected.merits.recruitedPlayerIds.includes("player_two"), true);
const noSecondOffer = generateTransferOfferForListedPlayer(rejected.merits, "player_two", season(1));
assert.equal(noSecondOffer.changed, false);
assert.equal(noSecondOffer.offer, null);

const closedListing = listRecruitedPlayerForTransfer(merits("player_three"), "player_three", season(5));
assert.equal(closedListing.changed, false);
assert.match(closedListing.reason, /Neste HGFM-vindu/);

const reconciled = reconcileTransferMarketInMerits(generated.merits, season(5));
assert.equal(Object.keys(reconciled.market.offers).length, 0);
assert.equal(reconciled.window.open, false);

const starterOnly = {
  recruitedPlayerIds: [],
  clubEconomy: { version: 1, balance: 100, wageBudget: 60, lastSettledSeason: 1, contracts: {}, ledger: [] }
};
const starterSaleAttempt = listRecruitedPlayerForTransfer(starterOnly, "starter_player", season(1));
assert.equal(starterSaleAttempt.changed, false);
assert.match(starterSaleAttempt.reason, /Bare rekrutterte spillere/);

console.log("✓ Overgangsmarked v2: vinduer, listing, bud, avslag og salg er konsistente.");
