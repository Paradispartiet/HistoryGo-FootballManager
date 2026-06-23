// ============================================================================
// Role Familiarity Engine v1
//
// Kjerneidé (tro mot designprinsippet): «Alle spillere er gode nok. Spørsmålet
// er om treneren forstår dem.» En spiller bygger FORTROLIGHET i en rolle ved å
// bli brukt RIKTIG der over tid — treneren (og spilleren) forstår rollen bedre
// kamp for kamp. Feilbruk bygger ikke forståelse; den forvitrer den.
//
// Dette er en additiv, forklart vekst-over-tid — IKKE en ny rating. Motoren
// rører ALDRI `overall`, `matchScore` eller den paritetstestede fit-motoren.
// Bonusen den gir er liten, klampet og alltid underordnet rolle-/posisjons-/
// taktikkfit — den avgjør aldri et utfall alene. Misbruk forklares fortsatt som
// en managerfeil, aldri som en spillersvakhet; her gir misbruk simpelthen ingen
// vekst (og litt forvitring), så poenget forsterkes.
//
// Ren ESM: ingen DOM, fetch, localStorage eller app-state. Deterministisk — lik
// input gir byte-identisk output. Tilstanden (et flatt oppslag spiller×rolle →
// 0–100) eies og persisteres av app.js i teamMerits, aldri i History
// Go-progresjonen.
// ============================================================================

export const ROLE_FAMILIARITY_VERSION = "history-go.role-familiarity.v1";
export const ROLE_FAMILIARITY_MAX = 100;

// Bonusen til kampdagens lagstyrke er bevisst liten (maks +5), på linje med
// lagklassebonusen. Kontinuitet i rollene belønnes — men aldri som hovedscore.
export const ROLE_FAMILIARITY_BONUS_CAP = 5;

// Vekst per kamp etter fit-status. Riktig bruk bygger forståelse; feilbruk
// forvitrer den litt. Verdiene er små så fortrolighet tar flere kamper å bygge.
const GROWTH_BY_STATUS = Object.freeze({
  perfekt: 9,
  god: 6,
  brukbar: 4,
  feilbrukt: -5
});

// Nivåterskler for lesbar etikett/forklaring i UI.
const LEVELS = [
  { min: 80, level: "mester", label: "Mester i rollen" },
  { min: 55, level: "etablert", label: "Etablert i rollen" },
  { min: 25, level: "i_utvikling", label: "I utvikling" },
  { min: 0, level: "ny", label: "Ny i rollen" }
];

function familiarityKey(playerId, roleId) {
  return `${playerId}::${roleId}`;
}

function clampValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(ROLE_FAMILIARITY_MAX, Math.round(n)));
}

// Normaliser et lagret oppslag defensivt: kun "<playerId>::<roleId>" → 0–100.
// Robust mot gamle/korrupte data (ugyldige nøkler/verdier droppes).
export function normalizeRoleFamiliarity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    if (typeof rawKey !== "string" || !rawKey.includes("::")) continue;
    const [playerId, roleId] = rawKey.split("::");
    if (!playerId || !roleId) continue;
    const n = Number(rawValue);
    if (Number.isFinite(n) && n > 0) {
      result[familiarityKey(playerId, roleId)] = clampValue(n);
    }
  }
  return result;
}

// Les fortrolighet for én spiller i én rolle (0–100).
export function getRoleFamiliarity(store, playerId, roleId) {
  if (!store || !playerId || !roleId) return 0;
  return clampValue(store[familiarityKey(playerId, roleId)] || 0);
}

// Registrer en spilt kamp: gitt hvilke spillere som spilte hvilke roller (og med
// hvilken fit-status), returner et NYTT, oppdatert oppslag. Muterer ikke
// inn-staten. `entries` = [{ playerId, roleId, status }].
export function recordMatchRoleUsage(store, entries) {
  const next = { ...normalizeRoleFamiliarity(store) };
  if (!Array.isArray(entries)) return next;

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const { playerId, roleId } = entry;
    if (!playerId || !roleId) continue;
    const growth = GROWTH_BY_STATUS[entry.status];
    if (!Number.isFinite(growth) || growth === 0) continue;
    const key = familiarityKey(playerId, roleId);
    next[key] = clampValue((next[key] || 0) + growth);
    // Rydd bort verdier som forvitret helt ned til 0 igjen.
    if (next[key] === 0) delete next[key];
  }
  return next;
}

// Lesbar nivåbeskrivelse for ett spiller×rolle-par.
export function describeRoleFamiliarity(value) {
  const v = clampValue(value);
  const level = LEVELS.find((entry) => v >= entry.min) || LEVELS[LEVELS.length - 1];
  let hint;
  if (level.level === "mester") {
    hint = "Spilleren kjenner rollen ut og inn etter mange riktige kamper her.";
  } else if (level.level === "etablert") {
    hint = "Spilleren har funnet seg godt til rette i rollen. Fortsett kontinuiteten.";
  } else if (level.level === "i_utvikling") {
    hint = "Forståelsen vokser. Flere kamper i samme rolle bygger den videre.";
  } else {
    hint = "Fersk i rollen. Riktig bruk over flere kamper bygger fortrolighet.";
  }
  return { value: v, level: level.level, label: level.label, hint };
}

// Oppsummer en hel startellever: gjennomsnittlig fortrolighet, antall etablerte
// vs. ferske, og en liten, klampet kampstyrke-bonus (0..ROLE_FAMILIARITY_BONUS_CAP)
// som belønner kontinuitet i rollene. `assignments` = [{ playerId, roleId }]
// (kun komplette par teller).
export function summarizeLineupFamiliarity(store, assignments) {
  const normalized = normalizeRoleFamiliarity(store);
  const pairs = (Array.isArray(assignments) ? assignments : []).filter(
    (item) => item && item.playerId && item.roleId
  );

  if (pairs.length === 0) {
    return { averageFamiliarity: 0, settledCount: 0, developingCount: 0, bonus: 0, perRole: [] };
  }

  const perRole = pairs.map((pair) => {
    const value = getRoleFamiliarity(normalized, pair.playerId, pair.roleId);
    return { playerId: pair.playerId, roleId: pair.roleId, ...describeRoleFamiliarity(value) };
  });

  const total = perRole.reduce((sum, item) => sum + item.value, 0);
  const averageFamiliarity = Math.round(total / perRole.length);
  const settledCount = perRole.filter((item) => item.value >= 55).length;
  const developingCount = perRole.filter((item) => item.value > 0 && item.value < 55).length;

  // Bonus skalerer med gjennomsnittlig fortrolighet, klampet til kapasiteten.
  // Avg 100 → +5, avg 60 → +3, avg 0 → +0. Liten og underordnet.
  const bonus = Math.max(
    0,
    Math.min(ROLE_FAMILIARITY_BONUS_CAP, Math.round((averageFamiliarity / ROLE_FAMILIARITY_MAX) * ROLE_FAMILIARITY_BONUS_CAP))
  );

  return { averageFamiliarity, settledCount, developingCount, bonus, perRole };
}
