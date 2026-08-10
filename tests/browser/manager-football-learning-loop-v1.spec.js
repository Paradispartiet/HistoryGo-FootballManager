import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function openTeam(page) {
  await page.locator('.main-nav [role="tab"][data-tab-target="tactics"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
}

async function openSystem(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="system"]').click();
  await expect(page.locator("#managerSystemWorkspaceV2")).toBeVisible();
}

async function openTraining(page) {
  await openTeam(page);
  await page.locator('.app-subtab[data-tab-target="trening"]').click();
  await expect(page.locator("#managerTrainingDay")).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const clubWeekState = {
      week: 3,
      phase: "training",
      boardTrust: 58,
      playerMorale: 55,
      tacticalClarity: 54,
      trainingCulture: 56,
      mediaPressure: 43
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "football_learning_loop_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify({
      unlockedPlaceIds: ["lerkendal_stadion"],
      hiredStaffIds: ["jorgen_isnes"],
      earnedBadgeIds: [],
      activeClassifications: [],
      roleFamiliarity: {},
      localStart: { enabled: false, playerIds: [] },
      clubWeekState
    }));
  });
  await page.goto("/");
  await expect(page.locator("#onboardingScreen")).toBeHidden();
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#managerFootballLearningLoopV1Style")).toHaveCount(1);
});

test("Systemet gjør kampplanen til intensjon, kompromiss og observerbar kampatferd", async ({ page }) => {
  await openSystem(page);
  const learning = page.locator("#footballLearningSystemBridge");
  await expect(learning).toBeVisible();
  await expect(learning).toContainText("Fra kampplan til kampatferd");
  await expect(learning).toContainText("Kompromiss:");
  await expect(learning).toContainText("Se etter i kamp:");
});

test("Treningsdagen forklarer hvorfor økta finnes og hva manageren skal se etter i kamp", async ({ page }) => {
  await openTraining(page);
  const learning = page.locator("#footballLearningTrainingRationale");
  await expect(learning).toBeVisible();
  await expect(learning).toContainText("Fotballprinsipp");
  await expect(learning).toContainText("Hvorfor denne økta:");
  await expect(learning).toContainText("Se etter i kamp:");
});

