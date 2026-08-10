// HG Football Manager — klubbkommunikasjon v2
//
// Dette er et rent presentasjonslag over eksisterende managerstate. Det lager
// konkrete mailer fra kamp, terminliste, trening, analyse, spiller-condition,
// stab og eksisterende innbokssignaler. Modulen skriver ingen state, flytter
// ingen Club Week-fase og beregner ingen ny effekt eller score.

export const CLUB_COMMUNICATION_VERSION = "historygo-football-manager.club-communication.v2";

const PHASE_DAY = Object.freeze({
  analysis: 1,
  inbox: 2,
  training: 3,
  match_prep: 5,
  matchday: 6,
  review: 7
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function number(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function currentDayIndex(context) {
  return PHASE_DAY[context?.clubWeekState?.phase] || 1;
}

function staffMember(context, acceptedTypes, fallbackName, fallbackRole) {
  const types = new Set(acceptedTypes);
  const member = asArray(context?.staff).find((entry) => types.has(entry?.staffType));
  return {
    name: text(member?.name, fallbackName),
    role: text(member?.roleLabel, fallbackRole)
  };
}

function stableMessage({
  id,
  threadId = id,
  dayIndex,
  time,
  sender,
  subject,
  preview,
  body = [],
  facts = [],
  action = null,
  choices = [],
  reply = null,
  priority = "normal",
  source = null,
  readIds = new Set()
}) {
  return {
    id: text(id),
    threadId: text(threadId, text(id)),
    dayIndex: Math.max(1, Math.min(7, Math.round(number(dayIndex, 1)))),
    time: text(time, "08:30"),
    sender: {
      name: text(sender?.name, "Klubbkontoret"),
      role: text(sender?.role, "Klubbkommunikasjon")
    },
    subject: text(subject, "Melding fra klubben"),
    preview: text(preview),
    body: asArray(body).map((line) => text(line)).filter(Boolean),
    facts: asArray(facts)
      .map((fact) => ({ label: text(fact?.label), value: text(fact?.value) }))
      .filter((fact) => fact.label && fact.value),
    action: action?.label
      ? { label: text(action.label), target: text(action.target), kind: text(action.kind, "navigate") }
      : null,
    choices: asArray(choices).map((choice) => ({
      id: text(choice?.id),
      label: text(choice?.label, "Svar"),
      description: text(choice?.description),
      selected: Boolean(choice?.selected),
      source: choice?.source || null
    })).filter((choice) => choice.id),
    reply: reply?.body || reply?.title
      ? { title: text(reply.title, "Svar registrert"), body: text(reply.body) }
      : null,
    priority: ["urgent", "high", "normal", "low"].includes(priority) ? priority : "normal",
    source,
    isRead: readIds.has(text(id))
  };
}

function scoreLine(lastMatch) {
  const own = Number(lastMatch?.score?.for ?? lastMatch?.goalsFor);
  const against = Number(lastMatch?.score?.against ?? lastMatch?.goalsAgainst);
  return Number.isFinite(own) && Number.isFinite(against)
    ? `${Math.max(0, Math.round(own))}–${Math.max(0, Math.round(against))}`
    : "";
}

function resultWord(lastMatch) {
  if (lastMatch?.outcome === "win") return "seieren";
  if (lastMatch?.outcome === "loss") return "tapet";
  if (lastMatch?.outcome === "draw") return "den uavgjorte kampen";
  return "forrige kamp";
}

function matchReviewMessage(context, readIds) {
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const lastMatch = context?.lastMatch;
  const opponentName = text(lastMatch?.opponent?.name || lastMatch?.opponentName);
  const nextOpponent = text(context?.opponent?.name, "neste motstander");
  const analyst = staffMember(context, ["analyst", "opposition_analyst", "assistant_coach"], "Analyseavdelingen", "Analyse");
  const result = scoreLine(lastMatch);

  if (lastMatch && (opponentName || result)) {
    return stableMessage({
      id: `club-mail:w${week}:match-review`,
      dayIndex: 1,
      time: "08:20",
      sender: analyst,
      subject: `Det vi må ta med fra ${opponentName || "forrige kamp"}`,
      preview: `${resultWord(lastMatch)} er registrert. Nå må hendelsene bli til ett konkret arbeidsproblem.`,
      body: [
        `${result ? `Resultatet ble ${result}` : "Kampen er ferdig"}${opponentName ? ` mot ${opponentName}` : ""}. Rapporten skiller mellom det som faktisk skjedde og det vi bare antar.`,
        `Les kampforklaringen før vi bestemmer hva som skal følge laget inn i møtet med ${nextOpponent}.`
      ],
      facts: [
        { label: "Resultat", value: result || "Registrert" },
        { label: "Neste motstander", value: nextOpponent }
      ],
      action: { label: "Åpne etterkampanalysen", target: "analyse" },
      priority: "high",
      readIds
    });
  }

  return stableMessage({
    id: `club-mail:w${week}:week-analysis`,
    dayIndex: 1,
    time: "08:20",
    sender: analyst,
    subject: `Første arbeidsbilde før ${nextOpponent}`,
    preview: "Vi trenger ett dokumentert problem før treningsuka får retning.",
    body: [
      `Start med laget vi faktisk har valgt og motstanderen vi faktisk skal møte: ${nextOpponent}.`,
      "Skill mellom et mønster vi kan arbeide med og en løs bekymring. Resten av uka bør kunne spores tilbake til dette valget."
    ],
    facts: [{ label: "Neste motstander", value: nextOpponent }],
    action: { label: "Åpne analysearbeidet", target: "board" },
    priority: "high",
    readIds
  });
}

function conditionMessage(context, readIds) {
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const physio = staffMember(context, ["physio", "physiotherapist", "doctor"], "Medisinsk apparat", "Fysio");
  const conditions = [...asArray(context?.playerConditions)].sort((a, b) => {
    const injuryDelta = Number(Boolean(b?.injury?.weeksOut)) - Number(Boolean(a?.injury?.weeksOut));
    return injuryDelta || number(b?.load) - number(a?.load);
  });
  const player = conditions[0] || null;
  const training = text(context?.training?.label, "dagens treningsøkt");

  if (player?.injury?.weeksOut) {
    const weeks = Math.max(1, Math.round(number(player.injury.weeksOut, 1)));
    return stableMessage({
      id: `club-mail:w${week}:medical`,
      dayIndex: 3,
      time: "08:05",
      sender: physio,
      subject: `${text(player.name, "En spiller")} er ikke klar for full trening`,
      preview: `Skaden krever kriterier for retur, ikke bare en dato i kalenderen.`,
      body: [
        `${text(player.name, "Spilleren")} er registrert ute i ${weeks} ${weeks === 1 ? "uke" : "uker"}.`,
        `Dagens plan er ${training}. Før vi øker belastningen må bevegelse, smerterespons og fotballspesifikke handlinger vurderes i riktig rekkefølge.`
      ],
      facts: [
        { label: "Spiller", value: text(player.name, player.playerId) },
        { label: "Registrert fravær", value: `${weeks} ${weeks === 1 ? "uke" : "uker"}` },
        { label: "Dagens plan", value: training }
      ],
      action: { label: "Åpne individuell oppfølging", target: "trening" },
      priority: "urgent",
      readIds
    });
  }

  if (player && number(player.load) >= 45) {
    const streak = Math.max(0, Math.round(number(player.consecutiveFullMatches)));
    return stableMessage({
      id: `club-mail:w${week}:medical`,
      dayIndex: 3,
      time: "08:05",
      sender: physio,
      subject: `${text(player.name, "En spiller")} bør vurderes før økta`,
      preview: "Belastningen kommer fra bruken i kamp og må sees opp mot dagens treningskrav.",
      body: [
        `${text(player.name, "Spilleren")} har den tydeligste belastningen i gruppa${streak ? ` etter ${streak} fulle kamper på rad` : " etter de siste kampene"}.`,
        `Det betyr ikke automatisk hvile. Det betyr at ${training.toLowerCase()} må vurderes opp mot rollen og minuttene vi planlegger på lørdag.`
      ],
      facts: [
        { label: "Spiller", value: text(player.name, player.playerId) },
        { label: "Belastningsgrunnlag", value: streak ? `${streak} fulle kamper på rad` : "Registrert kampbelastning" },
        { label: "Dagens plan", value: training }
      ],
      action: { label: "Åpne individuell oppfølging", target: "trening" },
      priority: "high",
      readIds
    });
  }

  return stableMessage({
    id: `club-mail:w${week}:medical`,
    dayIndex: 3,
    time: "08:05",
    sender: physio,
    subject: "Belastningsbildet før dagens trening",
    preview: "Ingen enkeltspiller skiller seg alvorlig ut, men øktkrav og kampminutter må fortsatt sees sammen.",
    body: [
      `Dagens plan er ${training}. Vi har ingen registrert spiller med et akutt belastningssignal akkurat nå.`,
      "Følg likevel med på spillere med mange minutter når øvelsene krever gjentatte sprinter, raske vendinger eller stor bane."
    ],
    facts: [{ label: "Dagens plan", value: training }],
    action: { label: "Se belastning og oppfølging", target: "trening" },
    priority: "normal",
    readIds
  });
}

function trainingMessage(context, readIds) {
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const assistant = staffMember(context, ["assistant_coach", "first_team_coach", "coach"], "Assistenttrener", "Trenerteam");
  const program = text(context?.training?.programLabel);
  const focus = text(context?.training?.focusLabel);
  const opponent = text(context?.opponent?.name, "motstanderen");
  const watch = text(context?.analysisPlan?.watch);

  if (!program && !focus) {
    return stableMessage({
      id: `club-mail:w${week}:training-follow-up`,
      dayIndex: 3,
      time: "14:30",
      sender: assistant,
      subject: "Vi mangler en rød tråd etter trenermøtet",
      preview: `Det er fortsatt ikke valgt program eller fokus før kampen mot ${opponent}.`,
      body: [
        "Vi kan ikke evaluere en økt som ikke har en tydelig hensikt.",
        `Velg ett program og ett observasjonspunkt som spillerne skal kjenne igjen mot ${opponent}.`
      ],
      facts: [
        { label: "Motstander", value: opponent },
        { label: "Treningsvalg", value: "Mangler" }
      ],
      action: { label: "Velg treningsuke", target: "trening" },
      priority: "urgent",
      readIds
    });
  }

  const label = [program, focus].filter(Boolean).join(" · ");
  return stableMessage({
    id: `club-mail:w${week}:training-follow-up`,
    dayIndex: 3,
    time: "14:30",
    sender: assistant,
    subject: `Etter økta: dette må vi se igjen mot ${opponent}`,
    preview: watch || `Treningsvalget ${label} må bli til observerbar kampatferd.`,
    body: [
      `Ukas valgte arbeid er ${label}. Det er først nyttig når spillerne kjenner igjen situasjonen uten at vi stopper spillet.`,
      watch
        ? `I kampforberedelsen skal vi derfor holde fast ved dette observasjonspunktet: ${watch}`
        : `I kampforberedelsen må vi formulere én konkret atferd vi skal se etter mot ${opponent}.`
    ],
    facts: [
      { label: "Program", value: program || "Ikke valgt" },
      { label: "Fokus", value: focus || "Ikke valgt" },
      { label: "Se etter", value: watch || "Må avklares i kampforberedelsen" }
    ],
    action: { label: "Åpne treningsøkta", target: "trening" },
    priority: "high",
    readIds
  });
}

function opponentMessage(context, readIds) {
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const analyst = staffMember(context, ["opposition_analyst", "analyst", "assistant_coach"], "Analyseavdelingen", "Motstanderanalyse");
  const opponent = text(context?.opponent?.name, "neste motstander");
  const plan = context?.analysisPlan;

  if (plan?.hypothesis && plan?.countermeasureLabel) {
    return stableMessage({
      id: `club-mail:w${week}:opponent-plan`,
      dayIndex: 5,
      time: "08:35",
      sender: analyst,
      subject: `Kampbrief: planen mot ${opponent}`,
      preview: text(plan.watch, "Hypotesen og motgrepet er klare. Nå må vi vite hva vi ser etter."),
      body: [
        `Hypotesen vår er: ${text(plan.hypothesis)}`,
        `Valgt motgrep er ${text(plan.countermeasureLabel)}. Risikoen vi aksepterer er ${text(plan.risk, "ikke tydelig formulert")}.`,
        `Under kampen skal vi se etter: ${text(plan.watch, "om motgrepet faktisk endrer kampbildet")}`
      ],
      facts: [
        { label: "Motstander", value: opponent },
        { label: "Motgrep", value: text(plan.countermeasureLabel) },
        { label: "Risiko", value: text(plan.risk, "Ikke formulert") }
      ],
      action: { label: "Åpne kampforberedelsen", target: "tactics" },
      priority: "high",
      readIds
    });
  }

  return stableMessage({
    id: `club-mail:w${week}:opponent-plan`,
    dayIndex: 5,
    time: "08:35",
    sender: analyst,
    subject: `Motstanderplanen mot ${opponent} er ikke ferdig`,
    preview: "Vi har en terminfestet kamp, men mangler en lagret hypotese og et motgrep.",
    body: [
      `Vi vet hvem vi møter: ${opponent}. Det vi fortsatt mangler er én presis hypotese om problemet de skaper.`,
      "Velg deretter ett motgrep, én risiko og én atferd vi skal følge under kampen."
    ],
    facts: [
      { label: "Motstander", value: opponent },
      { label: "Analyseplan", value: "Mangler" }
    ],
    action: { label: "Åpne Analyse", target: "board" },
    priority: "urgent",
    readIds
  });
}

function pressMessage(context, readIds) {
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const opponent = text(context?.opponent?.name, "motstanderen");
  const pressure = number(context?.clubWeekState?.mediaPressure, 50);
  const subject = pressure >= 65
    ? `Spørsmålene tiltar før ${opponent}`
    : `Dette kommer pressen til å spørre om før ${opponent}`;
  const preview = pressure >= 65
    ? "Mediebildet er krevende. Ett presist budskap er bedre enn flere forklaringer."
    : "Pressebildet er håndterbart, men laget og klubben må bruke samme språk.";

  return stableMessage({
    id: `club-mail:w${week}:press-brief`,
    dayIndex: 5,
    time: "12:45",
    sender: { name: "Presseansvarlig", role: "Kommunikasjon" },
    subject,
    preview,
    body: [
      `Hovedspørsmålet blir hvordan vi skal møte ${opponent} og hva treningsuka faktisk har forsøkt å endre.`,
      pressure >= 65
        ? "Ikke lov et resultat. Forklar problemet, arbeidet og hva publikum skal kunne kjenne igjen i laget."
        : "Vi trenger ikke skape en sak. Hold deg til planen, arbeidet og den observerbare atferden."
    ],
    facts: [
      { label: "Kamp", value: opponent },
      { label: "Kommunikasjonsbehov", value: pressure >= 65 ? "Krevende mediebilde" : "Samlet budskap" }
    ],
    priority: pressure >= 65 ? "high" : "normal",
    readIds
  });
}

function postMatchMessage(context, readIds) {
  const lastMatch = context?.lastMatch;
  if (!lastMatch) return null;
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const assistant = staffMember(context, ["assistant_coach", "analyst", "first_team_coach"], "Assistenttrener", "Trenerteam");
  const opponent = text(lastMatch?.opponent?.name || lastMatch?.opponentName, "motstanderen");
  const result = scoreLine(lastMatch);
  return stableMessage({
    id: `club-mail:w${week}:post-match`,
    dayIndex: 7,
    time: "09:45",
    sender: assistant,
    subject: `Før vi lukker uka etter ${opponent}`,
    preview: `${result ? `${result} er resultatet.` : "Kampen er ferdig."} Nå må vi skille mellom intensjonen og det laget faktisk gjorde.`,
    body: [
      `${result ? `Kampen endte ${result}` : "Kampen er registrert"} mot ${opponent}.`,
      "Se etter om ukas treningsspørsmål og motstanderhypotese faktisk dukket opp i kampforklaringen. Bare det systemet registrerte skal tas videre som læring."
    ],
    facts: [
      { label: "Motstander", value: opponent },
      { label: "Resultat", value: result || "Registrert" }
    ],
    action: { label: "Åpne etterkampanalysen", target: "analyse" },
    priority: "high",
    readIds
  });
}

function existingSignalMessage(signal, context, readIds, index) {
  const week = Math.max(1, Math.round(number(context?.week, 1)));
  const dayIndex = Math.max(1, Math.min(currentDayIndex(context), Math.round(number(signal?.dayIndex, 2))));
  const selectedChoice = asArray(signal?.choices).find((choice) => choice?.selected);
  const body = asArray(signal?.body).length ? signal.body : [signal?.preview];
  return stableMessage({
    id: text(signal?.id, `club-mail:w${week}:signal:${index + 1}`),
    threadId: text(signal?.threadId, text(signal?.id)),
    dayIndex,
    time: text(signal?.time, ["08:30", "09:10", "09:45"][index] || "10:15"),
    sender: {
      name: text(signal?.senderName, "Klubbkontoret"),
      role: text(signal?.senderRole, "Klubbsignal")
    },
    subject: text(signal?.subject, "Melding fra klubben"),
    preview: text(signal?.preview),
    body,
    facts: signal?.facts,
    action: signal?.action,
    choices: signal?.choices,
    reply: selectedChoice?.reply || signal?.reply,
    priority: signal?.priority,
    source: signal?.source || null,
    readIds
  });
}

export function createClubCommunicationTimeline(context = {}) {
  const day = currentDayIndex(context);
  const readIds = new Set(asArray(context?.readMessageIds));
  const messages = [matchReviewMessage(context, readIds)];

  asArray(context?.inboxSignals)
    .slice(0, 3)
    .forEach((signal, index) => messages.push(existingSignalMessage(signal, context, readIds, index)));

  if (day >= 3) {
    messages.push(conditionMessage(context, readIds), trainingMessage(context, readIds));
  }
  if (day >= 5) {
    messages.push(opponentMessage(context, readIds), pressMessage(context, readIds));
  }
  if (day >= 7) {
    const postMatch = postMatchMessage(context, readIds);
    if (postMatch) messages.push(postMatch);
  }

  return {
    version: CLUB_COMMUNICATION_VERSION,
    week: Math.max(1, Math.round(number(context?.week, 1))),
    messages: messages
      .filter((message) => message?.id && message.dayIndex <= day)
      .sort((a, b) => a.dayIndex - b.dayIndex || a.time.localeCompare(b.time) || a.id.localeCompare(b.id))
  };
}

export function getClubCommunicationMessage(timeline, messageId) {
  return asArray(timeline?.messages).find((message) => message.id === messageId) || null;
}
