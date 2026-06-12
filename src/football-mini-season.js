// src/football-mini-season.js
//
// Mini Season v0.1: en lett, lokal 5-kampers prøvesesong oppå eksisterende
// Club Week og Kampdag v0.2. Ren beregningsmodul — ingen DOM, fetch eller
// localStorage. app.js eier all lagring (hgfm.miniSeason.v1), motstanderplanen
// bruker de eksisterende motstanderprofilene fra kampmotoren, og resultatene
// kommer fra fullførte Kampdag v0.2-kamper.
//
// Ingen liga, tabell, 20 lag, overgangsmarked, økonomi, kontrakter, kalender
// eller ny kamp-/Club Week-/unlockmotor — bare en kort prøveperiode med små
// styremål og en sluttvurdering etter 5 kamper.

export const MINI_SEASON_TOTAL_MATCHES = 5;

// Poengmodellen: seier 3, uavgjort 1, tap 0.
export const MINI_SEASON_POINTS = { win: 3, draw: 1, loss: 0 };

export const MINI_SEASON_OUTCOME_LABELS = {
  win: "Seier",
  draw: "Uavgjort",
  loss: "Tap"
};

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// ----------------------------------------------------------------------------
// A/E. Sesongstate og styremål.
// ----------------------------------------------------------------------------

// 2–3 enkle styremål satt ved sesongstart. Bevisst lite: ingen objective
// engine, bare faste mål som evalueres mot resultater og Club Week-verdier.
function createMiniSeasonObjectives() {
  return [
    { id: "points_7", label: "Ta minst 7 poeng på 5 kamper." },
    { id: "board_trust_40", label: "Hold styretilliten på minst 40." },
    { id: "positive_decisions", label: "Vinn beslutningssummen i minst én kamp." }
  ];
}

// Oppretter en ny mini-sesong fra en ferdig motstanderplan (5 profil-id-er fra
// OPPONENT_PROFILES). Rekkefølgen lagres slik at reload aldri endrer planen.
// Returnerer null hvis planen ikke holder 5 gyldige id-er.
export function createMiniSeason({ opponentIds = [] } = {}) {
  const plan = asArray(opponentIds)
    .filter((id) => typeof id === "string" && id.length > 0)
    .slice(0, MINI_SEASON_TOTAL_MATCHES);

  if (plan.length < MINI_SEASON_TOTAL_MATCHES) {
    return null;
  }

  return {
    version: 1,
    seasonId: `mini-season-${Date.now()}`,
    status: "active",
    currentMatchIndex: 0,
    totalMatches: MINI_SEASON_TOTAL_MATCHES,
    plan,
    results: [],
    objectives: createMiniSeasonObjectives(),
    finalVerdict: null,
    startedAt: new Date().toISOString(),
    completedAt: null
  };
}

// Minimal strukturell validering av et registrert kampresultat.
function sanitizeMiniSeasonResult(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }
  if (typeof entry.matchId !== "string" || entry.matchId.length === 0) {
    return null;
  }
  const outcome = ["win", "draw", "loss"].includes(entry.outcome) ? entry.outcome : "draw";
  return { ...entry, outcome };
}

// Validerer/normaliserer en lagret mini-sesong fra localStorage. Returnerer
// alltid en konsistent state eller null — aldri en runtime-feil. Tåler korrupt
// JSON-struktur, manglende felter og reload midt i perioden:
//   - currentMatchIndex utledes alltid av antall gyldige resultater,
//   - 5 resultater gir alltid status completed.
export function sanitizeMiniSeason(stored) {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return null;
  }
  if (!["not_started", "active", "completed"].includes(stored.status)) {
    return null;
  }

  const plan = asArray(stored.plan).filter((id) => typeof id === "string" && id.length > 0);
  if (plan.length !== MINI_SEASON_TOTAL_MATCHES) {
    return null;
  }

  // Dedupliser på matchId slik at en korrupt/dobbel lagring aldri teller en
  // kamp to ganger.
  const seenMatchIds = new Set();
  const results = [];
  asArray(stored.results).forEach((entry) => {
    const sanitized = sanitizeMiniSeasonResult(entry);
    if (sanitized && !seenMatchIds.has(sanitized.matchId)) {
      seenMatchIds.add(sanitized.matchId);
      results.push(sanitized);
    }
  });
  const cappedResults = results.slice(0, MINI_SEASON_TOTAL_MATCHES);

  const completed = cappedResults.length >= MINI_SEASON_TOTAL_MATCHES;

  return {
    version: 1,
    seasonId: typeof stored.seasonId === "string" && stored.seasonId ? stored.seasonId : `mini-season-${Date.now()}`,
    status: completed ? "completed" : stored.status === "not_started" ? "not_started" : "active",
    currentMatchIndex: Math.min(cappedResults.length, MINI_SEASON_TOTAL_MATCHES),
    totalMatches: MINI_SEASON_TOTAL_MATCHES,
    plan,
    results: cappedResults,
    objectives: asArray(stored.objectives).length > 0 ? asArray(stored.objectives) : createMiniSeasonObjectives(),
    finalVerdict:
      stored.finalVerdict && typeof stored.finalVerdict === "object" && !Array.isArray(stored.finalVerdict)
        ? stored.finalVerdict
        : null,
    startedAt: typeof stored.startedAt === "string" ? stored.startedAt : null,
    completedAt: typeof stored.completedAt === "string" ? stored.completedAt : null
  };
}

