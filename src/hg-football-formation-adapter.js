// HG Football Manager — Formation Adapter (v1)
//
// Oversetter historiske hgFootball-formasjoner (data/hgFootball/formations.json)
// til det formatet den eksisterende taktikktavla i src/app.js forventer
// (formation.slots med slotId/label/position/line + standardkoordinater).
//
// Designprinsipper:
//   - Ingen formasjonsliste hardkodes her. Alt utledes fra baseShape-tallene.
//   - Ingen koordinater skrives inn i data/hgFootball/*. Shape -> slot-koordinat
//     er ren visningslogikk og bor i denne adapteren/runtime.
//   - Modulen er ren (ingen DOM, ingen fetch). app.js gjør all lasting.
//   - Adapteren beholder alle taktiske felt fra hgFootball-formasjonen slik at
//     Managerkontoret kan vise epoke, skole, faser, nøkkelroller m.m.
//
// Koordinatprinsipp (samme som LINE_Y i app.js): y = 0 % er angrep/topp og
// 100 % er keeper/bunn. Keeper ligger nederst, utespillerlinjene fordeles jevnt
// mellom angrep (24 %) og forsvar (72 %).

// Vertikale bånd. Speiler LINE_Y i app.js (keeper 90, forsvar 72, angrep 24).
const KEEPER_Y = 90;
const DEF_Y = 72;
const ATT_Y = 24;
const MID_Y = 48;

// Utvidet bånd for formasjoner med mange linjer (se lineY): forsvaret trekkes
// litt lenger bak, angrepet litt lenger fram, og keeperen følger med.
// 92, ikke 94: på 94 stakk keeperbrikka nedenfor sidelinja.
const DEEP_KEEPER_Y = 92;
const DEEP_DEF_Y = 78;
const HIGH_ATT_Y = 16;

// Horisontal spredning per linje. Ytterkantene er forbeholdt spillere som
// FAKTISK spiller bredt (back, vingback, kant).
const SPREAD_MIN = 14;
const SPREAD_RANGE = 72;

// Sentrale linjer skal ikke strekkes ut til sidelinja. En naiv «fordel jevnt
// over hele bredden» plasserte spissparet i 4-4-2 på 14 % og 86 % – ute på
// vingen, der ingen spiss står. Sentrale linjer får derfor et fast steg rundt
// midten: to spisser havner på 39/61, en midtbanetrio på 28/50/72.
const CENTRAL_STEP = 22;
const WIDE_POSITIONS = new Set(["LB", "RB", "WB", "LW", "RW"]);

// Er dette en bred linje? Ja hvis minst én spiller på linja spiller bredt.
export function isWideLine(positions) {
  return (Array.isArray(positions) ? positions : []).some((position) => WIDE_POSITIONS.has(position));
}

// x-koordinater (i prosent) for én linje, gitt posisjonene på den.
// Bred linje: full bredde (14 → 86). Sentral linje: sentrert rundt 50.
export function lineXPositions(positions) {
  const list = Array.isArray(positions) ? positions : [];
  const count = list.length;
  if (count === 0) return [];
  if (count === 1) return [50];

  if (isWideLine(list)) {
    return list.map((_, index) => round1(SPREAD_MIN + (SPREAD_RANGE * index) / (count - 1)));
  }

  // Sentrert, men aldri bredere enn ytterkantene.
  const span = Math.min(CENTRAL_STEP * (count - 1), SPREAD_RANGE);
  const start = 50 - span / 2;
  return list.map((_, index) => round1(start + (span * index) / (count - 1)));
}

// Norske visningsetiketter per posisjon.
const POSITION_LABELS = {
  GK: "Keeper",
  CB: "Stopper",
  LB: "Venstreback",
  RB: "Høyreback",
  WB: "Vingback",
  DM: "Defensiv midt",
  CM: "Sentral midt",
  AM: "Offensiv midt",
  LW: "Venstrekant",
  RW: "Høyrekant",
  ST: "Spiss"
};

// Sentrale posisjoner som får venstre/sentral/høyre-kvalifikator når en linje
// har flere like spillere (gir lesbare slot-titler uten å påvirke logikk).
const CENTRAL_NAMES = {
  CB: "stopper",
  DM: "defensiv midt",
  CM: "sentral midt",
  AM: "offensiv midt",
  ST: "spiss"
};

// Sentral standardposisjon per taktisk bånd.
const BAND_CENTRAL = { DEF: "CB", DM: "DM", CM: "CM", AM: "AM", ATT: "ST" };

