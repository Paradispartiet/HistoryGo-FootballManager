// Spillerform og slitasje v1 — troppen mellom kampene
//
// Innbytte gjorde benken til en mulighet. Men det var fortsatt gratis å la
// stjernen stå 90 minutter hver eneste kamp: ingen ble sliten, ingen ble skadet,
// ingen mistet form. Da er ikke rotasjon en avveining — den er bare noe du kan
// gjøre.
//
// Her bærer spillerne konsekvensen av bruken sin videre:
//
//   BELASTNING  minutter du har spilt dem, minus hvile og restitusjonstrening
//   FRISKHET    hva belastningen gjør med dem akkurat nå
//   FORM        hvordan det har gått i kampene de faktisk spilte
//   SKADE       når belastningen får lov til å bli stående for lenge
//
// Kjerneprinsippet holder: **dette sier ingenting om hvor god spilleren er.**
// En sliten spiller er ikke en dårlig spiller — han er en spiller manageren har
// brukt for hardt. Forklaringene skal alltid peke på bruken, aldri på mannen.
// Derfor leser motoren aldri `overall`, og form er tydelig midlertidig.
//
// Motoren er ren: ingen DOM, ingen lagring, ingen `Date.now`, ingen
// `Math.random` uten injisert rng.

export const CONDITION_VERSION = "player-condition.v1";

// Balansen her er viktigere enn den ser ut. Første forsøk ga FIRE skader etter
// to kamper — det straffer deg for å spille spillet, ikke for å bruke en mann
// for hardt. Tallene under er satt slik at:
//
//   · å spille en mann hver uke med normal trening er trygt en hel sesong,
//     men belastningen kryper sakte oppover
//   · restitusjonsuker henter inn mer enn en kamp koster
//   · pressuker på toppen av full spilletid er det som faktisk brenner ham ut
//   · skader er uvanlige selv da — de er en risiko, ikke en avgift
//
// Hvor mye belastning en full kamp gir. 90 minutter i en høyintens kampplan
// koster mer enn 90 rolige.
const LOAD_PER_FULL_MATCH = 22;

// Hvor mye en uke uten kamp tar bort. Restitusjonstrening tar mer, en pressuke
// mindre — treningsuka bestemmer selv.
const BASE_WEEKLY_RECOVERY = 18;

// Over dette begynner belastningen å koste på banen.
const TIRED_THRESHOLD = 50;

// Over dette blir skaderisikoen reell.
const INJURY_THRESHOLD = 70;

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round(num(value) * 10) / 10;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createCondition(playerId, name = "") {
  return {
    playerId: str(playerId),
    name: str(name),
    load: 0,
    form: 0,
    matchesPlayed: 0,
    minutesPlayed: 0,
    // Kamper på rad med full spilletid. Det er DETTE som forklarer slitasjen
    // for manageren — ikke et abstrakt tall.
    consecutiveFullMatches: 0,
    injury: null
  };
}

function ensure(map, playerId, name) {
  if (!map.has(playerId)) map.set(playerId, createCondition(playerId, name));
  const entry = map.get(playerId);
  if (name && !entry.name) entry.name = name;
  return entry;
}

function toMap(conditions) {
  const map = new Map();
  asArray(conditions).forEach((entry) => {
    if (entry?.playerId) map.set(entry.playerId, { ...entry, injury: entry.injury ? { ...entry.injury } : null });
  });
  return map;
}

// ---------------------------------------------------------------------------
// Lesninger
// ---------------------------------------------------------------------------

// Friskhet: 100 er uthvilt, 0 er kjørt i senk. Dette er tallet som faktisk
// virker inn på banen.
export function freshnessFor(condition) {
  return clamp(Math.round(100 - num(condition?.load)), 0, 100);
}

// Er spilleren skadet akkurat nå?
export function isInjured(condition) {
  return num(condition?.injury?.weeksOut) > 0;
}

// Hva slitasjen gjør med bidraget på banen. Under terskelen er den null — en
// spiller som har hvilt skal ikke straffes for å ha spilt i det hele tatt.
// Over terskelen faller den jevnt, aldri under 0.78: en sliten spiller er
// fortsatt en spiller, ikke en passasjer.
export function fatigueFactorFor(condition) {
  const load = num(condition?.load);
  if (load <= TIRED_THRESHOLD) return 1;
  return round2(clamp(1 - ((load - TIRED_THRESHOLD) / 55) * 0.22, 0.78, 1));
}

function round2(value) {
  return Math.round(num(value) * 100) / 100;
}

// Formen er midlertidig og forklares som det. −3 til +3.
export function formLabelFor(condition) {
  const form = num(condition?.form);
  if (form >= 2) return "i storform";
  if (form >= 0.8) return "i god form";
  if (form <= -2) return "i formkrise";
  if (form <= -0.8) return "i svak form";
  return "i normal form";
}

