// Manager Calendar v1 — presentasjonslag over eksisterende Club Week.
//
// Kalenderen eier IKKE progresjon, fasebytter eller lagring. Den leser
// ClubWeekState og organiserer eksisterende managerarbeid som dager og
// kronologiske hendelser. Handlinger i hendelsene åpner bare eksisterende
// arbeidsflater; de flytter aldri uka på egen hånd.

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
  Object.freeze({ dayIndex: 2, day: "Tirsdag", phase: "inbox", title: "Møter og meldinger", owner: "Kontor" }),
  Object.freeze({ dayIndex: 3, day: "Onsdag", phase: "training", title: "Treningsarbeid", owner: "Lag · Trening" }),
  Object.freeze({ dayIndex: 4, day: "Torsdag", phase: "training", title: "Oppfølging", owner: "Lag · Trening" }),
  Object.freeze({ dayIndex: 5, day: "Fredag", phase: "match_prep", title: "Kampforberedelse", owner: "Lag · Oppstilling" }),
  Object.freeze({ dayIndex: 6, day: "Lørdag", phase: "matchday", title: "Kampdag", owner: "Kamp" }),
  Object.freeze({ dayIndex: 7, day: "Søndag", phase: "review", title: "Etterkamp", owner: "Kamp · Analyse" })
]);

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeWeek(value) {
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 ? week : 1;
}