// Bånd -> legacy linjenavn (brukes som data-line på spillerbrikken / CSS-kroker).
const BAND_LINE = { DEF: "defense", DM: "midfield", CM: "midfield", AM: "midfield", ATT: "attack" };

function round1(value) {
  return Math.round(value * 10) / 10;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Tolker et formasjonstall som "1-1-8", "2-3-5", "3-2-2-3", "4-1-2-1-2" til en
// liste med spillere per linje, bakerst først. Returnerer null ved ugyldig input.
export function parseShape(shape) {
  if (typeof shape !== "string") {
    return null;
  }

  const parts = shape
    .trim()
    .split(/[-–]/)
    .map((part) => Number.parseInt(part.trim(), 10));

  if (!parts.length || parts.some((value) => !Number.isInteger(value) || value < 0)) {
    return null;
  }

  return parts;
}

// Avgjør om en ledende "1" i grunnformen er en libero/sweeper (catenaccio/verrou/
// treback-tradisjon) og ikke bare en enkelt back i tidlig rush-fotball. En libero
// tolkes som en egen dyp forsvarslinje foran keeperen, slik at 1-3-3-3 blir
// GK + libero + 3 + 3 + 3 og 1-4-3-2 blir GK + libero + 4 + 3 + 2.
export function detectLiberoLead(hgFormation) {
  const counts = parseShape(hgFormation?.baseShape);

  if (!counts || counts.length < 3 || counts[0] !== 1) {
    return false;
  }

  const second = counts[1] || 0;
  const haystack = [
    hgFormation.eraId,
    hgFormation.tacticalSchool,
    hgFormation.name,
    ...(Array.isArray(hgFormation.commonNames) ? hgFormation.commonNames : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const liberoContext = /libero|catenaccio|verrou|sweeper|back.three|back_three|treback/.test(haystack);
  const earlyContext = /early|rush|pre-modern|premodern|pyramid/.test(haystack);

  // En libero gir mening når den ledende eneren etterfølges av en ekte
  // forsvarsrekke (>= 3) i en libero-/catenaccio-kontekst, ikke i rush-fotball.
  return second >= 3 && liberoContext && !earlyContext;
}

// Vertikal posisjon (y %) for en utespillerlinje, gitt linjeindeks (0 = bakerst)
// og totalt antall utespillerlinjer. Følger LINE_Y-prinsippet: bakerst nær
// forsvar (72 %), forrest nær angrep (24 %), jevnt fordelt imellom.
function lineY(lineIndex, lineCount) {
  if (lineCount <= 1) {
    return MID_Y;
  }

  // Mange linjer (diamant, 2-3-2-3, WM-varianter) skal ikke klemmes inn i det
  // samme båndet som en 4-4-2 bruker på tre — da havnet radene så tett at
  // brikkene la seg oppå hverandre. Fra fire linjer og oppover tar vi i bruk
  // mer av banens dybde i stedet for å krympe brikkene til uleselighet.
  const stretch = Math.max(0, Math.min(1, (lineCount - 3) / 2));
  const defY = DEF_Y + (DEEP_DEF_Y - DEF_Y) * stretch;
  const attY = ATT_Y + (HIGH_ATT_Y - ATT_Y) * stretch;

  return defY - ((defY - attY) * lineIndex) / (lineCount - 1);
}

// Keeperen følger med når forsvarslinja trekkes bakover, slik at avstanden
// keeper–forsvar holder seg.
export function keeperY(lineCount) {
  const stretch = Math.max(0, Math.min(1, (lineCount - 3) / 2));
  return round1(KEEPER_Y + (DEEP_KEEPER_Y - KEEPER_Y) * stretch);
}

// Tildeler et taktisk bånd (DEF/DM/CM/AM/ATT) til hver utespillerlinje. Bakerste
// linje er forsvar, forreste er angrep, og midtlinjene fordeles på dybde. Ved
// libero er de to bakerste linjene begge forsvar (libero + forsvarsrekke).
function assignBands(counts, liberoLead) {
  const lineCount = counts.length;
  const bands = new Array(lineCount).fill("CM");

  if (lineCount === 0) {
    return bands;
  }

  if (lineCount === 1) {
    bands[0] = "ATT";
    return bands;
  }

  bands[0] = "DEF";
  bands[lineCount - 1] = "ATT";

  // Midtlinjenes indeksområde. Ved libero er linje 1 også forsvar.
  let firstMid = 1;
  if (liberoLead && lineCount >= 3) {
    bands[1] = "DEF";
    firstMid = 2;
  }

  const midIndices = [];
  for (let i = firstMid; i <= lineCount - 2; i += 1) {
    midIndices.push(i);
  }

  const middleCount = midIndices.length;
  midIndices.forEach((lineIndex, order) => {
    let band = "CM";
    if (middleCount === 2) {
      band = order === 0 ? "DM" : "AM";
    } else if (middleCount >= 3) {
      if (order === 0) band = "DM";
      else if (order === middleCount - 1) band = "AM";
      else band = "CM";
    }
    bands[lineIndex] = band;
  });

  return bands;
}

// Posisjoner (GK/CB/.../ST) for én linje, gitt bånd og antall. Brede ytterkanter
// får full-/vingback eller kant, sentrale spillere får båndets standardposisjon.
function linePositions(band, count, { liberoLine = false } = {}) {
  if (liberoLine) {
    return ["CB"];
  }

  const central = BAND_CENTRAL[band] || "CM";

  if (count <= 1) {
    return [central];
  }

  const positions = new Array(count).fill(central);

  if (band === "DEF") {
    if (count === 4) {
      positions[0] = "LB";
      positions[count - 1] = "RB";
    } else if (count >= 5) {
      positions[0] = "WB";
      positions[count - 1] = "WB";
    }
  } else if (band === "ATT") {
    if (count >= 3) {
      positions[0] = "LW";
      positions[count - 1] = "RW";
    }
  } else if (count >= 4) {
    // Brede midtbanelinjer (4-4-2-aktige) får kanter ute.
    positions[0] = "LW";
    positions[count - 1] = "RW";
  }

  return positions;
}

function slotLabel(position, index, count, isLibero) {
  if (isLibero) {
    return "Libero";
  }

  const central = CENTRAL_NAMES[position];
  if (central && count > 1) {
    let qualifier = "";
    if (count === 2) {
      qualifier = index === 0 ? "Venstre " : "Høyre ";
    } else if (index === 0) {
      qualifier = "Venstre ";
    } else if (index === count - 1) {
      qualifier = "Høyre ";
    } else {
      qualifier = "Sentral ";
    }
    return capitalize(`${qualifier}${central}`.trim());
  }

  return POSITION_LABELS[position] || position;
}

// Bygger 11 slots (keeper + 10 utespillere) fra en grunnform som "2-3-5".
// Hver slot får slotId, label, position (gyldig FOOTBALL_POSITION), line og
// standardkoordinater (x/y i prosent). Returnerer [] ved ugyldig grunnform.
export function buildFormationSlots(baseShape, options = {}) {
  const counts = parseShape(baseShape);

  if (!counts || !counts.length) {
    return [];
  }

  const liberoLead = Boolean(options.liberoLead);
  const lineCount = counts.length;
  const bands = assignBands(counts, liberoLead);

  const slots = [
    { slotId: "gk", label: POSITION_LABELS.GK, position: "GK", line: "keeper", x: 50, y: keeperY(lineCount) }
  ];

  const idCounters = {};
  const makeId = (position) => {
    idCounters[position] = (idCounters[position] || 0) + 1;
    return `${position.toLowerCase()}${idCounters[position]}`;
  };

  counts.forEach((count, lineIndex) => {
    const band = bands[lineIndex];
    const y = lineY(lineIndex, lineCount);
    const isLiberoLine = liberoLead && lineIndex === 0;
    const positions = linePositions(band, count, { liberoLine: isLiberoLine });
    const xs = lineXPositions(positions);

    positions.forEach((position, index) => {
      slots.push({
        slotId: makeId(position),
        label: slotLabel(position, index, count, isLiberoLine),
        position,
        line: BAND_LINE[band] || "midfield",
        x: xs[index],
        y: round1(y)
      });
    });
  });

  return slots;
}

// Mapper hgFootball matchEngineEffects (0-10) til de gamle 0-100-metrikkene som
// finnes i lagfit-motoren. Eksponeres for fremtidig bruk/forklaring; den
// eksisterende calculateTeamFit leser disse fra roller/taktikk, ikke herfra.
export function deriveLegacyMetricsFromEffects(effects) {
  if (!effects || typeof effects !== "object") {
    return null;
  }

  const toScore = (value) => Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 10)));
  const security = effects.restDefenceSecurity ?? effects.defensiveSecurity ?? 0;
  const balance = ((Number(effects.defensiveSecurity) || 0) + (Number(effects.restDefenceSecurity) || 0)) / 2;
  const buildUp = ((Number(effects.centralControl) || 0) + (Number(effects.creativityDemand) || 0)) / 2;

  return {
    widthScore: toScore(effects.attackingWidth),
    pressScore: toScore(effects.pressingIntensity),
    balanceScore: toScore(balance),
    restDefenseScore: toScore(security),
    buildUpScore: toScore(buildUp)
  };
}

