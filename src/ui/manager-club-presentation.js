function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, number(value, min)));
}

function metric(value, { reverse = false } = {}) {
  const score = clamp(value, 0, 100);
  if (reverse) {
    if (score >= 65) return { score, label: "Høyt", tone: "negative" };
    if (score <= 35) return { score, label: "Lavt", tone: "positive" };
    return { score, label: "Normalt", tone: "neutral" };
  }
  if (score >= 65) return { score, label: "Sterkt", tone: "positive" };
  if (score <= 35) return { score, label: "Krever arbeid", tone: "negative" };
  return { score, label: "Stabilt", tone: "neutral" };
}

function status(id, label, value, detail, tone, target) {
  return { id, label, value, detail, tone, target };
}

function scoreBand(value, medium = 45, strong = 65) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed >= strong) return 3;
  if (parsed >= medium) return 2;
  return 1;
}

function countBand(value, basic = 1, solid = 8, strong = 15) {
  const parsed = Math.max(0, number(value));
  if (parsed >= strong) return 3;
  if (parsed >= solid) return 2;
  if (parsed >= basic) return 1;
  return 0;
}

function deriveFacilityReading({ clubState, players, hiredStaff }) {
  const levels = [
    scoreBand(clubState?.trainingCulture),
    scoreBand(clubState?.mediaPressure),
    countBand(players, 1, 8, 15),
    countBand(hiredStaff, 1, 1, 3)
  ];
  const average = levels.reduce((sum, value) => sum + value, 0) / levels.length;
  const label = average >= 2.5 ? "Sterk" : average >= 1.5 ? "Solid" : average > 0 ? "Grunnleggende" : "Ikke lest";
  const tone = average >= 2.5 ? "positive" : average >= 1.5 ? "neutral" : average > 0 ? "attention" : "neutral";
  return {
    label,
    tone,
    detail: `${players} spillere · ${hiredStaff} i stab · treningskultur ${number(clubState?.trainingCulture)}.`
  };
}

function deriveMarketReading({ trust, morale, media }) {
  if (media.score >= 65) {
    return {
      label: "Under press",
      tone: "negative",
      detail: `Medietrykk ${media.score}. Fans og sponsorer leses mot moral ${morale.score} og styretillit ${trust.score}.`
    };
  }
  if (media.score <= 35 && morale.score >= 50 && trust.score >= 50) {
    return {
      label: "God temperatur",
      tone: "positive",
      detail: `Lavt medietrykk · moral ${morale.score} · styretillit ${trust.score}.`
    };
  }
  return {
    label: "Stabilt",
    tone: "neutral",
    detail: `Medietrykk ${media.score} · moral ${morale.score} · styretillit ${trust.score}.`
  };
}

function derivePriority({ trust, rosterCount, rosterRequired, hiredStaff, staffGaps, unlockedExpertise, activePrograms }) {
  if (trust.score <= 35) {
    return {
      tag: "Risiko",
      title: "Forstå styrets bekymring",
      detail: "Styretilliten er lav. Les vurderingen før du prioriterer nye klubbprosjekter.",
      target: "details",
      actionLabel: "Åpne styrets vurdering",
      tone: "negative"
    };
  }
  if (rosterCount < rosterRequired) {
    const missing = Math.max(0, rosterRequired - rosterCount);
    return {
      tag: "Rekruttering",
      title: "Utvid spillergrunnlaget",
      detail: `${missing} spiller${missing === 1 ? "" : "e"} mangler før klubben har en komplett kampstall.`,
      target: "historygo",
      actionLabel: "Gå til Speiding",
      tone: "attention"
    };
  }
  if (hiredStaff === 0 || staffGaps.length > 0) {
    return {
      tag: "Støtteapparat",
      title: hiredStaff === 0 ? "Bygg klubbens første stab" : "Tett gapene i støtteapparatet",
      detail: staffGaps[0] || "Klubben trenger et tydeligere støtteapparat rundt laget.",
      target: "admin",
      actionLabel: "Gå til Stab & drift",
      tone: hiredStaff === 0 ? "negative" : "attention"
    };
  }
  if (unlockedExpertise === 0) {
    return {
      tag: "Kompetanse",
      title: "Finn ekspertise til klubben",
      detail: "Besøk flere fotballsteder og bygg faggrunnlaget som åpner utviklingsprogrammer.",
      target: "historygo",
      actionLabel: "Finn ressurser i Speiding",
      tone: "attention"
    };
  }
  if (activePrograms === 0) {
    return {
      tag: "Utvikling",
      title: "Start et utviklingsprogram",
      detail: "Klubben har kompetanse tilgjengelig, men ingen flerukers progresjon er aktiv.",
      target: "progression",
      actionLabel: "Åpne Klubbutvikling",
      tone: "attention"
    };
  }
  return {
    tag: "Klubbdrift",
    title: "Følg utviklingen og hold retningen",
    detail: "Stall, stab og utviklingsarbeid er i gang. Bruk oversikten til å oppdage neste avvik.",
    target: "details",
    actionLabel: "Se klubbens vurdering",
    tone: "positive"
  };
}

