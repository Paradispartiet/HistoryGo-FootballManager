import {
  MEDICAL_REHABILITATION_APPROACHES,
  createMedicalRehabilitationPath,
  createRehabilitationMatchEvidence,
  createMedicalDecisionCase,
  evaluateMedicalDecision,
  evaluateRehabilitationAvailability,
  updateMedicalRehabilitationPlan
} from "../football-medical-decision-learning.js";
import { MODE_SESSION_KEY, normalizeMode } from "../football-mode-sessions.js";
import {
  createOpponentAnalysisPlan,
  createOpponentAnalysisWorkspace,
  getOpponentAnalysisFocus
} from "../football-opponent-analysis.js";
import {
  getOpponentAnalysisContext,
  openOpponentAnalysisTarget,
  saveOpponentAnalysisPlan
} from "../football-opponent-analysis-bridge.js";

const STYLE_ID = "managerClubLearningV1Style";
const PLAYER_CONDITION_KEY = "hgfm.playerCondition.v1";

const ROOM_LEARNING = Object.freeze({
  "Treningsanlegg": Object.freeze({
    intro: "Treningsanlegget er et sted og et arbeidsmiljø, ikke en rating. Klubbspesifikke fakta skal bare vises når de finnes i canonical klubbdata.",
    heading: "Dette skal dokumenteres i anlegget",
    items: Object.freeze([
      ["Baner og underlag", "Hvilke treningsflater klubben faktisk disponerer, underlag, størrelse og hvordan de brukes gjennom uka."],
      ["Rom og soner", "Styrkerom, behandlingsrom, møterom, garderober og andre dokumenterte arbeidsrom rundt treningsfeltet."],
      ["Utstyr og materialforvaltning", "Baller, mål, vester, kjegler, GPS-/analyseutstyr og annet materiell skal beskrives når klubbkilden dokumenterer det — ikke modelleres som bonuspoeng."],
      ["Organisering av treningsarbeidet", "Hvordan trenerteam, fysisk apparat, analyse og materialforvaltning samarbeider rundt den faktiske treningsdagen." ]
    ]),
    note: "Når opplysningene mangler, skal rommet si «ikke dokumentert». Det er en datagrense, ikke et lavt fasilitetsnivå."
  }),
  "Medisinsk apparat": Object.freeze({
    intro: "Det medisinske apparatet følger spillerens vei fra første signal til trygg retur. Den eksisterende player-condition-, belastnings- og treningsstaten er fortsatt sannhetskilden.",
    heading: "Arbeidskjeden",
    items: Object.freeze([
      ["1 · Identifisere", "Registrer smerte, skadehendelse, sykdom eller uvanlig belastningssignal."],
      ["2 · Undersøke", "Avklar funksjon, symptomer og hva spilleren faktisk tåler før videre aktivitet."],
      ["3 · Akuttbehandle", "Håndter det som må gjøres umiddelbart og avgjør om spilleren skal tas ut av aktivitet."],
      ["4 · Rehabilitere", "Bygg kapasiteten gradvis tilbake gjennom belastning som passer skaden og spillerens respons."],
      ["5 · Forebygge", "Bruk skadehistorikk, treningsbelastning og individuelle behov til å redusere unødvendig risiko."],
      ["6 · Belastningsstyre", "Se trening, kampbelastning og restitusjon i sammenheng i stedet for som separate prosentbonuser."],
      ["7 · Returnere", "Spilleren går tilbake til trening og kamp når den eksisterende condition- og tilgjengelighetslogikken faktisk tillater det." ]
    ]),
    note: "HGFM oppretter ingen egen medisinsk overall eller recovery-rating for å representere dette arbeidet."
  }),
  "Analyse": Object.freeze({
    intro: "Analyseavdelingen arbeider med den terminfestede motstanderen, lagets faktiske system og registrerte matchup-signaler. Profilen er et faglig utgangspunkt, ikke en fasit på hvordan kampen vil bli.",
    heading: "Arbeidskjeden",
    items: Object.freeze([
      ["1 · Observere", "Skill det profilen faktisk viser fra antakelser om hva motstanderen kommer til å gjøre."],
      ["2 · Avgrense", "Velg ett spørsmål. En analyse som prøver å dekke alt gir sjelden et tydelig kampforberedende grep."],
      ["3 · Formulere hypotese", "Beskriv hva du tror kan skje, og hvilken sammenheng mellom rom, spillere og handlinger som må undersøkes."],
      ["4 · Velge motgrep", "Knytt hypotesen til eksisterende trening, oppstilling eller kampplan uten å gjøre rådet til automatisk fasit."],
      ["5 · Observere i kamp", "Bestem på forhånd hvilken konkret atferd som kan støtte eller svekke hypotesen." ]
    ]),
    note: "Den lagrede planen påvirker kampklarheten som et gjennomført arbeidssteg, men gir ingen skjult styrke-, xG- eller kampbonus."
  })
});

