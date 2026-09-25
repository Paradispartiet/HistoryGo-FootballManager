import { expect, test } from "@playwright/test";

function completedSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 76 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 79 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 82 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const pairings = [
    [["rosenborg", "brann"], ["viking", "molde"]],
    [["viking", "rosenborg"], ["brann", "molde"]],
    [["rosenborg", "molde"], ["brann", "viking"]],
    [["brann", "rosenborg"], ["molde", "viking"]],
    [["rosenborg", "viking"], ["molde", "brann"]],
    [["molde", "rosenborg"], ["viking", "brann"]]
  ];
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: {
      id: "hg-eliteserien",
      mode: "league",
      tierId: "eliteserien",
      tierName: "Eliteserien",
      tierLevel: 1,
      clubCount: 4,
      rounds: 6,
      homeAndAway: true,
      points: { win: 3, draw: 1, loss: 0 },
      version: 3
    },
    tier: {
      id: "eliteserien",
      name: "Eliteserien",
      level: 1,
      clubCount: 4,
      groupSize: 4,
      rounds: 6,
      relegation: { toTier: "obosligaen", direct: 0, playoff: 1, playoffRounds: 1 }
    },
    seed: "playoff-browser-regression",
    seasonNumber: 2,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 6,
    status: "completed",
    fixtures: pairings.map((pairs, roundIndex) => ({
      round: roundIndex + 1,
      status: "completed",
      matches: pairs.map(([homeClubId, awayClubId], matchIndex) => ({
        id: `playoff-season-r${roundIndex + 1}-${matchIndex}`,
        round: roundIndex + 1,
        homeClubId,
        awayClubId,
        status: "completed",
        result: { homeGoals: 1, awayGoals: 1, simulated: homeClubId !== "rosenborg" && awayClubId !== "rosenborg" }
      }))
    })),
    completedMatchIds: pairings.flatMap((pairs, roundIndex) =>
      pairs.map((_, matchIndex) => `playoff-season-r${roundIndex + 1}-${matchIndex}`)
    ),
    createdFrom: "browser playoff regression"
  };
}

function completedSecondDivisionSeason() {
  const season = completedSeason();
  return {
    ...season,
    competition: {
      ...season.competition,
      id: "hg-andredivisjon-avdeling1",
      tierId: "andredivisjon",
      tierName: "2. divisjon",
      tierLevel: 3
    },
    tier: {
      id: "andredivisjon",
      name: "2. divisjon",
      level: 3,
      clubCount: 4,
      groupSize: 4,
      rounds: 6,
      promotion: { toTier: "obosligaen", direct: 1, playoff: 1, playoffRounds: 2 }
    },
    seed: "playoff-browser-two-round"
  };
}


function lostRelegationPlayoff() {
  const playoff = activePlayoff();
  playoff.status = "lost";
  playoff.rounds[0] = {
    ...playoff.rounds[0],
    status: "lost",
    legs: [
      { leg: 1, homeAway: "away", status: "completed", score: { for: 0, against: 2 } },
      { leg: 2, homeAway: "home", status: "completed", score: { for: 0, against: 1 } }
    ],
    aggregate: { for: 0, against: 3 },
    awayGoals: { manager: 0, opponent: 1 },
    decidedBy: "sammenlagt"
  };
  return playoff;
}

function activePlayoff() {
  return {
    version: "historygo-football-manager.league-playoff.v1",
    kind: "relegation",
    seed: "playoff-browser-regression-kval",
    tierId: "eliteserien",
    tierName: "Eliteserien",
    targetTierId: "obosligaen",
    targetTierName: "OBOS-ligaen",
    seasonNumber: 2,
    fromPosition: 4,
    managerClubId: "rosenborg",
    currentRoundIndex: 0,
    status: "active",
    resolution: null,
    rounds: [{
      index: 0,
      name: "Nedrykkskvalifisering mot OBOS-ligaen",
      role: "defender",
      description: "Vinner du sammenlagt, beholder du plassen i Eliteserien.",
      opponent: {
        id: "odd",
        name: "Odd",
        ground: "Skagerak Arena",
        strength: 68,
        tier: "obosligaen"
      },
      legs: [
        { leg: 1, homeAway: "away", status: "scheduled", score: null },
        { leg: 2, homeAway: "home", status: "scheduled", score: null }
      ],
      status: "active",
      aggregate: { for: 0, against: 0 },
      awayGoals: { manager: 0, opponent: 0 },
      decidedBy: null
    }]
  };
}