export function createManagerClubSceneModel({
  clubName = "Managerklubben",
  week = 1,
  phaseLabel = "Klubbdrift",
  boardExpectation = "Styret venter at du bygger laget og viser en tydelig retning.",
  clubState = null,
  roster = null,
  staffIdentity = null,
  hiredStaffCount = 0,
  unlockedStaffCount = 0,
  unlockedPlayersCount = 0,
  unlockedPlacesCount = 0,
  unlockedExpertiseCount = 0,
  activeProgramCount = 0,
  earnedBadgeCount = 0,
  activeClassificationCount = 0
} = {}) {
  const rosterCount = Math.max(0, number(roster?.unlockedCount));
  const rosterRequired = Math.max(1, number(roster?.requiredCount, 15));
  const rosterReady = rosterCount >= rosterRequired;
  const hiredStaff = Math.max(0, number(hiredStaffCount));
  const unlockedStaff = Math.max(hiredStaff, number(unlockedStaffCount));
  const staffGaps = asArray(staffIdentity?.gaps).filter(Boolean);
  const staffScore = clamp(staffIdentity?.staffScore, 0, 100);
  const staffTone = hiredStaff === 0 ? "negative" : staffGaps.length > 0 ? "attention" : "positive";
  const trust = metric(clubState?.boardTrust);
  const morale = metric(clubState?.playerMorale);
  const clarity = metric(clubState?.tacticalClarity);
  const culture = metric(clubState?.trainingCulture);
  const media = metric(clubState?.mediaPressure, { reverse: true });
  const activePrograms = Math.max(0, number(activeProgramCount));
  const badges = Math.max(0, number(earnedBadgeCount));
  const classifications = Math.max(0, number(activeClassificationCount));
  const expertise = Math.max(0, number(unlockedExpertiseCount));
  const players = Math.max(0, number(unlockedPlayersCount));
  const places = Math.max(0, number(unlockedPlacesCount));
  const facilities = deriveFacilityReading({ clubState, players, hiredStaff });
  const market = deriveMarketReading({ trust, morale, media: { ...media, score: clamp(clubState?.mediaPressure, 0, 100) } });

  const priority = derivePriority({
    trust,
    rosterCount,
    rosterRequired,
    hiredStaff,
    staffGaps,
    unlockedExpertise: expertise,
    activePrograms
  });

  const statuses = [
    status(
      "board",
      "Styret",
      `${trust.score}/100`,
      boardExpectation || `${trust.label} styretillit.`,
      trust.tone,
      "details"
    ),
    status(
      "scouting",
      "Speiding",
      `${players} spiller${players === 1 ? "" : "e"}`,
      rosterReady
        ? `${places} sted${places === 1 ? "" : "er"} gir klubben spillere, stab og kompetanse.`
        : `${Math.max(0, rosterRequired - rosterCount)} spillere mangler i kampstallen.`,
      rosterReady ? "positive" : "attention",
      "historygo"
    ),
    status(
      "development",
      "Klubbutvikling",
      activePrograms > 0 ? `${activePrograms} aktiv${activePrograms === 1 ? "" : "e"}` : badges > 0 ? `${badges} badge${badges === 1 ? "" : "s"}` : "Ikke startet",
      `${expertise} ekspertise · ${badges} badges · ${classifications} lagklasse${classifications === 1 ? "" : "r"}.`,
      activePrograms > 0 || badges > 0 ? "positive" : expertise > 0 ? "attention" : "neutral",
      "progression"
    ),
    status(
      "facilities",
      "Fasiliteter",
      facilities.label,
      facilities.detail,
      facilities.tone,
      "facilities"
    ),
    status(
      "staff",
      "Stab & drift",
      staffIdentity?.identityLabel || `${hiredStaff} ansatt${hiredStaff === 1 ? "" : "e"}`,
      staffGaps[0] || `${hiredStaff}/${unlockedStaff} tilgjengelige stabsmedlemmer er engasjert.`,
      staffTone,
      "admin"
    ),
    status(
      "market",
      "Marked",
      market.label,
      market.detail,
      market.tone,
      "market"
    )
  ];

  return {
    clubName,
    week: Math.max(1, number(week, 1)),
    phaseLabel: phaseLabel || "Klubbdrift",
    expectation: boardExpectation || "Styret venter at du bygger laget og viser en tydelig retning.",
    priority,
    statuses,
    facilities,
    market,
    staff: {
      score: staffScore,
      label: staffIdentity?.identityLabel || (hiredStaff > 0 ? "Støtteapparat under bygging" : "Uetablert stab"),
      detail: asArray(staffIdentity?.strengths)[0] || staffGaps[0] || "Engasjer stab for å bygge en tydelig klubbidentitet.",
      tone: staffTone
    },
    development: {
      activePrograms,
      badges,
      classifications,
      expertise,
      detail: activePrograms > 0
        ? `${activePrograms} utviklingsprogram følger klubbens langsiktige retning.`
        : expertise > 0
          ? "Kompetansen er på plass. Velg et program som gjør den til varig klubbidentitet."
          : "Klubbutvikling starter med steder, personer og ekspertise fra History Go."
    },
    pulse: [
      { id: "trust", label: "Styretillit", ...trust },
      { id: "morale", label: "Moral", ...morale },
      { id: "clarity", label: "Taktisk klarhet", ...clarity },
      { id: "culture", label: "Treningskultur", ...culture },
      { id: "media", label: "Medietrykk", ...media }
    ],
    complete: priority.tone === "positive"
  };
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function statusButton(item, onOpenTarget) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "club-command-status";
  button.dataset.tone = item.tone;
  button.dataset.clubTarget = item.target;
  button.setAttribute("aria-label", `${item.label}: ${item.value}. ${item.detail}`);
  button.append(
    textElement("span", "club-command-status-label", item.label),
    textElement("strong", "club-command-status-value", item.value),
    textElement("small", "club-command-status-detail", item.detail)
  );
  if (typeof onOpenTarget === "function") button.addEventListener("click", () => onOpenTarget(item.target));
  return button;
}

