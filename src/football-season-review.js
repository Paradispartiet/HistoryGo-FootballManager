// Sesongdom v1 — styret gjør opp regnskapet
//
// Ligasesongen KUNNE avsluttes: etter fjorten runder ble status «completed», en
// statuslinje sa hvem som ble seriemester, og en «Start ny sesong»-knapp dukket
// opp. Men styret hadde aldri en mening. Forventningen deres var en setning satt
// da klubben ble opprettet — «Styret vil se en tydelig klubbidentitet og et
// kampklart lag» — som ingen noen gang målte deg mot.
//
// Og sesong 2 startet som om sesong 1 aldri hadde skjedd: statistikken sto
// urørt, troppen var like sliten, og ingenting ble husket.
//
// Her får sesongen en slutt som betyr noe:
//
//   MÅL      styret setter en tabellplass, ikke en stemning
//   DOM      du nådde den, overgikk den, eller bommet
//   FØLGE    styretillit, og ved gjentatt svikt: jobben
//   MINNE    sesongen arkiveres i merittlista
//
// Kjerneprinsippet holder også her: **dommen forklares med det manageren
// gjorde.** Aldri «spillerne var ikke gode nok» — alltid hva som ble valgt.
//
// Motoren er ren: ingen DOM, ingen lagring, ingen `Date.now`, ingen tilfeldighet.

export const SEASON_REVIEW_VERSION = "season-review.v1";

const VERDICTS = Object.freeze({
  triumph: { label: "Seriemester", boardTrustDelta: 14, rank: 4 },
  exceeded: { label: "Over forventning", boardTrustDelta: 8, rank: 3 },
  met: { label: "Innfridd", boardTrustDelta: 2, rank: 2 },
  below: { label: "Under forventning", boardTrustDelta: -10, rank: 1 },
  failed: { label: "Langt under forventning", boardTrustDelta: -20, rank: 0 }
});

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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// ---------------------------------------------------------------------------
// Målet: en tabellplass, ikke en stemning
// ---------------------------------------------------------------------------

// Første sesong er styret tålmodig: midt på tabellen holder. Etterpå måles du
// mot der du selv endte sist — klarte du femteplass, vil de ha fjerde.
// Forventningen vokser, men aldri raskere enn ett steg per sesong.
export function deriveSeasonTarget({ clubCount = 8, seasonNumber = 1, previousPosition = null } = {}) {
  const clubs = Math.max(2, num(clubCount, 8));
  const midtre = Math.ceil(clubs / 2);

  if (!previousPosition || seasonNumber <= 1) {
    return {
      targetPosition: midtre,
      label: `Topp ${midtre}`,
      description: `Første sesong: styret vil se en klubb som hører hjemme i øvre halvdel. Topp ${midtre} holder.`
    };
  }

  const target = clamp(num(previousPosition) - 1, 1, clubs);
  return {
    targetPosition: target,
    label: target === 1 ? "Seriegull" : `Topp ${target}`,
    description: target === 1
      ? "Dere ble nummer to i fjor. Styret vil ha gullet."
      : `Dere endte på ${previousPosition}. plass i fjor. Styret vil se ett steg opp: topp ${target}.`
  };
}

// ---------------------------------------------------------------------------
// Dommen
// ---------------------------------------------------------------------------

function verdictFor(position, targetPosition, clubCount) {
  if (position === 1) return "triumph";
  if (position < targetPosition) return "exceeded";
  if (position === targetPosition) return "met";
  // Hvor langt bak målet? Mer enn en tredjedel av feltet er en kollaps.
  const bom = position - targetPosition;
  return bom > Math.max(1, Math.floor(clubCount / 3)) ? "failed" : "below";
}