function node(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-club-learning-v1.css", import.meta.url).href;
  document.head.append(link);
}

function readMedicalContext() {
  try {
    const envelope = JSON.parse(localStorage.getItem(MODE_SESSION_KEY) || "null");
    const activeMode = normalizeMode(envelope?.activeMode);
    const activeSession = envelope?.sessions?.[activeMode];
    if (activeSession && Array.isArray(activeSession.playerCondition)) {
      return {
        conditions: activeSession.playerCondition,
        individualTraining: activeSession.individualTraining || null,
        plan: activeSession.medicalRehabilitationPlan || null,
        currentWeek: Number(activeSession?.clubWeekState?.week) || 1,
        lastMatch: activeSession?.matchday?.lastMatch || null
      };
    }
  } catch {
    // En korrupt konvolutt skal ikke gjøre den migrerte league-conditionen
    // uleselig. Legacy-nøkkelen under er bare fallback, aldri førstevalg.
  }
  try {
    const value = JSON.parse(localStorage.getItem(PLAYER_CONDITION_KEY) || "null");
    return {
      conditions: Array.isArray(value) ? value : [],
      individualTraining: null,
      plan: null,
      currentWeek: 1,
      lastMatch: null
    };
  } catch {
    return { conditions: [], individualTraining: null, plan: null, currentWeek: 1, lastMatch: null };
  }
}

function readConditions() {
  return readMedicalContext().conditions;
}

function renderMedicalOutcome(container, outcome) {
  container.hidden = false;
  container.dataset.status = outcome.status;
  container.replaceChildren(
    node("strong", "", outcome.label),
    node("p", "", outcome.explanation),
    node("p", "medical-decision-consequence", outcome.consequence),
    node("small", "", outcome.guardrail)
  );
}

