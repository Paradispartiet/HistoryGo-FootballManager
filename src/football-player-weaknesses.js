// ============================================================================
// Svake sider v1
//
// > Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
//
// Det står ikke i motsetning til at alle spillere har svake sider — det er
// grunnen til at de har noe å si. Haaland var lenge svak med ryggen mot mål.
// Hoftun spilte ikke laget opp bakfra. Maldini var ingen spiss. Det gjorde dem
// ikke dårligere; det gjorde at de måtte brukes RIKTIG.
//
// En svak side er altså ikke en dom over spilleren. Den er svaret på spørsmålet
// «hvorfor koster det noe å bruke ham HER?» — og dermed selve begrunnelsen for
// at posisjon, rolle og taktikk betyr mer enn `overall`.
//
// Tre regler holder dette unna et ratingspill:
//
//   1. En svak side trekker ALDRI fra `overall` eller `matchScore`. Motoren
//      leser dem ikke engang.
//   2. Svakhetene IDENTIFISERES ut av data som allerede finnes — rollens
//      `requires` og posisjonens krav, minus spillerens egne `strengths`.
//      Ingen spiller får påstander som ikke allerede sto i spillerdataene.
//   3. Å trene en svak side gjør ham ikke bedre. Den ÅPNER DØRER: han kan
//      brukes i roller som krever det, uten at klassen hans er rørt. Og
//      uttellingen kommer først når manageren faktisk bruker ham der.
//
// Rekkevidden er bevisst spillerens egne posisjoner (naturlige + brukbare), ikke
// `poorFits`. Første utgave rangerte over `poorFits` også, og da fikk keeperen
// «løper lite uten ball» som trenbar svakhet — fordi spiss lå i poorFits. En
// svakhet i en posisjon han uansett ikke skal spille er ikke en dør verdt å
// åpne; den er bare støy.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random.
// ============================================================================

export const PLAYER_WEAKNESS_VERSION = "player-weaknesses.v1";
export const WEAKNESS_PROGRESS_MAX = 100;

// Hvor mange svake sider vi løfter fram per spiller. Tre er nok til å tegne en
// profil, og få nok til at manageren faktisk kan gjøre noe med dem.
const WEAKNESSES_PER_PLAYER = 3;

// En rolle spilleren allerede foretrekker teller mindre: der er døra åpen.
const WEIGHT_PREFERRED_ROLE = 1;
const WEIGHT_OTHER_ROLE = 2;
// Posisjonskravene er gulvet — de sikrer at ENHVER spiller får svake sider,
// også en keeper med bare én gyldig rolle.
const WEIGHT_POSITION_DEMAND = 3;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Katalogen
// ---------------------------------------------------------------------------

const DEFAULT_DIFFICULTY = Object.freeze({
  lett: { growthPerWeek: 9, note: "" },
  moderat: { growthPerWeek: 6, note: "" },
  hard: { growthPerWeek: 3, note: "" }
});