// Én lesbar setning. Peker alltid på BRUKEN, aldri på spilleren.
export function describeCondition(condition) {
  if (isInjured(condition)) {
    const weeks = num(condition.injury.weeksOut);
    return `Skadet — ute ${weeks} ${weeks === 1 ? "uke" : "uker"} (${condition.injury.reason}).`;
  }
  const fresh = freshnessFor(condition);
  const runs = num(condition?.consecutiveFullMatches);
  if (fresh < 45) {
    return `Kjørt hardt: ${runs} fulle kamper på rad. Friskhet ${fresh} — han trenger avlastning, ikke en ny 90-er.`;
  }
  if (fresh < 70) {
    return `Begynner å kjenne det: friskhet ${fresh}, ${formLabelFor(condition)}.`;
  }
  return `Frisk (${fresh}), ${formLabelFor(condition)}.`;
}

// ---------------------------------------------------------------------------
// Etter kampen: belastning, form og skaderisiko
// ---------------------------------------------------------------------------

// `played` er alle som var på banen, med minuttene sine (fra
// `playedPlayersFor`). Intensiteten kommer fra kampplanen: et høyt press koster
// mer enn en lav blokk.
export function applyMatchLoad(conditions, { played, intensity = 1 } = {}) {
  const map = toMap(conditions);
  const factor = clamp(num(intensity, 1), 0.6, 1.6);

  asArray(played).forEach((entry) => {
    if (!entry?.playerId) return;
    const condition = ensure(map, entry.playerId, entry.name);
    const minutes = clamp(num(entry.minutes), 0, 120);
    const share = minutes / 90;
    condition.load = round1(clamp(condition.load + share * LOAD_PER_FULL_MATCH * factor, 0, 100));
    condition.matchesPlayed += 1;
    condition.minutesPlayed += minutes;
    condition.consecutiveFullMatches = minutes >= 80 ? condition.consecutiveFullMatches + 1 : 0;
  });

  return [...map.values()];
}

// Formen følger kampene spilleren FAKTISK spilte: laget vant eller tapte, og
// bidro han selv? Den beveger seg tregt og trekkes alltid mot null, slik at et
// blaff verken lager en helt eller en fiasko.
export function applyMatchForm(conditions, { played, goals = [], outcome = "draw" } = {}) {
  const map = toMap(conditions);
  const scorers = new Map();
  asArray(goals).forEach((goal) => {
    if (goal?.scorerId) scorers.set(goal.scorerId, (scorers.get(goal.scorerId) || 0) + 1);
    if (goal?.assistId) scorers.set(goal.assistId, (scorers.get(goal.assistId) || 0) + 0.6);
  });

  const teamSwing = outcome === "win" ? 0.45 : outcome === "loss" ? -0.4 : 0;

  asArray(played).forEach((entry) => {
    if (!entry?.playerId) return;
    const condition = ensure(map, entry.playerId, entry.name);
    // Spilte han lite, teller kampen mindre for formen hans.
    const weight = clamp(num(entry.minutes) / 90, 0.2, 1);
    const own = clamp(num(scorers.get(entry.playerId)) * 0.7, 0, 1.6);
    // Trekk mot null: form er midlertidig, ikke en egenskap.
    const decayed = condition.form * 0.82;
    condition.form = round2(clamp(decayed + (teamSwing + own) * weight, -3, 3));
  });

  return [...map.values()];
}

// Skader kommer ikke ut av intet: de kommer når belastningen har fått stå. Jo
// høyere belastning og jo flere fulle kamper på rad, jo større sjanse.
// Deterministisk med injisert rng, så simuleringene kan kjøre den.
//
// Bare spillere som nettopp spilte kan pådra seg en skade — ingen blir skadet
// på benken.
export function rollInjuries(conditions, { played, rng = Math.random } = {}) {
  const map = toMap(conditions);
  const playedIds = new Set(asArray(played).map((entry) => entry?.playerId).filter(Boolean));

  map.forEach((condition) => {
    if (!playedIds.has(condition.playerId) || isInjured(condition)) return;
    const load = num(condition.load);
    if (load < INJURY_THRESHOLD) return;

    // Selv en helt utkjørt spiller har rundt 10 % risiko i én kamp. Skader skal
    // være noe som RAMMER deg, ikke noe som skjer hver gang du spiller de beste.
    const over = (load - INJURY_THRESHOLD) / (100 - INJURY_THRESHOLD);
    const streak = clamp(num(condition.consecutiveFullMatches) / 8, 0, 1);
    const chance = clamp(over * 0.07 + streak * 0.05, 0, 0.1);
    if (rng() >= chance) return;

    const weeksOut = load >= 90 ? 3 : load >= 80 ? 2 : 1;
    condition.injury = {
      weeksOut,
      reason: `${condition.consecutiveFullMatches} fulle kamper på rad uten avlastning`
    };
  });

  return [...map.values()];
}

