import { test, expect } from "@playwright/test";

test("alle etablerte klubber har eksplisitt HGFM-identitet", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const clubs = await fetch("/data/football_clubs.json").then((response) => response.json());
    const identity = await import("/src/ui/manager-club-identity.js");
    const source = await fetch("/src/ui/manager-club-identity.js").then((response) => response.text());
    const ids = clubs.clubs.map((club) => club.id);
    const mapped = Object.keys(identity.CLUB_VISUAL_IDENTITIES);
    return {
      clubCount: ids.length,
      mappedCount: mapped.length,
      missing: ids.filter((id) => !identity.getClubVisualIdentity(id).isEstablished),
      orphaned: mapped.filter((id) => !ids.includes(id)),
      sourceUsesHash: source.includes("stableIndex") || source.includes("CLUB_PALETTES")
    };
  });

  expect(result.clubCount).toBe(60);
  expect(result.mappedCount).toBe(60);
  expect(result.missing).toEqual([]);
  expect(result.orphaned).toEqual([]);
  expect(result.sourceUsesHash).toBe(false);
});

test("etablert klubb får farge, sted og eget HGFM-skjold", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { createClubIdentityView, renderClubIdentity } = await import("/src/ui/manager-club-identity.js");
    const root = document.createElement("section");
    root.innerHTML = `
      <div id="headerClubMark"></div>
      <span id="headerClubName"></span>
      <span id="headerClubGround"></span>`;
    document.body.append(root);

    const view = createClubIdentityView({
      clubName: "Brann",
      clubId: "brann",
      ground: "Brann Stadion",
      city: "Bergen"
    });
    renderClubIdentity(root, view);

    const crest = root.querySelector("svg.hgfm-club-crest");
    return {
      accent: getComputedStyle(document.documentElement).getPropertyValue("--club-accent").trim(),
      secondary: getComputedStyle(document.documentElement).getPropertyValue("--club-secondary").trim(),
      ground: root.querySelector("#headerClubGround").textContent,
      crest: Boolean(crest),
      crestText: crest?.textContent || "",
      identityMode: document.body.dataset.clubIdentity,
      stylesheet: Boolean(document.querySelector("#manager-club-identity-v1-style")),
      imageElements: root.querySelectorAll("img,image").length
    };
  });

  expect(result).toEqual(expect.objectContaining({
    accent: "#c51f30",
    secondary: "#f6f7f8",
    ground: "Brann Stadion · Bergen",
    crest: true,
    identityMode: "established",
    stylesheet: true,
    imageElements: 0
  }));
  expect(result.crestText).toContain("HGFM");
});

test("egen klubb får nøytral stabil identitet uten hash", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { createClubIdentityView } = await import("/src/ui/manager-club-identity.js");
    const first = createClubIdentityView({ clubName: "Bislett FK", clubId: "save-a" });
    const second = createClubIdentityView({ clubName: "Bislett FK", clubId: "save-b" });
    return [first.accent, second.accent, first.secondary, second.secondary, first.isEstablished, second.isEstablished];
  });

  expect(result).toEqual(["#f5f7f6", "#f5f7f6", "#171b19", "#171b19", false, false]);
});
