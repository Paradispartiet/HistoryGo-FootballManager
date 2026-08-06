import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const moduleSource = fs.readFileSync(new URL("../../src/ui/manager-post-match-analysis-v1.js", import.meta.url), "utf8");
const postMatchCss = fs.readFileSync(new URL("../../src/ui/manager-post-match-analysis-v1.css", import.meta.url), "utf8");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`;
const snapshotBase64 = fs.readFileSync(new URL("./manager-post-match-analysis-v1.spec.js-snapshots/post-match-analysis-768-chromium-linux.png.base64", import.meta.url), "utf8");
const snapshotPath = new URL("./manager-post-match-analysis-v1.spec.js-snapshots/post-match-analysis-768-chromium-linux.png", import.meta.url);
fs.writeFileSync(snapshotPath, Buffer.from(snapshotBase64.replace(/\s/g, ""), "base64"));

function reportFixture() {
  const lastMatch = {
    id: "browser-post-match",
    version: 2,
    outcome: "win",
    score: { for: 2, against: 1 },
    expectedGoals: { for: 1.86, against: 0.94 },
    playerStats: {
      goals: [
        { minute: 24, scorerName: "Ada Angriper", assistName: "Mina Midtbane" },
        { minute: 78, scorerName: "Ada Angriper", assistName: null }
      ]
    },
    substitutions: [{ minute: 66, playerOutName: "Kari Kant", playerInName: "Sara Hurtig" }],
    clubConsequences: {
      effects: { playerMorale: 3, boardTrust: 2, mediaPressure: -1 },
      familiarity: 3
    },
    exposedWeaknessMetric: "restDefenseScore"
  };
  const report = {
    outcome: "win",
    outcomeLabel: "Seier",
    scoreLine: "2–1",
    expectedGoalsLine: "1.86 – 0.94",
    keyFactors: ["Presset skapte brudd høyt i banen"],
    analysis: ["Laget kontrollerte store deler av andre omgang."],
    bestDecision: { label: "Høyere press etter pause", eventTitle: "Grep ved 60 minutter" },
    worstDecision: { label: "For stor risiko i restforsvaret", eventTitle: "Grep ved 72 minutter" },
    formationVerdict: "4-2-3-1 ga gode presshøyder, men krevde bedre sikring.",
    decisiveUnit: "Midtbanepresset avgjorde kampbildet.",
    nextWeekAdvice: "Prioriter restforsvar og restitusjon i neste treningsuke.",
    historyGoHint: "Studer lag som kombinerte høyt press med sterk sikring.",
    explanation: {
      headline: "Seier 2–1: presset skapte kampens tydeligste fordel.",
      resultSummary: "Seier 2–1. Sjansebildet forklarer både kontrollen og risikoen.",
      decisiveFactors: ["Høy lagfit og gode relasjoner ga kontroll i oppbyggingen.", "Høyt press ga flere brudd."],
      tacticalFactors: ["Presset traff motstanderens svake første fase."],
      relationshipFactors: ["Tier og spiss fant hverandre mellom leddene."],
      trainingFactors: ["Ukens pressfokus ga laget et tydelig felles signal."],
      offPitchFactors: ["Troppen hadde nok overskudd til å opprettholde intensiteten."],
      learningPoints: ["Sikre bak presset før begge backene går samtidig."],
      nextWeekSuggestions: ["Tren restforsvar og legg inn restitusjon tidlig i uka."]
    }
  };
  return {
    teamName: "Rosenborg",
    opponent: { name: "Viking", style: "høyt press" },
    competitionLabel: "Eliteserien",
    roundLabel: "Runde 8",
    venueLabel: "Borte",
    formationName: "4-2-3-1",
    tacticName: "Kontrollert press",
    trainingLabel: "Press og restforsvar",
    lastSignal: "Assistenten ber laget sikre bak presset.",
    readiness: { canStartMatch: true, blockers: [] },
    lastMatch,
    report
  };
}

async function renderFixture(page, width = 1280, height = 1100) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(`<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style id="manager-post-match-analysis-v1-style">
    * { box-sizing: border-box; }
    html { background: #05080b; color: #fff; font-family: Arial, sans-serif; }
    body { margin: 0; padding: 18px; background: #05080b; color: #fff; }
    button { font: inherit; cursor: pointer; }
    .eyebrow { margin: 0; color: rgba(255,255,255,.62); font-size: .72rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
    ${postMatchCss}
  </style></head><body><main id="mount" aria-label="Kampdag"></main></body></html>`);
  await page.evaluate(async ({ url, fixture }) => {
    const module = await import(url);
    const model = module.createPostMatchAnalysisModel(fixture);
    window.__postMatchTargets = [];
    document.querySelector("#mount").append(module.renderPostMatchAnalysis(model, (target) => window.__postMatchTargets.push(target)));
  }, { url: moduleUrl, fixture: reportFixture() });
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("etterkampen viser resultat, forklaring, managergrep, spillerbidrag og konsekvenser", async ({ page }) => {
  await renderFixture(page);
  await expect(page.locator(".matchday-post-match")).toBeVisible();
  await expect(page.locator("#postMatchAnalysisTitle")).toContainText("presset");
  await expect(page.locator(".matchday-post-match-card")).toHaveCount(3);
  await expect(page.locator(".matchday-post-match-decision")).toHaveCount(2);
  await expect(page.locator(".matchday-post-match-panel")).toHaveCount(2);
  await expect(page.locator(".matchday-post-match-event")).toHaveCount(2);
  await expect(page.locator(".matchday-post-match-effect")).toHaveCount(3);
});

test("etterkampen leder videre til eksisterende Trening og Analyse", async ({ page }) => {
  await renderFixture(page);
  await page.locator('.matchday-post-match-primary[data-matchday-target="trening"]').click();
  await page.locator('.matchday-post-match-secondary[data-matchday-target="analyse"]').click();
  await expect.poll(() => page.evaluate(() => window.__postMatchTargets)).toEqual(["trening", "analyse"]);
});

test("etterkampen har ingen mobil overflow", async ({ page }) => {
  await renderFixture(page, 390, 1000);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator(".matchday-post-match-primary")).toBeVisible();
});

test("etterkampen har ingen alvorlige tilgjengelighetsbrudd", async ({ page }) => {
  await renderFixture(page);
  const results = await new AxeBuilder({ page })
    .include(".matchday-post-match")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("etterkampen har en låst visuell baseline på nettbrett", async ({ page }) => {
  await renderFixture(page, 768, 1180);
  await expect(page.locator(".matchday-post-match-score")).toHaveScreenshot("post-match-analysis-768.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.04
  });
});
