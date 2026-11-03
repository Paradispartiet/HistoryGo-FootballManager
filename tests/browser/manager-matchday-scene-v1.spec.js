import AxeBuilder from "@axe-core/playwright";
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
      id: `matchday-r${number}-${index}`,
      round: number,
      status: completed ? "completed" : "scheduled",
      result: completed ? match.result : null,
      homeClubId: match.home,
      awayClubId: match.away
    }))
  });
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 6, homeAndAway: true, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 6 },
    seed: "manager-matchday-scene-v1",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      round(1, [{ home: "rosenborg", away: "brann", result: { homeGoals: 2, awayGoals: 0 } }, { home: "viking", away: "molde", result: { homeGoals: 1, awayGoals: 1 } }], true),
      round(2, [{ home: "viking", away: "rosenborg" }, { home: "brann", away: "molde" }]),
      round(3, [{ home: "rosenborg", away: "molde" }, { home: "brann", away: "viking" }]),
      round(4, [{ home: "brann", away: "rosenborg" }, { home: "molde", away: "viking" }]),
      round(5, [{ home: "rosenborg", away: "viking" }, { home: "molde", away: "brann" }]),
      round(6, [{ home: "molde", away: "rosenborg" }, { home: "viking", away: "brann" }])
    ],
    completedMatchIds: ["matchday-r1-0", "matchday-r1-1"],
    createdFrom: "browser matchday scene v1"
  };
}

async function openMatchday(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();
  await expect(page.locator("#matchdayCommandPanel")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function prepareAndOpenPreMatch(page) {
  await openMatchday(page);
  const play = page.locator("#playMatchdayButton");
  await expect(play).toBeEnabled();
  const scene = page.locator("#matchdayCommand .matchday-scene");
  await expect(scene).toHaveAttribute("data-phase", "ready");
  const sceneAction = page.locator("#matchdayCommand .matchday-scene-action");
  await expect(sceneAction).toBeVisible();
  await sceneAction.click();
  await expect(page.locator(".matchday-kickoff-button")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => console.error(`[pageerror] ${error.stack || error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[browser-console] ${message.text()}`);
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((season) => {
    const clubWeekState = {
      week: 1,
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
      activeLeagueSaveId: "matchday_scene_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
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
          opponentAnalysisPlan: {
            version: "opponent-analysis.v1",
            fixtureId: "matchday-r2-0",
            opponentId: "viking",
            opponentName: "Viking",
            round: 2,
            week: 1,
            focusId: "press",
            focusLabel: "Presset deres",
            question: "Hvor starter presset, og hvilken pasning forsøker de å tvinge fram?",
            hypothesis: "Behold en fri spiller bak første pressledd.",
            evidence: ["Viking presser høyt"],
            countermeasureId: "free_player",
            countermeasureLabel: "Skap en fri spiller",
            target: "system",
            targetLabel: "Systemet",
            why: "Happy-path-fixturen har registrert forberedelsen.",
            risk: "Å lokke presset inn krever presisjon nær eget mål.",
            watch: "Se hvem som blir fri når første pressledd går mot ballfører."
          }
        },
        scenario: null,
        training: null,
        national: null
      }
    }));
  }, seededSeason());
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("kampdagen viser én scene med tre faser og fire operative statuser", async ({ page }) => {
  await openMatchday(page);
  await expect(page.locator("#matchdayCommand h2")).toHaveText("Kampdagen");
  await expect(page.locator(".matchday-stage")).toHaveCount(3);
  await expect(page.locator('.matchday-stage[data-state="active"]')).toHaveCount(1);
  await expect(page.locator(".matchday-scene-team")).toHaveCount(2);
  await expect(page.locator(".matchday-scene-context-card")).toHaveCount(3);
  await expect(page.locator(".matchday-scene-status-card")).toHaveCount(4);
  await expect(page.locator(".matchday-scene-action")).toBeVisible();
  expect(await page.locator("#matchdayDepth").getAttribute("open")).toBeNull();
});

