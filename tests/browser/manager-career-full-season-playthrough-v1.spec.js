import { expect, test } from "@playwright/test";

const CANONICAL_FULL_SEASON_FORMATION_ID = "modern_433";
const CANONICAL_SUBSTITUTION_PLAN = new Map([
  [5, { positionBand: "defence", candidateOffset: 0 }],
  [15, { positionBand: "midfield", candidateOffset: 1 }],
  [25, { positionBand: "attack", candidateOffset: 2 }]
]);
const CANONICAL_SUBSTITUTION_ROUNDS = new Set(CANONICAL_SUBSTITUTION_PLAN.keys());

async function installCanonicalLeagueSeed(page) {
  await page.addInitScript(() => {
    const nativeNow = Date.now.bind(Date);

    Date.now = () => {
      const stack = String(new Error().stack || "");
      if (stack.includes("createLeagueSaveExtras")) {
        return 1700000000000;
      }
      return nativeNow();
    };
  });
}
function substitutionPositionBand(position) {
  const token = String(position || "").trim().toUpperCase();
  if (["LB", "CB", "RB", "LWB", "RWB", "SW"].includes(token)) return "defence";
  if (["DM", "CM", "AM", "LM", "RM"].includes(token)) return "midfield";
  if (["LW", "RW", "ST", "CF"].includes(token)) return "attack";
  return token ? `other:${token}` : "unknown";
}

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
    const weeklyTrainingProgram = session.weeklyTrainingProgram || parse("hgfm.weeklyTrainingProgram.v1", null);
    const weeklyTrainingFocus = session.weeklyTrainingFocus || parse("hgfm.weeklyTrainingFocus.v1", null);
    const lastMatch = matchday?.lastMatch || null;
    const archive = parse("hgfm.seasonArchive.v1", []);
    const playerStats = parse("hgfm.playerSeasonStats.v1", { rows: [], matchIds: [] });
    const completedManagerFixtures = Array.isArray(season?.fixtures)
      ? season.fixtures
          .flatMap((round) => Array.isArray(round?.matches) ? round.matches : [])
          .filter((fixture) =>
            fixture?.status === "completed" &&
            fixture?.result &&
            (fixture.homeClubId === season?.managerClubId || fixture.awayClubId === season?.managerClubId)
          )
      : [];
    const leagueSummary = completedManagerFixtures.reduce((summary, fixture) => {
      const managerHome = fixture.homeClubId === season.managerClubId;
      const goalsFor = Number(managerHome ? fixture.result.homeGoals : fixture.result.awayGoals) || 0;
      const goalsAgainst = Number(managerHome ? fixture.result.awayGoals : fixture.result.homeGoals) || 0;
      summary.played += 1;
      summary.goalsFor += goalsFor;
      summary.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) {
        summary.won += 1;
        summary.points += 3;
      } else if (goalsFor < goalsAgainst) {
        summary.lost += 1;
      } else {
        summary.drawn += 1;
        summary.points += 1;
      }
      return summary;
    }, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
    const archiveLatest = Array.isArray(archive) && archive.length ? archive[archive.length - 1] : null;
    const playerCondition = Array.isArray(session.playerCondition)
      ? session.playerCondition
      : parse("hgfm.playerCondition.v1", []);
    const playerConditionMatchIds = Array.isArray(session.playerConditionMatchIds)
      ? session.playerConditionMatchIds
      : [];
    const conditionLoads = playerCondition.map((entry) => Number(entry?.load) || 0);
    const conditionForms = playerCondition.map((entry) => Math.abs(Number(entry?.form) || 0));
    const conditionConsecutive = playerCondition.map((entry) => Number(entry?.consecutiveFullMatches) || 0);
    const playerPartnerships =
      merits?.playerPartnerships && typeof merits.playerPartnerships === "object" && !Array.isArray(merits.playerPartnerships)
        ? merits.playerPartnerships
        : {};
    const partnershipValues = Object.values(playerPartnerships)
      .map((value) => Number(value) || 0)
      .filter((value) => value > 0);

    return {
      unlockedPlaceCount: Array.isArray(merits.unlockedPlaceIds) ? merits.unlockedPlaceIds.length : 0,
      unlockedExpertiseCount: Array.isArray(merits.unlockedExpertiseIds) ? merits.unlockedExpertiseIds.length : 0,
      earnedBadgeCount: Array.isArray(merits.earnedBadgeIds) ? merits.earnedBadgeIds.length : 0,
      activeClassificationCount: Array.isArray(merits.activeClassifications) ? merits.activeClassifications.length : 0,
      partnershipPairCount: partnershipValues.length,
      partnershipMaxSharedStarts: Math.max(0, ...partnershipValues),
      partnershipTotalSharedStarts: partnershipValues.reduce((sum, value) => sum + value, 0),
      week: Number(clubWeek?.week) || null,
      phase: clubWeek?.phase || null,
      formationId: session.selectedFormationId || null,
      seasonStatus: season?.status || null,
      seasonSeed: season?.seed || null,
      seasonNumber: Number(season?.seasonNumber) || null,
      seasonRounds: Number(season?.competition?.rounds) || null,
      currentRound: Number(season?.currentRound) || null,
      archiveCount: Array.isArray(archive) ? archive.length : 0,
      playerStatsCount: Array.isArray(playerStats?.rows) ? playerStats.rows.length : 0,
      conditionCount: playerCondition.length,
      conditionMatchCount: playerConditionMatchIds.length,
      conditionTotalLoad: conditionLoads.reduce((sum, value) => sum + value, 0),
      conditionMaxLoad: Math.max(0, ...conditionLoads),
      conditionMaxAbsForm: Math.max(0, ...conditionForms),
      conditionMaxConsecutiveFullMatches: Math.max(0, ...conditionConsecutive),
      conditionInjuredCount: playerCondition.filter((entry) => Number(entry?.injury?.weeksOut) > 0).length,
      conditionTotalMatchesPlayed: playerCondition.reduce((sum, entry) => sum + (Number(entry?.matchesPlayed) || 0), 0),
      conditionTotalMinutesPlayed: playerCondition.reduce((sum, entry) => sum + (Number(entry?.minutesPlayed) || 0), 0),
      conditionRows: playerCondition.map((entry) => ({
        playerId: entry?.playerId || null,
        load: Number(entry?.load) || 0,
        consecutiveFullMatches: Number(entry?.consecutiveFullMatches) || 0,
        injured: Number(entry?.injury?.weeksOut) > 0
      })),
      activeMatchSession: Boolean(matchday?.session),
      lastMatchId: lastMatch?.id || null,
      lastMatchRound: Number(lastMatch?.leagueContext?.round) || null,
      lastOpponentId: lastMatch?.leagueContext?.opponentId || lastMatch?.opponent?.id || null,
      lastOpponentName: lastMatch?.leagueContext?.opponentName || lastMatch?.opponent?.name || null,
      lastOutcome: lastMatch?.outcome || null,
      lastGoalsFor: Number(lastMatch?.score?.for) || 0,
      lastGoalsAgainst: Number(lastMatch?.score?.against) || 0,
      lastSubstitutions: Array.isArray(lastMatch?.substitutions)
        ? lastMatch.substitutions.map((entry) => ({
            minute: Number(entry?.minute) || 0,
            outPlayerId: entry?.outPlayerId || null,
            outName: entry?.outName || null,
            inPlayerId: entry?.inPlayerId || null,
            inName: entry?.inName || null,
            position: entry?.position || null,
            roleName: entry?.roleName || null
          }))
        : [],
      leaguePlayed: leagueSummary.played,
      leagueWon: leagueSummary.won,
      leagueDrawn: leagueSummary.drawn,
      leagueLost: leagueSummary.lost,
      leagueGoalsFor: leagueSummary.goalsFor,
      leagueGoalsAgainst: leagueSummary.goalsAgainst,
      leaguePoints: leagueSummary.points,
      archiveLatest: archiveLatest
        ? {
            played: Number(archiveLatest.played) || 0,
            points: Number(archiveLatest.points) || 0,
            goalsFor: Number(archiveLatest.goalsFor) || 0,
            goalsAgainst: Number(archiveLatest.goalsAgainst) || 0
          }
        : null,
      decisionCount: Array.isArray(lastMatch?.decisions) ? lastMatch.decisions.length : 0,
      analysisPreparedDecisionCount: Array.isArray(lastMatch?.decisions)
        ? lastMatch.decisions.filter((entry) => entry?.analysisObservation).length
        : 0,
      decisionLabels: Array.isArray(lastMatch?.decisions)
        ? lastMatch.decisions.map((entry) => entry?.optionLabel || entry?.label || entry?.optionId).filter(Boolean)
        : [],
      trainingFocusId: lastMatch?.trainingFocus?.focusId || null,
      trainingFocusName: lastMatch?.trainingFocus?.name || null,
      weeklyTrainingProgramId: weeklyTrainingProgram?.programId || null,
      weeklyTrainingProgramWeek: Number(weeklyTrainingProgram?.week) || null,
      weeklyTrainingFocusId: weeklyTrainingFocus?.focusId || null,
      weeklyTrainingFocusWeek: Number(weeklyTrainingFocus?.week) || null,
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

  // Canonical career-playthrough skal måle en representativ moderne ligasesong,
  // ikke tilfeldigvis den første dataraden (Pre-modern Rush 1-1-8). Historiske
  // ekstremformer har egne motor-/layouttester; denne testen må være et godt
  // diagnostisk speil for rotasjon, belastning og sesongspill.
  const formationOption = page.locator(
    `#formationSelect option[value="${CANONICAL_FULL_SEASON_FORMATION_ID}"]`
  );
  await expect(formationOption).toHaveCount(1);
  await expect(formationOption).toBeEnabled();
  await page.locator("#formationSelect").selectOption(CANONICAL_FULL_SEASON_FORMATION_ID);

  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  await expect(page.locator("#formationSelect")).toHaveValue(CANONICAL_FULL_SEASON_FORMATION_ID);

  await expect.poll(async () => {
    const text = await page.locator("#completeCount").textContent();
    return text?.trim() || "";
  }).toBe("11/11");

  await expect.poll(async () => (await readProgress(page)).formationId)
    .toBe(CANONICAL_FULL_SEASON_FORMATION_ID);
}

