from pathlib import Path
import json


def replace_once(path, old, new):
    source = Path(path).read_text()
    if old not in source:
        raise SystemExit(f"Anchor not found in {path}: {old[:100]!r}")
    Path(path).write_text(source.replace(old, new, 1))


# Last scenens egen CSS etter managerskallet, slik at scenereglene vinner.
index = Path("index.html").read_text()
style_anchor = '  <link rel="stylesheet" href="src/ui/manager-shell-v3.css">\n'
style_link = style_anchor + '  <link rel="stylesheet" href="src/ui/manager-training-scene-v2.css">\n'
if 'manager-training-scene-v2.css' not in index:
    if style_anchor not in index:
        raise SystemExit("Style link anchor missing")
    index = index.replace(style_anchor, style_link, 1)

# Én primær kommandoflate og ett foldet dybdenivå.
command_anchor = '      <!-- UKENS PLAN: fire steg i fast rekkefølge, ikke tre parallelle lister.'
command_markup = '''      <section class="manager-surface training-command-panel" id="trainingCommandPanel" aria-label="Treningskommando" aria-live="polite">
        <div id="trainingCommand" class="training-command"></div>
      </section>

      <details class="training-depth" id="trainingDepth">
        <summary>Planstatus og troppsdetaljer</summary>
        <div class="training-depth-content">

'''
if 'id="trainingCommandPanel"' not in index:
    if command_anchor not in index:
        raise SystemExit("Training command anchor missing")
    index = index.replace(command_anchor, command_markup + command_anchor, 1)

close_anchor = '''      </section>

      <!-- Kjernevalgene ligger i én sammenhengende arbeidsflate. Det gjør'''
close_markup = '''      </section>
        </div>
      </details>

      <!-- Kjernevalgene ligger i én sammenhengende arbeidsflate. Det gjør'''
if 'id="trainingDepth"' in index and '</details>\n\n      <!-- Kjernevalgene' not in index:
    if close_anchor not in index:
        raise SystemExit("Training depth close anchor missing")
    index = index.replace(close_anchor, close_markup, 1)
Path("index.html").write_text(index)

# Koble presentasjonslaget til eksisterende treningsstate.
app = Path("src/app.js").read_text()
if 'from "./ui/manager-training-presentation.js"' not in app:
    old = 'import { createOfficeSceneModel, renderOfficeCommand } from "./ui/manager-office-presentation.js";\n'
    new = old + 'import { createManagerTrainingSceneModel, renderManagerTrainingCommand } from "./ui/manager-training-presentation.js";\n'
    if old not in app:
        raise SystemExit("Office import anchor missing")
    app = app.replace(old, new, 1)

if 'trainingCommand: document.querySelector("#trainingCommand")' not in app:
    old = '  trainingPlanHeadline: document.querySelector("#trainingPlanHeadline"),\n'
    new = '  trainingCommand: document.querySelector("#trainingCommand"),\n  trainingDepth: document.querySelector("#trainingDepth"),\n' + old
    if old not in app:
        raise SystemExit("Training elements anchor missing")
    app = app.replace(old, new, 1)

helper = '''function openManagerTrainingTarget(target) {
  if (target === "inbox" || target === "kamp") {
    activateTab(target);
    return;
  }
  if (target === "details") {
    if (elements.trainingDepth) {
      elements.trainingDepth.open = true;
      elements.trainingDepth.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }
  const step = typeof target === "string" ? document.getElementById(target) : null;
  if (!step) return;
  state.openTrainingStepId = step.id;
  activateTab("trening");
  requestAnimationFrame(() => {
    syncTrainingWorkspace(document.querySelector("#trainingWorkspace"), state.openTrainingStepId);
    step.scrollIntoView({ behavior: "smooth", block: "start" });
    step.focus({ preventScroll: true });
  });
}

function renderManagerTrainingScene(plan) {
  if (!elements.trainingCommand) return;
  const conditionSummary = summarizeSquadCondition(getPlayerCondition());
  const individualSummary = summarizeIndividualTraining({
    catalogue: state.individualTrainingCatalogue,
    assignments: getIndividualAssignments(),
    capacity: getIndividualTrainingCapacity()
  });
  const offPitchSummary = summarizeOffPitchContext(getOffPitchState());
  const selectedProgram = getSelectedTrainingProgramComposition();
  const selectedFocus = getTrainingFocus(state.weeklyTrainingFocus?.focusId || null);
  const model = createManagerTrainingSceneModel({
    week: Number(state.clubWeekState?.week) || 1,
    phase: state.clubWeekState?.phase || "training",
    opponent: getMiniSeasonNextOpponent(),
    plan,
    assistantSignal: elements.trainingChoiceSignal?.textContent || offPitchSummary.headline,
    assistantDetail: plan?.coherence?.note || offPitchSummary.headline,
    conditionSummary,
    selectedProgram,
    selectedFocus,
    individualSummary
  });
  renderManagerTrainingCommand(elements.trainingCommand, model, { onOpenTarget: openManagerTrainingTarget });
}

'''
if "function openManagerTrainingTarget(" not in app:
    anchor = "function renderWeeklyTrainingPlan() {"
    if anchor not in app:
        raise SystemExit("renderWeeklyTrainingPlan anchor missing")
    app = app.replace(anchor, helper + anchor, 1)

render_anchor = '''  state.openTrainingStepId = syncTrainingWorkspace(
    document.querySelector("#trainingWorkspace"),
    state.openTrainingStepId
  );
}'''
render_replacement = '''  renderManagerTrainingScene(plan);

  state.openTrainingStepId = syncTrainingWorkspace(
    document.querySelector("#trainingWorkspace"),
    state.openTrainingStepId
  );
}'''
if "renderManagerTrainingScene(plan);" not in app:
    if render_anchor not in app:
        raise SystemExit("Training render tail anchor missing")
    app = app.replace(render_anchor, render_replacement, 1)
Path("src/app.js").write_text(app)

# Permanente npm-porter.
package_path = Path("package.json")
package = json.loads(package_path.read_text())
scripts = package.setdefault("scripts", {})
scripts["audit:manager-training-scene-v2"] = "node scripts/audit-manager-training-scene-v2.mjs"
scripts["sim:manager-training-scene-v2"] = "node scripts/simulate-manager-training-scene-v2.mjs"
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n")
