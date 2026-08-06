from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    target = Path(path)
    text = target.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    target.write_text(text.replace(old, new, 1))


replace_once(
    "index.html",
    'data-subnav-parent="board" data-tab-target="board">Oversikt</button>',
    'data-subnav-parent="board" data-tab-target="board">Klubboversikt</button>',
    "club subnav label",
)
replace_once(
    "scripts/audit-manager-club-scene-v1.mjs",
    'check("Klubb/Mer åpner på Oversikt", files.html.includes(\'data-subnav-parent="board" data-tab-target="board">Oversikt</button>\'));',
    'check("Klubb/Mer åpner på Klubboversikt", files.html.includes(\'data-subnav-parent="board" data-tab-target="board">Klubboversikt</button>\'));',
    "club audit label",
)
replace_once(
    "tests/browser/manager-club-scene-v1.spec.js",
    'toHaveText("Oversikt")',
    'toHaveText("Klubboversikt")',
    "club browser label",
)
replace_once(
    "docs/MANAGER_CLUB_SCENE_V1.md",
    "Klubb/Mer åpner på **Oversikt**",
    "Klubb/Mer åpner på **Klubboversikt**",
    "club docs heading",
)
replace_once(
    "docs/MANAGER_CLUB_SCENE_V1.md",
    "Klubb/Mer → Oversikt",
    "Klubb/Mer → Klubboversikt",
    "club docs flow start",
)
replace_once(
    "docs/MANAGER_CLUB_SCENE_V1.md",
    "→ tilbake til Oversikt",
    "→ tilbake til Klubboversikt",
    "club docs flow return",
)
