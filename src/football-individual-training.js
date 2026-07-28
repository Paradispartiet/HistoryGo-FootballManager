// ============================================================================
// Individuell trening v1
//
// > Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
//
// Lagsøkta gjelder alle elleve like mye. Individuell trening er det motsatte:
// managerens arbeid med ÉN spiller. Og nettopp derfor må den holde seg strengt
// unna det som ville gjort dette til et ratingspill — ingen av sporene rører
// `overall`, `matchScore` eller fit-motoren. De gjør fire helt andre ting:
//
//   ROLLETRENING      spilleren forstår en rolle bedre (rollefortrolighet)
//   SVAKHETSTRENING   en av hans identifiserte svake sider bearbeides
//   EGEN RESTITUSJON  belastningen hentes inn raskere
//   SKARPHET          formen løftes litt — midlertidig, som all form
//   OPPTRENING        en skadet mann kommer raskere tilbake
//
// Ingen av dem gjør spilleren *bedre*. De gjør at han passer bedre til det du
// har tenkt å bruke ham til, eller at kroppen tåler det du har tenkt å be om.
// Det er den samme setningen som hele spillet hviler på.
//
// Kapasiteten er begrenset (1 + stab, maks 5), så individuell trening er en
// prioritering: hvem er det VIKTIGST at du følger opp denne uka? Men den er
// aldri null — du kan alltid følge opp minst én spiller, ellers ville flata
// vært en blindvei for en manager uten stab.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random. Katalogen
// kommer inn som data (data/football_individual_training.json) — motoren
// hardkoder ikke et eneste spor.
// ============================================================================

export const INDIVIDUAL_TRAINING_VERSION = "individual-training.v1";

// Trygg fallback-kapasitet hvis katalogen mangler feltet. Én plass alltid.
const DEFAULT_CAPACITY = Object.freeze({ base: 1, perStaffMember: 1, max: 5 });

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

// Normaliser den innlastede JSON-katalogen defensivt. Ugyldige spor droppes i
// stedet for å velte flata; en tom katalog gir en tom, men gyldig, struktur.
export function normalizeIndividualTrainingCatalogue(data) {
  const rawCapacity = data && typeof data.capacity === "object" && data.capacity ? data.capacity : {};
  const capacity = {
    base: clamp(Math.trunc(num(rawCapacity.base, DEFAULT_CAPACITY.base)), 1, 5),
    perStaffMember: clamp(num(rawCapacity.perStaffMember, DEFAULT_CAPACITY.perStaffMember), 0, 2),
    max: clamp(Math.trunc(num(rawCapacity.max, DEFAULT_CAPACITY.max)), 1, 11),
    note: str(rawCapacity.note)
  };
  if (capacity.max < capacity.base) capacity.max = capacity.base;

  const tracks = asArray(data?.tracks)
    .filter((track) => track && typeof track === "object" && str(track.id) && str(track.name))
    .map((track) => Object.freeze({
      id: str(track.id),
      name: str(track.name),
      shortDescription: str(track.shortDescription),
      managerNote: str(track.managerNote),
      requires: ["role", "weakness", "injured", "none"].includes(str(track.requires)) ? str(track.requires) : "none",
      familiarityGrowth: clamp(num(track.familiarityGrowth), 0, 20),
      loadDelta: clamp(num(track.loadDelta), -30, 15),
      formDelta: clamp(num(track.formDelta), -1, 1),
      rehabWeeks: clamp(Math.trunc(num(track.rehabWeeks)), 0, 3),
      relatedStaffTypes: Object.freeze(asArray(track.relatedStaffTypes).map(str).filter(Boolean)),
      effectText: str(track.effectText),
      riskText: str(track.riskText)
    }));

  return Object.freeze({ version: INDIVIDUAL_TRAINING_VERSION, capacity: Object.freeze(capacity), tracks: Object.freeze(tracks) });
}

export function getIndividualTrack(catalogue, trackId) {
  return asArray(catalogue?.tracks).find((track) => track.id === str(trackId)) || null;
}

// Hvor mange spillere du kan følge opp denne uka. Stab er argumentet: hver
// relevant trener gir én plass til. `staffCategories` er kategoriene til aktiv
// stab (samme form som coachContext.activeStaff[].category).
export function calculateIndividualCapacity(catalogue, { staffCategories = [] } = {}) {
  const capacity = catalogue?.capacity || DEFAULT_CAPACITY;
  const relevant = new Set(asArray(catalogue?.tracks).flatMap((track) => asArray(track.relatedStaffTypes)));
  const matching = asArray(staffCategories).map(str).filter((category) => relevant.has(category));
  const slots = num(capacity.base, 1) + matching.length * num(capacity.perStaffMember, 1);
  return clamp(Math.round(slots), num(capacity.base, 1), num(capacity.max, 5));
}

// ---------------------------------------------------------------------------
// Tildelinger
// ---------------------------------------------------------------------------

