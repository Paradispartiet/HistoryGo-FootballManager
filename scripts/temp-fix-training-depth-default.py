from pathlib import Path

path = Path("src/app.js")
source = path.read_text()
old = '''function renderManagerTrainingScene(plan) {
  if (!elements.trainingCommand) return;
  const conditionSummary = summarizeSquadCondition(getPlayerCondition());
'''
new = '''function renderManagerTrainingScene(plan) {
  if (!elements.trainingCommand) return;
  // Dybdepanelet skal være foldet første gang scenen materialiseres. Senere
  // renderer må ikke overstyre managerens eget valg om å åpne eller lukke det.
  if (elements.trainingDepth && elements.trainingDepth.dataset.initialized !== "true") {
    elements.trainingDepth.open = false;
    elements.trainingDepth.dataset.initialized = "true";
  }
  const conditionSummary = summarizeSquadCondition(getPlayerCondition());
'''
if old not in source:
    raise SystemExit("renderManagerTrainingScene anchor missing")
path.write_text(source.replace(old, new, 1))