async function openTraining(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
}

async function readRotationNeed(page) {
  return page.evaluate(() => {
    const parse = (key, fallback = null) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    };
    const envelope = parse("hgfm.modeSessions.v1", {});
    const session = envelope?.sessions?.[envelope?.activeMode] || {};
    const conditions = Array.isArray(session.playerCondition)
      ? session.playerCondition
      : parse("hgfm.playerCondition.v1", []);
    const lineup = session.lineup || {};
    const conditionByPlayerId = new Map(
      conditions
        .filter((entry) => entry?.playerId)
        .map((entry) => [entry.playerId, entry])
    );
    const tiredOrInjuredNames = new Set(
      conditions
        .filter((entry) => Number(entry?.load) > 50 || Number(entry?.injury?.weeksOut) > 0)
        .map((entry) => String(entry?.name || "").trim())
        .filter(Boolean)
    );
    const candidates = Object.entries(lineup)
      .map(([slotId, assignment]) => {
        const playerId = assignment?.playerId || null;
        const condition = playerId ? conditionByPlayerId.get(playerId) : null;
        return {
          slotId,
          playerId,
          name: String(condition?.name || "").trim(),
          load: Number(condition?.load) || 0,
          injured: Number(condition?.injury?.weeksOut) > 0
        };
      })
      .filter((entry) => entry.playerId && (entry.injured || entry.load > 50))
      .sort((a, b) => Number(b.injured) - Number(a.injured) || b.load - a.load);

    return {
      targets: candidates,
      avoidNames: [...tiredOrInjuredNames],
      players: conditions
        .filter((entry) => entry?.playerId)
        .map((entry) => ({
          playerId: entry.playerId,
          name: String(entry?.name || "").trim(),
          load: Number(entry?.load) || 0,
          injured: Number(entry?.injury?.weeksOut) > 0
        }))
    };
  });
}

async function countVisibleLineupChoices(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

  const chip = page.locator("#lineupSlots .player-chip").first();
  await expect(chip).toBeVisible();
  await chip.click();

  const inspector = page.locator("#managerLineupSlotInspector");
  await expect(inspector).toBeVisible();
  await inspector.locator('[data-slot-action="player"]').click();

  const drawer = page.locator("#managerTeamChoiceDrawer");
  await expect(drawer).toBeVisible();
  await expect.poll(async () => drawer.locator(".lineup-player-choice-row").count()).toBeGreaterThan(0);
  const count = await drawer.locator(".lineup-player-choice-row").count();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  return count;
}

async function readExactRotationPlanningState(page, need, probeSlotId) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

  const playerNameById = Object.fromEntries(
    (need.players || [])
      .filter((entry) => entry?.playerId && entry?.name)
      .map((entry) => [entry.playerId, entry.name])
  );
  const chips = page.locator("#lineupSlots .player-chip[data-slot-id]");
  const lineup = await chips.evaluateAll((elements, namesById) =>
    elements
      .map((element) => {
        const slotId = String(element.getAttribute("data-slot-id") || "").trim();
        const playerId = String(element.getAttribute("data-player-id") || "").trim();
        const position = String(element.getAttribute("data-position") || "").trim();
        return {
          slotId,
          playerId,
          name: namesById[playerId] || "",
          position
        };
      })
      .filter((entry) => entry.slotId && entry.playerId && entry.position),
    playerNameById
  );

  const lineupSlotByName = new Map(
    lineup
      .filter((entry) => entry.name)
      .map((entry) => [entry.name, entry.slotId])
  );
  const probeChip = page.locator(`#lineupSlots .player-chip[data-slot-id="${probeSlotId}"]`);
  await expect(probeChip).toBeVisible();
  await probeChip.click();

  const inspector = page.locator("#managerLineupSlotInspector");
  await expect(inspector).toBeVisible();
  await inspector.locator('[data-slot-action="player"]').click();

  const drawer = page.locator("#managerTeamChoiceDrawer");
  await expect(drawer).toBeVisible();
  await expect.poll(async () =>
    drawer.locator(".lineup-player-choice-row").count()
  ).toBeGreaterThan(0);

  const rawProfiles = await drawer.locator(".lineup-player-choice-row").evaluateAll((rows) =>
    rows
      .map((row) => {
        const choice = row.querySelector(".lineup-player-select-action");
        const profile = row.querySelector(".lineup-player-profile-link");
        const name = String(profile?.querySelector("strong")?.textContent || "").trim();
        const positions = String(profile?.querySelector("span")?.textContent || "");
        return {
          name,
          positionTokens: positions
            .split("/")
            .map((value) => value.trim())
            .filter(Boolean),
          disabled: Boolean(choice?.matches?.(":disabled"))
        };
      })
      .filter((entry) => entry.name)
  );
  const profiles = rawProfiles.map((profile) => ({
    name: profile.name,
    positionTokens: profile.positionTokens,
    selectable: !profile.disabled || lineupSlotByName.has(profile.name)
  }));

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  return { lineup, profiles };
}

