#!/usr/bin/env python3
from pathlib import Path

path = Path("scripts/audit-flow.mjs")
text = path.read_text(encoding="utf-8")
old = 'check("aktiv save viser ligastatus og terminliste", html.includes("Terminliste og tabell") && app.includes("Neste kamp:") && app.includes("getNextLeagueOpponent(state.leagueSeason)"));'
new = '''check(
  "aktiv save viser sesongkontroll og ligadata",
  html.includes('id="seasonCommand"')
    && app.includes("createSeasonSceneModel({")
    && app.includes("renderSeasonCommand(elements.seasonCommand, scene")
    && app.includes("renderSeasonLeagueOverview(overview, scene, season)")
);'''
if old not in text:
    raise SystemExit("Expected legacy season-flow assertion was not found")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("Updated flow audit for Season Command v1")
