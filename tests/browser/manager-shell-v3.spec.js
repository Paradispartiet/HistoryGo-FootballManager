import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 }
];

async function openArea(page, name) {
  const targetByArea = {
    Kontor: "dashboard",
    Lag: "tactics",
    Kamp: "kamp",
    Stats: "statistikk"
  };
  await page.locator(`.main-nav [role="tab"][data-tab-target="${targetByArea[name]}"]`).click();
  if (name === "Kontor") await expect(page.locator('[data-tab-section="inbox"]')).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectPrimaryActionInViewport(page) {
  const action = page.locator("#nextActionPrimary");
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

test.beforeEach(async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_shell_visual_save",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "HG Liga",
      leagueSeasonStatus: "preseason"
    }));
  });
  if (testInfo.title === "Kamp i gang · 1280") {
    await page.addInitScript(() => {
      const clubWeekState = {
        week: 1,
        phase: "matchday",
        boardTrust: 50,
        playerMorale: 50,
        tacticalClarity: 50,
        trainingCulture: 50,
        mediaPressure: 50
      };
      localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
        schema: "historygo-football-manager.team_merits.v1",
        version: 1,
        teamId: "browser_legacy_team",
        teamName: "Browser Legacy Team",
        activeTrainingWeek: 1,
        hiredStaffIds: [
          "jorgen_isnes",
          "johannes_moesgaard",
          "bislett_speed_specialist"
        ],
        unlockedPlaceIds: ["kfum_arena", "bislett_stadion"],
        unlockedExpertiseIds: [
          "team_organisation",
          "club_building",
          "development_culture",
          "pressing_structure",
          "rest_defense"
        ],
        earnedBadgeIds: ["training_culture_bronze"],
        badgeProgress: [],
        activeClassifications: ["development_team"],
        clubWeekState
      }));
      localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    });
  }
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("har fire stabile hovedområder og ett samlet Kontor", async ({ page }) => {
  const leagueTabs = page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible');
  await expect(leagueTabs).toHaveCount(4);
  await expect(leagueTabs).toHaveText(["Kontor", "Lag", "Kamp", "Stats"]);
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="board"]')).toBeHidden();

  await openArea(page, "Kontor");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="dashboard"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="inbox"]')).toHaveText("Innboks");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]')).toHaveText("Klubbdrift");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="officeHelp"]')).toHaveText("Oppstartshjelp");

  await expect(page.locator("#nextActionPrimary")).toHaveCount(1);
  await expect(page.locator("#nextActionDestination")).toBeVisible();
  await expect(page.locator("#advanceClubWeekPhase, #leagueOnboardingPrimary, #portalPriorityAction")).toHaveCount(0);
  await expectPrimaryActionInViewport(page);
});

