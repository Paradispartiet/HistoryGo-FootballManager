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

prepare_start = text.index("async function prepareAndOpenPreMatch(page) {")
prepare_end = text.index("test.beforeEach", prepare_start)
prepare = '''async function prepareAndOpenPreMatch(page) {\n  await openMatchday(page);\n  const play = page.locator("#playMatchdayButton");\n  await expect(play).toBeEnabled();\n  const scene = page.locator("#matchdayCommand .matchday-scene");\n  await expect(scene).toHaveAttribute("data-phase", "ready");\n  const sceneAction = page.locator("#matchdayCommand .matchday-scene-action");\n  await expect(sceneAction).toBeVisible();\n  await sceneAction.click();\n  await expect(page.locator(".matchday-kickoff-button")).toBeVisible();\n}\n\n'''
text = text[:prepare_start] + prepare + text[prepare_end:]

before_start = text.index("test.beforeEach(async ({ page }) => {")
before_end = text.index('test("kampdagen viser én scene', before_start)
before_each = '''test.beforeEach(async ({ page }) => {\n  page.on("pageerror", (error) => console.error(`[pageerror] ${error.stack || error.message}`));\n  page.on("console", (message) => {\n    if (message.type() === "error") console.error(`[browser-console] ${message.text()}`);\n  });\n  await page.setViewportSize({ width: 1280, height: 900 });\n  await page.emulateMedia({ reducedMotion: "reduce" });\n  await page.addInitScript((season) => {\n    const clubWeekState = {\n      week: 1,\n      phase: "matchday",\n      boardTrust: 50,\n      playerMorale: 50,\n      tacticalClarity: 50,\n      trainingCulture: 50,\n      mediaPressure: 50\n    };\n    localStorage.setItem("hgfm.onboarded.v1", "1");\n    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({\n      selectedMode: "league",\n      activeLeagueSaveId: "matchday_scene_v1",\n      clubName: "Rosenborg",\n      takeoverClubId: "rosenborg",\n      managerName: "Manager",\n      leagueName: "Eliteserien",\n      leagueSeasonStatus: "active",\n      boardExpectation: "Øvre halvdel"\n    }));\n    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));\n    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));\n    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({\n      focusId: "formation_familiarity",\n      week: 1,\n      appliedSessionId: null\n    }));\n  }, seededSeason());\n  await page.goto("/");\n  await expect(page.locator("#formationSelect option").first()).toBeAttached();\n  await expect(page.locator("#onboardingScreen")).toBeHidden();\n});\n\n'''
text = text[:before_start] + before_each + text[before_end:]

text = replace_once(
    text,
    '  await page.locator(\'.matchday-scene-status-card[data-matchday-target="trening"]\').click();\n',
    '  await page.getByRole("button", { name: /^Treningsuka:/ }).click();\n',
    "deterministic training status card",
)
path.write_text(text)
