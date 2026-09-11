import { expect, test } from "@playwright/test";

test("preseason følger onboarding og kan ikke konsumere Club Week", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.locator('[data-start-mode="league"]').click();
  await page.locator("#onboardingClubModeTakeover").click();
  await page.locator('.club-takeover-option[data-club-id="rosenborg"]').click();
  await page.locator("#onboardingCreateClub").click();

  // Klubb + grunntropp er klare, men staben mangler. Den canonicale
  // onboarding-rekkefølgen skal derfor sende manageren til Stab før Trening.
  await expect(page.locator('[data-tab-section="admin"]')).toBeVisible();
  await expect(page.locator("#managerStaffRosterV1")).toBeVisible();
  await expect(page.locator("#managerStaffRosterV1")).toHaveAttribute("data-complete", "false");

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

  const programButton = page.locator(".training-program-select:not([disabled])").first();
  await expect(programButton).toBeVisible();
  await programButton.click();

  await expect(page.locator("#weeklyTrainingProgramStatus")).toContainText("valgt");
  await expect(page.locator("#weeklyTrainingProgramStatus")).not.toContainText("brukt denne uka");

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