function planExactRotationPath(planning, need, targetSlotId) {
  const lineupBySlot = new Map(
    planning.lineup.map((entry) => [entry.slotId, entry])
  );
  const slotByPlayerName = new Map(
    planning.lineup
      .filter((entry) => entry.name)
      .map((entry) => [entry.name, entry.slotId])
  );
  const avoidNames = new Set(need.avoidNames || []);

  const search = (slotId, reservedPlayers, visitedSlots) => {
    const slot = lineupBySlot.get(slotId);
    if (!slot) return null;

    const candidates = planning.profiles
      .filter((profile) =>
        profile.selectable &&
        profile.name !== slot.name &&
        !avoidNames.has(profile.name) &&
        !reservedPlayers.has(profile.name) &&
        profile.positionTokens.includes(slot.position)
      )
      .sort((a, b) => {
        const aOccupied = slotByPlayerName.has(a.name) ? 1 : 0;
        const bOccupied = slotByPlayerName.has(b.name) ? 1 : 0;
        return aOccupied - bOccupied ||
          a.positionTokens.length - b.positionTokens.length ||
          a.name.localeCompare(b.name);
      });

    for (const candidate of candidates) {
      const occupiedSlotId = slotByPlayerName.get(candidate.name) || null;
      if (!occupiedSlotId) {
        return [{
          slotId,
          position: slot.position,
          playerName: candidate.name
        }];
      }
      if (occupiedSlotId === slotId || visitedSlots.has(occupiedSlotId)) continue;

      const nextReserved = new Set(reservedPlayers);
      nextReserved.add(candidate.name);
      const nextVisited = new Set(visitedSlots);
      nextVisited.add(occupiedSlotId);
      const prefix = search(occupiedSlotId, nextReserved, nextVisited);
      if (!prefix) continue;

      return [
        ...prefix,
        {
          slotId,
          position: slot.position,
          playerName: candidate.name
        }
      ];
    }

    return null;
  };

  return search(targetSlotId, new Set(), new Set([targetSlotId]));
}

async function applyExactRotationPath(page, path) {
  const applied = [];

  for (const step of path) {
    await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
    await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

    const chip = page.locator(`#lineupSlots .player-chip[data-slot-id="${step.slotId}"]`);
    await expect(chip).toBeVisible();
    const beforePlayerId = await chip.getAttribute("data-player-id");
    const position = String(await chip.getAttribute("data-position") || "").trim();
    expect(position).toBe(step.position);

    await chip.click();
    const inspector = page.locator("#managerLineupSlotInspector");
    await expect(inspector).toBeVisible();
    await inspector.locator('[data-slot-action="player"]').click();

    const drawer = page.locator("#managerTeamChoiceDrawer");
    await expect(drawer).toBeVisible();
    await expect.poll(async () =>
      drawer.locator(".lineup-player-choice-row").count()
    ).toBeGreaterThan(0);

    const rows = drawer.locator(".lineup-player-choice-row");
    const rowAudit = await rows.evaluateAll((elements) =>
      elements.map((row, index) => {
        const choice = row.querySelector(".lineup-player-select-action");
        const profile = row.querySelector(".lineup-player-profile-link");
        const name = String(profile?.querySelector("strong")?.textContent || "").trim();
        const positions = String(profile?.querySelector("span")?.textContent || "");
        return {
          index,
          name,
          positionTokens: positions
            .split("/")
            .map((value) => value.trim())
            .filter(Boolean),
          disabled: Boolean(choice?.matches?.(":disabled"))
        };
      })
    );
    const replacementRow = rowAudit.find((entry) =>
      entry.name === step.playerName &&
      entry.positionTokens.includes(step.position)
    );
    expect(replacementRow).toBeTruthy();
    expect(replacementRow.disabled).toBe(false);

    const replacementChoice = rows.nth(replacementRow.index).locator(".lineup-player-select-action");
    await replacementChoice.click();
    await drawer.locator(".manager-team-choice-done").click();
    await expect(drawer).toBeHidden();
    await expect.poll(async () =>
      page.locator(`#lineupSlots .player-chip[data-slot-id="${step.slotId}"]`).getAttribute("data-player-id")
    ).not.toBe(beforePlayerId);

    const afterChip = page.locator(`#lineupSlots .player-chip[data-slot-id="${step.slotId}"]`);
    applied.push({
      ...step,
      beforePlayerId,
      afterPlayerId: await afterChip.getAttribute("data-player-id")
    });
  }

  return applied;
}

async function repairEmergencyLineupAssignments(page, emergencySlots) {
  if (emergencySlots.size === 0) return;
  const need = await readRotationNeed(page);

  for (const slotId of [...emergencySlots]) {
    await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
    await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

    const chip = page.locator(`#lineupSlots .player-chip[data-slot-id="${slotId}"]`);
    await expect(chip).toBeVisible();
    const beforePlayerId = await chip.getAttribute("data-player-id");
    const position = String(await chip.getAttribute("data-position") || "").trim();
    expect(beforePlayerId).toBeTruthy();
    expect(position).toBeTruthy();

    await chip.click();
    const inspector = page.locator("#managerLineupSlotInspector");
    await expect(inspector).toBeVisible();
    await inspector.locator('[data-slot-action="player"]').click();

    const drawer = page.locator("#managerTeamChoiceDrawer");
    await expect(drawer).toBeVisible();
    await expect.poll(async () =>
      drawer.locator(".lineup-player-choice-row").count()
    ).toBeGreaterThan(0);

    const rows = drawer.locator(".lineup-player-choice-row");
    const rowCount = await rows.count();
    let selectedSeen = false;
    let currentSupportsPosition = false;
    let exactReplacement = null;

    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const choice = row.locator(".lineup-player-select-action");
      const profile = row.locator(".lineup-player-profile-link");
      const name = String(await profile.locator("strong").textContent() || "").trim();
      const positions = String(await profile.locator("span").textContent() || "");
      const positionTokens = positions
        .split("/")
        .map((value) => value.trim())
        .filter(Boolean);
      const isSelected = await choice.evaluate((element) => element.classList.contains("is-selected"));

      if (isSelected) {
        selectedSeen = true;
        currentSupportsPosition = positionTokens.includes(position);
        continue;
      }

      if (exactReplacement) continue;
      if (await choice.isDisabled()) continue;
      if (!name || need.avoidNames.includes(name)) continue;
      if (!positionTokens.includes(position)) continue;
      exactReplacement = { choice, name };
    }

    expect(selectedSeen).toBe(true);
    if (currentSupportsPosition) {
      emergencySlots.delete(slotId);
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      continue;
    }
    if (!exactReplacement) {
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      continue;
    }

    await exactReplacement.choice.click();
    await drawer.locator(".manager-team-choice-done").click();
    await expect(drawer).toBeHidden();
    await expect.poll(async () =>
      page.locator(`#lineupSlots .player-chip[data-slot-id="${slotId}"]`).getAttribute("data-player-id")
    ).not.toBe(beforePlayerId);
    emergencySlots.delete(slotId);
  }
}

