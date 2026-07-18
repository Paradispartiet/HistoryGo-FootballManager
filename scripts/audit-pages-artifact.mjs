#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const required = ["index.html", "style.css", "src/app.js", "src/app-manager-engine-bridge.js", "dist/index.js", "data/football_team_merits.example.json"];
const missing = required.filter((entry) => !fs.existsSync(path.join(root, "_site", entry)));
if (missing.length) {
  console.error(`Pages-artifact mangler: ${missing.join(", ")}`);
  process.exit(1);
}
const html = fs.readFileSync(path.join(root, "_site/index.html"), "utf8");
for (const runtimePath of ["style.css", "src/app.js"]) {
  if (!html.includes(runtimePath)) throw new Error(`index.html laster ikke ${runtimePath}`);
}
console.log(JSON.stringify({ ok: true, required }, null, 2));
