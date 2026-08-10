# HistoryGo Football Manager

HistoryGo Football Manager er et selvstendig, mobiltilpasset managerspill koblet til History Go / Civication.

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Spillet er ikke bygget rundt en skjult samlet spillerverdi. `classHeight` beskriver dokumentert karrierenivå og setter et tak for ferdighetsprofilen; kampbidraget avgjøres av hvordan spilleren brukes i posisjon, rolle, taktikk, relasjoner, form og belastning.

## Canonical produktstatus

Den oppdaterte oversikten over hva som faktisk er implementert, hva som er en bevisst produktgrense og hva som fortsatt er åpent, ligger i [`docs/PRODUCT_STATUS.md`](docs/PRODUCT_STATUS.md).

README skal beskrive dagens produkt. Historiske audits og gamle veikart skal ikke brukes som nåstatus. Før en ny hovedfunksjon startes, kontroller:

1. `docs/PRODUCT_STATUS.md`;
2. relevant kode og permanent audit/simulering;
3. nyere commits og merged PR-er.

Det verner mot å bygge en ny versjon av noe som allerede finnes.

## Managerstrukturen

Ligaspillet har fem hovedområder:

```text
Kontor · Lag · Speiding · Kamp · Stats
```

- **Kontor** – kalender med konkrete klubbmailer og klubborganisasjon.
- **Lag** – oppstilling, valgt tropp, trening og systemkunnskap.
- **Speiding** – Min spillerpool og andre klubbers dokumenterte HG-tilknytninger.
- **Kamp** – kampforberedelse, kampdag og etterkampanalyse.
- **Stats** – tabell, terminliste, sesongstatus og spillerstatistikk.

Detaljene og navigasjonsgrensene er låst i [`docs/meny.md`](docs/meny.md) og [`docs/MANAGER_SHELL_V3.md`](docs/MANAGER_SHELL_V3.md).

## Den spillbare læringsløkken

```text
kamp-/klubbsignal
→ analyse av problemet
→ oppstilling, rolle, system eller trening
→ konkret managerhandling
→ kamp
→ forklaring og etterkamp
→ nytt observasjonspunkt
```

Læringen følger **situasjon → handling → konsekvens → forklaring**. Pedagogiske lag kan lese og forklare de eksisterende motorene, men de skal ikke lage parallelle fit-, kamp-, trenings- eller progresjonsscorer.

### Kalender og klubbkommunikasjon

Kontor åpner på managerkalenderen. Mailer fra trenerteam, medisinsk apparat, analyse, styre, garderobe og presse ligger på den faktiske arbeidsdagen og bruker faktisk motstander, kampresultat, treningsvalg, spillerbelastning og lagret kampplan når dette finnes. Å lese en mail flytter aldri Club Week-fasen eller kvitterer ut resten av uka. Se [`docs/MANAGER_CLUB_COMMUNICATION_V2.md`](docs/MANAGER_CLUB_COMMUNICATION_V2.md).

### Spillerpool og tropp

```text
History Go-samling → Min spillerpool → valgt klubbtropp → oppstilling / rolle / trening / kamp
```

History Go- og klubbtilgang avgjør hvem som finnes i spillerpoolen. `squadPlayerIds` i eksisterende `hgfm.teamMerits.v1` avgjør hvem klubben bruker. Profilklikk velger aldri en spiller; inn- og uttak krever eksplisitte handlinger. Se [`docs/MANAGER_RECRUITMENT_V1.md`](docs/MANAGER_RECRUITMENT_V1.md).

### Oppstilling, roller og system

Oppstilling viser valgt ellever først. Spiller- og rollealternativer åpnes i drawer. Rolleinspektøren leser den faktiske elleveren, navngir relevante spillerplasser og forklarer kuraterte relasjoner uten å endre rollefit. Se [`docs/MANAGER_FOOTBALL_LEARNING_LOOP_V1.md`](docs/MANAGER_FOOTBALL_LEARNING_LOOP_V1.md).

### Trening

Ukeplanen består av program, konkrete økter, fokus og individuell oppfølging. Hver økt kan åpnes som et øvelsesverksted der areal, spillerbalanse, retning og touchregel endrer den fotballfaglige forklaringen. Den eksisterende treningsmotoren eier fortsatt belastning og forventet effekt. Se [`docs/MANAGER_TRAINING_EXERCISE_DESIGN_V1.md`](docs/MANAGER_TRAINING_EXERCISE_DESIGN_V1.md).

### Analyse og kampforberedelse

