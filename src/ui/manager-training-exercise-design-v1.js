import {
  EXERCISE_DESIGN_CONTROLS,
  createTrainingExerciseHypothesis,
  createDefaultExerciseDesign,
  evaluateTrainingExerciseDesign
} from "../football-training-exercise-design.js";
import { MODE_SESSION_KEY } from "../football-mode-sessions.js";

const STYLE_ID = "managerTrainingExerciseDesignV1Style";
const DIALOG_ID = "managerTrainingExerciseDesignV1";

let activeSession = null;
let activeConfig = null;

function node(tag, className = "", value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = String(value);
  return element;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./manager-training-exercise-design-v1.css", import.meta.url).href;
  document.head.append(link);
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function showDialog(dialog) {
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function savedHypothesisFor(session) {
  try {
    const envelope = JSON.parse(localStorage.getItem(MODE_SESSION_KEY) || "null");
    const saved = envelope?.sessions?.[envelope?.activeMode]?.trainingExerciseHypothesis;
    if (!saved || Number(saved.week) !== Number(session.week)) return null;
    if (Number(saved.sessionIndex) !== Number(session.index)) return null;
    return String(saved.title || "") === String(session.title || "") ? saved : null;
  } catch {
    return null;
  }
}

function ensureDialog() {
  let dialog = document.getElementById(DIALOG_ID);
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "training-exercise-dialog";
  dialog.setAttribute("aria-labelledby", "trainingExerciseTitle");
  dialog.innerHTML = `
    <article class="training-exercise-shell">
      <header class="training-exercise-head">
        <div>
          <p class="eyebrow" id="trainingExerciseEyebrow">Treningsøvelse</p>
          <h2 id="trainingExerciseTitle">Øvelsesdesign</h2>
          <p id="trainingExerciseObjective" class="training-exercise-objective"></p>
        </div>
        <button type="button" class="training-exercise-close" data-exercise-close aria-label="Lukk øvelsesdesign">Lukk</button>
      </header>

      <div class="training-exercise-body">
        <section class="training-exercise-setup" aria-labelledby="trainingExerciseSetupTitle">
          <span>Et mulig grunnoppsett</span>
          <h3 id="trainingExerciseSetupTitle">Fra økt til øvelse</h3>
          <p id="trainingExerciseSetup"></p>
          <p class="training-exercise-guardrail" id="trainingExerciseGuardrail"></p>
        </section>

        <section class="training-exercise-controls" aria-labelledby="trainingExerciseControlsTitle">
          <header>
            <span>Prøv ulike rammer</span>
            <h3 id="trainingExerciseControlsTitle">Hva skjer hvis du endrer øvelsen?</h3>
          </header>
          <div id="trainingExerciseControlGroups" class="training-exercise-control-groups"></div>
          <button type="button" class="training-exercise-reset" id="trainingExerciseReset">Nullstill til anbefalt utgangspunkt</button>
        </section>

        <section class="training-exercise-learning" aria-labelledby="trainingExerciseLearningTitle">
          <header>
            <span>Læringseffekt</span>
            <h3 id="trainingExerciseLearningTitle">Dette trener oppsettet mer eller mindre av</h3>
          </header>
          <div id="trainingExerciseEffects" class="training-exercise-effects"></div>
          <div class="training-exercise-topic">
            <span>For denne økta</span>
            <p id="trainingExerciseTopicEffect"></p>
          </div>
        </section>

        <section class="training-exercise-coaching" aria-labelledby="trainingExerciseCoachingTitle">
          <header>
            <span>På feltet</span>
            <h3 id="trainingExerciseCoachingTitle">Coachingpunkter</h3>
          </header>
          <ul id="trainingExerciseCoachingPoints"></ul>
          <blockquote id="trainingExerciseQuestion"></blockquote>
          <div class="training-exercise-save-row">
            <p id="trainingExerciseSaveStatus" role="status">Lagre oppsettet når det uttrykker det du vil se igjen i kamp.</p>
            <button type="button" class="training-exercise-save" id="trainingExerciseSave">Lagre som treningshypotese</button>
          </div>
        </section>
      </div>
    </article>`;

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target?.closest?.("[data-exercise-close]")) closeDialog(dialog);
  });

  dialog.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== "radio" || !activeSession) return;
    activeConfig = { ...(activeConfig || {}), [input.name]: input.value };
    renderLearning(dialog);
  });

  dialog.querySelector("#trainingExerciseReset")?.addEventListener("click", () => {
    if (!activeSession) return;
    activeConfig = createDefaultExerciseDesign(activeSession).config;
    renderDialog(dialog);
  });

  dialog.querySelector("#trainingExerciseSave")?.addEventListener("click", () => {
    if (!activeSession) return;
    const hypothesis = createTrainingExerciseHypothesis(activeSession, activeConfig);
    window.dispatchEvent(new CustomEvent("hgfm:training-exercise-save", { detail: { hypothesis } }));
    const status = dialog.querySelector("#trainingExerciseSaveStatus");
    if (status) status.textContent = `Lagret: ${hypothesis.setup}`;
  });

  document.body.append(dialog);
  return dialog;
}

