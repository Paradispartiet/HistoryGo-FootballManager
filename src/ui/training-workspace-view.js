export const TRAINING_STEP_BY_LEGACY_MODAL = Object.freeze({
  modalTrainingProgram: "trainingProgramStep",
  modalTrainingFocusPick: "trainingFocusStep",
  modalIndividualTraining: "individualTrainingStep"
});

export function getTrainingWorkspaceTarget(legacyModalId) {
  return TRAINING_STEP_BY_LEGACY_MODAL[legacyModalId] || null;
}
export function syncTrainingWorkspace(root, openStepId) {
  if (!root) return;
  const steps = [...root.querySelectorAll(".training-workspace-step")];
  const activeId = steps.some((step) => step.id === openStepId) ? openStepId : steps[0]?.id;
  steps.forEach((step) => {
    const expanded = step.id === activeId;
    step.classList.toggle("is-open", expanded);
    const toggle = step.querySelector("[data-training-step-toggle]");
    const body = step.querySelector(".training-workspace-step-body");
    toggle?.setAttribute("aria-expanded", expanded ? "true" : "false");
    if (body) body.hidden = !expanded;
  });
  return activeId || null;
}
