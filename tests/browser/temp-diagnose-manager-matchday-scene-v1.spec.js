import fs from "node:fs";
import { expect, test } from "@playwright/test";

test("diagnostiserer kampdagscenen etter ordinær bootstrap", async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    localStorage.setItem("hgfm.onboarded.v1", "1");
    localStorage.setItem("hgfm.gameStartState.v1", JSON.stringify({
      selectedMode: "league",
      activeLeagueSaveId: "matchday_scene_v1",
      clubName: "Rosenborg",
      takeoverClubId: "rosenborg",
      managerName: "Manager",
      leagueName: "Eliteserien",
      leagueSeasonStatus: "preseason",
      boardExpectation: "Øvre halvdel"
    }));
  });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  const diagnostic = await page.evaluate(() => {
    const panel = document.querySelector("#matchdayCommandPanel");
    const command = document.querySelector("#matchdayCommand");
    const result = document.querySelector("#matchdayResult");
    const describe = (node) => {
      if (!node) return null;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        tag: node.tagName,
        id: node.id,
        className: typeof node.className === "string" ? node.className : "",
        hidden: node.hasAttribute("hidden"),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: rect.width,
        height: rect.height,
        childCount: node.children.length
      };
    };
    const ancestry = [];
    let current = panel;
    while (current) {
      ancestry.push(describe(current));
      current = current.parentElement;
    }
    return {
      panel: describe(panel),
      command: describe(command),
      result: describe(result),
      commandHTML: command?.innerHTML || "",
      resultHTML: result?.innerHTML || "",
      commandHasScene: Boolean(command?.querySelector(".matchday-scene")),
      resultHasScene: Boolean(result?.querySelector(".matchday-scene")),
      resultChildren: Array.from(result?.children || []).map((node) => describe(node)),
      ancestry
    };
  });

  const payload = { diagnostic, pageErrors, consoleErrors };
  fs.writeFileSync("temp-matchday-diagnostic.json", JSON.stringify(payload, null, 2));
  console.log("MATCHDAY_DIAGNOSTIC=" + JSON.stringify(payload, null, 2));
});
