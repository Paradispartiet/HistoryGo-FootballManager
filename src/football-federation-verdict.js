// Forbundets dom v1 — mesterskapet gjøres opp
//
// Landslagsmodus HADDE en merittliste: hvert fullført mesterskap ble lagt i
// `tournamentHistory` med plassering og rekord. Men ingen hadde en mening om
// den. Å ryke i gruppa med Brasil og å nå semifinalen med Norge sto som samme
// slags linje i lista — «Ferdig · 1-1-1» — uten at noen sa om det var bra.
//
// Her får mesterskapet en dom, etter samme mønster som styrets sesongdom:
//
//   FORVENTNING  hva forbundet mente nasjonen skulle klare, ut fra styrken
//   DOM          du nådde den, overgikk den, eller bommet
//   FØLGE        forbundets tillit, og ved gjentatt svikt: jobben
//
// Forskjellen fra klubben er forventningen: i klubben måles du mot din egen
// forrige plassering, i landslaget mot **nasjonens tyngde**. Å nå semifinalen
// med en nasjon på 62 i styrke er en bragd; med Brasil på 85 er det et nederlag.
// Det er nettopp dette som gjør landslagsmodus til noe annet enn ligaen.
//
// Kjerneprinsippet holder: dommen forklares med det MANAGEREN gjorde — aldri
// med at spillerne ikke holdt.
//
// Motoren er ren: ingen DOM, ingen lagring, ingen `Date.now`, ingen tilfeldighet.

export const FEDERATION_VERDICT_VERSION = "federation-verdict.v1";

// Hvor langt en nasjon FORVENTES å komme, ut fra styrken sin. Terskelene er
// bevisst grove: forbundet er ikke en kalkulator, det har en mening.
const EXPECTATION_BY_STRENGTH = Object.freeze([
  { minStrength: 82, stage: "final", label: "finale", note: "En nasjon på dette nivået skal spille om trofeet." },
  { minStrength: 76, stage: "semifinal", label: "semifinale", note: "Forbundet venter at nasjonen er blant de fire beste." },
  { minStrength: 70, stage: "quarterfinal", label: "kvartfinale", note: "Nasjonen skal ta seg forbi gruppa og videre en runde." },
  { minStrength: 0, stage: "knockout", label: "utslagsrunden", note: "Å komme ut av gruppa er målet." }
]);

