// CI routing for source-depth player production. Fail closed to full regression.
// The source-depth register is JavaScript: only edits inside its documented
// records array can be treated as data. Changes to the runtime envelope are code.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_FILE = "src/football-player-source-claims-depth.js";
const BEGIN = "const documented = [";
const END = "\n];\n\nexport const SOURCE_DEPTH_DOCUMENTED";

function parts(source) {
  const start = source.indexOf(BEGIN);
  const end = source.indexOf(END, start + BEGIN.length);
  if (start < 0 || end < 0 || source.indexOf(BEGIN, start + 1) >= 0) {
    throw new Error("Unrecognized source-depth register layout");
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

export function classifyPlayerChange(changedFiles, before, after) {
  const full = { lane: "full", addedPlayers: 0 };
  if (changedFiles.length !== 1 || changedFiles[0] !== SOURCE_FILE) return full;
  try {
    const old = parts(before);
    const current = parts(after);
    // Both the exported version and all runtime behavior must remain identical.
    if (old.prefix !== current.prefix || old.suffix !== current.suffix ||
        old.records === current.records) return full;
    const existing = ids(old.records);
    const addedPlayers = [...ids(current.records)].filter((id) => !existing.has(id)).length;
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
  console.log("CI routing self-test: 6 cases passed");
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
      if (changedFiles.length === 1 && changedFiles[0] === SOURCE_FILE) {
        const before = execFileSync("git", ["show", base + ":" + SOURCE_FILE], {
          encoding: "utf8"
        });
        const after = fs.readFileSync(SOURCE_FILE, "utf8");
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
