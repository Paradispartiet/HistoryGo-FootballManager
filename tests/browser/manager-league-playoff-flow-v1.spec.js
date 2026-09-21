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


test("andre kvaliklegg avgjør playoff gjennom ekte Kampdag og arkiverer sesongen", async ({ page }) => {
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
