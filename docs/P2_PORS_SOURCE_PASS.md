# P2 · Pors

Pors er første merge-enhet i P2-katalogpasset for 2. divisjon.

## Canonical nevner

- 63 kildebårne Pors-profiler i klubbpoolen.
- 58 nye canonical spillerprofiler.
- 5 verifiserte krysskoblinger til eksisterende profiler: Einar Rossbach, Fredrik Nordkvelle, Erik Pedersen, Tor Arne Sannerholt og Christer Fjellstad.
- Klubbmedlemskap materialiseres i `clubAffiliations`; en krysskobling får ikke omskrevet eldre `sourcePlaceIds` bare for å bli medlem av Pors. Dermed forblir den frosne P1-nevneren uendret.

## Kildekontrakt

Primærkilden er Pors' egen klubbhistorie (`https://porsfotball.no/historie`). Utvalget dekker eksplisitt navngitte A-lagsspillere, 1969-opprykkslaget, det ubeseirede opprykkslaget fra 1988 og opprykksstallen fra 2003. Juniornavn uten eksplisitt seniorbelegg importeres ikke.

Spillerposisjon legges bare inn når den kan belegges. Profiler uten belagt posisjon får ingen konstruerte posisjonsdata, individuelle styrker eller posisjonsavledede svakheter. Svakhetsvakten krever derfor null avledede svakheter for uløst posisjon, men fortsatt minst én for alle posisjonsavklarte profiler.

De 58 nye eksklusive Pors-profilene står 58/58 uten dokumenterte ferdighetsclaims. `pors_stadion` er derfor eksplisitt registrert som 100 % `THIN-SOURCE` i representativitetsvakten. Det er en ratchet for kildegjeld, ikke tillatelse til å modellere egenskaper: tallet skal bare kunne synke når individuelle ferdighetskilder faktisk dokumenteres.

## Identitetsavgjørelser

Einar «Jeja» Gundersen og Einar «Jeisen» Gundersen er to forskjellige personer og står som permanent gjennomgått navnepar. Pors-sidens «Tore Arne Sannerholt» er verifisert som canonical Tor Arne Sannerholt og krysskobles i stedet for å bli en ny profil.

## Regresjonskrav

Pors-passet skal ikke endre P1: `audit-p1-source-claims.mjs` skal fortsatt treffe 936/936 eksklusive profiler og den låste statusfordelingen 45 DOKUMENTERT · 15 DELVIS · 876 THIN-SOURCE.

## Spillbarhetsgrense

De 63 Pors-navnene er én dokumentert historikkatalog, men ikke én automatisk spillbar tropp.

- **16** profiler har dokumentert posisjon og er spillbare.
- **47** profiler uten dokumentert posisjon beholdes som historikkposter.
- `pors_stadion` åpner bare de 16 spillbare profilene.
- Stadionbesøket konstruerer aldri posisjoner, roller, styrker eller taktisk fit.
- Senere kildebelegg kan flytte en eksisterende historikkpost inn i den spillbare poolen uten ny identitet.

`audit:club-heritage` låser 63/16/47-grensen, de fem krysskoblingene, P1-nevneren og stadion-unlocken. Vakten er felles for alle P2-arver: forventningene ligger som én rad i tabellen øverst i `scripts/audit-club-heritage.mjs`, slik at en skjerpelse av regelen treffer alle klubbene samtidig.

---

## Supplering 24.08.2026 — NFFs 2026-tropp

Arven over ble lest ut av klubbens egen historikk, og den er uendret. Dette er
et lag oppå: **26 navn fra NFFs lagside** (`fiksId=82`, hentet 24.08.2026), ført
inn med `import-club-heritage --suppler`. Kilden er et *register*, ikke en
fortelling — den gir hvem som spiller nå, gruppert etter lagdel, og ingenting om
hvem de er.

| | Før | Etter |
|---|---:|---:|
| Dokumenterte | 63 | **89** |
| Spillbare | 16 | **42** |
| Historikkposter | 47 | **47** |

Historikkpostene står stille, og det er poenget: en supplering legger til, den
skriver ikke om. De 26 fordeler seg på 2 keepere, 10 forsvar, 7 midtbane,
6 angrep og **én krysskobling** — Redon Pllana sto i katalogen fra før og fikk
klubbtilknytningen i stedet for en ny identitet.

23 av de 42 spillbare bærer `positionSource: "gruppe"`. Lagsida oppgir lagdel,
ikke posisjon, og oppløsningen står i dataene i stedet for å bli gjettet bort.
Se `docs/P2_IMPORT_V1.md` § «Lagdel som posisjon».

`audit:club-heritage` er oppdatert til 89/42/47, og `audit:import-club-heritage`
bygger arven opp igjen fra katalogen med alle seks krysskoblingene.