// Saner lagrede tildelinger: én per spiller, kun kjente spor, rolle kun der
// sporet krever det. Kapper på kapasiteten, slik at en lagret uke fra da du
// hadde mer stab ikke gir gratis plasser i dag.
export function sanitizeIndividualAssignments(value, { catalogue, capacity = 5, week = null } = {}) {
  const seen = new Set();
  const result = [];
  for (const entry of asArray(value)) {
    if (!entry || typeof entry !== "object") continue;
    const playerId = str(entry.playerId);
    const track = getIndividualTrack(catalogue, entry.trackId);
    if (!playerId || !track || seen.has(playerId)) continue;
    const roleId = track.requires === "role" ? str(entry.roleId) : "";
    if (track.requires === "role" && !roleId) continue;
    const attributeId = track.requires === "weakness" ? str(entry.attributeId) : "";
    if (track.requires === "weakness" && !attributeId) continue;
    seen.add(playerId);
    result.push({ playerId, trackId: track.id, roleId: roleId || null, attributeId: attributeId || null });
    if (result.length >= clamp(Math.trunc(num(capacity, 5)), 1, 11)) break;
  }
  if (Number.isInteger(week)) return { week, assignments: result };
  return { week: null, assignments: result };
}

// Kan denne spilleren settes på dette sporet? Returnerer alltid en forklaring —
// et «nei» uten grunn ville vært en blindvei.
// `weaknesses` er spillerens identifiserte svake sider (fra
// football-player-weaknesses.js). Svakhetstrening godtas bare mot én av dem —
// du kan ikke trene bort noe han ikke sliter med.
export function evaluateIndividualAssignment({ track, player, condition, roleId = null, attributeId = null, weaknesses = [] } = {}) {
  if (!track) return { valid: false, reason: "Ukjent treningsspor." };
  if (!player || !str(player.id)) return { valid: false, reason: "Ingen spiller valgt." };

  const injured = Boolean(condition?.injury);
  if (track.requires === "injured" && !injured) {
    return { valid: false, reason: `${player.name || "Spilleren"} er ikke skadet — opptrening er for dem som er ute.` };
  }
  if (track.requires !== "injured" && injured) {
    return { valid: false, reason: `${player.name || "Spilleren"} er skadet. Opptrening er det eneste sporet som gir mening nå.` };
  }
  if (track.requires === "role" && !str(roleId)) {
    return { valid: false, reason: "Rolletrening krever at du velger hvilken rolle han skal lære." };
  }
  if (track.requires === "weakness") {
    const list = asArray(weaknesses);
    if (list.length === 0) {
      return { valid: false, reason: `${player.name || "Spilleren"} har ingen svake sider innenfor rekkevidde å jobbe med.` };
    }
    if (!str(attributeId)) {
      return { valid: false, reason: "Velg hvilken svak side han skal jobbe med." };
    }
    if (!list.some((weakness) => str(weakness?.attributeId) === str(attributeId))) {
      return { valid: false, reason: "Dette er ikke en av hans svake sider — det er ingenting å hente der." };
    }
  }

  return { valid: true, reason: track.effectText || "" };
}

// ---------------------------------------------------------------------------
// Uka gjøres opp
// ---------------------------------------------------------------------------

// Hvor godt staben støtter et spor. Samme form som treningsukas staff-støtte:
// ingen støtte gir fortsatt effekt, men mindre. Å bygge stab skal merkes.
export function individualStaffSupport(track, staffCategories = []) {
  const related = new Set(asArray(track?.relatedStaffTypes));
  const matched = [...new Set(asArray(staffCategories).map(str).filter((category) => related.has(category)))];
  const factor = matched.length === 0 ? 0.7 : matched.length === 1 ? 1 : 1.25;
  const label = matched.length === 0 ? "Svak" : matched.length === 1 ? "Middels" : "Sterk";
  return { matched, factor, label };
}

