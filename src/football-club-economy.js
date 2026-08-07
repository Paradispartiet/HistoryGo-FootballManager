// Kontrakter og klubbøkonomi v1.
//
// Dette er HGFM-saveøkonomi, ikke historiske påstander om virkelige lønninger,
// overgangssummer eller kontraktslengder. Spilltallene er bevisst standardiserte
// og påvirkes ikke av skjult Overall/classHeight. State bor i eksisterende
// hgfm.teamMerits.v1 under `clubEconomy`.

export const CLUB_ECONOMY_VERSION = 1;
export const BASE_SQUAD_WAGE_UNITS = 2;
export const RECRUIT_CONTRACT = Object.freeze({
  wageUnits: 3,
  signingCost: 10,
  renewalCost: 6,
  seasons: 2
});

export const CLUB_ECONOMY_PRESETS = Object.freeze({
  eliteserien: Object.freeze({ openingBalance: 100, wageBudget: 60, seasonGrant: 40 }),
  obosligaen: Object.freeze({ openingBalance: 80, wageBudget: 54, seasonGrant: 30 }),
  andre_divisjon: Object.freeze({ openingBalance: 60, wageBudget: 48, seasonGrant: 24 }),
  default: Object.freeze({ openingBalance: 80, wageBudget: 54, seasonGrant: 30 })
});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function integer(value, fallback = 0) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nonNegative(value, fallback = 0) {
  return Math.max(0, integer(value, fallback));
}

function season(value) {
  return Math.max(1, integer(value, 1));
}

function playerIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id) => typeof id === "string").map((id) => id.trim()))].filter(Boolean)
    : [];
}

export function economyPresetForTier(tierId) {
  return CLUB_ECONOMY_PRESETS[String(tierId || "")] || CLUB_ECONOMY_PRESETS.default;
}

function normalizeContract(playerId, input, fallbackSeason = 1) {
  const source = isObject(input) ? input : {};
  const remaining = Math.max(1, integer(source.remainingSeasons, RECRUIT_CONTRACT.seasons));
  return {
    playerId: String(playerId),
    remainingSeasons: remaining,
    wageUnits: nonNegative(source.wageUnits, RECRUIT_CONTRACT.wageUnits),
    signedSeason: season(source.signedSeason || fallbackSeason),
    source: source.source === "legacy" ? "legacy" : "recruited"
  };
}

function normalizeContracts(value, fallbackSeason = 1) {
  if (!isObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([id]) => String(id).trim())
      .map(([id, contract]) => [String(id), normalizeContract(id, contract, fallbackSeason)])
  );
}

function normalizeLedger(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => isObject(entry) && entry.type)
    .slice(-40)
    .map((entry) => ({
      id: String(entry.id || `${entry.type}-${entry.season || 1}-${entry.playerId || "club"}`),
      type: String(entry.type),
      season: season(entry.season),
      playerId: entry.playerId ? String(entry.playerId) : null,
      amount: integer(entry.amount, 0),
      label: String(entry.label || "")
    }));
}

export function normalizeClubEconomy(input, { tierId = null, seasonNumber = 1 } = {}) {
  const preset = economyPresetForTier(tierId);
  const src = isObject(input) ? input : {};
  const currentSeason = season(seasonNumber);
  return {
    version: CLUB_ECONOMY_VERSION,
    balance: nonNegative(src.balance, preset.openingBalance),
    wageBudget: Math.max(1, nonNegative(src.wageBudget, preset.wageBudget)),
    lastSettledSeason: season(src.lastSettledSeason || currentSeason),
    contracts: normalizeContracts(src.contracts, currentSeason),
    ledger: normalizeLedger(src.ledger)
  };
}

function ledgerEntry(type, seasonNumber, { playerId = null, amount = 0, label = "" } = {}) {
  const currentSeason = season(seasonNumber);
  return {
    id: `${type}-${currentSeason}-${playerId || "club"}-${Math.abs(integer(amount, 0))}`,
    type,
    season: currentSeason,
    playerId: playerId ? String(playerId) : null,
    amount: integer(amount, 0),
    label: String(label || "")
  };
}

function appendLedger(economy, entry) {
  return { ...economy, ledger: [...economy.ledger, entry].slice(-40) };
}

