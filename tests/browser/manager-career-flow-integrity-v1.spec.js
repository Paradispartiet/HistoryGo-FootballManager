import { expect, test } from "@playwright/test";

test("preseason følger onboarding og kan ikke konsumere Club Week", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeVisible();
  const leagueStart = page.locator('[data-start-mode="league"]');
  await expect(leagueStart).toBeVisible();

  await leagueStart.click();
  await expect(page.locator("#onboardingClubStep")).toBeVisible();
  await expect(page.locator("#onboardingClubModeTakeover")).toBeVisible();
  await page.locator("#onboardingClubModeTakeover").click();
  await page.locator('.club-takeover-option[data-club-id="rosenborg"]').click();
  await page.locator("#onboardingCreateClub").click();

  // Klubb + grunntropp er klare, men staben mangler. Den canonicale
  // onboarding-rekkefølgen skal derfor sende manageren til Stab før Trening.
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#managerStaffRosterV1")).toBeVisible();
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "false");
  await expect(page.locator("#availableStaffList")).toBeVisible();
  await expect(page.locator("#availableStaffList")).toContainText("Jonathan Hartmann");
  await expect(page.locator("#availableStaffList")).toContainText("Alexander Tettey");
  await expect(page.locator("#availableStaffList")).toContainText("Alexander Lund Hansen");
  await expect(page.locator("#availableStaffList")).not.toContainText("Prototypeprofil");

  const before = await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    return {
      week: merits.clubWeekState?.week ?? null,
      phase: merits.clubWeekState?.phase ?? null,
      offPitch: merits.offPitch ?? null
    };
  });
  expect(before.week).toBe(1);
  expect(before.phase).toBe("analysis");

  // Gå frivillig til Trening før seriestart. Valget skal kunne lagres som en
  // preseason-plan, men må ikke flytte manageruka eller bruke ukeeffekten.
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();

  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  const programButton = page.locator("#managerTeamChoiceDrawerBody .training-program-select:not([disabled])").first();
  await expect(programButton).toBeVisible();
  await programButton.click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  await expect(page.locator("#trainingDayProgramTitle")).not.toHaveText("Ikke valgt");

  const after = await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    const program = JSON.parse(localStorage.getItem("hgfm.weeklyTrainingProgram.v1") || "null");
    return {
      week: merits.clubWeekState?.week ?? null,
      phase: merits.clubWeekState?.phase ?? null,
      offPitch: merits.offPitch ?? null,
      program
    };
  });

  expect(after.week).toBe(before.week);
  expect(after.phase).toBe(before.phase);
  expect(after.offPitch).toEqual(before.offPitch);
  expect(after.program?.programId).toBeTruthy();
  expect(after.program?.applied).toBe(false);
});

test("Rosenborg kan engasjere hele kildekorrekte 1+3+1+1-staben", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-start-mode="league"]').click();
  await page.locator("#onboardingClubModeTakeover").click();
  await page.locator('.club-takeover-option[data-club-id="rosenborg"]').click();
  await page.locator("#onboardingCreateClub").click();

  await expect(page.locator("#availableStaffList")).toBeVisible();
  const names = [
    "Jonathan Hartmann",
    "Alexander Tettey",
    "Roger Naustan",
    "Vetle Veierød",
    "Ole Næss",
    "Alexander Lund Hansen"
  ];
  for (const name of names) {
    const card = page.locator("#availableStaffList .unlock-card").filter({ hasText: name });
    await expect(card).toHaveCount(1);
    await card.getByRole("button", { name: "Engasjer" }).click();
  }

  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "true");
  await expect(page.locator("#managerStaffRosterV1 .staff-roster-total")).toHaveText("6/6 roller");
  const metric = page.locator("#adminDriftMetrics .admin-metric").filter({ hasText: "Stab engasjert" });
  await expect(metric.locator(".admin-metric-value")).toHaveText("6/6");

  const state = await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    return {
      hired: merits.hiredStaffIds || [],
      week: merits.clubWeekState?.week ?? null,
      phase: merits.clubWeekState?.phase ?? null
    };
  });
  expect(state.hired).toHaveLength(6);
  expect(state.week).toBe(1);
  expect(state.phase).toBe("analysis");
});

test("ingen etterkampknapp eier en skjult flerfase-løkke", async ({ page }) => {
  await page.goto("/");
  const source = await page.evaluate(() => fetch("/src/app.js").then((response) => response.text()));
  const reportStart = source.indexOf("nextWeekButton.addEventListener");
  const reportEnd = source.indexOf("card.append(nextWeekButton)", reportStart);
  const reportHandler = source.slice(reportStart, reportEnd);
  expect(reportHandler).toContain('openManagerMatchdayTarget("next_week")');
  expect(reportHandler).not.toMatch(/for\s*\(let\s+i\s*=\s*0;\s*i\s*<=?\s*CLUB_WEEK_PHASE_IDS\.length/);
});

test("treningssynk kan ikke hoppe over Analyse og Innboks", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "flow_guard",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();

  // Regression contract: kildekoden skal ikke lenger inneholde en fase-løkke
  // som kan gå fra mandag til fredag på ett treningsvalg.
  const source = await page.evaluate(() => fetch("/src/app.js").then((response) => response.text()));
  const syncStart = source.indexOf("async function syncClubWeekPhaseToProgress()");
  const syncEnd = source.indexOf("// Kort norsk effekt-fras", syncStart);
  const syncSource = source.slice(syncStart, syncEnd);
  expect(syncSource).toContain('state.clubWeekState.phase !== allowedCurrentPhase');
  expect(syncSource).not.toMatch(/for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*CLUB_WEEK_PHASE_IDS\.length/);
});


