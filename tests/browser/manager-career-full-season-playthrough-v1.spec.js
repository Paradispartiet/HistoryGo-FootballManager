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
    const archive = parse("hgfm.seasonArchive.v1", []);
    const playerStats = parse("hgfm.playerSeasonStats.v1", { rows: [], matchIds: [] });

    return {
      week: Number(clubWeek?.week) || null,
      phase: clubWeek?.phase || null,
      seasonStatus: season?.status || null,
      seasonNumber: Number(season?.seasonNumber) || null,
      seasonRounds: Number(season?.competition?.rounds) || null,
      currentRound: Number(season?.currentRound) || null,
      archiveCount: Array.isArray(archive) ? archive.length : 0,
      playerStatsCount: Array.isArray(playerStats?.rows) ? playerStats.rows.length : 0,
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

async function openPreMatch(page, round) {
  console.log(`[full-season] round ${round}: click Kamp tab`);
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  console.log(`[full-season] round ${round}: Kamp tab click returned`);
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  const kickoff = page.locator(".matchday-kickoff-button:visible").first();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await kickoff.isVisible()) break;
    const action = page.locator(".matchday-scene-action:visible").first();
    await expect(action).toBeVisible();
    const label = (await action.textContent())?.trim() || "<empty>";
    console.log(`[full-season] round ${round}: scene action ${attempt + 1} click: ${label}`);
    await action.click();
    console.log(`[full-season] round ${round}: scene action ${attempt + 1} returned`);
  }

  console.log(`[full-season] round ${round}: await matchday phase`);
  await expect.poll(async () => (await readProgress(page)).phase).toBe("matchday");
  await expect(kickoff).toBeVisible();
  console.log(`[full-season] round ${round}: prematch ready`);
}

async function playCurrentMatch(page, round) {
  await openPreMatch(page, round);
  console.log(`[full-season] round ${round}: kickoff click`);
  await page.locator(".matchday-kickoff-button").click();
  console.log(`[full-season] round ${round}: kickoff returned`);

  const nextWeek = page.locator(".matchday-next-week-button:visible").first();
  for (let event = 0; event < 6; event += 1) {
    const eventNumber = event + 1;
    if (await nextWeek.isVisible()) {
      console.log(`[full-season] round ${round}: review visible before event ${eventNumber}`);
      break;
    }

    const skip = page.locator(".matchday-live-button.is-secondary:visible").filter({ hasText: "Hopp til pausen" }).first();
    if (await skip.isVisible()) {
      console.log(`[full-season] round ${round}: event ${eventNumber} skip click`);
      await skip.click();
      console.log(`[full-season] round ${round}: event ${eventNumber} skip returned`);
    }

    const decision = page.locator(".matchday-decision-button:not([disabled]):visible").first();
    console.log(`[full-season] round ${round}: event ${eventNumber} await decision`);
    await expect(decision).toBeVisible();
    const label = (await decision.textContent())?.trim() || "<empty>";
    console.log(`[full-season] round ${round}: event ${eventNumber} decision click: ${label}`);
    await decision.click();
    console.log(`[full-season] round ${round}: event ${eventNumber} decision returned`);
  }

  console.log(`[full-season] round ${round}: await review`);
  await expect(nextWeek).toBeVisible();
  await expect.poll(async () => (await readProgress(page)).phase).toBe("review");
  console.log(`[full-season] round ${round}: review ready`);
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

test.only("blank Rosenborg-save spiller full sesong og går canonicalt inn i sesong 2 gjennom ekte UI", async ({ page }) => {
  test.setTimeout(720_000);
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

  for (let round = 1; round <= 30; round += 1) {
    console.log(`[full-season] round ${round}: begin`);
    await expect.poll(async () => {
      const progress = await readProgress(page);
      return { week: progress.week, phase: progress.phase, round: progress.currentRound };
    }).toEqual({ week: round, phase: "analysis", round });

    await openCurrentOpponentAnalysis(page);
    console.log(`[full-season] round ${round}: analysis saved`);
    await advanceClubWeek(page, "inbox");
    console.log(`[full-season] round ${round}: phase inbox`);
    await advanceClubWeek(page, "training");
    console.log(`[full-season] round ${round}: phase training`);
    await chooseTrainingForCurrentWeek(page);
    console.log(`[full-season] round ${round}: training complete`);
    await playCurrentMatch(page, round);
    console.log(`[full-season] round ${round}: match complete`);

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

  const completed = await readProgress(page);
  expect(matchIds.size).toBe(30);
  expect(opponentIds.size).toBe(15);
  expect(decisionLabels.size).toBeGreaterThan(1);
  expect(completed.week).toBe(31);
  expect(completed.phase).toBe("analysis");
  expect(completed.seasonNumber).toBe(1);
  expect(completed.seasonRounds).toBe(30);
  expect(completed.currentRound).toBe(30);
  expect(completed.seasonStatus).toBe("completed");
  expect(completed.archiveCount).toBe(1);
  expect(completed.playerStatsCount).toBeGreaterThan(0);
  expect(completed.activeMatchSession).toBe(false);

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator('[data-tab-section="statistikk"]')).toBeVisible();
  await expect(page.locator("#seasonReviewPanel")).toBeVisible();
  await expect(page.locator("#seasonArchiveTable tbody tr")).toHaveCount(1);
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeEnabled();
  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => {
    const progress = await readProgress(page);
    return {
      seasonNumber: progress.seasonNumber,
      status: progress.seasonStatus,
      round: progress.currentRound
    };
  }).toEqual({ seasonNumber: 2, status: "active", round: 1 });

  const seasonTwo = await readProgress(page);
  expect(seasonTwo.week).toBe(31);
  expect(seasonTwo.phase).toBe("analysis");
  expect(seasonTwo.archiveCount).toBe(1);
  expect(seasonTwo.playerStatsCount).toBe(0);
  expect(seasonTwo.activeMatchSession).toBe(false);
  await expect(page.locator("#seasonReviewPanel")).toBeHidden();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();

  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#nextActionPrimary")).toBeEnabled();

  console.log("Full-season canonical playthrough observations:", JSON.stringify(observations));
});
