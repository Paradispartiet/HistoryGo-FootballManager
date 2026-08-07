from pathlib import Path

path = Path('scripts/audit-flow.mjs')
text = path.read_text(encoding='utf-8')

old_one = '''check(
  "auto-troppen gir også stabskandidater (så «Velg stab» er mulig uten samling)",
  app.includes("getStarterSquadStaffCandidates(staff, REQUIRED_STAFF_SIZE")
);'''
new_one = '''check(
  "auto-troppen gir rollekomplette stabskandidater (så «Velg stab» er mulig uten samling)",
  app.includes("getStarterSquadStaffCandidates(staff)")
    && app.includes("selectStarterStaffCandidates(staff)")
);'''

old_two = '''check("onboarding bruker valgt stab, ikke bare tilgjengelig stab", app.includes("hiredStaff >= REQUIRED_STAFF_SIZE") && app.includes("Tilgjengelig stab teller først når du faktisk engasjerer dem"));'''
new_two = '''check(
  "onboarding bruker rolledekning i valgt stab, ikke bare antall tilgjengelige",
  app.includes("const staffRoster = summarizeStaffRoster(getHiredStaff())")
    && app.includes("done: staffRoster.complete")
    && app.includes("roller dekket. Mangler:")
);'''

if old_one not in text:
    raise SystemExit('starter-staff flow audit anchor missing')
if old_two not in text:
    raise SystemExit('preseason staff flow audit anchor missing')
text = text.replace(old_one, new_one, 1).replace(old_two, new_two, 1)
path.write_text(text, encoding='utf-8')
