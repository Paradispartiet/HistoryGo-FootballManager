import { normalizeClubEconomy } from "./football-club-economy.js";

// Overgangsmarked v2.
//
// Markedet bruker bare HGFM-saveverdier. Budbeløp er spillbalanse, ikke
// markedsverdi eller historiske overgangssummer, og de bruker aldri
// classHeight/Overall. Bare spillere manageren selv har rekruttert kan selges i v2.

export const TRANSFER_MARKET_VERSION = 2;
export const OPENING_WINDOW_ROUNDS = 4;
export const MIDSEASON_WINDOW_ROUNDS = 3;

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function integer(value, fallback = 0) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function ids(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))]
    : [];
}

function hash(text) {
  let value = 0x811c9dc5;
  for (const char of String(text)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

function normalizeOffer(value) {
  if (!isObject(value) || !value.playerId || !value.windowKey) return null;
  return {
    id: String(value.id || `${value.windowKey}:${value.playerId}`),
    playerId: String(value.playerId),
    bidderClubId: String(value.bidderClubId || ""),
    bidderClubName: String(value.bidderClubName || "Annen klubb"),
    amount: Math.max(0, integer(value.amount, 0)),
    windowKey: String(value.windowKey),
    seasonNumber: Math.max(1, integer(value.seasonNumber, 1)),
    round: Math.max(1, integer(value.round, 1))
  };
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).slice(-40).map((entry) => ({
    id: String(entry.id || `${entry.type || "event"}:${entry.windowKey || "window"}:${entry.playerId || "player"}`),
    type: String(entry.type || "event"),
    playerId: entry.playerId ? String(entry.playerId) : null,
    bidderClubId: entry.bidderClubId ? String(entry.bidderClubId) : null,
    bidderClubName: entry.bidderClubName ? String(entry.bidderClubName) : null,
    amount: Math.max(0, integer(entry.amount, 0)),
    windowKey: entry.windowKey ? String(entry.windowKey) : null,
    seasonNumber: Math.max(1, integer(entry.seasonNumber, 1)),
    round: Math.max(1, integer(entry.round, 1))
  }));
}

function completeRecruitmentSaleInMerits(merits, playerId, amount, { tierId = null, seasonNumber = 1 } = {}) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const saleAmount = Math.max(0, integer(amount, 0));
  const economy = normalizeClubEconomy(base.clubEconomy, { tierId, seasonNumber });
  if (!ids(base.recruitedPlayerIds).includes(id) || !economy.contracts[id]) {
    return { changed: false, reason: "Spilleren er ikke en salgbar rekruttering med aktiv avtale.", merits: base };
  }
  const contracts = { ...economy.contracts };
  delete contracts[id];
  const ledger = [...economy.ledger, {
    id: `transfer_sale-${Math.max(1, integer(seasonNumber, 1))}-${id}-${saleAmount}`,
    type: "transfer_sale",
    season: Math.max(1, integer(seasonNumber, 1)),
    playerId: id,
    amount: saleAmount,
    label: "HGFM-spillersalg"
  }].slice(-40);
  return {
    changed: true,
    merits: {
      ...base,
      recruitedPlayerIds: ids(base.recruitedPlayerIds).filter((entry) => entry !== id),
      clubEconomy: { ...economy, balance: economy.balance + saleAmount, contracts, ledger }
    }
  };
}

export function transferWindowForSeason(season) {
  const seasonNumber = Math.max(1, integer(season?.seasonNumber, 1));
  const currentRound = Math.max(1, integer(season?.currentRound, 1));
  const totalRounds = Math.max(2, integer(season?.competition?.rounds, season?.tier?.rounds || 30));
  const midStart = Math.floor(totalRounds / 2) + 1;
  if (season?.status && season.status !== "active") {
    return { open: false, key: `s${seasonNumber}:closed`, label: "Vindu stengt", phase: "closed", seasonNumber, currentRound, totalRounds, nextLabel: "Neste HGFM-vindu åpner ved starten av neste sesong." };
  }
  if (currentRound <= OPENING_WINDOW_ROUNDS) {
    return {
      open: true,
      key: `s${seasonNumber}:opening`,
      label: `HGFM-vindu · runde 1–${OPENING_WINDOW_ROUNDS}`,
      phase: "opening",
      seasonNumber,
      currentRound,
      totalRounds
    };
  }
  if (currentRound >= midStart && currentRound < midStart + MIDSEASON_WINDOW_ROUNDS) {
    return {
      open: true,
      key: `s${seasonNumber}:midseason`,
      label: `HGFM-vindu · runde ${midStart}–${midStart + MIDSEASON_WINDOW_ROUNDS - 1}`,
      phase: "midseason",
      seasonNumber,
      currentRound,
      totalRounds
    };
  }
  const nextLabel = currentRound < midStart
    ? `Neste HGFM-vindu åpner i runde ${midStart}.`
    : "Neste HGFM-vindu åpner ved starten av neste sesong.";
  return { open: false, key: `s${seasonNumber}:closed:r${currentRound}`, label: "Vindu stengt", phase: "closed", seasonNumber, currentRound, totalRounds, nextLabel };
}