Analyseavdelingen bruker faktisk terminliste, motstanderprofil, formasjonsmatchup, eget system og trening. Manageren lagrer én fixturebundet hypotese, ett motgrep, en risiko og et observasjonspunkt. Planen inngår i kampklarheten og følger lesbart til kampbrief og etterkamp, men gir ingen kampbonus. Se [`docs/MANAGER_CLUB_ORGANIZATION_V1.md`](docs/MANAGER_CLUB_ORGANIZATION_V1.md).

### Medisinsk apparat

Det medisinske beslutningsverkstedet leser eksisterende skade- og belastningsstate og lærer forskjellen mellom ukeestimat og kriteriebasert retur til fotball. Det diagnostiserer ingen skade og endrer ingen save-state. Se [`docs/MANAGER_CLUB_ORGANIZATION_V1.md`](docs/MANAGER_CLUB_ORGANIZATION_V1.md).

### Kamp og etterkamp

Kampmotoren eier resultat, xG, managergrep, spillerbidrag og konsekvenser. Etterkampen samler faktiske taktiske, relasjonelle, treningsmessige og menneskelige signaler og peker dem tilbake mot neste arbeidsuke. Se [`docs/MANAGER_POST_MATCH_ANALYSIS_V1.md`](docs/MANAGER_POST_MATCH_ANALYSIS_V1.md).

## Spillmoduser

`hgfm.modeSessions.v1` isolerer fire aktive snapshots:

- `league` – klubbsesong med divisjoner, terminliste, tabell, kvalifisering og sesongdom;
- `scenario` – kuraterte femkampersutfordringer;
- `national` – landslag og EM/VM;
- `training` – **Fotballvitenskap**, det historiske formasjonsbiblioteket utenfor klubbsaven.

Alle modusene bruker de samme stateless motorene. En sekundær modus kan aldri overskrive ligasaven.

## Bevisste produktgrenser

Følgende er ikke skjulte restoppgaver og skal ikke implementeres uten en egen, vedtatt regel:

- overgangsmarked, overgangssummer, agenter, lønn og kontrakter;
- maksimumsstørrelse, registreringsfrist eller cooldown for klubbtroppen;
- oppdiktede fasilitetsnivåer når klubbdataene ikke beskriver anleggene;
- `overall`-kolonner, nye samleverdier eller pedagogiske bonusmotorer;
- tilfeldige ekte spillere for klubber uten dokumentert spillerpool;
- parallelle «Neste»-systemer ved siden av den autoritative managerflyten.

Manglende regler skal avklares før kode. Manglende kildedata skal vises ærlig, ikke fylles med plausible påstander.

## Arkitektur

Appen er statisk HTML/CSS/ESM uten frontend-rammeverk.

- `src/app.js` binder save-state, legacy-UI og motorresultater.
- `src/football-*.js` inneholder rene eller avgrensede domenemoduler.
- `src/ui/` inneholder managerflatene og pedagogiske presentasjonslag.
- `src/domain/` og `src/engine/` er den TypeScript-baserte managerkjernen.
- `data/` er canonical fotball- og History Go-data.
- `scripts/` inneholder permanente audits og deterministiske simuleringer.
- `tests/browser/` låser spillflyt, mobilvisning og WCAG A/AA.

Den kompilerte TypeScript-motoren ligger i `dist/`. Den ubygde browserdemoen har byte-kompatible ESM-fallbacks. Se [`docs/ENGINE_ARCHITECTURE.md`](docs/ENGINE_ARCHITECTURE.md) og `CLAUDE.md` for motorgrensene.

## Lokal kjøring

Installer avhengigheter og start en statisk server:

```bash
npm ci
python3 -m http.server 8000
```

Åpne `http://localhost:8000`. Direkte åpning av `index.html` kan feile fordi data lastes med `fetch`.

## Verifikasjon

Grunnportene er:

```bash
npm run typecheck
npm run build
npm run stage:pages
npm run audit:pages-artifact
npm run audit:product-status
npm run check:syntax
npm run check:dom-ids
npm run audit:flow
npm run audit:dead-ends
npm run test:browser
```

GitHub Actions kjører i tillegg alle registrerte dataaudits, manageraudits og motor-/flytsimuleringer før merge. Push til `main` bygger og deployer `_site` til GitHub Pages.

## Arbeidsregel

Nye funksjoner skal:

1. gjenbruke eksisterende state og motorer;
2. ha én tydelig produktinngang;
3. få permanent audit/simulering og relevant browservern;
4. være bakoverkompatible med eksisterende saves;
5. fullføres gjennom grønn CI, squash-merge, Pages-verifikasjon og branch-opprydding.