async function rotateTiredStarters(page, emergencySlots, maximumRotations = 4) {
  // En nødplassering kan være riktig én uke, men skal ikke bli permanent.
  // Før ny fatigue-rotasjon gjenoppretter testmanageren derfor en frisk,
  // eksakt spiller når nødårsaken er borte.
  await repairEmergencyLineupAssignments(page, emergencySlots);
  const rotations = [];

  for (let attempt = 0; attempt < maximumRotations; attempt += 1) {
    const need = await readRotationNeed(page);
    if (need.targets.length === 0) break;

    let performedRotation = null;
    // Spillerdraweren er den samme kandidatpoolen for alle slots. Les den én
    // gang per faktisk rotasjonsforsøk, og gjenbruk snapshotet mens oppstillingen
    // er uendret. Det beholder simultan matching uten O(targets) ekstra UI-runder.
    const planning = await readExactRotationPlanningState(page, need, need.targets[0].slotId);

    for (const target of need.targets) {
      const exactPath = planExactRotationPath(planning, need, target.slotId);

      if (exactPath) {
        const applied = await applyExactRotationPath(page, exactPath);
        const targetAssignment = applied.at(-1);
        expect(targetAssignment?.slotId).toBe(target.slotId);
        expect(targetAssignment?.afterPlayerId).toBeTruthy();

        performedRotation = {
          slotId: target.slotId,
          outPlayerId: target.playerId,
          outName: target.name,
          outLoad: target.load,
          outInjured: target.injured,
          inPlayerId: targetAssignment.afterPlayerId,
          inName: targetAssignment.playerName,
          exactPosition: true,
          decisionTrace: null
        };
        emergencySlots.delete(target.slotId);
        rotations.push(performedRotation);
        break;
      }

      await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
      await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();

      const chip = page.locator(`#lineupSlots .player-chip[data-slot-id="${target.slotId}"]`);
      await expect(chip).toBeVisible();
      const beforePlayerId = await chip.getAttribute("data-player-id");
      const position = String(await chip.getAttribute("data-position") || "").trim();
      expect(beforePlayerId).toBe(target.playerId);
      expect(position).toBeTruthy();

      await chip.click();
      const inspector = page.locator("#managerLineupSlotInspector");
      await expect(inspector).toBeVisible();
      await inspector.locator('[data-slot-action="player"]').click();

      const drawer = page.locator("#managerTeamChoiceDrawer");
      await expect(drawer).toBeVisible();
      await expect.poll(async () =>
        drawer.locator(".lineup-player-choice-row").count()
      ).toBeGreaterThan(0);
      const rows = drawer.locator(".lineup-player-choice-row");
      const rowCount = await rows.count();
      const candidates = [];
      const candidateAudit = [];

      for (let index = 0; index < rowCount; index += 1) {
        const row = rows.nth(index);
        const choice = row.locator(".lineup-player-select-action");
        const disabled = await choice.isDisabled();
        const selected = await choice.evaluate((element) => element.classList.contains("is-selected"));
        const profile = row.locator(".lineup-player-profile-link");
        const name = String(await profile.locator("strong").textContent() || "").trim();
        const positions = String(await profile.locator("span").textContent() || "");
        const positionTokens = positions
          .split("/")
          .map((value) => value.trim())
          .filter(Boolean);
        const avoided = Boolean(name && need.avoidNames.includes(name));
        const exactPosition = Boolean(position && positionTokens.includes(position));

        candidateAudit.push({
          name,
          positionTokens,
          disabled,
          selected,
          avoided,
          exactPosition
        });

        if (disabled || selected || !name || avoided) continue;
        candidates.push({
          choice,
          name,
          positionTokens,
          exactPosition
        });
      }

      // Først naturlig/brukbar posisjon. Hvis hele posisjonsgruppen er sliten,
      // bruker manageren en frisk utespiller som nødløsning. Oppstilling tillater
      // allerede slik feilbruk og rollefit forklarer konsekvensen; testen skal
      // derfor ikke være strengere enn selve produktet.
      const exactReplacement = candidates.find((candidate) => candidate.exactPosition) || null;
      const flexibleReplacement = candidates.find((candidate) =>
        position === "GK"
          ? candidate.positionTokens.includes("GK")
          : candidate.positionTokens.some((token) => token !== "GK")
      ) || null;
      const replacement = exactReplacement || flexibleReplacement;

      if (!replacement) {
        // Drawerens Escape-kontrakt er samme brukerflate som Lukk/Ferdig, men
        // uten Playwright-actionability på en footer som kan flytte seg mens
        // den lange spillerlisten synkroniseres.
        await page.keyboard.press("Escape");
        await expect(drawer).toBeHidden();
        continue;
      }

      await replacement.choice.click();
      await drawer.locator(".manager-team-choice-done").click();
      await expect(drawer).toBeHidden();

      await expect.poll(async () =>
        page.locator(`#lineupSlots .player-chip[data-slot-id="${target.slotId}"]`).getAttribute("data-player-id")
      ).not.toBe(beforePlayerId);

      const afterChip = page.locator(`#lineupSlots .player-chip[data-slot-id="${target.slotId}"]`);
      performedRotation = {
        slotId: target.slotId,
        outPlayerId: beforePlayerId,
        outName: target.name,
        outLoad: target.load,
        outInjured: target.injured,
        inPlayerId: await afterChip.getAttribute("data-player-id"),
        inName: replacement.name,
        exactPosition: replacement.exactPosition,
        decisionTrace: replacement.exactPosition
          ? null
          : {
              position,
              targetOrder: need.targets,
              avoidNames: need.avoidNames,
              candidateAudit
            }
      };
      if (performedRotation.exactPosition) {
        emergencySlots.delete(target.slotId);
      } else {
        emergencySlots.add(target.slotId);
      }
      rotations.push(performedRotation);
      break;
    }

    // Alle slitne/skadde startere er vurdert, men ingen frisk spiller kan
    // brukes uten å sette en keeper som utespiller (eller omvendt).
    if (!performedRotation) break;
  }

  return rotations;
}

async function chooseTrainingProgram(page, choiceIndex = 0) {
  await page.locator("#trainingDayChangeProgram").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  const options = page.locator("#managerTeamChoiceDrawerBody .training-program-select:not([disabled])");
  const optionCount = await options.count();
  expect(optionCount).toBeGreaterThan(0);
  const option = options.nth(choiceIndex % optionCount);
  await expect(option).toBeVisible();
  await option.click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  const progress = await readProgress(page);
  expect(progress.weeklyTrainingProgramId).toBeTruthy();
  expect(progress.weeklyTrainingProgramWeek).toBe(progress.week);
  return progress.weeklyTrainingProgramId;
}

