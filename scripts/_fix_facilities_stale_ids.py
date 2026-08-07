from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src/app.js"
text = path.read_text(encoding="utf-8")
old = '''  facilityOverallValue: document.querySelector("#facilityOverallValue"),
  facilityTrainingLevel: document.querySelector("#facilityTrainingLevel"),
  facilityTrainingStatus: document.querySelector("#facilityTrainingStatus"),
  facilityStadiumLevel: document.querySelector("#facilityStadiumLevel"),
  facilityStadiumStatus: document.querySelector("#facilityStadiumStatus"),
  facilityAcademyLevel: document.querySelector("#facilityAcademyLevel"),
  facilityAcademyStatus: document.querySelector("#facilityAcademyStatus"),
  facilityMedicalLevel: document.querySelector("#facilityMedicalLevel"),
  facilityMedicalStatus: document.querySelector("#facilityMedicalStatus"),
'''
if text.count(old) != 1:
    raise SystemExit(f"expected exactly one legacy facility element block, found {text.count(old)}")
path.write_text(text.replace(old, "", 1), encoding="utf-8")
print("removed legacy facility element lookups")