// Felt som kopieres uendret fra hgFootball-formasjonen til runtime-formasjonen.
const CARRIED_FIELDS = [
  "baseShape",
  "inPossessionShape",
  "outOfPossessionShape",
  "pressShape",
  "lowBlockShape",
  "restDefenceShape",
  "eraId",
  "period",
  "tacticalSchool",
  "tacticalDifficulty",
  "commonNames",
  "principles",
  "roleRequirements",
  "preferredPlayerTypes",
  "misusedPlayerTypes",
  "strengths",
  "weaknesses",
  "coachingRequirements",
  "matchEngineEffects",
  "historicalExamples",
  "unlockLinks",
  "notes"
];

// Oversetter én hgFootball-formation til runtime-formasjonen taktikktavla bruker.
export function adaptHgFormation(hgFormation, context = {}) {
  if (!hgFormation || typeof hgFormation !== "object") {
    return null;
  }

  const eraIndex = context.eraIndex instanceof Map ? context.eraIndex : new Map();
  const era = eraIndex.get(hgFormation.eraId) || null;
  const liberoLead = detectLiberoLead(hgFormation);
  const slots = buildFormationSlots(hgFormation.baseShape, { liberoLead });

  const eraName = era?.name || "";
  const selectLabel = [hgFormation.name, eraName, hgFormation.tacticalSchool]
    .filter(Boolean)
    .join(" · ");

  const adapted = {
    id: hgFormation.id,
    name: hgFormation.name,
    // Rik etikett til formationSelect: navn · epoke · skole. Dette holder f.eks.
    // historisk "WM 3-2-2-3" og moderne "Box Midfield 3-2-2-3" tydelig adskilt.
    selectLabel,
    slots,
    eraName,
    eraPeriod: era?.period || hgFormation.period || "",
    isLibero: liberoLead,
    legacyMetricsHint: deriveLegacyMetricsFromEffects(hgFormation.matchEngineEffects)
  };

  CARRIED_FIELDS.forEach((field) => {
    if (hgFormation[field] !== undefined) {
      adapted[field] = hgFormation[field];
    }
  });

  return adapted;
}

