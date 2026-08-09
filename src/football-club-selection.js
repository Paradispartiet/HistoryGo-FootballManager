// ============================================================================
// Klubbvalg v2
//
// Du kan lage din egen klubb, eller ta over en etablert klubb med en spillbar,
// dokumentert spillerpool. Klubbvalg og spilleroppdagelse er separate ting:
// klubben bestemmer poolen, mens History Go bestemmer hvor mye av poolen som er
// åpnet gjennom banebesøk.
//
// Tar du over en klubb, arver du:
//   1. IDENTITET — navn, bane, by og nivå.
//   2. TRADISJON — klubbens spillestil blir styrets referanse.
//   3. FORVENTNING — styrets første sesongmål ut fra klubbens standing.
//   4. ET SPILLBARHETSGULV — 15 spillere fra klubbens egen dokumenterte pool
//      dersom hele poolen ikke allerede er åpnet i History Go.
//
// Du arver IKKE en historisk all-star-tropp. De øvrige spillerne i klubbpoolen
// åpnes gjennom History Go. En klubb uten minst 15 dokumenterte tilknytninger
// blir ikke tilbudt som overtakelsesvalg; alternativet ville vært å fylle den
// med spillere som aldri representerte klubben.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random.
// ============================================================================

export const CLUB_SELECTION_VERSION = "historygo-football-manager.club-selection.v2";

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

export function rankClubInTier(club, allClubs) {
  if (!club) return null;
  const peers = allClubs.filter((entry) =>
    entry.tier === club.tier && (!club.group || entry.group === club.group));
  const sorted = [...peers].sort((a, b) => num(b.strength) - num(a.strength) || a.id.localeCompare(b.id));
  const position = sorted.findIndex((entry) => entry.id === club.id) + 1;
  return position > 0 ? { position, of: sorted.length } : null;
}

export function deriveClubExpectation(club, allClubs, tier) {
  const rank = rankClubInTier(club, allClubs);
  if (!rank) return null;
  const { position, of } = rank;
  const canPromote = Boolean(tier?.promotion);
  const promotionPlaces = num(tier?.promotion?.direct, 0) + num(tier?.promotion?.playoff, 0);

  if (!canPromote) {
    if (position <= 2) return { targetPosition: 1, label: "Seriegull", pressure: "høy", description: `${club.name} er en av klubbene i divisjonen som måles mot gullet. Styret godtar ikke en mellomsesong.` };
    if (position <= 5) return { targetPosition: 3, label: "Topp 3", pressure: "høy", description: `${club.name} skal være med i medaljekampen. Styret venter topp 3.` };
    if (position <= Math.ceil(of / 2)) return { targetPosition: Math.ceil(of / 2), label: `Topp ${Math.ceil(of / 2)}`, pressure: "middels", description: `${club.name} hører hjemme i øvre halvdel. Styret venter det samme av deg.` };
    const safe = Math.max(1, of - num(tier?.relegation?.direct, 0) - num(tier?.relegation?.playoff, 0));
    return { targetPosition: safe, label: "Sikker plass", pressure: "lav", description: `${club.name} har ingen tradisjon for topplasseringer. Styret vil først og fremst se klubben trygt over nedrykksstreken.` };
  }

  if (position <= 3 && promotionPlaces > 0) {
    return { targetPosition: Math.max(1, promotionPlaces), label: "Opprykk", pressure: "høy", description: `${club.name} er blant favorittene i divisjonen. Styret venter opprykk, ikke en grei sesong.` };
  }
  if (position <= Math.ceil(of / 2)) {
    return { targetPosition: Math.max(1, promotionPlaces + 2), label: "Med i toppstriden", pressure: "middels", description: `${club.name} skal være i nærheten av opprykksplassene. Styret vil se klubben blande seg inn i toppen.` };
  }
  const safe = Math.max(1, of - num(tier?.relegation?.direct, 0) - num(tier?.relegation?.playoff, 0));
  return { targetPosition: safe, label: "Sikker plass", pressure: "lav", description: `${club.name} er en av de mindre klubbene på nivået. Styret vil se en trygg sesong før de ber om mer.` };
}

export function isClubTakeoverReady(club, minimumPoolSize = 15) {
  if (!club?.id) return false;
  if (club.playerPoolStatus === "pending") return false;
  if (Number.isFinite(Number(club.playerPoolSize))) return Number(club.playerPoolSize) >= minimumPoolSize;
  // Bakoverkompatibilitet for eldre data/test-fixtures uten poolmetadata.
  return true;
}