test("kampforberedelsen gjør valgt trening til et konkret observasjonsspørsmål", async ({ page }) => {
  await openTraining(page);
  await page.locator("#trainingDayChangeFocus").click();
  const restDefence = page.locator("#managerTeamChoiceDrawerBody .weekly-training-card").filter({ hasText: "Restforsvar" });
  await restDefence.getByRole("button", { name: "Velg fokus" }).click();
  await expect(page.locator("#weeklyTrainingStatus")).toContainText("Restforsvar");
  await page.locator("#managerTeamChoiceDrawer .manager-team-choice-done").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.main-nav [role="tab"][data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
  await page.locator('#managerCalendarDays .manager-calendar-day-button[data-day="5"]').click();
  await page.locator('#managerCalendarTimeline [data-event-id="match-prep"]').click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#managerMatchPrepDay")).toBeVisible();
  await expect(page.locator("#matchPrepFocus")).toContainText("Restforsvar");
  const bridge = page.locator("#footballLearningMatchPrepBridge");
  await expect(bridge).toBeVisible();
  await expect(bridge).toContainText("Fra treningsfeltet til kampen");
  await expect(bridge).toContainText("Restforsvar");
  await expect(bridge).toContainText("Hypotese:");
  await expect(bridge).toContainText("Observer i kampen:");
  await expect(bridge).toContainText("Når laget mister ballen");
  await expectNoHorizontalOverflow(page);
  const results = await new AxeBuilder({ page })
    .include("#footballLearningMatchPrepBridge")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("rolleinspektøren går fra tagger til forklaring av rollerelasjon og rom", async ({ page }) => {
  await openTeam(page);
  await page.locator("#lineupSlots .player-chip").first().click();
  await expect(page.locator("#managerLineupSlotInspector")).toBeVisible();

  const learn = page.locator('#managerLineupSlotInspector [data-slot-action="learn-role"]');
  await expect(learn).toBeEnabled();
  await learn.click();
  const relation = page.locator(".football-learning-role-relationship");
  await expect(relation).toBeVisible();
  await expect(relation).toContainText("Relasjonen i din faktiske ellever");
  const focusChip = page.locator("#lineupSlots .player-chip.is-role-learning-focus");
  const partnerChip = page.locator("#lineupSlots .player-chip.is-role-learning-partner");
  await expect(focusChip).toHaveCount(1);
  await expect(partnerChip).toHaveCount(1);
  const [actualFocusName, actualPartnerName, actualFocusSlot, actualPartnerSlot, actualFocusRole, actualPartnerRole] = await Promise.all([
    focusChip.getAttribute("data-player-name"),
    partnerChip.getAttribute("data-player-name"),
    focusChip.getAttribute("data-slot-label"),
    partnerChip.getAttribute("data-slot-label"),
    focusChip.getAttribute("data-role-name"),
    partnerChip.getAttribute("data-role-name")
  ]);
  expect(actualFocusName).toBeTruthy();
  expect(actualPartnerName).toBeTruthy();
  await expect(relation).toContainText(actualFocusName);
  await expect(relation).toContainText(actualPartnerName);
  await expect(relation).toContainText(`${actualFocusSlot} ↔ ${actualPartnerSlot}`);
  await expect(relation).toContainText(`${actualFocusRole} ↔ ${actualPartnerRole}`);
  await expect(relation).toContainText("Hva de prøver å skape:");
  await expect(relation).toContainText("Risiko:");
  await expect(relation).toContainText("Se etter:");

  await page.evaluate(() => {
    const selectedSlotId = document.getElementById("managerLineupSlotInspector")?.dataset.slotId;
    [...document.querySelectorAll("#lineupSlots .player-chip")]
      .filter((chip) => chip.dataset.slotId !== selectedSlotId)
      .forEach((chip) => {
        chip.dataset.roleId = "wide_dribbler";
        chip.dataset.roleName = "Bred dribler";
      });
  });
  await learn.click();
  await learn.click();
  await expect(relation).toContainText("Ikke representert i elleveren");
  await expect(relation).toContainText("Det betyr ikke at oppstillingen er feil");
  await expect(page.locator("#lineupSlots .player-chip.is-role-learning-partner")).toHaveCount(0);
  await page.locator("#managerLineupSlotInspector .lineup-slot-inspector-close").click();
  await expect(page.locator("#lineupSlots .player-chip.is-role-learning-focus")).toHaveCount(0);
});

test("etterkamp lærer bare av faktorer kampforklaringen faktisk registrerte", async ({ page }) => {
  await page.evaluate(() => {
    const report = document.createElement("section");
    report.className = "matchday-post-match";
    report.dataset.trainingFocusId = "pressing";
    report.dataset.trainingFocusName = "Pressing";
    report.dataset.trainingHelped = "true";
    report.dataset.trainingSummary = "Ukens pressing støttet et relevant managergrep.";
    report.innerHTML = `
      <div class="matchday-post-match-overview">
        <article class="matchday-post-match-card">
          <span>Taktisk evaluering</span>
          <strong>Systemdom</strong>
          <ul><li>Det høye presset sprakk og åpnet rom bak første pressledd.</li></ul>
        </article>
      </div>`;
    document.body.append(report);
  });
  const learning = page.locator(".football-learning-post-match");
  await expect(learning).toBeVisible();
  await expect(learning).toContainText("Valg → kampsignal → læring");
  await expect(learning).toContainText("Det høye presset sprakk");
  await expect(learning).toContainText("Prinsipp · Press");
  const trainingThread = learning.locator(".football-learning-training-thread");
  await expect(trainingThread).toContainText("Trening → kamp → etterkamp");
  await expect(trainingThread).toContainText("Dette skulle du observere");
  await expect(trainingThread).toContainText("Etter kamp · motorens fasit");
  await expect(trainingThread).toContainText("Ukens pressing støttet et relevant managergrep");
  await expect(trainingThread).toContainText("samme problemområde");
  await expect(trainingThread).toContainText("Neste treningsuke:");
  await expect(learning).toContainText("Bare registrerte taktiske faktorer");
});

test("treningsdom uten tilsvarende kampsignal dikter ikke en hendelse", async ({ page }) => {
  await page.evaluate(() => {
    const report = document.createElement("section");
    report.className = "matchday-post-match";
    report.dataset.trainingFocusId = "build_up";
    report.dataset.trainingFocusName = "Oppbygging";
    report.dataset.trainingHelped = "true";
    report.dataset.trainingSummary = "Ukens oppbygging dempet risikoen i en relevant hendelse.";
    report.innerHTML = `
      <div class="matchday-post-match-overview">
        <article class="matchday-post-match-card">
          <span>Taktisk evaluering</span>
          <strong>Systemdom</strong>
          <ul><li>Avslutningene kom fra gode rom.</li></ul>
        </article>
      </div>`;
    document.body.append(report);
  });
  const thread = page.locator(".football-learning-training-thread");
  await expect(thread).toContainText("oppdiktet kamphendelse");
  await expect(thread).not.toContainText("Det høye presset sprakk");
});

test("treningsdommen sammenlignes med alle viste taktiske faktorer", async ({ page }) => {
  await page.evaluate(() => {
    const report = document.createElement("section");
    report.className = "matchday-post-match";
    report.dataset.trainingFocusId = "pressing";
    report.dataset.trainingFocusName = "Pressing";
    report.dataset.trainingHelped = "false";
    report.dataset.trainingSummary = "Ukens pressing ga liten effekt i denne kampen.";
    report.innerHTML = `
      <div class="matchday-post-match-overview">
        <article class="matchday-post-match-card">
          <span>Taktisk evaluering</span>
          <strong>Systemdom</strong>
          <ul>
            <li>Avslutningene kom fra gode rom.</li>
            <li>Bredden skapte flere innlegg.</li>
            <li>Det høye presset sprakk etter første pasning.</li>
          </ul>
        </article>
      </div>`;
    document.body.append(report);
  });
  const thread = page.locator(".football-learning-training-thread");
  await expect(thread).toContainText("Det høye presset sprakk");
  await expect(thread).toContainText("samme problemområde");
  await expect(page.locator(".football-learning-signal-grid article")).toHaveCount(2);
});

test("etterkamp dikter ikke teorikobling når kampforklaringen mangler taktisk signal", async ({ page }) => {
  await page.evaluate(() => {
    const report = document.createElement("section");
    report.className = "matchday-post-match";
    report.innerHTML = `<div class="matchday-post-match-overview"><article class="matchday-post-match-card"><span>Taktisk evaluering</span><strong>Ingen faktor</strong></article></div>`;
    document.body.append(report);
  });
  await expect(page.locator(".football-learning-post-match")).toContainText("Ingen tydelig taktisk faktor er registrert");
  await expect(page.locator(".football-learning-post-match")).toContainText("ikke på en oppdiktet teoriforklaring");
});

test("fotballæringen fungerer på mobil uten sideoverflow og alvorlige WCAG-brudd", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTeam(page);
  await page.locator("#lineupSlots .player-chip").first().click();
  const roleLearning = page.locator('#managerLineupSlotInspector [data-slot-action="learn-role"]');
  await expect(roleLearning).toBeEnabled();
  await roleLearning.click();
  await expect(page.locator(".football-learning-role-relationship")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  let results = await new AxeBuilder({ page })
    .include("#managerLineupSlotInspector")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  let serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  await page.locator("#managerLineupSlotInspector .lineup-slot-inspector-close").click();

  await openSystem(page);
  await expect(page.locator("#footballLearningSystemBridge")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  results = await new AxeBuilder({ page })
    .include("#footballLearningSystemBridge")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);

  await openTraining(page);
  await expect(page.locator("#footballLearningTrainingRationale")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  results = await new AxeBuilder({ page })
    .include("#footballLearningTrainingRationale")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});