// Oversetter hele formations.json til runtime-formasjoner. Hopper trygt over
// ugyldige oppføringer i stedet for å kaste.
export function adaptHgFormations(formationsData, erasData) {
  const formations = Array.isArray(formationsData?.formations) ? formationsData.formations : [];
  const eras = Array.isArray(erasData?.eras) ? erasData.eras : [];
  const eraIndex = new Map(eras.map((era) => [era.id, era]));

  return formations
    .map((formation) => adaptHgFormation(formation, { eraIndex }))
    .filter((formation) => formation && Array.isArray(formation.slots) && formation.slots.length > 0);
}

// Bygger et oppslag id -> roleType for visningsnavn (roleTypes.json).
export function buildRoleTypeIndex(roleTypesData) {
  const roleTypes = Array.isArray(roleTypesData?.roleTypes) ? roleTypesData.roleTypes : [];
  return new Map(roleTypes.map((roleType) => [roleType.id, roleType]));
}

// Visningsnavn for en roleType-id. Faller tilbake til id-en hvis navnet mangler.
export function getRoleDisplayName(roleId, roleTypeIndex) {
  if (roleTypeIndex instanceof Map) {
    const roleType = roleTypeIndex.get(roleId);
    if (roleType?.name) {
      return roleType.name;
    }
  }
  return roleId;
}

export function getRoleDisplayNames(roleIds, roleTypeIndex) {
  return (Array.isArray(roleIds) ? roleIds : []).map((id) => getRoleDisplayName(id, roleTypeIndex));
}

