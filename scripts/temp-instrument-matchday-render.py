from pathlib import Path

path = Path("src/app.js")
text = path.read_text()

old = '''function renderMatchday(teamFit) {
  const container = elements.matchdayResult;

  renderMatchdayReadiness(teamFit);
'''
new = '''function renderMatchday(teamFit) {
  const container = elements.matchdayResult;
  window.__matchdayDebug = {
    renderMatchdayCalled: true,
    resultReferenceFound: Boolean(container),
    commandReferenceFound: Boolean(elements.matchdayCommand),
    readinessReferenceFound: Boolean(elements.matchdayReadiness),
    stage: "entered-renderMatchday"
  };

  renderMatchdayReadiness(teamFit);
  window.__matchdayDebug.stage = "after-readiness";
'''
if text.count(old) != 1:
    raise SystemExit(f"renderMatchday anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''function renderMatchdayGate(container, teamFit) {
  const readiness = getMatchdayReadiness(teamFit);
'''
new = '''function renderMatchdayGate(container, teamFit) {
  if (window.__matchdayDebug) {
    window.__matchdayDebug.gateCalled = true;
    window.__matchdayDebug.gateContainerId = container?.id || "";
    window.__matchdayDebug.stage = "entered-gate";
  }
  const readiness = getMatchdayReadiness(teamFit);
'''
if text.count(old) != 1:
    raise SystemExit(f"renderMatchdayGate anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

old = '''  renderManagerMatchdayCommand(container, matchdayScene, {
    onPrimaryAction: handleManagerMatchdayPrimaryAction,
    onOpenTarget: openManagerMatchdayTarget
  });
}
'''
new = '''  renderManagerMatchdayCommand(container, matchdayScene, {
    onPrimaryAction: handleManagerMatchdayPrimaryAction,
    onOpenTarget: openManagerMatchdayTarget
  });
  if (window.__matchdayDebug) {
    window.__matchdayDebug.stage = "after-command-render";
    window.__matchdayDebug.renderedChildCount = container?.children?.length || 0;
  }
}
'''
if text.count(old) != 1:
    raise SystemExit(f"command render anchor count: {text.count(old)}")
text = text.replace(old, new, 1)

path.write_text(text)
