// ============================================================================
// Klubbvalg v1
//
// Du kan lage din egen klubb, eller ta over en som finnes. Begge deler er
// ligaspill — forskjellen er hva du arver.
//
// Tar du over en klubb, arver du TRE ting, og ingen av dem er spillere:
//
//   1. IDENTITET — navn, bane, by, og hvilket nivå klubben faktisk står på.
//      Tar du over Skeid, begynner du i 2. divisjon. Det er ikke en straff,
//      det er hvor klubben er.
//   2. TRADISJON — klubbens egen spillestil blir DIN. Rosenborg-styret vil se
//      godfoten, ikke langball. Det gir sesongdommen noe å måle utover tabellen.
//   3. FORVENTNING — og det er her det koster. Styret i en storklubb godtar
//      ikke midt på tabellen første sesong slik en nyopprettet klubbs styre
//      gjør. Forventningen kommer fra klubbens STANDING i sin egen divisjon,
//      ikke fra spillerne dine.
//
// Troppen arver du IKKE. Spillerne kommer fortsatt fra samlingen din — det er
// hele kjernesløyfen (Sted → Person → Ekspertise → Trening → Badge → Lagklasse),
// og en ferdig tropp ville omgått den. Å arve klubbens alltid-tropp er en egen,
// mye større datajobb.
//
// Merk hva forventningen IKKE er: den avgjør ingen kamp. Den setter bare hva
// styret måler deg mot. Klubbens klasse endrer aldri hvordan en spiller gjør
// det på banen — det er fortsatt rollen, posisjonen, taktikken og relasjonene.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random.
// ============================================================================

export const CLUB_SELECTION_VERSION = "historygo-football-manager.club-selection.v1";

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

// Klubbens plass i sitt eget selskap. Rangeringen er innenfor divisjonen (og
// avdelingen), ikke på tvers av pyramiden — Skeid måles mot 2. divisjon, ikke
// mot Bodø/Glimt.
export function rankClubInTier(club, allClubs) {
  if (!club) return null;
  const peers = allClubs.filter((entry) =>
    entry.tier === club.tier && (!club.group || entry.group === club.group));
  const sorted = [...peers].sort((a, b) => num(b.strength) - num(a.strength) || a.id.localeCompare(b.id));
  const position = sorted.findIndex((entry) => entry.id === club.id) + 1;
  return position > 0 ? { position, of: sorted.length } : null;
}

// Styrets forventning FØRSTE sesong, avledet av hvor klubben står. En
// nyopprettet klubb har ingen historie og får det tålmodige målet (midt på
// tabellen); en klubb du tar over har det ikke like lett.
export function deriveClubExpectation(club, allClubs, tier) {
  const rank = rankClubInTier(club, allClubs);
  if (!rank) return null;
  const { position, of } = rank;
  const canPromote = Boolean(tier?.promotion);
  const promotionPlaces = num(tier?.promotion?.direct, 0) + num(tier?.promotion?.playoff, 0);

  // Toppklubbene i en divisjon som IKKE kan rykke opp, måles mot gullet.
  if (!canPromote) {
    if (position <= 2) return { targetPosition: 1, label: "Seriegull", pressure: "høy", description: `${club.name} er en av klubbene i divisjonen som måles mot gullet. Styret godtar ikke en mellomsesong.` };
    if (position <= 5) return { targetPosition: 3, label: "Topp 3", pressure: "høy", description: `${club.name} skal være med i medaljekampen. Styret venter topp 3.` };
    if (position <= Math.ceil(of / 2)) return { targetPosition: Math.ceil(of / 2), label: `Topp ${Math.ceil(of / 2)}`, pressure: "middels", description: `${club.name} hører hjemme i øvre halvdel. Styret venter det samme av deg.` };
    const safe = Math.max(1, of - num(tier?.relegation?.direct, 0) - num(tier?.relegation?.playoff, 0));
    return { targetPosition: safe, label: "Sikker plass", pressure: "lav", description: `${club.name} har ingen tradisjon for topplasseringer. Styret vil først og fremst se klubben trygt over nedrykksstreken.` };
  }

  // I divisjonene under er opprykk det klubbene måles mot.
  if (position <= 3 && promotionPlaces > 0) {
    return { targetPosition: Math.max(1, promotionPlaces), label: "Opprykk", pressure: "høy", description: `${club.name} er blant favorittene i divisjonen. Styret venter opprykk, ikke en grei sesong.` };
  }
  if (position <= Math.ceil(of / 2)) {
    return { targetPosition: Math.max(1, promotionPlaces + 2), label: "Med i toppstriden", pressure: "middels", description: `${club.name} skal være i nærheten av opprykksplassene. Styret vil se klubben blande seg inn i toppen.` };
  }
  const safe = Math.max(1, of - num(tier?.relegation?.direct, 0) - num(tier?.relegation?.playoff, 0));
  return { targetPosition: safe, label: "Sikker plass", pressure: "lav", description: `${club.name} er en av de mindre klubbene på nivået. Styret vil se en trygg sesong før de ber om mer.` };
}

