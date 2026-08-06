from pathlib import Path

presentation_path = Path("src/ui/manager-training-presentation.js")
presentation = presentation_path.read_text()
old_next = '  const nextStep = steps.find((step) => step.id === plan?.nextStepId) || steps.find((step) => !step.done) || null;\n'
new_next = '''  const plannedNextStep = steps.find((step) => step.id === plan?.nextStepId)
    || steps.find((step) => !step.done)
    || null;
  // Individuell trening er oppfølging, ikke en kampport. Når ukeplanen allerede
  // er spillbar, skal manageren kunne gå videre uten å fylle en kunstig kvote.
  const nextStep = plannedNextStep?.id === "individual" && plan?.ready
    ? null
    : plannedNextStep;
'''
if old_next not in presentation:
    raise SystemExit("Training next-step anchor missing")
presentation_path.write_text(presentation.replace(old_next, new_next, 1))

audit_path = Path("scripts/audit-manager-training-scene-v2.mjs")
audit = audit_path.read_text()
audit = audit.replace(
    '  style: fs.readFileSync(new URL("../style.css", import.meta.url), "utf8"),\n',
    '  trainingStyle: fs.readFileSync(new URL("../src/ui/manager-training-scene-v2.css", import.meta.url), "utf8"),\n',
    1
)
audit = audit.replace(
    'files.style.includes("Manager Training Scene v2") && files.style.includes("@media (max-width: 640px)")',
    'files.trainingStyle.includes("Manager Training Scene v2") && files.trainingStyle.includes("@media (max-width: 640px)")',
    1
)
audit_path.write_text(audit)
