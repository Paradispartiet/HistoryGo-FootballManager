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
    '  <link rel="stylesheet" href="src/ui/manager-training-scene-v2.css">\n',
    '  <link rel="stylesheet" href="src/ui/manager-training-scene-v2.css">\n  <link rel="stylesheet" href="src/ui/manager-club-scene-v1.css">\n',
    "club css link",
)
text = replace_once(
    text,
    'data-subnav-parent="board" data-tab-target="board">Styret</button>',
    'data-subnav-parent="board" data-tab-target="board">Oversikt</button>',
    "club overview subtab",
)
text = replace_once(
    text,
    '    <div class="tab-section dept dept-board" data-tab-section="board" hidden>\n      <section class="dept-hero dept-hero-board">',
    '    <div class="tab-section dept dept-board" data-tab-section="board" hidden>\n      <section class="manager-surface club-command-panel" id="clubCommandPanel" aria-label="Klubbkontoret" aria-live="polite">\n        <div id="clubCommand" class="club-command"></div>\n      </section>\n\n      <details class="club-depth" id="clubDepth">\n        <summary>Styrets vurdering og klubbverdier</summary>\n        <div class="club-depth-content">\n      <section class="dept-hero dept-hero-board">',
    "club command markup",
)
text = replace_once(
    text,
    '      </div>\n    </div>\n\n    <!-- ============================ HISTORY GO ============================ -->',
    '      </div>\n        </div>\n      </details>\n    </div>\n\n    <!-- ============================ HISTORY GO ============================ -->',
    "club depth closing",
)
path.write_text(text)


# src/app.js
path = Path("src/app.js")
text = path.read_text()
text = replace_once(
    text,
    'import { createManagerTrainingSceneModel, renderManagerTrainingCommand } from "./ui/manager-training-presentation.js";\n',
    'import { createManagerTrainingSceneModel, renderManagerTrainingCommand } from "./ui/manager-training-presentation.js";\nimport { createManagerClubSceneModel, renderManagerClubCommand } from "./ui/manager-club-presentation.js";\n',
    "club presentation import",
)
text = replace_once(
    text,
    '  boardTrustValue: document.querySelector("#boardTrustValue"),\n',
    '  clubCommand: document.querySelector("#clubCommand"),\n  clubDepth: document.querySelector("#clubDepth"),\n  boardTrustValue: document.querySelector("#boardTrustValue"),\n',
    "club elements",
)
club_functions = r'''
function openManagerClubTarget(target) {
  if (target === "details") {
    if (!elements.clubDepth) return;
    elements.clubDepth.open = true;
    requestAnimationFrame(() => {
      elements.clubDepth.scrollIntoView({ behavior: "smooth", block: "start" });
      elements.clubDepth.querySelector("summary")?.focus({ preventScroll: true });
    });
    return;
  }
  activateTab(target);
}

function renderManagerClubScene() {
  if (!elements.clubCommand) return;
  if (elements.clubDepth && elements.clubDepth.dataset.initialized !== "true") {
    elements.clubDepth.open = false;
    elements.clubDepth.dataset.initialized = "true";
  }

  const availability = getAvailability();
  const staffIdentity = getStaffIdentitySummary();
  const leagueSave = getLeagueSaveModel();
  const model = createManagerClubSceneModel({
    clubName: getSavedClubName() || "Managerklubben",
    week: Number(state.clubWeekState?.week) || 1,
    phaseLabel: state.clubWeekState
      ? CLUB_WEEK_PHASE_LABELS[state.clubWeekState.phase] || state.clubWeekState.phase
      : "Klubbdrift",
    boardExpectation: leagueSave?.boardExpectation || "Styret venter at du bygger laget og viser en tydelig retning.",
    clubState: state.clubWeekState,
    roster: {
      ...(availability.rosterReadiness || {}),
      requiredCount: REQUIRED_SQUAD_SIZE
    },
    staffIdentity,
    hiredStaffCount: getHiredStaff().length,
    unlockedStaffCount: getUnlockedStaff().length,
    unlockedPlayersCount: getUnlockedPlayers().length,
    unlockedPlacesCount: getUnlockedPlaceIds().size,
    unlockedExpertiseCount: getUnlockedExpertise().length,
    activeProgramCount: Array.isArray(state.teamMerits?.badgeProgress) ? state.teamMerits.badgeProgress.length : 0,
    earnedBadgeCount: getEarnedBadges().length,
    activeClassificationCount: Array.isArray(state.teamMerits?.activeClassifications)
      ? state.teamMerits.activeClassifications.length
      : 0
  });

  renderManagerClubCommand(elements.clubCommand, model, { onOpenTarget: openManagerClubTarget });
}

'''
text = replace_once(
    text,
    '\nfunction renderBoardRoom() {\n  const club = state.clubWeekState;\n',
    '\n' + club_functions + 'function renderBoardRoom() {\n  const club = state.clubWeekState;\n  renderManagerClubScene();\n',
    "club render integration",
)
path.write_text(text)


# package.json
path = Path("package.json")
text = path.read_text()
text = replace_once(
    text,
    '    "sim:manager-training-scene-v2": "node scripts/simulate-manager-training-scene-v2.mjs"\n',
    '    "sim:manager-training-scene-v2": "node scripts/simulate-manager-training-scene-v2.mjs",\n    "audit:manager-club-scene-v1": "node scripts/audit-manager-club-scene-v1.mjs",\n    "sim:manager-club-scene-v1": "node scripts/simulate-manager-club-scene-v1.mjs"\n',
    "club package scripts",
)
path.write_text(text)


# .github/workflows/ci.yml
path = Path(".github/workflows/ci.yml")
text = path.read_text()
text = replace_once(
    text,
    '          npm run audit:manager-training-scene-v2\n',
    '          npm run audit:manager-training-scene-v2\n          npm run audit:manager-club-scene-v1\n',
    "club audit ci",
)
text = replace_once(
    text,
    '          npm run sim:manager-training-scene-v2\n',
    '          npm run sim:manager-training-scene-v2\n          npm run sim:manager-club-scene-v1\n',
    "club simulation ci",
)
path.write_text(text)