test("statuskort åpner eksisterende kampdetaljer og arbeidsflater", async ({ page }) => {
  await openMatchday(page);
  await page.locator('.matchday-scene-status-card[data-matchday-target="details"]').first().click();
  await expect(page.locator("#matchdayDepth")).toHaveAttribute("open", "");

  await page.getByRole("button", { name: /^Formasjon og kampplan/ }).click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

  await openMatchday(page);
  await page.getByRole("button", { name: /^Treningsuka:/ }).click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
});

test("kampforberedelsen går videre til eksisterende avspark", async ({ page }) => {
  await prepareAndOpenPreMatch(page);
  await expect(page.locator("#matchdayCommand .matchday-scene")).toHaveAttribute("data-phase", "pre_match");
  await expect(page.locator("#matchdayCommand .matchday-scene-action")).toHaveText("Start kampen");
  await page.locator("#matchdayCommand .matchday-scene-action").click();
  await expect(page.locator("#matchdayCommand .matchday-scene")).toHaveAttribute("data-phase", "live");
});

test("rapportscenen blander ikke forrige motstander med neste fixtures metadata", async ({ page }) => {
  await page.evaluate(() => {
    const lastMatch = {
      id: "completed-r1-brann",
      version: 2,
      outcome: "draw",
      score: { for: 0, against: 0 },
      expectedGoals: { for: 1.2, against: 0.8 },
      opponent: { id: "brann", name: "Brann", style: "høyt press" },
      formationSnapshot: { name: "Modern 4-2-3-1", baseShape: "4-2-3-1" },
      tacticSnapshot: { name: "Balansert" },
      decisions: [],
      playerStats: { goals: [] },
      clubConsequences: { effects: {} },
      playedInClubWeek: 1,
      leagueContext: {
        fixtureId: "matchday-r1-0",
        round: 1,
        homeAway: "home",
        opponentId: "brann",
        opponentName: "Brann",
        ground: "Lerkendal",
        competitionLabel: "Eliteserien"
      }
    };
    const matchday = { lastMatch, session: null, lastSeenMatchId: null };
    localStorage.setItem("hgfm.matchday.v1", JSON.stringify(matchday));

    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.clubWeekState = { ...(merits.clubWeekState || {}), week: 1, phase: "review" };
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));

    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    if (envelope.sessions?.league) {
      envelope.sessions.league.matchday = matchday;
      envelope.sessions.league.clubWeekState = merits.clubWeekState;
    }
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify(envelope));
  });
  await page.reload();
  await expect(page.locator("#onboardingScreen")).toBeHidden();

  await openMatchday(page);
  const scene = page.locator("#matchdayCommand .matchday-scene");
  await expect(scene).toHaveAttribute("data-phase", "report");
  await expect(scene).toContainText("Brann");
  await expect(scene).toContainText("Runde 1");
  await expect(scene).toContainText("Hjemme");
  await expect(scene).not.toContainText("Runde 2");
  await expect(scene).not.toContainText("Borte");
});

test("kampdagen har ingen mobil overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMatchday(page);
  await expectNoHorizontalOverflow(page);
  await page.locator('.matchday-scene-status-card[data-matchday-target="details"]').first().click();
  await expectNoHorizontalOverflow(page);
});

