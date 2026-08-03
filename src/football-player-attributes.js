// ============================================================================
// Ferdigheter v1 — profil, ikke rang
//
// > Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
//
// Et tall per ferdighet ser ut som et ratingspill, og kan lett bli det. Det er
// det motsatte her, og forskjellen ligger i to valg:
//
//   1. Det finnes ikke ETT tall. En spiller er 42 tall som spriker. Han er 18 i
//      hodespill og 6 i akselerasjon — det sier hva han ER, ikke hvor god han
//      er. Nettopp fordi profilen spriker, kan to spillere med samme klasse
//      være helt ulike lagdeler.
//   2. Klassen er POSISJONSAVHENGIG. `deriveClassForPosition()` vekter
//      ferdighetene etter hva posisjonen faktisk krever, så samme spiller får
//      ulikt tall som CB og som ST. Da finnes det ingen kolonne å sortere
//      troppen etter, og rangeringen dør strukturelt i stedet for ved regel.
//
// Hvorfor dette gjør spillet MER tro mot prinsippet, ikke mindre: `overall` var
// selve ratingen. Ett tall, forfattet, og 204 av 367 spillere sto på nøyaktig
// 87 — det skilte ikke engang. Nå er `classHeight` bare en INPUT (hvor høyt
// kilden bærer spilleren), og det manageren ser og motoren leser er alltid
// regnet ut mot en posisjon eller en rolle.
//
// PÅSTANDER OM EKTE SPILLERE. Dette er 367 navngitte fotballspillere. Vi kan
// ikke slå opp 42 tall for hver. Derfor UTLEDES tallene av data som allerede
// står der — posisjon, `strengths`, `archetypes`, foretrukne roller — akkurat
// som svakhetsmotoren gjør det, og hver verdi bærer med seg HVOR den kom fra
// (`provenance`). Det spillet ikke vet, sier det ikke. Ingen ekte spiller får
// et lavt tall som en dom: gulvet er en proff spillers gulv, og det som skiller
// er hvor profilen TOPPER seg.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random. Samme
// input gir alltid samme profil.
// ============================================================================

export const PLAYER_ATTRIBUTES_VERSION = "historygo-football-manager.player-attributes.v1";

// Skalaen er sjangerens 1–20. Gulvet er 4, ikke 1: dette er spillere som har
// spilt A-lagsfotball, og et ettall ville vært en påstand om en ekte person.
export const ATTRIBUTE_SCALE = Object.freeze({ min: 1, max: 20, floor: 4 });

// Hvor mye hvert signal flytter. Rangeringen er poenget: et posisjonskrav
// veier tyngre enn en foretrukket rolle, og en BELAGT styrke tyngst av alt —
// den er det eneste kilden faktisk har sagt.
const LIFT = Object.freeze({
  strength: 6,        // står i spillerens egne `strengths`
  coveredBy: 3,       // dekkes av en styrke som overlapper (box_finishing → finishing)
  naturalTop: 7,      // fremste krav i en naturlig posisjon
  naturalLow: 3,      // bakerste krav i en naturlig posisjon
  usableFactor: 0.5,  // samme krav i en brukbar posisjon teller halvt
  preferredRole: 3,   // krevd av en rolle spilleren selv foretrekker
  archetype: 2,       // ligger i arketypen hans
  poorFitOnly: -2     // bare krevd av posisjoner han uttrykkelig ikke passer i
});

const asArray = (value) => (Array.isArray(value) ? value : []);
const str = (value) => (typeof value === "string" ? value : "");
const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// ---------------------------------------------------------------------------
// Katalogen
// ---------------------------------------------------------------------------