// Hva bar sesongen? Hentet fra spillerstatistikken, og alltid formulert som noe
// MANAGEREN fikk til — ikke som en egenskap ved spilleren.
function buildHighlights(playerStats, table) {
  const rows = asArray(playerStats).filter((row) => row?.playerId);
  const highlights = [];

  const scorer = [...rows].sort((a, b) => num(b.goals) - num(a.goals))[0];
  if (scorer && num(scorer.goals) > 0) {
    highlights.push(`${scorer.name} scoret ${scorer.goals} mål — plassen og rollen du ga ham fungerte.`);
  }

  const creator = [...rows].sort((a, b) => num(b.assists) - num(a.assists))[0];
  if (creator && num(creator.assists) > 0 && creator.playerId !== scorer?.playerId) {
    highlights.push(`${creator.name} la fram ${creator.assists} — oppsettet ga ham noen å spille på.`);
  }

  const brukte = rows.filter((row) => num(row.appearances) > 0).length;
  if (brukte > 0) {
    highlights.push(`Du brukte ${brukte} spillere gjennom sesongen.`);
  }

  const manager = asArray(table).find((row) => row?.isManager);
  if (manager) {
    highlights.push(`${manager.goalsFor}–${manager.goalsAgainst} i målforskjell over ${manager.played} kamper.`);
  }

  return highlights;
}

// Hvorfor endte det slik? Alltid pekende på valgene, aldri på spillerne.
function buildReasons(verdict, { position, targetPosition, table, playerStats }) {
  const manager = asArray(table).find((row) => row?.isManager);
  const reasons = [];

  if (manager) {
    const snittFor = manager.played > 0 ? num(manager.goalsFor) / num(manager.played) : 0;
    const snittMot = manager.played > 0 ? num(manager.goalsAgainst) / num(manager.played) : 0;
    if (snittFor < 1) {
      reasons.push("Laget skapte for lite: oppsettet ga ikke nok trussel i de avgjørende kampene.");
    } else if (snittFor > 1.8) {
      reasons.push("Laget skapte mye — den offensive strukturen din satt.");
    }
    if (snittMot > 1.6) {
      reasons.push("Dere slapp inn for mye: balansen bakover holdt ikke i den formen laget ble satt opp.");
    } else if (snittMot < 1) {
      reasons.push("Dere sto godt: restforsvaret og strukturen tålte presset.");
    }
  }

  const rows = asArray(playerStats).filter((row) => row?.playerId);
  const brukte = rows.filter((row) => num(row.appearances) > 0);
  if (brukte.length > 0 && brukte.length < 13) {
    reasons.push(`Du roterte lite — ${brukte.length} spillere bar hele sesongen. Det koster mot slutten.`);
  } else if (brukte.length >= 16) {
    reasons.push(`Bred bruk av troppen (${brukte.length} spillere) holdt laget friskt gjennom sesongen.`);
  }

  if (verdict === "failed") {
    reasons.push(`Målet var topp ${targetPosition}. ${position}. plass er ikke nær nok til at styret kan forsvare det.`);
  } else if (verdict === "below") {
    reasons.push(`Målet var topp ${targetPosition}, og dere endte på ${position}. Ikke en katastrofe — men ikke det dere lovte.`);
  }

  return reasons;
}