function appendMedicalDecisionWorkshop(body) {
  const decisionCase = createMedicalDecisionCase(readConditions());
  const workshop = node("section", "medical-decision-workshop-v1");
  workshop.dataset.caseKind = decisionCase.kind;
  workshop.setAttribute("aria-labelledby", "medicalDecisionWorkshopTitle");
  const kicker = node("span", "medical-decision-kicker", "Situasjon → valg → faglig konsekvens");
  const title = node("h3", "", "Medisinsk beslutningsverksted");
  title.id = "medicalDecisionWorkshopTitle";
  workshop.append(kicker, title, node("strong", "medical-decision-headline", decisionCase.headline), node("p", "", decisionCase.situation));

  if (decisionCase.kind === "no_case") {
    workshop.append(node("p", "medical-decision-empty", decisionCase.question));
    body.append(workshop);
    return;
  }

  const evidence = node("div", "medical-decision-evidence");
  const known = node("section", "");
  known.append(node("strong", "", "Dette vet vi"));
  const knownList = node("ul", "");
  decisionCase.known.forEach((item) => knownList.append(node("li", "", item)));
  known.append(knownList);
  const missing = node("section", "");
  missing.append(node("strong", "", "Dette mangler før en sikker konklusjon"));
  const missingList = node("ul", "");
  decisionCase.missing.forEach((item) => missingList.append(node("li", "", item)));
  missing.append(missingList);
  evidence.append(known, missing);

  const question = node("p", "medical-decision-question", decisionCase.question);
  question.id = "medicalDecisionQuestion";
  const choices = node("div", "medical-decision-choices");
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-labelledby", question.id);
  const outcome = node("div", "medical-decision-outcome");
  outcome.hidden = true;
  outcome.setAttribute("aria-live", "polite");

  decisionCase.choices.forEach((choice) => {
    const button = node("button", "medical-decision-choice", choice.label);
    button.type = "button";
    button.dataset.medicalDecision = choice.id;
    button.addEventListener("click", () => {
      choices.querySelectorAll("button").forEach((candidate) => candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false"));
      const result = evaluateMedicalDecision(decisionCase, choice.id);
      if (result) renderMedicalOutcome(outcome, result);
    });
    button.setAttribute("aria-pressed", "false");
    choices.append(button);
  });

  const source = node("p", "medical-decision-source", "Faggrunnlag: kriteriebasert og individuelt tilpasset rehabilitering; retur vurderes mot symptomer, funksjon, fotballkrav og en delt beslutning i støtteapparatet.");
  workshop.append(evidence, question, choices, outcome, source);
  body.append(workshop);
}

function saveMedicalRehabilitationPlan(plan) {
  const detail = { plan };
  window.dispatchEvent(new CustomEvent("hgfm:medical-rehabilitation-plan-save", { detail }));
  return detail.savedPlan === undefined ? plan : detail.savedPlan;
}

function openIndividualRehabilitation() {
  const button = document.querySelector('#managerClubRoomDrawer [data-club-room-action="individual-training"]');
  if (button instanceof HTMLElement) button.click();
}

function appendMedicalRehabilitationPath(body) {
  const context = readMedicalContext();
  let localPlan = context.plan;
  const shell = node("section", "medical-rehabilitation-path-v2");
  shell.setAttribute("aria-labelledby", "medicalRehabilitationTitle");

  function render() {
    const path = createMedicalRehabilitationPath({ ...context, plan: localPlan });
    shell.replaceChildren();
    if (!path) return;
    shell.dataset.stage = path.currentStage.id;
    shell.append(
      node("span", "medical-rehabilitation-kicker", "Skade → opptrening → lagtrening → kamp"),
      node("h3", "", "Rehabiliteringsforløp v2"),
      node("strong", "medical-rehabilitation-player", path.playerName),
      node("p", "medical-rehabilitation-purpose", path.currentStage.purpose)
    );
    shell.querySelector("h3").id = "medicalRehabilitationTitle";

    const stages = node("ol", "medical-rehabilitation-stages");
    path.stages.forEach((stage) => {
      const item = node("li", "", stage.shortLabel);
      item.dataset.status = stage.status;
      item.title = `${stage.label}: ${stage.purpose}`;
      if (stage.status === "current") item.setAttribute("aria-current", "step");
      stages.append(item);
    });
    shell.append(stages);

    if (!path.plan) {
      shell.append(node("p", "medical-rehabilitation-question", "Hvordan vil støtteapparatet styre tilbakeføringen?"));
      const approaches = node("div", "medical-rehabilitation-approaches");
      MEDICAL_REHABILITATION_APPROACHES.forEach((approach) => {
        const button = node("button", "medical-rehabilitation-approach");
        button.type = "button";
        button.dataset.medicalRehabApproach = approach.id;
        button.append(node("strong", "", approach.label), node("span", "", approach.summary), node("small", "", approach.consequence));
        button.addEventListener("click", () => {
          localPlan = saveMedicalRehabilitationPlan(updateMedicalRehabilitationPlan(path, {
            actionId: "start",
            approachId: approach.id,
            currentWeek: context.currentWeek,
            baselineMatchId: context.lastMatch?.id || null
          }));
          render();
        });
        approaches.append(button);
      });
      shell.append(approaches, node("p", "medical-rehabilitation-guardrail", "Arbeidsmåten endrer ikke skadeuker eller belastning. Den gjør managerens intensjon synlig gjennom det eksisterende forløpet."));
      return;
    }

    const approach = node("section", "medical-rehabilitation-selected-approach");
    approach.append(
      node("span", "", "Valgt arbeidsmåte"),
      node("strong", "", path.approach?.label || "Kriteriestyrt progresjon"),
      node("p", "", path.approach?.summary || "Neste trinn vurderes mot eksisterende signaler.")
    );
    shell.append(approach);

    const evidence = node("div", "medical-rehabilitation-evidence");
    const known = node("section", "");
    known.append(node("strong", "", "Registrert nå"));
    const knownList = node("ul", "");
    path.known.forEach((item) => knownList.append(node("li", "", item)));
    known.append(knownList);
    const criteria = node("section", "");
    criteria.append(node("strong", "", `Kriterier · ${path.currentStage.label}`));
    const criteriaList = node("ul", "medical-rehabilitation-criteria");
    path.criteria.forEach((item) => {
      const row = node("li", "", item.label);
      row.dataset.met = item.met ? "true" : "false";
      criteriaList.append(row);
    });
    criteria.append(criteriaList);
    evidence.append(known, criteria);
    shell.append(evidence, node("p", "medical-rehabilitation-watch", `Observer: ${path.currentStage.watch}`));

    const actions = node("div", "medical-rehabilitation-actions");
    const individual = node("button", "medical-rehabilitation-secondary", path.hasRehabAssignment ? "Opptrening er valgt" : "Velg Opptrening");
    individual.type = "button";
    individual.dataset.medicalRehabAction = "individual-training";
    individual.addEventListener("click", openIndividualRehabilitation);
    const hold = node("button", "medical-rehabilitation-secondary", "Behold dette trinnet");
    hold.type = "button";
    hold.dataset.medicalRehabAction = "hold";
    hold.addEventListener("click", () => {
      localPlan = saveMedicalRehabilitationPlan(updateMedicalRehabilitationPlan(path, {
        actionId: "hold",
        currentWeek: context.currentWeek
      }));
      render();
    });
    const advance = node("button", "medical-rehabilitation-primary", path.canAdvance
      ? `Registrer overgang til ${path.stages[path.currentStageIndex + 1]?.shortLabel || "neste trinn"}`
      : "Neste trinn mangler støtte");
    advance.type = "button";
    advance.dataset.medicalRehabAction = "advance";
    advance.disabled = !path.canAdvance;
    advance.addEventListener("click", () => {
      localPlan = saveMedicalRehabilitationPlan(updateMedicalRehabilitationPlan(path, {
        actionId: "advance",
        currentWeek: context.currentWeek
      }));
      render();
    });
    actions.append(individual, hold, advance);
    shell.append(actions);

    if (!path.condition.injury) {
      shell.append(node("p", "medical-rehabilitation-question", "Hvordan skal spilleren brukes i neste kamp?"));
      const availability = node("div", "medical-rehabilitation-availability");
      [
        ["out", "Ute"],
        ["bench", "Benk · begrensede minutter"],
        ["start", "Start"]
      ].forEach(([id, label]) => {
        const button = node("button", "medical-rehabilitation-availability-choice", label);
        button.type = "button";
        button.dataset.medicalAvailability = id;
        button.setAttribute("aria-pressed", path.plan?.availabilityDecisionId === id ? "true" : "false");
        button.addEventListener("click", () => {
          localPlan = saveMedicalRehabilitationPlan(updateMedicalRehabilitationPlan(path, {
            actionId: "availability",
            availabilityDecisionId: id,
            currentWeek: context.currentWeek,
            baselineMatchId: context.lastMatch?.id || null
          }));
          render();
        });
        availability.append(button);
      });
      shell.append(availability);
      const selectedDecision = path.plan?.availabilityDecisionId;
      const outcome = evaluateRehabilitationAvailability(path, selectedDecision);
      if (outcome) {
        const result = node("section", "medical-rehabilitation-availability-outcome");
        result.dataset.status = outcome.status;
        result.append(node("strong", "", outcome.label), node("p", "", outcome.explanation), node("small", "", outcome.guardrail));
        shell.append(result);
      }
    }

    const matchEvidence = createRehabilitationMatchEvidence(path, context.lastMatch);
    if (matchEvidence) {
      const comparison = node("section", "medical-rehabilitation-match-evidence");
      comparison.append(
        node("span", "", `Etter kamp · ${matchEvidence.opponent}`),
        node("strong", "", `Plan: ${matchEvidence.intended} · faktisk: ${matchEvidence.actual}`),
        node("p", "", matchEvidence.conditionSignal),
        node("small", "", matchEvidence.uncertainty)
      );
      comparison.dataset.aligned = matchEvidence.aligned ? "true" : "false";
      shell.append(comparison);
    }

    if (path.currentStage.id === "match_ready" && path.plan?.availabilityDecisionId) {
      const complete = node("button", "medical-rehabilitation-complete", "Avslutt dokumentert forløp");
      complete.type = "button";
      complete.dataset.medicalRehabAction = "complete";
      complete.addEventListener("click", () => {
        localPlan = saveMedicalRehabilitationPlan(null);
        shell.replaceChildren(node("p", "medical-rehabilitation-empty", "Forløpet er avsluttet. Player-condition fortsetter å følge belastning og eventuelle nye signaler."));
      });
      shell.append(complete);
    }

    shell.append(node("p", "medical-rehabilitation-guardrail", "Planen er dokumentasjon og managerintensjon. Player-condition, individuell trening og kampens faktiske minutter er fortsatt fasit."));
  }

  render();
  if (shell.childElementCount > 0) body.append(shell);
}

function appendList(parent, items, className = "") {
  const list = node("ul", className);
  items.forEach((item) => list.append(node("li", "", item)));
  parent.append(list);
  return list;
}

function appendOpponentAnalysisWorkshop(body) {
  const context = getOpponentAnalysisContext();
  const workshop = node("section", "opponent-analysis-workshop-v1");
  workshop.setAttribute("aria-labelledby", "opponentAnalysisWorkshopTitle");
  workshop.append(
    node("span", "opponent-analysis-kicker", "Observasjon → hypotese → motgrep → kamp"),
    node("h3", "", "Motstanderforberedelse")
  );
  workshop.querySelector("h3").id = "opponentAnalysisWorkshopTitle";

  const fixtures = Array.isArray(context?.fixtures) ? context.fixtures : [];
  if (!context || fixtures.length === 0) {
    const empty = createOpponentAnalysisWorkspace();
    workshop.dataset.caseKind = empty.kind;
    workshop.append(node("strong", "opponent-analysis-headline", empty.headline), node("p", "opponent-analysis-empty", empty.explanation));
    body.append(workshop);
    return;
  }

  workshop.dataset.caseKind = "fixture";
  const picker = node("div", "opponent-analysis-fixture-picker");
  const label = node("label", "", "Velg terminfestet kamp");
  label.htmlFor = "opponentAnalysisFixture";
  const select = node("select", "");
  select.id = "opponentAnalysisFixture";
  fixtures.forEach((fixture) => {
    const option = node("option", "", `Runde ${fixture.round} · ${fixture.opponent?.name || "Ukjent"} · ${fixture.homeAway === "home" ? "hjemme" : "borte"}`);
    option.value = fixture.fixtureId;
    select.append(option);
  });
  const initialFixtureId = fixtures.some((fixture) => fixture.fixtureId === context.savedPlan?.fixtureId)
    ? context.savedPlan.fixtureId
    : context.currentFixtureId || fixtures[0].fixtureId;
  select.value = initialFixtureId;
  picker.append(label, select, node("small", "", "Bare planen for nærmeste kamp teller i kampklarheten. Du kan likevel undersøke senere kamper."));
  workshop.append(picker);

  const dynamic = node("div", "opponent-analysis-dynamic");
  dynamic.setAttribute("aria-live", "polite");
  workshop.append(dynamic);
  let selectedFocusId = context.savedPlan?.fixtureId === initialFixtureId ? context.savedPlan.focusId : null;
  let selectedCountermeasureId = context.savedPlan?.fixtureId === initialFixtureId ? context.savedPlan.countermeasureId : null;

  function render() {
    dynamic.replaceChildren();
    const fixture = fixtures.find((entry) => entry.fixtureId === select.value) || fixtures[0];
    const workspace = createOpponentAnalysisWorkspace({
      fixture,
      formation: context.formation,
      tactic: context.tactic,
      trainingLabel: context.trainingLabel
    });
    const saved = context.savedPlan?.fixtureId === fixture.fixtureId ? context.savedPlan : null;

    const brief = node("section", "opponent-analysis-brief");
    brief.append(
      node("span", "opponent-analysis-status", fixture.fixtureId === context.currentFixtureId
        ? (context.currentPlanReady ? "Nærmeste kamp · analyse registrert" : "Nærmeste kamp · analyse mangler")
        : "Senere terminfestet kamp"),
      node("h4", "", `${workspace.opponent.name}${workspace.homeAway ? ` · ${workspace.homeAway}` : ""}`)
    );
    const profile = node("dl", "opponent-analysis-profile");
    [
      ["Stil", workspace.opponent.styleName || workspace.opponent.style || "Ikke dokumentert"],
      ["Med ball", workspace.opponent.inPossessionShape || "Ikke dokumentert"],
      ["Uten ball", workspace.opponent.outOfPossessionShape || "Ikke dokumentert"],
      ["Vårt utgangspunkt", `${workspace.ownPlan.formation} · ${workspace.ownPlan.tactic}`],
      ["Trening", workspace.ownPlan.training]
    ].forEach(([term, value]) => {
      profile.append(node("dt", "", term), node("dd", "", value));
    });
    brief.append(profile);
    dynamic.append(brief);

    const focusQuestion = node("p", "opponent-analysis-question", "Hva skal analysen undersøke?");
    focusQuestion.id = "opponentAnalysisQuestion";
    const focusChoices = node("div", "opponent-analysis-focuses");
    focusChoices.setAttribute("role", "group");
    focusChoices.setAttribute("aria-labelledby", focusQuestion.id);
    workspace.focuses.forEach((focus) => {
      const button = node("button", "opponent-analysis-focus", focus.label);
      button.type = "button";
      button.dataset.opponentAnalysisFocus = focus.id;
      button.setAttribute("aria-pressed", focus.id === selectedFocusId ? "true" : "false");
      button.addEventListener("click", () => {
        selectedFocusId = focus.id;
        selectedCountermeasureId = null;
        render();
      });
      focusChoices.append(button);
    });
    dynamic.append(focusQuestion, focusChoices);

    const focus = getOpponentAnalysisFocus(workspace, selectedFocusId);
    if (!focus) {
      dynamic.append(node("p", "opponent-analysis-prompt", "Velg ett analysefokus for å skille registrerte observasjoner fra hypotesen du vil teste."));
      return;
    }

    const reasoning = node("section", "opponent-analysis-reasoning");
    reasoning.append(node("strong", "", focus.question), node("h4", "", "Registrerte signaler"));
    appendList(reasoning, focus.signals.length ? focus.signals : ["Motstanderprofilen har ikke et konkret signal på dette området."], "opponent-analysis-signals");
    reasoning.append(node("h4", "", "Arbeidshypotese"), node("p", "", focus.hypothesis));
    dynamic.append(reasoning);

    const counterHeading = node("p", "opponent-analysis-question", "Hvilket motgrep vil du ta med videre?");
    counterHeading.id = "opponentAnalysisCounterQuestion";
    const countermeasures = node("div", "opponent-analysis-countermeasures");
    countermeasures.setAttribute("role", "group");
    countermeasures.setAttribute("aria-labelledby", counterHeading.id);
    focus.countermeasures.forEach((measure) => {
      const button = node("button", "opponent-analysis-countermeasure");
      button.type = "button";
      button.dataset.opponentAnalysisCountermeasure = measure.id;
      button.setAttribute("aria-pressed", measure.id === selectedCountermeasureId ? "true" : "false");
      button.append(
        node("span", "", measure.targetLabel),
        node("strong", "", measure.label),
        node("small", "", measure.why),
        node("small", "", `Risiko: ${measure.risk}`),
        node("small", "", `Se etter: ${measure.watch}`)
      );
      button.addEventListener("click", () => {
        selectedCountermeasureId = measure.id;
        render();
      });
      countermeasures.append(button);
    });
    dynamic.append(counterHeading, countermeasures);

    const actions = node("div", "opponent-analysis-actions");
    const save = node("button", "opponent-analysis-save", saved && saved.focusId === selectedFocusId && saved.countermeasureId === selectedCountermeasureId ? "Plan lagret" : "Lagre analyseplan");
    save.type = "button";
    save.disabled = !selectedCountermeasureId;
    const feedback = node("p", "opponent-analysis-feedback");
    feedback.setAttribute("aria-live", "polite");
    save.addEventListener("click", () => {
      const plan = createOpponentAnalysisPlan({
        workspace,
        focusId: selectedFocusId,
        countermeasureId: selectedCountermeasureId,
        week: context.week
      });
      const result = saveOpponentAnalysisPlan(plan);
      if (!result?.saved) {
        feedback.dataset.status = "error";
        feedback.textContent = result?.reason || "Planen kunne ikke lagres.";
        return;
      }
      context.savedPlan = result.plan;
      context.currentPlanReady = result.currentPlanReady;
      feedback.dataset.status = "saved";
      feedback.textContent = result.currentPlanReady
        ? "Planen er registrert for nærmeste kamp og kampklarheten er oppdatert."
        : "Planen er lagret for en senere kamp. Nærmeste kamp trenger fortsatt sin egen analyse.";
      save.textContent = "Plan lagret";
      const target = node("button", "opponent-analysis-open-target", `Arbeid videre i ${result.plan.targetLabel}`);
      target.type = "button";
      target.addEventListener("click", () => openOpponentAnalysisTarget(result.plan.target));
      actions.querySelector(".opponent-analysis-open-target")?.remove();
      actions.append(target);
    });
    actions.append(save, feedback);
    if (saved?.target) {
      const target = node("button", "opponent-analysis-open-target", `Arbeid videre i ${saved.targetLabel}`);
      target.type = "button";
      target.addEventListener("click", () => openOpponentAnalysisTarget(saved.target));
      actions.append(target);
    }
    dynamic.append(actions, node("p", "opponent-analysis-guardrail", "Planen lagrer observasjon, hypotese og valgt arbeidsretning. Den endrer ingen spillerverdier, kampstyrke, xG eller skjulte bonuser."));
  }

  select.addEventListener("change", () => {
    selectedFocusId = context.savedPlan?.fixtureId === select.value ? context.savedPlan.focusId : null;
    selectedCountermeasureId = context.savedPlan?.fixtureId === select.value ? context.savedPlan.countermeasureId : null;
    render();
  });
  render();
  body.append(workshop);
}

function renderRoomLearning() {
  const drawer = document.getElementById("managerClubRoomDrawer");
  if (!drawer || drawer.hidden) return;
  const title = String(document.getElementById("managerClubRoomTitle")?.textContent || "").trim();
  const config = ROOM_LEARNING[title];
  const body = document.getElementById("managerClubRoomBody");
  if (!config || !body) return;

  const existing = body.querySelector(".club-room-learning-v1");
  if (existing?.dataset.roomTitle === title) return;
  existing?.remove();

  const section = node("section", "club-room-learning-v1");
  section.dataset.roomTitle = title;
  section.setAttribute("aria-label", `${title} · faglig innhold`);
  section.append(node("p", "club-room-learning-intro", config.intro), node("h3", "", config.heading));

  const list = node("div", "club-room-learning-list");
  config.items.forEach(([label, detail]) => {
    const row = node("div", "club-room-learning-row");
    row.append(node("strong", "", label), node("p", "", detail));
    list.append(row);
  });
  section.append(list, node("p", "club-room-learning-note", config.note));
  body.append(section);
  if (title === "Medisinsk apparat") {
    appendMedicalDecisionWorkshop(body);
    appendMedicalRehabilitationPath(body);
  }
  if (title === "Analyse") appendOpponentAnalysisWorkshop(body);
}

function install() {
  ensureStyles();
  renderRoomLearning();
  const observer = new MutationObserver(() => queueMicrotask(renderRoomLearning));
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["hidden"]
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
}
