// ============================================================================
// Klubbtradisjon v1 — spilte du klubbens fotball?
//
// Klubbvalget lovet noe spillet ikke holdt. Tar du over Rosenborg, sier
// onboardingen «Tradisjon: Godfoten. Styret venter at du spiller klubbens
// fotball» — og så leste ingenting det. `inheritedStyleName` ble satt og aldri
// brukt. Samme klasse som resten: ingen feilmelding, bare et løfte uten dekning.
//
// Her måles det. Både klubbens tradisjon og hver formasjon er allerede beskrevet
// på DE SAMME ni aksene (`parameterProfile` i data/hgFootball/formationKnowledge
// .json: pressHeight, defensiveLine, width, possession, tempo, transition,
// restDefence, pressingScheme, risk). Klubbens akser utledes av `styleTraits`
// og `matchupStyles` som allerede finnes — ingenting nytt er funnet på.
//
// Hva dette IKKE er: en ny rating, og aldri noe som avgjør en kamp. Det er en
// STYREDOM, på linje med sesongdommen — den forteller manageren om han spilte
// klubben han overtok, og hvert avvik peker på en managerbeslutning (formasjon
// og kampplan), aldri på en spillersvakhet. En spiller blir ikke dårligere av at
// treneren valgte feil system for klubbens tradisjon; treneren gjorde det.
//
// Terskelverdiene er TERSILER regnet ut av korpuset som sendes inn, ikke
// hardkodede tall. Grunnen står i CLAUDE.md: aksene har vidt forskjellige
// spenn (pressIntensity 25–82, intensity 52–85), så én fast grense ville dyttet
// noen akser helt over i én bøtte og gjort dem meningsløse.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random.
// ============================================================================

export const CLUB_TRADITION_VERSION = "historygo-football-manager.club-tradition.v1";

// De ni aksene, med vokabularet fra formationKnowledge. Rekkefølgen i hver
// liste er ordinal — det er den avstanden sammenligningen måler.
export const PARAMETER_AXES = Object.freeze({
  pressHeight: ["low", "medium", "high"],
  defensiveLine: ["deep", "medium", "high"],
  width: ["narrow", "balanced", "wide"],
  possession: ["direct", "balanced", "patient"],
  tempo: ["low", "medium", "high"],
  transition: ["low", "medium", "high"],
  restDefence: ["weak", "medium", "strong"],
  pressingScheme: ["zonal", "mixed", "man_oriented"],
  risk: ["low", "medium", "high"]
});

// Hvilken styleTrait som bærer hvilken akse. Sju av ni kommer fra tall; width og
// pressingScheme kommer fra matchupStyles (de sier det tallene ikke gjør), og
// risk står allerede i profilen på samme vokabular.
const TRAIT_FOR_AXIS = Object.freeze({
  pressHeight: "pressIntensity",
  defensiveLine: "highLine",
  possession: "possessionControl",
  tempo: "intensity",
  transition: "transitionThreat",
  restDefence: "defensiveCompactness"
});

const AXIS_LABELS = Object.freeze({
  pressHeight: "presshøyde",
  defensiveLine: "forsvarslinje",
  width: "bredde",
  possession: "ballbesittelse",
  tempo: "tempo",
  transition: "omstilling",
  restDefence: "restforsvar",
  pressingScheme: "pressform",
  risk: "risiko"
});

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

// Tersilgrensene for én trait, regnet ut av korpuset. Returnerer [lav, høy]:
// under lav = nederste bøtte, over høy = øverste.
function tercilesFor(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  if (sorted.length < 3) return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
  return [sorted[Math.floor((sorted.length - 1) / 3)], sorted[Math.floor(((sorted.length - 1) * 2) / 3)]];
}

export function buildTraditionThresholds(profiles = []) {
  const thresholds = {};
  for (const [axis, trait] of Object.entries(TRAIT_FOR_AXIS)) {
    thresholds[axis] = tercilesFor(profiles.map((profile) => num(profile?.styleTraits?.[trait])));
  }
  return thresholds;
}

function bucket(value, [low, high], scale) {
  if (value <= low) return scale[0];
  if (value >= high) return scale[2];
  return scale[1];
}

// Klubbens tradisjon uttrykt på de samme ni aksene som formasjonene.
export function deriveClubParameterProfile(profile, thresholds) {
  if (!profile) return null;
  const tokens = Array.isArray(profile.matchupStyles) ? profile.matchupStyles : [];
  const axes = {};

  for (const [axis, trait] of Object.entries(TRAIT_FOR_AXIS)) {
    axes[axis] = bucket(num(profile.styleTraits?.[trait]), thresholds[axis], PARAMETER_AXES[axis]);
  }

  // Bredde og pressform står ikke i tallene — de står i spillestil-tokenene.
  axes.width = tokens.includes("wide_overload") || tokens.includes("switching_play") ? "wide"
    : tokens.includes("narrow_442") || tokens.includes("compact_532") || tokens.includes("deep_low_block") ? "narrow"
      : "balanced";
  axes.pressingScheme = tokens.includes("aggressive_man_press") || tokens.includes("two_striker_press") ? "man_oriented"
    : tokens.includes("passive_mid_block") || tokens.includes("deep_low_block") ? "zonal"
      : "mixed";
  // Risiko står allerede i profilen, på samme vokabular.
  axes.risk = PARAMETER_AXES.risk.includes(profile.riskLevel) ? profile.riskLevel : "medium";

  return axes;
}

