// ============================================================================
// Manager Matchday Scene v1 — visual hierarchy on top of existing state.
// The match engine, readiness, league and persistence remain authoritative.
// ============================================================================

function text(value, fallback) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function opponentParts(opponentBrief) {
  const parts = text(opponentBrief, "Motstander · kampbrief kommer ved avspark")
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    name: parts[0] || "Motstander",
    context: parts.slice(1).join(" · ") || "Kampbrief kommer ved avspark"
  };
}

function resolvePhase(session, lastMatch, readiness) {
  if (session?.phase === "pre_match") return "pre_match";
  if (session && session.phase !== "resolved") return "live";
  if (lastMatch) return "report";
  return readiness?.canStartMatch ? "ready" : "blocked";
}

function buildStages(phase) {
  const order = ["preparation", "match", "report"];
  const activeByPhase = {
    blocked: "preparation",
    ready: "preparation",
    pre_match: "preparation",
    live: "match",
    report: "report"
  };
  const labels = {
    preparation: "Forberedelse",
    match: "Kamp",
    report: "Rapport"
  };
  const active = activeByPhase[phase] || "preparation";
  const activeIndex = order.indexOf(active);
  return order.map((id, index) => ({
    id,
    label: labels[id],
    state: index < activeIndex ? "complete" : index === activeIndex ? "active" : "upcoming"
  }));
}

function phaseView(phase) {
  const views = {
    blocked: {
      eyebrow: "Før kamp",
      title: "Gjør laget kampklart",
      status: "Forberedelser mangler",
      tone: "blocked",
      action: "Fullfør forberedelsene",
      target: "blocker"
    },
    ready: {
      eyebrow: "Før kamp",
      title: "Kampplanen er klar",
      status: "Klar til kampforberedelse",
      tone: "ready",
      action: "Åpne kampforberedelsen",
      target: "create_session"
    },
    pre_match: {
      eyebrow: "Kampforberedelse",
      title: "Ta siste møte før avspark",
      status: "Avspark venter",
      tone: "ready",
      action: "Start kampen",
      target: "kickoff"
    },
    live: {
      eyebrow: "Kampen pågår",
      title: "Les kampbildet og ta grep",
      status: "Live",
      tone: "live",
      action: "Gå til kampbildet",
      target: "live"
    },
    report: {
      eyebrow: "Etter kampen",
      title: "Forstå resultatet",
      status: "Kamprapport klar",
      tone: "report",
      action: "Åpne kampanalysen",
      target: "analyse"
    }
  };
  return views[phase] || views.blocked;
}

export function createMatchdaySceneModel({
  teamName,
  opponentBrief,
  opponent,
  competitionLabel,
  roundLabel,
  venueLabel,
  formationName,
  tacticName,
  trainingLabel,
  lastSignal,
  opponentThreat,
  primaryAction,
  readiness = {},
  session = null,
  lastMatch = null,
  report = null
} = {}) {
  const brief = opponentParts(opponentBrief);
  const phase = resolvePhase(session, lastMatch, readiness);
  const view = phaseView(phase);
  const blockers = list(readiness.blockers).map((item) => ({
    code: item?.code || "blocker",
    message: text(item?.message, "Fullfør kampforberedelsen."),
    target: item?.target || "dashboard"
  }));
  const firstBlocker = blockers[0] || null;
  const reportAnalysis = list(report?.analysis);
  const keyFactors = list(report?.keyFactors);
  const resultLabel = report
    ? `${text(report.outcomeLabel, "Resultat")} · ${text(report.scoreLine, "–")}`
    : "Ikke spilt";
  const turningPoint = text(
    report?.bestDecision?.label || report?.decisiveUnit || keyFactors[0],
    phase === "report" ? "Rapporten forklarer kampens viktigste utslag." : "Avgjøres i kampbildet."
  );
  const learningPoint = text(
    report?.nextWeekAdvice || reportAnalysis[0],
    phase === "report" ? "Ta læringen med inn i neste manageruke." : "Assistenten oppsummerer etter kampen."
  );
  const primaryTarget = view.target === "blocker" ? firstBlocker?.target || "details" : view.target;
  const statusSummary = phase === "report"
    ? text(report?.formationVerdict || report?.decisiveUnit, "Kampen er ferdig og klar for analyse.")
    : text(readiness.summary, readiness.canStartMatch ? "Laget er kampklart." : "Kampforberedelsene er ikke fullført.");
  const opponentName = text(opponent?.name || brief.name, "Motstander");
  const opponentContext = [
    text(competitionLabel, ""),
    text(roundLabel, ""),
    text(venueLabel, ""),
    text(opponent?.era || opponent?.archetypeName || brief.context, "")
  ].filter(Boolean).join(" · ");
  const planLabel = [formationName, tacticName].filter(Boolean).join(" · ") || "Ingen kampplan valgt";
  const threatLabel = text(
    opponentThreat || opponent?.threat || opponent?.style || opponent?.archetypeName,
    "Les motstanderens viktigste trussel i kampbriefen."
  );

  return {
    phase,
    stages: buildStages(phase),
    eyebrow: view.eyebrow,
    title: view.title,
    statusLabel: view.status,
    statusTone: view.tone,
    teamName: text(teamName, "Ditt lag"),
    opponentName,
    opponentContext: opponentContext || brief.context,
    planLabel,
    trainingLabel: text(trainingLabel, "Ikke valgt"),
    signalLabel: text(lastSignal, "Ingen nye klubbsignaler"),
    threatLabel,
    primaryAction: text(primaryAction, view.action),
    primaryTarget,
    summary: statusSummary,
    blockers,
    result: {
      label: resultLabel,
      turningPoint,
      learningPoint
    },
    statusCards: [
      {
        id: "readiness",
        label: "Kampklarhet",
        value: phase === "report" ? resultLabel : view.status,
        detail: blockers.length > 0 ? blockers[0].message : statusSummary,
        tone: blockers.length > 0 ? "blocked" : phase === "live" ? "live" : "ready",
        target: blockers.length > 0 ? firstBlocker.target : "details"
      },
      {
        id: "plan",
        label: "Formasjon og kampplan",
        value: planLabel,
        detail: "Åpne Lag for å endre oppstilling, roller eller kampplan.",
        tone: planLabel === "Ingen kampplan valgt" ? "blocked" : "neutral",
        target: "tactics"
      },
      {
        id: "training",
        label: "Treningsuka",
        value: text(trainingLabel, "Ikke valgt"),
        detail: "Treningen påvirker belastning og støtte i kampbildet.",
        tone: text(trainingLabel, "Ikke valgt") === "Ikke valgt" ? "blocked" : "neutral",
        target: "trening"
      },
      {
        id: "opponent",
        label: "Motstanderens trussel",
        value: threatLabel,
        detail: text(lastSignal, "Åpne kampdetaljene for full brief."),
        tone: "neutral",
        target: phase === "report" ? "analyse" : "details"
      }
    ]
  };
}

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function actionButton(label, className, target, handler) {
  const button = node("button", className, label);
  button.type = "button";
  button.dataset.matchdayTarget = target;
  button.addEventListener("click", () => handler?.(target));
  return button;
}

