import { expect, test } from "@playwright/test";

function seededSeason() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", isManager: true, ground: "Lerkendal", strength: 82 },
    { id: "brann", name: "Brann", isManager: false, ground: "Brann stadion", strength: 80 },
    { id: "viking", name: "Viking", isManager: false, ground: "Lyse Arena", strength: 79 },
    { id: "molde", name: "Molde", isManager: false, ground: "Aker stadion", strength: 78 }
  ];
  const round = (number, matches, completed = false) => ({
    round: number,
    status: completed ? "completed" : "scheduled",
    matches: matches.map((match, index) => ({
      id: `scene-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });

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
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-season-scene",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [
        { home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } },
        { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }
      ], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["scene-r1-0", "scene-r1-1"],
    createdFrom: "browser season scene"
  };
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    if (localStorage.getItem("historygo-football-manager.league-season.v3")) return;
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_season_scene_save",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(season));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#leagueSeasonPanel")).toBeVisible();
});

test("Stats åpner med managerens situasjon og neste kamp", async ({ page }) => {
  const command = page.locator("#seasonCommand");
  await expect(command.locator("h2")).toHaveText("Stats");
  await expect(command).toContainText("Serierunde 2 av 6");
  await expect(command.locator(".season-next-match")).toContainText("Viking");
  await expect(command.locator(".season-command-metrics article")).toHaveCount(4);
  await expect(command.locator(".season-command-metrics")).toContainText("1.");
  await expect(command.locator(".season-command-metrics")).toContainText("3");
  await expect(command.locator(".season-command-metrics")).toContainText("V");
});

test("tabell, kamprytme og full terminliste er samlet i Stats", async ({ page }) => {
  await expect(page.locator(".season-workspace-grid")).toBeVisible();
  const rows = page.locator(".season-compact-table tbody tr:not(.season-table-gap)");
  await expect(rows).toHaveCount(4);
  await expect(page.locator(".season-compact-table tr.is-manager-club")).toContainText("Rosenborg");
  await expect(page.locator(".season-fixture.is-recent")).toContainText("Brann");
  await expect(page.locator(".season-fixture.is-upcoming").first()).toContainText("Viking");
  await expect(page.locator(".season-depth")).toHaveAttribute("open", "");
  await expect(page.locator(".season-full-table")).toBeVisible();
  await expect(page.locator(".season-all-fixtures")).toBeVisible();
  await expect(page.locator("#playerStatsTable")).toBeVisible();
});

test("Stats gir direkte vei til kamp", async ({ page }) => {
  await page.getByRole("button", { name: "Gå til kamp" }).click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator('.main-nav [role="tab"][data-tab-target="kamp"]')).toHaveAttribute("aria-selected", "true");
});

test("Stats har ingen horisontal overflow på mobil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator(".season-command-metrics article")).toHaveCount(4);
  await expect(page.locator(".season-fixture-columns")).toBeVisible();
  await expect(page.locator(".season-full-table")).toBeVisible();
});

test("sesongdom flytter canonical styretillit før sesong 2", async ({ page }) => {
  await page.evaluate(() => {
    const seasonKey = "historygo-football-manager.league-season.v3";
    const meritsKey = "hgfm.teamMerits.v1";
    const modeKey = "hgfm.modeSessions.v1";
    const gameStartKey = "hgfm.gameStartState.v1";

    const season = JSON.parse(localStorage.getItem(seasonKey));
    season.status = "completed";
    season.currentRound = season.competition.rounds;
    season.completedMatchIds = [];
    season.fixtures.forEach((round) => {
      round.status = "completed";
      round.matches.forEach((match) => {
        const managerHome = match.homeClubId === season.managerClubId;
        const managerAway = match.awayClubId === season.managerClubId;
        match.status = "completed";
        match.result = managerHome
          ? { homeGoals: 2, awayGoals: 0, simulated: false }
          : managerAway
            ? { homeGoals: 0, awayGoals: 2, simulated: false }
            : { homeGoals: 0, awayGoals: 0, simulated: true };
        season.completedMatchIds.push(match.id);
      });
    });
    localStorage.setItem(seasonKey, JSON.stringify(season));

    const merits = JSON.parse(localStorage.getItem(meritsKey) || "{}");
    merits.clubWeekState = {
      ...(merits.clubWeekState || {}),
      week: 7,
      phase: "review",
      boardTrust: 63,
      playerMorale: Number(merits.clubWeekState?.playerMorale) || 50,
      tacticalClarity: Number(merits.clubWeekState?.tacticalClarity) || 50,
      trainingCulture: Number(merits.clubWeekState?.trainingCulture) || 50,
      mediaPressure: Number(merits.clubWeekState?.mediaPressure) || 50
    };
    localStorage.setItem(meritsKey, JSON.stringify(merits));

    const gameStart = JSON.parse(localStorage.getItem(gameStartKey) || "{}");
    gameStart.leagueSeasonStatus = "completed";
    localStorage.setItem(gameStartKey, JSON.stringify(gameStart));

    const envelope = JSON.parse(localStorage.getItem(modeKey) || "null");
    if (envelope?.sessions?.league) {
      envelope.sessions.league = {
        ...envelope.sessions.league,
        leagueSeason: season,
        teamMerits: merits,
        clubWeekState: merits.clubWeekState,
        gameStartState: gameStart
      };
      localStorage.setItem(modeKey, JSON.stringify(envelope));
    }
  });

  await page.reload();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeVisible();

  const before = await page.evaluate(() => {
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    return Number(merits.clubWeekState?.boardTrust);
  });
  expect(before).toBe(63);

  await page.locator("#startNewLeagueSeasonButton").click();

  await expect.poll(async () => page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const latest = archive[archive.length - 1] || null;
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      boardTrust: Number(merits.clubWeekState?.boardTrust),
      verdict: latest?.verdict || null,
      position: Number(latest?.position) || null
    };
  })).toEqual({
    seasonNumber: 2,
    boardTrust: 77,
    verdict: "triumph",
    position: 1
  });
});

test("sparket manager kan ikke starte en ny sesong etter reload", async ({ page }) => {
  await page.evaluate(() => {
    const seasonKey = "historygo-football-manager.league-season.v3";
    const modeKey = "hgfm.modeSessions.v1";
    const gameStartKey = "hgfm.gameStartState.v1";
    const archiveKey = "hgfm.seasonArchive.v1";

    const season = JSON.parse(localStorage.getItem(seasonKey));
    season.status = "completed";
    season.currentRound = season.competition.rounds;
    localStorage.setItem(seasonKey, JSON.stringify(season));

    const archive = [{
      seasonNumber: season.seasonNumber,
      position: 4,
      points: 12,
      played: season.competition.rounds,
      goalsFor: 12,
      goalsAgainst: 30,
      verdict: "failed",
      verdictLabel: "Langt under forventning",
      champion: "Brann",
      targetPosition: 1,
      warning: false,
      sacked: true,
      topScorer: null
    }];
    localStorage.setItem(archiveKey, JSON.stringify(archive));

    const gameStart = JSON.parse(localStorage.getItem(gameStartKey) || "{}");
    gameStart.leagueSeasonStatus = "completed";
    localStorage.setItem(gameStartKey, JSON.stringify(gameStart));

    const envelope = JSON.parse(localStorage.getItem(modeKey) || "null");
    if (envelope?.sessions?.league) {
      envelope.sessions.league = {
        ...envelope.sessions.league,
        leagueSeason: season,
        seasonArchive: archive,
        gameStartState: gameStart
      };
      localStorage.setItem(modeKey, JSON.stringify(envelope));
    }
  });

  await page.reload();
  await page.locator('.main-nav [role="tab"][data-tab-target="statistikk"]').click();

  const result = await page.evaluate(() => {
    const button = document.querySelector("#startNewLeagueSeasonButton");
    const buttonHidden = Boolean(button?.hidden);
    if (button) {
      button.hidden = false;
      button.click();
    }

    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const archive = JSON.parse(localStorage.getItem("hgfm.seasonArchive.v1") || "[]");
    const latest = archive[archive.length - 1] || null;
    return {
      buttonHidden,
      seasonNumber: Number(season?.seasonNumber) || null,
      seasonStatus: season?.status || null,
      archiveCount: archive.length,
      latestSacked: Boolean(latest?.sacked)
    };
  });

  expect(result).toEqual({
    buttonHidden: true,
    seasonNumber: 1,
    seasonStatus: "completed",
    archiveCount: 1,
    latestSacked: true
  });
});


test("sparket manager får ikke før-sesong tilbake etter reload", async ({ page }) => {
  await page.evaluate(() => {
    const seasonKey = "historygo-football-manager.league-season.v3";
    const modeKey = "hgfm.modeSessions.v1";
    const gameStartKey = "hgfm.gameStartState.v1";
    const archiveKey = "hgfm.seasonArchive.v1";

    const season = JSON.parse(localStorage.getItem(seasonKey));
    season.status = "completed";
    season.currentRound = season.competition.rounds;
    localStorage.setItem(seasonKey, JSON.stringify(season));

    const archive = [{
      seasonNumber: season.seasonNumber,
      position: 4,
      points: 0,
      played: season.competition.rounds,
      goalsFor: 0,
      goalsAgainst: 18,
      verdict: "failed",
      verdictLabel: "Langt under forventning",
      champion: "Brann",
      targetPosition: 1,
      warning: false,
      sacked: true,
      topScorer: null
    }];
    localStorage.setItem(archiveKey, JSON.stringify(archive));

    const gameStart = JSON.parse(localStorage.getItem(gameStartKey) || "{}");
    gameStart.leagueSeasonStatus = "completed";
    localStorage.setItem(gameStartKey, JSON.stringify(gameStart));

    const envelope = JSON.parse(localStorage.getItem(modeKey) || "null");
    if (envelope?.sessions?.league) {
      envelope.sessions.league = {
        ...envelope.sessions.league,
        leagueSeason: season,
        seasonArchive: archive
      };
      localStorage.setItem(modeKey, JSON.stringify(envelope));
    }
  });

  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();

  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();
  await expect(page.locator("#leagueOnboardingPanel")).toHaveAttribute("hidden", "");

  const startStep = page.locator("#leagueOnboardingSteps button").filter({ hasText: "Start sesongen" });
  await expect(startStep).toHaveCount(0);

  const nextTitle = String(await page.locator("#nextActionPrimaryTitle").textContent() || "").trim();
  expect(nextTitle).not.toBe("Start sesongen");

  const state = await page.evaluate(() => {
    const season = JSON.parse(localStorage.getItem("historygo-football-manager.league-season.v3") || "null");
    const gameStart = JSON.parse(localStorage.getItem("hgfm.gameStartState.v1") || "{}");
    return {
      seasonNumber: Number(season?.seasonNumber) || null,
      seasonStatus: season?.status || null,
      leagueSeasonStatus: gameStart?.leagueSeasonStatus || null
    };
  });

  expect(state).toEqual({
    seasonNumber: 1,
    seasonStatus: "completed",
    leagueSeasonStatus: "completed"
  });
});

test("diagnose: synlig footer etter fullført trygg sesong", async ({ page }) => {
  await page.evaluate(() => {
    const seasonKey = "historygo-football-manager.league-season.v3";
    const modeKey = "hgfm.modeSessions.v1";
    const gameStartKey = "hgfm.gameStartState.v1";

    const season = JSON.parse(localStorage.getItem(seasonKey));
    season.status = "completed";
    season.currentRound = season.competition.rounds;
    season.completedMatchIds = [];
    season.fixtures.forEach((round) => {
      round.status = "completed";
      round.matches.forEach((match) => {
        const managerHome = match.homeClubId === season.managerClubId;
        const managerAway = match.awayClubId === season.managerClubId;
        match.status = "completed";
        match.result = managerHome
          ? { homeGoals: 2, awayGoals: 0, simulated: false }
          : managerAway
            ? { homeGoals: 0, awayGoals: 2, simulated: false }
            : { homeGoals: 0, awayGoals: 0, simulated: true };
        season.completedMatchIds.push(match.id);
      });
    });
    localStorage.setItem(seasonKey, JSON.stringify(season));

    const gameStart = JSON.parse(localStorage.getItem(gameStartKey) || "{}");
    gameStart.leagueSeasonStatus = "completed";
    localStorage.setItem(gameStartKey, JSON.stringify(gameStart));

    const envelope = JSON.parse(localStorage.getItem(modeKey) || "null");
    if (envelope?.sessions?.league) {
      envelope.sessions.league = {
        ...envelope.sessions.league,
        leagueSeason: season,
        gameStartState: gameStart
      };
      localStorage.setItem(modeKey, JSON.stringify(envelope));
    }
  });

  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  const snapshot = await page.evaluate(() => ({
    footerOwner: document.querySelector("manager-next-action")?.dataset.calendarOwned || null,
    surface: document.querySelector("#nextActionStrip")?.dataset.surface || null,
    phase: document.querySelector("#nextActionPhase")?.textContent?.trim() || null,
    tag: document.querySelector("#nextActionPrimaryTag")?.textContent?.trim() || null,
    title: document.querySelector("#nextActionPrimaryTitle")?.textContent?.trim() || null,
    hint: document.querySelector("#nextActionPrimaryHint")?.textContent?.trim() || null,
    calendarMatch: document.querySelector("#managerCalendarMatch")?.textContent?.trim() || null,
    nextSeasonVisible: !document.querySelector("#startNewLeagueSeasonButton")?.hidden
  }));
  console.log("COMPLETED_SEASON_FOOTER_DIAGNOSTIC", JSON.stringify(snapshot));
  expect(snapshot.footerOwner).toBe("true");
  expect(snapshot.calendarMatch).toBe("Ingen terminfestet kamp");
});
