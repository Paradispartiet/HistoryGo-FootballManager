import { expect, test } from "@playwright/test";

const ROSENBORG_STAFF = [
  "Jonathan Hartmann",
  "Alexander Tettey",
  "Roger Naustan",
  "Vetle Veierød",
  "Ole Næss",
  "Alexander Lund Hansen"
];

async function readProgress(page) {
  return page.evaluate(() => {
    const parse = (key, fallback = null) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    };
    const merits = parse("hgfm.teamMerits.v1", {});
    const envelope = parse("hgfm.modeSessions.v1", {});
    const session = envelope?.sessions?.[envelope?.activeMode] || {};
    const clubWeek = merits.clubWeekState || session.clubWeekState || parse("hgfm.clubWeekState.v1", {});
    const season = parse("historygo-football-manager.league-season.v3", null) || session.leagueSeason;
    const matchday = parse("hgfm.matchday.v1", null) || session.matchday;
    const lastMatch = matchday?.lastMatch || null;

    return {
      week: Number(clubWeek?.week) || null,
      phase: clubWeek?.phase || null,
      seasonStatus: season?.status || null,
      currentRound: Number(season?.currentRound) || null,
      activeMatchSession: Boolean(matchday?.session),
      lastMatchId: lastMatch?.id || null,
      lastMatchRound: Number(lastMatch?.leagueContext?.round) || null,
      lastOpponentId: lastMatch?.leagueContext?.opponentId || lastMatch?.opponent?.id || null,
      lastOpponentName: lastMatch?.leagueContext?.opponentName || lastMatch?.opponent?.name || null,
      decisionCount: Array.isArray(lastMatch?.decisions) ? lastMatch.decisions.length : 0,
      decisionLabels: Array.isArray(lastMatch?.decisions)
        ? lastMatch.decisions.map((entry) => entry?.optionLabel || entry?.label || entry?.optionId).filter(Boolean)
        : [],
      trainingFocusId: lastMatch?.trainingFocus?.focusId || null,
      trainingFocusName: lastMatch?.trainingFocus?.name || null,
      lineupCount: Object.values(session.lineup || {}).filter(Boolean).length,
      hiredStaffCount: Array.isArray(merits.hiredStaffIds) ? merits.hiredStaffIds.length : 0
    };
  });
}

async function startLeagueAsRosenborg(page) {
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeVisible();

  const leagueStart = page.locator('[data-start-mode="league"]');
  await expect(leagueStart).toBeVisible();
  await leagueStart.click();

  await expect(page.locator("#onboardingClubStep")).toBeVisible();
  const takeover = page.locator("#onboardingClubModeTakeover");
  await expect(takeover).toBeVisible();
  await takeover.click();

  const rosenborg = page.locator('.club-takeover-option[data-club-id="rosenborg"]');
  await expect(rosenborg).toBeVisible();
  await rosenborg.click();
  await page.locator("#onboardingCreateClub").click();

  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#availableStaffList")).toBeVisible();
}

async function hireRosenborgStaff(page) {
  for (const name of ROSENBORG_STAFF) {
    const card = page.locator("#availableStaffList .unlock-card").filter({ hasText: name });
    await expect(card).toHaveCount(1);
    await card.getByRole("button", { name: "Engasjer" }).click();
  }
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "true");
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("6/6 roller");
}

async function choosePlayableFormation(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

  await page.locator("#teamChangeFormation").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  await expect(page.locator("#formationSelect")).toBeVisible();

  const formationId = await page.locator("#formationSelect option:not([disabled])").evaluateAll((options) => {
    const playable = options.find((option) => String(option.value || "").trim());
    return playable?.value || null;
  });
  expect(formationId).toBeTruthy();
  await page.locator("#formationSelect").selectOption(formationId);

  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();

  await expect.poll(async () => {
    const text = await page.locator("#completeCount").textContent();
    return text?.trim() || "";
  }).toBe("11/11");
}

async function openTraining(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
}

async function chooseTrainingProgram(page) {
  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  const option = page.locator("#managerTeamChoiceDrawerBody .training-program-select:not([disabled])").first();
  await expect(option).toBeVisible();
  await option.click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  await expect(page.locator("#trainingDayProgramTitle")).not.toHaveText("Ikke valgt");
}

async function chooseTrainingFocus(page) {
  await page.locator("#trainingDayChangeFocus").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  const option = page
    .locator("#managerTeamChoiceDrawerBody .weekly-training-card")
    .getByRole("button", { name: "Velg fokus" })
    .first();
  await expect(option).toBeVisible();
  await option.click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  await expect(page.locator("#weeklyTrainingStatus")).not.toContainText("Ikke valgt");
}

async function choosePreseasonTraining(page) {
  await openTraining(page);
  await chooseTrainingProgram(page);
  await chooseTrainingFocus(page);
}

async function startSeasonFromOnboarding(page) {
  await expect(page.locator("#nextActionPrimaryTag")).toHaveText("Før sesong");
  await expect(page.locator("#nextActionPrimaryTitle")).toHaveText("Start sesongen");
  await expect(page.locator("#nextActionPrimary")).toBeEnabled();
  await page.locator("#nextActionPrimary").click();

  await expect.poll(async () => {
    const progress = await readProgress(page);
    return { status: progress.seasonStatus, round: progress.currentRound };
  }).toEqual({ status: "active", round: 1 });
}

