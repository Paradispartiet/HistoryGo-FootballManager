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
//   2. Det lages ALDRI en ny samlescore av dem. Ferdighetene er scoren. Et
//      posisjonsvektet snitt ville bare vært `overall` på nytt, med posisjon
//      limt på — og verre: det ville gitt Ødegaard et lavt tall som midtstopper,
//      en posisjon han aldri skal spille. Han er ikke «en 46». Han har 20 i
//      spilleforståelse, overalt, alltid.
//
// Hvorfor dette gjør spillet MER tro mot prinsippet, ikke mindre: `overall` var
// selve ratingen. Ett tall, forfattet, og 204 av 367 spillere sto på nøyaktig
// 87 — det skilte ikke engang. Nå er `classHeight` bare en INPUT (hvor høyt
// kilden bærer spilleren), og det eneste tallet som måles mot en bruk av ham er
// FITEN — om treneren bruker ham riktig — aldri en ny rating av spilleren.
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
  coveredByHarder: 5, // ... og den dekkende styrken er den vanskeligere av de to
  naturalTop: 7,      // fremste krav i en naturlig posisjon
  naturalLow: 3,      // bakerste krav i en naturlig posisjon
  usableFactor: 0.5,  // samme krav i en brukbar posisjon teller halvt
  preferredRole: 3,   // krevd av en rolle spilleren selv foretrekker
  archetype: 2,       // ligger i arketypen hans
  poorFitOnly: -2,    // bare krevd av posisjoner han uttrykkelig ikke passer i
  positionBaseline: 8 // spennet posisjonens jobbprofil alene kan flytte
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
      group: str(entry.group) || "hode",
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

  const positionProfiles = {};
  for (const [position, weights] of Object.entries(data?.positionProfiles || {})) {
    if (!str(position) || !weights) continue;
    const entry = {};
    for (const [group, weight] of Object.entries(weights)) entry[str(group)] = clamp(num(weight, 0), 0, 100);
    positionProfiles[position] = Object.freeze(entry);
  }

  return Object.freeze({
    version: PLAYER_ATTRIBUTES_VERSION,
    attributes: Object.freeze(attributes),
    byId,
    aliases: Object.freeze(aliases),
    positionDemands: Object.freeze(positionDemands),
    positionProfiles: Object.freeze(positionProfiles),
    groups: Object.freeze({ ...(data?.groups || {}) }),
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

const DIFFICULTY_RANK = Object.freeze({ lett: 0, moderat: 1, hard: 2 });

function collectStrengthIds(catalogue, player) {
  const direct = new Set();
  for (const token of asArray(player?.strengths)) {
    const resolved = resolveAttributeToken(catalogue, token);
    if (resolved) direct.add(resolved);
  }
  // Overlappende vokabular: har han `box_finishing`, er `finishing` dekket.
  //
  // Dekningen graderes etter vanskelighet, som allerede står i katalogen. Er
  // spilleren belagt elite på den VANSKELIGE ferdigheten, kan han ikke være
  // middels på den lette den forutsetter: Ødegaard er belagt på `final_pass`
  // (hard), og da er `simple_passing` (lett) ikke en tier av tjue. Med flat
  // dekning ble han nettopp det.
  //
  // Dette finner ikke på noe. Det leser `difficulty` og `coveredBy` som
  // allerede lå der, og bruker den ene til å vekte den andre.
  const covered = new Map();
  for (const attribute of catalogue.attributes) {
    if (direct.has(attribute.id)) continue;
    let best = 0;
    for (const token of attribute.coveredBy) {
      const source = resolveAttributeToken(catalogue, token) || token;
      if (!direct.has(source)) continue;
      const sourceRank = DIFFICULTY_RANK[catalogue.byId.get(source)?.difficulty] ?? 1;
      const ownRank = DIFFICULTY_RANK[attribute.difficulty] ?? 1;
      // Dekker en vanskeligere ferdighet en lettere, teller den fullt ut.
      best = Math.max(best, sourceRank > ownRank ? LIFT.coveredByHarder : LIFT.coveredBy);
    }
    if (best > 0) covered.set(attribute.id, best);
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

// Hvor viktig en jobbgruppe må være for posisjonen før en lav verdi der teller
// som en SVAKHET. Under dette er den bare irrelevant.
const RELEVANT_GROUP_WEIGHT = 25;

function percentile(sorted, share) {
  if (sorted.length === 0) return 0;
  const index = clamp(Math.round((sorted.length - 1) * share), 0, sorted.length - 1);
  return sorted[index];
}

// ---------------------------------------------------------------------------
// Form og NIVÅ er to akser
// ---------------------------------------------------------------------------
//
// `strengths` og posisjonen sier hva en spiller er god TIL — formen på profilen.
// De sier ingenting om hvor høyt det rekker. Ghayas Zahid og Martin Ødegaard har
// begge `vision` og `final_pass` blant styrkene sine, og fikk derfor begge 20:
// katalogen kunne skille en tier fra en stopper, men ikke en landslagskaptein
// fra en eliteseriespiller.
//
// `classHeight` setter derfor TAKET, multiplikativt på hele profilen. Formen
// bevares — Zahid er fortsatt en skapende midtbanespiller — men den når ikke
// like høyt.
//
// Kurven er bevisst hard i midten og flat i toppen. Klassebåndet er smalt
// (86–99) fordi vi har valgt mange gode spillere, så alle skal være ganske gode;
// men uten en kurve ville 90 og 96 blitt nesten like. Med den lander en typisk
// eliteseriespiller på 13–14 der han er best, og bare de aller ypperste når 19–20.
//
// Kompresjonen går mot et PROFF-MIDTPUNKT, ikke mot gulvet. Første forsøk klemte
// hele profilen ned mot 4, og da havnet 67 % av alle verdier på 4–7: katalogen
// leste som om alle var middelmådige, stikk i strid med at dette er utvalgte,
// gode spillere. En eliteseriestopper takler ikke som en amatør fordi han ikke er
// Maldini — han takler litt dårligere. Klassen senker TOPPEN og løfter ikke
// bunnen; grunnkompetansen står.
const CLASS_CEILING = Object.freeze({
  midpoint: 10, // det en proff behersker uansett klasse
  base: 0.40,   // hvor mye av avstanden fra midtpunktet den laveste klassen beholder
  curve: 1.25   // > 1 skiller midten; < 1 ville klemt alle mot toppen
});

export function classCeilingFactor(classHeight) {
  const t = clamp((num(classHeight, 87) - 85) / 14, 0, 1);
  return CLASS_CEILING.base + (1 - CLASS_CEILING.base) * Math.pow(t, CLASS_CEILING.curve);
}

// Taket komprimerer mot GULVET, ikke mot null: en lavere klassehøyde gjør
// profilen lavere, aldri en annen form. Gulvet er fortsatt en proff spillers
// gulv — dette er spillere som har spilt A-lagsfotball.
function applyClassCeiling(value, factor) {
  const { floor, max } = ATTRIBUTE_SCALE;
  const { midpoint } = CLASS_CEILING;
  // Bare OPPSIDEN røres. En lavere klassehøyde gjør ikke svake sider mindre
  // svake — en eliteseriestopper og en verdensstopper har begge dårlig
  // avslutning; forskjellen ligger i taklingen. Komprimerte vi begge veier,
  // konvergerte hele katalogen mot midtpunktet: 34 % av alle verdier havnet på
  // nøyaktig 9, og profilene sluttet å sprike.
  if (value <= midpoint) return clamp(Math.round(value), floor, max);
  return clamp(Math.round(midpoint + (value - midpoint) * factor), floor, max);
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

  // Klassehøyden ligger IKKE her. Den er ikke en del av formen — se
  // `classCeilingFactor` nedenfor. Å legge den til her var feilen som ga Ghayas
  // Zahid 20 i siste pasning: han har `final_pass` blant styrkene sine, og et
  // lite additivt klasseledd druknet fullstendig i det.

  // ---------------------------------------------------------------------
  // Grunnlinja: hva posisjonen HANS tilsier på hver eneste ferdighet.
  //
  // Dette er forskjellen på en profil og en halv profil. Uten den fikk alt
  // spillet ikke hadde kilde på nøyaktig samme tall — 21 % av alle verdier lå
  // på gulvet — og en offensiv midtbanespiller hadde like «ukjente»
  // forsvarstall som en midtstopper. En tier har ikke ukjente forsvarstall.
  // Han har lave, og det er en helt vanlig fotballopplysning.
  //
  // Grunnlinja er en påstand om POSISJONEN, ikke om personen. Spiller han
  // flere posisjoner, teller den beste — en spiller straffes ikke for å være
  // allsidig.
  // ---------------------------------------------------------------------
  const profilePositions = natural.length ? natural : usable;
  const groupBaseline = new Map();
  for (const position of profilePositions) {
    const weights = catalogue.positionProfiles?.[position];
    if (!weights) continue;
    for (const [group, weight] of Object.entries(weights)) {
      groupBaseline.set(group, Math.max(groupBaseline.get(group) ?? 0, weight));
    }
  }

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

  // Formen regnes ut først, så senkes hele profilen av klassehøyden.
  const ceiling = classCeilingFactor(player.classHeight);

  const values = {};
  const provenance = {};
  for (const attribute of catalogue.attributes) {
    const id = attribute.id;
    // Grunnlinja skalerer 0–100-vekten inn i det samme råspennet som resten
    // av signalene, eksplisitt — ikke ved å la et klem gjøre jobben.
    const baseline = groupBaseline.has(attribute.group)
      ? (groupBaseline.get(attribute.group) / 100) * LIFT.positionBaseline
      : LIFT.positionBaseline * 0.5;
    let raw = baseline;
    let source = "utledet";

    if (positionLift.has(id)) { raw += positionLift.get(id); source = "posisjon"; }
    if (roleWanted.has(id)) { raw += LIFT.preferredRole; if (source === "utledet") source = "rolle"; }
    if (archetypeTokens.has(id)) raw += LIFT.archetype;
    if (covered.has(id)) raw += covered.get(id);
    // Belagt sist og tyngst: det er det eneste kilden faktisk har sagt om ham.
    if (direct.has(id)) { raw += LIFT.strength; source = "belagt"; }
    if (poorOnly.has(id)) raw += LIFT.poorFitOnly;

    values[id] = rawOnly ? raw : applyClassCeiling(scaleRawValue(raw, scaling), ceiling);
    provenance[id] = source;
  }

  const numbers = Object.values(values);
  const ranked = Object.entries(values)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, value]) => ({ id, value, name: catalogue.byId.get(id)?.name || id, source: provenance[id] }));

  // Svake sider måles bare blant ferdigheter som betyr noe for posisjonen hans.
  // At en midtbanespiller ikke redder skudd er ikke en svakhet, det er en
  // kategorifeil — og en «svakest»-liste full av keeperferdigheter forteller
  // manageren ingenting han kan gjøre noe med.
  const relevant = ranked.filter((entry) => {
    const group = catalogue.byId.get(entry.id)?.group;
    return (groupBaseline.get(group) ?? 50) >= RELEVANT_GROUP_WEIGHT;
  });

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
    // Åtte, ikke seks: sidepanelet viser `top` direkte, og en konstant som
    // ber om åtte mens profilen bærer seks er nettopp den stille uenigheten
    // huset blir bitt av.
    top: Object.freeze(ranked.slice(0, 8)),
    weak: Object.freeze(relevant.slice(-6).reverse()),
    sourcedCount: ranked.filter((entry) => entry.source === "belagt").length
  });
}