function activePlayoffAfterFirstLeg() {
  const playoff = activePlayoff();
  playoff.rounds[0].legs[0] = {
    leg: 1,
    homeAway: "away",
    status: "completed",
    score: { for: 1, against: 2 }
  };
  return playoff;
}


function activeTwoRoundPromotionPlayoffAfterFirstLeg() {
  return {
    version: "historygo-football-manager.league-playoff.v1",
    kind: "promotion",
    seed: "playoff-browser-two-round-kval",
    tierId: "andredivisjon",
    tierName: "2. divisjon",
    targetTierId: "obosligaen",
    targetTierName: "OBOS-ligaen",
    seasonNumber: 2,
    fromPosition: 2,
    managerClubId: "rosenborg",
    currentRoundIndex: 0,
    status: "active",
    resolution: null,
    rounds: [
      {
        index: 0,
        name: "Avdelingsoppgjøret",
        role: "peer",
        description: "Vinneren går videre til kvalifisering mot OBOS-ligaen.",
        opponent: {
          id: "skeid",
          name: "Skeid",
          ground: "Nordre Åsen",
          strength: 57,
          tier: "andredivisjon",
          group: "avdeling2"
        },
        legs: [
          { leg: 1, homeAway: "away", status: "completed", score: { for: 20, against: 0 } },
          { leg: 2, homeAway: "home", status: "scheduled", score: null }
        ],
        status: "active",
        aggregate: { for: 0, against: 0 },
        awayGoals: { manager: 0, opponent: 0 },
        decidedBy: null
      },
      {
        index: 1,
        name: "Opprykkskvalifisering mot OBOS-ligaen",
        role: "challenger",
        description: "Vinner du sammenlagt, spiller du i OBOS-ligaen neste sesong.",
        opponent: {
          id: "odd",
          name: "Odd",
          ground: "Skagerak Arena",
          strength: 68,
          tier: "obosligaen"
        },
        legs: [
          { leg: 1, homeAway: "home", status: "scheduled", score: null },
          { leg: 2, homeAway: "away", status: "scheduled", score: null }
        ],
        status: "active",
        aggregate: { for: 0, against: 0 },
        awayGoals: { manager: 0, opponent: 0 },
        decidedBy: null
      }
    ]
  };
}


function activeTwoRoundPromotionPlayoffInSecondRound() {
  const playoff = activeTwoRoundPromotionPlayoffAfterFirstLeg();
  playoff.currentRoundIndex = 1;
  playoff.rounds[0] = {
    ...playoff.rounds[0],
    status: "won",
    legs: [
      { leg: 1, homeAway: "away", status: "completed", score: { for: 20, against: 0 } },
      { leg: 2, homeAway: "home", status: "completed", score: { for: 1, against: 0 } }
    ],
    aggregate: { for: 21, against: 0 },
    awayGoals: { manager: 20, opponent: 0 },
    decidedBy: "sammenlagt"
  };
  return playoff;
}


function activeTwoRoundPromotionPlayoffBeforeFinalLeg() {
  const playoff = activeTwoRoundPromotionPlayoffInSecondRound();
  playoff.rounds[1] = {
    ...playoff.rounds[1],
    legs: [
      { leg: 1, homeAway: "home", status: "completed", score: { for: 20, against: 0 } },
      { leg: 2, homeAway: "away", status: "scheduled", score: null }
    ]
  };
  return playoff;
}


test("aktiv kvalifisering erstatter død ny-sesong-handling i Stats", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_browser_regression",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#leagueSeasonPanel")).toBeVisible();

  const command = page.locator("#seasonCommand");
  await expect(command).toHaveAttribute("data-state", "playoff");
  await expect(command).toContainText(/kvalifisering/i);
  await expect(command.locator(".season-next-match")).toContainText("Odd");

  const goToMatch = command.getByRole("button", { name: "Gå til kamp" });
  await expect(goToMatch).toBeEnabled();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();

  await goToMatch.click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator('.main-nav [role="tab"][data-tab-target="kamp"]')).toHaveAttribute("aria-selected", "true");
});