// Sammenlign klubbens tradisjon med systemet manageren faktisk valgte.
// Treff = 2 poeng, nabo = 1, motsatt ende = 0. Alignment er prosent av mulig.
export function compareTraditionToSetup({ traditionProfile = null, formationProfile = null } = {}) {
  if (!traditionProfile || !formationProfile) return null;

  const matched = [];
  const drifted = [];
  let points = 0;
  let possible = 0;

  for (const [axis, scale] of Object.entries(PARAMETER_AXES)) {
    const wanted = traditionProfile[axis];
    const actual = formationProfile[axis];
    if (!scale.includes(wanted) || !scale.includes(actual)) continue;
    possible += 2;
    const distance = Math.abs(scale.indexOf(wanted) - scale.indexOf(actual));
    points += Math.max(0, 2 - distance);
    const entry = { axis, label: AXIS_LABELS[axis], wanted, actual, distance };
    if (distance === 0) matched.push(entry);
    else if (distance >= 1) drifted.push(entry);
  }

  if (possible === 0) return null;
  const alignment = Math.round((points / possible) * 100);
  drifted.sort((a, b) => b.distance - a.distance || a.axis.localeCompare(b.axis));

  return { alignment, matched, drifted, axesCompared: possible / 2 };
}

const VERDICTS = [
  { min: 85, id: "klubbens_fotball", label: "Klubbens fotball" },
  { min: 60, id: "gjenkjennelig", label: "Gjenkjennelig" },
  { min: 30, id: "ditt_eget", label: "Ditt eget prosjekt" },
  { min: 0, id: "fremmed", label: "Fremmed for klubben" }
];

// Hvor godt KAN denne klubbens tradisjon treffes med systemene som finnes?
// Uten dette måles manageren mot 100 % — og det er urimelig: målt over de 46
// formasjonene kunne 44 av 60 klubber ALDRI nå toppdommen uansett hva
// manageren valgte. En dom som ikke kan oppnås er ingen dom.
export function achievableTraditionRange(traditionProfile, formationProfiles = []) {
  const scores = formationProfiles
    .map((profile) => compareTraditionToSetup({ traditionProfile, formationProfile: profile }))
    .filter(Boolean)
    .map((comparison) => comparison.alignment);
  if (scores.length === 0) return null;
  return { best: Math.max(...scores), worst: Math.min(...scores), count: scores.length };
}

// Styrets dom over om du spilte klubben du overtok. Hver linje peker på en
// MANAGERBESLUTNING — formasjon og kampplan — aldri på spillerne.
export function judgeClubTradition({ clubProfile = null, formationProfile = null, formationName = "", thresholds = null, profiles = [], formationProfiles = [] } = {}) {
  if (!clubProfile || !formationProfile) return null;
  const limits = thresholds || buildTraditionThresholds(profiles.length ? profiles : [clubProfile]);
  const traditionProfile = deriveClubParameterProfile(clubProfile, limits);
  const comparison = compareTraditionToSetup({ traditionProfile, formationProfile });
  if (!comparison) return null;

  // Dommen måles mot det som FAKTISK er oppnåelig for klubben, ikke mot 100 %.
  // Manageren skal dømmes på valget sitt, ikke på at formasjonsbiblioteket ikke
  // inneholder en perfekt kopi av klubbens tradisjon.
  const range = achievableTraditionRange(traditionProfile, formationProfiles);
  const relative = range && range.best > range.worst
    ? Math.round(((comparison.alignment - range.worst) / (range.best - range.worst)) * 100)
    : comparison.alignment;
  const verdict = VERDICTS.find((entry) => relative >= entry.min) || VERDICTS[VERDICTS.length - 1];
  const styleName = clubProfile.styleName || "klubbens stil";

  const system = formationName || "systemet ditt";
  const driftLines = comparison.drifted.slice(0, 3).map((entry) =>
    `${entry.label}: klubben spiller «${entry.wanted}», ${system} gir «${entry.actual}». Det er et systemvalg, ikke en spillersvakhet.`);

  // På toppdommen skal linja ikke lede med en klage. Er avviket det minste som
  // finnes i formasjonsbiblioteket, er det ikke manageren som har valgt feil.
  const reasons = verdict.id === "klubbens_fotball"
    ? [
      comparison.drifted.length === 0
        ? `${system} treffer klubbens tradisjon på alle ${comparison.axesCompared} akser.`
        : `${system} treffer klubbens tradisjon på ${comparison.matched.length} av ${comparison.axesCompared} akser — det nærmeste systemet biblioteket har for denne klubben.`,
      ...driftLines.slice(0, 1)
    ]
    : driftLines.length
      ? driftLines
      : [`${system} treffer klubbens tradisjon på alle ${comparison.axesCompared} akser.`];

  const headline = verdict.id === "klubbens_fotball"
    ? `Styret ser ${styleName} på banen.`
    : verdict.id === "gjenkjennelig"
      ? `Styret kjenner igjen ${styleName}, men ikke helt.`
      : verdict.id === "ditt_eget"
        ? `Dette er ditt prosjekt, ikke ${styleName}.`
        : `Styret ansatte deg for å spille ${styleName}. Det gjør du ikke.`;

  return {
    version: CLUB_TRADITION_VERSION,
    alignment: comparison.alignment,
    // `relativeAlignment` er den dommen hviler på: 100 betyr «du valgte det
    // beste systemet klubben faktisk kan spilles med», ikke «perfekt kopi».
    relativeAlignment: relative,
    achievable: range,
    verdict: verdict.id,
    verdictLabel: verdict.label,
    styleName,
    headline,
    reasons,
    matched: comparison.matched,
    drifted: comparison.drifted,
    traditionProfile,
    // Sagt eksplisitt fordi det er hele poenget: dommen rører ingen kamp.
    affectsMatchOutcome: false
  };
}