export function initializeClubEconomyInMerits(merits, {
  tierId = null,
  seasonNumber = 1,
  recruitedPlayerIds = null
} = {}) {
  const base = isObject(merits) ? merits : {};
  const currentSeason = season(seasonNumber);
  const hadEconomy = isObject(base.clubEconomy) && Number(base.clubEconomy.version) === CLUB_ECONOMY_VERSION;
  let economy = normalizeClubEconomy(base.clubEconomy, { tierId, seasonNumber: currentSeason });
  const recruited = playerIds(recruitedPlayerIds === null ? base.recruitedPlayerIds : recruitedPlayerIds);
  let changed = !hadEconomy;

  // Spillere som allerede var hentet før økonomi-v1 beholdes uten at gamle saves
  // plutselig belastes. Ved neste fornyelse går de over på standard HGFM-avtale.
  const contracts = { ...economy.contracts };
  recruited.forEach((playerId) => {
    if (contracts[playerId]) return;
    contracts[playerId] = {
      playerId,
      remainingSeasons: RECRUIT_CONTRACT.seasons,
      wageUnits: 0,
      signedSeason: currentSeason,
      source: "legacy"
    };
    changed = true;
  });
  economy = { ...economy, contracts };
  return { changed, economy, merits: { ...base, clubEconomy: economy } };
}

export function summarizeClubEconomy(input, { tierId = null, seasonNumber = 1, baseSquadCount = 0 } = {}) {
  const economy = normalizeClubEconomy(input, { tierId, seasonNumber });
  const baseWages = Math.max(0, integer(baseSquadCount, 0)) * BASE_SQUAD_WAGE_UNITS;
  const contractWages = Object.values(economy.contracts)
    .reduce((sum, contract) => sum + nonNegative(contract.wageUnits, 0), 0);
  const wageUsed = baseWages + contractWages;
  return {
    economy,
    balance: economy.balance,
    wageBudget: economy.wageBudget,
    wageUsed,
    wageAvailable: Math.max(0, economy.wageBudget - wageUsed),
    baseWages,
    contractWages,
    activeContractCount: Object.keys(economy.contracts).length
  };
}

export function canRecruitWithEconomy(input, { tierId = null, seasonNumber = 1, baseSquadCount = 0 } = {}) {
  const summary = summarizeClubEconomy(input, { tierId, seasonNumber, baseSquadCount });
  if (summary.balance < RECRUIT_CONTRACT.signingCost) {
    return { allowed: false, reason: `Du trenger ${RECRUIT_CONTRACT.signingCost} klubbmidler for standardavtalen.`, summary };
  }
  if (summary.wageUsed + RECRUIT_CONTRACT.wageUnits > summary.wageBudget) {
    return { allowed: false, reason: `Lønnsrammen mangler ${RECRUIT_CONTRACT.wageUnits} ledige enheter.`, summary };
  }
  return { allowed: true, reason: "Standard HGFM-avtale kan tilbys.", summary };
}

export function signRecruitmentContractInMerits(merits, playerId, {
  tierId = null,
  seasonNumber = 1,
  baseSquadCount = 0
} = {}) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  if (!id) return { changed: false, reason: "Mangler spiller.", merits: base };
  const initialized = initializeClubEconomyInMerits(base, {
    tierId,
    seasonNumber,
    recruitedPlayerIds: playerIds(base.recruitedPlayerIds).filter((candidateId) => candidateId !== id)
  });
  let economy = initialized.economy;
  if (economy.contracts[id]) return { changed: initialized.changed, reason: "Spilleren har allerede avtale.", merits: initialized.merits, economy };
  const gate = canRecruitWithEconomy(economy, { tierId, seasonNumber, baseSquadCount });
  if (!gate.allowed) return { changed: false, reason: gate.reason, merits: base, economy };

  const currentSeason = season(seasonNumber);
  const contract = {
    playerId: id,
    remainingSeasons: RECRUIT_CONTRACT.seasons,
    wageUnits: RECRUIT_CONTRACT.wageUnits,
    signedSeason: currentSeason,
    source: "recruited"
  };
  economy = {
    ...economy,
    balance: economy.balance - RECRUIT_CONTRACT.signingCost,
    contracts: { ...economy.contracts, [id]: contract }
  };
  economy = appendLedger(economy, ledgerEntry("signing", currentSeason, {
    playerId: id,
    amount: -RECRUIT_CONTRACT.signingCost,
    label: "Standard HGFM-signering"
  }));
  return {
    changed: true,
    reason: "Spilleravtalen er registrert.",
    contract,
    economy,
    merits: { ...base, clubEconomy: economy }
  };
}