async function playVisibleMatchday(page, choiceIndex = 0) {
  const kickoff = page.locator(".matchday-kickoff-button:visible").first();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await kickoff.isVisible()) break;
    const action = page.locator(".matchday-scene-action:visible").first();
    await expect(action).toBeVisible();
    await action.click();
  }

  await expect(kickoff).toBeVisible();
  await kickoff.click();

  const nextWeek = page.locator(".matchday-next-week-button:visible").first();
  for (let event = 0; event < 6; event += 1) {
    if (await nextWeek.isVisible()) break;

    const skip = page.locator(".matchday-live-button.is-secondary:visible")
      .filter({ hasText: "Hopp til pausen" })
      .first();
    if (await skip.isVisible()) await skip.click();

    const decisions = page.locator(".matchday-decision-button:not([disabled]):visible");
    const decisionCount = await decisions.count();
    expect(decisionCount).toBeGreaterThan(0);
    await decisions.nth((choiceIndex + event) % decisionCount).click();
  }

  await expect(nextWeek).toBeVisible();
}

async function rollVisibleMatchdayToNextWeek(page, expectedWeek) {
  const nextWeek = page.locator(".matchday-next-week-button:visible").first();
  await expect(nextWeek).toBeVisible();
  await nextWeek.click();

  await expect.poll(async () => page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "null");
    const clubWeek = merits?.clubWeekState || null;
    return {
      week: Number(clubWeek?.week) || null,
      phase: clubWeek?.phase || null
    };
  })).toEqual({ week: expectedWeek, phase: "analysis" });
}


async function readCanonicalClubWeek(page) {
  return page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "null");
    const clubWeek = merits?.clubWeekState || null;
    return {
      week: Number(clubWeek?.week) || null,
      phase: clubWeek?.phase || null
    };
  });
}

async function saveCurrentPlayoffOpponentAnalysis(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="analysis"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();

  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await expect(workshop).toBeVisible();
  await expect(workshop).toContainText("Odd");

  const focusOptions = workshop.locator("[data-opponent-analysis-focus]");
  const focusCount = await focusOptions.count();
  expect(focusCount).toBeGreaterThan(0);
  await focusOptions.first().click();

  const countermeasureOptions = workshop.locator("[data-opponent-analysis-countermeasure]");
  const countermeasureCount = await countermeasureOptions.count();
  expect(countermeasureCount).toBeGreaterThan(0);
  await countermeasureOptions.first().click();

  await workshop.locator(".opponent-analysis-save").click();
  await expect(workshop.locator(".opponent-analysis-feedback")).toContainText("kampklarheten er oppdatert");

  await page.locator("#managerClubRoomDrawer .club-room-close").click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeHidden();
}

async function advancePlayoffClubWeek(page, expectedPhase) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  const advance = page.locator("#managerCalendarAdvancePhase");
  await expect(advance).toBeVisible();
  await advance.click();

  await expect.poll(async () => (await readCanonicalClubWeek(page)).phase).toBe(expectedPhase);
}

async function choosePlayoffTraining(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();

  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  const programOptions = page.locator("#managerTeamChoiceDrawerBody .training-program-select:not([disabled])");
  expect(await programOptions.count()).toBeGreaterThan(0);
  await programOptions.first().click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();

  if ((await readCanonicalClubWeek(page)).phase === "training") {
    await page.locator("#trainingDayChangeFocus").click();
    await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
    const focusOptions = page
      .locator("#managerTeamChoiceDrawerBody .weekly-training-card")
      .getByRole("button", { name: "Velg fokus" });
    expect(await focusOptions.count()).toBeGreaterThan(0);
    await focusOptions.first().click();
    await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
    await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  }

  await expect.poll(async () => (await readCanonicalClubWeek(page)).phase).toBe("match_prep");
}

async function openPlayoffPreMatch(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  const kickoff = page.locator(".matchday-kickoff-button:visible").first();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await kickoff.isVisible()) break;
    const action = page.locator(".matchday-scene-action:visible").first();
    await expect(action).toBeVisible();
    await action.click();
  }

  await expect.poll(async () => (await readCanonicalClubWeek(page)).phase).toBe("matchday");
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-status", "in_progress");
  await expect(kickoff).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "null");
    return matchday?.session?.opponent?.name || null;
  })).toBe("Odd");
}


