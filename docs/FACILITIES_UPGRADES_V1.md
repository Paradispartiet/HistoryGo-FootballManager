# Reelle fasilitetsoppgraderinger v1

## Kontrakt

Fasiliteter ligger under **Kontor → Klubbdrift → Fasiliteter**. De er ikke en ny hovedfane og de lager ingen konkurrerende «neste»-motor.

V1 har tre fasiliteter med faktisk mottaker i eksisterende motorer:

- **Treningsanlegg** — reduserer positiv fatigue/wear fra eksisterende treningsprogram og øker eksisterende `trainingHappiness`.
- **Medisinsk avdeling** — gir ekstra restitusjon i `applyWeeklyRecovery()` og reduserer eksisterende wear/injuryRisk fra trening.
- **Analyseavdeling** — øker eksisterende `tacticalClarity` fra gjennomført treningsprogram.

Keeperanlegg, akademi, stadion og speideranlegg er bevisst ikke oppgraderbare i v1 fordi de mangler en tilstrekkelig presis mottakermotor eller ville risikere å omgå History Go-gater.

## State og progresjon

Det opprettes **ingen ny localStorage-nøkkel**. State lagres i eksisterende `hgfm.teamMerits.v1`:

```json
{
  "facilities": {
    "version": 1,
    "levels": { "training": 1, "medical": 1, "analysis": 1 },
    "lastUpgradeWeek": null,
    "lastUpgradeFacilityId": null
  }
}
```

Gamle saves normaliseres til nivå 1. Manageren kan gjøre **ett anleggsvalg per klubbuke**. Ingen penger, lønn, fiktiv budsjettvaluta eller auto-oppgradering er innført. Nivåene er 1–3.

## Permanente porter

- `audit:manager-facilities-upgrades-v1`
- `sim:manager-facilities-upgrades-v1`
- Browser: desktop, 390 px, persistens og WCAG A/AA