export function normalizeWeaknessCatalogue(data) {
  const rawDifficulty = data && typeof data.difficulty === "object" && data.difficulty ? data.difficulty : {};
  const difficulty = {};
  for (const key of ["lett", "moderat", "hard"]) {
    const src = rawDifficulty[key] && typeof rawDifficulty[key] === "object" ? rawDifficulty[key] : {};
    difficulty[key] = Object.freeze({
      growthPerWeek: clamp(num(src.growthPerWeek, DEFAULT_DIFFICULTY[key].growthPerWeek), 1, 15),
      note: str(src.note)
    });
  }

  const attributes = asArray(data?.attributes)
    .filter((entry) => entry && typeof entry === "object" && str(entry.id) && str(entry.name))
    .map((entry) => Object.freeze({
      id: str(entry.id),
      name: str(entry.name),
      weaknessLabel: str(entry.weaknessLabel) || `Svak på ${str(entry.name).toLowerCase()}`,
      category: str(entry.category) || "teknisk",
      // Beslektede styrker som dekker kravet. Uten dette ble Hegerberg meldt
      // «setter ikke sjansene» fordi hun har `box_finishing` og ikke `finishing`,
      // og keeperen «treg på refleksredningene» fordi han har `shot_stopping`.
      // Vokabularet er delt opp i tokens som overlapper; det må vi respektere.
      coveredBy: Object.freeze(asArray(entry.coveredBy).map(str).filter(Boolean)),
      difficulty: ["lett", "moderat", "hard"].includes(str(entry.difficulty)) ? str(entry.difficulty) : "moderat",
      note: str(entry.note)
    }));

  const rawDemands = data?.positionDemands && typeof data.positionDemands === "object" ? data.positionDemands : {};
  const positionDemands = {};
  for (const [position, tokens] of Object.entries(rawDemands)) {
    if (!str(position)) continue;
    positionDemands[position] = Object.freeze(asArray(tokens).map(str).filter(Boolean));
  }

  const training = data?.training && typeof data.training === "object" ? data.training : {};

  return Object.freeze({
    version: PLAYER_WEAKNESS_VERSION,
    attributes: Object.freeze(attributes),
    positionDemands: Object.freeze(positionDemands),
    difficulty: Object.freeze(difficulty),
    biteReliefCap: clamp(num(training.biteReliefCap, 4), 1, 8),
    note: str(data?.note)
  });
}

export function getWeaknessAttribute(catalogue, attributeId) {
  return asArray(catalogue?.attributes).find((entry) => entry.id === str(attributeId)) || null;
}

// ---------------------------------------------------------------------------
// Identifisering
// ---------------------------------------------------------------------------

// Hvilke krav møter denne spilleren i posisjonene han faktisk kan spille?
// Returnerer et vektet oppslag attributt → hvor hardt kravet presser på ham.
function demandWeights(player, { roles, catalogue }) {
  const reach = new Set([
    ...asArray(player?.naturalPositions).map(str),
    ...asArray(player?.usablePositions).map(str)
  ].filter(Boolean));

  const preferred = new Set(asArray(player?.preferredRoles).map(str));
  const weights = new Map();
  const add = (token, weight) => {
    if (!getWeaknessAttribute(catalogue, token)) return;
    weights.set(token, (weights.get(token) || 0) + weight);
  };

  // Posisjonskravene: gulvet som gjør at alle får en profil.
  reach.forEach((position) => {
    asArray(catalogue?.positionDemands?.[position]).forEach((token) => add(token, WEIGHT_POSITION_DEMAND));
  });

  // Rollekravene: der de virkelige dørene er.
  asArray(roles).forEach((role) => {
    if (!asArray(role?.validPositions).some((position) => reach.has(str(position)))) return;
    const weight = preferred.has(str(role.id)) ? WEIGHT_PREFERRED_ROLE : WEIGHT_OTHER_ROLE;
    asArray(role?.requires).forEach((token) => add(token, weight));
  });

  return weights;
}

// Spillerens svake sider: kravene han møter, som styrkene hans ikke svarer på.
// Deterministisk sortering (vekt, så id) slik at samme spiller alltid gir samme
// liste — en profil som hopper mellom renderinger ville vært ubrukelig.
export function identifyPlayerWeaknesses(player, { roles = [], catalogue, limit = WEAKNESSES_PER_PLAYER } = {}) {
  if (!player || !str(player.id) || !catalogue) return [];

  const reach = new Set([
    ...asArray(player.naturalPositions).map(str),
    ...asArray(player.usablePositions).map(str)
  ].filter(Boolean));
  const strengths = new Set(asArray(player.strengths).map(str));
  const weights = demandWeights(player, { roles, catalogue });

  // En svakhet er kun en svakhet hvis verken kravet selv eller noe som dekker
  // det står blant styrkene hans.
  const covered = (token) => {
    const attribute = getWeaknessAttribute(catalogue, token);
    return asArray(attribute?.coveredBy).some((related) => strengths.has(related));
  };

  return [...weights.entries()]
    .filter(([token]) => !strengths.has(token) && !covered(token))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, clamp(Math.trunc(num(limit, WEAKNESSES_PER_PLAYER)), 1, 6))
    .map(([token, weight]) => {
      const attribute = getWeaknessAttribute(catalogue, token);
      return {
        attributeId: token,
        name: attribute.name,
        label: attribute.weaknessLabel,
        category: attribute.category,
        difficulty: attribute.difficulty,
        note: attribute.note,
        pressure: weight,
        // Hvor svakheten faktisk biter: rollene I HANS REKKEVIDDE som krever
        // den. Uten posisjonsfilteret sto det «Stenger: Ballspillende stopper,
        // Libero» på en keeper — sant om rollene, meningsløst om ham.
        bitesInRoles: asArray(roles)
          .filter((role) => asArray(role?.requires).includes(token)
            && asArray(role?.validPositions).some((position) => reach.has(str(position))))
          .map((role) => ({ id: str(role.id), name: str(role.name) }))
      };
    });
}