// Hvor langt du FAKTISK kom. Høyere tall er lenger.
const STAGE_RANK = Object.freeze({
  group: 1,
  quarterfinal: 2,
  semifinal: 3,
  final: 4,
  champion: 5
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

// Forventningen justeres etter hvilke runder mesterskapet FAKTISK har. EM har
// ingen kvartfinale, så «kvartfinale» der er meningsløst — da blir kravet
// semifinale i stedet.
export function deriveFederationExpectation({ strength = 70, knockoutStages = [] } = {}) {
  const base = EXPECTATION_BY_STRENGTH.find((entry) => num(strength) >= entry.minStrength)
    || EXPECTATION_BY_STRENGTH[EXPECTATION_BY_STRENGTH.length - 1];

  const stages = asArray(knockoutStages).map(str).filter(Boolean);
  if (base.stage === "knockout") {
    const first = stages[0] || "semifinal";
    return { stage: first, label: `å nå ${(first === "final" ? "finalen" : first === "semifinal" ? "semifinalen" : "kvartfinalen")}`, note: base.note, strength: num(strength) };
  }
  // Krever forventningen en runde mesterskapet ikke har, flyttes den til
  // nærmeste runde som finnes.
  if (stages.length > 0 && !stages.includes(base.stage)) {
    const rank = STAGE_RANK[base.stage] || 3;
    const nærmest = [...stages].sort(
      (a, b) => Math.abs((STAGE_RANK[a] || 0) - rank) - Math.abs((STAGE_RANK[b] || 0) - rank)
    )[0];
    return { stage: nærmest, label: `å nå ${nærmest === "final" ? "finalen" : nærmest === "semifinal" ? "semifinalen" : "kvartfinalen"}`, note: base.note, strength: num(strength) };
  }
  return { stage: base.stage, label: `å nå ${base.label}n`, note: base.note, strength: num(strength) };
}

// Hvor langt kom du? Leser turneringens `outcome`.
export function reachedStageOf(tournament) {
  const outcome = tournament?.outcome;
  if (!outcome) return null;
  const champion = str(outcome.champion) && str(outcome.champion) === str(tournament.managerNationality);
  if (champion) return "champion";
  return str(outcome.stage) || null;
}

const VERDICTS = Object.freeze({
  triumph: { label: "Mesterskapstittel", trustDelta: 16 },
  exceeded: { label: "Over forventning", trustDelta: 9 },
  met: { label: "Innfridd", trustDelta: 3 },
  below: { label: "Under forventning", trustDelta: -9 },
  failed: { label: "Langt under forventning", trustDelta: -18 }
});

// Dommen. `previousVerdicts` er merittlista: som i klubben koster to
// katastrofer på rad jobben, og advarselen kommer først.
export function createFederationVerdict({
  tournament,
  summary,
  expectation,
  previousVerdicts = [],
  federationTrust = 50
} = {}) {
  if (!tournament || tournament.status !== "completed") return null;

  const reached = reachedStageOf(tournament);
  if (!reached) return null;

  const forventet = expectation || deriveFederationExpectation({ knockoutStages: tournament.knockoutStages });
  const reachedRank = STAGE_RANK[reached] || 0;
  const expectedRank = STAGE_RANK[forventet.stage] || 3;

  const verdict = reached === "champion"
    ? "triumph"
    : reachedRank > expectedRank
      ? "exceeded"
      : reachedRank === expectedRank
        ? "met"
        : expectedRank - reachedRank >= 2
          ? "failed"
          : "below";

  const info = VERDICTS[verdict];
  const forrige = asArray(previousVerdicts)[asArray(previousVerdicts).length - 1] || null;
  const hadWarning = Boolean(forrige?.warning) || forrige?.verdict === "failed";
  const sacked = verdict === "failed" && hadWarning;
  const warning = verdict === "failed" && !sacked;

  const nasjon = str(tournament.managerNationality) || "nasjonen";
  const placement = str(tournament.outcome?.placement) || "Ferdig";

  const headline = verdict === "triumph"
    ? `${nasjon} er mester i ${str(tournament.name) || "mesterskapet"}!`
    : `${placement} med ${nasjon} — forbundet ventet ${forventet.label}.`;

  const federationMessage = sacked
    ? "Forbundet avslutter samarbeidet. Du fikk advarselen etter forrige mesterskap."
    : warning
      ? "Forbundet gir deg ett mesterskap til. Neste gang holder det ikke."
      : verdict === "triumph"
        ? "Forbundet er i ekstase. Du kan bli så lenge du vil."
        : verdict === "exceeded"
          ? "Forbundet er imponert — dere kom lenger enn nasjonens tyngde tilsa."
          : verdict === "met"
            ? "Forbundet er tilfreds. Nasjonen leverte det den skulle."
            : "Forbundet er skuffet, men ser at laget hadde en plan.";

  return {
    version: FEDERATION_VERDICT_VERSION,
    tournamentId: str(tournament.tournamentId),
    tournamentName: str(tournament.name),
    nationality: nasjon,
    reached,
    placement,
    verdict,
    verdictLabel: info.label,
    headline,
    federationMessage,
    expectation: forventet,
    trustDelta: info.trustDelta,
    trustAfter: clamp(num(federationTrust, 50) + info.trustDelta, 0, 100),
    warning,
    sacked,
    managerSafe: !sacked,
    reasons: buildReasons(verdict, { summary, forventet, nasjon })
  };
}

// Hvorfor endte det slik? Alltid pekende på lesningen og valgene.
function buildReasons(verdict, { summary, forventet, nasjon }) {
  const reasons = [];
  const played = num(summary?.played);
  const won = num(summary?.won);
  const drawn = num(summary?.drawn);
  const lost = num(summary?.lost);
  const goalsFor = num(summary?.goalsFor);
  const goalsAgainst = num(summary?.goalsAgainst);

  if (played > 0) {
    reasons.push(`${won}-${drawn}-${lost} på ${played} kamper, ${goalsFor}–${goalsAgainst} i mål.`);
  }

  if (played > 0 && goalsFor / played < 1) {
    reasons.push("Laget skapte for lite: oppsettet ga ikke nok trussel mot organiserte mesterskapslag.");
  }
  if (played > 0 && goalsAgainst / played > 1.5) {
    reasons.push("Dere slapp inn for mye — balansen bakover holdt ikke i den formen laget ble satt opp.");
  }
  if (drawn >= 2 && won === 0) {
    reasons.push("For mange uavgjorte: planen var trygg, men den avgjorde aldri en kamp.");
  }

  reasons.push(`Forbundets krav var ${forventet.label}. ${forventet.note}`);

  if (verdict === "exceeded" || verdict === "triumph") {
    reasons.push(`${nasjon} kom lenger enn troppen tilsa — det er lesningen din som bar dem.`);
  }

  return reasons;
}

// Merittlista, som i klubben.
export function createFederationArchiveEntry(verdict) {
  if (!verdict) return null;
  return {
    tournamentId: verdict.tournamentId,
    tournamentName: verdict.tournamentName,
    nationality: verdict.nationality,
    placement: verdict.placement,
    verdict: verdict.verdict,
    verdictLabel: verdict.verdictLabel,
    expectedStage: verdict.expectation?.stage || null,
    warning: Boolean(verdict.warning),
    sacked: Boolean(verdict.sacked)
  };
}

export function summarizeFederationHistory(archive) {
  const list = asArray(archive);
  if (list.length === 0) {
    return { tournaments: 0, titles: 0, headline: "Ingen fullførte mesterskap ennå." };
  }
  const titles = list.filter((row) => row?.verdict === "triumph").length;
  return {
    tournaments: list.length,
    titles,
    headline: titles > 0
      ? `${list.length} ${list.length === 1 ? "mesterskap" : "mesterskap"} · ${titles} tittel${titles === 1 ? "" : "er"}`
      : `${list.length} ${list.length === 1 ? "mesterskap" : "mesterskap"} spilt.`
  };
}
