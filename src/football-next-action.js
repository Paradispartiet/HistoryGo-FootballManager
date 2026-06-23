// ============================================================================
// Next Action Engine (Playable Manager Flow Polish v1.1)
//
// Ren, deterministisk motor for "neste handling"-prioriteringen som driver
// stripen øverst på Oversikt. Tar inn et rent kontekstobjekt (ingen DOM, ingen
// fetch, ingen localStorage, ingen app-state) og returnerer en prioritert liste
// med handlingsbeskrivelser — mest til minst presserende.
//
// app.js bygger konteksten fra sin egen state og oversetter hver beskrivelse til
// en faktisk klikk-handler (selectSlot, activateTab, startMiniSeason,
// advanceClubWeek). Det er kun PRIORITERINGEN som bor her, slik at den kan
// testes isolert (scripts/simulate-manager-flow-ui.mjs) uten et DOM.
//
// Ingen ny spillmotor: dette flytter ikke kamp-, scoring-, off-pitch- eller
// unlock-regler. Det er presentasjonslogikk som leser eksisterende tilstand.
// ============================================================================

// Handlingstyper som app.js mapper til konkrete handlere. `null` betyr en ikke-
// klikkbar status (fallback når alt er gjort).
export const NEXT_ACTION_TYPES = Object.freeze({
  TAB: "tab",
  SLOT: "slot",
  MINI_SEASON: "miniSeason",
  CLUB_WEEK: "clubWeek"
});