test("kampdagen har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await openMatchday(page);
  const results = await new AxeBuilder({ page })
    .include('[data-tab-section="kamp"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});


test("spill og motspill forklarer sikringsbytte uten å endre sjanser eller eldre hendelser", async ({ page }) => {
  await page.evaluate(() => {
    const moment = (kind, label, description) => ({
      label: "Motstander spiller av press",
      description: "Et modellert pressforløp.",
      cause: "Sikringen blir utfordret.",
      steps: [{ action: "Følge tredjemann", outcome: "blocked" }],
      counterplay: kind === null ? null : {
        defensiveReply: {
          coverTimingExplanation: { kind, label, description }
        }
      }
    });
    const lastMatch = {
      id: "completed-r1-brann", version: 2, outcome: "draw",
      score: { for: 0, against: 0 },
      expectedGoals: { for: 1.2, against: 0.8 },
      opponent: { id: "brann", name: "Brann", style: "høyt press" },
      formationSnapshot: { name: "4-2-3-1", baseShape: "4-2-3-1" },
      tacticSnapshot: { name: "Balansert" },
      decisions: [], playerStats: { goals: [] },
      clubConsequences: { effects: {} },
      playedInClubWeek: 1,
      minuteLog: [
        {
          minute: 12, type: "chance", side: "against", detail: "Pressutspill",
          tacticalMoment: moment("late_handoff", "For sent sikringsbytte",
            "Avløseren nådde sikringskorridoren etter at første forsvarer startet sin neste oppgave.")
        },
        {
          minute: 22, type: "chance", side: "against", detail: "Uavklart angrep",
          tacticalMoment: moment("unknown", "Uavklart sikringsforløp",
            "Sikringsdataene er ufullstendige. Det er ikke påvist en defensiv tidsfeil.")
        },
        {
          minute: 33, type: "chance", side: "for", detail: "Eldre simulering",
          tacticalMoment: moment(null)
        }
      ]
    };
    const matchday = { lastMatch, session: null, lastSeenMatchId: null };
    localStorage.setItem("hgfm.matchday.v1", JSON.stringify(matchday));
    const merits = JSON.parse(localStorage.getItem("hgfm.teamMerits.v1") || "{}");
    merits.clubWeekState = { ...(merits.clubWeekState || {}), week: 1, phase: "review" };
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(merits));
    const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
    if (envelope.sessions?.league) {
      envelope.sessions.league.matchday = matchday;
      envelope.sessions.league.clubWeekState = merits.clubWeekState;
    }
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify(envelope));
  });
  await page.reload();
  await openMatchday(page);
  const report = page.locator("#matchdayResult .matchday-report-card");
  await expect(report).toBeVisible();
  await expect(report.locator(".matchday-defensive-cover")).toHaveCount(2);
  const drawer = report.locator(".matchday-detail-drawer");
  await expect(drawer).not.toHaveAttribute("open", "");
  await drawer.locator("summary").first().click();
  const traces = drawer.locator(".matchday-tactical-moment");
  await expect(traces).toHaveCount(3);
  await traces.nth(0).locator("summary").click();
  await expect(traces.nth(0).locator('.matchday-defensive-cover[data-kind="late_handoff"]'))
    .toContainText("Avløseren nådde sikringskorridoren");
  await traces.nth(1).locator("summary").click();
  await expect(traces.nth(1).locator('.matchday-defensive-cover[data-kind="unknown"]'))
    .toContainText("Det er ikke påvist en defensiv tidsfeil");
  await traces.nth(2).locator("summary").click();
  await expect(traces.nth(2).locator(".matchday-defensive-cover")).toHaveCount(0);
  await expect(drawer.locator(".matchday-minute.is-chance")).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await expect(traces.nth(0).locator(".matchday-defensive-cover")).toBeVisible();
});