function controlTitle(key) {
  return {
    area: "Areal",
    numbers: "Spillerbalanse",
    direction: "Retning",
    touches: "Touchregel"
  }[key] || key;
}

function renderControls(dialog, model) {
  const host = dialog.querySelector("#trainingExerciseControlGroups");
  if (!host) return;
  const fragment = document.createDocumentFragment();

  Object.entries(EXERCISE_DESIGN_CONTROLS).forEach(([key, options]) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "training-exercise-control";
    const legend = document.createElement("legend");
    legend.textContent = controlTitle(key);
    fieldset.append(legend);

    const choices = node("div", "training-exercise-choices");
    options.forEach((option) => {
      const label = node("label", "training-exercise-choice");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = key;
      input.value = option.id;
      input.checked = model.config[key] === option.id;
      const text = node("span", "", option.label);
      label.append(input, text);
      choices.append(label);
    });
    fieldset.append(choices);
    fragment.append(fieldset);
  });

  host.replaceChildren(fragment);
}

function renderLearning(dialog) {
  if (!activeSession) return;
  const model = evaluateTrainingExerciseDesign(activeSession, activeConfig);
  activeConfig = model.config;

  const effects = dialog.querySelector("#trainingExerciseEffects");
  if (effects) {
    const fragment = document.createDocumentFragment();
    model.effects.forEach((effect) => {
      const card = node("article", "training-exercise-effect");
      card.dataset.effect = effect.id;
      card.append(node("strong", "", effect.label), node("p", "", effect.text));
      fragment.append(card);
    });
    effects.replaceChildren(fragment);
  }

  const topic = dialog.querySelector("#trainingExerciseTopicEffect");
  if (topic) topic.textContent = model.topicEffect;

  const points = dialog.querySelector("#trainingExerciseCoachingPoints");
  if (points) {
    points.replaceChildren(...model.coachingPoints.map((point) => node("li", "", point)));
  }

  const question = dialog.querySelector("#trainingExerciseQuestion");
  if (question) question.textContent = model.managerQuestion;

  const guardrail = dialog.querySelector("#trainingExerciseGuardrail");
  if (guardrail) guardrail.textContent = model.guardrail;
}

function renderDialog(dialog) {
  if (!activeSession) return;
  const model = evaluateTrainingExerciseDesign(activeSession, activeConfig);
  activeConfig = model.config;

  const eyebrow = dialog.querySelector("#trainingExerciseEyebrow");
  const title = dialog.querySelector("#trainingExerciseTitle");
  const objective = dialog.querySelector("#trainingExerciseObjective");
  const setup = dialog.querySelector("#trainingExerciseSetup");

  if (eyebrow) eyebrow.textContent = [activeSession.day, activeSession.programTitle].filter(Boolean).join(" · ") || "Treningsøvelse";
  if (title) title.textContent = activeSession.title || model.archetype.title;
  if (objective) objective.textContent = model.archetype.objective;
  if (setup) setup.textContent = model.archetype.baseSetup;

  renderControls(dialog, model);
  renderLearning(dialog);
}

function openExercise(event) {
  const session = event?.detail?.session;
  if (!session || !String(session.title || "").trim()) return;
  activeSession = {
    week: Math.max(1, Number(session.week) || 1),
    index: Math.max(0, Number(session.index) || 0),
    day: String(session.day || ""),
    title: String(session.title || ""),
    intensity: String(session.intensity || ""),
    programTitle: String(session.programTitle || ""),
    calendarDay: String(session.calendarDay || "")
  };
  const saved = savedHypothesisFor(activeSession);
  activeConfig = saved?.config || createDefaultExerciseDesign(activeSession).config;
  const dialog = ensureDialog();
  renderDialog(dialog);
  const status = dialog.querySelector("#trainingExerciseSaveStatus");
  if (status) status.textContent = saved
    ? `Lagret hypotese: ${saved.setup}`
    : "Lagre oppsettet når det uttrykker det du vil se igjen i kamp.";
  showDialog(dialog);
  requestAnimationFrame(() => dialog.querySelector("input:checked")?.focus());
}

function boot() {
  ensureStyles();
  ensureDialog();
  window.addEventListener("hgfm:training-exercise-open", openExercise);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
}
