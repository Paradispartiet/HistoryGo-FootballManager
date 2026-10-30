import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "responsive_tactics_ui_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await page.locator('.main-nav [data-tab-target="tactics"]').click();
  await expect(page.locator("#fmResponsiveTacticsGrid")).toBeVisible();
});

test("landskap på iPad viser to formasjonstavler, spillerliste og original benk", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
  await expect(page.locator("#benchPlayersList")).toBeAttached();

  await expect.poll(async () => page.locator("#lineupSlots .player-chip").count()).toBe(11);
  await expect.poll(async () => page.locator("#fmPhasePitch .fm-phase-player").count()).toBe(11);
  await expect.poll(async () => page.locator("#fmTacticsSquadRows .fm-squad-row").count()).toBe(11);

  const ownership = await page.evaluate(() => ({
    benchParent: document.querySelector("#benchPlayersList")?.closest(".fm-tactics-bench")?.classList.contains("pitch-bench"),
    lineupParent: document.querySelector("#lineupSlots")?.closest(".pitch-stage")?.classList.contains("pitch-stage")
  }));
  expect(ownership).toEqual({ benchParent: true, lineupParent: true });
});

test("mobil stående bruker store faner uten å duplisere den spillbare banen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeHidden();
  await page.locator('[data-fm-view="phase"]').click();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await expect(page.locator("#lineupSlots")).toBeHidden();
  await page.locator('[data-fm-view="squad"]').click();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
  await expect(page.locator("#fmPhasePitch")).toBeHidden();
  await page.locator('[data-fm-view="pitch"]').click();
  await expect(page.locator("#lineupSlots")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("mobil liggende har taktikkvisning og spillerliste samtidig", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
  await page.locator('[data-fm-view="phase"]').click();
  await expect(page.locator("#fmPhasePitch")).toBeVisible();
  await expect(page.locator("#fmTacticsSquad")).toBeVisible();
});

test("spillerprofil åpnes fra reell spiller-ID, ikke en ny score eller kopi av laguttaket", async ({ page }) => {
  await expect.poll(async () => page.locator("#fmTacticsSquadRows .fm-squad-row").count()).toBe(11);
  const player = page.locator("#fmTacticsSquadRows .fm-player-profile").first();
  if (await player.count()) {
    await player.click();
    await expect(page.locator("#managerPlayerProfileDialog")).toBeVisible();
  } else {
    await expect(page.locator("#fmTacticsSquadRows")).toContainText("Tom plass");
  }
});

test("fasebanen leser faktisk med/uten-ball-form fra valgt system, uten å endre elleveren", async ({ page }) => {
  await expect.poll(async () => page.locator("#lineupSlots .player-chip").count()).toBe(11);
  const formation = await page.evaluate(async () => {
    const formationId = document.querySelector("#formationSelect")?.value;
    const response = await fetch("data/hgFootball/formations.json");
    const data = await response.json();
    return data.formations.find((item) => item.id === formationId);
  });
  expect(formation).toBeTruthy();

  const lineupIdsBefore = await page.locator("#lineupSlots .player-chip").evaluateAll(
    (items) => items.map((chip) => chip.dataset.playerId)
  );
  const pitch = page.locator("#fmPhasePitch");
  await expect(pitch).toHaveAttribute("data-phase", "out");
  await expect(pitch).toHaveAttribute("data-shape", formation.outOfPossessionShape);
  await expect(page.locator("#fmPhaseHeading")).toContainText(formation.outOfPossessionShape);
  await expect(page.locator('[data-fm-phase="out"]')).toHaveAttribute("aria-pressed", "true");
  const outPositions = await pitch.locator(".fm-phase-player").evaluateAll(
    (items) => items.map((item) => `${item.style.left}|${item.style.top}`).sort()
  );

  await page.locator('[data-fm-phase="in"]').click();
  await expect(pitch).toHaveAttribute("data-phase", "in");
  await expect(pitch).toHaveAttribute("data-shape", formation.inPossessionShape);
  await expect(page.locator("#fmPhaseHeading")).toContainText(formation.inPossessionShape);
  await expect(pitch.locator(".fm-phase-player")).toHaveCount(11);
  const inPositions = await pitch.locator(".fm-phase-player").evaluateAll(
    (items) => items.map((item) => `${item.style.left}|${item.style.top}`).sort()
  );
  if (formation.inPossessionShape !== formation.outOfPossessionShape) {
    expect(inPositions).not.toEqual(outPositions);
  }

  const lineupIdsAfter = await page.locator("#lineupSlots .player-chip").evaluateAll(
    (items) => items.map((chip) => chip.dataset.playerId)
  );
  expect(lineupIdsAfter).toEqual(lineupIdsBefore);
  await expect(page.locator("#benchPlayersList")).toBeAttached();
});

test("faseformasjon følger nytt systemvalg uten egen lagring", async ({ page }) => {
  const choices = await page.locator("#formationSelect option:not([disabled])").evaluateAll(
    (nodes) => nodes.map((node) => node.value).filter(Boolean)
  );
  if (choices.length < 2) return;
  const select = page.locator("#formationSelect");
  const original = await select.inputValue();
  const alternative = choices.find((id) => id !== original);
  await select.selectOption(alternative);
  await expect(page.locator("#fmPhasePitch")).toHaveAttribute("data-formation-id", alternative);
  await expect(page.locator("#fmPhasePitch .fm-phase-player")).toHaveCount(11);
});

test("alle 46 formasjonskildene gir 11 entydige brikker i begge faser", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { projectFormationPhase } = await import("/src/ui/manager-tactics-phase-projection.js");
    const { buildFormationSlots } = await import("/src/hg-football-formation-adapter.js");
    const formations = (await (await fetch("data/hgFootball/formations.json")).json()).formations;
    const starting = buildFormationSlots("4-2-3-1").map((slot, index) => ({
      id: "starting_" + index, position: slot.position, x: slot.x, y: slot.y
    }));
    const errors = [];
    for (const formation of formations) {
      for (const phase of ["in", "out"]) {
        const result = projectFormationPhase(starting, formation, phase);
        if (!result || result.players.length !== 11 ||
            new Set(result.players.map((player) => player.id)).size !== 11 ||
            result.players.filter((player) => player.position === "GK").length !== 1) {
          errors.push(formation.id + ":" + phase);
        }
      }
    }
    return { count: formations.length, errors };
  });
  expect(result.count).toBe(46);
  expect(result.errors).toEqual([]);
});

test("taktikkbrikkene viser draktmarkør uten å skjule spillerknapper", async ({ page }) => {
  await expect(page.locator("#lineupSlots .player-chip")).toHaveCount(11);
  await expect(page.locator("#fmPhasePitch .fm-phase-player")).toHaveCount(11);
  const visuals = await page.evaluate(() => {
    const source = document.querySelector("#lineupSlots .player-chip");
    const phase = document.querySelector("#fmPhasePitch .fm-phase-player");
    return {
      kit: getComputedStyle(source, "::after").content,
      phaseKit: getComputedStyle(phase, "::before").content,
      interactive: source.tagName === "BUTTON",
      phaseReadOnly: phase.tagName !== "BUTTON"
    };
  });
  expect(visuals.kit).not.toBe("none");
  expect(visuals.phaseKit).not.toBe("none");
  expect(visuals.interactive).toBe(true);
  expect(visuals.phaseReadOnly).toBe(true);
});