export function renderManagerMatchdayCommand(container, model, {
  onPrimaryAction,
  onOpenTarget
} = {}) {
  if (!container || !model) return;
  container.replaceChildren();

  const scene = node("section", "matchday-scene");
  scene.dataset.phase = model.phase;
  scene.dataset.tone = model.statusTone;

  const head = node("header", "matchday-scene-head");
  const headCopy = node("div", "matchday-scene-head-copy");
  headCopy.append(node("p", "eyebrow", model.eyebrow), node("h2", "", "Kampdagen"));
  const status = node("span", "matchday-scene-status", model.statusLabel);
  status.dataset.tone = model.statusTone;
  head.append(headCopy, status);
  scene.append(head);

  const stages = node("ol", "matchday-stage-rail");
  stages.setAttribute("aria-label", "Kampdagens tre faser");
  model.stages.forEach((stage, index) => {
    const item = node("li", "matchday-stage");
    item.dataset.state = stage.state;
    item.append(node("span", "matchday-stage-index", String(index + 1)), node("strong", "", stage.label));
    stages.append(item);
  });
  scene.append(stages);

  const versus = node("div", "matchday-scene-versus");
  const home = node("article", "matchday-scene-team is-home");
  home.append(node("span", "", "Ditt lag"), node("strong", "", model.teamName));
  const marker = node("div", "matchday-scene-marker");
  marker.append(node("strong", "", "VS"), node("small", "", model.statusTone === "live" ? "LIVE" : "KAMP"));
  const away = node("article", "matchday-scene-team is-away");
  away.append(node("span", "", "Motstander"), node("strong", "", model.opponentName), node("small", "", model.opponentContext));
  versus.append(home, marker, away);
  scene.append(versus);

  const priority = node("section", "matchday-scene-priority");
  const priorityCopy = node("div", "matchday-scene-priority-copy");
  priorityCopy.append(node("span", "", "Viktig nå"), node("strong", "", model.title), node("p", "", model.summary));
  const primary = actionButton(model.primaryAction, "matchday-scene-action", model.primaryTarget, onPrimaryAction);
  priority.append(priorityCopy, primary);
  scene.append(priority);

  const context = node("div", "matchday-scene-context");
  const plan = node("article", "matchday-scene-context-card");
  plan.append(node("span", "", "Kampplan"), node("strong", "", model.planLabel));
  const training = node("article", "matchday-scene-context-card");
  training.append(node("span", "", "Treningsuke"), node("strong", "", model.trainingLabel));
  const signal = node("article", "matchday-scene-context-card");
  signal.append(node("span", "", "Assistentens signal"), node("strong", "", model.signalLabel));
  context.append(plan, training, signal);
  scene.append(context);

  const statusGrid = node("div", "matchday-scene-status-grid");
  model.statusCards.forEach((card) => {
    const button = actionButton("", "matchday-scene-status-card", card.target, onOpenTarget);
    button.dataset.tone = card.tone;
    button.setAttribute("aria-label", `${card.label}: ${card.value}`);
    button.append(node("span", "", card.label), node("strong", "", card.value), node("small", "", card.detail));
    statusGrid.append(button);
  });
  scene.append(statusGrid);

  if (model.phase === "report") {
    const report = node("section", "matchday-scene-report");
    report.append(
      node("span", "", "Resultat"),
      node("strong", "", model.result.label),
      node("p", "", model.result.turningPoint),
      node("small", "", model.result.learningPoint)
    );
    scene.append(report);
  }

  container.append(scene);
}