test("ferdig kampforberedelse gjør matchday canonical", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    const clubs = [
      { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 82 },
      { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 80 },
      { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 79 },
      { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
    ];
    const match = (id, round, homeClubId, awayClubId) => ({
      id, round, status: "scheduled", result: null, homeClubId, awayClubId
    });
    const season = {
      version: "historygo-football-manager.league-season.v3",
      competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 6, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
      tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
      seed: "career-flow-match-prep",
      seasonNumber: 1,
      managerClubId: "rosenborg",
      clubs,
      currentRound: 1,
      status: "active",
      fixtures: [
        { round: 1, status: "scheduled", matches: [match("flow-r1-0", 1, "rosenborg", "brann"), match("flow-r1-1", 1, "viking", "molde")] },
        { round: 2, status: "scheduled", matches: [match("flow-r2-0", 2, "viking", "rosenborg"), match("flow-r2-1", 2, "brann", "molde")] }
      ],
      completedMatchIds: []
    };
    const clubWeekState = {
      week: 1,
      phase: "match_prep",
      boardTrust: 50,
      playerMorale: 50,
      tacticalClarity: 50,
      trainingCulture: 50,
      mediaPressure: 50
    };

    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "career_flow_match_prep",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({
      focusId: "formation_familiarity",
      week: 1,
      appliedSessionId: null
    }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: {
        league: {
          leagueSeason: season,
          clubWeekState,
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "flow-r1-0",
            opponentId: "brann",
            opponentName: "Brann",
            round: 1,
            week: 1,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Brann presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Kampforberedelsen er registrert.",
            risk: "Krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  });

  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  const action = page.locator("#matchdayCommand .matchday-scene-action");
  await expect(action).toHaveText("Fullfør forberedelsene");
  await expect(action).toHaveAttribute("data-matchday-target", "advance_matchday");
  await action.click();

  await expect.poll(async () => page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    return {
      merits: merits.clubWeekState?.phase || null,
      session: envelope.sessions?.league?.clubWeekState?.phase || null
    };
  })).toEqual({ merits: "matchday", session: "matchday" });

  await expect(page.locator("#matchdayCommand .matchday-scene")).toHaveAttribute("data-phase", "ready");
  await expect(page.locator("#matchdayCommand .matchday-scene-action")).toHaveText("Åpne kampforberedelsen");
});


test("blank Rosenborg-takeover starter faktisk Eliteserien gjennom synlig managerflyt", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.locator('[data-start-mode="league"]').click();
  await page.locator("#onboardingClubModeTakeover").click();
  await page.locator('.club-takeover-option[data-club-id="rosenborg"]').click();
  await page.locator("#onboardingCreateClub").click();

  const staffNames = [
    "Jonathan Hartmann",
    "Alexander Tettey",
    "Roger Naustan",
    "Vetle Veierød",
    "Ole Næss",
    "Alexander Lund Hansen"
  ];
  for (const name of staffNames) {
    const card = page.locator("#availableStaffList .unlock-card").filter({ hasText: name });
    await expect(card).toHaveCount(1);
    await card.getByRole("button", { name: "Engasjer" }).click();
  }

  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "true");
  await expect(page.locator("#nextActionPrimaryTitle")).toHaveText("Velg treningsprogram");
  await page.locator("#nextActionPrimary").click();

  await expect(page.locator("#managerTrainingDay")).toBeVisible();
  await page.locator("#trainingDayChangeProgram").click();
  const programButton = page.locator("#managerTeamChoiceDrawerBody .training-program-select:not([disabled])").first();
  await expect(programButton).toBeVisible();
  await programButton.click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();

  await expect(page.locator("#nextActionPrimaryTitle")).toHaveText("Start sesongen");

  // Dette er den tidligere utestede overgangen i den faktiske managerflyten.
  // Klikket må returnere og materialisere terminlisten uten skjult state-seeding.
  await page.locator("#nextActionPrimary").click();

  await expect.poll(async () => page.evaluate(() => {
    const game = JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "{}");
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    return {
      leagueSeasonStatus: game.leagueSeasonStatus || null,
      seasonStatus: season?.status || null,
      currentRound: season?.currentRound || null,
      rounds: season?.competition?.rounds || null,
      clubCount: season?.competition?.clubCount || null,
      week: merits.clubWeekState?.week || null,
      phase: merits.clubWeekState?.phase || null
    };
  }), { timeout: 15_000 }).toEqual({
    leagueSeasonStatus: "active",
    seasonStatus: "active",
    currentRound: 1,
    rounds: 30,
    clubCount: 16,
    week: 1,
    phase: "analysis"
  });

  await expect(page.locator("#leagueOnboardingPanel")).toBeHidden();
  await expect(page.locator("#nextActionPhase")).toContainText("UKE 1");
});