// Vokabularet bor i data/football_attributes.json og leses inn her. Det lå
// tidligere i svakhetsfila og eide da to ting samtidig; nå eier svakhetsfila
// bare TRENINGEN av ferdighetene, og ferdighetene selv bor ett sted.
export function normalizeAttributeCatalogue(data) {
  const attributes = asArray(data?.attributes)
    .filter((entry) => str(entry?.id))
    .map((entry) => Object.freeze({
      id: str(entry.id),
      name: str(entry.name) || str(entry.id),
      weaknessLabel: str(entry.weaknessLabel),
      category: ["fysisk", "teknisk", "taktisk", "mental"].includes(str(entry.category)) ? str(entry.category) : "teknisk",
      difficulty: ["lett", "moderat", "hard"].includes(str(entry.difficulty)) ? str(entry.difficulty) : "moderat",
      coveredBy: Object.freeze(asArray(entry.coveredBy).map(str).filter(Boolean)),
      note: str(entry.note)
    }));

  const byId = new Map(attributes.map((entry) => [entry.id, entry]));
  const aliases = {};
  for (const [token, target] of Object.entries(data?.strengthAliases || {})) {
    if (str(token) && byId.has(str(target))) aliases[str(token)] = str(target);
  }

  const positionDemands = {};
  for (const [position, tokens] of Object.entries(data?.positionDemands || {})) {
    if (!str(position)) continue;
    positionDemands[position] = Object.freeze(asArray(tokens).map(str).filter(Boolean));
  }

  return Object.freeze({
    version: PLAYER_ATTRIBUTES_VERSION,
    attributes: Object.freeze(attributes),
    byId,
    aliases: Object.freeze(aliases),
    positionDemands: Object.freeze(positionDemands),
    scale: ATTRIBUTE_SCALE
  });
}

// Et token → en ferdighet, eller null hvis det ikke er en ferdighet i det hele
// tatt. Det siste er ikke en feil: `role.requires` blander ferdigheter spilleren
// må ha (`crossing`) med FORHOLD systemet må gi ham (`space_behind`,
// `wide_lane`). Målt over de 27 rollene er 96 krav ferdigheter og 38 forhold.
// Bare de første hører hjemme her — forholdene eies av lag- og
// relasjonsmotorene, og å blande dem ville gjort en systemsvikt om til en
// spillersvakhet.
export function resolveAttributeToken(catalogue, token) {
  const id = str(token);
  if (!id) return null;
  if (catalogue?.byId?.has(id)) return id;
  const alias = catalogue?.aliases?.[id];
  return alias && catalogue.byId.has(alias) ? alias : null;
}

// Hvilke av en rolles krav er ferdigheter, og hvilke er forhold?
export function splitRoleRequirements(catalogue, role) {
  const skills = [];
  const conditions = [];
  for (const token of asArray(role?.requires)) {
    const resolved = resolveAttributeToken(catalogue, token);
    if (resolved) skills.push(resolved);
    else if (str(token)) conditions.push(str(token));
  }
  return { skills: [...new Set(skills)], conditions };
}

// ---------------------------------------------------------------------------
// Utledningen
// ---------------------------------------------------------------------------

// Et posisjonskrav er RANGERT — det første kravet veier tyngst. Det er ikke
// funnet på til dette: `positionDemands` sto allerede i den rekkefølgen (GK:
// shot_stopping først, passing_range sist), den ble bare aldri lest som en
// rangering.
function demandLift(rank, total) {
  if (total <= 1) return LIFT.naturalTop;
  const share = rank / (total - 1);
  return LIFT.naturalTop - share * (LIFT.naturalTop - LIFT.naturalLow);
}

function collectStrengthIds(catalogue, player) {
  const direct = new Set();
  for (const token of asArray(player?.strengths)) {
    const resolved = resolveAttributeToken(catalogue, token);
    if (resolved) direct.add(resolved);
  }
  // Overlappende vokabular: har han `box_finishing`, er `finishing` dekket.
  const covered = new Set();
  for (const attribute of catalogue.attributes) {
    if (direct.has(attribute.id)) continue;
    if (attribute.coveredBy.some((token) => direct.has(resolveAttributeToken(catalogue, token) || token))) {
      covered.add(attribute.id);
    }
  }
  return { direct, covered };
}

// ---------------------------------------------------------------------------
// Skaleringen — og hvorfor den ikke er et klem
// ---------------------------------------------------------------------------
//
// Første utgave la signalene sammen og klemte resultatet inn i 1–20. Målt på
// ekte data ga det 776 verdier på nøyaktig 20 og en topp på 2. Det er
// bugklassen CLAUDE.md beskriver: et tak som alltid biter er en skala-mismatch,
// ikke en grense. Og en toer om en ekte fotballspiller er dessuten en påstand vi
// ikke har dekning for.
//
// Nå normaliseres råtallet EKSPLISITT mot spennet korpuset faktisk bruker —
// samme grep som tersilene i klubbtradisjonen. Ytterpunktene kappes på 2./98.
// persentil, ellers ville én ekstrem spiller presset alle andre sammen.
const SCALE_PERCENTILE = 0.02;