// ---------------------------------------------------------------------------
// Hva posisjonen krever — som FAKTA om ferdigheter, ikke som en samlescore
// ---------------------------------------------------------------------------
//
// Det fantes en `deriveClassForPosition()` her som vektet ferdighetene etter
// posisjonens krav og ga ett tall: «Ødegaard som CB = 46». Den er fjernet, og
// grunnen er verdt å skrive ned, for feilen var lett å gjøre igjen:
//
// Et posisjonsvektet snitt ER en samlescore. Å gjøre den posisjonsavhengig
// fjerner ikke ratingen — den lager én rating per posisjon, og gir dessuten
// spilleren et lavt tall i en posisjon han aldri skal spille. Ødegaard er ikke
// «en 46». Han har 20 i spilleforståelse og 20 i siste pasning, overalt, alltid.
//
// Det manageren trenger å vite om en plassering er ikke et snitt, men hvilke
// KONKRETE ferdigheter posisjonen krever og hvor han står på dem. Det er et
// faktum om ferdigheter, ikke en dom over spilleren — og det forklarer feilbruk
// uten å påstå at spilleren er dårlig.
export function describePositionDemands(attributes, position, catalogue, { gap = 12 } = {}) {
  const values = attributes?.values;
  const demands = catalogue?.positionDemands?.[str(position)] || [];
  if (!values || demands.length === 0) return null;

  const met = [];
  const missing = [];
  demands.forEach((token, rank) => {
    const id = resolveAttributeToken(catalogue, token);
    if (!id || !(id in values)) return;
    const entry = { id, name: catalogue.byId.get(id)?.name || id, value: values[id], rank };
    (values[id] >= gap ? met : missing).push(entry);
  });
  missing.sort((a, b) => a.rank - b.rank);
  return { position, met, missing, demandCount: met.length + missing.length };
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