export function normalizeTransferMarket(input, season = null) {
  const src = isObject(input) ? input : {};
  const offers = {};
  if (isObject(src.offers)) {
    Object.entries(src.offers).forEach(([playerId, raw]) => {
      const offer = normalizeOffer(raw);
      if (offer) offers[String(playerId)] = offer;
    });
  }
  return {
    version: TRANSFER_MARKET_VERSION,
    listedPlayerIds: ids(src.listedPlayerIds),
    offers,
    closedOfferKeys: ids(src.closedOfferKeys),
    history: normalizeHistory(src.history),
    lastSeenWindowKey: String(src.lastSeenWindowKey || transferWindowForSeason(season).key)
  };
}

export function transferOfferUnits(contract) {
  const remaining = Math.max(1, integer(contract?.remainingSeasons, 1));
  const wageUnits = Math.max(0, integer(contract?.wageUnits, 0));
  return 8 + remaining * 2 + wageUnits;
}

export function listRecruitedPlayerForTransfer(merits, playerId, season) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const window = transferWindowForSeason(season);
  if (!window.open) return { changed: false, reason: window.nextLabel || "Overgangsvinduet er stengt.", merits: base };
  if (!ids(base.recruitedPlayerIds).includes(id)) return { changed: false, reason: "Bare rekrutterte spillere kan legges ut for salg i v2.", merits: base };
  const economy = normalizeClubEconomy(base.clubEconomy, { tierId: season?.tier?.id, seasonNumber: season?.seasonNumber });
  if (!economy.contracts[id]) return { changed: false, reason: "Spilleren mangler en aktiv HGFM-avtale.", merits: base };
  const market = normalizeTransferMarket(base.transferMarket, season);
  if (market.listedPlayerIds.includes(id)) return { changed: false, reason: "Spilleren er allerede tilgjengelig for bud.", merits: base, market };
  const next = { ...market, listedPlayerIds: [...market.listedPlayerIds, id], lastSeenWindowKey: window.key };
  return { changed: true, reason: "Spilleren er lagt ut for bud i dette HGFM-vinduet.", market: next, merits: { ...base, transferMarket: next } };
}

export function withdrawRecruitedPlayerFromTransfer(merits, playerId, season) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const market = normalizeTransferMarket(base.transferMarket, season);
  if (!market.listedPlayerIds.includes(id) && !market.offers[id]) return { changed: false, reason: "Spilleren er ikke ute for salg.", merits: base, market };
  const offers = { ...market.offers };
  delete offers[id];
  const next = { ...market, listedPlayerIds: market.listedPlayerIds.filter((entry) => entry !== id), offers };
  return { changed: true, reason: "Spilleren er tatt av markedet.", market: next, merits: { ...base, transferMarket: next } };
}