test("aktiv kvalifisering er en spillbar kamp i den autoritative kampklarheten", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 31,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_matchday_regression",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 31,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-regression-kval-kval-r1-k1",
            opponentId: "odd",
            opponentName: "Odd",
            round: 1,
            week: 31,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Odd presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Kvalifiseringskampen er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("#matchdayReadiness")).toContainText(/kampklar/i);
  await expect(page.locator("#playMatchdayButton")).toBeEnabled();
});


test("første kvaliklegg registreres gjennom ekte Kampdag uten tidlig sesongdom", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 31,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_first_leg_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 31,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-regression-kval-kval-r1-k1",
            opponentId: "odd",
            opponentName: "Odd",
            round: 1,
            week: 31,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Odd presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Kvalifiseringskampen er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");

  await playVisibleMatchday(page, 0);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "null");
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const round = playoff?.rounds?.[0] || null;
    const firstLegScore = round?.legs?.[0]?.score || null;
    const matchScore = matchday?.lastMatch?.score || null;
    return {
      playoffStatus: playoff?.status || null,
      currentRoundIndex: Number(playoff?.currentRoundIndex),
      firstLegStatus: round?.legs?.[0]?.status || null,
      firstLegScoreRecorded: Number.isFinite(Number(firstLegScore?.for)) && Number.isFinite(Number(firstLegScore?.against)),
      matchScoreRecorded: Number.isFinite(Number(matchScore?.for)) && Number.isFinite(Number(matchScore?.against)),
      firstLegScoreMatchesMatchday:
        Number(firstLegScore?.for) === Number(matchScore?.for) &&
        Number(firstLegScore?.against) === Number(matchScore?.against),
      secondLegStatus: round?.legs?.[1]?.status || null,
      roundStatus: round?.status || null,
      seasonReview: envelope?.sessions?.league?.seasonReview || null,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toMatchObject({
    playoffStatus: "active",
    currentRoundIndex: 0,
    firstLegStatus: "completed",
    firstLegScoreRecorded: true,
    matchScoreRecorded: true,
    firstLegScoreMatchesMatchday: true,
    secondLegStatus: "scheduled",
    roundStatus: "active",
    seasonReview: null,
    archiveCount: 0
  });
});


