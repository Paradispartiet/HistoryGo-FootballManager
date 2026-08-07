from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def patch(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one target, found {count}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")

patch(
    "src/app.js",
    "      state.teamMerits = result.merits;\n      saveTeamMerits();",
    "      // teamMerits er et langlivet canonical-objekt som også eies av modus-/\n      // availability-laget. Bevar objektidentiteten og oppdater kun fasilitetsfeltet.\n      state.teamMerits.facilities = normalizeFacilityState(result.facilities);\n      saveTeamMerits();"
)

patch(
    "scripts/audit-manager-facilities-upgrades-v1.mjs",
    'check("state lagres i teamMerits", files.app.includes("facilities: normalizeFacilityState(base.facilities)") && files.app.includes("state.teamMerits = result.merits"));',
    'check("state lagres i teamMerits uten å erstatte canonical-objektet", files.app.includes("facilities: normalizeFacilityState(base.facilities)") && files.app.includes("state.teamMerits.facilities = normalizeFacilityState(result.facilities)"));'
)

patch(
    "tests/browser/manager-facilities-upgrades-v1.spec.js",
    "  await expect(page.locator('.manager-facility-card[data-facility-id=\"training\"] .manager-facility-level')).toHaveText(\"Nivå 2 av 3\");\n});",
    "  await expect(page.locator('.manager-facility-card[data-facility-id=\"training\"] .manager-facility-level')).toHaveText(\"Nivå 2 av 3\");\n  await expect(page.locator(\".facility-upgrade-action:enabled\")).toHaveCount(0);\n  await expect(page.locator(\".facility-week-choice\")).toContainText(\"Treningsanlegg\");\n});"
)

print("patched facilities teamMerits identity and reload lock")