export function listSelectableClubs({ clubs = [], tiers = [], profiles = {}, minimumPoolSize = 15 } = {}) {
  return tiers
    .slice()
    .sort((a, b) => num(a.level) - num(b.level))
    .map((tier) => ({
      tierId: tier.id,
      tierName: tier.name,
      level: num(tier.level),
      clubs: clubs
        .filter((club) => club.tier === tier.id && isClubTakeoverReady(club, minimumPoolSize))
        .map((club) => {
          const profile = profiles[club.id] || null;
          const expectation = deriveClubExpectation(club, clubs, tier);
          return {
            id: club.id, name: club.name, ground: club.ground, city: club.city,
            tier: club.tier, group: club.group || null, strength: num(club.strength),
            homePlaceId: club.homePlaceId || null,
            playerPoolSize: num(club.playerPoolSize),
            playerPoolStatus: club.playerPoolStatus || null,
            styleName: profile?.styleName || null,
            shortLabel: profile?.shortLabel || null,
            styleBasis: profile?.styleBasis || null,
            era: profile?.era || null,
            expectationLabel: expectation?.label || null,
            expectationPressure: expectation?.pressure || null
          };
        })
        .sort((a, b) => b.strength - a.strength || a.name.localeCompare(b.name, "nb"))
    }))
    .filter((group) => group.clubs.length > 0);
}

export function createManagerClubFromSelection({ club, profile = null, managerName = "" } = {}) {
  if (!club?.id || !isClubTakeoverReady(club)) return null;
  return {
    id: club.id,
    name: club.name,
    ground: club.ground,
    city: club.city || null,
    tier: club.tier,
    ...(club.group ? { group: club.group } : {}),
    strength: num(club.strength, 70),
    form: num(club.form, 55),
    homePlaceId: club.homePlaceId || null,
    playerPoolSize: num(club.playerPoolSize),
    playerPoolStatus: club.playerPoolStatus || null,
    isTakenOver: true,
    managerName: managerName || "",
    inheritedStyleName: profile?.styleName || null,
    inheritedStyleLabel: profile?.shortLabel || null
  };
}

export function createOwnManagerClub({ clubName, saveId, tier, managerName = "" } = {}) {
  const name = String(clubName || "").trim();
  if (!name || !saveId) return null;
  return {
    id: saveId,
    name,
    ground: `${name} stadion`,
    city: null,
    tier: tier?.id || null,
    strength: 75,
    form: 55,
    isTakenOver: false,
    managerName: managerName || "",
    inheritedStyleName: null,
    inheritedStyleLabel: null
  };
}

export function resolveStartTier({ takeoverClub = null, tiers = [], clubs = [] } = {}) {
  const tier = (takeoverClub ? tiers.find((entry) => entry.id === takeoverClub.tier) : null)
    || tiers.find((entry) => num(entry.level) === 1)
    || tiers[0]
    || null;
  if (!tier) return null;
  const pool = clubs.filter((club) => club.tier === tier.id);
  const group = takeoverClub?.group
    || (num(tier.groups, 1) > 1 ? [...new Set(pool.map((club) => club.group))].sort()[0] : null);
  return {
    tier,
    group: group || null,
    opponents: group ? pool.filter((club) => club.group === group) : pool
  };
}

export function describeClubSelection({ club, tier, allClubs = [], profile = null } = {}) {
  if (!club || !tier) return null;
  const expectation = deriveClubExpectation(club, allClubs, tier);
  const rank = rankClubInTier(club, allClubs);
  const poolSize = num(club.playerPoolSize);
  return {
    clubName: club.name,
    tierName: tier.name,
    ground: club.ground,
    styleName: profile?.styleName || null,
    styleDescription: profile?.style || null,
    era: profile?.era || null,
    styleBasis: profile?.styleBasis || null,
    standing: rank ? `${rank.position}. sterkeste klubb av ${rank.of} på nivået` : null,
    expectation,
    playerPoolSize: poolSize,
    playerPoolReady: isClubTakeoverReady(club),
    inherits: [
      `Identitet: ${club.name}, ${club.ground}${club.city ? `, ${club.city}` : ""}.`,
      `Nivå: ${tier.name} — der klubben faktisk står.`,
      profile?.styleName
        ? `Tradisjon: ${profile.styleName}. Styret venter at du spiller klubbens fotball.`
        : "Tradisjon: klubben har ingen nedskrevet spillestil ennå.",
      expectation ? `Styrets krav første sesong: ${expectation.label}.` : null,
      poolSize > 0 ? `Spillerpool: ${poolSize} dokumenterte klubbspillere.` : null
    ].filter(Boolean),
    doesNotInherit: [
      "En ferdig historisk all-star-tropp — uten banebesøk får du bare en balansert grunntropp fra klubbens egen spillerpool.",
      club.homePlaceId
        ? `Resten av klubbpoolen åpnes når du besøker ${club.ground} i History Go.`
        : "Resten av klubbpoolen åpnes når klubben får en History Go-bane og den besøkes."
    ]
  };
}
