# Pors · post-merge-verifisering

## Kildeleveransen

PR #211 ble squash-merget som `ef1bfd579f684ff6a0e2fc19b3fc8f8a97d3b64a`. Data-, motor- og Pages-portene var grønne, men tre tropps-/profiltester feilet i den siste nettleserkjøringen.

## Hydreringsrettingen

PR #212 ble squash-merget som `e28988aff32f6d4720f80bb905542fed3170b4dc` etter grønn full-CI, inkludert 146/146 Chromium-tester. Rettelsen synkroniserer tabell, søk og profilvisning mot autoritativ `squadPlayerIds`.

## Canonical Pors-kontrakt

- 63 eksplisitte Pors-tilknytninger.
- 58 nye profiler og fem verifiserte canonical krysskoblinger.
- 16 profiler med dokumentert posisjon er spillbare.
- 47 profiler uten dokumentert posisjon beholdes som historikkposter.
- `clubPoolIds` og automatisk grunntropp bruker bare den spillbare delmengden.
- Den komplette historikkatalogen bevares separat og kan utvides uten nye identiteter.
- P1-nevneren forblir 936/936.

## Verifisering

Den dokumenterte/spillbare todelingen kjøres gjennom eksisterende typecheck, build, Pages-artifakt, dataaudits, UI-vakter, motorsimuleringer og hele Chromium-pakken. PR-en for spillbarhetsgrensen skal bare merges når alle disse portene er grønne.