function percentile(sorted, share) {
  if (sorted.length === 0) return 0;
  const index = clamp(Math.round((sorted.length - 1) * share), 0, sorted.length - 1);
  return sorted[index];
}

function scaleRawValue(raw, scaling) {
  const { low, high } = scaling || {};
  const { floor, max } = ATTRIBUTE_SCALE;
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    return clamp(Math.round(raw), floor, max);
  }
  const share = (raw - low) / (high - low);
  // Gulvet er en proff spillers gulv. Ingen ekte spiller får et ettall her:
  // det ville vært en dom vi ikke har kilde for.
  return clamp(Math.round(floor + share * (max - floor)), floor, max);
}

// Råspennet korpuset faktisk bruker. Motoren er fortsatt ren — korpuset sendes
// inn, det leses ikke fra noe sted.
export function buildAttributeScaling(players, { catalogue, roles = [] } = {}) {
  const raws = [];
  for (const player of asArray(players)) {
    const profile = derivePlayerAttributes(player, { catalogue, roles, scaling: null, rawOnly: true });
    if (profile) raws.push(...Object.values(profile.values));
  }
  raws.sort((a, b) => a - b);
  return Object.freeze({
    low: percentile(raws, SCALE_PERCENTILE),
    high: percentile(raws, 1 - SCALE_PERCENTILE),
    sampled: raws.length
  });
}

// Spillerens ferdighetsprofil. Deterministisk, og hver verdi vet hvor den kom
// fra: `belagt` (kilden sa det), `posisjon`, `rolle` eller `utledet`.
export function derivePlayerAttributes(player, { catalogue, roles = [], scaling = null, rawOnly = false } = {}) {
  if (!player || !catalogue?.attributes?.length) return null;

  const { direct, covered } = collectStrengthIds(catalogue, player);
  const natural = asArray(player.naturalPositions).map(str).filter(Boolean);
  const usable = asArray(player.usablePositions).map(str).filter(Boolean);
  const poor = asArray(player.poorFits).map(str).filter(Boolean);

  // Klassehøyden er en INPUT, ikke en score: den løfter hele profilen litt, og
  // avgjør ingenting alene. Spennet er bevisst lite (0–4 av 20) — det som
  // skiller spillere er hvor profilen topper seg, ikke hvor høyt den ligger.
  const classLift = clamp(Math.round(((num(player.classHeight, 87) - 85) / 14) * 4), 0, 4);

  const positionLift = new Map();
  const addPositionLift = (positions, factor) => {
    for (const position of positions) {
      const demands = catalogue.positionDemands[position] || [];
      demands.forEach((token, rank) => {
        const id = resolveAttributeToken(catalogue, token);
        if (!id) return;
        const lift = demandLift(rank, demands.length) * factor;
        positionLift.set(id, Math.max(positionLift.get(id) || 0, lift));
      });
    }
  };
  addPositionLift(natural, 1);
  addPositionLift(usable, LIFT.usableFactor);

  // Krav fra roller spilleren SELV foretrekker. Bare ferdighetskravene.
  const roleWanted = new Set();
  const preferred = new Set(asArray(player.preferredRoles).map(str));
  for (const role of asArray(roles)) {
    if (!preferred.has(str(role?.id))) continue;
    for (const id of splitRoleRequirements(catalogue, role).skills) roleWanted.add(id);
  }

  const archetypeTokens = new Set(
    [...asArray(player.archetypes), ...asArray(player.archetypeIds)]
      .map((token) => resolveAttributeToken(catalogue, token)).filter(Boolean)
  );

  // Krav som BARE kommer fra posisjoner han uttrykkelig ikke passer i.
  const poorOnly = new Set();
  for (const position of poor) {
    for (const token of catalogue.positionDemands[position] || []) {
      const id = resolveAttributeToken(catalogue, token);
      if (id && !positionLift.has(id) && !direct.has(id) && !covered.has(id)) poorOnly.add(id);
    }
  }

  const values = {};
  const provenance = {};
  for (const attribute of catalogue.attributes) {
    const id = attribute.id;
    let raw = classLift;
    let source = "utledet";

    if (positionLift.has(id)) { raw += positionLift.get(id); source = "posisjon"; }
    if (roleWanted.has(id)) { raw += LIFT.preferredRole; if (source === "utledet") source = "rolle"; }
    if (archetypeTokens.has(id)) raw += LIFT.archetype;
    if (covered.has(id)) raw += LIFT.coveredBy;
    // Belagt sist og tyngst: det er det eneste kilden faktisk har sagt om ham.
    if (direct.has(id)) { raw += LIFT.strength; source = "belagt"; }
    if (poorOnly.has(id)) raw += LIFT.poorFitOnly;

    values[id] = rawOnly ? raw : scaleRawValue(raw, scaling);
    provenance[id] = source;
  }

  const numbers = Object.values(values);
  const ranked = Object.entries(values)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, value]) => ({ id, value, name: catalogue.byId.get(id)?.name || id, source: provenance[id] }));

  return Object.freeze({
    version: PLAYER_ATTRIBUTES_VERSION,
    playerId: str(player.id),
    values: Object.freeze(values),
    provenance: Object.freeze(provenance),
    // Spriket er selve poenget og måles derfor eksplisitt: en profil som ikke
    // spriker er en rating med flere kolonner.
    spread: Object.freeze({
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      range: Math.max(...numbers) - Math.min(...numbers)
    }),
    top: Object.freeze(ranked.slice(0, 6)),
    weak: Object.freeze(ranked.slice(-6).reverse()),
    sourcedCount: ranked.filter((entry) => entry.source === "belagt").length
  });
}

