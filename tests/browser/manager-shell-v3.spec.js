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
    Speiding: "historygo",
    Kamp: "kamp",
    Stats: "statistikk"
  };
  await page.locator(`.main-nav [role="tab"][data-tab-target="${targetByArea[name]}"]`).click();
  if (name === "Kontor") await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  if (name === "Speiding") await expect(page.locator('[data-tab-section="historygo"]')).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "manager_shell_v5_save",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "HG Liga",
      leagueSeasonStatus: "active"
    }));
  });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator('.app-subtab[data-tab-target="calendar"]')).toBeAttached();
});

test("har fem stabile hovedområder med Speiding mellom Lag og Kamp", async ({ page }) => {
  const leagueTabs = page.locator('.main-nav .nav-tab[data-nav-modes~="league"]:visible');
  await expect(leagueTabs).toHaveCount(5);
  await expect(leagueTabs).toHaveText(["Kontor", "Lag", "Speiding", "Kamp", "Stats"]);
  await expect(page.locator('.main-nav .nav-tab[data-tab-target="board"]')).toHaveCount(0);

  await openArea(page, "Kontor");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="dashboard"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="calendar"]')).toHaveText("Kalender");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="inbox"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="board"]')).toHaveText("Klubben");
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="officeHelp"]')).toBeHidden();
  await expect(page.locator('.app-subtab[data-subnav-parent="dashboard"][data-tab-target="historygo"]')).toHaveCount(0);
  await expect(page.locator("manager-next-action")).toBeHidden();
  await expect(page.locator("#advanceClubWeekPhase, #leagueOnboardingPrimary, #portalPriorityAction")).toHaveCount(0);
});

test("Kontor åpner på Kalender og viser hvor du er", async ({ page }) => {
  await openArea(page, "Kontor");
  await expect(page.locator("#managerCalendarDays")).toBeVisible();
  await expect(page.locator("#managerCalendarTimeline")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Kontor · Kalender");
  await expect(page.locator('[data-tab-section="inbox"]')).toBeHidden();
  await expect(page.locator("#leagueOnboardingPanel")).toBeHidden();
});

test("Speiding er eget hovedområde med to listeflater", async ({ page }) => {
  await openArea(page, "Speiding");
  await expect(page.locator("#managerScoutingRecruitable")).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Speiding · Rekrutterbare");
  await expect(page.locator('.app-subtab[data-subnav-parent="historygo"]:visible')).toHaveText(["Rekrutterbare", "Andre klubber"]);
  await page.locator('.app-subtab[data-tab-target="scoutingClubs"]').click();
  await expect(page.locator('[data-tab-section="scoutingClubs"]')).toBeVisible();
  await expect(page.locator("#managerLocationText")).toHaveText("Speiding · Andre klubber");
});

test("lagflaten bruker bare direkte uttak og holder banen i arbeidsområdet", async ({ page }) => {
  await openArea(page, "Lag");
  await expect(page.locator("#lineupSlots")).toBeVisible();
  await expect(page.locator("#lineupPlayerChoices")).toBeVisible();
  await expect(page.locator("#lineupRoleChoices")).toBeVisible();
  await expect(page.locator("#benchPlayersList")).toBeVisible();
  await expect(page.locator("#slotPlayerSelect, #slotRoleSelect, #teamScore")).toHaveCount(0);
  const [app, pitch] = await Promise.all([page.locator("#app").boundingBox(), page.locator("#lineupSlots").boundingBox()]);
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
});

test("klubbidentiteten viser skjold, klubbfarge og stadion", async ({ page }) => {
  await expect(page.locator("#headerClubMark")).toHaveText("RO");
  await expect(page.locator("#headerClubName")).toContainText("Rosenborg");
  await expect(page.locator("#headerClubGround")).toContainText("Lerkendal");
  const accent = await page.locator("#clubIdentityHeader").evaluate((el) => getComputedStyle(el).getPropertyValue("--club-accent").trim());
  expect(accent).toMatch(/^#[0-9a-f]{6}$/i);
});

for (const viewport of VIEWPORTS) {
  test(`ingen overflow ved ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const area of ["Kontor", "Lag", "Speiding", "Kamp", "Stats"]) {
      await openArea(page, area);
      await expectNoHorizontalOverflow(page);
    }
    await openArea(page, "Kontor");
    await expect(page.locator("manager-next-action")).toBeHidden();
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
  const results = await new AxeBuilder({ page }).include("body").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("Stats samler tabell, terminliste og spillerstatistikk", async ({ page }) => {
  await openArea(page, "Stats");
  await expect(page.locator("#leagueSeasonPanel")).toBeVisible();
  await expect(page.locator("#seasonCommand h2")).toHaveText("Stats");
  await expect(page.locator("#statsMatches")).toBeVisible();
  await expect(page.locator("#statsGoals")).toBeVisible();
  await expect(page.locator("#statsAssists")).toBeVisible();
  await expect(page.locator("#statsStanding")).toBeVisible();
  await expect(page.locator("#playerStatsTable")).toBeVisible();
});

test("Next-footeren er skjult i den normale managerloopen", async ({ page }) => {
  await openArea(page, "Kontor");
  await expect(page.locator("manager-next-action")).toBeHidden();
  await expect(page.locator("#nextActionPrimary")).toBeHidden();
  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="3"]').click();
  await expect(page.locator('#managerCalendarTimeline [data-event-id="team-training"]')).toBeVisible();
});

test("sentrale shell-knapper er mørke og har synlig tastaturfokus", async ({ page }) => {
  async function expectDarkButton(button) {
    await expect(button).toBeVisible();
    const appearance = await button.evaluate((el) => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return { background: style.backgroundColor, color: style.color, height: box.height, disabled: el.disabled };
    });
    expect(appearance.background).not.toBe("rgb(255, 255, 255)");
    expect(appearance.color).not.toBe("rgb(0, 0, 0)");
    expect(appearance.height).toBeGreaterThanOrEqual(44);
    if (!appearance.disabled) {
      await button.focus();
      const focus = await button.evaluate((el) => {
        const style = getComputedStyle(el);
        return { width: style.outlineWidth, style: style.outlineStyle };
      });
      expect(focus.style).not.toBe("none");
      expect(parseFloat(focus.width)).toBeGreaterThan(0);
    }
  }
  await expectDarkButton(page.locator("#settingsButton"));
  await openArea(page, "Kontor");
  await expectDarkButton(page.locator('#managerCalendarDays .manager-calendar-day-button[aria-current="date"]'));
});