// Klubblista til onboardingen, gruppert etter nivå. Stilen kommer fra profilen,
// nivået fra klubben — samme skille som ellers.
export function listSelectableClubs({ clubs = [], tiers = [], profiles = {} } = {}) {
  return tiers
    .slice()
    .sort((a, b) => num(a.level) - num(b.level))
    .map((tier) => ({
      tierId: tier.id,
      tierName: tier.name,
      level: num(tier.level),
      clubs: clubs
        .filter((club) => club.tier === tier.id)
        .map((club) => {
          const profile = profiles[club.id] || null;
          const expectation = deriveClubExpectation(club, clubs, tier);
          return {
            id: club.id, name: club.name, ground: club.ground, city: club.city,
            tier: club.tier, group: club.group || null, strength: num(club.strength),
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

// Klubben du faktisk spiller som. `saveId` holdes utenfor: lagringen er
// managerens, ikke klubbens, så to karrierer i samme klubb ikke kolliderer.
export function createManagerClubFromSelection({ club, profile = null, managerName = "" } = {}) {
  if (!club?.id) return null;
  return {
    id: club.id,
    name: club.name,
    ground: club.ground,
    city: club.city || null,
    tier: club.tier,
    ...(club.group ? { group: club.group } : {}),
    strength: num(club.strength, 70),
    form: num(club.form, 55),
    isTakenOver: true,
    managerName: managerName || "",
    // Klubbens egen tradisjon blir managerens utgangspunkt — ikke et kostyme,
    // men det styret forventer at du spiller.
    inheritedStyleName: profile?.styleName || null,
    inheritedStyleLabel: profile?.shortLabel || null
  };
}

// En egenopprettet klubb: ingen historie, ingen arvet stil, tålmodig styre.
// Nivået er toppen av det du kan velge selv — du starter der spillet starter.
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

// Nivået sesongen skal starte på, og motstanderne der.
//
// Dette lå i app.js, der det bare kunne sjekkes ved å lete etter et funksjonsnavn
// i kildekoden — og en slik vakt består selv om nivået ignoreres. Her kan den
// faktiske oppførselen måles: tar du over Skeid, SKAL du havne i 2. divisjon
// avdeling 2, ikke i Eliteserien.
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

// Lesbar oppsummering av hva et klubbvalg innebærer — brukt i onboardingen, så
// spilleren vet hva han får FØR han velger. Særlig: han arver ikke troppen.
export function describeClubSelection({ club, tier, allClubs = [], profile = null } = {}) {
  if (!club || !tier) return null;
  const expectation = deriveClubExpectation(club, allClubs, tier);
  const rank = rankClubInTier(club, allClubs);
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
    inherits: [
      `Identitet: ${club.name}, ${club.ground}${club.city ? `, ${club.city}` : ""}.`,
      `Nivå: ${tier.name} — der klubben faktisk står.`,
      profile?.styleName
        ? `Tradisjon: ${profile.styleName}. Styret venter at du spiller klubbens fotball.`
        : "Tradisjon: klubben har ingen nedskrevet spillestil ennå.",
      expectation ? `Styrets krav første sesong: ${expectation.label}.` : null
    ].filter(Boolean),
    // Det viktigste å si tydelig: troppen følger ikke med.
    doesNotInherit: [
      "Troppen — spillerne kommer fortsatt fra samlingen din. Klubbvalget gir deg en klubb, ikke et lag.",
      "Klubbens historiske spillere. Det er en egen sak."
    ]
  };
}