// Hele etterkamp-steget i ett: belastning, form og skaderisiko, i den
// rekkefølgen. Skaderisikoen leser belastningen kampen nettopp la på.
export function applyMatchToConditions(conditions, { played, goals, outcome, intensity, rng } = {}) {
  let next = applyMatchLoad(conditions, { played, intensity });
  next = applyMatchForm(next, { played, goals, outcome });
  return rollInjuries(next, { played, rng });
}

// ---------------------------------------------------------------------------
// Uka etter: hvile
// ---------------------------------------------------------------------------

// En uke uten kamp tar belastning bort — hvor mye avhenger av treningsuka du
// valgte. Restitusjon henter mer, en pressuke mindre. Skader teller ned her, og
// bare her: tid går i uker, ikke i kamper.
export function applyWeeklyRecovery(conditions, { trainingIntensity = 1 } = {}) {
  const map = toMap(conditions);
  const factor = clamp(2 - clamp(num(trainingIntensity, 1), 0.5, 1.6), 0.4, 1.5);

  map.forEach((condition) => {
    condition.load = round1(clamp(condition.load - BASE_WEEKLY_RECOVERY * factor, 0, 100));
    if (isInjured(condition)) {
      const weeksOut = num(condition.injury.weeksOut) - 1;
      condition.injury = weeksOut > 0 ? { ...condition.injury, weeksOut } : null;
      // Tilbake fra skade betyr ikke tilbake i toppform.
      if (!condition.injury) condition.form = round2(clamp(condition.form - 0.4, -3, 3));
    }
  });

  return [...map.values()];
}

// Sommerferie: mellom to sesonger hviler laget ordentlig. Belastningen nulles,
// skader gror ferdig, og formen faller tilbake mot normalen — en ny sesong
// starter ikke der forrige sluttet.
//
// Uten dette startet sesong 2 med den samme utkjørte troppen som avsluttet
// sesong 1, som om sommeren ikke fantes.
export function applySummerBreak(conditions) {
  return asArray(conditions).map((entry) => ({
    ...entry,
    load: 0,
    consecutiveFullMatches: 0,
    // Formen er midlertidig og skal ikke bæres over et helt opphold — men den
    // nulles heller ikke helt: en spiller i storform kommer tilbake med noe.
    form: round2(num(entry?.form) * 0.35),
    matchesPlayed: 0,
    minutesPlayed: 0,
    injury: null
  }));
}

// ---------------------------------------------------------------------------
// Oppslag for resten av spillet
// ---------------------------------------------------------------------------

export function conditionFor(conditions, playerId) {
  return asArray(conditions).find((entry) => entry?.playerId === playerId) || createCondition(playerId);
}

export function injuredPlayerIds(conditions) {
  return new Set(asArray(conditions).filter((entry) => isInjured(entry)).map((entry) => entry.playerId));
}

// Hvem bør hviles? Rådgiving, ikke automatikk — manageren velger fortsatt selv.
// Sorteres på hvem som har mest å tjene på hvile.
export function playersNeedingRest(conditions, { threshold = TIRED_THRESHOLD } = {}) {
  return asArray(conditions)
    .filter((entry) => !isInjured(entry) && num(entry.load) > threshold)
    .sort((a, b) => num(b.load) - num(a.load))
    .map((entry) => ({
      playerId: entry.playerId,
      name: entry.name,
      freshness: freshnessFor(entry),
      consecutiveFullMatches: num(entry.consecutiveFullMatches),
      advice: describeCondition(entry)
    }));
}

// Kort sammendrag til troppsflata.
export function summarizeSquadCondition(conditions) {
  const list = asArray(conditions);
  const injured = list.filter((entry) => isInjured(entry));
  const tired = list.filter((entry) => !isInjured(entry) && num(entry.load) > TIRED_THRESHOLD);
  const freshest = [...list].filter((entry) => !isInjured(entry)).sort((a, b) => num(a.load) - num(b.load))[0] || null;
  return {
    tracked: list.length,
    injuredCount: injured.length,
    tiredCount: tired.length,
    injured: injured.map((entry) => ({ playerId: entry.playerId, name: entry.name, weeksOut: num(entry.injury.weeksOut) })),
    freshest: freshest ? { playerId: freshest.playerId, name: freshest.name, freshness: freshnessFor(freshest) } : null
  };
}