// Bro mellom de gamle football_roles-IDene (sidepanelets rollevalg) og de nye
// hgFootball roleTypes-IDene som formasjonene refererer til. Eksakte treff
// matcher direkte; aliasene dekker de tydeligste ekvivalentene. Brukes kun til
// forklarende rollefit-hint – ingen scoreeffekt.
const LEGACY_ROLE_TO_HG = {
  wide_dribbler: ["classic_winger", "dribbler_forward", "outside_forward", "inside_forward"],
  inverted_winger: ["inverted_winger", "inside_forward", "wide_playmaker"],
  linking_striker: ["second_striker", "deep_lying_forward", "withdrawn_centre_forward"],
  false_nine: ["false_nine"],
  channel_runner: ["channel_runner", "poacher"],
  pressing_forward: ["pressing_forward"],
  advanced_forward: ["complete_forward", "poacher", "centre_forward"],
  target_striker: ["target_forward"],
  box_striker: ["poacher"],
  free_creator: ["attacking_midfielder", "classic_ten", "wide_playmaker"],
  classic_ten: ["classic_ten", "attacking_midfielder"],
  deep_playmaker: ["deep_lying_playmaker", "regista"],
  regista: ["regista", "deep_lying_playmaker"],
  balancing_six: ["holding_midfielder", "half_back"],
  holding_midfielder: ["holding_midfielder", "destroyer", "ball_winner"],
  box_to_box: ["box_to_box_midfielder", "mezzala", "advanced_eight"],
  pressing_midfielder: ["ball_winner", "box_to_box_midfielder", "mezzala"],
  overlapping_fullback: ["overlapping_full_back", "wing_back"],
  wingback: ["wing_back", "defensive_wing_back"],
  inverted_fullback: ["inverted_full_back"],
  support_fullback: ["traditional_full_back"],
  ball_playing_centre_back: ["ball_playing_centre_back", "wide_centre_back"],
  libero: ["libero", "libero_classic"],
  duel_centre_back: ["stopper_centre_back", "man_marker"],
  stopper: ["stopper_centre_back", "cover_centre_back"],
  sweeperkeeper: ["sweeper_keeper", "distributor_keeper"],
  line_keeper: ["line_keeper", "shot_stopper"]
};

export function mapLegacyRoleToHgRoleTypes(legacyRoleId) {
  if (typeof legacyRoleId !== "string") {
    return [];
  }
  const aliases = LEGACY_ROLE_TO_HG[legacyRoleId] || [];
  return [...new Set([legacyRoleId, ...aliases])];
}

const NEUTRAL_HINT_TEXT = "Ingen direkte historisk rollefit-regel registrert; bruker vanlig lagfit.";

// Additivt rollefit-hint (historicalFormationRoleHint): sammenligner valgt rolle
// mot den valgte historiske formasjonens roleRequirements/preferredPlayerTypes/
// misusedPlayerTypes. Erstatter ikke lagfit-motoren; gir kun en forklarende
// tekst. Returnerer alltid et objekt { tone, text }, aldri en runtime-feil.
export function getHistoricalFormationRoleHint(formation, legacyRole, roleTypeIndex) {
  if (!formation || !legacyRole) {
    return { tone: "neutral", text: NEUTRAL_HINT_TEXT };
  }

  const hgIds = mapLegacyRoleToHgRoleTypes(legacyRole.id);
  const required = new Set(Array.isArray(formation.roleRequirements) ? formation.roleRequirements : []);
  const preferred = new Set(Array.isArray(formation.preferredPlayerTypes) ? formation.preferredPlayerTypes : []);
  const misused = new Set(Array.isArray(formation.misusedPlayerTypes) ? formation.misusedPlayerTypes : []);

  const requiredMatch = hgIds.find((id) => required.has(id));
  const preferredMatch = hgIds.find((id) => preferred.has(id));
  const misusedMatch = hgIds.find((id) => misused.has(id));

  if (requiredMatch) {
    return {
      tone: "positive",
      text: `Rollen passer systemets nøkkelkrav: ${getRoleDisplayName(requiredMatch, roleTypeIndex)} er sentral i ${formation.name}.`
    };
  }

  if (preferredMatch && !misusedMatch) {
    return {
      tone: "positive",
      text: `Rollen løftes frem i dette systemet: ${formation.name} bruker ${getRoleDisplayName(preferredMatch, roleTypeIndex)} godt.`
    };
  }

  if (misusedMatch) {
    return {
      tone: "warning",
      text: `Dette kan være feilbruk: ${getRoleDisplayName(misusedMatch, roleTypeIndex)} mister ofte effekt i ${formation.name}.`
    };
  }

  if (preferredMatch) {
    return {
      tone: "positive",
      text: `Rollen løftes frem i dette systemet: ${formation.name} bruker ${getRoleDisplayName(preferredMatch, roleTypeIndex)} godt.`
    };
  }

  return { tone: "neutral", text: NEUTRAL_HINT_TEXT };
}