// ---------------------------------------------------------------------------
// Klassen manageren ser — alltid mot en posisjon eller en rolle
// ---------------------------------------------------------------------------

// Samme spiller, ulikt tall som CB og som ST. Det er hele forskjellen fra
// `overall`: det finnes ikke ett tall for spilleren, bare et tall for en bruk
// av ham. Vektet av posisjonens egen rangerte kravliste.
export function deriveClassForPosition(attributes, position, catalogue) {
  const values = attributes?.values;
  const demands = catalogue?.positionDemands?.[str(position)] || [];
  if (!values || demands.length === 0) return null;

  let weighted = 0;
  let weightSum = 0;
  demands.forEach((token, rank) => {
    const id = resolveAttributeToken(catalogue, token);
    if (!id || !(id in values)) return;
    const weight = demands.length - rank;
    weighted += values[id] * weight;
    weightSum += weight;
  });
  if (weightSum === 0) return null;
  // 1–20 → 1–100. Normalisert eksplisitt mot kildespennet, ikke klemt av et tak.
  return Math.round((weighted / weightSum / ATTRIBUTE_SCALE.max) * 100);
}

// Hvor godt treffer spilleren det DENNE rollen krever? Dette er tallet som
// erstatter `classBonus` i kampen — og det er hele grunnen til at en spiller med
// lavere klasse kan slå en med høyere: bonusen er ikke lenger et flatt løft
// spilleren bærer med seg overalt, den måles på nytt for hver rolle.
export function calculateRoleAttributeFit(attributes, role, catalogue) {
  const values = attributes?.values;
  if (!values || !catalogue) return null;
  const { skills } = splitRoleRequirements(catalogue, role);
  if (skills.length === 0) return null;
  const total = skills.reduce((sum, id) => sum + (values[id] ?? ATTRIBUTE_SCALE.floor), 0);
  return Math.round((total / skills.length / ATTRIBUTE_SCALE.max) * 100);
}

// Alle spillerprofilene i én omgang, klare til å henges på spillerobjektene.
// Skaleringen bygges av det samme korpuset, så den er alltid målt mot laget
// spillet faktisk inneholder.
export function derivePlayerAttributeIndex(players, { catalogue, roles = [] } = {}) {
  const scaling = buildAttributeScaling(players, { catalogue, roles });
  const index = {};
  for (const player of asArray(players)) {
    const profile = derivePlayerAttributes(player, { catalogue, roles, scaling });
    if (profile) index[player.id] = profile;
  }
  return Object.freeze({ scaling, profiles: index });
}