test("to kvaliklegg går gjennom Club Week og avgjør neste sesong i én sammenhengende flyt", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 31,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_week_rollover_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 31,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-regression-kval-kval-r1-k1",
            opponentId: "odd",
            opponentName: "Odd",
            round: 1,
            week: 31,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Odd presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Første kvaliklegg er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSeason(), playoff: activePlayoff() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");

  await playVisibleMatchday(page, 0);

  await expect.poll(async () => page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "null");
    return merits?.clubWeekState?.phase || null;
  })).toBe("review");

  await rollVisibleMatchdayToNextWeek(page, 32);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const trainingFocus = JSON.parse(localStorage.getItem("hgfm.weeklyTrainingFocus.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const round = playoff?.rounds?.[0] || null;
    return {
      playoffStatus: playoff?.status || null,
      currentRoundIndex: Number(playoff?.currentRoundIndex),
      firstLegStatus: round?.legs?.[0]?.status || null,
      secondLegStatus: round?.legs?.[1]?.status || null,
      trainingFocus,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    playoffStatus: "active",
    currentRoundIndex: 0,
    firstLegStatus: "completed",
    secondLegStatus: "scheduled",
    trainingFocus: null,
    archiveCount: 0
  });

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#seasonCommand")).toContainText("Odd");
  await expect(page.locator("#seasonCommand")).toContainText(/kamp 2 av 2/i);
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();

  await saveCurrentPlayoffOpponentAnalysis(page);

  await expect.poll(async () => page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "null");
    const plan = envelope?.sessions?.league?.opponentAnalysisPlan || null;
    return {
      fixtureId: plan?.fixtureId || null,
      opponentId: plan?.opponentId || null,
      opponentName: plan?.opponentName || null
    };
  })).toEqual({
    fixtureId: "playoff-browser-regression-kval-kval-r1-k2",
    opponentId: "odd",
    opponentName: "Odd"
  });

  await advancePlayoffClubWeek(page, "inbox");
  await advancePlayoffClubWeek(page, "training");
  await choosePlayoffTraining(page);
  await openPlayoffPreMatch(page);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const round = playoff?.rounds?.[0] || null;
    return {
      playoffStatus: playoff?.status || null,
      firstLegStatus: round?.legs?.[0]?.status || null,
      secondLegStatus: round?.legs?.[1]?.status || null,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    playoffStatus: "active",
    firstLegStatus: "completed",
    secondLegStatus: "scheduled",
    archiveCount: 0
  });

  await playVisibleMatchday(page, 1);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const round = playoff?.rounds?.[0] || null;
    const secondLegScore = round?.legs?.[1]?.score || null;
    const matchScore = matchday?.lastMatch?.score || null;
    return {
      playoffStatus: playoff?.status || null,
      roundStatus: round?.status || null,
      firstLegStatus: round?.legs?.[0]?.status || null,
      secondLegStatus: round?.legs?.[1]?.status || null,
      secondLegScoreMatchesMatchday:
        Number(secondLegScore?.for) === Number(matchScore?.for) &&
        Number(secondLegScore?.against) === Number(matchScore?.against),
      archiveCount: Array.isArray(archive) ? archive.length : -1,
      archivedSeasonNumber: Number(archive?.[0]?.seasonNumber) || null
    };
  })).toMatchObject({
    firstLegStatus: "completed",
    secondLegStatus: "completed",
    secondLegScoreMatchesMatchday: true,
    archiveCount: 1,
    archivedSeasonNumber: 2
  });

  const terminalState = await page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    return {
      playoffStatus: playoff?.status || null,
      roundStatus: playoff?.rounds?.[0]?.status || null
    };
  });
  expect(["won", "lost"]).toContain(terminalState.playoffStatus);
  expect(terminalState.roundStatus).toBe(terminalState.playoffStatus);

  const expectedTierId = terminalState.playoffStatus === "won" ? "eliteserien" : "obosligaen";
  const expectedTierName = terminalState.playoffStatus === "won" ? "Eliteserien" : "OBOS-ligaen";
  const expectedMovement = terminalState.playoffStatus === "won" ? "stay" : "relegated";

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeEnabled();
  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      status: season?.status || null,
      tierId: season?.competition?.tierId || null,
      tierName: season?.competition?.tierName || null,
      viaPlayoff: Boolean(season?.previousOutcome?.viaPlayoff),
      movement: season?.previousOutcome?.movement || null,
      playoff,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    seasonNumber: 3,
    status: "active",
    tierId: expectedTierId,
    tierName: expectedTierName,
    viaPlayoff: true,
    movement: expectedMovement,
    playoff: null,
    archiveCount: 1
  });

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#seasonCommand")).toContainText(expectedTierName);
});


test("vunnet første omgang i to-runders kvalifisering åpner omgang 2 uten tidlig sesongdom", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 32,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_two_round_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "2. divisjon",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 32,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-two-round-kval-kval-r1-k2",
            opponentId: "skeid",
            opponentName: "Skeid",
            round: 1,
            week: 32,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Skeid presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Returkampen i avdelingsoppgjøret er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSecondDivisionSeason(), playoff: activeTwoRoundPromotionPlayoffAfterFirstLeg() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");

  await playVisibleMatchday(page, 0);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const firstRound = playoff?.rounds?.[0] || null;
    const secondRound = playoff?.rounds?.[1] || null;
    return {
      playoffStatus: playoff?.status || null,
      currentRoundIndex: Number(playoff?.currentRoundIndex),
      firstRoundStatus: firstRound?.status || null,
      firstRoundSecondLegStatus: firstRound?.legs?.[1]?.status || null,
      secondRoundStatus: secondRound?.status || null,
      secondRoundFirstLegStatus: secondRound?.legs?.[0]?.status || null,
      secondRoundOpponent: secondRound?.opponent?.name || null,
      seasonReview: envelope?.sessions?.league?.seasonReview || null,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    playoffStatus: "active",
    currentRoundIndex: 1,
    firstRoundStatus: "won",
    firstRoundSecondLegStatus: "completed",
    secondRoundStatus: "active",
    secondRoundFirstLegStatus: "scheduled",
    secondRoundOpponent: "Odd",
    seasonReview: null,
    archiveCount: 0
  });

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#seasonCommand")).toContainText("Odd");
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
});


