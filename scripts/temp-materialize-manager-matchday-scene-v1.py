from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


# index.html
path = Path("index.html")
text = path.read_text()
text = replace_once(
    text,
    '  <link rel="stylesheet" href="src/ui/manager-club-scene-v1.css">\n',
    '  <link rel="stylesheet" href="src/ui/manager-club-scene-v1.css">\n  <link rel="stylesheet" href="src/ui/manager-matchday-scene-v1.css">\n',
    "matchday css link",
)
text = replace_once(
    text,
    '        <section class="manager-surface matchday-panel" aria-live="polite">\n          <p class="eyebrow">Kampdag</p>',
    '        <section class="manager-surface matchday-panel" aria-live="polite">\n          <section class="matchday-command-panel" id="matchdayCommandPanel" aria-label="Kampkommando">\n            <div id="matchdayCommand"></div>\n          </section>\n\n          <details class="matchday-depth" id="matchdayDepth">\n            <summary>Kampdetaljer og tekniske kontroller</summary>\n            <div class="matchday-depth-content">\n          <p class="eyebrow">Kampdag</p>',
    "matchday command markup",
)
text = replace_once(
    text,
    '          <div id="matchdayResult"></div>\n',
    '            </div>\n          </details>\n          <div id="matchdayResult"></div>\n',
    "matchday depth closing",
)
path.write_text(text)


# src/app.js
path = Path("src/app.js")
text = path.read_text()
text = replace_once(
    text,
    'import { createMatchdaySceneModel } from "./ui/manager-matchday-presentation.js";\n',
    'import { createMatchdaySceneModel, renderManagerMatchdayCommand } from "./ui/manager-matchday-presentation.js";\n',
    "matchday presentation import",
)
text = replace_once(
    text,
    '  // Kampklar-status i kampdagpanelet (gating-forklaring, ingen ny kampmotor).\n  matchdayReadiness: document.querySelector("#matchdayReadiness"),\n',
    '  // Kampdagscene og foldet teknisk dybde.\n  matchdayCommand: document.querySelector("#matchdayCommand"),\n  matchdayDepth: document.querySelector("#matchdayDepth"),\n  // Kampklar-status i kampdagpanelet (gating-forklaring, ingen ny kampmotor).\n  matchdayReadiness: document.querySelector("#matchdayReadiness"),\n',
    "matchday elements",
)
start = text.index("function renderMatchdayGate(container, teamFit) {")
end = text.index("// Pre_match:", start)
replacement = r'''function openManagerMatchdayTarget(target) {
  if (target === "details") {
    if (!elements.matchdayDepth) return;
    elements.matchdayDepth.open = true;
    requestAnimationFrame(() => {
      elements.matchdayDepth.scrollIntoView({ behavior: "smooth", block: "start" });
      elements.matchdayDepth.querySelector("summary")?.focus({ preventScroll: true });
    });
    return;
  }
  if (["dashboard", "tactics", "trening", "analyse"].includes(target)) {
    activateTab(target);
  }
}

function handleManagerMatchdayPrimaryAction(target) {
  if (target === "create_session") {
    const button = document.querySelector("#playMatchdayButton");
    if (button && !button.disabled) button.click();
    return;
  }
  if (target === "kickoff") {
    const button = document.querySelector(".matchday-kickoff-button");
    if (button) button.click();
    else startMatchdayKickoff();
    return;
  }
  if (target === "live") {
    const liveCard = elements.matchdayResult?.querySelector(".matchday-result-card:last-of-type");
    if (!liveCard) return;
    liveCard.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => liveCard.querySelector("button:not([disabled])")?.focus({ preventScroll: true }));
    return;
  }
  openManagerMatchdayTarget(target);
}

function renderMatchdayGate(container, teamFit) {
  const readiness = getMatchdayReadiness(teamFit);
  const session = state.matchday?.session || null;
  const lastMatch = state.matchday?.lastMatch || null;
  const formation = session?.formationSnapshot || getFormation() || {};
  const tactic = session?.tacticSnapshot || getTactic() || {};
  const report = lastMatch ? createMatchReport(lastMatch) : null;
  const opponent = session?.opponent || lastMatch?.opponent || null;
  const leagueSeason = getLeagueSeason();
  const nextOpponent = leagueSeason ? getNextLeagueOpponent(leagueSeason) : null;

  if (elements.matchdayDepth && elements.matchdayDepth.dataset.initialized !== "true") {
    elements.matchdayDepth.open = false;
    elements.matchdayDepth.dataset.initialized = "true";
  }

  const scene = createMatchdaySceneModel({
    teamName: session?.teamName || getTemporaryClubName().name,
    opponentBrief: getMatchdayOpponentBrief(session),
    opponent,
    competitionLabel: leagueSeason?.competition?.tierName || leagueSeason?.tier?.name || "",
    roundLabel: nextOpponent?.round ? `Runde ${nextOpponent.round}` : "",
    venueLabel: nextOpponent?.isHome === true ? "Hjemme" : nextOpponent?.isHome === false ? "Borte" : "",
    formationName: formation.name,
    tacticName: tactic.name,
    trainingLabel: getWeeklyTrainingChoiceLabel(),
    lastSignal: getLastInboxSignalText(),
    opponentThreat: opponent?.style || opponent?.archetypeName || "",
    readiness,
    session,
    lastMatch,
    report
  });

  renderManagerMatchdayCommand(elements.matchdayCommand || container, scene, {
    onPrimaryAction: handleManagerMatchdayPrimaryAction,
    onOpenTarget: openManagerMatchdayTarget
  });
}

'''
text = text[:start] + replacement + text[end:]
path.write_text(text)


# package.json
path = Path("package.json")
text = path.read_text()
text = replace_once(
    text,
    '    "sim:manager-club-scene-v1": "node scripts/simulate-manager-club-scene-v1.mjs"\n',
    '    "sim:manager-club-scene-v1": "node scripts/simulate-manager-club-scene-v1.mjs",\n    "audit:manager-matchday-scene-v1": "node scripts/audit-manager-matchday-scene-v1.mjs",\n    "sim:manager-matchday-scene-v1": "node scripts/simulate-manager-matchday-scene-v1.mjs"\n',
    "matchday package scripts",
)
path.write_text(text)


# .github/workflows/ci.yml — materialized for local validation, committed separately.
path = Path(".github/workflows/ci.yml")
text = path.read_text()
text = replace_once(
    text,
    '          npm run audit:manager-club-scene-v1\n',
    '          npm run audit:manager-club-scene-v1\n          npm run audit:manager-matchday-scene-v1\n',
    "matchday audit ci",
)
text = replace_once(
    text,
    '          npm run sim:manager-club-scene-v1\n',
    '          npm run sim:manager-club-scene-v1\n          npm run sim:manager-matchday-scene-v1\n',
    "matchday simulation ci",
)
path.write_text(text)
