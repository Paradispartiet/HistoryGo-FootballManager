import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function season() {
  const clubs = [
    { id: "rosenborg", name: "Rosenborg", strength: 82, ground: "Lerkendal" },
    { id: "brann", name: "Brann", strength: 80, ground: "Brann stadion" },
    { id: "viking", name: "Viking", strength: 79, ground: "Lyse Arena" },
    { id: "molde", name: "Molde", strength: 78, ground: "Aker stadion" }
  ];
  const match = (id, round, homeClubId, awayClubId, result = null) => ({ id, round, homeClubId, awayClubId, status: result ? "completed" : "scheduled", result });
  return {
    version: "historygo-football-manager.league-season.v3",
    competition: { id: "hg-eliteserien", mode: "league", tierId: "eliteserien", tierName: "Eliteserien", tierLevel: 1, clubCount: 4, rounds: 2, homeAndAway: false, points: { win: 3, draw: 1, loss: 0 }, version: 3 },
    tier: { id: "eliteserien", name: "Eliteserien", level: 1, clubCount: 4, groupSize: 4, rounds: 2 },
    seed: "club-communication-v2",
    seasonNumber: 1,
    managerClubId: "rosenborg",
    clubs,
    currentRound: 2,
    status: "active",
    fixtures: [
      { round: 1, status: "completed", matches: [match("mail-r1-0", 1, "rosenborg", "brann", { homeGoals: 2, awayGoals: 1 }), match("mail-r1-1", 1, "viking", "molde", { homeGoals: 0, awayGoals: 0 })] },
      { round: 2, status: "scheduled", matches: [match("mail-r2-0", 2, "viking", "rosenborg"), match("mail-r2-1", 2, "brann", "molde")] }
    ],
    completedMatchIds: ["mail-r1-0", "mail-r1-1"]
  };
}

const weekState = { week: 8, phase: "review", boardTrust: 54, playerMorale: 58, tacticalClarity: 61, trainingCulture: 57, mediaPressure: 72 };
const lastMatch = { id: "played-brann", opponent: { id: "brann", name: "Brann" }, outcome: "win", score: { for: 2, against: 1 }, playedInClubWeek: 8 };
const analysisPlan = {
  version: "opponent-analysis.v1",
  fixtureId: "mail-r2-0",
  opponentId: "viking",
  opponentName: "Viking",
  round: 2,
  week: 8,
  focusId: "transition",
  focusLabel: "Overganger og restforsvar",
  question: "Hva skjer rett etter balltap?",
  hypothesis: "Viking angriper rommet bak første pressledd etter ballvinning.",
  evidence: ["Direkte overganger"],
  countermeasureId: "secure_before_loss",
  countermeasureLabel: "Sikre før balltapet",
  target: "system",
  targetLabel: "Systemet",
  why: "Viking søker raskt framover.",
  risk: "For mange bak ballen kan svekke angrepet.",
  watch: "Se de tre sikringsspillerne idet angrepet pågår."
};

async function openCalendar(page) {
  await page.locator('.main-nav [data-tab-target="dashboard"]').click();
  await expect(page.locator('[data-tab-section="calendar"]')).toBeVisible();
}

async function selectDay(page, day) {
  await page.locator(`#managerCalendarDays [data-day="${day}"]`).click();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(({ leagueSeason, clubWeekState, matchday, plan }) => {
    const teamMerits = {
      unlockedPlaceIds: ["ullevaal_stadion", "bislett_stadion"],
      hiredStaffIds: ["ullevaal_final_pressure_mentor", "bislett_first_team_physio"],
      earnedBadgeIds: [],
      roleFamiliarity: {},
      clubWeekState,
      localStart: { enabled: false, playerIds: [] }
    };
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({ selectedMode: "league", activeLeagueSaveId: "club_mail_v2", takeoverClubId: "rosenborg", clubName: "Rosenborg", leagueSeasonStatus: "active" }));
    localStorage.setItem("historygo-football-manager.league-season.v3", JSON.stringify(leagueSeason));
    localStorage.setItem("hgfm.clubWeekState.v1", JSON.stringify(clubWeekState));
    localStorage.setItem("hgfm.teamMerits.v1", JSON.stringify(teamMerits));
    localStorage.setItem("hgfm.matchday.v1", JSON.stringify({ lastMatch: matchday, session: null }));
    localStorage.setItem("hgfm.playerCondition.v1", JSON.stringify([{ playerId: "ada", name: "Ada Hegerberg", load: 64, consecutiveFullMatches: 4, injury: null }]));
    localStorage.setItem("hgfm.weeklyTrainingProgram.v1", JSON.stringify({ week: 8, programId: "program_rest_defense" }));
    localStorage.setItem("hgfm.weeklyTrainingFocus.v1", JSON.stringify({ week: 8, focusId: "rest_defence" }));
    localStorage.setItem("hgfm.modeSessions.v1", JSON.stringify({
      version: "mode-sessions.v1",
      activeMode: "league",
      sessions: { league: { clubWeekState, teamMerits, leagueSeason, matchday: { lastMatch: matchday, session: null }, playerCondition: [{ playerId: "ada", name: "Ada Hegerberg", load: 64, consecutiveFullMatches: 4, injury: null }], weeklyTrainingProgram: { week: 8, programId: "program_rest_defense" }, weeklyTrainingFocus: { week: 8, focusId: "rest_defence" }, opponentAnalysisPlan: plan, readInboxMessageIds: [], deliveredInboxMessageIds: [], selectedInboxChoices: {} }, scenario: null, training: null, national: null }
    }));
  }, { leagueSeason: season(), clubWeekState: weekState, matchday: lastMatch, plan: analysisPlan });
  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await expect(page.locator("#onboardingScreen")).toBeHidden();
});

