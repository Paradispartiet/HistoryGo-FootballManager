#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const site = path.join(root, "_site");
fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(site, { recursive: true });
for (const entry of ["index.html", "style.css", "src", "dist", "data"]) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) throw new Error(`Kan ikke stage Pages: ${entry} mangler`);
  fs.cpSync(source, path.join(site, entry), { recursive: true });
}
console.log("Pages-artifact staged i _site");
