# Pors · endelig repo-verifisering

## Leveranser

- PR #211 materialiserte 63 dokumenterte Pors-koblinger og ble squash-merget som `ef1bfd579f684ff6a0e2fc19b3fc8f8a97d3b64a`.
- PR #212 rettet troppshydreringen og ble squash-merget som `e28988aff32f6d4720f80bb905542fed3170b4dc`; full CI passerte 146/146 nettlesertester.
- Denne leveransen lukker reviewpunktet om posisjonsløse profiler ved å skille historikkatalogen fra den spillbare poolen.

## Låst kontrakt

- 63 dokumenterte Pors-profiler.
- 16 profiler med dokumentert posisjon og simuleringstilgang.
- 47 historikkposter uten konstruert posisjon, rolle eller taktisk fit.
- `pors_stadion` åpner 16 spillerkandidater, ikke 63.
- Fem canonical krysskoblinger beholdes uten omskriving av eldre `sourcePlaceIds`.
- P1-nevneren forblir 936/936.

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