test("første kamp i omgang 2 registreres gjennom ekte Kampdag uten tidlig sesongdom", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 33,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_two_round_second_round_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "2. divisjon",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 33,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-two-round-kval-kval-r2-k1",
            opponentId: "odd",
            opponentName: "Odd",
            round: 2,
            week: 33,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Odd presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Første kamp i opprykkskvalifiseringen er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSecondDivisionSeason(), playoff: activeTwoRoundPromotionPlayoffInSecondRound() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");

  await playVisibleMatchday(page, 2);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "null");
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const firstRound = playoff?.rounds?.[0] || null;
    const secondRound = playoff?.rounds?.[1] || null;
    const firstLegScore = secondRound?.legs?.[0]?.score || null;
    const matchScore = matchday?.lastMatch?.score || null;
    return {
      playoffStatus: playoff?.status || null,
      currentRoundIndex: Number(playoff?.currentRoundIndex),
      firstRoundStatus: firstRound?.status || null,
      secondRoundStatus: secondRound?.status || null,
      secondRoundFirstLegStatus: secondRound?.legs?.[0]?.status || null,
      secondRoundFirstLegScoreMatchesMatchday:
        Number(firstLegScore?.for) === Number(matchScore?.for) &&
        Number(firstLegScore?.against) === Number(matchScore?.against),
      secondRoundSecondLegStatus: secondRound?.legs?.[1]?.status || null,
      seasonReview: envelope?.sessions?.league?.seasonReview || null,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    playoffStatus: "active",
    currentRoundIndex: 1,
    firstRoundStatus: "won",
    secondRoundStatus: "active",
    secondRoundFirstLegStatus: "completed",
    secondRoundFirstLegScoreMatchesMatchday: true,
    secondRoundSecondLegStatus: "scheduled",
    seasonReview: null,
    archiveCount: 0
  });
});


test("returkampen i omgang 2 avgjør opprykket og ruller sesong 3 til OBOS", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 34,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_two_round_terminal_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "2. divisjon",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 34,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-two-round-kval-kval-r2-k2",
            opponentId: "odd",
            opponentName: "Odd",
            round: 2,
            week: 34,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Odd presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Returkampen som avgjør opprykket er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSecondDivisionSeason(), playoff: activeTwoRoundPromotionPlayoffBeforeFinalLeg() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");

  await playVisibleMatchday(page, 1);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const firstRound = playoff?.rounds?.[0] || null;
    const secondRound = playoff?.rounds?.[1] || null;
    const secondLegScore = secondRound?.legs?.[1]?.score || null;
    const matchScore = matchday?.lastMatch?.score || null;
    return {
      playoffStatus: playoff?.status || null,
      currentRoundIndex: Number(playoff?.currentRoundIndex),
      firstRoundStatus: firstRound?.status || null,
      secondRoundStatus: secondRound?.status || null,
      secondRoundSecondLegStatus: secondRound?.legs?.[1]?.status || null,
      secondRoundSecondLegScoreMatchesMatchday:
        Number(secondLegScore?.for) === Number(matchScore?.for) &&
        Number(secondLegScore?.against) === Number(matchScore?.against),
      archiveCount: Array.isArray(archive) ? archive.length : -1,
      archivedSeasonNumber: Number(archive?.[0]?.seasonNumber) || null
    };
  })).toEqual({
    playoffStatus: "won",
    currentRoundIndex: 1,
    firstRoundStatus: "won",
    secondRoundStatus: "won",
    secondRoundSecondLegStatus: "completed",
    secondRoundSecondLegScoreMatchesMatchday: true,
    archiveCount: 1,
    archivedSeasonNumber: 2
  });

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeEnabled();
  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      status: season?.status || null,
      tierId: season?.competition?.tierId || null,
      tierName: season?.competition?.tierName || null,
      viaPlayoff: Boolean(season?.previousOutcome?.viaPlayoff),
      movement: season?.previousOutcome?.movement || null,
      playoff,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    seasonNumber: 3,
    status: "active",
    tierId: "obosligaen",
    tierName: "OBOS-ligaen",
    viaPlayoff: true,
    movement: "promoted",
    playoff: null,
    archiveCount: 1
  });

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#seasonCommand")).toContainText("OBOS-ligaen");
});