function event(id, time, title, detail, { owner = "", target = "", kind = "work", attention = false, actionLabel = "Åpne", message = null } = {}) {
  return { id, time, title, detail, owner, target, kind, attention: Boolean(attention), actionLabel, message };
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

function pressSignal(value) {
  const pressure = Number(value);
  if (!Number.isFinite(pressure)) {
    return {
      attention: false,
      detail: "Presseansvarlig samler spørsmål og mediebilde før kamp. Medietrykket er ikke vurdert ennå."
    };
  }
  if (pressure >= 65) {
    return {
      attention: true,
      detail: "Presseansvarlig varsler om et krevende mediebilde. Avklar budskap og hva klubben skal svare på før kamp."
    };
  }
  if (pressure <= 35) {
    return {
      attention: false,
      detail: "Pressebildet er rolig. Bruk briefen til å holde budskapet samlet før kamp."
    };
  }
  return {
    attention: false,
    detail: "Presseansvarlig samler ukas mediebilde og spørsmål før kamp. Avklar klubbens budskap."
  };
}

function communicationEventsForDay(dayIndex, communications) {
  return (Array.isArray(communications) ? communications : [])
    .filter((message) => message?.dayIndex === dayIndex && message?.id)
    .map((message) => event(
      message.id,
      message.time,
      message.subject,
      message.preview,
      {
        owner: [message.sender?.name, message.sender?.role].filter(Boolean).join(" · "),
        kind: "message",
        attention: !message.isRead && ["urgent", "high"].includes(message.priority),
        actionLabel: message.isRead ? "Les igjen" : "Les mail",
        message
      }
    ));
}

function eventsForDay(dayIndex, {
  week,
  opponent,
  opponentName,
  trainingSelected,
  lineupReady,
  mediaPressure,
  lastMatch
}) {
  const result = resultText(lastMatch);

  if (dayIndex === 1) {
    return [
      event("analysis-brief", "08:30", week === 1 ? "Ukeanalyse" : "Analyse etter forrige kamp", week === 1
        ? "Les laget, sesongen og neste motstander før arbeidsuka tar form."
        : "Se resultat, mønstre og belastning før den nye uka settes.", { owner: "Stats", target: "statistikk" }),
      event("recovery-check", "10:00", "Restitusjon og belastning", "Følg opp hvilke spillere som trenger restitusjon eller særskilt belastningsstyring.", { owner: "Lag · Trening", target: "trening" })
    ];
  }

  if (dayIndex === 2) {
    return [
      event("staff-meeting", "10:00", "Trener- og klubbmøte", "Samle signalene fra støtteapparatet før treningsarbeidet og kampforberedelsene.", { owner: "Klubben", target: "board" })
    ];
  }

  if (dayIndex === 3) {
    return [
      event("training-meeting", "09:30", "Trenermøte", "Avklar dagens hensikt, belastning og coachingpunkter før laget går ut på feltet.", { owner: "Lag · Trening", target: "trening" }),
      event("team-training", "11:00", "Trening", trainingSelected
        ? "Ukas treningsramme er valgt. Åpne treningen for å se program, fokus og belastning."
        : "Treningsprogram mangler. Velg program og fokus før økta gjennomføres.", {
          owner: "Lag · Trening",
          target: "trening",
          attention: !trainingSelected,
          actionLabel: trainingSelected ? "Åpne trening" : "Velg program"
        }),
      event("training-feedback", "14:30", "Oppfølging etter økta", "Se belastning, individuelle signaler og hva trenerteamet tar med seg videre.", { owner: "Lag · Trening", target: "trening" })
    ];
  }

  if (dayIndex === 4) {
    return [
      event("individual-follow-up", "11:00", "Individuell oppfølging", "Arbeid med roller, individuelle behov, skader og belastning innen den eksisterende treningsfasen.", { owner: "Lag · Trening", target: "trening" }),
      event("analysis-follow-up", "14:00", "Analyse og justering", "Juster det som skal tas med inn i kampforberedelsen uten å opprette en ny fase.", { owner: "Lag · Systemet", target: "system" })
    ];
  }

  if (dayIndex === 5) {
    const press = pressSignal(mediaPressure);
    return [
      event("match-prep", "10:00", "Kampforberedelse", lineupReady
        ? "Startellever og benk er satt. Bekreft roller, system og siste kampplan."
        : "Laguttaket er ikke kampklart. Få ellever, benk og roller på plass.", {
          owner: "Lag · Oppstilling",
          target: "tactics",
          attention: !lineupReady,
          actionLabel: lineupReady ? "Åpne kampforberedelse" : "Gjør laget klart"
        }),
      event("press-brief", "13:00", "Pressebrief før kamp", press.detail, {
        owner: "Kontor · Klubben",
        target: "board",
        attention: press.attention,
        actionLabel: "Åpne Klubben"
      })
    ];
  }

  if (dayIndex === 6) {
    const title = opponentName ? `Kamp mot ${opponentName}` : "Kampdag";
    const venue = opponent?.homeAway === "away" ? "Bortekamp" : opponent?.homeAway === "home" ? "Hjemmekamp" : "Ligakamp";
    return [
      event("matchday", "15:00", title, opponentName
        ? `${venue}${opponent?.round ? ` · runde ${opponent.round}` : ""}. Kampmotoren og kampvalgene er uendret.`
        : "Spill ukas kamp og ta managergrep underveis.", { owner: "Kamp", target: "kamp", actionLabel: "Åpne kampdag" })
    ];
  }

  return [
    event("post-match", "10:30", "Etterkamp og kampanalyse", result
      ? `Siste kamp endte ${result}. Les konsekvensene, forklaringen og hva laget tar med seg inn i neste uke.`
      : "Les kampanalysen, konsekvensene og hva laget tar med seg videre.", { owner: "Kamp · Analyse", target: "analyse", actionLabel: "Åpne kampanalyse" })
  ];
}

export function createManagerWeekCalendar({
  clubWeekState = {},
  opponent = null,
  trainingSelected = false,
  lineupReady = false,
  lastMatch = null,
  communications = []
} = {}) {
  const week = normalizeWeek(clubWeekState?.week);
  const phase = normalizeManagerWeekPhase(clubWeekState?.phase);
  const currentDayIndex = currentManagerDayIndex({ phase });
  const opponentName = text(opponent?.name);

  const context = {
    week,
    opponent,
    opponentName,
    trainingSelected,
    lineupReady,
    mediaPressure: clubWeekState?.mediaPressure,
    lastMatch
  };

  const days = WEEK_TEMPLATE.map((template) => ({
    ...template,
    status: statusForDay(template.dayIndex, currentDayIndex),
    isCurrent: template.dayIndex === currentDayIndex,
    events: [
      ...communicationEventsForDay(template.dayIndex, communications),
      ...eventsForDay(template.dayIndex, context)
    ].sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id))
  }));

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