// Sesongdommen. `previousReviews` er merittlista så langt: to katastrofesesonger
// på rad er det som faktisk koster jobben — én dårlig sesong gir en advarsel.
// Ingen blir sparket av ett uhell.
export function createSeasonReview({
  season,
  table,
  target,
  playerStats = [],
  previousReviews = [],
  boardTrust = 50
} = {}) {
  const rows = asArray(table);
  const manager = rows.find((row) => row?.isManager);
  if (!manager) return null;

  const clubCount = rows.length || 8;
  const seasonTarget = target || deriveSeasonTarget({ clubCount, seasonNumber: num(season?.seasonNumber, 1) });
  const position = num(manager.position);
  const verdict = verdictFor(position, seasonTarget.targetPosition, clubCount);
  const info = VERDICTS[verdict];

  // Advarsel forrige sesong + ny svikt = sparken. Rekkefølgen er viktig:
  // manageren skal ha fått beskjed FØR det skjer.
  const forrige = asArray(previousReviews)[asArray(previousReviews).length - 1] || null;
  const hadWarning = Boolean(forrige?.warning) || forrige?.verdict === "failed";
  const sacked = verdict === "failed" && hadWarning;
  const warning = verdict === "failed" && !sacked;

  const headline = verdict === "triumph"
    ? `Seriemester! ${manager.club} vant ligaen med ${manager.points} poeng.`
    : verdict === "exceeded"
      ? `Over forventning: ${position}. plass, bedre enn målet om topp ${seasonTarget.targetPosition}.`
      : verdict === "met"
        ? `Innfridd: ${position}. plass, akkurat det styret ba om.`
        : verdict === "below"
          ? `Under forventning: ${position}. plass mot et mål om topp ${seasonTarget.targetPosition}.`
          : `Langt under forventning: ${position}. plass mot et mål om topp ${seasonTarget.targetPosition}.`;

  const boardMessage = sacked
    ? "Styret takker for innsatsen og avslutter samarbeidet. Du fikk advarselen i fjor."
    : warning
      ? "Styret gir deg én sesong til. Neste gang holder det ikke."
      : verdict === "triumph"
        ? "Styret er overveldet. Kontrakten din er trygg."
        : verdict === "exceeded"
          ? "Styret er fornøyd — dere leverte mer enn de ba om."
          : verdict === "met"
            ? "Styret er tilfreds. Målet er nådd, og forventningen stiger."
            : "Styret er skuffet, men ser at grunnlaget er der.";

  return {
    version: SEASON_REVIEW_VERSION,
    seasonNumber: num(season?.seasonNumber, 1),
    verdict,
    verdictLabel: info.label,
    headline,
    boardMessage,
    position,
    points: num(manager.points),
    played: num(manager.played),
    goalsFor: num(manager.goalsFor),
    goalsAgainst: num(manager.goalsAgainst),
    champion: str(rows[0]?.club),
    target: seasonTarget,
    boardTrustDelta: info.boardTrustDelta,
    boardTrustAfter: clamp(num(boardTrust, 50) + info.boardTrustDelta, 0, 100),
    warning,
    sacked,
    managerSafe: !sacked,
    reasons: buildReasons(verdict, { position, targetPosition: seasonTarget.targetPosition, table: rows, playerStats }),
    highlights: buildHighlights(playerStats, rows)
  };
}

// ---------------------------------------------------------------------------
// Merittlista: sesongen huskes
// ---------------------------------------------------------------------------

export function createSeasonArchiveEntry(review, { playerStats = [] } = {}) {
  if (!review) return null;
  const scorer = [...asArray(playerStats)].sort((a, b) => num(b.goals) - num(a.goals))[0] || null;
  return {
    seasonNumber: review.seasonNumber,
    position: review.position,
    points: review.points,
    played: review.played,
    goalsFor: review.goalsFor,
    goalsAgainst: review.goalsAgainst,
    verdict: review.verdict,
    verdictLabel: review.verdictLabel,
    champion: review.champion,
    targetPosition: review.target?.targetPosition ?? null,
    warning: Boolean(review.warning),
    sacked: Boolean(review.sacked),
    topScorer: scorer && num(scorer.goals) > 0 ? { name: scorer.name, goals: num(scorer.goals) } : null
  };
}

export function appendSeasonArchive(archive, entry) {
  if (!entry) return asArray(archive);
  const existing = asArray(archive).filter((row) => row?.seasonNumber !== entry.seasonNumber);
  return [...existing, entry].sort((a, b) => num(a.seasonNumber) - num(b.seasonNumber));
}

// Kort sammendrag av karrieren så langt.
export function summarizeSeasonHistory(archive) {
  const list = asArray(archive);
  if (list.length === 0) {
    return { seasons: 0, titles: 0, bestPosition: null, headline: "Ingen fullførte sesonger ennå." };
  }
  const titles = list.filter((row) => num(row.position) === 1).length;
  const bestPosition = Math.min(...list.map((row) => num(row.position, 99)));
  return {
    seasons: list.length,
    titles,
    bestPosition,
    headline: titles > 0
      ? `${list.length} ${list.length === 1 ? "sesong" : "sesonger"} · ${titles} ${titles === 1 ? "seriegull" : "seriegull"}`
      : `${list.length} ${list.length === 1 ? "sesong" : "sesonger"} · beste plassering ${bestPosition}.`
  };
}