export function generateTransferOfferForListedPlayer(merits, playerId, season) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const window = transferWindowForSeason(season);
  const market = normalizeTransferMarket(base.transferMarket, season);
  if (!window.open || !market.listedPlayerIds.includes(id)) return { changed: false, merits: base, market, offer: market.offers[id] || null };
  if (market.offers[id]) return { changed: false, merits: base, market, offer: market.offers[id] };
  const closeKey = `${window.key}:${id}`;
  if (market.closedOfferKeys.includes(closeKey)) return { changed: false, merits: base, market, offer: null };
  const economy = normalizeClubEconomy(base.clubEconomy, { tierId: season?.tier?.id, seasonNumber: season?.seasonNumber });
  const contract = economy.contracts[id];
  if (!contract) return { changed: false, merits: base, market, offer: null };
  const clubs = Array.isArray(season?.clubs) ? season.clubs.filter((club) => club?.id && club.id !== season?.managerClubId) : [];
  if (!clubs.length) return { changed: false, merits: base, market, offer: null };
  const bidder = clubs[hash(`${window.key}:${id}`) % clubs.length];
  const amount = transferOfferUnits(contract);
  const offer = {
    id: `${window.key}:${id}:${bidder.id}`,
    playerId: id,
    bidderClubId: String(bidder.id),
    bidderClubName: String(bidder.name || bidder.shortName || bidder.id),
    amount,
    windowKey: window.key,
    seasonNumber: window.seasonNumber,
    round: window.currentRound
  };
  const next = { ...market, offers: { ...market.offers, [id]: offer }, lastSeenWindowKey: window.key };
  return { changed: true, merits: { ...base, transferMarket: next }, market: next, offer };
}

export function reconcileTransferMarketInMerits(merits, season) {
  let nextMerits = isObject(merits) ? merits : {};
  const window = transferWindowForSeason(season);
  let market = normalizeTransferMarket(nextMerits.transferMarket, season);
  let changed = !isObject(nextMerits.transferMarket) || Number(nextMerits.transferMarket?.version) !== TRANSFER_MARKET_VERSION;

  const offers = Object.fromEntries(Object.entries(market.offers).filter(([, offer]) => offer.windowKey === window.key && window.open));
  if (Object.keys(offers).length !== Object.keys(market.offers).length) changed = true;
  market = { ...market, offers, lastSeenWindowKey: window.key };
  nextMerits = { ...nextMerits, transferMarket: market };

  if (window.open) {
    for (const playerId of market.listedPlayerIds) {
      const generated = generateTransferOfferForListedPlayer(nextMerits, playerId, season);
      if (generated.changed) {
        changed = true;
        nextMerits = generated.merits;
        market = generated.market;
      }
    }
  }
  return { changed, merits: nextMerits, market: normalizeTransferMarket(nextMerits.transferMarket, season), window };
}

export function rejectTransferOfferInMerits(merits, playerId, season) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const market = normalizeTransferMarket(base.transferMarket, season);
  const offer = market.offers[id];
  if (!offer) return { changed: false, reason: "Ingen aktivt bud å avslå.", merits: base, market };
  const offers = { ...market.offers };
  delete offers[id];
  const closeKey = `${offer.windowKey}:${id}`;
  const history = [...market.history, { ...offer, type: "rejected" }].slice(-40);
  const next = { ...market, offers, closedOfferKeys: ids([...market.closedOfferKeys, closeKey]), history };
  return { changed: true, reason: `Budet fra ${offer.bidderClubName} er avslått.`, offer, market: next, merits: { ...base, transferMarket: next } };
}

export function acceptTransferOfferInMerits(merits, playerId, season) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const window = transferWindowForSeason(season);
  if (!window.open) return { changed: false, reason: "Bud kan bare godtas mens HGFM-vinduet er åpent.", merits: base };
  const market = normalizeTransferMarket(base.transferMarket, season);
  const offer = market.offers[id];
  if (!offer || offer.windowKey !== window.key) return { changed: false, reason: "Ingen gyldig bud å godta.", merits: base, market };
  const sale = completeRecruitmentSaleInMerits(base, id, offer.amount, {
    tierId: season?.tier?.id || season?.competition?.tierId,
    seasonNumber: season?.seasonNumber
  });
  if (!sale.changed) return { changed: false, reason: sale.reason, merits: base, market };
  const saleMarket = normalizeTransferMarket(sale.merits.transferMarket, season);
  const offers = { ...saleMarket.offers };
  delete offers[id];
  const history = [...saleMarket.history, { ...offer, type: "sold" }].slice(-40);
  const next = {
    ...saleMarket,
    listedPlayerIds: saleMarket.listedPlayerIds.filter((entry) => entry !== id),
    offers,
    closedOfferKeys: ids([...saleMarket.closedOfferKeys, `${offer.windowKey}:${id}`]),
    history
  };
  return {
    changed: true,
    reason: `${offer.bidderClubName} kjøper spilleren for ${offer.amount} HGFM-klubbmidler.`,
    offer,
    market: next,
    merits: { ...sale.merits, transferMarket: next }
  };
}