// ---------------------------------------------------------------------------
// Framgang
// ---------------------------------------------------------------------------

function progressKey(playerId, attributeId) {
  return `${playerId}::${attributeId}`;
}

export function normalizeWeaknessProgress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    if (typeof rawKey !== "string" || !rawKey.includes("::")) continue;
    const [playerId, attributeId] = rawKey.split("::");
    if (!playerId || !attributeId) continue;
    const n = Number(rawValue);
    if (Number.isFinite(n) && n > 0) {
      result[progressKey(playerId, attributeId)] = clamp(Math.round(n), 0, WEAKNESS_PROGRESS_MAX);
    }
  }
  return result;
}

export function getWeaknessProgress(store, playerId, attributeId) {
  if (!store || !playerId || !attributeId) return 0;
  return clamp(Math.round(num(store[progressKey(playerId, attributeId)])), 0, WEAKNESS_PROGRESS_MAX);
}

// En ukes arbeid med én svak side. Vanskelighetsgraden bestemmer takten:
// posisjonering flytter seg fort, akselerasjon nesten ikke. Staben forsterker.
export function applyWeaknessTraining(store, gains) {
  const next = { ...normalizeWeaknessProgress(store) };
  for (const gain of asArray(gains)) {
    if (!gain || typeof gain !== "object") continue;
    const playerId = str(gain.playerId);
    const attributeId = str(gain.attributeId);
    const growth = num(gain.growth);
    if (!playerId || !attributeId || growth <= 0) continue;
    const key = progressKey(playerId, attributeId);
    next[key] = clamp(Math.round((next[key] || 0) + growth), 0, WEAKNESS_PROGRESS_MAX);
  }
  return next;
}

export function weeklyWeaknessGrowth(catalogue, attributeId, staffFactor = 1) {
  const attribute = getWeaknessAttribute(catalogue, attributeId);
  if (!attribute) return 0;
  const base = catalogue?.difficulty?.[attribute.difficulty]?.growthPerWeek ?? 6;
  return Math.max(1, Math.round(base * clamp(num(staffFactor, 1), 0.5, 1.5)));
}

const LEVELS = [
  { min: 80, level: "løst", label: "Ikke lenger et problem" },
  { min: 50, level: "bedret", label: "Merkbart bedre" },
  { min: 20, level: "påbegynt", label: "Så vidt i gang" },
  { min: 0, level: "urørt", label: "Urørt" }
];

export function describeWeaknessProgress(value) {
  const v = clamp(Math.round(num(value)), 0, WEAKNESS_PROGRESS_MAX);
  const level = LEVELS.find((entry) => v >= entry.min) || LEVELS[LEVELS.length - 1];
  const hint = level.level === "løst"
    ? "Han kan brukes i roller som krever dette nå. Bruk ham der — ellers var arbeidet forgjeves."
    : level.level === "bedret"
      ? "Døra er på gløtt. Noen uker til, så er rollen hans."
      : level.level === "påbegynt"
        ? "Arbeidet er begynt. Dette tar tid, og tiden er din å bruke."
        : "Ingen har jobbet med dette ennå.";
  return { value: v, level: level.level, label: level.label, hint };
}

