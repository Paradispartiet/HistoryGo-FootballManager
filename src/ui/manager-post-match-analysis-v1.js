// ============================================================================
// Manager Post-match Analysis v1 — presentation only.
// Reads the completed match report and persisted match consequences.
// No engine ownership, storage, randomness or state mutation.
// ============================================================================

const POST_MATCH_STYLE_ID = "manager-post-match-analysis-v1-style";

export function ensurePostMatchStylesheet() {
  if (typeof document === "undefined" || document.getElementById(POST_MATCH_STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = POST_MATCH_STYLE_ID;
  link.rel = "stylesheet";
  link.href = "src/ui/manager-post-match-analysis-v1.css";
  document.head?.append(link);
}

function text(value, fallback) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function signed(value) {
  const amount = number(value);
  return amount > 0 ? `+${amount}` : String(amount);
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

const CONSEQUENCE_LABELS = Object.freeze({
  boardTrust: "Styrets tillit",
  playerMorale: "Spillermoral",
  tacticalClarity: "Taktisk klarhet",
  trainingCulture: "Treningskultur",
  mediaPressure: "Medietrykk"
});

function formatGoal(goal) {
  const minute = number(goal?.minute);
  const scorer = text(goal?.scorerName, "Ukjent målscorer");
  const assist = text(goal?.assistName, "");
  return {
    minute,
    label: `${minute > 0 ? `${minute}' · ` : ""}${scorer}`,
    detail: assist ? `Målgivende: ${assist}` : "Uten registrert målgivende"
  };
}

function buildContributors(goals) {
  const rows = new Map();
  const ensure = (name) => {
    if (!name) return null;
    if (!rows.has(name)) rows.set(name, { name, goals: 0, assists: 0, points: 0 });
    return rows.get(name);
  };

  goals.forEach((goal) => {
    const scorer = ensure(goal?.scorerName);
    if (scorer) {
      scorer.goals += 1;
      scorer.points += 1;
    }
    const assist = ensure(goal?.assistName);
    if (assist) {
      assist.assists += 1;
      assist.points += 1;
    }
  });

  return [...rows.values()]
    .sort((a, b) => b.points - a.points || b.goals - a.goals || a.name.localeCompare(b.name, "nb"))
    .slice(0, 4)
    .map((row) => ({
      ...row,
      detail: [row.goals ? `${row.goals} mål` : null, row.assists ? `${row.assists} målgivende` : null]
        .filter(Boolean)
        .join(" · ")
    }));
}

function buildConsequences(lastMatch) {
  const effectSource = lastMatch?.clubConsequences?.effects;
  const effects = effectSource && typeof effectSource === "object" && !Array.isArray(effectSource)
    ? Object.entries(effectSource)
      .filter(([, delta]) => Number.isFinite(Number(delta)) && Number(delta) !== 0)
      .map(([metric, delta]) => ({
        metric,
        label: CONSEQUENCE_LABELS[metric] || text(metric, "Klubbsignal"),
        value: signed(delta),
        tone: Number(delta) > 0 ? "positive" : "negative"
      }))
    : [];

  const familiarity = lastMatch?.clubConsequences?.familiarity;
  let familiarityLabel = "Ingen ny tilvenning registrert";
  if (Number.isFinite(Number(familiarity))) {
    familiarityLabel = `${signed(familiarity)} formasjonstilvenning`;
  } else if (familiarity && typeof familiarity === "object") {
    const gain = [familiarity.gain, familiarity.delta, familiarity.familiarityGain, familiarity.value]
      .find((value) => Number.isFinite(Number(value)));
    if (gain !== undefined) familiarityLabel = `${signed(gain)} formasjonstilvenning`;
    else if (familiarity.label) familiarityLabel = text(familiarity.label, familiarityLabel);
  }

  return { effects, familiarityLabel };
}

function buildDecisionReview(report, lastMatch) {
  const decisions = list(report?.decisions).length ? list(report?.decisions) : list(lastMatch?.decisions);
  return {
    best: report?.bestDecision
      ? {
        label: text(report.bestDecision.label, "Beste grep"),
        detail: text(report.bestDecision.eventTitle, "Dette grepet hjalp kampbildet."),
        tone: "positive"
      }
      : null,
    worst: report?.worstDecision
      ? {
        label: text(report.worstDecision.label, "Svakeste grep"),
        detail: text(report.worstDecision.eventTitle, "Dette grepet kostet laget."),
        tone: "negative"
      }
      : null,
    count: decisions.length
  };
}

function fallbackFactors(report) {
  return [...list(report?.keyFactors), ...list(report?.analysis)].filter(Boolean);
}

export function createPostMatchAnalysisModel({ lastMatch = null, report = null } = {}) {
  if (!lastMatch || !report) return null;

  const explanation = report.explanation || lastMatch.explanation || {};
  const score = lastMatch.score || {};
  const expectedGoals = lastMatch.expectedGoals || {};
  const scoreLine = text(report.scoreLine, `${number(score.for)}–${number(score.against)}`);
  const xgLine = text(
    report.expectedGoalsLine,
    `${number(expectedGoals.for).toFixed(2)}–${number(expectedGoals.against).toFixed(2)}`
  );
  const outcome = text(report.outcome || lastMatch.outcome, "draw");
  const outcomeLabel = text(report.outcomeLabel, outcome === "win" ? "Seier" : outcome === "loss" ? "Tap" : "Uavgjort");
  const goals = list(lastMatch?.playerStats?.goals).map(formatGoal);
  const rawGoals = list(lastMatch?.playerStats?.goals);
  const contributors = buildContributors(rawGoals);
  const consequences = buildConsequences(lastMatch);
  const decisionReview = buildDecisionReview(report, lastMatch);
  const fallback = fallbackFactors(report);
  const decisiveFactors = list(explanation.decisiveFactors).length
    ? list(explanation.decisiveFactors).slice(0, 5)
    : fallback.slice(0, 5);
  const tacticalFactors = [
    ...list(explanation.tacticalFactors),
    ...list(explanation.relationshipFactors)
  ].filter(Boolean).slice(0, 5);
  const humanFactors = [
    ...list(explanation.trainingFactors),
    ...list(explanation.offPitchFactors)
  ].filter(Boolean).slice(0, 5);
  const learningPoints = list(explanation.learningPoints).length
    ? list(explanation.learningPoints).slice(0, 4)
    : [report.nextWeekAdvice, ...list(report.analysis)].filter(Boolean).slice(0, 4);
  const nextWeekSuggestions = list(explanation.nextWeekSuggestions).length
    ? list(explanation.nextWeekSuggestions).slice(0, 3)
    : [report.nextWeekAdvice].filter(Boolean);
  const nextDetail = text(
    nextWeekSuggestions[0],
    "Bruk kampens læringspunkt når neste treningsuke planlegges."
  );
  const trainingSource = lastMatch.trainingFocus && typeof lastMatch.trainingFocus === "object"
    ? lastMatch.trainingFocus
    : null;
  const trainingEvidence = trainingSource && (trainingSource.focusId || trainingSource.name)
    ? {
        focusId: text(trainingSource.focusId, ""),
        name: text(trainingSource.name, "Treningsfokus"),
        helped: typeof trainingSource.helped === "boolean" ? trainingSource.helped : null,
        summary: text(trainingSource.summary, "Kampen registrerte ingen egen treningsdom.")
      }
    : null;
  const analysisSource = report.opponentAnalysisPlan || lastMatch.opponentAnalysisPlan || null;
  const trainingHypothesisSource = report.trainingExerciseHypothesis || lastMatch.trainingExerciseHypothesis || null;
  const trainingHypothesis = trainingHypothesisSource && typeof trainingHypothesisSource === "object"
    ? {
        archetypeId: text(trainingHypothesisSource.archetypeId, "generic"),
        title: text(trainingHypothesisSource.title, "Treningsøvelse"),
        setup: text(trainingHypothesisSource.setup, "Oppsett ikke registrert"),
        hypothesis: text(trainingHypothesisSource.hypothesis, "Ingen konkret intensjon ble lagret."),
        watch: text(trainingHypothesisSource.watch, "Ingen observasjon ble lagret.")
      }
    : null;
  const analysisPlan = analysisSource && typeof analysisSource === "object"
    ? {
        focus: text(analysisSource.focusLabel, "Valgt analysefokus"),
        hypothesis: text(analysisSource.hypothesis, "Ingen arbeidshypotese ble lagret."),
        countermeasure: text(analysisSource.countermeasureLabel, "Ingen motgrep ble lagret."),
        risk: text(analysisSource.risk, "Ingen egen risiko ble registrert."),
        watch: text(analysisSource.watch, "Sammenlign hypotesen med de registrerte kampsignalene."),
        evidence: list(analysisSource.evidence).slice(0, 3)
      }
    : null;

  return {
    outcome,
    outcomeLabel,
    outcomeTone: outcome === "win" ? "positive" : outcome === "loss" ? "negative" : "neutral",
    scoreLine,
    xgLine,
    headline: text(
      explanation.headline,
      `${outcomeLabel} ${scoreLine}: ${text(report.formationVerdict || report.decisiveUnit, "kampen ble avgjort på små marginer.")}`
    ),
    summary: text(
      explanation.resultSummary,
      `${outcomeLabel} ${scoreLine}. Forventede mål: ${xgLine}.`
    ),
    decisiveFactors,
    tacticalFactors: tacticalFactors.length ? tacticalFactors : fallback.slice(0, 4),
    humanFactors,
    learningPoints,
    decisions: decisionReview,
    formationVerdict: text(report.formationVerdict, "Ingen egen systemdom er registrert."),
    decisiveUnit: text(report.decisiveUnit, "Ingen enkelt lagdel ble registrert som avgjørende."),
    goals,
    contributors,
    substitutions: list(lastMatch.substitutions).slice(0, 5).map((entry) => ({
      label: `${text(entry?.playerOutName || entry?.outName, "Spiller ut")} → ${text(entry?.playerInName || entry?.inName, "Spiller inn")}`,
      detail: number(entry?.minute) > 0 ? `${number(entry.minute)}. minutt` : text(entry?.reason, "Bytte")
    })),
    consequences,
    trainingEvidence,
    trainingHypothesis,
    analysisPlan,
    exposedWeakness: text(
      report.exposedWeaknessMetric || lastMatch.exposedWeaknessMetric,
      "Ingen maskinlesbar svakhet ble registrert."
    ),
    historyGoHint: text(report.historyGoHint, "Ingen nytt History Go-hint etter denne kampen."),
    next: {
      title: "Gjør kampens læring til neste uke",
      detail: nextDetail,
      primaryLabel: trainingHypothesis?.archetypeId === "rest_defence"
        ? "Ta med overgangsproblemet til neste treningsuke"
        : trainingHypothesis ? "Ta med problemet til neste treningsuke" : "Planlegg neste treningsuke",
      primaryTarget: trainingHypothesis ? "carry_training_problem" : "trening",
      secondaryLabel: "Åpne full kampanalyse",
      secondaryTarget: "analyse"
    }
  };
}

function appendList(container, items, emptyText) {
  const values = list(items);
  if (!values.length) {
    container.append(node("p", "matchday-post-match-empty", emptyText));
    return;
  }
  const listElement = node("ul", "matchday-post-match-list");
  values.forEach((value) => listElement.append(node("li", "", value)));
  container.append(listElement);
}

export function renderPostMatchAnalysis(model, onOpenTarget) {
  const section = node("section", "matchday-post-match");
  section.dataset.outcome = model.outcome;
  if (model.trainingEvidence) {
    section.dataset.trainingFocusId = model.trainingEvidence.focusId;
    section.dataset.trainingFocusName = model.trainingEvidence.name;
    section.dataset.trainingSummary = model.trainingEvidence.summary;
    if (typeof model.trainingEvidence.helped === "boolean") {
      section.dataset.trainingHelped = String(model.trainingEvidence.helped);
    }
  }
  if (model.trainingHypothesis) {
    section.dataset.trainingHypothesisArchetype = model.trainingHypothesis.archetypeId;
    section.dataset.trainingHypothesisTitle = model.trainingHypothesis.title;
    section.dataset.trainingHypothesisSetup = model.trainingHypothesis.setup;
    section.dataset.trainingHypothesisIntent = model.trainingHypothesis.hypothesis;
    section.dataset.trainingHypothesisWatch = model.trainingHypothesis.watch;
  }
  section.setAttribute("aria-labelledby", "postMatchAnalysisTitle");

  const hero = node("header", "matchday-post-match-hero");
  const result = node("div", "matchday-post-match-score");
  result.dataset.tone = model.outcomeTone;
  result.append(
    node("span", "", model.outcomeLabel),
    node("strong", "", model.scoreLine),
    node("small", "", `xG ${model.xgLine}`)
  );
  const heroCopy = node("div", "matchday-post-match-hero-copy");
  const title = node("h3", "", model.headline);
  title.id = "postMatchAnalysisTitle";
  heroCopy.append(node("p", "eyebrow", "Kampanalyse og etterkamp"), title, node("p", "", model.summary));
  hero.append(result, heroCopy);
  section.append(hero);

  const overview = node("div", "matchday-post-match-overview");
  const why = node("article", "matchday-post-match-card is-primary");
  why.append(node("span", "", "Hvorfor kampen endte slik"), node("strong", "", model.decisiveUnit));
  appendList(why, model.decisiveFactors, "Kampen ble avgjort på små marginer uten én registrert hovedfaktor.");

  const tactical = node("article", "matchday-post-match-card");
  tactical.append(node("span", "", "Taktisk evaluering"), node("strong", "", model.formationVerdict));
  appendList(tactical, model.tacticalFactors, "Ingen flere taktiske faktorer er registrert.");

  const human = node("article", "matchday-post-match-card");
  human.append(node("span", "", "Trening, belastning og relasjoner"), node("strong", "", model.learningPoints[0] || "Følg opp laget i neste uke."));
  appendList(human, model.humanFactors, "Kampen ga ingen ekstra registrerte belastnings- eller relasjonssignaler.");
  overview.append(why, tactical, human);
  section.append(overview);

  if (model.analysisPlan) {
    const analysisPlan = node("section", "matchday-post-match-analysis-plan");
    analysisPlan.append(
      node("span", "matchday-post-match-section-head", "Analysehypotesen før kamp"),
      node("strong", "", model.analysisPlan.focus),
      node("p", "", model.analysisPlan.hypothesis)
    );
    appendList(analysisPlan, [
      `Valgt motgrep: ${model.analysisPlan.countermeasure}`,
      `Risikoen du aksepterte: ${model.analysisPlan.risk}`,
      `Observasjonspunkt: ${model.analysisPlan.watch}`,
      ...model.analysisPlan.evidence.map((item) => `Grunnlag før kamp: ${item}`)
    ], "Ingen analyseplan ble registrert før kampen.");
    analysisPlan.append(node("small", "", "Resultatet avgjør ikke om hypotesen var god. Vurder den mot hendelsene og de taktiske signalene kampen faktisk registrerte."));
    section.append(analysisPlan);
  }

  const decisions = node("section", "matchday-post-match-decisions");
  decisions.append(node("div", "matchday-post-match-section-head", "Managerens grep"));
  const decisionGrid = node("div", "matchday-post-match-decision-grid");
  [model.decisions.best, model.decisions.worst].filter(Boolean).forEach((decision) => {
    const card = node("article", "matchday-post-match-decision");
    card.dataset.tone = decision.tone;
    card.append(node("span", "", decision.tone === "positive" ? "Beste grep" : "Svakeste grep"), node("strong", "", decision.label), node("small", "", decision.detail));
    decisionGrid.append(card);
  });
  if (!decisionGrid.children.length) {
    decisionGrid.append(node("p", "matchday-post-match-empty", "Ingen kampgrep ble registrert i denne kampen."));
  }
  decisions.append(decisionGrid);
  section.append(decisions);

  const lower = node("div", "matchday-post-match-lower");
  const players = node("section", "matchday-post-match-panel");
  players.append(node("div", "matchday-post-match-section-head", "Spillerbidrag"));
  if (model.goals.length) {
    const goalList = node("div", "matchday-post-match-event-list");
    model.goals.forEach((goal) => {
      const row = node("article", "matchday-post-match-event");
      row.append(node("strong", "", goal.label), node("small", "", goal.detail));
      goalList.append(row);
    });
    players.append(goalList);
  } else {
    players.append(node("p", "matchday-post-match-empty", "Ingen egne mål ble registrert."));
  }
  if (model.contributors.length) {
    const contributorList = node("div", "matchday-post-match-contributors");
    model.contributors.forEach((contributor) => {
      const row = node("article", "matchday-post-match-contributor");
      row.append(node("strong", "", contributor.name), node("small", "", contributor.detail));
      contributorList.append(row);
    });
    players.append(contributorList);
  }

  const consequences = node("section", "matchday-post-match-panel");
  consequences.append(node("div", "matchday-post-match-section-head", "Konsekvenser"));
  const effects = node("div", "matchday-post-match-effects");
  model.consequences.effects.forEach((effect) => {
    const row = node("article", "matchday-post-match-effect");
    row.dataset.tone = effect.tone;
    row.append(node("span", "", effect.label), node("strong", "", effect.value));
    effects.append(row);
  });
  if (!effects.children.length) effects.append(node("p", "matchday-post-match-empty", "Ingen klubbverdier ble endret av kampen."));
  consequences.append(effects, node("p", "matchday-post-match-familiarity", model.consequences.familiarityLabel));
  lower.append(players, consequences);
  section.append(lower);

  const next = node("section", "matchday-post-match-next");
  const nextCopy = node("div", "");
  nextCopy.append(node("span", "", "Neste managerhandling"), node("strong", "", model.next.title), node("p", "", model.next.detail));
  const actions = node("div", "matchday-post-match-actions");
  actions.append(
    actionButton(model.next.primaryLabel, "matchday-post-match-primary", model.next.primaryTarget, onOpenTarget),
    actionButton(model.next.secondaryLabel, "matchday-post-match-secondary", model.next.secondaryTarget, onOpenTarget)
  );
  next.append(nextCopy, actions);
  section.append(next);

  return section;
}