test("andre kvaliklegg avgjør playoff og ruller riktig nivå inn i neste sesong", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    const clubWeekState = {
      week: 32,
      phase: "matchday",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_second_leg_ui",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 32,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "playoff-browser-regression-kval-kval-r1-k2",
            opponentId: "odd",
            opponentName: "Odd",
            round: 1,
            week: 32,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Odd presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Returkampen i kvalifiseringen er analysert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, { season: completedSeason(), playoff: activePlayoffAfterFirstLeg() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator("#matchdayReadiness")).toHaveAttribute("data-ready", "true");

  await playVisibleMatchday(page, 1);

  await expect.poll(async () => page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const round = playoff?.rounds?.[0] || null;
    const secondLegScore = round?.legs?.[1]?.score || null;
    const matchScore = matchday?.lastMatch?.score || null;
    return {
      playoffTerminal: playoff?.status === "won" || playoff?.status === "lost",
      firstLegStatus: round?.legs?.[0]?.status || null,
      secondLegStatus: round?.legs?.[1]?.status || null,
      secondLegScoreRecorded: Number.isFinite(Number(secondLegScore?.for)) && Number.isFinite(Number(secondLegScore?.against)),
      secondLegScoreMatchesMatchday:
        Number(secondLegScore?.for) === Number(matchScore?.for) &&
        Number(secondLegScore?.against) === Number(matchScore?.against),
      roundTerminal: round?.status === "won" || round?.status === "lost",
      archiveCount: Array.isArray(archive) ? archive.length : -1,
      archivedSeasonNumber: Number(archive?.[0]?.seasonNumber) || null
    };
  })).toEqual({
    playoffTerminal: true,
    firstLegStatus: "completed",
    secondLegStatus: "completed",
    secondLegScoreRecorded: true,
    secondLegScoreMatchesMatchday: true,
    roundTerminal: true,
    archiveCount: 1,
    archivedSeasonNumber: 2
  });

  const terminalStatus = await page.evaluate(() => {
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    return playoff?.status || null;
  });
  expect(["won", "lost"]).toContain(terminalStatus);

  const expectedTierId = terminalStatus === "won" ? "eliteserien" : "obosligaen";
  const expectedTierName = terminalStatus === "won" ? "Eliteserien" : "OBOS-ligaen";
  const expectedMovement = terminalStatus === "won" ? "stay" : "relegated";

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeEnabled();
  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      status: season?.status || null,
      tierId: season?.competition?.tierId || null,
      tierName: season?.competition?.tierName || null,
      viaPlayoff: Boolean(season?.previousOutcome?.viaPlayoff),
      movement: season?.previousOutcome?.movement || null,
      playoff,
      archiveCount: Array.isArray(archive) ? archive.length : -1
    };
  })).toEqual({
    seasonNumber: 3,
    status: "active",
    tierId: expectedTierId,
    tierName: expectedTierName,
    viaPlayoff: true,
    movement: expectedMovement,
    playoff: null,
    archiveCount: 1
  });

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#seasonCommand")).toContainText(expectedTierName);
});


test("tapt nedrykkskvalifisering flytter neste synlige sesong til OBOS", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ season, playoff }) => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "playoff_resolution_next_season",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "completed",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("historygo-football-manager.league-playoff.v1", JSON.stringify(playoff));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      clubWeekState: {
        week: 31,
        phase: "review",
        boardTrust: 50,
        playerMorale: 50,
        tacticalClarity: 50,
        trainingCulture: 50,
        mediaPressure: 50
      }
    }));
  }, { season: completedSeason(), playoff: lostRelegationPlayoff() });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();

  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeEnabled();
  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const playoff = JSON.parse(localStorage.getItem("historygo-football-manager.league-playoff.v1") || "null");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      status: season?.status || null,
      tierId: season?.competition?.tierId || null,
      tierName: season?.competition?.tierName || null,
      viaPlayoff: Boolean(season?.previousOutcome?.viaPlayoff),
      movement: season?.previousOutcome?.movement || null,
      playoff
    };
  })).toEqual({
    seasonNumber: 3,
    status: "active",
    tierId: "obosligaen",
    tierName: "OBOS-ligaen",
    viaPlayoff: true,
    movement: "relegated",
    playoff: null
  });

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#seasonCommand")).toContainText("OBOS-ligaen");
});