function asString(value, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function toInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

// Normaliser konteksten defensivt slik at motoren aldri kaster på tynne data.
function normalizeContext(context = {}) {
  const lineup = context.lineup && typeof context.lineup === "object" ? context.lineup : {};
  const roster = context.roster && typeof context.roster === "object" ? context.roster : {};
  const gate = context.clubWeekGate && typeof context.clubWeekGate === "object" ? context.clubWeekGate : {};
  const clubWeek = context.clubWeek && typeof context.clubWeek === "object" ? context.clubWeek : null;

  return {
    hasSession: Boolean(context.hasSession),
    opponentName: asString(context.opponentName, "") || null,
    roster: {
      enoughUnlocked: roster.enoughUnlocked !== false,
      enoughBench: roster.enoughBench !== false
    },
    lineup: {
      totalSlots: toInt(lineup.totalSlots) || 11,
      emptyCount: Math.max(0, toInt(lineup.emptyCount)),
      firstEmptySlotId: asString(lineup.firstEmptySlotId, "") || null,
      misused:
        lineup.misused && typeof lineup.misused === "object"
          ? {
              name: asString(lineup.misused.name, "Spilleren"),
              position: asString(lineup.misused.position, "posisjonen"),
              slotId: asString(lineup.misused.slotId, "") || null
            }
          : null,
      duplicate:
        lineup.duplicate && typeof lineup.duplicate === "object"
          ? {
              name: asString(lineup.duplicate.name, "Spilleren"),
              slotId: asString(lineup.duplicate.slotId, "") || null
            }
          : null
    },
    clubWeekGate: {
      isBlocked: Boolean(gate.isBlocked),
      reason: asString(gate.reason, "")
    },
    hasTrainingChoice: Boolean(context.hasTrainingChoice),
    matchdayReady: Boolean(context.matchdayReady),
    unreadThreads: Math.max(0, toInt(context.unreadThreads)),
    hasUnseenReport: Boolean(context.hasUnseenReport),
    miniSeasonActive: Boolean(context.miniSeasonActive),
    clubWeek: clubWeek
      ? {
          week: toInt(clubWeek.week) || 1,
          phase: asString(clubWeek.phase, "") || null,
          phaseLabel: asString(clubWeek.phaseLabel, "") || null
        }
      : null
  };
}

// Bygg den prioriterte handlingslista. Returnerer { id, tag, title, hint,
// action } i fast rekkefølge (mest → minst presserende). `action` er enten et
// beskrivende objekt ({ type, ... }) eller null for ren status.
export function computeNextActions(context = {}) {
  const ctx = normalizeContext(context);
  const actions = [];
  const seen = new Set();
  const push = (action) => {
    if (!action || seen.has(action.title)) return;
    seen.add(action.title);
    actions.push(action);
  };

  const { lineup, roster, clubWeekGate, clubWeek } = ctx;

  // 1) Pågående kamp vinner alltid — fullfør grepene først.
  if (ctx.hasSession) {
    push({
      id: "continue-match",
      tag: "Kampdag",
      title: "Fortsett kampen",
      hint: `Kampen mot ${ctx.opponentName || "motstanderen"} venter på managergrepene dine.`,
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 2) Troppen mangler spillere (15-kravet) — blokkerer kampdelen.
  if (!ctx.hasSession && (!roster.enoughUnlocked || !roster.enoughBench)) {
    push({
      id: "collect-players",
      tag: "Samling",
      title: "Samle flere spillere",
      hint: "Troppen mangler spillere for 15-kravet. Synk History Go-steder og bruk opplåste spillere.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "historygo" }
    });
  }

  // 3) Tomme plasser i startelleveren.
  if (!ctx.hasSession && lineup.emptyCount > 0) {
    push({
      id: "fill-lineup",
      tag: "Lag",
      title: "Fullfør startelleveren",
      hint: `${lineup.emptyCount} av ${lineup.totalSlots} plasser er tomme. Sett spillere på banen.`,
      action: { type: NEXT_ACTION_TYPES.SLOT, slotId: lineup.firstEmptySlotId }
    });
  }

  // 4) Feilbrukte spillere — en managerfeil som bør rettes, ikke en spillersvakhet.
  if (!ctx.hasSession && lineup.misused) {
    push({
      id: "fix-misuse",
      tag: "Roller",
      title: "Velg roller",
      hint: `${lineup.misused.name} passer dårlig som ${lineup.misused.position}. Juster rolle eller posisjon.`,
      action: { type: NEXT_ACTION_TYPES.SLOT, slotId: lineup.misused.slotId }
    });
  }

  // 5) Samme spiller satt opp flere steder.
  if (!ctx.hasSession && lineup.duplicate) {
    push({
      id: "fix-duplicate",
      tag: "Lag",
      title: "Rett opp dobbeltbruk",
      hint: `${lineup.duplicate.name} står på mer enn én plass. Velg en annen spiller.`,
      action: { type: NEXT_ACTION_TYPES.SLOT, slotId: lineup.duplicate.slotId }
    });
  }

  // 6) Club Week-porten krever en spilt kamp før uka kan rulle videre.
  if (!ctx.hasSession && clubWeekGate.isBlocked) {
    push({
      id: "play-week-match",
      tag: "Kampdag",
      title: "Spill ukens kamp",
      hint: clubWeekGate.reason || "Kampdagfasen venter på en spilt kamp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 7) Uka mangler et treningsvalg.
  if (!ctx.hasSession && !ctx.hasTrainingChoice) {
    push({
      id: "choose-training",
      tag: "Trening",
      title: "Velg treningsprogram",
      hint: "Uka mangler et treningsvalg. Velg fokus eller program før kamp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "trening" }
    });
  }

  // 8) Laget er kampklart — sett kampplan og spill.
  if (!ctx.hasSession && ctx.matchdayReady && !clubWeekGate.isBlocked) {
    push({
      id: "play-match",
      tag: "Kampdag",
      title: "Spill kamp",
      hint: "Laget er kampklart. Sett kampplan og test det historiske systemet i kamp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 9) Uleste innbokstråder — klubbens puls venter på svar.
  if (ctx.unreadThreads > 0) {
    push({
      id: "read-inbox",
      tag: "Innboks",
      title: "Les innboksen",
      hint:
        ctx.unreadThreads === 1
          ? "1 ulest tråd venter på et svar."
          : `${ctx.unreadThreads} uleste tråder venter på et svar.`,
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "inbox" }
    });
  }

  // 10) Fersk, ulest kamprapport — se hva kampen lærte før neste uke planlegges.
  if (!ctx.hasSession && ctx.hasUnseenReport) {
    push({
      id: "read-report",
      tag: "Rapport",
      title: "Se kamprapporten",
      hint: "Les hvorfor kampen ble som den ble før du planlegger neste uke.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 11) Prøveperiode ikke aktiv, men laget er klart for de 5 kampene.
  if (!ctx.hasSession && ctx.matchdayReady && !ctx.miniSeasonActive) {
    push({
      id: "start-mini-season",
      tag: "Prøveperiode",
      title: "Start prøveperiode",
      hint: "Bli vurdert av styret i en 5-kampers prøveperiode når du føler laget er klart.",
      action: { type: NEXT_ACTION_TYPES.MINI_SEASON }
    });
  }

  // 12) Fallback: driv klubbuken videre.
  if (clubWeek && !clubWeekGate.isBlocked) {
    const isReview = clubWeek.phase === "review";
    push({
      id: "advance-club-week",
      tag: "Klubbuke",
      title: isReview ? "Gå til neste uke" : "Gå til neste fase",
      hint: isReview
        ? "Oppsummer uka og rull klubben videre."
        : "Ingen åpne grep akkurat nå. Driv klubbuken videre.",
      action: { type: NEXT_ACTION_TYPES.CLUB_WEEK }
    });
  }

  return actions;
}