test("Kontor åpner på Innboks og viser hvor du er", async ({ page }) => {
  await openArea(page, "Kontor");
  await expect(page.locator("#inboxThreadList")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Innboks");
  await expect(page.locator("#leagueOnboardingPanel")).toBeHidden();

  await page.locator('.app-subtab[data-tab-target="officeHelp"]').click();
  await expect(page.locator("#leagueOnboardingPanel")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Oppstartshjelp");
});

test("lagflaten bruker bare direkte uttak og holder banen i arbeidsområdet", async ({ page }) => {
  await openArea(page, "Lag");
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeVisible();
  await expect(page.locator("#benchPlayersList")).toBeVisible();
  await expect(page.locator("#slotPlayerSelect, #slotRoleSelect, #teamScore")).toHaveCount(0);

  const [app, pitch] = await Promise.all([
    page.locator("#app").boundingBox(),
    page.locator("#lineupSlots").boundingBox()
  ]);
  expect(app).not.toBeNull();
  expect(pitch).not.toBeNull();
  expect(pitch.x).toBeGreaterThanOrEqual(app.x - 1);
  expect(pitch.x + pitch.width).toBeLessThanOrEqual(app.x + app.width + 1);
});

test("trening viser nøyaktig ett utvidet arbeidssteg", async ({ page }) => {
  await openArea(page, "Lag");
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  const toggles = page.locator("[data-training-step-toggle]");
  await expect(toggles).toHaveCount(3);
  await expect(page.locator('[data-training-step-toggle][aria-expanded="true"]')).toHaveCount(1);

  await toggles.nth(2).click();
  await expect(toggles.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator('[data-training-step-toggle][aria-expanded="true"]')).toHaveCount(1);
  await expect(page.locator("#individualTrainingStepBody")).toBeVisible();
  await expect(page.locator("#trainingProgramStepBody")).toBeHidden();
  await expect(page.locator("#trainingFocusStepBody")).toBeHidden();
  await expect(page.locator("#modalTrainingProgram, #modalTrainingFocusPick, #modalIndividualTraining")).toHaveCount(0);
});

test("klubbidentiteten viser skjold, klubbfarge og stadion", async ({ page }) => {
  await expect(page.locator("#headerClubMark")).toHaveText("RO");
  await expect(page.locator("#headerClubName")).toContainText("Rosenborg");
  await expect(page.locator("#headerClubGround")).toContainText("Lerkendal");
  const accent = await page.locator("#clubIdentityHeader").evaluate((node) => getComputedStyle(node).getPropertyValue("--club-accent").trim());
  expect(accent).toMatch(/^#[0-9a-f]{6}$/i);
});

for (const viewport of VIEWPORTS) {
  test(`ingen overflow og primærhandlingen er synlig ved ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const area of ["Kontor", "Lag", "Kamp", "Stats"]) {
      await openArea(page, area);
      await expectNoHorizontalOverflow(page);
    }
    await expectPrimaryActionInViewport(page);
  });
}

test("modaler har tastaturfokus, fokusfelle og fokusretur", async ({ page }) => {
  const opener = page.locator("#settingsButton");
  await opener.focus();
  await opener.press("Enter");
  const modal = page.locator("#modalSettings");
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("#modalSettings :focus")).toHaveCount(1);

  const focusable = modal.locator('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').filter({ visible: true });
  const first = focusable.first();
  const last = focusable.last();
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(opener).toBeFocused();
});

test("hovedskallet har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .include("body")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("Stats samler tabell, terminliste og spillerstatistikk", async ({ page }) => {
  await openArea(page, "Stats");
  await expect(page.locator("#seasonCommand h2")).toHaveText("Stats");
  await expect(page.locator("#leagueSeasonOverview")).toBeVisible();
  const depth = page.locator("#leagueSeasonOverview .season-depth");
  if (await depth.count()) await expect(depth).toHaveAttribute("open", "");
  await expect(page.locator("#statsMatches")).toBeVisible();
  await expect(page.locator("#statsGoals")).toBeVisible();
  await expect(page.locator("#statsAssists")).toBeVisible();
  await expect(page.locator("#statsStanding")).toBeVisible();
  await expect(page.locator("#playerStatsTable")).toBeVisible();
  await expect(page.locator("#seasonArchiveTable")).toBeVisible();
});

test("ny ligalagring velger moderne 4-2-3-1 eksplisitt", async ({ page }) => {
  await openArea(page, "Lag");
  await expect(page.locator("#formationSelect")).toHaveValue("modern_4231");
  await expect(page.locator("#formationSelect option:checked")).toContainText("Modern 4-2-3-1");
  await expect(page.locator("#formationSelect option:checked")).not.toContainText("Pre-modern Rush 1-1-8");
});

for (const viewport of VIEWPORTS) {
  test(`Neste handling viser full tittel, forklaring og mål ved ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const button = page.locator("#nextActionPrimary");
    const title = page.locator("#nextActionPrimaryTitle");
    const hint = page.locator("#nextActionPrimaryHint");
    const destination = page.locator("#nextActionDestination");
    await expect(button).toBeVisible();
    await expect(title).toBeVisible();
    await expect(hint).toBeVisible();
    await expect(destination).toBeVisible();
    const values = await page.evaluate(() => {
      const button = document.querySelector("#nextActionPrimary");
      const title = document.querySelector("#nextActionPrimaryTitle");
      const hint = document.querySelector("#nextActionPrimaryHint");
      const titleStyle = getComputedStyle(title);
      const hintStyle = getComputedStyle(hint);
      return {
        titleOverflow: titleStyle.textOverflow,
        titleWhiteSpace: titleStyle.whiteSpace,
        hintOverflow: hintStyle.textOverflow,
        hintWhiteSpace: hintStyle.whiteSpace,
        titleInside: title.getBoundingClientRect().right <= button.getBoundingClientRect().right + 1,
        hintInside: hint.getBoundingClientRect().right <= button.getBoundingClientRect().right + 1,
        aria: button.getAttribute("aria-label") || ""
      };
    });
    expect(values.titleOverflow).not.toBe("ellipsis");
    expect(values.hintOverflow).not.toBe("ellipsis");
    expect(values.titleWhiteSpace).not.toBe("nowrap");
    expect(values.hintWhiteSpace).not.toBe("nowrap");
    expect(values.titleInside).toBe(true);
    expect(values.hintInside).toBe(true);
    expect(values.aria).toContain((await title.textContent()).trim());
    expect(values.aria).toContain((await hint.textContent()).trim());
    await expectNoHorizontalOverflow(page);
  });
}

test("kampknapp og kampklar-status bruker samme autoritative resultat", async ({ page }) => {
  await openArea(page, "Kamp");
  const readiness = page.locator("#matchdayReadiness");
  const play = page.locator("#playMatchdayButton");
  await expect(readiness).toBeVisible();
  const canStart = await readiness.getAttribute("data-ready") === "true";
  expect(await play.isDisabled()).toBe(!canStart);
});

test("sentrale handlingsknapper er mørke og har synlig tastaturfokus", async ({ page }) => {
  async function expectDarkButton(button) {
    await expect(button).toBeVisible();
    const appearance = await button.evaluate((node) => {
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return {
        background: style.backgroundColor,
        color: style.color,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        height: box.height,
        disabled: node.disabled
      };
    });
    expect(appearance.background).not.toBe("rgb(255, 255, 255)");
    expect(appearance.color).not.toBe("rgb(0, 0, 0)");
    expect(appearance.height).toBeGreaterThanOrEqual(44);

    if (!appearance.disabled) {
      await button.focus();
      const focus = await button.evaluate((node) => {
        const style = getComputedStyle(node);
        return { width: style.outlineWidth, style: style.outlineStyle };
      });
      expect(focus.style).not.toBe("none");
      expect(parseFloat(focus.width)).toBeGreaterThan(0);
    }
  }

  await expectDarkButton(page.locator("#nextActionPrimary"));
  await expectDarkButton(page.locator("#settingsButton"));
  await openArea(page, "Kamp");
  await expectDarkButton(page.locator("#playMatchdayButton"));
});

test("laguttaket bruker større bane og kvalitativ rollebruk", async ({ page }) => {
  await openArea(page, "Lag");
  const pitch = page.locator("#lineupSlots");
  const pitchBox = await pitch.boundingBox();
  expect(pitchBox).not.toBeNull();
  expect(pitchBox.width).toBeGreaterThanOrEqual(500);

  await expect(page.locator(".player-chip .chip-fit")).toHaveCount(11);
  const chipFit = (await page.locator(".player-chip .chip-fit").first().textContent()).trim();
  expect(chipFit).not.toMatch(/^\d+$/);
  const sideFit = (await page.locator("#selectedMatchScore").textContent()).trim();
  expect(sideFit).not.toMatch(/^\d+$/);
  expect(sideFit).toMatch(/samsvar|rolle|vurdert/i);
});

test("kampdagen åpner som en visuell kampkommando", async ({ page }) => {
  await openArea(page, "Kamp");
  const command = page.locator(".matchday-command");
  await expect(command).toBeVisible();
  await expect(command.locator(".matchday-versus")).toBeVisible();
  await expect(command.locator(".matchday-team")).toHaveCount(2);
  await expect(command.locator(".matchday-command-plan article")).toHaveCount(3);
  await expect(command.locator(".matchday-command-status")).toContainText(/avspark|forberedelser|pågår|laster/i);
  await expectNoHorizontalOverflow(page);
});

async function prepareAndStartMatch(page) {
  await openArea(page, "Lag");
  const trainingTab = page.locator('.app-subtab[data-tab-target="trening"]').first();
  await expect(trainingTab).toBeAttached();
  await trainingTab.evaluate((node) => node.click());
  const focusButton = page.locator("#weeklyTrainingOptions button:not([disabled])").first();
  await expect(focusButton).toBeAttached();
  await focusButton.evaluate((node) => node.click());
  await openArea(page, "Kontor");
  await page.locator('.app-subtab[data-tab-target="officeHelp"]').click();
  const preseasonSteps = await page.locator("#leagueOnboardingSteps li").evaluateAll((items) => items.map((item) => ({
    text: item.textContent?.replace(/\s+/g, " ").trim() || "",
    done: item.classList.contains("is-done")
  })));
  const incomplete = preseasonSteps.filter((step) => !step.done && !step.text.includes("Start sesongen"));
  expect(incomplete, JSON.stringify(preseasonSteps)).toEqual([]);
  const startSeasonAction = page.locator("#leagueOnboardingSteps button", { hasText: "Start sesongen" });
  await expect(startSeasonAction).toBeVisible();
  await startSeasonAction.click();
  await openArea(page, "Kamp");
  const readinessNode = page.locator("#matchdayReadiness");
  const readinessText = (await readinessNode.textContent() || "").trim();
  const readinessData = await readinessNode.evaluate((node) => ({ ...node.dataset }));
  await expect(page.locator("#playMatchdayButton"), `${readinessText} | ${JSON.stringify(readinessData)}`).toBeEnabled();
  await page.locator("#playMatchdayButton").click();
  await expect(page.locator(".matchday-kickoff-button")).toBeVisible();
}

test.describe("visuelle baseliner", () => {
  test("Lag · 1280", async ({ page }) => {
    await openArea(page, "Lag");
    await expect(page).toHaveScreenshot("lineup-1280.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Trening · 768", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openArea(page, "Lag");
    await page.locator('.app-subtab[data-tab-target="trening"]').click();
    await page.locator("#trainingWorkspace").scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot("training-768.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Kamp · 1280", async ({ page }) => {
    await openArea(page, "Kamp");
    await expect(page).toHaveScreenshot("matchday-1280.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Lag · 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openArea(page, "Lag");
    await expect(page).toHaveScreenshot("lineup-390.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Kamp · 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openArea(page, "Kamp");
    await expect(page).toHaveScreenshot("matchday-390.png", { animations: "disabled", maxDiffPixelRatio: 0.015 });
  });

  test("Kamp i gang · 1280", async ({ page }) => {
    await prepareAndStartMatch(page);
    await page.locator(".matchday-kickoff-button").click();
    const pause = page.getByRole("button", { name: "Pause", exact: true });
    if (await pause.isVisible()) await pause.click();
    await expect(page.locator(".matchday-scoreboard")).toBeVisible();
    await expect(page.locator(".match-flow")).toBeVisible();
    await expect(page).toHaveScreenshot("match-live-1280.png", { animations: "disabled", maxDiffPixelRatio: 0.02 });
  });
});