// Regn ut hva uka gir. Returnerer effekter som DATA — belastning/form/skade
// anvendes av football-player-condition.js, rollefortrolighet av
// football-role-familiarity-engine.js. Denne motoren eier ingen av de statene.
//
// `playsRoleThisWeek` er et oppslag playerId → roleId (startelleveren). Å trene
// rollen han faktisk skal spille gir full uttelling; å trene en rolle han ikke
// bruker gir mindre — det er læring uten repetisjon i kamp.
export function resolveIndividualTrainingWeek({
  catalogue,
  assignments = [],
  playersById = {},
  conditionsById = {},
  staffCategories = [],
  playsRoleThisWeek = {},
  weaknessesByPlayerId = {}
} = {}) {
  const loadDeltas = {};
  const formDeltas = {};
  const rehabWeeks = {};
  const familiarityGains = [];
  // Svakhetstrening gir MÅL, ikke tall: hvor fort en svak side flytter seg eies
  // av football-player-weaknesses.js (vanskelighetsgrad per attributt). Samme
  // arbeidsdeling som for belastning og fortrolighet.
  const weaknessTargets = [];
  const reports = [];

  for (const assignment of asArray(assignments)) {
    const track = getIndividualTrack(catalogue, assignment?.trackId);
    const playerId = str(assignment?.playerId);
    if (!track || !playerId) continue;

    const player = playersById[playerId] || { id: playerId, name: playerId };
    const condition = conditionsById[playerId] || null;
    const check = evaluateIndividualAssignment({
      track,
      player,
      condition,
      roleId: assignment.roleId,
      attributeId: assignment.attributeId,
      weaknesses: weaknessesByPlayerId[playerId]
    });
    if (!check.valid) {
      reports.push({
        playerId,
        playerName: str(player.name) || playerId,
        trackId: track.id,
        trackName: track.name,
        applied: false,
        headline: `${str(player.name) || playerId}: ikke gjennomført`,
        explanation: [check.reason]
      });
      continue;
    }

    const support = individualStaffSupport(track, staffCategories);
    const explanation = [];

    if (track.loadDelta !== 0) {
      const delta = Math.round(track.loadDelta * (track.loadDelta < 0 ? support.factor : 1) * 10) / 10;
      loadDeltas[playerId] = (loadDeltas[playerId] || 0) + delta;
      explanation.push(delta < 0
        ? `Belastning ${delta} — ${track.effectText}`
        : `Belastning +${delta} — økta koster bein.`);
    }
    if (track.formDelta !== 0) {
      const delta = Math.round(track.formDelta * support.factor * 100) / 100;
      formDeltas[playerId] = (formDeltas[playerId] || 0) + delta;
      explanation.push(`Form ${delta > 0 ? "+" : ""}${delta} — ${track.effectText}`);
    }
    if (track.rehabWeeks > 0) {
      rehabWeeks[playerId] = (rehabWeeks[playerId] || 0) + track.rehabWeeks;
      explanation.push(`Skaden korter ned med ${track.rehabWeeks} uke.`);
    }
    if (track.familiarityGrowth > 0 && assignment.roleId) {
      // Trener han rollen han faktisk skal spille? Da fester læringen seg.
      const usesRole = str(playsRoleThisWeek[playerId]) === str(assignment.roleId);
      const growth = Math.round(track.familiarityGrowth * support.factor * (usesRole ? 1 : 0.6));
      familiarityGains.push({ playerId, roleId: assignment.roleId, growth });
      explanation.push(usesRole
        ? `Rollefortrolighet +${growth} — og han spiller rollen på lørdag, så den festes.`
        : `Rollefortrolighet +${growth} — han spiller ikke rollen denne uka, så læringen fester seg saktere.`);
    }

    if (track.requires === "weakness" && assignment.attributeId) {
      const weakness = asArray(weaknessesByPlayerId[playerId])
        .find((entry) => str(entry?.attributeId) === str(assignment.attributeId)) || null;
      weaknessTargets.push({ playerId, attributeId: assignment.attributeId, staffFactor: support.factor });
      explanation.push(weakness
        ? `Jobber med «${weakness.label.toLowerCase()}». ${weakness.note || ""}`.trim()
        : "Jobber med en av hans svake sider.");
      explanation.push("Dette gjør ham ikke bedre — det åpner rollene som krever det. Uttellingen kommer når du bruker ham der.");
    }

    explanation.push(`Stabsstøtte: ${support.label.toLowerCase()}. ${track.managerNote}`);

    reports.push({
      playerId,
      playerName: str(player.name) || playerId,
      trackId: track.id,
      trackName: track.name,
      roleId: assignment.roleId || null,
      attributeId: assignment.attributeId || null,
      applied: true,
      staffSupport: support.label,
      headline: `${str(player.name) || playerId}: ${track.name}`,
      explanation
    });
  }

  return { loadDeltas, formDeltas, rehabWeeks, familiarityGains, weaknessTargets, reports };
}

// Kort oppsummering til flata. Sier alltid hvor mange plasser du har igjen —
// en tom plass er en mulighet du ikke har brukt, ikke en feil.
export function summarizeIndividualTraining({ catalogue, assignments = [], capacity = 1 } = {}) {
  const list = asArray(assignments);
  const used = list.length;
  const free = Math.max(0, num(capacity, 1) - used);
  const names = list
    .map((assignment) => getIndividualTrack(catalogue, assignment?.trackId)?.name)
    .filter(Boolean);

  if (used === 0) {
    return {
      used,
      free,
      capacity: num(capacity, 1),
      headline: `Ingen individuell oppfølging denne uka (${free} ${free === 1 ? "plass" : "plasser"} ledig).`,
      detail: "Lagsøkta treffer alle likt. Individuell trening er der du gjør noe med én spiller."
    };
  }
  return {
    used,
    free,
    capacity: num(capacity, 1),
    headline: `${used} av ${num(capacity, 1)} spillere følges opp individuelt.`,
    detail: [...new Set(names)].join(" · ")
  };
}