test("klikket hendelse og åpnet dokument har samme mail-ID", async ({ page }) => {
  await openCalendar(page);
  await selectDay(page, 1);
  const event = page.locator('[data-event-id="club-mail:w8:match-review"]');
  await expect(event).toContainText("Brann");
  await event.click();
  await expect(page.locator('.manager-club-mail[data-message-id="club-mail:w8:match-review"]')).toBeVisible();
  await expect(page.locator(".manager-club-mail")).toContainText("2–1");
});

test("to forskjellige mailer åpner forskjellig faktisk innhold", async ({ page }) => {
  await openCalendar(page);
  await selectDay(page, 3);
  await page.locator('[data-event-id="club-mail:w8:medical"]').click();
  await expect(page.locator('.manager-club-mail[data-message-id="club-mail:w8:medical"]')).toContainText("Ada Hegerberg");
  await expect(page.locator(".manager-club-mail")).toContainText("Bislett førstelagsfysio");
  await page.keyboard.press("Escape");
  await page.locator('[data-event-id="club-mail:w8:training-follow-up"]').click();
  await expect(page.locator('.manager-club-mail[data-message-id="club-mail:w8:training-follow-up"]')).toContainText("Restforsvar");
});

test("motstanderbriefen bruker lagret plan mot faktisk motstander", async ({ page }) => {
  await openCalendar(page);
  await selectDay(page, 5);
  await page.locator('[data-event-id="club-mail:w8:opponent-plan"]').click();
  const mail = page.locator(".manager-club-mail");
  await expect(mail).toContainText("Viking");
  await expect(mail).toContainText("Sikre før balltapet");
  await expect(mail).toContainText("For mange bak ballen");
});

test("mailen gjør situasjon til managerspørsmål og presise arbeidslenker", async ({ page }) => {
  await openCalendar(page);
  await selectDay(page, 3);
  await page.locator('[data-event-id="club-mail:w8:medical"]').click();

  const mail = page.locator(".manager-club-mail");
  await expect(mail.locator(".manager-club-mail-guidance")).toContainText("Situasjonen");
  await expect(mail.locator(".manager-club-mail-guidance")).toContainText("Hva det betyr");
  await expect(mail.locator(".manager-club-mail-guidance")).toContainText("Managerspørsmålet");
  await expect(mail.locator(".manager-club-mail-guidance")).toContainText("Se etter");
  const links = mail.locator(".manager-club-mail-links .manager-club-mail-action");
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveAttribute("href", "#trening/trainingDayChangeIndividual");
  await expect(links.nth(1)).toHaveAttribute("href", "#trening/trainingDayCondition");

  await links.nth(0).click();
  await expect(page.locator('[data-tab-section="trening"]')).toBeVisible();
  await expect(page.locator("#trainingDayChangeIndividual")).toBeFocused();
});

test("motstanderbriefens lenke åpner riktig kampforberedelse", async ({ page }) => {
  await openCalendar(page);
  await selectDay(page, 5);
  await page.locator('[data-event-id="club-mail:w8:opponent-plan"]').click();
  const link = page.locator('.manager-club-mail-links a[href="#tactics/squadTacticsCommandPanel"]');
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.locator('[data-tab-section="tactics"]')).toBeVisible();
  await expect(page.locator("#squadTacticsCommandPanel")).toBeFocused();
});

test("å lese én mail flytter ikke fasen eller skjuler andre mailer", async ({ page }) => {
  await openCalendar(page);
  await selectDay(page, 3);
  const phaseBefore = await page.locator("#clubWeekPhase").textContent();
  await expect(page.locator('#managerCalendarTimeline [data-event-kind="message"]')).toHaveCount(2);
  await page.locator('[data-event-id="club-mail:w8:medical"]').click();
  await page.keyboard.press("Escape");
  await selectDay(page, 1);
  await selectDay(page, 3);
  await expect(page.locator('#managerCalendarTimeline [data-event-kind="message"]')).toHaveCount(2);
  await expect(page.locator("#clubWeekPhase")).toHaveText(phaseBefore || "Oppsummering");
});

test("klubbmail fungerer på mobil og består WCAG-vakten", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalendar(page);
  await selectDay(page, 3);
  await page.locator('[data-event-id="club-mail:w8:medical"]').click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).include("#managerCalendarMessageDrawer").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact))).toEqual([]);
});