// ----------------------------------------------------------------------------
// C. Motstanderplan: neste motstander i den lagrede rekkefølgen.
// ----------------------------------------------------------------------------

export function getNextMiniSeasonOpponentId(miniSeason) {
  if (!miniSeason || miniSeason.status !== "active") {
    return null;
  }
  const index = num(miniSeason.currentMatchIndex);
  const plan = asArray(miniSeason.plan);
  if (index < 0 || index >= Math.min(plan.length, MINI_SEASON_TOTAL_MATCHES)) {
    return null;
  }
  return plan[index] || null;
}

// ----------------------------------------------------------------------------
// D. Resultatregistrering med matchId som idempotensnøkkel.
// ----------------------------------------------------------------------------

// Registrerer ett fullført kampresultat i mini-sesongen. Muterer miniSeason
// (app.js eier lagringen) og returnerer { changed, completed }:
//   - changed=false hvis sesongen ikke er aktiv, entry er ugyldig eller
//     matchId allerede er registrert (reload/dobbeltkall gir aldri dobbelt),
//   - completed=true første gang femte kamp registreres.
export function registerMiniSeasonResult(miniSeason, entry) {
  if (!miniSeason || miniSeason.status !== "active") {
    return { changed: false, completed: false };
  }

  const sanitized = sanitizeMiniSeasonResult(entry);
  if (!sanitized) {
    return { changed: false, completed: false };
  }

  if (!Array.isArray(miniSeason.results)) {
    miniSeason.results = [];
  }

  if (miniSeason.results.some((result) => result.matchId === sanitized.matchId)) {
    return { changed: false, completed: false };
  }
  if (miniSeason.results.length >= MINI_SEASON_TOTAL_MATCHES) {
    return { changed: false, completed: false };
  }

  miniSeason.results.push(sanitized);
  miniSeason.currentMatchIndex = Math.min(miniSeason.results.length, MINI_SEASON_TOTAL_MATCHES);

  const completed = miniSeason.results.length >= MINI_SEASON_TOTAL_MATCHES;
  if (completed) {
    miniSeason.status = "completed";
    miniSeason.completedAt = new Date().toISOString();
  }

  return { changed: true, completed };
}

// Poengsum for spilte kamper: seier 3, uavgjort 1, tap 0.
export function calculateMiniSeasonPoints(results) {
  return asArray(results).reduce((sum, result) => sum + (MINI_SEASON_POINTS[result?.outcome] ?? 0), 0);
}

// ----------------------------------------------------------------------------
// E. Styremål-evaluering mot resultater og gjeldende Club Week-verdier.
// ----------------------------------------------------------------------------

// Evaluerer styremålene. Returnerer [{ id, label, achieved, status }] der
// status er en kort norsk fremdriftstekst. Kan kalles både underveis (live
// status i panelet) og ved sluttvurdering.
export function evaluateMiniSeasonObjectives({ miniSeason, clubWeekState = null } = {}) {
  if (!miniSeason) {
    return [];
  }

  const results = asArray(miniSeason.results);
  const points = calculateMiniSeasonPoints(results);
  const boardTrust = Number.isFinite(Number(clubWeekState?.boardTrust))
    ? Number(clubWeekState.boardTrust)
    : null;
  const positiveDecisionMatches = results.filter((result) => num(result.decisionScore) > 0).length;

  return asArray(miniSeason.objectives).map((objective) => {
    const id = objective?.id;
    if (id === "points_7") {
      return {
        id,
        label: objective.label,
        achieved: points >= 7,
        status: `${points} av 7 poeng.`
      };
    }
    if (id === "board_trust_40") {
      return {
        id,
        label: objective.label,
        achieved: boardTrust === null ? true : boardTrust >= 40,
        status: boardTrust === null ? "Styretillit ukjent." : `Styretillit nå: ${boardTrust}.`
      };
    }
    if (id === "positive_decisions") {
      return {
        id,
        label: objective.label,
        achieved: positiveDecisionMatches >= 1,
        status:
          positiveDecisionMatches >= 1
            ? `${positiveDecisionMatches} kamp${positiveDecisionMatches === 1 ? "" : "er"} med positiv beslutningssum.`
            : "Ingen kamp med positiv beslutningssum ennå."
      };
    }
    return {
      id: id || "unknown",
      label: objective?.label || "Ukjent mål.",
      achieved: false,
      status: ""
    };
  });
}

