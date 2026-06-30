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
      enoughBench: roster.enoughBench !== false,
      unlockedCount: Math.max(0, toInt(roster.unlockedCount))
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
    firstTime: context.firstTime && typeof context.firstTime === "object"
      ? {
          active: Boolean(context.firstTime.active),
          started: Boolean(context.firstTime.started),
          completed: Boolean(context.firstTime.completed),
          hasFormation: context.firstTime.hasFormation !== false,
          hasRoles: context.firstTime.hasRoles !== false,
          hasReadInbox: Boolean(context.firstTime.hasReadInbox),
          hasPlayedFirstMatch: Boolean(context.firstTime.hasPlayedFirstMatch),
          hasSeenReport: Boolean(context.firstTime.hasSeenReport),
          opponentName: asString(context.firstTime.opponentName, "Ajax 1971–73 — Totalfotball")
        }
      : null,
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
  const firstTime = ctx.firstTime;

  // Playable First Run Gate v1: ingen ny spiller skal kunne sendes til
  // prøveperiode, kamp eller avansert managerflyt før spillerpoolen faktisk er
  // spillbar. Under 15 opplåste spillere er eneste primærvei History Go/startmodus.
  if (!ctx.hasSession && !roster.enoughUnlocked) {
    push({
      id: "first-run-collect-playable-squad",
      tag: "History Go",
      title: "Skaff spillbar tropp",
      hint: "Du trenger 15 spillere: 11 startere + 4 benk. Bruk History Go/startmodus for å låse opp en spillbar tropp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "historygo" }
    });
  }

  // Når spillerpoolen er stor nok, men startellever/benk ikke er klar, skal
  // spilleren til Lag & taktikk — ikke kamp, prøveperiode eller fallback-lister.
  if (!ctx.hasSession && roster.enoughUnlocked && (lineup.emptyCount > 0 || !roster.enoughBench)) {
    push({
      id: "first-run-setup-team",
      tag: "Lag & taktikk",
      title: "Sett opp laget",
      hint: "Du har nok spillere. Sett 11 startere og sørg for minst 4 spillere på benken før kampflyten åpnes.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "tactics" }
    });
  }

  // Scenario Playthrough v1: Ajax/femkampers-opplegget prioriteres bare når
  // spilleren eksplisitt har valgt scenario-modus. Ligaspill skal aldri arve
  // dette som obligatorisk første handling.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && firstTime?.active && !firstTime.completed) {
    if (!firstTime.started) {
      push({
        id: "first-time-start",
        tag: "Scenario",
        title: "Start Ajax 1971–73-scenario",
        hint: "Valgfri femkampers utfordring: totalfotball, høy linje og høyt press.",
        action: { type: NEXT_ACTION_TYPES.MINI_SEASON }
      });
    } else if (lineup.emptyCount > 0 || !firstTime.hasFormation) {
      push({
        id: "first-time-lineup",
        tag: "Lag",
        title: "Fullfør startellever",
        hint: `${Math.max(0, lineup.totalSlots - lineup.emptyCount)}/${lineup.totalSlots} plasser klare. Velg en formasjon laget forstår.`,
        action: { type: NEXT_ACTION_TYPES.SLOT, slotId: lineup.firstEmptySlotId }
      });
    } else if (!firstTime.hasRoles || lineup.misused) {
      push({
        id: "first-time-roles",
        tag: "Roller",
        title: "Velg nøkkelroller",
        hint: "Sett spillerne i roller de kan løse før totalfotball-presset tester laget.",
        action: { type: NEXT_ACTION_TYPES.TAB, tab: "tactics" }
      });
    } else if (!firstTime.hasReadInbox && ctx.unreadThreads > 0) {
      push({
        id: "first-time-inbox",
        tag: "Innboks",
        title: "Les assistentens kampnotat",
        hint: "Les ett viktig signal før du spiller første kamp.",
        action: { type: NEXT_ACTION_TYPES.TAB, tab: "inbox" }
      });
    } else if (!ctx.hasTrainingChoice) {
      push({
        id: "first-time-training",
        tag: "Trening",
        title: "Velg trening for scenario-kampen",
        hint: "Motstanderen presser høyt. Prioriter oppbygging, formasjonstilvenning eller restitusjon.",
        action: { type: NEXT_ACTION_TYPES.TAB, tab: "trening" }
      });
    } else if (!firstTime.hasPlayedFirstMatch && ctx.matchdayReady && !clubWeekGate.isBlocked) {
      push({
        id: "first-time-match",
        tag: "Kampdag",
        title: "Spill første kamp",
        hint: `Laget er kampklart mot ${firstTime.opponentName}. Se om oppbyggingen tåler presset.`,
        action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
      });
    } else if (firstTime.hasPlayedFirstMatch && !firstTime.hasSeenReport) {
      push({
        id: "first-time-report",
        tag: "Rapport",
        title: "Les første kamprapport",
        hint: "Se resultatet, hvorfor det skjedde og ett råd for neste uke.",
        action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
      });
    } else if (firstTime.hasSeenReport) {
      push({
        id: "first-time-week-2",
        tag: "Uke 2",
        title: "Gå til uke 2",
        hint: "Scenarioet er forstått. Gå tilbake til ligaspillet eller planlegg neste uke.",
        action: { type: NEXT_ACTION_TYPES.CLUB_WEEK }
      });
    }
  }

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

  // 3) Tomme plasser i startelleveren.
  if (!ctx.hasSession && roster.enoughUnlocked && lineup.emptyCount > 0) {
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

  // 6) Club Week-porten krever en spilt kamp før uka kan rulle videre, men
  // kampflaten skal ikke bli primær før treningsuka faktisk er valgt.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && ctx.hasTrainingChoice && clubWeekGate.isBlocked) {
    push({
      id: "play-week-match",
      tag: "Kampdag",
      title: "Spill ukens kamp",
      hint: clubWeekGate.reason || "Kampdagfasen venter på en spilt kamp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 7) I innboksfasen er klubbens puls den naturlige primærhandlingen før
  // trenings-/kampvalg. Den samme tråden dyttes ikke inn to ganger senere.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && clubWeek?.phase === "inbox" && ctx.unreadThreads > 0) {
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

  // 8) I review-fasen skal fersk kamprapport leses før ny kamp/ny uke.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && clubWeek?.phase === "review" && ctx.hasUnseenReport) {
    push({
      id: "read-report",
      tag: "Rapport",
      title: "Se kamprapporten",
      hint: "Les hvorfor kampen ble som den ble før du planlegger neste uke.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 9) Uleste innbokstråder er signaler som skal leses før treningsvalg.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && ctx.unreadThreads > 0) {
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

  // 10) Når innboksen er lest nok (eller ingen uleste tråder finnes), skal laget
  // videre til trening — ikke låses i Innboks og ikke hoppe direkte til Kamp.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && !ctx.hasTrainingChoice) {
    push({
      id: "choose-training",
      tag: "Trening",
      title: "Velg treningsprogram",
      hint: "Uka mangler et treningsvalg. Velg fokus eller program før kamp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "trening" }
    });
  }

  // 11) Fersk, ulest kamprapport — se hva kampen lærte før neste uke planlegges.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && ctx.hasUnseenReport) {
    push({
      id: "read-report",
      tag: "Rapport",
      title: "Se kamprapporten",
      hint: "Les hvorfor kampen ble som den ble før du planlegger neste uke.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 12) Laget er kampklart og treningsuka er valgt — sett kampplan og spill.
  if (!ctx.hasSession && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && ctx.hasTrainingChoice && ctx.matchdayReady && !clubWeekGate.isBlocked && !ctx.hasUnseenReport && clubWeek?.phase !== "review") {
    push({
      id: "play-match",
      tag: "Kampdag",
      title: "Spill kamp",
      hint: "Laget er kampklart. Sett kampplan og spill neste ligakamp.",
      action: { type: NEXT_ACTION_TYPES.TAB, tab: "kamp" }
    });
  }

  // 13) Fallback: driv klubbuken videre.
  if (clubWeek && roster.enoughUnlocked && roster.enoughBench && lineup.emptyCount === 0 && !clubWeekGate.isBlocked) {
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
