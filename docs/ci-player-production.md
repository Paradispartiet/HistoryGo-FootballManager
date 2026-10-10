# Kontrollnivåer for kildebelagt spillerproduksjon

Kildematerialet vurderes med samme krav som før. Vi sparer kun unødvendig
fullregresjon ved endringer i dokumenterte enkeltspilleres `strengths`.

## Nivå 1 – hver spiller/PR (obligatorisk)

Når **kun oppføringene inne i** `documented`-registeret i
`src/football-player-source-claims-depth.js` er endret:

- `audit:source-depth-claims`: kilde, sitat, gyldig styrketoken, identitet,
  kildebelagt klubbtilknytning, P1/P2-eierskap og at ingen andre felt endres.
- `audit:p2-source-claims`: full overlay-presedens og eksisterende dekningskrav.
- `audit:attributes`: attributtkontrakten.
- `audit-eliteserien-player-strength-coverage.mjs --check`: effektiv dekning
  etter alle kildeoverlayene.

## Nivå 2 – produksjonsgruppe

En PR som legger til **minst fem nye spiller-ID-er** i samme kilde-register,
får i tillegg `sim:player-attributes`, `sim:club-squad` og `sim:mini-season`.

Arbeidsform: registrer gjerne fem til ti nye spillere i samme PR i stedet for én
PR per spiller. Endring av gamle poster alene utløser ikke gruppetesten.

## Nivå 3 – full regresjon

Ved endringer utenfor registeroppføringene (blant annet motor, posisjoner,
spillflyt, tester, bygg og CI), eller på manuell/ukentlig kjøring:

- Alle audit- og simuleringsskripter, TypeScript og Pages-artifakt.
- Playwright-nettlesersuiten.
- Helsesongsimuleringene når endrede filer treffer den separate
  helsesong-workflowen; alle fire grupper på ukentlig/manuell kjøring.

**Sikker avgrensning:** `scripts/classify-player-ci.mjs` sammenligner PR
mot basiscommit. Den krever at bare kilde-registerfilen er endret, og at både
filens topp (inkludert versjon) og funksjonene under registeret er identiske.
Ved ukjent struktur, manglende Git-data eller andre filer velges full CI.

CI kjøres på PR, **ikke på hver branch-push i tillegg**. Pages-verifisering på
PR utelates for endringer som bare treffer kilde-registerfilen; publisering
etter merge til `main` skjer som før. Fire fulle helsesonger kjøres ikke lenger
automatisk på hver merge til `main`; de er tilgjengelige ved kode-PR, manuell
kjøring og ukentlig regresjon.

Dette er en CI-rutingsendring, ikke en endring i spillets eller kildenes logikk.
