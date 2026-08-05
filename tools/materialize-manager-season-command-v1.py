#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, json

ROOT = Path(__file__).resolve().parents[1]
PAYLOAD = ROOT / "tools/.season-command-payload"

def unpack(name):
    return gzip.decompress(base64.b64decode((PAYLOAD / name).read_text().strip())).decode("utf-8")

def replace_once(path, old, new):
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    if new and new in text:
        return
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one patch target, found {count}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")

def write_payload(path, name):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(unpack(name), encoding="utf-8")

insert_marker = '    <div class="tab-section statistikk-view" data-tab-section="statistikk" hidden>\n'
new_panel = '''      <section class="manager-surface league-season-panel season-command-panel" id="leagueSeasonPanel" aria-label="Sesongkontroll" aria-live="polite" hidden>
        <div id="seasonCommand" class="season-command"></div>
        <div class="season-command-support">
          <p id="leagueSeasonStatus" class="muted-text">Ligasesongen starter når troppen er spillbar.</p>
          <button type="button" id="startNewLeagueSeasonButton" hidden>Start ny sesong</button>
        </div>
        <div id="leagueSeasonOverview" class="mini-season-overview season-league-overview"></div>
      </section>

'''
old_panel = '''      <section class="manager-surface league-season-panel" id="leagueSeasonPanel" aria-label="Ligasesong" aria-live="polite" hidden>
        <div class="mini-season-head">
          <div>
            <p class="eyebrow">Ligasesong</p>
            <h2>Neste kamp · Terminliste og tabell</h2>
            <p id="leagueSeasonStatus" class="muted-text">Ligasesongen starter når troppen er spillbar.</p>
          </div>
          <div class="mini-season-actions">
            <button type="button" id="startNewLeagueSeasonButton" hidden>Start ny sesong</button>
          </div>
        </div>
        <div id="leagueSeasonOverview" class="mini-season-overview"></div>
      </section>
'''
replace_once("index.html", insert_marker, insert_marker + new_panel)
replace_once("index.html", old_panel, "")
replace_once("index.html", "styrets regnskap etter fjorten runder", "styrets regnskap etter ligarundene")
replace_once(
    "src/app.js",
    'import { createMatchdaySceneModel } from "./ui/manager-matchday-presentation.js";\n',
    'import { createMatchdaySceneModel } from "./ui/manager-matchday-presentation.js";\nimport { createSeasonSceneModel, renderSeasonCommand, renderSeasonLeagueOverview } from "./ui/manager-season-presentation.js";\n'
)
replace_once(
    "src/app.js",
    '  leagueSeasonStatus: document.querySelector("#leagueSeasonStatus"),\n',
    '  leagueSeasonStatus: document.querySelector("#leagueSeasonStatus"),\n  seasonCommand: document.querySelector("#seasonCommand"),\n'
)
replace_once("src/app.js", unpack("old-render.b64"), unpack("new-render.b64"))

style_path = ROOT / "style.css"
style = style_path.read_text(encoding="utf-8")
if "Sesongkontroll v1" not in style:
    style_path.write_text(style.rstrip() + "\n\n" + unpack("season.css.b64").lstrip(), encoding="utf-8")

write_payload("src/ui/manager-season-presentation.js", "season-module.b64")
write_payload("scripts/simulate-manager-season-scene-v1.mjs", "season-sim.b64")
write_payload("tests/browser/manager-season-scene-v1.spec.js", "season-browser.b64")
write_payload("docs/SEASON_COMMAND_CENTER_V1.md", "season-doc.b64")
write_payload("scripts/audit-manager-shell-v3.mjs", "audit.b64")

package_path = ROOT / "package.json"
package = json.loads(package_path.read_text(encoding="utf-8"))
scripts = package.setdefault("scripts", {})
if "sim:manager-season-scene-v1" not in scripts:
    rebuilt = {}
    for key, value in scripts.items():
        rebuilt[key] = value
        if key == "sim:manager-ground-flow-v1":
            rebuilt["sim:manager-season-scene-v1"] = "node scripts/simulate-manager-season-scene-v1.mjs"
    package["scripts"] = rebuilt
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

ci_path = ROOT / ".github/workflows/ci.yml"
ci = ci_path.read_text(encoding="utf-8")
needle = "          npm run sim:manager-ground-flow-v1\n"
if "npm run sim:manager-season-scene-v1" not in ci:
    if ci.count(needle) != 1:
        raise SystemExit("ci.yml: insertion point missing")
    ci_path.write_text(ci.replace(needle, needle + "          npm run sim:manager-season-scene-v1\n", 1), encoding="utf-8")

print("Manager Season Command v1 materialized")
