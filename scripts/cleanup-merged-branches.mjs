const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

if (!token) throw new Error("GITHUB_TOKEN mangler");
if (!repository || !repository.includes("/")) throw new Error("GITHUB_REPOSITORY mangler eller er ugyldig");

const [owner, repo] = repository.split("/");
const apiBase = `https://api.github.com/repos/${owner}/${repo}`;
const TEMPORARY_BRANCH_PREFIXES = ["agent/", "claude/"];

const HISTORICAL_STALE_BRANCHES = new Set([
  "agent/economy-contracts-v1-ci-anchor",
  "agent/economy-contracts-v1-ci-anchor-2",
  "agent/economy-contracts-v1-ci-anchor-3",
  "agent/matchday-lineup-scenes-v1",
  "agent/staff-roster-v1",
  // Prototype 10.06.2026. Samme Kampdag v1-API og firefilers leveranse ble
  // erstattet dagen etter av den større, mergede PR #43.
  "claude/kampdag-v1-match-engine-lqm39g"
]);

async function github(path, { method = "GET" } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "hgfm-branch-hygiene"
    }
  });
  if (method === "DELETE" && response.status === 404) return null;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${method} ${path} feilet (${response.status}): ${body.slice(0, 500)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function allPages(path) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const batch = await github(`${path}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error(`Forventet liste fra ${path}`);
    rows.push(...batch);
    if (batch.length < 100) return rows;
  }
}

function sameRepository(pr) {
  return pr?.head?.repo?.full_name === repository;
}

function temporaryWorkBranch(name) {
  return typeof name === "string" && TEMPORARY_BRANCH_PREFIXES.some((prefix) => name.startsWith(prefix));
}

async function main() {
  const repoInfo = await github("");
  const defaultBranch = repoInfo.default_branch || "main";
  const [branches, openPulls, closedPulls] = await Promise.all([
    allPages("/branches"),
    allPages("/pulls?state=open"),
    allPages("/pulls?state=closed")
  ]);

  const openHeads = new Set(
    openPulls.filter(sameRepository).map((pr) => pr.head.ref).filter(Boolean)
  );
  const mergedHeads = new Set(
    closedPulls
      .filter((pr) => pr.merged_at && sameRepository(pr))
      .map((pr) => pr.head.ref)
      .filter(Boolean)
  );

  const existing = new Set(branches.map((branch) => branch.name));
  const candidates = new Map();

  for (const name of mergedHeads) {
    if (existing.has(name)) candidates.set(name, "merged PR head");
  }
  for (const name of HISTORICAL_STALE_BRANCHES) {
    if (existing.has(name)) candidates.set(name, "historisk midlertidig branch");
  }

  const deletions = [...candidates.entries()]
    .filter(([name]) => temporaryWorkBranch(name))
    .filter(([name]) => name !== defaultBranch)
    .filter(([name]) => !openHeads.has(name))
    .sort(([a], [b]) => a.localeCompare(b));

  console.log(`Branch hygiene: ${branches.length} branches, ${openPulls.length} åpne PR-er, ${mergedHeads.size} mergede head-referanser.`);
  if (!deletions.length) {
    console.log("Ingen mergede eller eksplisitt verifiserte midlertidige arbeidsbrancher å slette.");
    return;
  }

  for (const [name, reason] of deletions) {
    if (dryRun) {
      console.log(`[dry-run] ville slettet ${name} (${reason})`);
      continue;
    }
    await github(`/git/refs/heads/${encodeURIComponent(name)}`, { method: "DELETE" });
    console.log(`Slettet ${name} (${reason})`);
  }
}

await main();
