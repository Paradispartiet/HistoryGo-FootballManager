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
      clubWeekState: {
        week: 3,
        phase: "training",
        boardTrust: 58,
        playerMorale: 55,
        tacticalClarity: 54,
        trainingCulture: 56,
        mediaPressure: 43
      }
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

test("rolleinspektøren går fra tagger til forklaring av rollerelasjon og rom", async ({ page }) => {
  await openTeam(page);
  await page.locator("#lineupSlots .player-chip").first().click();
  await expect(page.locator("#managerLineupSlotInspector")).toBeVisible();

  await page.evaluate(() => {
    const inspector = document.getElementById("managerLineupSlotInspector");
    const selectedSlotId = inspector?.dataset.slotId;
    const chips = [...document.querySelectorAll("#lineupSlots .player-chip")];
    const selectedChip = chips.find((chip) => chip.dataset.slotId === selectedSlotId);
    const partnerChip = chips.find((chip) => chip !== selectedChip);
    chips.filter((chip) => chip !== selectedChip).forEach((chip) => {
      chip.dataset.roleId = "deep_playmaker";
      chip.dataset.roleName = "Dyp playmaker";
    });
    selectedChip.dataset.playerName = "Valgt ving";
    selectedChip.dataset.slotLabel = "Venstrekant";
    selectedChip.dataset.roleId = "wide_dribbler";
    selectedChip.dataset.roleName = "Bred dribler";
    selectedChip.dataset.x = "15";
    selectedChip.dataset.y = "25";
    partnerChip.dataset.playerName = "Valgt back";
    partnerChip.dataset.slotLabel = "Venstreback";
    partnerChip.dataset.roleId = "overlapping_fullback";
    partnerChip.dataset.roleName = "Overlappende back";
    partnerChip.dataset.x = "16";
    partnerChip.dataset.y = "66";
    const role = document.getElementById("teamSelectedRole");
    if (role) role.textContent = "Bred dribler";
    window.dispatchEvent(new Event("storage"));
  });
  const learn = page.locator('#managerLineupSlotInspector [data-slot-action="learn-role"]');
  await expect(learn).toBeEnabled();
  await learn.click();
  const relation = page.locator(".football-learning-role-relationship");
  await expect(relation).toBeVisible();
  await expect(relation).toContainText("Relasjonen i din faktiske ellever");
  await expect(relation).toContainText("Valgt ving");
  await expect(relation).toContainText("Valgt back");
  await expect(relation).toContainText("Venstrekant ↔ Venstreback");
  await expect(relation).toContainText("Overlappende back");
  await expect(relation).toContainText("samme brede kanal");
  await expect(relation).toContainText("Se etter:");
  await expect(page.locator("#lineupSlots .player-chip.is-role-learning-focus")).toHaveCount(1);
  await expect(page.locator("#lineupSlots .player-chip.is-role-learning-partner")).toHaveCount(1);

  await page.evaluate(() => {
    const partner = document.querySelector("#lineupSlots .player-chip.is-role-learning-partner");
    partner.dataset.roleId = "deep_playmaker";
    partner.dataset.roleName = "Dyp playmaker";
    window.dispatchEvent(new Event("storage"));
  });
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
  await expect(learning).toContainText("Bare registrerte taktiske faktorer");
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