async function openCurrentOpponentAnalysis(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="analysis"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();

  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await expect(workshop).toBeVisible();
  await expect(workshop).toHaveAttribute("data-case-kind", "fixture");
  await workshop.locator('[data-opponent-analysis-focus="press"]').click();
  await workshop.locator('[data-opponent-analysis-countermeasure="train_escape"]').click();
  await workshop.locator(".opponent-analysis-save").click();
  await expect(workshop.locator(".opponent-analysis-feedback")).toContainText("kampklarheten er oppdatert");

  await page.locator("#managerClubRoomDrawer .club-room-close").click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeHidden();
}

async function advanceClubWeek(page, expectedPhase) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  const advance = page.locator("#managerCalendarAdvancePhase");
  await expect(advance).toBeVisible();
  await advance.click();

  await expect.poll(async () => (await readProgress(page)).phase).toBe(expectedPhase);
}

async function chooseTrainingForCurrentWeek(page) {
  await openTraining(page);
  await chooseTrainingProgram(page);

  const afterProgram = await readProgress(page);
  if (afterProgram.phase === "training") {
    await chooseTrainingFocus(page);
  }

  await expect.poll(async () => (await readProgress(page)).phase).toBe("match_prep");
}

async function openPreMatch(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  const kickoff = page.locator(".matchday-kickoff-button:visible").first();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await kickoff.isVisible()) break;
    const action = page.locator(".matchday-scene-action:visible").first();
    await expect(action).toBeVisible();
    await action.click();
  }

  await expect.poll(async () => (await readProgress(page)).phase).toBe("matchday");
  await expect(kickoff).toBeVisible();
}

async function playCurrentMatch(page) {
  await openPreMatch(page);
  await page.locator(".matchday-kickoff-button").click();

  const nextWeek = page.locator(".matchday-next-week-button:visible").first();
  for (let event = 0; event < 6; event += 1) {
    if (await nextWeek.isVisible()) break;

    const skip = page.locator(".matchday-live-button.is-secondary:visible").filter({ hasText: "Hopp til pausen" }).first();
    if (await skip.isVisible()) {
      await skip.click();
    }

    const decision = page.locator(".matchday-decision-button:not([disabled]):visible").first();
    await expect(decision).toBeVisible();
    await decision.click();
  }

  await expect(nextWeek).toBeVisible();
  await expect.poll(async () => (await readProgress(page)).phase).toBe("review");
}

async function rollToNextWeek(page, expectedWeek) {
  const nextWeek = page.locator(".matchday-next-week-button:visible").first();
  await expect(nextWeek).toBeVisible();
  await nextWeek.click();

  await expect.poll(async () => {
    const progress = await readProgress(page);
    return { week: progress.week, phase: progress.phase };
  }).toEqual({ week: expectedWeek, phase: "analysis" });
}

test("blank Rosenborg-save spiller ti sammenhengende serierunder gjennom ekte UI", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  // Null state-seeding: alt under skjer gjennom de samme kontrollene spilleren bruker.
  await startLeagueAsRosenborg(page);
  await hireRosenborgStaff(page);
  await choosePlayableFormation(page);
  await choosePreseasonTraining(page);
  await startSeasonFromOnboarding(page);

  const initial = await readProgress(page);
  expect(initial.week).toBe(1);
  expect(initial.phase).toBe("analysis");
  expect(initial.hiredStaffCount).toBe(6);

  const observations = [];
  const opponentIds = new Set();
  const matchIds = new Set();
  const decisionLabels = new Set();

  for (let round = 1; round <= 10; round += 1) {
    await expect.poll(async () => {
      const progress = await readProgress(page);
      return { week: progress.week, phase: progress.phase, round: progress.currentRound };
    }).toEqual({ week: round, phase: "analysis", round });

    await openCurrentOpponentAnalysis(page);
    await advanceClubWeek(page, "inbox");
    await advanceClubWeek(page, "training");
    await chooseTrainingForCurrentWeek(page);
    await playCurrentMatch(page);

    const played = await readProgress(page);
    expect(played.lastMatchId).toBeTruthy();
    expect(played.lastMatchRound).toBe(round);
    expect(played.lastOpponentId).toBeTruthy();
    expect(played.decisionCount).toBeGreaterThan(0);
    expect(played.trainingFocusId).toBeTruthy();
    expect(played.activeMatchSession).toBe(false);

    matchIds.add(played.lastMatchId);
    opponentIds.add(played.lastOpponentId);
    played.decisionLabels.forEach((label) => decisionLabels.add(label));
    observations.push({
      round,
      opponent: played.lastOpponentName,
      opponentId: played.lastOpponentId,
      training: played.trainingFocusName,
      decisions: played.decisionCount
    });

    await rollToNextWeek(page, round + 1);
  }

  const final = await readProgress(page);
  expect(matchIds.size).toBe(10);
  expect(opponentIds.size).toBe(10);
  expect(decisionLabels.size).toBeGreaterThan(1);
  expect(final.week).toBe(11);
  expect(final.phase).toBe("analysis");
  expect(final.currentRound).toBe(11);
  expect(final.seasonStatus).toBe("active");
  expect(final.activeMatchSession).toBe(false);

  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#nextActionPrimary")).toBeEnabled();

  console.log("10-round canonical playthrough observations:", JSON.stringify(observations));
});
