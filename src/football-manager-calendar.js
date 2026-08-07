// Manager Calendar v1 — ren tidsprojeksjon av eksisterende Club Week.
//
// Kalenderen eier IKKE progresjon, fasebytter eller lagring. Den leser
// ClubWeekState og legger de eksisterende arbeidsflatene på mandag–søndag.
// `Forslag til neste steg` forblir eneste veiviser; denne modulen svarer bare på
// «hvilken dag er vi på, hva har skjedd og hva kommer senere i uka?».

export const MANAGER_WEEK_VERSION = "historygo-football-manager.manager-week.v1";

export const MANAGER_WEEK_PHASE_ORDER = Object.freeze([
  "analysis",
  "inbox",
  "training",
  "match_prep",
  "matchday",
  "review"
]);

export const MANAGER_WEEK_DAY_BY_PHASE = Object.freeze({
  analysis: 1,
  inbox: 2,
  training: 3,
  match_prep: 5,
  matchday: 6,
  review: 7
});

const WEEK_TEMPLATE = Object.freeze([
  Object.freeze({ dayIndex: 1, day: "Mandag", phase: "analysis", title: "Analyse og restitusjon", owner: "Kontor · Stats" }),
  Object.freeze({ dayIndex: 2, day: "Tirsdag", phase: "inbox", title: "Innboks og klubbdrift", owner: "Kontor" }),
  Object.freeze({ dayIndex: 3, day: "Onsdag", phase: "training", title: "Treningsarbeid", owner: "Lag · Trening" }),
  Object.freeze({ dayIndex: 4, day: "Torsdag", phase: "training", title: "Trening og individuell oppfølging", owner: "Lag · Trening" }),
  Object.freeze({ dayIndex: 5, day: "Fredag", phase: "match_prep", title: "Kampforberedelse", owner: "Lag · Oppstilling" }),
  Object.freeze({ dayIndex: 6, day: "Lørdag", phase: "matchday", title: "Kampdag", owner: "Kamp" }),
  Object.freeze({ dayIndex: 7, day: "Søndag", phase: "review", title: "Etterkamp og oppsummering", owner: "Kamp · Analyse" })
]);

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeWeek(value) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 ? week : 1;
}

export function normalizeManagerWeekPhase(value) {
  return MANAGER_WEEK_PHASE_ORDER.includes(value) ? value : "analysis";
}

export function currentManagerDayIndex(clubWeekState = {}) {
  const phase = normalizeManagerWeekPhase(clubWeekState?.phase);
  return MANAGER_WEEK_DAY_BY_PHASE[phase] || 1;
}

function statusForDay(dayIndex, currentDayIndex) {
  if (dayIndex < currentDayIndex) return "completed";
  if (dayIndex === currentDayIndex) return "current";
  return "upcoming";
}

function resultText(lastMatch) {
  const own = Number(lastMatch?.score?.for ?? lastMatch?.goalsFor);
  const against = Number(lastMatch?.score?.against ?? lastMatch?.goalsAgainst);
  if (!Number.isFinite(own) || !Number.isFinite(against)) return "";
  return `${Math.max(0, Math.round(own))}–${Math.max(0, Math.round(against))}`;
}

export function createManagerWeekCalendar({
  clubWeekState = {},
  opponent = null,
  trainingSelected = false,
  inboxHandled = false,
  lineupReady = false,
  lastMatch = null
} = {}) {
  const week = normalizeWeek(clubWeekState?.week);
  const phase = normalizeManagerWeekPhase(clubWeekState?.phase);
  const currentDayIndex = currentManagerDayIndex({ phase });
  const opponentName = text(opponent?.name);
  const result = resultText(lastMatch);

  const days = WEEK_TEMPLATE.map((template) => {
    let title = template.title;
    let detail = "";

    if (template.dayIndex === 1) {
      detail = week === 1
        ? "Les laget, sesongen og neste motstander før arbeidsuka tar form."
        : "Les forrige kamp, belastning og neste motstander før den nye uka settes.";
    }
    if (template.dayIndex === 2) {
      detail = inboxHandled
        ? "Ukas viktigste klubb- og stabsignaler er håndtert."
        : "Les ukas viktigste klubb-, stabs- og garderobesignaler.";
    }
    if (template.dayIndex === 3) {
      detail = trainingSelected
        ? "Ukas treningsramme eller fokus er valgt."
        : "Sett ukas treningsramme og taktiske fokus.";
    }
    if (template.dayIndex === 4) {
      detail = "Følg opp belastning, roller, skader og individuell trening innen samme treningsfase.";
    }
    if (template.dayIndex === 5) {
      detail = lineupReady
        ? "Bekreft kampplan, roller og siste justeringer før kamp."
        : "Få ellever, benk, roller og kampplan kampklare.";
    }
    if (template.dayIndex === 6) {
      title = opponentName ? `Kamp mot ${opponentName}` : "Kampdag";
      detail = opponentName
        ? `${opponent?.homeAway === "away" ? "Bortekamp" : opponent?.homeAway === "home" ? "Hjemmekamp" : "Ligakamp"}${opponent?.round ? ` · runde ${opponent.round}` : ""}.`
        : "Spill ukas kamp og ta managergrep underveis.";
    }
    if (template.dayIndex === 7) {
      detail = result
        ? `Siste kamp: ${result}. Les konsekvensene og ta lærdommen inn i neste uke.`
        : "Les kampanalysen, konsekvensene og hva laget tar med seg videre.";
    }

    return {
      ...template,
      title,
      detail,
      status: statusForDay(template.dayIndex, currentDayIndex),
      isCurrent: template.dayIndex === currentDayIndex
    };
  });

  const currentDay = days.find((day) => day.isCurrent) || days[0];
  return {
    version: MANAGER_WEEK_VERSION,
    week,
    phase,
    currentDayIndex,
    currentDay,
    days,
    summary: `Uke ${week} · ${currentDay.day}`,
    nextMatchLabel: opponentName
      ? `${opponentName}${opponent?.round ? ` · runde ${opponent.round}` : ""}`
      : "Ingen terminfestet kamp"
  };
}