test("v7.4: sett pressfase gir spillbart motgrep, lagring og forklarbart replay", async ({ page }) => {
  // Bruk v7.4-motorens egen kildebaserte testscenario. Ordinære klubbprofiler
  // får IKKE oppdiktede utveier bare for å gjøre knappen tilgjengelig.
  const {
    resolveOwnPressAgainstOpponent, getManagerPressCounterOptions,
    annotateOwnPressChances
  } = await import("../../src/football-matchday-own-press-v6.js");
  const { applyMatchPressCounter, advanceMatchClock } =
    await import("../../src/football-matchday-engine.js");
  const positions = ["GK", "CB", "DM", "CM", "AM", "ST", "LW", "RW", "LB", "RB", "CB"];
  const roles = {
    CB: "ball_playing_centre_back", DM: "balancing_six",
    CM: "pressing_midfielder", LB: "support_fullback", RB: "support_fullback"
  };
  const lineup = positions.map((position, index) => ({
    playerId: "v74-browser-" + index,
    position, roleId: roles[position] || "role_" + position,
    matchFitKnown: true,
    matchScore: position === "DM" ? 84 : position === "CM" ? 64 :
      position === "CB" ? 83 : 75
  }));
  const tacticalProfile = {
    pressScore: 78, balanceScore: 74, restDefenseScore: 71,
    buildUpScore: 69, depthScore: 71, widthScore: 69,
    relationshipScore: 72, teamScore: 75
  };
  const opponent = {
    id: "v74-verified-outlets", name: "Motstander med verifiserte utveier",
    strength: 72, pressResistance: 85,
    defensiveStructure: 69, transitionThreat: 78,
    styleTraits: { shortBuildUp: 82, possessionControl: 80, transitionThreat: 78 },
    tacticalBehaviour: {
      pressEscape: "supported",
      pressEscapeRoutePolicy: "weakest_verified_cover",
      pressEscapeCandidateRoutes: ["third_man", "direct"]
    }
  };
  const known = {
    id: "v74-browser-first", version: 2,
    causalPressingVersion: 1, causalOpponentRouteAdaptationVersion: 1,
    causalOpponentSequenceVersion: 1, causalManagerPressCounterVersion: 1,
    selectedTacticId: "midfield_press_trap",
    activePlanSnapshot: { id: "midfield_press_trap" },
    tacticSnapshot: { id: "midfield_press_trap" },
    lineupSnapshot: lineup, opponent,
    teamFitSnapshot: { tacticalProfile, historicalScore: 70 },
    strengthSnapshot: { finalStrength: 74, modifiers: { missing: 0 } },
    planMatchup: { edge: 1.5 }, timeline: [], minuteLog: [],
    events: [], decisions: [], substitutions: [], planChanges: [],
    score: { for: 0, against: 0 }
  };
  const firstPhase = resolveOwnPressAgainstOpponent(known, {
    pressureRoll: () => 0.99, protectionRoll: () => 0.99
  });
  expect(firstPhase.status).toBe("escaped");
  expect(firstPhase.evidence.opponentRouteAdaptation.selectedRoute).toBe("third_man");

  // Gå via appens virkelige kampdag, ikke en egen test-UI eller en engine-only test.
  await prepareAndOpenPreMatch(page);
  await page.locator("#matchdayCommand .matchday-scene-action").click();
  await expect(page.locator("#matchdayCommand .matchday-scene")).toHaveAttribute("data-phase", "live");
  const liveSession = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "{}").session
  );
  expect(liveSession?.events?.length).toBeGreaterThan(1);

  const openingChance = annotateOwnPressChances([{
    minute: 12, side: "against", quality: 0.06, scored: false,
    detail: "Motstanderen spiller seg ut av presset"
  }], firstPhase)[0];
  const seed = {
    ...liveSession, ...known,
    events: liveSession.events, phase: "event_1", liveMinute: 23,
    minuteLog: [{ ...openingChance, type: "chance" }],
    timeline: [{
      segment: 0, range: { from: 1, to: 23 },
      tacticalPhase: firstPhase
    }]
  };
  expect(getManagerPressCounterOptions(seed)?.routes).toContain("third_man");

  // Finn en deterministisk kamp der neste ekte motorperiode viser omfordelingen
  // også i en eksisterende sjanses replay (ikke generer ekstra sjanse/xG).
  let fixture = null;
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const candidate = { ...seed, id: "v74-browser-" + attempt };
    const preview = advanceMatchClock(applyMatchPressCounter(candidate, "third_man"));
    const next = preview.timeline.at(-1)?.tacticalPhase;
    if (next?.status === "escaped" &&
        next.evidence?.opponentRouteAdaptation?.managerCounter?.status === "redistributed" &&
        preview.minuteLog.some((entry) =>
          entry.tacticalMoment?.counterplay?.opponentRouteAdaptation?.managerCounter?.status === "redistributed")) {
      fixture = candidate;
      break;
    }
  }
  expect(fixture, "Deterministisk v7.4-scenario med synlig neste periode").not.toBeNull();

  async function persistSession(session) {
    await page.evaluate((savedSession) => {
      const matchday = JSON.parse(localStorage.getItem("hgfm.matchday.v1") || "{}");
      matchday.session = savedSession;
      localStorage.setItem("hgfm.matchday.v1", JSON.stringify(matchday));
      const envelope = JSON.parse(localStorage.getItem("hgfm.modeSessions.v1") || "{}");
      if (envelope.sessions?.league) {
        envelope.sessions.league.matchday = matchday;
        localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify(envelope));
      }
    }, session);
  }

  // Usett kampfase kan ikke avdekke knappen.
  await persistSession({ ...fixture, liveMinute: 22 });
  await page.reload();
  await openMatchday(page);
  const counter = page.locator("#matchdayResult details.match-plan-switcher")
    .filter({ has: page.locator("summary", { hasText: "Motgrep mot utspill" }) });
  await expect(counter).toHaveCount(0);

  await persistSession(fixture);
  await page.reload();
  await openMatchday(page);
  await expect(counter).toHaveCount(1);
  await counter.locator("summary").click();
  await expect(counter.getByRole("button", { name: "Sikre Tredjemann sentralt" })).toBeVisible();
  await counter.getByRole("button", { name: "Sikre Tredjemann sentralt" }).click();

  const afterChoice = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hgfm.matchday.v1")).session
  );
  expect(afterChoice.managerPressCounter).toMatchObject({
    route: "third_man", observedRoute: "third_man", sourceSegment: 0
  });
  expect(afterChoice.minuteLog.filter((entry) => entry.type === "counter")).toHaveLength(1);
  expect(afterChoice.timeline[0]).toEqual(fixture.timeline[0]);
  await expect(counter).toContainText("Gjeldende prioritet");
  await expect(counter.getByRole("button", { name: "Sikre Tredjemann sentralt" })).toHaveCount(0);

  // Kontroller persistert grep, ikke bare tilstand i minnet.
  await page.reload();
  await openMatchday(page);
  await expect(counter).toContainText("Motgrep mot utspill · Tredjemann sentralt");
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hgfm.matchday.v1")).session
  );
  expect(restored.managerPressCounter).toEqual(afterChoice.managerPressCounter);

  await page.locator("#matchdayResult .matchday-event-card .matchday-decision-button").first().click();
  const progressed = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hgfm.matchday.v1")).session
  );
  const next = progressed.timeline[1].tacticalPhase;
  expect(next.evidence.opponentRouteAdaptation.managerCounter).toMatchObject({
    status: "redistributed", prioritisedRoute: "third_man", exposedRoute: "direct"
  });
  expect(next.evidence.opponentRouteAdaptation.selectedRoute).toBe("direct");
  expect(next.cause).toMatch(/omfordelt kjent sikring/);
  expect(progressed.timeline[0]).toEqual(fixture.timeline[0]);

  const skip = page.locator("#matchdayResult .matchday-live-button.is-secondary");
  if (await skip.isVisible()) await skip.click();
  const replay = page.locator("#matchdayResult .matchday-tactical-moment")
    .filter({ hasText: "omfordelt kjent sikring" }).first();
  await expect(replay).toHaveCount(1);
  await replay.locator("summary").click();
  await expect(replay.locator("p").first()).toContainText("omfordelt kjent sikring");
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