// ----------------------------------------------------------------------------
// F. Sluttvurdering etter 5 kamper: trusted / pressure / failed.
// ----------------------------------------------------------------------------

const VERDICT_CONTENT = {
  trusted: {
    label: "Styret gir tillit",
    headline: "Styret gir deg tillit etter prøveperioden.",
    recommendation: "Anbefalt neste steg: fortsett med systemet ditt — laget er klart for en lengre periode."
  },
  pressure: {
    label: "Fortsetter under press",
    headline: "Styret gir deg mer tid, men du fortsetter under press.",
    recommendation:
      "Anbefalt neste steg: stabiliser klubbverdiene gjennom klubbukene og hent flere poeng i neste prøveperiode."
  },
  failed: {
    label: "Prøveperioden feilet",
    headline: "Prøveperioden overbeviste ikke styret.",
    recommendation:
      "Anbefalt neste steg: nullstill prøveperioden, juster system og laguttak, og prøv igjen med en ny 5-kampers periode."
  }
};

// Beregner sluttvurderingen fra poeng, Club Week-verdier og styremålene.
// Liten, lesbar modell: poeng (0-15) + oppnådde mål (0-3) + små klubbjusteringer.
export function computeMiniSeasonVerdict({ miniSeason, clubWeekState = null } = {}) {
  if (!miniSeason) {
    return null;
  }

  const results = asArray(miniSeason.results);
  const points = calculateMiniSeasonPoints(results);
  const wins = results.filter((result) => result.outcome === "win").length;
  const objectives = evaluateMiniSeasonObjectives({ miniSeason, clubWeekState });
  const objectivesAchieved = objectives.filter((objective) => objective.achieved).length;

  const boardTrust = num(clubWeekState?.boardTrust) || 50;
  const playerMorale = num(clubWeekState?.playerMorale) || 50;
  const tacticalClarity = num(clubWeekState?.tacticalClarity) || 50;
  const mediaPressure = num(clubWeekState?.mediaPressure) || 50;

  let score = points + objectivesAchieved;
  if (boardTrust >= 55) {
    score += 2;
  } else if (boardTrust < 40) {
    score -= 3;
  }
  if (playerMorale >= 55) {
    score += 1;
  } else if (playerMorale < 40) {
    score -= 1;
  }
  if (tacticalClarity >= 55) {
    score += 1;
  } else if (tacticalClarity < 40) {
    score -= 1;
  }
  if (mediaPressure >= 65) {
    score -= 1;
  }

  let verdict = "pressure";
  if (score >= 12 && boardTrust >= 45) {
    verdict = "trusted";
  } else if (score <= 5 || boardTrust < 35) {
    verdict = "failed";
  }

  const content = VERDICT_CONTENT[verdict];

  const detailParts = [
    `${points} poeng på ${results.length} kamper (${wins} seier${wins === 1 ? "" : "e"}).`,
    `${objectivesAchieved} av ${objectives.length} styremål nådd.`
  ];
  if (verdict === "trusted") {
    detailParts.push("Resultater og klubbtilstand viser at laget er på rett vei.");
  } else if (verdict === "pressure") {
    detailParts.push("Resultatene er ujevne, men laget viser nok utvikling til å fortsette.");
  } else {
    detailParts.push("Verken resultatene eller klubbtilstanden holdt styrets minimumskrav.");
  }

  return {
    verdict,
    label: content.label,
    headline: content.headline,
    detail: detailParts.join(" "),
    recommendation: content.recommendation,
    points,
    objectivesAchieved,
    objectivesTotal: objectives.length,
    decidedAt: new Date().toISOString()
  };
}