export function renewRecruitmentContractInMerits(merits, playerId, {
  tierId = null,
  seasonNumber = 1,
  baseSquadCount = 0
} = {}) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const economy = normalizeClubEconomy(base.clubEconomy, { tierId, seasonNumber });
  const current = economy.contracts[id];
  if (!current) return { changed: false, reason: "Ingen rekrutteringsavtale funnet.", merits: base, economy };
  if (current.remainingSeasons > 1) return { changed: false, reason: "Avtalen har mer enn én sesong igjen.", merits: base, economy };
  if (economy.balance < RECRUIT_CONTRACT.renewalCost) return { changed: false, reason: "Ikke nok klubbmidler til fornyelse.", merits: base, economy };

  const summary = summarizeClubEconomy(economy, { tierId, seasonNumber, baseSquadCount });
  const wageIncrease = Math.max(0, RECRUIT_CONTRACT.wageUnits - current.wageUnits);
  if (summary.wageUsed + wageIncrease > summary.wageBudget) {
    return { changed: false, reason: "Lønnsrammen er for full til å fornye avtalen.", merits: base, economy };
  }

  const contract = {
    ...current,
    remainingSeasons: RECRUIT_CONTRACT.seasons,
    wageUnits: RECRUIT_CONTRACT.wageUnits,
    signedSeason: season(seasonNumber),
    source: "recruited"
  };
  let next = {
    ...economy,
    balance: economy.balance - RECRUIT_CONTRACT.renewalCost,
    contracts: { ...economy.contracts, [id]: contract }
  };
  next = appendLedger(next, ledgerEntry("renewal", seasonNumber, {
    playerId: id,
    amount: -RECRUIT_CONTRACT.renewalCost,
    label: "Fornyet HGFM-avtale"
  }));
  return { changed: true, reason: "Avtalen er fornyet i to sesonger.", contract, economy: next, merits: { ...base, clubEconomy: next } };
}

export function releaseRecruitmentContractInMerits(merits, playerId, { tierId = null, seasonNumber = 1 } = {}) {
  const base = isObject(merits) ? merits : {};
  const id = String(playerId || "").trim();
  const economy = normalizeClubEconomy(base.clubEconomy, { tierId, seasonNumber });
  if (!economy.contracts[id]) return { changed: false, reason: "Ingen avtale å avslutte.", merits: base, economy };
  const contracts = { ...economy.contracts };
  delete contracts[id];
  let next = { ...economy, contracts };
  next = appendLedger(next, ledgerEntry("release", seasonNumber, { playerId: id, label: "Spilleren frigitt" }));
  return {
    changed: true,
    reason: "Spilleren er frigitt og lønnsrommet er tilgjengelig igjen.",
    economy: next,
    merits: {
      ...base,
      recruitedPlayerIds: playerIds(base.recruitedPlayerIds).filter((candidateId) => candidateId !== id),
      clubEconomy: next
    }
  };
}

export function settleClubEconomySeasonInMerits(merits, targetSeasonNumber, {
  tierId = null
} = {}) {
  const base = isObject(merits) ? merits : {};
  const targetSeason = season(targetSeasonNumber);
  const initialized = initializeClubEconomyInMerits(base, { tierId, seasonNumber: targetSeason });
  let economy = initialized.economy;
  const fromSeason = economy.lastSettledSeason;
  if (targetSeason <= fromSeason) return { changed: initialized.changed, expiredPlayerIds: [], economy, merits: initialized.merits };

  const preset = economyPresetForTier(tierId);
  const contracts = { ...economy.contracts };
  const expired = new Set();
  let balance = economy.balance;
  let ledger = [...economy.ledger];

  for (let currentSeason = fromSeason + 1; currentSeason <= targetSeason; currentSeason += 1) {
    balance += preset.seasonGrant;
    ledger.push(ledgerEntry("season_grant", currentSeason, {
      amount: preset.seasonGrant,
      label: "Ny HGFM-sesongramme"
    }));
    Object.entries({ ...contracts }).forEach(([playerId, contract]) => {
      const remaining = contract.remainingSeasons - 1;
      if (remaining <= 0) {
        delete contracts[playerId];
        expired.add(playerId);
        ledger.push(ledgerEntry("contract_expired", currentSeason, { playerId, label: "Avtalen løp ut" }));
      } else {
        contracts[playerId] = { ...contract, remainingSeasons: remaining };
      }
    });
  }

  economy = {
    ...economy,
    balance,
    lastSettledSeason: targetSeason,
    contracts,
    ledger: ledger.slice(-40)
  };
  const expiredPlayerIds = [...expired];
  return {
    changed: true,
    expiredPlayerIds,
    economy,
    merits: {
      ...base,
      recruitedPlayerIds: playerIds(base.recruitedPlayerIds).filter((id) => !expired.has(id)),
      clubEconomy: economy
    }
  };
}
