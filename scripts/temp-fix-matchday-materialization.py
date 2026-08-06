from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return text.replace(old, new, 1)


path = Path("src/app.js")
text = path.read_text()
text = replace_once(
    text,
    "  const leagueSeason = getLeagueSeason();\n",
    "  const leagueSeason = state.leagueSeason || null;\n",
    "league season source",
)
text = replace_once(
    text,
    '    venueLabel: nextOpponent?.isHome === true ? "Hjemme" : nextOpponent?.isHome === false ? "Borte" : "",\n',
    '    venueLabel: nextOpponent?.homeAway === "home" ? "Hjemme" : nextOpponent?.homeAway === "away" ? "Borte" : "",\n',
    "league venue source",
)

helper_block = '''// Norske trykk-etiketter for hendelser.\nconst MATCHDAY_PRESSURE_LABELS = { low: "Lavt trykk", medium: "Middels trykk", high: "Høyt trykk" };\n\n// Tatt managergrep med tone-farget konsekvens, brukt både underveis og i\n// sluttrapporten.\nfunction appendMatchdayDecisionLog(parent, decisions, heading) {\n  if (!Array.isArray(decisions) || decisions.length === 0) {\n    return;\n  }\n\n  appendMatchdaySubheading(parent, heading);\n\n  decisions.forEach((decision) => {\n    const entry = document.createElement("div");\n    const tone = ["positive", "neutral", "negative"].includes(decision.tone) ? decision.tone : "neutral";\n    entry.className = `matchday-decision-entry is-${tone}`;\n\n    const title = document.createElement("p");\n    title.className = "matchday-decision-title";\n    title.textContent = `${decision.eventTitle}: ${decision.optionLabel}`;\n    entry.append(title);\n\n    if (decision.feedback) {\n      const feedback = document.createElement("p");\n      feedback.className = "matchday-decision-feedback";\n      feedback.textContent = decision.feedback;\n      entry.append(feedback);\n    }\n\n    parent.append(entry);\n  });\n}\n\n'''
if "const MATCHDAY_PRESSURE_LABELS" not in text:
    text = replace_once(text, "// Pre_match:", helper_block + "// Pre_match:", "restore matchday helpers")
path.write_text(text)


path = Path("tests/browser/manager-matchday-scene-v1.spec.js")
text = path.read_text()
text = replace_once(
    text,
    '  await page.locator(\'.training-command-status[data-training-target="trainingProgramStep"]\').click();\n  const programButton = page.locator(".training-program-select:not([disabled])").first();\n',
    '  await expect(page.locator("#trainingProgramStepBody")).toBeVisible();\n  const programButton = page.locator(".training-program-select:not([disabled])").first();\n',
    "stable program step",
)
text = replace_once(
    text,
    '  await page.locator(\'.training-command-status[data-training-target="trainingFocusStep"]\').click();\n',
    '  await page.locator(\'#trainingFocusStep [data-training-step-toggle]\').click();\n',
    "stable focus step",
)
path.write_text(text)
