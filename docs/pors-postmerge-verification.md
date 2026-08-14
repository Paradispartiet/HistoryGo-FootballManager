# Pors · endelig repo-verifisering

## Leveranser

- PR #211 materialiserte 63 dokumenterte Pors-koblinger og ble squash-merget som `ef1bfd579f684ff6a0e2fc19b3fc8f8a97d3b64a`.
- PR #212 rettet troppshydreringen og ble squash-merget som `e28988aff32f6d4720f80bb905542fed3170b4dc`. CI-run `31727529407` var grønn med 146/146 nettlesertester.
- PR #214 skilte dokumentert klubbhistorikk fra spillbar spillerpool og ble SHA-låst squash-merget fra head `c756ad02ae08218a9bf52fbe7a0ca1b138f07e0e` som `505ff0acd5590f18792588938c92b281da94b436`.
- Branch-CI `31762841954` og PR-CI `31762919713` passerte hele suiten, inkludert responsive Chromium- og visuelle tester.
- PR #213 ble lukket som erstattet av #214 og ble ikke merget.
- Den opprinnelige Codex-reviewtråden i PR #211 er løst etter at den permanente 63/16/47-grensen ble verifisert på `main`.

## Låst kontrakt

- **63 dokumenterte Pors-profiler** beholdes i canonical klubbhistorikk.
- **16 profiler** har dokumentert posisjon og kan brukes i tropp, oppstilling, trening og kamp.
- **47 historikkposter** mangler dokumentert posisjon og får ingen konstruert rolle, styrke eller taktisk fit.
- `pors_stadion` åpner nøyaktig **16 spillerkandidater**, ikke hele historikkatalogen.
- `playerPoolSize` teller dokumenterte klubbkoblinger, mens `playablePlayerPoolSize` og `playerPoolStatus` følger den spillbare delmengden.
- Fem canonical krysskoblinger beholdes uten omskriving av eldre `sourcePlaceIds`.
- P1-nevneren forblir **936/936**.
- Ingen engangs-workflows ligger igjen i den permanente repository-strukturen.

## Permanente porter

```bash
npm run audit:pors-heritage
node scripts/sync-club-affiliations.mjs
npm run sim:club-squad
npm run audit:attributes
npm run sim:player-attributes
npm run sim:player-weaknesses
node scripts/audit-p1-source-claims.mjs
npm run test:browser
```

`audit:pors-heritage` kjøres fra ordinær `.github/workflows/ci.yml` og låser Pors-populasjonen, stadion-unlocken, krysskoblingene og skillet mellom historikk og simulering.
