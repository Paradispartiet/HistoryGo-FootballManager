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
      leagueSeasonStatus: "active",
      boardExpectation: "Øvre halvdel"
    }));
  });

  await page.goto("/");
  await expect(page.locator("#formationSelect option").first()).toBeAttached();
  await page.locator('.main-nav [role="tab"][data-tab-target="kamp"]').click();
  await expect(page.locator('[data-tab-section="kamp"]')).toBeVisible();

  const diagnostic = await page.locator("#matchdayCommandPanel").evaluate((node) => {
    const ancestry = [];
    let current = node;
    while (current) {
      const style = getComputedStyle(current);
      const rect = current.getBoundingClientRect();
      ancestry.push({
        tag: current.tagName,
        id: current.id,
        className: typeof current.className === "string" ? current.className : "",
        hidden: current.hasAttribute("hidden"),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: rect.width,
        height: rect.height
      });
      current = current.parentElement;
    }
    return {
      outerHTML: node.outerHTML,
      commandHTML: document.querySelector("#matchdayCommand")?.innerHTML || "",
      ancestry
    };
  });

  const payload = { diagnostic, pageErrors, consoleErrors };
  fs.writeFileSync("temp-matchday-diagnostic.json", JSON.stringify(payload, null, 2));
  console.log("MATCHDAY_DIAGNOSTIC=" + JSON.stringify(payload, null, 2));
});