async function chooseTrainingFocus(page, choiceIndex = 0) {
  await page.locator("#trainingDayChangeFocus").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeVisible();
  const options = page
    .locator("#managerTeamChoiceDrawerBody .weekly-training-card")
    .getByRole("button", { name: "Velg fokus" });
  const optionCount = await options.count();
  expect(optionCount).toBeGreaterThan(0);
  const option = options.nth(choiceIndex % optionCount);
  await expect(option).toBeVisible();
  await option.click();
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await expect(page.locator("#managerTeamChoiceDrawer")).toBeHidden();
  await expect(page.locator("#weeklyTrainingStatus")).not.toContainText("Ikke valgt");
  const progress = await readProgress(page);
  expect(progress.weeklyTrainingFocusId).toBeTruthy();
  expect(progress.weeklyTrainingFocusWeek).toBe(progress.week);
  return progress.weeklyTrainingFocusId;
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

async function openCurrentOpponentAnalysis(page, choiceIndex = 0) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('.app-subtab[data-tab-target="board"]').click();
  await expect(page.locator("#managerClubOrganization")).toBeVisible();
  await page.locator('[data-club-room="analysis"]').click();
  await expect(page.locator("#managerClubRoomDrawer")).toBeVisible();

  const workshop = page.locator(".opponent-analysis-workshop-v1");
  await expect(workshop).toBeVisible();
  await expect(workshop).toHaveAttribute("data-case-kind", "fixture");
  const focusOptions = workshop.locator("[data-opponent-analysis-focus]");
  const focusCount = await focusOptions.count();
  expect(focusCount).toBeGreaterThan(0);
  await focusOptions.nth(choiceIndex % focusCount).click();

  const countermeasureOptions = workshop.locator("[data-opponent-analysis-countermeasure]");
  const countermeasureCount = await countermeasureOptions.count();
  expect(countermeasureCount).toBeGreaterThan(0);
  await countermeasureOptions.nth(choiceIndex % countermeasureCount).click();

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

async function inspectCurrentCalendarMessages(page, { openFirst = false } = {}) {
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();

  const messages = [];
  let openedMessageId = null;
  let openedSubject = null;

  for (const day of [1, 3, 5]) {
    const dayButton = page.locator(`#managerCalendarDays [data-day="${day}"]`);
    if ((await dayButton.count()) === 0) continue;
    await dayButton.click();

    const events = page.locator('#managerCalendarTimeline [data-event-kind="message"]');
    const count = await events.count();
    for (let index = 0; index < count; index += 1) {
      const event = events.nth(index);
      const id = await event.getAttribute("data-event-id");
      const label = String((await event.innerText()) || "").replace(/\s+/g, " ").trim();
      if (id) messages.push({ id, label });

      if (openFirst && !openedMessageId) {
        await event.click();
        const mail = page.locator("#managerCalendarDrawerBody .manager-club-mail");
        await expect(mail).toBeVisible();
        await expect(mail.locator(".manager-club-mail-guidance")).toContainText("Managerspørsmålet");
        openedMessageId = await mail.getAttribute("data-message-id");
        openedSubject = String((await page.locator("#managerCalendarDrawerTitle").textContent()) || "").trim();
        expect(openedMessageId).toBe(id);
        expect(openedSubject).toBeTruthy();
        await page.locator("#managerCalendarMessageDrawer .manager-calendar-drawer-close").click();
        await expect(page.locator("#managerCalendarMessageDrawer")).toBeHidden();
      }
    }
  }

  expect(messages.length).toBeGreaterThan(0);
  if (openFirst) expect(openedMessageId).toBeTruthy();
  return { messages, openedMessageId, openedSubject };
}

async function chooseTrainingForCurrentWeek(page, choiceIndex = 0) {
  await openTraining(page);
  const programId = await chooseTrainingProgram(page, choiceIndex);

  const afterProgram = await readProgress(page);
  let focusId = afterProgram.weeklyTrainingFocusId;
  if (afterProgram.phase === "training") {
    focusId = await chooseTrainingFocus(page, choiceIndex);
  }

  await expect.poll(async () => {
    const progress = await readProgress(page);
    return {
      phase: progress.phase,
      programId: progress.weeklyTrainingProgramId,
      programWeek: progress.weeklyTrainingProgramWeek,
      focusId: progress.weeklyTrainingFocusId,
      focusWeek: progress.weeklyTrainingFocusWeek
    };
  }).toEqual({
    phase: "match_prep",
    programId,
    programWeek: afterProgram.week,
    focusId,
    focusWeek: afterProgram.week
  });
  return { programId, focusId };
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

async function makeOneHalftimeSubstitution(
  page,
  { positionBand = null, candidateOffset = 0, avoidInNames = [] } = {}
) {
  let wrap = page.locator("details.match-subs:visible").first();
  await expect(wrap).toBeVisible();

  if (!(await wrap.evaluate((element) => element.open))) {
    await wrap.locator("summary").click();
  }

  const outButtons = wrap.locator(".match-subs-out .match-subs-player");
  const outCount = await outButtons.count();
  expect(outCount).toBeGreaterThan(1);

  const outChoices = [];
  for (let index = 0; index < outCount; index += 1) {
    const meta = String(await outButtons.nth(index).locator("small").textContent() || "").trim();
    const position = meta.split("·")[0]?.trim() || "";
    if (position === "GK") continue;
    outChoices.push({
      index,
      position,
      band: substitutionPositionBand(position)
    });
  }
  expect(outChoices.length).toBeGreaterThan(0);

  const bandChoices = positionBand
    ? outChoices.filter((choice) => choice.band === positionBand)
    : outChoices;
  expect(
    bandChoices.length,
    `No outgoing substitution choice for ${positionBand || "field"}: ${JSON.stringify(outChoices)}`
  ).toBeGreaterThan(0);

  const outChoice = bandChoices[candidateOffset % bandChoices.length];
  const outButton = outButtons.nth(outChoice.index);
  const outName = String(await outButton.locator("strong").textContent() || "").trim();
  expect(outName).toBeTruthy();
  await outButton.click();

  wrap = page.locator("details.match-subs:visible").first();
  await expect(wrap).toBeVisible();
  const optionLists = wrap.locator(".match-subs-options");
  await expect.poll(async () => optionLists.count()).toBeGreaterThanOrEqual(2);

  const inButtons = optionLists.nth(1).locator(".match-subs-player");
  const inCount = await inButtons.count();
  expect(inCount).toBeGreaterThan(0);

  const incomingChoices = [];
  for (let index = 0; index < inCount; index += 1) {
    const name = String(await inButtons.nth(index).locator("strong").textContent() || "").trim();
    if (name) incomingChoices.push({ index, name });
  }
  expect(incomingChoices.length).toBeGreaterThan(0);

  const avoided = new Set(avoidInNames);
  const orderedIncoming = incomingChoices.map((_, offset) =>
    incomingChoices[(candidateOffset + offset) % incomingChoices.length]
  );
  const inChoice = orderedIncoming.find((choice) => !avoided.has(choice.name)) || orderedIncoming[0];
  const inButton = inButtons.nth(inChoice.index);
  const inName = inChoice.name;
  expect(inName).toBeTruthy();
  await inButton.click();

  wrap = page.locator("details.match-subs:visible").first();
  await expect(wrap.locator("summary")).toContainText("2 av 3 igjen");
  await expect(wrap.locator(".match-subs-log li")).toHaveCount(1);

  return {
    outName,
    inName,
    outPosition: outChoice.position,
    positionBand: outChoice.band
  };
}

async function playCurrentMatch(
  page,
  choiceIndex = 0,
  { substitutionPlan = null, avoidSubstituteNames = [] } = {}
) {
  await openPreMatch(page);
  await page.locator(".matchday-kickoff-button").click();

  let substitution = null;
  const nextWeek = page.locator(".matchday-next-week-button:visible").first();
  for (let event = 0; event < 6; event += 1) {
    if (await nextWeek.isVisible()) break;

    const skip = page.locator(".matchday-live-button.is-secondary:visible").filter({ hasText: "Hopp til pausen" }).first();
    if (await skip.isVisible()) {
      await skip.click();
      if (substitutionPlan && !substitution) {
        substitution = await makeOneHalftimeSubstitution(page, {
          ...substitutionPlan,
          avoidInNames: avoidSubstituteNames
        });
      }
    }

    const decisions = page.locator(".matchday-decision-button:not([disabled]):visible");
    const decisionCount = await decisions.count();
    expect(decisionCount).toBeGreaterThan(0);
    const decision = decisions.nth((choiceIndex + event) % decisionCount);
    await expect(decision).toBeVisible();
    await decision.click();
  }

  await expect(nextWeek).toBeVisible();
  await expect.poll(async () => (await readProgress(page)).phase).toBe("review");
  return substitution;
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

test("blank Rosenborg-save spiller full sesong med varierte valg og går canonicalt inn i sesong 2 gjennom ekte UI", async ({ page }) => {
  test.setTimeout(720_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await installCanonicalLeagueSeed(page);
  await page.goto("/");

  const blankMerits = await readProgress(page);
  expect(blankMerits.unlockedPlaceCount).toBe(0);
  expect(blankMerits.unlockedExpertiseCount).toBe(0);
  expect(blankMerits.earnedBadgeCount).toBe(0);
  expect(blankMerits.activeClassificationCount).toBe(0);
  expect(blankMerits.partnershipPairCount).toBe(0);
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
  expect(initial.seasonSeed).toBe("league_save_1700000000000-season-1");

  // #262 utvidet ready-klubbens sesongtropp fra spillbarhetsgulvet 15 til 20
  // når klubbpoolen tåler det. Oppstilling skal eksponere hele denne troppen,
  // ikke den gamle UI-grensen på 16 valg.
  expect(await countVisibleLineupChoices(page)).toBeGreaterThanOrEqual(20);

  const observations = [];
  const opponentIds = new Set();
  const matchIds = new Set();
  const trainingPrograms = new Set();
  const trainingFocusIds = new Set();
  const decisionLabels = new Set();
  const analysisPreparedRounds = new Set();
  const matchOutcomes = new Set();
  const scorelines = new Set();
  const inboxMessageIds = new Set();
  const inboxMessageKinds = new Set();
  const inboxSubjects = new Set();
  const openedInboxMessageIds = new Set();
  let peakConditionLoad = 0;
  let peakConditionAbsForm = 0;
  let peakConsecutiveFullMatches = 0;
  let peakInjuredPlayers = 0;
  const rotationEvents = [];
  const emergencyRotationSlots = new Set();
  const substitutionEvents = [];
  const usedSubstituteNames = new Set();

  for (let round = 1; round <= 30; round += 1) {
    await expect.poll(async () => {
      const progress = await readProgress(page);
      return { week: progress.week, phase: progress.phase, round: progress.currentRound };
    }).toEqual({ week: round, phase: "analysis", round });

    const choiceIndex = round - 1;
    await openCurrentOpponentAnalysis(page, choiceIndex);
    await advanceClubWeek(page, "inbox");
    const inbox = await inspectCurrentCalendarMessages(page, { openFirst: true });
    inbox.messages.forEach(({ id, label }) => {
      inboxMessageIds.add(id);
      const kind = id.replace(/^club-mail:w\d+:/, "");
      if (kind) inboxMessageKinds.add(kind);
      if (label) inboxSubjects.add(label);
    });
    openedInboxMessageIds.add(inbox.openedMessageId);
    if (inbox.openedSubject) inboxSubjects.add(inbox.openedSubject);

    await advanceClubWeek(page, "training");
    const rotations = await rotateTiredStarters(page, emergencyRotationSlots);
    rotationEvents.push(...rotations.map((rotation) => ({ round, ...rotation })));
    const trainingSelection = await chooseTrainingForCurrentWeek(page, choiceIndex);

    // Klubbkommunikasjonen er fasebevisst: medisinsk/trening blir tilgjengelig
    // fra dag 3 og kampbrief/presse fra dag 5. Mål derfor hele ukas mailbredde
    // først når match_prep har gjort disse dagene canonicalt tilgjengelige.
    const weeklyMail = await inspectCurrentCalendarMessages(page);
    weeklyMail.messages.forEach(({ id, label }) => {
      inboxMessageIds.add(id);
      const kind = id.replace(/^club-mail:w\d+:/, "");
      if (kind) inboxMessageKinds.add(kind);
      if (label) inboxSubjects.add(label);
    });

    // Mode-session er canonical eier av treningsvalgene. Bevis én faktisk
    // reload midt i sesongen, slik at legacy-key alene ikke kan maskere stale
    // session-state.
    if (round === 2) {
      await page.reload();
      await expect(page.locator("#formationSelect option").first()).toBeAttached();
      await expect(page.locator("#onboardingScreen")).toBeHidden();
      await expect.poll(async () => {
        const progress = await readProgress(page);
        return {
          week: progress.week,
          phase: progress.phase,
          programId: progress.weeklyTrainingProgramId,
          programWeek: progress.weeklyTrainingProgramWeek,
          focusId: progress.weeklyTrainingFocusId,
          focusWeek: progress.weeklyTrainingFocusWeek
        };
      }).toEqual({
        week: round,
        phase: "match_prep",
        programId: trainingSelection.programId,
        programWeek: round,
        focusId: trainingSelection.focusId,
        focusWeek: round
      });
    }

    const substitutionPlan = CANONICAL_SUBSTITUTION_PLAN.get(round) || null;
    const requestedSubstitution = Boolean(substitutionPlan);
    const matchSubstitution = await playCurrentMatch(page, choiceIndex, {
      substitutionPlan,
      avoidSubstituteNames: [...usedSubstituteNames]
    });

    const played = await readProgress(page);
    expect(played.lastMatchId).toBeTruthy();
    expect(played.lastMatchRound).toBe(round);
    expect(played.lastOpponentId).toBeTruthy();
    expect(played.decisionCount).toBeGreaterThan(0);
    expect(played.analysisPreparedDecisionCount).toBe(1);
    expect(played.trainingFocusId).toBeTruthy();
    expect(played.activeMatchSession).toBe(false);
    expect(["win", "draw", "loss"]).toContain(played.lastOutcome);
    if (requestedSubstitution) {
      expect(matchSubstitution).toBeTruthy();
      expect(played.lastSubstitutions).toHaveLength(1);
      expect(played.lastSubstitutions[0].outName).toBe(matchSubstitution.outName);
      expect(played.lastSubstitutions[0].inName).toBe(matchSubstitution.inName);
      expect(played.lastSubstitutions[0].minute).toBeGreaterThan(0);
      expect(played.lastSubstitutions[0].minute).toBeLessThan(90);
      substitutionEvents.push({ round, ...played.lastSubstitutions[0] });
      usedSubstituteNames.add(played.lastSubstitutions[0].inName);
    } else {
      expect(matchSubstitution).toBeNull();
      expect(played.lastSubstitutions).toHaveLength(0);
    }
    expect(played.leaguePlayed).toBe(round);
    expect(played.leagueWon + played.leagueDrawn + played.leagueLost).toBe(round);
    expect(played.leaguePoints).toBe(played.leagueWon * 3 + played.leagueDrawn);
    expect(played.leagueGoalsFor).toBeGreaterThanOrEqual(0);
    expect(played.leagueGoalsAgainst).toBeGreaterThanOrEqual(0);
    expect(played.conditionMatchCount).toBe(round);
    expect(played.conditionCount).toBeGreaterThanOrEqual(11);
    expect(played.conditionTotalMatchesPlayed).toBeGreaterThan(0);
    expect(played.conditionTotalMinutesPlayed).toBeGreaterThan(0);
    expect(played.conditionMaxLoad).toBeGreaterThan(0);
    expect(played.partnershipPairCount).toBeGreaterThanOrEqual(55);
    expect(played.partnershipMaxSharedStarts).toBeGreaterThan(0);
    for (const rotation of rotations) {
      const rested = played.conditionRows.find((entry) => entry.playerId === rotation.outPlayerId);
      const incoming = played.conditionRows.find((entry) => entry.playerId === rotation.inPlayerId);
      expect(rested).toBeTruthy();
      expect(rested.consecutiveFullMatches).toBe(0);
      expect(incoming).toBeTruthy();
    }

    peakConditionLoad = Math.max(peakConditionLoad, played.conditionMaxLoad);
    peakConditionAbsForm = Math.max(peakConditionAbsForm, played.conditionMaxAbsForm);
    peakConsecutiveFullMatches = Math.max(
      peakConsecutiveFullMatches,
      played.conditionMaxConsecutiveFullMatches
    );
    peakInjuredPlayers = Math.max(peakInjuredPlayers, played.conditionInjuredCount);

    matchIds.add(played.lastMatchId);
    opponentIds.add(played.lastOpponentId);
    trainingPrograms.add(trainingSelection.programId);
    trainingFocusIds.add(played.trainingFocusId);
    played.decisionLabels.forEach((label) => decisionLabels.add(label));
    if (played.analysisPreparedDecisionCount > 0) analysisPreparedRounds.add(round);
    matchOutcomes.add(played.lastOutcome);
    scorelines.add(`${played.lastGoalsFor}–${played.lastGoalsAgainst}`);
    observations.push({
      round,
      opponent: played.lastOpponentName,
      opponentId: played.lastOpponentId,
      trainingProgram: trainingSelection.programId,
      training: played.trainingFocusName,
      inboxMessages: weeklyMail.messages.length,
      openedInboxMessage: inbox.openedMessageId,
      condition: {
        players: played.conditionCount,
        trackedMatches: played.conditionMatchCount,
        maxLoad: played.conditionMaxLoad,
        maxAbsForm: played.conditionMaxAbsForm,
        maxConsecutiveFullMatches: played.conditionMaxConsecutiveFullMatches,
        injured: played.conditionInjuredCount
      },
      rotations,
      substitutions: played.lastSubstitutions,
      partnerships: {
        pairCount: played.partnershipPairCount,
        maxSharedStarts: played.partnershipMaxSharedStarts,
        totalSharedStarts: played.partnershipTotalSharedStarts
      },
      decisions: played.decisionCount,
      analysisPreparedDecisions: played.analysisPreparedDecisionCount,
      result: {
        outcome: played.lastOutcome,
        score: `${played.lastGoalsFor}–${played.lastGoalsAgainst}`,
        record: `${played.leagueWon}-${played.leagueDrawn}-${played.leagueLost}`,
        points: played.leaguePoints,
        goalsFor: played.leagueGoalsFor,
        goalsAgainst: played.leagueGoalsAgainst
      }
    });

    await rollToNextWeek(page, round + 1);
  }

  const completed = await readProgress(page);
  expect(completed.formationId).toBe(CANONICAL_FULL_SEASON_FORMATION_ID);
  expect(matchIds.size).toBe(30);
  expect(opponentIds.size).toBe(15);
  expect(trainingPrograms.size).toBeGreaterThanOrEqual(3);
  expect(trainingFocusIds.size).toBeGreaterThanOrEqual(4);
  expect(decisionLabels.size).toBeGreaterThanOrEqual(6);
  expect(analysisPreparedRounds.size).toBe(30);
  expect(observations.every((entry) => entry.analysisPreparedDecisions === 1)).toBe(true);
  expect(openedInboxMessageIds.size).toBe(30);
  expect(inboxMessageIds.size).toBeGreaterThanOrEqual(30);
  expect(inboxMessageKinds.size).toBeGreaterThanOrEqual(6);
  for (const kind of [
    "week-analysis",
    "match-review",
    "medical",
    "training-follow-up",
    "opponent-plan",
    "press-brief"
  ]) {
    expect(inboxMessageKinds).toContain(kind);
  }
  expect(inboxSubjects.size).toBeGreaterThanOrEqual(15);
  expect(completed.week).toBe(31);
  expect(completed.phase).toBe("analysis");
  expect(completed.seasonNumber).toBe(1);
  expect(completed.seasonRounds).toBe(30);
  expect(completed.currentRound).toBe(30);
  expect(completed.seasonStatus).toBe("completed");
  expect(completed.archiveCount).toBe(1);
  expect(completed.playerStatsCount).toBeGreaterThan(0);
  expect(completed.conditionMatchCount).toBe(30);
  expect(completed.conditionCount).toBeGreaterThanOrEqual(11);
  expect(completed.conditionTotalMatchesPlayed).toBeGreaterThan(0);
  expect(completed.conditionTotalMinutesPlayed).toBeGreaterThan(0);
  expect(completed.leaguePlayed).toBe(30);
  expect(completed.leagueWon + completed.leagueDrawn + completed.leagueLost).toBe(30);
  expect(completed.leaguePoints).toBe(completed.leagueWon * 3 + completed.leagueDrawn);
  expect(completed.archiveLatest).toEqual({
    played: completed.leaguePlayed,
    points: completed.leaguePoints,
    goalsFor: completed.leagueGoalsFor,
    goalsAgainst: completed.leagueGoalsAgainst
  });
  expect(peakConditionLoad).toBeGreaterThan(50);
  expect(peakConditionAbsForm).toBeGreaterThan(0);
  expect(peakConsecutiveFullMatches).toBeGreaterThanOrEqual(2);
  // Rotasjon skal være en reell managerbeslutning når condition-motorens
  // faktiske slitasjeterskel (>50) nås. To separate rotasjoner beviser både
  // at terskelen får konsekvens og at streak-reset ikke er et engangstilfelle,
  // uten å bake en bestemt sesongbalanse inn i browserkontrakten.
  expect(rotationEvents.length).toBeGreaterThanOrEqual(2);
  expect(new Set(rotationEvents.map((entry) => entry.outPlayerId)).size).toBeGreaterThanOrEqual(2);
  expect(new Set(rotationEvents.map((entry) => entry.inPlayerId)).size).toBeGreaterThanOrEqual(2);
  // club-squad v9 reduserte canonical full-season nødrotasjoner fra 8 til 1.
  // Lås bare nødposisjonsregresjonen; eksakte rotasjoner får fortsatt variere
  // med condition, skade og sesongforløp.
  const nonExactRotationEvents = rotationEvents.filter((entry) => !entry.exactPosition);
  const nonExactRotationDiagnostics = observations
    .filter((entry) => nonExactRotationEvents.some((rotation) => rotation.round === entry.round))
    .map((entry) => ({
      round: entry.round,
      trainingProgram: entry.trainingProgram,
      condition: entry.condition,
      rotations: entry.rotations
    }));
  expect(
    nonExactRotationEvents.length,
    `Non-exact rotation diagnostic: ${JSON.stringify({ nonExactRotationEvents, nonExactRotationDiagnostics })}`
  ).toBeLessThanOrEqual(1);

  expect(substitutionEvents).toHaveLength(CANONICAL_SUBSTITUTION_ROUNDS.size);
  expect(new Set(substitutionEvents.map((entry) => entry.round))).toEqual(CANONICAL_SUBSTITUTION_ROUNDS);
  const substitutionCoverageDiagnostic = substitutionEvents.map((entry) => ({
    round: entry.round,
    position: entry.position,
    band: substitutionPositionBand(entry.position),
    roleName: entry.roleName,
    outPlayerId: entry.outPlayerId,
    outName: entry.outName,
    inPlayerId: entry.inPlayerId,
    inName: entry.inName,
    minute: entry.minute
  }));
  expect(
    new Set(substitutionCoverageDiagnostic.map((entry) => entry.band)),
    `Substitution coverage diagnostic: ${JSON.stringify(substitutionCoverageDiagnostic)}`
  ).toEqual(new Set(["defence", "midfield", "attack"]));
  expect(
    new Set(substitutionCoverageDiagnostic.map((entry) => entry.inPlayerId)).size,
    `Substitution candidate diagnostic: ${JSON.stringify(substitutionCoverageDiagnostic)}`
  ).toBe(CANONICAL_SUBSTITUTION_ROUNDS.size);
  expect(completed.conditionCount).toBeGreaterThan(11);
  expect(completed.partnershipPairCount).toBeGreaterThanOrEqual(55);
  expect(completed.partnershipMaxSharedStarts).toBeGreaterThanOrEqual(10);
  expect(completed.partnershipTotalSharedStarts).toBeGreaterThan(0);
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
  expect(seasonTwo.conditionMatchCount).toBe(0);
  expect(seasonTwo.conditionMaxLoad).toBe(0);
  expect(seasonTwo.conditionMaxConsecutiveFullMatches).toBe(0);
  expect(seasonTwo.conditionTotalMatchesPlayed).toBe(0);
  expect(seasonTwo.conditionTotalMinutesPlayed).toBe(0);
  expect(seasonTwo.conditionInjuredCount).toBe(0);
  expect(seasonTwo.partnershipPairCount).toBe(completed.partnershipPairCount);
  expect(seasonTwo.partnershipMaxSharedStarts).toBe(completed.partnershipMaxSharedStarts);
  expect(seasonTwo.partnershipTotalSharedStarts).toBe(completed.partnershipTotalSharedStarts);
  expect(seasonTwo.activeMatchSession).toBe(false);
  await expect(page.locator("#seasonReviewPanel")).toBeHidden();
  await expect(page.locator("#startNewLeagueSeasonButton")).toBeHidden();

  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await expect(page.locator("#nextActionPrimary")).toBeEnabled();

  // Sesongskiftet er først bevist når den nye sesongen faktisk kan brukes.
  // Spill derfor første canonicale uke i sesong 2 gjennom de samme flatene som
  // sesong 1, i stedet for å stoppe ved at "Start ny sesong" opprettet state.
  await openCurrentOpponentAnalysis(page, 0);
  await advanceClubWeek(page, "inbox");
  const seasonTwoInbox = await inspectCurrentCalendarMessages(page, { openFirst: true });
  expect(seasonTwoInbox.openedMessageId).toBeTruthy();

  await advanceClubWeek(page, "training");
  const seasonTwoTraining = await chooseTrainingForCurrentWeek(page, 0);
  expect(seasonTwoTraining.programId).toBeTruthy();
  expect(seasonTwoTraining.focusId).toBeTruthy();

  const seasonTwoMatchSubstitution = await playCurrentMatch(page, 0);
  expect(seasonTwoMatchSubstitution).toBeNull();

  const seasonTwoRoundOne = await readProgress(page);
  expect(seasonTwoRoundOne.seasonNumber).toBe(2);
  expect(seasonTwoRoundOne.seasonStatus).toBe("active");
  expect(seasonTwoRoundOne.currentRound).toBe(2);
  expect(seasonTwoRoundOne.phase).toBe("review");
  expect(seasonTwoRoundOne.lastMatchRound).toBe(1);
  expect(seasonTwoRoundOne.lastMatchId).toBeTruthy();
  expect(seasonTwoRoundOne.lastMatchId).not.toBe(completed.lastMatchId);
  expect(seasonTwoRoundOne.leaguePlayed).toBe(1);
  expect(seasonTwoRoundOne.leagueWon + seasonTwoRoundOne.leagueDrawn + seasonTwoRoundOne.leagueLost).toBe(1);
  expect(seasonTwoRoundOne.archiveCount).toBe(1);
  expect(seasonTwoRoundOne.playerStatsCount).toBeGreaterThan(0);
  expect(seasonTwoRoundOne.conditionMatchCount).toBe(1);
  expect(seasonTwoRoundOne.conditionTotalMatchesPlayed).toBeGreaterThan(0);
  expect(seasonTwoRoundOne.conditionTotalMinutesPlayed).toBeGreaterThan(0);
  expect(seasonTwoRoundOne.conditionMaxLoad).toBeGreaterThan(0);
  expect(seasonTwoRoundOne.partnershipPairCount).toBeGreaterThanOrEqual(seasonTwo.partnershipPairCount);
  expect(seasonTwoRoundOne.partnershipTotalSharedStarts).toBeGreaterThan(seasonTwo.partnershipTotalSharedStarts);
  expect(seasonTwoRoundOne.activeMatchSession).toBe(false);

  await rollToNextWeek(page, 32);
  const seasonTwoWeekTwo = await readProgress(page);
  expect(seasonTwoWeekTwo.seasonNumber).toBe(2);
  expect(seasonTwoWeekTwo.seasonStatus).toBe("active");
  expect(seasonTwoWeekTwo.currentRound).toBe(2);
  expect(seasonTwoWeekTwo.week).toBe(32);
  expect(seasonTwoWeekTwo.phase).toBe("analysis");
  expect(seasonTwoWeekTwo.archiveCount).toBe(1);
  expect(seasonTwoWeekTwo.playerStatsCount).toBeGreaterThan(0);
  expect(seasonTwoWeekTwo.conditionMatchCount).toBe(1);

  console.log(
    "Full-season canonical playthrough observations:",
    JSON.stringify({
      formationSummary: {
        formationId: completed.formationId
      },
      rounds: observations,
      rotations: rotationEvents,
      rotationSummary: {
        total: rotationEvents.length,
        exact: rotationEvents.filter((entry) => entry.exactPosition).length,
        nonExact: rotationEvents.filter((entry) => !entry.exactPosition).length
      },
      substitutionSummary: {
        total: substitutionEvents.length,
        rounds: substitutionEvents.map((entry) => entry.round),
        events: substitutionEvents
      },
      analysisSummary: {
        preparedRounds: analysisPreparedRounds.size
      },
      competitionSummary: {
        outcomes: [...matchOutcomes],
        scorelines: [...scorelines],
        record: {
          played: completed.leaguePlayed,
          won: completed.leagueWon,
          drawn: completed.leagueDrawn,
          lost: completed.leagueLost,
          points: completed.leaguePoints,
          goalsFor: completed.leagueGoalsFor,
          goalsAgainst: completed.leagueGoalsAgainst
        },
        archive: completed.archiveLatest
      },
      relationshipSummary: {
        pairCount: completed.partnershipPairCount,
        maxSharedStarts: completed.partnershipMaxSharedStarts,
        totalSharedStarts: completed.partnershipTotalSharedStarts,
        seasonTwoPersisted:
          seasonTwo.partnershipPairCount === completed.partnershipPairCount &&
          seasonTwo.partnershipMaxSharedStarts === completed.partnershipMaxSharedStarts
      },
      conditionSummary: {
        peakLoad: peakConditionLoad,
        peakAbsForm: peakConditionAbsForm,
        peakConsecutiveFullMatches,
        peakInjuredPlayers,
        seasonOneEnd: {
          players: completed.conditionCount,
          trackedMatches: completed.conditionMatchCount,
          totalLoad: completed.conditionTotalLoad,
          maxLoad: completed.conditionMaxLoad,
          maxAbsForm: completed.conditionMaxAbsForm
        },
        seasonTwoStart: {
          players: seasonTwo.conditionCount,
          trackedMatches: seasonTwo.conditionMatchCount,
          totalLoad: seasonTwo.conditionTotalLoad,
          maxLoad: seasonTwo.conditionMaxLoad,
          maxAbsForm: seasonTwo.conditionMaxAbsForm
        }
      }
    })
  );
});
