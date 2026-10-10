// CI routing for source-depth and P1 player-claim production.
// Only data records inside recognised JavaScript arrays can take a light lane.
// All runtime, workflow and mixed-file changes fail closed to full regression.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_FILE = "src/football-player-source-claims-depth.js";
const P1_SOURCE_FILE = "src/football-player-source-claims-p1.js";
const BEGIN = "const documented = [";
const END = "\n];\n\nexport const SOURCE_DEPTH_DOCUMENTED";
const P1_END = "\n];\n\nexport const P1_NEW_DOCUMENTED";

function parts(source, file) {
  const endToken = file === P1_SOURCE_FILE ? P1_END : END;
  const start = source.indexOf(BEGIN);
  const end = source.indexOf(endToken, start + BEGIN.length);
  if (start < 0 || end < 0 || source.indexOf(BEGIN, start + 1) >= 0 ||
      source.indexOf(endToken, end + 1) >= 0) {
    throw new Error("Unrecognized player-claim register layout");
  }
  return {
    prefix: source.slice(0, start + BEGIN.length),
    records: source.slice(start + BEGIN.length, end),
    suffix: source.slice(end)
  };
}

function ids(records) {
  return new Set([...records.matchAll(/\bplayerId:\s*"([^"]+)"/g)].map((match) => match[1]));
}

// P1 is stricter than the older source-depth lane: the only accepted body is
// a list of literal claim objects (plus full-line comments). In particular,
// a new statement, computed value or extra property must trigger full CI.
function p1Ids(records) {
  const quoted = String.raw`"(?:\\.|[^"\\\n])*"`;
  const record = new RegExp(
    String.raw`\{\s*playerId:\s*(` + quoted +
    String.raw`)\s*,\s*placeId:\s*` + quoted +
    String.raw`\s*,\s*strengths:\s*\[\s*(?:` + quoted +
    String.raw`\s*,?\s*)*\]\s*,\s*claim:\s*` + quoted +
    String.raw`\s*,\s*source:\s*` + quoted +
    String.raw`\s*,?\s*\}\s*,?`, "g"
  );
  const stripped = records.replace(/^[ \t]*\/\/[^\n]*(?:\n|$)/gm, "\n");
  const found = [];
  const remainder = stripped.replace(record, (_match, rawId) => {
    found.push(JSON.parse(rawId));
    return " ";
  }).trim();
  if (remainder || found.length === 0 || new Set(found).size !== found.length) {
    throw new Error("P1 changes are not plain unique claim records");
  }
  return new Set(found);
}

export function classifyPlayerChange(changedFiles, before, after) {
  const full = { lane: "full", addedPlayers: 0 };
  if (changedFiles.length !== 1 ||
      ![SOURCE_FILE, P1_SOURCE_FILE].includes(changedFiles[0])) return full;
  try {
    const file = changedFiles[0];
    const old = parts(before, file);
    const current = parts(after, file);
    // Both the exported version and all runtime behavior must remain identical.
    if (old.prefix !== current.prefix || old.suffix !== current.suffix ||
        old.records === current.records) return full;
    const existing = file === P1_SOURCE_FILE ? p1Ids(old.records) : ids(old.records);
    const next = file === P1_SOURCE_FILE ? p1Ids(current.records) : ids(current.records);
    // Removing a sourced P1 player is a coverage regression requiring full review.
    if (file === P1_SOURCE_FILE && [...existing].some((id) => !next.has(id))) return full;
    const addedPlayers = [...next].filter((id) => !existing.has(id)).length;
    return { lane: addedPlayers >= 5 ? "group" : "player", addedPlayers };
  } catch {
    return full;
  }
}

function selfTest() {
  const base = '// unchanged\n' + BEGIN + '\n' +
    '  { playerId: "a", strengths: ["pace"] }\n' + END +
    '\nexport function applySourceDepthClaims() { return []; }\n';
  const one = base.replace('  { playerId:', '  { playerId: "b", strengths: ["pace"] },\n  { playerId:');
  const group = base.replace('  { playerId:',
    Array.from({ length: 5 }, (_, i) =>
      '  { playerId: "new' + i + '", strengths: ["pace"] },\n').join('') +
    '  { playerId:');
  assert.deepEqual(classifyPlayerChange([SOURCE_FILE], base, one), { lane: "player", addedPlayers: 1 });
  assert.deepEqual(classifyPlayerChange([SOURCE_FILE], base, group), { lane: "group", addedPlayers: 5 });
  assert.equal(classifyPlayerChange([SOURCE_FILE], base, base.replace("return []", "return null")).lane, "full");
  assert.equal(classifyPlayerChange([SOURCE_FILE, "src/engine.js"], base, one).lane, "full");
  assert.equal(classifyPlayerChange(["data/football_players.json"], base, one).lane, "full");
  assert.equal(classifyPlayerChange([SOURCE_FILE], base, base).lane, "full");

  const entry = (id) => [
    "  {",
    '    playerId: "' + id + '",',
    '    placeId: "jotun_arena",',
    '    strengths: ["pace"],',
    '    claim: "A documented individual skill description.",',
    '    source: "https://example.org/player"',
    "  },"
  ].join("\n");
  const p1 = (players) => [
    "// P1 test fixture",
    BEGIN,
    players.map(entry).join("\n"),
    P1_END,
    "export function applyP1Claims() { return []; }"
  ].join("\n");
  const p1Before = p1(["old"]);
  const p1One = p1(["old", "new"]);
  const p1Five = p1(["old", "n1", "n2", "n3", "n4", "n5"]);
  assert.deepEqual(classifyPlayerChange([P1_SOURCE_FILE], p1Before, p1One),
    { lane: "player", addedPlayers: 1 });
  assert.deepEqual(classifyPlayerChange([P1_SOURCE_FILE], p1Before, p1Five),
    { lane: "group", addedPlayers: 5 });
  assert.equal(classifyPlayerChange([P1_SOURCE_FILE], p1Before, p1(["new"])).lane, "full");
  assert.equal(classifyPlayerChange([P1_SOURCE_FILE], p1Before,
    p1One.replace("  {", "  process.exit(1);\n  {")).lane, "full");
  assert.equal(classifyPlayerChange([P1_SOURCE_FILE], p1Before,
    p1One.replace("// P1 test fixture", "// changed header")).lane, "full");
  assert.equal(classifyPlayerChange([P1_SOURCE_FILE], p1Before,
    p1One.replace("function applyP1Claims", "function altered")).lane, "full");
  assert.equal(classifyPlayerChange([P1_SOURCE_FILE, "scripts/audit-p1-source-claims.mjs"],
    p1Before, p1One).lane, "full");
  assert.equal(classifyPlayerChange([P1_SOURCE_FILE], p1Before, p1Before).lane, "full");
  console.log("CI routing self-test: 14 cases passed");
}

function main() {
  if (process.argv.includes("--self-test")) {
    selfTest();
    return;
  }
  const base = process.env.PR_BASE_SHA || "";
  let result = { lane: "full", addedPlayers: 0 };
  if (/^[a-f0-9]{40}$/i.test(base)) {
    try {
      // Diff directly against PR base. At PR checkout, HEAD is the PR merge
      // commit, so this also excludes unrelated earlier changes on main.
      const changedFiles = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
        encoding: "utf8"
      }).trim().split("\n").filter(Boolean);
      if (changedFiles.length === 1 &&
          [SOURCE_FILE, P1_SOURCE_FILE].includes(changedFiles[0])) {
        const file = changedFiles[0];
        const before = execFileSync("git", ["show", base + ":" + file], {
          encoding: "utf8"
        });
        const after = fs.readFileSync(file, "utf8");
        result = classifyPlayerChange(changedFiles, before, after);
      }
      console.log("Files changed:", changedFiles.join(", ") || "(none)");
    } catch (error) {
      console.warn("Could not verify data-only change; using full CI:", error.message);
    }
  }
  console.log("CI lane:", result.lane, "new player claims:", result.addedPlayers);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      "lane=" + result.lane + "\nadded_players=" + result.addedPlayers + "\n");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