// ---------------------------------------------------------------------------
// Uttellingen: dører du faktisk går gjennom
// ---------------------------------------------------------------------------

// Hva trening på en svak side er verdt PÅ BANEN. Regelen er streng med vilje:
// den betaler bare når spilleren står i en rolle som krever nettopp det han har
// trent på, og som han ikke hadde fra før. Trener du Haalands førstetouch og
// lar ham stå som ren boksspiss, får du ingenting — og flata sier det.
//
// Bonusen er liten og klampet (som lagklasse- og fortrolighetsbonusen). Den
// avgjører aldri en kamp; den belønner at manageren gjorde et stykke arbeid og
// deretter brukte det.
export function summarizeLineupWeaknessWork(store, assignments, { roles = [], catalogue } = {}) {
  const progress = normalizeWeaknessProgress(store);
  const cap = num(catalogue?.biteReliefCap, 4);
  const roleById = new Map(asArray(roles).map((role) => [str(role?.id), role]));
  const opened = [];
  const idle = [];

  asArray(assignments).forEach((entry) => {
    const player = entry?.player;
    const role = roleById.get(str(entry?.role?.id || entry?.roleId));
    if (!player || !role) return;
    const strengths = new Set(asArray(player.strengths).map(str));

    asArray(role.requires).forEach((token) => {
      if (strengths.has(token)) return;
      const attribute = getWeaknessAttribute(catalogue, token);
      if (!attribute) return;
      if (asArray(attribute.coveredBy).some((related) => strengths.has(related))) return;
      const value = getWeaknessProgress(progress, str(player.id), token);
      if (value >= 50) {
        opened.push({
          playerId: str(player.id),
          playerName: str(player.name),
          attributeId: token,
          attributeName: attribute.name,
          roleName: str(role.name),
          progress: value,
          note: `${str(player.name)} har jobbet med ${attribute.name.toLowerCase()} — rollen ${str(role.name)} krever nettopp det.`
        });
      }
    });
  });

  // Trent, men ikke brukt: arbeid uten uttelling. Det skal SIES, ikke skjules.
  Object.entries(progress).forEach(([key, value]) => {
    if (value < 50) return;
    const [playerId, attributeId] = key.split("::");
    if (opened.some((item) => item.playerId === playerId && item.attributeId === attributeId)) return;
    const attribute = getWeaknessAttribute(catalogue, attributeId);
    if (!attribute) return;
    idle.push({ playerId, attributeId, attributeName: attribute.name, progress: value });
  });

  // Hver åpnet dør er verdt ett poeng, klampet. Sortert deterministisk.
  opened.sort((a, b) => a.playerId.localeCompare(b.playerId) || a.attributeId.localeCompare(b.attributeId));
  const bonus = clamp(opened.length, 0, cap);

  return {
    bonus,
    openedDoors: opened,
    idleWork: idle.sort((a, b) => a.playerId.localeCompare(b.playerId) || a.attributeId.localeCompare(b.attributeId)),
    headline: opened.length === 0
      ? idle.length > 0
        ? `${idle.length} ferdigtrent svak side ligger ubrukt — spillerne står ikke i rollene som krever dem.`
        : "Ingen trente svake sider i bruk i denne elleveren."
      : `${opened.length} spiller${opened.length === 1 ? "" : "e"} står i en rolle han har trent seg til.`
  };
}

// Kort lesning av én spillers profil, til flata.
export function summarizePlayerWeaknesses(player, weaknesses, store) {
  const list = asArray(weaknesses);
  if (list.length === 0) {
    return { count: 0, headline: `${str(player?.name) || "Spilleren"} har ingen svake sider innenfor rekkevidde.`, worked: 0 };
  }
  const worked = list.filter((weakness) => getWeaknessProgress(normalizeWeaknessProgress(store), str(player?.id), weakness.attributeId) >= 50).length;
  return {
    count: list.length,
    worked,
    headline: worked === 0
      ? `${list.map((weakness) => weakness.label.toLowerCase()).join(" · ")}`
      : `${worked} av ${list.length} svake sider er jobbet med.`
  };
}
