function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function titleCase(value, fallback = "Trening") {
  const text = typeof value === "string" && value ? value.replaceAll("_", " ") : fallback;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const STEP_TARGETS = Object.freeze({
  inbox: "inbox",
  program: "trainingProgramStep",
  focus: "trainingFocusStep",
  individual: "individualTrainingStep"
});

function actionForStep(step) {
  if (!step) return { label: "Gå til Kamp", target: "kamp", tone: "positive" };
  return {
    label: `Fortsett: ${String(step.title || "neste steg").toLowerCase()}`,
    target: STEP_TARGETS[step.id] || step.target || "trening",
    tone: "attention"
  };
}

function squadStatus(conditionSummary = {}) {
  const injured = Math.max(0, number(conditionSummary.injuredCount));
  const tired = Math.max(0, number(conditionSummary.tiredCount));
  const tracked = Math.max(0, number(conditionSummary.tracked));
  if (injured > 0) {
    return {
      value: `${injured} skadet`,
      detail: tired > 0 ? `${tired} andre trenger avlastning.` : "Skadeoppfølging må vurderes.",
      tone: "negative"
    };
  }
  if (tired > 0) {
    return { value: `${tired} slitne`, detail: "Belastningen bør styres før neste kamp.", tone: "attention" };
  }
  return {
    value: tracked > 0 ? "Frisk tropp" : "Ingen belastning",
    detail: tracked > 0 ? "Ingen spillere krever akutt avlastning." : "Troppstilstanden fylles etter kampbruk.",
    tone: "positive"
  };
}

export function createManagerTrainingSceneModel({
  week = 1,
  phase = "training",
  opponent = null,
  plan = null,
  assistantSignal = "Les klubbens signaler før du bestemmer treningsuka.",
  assistantDetail = "Programmet styrer belastningen. Fokuset styrer kampens tema.",
  conditionSummary = null,
  selectedProgram = null,
  selectedFocus = null,
  individualSummary = null
} = {}) {
  const steps = asArray(plan?.steps);
  const plannedNextStep = steps.find((step) => step.id === plan?.nextStepId)
    || steps.find((step) => !step.done)
    || null;
  // Individuell trening er oppfølging, ikke en kampport. Når ukeplanen allerede
  // er spillbar, skal manageren kunne gå videre uten å fylle en kunstig kvote.
  const nextStep = plannedNextStep?.id === "individual" && plan?.ready
    ? null
    : plannedNextStep;
  const completedSteps = steps.filter((step) => step.done).length;
  const squad = squadStatus(conditionSummary || {});
  const individualUsed = Math.max(0, number(individualSummary?.used));
  const action = actionForStep(nextStep);
  const load = plan?.load || { label: "Belastning ukjent", note: "Velg program for å beregne ukas belastning.", level: "normal" };
  const coherence = plan?.coherence || { label: "Ikke ferdig valgt", note: "Velg program og fokus.", level: "ufullstendig" };
  const opponentName = opponent?.name || opponent?.opponent || "Motstander ikke klar";
  const opponentMeta = [
    opponent?.homeAway === "home" ? "Hjemme" : opponent?.homeAway === "away" ? "Borte" : null,
    opponent?.ground || opponent?.venue || null,
    opponent?.styleName || opponent?.archetypeName || null
  ].filter(Boolean).join(" · ") || "Kampbriefen fylles når neste kamp er terminfestet.";

  return {
    week: Math.max(1, number(week, 1)),
    phaseLabel: titleCase(phase),
    headline: plan?.headline || `Uke ${Math.max(1, number(week, 1))}: treningsuka er ikke valgt.`,
    assistant: {
      signal: assistantSignal || "Les klubbens signaler før du bestemmer treningsuka.",
      detail: assistantDetail || coherence.note,
      tone: conditionSummary?.injuredCount > 0 || conditionSummary?.tiredCount > 0 ? "attention" : "neutral"
    },
    opponent: { name: opponentName, meta: opponentMeta, available: Boolean(opponent) },
    load: { label: load.label, detail: load.note, tone: load.level === "svært_hard" ? "negative" : load.level === "hard" ? "attention" : "positive" },
    coherence: { label: coherence.label, detail: coherence.note, tone: coherence.level === "sprik" ? "negative" : coherence.level === "samsvar" ? "positive" : "neutral" },
    statuses: [
      { id: "squad", label: "Tropp", ...squad, target: "details" },
      {
        id: "program",
        label: "Program",
        value: selectedProgram?.title || "Ikke valgt",
        detail: selectedProgram ? "Ukas ramme og arbeidsmengde er satt." : "Velg fire økter som henger sammen.",
        tone: selectedProgram ? "positive" : "negative",
        target: "trainingProgramStep"
      },
      {
        id: "focus",
        label: "Fokus",
        value: selectedFocus?.name || "Ikke valgt",
        detail: selectedFocus ? selectedFocus.effectHint || "Kampens tema er prioritert." : "Velg det ene temaet laget tar med inn i kampen.",
        tone: selectedFocus ? "positive" : "negative",
        target: "trainingFocusStep"
      },
      {
        id: "individual",
        label: "Individuell",
        value: individualUsed > 0 ? `${individualUsed} følges opp` : "Valgfritt",
        detail: individualSummary?.detail || "Brukes ved rolletrening, slitasje, form eller skade.",
        tone: individualUsed > 0 ? "positive" : "neutral",
        target: "individualTrainingStep"
      }
    ],
    progress: { completed: completedSteps, total: Math.max(steps.length, 4), ready: Boolean(plan?.ready) },
    action,
    complete: !nextStep,
    nextStepId: nextStep?.id || null
  };
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function statusButton(status, onOpenTarget) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "training-command-status";
  button.dataset.tone = status.tone;
  button.dataset.trainingTarget = status.target;
  button.setAttribute("aria-label", `${status.label}: ${status.value}. ${status.detail}`);
  button.append(
    textElement("span", "training-command-status-label", status.label),
    textElement("strong", "training-command-status-value", status.value),
    textElement("small", "training-command-status-detail", status.detail)
  );
  if (typeof onOpenTarget === "function") button.addEventListener("click", () => onOpenTarget(status.target));
  return button;
}

export function renderManagerTrainingCommand(container, model, { onOpenTarget } = {}) {
  if (!container) return;
  container.textContent = "";
  container.dataset.ready = model.progress.ready ? "true" : "false";

  const header = document.createElement("header");
  header.className = "training-command-head";
  const heading = document.createElement("div");
  heading.append(
    textElement("p", "eyebrow", `Uke ${model.week} · ${model.phaseLabel}`),
    textElement("h2", "", "Treningsuka"),
    textElement("p", "training-command-headline", model.headline)
  );
  const opponent = document.createElement("button");
  opponent.type = "button";
  opponent.className = "training-opponent-brief";
  opponent.disabled = !model.opponent.available;
  opponent.append(
    textElement("span", "", "Neste kamp"),
    textElement("strong", "", model.opponent.name),
    textElement("small", "", model.opponent.meta)
  );
  if (model.opponent.available && typeof onOpenTarget === "function") opponent.addEventListener("click", () => onOpenTarget("kamp"));
  header.append(heading, opponent);

  const reading = document.createElement("div");
  reading.className = "training-command-reading";
  const assistant = document.createElement("article");
  assistant.className = "training-assistant-signal";
  assistant.dataset.tone = model.assistant.tone;
  assistant.append(
    textElement("span", "", "Assistentens viktigste signal"),
    textElement("strong", "", model.assistant.signal),
    textElement("p", "", model.assistant.detail)
  );
  const load = document.createElement("article");
  load.className = "training-load-brief";
  load.dataset.tone = model.load.tone;
  load.append(
    textElement("span", "", "Ukas belastning"),
    textElement("strong", "", model.load.label),
    textElement("p", "", model.load.detail),
    textElement("small", "", `${model.coherence.label}: ${model.coherence.detail}`)
  );
  reading.append(assistant, load);

  const statusGrid = document.createElement("div");
  statusGrid.className = "training-command-status-grid";
  model.statuses.forEach((status) => statusGrid.append(statusButton(status, onOpenTarget)));

  const next = document.createElement("section");
  next.className = "training-command-next";
  next.dataset.complete = model.complete ? "true" : "false";
  const nextCopy = document.createElement("div");
  nextCopy.append(
    textElement("span", "", model.complete ? "Treningsuka er klar" : "Aktiv beslutning"),
    textElement("strong", "", model.complete ? "Gå videre til kampforberedelsen" : model.action.label.replace(/^Fortsett:\s*/i, "")),
    textElement("small", "", `${model.progress.completed}/${model.progress.total} steg registrert. Valgene lagres automatisk.`)
  );
  const action = document.createElement("button");
  action.type = "button";
  action.className = "training-command-action";
  action.dataset.trainingTarget = model.action.target;
  action.textContent = model.action.label;
  if (typeof onOpenTarget === "function") action.addEventListener("click", () => onOpenTarget(model.action.target));
  next.append(nextCopy, action);

  container.append(header, reading, statusGrid, next);
}