export function renderManagerClubCommand(container, model, { onOpenTarget } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.complete = model.complete ? "true" : "false";

  const header = document.createElement("header");
  header.className = "club-command-head";
  const copy = document.createElement("div");
  copy.append(
    textElement("p", "eyebrow", `${model.clubName} · Uke ${model.week}`),
    textElement("h2", "", "Klubbkontoret"),
    textElement("p", "club-command-phase", model.phaseLabel)
  );
  const pulseSummary = document.createElement("div");
  pulseSummary.className = "club-command-pulse-summary";
  pulseSummary.append(
    textElement("span", "", "Klubbpuls"),
    textElement("strong", "", `${model.pulse[0].label}: ${model.pulse[0].score} · ${model.pulse[1].label}: ${model.pulse[1].score}`),
    textElement("small", "", "Styret, garderoben og klubbapparatet leses fra den aktive klubbuka.")
  );
  header.append(copy, pulseSummary);

  const main = document.createElement("div");
  main.className = "club-command-main";
  const expectation = document.createElement("article");
  expectation.className = "club-expectation-card";
  expectation.append(
    textElement("span", "", "Styrets forventning"),
    textElement("strong", "", model.expectation),
    textElement("small", "", "Styret vurderer retning, drift og resultater over tid.")
  );

  const priority = document.createElement("article");
  priority.className = "club-priority-card";
  priority.dataset.tone = model.priority.tone;
  const priorityCopy = document.createElement("div");
  priorityCopy.append(
    textElement("span", "", `Klubbens viktigste oppgave · ${model.priority.tag}`),
    textElement("strong", "", model.priority.title),
    textElement("p", "", model.priority.detail)
  );
  const priorityAction = document.createElement("button");
  priorityAction.type = "button";
  priorityAction.className = "club-command-action";
  priorityAction.dataset.clubTarget = model.priority.target;
  priorityAction.textContent = model.priority.actionLabel;
  if (typeof onOpenTarget === "function") priorityAction.addEventListener("click", () => onOpenTarget(model.priority.target));
  priority.append(priorityCopy, priorityAction);
  main.append(expectation, priority);

  const statusGrid = document.createElement("div");
  statusGrid.className = "club-command-status-grid club-command-status-grid-operations";
  model.statuses.forEach((item) => statusGrid.append(statusButton(item, onOpenTarget)));

  const reading = document.createElement("div");
  reading.className = "club-command-reading";
  const staff = document.createElement("article");
  staff.className = "club-staff-reading";
  staff.dataset.tone = model.staff.tone;
  staff.append(
    textElement("span", "", "Støtteapparat"),
    textElement("strong", "", `${model.staff.label} · ${model.staff.score}/100`),
    textElement("p", "", model.staff.detail)
  );
  const development = document.createElement("article");
  development.className = "club-development-reading";
  development.append(
    textElement("span", "", "Langsiktig utvikling"),
    textElement("strong", "", `${model.development.activePrograms} aktive program · ${model.development.badges} badges`),
    textElement("p", "", model.development.detail)
  );
  reading.append(staff, development);

  const metrics = document.createElement("div");
  metrics.className = "club-command-metrics";
  model.pulse.forEach((item) => {
    const card = document.createElement("article");
    card.dataset.tone = item.tone;
    card.append(
      textElement("span", "", item.label),
      textElement("strong", "", String(item.score)),
      textElement("small", "", item.label)
    );
    card.lastElementChild.textContent = item.label === "Medietrykk"
      ? (item.tone === "negative" ? "Høyt press" : item.tone === "positive" ? "Lavt press" : "Normalt press")
      : item.tone === "positive" ? "Sterkt" : item.tone === "negative" ? "Krever arbeid" : "Stabilt";
    metrics.append(card);
  });

  container.append(header, main, statusGrid, reading, metrics);
}
